import {BaseEntity} from '../common/base_entity';
import {EnumColumnDomain} from '../common/column';
import {Db} from '../common/db';
import {Flags} from '../common/entity';
import {httpError} from '../common/error';
import {ExpressApp, HttpMethod} from '../common/express_app';
import {SqlQuery} from '../common/sql';
import {EntityConfig, EntityTable} from '../common/table';
import {addDays} from '../common/util';
import {Borrower, borrowersTable} from './borrowers';
import {Checkout, checkoutsTable, historyTable} from './checkouts';
import {OrderItem, orderItemsTable} from './orders';

const borrowDays = 28;

const ItemState = new EnumColumnDomain([
  'CIRCULATING',
  'STORED',
  'DELETED',
  'LOST',
  'IN_REPAIR',
]);

const ItemDescription = new EnumColumnDomain([
  'Buch',
  'CD',
  'DVD',
  'Comic',
  'Multimedia',
  'Zeitschrift',
]);

const ItemSubject = new EnumColumnDomain([
  'Bilderbuch B - gelb',
  'CD',
  'Comic C - orange',
  'DVD',
  'Erzaehlung E - dunkelgruen',
  'Fasching',
  'Halloween',
  'Klassik',
  'Leseleiter LL - klar',
  'Maerchen Mae - rot',
  'Multimedia MM - rosa',
  'Musik',
  'Ostern',
  'Sachkunde S - blau',
  'Sachkunde Serie - hellblau',
  'St. Martin',
  'Teen T - hellgruen',
  'Uebergroesse - lila',
  'Weihnachten',
  'Zeitschrift',
]);

const ItemAge = new EnumColumnDomain([
  'All Ages',
  'K-1',
  'K-2',
  'T-12',
  'T-17',
  'Leseleiter-1A',
  'Leseleiter-1B',
  'Leseleiter-1C',
  'Leseleiter-2',
  'Leseleiter-3',
  'Leseleiter-4',
  'Leseleiter-5',
  'Leseleiter-6',
  'Leseleiter-7',
  'Leseleiter-8',
  'Leseleiter-9',
  'Leseleiter-10',
]);

type ItemAvailability = 'CHECKED_OUT'|'ORDERED'|'AVAILABLE';

export interface Item {
  id?: number;
  barcode: string;
  category: string;
  title: string;
  author: string;
  subject: string;
  publicationyear: number;
  publisher: string;
  age: string;
  serial: string;
  seriestitle: string;
  classification: string;
  itemnotes: string;
  replacementprice: number;
  state: string;
  isbn10: string;
  isbn13: string;
  antolin: boolean;
  has_cover_image: boolean;
  added: string;
  availability?: ItemAvailability;
}

export interface ExtendedItem extends Item {
  /** Current check-out of this item (if any). */
  checkout?: Checkout;

  /** Current order of this item (if any). */
  order_item?: OrderItem;

  /** Borrower who checked out or ordered this item. */
  borrower?: Borrower;

  /** History of check-outs. */
  history?: Checkout[];
}

const config: EntityConfig<Item> = {
  name: 'items',
  columns: [
    {name: 'id'},
    {name: 'barcode', required: true},
    {name: 'category', required: true, domain: ItemDescription},
    {name: 'title', required: true, queryOp: 'contains'},
    {name: 'author', queryOp: 'contains'},
    {name: 'subject', required: true, domain: ItemSubject},
    {name: 'publicationyear', label: 'Publication year'},
    {name: 'publisher'},
    {name: 'age', label: 'Reading age', domain: ItemAge},
    {name: 'serial', label: 'Number in series'},
    {name: 'seriestitle', label: 'Series title'},
    {name: 'classification'},
    {name: 'itemnotes', label: 'Notes'},
    {name: 'replacementprice', label: 'Replacement price'},
    {name: 'state', required: true, domain: ItemState},
    {name: 'isbn10', label: 'ISBN-10'},
    {name: 'isbn13', label: 'ISBN-13'},
    {name: 'antolin', label: 'Antolin book ID'},
    {name: 'has_cover_image', internal: true},
    {name: 'added', label: 'Date added', internal: true},
  ],
};

export const itemsTable = new EntityTable<Item>(config);

function getItemAvailability(item: ExtendedItem): ItemAvailability {
  if (item.checkout) {
    return 'CHECKED_OUT';
  } else if (item.order_item) {
    return 'ORDERED';
  } else {
    return 'AVAILABLE';
  }
}

type ItemFlag = 'history';
type ItemFlags = Flags<ItemFlag>;

export class Items extends BaseEntity<Item, ItemFlag> {
  constructor(db: Db) {
    super(db, itemsTable);
  }

  protected toKeyFields(key: string): Partial<Item> {
    return {barcode: key};
  }

