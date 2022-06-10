/**
 * Simple module for representing tables as Entity objects with CRUD methods.
 *
 * Each Entity represents a single table (not a row, that is, an Entity is a
 * table data gateway) which is assumed to have an autogenenerated 'id' column.
 *
 * An Entity offers the following CRUD methods ('get', 'find', and 'read' being
 * the read methods):
 *
 *   create: inserts a new object
 *   get:    retrieves a single object, throws error if not found
 *   find:   looks for a single object, returns undefined if not found
 *   read:   select objects
 *   update: updates an existing object
 *   remove: removes an object
 *
 * All methods return a promise of the object(s) being manipulated and database
 * errors are propagated.
 * 
 * Usage:
 *
 *   const db = require('mysqlq'),
 *       entity = require('entity');
 *
 *   const persons = entity(db, {
 *       name: 'persons', tableName: 'person', columns: ['first_name', 'last_name']
 *   });
 *
 *   person.create({first_name: 'Homer', last_name: 'Simpson'}).then(
 *     function (person) {
 *       // person.id will contain autogenerated id
 *     },
 *     function (err) {
 *       // ...
 *     });
 *
 *   persons.read({first_name: 'Homer'}).then(
 *     function (persons) {
 *       // persons contains the array of JS objects, one for each row
 *     });
 */
const clone = require('clone');

function dbEscape(name) { return '`' + name + '`'; }

/**
 * Simple class providing the CRUD services for a single table.
 *
 * The config contains:
 *
 *   name: Name of the entity
 *   tableName: optional name of the underlying table, falls back to name
 *   columns: list of columns (see below)
 *   naturalKey: optional name of the natural key column
 *
 * A column is either just the column name or an object with a
 * 'name' property and the following optional properties:
 *
 * - queryOp: specifies the default comparison operation (see see the
 *            sqlTerm method below).
 * - type: an object containing
 *      fromDb: (optional) converts from db value to javascript value
 *      toDb:   (optional) converts from javascript value to db value
 */
function Entity(db, config) {
  const self = this;
  this.db = db;
  this.name = config.name;
  this.table = dbEscape(config.tableName || config.name);
  this.naturalKey = config.naturalKey;
  this.columnsByName = {};
  this.columns = [];

  function addColumn(column) {
    const col = typeof(column) === 'object' ? column : {name: column};
    self.columns.push(col);
    self.columnsByName[col.name] = col;
  }
  config.columns.map(addColumn);
  addColumn('id');
  this.fromDb = createFromDb(this);
  this.toDb = createToDb(this);
}

function capitalizeFirst(s) {
  return s.charAt(0).toUpperCase() + s.substr(1);
}

function identity(x) {
  return x;
}

/**
 * Returns the function that is applied to the objects fetched from the
 * database.
 *
 * For the most part, the javascript objects can be returned unchanged, but
 * there are exceptions. For example, boolean columns are implemented as
 * tinyint(1) by mysql and therefore returned as javascript integers.
 *
 * The returned function takes the row and an optional `tableOnly` parameter
 * and returns the object corresponding to the row.
 *
 * The returned function applies the fromDb functions defined in any
 * column types of the entity to the corresponding column values.
 *
 * If `tableOnly` is true, only the properties corresponding to table columns
 * are copied to the result. This is useful when constructing objects from the
 * result of database joins where the rows returned from the database contain
 * the properties of multiple objects.
 */
function createFromDb(entity) {
  return (row, tableOnly) => {
    if (row === undefined) {
      return row;
    }
    if (tableOnly) {
      const result = {};
      for (const {name, domain} of entity.columns) {
        const fromDb = domain ? domain.fromDb : undefined;
        const value = row[name];
        result[name] = fromDb ? fromDb(value) : value;
      }
      return result;
    } else {
      const result = {...row};
      for (const {name, domain} of entity.columns) {
        const fromDb = domain ? domain.fromDb : undefined;
        if (fromDb) {
          result[name] = fromDb(result[name]);
        }
      }
      return result;
    }
  };
}

/**
 * Returns the function that is applied to objects before storing the
 * in the database.
 */
function createToDb(entity) {
  const toDbColumns =
    entity.columns.filter(column => column.domain && column.domain.toDb);
  if (toDbColumns.length === 0) {
    return identity;
  }
  return function(data) {
    if (data !== undefined) {
      toDbColumns.forEach(function(column) {
        data[column.name] = column.domain.toDb(data[column.name]);
      });
    }
    return data;
  }
}

/**
 * Returns the promise of saving a new object in the table.
 */
Entity.prototype.create = function(obj) {
  const self = this;
  const dbObj = self.toDb(obj);
  const columns = [];
  const placeholders = [];
  const params = [];

  self.columns.forEach(function (column) {
    const value = dbObj[column.name];
    if (value !== undefined) {
      columns.push(column.name);
      placeholders.push('?');
      params.push(value);
    }
  });
  const sql = 'insert into ' + self.table +
    ' (' + columns.join(', ') + ') values (' + placeholders.join(', ') + ')';
  return self.db.query(sql, params).then(function (data) {
    // node-mysql returns the auto increment primary key in the 'insertId' field.
    obj.id = data[0].insertId;
    return obj;
  });
};

/**
 * Creates a SQL term (comparison in a where clause) for a single field.
 *
 * If the 'value' is an object, it contains two properties: 'value' and 'op'. The
 * 'op' property specifies the comparison operation.
 *
 * The supported operations are currencly 'contains', 'startswith', 'endswith',
 * and 'equals'.
 *
 * @param field Name of the field (or, equivalently, database table column) to compare
 * @param value Value to compare to or object with 'value' and 'op' properties
 */
