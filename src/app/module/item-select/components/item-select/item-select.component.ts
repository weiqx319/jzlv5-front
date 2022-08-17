import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ItemSelectService } from '../../service/item-select.service';

@Component({
  selector: 'app-item-select',
  templateUrl: './item-select.component.html',
  styleUrls: ['./item-select.component.scss']
})
export class ItemSelectComponent implements OnInit {

  public item_detail: any;
  public item_detail_array = [];
  public item_detail_sure_array = [];
  public item_type: any;
  public type_desc = {
    'publisher': '媒体',
    'account': '账户',
    'campaign': '计划',
    'adgroup': '单元',
  };
  public item_desc = [];
  public select_name = '';
  public all_items = {
    'publisher': [],
    'account': [],
    'campaign': [],
    'adgroup': []
  };
  public items_of_type: any;
  public selected_detail = {};
  public selected_item_obj = {};
  public type_lists: any;
  public account_loading = false;
  public campaign_loading = false;

  public type_config = {
    'publisher': [
      { key: 'publisher', name: '媒体' }
    ],
    'account': [
      { key: 'publisher', name: '媒体' },
      { key: 'account', name: '账户' }
    ],
    'campaign': [
      { key: 'publisher', name: '媒体' },
      { key: 'account', name: '账户' },
      { key: 'campaign', name: '计划' }
    ],
    'adgroup': [
      { key: 'publisher', name: '媒体' },
      { key: 'account', name: '账户' },
      { key: 'campaign', name: '计划' },
      { key: 'adgroup', name: '单元' }
    ],
    'keyword': [
      { key: 'publisher', name: '媒体' },
      { key: 'account', name: '账户' },
      { key: 'campaign', name: '计划' },
      { key: 'adgroup', name: '单元' }
    ],
    'creative': [
      { key: 'publisher', name: '媒体' },
      { key: 'account', name: '账户' },
      { key: 'campaign', name: '计划' },
      { key: 'adgroup', name: '单元' }
    ],
    'optimization_detail_effect': [
      { key: 'publisher', name: '媒体' },
      { key: 'account', name: '账户' },
      { key: 'campaign', name: '计划' }
    ],
    'monitoring': [
      // {key: 'publisher', name: '媒体'},
      { key: 'account', name: '账户' },
      { key: 'campaign', name: '计划' },
      { key: 'adgroup', name: '单元' }
    ],
    'biz_unit_account': [
      { key: 'publisher', name: '媒体' },
      { key: 'account', name: '账户' }
    ],
    'biz_unit_account_hours': [
      { key: 'publisher', name: '媒体' },
      { key: 'account', name: '账户' }
    ],
    'biz_unit_account_region': [
      { key: 'publisher', name: '媒体' },
      { key: 'account', name: '账户' }
    ],
    'responsible_account': [
      { key: 'publisher', name: '媒体' },
      { key: 'account', name: '账户' }
    ],
  };

  public is_show = false;
  @Output() itemSelected: EventEmitter<Object> = new EventEmitter<Object>();
  @Input() summaryType: any;
  @Input() set itemDetail(data: any) {
    this.item_detail = (data && data.select_data) ? data.select_data : [];
    if (data && data.select_type) {
      this.item_type = data.select_type;
    } else {
      if (this.type_config[this.summaryType]) {
        this.item_type = this.type_config[this.summaryType][0]['key'];
      } else {
        this.item_type = 'publisher';
      }
    }
  }
  @Input() publisherId: any;

  /*  @Input() set typeConfig(data: any) {
      this.type_lists = data;
    }*/


  @ViewChild('item', { static: true }) itemNode: ElementRef;

  constructor(private itemSelectService: ItemSelectService) {
    this.itemSelectService.getAccountLists({}, { select_name: '', is_accurate: false }).subscribe(
      (results: any[]) => {
        this.all_items.account = results;
        const p_items = [];
        results.forEach(p_item => {
          const p_obj = {
            publisher_id: p_item.publisher_id,
            publisher_name: p_item.publisher_name
          };
          p_items.push(p_obj);
          this.all_items.publisher = p_items;
        });
        if (this.item_type === 'publisher' || this.item_type === 'account') {
          this.items_of_type = JSON.parse(JSON.stringify(this.all_items[this.item_type]));
        }
        this.account_loading = true;
      },
      (err: any) => {
        this.account_loading = true;
      },
      () => {
        this.account_loading = true;
      }
    );
  }



