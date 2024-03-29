import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from "@angular/common/http";
import { FlexLayoutModule } from "@angular/flex-layout";
import { NotFoundModule } from '../not-found/not-found.module';
import { HomeModule } from '../home/home.module';
import { CoreModule } from './core/core.module';
import { AppComponent } from './app.component';
import { ItemsModule } from './items/items.module';
import { AppRoutingModule } from './app-routing.module';
import { BorrowersModule } from './borrowers/borrowers.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { AppSearchBarComponent } from './app-search-bar/app-search-bar.component';
import { FeesModule } from './fees/fees.module';
import { RemindersModule } from './reminders/reminders.module';
import { ReportsModule } from './reports/reports.module';
import { ItemsRoutingModule } from "./items/items-routing.module";
import { BorrowersRoutingModule } from './borrowers/borrowers-routing.module';
import { UsersRoutingModule } from './users/users-routing.module';
import { AdminRoutingModule } from './admin/admin-routing.module';
import { CheckoutsModule } from "./checkouts/checkouts.module";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { OrdersRoutingModule } from "./orders/orders-routing.module";
import { OrdersModule } from "./orders/orders.module";
import { MatDatetimepickerModule, MatNativeDatetimeModule } from "@mat-datetimepicker/core";

@NgModule({
  declarations: [
    AppComponent,
    AppSearchBarComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    FlexLayoutModule,
    CoreModule,
    ItemsModule,
    BorrowersModule,
    UsersModule,
    AdminModule,
    FeesModule,
    RemindersModule,
    ReportsModule,
    CheckoutsModule,
    OrdersModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDatetimeModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatDatetimepickerModule,
    NotFoundModule,
    HomeModule,
    /* List routers in the right order. */
    ItemsRoutingModule,
    BorrowersRoutingModule,
    OrdersRoutingModule,
    UsersRoutingModule,
    AdminRoutingModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
