import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'gsl-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class CheckoutPageComponent implements OnInit {

  constructor() {}

  ngOnInit() {
  }
}
