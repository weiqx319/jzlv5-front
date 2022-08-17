import { Injectable } from '@angular/core';
import { CustomDatasService } from "../../../shared/service/custom-datas.service";
import { TableItemDatasService } from "../../../shared/service/table-item-datas";
import { isArray, isUndefined } from "@jzl/jzl-util";
import { MenuService } from '../../../core/service/menu.service';
import { deepCopy } from "@jzl/jzl-util";

@Injectable()
export class TableItemFeedService {
  private summaryType;
  private _lockedItemType;
  private originalLockedItemType;
  private _dataTypeCompareType;
  private _pubDataDefault;
  private _pubDate;
  private _defaultFieldData;
  public tipMap = {};
  public defaultItemFilters = {};
  private _initAllPubData = [];
  public channel_id;
  public publisher_id;
  public key;
  private _onlyReportAttrData = ['pub_query', 'pub_query_id', "pub_creative_title", 'pub_creative_id', 'pub_keyword', 'pub_keyword_id', 'pub_adgroup_name', 'pub_adgorup_id', 'pub_campaign_name', 'pub_campaign_id', 'pub_account_name', 'pub_account_id', 'chan_pub_id', 'channel_id', 'publisher_id', 'cid', 'advertiser_id', 'advertiser_name', 'department', "query_status", "mix_wmatch_new_enum"];

  constructor(
    private customDataService: CustomDatasService,
    private tableItemDatasService: TableItemDatasService,
    private menuService: MenuService
  ) {
    this.channel_id = this.menuService.currentChannelId;
    this.publisher_id = this.menuService.currentPublisherId;
    this.key = `${this.channel_id}_${this.publisher_id}`;
    this.defaultItemFilters = { ...customDataService.defaultFeedItemFilters };

    // 给默认数据赋值
    const tableItemFeedData = this.tableItemDatasService.tableItemFeedData;
    if (tableItemFeedData) {
      this.summaryType = JSON.parse(JSON.stringify(tableItemFeedData['summaryType']));
      this._lockedItemType = JSON.parse(JSON.stringify(tableItemFeedData['lockedItemType']));
      this.originalLockedItemType = JSON.parse(JSON.stringify(tableItemFeedData['lockedItemType']));
      this._dataTypeCompareType = JSON.parse(JSON.stringify(tableItemFeedData['dataTypeCompareType']));
      this._pubDataDefault = JSON.parse(JSON.stringify(tableItemFeedData['pubDataDefault']));
      this._pubDate = JSON.parse(JSON.stringify(tableItemFeedData['pubDate']));
      this._defaultFieldData = JSON.parse(JSON.stringify(tableItemFeedData['defaultFieldData']));
    }

    this.initCustomData();
  }

  public getDefaultItemsBySummaryType(summaryType) {
    const defaultField = [];
    this._defaultFieldData.forEach(item => {
      if (item.hasOwnProperty('summaryType') && item['summaryType'].indexOf(summaryType) === -1) {  // 根据summaryType去生成最终数据结构
        return false;
      }
      defaultField.push({
        ...item,
        name: item.name,
        key: item.key,
        data_type: item.data_type,
        width: item.width,
        is_rate: item['is_rate'] ? item['is_rate'] : 0,
        showKey: item['showKey'] ? item['showKey'] : '',
        selected: {
          "current": true,
          "compare": false,
          "compare_abs": false,
          "compare_rate": false,
          "avg": false,
          "percentage": false,
        }
      });
    });
    const defaultConversionCol = this.customDataService.getConversionData().filter(item => !!item.is_default);
    defaultConversionCol.forEach(item => {
      defaultField.push({
        name: item.name,
        key: item.key,
        remarks: item.remarks,
        type: item.type,
        data_type: 'conversion_data',
        width: 114,
        selected: {
          current: true,
          compare: false,
          compare_abs: false,
          compare_rate: false,
          "avg": false,
          "percentage": false,
        },
      });
    });
    return defaultField;

  }

  public getItemFilterType(summary_type) {
    let itemFilters = {};
    const typeKey = `${this.menuService.currentChannelId}_${this.menuService.currentPublisherId}`;
    itemFilters = { ...this.customDataService.getItemFeedFilterType(summary_type, typeKey) };
    return itemFilters;
  };


