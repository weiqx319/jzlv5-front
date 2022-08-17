import { Component, EventEmitter, Input, OnInit, Output, OnChanges, OnDestroy } from '@angular/core';
import { isUndefined } from "@jzl/jzl-util";
import { deepCopy, formatDate, splitDate } from "@jzl/jzl-util";
import { ViewChartService } from "../service/view-chart.service";
import { Subscription } from "rxjs";
import { MenuService } from '../../../core/service/menu.service';
import {
  differenceInCalendarDays, endOfMonth,
  endOfWeek, endOfYear, format,
  startOfMonth,
  startOfWeek, startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears
} from "date-fns";
import { DateDefineService } from "../../../shared/service/date-define.service";
import { LocalStorageService } from "ngx-webstorage";
@Component({
  selector: 'app-view-chart',
  templateUrl: './view-chart.component.html',
  styleUrls: ['./view-chart.component.scss'],
  providers: [ViewChartService]
})
export class ViewChartComponent implements OnInit, OnChanges, OnDestroy {
  private sub = new Subscription();
  constructor(
    private _http: ViewChartService,
    private menuService: MenuService,
    public dateDefineService: DateDefineService,
    private localSt: LocalStorageService,
  ) {
  }
  @Input() edit_from: any = 'chartBtn';

  @Input() is_refresh: any;
  @Input() chartItems = [];
  // @Input() is_compare: any;
  @Input() resultData = [];
  @Input() chartType: any;
  @Input() selectedItem1: any;
  @Input() optimizationId: any;
  @Input() folderId: any;
  @Input() viewTableData: any;
  @Output() chartSelectedItems: EventEmitter<any> = new EventEmitter<any>();
  @Output() closeCharts: EventEmitter<any> = new EventEmitter<any>();

  public selectedItem = [];
  public chartLoading = false;
  public chartOptions: any;
  public lineChartOptions: any;
  public barChartOptions: any;
  public today = new Date();
  public dateLists = [];
  public compareDateLists = [];
  public chartInitOpts = {
    // renderer: 'svg',
    // width: 300,
    height: 272
  };
  public chartItem = {
    lineChartData: [],
    barChartData: []
  };
  public lineChartData = [];
  public barChartData = [];
  //百度创意不展示分时数据
  public isBdCreative;

  public tableGroup = ['day', 'hour'];

  ngOnInit() {
    if (this.localSt.retrieve(this.viewTableData['summary_type'] + '_chartItem')) {
      this.chartItem = deepCopy(this.localSt.retrieve(this.viewTableData['summary_type'] + '_chartItem'));
    }
    this.isBdCreative = this.menuService.currentChannelId === 2 && this.menuService.currentPublisherId === 1;
    this.dateLists = this.dateDefineService.getDateList(this.viewTableData.summaryType, this.menuService.currentChannelId, this.menuService.currentPublisherId);
    this.changeSelectedDate(this.viewTableData.summary_date);
  }
  changeChartItem($event, type) {
    this.chartSelectedItems.emit(this.selectedItem);

    if (type === 'hour') {
      this.chartItem.barChartData = $event;
    } else {
      this.chartItem.lineChartData = $event;
    }
    this.refreshChartData(type);
  }



