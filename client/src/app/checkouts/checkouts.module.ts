import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutPageComponent } from './checkout-page/checkout-page.component';
import { BorrowersModule } from "../borrowers/borrowers.module";
import {MatLegacyCardModule as MatCardModule} from "@angular/material/legacy-card";

@NgModule({
  imports: [
    MatCardModule,
    CommonModule,
    BorrowersModule,
  ],
  declarations: [CheckoutPageComponent]
})
export class CheckoutsModule { }
