import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BorrowersService} from '../shared/borrowers.service';
import {BorrowerService} from '../shared/borrower.service';
import {Borrower, BorrowerReminder, BorrowerReminderResultCode} from '../shared/borrower';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {NotificationService} from '../../core/notification-service';
import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {
  BorrowerReminderDialogComponent,
  BorrowerReminderDialogComponentData
} from '../borrower-reminder-dialog/borrower-reminder-dialog.component';
import {
  BorrowerRemindersTableComponent
} from '../borrower-reminders-table/borrower-reminders-table.component';
import {RpcError} from '../../core/rpc-error';

@Component({
  selector: 'gsl-borrower-reminders',
  templateUrl: './borrower-reminders.component.html',
  styleUrls: ['./borrower-reminders.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BorrowerRemindersComponent implements OnInit, OnDestroy {
  readonly destroyed = new Subject<void>();

  borrower: Borrower;

  @ViewChild(BorrowerRemindersTableComponent, {static: true}) table: BorrowerRemindersTableComponent;

  constructor(
    private readonly borrowersService: BorrowersService,
    private readonly borrowerService: BorrowerService,
    private readonly notificationService: NotificationService,
    private readonly dialog: MatDialog,
  ) {
    this.borrowerService.modelObservable
      .pipe(takeUntil(this.destroyed))
      .subscribe(borrower => {
        this.borrower = borrower;
      });
  }

  ngOnInit(): void {
    this.borrower = this.borrowerService.get();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  sendReminder() {
    const borrowerNumber = this.borrower.borrowernumber;
    this.borrowersService.getReminder(borrowerNumber).subscribe(reminder => {
      console.log('reminder', reminder);
      switch (reminder.resultCode) {
        case BorrowerReminderResultCode.OK:
        case BorrowerReminderResultCode.EXISTING_EMAIL_IN_WINDOW:
          this.showReminderDialog(reminder);
          break;
        case BorrowerReminderResultCode.NO_ITEMS_OR_FEES:
        this.notificationService.show(
          'No reminder needed - borrower has no outstanding items or feed');
          break;
        default:
          break;
      }
    });
  }

  private showReminderDialog(reminder: BorrowerReminder): void {
    const data: BorrowerReminderDialogComponentData = {
      reminder,
    };
    const dialogRef: MatDialogRef<BorrowerReminderDialogComponent, boolean> =
      this.dialog.open(BorrowerReminderDialogComponent, {
        data,
      });
    dialogRef.afterClosed().subscribe(send => {
      if (send) {
        this.sendReminderEmail();
      }
    });
  }

  private sendReminderEmail(): void {
    this.borrowersService.sendReminder(this.borrower.borrowernumber).subscribe(
      result => {
        this.notificationService.show('Reminder email sent.');
        this.table.navigate();
      },
      (error: RpcError) => {
        this.notificationService.showError('Error sending reminder.');
      }
    );
  }
}
