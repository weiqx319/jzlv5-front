import { deepCopy } from '@jzl/jzl-util';
import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { KeywordStructureService } from '../keyword-structure.service';

import { environment } from '../../../../environments/environment';
import {CustomDatasService} from "../../../shared/service/custom-datas.service";

@Component({
  selector: 'app-keyword-structure',
  templateUrl: './keyword-structure.component.html',
  styleUrls: ['./keyword-structure.component.scss'],
  providers: [KeywordStructureService]
})
export class KeywordStructureComponent implements OnInit {
  @Input() sourceSummary;
  @Input() statusFilterOption;
  public searchTypeObj = {
    'keyword': { key: 'pub_keyword', name: '关键词' },
    'creative': { key: 'pub_creative_title', name: '创意' }
  };

  public showList = false;
  public submitCheck = 1;
  public loading = false;
  public taskListData = [];
  public total = 0;
  public currentPage = 1;
  public pageSize = 30;
  public noResultHeight = document.body.clientHeight - 247;

  public statusMap = {
    0: '待生成', 1: '处理中', 2: '成功', 3: '失败'
  };

  //任务名称
  public taskName = `搜索__${new Date().toLocaleString()}`;
  // 搜索关键词
  public searchValue = '';
  public deeplinkUrl='';
  public pcDestinationUrl='';
  public wapDestinationUrl='';
  public wapDestinationOption='=';
  public pcDestinationOption='=';
  public deeplinkOption='=';
  public accountOption='=';
  public campaignOption='=';
  public adgroupOption='=';
  public accountValue='';
  public campaignValue='';
  public adgroupValue='';
  public priceValue=null;
  public priceValueArr=[null,null];
  public priceOption='>';

  public priceOptions= [
    { key: '>', name: '大于' },
    { key: '=', name: '等于' },
    { key: '>=', name: '大于等于' },
    { key: '<', name: '小于' },
    { key: '<=', name: '小于等于' },
    { key: 'between', name: '介于' },
  ];

  // 关键词搜索方式默认
  public keywordOption = "=";
  // 关键词搜索方式
  public keywordOptions = [
    { key: "=", name: "为" },
    { key: "!=", name: "不为" },
    { key: "like", name: "包含" },
    { key: "notlike", name: "不包含" }
  ];
  // 状态
  public statusOption = [];
  public matchTypeOption=[];
  public matchTypeOptions=[];

  @ViewChild('quickEditButton') quickEditButton: any;


  constructor(
    private _message: NzMessageService,
    private KeywordStructureService: KeywordStructureService,
    private customDatasService:CustomDatasService
  ) {

  }

  ngOnInit() {
    this.matchTypeOptions=this.customDatasService.defaultSemItemFilters['match_type']['filterOption'];
  }

