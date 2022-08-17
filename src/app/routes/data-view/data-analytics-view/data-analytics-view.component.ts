import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef, ViewChild, ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationData, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { LocalStorageService } from "ngx-webstorage";
import { isNull, isObject, isUndefined } from "@jzl/jzl-util";
import { DataViewService } from '../service/data-view.service';
import { ViewItemService } from '../service/view-item.service';
import { TableItemService } from '../../../module/table-setting/service/table-item.service';
import { ItemSelectService } from '../../../module/item-select/service/item-select.service';
import { ReportService } from '../../report/service/report.service';
import { AuthService } from '../../../core/service/auth.service';
import { NotifyService } from '../../../module/notify/notify.service';
import { DataViewOptimizationService } from '../service/data-view-optimization.service';
import { DataViewFolderService } from '../service/data-view-folder.service';
import { Subject, Subscription } from 'rxjs';
import { ViewBookmarkComponent } from '../../../module/bookmark/components/view-bookmark.component';
import { TableFieldComponent } from '../../../module/table-setting/components/table-field/table-field.component';
import { TableTimeComponent } from '../../../module/table-time/components/table-time/table-time.component';
import { TableQueryComponent } from '../../../module/table-setting/components/table-query/table-query.component';
import { copy2Clipboard, generateTimeResult, generateTimeTip } from '@jzl/jzl-util';
import { AppBookmarkModalComponent } from '../../../module/bookmark/modal/app-bookmark-modal.component';
import { AppBookmarkSaveModalComponent } from '../../../module/bookmark/modal/app-bookmark-save-modal/app-bookmark-save-modal.component';

import { environment } from '../../../../environments/environment';
import { DataViewTableComponent } from '../../../shared/baseClass/DataViewTableComponent';
import { MenuService } from '../../../core/service/menu.service';
import { explainTableField } from '../../../shared/util/util';

