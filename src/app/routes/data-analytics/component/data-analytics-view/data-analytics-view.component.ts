import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild, ViewEncapsulation,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationData, NzNotificationService } from 'ng-zorro-antd/notification';
import { LocalStorageService } from "ngx-webstorage";
import { deepCopy, isNull, isObject, isUndefined } from "@jzl/jzl-util";
import { TableItemService } from '../../../../module/table-setting/service/table-item.service';
import { AuthService } from '../../../../core/service/auth.service';
import { NotifyService } from '../../../../module/notify/notify.service';
import { TableTimeComponent } from '../../../../module/table-time/components/table-time/table-time.component';
import { generateTimeResult, generateTimeTip } from '@jzl/jzl-util';
import { DataViewTableComponent } from '../../../../shared/baseClass/DataViewTableComponent';
import { MenuService } from '../../../../core/service/menu.service';
import { DataAnalyticsService } from './../../service/data-analytics.service';
import { TableQueryComponent } from '../../../../module/table-setting/components/table-query/table-query.component';
import { TableQueryFeedComponent } from '../../../../module/table-setting/components/table-query/table-query-feed.component';
// 其他文件service
import { ReportService } from '../../../report/service/report.service';
import { TableItemFeedService } from "../../../../module/table-setting/service/table-item-feed.service";
// 其他文件service-sem
import { ViewItemService as ViewItemServiceSem } from '../../../data-view/service/view-item.service';

// 其他文件service-feed
import { ViewItemService as ViewItemServiceFeed } from '../../../data-view-feed/service/view-item.service';


