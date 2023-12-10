import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { UsersService } from '../shared/users.service';
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

/**
 * User list page with list form and result table.
 *
 * All parameters (list, paging, sorting) are reflected in the route's URL
 * params. The component reloads the users whenever the route changes.
 */
@Component({
  selector: 'gsl-user-list-page',
  templateUrl: './user-list-page.component.html',
  styleUrls: ['./user-list-page.component.css']
})
export class UserListPageComponent implements AfterViewInit {
  /** Formly config for the list form. */
  listFields: Observable<FormlyFieldConfig[]>;

  /** Model of the list form. */
  criteria = {};

  /** Data table. */
  displayedColumns = ['username', 'roles', 'failed_login_attempts'];
  dataSource = new MatTableDataSource();
  count = -1;
  loading = false;

  /** Wrapper for pagination and sorting. */
  params: DataTableParams;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private notificationService: NotificationService,
              private usersService: UsersService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngAfterViewInit(): void {
    this.params = new DataTableParams([], this.paginator, this.sort);

    // Navigate if pagination or sort order changes.
    merge(this.sort.sortChange, this.paginator.page).subscribe(() => this.navigate());

    // Load new data when route changes.
    this.route.queryParams
      .pipe(
        map(params => { this.criteria = this.params.parseParams(params) }),
        flatMap(() => {
          this.loading = true;
          return this.usersService.getMany(
              this.params.query({}), this.params.offset(), this.params.limit(), true);
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

  /**
   * Changes the route to the route reflecting the current state of the list.
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
