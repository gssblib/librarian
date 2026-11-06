import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Availability, getAvailabilityLabel } from "../shared/item-status";

const enum Size {
  SMALL = 'small',
  NORMAL = 'normal',
}

@Component({
  selector: 'gsl-item-availability',
  templateUrl: './item-availability.component.html',
  styleUrls: ['./item-availability.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ItemAvailabilityComponent {

  @Input('availability') availability: Availability;
  @Input('size') size = Size.SMALL;

  get label(): string {
    return getAvailabilityLabel(this.availability);
  }
}
