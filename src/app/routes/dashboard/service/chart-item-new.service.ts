import { Injectable } from '@angular/core';
import { CustomDatasService } from "../../../shared/service/custom-datas.service";
import { MenuService } from '../../../core/service/menu.service';
import { TableItemDatasService } from '../../../shared/service/table-item-datas'

@Injectable()
export class ChartItemNewService {
  public filter_items = [];
  public yAxis_items = [];
  private _summaryTypesAllChannelPublisher = {};
  private _summaryTypes = [];
  private xAxisItemsAllChannelPublisher = {};
  private xAxis_items = [];

  //y轴列表项
  private yAxisItemAllChannelPublisher = {};
  private yAxis_item = [];
  private filterItemAllChannelPublisher = {};
  private filter_item = [];

  //y轴的类型列表项
  private yAxis_type_item = [
    { key: "line", name: "线", chartType: ['line', 'lineStack', 'bar'] },
    { key: "smooth_line", name: "平滑曲线", chartType: ['line', 'lineStack', 'bar'] },
    { key: "bar", name: "柱", chartType: ['line', 'bar'] }
  ];
  //显示筛选配置
  private condition_details = {
    channel_id: [
      { key: "", name: "请选择渠道" },
      { key: "all", name: "全部" },
      { key: "sem", name: "sem" },
      { key: "feed", name: "信息流" }
    ],
    device: [
      { key: "", name: "请选择设备" },
      { key: "0", name: "全部" },
      { key: "1", name: "移动" },
      { key: "2", name: "计算机" }
    ]
  };


  private chart_item = {
    line: { key: 'line', is_x: true, xAxis: { name: '', number: 1, all_same: true }, yAxis: { name: '', all_same: true, show_yAxis_type: true, number: 5 } },
    lineStack: { key: 'lineStack', is_x: true, xAxis: { name: '', number: 1, all_same: true }, yAxis: { name: '', all_same: true, show_yAxis_type: true, number: 1 } },
    pie: { key: 'pie', is_x: false, xAxis: { name: '', number: 0, all_same: true }, yAxis: { name: '指标', all_same: true, show_yAxis_type: false, number: 1 } },
    card: { key: 'card', is_x: false, xAxis: { name: '', number: 0, all_same: true }, yAxis: { name: '指标', all_same: true, show_yAxis_type: false, number: 6 } },
    bar: { key: 'bar', is_x: true, xAxis: { name: '', number: 1, all_same: false, x_types: ['type_1', 'type_2', 'type_3', 'type_4', 'type_5', 'type_6', 'type_7', 'type_8'] }, yAxis: { name: '', number: 5, all_same: false, show_yAxis_type: true, y_types: ['type_1', 'type_2', 'type_3'] } },
    funnel: { key: 'funnel', is_x: false, xAxis: { name: '', number: 0, all_same: true }, yAxis: { name: '层次', all_same: true, show_yAxis_type: false, number: 6 } },
    map: { key: 'map', is_x: false, xAxis: { name: '', number: 0, all_same: true }, yAxis: { name: '指标', all_same: true, show_yAxis_type: false, number: 1 } },
  };

  private chart_item_details = {
    'bar': {
      // channel: {xAxis_type: 'type_1', yAxis_type: 'type_1'},
      publisher: { xAxis_type: 'type_2', yAxis_type: 'type_2' },
      account: { xAxis_type: 'type_3', yAxis_type: 'type_2' },
      campaign: { xAxis_type: 'type_4', yAxis_type: 'type_2' },
      adgroup: { xAxis_type: 'type_5', yAxis_type: 'type_2' },
      keyword: { xAxis_type: 'type_6', yAxis_type: 'type_3' },
      creative: { xAxis_type: 'type_7', yAxis_type: 'type_2' },
      biz_unit_account: { xAxis_type: 'type_8', yAxis_type: 'type_2' },

    },

  };


