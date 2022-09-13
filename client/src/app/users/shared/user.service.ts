import { Injectable } from '@angular/core';
import { RpcService } from "../../core/rpc.service";
import { User } from './user';
import { UsersService } from "./users.service";
import { ModelService } from "../../core/model.service";
import { Observable } from "rxjs";

/**
 * Manages the single user whose information is shown in the user views.
 *
 * All user views watch the observable in this service, and changes to the user
 * (reloading the data from the server) are published to this service.
 */
@Injectable()
export class UserService extends ModelService<User> {

  constructor(private rpc: RpcService, private usersService: UsersService) {
    super(usersService);
  }

}
