import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'gsl-item-antolin',
  templateUrl: './item-antolin.component.html',
  styleUrls: ['./item-antolin.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ItemAntolinComponent {
  @Input('antolin') antolin;

  constructor() { }

}