  private time_type = [
    { key: 'day:0:0', name: '今天' },
    { key: 'day:1:0', name: '昨天' },
    { key: 'day:1:6', name: '近七天' },
    { key: 'week:0:0', name: '本周' },
    { key: 'week:1:0', name: '上周' },
    { key: 'day:1:13', name: '近14天' },
    { key: 'day:1:29', name: '近30天' },
    { key: 'month:0:0', name: '本月' },
    { key: 'month:1:0', name: '上个月' }
  ];

  initCustomData(): void {
    const channelPublisherKey = this.menuService.currentChannelId + '_' + this.menuService.currentPublisherId;
    const conver_datas = this.customDatasService.getConversionData();
    const metric_datas = this.customDatasService.getMetricsData();
    const tableItemLists = this.customDatasService.tableItemLists;
    const list_arr_feed_Publisher = [];
    const list_obj = {};
    const list_arr = [];

    conver_datas.forEach(item => {
      list_arr.push({
        key: item.key,
        name: item.name,
        data_type: 'conversion_data',
        op_type: item.type ? item.type : 'number'
      });

      list_obj[item.key] = {
        daya_type: 'conversion_data',
        op_type: item.type ? item.type : 'number'
      };
    });

    metric_datas.forEach(item => {
      list_arr.push({
        key: item.key,
        name: item.name,
        data_type: 'metric_data',
        op_type: item.type ? item.type : 'number'
      });

      list_obj[item.key] = {
        data_type: 'metric_data',
        op_type: item.type ? item.type : 'number'
      };
    });


    if (tableItemLists[channelPublisherKey]) {
      tableItemLists[channelPublisherKey].forEach(item => {
        list_arr_feed_Publisher.push({
          key: item.key,
          name: item.name,
          data_type: item.data_type,
          op_type: item.type ? item.type : 'number'
        });

        list_obj[item.key] = {
          data_type: item.data_type,
          op_type: item.type ? item.type : 'number'
        };
      });
    }

    this.yAxis_item = this.yAxisItemAllChannelPublisher[channelPublisherKey];
    this.filter_item = this.filterItemAllChannelPublisher[channelPublisherKey];
    if (this.menuService.currentChannelId == 1) {
      this.yAxis_items = this.yAxis_item.concat(list_arr);
      this.filter_items = this.filter_item.concat(list_arr);
    } else if (this.menuService.currentChannelId == 2 || this.menuService.currentChannelId == 3) {
      this.yAxis_items = [...this.yAxis_item, ...list_arr, ...list_arr_feed_Publisher];
      this.filter_items = [...this.yAxis_item, ...list_arr, ...list_arr_feed_Publisher];
    }

  }

  getYAxisType(data, item, type) {
    if (!data.hasOwnProperty(item['key'])) {
      data[item['key']] = [];
      this.yAxis_type_item.forEach(typeItem => {
        if (typeItem['chartType'].indexOf(type) === -1) {
          return false;
        }
        data[item['key']].push(typeItem);
      });
    }
  }

