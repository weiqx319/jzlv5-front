import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LocalStorageService } from "ngx-webstorage";
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { ReportService } from "../../../report/service/report.service";
import { OptimizationItemService } from "../../service/optimization-item.service";
import { OptimizationService } from "../../service/optimization.service";
import { AddOptimizationGroupTplComponent } from "../add-optimization-group-tpl/add-optimization-group-tpl.component";

@Component({
  selector: 'app-optimization-group-tpl',
  templateUrl: './optimization-group-tpl.component.html',
  styleUrls: ['./optimization-group-tpl.component.scss'],
})
export class OptimizationGroupTplComponent implements OnInit {

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

  public rank_option = {
    1001: '左1', 1002: '左2', 1003: '左3', 1004: '左4', 1005: '左5',
    3001: "上1", 3002: "上2", 3003: "上3", 4001: "下1", 4002: "下2", 4003: "下3"
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
  public settingDesc = '';
  public dataMessages = {
    emptyMessage: `
    <div class="empty-content">
      <span>无符合要求的数据</span>
    </div>
  `,
  };
  publisherTypeListName = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马',
  };
  public editParameter = {
    selected_type: '',
    selected_data: [],
    allViewTableData: {},
    edit_source: true, //记录编辑来源 true：编辑  false：点击开关
  };
  public viewTableData = {
    report_type: 'basic_report',
    summary_type: 'optimization_group',
    selected_items: [],
    selected_items_chart: [],
    locked_items: [],
    condition: [],
    single_condition: [],
    sort_item: { key: 'create_time', dir: 'desc' },
    data_range: [],
    is_compare: false,
    summary_date: 'day:1:6',
    summary_date_compare: 'day:8:6',
    time_grain: 'summary',
    main_range: 'leftJoin',
  };

  private addModal = null;
  public addOptimizationGroup = {
    optimization_name: '',
    optimization_type: 1,
    publisher_id: 1,
  };
  public creating = false;
  public allFilterOption: any;
  public allTypePublisher: any;

  @ViewChild('chkHeader', { static: true }) chkHeader: TemplateRef<any>;
  @ViewChild('chkCell', { static: true }) chkCell: TemplateRef<any>;
  @ViewChild('rateCell') rateCell: TemplateRef<any>;
  @ViewChild('creativeCell') creativeCell: TemplateRef<any>;
  @ViewChild('optimizationNameTpl') optimizationNameCell: TemplateRef<any>;
  @ViewChild('optimizationOverdueCountTpl') optimizationOverdueCountCell: TemplateRef<any>;
  @ViewChild('rateCellColor') rateCellColor: TemplateRef<any>;
  @ViewChild('cellColor') cellColor: TemplateRef<any>;

  @ViewChild('filterHeader') filterHeader: TemplateRef<any>;
  constructor(private modalService: NzModalService,
    private message: NzMessageService,
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
    this.refreshData();

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

  refreshTableSize(event = 'resize') {
    // window.dispatchEvent(new Event(event));
  }

  // -- 数据相关 -- start
  refreshData(fromMark = false) {
    this.loadingIndicator = true;
    this.pageInfo.loadingStatus = 'pending';
    this.optimizationService.getRankTplList({
      count: this.pageInfo.pageSize,
      page: this.pageInfo.currentPage,
    }).subscribe(
      (results: any) => {
        if (results.status_code && results.status_code === 200) {
          this.loadingIndicator = false;
          this.rows = results['data']['detail'];
          this.setTplDesc(this.rows);
          this.pageInfo.currentPageCount = results['data']['detail'].length;
          this.pageInfo.allCount = results['data']['detail_count'];
          this.selected = [];
          this.pageInfo.loadingStatus = 'success';
          this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>无符合要求的数据</span>
    </div>
  `;
        } else {
          this.pageInfo.loadingStatus = 'error';
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
        this.loadingIndicator = false;
        this.pageInfo.loadingStatus = 'error';
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
    );
  }

  setTplDesc(data) {
    data.forEach((item) => {
      const model_title = (item['tpl_setting']['ranking_model'] === 1 ? '单次' : '循环');
      const interval_title = item['tpl_setting']['ranking_interval'] + 'min';
      let region = '';
      if (item['tpl_setting'].ranking_region_default) {
        region = '默认地域';
      } else {
        region = item['tpl_setting']['ranking_region']['province_name'] + item['tpl_setting']['ranking_region']['city_name'];
      }

      let priority = '';
      if (item['tpl_setting']['ranking_priority'] === 1) {
        priority = '低';
      } else if (item['tpl_setting']['ranking_priority'] === 2) {
        priority = '中';
      } else if (item['tpl_setting']['ranking_priority'] === 3) {
        priority = '高';
      }

      let setting = '(';
      item['tpl_setting']['data'].forEach((set_item) => {
        if (item['tpl_setting']['ranking_model'] === 2) {
          setting += (set_item['min'] + '-' + set_item['max'] + '，');
        }
        setting += (this.rank_option[set_item['ranking_left']] + '-' + this.rank_option[set_item['ranking_right']]) + '，';
        if (set_item['price_type'] === 1) {
          setting += (set_item['price_rate_min'] + '倍 - ' + set_item['price_rate_max'] + '倍且不超过' + set_item['price_rate_max_abs'] + '元；');
        } else if (set_item['price_type'] === 2) {
          setting += (set_item['price_left'] + '元 - ' + set_item['price_right'] + '元；');
        }
      });
      setting += ')';

      item['detail'] = model_title + '，' + interval_title + '，' + region + '，' + priority + '，' + setting;
    });
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
    this.viewTableData['sort_item'] = { key: orderKey, dir: sortInfo.dir };

    this.refreshData();
  }

  onSelect({ selected }) {

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  addOptimizationTpl() {
    const add_modal = this.modalService.create({
      nzTitle: '新建优化模版',
      nzWidth: 800,
      nzContent: AddOptimizationGroupTplComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe((result) => {
      if (result == 'onOk') {
        this.refreshData();
      }
    });
  }
  editOptimizationTpl(data) {
    const edit_modal = this.modalService.create({
      nzTitle: '编辑优化模版',
      nzWidth: 800,
      nzContent: AddOptimizationGroupTplComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        parentData: data,
      },
    });
    edit_modal.afterClose.subscribe((result) => {
      if (result == 'onOk') {
        this.refreshData();
      }
    });
  }

  deleteRankTpl() {
    const postBody = { tpl_ids: [] };
    this.selected.forEach((data) => {
      postBody.tpl_ids.push(data.tpl_id);
    });
    if (postBody.tpl_ids.length > 0) {
      this.optimizationService.deleteRankTpl(postBody).subscribe((result: any) => {
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

  }

}
