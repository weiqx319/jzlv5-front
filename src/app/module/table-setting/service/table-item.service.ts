import { Injectable } from '@angular/core';
import { CustomDatasService } from "../../../shared/service/custom-datas.service";
import { RankingModelPipe } from "../pipe/ranking-model.pipe";
import { RankingAlertTypePipe } from "../pipe/ranking-alert-type.pipe";
import { isArray, isUndefined } from "@jzl/jzl-util";
import { TableItemBaserServices } from '../commonBaseService/TableItemBaserServices';
import { TableItemDatasService } from "../../../shared/service/table-item-datas";

@Injectable()
export class TableItemService extends TableItemBaserServices {
  protected _summaryTypes;//摘要类型
  protected _lockedItemType;
  protected _dataTypeCompareType;
  protected _pubDate;
  protected _defaultFieldData;
  protected _chartItem;//基础图表项
  constructor(
    public customDataService: CustomDatasService,
    private tableItemDatasService: TableItemDatasService,
  ) {
    super(customDataService);

    const viewItemData = this.tableItemDatasService.tableItemData;
    if (viewItemData) {
      this._summaryTypes = JSON.parse(JSON.stringify(viewItemData['summary_types']));
      this._lockedItemType = JSON.parse(JSON.stringify(viewItemData['locked_item_type']));
      this._dataTypeCompareType = JSON.parse(JSON.stringify(viewItemData['data_type_compare_type']));
      this._pubDate = JSON.parse(JSON.stringify(viewItemData['pub_date']));
      this._defaultFieldData = JSON.parse(JSON.stringify(viewItemData['default_field_data']));
      this._chartItem = JSON.parse(JSON.stringify(viewItemData['chart_item']));
    }
    this.initCustomData();

  }
  public tipMap = {};

  protected _initAllPubData = [];

  public getChartItem() {
    const chatItemResult = [];
    const chartItem = this._chartItem.map(item => Object.assign({}, item));
    chatItemResult.push(...chartItem);
    this.customDataService.getConversionData().map(
      item => {
        chatItemResult.push(Object.assign({ data_type: 'conversion_data', 'type': 'numberFilter' }, item));
      }
    );
    return chatItemResult;
  }



  public getItemFilterType(summary_type) {
    let itemFilters = {};
    itemFilters = { ...this.customDataService.getItemSemFilterType(summary_type) };
    return itemFilters;
  }

  initCustomData(): void {
    this._initAllPubData = [];
    this._initAllPubData = this._pubDate.map(x => Object.assign({}, x));
    const conversionData = this.customDataService.getConversionData().map(
      item => {
        // this._initAllPubData.push(Object.assign({data_type: 'conversion_data', 'type': 'numberFilter',  not_show_summaryType: ['search_keyword', 'creative']}, item, {width: 112}));
        const width = item.name.length * 12 + 48 + 12 < 112 ? 112 : item.name.length * 12 + 48 + 12;
        this._initAllPubData.push(Object.assign({ data_type: 'conversion_data', 'type': 'numberFilter', not_show_summaryType: ['ocpc_360', 'creative_fengwu_360'] }, item, { width }));
        // this._initAllPubData.push(Object.assign({data_type: 'conversion_data'}, item, {width: 112}));
      }
    );

    const conversionDescData = this.customDataService.getConversionDescData().map(
      item => {
        // this._initAllPubData.push(Object.assign({data_type: 'conversion_data', 'type': 'numberFilter',  not_show_summaryType: ['search_keyword', 'creative']}, item, {width: 112}));
        const width = item.name.length * 12 + 48 + 12 < 112 ? 112 : item.name.length * 12 + 48 + 12;
        this._initAllPubData.push(Object.assign({ data_type: 'conversion_desc', 'type': 'numberFilter' }, item, { width }));
        // this._initAllPubData.push(Object.assign({data_type: 'conversion_data'}, item, {width: 112}));
      }
    );

    const customMetricData = this.customDataService.getMetricsData().map(
      item => {
        // this._initAllPubData.push(Object.assign({data_type: 'metric_data',  'type': 'numberFilter', not_show_summaryType: ['search_keyword', 'creative']}, item, {width: 112}));
        const width = item.name.length * 12 + 48 + 12 < 112 ? 112 : item.name.length * 12 + 48 + 12;
        this._initAllPubData.push(Object.assign({ data_type: 'metric_data', 'type': 'numberFilter', not_show_summaryType: ['ocpc_360', 'creative_fengwu_360'] }, item, { width }));

        // this._initAllPubData.push(Object.assign({data_type: 'metric_data'}, item, {width: 112}));
      }
    );
    const dimData = this.customDataService.getDimData().map(
      item => {
        this._initAllPubData.push(Object.assign({ data_type: 'dim_data', 'type': 'multiValue', summaryType: ['keyword', 'folder_detail_keyword', 'optimization_detail_ranking'], conditionType: ['keyword', 'folder_detail_keyword'] }, item, { width: 112 }));
      }
    );

    const dataLockList = [];
    const bizUnitData = this.customDataService.getBizUnitData().map(
      (item, index) => {
        /* if (index === 0) {
           dataLockList.push(Object.assign({data_type: 'pub_lock_data', name: item.name, key: item.key + '_name', 'type': 'string', summaryType: ['biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region'], locking: ['biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region']}, {width: 120}));
         } else {
           dataLockList.push(Object.assign({data_type: 'pub_lock_data', name: item.name, key: item.key + '_name', 'type': 'string', summaryType: ['biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region']}, {width: 120}));
         }*/
        // dataLockList.push(Object.assign({is_select: true, data_type: 'pub_lock_data', name: item.name, key: item.key + '_name', 'type': 'string', summaryType: ['biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region', 'landing_page_account'], has_least: ['biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region']}, {width: 120})); //has_least:至少选择1个
        dataLockList.push(Object.assign({ is_select: true, data_type: 'pub_lock_data', name: item.name, key: item.key + '_name', 'type': 'string', summaryType: ['biz_unit_campaign', 'biz_unit_adgroup', 'biz_unit_keyword', 'biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region'], has_least: ['biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region'] }, { width: 120 })); //has_least:至少选择1个

      }
    );
    this._initAllPubData.splice(2, 0, ...dataLockList);

    this.tipMap = {};
    this._initAllPubData.forEach(item => {
      if (item['remarks']) {
        this.tipMap[item['key']] = item['remarks'];
      }
    });
  }