@Component({
  selector: 'app-data-analytics-view',
  templateUrl: './data-analytics-view.component.html',
  styleUrls: ['../../../../../styles/routes/routes.scss', './data-analytics-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TableItemService, TableItemFeedService, ViewItemServiceSem, ViewItemServiceFeed],
})
export class DataAnalyticsViewComponent extends DataViewTableComponent implements OnInit, OnDestroy {
  @ViewChild('childTable') childTable; //父组件中获得子组件的引用

  public dimensions = [];
  public dimensionMap = {};
  public selectedMetricAry = [];
  public selectedMetric = ['pub_click', 'pub_cost', 'pub_impression', 'pub_cpc'];
  public chartTabIndex = 0;
  public chart_config = {
    "analysis_dimension": 'dimension',
    "is_showYAxis": true,
    "is_multiYAxis": 'multi',
    "sort_type": '2',
    "sort_setting": [{ sort_key: null, sort_dir: 'desc' }],
    "data_setting": 'top',
    "top_val": 500,
    "top_metric": 'pub_cost',
    "bar_show_type": 'blank',
    'unit_type': 'myriad',
    "split_by_fields": true,//是否按维度拆分
    'dimensions': [],//biz的维度项
    'scatter_setting': {
      x: 'pub_cost', y: 'pub_click', z: 'pub_cost',//散点图x轴、y轴、z轴设置
      symbolSize: [6, 50],
      is_quadrant: true,
      lt: '低x轴高y轴', rt: '高x轴高y轴', lb: '低x轴低y轴', rb: '高x轴低y轴',//四象限名称
      ltColor: '#ffffff', rtColor: '#f8f8f8', lbColor: '#f8f8f8', rbColor: '#ffffff',//四象限颜色
      axis: 'center',
      xAxis: 0,
      yAxis: 0,
      tooltipBtn: {
        title: '显示详情',
        method: 'checkDetail',
        nameKey: '',
      },
    },
    "grain": 'data_date',
    metrics: ['pub_impression', 'pub_click'],//选择的指标
  };

  public chartTabList = [
    { title: '效果衡量', key: 'type_effect', chartType: 'scatter', grain: 'data_dimension', chart_config: deepCopy(this.chart_config) },
  ];

  public chartSetting = {
    "chart_name": "",
    "chart_type": "line",
    "date_range": "day:1:6",
    "date_compare_range": 'day:8:6',
    "is_compare": false,
    "size": "normal",
    "data_range": [],
    "grain": 'data_dimension',
    "metrics": [],
    "by_fields": [],
    "conditions": [],
    "chart_config": deepCopy(this.chart_config),
  };
  public viewTableData = {
    report_type: 'basic_report',
    summary_type: 'account',
    selected_items: [],
    selected_items_chart: [],
    locked_items: [],
    condition: [],
    single_condition: [],
    sort_item: { key: 'pub_cost', dir: 'desc' },
    data_range: [],
    all_summary: false,
    is_compare: false,
    summary_date: 'day:1:6',
    summary_date_compare: 'day:8:6',
    summary_date_alias: '',
    summary_date_compare_alias: '',
    other_compare_date_list: [],
    time_grain: 'summary',
    hours_split: [],
    main_range: 'leftJoin',
    main_device: 'all',
    hidden_condition: false,
    conversion_type: null,
    arrangement_style: 'horizontal' //vertical:竖表  horizontal：横表
  };
  public selectedChartType = this.chartTabList[0].chartType;//当前默认选中图表类型
  public selectedChartKey = null;//当前默认选中图表key
  public isChartChange = true;//切换图表时的间隔
  public isCardChange = true;//改变卡片指标时的间隔

  private sub = new Subscription();
  public showChartType = 'day';
  public chartItems = [];
  public isJump = '';
  public onlyTableShow = false;//仅看表格,不展示图表
  public filterNoImpression = false;
  private noImpressionNotifyId: NzNotificationData;

  public currentUser;
  public userOperdInfo;
  public localChartConfigKey;

  public group_type = '';//报告分组类型
  public showDetailKey = '';//显示详情
  public defaultOperate = {
    multiValue: '=',
    singleList: '=',
    multiList: 'in',
  };
  private viewItemService;
  constructor(
    private injector: Injector,
    private tableItemService: TableItemFeedService,
    public reportService: ReportService,
    public authService: AuthService,
    public _message: NzMessageService,
    private modalService: NzModalService,
    public localSt: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
    public notifyService: NotifyService,
    private notification: NzNotificationService,
    public menuService: MenuService,
    public dataAnalyticsService: DataAnalyticsService,
    private cdRef: ChangeDetectorRef,
  ) {
    super(localSt, authService, menuService, notifyService, _message, reportService);
    if (this.menuService.currentChannelId === 1) {
      this.viewItemService = this.injector.get(ViewItemServiceSem);
    } else {
      this.viewItemService = this.injector.get(ViewItemServiceFeed);
    }
    const summaryTypes = this.tableItemService.getSummaryTypes('basic_report');
    summaryTypes.forEach(element => { this.dataAnalyticsService.summary_type_name[element.key] = element.name; });
    this.userSelectedOper = this.authService.getCurrentUserOperdInfo();
    this.route.data.subscribe((data) => {
      this.viewTableData['summary_type'] = data['summaryType'];
      this.viewTableData['sub_summary_type'] = data['summaryType'];
      this.source_summary = data['summaryType'];
      this.group_type = data['group_type'];
    });
    this.chartItems = this.viewItemService.getChartItem();
    this.currentUser = this.authService.getCurrentUser();
    this.userOperdInfo = this.authService.getCurrentUserOperdInfo();
    this.localChartConfigKey = 'analytics_chart_config_' + this.source_summary + '_' + this.currentUser.user_id + '_' + this.userOperdInfo.select_uid + '_' + this.userOperdInfo.select_cid + '_' + this.menuService.currentPublisherId;

    // 除了账户计划，其他图表只有效果分析
    if (['publisher', 'account', 'campaign'].indexOf(this.source_summary) !== -1) {
      this.chartTabList.push(
        { title: '时间趋势', key: 'type_time', chartType: 'line', grain: 'data_date', chart_config: Object.assign(deepCopy(this.chart_config), { "split_by_fields": false }) },
        { title: '地域', key: 'type_region', chartType: 'bar', grain: 'data_dimension', chart_config: deepCopy(this.chart_config) },
      )
    }

    // ocpc没有数据图表
    if (this.group_type == 'ocpc_report') {
      this.onlyTableShow = true;
    }
  }


  ngOnInit() {
    // 获取biz维度信息
    if (this.source_summary.startsWith('biz_unit_') || ['publisher', 'account', 'campaign'].indexOf(this.source_summary) !== -1) {
      const DimensionInfo = this.dataAnalyticsService.getDimensions(this.source_summary);
      this.dimensions = deepCopy(DimensionInfo.dimensions);
      this.dimensionMap = deepCopy(DimensionInfo.dimensionMap);
      // 初始化chart_config的维度项，默认全选
      this.chartTabList.forEach(chartTab => {
        if (['publisher', 'account', 'campaign'].indexOf(this.source_summary) !== -1) {
          //媒体、账户、计划的地域维度
          chartTab.chart_config.dimensions = ['province'];
        } else {
          chartTab.chart_config.dimensions = Object.keys(this.dimensionMap);
        }
      });
    }

    // 获取图表配置信息
    this.getAnalyticsChartConfig();
    setTimeout(() => {
      Object.assign(this.viewTableData, this.childTable.viewTableData);
      this.viewTableData['is_compare'] = true;
      this.generateTimeShow();
      this.refreshChart();
      this.changeChartTab(this.chartTabList[0]);
      this.changeSelectedMetric();
    }, 0);
  }

  // 保存图表配置信息
  setAnalyticsChartConfig() {
    const chartConfigObj = {};
    this.chartTabList.forEach(chartTab => {
      chartConfigObj[chartTab.key] = chartTab.chart_config;
    });
    const data = {
      onlyTableShow: this.onlyTableShow,//图表显示
      selectedMetric: this.selectedMetric,//卡片指标
      chartConfigObj: chartConfigObj,//储存图表chart_config
    }
    this.localSt.store(this.localChartConfigKey, data);
  }

  // 获取图表配置信息
  getAnalyticsChartConfig() {
    const data = this.localSt.retrieve(this.localChartConfigKey);
    if (data) {
      this.onlyTableShow = data['onlyTableShow'];
      this.selectedMetric = data['selectedMetric'];
      this.chartTabList.forEach(chartTab => {
        if (data['chartConfigObj'] && data['chartConfigObj'][chartTab.key]) {
          Object.assign(chartTab.chart_config, data['chartConfigObj'][chartTab.key]);
          let availableDimensions = [];
          if (chartTab.chart_config.dimensions) {
            chartTab.chart_config.dimensions.forEach(element => {
              if (this.dimensionMap[element]) {
                availableDimensions.push(element);
              }
            });
          }
          if (availableDimensions.length === 0) {
            if (['publisher', 'account', 'campaign'].indexOf(this.source_summary) !== -1) {
              //媒体、账户、计划的地域维度
              availableDimensions = ['province'];
            } else {
              availableDimensions = Object.keys(this.dimensionMap);
            }
          }
          chartTab.chart_config.dimensions = availableDimensions;
        }
      });
    }
  }

  changeDate() {
    const add_modal = this.modalService.create({
      nzTitle: '时间选择',
      nzWidth: this.viewTableData['summary_type'] === 'biz_unit_account_hours' ? 800 : 600,
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
        summary_time_attr: this.viewTableData.hours_split,
        isCompare: this.viewTableData['is_compare'],
        canAddCompare: true,//有对比
        is_summary_time: this.viewTableData['summary_type'] === 'biz_unit_account_hours',
        summary_type: this.viewTableData['summary_type'],
        isAnalysis: true,
      }
    });
    add_modal.afterClose.subscribe(result => {
      if (result.dataType && result.dataType === 'time') {
        this.viewTableData = Object.assign(this.viewTableData, result['data']);
        this.generateTimeShow();
        this.refreshChart();

        // 子组件table方法
        const childCompare = this.childTable.viewTableData['is_compare'];
        this.childTable.viewTableData = Object.assign(this.childTable.viewTableData, result['data']);
        this.childTable.viewTableData['is_compare'] = childCompare;
        this.childTable.changeDate();
      }
    });
  }

  mainRangeChange(event) {
    setTimeout(() => {
      this.pageInfo.currentPage = 1;
      if (this.source_summary == 'keyword' && this.viewTableData['main_range'] == 'no_impression') {
        this.filterNoImpression = true;
        this.showNoImpressionInfo();
      } else {
        this.filterNoImpression = false;
        this.clearNoImpressionNotify();
      }
      // this.reloadData(true);
    });
  }

  timeRangeChange(event) {
    //当汇总选择分日时，展现默认 有展现 并且不让选择
    if (this.time_grain_filter !== 'summary' && this.source_summary !== 'search_keyword') {
      this.viewTableData['main_range'] = 'join';
    }

    //选择的只要有分时，报告类型传 hours_report ， 否则 传 basic_report
    if (this.time_grain_filter === 'hour' || this.time_grain_filter === 'hour_day') {
      this.viewTableData.report_type = 'hours_report';
    } else if (this.time_grain_filter === 'region' || this.time_grain_filter === 'region_day') {
      this.viewTableData.report_type = 'region_report';
    } else {
      this.viewTableData.report_type = 'basic_report';
    }

    //选择的只要有分日，汇总传 day ， 否则 传 合计summary
    if (this.time_grain_filter === 'day' || this.time_grain_filter === 'hour_day' || this.time_grain_filter === 'region_day') {
      this.viewTableData.time_grain = 'day';
    } else if (this.time_grain_filter === 'week' || this.time_grain_filter === 'weekSplit' || this.time_grain_filter === 'month') {
      this.viewTableData.time_grain = this.time_grain_filter;
    } else {
      this.viewTableData.time_grain = 'summary';
    }

    if (this.viewTableData.report_type === 'hours_report') {
      this.viewTableData.summary_type = JSON.parse(JSON.stringify(this.source_summary)) + '_hour';
    } else if (this.viewTableData.report_type === 'region_report') {
      this.viewTableData.summary_type = JSON.parse(JSON.stringify(this.source_summary)) + '_region';
    } else {
      this.viewTableData.summary_type = this.source_summary;
    }
    this.time_grain = this.time_grain_filter;

    setTimeout(() => {
      // this.refreshFields(this.viewTableData['selected_items']);
      // this.reloadFirstPage();
    });
  }


  generateTimeShow() {
    this.timeDesc = generateTimeTip(this.viewTableData['summary_date'], this.viewTableData['summary_date_compare'], this.viewTableData['is_compare']);
  }

  generateTime() {
    return generateTimeResult(this.viewTableData['summary_date'], this.viewTableData['summary_date_compare'], this.viewTableData['is_compare']);
  }

  generateHour() {
    return { current: '0:00  至 24:00 ', compare: '' };
  }

  ngOnDestroy(): void {
    this.rows = null;
    this.sub.unsubscribe();
    this.clearNoImpressionNotify();
  }


  showNoImpressionInfo() {
    if (isUndefined(this.noImpressionNotifyId) || this.noImpressionNotifyId.state === 'leave') {
      this.noImpressionNotifyId = this.notification.create('info', '温馨提示',
        '无展现条件下关键词不支持排序，可进行筛选并批量编辑', { nzDuration: 0 });
    }
  }

  clearNoImpressionNotify() {
    if (!isUndefined(this.noImpressionNotifyId)) {
      this.notification.remove(this.noImpressionNotifyId.messageId);
      this.noImpressionNotifyId = undefined;
    }
  }


  // 修改选择指标
  changeSelectedMetric() {
    this.isCardChange = true;
    this.selectedMetricAry.length = 0;
    this.selectedMetric.forEach(key => {
      this.selectedMetricAry.push({
        ...this.chartItems.find(item => key == item.key),
        "publisher_id": "publisher_" + this.menuService.currentPublisherId,
        "publisher_name": "通用",
        "isSelected": true,
        "allSelected": {
          "compare": false,
          "compare_abs": false,
          "avg": false,
          "percentage": false
        },
        "config": "line"
      });
    });
    setTimeout(() => {
      this.isCardChange = false;
      this.setAnalyticsChartConfig();
    }, 0);
  }

  // 切换图表类型
  changeChartTab(chartTab) {
    this.isChartChange = true;
    this.selectedChartType = chartTab.chartType;
    this.selectedChartKey = chartTab.key;
    this.chartSetting.chart_name = '';
    this.chartSetting.grain = chartTab.grain;
    this.chartSetting.chart_config = chartTab.chart_config;
    this.setAnalyticsChartConfig();
    setTimeout(() => {
      this.isChartChange = false;
    }, 0);
  }

  // 图表显示隐藏（是否仅看表格）
  chartShowOrHide() {
    this.onlyTableShow = !this.onlyTableShow;
    this.setAnalyticsChartConfig();
    this.refreshChart();
  }

  // 修改配置刷新图表、卡片
  refreshChart() {
    this.isChartChange = true;
    this.isCardChange = true;
    this.chartSetting.date_range = this.viewTableData.summary_date;
    this.chartSetting.date_compare_range = this.viewTableData.summary_date_compare;
    this.chartSetting.is_compare = this.viewTableData.is_compare;
    this.chartSetting.conditions = [...this.viewTableData['condition']];
    // this.chartSetting.data_range.select_data = [...this.viewTableData['data_range']['select_data']];
    this.chartSetting.data_range = this.viewTableData['data_range'];
    // this.chartSetting.data_range.select_type = this.viewTableData['data_range']['select_type'];

    setTimeout(() => {
      this.isChartChange = false;
      this.isCardChange = false;
    }, 0);

  }

  showDetail(filterItem) {
    // 子组件table方法,先清空原有筛选
    this.childTable.viewTableData['condition'] = [];
    this.childTable.viewTableData['data_range']['select_data'] = [];
    this.childTable.viewTableData['single_condition'].forEach(item => {
      if (this.childTable.allFilterOption[item['key']]) {
        this.childTable.allFilterOption[item['key']]['filterResult'] = [];
      }
      if (this.childTable.allFilterOption[item['relishKey']]) {
        this.childTable.allFilterOption[item['relishKey']]['filterResult'] = [];
      }
    });

    if (this.source_summary.startsWith('biz_unit_')) {
      if (this.chartSetting.chart_config.dimensions) {
        this.chartSetting.chart_config.dimensions.forEach((key, i) => {
          let itemKey = this.dimensionMap[key]['nameKey'];
          if (this.dimensionMap[key]['nameKey'] === 'province_name') {
            itemKey = 'province_region';
          } else if (this.dimensionMap[key]['nameKey'] === 'city_name') {
            itemKey = 'city_region';
          } else if (this.dimensionMap[key]['nameKey'] === 'data_hour') {
            itemKey = 'hours';
          }

          const filterKey = this.childTable.allFilterOption[itemKey]['filterKey'];
          let value;
          if (filterKey['type'] === 'multiList' || filterKey['type'] === 'singleList') {
            value = filterItem[this.dimensionMap[key]['fieldKey']];
          } else {
            value = filterItem[itemKey];
          }
          this.setFilterResult(value, itemKey);
        });
      }
    } else {
      let key = this.dataAnalyticsService.all_locked_items['default']['key'];
      if (key === 'user_name') {//负责人
        key = 'belong_user_id';
      }
      this.setFilterResult(filterItem[key], this.dataAnalyticsService.all_locked_items['default']['key']);
    }

    this.childTable.reloadFirstPage();
    // 用ChangeDetectorRef驱动angular更新视图
    this.cdRef.detectChanges();
  }

  setFilterResult(value, itemKey) {
    const filterKey = this.childTable.allFilterOption[itemKey]['filterKey'];
    if ((value || (['hours', 'user_name'].indexOf(itemKey) !== -1 && value === 0)) && this.childTable.allFilterOption[itemKey]) {
      let resultValue;
      if (filterKey['type'] === 'singleList') {
        resultValue = value;
      } else {
        resultValue = [value];
      }

      this.childTable.allFilterOption[itemKey]['filterResult'] = {
        ...filterKey,
        "op": this.defaultOperate[filterKey['type']],
        "value": resultValue,
      };
    }
  }

  //高级筛选
  changeCondition() {
    let contentComponent: any;
    if (this.menuService.currentChannelId === 1) {
      contentComponent = TableQueryComponent;
    } else {
      contentComponent = TableQueryFeedComponent;
    }
    const add_modal = this.modalService.create({
      nzTitle: '筛选条件',
      nzWidth: 600,
      nzContent: contentComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        reportAnalytics: true,
        reportType: this.childTable.viewTableData['report_type'],
        summaryType: this.childTable.viewTableData['summary_type'],
        initCondition: this.childTable.viewTableData['condition'],
        dataRange: this.childTable.viewTableData['data_range'],
        tableData: this.childTable.viewTableData,
        lockItem: this.childTable.viewTableData['locked_items'],
      },
    });

    add_modal.afterClose.subscribe((result) => {
      if (result.dataType && result.dataType === 'query') {
        this.viewTableData['condition'] = result.condition;
        this.viewTableData['data_range'] = result.dataRange;
        this.childTable.viewTableData['condition'] = result.condition;
        this.childTable.viewTableData['data_range'] = result.dataRange;
        this.refreshChart();
        this.childTable.reloadFirstPage();
      }
    });
  }

  reloadData() {
    this.refreshChart();
    this.childTable.viewTableData['data_range'] = this.viewTableData['data_range'];
    this.childTable.viewTableData['condition'] = this.viewTableData['condition'];
    this.childTable.reloadData();
  }
}
