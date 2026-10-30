import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'gsl-app-search-bar',
  templateUrl: './app-search-bar.component.html',
  styleUrls: ['./app-search-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class AppSearchBarComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }
}
