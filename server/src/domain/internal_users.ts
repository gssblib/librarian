import { BaseEntity } from '../common/base_entity';
import { EnumColumnDomain } from '../common/column';
import { Db } from '../common/db';
import { ExpressApp, HttpMethod } from '../common/express_app';
import { EntityTable } from '../common/table';
import { saltedHash } from './login';

type InternalUserRole = 'clerk'|'librarian'|'printer';

export interface InternalUser {
  /** Auto-generated id. */
  id: number;

  /** User's login/username. */
  username: string;

  /** Hashed password. */
  hashed_password?: string;

  /** Number of failed login attempts */
  failed_login_attempts: number;

  /** List of roles - only one supported for now. */
  roles: string;
}

const InternalUserRoleDomain = new EnumColumnDomain<InternalUserRole>([
  'clerk',
  'librarian',
  'printer',
]);

export class InternalUserTable extends EntityTable<InternalUser> {
  constructor() {
    super({
      name: 'users',
    });
    this.addColumn({
      name: 'id'
    });
    this.addColumn({
      name: 'username',
      label: 'Username',
      queryOp: 'contains',
      required: true,
    });
    this.addColumn({
      name: 'hashed_password',
      label: 'Password',
    });
    this.addColumn({
      name: 'failed_login_attempts',
      label: 'Failed Login Attempts',
      required: true,
    });
    // Support single role only for now.
    this.addColumn({
      name: 'roles',
      label: 'Roles',
      required: true,
      domain: InternalUserRoleDomain,
    });
  }
}

export const usersTable = new InternalUserTable();

export class InternalUsers extends BaseEntity<InternalUser> {
  constructor(db: Db) {
    super(db, usersTable);
  }

  protected toKeyFields(key: string): Partial<InternalUser> {
    return {id: parseInt(key, 10)};
  }

  override async get(key: string): Promise<InternalUser> {
    const user = await super.get(key)
    user.hashed_password = undefined;
    return user;
  }

  override create(obj: InternalUser): Promise<InternalUser> {
    // Assume the password has not been hashed, so let's do that now.
    if (obj.hashed_password) {
      obj.hashed_password = saltedHash(obj.hashed_password)
    }
    return this.table.create(this.db, obj);
  }

  override update(obj: Partial<InternalUser>): Promise<InternalUser|undefined> {
    if (!obj.hashed_password) {
      obj.hashed_password = undefined;
    } else {
      obj.hashed_password = saltedHash(obj.hashed_password)
    }
    return super.update(obj);
  }

}
