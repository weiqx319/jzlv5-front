import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { deepCopy, splitDate, formatDate } from '@jzl/jzl-util';
import { NzMessageService } from "ng-zorro-antd/message";
import { ChatOptionService } from "../../../shared/service/chat-option.service";
import { ViewChartService } from '../service/view-chart.service';
import { CustomDatasService } from '../../../shared/service/custom-datas.service';
import { DataAnalyticsService } from './../../../routes/data-analytics/service/data-analytics.service';

@Component({
  selector: 'app-analysis-chat',
  templateUrl: './analysis-chat.component.html',
  styleUrls: ['./analysis-chat.component.scss'],
  providers: [ViewChartService, DataAnalyticsService],
})
export class AnalysisChatComponent implements OnInit {
  @Input() chartType = 'scatter';
  @Input() chartKey = '';
  @Input() metricAry = [];
  @Input() summaryType = 'account';

  @Input() originalChartSetting = {};
  @Input() cardMetricAry = [];

  public dateRangeTip = '';//时间
  @Input() dimensions = [];//所有可选维度项
  @Input() dimensionMap = {};//所有维度项
  @Output() tooltipBtnFun = new EventEmitter();
  public dimensionAry: any[] = [
    {
      "name": "帐户",
      "key": "account",
      "parent_key": "level",
      "nameKey": "pub_account_name",
      "fieldKey": "chan_pub_id",
      "isSelected": true
    }
  ];
  public chartSetting = {
    "chart_name": "图表",
    "chart_type": "line",
    "date_range": "day:1:6",
    "date_compare_range": 'day:8:6',
    "is_compare": false,
    "size": "normal",
    "data_range": {
      "select_type": 'publisher',
      "select_data": []
    },
    "grain": 'data_date',
    "metrics": [],
    "by_fields": [],
    "conditions": [],
    "chart_config": {
      "analysis_dimension": 'dimension',
      "is_showYAxis": true,
      "is_multiYAxis": 'single',
      "sort_type": '2',
      "sort_setting": [{ sort_key: null, sort_dir: 'desc' }],
      "data_setting": 'top',
      "top_val": 500,
      "top_metric": 'pub_cost',//top指标
      "bar_show_type": 'blank',
      'unit_type': 'thousand',
      "split_by_fields": true,
      'dimensions': [],//已选维度项
      'scatter_setting': {
        x: 'pub_cost', y: 'pub_click', z: 'pub_cost',//散点图x轴、y轴、z轴设置
        symbolSize: [6, 50],
        is_quadrant: true,
        lt: '低x轴高y轴', rt: '高x轴高y轴', lb: '低x轴低y轴', rb: '高x轴低y轴',//四象限名称
        ltColor: '#ffffff', rtColor: '#f8f8f8', lbColor: '#f8f8f8', rbColor: '#ffffff',//四象限颜色
        axis: 'center',
        xAxis: 0,
        yAxis: 0
      },
      metrics: ['pub_impression', 'pub_click'],//指标
    }
  };
  // 粒度
  public grainList = [
    { name: "天", key: "data_date", parent_key: 'time' },
    { name: "小时", key: "data_hour", parent_key: 'time' },
    { name: "星期", key: "data_weekSplit", parent_key: 'time' },
    { name: "周", key: "data_week", parent_key: 'time' },
    { name: "月", key: "data_month", parent_key: 'time' },
    { name: "年", key: "data_year", parent_key: 'time' },
    // { name: "按维度", key: "data_dimension", parent_key: 'time' },
    { name: "合计", key: "summary", parent_key: 'time' },
  ];
  public chartLoading = false;
  public selectedMetricAry = [];
  public selectedMetric = [];
  public chartOption = {
    unit: '',
  };
  public cardVale = {

  };
  public chartCompareData = {};
  public sortTypeList = [
    { key: '0', name: '不排序' },
    { key: '1', name: '按维度' },
    { key: '2', name: '按指标' },
  ];

  private scatterTimer;//散点图配置修改计时器
  private getChartDataAjax;//图表请求

  constructor(
    public _message: NzMessageService,
    private chatOptionService: ChatOptionService,
    private viewChartService: ViewChartService,
    private dataAnalyticsService: DataAnalyticsService,
  ) {
    chatOptionService.tooltipEventListener.subscribe((res) => {
      this.tooltipBtnFun.emit(res);
    });
  }

