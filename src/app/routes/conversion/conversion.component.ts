import { Component, HostListener, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { ViewBookmarkComponent } from "../../module/bookmark/components/view-bookmark.component";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { DataViewService } from "../data-view/service/data-view.service";
import { ViewItemService } from "../data-view/service/view-item.service";
import { ItemSelectService } from "../../module/item-select/service/item-select.service";
import { ReportService } from "../report/service/report.service";
import { AuthService } from "../../core/service/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NotifyService } from "../../module/notify/notify.service";
import { LocalStorageService } from "ngx-webstorage";
import { isNull, isNumber, isObject, isUndefined } from "@jzl/jzl-util";
import { copy2Clipboard, formatDate, generateTimeResult, generateTimeTip, splitDate } from "@jzl/jzl-util";
import { Subject, Subscription } from "rxjs";
import { TableFieldComponent } from "../../module/table-setting/components/table-field/table-field.component";
import { TableQueryComponent } from "../../module/table-setting/components/table-query/table-query.component";
import { TableTimeComponent } from '../../module/table-time/components/table-time/table-time.component';
import { AppBookmarkModalComponent } from "../../module/bookmark/modal/app-bookmark-modal.component";
import { AppBookmarkSaveModalComponent } from "../../module/bookmark/modal/app-bookmark-save-modal/app-bookmark-save-modal.component";
import { CustomDatasService } from '../../shared/service/custom-datas.service';
import { DataViewTableComponent } from '../../shared/baseClass/DataViewTableComponent';
import { MenuService } from '../../core/service/menu.service';

@Component({
  selector: 'app-conversion',
  templateUrl: './conversion.component.html',
  styleUrls: ['./conversion.component.scss']
})
export class ConversionComponent extends DataViewTableComponent implements OnInit {

  private sub = new Subscription();

  public defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];

  public time_grain = 'summary';

  public viewReportSetting = {
    'report_name': '转化明细',
    'report_data_type': 2,
    'channel_id': 1,
    'report_format': 'excel',
    'report_freq': 'now',
    'email_list': "",
    'sheets_setting': [],
    'time_grain': 'day',
    'source': 'conversion'
  };

  public showCreateReport = false;
  public reportPosting = false;


  public tableHeight = document.body.clientHeight - 60 - 44 - 30;
  public rowHeight = 40;
  private defaultRowHeight = 40;


  public ranking_setting: any; //记录实时排名数据


  conversion_type: any;

  @ViewChild('chkHeader', { static: true }) chkHeader: TemplateRef<any>;
  @ViewChild('filterHeader', { static: true }) filterHeader: TemplateRef<any>;
  @ViewChild('summaryCell') summaryCell: TemplateRef<any>;
  @ViewChild('chkCell') chkCell: TemplateRef<any>;
  @ViewChild('conversionTypeCell', { static: true }) conversionTypeCell: TemplateRef<any>;
  @ViewChild('channelNameCell', { static: true }) channelNameCell: TemplateRef<any>;



  public loadingIndicator = true;
  public loadingCountIndicator = true;
  public reorderable = false;
  public allFilterOption: any;

  @ViewChild('viewTable', { static: true }) viewTable;
  @ViewChild('viewMark') viewMark: ViewBookmarkComponent;
  private _bookMarkDefaultTop = 116;
  private _chartDefaultHeight = 300;
  public bookMarkTop = 116;
  public conversionObject = {};
  public conversionFilterList = [];
  public channelObject: any;


  @ViewChild('nzSelectAdver') nzSelectAdver: NzSelectComponent;


  constructor(private dataViewService: DataViewService,
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
    public menuService: MenuService,
    private renderer: Renderer2,
    private customDatasService: CustomDatasService
  ) {

    super(localSt, authService, menuService, notifyService, _message, reportService);

    this.userSelectedOper = this.authService.getCurrentUserOperdInfo();
    this.channelObject = this.dataViewService.getAccountChannelObject();



    this.viewTableData['summary_type'] = "conversion_report_sem";
    this.viewTableData['sub_summary_type'] = "conversion_report_sem";
    this.source_summary = "conversion_report_sem";
    this.viewTableData['report_type'] = "conversion_report";

  }




  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 44 - 30;
  }


  ngOnInit() {
    this.viewTableData['sort_item'] = { 'key': 'pub_cost', 'dir': 'desc' };
    this.viewTableData['selected_items'] = this.viewItemService.getDefaultItemsBySummaryType(this.viewTableData['summary_type']);
    this.viewTableData['locked_items'] = this.viewItemService.getLockedItemsBySummaryType(this.viewTableData['summary_type']);
    this.allFilterOption = JSON.parse(JSON.stringify(this.viewItemService.getItemFilterType(this.viewTableData['summary_type'])));
    // --- 获取默认
    const localMarkInfo = this.getLocalBookMark('', this.viewTableData['summary_type']);


    if (localMarkInfo === null) {
      this.refreshFields(this.viewTableData['selected_items']);
      this.generateTimeShow();
    } else {
      this.refreshFields(this.viewTableData['selected_items']);


      if (localMarkInfo.hasOwnProperty('pageSize')) {
        this.pageInfo.pageSize = localMarkInfo['pageSize'];
      }

      this.viewTableData = Object.assign(this.viewTableData, localMarkInfo['sheets_setting']['table_setting']);
      this.generateTimeShow();

      this.changeSelectedBookMark(localMarkInfo['sheets_setting']);

    }
    this.reloadData();



  }

  refreshData(fromMark = false) {
    if (!fromMark && !isUndefined(this.viewMark)) {
      this.viewMark.resetActiveMark();
    }
    this.allFilterOption = { ...this.allFilterOption };

    this.viewTableData.single_condition = [];
    Object.values(this.allFilterOption).forEach(item => {
      // const findExistsColumn = this.viewTableData['selected_items'].find((col) => col.key === item['filterKey']['key']);
      // if (isUndefined(findExistsColumn)) {
      // }
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });

    const has_conver_condition = this.viewTableData.single_condition.find(conver => conver['key'] === 'conver_column');

    this.loadingIndicator = true;
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));
    // tmpViewTableData['selected_items'].push({data_type: 'pub_attr_data', key: 'publisher_id', showKey: 'publisher', selected: {current: true}});
    const postData = { sheets_setting: { table_setting: tmpViewTableData } };
    this.dataViewService.getViewList(postData, {
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
    );
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
      }
    );
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
        this.reloadData();
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
        summary_type: this.viewTableData['summary_type'],
        defined_is_disable: false,
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

  mainRangeChange() {
    setTimeout(() => {
      this.reloadData(true);
    });
  }
  reloadData(reloadChart = true) {
    /*    this.allFilterOption = {...this.allFilterOption};
        this.viewTableData.single_condition = [];
        Object.values(this.allFilterOption).forEach(item => {
          if (item['filterResult'].hasOwnProperty('key')) {
            this.viewTableData.single_condition.push(item['filterResult']);
          }
        });*/

    this.refreshData();
    this.setLocalBookMark('', this.viewTableData['summary_type'], {
      summary_type: this.viewTableData['summary_type'],
      sheets_setting: {
        table_setting: this.viewTableData,
      },
      pageSize: this.pageInfo.pageSize
    });
    this.refreshCount();


  }


  refreshFields(data: any[]) {

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
      if (popKey === 'conver_column') {
        tplHeader['cellTemplate'] = this.conversionTypeCell;
        this.dataViewService.getConversionLists().subscribe(result => {
          if (result['status_code'] && (result['status_code'] === 200 || result['status_code'] === 205)) {
            this.allFilterOption[popKey].filterOption = result.data;
            this.allFilterOption[popKey].filterType = 'multiList';
            this.allFilterOption = { ...this.allFilterOption };
            result.data.forEach(item => {
              this.conversionObject[item.key] = item;
            });
          }
        });
      }
      if (popKey === 'channel_id') {
        tplHeader['cellTemplate'] = this.channelNameCell;
      }
      // 描述字段添加筛选功能
      if (popKey.startsWith("desc_")) {
        this.allFilterOption[popKey] = {
          filterType: 'multiValue',
          filterOption: [],
          filterKey: { key: popKey, data_type: 'conversion_desc', name: item.name, 'type': 'multiValue' },
          filterResult: {},
          extraOption: {
            columnCount: false
          }
        };
      }
      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];
      }
      if (item.selected && item.selected['current']) {
        // {"prop": "pub_keyword_id", name: '关键词'},
        /*   if (item.type && item.type === 'number') {
             // tplHeader['summaryFunc'] = () => this.summaryData[popKey];
             tplHeader['summaryTemplate'] = this.summaryCell;

           }*/
        tmpFiled.push({ 'prop': popKey, 'name': item.name, resizeable: true, width: item.width, ...tplHeader });
      }
    });

    this.rowHeight = this.defaultRowHeight;
    const lockedColumn = [];
    if (this.viewTableData['locked_items']) {
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

        lockedColumn.push({ 'prop': popKey, 'name': item.name, frozenLeft: true, width: item.width, ...tplHeader });
      });
    }

    this.columns = [...lockedColumn, ...tmpFiled];


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

  getConditionData() {
    const oauth_local = JSON.parse(localStorage.getItem('data_range_data'));
    return oauth_local;
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
    this.viewTableData['sort_item'] = { 'key': orderKey, 'dir': sortInfo.dir };

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
        summaryType: this.viewTableData['summary_type'],
        sheetSetting: {
          table_setting: this.viewTableData,
        }

      }
    });
    new_modal.afterClose.subscribe(result => {
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
        summaryType: this.viewTableData['summary_type'],
        sheetSetting: {
          table_setting: this.viewTableData,
        },
        bookmarkItem: $event

      }
    });
    new_modal.afterClose.subscribe(result => {
      if (result === 'Ok') {
        this.viewMark.refreshList();
      }
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

    if (this.getConditionData()) {
      bookMark['table_setting']['single_condition'] = [];
      this.viewTableData['single_condition'] = [];
    }
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

    this.viewTableData.time_grain = this.time_grain;
    this.reportPosting = true;
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));

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


  getParentPublishers(data) {
    const publishers = {};
    const publisherArray = [];
    let number = 0; //记录有几种媒体
    data.forEach((item) => {
      if (!publishers.hasOwnProperty(item.publisher_id)) {
        publishers[item.publisher_id] = 1;
        publisherArray.push({
          'name': item['publisher'],
          'value': item['publisher_id'] * 1,
        });
        number++;
      }
    });
    return {
      'publisher_array': publisherArray,
      'publisherCount': number
    };
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



  //判断小数点后几位数
  getPointAfterCount(number) {
    return number.toString().split(".")[1].length;
  }

  reloadFirstPage() {
    this.pageInfo.currentPage = 1;
    this.reloadData();
  }

}
