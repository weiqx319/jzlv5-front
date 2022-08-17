import {Component, ElementRef, EventEmitter, Input, OnInit, DoCheck, Output, ViewChild} from '@angular/core';
import {RegionListService} from "../../../dashboard/service/region-list.service";
import {hasOwnProperty} from "tslint/lib/utils";

@Component({
  selector: 'app-region-select-view',
  templateUrl: './region-select-view.component.html',
  styleUrls: ['./region-select-view.component.scss'],
  providers: [RegionListService]
})
export class RegionSelectViewComponent implements OnInit, DoCheck {

  // @Input() parent_region_list: any;

  @Input() is_hidden: any;
  @Input() set par_publisher(data) {
    this.allSelectChina = false;
    this.allSelectAbroad = false;
    this.publisher = data;
    this.Initialization();
  }
  @Input() set parent_region_list(data) {
    // this.parent_region_list = data;
    this.initRegion(data);
  }



  public publisher = 2;
  private region_lists: any;
  private condition_index: number;
  private region_type: any;
  public region_across_origin = {
    'the_North_China': {
      name: "华北地区",
      sub: [],
      is_selected: false
    },
    'the_Northeast': {
      name: "东北地区",
      sub: [],
      is_selected: false
    },
    'the_East_China': {
      name: "华东地区",
      sub: [],
      is_selected: false
    },
    'the_Central_China': {
      name: "华中地区",
      sub: [],
      is_selected: false
    },
    'the_South_China': {
      name: "华南地区",
      sub: [],
      is_selected: false
    },
    'the_Southwest': {
      name: "西南地区",
      sub: [],
      is_selected: false
    },
    'the_Northwest': {
      name: "西北地区",
      sub: [],
      is_selected: false
    },
    'the_other_region': {
      name: "其他地区",
      sub: [],
      is_selected: false
    }
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

  @Output() regionSelected: EventEmitter<Object> = new EventEmitter<Object>();

  @ViewChild('region', { static: true }) regionNode: ElementRef;

  constructor(private regionListService: RegionListService) {
    this.region_lists = this.regionListService.getRegionLists();
  }

  ngOnInit() {
  }

  Initialization() {
    this.region_across = null;
    this.region_across = JSON.parse(JSON.stringify(this.region_across_origin));
    if (this.publisher === 1 || this.publisher === 2) {
      this.region_across['the_abroad'] = {
        name: "国外",
        sub: [],
        is_selected: false
      };
    }
    const region_lists_ben = JSON.parse(JSON.stringify(this.region_lists));
    region_lists_ben.forEach(item => {
      switch (item.region) {
        case 'North' :
          this.region_across.the_North_China.sub.push(item);
          break;
        case 'Northeast' :
          this.region_across.the_Northeast.sub.push(item);
          break;
        case 'East' :
          this.region_across.the_East_China.sub.push(item);
          break;
        case 'Central' :
          this.region_across.the_Central_China.sub.push(item);
          break;
        case 'South' :
          this.region_across.the_South_China.sub.push(item);
          break;
        case 'Southwest' :
          this.region_across.the_Southwest.sub.push(item);
          break;
        case 'Northwest' :
          this.region_across.the_Northwest.sub.push(item);
          break;
        case 'Abroad' :
          if (this.publisher === 1 || this.publisher === 2) {
            if (item['publisher'] && item['publisher'].indexOf(this.publisher) !== -1) {
              this.region_across['the_abroad'].sub.push(item);
            }
          }
          break;
        default :
          this.region_across.the_other_region.sub.push(item);
      }
    });
 /*   if (this.parent_region_list && this.parent_region_list.length) {
      this.initRegion(this.parent_region_list);

    }*/
  }
  initRegion(lists) {
    if (lists && lists.length) {
      if (lists[0] * 1 === 1009000000) { //推广全部地域
        this.allSelectChina = true;
        this.allSelectAbroad = true;
        this.chinaSelect();
        this.abroadSelect();
        return false;
      }
      const region_has_selected = {};
      lists.forEach(item => {
        region_has_selected[item] = true;
      });
      for (const prop in this.region_across) {
        if (this.region_across.hasOwnProperty(prop) && prop) {
          if (this.region_type === 'province_region') {
            this.region_across[prop].sub.forEach(item => {
              if (region_has_selected[item.code]) {
                item.is_selected = true;
              } else {
                item.is_selected = false;
              }
            });
          } else {
            this.region_across[prop].sub.forEach(item => { //item:各个地区下的省
              if (region_has_selected[item.code]) {
                item.is_selected = true;
                item.sub.forEach(city => {
                  city.is_selected = true;
                });
              }
              if (item.sub.length) {
                item.sub.forEach(city => { //省下的各个市
                  if (region_has_selected[city.code]) {
                    city.is_selected = true;
                  }
                });
              } else {
                if (region_has_selected[item.code]) {
                  item.is_selected = true;
                  // item.is_one_selected = true;
                }
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
        }
      }
      this.getRegionDesc();
    }

  }


  getKeys(any?) {
    return Object.keys(this.region_across);
  }

  chinaIsSelected() {
    let count = 0;
    this.getKeys().forEach(item => {
      if (this.region_across[item]['is_selected']) {
        ++count;
      }
    });
    return this.getKeys().length === count ? true : false;
  }

  regionIsSelected(province_lists) {
    const p_length = province_lists.length;
    let count = 0;
    province_lists.forEach(item => {
      if (item.is_selected) {
        ++count;
      }
    });
    return p_length === count ? true : false;
  }

  provinceIsSelected(city_lists) {
    const c_length = city_lists.length;
    let count = 0;
    city_lists.forEach(item => {
      if (item.is_selected) {
        ++count;
      }
    });
    let state = false;
    state = (count > 0 && count < c_length) ? true : false;
    return {
      'is_all_selected': count === c_length ? true : false,
      'is_selected_one': state
    };
  }
  chinaSelect() {
    this.getKeys().forEach(attr => {
      this.region_across[attr].is_selected = this.allSelectChina;
      this.getKeys().forEach(item => {
        if (item !== 'the_abroad') {
          this.region_across[item]['is_selected'] = this.allSelectChina;
          this.region_across[item]['sub'].forEach(province => {
            province['is_selected'] = this.allSelectChina;
            if (province['sub'].length > 1) {
              province['sub'].forEach(city => {
                city['is_selected'] = this.allSelectChina;
              });
            }
          });
        }
      });
    });

  }

  abroadSelect() {
    for ( const attr in this.region_across) {
      if (attr === 'the_abroad') {
        if (this.region_across.hasOwnProperty(attr)) {
          this.region_across[attr].is_selected = this.allSelectAbroad;
          this.regionSelect(attr);
        }
      }
    }
  }

  regionSelect(region) {
    this.region_across[region].sub.forEach(province => {
      province.is_selected = this.region_across[region].is_selected;
      province.is_one_selected = false;
      province.sub.forEach(city => {
        city.is_selected = this.region_across[region].is_selected;
      });
    });
    this.getRegionDesc();
    this.allSelectChina = this.chinaIsSelected();
  }
  provinceSelect(province, province_index, region) {
    this.region_across[region].sub[province_index].sub.forEach(city => {
      city.is_selected = this.region_across[region].sub[province_index].is_selected;
    });
    if (this.region_across[region].sub[province_index].is_selected) {
      // 判断该省份所在的地区是否全选
      this.region_across[region].is_selected = this.regionIsSelected(this.region_across[region].sub);
      this.allSelectChina = this.chinaIsSelected();
      this.region_across[region].sub[province_index].is_one_selected = false;
      if (region === 'the_abroad') {
        this.allSelectAbroad = this.region_across[region].is_selected;
      }
    } else {
      this.region_across[region].is_selected = false;
      this.allSelectChina = false;
      this.region_across[region].sub[province_index].is_one_selected = false;
      if (region === 'the_abroad') {
        this.allSelectAbroad = this.region_across[region].is_selected;
      }
    }
    this.getRegionDesc();
  }

  citySelect(city, city_index, province_index, region) {
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
    this.region_desc = [];
    this.region_selected_lists = [];
    for (const prop in this.region_across) {
      if (this.region_across.hasOwnProperty(prop)) {
        this.region_across[prop].sub.forEach(item => {
          if (item.is_selected) {
            this.region_selected_lists.push(item.code);
          } else {
            if (item.sub.length) {
              item.sub.forEach(city => {
                if (city.is_selected) {
                  this.region_selected_lists.push(city.code);
                  this.region_desc.push(city.name);
                }
              });
            }
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
  }

  ngDoCheck() {
    this.regionSelected.emit({ region_lists: this.region_selected_lists});
  }
}
