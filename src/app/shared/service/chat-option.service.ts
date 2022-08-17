import { Injectable } from '@angular/core';
import { deepCopy } from '@jzl/jzl-util';
import { Subject } from "rxjs";

declare var echarts: any;
@Injectable({
  providedIn: 'root'
})

export class ChatOptionService {
  public tooltipEventListener: Subject<boolean> = new Subject();

  constructor() { }

  private _themeColorSeries = {
    count_2: ['#4cd3ea', '#ffd44b'],
    count_3: ['#4cd3ea', '#ffd44b', '#89e183',],
    count_4: ['#4cd3ea', '#ffd44b', '#89e183', '#ff97e0'],
    count_5: ['#4cd3ea', '#ffd44b', '#89e183', '#83b0ea', '#ff97e0'],
    count_6: ['#ffd44b', '#89e183', '#56acef', '#ab89f0', '#5551cf', '#f97ad3'],
    all: ['#4cd3ea', '#00ce74', '#89e183', '#ffd44b', '#ffa477', '#ff587d', '#f97ad3', '#ab58e5', '#ab89f0', '#5551cf', '#8890e9', '#3d5088', '#83b0ea', '#00a1ff', '#4cd3ea', '#00ceca', '#00e2be', '#ffbc29', '#ff6b5b']
  };

  public grainList = [
    { name: "天", key: "data_date", parent_key: 'time' },
    { name: "小时", key: "data_hour", parent_key: 'time' },
    { name: "星期", key: "data_weekSplit", parent_key: 'time' },
    { name: "周", key: "data_week", parent_key: 'time' },
    { name: "月", key: "data_month", parent_key: 'time' },
    { name: "年", key: "data_year", parent_key: 'time' },
    { name: "按维度", key: "data_dimension", parent_key: 'time' },
  ];

  // 目标分析的粒度
  public okrGrainList = [
    { name: "按年", key: "summary", parent_key: 'time' },
    { name: "按月", key: "month_split", parent_key: 'time' },
    { name: "按月累积", key: "month_stack", parent_key: 'time' },
  ];
  // 目标分析的维度
  public okrShowTypes = [
    { name: "目标", key: "target" },
    { name: "达成", key: "current" },
    { name: "达成率", key: "completion_rate" },
  ];

