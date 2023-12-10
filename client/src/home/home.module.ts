import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import {MatLegacyCardModule as MatCardModule} from "@angular/material/legacy-card";

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    MatCardModule,
  ],
  exports: [
    HomeComponent,
  ],
  providers: [
    HomeComponent,
  ],
  bootstrap: [HomeComponent]
})
export class HomeModule { }