  closeChart() {
    this.closeCharts.emit('false');
  }
  refreshChartData(type = 'day', click = false) {
    this.viewTableData.selected_items_chart = [];
    if (!this.chartItem.lineChartData.length) {
      this.chartItem.lineChartData.push(this.chartItems[0].key);
    }
    if (!this.chartItem.barChartData.length) {
      this.chartItem.barChartData.push(this.chartItems[0].key);
    }

    if (type === 'hour') {
      this.selectedItem = this.chartItem.barChartData;
    } else {
      this.selectedItem = this.chartItem.lineChartData;
    }

    this.selectedItem.forEach(changeItem => {
      const selectObj = this.chartItems.find(item => item.key === changeItem);
      this.viewTableData.selected_items_chart.push(selectObj);
    });
    if (this.viewTableData.selected_items_chart.length === 0) {
      this.viewTableData.selected_items_chart = [this.chartItems[0]];

    }
    // -- 获取表格数据
    if (this.chartType === type && click) {
      return;
    }
    this.chartType = type;
    const postTableSetting = JSON.parse(JSON.stringify(this.viewTableData));

    if (this.viewTableData.summary_date === 'custom') {
      postTableSetting.summary_date = this.viewTableData.summary_date;
    }
    if (this.viewTableData.summary_date_compare === 'custom') {
      postTableSetting.summary_date_compare = this.viewTableData.summary_date_compare;
    }

    postTableSetting['time_grain'] = 'day';

    if (type === 'hour') {
      postTableSetting['report_type'] = 'hours_report';
      postTableSetting['metrics'] = [{ is_x: true, key: "data_hour", name: "小时", order: 0, type: "bar" }];
    } else if (type === 'day') {
      postTableSetting['metrics'] = [{ is_x: true, key: "data_date", name: "日期", order: 0, type: "line" }];
    }
    JSON.parse(JSON.stringify(this.viewTableData.selected_items_chart)).forEach(item => {
      item['is_x'] = false;
      item['order'] = 0;
      type = 'hour' ? item['type'] = 'bar' : item['type'] = 'line';
      postTableSetting['metrics'].push(item);
    });

    if (this.optimizationId) {
      postTableSetting['filter_optimization_ids'] = [this.optimizationId];
    }
    if (this.folderId) {
      postTableSetting['filter_folder_ids'] = [this.folderId];
    }


    const chartData = { sheets_setting: { table_setting: postTableSetting } };

    this.chartLoading = true;
    this.resultData = [];
    this.getViewChartData(chartData, this.chartType, this.viewTableData['selected_items_chart']);
  }
  getViewChartData(chartData, type, selectItem) {
    this.sub.add(
      this._http.getViewChartData(chartData, {}).subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            this.resultData = result['data'];
            if (type === 'hour') {
              this.showHourChart(selectItem, this.viewTableData.is_compare, this.resultData, 'bar');
            } else {
              this.showDataDateChart(selectItem, this.viewTableData.is_compare, this.resultData, 'line');
            }
            this.chartLoading = false;
          }
        },
        (err: any) => {
          this.chartLoading = false;

        },
        () => {
          this.chartLoading = false;
        }
      )
    );
  }
  public showHourChart(selectedItems, is_compare, data, chartType = 'bar') {
    const dataDateX = this.generateTime();
    const dataChart = {
      tooltip: {
        trigger: 'axis',
        textStyle: {
          fontSize: 10
        }

      },
      legend: {
        data: [],
        left: 'left'

      },
      grid: {
        left: '3%',
        // right: '2%',
      },
      textStyle: {
        fontSize: 10
      },
      xAxis: [],
      yAxis: [],
      color: ['#4cd3ea',
        '#fffe29',
        '#00ce74',
        '#89e183',
        '#ffa477',
        '#ff587d',
        '#f97ad3',
        '#ab58e5',
        '#ab89f0',
        '#5551cf',
        '#8890e9',
        '#3d5088',
        '#83b0ea',
        '#00a1ff',
        '#4cd3ea',
        '#00ceca',
        '#00e2be',
        '#ffbc29',
        '#ff6b5b'],
      series: []
    };

    const yAxisObj = {};
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
      dataChart.color = [
        '#4cd3ea',
        '#FFB816',
        '#B276FF'];
    }
    selectedItems.forEach(selectedItem => {
      if (is_compare) {
        legendKeyData[selectedItem.key] = { mooth: true, yAxisIndex: currentYAxis, name: selectedItem['name'], type: chartType, data: [], barMaxWidth: 50 };
        legendKeyData[selectedItem.key + '_compare'] = {
          smooth: true,
          yAxisIndex: currentYAxis,
          name: selectedItem['name'],
          type: chartType,
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
        legendKeyData[selectedItem.key] = { smooth: true, yAxisIndex: currentYAxis, name: dataDateX['current'] + selectedItem['name'], type: chartType, data: [], barMaxWidth: 50 };
        dataChart.legend.data.push(dataDateX['current'] + selectedItem['name']);
      }
      let maxValue = 0;
      chartDataDetail.forEach((detail) => {
        if (!isSetXAxisData) {
          xAxisObject['data'].push(detail['current']['data_hour']);
        }
        legendKeyData[selectedItem.key]['data'].push({ value: Number(detail['current'][selectedItem.key]), 'hours': detail['current']['data_hour'] });
        maxValue = Math.max(maxValue, Number(detail['current'][selectedItem.key]));
        if (is_compare) {
          legendKeyData[selectedItem.key + '_compare']['data'].push({ value: Number(detail['compare'][selectedItem.key]), 'hours': detail['compare']['data_hour'] });
          maxValue = Math.max(maxValue, Number(detail['compare'][selectedItem.key]));
        }
      });

      isSetXAxisData = true;
      dataChart.xAxis = [xAxisObject];
      yAxisObj[selectedItem.key] = {
        type: 'value',
        axisLabel: {
          fontSize: 10,
          color: '#7f7f7f'
        },
        boundaryGap: [0, 0],
        splitLine: {
          show: false
        },
        offset: 0,
        nameTextStyle: { color: '#7f7f7f' },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e4e4e4"
          }
        }
      };
      yAxisObj[selectedItem.key]['offset'] = currentYAxis > 1 ? (currentYAxis - 1) * 40 : 0;
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
          yAxisObj[selectedItem.key]['axisLabel']['formatter'] = function (value) {
            return value / 1000;
          };
        }

      }
      currentYAxis++;
    });

    dataChart['yAxis'] = Object.values(yAxisObj);
    // this.chartOptions = dataChart;
    this.barChartOptions = dataChart;
  }

  public showDataDateChart(selectedItems, is_compare, data, chartType = 'line') {
    const dataDateX = this.generateTime();
    const dataChart = {
      tooltip: {
        trigger: 'axis',
        textStyle: {
          fontSize: 10
        }
      },
      'legend': {
        data: [],
        left: 'left'

      },
      grid: {
        left: '3%',
        // right: '2%',
      },
      textStyle: {
        fontSize: 10
      },
      xAxis: [],
      yAxis: [],
      color: [],
      series: []
    };
    const yAxisObj = {};

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
      dataChart.color = [
        '#4cd3ea',
        '#FFB816',
        '#B276FF'];
    }
    selectedItems.forEach(selectedItem => {
      if (is_compare) {
        legendKeyData[selectedItem.key] = { smooth: true, yAxisIndex: currentYAxis, name: selectedItem['name'], type: chartType, data: [], barMaxWidth: 50 };
        legendKeyData[selectedItem.key + '_compare'] = {
          smooth: true,
          yAxisIndex: currentYAxis,
          name: selectedItem['name'],
          type: chartType,
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
        legendKeyData[selectedItem.key] = { smooth: true, yAxisIndex: currentYAxis, name: dataDateX['current'] + selectedItem['name'], type: chartType, data: [], barMaxWidth: 50 };
        dataChart.legend.data.push(dataDateX['current'] + selectedItem['name']);
      }
      let maxValue = 0;
      chartDataDetail.forEach((detail) => {
        if (!isSetXAxisData) {
          xAxisObject['data'].push(detail['current']['data_date']);
        }
        legendKeyData[selectedItem.key]['data'].push({ value: Number(detail['current'][selectedItem.key]), 'data_date': detail['current']['data_date'] });
        maxValue = Math.max(maxValue, Number(detail['current'][selectedItem.key]));
        if (is_compare) {
          legendKeyData[selectedItem.key + '_compare']['data'].push({ value: Number(detail['compare'][selectedItem.key]), 'data_date': detail['compare']['data_date'] });
          maxValue = Math.max(maxValue, Number(detail['compare'][selectedItem.key]));
        }
      });
      isSetXAxisData = true;
      dataChart.xAxis = [xAxisObject];
      yAxisObj[selectedItem.key] = {
        type: 'value',
        axisLabel: {
          fontSize: 10,
          color: '#7f7f7f'
        },
        boundaryGap: [0, 0],
        splitLine: {
          show: false
        },
        offset: 0,
        nameTextStyle: { color: '#7f7f7f' },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e4e4e4"
          }
        }
      };
      yAxisObj[selectedItem.key]['offset'] = currentYAxis > 1 ? (currentYAxis - 1) * 40 : 0;
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
          yAxisObj[selectedItem.key]['axisLabel']['formatter'] = function (value) {
            return value / 1000;
          };
        }

      }
      currentYAxis++;
    });
    dataChart['yAxis'] = Object.values(yAxisObj);
    // this.chartOptions = dataChart;
    this.lineChartOptions = dataChart;
  }

  generateTime() {
    let resultTimeShow = '';
    let resultTimeShowCompare = '';
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
        resultTimeShowCompare += compareTimeStart;
      } else {
        resultTimeShowCompare += compareTimeStart + '至' + compareTimeEnd;
      }
    }
    return { current: resultTimeShow, compare: resultTimeShowCompare };
  }

  ngOnChanges() {
    // this.tableGroup.forEach((item) => {
    //   this.refreshChartData(item);
    // });
  }


  ngOnDestroy(): void {
    this.localSt.store(this.viewTableData['summary_type'] + '_chartItem', this.chartItem);
    this.sub.unsubscribe();
  }

  getDisableDate = (current: Date): boolean => {
    //可以选择今天以前的90天
    return (
      differenceInCalendarDays(current, this.today) >= 0 ||
      differenceInCalendarDays(current, this.today) < -90
    );
  }

  changeSelectedDate(dateKey): void {
    if (this.viewTableData.summary_date_compare === 'custom_init') {
      this.viewTableData.summary_date_compare = 'custom';
    }
    this.compareDateLists = this.dateDefineService.getCompareDateList(dateKey);
    this.viewTableData.summary_date_range = this.splitDate(
      dateKey,
      this.viewTableData.summary_date_range,
    );

    if (this.viewTableData.summary_date_compare !== 'custom') {
      if (this.compareDateLists[1]) {
        this.viewTableData.summary_date_compare = this.compareDateLists[1]['key']; // @todo 阿里组件bug
      } else {
        this.viewTableData.summary_date_compare = 'custom'
      }
      this.viewTableData.summary_date_compare_range = this.splitDate(
        this.viewTableData.summary_date_compare,
        this.viewTableData.summary_date_compare_range,
      );
    }
    this.changeDate();
  }

  changeCompare(event) {
    this.tableGroup.forEach((item) => {
      this.refreshChartData(item);
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
  changeDate() {
    if (this.viewTableData.summary_date.indexOf('custom') === 0) {
      this.viewTableData.summary_date =
        'custom:' +
        format(this.viewTableData.summary_date_range[0], 'yyyy-MM-dd') +
        ':' +
        format(this.viewTableData.summary_date_range[1], 'yyyy-MM-dd');
    }
    if (this.viewTableData.summary_date_compare.indexOf('custom') === 0) {
      this.viewTableData.summary_date_compare =
        'custom:' +
        format(
          this.viewTableData.summary_date_compare_range[0],
          'yyyy-MM-dd',
        ) +
        ':' +
        format(
          this.viewTableData.summary_date_compare_range[1],
          'yyyy-MM-dd',
        );
    }
    this.tableGroup.forEach((item) => {
      this.refreshChartData(item);
    });
  }


}
