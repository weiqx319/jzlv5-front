import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef, ViewChild, ViewChildren, ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { LocalStorageService } from "ngx-webstorage";
import { deepCopy, isNull, isNumber, isObject, isUndefined, minutesToNum } from "@jzl/jzl-util";
import { AuthService } from "../../core/service/auth.service";
import { generateTimeResult, generateTimeTip } from '@jzl/jzl-util';
import { DataViewService } from "./service/data-view.service";
import { ViewItemService } from "./service/view-item.service";

import { Observable, Subject, Subscription } from "rxjs";
import { MenuService } from '../../core/service/menu.service';
import { ViewBookmarkComponent } from "../../module/bookmark/components/view-bookmark.component";
import { AppBookmarkModalComponent } from "../../module/bookmark/modal/app-bookmark-modal.component";
import { AppBookmarkSaveModalComponent } from "../../module/bookmark/modal/app-bookmark-save-modal/app-bookmark-save-modal.component";
import { EditMessageComponent } from "../../module/edit-message/edit-message.component";
import { ItemSelectService } from "../../module/item-select/service/item-select.service";
import { NotifyService } from "../../module/notify/notify.service";
import { TableQueryFeedComponent } from "../../module/table-setting/components/table-query/table-query-feed.component";
import { TableFieldFeedComponent } from "../../module/table-setting/components/table-field/table-field-feed.component";
import { TableItemFeedService } from "../../module/table-setting/service/table-item-feed.service";
import { TableTimeComponent } from '../../module/table-time/components/table-time/table-time.component';
import { ReportService } from "../report-feed/service/report.service";
import { DataViewEditWrapService } from "./service/data-view-edit-wrap.service";
import { DataViewFolderFeedService } from './service/data-view-folder-feed.service';
import { ViewBatchUploadComponent } from '../../module/batch-upload/components/view-batch-upload/view-batch-upload.component';
import { explainTableFeedField } from '../../shared/util/util';
import { SetAutomationTacticComponent } from './modal/set-automation-tactic/set-automation-tactic.component';
import { QueryRankingComponent } from "../../module/query-ranking/query-ranking.component";
import { environment } from "../../../environments/environment";
import { CustomDatasService } from "../../shared/service/custom-datas.service";
import { differenceInCalendarDays, format } from "date-fns";
@Component({
  selector: 'app-keyword',
  templateUrl: './data-view.component.html',
  styleUrls: [
    '../../../styles/routes/routes.scss',
    './data-view.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [TableItemFeedService, DataViewEditWrapService, DataViewFolderFeedService],
})
export class DataViewComponent implements OnInit {
  private sub = new Subscription();
  public userSelectedOper: {
    select_uid: number;
    select_cid: number;
    role_id: number;
  } = { select_uid: 0, select_cid: 0, role_id: 0 };
  public viewChartShow = false;
  public showChartType = 'day';
  public chartItems = [];

  public chartOptions: any;
  public apiData = [];
  public dataMessages = {
    emptyMessage: `
    <div class="empty-content">
      <span>无符合要求的数据</span>
    </div>
  `,
  };

  public dataAnalysisTitleKey = {
    account: 'pub_account_name',
    campaign: 'pub_campaign_name',
    adgroup: 'pub_adgroup_name',
    keyword: 'pub_keyword',
    publisher: 'publisher',
    creative: 'pub_creative_name',
    advertiser: 'advertiser_name',
    department: 'department',
  };

  public hourState = [];

  public defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];
  public endLocked_items: any;
  public viewTableData = {
    report_type: 'basic_report',
    summary_type: 'campaign',
    selected_items: [],
    selected_items_chart: [],
    locked_items: [],
    condition: [],
    single_condition: [],
    sort_item: { key: 'pub_cost', dir: 'desc' },
    data_range: [],
    all_summary: false,
    is_compare: false,
    summary_date: 'day:1:6',
    summary_date_compare: 'day:8:6',
    summary_date_alias: '',
    summary_date_compare_alias: '',
    other_compare_date_list: [],
    time_grain: 'summary',
    main_range: 'leftJoin',
    main_device: '0',
    hidden_condition: false,
  };

  public time_grain = 'summary';
  public time_grain_filter = 'summary';
  public summary_type_name = {
    publisher: '媒体',
    account: '账户',
    campaign: '计划',
    adgroup: '单元',
    keyword: '关键词',
    creative: '创意',
    search_keyword: '搜索词',
    target: '定向',
    advertiser: '广告主',
    department: '事业部',
  };
  private summary_type_Key = {
    account: 'pub_account_name',
    account_hour: 'pub_account_name',
    campaign: 'pub_campaign_name',
    campaign_hour: 'pub_campaign_name',
    adgroup: 'pub_adgroup_name',
    adgroup_hour: 'pub_adgroup_name',
    creative: 'pub_creative_name',
    creative_hour: 'pub_creative_name',
  };
  public channel_id = 2;
  public viewReportSetting = {
    report_name: '自定义报表',
    report_data_type: 2,
    channel_id: this.channel_id,
    report_format: 'excel',
    report_freq: 'now',
    email_list: '',
    sheets_setting: [],
    time_grain: 'summary',
  };
  public source_summary = 'campaign';

  public showCreateReport = false;
  public reportPosting = false;

  public tableHeight = document.body.clientHeight - 60 - 65 - 30;
  public rowHeight = 40;
  public summaryHeight = 40;
  private defaultRowHeight = 40;

  public is_refresh = 0;

  public rows = [];
  public summaryData = {};
  public selected = [];
  public selectedLength = 0;
  public selectedType = 'current';

  public columns = [];
  public timeDesc = '';

  public cron_time;
  public cron_minute = 0;

  public cronMinuteList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 55];

  @ViewChild('chkHeader', { static: true }) chkHeader: TemplateRef<any>;
  @ViewChild('filterHeader', { static: true }) filterHeader: TemplateRef<any>;
  @ViewChild('dataAnalysisHeader', { static: true }) dataAnalysisHeader: TemplateRef<any>;
  @ViewChild('refreshRankingHeader', { static: true }) refreshHeader: TemplateRef<any>;
  @ViewChild('refreshRankingCell', { static: true }) refreshCell: TemplateRef<any>;
  @ViewChild('dataAnalysisCell', { static: true }) dataAnalysisCell: TemplateRef<any>;
  @ViewChild('operateCell', { static: true }) operateCell: TemplateRef<any>;

  @ViewChild('chkCell', { static: true }) chkCell: TemplateRef<any>;
  @ViewChild('rateCell', { static: true }) rateCell: TemplateRef<any>;
  @ViewChild('progressCell', { static: true }) progressCell: TemplateRef<any>;
  @ViewChild('rateCellColor', { static: true }) rateCellColor: TemplateRef<any>;
  @ViewChild('cellColor', { static: true }) cellColor: TemplateRef<any>;

  @ViewChild('summaryCell', { static: true }) summaryCell: TemplateRef<any>;
  @ViewChild('summaryCellColor', { static: true }) summaryCellColor: TemplateRef<any>;
  @ViewChild('rateSummaryCell', { static: true }) rateSummaryCell: TemplateRef<any>;
  @ViewChild('rateSummaryCellColor', { static: true }) rateSummaryCellColor: TemplateRef<any>;
  @ViewChild('scheduleCell', { static: true }) scheduleCell: TemplateRef<any>;

  @ViewChild('creativeCell', { static: true }) creativeCell: TemplateRef<any>;
  @ViewChild('starTpl', { static: true }) starTpl: TemplateRef<any>;
  @ViewChild('viewTitleCell', { static: true }) viewTitleCell: TemplateRef<any>;
  @ViewChild('operation', { static: true }) operation: TemplateRef<any>;

  @ViewChild('budgetCell', { static: true }) budgetCell: TemplateRef<any>;
  @ViewChild('statusCell', { static: true }) statusCell: TemplateRef<any>;
  @ViewChild('pauseCell', { static: true }) pauseCell: TemplateRef<any>;
  @ViewChild('priceCell', { static: true }) priceCell: TemplateRef<any>;
  @ViewChild('ocpcBidCell', { static: true }) ocpcBidCell: TemplateRef<any>;

  public pageInfo = {
    pageSize: 50,
    allCount: 0,
    currentPage: 1,
    currentPageCount: 0,
    pageSizeList: [
      { key: 10, name: '10条/页' },
      { key: 20, name: '20条/页' },
      { key: 50, name: '50条/页' },
      { key: 100, name: '100条/页' },
      { key: 200, name: '200条/页' },
      { key: 500, name: '500条/页' },
      { key: 1000, name: '1000条/页' },
      { key: 5000, name: '5000条/页' },
    ],
    loadingStatus: 'success',
  };

  public loadingIndicator = true;
  public loadingCountIndicator = true;
  public reorderable = false;
  public allFilterOption: any;

  @ViewChild('viewTable', { static: true }) viewTable;
  @ViewChild('viewMark') viewMark: ViewBookmarkComponent;
  private _bookMarkDefaultTop = 116;
  private _chartDefaultHeight = 300;
  public bookMarkTop = 116;
  public pubTableItems = [];
  public folder_list = [];

  //定向类型
  public currentTargetTypeList = [];//当前可选定向类型
  public targetTypeList = [
    {
      width: '120',
      name: '国家地域',
      showKey: 'country_region_name',
      key: 'country_region',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1, 6, 9, 7, 13, 11, 17],
      includeSummaryNames: {
        'publisher_17': ['publisher_id', 'pub_account_name'],
        'publisher_13': ['publisher_id', 'pub_account_name'],
        'publisher_1': ['publisher_id', 'pub_account_name'],
        'publisher_6': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_9': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
        'publisher_11': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
    {
      width: '120',
      name: '省级地域',
      showKey: 'province_id',
      key: 'province_id',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1, 6, 9, 7, 13, 11, 17, 16],
      includeSummaryNames: {
        'publisher_17': ['publisher_id', 'pub_account_name'],
        'publisher_16': ['publisher_id', 'pub_account_name'],
        'publisher_13': ['publisher_id', 'pub_account_name'],
        'publisher_1': ['publisher_id', 'pub_account_name'],
        'publisher_6': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_9': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
        'publisher_11': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
    {
      width: '120',
      name: '市级地域',
      showKey: 'city_id',
      key: 'city_id',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1, 6, 9, 7, 11, 17, 16],
      includeSummaryNames: {
        'publisher_17': ['publisher_id', 'pub_account_name'],
        'publisher_16': ['publisher_id', 'pub_account_name'],
        'publisher_1': ['publisher_id', 'pub_account_name'],
        'publisher_6': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_9': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
        'publisher_11': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
    {
      width: '80',
      name: '年龄',
      key: 'age',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [6, 9, 7, 16, 1],
      includeSummaryNames: {
        'publisher_1': ['publisher_id', 'pub_account_name'],
        'publisher_16': ['publisher_id', 'pub_account_name'],
        'publisher_6': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_9': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
    {
      width: '80',
      name: '学历',
      key: 'education',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1],
      includeSummaryNames: {
        'publisher_1': ['publisher_id', 'pub_account_name'],
      },
    },
    {
      width: '80',
      name: '性别',
      key: 'gender',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [6, 9, 7, 13, 16, 1],
      includeSummaryNames: {
        'publisher_1': ['publisher_id', 'pub_account_name'],
        'publisher_16': ['publisher_id', 'pub_account_name'],
        'publisher_13': ['publisher_id', 'pub_account_name'],
        'publisher_6': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_9': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
    {
      width: '120',
      name: '兴趣',
      key: 'interest',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7, 16, 1],
      includeSummaryNames: {
        'publisher_1': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_16': ['publisher_id', 'pub_account_name'],
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
    {
      width: '120',
      name: '客户端',
      key: 'client',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [16],
      includeSummaryNames: {
        'publisher_16': ['publisher_id', 'pub_account_name'],
      },
    },
    {
      width: '120',
      name: '样式',
      key: 'material_style',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1],
      includeSummaryNames: {
        'publisher_1': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    }, {
      width: '120',
      name: '意图词',
      key: 'intention_keyword',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1],
      includeSummaryNames: {
        'publisher_1': ['publisher_id', 'pub_account_name'],
      }
    }, {
      width: '120',
      name: '网络类型',
      key: 'ac',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      }
    }, {
      width: '120',
      name: '平台',
      key: 'platform',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    }, {
      width: '120',
      name: '推广目的',
      key: 'landing_type',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    }, {
      width: '120',
      name: '投放位置',
      key: 'inventory_type',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    }, {
      width: '120',
      name: '出价类型',
      key: 'pricing',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    }, {
      width: '120',
      name: '素材类型',
      key: 'image_mode',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
  ];

  // 媒体属性
  public currentTargetSummaryTypeList = [];//当前可选媒体属性
  public targetSummaryTypeList = [
    {
      width: '96',
      name: '媒体',
      showKey: 'publisher',
      key: 'publisher_id',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'singleList',
      includePublisherIds: [1, 6, 9, 7, 13, 11, 17, 16],
    },
    {
      width: '184',
      name: '账户',
      key: 'pub_account_name',
      data_type: 'pub_attr_data',
      selected: { current: true },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1, 6, 9, 7, 13, 11, 17, 16],
    },
    //-- 头条 计划（广告组）
    {
      width: '120',
      name: '广告组',
      key: 'pub_campaign_name',
      data_type: 'pub_attr_data',
      selected: { current: true },
      summaryType: ['target'],
      type: 'string',
      // includePublisherIds: [7],
      includePublisherIds: [],
    },
    //-- 头条 单元（计划）
    {
      width: '120',
      name: '计划',
      key: 'pub_adgroup_name',
      data_type: 'pub_attr_data',
      selected: { current: true },
      summaryType: ['target'],
      type: 'string',
      // includePublisherIds: [7],
      includePublisherIds: [],
    },


    {
      width: '120',
      name: '计划',
      key: 'pub_campaign_name',
      data_type: 'pub_attr_data',
      selected: { current: true },
      summaryType: ['target'],
      type: 'string',
      // includePublisherIds: [1, 6, 9, 11],
      includePublisherIds: [],
    },
    {
      width: '120',
      name: '单元',
      key: 'pub_adgroup_name',
      data_type: 'pub_attr_data',
      selected: { current: true },
      summaryType: ['target'],
      type: 'string',
      // includePublisherIds: [1, 11],
      includePublisherIds: [],
    },
    {
      width: '120',
      name: '创意',
      key: 'pub_creative_name',
      data_type: 'pub_attr_data',
      selected: { current: true },
      summaryType: ['target'],
      type: 'string',
      // includePublisherIds: [1, 11],
      includePublisherIds: [],
    },
  ];
  public targetSummaryTypeMap = {
    publisher_id: 'target_publisher',
    pub_account_name: 'target_account',
    pub_campaign_name: 'target_campaign',
    pub_adgroup_name: 'target_adgroup',
    pub_creative_name: 'target_creative',
  };
  public targetSummaryTypeMapReverse = {
    target_publisher: 'publisher_id',
    target_account: 'pub_account_name',
    target_campaign: 'pub_campaign_name',
    target_adgroup: 'pub_adgroup_name',
    target_creative: 'pub_creative_name',
  };
  public targetSummaryTypeId = 'publisher_id';

  public publisher_id;

  // -- 编辑
  public editBudgetParam = {
    budget: null,
    publisherId: null,
    iswraing: false,
    budgetRadio: 1,
    cron_setting_type: "now",
    cron_setting_time: new Date(),
    action: 1,
    price: null,
    cron_setting: "now",
    budgetRanges: {
      account: {
        1: { min: 50, max: '9999999.99', extraInfo: '范围:50-9999999.99' },
        6: { min: 50, max: '10000000', extraInfo: '范围:50-10000000' },
        7: { min: 1000, max: '9999999.99', extraInfo: '范围:1000-9999999.99' },
        17: { min: 100, max: '999999.99', extraInfo: '范围:100-999999.99' },
        24: { min: 100, max: '999999.99', extraInfo: '范围:100-999999.99' },
      },
      campaign: {
        1: { min: 50, max: '9999999.99', extraInfo: '范围:50-9999999.99' },
        6: { min: 50, max: '4000000', extraInfo: '范围:50-4000000' },
        7: { min: 1000, max: '9999999.99', extraInfo: '范围:1000-9999999.99' },
        17: { min: 100, max: '999999.99', extraInfo: '范围:100-999999.99' },
        24: { min: 100, max: '999999.99', extraInfo: '范围:100-999999.99' },
      },
      adgroup: {
        1: { min: 50, max: '9999999.99', extraInfo: '范围:50-9999999.99' },
        6: { min: 50, max: '4000000', extraInfo: '范围:50-4000000' },
        7: { min: 100, max: '9999999.99', extraInfo: '范围:100-9999999.99' },
        17: { min: 100, max: '999999.99', extraInfo: '范围:100-999999.99' },
        24: { min: 100, max: '999999.99', extraInfo: '范围:100-999999.99' },
      },
    },
  };

  public editPriceParam = {
    keywordPrice: null,
    publisherId: null,
    iswraing: false,
    currentPriceRangesCheck: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
    priceRanges: {
      account: {
        publisher_1: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
        publisher_6: { min: 0.1, max: 999.99, extraInfo: '范围:0.1-999.99' },
        publisher_7: { min: 0.1, max: 10000, extraInfo: '范围:0.2-100' },
        publisher_24: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
      },
      campaign: {
        publisher_1: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
        publisher_6: { min: 0.1, max: 999.99, extraInfo: '范围:0.1-999.99' },
        publisher_7: { min: 0.1, max: 10000, extraInfo: '范围:0.2-100' },
        publisher_24: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
      },
      adgroup: {
        publisher_1: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
        publisher_6: { min: 0.1, max: 999.99, extraInfo: '范围:0.1-999.99' },
        publisher_7: { min: 0.1, max: 10000, extraInfo: '范围:0.2-100' },
        publisher_24: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
      },
      keyword: {
        publisher_24: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
      }
    }, extraPriceRanges: {
      account: {},
      campaign: {},
      adgroup: {
        publisher_1_CPM: { min: 2.0, max: 9999.99, extraInfo: '范围:2.0-9999.99' },
        publisher_7_OCPC: { min: 0.1, max: 10000, extraInfo: '范围:0.1-10000' },
        publisher_7_OCPM: { min: 0.1, max: 10000, extraInfo: '范围:0.1-10000' },
        publisher_7_CPA: { min: 1, max: 1500, extraInfo: '范围:1-1500' },
        publisher_7_CPM: { min: 6, max: 100, extraInfo: '范围:6-100' },
        publisher_7_CPC: { min: 0.2, max: 100, extraInfo: '范围:0.2-100' },
        publisher_6_CPA: { min: 1, max: 100, extraInfo: '范围:1-100' },
        publisher_6_oCPA: { min: 0.1, max: 2000, extraInfo: '范围:0.1-2000' },
        publisher_6_CPM: { min: 1.5, max: 999, extraInfo: '范围:1.5-999' },
        publisher_6_CPC: { min: 0.1, max: 100, extraInfo: '范围:0.1-100' },
      },
    },
  };

  public editOcpcBidParam = {
    keywordPrice: null,
    publisherId: null,
    iswraing: false,
    currentPriceRangesCheck: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
    priceRanges: {
      account: {
        publisher_1: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
        publisher_6: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
        publisher_7: { min: 0.1, max: 10000, extraInfo: '范围:0.2-100' },
      },
      campaign: {
        publisher_1: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
        publisher_6: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
        publisher_7: { min: 0.1, max: 10000, extraInfo: '范围:0.2-100' },
      },
      adgroup: {
        publisher_1: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
        publisher_6: { min: 0.3, max: 999.99, extraInfo: '范围:0.3-999.99' },
        publisher_7: { min: 0.1, max: 10000, extraInfo: '范围:0.2-100' },
      },
    },
    extraPriceRanges: {
      account: {},
      campaign: {},
      adgroup: {
        publisher_1_CPM: { min: 2.0, max: 9999.99, extraInfo: '范围:2.0-9999.99' },
        publisher_7_OCPC: { min: 0.1, max: 10000, extraInfo: '范围:0.1-10000' },
        publisher_7_OCPM: { min: 0.1, max: 10000, extraInfo: '范围:0.1-10000' },
        publisher_7_CPA: { min: 1, max: 1500, extraInfo: '范围:1-1500' },
        publisher_7_CPM: { min: 6, max: 100, extraInfo: '范围:6-100' },
        publisher_7_CPC: { min: 0.2, max: 100, extraInfo: '范围:0.2-100' },
      },
    },
  };

  //定向需要展示筛选的列
  public targetShowFilterItems = ['publisher_id', 'province_id', 'city_id', 'age', 'gender', 'interest'];

  public editParameter = {
    is_single_edit: false, //false:批量编辑 ， true：开启单条编辑
    selected_type: ' ',
    selected_data: [],
    allViewTableData: {},
    edit_source: true, //记录编辑来源 true：编辑  false：点击开关
  };
  public isJump = '';
  public viewType = 'view';

  public refreshRankingSetting = {
    rankingData: [],
    allCount: 0,
    maxRun: 1,
    currentRun: 0,
    currentIndex: -1,
    status: 'stop',
  };
  public refreshRankingSingleComplete$ = new Subject();
  public refreshRankingObserver = null;
  public clickReal = false;
  public rankingCode = { region: "9010000", device: 1 };
  public ranking_setting: any; //记录实时排名数据

  @ViewChild('nzSelectAdver') nzSelectAdver: NzSelectComponent;
  // public tacticLevelList = this.customDatasService.automationRenderData['effect_tactic_level'];
  public tacticLevelList = [
    {
      "key": "campaign",
      "name": "推广组"
    },
    {
      "key": "adgroup",
      "name": "计划"
    }
  ];
  public tacticLevelObj = {};

  public target_type = "province_id";

  public priceArray = [
    { name: '提高', value: 1 },
    { name: '降低', value: 2 }
  ];


  constructor(
    private dataViewService: DataViewService,
    private dataViewEditWrapService: DataViewEditWrapService,
    private tableItemService: TableItemFeedService,
    private viewItemService: ViewItemService,
    private itemSelectService: ItemSelectService,
    private reportService: ReportService,
    private authService: AuthService,
    private _message: NzMessageService,
    private modalService: NzModalService,
    private localSt: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private notifyService: NotifyService,
    private folderService: DataViewFolderFeedService,
    private renderer: Renderer2,
    public menuService: MenuService,
    private drawerService: NzDrawerService,
    private customDatasService: CustomDatasService,
  ) {
    this.tacticLevelList.forEach(level => {
      this.tacticLevelObj[level.key] = level.name;
    });
    const summaryTypes = this.tableItemService.getSummaryTypes('basic_report');
    summaryTypes.forEach(element => { this.summary_type_name[element.key] = element.name; });
    this.userSelectedOper = this.authService.getCurrentUserOperdInfo();
    this.route.data.subscribe((data) => {
      this.viewTableData['summary_type'] = data['summaryType'];
      this.viewTableData['sub_summary_type'] = data['summaryType'];
      this.source_summary = data['summaryType'];
      if (this.viewTableData['summary_type'] === 'creative') {
        this.rowHeight = 200;
        this.defaultRowHeight = 200;
        this.summaryHeight = 40;
      }
      if (this.viewTableData['summary_type'] === 'target') {
        this.viewTableData['report_type'] = 'target_report';
        this.viewTableData['summary_type'] = this.targetSummaryTypeMap[this.targetSummaryTypeId];
        if (!this.viewTableData['target_type']) {
          this.viewTableData['target_type'] = 'province_region';
          this.target_type = 'province_id';
        }
      }
      this.chartItems = viewItemService.getChartItem();

      //仅关键词显示平均排名
      this.chartItems.forEach((item, index) => {
        if (
          this.source_summary !== 'keyword' &&
          item.key === 'pub_avg_position'
        ) {
          this.chartItems.splice(index, 1);
        }
      });
      /*this.chartItems = viewItemService.getChartItem();
      this.chartSelectedItem.push(this.chartItems[0].key);
      this.viewTableData['selected_items_chart'] = [this.chartItems[0]];*/
    });
    this.publisher_id = this.menuService.currentPublisherId;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    if (this.viewChartShow) {
      this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 300;
    } else {
      this.tableHeight = document.body.clientHeight - 60 - 65 - 30;
    }
  }

  ngOnInit() {
    this.getCurrentTargetSummaryTypeList();//获取媒体列表
    this.getCurrentTargetTypeList();//获取定向列表
    const localMarkInfo = this.getLocalBookMark(this.source_summary);
    this.viewReportSetting.report_name =
      '自定义报表-' + this.summary_type_name[this.source_summary];
    this.viewTableData['sort_item'] = { key: 'pub_cost', dir: 'desc' };
    this.viewTableData['selected_items'] = this.viewItemService.getDefaultItemsBySummaryType(this.source_summary);
    if (this.source_summary === 'target') {
      if (localMarkInfo === null) {
        this.viewTableData[
          'locked_items'
        ] = this.viewItemService.getLockedItemsBySummaryType(this.source_summary);
      } else {
        this.viewTableData[
          'locked_items'
        ] = localMarkInfo['sheets_setting']['table_setting']['locked_items'];
        this.targetSummaryTypeId = this.targetSummaryTypeMapReverse[localMarkInfo['sheets_setting']['table_setting']['summary_type']];
        this.viewTableData['target_type'] = localMarkInfo['sheets_setting']['table_setting']['target_type'];
        if (this.viewTableData['target_type'] === 'province_region') {
          this.target_type = 'province_id';
        } else if (this.viewTableData['target_type'] === 'city_region') {
          this.target_type = 'city_id';
        } else {
          this.target_type = this.viewTableData['target_type'];
        }
      }
      const proIndex = this.viewTableData['locked_items'].findIndex((item) => item.key === 'province_region');
      if (proIndex > -1) {
        this.viewTableData['locked_items'].splice(proIndex, 1);
      }
    } else {
      this.viewTableData[
        'locked_items'
      ] = this.viewItemService.getLockedItemsBySummaryType(this.source_summary);
    }

    this.endLocked_items = this.viewItemService.getEndLockedItemsBySummaryType(
      this.source_summary,
    );

    this.allFilterOption = JSON.parse(
      JSON.stringify(
        this.viewItemService.getItemFilterType(this.source_summary),
      ),
    );

    this.pubTableItems = this.tableItemService.getTableItemsObj(
      this.viewTableData.report_type,
      this.viewTableData.summary_type,
    );
    if (['keyword', 'adgroup', 'campaign', 'creative'].indexOf(this.source_summary) !== -1) {
      this.getFolderList();
    }

    // --- 获取默认
    if (localMarkInfo === null) {
      if (this.getConditionData()) {
        //从视图固定列跳过来的逻辑
        this.viewTableData.data_range = this.getConditionData();
        localStorage.removeItem('data_range_data');
        this.refreshFields(this.viewTableData['selected_items']);
        this.generateTimeShow();
        this.reloadData(true);
      } else {
        this.refreshFields(this.viewTableData['selected_items']);
        this.generateTimeShow();
        this.refreshSummaryData();
        this.refreshData();
        this.refreshCount();
      }
      this.sortBySummaryType();
    } else {
      if (localMarkInfo.hasOwnProperty('pageSize')) {
        this.pageInfo.pageSize = localMarkInfo['pageSize'];
      }
      if (localMarkInfo.hasOwnProperty('timeGrain')) {
        this.time_grain_filter = localMarkInfo['timeGrain'];
        this.time_grain = this.time_grain_filter;
      }
      const lockObj = {};
      this.viewTableData['locked_items'].forEach((lockItem) => {
        lockObj[lockItem.key] = lockItem['name'];
      });

      const newLockItems = [];
      localMarkInfo['sheets_setting']['table_setting']['locked_items'].forEach(
        (lockItemLock) => {
          if (lockObj.hasOwnProperty(lockItemLock['key'])) {
            lockItemLock['name'] = lockObj[lockItemLock['key']];
            newLockItems.push(lockItemLock);
          }
        },
      );
      localMarkInfo['sheets_setting']['table_setting'][
        'locked_items'
      ] = newLockItems;

      // const newSelectedItems = [];
      // localMarkInfo['sheets_setting']['table_setting'][
      //   'selected_items'
      // ].forEach(item => {
      //   if (this.pubTableItems.hasOwnProperty(item['key'])) {
      //     item['name'] = this.pubTableItems[item['key']];
      //     newSelectedItems.push(item);
      //   }
      // });
      // localMarkInfo['sheets_setting']['table_setting'][
      //   'selected_items'
      // ] = newSelectedItems;
      this.changeSelectedBookMark(localMarkInfo['sheets_setting']);
    }
  }

  // 获取当前定向类型列表
  getCurrentTargetTypeList() {
    this.currentTargetTypeList = [];
    this.targetTypeList.forEach(target => {
      if (target.includePublisherIds.includes(this.menuService.currentPublisherId) && target.includeSummaryNames['publisher_' + this.menuService.currentPublisherId].includes(this.targetSummaryTypeId)) {
        this.currentTargetTypeList.push(target);
      }
    });
  }

  // 获取当前媒体属性列表
  getCurrentTargetSummaryTypeList(selectedTargetList?) {
    let newTargetSummaryTypeList = [];
    this.targetSummaryTypeList.forEach(targetSummary => {
      if (targetSummary.includePublisherIds.includes(this.menuService.currentPublisherId)) {
        newTargetSummaryTypeList.push(targetSummary);
      }
    });

    if (selectedTargetList) {//如果筛选定向类型
      const targetSummaryMap = new Map();
      selectedTargetList.forEach(target => {
        target.includeSummaryNames['publisher_' + this.menuService.currentPublisherId].forEach(targetSummaryKey => {
          newTargetSummaryTypeList.forEach(targetSummary => {
            if (targetSummary.key === targetSummaryKey) {
              targetSummaryMap.set(targetSummaryKey, targetSummary);
            }
          });
        })
      });
      newTargetSummaryTypeList = [...targetSummaryMap.values()];
    }
    this.currentTargetSummaryTypeList = newTargetSummaryTypeList;
  }

  getFolderList() {
    this.folderService.getFolderList({
      result_model: 'all',
      folder_level: this.source_summary,
    }).subscribe(
      (result) => {
        this.folder_list = result.data.map((item) => {
          return {
            key: item.folder_id,
            name: item.folder_name,
          };
        });
        const options = this.allFilterOption.folder_name.filterOption;
        this.allFilterOption.folder_name.filterOption = [...options, ...this.folder_list];
        this.allFilterOption.folder_id.filterOption = [...options, ...this.folder_list];
        this.allFilterOption = { ...this.allFilterOption };
      },
    );
  }



  //定向粒度
  onTargetSummaryChange(e) {
    this.getCurrentTargetTypeList();//重新获取定向列表

    if (this.source_summary === 'target') {
      this.viewTableData['report_type'] = 'target_report';
    }

    let selectTargetSummaryDetail = [];

    let data = [...this.viewTableData['locked_items']];
    //移除原有选中项
    this.currentTargetSummaryTypeList.forEach((targetSummary) => {
      const summaryIndex = data.findIndex((item) => item.key === targetSummary.key);
      if (summaryIndex > -1) {
        data.splice(summaryIndex, 1);
      }
    });

    //媒体属性
    const index = this.currentTargetSummaryTypeList.findIndex(
      (item) => item.key === this.targetSummaryTypeId,
    );
    selectTargetSummaryDetail = this.currentTargetSummaryTypeList.slice(0, index + 1);
    data = [...selectTargetSummaryDetail, ...data];
    this.viewTableData['locked_items'] = data;
    this.viewTableData['summary_type'] = this.targetSummaryTypeMap[this.targetSummaryTypeId];
    this.refreshFields(this.viewTableData['selected_items'], true);
    this.clearFilter();
    this.reloadData();
  }
  // 定向类型
  onTargetChange(e) {
    let selectedTargetList = [];
    let data = [...this.viewTableData['locked_items']];
    //移除原有选中项
    this.currentTargetTypeList.forEach((target) => {
      const index = data.findIndex((item) => item.key === target.key);
      if (index > -1) {
        data.splice(index, 1);
      }
    });
    let selectedTargetKey = [];
    if (e === 'province_id') {
      selectedTargetKey = ['country_region', 'province_id'];
      this.viewTableData['target_type'] = 'province_region';
    } else if (e === 'city_id') {
      selectedTargetKey = ['country_region', 'province_id', 'city_id'];
      this.viewTableData['target_type'] = 'city_region';
    } else {
      this.viewTableData['target_type'] = e;
      selectedTargetKey = [this.viewTableData['target_type']];
    }
    selectedTargetList = this.currentTargetTypeList.filter((item) =>
      selectedTargetKey.includes(item.key),
    );
    // this.tableService.setPubData(selectedTargetList)
    data = [...selectedTargetList, ...data];
    this.viewTableData['locked_items'] = data;

    this.getCurrentTargetSummaryTypeList(selectedTargetList);//重新获取媒体列表
    this.refreshFields(this.viewTableData['selected_items'], true);
    this.clearFilter();
    this.reloadFirstPage();
  }

  sortBySummaryType() {
    //@todo 2020-01-10 修改逻辑,统一按pub_cost排序
    this.viewTableData['sort_item'] = { key: 'pub_cost', dir: 'desc' };
    this.defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];
  }

  selectedChangeCheckBox(allSelected, fn) {
    fn(allSelected);
    setTimeout(() => {
      if (this.selectedType == 'current') {
        this.selectedLength = this.selected.length;
      } else if (this.selectedType == 'all') {
        this.selectedLength = this.pageInfo.allCount;
      }
    }, 0);
  }

  selectedChange(type, allSelected, fn) {
    this.selectedType = type;
    if (!allSelected) {
      fn(true);
    }
    setTimeout(() => {
      if (this.selectedType == 'current') {
        this.selectedLength = this.selected.length;
      } else if (this.selectedType == 'all') {
        this.selectedLength = this.pageInfo.allCount;
      }
    }, 0);
  }
  singleSelectedChange(fn, isSelected) {
    this.selectedType = 'current';
    fn(isSelected);
    setTimeout(() => {
      if (this.selectedType == 'current') {
        this.selectedLength = this.selected.length;
      } else if (this.selectedType == 'all') {
        this.selectedLength = this.pageInfo.allCount;
      }
    }, 0);
  }

  //获取url中的参数
  getUrlParam(name) {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'); //构造一个含有目标参数的正则表达式对象
    const r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) {
      return unescape(r[2]); //返回参数值
    } else {
      return null;
    }
  }

  syncPrompt() {
    this._message.error(
      '请勾选' + this.summary_type_name[this.source_summary] + '进行下载更新！',
    );
  }
  doSync(chan_pub_id?) {
    const notifyData: any[] = [];
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    if (this.source_summary === 'account') {
      const postBody = {
        type: 'account',
        info: [],
      };
      if (isUndefined(chan_pub_id)) {
        this.selected.forEach((data) => {
          // postBody.chan_pub_ids.push(data.chan_pub_id);
          postBody.info.push({ chan_pub_id: data.chan_pub_id });
          notifyData.push({
            chan_pub_id: data.chan_pub_id,
            cid: userOperdInfo.select_cid,
            uid: userOperdInfo.select_uid,
            advertiser_name: '',
            pub_account_name: data['pub_account_name'],
          });
        });
      } else if (isNumber(chan_pub_id) && chan_pub_id > 0) {
        // postBody.chan_pub_ids.push(chan_pub_id);
        postBody.info.push({ chan_pub_id });
      }
      if (postBody.info.length > 0) {
        this.dataViewService.syncPublisher(postBody).subscribe(
          (result: any) => {
            if (result.status_code === 200) {
              this.notifyService.notifyData.next({
                type: 'account',
                data: notifyData,
              });
              this._message.success('提交成功，同步中');
              this.refreshData();
            } else if (result['status_code'] && result.status_code === 401) {
              this._message.error('您没权限对此操作！');
            } else if (result['status_code'] && result.status_code === 500) {
              this._message.error('系统异常，请重试');
            } else {
              this._message.error(result['message']);
            }
          },
          (err: any) => {
            this._message.error('同步失败,请重试');
          },
          () => { },
        );
      } else {
        this._message.info('请选择相关项操作');
      }
    } else if (this.source_summary === 'campaign') {
      const postBody = {
        type: 'campaign',
        info: [],
      };
      const resultObject = {};
      this.selected.forEach((data) => {
        if (resultObject.hasOwnProperty(data.chan_pub_id)) {
          resultObject[data.chan_pub_id].campaign_ids.push(
            data.pub_campaign_id,
          );
        } else {
          resultObject[data.chan_pub_id] = {
            chan_pub_id: data.chan_pub_id,
            campaign_ids: [],
          };
          notifyData.push({
            chan_pub_id: data.chan_pub_id,
            cid: userOperdInfo.select_cid,
            uid: userOperdInfo.select_uid,
            advertiser_name: '',
            pub_account_name: data['pub_account_name'],
          });
          resultObject[data.chan_pub_id].campaign_ids.push(
            data.pub_campaign_id,
          );
        }
      });
      postBody.info = Object.values(resultObject);
      if (postBody.info.length > 0) {
        this.dataViewService.syncPublisher(postBody).subscribe(
          (result: any) => {
            if (result.status_code === 200) {
              this.notifyService.notifyData.next({
                type: 'account',
                data: notifyData,
              });
              this._message.success('提交成功，同步中');
              this.refreshData();
            } else if (result['status_code'] && result.status_code === 401) {
              this._message.error('您没权限对此操作！');
            } else if (result['status_code'] && result.status_code === 500) {
              this._message.error('系统异常，请重试');
            } else {
              this._message.error(result['message']);
            }
          },
          (err: any) => {
            this._message.error('同步失败,请重试');
          },
          () => { },
        );
      } else {
        this._message.info('请选择相关项操作');
      }
    }
  }

  refreshTableSize(event = 'resize') {
    // window.dispatchEvent(new Event(event));
  }
  refreshData(fromMark = false) {
    if (!isNull(this.refreshRankingObserver)) {
      this.refreshRankingObserver.unsubscribe();
    }
    this.refreshRankingSetting.status = 'stop';
    if (!fromMark && !isUndefined(this.viewMark)) {
      this.viewMark.resetActiveMark();
    }
    this.allFilterOption = { ...this.allFilterOption };
    this.viewTableData.single_condition = [];
    Object.values(this.allFilterOption).forEach((item) => {
      const findExistsColumn = this.viewTableData['selected_items'].find(
        (col) => col.key === item['filterKey']['key'],
      );
      if (isUndefined(findExistsColumn)) {
      }
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    this.loadingIndicator = true;
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));
    tmpViewTableData['selected_items'].push({
      data_type: 'pub_attr_data',
      key: 'publisher_id',
      showKey: 'publisher',
      selected: { current: true },
    });
    this.viewReportSetting.report_name = this.getReportName();
    const postData = { sheets_setting: { table_setting: tmpViewTableData } };
    this.sub.add(
      this.dataViewService
        .getViewList(postData, {
          count: this.pageInfo.pageSize,
          page: this.pageInfo.currentPage,
        })
        .subscribe(
          (results: any) => {
            if (results.status_code && results.status_code === 200) {
              this.loadingIndicator = false;
              this.rows = results['data']['detail'];
              this.pageInfo.currentPageCount = results['data']['detail'].length;
              this.selected = [];
              this.rows.forEach((item) => {
                if (item.hasOwnProperty('data_hour')) {
                  item['data_hour'] = item['data_hour'].toString();
                }
              });
              this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>无符合要求的数据</span>
    </div>
  `;
            } else if (results.status_code && results.status_code > 500) {
              this.rows = [];
              this.loadingIndicator = false;
              this.pageInfo.currentPageCount = 0;
              this.selected = [];
              this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>数据范围过大，暂无法显示</span>
    </div>
  `;
            } else {
              this.rows = [];
              this.loadingIndicator = false;
              this.pageInfo.currentPageCount = 0;
              this.selected = [];
              this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>获取数据失败，请重试</span>
    </div>
  `;
            }
          },
          (err: any) => {
            this.rows = [];
            this.loadingIndicator = false;
            this.pageInfo.currentPageCount = 0;
            this.selected = [];
            this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>获取数据失败，请重试</span>
    </div>
  `;
          },
          () => {
            this.loadingIndicator = false;
          },
        ),
    );
  }

  refreshSummaryData() {
    this.allFilterOption = { ...this.allFilterOption };
    this.viewTableData.single_condition = [];
    Object.values(this.allFilterOption).forEach((item) => {
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));
    tmpViewTableData['selected_items'].push({
      data_type: 'pub_attr_data',
      key: 'publisher_id',
      showKey: 'publisher',
      selected: { current: true },
    });
    tmpViewTableData['all_summary'] = true;
    const postData = { sheets_setting: { table_setting: tmpViewTableData } };
    this.sub.add(
      this.dataViewService
        .getViewList(postData, {
          count: this.pageInfo.pageSize,
          page: this.pageInfo.currentPage,
        })
        .subscribe(
          (results: any) => {
            if (results.status_code && results.status_code === 200) {
              if (results['data']['detail'].length === 1) {
                this.summaryData = results['data']['detail'][0];
              }
            }
          },
          (err: any) => { },
          () => { },
        ),
    );
  }

  refreshCount() {
    this.viewTableData.single_condition = [];
    this.allFilterOption = { ...this.allFilterOption };
    Object.values(this.allFilterOption).forEach((item) => {
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    const postData = { sheets_setting: { table_setting: this.viewTableData } };
    this.pageInfo.loadingStatus = 'pending';
    this.sub.add(
      this.dataViewService.getViewList(postData, { is_count: 1 }).subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.pageInfo.allCount = results['data']['detail_count'];
            this.pageInfo.loadingStatus = 'success';
          } else {
            this.pageInfo.loadingStatus = 'error';
          }
        },
        (err: any) => {
          this.loadingCountIndicator = false;
          this.pageInfo.loadingStatus = 'error';
        },
        () => {
          this.loadingCountIndicator = false;
        },
      ),
    );
  }

  downloadReport() { }

  changeField() {
    const add_modal = this.modalService.create({
      nzTitle: '修改列',
      nzWidth: 900,
      nzContent: TableFieldFeedComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        reportType: this.viewTableData['report_type'],
        summaryType: this.source_summary,
        selectedItems: this.viewTableData['selected_items'],
        isCompare: this.viewTableData['is_compare'],
        lockedItems: this.viewTableData['locked_items'],
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result.dataType && result.dataType === 'table') {
        this.viewTableData['selected_items'] = result.data;
        this.viewTableData['is_compare'] = result.is_compare;
        this.getTableItemsByIsCompare(this.viewTableData['is_compare']);
        this.generateTimeShow();
        this.refreshFields(result.data);
        this.refreshChartData(this.showChartType);

        this.reloadData();
        this.selectedLength = 0;
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 0);
      }
    });
  }

  //根据是否对比判断筛选条件中是否溢出对比筛选
  getTableItemsByIsCompare(is_compare) {
    if (!is_compare) {
      const currentCondition = [];
      JSON.parse(JSON.stringify(this.viewTableData['condition'])).forEach(
        (item) => {
          if (
            item['name'][item['name'].length - 1] !== '#' &&
            item['name'][item['name'].length - 1] !== '△' &&
            item['name'][item['name'].length - 1] !== '%'
          ) {
            currentCondition.push(item);
          }
        },
      );
      this.viewTableData['condition'] = currentCondition;
      Object.values(this.allFilterOption).forEach((filter) => {
        if (Object.keys(filter['filterResult']).length > 0) {
          if (
            filter['filterKey']['name'][
            filter['filterKey']['name'].length - 1
            ] === '%' ||
            filter['filterKey']['name'][
            filter['filterKey']['name'].length - 1
            ] === '#' ||
            filter['filterKey']['name'][
            filter['filterKey']['name'].length - 1
            ] === '△'
          ) {
            filter['filterResult'] = [];
          }
        }
      });
    }
  }

  changeCondition() {
    const add_modal = this.modalService.create({
      nzTitle: '筛选条件',
      nzWidth: 600,
      nzContent: TableQueryFeedComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        reportType: this.viewTableData['report_type'],
        summaryType: this.source_summary,
        initCondition: this.viewTableData['condition'],
        dataRange: this.viewTableData['data_range'],
        tableData: this.viewTableData,
        filterOption: this.allFilterOption,
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result.dataType && result.dataType === 'query') {
        this.viewTableData['condition'] = result.condition;
        this.viewTableData['data_range'] = result.dataRange;
        this.reloadFirstPage();
      }
    });
  }

  changeDate() {
    const add_modal = this.modalService.create({
      nzTitle: '时间选择',
      nzWidth: 600,
      nzContent: TableTimeComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        timeSetting: {
          summary_date: this.viewTableData['summary_date'],
          summary_date_compare: this.viewTableData['summary_date_compare'],
          summary_date_alias: this.viewTableData['summary_date_alias'],
          summary_date_compare_alias: this.viewTableData['summary_date_compare_alias'],
          time_grain: this.viewTableData['time_grain'],
          other_compare_date_list: this.viewTableData['other_compare_date_list'],
        },
        isCompare: this.viewTableData['is_compare'],
        summary_type: this.source_summary,
        defined_is_disable: false,
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result.dataType && result.dataType === 'time') {
        this.viewTableData = Object.assign(this.viewTableData, result['data']);
        this.generateTimeShow();
        this.refreshFields(this.viewTableData['selected_items']);
        this.reloadFirstPage();
        this.refreshChartData(this.showChartType);
      }
    });
  }

  subjectChange(event) {
    setTimeout(() => {
      this.reloadData(true);
    });
  }

  mainRangeChange(event) {
    setTimeout(() => {
      this.pageInfo.currentPage = 1;
      this.reloadData(true);
    });
  }
  timeRangeChange(event) {
    //当汇总选择分日时，展现默认 有展现 并且不让选择
    if (this.time_grain_filter !== 'summary') {
      this.viewTableData['main_range'] = 'join';
    }

    //选择的只要有分时，报告类型传 hours_report ， 否则 传 basic_report
    if (
      this.time_grain_filter === 'hour' ||
      this.time_grain_filter === 'hour_day' ||
      this.time_grain_filter === 'hour_weekSplit'
    ) {
      this.viewTableData.report_type = 'hours_report';
    } else if (this.time_grain_filter === 'region' || this.time_grain_filter === 'region_day') {
      this.viewTableData.report_type = 'region_report';
    } else {
      this.viewTableData.report_type = 'basic_report';
    }

    //选择的只要有分日，汇总传 day ， 否则 传 合计summary
    if (
      this.time_grain_filter === 'day' ||
      this.time_grain_filter === 'hour_day' ||
      this.time_grain_filter === 'region_day'
    ) {
      this.viewTableData.time_grain = 'day';
    } else if (this.time_grain_filter === 'hour_weekSplit') {
      this.viewTableData.time_grain = 'weekSplit';
    } else if (this.time_grain_filter === 'week' || this.time_grain_filter === 'month') {
      this.viewTableData.time_grain = this.time_grain_filter;
    } else {
      this.viewTableData.time_grain = 'summary';
    }

    if (this.source_summary === 'target') {
      this.viewTableData['report_type'] = 'target_report';
    }

    if (this.viewTableData.report_type === 'hours_report') {
      this.viewTableData.summary_type = JSON.parse(JSON.stringify(this.source_summary)) + '_hour';
    } else if (this.viewTableData.report_type === 'target_report') {
      this.viewTableData['summary_type'] = this.targetSummaryTypeMap[this.targetSummaryTypeId];
    } else if (this.viewTableData.report_type === 'region_report') {
      this.viewTableData.summary_type = JSON.parse(JSON.stringify(this.source_summary)) + '_region';
    } else {
      this.viewTableData.summary_type = this.source_summary;
    }
    this.time_grain = this.time_grain_filter;

    this.sortBySummaryType();

    setTimeout(() => {
      this.refreshFields(this.viewTableData['selected_items']);
      this.clearFilter();
      this.reloadFirstPage();
    });
  }

  getTimeGrainFilter(reportType, timeGrain) {
    let resultTimeGrainFilter = timeGrain;
    if (reportType == 'hours_report') {
      resultTimeGrainFilter = 'hour';
    } else if (reportType == 'region_report') {
      resultTimeGrainFilter = 'region';
    }

    if (timeGrain == 'day' && (resultTimeGrainFilter == 'hour' || resultTimeGrainFilter == 'region')) {
      resultTimeGrainFilter = resultTimeGrainFilter + '_day';
    } else if (timeGrain == 'weekSplit' && resultTimeGrainFilter == 'hour') {
      resultTimeGrainFilter = resultTimeGrainFilter + '_weekSplit';
    }

    return resultTimeGrainFilter;
  }

  reloadData(reloadChart = true) {
    this.refreshSummaryData();
    this.refreshData();
    this.setLocalBookMark(this.source_summary, {
      summary_type: this.source_summary,
      sheets_setting: {
        table_setting: this.viewTableData,
      },
      pageSize: this.pageInfo.pageSize,
      timeGrain: this.time_grain_filter,
    });
    this.refreshCount();
    if (this.viewChartShow && reloadChart) {
      this.refreshChartData(this.showChartType);
    }
  }

  refreshFields(data: any[], selectedFlag = false) {
    const checkFiled: any = [
      {
        width: '64',
        headerTemplate: this.chkHeader,
        cellTemplate: this.chkCell,
        name: 'checkBOx',
        frozenLeft: true,
      },
    ];

    const timeFiled: any = [
      {
        width: '120',
        name: '日期',
        key: 'date_str',
        frozenLeft: true,
        sortable: true,
      },
    ];
    const hourFiled: any = [
      {
        width: '70',
        name: '小时',
        key: 'data_hour',
        frozenLeft: true,
        sortable: true,
      },
    ];
    const dataAnalysis: any = [
      {
        width: '70',
        headerTemplate: this.dataAnalysisHeader,
        cellTemplate: this.dataAnalysisCell,
        name: '数据分析',
        prop: 'dataAnalysis',
        frozenLeft: true,
      },
    ];
    // 小红书-单元查看操作
    const operateFiled: any = [
      {
        width: '150',
        cellTemplate: this.operateCell,
        name: '查看操作',
        frozenLeft: true,
        sortable: false,
        prop: 'dataAnalysis',
      },
    ];
    const weekSplitFiled: any = [{ width: '120', name: '日期', showKey: 'date_str', key: 'data_weekSplit', frozenLeft: true, sortable: true }];

    const regionFiled: any = [{ width: '100', name: '省级地域', key: 'province_id', frozenLeft: true, sortable: true }, { width: '100', name: '市级地域', key: 'city_id', frozenLeft: true, sortable: true }];

    const tmpFiled: any = [];
    explainTableFeedField(data, tmpFiled, this);
    if (this.viewTableData.summary_type === 'creative') {
      this.rowHeight = 40;
    } else {
      this.rowHeight = this.defaultRowHeight;
    }
    const lockedColumn = [];
    this.viewTableData['locked_items'].forEach((item) => {
      let popKey = item.key;
      if (item.hasOwnProperty('showKey') && item.showKey !== '') {
        popKey = item.showKey;
      }
      const tplHeader = {};
      if (popKey === 'creative') {
        tplHeader['cellTemplate'] = this.creativeCell;
        tplHeader['sortable'] = item.sortable;
      }
      if (this.source_summary !== 'target') {
        if (
          popKey === 'publisher' ||
          popKey === 'pub_account_name' ||
          popKey === 'pub_campaign_name' ||
          popKey === 'pub_adgroup_name' ||
          (popKey === 'pub_creative_name' && this.publisher_id == 8)
        ) {
          tplHeader['cellTemplate'] = this.viewTitleCell;
        }
      }

      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];
      }
      if (lockedColumn.length === 0) {
        tplHeader['summaryFunc'] = () => '合计';
      }

      lockedColumn.push({
        prop: popKey,
        name: item.name,
        frozenLeft: true,
        width: item.width,
        ...tplHeader,
      });
    });

    const endLockedColumn = [];
    if (this.endLocked_items.length) {
      this.endLocked_items.forEach((item) => {
        const popKey = item.key;
        const tplHeader = {};
        if (popKey === 'pub_operation') {
          tplHeader['cellTemplate'] = this.operation;
          tplHeader['cellTemplateType'] = 'operation';
        }
        if (item.hasOwnProperty('sortable')) {
          tplHeader['sortable'] = item.sortable;
        }
        endLockedColumn.push({ prop: popKey + '_end', name: item.name, frozenRight: true, width: item.width, ...tplHeader });
      });
    }

    const timeFiledColumn = [];
    timeFiled.forEach((timeItem) => {
      let popKey = timeItem.key;
      if (timeItem.hasOwnProperty('showKey') && timeItem.showKey !== '') {
        popKey = timeItem.showKey;
      }
      const tplHeader = {};
      if (timeItem.hasOwnProperty('sortable')) {
        tplHeader['sortable'] = timeItem.sortable;
      }
      timeFiledColumn.push({
        prop: popKey,
        name: timeItem.name,
        resizeable: true,
        width: timeItem.width,
        ...tplHeader,
        frozenLeft: timeItem.frozenLeft,
        sortable: timeItem.sortable,
      });
    });

    const weekSplitFiledColumn = [];
    weekSplitFiled.forEach((timeItem) => {
      let popKey = timeItem.key;
      if (timeItem.hasOwnProperty('showKey') && timeItem.showKey !== '') {
        popKey = timeItem.showKey;
      }
      const tplHeader = {};
      if (timeItem.hasOwnProperty('sortable')) {
        tplHeader['sortable'] = timeItem.sortable;
      }

      if (this.allFilterOption.hasOwnProperty('data_weekSplit')) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption['data_weekSplit'];
      }

      weekSplitFiledColumn.push({ prop: popKey, name: timeItem.name, resizeable: true, width: timeItem.width, ...tplHeader, frozenLeft: timeItem.frozenLeft, sortable: timeItem.sortable });

    });

    const hourFiledColumn = [];
    hourFiled.forEach((hourItem) => {
      let popKey = hourItem.key;
      if (hourItem.hasOwnProperty('showKey') && hourItem.showKey !== '') {
        popKey = hourItem.showKey;
      }
      const tplHeader = {};
      if (hourItem.hasOwnProperty('sortable')) {
        tplHeader['sortable'] = hourItem.sortable;
      }

      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];
      }

      hourFiledColumn.push({
        prop: popKey,
        name: hourItem.name,
        resizeable: true,
        width: hourItem.width,
        ...tplHeader,
        frozenLeft: hourItem.frozenLeft,
        sortable: hourItem.sortable,
      });
    });
    const regionFiledColumn = [];

    regionFiled.forEach((regionItem) => {
      let popKey = regionItem.key;
      if (regionItem.hasOwnProperty('showKey') && regionItem.showKey !== '') {
        popKey = regionItem.showKey;
      }
      const tplHeader = {};
      if (regionItem.hasOwnProperty('sortable')) {
        tplHeader['sortable'] = regionItem.sortable;
      }

      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];
      }
      regionFiledColumn.push({ prop: popKey, name: regionItem.name, resizeable: true, width: regionItem.width, ...tplHeader, frozenLeft: regionItem.frozenLeft, sortable: regionItem.sortable });
    });
    this.columns = [];
    this.columns.push(...checkFiled);
    if (this.time_grain_filter === 'hour_day') {
      this.columns.push(...timeFiledColumn, ...hourFiledColumn);
    }
    if (this.time_grain_filter === 'day' || this.time_grain_filter == 'week' || this.time_grain_filter == 'month') {
      this.columns.push(...timeFiledColumn);
    }


    if (this.time_grain_filter === 'hour_weekSplit') {
      this.columns.push(...weekSplitFiledColumn, ...hourFiledColumn);
    }

    if (this.time_grain_filter === 'region_day') {
      this.columns.push(...timeFiledColumn, ...regionFiledColumn);
    }


    if (this.time_grain_filter === 'weekSplit') {
      this.columns.push(...weekSplitFiledColumn);
    }

    if (this.time_grain_filter === 'hour') {
      this.columns.push(...hourFiledColumn);
    }
    if (this.time_grain_filter === 'region') {
      this.columns.push(...regionFiledColumn);
    }
    if (this.source_summary === 'target') {
      this.columns.push(...lockedColumn, ...tmpFiled);
    } else if (this.source_summary === 'search_keyword') {
      this.columns.push(...lockedColumn, ...tmpFiled, ...endLockedColumn);
    } else {
      if (this.publisher_id === 24 && this.source_summary === 'adgroup') {
        this.columns.push(...lockedColumn, ...operateFiled, ...dataAnalysis, ...tmpFiled);
      } else {
        this.columns.push(...lockedColumn, ...dataAnalysis, ...tmpFiled);
      }
    }

    const findOrderKey = this.columns.find((item) => {
      return item.prop === this.viewTableData['sort_item'].key;
    });
    if (isUndefined(findOrderKey)) {
      this.viewTableData['sort_item'] = { key: 'pub_cost', dir: 'desc' };
      this.defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];
    } else {
      // this.defaultSortItems
    }
  }

  childPageState(state) {
    if (state === 'false') {
      this.isJump = '';
      this.selected = [];
      this.selected.splice(0, this.selected.length);
      this.selectedType = 'current';
    }
    if (state === 'refresh') {
      this.isJump = '';
      this.selected = [];
      this.selected.splice(0, this.selected.length);
      this.selectedType = 'current';
      this.refreshData();
    }
  }

  jumpToEdit(source = 'edit', count?) {
    // 重置已选长度
    this.selectedLength = 0;
    this.editParameter['pageInfo'] = this.pageInfo;
    let editSource = true;
    if (source !== 'edit') {
      editSource = false;
      if (this.selected.length === 0 && this.pageInfo.allCount <= this.pageInfo.pageSize) {
        this.editParameter.selected_type = 'current';
        this.editParameter.selected_data = [...this.rows];
      } else if (this.selected.length === 0) {
        this.editParameter.selected_type = 'all';
      } else if (this.selectedType === 'current' || this.pageInfo.allCount <= this.pageInfo.pageSize) {
        this.editParameter.selected_type = 'current';
        this.editParameter.selected_data = this.selected;
      } else {
        this.editParameter.selected_type = 'all';
      }
      this.editParameter['count'] = count;

    } else {
      if (this.selected.length === 0) {
        this._message.error('请选择' + this.summary_type_name[this.source_summary]);
        return;
      }
      this.editParameter.selected_type = this.selectedType;
      if (this.pageInfo.allCount <= this.pageInfo.pageSize) {
        this.editParameter.selected_type = 'current';
      }
      this.editParameter.selected_data = this.selected;
    }
    this.editParameter.allViewTableData = this.viewTableData;
    this.editParameter.edit_source = editSource;

    if (this.editParameter.selected_data.length > 0 || this.editParameter.selected_type === 'all') {
      this.isJump = 'true';
      localStorage.setItem('edit_state', 'true');
    } else {
      this.isJump = '';
    }

  }
  setAutomationTactic() {
    if (this.selected.length === 0) {
      this._message.error('请选择' + this.summary_type_name[this.source_summary]);
      return;
    }

    const drawerRef = this.drawerService.create<SetAutomationTacticComponent>({
      nzTitle: '选择自动化策略',
      nzWidth: 1000,
      nzContent: SetAutomationTacticComponent,
      nzContentParams: {
        summaryType: this.source_summary,
        selectedEntities: this.selected,
      }
    });

    drawerRef.afterClose.subscribe(data => {
      if (data === 'onSuccess') {
        // 清空已选项
        this.selectedLength = 0;
        this.refreshData();
      }

    });

  }

  getConditionData() {
    const oauth_local = JSON.parse(localStorage.getItem('data_range_data'));
    return oauth_local;
  }
  clickViewTitle(row) {
    switch (this.source_summary) {
      case 'publisher':
        const condition_range = {
          select_type: 'publisher',
          select_data: [row['publisher_id']],
        };
        localStorage.setItem(
          'data_range_data',
          JSON.stringify(condition_range),
        );
        this.router.navigateByUrl('/data_view/feed/account');
        break;
      case 'account':
        const condition_range1 = {
          select_type: 'account',
          select_data: [
            row['publisher_id'] +
            '_' +
            row['chan_pub_id'] +
            '_' +
            row['pub_account_id'],
          ],
        };
        localStorage.setItem(
          'data_range_data',
          JSON.stringify(condition_range1),
        );

        this.router.navigateByUrl('/data_view/feed/campaign');

        break;
      case 'campaign':
        const condition_range2 = {
          select_type: 'campaign',
          select_data: [
            row['publisher_id'] +
            '_' +
            row['chan_pub_id'] +
            '_' +
            row['pub_account_id'] +
            '_' +
            row['pub_campaign_id'],
          ],
        };
        localStorage.setItem(
          'data_range_data',
          JSON.stringify(condition_range2),
        );

        this.router.navigateByUrl('/data_view/feed/group');

        break;
      case 'adgroup':
        const condition_range3 = {
          select_type: 'adgroup',
          select_data: [
            row['publisher_id'] +
            '_' +
            row['chan_pub_id'] +
            '_' +
            row['pub_account_id'] +
            '_' +
            row['pub_campaign_id'] +
            '_' +
            row['pub_adgroup_id'],
          ],
        };
        localStorage.setItem(
          'data_range_data',
          JSON.stringify(condition_range3),
        );
        if (row['campaign_type'] == '搜索') {
          this.router.navigateByUrl('/data_view/feed/keyword');
        } else {
          this.router.navigateByUrl('/data_view/feed/creative');
        }

        break;
    }
  }

  checkTo(row, toSummary) {
    switch (this.source_summary) {
      case 'adgroup':
        const condition_range3 = {
          select_type: 'adgroup',
          select_data: [
            row['publisher_id'] +
            '_' +
            row['chan_pub_id'] +
            '_' +
            row['pub_account_id'] +
            '_' +
            row['pub_campaign_id'] +
            '_' +
            row['pub_adgroup_id'],
          ],
        };
        localStorage.setItem(
          'data_range_data',
          JSON.stringify(condition_range3),
        );
        this.router.navigate(['../' + toSummary], { relativeTo: this.route });
        break;
    }

  }
  generateTimeShow() {
    this.timeDesc = generateTimeTip(this.viewTableData['summary_date'], this.viewTableData['summary_date_compare'], this.viewTableData['is_compare']);
  }

  generateTime() {
    return generateTimeResult(this.viewTableData['summary_date'], this.viewTableData['summary_date_compare'], this.viewTableData['is_compare']);
  }

  generateHour() {
    return { current: '0:00  至 24:00 ', compare: '' };
  }

  changePage(page) {
    this.pageInfo.currentPage = page.page;
    this.refreshData();
    this.refreshCount();
  }

  changePageSize(pageSize) {
    this.pageInfo.currentPage = 1;
    this.reloadData(false);
  }

  sortView(event) {
    const sortInfo = event.sorts[0];
    let orderKey = sortInfo.prop;

    if (isUndefined(event.prevValue)) {
      sortInfo.dir = 'desc';
    }
    this.defaultSortItems = [{ prop: orderKey, dir: sortInfo.dir }];

    if (orderKey === 'publisher') {
      orderKey = 'publisher_id';
    }
    this.viewTableData['sort_item'] = { key: orderKey, dir: sortInfo.dir };

    this.refreshData();
  }

  // ---- mark -- start
  createBookMark($event) {
    const new_modal = this.modalService.create({
      nzTitle: $event === 'edit' ? '编辑书签页' : '添加当前页为书签',
      nzWidth: 600,
      nzContent: AppBookmarkModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'new-dashboard-modal',
      nzFooter: null,
      nzComponentParams: {
        summaryType: this.source_summary,
        sheetSetting: {
          table_setting: this.viewTableData,
        },
      },
    });
    new_modal.afterClose.subscribe((result) => {
      if (isObject(result) && result.hasOwnProperty('status')) {
        if (result['status'] === 'Ok') {
          this.viewMark.refreshList();
        }
      }
    });
  }

  saveBookMark($event) {
    const new_modal = this.modalService.create({
      // nzTitle: ($event === 'edit') ? '编辑书签页' : '添加当前页为书签',
      nzWidth: 400,
      nzContent: AppBookmarkSaveModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'new-dashboard-modal',
      nzFooter: null,
      nzComponentParams: {
        summaryType: this.source_summary,
        sheetSetting: {
          table_setting: this.viewTableData,
        },
        bookmarkItem: $event,
      },
    });
    new_modal.afterClose.subscribe((result) => {
      if (result === 'Ok') {
        this.viewMark.refreshList();
      }
    });
  }

  changeSelectedBookMark(bookMark) {
    this.viewTableData = Object.assign(
      this.viewTableData,
      bookMark['table_setting'],
    );

    this.time_grain_filter = this.getTimeGrainFilter(this.viewTableData.report_type, this.viewTableData.time_grain);
    this.time_grain = this.time_grain_filter;

    //清理单选
    Object.values(this.allFilterOption).forEach((filter) => {
      if (Object.keys(filter['filterResult']).length > 0) {
        if (bookMark['table_setting']['single_condition'].length === 0) {
          filter['filterResult'] = [];
          return false;
        }
        bookMark['table_setting']['single_condition'].forEach((item) => {
          if (filter['filterKey']['key'] === item['key']) {
            return false;
          }
          filter['filterResult'] = [];
        });
      }
    });

    if (this.getConditionData()) {
      bookMark['table_setting']['single_condition'] = [];
      this.viewTableData['single_condition'] = [];
    }
    if (
      this.viewTableData['single_condition'] &&
      this.viewTableData['single_condition'].length > 0
    ) {
      this.viewTableData['single_condition'].forEach((item) => {
        if (
          item.hasOwnProperty('relishKey') &&
          this.allFilterOption.hasOwnProperty(item['relishKey'])
        ) {
          this.allFilterOption[item['relishKey']]['filterResult'] = { ...item };
        } else if (this.allFilterOption.hasOwnProperty(item['key'])) {
          this.allFilterOption[item['key']]['filterResult'] = { ...item };
        } else {
          this.allFilterOption[item['key']] = {
            filterType: 'numberFilter',
            filterOption: [],
            filterKey: {
              key: item['key'],
              data_type: item['data_type'],
              name: item['name'],
              type: 'numberFilter',
            },
            filterResult: { ...item },
          };
        }
      });
    }

    this.sortBySummaryType();
    if (this.getConditionData()) {
      this.viewTableData.data_range = [];
      this.viewTableData.data_range = this.getConditionData();
      this.refreshFields(this.viewTableData['selected_items']);
      this.generateTimeShow();
      this.reloadData(true);
      localStorage.removeItem('data_range_data');
    } else {
      this.refreshFields(this.viewTableData['selected_items']);
      this.generateTimeShow();
      this.refreshSummaryData();
      this.refreshData(true);

      this.refreshCount();
    }
  }

  // ---- mark -- end

  // -- report create

  cancelCreateReport() {
    this.showCreateReport = false;
  }

  handCreateReport() {
    if (this.reportPosting) {
      return false;
    }

    // this.viewTableData.time_grain = this.time_grain;
    this.reportPosting = true;
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));

    if (this.viewReportSetting.report_freq == 'hour') {
      this.viewReportSetting['cron_time'] = this.cron_minute;
    } else if (this.cron_time) {
      const hour = this.cron_time.getHours();
      const minutes = this.cron_time.getMinutes();
      this.viewReportSetting['cron_time'] = minutesToNum(hour, minutes);
    }

    //选择的只要有分时，报告类型传 hours_report ， 否则 传 basic_report
    if (this.time_grain === 'hour' || this.time_grain === 'hour_day' || this.time_grain === 'hour_weekSplit') {
      tmpViewTableData.report_type = 'hours_report';
    } else if (
      this.time_grain === 'region' ||
      this.time_grain === 'region_day'
    ) {
      tmpViewTableData.report_type = 'region_report';
    } else if (this.source_summary === 'target') {
      tmpViewTableData.report_type = 'target_report';
    } else {
      tmpViewTableData.report_type = 'basic_report';
    }

    if (tmpViewTableData.report_type === 'hours_report') {
      tmpViewTableData.summary_type =
        JSON.parse(JSON.stringify(this.source_summary)) + '_hour';
    } else if (tmpViewTableData.report_type === 'region_report') {
      tmpViewTableData.summary_type =
        JSON.parse(JSON.stringify(this.source_summary)) + '_region';
    } else if (tmpViewTableData.report_type !== 'target_report') {
      tmpViewTableData.summary_type = this.source_summary;
    }
    //选择的只要有分日，汇总传 day
    let grain = 'summary';
    if (this.time_grain.indexOf('day') > -1) {
      grain = 'day';
    } else if (this.time_grain === 'hour_weekSplit') {
      grain = 'weekSplit';
    } else if (['week', 'weekSplit', 'month'].includes(this.time_grain)) {
      grain = this.time_grain;
    }
    tmpViewTableData['time_grain'] = grain;
    this.viewReportSetting.time_grain = tmpViewTableData['time_grain'];
    // tmpViewTableData['time_grain'] = this.time_grain;
    if (
      tmpViewTableData['main_range'] === 'join' &&
      this.time_grain_filter === 'summary'
    ) {
      tmpViewTableData.condition.push({
        key: 'pub_impression',
        data_type: 'pub_metric_data',
        name: '展现',
        type: 'number',
        op: '>',
        value: 0,
      });
    }
    tmpViewTableData.condition.push(...tmpViewTableData.single_condition);
    tmpViewTableData.single_condition = [];

    const postBody = Object.assign({}, this.viewReportSetting, { channel_id: this.menuService.currentChannelId }, {
      sheets_setting: [
        {
          sheet_name: 'sheet_1',
          table_setting: tmpViewTableData,
          charts_setting: [],
          sheet_module: {
            table: false,
            line: true,
            bar: true,
            lineStack: true,
            pie: true,
          },
        },
      ],
      email_list: this.viewReportSetting.email_list.split('\n'),
      report_status: 2,
    });
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    this.reportService.createReport(postBody).subscribe(
      (data: any) => {
        if (data.status_code === 200) {
          this.showCreateReport = false;
          if (isObject(data['data']) && data['data'].hasOwnProperty('job_id')) {
            const notifyData = [];
            notifyData.push({
              report_id: data['data']['report_id'],
              job_id: data['data']['job_id'],
              cid: userOperdInfo.select_cid,
              uid: userOperdInfo.select_uid,
              report_name: this.viewReportSetting.report_name,
            });
            this.notifyService.notifyData.next({
              type: 'report',
              data: notifyData,
            });
          }
          this._message.success('保存报表成功，您可到报表页去查看并下载');
        } else {
          this._message.error('保存报表失败,请重试');
        }
      },
      (err: any) => {
        this._message.error('保存报表失败,请重试');

      },
      () => {
        this.reportPosting = false;
      },
    );
  }

  // -- report end

  // --- viewCahrt

  refreshChartData(type = 'day', click = false) {
    this.is_refresh = this.is_refresh + 1;
  }

  closeChart(event) {
    this.viewChartShow = event;
    this.toggleChart();
  }

  toggleChart() {
    this.viewChartShow = !this.viewChartShow;
    // if (this.viewChartShow) {
    //   this.bookMarkTop = this._chartDefaultHeight + this._bookMarkDefaultTop;
    //   this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 300;
    // } else {
    //   this.bookMarkTop = this._bookMarkDefaultTop;
    //   this.tableHeight = document.body.clientHeight - 60 - 65 - 30;
    // }
    //
    // setTimeout(() => {
    //   window.dispatchEvent(new Event('resize'));
    // }, 0);

    if (this.viewChartShow) {
      this.refreshChartData(this.showChartType);
    }
  }

  changeChartItem($event) {
    this.refreshChartData(this.showChartType);
  }

  // -- check
  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  // -- 保存或获取本地缓存的信息
  getLocalBookMark(summaryType) {
    const currentUser = this.authService.getCurrentUser();
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    const cacheKey =
      'view_mark_feed_' +
      this.publisher_id +
      '_' +
      summaryType +
      '_' +
      currentUser.user_id +
      '_' +
      userOperdInfo.select_uid +
      '_' +
      userOperdInfo.select_cid;
    return this.localSt.retrieve(cacheKey);
  }

  setLocalBookMark(
    summaryType,
    data: {
      summary_type: string;
      sheets_setting: { table_setting: any };
      pageSize: number;
      timeGrain: string;
    },
  ) {
    const currentUser = this.authService.getCurrentUser();
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    const cacheKey =
      'view_mark_feed_' +
      this.publisher_id +
      '_' +
      summaryType +
      '_' +
      currentUser.user_id +
      '_' +
      userOperdInfo.select_uid +
      '_' +
      userOperdInfo.select_cid;
    this.localSt.store(cacheKey, data);
  }

  openDataAnalysis(row) {
    row['analysis'] = true;
  }
  closeDataAnalysis(row) {
    row['analysis'] = false;
  }

  getRowHeight(row) {
    if (row === undefined) {
      return 220;
    }
    if (row['material_style']) {
      //百度创意
      if (row['material_style'].indexOf('大图') !== -1) {
        return 220;
      }
      if (row['material_style'].indexOf('三图') !== -1) {
        return 130;
      }
      if (row['material_style'].indexOf('单图') !== -1) {
        return 90;
      }
    } else if (row['image_mode']) {
      //头条创意
      if (['大图', '横版视频'].includes(row['image_mode'])) {
        return 220;
      }
      if (['组图'].includes(row['image_mode'])) {
        return 130;
      }
      if (['小图'].includes(row['image_mode'])) {
        return 90;
      }
      if (['大图竖图', '竖版视频'].includes(row['image_mode'])) {
        return 320;
      }
    } else if (row['image']) {
      //小红书创意
      return 150;
    } else {
    }

    return 50;
  }

  //--单个编辑关键词出价
  editPrice(row) {
    const rowKey = {
      1: 'bid_type',
      7: 'pricing',
      6: 'price_type',
    };

    let currentPriceCheckRule: any = {};
    if (this.publisher_id == 1 || this.publisher_id == 7 || this.publisher_id == 6) {
      let checkSpecialKey = 'publisher_' + this.publisher_id + '_' + row[rowKey[this.publisher_id]];
      if (this.editPriceParam.extraPriceRanges.hasOwnProperty(this.source_summary) && this.editPriceParam.extraPriceRanges[this.source_summary].hasOwnProperty(checkSpecialKey)) {
        currentPriceCheckRule = this.editPriceParam.extraPriceRanges[this.source_summary][checkSpecialKey];
      } else if (this.editPriceParam.priceRanges.hasOwnProperty(this.source_summary) && this.editPriceParam.priceRanges[this.source_summary].hasOwnProperty("publisher_" + this.publisher_id)) {
        currentPriceCheckRule = this.editPriceParam.priceRanges[this.source_summary]["publisher_" + this.publisher_id];
      }
    } else {
      if (this.editPriceParam.priceRanges.hasOwnProperty(this.source_summary) && this.editPriceParam.priceRanges[this.source_summary].hasOwnProperty("publisher_" + this.publisher_id)) {
        currentPriceCheckRule = this.editPriceParam.priceRanges[this.source_summary]["publisher_" + this.publisher_id];
      }
    }

    this.editPriceParam.currentPriceRangesCheck = currentPriceCheckRule;

    this.editPriceParam.publisherId = row.publisher_id * 1;
    this.editPriceParam.keywordPrice = row.price * 1;
    row['showEditPrice'] = true;
    row['showPriceBtn'] = true;
    this.priceCheckPage();
  }
  clickEditPriceCancel(row) {
    row['showEditPrice'] = false;
    row['showPriceBtn'] = false;
  }
  clickEditPriceOk(row) {
    this.editPriceParam.iswraing = false;
    this.priceCheckPage();
    if (!this.editPriceParam.iswraing) {
      const body = {
        select_type: 'current',
        data: {
          price: {
            is_edit: true,
            value: this.editPriceParam.keywordPrice,
            modify_type: 1,
            action: 1,
          },
        },
      };

      if (this.viewTableData.summary_type === 'adgroup') {
        body["select_type"] = 'current';
        body["select_data_type"] = 'adgroup';
        body['select_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_adgroup_id']];
        this.dataViewEditWrapService.editAdgroup(this.publisher_id, body, 'single', row).subscribe((result) => {
          if (result) {
            row['price'] = this.editPriceParam.keywordPrice;
            row['showEditPrice'] = false;
            row['showPriceBtn'] = false;
          }
        }, (err) => { }, () => { });
      } else if (this.viewTableData.summary_type === 'keyword') {
        if (this.publisher_id === 24) {
          body["select_type"] = 'current';
          body["select_data_type"] = 'keyword';
          body['select_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_keyword_id']];
          this.dataViewEditWrapService.editKeyword(this.publisher_id, body, 'single', row).subscribe((result) => {
            if (result) {
              row['price'] = this.editPriceParam.keywordPrice;
              row['showEditPrice'] = false;
              row['showPriceBtn'] = false;
            }
          }, (err) => { }, () => { });
        }
      }
    }

  }
  priceCheckPage() {
    this.editPriceParam.iswraing = false;
    if (this.editPriceParam.publisherId) {
      if (this.editPriceParam.currentPriceRangesCheck.hasOwnProperty('min') && this.editPriceParam.keywordPrice < this.editPriceParam.currentPriceRangesCheck['min']) {
        this.editPriceParam.iswraing = true;
        return false;
      }
      if (this.editPriceParam.currentPriceRangesCheck.hasOwnProperty('max') && this.editPriceParam.keywordPrice > this.editPriceParam.currentPriceRangesCheck['max']) {
        this.editPriceParam.iswraing = true;
        return false;
      }
    }
  }
  keywordPriceChange(event?) {
    this.priceCheckPage();
  }

  //--单个编辑OcpcBid
  editOcpcBid(row) {

    let currentPriceCheckRule: any = {};

    let checkSpecialKey = 'publisher_';
    if (this.publisher_id == 1) {
      checkSpecialKey += this.publisher_id + '_' + row['bid_type'];
      if (this.editOcpcBidParam.extraPriceRanges.hasOwnProperty(this.source_summary) && this.editOcpcBidParam.extraPriceRanges[this.source_summary].hasOwnProperty(checkSpecialKey)) {
        currentPriceCheckRule = this.editOcpcBidParam.extraPriceRanges[this.source_summary][checkSpecialKey];
      } else if (this.editOcpcBidParam.priceRanges.hasOwnProperty(this.source_summary) && this.editOcpcBidParam.priceRanges[this.source_summary].hasOwnProperty("publisher_" + this.publisher_id)) {
        currentPriceCheckRule = this.editOcpcBidParam.priceRanges[this.source_summary]["publisher_" + this.publisher_id];
      }
    } else if (this.publisher_id == 7) {
      checkSpecialKey += this.publisher_id + '_' + row['pricing'];
      if (this.editOcpcBidParam.extraPriceRanges.hasOwnProperty(this.source_summary) && this.editOcpcBidParam.extraPriceRanges[this.source_summary].hasOwnProperty(checkSpecialKey)) {
        currentPriceCheckRule = this.editOcpcBidParam.extraPriceRanges[this.source_summary][checkSpecialKey];
      } else if (this.editOcpcBidParam.priceRanges.hasOwnProperty(this.source_summary) && this.editOcpcBidParam.priceRanges[this.source_summary].hasOwnProperty("publisher_" + this.publisher_id)) {
        currentPriceCheckRule = this.editOcpcBidParam.priceRanges[this.source_summary]["publisher_" + this.publisher_id];
      }
    } else {
      if (this.editOcpcBidParam.priceRanges.hasOwnProperty(this.source_summary) && this.editOcpcBidParam.priceRanges[this.source_summary].hasOwnProperty("publisher_" + this.publisher_id)) {
        currentPriceCheckRule = this.editOcpcBidParam.priceRanges[this.source_summary]["publisher_" + this.publisher_id];
      }
    }

    this.editOcpcBidParam.currentPriceRangesCheck = currentPriceCheckRule;

    this.editOcpcBidParam.publisherId = row.publisher_id * 1;
    this.editOcpcBidParam.keywordPrice = row.ocpc_bid * 1;
    row['showEditOcpcBid'] = true;
    row['showOcpcBidBtn'] = true;
    this.ocpcBidCheckPage();
  }
  clickEditOcpcBidCancel(row) {
    row['showEditOcpcBid'] = false;
    row['showOcpcBidBtn'] = false;
  }
  clickEditOcpcBidOk(row) {
    this.editOcpcBidParam.iswraing = false;
    this.ocpcBidCheckPage();
    if (!this.editOcpcBidParam.iswraing) {
      const body = {
        select_type: 'current',
        data: {
          ocpc_bid: {
            is_edit: true,
            value: this.editOcpcBidParam.keywordPrice,
            modify_type: 1,
            action: 1,
          },
        },

      };

      if (this.viewTableData.summary_type === 'adgroup') {
        body["select_type"] = 'current';
        body["select_data_type"] = 'adgroup';
        body['select_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_adgroup_id']];
        this.dataViewEditWrapService.editAdgroup(this.publisher_id, body, 'single', row).subscribe((result) => {
          if (result) {
            row['ocpc_bid'] = this.editOcpcBidParam.keywordPrice;
            row['showEditOcpcBid'] = false;
            row['showOcpcBidBtn'] = false;
          }
        }, (err) => { }, () => { });
      }
    }

  }
  ocpcBidCheckPage() {
    this.editOcpcBidParam.iswraing = false;
    if (this.editOcpcBidParam.publisherId) {
      if (this.editOcpcBidParam.keywordPrice < this.editOcpcBidParam.priceRanges[this.editOcpcBidParam.publisherId]['min']) {
        this.editOcpcBidParam.iswraing = true;
        return false;
      }
      if (this.editOcpcBidParam.keywordPrice > this.editOcpcBidParam.priceRanges[this.editOcpcBidParam.publisherId]['max']) {
        this.editOcpcBidParam.iswraing = true;
        return false;
      }
    }
  }
  ocpcBidPriceChange(event) {
    this.ocpcBidCheckPage();
  }

  //--单个编辑预算

  editBudget(row) {
    this.editBudgetParam.publisherId = row.publisher_id * 1;
    if (row.budget * 1 === 0 || row.budget * 1 === -1) { // 不限定
      this.editBudgetParam.budgetRadio = 2;
    } else {
      this.editBudgetParam.budgetRadio = 1;
      this.editBudgetParam.budget = row.budget * 1;
    }

    this.editBudgetParam.budget = row.budget * 1;
    row['showBudget'] = true;
    row['showBudgetBtn'] = true;
    this.budgetCheckPage();
  }
  clickEditBudgetCancel(row) {
    row['showBudget'] = false;
    row['showBudgetBtn'] = false;
  }
  clickEditBudgetOk(row) {
    this.editBudgetParam.iswraing = false;
    this.budgetCheckPage();
    if (!this.editBudgetParam.iswraing) {
      const body = {
        select_type: 'current',
        data: {
          budget: {
            is_edit: true,
            value: this.editBudgetParam.budget,
          },
        },

      };
      if (this.editBudgetParam.budgetRadio === 2) {
        body.data.budget.value = null;
      } else {
        body.data.budget.value = this.editBudgetParam.budget;
      }

      if (this.viewTableData.summary_type === 'campaign') {
        body["select_type"] = 'current';
        body["select_data_type"] = 'campaign';
        body['select_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_campaign_id']];
        this.dataViewEditWrapService.editCampaign(this.publisher_id, body, 'single', row).subscribe((result) => {
          if (result) {
            if (this.editBudgetParam.budgetRadio === 2) {
              row['budget'] = 0;
            } else {
              row['budget'] = this.editBudgetParam.budget;
            }
          }
          row['showBudget'] = false;
          row['showBudgetBtn'] = false;
        }, (err) => { }, () => { });
      } else if (this.viewTableData.summary_type === 'account') {
        body["select_type"] = 'current';
        body["select_data_type"] = 'account';
        body['select_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id']];
        if (this.editBudgetParam.budgetRadio === 1) {
          body['cron_setting'] = this.editBudgetParam.cron_setting;
        }
        if (this.editBudgetParam.budgetRadio === 3) {
          body['cron_setting'] = this.editBudgetParam.cron_setting;
          body.data.budget.value = this.editBudgetParam.price;
          body.data.budget['action'] = this.editBudgetParam.action;
        }
        if (this.editBudgetParam.budgetRadio === 2) {
          body['cron_setting'] = this.editBudgetParam.cron_setting;
          body.data.budget.value = null;
        }
        this.dataViewEditWrapService.editAccount(this.publisher_id, body, 'single', row).subscribe((result) => {
          if (result) {
            if (this.editBudgetParam.budgetRadio === 2) {
              row['budget'] = 0;
            } else {
              row['budget'] = this.editBudgetParam.budget;
            }
            row['showBudget'] = false;
            row['showBudgetBtn'] = false;
          }
        }, (err) => { }, () => { });
      } else if (this.viewTableData.summary_type === 'adgroup') {
        body["select_type"] = 'current';
        body["select_data_type"] = 'adgroup';
        body['select_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_adgroup_id']];
        this.dataViewEditWrapService.editAdgroup(this.publisher_id, body, 'single', row).subscribe((result) => {
          if (result) {
            if (this.editBudgetParam.budgetRadio === 2) {
              row['budget'] = 0;
            } else {

              row['budget'] = this.editBudgetParam.budget;
            }
            row['showBudget'] = false;
            row['showBudgetBtn'] = false;
          }
        }, (err) => { }, () => { });
      }

    }
  }
  budgetCheckPage() {
    this.editBudgetParam.iswraing = false;
    if (this.editBudgetParam.budgetRadio === 1) {
      if (this.editBudgetParam.publisherId) {
        if (this.editBudgetParam.budgetRanges[this.source_summary][this.editBudgetParam.publisherId].hasOwnProperty('min')) {
          if (this.editBudgetParam.budget < this.editBudgetParam.budgetRanges[this.source_summary][this.editBudgetParam.publisherId]['min']) {
            this.editBudgetParam.iswraing = true;
            return false;
          }
        }
        if (this.editBudgetParam.budgetRanges[this.source_summary][this.editBudgetParam.publisherId].hasOwnProperty('max')) {
          if (this.editBudgetParam.budget > this.editBudgetParam.budgetRanges[this.source_summary][this.editBudgetParam.publisherId]['max']) {
            this.editBudgetParam.iswraing = true;
            return false;
          }
        }
      }
    }
    if (this.editBudgetParam.budgetRadio == 3) {
      if (!this.editBudgetParam.price) {
        this.editBudgetParam.iswraing = true;
        return false;
      }
    }
  }
  budgetChange(event?) {
    this.budgetCheckPage();
  }
  budgetRadioChange(event?) {
    this.editBudgetParam.iswraing = false;
  }

  //--单个编辑状态
  setStatus(row, status, result, key = 'status') {
    const body = {
      select_type: 'current',
      data: {
        pause: {
          is_edit: true,
          value: status,
        },
      },
    };
    const message_modal = this.modalService.create({
      nzTitle: '编辑状态',
      nzWidth: 400,
      nzContent: EditMessageComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'edit-message',
      nzFooter: null,
      nzComponentParams: {
        editData: status,
      },
    });
    message_modal.afterClose.subscribe((data) => {
      if (data === 'onOk') {
        switch (this.source_summary) {
          case 'creative':
            body["select_type"] = 'current';
            body["select_data_type"] = 'creative';
            if (this.publisher_id == 6) {
              body['select_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_ad_id']];
            } else {
              body['select_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_creative_id']];
            }
            this.dataViewEditWrapService.editCreative(this.publisher_id, body, 'single', row).subscribe((resultFlag) => {
              if (resultFlag) {
                row[key] = result;
              }
            }, (err) => { }, () => { });
            break;
          case 'adgroup':
            body["select_type"] = 'current';
            body["select_data_type"] = 'adgroup';
            body['select_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_adgroup_id']];
            this.dataViewEditWrapService.editAdgroup(this.publisher_id, body, 'single', row).subscribe((resultFlag) => {
              if (resultFlag) {
                row[key] = result;
              }
            }, (err) => { }, () => { });
            break;
          case 'campaign':
            body["select_type"] = 'current';
            body["select_data_type"] = 'campaign';
            body['select_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_campaign_id']];
            this.dataViewEditWrapService.editCampaign(this.publisher_id, body, 'single', row).subscribe((resultFlag) => {
              if (resultFlag) {
                row[key] = result;
              }
            }, (err) => { }, () => { });
            break;
        }

      }
    });

  }

  private getReportName() {
    let reportName = '自定义报表-' + this.summary_type_name[this.source_summary];
    if (this.source_summary == 'target') {
      const currentTargetSummary = this.currentTargetSummaryTypeList.find((item) => item.key === this.targetSummaryTypeId);
      if (currentTargetSummary !== undefined) {
        reportName += '-' + currentTargetSummary.name;
      }

      const currentTarget = this.currentTargetTypeList.find((item) => item.key === this.target_type);
      if (currentTarget !== undefined) {
        reportName += '-' + currentTarget.name;
      }
    }

    return reportName;
  }


  changeDataViewUrl(viewType) {
    if (this.viewType === viewType) return;
    if (viewType === 'view') {
      this.router.navigate(['./'], { relativeTo: this.route });
    } else {
      this.router.navigate(['./' + viewType], { relativeTo: this.route });
    }
    this.viewType = viewType;

  }

  batchUpload(type?) {
    let uploadTitle = '上传' + this.summary_type_name[this.source_summary];
    if (type === 'xhs_all') { uploadTitle = '全流程上传'; }
    const add_modal = this.modalService.create({
      nzTitle: uploadTitle,
      nzWidth: 800,
      nzContent: ViewBatchUploadComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        summaryType: this.source_summary,
        channelId: this.menuService.currentChannelId,
        publisherId: this.menuService.currentPublisherId,
        uploadType: type,
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        // this.refreshData();
      }
    });
  }

  reloadFirstPage() {
    this.pageInfo.currentPage = 1;
    this.reloadData();
  }


  stopRanking() {
    if (!isNull(this.refreshRankingObserver)) {
      this.refreshRankingObserver.unsubscribe();
      this.refreshRankingSetting.status = 'stop';
    }
  }

  queryRanking(row?) {
    if (this.selected.length) { //有选中
      const publisherData = this.getParentPublishers(this.selected);
      const params = {
        ranking_setting: this.ranking_setting,
        publisherCount: publisherData['publisherCount'],
        isFeed: true,
      };
      if (publisherData['publisherCount'] === 1) {
        params['publisher_id'] = publisherData['publisher_array'][0]['value'];
      }
      const rankingModal = this.modalService.create({
        nzTitle: '查询实时排名',
        nzWidth: 600,
        nzContent: QueryRankingComponent,
        nzClosable: false,
        nzMaskClosable: false,
        nzWrapClassName: 'query-ranking',
        nzFooter: null,
        nzComponentParams: params,
      });
      rankingModal.afterClose.subscribe((result) => {
        if (isObject(result) && result['status'] === 'ok') {
          this.refreshRankingCode(result['data']);
          this.ranking_setting = result['saveData'];
        }
      });

    } else { //无选中，默认当前页

      const publisherData = this.getParentPublishers(this.rows);

      const params = {
        ranking_setting: this.ranking_setting,
        publisherCount: publisherData['publisherCount'],
        isFeed: true,
      };
      if (publisherData['publisherCount'] === 1) {
        params['publisher_id'] = publisherData['publisher_array'][0]['value'];
      }

      const rankingModal = this.modalService.create({
        nzTitle: '查询实时排名',
        nzWidth: 600,
        nzContent: QueryRankingComponent,
        nzClosable: false,
        nzMaskClosable: false,
        nzWrapClassName: 'query-ranking',
        nzFooter: null,
        nzComponentParams: params,
      });
      rankingModal.afterClose.subscribe((result) => {
        if (isObject(result) && result['status'] === 'ok') {
          this.refreshRankingCode(result['data']);
          this.ranking_setting = result['saveData'];
        }
      });
    }

  }
  ngOnDestroy(): void {
    this.rows = null;
    this.sub.unsubscribe();
    this.refreshRankingSingleComplete$.unsubscribe();
    // this.clearNoImpressionNotify();
  }

  refreshRankingCode(setting, row?) {
    if (row) {
      this.refreshRankingSetting.rankingData = [row];
      this.refreshRankingSetting.allCount = 1;
      this.refreshRankingSetting.currentIndex = -1;
    } else if (this.selected.length > 0) {
      this.refreshRankingSetting.rankingData = this.selected;
      this.refreshRankingSetting.allCount = this.selected.length;
      this.refreshRankingSetting.currentIndex = -1;
    } else {
      this.refreshRankingSetting.rankingData = this.rows;
      this.refreshRankingSetting.allCount = this.rows.length;
      this.refreshRankingSetting.currentIndex = -1;
    }
    this.refreshRankingSetting.status = 'start';
    if (!isNull(this.refreshRankingObserver)) {
      this.refreshRankingObserver.unsubscribe();
    }

    this.refreshRankingObserver = this.refreshRankingSingleComplete$.subscribe((item) => {
      this.refreshRankingSetting.currentIndex++;
      if (this.refreshRankingSetting.currentIndex + 1 > this.refreshRankingSetting.allCount) {
        // -- return
        this.refreshRankingSetting.status = 'stop';
        if ("Notification" in window) {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              const rankingNotify = new Notification('排名刷新成功', {
                body: '排名刷新成功,请查阅',
                tag: 'ranking_notify',
              });
              rankingNotify.onclick = function () {
                window.focus();
              };
            }
          });
        }

      } else {
        this.initRankingCode(setting, this.refreshRankingObserver);
      }
    });
    for (let i = 0; i < this.refreshRankingSetting.maxRun; i++) {
      this.refreshRankingSingleComplete$.next(1);
    }

  }

  initRankingCode(setting, originObserver) {
    if (originObserver !== this.refreshRankingObserver) {
      return;
    }
    const readyIndex = this.refreshRankingSetting.currentIndex;
    if (readyIndex >= this.refreshRankingSetting.allCount) {
      return;
    }
    this.startGetRankingCode(setting, this.refreshRankingSetting.rankingData[readyIndex], readyIndex, originObserver);
  }

  startGetRankingCode(setting, row, index, originObserver) {
    const queryParams = {};
    const detailInfo = {};

    detailInfo['chan_pub_id'] = row['chan_pub_id'];
    detailInfo['pub_adgroup_id'] = row['pub_adgroup_id'];
    detailInfo['pub_campaign_id'] = row['pub_campaign_id'];
    detailInfo['pub_keyword_id'] = row['pub_keyword_id'];
    detailInfo['pub_keyword'] = row['pub_keyword'];
    detailInfo['index'] = 0;

    queryParams['publisher_id'] = row['publisher_id'];
    queryParams['region'] = setting['region'];
    queryParams['device'] = setting['device'];
    queryParams['region_default_flag'] = setting['region_default_flag'];
    if (setting['device_os']) {
      queryParams['device_os'] = setting['device_os'];
    }
    queryParams['pub_account_id'] = row['pub_account_id'];

    const rowIndex = this.rows.indexOf(row);
    if (rowIndex === -1) {
      return;
    }
    this.rows[rowIndex]['rankingLoading'] = true;
    this.dataViewService.getRankingCode({ detail_info: detailInfo }, queryParams).subscribe((resultData) => {
      if (resultData['status_code'] === 200) {
        this.rows[rowIndex]['ranknow'] = resultData['data']['ranknow'];
        this.rows[rowIndex]['rank_1'] = resultData['data']['rank_1'];
        this.rows[rowIndex]['rank_2'] = resultData['data']['rank_2'];
        this.rows[rowIndex]['rank_3'] = resultData['data']['rank_3'];
        this.rows[rowIndex]['rank_4'] = resultData['data']['rank_4'];
        this.rows[rowIndex]['ranking_device'] = resultData['data']['device'];
        this.rows[rowIndex]['ranking_time'] = resultData['data']['time'];
        this.rows[rowIndex]['region_name'] = resultData['data']['region_name'];
        this.rows[rowIndex]['html_id'] = resultData['data']['html_id'] || "";
        this.rows[rowIndex]['html_status'] = '0';
      }
      this.rows[rowIndex]['rankingLoading'] = false;
      if (originObserver === this.refreshRankingObserver) {
        this.refreshRankingSingleComplete$.next(index);

      }
    });

  }

  getParentPublishers(data) {
    const publishers = {};
    const publisherArray = [];
    let number = 0; //记录有几种媒体
    data.forEach((item) => {
      if (!publishers.hasOwnProperty(item.publisher_id)) {
        publishers[item.publisher_id] = 1;
        publisherArray.push({
          name: item['publisher'],
          value: item['publisher_id'] * 1,
        });
        number++;
      }
    });
    return {
      publisher_array: publisherArray,
      publisherCount: number,
    };
  }

  getDiffHour(date) {

    const nowTime: any = new Date();
    const beforeTime: any = new Date(date);
    return (nowTime - beforeTime) / 1000 / 60 / 60;
  }

  seeView(row) {
    if (this.clickReal) {
      return false;
    }
    const parm = {
      html_id: row['html_id'],
      source: "keyword",
      source_data: {
        chan_pub_id: row['chan_pub_id'],
        pub_keyword_id: row['pub_keyword_id'],
      },
    };

    const select_uid = this.authService.getCurrentUserOperdInfo()['select_uid'];
    const select_cid = this.authService.getCurrentUserOperdInfo()['select_cid'];

    let frame: number;
    row['ranking_device'] * 1 === 1 ? frame = 0 : frame = 1;

    this.clickReal = true;

    if (row['html_status'] * 1 !== 2) {

      row['realLoading'] = true; //实况页面第一次请求中

      this.dataViewService.checkRankingHtml(parm).subscribe((result) => {
        if (result['status_code'] === 200) {
          window.open(environment.SERVER_API_URL + "/publisher_base/get_html?html_id=" + result['data']['html_id'] + "&frame=" + frame + "&user_id=" + select_uid + "&cid=" + select_cid);
          this.clickReal = false;
          row['realLoading'] = false;
        } else {
          this._message.warning('当前实况页面已过期，请重新刷新');
          this.clickReal = false;
          row['realLoading'] = false;
        }
      });
    } else {
      this.clickReal = false;
    }
  }

  clearFilter() {
    const colKeyList = this.columns.map(item => item.prop);
    Object.values(this.allFilterOption).forEach((filter) => {
      const filterKey = filter['filterResult'] && filter['filterResult']['key'];
      if (!colKeyList.includes(filterKey)) {
        filter['filterResult'] = {};
      }
    });
  }

  disabledDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0;
  }

  changeCronTime() {
    this.editBudgetParam.cron_setting = format(new Date(this.editBudgetParam.cron_setting_time), 'yyyy-MM-dd HH:mm');
  }

  cronSettingChange() {
    if (this.editBudgetParam.cron_setting_type === 'now') {
      this.editBudgetParam.cron_setting = 'now';
    } else {
      this.editBudgetParam.cron_setting = format(new Date(this.editBudgetParam.cron_setting_time), 'yyyy-MM-dd HH:mm');
    }
  }

  onFreqChange() {
    if (this.viewReportSetting.report_freq === 'day') {
      this.cron_time = new Date(2019, 3, 12, 10, 30, 0);
    } else {
      this.cron_time = new Date(2019, 3, 12, 12, 0, 0);
    }
  }

  //设置不可用时间点
  disabledHours = (): number[] => {
    const arr = [];
    let hour = 10;
    if (this.viewReportSetting.report_freq !== 'day') {
      hour = 12;
    }
    for (let i = 0; i < hour; i++) {
      arr.push(i);
    }
    return arr;
  }

  disabledMinutes = (hour: number): number[] => {
    const arr = [];
    let minutes = 0;
    // if (this.viewReportSetting.report_freq === 'day') {
    //   if (hour <= 10) {
    //     minutes = 30;
    //   }
    // }
    for (let i = 0; i < minutes; i++) {
      arr.push(i);
    }
    return arr;
  }

}
