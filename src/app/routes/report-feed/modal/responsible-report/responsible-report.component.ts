import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TableItemFeedService } from "../../../../module/table-setting/service/table-item-feed.service";
import { Subscription } from "rxjs";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { ReportService } from "../../service/report.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { AuthService } from "../../../../core/service/auth.service";
import { isObject, isUndefined } from "@jzl/jzl-util";
import { TableQueryFeedComponent } from "../../../../module/table-setting/components/table-query/table-query-feed.component";
import { TableFieldFeedComponent } from "../../../../module/table-setting/components/table-field/table-field-feed.component";
import { formatDate, splitDate } from "@jzl/jzl-util";
import { LocalStorageService } from "ngx-webstorage";
import { TableTimeComponent } from '../../../../module/table-time/components/table-time/table-time.component';
import { MenuService } from '../../../../core/service/menu.service';

@Component({
  selector: 'app-responsible-report',
  templateUrl: './responsible-report.component.html',
  styleUrls: ['./responsible-report.component.scss'],
  providers: [TableItemFeedService]
})
export class ResponsibleReportComponent implements OnInit {

  @Input() tableHeight: any;
  public channel_id = 2;
  private sub = new Subscription();
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
  public viewTableData = {
    'report_type': 'responsible_account',
    'summary_type': 'responsible_account',
    'selected_items': [],
    'selected_items_chart': [],
    'locked_items': [],
    'condition': [],
    'single_condition': [],
    'sort_item': { 'key': 'pub_cost', 'dir': 'desc' },
    'data_range': [],
    'all_summary': false,
    'is_compare': false,
    'summary_date': 'day:1:6',
    'summary_date_compare': 'day:8:6',
    'time_grain': 'summary',
    'main_range': 'leftJoin',
    'hidden_condition': false
  };

  public viewReportSetting = {
    'report_name': '定制报表',
    'report_data_type': 2,
    'channel_id': this.channel_id,
    'report_format': 'excel',
    'report_freq': 'now',
    'email_list': "",
    'sheets_setting': [],
    'time_grain': 'summary',
  };
  public time_grain = 'summary';
  public reportPosting = false;
  public showCreateReport = false;


  public rowHeight = 40;
  private defaultRowHeight = 40;
  public orderInfo: any = {};
  public rows = [];
  public selected = [];
  public selectedType = 'current';
  public columns = [];
  public timeDesc = '';
  public loadingIndicator = false;
  public loadingCountIndicator = true;

