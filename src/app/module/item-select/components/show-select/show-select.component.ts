import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-show-select',
  templateUrl: './show-select.component.html',
  styleUrls: ['./show-select.component.scss']
})
export class ShowSelectComponent implements OnInit {

  public selected_detail = {};
  public selected_item_obj = {};

  @Input() set selectedItems(data: any) {
    this.selected_detail = data;
  }

  @Input() set itemControl(data: any) {
    this.selected_item_obj = data;
  }

  @Output() closeItem: EventEmitter<object> = new EventEmitter<object>();

  constructor() { }

  getKeys(items) {
    return Object.keys(items);
  }

  getPublisherName(key) {
    return this.selected_detail[key].publisher_name;
  }

  getAccountName(p_key, a_key) {
    return this.selected_detail[p_key].detail[a_key].pub_account_name;
  }

  getCampaignName(p_key, a_key, c_key) {
    return this.selected_detail[p_key].detail[a_key].detail[c_key].pub_campaign_name;
  }

  getGroupName(p_key, a_key, c_key, g_key) {
    return this.selected_detail[p_key].detail[a_key].detail[c_key].detail[g_key].pub_adgroup_name;
  }

  ngOnInit() {
  }

  publisherClose(p_key) {

    delete this.selected_detail[p_key];
    this.selected_item_obj[p_key] = false;
    Object.keys(this.selected_item_obj).forEach( itemKey => {
      if(itemKey.indexOf(p_key+'_') === 0) {
          delete this.selected_item_obj[itemKey];
      }
    });


    this.closeItem.emit({publisher_id: Number(p_key)});
  }

  accountClose(p_key, a_key) {
    this.selected_item_obj[p_key + '_' + a_key] = false;
    delete this.selected_detail[p_key]['detail'][a_key];

    Object.keys(this.selected_item_obj).forEach( itemKey => {
      if(itemKey.indexOf(p_key+'_'+a_key+'_') === 0) {
        delete this.selected_item_obj[itemKey];
      }
    });

    if(Object.keys(this.selected_detail[p_key]['detail']).length == 0) {
      this.publisherClose(p_key);
    }
    this.closeItem.emit({publisher_id: Number(p_key), pub_account_id: a_key});
  }

  campaignClose(p_key, a_key, c_key) {
    this.selected_item_obj[p_key + '_' + a_key + '_' + c_key] = false;
    delete this.selected_detail[p_key]['detail'][a_key]['detail'][c_key];
    Object.keys(this.selected_item_obj).forEach( itemKey => {
      if(itemKey.indexOf(p_key+'_'+a_key+'_'+c_key+'_') === 0) {
        delete this.selected_item_obj[itemKey];
      }
    });

    if(Object.keys(this.selected_detail[p_key]['detail'][a_key]['detail']).length == 0) {
      this.accountClose(p_key, a_key);
    }
    this.closeItem.emit({publisher_id: Number(p_key), pub_account_id: a_key, pub_campaign_id: Number(c_key)});
  }

  groupClose(p_key, a_key, c_key, g_key) {
    this.selected_item_obj[p_key + '_' + a_key + '_' + c_key + '_' + g_key] = false;
    delete this.selected_detail[p_key]['detail'][a_key]['detail'][c_key]['detail'][g_key];
    if(Object.keys(this.selected_detail[p_key]['detail'][a_key]['detail'][c_key]['detail']).length == 0) {
      this.campaignClose(p_key, a_key, c_key);
    }

    this.closeItem.emit({publisher_id: Number(p_key), pub_account_id: a_key, pub_campaign_id: Number(c_key), pub_adgroup_id: Number(g_key)});
  }

}
