import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { NotificationService } from "../../core/notification-service";
import { UsersService } from "../shared/users.service";
import { User } from "../shared/user";

@Component({
  selector: 'gsl-user-add-page',
  templateUrl: './user-add-page.component.html',
  styleUrls: ['./user-add-page.component.css']
})
export class UserAddPageComponent implements OnInit {
  form = new FormGroup({});
  user: User;
  fields: Array<FormlyFieldConfig> = [];

  constructor(private notificationService: NotificationService,
              private usersService: UsersService,
              private router: Router) {
  }

  ngOnInit() {
    this.usersService.getFormlyFields().subscribe(fields => this.fields = fields);
    this.user = this.usersService.newUser();
  }

  submitForm(user) {
    this.usersService.add(user).subscribe(
      value => {
        this.router.navigate(['/users', value.id, 'edit']);
      },
      error => {
        this.notificationService.showError('Saving user failed', error);
      }
    );
  }

}
