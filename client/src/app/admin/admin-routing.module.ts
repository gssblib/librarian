import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AdminPageComponent } from "./admin-page/admin-page.component";
import { AdminAntolinComponent } from './admin-antolin/admin-antolin.component';
import { AdminFamiliesComponent } from './admin-families/admin-families.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'admin', component: AdminPageComponent,
        children: [
          {path: 'antolin', component: AdminAntolinComponent},
          {path: 'families', component: AdminFamiliesComponent},
        ]
      },

    ])
  ],
  exports: [
    RouterModule
  ]
})

export class AdminRoutingModule {
}
