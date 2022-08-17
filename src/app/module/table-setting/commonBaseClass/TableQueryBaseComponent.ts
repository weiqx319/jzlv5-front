import { Input, Directive } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormBuilder } from '@angular/forms';
import { isArray, isUndefined } from "@jzl/jzl-util";
import { deepCopy } from '@jzl/jzl-util';
import { TableItemService } from '../service/table-item.service';
import { ItemOperationsService } from '../../../shared/service/item-operations.service';

@Directive()
export class TableQueryBaseComponent {

  @Input() summaryType = 'keyword';
  @Input() reportType = 'basic_report';
  @Input() dataRange = [];
  @Input() tableData = {};
  public condition = [];
  @Input() lockItem = [];
  @Input() filterOption = [];
  @Input() reportAnalytics = false;

  @Input() set initCondition(data) {
    this.condition = deepCopy(data);
    if (this.condition.length) {
      this.condition.forEach(item => {
        if (item['type'] === 'string') {
          if (isArray(item['value'])) {
            item['value'] = item['value'].join('\n');
          } else {
            item['value'] = item['value'];
          }
        }
      });
    }
  }

  public allConditionList = [];
  public conditionOper: any;


  constructor(
    public subject: NzModalRef,
    public tableItemService,
    public itemOperationsService: ItemOperationsService,
    public _message: NzMessageService
  ) {
    this.conditionOper = this.itemOperationsService.getOperations();
  }

  init() {
    // this.allConditionList = this.tableItemService.getTableFilterItems(this.reportType, this.summaryType);
    this.allConditionList = this.tableItemService.getAllTableFilterItems(this.tableData['report_type'], this.summaryType, this.tableData['is_compare'], this.reportAnalytics, this.tableData['selected_items'], this.lockItem);
    if (this.filterOption.length === 0) {
      this.filterOption = this.tableItemService.getItemFilterType(this.tableData['summary_type']);
    }

    this.allConditionList.forEach(item => {
      if (this.filterOption[item.key] && this.filterOption[item.key]['filterKey']) {
        item.key = this.filterOption[item.key]['filterKey']['key'];
      }
    });

  }


  dataRangeChange(data) {
    this.dataRange = data;
  }


  cancelModal(): void {
    this.subject.destroy('onCancel');
  }

  saveData(): void {
    const new_condition = [];
    this.condition.forEach(item => {
      if (item['type'] === 'string' || item['type'] === 'multiValue') {
        if (item['value']) {
          const stringValue = [];
          item['value'].split('\n').forEach(valueItem => {
            if (valueItem !== '') {
              stringValue.push(this.trim(valueItem));
            }
          });
          item['value'] = stringValue;
          new_condition.push(item);
        }
      } else if (item['type'] === 'checkboxList') {
        if (item['value'] !== '') {
          new_condition.push(item);
        }
      } else {
        if (item['value'] !== '') {
          new_condition.push(item);
        }
      }
      /*if (item['type'] !== 'number') {
        if (item['value']) {
          const stringValue = [];
          item['value'].split('\n').forEach(valueItem => {
            if (valueItem !== '') {
              stringValue.push(this.trim(valueItem));
            }
          });
          item['value'] = stringValue;
          new_condition.push(item);
        }
      }
      if (item['type'] === 'number') {

       if (item['value'] !== '') {
         new_condition.push(item);
       }
      }*/
    });
    this.condition = new_condition;

    this.subject.destroy({ 'dataType': 'query', 'dataRange': this.dataRange, 'condition': this.condition });
  }

  //去除字符串首位空格
  trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  }


  addFilterField(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    const control = {
      "key": "",
      "value": "",
      "name": "",
      "op": "",
      "type": "",
      'data_type': ''
    };
    if (this.allConditionList.length > 0) {
      const currentCondition = this.allConditionList[0];
      control.key = currentCondition.key;
      control.type = currentCondition.type;
      control.data_type = currentCondition.data_type;
      control.name = currentCondition.name;
      if (control.type === 'number') {
        control.op = '>';
        control.value = '';
      } else { // 其他为字符串
        // control.type = 'string';
        control.op = '=';
        control.value = '';
      }
      this.condition.push(control);
    }
  }

  filterKeyChange(key, row) {
    const currentSelectCondition = this.allConditionList.find(item => item.key === key);
    if (!isUndefined(currentSelectCondition)) {
      row.type = currentSelectCondition.type;
      row.data_type = currentSelectCondition.data_type;
      row.name = currentSelectCondition.name;
      if (row.type === 'number') {
        row.op = '>';
        row.value = null;
      } else if (row.type === 'checkboxList') {
        row.op = 'in';
        row.value = null;
      } else {
        row.op = '=';
        row.value = null;
      }
    }
    if (row.type === 'singleList') {
      row['value'] = this.filterOption[row['key']]['filterOption'][0]['key'];
    }
  }

  removeFilterField(index, e: MouseEvent) {
    e.preventDefault();
    if (this.condition.length > 1) {
      this.condition.splice(index, 1);
    } else {
      this.condition = [];
    }
  }


}



