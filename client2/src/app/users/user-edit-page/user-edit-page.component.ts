import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { User } from "../shared/user";
import { NotificationService } from "../../core/notification-service";
import { UserService } from "../shared/user.service";
import { UsersService } from "../shared/users.service";

@Component({
  selector: 'gsl-user-edit-page',
  templateUrl: './user-edit-page.component.html',
  styleUrls: ['./user-edit-page.component.css']
})
export class UserEditPageComponent implements OnInit {
  form = new FormGroup({});
  fields: Array<FormlyFieldConfig> = [];
  user: User;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private userService: UserService,
    private usersService: UsersService,
    private route: ActivatedRoute
  ) {
    this.user = this.userService.get();
    this.userService.subscribe(user => this.user = user);

  }

  ngOnInit(): void {
    this.route.data.subscribe(data => this.userService.set(data['user']));
    this.usersService.getFormlyFields().subscribe(fields => this.fields = fields);
  }

  submit() {
    this.usersService.save(this.user).subscribe(
      value => { this.notificationService.show("User saved."); },
      error => { this.notificationService.showError("Failed saving user.", error)}
    );
  }

  delete() {
    const num = this.user.id;
    this.usersService.remove(this.user).subscribe(
      user => { this.notificationService.show(`User ${num} deleted.`) },
      error => { this.notificationService.showError("Failed to delete user..", error) }
    );
    this.router.navigate(['/users']);
  }
}
