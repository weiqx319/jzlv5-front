import { Injectable } from '@angular/core';

import { isArray } from "@jzl/jzl-util";

@Injectable()
export class ReportChartService {

  protected lineYAxisNumMaxLimit = {
    'line': 5,
    'bar': 5,
    'pie': 1,
    'lineStack': 1
  };

  protected typeRelation = {
    'pub_attr_data': 'pub_data',
    'pub_metric_data': 'pub_data',
    'conversion_data': 'conversion_data',
    'metric_data': 'metric_data',
  };

  private _allXAxis = [
    { key: 'data_date', name: '时间', data_type: 'data_date', chartType: ['line', 'lineStack', 'bar'], reportType: ['basic_report', 'hours_report', 'region_report'], summaryType: ['channel', 'publisher', 'account', 'campaign', 'adgroup', 'keyword', 'search_keyword', 'creative'] },
    { key: 'hours', name: '时段', data_type: 'pub_data', chartType: ['bar'], reportType: ['hours_report'], field_name_key: '', summaryType: ['channel', 'publisher', 'account', 'campaign', 'adgroup', 'keyword', 'creative'] },
    { key: 'channel_id', name: '渠道', data_type: 'pub_data', chartType: ['bar'], reportType: ['basic_report', 'hours_report', 'region_report'], field_name_key: '', summaryType: ['channel'] },
    { key: 'publisher_id', name: '媒体', data_type: 'pub_data', chartType: ['bar'], reportType: ['basic_report', 'hours_report', 'region_report'], field_name_key: '', summaryType: ['publisher'] },
    { key: 'pub_account_id', name: '账户', data_type: 'pub_data', chartType: ['bar'], reportType: ['basic_report', 'hours_report', 'region_report'], field_name_key: 'pub_account_name', summaryType: ['account'] },
    { key: 'pub_campaign_id', name: '计划', data_type: 'pub_data', chartType: ['bar'], reportType: ['basic_report', 'hours_report', 'region_report'], field_name_key: 'pub_campaign_name', summaryType: ['campaign'] },
    { key: 'pub_adgroup_id', name: '单元', data_type: 'pub_data', chartType: ['bar'], reportType: ['basic_report', 'hours_report',], field_name_key: 'pub_adgroup_name', summaryType: ['adgroup'] },
    { key: 'pub_keyword_id', name: '关键词', data_type: 'pub_data', chartType: ['bar'], reportType: ['basic_report', 'hours_report'], field_name_key: 'pub_keyword', summaryType: ['keyword'] },
    { key: 'pub_query_id', name: ' 搜索词', data_type: 'pub_data', chartType: ['bar'], reportType: ['basic_report'], field_name_key: 'pub_query', summaryType: ['search_keyword'] },
    { key: 'pub_creative_id', name: '创意', data_type: 'pub_data', chartType: ['bar'], reportType: ['basic_report', 'hours_report'], field_name_key: 'pub_creative_title', summaryType: ['creative'] },
    { key: 'province_region', name: '省级地域', data_type: 'pub_data', chartType: ['bar'], reportType: ['region_report'], field_name_key: '', summaryType: ['channel', 'publisher', 'account', 'campaign'] },
    { key: 'city_region', name: '市级地域', data_type: 'pub_data', chartType: ['bar'], reportType: ['region_report'], field_name_key: '', summaryType: ['channel', 'publisher', 'account', 'campaign'] },
    { key: 'device', name: '设备', data_type: 'pub_data', field_name_key: '', chartType: ['bar'], summaryType: [] }
  ];
  constructor() { }


  getYAxisNumMaxLimit(type: string) {
    return this.lineYAxisNumMaxLimit[type];
  }

  hasX(type: string): boolean {
    return type !== 'pie';
  }


  getXArray(chartType: string, reportType: string, summaryType: string, lockedItem: any = []): any {
    if (chartType === 'pie') {
      return [];
    }
    const returnXAxis = [];
    if (reportType === 'dim_report' && isArray(lockedItem)) {
      lockedItem.forEach(item => {
        const tmpXAxis = {
          key: item.key, name: item.name, data_type: item.data_type, is_x: true, field_name_key: ''
        };
        returnXAxis.push(tmpXAxis);
      });
      return returnXAxis;
    } else {
      this._allXAxis.forEach((item: any) => {
        if (item.hasOwnProperty('summaryType') && item['summaryType'].indexOf(summaryType) > -1 && item.hasOwnProperty('reportType') && item['reportType'].indexOf(reportType) > -1 && item.hasOwnProperty('chartType') && item['chartType'].indexOf(chartType) > -1) {
          const tmpXAxis = {
            key: item.key, name: item.name, data_type: item.data_type, is_x: true, field_name_key: item.hasOwnProperty('field_name_key') ? item['field_name_key'] : ''
          };
          returnXAxis.push(tmpXAxis);
        }
      });
      return returnXAxis;
    }
  }


  getYArray(chartType: string, selectedItems = []): any {
    const returnYAxis = [];
    selectedItems.forEach((item: any) => {
      if (item['data_type'] && item['data_type'] !== 'pub_attr_data') {
        const tmpYAxis = {
          key: item.key, name: item.name, data_type: this.typeRelation[item.data_type], is_x: false, type: chartType
        };
        returnYAxis.push(tmpYAxis);

      }
    });
    return returnYAxis;
  }


}
