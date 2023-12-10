import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationDialogDirective } from './confirmation-dialog.directive';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import {MatLegacyDialogModule as MatDialogModule} from "@angular/material/legacy-dialog";
import {MatLegacyButtonModule as MatButtonModule} from "@angular/material/legacy-button";

@NgModule({
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
    ],
    declarations: [
        ConfirmationDialogDirective,
        ConfirmationDialogComponent,
    ],
    exports: [
        ConfirmationDialogDirective,
    ]
})
export class ConfirmationDialogModule { }