  initCustomData(): void {
    const data = this.customDataService.getInitCustomFeedData();
    this._initAllPubData = data._initAllPubData;
    this.tipMap = data.tipMap;
  }


  public getSummaryTypes(type): any[] {
    const returnResult = [];
    if (type === 'dim_report') {
      this.customDataService.getDimData().map(
        item => {
          returnResult.push({ key: item.key, name: item.name, data_type: 'dim_data' });
        });
    } else {
      this.summaryType.forEach(item => {
        if (item.reportType.indexOf(type) > -1) {
          returnResult.push({ key: item.key, name: item.name });
        }
      });
    }

    returnResult.forEach(element => {
      if (this.publisher_id === 7) {
        if (element.key === 'campaign') element.name = '广告组';
        if (element.key === 'adgroup') element.name = '计划';
      } else if (this.publisher_id === 17) {
        if (element.key === 'campaign') element.name = '推广组';
        if (element.key === 'adgroup') element.name = '计划'
      } else if (this.publisher_id === 19) {
        if (element.key === 'campaign') element.name = '推广任务';
        if (element.key === 'adgroup') element.name = '广告';
      } else if (this.publisher_id === 6) {
        if (element.key === 'campaign') element.name = '推广计划';
        if (element.key === 'adgroup') element.name = '广告';
      } else if (this.publisher_id === 20) {
        if (element.key === 'campaign') element.name = '广告系列';
        if (element.key === 'adgroup') element.name = '广告组';
      }
    });

    return returnResult;
  }

  public getLockedItemsBySummaryType(type, report_type = 'basic_report', onlyReport?) {
    if (report_type === 'dim_report') {
      const findDim = this.customDataService.getDimData().find(item => item.key === type);
      if (isUndefined(findDim)) {
        return [];
      } else {
        return [{ name: findDim['name'], key: findDim['key'], data_type: 'dim_data' }];
      }
    } else {
      const product_id = this.menuService.currentChannelId + '_' + this.menuService.currentPublisherId;
      const lockedCreativeItem = [];
      if (this.originalLockedItemType['creative'][product_id]) {
        this.originalLockedItemType['creative'][product_id].forEach(element => {
          if (onlyReport && element['not_show_analytics_report']) {
            return;
          } else {
            lockedCreativeItem.push(element);
          }
        });
      }
      this._lockedItemType['creative'] = lockedCreativeItem || [];
      this._lockedItemType['keyword'] = this.originalLockedItemType['keyword'][product_id] || [];


      const publisher_id = this.menuService.currentPublisherId;
      this._lockedItemType['campaign'] = { name: "计划", key: "pub_campaign_name", width: '280', type: 'string', data_type: 'pub_attr_data' };
      this._lockedItemType['adgroup'] = { name: "单元", key: "pub_adgroup_name", width: '280', type: 'string', data_type: 'pub_attr_data' };

      if (publisher_id === 7) {
        this._lockedItemType['campaign']['name'] = "广告组";
        this._lockedItemType['adgroup']['name'] = "计划";
      } else if (publisher_id === 17) {
        this._lockedItemType['campaign']['name'] = "推广组";
        this._lockedItemType['adgroup']['name'] = "计划";
      } else if (publisher_id === 19) {
        this._lockedItemType['campaign']['name'] = "应用";
        this._lockedItemType['adgroup']['name'] = "推广任务";
      } else if (publisher_id === 6) {
        this._lockedItemType['campaign']['name'] = "推广计划";
        this._lockedItemType['adgroup']['name'] = "广告";
      } else if (this.publisher_id === 20) {
        this._lockedItemType['campaign']['name'] = '广告系列';
        this._lockedItemType['adgroup']['name'] = '广告组';
      }

      if (isArray(this._lockedItemType[type])) {
        const resultLocked = [];
        const dataLockList = [];
        this.customDataService.getBizUnitData().forEach(item => {
          // this._pubDate.push({width: '160', name: item.name, key: item.key, data_type: 'pub_lock_data', summaryType: ['biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region'],  locking: ['biz_unit_account', 'biz_unit_account_hour', 'biz_unit_account_region'], conditionType: ['none'], type: 'string'});
          dataLockList.push({ width: '160', name: item.name, key: item.key + '_name', data_type: 'pub_lock_data', type: 'string', summaryType: ['biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region'], conditionType: ['none'] });

        });
        if (report_type.startsWith('biz_unit_')) {
          if (type === 'biz_unit_account_region') {
            this._lockedItemType[type].splice(0, 0, ...dataLockList);
          } else {
            if (type === 'responsible_account') {
            } else {
              this._lockedItemType[type].push(...dataLockList);

            }
          }
        }

        this._lockedItemType[type].forEach(item => {
          resultLocked.push(Object.assign({}, item));
        });

        return resultLocked;
      } else {
        return [Object.assign({}, this._lockedItemType[type])];
      }
    }
  }

