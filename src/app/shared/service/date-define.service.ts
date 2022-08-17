import { Injectable } from '@angular/core';

@Injectable()
export class DateDefineService {

  private _allDefineDate = {
    'day:0:0': { name: '今天', compareList: ['day:1:0', 'day:1:1', 'day:1:2', /**'day:1:3', 'day:1:4', 'day:1:5', */'day:1:6', 'day:1:13', 'day:1:29', 'week:0:0', 'week:1:0', 'month:0:0', 'month:1:0'] },
    'day:1:0': { name: '昨天', compareList: ['day:2:0', 'day:1:1', 'day:1:2', /**'day:1:3', 'day:1:4', 'day:1:5', */'day:1:6', 'day:1:13', 'day:1:29', 'day_last_year:1:0', 'week:0:0', 'week:1:0', 'month:0:0', 'month:1:0'] },
    'day:2:0': { name: '前天', compareList: [] },
    'day:1:1': { name: '近两天', compareList: ['day:1:2',/** 'day:1:3', 'day:1:4', 'day:1:5',*/ 'day:1:6', 'day:1:13', 'day:1:29'] },
    'day:1:2': { name: '近三天', compareList: [/**'day:1:3', 'day:1:4', 'day:1:5',*/ 'day:1:6', 'day:1:13', 'day:1:29'] },
    'day:1:3': { name: '近四天', compareList: ['day:1:4', 'day:1:5', 'day:1:6', 'day:1:13', 'day:1:29'] },
    'day:1:4': { name: '近五天', compareList: ['day:1:5', 'day:1:6', 'day:1:13', 'day:1:29'] },
    'day:1:5': { name: '近六天', compareList: ['day:1:6', 'day:1:13', 'day:1:29'] },
    'day:1:6': { name: '近七天', compareList: ['day:8:6', 'day:1:1', 'day:1:2', /**'day:1:3', 'day:1:4', 'day:1:5', */'day:1:13', 'day:1:29', 'week:0:0', 'week:1:0', 'month:0:0', 'month:1:0'] },
    'day:8:6': { name: '前七天', compareList: [] },
    'day_last_year:1:0': { name: '去年昨天', compareList: [] },
    'week:0:0': { name: '本周', compareList: ['week_same_period:1:0', 'week:1:0'] },
    'week_same_period:1:0': { name: '上周同期', compareList: [] },//新加
    'week:1:0': { name: '上周', compareList: ['week:2:0'] },
    'week:2:0': { name: '前一个周', compareList: [] },
    'day:1:13': { name: '近14天', compareList: ['day:1:6', 'day:2:0', 'day:1:0'] },
    'day:1:29': { name: '近30天', compareList: ['day:1:13', 'day:1:6', 'day:2:0', 'day:1:0'] },
    'day:1:179': { name: '近180天', compareList: [] },
    'day:1:364': { name: '近365天', compareList: [] },
    'month:0:0': { name: '本月', compareList: ['month_same_period:1:0', 'month:1:0'] },
    'month_same_period:1:0': { name: '上月同期', compareList: [] },//新加
    'month:1:0': { name: '上个月', compareList: ['month:2:0'] },
    'month:2:0': { name: '前一个月', compareList: [] },
    'year:0:0': { name: '今年', compareList: ['year_same_period:1:0', 'year:1:0'] },//新加
    'year_same_period:1:0': { name: '去年同期', compareList: [] },//新加
    'year:1:0': { name: '去年', compareList: [] },//新加
  };

  public getDateList(summaryType = 'account', channelId = 1, publisherId = 0, time_select: string = ''): any {
    let defaultDate;
    if (time_select == 'month') {
      defaultDate = [
        { key: 'month:0:0', name: '本月' },
        { key: 'month:1:0', name: '上月' },
        { key: 'month:2:-1', name: '前两月' },
        { key: 'year:0:0', name: '今年' },
        { key: 'year:1:0', name: '去年' },
        { key: 'year:2:0', name: '前年' },
        { key: 'year:2:-1', name: '前两年' },
      ];
    } else {
      defaultDate = [
        // { key: 'day:0:0', name: '今天', disable: ['creative', 'dsa_pattern_day'] },
        { key: 'day:1:0', name: '昨天' },
        { key: 'day:1:1', name: '近两天' },
        { key: 'day:1:2', name: '近三天' },
        // { key: 'day:1:3', name: '近四天' },
        // { key: 'day:1:4', name: '近五天' },
        // { key: 'day:1:5', name: '近六天' },
        { key: 'day:1:6', name: '近七天' },
        { key: 'week:0:0', name: '本周' },
        { key: 'week:1:0', name: '上周' },
        { key: 'day:1:13', name: '近14天' },
        { key: 'day:1:29', name: '近30天' },
        { key: 'month:0:0', name: '本月' },
        { key: 'month:1:0', name: '上个月' },
      ];
      if (channelId === 2) {
        defaultDate.unshift({ key: 'day:0:0', name: '今天', disable: ['dsa_pattern_day'] });
      } else {
        defaultDate.unshift({ key: 'day:0:0', name: '今天', disable: ['creative', 'dsa_pattern_day'] });
      }
      if (['advertiser', 'department', 'channel', 'publisher', 'account', 'campaign'].indexOf(summaryType) > -1) {
        defaultDate.push({ key: 'day:1:179', name: '近180天' });
      }
    }
    // defaultDate.push({ key: 'custom', name: '自定义' });
    defaultDate.unshift({ key: 'custom', name: '自定义' });
    return defaultDate;
  }

  public getCompareDateList(dateKey: string): any {
    if (this._allDefineDate[dateKey]) {
      const returnList = this._allDefineDate[dateKey]['compareList'];
      if (returnList.length > 0) {
        const result = [];
        returnList.forEach((item) => {
          result.push({ key: item, name: this._allDefineDate[item]['name'] });
        });
        result.unshift({ key: 'custom', name: '自定义' });
        // result.push({ key: 'custom', name: '自定义' });
        return result;
      } else {
        return [{ key: 'custom', name: '自定义' }];
      }
    } else {
      return [{ key: 'custom', name: '自定义' }];
    }

  }

  getDateNameByKey(dateKey): any {
    return this._allDefineDate[dateKey]['name'];
  }

  getDescOfDeinfeDate(dateKey): any {

  }

  constructor() {

  }

}
