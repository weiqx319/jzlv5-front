import { Component, HostListener, OnInit, Renderer2, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../../../core/service/auth.service";
import { NotifyService } from "../../../../../../module/notify/notify.service";
import { LocalStorageService } from "ngx-webstorage";
import {
  formatDate,
  generateTimeResult, generateTimeTip,
  splitDate
} from "@jzl/jzl-util";
import { isNumber, isObject, isUndefined } from "@jzl/jzl-util";
import { Subscription } from 'rxjs';
import { ViewBookmarkComponent } from '../../../../../../module/bookmark/components/view-bookmark.component';
import { TableItemFeedService } from '../../../../../../module/table-setting/service/table-item-feed.service';
import { ItemSelectService } from '../../../../../../module/item-select/service/item-select.service';
import { ReportService } from '../../../../../report-feed/service/report.service';
import { MenuService } from '../../../../../../core/service/menu.service';
import { TableFieldFeedComponent } from '../../../../../../module/table-setting/components/table-field/table-field-feed.component';
import { TableQueryFeedComponent } from '../../../../../../module/table-setting/components/table-query/table-query-feed.component';
import { TableTimeComponent } from '../../../../../../module/table-time/components/table-time/table-time.component';
import { AppBookmarkModalComponent } from '../../../../../../module/bookmark/modal/app-bookmark-modal.component';
import { AppBookmarkSaveModalComponent } from '../../../../../../module/bookmark/modal/app-bookmark-save-modal/app-bookmark-save-modal.component';
import { DataViewEditWrapService } from '../../../../service/data-view-edit-wrap.service';
import { DataViewService } from '../../../../service/data-view.service';
import { ViewItemService } from '../../../../service/view-item.service';
import { DataViewTableComponent } from "../../../../../../shared/baseClass/DataViewTableComponent";
import { MaterialsDetailModalComponent } from "../../../../modal/materials-detail-modal/materials-detail-modal.component";
import { MaterialsService } from '../../../../service/materials.service';

@Component({
  selector: 'app-video-summary-report',
  templateUrl: './video-summary-report.component.html',
  styleUrls: ['./video-summary-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TableItemFeedService, DataViewEditWrapService, MaterialsService],
})
export class VideoSummaryReportComponent extends DataViewTableComponent implements OnInit {
  private sub = new Subscription();

  public viewChartShow = false;
  public showChartType = 'day';
  public chartItems = [];

  public chartOptions: any;
  public apiData = [];


  public show_type = 'table';

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


  public channel_id = 2;

  public authorRole = {
    '1': [],
    '2': [],
    '3': [],
  };



  public tableHeight = document.body.clientHeight - 60 - 65 - 30 - 40;
  public rowHeight = 40;
  public summaryHeight = 40;
  private defaultRowHeight = 40;

  public is_refresh = 0;


  @ViewChild('chkHeader', { static: true }) chkHeader: TemplateRef<any>;
  @ViewChild('filterHeader', { static: true }) filterHeader: TemplateRef<any>;
  @ViewChild('dataAnalysisHeader', { static: true }) dataAnalysisHeader: TemplateRef<any>;

  @ViewChild('dataAnalysisCell', { static: true }) dataAnalysisCell: TemplateRef<any>;

  @ViewChild('chkCell', { static: true }) chkCell: TemplateRef<any>;
  @ViewChild('rateCell', { static: true }) rateCell: TemplateRef<any>;
  @ViewChild('rateCellColor', { static: true }) rateCellColor: TemplateRef<any>;
  @ViewChild('cellColor', { static: true }) cellColor: TemplateRef<any>;

  @ViewChild('summaryCell', { static: true }) summaryCell: TemplateRef<any>;
  @ViewChild('summaryCellColor', { static: true }) summaryCellColor: TemplateRef<any>;
  @ViewChild('rateSummaryCell', { static: true }) rateSummaryCell: TemplateRef<any>;
  @ViewChild('rateSummaryCellColor', { static: true }) rateSummaryCellColor: TemplateRef<any>;


  @ViewChild('creativeCell', { static: true }) creativeCell: TemplateRef<any>;
  @ViewChild('materialCell', { static: true }) materialCell: TemplateRef<any>;
  @ViewChild('starTpl', { static: true }) starTpl: TemplateRef<any>;
  @ViewChild('viewTitleCell', { static: true }) viewTitleCell: TemplateRef<any>;
  @ViewChild('previewCombineCell', { static: true }) previewCombineCell: TemplateRef<any>;


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


  public publisher_id;


  public isJump = '';


  public cardPage = {
    pageSize: 50,
    currentPage: 1,
    pageSizeList: [10, 20, 50, 100, 200, 500, 1000, 5000],
  };

  @ViewChild('nzSelectAdver') nzSelectAdver: NzSelectComponent;

  constructor(
    private dataViewService: DataViewService,
    private dataViewEditWrapService: DataViewEditWrapService,
    private tableService: TableItemFeedService,
    private viewItemService: ViewItemService,
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
    public menuService: MenuService,
    private materialsService: MaterialsService,
  ) {

    super(localSt, authService, menuService, notifyService, _message, reportService);
    this.userSelectedOper = this.authService.getCurrentUserOperdInfo();
    this.publisher_id = this.menuService.currentPublisherId;

    // 初始化summaryType (直接指定或静态路由获取 )
    this.viewTableData['summary_type'] = "materials_video";
    this.viewTableData['sub_summary_type'] = "materials_video";
    this.source_summary = "materials_video";
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    if (this.viewChartShow) {
      this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 300 - 40;
    } else {
      this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 40;
    }
  }

  ngOnInit() {
    const localMarkInfo = this.getLocalBookMark('', this.source_summary, this.menuService.currentChannelId, this.menuService.currentPublisherId, 0);
    this.viewReportSetting.report_name =
      '自定义报表-' + this.summary_type_name[this.source_summary];
    this.viewTableData['sort_item'] = { key: 'pub_cost', dir: 'desc' };
    this.viewTableData[
      'selected_items'
    ] = this.viewItemService.getDefaultItemsBySummaryType(this.source_summary);
    if (this.source_summary === 'target') {
      if (localMarkInfo === null) {
        this.viewTableData[
          'locked_items'
        ] = this.viewItemService.getLockedItemsBySummaryType(this.source_summary);
      } else {
        this.viewTableData[
          'locked_items'
        ] = localMarkInfo['sheets_setting']['table_setting']['locked_items'];
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
    this.getAuthorList();
    this.pubTableItems = this.tableService.getTableItemsObj(
      this.viewTableData.report_type,
      this.viewTableData.summary_type,
    );

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


      this.changeSelectedBookMark(localMarkInfo['sheets_setting']);
    }
  }


  sortBySummaryType() {
    //@todo 2020-01-10 修改逻辑,统一按pub_cost排序
    this.viewTableData['sort_item'] = { key: 'pub_cost', dir: 'desc' };
    this.defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];
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

  refreshData(fromMark = false) {
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
            }
          },
          (err: any) => {
            this.loadingIndicator = false;
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
    this.sub.add(
      this.dataViewService.getViewList(postData, { is_count: 1 }).subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.pageInfo.allCount = results['data']['detail_count'];
          }
        },
        (err: any) => {
          this.loadingCountIndicator = false;
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
      this.time_grain_filter === 'hour_day'
    ) {
      this.viewTableData.report_type = 'hours_report';
    } else {
      this.viewTableData.report_type = 'basic_report';
    }

    //选择的只要有分日，汇总传 day ， 否则 传 合计summary
    if (
      this.time_grain_filter === 'day' ||
      this.time_grain_filter === 'hour_day'
    ) {
      this.viewTableData.time_grain = 'day';
    } else if (this.time_grain_filter === 'week' || this.time_grain_filter === 'weekSplit' || this.time_grain_filter === 'month') {
      this.viewTableData.time_grain = this.time_grain_filter;
    } else {
      this.viewTableData.time_grain = 'summary';
    }

    if (this.source_summary === 'target') {
      this.viewTableData['report_type'] = 'target_report';
    }

    if (this.viewTableData.report_type === 'hours_report') {
      this.viewTableData.summary_type = JSON.parse(JSON.stringify(this.source_summary)) + '_hour';
    } else {
      this.viewTableData.summary_type = this.source_summary;
    }
    this.time_grain = this.time_grain_filter;

    this.sortBySummaryType();

    setTimeout(() => {
      this.refreshFields(this.viewTableData['selected_items']);
      this.reloadFirstPage();
    });
  }

  reloadData(reloadChart = true) {
    this.refreshSummaryData();
    this.refreshData();
    this.setLocalBookMark('', this.source_summary, {
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


    const tmpFiled: any = [];
    data.forEach((item) => {
      let popKey = item.key;
      if (item.hasOwnProperty('showKey') && item.showKey !== '') {
        popKey = item.showKey;
      }
      const tplHeader = {};
      if (item['is_rate']) {
        tplHeader['cellTemplate'] = this.rateCell;
      }
      if (item.hasOwnProperty('sortable')) {
        tplHeader['sortable'] = item.sortable;
      }

      if (item.type && item.type === 'number') {
        tplHeader['cellClass'] = 'num_right';
        tplHeader['headerClass'] = 'header_right';
      }

      if (popKey === 'creative') {
        tplHeader['cellTemplate'] = this.creativeCell;
      }

      if (popKey === 'materials') {
        tplHeader['cellTemplate'] = this.materialCell;
      }

      if (popKey == 'video_id') {
        tplHeader['cellTemplate'] = this.previewCombineCell;
      }



      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];
      }
      if (item.selected && item.selected['current']) {
        // {"prop": "pub_keyword_id", name: '关键词'},
        if (item.type && item.type === 'number') {
          tplHeader['summaryFunc'] = () => this.summaryData[popKey];
          tplHeader['summaryTemplate'] = this.summaryCell;
          if (item['is_rate']) {
            tplHeader['summaryTemplate'] = this.rateSummaryCell;
          }
        }

        tmpFiled.push({
          prop: popKey,
          name: item.name,
          resizeable: true,
          width: item.width,
          ...tplHeader,
        });
      }
      if (item.selected && item.selected['compare']) {
        const showName = this.viewTableData['summary_date_compare_alias'] + item.name + '#';
        tplHeader['summaryFunc'] = () => this.summaryData[popKey + '_cmp'];
        tplHeader['summaryTemplate'] = this.summaryCell;
        if (item['is_rate']) {
          tplHeader['summaryTemplate'] = this.rateSummaryCell;
        }
        if (this.allFilterOption.hasOwnProperty(popKey)) {
          if (this.allFilterOption.hasOwnProperty(popKey + '_cmp')) {
            tplHeader['data'] = this.allFilterOption[popKey + '_cmp'];
          } else {
            this.allFilterOption[popKey + '_cmp'] = {
              filterType: 'numberFilter',
              filterOption: [],
              filterKey: { key: popKey + '_cmp', data_type: item.data_type, name: showName, type: 'numberFilter' },
              filterResult: {},
            };
            tplHeader['data'] = this.allFilterOption[popKey + '_cmp'];
          }
        }
        tmpFiled.push({ prop: popKey + '_cmp', draggable: false, name: showName, resizeable: true, width: item.width, ...tplHeader });
        if (this.viewTableData.time_grain == 'summary') {
          this.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
            const currentOtherCompareField = popKey + '_cmp' + key;
            tplHeader['summaryFunc'] = () => this.summaryData[currentOtherCompareField];
            tplHeader['summaryTemplate'] = this.summaryCell;
            if (item['is_rate']) {
              tplHeader['summaryTemplate'] = this.rateSummaryCell;
            }

            if (this.allFilterOption.hasOwnProperty(popKey)) {
              if (this.allFilterOption.hasOwnProperty(currentOtherCompareField)) {
                tplHeader['data'] = this.allFilterOption[currentOtherCompareField];
              } else {
                this.allFilterOption[currentOtherCompareField] = {
                  filterType: 'numberFilter',
                  filterOption: [],
                  filterKey: { key: currentOtherCompareField, data_type: item.data_type, name: otherItem.alias ? otherItem.alias + item.name + '#' : item.name + '#' + (key + 2), type: 'numberFilter' },
                  filterResult: {},
                };
                tplHeader['data'] = this.allFilterOption[currentOtherCompareField];
              }
            }

            tmpFiled.push({ prop: currentOtherCompareField, draggable: false, name: otherItem.alias ? otherItem.alias + item.name + '#' : item.name + '#' + (key + 2), resizeable: true, width: item.width, ...tplHeader });

          });
        }

      }
      if (item.selected && item.selected['compare_abs']) {
        const showName = this.viewTableData['summary_date_compare_alias'] + item.name + '△';
        if (item['is_rate']) {
          tplHeader['cellTemplate'] = this.rateCellColor;
          tplHeader['summaryTemplate'] = this.rateSummaryCellColor;
        } else {
          tplHeader['cellTemplate'] = this.cellColor;
          tplHeader['summaryTemplate'] = this.summaryCellColor;
        }
        tplHeader['summaryFunc'] = () => this.summaryData[popKey + '_abs'];

        if (this.allFilterOption.hasOwnProperty(popKey)) {
          if (this.allFilterOption.hasOwnProperty(popKey + '_abs')) {
            tplHeader['data'] = this.allFilterOption[popKey + '_abs'];
          } else {
            this.allFilterOption[popKey + '_abs'] = {
              filterType: 'numberFilter',
              filterOption: [],
              filterKey: { key: popKey + '_abs', data_type: item.data_type, name: showName, type: 'numberFilter' },
              filterResult: {},
            };
            tplHeader['data'] = this.allFilterOption[popKey + '_abs'];
          }
        }

        tmpFiled.push({ prop: popKey + '_abs', draggable: false, name: showName, resizeable: true, width: item.width, ...tplHeader });

        if (this.viewTableData.time_grain == 'summary') {
          this.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
            const currentOtherCompareField = popKey + '_abs' + key;
            tplHeader['summaryFunc'] = () => this.summaryData[currentOtherCompareField];
            tplHeader['summaryTemplate'] = this.summaryCellColor;
            tplHeader['cellTemplate'] = this.cellColor;
            if (item['is_rate']) {
              tplHeader['cellTemplate'] = this.rateCellColor;
              tplHeader['summaryTemplate'] = this.rateSummaryCellColor;
            }

            if (this.allFilterOption.hasOwnProperty(popKey)) {
              if (this.allFilterOption.hasOwnProperty(currentOtherCompareField)) {
                tplHeader['data'] = this.allFilterOption[currentOtherCompareField];
              } else {
                this.allFilterOption[currentOtherCompareField] = {
                  filterType: 'numberFilter',
                  filterOption: [],
                  filterKey: { key: currentOtherCompareField, data_type: item.data_type, name: otherItem.alias ? otherItem.alias + item.name + '△' : item.name + '△' + (key + 2), type: 'numberFilter' },
                  filterResult: {},
                };
                tplHeader['data'] = this.allFilterOption[currentOtherCompareField];
              }
            }

            tmpFiled.push({ prop: currentOtherCompareField, draggable: false, name: otherItem.alias ? otherItem.alias + item.name + '△' : item.name + '△' + (key + 2), resizeable: true, width: item.width, ...tplHeader });

          });
        }
      }
      if (item.selected && item.selected['compare_rate']) {
        const showName = this.viewTableData['summary_date_compare_alias'] + item.name + '%';
        tplHeader['cellTemplate'] = this.rateCellColor;
        tplHeader['summaryFunc'] = () => this.summaryData[popKey + '_rat'];
        tplHeader['summaryTemplate'] = this.rateSummaryCellColor;

        if (this.allFilterOption.hasOwnProperty(popKey)) {
          if (this.allFilterOption.hasOwnProperty(popKey + '_rat')) {
            tplHeader['data'] = this.allFilterOption[popKey + '_rat'];
          } else {
            this.allFilterOption[popKey + '_rat'] = {
              filterType: 'numberFilter',
              filterOption: [],
              filterKey: { key: popKey + '_rat', data_type: item.data_type, name: showName, type: 'numberFilter' },
              filterResult: {},
            };
            tplHeader['data'] = this.allFilterOption[popKey + '_rat'];
          }
        }
        tmpFiled.push({ prop: popKey + '_rat', draggable: false, name: showName, resizeable: true, width: item.width, cellTemplate: this.rateCell, ...tplHeader });

        if (this.viewTableData.time_grain == 'summary') {
          this.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
            const currentOtherCompareField = popKey + '_rat' + key;
            tplHeader['summaryFunc'] = () => this.summaryData[currentOtherCompareField];
            tplHeader['summaryTemplate'] = this.rateSummaryCellColor;
            tplHeader['cellTemplate'] = this.rateCellColor;

            if (this.allFilterOption.hasOwnProperty(popKey)) {
              if (this.allFilterOption.hasOwnProperty(currentOtherCompareField)) {
                tplHeader['data'] = this.allFilterOption[currentOtherCompareField];
              } else {
                this.allFilterOption[currentOtherCompareField] = {
                  filterType: 'numberFilter',
                  filterOption: [],
                  filterKey: { key: currentOtherCompareField, data_type: item.data_type, name: item.name + '%', type: 'numberFilter' },
                  filterResult: {},
                };
                tplHeader['data'] = this.allFilterOption[currentOtherCompareField];
              }
            }

            tmpFiled.push({ prop: currentOtherCompareField, draggable: false, name: otherItem.alias ? otherItem.alias + item.name + '%' : item.name + '%' + (key + 2), resizeable: true, width: item.width, ...tplHeader });

          });
        }

      }
    });
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

      if (popKey === 'materials') {
        tplHeader['cellTemplate'] = this.materialCell;
        tplHeader['sortable'] = false;
      }

      if (this.source_summary !== 'target') {
        if (
          popKey === 'publisher' ||
          popKey === 'pub_account_name' ||
          popKey === 'pub_campaign_name' ||
          popKey === 'pub_adgroup_name'
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
        width: item.width,
        frozenLeft: true,
        ...tplHeader,
      });
    });

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
    this.columns = [];
    this.columns.push(...checkFiled);
    if (this.time_grain_filter === 'hour_day') {
      this.columns.push(...timeFiledColumn, ...hourFiledColumn);
    }
    if (this.time_grain_filter === 'day' || this.time_grain_filter === 'weekSplit' || this.time_grain_filter == 'week' || this.time_grain_filter == 'month') {
      this.columns.push(...timeFiledColumn);
    }
    if (this.time_grain_filter === 'hour') {
      this.columns.push(...hourFiledColumn);
    }
    if (this.source_summary === 'target') {

      this.columns.push(...lockedColumn, ...tmpFiled);
    } else {
      this.columns.push(...lockedColumn, ...tmpFiled);
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

        this.router.navigateByUrl('/data_view/feed/creative');

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
    this.cardPage.currentPage = page.page;
    this.refreshData();
    this.refreshCount();
  }

  changePageSize(pageSize) {
    this.pageInfo.currentPage = 1;
    this.cardPage.currentPage = 1;
    this.cardPage.pageSize = this.pageInfo.pageSize;
    this.reloadData(false);
  }

  changeCardPage() {
    this.pageInfo.currentPage = this.cardPage.currentPage;
    this.refreshData();
    this.refreshCount();
  }

  changeCardPageSize() {
    this.pageInfo.currentPage = 1;
    this.cardPage.currentPage = 1;
    this.pageInfo.pageSize = this.cardPage.pageSize;
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
    //   this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 300 - 40;
    // } else {
    //   this.bookMarkTop = this._bookMarkDefaultTop;
    //   this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 40;
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

  getRowHeight(row) {
    if (row === undefined) {
      return 90;
    }

    if (row['material_id'] || row['key_frame_image_url'] || (row['poster_url'] && row['poster_url'] != '素材所属主体与开发者主体不一致无法获取URL')) {
      return 200;
    } else {
      return 50;
    }
  }

  private getReportName() {
    const reportName = '自定义报表-' + this.summary_type_name[this.source_summary];


    return reportName;
  }

  getAuthorList() {
    this.materialsService
      .getMaterialsAuthorList({}, {
        page: 1,
        count: 10000000,
        cid: this.authService.getCurrentUserOperdInfo().select_cid
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            const list = results['data']['detail'];
            list.forEach(item => {
              this.authorRole[item.material_author_role].push({
                key: item.material_author_id,
                name: item.material_author_name,
              });
            });
            this.allFilterOption["director_id"]["filterOption"] = this.authorRole['1'];
            this.allFilterOption["camerist_id"]["filterOption"] = this.authorRole['2'];
            this.allFilterOption["movie_editor_id"]["filterOption"] = this.authorRole['3'];


          } else if (results.status_code && results.status_code === 205) {

          } else {
            this._message.error(results.message);
          }
        },
        (err: any) => {
          this._message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }


  materialsDetail(data) {

    if (data['material_id'] || data['preview_url'] || (data['poster_url'] && data['poster_url'] != '素材所属主体与开发者主体不一致无法获取URL')) {
      const add_modal = this.modalService.create({
        nzTitle: '素材详情',
        nzWidth: 800,
        nzContent: MaterialsDetailModalComponent,
        nzClosable: false,
        nzMaskClosable: false,
        nzWrapClassName: 'materials-detail-modal',
        nzFooter: null,
        nzComponentParams: {
          data,
          publisherId: this.publisher_id
        },
      });
      add_modal.afterClose.subscribe(result => {
        if (result === 'onOk') {
          this.refreshData();
        }
      });
    }
  }
  reloadFirstPage() {
    this.pageInfo.currentPage = 1;
    this.reloadData();
  }

}