  public refreshPubData(data) {
    const key = `${this.menuService.currentChannelId}_${this.menuService.currentPublisherId}`;
    this._pubDate[key] = [...this._pubDate[key], ...data];
    this.initCustomData();
  }

  public getTableItemsObj(reportType: string, summaryType: string): any {
    const dataTypeCompareTemp = this._dataTypeCompareType.hasOwnProperty(this.key) ? this._dataTypeCompareType[this.key] : {};
    const tableItems = {};

    this._initAllPubData.forEach(item => {
      if (dataTypeCompareTemp[item['data_type']] === undefined) {
        return false;
      }

      if (dataTypeCompareTemp[item['data_type']]['reportType'].indexOf(reportType) === -1) {

        return false;
      }

      if (dataTypeCompareTemp[item['data_type']]['summaryType'] && dataTypeCompareTemp[item['data_type']]['summaryType'].indexOf(reportType) === -1) {

        return false;
      }



      if (dataTypeCompareTemp[item['data_type']]['notShowSummaryType'] && dataTypeCompareTemp[item['data_type']]['notShowSummaryType'].indexOf(summaryType) !== -1) {

        return false;
      }

      if (item.hasOwnProperty('reportType') && item['reportType'].indexOf(reportType) === -1) {  // 根据summaryType去生成最终数据结构

        return false;
      }

      if (item.hasOwnProperty('notReportType') && item['notReportType'].indexOf(reportType) !== -1) {  // 根据summaryType去生成最终数据结构
        return false;
      }



      if (item.hasOwnProperty('summaryType') && item['summaryType'].indexOf(summaryType) === -1) {  // 根据summaryType去生成最终数据结构
        return false;
      }


      if (item.hasOwnProperty('not_show_summaryType') && item['not_show_summaryType'].indexOf(summaryType) !== -1) {
        return false;
      }

      tableItems[item.key] = item['name'];
    });

    return tableItems;

  }


