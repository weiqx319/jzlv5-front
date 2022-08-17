import { Injectable } from '@angular/core';
import { isArray } from "@jzl/jzl-util";
import { CustomDatasService } from "../../../shared/service/custom-datas.service";
import { TableItemDatasService } from "../../../shared/service/table-item-datas";

@Injectable()
export class FolderItemService {

  private _defaultFieldData;
  private _lockedItemType;
  private _chartItem;
  public defaultItemFilters;
  constructor(
    private customDataService: CustomDatasService,
    private tableItemDatasService: TableItemDatasService,) {

    const viewItemData = this.tableItemDatasService.pageViewItemData['folder_feed']
    this._defaultFieldData = JSON.parse(JSON.stringify(viewItemData['defaultFieldData']));
    this._lockedItemType = JSON.parse(JSON.stringify(viewItemData['lockedItemType']));
    this._chartItem = JSON.parse(JSON.stringify(viewItemData['chartItem']));
    this.defaultItemFilters = JSON.parse(JSON.stringify(viewItemData['defaultItemFilters']));
  }

  public getDefaultItemsBySummaryType(summaryType) {

    const defaultField = [];
    this._defaultFieldData.forEach(item => {
      if (item.hasOwnProperty('summaryType') && item['summaryType'].indexOf(summaryType) === -1) {  // 根据summaryType去生成最终数据结构
        return false;
      }
      const tmpObj = {
        name: item.name,
        key: item.key,
        data_type: item.data_type,
        width: item.width,
        is_rate: item['is_rate'] ? item['is_rate'] : 0,
        showKey: item['showKey'] ? item['showKey'] : '',
        selected: {
          current: true,
          compare: false,
          compare_abs: false,
          compare_rate: false,
          "avg": false,
          "percentage": false,
        },
      };
      if (item.hasOwnProperty('sortable')) {
        tmpObj['sortable'] = item['sortable'];
      }
      if (item.hasOwnProperty('pipe') && item['pipe']) {
        tmpObj['pipe'] = item['pipe'];
      }

      defaultField.push(tmpObj);
    });
    return defaultField;

  }

  public getChartItem() {
    return this._chartItem.map(item => Object.assign({}, item));
  }

  public getLockedItemsBySummaryType(summaryType) {
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
      return [Object.assign({}, this._lockedItemType['channel'])];
    }

  }

  public getItemFilterType(summary_type) {
    let itemFilters = {};
    itemFilters = Object.assign(itemFilters, this.defaultItemFilters);

    if (summary_type === 'optimization_detail_effect') {
      itemFilters['status'] = {
        filterType: 'checkboxList',
        filterOption: [
          { name: '有效', key: '2000' },
          { name: '处于暂停时段', key: '2022' },
          { name: '暂停推广', key: '2023' },
          { name: '推广计划预算不足', key: '2024' },
          { name: '已删除', key: '2900' },
        ],
        filterKey: { key: 'status', data_type: 'pub_attr_data', name: '状态', type: 'checkboxList' },
        filterResult: {},
        extraOption: {
          columnCount: true,
        },
      };
    } else if (summary_type === 'optimization_detail_ranking') {
      itemFilters['status'] = {
        filterType: 'checkboxList',
        filterOption: [
          { name: '有效', key: '4000' },
          { name: '有效-­‐移动url审核中', key: '4001' },
          { name: '暂停推广', key: '4042' },
          { name: '不宜推广', key: '4043' },
          { name: '搜索无效', key: '4044' },
          { name: '待激活', key: '4045' },
          { name: '审核中', key: '4046' },
          { name: '搜索量过低', key: '4047' },
          { name: '部分无效', key: '4048' },
          { name: '计算机搜索无效', key: '4049' },
          { name: '移动搜索无效', key: '4050' },
          { name: '已删除', key: '4900' },
        ],
        filterKey: { key: 'status', data_type: 'pub_attr_data', name: '状态', type: 'checkboxList' },
        filterResult: {},
        extraOption: {
          columnCount: true,
        },
      };
    }

    if (summary_type === 'optimization_group') {
      itemFilters['publisher'] = {
        filterType: 'singleList',
        filterOption: [{ key: 1, name: '百度' }, { key: 2, name: '搜狗' }, { key: 3, name: '360' }, { key: 4, name: '神马' }],
        filterKey: { key: 'publisher_id', data_type: 'optimization_ranking_group', name: '媒体', type: 'singleList', relishKey: 'publisher' },
        filterResult: {},
        extraOption: {
          columnCount: false,
        },
      };
    } else {
      itemFilters['publisher'] = {
        filterType: 'singleList',
        filterOption: [{ key: 1, name: '百度' }, { key: 2, name: '搜狗' }, { key: 3, name: '360' }, { key: 4, name: '神马' }],
        filterKey: { key: 'publisher_id', data_type: 'pub_attr_data', name: '媒体', type: 'singleList', relishKey: 'publisher' },
        filterResult: {},
        extraOption: {
          columnCount: false,
        },
      };
    }
    const conversionData = this.customDataService.getConversionData().map(
      item => {
        itemFilters[item['key']] = {
          filterType: 'numberFilter',
          filterOption: [],
          filterKey: { key: item['key'], data_type: 'conversion_data', name: item['name'], type: 'numberFilter' },
          filterResult: {},
          extraOption: {
            columnCount: false,
          },
        };
      },
    );
    const customMetricData = this.customDataService.getMetricsData().map(
      item => {
        itemFilters[item['key']] = {
          filterType: 'numberFilter',
          filterOption: [],
          filterKey: { key: item['key'], data_type: 'metric_data', name: item['name'], type: 'numberFilter' },
          filterResult: {},
          extraOption: {
            columnCount: false,
          },
        };
      },
    );
    const dimData = this.customDataService.getDimData().map(
      item => {
        itemFilters[item['key']] = {
          filterType: 'multiValue',
          filterOption: [],
          filterKey: { key: item['key'], data_type: 'dim_data', name: item['name'], type: 'multiValue' },
          filterResult: {},
          extraOption: {
            columnCount: false,
          },
        };
      },
    );

    return itemFilters;
  }

}
