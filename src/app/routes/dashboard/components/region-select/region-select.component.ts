import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {RegionListService} from "../../service/region-list.service";


@Component({
  selector: 'app-region-select',
  templateUrl: './region-select.component.html',
  styleUrls: ['./region-select.component.scss']
})
export class RegionSelectComponent implements OnInit {

  private region_condtion: any;
  private region_type: any;
  private region_lists: any;
  private condition_index: number;
  public region_across: any = {
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
  public region_desc = [];
  private region_selected_lists = [];
  public allSelectChina = false;
  public newSelected = [];


  @Input() set region(data: any) {
    this.region_condtion = data;
  }

  @Input() set cIndex(data: any) {
    this.condition_index = data;
  }

  @Output() regionSelected: EventEmitter<Object> = new EventEmitter<Object>();

  @ViewChild('region', { static: true }) regionNode: ElementRef;

  constructor(private regionListService: RegionListService) {
    this.region_lists = this.regionListService.getRegionLists();
  }

  ngOnInit() {
    this.region_type = this.region_condtion.key;
    this.region_lists.forEach(item => {
      if (this.region_type === 'province_region') {
        item.sub = [];
      }
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
          break;
        default :
          this.region_across.the_other_region.sub.push(item);
      }
    });
    if (this.region_condtion.value.length) {
      this.initRegion(this.region_condtion.value);
      // 初始化region_desc 和 region_selected_lists;
      this.getRegionDesc();
    }
    const string = JSON.stringify(this.region_condtion.value ) === "" ? '[]' : JSON.stringify(this.region_condtion.value);
    this.newSelected = JSON.parse( string ) ;  //编辑：类似深拷贝（先将对象转为字符串，然后将字符串转换为对象）
  }

  initRegion(lists) {
    const region_has_selected = {};
    lists.forEach(item => {
      region_has_selected[item] = true;
    });
    for (const prop in this.region_across) {
      if (prop) {
        if (this.region_type === 'province_region') {
          this.region_across[prop].sub.forEach(item => {
            if (region_has_selected[item.code]) {
              item.is_selected = true;
            } else {
              item.is_selected = false;
            }
          });
        } else {
          this.region_across[prop].sub.forEach(item => {
            if (item.sub.length) {
              item.sub.forEach(city => {
                if (region_has_selected[city.code]) {
                  city.is_selected = true;
                  city.is_selected = false;
                }
              });
            } else {
              if (region_has_selected[item.code]) {
                item.is_selected = true;
                item.is_selected = false;
              }
            }
            // 根据选择的市 ，查看是否让 省份 达到全选状态
            item.is_selected = this.provinceIsSelected(item.sub);
          });
        }
        // 根据选择的省份 ，查看是否让 地区 达到全选状态
        this.region_across[prop].is_selected = this.regionIsSelected(this.region_across[prop].sub);
        //根据选择的地区是够让中国达到全选状态
        this.allSelectChina = this.chinaIsSelected();
      }
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
    return p_length === count;
  }

  provinceIsSelected(city_lists) {
    const c_length = city_lists.length;
    let count = 0;
    city_lists.forEach(item => {
      if (item.is_selected) {
        ++count;
      }
    });
    return c_length === count;
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
  regionSelect(region) {
    this.region_across[region].sub.forEach(province => {
      province.is_selected = this.region_across[region].is_selected;
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
    } else {
      this.region_across[region].is_selected = false;
      this.allSelectChina = false;
    }
    this.getRegionDesc();
  }

  citySelect(city, city_index, province_index, region) {
    if (this.region_across[region].sub[province_index].sub[city_index].is_selected) {
      // 判断该城市所在的省份是否全选
      this.region_across[region].sub[province_index].is_selected = this.provinceIsSelected(this.region_across[region].sub[province_index].sub);
      // 判断该省份所在的地区是否全选
      this.region_across[region].is_selected = this.regionIsSelected(this.region_across[region].sub);
      this.allSelectChina = this.chinaIsSelected();
    } else {
      this.region_across[region].sub[province_index].is_selected = false;
      this.region_across[region].is_selected = false;
      this.allSelectChina = false;
    }
    this.getRegionDesc();
  }

  getRegionDesc() {
    this.region_desc = [];
    this.region_selected_lists = [];
    for (const prop in this.region_across) {
      if (this.region_type === 'province_region') {
        this.region_across[prop].sub.forEach(item => {
          if (item.is_selected) {
            this.region_selected_lists.push(item.code);
            this.region_desc.push(item.name);
          }
        });
      } else {
        this.region_across[prop].sub.forEach(item => {
          if (item.sub.length) {
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
          }
        });
      }
    }
  }

  cancel() {

    this.region_selected_lists = this.newSelected;
    if (!this.region_selected_lists) {
      this.region_selected_lists = [];
    }
    this.initRegion(this.region_selected_lists);
    this.getRegionDesc();
    this.regionSelected.emit({c_index: this.condition_index, region_lists: this.region_selected_lists});
    this.regionNode.nativeElement.style.display = 'none';
    this.regionNode.nativeElement.style.position = 'static';
    this.regionNode.nativeElement.parentNode.querySelector('.region-select').style.borderBottom = '1px solid #e4e4e4';
  }

  done() {

    this.regionNode.nativeElement.style.display = 'none';
    this.regionNode.nativeElement.style.position = 'static';
    this.regionNode.nativeElement.parentNode.querySelector('.region-select').style.borderBottom = '1px solid #e4e4e4';

    this.newSelected = this.region_selected_lists;
    this.regionSelected.emit({c_index: this.condition_index, region_lists: this.region_selected_lists});


  }

}
