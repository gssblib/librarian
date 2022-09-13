import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserAddPageComponent } from "./user-add-page/user-add-page.component";
import { UserListPageComponent } from './user-list-page/user-list-page.component';
import { UserResolverService } from 'app/users/shared/user.resolver.service';
import { UserEditPageComponent } from "./user-edit-page/user-edit-page.component";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'users/add',
        component: UserAddPageComponent,
      },
      {
        path: 'users/:id',
        component: UserEditPageComponent,
        resolve: {
          user: UserResolverService,
        },
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'edit',
          },
          {
            path: 'edit',
            component: UserEditPageComponent,
          },
        ]
      },
      {
        path: 'users',
        pathMatch: 'full',
        component: UserListPageComponent,
      },
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class UsersRoutingModule {
}
