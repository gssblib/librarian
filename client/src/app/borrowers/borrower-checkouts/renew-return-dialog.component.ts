import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

/**
 * Dialog shown when an item is scanned that is already checked-out by
 * the borrower.
 */
@Component({
  selector: 'gsl-renew-return-dialog',
  templateUrl: './renew-return-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class RenewReturnDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RenewReturnDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
  }

  onClose(result) {
    this.dialogRef.close(result);
  }
}