  getChartSetting(type, bizInfo = { typeName: "", data: [] }) {
    this.initCustomData();
    const chartSetting = {
      summary_types: [],
      summary_items: {}
    };
    const channelPublisherKey = this.menuService.currentChannelId + '_' + this.menuService.currentPublisherId;
    this._summaryTypes = JSON.parse(JSON.stringify(this._summaryTypesAllChannelPublisher[channelPublisherKey]));
    if (this.menuService.currentChannelId != 2) {
      if (bizInfo.typeName !== undefined && bizInfo.typeName != "" && bizInfo.data.length > 0) {
        this._summaryTypes.push({ key: "biz_unit_account", name: bizInfo.typeName, pub_key: 'biz_unit_account', chartType: ['bar'] });
        bizInfo.data.forEach(bizItem => {
          this._summaryTypes.push({ key: bizItem['key'], name: bizItem['name'], field_name_key: bizItem['key'], chartType: ['pie'] });
        });
      }
    }


    //配置粒度
    this._summaryTypes.forEach(item => {
      if (item['chartType'] && item['chartType'].indexOf(type) === -1) {
        return false;
      }
      chartSetting.summary_types.push(item);
    });




    chartSetting.summary_items = this.chart_item[type];

    //配置x轴
    if (!this.chart_item[type]['xAxis']['all_same']) {
      this.chart_item[type]['xAxis']['x_types'].forEach(typ => {
        chartSetting.summary_items['xAxis'][typ] = [];
      });
    }
    if (this.chart_item[type]['xAxis']['all_same']) {
      chartSetting.summary_items['xAxis']['all'] = [];
    }
    this.xAxis_items = JSON.parse(JSON.stringify(this.xAxisItemsAllChannelPublisher[channelPublisherKey]));
    if (this.menuService.currentChannelId != 2) {
      if (bizInfo.typeName !== undefined && bizInfo.typeName != "" && bizInfo.data.length > 0) {
        bizInfo.data.forEach(bizItem => {
          this.xAxis_items.push({ key: bizItem['key'], name: bizItem['name'], data_type: 'pub_data', field_name_key: bizItem['key'] + '_name', chartType: ['bar'], extraShowType: { bar: ['type_8'] } });
        });
      }
    }



    this.xAxis_items.forEach(item => {
      if (item['chartType'] && item['chartType'].indexOf(type) === -1) {
        return false;
      }
      //x轴列表项 会动态变化的逻辑
      if (item['extraShowType'] && item['extraShowType'].hasOwnProperty(type)) {
        if (item['extraShowType'][type][0] === 'all') {
          this.chart_item[type]['xAxis']['x_types'].forEach(typ => {
            chartSetting.summary_items['xAxis'][typ].push(item);
          });

          //y轴类型（根据x轴得到）
          this.getYAxisType(chartSetting.summary_items['yAxis'], item, type);
          return false;
        }

        item['extraShowType'][type].forEach(typ => {
          chartSetting.summary_items['xAxis'][typ].push(item);
        });
        //y轴类型（根据x轴得到）
        this.getYAxisType(chartSetting.summary_items['yAxis'], item, type);
        return false;

      }
      chartSetting.summary_items['xAxis']['all'].push(item);
      //y轴类型（根据x轴得到）
      this.getYAxisType(chartSetting.summary_items['yAxis'], item, type);
    });


    //配置y轴
    if (!this.chart_item[type]['yAxis']['all_same']) {
      this.chart_item[type]['yAxis']['y_types'].forEach(typ => {
        chartSetting.summary_items['yAxis'][typ] = [];
      });
    }
    if (this.chart_item[type]['yAxis']['all_same']) {
      chartSetting.summary_items['yAxis']['all'] = [];
    }

    this.yAxis_items.forEach(item => {
      if (item['chartType'] && item['chartType'].indexOf(type) === -1) {
        return false;
      }
      if (!this.chart_item[type]['yAxis']['all_same']) { //all_same = false; y轴不一样
        //y轴列表项 会动态变化的逻辑
        if (item['extraShowType'] && item['extraShowType'].hasOwnProperty(type)) {
          item['extraShowType'][type].forEach(typ => {
            chartSetting.summary_items['yAxis'][typ].push(item);
          });
          return false;
        }
        this.chart_item[type]['yAxis']['y_types'].forEach(typ => {
          chartSetting.summary_items['yAxis'][typ].push(item);
        });
      }
      if (this.chart_item[type]['yAxis']['all_same']) {//y轴都一样
        chartSetting.summary_items['yAxis']['all'].push(item);
      }
    });


    //时间类型
    chartSetting.summary_items['time_type'] = [];
    this.time_type.forEach(timeItem => {
      if (timeItem['chartType'] && timeItem['chartType'].indexOf(type) === -1) {
        return false;
      }
      chartSetting.summary_items['time_type'].push(timeItem);

    });

    // 根据粒度，显示筛选配置
    chartSetting.summary_items['filter_items'] = {};
    chartSetting.summary_items['condition_details'] = {};
    chartSetting.summary_types.forEach(item => {
      chartSetting.summary_items['filter_items'][item['key']] = [];
    });

    this.filter_items.forEach(filter_item => {
      if (filter_item['chartType'] && filter_item['chartType'].indexOf(type) === -1) {
        return false;
      }
      //处理显示各异逻辑
      if (filter_item['extraShowType'] && filter_item['extraShowType'].hasOwnProperty(type)) {
        filter_item['extraShowType'][type].forEach(extraItem => {
          chartSetting.summary_items['filter_items'][extraItem].push(filter_item);
        });

        chartSetting.summary_items['condition_details'][filter_item['key']] = {
          data_type: filter_item['data_type']
        };
        if (!filter_item['op_type']) {
          chartSetting.summary_items['condition_details'][filter_item['key']]['op_type'] = 'number';
        } else {
          chartSetting.summary_items['condition_details'][filter_item['key']]['op_type'] = filter_item['op_type'];
        }
        if (this.condition_details.hasOwnProperty(filter_item['key'])) {
          chartSetting.summary_items['condition_details'][filter_item['key']]['select_items'] = this.condition_details[filter_item['key']];
        }

        return false;
      }

      chartSetting.summary_types.forEach(item => {
        if (filter_item['not_show'] && filter_item['not_show'][type] && filter_item['not_show'][type].indexOf(item['key']) !== -1) {
          return false;
        }
        chartSetting.summary_items['filter_items'][item['key']].push(filter_item);
      });

      if (!filter_item['key']) {
        return false;
      }
      chartSetting.summary_items['condition_details'][filter_item['key']] = {
        data_type: filter_item['data_type']
      };
      if (!filter_item['op_type']) {
        chartSetting.summary_items['condition_details'][filter_item['key']]['op_type'] = 'number';
      } else {
        chartSetting.summary_items['condition_details'][filter_item['key']]['op_type'] = filter_item['op_type'];
      }
      if (this.condition_details.hasOwnProperty(filter_item['key'])) {
        chartSetting.summary_items['condition_details'][filter_item['key']]['select_items'] = this.condition_details[filter_item['key']];
      }

    });

    // 根据粒度，显示x轴、y轴配置
    if (!this.chart_item_details[type]) {
      chartSetting.summary_items['chart_item_details'] = {};
      chartSetting.summary_types.forEach(item => {
        chartSetting.summary_items['chart_item_details'][item['key']] = {
          xAxis_type: 'all',
          yAxis_type: 'all',
        };
      });
    } else {
      // 根据粒度，显示x轴、y轴配置(针对x轴和y轴配置 动态变化的图表)
      chartSetting.summary_items['chart_item_details'] = this.chart_item_details[type];
    }

    return JSON.parse(JSON.stringify(chartSetting));
  }

  constructor(private customDatasService: CustomDatasService, private menuService: MenuService, private tableItemDatasService: TableItemDatasService) {
    this.initChartItemNewData();// 初始化chat数据
  }

  // 初始化chat数据
  initChartItemNewData() {
    const chartItemNewData = this.tableItemDatasService.chartItemNewData;
    this._summaryTypesAllChannelPublisher = this.getSourceData(chartItemNewData['summaryTypesAllChannelPublisher']);
    this.xAxisItemsAllChannelPublisher = this.getSourceData(chartItemNewData['xAxisItemsAllChannelPublisher']);
    this.yAxisItemAllChannelPublisher = this.getSourceData(chartItemNewData['yAxisItemAllChannelPublisher']);
    this.filterItemAllChannelPublisher = this.getSourceData(chartItemNewData['filterItemAllChannelPublisher']);
  }

  // 转换为源数据
  getSourceData(data) {
    const sourceData = {}
    for (const key in data) {
      if (key !== 'common') {
        sourceData[key] = [...data["common"], ...data[key]];
      }
    }
    return sourceData;
  }
}