  appToggleItem() {
    this.is_show = !this.is_show;
  }
  upperCase(value) {
    const result = value.replace(/\b\w+\b/g, function (word) {
      return word.substring(0, 1).toUpperCase() + word.substring(1);
    });
    return result;
  }

  getTypeData() {

    if (this.type_config[this.summaryType]) {
      this.type_lists = this.type_config[this.summaryType];
    } else {
      this.type_lists = this.type_config['account'];
    }
  }

  itemTypeChange(event) {
    this.items_of_type = JSON.parse(JSON.stringify(this.all_items[event]));
    this.selected_detail = {};
    this.selected_item_obj = {};
  }

  doSearch(data) {
    if (this.select_name) {
      if (this.item_type !== 'publisher') {
        this.itemSelectService['get' + this.upperCase(this.item_type) + 'Lists']({}, { select_name: this.select_name, is_accurate: false }).subscribe(
          (results: any[]) => {
            this.items_of_type = results;
            this.selected_detail = {};
            this.itemsChange();
          },
          (err: any) => {

          },
          () => {

          }
        );
      } else {
        this.items_of_type = this.getPublisherLists();
        this.selected_detail = {};
        this.itemsChange();
      }
    } else {
      this.items_of_type = JSON.parse(JSON.stringify(this.all_items[this.item_type]));
    }
  }

  mykey(event) {
    const keycode = window.event ? event.keyCode : event.which; //获取按键编码
    if (keycode === 13) {
      this.doSearch(event);
    }
  }

  selectNameChange() {
    // if (this.select_name) {
    //
    // } else {
    //   this.items_of_type = JSON.parse(JSON.stringify(this.all_items[this.item_type]));
    // }
  }

  getPublisherItemId(p_item) {
    return p_item.publisher_id;
  }

  getAccountItemId(a_item) {
    return a_item.publisher_id + '_' + a_item.chan_pub_id + '_' + a_item.pub_account_id;
  }

  getCampaignItemId(c_item) {
    return c_item.publisher_id + '_' + c_item.chan_pub_id + '_' + c_item.pub_account_id + '_' + c_item.pub_campaign_id;
  }

  getAdgroupItemId(g_item) {
    return g_item.publisher_id + '_' + g_item.chan_pub_id + '_' + g_item.pub_account_id + '_' + g_item.pub_campaign_id + '_' + g_item.pub_adgroup_id;
  }

  isPublisherShow(p_index) {
    const accounts = this.items_of_type[p_index];
    let publisher_show = false;
    if (accounts.hasOwnProperty('detail') && accounts.detail.length > 0) {
      accounts.detail.forEach(a_item => {
        if (!publisher_show) {
          if (this.selected_item_obj[this.getAccountItemId(a_item)]) {
            publisher_show = true;
          } else {
            if (a_item.hasOwnProperty('detail') && a_item.detail.length > 0) {
              a_item.detail.forEach(c_item => {
                if (!publisher_show) {
                  if (this.selected_item_obj[this.getCampaignItemId(c_item)]) {
                    publisher_show = true;
                  } else {
                    if (c_item.hasOwnProperty('detail') && c_item.detail.length > 0) {
                      c_item.detail.forEach(g_item => {
                        if (!publisher_show) {
                          if (this.selected_item_obj[this.getAdgroupItemId(g_item)]) {
                            publisher_show = true;
                          }
                        }
                      });
                    }
                  }
                }
              });
            }
          }
        }
      });
    }
    return publisher_show;
  }

  isAccountShow(p_index, a_index) {
    const campaigns = this.items_of_type[p_index].detail[a_index];
    let publisher_show = false;
    if (campaigns.hasOwnProperty('detail') && campaigns.detail.length > 0) {
      campaigns.detail.forEach(c_item => {
        if (!publisher_show) {
          if (this.selected_item_obj[this.getCampaignItemId(c_item)]) {
            publisher_show = true;
          } else {
            if (c_item.hasOwnProperty('detail') && c_item.detail.length > 0) {
              c_item.detail.forEach(g_item => {
                if (!publisher_show) {
                  if (this.selected_item_obj[this.getAdgroupItemId(g_item)]) {
                    publisher_show = true;
                  }
                }
              });
            }
          }
        }
      });
    }
    return publisher_show;
  }