Entity.prototype.sqlTerm = function(field, value) {
  const column = this.columnsByName[field];
  if (column === undefined) {
    return undefined;
  }
  const op = (column && column.queryOp) || 'equals';

  if (typeof(value) === 'object') {
    op = value.op;
    value = value.value;
  }

  if (op === 'contains') {
    return {field: field, op: 'like', value: '%' + value + '%'};
  } else if (op === 'startswith') {
    return {field: field, op: 'like', value: value + '%'};
  } else if (op === 'endswith') {
    return {field: field, op: 'like', value: '%' + value};
  } else {
    return {field: field, op: '=', value: value};
  }
};

/**
 * Translates a query to an array of terms.
 */
Entity.prototype.sqlTerms = function(query) {
  const terms = [];
  if (query !== undefined) {
    if (typeof(query) !== 'object') {
      const value = query;
      query = {};
      query[this.naturalKey || 'id'] = value;
    }
    for (const [name, value] of Object.entries(query)) {
      const term = this.sqlTerm(name, value);
      if (term) {
        terms.push(term);
      }
    }
  }
  return terms;
};

/**
 * Constructs the where clause and parameter array for the query.
 */
Entity.prototype.sqlWhere = function(query, op, prefix) {
  op = op === undefined ? 'and' : op;
  prefix = prefix === undefined ? '' : prefix;
  const terms = this.sqlTerms(query);
  let sql = '';
  const params = [];
  if (terms.length !== 0) {
    sql += ' where ';
    terms.forEach(function (clause, index) {
      if (index > 0) sql += ' ' + op + ' ';
      sql += prefix + clause.field + ' ' + clause.op + ' ?';
      params.push(clause.value);
    });
  }
  return {sql: sql, params: params};
};

/**
 * Returns the promise of a single object (row) identified by the query or
 * undefined if not found.
 */
Entity.prototype.find = function (query) {
  const self = this;
  const whereClause = this.sqlWhere(query);
  const sql = 'select * from ' + this.table + whereClause.sql;
  return this.db.selectRow(sql, whereClause.params).then(self.fromDb);
};

/**
 * Returns the promise of a single object (row) identified by the query.
 */
Entity.prototype.get = function (query) {
  const self = this;
  return self.constructor.prototype.find.call(self, query).then(function (data) {
    if (data === undefined) {
      throw { httpStatusCode: 400, code: 'ENTITY_NOT_FOUND' };
    }
    return data;
  });
};

/**
 * Returns the promise of the objects (rows) identified by the query.
 */
Entity.prototype.read = function (query, op, limit) {
  const self = this;
  const whereClause = this.sqlWhere(query, op);
  const sql = 'select * from ' + this.table + whereClause.sql;
  return this.db.selectRows(sql, whereClause.params, limit, query._order).then(
      function(data) {
        if (data.rows) {
          data.rows = data.rows.map(self.fromDb);
        }
        return data;
      });
};

/**
 * Returns the promise of updating an existing object. The object (that
 * is, its id) must already exist in the table.
 */
Entity.prototype.update = function (obj) {
  const self = this;
  const dbObj = self.toDb(obj);
  const params = [];
  let sql = '';
  self.columns.forEach(function (column) {
    const value = dbObj[column.name];
    if (value !== undefined) {
      if (sql.length > 0) sql += ', ';
      sql += column.name + ' = ?';
      params.push(value);
    }
  });
  sql = 'update ' + self.table + ' set ' + sql + ' where id = ?';
  params.push(obj.id);
  return self.db.query(sql, params);
};

/**
 * Returns the promise of deleting an object identified by id.
 */
Entity.prototype.remove = function (id) {
  const keyCol = this.naturalKey || 'id';
  return this.db.query('delete from ' + this.table + ' where ' + keyCol + ' = ?', id);
};

/**
 * Return frontend field descriptions for the Entity component.
 */
Entity.prototype.fields = function () {
  return this.columns
    // Remove id field, since it is used internally only.
    .filter(field => field.name != 'id')
    // Remove all internal fields.
    .filter(field => field.internal !== true)
    .map(origField => {
      const field = clone(origField);
      // Remove domain converters, since they are functions that cannot be serialized anyways.
      if ('domain' in field) {
        delete field.domain.fromDb;
      }
      return field;
    });
};

const entity = function (db, config) {
  return new Entity(db, config);
};

/**
 * Returns the `value` as an ISO string representation of a datetime without fractional
 * seconds and timezone, for example, `2020-08-15T10:30:30`.
 *
 * We use UTC as the mysql timezone (as default timezone on the server and connections).
 * This implies that `datetime` strings are interpreted as UTC when reading and writing
 * to the database.
 */
function dateToIsoStringWithoutTimeZone(value) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().replace(/\.[0-9]*Z/, '');
}

entity.dateToIsoStringWithoutTimeZone = dateToIsoStringWithoutTimeZone;

/**
 * Predefined column domains (restricted types).
 *
 * These domains can be used as values for the 'domain' property of a column.
 */
entity.domains = {
  'Boolean': {
    name: 'Boolean',
    type: 'boolean',
    fromDb: function(dbValue) {
      return dbValue === 1;
    }
  },
  'Integer': {
    name: 'Integer',
    type: 'int'
  },
  'Datetime': {
    name: 'Datetime',
    type: 'datetime',
    toDb: dateToIsoStringWithoutTimeZone,
  },
}

module.exports = entity;

