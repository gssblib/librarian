
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from './user';
import { Injectable } from '@angular/core';
import { UsersService } from './users.service';

@Injectable()
export class UserResolverService  {
  constructor(private usersService: UsersService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
    const id = route.params['id'];
    return this.usersService.get(id);
  }
}