  private dataChartCommon: any = {
    grid: {
      containLabel: true,
      top: '8%',
      bottom: '12%',
      left: '5%',
    },
    tooltip: {
      trigger: 'axis',
      textStyle: {
        fontSize: 10
      },
    },
    textStyle: {
      fontSize: 10
    },
    legend: {
      bottom: '1%',
      type: 'scroll',
      data: []
    },
    xAxis: [],
    yAxis: [{
      type: 'value',
      axisLabel: {
        fontSize: 10
      },
      splitLine: {
        show: false
      }
    }],
    color: this._themeColorSeries['all'],
    series: []
  };
  private xAxisObjectCommon = {
    type: 'category',
    data: [],
    axisLabel: {
      fontSize: 10,
      color: '#7f7f7f'
    },
    nameTextStyle: {
      color: '#7f7f7f'
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: "#e4e4e4"
      }
    },
    axisTick: {
      show: false
    },
  };
  private yAxisObjectCommon = {
    type: 'value',
    name: '',
    axisLabel: {
      fontSize: 10,
      color: '#7f7f7f'
    },
    show: true,
    nameTextStyle: {
      color: '#7f7f7f'
    },
    splitLine: {
      show: false
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: "#e4e4e4"
      }
    },
    axisTick: {
      show: true
    },
  };

  public createOption(data: any, dataOption: any, compareDataSource?: string, compareData?: any) {
    /**
     * compareDataSource：有对比的情况下必须传入compareDataSource，值为api或cmp（表示对比数据来源），无对比则不传
     *    api：对比的数据需第二次请求接口获取，需要传入compareData
     *    cmp：对比的数据从第一次请求的接口中读取xxx_cmp的数据，不需要传入compareData
     */
    let currentChartOption = {};
    if (!compareDataSource) {
      // 无对比
      currentChartOption = this.createOptionNew(data, dataOption);
    } else {
      // 有对比
      if (compareDataSource === 'cmp') {
        // 从第一次请求返回的数据中获取对比数据
        compareData = deepCopy(data);
        if (data['meta'].grain !== 'data_dimension' && dataOption.chart_type !== 'table') {
          if (data['meta'].by_fields.length > 0) {//按维度拆分
            compareData['meta']['metrics'].forEach(metrics => {
              for (const key in compareData['data']) {
                for (const dataKey in compareData['data'][key]['detail']) {
                  compareData['data'][key]['detail'][dataKey][metrics['key']] = data['data'][key]['detail'][dataKey][metrics['key'] + '_cmp'];
                }
              }
            })
          } else {//不拆分
            compareData['meta']['metrics'].forEach(metrics => {
              for (const key in compareData['data']) {
                compareData['data'][key][metrics['key']] = data['data'][key][metrics['key'] + '_cmp'];
              }
            })
          }
        } else {
          compareData['meta']['metrics'].forEach(metrics => {
            compareData['data'].forEach((dataDetail, i) => {
              dataDetail[metrics['key']] = data['data'][i][metrics['key'] + '_cmp'];
            });
          })
        }
      }
      const chartOption = this.createOptionNew(data, dataOption);
      const comPareChartOption = this.createOptionNew(compareData, dataOption);

      if (dataOption.chart_type === 'table') {
        //表格
        currentChartOption = deepCopy(chartOption);
        if (chartOption['list'] && comPareChartOption['list']) {
          chartOption['list'].forEach((element, i) => {
            const index = chartOption['list'].length - 1 - i;
            const cmpIndex = comPareChartOption['list'].length - 1 - i;
            currentChartOption['list'][index] = {};

            for (const key in element) {
              if (key.startsWith('data_')) {
                if (comPareChartOption['list'][cmpIndex] && compareDataSource === 'api') {
                  // compareDataSource === 'api'两次接口请求的数据，对比数据需要自己拼
                  currentChartOption['list'][index][key] = chartOption['list'][index][key] + ' 对比 ' + comPareChartOption['list'][cmpIndex][key];
                } else {
                  currentChartOption['list'][index][key] = chartOption['list'][index][key];
                }
              } else {
                currentChartOption['list'][index][key] = chartOption['list'][index][key];
                if (comPareChartOption['list'][cmpIndex] && data['meta']['metrics'].find(metrics => metrics.key === key)) {
                  currentChartOption['list'][index][key + '_对比'] = comPareChartOption['list'][cmpIndex][key];
                }
              }
            }
          });


        }
        if (chartOption['title'] && comPareChartOption['title']) {
          currentChartOption['title'] = []
          chartOption['title'].forEach((element, i) => {
            if (element['key'].startsWith('data_') || !data['meta']['metrics'].find(metrics => metrics.key === element['key'])) {
              currentChartOption['title'][i] = element;
            } else {
              currentChartOption['title'].push(element, {
                is_rate: comPareChartOption['title'][i]['is_rate'],
                key: comPareChartOption['title'][i]['key'] + '_对比',
                name: comPareChartOption['title'][i]['name'] + '_对比'
              })
            }
          });
        }

        // 如果对比时间数组比真实时间长
        const extraChartOptionList = comPareChartOption['list'].slice(0, comPareChartOption['list'].length - chartOption['list'].length)
        extraChartOptionList.reverse();
        if (extraChartOptionList.length > 0) {
          extraChartOptionList.forEach((extraItem) => {
            currentChartOption['list'].unshift({});
            for (const key in extraItem) {
              if (key.startsWith('data_')) {
                currentChartOption['list'][0][key] = '-- 对比 ' + extraItem[key];
              } else {
                if (data['meta']['metrics'].find(metrics => metrics.key === key)) {
                  currentChartOption['list'][0][key + '_对比'] = extraItem[key];
                } else {
                  currentChartOption['list'][0][key] = extraItem[key];
                }
              }
            }
          });
        }

      } else {

        if (dataOption.chart_type === "bar_h") {
          // 横向bar,先把x、y轴换过来
          const xAxis = chartOption['yAxis'];
          chartOption['yAxis'] = chartOption['xAxis'];
          chartOption['xAxis'] = xAxis;
          const cxAxis = comPareChartOption['yAxis'];
          comPareChartOption['yAxis'] = comPareChartOption['xAxis'];
          comPareChartOption['xAxis'] = cxAxis;
        }
        currentChartOption = deepCopy(chartOption);

        if (compareDataSource === 'api') {
          // 两次接口请求的数据，x轴数据需要自己拼
          // 合并xAxis数据
          chartOption['xAxis'][0]['data'].forEach((xData, i) => {
            const index = chartOption['xAxis'][0]['data'].length - 1 - i;
            const cmpIndex = comPareChartOption['xAxis'][0]['data'].length - 1 - i;
            if (comPareChartOption['xAxis'][0]['data'][cmpIndex]) {
              currentChartOption['xAxis'][0]['data'][index] = chartOption['xAxis'][0]['data'][index] + '/' + comPareChartOption['xAxis'][0]['data'][cmpIndex];
            }
          });

          // 如果对比时间数组比真实时间长
          const extraChartOption = comPareChartOption['xAxis'][0]['data'].slice(0, comPareChartOption['xAxis'][0]['data'].length - chartOption['xAxis'][0]['data'].length)
          if (extraChartOption.length > 0) {
            currentChartOption['xAxis'][0]['data'].unshift(...extraChartOption)
          }
        }

        // 合并yAxis数据
        if (comPareChartOption['series'].length > 0) {
          comPareChartOption['series'].forEach((seriesData, idx) => {
            if (seriesData.stack) {
              // 有堆积的情况
              comPareChartOption['series'][idx].stack = seriesData.stack + '-对比'
            }
            // line
            comPareChartOption['series'][idx]['lineStyle'] = {
              "width": 2,
              "type": "dotted"
            }
            // bar
            comPareChartOption['series'][idx]['itemStyle'] = {
              "opacity": 0.4,
              "borderType": "dashed",
            }
          });

          // 重置y轴显示数据
          chartOption['yAxis'].forEach((item, i) => {
            const rateUnit = item.is_rate ? '%' : '';//百分比单位
            currentChartOption['yAxis'][i]['axisLabel']['formatter'] = function (value) {
              return value + rateUnit;
            };
            if (item['name'] === comPareChartOption['yAxis'][i]['name']) {
              if (item['name'] && item['name'].indexOf('千') !== -1) {//图表和对比图表y轴单位都是‘千’
                currentChartOption['yAxis'][i]['axisLabel']['formatter'] = function (value) {
                  return value / 1000;
                };
              } else if (item['name'] && item['name'].indexOf('万') !== -1) {//图表和对比图表y轴单位都是‘万’
                currentChartOption['yAxis'][i]['axisLabel']['formatter'] = function (value) {
                  return value / 10000;
                };
              }
            } else {
              if (item['name'] && item['name'].indexOf('千') !== -1 || comPareChartOption['yAxis'][i]['name'].indexOf('千') !== -1) {
                // 图表和对比图表y轴单位有'千'
                currentChartOption['yAxis'][i]['axisLabel']['formatter'] = function (value) {
                  return value / 1000;
                };
                if (comPareChartOption['yAxis'][i]['name'].indexOf('千') !== -1) {
                  currentChartOption['yAxis'][i]['name'] = comPareChartOption['yAxis'][i]['name'];
                }
              }
              if (item['name'] && item['name'].indexOf('万') !== -1 || comPareChartOption['yAxis'][i]['name'].indexOf('万') !== -1) {
                // 图表和对比图表y轴单位有'万'
                currentChartOption['yAxis'][i]['axisLabel']['formatter'] = function (value) {
                  return value / 10000;
                };
                if (comPareChartOption['yAxis'][i]['name'].indexOf('万') !== -1) {
                  currentChartOption['yAxis'][i]['name'] = comPareChartOption['yAxis'][i]['name'];
                } else {
                  currentChartOption['yAxis'][i]['name'] = item['name'];
                }
              }
            }
          });

          currentChartOption['series'] = [];
          chartOption['series'].forEach((element, i) => {
            // 差值
            let difference = element['data'].length - comPareChartOption['series'][i]['data'].length;
            if (difference > 0) {
              for (let index = 0; index < difference; index++) {
                comPareChartOption['series'][i]['data'].unshift('');
              }
            } else if (difference < 0) {
              for (let index = 0; index < -difference; index++) {
                element['data'].unshift('');
              }
            }
            currentChartOption['series'].push(element, comPareChartOption['series'][i])
          });
        }
        const that = this;
        currentChartOption['tooltip']['formatter'] = function (params) {
          let toolTipNameMap = {};
          let name = params[0].name.split('/')[0];
          let cmpName = params[0].name.split('/')[1] ? params[0].name.split('/')[1] : params[0].name.split('/')[0] + '_对比'
          let htmlStr = '<div class="tooltip-container"><table class="tooltip-box"><tr><th>指标/维度&emsp;</th><th>' + name + '&emsp;&emsp;&emsp;</th><th>' + cmpName + '</th></tr>'
          params.forEach((item, i) => {
            if (!toolTipNameMap[item.seriesName]) {
              toolTipNameMap[item.seriesName] = {
                name: item.seriesName,
                value: [],
                marker: item.marker,
              }
            }
            const value = that.dealValueUnit(item.value, currentChartOption['series'][i].is_rate, dataOption);
            toolTipNameMap[item.seriesName].value.push(value);
          });

          let toolTipNameList = Object.values(toolTipNameMap);
          toolTipNameList.forEach(item => {
            htmlStr += '<tr><td>' + item['marker'] + item['name'] + '</td><td>' + item['value'][0] + '</td><td>' + item['value'][1] + '</td></tr>'
          })
          return htmlStr + '</table></div>';
        };

        if (dataOption.chart_type === "bar_h") {
          // 横向bar，把x、y轴换回去
          const currentXAxis = currentChartOption['yAxis'];
          currentChartOption['yAxis'] = currentChartOption['xAxis'];
          currentChartOption['xAxis'] = currentXAxis;
        }

      }
    }

    return currentChartOption;
  }


  createOptionNew(data: any, dataOption: any) {
    let chartOption = {};
    switch (dataOption.chart_type) {
      case 'line':
        chartOption = this.createLineOption(data, dataOption);
        this.dealChatOption(chartOption, dataOption);
        break;
      case 'bar':
        chartOption = this.createBarOption(data, dataOption);
        this.dealChatOption(chartOption, dataOption);
        break;
      case 'bar_h':
        chartOption = this.createBarHorizontalOption(data, dataOption);
        this.dealChatOption(chartOption, dataOption);
        break;
      case 'pie':
        chartOption = this.createPieOption(data, dataOption);
        break;
      case 'area':
        chartOption = this.createLineAreaOption(data, dataOption);
        this.dealChatOption(chartOption, dataOption);
        break;
      case 'card':
        chartOption = this.createCardOption(data, dataOption);
        break;
      case 'funnel':
        chartOption = this.createFunnelOption(data, dataOption);
        break;
      case 'scatter':
        chartOption = this.createScatterOption(data, dataOption);
        break;
      case 'table':
        chartOption = this.createTableData(data, dataOption);
        break;
    }
    return chartOption;
  }

  // 按维度分析-x轴设置：data数据处理
  private dealData(data) {
    const metaData = deepCopy(data['meta']);
    let chartDataDetail = data['data'];
    const byFields = metaData['by_fields'];
    const xDimensionKey = metaData.chart_config.xAxis ? metaData.chart_config.xAxis : 'flat';//设为x轴的维度

    let xDimension;//设为x轴的维度对象
    byFields.forEach(element => {
      if (element.key === xDimensionKey) {
        xDimension = element;
      }
    });
    const timeSeriesObj = {}

    if (metaData.grain === 'data_dimension' && xDimensionKey !== 'flat' && byFields.length > 1) {
      const dimensionKey = xDimension.fieldKey ? 'fieldKey' : 'key';
      const chartDataObj = {}
      // time_series
      const timeSeries = [];
      chartDataDetail.forEach(element => {
        if (!chartDataObj[element[xDimension[dimensionKey]]]) {
          chartDataObj[element[xDimension[dimensionKey]]] = { detail: [element] };
          chartDataObj[element[xDimension[dimensionKey]]][xDimensionKey] = element[xDimension[dimensionKey]];
          timeSeriesObj[element[xDimension[dimensionKey]]] = element[xDimension.nameKey];
          timeSeries.push(element[xDimension[dimensionKey]]);
        } else {
          chartDataObj[element[xDimension[dimensionKey]]].detail = [...chartDataObj[element[xDimension[dimensionKey]]].detail, element];
        }
      });
      const dataItemsMap = new Map();
      // data
      const currentData = deepCopy(chartDataObj);
      for (const key in chartDataObj) {
        currentData[key]['detail'] = {};
        chartDataObj[key]['detail'].forEach(element => {
          let fieldsKey = 'key_';
          let fieldsName = '';
          metaData.by_fields.forEach((field, i) => {
            if (field.key !== xDimensionKey) {
              const key = field.fieldKey ? field.fieldKey : field.key;
              fieldsKey = fieldsKey + element[key] + '_';
              fieldsName = fieldsName + element[field.nameKey] + '_';
            }
          });
          fieldsKey = fieldsKey.slice(0, fieldsKey.length - 1)
          fieldsName = fieldsName.slice(0, fieldsName.length - 1)
          currentData[key]['detail'][fieldsKey] = element;

          if (!dataItemsMap.has(fieldsKey)) {
            dataItemsMap.set(fieldsKey, { key: fieldsKey, name: fieldsName })
          }
        });
      }

      // data_items
      const dataItems = [...dataItemsMap.values()];
      metaData.grain = xDimensionKey;
      metaData.data_items = dataItems;
      metaData.time_series = timeSeries;
      chartDataDetail = currentData;
    }

    return { metaData, chartDataDetail, timeSeriesObj }
  }

  // 处理x轴、y轴单位
  private dealUnit(valueList, axisObject, axisName, metaData, isRate) {
    const rateUnit = isRate ? '%' : '';//百分比单位
    const maxValue = Math.max(...valueList);
    axisObject['is_rate'] = isRate;
    if (!isRate && maxValue > 10000 && metaData.chart_config.unit_type === 'myriad') {
      axisObject['name'] = axisName + '(万)';
      axisObject['axisLabel']['formatter'] = function (value) {
        return value / 10000;
      };
    } else if (!isRate && maxValue > 1000 && metaData.chart_config.unit_type !== 'myriad') {
      axisObject['name'] = axisName + '(千)';
      axisObject['axisLabel']['formatter'] = function (value) {
        return value / 1000;
      };
    } else {
      axisObject['name'] = axisName;
      axisObject['axisLabel']['formatter'] = function (value) {
        return value + rateUnit;
      };
    }
  }

  // 处理显示值的单位
  private dealValueUnit(value, isRate, metaData?) {
    value = isRate ? value + '%' : value;
    if (!isRate && parseFloat(value)) {
      value = parseFloat(value);
      if (metaData) {//可以设置单位
        if (value > 10000 && metaData.chart_config.unit_type === 'myriad') {
          value = (value % 10000 === 0 ? value / 10000 : (value / 10000).toFixed(2)) + '万';
        } else if (value > 1000 && metaData.chart_config.unit_type !== 'myriad') {
          value = (value % 1000 === 0 ? value / 1000 : (value / 1000).toFixed(2)) + '千';
        }
      } else {//不可以设置单位
        if (value > 10000) {
          value = (value % 10000 === 0 ? value / 10000 : (value / 10000).toFixed(2)) + '万';
        }
      }
    }
    return value;
  }

  // 处理最终图表数据
  private dealChatOption(dataChart, dataOption) {
    // 处理color
    if (dataChart.series.length >= 2 && dataChart.series.length <= 6) {
      dataChart.color = this._themeColorSeries['count_' + dataChart.series.length];
    }
    // data没数据的显示0
    dataChart.series.forEach((element, i) => {
      element.data.forEach((item, idx) => {
        if (!item) dataChart.series[i]['data'][idx] = '0';
      });
    });

    const that = this;
    // tooltip比率数据加'%'
    dataChart.tooltip['formatter'] = function (params) {
      let htmlStr = `<div>${params[0].axisValue}</div>`;
      params.forEach((item, i) => {
        const value = that.dealValueUnit(item.value, dataChart.series[i].is_rate, dataOption);
        htmlStr += `<div>${item.marker + item.seriesName}：${value}</div>`
      });
      return htmlStr;
    }
    // 根据是否有name处理grid-top
    if (dataChart.yAxis[0].name) {
      dataChart.grid.top = '15%';
    }
  }

  // 按目标分析，达成率独立坐标轴
  private dealCompletionRate(metaData, axisObject, axisPosition) {
    if (metaData.chart_config.analysis_dimension === 'okr_new' && metaData.chart_config.okr_chart_show_type && metaData.chart_config.okr_chart_show_type.indexOf('completion_rate') !== -1) {
      if (metaData.chart_config.okr_chart_show_type.length === 1) {
        axisObject.forEach(axisRate => {
          this.dealUnit([], axisRate, axisRate['name'], metaData, 1);
        });
      } else {
        const axisRate = {
          type: 'value',
          axisLabel: { fontSize: 10, color: '#7f7f7f' },
          show: metaData.chart_config.is_showYAxis,
          position: axisPosition,
          nameTextStyle: { color: '#7f7f7f' },
          splitLine: { show: false },
          axisLine: { show: true, lineStyle: { color: "#e4e4e4" } },
          axisTick: {
            show: true
          },
          name: '达成率',
          is_rate: 1
        }
        this.dealUnit([], axisRate, axisRate['name'], metaData, 1);
        axisObject.push(axisRate);
      }
    }
  }

  // 按目标分析时，达成率处理
  private dealCompletionRateData(metaData, item, metaFields, legendKeyData, yAxisObject?, yAxisLineNum?) {
    if (yAxisObject && yAxisLineNum && metaData.chart_config.is_multiYAxis === 'multi') {
      yAxisObject.length = yAxisLineNum;
    }
    if (metaData.chart_config.okr_chart_show_type && item.okr_type == 'completion_rate') {
      metaFields.forEach((metric) => {
        legendKeyData[item.key + '_' + metric.name]['is_rate'] = 1;
        if (metaData.chart_config.okr_chart_show_type.length > 1) {
          if (yAxisObject) {
            legendKeyData[item.key + '_' + metric.name].yAxisIndex = yAxisObject.length;
          } else {// bar_h
            legendKeyData[item.key + '_' + metric.name].xAxisIndex = 1;
          }
          legendKeyData[item.key + '_' + metric.name].type = 'line';
        }
      });
    }
  }

  // 设置数据显示label
  private dealLabelShow(metaData, dataChart, labelPosition) {
    if (metaData.chart_config.bar_show_type === "number") {
      const that = this;
      // 显示数值
      dataChart.series.forEach(item => {
        item['label'] = { show: true, color: '#000' }
        item['emphasis'] = { "focus": 'series' };
        item.label['formatter'] = function (params) {
          const value = that.dealValueUnit(params.value, item.is_rate, metaData);
          return +params.value ? value : '';
        }

        //如果没有堆积，或堆积数为一条,对显示的数值做位移处理
        if (!item.stack) {
          item['label']['position'] = labelPosition;
        } else {
          let num = 0
          dataChart.series.forEach(element => {
            if (item.stack === element.stack) num++;
          })
          if (num === 1) item['label']['position'] = labelPosition;
        }
      })
    } else if (metaData.chart_config.bar_show_type === "percent") {
      // 显示百分比
      if (!dataChart.series[0].stack) { //如果没有堆积
        dataChart.series.forEach(item => {
          item['label'] = { show: true, formatter: '100%', color: '#000', position: labelPosition }
          item['emphasis'] = { "focus": 'series' };
        })
      } else {//有堆积
        let sumObj = {}
        dataChart.series.forEach(item => {
          sumObj[item.stack] = [];
        })
        for (const key in sumObj) {
          dataChart.series[0].data.forEach((item, i) => {
            sumObj[key][i] = 0;
          })
          dataChart.series.forEach(item => {
            if (item.stack === key) {
              item.data.forEach((element, i) => {
                sumObj[key][i] += parseFloat(element ? element : 0) * 10000;
              });
            }
          })
          sumObj[key].forEach((item, i) => sumObj[key][i] = item / 10000);
        }
        dataChart.series.forEach(item => {
          item['label'] = {
            show: true,
            formatter: function (params) {
              const cmpIndex = item['stack'].indexOf('-对比');
              const stackName = sumObj[item['stack']] || cmpIndex === -1 ? item['stack'] : item['stack'].slice(0, cmpIndex);
              const percent = (params.value / sumObj[stackName][params.dataIndex] * 100).toFixed(2);
              return +percent ? percent + '%' : '';
            },
            color: '#000'
          }
          item['emphasis'] = { "focus": 'series' };

          //如果没有堆积，或堆积数为一条,对显示的数值做位移处理
          let num = 0
          dataChart.series.forEach(element => {
            if (item.stack === element.stack) num++;
          })
          if (num === 1) item['label']['position'] = labelPosition;
        })
      }
    }
  }

  // 处理空数据，补0
  private dealEmptyData(chartDataDetailObj, legendKeyData, metric, item?) {
    if (item) {
      // 按维度拆分,或按目标分析
      if (chartDataDetailObj && chartDataDetailObj.detail[item.key]) {
        legendKeyData[item.key + '_' + metric.name].data.push(chartDataDetailObj.detail[item.key][metric.key]);
      } else {
        legendKeyData[item.key + '_' + metric.name].data.push('0');
      }
    } else {
      // 不按维度拆分
      if (chartDataDetailObj && chartDataDetailObj[metric.key]) {
        legendKeyData[metric.name].data.push(chartDataDetailObj[metric.key]);
      } else {
        legendKeyData[metric.name].data.push('0');
      }
    }
  }

  // 多轴
  private dealMultiYAxis(metaData, yAxisLineNum, yAxisObject, legendKeyDataObj, dataChart, metric, item?, valueListObject?) {
    if (metaData.chart_config.is_multiYAxis === 'multi') {
      const yAxisObjInit = {
        ...deepCopy(this.yAxisObjectCommon),
        position: 'right',
        offset: 50 * (yAxisLineNum - 2) //偏移px
      };

      if (yAxisLineNum > 1) {
        yAxisObject.push(yAxisObjInit);
        legendKeyDataObj.yAxisIndex = yAxisLineNum - 1;
        dataChart.grid['right'] = 50 + (yAxisLineNum - 2) * 25;
      }

      yAxisObject[yAxisLineNum - 1].show = metaData.chart_config.is_showYAxis;
      let valueList = [];
      if (item && valueListObject) {
        // 粒度不是按维度->按维度拆分或按目标分析
        if (metaData.chart_config.analysis_dimension === 'okr_new' && metaData.chart_config.okr_chart_show_type && metaData.chart_config.okr_chart_show_type.length > 1 && metaData.chart_config.okr_chart_show_type.indexOf('completion_rate') !== -1) {
          yAxisObjInit.offset = 50 * (yAxisLineNum - 1);//如果是达成率分轴，其他指标偏移px
        }

        if (!valueListObject[metric.key]) {
          valueListObject[metric.key] = []
        }
        if (item.okr_type !== 'completion_rate' && !metric.is_rate) {
          valueListObject[metric.key].push(...legendKeyDataObj['data']);
        }
        valueList = valueListObject[metric.key];
      } else {
        // 不按维度拆分，或粒度是按维度
        valueList = legendKeyDataObj['data'];
      }

      // 处理单位
      this.dealUnit(valueList, yAxisObject[yAxisLineNum - 1], metric['name'], metaData, metric['is_rate']);
    }
  }

  private createLineOption(data: any, dataOption: any) {
    const dataChart = deepCopy(this.dataChartCommon);
    let xAxisObject = deepCopy(this.xAxisObjectCommon);
    const yAxisObject = [deepCopy(this.yAxisObjectCommon)];
    const newData = this.dealData(data);
    const timeSeriesObj = newData.timeSeriesObj;
    const metaData = newData.metaData;
    const chartDataDetail = newData.chartDataDetail;
    const xDimensionKey = metaData.chart_config.xAxis;//设为x轴的维度
    const metaFields = metaData['metrics'];
    const byFields = metaData['by_fields'];
    const legendKeyData = {};
    const chartGroupByName = metaData['by_fields_name'] ? metaData['by_fields_name'] : [];
    let yAxisLineNum = 0;
    let maxLineValue = 0;
    let yAxisLineName = '';

    if (metaData.grain !== 'data_dimension') {
      // 粒度不是按维度
      if (byFields.length || metaData.chart_config.analysis_dimension === 'okr_new') {
        // 按维度拆分
        const valueListObject = {};//分指标的value值列表
        metaData.data_items.forEach((item) => {
          yAxisLineNum = 0;
          metaFields.forEach((metric) => {
            if (metric.config === undefined) {
              metric.config = 'line';
            }
            metaData.time_series.forEach((time) => {
              if (legendKeyData[item.key + '_' + metric.name] === undefined) {
                legendKeyData[item.key + '_' + metric.name] = { name: item.name + '_' + metric.name, type: metric.config, data: [], is_rate: metric.is_rate, smooth: false, barMaxWidth: 30 };
                if (metric.config === 'smooth_line') {
                  legendKeyData[item.key + '_' + metric.name].type = 'line';
                  legendKeyData[item.key + '_' + metric.name].smooth = true;
                }

                dataChart.legend.data.push(item.name + '_' + metric.name);
              }
              // 处理空数据，补0
              this.dealEmptyData(chartDataDetail[time], legendKeyData, metric, item);
            });
            yAxisLineNum++;
            yAxisLineName = metric['name'];
            if (item.okr_type !== 'completion_rate' && !metric.is_rate) {
              maxLineValue = Math.max(maxLineValue, ...legendKeyData[item.key + '_' + metric.name]['data']);
            }
            // 多轴
            this.dealMultiYAxis(metaData, yAxisLineNum, yAxisObject, legendKeyData[item.key + '_' + metric.name], dataChart, metric, item, valueListObject);
          });
          // 按目标分析时，达成率处理
          this.dealCompletionRateData(metaData, item, metaFields, legendKeyData, yAxisObject, yAxisLineNum);
        });
      } else {
        // 不拆分
        metaFields.forEach((metric) => {
          if (metric.config === undefined) {
            metric.config = 'line';
          }
          metaData.time_series.forEach((time) => {
            if (legendKeyData[metric.name] === undefined) {
              legendKeyData[metric.name] = { name: metric.name, type: metric.config, data: [], is_rate: metric.is_rate, smooth: false, barMaxWidth: 30 };
              if (metric.config === 'smooth_line') {
                legendKeyData[metric.name].type = 'line';
                legendKeyData[metric.name].smooth = true;
              }
              dataChart.legend.data.push(metric.name);
            }
            // 处理空数据，补0
            this.dealEmptyData(chartDataDetail[time], legendKeyData, metric);
          });
          yAxisLineNum++;
          yAxisLineName = metric['name'];
          if (!metric.is_rate) {
            maxLineValue = Math.max(maxLineValue, ...legendKeyData[metric.name]['data']);
          }
          // 多轴
          this.dealMultiYAxis(metaData, yAxisLineNum, yAxisObject, legendKeyData[metric.name], dataChart, metric);
        });
      }

      xAxisObject.data = metaData.time_series;
      // 如果是按维度为x轴，需要替换x轴显示名称
      if (data['meta'].grain === 'data_dimension' && xDimensionKey !== 'flat') {
        xAxisObject.data = [];
        metaData.time_series.forEach(element => {
          xAxisObject.data.push(timeSeriesObj[element]);
        });
      }

      if (metaData.chart_config.is_multiYAxis === 'single') {
        const axisName = yAxisLineNum === 1 ? yAxisLineName : '';
        const is_rate = yAxisLineNum === 1 ? metaFields[0].is_rate : 0;
        // 处理单位
        this.dealUnit([maxLineValue], yAxisObject[0], axisName, metaData, is_rate);
        yAxisObject[0].show = metaData.chart_config.is_showYAxis;
      }
      // 按目标分析，达成率独立坐标轴
      this.dealCompletionRate(metaData, yAxisObject, 'right');

      dataChart.xAxis = [xAxisObject];
      dataChart.yAxis = Object.values(yAxisObject);
      dataChart.series = Object.values(legendKeyData);
    } else {
      // 粒度：按维度
      if (metaFields.length > 0) {
        metaFields.forEach((val, index) => {
          if (val.config === undefined) {
            val.config = 'line';
          }

          dataChart.legend.data.push(val.name);
          yAxisLineNum++;
          legendKeyData[val.key] = { name: val.name, type: val.config, data: [], is_rate: val.is_rate, smooth: false };
          if (val.config === 'smooth_line') {
            legendKeyData[val.key]['type'] = 'line';
            legendKeyData[val.key]['smooth'] = true;
          }
          chartDataDetail.forEach((detail) => {
            legendKeyData[val.key]['data'].push(detail[val.key]);
          });
          yAxisLineName = val['name'];
          maxLineValue = Math.max(maxLineValue, ...legendKeyData[val.key]['data']);
          // 多轴
          this.dealMultiYAxis(metaData, yAxisLineNum, yAxisObject, legendKeyData[val.key], dataChart, val);
        });
      }
      if (byFields.length > 0) {
        xAxisObject = deepCopy(this.xAxisObjectCommon);
        chartDataDetail.forEach((detail) => {
          xAxisObject['data'].push(this.getGroupName(detail, chartGroupByName));
        });
      }

      if (metaData.chart_config.is_multiYAxis === 'single') {
        const axisName = yAxisLineNum === 1 ? yAxisLineName : '';
        const is_rate = yAxisLineNum === 1 ? metaFields[0].is_rate : 0;
        // 处理单位
        this.dealUnit([maxLineValue], yAxisObject[0], axisName, metaData, is_rate);
        yAxisObject[0].show = metaData.chart_config.is_showYAxis;
      }

      dataChart.xAxis = [xAxisObject];
      dataChart.yAxis = Object.values(yAxisObject);
      dataChart.series = Object.values(legendKeyData);
    }
    // 设置数据显示label
    this.dealLabelShow(metaData, dataChart, 'top');

    return dataChart;
  }

  private createBarOption(data: any, dataOption: any) {
    const dataChart = deepCopy(this.dataChartCommon);
    let xAxisObject = deepCopy(this.xAxisObjectCommon);
    const yAxisObject = [deepCopy(this.yAxisObjectCommon)];
    const newData = this.dealData(data);
    const timeSeriesObj = newData.timeSeriesObj;
    const metaData = newData.metaData;
    const chartDataDetail = newData.chartDataDetail;
    const xDimensionKey = metaData.chart_config.xAxis;//设为x轴的维度
    const metaFields = metaData['metrics'];
    const byFields = metaData['by_fields'];
    const legendKeyData = {};
    const chartGroupByName = metaData['by_fields_name'] ? metaData['by_fields_name'] : [];
    let yAxisLineNum = 0;
    let maxLineValue = 0;
    let yAxisLineName = '';

    if (metaData.grain !== 'data_dimension') {
      // 粒度不是按维度
      if (byFields.length || metaData.chart_config.analysis_dimension === 'okr_new') {
        // 按维度拆分
        const valueListObject = {};//分指标的value值列表
        metaData.data_items.forEach((item) => {
          yAxisLineNum = 0
          metaFields.forEach((metric) => {
            metaData.time_series.forEach((time) => {
              if (legendKeyData[item.key + '_' + metric.name] === undefined) {
                if (metaData.chart_config.analysis_dimension === 'okr_new') {
                  // okr_new的情况的堆积
                  legendKeyData[item.key + '_' + metric.name] = { name: item.name + '_' + metric.name, type: 'bar', stack: metric.name + '_' + item['okr_type'], data: [], is_rate: metric.is_rate, smooth: false, barMaxWidth: 30 };
                } else {
                  legendKeyData[item.key + '_' + metric.name] = { name: item.name + '_' + metric.name, type: 'bar', stack: metric.name, data: [], is_rate: metric.is_rate, smooth: false, barMaxWidth: 30 };
                }

                dataChart.legend.data.push(item.name + '_' + metric.name);
              }
              // 处理空数据，补0
              this.dealEmptyData(chartDataDetail[time], legendKeyData, metric, item);
            });
            yAxisLineNum++;
            yAxisLineName = metric['name'];
            if (item.okr_type !== 'completion_rate' && !metric.is_rate) {
              maxLineValue = Math.max(maxLineValue, ...legendKeyData[item.key + '_' + metric.name]['data']);
            }
            // 多轴
            this.dealMultiYAxis(metaData, yAxisLineNum, yAxisObject, legendKeyData[item.key + '_' + metric.name], dataChart, metric, item, valueListObject);
          });

          // 按目标分析时，达成率处理
          this.dealCompletionRateData(metaData, item, metaFields, legendKeyData, yAxisObject, yAxisLineNum);
        });
      } else {
        metaFields.forEach((metric) => {
          metaData.time_series.forEach((time) => {
            if (legendKeyData[metric.name] === undefined) {
              legendKeyData[metric.name] = { name: metric.name, type: 'bar', data: [], is_rate: metric.is_rate, smooth: false, barMaxWidth: 30 };
              dataChart.legend.data.push(metric.name);
            }
            // 处理空数据，补0
            this.dealEmptyData(chartDataDetail[time], legendKeyData, metric);
          });
          yAxisLineNum++;
          yAxisLineName = metric['name'];
          if (!metric.is_rate) {
            maxLineValue = Math.max(maxLineValue, ...legendKeyData[metric.name]['data']);
          }
          // 多轴
          this.dealMultiYAxis(metaData, yAxisLineNum, yAxisObject, legendKeyData[metric.name], dataChart, metric);
        });
      }

      xAxisObject.data = metaData.time_series;
      // 如果是按维度为x轴，需要替换x轴显示名称
      if (data['meta'].grain === 'data_dimension' && xDimensionKey !== 'flat') {
        xAxisObject.data = [];
        metaData.time_series.forEach(element => {
          xAxisObject.data.push(timeSeriesObj[element]);
        });
      }
      if (metaData.chart_config.is_multiYAxis === 'single') {
        const axisName = yAxisLineNum === 1 ? yAxisLineName : '';
        const is_rate = yAxisLineNum === 1 ? metaFields[0].is_rate : 0;
        // 处理单位
        this.dealUnit([maxLineValue], yAxisObject[0], axisName, metaData, is_rate);
        yAxisObject[0].show = metaData.chart_config.is_showYAxis;
      }

      // 按目标分析，达成率独立坐标轴
      this.dealCompletionRate(metaData, yAxisObject, 'right');

      dataChart.xAxis = [xAxisObject];
      dataChart.yAxis = Object.values(yAxisObject);
      dataChart.series = Object.values(legendKeyData);
    } else {
      // 粒度是按维度
      if (metaFields.length > 0) {
        metaFields.forEach((val, index) => {
          if (val.config === undefined) {
            val.config = 'bar';
          }
          dataChart.legend.data.push(val.name);
          yAxisLineNum++;
          legendKeyData[val.key] = { name: val.name, type: 'bar', data: [], is_rate: val.is_rate, smooth: false };
          if (val.config === 'smooth_line') {
            legendKeyData[val.key]['smooth'] = true;
          }
          chartDataDetail.forEach((detail) => {
            legendKeyData[val.key]['data'].push(detail[val.key]);
          });
          yAxisLineName = val['name'];
          maxLineValue = Math.max(maxLineValue, ...legendKeyData[val.key]['data']);
          // 多轴
          this.dealMultiYAxis(metaData, yAxisLineNum, yAxisObject, legendKeyData[val.key], dataChart, val);
        });
      }
      if (byFields.length > 0) {
        xAxisObject = deepCopy(this.xAxisObjectCommon);
        if (chartGroupByName.length) {
          chartDataDetail.forEach((detail) => {
            xAxisObject['data'].push(this.getGroupName(detail, chartGroupByName));
          });
        }
      }


      if (metaData.chart_config.is_multiYAxis === 'single') {
        const axisName = yAxisLineNum === 1 ? yAxisLineName : '';
        const is_rate = yAxisLineNum === 1 ? metaFields[0].is_rate : 0;
        // 处理单位
        this.dealUnit([maxLineValue], yAxisObject[0], axisName, metaData, is_rate);
        yAxisObject[0].show = metaData.chart_config.is_showYAxis;
      }

      const legendKeyDataKeysCount = Object.keys(legendKeyData).length;
      const legendKeyDataValues = Object.values(legendKeyData);

      if (legendKeyDataKeysCount === 1) {
        legendKeyDataValues[0]['yAxisIndex'] = 0;
        legendKeyDataValues[0]['show'] = true;
      } else {
        let barCount = 0;
        legendKeyDataValues.forEach(serItem => {
          if (serItem['type'] === 'bar') {
            barCount++;
          }
        });
      }

      dataChart.xAxis = xAxisObject;
      dataChart.yAxis = Object.values(yAxisObject);
      dataChart.series = Object.values(legendKeyData);
    }

    // 设置数据显示label
    this.dealLabelShow(metaData, dataChart, 'top');

    return dataChart;
  }

  private createBarHorizontalOption(data: any, dataOption: any) {
    const dataChart = deepCopy(this.dataChartCommon);
    let xAxisObject = deepCopy(this.xAxisObjectCommon);
    const yAxisObject = [deepCopy(this.yAxisObjectCommon)];
    const newData = this.dealData(data);
    const timeSeriesObj = newData.timeSeriesObj;
    const metaData = newData.metaData;
    const chartDataDetail = newData.chartDataDetail;
    const xDimensionKey = metaData.chart_config.xAxis;//设为x轴的维度
    const metaFields = metaData['metrics'];
    const byFields = metaData['by_fields'];
    const legendKeyData = {};
    const chartGroupByName = metaData['by_fields_name'] ? metaData['by_fields_name'] : [];
    let yAxisLineNum = 0;
    let maxLineValue = 0;
    let yAxisLineName = '';

    if (metaData.grain !== 'data_dimension') {
      // 粒度不是按维度
      if (byFields.length || metaData.chart_config.analysis_dimension === 'okr_new') {
        // 按维度拆分
        metaData.data_items.forEach((item) => {
          yAxisLineNum = 0;
          metaFields.forEach((metric) => {
            metaData.time_series.forEach((time) => {
              if (legendKeyData[item.key + '_' + metric.name] === undefined) {
                if (metaData.chart_config.analysis_dimension === 'okr_new') {
                  // okr_new的情况的堆积
                  legendKeyData[item.key + '_' + metric.name] = { name: item.name + '_' + metric.name, type: 'bar', stack: metric.name + '_' + item['okr_type'], data: [], is_rate: metric.is_rate, smooth: false, barMaxWidth: 30 };
                } else {
                  legendKeyData[item.key + '_' + metric.name] = { name: item.name + '_' + metric.name, type: 'bar', stack: metric.name, data: [], smooth: false, is_rate: metric.is_rate, barMaxWidth: 30 };
                }
                dataChart.legend.data.push(item.name + '_' + metric.name);
              }
              // 处理空数据，补0
              this.dealEmptyData(chartDataDetail[time], legendKeyData, metric, item);
            });
            yAxisLineName = metric['name'];
            if (item.okr_type !== 'completion_rate' && !metric.is_rate) {
              maxLineValue = Math.max(maxLineValue, ...legendKeyData[item.key + '_' + metric.name]['data']);
            }
            yAxisLineNum++;
          });

          // 按目标分析时，达成率处理
          this.dealCompletionRateData(metaData, item, metaFields, legendKeyData);
        });

      } else {
        metaFields.forEach((metric) => {
          metaData.time_series.forEach((time) => {
            if (legendKeyData[metric.name] === undefined) {
              legendKeyData[metric.name] = { name: metric.name, type: 'bar', data: [], is_rate: metric.is_rate, smooth: false, barMaxWidth: 30 };
              dataChart.legend.data.push(metric.name);
            }
            // 处理空数据，补0
            this.dealEmptyData(chartDataDetail[time], legendKeyData, metric);
          });
          yAxisLineNum++;
          yAxisLineName = metric['name'];
          if (!metric.is_rate) {
            maxLineValue = Math.max(maxLineValue, ...legendKeyData[metric.name]['data']);
          }
        });
      }

      const xAxisObjectNew = deepCopy(this.yAxisObjectCommon);
      xAxisObjectNew.splitLine.show = true;
      const yAxisObjectNew = deepCopy(this.xAxisObjectCommon);

      yAxisObjectNew.data = metaData.time_series;
      // 如果是按维度为y轴，需要替换y轴显示名称
      if (data['meta'].grain === 'data_dimension' && xDimensionKey !== 'flat') {
        yAxisObjectNew.data = [];
        metaData.time_series.forEach(element => {
          yAxisObjectNew.data.push(timeSeriesObj[element]);
        });
      }
      const axisName = yAxisLineNum === 1 ? yAxisLineName : '';
      const is_rate = yAxisLineNum === 1 ? metaFields[0].is_rate : 0;
      // 处理单位
      this.dealUnit([maxLineValue], xAxisObjectNew, axisName, metaData, is_rate);

      dataChart.xAxis = [xAxisObjectNew];
      dataChart.yAxis = [yAxisObjectNew];
      dataChart.series = Object.values(legendKeyData);

      // 按目标分析，达成率独立坐标轴
      this.dealCompletionRate(metaData, dataChart.xAxis, 'top');

    } else {
      // 粒度是按维度
      if (metaFields.length > 0) {
        metaFields.forEach((val, index) => {
          if (val.config === undefined) {
            val.config = 'bar';
          }
          if (!val.is_x) {
            dataChart.legend.data.push(val.name);
            if (val.config === 'line' || val.config === 'smooth_line') {
              yAxisLineNum++;
              legendKeyData[val.key] = { name: val.name, type: 'bar', data: [], is_rate: val.is_rate, smooth: false };
              if (val.config === 'smooth_line') {
                legendKeyData[val.key]['smooth'] = true;
              }
              yAxisObject[0]['show'] = true;
              legendKeyData[val.key]['yAxisIndex'] = 0;
              chartDataDetail.forEach((detail) => {
                legendKeyData[val.key]['data'].push(detail[val.key]);
              });
              yAxisLineName = val['name'];
              maxLineValue = Math.max(maxLineValue, ...legendKeyData[val.key]['data']);
            } else {
              yAxisLineNum++;
              legendKeyData[val.key] = { name: val.name, type: 'bar', data: [], is_rate: val.is_rate, smooth: false };
              yAxisObject[0]['show'] = true;
              legendKeyData[val.key]['yAxisIndex'] = 0;
              chartDataDetail.forEach((detail) => {
                legendKeyData[val.key]['data'].push(detail[val.key]);
              });
              yAxisLineName = val['name'];
              maxLineValue = Math.max(maxLineValue, ...legendKeyData[val.key]['data']);
            }
          } else {
            xAxisObject = deepCopy(this.xAxisObjectCommon);
            chartDataDetail.forEach((detail) => {
              if (val.hasOwnProperty('field_name_key') && val.field_name_key !== '') {
                xAxisObject['data'].push(detail[val.field_name_key]);
              } else {
                xAxisObject['data'].push(detail[val.key]);
              }

            });
          }
        });
      }
      if (byFields.length > 0) {
        xAxisObject = deepCopy(this.xAxisObjectCommon);
        if (chartGroupByName.length) {
          chartDataDetail.forEach((detail) => {
            xAxisObject['data'].push(this.getGroupName(detail, chartGroupByName));
          });
        }
      }

      if (maxLineValue > 0) {
        const axisName = yAxisLineNum === 1 ? yAxisLineName : '';
        const is_rate = yAxisLineNum === 1 ? metaFields[0].is_rate : 0;
        // 处理单位
        this.dealUnit([maxLineValue], yAxisObject[0], axisName, metaData, is_rate);
      }

      const legendKeyDataKeysCount = Object.keys(legendKeyData).length;
      const legendKeyDataValues = Object.values(legendKeyData);

      if (legendKeyDataKeysCount === 1) {
        legendKeyDataValues[0]['yAxisIndex'] = 0;
        legendKeyDataValues[0]['show'] = true;
      } else {
        let barCount = 0;
        legendKeyDataValues.forEach(serItem => {
          if (serItem['type'] === 'bar') {
            barCount++;
          }
        });
        if (barCount === legendKeyDataKeysCount) {
          legendKeyDataValues.forEach(serItem => {
            serItem['yAxisIndex'] = 0;
          });
        }
      }

      dataChart.xAxis = yAxisObject;
      dataChart.yAxis = [xAxisObject];
      dataChart.series = Object.values(legendKeyData);
    }

    // 如果是按维度，有排序，升序、降序顺序翻转
    if (data['meta'].grain === 'data_dimension') {
      dataChart.series.forEach((element, i) => {
        if (dataChart.series[i]['data']) {
          dataChart.series[i]['data'].reverse();
        }
      });
      dataChart.yAxis.forEach(element => {
        element['data'].reverse();
      });
    }

    if (dataChart.yAxis['data']) {
      dataChart.series.forEach((element, i) => {
        if (dataChart.series[i]['data']) {
          dataChart.series[i]['data'].reverse();
        }
      });
      dataChart.yAxis['data'].reverse();
    }

    // 设置数据显示label
    this.dealLabelShow(metaData, dataChart, 'right');
    return dataChart;
  }

  private createPieOption(data: any, dataOption: any) {
    const dataChart = {
      tooltip: {
        trigger: 'item',
        textStyle: {
          fontSize: 10
        },
        // formatter: '{b}：{c}({d}%)'
      },
      textStyle: {
        fontSize: 10
      },
      legend: {
        bottom: 'bottom',
        type: 'scroll',
        data: [],
      },
      series: [],
      color: this._themeColorSeries['all'],
    };
    const metaData = data['meta'];
    const chartDataDetail = data['data'];
    const chartGroupByName = metaData['by_fields_name'] ? metaData['by_fields_name'] : [];
    const metaFields = metaData['metrics'];
    const legendXData = [];

    const legendKeyDataTmp = {};
    chartDataDetail.forEach((item) => {
      const tmpName = this.getGroupName(item, chartGroupByName);
      legendXData.push(this.getGroupName(item, chartGroupByName));
      metaFields.forEach((field, index) => {
        if (index > 1) { return; }
        if (!legendKeyDataTmp.hasOwnProperty(field['key'])) {
          if (index === 1) {
            legendKeyDataTmp[field['key']] = { name: field['name'], type: 'pie', data: [], radius: ['20%', '35%'], label: { formatter: '{d}%' }, minShowLabelAngle: 0.1 };
          } else {
            legendKeyDataTmp[field['key']] = { name: field['name'], type: 'pie', data: [], radius: ['50%', '70%'], label: { formatter: '{b}:({d}%)' }, minShowLabelAngle: 0.1 };
          }
        }
        legendKeyDataTmp[field['key']].data.push({
          name: tmpName,
          value: item[field['key']]
        });
      });
    });
    const that = this;
    dataChart.tooltip['formatter'] = function (params) {
      const value = that.dealValueUnit(params.value, 0);
      let htmlStr = `<div>`
      if (metaFields.length > 1) {
        htmlStr += `<div>${params.marker}${params.seriesName}</div>`;
      }
      htmlStr += `<div>${params.name}：${value}</div>
                  <div>占比：${params.percent}%</div></div>`
      return htmlStr;
    }
    if (legendXData.length >= 2 && legendXData.length <= 6) {
      dataChart.color = this._themeColorSeries['count_' + legendXData.length];
    }
    dataChart.series = Object.values(legendKeyDataTmp);
    dataChart.legend.data = legendXData;

    // data没数据的显示0
    dataChart.series.forEach((element, i) => {
      element.data.forEach((item, idx) => {
        if (!item.value) {
          dataChart.series[i]['data'][idx].value = '0';
        }
      });
    });

    return dataChart;
  }

  private createLineAreaOption(data: any, dataOption: any) {
    const dataChart = deepCopy(this.dataChartCommon);
    let xAxisObject = deepCopy(this.xAxisObjectCommon);
    const yAxisObject = [deepCopy(this.yAxisObjectCommon)];
    const newData = this.dealData(data);
    const timeSeriesObj = newData.timeSeriesObj;
    const metaData = newData.metaData;
    const chartDataDetail = newData.chartDataDetail;
    const xDimensionKey = metaData.chart_config.xAxis;//设为x轴的维度
    const metaFields = metaData['metrics'];
    const byFields = metaData['by_fields'];
    const legendKeyData = {};
    const chartGroupByName = metaData['by_fields_name'] ? metaData['by_fields_name'] : [];
    let yAxisLineNum = 0;
    let maxLineValue = 0;
    let yAxisLineName = '';

    if (metaData.grain !== 'data_dimension') {
      // 粒度不是按维度
      if (byFields.length || metaData.chart_config.analysis_dimension === 'okr_new') {
        // 按维度拆分
        const valueListObject = {};//分指标的value值列表
        metaData.data_items.forEach((item) => {
          yAxisLineNum = 0;
          metaFields.forEach((metric) => {
            metaData.time_series.forEach((time) => {
              if (legendKeyData[item.key + '_' + metric.name] === undefined) {
                if (metaData.chart_config.analysis_dimension === 'okr_new') {
                  // okr_new的情况的堆积
                  legendKeyData[item.key + '_' + metric.name] = { name: item.name + '_' + metric.name, type: 'line', areaStyle: {}, stack: metric.name + '_' + item['okr_type'], data: [], is_rate: metric.is_rate, smooth: true, barMaxWidth: 30 };
                } else {
                  legendKeyData[item.key + '_' + metric.name] = { name: item.name + '_' + metric.name, type: 'line', areaStyle: {}, stack: metric.name, data: [], smooth: true, is_rate: metric.is_rate, barMaxWidth: 30 };
                }
                dataChart.legend.data.push(item.name + '_' + metric.name);
              }
              // 处理空数据，补0
              this.dealEmptyData(chartDataDetail[time], legendKeyData, metric, item);
            });

            yAxisLineNum++;
            yAxisLineName = metric['name'];
            if (item.okr_type !== 'completion_rate' && !metric.is_rate) {
              maxLineValue = Math.max(maxLineValue, ...legendKeyData[item.key + '_' + metric.name]['data']);
            }
            // 多轴
            this.dealMultiYAxis(metaData, yAxisLineNum, yAxisObject, legendKeyData[item.key + '_' + metric.name], dataChart, metric, item, valueListObject);
          });
          // 按目标分析时，达成率处理
          this.dealCompletionRateData(metaData, item, metaFields, legendKeyData, yAxisObject, yAxisLineNum);
        });

      } else {
        metaFields.forEach((metric) => {
          metaData.time_series.forEach((time) => {
            if (legendKeyData[metric.name] === undefined) {
              legendKeyData[metric.name] = { name: metric.name, type: 'line', areaStyle: {}, stack: metric.name, data: [], is_rate: metric.is_rate, smooth: true, barMaxWidth: 30 };
              dataChart.legend.data.push(metric.name);
            }
            // 处理空数据，补0
            this.dealEmptyData(chartDataDetail[time], legendKeyData, metric);
          });
          yAxisLineNum++;
          yAxisLineName = metric['name'];
          if (!metric.is_rate) {
            maxLineValue = Math.max(maxLineValue, ...legendKeyData[metric.name]['data']);
          }
          // 多轴
          this.dealMultiYAxis(metaData, yAxisLineNum, yAxisObject, legendKeyData[metric.name], dataChart, metric);
        });
      }

      xAxisObject.data = metaData.time_series;
      // 如果是按维度为x轴，需要替换x轴显示名称
      if (data['meta'].grain === 'data_dimension' && xDimensionKey !== 'flat') {
        xAxisObject.data = [];
        metaData.time_series.forEach(element => {
          xAxisObject.data.push(timeSeriesObj[element]);
        });
      }
      if (metaData.chart_config.is_multiYAxis === 'single') {
        const axisName = yAxisLineNum === 1 ? yAxisLineName : '';
        const is_rate = yAxisLineNum === 1 ? metaFields[0].is_rate : 0;
        // 处理单位
        this.dealUnit([maxLineValue], yAxisObject[0], axisName, metaData, is_rate);
        yAxisObject[0].show = metaData.chart_config.is_showYAxis;
      }

      // 按目标分析，达成率独立坐标轴
      this.dealCompletionRate(metaData, yAxisObject, 'right');
      dataChart.xAxis = [xAxisObject];
      dataChart.yAxis = Object.values(yAxisObject);
      dataChart.series = Object.values(legendKeyData);

    } else {
      if (metaFields.length > 0) {
        metaFields.forEach((val, index) => {
          if (val.config === undefined) {
            val.config = 'line';
          }
          dataChart.legend.data.push(val.name);
          yAxisLineNum++;
          legendKeyData[val.key] = { name: val.name, type: 'line', areaStyle: {}, data: [], is_rate: val.is_rate, smooth: true };
          if (val.config === 'smooth_line') {
            legendKeyData[val.key]['smooth'] = true;
          }
          chartDataDetail.forEach((detail) => {
            legendKeyData[val.key]['data'].push(detail[val.key]);
          });
          yAxisLineName = val['name'];
          maxLineValue = Math.max(maxLineValue, ...legendKeyData[val.key]['data']);
          // 多轴
          this.dealMultiYAxis(metaData, yAxisLineNum, yAxisObject, legendKeyData[val.key], dataChart, val);
        });
      }
      if (byFields.length > 0) {
        byFields.forEach((val, index) => {
          xAxisObject = deepCopy(this.xAxisObjectCommon);
          chartDataDetail.forEach((detail) => {
            xAxisObject['data'].push(this.getGroupName(detail, chartGroupByName));
          });
        });
      }

      if (metaData.chart_config.is_multiYAxis === 'single') {
        const axisName = yAxisLineNum === 1 ? yAxisLineName : '';
        const is_rate = yAxisLineNum === 1 ? metaFields[0].is_rate : 0;
        // 处理单位
        this.dealUnit([maxLineValue], yAxisObject[0], axisName, metaData, is_rate);
        yAxisObject[0].show = metaData.chart_config.is_showYAxis;
      }

      dataChart.xAxis = [xAxisObject];
      dataChart.yAxis = Object.values(yAxisObject);
      dataChart.series = Object.values(legendKeyData);
    }
    // 设置数据显示label
    this.dealLabelShow(metaData, dataChart, 'top');
    return dataChart;
  }

  private createCardOption(data: any, dataOption: any) {
    let dataChart = {};
    const metaData = data['meta'];
    const chartDataDetail = data['data'];
    let metaFields = metaData['metrics'];
    if (metaFields.length > 0) {
      metaFields = metaFields[0];

      const fieldItem = {
        name: metaFields.name,
        key: metaFields.key,
      };

      if (chartDataDetail.length) {
        fieldItem['value'] = chartDataDetail[0][fieldItem.key];
      } else {
        fieldItem['value'] = null;
      }
      if (fieldItem.key === 'pub_cost') {
        fieldItem['unit'] = '元';
      } else if (fieldItem.key === 'pub_click') {
        fieldItem['unit'] = '次';
      } else if (fieldItem.key === 'pub_impression') {
        fieldItem['unit'] = '次';
      } else if (fieldItem.key === 'pub_ctr' || metaFields.is_rate === 1) {
        fieldItem['unit'] = '%';
      } else {
        fieldItem['unit'] = '';
      }

      dataChart = fieldItem;

    } else {
      dataChart = {
        value: undefined,
        key: undefined,
        name: undefined,
        unit: ""
      };
    }
    return dataChart;
  }
  // 漏斗图
  private createFunnelOption(data: any, dataOption: any) {
    const dataChart = {
      tooltip: {
        trigger: 'item',
        textStyle: { fontSize: 10 },
      },
      textStyle: { fontSize: 10 },
      legend: {
        bottom: 'bottom',
        type: 'scroll',
        data: [],
      },
      series: [{
        data: []
      }
      ],
      color: this._themeColorSeries['all'],
    };

    const metaData = data['meta'];
    const chartDataDetail = data['data'][0];
    const metaFields = metaData['metrics'];
    const legendKeyData = {
      type: 'funnel',
      left: '15%',
      width: '70%',
      sort: 'none',
      minSize: '3%',
      label: {
        position: 'inside',
        color: '#404040'
      },
      labelLine: {
        length: 15
      },
      itemStyle: { opacity: 0.7 },
      data: [],
    };
    if (metaFields.length > 0) {
      metaFields.forEach(item => {
        const fieldItem = {
          name: item.name,
          key: item.key,
          is_rate: item.is_rate
        };
        if (chartDataDetail) {
          fieldItem['value'] = chartDataDetail[item.key] || 0;
        } else {
          fieldItem['value'] = 0;
        }
        legendKeyData.data.push(fieldItem);
        dataChart.legend.data.push(item.name);
      });
    }
    const legendKeyDataLeft = deepCopy(legendKeyData);
    const legendKeyDataRight = deepCopy(legendKeyData);
    const that = this;
    legendKeyData.label['formatter'] = function (params) {
      const value = that.dealValueUnit(params.value, params.data.is_rate);
      return `${params.name}：${value}\n\n`;
    }

    legendKeyDataLeft.label = {
      formatter: function (params) {
        let rate = '+∞';
        if (+legendKeyData.data[0].value) {
          rate = (params.value / (legendKeyData.data[0].value) * 100).toFixed(2);
        }
        return `总体转化率：${rate}% `;
      },
      position: 'left',
      color: '#404040'
    }
    legendKeyDataRight.label = {
      formatter: function (params) {
        let rate = '+∞';
        const i = params.dataIndex > 0 ? params.dataIndex - 1 : params.dataIndex;
        if (+legendKeyData.data[i].value) {
          rate = (params.value / (legendKeyData.data[i].value) * 100).toFixed(2);
        }
        return `阶段转化率：${rate}% `;
      },
      position: 'right',
      color: '#404040'
    }

    legendKeyData['z'] = 100;
    dataChart.tooltip['formatter'] = function (params) {
      let rate_total = '+∞';
      if (+legendKeyData.data[0].value) {
        rate_total = (params.value / (legendKeyData.data[0].value) * 100).toFixed(2);
      }

      let rate = '+∞';
      const i = params.dataIndex > 0 ? params.dataIndex - 1 : params.dataIndex;
      if (+legendKeyData.data[i].value) {
        rate = (params.value / (legendKeyData.data[i].value) * 100).toFixed(2);
      }
      const value = that.dealValueUnit(params.value, params.data.is_rate);
      let htmlStr = `<div class="tooltip-container"><table class="tooltip-box">
                        <tr><td>${params.name}：</td><td>${value}</td></tr>
                        <tr><td>总体转化率：</td><td>${rate_total}%</td></tr>
                        <tr><td>阶段转化率：</td><td>${rate}%</td></tr></table></div>`
      return htmlStr;
    };

    dataChart.series = [legendKeyData, legendKeyDataLeft, legendKeyDataRight];
    return dataChart;
  }
  // 散点图
  private createScatterOption(data: any, dataOption: any) {
    const dataChart = {
      grid: {
        containLabel: true,
        top: '15%',
        bottom: '12%',
        left: '5%',
      },
      textStyle: {
        "fontSize": 10
      },
      xAxis: {},
      yAxis: {},
      legend: {
        bottom: '1%',
        type: 'scroll',
        data: []
      },
      tooltip: {
        trigger: 'item',
        textStyle: { fontSize: 10 },
        enterable: true,//鼠标是否可进入提示框浮层中，默认为false，设为true可添加交互
        axisPointer: {
          show: true,
          type: 'cross',
          lineStyle: { type: 'dashed', width: 1 },
          label: {}
        }
      },
      series: [],
      color: this._themeColorSeries['all'],
    };

    const axisObject = {
      type: 'value',
      axisLabel: { fontSize: 10, color: '#7f7f7f' },
      nameTextStyle: { color: '#7f7f7f' },
      axisLine: { show: true, lineStyle: { color: "#ccc" }, axisTick: { show: true } },
      splitLine: { show: false, lineStyle: { color: "#e4e4e4" } },
      z: 10
    };

    const xAxisObject = deepCopy(axisObject);
    const yAxisObject = deepCopy(axisObject);
    const metaData = data['meta'];
    const chartDataDetail = data['data'];
    let metaFields = metaData['metrics'];
    const byFields = metaData['by_fields'];
    const legendKeyData = {};
    let scatterSetting = metaData.chart_config.scatter_setting;

    const metaFieldsObj = {};
    metaFields.forEach(element => {
      metaFieldsObj[element.key] = element;
    });

    const xValueList = [];//x坐标值列表
    const yValueList = [];//y坐标值列表
    const zValueList = [];//z大小值列表
    const xAxisName = metaFieldsObj[scatterSetting.x].name;//x轴名字
    const yAxisName = metaFieldsObj[scatterSetting.y].name;//y轴名字
    let zAxisName;//z轴名字
    if (scatterSetting.z) zAxisName = metaFieldsObj[scatterSetting.y].name;

    if (metaData.grain !== 'data_dimension') {
      // 粒度不是‘按维度’
      if (byFields.length) {
        // 按维度拆分
        metaData.time_series.forEach((time) => {
          metaData.data_items.forEach((item) => {
            let x, y, z;
            if (!legendKeyData[item.key]) {
              legendKeyData[item.key] = { name: item.name, type: 'scatter', data: [] };
              dataChart.legend.data.push(item.name);
            }
            if (chartDataDetail[time] && chartDataDetail[time].detail[item.key]) {
              x = chartDataDetail[time].detail[item.key][scatterSetting.x] ? chartDataDetail[time].detail[item.key][scatterSetting.x] : 0;
              y = chartDataDetail[time].detail[item.key][scatterSetting.y] ? chartDataDetail[time].detail[item.key][scatterSetting.y] : 0;
              if (scatterSetting.z) {
                z = chartDataDetail[time].detail[item.key][scatterSetting.z] ? chartDataDetail[time].detail[item.key][scatterSetting.z] : 0;
              }
            } else {
              x = 0;
              y = 0;
              if (scatterSetting.z) {
                z = 0;
              }
            }
            legendKeyData[item.key].data.push([x, y, z, time, item]);
            xValueList.push(x);
            yValueList.push(y);
            zValueList.push(z);
          });
        });
      } else {
        // 不拆分
        legendKeyData['noSplit'] = { type: 'scatter', data: [] };
        metaData.time_series.forEach((time) => {
          let x, y, z;
          if (chartDataDetail[time] && chartDataDetail[time][scatterSetting.x]) {
            x = chartDataDetail[time][scatterSetting.x];
            y = chartDataDetail[time][scatterSetting.y];
            if (scatterSetting.z) {
              z = chartDataDetail[time][scatterSetting.z];
            }
          } else {
            x = 0;
            y = 0;
            if (scatterSetting.z) {
              z = 0;
            }
          }

          legendKeyData['noSplit'].data.push([x, y, z, time,])
          xValueList.push(x);
          yValueList.push(y);
          zValueList.push(z);
        });
      }
    } else {
      // 粒度为‘按维度’
      chartDataDetail.forEach(element => {
        let fieldsKey = '';
        let fieldsName = '';
        metaData.by_fields.forEach((field, i) => {
          const key = field.fieldKey ? field.fieldKey : field.key;
          fieldsKey = fieldsKey + element[key] + '_'
          fieldsName = fieldsName + element[field.nameKey] + '_'
        });
        fieldsKey = fieldsKey.slice(0, fieldsKey.length - 1);
        fieldsName = fieldsName.slice(0, fieldsName.length - 1);
        const x = element[scatterSetting.x] ? element[scatterSetting.x] : 0;
        const y = element[scatterSetting.y] ? element[scatterSetting.y] : 0;
        let z;
        if (scatterSetting.z) {
          z = element[scatterSetting.z] ? element[scatterSetting.z] : 0;
        }
        if (!legendKeyData[fieldsKey]) {
          legendKeyData[fieldsKey] = { name: fieldsName, type: 'scatter', data: [] };
        }
        dataChart.legend.data.push(fieldsName);
        // null为时间位置，element为点的详细信息
        legendKeyData[fieldsKey].data.push([x, y, z, null, element]);

        xValueList.push(x);
        yValueList.push(y);
        zValueList.push(z);
      });
    }
    // 初始化x轴、y轴单位
    this.dealUnit(xValueList, xAxisObject, xAxisName, metaData, metaFieldsObj[scatterSetting.x].is_rate);
    this.dealUnit(yValueList, yAxisObject, yAxisName, metaData, metaFieldsObj[scatterSetting.y].is_rate);
    const that = this;
    // 设置tooltip
    dataChart.tooltip['formatter'] = function (params) {
      let htmlStr = `<div class="tooltip-container"><table class="tooltip-box">`
      if (params.value[3]) {
        htmlStr += `<tr><td colspan=2>${params.value[3]}</td></tr>`
      }
      if (dataChart.legend.data.length > 0) {
        htmlStr += `<tr><td colspan=2 style="maxWidth:100px">${params.marker + params.seriesName}</td></tr>`
      }

      const value0 = that.dealValueUnit(params.value[0], xAxisObject.is_rate, metaData);
      const value1 = that.dealValueUnit(params.value[1], xAxisObject.is_rate, metaData);
      htmlStr += `<tr><td>${xAxisName}：</td><td>${value0}</td></tr>
                  <tr><td>${yAxisName}：</td><td>${value1}</td></tr>`;

      if (params.value[2] && scatterSetting.z !== scatterSetting.x && scatterSetting.z !== scatterSetting.y) {
        const value2 = that.dealValueUnit(params.value[2], xAxisObject.is_rate, metaData);
        htmlStr += `<tr><td>${zAxisName}：</td><td>${value2}</td></tr>`
      }
      htmlStr += '</table></div>';

      if (scatterSetting.tooltipBtn) {
        htmlStr += `<div style="margin-top:5px;"><a id="checkDetailButton" οnclick="${that.tooltipBtnClick(params.value[4])}"><span>${scatterSetting.tooltipBtn.title}</span></a></div>`
      }

      return htmlStr;
    }


    dataChart.tooltip.axisPointer.label['formatter'] = function (params) {
      const axisObject = params.axisDimension === 'x' ? xAxisObject : yAxisObject;
      return axisObject.is_rate ? params.value.toFixed(2) + '%' : params.value.toFixed(2);
    }

    dataChart.xAxis = xAxisObject;
    dataChart.yAxis = yAxisObject;
    dataChart.series = Object.values(legendKeyData);

    if (dataChart.series.length >= 2 && dataChart.series.length <= 6) {
      dataChart.color = this._themeColorSeries['count_' + dataChart.series.length];
    }

    // 设置气泡大小
    if (scatterSetting.z) {
      dataChart.series.forEach((item) => {
        item['symbolSize'] = function (params) {
          let size = params[2] / Math.max(...zValueList) * scatterSetting.symbolSize[1];
          if (size < scatterSetting.symbolSize[0] || !size) size = scatterSetting.symbolSize[0];
          return size;
        }
      });
    }

    const markAreaCommonLabel = {
      show: true,
      // distance: 20,
      fontStyle: 'normal',
      color: "#999",
      fontSize: 12,
    }

    // 设置四象限
    if (scatterSetting.is_quadrant && dataChart.series[0]) {
      const item = dataChart.series[0];
      item['markLine'] = {
        label: { show: false, },
        lineStyle: { color: "#ccc", type: 'dashed', width: 1 },
        symbol: 'none',
        data: [],
        silent: true,
      };

      item['markArea'] = {
        silent: true,
        data: [
          [{
            name: scatterSetting.lt,
            itemStyle: { color: scatterSetting.ltColor, },
            label: { ...markAreaCommonLabel, position: 'insideTop', },
            coord: [0, Number.MAX_VALUE],
          }, {
            // coord: [x,y],
          }],
          [{
            name: scatterSetting.rt,
            itemStyle: { color: scatterSetting.rtColor, },
            label: { ...markAreaCommonLabel, position: 'insideTop', },
            // coord: [x,y],
          }, {
            coord: [Number.MAX_VALUE, Number.MAX_VALUE],
          }],
          [{
            name: scatterSetting.rb,
            itemStyle: { color: scatterSetting.rbColor },
            label: { ...markAreaCommonLabel, position: 'insideBottom', },
            // coord: [x,y],
          }, {
            coord: [Number.MAX_VALUE, 0],
          }],
          [{
            name: scatterSetting.lb,
            itemStyle: { color: scatterSetting.lbColor, },
            label: { ...markAreaCommonLabel, position: 'insideBottom', },
            coord: [0, 0],
          }, {
            // coord: [x,y],
          }],
        ]
      }

      // 获取x轴、y轴显示的最大值
      let chatDom = echarts.init(document.createElement(`div`));
      chatDom.setOption(dataChart);
      const xMaxValue = chatDom.getModel().getComponent('xAxis').axis.scale._extent[1];
      const yMaxValue = chatDom.getModel().getComponent('yAxis').axis.scale._extent[1];

      let xAxisValue, yAxisValue;
      if (scatterSetting.axis === 'custom') {
        xAxisValue = scatterSetting.xAxis.toFixed(2);
        yAxisValue = scatterSetting.yAxis.toFixed(2);
      } else if (scatterSetting.axis === 'center') {
        xAxisValue = (xMaxValue / 2).toFixed(2);
        yAxisValue = (yMaxValue / 2).toFixed(2);
      } else if (scatterSetting.axis === 'average') {
        xAxisValue = this.getAverage(xValueList);
        yAxisValue = this.getAverage(yValueList);
      } else if (scatterSetting.axis === 'median') {
        xAxisValue = this.getMedian(xValueList);
        yAxisValue = this.getMedian(yValueList);
      }

      item['markLine']['data'] = [
        { xAxis: xAxisValue },
        { yAxis: yAxisValue },
      ];
      item['markArea']['data'][0][1]['coord'] = [xAxisValue, yAxisValue];
      item['markArea']['data'][1][0]['coord'] = [xAxisValue, yAxisValue];
      item['markArea']['data'][2][0]['coord'] = [xAxisValue, yAxisValue];
      item['markArea']['data'][3][1]['coord'] = [xAxisValue, yAxisValue];
    }

    return dataChart;
  }
  // tooltip中按钮点击的回调方法
  private tooltipBtnClick(value) {
    setTimeout(() => {
      document.getElementById('checkDetailButton').addEventListener('click', ev => {
        this.tooltipEventListener.next(value);
      });
    }, 0);
  }

  private createTableData(data: any, dataOption: any) {
    const dataChart = {
      title: [],
      list: []
    };
    const metaData = data['meta'];
    const chartDataDetail = data['data'];
    const metaMetrics = metaData['metrics'];
    const metaFields = metaData['by_fields'];

    if (metaData.chart_config.analysis_dimension === 'okr_new') {
      //okr粒度
      this.okrGrainList.forEach((okrGrain) => {
        if (okrGrain.key === metaData.chart_config.okr_chart_type) {
          dataChart.title.push({ name: okrGrain.name, key: "data_date", parent_key: 'time' });
        }
      });

      metaFields.forEach((fieldItem) => {
        const curKey = fieldItem.nameKey === '' ? fieldItem.key : fieldItem.nameKey;
        dataChart.title.push({ key: curKey, name: fieldItem.name });
      });

      metaMetrics.forEach((metricItem) => {
        this.okrShowTypes.forEach(type => {
          metaData.chart_config.okr_chart_show_type.forEach(typeKey => {
            if (type.key === typeKey) {
              dataChart.title.push({ key: metricItem.key + '_' + type.key, name: metricItem.name + '_' + type.name, is_rate: !!metricItem['is_rate'] || typeKey === 'completion_rate' });
            }
          })
        })
      });

    } else {
      if (metaData.grain !== 'data_dimension') {
        this.grainList.forEach((grain) => {
          if (grain.key === metaData.grain) {
            dataChart.title.push(grain);
          }
        });
      }

      metaFields.forEach((fieldItem) => {
        const curKey = fieldItem.nameKey === '' ? fieldItem.key : fieldItem.nameKey;
        dataChart.title.push({ key: curKey, name: fieldItem.name });
      });

      metaMetrics.forEach((metricItem) => {
        dataChart.title.push({ key: metricItem.key, name: metricItem.name, is_rate: !!metricItem['is_rate'] });
        // data没数据的显示0
        chartDataDetail.forEach((element, i) => { if (!element[metricItem.key]) chartDataDetail[i][metricItem.key] = '0' });
      });
    }

    dataChart.list = chartDataDetail;
    return dataChart;
  }


  // 计算平均值
  private getAverage(valueList) {
    let sum = 0;
    valueList.forEach(item => {
      sum += parseFloat(item) * 1000;
    });
    const average = (sum / 1000) / valueList.length;
    return average.toFixed(2);
  }
  // 计算中位数
  private getMedian(valueList) {
    let numData = [];
    valueList.forEach(item => {
      numData.push(parseFloat(item));
    })
    let sequence = [].concat(numData).sort((a, b) => b - a);
    let len = numData.length;
    let mid = len % 2 === 0 ?
      (sequence[len / 2 - 1] + sequence[len / 2 + 1 - 1]) / 2 :
      sequence[(len + 1) / 2 - 1];
    return mid.toFixed(2);
  }


  public getGroupName(item, nameArr = []) {
    const tmpName = [];
    nameArr.forEach(nameKey => {
      tmpName.push(item[nameKey]);
    });
    return tmpName.join('_');
  }
}
