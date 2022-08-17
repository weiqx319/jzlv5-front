import { Input, Directive } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormBuilder } from '@angular/forms';
import { isUndefined } from "@jzl/jzl-util";

@Directive()
export class TableFiledBaseComponent {

  public selectItemIndex = 0;
  public dataItemAttrs = [];
  public reportTableData = {
    'report_type': 'basic_report',
    'summary_type': 'campaign',
    'selected_items': [],
    'locked_items': [],
    'condition': [],
    'data_range': [],
    'is_compare': false,
    'summary_date': 'day:1:0',
    'summary_date_compare': 'day:2:0',
    'time_grain': 'day',
  };
  @Input() reportAnalytics = false;
  @Input() selectedItems: any[] = [];
  @Input() summaryType = 'campaign';
  @Input() reportType = 'basic_report';
  @Input() lockedItems = [];
  @Input() isCompare = false;

  public lock_index_left = [];
  public lock_index_right = [];

  constructor(public subject: NzModalRef,
    public fb: FormBuilder,
    public tableItemService,
    public _message: NzMessageService
  ) {

    // this.conditionOper = this.itemOperationsService.getOperations();
  }


  init(): void {
    const initData = this.tableItemService.getTableItems(this.reportType, this.summaryType, this.selectedItems, this.reportAnalytics);
    //-------true，initData是在这之前赋的值
    // console.log(initData['attrs'][1]['data'][0]['selected']['current']);

    this.dataItemAttrs = initData['attrs'];
    this.selectedItems = initData['selected'];
console.log(initData);

    // const metricDataList = [{}]

    this.dataItemAttrs.forEach((item, index) => {
      // 自定义指标分类显示
      // if (item['key'] === 'metric_data') {
      //   console.log(item);
      //   item.data.forEach(i => {


      //   });

      // }





      if (item['key'] === 'pub_lock_data') {
        item['selectIndexNum']['current'] = 0;
        item['lockSelectCount'] = 0;
        item['leastSelectCount'] = 0; //针对一组数组中至少选择1个的逻辑
        this.lockedItems.forEach((itemLock, lockIndex) => {
          const is_same = item['data'].find(dataItem => itemLock['key'] === dataItem['key']);
          if (!isUndefined(is_same)) {
            if (is_same.locking && is_same.locking.indexOf(this.reportType) !== -1) {
              item['lockSelectCount']++;
            }
            if (is_same.has_least && is_same.has_least.indexOf(this.summaryType) !== -1) {
              item['leastSelectCount']++;
            }

            is_same['selected']['current'] = true;
            item['selectIndexNum']['current']++;
            if (item['selectIndexNum']['current'] === item['allIndexNum']['current']) {
              item['allSelected']['current'] = true;
            }
          }
        });
        // item['data'].forEach((opt, optIndex) => {
        //   if (opt['locking']) {
        //     this.lock_indexs.push(optIndex);
        //   }
        // });

      }
    });
    this.getLockIndex();

    // this.lockedItems.forEach(item => {
    //   const is_same = this.dataItemAttrs.find(dataItem => item['key'] === dataItem['key']);
    //   if (!isUndefined(is_same)) {
    //     is_same['selected']['current'] = true;
    //   }
    // });

    // throw new Error("Method not implemented.");

  }

  getLockIndex() {
    this.dataItemAttrs.forEach((item, index) => {
      if (item['key'] === 'pub_lock_data') {
        item['data'].forEach((opt, optIndex) => {
          if (opt['locking']) {
            this.lock_index_left = [];
            this.lock_index_left.push(optIndex);
            this.lockedItems.forEach((lockItem, lockIndex) => {
              if (opt['key'] === lockItem['key']) {
                this.lock_index_right = [];
                this.lock_index_right.push(lockIndex);
              }
            });
          }
        });
      }

    });

  }



  /**
   * STEP2: 变更数据分类type 索引
   * @param index
   */
  changeSelectIndex(index): void {
    this.selectItemIndex = index;
  }

  /**
   * STEP2: 单个数据项的选中与取消操作
   * @param item
   * @param index
   * @param type
   */

