import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ItemSelectService} from "../../service/item-select.service";

@Component({
  selector: 'app-group-select',
  templateUrl: './group-select.component.html',
  styleUrls: ['./group-select.component.scss']
})
export class GroupSelectComponent implements OnInit, AfterViewInit {

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

  constructor(private itemSelectService: ItemSelectService) { }

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

  campaignSelectedAll(p_index, a_index) {
    const campaign_lists = this.all_items[p_index].detail[a_index];
    let c_count = 0;
    campaign_lists.detail.forEach(c_item => {
      if (this.selected_item_obj[c_item.publisher_id + '_' + c_item.chan_pub_id + '_' + c_item.pub_account_id + '_' + c_item.pub_campaign_id]) {
        ++c_count;
      }
    });
    this.selected_item_obj[campaign_lists.publisher_id + '_' + campaign_lists.chan_pub_id + '_' + campaign_lists.pub_account_id] = c_count === campaign_lists.detail.length;
  }

  groupSelectedAll(p_index, a_index, c_index) {
    const group_lists = this.all_items[p_index].detail[a_index].detail[c_index];
    let g_count = 0;
    if (group_lists.hasOwnProperty('detail') && group_lists.detail.length > 0) {
      group_lists.detail.forEach(g_item => {
        if (this.selected_item_obj[g_item.publisher_id + '_' + g_item.chan_pub_id + '_' + g_item.pub_account_id + '_' + g_item.pub_campaign_id + '_' + g_item.pub_adgroup_id]) {
          ++g_count;
        }
      });
      this.selected_item_obj[group_lists.publisher_id + '_' + group_lists.chan_pub_id + '_' + group_lists.pub_account_id + '_' + group_lists.pub_campaign_id] = g_count === group_lists.detail.length;
    }
    return g_count;
  }

  publisherChange(p_index) {
    const p_item  = this.all_items[p_index];
    this.selected_item_obj[p_item.publisher_id] = !this.selected_item_obj[p_item.publisher_id];
    if (p_item.hasOwnProperty('detail') && p_item.detail.length) {
      p_item.detail.forEach(a_item => {
        this.selected_item_obj[a_item.publisher_id + '_' + a_item.chan_pub_id + '_' + a_item.pub_account_id] = this.selected_item_obj[a_item.publisher_id];
        if (a_item.hasOwnProperty('detail') && a_item.detail.length) {
          a_item.detail.forEach(c_item => {
            this.selected_item_obj[c_item.publisher_id + '_' + c_item.chan_pub_id + '_' + c_item.pub_account_id + '_' + c_item.pub_campaign_id] = this.selected_item_obj[c_item.publisher_id + '_' + c_item.chan_pub_id + '_' + c_item.pub_account_id];
            if (c_item.hasOwnProperty('detail') && c_item.detail.length) {
              c_item.detail.forEach(g_item => {
                this.selected_item_obj[g_item.publisher_id + '_' + g_item.chan_pub_id + '_' + g_item.pub_account_id + '_' + g_item.pub_campaign_id + '_' + g_item.pub_adgroup_id] = this.selected_item_obj[g_item.publisher_id + '_' + g_item.chan_pub_id + '_' + g_item.pub_account_id + '_' + g_item.pub_campaign_id];
              });
            }
          });
        }
      });
    }
    this.itemSelectedChange.emit();
  }

  accountChange(p_index, a_index) {
    const a_item  = this.all_items[p_index].detail[a_index];
    this.selected_item_obj[a_item.publisher_id + '_' + a_item.chan_pub_id + '_' + a_item.pub_account_id] = !this.selected_item_obj[a_item.publisher_id + '_' + a_item.chan_pub_id + '_' + a_item.pub_account_id];
    if (a_item.hasOwnProperty('detail') && a_item.detail.length) {
      a_item.detail.forEach(c_item => {
        this.selected_item_obj[c_item.publisher_id + '_' + c_item.chan_pub_id + '_' + c_item.pub_account_id + '_' + c_item.pub_campaign_id] = this.selected_item_obj[c_item.publisher_id + '_' + c_item.chan_pub_id + '_' + c_item.pub_account_id];
        if (c_item.hasOwnProperty('detail') && c_item.detail.length) {
          c_item.detail.forEach(g_item => {
            this.selected_item_obj[g_item.publisher_id + '_' + g_item.chan_pub_id + '_' + g_item.pub_account_id + '_' + g_item.pub_campaign_id + '_' + g_item.pub_adgroup_id] = this.selected_item_obj[g_item.publisher_id + '_' + g_item.chan_pub_id + '_' + g_item.pub_account_id + '_' + g_item.pub_campaign_id];
          });
        }
      });
    }
    this.accountsSelectedAll(p_index);
    this.itemSelectedChange.emit();
  }

