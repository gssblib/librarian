import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { getItemStatusLabel, ItemStatus } from '../shared/item-status';

const enum Size {
  SMALL = 'small',
  NORMAL = 'normal',
}

@Component({
  selector: 'gsl-item-status',
  templateUrl: './item-status.component.html',
  styleUrls: ['./item-status.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ItemStatusComponent {

  @Input('status') status: ItemStatus;
  @Input('size') size = Size.SMALL;

  get name(): string {
    return this.status.toLowerCase();
  }

  get label(): string {
    return getItemStatusLabel(this.status);
  }
}
