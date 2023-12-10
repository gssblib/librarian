import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormlyModule } from '@ngx-formly/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { ConfirmationDialogModule } from '../shared/confirmation-dialog/confirmation-dialog.module';
import { ItemsModule } from '../items/items.module';
import { BorrowersService } from './shared/borrowers.service';
import { BorrowerService } from './shared/borrower.service';
import { BorrowerResolverService } from './shared/borrower.resolver.service';
import { BorrowerCheckoutsTableComponent } from './borrower-checkouts-table/borrower-checkouts-table.component';
import { BorrowerPageComponent } from './borrower-page/borrower-page.component';
import { BorrowerSearchPageComponent } from './borrower-search-page/borrower-search-page.component';
import { BorrowerCheckoutsComponent } from './borrower-checkouts/borrower-checkouts.component';
import { BorrowerFeesComponent } from './borrower-fees/borrower-fees.component';
import { BorrowerHistoryComponent } from './borrower-history/borrower-history.component';
import { BorrowerProfileComponent } from './borrower-profile/borrower-profile.component';
import { BorrowerAutoCompleteComponent } from './borrower-auto-complete/borrower-auto-complete.component';
import { BorrowerProfileEditComponent } from './borrower-profile-edit/borrower-profile-edit.component';
import { BorrowerSearchBarComponent } from './borrower-search-bar/borrower-search-bar.component';
import { BorrowerAddPageComponent } from './borrower-add-page/borrower-add-page.component';
import { BorrowerStatusComponent } from './borrower-status/borrower-status.component';
import { CdkTableModule } from '@angular/cdk/table';
import { RenewReturnDialogComponent } from "./borrower-checkouts/renew-return-dialog.component";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatLegacyChipsModule as MatChipsModule } from "@angular/material/legacy-chips";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatSortModule } from "@angular/material/sort";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyPaginatorModule as MatPaginatorModule } from "@angular/material/legacy-paginator";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatExpansionModule } from '@angular/material/expansion';
import { BorrowerOrdersComponent } from './borrower-orders/borrower-orders.component';
import { BorrowerOrderComponent } from './borrower-order/borrower-order.component';
import { BorrowerRemindersComponent } from './borrower-reminders/borrower-reminders.component';
import { BorrowerRemindersTableComponent } from './borrower-reminders-table/borrower-reminders-table.component';
import { BorrowerReminderDialogComponent } from './borrower-reminder-dialog/borrower-reminder-dialog.component';

@NgModule({
    imports: [
        CoreModule,
        CommonModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        CdkTableModule,
        SharedModule,
        ConfirmationDialogModule,
        MatCardModule,
        MatChipsModule,
        MatDialogModule,
        MatExpansionModule,
        MatTabsModule,
        MatAutocompleteModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSortModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        FormlyModule.forRoot(),
        FormlyMaterialModule,
        RouterModule,
        ItemsModule,
    ],
    declarations: [
        BorrowerPageComponent,
        BorrowerSearchPageComponent,
        BorrowerCheckoutsComponent,
        BorrowerFeesComponent,
        BorrowerHistoryComponent,
        BorrowerProfileComponent,
        BorrowerProfileEditComponent,
        BorrowerCheckoutsTableComponent,
        BorrowerAutoCompleteComponent,
        BorrowerSearchBarComponent,
        BorrowerAddPageComponent,
        BorrowerStatusComponent,
        RenewReturnDialogComponent,
        BorrowerOrdersComponent,
        BorrowerOrderComponent,
        BorrowerRemindersComponent,
        BorrowerRemindersTableComponent,
        BorrowerReminderDialogComponent,
    ],
    providers: [
        BorrowerService,
        BorrowerResolverService,
        BorrowersService,
    ],
    exports: [
        BorrowerSearchBarComponent,
        BorrowerCheckoutsTableComponent
    ]
})
export class BorrowersModule {
}
