import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { DataViewAddEditService } from "../../service/data-view-add-edit.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { RegionListService } from "../../../dashboard/service/region-list.service";
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../core/service/auth.service";
import { DataViewFolderFeedService } from '../../service/data-view-folder-feed.service';
import { MenuService } from '../../../../core/service/menu.service';


@Component({
  selector: 'app-data-view-feed-edit',
  templateUrl: './data-view-edit.component.html',
  styleUrls: ['./data-view-edit.component.scss'],
  providers: [DataViewAddEditService, RegionListService, DataViewFolderFeedService]
})

export class DataViewEditComponent implements OnInit {

  @Input() summaryType: any = 'account';
  @Input() parentData: any;
  @Input() publisherId: any = 1;
  @Output() isHidden = new EventEmitter();


  public publisher_model: any = {
    'publisherCount': 1,
    'publisher_array': [],
    'hasForeignPublisher': false,
    'foreignPublisherList': [],
  };

  constructor(
    private _http: DataViewAddEditService,
    private modalService: NzModalService,
    private menuService: MenuService,
    private route: ActivatedRoute,
    private authService: AuthService) {

  }

  public selectData = {
    selected_type: 'current',
    update_type: 'single',
    account_list: [],
    selected_data: [],
    selected_data_ids: [],
    selected_length: 0,
    allViewTableData: {},
    bdCampaignBsType: [],
    byteDanceCampaignType: [],

  };

  public publisherOption = {
    1: '百度',
    6: '广点通',
    7: '今日头条',
    16: '快手',
    17: '超级汇川',
  };

  public accountAllPublishers = [];
  public is_check = 0;
  public monitor_status: any;
  public currentSelectedMenu = ''; // 默认选项
  public newMenuList = [];
  public saveing = false;
  public idsArray = [];



  private ngIndex = {
    'keyword': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id', 'pub_keyword_id'],
    'adgroup': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id'],
    'campaign': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id'],
    'account': ['publisher_id', 'chan_pub_id', 'pub_account_id'],
    'creative': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id', 'pub_creative_id']
  };


  private currentNameKey = {
    'keyword': 'pub_keyword',
    'adgroup': 'pub_adgroup_name',
    'campaign': 'pub_campaign_name',
    'account': 'pub_account_name',
  };


  private parentNameKey = {
    'adgroup': ['publisher', 'pub_account_name', 'pub_campaign_name'],
    'campaign': ['publisher', 'pub_account_name'],
    'account': ['publisher'],
  };

  private ngEditIndex = {
    'keyword': ['chan_pub_id', 'pub_account_id', 'pub_keyword_id'],
    'adgroup': ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id'],
    'campaign': ['chan_pub_id', 'pub_account_id', 'pub_campaign_id'],
    'account': ['chan_pub_id', 'pub_account_id'],
    'creative': ['chan_pub_id', 'pub_account_id', 'pub_creative_id']
  };

