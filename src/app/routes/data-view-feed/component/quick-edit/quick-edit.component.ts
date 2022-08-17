import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../core/service/auth.service";
import { RegionListService } from "../../../dashboard/service/region-list.service";
import { DataViewAddEditService } from "../../service/data-view-add-edit.service";
import { DataViewEditWrapService } from "../../service/data-view-edit-wrap.service";
import { DataViewService } from "../../service/data-view.service";

@Component({
  selector: 'app-quick-edit',
  templateUrl: './quick-edit.component.html',
  styleUrls: ['./quick-edit.component.scss'],
  providers: [DataViewAddEditService, RegionListService, DataViewEditWrapService],
})

export class QuickEditComponent implements OnInit {
  @ViewChild('budgetTemplate') budgetTemplate;
  @ViewChild('quickEditButton') quickEditButton: any;
  @Input() parentData: any;
  @Output() isHidden = new EventEmitter();
  @Input() summary_type: any;
  @Input() selectedType: any;
  @Input() selected: any;
  @Input() pageInfo: any;
  @Input() publisher_id: any;
  @Input() viewTableData: any;
  public regionList: any = [];
  public selectData = {
    selected_type: 'current',
    selected_data: [],
    selected_data_ids: [],
    select_ids_name_map: {},
    selected_length: 0,
    allViewTableData: {},
  };

  public submitCheck = 1;
  public checkErrorTip = {
    time_series: {
      is_show: false,
      tip_text: '请选择特定时间或选择不限'
    },
    region: {
      is_show: false,
      tip_text: '请选择地域或选择不限'
    },
    xhs_budget: {
      is_show: false,
      tip_text: '请填写预算或选择不限，预算必须大于50'
    },
  }

  public otherSummaryTypeName = {
    7: {
      campaign: '广告组',
      adgroup: '计划',
    },
    17: {
      campaign: '推广组',
      adgroup: '计划',
    },
    19: {
      campaign: '推广任务',
      adgroup: '广告',
    },
    6: {
      campaign: '推广计划',
      adgroup: '广告',
    },
    20: {
      campaign: '广告系列',
      adgroup: '广告组',
    }

  }
  public summary_type_name = {
    publisher: '媒体',
    account: '账户',
    campaign: '计划',
    adgroup: '单元',
    keyword: '关键词',
    creative: '创意',
    search_keyword: '搜索词',
    target: '定向',
  };
  constructor(
    private _http: DataViewAddEditService,
    private _message: NzMessageService,
    private dataViewWrapService: DataViewEditWrapService,
    private modalService: NzModalService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private regionListService: RegionListService,
    private dataViewService: DataViewService,) {
    this.regionList = this.regionListService.getXhsRegionLists();
  }

