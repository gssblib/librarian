import { Component, Inject, OnInit } from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from "@angular/material/legacy-dialog";

/**
 * Dialog shown when an item is scanned that is already checked-out by
 * the borrower.
 */
@Component({
  selector: 'gsl-renew-return-dialog',
  templateUrl: './renew-return-dialog.component.html',
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