  isCampaignShow(p_index, a_index, c_index) {
    const groups = this.items_of_type[p_index].detail[a_index].detail[c_index];
    let publisher_show = false;
    if (groups.hasOwnProperty('detail') && groups.detail.length > 0) {
      groups.detail.forEach(g_item => {
        if (!publisher_show) {
          if (this.selected_item_obj[this.getAdgroupItemId(g_item)]) {
            publisher_show = true;
          }
        }
      });
    }
    return publisher_show;
  }

  toCombineCampaignStruct(p_index, a_index, c_index) {
    const c_item = this.items_of_type[p_index].detail[a_index].detail[c_index];
    if (this.selected_detail[c_item.publisher_id].detail[c_item.chan_pub_id + '_' + c_item.pub_account_id].hasOwnProperty('detail')) {
      this.selected_detail[c_item.publisher_id].detail[c_item.chan_pub_id + '_' + c_item.pub_account_id].detail[c_item.pub_campaign_id] = {
        'publisher_id': c_item.publisher_id,
        'publisher_name': c_item.publisher_name,
        'pub_account_id': c_item.pub_account_id,
        'pub_account_name': c_item.pub_account_name,
        'pub_campaign_id': c_item.pub_campaign_id,
        'pub_campaign_name': c_item.pub_campaign_name,
        'chan_pub_id': c_item.chan_pub_id,
        'open': true
      };
    } else {
      this.selected_detail[c_item.publisher_id].detail[c_item.chan_pub_id + '_' + c_item.pub_account_id].detail = {};
      this.selected_detail[c_item.publisher_id].detail[c_item.chan_pub_id + '_' + c_item.pub_account_id].detail[c_item.pub_campaign_id] = {
        'publisher_id': c_item.publisher_id,
        'publisher_name': c_item.publisher_name,
        'pub_account_id': c_item.pub_account_id,
        'pub_account_name': c_item.pub_account_name,
        'pub_campaign_id': c_item.pub_campaign_id,
        'pub_campaign_name': c_item.pub_campaign_name,
        'chan_pub_id': c_item.chan_pub_id,
        'open': true
      };
    }
    if (c_item.hasOwnProperty('detail') && c_item.detail.length > 0) {
      c_item.detail.forEach(g_item => {
        if (this.selected_item_obj[this.getAdgroupItemId(g_item)]) {
          if (this.selected_detail[g_item.publisher_id].detail[g_item.chan_pub_id + '_' + g_item.pub_account_id].detail[g_item.pub_campaign_id].hasOwnProperty('detail')) {
            this.selected_detail[g_item.publisher_id].detail[g_item.chan_pub_id + '_' + g_item.pub_account_id].detail[g_item.pub_campaign_id].detail[g_item.pub_adgroup_id] = {
              'publisher_id': g_item.publisher_id,
              'publisher_name': g_item.publisher_name,
              'pub_account_id': g_item.pub_account_id,
              'pub_account_name': g_item.pub_account_name,
              'pub_campaign_id': g_item.pub_campaign_id,
              'pub_campaign_name': g_item.pub_campaign_name,
              'pub_adgroup_id': g_item.pub_adgroup_id,
              'pub_adgroup_name': g_item.pub_adgroup_name,
              'chan_pub_id': c_item.chan_pub_id
            };
          } else {
            this.selected_detail[g_item.publisher_id].detail[g_item.chan_pub_id + '_' + g_item.pub_account_id].detail[g_item.pub_campaign_id].detail = {};
            this.selected_detail[g_item.publisher_id].detail[g_item.chan_pub_id + '_' + g_item.pub_account_id].detail[g_item.pub_campaign_id].detail[g_item.pub_adgroup_id] = {
              'publisher_id': g_item.publisher_id,
              'publisher_name': g_item.publisher_name,
              'pub_account_id': g_item.pub_account_id,
              'pub_account_name': g_item.pub_account_name,
              'pub_campaign_id': g_item.pub_campaign_id,
              'pub_campaign_name': g_item.pub_campaign_name,
              'pub_adgroup_id': g_item.pub_adgroup_id,
              'pub_adgroup_name': g_item.pub_adgroup_name,
              'chan_pub_id': c_item.chan_pub_id
            };
          }
        }
      });
    }
  }

