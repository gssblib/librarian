import { Injectable } from '@angular/core';
import { RpcService } from '../../core/rpc.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './user';
import { FormService } from '../../core/form.service';
import { TableFetchResult } from '../../core/table-fetcher';

import { DateService } from "../../core/date-service";
import { ModelsService } from "../../core/models.service";


/**
 * User functions talking to the server.
 */
@Injectable()
export class UsersService extends ModelsService<User> {

  constructor(rpc: RpcService, formService: FormService) {
    super('users', user => user.id, rpc, formService);
  }

  newUser(): User {
    const user = new User();
    user.roles = [];
    user.failed_login_attempts = 0;
    return user;
  }

  toModel(row: any): User {
    const user = Object.assign(new User(), row);
    return user;
  }

}
