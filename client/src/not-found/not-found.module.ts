import { NgModule } from '@angular/core';
import { NotFoundComponent } from './not-found.component';
import {MatLegacyCardModule as MatCardModule} from "@angular/material/legacy-card";

@NgModule({
  declarations: [
    NotFoundComponent,
  ],
  imports: [
    MatCardModule,
  ],
  exports: [
    NotFoundComponent,
  ],
  providers: [
    NotFoundComponent,
  ],
  bootstrap: [NotFoundComponent]
})
export class NotFoundModule { }
