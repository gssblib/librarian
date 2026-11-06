import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ConfigService } from "../../core/config.service";
import { Item } from "../shared/item";
import { ItemState } from "../shared/item-state";

@Component({
  selector: 'gsl-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ItemCardComponent {
  @Input('item') item: Item;

  readonly ItemState = ItemState;

  hasCover: boolean = true;

  constructor(public readonly config: ConfigService) {
  }

  noCover() {
    this.hasCover = false;
  }
}
