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
import { NzNotificationData, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { LocalStorageService } from "ngx-webstorage";
import { isNull, isNumber, isObject, isUndefined, minutesToNum } from "@jzl/jzl-util";
import { AuthService } from "../../core/service/auth.service";
import { TableFieldComponent } from "../../module/table-setting/components/table-field/table-field.component";
import { TableQueryComponent } from "../../module/table-setting/components/table-query/table-query.component";
import { generateTimeResult, generateTimeTip } from '@jzl/jzl-util';
import { ReportService } from "../report/service/report.service";
import { DataViewService } from "./service/data-view.service";
import { ViewItemService } from "./service/view-item.service";

import { Subject, Subscription } from "rxjs";
import { ViewBookmarkComponent } from "../../module/bookmark/components/view-bookmark.component";
import { AppBookmarkModalComponent } from "../../module/bookmark/modal/app-bookmark-modal.component";

import { differenceInCalendarDays } from "date-fns";
import { environment } from "../../../environments/environment";
import { AppBookmarkSaveModalComponent } from "../../module/bookmark/modal/app-bookmark-save-modal/app-bookmark-save-modal.component";
import { EditMessageComponent } from "../../module/edit-message/edit-message.component";
import { ItemSelectService } from "../../module/item-select/service/item-select.service";
import { NotifyService } from "../../module/notify/notify.service";
import { QueryRankingComponent } from "../../module/query-ranking/query-ranking.component";
import { TableItemService } from "../../module/table-setting/service/table-item.service";
import { TableTimeComponent } from '../../module/table-time/components/table-time/table-time.component';
import { ViewBatchUploadComponent } from "./modal/view-batch-upload/view-batch-upload.component";
import { DataViewOptimizationService } from './service/data-view-optimization.service';
import { DataViewFolderService } from './service/data-view-folder.service';
import { ViewBatchUploadDeleteComponent } from './modal/view-batch-upload-delete/view-batch-upload-delete.component';
import { copy2Clipboard } from '@jzl/jzl-util';
import { explainTableField } from '../../shared/util/util';
import { FengwuPreviewComponent } from "./modal/fengwu-preview/fengwu-preview.component";
import { MenuService } from "../../core/service/menu.service";

@Component({
  selector: 'app-keyword',
  templateUrl: './data-view.component.html',
  styleUrls: ['../../../styles/routes/routes.scss', './data-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TableItemService, DataViewOptimizationService, DataViewFolderService],
})
export class DataViewComponent implements OnInit, OnDestroy {
  public sub = new Subscription();
  public userSelectedOper: { select_uid: number, select_cid: number, role_id: number } = { select_uid: 0, select_cid: 0, role_id: 0 };
  public viewChartShow = false;
  public showChartType = 'day';
  /*public chartItems = [];
  public chartSelectedItem: Array<any> = [];*/
  public chartItems = [];
  public isJump = '';
  public viewType = 'view';

  public filterNoImpression = false;
  private noImpressionNotifyId: NzNotificationData;

  public chartOptions: any;

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

  loadingOpts = {
    text: 'Custom Loading',
    color: '#00bdfc',
    textColor: '#ff0000',
    maskColor: 'rgba(255, 255, 255, 0.6)',
    zlevel: 0,
  };
  /*  public chartInitOpts = {
      // renderer: 'svg',
      // width: 300,
      height: 272
    };*/
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
    search_keyword: 'pub_query',
    creative: 'pub_creative_title',
    advertiser: 'advertiser_name',
    department: 'department',
  };

  /*  public dataAnalysisParm = {
      'summary_date_range': [new Date(), new Date()],
      'summary_date_compare_range': [new Date(), new Date()],
      'is_compare': false
    };*/
  /*  public today = new Date();*/

  public defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];
  // public defaultSortItems = [sorts]="[{prop: 'name', dir: 'desc'}]">
  /* public is_compare = false;*/
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
    other_compare_date_list: [],
    summary_date_alias: '',
    summary_date_compare_alias: '',
    time_grain: 'summary',
    main_range: 'leftJoin',
    main_device: 'all',
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
    dsa_pattern_day: '高级样式',
    advertiser: '广告主',
    department: '事业部',
    ocpc_baidu: '百度_ocpc',
    creative_fengwu_360: '凤舞创意'
  };

  public viewReportSetting = {
    report_name: '自定义报表',
    report_data_type: 2,
    channel_id: 1,
    report_format: 'excel',
    report_freq: 'now',
    email_list: "",
    sheets_setting: [],
    time_grain: 'summary',
  };

  public source_summary = 'campaign';
  public editMatchTypeParam = {
    keywordMatchType: null,
    publisherId: null,
    iswraing: false,
  };
  public editPriceParam = {
    keywordPrice: null,
    publisherId: null,
    iswraing: false,
    priceRanges: {
      1: { min: 0.01, max: 999.99 },
      2: { min: 0.01, max: 999.99 },
      3: { min: 0.3, max: 9999.99 },
      4: { min: 0.45, max: 999.99 },
      10: { min: 0.01, max: 999.99 },
      24: { min: 0.3, max: 9999.99 },
    },
    adGroupPriceRange: {
      1: { min: 0.01, max: 999.99 },
      2: { min: 0.01, max: 999.99 },
      3: { min: 0.3, max: 999.99 },
      4: { min: 0.45, max: 999.99 },
      10: { min: 0.01, max: 999.99 },
      24: { min: 0.3, max: 9999.99 },
    }
  };
  public editPriceRatioParam = {
    priceRatio: null,
    priceRatioWap: null,
    publisherId: null,
    iswraing: false,
    priceRatioRanges: { min: 0, max: 10.00, extraInfo: '(0表述取消仅投放移动)' },
    priceRatioWapRanges: {
      1: { min: 0, max: 10.00 },
      2: { min: 0.10, max: 100.00 },
      3: { min: 0.1, max: 0.9, extraInfo: '且保留一位小数' },
    },
  };
  public editBudgetParam = {
    budget: null,
    publisherId: null,
    iswraing: false,
    budgetRadio: 1,
    budgetRanges: {
      1: { min: 50, extraInfo: '' },
      2: { min: 50, extraInfo: '' },
      3: { min: 30, extraInfo: '且为10的倍数' },
      4: { min: 10, extraInfo: '' },
      10: { min: 10, extraInfo: '' },
    },
  };
  public keywordData = {
    pub_keyword_ids: [],
    pause: {
      is_edit: false,
      value: false,
    },
    price: {
      is_edit: false,
      modify_type: 1, // 1 修改价格固定值 2 价格基础增加/降低值 3价格基础增加/降低比例
      action: 1, //1 提高 2 降低
      /* "value": 0*/
    },
    match_type: {
      is_edit: false,  //必填
      value: 1,
    },
    pc_destination_url: {
      is_edit: false,
      modify_type: 1, //1 直接修改 2 查找替换
      search: "",
      value: "",
    },
    wap_destination_url: {
      is_edit: false, //必填
      modify_type: 1,
      search: "",
      value: "",
    },
    tabs: {
      is_edit: false,
      value: [],  //标记 1 2 3 4 5 蓝绿黄橙红 0 取消
    },
    dimensions: {
      is_edit: false,
      value: {
      },
    },
  };

  public showCreateReport = false;
  public reportPosting = false;
  // public showQuickEdit = false;

  public editItemAllAndOr = {
    keyword: {
      all: [
        { name: '出价', value: 2 },
        { name: '匹配模式', value: 3 },
        { name: '投放状态', value: 1 },
      ],
      morePublisher: [
        { name: '出价', value: 2 },
        { name: '投放状态', value: 1 },
      ],
    },
    adgroup: {
      all: [
        { name: '出价', value: 12 },
      ],
      morePublisher: [
        { name: '出价', value: 12 },

      ],
    },
    ocpc_baidu: {
      all: [
        { name: '批量修改目标转化出价', value: 4 },
        { name: '批量修改深度转化出价', value: 5 },
      ],
    },
    ocpc_360_setting: {
      all: [
        { name: '批量修改目标转化出价', value: 4 },
      ],
    }
  };

  public quickEditParam = {
    showQuickEdit: false,
    quickEditItem: 2,
    publisherData: null,
    publisherId: null,
    showData: {
      pause: false,
      price: null,
      match_type: null,
    },
    result: null,
    editItem: [],
    is_warning: false,
    warning_info: '',
    clickPageCount: 0,
    saveing: false,

  };

  // public quickEditItem = 1;
  public dashBoardList = [];
  public tableHeight = document.body.clientHeight - 60 - 65 - 30;
  public rowHeight = 40;
  private defaultRowHeight = 40;

  public lineChartData = [];
  public barChartData = [];
  public is_refresh = 0;

  public rows = [];
  public summaryData = {};
  public selected = [];
  public selectedType = 'current';
  public selectedLength = 0;
  public rankingCode = { region: "9010000", device: 1 };
  public ranking_setting: any; //记录实时排名数据

  public columns = [];
  public timeDesc = '';
  public editParameter = {
    is_single_edit: false, //false:批量编辑 ， true：开启单条编辑
    selected_type: ' ',
    selected_data: [],
    allViewTableData: {},
    edit_source: true, //记录编辑来源 true：编辑  false：点击开关
  };

  public accountPublishers: any; //账户媒体
  public accountList: any; //账户列表
  public unitList: any; //单元
  public compainList: any; //计划
  public matchTypeData: any; //匹配模式
  public addWordData = {
    pub_keyword: '', //关键词名称 //必填
    pause: false, //开启 暂停   false：开启
    chan_pub_id: null,
    pub_account_id: null,  //账户
    publisher_id: null, //媒体
    pub_campaign_id: null, //计划 //必填
    pub_adgroup_id: null, // 单元  //必填
    match_type: null, //
    price: null,
  };

  public negativeWordGroupList: any; //否词包
  public addNegativeData = {
    pub_query: '',
    chan_pub_id: null,
    pub_account_id: null,  //账户
    publisher_id: null, //媒体
    pub_campaign_id: null, //计划 //必填
    pub_adgroup_id: null, // 单元  //必填
    match_type: 1 // 1，短语否定 2，精确否定
  };

  public addNegativeWordGroupData = {
    is_add: 0, // 0，否 1，是
    group_id: null, // 否词包
  };
  public negativeKeywordLength = 0;
  public clickReal = false;
  public noResultHeight = document.body.clientHeight - 300;
  public dataViewDrawerShow = false;

  public cron_time;
  public cron_minute = 0;

  public cronMinuteList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 55];

  public report_source_summary = "";

  public reportDrawerTitle = "ocpc报告";

  @ViewChild('chkHeader', { static: true }) chkHeader: TemplateRef<any>;
  @ViewChild('filterHeader', { static: true }) filterHeader: TemplateRef<any>;
  @ViewChild('refreshRankingHeader', { static: true }) refreshHeader: TemplateRef<any>;
  @ViewChild('dataAnalysisHeader', { static: true }) dataAnalysisHeader: TemplateRef<any>;

  @ViewChild('dataAnalysisCell', { static: true }) dataAnalysisCell: TemplateRef<any>;
  @ViewChild('refreshRankingCell', { static: true }) refreshCell: TemplateRef<any>;
  @ViewChild('chkCell', { static: true }) chkCell: TemplateRef<any>;
  @ViewChild('progressCell', { static: true }) progressCell: TemplateRef<any>;
  @ViewChild('rateCell', { static: true }) rateCell: TemplateRef<any>;
  @ViewChild('rateCellColor', { static: true }) rateCellColor: TemplateRef<any>;
  @ViewChild('cellColor', { static: true }) cellColor: TemplateRef<any>;
  @ViewChild('priceCell', { static: true }) priceCell: TemplateRef<any>;
  @ViewChild('matchTypeCell', { static: true }) matchTypeCell: TemplateRef<any>;

  @ViewChild('summaryCell', { static: true }) summaryCell: TemplateRef<any>;
  @ViewChild('summaryCellColor', { static: true }) summaryCellColor: TemplateRef<any>;
  @ViewChild('rateSummaryCell', { static: true }) rateSummaryCell: TemplateRef<any>;
  @ViewChild('rateSummaryCellColor', { static: true }) rateSummaryCellColor: TemplateRef<any>;

  @ViewChild('creativeCell', { static: true }) creativeCell: TemplateRef<any>;
  @ViewChild('creativeCellTemp', { static: true }) creativeCellTemp: TemplateRef<any>;
  @ViewChild('starTpl', { static: true }) starTpl: TemplateRef<any>;
  @ViewChild('operation', { static: true }) operation: TemplateRef<any>;
  @ViewChild('viewTitleCell', { static: true }) viewTitleCell: TemplateRef<any>;
  @ViewChild('budgetCell', { static: true }) budgetCell: TemplateRef<any>;
  @ViewChild('statusCell', { static: true }) statusCell: TemplateRef<any>;
  @ViewChild('pauseCell', { static: true }) pauseCell: TemplateRef<any>;
  @ViewChild('priceRatioPCCell', { static: true }) priceRatioPCCell: TemplateRef<any>;
  @ViewChild('priceRatioWapCell', { static: true }) priceRatioWapCell: TemplateRef<any>;
  @ViewChild('wapUrlCell', { static: true }) wapUrlCell: TemplateRef<any>;
  @ViewChild('pcUrlCell', { static: true }) pcUrlCell: TemplateRef<any>;
  @ViewChild('deepLinkUrlCell', { static: true }) deepLinkUrlCell: TemplateRef<any>;
  @ViewChild('scheduleCell', { static: true }) scheduleCell: TemplateRef<any>;
  @ViewChild('fengwuOperation', { static: true }) fengwuOperation: TemplateRef<any>;

  @ViewChild('quickEditButton') quickEditButton: any;
  @ViewChild('operateCell', { static: true }) operateCell: TemplateRef<any>;
  @ViewChild('campaignCntCell', { static: true }) campaignCntCell: TemplateRef<any>;
  @ViewChild('budgetOfflineCell', { static: true }) budgetOfflineCell: TemplateRef<any>;

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

  public loadingIndicator = false;
  public loadingCountIndicator = true;
  public reorderable = false;
  public allFilterOption: any;

  @ViewChild('viewTable', { static: true }) viewTable;
  @ViewChild('viewMark') viewMark: ViewBookmarkComponent;
  private _bookMarkDefaultTop = 116;
  private _chartDefaultHeight = 300;
  public bookMarkTop = 116;
  public pubTableItems = [];
  public optimization_group = [];
  public folder_list = [];
  public companyId = 0;

  public mapOfExpandedData = {};

  public scrollX = 0;

  public _indeterminate = false;
  public _allChecked = false;

  public curTableData = {};

  @ViewChild('nzSelectAdver') nzSelectAdver: NzSelectComponent;

  constructor(public dataViewService: DataViewService,
    public viewItemService: ViewItemService,
    public tableItemService: TableItemService,
    public itemSelectService: ItemSelectService,
    public reportService: ReportService,
    public authService: AuthService,
    public _message: NzMessageService,
    public modalService: NzModalService,
    public localSt: LocalStorageService,
    public router: Router,
    public route: ActivatedRoute,
    public notifyService: NotifyService,
    public renderer: Renderer2,
    public optimizationService: DataViewOptimizationService,
    public folderService: DataViewFolderService,
    public notification: NzNotificationService,
    public menuService: MenuService,
  ) {
    const summaryTypes = this.tableItemService.getSummaryTypes('basic_report');
    summaryTypes.forEach(element => { this.summary_type_name[element.key] = element.name; });
    this.userSelectedOper = this.authService.getCurrentUserOperdInfo();
    this.route.data.subscribe((data) => {
      this.viewTableData['summary_type'] = data['summaryType'];
      this.viewTableData['sub_summary_type'] = data['summaryType'];
      this.source_summary = data['summaryType'];
      if (this.viewTableData['summary_type'] === 'creative') {
        this.rowHeight = 80;
        this.defaultRowHeight = 80;
      }
      // this.chartItems = viewItemService.getChartItem();
      /*this.chartItems = viewItemService.getChartItem();
      this.chartSelectedItem.push(this.chartItems[0].key);
      this.viewTableData['selected_items_chart'] = [this.chartItems[0]];*/
    });
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
    this.companyId = this.authService.getCurrentUser().company_id;

    if (this.viewTableData.summary_type === 'search_keyword') {
      this.viewTableData.main_range = 'leftJoin';

      // 获取否词包
      this.getNegativeWordGroups();
    }
    this.editParameter['editParameter'] = this.getUrlParam('edit');
    this.viewReportSetting.report_name = '自定义报表-' + this.summary_type_name[this.source_summary];
    this.viewTableData['sort_item'] = { key: 'pub_cost', dir: 'desc' };
    this.viewTableData['selected_items'] = this.viewItemService.getDefaultItemsBySummaryType(this.source_summary);
    this.viewTableData['locked_items'] = this.viewItemService.getLockedItemsBySummaryType(this.source_summary);
    this.endLocked_items = this.viewItemService.getEndLockedItemsBySummaryType(this.source_summary);

    this.allFilterOption = JSON.parse(JSON.stringify(this.viewItemService.getItemFilterType(this.source_summary)));
    this.source_summary === 'keyword' && this.getOptimizationGroup();
    if (['keyword', 'adgroup', 'campaign', 'creative'].indexOf(this.source_summary) !== -1) {
      this.getFolderList();
    }
    // --- 获取默认
    const localMarkInfo = this.getLocalBookMark(this.source_summary);
    this.pubTableItems = this.tableItemService.getTableItemsObj(this.viewTableData.report_type, this.viewTableData.summary_type);
    if (localMarkInfo === null) {
      if (this.source_summary === 'keyword' || this.source_summary === 'creative') {
        this.viewTableData['main_range'] = 'join';
      }

      if (this.getConditionData()) {  //从视图固定列跳过来的逻辑
        this.viewTableData.data_range = this.getConditionData();
        localStorage.removeItem('data_range_data');
        this.refreshFields(this.viewTableData['selected_items']);
        this.generateTimeShow();
        this.reloadData(true);
      } else {
        this.refreshFields(this.viewTableData['selected_items']);
        this.generateTimeShow();
        this.refreshData(false, 'summary');
        this.refreshCount();
      }

    } else {
      if (localMarkInfo.hasOwnProperty('pageSize')) {
        this.pageInfo.pageSize = localMarkInfo['pageSize'];
      }

      if (localMarkInfo.hasOwnProperty('timeGrain')) {
        this.time_grain_filter = localMarkInfo['timeGrain'];
        this.time_grain = this.time_grain_filter;
      }


      if (this.source_summary !== 'ocpc_360' && this.source_summary !== 'ocpc_baidu' && this.source_summary !== 'creative_fengwu_360' && this.source_summary !== 'ocpc_360_setting') {

        const localLockedItems = localMarkInfo['sheets_setting']['table_setting']['locked_items'];
        const serviceLockedItems = this.viewTableData['locked_items'];

        let diffFlag = true;
        if (localLockedItems.length !== serviceLockedItems.length) {
          diffFlag = false;
        } else {
          diffFlag = serviceLockedItems.every((item, index) => {
            return item.key === serviceLockedItems[index].key;
          });
        }
        if (!diffFlag) {
          localMarkInfo['sheets_setting']['table_setting']['locked_items'] = serviceLockedItems;
          this.setLocalBookMark(this.source_summary, {
            summary_type: this.source_summary,
            sheets_setting: {
              table_setting: localMarkInfo['sheets_setting']['table_setting'],
            },
            pageSize: this.pageInfo.pageSize,
            timeGrain: this.time_grain_filter,
          });
        }
      }
      /* const lockObj = {};
       this.viewTableData['locked_items'].forEach(lockItem => {
         lockObj[lockItem.key] = lockItem['name'];
       });

       const newLockItems = [];
       localMarkInfo['sheets_setting']['table_setting']['locked_items'].forEach(lockItemLock => {
         if (lockObj.hasOwnProperty(lockItemLock['key'])) {
           lockItemLock['name'] = lockObj[lockItemLock['key']];
           newLockItems.push(lockItemLock);
         }
       });
       localMarkInfo['sheets_setting']['table_setting']['locked_items'] = newLockItems;

       const newSelectedItems = [];
       localMarkInfo['sheets_setting']['table_setting']['selected_items'].forEach(item => {
         if (this.pubTableItems.hasOwnProperty(item['key'])) {
           item['name'] = this.pubTableItems[item['key']];
           newSelectedItems.push(item);
         }
       });
       localMarkInfo['sheets_setting']['table_setting']['selected_items'] = newSelectedItems;
 */
      this.changeSelectedBookMark(localMarkInfo['sheets_setting']);
    }
    // --

    //获取账户下所有媒体
    this.getAccountPublishers();
    this.getAccountLists();
  }

  getNegativeWordGroups() {
    this.dataViewService.getAllNegativeWordGroupList().subscribe(
      (result) => {
        this.negativeWordGroupList = result['data'];
      },
    );
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

  _checkAll(value) {
    this.selectedType = 'current';
    if (value) {
      this._allChecked = true;
      this.rows.forEach((data) => {
        data.checked = true;
      });
      this._indeterminate = true;
    } else {
      this._allChecked = false;
      this._indeterminate = false;
      this.rows.forEach((data) => (data.checked = false));
    }
    this.selected = this.getSelectedData();
    this.selectedLength = this.selected.length;
  }

  _checkAllPage(value) {
    this.selectedType = 'all';
    if (value) {
      this._allChecked = true;
      this.rows.forEach((data) => {
        data.checked = true;
      });
      this._indeterminate = false;
    } else {
      this._allChecked = false;
      this._indeterminate = false;
      this.rows.forEach((data) => (data.checked = false));
    }
    this.selected = this.getSelectedData();
    this.selectedLength = this.selected.length;
  }

  _refreshSingleChangeStatus(event?) {
    this.selectedType = 'current';
    const allChecked = this.rows.every(
      (value) => value.checked,
    );
    const allUnchecked = this.rows.every((value) => !value.checked);

    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;
    this.selected = this.getSelectedData();
    this.selectedLength = this.selected.length;
  }

  getOptimizationGroup() {
    this.optimizationService.getOptimizationGroup(null, {
      result_model: 'all',
      optimization_type: 1,
    }).subscribe(
      (result) => {
        this.optimization_group = result.data.map((item) => {
          return {
            key: item.optimization_id,
            name: item.optimization_name,
          };
        });
        const options = this.allFilterOption.optimization_name.filterOption;
        this.allFilterOption.optimization_name.filterOption = [...options, ...this.optimization_group];
        this.allFilterOption = { ...this.allFilterOption };
      },
    );
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
  jumpToAdd() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }
  getAccountPublishers() {
    this.dataViewService.getAccountPublishers().subscribe(
      (result) => {
        this.editParameter['account_publishers'] = result['data'];
      },
    );
  }

  jumpToEdit(source = 'edit', count?) {
    // 重置已选长度
    this.selectedLength = 0;
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
      // if(!this.filterNoImpression){
      //   if (this.pageInfo.allCount <= this.pageInfo.pageSize) {
      //     this.editParameter.selected_type = 'current';
      //   }
      // }

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

  getEditData() {
    const editParameter = {};
    // if (this.selectedType === 'current' ) {
    //   editParameter['selected_type'] = 'current';
    //   editParameter['selected_data'] = this.selected;
    // } else if (this.selectedType === 'all' && this.pageInfo.allCount <= this.pageInfo.pageSize) {
    //   editParameter['selected_type'] = 'current';
    //   editParameter['selected_data'] = this.selected;
    // } else if (this.selectedType === 'all' && this.pageInfo.allCount > this.pageInfo.pageSize) {
    //   editParameter['selected_type'] = 'all';
    // }

    if (this.selectedType === 'all') {
      editParameter['selected_type'] = 'all';
    } else if (this.selectedType === 'current') {
      editParameter['selected_type'] = 'current';
      editParameter['selected_data'] = this.selected;
    } else {
      editParameter['selected_type'] = 'current';
      editParameter['selected_data'] = this.selected;
    }

    editParameter['allViewTableData'] = this.viewTableData;

    return editParameter;
  }

  @HostListener('document:keyup', ['$event'])
  quickEditKeyUp(event) {
    if (event && event.ctrlKey && event.key === 'b' && this.quickEditButton) {
      this.quickEditButton.elementRef.nativeElement.click();
    }
  }

  quickEdit(priceType = 'keyword') {
    this.quickEditParam.editItem = [];
    this.quickEditParam.publisherData = this.getParentPublishers(this.selected);
    if (this.selected.length === 0) {
      this._message.error('请选择' + this.summary_type_name[this.source_summary]);
      return;
    } else {
      if (this.selected.length === 1) { //单个编辑
        this.quickEditParam.publisherId = this.selected[0]['publisher_id'] * 1;
        if (priceType == 'adgroup') {
          this.quickEditParam.editItem = this.editItemAllAndOr.adgroup.all;
          this.quickEditParam.quickEditItem = this.quickEditParam.editItem[0].value;
        } else {
          this.quickEditParam.editItem = this.editItemAllAndOr[this.source_summary].all;
          this.quickEditParam.quickEditItem = this.quickEditParam.editItem[0].value;
          this._showSingleKeyword();
          if (this.source_summary === 'ocpc_baidu') {
            if (this.quickEditParam.quickEditItem === 4) {
              this.quickEditParam.showData.price = Number(this.selected[0]['ocpc_bid']).toFixed(2);
            }
            if (this.quickEditParam.quickEditItem === 5) {
              this.quickEditParam.showData.price = Number(this.selected[0]['ocpc_deep_cpa']).toFixed(2);
            }
          }
          if (this.source_summary === 'ocpc_360_setting') {
            this.quickEditParam.showData.price = Number(this.selected[0]['exp_amt']).toFixed(2);
          }
        }
      } else { //多个编辑
        this.quickEditParam.showData.pause = false;
        if (this.quickEditParam.publisherData['publisherCount'] === 1) { //同媒体
          this.quickEditParam.publisherId = this.quickEditParam.publisherData['publisher_array'][0]['value'] * 1;
          if (priceType == 'adgroup') {
            this.quickEditParam.editItem = this.editItemAllAndOr.adgroup.all;
            this.quickEditParam.quickEditItem = this.quickEditParam.editItem[0].value;
          } else {
            this.quickEditParam.editItem = this.editItemAllAndOr[this.source_summary].all;
            this.quickEditParam.quickEditItem = this.quickEditParam.editItem[0].value;
          }
        } else { //跨媒体
          if (priceType == 'adgroup') {
            this.quickEditParam.editItem = this.editItemAllAndOr.adgroup.morePublisher;
            this.quickEditParam.quickEditItem = this.quickEditParam.editItem[0].value;
          } else {
            this.quickEditParam.editItem = this.editItemAllAndOr[this.source_summary].morePublisher;
            this.quickEditParam.quickEditItem = this.quickEditParam.editItem[0].value;
          }
        }
      }
      this._getMatchTypeList(this.quickEditParam.publisherId);
    }

  }

  quickEditOk(priceType = 'keyword') {

    this.quickEditParam.saveing = false;
    this.quickEditParam.is_warning = false;
    this.checkPage();
    if (!this.quickEditParam.is_warning) {
      if (priceType != 'adgroup') {
        const postData = {};


        if (this.quickEditParam.quickEditItem === 2) { //出价
          postData['price'] = {
            is_edit: false,
            modify_type: 1, // 1 修改价格固定值 2 价格基础增加/降低值 3价格基础增加/降低比例
            action: 1, //1 提高 2 降低
            /* "value": 0*/
          };

          postData['price'].is_edit = true;
          postData['price'] = Object.assign(postData['price'], this.quickEditParam.result['result']);
        }
        if (this.quickEditParam.quickEditItem === 1) {
          postData['pause'] = {
            is_edit: false,
            value: false,
          };
          postData['pause'].is_edit = true;
          postData['pause'].value = this.quickEditParam.result['result']['value'];
        }
        if (this.quickEditParam.quickEditItem === 3) {
          postData['match_type'] = {
            is_edit: false,  //必填
            value: 1,
          };

          postData['match_type'].is_edit = true;
          postData['match_type'].value = this.quickEditParam.result['result']['value'];
        }

        if (this.quickEditParam.quickEditItem === 4) {
          if (this.source_summary === 'ocpc_baidu') {
            postData['ocpc_bid'] = {
              is_edit: false,
              modify_type: 1, // 1 修改价格固定值 2 价格基础增加/降低值 3价格基础增加/降低比例
              action: 1, //1 提高 2 降低
            };
            postData['ocpc_bid'].is_edit = true;
            postData['ocpc_bid'] = Object.assign(postData['ocpc_bid'], this.quickEditParam.result['result']);
          } else if (this.source_summary === 'ocpc_360_setting') {
            postData['exp_amt'] = {
              is_edit: false,
              modify_type: 1, // 1 修改价格固定值 2 价格基础增加/降低值 3价格基础增加/降低比例
              action: 1, //1 提高 2 降低
            };
            postData['exp_amt'].is_edit = true;
            postData['exp_amt'] = Object.assign(postData['exp_amt'], this.quickEditParam.result['result']);
          }
        }
        if (this.quickEditParam.quickEditItem === 5) {
          postData['ocpc_deep_cpa '] = {
            is_edit: false,
            modify_type: 1, // 1 修改价格固定值 2 价格基础增加/降低值 3价格基础增加/降低比例
            action: 1, //1 提高 2 降低
          };
          postData['ocpc_deep_cpa'].is_edit = true;
          postData['ocpc_deep_cpa'] = Object.assign(postData['ocpc_deep_cpa'], this.quickEditParam.result['result']);
        }

        postData['select_type'] = this.getEditData()['selected_type'];
        if (priceType === 'ocpc_baidu') {
          postData['pub_target_package_ids'] = [];
        } else if (priceType === 'ocpc_360_setting') {
          postData['pub_ocpc_ids'] = [];
        } else {
          postData['pub_keyword_ids'] = [];
        }
        postData['sheets_setting'] = null;

        if (this.getEditData()['selected_type'] === 'all') {
          postData['sheets_setting'] = {
            table_setting: this.getEditData()['allViewTableData'],
          };
        } else {
          if (priceType === 'ocpc_baidu') {
            postData['pub_target_package_ids'] = this.getSelectIds('ocpc_baidu');
          } else if (priceType === 'ocpc_360_setting') {
            postData['pub_ocpc_ids'] = this.getSelectIds('ocpc_360_setting');
          } else {
            postData['pub_keyword_ids'] = this.getSelectIds();
          }
        }

        let edit_type: any;
        if (this.selected.length === 1) { //单个编辑
          edit_type = 'single';
        } else {
          edit_type = 'batch';
        }
        if (priceType === 'ocpc_baidu') {
          this.editOcpcBaidu(postData, edit_type);
        } else if (priceType === 'ocpc_360_setting') {
          this.editOcpc360(postData, edit_type);
        } else {
          this.editKeyword(postData, edit_type);
        }
      } else {
        if (this.quickEditParam.quickEditItem === 12) { //出价
          const postBody = {
            max_price: {
              is_edit: true
            },
            pub_adgroup_ids: [],
            select_type: this.getEditData()['selected_type'],
            sheets_setting: null
          };

          if (this.getEditData()['selected_type'] === 'all') {
            postBody['sheets_setting'] = {
              table_setting: this.getEditData()['allViewTableData'],
            };
          } else {
            postBody.pub_adgroup_ids = this.getSelectIds('adgroup');
          }

          postBody.max_price = Object.assign(postBody.max_price, this.quickEditParam.result['result']);
          let edit_type: any;
          if (this.selected.length === 1) { //单个编辑
            edit_type = 'single';
          } else {
            edit_type = 'batch';
          }

          this.editAdgroup(postBody, edit_type, []);
        }

      }

    }

  }
  checkPage() {
    const price_range = {
      1: '0.01~999.99',
      2: '0.01~999.99',
      3: '0.3~999.99',
      4: '0.45~999.99',
      5: '0.45~999.99',
      24: '0.3~999.99'
    };

    if (this.quickEditParam.quickEditItem === 2 || this.quickEditParam.quickEditItem === 12 || this.quickEditParam.quickEditItem === 4 || this.quickEditParam.quickEditItem === 5) { //编辑出价
      if (this.source_summary === 'ocpc_baidu') {
        if (this.quickEditParam.result['result']['value'] < 0.01 || this.quickEditParam.result['result']['value'] > 9999.00) {
          this.quickEditParam.warning_info = '出价不能为空且范围为0.01~9999.00';
          this.quickEditParam.is_warning = true;
          return false;
        }
      } else {
        if (this.selected.length === 1) {
          if (!this.quickEditParam.result['result']['value']) {
            this.quickEditParam.is_warning = true;
            this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
            return false;
          }
          if (this.quickEditParam.result['result']['value']) {
            if (this.quickEditParam.publisherId === 1 || this.quickEditParam.publisherId === 2) {
              if (this.quickEditParam.result['result']['value'] < 0.01) {
                this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
                this.quickEditParam.is_warning = true;
                return false;
              }
              if (this.quickEditParam.result['result']['value'] > 999.99) {
                this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
                this.quickEditParam.is_warning = true;
                return false;
              }
            }
            if (this.quickEditParam.publisherId === 3 || this.quickEditParam.publisherId === 24) {
              if (this.quickEditParam.result['result']['value'] < 0.3) {
                this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
                this.quickEditParam.is_warning = true;
                return false;
              }
              if (this.quickEditParam.result['result']['value'] > 999.99) {
                this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
                this.quickEditParam.is_warning = true;
                return false;
              }
            }
            if (this.quickEditParam.publisherId === 4) {
              if (this.quickEditParam.result['result']['value'] < 0.45) {
                this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
                this.quickEditParam.is_warning = true;
                return false;
              }
              if (this.quickEditParam.result['result']['value'] > 999.99) {
                this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
                this.quickEditParam.is_warning = true;
                return false;
              }
            }

            if (this.source_summary === 'ocpc_baidu') {
              if (this.quickEditParam.result['result']['value'] < 0.01 || this.quickEditParam.result['result']['value'] > 9999.00) {
                this.quickEditParam.warning_info = '出价不能为空且范围为0.01~9999.00';
                this.quickEditParam.is_warning = true;
                return false;
              }
            }

          }
        }
        if (this.selected.length > 1) {
          if (!this.quickEditParam.result['result']['value'] || this.quickEditParam.result['result']['value'] < 0) {
            this.quickEditParam.is_warning = true;
            this.quickEditParam.warning_info = '出价不能为空且大于0';
            return false;
          }
          if (this.quickEditParam.publisherData['publisherCount'] === 1) {//同媒体
            if (this.quickEditParam.result['result']['modify_type'] === 1) {
              if (this.quickEditParam.publisherId === 1 || this.quickEditParam.publisherId === 2) {
                if (this.quickEditParam.result['result']['value'] < 0.01) {
                  this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
                  this.quickEditParam.is_warning = true;
                  return false;
                }
                if (this.quickEditParam.result['result']['value'] > 999.99) {
                  this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
                  this.quickEditParam.is_warning = true;
                  return false;
                }
              }
              if (this.quickEditParam.publisherId === 3 || this.quickEditParam.publisherId === 24) {
                if (this.quickEditParam.result['result']['value'] < 0.3) {
                  this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
                  this.quickEditParam.is_warning = true;
                  return false;
                }
                if (this.quickEditParam.result['result']['value'] > 999.99) {
                  this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
                  this.quickEditParam.is_warning = true;
                  return false;
                }
              }
              if (this.quickEditParam.publisherId === 4) {
                if (this.quickEditParam.result['result']['value'] < 0.45) {
                  this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
                  this.quickEditParam.is_warning = true;
                  return false;
                }
                if (this.quickEditParam.result['result']['value'] > 999.99) {
                  this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[this.quickEditParam.publisherId];
                  this.quickEditParam.is_warning = true;
                  return false;
                }
              }
            }
          }
          if (this.quickEditParam.publisherData['publisherCount'] > 1) {//垮媒体

            if (this.quickEditParam.result['result']['modify_type'] === 1) {
              if (this.quickEditParam.result['result']['value'] < 0.45) {
                this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[5];
                this.quickEditParam.is_warning = true;
                return false;
              }
              if (this.quickEditParam.result['result']['value'] > 999.99) {
                this.quickEditParam.warning_info = '出价不能为空且范围为' + price_range[5];
                this.quickEditParam.is_warning = true;
                return false;
              }
            }
          }
        }
      }
    }
  }

  getSelectIds(priceType = 'keyword') {
    const needId = [];
    this.selected.forEach((item) => {
      if (priceType != 'keyword') {
        if (priceType == 'ocpc_baidu') {
          needId.push(item['chan_pub_id'] + '_' + item['pub_account_id'] + '_' + item['pub_target_package_id']);
        } else if (priceType == 'ocpc_360_setting') {
          needId.push(item['chan_pub_id'] + '_' + item['pub_account_id'] + '_' + item['pub_ocpc_id']);
        } else {
          needId.push(item['chan_pub_id'] + '_' + item['pub_account_id'] + '_' + item['pub_adgroup_id']);
        }
      } else {
        if (item['publisher_id'] * 1 === 10) {
          needId.push(item['chan_pub_id'] + '_' + item['pub_account_id'] + '_' + item['pub_adgroup_id'] + '_' + item['pub_keyword_id']);
        } else {
          needId.push(item['chan_pub_id'] + '_' + item['pub_account_id'] + '_' + item['pub_keyword_id']);
        }
      }
    });
    return needId;
  }

  cancelQuickEdit() {
    this.quickEditParam.showQuickEdit = false;
    this.quickEditParam.is_warning = false;
    this.quickEditParam.warning_info = '';
  }

  _getMatchTypeList(publisher_id) {
    this.matchTypeData = this.dataViewService.matchTypes[publisher_id];
    if (this.matchTypeData) {
      this.quickEditParam.showData.match_type = this.matchTypeData[0]['value'];
    }
  }
  quickResult(event) {
    this.quickEditParam.result = event;
  }
  _showSingleKeyword() {
    this.dataViewService.getSingleKeywordData({
      chan_pub_id: this.selected[0].chan_pub_id,
      pub_account_id: this.selected[0].pub_account_id,
      pub_keyword_id: this.selected[0].pub_keyword_id,
    }).subscribe(
      (result) => {
        if (result.status_code === 200) {
          this.quickEditParam.showData.pause = result.data['pause'];
          this.quickEditParam.showData.price = result.data['price'];
          this.quickEditParam.showData.match_type = result.data['match_type'];
        }
      },
    );
  }

  //获取url中的参数
  getUrlParam(name) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); //构造一个含有目标参数的正则表达式对象
    const r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) {
      return unescape(r[2]);  //返回参数值
    } else {
      return null;
    }
  }

  syncPrompt() {
    this._message.error('请勾选' + this.summary_type_name[this.viewTableData.summary_type] + "进行下载更新！");
  }
  doSync(chan_pub_id?) {
    const notifyData: any[] = [];
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    if (this.viewTableData.summary_type === 'account') {
      const postBody = {
        type: 'account',
        info: [],
      };
      if (isUndefined(chan_pub_id)) {
        this.selected.forEach((data) => {
          // postBody.chan_pub_ids.push(data.chan_pub_id);
          postBody.info.push({ chan_pub_id: data.chan_pub_id });
          notifyData.push({ chan_pub_id: data.chan_pub_id, cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, advertiser_name: '', pub_account_name: data['pub_account_name'] });
        });
      } else if (isNumber(chan_pub_id) && chan_pub_id > 0) {
        // postBody.chan_pub_ids.push(chan_pub_id);
        postBody.info.push({ chan_pub_id });
      }
      if (postBody.info.length > 0) {
        this.dataViewService.syncPublisher(postBody).subscribe((result: any) => {
          if (result.status_code === 200) {
            this.notifyService.notifyData.next({ type: 'account', data: notifyData });
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
          () => {
          });
      } else {
        this._message.info('请选择相关项操作');
      }
    } else if (this.viewTableData.summary_type === 'campaign') {
      const postBody = {
        type: 'campaign',
        info: [],
      };
      const resultObject = {};
      this.selected.forEach((data) => {
        if (resultObject.hasOwnProperty(data.chan_pub_id)) {

          resultObject[data.chan_pub_id].campaign_ids.push(data.pub_campaign_id);
        } else {
          resultObject[data.chan_pub_id] = {
            chan_pub_id: data.chan_pub_id,
            campaign_ids: [],
          };
          notifyData.push({ chan_pub_id: data.chan_pub_id, cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, advertiser_name: '', pub_account_name: data['pub_account_name'] });
          resultObject[data.chan_pub_id].campaign_ids.push(data.pub_campaign_id);
        }
      });
      postBody.info = Object.values(resultObject);
      if (postBody.info.length > 0) {
        this.dataViewService.syncPublisher(postBody).subscribe((result: any) => {
          if (result.status_code === 200) {
            this.notifyService.notifyData.next({ type: 'account', data: notifyData });
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
          () => {
          });
      } else {
        this._message.info('请选择相关项操作');
      }

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

  refreshTableSize(event = 'resize') {
    // window.dispatchEvent(new Event(event));
  }
  refreshData(fromMark = false, type?) {
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
      const findExistsColumn = this.viewTableData['selected_items'].find((col) => col.key === item['filterKey']['key']);
      if (isUndefined(findExistsColumn)) {
      }
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    this.loadingIndicator = true;
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));
    if (this.viewTableData['summary_type'] !== 'search_keyword') {
      tmpViewTableData['selected_items'].push({ data_type: 'pub_attr_data', key: 'publisher_id', showKey: 'publisher', selected: { current: true } });
    }
    const postData = { sheets_setting: { table_setting: tmpViewTableData } };
    this.sub.add(
      this.dataViewService.getViewList(postData, {
        count: this.pageInfo.pageSize,
        page: this.pageInfo.currentPage,
      }).subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.rows = results['data']['detail'];
            //匹配模式
            this.rows.map((item, index) => {
              item.key = index;
              if (item.publisher_id) {
                item['matchTypeList'] = this.dataViewService.matchTypes[item.publisher_id];
              }
              if (this.source_summary === 'ocpc_360_setting') {
                item['plan_binds'] = JSON.parse(item['plan_binds']);
              }
            });
            this.pageInfo.currentPageCount = results['data']['detail'].length;
            this.selected = [];
            this._allChecked = false;
            this._indeterminate = false;

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
          if (type === 'summary') {
            this.refreshSummaryData();
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
      ));
  }

  refreshSummaryData() {
    if (this.filterNoImpression) {
      this.summaryData = {};
      return;
    }
    this.allFilterOption = { ...this.allFilterOption };
    this.viewTableData.single_condition = [];
    Object.values(this.allFilterOption).forEach((item) => {
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));
    tmpViewTableData['selected_items'].push({ data_type: 'pub_attr_data', key: 'publisher_id', showKey: 'publisher', selected: { current: true } });
    tmpViewTableData['all_summary'] = true;
    const postData = { sheets_setting: { table_setting: tmpViewTableData } };
    this.sub.add(
      this.dataViewService.getViewList(postData, {
        count: this.pageInfo.pageSize,
        page: this.pageInfo.currentPage,
      }).subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            if (results['data']['detail'].length === 1) {
              this.summaryData = results['data']['detail'][0];
              this.summaryData['summaryData'] = true;
              if ((this.source_summary === 'ocpc_baidu') && this.rows.length > 0 && !this.rows.find(item => item.summaryData)) {
                this.rows = [this.summaryData, ...this.rows];
              }
            }
          }
        },
        (err: any) => {
        },
        () => {

        },
      ));
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
    this.sub.add(this.dataViewService.getViewList(postData, { is_count: 1 }).subscribe(
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
        if (this.filterNoImpression && this.source_summary == 'keyword') {
          this.pageInfo.allCount = 10000;
        }
      },
      () => {
        this.loadingCountIndicator = false;
      },
    ));
  }

  downloadReport() {

  }

  changeField() {
    const add_modal = this.modalService.create({
      nzTitle: '编辑列',
      nzWidth: 900,
      nzContent: TableFieldComponent,
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
      JSON.parse(JSON.stringify(this.viewTableData['condition'])).forEach((item) => {
        if (item['name'][item['name'].length - 1] !== '#' && item['name'][item['name'].length - 1] !== '△' && item['name'][item['name'].length - 1] !== '%') {
          currentCondition.push(item);
        }
      });
      this.viewTableData['condition'] = currentCondition;
      Object.values(this.allFilterOption).forEach((filter) => {
        if (Object.keys(filter['filterResult']).length > 0) {
          if (filter['filterKey']['name'][filter['filterKey']['name'].length - 1] === '%' || filter['filterKey']['name'][filter['filterKey']['name'].length - 1] === '#' || filter['filterKey']['name'][filter['filterKey']['name'].length - 1] === '△') {
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
      nzContent: TableQueryComponent,
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

  mainRangeChange(event) {
    setTimeout(() => {
      if (this.source_summary == 'keyword' && this.viewTableData['main_range'] == 'no_impression') {
        this.filterNoImpression = true;
        this.showNoImpressionInfo();
      } else {
        this.filterNoImpression = false;
        this.clearNoImpressionNotify();
      }
      this.pageInfo.currentPage = 1;
      this.reloadData(true);
    });
  }

  timeRangeChange(event) {
    //当汇总选择分日时，展现默认 有展现 并且不让选择
    if (this.time_grain_filter !== 'summary' && this.source_summary !== 'search_keyword') {
      this.viewTableData['main_range'] = 'join';
    }

    //选择的只要有分时，报告类型传 hours_report ， 否则 传 basic_report
    if (this.time_grain_filter === 'hour' || this.time_grain_filter === 'hour_day' || this.time_grain_filter === 'hour_weekSplit') {
      this.viewTableData.report_type = 'hours_report';
    } else if (this.time_grain_filter === 'region' || this.time_grain_filter === 'region_day') {
      this.viewTableData.report_type = 'region_report';
    } else {
      this.viewTableData.report_type = 'basic_report';
    }

    //选择的只要有分日，汇总传 day ， 否则 传 合计summary
    if (this.time_grain_filter === 'day' || this.time_grain_filter === 'hour_day' || this.time_grain_filter === 'region_day') {
      this.viewTableData.time_grain = 'day';
    } else if (this.time_grain_filter === 'hour_weekSplit') {
      this.viewTableData.time_grain = 'weekSplit';
    } else if (this.time_grain_filter === 'week' || this.time_grain_filter === 'weekSplit' || this.time_grain_filter === 'month') {
      this.viewTableData.time_grain = this.time_grain_filter;
    } else {
      this.viewTableData.time_grain = 'summary';
    }

    if (this.viewTableData.report_type === 'hours_report') {
      this.viewTableData.summary_type = JSON.parse(JSON.stringify(this.source_summary)) + '_hour';
    } else if (this.viewTableData.report_type === 'region_report') {
      this.viewTableData.summary_type = JSON.parse(JSON.stringify(this.source_summary)) + '_region';
    } else {
      this.viewTableData.summary_type = this.source_summary;
    }
    this.time_grain = this.time_grain_filter;

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
    this.refreshData(false, 'summary');
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

  refreshFields(data: any[]) {
    const checkFiled: any = [{ width: '64', headerTemplate: this.chkHeader, cellTemplate: this.chkCell, name: 'checkBOx', frozenLeft: true }];
    const dataAnalysis: any = [{ width: '70', headerTemplate: this.dataAnalysisHeader, cellTemplate: this.dataAnalysisCell, name: '数据分析', prop: 'dataAnalysis', frozenLeft: true }];
    const operateColumn: any = [{ width: '100', name: '操作', prop: 'operateColumn', cellTemplate: this.operateCell, cellTemplateType: 'operate', frozenLeft: true, sortable: false }];
    const timeFiled: any = [{ width: '120', name: '日期', key: 'date_str', frozenLeft: true, sortable: true }];
    const weekSplitFiled: any = [{ width: '120', name: '日期', showKey: 'date_str', key: 'data_weekSplit', frozenLeft: true, sortable: true }];
    const hourFiled: any = [{ width: '70', name: '小时', key: 'data_hour', frozenLeft: true, sortable: true }];
    const regionFiled: any = [{ width: '100', name: '省级地域', key: 'province_id', frozenLeft: true, sortable: true }, { width: '100', name: '市级地域', key: 'city_id', frozenLeft: true, sortable: true }];
    const tmpFiled: any = [];
    let hasCreative = false;
    hasCreative = explainTableField(data, tmpFiled, this);
    tmpFiled.forEach(item => {
      const itemWidth = item.name.length * 12 + 48 < item.width ? item.width : item.name.length * 12 + 48;//根据name计算width
      item.width = itemWidth;
    });

    if (this.viewTableData['summary_type'] === 'search_keyword' && hasCreative) {
      this.rowHeight = 80;
    } else {
      this.rowHeight = this.defaultRowHeight;
    }

    const lockedColumn = [];
    const endLockedColumn = [];
    this.viewTableData['locked_items'].forEach((item) => {
      let popKey = item.key;
      if (item.hasOwnProperty('showKey') && item.showKey !== '') {
        popKey = item.showKey;
      }
      const tplHeader = {};
      if (popKey === 'pub_creative_title') {
        tplHeader['cellTemplate'] = this.creativeCell;
      }

      if ((this.source_summary === 'publisher' && popKey === 'publisher') || (this.source_summary === 'account' && popKey === 'pub_account_name') || (this.source_summary === 'campaign' && popKey === 'pub_campaign_name') || (this.source_summary === 'adgroup' && popKey === 'pub_adgroup_name')) {
        hasCreative = true;
        tplHeader['cellTemplate'] = this.viewTitleCell;
        tplHeader['viewTitleCell'] = true;
      }

      if (item.hasOwnProperty('sortable')) {
        tplHeader['sortable'] = item.sortable;
      }

      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['filterHeader'] = true;
        tplHeader['data'] = this.allFilterOption[popKey];
      }
      if (lockedColumn.length === 0) {
        tplHeader['summaryFunc'] = () => "合计";
        tplHeader['summaryName'] = "合计";
      }

      lockedColumn.push({ prop: popKey, name: item.name, frozenLeft: true, width: item.width, ...tplHeader });
    });

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
      timeFiledColumn.push({ prop: popKey, name: timeItem.name, resizeable: true, width: timeItem.width, ...tplHeader, frozenLeft: timeItem.frozenLeft, sortable: timeItem.sortable });

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
        tplHeader['filterHeader'] = true;
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
        tplHeader['filterHeader'] = true;
        tplHeader['data'] = this.allFilterOption[popKey];
      }

      hourFiledColumn.push({ prop: popKey, name: hourItem.name, resizeable: true, width: hourItem.width, ...tplHeader, frozenLeft: hourItem.frozenLeft, sortable: hourItem.sortable });

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
    if (this.source_summary != 'ocpc_baidu' && this.source_summary != 'ocpc_baidu_report' && this.source_summary != 'creative_fengwu_360') {
      this.columns.push(...checkFiled);
    }
    if (this.time_grain_filter === 'hour_day') {
      this.columns.push(...timeFiledColumn, ...hourFiledColumn);
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

    if (this.time_grain_filter === 'day' || this.time_grain_filter === 'week' || this.time_grain_filter === 'month') {
      this.columns.push(...timeFiledColumn);
    }
    if (this.time_grain_filter === 'hour') {
      this.columns.push(...hourFiledColumn);
    }
    if (this.time_grain_filter === 'region') {
      this.columns.push(...regionFiledColumn);
    }
    if (this.endLocked_items.length && (this.userSelectedOper.role_id !== 5 && this.userSelectedOper.role_id !== 2 && this.userSelectedOper.role_id !== 6)) {
      if (this.source_summary != 'dsa_pattern_day' && this.source_summary != 'ocpc_360' && this.source_summary != 'ocpc_baidu' && this.source_summary != 'ocpc_baidu_report' && this.source_summary != 'creative_fengwu_360' && this.source_summary != 'ocpc_360_setting') {
        this.columns.push(...lockedColumn, ...dataAnalysis, ...tmpFiled, ...endLockedColumn);
      } else if (this.source_summary == 'ocpc_baidu' || this.source_summary == 'ocpc_360_setting') {
        this.columns.push(...lockedColumn, ...operateColumn, ...tmpFiled, ...endLockedColumn);
      } else {
        this.columns.push(...lockedColumn, ...tmpFiled, ...endLockedColumn);
      }
    } else {
      if (this.source_summary != 'dsa_pattern_day' && this.source_summary != 'ocpc_360' && this.source_summary != 'ocpc_baidu' && this.source_summary != 'ocpc_baidu_report' && this.source_summary != 'creative_fengwu_360' && this.source_summary != 'ocpc_360_setting') {
        this.columns.push(...lockedColumn, ...dataAnalysis, ...tmpFiled);
      } else if (this.source_summary == 'ocpc_baidu' || this.source_summary == 'ocpc_360_setting') {
        this.columns.push(...lockedColumn, ...operateColumn, ...tmpFiled);
      } else {
        this.columns.push(...lockedColumn, ...tmpFiled);
      }
    }
    if (this.source_summary === 'creative_fengwu_360') {
      this.columns.push({ prop: 'fengwu_end', name: '操作', resizeable: true, frozenLeft: true, width: 100, cellTemplate: this.fengwuOperation, cellClass: "num_right", headerClass: "header_right" });
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
    this.getTableWidth();
  }

  getTableWidth() {
    this.scrollX = 0;
    this.columns.forEach(item => {
      if (!item.hasOwnProperty('frozenLeft')) {
        this.scrollX += Number(item.width);
      }
    });
  }

  getConditionData() {
    const oauth_local = JSON.parse(localStorage.getItem('data_range_data'));
    return oauth_local;
  }
  clickViewTitle(row) {
    switch (this.viewTableData.summary_type) {
      case 'publisher':
        const condition_range = {
          select_type: "publisher",
          select_data: [row['publisher_id']],
        };
        localStorage.setItem('data_range_data', JSON.stringify(condition_range));
        this.router.navigateByUrl('/data_view/sem/' + 'account');
        break;
      case 'account':
        const condition_range1 = {
          select_type: "account",
          select_data: [row['publisher_id'] + '_' + row['chan_pub_id'] + '_' + row['pub_account_id']],
        };
        localStorage.setItem('data_range_data', JSON.stringify(condition_range1));

        this.router.navigateByUrl('/data_view/sem/' + 'campaign');

        break;
      case 'campaign':
        const condition_range2 = {
          select_type: "campaign",
          select_data: [row['publisher_id'] + '_' + row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_campaign_id']],
        };
        localStorage.setItem('data_range_data', JSON.stringify(condition_range2));

        this.router.navigateByUrl('/data_view/sem/' + 'group');

        break;
      case 'adgroup':
        const condition_range3 = {
          select_type: "adgroup",
          select_data: [row['publisher_id'] + '_' + row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_campaign_id'] + '_' + row['pub_adgroup_id']],
        };
        localStorage.setItem('data_range_data', JSON.stringify(condition_range3));

        this.router.navigateByUrl('/data_view/sem/' + 'keyword');

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
    if (orderKey === 'pause_name') {
      orderKey = 'pause';
    }
    this.viewTableData['sort_item'] = { key: orderKey, dir: sortInfo.dir };

    this.refreshData();
  }

  // ---- mark -- start
  createBookMark($event) {
    const new_modal = this.modalService.create({
      nzTitle: ($event === 'edit') ? '编辑书签页' : '添加当前页为书签',
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

    this.viewTableData = Object.assign(this.viewTableData, bookMark['table_setting']);

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
    if (this.viewTableData['single_condition'] && this.viewTableData['single_condition'].length > 0) {
      this.viewTableData['single_condition'].forEach((item) => {
        if (item.hasOwnProperty('relishKey') && this.allFilterOption.hasOwnProperty(item['relishKey'])) {
          this.allFilterOption[item['relishKey']]['filterResult'] = { ...item };
        } else if (this.allFilterOption.hasOwnProperty(item['key'])) {
          this.allFilterOption[item['key']]['filterResult'] = { ...item };
        } else {
          this.allFilterOption[item['key']] = {
            filterType: 'numberFilter',
            filterOption: [],
            filterKey: { key: item['key'], data_type: item['data_type'], name: item['name'], type: 'numberFilter' },
            filterResult: { ...item },
          };
        }
      });
    }

    if (this.source_summary == 'keyword' && this.viewTableData['main_range'] == 'no_impression') {
      this.filterNoImpression = true;
      this.showNoImpressionInfo();
    } else {
      this.filterNoImpression = false;
      this.clearNoImpressionNotify();
    }

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
      this.refreshData(true, 'summary');
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
    } else if (this.time_grain === 'region' || this.time_grain === 'region_day') {
      tmpViewTableData.report_type = 'region_report';
    } else {
      tmpViewTableData.report_type = 'basic_report';
    }

    if (tmpViewTableData.report_type === 'hours_report') {
      tmpViewTableData.summary_type = JSON.parse(JSON.stringify(this.source_summary)) + '_hour';
    } else if (tmpViewTableData.report_type === 'region_report') {
      tmpViewTableData.summary_type = JSON.parse(JSON.stringify(this.source_summary)) + '_region';
    } else {
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
    if (tmpViewTableData['main_range'] === 'join' && this.time_grain_filter === 'summary' && this.source_summary != 'search_keyword' && tmpViewTableData['summary_date'] != 'day:0:0') {
      tmpViewTableData.condition.push({
        key: "pub_impression",
        data_type: "pub_metric_data",
        name: "展现",
        type: "number",
        op: ">",
        value: 0,
      });
    }
    tmpViewTableData.condition.push(...tmpViewTableData.single_condition);
    tmpViewTableData.single_condition = [];
    const postBody = Object.assign({}, this.viewReportSetting, {
      sheets_setting: [{
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
      }],
      email_list: this.viewReportSetting.email_list.split('\n'),
      report_status: 2,
    });
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    this.reportService.createReport(postBody).subscribe((data: any) => {
      if (data.status_code === 200) {
        this.showCreateReport = false;
        if (isObject(data['data']) && data['data'].hasOwnProperty('job_id')) {
          const notifyData = [];
          notifyData.push({ report_id: data['data']['report_id'], job_id: data['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, report_name: this.viewReportSetting.report_name });
          this.notifyService.notifyData.next({ type: 'report', data: notifyData });
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
      });
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
    this.chartItems = this.viewItemService.getChartItem();
    //仅关键词显示平均排名
    this.chartItems.forEach((item, index) => {
      if (this.source_summary !== 'keyword' && item.key === 'pub_avg_position') {
        this.chartItems.splice(index, 1);
      }
    });
    this.viewChartShow = !this.viewChartShow;
    // if (this.viewChartShow) {
    //   this.bookMarkTop = this._chartDefaultHeight + this._bookMarkDefaultTop;
    //   this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 300;
    // } else {
    //   this.bookMarkTop = this._bookMarkDefaultTop;
    //   this.tableHeight = document.body.clientHeight - 60 - 65 - 30;
    // }

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
    const cacheKey = 'view_mark_' + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
    return this.localSt.retrieve(cacheKey);
  }

  setLocalBookMark(summaryType, data: { summary_type: string, sheets_setting: { table_setting: any }, pageSize: number, timeGrain: string }) {
    const currentUser = this.authService.getCurrentUser();
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    const cacheKey = 'view_mark_' + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
    this.localSt.store(cacheKey, data);
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
    this.clearNoImpressionNotify();
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

  getAccountLists() {
    this.itemSelectService.getAccountLists({}, { select_name: '', is_accurate: false }).subscribe(
      (result) => {
        this.accountPublishers = result;
      },
      (error) => {

      },
    );
  }

  changePublisher(itemData): void {

    itemData.pub_account_id = null;
    itemData.pub_campaign_id = null;
    itemData.pub_adgroup_id = null;

    this.accountPublishers.forEach((item) => {

      if (item.publisher_id * 1 === itemData.publisher_id * 1) {
        this.accountList = item.detail;
        itemData.pub_account_id = item.detail[0].pub_account_id;
        itemData.chan_pub_id = item.detail[0].chan_pub_id;

        this.getCampaignListByAccount({ chan_pub_id: item.detail[0].chan_pub_id, pub_account_id: item.detail[0].pub_account_id });
        /*关键词的匹配模式*/
        switch (item.publisher_id * 1) {
          case 1:
            this.matchTypeData = this.dataViewService.matchType_baidu;
            break;
          case 3:
            this.matchTypeData = this.dataViewService.Match_type_360;
            break;
          case 4:
            this.matchTypeData = this.dataViewService.match_type_shenma;
            break;
          case 2:
            this.matchTypeData = this.dataViewService.match_type_sougou;
            break;
        }
      }
    });
  }

  changeAccount(itemData): void {
    itemData.pub_campaign_id = null;
    itemData.pub_adgroup_id = null;
    this.accountList.forEach((accountItem) => {
      if (accountItem.pub_account_id * 1 === itemData.pub_account_id * 1) {
        itemData.chan_pub_id = accountItem.chan_pub_id;
        itemData.pub_account_id = accountItem.pub_account_id;
        this.getCampaignListByAccount({ chan_pub_id: accountItem.chan_pub_id, pub_account_id: accountItem.pub_account_id });
      }
    });
  }

  changeCampaign(itemData, addType?): void {
    itemData.pub_adgroup_id = null;
    this.itemSelectService.getAdgroupListByCampaign({
      chan_pub_id: itemData.chan_pub_id,
      pub_account_id: itemData.pub_account_id,
      pub_campaign_id: itemData.pub_campaign_id,
    }).subscribe(
      (result) => {
        this.unitList = result;
        if (addType && addType === 'addNegativeData') {
          this.unitList.splice(0, 0, {
            pub_adgroup_name: '请选择单元',
            pub_adgroup_id: '',
          });
        }

      },
    );
  }

  getCampaignListByAccount(body) {
    this.itemSelectService.getCampaignListByAccount(body).subscribe(
      (result) => {
        this.compainList = result;
      },
      (error) => {

      },
    );
  }

  addWord(row, $event) {
    row['addPadding'] = window.document.body.clientHeight - $event.clientY < 150;
    this.addWordData.pub_keyword = row.pub_query;
    this.addWordData.publisher_id = row.publisher_id * 1;
    // this.changePublisher(this.addWordData);
    this.accountPublishers.forEach((item) => {
      if (this.addWordData.publisher_id * 1 === item.publisher_id * 1) {
        this.accountList = item.detail;

        /*关键词的匹配模式*/
        switch (item.publisher_id * 1) {
          case 1:
            this.matchTypeData = this.dataViewService.matchType_baidu;
            break;
          case 3:
            this.matchTypeData = this.dataViewService.Match_type_360;
            break;
          case 4:
            this.matchTypeData = this.dataViewService.match_type_shenma;
            break;
          case 2:
            this.matchTypeData = this.dataViewService.match_type_sougou;
            break;
        }
      }
    });

    this.addWordData.chan_pub_id = row.chan_pub_id;
    this.addWordData.pub_account_id = row.pub_account_id.toString();
    this.addWordData.pub_campaign_id = row.pub_campaign_id.toString();
    this.getCampaignListByAccount({ chan_pub_id: this.addWordData.chan_pub_id, pub_account_id: this.addWordData.pub_account_id });
    this.changeCampaign(this.addWordData);
    this.addWordData.pub_adgroup_id = row.pub_adgroup_id.toString();
    this.addWordData.match_type = this.matchTypeData[0].value;
    this.addWordData['pub_keyword_id'] = row.pub_keyword_id;
    row['showAddWord'] = true;

  }

  clickKeyCancel(row) {
    row['showAddWord'] = false;
    row['addPadding'] = false;
  }

  clickKeyOk(row) {
    if (!this.addWordData.pub_campaign_id) {
      this._message.error('请选择计划');
      return false;
    }
    if (!this.addWordData.pub_adgroup_id) {
      this._message.error('请选择单元');
      return false;
    }
    this.dataViewService.addSingleKeyword(this.addWordData).subscribe(
      (result: any) => {
        if (result.status_code === 200) {
          this._message.success("已成功加入任务队列，请稍后查看");
          row['showAddWord'] = false;
        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this._message.error(result.message);
        }
      }, (err) => {

      }, () => {

      },
    );

  }

  addNegative(row, $event) {
    row['addPadding'] = window.document.body.clientHeight - $event.clientY < 150;
    this.addNegativeData.pub_query = row.pub_query;
    this.searchKeywordChange();
    this.addNegativeData.publisher_id = row.publisher_id * 1;
    this.accountPublishers.forEach((item) => {
      if (this.addNegativeData.publisher_id * 1 === item.publisher_id * 1) {
        this.accountList = item.detail;
      }
    });
    this.addNegativeData.chan_pub_id = row.chan_pub_id;
    this.addNegativeData.pub_account_id = row.pub_account_id.toString();
    this.addNegativeData.pub_campaign_id = row.pub_campaign_id.toString();
    this.getCampaignListByAccount({ chan_pub_id: this.addNegativeData.chan_pub_id, pub_account_id: this.addNegativeData.pub_account_id });

    this.changeCampaign(this.addNegativeData, 'addNegativeData');
    this.addNegativeData.pub_adgroup_id = row.pub_adgroup_id.toString();

    this.addNegativeWordGroupData.is_add = 0;
    this.addNegativeWordGroupData.group_id = null;

    row['showNegative'] = true;
  }

  clickNagativeCancel(row) {
    row['showAddNagative'] = false;
  }

  clickNagativeOk(row) {

    if (!this.addNegativeData.pub_query) {
      this._message.error('否定关键词不能为空');
      return false;
    }
    if (this.negativeKeywordLength > 40) {
      this._message.error('否定关键词不能超过40个字符');
      return false;
    }
    if (!this.addNegativeData.pub_campaign_id) {
      this._message.error('请选择计划');
      return false;
    }

    // 加入否词库
    if (this.addNegativeWordGroupData.is_add === 1 && !this.addNegativeWordGroupData.group_id) {
      this._message.error('请选择否词包');
      return false;
    }

    if (!this.addNegativeData.pub_adgroup_id) { //没有选择单元

      const body = {
        select_type: 'current',
        pub_campaign_ids: [this.addNegativeData.chan_pub_id + "_" + this.addNegativeData.pub_account_id + "_" + this.addNegativeData.pub_campaign_id],
        negative_words: {
          is_edit: true,
          edit_type: 'add',
          value: [],
        },
        exact_negative_words: {
          is_edit: true,
          edit_type: 'add',
          value: [],
        },

      };
      if (this.addNegativeData.match_type === 1) { //短语否定
        body.negative_words.is_edit = true;
        body.negative_words.value = [this.addNegativeData.pub_query];
      } else { //精确否定
        body.exact_negative_words.is_edit = true;
        body.exact_negative_words.value = [this.addNegativeData.pub_query];
      }
      this.editCampaign(body, 'batch', row);
    } else { //选了单元

      const body = {
        select_type: 'current',
        pub_adgroup_ids: [this.addNegativeData.chan_pub_id + "_" + this.addNegativeData.pub_account_id + "_" + this.addNegativeData.pub_adgroup_id],
        negative_words: {
          is_edit: true,
          edit_type: 'add',
          value: [],
        },
        exact_negative_words: {
          is_edit: true,
          edit_type: 'add',
          value: [],
        },
      };
      if (this.addNegativeData.match_type === 1) { //短语否定
        body.negative_words.is_edit = true;
        body.negative_words.value = [this.addNegativeData.pub_query];
      } else { //精确否定
        body.exact_negative_words.is_edit = true;
        body.exact_negative_words.value = [this.addNegativeData.pub_query];
      }
      this.editAdgroup(body, 'batch', row);
    }

    // 加入否词库
    if (this.addNegativeWordGroupData.is_add === 1) {
      const postBody = {
        word_type: this.addNegativeData.match_type,
        word_name: [this.addNegativeData.pub_query],
        group_id: this.addNegativeWordGroupData.group_id,
      };

      this.dataViewService.createNegativeWord(postBody).subscribe(data => {
        if (data['status_code'] && data.status_code === 200) {
          this._message.success('加入否词库成功');
        } else if (data['status_code'] && data.status_code === 205) {

        } else {
          this._message.error('加入否词库失败');
        }
      }, (err) => {
        this._message.error('系统异常，加入否词库失败');
      }, () => {
      });
    }
  }

  editCreative(data, edit_type, row?) {
    if (row) {
      row['saveing'] = true;
    }
    const notifyData: any[] = [];
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    this.quickEditParam.saveing = true;
    this.dataViewService.editCreative(data, edit_type).subscribe(
      (result: any) => {
        this.quickEditParam.saveing = false;
        if (row) {
          row['saveing'] = false;
        }
        if (result.status_code === 200) {
          this._message.success("已成功加入任务队列，请稍后查看");
          notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'creative' });
          this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
          this.quickEditParam.showQuickEdit = false;
          if (row) {
            row['showEditPrice'] = false;
            row['showEditMatchType'] = false;
          }

        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this._message.error(result.message);
        }
      }, (err) => {

      }, () => {
      },
    );
  }

  editKeyword(data, edit_type, row?) {
    if (row) {
      row['saveing'] = true;
    }
    const notifyData: any[] = [];
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    this.quickEditParam.saveing = true;
    this.dataViewService.editKeyword(data, edit_type).subscribe(
      (result: any) => {
        this.quickEditParam.saveing = false;
        if (row) {
          row['saveing'] = false;
          row['showPriceBtn'] = false;
          row['showMatchTypeBtn'] = false;
        }
        if (result.status_code === 200) {
          this._message.success("已成功加入任务队列，请稍后查看");
          notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'keyword' });
          this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
          this.quickEditParam.showQuickEdit = false;
          if (row) {
            row['showEditPrice'] = false;
            row['showEditMatchType'] = false;
          }

        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this._message.error(result.message);
        }
      }, (err) => {

      }, () => {
      },
    );
  }

  editCampaign(data, edit_type, row) {
    this.dataViewService.editCampaign(data, edit_type).subscribe(
      (result: any) => {
        if (row) {
          row['saveing'] = false;
          row['showBudgetBtn'] = false;
          row['showPriceRatioPC'] = false;
          row['showPriceRatioPCBtn'] = false;
          row['showPriceRatioWap'] = false;
          row['showPriceRatioWapBtn'] = false;
        }
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();
        if (result.status_code === 200) {
          this._message.success("已成功加入任务队列，请稍后查看");
          row['showAddNagative'] = false;
          notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'campaign' });
          this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });

        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this._message.error(result.message);
        }
      }, (err) => {
      }, () => {
      },
    );
  }

  editAdgroup(data, edit_type, row?) {

    this.dataViewService.editAdgroup(data, edit_type).subscribe(
      (result: any) => {
        this.quickEditParam.saveing = false;
        if (row) {
          row['saveing'] = false;
          row['showBudgetBtn'] = false;
          row['showBudget'] = false;
        }
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();
        if (result.status_code === 200) {
          this._message.success("已成功加入任务队列，请稍后查看");
          row['showAddNagative'] = false;
          notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'adgroup' });
          this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
          this.quickEditParam.showQuickEdit = false;
        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this._message.error(result.message);
        }
      }, (err) => {

      }, () => {

      },
    );
  }

  editAccount(data, edit_type, row?) {
    this.dataViewService.editAccount(data, edit_type).subscribe(
      (result: any) => {
        if (row) {
          row['saveing'] = false;
          row['showBudgetBtn'] = false;
          row['showBudget'] = false;
        }
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();

        if (result.status_code === 200) {
          this._message.success("已成功加入任务队列，请稍后同步账户查看", { nzDuration: 5000 });
          notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'account' });
          this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this._message.error(result.message);
        }
      }, (err) => {

      }, () => {
      },
    );
  }

  editOcpcBaidu(data, edit_type, row?) {
    this.dataViewService.editOcpcBaidu(data, edit_type).subscribe(
      (result: any) => {
        if (row) {
          row['saveing'] = false;
          row['showBidBtn'] = false;
          row['showDeepCpaBtn'] = false;
          row['showEditOcpcBid'] = false;
          row['showEditDeepCpa'] = false;
        }
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();

        if (result.status_code === 200) {
          this._message.success("已成功加入任务队列，请稍后同步账户查看", { nzDuration: 5000 });
          notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'account' });
          this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
          this.quickEditParam.showQuickEdit = false;
        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this._message.error(result.message);
        }
      }, (err) => {

      }, () => {
      },
    );
  }

  editOcpc360(data, edit_type, row?) {
    this.dataViewService.editOcpc360(data, edit_type).subscribe(
      (result: any) => {
        if (row) {
          row['saveing'] = false;
          row['showExpAmtBtn'] = false;
        }
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();

        if (result.status_code === 200) {
          this._message.success("已成功加入任务队列，请稍后同步账户查看", { nzDuration: 5000 });
          notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'account' });
          this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
          this.quickEditParam.showQuickEdit = false;
        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this._message.error(result.message);
        }
      }, (err) => {

      }, () => {
      },
    );
  }

  searchKeywordChange() {
    this.negativeKeywordLength = this.chkstrlen(this.addNegativeData.pub_query);
  }

  chkstrlen(str) {
    let strlen = 0;
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) { //如果是汉字，则字符串长度加2
        strlen += 2;
      } else {
        strlen++;
      }
    }
    return strlen;
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
  //编辑匹配模式
  //--单个编辑关键词匹配模式
  editMatchType(row) {
    this.editMatchTypeParam.publisherId = row.publisher_id * 1;
    this.editMatchTypeParam.keywordMatchType = row.match_type_code * 1;
    row['showEditMatchType'] = true;
    row['showMatchTypeBtn'] = true;
  }
  clickEditMatchTypeCancel(row) {
    row['showEditMatchType'] = false;
    row['showMatchTypeBtn'] = false;
  }
  clickEditMatchTypeOk(row) {
    this.editMatchTypeParam.iswraing = false;
    if (!this.editMatchTypeParam.iswraing) {
      const postData = {};
      postData['match_type'] = {
        is_edit: false,  //必填
        value: 1,
      };
      postData['match_type'].is_edit = true;
      postData['match_type']['value'] = this.editMatchTypeParam.keywordMatchType;

      postData['select_type'] = 'current';
      postData['pub_keyword_ids'] = [];
      if (row['publisher_id'] * 1 === 10) {
        postData['pub_keyword_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_adgroup_id'] + '_' + row['pub_keyword_id']];
      } else {
        postData['pub_keyword_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_keyword_id']];
      }

      this.editKeyword(postData, 'single', row);
      row['match_type'] = row['matchTypeList'].find((item) => item.value === this.editMatchTypeParam.keywordMatchType).name;
    }
  }
  //--单个编辑关键词出价
  editPrice(row, priceType = 'keyword', column?) {
    if (priceType !== 'adgroup') {
      this.editPriceParam.publisherId = row.publisher_id * 1;
      if (column['prop'] === 'ocpc_bid') {
        this.editPriceParam.keywordPrice = row.ocpc_bid * 1;
        row['showBidBtn'] = true;
        row['showEditOcpcBid'] = true;
      } else if (column['prop'] === 'ocpc_deep_cpa') {
        this.editPriceParam.keywordPrice = row.ocpc_deep_cpa * 1;
        row['showDeepCpaBtn'] = true;
        row['showEditDeepCpa'] = true;
      } else if (column['prop'] === 'exp_amt') {
        this.editPriceParam.keywordPrice = row.exp_amt * 1;
        row['showExpAmtBtn'] = true;
      } else {
        this.editPriceParam.keywordPrice = row.price * 1;
        row['showEditPrice'] = true;
        row['showPriceBtn'] = true;
      }
    } else {
      this.editPriceParam.publisherId = row.publisher_id * 1;
      this.editPriceParam.keywordPrice = row.max_price * 1;
      row['showEditPrice'] = true;
      row['showPriceBtn'] = true;
    }
  }
  clickEditPriceCancel(row) {
    row['showEditPrice'] = false;
    row['showPriceBtn'] = false;
    row['showBidBtn'] = false;
    row['showDeepCpaBtn'] = false;
    row['showEditOcpcBid'] = false;
    row['showEditDeepCpa'] = false;
    row['showExpAmtBtn'] = false;
  }
  clickEditPriceOk(row, priceType = 'keyword', column?) {
    this.editPriceParam.iswraing = false;
    this.priceCheckPage();
    if (!this.editPriceParam.iswraing) {
      const postData = {};


      if (priceType == 'adgroup') {

        const postBody = {
          max_price: {
            is_edit: true,
            value: this.editPriceParam.keywordPrice
          },
          pub_adgroup_ids: [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_adgroup_id']],
          select_type: 'current'

        };

        this.editAdgroup(postBody, 'single', row);
        row['max_price'] = this.editPriceParam.keywordPrice;

      } else if (priceType == 'ocpc_baidu') {
        const postBody = {
          pub_target_package_ids: [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_target_package_id']],
          select_type: 'current'
        };
        if (column['prop'] === 'ocpc_bid') {
          postBody['ocpc_bid'] = {
            is_edit: true,
            value: this.editPriceParam.keywordPrice
          };
        }
        if (column['prop'] === 'ocpc_deep_cpa') {
          postBody['ocpc_deep_cpa'] = {
            is_edit: true,
            value: this.editPriceParam.keywordPrice
          };
        }

        this.editOcpcBaidu(postBody, 'single', row);
      } else if (priceType == 'ocpc_360_setting') {
        const postBody = {
          pub_ocpc_ids: [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_ocpc_id']],
          select_type: 'current'
        };
        postBody['exp_amt'] = {
          is_edit: true,
          value: this.editPriceParam.keywordPrice
        };
        this.editOcpc360(postBody, 'single', row);
      } else {
        postData['price'] = {
          is_edit: false,
          modify_type: 1, // 1 修改价格固定值 2 价格基础增加/降低值 3价格基础增加/降低比例
          action: 1, //1 提高 2 降低
          /* "value": 0*/
        };
        postData['price'].is_edit = true;
        postData['price']['value'] = this.editPriceParam.keywordPrice;

        postData['select_type'] = 'current';
        postData['pub_keyword_ids'] = [];
        if (row['publisher_id'] * 1 === 10) {
          postData['pub_keyword_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + '_' + row['pub_adgroup_id'] + '_' + row['pub_keyword_id']];
        } else {
          postData['pub_keyword_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_keyword_id']];
        }

        this.editKeyword(postData, 'single', row);
        row['price'] = this.editPriceParam.keywordPrice;
      }
    }

  }
  priceCheckPage() {
    this.editPriceParam.iswraing = false;
    if (this.editPriceParam.publisherId) {
      if (this.editPriceParam.keywordPrice < this.editPriceParam.priceRanges[this.editPriceParam.publisherId]['min']) {
        this.editPriceParam.iswraing = true;
        return false;
      }
      if (this.editPriceParam.keywordPrice > this.editPriceParam.priceRanges[this.editPriceParam.publisherId]['max']) {
        this.editPriceParam.iswraing = true;
        return false;
      }
    }
  }
  keywordPriceChange(event) {
    this.priceCheckPage();
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
        budget: {
          is_edit: true,
          value: this.editBudgetParam.budget,
        },
      };

      if (this.editBudgetParam.budgetRadio === 2) {
        body.budget.value = 0;
        row['budget'] = 0;
      } else {
        body.budget.value = this.editBudgetParam.budget;
        row['budget'] = body.budget.value;
      }

      if (this.viewTableData.summary_type === 'campaign') {
        body['pub_campaign_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_campaign_id']];
        this.editCampaign(body, 'single', row);
      } else if (this.viewTableData.summary_type === 'account') {
        body['pub_account_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id']];
        this.editAccount(body, 'single', row);
      }

    }
  }
  budgetCheckPage() {
    this.editBudgetParam.iswraing = false;
    if (this.editBudgetParam.budgetRadio === 1) {
      if (this.editBudgetParam.publisherId) {
        if (this.editBudgetParam.budget < this.editBudgetParam.budgetRanges[this.editBudgetParam.publisherId]['min']) {
          this.editBudgetParam.iswraing = true;
          return false;
        }

        //处理360媒体 ：预算不小于0切为10 的倍数
        if (this.viewTableData.summary_type === 'account' && this.editBudgetParam.publisherId === 3 && this.editBudgetParam.budget % 10 !== 0) {
          this.editBudgetParam.iswraing = true;
          return false;
        }
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
  setStatus(row, status, result) {
    const body = {
      select_type: 'current',
      pause: {
        is_edit: true,
        value: status,
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
            if (row['publisher_id'] * 1 === 10) {
              body['pub_creative_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_adgroup_id'] + '_' + row['pub_creative_id']];
            } else {
              body['pub_creative_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_creative_id']];
            }

            this.editCreative(body, 'single');
            break;
          case 'keyword':
            if (row['publisher_id'] * 1 === 10) {
              body['pub_keyword_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_adgroup_id'] + '_' + row['pub_keyword_id']];
            } else {
              body['pub_keyword_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_keyword_id']];
            }

            this.editKeyword(body, 'single');
            break;
          case 'adgroup':
            body['pub_adgroup_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_adgroup_id']];
            this.editAdgroup(body, 'single', row);
            break;
          case 'campaign':
            body['pub_campaign_ids'] = [row['chan_pub_id'] + '_' + row['pub_account_id'] + '_' + row['pub_campaign_id']];
            this.editCampaign(body, 'single', row);
            break;
        }
        row['status'] = result;
        if (row['status'] == '有效') {
          row['pause'] = 0;
          row['pause_name'] = "启用";
        } else {
          row['pause'] = 1;
          row['pause_name'] = "暂停";
        }
      }
    });

  }

  //--单个编辑出价比例
  clickPriceRatioCancel(row, title) {
    if (title === 'priceRatioWap') {
      row['showPriceRatioWap'] = false;
      row['showPriceRatioWapBtn'] = false;
    } else if (title === 'priceRatioPC') {
      row['showPriceRatioPC'] = false;
      row['showPriceRatioPCBtn'] = false;
    }

  }

  editPriceRatio(row, title) {
    this.editPriceRatioParam.publisherId = row.publisher_id * 1;
    if (row.bid_prefer * 1 === 1) {
      this.editPriceRatioParam.priceRatio = row.wap_price_ratio;
    } else if (row.bid_prefer * 1 === 2) {
      this.editPriceRatioParam.priceRatio = row.pc_price_ratio;
    }

    this.editPriceRatioParam['bid_prefer'] = row.bid_prefer * 1;
    if (title === 'priceRatioWap') {
      row['showPriceRatioWap'] = true;
      row['showPriceRatioWapBtn'] = true;
    } else if (title === 'priceRatioPC') {
      row['showPriceRatioPC'] = true;
      row['showPriceRatioPCBtn'] = true;
    }

  }
  priceRatioChange(event, title?) {
    if (title === 'priceRatioWap') {
      this.priceRatioCheckPage('priceRatioWap');
    } else if (title === 'priceRatioPC') {
      this.priceRatioCheckPage('priceRatioPC');
    }
  }

  clickPriceRatioOk(row, title) {
    this.editPriceRatioParam.iswraing = false;
    if (title === 'priceRatioWap') {
      this.priceRatioCheckPage('priceRatioWap');
    } else if (title === 'priceRatioPC') {
      this.priceRatioCheckPage('priceRatioPC');
    }

    if (!this.editPriceRatioParam.iswraing) {

      const body = {
        select_type: 'current',
        pub_campaign_ids: [row.chan_pub_id + "_" + row.pub_account_id + "_" + row.pub_campaign_id],
        bid_prefer: {
          is_edit: false,
          value: this.editPriceRatioParam['bid_prefer'],
        },
      };

      if (title === 'priceRatioWap') {
        body['wap_price_ratio'] = {
          is_edit: true,
          value: this.editPriceRatioParam.priceRatio,
        };
      } else if (title === 'priceRatioPC') {
        body['pc_price_ratio'] = {
          is_edit: true,
          value: this.editPriceRatioParam.priceRatio,
        };
      }
      this.editCampaign(body, 'single', row);
      row.pc_price_ratio = this.editPriceRatioParam.priceRatio;
      row.wap_price_ratio = this.editPriceRatioParam.priceRatio;
    }
  }

  priceRatioCheckPage(title) {
    this.editPriceRatioParam.iswraing = false;
    if (title === 'priceRatioWap') {

      if (!this.editPriceRatioParam.priceRatio) {
        this.editPriceRatioParam.iswraing = true;
        return false;
      }
      //百度  0~10.00，可保留小数点后两位）
      if (this.editPriceRatioParam.publisherId === 1) {
        if (this.editPriceRatioParam.priceRatio < 0 || this.editPriceRatioParam.priceRatio > 10.00) {
          this.editPriceRatioParam.iswraing = true;
          return false;
        }
      }

      //（360   0.1-0.9且保留一位小数 ）
      if (this.editPriceRatioParam.publisherId === 3) {
        if (this.editPriceRatioParam.priceRatio < 0.1 || this.editPriceRatioParam.priceRatio > 9.9) {
          this.editPriceRatioParam.iswraing = true;
          return false;
        }
        if (this.getPointAfterCount(this.editPriceRatioParam.priceRatio) > 1) {

          this.editPriceRatioParam.iswraing = true;
          return false;
        }
      }

      //（搜狗，默认值为1.00，比例范围为0.10到100.00。）
      if (this.editPriceRatioParam.publisherId === 2) {
        if (this.editPriceRatioParam.priceRatio < 0.10 || this.editPriceRatioParam.priceRatio > 100.00) {
          this.editPriceRatioParam.iswraing = true;
          return false;
        }
      }
    } else if (title === 'priceRatioPC') {

      //计算机出价比例 (只有百度有)，
      /*1.  在移动优先情况下，pc出价比例可以改成0  代表不投放pc
      * 2.  取消仅投放移动的计划  device只能为0
      * */
      if (!this.editPriceRatioParam.priceRatio && this.editPriceRatioParam.priceRatio !== 0) {
        this.editPriceRatioParam.iswraing = true;
        return false;
      }

      if (this.editPriceRatioParam.priceRatio < 0.10 && this.editPriceRatioParam.priceRatio !== 0) {
        this.editPriceRatioParam.iswraing = true;
        return false;
      }
      if (this.editPriceRatioParam.priceRatio > 10.00) {
        this.editPriceRatioParam.iswraing = true;
        return false;
      }
    }
  }

  openDataAnalysis(row) {
    this.chartItems = this.viewItemService.getChartItem();
    row['analysis'] = true;

  }
  closeDataAnalysis(row) {
    row['analysis'] = false;
  }
  //判断小数点后几位数
  getPointAfterCount(number) {
    return number.toString().split(".")[1].length;
  }

  //复制访问url
  copyUrl(url) {
    copy2Clipboard(url).then(() => this._message.success(`复制成功`));
  }

  showNoImpressionInfo() {

    if (isUndefined(this.noImpressionNotifyId) || this.noImpressionNotifyId.state === 'leave') {
      this.noImpressionNotifyId = this.notification.create('info', '温馨提示',
        '无展现条件下关键词不支持排序，可进行筛选并批量编辑', { nzDuration: 0 });
    }


  }

  clearNoImpressionNotify() {

    if (!isUndefined(this.noImpressionNotifyId)) {
      this.notification.remove(this.noImpressionNotifyId.messageId);
      this.noImpressionNotifyId = undefined;
    }
  }

  batchUpload() {
    const uploadTitle = '上传' + this.summary_type_name[this.source_summary];
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
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        // this.refreshData();
      }
    });
  }

  batchUploadDelete() {
    const uploadTitle = '上传删除' + this.summary_type_name[this.source_summary];
    const add_modal = this.modalService.create({
      nzTitle: uploadTitle,
      nzWidth: 800,
      nzContent: ViewBatchUploadDeleteComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        summaryType: this.source_summary,
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        // this.refreshData();
      }
    });
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
  reloadFirstPage() {
    this.pageInfo.currentPage = 1;
    this.reloadData();
  }

  openPreview(data) {
    const add_modal = this.modalService.create({
      nzTitle: data.ad_type,
      nzWidth: 600,
      nzContent: FengwuPreviewComponent,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'fengwu-preview-modal',
      nzFooter: null,
      nzComponentParams: {
        data: JSON.parse(data.fengwu_body),
        type: data.ad_type
      },
    });
    add_modal.afterClose.subscribe((result) => {

    });

  }
  jumpToCreate() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  getSelectedData() {
    const tempData = [];
    this.rows.forEach(item => {
      if (!item.summaryData && item.checked) {
        tempData.push(item);
      }
    });
    return tempData;
  }

  sortData(value, data) {
    let orderKey;
    let dir = 'desc';

    if (value == null) {
      return;
    }
    if (value == 'ascend') {
      orderKey = data.prop;
      dir = 'asc';
    } else if (value == 'descend') {
      orderKey = data.prop;
      dir = 'desc';
    } else {
      orderKey = '';
      dir = 'desc';
    }

    this.defaultSortItems = [{ prop: orderKey, dir: dir }];

    if (orderKey === 'publisher') {
      orderKey = 'publisher_id';
    }
    if (orderKey === 'pause_name') {
      orderKey = 'pause';
    }
    this.viewTableData['sort_item'] = { key: orderKey, dir: dir };

    this.refreshData();
  }

  openDataViewDrawer(data) {
    if (this.source_summary === 'ocpc_baidu') {
      this.report_source_summary = 'ocpc_baidu_report';
    } else {
      this.report_source_summary = 'ocpc_360';
    }
    this.dataViewDrawerShow = true;
    this.curTableData = data;
    if (this.source_summary === 'ocpc_baidu') {
      this.reportDrawerTitle = "ocpc报告（" + data.pub_target_package_name + "）";
    } else if (this.source_summary === 'ocpc_360_setting') {
      this.reportDrawerTitle = "ocpc报告（" + data.pub_ocpc_name + "）";
    }
  }

  closeDataViewDrawer() {
    this.dataViewDrawerShow = false;
  }

  collapse(data) {
    data.expand = !data.expand;
    if (data.expand) {
      this.getCampaignData(data);
    }
  }

  getCampaignData(data) {
    this.allFilterOption = { ...this.allFilterOption };
    this.viewTableData.single_condition = [];
    Object.values(this.allFilterOption).forEach((item) => {
      const findExistsColumn = this.viewTableData['selected_items'].find((col) => col.key === item['filterKey']['key']);
      if (isUndefined(findExistsColumn)) {
      }
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    this.loadingIndicator = true;
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));
    if (this.viewTableData['summary_type'] !== 'search_keyword') {
      tmpViewTableData['selected_items'].push({ data_type: 'pub_attr_data', key: 'publisher_id', showKey: 'publisher', selected: { current: true } });
    }
    if (this.source_summary === 'ocpc_baidu') {
      tmpViewTableData.summary_type = "ocpc_baidu_campaign";
      tmpViewTableData.data_range = {
        select_type: "baidu_ocpc_package",
        select_data: [data['publisher_id'] + '_' + data['chan_pub_id'] + '_' + data['pub_target_package_id']]
      };
    } else {
      tmpViewTableData.summary_type = "ocpc_360_campaign";
    }

    const postData = { sheets_setting: { table_setting: tmpViewTableData } };
    this.sub.add(
      this.dataViewService.getViewList(postData, {
        count: this.pageInfo.pageSize,
        page: this.pageInfo.currentPage,
      }).subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            data['children'] = results['data']['detail'];
            //匹配模式
            data['children'].map((item, index) => {
              item.key = index;
              if (item.publisher_id) {
                item['matchTypeList'] = this.dataViewService.matchTypes[item.publisher_id];
              }
            });
            this.pageInfo.currentPageCount = results['data']['detail'].length;
            this.selected = [];
            this.loadingIndicator = false;
          }
        },
        (err: any) => {

        },
        () => {

        },
      ));
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

  onFreqChange() {
    if (this.viewReportSetting.report_freq === 'day') {
      this.cron_time = new Date(2019, 3, 12, 10, 30, 0);
    } else {
      this.cron_time = new Date(2019, 3, 12, 12, 0, 0);
    }
  }

}
