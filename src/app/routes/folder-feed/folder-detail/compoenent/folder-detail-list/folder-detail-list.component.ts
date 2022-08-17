import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { DataViewService } from '../../../../data-view/service/data-view.service';
import { ReportService } from '../../../../report/service/report.service';
import { AuthService } from '../../../../../core/service/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LocalStorageService } from 'ngx-webstorage';
import { ActivatedRoute, Router } from '@angular/router';
import { isNull, isNumber, isObject, isUndefined } from "@jzl/jzl-util";
import { TableFieldComponent } from '../../../../../module/table-setting/components/table-field/table-field.component';
import { TableQueryComponent } from '../../../../../module/table-setting/components/table-query/table-query.component';
import { formatDate, generateTimeResult, generateTimeTip, splitDate } from "@jzl/jzl-util";

import { FolderItemService } from '../../../service/folder-item.service';
import { itemPipeOjb } from '../../../../../module/table-setting';
import { FolderDetailService } from '../../service/folder-detail.service';
import { AppBookmarkModalComponent } from '../../../../../module/bookmark/modal/app-bookmark-modal.component';
import { ViewBookmarkComponent } from '../../../../../module/bookmark/components/view-bookmark.component';
import { QueryRankingComponent } from '../../../../../module/query-ranking/query-ranking.component';
import { Subject } from 'rxjs';
import { FolderService } from '../../../service/folder.service';
import { NotifyService } from '../../../../../module/notify/notify.service';
import { environment } from '../../../../../../environments/environment';
import { AppBookmarkSaveModalComponent } from '../../../../../module/bookmark/modal/app-bookmark-save-modal/app-bookmark-save-modal.component';
import { TableItemService } from '../../../../../module/table-setting/service/table-item.service';
import { BatchUploadComponent } from '../../../modal/batch-upload/batch-upload.component';
import { TableTimeComponent } from '../../../../../module/table-time/components/table-time/table-time.component';
import { DataViewTableComponent } from '../../../../../shared/baseClass/DataViewTableComponent';
import { MenuService } from '../../../../../core/service/menu.service';

