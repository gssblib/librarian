import {Component, Inject} from '@angular/core';
import {BorrowerReminder, BorrowerReminderResultCode} from '../shared/borrower';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

export interface BorrowerReminderDialogComponentData {
  reminder: BorrowerReminder;
}

@Component({
  selector: 'gsl-borrower-reminder-dialog',
  templateUrl: './borrower-reminder-dialog.component.html',
  styleUrls: ['./borrower-reminder-dialog.component.css']
})
export class BorrowerReminderDialogComponent {
  readonly reminder: BorrowerReminder;

  readonly ResultCode = BorrowerReminderResultCode;

  constructor(@Inject(MAT_DIALOG_DATA) data: BorrowerReminderDialogComponentData) {
    this.reminder = data.reminder;
  }
}
