import { AfterViewChecked, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { DataViewService } from "../../../../../service/data-view.service";
import { fromEvent, zip } from "rxjs";
import { isArray } from "@jzl/jzl-util";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from "../../../../../../../core/service/auth.service";
import { deepCopy } from "@jzl/jzl-util";
import { GlobalTemplateComponent } from "../../../../../../../shared/template/global-template/global-template.component";
import { MenuService } from "../../../../../../../core/service/menu.service";
declare var TMap;
@Component({
  selector: 'app-target-basic-template-gdt',
  templateUrl: './target-basic-template-gdt.component.html',
  styleUrls: ['./target-basic-template-gdt.component.scss']
})
export class TargetBasicTemplateGdtComponent implements OnInit, AfterViewChecked {
  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  @Input() landing_type;
  @Input() targetSource;
  @Input() isLaunchPackage;
  @Input() curAudienceData;
  @Input() targetType;

  public gdtTargetConfigList = {};

  public cityText = '';
  public noHaveText = '';
  public cityLoading = true;
  public searchCrowdValue = '';
  public searchExcludeValue = '';

  public editDefaultDataOption = {
    geo_location: {
      name: "地域",
      resultValue: "NONE",
      radioType: [
        { value: 'NONE', label: '不限', disabled: false },
        { value: 'CUSTOM', label: '按区域', disabled: false },
        { value: 'MAP', label: '从地图选择', disabled: false },
      ],
      sub: [],
      resultList: [],
      custom_locations: [],
      location_types: {
        name: "位置类型",
        sub: [
          {
            value: "RECENTLY_IN",
            label: "近期在这里的人",
            tips: "近期在这里的人",
            checked: true,
            disabled: false,
          },
          {
            value: "LIVE_IN",
            label: "常住这里的人",
            tips: "常住这里的人",
            checked: false,
            disabled: false,
          },
          {
            value: "TRAVEL_IN",
            label: "旅行到这里的人",
            tips: "旅行到这里的人",
            checked: false,
            disabled: false,
          },
          {
            value: "VISITED_IN",
            label: "去过这里的人",
            tips: "去过这里的人",
            checked: false,
            disabled: false,
          },
        ],
      },
    },
    crowd: {
      name: "人群",
      resultValue: "NONE",
      radioType: [
        { value: 'NONE', label: '不限', disabled: false },
        { value: 'CUSTOM', label: '自定义', disabled: false },
      ],
      sub: [],
      resultList: [],
    },
    age: {
      name: "年龄",
      resultValue: "NONE",
      disabled: false,
      sub: [],
      customList: [],
      resultList: [],
      rangeStartResult: "",
      rangeEndResult: "",
    },
    gender: {
      name: "性别",
      resultValue: "NONE",
      disabled: false,
      sub: [],
      resultList: [],
    },
    education: {
      name: "学历",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    marital_status: {
      name: "婚恋育儿状态",
      resultValue: "NONE",
      radioType: [
        { value: 'NONE', label: '不限', disabled: false },
        { value: 'CUSTOM', label: '自定义', disabled: false },
      ],
      sub: [],
      resultList: [],
    },
    working_status: {
      name: "工作状态",
      resultValue: "NONE",
      radioType: [
        { value: 'NONE', label: '不限', disabled: false },
        { value: 'CUSTOM', label: '自定义', disabled: false },
      ],
      sub: [],
      resultList: [],
    },
    financial_situation: {
      name: "资产状态",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    consumption_type: {
      name: "消费类型",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    game_consumption_level: {
      name: "游戏消费能力",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    consumption_status: {
      name: "消费能力",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    resident_community_price_array: {
      name: "居住社区价格",
      resultValue: "NONE",
      disabled: false,
      sub: [],
      customList: [],
      resultList: [],
      rangeStartResult: "",
      rangeEndResult: "",
    },
    behavior_or_interest: {
      name: "行为兴趣",
      resultValue: "NONE",
      disabled: false,
      sub: [],
    },
    behavior: {
      name: "行为",
      expand: false,
      resultValue: "NONE",
      sub: [],
      resultList: [],
      combine_data: {
        scene: {
          name: "行为场景",
          NOLIMIT: true,
          disabled: false,
          sub: [],
          resultList: [],
        },
        time_window: {
          name: "行为时效性",
          resultValue: "BEHAVIOR_INTEREST_TIME_WINDOW_SEVEN_DAY",
          disabled: false,
          sub: [],
          resultList: [],
        },
        intensity: {
          name: "行为强度",
          NOLIMIT: true,
          disabled: false,
          sub: [],
          resultList: [],
        },
      }
    },
    interest: {
      name: "兴趣",
      expand: false,
      resultValue: "NONE",
      sub: [],
      resultList: [],
    },
    intention: {
      name: "意向",
      expand: false,
      resultValue: "NONE",
      sub: [],
      resultList: [],
    },
    app_install_status: {
      name: "应用安装",
      resultValue: "NONE",
      sub: [],
      resultList: [],
    },
    // excluded_converted_audience: {
    //   name: "排除已转化用户",
    //   resultValue: "NONE",
    //   sub: [],
    //   resultList: [],
    // },
    new_device: {
      name: "新设备用户",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    device_brand_model: {
      name: "设备品牌型号",
      resultValue: "NONE",
      radioType: [
        { value: 'NONE', label: '不限', disabled: false },
        { value: 'CUSTOM', label: '自定义', disabled: false },
      ],
      sub: [],
      resultList: [],
      is_exclude: false,
    },
    network_scene: {
      name: "上网场景",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    user_os: {
      name: "操作系统版本",
      resultValue: "NONE",
      radioType: [
        { value: 'NONE', label: '不限', disabled: false },
        { value: 'CUSTOM', label: '自定义', disabled: false },
      ],
      sub: [],
      resultList: [],
    },
    network_type: {
      name: "联网方式",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    network_operator: {
      name: "移动运营商",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    device_price: {
      name: "设备价格",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    mobile_union_category: {
      name: "移动媒体类型",
      resultValue: "NONE",
      radioType: [
        { value: 'NONE', label: '不限', disabled: false },
        { value: 'CUSTOM', label: '自定义', disabled: false },
      ],
      sub: [],
      resultList: [],
    },
    temperature: {
      name: "温度",
      resultValue: "NONE",
      radioType: [
        { value: 'NONE', label: '不限', disabled: false },
        { value: 'CUSTOM', label: '自定义', disabled: false },
      ],
      sub: [],
      customList: [],
      resultList: [],
      rangeStartResult: "0℃",
      rangeEndResult: "20℃",
    },
    uv_index: {
      name: "紫外线指数",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    dressing_index: {
      name: "穿衣指数",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    makeup_index: {
      name: "化妆指数",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
    climate: {
      name: "气象",
      NOLIMIT: true,
      disabled: false,
      sub: [],
      resultList: [],
    },
  };

  public isInitSingleDataFinshed = false;

  public accountsList = [];

  public cid;

  public curAccountsList = [];

  public accounts = [];

  public curTargetSource = {};

  public curLocationRadius = 0.5;

  constructor(private dataViewService: DataViewService, public launchRpaService: LaunchRpaService, private message: NzMessageService, private authService: AuthService, public menuService: MenuService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit(): void {
    this.curTargetSource = deepCopy(this.targetSource);
    this.getTargetConfig();
    this.getAccountList();
  }

  ngAfterViewChecked() {
    if (this.isInitSingleDataFinshed) {
      const setting = this.generateResultData();
      this.targetSource.audience_setting = { ...setting };
    }
  }

  getTargetConfig() {
    this.cityLoading = true;
    const getGdtTargetRegionConfig$ = this.dataViewService.getGdtTargetRegionConfig();
    const getGdtTargetConfig$ = this.launchRpaService.getTargetConfigByGdt({});

    zip(getGdtTargetConfig$, getGdtTargetRegionConfig$).subscribe(([result, regionResult]) => {
      this.gdtTargetConfigList = result['data'];
      this.editDefaultDataOption.geo_location.sub = regionResult;
      this.initConfigList();
      this.cityLoading = false;
    });
  }

  initConfigList() {
    this.isInitSingleDataFinshed = false;
    for (const item of Object.keys(this.editDefaultDataOption)) {
      if (item === 'age') {
        this.editDefaultDataOption[item].sub = this.gdtTargetConfigList[item]['sub'];
        this.editDefaultDataOption[item].customList = this.generateRangeData(item, this.gdtTargetConfigList['age_custom'].rangeStart, this.gdtTargetConfigList['age_custom'].rangeEnd, this.gdtTargetConfigList['age_custom'].range_options, this.gdtTargetConfigList['age_custom'].suffix, this.gdtTargetConfigList['age_custom'].endLess);
        this.editDefaultDataOption[item].rangeStartResult = this.gdtTargetConfigList['age_custom'].rangeStartResult;
        this.editDefaultDataOption[item].rangeEndResult = this.gdtTargetConfigList['age_custom'].rangeEndResult;
      } else if (item === 'temperature') {
        this.editDefaultDataOption[item].sub = this.gdtTargetConfigList[item]['sub'];
        this.editDefaultDataOption[item].customList = this.generateRangeData(item, this.gdtTargetConfigList['temperature'].rangeStart, this.gdtTargetConfigList['temperature'].rangeEnd, this.gdtTargetConfigList['temperature'].range_options, this.gdtTargetConfigList['temperature'].suffix, this.gdtTargetConfigList['temperature'].endLess);
        this.editDefaultDataOption[item].rangeStartResult = this.gdtTargetConfigList['temperature'].rangeStartResult;
        this.editDefaultDataOption[item].rangeEndResult = this.gdtTargetConfigList['temperature'].rangeEndResult;
      } else if (item === 'resident_community_price_array') {
        this.editDefaultDataOption[item].sub = this.gdtTargetConfigList[item]['sub'];
        this.editDefaultDataOption[item].customList = this.generateRangeData(item, this.gdtTargetConfigList['resident_community_price_custom'].rangeStart, this.gdtTargetConfigList['resident_community_price_custom'].rangeEnd, this.gdtTargetConfigList['resident_community_price_custom'].range_options, this.gdtTargetConfigList['resident_community_price_custom'].suffix, this.gdtTargetConfigList['resident_community_price_custom'].endLess);
        this.editDefaultDataOption[item].rangeStartResult = this.gdtTargetConfigList['resident_community_price_custom'].rangeStartResult;
        this.editDefaultDataOption[item].rangeEndResult = this.gdtTargetConfigList['resident_community_price_custom'].rangeEndResult;
      } else if (item === 'behavior' || item === 'interest' || item === 'intention') {
        this.editDefaultDataOption[item].sub = this.gdtTargetConfigList[item]['category_id_list'];
        this.editDefaultDataOption['behavior']['combine_data']['scene']['sub'] = this.gdtTargetConfigList['behavior']['scene']['sub'];
        this.editDefaultDataOption['behavior']['combine_data']['time_window']['sub'] = this.gdtTargetConfigList['behavior']['time_window']['sub'];
        this.editDefaultDataOption['behavior']['combine_data']['intensity']['sub'] = this.gdtTargetConfigList['behavior']['intensity']['sub'];
      } else if (item === 'mobile_union_category') {
        this.editDefaultDataOption[item].sub = this.gdtTargetConfigList[item];
      } else if (item !== 'geo_location' && item !== 'crowd') {
        this.editDefaultDataOption[item].sub = this.gdtTargetConfigList[item]['sub'];
      }
      // else if(item === 'excluded_converted_audience') {
      //   this.editDefaultDataOption[item].sub = this.gdtTargetConfigList[item]['excluded_dimension']['sub'];
      // }

    }

    this.initSingleData(this.targetSource.audience_setting);
    const setting = this.generateResultData();
    this.targetSource.audience_setting = { ...setting };
    this.isInitSingleDataFinshed = true;
  }

  initSingleData(audienceData) {
    if (Object.keys(audienceData).length) {
      for (const item of Object.keys(this.editDefaultDataOption)) {
        if (this.editDefaultDataOption[item].hasOwnProperty('NOLIMIT')) {
          this.editDefaultDataOption[item].sub.forEach(subItem => {
            if (audienceData[item].indexOf(subItem['value']) > -1) {
              subItem['checked'] = true;
              this.editDefaultDataOption[item]['NOLIMIT'] = false;
            }
          });
        } else if (this.editDefaultDataOption[item].hasOwnProperty('resultValue')) {
          if (item === 'geo_location') {
            if (audienceData[item].hasOwnProperty('regions')) {
              this.editDefaultDataOption[item].resultValue = 'CUSTOM';
              this.editDefaultDataOption[item]['resultList'] = audienceData[item]['regions'];
              this.editDefaultDataOption[item]['location_types']['sub'].forEach(subItem => {
                subItem['checked'] = audienceData[item]['location_types'].indexOf(subItem['value']) > -1;
              });
            }
            if (audienceData[item].hasOwnProperty('custom_locations')) {
              this.editDefaultDataOption[item].resultValue = 'MAP';
              this.editDefaultDataOption[item]['custom_locations'] = audienceData[item]['custom_locations'];
              this.editDefaultDataOption[item]['location_types']['sub'].forEach(subItem => {
                subItem['checked'] = audienceData[item]['location_types'].indexOf(subItem['value']) > -1;
                subItem['disabled'] = audienceData[item]['location_types'].indexOf(subItem['value']) < 0;
              });
            }
          } else if (item === 'gender' || item === 'app_install_status') {
            this.editDefaultDataOption[item].resultValue = audienceData[item];
          } else if (item === 'age' || item === 'resident_community_price_array' || item === 'temperature') {
            this.editDefaultDataOption[item].resultValue = audienceData[item]['value'];
            if (audienceData[item]['value'] === 'age_custom' || audienceData[item]['value'] === 'resident_community_price_custom' || audienceData[item]['value'] === 'CUSTOM') {
              this.editDefaultDataOption[item].rangeStartResult = audienceData[item]['min'];
              this.editDefaultDataOption[item].rangeEndResult = audienceData[item]['max'];
            }
          } else if (item === 'behavior_or_interest') {
            if (audienceData['auto_audience']) {
              this.editDefaultDataOption[item].resultValue = 'auto_audience';
            } else if (Object.keys(audienceData['behavior_or_interest']).length) {
              this.editDefaultDataOption[item].resultValue = 'custom';
            }
          } else if (item === 'behavior') {
            if (Object.keys(audienceData['behavior_or_interest']).length && !audienceData['auto_audience']) {
              this.editDefaultDataOption[item]['expand'] = true;
              this.editDefaultDataOption[item]['resultList'] = audienceData['behavior_or_interest'][item]['category_id_list'];
              this.editDefaultDataOption['behavior']['combine_data']['scene']['sub'].forEach(subItem => {
                if (audienceData['behavior_or_interest'][item]['scene'].indexOf(subItem['value']) > -1) {
                  subItem['checked'] = true;
                  this.editDefaultDataOption['behavior']['combine_data']['scene']['NOLIMIT'] = false;
                }
              });
              this.editDefaultDataOption['behavior']['combine_data']['time_window']['sub'].forEach(subItem => {
                if (audienceData['behavior_or_interest'][item]['time_window'].indexOf(subItem['value']) > -1) {
                  subItem['checked'] = true;
                  this.editDefaultDataOption['behavior']['combine_data']['time_window']['NOLIMIT'] = false;
                }
              });
              this.editDefaultDataOption['behavior']['combine_data']['intensity']['sub'].forEach(subItem => {
                if (audienceData['behavior_or_interest'][item]['intensity'].indexOf(subItem['value']) > -1) {
                  subItem['checked'] = true;
                  this.editDefaultDataOption['behavior']['combine_data']['intensity']['NOLIMIT'] = false;
                }
              });
            }
          } else if (item === 'intention' || item === 'interest') {
            if (Object.keys(audienceData['behavior_or_interest']).length && !audienceData['auto_audience']) {
              this.editDefaultDataOption[item]['expand'] = true;
              this.editDefaultDataOption[item]['resultList'] = audienceData['behavior_or_interest'][item]['category_id_list'];
            }
          } else if (item === 'device_brand_model') {
            if (audienceData[item]['excluded_list'].length > 0) {
              this.editDefaultDataOption[item].resultValue = 'CUSTOM';
              this.editDefaultDataOption[item].is_exclude = true;
              this.editDefaultDataOption[item]['resultList'] = audienceData[item]['excluded_list'];
            }
            if (audienceData[item]['included_list'].length > 0) {
              this.editDefaultDataOption[item].resultValue = 'CUSTOM';
              this.editDefaultDataOption[item].is_exclude = false;
              this.editDefaultDataOption[item]['resultList'] = audienceData[item]['included_list'];
            }
          } else if (item === 'crowd') {
            if (Object.keys(audienceData['crowd']).length) {
              this.editDefaultDataOption.crowd['resultValue'] = 'CUSTOM';
              for (const crowdItem of Object.keys(audienceData['crowd'])) {
                const index = this.accountsList.findIndex(value => value.chan_pub_id == crowdItem);
                if (index !== -1 && !this.curAccountsList.find(s_item => s_item.id === crowdItem)) {
                  this.accounts.push(Number(crowdItem));
                  const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, crowdResultList: audienceData['crowd'][crowdItem]['include'], excludeCrowdResultList: audienceData['crowd'][crowdItem]['exclude'] };
                  this.curAccountsList.push(obj);
                  this.getByteDanceTargetAudience(obj);
                }
              }
            }
          } else {
            if (audienceData[item].length) {
              this.editDefaultDataOption[item]['resultValue'] = 'CUSTOM';
              this.editDefaultDataOption[item]['resultList'] = audienceData[item];
            }
          }
        }
      }
      if (this.isLaunchPackage) {
        if (Object.keys(this.targetSource.target_setting).length) {
          this.getDisabled(this.targetSource.target_setting);
        } else {
          this.getDisabled(audienceData);
        }
      }
    }
  }

  getDisabled(audienceData) {
    for (const item of Object.keys(this.editDefaultDataOption)) {
      if (this.editDefaultDataOption[item].hasOwnProperty('NOLIMIT')) {
        if (audienceData[item].length > 0) {
          this.editDefaultDataOption[item].sub.forEach(subItem => {
            if (audienceData[item].indexOf(subItem['value']) > -1) {
              this.editDefaultDataOption[item]['disabled'] = true;
            } else {
              subItem['disabled'] = true;
            }
          });
        }
      } else if (this.editDefaultDataOption[item].hasOwnProperty('radioType')) {
        if (item === 'geo_location' || item === 'crowd') {
          this.editDefaultDataOption[item]['radioType'].forEach(subItem => {
            subItem['disabled'] = subItem['value'] === 'NONE' && Object.keys(audienceData[item]).length > 0;
          });
          if (item === 'geo_location' && Object.keys(audienceData['geo_location']).length > 0) {
            this.editDefaultDataOption['geo_location']['location_types'].sub.forEach(subItem => {
              if (audienceData['geo_location']['location_types'].indexOf(subItem['value']) === -1) {
                subItem['disabled'] = true;
              }
            });
          }
        } else if (item === 'device_brand_model') {
          if (audienceData[item]['excluded_list'].length > 0 || audienceData[item]['included_list'].length > 0) {
            this.editDefaultDataOption[item]['radioType'].forEach(subItem => {
              subItem['disabled'] = subItem['value'] === 'NONE' && Object.keys(audienceData[item]).length > 0;
            });
          }
        } else if (item === 'temperature') {
          this.editDefaultDataOption[item]['disabled'] = audienceData[item]['value'] !== 'NONE';
          if (audienceData[item]['value'] !== 'NONE') {
            this.editDefaultDataOption[item]['radioType'].forEach(subItem => {
              subItem['disabled'] = subItem['value'] !== 'NONE' && subItem['value'] !== audienceData[item]['value'];
            });
          }
        } else {
          this.editDefaultDataOption[item]['radioType'].forEach(subItem => {
            subItem['disabled'] = subItem['value'] === 'NONE' && audienceData[item].length > 0;
          });
        }

      } else {
        if (item === 'age' || item === 'resident_community_price_array') {
          this.editDefaultDataOption[item]['disabled'] = audienceData[item]['value'] !== 'NONE';
          if (audienceData[item]['value'] !== 'NONE') {
            this.editDefaultDataOption[item]['sub'].forEach(subItem => {
              subItem['disabled'] = subItem['value'] !== 'NONE' && subItem['value'] !== audienceData[item]['value'];
            });
          }
        } else if (item === 'behavior_or_interest') {
          this.editDefaultDataOption[item]['sub'].forEach(subItem => {
            if (audienceData['auto_audience']) {
              subItem['disabled'] = subItem['value'] === 'custom';
              this.editDefaultDataOption[item]['disabled'] = true;
            } else {
              subItem['disabled'] = subItem['value'] !== 'custom' && Object.keys(audienceData[item]).length > 0;
              this.editDefaultDataOption[item]['disabled'] = Object.keys(audienceData[item]).length > 0;
              if (subItem['value'] === 'custom' && Object.keys(audienceData[item]).length > 0) {
                if (!this.editDefaultDataOption['behavior']['combine_data']['scene']['NOLIMIT']) {
                  this.editDefaultDataOption['behavior']['combine_data']['scene'].sub.forEach(value => {
                    if (audienceData['behavior_or_interest']['behavior']['scene'].indexOf(value['value']) > -1) {
                      this.editDefaultDataOption['behavior']['combine_data']['scene']['disabled'] = true;
                    } else {
                      value['disabled'] = true;
                    }
                  });
                }

                this.editDefaultDataOption['behavior']['combine_data']['time_window'].sub.forEach(value => {
                  if (audienceData['behavior_or_interest']['behavior']['time_window'].indexOf(value['value']) === -1) {
                    value['disabled'] = true;
                  }
                });

                if (!this.editDefaultDataOption['behavior']['combine_data']['intensity']['NOLIMIT']) {
                  this.editDefaultDataOption['behavior']['combine_data']['intensity'].sub.forEach(value => {
                    if (audienceData['behavior_or_interest']['behavior']['intensity'].indexOf(value['value']) > -1) {
                      this.editDefaultDataOption['behavior']['combine_data']['intensity']['disabled'] = true;
                    } else {
                      value['disabled'] = true;
                    }
                  });
                }
              }
            }
          });
        } else if (item === 'behavior' || item === 'intention' || item === 'interest') {

        } else {
          this.editDefaultDataOption[item]['disabled'] = audienceData[item] !== 'NONE';
          if (audienceData[item] !== 'NONE') {
            this.editDefaultDataOption[item]['sub'].forEach(subItem => {
              subItem['disabled'] = subItem['value'] !== 'NONE' && subItem.value !== audienceData[item];
            });
          }
        }
      }
    }
  }

  changeAccount(ids) {
    if (ids.length > 0) {
      ids.forEach((item, index) => {
        const data = this.accountsList.find(value => value.chan_pub_id === item);
        if (data && !this.curAccountsList.find(s_item => s_item.id === item)) {
          this.curAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, crowdResultList: [], excludeCrowdResultList: [] });
          this.getByteDanceTargetAudience(this.curAccountsList[index]);
        }
      });

      this.curAccountsList.forEach((item, index) => {
        const data = ids.find(value => value === item.id);
        if (!data) {
          this.curAccountsList.splice(index, 1);
        }
      });
    } else {
      this.curAccountsList = [];
    }

  }

  getByteDanceTargetAudience(value) {
    const getByteDanceTargetAudience = this.launchRpaService.getByGdtTargetAudience({
      chan_pub_id: value.id,
      cid: this.cid,
    });
    getByteDanceTargetAudience.subscribe(result => {
      value.crowdList = deepCopy(result['data']);
      value.excludeCrowdList = deepCopy(result['data']);
      value.crowdResultList = deepCopy(value.crowdResultList);
      value.excludeCrowdResultList = deepCopy(value.excludeCrowdResultList);

      // -- 互斥
      value.excludeCrowdList.forEach(list => {
        list['disabled'] = value.crowdResultList.indexOf(list.key) > -1;
      });
      value.excludeCrowdList = [...value.excludeCrowdList];

      // -- 互斥
      value.crowdList.forEach(list => {
        list['disabled'] = value.excludeCrowdResultList.indexOf(list.key) > -1;
      });
      value.crowdList = [...value.crowdList];
    });
  }

  treeCrowdOnCheck(event: NzFormatEmitEvent, value): void {
    value.crowdResultList = [...event.keys];

    value.excludeCrowdList.forEach(item => {
      item['disabled'] = event.keys.indexOf(item.key) > -1;
    });

    value.excludeCrowdList = [...value.excludeCrowdList];

  }

  treeExcludeCrowdOnCheck(event: NzFormatEmitEvent, value): void {
    value.excludeCrowdResultList = [...event.keys];

    value.crowdList.forEach(item => {
      item['disabled'] = event.keys.indexOf(item.key) > -1;
    });
    value.crowdList = [...value.crowdList];
  }

  getAccountList() {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": this.menuService.currentPublisherId
        },
        {
          "key": "channel_id",
          "name": "",
          "op": "=",
          "value": "2"
        },
        {
          "key": "account_status",
          "name": "",
          "op": ">",
          "value": -1
        },
      ]
    };
    this.launchRpaService.getAccountList(body, {
      page: 1,
      count: 100000,
      cid: this.authService.getCurrentUserOperdInfo().select_cid,
      user_id: this.authService.getCurrentUserOperdInfo().select_uid,
    })
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            this.accountsList = results['data']['detail'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  generateTemperature(start, end): any {
    const result = [];
    let labelInit = -50;
    for (let i = start; i <= end; i++) {
      const currentLabel = labelInit + '℃';
      result.push({ value: i, label: currentLabel });
      labelInit++;
    }
    return result;
  }

  generateRangeData(rangeKey, start, end, rangeOption = [], suffix = '', endLess = false): any {
    if (rangeKey == 'temperature') {
      return this.generateTemperature(start, end);
    }
    const result = [];
    if (isArray(rangeOption) && rangeOption.length > 0) {
      rangeOption.map((item, key) => {
        let currentLabel = '';
        if (!!endLess && item == end) {
          currentLabel = '大于' + rangeOption[key - 1] + suffix;

        } else {
          currentLabel = item + suffix;
        }
        result.push({ value: item, label: currentLabel });
      });
      return result;
    }

    for (let i = start; i <= end; i++) {
      let currentLabel = i + suffix;
      if (!!endLess && i == end && rangeKey == 'age') {
        currentLabel = i + suffix + '及以上';
      } else if (!!endLess && i == end) {
        // @todo 需额外处理
        currentLabel = '大于' + i + suffix;
      }

      result.push({ value: i, label: currentLabel });
    }
    return result;
  }


  transferTreeChange(sourceData, data: any[]) {
    sourceData['resultList'] = [...data];
  }

  updateNotLimit(slot, key) {
    setTimeout(() => {
      if (key === 'scene' || key === 'intensity') {
        this.editDefaultDataOption.behavior.combine_data[key]["NOLIMIT"] = true;
      } else {
        this.editDefaultDataOption[key]["NOLIMIT"] = true;
      }
      if (slot.hasOwnProperty('sub') && isArray(slot['sub'])) {
        slot['sub'].forEach(item => {
          item["checked"] = false;
        });
      }
    });
  }

  updateSingleChecked(value, itemKey, curItem?): void {
    if (itemKey === 'scene' || itemKey === 'intensity') {
      this.editDefaultDataOption.behavior.combine_data[itemKey]["NOLIMIT"] = false;
      this.editDefaultDataOption.behavior.combine_data[itemKey]["NOLIMIT"] = this.editDefaultDataOption.behavior.combine_data[itemKey].sub.every(item => !item.checked);
    } else {
      this.editDefaultDataOption[itemKey]["NOLIMIT"] = false;
      this.editDefaultDataOption[itemKey]["NOLIMIT"] = this.editDefaultDataOption[itemKey].sub.every(item => !item.checked);
    }
  }

  updateLocationTypes(sub: any[]) {
    setTimeout(() => {
      const allNoChecked = sub.every(item => !item.checked);
      if (allNoChecked && sub.length > 0) {
        if (this.editDefaultDataOption.geo_location.resultValue === 'MAP') {
          sub[1].checked = true;
        } else {
          sub[0].checked = true;
        }
      }
    });
  }

  generateResultData() {
    let curAudienceData;

    if (this.targetType === 'package') {
      curAudienceData = this.curTargetSource;
    } else if (this.targetType === 'packageEdit') {
      curAudienceData = this.curAudienceData;
    }
    const resultData = {};
    resultData['behavior_or_interest'] = { 'behavior': { 'scene': [], 'time_window': [], 'intensity': [] }, 'intention': {}, 'interest': {} };
    for (const item of Object.keys(this.editDefaultDataOption)) {
      if (this.editDefaultDataOption[item].hasOwnProperty('NOLIMIT')) {
        resultData[item] = [];
        if (!this.editDefaultDataOption[item]['NOLIMIT']) {
          for (const subItem of this.editDefaultDataOption[item].sub) {
            if (subItem.checked) {
              resultData[item].push(subItem.value);
            }
          }
        } else if (this.editDefaultDataOption[item]['NOLIMIT'] && this.editDefaultDataOption[item]['disabled']) {
          resultData[item] = curAudienceData['audience_setting'][item];
        }
      } else if (this.editDefaultDataOption[item].hasOwnProperty('resultValue')) {
        if (item === 'geo_location') {
          resultData[item] = {};
          if (this.editDefaultDataOption[item]['resultValue'] === 'CUSTOM') {
            resultData[item] = { regions: [], location_types: [] };
            resultData[item]['regions'] = this.editDefaultDataOption[item]['resultList'];
            this.editDefaultDataOption[item]['location_types']['sub'].forEach(subItem => {
              if (subItem.checked) { resultData[item]['location_types'].push(subItem.value); }
            });
          }
          if (this.editDefaultDataOption[item]['resultValue'] === 'MAP') {
            resultData[item] = { custom_locations: [], location_types: [] };
            this.editDefaultDataOption[item]['location_types']['sub'].forEach(subItem => {
              if (subItem.checked) { resultData[item]['location_types'].push(subItem.value); }
            });
            resultData[item]['custom_locations'] = this.editDefaultDataOption.geo_location.custom_locations;
          }
        } else if (item === 'gender' || item === 'app_install_status') {
          resultData[item] = this.editDefaultDataOption[item].resultValue;
        } else if (item === 'age' || item === 'resident_community_price_array' || item === 'temperature') {
          resultData[item] = {};
          resultData[item]['value'] = this.editDefaultDataOption[item].resultValue;
          if (this.editDefaultDataOption[item].resultValue === 'age_custom' || this.editDefaultDataOption[item].resultValue === 'resident_community_price_custom' || this.editDefaultDataOption[item].resultValue === 'CUSTOM') {
            resultData[item]['min'] = this.editDefaultDataOption[item].rangeStartResult;
            resultData[item]['max'] = this.editDefaultDataOption[item].rangeEndResult;
          } else {
            resultData[item]['min'] = '';
            resultData[item]['max'] = '';
          }
        } else if (item === 'behavior_or_interest') {
          resultData['auto_audience'] = false;
          if (this.editDefaultDataOption['behavior_or_interest']['resultValue'] === 'custom') {
            resultData['behavior_or_interest'] = { 'behavior': { 'scene': [], 'time_window': "", 'intensity': [] }, 'intention': {}, 'interest': {} };

            this.editDefaultDataOption['behavior']['combine_data']['scene']['sub'].forEach(value => {
              if (value.checked) { resultData['behavior_or_interest']['behavior']['scene'].push(value.value); }
            });

            resultData['behavior_or_interest']['behavior']['time_window'] = this.editDefaultDataOption['behavior']['combine_data']['time_window']['resultValue'];

            this.editDefaultDataOption['behavior']['combine_data']['intensity']['sub'].forEach(value => {
              if (value.checked) { resultData['behavior_or_interest']['behavior']['intensity'].push(value.value); }
            });

            if (resultData['behavior_or_interest']['behavior']['scene'].length <= 0) {
              resultData['behavior_or_interest']['behavior']['scene'] = ['BEHAVIOR_INTEREST_SCENE_ALL'];
            }
            if (resultData['behavior_or_interest']['behavior']['intensity'].length <= 0) {
              resultData['behavior_or_interest']['behavior']['intensity'] = ['BEHAVIOR_INTEREST_INTENSITY_ALL'];
            }

          } else if (this.editDefaultDataOption['behavior_or_interest']['resultValue'] === 'auto_audience') {
            resultData['auto_audience'] = true;
          } else {
            resultData['behavior_or_interest'] = {};
          }
        } else if (item === 'behavior' || item === 'intention' || item === 'interest') {
          if (this.editDefaultDataOption['behavior_or_interest']['resultValue'] === 'custom') {
            resultData['behavior_or_interest'][item]['category_id_list'] = this.editDefaultDataOption[item]['resultList'];
          }
        } else if (item === 'device_brand_model') {
          resultData[item] = { excluded_list: [], included_list: [] };
          if (this.editDefaultDataOption[item]['resultList'].length > 0) {
            if (this.editDefaultDataOption[item]['is_exclude']) {
              resultData[item]['excluded_list'] = this.editDefaultDataOption[item]['resultList'];
            } else {
              resultData[item]['included_list'] = this.editDefaultDataOption[item]['resultList'];
            }
          }
        } else if (item === 'crowd') {
          resultData['crowd'] = {};
          if (this.curAccountsList.length > 0) {
            this.curAccountsList.forEach(curItem => {
              resultData['crowd'][curItem.id] = {
                exclude: curItem.excludeCrowdResultList ? curItem.excludeCrowdResultList : [],
                include: curItem.crowdResultList ? curItem.crowdResultList : [],
              };
            });
          }
        } else {
          resultData[item] = [];
          if (this.editDefaultDataOption[item].resultValue !== 'NONE') {
            resultData[item] = this.editDefaultDataOption[item]['resultList'];
          }
        }
      }
    }
    return resultData;
  }


  deleteGeoCustomLocation(index) {
    this.editDefaultDataOption.geo_location.custom_locations.splice(index, 1);
  }

  changeGeoLocation() {
    this.cityText = '';
    this.editDefaultDataOption['geo_location']['location_types']['sub'].forEach(item => {
      item['disabled'] = false;
      if (this.editDefaultDataOption['geo_location'].resultValue === 'MAP') {
        if (item.value !== 'LIVE_IN') {
          item.checked = false;
          item['disabled'] = true;
        } else {
          item.checked = true;
        }
      }
    });
  }

}
