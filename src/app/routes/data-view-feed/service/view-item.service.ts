import { Injectable } from '@angular/core';
import { CustomDatasService } from "../../../shared/service/custom-datas.service";
import { isArray } from "@jzl/jzl-util";
import { MenuService } from '../../../core/service/menu.service';
import { TableItemDatasService } from "../../../shared/service/table-item-datas";
import { Router } from "@angular/router";

@Injectable()
export class ViewItemService {

  private _defaultFieldData;
  private _lockedItemType;
  private originalLockedItemType;
  private _endLockedItemType

  public defaultItemFilters = {};

  private _chartItem;
  private _onlyReportAttrData = ['pub_query', 'pub_query_id', "pub_creative_title", 'pub_creative_id', 'pub_keyword', 'pub_keyword_id', 'pub_adgroup_name', 'pub_adgorup_id', 'pub_campaign_name', 'pub_campaign_id', 'pub_account_name', 'pub_account_id', 'chan_pub_id', 'channel_id', 'publisher_id', 'cid', 'advertiser_id', 'advertiser_name', 'department', "query_status", "mix_wmatch_new_enum"];

  constructor(
    private customDataService: CustomDatasService,
    private menuService: MenuService,
    private tableItemDatasService: TableItemDatasService,
    private router: Router,
  ) {
    const viewItemData = this.tableItemDatasService.pageViewItemData['data_view_feed']
    this._defaultFieldData = JSON.parse(JSON.stringify(viewItemData['defaultFieldData']));
    this._lockedItemType = JSON.parse(JSON.stringify(viewItemData['lockedItemType']));
    this.originalLockedItemType = JSON.parse(JSON.stringify(viewItemData['lockedItemType']));
    this._endLockedItemType = JSON.parse(JSON.stringify(viewItemData['endLockedItemType']));
    this._chartItem = JSON.parse(JSON.stringify(viewItemData['chartItem']));

    this.defaultItemFilters = { ...customDataService.defaultFeedItemFilters };
  }

  public getDefaultItemsBySummaryType(summaryType, onlyReport?, reportType?) {
    const defaultField = [];
    const key = `${this.menuService.currentChannelId}_${this.menuService.currentPublisherId}`;
    const fieldDataTemp = this._defaultFieldData.hasOwnProperty(key) ? this._defaultFieldData[key] : [];
    fieldDataTemp.forEach(item => {
      const itemWidth = item.name.length * 12 + 48 < item.width ? item.width : item.name.length * 12 + 48;//根据name计算width
      if (summaryType === 'conversion_report') {
        if (item.hasOwnProperty('summaryType') && item['summaryType'].indexOf(summaryType) !== -1) {
          defaultField.push({
            ...item,
            name: item.name,
            key: item.key,
            data_type: item.data_type,
            width: itemWidth,
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
        }
      } else {
        if (onlyReport && ['pub_attr_data', 'optimization_ranking_group', 'folder_list', 'optimization_ranking_data', 'real_ranking', 'optimization_effect_data', 'dim_data'].indexOf(item.data_type) > -1 && this._onlyReportAttrData.indexOf(item.key) == -1) {
          return;
        }
        if (item.hasOwnProperty('summaryType') && item['summaryType'].indexOf(summaryType) === -1) {  // 根据summaryType去生成最终数据结构
          return false;
        }
        defaultField.push({
          ...item,
          name: item.name,
          key: item.key,
          data_type: item.data_type,
          width: itemWidth,
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
      }


    });
    if (summaryType !== 'target' && reportType !== 'target_report') {
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
    }

    return defaultField;

  }


  public getChartItem() {
    const chartItems = this._chartItem.map(item => Object.assign({}, item));
    const tableItemLists = this.customDataService.tableItemLists;

    let key = `${this.menuService.currentChannelId}_${this.menuService.currentPublisherId}`;
    if (this.router.url.endsWith("/data_view/feed/target")) {
      key = key + '_target';
    }

    if (tableItemLists[key]) {
      tableItemLists[key].map(item => {
        chartItems.push({
          width: '112',
          name: item['name'],
          key: item['key'],
          data_type: item.data_type,
          type: 'number'
        });
      });
    }

    return chartItems;
  }

  public getLockedItemsBySummaryType(summaryType, onlyReport?) {
    /* if (Object.keys(this._lockedItemType).indexOf(summaryType) !== -1) {
       return [Object.assign({}, this._lockedItemType[summaryType])];
     } else {
       return [Object.assign({}, this._lockedItemType['channel'])];
     }*/

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
    // this._lockedItemType['creative'] = this.originalLockedItemType['creative'][product_id] || [];
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
    } else if (publisher_id === 20) {
      this._lockedItemType['campaign']['name'] = '广告系列';
      this._lockedItemType['adgroup']['name'] = '广告组';
    }



    if (Object.keys(this._lockedItemType).indexOf(summaryType) !== -1) {
      if (isArray(this._lockedItemType[summaryType])) {
        const resultLocked = [];
        this._lockedItemType[summaryType].forEach(item => {
          resultLocked.push(Object.assign({}, item));
        });
        return resultLocked;
      } else {
        return [Object.assign({}, this._lockedItemType[summaryType])];
      }
    } else {
      if (summaryType !== 'conversion_report') {
        return [Object.assign({}, this._lockedItemType['channel'])];
      } else {
        return [];
      }
    }

  }



  public getEndLockedItemsBySummaryType(summaryType) {
    if (Object.keys(this._endLockedItemType).indexOf(summaryType) !== -1) {
      return [Object.assign({}, this._endLockedItemType[summaryType])];
    } else {
      return [];
    }

  }

  public getItemFilterType(summary_type) {
    let itemFilters = {};
    const typeKey = `${this.menuService.currentChannelId}_${this.menuService.currentPublisherId}`;
    itemFilters = { ...this.customDataService.getItemFeedFilterType(summary_type, typeKey) };
    return itemFilters;
  }

  // numberFilter








}
