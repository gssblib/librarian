import config from 'config';
import mysql from 'mysql2/promise';
import {Db} from '../common/db';
import {ExpressApp} from '../common/express_app';
import {Borrowers} from './borrowers';
import {Checkouts, History} from './checkouts';
import {Items} from './items';
import {InternalUsers} from './internal_users';
import {OrderCycles, Orders} from './orders';

export const pool = mysql.createPool(config.get('db'));

export const db = new Db(pool);

export const borrowers = new Borrowers(db);
export const items = new Items(db);
export const checkouts = new Checkouts(db);
export const history = new History(db);
export const orderCycles = new OrderCycles(db);
export const orders = new Orders(db);
export const users = new InternalUsers(db);


export function initRoutes(application: ExpressApp): void {
  items.initRoutes(application);
  borrowers.initRoutes(application);
  checkouts.initRoutes(application);
  history.initRoutes(application);
  orderCycles.initRoutes(application);
  orders.initRoutes(application);
  users.initRoutes(application);
}
