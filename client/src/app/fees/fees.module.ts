import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeesService } from './fees.service';
import { FeesRoutingModule } from './fees-routing.module';
import { FeesPageComponent } from './fees-page/fees-page.component';
import { FeesTableComponent } from './fees-table/fees-table.component';
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatLegacyOptionModule as MatOptionModule } from "@angular/material/legacy-core";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatLegacyPaginatorModule as MatPaginatorModule } from "@angular/material/legacy-paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";

/**
 * Angular module for the fees owed to the library.
 *
 * The module provides the FeesService communicating the backend and the components
 * for viewing and updating fees.
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    FeesRoutingModule,
  ],
  declarations: [
    FeesPageComponent,
    FeesTableComponent,
  ],
  providers: [
    FeesService,
  ],
  exports: []
})
export class FeesModule {
}