  ngOnInit(): void {
    Object.assign(this.chartSetting, this.originalChartSetting);
    this.dimensionAry = [this.dataAnalyticsService.allDimensionObject[this.summaryType]];
    this.dateRangeTip = this.generateTimeTip(this.chartSetting.date_range, this.chartSetting.is_compare, this.chartSetting.date_compare_range, this.chartSetting.size, this.chartType !== 'scatter');
    this.getChartData();
  }

  ngOnDestroy() {
    if (this.scatterTimer) clearTimeout(this.scatterTimer);
  }

  refreshChartData() {
    this.getChartData();
  }

  chartConfigChange() {
    this.refreshChartData();
  }
  // 散点图设置修改
  scatterSettingChange(event?) {
    if (event !== 'delay') {
      this.refreshChartData();
    } else {
      // 散点图其他设置改变
      if (this.scatterTimer) clearTimeout(this.scatterTimer);
      if (this.getChartDataAjax) this.getChartDataAjax.unsubscribe();
      this.scatterTimer = setTimeout(() => {
        this.refreshChartData();
      }, 400);
    }
  }


  symbolSizeFormatter(value: number): string {
    return `${value}px`;
  }


  getChartData() {
    if (this.chartType === 'scatter') {
      const selectedMetricObj = {};
      // xyz指标
      const scatterSetting = this.chartSetting.chart_config.scatter_setting;
      selectedMetricObj[scatterSetting['x']] = scatterSetting['x'];
      selectedMetricObj[scatterSetting['y']] = scatterSetting['y'];
      if (scatterSetting['z']) {
        selectedMetricObj[scatterSetting['z']] = scatterSetting['z'];
      }
      //top指标
      selectedMetricObj[this.chartSetting.chart_config.top_metric] = this.chartSetting.chart_config.top_metric;
      this.selectedMetric = Object.values(selectedMetricObj);

      this.chartSetting.is_compare = false;
    } else {
      this.selectedMetric = [
        ...this.chartSetting.chart_config.metrics,
      ]
    }

    if (this.summaryType.startsWith('biz_unit_') || this.chartKey === 'type_region') {
      if (this.chartType === 'card') {
        this.dimensionAry = [...this.dimensions];
      } else {
        this.dimensionAry = [];
        this.chartSetting.chart_config.dimensions.forEach(item => {
          this.dimensionAry.push(this.dimensionMap[item])
        });
      }
    };

    this.getSelectedMetricAry();
    this.chartLoading = true;

    const copyChartSetting = deepCopy(this.chartSetting);

    const postData = {
      "chart_type": this.chartType,
      "date_range": this.chartSetting.date_range,
      "data_range": this.chartSetting.data_range,
      "date_compare_range": this.chartSetting.date_compare_range,
      "is_compare": this.chartSetting.is_compare,
      "grain": this.chartKey === 'type_time' ? copyChartSetting.chart_config['grain'] : this.chartSetting.grain,
      "chart_config": copyChartSetting.chart_config,
      "conditions": [...this.chartSetting.conditions],
      // "data_range": copyChartSetting.data_range,
      "metrics": [
        ...this.selectedMetricAry,
      ],
      "by_fields": copyChartSetting.chart_config.split_by_fields ? [...this.dimensionAry,] : []
    };

    if (this.chartType !== 'scatter') {
      // 数据项设置为全部
      postData.chart_config.data_setting = 'all';
      postData.chart_config.top_metric = '';
    }

    postData.metrics = this.chartType === 'card' ? [...this.cardMetricAry] : [...this.selectedMetricAry,];

    this.getChartDataAjax = this.viewChartService.getChartData(postData).subscribe(result => {
      if (result.status_code && result.status_code == 200) {
        // 如果没数据
        // if (result['data']['data'] && result['data']['data'].length === 0) {
        //   this._message.warning('当前条件无数据', { nzDuration: 3000 });
        // }

        let chartOption;//图表数据
        if (this.chartType !== 'card') {
          if (this.chartSetting.is_compare) {
            // 有对比
            chartOption = this.chatOptionService.createOption(result['data'], postData, 'cmp');
          } else {
            // 无对比
            chartOption = this.chatOptionService.createOption(result['data'], postData);
          }

        } else {
          // 卡片
          chartOption = {};
          const compareData = {};
          // 无数据情况
          if (result['data'].data.length === 0) {
            const data = {};
            this.cardMetricAry.forEach(element => {
              data[element.key] = null;
              data[element.key + '_cmp'] = null;
              data[element.key + '_abs'] = null;
              data[element.key + '_rat'] = 0;
            });
            result['data'].data.push(data)
          }
          
          this.cardMetricAry.forEach(item => {
            const copyPostData = deepCopy(postData);
            copyPostData.metrics = [item];
            const copyData = deepCopy(result['data']);

            copyData.meta.metrics = [item];
            chartOption[item.key] = this.chatOptionService.createOption(copyData, copyPostData);

            compareData[item.key] = {
              cmp: result['data']['data'][0][chartOption[item.key]['key'] + '_cmp'],
              abs: result['data']['data'][0][chartOption[item.key]['key'] + '_abs'],
              rat: result['data']['data'][0][chartOption[item.key]['key'] + '_rat'],
            };
            this.chartCompareData[item.key] = { ...this.chartCompareData[item.key], ...compareData[item.key] };
            this.cardVale[item.key] = {};
            this.cardVale[item.key]['conversion_value'] = this.generateCardValue(chartOption[item.key]['value']);
            this.cardVale[item.key]['conversion_cmp'] = this.generateCardValue(compareData[item.key].cmp);
            this.cardVale[item.key]['conversion_abs'] = this.generateCardValue(compareData[item.key].abs);
          });
        }

        this.chartOption = { ...chartOption };
        this.chartLoading = false;
      }
    });

  }

