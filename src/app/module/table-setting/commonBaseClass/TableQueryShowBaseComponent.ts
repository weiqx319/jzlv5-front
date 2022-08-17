import { ElementRef, EventEmitter, Input, Output, Renderer2, SimpleChanges, ViewChild, Directive } from '@angular/core';
import { isArray, isUndefined } from "@jzl/jzl-util";
import { generateFilterDesc } from '@jzl/jzl-util';
import { ItemOperationsService } from '../../../shared/service/item-operations.service';

@Directive()
export class TableQueryShowBaseComponent {

  public conditionOper: any;

  @Input() conditions = [];

  @Input() dataRange = {};

  @Input() summary_type: any;

  @Input() filterConditions = [];

  @Output() changed = new EventEmitter();
  @ViewChild('descDiv') descDiv: ElementRef<any>;

  public showConditions = [];
  public isShow = false;
  public dataRangeIsShow = false;
  public showFilterConditions = [];
  public offLeft = 1110;
  public filterOption: any;
  constructor(
    public ele: ElementRef,
    public renderer: Renderer2,
    public itemOperationsService: ItemOperationsService,
    public tableItemService) {
    this.conditionOper = this.itemOperationsService.getOperations();
  }

  init() {
    // this.refreshShowConditions();
    this.showWhiteSpace();

  }



  showWhiteSpace() {

    const offLeft = this.ele.nativeElement.getBoundingClientRect().right;


    // console.log(offLeft);
    const documentWidth = document.body.clientWidth;
    this.offLeft = documentWidth - 30 - 56 - 56 - 8 - 8 - 15;
    // console.log(filterWidth);

    /*this.render2.removeClass(div, "body");
    this.render2.addClass(div, "body1");*/

    // console.log(this.descDiv.nativeElement);
    // this.descDiv.nativeElement.style.width = filterWidth + 'px';
    /*

        if (!width) {
          (documentWidth - offLeft) > (262 + 10) ?  this.status = false : this.status = true;
        } else {
          (documentWidth - offLeft) > (width + 10) ?  this.status = false : this.status = true;
        }
    */

  }

  refreshShowConditions() {
    this.filterOption = this.tableItemService.getItemFilterType(this.summary_type);
    this.showConditions = [];
    this.conditions.forEach(item => {
      let tmpDesc = item.name;
      const currentOperList = isUndefined(this.conditionOper[item['type']]) ? [] : this.conditionOper[item['type']];
      const findOperInfo = currentOperList.find((oper) => oper.key === item.op);
      if (isUndefined(findOperInfo)) {
        tmpDesc += item.op;
      } else {
        tmpDesc += findOperInfo['name'];
      }
      if (item.value !== '') {
        // tmpDesc += item.value;
        if (item['type'] === 'singleList') {

          this.filterOption[item['key']]['filterOption'].forEach((pub) => {
            if (item['value'] === pub['key']) {
              tmpDesc += pub['name'];
            }
          });
        }
        if (item['type'] === 'string' || item['type'] === 'multiValue') {
          if (isArray(item['value'])) {
            tmpDesc += item['value'].join('、');
          } else {
            tmpDesc += item['value'];
          }
        }
        if (item['type'] === 'numberFilter' || item['type'] === 'number') {
          tmpDesc += item['value'];
        }
        if (item['type'] === 'checkboxList') {
          const checkboxNames = [];
          if (isArray(item['value'])) {
            item['value'].forEach(pro => {

              this.filterOption[item['key']]['filterOption'].forEach(option => {
                if (option['key'] === pro) {
                  checkboxNames.push(option['name']);
                }
              });
            });
            tmpDesc += checkboxNames.join('、');
          }
        }

        if (item['type'] === 'multiList') {
          const checkboxNames = [];
          if (isArray(item['value'])) {
            item['value'].forEach(pro => {

              this.filterOption[item['key']]['filterOption'].forEach(option => {
                if (option['key'] === pro) {
                  checkboxNames.push(option['name']);
                }
              });
            });
            tmpDesc += checkboxNames.join('、');
          }
        }

        this.showConditions.push({ condition: item, show: tmpDesc });
      }




    });

    if (this.showConditions.length > 0) {
      this.isShow = true;
    }
    if (this.dataRange['select_data']) {
      this.dataRange['select_data'].length > 0 ? (this.dataRangeIsShow = true, this.isShow = true) : this.dataRangeIsShow = false;
    } else {
      this.dataRangeIsShow = false;
    }
    if (!this.showConditions.length && (isUndefined(this.dataRange['select_data']) || !this.dataRange['select_data'].length) && !this.showFilterConditions.length) {
      this.isShow = false;
    }
  }
  refreshShowFilterCondition() {
    this.showFilterConditions = generateFilterDesc(this.filterConditions, this.conditionOper);
    if (this.showFilterConditions.length > 0) {
      this.isShow = true;
    }
    if (!this.showConditions.length && (isUndefined(this.dataRange['select_data']) || !this.dataRange['select_data'].length) && !this.showFilterConditions.length) {
      this.isShow = false;
    }
  }

  deleteCondition(condtion) {
    const index = this.conditions.indexOf(condtion);
    this.conditions.splice(index, 1);
    this.changed.emit();
    this.refreshShowConditions();
  }

  deleteFilter(condition) {
    const name = condition['filterKey']['key'];
    if (this.filterConditions[name]) {
      this.filterConditions[name]['filterResult'] = {};
      if (this.filterConditions[condition['filterKey']['relishKey']]) {
        this.filterConditions[condition['filterKey']['relishKey']]['filterResult'] = {};
      }
    } else {
      this.filterConditions[condition['filterKey']['relishKey']]['filterResult'] = {};
    }
    this.changed.emit();
  }

  clearAllCondition() {
    this.conditions.splice(0, this.conditions.length);
    if (this.dataRange['select_data']) {
      this.dataRange['select_data'].splice(0, this.dataRange['select_data'].length);
    }
    Object.values(this.filterConditions).forEach((item) => {
      item['filterResult'] = {};
    });
    this.changed.emit();
    this.refreshShowConditions();
  }

  deleteDataRange() {
    this.dataRange['select_data'].splice(0, this.dataRange['select_data'].length);
    this.changed.emit();
    this.refreshShowConditions();
  }


}

