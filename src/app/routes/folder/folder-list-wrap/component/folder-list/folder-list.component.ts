import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { formatDate, splitDate } from "@jzl/jzl-util";
import { TableFieldComponent } from "../../../../../module/table-setting/components/table-field/table-field.component";

import { ReportService } from '../../../../report/service/report.service';
import { FolderItemService } from '../../../service/folder-item.service';
import { FolderService } from '../../../service/folder.service';
import { NotifyService } from '../../../../../module/notify/notify.service';
import { AuthService } from '../../../../../core/service/auth.service';
import { TableTimeComponent } from '../../../../../module/table-time/components/table-time/table-time.component';
import { EditMessageComponent } from '../../../../../module/edit-message/edit-message.component';
import { EditFolderNameComponent } from '../../../modal/edit-folder-name/edit-folder-name.component';
import { DataViewTableComponent } from '../../../../../shared/baseClass/DataViewTableComponent';
import { MenuService } from '../../../../../core/service/menu.service';

@Component({
  selector: 'app-folder-list',
  templateUrl: './folder-list.component.html',
  styleUrls: ['./folder-list.component.scss']
})
export class FolderListComponent extends DataViewTableComponent implements OnInit {

  @Input() tableHeight: any;
  // public tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;

  public rowHeight = 40;
  public orderInfo: any = {};

  public loadingIndicator = false;
  public loadingCountIndicator = false;
  public reorderable = true;
  public defaultSortItems = [{ prop: 'create_time', dir: 'desc' }];


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



  private addModal = null;
  public addFolderSetting = {
    folder_name: '',
  };
  public creating = false;
  public allFilterOption: any;
  public allTypePublisher: any;

  @ViewChild('chkHeader', { static: true }) chkHeader: TemplateRef<any>;
  @ViewChild('chkCell', { static: true }) chkCell: TemplateRef<any>;
  @ViewChild('rateCell', { static: true }) rateCell: TemplateRef<any>;
  @ViewChild('creativeCell', { static: true }) creativeCell: TemplateRef<any>;
  @ViewChild('folderNameTpl', { static: true }) folderNameCell: TemplateRef<any>;
  @ViewChild('rateCellColor', { static: true }) rateCellColor: TemplateRef<any>;
  @ViewChild('cellColor', { static: true }) cellColor: TemplateRef<any>;

  @ViewChild('filterHeader', { static: true }) filterHeader: TemplateRef<any>;


  constructor(private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    public reportService: ReportService,
    private folderService: FolderService,
    private optimizationItemService: FolderItemService,
    public authService: AuthService,
    public notifyService: NotifyService,
    public _message: NzMessageService,
    public menuService: MenuService,
    public localSt: LocalStorageService) {

    super(localSt, authService, menuService, notifyService, _message, reportService);
    this.viewTableData['summary_type'] = 'folder_list';
    this.route.data.subscribe((data) => {
      this.viewTableData['sub_summary_type'] = data['summaryType'];
    });

    this.allFilterOption = this.optimizationItemService.getItemFilterType(this.viewTableData['summary_type']);

  }

  ngOnInit() {
    this.viewTableData['sort_item'] = { 'key': 'create_time', 'dir': 'desc' };
    this.viewTableData['selected_items'] = this.optimizationItemService.getDefaultItemsBySummaryType(this.viewTableData['summary_type']);
    this.viewTableData['locked_items'] = this.optimizationItemService.getLockedItemsBySummaryType(this.viewTableData['summary_type']);
    // --- 获取默认
    const localMarkInfo = this.getLocalBookMark('', this.viewTableData['summary_type']);
    this.refreshFields(this.viewTableData['selected_items']);
    this.generateTimeShow();
    this.refreshData();
    this.refreshCount();

    this.getTypePublisher();
  }


  createFolderModal(content): void {
    this.addModal = this.modalService.create({
      nzTitle: '添加分组',
      nzWidth: 600,
      nzContent: content,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
  }

  createFolder(): void {
    if (!this.creating) {
      this.creating = true;
      this.addFolderSetting['folder_level'] = this.viewTableData['sub_summary_type'];
      this.folderService.createFolder(this.addFolderSetting).subscribe(result => {
        if (result['status_code'] === 200) {
          this.creating = false;
          this.message.success('分组创建成功');
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
      if (popKey === 'folder_name') {
        tplHeader['cellTemplate'] = this.folderNameCell;
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
    this.folderService.getViewList(postData, {
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
    const postData = { sheets_setting: { table_setting: this.viewTableData } };
    this.folderService.getViewList(postData, { is_count: 1 }).subscribe(
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

  getTypePublisher() {
    this.folderService.getTypePublisher().subscribe((result) => {
      if (result.status_code && result.status_code === 200) {
        this.allTypePublisher = result['data'];
      }
    }, (err: any) => {

    },
      () => {
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
        this.reloadData();
      }
    });
  }

  reloadData() {
    this.setLocalBookMark('', this.viewTableData['summary_type'], {
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


  delFolder(folderId?: any) {
    const postBody = { folder_ids: [] };
    if (isUndefined(folderId)) {
      this.selected.forEach(data => {
        postBody.folder_ids.push(data.folder_id);
      });
      if (postBody.folder_ids.length > 0) {
        this.folderService.delFolder(postBody).subscribe((result: any) => {
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
    } else {
      postBody.folder_ids.push(folderId);
      this.folderService.delFolder(postBody).subscribe((result: any) => {
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
    }
  }





  editNameBtn() {
    if (!this.selected.length) {
      this.message.warning('请选择分组');
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
      nzContent: EditFolderNameComponent,
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
          nzTitle: '分组名重复',
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



}
