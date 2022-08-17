import { Injectable } from '@angular/core';
import { isArray } from "@jzl/jzl-util";
import { CustomDatasService } from "../../../shared/service/custom-datas.service";
import { TableItemDatasService } from "../../../shared/service/table-item-datas";

@Injectable()
export class ViewItemService {
  //报表属性数据？
  private _onlyReportAttrData;
  // 默认字段
  private _defaultFieldData;

  private _lockedItemType;
  private _endLockedItemType;

  private _chartItem;

  constructor(
    private customDataService: CustomDatasService,
    private tableItemDatasService: TableItemDatasService,
  ) {
    const viewItemData = this.tableItemDatasService.pageViewItemData['data_view'];
    if (viewItemData) {
      this._onlyReportAttrData = JSON.parse(JSON.stringify(viewItemData['onlyReportAttrData']));
      this._defaultFieldData = JSON.parse(JSON.stringify(viewItemData['defaultFieldData']));
      this._lockedItemType = JSON.parse(JSON.stringify(viewItemData['lockedItemType']));
      this._endLockedItemType = JSON.parse(JSON.stringify(viewItemData['endLockedItemType']));
      this._chartItem = JSON.parse(JSON.stringify(viewItemData['chartItem']));
    }
  }


  public getDefaultItemsBySummaryType(summaryType, onlyReport = false, reportType?) {
    const defaultField = [];
    this._defaultFieldData.forEach(item => {
      const itemWidth = item.name.length * 12 + 48 < item.width ? item.width : item.name.length * 12 + 48;//根据name计算width
      if (onlyReport && ['pub_attr_data', 'optimization_ranking_group', 'folder_list', 'optimization_ranking_data', 'real_ranking', 'optimization_effect_data', 'dim_data'].indexOf(item.data_type) > -1 && this._onlyReportAttrData.indexOf(item.key) == -1) {
        return;
      }
      if (onlyReport && item['not_show_analytics_report']) {
        return;
      }

      if (summaryType === 'conversion_report' || summaryType === 'conversion_report_sem') {
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
              current: true,
              compare: false,
              compare_abs: false,
              compare_rate: false,
              "avg": false,
              "percentage": false,
            },
          });
        }
      } else {
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
            current: true,
            compare: false,
            compare_abs: false,
            compare_rate: false,
            "avg": false,
            "percentage": false,
          },
        });
      }
    });

    if (summaryType != 'conversion_report' && summaryType != 'ocpc_360' && summaryType != 'ocpc_baidu' && summaryType != 'ocpc_baidu_report' && summaryType != 'creative_fengwu_360' && summaryType != 'ocpc_360_setting') {
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

      // 自定义指标metric
      const defaultMetricsCol = this.customDataService.getMetricsData().filter(item => !!item.is_default);
      defaultMetricsCol.forEach(item => {
        defaultField.push({
          name: item.name,
          key: item.key,
          remarks: item.remarks,
          type: item.type,
          data_type: 'metric_data',
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
    const chatItemResult = [];
    const chartItem = this._chartItem.map(item => Object.assign({}, item));
    chatItemResult.push(...chartItem);
    const conversionData = this.customDataService.getConversionData().map(
      item => {
        chatItemResult.push(Object.assign({ data_type: 'conversion_data', type: 'numberFilter' }, item));
      },
    );
    const metricsData = this.customDataService.getMetricsData().map(
      item => {
        chatItemResult.push(Object.assign({ data_type: 'metrics_data', type: 'numberFilter' }, item));
      },
    );
    return chatItemResult;
  }

  public getLockedItemsBySummaryType(summaryType, onlyReport?) {
    /* if (Object.keys(this._lockedItemType).indexOf(summaryType) !== -1) {
       return [Object.assign({}, this._lockedItemType[summaryType])];
     } else {
       return [Object.assign({}, this._lockedItemType['channel'])];
     }*/
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

      if (summaryType !== 'conversion_report' && summaryType !== 'conversion_report_sem' && summaryType !== 'ocpc_360' && summaryType !== 'ocpc_baidu' && summaryType !== 'creative_fengwu_360' && summaryType != 'ocpc_360_setting') {
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
    itemFilters = { ...this.customDataService.getItemSemFilterType(summary_type) };
    return itemFilters;
  }

  // numberFilter

}