  public price_range = {
    1: { min: 0.01, max: 999.99 },
    2: { min: 0.01, max: 999.99 },
    3: { min: 0.3, max: 999.99 },
    4: { min: 0.45, max: 999.99 },
    5: { min: 0.45, max: 999.99 },
    24: { min: 0.3, max: 999.99 },
  };
  public postSummaryIds = {
    publisher_1: {
      account: ['chan_pub_id', 'pub_account_id'],
      campaign: ['chan_pub_id', 'pub_account_id', 'pub_campaign_id'],
      adgroup: ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id'],
      creative: ['chan_pub_id', 'pub_account_id', 'pub_creative_id'],
    },
    publisher_6: {
      account: ['chan_pub_id', 'pub_account_id'],
      campaign: ['chan_pub_id', 'pub_account_id', 'pub_campaign_id'],
      adgroup: ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id'],
      creative: ['chan_pub_id', 'pub_account_id', 'pub_ad_id'],
    },
    publisher_7: {
      account: ['chan_pub_id', 'pub_account_id'],
      campaign: ['chan_pub_id', 'pub_account_id', 'pub_campaign_id'],
      adgroup: ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id'],
      creative: ['chan_pub_id', 'pub_account_id', 'pub_creative_id'],
    },
    publisher_17: {
      account: ['chan_pub_id', 'pub_account_id'],
      campaign: ['chan_pub_id', 'pub_account_id', 'pub_campaign_id'],
      adgroup: ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id'],
      creative: ['chan_pub_id', 'pub_account_id', 'pub_creative_id'],
      keyword: ['chan_pub_id', 'pub_account_id', 'pub_keyword_id'],
    },
    publisher_24: {
      account: ['chan_pub_id', 'pub_account_id'],
      campaign: ['chan_pub_id', 'pub_account_id', 'pub_campaign_id'],
      adgroup: ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id'],
      creative: ['chan_pub_id', 'pub_account_id', 'pub_creative_id'],
      keyword: ['chan_pub_id', 'pub_account_id', 'pub_keyword_id'],
    },
  };
  public postSummaryNames = {
    publisher_24: {
      account: ['chan_pub_id', 'pub_account_id', 'pub_account_name'],
      campaign: ['chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_account_name', 'pub_campaign_name'],
      adgroup: ['chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
      creative: ['chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id', 'pub_creative_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      keyword: ['chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id', 'pub_creative_id', 'pub_keyword_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name', 'pub_keyword'],
    },
  };

  public editItemAllAndOr = {
    publisher_1: {
      account: [
        { name: '预算', value: 'budget' },
      ],
      campaign: [
        { name: '投放状态', value: 'pause' },
        { name: '预算', value: 'budget' },
      ],
      adgroup: [
        { name: '投放状态', value: 'pause' },
        { name: '出价', value: 'price' },
        { name: '目标转化出价', value: 'ocpc_bid' },
      ],
      creative: [
        { name: '投放状态', value: 'pause' },
      ],
    },
    publisher_6: {
      account: [
        { name: '预算', value: 'budget' },
      ],
      campaign: [
        { name: '投放状态', value: 'pause' },
        { name: '预算', value: 'budget' },
        { name: '推广计划名称', value: 'name' },
      ],
      adgroup: [
        { name: '投放状态', value: 'pause' },
        { name: '预算', value: 'budget' },
        { name: '出价', value: 'price' },
        { name: '广告名称', value: 'name' },
      ],
      creative: [
        { name: '投放状态', value: 'pause' },
        { name: '应用直达链接', value: 'deep_link_url' },
        { name: '落地页', value: 'link_page_spec' },
      ],
    },
    publisher_7: {
      account: [
        { name: '预算', value: 'budget' },
      ],
      campaign: [
        { name: '投放状态', value: 'pause' },
        { name: '预算', value: 'budget' },
      ],
      adgroup: [
        { name: '投放状态', value: 'pause' },
        { name: '预算', value: 'budget' },
        { name: '出价', value: 'price' },
        { name: '落地页URL', value: 'external_url' },
        { name: '应用直达链接', value: 'open_url' },
        { name: '安卓详情页', value: 'web_url' },
      ],
      keyword: [
        { name: '投放状态', value: 'pause' },
        { name: '出价', value: 'price' },
      ],
      creative: [
        { name: '投放状态', value: 'pause' },
      ],
    },
    publisher_17: {
      account: [
        { name: '预算', value: 'budget' },
      ],
      campaign: [
        { name: '投放状态', value: 'pause' },
        { name: '预算', value: 'budget' },
      ],
      adgroup: [
        { name: '投放状态', value: 'pause' },
        { name: '预算', value: 'budget' },
        { name: '出价', value: 'price' },
      ],
      creative: [
        { name: '投放状态', value: 'pause' },
        { name: '创意标签', value: 'label' },
        { name: '点击监测链接', value: 'click_monitor_url' },
      ],
      keyword: [
        { name: '启停', value: 'pause' },
        { name: '匹配模式', value: 'matchType' },
        { name: '出价', value: 'price' },
        { name: '目标网址', value: 'destinationUrl' }
      ],
    },
    publisher_24: {
      account: [
        { name: '预算', value: 'budget' },
      ],
      campaign: [
        { name: '投放状态', value: 'pause' },
        { name: '预算', value: 'budget' },
      ],
      adgroup: [
        { name: '投放状态', value: 'pause' },
        { name: '推广时段', value: 'time_interval' },
        { name: '推广地域', value: 'region' },
        // { name: '预算', value: 'budget' },
        // { name: '出价', value: 'price' },
      ],
      creative: [
        { name: '投放状态', value: 'pause' },
        { name: '封面优选', value: 'mask_prefer' },
        // { name: '点击监测链接', value: 'click_monitor_url' },
      ],
      keyword: [
        { name: '投放状态', value: 'pause' },
        { name: '匹配模式', value: 'match_type' },
        { name: '出价', value: 'price' },
      ],
    },
  };

  public quickEditParam = {
    showQuickEdit: false,
    quickEditItem: "",
    publisherData: null,
    publisherId: null,
    showData: {
      pause: false,
      price: null,
      match_type: null,
      ocpc_bid: null,
    },
    result: {} as any,
    editItem: [],
    is_warning: false,
    warning_info: '',
    clickPageCount: 0,
    saveing: false,

  };

  public matchTypeData = [];

  public isConfirmVisible = false;

  @HostListener('document:keyup', ['$event'])
  quickEditKeyUp(event) {
    if (event && event.ctrlKey && event.key === 'b' && this.quickEditButton) {
      this.quickEditButton.elementRef.nativeElement.click();
    }
  }

  getEditData() {
    if (this.selectedType === 'current' && this.selected.length) {
      this.selectData.selected_type = 'current';
      this.selectData.selected_data = this.selected;
      this.selectData.selected_length = this.selected.length;
      this.selectData.selected_data_ids = this.getEditDataIds(this.selected);
      if (this.publisher_id == 24) {
        this.getEditDataNames(this.selected);
      }

    } else if (this.selectedType === 'all' && this.pageInfo.allCount <= this.pageInfo.pageSize) {
      this.selectData.selected_type = 'current';
      this.selectData.selected_data = this.selected;
      this.selectData.selected_length = this.selected.length;
      this.selectData.selected_data_ids = this.getEditDataIds(this.selected);
      if (this.publisher_id == 24) {
        this.getEditDataNames(this.selected);
      }
    } else if (this.selectedType === 'all' && this.pageInfo.allCount > this.pageInfo.pageSize) {
      this.selectData.selected_type = 'all';
      this.selectData.selected_data = [];
      this.selectData.selected_length = this.pageInfo.allCount;
      this.selectData.selected_data_ids = [];
      this.selectData.select_ids_name_map = {};

    }
    if (this.selectData.selected_length == 1) {
      this.quickEditParam.showData.price = this.selected[0]["price"];
      this.quickEditParam.showData.ocpc_bid = this.selected[0]["ocpc_bid"];
    }

    this.selectData.allViewTableData = this.viewTableData;
  }

  private getEditDataIds(data: any[]): any[] {
    const allItems = [];
    data.forEach((item) => {
      const currentItem = [];
      this.postSummaryIds['publisher_' + this.publisher_id][this.summary_type].forEach((itemIds) => {
        currentItem.push(item[itemIds]);
      });
      return allItems.push(currentItem.join("_"));
    });
    return allItems;
  }

  private getEditDataNames(data: any[]) {
    data.forEach((item) => {
      // const currentItemName = [];
      const currentItemId = [];
      this.postSummaryIds['publisher_' + this.publisher_id][this.summary_type].forEach((itemIds) => {
        currentItemId.push(item[itemIds]);
      });
      // this.postSummaryNames['publisher_' + this.publisher_id][this.summary_type].forEach((itemNames) => {
      //   currentItemName.push(item[itemNames]);
      // });
      // this.selectData.select_ids_name_map[currentItemId.join("_")] = currentItemName.join("_");

      this.selectData.select_ids_name_map[currentItemId.join("_")] = {};
      this.postSummaryNames['publisher_' + this.publisher_id][this.summary_type].forEach((itemNames) => {
        this.selectData.select_ids_name_map[currentItemId.join("_")][itemNames] = item[itemNames];
      });
    });
  }

  quickEdit() {
    this.getEditData();
    this.quickEditParam.editItem = [];
    if (this.selected.length === 0) {
      this._message.error('请选择' + this.summary_type_name[this.summary_type]);
      return;
    } else {
      this.quickEditParam.publisherId = this.publisher_id * 1;
      this.quickEditParam.editItem = this.editItemAllAndOr['publisher_' + this.publisher_id][this.summary_type];
      this.quickEditParam.quickEditItem = this.quickEditParam.editItem[0]['value'];
    }
    this._getMatchTypeList(this.quickEditParam.publisherId);
  }

  _getMatchTypeList(publisher_id) {
    this.matchTypeData = this.dataViewService.matchTypes[publisher_id];
    if (this.matchTypeData) {
      this.quickEditParam.showData.match_type = this.matchTypeData[0]['value'];
    }
  }

  cancelQuickEdit() {
    this.quickEditParam.showQuickEdit = false;
    this.initWarning();
  }
  // 初始化提示信息
  initWarning() {
    this.quickEditParam.is_warning = false;
    this.quickEditParam.warning_info = '';
  }
  quickResult(event) {
    this.quickEditParam.result = event;
  }


  quickEditOk(behavior = "click") {
    if (this.checkPage()) return;
    if (this.quickEditParam.quickEditItem == 'budget') {//预算二次确认
      this.isConfirmVisible = true;
    } else {
      this.quickEditSubmit();
    }
  }

  quickEditSubmit() {
    const postData = { data: {} };
    this.quickEditParam.saveing = false;
    this.initWarning();

    if (!this.quickEditParam.is_warning) {
      postData['update_type'] = 'batch';
      postData["select_type"] = this.selectData.selected_type;
      postData["select_data_type"] = this.summary_type;
      postData["select_ids"] = this.selectData.selected_data_ids;
      postData["select_ids_name_map"] = this.selectData.select_ids_name_map;

      if (this.selectData.selected_type == 'all') {
        postData["sheets_setting"] = { table_setting: this.selectData.allViewTableData };
      }
      if (this.selected.length === 1) {
        postData['update_type'] = 'single';
      }
      postData['data'][this.quickEditParam.quickEditItem] = { is_edit: true, value: null };
      if (this.quickEditParam.result.hasOwnProperty('type') && this.quickEditParam.result.type == this.quickEditParam.quickEditItem) {
        postData['data'][this.quickEditParam.quickEditItem].value = this.quickEditParam.result.result.value;
      }
      if (this.quickEditParam.result.hasOwnProperty('type') && this.quickEditParam.result.type == 'price_batch' && this.quickEditParam.quickEditItem == 'price') {
        postData['data'][this.quickEditParam.quickEditItem] = { ...postData['data'][this.quickEditParam.quickEditItem], ...this.quickEditParam.result.result };
      }

      if (this.quickEditParam.result.hasOwnProperty('type') && this.quickEditParam.result.type == 'price_single' && this.quickEditParam.quickEditItem == 'price') {
        postData['data'][this.quickEditParam.quickEditItem] = { ...postData['data'][this.quickEditParam.quickEditItem], ...this.quickEditParam.result.result };
      }

      if (this.quickEditParam.result.hasOwnProperty('type') && this.quickEditParam.result.type == 'ocpc_bid' && this.quickEditParam.quickEditItem == 'ocpc_bid') {
        postData['data'][this.quickEditParam.quickEditItem] = { ...postData['data'][this.quickEditParam.quickEditItem], ...this.quickEditParam.result.result };
      }

      if (this.quickEditParam.result.hasOwnProperty('type') && this.quickEditParam.result.type == 'price_single' && this.quickEditParam.quickEditItem == 'ocpc_bid') {
        postData['data'][this.quickEditParam.quickEditItem] = { ...postData['data'][this.quickEditParam.quickEditItem], ...this.quickEditParam.result.result };
      }

      if (this.quickEditParam.result.hasOwnProperty('type') && this.quickEditParam.result.type == 'edit_or_replace_batch') {
        postData['data'][this.quickEditParam.quickEditItem] = { ...postData['data'][this.quickEditParam.quickEditItem], ...this.quickEditParam.result.result };
      }
      if (this.quickEditParam.result.hasOwnProperty('type') && this.quickEditParam.result.type == 'click_monitor_url') {
        postData['data'][this.quickEditParam.quickEditItem] = { ...postData['data'][this.quickEditParam.quickEditItem], ...this.quickEditParam.result.result };
      }
      if (this.quickEditParam.result.hasOwnProperty('type') && this.quickEditParam.result.type == 'label') {
        postData['data'][this.quickEditParam.quickEditItem] = { ...postData['data'][this.quickEditParam.quickEditItem], ...this.quickEditParam.result.result };
      }
      if (this.quickEditParam.result.hasOwnProperty('type') && this.quickEditParam.result.type == 'match_type') {
        postData['data'][this.quickEditParam.quickEditItem] = { ...postData['data'][this.quickEditParam.quickEditItem], ...this.quickEditParam.result.result };
      }
      if (this.quickEditParam.result.hasOwnProperty('type') && this.quickEditParam.result.type == 'budget') {
        postData['data'][this.quickEditParam.quickEditItem] = { ...postData['data'][this.quickEditParam.quickEditItem], ...this.quickEditParam.result.result };
        if (this.quickEditParam.result.result.hasOwnProperty('cron_setting')) {
          postData['cron_setting'] = this.quickEditParam.result.result['cron_setting'];
          delete postData['data'][this.quickEditParam.quickEditItem]['cron_setting'];
        }
      }

      if (this.quickEditParam.result.hasOwnProperty('type') && this.quickEditParam.result.type == 'region') {
        postData['data'][this.quickEditParam.quickEditItem] = { ...postData['data'][this.quickEditParam.quickEditItem], ...this.quickEditParam.result.result };
      }
      if (this.quickEditParam.result.hasOwnProperty('type') && this.quickEditParam.result.type == 'time_interval') {
        postData['data'][this.quickEditParam.quickEditItem] = { ...postData['data'][this.quickEditParam.quickEditItem], ...this.quickEditParam.result.result };
      }

      switch (this.summary_type) {
        case 'account':
          this.dataViewWrapService.editAccount(this.publisher_id, postData, postData['update_type']).subscribe((result) => {
            if (result) {
              this.quickEditParam.showQuickEdit = false;
              if (this.quickEditParam.result.type == 'budget' && this.publisher_id == 6) {
                this.isConfirmVisible = false;
              }
            }
          });
          break;
        case 'campaign':
          this.dataViewWrapService.editCampaign(this.publisher_id, postData, postData['update_type']).subscribe((result) => {
            if (result) {
              this.quickEditParam.showQuickEdit = false;
            }
          });
          break;
        case 'adgroup':
          this.dataViewWrapService.editAdgroup(this.publisher_id, postData, postData['update_type']).subscribe((result) => {
            if (result) {
              this.quickEditParam.showQuickEdit = false;
            }
          });
          break;
        case 'creative':
          this.dataViewWrapService.editCreative(this.publisher_id, postData, postData['update_type']).subscribe((result) => {
            if (result) {
              this.quickEditParam.showQuickEdit = false;
            }
          });
          break;
        case 'editKeyword':
          this.dataViewWrapService.editKeyword(this.publisher_id, postData, postData['update_type']).subscribe((result) => {
            if (result) {
              this.quickEditParam.showQuickEdit = false;
            }
          });
          break;
        case 'keyword':
          this.dataViewWrapService.editKeyword(this.publisher_id, postData, postData['update_type']).subscribe((result) => {
            if (result) {
              this.quickEditParam.showQuickEdit = false;
            }
          });
          break;
      }

    }
  }


  ngOnInit(): void {
    Object.assign(this.summary_type_name, this.otherSummaryTypeName[this.publisher_id]);
  }

  handleCancel() {
    this.isConfirmVisible = false;
  }

  quickConfirmEditSubmit() {
    this.quickEditSubmit();
    this.isConfirmVisible = false;
  }

  // 验证值
  checkPage() {
    //编辑出价
    if (this.quickEditParam.quickEditItem === 'price') {
      let valueKey = 'value';
      if (this.price_range[this.quickEditParam.publisherId]) {
        //出价有范围限制
        if (this.publisher_id === 24) {//小红书
          if (this.quickEditParam.result['result']['modify_type'] !== 1) {
            valueKey = this.quickEditParam.result['result']['action'] === 1 ? 'maxPrice' : 'minPrice';
            if (!this.quickEditParam.result['result']['value']) {
              this.quickEditParam.is_warning = true;
              this.quickEditParam.warning_info = '出价变化值不能为空';
              return true;
            }
          }
        }

        if (!this.quickEditParam.result['result'][valueKey]
          || this.quickEditParam.result['result'][valueKey] < this.price_range[this.quickEditParam.publisherId]['min']
          || this.quickEditParam.result['result'][valueKey] > this.price_range[this.quickEditParam.publisherId]['max']) {
          this.quickEditParam.is_warning = true;
          this.quickEditParam.warning_info = '出价不能为空且范围为' + this.price_range[this.quickEditParam.publisherId]['min'] + '~' + this.price_range[this.quickEditParam.publisherId]['max'];
          return true;
        }
      } else {
        //出价无范围限制
        if (!this.quickEditParam.result['result'][valueKey] || this.quickEditParam.result['result'][valueKey] < 0) {
          this.quickEditParam.is_warning = true;
          this.quickEditParam.warning_info = '出价不能为空且必须大于0';
          return true;
        }
      }
    }
    // 编辑预算
    if (this.quickEditParam.quickEditItem == 'budget') {
      if (this.publisher_id === 24) {
        if (this.quickEditParam.result.result.type === 2 && !this.quickEditParam.result.result.value) {
          this.checkErrorTip.xhs_budget.is_show = true;
          return true;
        } else {
          this.checkErrorTip.xhs_budget.is_show = false;
        }
      } else {
        this.budgetTemplate.budgetCheckPage();
        if (this.budgetTemplate.editBudgetParam.iswraing) {
          return true;
        }
      }
    }

    // 编辑地域
    if (this.quickEditParam.quickEditItem == 'region') {
      if (this.quickEditParam.result.result.type === 2 && this.quickEditParam.result.result.value.length < 1) {
        this.checkErrorTip.region.is_show = true;
        return true;
      } else {
        this.checkErrorTip.region.is_show = false;
      }
    }

    // 编辑时段
    if (this.quickEditParam.quickEditItem == 'time_interval') {
      if (this.quickEditParam.result.result.type === 2 && !this.quickEditParam.result.result.value.includes('1')) {
        this.checkErrorTip.time_series.is_show = true;
        return true;
      } else {
        this.checkErrorTip.time_series.is_show = false;
      }
    }
  }
}
