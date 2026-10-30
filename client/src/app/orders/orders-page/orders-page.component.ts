import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

/**
 * Component showing a list of orders.
 */
@Component({
  selector: 'gsl-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class OrdersPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
