import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';

import { ReportsRoutingModule } from './reports-routing';
import { ReportsPageComponent } from './reports-page/reports-page.component';
import { ReportItemUsageComponent } from './report-item-usage/report-item-usage.component';
import { SharedModule } from '../shared/shared.module';
import { ReportOverdueComponent } from './report-overdue/report-overdue.component';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from "@angular/material/legacy-autocomplete";
import {MatLegacyButtonModule as MatButtonModule} from "@angular/material/legacy-button";
import {MatLegacyFormFieldModule as MatFormFieldModule} from "@angular/material/legacy-form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatLegacyCardModule as MatCardModule} from "@angular/material/legacy-card";
import {MatLegacyInputModule as MatInputModule} from "@angular/material/legacy-input";
import {MatLegacySelectModule as MatSelectModule} from "@angular/material/legacy-select";
import {MatLegacyTabsModule as MatTabsModule} from "@angular/material/legacy-tabs";
import {MatLegacyTableModule as MatTableModule} from "@angular/material/legacy-table";
import {MatSortModule} from "@angular/material/sort";
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from "@angular/material/legacy-progress-spinner";
import {MatLegacyPaginatorModule as MatPaginatorModule} from "@angular/material/legacy-paginator";

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    FormlyModule.forRoot(),
    FormlyMaterialModule,
    ReportsRoutingModule,
  ],
  declarations: [
    ReportsPageComponent,
    ReportItemUsageComponent,
    ReportOverdueComponent,
  ],
  providers: [
  ],
})
export class ReportsModule { }
