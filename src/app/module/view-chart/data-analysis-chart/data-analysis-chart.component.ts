import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { Subscription } from 'rxjs';
import { MenuService } from '../../../core/service/menu.service';
import { DateDefineService } from "../../../shared/service/date-define.service";
import { formatDate, splitDate } from '@jzl/jzl-util';
import { ViewChartService } from '../service/view-chart.service';

@Component({
  selector: 'app-data-analysis-chart',
  templateUrl: './data-analysis-chart.component.html',
  styleUrls: ['./data-analysis-chart.component.scss'],
  providers: [ViewChartService, DateDefineService],
})
export class DataAnalysisChartComponent
  implements OnInit, OnChanges, OnDestroy {
  private sub = new Subscription();
  constructor(
    private _http: ViewChartService,
    public dateDefineService: DateDefineService,
    private menuService: MenuService,
  ) { }

  @Input() channelId = 0;
  @Input() publisherId = 0;
  @Input() chartItems = [];
  @Input() summaryType: any;
  @Input() rowData: any;
  // @Input() is_compare: any;
  public chartType: any = 'data_date';
  public chartInitOpts = {
    height: 272,
  };
  public dataAnalysisParm = {
    report_type: 'basic_report',
    summary_type: 'campaign',
    summary_date_range: [new Date(), new Date()],
    summary_date_compare_range: [new Date(), new Date()],
    is_compare: false,
    selected_items_chart: [
      {
        width: '112',
        name: '展现',
        key: 'pub_impression',
        data_type: 'pub_metric_data',
        type: 'number',
      },
    ],
    selected_items: [],
    locked_items: [],
    condition: [],
    single_condition: [],
    sort_item: { key: 'pub_cost', dir: 'desc' },
    data_range: {},
    all_summary: false,
    summary_date: 'day:1:6',
    summary_date_compare: 'day:8:6',
    time_grain: 'summary',
    main_range: 'leftJoin',
    main_device: 'all',
    hidden_condition: false,
  };
  public today = new Date();

  private ngIndex = [];

  private channelPublisherNgIndex: any = {

    '1_0': {
      optimization_detail_ranking: [
        'publisher_id',
        'chan_pub_id',
        'pub_account_id',
        'pub_campaign_id',
        'pub_adgroup_id',
        'pub_keyword_id',
      ],
      search_keyword: ['pub_query_id'],
      creative: [
        'publisher_id',
        'chan_pub_id',
        'pub_account_id',
        'pub_campaign_id',
        'pub_adgroup_id',
        'pub_creative_id',
      ],
      keyword: [
        'publisher_id',
        'chan_pub_id',
        'pub_account_id',
        'pub_campaign_id',
        'pub_adgroup_id',
        'pub_keyword_id',
      ],
      adgroup: [
        'publisher_id',
        'chan_pub_id',
        'pub_account_id',
        'pub_campaign_id',
        'pub_adgroup_id',
      ],
      campaign: [
        'publisher_id',
        'chan_pub_id',
        'pub_account_id',
        'pub_campaign_id',
      ],
      account: ['publisher_id', 'chan_pub_id', 'pub_account_id'],
      publisher: ['publisher_id'],
      advertiser: ['advertiser_id'],
      department: ['department'],
    },
    '2_1': {
      creative: [
        'publisher_id',
        'chan_pub_id',
        'pub_account_id',
        'pub_campaign_id',
        'pub_creative_id',
      ],
      adgroup: [
        'publisher_id',
        'chan_pub_id',
        'pub_account_id',
        'pub_campaign_id',
        'pub_adgroup_id',
      ],
      campaign: [
        'publisher_id',
        'chan_pub_id',
        'pub_account_id',
        'pub_campaign_id',
      ],
      keyword: [
        'publisher_id',
        'chan_pub_id',
        'pub_account_id',
        'pub_campaign_id',
        'pub_adgroup_id',
        'pub_keyword_id',
      ],
      account: ['publisher_id', 'chan_pub_id', 'pub_account_id'],
      publisher: ['publisher_id'],
      advertiser: ['advertiser_id'],
      department: ['department'],
    },
  };

  public dateLists = [];
  public compareDateLists = [];
  public tmpTimeSetting = {
    summary_date: '',
    summary_date_compare: '',
  };
  public tableSetting = [
    {
      key: 'data_date',
      field_name_key: 'data_date',
      report_type: 'basic_report',
      selectedItems: [],
      metrics: [{ is_x: true, key: 'data_date', name: '日期', type: 'line' }],
      index: 0,
      loadingStatus: false,
      resultData: [],
      type: 'line',
      parent: 'time',
      btn_text: '分日数据',
    },
    {
      key: 'data_hour',
      field_name_key: 'data_hour',
      report_type: 'hour_report',
      selectedItems: [],
      metrics: [{ is_x: true, key: 'data_hour', name: '小时', type: 'bar' }],
      index: 1,
      loadingStatus: false,
      resultData: [],
      type: 'bar',
      parent: 'time',
      btn_text: '分时数据',
    },
    {
      key: 'province_region',
      field_name_key: 'region_name',
      report_type: 'region_report',
      selectedItems: [],
      metrics: [
        { is_x: true, key: 'province_region', name: '省级地域', type: 'bar' },
      ],
      index: 0,
      loadingStatus: false,
      resultData: [],
      type: 'bar',
      parent: 'region',
      btn_text: '省级地域',
    },

    {
      key: 'city_region',
      field_name_key: 'region_name',
      report_type: 'region_report',
      selectedItems: [],
      metrics: [
        { is_x: true, key: 'city_region', name: '市级地域', type: 'bar' },
      ],
      index: 1,
      loadingStatus: false,
      resultData: [],
      type: 'bar',
      parent: 'region',
      btn_text: '市级地域',
    },
  ];

  public tableGroup = [
    {
      name: 'time',
      activeIndex: 0,
      activeFieldNameKey: 'data_date',
      activeSelectedItems: [],
      chartOptions: {},
      children: [],
    },
    {
      name: 'region',
      activeIndex: 0,
      activeFieldNameKey: 'province_region',
      activeSelectedItems: [],
      chartOptions: {},
      children: [],
    },
  ];

  public showRegionSummaryTypes = [
    'department',
    'advertiser',
    'publisher',
    'account',
    'campaign',
  ];
  ngOnInit() {
    //非广告、媒体、账户、计划下不展示地域,Feed下不展示地域
    if (this.menuService.currentChannelId === 2 || this.showRegionSummaryTypes.indexOf(this.summaryType) < 0) {
      this.tableGroup = this.tableGroup.filter((item) => item.name !== 'region');
    }
    //百度创意无分时数据
    if (this.menuService.currentChannelId === 2 && this.menuService.currentPublisherId === 1 && this.summaryType === 'creative') {
      this.tableSetting = this.tableSetting.filter((item) => item.field_name_key !== 'data_hour');
    }
    //数据分析按组划分
    this.tableGroup.forEach((item) => {
      item.children = [];
      this.tableSetting.map((ele) => {
        const parent = ele.parent;
        if (parent === item.name) {
          item.children.push(ele);
        }
      });
    });

    //仅关键词显示平均排名
    this.chartItems.forEach((item, index) => {
      if (this.summaryType !== 'keyword' && item.key === 'pub_avg_position') {
        this.chartItems.splice(index, 1);
      }
    });
    const channelPublisherKey = this.channelId + '_' + this.publisherId;
    if (this.channelPublisherNgIndex.hasOwnProperty(channelPublisherKey)) {
      this.ngIndex = this.channelPublisherNgIndex[channelPublisherKey];
    }
    this.dateLists = this.dateDefineService.getDateList(this.summaryType, this.menuService.currentChannelId, this.menuService.currentPublisherId);
    this.dataAnalysisParm.summary_type = this.summaryType;
    this.dataAnalysisParm.data_range = {
      select_type: this.summaryType,
      select_data: [this.getRowIds(this.summaryType)],
    };

    this.changeSelectedDate(this.dataAnalysisParm.summary_date);
  }
  changeSelectedDate(dateKey): void {
    if (this.dataAnalysisParm.summary_date_compare === 'custom_init') {
      this.dataAnalysisParm.summary_date_compare = 'custom';
    }
    this.compareDateLists = this.dateDefineService.getCompareDateList(dateKey);
    this.dataAnalysisParm.summary_date_range = this.splitDate(
      dateKey,
      this.dataAnalysisParm.summary_date_range,
    );

    if (this.dataAnalysisParm.summary_date_compare !== 'custom') {
      if (this.compareDateLists[1]) {
        this.dataAnalysisParm.summary_date_compare = this.compareDateLists[1]['key']; // @todo 阿里组件bug
      } else {
        this.dataAnalysisParm.summary_date_compare = 'custom'
      }
      this.dataAnalysisParm.summary_date_compare_range = this.splitDate(
        this.dataAnalysisParm.summary_date_compare,
        this.dataAnalysisParm.summary_date_compare_range,
      );
    }
    this.changeDate();
  }

  changeCompare(event) {
    this.tableGroup.forEach((item) => {
      this.refreshChartData(item.activeFieldNameKey);
    });
  }

  // 获取起止时间
  splitDate(timeStr: string, oldDataRang?: any): any {
    const timeArr = timeStr.split(':');
    const currentDate = new Date();
    const current_day = currentDate.getDay(); //获取今天是周几: 0(周日) ， 1(周一)， 2(周二) .. 依此类推；
    const current_date = currentDate.getDate();
    const current_month = currentDate.getMonth();

    if (timeArr[0] === 'day') {
      const largeDate = subDays(currentDate, +timeArr[1]);
      const minDate = subDays(largeDate, +timeArr[2]);
      return [minDate, largeDate];
    } else if (timeArr[0] === 'day_last_year') {
      const tmpDate = subDays(currentDate, +timeArr[1]);
      const largeDate = subYears(tmpDate, 1);
      const minDate = subYears(subDays(tmpDate, +timeArr[2]), 1);
      return [minDate, largeDate];

    } else if (timeArr[0] === 'week') {
      let startDate: any;
      let endDate: any;
      if (current_day === 1 && timeArr[1] === '0') { //如果选择本周并且当前（今天）的日期为本周的星期一
        startDate = startOfWeek(subWeeks(currentDate, +timeArr[1] + 1), { weekStartsOn: 1 });
        endDate = endOfWeek(subDays(startDate, +timeArr[2]), { weekStartsOn: 1 });
      } else {
        startDate = startOfWeek(subWeeks(currentDate, +timeArr[1]), { weekStartsOn: 1 });
        // timeArr[1] === '0'本周
        endDate = timeArr[1] === '0' ? subDays(currentDate, +1) : endOfWeek(subDays(startDate, +timeArr[2]), { weekStartsOn: 1 });
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'week_same_period') { //上周同期
      let startDate: any;
      let endDate: any;
      if (current_day === 1) { //如果当前（今天）的日期为本周的星期一，则'上周同期'取上一周的数据
        // 这是上上周的同期数据
        // startDate = startOfWeek(subWeeks(currentDate, +timeArr[1] + 1), { weekStartsOn: 1 });
        // endDate = endOfWeek(subDays(startDate, +timeArr[2]), { weekStartsOn: 1 });

        // 这是上周的数据
        startDate = startOfWeek(subWeeks(currentDate, +timeArr[1]), { weekStartsOn: 1 });
        endDate = endOfWeek(subDays(startDate, +timeArr[2]), { weekStartsOn: 1 });
      } else {
        startDate = startOfWeek(subWeeks(currentDate, +timeArr[1]), { weekStartsOn: 1 });
        endDate = subDays(currentDate, +8);
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'month') {
      let startDate: any;
      let endDate: any;
      if (current_date == 1 && timeArr[1] === '0') {//如果选择的是本月，并且今天是本月1号，则'本月'取上一月的数据
        startDate = startOfMonth(subMonths(currentDate, +timeArr[1] + 1));
        endDate = endOfMonth(subMonths(startDate, +timeArr[2]));
      } else {
        startDate = startOfMonth(subMonths(currentDate, +timeArr[1]));
        // timeArr[1] === '0'本月
        endDate = timeArr[1] === '0' ? subDays(currentDate, +1) : endOfMonth(subMonths(startDate, +timeArr[2]));
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'month_same_period') { //上月同期
      let startDate: any;
      let endDate: any;
      if (current_date == 1) {//如果是1号
        // 这是上上月的同期数据
        // startDate = startOfMonth(subMonths(currentDate, +timeArr[1] + 1));
        // endDate = subMonths(endOfMonth(subMonths(startDate, +timeArr[2] - 1)), +1);

        // 这是上月的数据
        startDate = startOfMonth(subMonths(currentDate, +timeArr[1]));
        endDate = endOfMonth(subMonths(startDate, +timeArr[2]));
      } else {
        startDate = startOfMonth(subMonths(currentDate, +timeArr[1]));
        endDate = subDays(subMonths(currentDate, 1), +1);
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'year') {
      let startDate: any;
      let endDate: any;
      if (current_month == 1 && current_date == 1 && timeArr[1] === '0') {//如果选择的是本年，并且今天是本年1月1号，则'本年'取上一年的数据
        startDate = startOfYear(subYears(currentDate, +timeArr[1] + 1));
        endDate = endOfYear(subYears(startDate, +timeArr[2]));
      } else {
        startDate = startOfYear(subYears(currentDate, +timeArr[1]));
        // timeArr[1] === '0'本年
        endDate = timeArr[1] === '0' ? subDays(currentDate, +1) : endOfYear(subYears(startDate, +timeArr[2]));
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'year_same_period') {//去年同期
      let startDate: any;
      let endDate: any;
      if (current_month == 1 && current_date == 1) {
        // 这是上上年的同期数据
        // startDate = startOfYear(subYears(currentDate, +timeArr[1] + 1));
        // endDate = endOfYear(subYears(startDate, +timeArr[2]));

        // 这是去年的数据
        startDate = startOfYear(subYears(currentDate, +timeArr[1]));
        endDate = endOfYear(subYears(startDate, +timeArr[2]));
      } else {
        startDate = startOfYear(subYears(currentDate, +timeArr[1]));
        endDate = subDays(subMonths(currentDate, 12), +1);
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'custom' && timeArr.length === 3) {
      const startDate = new Date(timeArr[1].replace(/-/g, "/"));
      const endDate = new Date(timeArr[2].replace(/-/g, "/"));
      return [startDate, endDate];
    } else {
      // == 组对时间
      return [...oldDataRang];
    }
  }

  getRowIds(summaryType) {
    const needId = [];
    this.ngIndex[summaryType].forEach((item) => {
      needId.push(this.rowData[item]);
    });
    return needId.join('_');
  }

  getDisableDate = (current: Date): boolean => {
    //可以选择今天以前的90天
    return (
      differenceInCalendarDays(current, this.today) >= 0 ||
      differenceInCalendarDays(current, this.today) < -90
    );
  }

  changeChartItem(parent) {
    const target = parent.children.find((v) => parent.activeIndex === v.index);
    target.selectedItems = parent.activeSelectedItems;
    this.chartType = target.key;
    this.refreshChartData(this.chartType);
  }
  //获取当前元素
  getTargetEle(key) {
    return this.tableSetting.find((v) => v.key === key);
  }
  //获取父级元素
  getParentEle(ele) {
    return this.tableGroup.find((v) => v.name === ele.parent);
  }

  changeDate() {
    if (this.dataAnalysisParm.summary_date.indexOf('custom') === 0) {
      this.tmpTimeSetting.summary_date =
        'custom:' +
        format(this.dataAnalysisParm.summary_date_range[0], 'yyyy-MM-dd') +
        ':' +
        format(this.dataAnalysisParm.summary_date_range[1], 'yyyy-MM-dd');
    } else {
      this.tmpTimeSetting.summary_date = this.dataAnalysisParm.summary_date;
    }
    if (this.dataAnalysisParm.summary_date_compare.indexOf('custom') === 0) {
      this.tmpTimeSetting.summary_date_compare =
        'custom:' +
        format(
          this.dataAnalysisParm.summary_date_compare_range[0],
          'yyyy-MM-dd',
        ) +
        ':' +
        format(
          this.dataAnalysisParm.summary_date_compare_range[1],
          'yyyy-MM-dd',
        );
    } else {
      this.tmpTimeSetting.summary_date_compare = this.dataAnalysisParm.summary_date_compare;
    }
    this.tableGroup.forEach((item) => {
      this.refreshChartData(item.activeFieldNameKey);
    });
  }

  refreshChartData(type = 'data_date', click = false) {
    const target = this.getTargetEle(type);
    const parent = this.getParentEle(target);
    parent.activeIndex = target.index;
    parent.activeFieldNameKey = target.key;
    target.loadingStatus = true;
    this.dataAnalysisParm.selected_items_chart = [];
    if (!target.selectedItems.length) {
      target.selectedItems.push(this.chartItems[0].key);
      parent.activeSelectedItems = target.selectedItems;
    }
    parent.activeSelectedItems = target.selectedItems;
    parent.activeSelectedItems.forEach((changeItem) => {
      const selectObj = this.chartItems.find((item) => item.key === changeItem);
      this.dataAnalysisParm.selected_items_chart.push(selectObj);
    });
    if (this.dataAnalysisParm.selected_items_chart.length === 0) {
      this.dataAnalysisParm.selected_items_chart = [this.chartItems[0]];
    }
    this.chartType = type;
    const postTableSetting = JSON.parse(JSON.stringify(this.dataAnalysisParm));

    if (this.dataAnalysisParm.summary_date === 'custom') {
      postTableSetting.summary_date = this.tmpTimeSetting.summary_date;
    }
    if (this.dataAnalysisParm.summary_date_compare === 'custom') {
      postTableSetting.summary_date_compare = this.tmpTimeSetting.summary_date_compare;
    }
    postTableSetting['time_grain'] = 'day';
    postTableSetting['report_type'] = target.report_type;
    postTableSetting['metrics'] = [target.metrics[0]];
    // postTableSetting['metrics'] = [
    //     { is_x: true, key: 'data_hour', name: '小时', order: 0, type: 'bar' }
    //   ];
    JSON.parse(
      JSON.stringify(this.dataAnalysisParm.selected_items_chart),
    ).forEach((item) => {
      item['is_x'] = false;
      item['order'] = 0;
      type = 'data_hour' ? (item['type'] = 'bar') : (item['type'] = 'line');
      postTableSetting['metrics'].push(item);
    });
    const chartData = { sheets_setting: { table_setting: postTableSetting } };
    target.resultData = [];
    this.sub.add(
      this._http.getViewChartData(chartData, {}).subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            target.resultData = result['data'];
            //绘制图表
            this.generateChart(
              this.dataAnalysisParm['selected_items_chart'],
              this.dataAnalysisParm.is_compare,
              target,
            );
            target.loadingStatus = false;
          }
        },
        (err: any) => {
          target.loadingStatus = false;

        },
        () => {
          target.loadingStatus = false;
        },
      ),
    );
  }
  public generateChart(selectedItems, is_compare, target) {
    const dataDateX = this.generateTime();
    const dataChart = {
      tooltip: {
        trigger: 'axis',
        textStyle: {
          fontSize: 10,
        },
      },
      legend: {
        type: 'scroll',
        data: [],
        bottom: 0,
      },
      grid: {},
      textStyle: {
        fontSize: 10,
      },
      xAxis: [],
      yAxis: [],
      color: [],
      series: [],
    };

    const yAxisObj = {};
    const chartDataDetail = target.resultData;
    const legendKeyData = {};

    const xAxisObject = {
      type: 'category',
      data: [],
      axisLabel: {
        fontSize: 10,
        color: '#7f7f7f',
      },
      nameTextStyle: { color: '#7f7f7f' },
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: '#e4e4e4',
        },
      },
    };
    let isSetXAxisData = false;
    let currentYAxis = 0;
    if (is_compare) {
      dataChart.color = [
        '#4cd3ea',
        // '#48EAB8',
        '#FFB816',
        // '#FF8737',
        '#B276FF',
        // '#d290bd',
      ];
      dataChart.tooltip['formatter'] = function (params) {
        const toolTipNameMap = {};
        const name = params[0].name.split('/')[0];
        const cmpName = params[0].name.split('/')[1] ? params[0].name.split('/')[1] : params[0].name.split('/')[0] + '_对比';
        let htmlStr = '<div class="tooltip-container"><table class="tooltip-box"><tr><th>指标/维度&emsp;</th><th>' + name + '&emsp;&emsp;&emsp;</th><th>' + cmpName + '</th></tr>';
        for (const item of params) {
          if (!toolTipNameMap[item.seriesName]) {
            toolTipNameMap[item.seriesName] = {
              name: item.seriesName,
              value: [],
              marker: item.marker,
            };
          }
          toolTipNameMap[item.seriesName].value.push(item.value);
        }
        const toolTipNameList = Object.values(toolTipNameMap);

        toolTipNameList.forEach(item => {
          htmlStr += '<tr><td>' + item['marker'] + item['name'] + '</td><td>' + item['value'][0] + '</td><td>' + item['value'][1] + '</td></tr>';
        });
        return htmlStr + '</table></div>';
      };
    } else {
      dataChart.color = ['#4cd3ea', '#FFB816', '#B276FF'];
    }
    selectedItems.forEach((selectedItem) => {
      if (is_compare) {
        legendKeyData[selectedItem.key] = {
          mooth: true,
          yAxisIndex: currentYAxis,
          name: selectedItem['name'],
          type: target.type,
          data: [],
          barMaxWidth: 50,
        };
        legendKeyData[selectedItem.key + '_compare'] = {
          smooth: true,
          yAxisIndex: currentYAxis,
          name: selectedItem['name'],
          type: target.type,
          data: [],
          barMaxWidth: 50,
          // bar
          itemStyle: {
            "opacity": 0.4,
            "borderType": "dashed",
          },
          // line
          lineStyle: {
            "width": 2,
            "type": "dotted"
          },
        };
        dataChart.legend.data.push(selectedItem['name']);
        // dataChart.legend.data.push(dataDateX['compare'] + selectedItem['name']);
      } else {
        legendKeyData[selectedItem.key] = {
          smooth: true,
          yAxisIndex: currentYAxis,
          name: dataDateX['current'] + selectedItem['name'],
          type: target.type,
          data: [],
          barMaxWidth: 50,
        };
        dataChart.legend.data.push(dataDateX['current'] + selectedItem['name']);
      }
      let maxValue = 0;
      chartDataDetail.forEach((detail) => {
        if (!isSetXAxisData) {
          xAxisObject['data'].push(detail['current'][target.field_name_key]);
        }
        legendKeyData[selectedItem.key]['data'].push({
          value: Number(detail['current'][selectedItem.key]),
          hours: detail['current'][target.field_name_key],
        });
        maxValue = Math.max(
          maxValue,
          Number(detail['current'][selectedItem.key]),
        );
        if (is_compare) {
          legendKeyData[selectedItem.key + '_compare']['data'].push({
            value: Number(detail['compare'][selectedItem.key]),
            hours: detail['compare'][target.field_name_key],
          });
          maxValue = Math.max(
            maxValue,
            Number(detail['compare'][selectedItem.key]),
          );
        }
      });

      isSetXAxisData = true;
      dataChart.xAxis = [xAxisObject];
      yAxisObj[selectedItem.key] = {
        type: 'value',
        axisLabel: {
          fontSize: 10,
          color: '#7f7f7f',
        },
        boundaryGap: [0, 0],
        splitLine: {
          show: false,
        },
        offset: 0,
        nameTextStyle: { color: '#7f7f7f' },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#e4e4e4',
          },
        },
      };
      yAxisObj[selectedItem.key]['offset'] =
        currentYAxis > 1 ? (currentYAxis - 1) * 40 : 0;
      dataChart.series = Object.values(legendKeyData);
      if (maxValue > 1000) {
        yAxisObj[selectedItem.key]['name'] = selectedItem['name'] + '(千)';
      } else {
        yAxisObj[selectedItem.key]['name'] = selectedItem['name'];
      }

      if (selectedItem['is_rate'] && selectedItem['is_rate'] > 0) {
        yAxisObj[selectedItem.key]['axisLabel']['formatter'] = function (value) {
          return value + '%';
        };
      } else {
        if (maxValue > 1000) {
          yAxisObj[selectedItem.key]['axisLabel']['formatter'] = function (
            value,
          ) {
            return value / 1000;
          };
        }
      }
      currentYAxis++;
    });

    dataChart['yAxis'] = Object.values(yAxisObj);
    this.getParentEle(target).chartOptions = dataChart;
  }

  generateTime() {
    let resultTimeShow = '';
    let resultTimeShowCompare = '';
    let summary_date = '';
    if (this.dataAnalysisParm.summary_date === 'custom') {
      summary_date = this.tmpTimeSetting.summary_date;
    } else {
      summary_date = this.dataAnalysisParm.summary_date;
    }
    const originTime = splitDate(summary_date);
    const resultTimeStart = formatDate(originTime[0]);
    const resultTimeEnd = formatDate(originTime[1]);
    if (resultTimeStart === resultTimeEnd) {
      resultTimeShow += resultTimeStart;
    } else {
      resultTimeShow += resultTimeStart + '至' + resultTimeEnd;
    }
    if (this.dataAnalysisParm['is_compare']) {
      let summary_date_compare = '';
      if (this.dataAnalysisParm.summary_date_compare === 'custom') {
        summary_date_compare = this.tmpTimeSetting.summary_date_compare;
      } else {
        summary_date_compare = this.dataAnalysisParm.summary_date_compare;
      }
      const compareTime = splitDate(summary_date_compare);
      const compareTimeStart = formatDate(compareTime[0]);
      const compareTimeEnd = formatDate(compareTime[1]);
      if (compareTimeStart === compareTimeEnd) {
        resultTimeShowCompare += compareTimeStart;
      } else {
        resultTimeShowCompare += compareTimeStart + '至' + compareTimeEnd;
      }
    }
    return { current: resultTimeShow, compare: resultTimeShowCompare };
  }

  ngOnChanges() {
    // this.refreshChartData(this.chartType);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
