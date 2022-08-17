import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { ReportService } from "../../service/report.service";
import { TableQueryComponent } from "../../../../module/table-setting/components/table-query/table-query.component";
import { TableFieldComponent } from "../../../../module/table-setting/components/table-field/table-field.component";
import { TableItemService } from "../../../../module/table-setting/service/table-item.service";
import { isNull, isObject, isUndefined } from "@jzl/jzl-util";
import { formatDate, splitDate } from "@jzl/jzl-util";
import { TableTimeComponent } from '../../../../module/table-time/components/table-time/table-time.component';
import { NotifyService } from "../../../../module/notify/notify.service";
import { AuthService } from "../../../../core/service/auth.service";
import { Subscription } from "rxjs";
import { LocalStorageService } from "ngx-webstorage";
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";
import { DataViewTableComponent } from '../../../../shared/baseClass/DataViewTableComponent';
import { MenuService } from '../../../../core/service/menu.service';

@Component({
  selector: 'app-biz-effect-modal',
  templateUrl: './biz-effect-modal.component.html',
  styleUrls: ['./biz-effect-modal.component.scss'],
  providers: [TableItemService]
})
export class BizEffectModalComponent extends DataViewTableComponent implements OnInit {

  @Input() tableHeight: any;
  @Input() levelType = 'account';
  private sub = new Subscription();



  public rowHeight = 40;
  private defaultRowHeight = 40;
  public orderInfo: any = {};

  public loadingIndicator = false;
  public loadingCountIndicator = true;