  public menuList: any = {
    'publisher_1': {
      "single": [
        { key: 'edit_target_1', 'name': '定向设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'creative', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'account', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'adgroup', 'is_show': true },
      ],
      "batch": [
        { key: 'edit_target_1', 'name': '定向设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'creative', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'account', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'adgroup', 'is_show': true },
      ]
    },
    'publisher_6': {
      "single": [
        { key: 'extension_setting', 'name': '推广设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'edit_target_1', 'name': '定向设置', 'summaryType': 'adgroup', 'is_show': true },

        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'creative', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'account', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'adgroup', 'is_show': true },
      ],
      "batch": [
        { key: 'extension_setting', 'name': '推广设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'edit_target_1', 'name': '定向设置', 'summaryType': 'adgroup', 'is_show': true },

        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'creative', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'account', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'adgroup', 'is_show': true },
      ]
    },
    'publisher_7': {
      "single": [
        { key: 'edit_target_1', 'name': '定向设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'creative', 'is_show': true },

        { key: 'edit_words', 'name': '否词设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'edit_words', 'name': '否词设置', 'summaryType': 'adgroup', 'is_show': true },

        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'account', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'adgroup', 'is_show': true },
      ],
      "batch": [
        { key: 'edit_target_1', 'name': '定向设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'creative', 'is_show': true },


        { key: 'edit_words', 'name': '否词设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'edit_words', 'name': '否词设置', 'summaryType': 'adgroup', 'is_show': true },


        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'account', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'adgroup', 'is_show': true },
      ]
    },
    'publisher_16': {
      "single": [
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'account', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'adgroup', 'is_show': true },
      ],
      "batch": [
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'account', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'adgroup', 'is_show': true },
      ]
    },
    'publisher_17': {
      "single": [
        { key: 'edit_target_1', 'name': '定向设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'account', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'edit_words', 'name': '否词设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'edit_words', 'name': '否词设置', 'summaryType': 'adgroup', 'is_show': true },
      ],
      "batch": [
        { key: 'edit_target_1', 'name': '定向设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'account', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'adgroup', 'is_show': true },
        { key: 'edit_words', 'name': '否词设置', 'summaryType': 'campaign', 'is_show': true },
        { key: 'edit_words', 'name': '否词设置', 'summaryType': 'adgroup', 'is_show': true },
      ]
    },

  };

  ngOnInit() {
    this.publisher_model['publisherCount'] = 1;
    this.publisher_model['publisher_array'].push({
      'name': this.publisherOption[this.menuService.currentPublisherId],
      'value': this.menuService.currentPublisherId
    });


    this.getEditData();
    this.setDataViewList();

    this.authService.getStopBackState().subscribe((result) => {
      if (result === 'true') {
        this.isHidden.emit('false');
      }
    });
  }

  save_state(event) {
    this.saveing = event['is_saving'];
    this.isHidden.emit(event['isHidden']);
  }


  changeSelectedMenu(item) {
    if (item['is_show'] || this.parentData['editParameter'] === 'all') {
      this.currentSelectedMenu = item.key;
    }
  }


  setDataViewList() {
    if (this.parentData.selected_data.length === 1) { //单个编辑
      if (this.menuList.hasOwnProperty('publisher_' + this.publisherId)) {
        this.menuList['publisher_' + this.publisherId].single.forEach(item => {
          if (item.summaryType === this.summaryType) {
            this.newMenuList.push(item);
          }
        });
        this.currentSelectedMenu = this.newMenuList[0].key;
      }

    } else { //批量编辑

      if (this.menuList.hasOwnProperty('publisher_' + this.publisherId)) {
        this.menuList['publisher_' + this.publisherId].batch.forEach(item => {
          if (item.summaryType === this.summaryType) {
            this.newMenuList.push(item);
          }
        });
        this.currentSelectedMenu = this.newMenuList[0].key;
      }

    }

    this.parentData.selected_data.forEach((item) => {
      const keyObj = {};
      this.ngIndex[this.summaryType].forEach((indexKey) => {
        keyObj[indexKey] = item[indexKey];
      });
      this.idsArray.push(keyObj);
    });

  }



  _save(monitor_status?) {
    this.is_check = this.is_check + 1;
    if (monitor_status) {
      this.monitor_status = monitor_status;
    }
  }


  _cancel() {
    localStorage.removeItem('edit_state');
    this.isHidden.emit('false');
  }



  getEditData() {

    if (this.parentData['selected_type'] === 'current' && this.parentData['selected_data'].length) {
      this.selectData.selected_type = 'current';
      this.selectData.selected_data = this.parentData['selected_data'];
      this.selectData.selected_length = this.parentData['selected_data'].length;
      this.selectData.selected_data_ids = this.getEditDataIds(this.parentData['selected_data']);
      this.selectData.bdCampaignBsType = Array.from(new Set(this.selectData.selected_data.map(item => item['pub_campaign_bs_type']).filter((item) => item != undefined)));
      this.selectData.byteDanceCampaignType = Array.from(new Set(this.selectData.selected_data.map(item => item['campaign_type']).filter((item) => item != undefined)));
      this.selectData.account_list = Array.from(new Set(this.selectData.selected_data.map(item => item['chan_pub_id']).filter((item) => item != undefined)));

    } else if (this.parentData['selected_type'] === 'all' && this.parentData['pageInfo'].allCount <= this.parentData['pageInfo'].pageSize) {
      this.selectData.selected_type = 'current';
      this.selectData.selected_data = this.parentData['selected_data'];
      this.selectData.selected_length = this.parentData['selected_data'].length;
      this.selectData.selected_data_ids = this.getEditDataIds(this.parentData['selected_data']);

      this.selectData.bdCampaignBsType = Array.from(new Set(this.selectData.selected_data.map(item => item['pub_campaign_bs_type'])));
      this.selectData.byteDanceCampaignType = Array.from(new Set(this.selectData.selected_data.map(item => item['campaign_type'])));
      this.selectData.account_list = Array.from(new Set(this.selectData.selected_data.map(item => item['chan_pub_id']).filter((item) => item != undefined)));


    } else if (this.parentData['selected_type'] === 'all' && this.parentData['pageInfo'].allCount > this.parentData['pageInfo'].pageSize) {
      this.selectData.selected_type = 'all';
      this.selectData.selected_data = [];
      this.selectData.selected_length = this.parentData['pageInfo'].allCount;
      this.selectData.selected_data_ids = [];
      this.selectData.account_list = [];

      if (this.parentData['allViewTableData']['single_condition'].length) {
        this.parentData['allViewTableData']['single_condition'].forEach((conditionItem) => {
          if (conditionItem['key'] === 'pub_campaign_bs_type' && conditionItem['value'] == 1) {
            this.selectData.bdCampaignBsType = ['普通计划'];
          } else if (conditionItem['key'] === 'pub_campaign_bs_type' && conditionItem['value'] == 2) {
            this.selectData.bdCampaignBsType = ['闪投计划'];
          }

          if (conditionItem['key'] === 'campaign_type' && conditionItem['value'] == 'FEED') {
            this.selectData.byteDanceCampaignType = ['信息流'];
          } else if (conditionItem['key'] === 'pub_campaign_bs_type' && conditionItem['value'] == 'SEARCH') {
            this.selectData.byteDanceCampaignType = ['搜索'];
          }

        });
      }


    }
    if (this.selectData.selected_length == 1) {
      this.selectData.update_type = 'single';
    } else {
      this.selectData.update_type = 'batch';
    }
    this.selectData.allViewTableData = this.parentData['allViewTableData'];
    this.generateSelectDataName(this.selectData.selected_data, this.summaryType);
  }


  private getEditDataIds(data: any[]): any[] {
    const allItems = [];
    data.forEach((item) => {
      const currentItem = [];
      this.ngEditIndex[this.summaryType].forEach((itemIds) => {
        currentItem.push(item[itemIds]);
      });
      return allItems.push(currentItem.join("_"));
    });
    return allItems;
  }

  private generateSelectDataName(data: any[], summaryType: string) {
    data.forEach(item => {
      if (this.currentNameKey[summaryType]) {
        item['currentShowName'] = item[this.currentNameKey[summaryType]];
      }

      if (this.parentNameKey[summaryType]) {
        const tmpName = [];
        this.parentNameKey[summaryType].forEach(nameKey => { tmpName.push(item[nameKey]); });
        item['currentShowParentName'] = "(属于:" + tmpName.join('/') + ")";

      }
    });

  }






}
