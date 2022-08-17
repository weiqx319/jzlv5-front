import { Component, HostListener, Input, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { DataViewComponent } from "../../data-view.component";
import { NzModalService } from "ng-zorro-antd/modal";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { ActivatedRoute, Router } from "@angular/router";
import { TableItemService } from "../../../../module/table-setting/service/table-item.service";
import { ItemSelectService } from "../../../../module/item-select/service/item-select.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { DataViewOptimizationService } from "../../service/data-view-optimization.service";
import { AuthService } from "../../../../core/service/auth.service";
import { LocalStorageService } from "ngx-webstorage";
import { NzMessageService } from "ng-zorro-antd/message";
import { DataViewFolderService } from "../../service/data-view-folder.service";
import { DataViewService } from "../../service/data-view.service";
import { ViewItemService } from "../../service/view-item.service";
import { ReportService } from "../../../report/service/report.service";
import { isUndefined } from "@jzl/jzl-util";
import { MenuService } from "../../../../core/service/menu.service";

@Component({
  selector: 'app-data-view-drawer',
  templateUrl: './data-view-drawer.component.html',
  styleUrls: ['./data-view-drawer.component.scss']
})
export class DataViewDrawerComponent extends DataViewComponent implements OnInit {
  @Input() data;

  @Input() source_summary;

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
    public menuService: MenuService,) {
    super(dataViewService, viewItemService, tableItemService, itemSelectService, reportService, authService, _message, modalService, localSt, router, route, notifyService, renderer, optimizationService, folderService, notification, menuService);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 65 - 30;
  }

  ngOnInit() {
    this.viewReportSetting.report_name = '自定义报表-' + this.summary_type_name[this.source_summary];
    this.viewTableData['sort_item'] = { key: 'pub_cost', dir: 'desc' };
    this.viewTableData['selected_items'] = this.viewItemService.getDefaultItemsBySummaryType(this.source_summary);
    this.viewTableData['locked_items'] = this.viewItemService.getLockedItemsBySummaryType(this.source_summary);
    this.endLocked_items = this.viewItemService.getEndLockedItemsBySummaryType(this.source_summary);

    this.allFilterOption = JSON.parse(JSON.stringify(this.viewItemService.getItemFilterType(this.source_summary)));
    this.getFolderList();
    // --- 获取默认
    const localMarkInfo = this.getLocalBookMark(this.source_summary);
    if (localMarkInfo === null) {
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

      if (this.source_summary !== 'ocpc_360' && this.source_summary !== 'ocpc_baidu' && this.source_summary !== 'ocpc_baidu_report') {
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
      this.changeSelectedBookMark(localMarkInfo['sheets_setting']);
    }
  }

  refreshData(fromMark = false) {
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
      tmpViewTableData['selected_items'].push({
        data_type: 'pub_attr_data',
        key: 'publisher_id',
        showKey: 'publisher',
        selected: { current: true }
      });
    }
    tmpViewTableData.summary_type = this.source_summary;
    if (this.source_summary === 'ocpc_baidu_report') {
      tmpViewTableData.data_range = {
        select_type: "baidu_ocpc_package",
        select_data: [this.data['publisher_id'] + '_' + this.data['chan_pub_id'] + '_' + this.data['pub_target_package_id']]
      };
    } else {
      tmpViewTableData.data_range = {
        select_type: "360_ocpc_package",
        select_data: [this.data['publisher_id'] + '_' + this.data['chan_pub_id'] + '_' + this.data['pub_ocpc_id']]
      };
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
            if (!this.rows.find(item => item.summaryData)) {
              this.rows = [this.summaryData, ...this.rows];
            }
            //匹配模式
            this.rows.map((item, index) => {
              item.key = index;
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
    tmpViewTableData.summary_type = this.source_summary;
    if (this.source_summary === 'ocpc_baidu_report') {
      tmpViewTableData.data_range = {
        select_type: "baidu_ocpc_package",
        select_data: [this.data['publisher_id'] + '_' + this.data['chan_pub_id'] + '_' + this.data['pub_target_package_id']]
      };
    } else {
      tmpViewTableData.data_range = {
        select_type: "360_ocpc_package",
        select_data: [this.data['publisher_id'] + '_' + this.data['chan_pub_id'] + '_' + this.data['pub_ocpc_id']]
      };
    }
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
              this.refreshData();
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
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));
    tmpViewTableData.summary_type = this.source_summary;
    if (this.source_summary === 'ocpc_baidu_report') {
      tmpViewTableData.data_range = {
        select_type: "baidu_ocpc_package",
        select_data: [this.data['publisher_id'] + '_' + this.data['chan_pub_id'] + '_' + this.data['pub_target_package_id']]
      };
    } else {
      tmpViewTableData.data_range = {
        select_type: "360_ocpc_package",
        select_data: [this.data['publisher_id'] + '_' + this.data['chan_pub_id'] + '_' + this.data['pub_ocpc_id']]
      };
    }
    const postData = { sheets_setting: { table_setting: tmpViewTableData } };
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
}
