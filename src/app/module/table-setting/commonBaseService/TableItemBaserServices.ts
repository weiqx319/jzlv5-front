import { isArray, isUndefined } from "@jzl/jzl-util";
import { deepCopy } from "@jzl/jzl-util";

export class TableItemBaserServices {

  protected _defaultFieldData = [];
  protected _initAllPubData = [];
  protected _dataTypeCompareType = {};
  private _onlyReportAttrData = ['pub_query', 'pub_query_id', "pub_creative_title", 'pub_creative_id', 'pub_keyword', 'pub_keyword_id', 'pub_adgroup_name', 'pub_adgorup_id', 'pub_campaign_name', 'pub_campaign_id', 'pub_account_name', 'pub_account_id', 'chan_pub_id', 'channel_id', 'publisher_id', 'cid', 'advertiser_id', 'advertiser_name', 'department', "query_status", "mix_wmatch_new_enum","pc_destination_url","wap_destination_url"];


  constructor(public customDataService) {

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
        },
        type: item.type
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

  public getTableItems(reportType: string, summaryType: string, selectedItems: any[], onlyReport = false, prohibitFilter?): any {
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


      if (this._dataTypeCompareType[item['data_type']]['reportType'].indexOf(reportType) === -1) {
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
      if (!this._dataTypeCompareType[returnObjKey]) {

        const dataTypeCompareType = deepCopy(this._dataTypeCompareType[item['data_type']]);
        dataTypeCompareType['name'] = dataTypeCompareType['name'] + '_' + item['category_name'];
        this._dataTypeCompareType[returnObjKey] = dataTypeCompareType;

      }

      if (this._dataTypeCompareType[returnObjKey] && !returnObj[returnObjKey]) {
        returnObj[returnObjKey] = { type: this._dataTypeCompareType[item['data_type']]['type'], name: this._dataTypeCompareType[returnObjKey]['name'], key: this._dataTypeCompareType[item['data_type']]['key'] };
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
          if (this._dataTypeCompareType[returnObjKey]['no_compare'] && this._dataTypeCompareType[returnObjKey]['no_compare'].indexOf(summaryType) !== -1) {
            returnObj[returnObjKey]['allIndexNum'] = { current: 1 };
            returnObj[returnObjKey]['allSelected'] = { current: false };
            returnObj[returnObjKey]['selectIndexNum'] = { current: 0 };
            returnObj[returnObjKey]['is_compare'] = false;
            selectedObj = { current: false };
          } else {
            returnObj[returnObjKey]['allIndexNum'] = { current: 1, compare: 1, compare_abs: 1, compare_rate: 1, avg: 1, percentage: 1, };
            returnObj[returnObjKey]['allSelected'] = { current: false, compare: false, compare_abs: false, compare_rate: false, avg: false, percentage: false };
            returnObj[returnObjKey]['selectIndexNum'] = { current: 0, compare: 0, compare_abs: 0, compare_rate: 0, avg: 0, percentage: 0 };
            returnObj[returnObjKey]['is_compare'] = true;
            selectedObj = { current: false, compare: false, compare_abs: false, compare_rate: false, avg: false, percentage: false };
          }

        }
        // 判断是否展示对比
        // if (onlyReport) {
        //   returnObj[returnObjKey]['is_compare'] = false;
        // }



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
      } else if (this._dataTypeCompareType[returnObjKey] && returnObj[returnObjKey]) {
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
          selectedObj = { current: false, compare: false, compare_abs: false, compare_rate: false, avg: false, percentage: false };
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
    selectedItems.sort((a, b) => {
      return (orderIndex[a.key] - orderIndex[b.key]);
    });
    return { attrs: Object.values(returnObj), selected: selectedItems };

  }

  public getTableSelectItems(reportType: string, summaryType: string, selectedItems: any[], locked, onlyReport = false, prohibitFilter?): any {
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

      if (this._dataTypeCompareType[item['data_type']]['reportType'].indexOf(reportType) === -1) {
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

      if (this._dataTypeCompareType[item['data_type']] && !returnObj[item['data_type']]) {
        returnObj[item['data_type']] = { type: this._dataTypeCompareType[item['data_type']]['type'], name: this._dataTypeCompareType[item['data_type']]['name'], key: this._dataTypeCompareType[item['data_type']]['key'] };
        returnObj[item['data_type']]['data'] = [];
        let selectedObj = {};
        /*    if (this._dataTypeCompareType[item['data_type']]['no_compare'] && this._dataTypeCompareType[item['data_type']]['no_compare'].indexOf(summaryType) !== -1) {

            }*/
        if (returnObj[item['data_type']]['type'] === 'basic') {
          returnObj[item['data_type']]['allIndexNum'] = { current: 1 };
          returnObj[item['data_type']]['allSelected'] = { current: false };
          returnObj[item['data_type']]['selectIndexNum'] = { current: 0 };
          selectedObj = { current: false };
        } else {
          if (this._dataTypeCompareType[item['data_type']]['no_compare'] && this._dataTypeCompareType[item['data_type']]['no_compare'].indexOf(summaryType) !== -1) {
            returnObj[item['data_type']]['allIndexNum'] = { current: 1 };
            returnObj[item['data_type']]['allSelected'] = { current: false };
            returnObj[item['data_type']]['selectIndexNum'] = { current: 0 };
            returnObj[item['data_type']]['is_compare'] = false;
            selectedObj = { current: false };
          } else {
            returnObj[item['data_type']]['allIndexNum'] = { current: 1, compare: 1, compare_abs: 1, compare_rate: 1, avg: 1, percentage: 1 };
            returnObj[item['data_type']]['allSelected'] = { current: false, compare: false, compare_abs: false, compare_rate: false, avg: false, percentage: false };
            returnObj[item['data_type']]['selectIndexNum'] = { current: 0, compare: 0, compare_abs: 0, compare_rate: 0, avg: 0, percentage: 0 };
            returnObj[item['data_type']]['is_compare'] = true;
            selectedObj = { current: false, compare: false, compare_abs: false, compare_rate: false, avg: false, percentage: false };
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
      } else if (this._dataTypeCompareType[item['data_type']] && returnObj[item['data_type']]) {
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
          selectedObj = { current: false, compare: false, compare_abs: false, compare_rate: false, avg: false, percentage: false };
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



  public generateHoursShow() {
    const hours = [];
    for (let i = 0; i <= 23; i++) {
      hours.push({ key: i, name: i });
    }
    return hours;
  }



}
