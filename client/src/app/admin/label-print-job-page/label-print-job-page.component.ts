import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { UntypedFormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { NotificationService } from "../../core/notification-service";
import { LabelPrintJob } from "../labels-print-queue";
import { LabelsPrintQueueService } from "../labels-print-queue.service";
import { LabelPrintJobService } from "../label-print-job.service";

@Component({
  selector: 'gsl-label-print-job-page',
  templateUrl: './label-print-job-page.component.html',
  styleUrls: ['./label-print-job-page.component.css']
})
export class LabelPrintJobPageComponent implements OnInit {
  form = new UntypedFormGroup({});
  fields: Array<FormlyFieldConfig> = [];
  job: LabelPrintJob;
  labelPdf;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private jobService: LabelPrintJobService,
    private queueService: LabelsPrintQueueService,
    private route: ActivatedRoute
  ) {
    this.job = this.jobService.get();
    this.jobService.subscribe(job => this.job = job);
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => this.jobService.set(data['job']));
    this.queueService.getFormlyFields().subscribe(fields => this.fields = fields);
    this.queueService.getLabelPdf(this.job)
      .subscribe(
        pdf => {
          this.labelPdf = pdf;
        }
      );
  }

  submit() {
    this.queueService.save(this.job).subscribe(
      value => { this.notificationService.show("Job saved."); },
      error => { this.notificationService.showError("Failed saving job.", error)}
    );
  }

  delete() {
    const num = this.job.id;
    this.queueService.remove(this.job).subscribe(
      job => { this.notificationService.show(`Job ${num} deleted.`) },
      error => { this.notificationService.showError("Failed to delete job.", error) }
    );
    this.router.navigate(['/admin/labels-print-queue']);
  }
}