  public reorderable = false;
  public allFilterOption: any;
  public defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];

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

  public showLeftJoin = true;


  constructor(private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    public localSt: LocalStorageService,
    public reportService: ReportService,
    private tableItemService: TableItemService,
    public notifyService: NotifyService,
    public authService: AuthService,
    public _message: NzMessageService,
    public menuService: MenuService,
    private customDataService: CustomDatasService) {

    super(localSt, authService, menuService, notifyService, _message, reportService);

    this.viewTableData['summary_type'] = "biz_unit_account";
    this.viewTableData['sub_summary_type'] = "biz_unit_account";
    this.source_summary = "biz_unit_account";
    this.viewTableData['report_type'] = "biz_unit_report";


  }

  ngOnInit() {
    if (this.levelType == 'campaign') {
      this.viewTableData['summary_type'] = "biz_unit_campaign";
      this.viewTableData['sub_summary_type'] = "biz_unit_campaign";
      this.source_summary = "biz_unit_campaign";
    } else if (this.levelType == 'adgroup') {
      this.viewTableData['summary_type'] = "biz_unit_adgroup";
      this.viewTableData['sub_summary_type'] = "biz_unit_adgroup";
      this.source_summary = "biz_unit_adgroup";
    } else if (this.levelType == 'keyword') {
      this.viewTableData['summary_type'] = "biz_unit_keyword";
      this.viewTableData['sub_summary_type'] = "biz_unit_keyword";
      this.source_summary = "biz_unit_keyword";
    }

    if (this.authService.getCurrentUser().company_id === 4135) {
      this.showLeftJoin = false;
    }



    this.getBizList();
    this.viewReportSetting.report_name = '定制报表-' + '效果报表';

    this.viewTableData['locked_items'] = this.tableItemService.getLockedItemsBySummaryType(this.viewTableData['summary_type'], this.viewTableData.report_type);
    this.viewTableData['selected_items'] = this.tableItemService.getDefaultItemsBySummaryType(this.viewTableData['summary_type']);
    this.allFilterOption = JSON.parse(JSON.stringify(this.tableItemService.getItemFilterType(this.viewTableData['summary_type'])));
    // --- 获取默认
    const localMarkInfo = this.getLocalBookMark('', this.viewTableData['summary_type']);
    const pubTableItems = this.tableItemService.getTableItemsObj(this.viewTableData.report_type, this.viewTableData.summary_type);

    if (localMarkInfo === null) {
      if (this.viewTableData['summary_type'] === 'keyword' || this.viewTableData['summary_type'] === 'creative' || this.viewTableData['summary_type'] === "biz_unit_account") {
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

        let showName = item.name;
        if (["pub_metric_data", "metric_data", "conversion_data"].indexOf(item.data_type) != -1) {
          showName = this.viewTableData['summary_date_alias'] + item.name;
        }
        tmpFiled.push({ 'prop': popKey, 'name': showName, resizeable: true, width: item.width, ...tplHeader });
      }
      if (this.viewTableData.time_grain !== 'day') {
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
                filterKey: { key: popKey + '_cmp', data_type: item.data_type, name: showName, 'type': 'numberFilter' },
                filterResult: {}
              };
              tplHeader['data'] = this.allFilterOption[popKey + '_cmp'];
            }
          }

          tmpFiled.push({ 'prop': popKey + '_cmp', 'draggable': false, 'name': showName, resizeable: true, width: item.width, ...tplHeader });

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
                    filterKey: { key: currentOtherCompareField, data_type: item.data_type, name: otherItem.alias ? otherItem.alias + item.name + '#' : item.name + '#' + (key + 2), 'type': 'numberFilter' },
                    filterResult: {}
                  };
                  tplHeader['data'] = this.allFilterOption[currentOtherCompareField];
                }
              }


              tmpFiled.push({ 'prop': currentOtherCompareField, 'draggable': false, 'name': otherItem.alias ? otherItem.alias + item.name + '#' : item.name + '#' + (key + 2), resizeable: true, width: item.width, ...tplHeader });

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
                filterKey: { key: popKey + '_abs', data_type: item.data_type, name: showName, 'type': 'numberFilter' },
                filterResult: {}
              };
              tplHeader['data'] = this.allFilterOption[popKey + '_abs'];
            }
          }

          tmpFiled.push({ 'prop': popKey + '_abs', 'draggable': false, 'name': showName, resizeable: true, width: item.width, ...tplHeader });


          if (this.viewTableData.time_grain == 'summary') {
            this.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
              const currentOtherCompareField = popKey + '_abs' + key;
              tplHeader['summaryFunc'] = () => this.summaryData[currentOtherCompareField];
              tplHeader['cellTemplate'] = this.cellColor;
              tplHeader['summaryTemplate'] = this.summaryCellColor;
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
                    filterKey: { key: currentOtherCompareField, data_type: item.data_type, name: otherItem.alias ? otherItem.alias + item.name + '△' : item.name + '△' + (key + 2), 'type': 'numberFilter' },
                    filterResult: {}
                  };
                  tplHeader['data'] = this.allFilterOption[currentOtherCompareField];
                }
              }


              tmpFiled.push({ 'prop': currentOtherCompareField, 'draggable': false, 'name': otherItem.alias ? otherItem.alias + item.name + '△' : item.name + '△' + (key + 2), resizeable: true, width: item.width, ...tplHeader });

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
                filterKey: { key: popKey + '_rat', data_type: item.data_type, name: showName, 'type': 'numberFilter' },
                filterResult: {}
              };
              tplHeader['data'] = this.allFilterOption[popKey + '_rat'];
            }
          }
          tmpFiled.push({ 'prop': popKey + '_rat', 'draggable': false, 'name': showName, resizeable: true, width: item.width, cellTemplate: this.rateCell, ...tplHeader });

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
                    filterKey: { key: currentOtherCompareField, data_type: item.data_type, name: item.name + '%', 'type': 'numberFilter' },
                    filterResult: {}
                  };
                  tplHeader['data'] = this.allFilterOption[currentOtherCompareField];
                }
              }


              tmpFiled.push({ 'prop': currentOtherCompareField, 'draggable': false, 'name': otherItem.alias ? otherItem.alias + item.name + '%' : item.name + '%' + (key + 2), resizeable: true, width: item.width, ...tplHeader });

            });
          }

        }
      }
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
      if (result.isHas) {
        item['name'] = result.item['name'];
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

      }
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
        tableData: this.viewTableData,
        lockItem: this.viewTableData['locked_items']
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
          summary_date_alias: this.viewTableData['summary_date_alias'],
          summary_date_compare_alias: this.viewTableData['summary_date_compare_alias'],
          time_grain: this.viewTableData['time_grain'],
          other_compare_date_list: this.viewTableData['other_compare_date_list']
        },
        isCompare: this.viewTableData['is_compare'],
        summary_type: this.viewTableData['summary_type']
      }
    });
    add_modal.afterClose.subscribe(result => {
      if (result.dataType && result.dataType === 'time') {
        this.viewTableData = Object.assign(this.viewTableData, result['data']);
        this.generateTimeShow();
        this.refreshFields(this.viewTableData['selected_items']);
        this.reloadFirstPage();
      }
    });
  }

  // -- report create


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

}
