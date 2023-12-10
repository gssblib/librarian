import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { ConfirmationDialogModule } from '../shared/confirmation-dialog/confirmation-dialog.module';
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
import { FlexLayoutModule } from "@angular/flex-layout";
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AdminAntolinComponent } from './admin-antolin/admin-antolin.component';
import { AdminFamiliesComponent } from './admin-families/admin-families.component';
import { AdminLabelsPrintQueueComponent } from './admin-labels-print-queue/admin-labels-print-queue.component';
import { LabelPrintJobPageComponent } from './label-print-job-page/label-print-job-page.component';
import { LabelsPrintQueueService } from './labels-print-queue.service';
import { LabelPrintJobService } from './label-print-job.service';
import { LabelPrintJobResolverService } from './label-print-job.resolver.service';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmationDialogModule,
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
    NgxExtendedPdfViewerModule,
    FlexLayoutModule,
    AdminRoutingModule,
  ],
  declarations: [
    AdminPageComponent,
    AdminAntolinComponent,
    AdminFamiliesComponent,
    AdminLabelsPrintQueueComponent,
    LabelPrintJobPageComponent,
  ],
  providers: [
    LabelsPrintQueueService,
    LabelPrintJobService,
    LabelPrintJobResolverService,
  ],
})
export class AdminModule { }
