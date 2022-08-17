import { MenuService } from '../../../../core/service/menu.service';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { ReportService } from "../../../report/service/report.service";
import { OptimizationService } from "../../service/optimization.service";
import { OptimizationItemService } from "../../service/optimization-item.service";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { LocalStorageService } from "ngx-webstorage";
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { formatDate, splitDate } from "@jzl/jzl-util";
import { TableFieldComponent } from "../../../../module/table-setting/components/table-field/table-field.component";
import { EditOptimizationGroupComponent } from "../edit-optimization-group/edit-optimization-group.component";
import { BatchDelayModalComponent } from "../batch-delay-modal/batch-delay-modal.component";
import { EditOptimizationNameComponent } from "../edit-optimization-name/edit-optimization-name.component";
import { EditMessageComponent } from "../../../../module/edit-message/edit-message.component";
import { TableTimeComponent } from '../../../../module/table-time/components/table-time/table-time.component';

@Component({
  selector: 'app-optimization-group-details',
  templateUrl: './optimization-group-details.component.html',
  styleUrls: ['./optimization-group-details.component.scss']
})
export class OptimizationGroupDetailsComponent implements OnInit {

  @Input() tableHeight: any;
  // public tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;
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
    ],
    loadingStatus: 'success',
  };
  public rowHeight = 40;
  public orderInfo: any = {};
  public rows = [];
  public selected = [];
  public selectedType = 'current';
  public columns = [];
  public timeDesc = '';
  public loadingIndicator = false;
  public loadingCountIndicator = false;
  public reorderable = true;
  public defaultSortItems = [{ prop: 'create_time', dir: 'desc' }];

  public dataMessages = {
    emptyMessage: `
    <div class="empty-content">
      <span>无符合要求的数据</span>
    </div>
  `
  };
  public publisherTypeList = [
    { name: '百度', key: 1 },
    { name: '搜狗', key: 2 },
    { name: '360', key: 3 },
    { name: '神马', key: 4 }
  ];

  public editParameter = {
    'selected_type': '',
    'selected_data': [],
    'allViewTableData': {},
    'edit_source': true, //记录编辑来源 true：编辑  false：点击开关
  };
  public viewTableData = {
    'report_type': 'basic_report',
    'summary_type': 'optimization_group',
    'selected_items': [],
    'selected_items_chart': [],
    'locked_items': [],
    'condition': [],
    'single_condition': [],
    'sort_item': { 'key': 'create_time', 'dir': 'desc' },
    'data_range': [],
    'is_compare': false,
    'summary_date': 'day:1:6',
    'summary_date_compare': 'day:8:6',
    'other_compare_date_list': [],
    summary_date_alias: '',
    summary_date_compare_alias: '',
    'time_grain': 'summary',
    'main_range': 'leftJoin',
  };


  private addModal = null;
  public addOptimizationGroup = {
    optimization_name: '',
    optimization_type: 1,
    publisher_id: 1
  };
  public creating = false;
  public allFilterOption: any;
  public allTypePublisher: any;

  @ViewChild('chkHeader', { static: true }) chkHeader: TemplateRef<any>;
  @ViewChild('chkCell', { static: true }) chkCell: TemplateRef<any>;
  @ViewChild('rateCell', { static: true }) rateCell: TemplateRef<any>;
  @ViewChild('creativeCell', { static: true }) creativeCell: TemplateRef<any>;
  @ViewChild('optimizationNameTpl', { static: true }) optimizationNameCell: TemplateRef<any>;
  @ViewChild('optimizationOverdueCountTpl', { static: true }) optimizationOverdueCountCell: TemplateRef<any>;
  @ViewChild('rateCellColor', { static: true }) rateCellColor: TemplateRef<any>;
  @ViewChild('cellColor', { static: true }) cellColor: TemplateRef<any>;
  @ViewChild('bindingResourceCell', { static: true }) bindingResourceCell: TemplateRef<any>;

  @ViewChild('filterHeader', { static: true }) filterHeader: TemplateRef<any>;


  constructor(private modalService: NzModalService,
    private message: NzMessageService,
    public menuService: MenuService,
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportService,
    private optimizationService: OptimizationService,
    private optimizationItemService: OptimizationItemService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private localSt: LocalStorageService) {
    this.allFilterOption = this.optimizationItemService.getItemFilterType(this.viewTableData['summary_type']);

  }

  ngOnInit() {
    this.viewTableData['sort_item'] = { 'key': 'create_time', 'dir': 'desc' };
    this.viewTableData['selected_items'] = this.optimizationItemService.getDefaultItemsBySummaryType(this.viewTableData['summary_type']);
    this.viewTableData['locked_items'] = this.optimizationItemService.getLockedItemsBySummaryType(this.viewTableData['summary_type']);
    // --- 获取默认
    const localMarkInfo = this.getLocalBookMark(this.viewTableData['summary_type']);
    this.refreshFields(this.viewTableData['selected_items']);
    this.generateTimeShow();
    this.refreshData();
    this.refreshCount();

    this.getTypePublisher();
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


  createOptimizationModal(content): void {
    this.addModal = this.modalService.create({
      nzTitle: '添加优化组',
      nzWidth: 600,
      nzContent: content,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
  }

  createOptimization(): void {
    if (!this.creating) {
      this.creating = true;
      this.optimizationService.createGroup(this.addOptimizationGroup).subscribe(result => {
        if (result['status_code'] === 200) {
          this.creating = false;
          this.message.success('优化组创建成功');
          this.addModal.destroy('onOk');
          this.refreshData();
        } else if (result['status_code'] !== 500) {
          this.message.error(result['message']);
        } else {
          this.message.error('创建失败，请重试');
        }
      }, err => {
        this.creating = false;

      }, () => {
        this.creating = false;
      });
    }
  }

  refreshTableSize(event = 'resize') {
    // window.dispatchEvent(new Event(event));
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

      if (item.type && item.type === 'number') {
        tplHeader['cellClass'] = 'num_right';
        tplHeader['headerClass'] = 'header_right';
      }

      if (item.selected && item.selected['current']) {
        // {"prop": "pub_keyword_id", name: '关键词'},
        let showName = item.name;
        if (["pub_metric_data", "metric_data", "conversion_data"].indexOf(item.data_type) != -1) {
          showName = this.viewTableData['summary_date_alias'] + item.name;
        }
        tmpFiled.push({ 'prop': popKey, 'name': showName, width: item.width, ...tplHeader });
      }
      if (item.selected && item.selected['compare']) {
        const showName = this.viewTableData['summary_date_compare_alias'] + item.name + '#';
        tmpFiled.push({ 'prop': popKey + '_cmp', 'name': showName, width: item.width, ...tplHeader });

        if (this.viewTableData.time_grain == 'summary') {
          this.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
            const currentOtherCompareField = popKey + '_cmp' + key;

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
        } else {
          tplHeader['cellTemplate'] = this.cellColor;
        }

        tmpFiled.push({ 'prop': popKey + '_abs', 'name': showName, width: item.width, ...tplHeader });

        if (this.viewTableData.time_grain == 'summary') {
          this.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
            const currentOtherCompareField = popKey + '_abs' + key;

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
        tmpFiled.push({
          'prop': popKey + '_rat',
          'name': showName,
          width: item.width,
          cellTemplate: this.rateCell, ...tplHeader
        });

        if (this.viewTableData.time_grain == 'summary') {
          this.viewTableData['other_compare_date_list'].forEach((otherItem, key) => {
            const currentOtherCompareField = popKey + '_rat' + key;

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
      if (this.allFilterOption.hasOwnProperty(popKey)) {
        tplHeader['headerTemplate'] = this.filterHeader;
        tplHeader['data'] = this.allFilterOption[popKey];
      }
    });
    const lockedColumn = [];
    this.viewTableData['locked_items'].forEach(item => {
      let popKey = item.key;
      if (item.hasOwnProperty('showKey') && item.showKey !== '') {
        popKey = item.showKey;
      }
      const tplHeader = {};
      if (popKey === 'optimization_name') {
        tplHeader['cellTemplate'] = this.optimizationNameCell;
      }
      if (popKey === 'qps_info_status') {
        tplHeader['cellTemplate'] = this.bindingResourceCell;
      }

      if (popKey === 'overdue_detail_count') {
        tplHeader['cellTemplate'] = this.optimizationOverdueCountCell;
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


  changeSelectedBookMark(bookMark) {
    this.viewTableData = Object.assign(this.viewTableData, bookMark['table_setting']);
    this.refreshFields(this.viewTableData['selected_items']);
    this.generateTimeShow();
    this.refreshData(true);
    this.refreshCount();

  }


  cancelCreate(): void {
    this.addModal.destroy();
  }


  // -- 数据相关 -- start
  refreshData(fromMark = false) {
    this.loadingIndicator = true;
    this.viewTableData.single_condition = [];
    this.allFilterOption = { ...this.allFilterOption };
    Object.values(this.allFilterOption).forEach(item => {
      if (Object.values(item['filterResult']).length > 0) {
        this.viewTableData.single_condition.push(item['filterResult']);
      }
    });
    const postData = { sheets_setting: { table_setting: this.viewTableData } };
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

          if (this.viewTableData.single_condition.length) {
            this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>无符合要求的数据</span>
    </div>
  `;
          }
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
    const postData = { sheets_setting: { table_setting: this.viewTableData } };
    this.pageInfo.loadingStatus = 'pending';
    this.optimizationService.getViewList(postData, { is_count: 1 }).subscribe(
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

  getTypePublisher() {
    this.optimizationService.getTypePublisher().subscribe((result) => {
      if (result.status_code && result.status_code === 200) {
        this.allTypePublisher = result['data'];
      }
    }, (err: any) => {

    },
      () => {
      });
  }
  //当全选时：判断编辑按钮是否可以点击（所选择的项为单媒体和全为排名优化）
  judgeListType() {
    let newType = JSON.parse(JSON.stringify(this.allTypePublisher));
    this.viewTableData.single_condition.forEach((item, index) => {
      const isCondition = [];
      newType.forEach(typeItem => {
        if (item['key'] === 'publisher_id' && item['value'] === typeItem['publisher_id'] * 1) {
          isCondition.push(typeItem);
        }
        if (item['key'] === 'optimization_type' && item['value'] === typeItem['optimization_type'] * 1) {
          isCondition.push(typeItem);
        }
      });
      newType = isCondition;

    });

    let status: any;
    if (newType.length > 1) {
      status = false;
    } else if (newType.length === 1 && newType[0]['optimization_type'] * 1 === 2) {
      status = false;
    } else {
      status = true;
    }
    return status;

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

  reloadData() {
    this.setLocalBookMark(this.viewTableData['summary_type'], {
      summary_type: this.viewTableData['summary_type'],
      sheets_setting: {
        table_setting: this.viewTableData,
      }
    });

    this.refreshData();
    this.refreshCount();
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
        //
        this.reloadData();
        this.refreshCount();
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
    }

  }

  changePage(page) {
    this.pageInfo.currentPage = page.page;
    this.refreshData();

  }

  changePageSize(pageSize) {
    this.pageInfo.currentPage = 1;
    this.refreshData();
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
    if (orderKey === 'optimization_type_name') {
      orderKey = 'optimization_type';
    }
    this.viewTableData['sort_item'] = { 'key': orderKey, 'dir': sortInfo.dir };

    this.refreshData();
  }

  // -- 数据相关 -- end


  delOptimization(optimizationId?: number) {
    const postBody = { optimization_ids: [] };
    if (isUndefined(optimizationId)) {
      this.selected.forEach(data => {
        postBody.optimization_ids.push(data.optimization_id);
      });
      if (postBody.optimization_ids.length > 0) {
        this.optimizationService.delGroup(postBody).subscribe((result: any) => {
          if (result.status_code === 200) {

            this.message.success('删除成功');
            this.refreshData();
          }
        },
          (err: any) => {
            this.message.error('删除失败,请重试');
          },
          () => {
          });
      } else {
        this.message.info('请选择相关项操作');
      }
    } else if (isNumber(optimizationId) && optimizationId > 0) {
      postBody.optimization_ids.push(optimizationId);
      this.optimizationService.delGroup(postBody).subscribe((result: any) => {
        if (result.status_code === 200) {
          this.message.success('删除成功');
          this.refreshData();
        }
      },
        (err: any) => {
          this.message.error('删除失败,请重试');
        },
        () => {
        });
    } else {
      this.message.error('请勿非法操作');
    }
  }


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

  setLocalBookMark(summaryType, data: { summary_type: string, sheets_setting: { table_setting: any } }) {
    const currentUser = this.authService.getCurrentUser();
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    const cacheKey = 'view_mark_' + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
    this.localSt.store(cacheKey, data);
  }

  clickOverdue() {
    localStorage.setItem('overdue', 'true');
  }

  editRanking() {

    if (!this.selected.length) {
      this.message.warning('请选择优化组');
    } else {
      this.editParameter.allViewTableData = this.viewTableData;
      if (this.selectedType === 'all' && this.pageInfo.allCount <= this.pageInfo.pageSize) {
        this.selectedType = 'current';
      }

      if (this.selectedType === 'current') {
        if (!this.judgeSelectedListType(this.selected)) {
          this.message.warning('编辑不能跨媒体并且为排名优化');
        } else {
          this.editParameter.selected_type = 'current';
          this.editParameter.selected_data = [...this.selected];
          this.editGroupModal(this.selected);
        }
      } else if (this.selectedType === 'all') {
        if (!this.judgeListType()) {
          this.message.warning('编辑不能跨媒体并且为排名优化');
        } else {
          this.editParameter.selected_type = 'all';
          this.editParameter.selected_data = [...this.selected];
          this.editGroupModal(this.selected);
        }

      }
    }
  }

  editGroupModal(data) {
    const add_modal = this.modalService.create({
      nzTitle: '优化设置',
      nzWidth: 800,
      nzContent: EditOptimizationGroupComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        parentData: this.editParameter
      }
    });
  }


  //判断选择的优化中媒体和排名优化是否唯一
  judgeSelectedListType(data) {
    let status: any;
    const optimizationGroupType = data.find(opt_type => {
      return opt_type['optimization_type'] * 1 === 2;
    });
    if (optimizationGroupType) {
      status = false;
    } else {
      const publishCount = [];
      data.forEach(item => {
        if (publishCount.indexOf(item['publisher_id']) === -1) {
          publishCount.push(item['publisher_id']);

        }
      });
      publishCount.length === 1 ? status = true : status = false;
    }
    return status;
  }


  editBatchDelay() {

    if (!this.selected.length) {
      this.message.warning('请选择优化组');
    } else {
      this.editParameter.allViewTableData = this.viewTableData;
      if (this.selectedType === 'all' && this.pageInfo.allCount <= this.pageInfo.pageSize) {
        this.selectedType = 'current';
      }
      if (this.selectedType === 'current') {
        this.editParameter.selected_type = 'current';
        this.editParameter.selected_data = [...this.selected];
      } else if (this.selectedType === 'all') {
        this.editParameter.selected_type = 'all';
        this.editParameter.selected_data = [...this.selected];
      }
      this.batchDelay();
    }
  }

  //当全选时：判断编辑按钮是否可以点击（所选择的项为全为排名优化）
  judgeListItemType() {
    const newType = JSON.parse(JSON.stringify(this.allTypePublisher));
    let status: any;
    if (this.viewTableData.single_condition.length) {
      this.viewTableData.single_condition.forEach((item, index) => {
        newType.forEach(typeItem => {
          if (item['key'] === 'optimization_type' && item['value'] === typeItem['optimization_type'] * 1 && item['value'] === 1) {
            status = true;
          }
        });
      });
    } else {
      const typeStatus = newType.find(optType => {
        return optType['optimization_type'] * 1 === 2;
      });
      if (typeStatus) {
        status = false;
      } else {
        status = true;
      }
    }
    return status;

  }

  //批量延期
  batchDelay() {
    const add_modal = this.modalService.create({
      nzTitle: '批量延期',
      nzWidth: 500,
      nzContent: BatchDelayModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        parentData: this.editParameter
      }
    });

  }

  editNameBtn() {
    if (!this.selected.length) {
      this.message.warning('请选择优化组');
    } else {
      this.editParameter.allViewTableData = this.viewTableData;
      if (this.selectedType === 'all' && this.pageInfo.allCount <= this.pageInfo.pageSize) {
        this.selectedType = 'current';
      }

      if (this.selectedType === 'current') {

        this.editParameter.selected_type = 'current';
        this.editParameter.selected_data = [...this.selected];

      } else if (this.selectedType === 'all') {

        this.editParameter.selected_type = 'all';
        this.editParameter.selected_data = [...this.selected];
      }
      this.editName();
    }
  }

  //编辑名称
  editName() {
    const edit_modal = this.modalService.create({
      nzTitle: '编辑优化名称',
      nzWidth: 500,
      nzContent: EditOptimizationNameComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        parentData: this.editParameter
      }
    });
    edit_modal.afterClose.subscribe(data => {
      if (data.name === 'onOk') {
        this.refreshData();
      }
      if (data.name === 'onOk_repeat') {
        const message_modal = this.modalService.create({
          nzTitle: '优化名重复',
          nzWidth: 400,
          nzContent: EditMessageComponent,
          nzClosable: false,
          nzMaskClosable: false,
          nzWrapClassName: 'edit-message',
          nzFooter: null,
          nzComponentParams: {
            repeat: data.repeat,
            edit_source: 'edit_optimization_group_name'
          }
        });
        message_modal.afterClose.subscribe(result => {
          if (result === 'onOk') {
            this.refreshData();
          }
        });
      }
    });
  }

  start() {
    if (!this.selected.length) {
      this.message.warning('请选择优化组');
    } else {

      if (this.selectedType === 'current') {
        this.editParameter.selected_type = 'current';
        this.editParameter.selected_data = [...this.selected];
      } else if (this.selectedType === 'all') {
        this.editParameter.selected_type = 'all';
        this.editParameter.selected_data = [...this.selected];
      }

      const message_modal = this.modalService.create({
        nzTitle: '开启调价',
        nzWidth: 400,
        nzContent: EditMessageComponent,
        nzClosable: false,
        nzMaskClosable: false,
        nzWrapClassName: 'edit-message',
        nzFooter: null,
        nzComponentParams: {
          editData: false,
          edit_source: 'optimization_group'
        }
      });

      message_modal.afterClose.subscribe(data => {
        if (data === 'onOk') {
          const notifyData: any[] = [];
          const userOperdInfo = this.authService.getCurrentUserOperdInfo();
          const optimizationData = this.getOptimizationData(this.editParameter.selected_type);

          this.optimizationService.editOptimizationStatusStart(optimizationData).subscribe(result => {
            if (result.status_code && result.status_code === 200) {
              notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'optimization_group' });
              this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
              this.message.success(result['message']);
            } else if (result['status_code'] && result.status_code === 401) {
              this.message.error(result['message']);
            } else if (result['status_code'] && result.status_code === 500) {
              this.message.error(result['message']);
            } else if (result['status_code'] && result.status_code === 205) {
            } else {
              this.message.error(result.message);
            }
          });

        }
      }
      );
    }

  }
  stop() {
    if (!this.selected.length) {
      this.message.warning('请选择优化组');
    } else {
      this.editParameter.allViewTableData = this.viewTableData;
      if (this.selectedType === 'all' && this.pageInfo.allCount <= this.pageInfo.pageSize) {
        this.selectedType = 'current';
      }
      if (this.selectedType === 'current') {
        this.editParameter.selected_type = 'current';
        this.editParameter.selected_data = [...this.selected];
      } else if (this.selectedType === 'all') {
        this.editParameter.selected_type = 'all';
        this.editParameter.selected_data = [...this.selected];
      }

      const message_modal = this.modalService.create({
        nzTitle: '停止调价',
        nzWidth: 400,
        nzContent: EditMessageComponent,
        nzClosable: false,
        nzMaskClosable: false,
        nzWrapClassName: 'edit-message',
        nzFooter: null,
        nzComponentParams: {
          editData: true,
          edit_source: 'optimization_group'
        }
      });

      message_modal.afterClose.subscribe(data => {
        if (data['name'] === 'onOk') {
          const notifyData: any[] = [];
          const userOperdInfo = this.authService.getCurrentUserOperdInfo();
          const optimizationData = this.getOptimizationData(this.editParameter.selected_type);
          optimizationData['price_status'] = data['value'];

          this.optimizationService.editOptimizationStatusEnd(optimizationData).subscribe(result => {
            if (result.status_code && result.status_code === 200) {

              notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'optimization_group' });
              this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
              this.message.success(result['message']);

            } else if (result['status_code'] && result.status_code === 401) {
              this.message.error(result['message']);
            } else if (result['status_code'] && result.status_code === 500) {
              this.message.error(result['message']);
            } else if (result['status_code'] && result.status_code === 205) {
            } else {
              this.message.error(result.message);
            }
          });

        }
      }
      );
    }
  }

  getOptimizationData(selectType) {
    const idsArray = [];
    if (this.editParameter.selected_type === 'current') {
      this.editParameter['selected_data'].forEach(item => {
        idsArray.push(item['optimization_id']);
      });
    }

    const model = {
      "ranking_setting": {
      },
      "ranking_details": {}
    };

    model['source'] = 'optimizationGroup' + "Edit";
    if (this.editParameter['edit_source'] === false) { //点击来源
      model['edit_source'] = false;
    } else {
      model['edit_source'] = true;
    }
    model['ranking_details']['select_type'] = selectType;
    if (selectType === 'current') {
      model['ranking_details']['details'] = idsArray;
    } else if (selectType === 'all') {
      model['detail_content'] = [];
      model['ranking_details']['sheets_setting'] = {
        'table_setting': this.editParameter.allViewTableData
      };
    }
    model['ranking_details']['type'] = 'optimization_group';

    return model;
  }
  reloadFirstPage() {
    this.pageInfo.currentPage = 1;
    this.reloadData();
  }

}
