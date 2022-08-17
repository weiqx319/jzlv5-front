import { Component, HostListener, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';

import { ReportService } from "../../../../report/service/report.service";
import { AuthService } from "../../../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LocalStorageService } from "ngx-webstorage";
import { ActivatedRoute, Router } from "@angular/router";
import { isNull, isNumber, isObject, isUndefined } from "@jzl/jzl-util";
import { TableFieldComponent } from '../../../../../module/table-setting/components/table-field/table-field.component';
import { TableQueryComponent } from "../../../../../module/table-setting/components/table-query/table-query.component";
import { formatDate, generateTimeResult, generateTimeTip, splitDate } from "@jzl/jzl-util";
import { TableTimeComponent } from "../../../../../module/table-time/components/table-time/table-time.component";
import { OptimizationItemService } from "../../../service/optimization-item.service";
import { itemPipeOjb } from "../../../../../module/table-setting";
import { AppBookmarkModalComponent } from "../../../../../module/bookmark/modal/app-bookmark-modal.component";
import { ViewBookmarkComponent } from "../../../../../module/bookmark/components/view-bookmark.component";
import { Subject } from "rxjs";
import { OptimizationService } from "../../../service/optimization.service";
import { OptimizationDetailEffectService } from "../../service/optimization-detail-effect.service";

@Component({
  selector: 'app-optimization-detail-effect-kwd-list',
  templateUrl: './optimization-detail-effect-kwd-list.component.html',
  styleUrls: ['./optimization-detail-effect-kwd-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OptimizationDetailEffectKwdListComponent implements OnInit {
  public optimizationId = '';
  public viewChartShow = false;
  public showChartType = 'day';
  public chartItems = [];
  public chartSelectedItem: any;

  public isJump = '';

  public chartOptions: any;
  public chartLoading = false;

  public apiData = [];
  public chartInitOpts = {
    // renderer: 'svg',
    // width: 300,
    height: 272
  };
  public defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];
  // public defaultSortItems = [sorts]="[{prop: 'name', dir: 'desc'}]">
  public viewTableData = {
    'report_type': 'basic_report',
    'summary_type': 'optimization_detail_effect_kwd',
    'selected_items': [],
    'selected_items_chart': [],
    'locked_items': [],
    'condition': [],
    'single_condition': [],
    'sort_item': { 'key': 'pub_cost', 'dir': 'desc' },
    'data_range': [],
    'is_compare': false,
    'summary_date': 'day:1:6',
    'summary_date_compare': 'day:8:6',
    'time_grain': 'summary',
    'main_range': 'leftJoin',
    'main_device': 'all'
  };

  public time_grain = 'summary';
  public viewReportSetting = {
    'report_name': '自定义报表',
    'report_data_type': 2,
    'channel_id': 1,
    'report_format': 'excel',
    'report_freq': 'now',
    'email_list': "",
    'sheets_setting': [],
    'time_grain': 'summary',
  };

  public showCreateReport = false;
  public reportPosting = false;

  public tableHeight = document.body.clientHeight - 60 - 65 - 30 - 60;
  private _bookMarkDefaultTop = 176;
  private _chartDefaultHeight = 300;
  public bookMarkTop = 176;
  public rowHeight = 40;
  public rows = [];
  public selected = [];
  public selectedType = 'current';
  public columns = [];
  public timeDesc = '';
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
  @ViewChild('creativeCell', { static: true }) creativeCell: TemplateRef<any>;
  @ViewChild('rateCellColor', { static: true }) rateCellColor: TemplateRef<any>;
  @ViewChild('cellColor', { static: true }) cellColor: TemplateRef<any>;
  @ViewChild('starTpl', { static: true }) starTpl: TemplateRef<any>;
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
      { key: 5000, name: '5000条/页' },
    ]
  };

  public loadingIndicator = true;
  public loadingCountIndicator = true;
  public reorderable = true;

  public allFilterOption: any;
  @ViewChild('viewTable', { static: true }) viewTable;
  @ViewChild('viewMark') viewMark: ViewBookmarkComponent;

  constructor(
    private optimizationItemService: OptimizationItemService,
    private reportService: ReportService,
    private authService: AuthService,
    private _message: NzMessageService,
    private modalService: NzModalService,
    private localSt: LocalStorageService,
    private effectDetailService: OptimizationDetailEffectService,
    private router: Router,
    private route: ActivatedRoute,
    private optimizationService: OptimizationService) {
    this.optimizationId = this.route.snapshot.parent.paramMap.get('id');
    this.allFilterOption = this.optimizationItemService.getItemFilterType(this.viewTableData['summary_type']);
    this.route.data.subscribe(data => {
      // this.viewTableData['summary_type'] = data['summaryType'];
      if (this.viewTableData['summary_type'] === 'creative') {
        this.rowHeight = 80;
      }
      this.chartItems = optimizationItemService.getChartItem();
      this.chartSelectedItem = this.chartItems[0].key;
      this.viewTableData['selected_items_chart'] = [this.chartItems[0]];
    });
  }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    if (this.viewChartShow) {
      this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 300 - 60;
    } else {
      this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 60;
    }


  }

  ngOnInit() {
    this.viewTableData['selected_items'] = this.optimizationItemService.getDefaultItemsBySummaryType(this.viewTableData['summary_type']);
    this.viewTableData['sort_item'] = { 'key': 'pub_cost', 'dir': 'desc' };
    this.viewTableData['locked_items'] = this.optimizationItemService.getLockedItemsBySummaryType(this.viewTableData['summary_type']);
    // --- 获取默认
    const localMarkInfo = this.getLocalBookMark(this.viewTableData['summary_type']);
    if (localMarkInfo === null) {
      this.refreshFields(this.viewTableData['selected_items']);
      this.generateTimeShow();
      this.refreshData();
      this.refreshCount();
    } else {
      if (localMarkInfo.hasOwnProperty('pageSize')) {
        this.pageInfo.pageSize = localMarkInfo['pageSize'];
      }

      this.changeSelectedBookMark(localMarkInfo['sheets_setting']);
    }
    // --

    //获取优化组信息
    this.optimizationService.getOptimizationInfo().subscribe(
      result => {
        if (result) {
          this.viewReportSetting.report_name = result['optimization_name'];
        }
      });

  }

  mainRangeChange(event?) {
    setTimeout(() => {
      this.pageInfo.currentPage = 1;
      this.reloadData(true);
    });
  }
  selectedChange(type, allSelected, fn) {
    this.selectedType = type;
    if (!allSelected) {
      fn(true);
    }
    if (this.pageInfo.allCount <= this.pageInfo.pageSize) {
    }
  }
  singleSelectedChange(fn, isSelected) {
    this.selectedType = 'current';
    fn(isSelected);
  }


  refreshTableSize(event = 'resize') {
    // window.dispatchEvent(new Event(event));
  }

  refreshData(fromMark = false) {
    if (!fromMark && !isUndefined(this.viewMark)) {
      this.viewMark.resetActiveMark();
    }
    this.allFilterOption = { ...this.allFilterOption };
    this.viewTableData.single_condition = [];
    Object.values(this.allFilterOption).forEach(item => {
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });

    this.loadingIndicator = true;
    const postData = { sheets_setting: { table_setting: { ...this.viewTableData, filter_optimization_ids: [this.optimizationId] } } };
    this.optimizationService.getViewList(postData, {
      count: this.pageInfo.pageSize,
      page: this.pageInfo.currentPage
    }).subscribe(
      (results: any) => {
        if (results.status_code && results.status_code === 200) {
          this.loadingIndicator = false;
          this.rows = results['data']['detail'];
          this.pageInfo.currentPageCount = results['data']['detail'].length;
          this.selected = [];
        }
      },
      (err: any) => {
        this.loadingIndicator = false;

      },
      () => {
        this.loadingIndicator = false;
      }
    );
  }

  refreshCount() {
    this.viewTableData.single_condition = [];
    Object.values(this.allFilterOption).forEach(item => {
      if (item['filterResult'].hasOwnProperty('key')) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    const postData = { sheets_setting: { table_setting: { ...this.viewTableData, filter_optimization_ids: [this.optimizationId] } } };
    this.optimizationService.getViewList(postData, { is_count: 1 }).subscribe(
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

  reloadData(reloadChart = true) {
    this.refreshData();
    this.refreshCount();
    this.setLocalBookMark(this.viewTableData['summary_type'], {
      summary_type: this.viewTableData['summary_type'],
      sheets_setting: {
        table_setting: this.viewTableData,
      },
      pageSize: this.pageInfo.pageSize
    });
    if (this.viewChartShow && reloadChart) {
      this.refreshChartData(this.showChartType);
    }


  }


  refreshFields(data: any[]) {
    const checkFiled: any = [{
      width: '64',
      headerTemplate: this.chkHeader,
      cellTemplate: this.chkCell,
      name: 'checkBOx',
      frozenLeft: true
    }];
    const tmpFiled: any = [];
    data.forEach(item => {
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
      if (item.hasOwnProperty('pipe')) {
        tplHeader['pipe'] = new itemPipeOjb[item.pipe]();
      }

      if (item.type && item.type === 'number') {
        tplHeader['cellClass'] = 'num_right';
        tplHeader['headerClass'] = 'header_right';
      }

      if (popKey === 'wap_quality' || popKey === 'pc_quality') {
        tplHeader['cellTemplate'] = this.starTpl;
      }
      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];
      }


      if (item.selected && item.selected['current']) {
        // {"prop": "pub_keyword_id", name: '关键词'},

        tmpFiled.push({ 'prop': popKey, 'name': item.name, resizeable: true, width: item.width, ...tplHeader });
      }
      if (item.selected && item.selected['compare']) {
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
        } else {
          tplHeader['cellTemplate'] = this.cellColor;
        }
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
    });
    const lockedColumn = [];
    this.viewTableData['locked_items'].forEach(item => {
      let popKey = item.key;
      if (item.hasOwnProperty('showKey') && item.showKey !== '') {
        popKey = item.showKey;
      }
      const tplHeader = {};
      if (popKey === 'pub_creative_title') {
        tplHeader['cellTemplate'] = this.creativeCell;
      }
      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];
      }

      lockedColumn.push({ 'prop': popKey, 'name': item.name, frozenLeft: true, width: item.width, ...tplHeader });
    });


    this.columns = [...checkFiled, ...lockedColumn, ...tmpFiled];

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


  generateTimeShow() {
    this.timeDesc = generateTimeTip(this.viewTableData['summary_date'], this.viewTableData['summary_date_compare'], this.viewTableData['is_compare']);
  }

  generateTime() {
    return generateTimeResult(this.viewTableData['summary_date'], this.viewTableData['summary_date_compare'], this.viewTableData['is_compare']);
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



  changeSelectedBookMark(bookMark) {
    this.viewTableData = Object.assign(this.viewTableData, bookMark['table_setting']);
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
    this.refreshData(true);
    this.refreshCount();

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

    this.viewTableData.time_grain = this.time_grain;
    this.reportPosting = true;

    this.viewTableData.condition.push(...this.viewTableData.single_condition);
    this.viewTableData.single_condition = [];
    const postBody = Object.assign({}, this.viewReportSetting, {
      sheets_setting: [{
        sheet_name: 'sheet_1',
        table_setting: { ...this.viewTableData, filter_optimization_ids: [this.optimizationId] },
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
    this.reportService.createReport(postBody).subscribe((data: any) => {
      if (data.status_code === 200) {
        this.showCreateReport = false;
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

  public showDataDateChart(selectedItem, is_compare, data, chartType = 'line') {
    const dataDateX = this.generateTime();
    const dataChart = {
      tooltip: {
        trigger: 'axis',
        textStyle: {
          fontSize: 10
        },
        formatter: function (params) {
          if (params.length > 1) {
            return selectedItem['name'] + '<br/>' + params[0]['data']['data_date'] + ':' + params[0].value + '<br/>' + params[1]['data']['data_date'] + ':' + params[1].value;
          } else {
            return selectedItem['name'] + '<br/>' + params[0]['data']['data_date'] + ':' + params[0].value;
          }

        }
      },
      'legend': {
        data: [],
        left: 'left'

      },
      grid: {
        left: '3%',
        right: '2%',
      },
      textStyle: {
        fontSize: 10
      },
      xAxis: [],
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 10,
          color: '#7f7f7f'
        },
        boundaryGap: [0, 0],
        splitLine: {
          show: false
        },
        nameTextStyle: { color: '#7f7f7f' },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e4e4e4"
          }
        }
      },
      color: ['#4cd3ea', '#ffd44b'],
      series: []
    };

    const chartDataDetail = data;
    const legendKeyData = {};

    const xAxisObject = {
      type: 'category',
      data: [],
      axisLabel: {
        fontSize: 10,
        color: '#7f7f7f'
      },
      nameTextStyle: { color: '#7f7f7f' },
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: "#e4e4e4"
        }
      },
      // name: val.name
    };

    if (is_compare) {
      legendKeyData[selectedItem.key] = { name: dataDateX['current'], type: chartType, data: [], barMaxWidth: 50 };
      legendKeyData[selectedItem.key + '_compare'] = {
        name: dataDateX['compare'],
        type: chartType,
        data: [],
        barMaxWidth: 50
      };
      dataChart.legend.data.push(dataDateX['current']);
      dataChart.legend.data.push(dataDateX['compare']);
    } else {
      legendKeyData[selectedItem.key] = { name: dataDateX['current'], type: chartType, data: [], barMaxWidth: 50 };
      dataChart.legend.data.push(dataDateX['current']);
    }
    let maxValue = 0;
    chartDataDetail.forEach((detail) => {
      xAxisObject['data'].push(detail['current']['data_date']);
      legendKeyData[selectedItem.key]['data'].push({
        value: Number(detail['current'][selectedItem.key]),
        'data_date': detail['current']['data_date']
      });
      maxValue = Math.max(maxValue, Number(detail['current'][selectedItem.key]));
      if (is_compare) {
        legendKeyData[selectedItem.key + '_compare']['data'].push({
          value: Number(detail['compare'][selectedItem.key]),
          'data_date': detail['compare']['data_date']
        });
        maxValue = Math.max(maxValue, Number(detail['compare'][selectedItem.key]));
      }
    });
    dataChart.xAxis = [xAxisObject];
    dataChart.series = Object.values(legendKeyData);
    if (maxValue > 1000) {
      dataChart.yAxis['name'] = selectedItem['name'] + '(千)';
    } else {
      dataChart.yAxis['name'] = selectedItem['name'];
    }
    dataChart.yAxis['axisLabel']['formatter'] = function (value) {
      if (value >= 1000) {
        return value / 1000;
      } else {
        if (selectedItem['is_rate'] && selectedItem['is_rate'] > 0) {
          return value + '%';
        } else {
          return value;
        }
      }
    };


    this.chartOptions = dataChart;
  }

  public showHourChart(selectedItem, is_compare, data, chartType = 'bar') {
    const dataDateX = this.generateTime();
    const dataChart = {
      tooltip: {
        trigger: 'axis',
        textStyle: {
          fontSize: 10
        },
        formatter: function (params) {
          if (params.length > 1) {
            return selectedItem['name'] + '<br/>' + params[0]['data']['hours'] + ':' + params[0].value + '<br/>' + params[1]['data']['hours'] + ':' + params[1].value;
          } else {
            return selectedItem['name'] + '<br/>' + params[0]['data']['hours'] + ':' + params[0].value;
          }

        }
      },
      'legend': {
        data: [],
        left: 'left'

      },
      grid: {
        left: '3%',
        right: '2%',
      },
      textStyle: {
        fontSize: 10
      },
      xAxis: [],
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 10,
          color: '#7f7f7f'
        },
        boundaryGap: [0, 0],
        splitLine: {
          show: false
        },
        nameTextStyle: { color: '#7f7f7f' },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e4e4e4"
          }
        }
      },
      color: ['#4cd3ea', '#ffd44b'],
      series: []
    };

    const chartDataDetail = data;
    const legendKeyData = {};

    const xAxisObject = {
      type: 'category',
      data: [],
      axisLabel: {
        fontSize: 10,
        color: '#7f7f7f'
      },
      nameTextStyle: { color: '#7f7f7f' },
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: "#e4e4e4"
        }
      },
      // name: val.name
    };

    if (is_compare) {
      legendKeyData[selectedItem.key] = { name: dataDateX['current'], type: chartType, data: [], barMaxWidth: 50 };
      legendKeyData[selectedItem.key + '_compare'] = {
        name: dataDateX['compare'],
        type: chartType,
        data: [],
        barMaxWidth: 50
      };
      dataChart.legend.data.push(dataDateX['current']);
      dataChart.legend.data.push(dataDateX['compare']);
    } else {
      legendKeyData[selectedItem.key] = { name: dataDateX['current'], type: chartType, data: [], barMaxWidth: 50 };
      dataChart.legend.data.push(dataDateX['current']);
    }
    let maxValue = 0;
    chartDataDetail.forEach((detail) => {
      xAxisObject['data'].push(detail['current']['hours']);
      legendKeyData[selectedItem.key]['data'].push({
        value: Number(detail['current'][selectedItem.key]),
        'hours': detail['current']['hours']
      });
      maxValue = Math.max(maxValue, Number(detail['current'][selectedItem.key]));
      if (is_compare) {
        legendKeyData[selectedItem.key + '_compare']['data'].push({
          value: Number(detail['compare'][selectedItem.key]),
          'hours': detail['compare']['hours']
        });
        maxValue = Math.max(maxValue, Number(detail['compare'][selectedItem.key]));
      }
    });
    dataChart.xAxis = [xAxisObject];
    dataChart.series = Object.values(legendKeyData);
    if (maxValue > 1000) {
      dataChart.yAxis['name'] = selectedItem['name'] + '(千)';
    } else {
      dataChart.yAxis['name'] = selectedItem['name'];
    }
    dataChart.yAxis['axisLabel']['formatter'] = function (value) {
      if (value >= 1000) {
        return value / 1000;
      } else {
        if (selectedItem['is_rate'] && selectedItem['is_rate'] > 0) {
          return value + '%';
        } else {
          return value;
        }
      }
    };


    this.chartOptions = dataChart;
  }

  refreshChartData(type = 'day', click = false) {
    // -- 获取表格数据
    if (this.showChartType === type && click) {
      return;
    }
    this.showChartType = type;
    const postTableSetting = JSON.parse(JSON.stringify(this.viewTableData));
    postTableSetting['time_grain'] = 'day';
    let chartType = 'line';
    if (type !== 'day') {
      chartType = 'bar';
    }

    if (type === 'hour') {
      postTableSetting['report_type'] = 'hours_report';
    }

    this.chartLoading = true;
    const postData = { sheets_setting: { table_setting: postTableSetting } };
    this.optimizationService.getViewChartData(postData, {}).subscribe(
      (result: any) => {
        if (result.status_code && result.status_code === 200) {
          // this.rows = results['data']['detail'];
          if (type === 'hour') {
            this.showHourChart(this.viewTableData.selected_items_chart[0], this.viewTableData.is_compare, result['data'], chartType);
          } else {
            this.showDataDateChart(this.viewTableData.selected_items_chart[0], this.viewTableData.is_compare, result['data'], chartType);
          }

          this.chartLoading = false;
          // this.pageInfo.currentPageCount = results['data']['detail'].length;
        }
      },
      (err: any) => {
        this.chartLoading = false;

      },
      () => {
        this.chartLoading = false;
      }
    );
  }


  toggleChart() {
    this.viewChartShow = !this.viewChartShow;

    // if (this.viewChartShow) {
    //   this.bookMarkTop = this._chartDefaultHeight + this._bookMarkDefaultTop;
    //   this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 300 - 60;
    // } else {
    //   this.bookMarkTop = this._bookMarkDefaultTop;
    //   this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 60;
    // }
    // setTimeout(() => {
    //   window.dispatchEvent(new Event('resize'));
    // }, 0);

    if (this.viewChartShow) {
      this.refreshChartData(this.showChartType);
    }

  }

  changeChartItem($event) {
    const selectObj = this.chartItems.find(item => item.key === $event);
    if (isUndefined(this.selected)) {
      this.viewTableData.selected_items_chart = [this.chartItems[0]];
      this.chartSelectedItem = this.chartItems[0]['key'];
    } else {
      this.viewTableData.selected_items_chart = [selectObj];
    }
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

  setLocalBookMark(summaryType, data: { summary_type: string, sheets_setting: { table_setting: any }, pageSize: number }) {
    const currentUser = this.authService.getCurrentUser();
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    const cacheKey = 'view_mark_' + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
    this.localSt.store(cacheKey, data);
  }

  reloadFirstPage() {
    this.pageInfo.currentPage = 1;
    this.reloadData();
  }


}
