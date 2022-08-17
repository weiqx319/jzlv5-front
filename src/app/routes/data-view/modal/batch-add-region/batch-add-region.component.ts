import { Component, Input, OnInit } from '@angular/core';
import { deepCopy, isArray } from '@jzl/jzl-util';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-batch-add-region',
  templateUrl: './batch-add-region.component.html',
  styleUrls: ['./batch-add-region.component.scss']
})
export class BatchAddRegionComponent implements OnInit {
  public searchText = '';//搜索词
  public noHaveText = '';//未匹配到的搜索词

  @Input() divisionType = '';
  @Input() sourceData: {};

  constructor(
    private modalSubject: NzModalRef,
  ) { }

  ngOnInit(): void {

  }

  onCancel() {
    if (this.noHaveText.length === 0) {
      this.modalSubject.destroy({
        name: 'onCancel',
      });
    } else {
      this.modalSubject.destroy({
        name: 'onOk',
        value: this.getSelectedRegion(),
      });
    }
  }

  //添加搜索词
  addSearchOption() {
    const inputValueAry = this.searchText.split(/[\s,\/]+/g); // 根据换行或者回车进行识别
    inputValueAry.forEach((item, idx) => {
      if (!item) {
        inputValueAry.splice(idx, 1);
      }
    });

    const selectedValues = {};// 已选正确搜索词
    inputValueAry.forEach(value => {
      this.searchOptionPush(value, Object.values(this.sourceData), selectedValues);
    });
    deepCopy(inputValueAry).forEach(value => {
      if (selectedValues[value]) {
        inputValueAry.splice(inputValueAry.indexOf(value), 1);
      }
    });

    this.searchText = inputValueAry.join('\n');
    this.noHaveText = this.searchText + '';

    // 成功后
    if (this.noHaveText.length === 0) {
      this.modalSubject.destroy({
        name: 'onOk',
        value: this.getSelectedRegion(),
      });
    }
  }

  // 添加搜索词
  searchOptionPush(inputValue, source, selectedValues) {
    source.forEach(item => {
      if (inputValue === item.search_name) {
        selectedValues[item.search_name] = true;
        item['is_selected'] = true;
        if (isArray(item.sub) && item.sub.length > 0) {
          item.sub.forEach(subItem => {
            subItem['is_selected'] = true;
          });
        }
      } else {
        if (isArray(item.sub) && item.sub.length > 0) {
          this.searchOptionPush(inputValue, item.sub, selectedValues);
        }
      }
    });
  }

  getSelectedRegion() {
    const region_selected_lists = [];
    for (const prop in this.sourceData) {
      this.sourceData[prop]['sub'].forEach((item) => {
        if (item.is_selected) {
          if (this.divisionType === 'province') {
            region_selected_lists.push(item.code);
          } else if (this.divisionType === 'city') {
            if (item.sub.length) {
              item.sub.forEach((city) => {
                region_selected_lists.push(city.code);
              });
            }
          }
        } else {
          let hasCitySelected = false;
          if (item.sub.length) {
            item.sub.forEach((city) => {
              if (city.is_selected) {
                hasCitySelected = true;
                region_selected_lists.push(city.code);
              }
            });
          }
        }
      });
    }

    return region_selected_lists;
  }
}