  public getTableItems(reportType: string, summaryType: string, selectedItems: any[], onlyReport = false, prohibitFilter?): any {
    const dataTypeCompareTemp = this._dataTypeCompareType.hasOwnProperty(this.key) ? this._dataTypeCompareType[this.key] : {};
    const selectedItemsObj = {};
    const orderIndex = {};
    selectedItems.forEach((item, index) => {
      selectedItemsObj[item.key] = Object.assign({}, item);
      orderIndex[item.key] = index;
    });
    selectedItems = [];
    const returnObj = {};
    this._initAllPubData.forEach(item => {
      if (dataTypeCompareTemp[item['data_type']] === undefined) {
        return false;
      }

      if (onlyReport && ['pub_attr_data', 'pub_dimension_data', 'optimization_ranking_group', 'folder_list', 'optimization_ranking_data', 'real_ranking', 'optimization_effect_data', 'dim_data'].indexOf(item.data_type) > -1 && this._onlyReportAttrData.indexOf(item.key) == -1) {
        return;
      }
      if (onlyReport && item['not_show_analytics_report']) {
        return;
      }

      if (dataTypeCompareTemp[item['data_type']]['reportType'].indexOf(reportType) === -1) {
        return false;
      }

      if (dataTypeCompareTemp[item['data_type']]['summaryType'] && dataTypeCompareTemp[item['data_type']]['summaryType'].indexOf(summaryType) === -1) {

        return false;
      }

      if (dataTypeCompareTemp[item['data_type']]['notShowSummaryType'] && dataTypeCompareTemp[item['data_type']]['notShowSummaryType'].indexOf(summaryType) !== -1) {

        return false;
      }


      if (item.hasOwnProperty('reportType') && item['reportType'].indexOf(reportType) === -1) {  // 根据summaryType去生成最终数据结构

        return false;
      }

      if (item.hasOwnProperty('notReportType') && item['notReportType'].indexOf(reportType) !== -1) {  // 根据summaryType去生成最终数据结构
        return false;
      }


      if (item.hasOwnProperty('summaryType') && item['summaryType'].indexOf(summaryType) === -1) {  // 根据summaryType去生成最终数据结构
        return false;
      }



      if (item.hasOwnProperty('not_show_summaryType') && item['not_show_summaryType'].indexOf(summaryType) !== -1) {
        return false;
      }
      if (prohibitFilter && item.hasOwnProperty('prohibitFilter')) {
        return false;
      }

      // 自定义指标-分类展示（替换）
      const returnObjKey = item['category_id'] ? item['data_type'] + item['category_id'] : item['data_type'];

      if (!dataTypeCompareTemp[returnObjKey]) {
        const dataTypeCompareType = deepCopy(dataTypeCompareTemp[item['data_type']]);
        dataTypeCompareType['name'] = dataTypeCompareType['name'] + '_' + item['category_name'];
        dataTypeCompareTemp[returnObjKey] = dataTypeCompareType;
      }

      if (dataTypeCompareTemp[returnObjKey] && !returnObj[returnObjKey]) {
        returnObj[returnObjKey] = { type: dataTypeCompareTemp[returnObjKey]['type'], name: dataTypeCompareTemp[returnObjKey]['name'], key: dataTypeCompareTemp[item['data_type']]['key'] };
        returnObj[returnObjKey]['data'] = [];
        let selectedObj = {};
        /*    if (this._dataTypeCompareType[item['data_type']]['no_compare'] && this._dataTypeCompareType[item['data_type']]['no_compare'].indexOf(summaryType) !== -1) {

            }*/
        if (returnObj[returnObjKey]['type'] === 'basic') {
          returnObj[returnObjKey]['allIndexNum'] = { current: 1 };
          returnObj[returnObjKey]['allSelected'] = { current: false };
          returnObj[returnObjKey]['selectIndexNum'] = { current: 0 };
          selectedObj = { current: false };
        } else {
          if (dataTypeCompareTemp[returnObjKey]['no_compare'] && dataTypeCompareTemp[returnObjKey]['no_compare'].indexOf(summaryType) !== -1) {
            returnObj[returnObjKey]['allIndexNum'] = { current: 1 };
            returnObj[returnObjKey]['allSelected'] = { current: false };
            returnObj[returnObjKey]['selectIndexNum'] = { current: 0 };
            returnObj[returnObjKey]['is_compare'] = false;
            selectedObj = { current: false };
          } else {
            returnObj[returnObjKey]['allIndexNum'] = { current: 1, compare: 1, compare_abs: 1, compare_rate: 1, percentage: 1, avg: 1 };
            returnObj[returnObjKey]['allSelected'] = { current: false, compare: false, compare_abs: false, compare_rate: false, percentage: false, avg: false };
            returnObj[returnObjKey]['selectIndexNum'] = { current: 0, compare: 0, compare_abs: 0, compare_rate: 0, percentage: 0, avg: 0 };
            returnObj[returnObjKey]['is_compare'] = true;
            selectedObj = { current: false, compare: false, compare_abs: false, compare_rate: false, percentage: false, avg: false };
          }

        }
        const readyItem = Object.assign({}, item, { selected: selectedObj });
        if (selectedItemsObj[item['key']] && selectedItemsObj[item['key']]['selected']) {
          Object.keys(selectedItemsObj[item['key']]['selected']).forEach(selectType => {
            readyItem['selected'][selectType] = selectedItemsObj[item['key']]['selected'][selectType];
            if (readyItem['selected'][selectType]) {
              returnObj[returnObjKey]['selectIndexNum'][selectType]++;
            }
            returnObj[returnObjKey]['allSelected'][selectType] = returnObj[returnObjKey]['selectIndexNum'][selectType] === returnObj[returnObjKey]['allIndexNum'][selectType];
          });
          selectedItems.push(readyItem);
        }
        returnObj[returnObjKey]['data'].push(readyItem);
      } else if (dataTypeCompareTemp[returnObjKey] && returnObj[returnObjKey]) {
        let selectedObj = {};
        if (returnObj[returnObjKey]['type'] === 'basic') {
          Object.keys(returnObj[returnObjKey]['allIndexNum']).forEach(selectType => {
            returnObj[returnObjKey]['allIndexNum'][selectType]++;
          });
          selectedObj = { current: false };
        } else {
          Object.keys(returnObj[returnObjKey]['allIndexNum']).forEach(selectType => {
            returnObj[returnObjKey]['allIndexNum'][selectType]++;
          });

          selectedObj = { current: false, compare: false, compare_abs: false, compare_rate: false, percentage: false, avg: false };
        }
        const readyItem = Object.assign({}, item, { selected: selectedObj });
        if (selectedItemsObj[item['key']] && selectedItemsObj[item['key']]['selected']) {
          Object.keys(selectedItemsObj[item['key']]['selected']).forEach(selectType => {
            readyItem['selected'][selectType] = selectedItemsObj[item['key']]['selected'][selectType];
            if (readyItem['selected'][selectType]) {
              returnObj[returnObjKey]['selectIndexNum'][selectType]++;
            }
            returnObj[returnObjKey]['allSelected'][selectType] = returnObj[returnObjKey]['selectIndexNum'][selectType] === returnObj[returnObjKey]['allIndexNum'][selectType];
          });
          selectedItems.push(readyItem);
        }
        returnObj[returnObjKey]['data'].push(readyItem);
      }

    });


    const lastKeepSortObj = {};
    Object.keys(dataTypeCompareTemp).forEach((item) => {
      if (returnObj.hasOwnProperty(item)) {
        lastKeepSortObj[item] = returnObj[item];
      }
    });

    selectedItems.sort((a, b) => {
      return (orderIndex[a.key] - orderIndex[b.key]);
    });
    return { attrs: Object.values(lastKeepSortObj), selected: selectedItems };

  }

