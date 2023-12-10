import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FileUploadModule } from 'ng2-file-upload';
import { CoreModule } from '../core/core.module';
import { ItemService } from './shared/item.service';
import { ItemsService } from './shared/items.service';
import { ItemPageComponent } from './item-page/item-page.component';
import { ItemAutoCompleteComponent } from './item-auto-complete/item-auto-complete.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ItemSearchBarComponent } from './item-search-bar/item-search-bar.component';
import { ItemResolverService } from './shared/item.resolver.service';
import { ReturnPageComponent } from './return-page/return-page.component';
import { SharedModule } from '../shared/shared.module';
import { ConfirmationDialogModule } from '../shared/confirmation-dialog/confirmation-dialog.module';
import { ItemSearchPageComponent } from './item-search-page/item-search-page.component';
import { ItemEditFormComponent } from './item-edit-form/item-edit-form.component';
import { ItemAddPageComponent } from './item-add-page/item-add-page.component';
import { ItemHistoryComponent } from './item-history/item-history.component';
import { ItemLabelsComponent } from './item-labels/item-labels.component';
import { ItemStatusComponent } from './item-status/item-status.component';
import { ItemAntolinComponent } from './item-antolin/item-antolin.component';
import { ItemEditCoverComponent } from './item-edit-cover/item-edit-cover.component';
import { ItemCardComponent } from './item-card/item-card.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatLegacyChipsModule as MatChipsModule } from "@angular/material/legacy-chips";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatLegacyOptionModule as MatOptionModule } from "@angular/material/legacy-core";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatSortModule } from "@angular/material/sort";
import { MatLegacyPaginatorModule as MatPaginatorModule } from "@angular/material/legacy-paginator";
import { ItemAvailabilityComponent } from './item-availability/item-availability.component';

/**
 * Angular module for the items (books, CDs) in the library.
 *
 * The module provides the ItemsService communicating the backend and the components
 * for viewing and editing items.
 */
@NgModule({
  imports: [
    FileUploadModule,
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    CoreModule,
    SharedModule,
    MatCardModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatTabsModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    FormlyModule.forRoot(),
    FormlyMaterialModule,
    RouterModule,
    ConfirmationDialogModule,
    NgxExtendedPdfViewerModule,
  ],
  declarations: [
    ItemPageComponent,
    ItemAutoCompleteComponent,
    ItemSearchBarComponent,
    ReturnPageComponent,
    ItemSearchPageComponent,
    ItemEditFormComponent,
    ItemAddPageComponent,
    ItemHistoryComponent,
    ItemLabelsComponent,
    ItemStatusComponent,
    ItemAntolinComponent,
    ItemEditCoverComponent,
    ItemCardComponent,
    ItemDetailsComponent,
    ItemAvailabilityComponent,
  ],
  providers: [
    ItemResolverService,
    ItemService,
    ItemsService,
  ],
  exports: [
    ItemAutoCompleteComponent,
    ItemSearchBarComponent,
    ItemPageComponent,
    ItemEditCoverComponent,
    ItemStatusComponent,
    ItemAntolinComponent,
    ItemCardComponent,
    ItemSearchPageComponent,
    ItemDetailsComponent,
    ItemAvailabilityComponent,
  ]
})
export class ItemsModule { }