  toCombineAccountStruct(p_index, a_index) {
    const a_item = this.items_of_type[p_index].detail[a_index];
    if (this.selected_detail[a_item.publisher_id].hasOwnProperty('detail')) {
      this.selected_detail[a_item.publisher_id].detail[a_item.chan_pub_id + '_' + a_item.pub_account_id] = {
        'publisher_id': a_item.publisher_id,
        'publisher_name': a_item.publisher_name,
        'pub_account_id': a_item.pub_account_id,
        'pub_account_name': a_item.pub_account_name,
        'chan_pub_id': a_item.chan_pub_id,
        'open': true
      };
    } else {
      this.selected_detail[a_item.publisher_id].detail = {};
      this.selected_detail[a_item.publisher_id].detail[a_item.chan_pub_id + '_' + a_item.pub_account_id] = {
        'publisher_id': a_item.publisher_id,
        'publisher_name': a_item.publisher_name,
        'pub_account_id': a_item.pub_account_id,
        'pub_account_name': a_item.pub_account_name,
        'chan_pub_id': a_item.chan_pub_id,
        'open': true
      };
    }
    if (a_item.hasOwnProperty('detail') && a_item.detail.length > 0) {
      a_item.detail.forEach((c_item, c_index) => {
        if (this.selected_item_obj[this.getCampaignItemId(c_item)]) {
          this.toCombineCampaignStruct(p_index, a_index, c_index);
        } else {
          if (c_item.hasOwnProperty('detail') && c_item.detail.length > 0) {
            if (this.isCampaignShow(p_index, a_index, c_index)) {
              this.toCombineCampaignStruct(p_index, a_index, c_index);
            }
          }
        }
      });
    }
  }

  toCombinePublisherStruct(p_index) {
    const p_item = this.items_of_type[p_index];
    if (!this.selected_detail.hasOwnProperty(p_item.publisher_id)) {
      this.selected_detail[p_item.publisher_id] = {
        'publisher_id': p_item.publisher_id,
        'publisher_name': p_item.publisher_name,
        'chan_pub_id': p_item.chan_pub_id,
        'open': true
      };
    }
    if (p_item.hasOwnProperty('detail') && p_item.detail.length > 0) {
      p_item.detail.forEach((a_item, a_index) => {
        if (this.selected_item_obj[this.getAccountItemId(a_item)]) {
          this.toCombineAccountStruct(p_index, a_index);
        } else {
          if (p_item.hasOwnProperty('detail') && p_item.detail.length > 0) {
            if (this.isAccountShow(p_index, a_index)) {
              this.toCombineAccountStruct(p_index, a_index);
            }
          }
        }
      });
    }
  }

  itemsChange() {
    this.selected_detail = {};
    this.items_of_type.forEach((p_item, p_index) => {
      if (this.selected_item_obj[this.getPublisherItemId(p_item)]) {
        this.toCombinePublisherStruct(p_index);
      } else {
        if (p_item.hasOwnProperty('detail') && p_item.detail.length > 0) {
          if (this.isPublisherShow(p_index)) {
            this.toCombinePublisherStruct(p_index);
          }
        }
      }
    });

    this.getDesc();
    this.item_detail_array.push(this.item_desc);
  }

  deleteAllPublishers(publisher_id) {
    this.items_of_type.forEach((p_item, p_index) => {
      if (publisher_id === p_item.publisher_id) {
        this.selected_item_obj[this.getPublisherItemId(p_item)] = false;
        if (p_item.hasOwnProperty('detail') && p_item.detail.length > 0) {
          p_item.detail.forEach((a_item, a_index) => {
            this.selected_item_obj[this.getAccountItemId(a_item)] = false;
            if (a_item.hasOwnProperty('detail') && a_item.detail.length > 0) {
              a_item.detail.forEach((c_item, c_index) => {
                this.selected_item_obj[this.getCampaignItemId(c_item)] = false;
                if (c_item.hasOwnProperty('detail') && c_item.detail.length > 0) {
                  c_item.detail.forEach((g_item, g_index) => {
                    this.selected_item_obj[this.getAdgroupItemId(g_item)] = false;
                  });
                }
              });
            }
          });
        }
      }
    });
  }