  public reorderable = false;
  public allFilterOption: any;
  public defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];
  public summaryData = {};
  public dataMessages = {
    emptyMessage: `
    <div class="empty-content">
      <span>无符合要求的数据</span>
    </div>
  `
  };

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

  public publisher_id;


  constructor(private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private localSt: LocalStorageService,
    private reportService: ReportService,
    private tableItemService: TableItemFeedService,
    private notifyService: NotifyService,
    private menuService: MenuService,
    private authService: AuthService) {
    this.channel_id = this.reportService.channel_id;
    this.publisher_id = this.menuService.currentPublisherId;
  }

  ngOnInit() {
    this.viewReportSetting.report_name = '定制报表-' + '负责人报告报表';

    this.viewTableData['locked_items'] = this.tableItemService.getLockedItemsBySummaryType(this.viewTableData['summary_type'], this.viewTableData.report_type);
    this.viewTableData['selected_items'] = this.tableItemService.getDefaultItemsBySummaryType(this.viewTableData['summary_type']);
    this.allFilterOption = JSON.parse(JSON.stringify(this.tableItemService.getItemFilterType(this.viewTableData['summary_type'])));
    // --- 获取默认
    const localMarkInfo = this.getLocalBookMark(this.viewTableData['summary_type']);



    if (localMarkInfo === null) {
      if (this.viewTableData['summary_type'] === 'keyword' || this.viewTableData['summary_type'] === 'creative') {
        this.viewTableData['main_range'] = 'join';
      }

      this.refreshFields(this.viewTableData['selected_items']);
      this.generateTimeShow();
      this.refreshSummaryData();
      this.refreshData();
      this.refreshCount();

    } else {
      if (localMarkInfo.hasOwnProperty('pageSize')) {
        this.pageInfo.pageSize = localMarkInfo['pageSize'];
      }

      this.changeSelectedBookMark(localMarkInfo['sheets_setting']);
    }

  }

  refreshTableSize(event = 'resize') {
    // window.dispatchEvent(new Event(event));
  }

  // -- 数据相关 -- start

  reloadData() {
    this.refreshSummaryData();
    this.refreshData();
    this.setLocalBookMark(this.viewTableData['summary_type'], {
      summary_type: this.viewTableData['summary_type'],
      sheets_setting: {
        table_setting: this.viewTableData,
      },
      pageSize: this.pageInfo.pageSize
    });
    this.refreshCount();
  }

  refreshData() {

    this.allFilterOption = { ...this.allFilterOption };
    this.viewTableData.single_condition = [];
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
      this.reportService.getReportViewData(postData, {
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
    Object.values(this.allFilterOption).forEach(item => {
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));
    tmpViewTableData['all_summary'] = true;
    const postData = { sheets_setting: { table_setting: tmpViewTableData } };
    this.sub.add(
      this.reportService.getReportViewData(postData, {
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
    this.allFilterOption = { ...this.allFilterOption };
    Object.values(this.allFilterOption).forEach(item => {
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    const postData = { sheets_setting: { table_setting: this.viewTableData } };
    this.pageInfo.loadingStatus = 'pending';
    this.sub.add(this.reportService.getReportViewData(postData, { is_count: 1 }).subscribe(
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
    data.forEach(item => {
      let popKey = item.key;
      if (item.hasOwnProperty('showKey') && item.showKey !== '') {
        popKey = item.showKey;
      }
      const tplHeader = {};

      if (item.hasOwnProperty('sortable')) {
        tplHeader['sortable'] = item.sortable;
      }

      if (item.type && item.type === 'number') {
        tplHeader['cellClass'] = 'num_right';
        tplHeader['headerClass'] = 'header_right';
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


        tmpFiled.push({ 'prop': popKey, 'name': item.name, resizeable: true, width: item.width, ...tplHeader });
      }
      if (this.viewTableData.time_grain !== 'day') {
        if (item.selected && item.selected['compare']) {
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
                filterKey: { key: popKey + '_cmp', data_type: item.data_type, name: item.name + '#', 'type': 'numberFilter' },
                filterResult: {}
              };
              tplHeader['data'] = this.allFilterOption[popKey + '_cmp'];
            }
          }

          tmpFiled.push({ 'prop': popKey + '_cmp', 'draggable': false, 'name': item.name + '#', resizeable: true, width: item.width, ...tplHeader });
        }
        if (item.selected && item.selected['compare_abs']) {
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
                filterKey: { key: popKey + '_abs', data_type: item.data_type, name: item.name + '△', 'type': 'numberFilter' },
                filterResult: {}
              };
              tplHeader['data'] = this.allFilterOption[popKey + '_abs'];
            }
          }

          tmpFiled.push({ 'prop': popKey + '_abs', 'draggable': false, 'name': item.name + '△', resizeable: true, width: item.width, ...tplHeader });
        }
        if (item.selected && item.selected['compare_rate']) {
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
                filterKey: { key: popKey + '_rat', data_type: item.data_type, name: item.name + '%', 'type': 'numberFilter' },
                filterResult: {}
              };
              tplHeader['data'] = this.allFilterOption[popKey + '_rat'];
            }
          }
          tmpFiled.push({ 'prop': popKey + '_rat', 'draggable': false, 'name': item.name + '%', resizeable: true, width: item.width, cellTemplate: this.rateCell, ...tplHeader });
        }
      }

    });

    this.rowHeight = this.defaultRowHeight;
    const lockedColumn = [];
    const endLockedColumn = [];
    this.viewTableData['locked_items'].forEach(item => {
      let popKey = item.key;
      if (item.hasOwnProperty('showKey') && item.showKey !== '') {
        popKey = item.showKey;
      }
      const tplHeader = {};

      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];
      }
      if (lockedColumn.length === 0) {
        tplHeader['summaryFunc'] = () => "合计";
      }

      lockedColumn.push({ 'prop': popKey, 'name': item.name, frozenLeft: true, width: item.width, ...tplHeader });
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
    this.time_grain = this.viewTableData.time_grain;
    setTimeout(() => {
      this.refreshFields(this.viewTableData['selected_items']);
      this.reloadFirstPage();
    });
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
    this.refreshFields(this.viewTableData['selected_items']);
    this.generateTimeShow();
    this.refreshSummaryData();
    this.refreshData();

    this.refreshCount();




  }



  // -- 保存或获取本地缓存的信息
  getLocalBookMark(summaryType) {
    const currentUser = this.authService.getCurrentUser();
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    const cacheKey = 'view_mark_feed_' + this.publisher_id + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
    return this.localSt.retrieve(cacheKey);
  }

  setLocalBookMark(summaryType, data: { summary_type: string, sheets_setting: { table_setting: any }, pageSize: number }) {
    const currentUser = this.authService.getCurrentUser();
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    const cacheKey = 'view_mark_feed_' + this.publisher_id + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
    this.localSt.store(cacheKey, data);
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
        summaryType: this.viewTableData['summary_type'],
        initCondition: this.viewTableData['condition'],
        dataRange: this.viewTableData['data_range'],
        tableData: this.viewTableData
      }
    });
    add_modal.afterClose.subscribe(result => {
      if (result.dataType && result.dataType === 'query') {
        this.viewTableData['condition'] = result.condition;
        this.viewTableData['data_range'] = result.dataRange;
        this.reloadFirstPage();
      }
    });


  }


  changeField() {
    const add_modal = this.modalService.create({
      nzTitle: '编辑列',
      nzWidth: 900,
      nzContent: TableFieldFeedComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
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
        this.refreshFields(result.data);

        this.reloadData();
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 0);


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
          time_grain: this.viewTableData['time_grain']
        },
        isCompare: this.viewTableData['is_compare'],
        summary_type: this.viewTableData['summary_type']
      }
    });
    add_modal.afterClose.subscribe(result => {
      if (result.dataType && result.dataType === 'time') {
        this.viewTableData = Object.assign(this.viewTableData, result['data']);
        this.generateTimeShow();
        this.reloadFirstPage();
      }
    });

  }

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
    tmpViewTableData.time_grain = this.time_grain;

    if (tmpViewTableData['main_range'] === 'join') {
      tmpViewTableData.condition.push({
        "key": "pub_impression",
        "data_type": "pub_metric_data",
        "name": "展现",
        "type": "number",
        "op": ">",
        "value": 0
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
    this.reportService.createReport(postBody).subscribe((data: any) => {
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
  generateTimeShow() {
    let resultTimeShow = '';
    const originTime = splitDate(this.viewTableData['summary_date']);
    const resultTimeStart = formatDate(originTime[0]);
    const resultTimeEnd = formatDate(originTime[1]);

    if (resultTimeStart === resultTimeEnd) {
      resultTimeShow += resultTimeStart;
    } else {
      resultTimeShow += resultTimeStart + '至' + resultTimeEnd;
    }
    if (this.viewTableData['is_compare']) {
      const compareTime = splitDate(this.viewTableData['summary_date_compare']);
      const compareTimeStart = formatDate(compareTime[0]);
      const compareTimeEnd = formatDate(compareTime[1]);
      if (compareTimeStart === compareTimeEnd) {
        resultTimeShow += '对比' + compareTimeStart;
      } else {
        resultTimeShow += '对比' + compareTimeStart + '至' + compareTimeEnd;
      }
    }
    this.timeDesc = resultTimeShow;
  }

  changePage(page) {
    this.pageInfo.currentPage = page.page;
    this.refreshData();
    this.refreshCount();

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
  onSelect({ selected }) {

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  selectedChange(type, allSelected, fn) {
    this.selectedType = type;
    if (!allSelected) {
      fn(true);
    }
  }
  singleSelectedChange(fn, isSelected) {
    this.selectedType = 'current';
    fn(isSelected);
  }
  reloadFirstPage() {
    this.pageInfo.currentPage = 1;
    this.reloadData();
  }
}
