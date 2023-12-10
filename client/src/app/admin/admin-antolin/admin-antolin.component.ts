import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormlyFields } from '../../core/form.service';
import { of } from 'rxjs';
import { catchError, flatMap, map } from "rxjs/operators";
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../core/notification-service';
import { RpcService } from '../../core/rpc.service';
import { ParamsUtil } from '../../core/params-util';
import { RpcError } from '../../core/rpc-error';
import { TableFetchResult } from '../../core/table-fetcher';
import { Borrower } from '../../borrowers/shared/borrower';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'gsl-admin-antolin',
  templateUrl: './admin-antolin.component.html',
  styleUrls: ['./admin-antolin.component.css']
})
export class AdminAntolinComponent {
  loading = false;

  constructor(private rpc: RpcService,
              private notificationService: NotificationService) {
  }

  sync() {
    this.loading = true;
    this.rpc.httpPost(`admin/antolin/sync`)
      .subscribe(
        result => {
          this.loading = false;
          this.notificationService.show(
            `Antolin books loaded: ${result.books}`
          )
        },
        (error: RpcError) => {
          this.loading = false;
          this.notificationService.showError(`Server error`)
        }
      );
  }
}