@Component({
  selector: 'app-folder-detail-list',
  templateUrl: './folder-detail-list.component.html',
  styleUrls: ['./folder-detail-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TableItemService]
})
export class FolderDetailListComponent extends DataViewTableComponent implements OnInit, OnDestroy {
  public can_nav = true;
  public folderId = '';
  public folderLevel = '';
  public viewChartShow = false;
  public showChartType = 'day';
  public chartItems = [];
  public chartSelectedItem: any;
  public ranking_setting: any;

  public overdue = null;
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



  public $folderLevelName = {
    'account': '帐户',
    'campaign': '计划',
    'adgroup': '单元',
    'keyword': '关键词',
    'creative': '创意',
  };

  public is_refresh = 0;

  public tableHeight = document.body.clientHeight - 60 - 65 - 30 - 60;
  private _bookMarkDefaultTop = 176;
  private _chartDefaultHeight = 300;
  public bookMarkTop = 176;
  public rowHeight = 40;

  public editParameter = {
    selected_type: '',
    selected_data: [],
    allViewTableData: {},
    edit_source: true //记录编辑来源 true：编辑  false：点击开关
  };
  public clickReal = false;



  public refreshRankingSetting = {
    rankingData: [],
    allCount: 0,
    maxRun: 1,
    currentRun: 0,
    currentIndex: -1,
    status: 'stop'
  };
  public refreshPriceFlag = false;
  public refreshRankingSingleComplete$ = new Subject();
  public refreshRankingObserver = null;

  @ViewChild('chkHeader', { static: true }) chkHeader: TemplateRef<any>;
  @ViewChild('filterHeader', { static: true }) filterHeader: TemplateRef<any>;
  @ViewChild('refreshRankingHeader', { static: true }) refreshHeader: TemplateRef<any>;
  @ViewChild('dataAnalysisHeader', { static: true }) dataAnalysisHeader: TemplateRef<any>;

  @ViewChild('dataAnalysisCell', { static: true }) dataAnalysisCell: TemplateRef<any>;
  @ViewChild('refreshRankingCell', { static: true }) refreshCell: TemplateRef<any>;
  @ViewChild('chkCell', { static: true }) chkCell: TemplateRef<any>;
  @ViewChild('rateCell', { static: true }) rateCell: TemplateRef<any>;
  @ViewChild('creativeCell', { static: true }) creativeCell: TemplateRef<any>;
  @ViewChild('rateCellColor', { static: true }) rateCellColor: TemplateRef<any>;
  @ViewChild('cellColor', { static: true }) cellColor: TemplateRef<any>;
  @ViewChild('rankingSettingCell', { static: true }) rankingSettingCell: TemplateRef<any>;
  @ViewChild('rankingBegDateCell', { static: true }) rankingBegDateCell: TemplateRef<any>;
  @ViewChild('rankingEndDateCell', { static: true }) rankingEndDateCell: TemplateRef<any>;
  @ViewChild('starTpl', { static: true }) starTpl: TemplateRef<any>;



  public loadingIndicator = true;
  public loadingCountIndicator = true;
  public reorderable = true;
  /*public is_compare: any;*/

  public allFilterOption: any;
  @ViewChild('viewTable', { static: true }) viewTable;
  @ViewChild('viewMark') viewMark: ViewBookmarkComponent;

  constructor(
    private dataViewService: DataViewService,
    private folderItemService: FolderItemService,
    public reportService: ReportService,
    public authService: AuthService,
    public _message: NzMessageService,
    private modalService: NzModalService,
    public localSt: LocalStorageService,
    private folderDetailService: FolderDetailService,
    public notifyService: NotifyService,
    private router: Router,
    private route: ActivatedRoute,
    private reportItemService: TableItemService,
    private folderService: FolderService,
    public menuService: MenuService,
  ) {
    super(localSt, authService, menuService, notifyService, _message, reportService);
    this.folderId = this.route.snapshot.parent.paramMap.get('id');

    const routeData = this.route.snapshot.parent.data;
    this.viewTableData['summary_type'] = 'folder_detail_' + routeData['summaryType'];
    this.viewTableData['sub_summary_type'] = routeData['summaryType'];
    this.folderLevel = routeData['summaryType'];
    this.allFilterOption = this.folderItemService.getItemFilterType(
      this.viewTableData['summary_type']
    );
    if (this.folderLevel == 'creative') {
      this.rowHeight = 80;
    }

    this.route.data.subscribe(data => {
      if (this.viewTableData['summary_type'] === 'creative') {
        this.rowHeight = 80;
      }
      this.chartItems = folderItemService.getChartItem();
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
    this.getOverdue();
    this.editParameter['editParameter'] = this.getUrlParam('edit');
    this.viewTableData[
      'selected_items'
    ] = this.folderItemService.getDefaultItemsBySummaryType(
      this.viewTableData['summary_type']
    );
    this.viewTableData['sort_item'] = { key: 'pub_cost', dir: 'desc' };
    this.viewTableData[
      'locked_items'
    ] = this.folderItemService.getLockedItemsBySummaryType(
      this.viewTableData['summary_type']
    );

    //获取筛选项
    const initData = this.reportItemService.getTableItems(
      this.viewTableData['report_type'],
      this.viewTableData['summary_type'],
      this.viewTableData['selected_items']
    );
    const selectedItems = initData['selected'];

    // --- 获取默认
    const localMarkInfo = this.getLocalBookMark(
      this.viewTableData['summary_type'], this.menuService.currentChannelId, this.menuService.currentPublisherId, 0
    );
    if (localMarkInfo === null) {
      this.refreshFields(this.viewTableData['selected_items']);
      this.generateTimeShow();
      this.refreshData();
      this.refreshCount();
    } else {
      // const willDeleteItem = [];
      // localMarkInfo['sheets_setting']['table_setting'][
      //   'selected_items'
      // ].forEach((info, index) => {
      //   if (info['data_type'] === 'pub_attr_data') {
      //     const findUserInfo = selectedItems.find(item => {
      //       return info.key === item.key;
      //     });
      //     if (!findUserInfo) {
      //       willDeleteItem.push(info);
      //     }
      //   }
      // });
      // if (willDeleteItem.length) {
      //   const newSelectedItem = []; //用来存储过滤之后的selected_items
      //   localMarkInfo['sheets_setting']['table_setting'][
      //     'selected_items'
      //   ].forEach(opt => {
      //     const compareState = willDeleteItem.find(item => {
      //       return opt['key'] === item['key'];
      //     });
      //     if (!compareState) {
      //       newSelectedItem.push(opt);
      //     }
      //   });
      //   this.viewTableData['selected_items'] = newSelectedItem;
      //   localMarkInfo['sheets_setting']['table_setting'][
      //     'selected_items'
      //   ] = newSelectedItem;
      // }

      if (localMarkInfo.hasOwnProperty('pageSize')) {
        this.pageInfo.pageSize = localMarkInfo['pageSize'];
      }

      this.changeSelectedBookMark(localMarkInfo['sheets_setting']);

      this.folderService.getCanJump().subscribe(result => {
        this.can_nav = result;
      });
    }
    // --

    //获取分组信息
    this.folderService.getOptimizationInfo().subscribe(result => {
      if (result) {
        this.viewReportSetting.report_name = result['folder_name'];
      }
    });
  }

  getOverdue() {
    this.overdue = localStorage.getItem('overdue');
  }

  mainRangeChange(event) {
    setTimeout(() => {
      this.pageInfo.currentPage = 1;
      this.reloadData(true);
    });
  }


  jumpToAdd() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  jumpToEdit(source = 'edit', count?) {
    let editSource = true;
    if (source !== 'edit') {
      editSource = false;
      if (
        this.selected.length === 0 &&
        this.pageInfo.allCount <= this.pageInfo.pageSize
      ) {
        this.editParameter.selected_type = 'current';
        this.editParameter.selected_data = [...this.rows];
      } else if (this.selected.length === 0) {
        this.editParameter.selected_type = 'all';
      } else if (
        this.selectedType === 'current' ||
        this.pageInfo.allCount <= this.pageInfo.pageSize
      ) {
        this.editParameter.selected_data = this.selected;
        this.editParameter.selected_type = 'current';
      } else {
        this.editParameter.selected_type = 'all';
      }

      this.editParameter['count'] = count;
    } else {
      if (this.selected.length === 0) {
        this._message.error('请选择关键词');
        return;
      }
      this.editParameter.selected_type = this.selectedType;
      if (this.pageInfo.allCount <= this.pageInfo.pageSize) {
        this.editParameter.selected_type = 'current';
      }
      this.editParameter.selected_data = this.selected;
    }

    this.editParameter.allViewTableData = {
      ...this.viewTableData,
      filter_folder_ids: [this.folderId]
    };
    this.editParameter.edit_source = editSource;
    if (
      this.editParameter.selected_data.length > 0 ||
      this.editParameter.selected_type === 'all'
    ) {
      this.isJump = 'true';
      localStorage.setItem('edit_state', 'true');
    } else {
      this.isJump = '';
    }
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

  childPageState(state) {
    if (state === 'false') {
      this.isJump = '';
      this.selected = [];
      this.selected.splice(0, this.selected.length);
    }
    if (state === 'refresh') {
      this.isJump = '';
      this.selected = [];
      this.selected.splice(0, this.selected.length);
      this.refreshData();
    }
  }



  refreshData(fromMark = false) {
    if (!fromMark && !isUndefined(this.viewMark)) {
      this.viewMark.resetActiveMark();
    }
    const realTimePriceFlag = this.columns.find(
      item => item.prop === 'real_time_price'
    );
    this.refreshPriceFlag = !isUndefined(realTimePriceFlag);

    this.refreshRankingSetting.status = 'stop';
    this.allFilterOption = { ...this.allFilterOption };
    this.viewTableData.single_condition = [];
    if (this.overdue) {
      this.allFilterOption['ranking_keyword_status_code']['filterResult'] = {
        data_type: 'optimization_ranking_data',
        key: 'ranking_keyword_status_code',
        name: '竞价进度',
        op: '=',
        type: 'singleList',
        value: '5'
      };
      this.viewTableData.single_condition.push(
        this.allFilterOption['ranking_keyword_status_code']['filterResult']
      );
    } else {
      Object.values(this.allFilterOption).forEach(item => {
        if (item['filterResult'].hasOwnProperty('key')) {
          this.viewTableData.single_condition.push(item['filterResult']);
        }
      });
    }

    this.loadingIndicator = true;
    const postData = {
      sheets_setting: {
        table_setting: {
          ...this.viewTableData,
          filter_folder_ids: [this.folderId]
        }
      }
    };
    this.dataViewService
      .getViewList(postData, {
        count: this.pageInfo.pageSize,
        page: this.pageInfo.currentPage
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.loadingIndicator = false;
            this.rows = results['data']['detail'];
            this.pageInfo.currentPageCount = results['data']['detail'].length;
            this.selected = [];
            if (this.refreshPriceFlag) {
              this.refreshPrice();
            }
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
    if (!this.overdue) {
      this.viewTableData.single_condition = [];
      Object.values(this.allFilterOption).forEach(item => {
        if (item['filterResult'].hasOwnProperty('key')) {
          this.viewTableData.single_condition.push(item['filterResult']);
        }
      });
    } else {
      // this.folderService.setOverdue(true);
      localStorage.removeItem('overdue');
      this.overdue = null;
    }

    const postData = {
      sheets_setting: {
        table_setting: {
          ...this.viewTableData,
          filter_folder_ids: [this.folderId]
        }
      }
    };
    this.dataViewService.getViewList(postData, { is_count: 1 }).subscribe(
      (results: any) => {
        if (results.status_code && results.status_code === 200) {
          this.pageInfo.allCount = results['data']['detail_count'];
          if (
            this.pageInfo.allCount === 0 &&
            this.viewTableData.single_condition.length === 0 &&
            this.viewTableData.condition.length === 0
          ) {
            this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>请在账户、计划 、单元、关键词 层级选择优化范围，点击编辑进行优化设置</span>
    </div>
  `;
          } else {
            this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>无符合要求的数据</span>
    </div>
  `;
          }
        }
      },
      (err: any) => {
        this.loadingCountIndicator = false;
        this.dataMessages = {
          emptyMessage: `
    <div class="empty-content">
      <span>无符合要求的数据</span>
    </div>
  `
        };

      },
      () => {
        this.loadingCountIndicator = false;
      }
    );
  }

  downloadReport() { }

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
        item => {
          if (
            item['name'][item['name'].length - 1] !== '#' &&
            item['name'][item['name'].length - 1] !== '△' &&
            item['name'][item['name'].length - 1] !== '%'
          ) {
            currentCondition.push(item);
          }
        }
      );
      this.viewTableData['condition'] = currentCondition;
      Object.values(this.allFilterOption).forEach(filter => {
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
        this.refreshChartData(this.showChartType);
      }
    });
  }

  reloadData(reloadChart = true) {
    this.refreshData();
    this.refreshCount();
    this.setLocalBookMark('', this.viewTableData['summary_type'], {
      summary_type: this.viewTableData['summary_type'],
      sheets_setting: {
        table_setting: this.viewTableData
      },
      pageSize: this.pageInfo.pageSize
    }, this.menuService.currentChannelId, this.menuService.currentPublisherId, 0);
    if (this.viewChartShow && reloadChart) {
      this.refreshChartData(this.showChartType);
    }
  }

  refreshFields(data: any[]) {
    const checkFiled: any = [
      {
        width: '64',
        headerTemplate: this.chkHeader,
        cellTemplate: this.chkCell,
        name: 'checkBOx',
        frozenLeft: true
      }
    ];
    const dataAnalysis: any = [
      {
        width: '70',
        headerTemplate: this.dataAnalysisHeader,
        cellTemplate: this.dataAnalysisCell,
        name: '数据分析',
        prop: 'dataAnalysis',
        frozenLeft: true
      }
    ];

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

      if (item.key === 'ranking_setting') {
        tplHeader['cellTemplate'] = this.rankingSettingCell;
      }
      if (item.key === 'ranking_beg_date') {
        tplHeader['cellTemplate'] = this.rankingBegDateCell;
      }
      if (item.key === 'ranking_end_date') {
        tplHeader['cellTemplate'] = this.rankingEndDateCell;
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
        if (popKey === 'ranknow') {
          tplHeader['headerTemplate'] = this.refreshHeader;
          tplHeader['cellTemplate'] = this.refreshCell;
        }

        tmpFiled.push({
          prop: popKey,
          name: item.name,
          resizeable: true,
          width: item.width,
          ...tplHeader
        });
      }
      if (item.selected && item.selected['compare']) {
        if (this.allFilterOption.hasOwnProperty(popKey)) {
          if (this.allFilterOption.hasOwnProperty(popKey + '_cmp')) {
            tplHeader['data'] = this.allFilterOption[popKey + '_cmp'];
          } else {
            this.allFilterOption[popKey + '_cmp'] = {
              filterType: 'numberFilter',
              filterOption: [],
              filterKey: {
                key: popKey + '_cmp',
                data_type: item.data_type,
                name: item.name + '#',
                type: 'numberFilter'
              },
              filterResult: {}
            };
            tplHeader['data'] = this.allFilterOption[popKey + '_cmp'];
          }
        }

        tmpFiled.push({
          prop: popKey + '_cmp',
          draggable: false,
          name: item.name + '#',
          resizeable: true,
          width: item.width,
          ...tplHeader
        });

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
              filterKey: {
                key: popKey + '_abs',
                data_type: item.data_type,
                name: item.name + '△',
                type: 'numberFilter'
              },
              filterResult: {}
            };
            tplHeader['data'] = this.allFilterOption[popKey + '_abs'];
          }
        }

        tmpFiled.push({
          prop: popKey + '_abs',
          draggable: false,
          name: item.name + '△',
          resizeable: true,
          width: item.width,
          ...tplHeader
        });

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
        tplHeader['cellTemplate'] = this.rateCellColor;
        if (this.allFilterOption.hasOwnProperty(popKey)) {
          if (this.allFilterOption.hasOwnProperty(popKey + '_rat')) {
            tplHeader['data'] = this.allFilterOption[popKey + '_rat'];
          } else {
            this.allFilterOption[popKey + '_rat'] = {
              filterType: 'numberFilter',
              filterOption: [],
              filterKey: {
                key: popKey + '_rat',
                data_type: item.data_type,
                name: item.name + '%',
                type: 'numberFilter'
              },
              filterResult: {}
            };
            tplHeader['data'] = this.allFilterOption[popKey + '_rat'];
          }
        }
        tmpFiled.push({
          prop: popKey + '_rat',
          draggable: false,
          name: item.name + '%',
          resizeable: true,
          width: item.width,
          cellTemplate: this.rateCell,
          ...tplHeader
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

      lockedColumn.push({
        prop: popKey,
        name: item.name,
        frozenLeft: true,
        width: item.width,
        ...tplHeader
      });
    });

    this.columns = [
      ...checkFiled,
      ...lockedColumn,
      ...dataAnalysis,
      ...tmpFiled
    ];

    const findOrderKey = this.columns.find(item => {
      return item.prop === this.viewTableData['sort_item'].key;
    });
    if (isUndefined(findOrderKey)) {
      this.viewTableData['sort_item'] = { key: 'pub_cost', dir: 'desc' };
      this.defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];
    } else {
      // this.defaultSortItems
    }
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
        summaryType: this.viewTableData['summary_type'],
        sheetSetting: {
          table_setting: this.viewTableData
        },
        relationId: this.folderId
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
          table_setting: this.viewTableData
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
    this.viewTableData = Object.assign(
      this.viewTableData,
      bookMark['table_setting']
    );

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

    if (
      this.viewTableData['single_condition'] &&
      this.viewTableData['single_condition'].length > 0
    ) {
      this.viewTableData['single_condition'].forEach(item => {
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
              type: 'numberFilter'
            },
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


  handCreateReport() {
    if (this.reportPosting) {
      return false;
    }

    this.viewTableData.time_grain = this.time_grain;
    this.reportPosting = true;

    this.viewTableData.condition.push(...this.viewTableData.single_condition);
    this.viewTableData.single_condition = [];
    const postBody = Object.assign({}, this.viewReportSetting, {
      sheets_setting: [
        {
          sheet_name: 'sheet_1',
          table_setting: {
            ...this.viewTableData,
            filter_folder_ids: [this.folderId]
          },
          charts_setting: [],
          sheet_module: {
            table: false,
            line: true,
            bar: true,
            lineStack: true,
            pie: true
          }
        }
      ],
      email_list: this.viewReportSetting.email_list.split('\n'),
      report_status: 2
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
              report_name: this.viewReportSetting.report_name
            });
            this.notifyService.notifyData.next({
              type: 'report',
              data: notifyData
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
      }
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





  delFolderDetails() {
    if (this.selected.length < 1) {
      this._message.error('请选择关键词');
      return;
    }
    const postBody = {
      folder_details: {
        select_type: this.selectedType,
        details: [],
        sheets_setting: {},
        type: this.folderLevel
      }
    };
    if (
      this.selectedType === 'current' ||
      this.pageInfo.allCount <= this.pageInfo.pageSize
    ) {
      postBody['folder_details'].details = this.selected;
      postBody['folder_details'].select_type = 'current';
    } else {
      postBody['folder_details'].sheets_setting = {
        table_setting: {
          ...this.viewTableData,
          filter_folder_ids: [this.folderId]
        }
      };
      postBody['folder_details'].select_type = 'all';
    }
    this.folderDetailService
      .delDetails(this.folderId, postBody)
      .subscribe(
        (result: any) => {
          if (result.status_code === 200) {
            this._message.success('删除成功(' + result['data']['effect'] + ')');
            this.refreshData();
            this.refreshCount();
          }
        },
        (err: any) => {
          this._message.error('删除失败,请重试');
        },
        () => { }
      );
  }


  // --- ranking相关

  queryRanking(row?) {
    if (this.selected.length) {
      //有选中
      const publisherData = this.getParentPublishers(this.selected);
      const params = {
        ranking_setting: this.ranking_setting,
        publisherCount: publisherData['publisherCount']
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
        nzComponentParams: params
      });
      rankingModal.afterClose.subscribe(result => {
        if (isObject(result) && result['status'] === 'ok') {
          this.refreshRankingCode(result['data']);
          this.ranking_setting = result['saveData'];
        }
      });
    } else {
      //无选中，默认当前页

      const publisherData = this.getParentPublishers(this.rows);

      const params = {
        ranking_setting: this.ranking_setting,
        publisherCount: publisherData['publisherCount']
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
        nzComponentParams: params
      });
      rankingModal.afterClose.subscribe(result => {
        if (isObject(result) && result['status'] === 'ok') {
          this.refreshRankingCode(result['data']);
          this.ranking_setting = result['saveData'];
        }
      });
    }
  }

  stopRanking() {
    if (!isNull(this.refreshRankingObserver)) {
      this.refreshRankingObserver.unsubscribe();
      this.refreshRankingSetting.status = 'stop';
    }
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

    this.refreshRankingObserver = this.refreshRankingSingleComplete$.subscribe(
      item => {
        this.refreshRankingSetting.currentIndex++;
        if (
          this.refreshRankingSetting.currentIndex + 1 >
          this.refreshRankingSetting.allCount
        ) {
          // -- return
          this.refreshRankingSetting.status = 'stop';
        } else {
          this.initRankingCode(setting, this.refreshRankingObserver);
        }
      }
    );
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
    this.startGetRankingCode(
      setting,
      this.refreshRankingSetting.rankingData[readyIndex],
      readyIndex,
      originObserver
    );
  }

  startGetRankingCode(setting, row, index, originObserver) {
    const queryParams = {};
    const detailInfo = {};

    detailInfo['chan_pub_id'] = row['chan_pub_id'];
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
    this.dataViewService
      .getRankingCode({ detail_info: detailInfo }, queryParams)
      .subscribe(resultData => {
        if (resultData['status_code'] === 200) {
          this.rows[rowIndex]['ranknow'] = resultData['data']['ranknow'];
          this.rows[rowIndex]['rank_1'] = resultData['data']['rank_1'];
          this.rows[rowIndex]['rank_2'] = resultData['data']['rank_2'];
          this.rows[rowIndex]['rank_3'] = resultData['data']['rank_3'];
          this.rows[rowIndex]['rank_4'] = resultData['data']['rank_4'];
          this.rows[rowIndex]['ranking_device'] = resultData['data']['device'];
          this.rows[rowIndex]['ranking_time'] = resultData['data']['time'];
          this.rows[rowIndex]['region_name'] =
            resultData['data']['region_name'];
          this.rows[rowIndex]['html_id'] = resultData['data']['html_id'] || '';
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
    data.forEach(item => {
      if (!publishers.hasOwnProperty(item.publisher_id)) {
        publishers[item.publisher_id] = 1;
        publisherArray.push({
          name: item['publisher'],
          value: item['publisher_id'] * 1
        });
        number++;
      }
    });
    return {
      publisher_array: publisherArray,
      publisherCount: number
    };
  }

  refreshPrice() {
    const postData = [];
    let i = 0;
    this.rows.forEach(item => {
      postData.push({
        chan_pub_id: item['chan_pub_id'],
        pub_account_id: item['pub_account_id'],
        pub_keyword_id: item['pub_keyword_id'],
        index: i
      });
      i++;
    });
    this.dataViewService
      .getKeywordPrice({ ids: postData, field: ['price'] })
      .subscribe(result => {
        if (result['status_code'] && result['status_code'] === 200) {
          this.showKeywordPrice(result['data']);
        }
      });
  }

  showKeywordPrice(priceList: any[]) {
    priceList.forEach(item => {
      if (
        this.pageInfo.currentPageCount >= item['index'] &&
        this.rows.length > 0
      ) {
        const operData = this.rows[item['index']];
        if (
          operData['chan_pub_id'] === item['chan_pub_id'] &&
          operData['pub_keyword_id'] === item['pub_keyword_id']
        ) {
          this.rows[item['index']]['real_time_price'] = item['price'];
        }
      }
    });
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
      source: 'keyword',
      source_data: {
        chan_pub_id: row['chan_pub_id'],
        pub_keyword_id: row['pub_keyword_id']
      }
    };

    const select_uid = this.authService.getCurrentUserOperdInfo()['select_uid'];
    const select_cid = this.authService.getCurrentUserOperdInfo()['select_cid'];

    let frame: number;
    row['ranking_device'] * 1 === 1 ? (frame = 0) : (frame = 1);

    this.clickReal = true;
    if (row['html_status'] * 1 !== 2) {
      row['realLoading'] = true; //实况页面第一次请求中
      this.dataViewService.checkRankingHtml(parm).subscribe(result => {
        if (result['status_code'] === 200) {
          window.open(
            environment.SERVER_API_URL +
            '/publisher_base/get_html?html_id=' +
            result['data']['html_id'] +
            '&frame=' +
            frame +
            '&user_id=' +
            select_uid +
            '&cid=' +
            select_cid
          );
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

  batchUpload() {
    const add_modal = this.modalService.create({
      nzTitle: '导入' + this.$folderLevelName[this.folderLevel],
      nzWidth: 800,
      nzContent: BatchUploadComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        folderId: this.folderId,
        folderLevel: this.folderLevel,
      }
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        // this.refreshData();
      }

      if (result['can_jump'] === true) {
        this.can_nav = true;
      } else if (result['can_jump'] === false) {
        this.can_nav = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.rows = [];
    this.refreshRankingSingleComplete$.unsubscribe();
  }

  openDataAnalysis(row) {
    this.chartItems = this.reportItemService.getChartItem();
    row['analysis'] = true;
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
    } else {
      return 90;
    }

    return 50;
  }
  reloadFirstPage() {
    this.pageInfo.currentPage = 1;
    this.reloadData();
  }


}
