import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'gsl-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class AdminPageComponent implements OnInit {
  navLinks = [
    { link: 'antolin', label: 'Antolin'},
    { link: 'families', label: 'Families'},
    { link: 'labels-print-queue', label: 'Labels Print Queue'},
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
  }
}