  // 重置
  resetSearchData() {
    this.searchValue = '';
    this.keywordOption = "=";
    this.statusOption = [];
    this.taskName = `搜索__${new Date().toLocaleString()}`;
    this.matchTypeOption=[];
    this.priceOption='>';
    this.deeplinkUrl='';
    this.pcDestinationUrl = '';
    this.wapDestinationUrl = '';
    this.deeplinkOption = "=";
    this.pcDestinationOption = "=";
    this.wapDestinationOption = "=";
    this.priceValue = null;
    this.priceValueArr=[null,null];
    this.accountOption='=';
    this.campaignOption='=';
    this.adgroupOption='=';
    this.accountValue='';
    this.campaignValue='';
    this.adgroupValue='';
  }
  //保存搜索
  saveSearchData() {
    const singleCondition = {
      searchCondition: {// 关键词、创意
        ...this.searchTypeObj[this.sourceSummary],
        "data_type": "pub_attr_data",
        "type": "multiValue",
        "op": this.keywordOption,
        "value": this.searchValue.trim() === '' ? [] : this.searchValue.trim().split('\n'),
      },
      statusCondition: { // 状态
        "key": "status",
        "data_type": "pub_attr_data",
        "name": "状态",
        "type": "checkboxList",
        "op": "in",
        "value": this.statusOption
      },
      matchTypeCondition: {
        data_type: "pub_attr_data",
        key: "match_type_code",
        name: "匹配模式",
        op: "in",
        relishKey: "match_type",
        type: "checkboxList",
        value: this.matchTypeOption
      },
      pcUrlCondition:{
        data_type: "pub_attr_data",
        key: "pc_destination_url",
        name: "访问URL",
        op: this.pcDestinationOption,
        type: "multiValue",
        value: this.pcDestinationUrl.trim() === '' ? [] : this.pcDestinationUrl.trim().split('\n'),
      },
      wapUrlCondition:{
        data_type: "pub_attr_data",
        key: "wap_destination_url",
        name: "移动访问Url",
        op: this.wapDestinationOption,
        type: "multiValue",
        value: this.wapDestinationUrl.trim() === '' ? [] : this.wapDestinationUrl.trim().split('\n'),
      },
      deepLinkCondition:{
        data_type: "pub_attr_data",
        key: "deeplink_url",
        name: "应用调起网址",
        op: this.deeplinkOption,
        type: "multiValue",
        value: this.deeplinkUrl.trim() === '' ? [] : this.deeplinkUrl.trim().split('\n'),
      },
      priceCondition:{
        data_type: "pub_attr_data",
        key: "price",
        name: "当前出价",
        op: this.priceOption,
        type: "numberFilter",
        value:this.priceOption==='between'?this.priceValueArr.join('-'):this.priceValue,
      },
    campaignCondition:{
      "key": "pub_campaign_name",
      "data_type": "pub_attr_data",
      "name": "计划",
      "type": "multiValue",
      "op": this.campaignOption,
      "value": this.campaignValue.trim() === '' ? [] : this.campaignValue.trim().split('\n'),
    },
      accountCondition:{
      "key": "pub_account_name",
      "data_type": "pub_attr_data",
      "name": "账户",
      "type": "multiValue",
      "op": this.accountOption,
      "value":this.accountValue.trim() === '' ? [] : this.accountValue.trim().split('\n'),
    },
      adgroupCondition:{
      "key": "pub_adgroup_name",
      "data_type": "pub_attr_data",
      "name": "单元",
      "type": "multiValue",
      "op": this.adgroupOption,
      "value":this.adgroupValue.trim() === '' ? [] : this.adgroupValue.trim().split('\n'),
    }

    };

    // 请求参数
    const searchParams = {
      "search_name": this.taskName,
      'search_type': this.sourceSummary,
      "sheets_setting": {
        "table_setting": {
          "single_condition": []
        }
      }
    };

    for (const key in singleCondition) {
      if (singleCondition[key].value&&(singleCondition[key].value.length > 0||singleCondition[key].value>0)) {
        searchParams.sheets_setting.table_setting.single_condition.push(singleCondition[key]);
      }
    }

    if (searchParams.sheets_setting.table_setting.single_condition.length === 0) {
      this._message.warning('搜索项不能为空！');
      return false;
    }

    this.KeywordStructureService.addSearchKeyWord(searchParams).subscribe((results: any) => {
      if (results.status_code !== 200) {
        this._message.info('搜索失败');
      } else {
        this._message.success('搜索成功');
        this.resetSearchData();
        this.refreshData();
      }
    },
      (err: any) => {
        this._message.error('系统异常');
      },
      () => {
      }
    );
  }

  // 打开列表
  showStructureList() {
    this.getOperationTaskList();
    this.showList = true;
  }
  // 关闭列表
  closeStructureList() {
    this.showList = false;
  }

  // 获取列表
  getOperationTaskList() {
    this.loading = true;
    const reqParams = {
      'page': this.currentPage,
      'count': this.pageSize,
      'search_type': this.sourceSummary
    };
    this.KeywordStructureService.getStructureList(reqParams)
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.taskListData = [];
            this.total = 0;
          } else {
            this.taskListData = results['data']['detail'];
            this.total = results['data']['detail_count'];
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
        },
        () => { }
      );
  }
  // 刷新
  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this.getOperationTaskList();
  }

  // 下载
  downloadList(searchId) {
    this.KeywordStructureService.downLoadSearchRecord(searchId).subscribe((results: any) => {
      if (results.status_code !== 200) {
        this._message.info('当前搜索记录不可下载');
      } else {
        const cacheKey = results['data']['cache_key'];
        window.open(environment.SERVER_API_URL + '/files_down/' + cacheKey);
      }
    },
      (err: any) => {
        this._message.error('系统异常');
      },
      () => {
      }
    );

  }

}