  changeSelectedItem(item, index, type): void {

    if (item.data_type === 'pub_lock_data') {

      let lockItemSelectedIndex = 0;
      this.lockedItems.forEach((lock, lockIndex) => {
        if (lock['key'] === item.key) {
          lockItemSelectedIndex = lockIndex;
        }
      });
      if (item.selected[type]) {
        this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type]++;
        if (this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type] === this.dataItemAttrs[this.selectItemIndex]['allIndexNum'][type]) {
          this.dataItemAttrs[this.selectItemIndex]['allSelected'][type] = true;
        }
        if (item.has_least && item.has_least.indexOf(this.summaryType) !== -1) {
          this.dataItemAttrs[this.selectItemIndex]['leastSelectCount']++;
        }
        if (lockItemSelectedIndex === 0) {
          if (this.lock_index_left.length) { //有固定列
            if (index > this.lock_index_left[0]) {
              this.lockedItems.push(item);
            }
            if (index < this.lock_index_left[0] + 1) {

              this.lockedItems.splice(this.lock_index_right[0], 0, item);
              this.getLockIndex();
            }
          } else { //无固定列
            this.lockedItems.push(item);
          }
        }


      } else {
        if (item.has_least && item.has_least.indexOf(this.summaryType) !== -1) {
          if (this.dataItemAttrs[this.selectItemIndex]['leastSelectCount'] !== 1) {
            this.dataItemAttrs[this.selectItemIndex]['leastSelectCount']--;
            this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type]--;
            this.dataItemAttrs[this.selectItemIndex]['allSelected'][type] = false;
            this.lockedItems.splice(lockItemSelectedIndex, 1);
          }
        } else {
          this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type]--;
          this.dataItemAttrs[this.selectItemIndex]['allSelected'][type] = false;
          this.lockedItems.splice(lockItemSelectedIndex, 1);

        }
        this.getLockIndex();

      }
    } else {
      const itemSelectedIndex = this.selectedItems.indexOf(item);
      if (item.selected[type]) {
        this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type]++;
        if (this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type] === this.dataItemAttrs[this.selectItemIndex]['allIndexNum'][type]) {
          this.dataItemAttrs[this.selectItemIndex]['allSelected'][type] = true;
        }
        if (itemSelectedIndex < 0) {
          this.selectedItems.push(item);
        }
      } else {
        this.dataItemAttrs[this.selectItemIndex]['selectIndexNum'][type]--;
        this.dataItemAttrs[this.selectItemIndex]['allSelected'][type] = false;
        if (itemSelectedIndex > -1) {
          const selectedKeys = Object.keys(item['selected']);
          let delFlag = true;
          selectedKeys.forEach((key) => {
            if (item['selected'][key]) {
              delFlag = false;
            }
          });
          if (delFlag) {
            this.selectedItems.splice(itemSelectedIndex, 1);
          }
        }
      }
    }

  }

  /**
   *
   * STEP2: 某分类下数据项的全部选中与全部取消操作
   * @param type
   */
  changeSelectedItems(type): void {
    if (this.dataItemAttrs[this.selectItemIndex]['allSelected'][type]) {
      for (const key in this.dataItemAttrs[this.selectItemIndex]['data']) {
        if (!this.dataItemAttrs[this.selectItemIndex]['data'][key]['selected'][type] && (!this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'] || (this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'] && this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'].indexOf(this.summaryType) === -1))) {
          if (this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'] && this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'].indexOf(this.summaryType) !== -1) {
          } else {
            this.dataItemAttrs[this.selectItemIndex]['data'][key]['selected'][type] = true;
            this.changeSelectedItem(this.dataItemAttrs[this.selectItemIndex]['data'][key], key, type);

          }
        }
      }
    } else {
      for (const key in this.dataItemAttrs[this.selectItemIndex]['data']) {
        if (this.dataItemAttrs[this.selectItemIndex]['data'][key]['selected'][type] && (!this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'] || (this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'] && this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'].indexOf(this.summaryType) === -1))) {
          if (this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'] && this.dataItemAttrs[this.selectItemIndex]['data'][key]['locking'].indexOf(this.summaryType) !== -1) {
          } else {
            this.dataItemAttrs[this.selectItemIndex]['data'][key]['selected'][type] = false;
            this.changeSelectedItem(this.dataItemAttrs[this.selectItemIndex]['data'][key], key, type);

          }
        }
      }
    }
  }

  deleteSelectedItems(item, index): void {

    const removeItem = this.selectedItems[index];
    this.selectedItems.splice(index, 1);
    const selectedKeys = Object.keys(removeItem['selected']);
    selectedKeys.forEach((key) => {
      if (removeItem['selected'][key]) {
        removeItem['selected'][key] = false;
        this.changeSelectedItem(removeItem, 0, key);
      }
    });
  }
  upSelectedItems(item, index): void {
    if (index !== 0) {
      const moveItem = this.selectedItems[index];
      const moveItem_up = this.selectedItems[index - 1];
      this.selectedItems.splice(index, 1);
      this.selectedItems.splice(index - 1, 1);
      this.selectedItems.splice(index - 1, 0, moveItem);
      this.selectedItems.splice(index, 0, moveItem_up);
    }

  }
  downSelectedItems(item, index): void {
    if (index !== (this.selectedItems.length - 1)) {
      const moveItem = this.selectedItems[index];
      const moveItem_down = this.selectedItems[index + 1];
      this.selectedItems.splice(index, 1);
      this.selectedItems.splice(index, 1);
      this.selectedItems.splice(index, 0, moveItem_down);
      this.selectedItems.splice(index + 1, 0, moveItem);
    }

  }

  upLockSelectedItems(item, index): void {
    if (index !== 0) {
      const moveItem = this.lockedItems[index];
      const moveItem_up = this.lockedItems[index - 1];
      this.lockedItems.splice(index, 1);
      this.lockedItems.splice(index - 1, 1);
      this.lockedItems.splice(index - 1, 0, moveItem);
      this.lockedItems.splice(index, 0, moveItem_up);
    }

  }

  downLockSelectedItems(item, index): void {
    if (index !== (this.lockedItems.length - 1)) {
      const moveItem = this.lockedItems[index];
      const moveItem_down = this.lockedItems[index + 1];
      this.lockedItems.splice(index, 1);
      this.lockedItems.splice(index, 1);
      this.lockedItems.splice(index, 0, moveItem_down);
      this.lockedItems.splice(index + 1, 0, moveItem);
    }

  }
  cancelModal(): void {
    this.subject.destroy('onCancel');
  }

  saveField() {
    let isCompare = false;
    this.selectedItems.every((item) => {
      if (item.selected && Object.keys(item.selected).length > 0) {
        for (const key of Object.keys(item.selected)) {
          if (item['selected'][key] && key !== 'current' && key !== 'avg' && key !== 'percentage') {
            isCompare = true;
            break;
          }
        }
        return !isCompare;
      } else {
        return true;
      }
    });
    // --校验是否可进入下一步
    if (this.summaryType!=='material_report'&&this.selectedItems.length < 1) {
      this._message.error('数据项不能为空，请选择');
      return false;
    }

    const selectItemList = this.selectedItems;
    this.subject.destroy({ 'dataType': 'table', 'data': selectItemList, 'is_compare': isCompare, 'lockData': this.lockedItems });
  }


}





