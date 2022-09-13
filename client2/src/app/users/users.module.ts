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
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatTabsModule } from "@angular/material/tabs";
import { MatDialogModule } from "@angular/material/dialog";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatSortModule } from "@angular/material/sort";
import { MatButtonModule } from "@angular/material/button";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
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
