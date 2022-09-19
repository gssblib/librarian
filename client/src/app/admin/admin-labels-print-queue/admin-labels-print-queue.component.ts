import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../core/notification-service';
import { merge ,  of as observableOf ,  Observable } from 'rxjs';
import { map, flatMap, catchError } from 'rxjs/operators';
import { DataTableParams } from '../../core/data-table-params';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Column } from "../../core/form.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import { LabelsPrintQueueService } from '../labels-print-queue.service';
import { RpcError } from '../../core/rpc-error';

const FILTER_FIELDS = ['barcode', 'labelsize', 'name', 'status'];

@Component({
  selector: 'gsl-admin-labels-print-queue',
  templateUrl: './admin-labels-print-queue.component.html',
  styleUrls: ['./admin-labels-print-queue.component.css']
})
export class AdminLabelsPrintQueueComponent implements AfterViewInit {
  /** Formly config for the filter form. */
  filterFields: Observable<FormlyFieldConfig[]>;

  /** Model of the filter form. */
  criteria = {};

  /** Data table. */
  displayedColumns = ['id', 'scheduled_at', 'status', 'labelsize', 'name', 'barcode'];
  dataSource = new MatTableDataSource();
  count = -1;
  loading = false;

  /** Wrapper for pagination and sorting. */
  params: DataTableParams;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private notificationService: NotificationService,
              private labelsPrintQueueService: LabelsPrintQueueService,
              private route: ActivatedRoute,
              private router: Router) {
    this.filterFields = this.labelsPrintQueueService.getFormlyFields(
      FILTER_FIELDS, col => Object.assign(new Column(), col, {required: false}));
  }

  ngAfterViewInit(): void {
    this.params = new DataTableParams(FILTER_FIELDS, this.paginator, this.sort);
    this.criteria = {};

    // Navigate if pagination or sort order changes.
    merge(this.sort.sortChange, this.paginator.page).subscribe(() => this.navigate());

    // Load new data when route changes.
    this.route.queryParams
      .pipe(
        map(params => { this.criteria = this.params.parseParams(params) }),
        flatMap(() => {
          this.loading = true;
          return this.labelsPrintQueueService.getMany(
              this.params.query(this.criteria), this.params.offset(), this.params.limit(), true);
        }),
        map(result => {
          this.loading = false;
          if (result != null) {
            this.count = result.count;
            return result.rows;
          } else {
            this.count = -1;
            return [];
          }
        }),
        catchError((error) => {
          this.loading = false;
          return observableOf([]);
        }))
      .subscribe(data => this.dataSource.data = data);
  }

  clear(status?: string) {
    this.loading = true;
    this.labelsPrintQueueService.clear(status)
      .subscribe(
        result => {
          this.loading = false;
          this.navigate();
          this.notificationService.show('Jobs cleared.')
        },
        (error: RpcError) => {
          this.loading = false;
          this.notificationService.showError(`Server error`)
        }
      );
  }

  retry() {
    this.loading = true;
    this.labelsPrintQueueService.retry()
      .subscribe(
        result => {
          this.loading = false;
          this.navigate();
          this.notificationService.show('Jobs retried.')
        },
        (error: RpcError) => {
          this.loading = false;
          this.notificationService.showError(`Server error`)
        }
      );
  }

  /**
   * Changes the route to the route reflecting the current state of the filter.
   */
  navigate() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.params.toQueryParams(this.criteria),
    }).catch(err => {
      this.notificationService.showError('navigation error', err);
    });
  }
}