  public getTableSelectItems(reportType: string, summaryType: string, selectedItems: any[], locked, onlyReport = false, prohibitFilter?,): any {
    const dataTypeCompareTemp = this._dataTypeCompareType.hasOwnProperty(this.key) ? this._dataTypeCompareType[this.key] : {};

    const selectedItemsObj = {};
    const orderIndex = {};
    selectedItems.forEach((item, index) => {
      selectedItemsObj[item.key] = Object.assign({}, item);
      orderIndex[item.key] = index;
    });
    selectedItems = [];
    const returnObj = {};

    this._initAllPubData.forEach(item => {
      if (onlyReport && ['pub_attr_data', 'pub_dimension_data', 'optimization_ranking_group', 'folder_list', 'optimization_ranking_data', 'real_ranking', 'optimization_effect_data', 'dim_data'].indexOf(item.data_type) > -1 && this._onlyReportAttrData.indexOf(item.key) == -1) {
        return;
      }
      if (onlyReport && item['not_show_analytics_report']) {
        return;
      }

      if (!dataTypeCompareTemp[item['data_type']]) {
        return false;
      }

      if (dataTypeCompareTemp[item['data_type']]['reportType'].indexOf(reportType) === -1) {
        return false;
      }

      if (item.hasOwnProperty('summaryType') && item['summaryType'].indexOf(summaryType) === -1) {  // 根据summaryType去生成最终数据结构
        return false;
      }


      if (item.hasOwnProperty('not_show_summaryType') && item['not_show_summaryType'].indexOf(summaryType) !== -1) {
        return false;
      }
      if (prohibitFilter && item.hasOwnProperty('prohibitFilter')) {
        return false;
      }

      if (item.hasOwnProperty('is_select')) {
        let isHas = false;
        for (let i = 0; i < locked.length; i++) {
          if (locked[i]['key'] === item['key']) {
            isHas = true;
            break;
          }
        }
        if (!isHas) {
          return false;
        }
      }
      // console.log(item);

      if (dataTypeCompareTemp[item['data_type']] && !returnObj[item['data_type']]) {
        returnObj[item['data_type']] = { type: dataTypeCompareTemp[item['data_type']]['type'], name: dataTypeCompareTemp[item['data_type']]['name'], key: dataTypeCompareTemp[item['data_type']]['key'] };
        returnObj[item['data_type']]['data'] = [];
        let selectedObj = {};
        /*    if (dataTypeCompareTemp[item['data_type']]['no_compare'] && dataTypeCompareTemp[item['data_type']]['no_compare'].indexOf(summaryType) !== -1) {

            }*/
        if (returnObj[item['data_type']]['type'] === 'basic') {
          returnObj[item['data_type']]['allIndexNum'] = { current: 1 };
          returnObj[item['data_type']]['allSelected'] = { current: false };
          returnObj[item['data_type']]['selectIndexNum'] = { current: 0 };
          selectedObj = { current: false };
        } else {
          if (dataTypeCompareTemp[item['data_type']]['no_compare'] && dataTypeCompareTemp[item['data_type']]['no_compare'].indexOf(summaryType) !== -1) {
            returnObj[item['data_type']]['allIndexNum'] = { current: 1 };
            returnObj[item['data_type']]['allSelected'] = { current: false };
            returnObj[item['data_type']]['selectIndexNum'] = { current: 0 };
            returnObj[item['data_type']]['is_compare'] = false;
            selectedObj = { current: false };
          } else {
            returnObj[item['data_type']]['allIndexNum'] = { current: 1, compare: 1, compare_abs: 1, compare_rate: 1, percentage: 1, avg: 1 };
            returnObj[item['data_type']]['allSelected'] = { current: false, compare: false, compare_abs: false, compare_rate: false, percentage: false, avg: false };
            returnObj[item['data_type']]['selectIndexNum'] = { current: 0, compare: 0, compare_abs: 0, compare_rate: 0, percentage: 0, avg: 0 };
            returnObj[item['data_type']]['is_compare'] = true;
            selectedObj = { current: false, compare: false, compare_abs: false, compare_rate: false, percentage: false, avg: false };
          }

        }
        const readyItem = Object.assign({}, item, { selected: selectedObj });
        if (selectedItemsObj[item['key']] && selectedItemsObj[item['key']]['selected']) {
          Object.keys(selectedItemsObj[item['key']]['selected']).forEach(selectType => {
            readyItem['selected'][selectType] = selectedItemsObj[item['key']]['selected'][selectType];
            if (readyItem['selected'][selectType]) {
              returnObj[item['data_type']]['selectIndexNum'][selectType]++;
            }
            returnObj[item['data_type']]['allSelected'][selectType] = returnObj[item['data_type']]['selectIndexNum'][selectType] === returnObj[item['data_type']]['allIndexNum'][selectType];
          });
          selectedItems.push(readyItem);
        }
        returnObj[item['data_type']]['data'].push(readyItem);
      } else if (dataTypeCompareTemp[item['data_type']] && returnObj[item['data_type']]) {
        let selectedObj = {};
        if (returnObj[item['data_type']]['type'] === 'basic') {
          Object.keys(returnObj[item['data_type']]['allIndexNum']).forEach(selectType => {
            returnObj[item['data_type']]['allIndexNum'][selectType]++;
          });
          selectedObj = { current: false };
        } else {
          Object.keys(returnObj[item['data_type']]['allIndexNum']).forEach(selectType => {
            returnObj[item['data_type']]['allIndexNum'][selectType]++;
          });

          selectedObj = { current: false, compare: false, compare_abs: false, compare_rate: false, percentage: false, avg: false };
        }
        const readyItem = Object.assign({}, item, { selected: selectedObj });
        if (selectedItemsObj[item['key']] && selectedItemsObj[item['key']]['selected']) {
          Object.keys(selectedItemsObj[item['key']]['selected']).forEach(selectType => {
            readyItem['selected'][selectType] = selectedItemsObj[item['key']]['selected'][selectType];
            if (readyItem['selected'][selectType]) {
              returnObj[item['data_type']]['selectIndexNum'][selectType]++;
            }
            returnObj[item['data_type']]['allSelected'][selectType] = returnObj[item['data_type']]['selectIndexNum'][selectType] === returnObj[item['data_type']]['allIndexNum'][selectType];
          });
          selectedItems.push(readyItem);
        }
        returnObj[item['data_type']]['data'].push(readyItem);
      }

    });
    selectedItems.sort((a, b) => {
      return (orderIndex[a.key] - orderIndex[b.key]);
    });
    return { attrs: Object.values(returnObj), selected: selectedItems };

  }