  campaignChange(p_index, a_index, c_index) {
    const c_item  = this.all_items[p_index].detail[a_index].detail[c_index];
    this.selected_item_obj[c_item.publisher_id + '_' + c_item.chan_pub_id + '_' + c_item.pub_account_id + '_' + c_item.pub_campaign_id] = !this.selected_item_obj[c_item.publisher_id + '_' + c_item.chan_pub_id + '_' + c_item.pub_account_id + '_' + c_item.pub_campaign_id];
    if (c_item.hasOwnProperty('detail') && c_item.detail.length) {
      c_item.detail.forEach(g_item => {
        this.selected_item_obj[g_item.publisher_id + '_' + g_item.chan_pub_id + '_' + g_item.pub_account_id + '_' + g_item.pub_campaign_id + '_' + g_item.pub_adgroup_id] = this.selected_item_obj[g_item.publisher_id + '_' + g_item.chan_pub_id + '_' + g_item.pub_account_id + '_' + g_item.pub_campaign_id];
      });
    }
    this.campaignSelectedAll(p_index, a_index);
    this.accountsSelectedAll(p_index);
    this.itemSelectedChange.emit();
  }

  groupChange(p_index, a_index, c_index, g_index) {
    const g_item  = this.all_items[p_index].detail[a_index].detail[c_index].detail[g_index];
    this.selected_item_obj[g_item.publisher_id + '_' + g_item.chan_pub_id + '_' + g_item.pub_account_id + '_' + g_item.pub_campaign_id + '_' + g_item.pub_adgroup_id] = !this.selected_item_obj[g_item.publisher_id + '_' + g_item.chan_pub_id + '_' + g_item.pub_account_id + '_' + g_item.pub_campaign_id + '_' + g_item.pub_adgroup_id];
    this.groupSelectedAll(p_index, a_index, c_index);
    this.campaignSelectedAll(p_index, a_index);
    this.accountsSelectedAll(p_index);
    this.itemSelectedChange.emit();
  }

  lazyLoadAdgroups(p_index, a_index, c_index) {
    const c_item  = this.all_items[p_index].detail[a_index].detail[c_index];
    if (c_item.hasOwnProperty('detail') && c_item.detail.length > 0) {
      return;
    }
    this.itemSelectService.getAdgroupListByCampaign({chan_pub_id: c_item.chan_pub_id, pub_account_id: c_item.pub_account_id, pub_campaign_id: c_item.pub_campaign_id}).subscribe(
      (results: any[]) => {
        c_item.detail = results;
        if (this.selected_item_obj[c_item.publisher_id + '_' + c_item.chan_pub_id + '_' + c_item.pub_account_id + '_' + c_item.pub_campaign_id] ) {
          if (c_item.hasOwnProperty('detail') && c_item.detail.length) {
            // 说明当前计划列表已被选中，那么新加载出来的单元列表也应该全部选中，不过这个时候不用去管账户、媒体的状态，因为这个在懒加载之前就已经初始化好了
            c_item.detail.forEach(g_item => {
              this.selected_item_obj[g_item.publisher_id + '_' + g_item.chan_pub_id + '_' + g_item.pub_account_id + '_' + g_item.pub_campaign_id + '_' + g_item.pub_adgroup_id] = this.selected_item_obj[g_item.publisher_id + '_' + g_item.chan_pub_id + '_' + g_item.pub_account_id + '_' + g_item.pub_campaign_id];
            });
            this.itemSelectedChange.emit();
          }
        } else {
          if (c_item.hasOwnProperty('detail') && c_item.detail.length) {
            const g_count = this.groupSelectedAll(p_index, a_index, c_index);
            this.campaignSelectedAll(p_index, a_index);
            this.accountsSelectedAll(p_index);
            if (g_count > 0) {
              // 说明新加载出来的单元列表中有被选中的，那么就需要显示在已选项列表中了
              this.itemSelectedChange.emit();
            }
          }
        }

      },
      (err: any) => {

      },
      () => {
      }
    );
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
        if (p_item.hasOwnProperty('detail') && p_item.detail.length > 0) {
          p_item.detail.forEach((a_item, a_index) => {
            this.campaignSelectedAll(p_index, a_index);
            if (a_item.hasOwnProperty('detail') && a_item.detail.length > 0) {
              a_item.detail.forEach((c_item, c_index) => {
                this.groupSelectedAll(p_index, a_index, c_index);
              });
            }
          });
        }
      });
      this.itemSelectedChange.emit();
    }
  }

}