  public getSummaryTypes(type): any[] {
    const returnResult = [];
    if (type === 'dim_report') {
      this.customDataService.getDimData().map(
        item => {
          returnResult.push({ key: item.key, name: item.name, data_type: 'dim_data' });
        });
    } else {
      this._summaryTypes.forEach(item => {
        if (item.reportType.indexOf(type) > -1) {
          returnResult.push({ key: item.key, name: item.name });
        }
      });
    }
    return returnResult;
  }


  public getLockedItemsBySummaryType(type, report_type = 'basic_report') {
    if (report_type === 'dim_report') {

      const findDim = this.customDataService.getDimData().find(item => item.key === type);
      if (isUndefined(findDim)) {
        return [];
      } else {
        return [{ name: findDim['name'], key: findDim['key'], data_type: 'dim_data' }];
      }
    } else {
      if (isArray(this._lockedItemType[type])) {
        const resultLocked = [];
        const dataLockList = [];
        this.customDataService.getBizUnitData().forEach(item => {
          // this._pubDate.push({width: '160', name: item.name, key: item.key, data_type: 'pub_lock_data', summaryType: ['biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region'],  locking: ['biz_unit_account', 'biz_unit_account_hour', 'biz_unit_account_region'], conditionType: ['none'], type: 'string'});
          dataLockList.push({ width: '160', type: item.type, name: item.name, key: item.key + '_name', data_type: 'pub_lock_data', summaryType: ['biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region'], conditionType: ['none'] });

        });
        if (report_type.startsWith('biz_unit_')) {
          if (type === 'biz_unit_account_region') {
            this._lockedItemType[type].splice(0, 0, ...dataLockList);
          } else {
            if (type === 'responsible_account' || type === 'landing_page_account' || type === 'ocpc_360' || type === 'creative_fengwu_360') {
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


  public getTableItemsObj(reportType: string, summaryType: string): any {

    const tableItems = {};
    this._initAllPubData.forEach(item => {
      if (this._dataTypeCompareType[item['data_type']]['reportType'].indexOf(reportType) === -1) {
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


  public getAllTableFilterItems(reportType: string, summaryType: string, is_compare: boolean, onlyReport = false, selectedItems?: any[], lockItems? ) {
    const lockItem = JSON.parse(JSON.stringify(this.getLockedItemsBySummaryType(summaryType, reportType)));
    const filterItems = [];
    const filterItemsMap = {};
    const allFilterOption = this.getItemFilterType(summaryType);
    if (summaryType !== 'biz_unit_account_hours' && summaryType !== 'biz_unit_account_region' && summaryType !== 'biz_unit_account' && summaryType !== 'responsible_account' && summaryType !== 'landing_page_account' && summaryType !== 'ocpc_360' && summaryType !== 'ocpc_360') {
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


    const returnConditionResult = [];
    this._initAllPubData.forEach(item => {
      if (this._dataTypeCompareType[item['data_type']]['reportType'].indexOf(reportType) === -1) {
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
