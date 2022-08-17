import { AfterViewChecked, OnChanges, Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { GlobalTemplateComponent } from "../../../../../../../shared/template/global-template/global-template.component";
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from "../../../../../../../core/service/auth.service";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { LaunchService } from "../../../../../service/launch.service";
import { DataViewService } from "../../../../../../data-view-feed/service/data-view.service";
import { isArray } from "@jzl/jzl-util";
import { deepCopy } from "@jzl/jzl-util";
import { MenuService } from "../../../../../../../core/service/menu.service";

@Component({
  selector: 'app-target-basic-template-kuaishou',
  templateUrl: './target-basic-template-kuaishou.component.html',
  styleUrls: ['./target-basic-template-kuaishou.component.scss']
})
export class TargetBasicTemplateKuaishouComponent implements OnInit, OnChanges, AfterViewChecked {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;
  @Input() targetConfig;
  @Input() curAudienceData;
  @Input() data;
  @Input() targetType;
  @Input() isLaunchPackage;
  @Input() objectiveType;

  public isInitSingleDataFinshed = false;

  public cityText = '';
  public noHaveText = '';
  public cityLoading = true;
  public countryLoading = true;
  public searchCrowdValue = '';
  public searchExcludeValue = '';
  public searchPaidValue = '';

  public byteDanceConfigList;
  public behaviorData = null;

  public activeType = {
    type: 'target'
  };
  public accountsList = [];
  public curAccountsList = [];
  public curAppAccountsList = [];
  public accounts = [];
  public appAccounts = [];
  public isShowApp = false;

  public min_age = 18;
  public max_age = 55;

  public publisherId = 16;

  public defaultData: { audience_template_name: any, landing_type?: any, audience_template_id?: any, audience_desc: any, audience_setting: any, delivery_range?: any, marketing_target?: any, flow_type?: any, opt_target?: any, target_setting?: any } = {
    audience_template_name: null,  // 定向包名称
    audience_desc: null, // 定向包描述
    landing_type: '2',  // 定向包类型
    audience_setting: {},
    target_setting: {},
  };

  public campaignTypeSetting = {
    launch_target: 'landing_page',
    operating_system: 'ios',
  };

  public objective_type = [
    {
      label: "落地页",
      value: "1",
    },
    {
      label: "iOS app",
      value: "2",
    },
    {
      label: "安卓 app",
      value: "4",
    }
  ];

  public opt_target = [
    {
      label: "转化",
      value: 3,
    },
    {
      label: "点击",
      value: 2,
    },
    {
      label: "展现",
      value: 1,
    }
  ];

  public publisherList = [
    { key: 7, name: '头条' },
    { key: 1, name: '百度' },
  ];

  public landingTypeList = [
    { key: 'PROMOTED_OBJECT_TYPE_LINK', name: '网页推广' },
    { key: 'PROMOTED_OBJECT_TYPE_APP_ANDROID', name: '应用推广-Android' },
    { key: 'PROMOTED_OBJECT_TYPE_APP_IOS', name: '应用推广-IOS' },
    { key: 'PROMOTED_OBJECT_TYPE_ECOMMERCE', name: '商品推广' },
    { key: 'PROMOTED_OBJECT_TYPE_LEAD_AD', name: '销售线索收集' },
    { key: 'PROMOTED_OBJECT_TYPE_LINK_WECHAT', name: '品牌活动推广' },
  ];

  public curGroupFlag;

  public getting = false;
  public saveing = false;

  public cid;
  public chan_pub_id = 0;

  public isCopy = false;

  public errorTipAry = {
    platform: {
      is_show: false,
      tip_text: '请选择操作系统'
    },  // 操作系统
    age: {
      is_show: false,
      tip_text: '请选择年龄范围'
    },  // 年龄
    ac: {
      is_show: false,
      tip_text: '请选择网络类型'
    },  // 网络类型
  };

  public tableHeight = document.body.clientHeight - 60 - 65;

  public reInitTarget = true;
  public marks = {
    18: '18',
    20: '20',
    24: '24',
    30: '30',
    36: '36',
    45: '45',
    55: '55',
  };

  public editDefaultDataOption = {
    age: {
      value: 'no_limit',
      age_renge: [],
      customize_age: []
    },//  年龄
    network: 0,//  网络环境
    device_price: {
      resultData: [],
      checked: true,
      disabled: false,
    },//设备价格
    device_brand: [],//手机品牌
    device_price_slt: 'nolimit',//设备价格
    gender: 0,     // 性别
    allRegion: 'no_limit',      //  投放地域
    region: [],     //  地域id
    app_category: [],     // app分类
    audience_targeting: 'no_limit',     //  自定义人群
    include_audience: [],     //  包含人群
    exclude_audience: [],     //  排除人群
    android_osv: 3,//安卓版本
    ios_osv: 6,//iOS版本
    app_category_slt: 'nolimit',
    app_search_name: '',
    interest_slt: 'nolimit',
    device_slt: 'nolimit',//手机品牌
    platform_os: 0,//  操作系统
    filter_converted_level: 0,//过滤已转化人群纬度
    time_type: 0,//在多少天内发生行为的用户
    strength_type: 0,//行为强度
    scene_type: 1,//行为场景
    intelli_extend: {
      is_open: 0,
      no_age_break: 0,//不可突破年龄
      no_gender_break: 0,//不可突破性别
      no_area_break: 0,//不可突破地域
    },//智能放量
    target_type: 'custom',
    user_type: '0',
    behavior_interest: {
      value: 'no_limit',
      behavior: {
        scene_type: [],
        time_type: null,
        strength_type: '0',
        label: [],
        keyword: []
      },
      interest: {
        label: [],
      }
    },
    behavior_label: {
      list: [],
      resultData: []
    },
    interest_label: {
      list: [],
      resultData: []
    },
    app_interest_ids: {
      list: [],
      resultData: []
    },
    app_ids: {
      list: [],
      resultData: []
    },
    app_category_action: {
      sub: [
        {
          label: "不限",
          value: "nolimit",
          checked: false
        },
        {
          label: "按APP分类",
          value: "app_group",
          checked: false
        },
        {
          label: "按APP名称",
          value: "app_name",
          checked: false
        },
      ],
    },  // 是否指定app分类
    interest_slt_action: {
      sub: [
        {
          label: "不限",
          value: "nolimit",
          checked: false
        },
        {
          label: "自定义",
          value: "custom",
          checked: false
        },
      ],
    },  // 是否指定兴趣分类
    targeting_audience: {
      name: "自定义人群",
      sub: [
        {
          label: "不限",
          value: 'nolimit',
          checked: false
        },
        {
          label: "自定义人群",
          value: "custom_audience",
          checked: false
        },
      ],
    },
    device_slt_action: {
      sub: [
        {
          label: "不限",
          value: "nolimit",
          checked: false
        },
        {
          label: "按品牌",
          value: "custom",
          checked: false
        },
      ],
    },  // 是否指定手机品牌
    all_region: [],
    city_level: {
      list: [],
      resultData: []
    },//城市
    designated_area: {
      list: [],
      resultData: []
    },//地域
    paid_audience: {
      list: [],
      resultData: []
    },
    // app分类
    appCategoryList: {
      list: [],
      resultData: []
    },
    // 兴趣分类
    interestList: {
      list: [],
      resultData: []
    },
    // 定向人群
    includeList: {
      list: [],
      resultData: []
    },
    // 排除人群
    excludeList: {
      list: [],
      resultData: []
    },
    // 手机品牌
    auto_extend: {
      list: [],
      resultData: []
    },
  };

  constructor(private message: NzMessageService,
    private authService: AuthService,
    public launchRpaService: LaunchRpaService,
    public menuService: MenuService,
    private launchService: LaunchService,
    private dataViewService: DataViewService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.getAccountList();
    this.getBehaviorLabel();
    this.getInterestLabel();
    this.getKsAppInterestByType();
  }

  initConfigData() {
    if (this.targetConfig) {
      this.isInitSingleDataFinshed = false;
      this.targetConfig['age']['sub'].forEach(item => {
        item.checked = false;
      });
      this.targetConfig['platform_os']['sub'].forEach(item => {
        item.checked = false;
      });
      this.targetConfig['ages_range']['sub'].forEach(item => {
        item.checked = false;
      });
      this.editDefaultDataOption.all_region = this.targetConfig.all_region;
      this.editDefaultDataOption.city_level.list = this.targetConfig.city_level;
      this.editDefaultDataOption.designated_area.list = this.targetConfig.designated_area;
      this.editDefaultDataOption.paid_audience.list = this.targetConfig.paid_audience;

      this.objectiveTypeChange();
      this.initSingleData(this.data.audience_setting);
      const setting = this.getResultData();
      this.data.audience_setting = { ...setting };
      this.isInitSingleDataFinshed = true;
    }
  }

  getResultData() {
    let curAudienceData;
    if (this.targetType === 'package') {
      curAudienceData = this.data;
    } else if (this.targetType === 'packageEdit') {
      curAudienceData = this.curAudienceData;
    }

    const resultData = {};
    resultData['crowd'] = {};
    resultData['target_type'] = this.editDefaultDataOption.target_type;
    resultData['network'] = this.editDefaultDataOption.network;
    resultData['platform_os'] = this.editDefaultDataOption.platform_os;
    resultData['gender'] = this.editDefaultDataOption.gender;
    resultData['filter_converted_level'] = this.editDefaultDataOption.filter_converted_level;
    // resultData['intelli_extend'] =this.editDefaultDataOption.intelli_extend;
    resultData['device_slt'] = this.editDefaultDataOption.device_slt;
    resultData['device_price'] = this.editDefaultDataOption.device_price.resultData;
    resultData['device_brand'] = this.editDefaultDataOption.device_brand;
    resultData['android_osv'] = this.editDefaultDataOption.android_osv;
    resultData['ios_osv'] = this.editDefaultDataOption.ios_osv;
    // resultData['app_interest_ids']=this.editDefaultDataOption.app_interest_ids.resultData;
    resultData['user_type'] = this.editDefaultDataOption.user_type;
    resultData['allRegion'] = this.editDefaultDataOption.allRegion;
    resultData['region'] = this.editDefaultDataOption.region;
    resultData['audience_targeting'] = this.editDefaultDataOption.audience_targeting;

    resultData['population'] = this.editDefaultDataOption.includeList.resultData;
    resultData['exclude_population'] = this.editDefaultDataOption.excludeList.resultData;
    resultData['app_search_name'] = this.editDefaultDataOption.app_search_name;

    if (this.editDefaultDataOption.age.value === 'ages_range') {
      resultData['age_renge'] = this.editDefaultDataOption.age.age_renge;
    } else if (this.editDefaultDataOption.age.value === 'customize_age') {
      resultData['age'] = {
        min: this.editDefaultDataOption.age.customize_age[0],
        max: this.editDefaultDataOption.age.customize_age[1]
      };
    }
    if (this.editDefaultDataOption.behavior_interest.value === 'custom') {
      this.editDefaultDataOption.behavior_interest.behavior.label = this.editDefaultDataOption.behavior_label.resultData;
      this.editDefaultDataOption.behavior_interest.interest.label = this.editDefaultDataOption.interest_label.resultData;
      resultData['behavior_interest'] = {
        behavior: this.editDefaultDataOption.behavior_interest.behavior,
        interest: this.editDefaultDataOption.behavior_interest.interest
      };
    }
    if (this.editDefaultDataOption.intelli_extend.is_open === 1) {
      resultData['intelli_extend'] = this.editDefaultDataOption.intelli_extend;
    }
    if (this.editDefaultDataOption.app_category_slt === 'app_group') {
      resultData['app_interest_ids'] = this.editDefaultDataOption.app_interest_ids.resultData;
    }
    // else if (this.editDefaultDataOption.app_category_slt==='app_name') {
    //   resultData['app_ids']=this.editDefaultDataOption.app_ids.resultData;
    // }

    if (this.curAppAccountsList.length > 0) {
      resultData['appIds'] = {};
      this.curAppAccountsList.forEach(item => {
        resultData['appIds'][item.id] = {
          app_ids: item.app_ids ? item.app_ids : [],
        };
      });
    }

    if (this.curAccountsList.length > 0) {
      this.curAccountsList.forEach(item => {
        if (this.editDefaultDataOption.audience_targeting === 'paid_crowd') {
          resultData['crowd'][item.id] = {
            paid_audience: item.paidCrowdResultList ? item.paidCrowdResultList : [],
          };
        } else if (this.editDefaultDataOption.audience_targeting === 'targeted_crowd') {
          resultData['crowd'][item.id] = {
            exclude_population: item.excludeCrowdResultList ? item.excludeCrowdResultList : [],
            population: item.crowdResultList ? item.crowdResultList : [],
          };
        }
      });
    }

    return resultData;
  }

  ngAfterViewChecked() {
    if (this.isInitSingleDataFinshed) {
      const setting = this.getResultData();
      this.data.audience_setting = { ...setting };
    }
  }

  objectiveTypeChange() {
    this.targetConfig['platform_os']['sub'].forEach(item => {
      item.disabled = false;
      if (this.objectiveType === '2') {
        item.checked = false;
        item.disabled = true;
        if (item.value === 2) {
          this.editDefaultDataOption.platform_os = item.value;
        }
      } else if (this.objectiveType === '4') {
        item.checked = false;
        item.disabled = true;
        if (item.value === 1) {
          this.editDefaultDataOption.platform_os = item.value;
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['objectiveType'] && !changes['objectiveType'].firstChange) {
      this.objectiveTypeChange();
    }
  }

  initSingleData(basicData) {
    if (Object.keys(basicData).length) {
      // 人群
      if (Object.keys(basicData['crowd']).length) {
        if (basicData['audience_targeting'] === 'targeted_crowd') {
          for (const item of Object.keys(basicData['crowd'])) {
            const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
            if (index !== -1 && !this.curAccountsList.find(s_item => s_item.id === item)) {
              this.accounts.push(Number(item));
              const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, crowdResultList: basicData['crowd'][item]['population'], excludeCrowdResultList: basicData['crowd'][item]['exclude_population'] };
              this.curAccountsList.push(obj);
              this.getTargetAudience(obj);
            }
          }
        } else if (basicData['audience_targeting'] === 'paid_crowd') {
          for (const item of Object.keys(basicData['crowd'])) {
            const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
            if (index !== -1 && !this.curAccountsList.find(s_item => s_item.id === item)) {
              this.accounts.push(Number(item));
              const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, paidCrowdResultList: basicData['crowd'][item]['paid_audience'] };
              this.curAccountsList.push(obj);
              this.getPaidTargetAudience(obj);
            }
          }
        }

      }


      if (basicData.allRegion !== 'no_limit') {
        basicData.allRegion === 'city_level' ? this.editDefaultDataOption.city_level.resultData = basicData.region : this.editDefaultDataOption.designated_area.resultData = basicData.region;
      }
      this.editDefaultDataOption.allRegion = basicData.allRegion;
      this.editDefaultDataOption.gender = basicData.gender;
      this.editDefaultDataOption.region = basicData.region;
      this.editDefaultDataOption.network = basicData.network;
      this.editDefaultDataOption.platform_os = basicData.platform_os;
      this.editDefaultDataOption.filter_converted_level = basicData.filter_converted_level;
      this.editDefaultDataOption.user_type = basicData.user_type;
      this.editDefaultDataOption.target_type = basicData.target_type;
      if (basicData.app_search_name) {
        this.editDefaultDataOption.app_search_name = basicData.app_search_name;
      }

      this.editDefaultDataOption.android_osv = basicData.android_osv;
      this.editDefaultDataOption.ios_osv = basicData.ios_osv;
      this.editDefaultDataOption.device_slt = basicData.device_slt;
      this.editDefaultDataOption.device_brand = basicData.device_brand;
      this.editDefaultDataOption.device_price.resultData = basicData.device_price;

      this.editDefaultDataOption.app_category_slt = basicData.app_category_slt;
      this.editDefaultDataOption.audience_targeting = basicData.audience_targeting;

      this.editDefaultDataOption.appCategoryList.resultData = basicData.app_category;
      this.editDefaultDataOption.includeList.resultData = basicData.population;
      this.editDefaultDataOption.excludeList.resultData = basicData.exclude_population;

      if (basicData.age) {
        this.editDefaultDataOption.age.value = 'customize_age';
        this.editDefaultDataOption.age.customize_age[0] = basicData.age['min'];
        this.editDefaultDataOption.age.customize_age[1] = basicData.age['max'];
      } else if (basicData.age_renge) {
        this.editDefaultDataOption.age.value = 'ages_range';
        this.editDefaultDataOption.age.age_renge = basicData.age_renge;

        this.targetConfig['ages_range']['sub'].forEach((subItem) => {
          if (basicData.age_renge.indexOf(subItem['value']) > -1) {
            subItem['checked'] = true;
          } else {
            subItem['checked'] = false;
          }
        });
      } else {
        this.editDefaultDataOption.age.value = 'no_limit';
      }
      if (basicData.behavior_interest) {
        this.editDefaultDataOption.behavior_interest.value = 'custom';
        this.editDefaultDataOption.behavior_interest.behavior = basicData.behavior_interest.behavior;
        this.editDefaultDataOption.behavior_interest.interest = basicData.behavior_interest.interest;
        this.editDefaultDataOption.behavior_label.resultData = basicData.behavior_interest.behavior.label;
        this.editDefaultDataOption.interest_label.resultData = basicData.behavior_interest.interest.label;
      }

      if (basicData.intelli_extend) {
        this.editDefaultDataOption.intelli_extend = basicData.intelli_extend;
      }
      if (basicData.device_brand) {
        this.targetConfig['device_brand']['sub'][1]['sub'].forEach(subItem => {
          if (basicData.device_brand.indexOf(subItem['value']) > -1) {
            subItem['checked'] = true;
          }
        });
      }
      if (basicData.app_interest_ids) {
        this.editDefaultDataOption.app_category_slt = 'app_group';
        this.editDefaultDataOption.app_interest_ids.resultData = basicData.app_interest_ids;
      } else if (basicData.appIds) {
        this.editDefaultDataOption.app_category_slt = 'app_name';
        for (const item of Object.keys(basicData['appIds'])) {
          const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
          if (index !== -1 && !this.curAppAccountsList.find(s_item => s_item.id === item)) {
            this.appAccounts.push(Number(item));
            const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, app_ids: basicData['appIds'][item]['app_ids'] };
            this.curAppAccountsList.push(obj);
            this.getKsAppInterestByName(obj, this.editDefaultDataOption.app_search_name);
          }
        }
      } else {
        this.editDefaultDataOption.app_category_slt = 'nolimit';
      }

      this.targetConfig['device_price']['sub'][1]['sub'].forEach(subItem => {
        if (basicData.device_price.indexOf(subItem['value']) > -1) {
          subItem['checked'] = true;
          this.editDefaultDataOption['device_price']["checked"] = false;
        }
      });


      if (basicData.auto_extend_targets) {
        this.targetConfig['auto_extend_targets']['sub'].forEach(item => {
          if (basicData.auto_extend_targets.indexOf(item.value) !== -1) {
            item.checked = true;
          }
        });
      }

      if (this.isLaunchPackage) {
        if (Object.keys(this.data.target_setting).length) {
          this.getDisabled(this.data.target_setting);
        } else {
          this.getDisabled(basicData);
        }
      }
    }
  }

  transferTreeChange(sourceData, data: any[], type) {
    sourceData.resultData = [...data];
    if (type === 'region') {
      this.editDefaultDataOption.region = [...data];
      if (this.editDefaultDataOption.allRegion === 'city_level') {
        this.editDefaultDataOption.city_level = { ...sourceData };
      } else {
        this.editDefaultDataOption.designated_area = { ...sourceData };
      }
    } else if (type === 'interest') {
      this.editDefaultDataOption.behavior_interest.interest.label = [...data];
      this.editDefaultDataOption.interest_label = { ...sourceData };
    } else if (type === 'behavior') {
      this.editDefaultDataOption.behavior_interest.behavior.label = [...data];
      this.editDefaultDataOption.behavior_label = { ...sourceData };
    } else if (type === 'app_category') {
      this.editDefaultDataOption.appCategoryList = { ...sourceData };
    } else if (type === 'device') {
      this.editDefaultDataOption.device_brand = { ...sourceData };
    } else if (type === 'auto_extend') {
      this.editDefaultDataOption.auto_extend = { ...sourceData };
    } else if (type === 'paid_crowd') {
      this.editDefaultDataOption.paid_audience = { ...sourceData };
    }

  }

  updateSingleChecked(data, type) {
    this.editDefaultDataOption[type]["checked"] = false;
    if (type === 'age') {
      this.editDefaultDataOption.age.age_renge = [];
      data.forEach(item => {
        if (item.checked) {
          this.editDefaultDataOption.age.age_renge.push(item.value);
        }
      });
    } else if (type === 'platform') {
      this.editDefaultDataOption.device_slt = 'nolimit';
      this.editDefaultDataOption.device_brand = [];
      if (this.objectiveType === '') {
        if (data.every(item => !item.checked)) {

        } else {
          data.forEach(item => {
            if (item.checked) {

            }
          });
        }
      }
    } else if (type === 'device_price') {
      this.editDefaultDataOption.device_price.resultData = [];
      if (data.every(item => !item.checked)) {
        this.editDefaultDataOption.device_price.checked = true;
        this.editDefaultDataOption.device_price.resultData = [];
      } else {
        data.forEach(item => {
          if (item.checked) {
            this.editDefaultDataOption.device_price.resultData.push(item.value);
          }
        });
      }
    } else if (type === 'device_brand') {
      this.editDefaultDataOption.device_brand = [];
      data.forEach(item => {
        if (item.checked) {
          this.editDefaultDataOption.device_brand.push(item.value);
        }
      });
    }
  }

  changeNoLimit(slot, type) {
    setTimeout(() => {
      this.editDefaultDataOption[type]["checked"] = true;
      if (slot.hasOwnProperty('sub') && isArray(slot['sub'])) {
        slot['sub'].forEach(item => {
          item["checked"] = false;
        });
        if (type === 'platform') {
          this.editDefaultDataOption.device_slt = 'nolimit';
          this.editDefaultDataOption.device_brand = [];
        }
        if (type === 'device_price') {
          this.editDefaultDataOption.device_price.resultData = [];
        }
      }
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
  treePaidCrowdOnCheck(event: NzFormatEmitEvent, value): void {
    value.paidCrowdResultList = [...event.keys];
  }

  getDisabled(audienceData) {
    if (audienceData['behavior_interest']) {
      this.behaviorData = audienceData['behavior_interest']['behavior'];
    }
    //人群
    this.targetConfig['crowd']['sub'].forEach(item => {
      item['disabled'] = audienceData['audience_targeting'] !== 'no_limit' && item.value !== audienceData['audience_targeting'];
    });
    //智能定向
    this.targetConfig['target_type']['sub'].forEach(item => {
      item['disabled'] = item.value !== audienceData['target_type'];
    });
    // 地域
    this.targetConfig['region']['sub'].forEach(item => {
      item['disabled'] = audienceData['allRegion'] !== 'no_limit' && item.value !== audienceData['allRegion'];
    });

    // age
    this.targetConfig['age']['sub'].forEach(item => {
      item['disabled'] = this.editDefaultDataOption.age.value !== 'no_limit' && item.value !== this.editDefaultDataOption.age.value;
      // item['disabled'] = audienceData['age'] !== 'no_limit' && item.value !== audienceData['age'];
    });
    // 性别
    this.targetConfig['gender']['sub'].forEach(item => {
      item['disabled'] = audienceData['gender'] !== 0 && item.value !== audienceData['gender'];
    });
    // 平台
    this.targetConfig['platform_os']['sub'].forEach(item => {
      item['disabled'] = audienceData['platform_os'] !== 0 && item.value !== audienceData['platform_os'];
    });
    // network
    this.targetConfig['network']['sub'].forEach(item => {
      item['disabled'] = audienceData['network'] !== 0 && item.value !== audienceData['network'];
    });
    //用户类型
    if (this.editDefaultDataOption.allRegion !== 'no_limit') {
      this.targetConfig['user_type']['sub'].forEach(item => {
        item['disabled'] = audienceData['user_type'] !== '2' && item.value !== audienceData['user_type'];
      });
    }
    //设备类型
    if (audienceData.device_brand.length > 0) {
      this.targetConfig['device_brand']['sub'][1]['sub'].forEach(subItem => {
        if (audienceData['device_brand'].indexOf(subItem['value']) > -1) {
          subItem['disabled'] = false;
        } else {
          subItem['disabled'] = true;
        }
      });
    }

    //过滤已转化用户
    this.targetConfig['filter_converted_level']['sub'].forEach(item => {
      item['disabled'] = audienceData['filter_converted_level'] !== 0 && item.value !== audienceData['filter_converted_level'];
    });
    //在多少天内发生行为的用户
    this.targetConfig['time_type']['sub'].forEach(item => {
      item['disabled'] = item.value !== audienceData['time_type'];
    });
    //行为强度
    this.targetConfig['strength_type']['sub'].forEach(item => {
      item['disabled'] = audienceData['strength_type'] !== 0 && item.value !== audienceData['strength_type'];
    });
    //行为场景
    this.targetConfig['scene_type']['sub'].forEach(item => {
      item['disabled'] = item.value !== audienceData['scene_type'];
    });
    //不可突破年龄
    // this.targetConfig['no_age_break']['sub'].forEach(item => {
    //   item['disabled'] = audienceData['intelli_extend']['no_age_break'] !== 0 && item.value !== audienceData['intelli_extend']['no_age_break'];
    // });
    //不可突破性别
    // this.targetConfig['no_gender_break']['sub'].forEach(item => {
    //   item['disabled'] = audienceData['intelli_extend']['no_gender_break'] !== 0 && item.value !== audienceData['intelli_extend']['no_gender_break'];
    // });
    //不可突破地域
    // this.targetConfig['no_area_break']['sub'].forEach(item => {
    //   item['disabled'] = audienceData['intelli_extend']['no_area_break'] !== 0 && item.value !== audienceData['intelli_extend']['no_area_break'];
    // });

    // 年龄
    if (audienceData['age_renge']) {
      this.targetConfig['ages_range'].sub.forEach(subItem => {
        if (audienceData['age_renge'].indexOf(subItem['value']) > -1) {
          subItem['disabled'] = false;
        } else {
          subItem['disabled'] = true;
        }
      });
    }
    if (audienceData['age']) {
      this.min_age = audienceData['age']['min'];
      this.max_age = audienceData['age']['max'];
    }

    //App
    // this.editDefaultDataOption['app_category_action']['sub'].forEach(item => {
    //   item['disabled'] = (audienceData['app_interest_ids'].length > 0 ||audienceData['app_ids'].length>0) && item.value === 'nolimit';
    // });

    //行为兴趣
    // this.targetConfig['behavior_interest']['sub'].forEach(item => {
    //   item['disabled'] = audienceData['behavior_interest'] .length > 0 && item.value === 'no_limit';
    // });
    //手机品牌
    this.editDefaultDataOption['device_slt_action']['sub'].forEach(item => {
      item['disabled'] = audienceData['device_brand'].length > 0 && item.value === 'nolimit';
    });
    //设备价格
    if (audienceData['device_price']) {
      if (audienceData['device_price'].length > 0) {
        this.editDefaultDataOption.device_price.disabled = true;
        this.targetConfig['device_price'].sub[1]['sub'].forEach(subItem => {
          if (audienceData['device_price'].indexOf(subItem['value']) > -1) {
            this.targetConfig.device_price['checked'] = true;
          } else {
            subItem['disabled'] = true;
          }
        });
      } else {
        this.editDefaultDataOption.device_price.checked = true;
      }
    }

    //行为意向
    this.targetConfig['behavior_interest']['sub'].forEach(item => {
      item['disabled'] = this.editDefaultDataOption.behavior_interest.value !== 'no_limit' && item.value !== this.editDefaultDataOption.behavior_interest.value;
    });
    //APP定向
    this.editDefaultDataOption['app_category_action'].sub.forEach(item => {
      item['disabled'] = this.editDefaultDataOption['app_category_slt'] !== 'nolimit' && item.value !== this.editDefaultDataOption.app_category_slt;
    });
    // 智能放量
    if (audienceData['intelli_extend']) {
      this.targetConfig['intelli_extend']['sub'].forEach(item => {
        item['disabled'] = item.value !== audienceData['intelli_extend']['is_open'];
      });
    }


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
            this.initConfigData();
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  changeAccount(ids) {
    if (ids.length > 0) {
      ids.forEach((item, index) => {
        const data = this.accountsList.find(value => value.chan_pub_id === item);
        if (data && !this.curAccountsList.find(s_item => s_item.id === item)) {
          if (this.editDefaultDataOption.audience_targeting === 'targeted_crowd') {
            this.curAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, crowdResultList: [], excludeCrowdResultList: [] });
            this.getTargetAudience(this.curAccountsList[index]);
          } else if (this.editDefaultDataOption.audience_targeting === 'paid_crowd') {
            this.curAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, paidCrowdResultList: [] });
            this.getPaidTargetAudience(this.curAccountsList[index]);
          }

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

  getTargetAudience(value) {
    const getUcTargetAudience = this.launchRpaService.getKsTargetAudience({
      chan_pub_id: value.id,
      is_paid: false
    });
    getUcTargetAudience.subscribe(result => {
      const crowd = [];
      result['data'].forEach(item => {
        crowd.push({
          title: item.population_name,
          key: item.population_id,
          isLeaf: true
        });
      });

      value.crowdList = deepCopy(crowd);
      value.excludeCrowdList = deepCopy(crowd);
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
  getPaidTargetAudience(value) {
    const getUcTargetAudience = this.launchRpaService.getKsTargetAudience({
      chan_pub_id: value.id,
      is_paid: true
    });
    getUcTargetAudience.subscribe(result => {
      const crowd = [];
      result['data'].forEach(item => {
        crowd.push({
          title: item.population_name,
          key: item.population_id,
          isLeaf: true
        });
      });

      value.paidCrowdList = deepCopy(crowd);
      value.paidCrowdResultList = deepCopy(value.paidCrowdResultList);
    });
  }
  getBehaviorLabel() {
    this.launchRpaService.getKsBehaviorLabel().subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.editDefaultDataOption.behavior_label.list = result['data'];
      }
    });
  }
  getInterestLabel() {
    this.launchRpaService.getKsInterestLabel().subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.editDefaultDataOption.interest_label.list = result['data'];
      }
    });
  }
  getKsAppInterestByType() {
    this.launchRpaService.getKsAppInterestByType().subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        const crowd = [];
        result['data'].forEach(item => {
          crowd.push({
            title: item.name,
            key: item.tag_id,
            isLeaf: true
          });
        });
        this.editDefaultDataOption.app_interest_ids.list = crowd;
      }
    });
  }
  getKsAppInterestByName(value, name?) {
    const body = {
      "chan_pub_id": value.id,
      "app_name": ""
    };
    if (name) {
      body.app_name = name;
    }
    this.launchRpaService.getKsAppInterestByName(body).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        const crowd = [];
        result['data'].forEach(item => {
          crowd.push({
            title: item.app_name,
            key: item.app_id,
            isLeaf: true
          });
        });
        value.appList = deepCopy(crowd);
        value.app_ids = deepCopy(value.app_ids);
      }
    });
  }

  changeAppAccount(ids) {
    if (ids.length > 0) {
      ids.forEach((item, index) => {
        const data = this.accountsList.find(value => value.chan_pub_id === item);
        if (data && !this.curAppAccountsList.find(s_item => s_item.id === item)) {
          this.curAppAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, app_ids: [] });
          this.getKsAppInterestByName(this.curAppAccountsList[index]);
        }
      });
      this.curAppAccountsList.forEach((item, index) => {
        const data = ids.find(value => value === item.id);
        if (!data) {
          this.curAppAccountsList.splice(index, 1);
        }
      });
    } else {
      this.curAppAccountsList = [];
    }
  }

  noBreak(type) {
    if (type === 'age') {
      this.editDefaultDataOption.intelli_extend.no_age_break = 0;
      this.editDefaultDataOption.age.age_renge = [];
      this.editDefaultDataOption.age.customize_age = [];
    } else if (type === 'area') {
      this.editDefaultDataOption.intelli_extend.no_area_break = 0;
      this.editDefaultDataOption.city_level.resultData = [];
      this.editDefaultDataOption.designated_area.resultData = [];
      this.editDefaultDataOption.user_type = '0';
      this.cityText = '';
      this.noHaveText = '';
    } else if (type === 'gender') {
      this.editDefaultDataOption.intelli_extend.no_gender_break = 0;
    }
  }
  changeTarget(type) {
    if (type === 'audience') {
      this.curAccountsList = [];
      this.accounts = [];
    } else if (type === 'app') {
      this.editDefaultDataOption.app_interest_ids.resultData = [];
      this.curAppAccountsList = [];
      this.appAccounts = [];
    } else if (type === 'behavior') {
      this.editDefaultDataOption.behavior_interest.behavior = {
        scene_type: [],
        time_type: null,
        strength_type: '0',
        label: [],
        keyword: []
      };
      this.editDefaultDataOption.behavior_interest.interest.label = [];
    } else if (type === 'intelli_extend') {
      this.editDefaultDataOption.intelli_extend.no_gender_break = 0;
      this.editDefaultDataOption.intelli_extend.no_age_break = 0;
      this.editDefaultDataOption.intelli_extend.no_area_break = 0;
    } else if (type === 'target_type') {
      this.editDefaultDataOption.audience_targeting = 'targeted_crowd';
      this.curAccountsList = [];
      this.accounts = [];
      if (this.editDefaultDataOption.target_type === 'auto_target') {
        this.editDefaultDataOption.intelli_extend.is_open = 1;
        this.editDefaultDataOption.intelli_extend.no_age_break = 1;
        this.editDefaultDataOption.intelli_extend.no_gender_break = 1;
        this.editDefaultDataOption.intelli_extend.no_area_break = 1;
      } else {
        this.editDefaultDataOption.intelli_extend.is_open = 0;
        this.editDefaultDataOption.intelli_extend.no_age_break = 0;
        this.editDefaultDataOption.intelli_extend.no_gender_break = 0;
        this.editDefaultDataOption.intelli_extend.no_area_break = 0;
      }
    }

  }
  treeAppCrowdOnCheck(event: NzFormatEmitEvent, type, value?): void {
    if (type === 'type') {
      this.editDefaultDataOption.app_interest_ids.resultData = [...event.keys];
    } else if (type === 'name') {
      value.app_ids = [...event.keys];
    }
  }

}