  public getAllTableFilterItems(reportType: string, summaryType: string, is_compare: boolean, onlyReport = false, selectedItems?: any[], lockItems?) {
    const lockItem = JSON.parse(JSON.stringify(this.getLockedItemsBySummaryType(summaryType, reportType)));
    const filterItems = [];
    const filterItemsMap = {};
    const allFilterOption = this.getItemFilterType(summaryType);
    if (summaryType !== 'biz_unit_account_hours' && summaryType !== 'biz_unit_account_region' && summaryType !== 'biz_unit_account' && summaryType !== 'landing_page_account') {
      if (lockItem.length) {
        lockItem.forEach(item => {
          if (!item['notScreen'] && (allFilterOption[item.key] || allFilterOption[item.showKey])) {
            filterItems.push(item); //添加固定项
            filterItemsMap[item.key] = item;
          }
        });
      }
    }

    if (selectedItems) {
      let newSelectedItems = [];
      if (lockItems) {
        newSelectedItems = [...lockItems, ...selectedItems];
      } else {
        newSelectedItems = [...selectedItems];

      }
      let tableItems = [];
      if (lockItems) {
        tableItems = JSON.parse(JSON.stringify(this.getTableSelectItems(reportType, summaryType, newSelectedItems, lockItems, onlyReport, true)));
      } else {
        tableItems = JSON.parse(JSON.stringify(this.getTableItems(reportType, summaryType, newSelectedItems, onlyReport, true)));
      }

      tableItems['attrs'].forEach(item => {
        if (item['type'] === 'basic') {
          item['data'].forEach(baseItem => {
            if (!baseItem['notScreen']) {
              if (baseItem['filterKey']) {
                baseItem['key'] = baseItem['filterKey'];
              }
              if (!filterItemsMap[baseItem['key']]) {
                filterItems.push(baseItem);
              }
            }
          });
        }

        if (item['type'] === 'compare') {//对比
          item['data'].forEach(comp => {
            if (!comp['notScreen']) {
              filterItems.push(comp);
              if (is_compare) {
                const copyItem_cmp = JSON.parse(JSON.stringify(comp));
                copyItem_cmp['key'] = comp['key'] + '_cmp';
                copyItem_cmp['name'] = comp['name'] + '#';
                const copyItem_abs = JSON.parse(JSON.stringify(comp));
                copyItem_abs['key'] = comp['key'] + '_abs';
                copyItem_abs['name'] = comp['name'] + '△';
                const copyItem_rate = JSON.parse(JSON.stringify(comp));
                copyItem_rate['key'] = comp['key'] + '_rat';
                copyItem_rate['name'] = comp['name'] + '%';
                filterItems.push(...[copyItem_cmp, copyItem_abs, copyItem_rate]);
              }
            }

          });

        }
      });
    }

    return filterItems;
  }


  public getTableFilterItems(reportType: string, summaryType: string) {
    const dataTypeCompareTemp = this._dataTypeCompareType[this.key];

    const returnConditionResult = [];
    this._initAllPubData.forEach(item => {
      if (dataTypeCompareTemp[item['data_type']]['reportType'].indexOf(reportType) === -1) {
        return false;
      }
      if (item.hasOwnProperty('conditionType') && item['conditionType'].indexOf(summaryType) === -1) {  // 根据summaryType去生成最终数据结构
        return false;
      }

      // if (this._pubDataCondtionSetting[item['key']]) {
      //   const readyItem = Object.assign({}, item);
      // } else {
      //   const readyItem = Object.assign({}, item);
      // }
      const readyItem = Object.assign({}, item);
      returnConditionResult.push(readyItem);
    });
    return returnConditionResult;

  }


  public getOptimizationList(params) {
    return this.customDataService.getOptimizationList(params);
  }

}
