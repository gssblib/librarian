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
import { UsersService } from './shared/users.service';
import { UserService } from './shared/user.service';
import { UserResolverService } from './shared/user.resolver.service';
import { UserListPageComponent } from './user-list-page/user-list-page.component';
import { UserAddPageComponent } from './user-add-page/user-add-page.component';
import { UserEditPageComponent } from './user-edit-page/user-edit-page.component';
import { CdkTableModule } from '@angular/cdk/table';
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
        UserListPageComponent,
        UserAddPageComponent,
        UserEditPageComponent,
    ],
    providers: [
        UserService,
        UserResolverService,
        UsersService,
    ],
    exports: [
    ]
})
export class UsersModule {
}
