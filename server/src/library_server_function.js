/**
 * HTTP server for the GSSB library system.
 *
 * This server serves can be used by Firebase Cloud Functions.
 *
 * The AJAX requests are translated to calls to the library service
 * (defined in library.js).
 */

const config = require('config'),
      express = require('express'),
      Q = require('q'),
      mysqlq = require('../lib/mysqlq'),
      api_prefix = '/api',
      db = mysqlq(require('mysql').createPool(config.get('db'))),
      library = require('./library').create(db),
      auth = require('./auth')(db),
      server = express(),
      httpcall = require('./httpcall')(server, api_prefix, auth),
      jwt = require('jsonwebtoken'),
      expressJwt = require('express-jwt'),
      multer = require('multer');

server.use(require('body-parser').json());
server.use(require('cookie-parser')(config.get('auth').cookie));

// Middleware that authentication JWT requests.
server.use(expressJwt(
    {secret: config['jwt']['secret'], credentialsRequired: false}));

httpcall.handlePaths([
  {
    post: '/authenticate',
    fn: function(call)  {
      var login = call.req.body;
      return auth.authenticate(login)
          .then(function (auth) {
            if (auth && auth.authenticated) {
              // authentication successful
              var payload = auth.user;
              var token = jwt.sign(payload, config['jwt']['secret']);
              payload.token = token;
              call.res.send(payload);
            } else {
              // authentication failed
              call.res.status(400).send(auth);
            }
          },
          function(err) {
            console.log('1', err);
            call.res.status(400).send({
              authenticated: false,
              message: 'INTERNAL_ERROR',
              error: err.toString()
            });
          })
          .catch(function (err) {
            console.log('2', err);
            call.res.status(400).send({
              authenticated: false,
              message: 'INTERNAL_ERROR',
              error: err.toString()
            });
          });
    },
  },
  {
    get: '/fees',
    fn: call => library.getFees(call.req.query, call.limit()),
    action: {resource: 'fees', operation: 'read'},
  },
  {
    get: '/borrowers/fees',
    fn: function (call) {
      return library.borrowers.allFees();
    },
    action: {resource: 'fees', operation: 'read'},
  },
  {
    get: '/borrowers/:id/history',
    fn: call => library.borrowers.history(call.param('id'), false, call.limit(), call.req.query._order),
    action: {resource: 'borrowers', operation: 'read'},
  },
  {
    post: '/history/:id/payFee',
    fn: function (call) {
      return library.history.payFee(call.param('id'));
    },
    action: {resource: 'borrowers', operation: 'payFees'}
  },
  {
    post: '/checkouts/:barcode/payFee',
    fn: function (call) {
      return library.checkouts.payFee(call.param('barcode'));
    },
    action: {resource: 'borrowers', operation: 'payFees'}
  },
  {
    post: '/checkouts/updateFees',
    fn: function (call) {
      return library.checkouts.updateFees(call.req.body.date);
    },
    action: {resource: 'checkouts', operation: 'update'}
  },
  {
    get: '/reports/itemUsage',
    fn: function (call) {
        return library.reports.getItemUsage(call.req.query);
    },
    action: {resource: 'reports', operation: 'read'},
  },
  {
    get: '/reports/overdue',
    fn: function (call) {
        return library.reports.getOverdue(call.req.query);
    },
    action: {resource: 'reports', operation: 'read'},
  },
  {
    get: '/items/:key/cover',
    fn: function (call) {
      var img_url = config['resources']['coversUrl'] + call.param('key') + '.jpg';
      call.res.redirect(img_url);
    },
  },
  {
    get: '/me',
    fn: call => {
      return library.borrowers.get(call.req.user.id, {items: true, fees: true, order: true});
    },
    action: {resource: 'profile', operation: 'read'},
  },
  {
    delete: '/orders/:id/items/:itemId',
    fn: function (call) {
      return library.orders.removeItem(call.param('id'), call.param('itemId'));
    },
    action: {resource: 'orders', operation: 'update'},
  },
  {
    delete: '/borrowers/:borrower/orders/:order/items/:item',
    fn: function (call) {
      return library.borrowers
        .removeOrderItem(call.param('borrower'), call.param('order'), call.param('item'));
    },
    action: {resource: 'items', operation: 'order'},
  },
]);

httpcall.handleEntity(library.items, ['checkout', 'checkin', 'renew', 'order']);
httpcall.handleEntity(library.borrowers, ['payFees', 'renewAllItems']);
httpcall.handleEntity(library.orderCycles, []);
httpcall.handleEntity(library.orders, []);

exports.server = server
