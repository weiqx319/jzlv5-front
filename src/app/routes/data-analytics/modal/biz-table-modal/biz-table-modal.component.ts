import { Component, HostListener, Input, OnInit, Injector, TemplateRef, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { DataAnalyticsService } from "../../service/data-analytics.service";
import { TableItemService } from "../../../../module/table-setting/service/table-item.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { AuthService } from "../../../../core/service/auth.service";
import { deepCopy, isObject, isUndefined } from "@jzl/jzl-util";
import { TableQueryComponent } from "../../../../module/table-setting/components/table-query/table-query.component";
import { TableQueryFeedComponent } from '../../../../module/table-setting/components/table-query/table-query-feed.component';
import { TableFieldComponent } from "../../../../module/table-setting/components/table-field/table-field.component";
import { TableFieldFeedComponent } from "../../../../module/table-setting/components/table-field/table-field-feed.component";
import { Subscription } from "rxjs";
import { LocalStorageService } from "ngx-webstorage";
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";
import { DataViewTableComponent } from '../../../../shared/baseClass/DataViewTableComponent';
import { MenuService } from '../../../../core/service/menu.service';
import { RegionListService } from "../../../dashboard/service/region-list.service";
import { explainTableField } from '../../../../shared/util/util';

// 其他文件service-sem
import { ViewItemService as ViewItemServiceSem } from '../../../data-view/service/view-item.service';

// 其他文件service-feed
import { ViewItemService as ViewItemServiceFeed } from '../../../data-view-feed/service/view-item.service';

@Component({
  selector: 'app-biz-table-modal',
  templateUrl: './biz-table-modal.component.html',
  styleUrls: ['./biz-table-modal.component.scss'],
  providers: [TableItemService, RegionListService, ViewItemServiceSem, ViewItemServiceFeed]
})
export class BizTableModalComponent extends DataViewTableComponent implements OnInit {

  @Input() source_summary_type = 'biz_unit_report';
  private sub = new Subscription();

  public tableHeight = document.body.clientHeight - 240;
  public rowHeight = 40;
  private defaultRowHeight = 40;
  public orderInfo: any = {};

  public loadingIndicator = false;
  public loadingCountIndicator = true;

  public reorderable = false;
  public allFilterOption: any;
  public defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];

  public hours = [];
  public bizUnitData: any;
  @ViewChild('chkHeader', { static: true }) chkHeader: TemplateRef<any>;
  @ViewChild('filterHeader', { static: true }) filterHeader: TemplateRef<any>;
  @ViewChild('chkCell', { static: true }) chkCell: TemplateRef<any>;
  @ViewChild('rateCell', { static: true }) rateCell: TemplateRef<any>;
  @ViewChild('rateCellColor', { static: true }) rateCellColor: TemplateRef<any>;
  @ViewChild('cellColor', { static: true }) cellColor: TemplateRef<any>;

  @ViewChild('summaryCell', { static: true }) summaryCell: TemplateRef<any>;
  @ViewChild('summaryCellColor', { static: true }) summaryCellColor: TemplateRef<any>;
  @ViewChild('rateSummaryCell', { static: true }) rateSummaryCell: TemplateRef<any>;
  @ViewChild('rateSummaryCellColor', { static: true }) rateSummaryCellColor: TemplateRef<any>;
  @ViewChild('progressCell', { static: true }) progressCell: TemplateRef<any>;

  public showLeftJoin = true;

  // biz名称对应
  public summaryTypeObj = {
    'biz_unit_report': 'biz_unit_account',
    'biz_unit_hours_report': 'biz_unit_account_hours',
    'biz_unit_region_report': 'biz_unit_account_region',
    'biz_unit_campaign_report': 'biz_unit_campaign',
    'biz_unit_adgroup_report': 'biz_unit_adgroup',
    'biz_unit_keyword_report': 'biz_unit_keyword',
    'responsible_account': 'responsible_account',
    'landing_page_account': 'landing_page_account',
  }
  public reportTypeObj = {
    'responsible_account': 'responsible_account',
    'biz_unit_report': 'biz_unit_report',
    'biz_unit_hours_report': 'biz_unit_hours_report',
    'biz_unit_region_report': 'biz_unit_region_report',
    'biz_unit_campaign_report': 'biz_unit_report',
    'biz_unit_adgroup_report': 'biz_unit_report',
    'biz_unit_keyword_report': 'biz_unit_report',
    'landing_page_account': 'landing_page_account',
  }

  private publisherId;
  private viewItemService;
  constructor(private modalService: NzModalService,
    private regionList: RegionListService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    public localSt: LocalStorageService,
    public dataAnalyticsService: DataAnalyticsService,
    private tableItemService: TableItemService,
    public notifyService: NotifyService,
    public authService: AuthService,
    public _message: NzMessageService,
    public menuService: MenuService,
    public injector: Injector,
    private customDataService: CustomDatasService) {
    super(localSt, authService, menuService, notifyService, _message, dataAnalyticsService);
    if (this.menuService.currentChannelId === 1) {
      this.viewItemService = this.injector.get(ViewItemServiceSem);
    } else {
      this.viewItemService = this.injector.get(ViewItemServiceFeed);
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 240;
  }
  ngOnInit() {
    this.viewTableData['summary_type'] = this.summaryTypeObj[this.source_summary_type];
    this.viewTableData['sub_summary_type'] = this.summaryTypeObj[this.source_summary_type];
    this.source_summary = this.summaryTypeObj[this.source_summary_type];
    this.viewTableData['report_type'] = this.reportTypeObj[this.source_summary_type];

    if (this.authService.getCurrentUser().company_id === 4135) {
      this.showLeftJoin = false;
    }

    this.getBizList();

    this.viewTableData['locked_items'] = deepCopy(this.tableItemService.getLockedItemsBySummaryType(this.viewTableData['summary_type'], this.viewTableData.report_type));
    this.dataAnalyticsService.setSummaryTypeLockedItems(this.viewTableData['locked_items']);
    this.viewTableData['selected_items'] = deepCopy(this.tableItemService.getDefaultItemsBySummaryType(this.viewTableData['summary_type']));
    this.allFilterOption = deepCopy(this.tableItemService.getItemFilterType(this.viewTableData['summary_type']));

    // --- 获取默认
    const localMarkInfo = this.getLocalBookMark('', this.viewTableData['summary_type'], this.menuService.currentChannelId, this.menuService.currentPublisherId);
    const pubTableItems = this.tableItemService.getTableItemsObj(this.viewTableData.report_type, this.viewTableData.summary_type);

    if (localMarkInfo === null) {
      if (this.viewTableData['summary_type'] === 'keyword' || this.viewTableData['summary_type'] === 'creative' || this.viewTableData['summary_type'] === "biz_unit_account") {
        this.viewTableData['main_range'] = 'join';
      }
      this.generateHoursShow();
      this.refreshFields(this.viewTableData['selected_items']);
      this.generateTimeShow();
      this.refreshSummaryData();
      this.refreshData();
      this.refreshCount();
    } else {
      if (localMarkInfo.hasOwnProperty('pageSize')) {
        this.pageInfo.pageSize = localMarkInfo['pageSize'];
      }

      const lockObj = {};
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
        if (pubTableItems.hasOwnProperty(item['key'])) {
          item['name'] = pubTableItems[item['key']];
          newSelectedItems.push(item);
        }
      });
      localMarkInfo['sheets_setting']['table_setting']['selected_items'] = newSelectedItems;

      if (localMarkInfo['sheets_setting']['table_setting']['summary_type'] === "biz_unit_account" && !this.showLeftJoin) {
        localMarkInfo['sheets_setting']['table_setting']['main_range'] = 'join';
      }

      this.changeSelectedBookMark(localMarkInfo['sheets_setting']);
    }

  }

  getBizList() {
    this.bizUnitData = this.customDataService.getBizUnitData();
  }


  // -- 数据相关 -- start

  reloadData() {
    this.refreshSummaryData();
    this.refreshData();
    this.setLocalBookMark('', this.viewTableData['summary_type'], {
      summary_type: this.viewTableData['summary_type'],
      sheets_setting: {
        table_setting: this.viewTableData,
      },
      pageSize: this.pageInfo.pageSize
    }, this.menuService.currentChannelId, this.menuService.currentPublisherId);
    this.refreshCount();
  }

  refreshData() {
    this.allFilterOption = { ...this.allFilterOption };
    this.viewTableData.single_condition = [];
    this.addImpressionCondition(this.viewTableData['main_range'], this.viewTableData.single_condition);
    Object.values(this.allFilterOption).forEach(item => {
      const findExistsColumn = this.viewTableData['selected_items'].find((col) => col.key === item['filterKey']['key']);
      if (isUndefined(findExistsColumn)) {
      }
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    this.loadingIndicator = true;
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));
    const postData = { sheets_setting: { table_setting: tmpViewTableData } };
    this.sub.add(
      this.dataAnalyticsService.getReportViewData(postData, {
        count: this.pageInfo.pageSize,
        page: this.pageInfo.currentPage
      }).subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.loadingIndicator = false;
            this.rows = results['data']['detail'];
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
        }
      ));


  }
  refreshSummaryData() {
    this.allFilterOption = { ...this.allFilterOption };
    this.viewTableData.single_condition = [];
    this.addImpressionCondition(this.viewTableData['main_range'], this.viewTableData.single_condition);
    Object.values(this.allFilterOption).forEach(item => {
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));
    tmpViewTableData['all_summary'] = true;
    const postData = { sheets_setting: { table_setting: tmpViewTableData } };
    this.sub.add(
      this.dataAnalyticsService.getReportViewData(postData, {
        count: this.pageInfo.pageSize,
        page: this.pageInfo.currentPage
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

        }
      ));
  }
  refreshCount() {
    this.viewTableData.single_condition = [];
    this.addImpressionCondition(this.viewTableData['main_range'], this.viewTableData.single_condition);
    this.allFilterOption = { ...this.allFilterOption };
    Object.values(this.allFilterOption).forEach(item => {
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    const postData = { sheets_setting: { table_setting: this.viewTableData } };
    this.pageInfo.loadingStatus = 'pending';
    this.sub.add(this.dataAnalyticsService.getReportViewData(postData, { is_count: 1 }).subscribe(
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
      }
    ));
  }
  refreshFields(data: any[]) {
    const checkFiled: any = [{ width: '64', headerTemplate: this.chkHeader, cellTemplate: this.chkCell, name: 'checkBOx', frozenLeft: true }];
    const timeFiled: any = [{ width: '160', name: '日期', key: 'date_str', frozenLeft: true, sortable: true }];

    const tmpFiled: any = [];
    let hasCreative = false;
    hasCreative = explainTableField(data, tmpFiled, this);
    tmpFiled.forEach(item => {
      const itemWidth = item.name.length * 12 + 48 < item.width ? item.width : item.name.length * 12 + 48;//根据name计算width
      item.width = itemWidth;
    });
    this.rowHeight = this.defaultRowHeight;
    const lockedColumn = [];
    const endLockedColumn = [];
    this.viewTableData['locked_items'].forEach(item => {
      const result = {
        isHas: false,
        item: {}
      };
      this.bizUnitData.forEach(bizItem => {
        if (item['key'] === (bizItem['key'] + '_name')) {
          result.isHas = true;
          result.item = bizItem;
        }
      });
      const tplHeader = {};
      let popKey = item.key;

      // if (result.isHas || item['key'] === 'hours' || item['key'] === 'province_region' || item['key'] === 'city_region' || item['key'] === 'user_name' || item['key'] === 'landing_page') {
      if (result.isHas) {
        item['name'] = result.item['name'];
      }
      if (item.hasOwnProperty('showKey') && item.showKey !== '') {
        popKey = item.showKey;
      }

      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];

        if (popKey === 'hours') {
          tplHeader['data']['filterOption'] = this.hours;
        }
      }
      if (lockedColumn.length === 0) {
        tplHeader['summaryFunc'] = () => "合计";
      }

      lockedColumn.push({ 'prop': popKey, 'name': item.name, frozenLeft: true, width: item.width, ...tplHeader });
      // }
    });
    const timeFiledColumn = [];
    timeFiled.forEach(timeItem => {
      let popKey = timeItem.key;
      if (timeItem.hasOwnProperty('showKey') && timeItem.showKey !== '') {
        popKey = timeItem.showKey;
      }
      const tplHeader = {};
      if (timeItem.hasOwnProperty('sortable')) {
        tplHeader['sortable'] = timeItem.sortable;
      }
      timeFiledColumn.push({ 'prop': popKey, 'name': timeItem.name, resizeable: true, width: timeItem.width, ...tplHeader, frozenLeft: timeItem.frozenLeft, sortable: timeItem.sortable });
    });

    if (this.viewTableData.time_grain === 'day') {
      this.columns = [...timeFiledColumn, ...lockedColumn, ...tmpFiled];
    } else {
      this.columns = [...lockedColumn, ...tmpFiled];
    }

    const findOrderKey = this.columns.find((item) => {
      return item.prop === this.viewTableData['sort_item'].key;
    });
    if (isUndefined(findOrderKey)) {
      this.viewTableData['sort_item'] = { 'key': 'pub_cost', 'dir': 'desc' };
      this.defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];
    } else {
      // this.defaultSortItems
    }
  }
  mainRangeChange(event) {
    setTimeout(() => {
      this.reloadFirstPage();
    });
  }
  timeRangeChange(event) {
    this.time_grain = event;
    setTimeout(() => {
      this.refreshFields(this.viewTableData['selected_items']);
      this.reloadFirstPage();
    });
    if (this.source_summary_type === 'landing_page_account') {
      if (this.viewTableData.time_grain === 'summary') {
        this.time_grain = 'summary';
      } else if (this.viewTableData.time_grain === 'day') {
        this.time_grain = 'day';
      }
    }
  }
  changeSelectedBookMark(bookMark) {

    this.viewTableData = Object.assign(this.viewTableData, bookMark['table_setting']);

    //清理单选
    Object.values(this.allFilterOption).forEach(filter => {
      if (Object.keys(filter['filterResult']).length > 0) {
        if (bookMark['table_setting']['single_condition'].length === 0) {
          filter['filterResult'] = [];
          return false;
        }
        bookMark['table_setting']['single_condition'].forEach(item => {
          if (filter['filterKey']['key'] === item['key']) {
            return false;
          }
          filter['filterResult'] = [];
        });
      }

    });


    if (this.viewTableData['single_condition'] && this.viewTableData['single_condition'].length > 0) {
      this.viewTableData['single_condition'].forEach(item => {
        if (item.hasOwnProperty('relishKey') && this.allFilterOption.hasOwnProperty(item['relishKey'])) {
          this.allFilterOption[item['relishKey']]['filterResult'] = { ...item };
        } else if (this.allFilterOption.hasOwnProperty(item['key'])) {
          this.allFilterOption[item['key']]['filterResult'] = { ...item };
        } else {
          this.allFilterOption[item['key']] = {
            filterType: 'numberFilter',
            filterOption: [],
            filterKey: { key: item['key'], data_type: item['data_type'], name: item['name'], 'type': 'numberFilter' },
            filterResult: { ...item }
          };
        }
      });
    }
    this.generateHoursShow();
    this.refreshFields(this.viewTableData['selected_items']);
    this.generateTimeShow();
    this.refreshSummaryData();
    this.refreshData();

    this.refreshCount();
  }


  changeField() {
    let contentComponent: any;
    if (this.menuService.currentChannelId === 1) {
      contentComponent = TableFieldComponent;
    } else {
      contentComponent = TableFieldFeedComponent;
    }
    const add_modal = this.modalService.create({
      nzTitle: '编辑列',
      nzWidth: 800,
      nzContent: contentComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        reportAnalytics: true,
        reportType: this.viewTableData['report_type'],
        summaryType: this.viewTableData['summary_type'],
        selectedItems: this.viewTableData['selected_items'],
        isCompare: this.viewTableData['is_compare'],
        lockedItems: this.viewTableData['locked_items']
      }
    });

    add_modal.afterClose.subscribe(result => {
      if (result.dataType && result.dataType === 'table') {
        this.viewTableData['selected_items'] = result.data;
        this.viewTableData['is_compare'] = result.is_compare;
        this.viewTableData['locked_items'] = result.lockData;
        this.getTableItemsByIsCompare(this.viewTableData['is_compare']);
        this.generateTimeShow();
        this.generateHoursShow();
        this.refreshFields(result.data);

        this.reloadData();
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 0);


      }
    });

  }
  changeDate() {
    this.generateTimeShow();
    this.refreshFields(this.viewTableData['selected_items']);
    this.reloadFirstPage();
  }


  // 小时报时间
  generateHoursShow() {
    const hours = [];
    const originHours = this.viewTableData['hours_split'];
    if (originHours.length) {
      originHours.forEach(item => {
        let startHour = item['startHour'] + ":00:00";
        if (item['startHour'] == 24) {
          startHour = "0:00:00";
        }

        const ensHour = item['endHour'] + ':00:00';
        hours.push({ key: startHour + " - " + ensHour, name: startHour + " - " + ensHour });
      });
    } else {
      for (let i = 0; i <= 23; i++) {
        hours.push({ key: i, name: i });
      }
    }
    this.hours = hours;
  }
  // 打开生成报表
  openReportTpl() {
    const menuDetail = this.dataAnalyticsService.menuDetail[this.source_summary_type];
    if (menuDetail) {
      this.viewReportSetting.report_name = '数据报告-' + menuDetail.parentName + '-' + menuDetail.name;
    }
  }
  // -- report create

  handCreateReport() {
    if (this.reportPosting) {
      return false;
    }
    this.reportPosting = true;
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));
    tmpViewTableData.time_grain = this.time_grain;

    this.addImpressionCondition(tmpViewTableData['main_range'], tmpViewTableData.condition);

    tmpViewTableData.condition.push(...tmpViewTableData.single_condition);
    tmpViewTableData.single_condition = [];
    const postBody = Object.assign({}, this.viewReportSetting, {
      sheets_setting: [{
        sheet_name: 'sheet_1',
        table_setting: tmpViewTableData,
        charts_setting: [],
        sheet_module: {
          'table': false,
          'line': true,
          'bar': true,
          'lineStack': true,
          'pie': true,
        }
      }],
      email_list: this.viewReportSetting.email_list.split('\n'),
      report_status: 2
    });
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    this.dataAnalyticsService.createReport(postBody).subscribe((data: any) => {
      if (data.status_code === 200) {
        this.showCreateReport = false;
        if (isObject(data['data']) && data['data'].hasOwnProperty('job_id')) {
          const notifyData = [];
          notifyData.push({ report_id: data['data']['report_id'], job_id: data['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, report_name: this.viewReportSetting.report_name });
          this.notifyService.notifyData.next({ type: 'report', data: notifyData });
        }
        this.message.success('保存报表成功，您可到报表页去查看并下载');
      } else {
        this.message.error('保存报表失败,请重试');
      }
    },
      (err: any) => {
        this.message.error('保存报表失败,请重试');

      },
      () => {
        this.reportPosting = false;
      });
  }


  // -- report end

  //根据是否对比判断筛选条件中是否溢出对比筛选
  getTableItemsByIsCompare(is_compare) {
    if (!is_compare) {
      const currentCondition = [];
      JSON.parse(JSON.stringify(this.viewTableData['condition'])).forEach(item => {
        if (item['name'][item['name'].length - 1] !== '#' && item['name'][item['name'].length - 1] !== '△' && item['name'][item['name'].length - 1] !== '%') {
          currentCondition.push(item);
        }
      });
      this.viewTableData['condition'] = currentCondition;
      Object.values(this.allFilterOption).forEach(filter => {
        if (Object.keys(filter['filterResult']).length > 0) {
          if (filter['filterKey']['name'][filter['filterKey']['name'].length - 1] === '%' || filter['filterKey']['name'][filter['filterKey']['name'].length - 1] === '#' || filter['filterKey']['name'][filter['filterKey']['name'].length - 1] === '△') {
            filter['filterResult'] = [];
          }
        }
      });
    }

  }

  changePage(page) {
    this.pageInfo.currentPage = page.page;
    this.refreshData();

  }
  changePageSize(pageSize) {
    this.pageInfo.currentPage = 1;
    this.reloadData();
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
    this.viewTableData['sort_item'] = { 'key': orderKey, 'dir': sortInfo.dir };

    this.refreshData();
  }
  reloadFirstPage() {
    this.pageInfo.currentPage = 1;
    this.reloadData();
  }

  // 添加有无展现的条件
  addImpressionCondition(main_range, condition) {
    if (main_range !== 'leftJoin') {
      let op = ">";
      if (main_range === 'join') {
        op = ">";
      } else if (main_range === 'no_impression') {
        op = "=";
      }
      condition.push({
        "key": "pub_impression",
        "data_type": "pub_metric_data",
        "name": "展现",
        "type": "numberFilter",
        "op": op,
        "value": 0
      });
    }
  }
}
