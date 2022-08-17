import { Injectable } from '@angular/core';
import { CustomDatasService } from "../../../shared/service/custom-datas.service";
import { isArray } from "@jzl/jzl-util";
import { MenuService } from '../../../core/service/menu.service';
import { TableItemDatasService } from "../../../shared/service/table-item-datas";


@Injectable()
export class ViewItemService {
  private _defaultFieldData;
  private _lockedItemType;
  private _endLockedItemType;
  public defaultItemFilters = {};
  private _chartItem;

  constructor(
    private customDataService: CustomDatasService,
    private menuService: MenuService,
    private tableItemDatasService: TableItemDatasService,
  ) {
    const viewItemData = this.tableItemDatasService.pageViewItemData['materials']
    this._defaultFieldData = JSON.parse(JSON.stringify(viewItemData['defaultFieldData']));
    this._lockedItemType = JSON.parse(JSON.stringify(viewItemData['lockedItemType']));
    this._endLockedItemType = JSON.parse(JSON.stringify(viewItemData['endLockedItemType']));
    this._chartItem = JSON.parse(JSON.stringify(viewItemData['chartItem']));

    this.defaultItemFilters = { ...customDataService.defaultFeedItemFilters };
  }

  public getDefaultItemsBySummaryType(summaryType) {
    const defaultField = [];
    const key = `${this.menuService.currentChannelId}_${this.menuService.currentPublisherId}`;
    const fieldDataTemp = this._defaultFieldData.hasOwnProperty(key) ? this._defaultFieldData[key] : [];
    fieldDataTemp.forEach(item => {
      if (summaryType === 'conversion_report') {
        if (item.hasOwnProperty('summaryType') && item['summaryType'].indexOf(summaryType) !== -1) {
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
              "compare_rate": false
            }
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
          width: item.width,
          is_rate: item['is_rate'] ? item['is_rate'] : 0,
          showKey: item['showKey'] ? item['showKey'] : '',
          selected: {
            "current": true,
            "compare": false,
            "compare_abs": false,
            "compare_rate": false
          }
        });
      }


    });
    return defaultField;

  }


  public getLockedItemsBySummaryType(summaryType) {

    /* if (Object.keys(this._lockedItemType).indexOf(summaryType) !== -1) {
       return [Object.assign({}, this._lockedItemType[summaryType])];
     } else {
       return [Object.assign({}, this._lockedItemType['channel'])];
     }*/

    const publisher_id = this.menuService.currentPublisherId;
    if (publisher_id === 1) {
      this._lockedItemType['creative'] = [{ name: "创意", key: "creative", width: '300', sortable: false }, { name: "样式", key: "material_style", width: '150' }];
    } else if (publisher_id === 6 || publisher_id === 9) {
      this._lockedItemType['creative'] = [{ name: "创意", key: "creative", width: '300', sortable: false }, { name: "创意名称", key: "pub_creative_name", width: '150' }];
    } else if (publisher_id === 7) {
      this._lockedItemType['creative'] = [{ name: "创意", key: "creative", width: '300', sortable: false }, { width: '100', name: "样式", key: "image_mode", showKey: 'image_mode' }];
    } else if (publisher_id === 11) {
      this._lockedItemType['creative'] = [{ name: "创意", key: "pub_creative_name", width: '300', sortable: false }];
    } else if (publisher_id === 13) {
      this._lockedItemType['creative'] = [{ name: "创意", key: "pub_creative_name", width: '300', sortable: false }];
    } else if (publisher_id == 14) {
      this._lockedItemType['creative'] = [{ name: "创意", key: "pub_creative_name", width: '300' }];
    } else if (publisher_id == 15) {
      this._lockedItemType['creative'] = [{ name: "创意", key: "pub_creative_id", width: '300' }];
      this._lockedItemType['keyword'] = [{ name: "广告", key: "pub_ad_name", width: '300' }];
    } else if (publisher_id == 18) {
      this._lockedItemType['creative'] = [{ name: "创意", key: "pub_creative_name", width: '300' }];
    } else if (publisher_id == 17) {
      this._lockedItemType['creative'] = [{ name: "创意", key: "pub_creative_name", width: '300' }];
    } else if (publisher_id == 16) {
      this._lockedItemType['creative'] = [{ name: "创意", key: "pub_creative_name", width: '300' }];
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

}