@Component({
  selector: 'app-analytics-view',
  templateUrl: './data-analytics-view.component.html',
  styleUrls: ['../../../../styles/routes/routes.scss', './data-analytics-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TableItemService, DataViewOptimizationService, DataViewFolderService],
})
export class DataAnalyticsViewComponent extends DataViewTableComponent implements OnInit, OnDestroy {
  private sub = new Subscription();
  public viewChartShow = false;
  public showChartType = 'day';
  /*public chartItems = [];
  public chartSelectedItem: Array<any> = [];*/
  public chartItems = [];
  public isJump = '';
  public viewType = 'analytics';

  public filterNoImpression = false;
  private noImpressionNotifyId: NzNotificationData;

  public chartOptions: any;

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

  public apiData = [];



  public defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];
  // public defaultSortItems = [sorts]="[{prop: 'name', dir: 'desc'}]">
  /* public is_compare = false;*/
  public endLocked_items: any;


  public viewReportSetting = {
    report_name: '自定义报表',
    report_data_type: 2,
    run_type: 2,//纯数据报表
    channel_id: 1,
    report_format: 'excel',
    report_freq: 'now',
    email_list: "",
    sheets_setting: [],
    time_grain: 'summary',
  };





  // public quickEditItem = 1;
  public dashBoardList = [];
  public tableHeight = document.body.clientHeight - 60 - 65 - 30;
  public rowHeight = 40;
  private defaultRowHeight = 40;

  public lineChartData = [];
  public is_refresh = 0;

  public rankingCode = { region: "9010000", device: 1 };
  public ranking_setting: any; //记录实时排名数据


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
    match_type: 2, // 1，短语否定 2，精确否定
  };

  public addNegativeWordGroupData = {
    is_add: 1, // 0，否 1，是
    group_id: null, // 否词包
  };
  public negativeKeywordLength = 0;
  public clickReal = false;

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

  @ViewChild('quickEditButton') quickEditButton: any;


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
  public optimization_group = [];
  public folder_list = [];

  @ViewChild('nzSelectAdver') nzSelectAdver: NzSelectComponent;


  constructor(private dataViewService: DataViewService,
    private viewItemService: ViewItemService,
    private tableItemService: TableItemService,
    private itemSelectService: ItemSelectService,
    public reportService: ReportService,
    public authService: AuthService,
    public _message: NzMessageService,
    private modalService: NzModalService,
    public localSt: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
    public notifyService: NotifyService,
    private renderer: Renderer2,
    private optimizationService: DataViewOptimizationService,
    private folderService: DataViewFolderService,
    private notification: NzNotificationService,
    public menuService: MenuService,
  ) {
    super(localSt, authService, menuService, notifyService, _message, reportService);
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
    this.viewTableData['reportAnalytics'] = true;
    if (this.viewTableData.summary_type === 'search_keyword') {
      this.viewTableData.main_range = 'leftJoin';

      // 获取否词包
    }

    this.viewReportSetting.report_name = '自定义报表-仅报告-' + this.summary_type_name[this.source_summary];
    this.viewTableData['sort_item'] = { key: 'pub_cost', dir: 'desc' };
    this.viewTableData['selected_items'] = this.viewItemService.getDefaultItemsBySummaryType(this.source_summary, true);
    this.viewTableData['locked_items'] = this.viewItemService.getLockedItemsBySummaryType(this.source_summary);
    this.endLocked_items = this.viewItemService.getEndLockedItemsBySummaryType(this.source_summary);

    this.allFilterOption = JSON.parse(JSON.stringify(this.viewItemService.getItemFilterType(this.source_summary)));

    // --- 获取默认
    const localMarkInfo = this.getLocalBookMark('analytics', this.source_summary);
    this.pubTableItems = this.tableItemService.getTableItemsObj(this.viewTableData.report_type, this.viewTableData.summary_type);
    // console.log(this.pubTableItems);
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
        this.refreshSummaryData();
        this.refreshData();
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
        this.setLocalBookMark('analytics', this.source_summary, {
          summary_type: this.source_summary,
          sheets_setting: {
            table_setting: localMarkInfo['sheets_setting']['table_setting'],
          },
          pageSize: this.pageInfo.pageSize,
          timeGrain: this.time_grain_filter,
        });
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
            this.loadingIndicator = false;
            this.rows = results['data']['detail'];
            //匹配模式
            this.rows.map((item) => {
              if (item.publisher_id) {
                item['matchTypeList'] = this.dataViewService.matchTypes[item.publisher_id];
              }
            });
            this.pageInfo.currentPageCount = results['data']['detail'].length;
            this.selected = [];

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
          this.loadingIndicator = false;
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
      this.summaryData = [];
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
        reportAnalytics: true,
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
        defined_is_disable: false
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
      this.pageInfo.currentPage = 1;
      if (this.source_summary == 'keyword' && this.viewTableData['main_range'] == 'no_impression') {
        this.filterNoImpression = true;
        this.showNoImpressionInfo();
      } else {
        this.filterNoImpression = false;
        this.clearNoImpressionNotify();
      }
      this.reloadData(true);
    });
  }

  timeRangeChange(event) {
    //当汇总选择分日时，展现默认 有展现 并且不让选择
    if (this.time_grain_filter !== 'summary' && this.source_summary !== 'search_keyword') {
      this.viewTableData['main_range'] = 'join';
    }

    //选择的只要有分时，报告类型传 hours_report ， 否则 传 basic_report
    if (this.time_grain_filter === 'hour' || this.time_grain_filter === 'hour_day') {
      this.viewTableData.report_type = 'hours_report';
    } else if (this.time_grain_filter === 'region' || this.time_grain_filter === 'region_day') {
      this.viewTableData.report_type = 'region_report';
    } else {
      this.viewTableData.report_type = 'basic_report';
    }

    //选择的只要有分日，汇总传 day ， 否则 传 合计summary
    if (this.time_grain_filter === 'day' || this.time_grain_filter === 'hour_day' || this.time_grain_filter === 'region_day') {
      this.viewTableData.time_grain = 'day';
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
      this.reloadFirstPage();
    });
  }



  reloadData(reloadChart = true) {
    this.refreshSummaryData();
    this.refreshData();
    this.setLocalBookMark('analytics', this.source_summary, {
      summary_type: this.source_summary,
      sheets_setting: {
        table_setting: this.viewTableData,
      },
      pageSize: this.pageInfo.pageSize,
      timeGrain: this.time_grain_filter,
    }, this.menuService.currentChannelId, this.menuService.currentPublisherId, 0);
    this.refreshCount();
    if (this.viewChartShow && reloadChart) {
      this.refreshChartData(this.showChartType);
    }

  }

  refreshFields(data: any[]) {
    const checkFiled: any = [{ width: '64', headerTemplate: this.chkHeader, cellTemplate: this.chkCell, name: 'checkBOx', frozenLeft: true }];
    const dataAnalysis: any = [{ width: '70', headerTemplate: this.dataAnalysisHeader, cellTemplate: this.dataAnalysisCell, name: '数据分析', prop: 'dataAnalysis', frozenLeft: true }];
    const timeFiled: any = [{ width: '120', name: '日期', key: 'date_str', frozenLeft: true, sortable: true }];
    const hourFiled: any = [{ width: '70', name: '小时', key: 'data_hour', frozenLeft: true, sortable: true }];
    const regionFiled: any = [{ width: '70', name: '省级地域', key: 'province_id', frozenLeft: true, sortable: true }, { width: '70', name: '市级地域', key: 'city_id', frozenLeft: true, sortable: true }];

    const tmpFiled: any = [];
    let hasCreative = false;
    hasCreative = explainTableField(data, tmpFiled, this);




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
      if (popKey === 'publisher' || popKey === 'pub_account_name' || popKey === 'pub_campaign_name' || popKey === 'pub_adgroup_name') {
        hasCreative = true;
        tplHeader['cellTemplate'] = this.viewTitleCell;
      }

      if (item.hasOwnProperty('sortable')) {
        tplHeader['sortable'] = item.sortable;
      }

      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];
      }
      if (lockedColumn.length === 0) {
        tplHeader['summaryFunc'] = () => "合计";
      }

      lockedColumn.push({ prop: popKey, name: item.name, frozenLeft: true, width: item.width, ...tplHeader });
    });
    if (this.endLocked_items.length) {
      this.endLocked_items.forEach((item) => {
        const popKey = item.key;
        const tplHeader = {};
        if (popKey === 'pub_operation') {
          tplHeader['cellTemplate'] = this.operation;
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
      regionFiledColumn.push({ prop: popKey, name: regionItem.name, resizeable: true, width: regionItem.width, ...tplHeader, frozenLeft: regionItem.frozenLeft, sortable: regionItem.sortable });

    });
    this.columns = [];
    this.columns.push(...checkFiled);
    if (this.time_grain_filter === 'hour_day') {
      this.columns.push(...timeFiledColumn, ...hourFiledColumn);
    }
    if (this.time_grain_filter === 'region_day') {
      this.columns.push(...timeFiledColumn, ...regionFiledColumn);
    }

    if (this.time_grain_filter === 'day' || this.time_grain_filter === 'week' || this.time_grain_filter === 'weekSplit' || this.time_grain_filter === 'month') {
      this.columns.push(...timeFiledColumn);
    }
    if (this.time_grain_filter === 'hour') {
      this.columns.push(...hourFiledColumn);
    }
    if (this.time_grain_filter === 'region') {
      this.columns.push(...regionFiledColumn);
    }

    if (this.endLocked_items.length && (this.userSelectedOper.role_id !== 5 && this.userSelectedOper.role_id !== 2 && this.userSelectedOper.role_id !== 6)) {
      if (this.source_summary != 'dsa_pattern_day' && this.source_summary !== 'ocpc_360' && this.source_summary !== 'creative_fengwu_360') {
        this.columns.push(...lockedColumn, ...dataAnalysis, ...tmpFiled, ...endLockedColumn);
      } else {
        this.columns.push(...lockedColumn, ...tmpFiled, ...endLockedColumn);
      }

    } else {
      if (this.source_summary != 'dsa_pattern_day' && this.source_summary !== 'ocpc_360' && this.source_summary !== 'creative_fengwu_360') {
        this.columns.push(...lockedColumn, ...dataAnalysis, ...tmpFiled);
      } else {
        this.columns.push(...lockedColumn, ...tmpFiled);
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
      this.refreshSummaryData();
      this.refreshData(true);

      this.refreshCount();
    }

  }

  // ---- mark -- end

  // -- report create

  handCreateReport() {
    if (this.reportPosting) {
      return false;
    }
    this.reportPosting = true;
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));

    //选择的只要有分时，报告类型传 hours_report ， 否则 传 basic_report
    if (this.time_grain === 'hour' || this.time_grain === 'hour_day') {
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
    } else if (['week', 'weekSplit', 'month'].includes(this.time_grain)) {
      grain = this.time_grain;
    }
    tmpViewTableData['time_grain'] = grain;
    this.viewReportSetting.time_grain = tmpViewTableData['time_grain'];

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




  ngOnDestroy(): void {
    this.rows = null;
    this.sub.unsubscribe();
    this.refreshRankingSingleComplete$.unsubscribe();
    this.clearNoImpressionNotify();
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



  //--单个编辑出价比例

  openDataAnalysis(row) {
    this.chartItems = this.viewItemService.getChartItem();
    row['analysis'] = true;

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


  changeDataViewUrl(viewType) {
    if (this.viewType === viewType) return;
    if (viewType === 'view') {
      this.router.navigate(['../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../' + viewType], { relativeTo: this.route });
    }
    this.viewType = viewType;
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

    this.addWordData.chan_pub_id = row.chan_pub_id + "";
    this.addWordData.pub_account_id = row.pub_account_id + "";
    this.addWordData.pub_campaign_id = row.pub_campaign_id + "";
    this.getCampaignListByAccount({ chan_pub_id: this.addWordData.chan_pub_id, pub_account_id: this.addWordData.pub_account_id });
    this.changeCampaign(this.addWordData);
    this.addWordData.pub_adgroup_id = row.pub_adgroup_id + "";
    this.addWordData.match_type = this.matchTypeData[0].value;
    this.addWordData['pub_keyword_id'] = row.pub_keyword_id + "";
    row['showAddWord'] = true;

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


  searchKeywordChange() {
    this.negativeKeywordLength = this.chkstrlen(this.addNegativeData.pub_query);
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
    this.addNegativeData.chan_pub_id = row.chan_pub_id + "";
    this.addNegativeData.pub_account_id = row.pub_account_id + "";
    this.addNegativeData.pub_campaign_id = row.pub_campaign_id + "";
    this.getCampaignListByAccount({ chan_pub_id: this.addNegativeData.chan_pub_id, pub_account_id: this.addNegativeData.pub_account_id });

    this.changeCampaign(this.addNegativeData, 'addNegativeData');
    this.addNegativeData.pub_adgroup_id = row.pub_adgroup_id + "";

    this.addNegativeWordGroupData.is_add = 1;
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
        word_name: [row.pub_query],
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

  reloadFirstPage() {
    this.pageInfo.currentPage = 1;
    this.reloadData();
  }

}
