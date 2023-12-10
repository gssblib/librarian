import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { catchError, flatMap, map } from "rxjs/operators";
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../core/notification-service';
import { RpcService } from '../../core/rpc.service';
import { ParamsUtil } from '../../core/params-util';
import { RpcError } from '../../core/rpc-error';
import { TableFetchResult } from '../../core/table-fetcher';
import { Borrower } from '../../borrowers/shared/borrower';
import {MatLegacyTableDataSource as MatTableDataSource} from "@angular/material/legacy-table";
import {MatLegacyPaginator as MatPaginator} from "@angular/material/legacy-paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'gsl-admin-families',
  templateUrl: './admin-families.component.html',
  styleUrls: ['./admin-families.component.css']
})
export class AdminFamiliesComponent {
  loading = false;
  selectedFile: File;

  constructor(private rpc: RpcService,
              private notificationService: NotificationService) {
  }

  csvInputChange(fileInputEvent: any) {
    this.selectedFile = fileInputEvent.target.files[0];
  }

  load() {
    if (!this.selectedFile) {
          this.notificationService.showError(`Please select a file first.`)
    }
    this.loading = true;
    const formData = new FormData();
    formData.append("report", this.selectedFile);
    this.rpc.httpPost(`admin/families/load`, formData)
      .subscribe(
        res => {
          this.loading = false;
          this.notificationService.show(
            `${res.created} families were created and ${res.updated} were updated.`)
          this.selectedFile = null;
        },
        (error: RpcError) => {
          this.loading = false;
          this.notificationService.showError('Server error');
        }
      );
  }
}
