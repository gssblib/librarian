import { Component } from '@angular/core';
import { FormControl } from "@angular/forms";
import { BorrowersService } from "../../borrowers/shared/borrowers.service";
import { BorrowerReminder } from "../../borrowers/shared/borrower";
import { NotificationService } from "../../core/notification-service";
import { bufferCount, concatMap } from 'rxjs/operators';
import { from } from 'rxjs';

@Component({
  selector: 'gsl-reminders-page',
  templateUrl: './reminders-page.component.html',
  styleUrls: ['./reminders-page.component.css']
})
export class RemindersPageComponent {
  readonly message = new FormControl();

  reminders: BorrowerReminder[] = [];
  sent: 0;

  constructor(
    private readonly borrowersService: BorrowersService,
    private readonly notificationService: NotificationService,
  ) {}

  generateReminders(): void {
    this.borrowersService.generateReminders().subscribe(reminders => {
      this.reminders = reminders;
      this.sent = 0;
    });
  }

  sendReminders(): void {
    from(this.reminders)
      .pipe(
        bufferCount(5),
        concatMap(remindersBatch => {
          return this.borrowersService.sendReminders(remindersBatch);
        }),
      )
      .subscribe(remindersBatch => {
        // remove the reminders which we just sent
        this.reminders = this.reminders.filter(r => !remindersBatch.some(rb => r.borrower.borrowernumber == rb.borrower.borrowernumber));
        this.sent += remindersBatch.length
        this.notificationService.show(`${this.sent} reminder emails sent`);
    });
  }
}