  async getHistory(barcode: string): Promise<Checkout[]> {
    const sql = `
          select h.*, b.* from issue_history h, borrowers b
          where h.barcode = ? and h.borrowernumber = b.borrowernumber
        `;
    const query: SqlQuery = {
      sql,
      params: [barcode],
    };
    const result = await this.db.selectRows(query);
    return result.rows.map(row => checkoutsTable.fromDb(row));
  }

  override async get(barcode: string, flags: ItemFlags = {}):
      Promise<ExtendedItem> {
    const sql = `
        select o.*, o.id as checkout_id, oi.*, oi.id as order_item_id, i.*
        from items i
        left join \`out\` o on o.barcode = i.barcode
        left join order_items oi on oi.item_id = i.id
        where i.barcode = ?
      `;
    const row = await this.db.selectRow(sql, [barcode]);
    if (!row) {
      throw httpError({
        code: 'ENTITY_NOT_FOUND',
        message: `item ${barcode} not found`,
        httpStatusCode: 404,
      });
    }
    const item: ExtendedItem = this.table.fromDb(row);
    if (row.checkout_id) {
      item.checkout = checkoutsTable.fromDb(row);
      item.checkout.id = row['checkout_id'];
    }
    if (row.order_item_id) {
      item.order_item = orderItemsTable.fromDb(row);
      item.order_item.id = row['order_item_id'];
    }
    item.availability = getItemAvailability(item);
    if (item.checkout) {
      const sql = `select * from borrowers where borrowernumber = ?`;
      const borrowerRow =
          await this.db.selectRow(sql, [item.checkout.borrowernumber]);
      if (borrowerRow) {
        item.borrower = borrowersTable.fromDb(borrowerRow);
      }
    }
    if (item.order_item) {
      const sql = `
          select o.*, b.*
          from orders o join borrowers b on o.borrower_id = b.id
          where o.id = ?
        `;
      const borrowerRow =
          await this.db.selectRow(sql, [item.order_item.order_id]);
      if (borrowerRow) {
        item.borrower = borrowersTable.fromDb(borrowerRow);
      }
    }
    if (flags?.history) {
      item.history = await this.getHistory(barcode);
    }
    return item;
  }

  async checkout(barcode: string, borrowernumber: number):
      Promise<CheckoutResult> {
    const [item, borrower] = await Promise.all([
      this.get(barcode),
      borrowersTable.find(this.db, {fields: {borrowernumber}}),
    ]);
    if (!borrower) {
      throw httpError({
        code: 'BORROWER_NOT_FOUND',
        message: `borrower ${borrowernumber} not found`,
        httpStatusCode: 404,
      });
    }
    if (item?.checkout) {
      throw httpError({
        code: 'ITEM_ALREADY_CHECKED_OUT',
        message: `item ${barcode} already checked out`,
      });
    }
    if (item.state !== 'CIRCULATING') {
      throw httpError({
        code: 'ITEM_NOT_CIRCULATING',
        message: `item ${barcode} is ${item.state}`,
      });
    }
    let checkout = createCheckout(barcode, borrowernumber);
    checkout = await checkoutsTable.create(this.db, checkout);
    return {item, borrower, checkout};
  }

  async checkin(barcode: string): Promise<ExtendedItem> {
    const item = await this.get(barcode);
    const checkout = item.checkout;
    if (!checkout) {
      throw httpError({
        code: `ITEM_NOT_CHECKED_OUT`,
      });
    }
    const checkoutId = checkout.id!;
    delete checkout.id;
    checkout.returndate = new Date();
    await historyTable.create(this.db, checkout);
    await checkoutsTable.remove(this.db, checkoutId);
    return item;
  }

  initRoutes(application: ExpressApp): void {
    application.addHandler({
      method: HttpMethod.POST,
      path: `${this.keyPath}/checkout`,
      handle: async (req, res) => {
        const barcode = req.params['key'];
        const borrowernumber = parseInt(req.body.borrower, 10);
        const result = await this.checkout(barcode, borrowernumber);
        res.send(result);
      },
    });
    application.addHandler({
      method: HttpMethod.POST,
      path: `${this.keyPath}/checkin`,
      handle: async (req, res) => {
        const barcode = req.params['key'];
        const result = await this.checkin(barcode);
        res.send(result);
      },
    });
    super.initRoutes(application);
  }
}

function createCheckout(barcode: string, borrowernumber: number): Checkout {
  const checkoutDate = new Date();
  const dueDate = addDays(checkoutDate, borrowDays);
  return {
    barcode,
    borrowernumber,
    checkout_date: checkoutDate,
    date_due: dueDate,
    fine_due: 0,
    fine_paid: 0,
  };
}

export interface CheckoutResult {
  item: Item;
  borrower: Borrower;
  checkout: Checkout;
}