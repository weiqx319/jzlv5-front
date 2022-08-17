import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-publisher-select',
  templateUrl: './publisher-select.component.html',
  styleUrls: ['./publisher-select.component.scss']
})
export class PublisherSelectComponent implements OnInit, AfterViewInit {

  public all_items = [];
  public selected_item_obj: any;
  public init_items: any;

  @Input() set allItems(data: any) {
    this.all_items = data;
  }

  @Input() set itemControl(data: any) {
    this.selected_item_obj = data;
  }

  @Input() set initItems(data: any) {
    this.init_items = data ? data : [];
  }
  @Input() publisherId: any;

  @Output() itemSelectedChange: EventEmitter<object> = new EventEmitter<object>();

  constructor() { }

  ngOnInit() {
  }

  publisherChange(p_index) {
    const p_item = this.all_items[p_index];
    this.selected_item_obj[p_item.publisher_id] = !this.selected_item_obj[p_item.publisher_id];
    this.itemSelectedChange.emit();
  }

  ngAfterViewInit(): void {
    if (this.init_items.length > 0) {
      this.itemSelectedChange.emit();
    }
  }

}