  generateCardValue(value) {
    let resultValue = '';
    let newValue = Number(value);

    if (newValue > 100000000 || newValue < -100000000) {
      newValue = newValue / 100000000;
      resultValue = newValue.toFixed(2) + '亿';
    } else if (newValue > 10000 || newValue < -10000) {
      newValue = newValue / 10000;
      resultValue = newValue.toFixed(2) + '万';
    } else {
      resultValue = newValue + '';
    }
    return resultValue;
  }

  sortTypeChange(event) {
    if (!this.chartSetting.chart_config.sort_setting || this.chartSetting.chart_config.sort_setting.length < 1) {
      this.chartSetting.chart_config.sort_setting = [{ sort_key: null, sort_dir: 'desc' }]
    }
    if (event === '1') {
      this.chartSetting.chart_config.sort_setting[0].sort_key = this.dimensionAry[0].key;
    } else if (event === '2') {
      this.chartSetting.chart_config.sort_setting[0].sort_key = this.selectedMetricAry[0].key;
    }
    this.chartConfigChange();
  }

  changeSelectedMetric() {
    this.selectedMetric = [
      ...this.chartSetting.chart_config.metrics,
    ]
    this.getSelectedMetricAry();
    this.chartConfigChange();
  }

  getSelectedMetricAry() {
    this.selectedMetricAry.length = 0;
    this.selectedMetric.forEach(key => {
      this.selectedMetricAry.push(this.metricAry.find(item => key == item.key));
    });
  }

  // 获取日期
  generateTimeTip(summaryDate, isCompare, summaryCompareDate, chartSize?, canCompare?) {
    let resultTimeShow = '';
    const originTime = splitDate(summaryDate);
    const resultTimeStart = formatDate(originTime[0]);
    const resultTimeEnd = formatDate(originTime[1]);

    const currentDate = new Date();
    const current_day = currentDate.getDay(); //获取今天是周几: 0(周日) ， 1(周一)， 2(周二) .. 依此类推；
    const current_date = currentDate.getDate();

    if (resultTimeStart === resultTimeEnd) {
      resultTimeShow += resultTimeStart;
    } else {
      resultTimeShow += resultTimeStart + '至' + resultTimeEnd;
    }
    if (isCompare && canCompare) {
      const compareTime = splitDate(summaryCompareDate);
      const compareTimeStart = formatDate(compareTime[0]);
      const compareTimeEnd = formatDate(compareTime[1]);
      if (compareTimeStart === compareTimeEnd) {
        resultTimeShow += ' 对比 ';

        if (chartSize === 'mini') {
          resultTimeShow += '<br/>';
        }

        resultTimeShow += compareTimeStart;
      } else {
        resultTimeShow += ' 对比 ';

        if (chartSize === 'mini') {
          resultTimeShow += '<br/>';
        }

        resultTimeShow += compareTimeStart + '至' + compareTimeEnd;
      }
    }
    return resultTimeShow;
  }

  // 粒度修改
  grainChange() {
    this.refreshChartData();
  }
}
