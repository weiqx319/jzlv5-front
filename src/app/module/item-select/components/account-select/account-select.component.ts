import {Component, EventEmitter, Input, OnInit, Output, AfterViewInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-account-select',
  templateUrl: './account-select.component.html',
  styleUrls: ['./account-select.component.scss']
})
export class AccountSelectComponent implements OnInit, AfterViewInit {

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
  @Input() publisherAry: any;

  @Output() itemSelectedChange: EventEmitter<object> = new EventEmitter<object>();

  constructor() { }

  accountsSelectedAll(p_index) {
    const account_lists = this.all_items[p_index];
    let a_count = 0;
    if (account_lists.hasOwnProperty('detail') && account_lists.detail.length > 0) {
      account_lists.detail.forEach(a_item => {
        if (this.selected_item_obj[a_item.publisher_id + '_' + a_item.chan_pub_id + '_' + a_item.pub_account_id]) {
          ++a_count;
        }
      });
      this.selected_item_obj[account_lists.publisher_id] = a_count === account_lists.detail.length;
    }
  }

  publisherChange(p_index) {
    const p_item  = this.all_items[p_index];
    this.selected_item_obj[p_item.publisher_id] = !this.selected_item_obj[p_item.publisher_id];
    if (p_item.hasOwnProperty('detail') && p_item.detail.length) {
      p_item.detail.forEach(a_item => {
        this.selected_item_obj[a_item.publisher_id + '_' + a_item.chan_pub_id + '_' + a_item.pub_account_id] = this.selected_item_obj[p_item.publisher_id];
      });
    }
    this.itemSelectedChange.emit();
  }

  accountChange(p_index, a_index) {
    const a_item  = this.all_items[p_index].detail[a_index];
    this.selected_item_obj[a_item.publisher_id + '_' + a_item.chan_pub_id + '_' + a_item.pub_account_id] = !this.selected_item_obj[a_item.publisher_id + '_' + a_item.chan_pub_id + '_' + a_item.pub_account_id];
    this.accountsSelectedAll(p_index);
    this.itemSelectedChange.emit();
  }

  ngOnInit() {

    //专门针对监测功能
    if (this.publisherId) {
      this.all_items.forEach(item => {
        if (item.publisher_id * 1 === this.publisherId) {
          this.all_items = [item];
        }
      });
    }

    // 否词库媒体列表
    if (this.publisherAry && this.publisherAry.length) {
      const curItem = [];
      this.all_items.forEach(item => {
        if (this.publisherAry.includes(item.publisher_id * 1)) {
          curItem.push(item);
        }
      });

      this.all_items = [...curItem];
    }

  }

  ngAfterViewInit(): void {
    if (this.init_items.length > 0) {
      this.all_items.forEach((p_item, p_index) => {
        this.accountsSelectedAll(p_index);
      });
      this.itemSelectedChange.emit();
    }
  }
}
