import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { ConfirmationDialogModule } from '../shared/confirmation-dialog/confirmation-dialog.module';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatPaginatorModule} from "@angular/material/paginator";
import { AdminRoutingModule } from './admin-routing.module';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AdminAntolinComponent } from './admin-antolin/admin-antolin.component';
import { AdminFamiliesComponent } from './admin-families/admin-families.component';
import { AdminLabelsPrintQueueComponent } from './admin-labels-print-queue/admin-labels-print-queue.component';
import { LabelsPrintQueueService } from './labels-print-queue.service';

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
    AdminRoutingModule,
  ],
  declarations: [
    AdminPageComponent,
    AdminAntolinComponent,
    AdminFamiliesComponent,
    AdminLabelsPrintQueueComponent,
  ],
  providers: [
    LabelsPrintQueueService
  ],
})
export class AdminModule { }