  deleteAllAccounts(publisher_id, pub_account_id) {
    this.items_of_type.forEach((p_item, p_index) => {
      if (publisher_id === p_item.publisher_id) {
        this.selected_item_obj[this.getPublisherItemId(p_item)] = false;
        if (p_item.hasOwnProperty('detail') && p_item.detail.length > 0) {
          p_item.detail.forEach((a_item, a_index) => {
            if (pub_account_id === (a_item.chan_pub_id + '_' + a_item.pub_account_id)) {
              this.selected_item_obj[this.getAccountItemId(a_item)] = false;
              if (a_item.hasOwnProperty('detail') && a_item.detail.length > 0) {
                a_item.detail.forEach((c_item, c_index) => {
                  this.selected_item_obj[this.getCampaignItemId(c_item)] = false;
                  if (c_item.hasOwnProperty('detail') && c_item.detail.length > 0) {
                    c_item.detail.forEach((g_item, g_index) => {
                      this.selected_item_obj[this.getAdgroupItemId(g_item)] = false;
                    });
                  }
                });
              }
            }
          });
        }
      }
    });
  }

  deleteAllCampaigns(publisher_id, pub_account_id, pub_campaign_id) {
    this.items_of_type.forEach((p_item, p_index) => {
      if (publisher_id === p_item.publisher_id) {
        this.selected_item_obj[this.getPublisherItemId(p_item)] = false;
        if (p_item.hasOwnProperty('detail') && p_item.detail.length > 0) {
          p_item.detail.forEach((a_item, a_index) => {
            if (pub_account_id === (a_item.chan_pub_id + '_' + a_item.pub_account_id)) {
              this.selected_item_obj[this.getAccountItemId(a_item)] = false;
              if (a_item.hasOwnProperty('detail') && a_item.detail.length > 0) {
                a_item.detail.forEach((c_item, c_index) => {
                  if (pub_campaign_id === c_item.pub_campaign_id) {
                    this.selected_item_obj[this.getCampaignItemId(c_item)] = false;
                    if (c_item.hasOwnProperty('detail') && c_item.detail.length > 0) {
                      c_item.detail.forEach((g_item, g_index) => {
                        this.selected_item_obj[this.getAdgroupItemId(g_item)] = false;
                      });
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  }

  deleteAllGroups(publisher_id, pub_account_id, pub_campaign_id, pub_adgroup_id) {
    this.items_of_type.forEach((p_item, p_index) => {
      if (publisher_id === p_item.publisher_id) {
        this.selected_item_obj[this.getPublisherItemId(p_item)] = false;
        if (p_item.hasOwnProperty('detail') && p_item.detail.length > 0) {
          p_item.detail.forEach((a_item, a_index) => {
            if (pub_account_id === (a_item.chan_pub_id + '_' + a_item.pub_account_id)) {
              this.selected_item_obj[this.getAccountItemId(a_item)] = false;
              if (a_item.hasOwnProperty('detail') && a_item.detail.length > 0) {
                a_item.detail.forEach((c_item, c_index) => {
                  if (pub_campaign_id === c_item.pub_campaign_id) {
                    this.selected_item_obj[this.getCampaignItemId(c_item)] = false;
                    if (c_item.hasOwnProperty('detail') && c_item.detail.length > 0) {
                      c_item.detail.forEach((g_item, g_index) => {
                        if (pub_adgroup_id === g_item.pub_adgroup_id) {
                          this.selected_item_obj[this.getAdgroupItemId(g_item)] = false;
                        }
                      });
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  }

  deleteItem(data: any) {
    switch (Object.keys(data).length) {
      case 1:
        this.deleteAllPublishers(data.publisher_id);
        break;
      case 2:
        this.deleteAllAccounts(data.publisher_id, data.pub_account_id);
        break;
      case 3:
        this.deleteAllCampaigns(data.publisher_id, data.pub_account_id, data.pub_campaign_id);
        break;
      case 4:
        this.deleteAllGroups(data.publisher_id, data.pub_account_id, data.pub_campaign_id, data.pub_adgroup_id);
        break;
    }
    this.itemsChange();
  }

  ngOnInit() {
    this.getTypeData();
    if (this.type_lists && this.type_lists.length > 2) {
      const group_id_obj = {};
      this.item_detail.forEach(item => {
        if (this.item_type === 'adgroup') { // item的结构最长为：publihser_id+chan_pub_id+pub_account_id+pub_campaign_id+pub_adgroup_id
          const id_arr = item.split('_');
          if (id_arr.length === 5) { // 说明有pub_group_id
            id_arr.pop();
            group_id_obj[id_arr.join("_")] = true; // 取的是pub_campaign_id
          }
        }
      });
      const params = { campaign_ids: [] };
      if (Object.keys(group_id_obj).length > 0) {
        params.campaign_ids = Object.keys(group_id_obj);
      }
      this.itemSelectService.getCampaignLists(params, { select_name: '', is_accurate: false }).subscribe(
        (results: any[]) => {
          const results_copy = JSON.parse(JSON.stringify(results));
          if (Object.keys(group_id_obj).length > 0) {
            results_copy.forEach(p_item => {
              if (p_item.hasOwnProperty('detail') && p_item.detail.length > 0) {
                p_item.detail.forEach(a_item => {
                  if (a_item.hasOwnProperty('detail') && a_item.detail.length > 0) {
                    a_item.detail.forEach(c_item => {
                      delete c_item.detail;
                    });
                  }
                });
              }
            });
            this.all_items.campaign = results_copy;
          } else {
            this.all_items.campaign = results;
          }
          this.all_items.adgroup = results;
          if (this.item_type === 'campaign' || this.item_type === 'adgroup') {
            this.items_of_type = JSON.parse(JSON.stringify(this.all_items[this.item_type]));
          }
          this.campaign_loading = true;
        },
        (err: any) => {
          this.campaign_loading = true;
        },
        () => {
          this.campaign_loading = true;
        }
      );
    } else {
      this.campaign_loading = true;
    }
    this.item_detail.forEach(item => {
      this.selected_item_obj[item] = true;
    });

  }

  cancel() {
    if (this.item_detail_sure_array.length) { //有点过确认按钮
      this.item_desc = this.item_detail_sure_array[0];
    } else { //没有点过确认按钮，直接点击取消按钮
      if (this.item_detail.length) {
        this.item_desc = this.item_detail_array[0];
      } else {
        this.item_desc = [];
      }

    }

    this.is_show = false;
    // this.itemNode.nativeElement.style.display = 'none';
    // this.itemNode.nativeElement.style.position = 'static';
    this.itemNode.nativeElement.parentNode.querySelector('.item-select').style.borderBottom = '1px solid #e4e4e4';
  }

  getDesc() {
    const results = [];
    this.item_desc = [];
    for (const p_key in this.selected_detail) {
      if (p_key) {
        const p_item = this.selected_detail[p_key];
        if (p_item.hasOwnProperty('detail') && Object.keys(p_item['detail']).length > 0) {
          for (const a_key in p_item['detail']) {
            if (a_key) {
              const a_item = p_item['detail'][a_key];
              if (a_item.hasOwnProperty('detail') && Object.keys(a_item['detail']).length > 0) {
                for (const c_key in a_item['detail']) {
                  if (c_key) {
                    const c_item = a_item['detail'][c_key];
                    if (c_item.hasOwnProperty('detail') && Object.keys(c_item['detail']).length > 0) {
                      for (const g_key in c_item['detail']) {
                        if (g_key) {
                          const g_item = c_item['detail'][g_key];
                          results.push(p_key + '_' + a_key + '_' + c_key + '_' + g_key);
                          this.item_desc.push(g_item.pub_adgroup_name);
                        }
                      }
                    } else {
                      results.push(p_key + '_' + a_key + '_' + c_key);
                      this.item_desc.push(c_item.pub_campaign_name);
                    }
                  }
                }
              } else {
                results.push(p_key + '_' + a_key);
                this.item_desc.push(a_item.pub_account_name);
              }
            }
          }
        } else {
          results.push(p_key);
          this.item_desc.push(p_item.publisher_name);
        }
      }
    }
    return results;
  }

  done() {

    this.item_detail_array.splice(0, this.item_detail_array.length - 1);
    this.item_detail_sure_array = this.item_detail_array;
    const results = this.getDesc();
    this.is_show = false;
    // this.itemNode.nativeElement.style.display = 'none';
    // this.itemNode.nativeElement.style.position = 'static';
    this.itemNode.nativeElement.parentNode.querySelector('.item-select').style.borderBottom = '1px solid #e4e4e4';
    this.itemSelected.emit({ select_type: this.item_type, select_data: results });
  }

  // 搜索媒体
  getPublisherLists() {
    const resultList = [];
    this.all_items[this.item_type].forEach(item => {
      if (item.publisher_name.indexOf(this.select_name) !== -1) {
        resultList.push(item);
      }
    });
    return resultList;
  }
}
