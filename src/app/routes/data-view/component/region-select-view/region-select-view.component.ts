import { Component, DoCheck, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { hasOwnProperty } from "tslint/lib/utils";
import { isUndefined } from "@jzl/jzl-util";
import { RegionListService } from "../../../dashboard/service/region-list.service";
import { deepCopy } from "@jzl/jzl-util";
import { NzModalService } from 'ng-zorro-antd/modal';
import { BatchAddRegionComponent } from '../../modal/batch-add-region/batch-add-region.component';
@Component({
  selector: 'app-region-select-view',
  templateUrl: './region-select-view.component.html',
  styleUrls: ['./region-select-view.component.scss'],
  providers: [RegionListService],
})
export class RegionSelectViewComponent implements OnInit, DoCheck {

  // @Input() parent_region_list: any;
  public initConfig = false;
  public selectCityNum = 0;
  public regionSearchData = {
    'province': [],
    'city': [],
  };//所有地域搜索关键词
  @Input() divisionType = 'province';
  @Input() is_hidden: any;
  @Input() showCoefficient = false;
  @Input() set par_publisher(data) {
    this.allSelectChina = false;
    this.allSelectAbroad = false;
    this.publisher = data;
    this.Initialization();
  }
  @Input() set parent_region_list(data) {
    this.Initialization();
    let regionTarget = [];
    let regionPriceFactor = [];

    if (isUndefined(data)) {

    } else {
      regionTarget = data.hasOwnProperty('region_target') ? deepCopy(data['region_target']) : [];
      regionPriceFactor = data.hasOwnProperty('region_price_factor') ? deepCopy(data['region_price_factor']) : [];
    }
    // this.parent_region_list = data;
    if (this.divisionType === 'city') {
      for (const prov of this.region_lists) {
        if (regionTarget.indexOf(Number(prov.code)) > -1 && prov.sub.length > 0) {
          let priceFactor;
          regionPriceFactor.forEach(price => {
            if (price.hasOwnProperty('jzlRegionId') && price['jzlRegionId'] == prov.code) {
              priceFactor = price['priceFactor'];
            }
          });
          prov.sub.forEach(item => {
            regionTarget.push(Number(item.code));
            regionPriceFactor.push({ priceFactor: priceFactor, regionId: 0, jzlRegionId: Number(item.code) });
          });
        }
      }
    }

    this.initRegion(regionTarget, regionPriceFactor);
  }

  public coefficientAll = 1;
  public publisher = 2;
  private region_lists: any;
  private region_lists_city: any;
  private condition_index: number;
  private region_type: any;
  public regionCoefficientSetting = {};
  public regionCoefficientResult = [];
  public region_across_city = {
    all: {
      name: "所有城市",
      sub: [],
      is_selected: false,
    }
  };
  public region_across_origin = {
    the_North_China: {
      name: "华北地区",
      sub: [],
      is_selected: false,
    },
    the_Northeast: {
      name: "东北地区",
      sub: [],
      is_selected: false,
    },
    the_East_China: {
      name: "华东地区",
      sub: [],
      is_selected: false,
    },
    the_Central_China: {
      name: "华中地区",
      sub: [],
      is_selected: false,
    },
    the_South_China: {
      name: "华南地区",
      sub: [],
      is_selected: false,
    },
    the_Southwest: {
      name: "西南地区",
      sub: [],
      is_selected: false,
    },
    the_Northwest: {
      name: "西北地区",
      sub: [],
      is_selected: false,
    },
    the_other_region: {
      name: "其他地区",
      sub: [],
      is_selected: false,
    },
  };
  public region_across: any;
  public region_desc = [];
  private region_selected_lists = [];
  public allSelectChina = false;
  public allSelectAbroad = false;
  public indeterminate = false;

  @Input() set cIndex(data: any) {
    this.condition_index = data;
  }

  @Output() regionSelected: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('region', { static: true }) regionNode: ElementRef;

  constructor(
    private regionListService: RegionListService,
    public modalService: NzModalService,
  ) {
    this.region_lists = this.regionListService.getRegionLists();
    this.region_lists_city = this.regionListService.getRegionListsCity();

    this.setSearchName(this.region_lists, 'province');
    this.setSearchName(this.region_lists_city, 'city');
  }

  ngOnInit() {
  }

  Initialization() {
    if (this.initConfig) {
      return;
    }
    this.initConfig = true;
    this.region_across = null;
    if (this.divisionType === 'province') {
      this.region_across = JSON.parse(JSON.stringify(this.region_across_origin));
      if (this.publisher === 1 || this.publisher === 2) {
        this.region_across['the_abroad'] = {
          name: "国外",
          sub: [],
          is_selected: false,
        };
      }
      const region_lists_ben = JSON.parse(JSON.stringify(this.region_lists));
      region_lists_ben.forEach((item) => {
        switch (item.region) {
          case 'North':
            this.region_across.the_North_China.sub.push(item);
            break;
          case 'Northeast':
            this.region_across.the_Northeast.sub.push(item);
            break;
          case 'East':
            this.region_across.the_East_China.sub.push(item);
            break;
          case 'Central':
            this.region_across.the_Central_China.sub.push(item);
            break;
          case 'South':
            this.region_across.the_South_China.sub.push(item);
            break;
          case 'Southwest':
            this.region_across.the_Southwest.sub.push(item);
            break;
          case 'Northwest':
            this.region_across.the_Northwest.sub.push(item);
            break;
          case 'Abroad':
            if (this.publisher === 1 || this.publisher === 2) {
              if (item['publisher'] && item['publisher'].indexOf(this.publisher) !== -1) {
                this.region_across['the_abroad'].sub.push(item);
              }
            }
            break;
          default:
            this.region_across.the_other_region.sub.push(item);
        }
      });
    } else if (this.divisionType === 'city') {
      this.region_across = JSON.parse(JSON.stringify(this.region_across_city));
      const region_lists_ben = JSON.parse(JSON.stringify(this.region_lists_city));
      this.region_across.all.sub = region_lists_ben;
    }

    /*   if (this.parent_region_list && this.parent_region_list.length) {
         this.initRegion(this.parent_region_list);

       }*/
  }
  initRegion(lists, regionCoefficient?: any[]) {
    this.regionCoefficientSetting = {};
    if (regionCoefficient && regionCoefficient.length > 0) {
      regionCoefficient.forEach((item) => {
        if (item.hasOwnProperty('jzlRegionId') && item.hasOwnProperty('priceFactor')) {
          this.regionCoefficientSetting['code_' + item['jzlRegionId']] = item['priceFactor'];
        }
      });
    }

    if (lists && lists.length) {
      if (lists[0] * 1 === 1009000000) { //推广全部地域
        this.allSelectChina = true;
        this.allSelectAbroad = true;
        this.chinaSelect();
        this.abroadSelect();
        return false;
      }
      const region_has_selected = {};
      lists.forEach((item) => {
        region_has_selected[item] = true;
      });
      for (const prop in this.region_across) {
        if (this.region_across.hasOwnProperty(prop) && prop) {
          if (this.region_type === 'province_region') {
            this.region_across[prop].sub.forEach((item) => {
              if (region_has_selected[item.code]) {
                item.is_selected = true;
              } else {
                item.is_selected = false;
              }
            });
          } else {
            this.region_across[prop].sub.forEach((item) => { //item:各个地区下的省
              item['dropdown'] = true;
              let currentCoefficient = 1;
              if (region_has_selected[item.code]) {
                if (this.regionCoefficientSetting.hasOwnProperty('code_' + item.code)) {
                  currentCoefficient = this.regionCoefficientSetting['code_' + item.code];
                }
                if (item.sub.length === 0) {
                  item['coefficient'] = currentCoefficient;
                  item['coefficient_check'] = false;
                }
                item.is_selected = true;
                item.sub.forEach((city) => {
                  city.is_selected = true;
                  city['coefficient'] = currentCoefficient;
                  city['coefficient_check'] = false;
                });
              }
              if (item.sub.length) {
                item.sub.forEach((city) => { //省下的各个市
                  if (region_has_selected[city.code]) {
                    city.is_selected = true;
                    currentCoefficient = this.regionCoefficientSetting['code_' + city.code];
                    city['coefficient'] = currentCoefficient;
                    city['coefficient_check'] = false;
                  }
                });
              } else {
                // if (region_has_selected[item.code]) {
                //   item.is_selected = true;
                //   currentCoefficient = this.regionCoefficientSetting['code_'+item.code];
                //   item['coefficient'] =currentCoefficient;
                //   item['coefficient_check'] =false;
                //   // item.is_one_selected = true;
                // }
              }
              // 根据选择的市 ，查看是否让 省份 达到全选状态
              if (item.sub.length) {
                item.is_selected = this.provinceIsSelected(item.sub).is_all_selected;
                item.is_one_selected = this.provinceIsSelected(item.sub).is_selected_one;
              }
            });
          }
          // 根据选择的省份 ，查看是否让 地区 达到全选状态
          this.region_across[prop].is_selected = this.regionIsSelected(this.region_across[prop].sub);

          //根据选择的地区是否让中国达到全选状态
          this.allSelectChina = this.chinaIsSelected();
          if (prop === 'the_abroad') {
            this.allSelectAbroad = this.region_across['the_abroad'].is_selected;
          }
        }
      }
      this.getRegionDesc();
    }

  }

  getKeys(any?) {
    return Object.keys(this.region_across);
  }

  chinaIsSelected() {
    let allSelected = true;
    for (const key in this.region_across) {
      if (key !== 'the_abroad' && !this.region_across[key]['is_selected']) {
        allSelected = false;
      }
    }
    return allSelected;
  }

  regionIsSelected(province_lists) {
    const p_length = province_lists.length;
    let count = 0;
    province_lists.forEach((item) => {
      if (item.is_selected) {
        ++count;
      }
    });
    return p_length === count ? true : false;
  }

  provinceIsSelected(city_lists) {
    const c_length = city_lists.length;
    let count = 0;
    city_lists.forEach((item) => {
      if (item.is_selected) {
        ++count;
      }
    });
    let state = false;
    state = (count > 0 && count < c_length) ? true : false;
    return {
      is_all_selected: count === c_length ? true : false,
      is_selected_one: state,
    };
  }
  chinaSelect() {
    for (const attr in this.region_across) {
      if (attr !== 'the_abroad') {
        if (this.region_across.hasOwnProperty(attr)) {
          this.region_across[attr].is_selected = this.allSelectChina;
          this.selectRegion(attr);
        }
      }
    }

    this.getRegionDesc();
  }

  abroadSelect() {
    for (const attr in this.region_across) {
      if (attr === 'the_abroad') {
        if (this.region_across.hasOwnProperty(attr)) {
          this.region_across[attr].is_selected = this.allSelectAbroad;
          this.regionSelect(attr);
        }
      }
    }
  }

  selectRegion(region) {
    this.region_across[region].sub.forEach((province) => {
      province.is_selected = this.region_across[region].is_selected;
      if (province.is_selected && province.sub.length === 0) {
        province['coefficient'] = this.coefficientAll;
        province['coefficient_check'] = false;
      }

      province.is_one_selected = false;
      province.sub.forEach((city) => {
        city.is_selected = this.region_across[region].is_selected;
        if (city.is_selected) {
          city['coefficient'] = this.coefficientAll;
          city['coefficient_check'] = false;
        }
      });
    });
  }

  regionSelect(region) {
    this.selectRegion(region);
    this.allSelectChina = this.chinaIsSelected();
    this.getRegionDesc();
  }

  provinceSelect(province, province_index, region) {
    province['dropdown'] = true;
    if (province.sub.length === 0) {
      province['coefficient'] = this.coefficientAll;
      province['coefficient_check'] = false;
    }

    this.region_across[region].sub[province_index].sub.forEach((city) => {
      city.is_selected = this.region_across[region].sub[province_index].is_selected;
      if (city.is_selected) {
        city['coefficient'] = this.coefficientAll;
        city['coefficient_check'] = false;
      }
    });
    if (this.region_across[region].sub[province_index].is_selected) {
      // 判断该省份所在的地区是否全选
      this.region_across[region].is_selected = this.regionIsSelected(this.region_across[region].sub);
      this.region_across[region].sub[province_index].is_one_selected = false;
      if (region === 'the_abroad') {
        this.allSelectAbroad = this.region_across[region].is_selected;
      } else {
        this.allSelectChina = this.chinaIsSelected();
      }
    } else {
      this.region_across[region].is_selected = false;
      this.region_across[region].sub[province_index].is_one_selected = false;
      if (region === 'the_abroad') {
        this.allSelectAbroad = this.region_across[region].is_selected;
      } else {
        this.allSelectChina = false;
      }
    }
    this.getRegionDesc();
  }

  citySelect(city, city_index, province_index, region) {

    if (city.is_selected) {
      city['coefficient'] = this.coefficientAll;
      city['coefficient_check'] = false;
    }

    if (this.region_across[region].sub[province_index].sub[city_index].is_selected) {
      // 判断该城市所在的省份是否全选
      this.region_across[region].sub[province_index].is_selected = this.provinceIsSelected(this.region_across[region].sub[province_index].sub).is_all_selected;
      //判断该城市所在的省份是否有被选
      this.region_across[region].sub[province_index].is_one_selected = this.provinceIsSelected(this.region_across[region].sub[province_index].sub).is_selected_one;
      // 判断该省份所在的地区是否全选
      this.region_across[region].is_selected = this.regionIsSelected(this.region_across[region].sub);
      this.allSelectChina = this.chinaIsSelected();
    } else {
      this.region_across[region].sub[province_index].is_selected = false;
      this.region_across[region].is_selected = false;
      this.allSelectChina = false;
      //判断该城市所在的省份是否有被选
      this.region_across[region].sub[province_index].is_one_selected = this.provinceIsSelected(this.region_across[region].sub[province_index].sub).is_selected_one;
    }


    this.getRegionDesc();
  }

  getRegionDesc() {
    this.regionCoefficientResult = [];
    this.region_desc = [];
    this.region_selected_lists = [];

    let selectNum = 0;
    for (const prop in this.region_across) {
      if (this.region_across.hasOwnProperty(prop)) {
        this.region_across[prop].sub.forEach((item) => {
          if (item.is_selected) {
            if (this.divisionType === 'province') {
              this.region_selected_lists.push(item.code);
            } else if (this.divisionType === 'city') {
              if (item.sub.length) {
                item.sub.forEach((city) => {
                  this.region_selected_lists.push(city.code);
                  this.region_desc.push(city.name);
                });
              }
            }
            this.regionCoefficientResult.push(item);
          } else {
            let hasCitySelected = false;
            if (item.sub.length) {
              item.sub.forEach((city) => {
                if (city.is_selected) {
                  hasCitySelected = true;
                  this.region_selected_lists.push(city.code);
                  this.region_desc.push(city.name);
                }
              });
            }
            hasCitySelected && this.regionCoefficientResult.push(item);
          }
          /*if (item.sub.length) {
            item.sub.forEach(city => {
              if (city.is_selected) {
                this.region_selected_lists.push(city.code);
                this.region_desc.push(city.name);
              }
            });
          } else {
            if (item.is_selected) {
              this.region_selected_lists.push(item.code);
              this.region_desc.push(item.name);
            }
          }*/
        });
      }

    }

    if (this.divisionType === 'province') {
      for (const prov of this.region_lists) {
        if (this.region_selected_lists.indexOf(prov.code) > -1) {
          if (prov.sub.length) {
            selectNum += prov.sub.length;
          } else {
            selectNum += 1;
          }
        }
      }
      this.selectCityNum = selectNum;
    } else if (this.divisionType === 'city') {
      this.selectCityNum = this.region_selected_lists.length;
    }

  }

  coefficientItemChange(item, $event) {
    this.regionCoefficientSetting['code_' + item['code']] = $event;
  }

  ngDoCheck() {
    this.regionSelected.emit({ region_lists: this.region_selected_lists, region_price_factor: this.regionCoefficientResult });
  }

  batchUpdateItemCoefficient(item) {
    setTimeout(() => {
      if (item.sub.length > 0) {
        item.sub.forEach((subItem) => {
          if (subItem.is_selected) {
            subItem['coefficient'] = item['coefficient'];
          }
        });
      }
    }, 0);

  }

  batchUpdateAllCoefficient() {
    this.regionCoefficientResult.forEach((item) => {
      item['coefficient'] = this.coefficientAll;
      item.sub.forEach((subItem) => {
        subItem['coefficient'] = this.coefficientAll;
      });
    });
  }
  //批量添加地域
  batchAddRegion() {
    const add_modal = this.modalService.create({
      nzTitle: '批量添加地域',
      nzWidth: 600,
      nzContent: BatchAddRegionComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        sourceData: this.region_across,
        divisionType: this.divisionType,
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result.name === 'onOk') {
        this.initRegion(result.value);
      }
    });
  }

  // 添加搜索名称
  setSearchName(sourceData, type) {
    sourceData.forEach(item => {
      item['search_name'] = item.name;
      this.regionSearchData[type].push({ 'search_name': item['search_name'], });
      if (item['sub'] && item['sub'].length > 0) {
        item['sub'].forEach(subItem => {
          subItem['search_name'] = item.name + '-' + subItem.name;
          this.regionSearchData[type].push({ 'search_name': subItem['search_name'], });
        });
      }
    });
  }
  // 下载区域字典
  downloadRegions() {
    // 列标题，逗号隔开，每一个逗号就是隔开一个单元格
    let str = '';
    // 增加\t为了不让表格显示科学计数法或者其他格式
    for (let i = 0; i < this.regionSearchData[this.divisionType].length; i++) {
      for (const key in this.regionSearchData[this.divisionType][i]) {
        str += `${this.regionSearchData[this.divisionType][i][key]},`;
      }
      str += '\n';
    }
    // encodeURIComponent解决中文乱码
    const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
    // 通过创建a标签实现
    const link = document.createElement("a");
    link.href = uri;
    // 对下载的文件命名
    link.download = `地域搜索关键词(${this.divisionType === 'province' ? '按省市划分' : '按发展划分'}).csv`;
    link.click();
  }

}
