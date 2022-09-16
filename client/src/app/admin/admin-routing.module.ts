import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AdminPageComponent } from "./admin-page/admin-page.component";
import { AdminAntolinComponent } from './admin-antolin/admin-antolin.component';
import { AdminFamiliesComponent } from './admin-families/admin-families.component';
import { AdminLabelsPrintQueueComponent } from './admin-labels-print-queue/admin-labels-print-queue.component';
import { LabelPrintJobPageComponent } from './label-print-job-page/label-print-job-page.component';
import { LabelPrintJobResolverService } from './label-print-job.resolver.service';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'admin', component: AdminPageComponent,
        children: [
          {path: 'antolin', component: AdminAntolinComponent},
          {path: 'families', component: AdminFamiliesComponent},
          {path: 'labels-print-queue', component: AdminLabelsPrintQueueComponent},
        ]
      },
      {
        path: 'admin/labels-print-queue/:id',
        component: LabelPrintJobPageComponent,
        resolve: {
          job: LabelPrintJobResolverService,
        },
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'edit',
          },
          {
            path: 'edit',
            component: LabelPrintJobPageComponent,
          },
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
