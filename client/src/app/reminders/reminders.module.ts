import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { RemindersPageComponent } from './reminders-page/reminders-page.component';
import { RemindersRoutingModule } from './reminders-routing.module';
import { ReactiveFormsModule } from "@angular/forms";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatIconModule } from "@angular/material/icon";
import { RemindersTableComponent } from './reminders-table/reminders-table.component';
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatLegacyPaginatorModule as MatPaginatorModule } from "@angular/material/legacy-paginator";
import { ConfirmationDialogModule } from "../shared/confirmation-dialog/confirmation-dialog.module";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    ConfirmationDialogModule,
    RemindersRoutingModule,
  ],
  declarations: [
    RemindersPageComponent,
    RemindersTableComponent,
  ],
})
export class RemindersModule {
}
