import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'gsl-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class NotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
