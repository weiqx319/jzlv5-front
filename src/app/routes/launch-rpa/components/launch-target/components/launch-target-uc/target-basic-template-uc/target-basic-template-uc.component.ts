import { AfterViewChecked, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DataViewService } from "../../../../../../data-view-feed/service/data-view.service";
import { isArray } from "@jzl/jzl-util";
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from "../../../../../../../core/service/auth.service";
import { deepCopy } from "@jzl/jzl-util";
import { GlobalTemplateComponent } from "../../../../../../../shared/template/global-template/global-template.component";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { LaunchService } from "../../../../../service/launch.service";
import { zip } from "rxjs";

@Component({
  selector: 'app-target-basic-template-uc',
  templateUrl: './target-basic-template-uc.component.html',
  styleUrls: ['./target-basic-template-uc.component.scss']
})
export class TargetBasicTemplateUcComponent implements OnInit, OnChanges, AfterViewChecked {
  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;
  @Input() targetConfig;
  @Input() curAudienceData;
  @Input() data;
  @Input() targetType;
  @Input() isLaunchPackage;
  @Input() objectiveType;

  public audienceMap = new Map();

  public isInitSingleDataFinshed = false;

  public searchCrowdValue = '';
  public searchExcludeValue = '';

  public activeType = {
    type: 'target'
  };
  public accountsList = [];
  public curAccountsList = [];
  public accounts = [];

  public publisherId = 17;

  public defaultData: { audience_template_name: any, landing_type?: any, audience_template_id?: any, audience_desc: any, audience_setting: any, delivery_range?: any, marketing_target?: any, flow_type?: any, opt_target?: any, target_setting?: any } = {
    audience_template_name: null,  // 定向包名称
    audience_desc: null, // 定向包描述
    landing_type: '1',  // 定向包类型
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
  public autoTargeting = true;
  public manualTargeting = true;
  public kwdText = '';
  public urlText = '';

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
  };

  public tableHeight = document.body.clientHeight - 60 - 65;

  public reInitTarget = true;

  public editDefaultDataOption = {
    age: {
      resultData: [],
      checked: true,
      disabled: false,
    },//  年龄
    autoTargeting: 1,
    manualTargeting: 1,
    gender: -1,     // 性别
    allRegion: 1,      //  投放地域
    region: [],     //  地域id
    app_category: [],     // app分类
    audience_targeting: 'nolimit',     //  自定义人群
    include_audience: [],     //  包含人群
    exclude_audience: [],     //  排除人群
    interest: [],     //  兴趣
    network_env: "11",      //  网络环境
    convert_filter: 0,
    platform: {
      resultData: [],
      checked: true,
      disabled: false,
    },     //  操作系统
    auto_expand: [],      //  智能定向升级
    intelli_targeting: 500,      //  用户智能
    app_category_slt: 'nolimit',
    site_category_slt: 'nolimit',
    interest_slt: 'nolimit',
    interest_kwd: 'nolimit',
    app_slt: 'nolimit',
    app_search_name: '',
    app: {
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
          label: "自定义",
          value: "custom",
          checked: false
        },
      ],
    },  // 是否指定app分类
    app_name_lst: {
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
    },  // 是否指定app分类
    site_category_action: {
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
    },  // 是否指定站点分类
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
    interest_kwd_action: {
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
    },  // 是否指定兴趣关键词
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
    all_region: [],
    cityList: {
      list: [],
      resultData: []
    },
    countyList: {
      list: [],
      resultData: []
    },
    platformList: {
      resultData: [],
      checked: true,
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
    // 兴趣关键词
    word: [],
    // 站点分类
    url: [],
    // 定向人群
    includeList: {
      list: [],
      resultData: []
    },
    // 排除人群
    excludeList: {
      list: [],
      resultData: []
    }
  };

  public appAccount = null;

  public app_nodes = [];

  public checkedKey = [];

  constructor(
    private message: NzMessageService,
    private authService: AuthService,
    public launchRpaService: LaunchRpaService,
    private launchService: LaunchService,
    private dataViewService: DataViewService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.getAccountList();
  }

  initConfigData() {
    if (this.targetConfig) {
      this.isInitSingleDataFinshed = false;
      this.targetConfig['age']['sub'].forEach(item => {
        item.checked = false;
      });
      this.targetConfig['platform']['sub'].forEach(item => {
        item.checked = false;
      });
      // this.editDefaultDataOption.age.resultData = [-1];
      // this.editDefaultDataOption.platformList.resultData = ['111'];
      this.editDefaultDataOption.all_region = this.targetConfig.all_region;
      this.editDefaultDataOption.cityList.list = this.targetConfig.province;
      this.editDefaultDataOption.countyList.list = this.targetConfig.country;
      this.editDefaultDataOption.interestList.list = this.targetConfig.interest.sub;
      this.editDefaultDataOption.appCategoryList.list = this.targetConfig.appcategory.sub;

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
    if (this.manualTargeting) {
      resultData['crowd'] = {};
      resultData['age'] = [];
      resultData['platform'] = [];
      resultData['gender'] = this.editDefaultDataOption.gender;
      if (this.editDefaultDataOption.region.length < 1) {
        resultData['allRegion'] = 1;
      } else {
        resultData['allRegion'] = this.editDefaultDataOption.allRegion;
      }
      resultData['region'] = this.editDefaultDataOption.region;
      // resultData['age'] = this.editDefaultDataOption.age.resultData;
      resultData['app_category'] = this.editDefaultDataOption.appCategoryList.resultData;
      resultData['include_audience'] = this.editDefaultDataOption.includeList.resultData;
      resultData['exclude_audience'] = this.editDefaultDataOption.excludeList.resultData;
      resultData['network_env'] = this.editDefaultDataOption.network_env;
      resultData['interest'] = this.editDefaultDataOption.interestList.resultData;
      // resultData['platform'] = this.editDefaultDataOption.platform.resultData;
      // resultData['intelli_targeting'] = this.editDefaultDataOption.intelli_targeting;
      resultData['interest_slt'] = this.editDefaultDataOption.interest_slt;
      resultData['app_category_slt'] = this.editDefaultDataOption.app_category_slt;
      resultData['audience_targeting'] = this.editDefaultDataOption.audience_targeting;
      resultData['auto_expand'] = this.editDefaultDataOption.auto_expand;
      resultData['interest_kwd'] = this.editDefaultDataOption.interest_kwd;
      resultData['site_category_slt'] = this.editDefaultDataOption.site_category_slt;
      resultData['word'] = this.editDefaultDataOption.word;
      resultData['url'] = this.editDefaultDataOption.url;
      if (this.editDefaultDataOption.age.checked && this.editDefaultDataOption.age.disabled) {
        resultData['age'] = curAudienceData['audience_setting']['age'];
      } else {
        this.targetConfig.age.sub.forEach(subItem => {
          if (subItem.checked) {
            resultData['age'].push(subItem.value);
          }
        });
      }
      if (this.editDefaultDataOption.platform.checked && this.editDefaultDataOption.platform.disabled) {
        resultData['platform'] = curAudienceData['audience_setting']['platform'];
      } else {
        this.targetConfig.platform.sub.forEach(subItem => {
          if (subItem.checked) {
            resultData['platform'].push(subItem.value);
          }
        });
      }
      if (this.curAccountsList.length > 0) {
        this.curAccountsList.forEach(item => {
          resultData['crowd'][item.id] = {
            exclude: item.excludeCrowdResultList ? item.excludeCrowdResultList : [],
            include: item.crowdResultList ? item.crowdResultList : [],
          };
        });
      }
    }
    resultData['convert_filter'] = this.editDefaultDataOption.convert_filter;
    resultData['autoTargeting'] = this.editDefaultDataOption.autoTargeting;
    resultData['manualTargeting'] = this.editDefaultDataOption.manualTargeting;
    resultData['app_search_name'] = this.editDefaultDataOption.app_search_name;
    if (this.editDefaultDataOption.app.resultData.length > 0) {
      resultData['app'] = this.editDefaultDataOption.app.resultData;
    } else {
      resultData['app'] = [];
    }
    // resultData['include_audience'] = this.editDefaultDataOption.includeList.resultData;
    // resultData['exclude_audience'] = this.editDefaultDataOption.includeList.resultData;
    return resultData;
  }

  ngAfterViewChecked() {
    if (this.isInitSingleDataFinshed) {
      const setting = this.getResultData();
      this.data.audience_setting = { ...setting };
    }
  }

  objectiveTypeChange() {
    this.targetConfig['platform']['sub'].forEach(item => {
      item.disabled = false;
      if (this.objectiveType === '2') {
        item.checked = false;
        item.disabled = true;
        if (item.value === '001') {
          item.checked = true;
          this.editDefaultDataOption.platform.resultData = [item.value];
          this.editDefaultDataOption.platform.checked = false;
        }
      } else if (this.objectiveType === '4') {
        item.checked = false;
        item.disabled = true;
        if (item.value === '010') {
          item.checked = true;
          this.editDefaultDataOption.platform.resultData = [item.value];
          this.editDefaultDataOption.platform.checked = false;
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
      this.autoTargeting = basicData.autoTargeting > 0;
      this.manualTargeting = !(basicData.manualTargeting < 1);
      if (this.manualTargeting) {
        // 人群
        if (Object.keys(basicData['crowd']).length) {
          this.editDefaultDataOption.audience_targeting = 'custom_audience';
          for (const item of Object.keys(basicData['crowd'])) {
            const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
            if (index !== -1 && !this.curAccountsList.find(s_item => s_item.id === item)) {
              this.accounts.push(Number(item));
              const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, crowdResultList: basicData['crowd'][item]['include'], excludeCrowdResultList: basicData['crowd'][item]['exclude'] };
              this.curAccountsList.push(obj);
              this.getUcTargetAudience(obj);
            }
          }
        }
        basicData.allRegion === 0 ? this.editDefaultDataOption.cityList.resultData = basicData.region : this.editDefaultDataOption.countyList.resultData = basicData.region;
        this.editDefaultDataOption.age.resultData = basicData.age;
        this.editDefaultDataOption.allRegion = basicData.allRegion;
        this.editDefaultDataOption.gender = basicData.gender;
        this.editDefaultDataOption.region = basicData.region;
        this.editDefaultDataOption.network_env = basicData.network_env;
        this.editDefaultDataOption.convert_filter = basicData.convert_filter;
        this.editDefaultDataOption.interest_slt = basicData.interest_slt;
        this.editDefaultDataOption.app_category_slt = basicData.app_category_slt;
        this.editDefaultDataOption.audience_targeting = basicData.audience_targeting;
        // this.editDefaultDataOption.intelli_targeting= basicData.intelli_targeting;
        this.editDefaultDataOption.appCategoryList.resultData = basicData.app_category;
        this.editDefaultDataOption.interestList.resultData = basicData.interest;
        this.editDefaultDataOption.platform.resultData = basicData.platform;
        this.editDefaultDataOption.includeList.resultData = basicData.include_audience;
        this.editDefaultDataOption.excludeList.resultData = basicData.exclude_audience;
        this.editDefaultDataOption.autoTargeting = basicData.autoTargeting;
        this.editDefaultDataOption.manualTargeting = basicData.manualTargeting;
        this.editDefaultDataOption.interest_kwd = basicData.interest_kwd;
        this.editDefaultDataOption.site_category_slt = basicData.site_category_slt;
        this.editDefaultDataOption.word = basicData.word ? basicData.word : [];
        this.editDefaultDataOption.url = basicData.url ? basicData.url : [];
        if (basicData.age) {
          this.targetConfig['age']['sub'].forEach(item => {
            if (basicData.age.indexOf(item.value) !== -1) {
              item.checked = true;
              this.editDefaultDataOption.age.checked = false;
            }
          });
        }
        if (basicData.platform) {
          this.targetConfig['platform']['sub'].forEach(item => {
            if (basicData.platform.indexOf(item.value) !== -1) {
              item.checked = true;
              this.editDefaultDataOption.platform.checked = false;
            }
          });
        }
        if (basicData.auto_expand) {
          this.targetConfig['auto_expand']['sub'].forEach(item => {
            if (basicData.auto_expand.indexOf(item.value) !== -1) {
              item.checked = true;
            }
          });
        }

        if (basicData.app) {
          if (basicData.app.length > 0) {
            this.editDefaultDataOption.app.resultData = basicData.app;
            this.editDefaultDataOption.app_slt = 'custom';
          } else {
            this.editDefaultDataOption.app_slt = 'nolimit';
          }
        }
      }
      // this.editDefaultDataOption = {...this.editDefaultDataOption,...basicData};
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
      if (this.editDefaultDataOption.allRegion === 0) {
        this.editDefaultDataOption.cityList = { ...sourceData };
      } else {
        this.editDefaultDataOption.countyList = { ...sourceData };
      }
    } else if (type === 'interest') {
      this.editDefaultDataOption.interestList = { ...sourceData };
    } else if (type === 'app_category') {
      this.editDefaultDataOption.appCategoryList = { ...sourceData };
    }
  }

  updateSingleChecked(data, type) {
    this.editDefaultDataOption[type]["checked"] = false;
    if (type === 'age') {
      this.editDefaultDataOption.age.resultData = [];
      if (data.every(item => !item.checked)) {
        this.editDefaultDataOption.age.checked = true;
        this.editDefaultDataOption.age.resultData = [-1];
      } else {
        data.forEach(item => {
          if (item.checked) {
            this.editDefaultDataOption.age.resultData.push(item.value);
          }
        });
      }
    } else if (type === 'auto_expand') {
      this.editDefaultDataOption.auto_expand = [];
      data.forEach(item => {
        if (item.checked) {
          this.editDefaultDataOption.auto_expand.push(item.value);
        }
      });
    } else if (type === 'platform') {
      this.editDefaultDataOption.platform.checked = false;
      this.editDefaultDataOption.platform.resultData = [];
      if (this.objectiveType === '1') {
        if (data.every(item => !item.checked)) {
          this.editDefaultDataOption.platform.checked = true;
          this.editDefaultDataOption.platform.resultData = ['111'];
        } else {
          data.forEach(item => {
            if (item.checked) {
              this.editDefaultDataOption.platform.resultData.push(item.value);
            }
          });
        }
      }
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
          if (!this.editDefaultDataOption.platform.checked) {
            this.editDefaultDataOption.platform.resultData = [];
          } else {
            this.editDefaultDataOption.platform.resultData = ['111'];
            this.targetConfig['platform']['sub'].forEach(item => {
              item.checked = false;
            });
          }
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

  getDisabled(audienceData) {
    //人群
    this.editDefaultDataOption['targeting_audience']['sub'].forEach(item => {
      item['disabled'] = audienceData['audience_targeting'] === 'custom_audience' && item.value === 'nolimit';
    });
    // 地域
    this.targetConfig['all_region']['sub'].forEach(item => {
      item['disabled'] = audienceData['allRegion'] !== 1 && item.value !== audienceData['allRegion'];
    });

    // 性别
    this.targetConfig['gender']['sub'].forEach(item => {
      item['disabled'] = audienceData['gender'] !== -1 && item.value !== audienceData['gender'];
    });

    // 年龄
    if (audienceData['age'].length > 0) {
      if (audienceData['age'].indexOf(-1) < 0) {
        this.editDefaultDataOption.age.disabled = true;
        this.targetConfig['age'].sub.forEach(subItem => {
          if (audienceData['age'].indexOf(subItem['value']) > -1) {
            this.targetConfig.age['checked'] = true;
          } else {
            subItem['disabled'] = true;
          }
        });
      } else {
        this.editDefaultDataOption.age.checked = true;
      }
    }
    //网络环境
    this.targetConfig['network_env']['sub'].forEach(item => {
      item['disabled'] = audienceData['network_env'] !== '11' && item.value !== audienceData['network_env'];
    });
    //App
    this.editDefaultDataOption['app_category_action']['sub'].forEach(item => {
      item['disabled'] = audienceData['app_category'].length > 0 && item.value === 'nolimit';
    });
    this.editDefaultDataOption['app_name_lst']['sub'].forEach(item => {
      item['disabled'] = audienceData['app'] && audienceData['app'].length > 0 && item.value === 'nolimit';
    });

    //行为兴趣
    this.editDefaultDataOption['interest_slt_action']['sub'].forEach(item => {
      item['disabled'] = audienceData['interest'].length > 0 && item.value === 'nolimit';
    });
    if (audienceData['word']) {
      this.editDefaultDataOption['interest_kwd_action']['sub'].forEach(item => {
        item['disabled'] = audienceData['word'].length > 0 && item.value === 'nolimit';
      });
    }
    if (audienceData['url']) {
      this.editDefaultDataOption['site_category_action']['sub'].forEach(item => {
        item['disabled'] = audienceData['url'].length > 0 && item.value === 'nolimit';
      });
    }

    // 平台
    if (audienceData['platform'].length > 0) {
      this.targetConfig['platform'].sub.forEach(subItem => {
        if (audienceData['platform'].indexOf(subItem['value']) > -1) {
          this.editDefaultDataOption.platform['disabled'] = true;
        } else {
          subItem['disabled'] = true;
        }
      });
    }
    // 智能放量
    // this.targetConfig['intelli_targeting']['sub'].forEach(item => {
    //   item['disabled'] = audienceData['intelli_targeting'] === 0 && item.value !== audienceData['intelli_targeting'];
    // });

    this.targetConfig['convert_filter']['sub'].forEach(item => {
      item['disabled'] = item.value !== audienceData['convert_filter'];
    });

  }

  getAccountList() {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": "17"
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
          this.curAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, crowdResultList: [], excludeCrowdResultList: [] });
          this.getUcTargetAudience(this.curAccountsList[index]);
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

  getUcTargetAudience(value) {
    const getUcTargetAudience = this.launchService.getUcTargetAudience({
      chan_pub_id: value.id,
      cid: this.cid,
    });
    getUcTargetAudience.subscribe(result => {
      value.crowdList = deepCopy(result['data']['audienceList']);
      value.excludeCrowdList = deepCopy(result['data']['audienceList']);
      const audienceList = [];
      result['data']['audienceList'].forEach(item => {
        audienceList.push(item.key);
      });
      value.crowdResultList = deepCopy(value.crowdResultList.filter(key => audienceList.indexOf(key) !== -1));
      value.excludeCrowdResultList = deepCopy(value.excludeCrowdResultList.filter(key => audienceList.indexOf(key) !== -1));
      this.getAudienceMap(result['data']['audienceList']);

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

  getAudienceMap(arr: any[]) {
    arr.forEach(item => {
      this.audienceMap.set(item.key, item.title);
      if (isArray(item.children) && item.children.length > 0) {
        return this.getAudienceMap(item.children);
      }
    });
    return this.audienceMap;
  }

  switchChange(type, event) {
    if (type === 'auto') {
      if (event) {
        this.editDefaultDataOption.autoTargeting = 1;
      } else {
        this.editDefaultDataOption.autoTargeting = 0;
      }
    } else if (type === 'manual') {
      if (event) {
        this.editDefaultDataOption.manualTargeting = 1;
      } else {
        this.editDefaultDataOption.manualTargeting = 0;
      }
    }
  }
  addText() {
    let dataValid = true;
    const inputValueAry = this.kwdText.split(/[\s,\/]+/g); // 根据换行或者回车进行识别
    inputValueAry.forEach((item, idx) => {
      if (item.replace(/[\u0391-\uFFE5]/g, "aa").length > 30) {
        dataValid = false;
      }
      if (!item) {
        inputValueAry.splice(idx, 1);
      }
    });

    if (!dataValid) {
      this.message.error('每个关键词不超过15个字');
      return false;
    }

    if ((this.editDefaultDataOption.word.length + inputValueAry.length) > 1000) {
      this.message.error('最多1000个关键词');
      return false;
    }
    inputValueAry.forEach(item => {
      if (item.length && this.editDefaultDataOption.word.indexOf(item) === -1) {
        this.editDefaultDataOption.word.push(item);
      }
    });
    this.kwdText = '';
  }
  addUrl() {
    let dataValid = true;
    const inputValueAry = this.urlText.split(/\s+/g); // 根据换行或者回车进行识别
    const req = /^(?!([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/))([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?)/;
    inputValueAry.forEach((item, idx) => {
      if (!req.test(item)) {
        dataValid = false;
      }
      if (!item) {
        inputValueAry.splice(idx, 1);
      }
    });

    if (!dataValid) {
      this.message.error('URL不合法(不要连同 http://或https:// 一起填写)');
      return false;
    }

    if ((this.editDefaultDataOption.url.length + inputValueAry.length) > 200) {
      this.message.error('最多200个站点');
      return false;
    }

    inputValueAry.forEach(item => {
      if (item.length && this.editDefaultDataOption.url.indexOf(item) === -1) {
        this.editDefaultDataOption.url.push(item);
      }
    });
    this.urlText = '';
  }
  clearInput(type) {
    if (type === 'word') {
      this.editDefaultDataOption.word = [];
    } else if (type === 'url') {
      this.editDefaultDataOption.url = [];
    }
  }

  deleteCrowd(list, result, index?) {
    if (index !== undefined) {
      result.splice(index, 1);
    } else {
      result.splice(0);
    }
    this.getUcTargetAudience(list);
  }

  syncAudience(list) {
    this.curAccountsList.forEach(item => {
      item.crowdResultList = list.crowdResultList;
      item.excludeCrowdResultList = list.excludeCrowdResultList;
    });
  }

  changeAllRegion() {
    this.editDefaultDataOption.region = [];
  }

  changeAppAccount() {
    this.getUcAppInterestByName();
  }

  getUcAppInterestByName(name?) {
    const app_names = this.editDefaultDataOption.app_search_name ? this.editDefaultDataOption.app_search_name.split(/[(\r\n)\r\n]+/) : [];
    if (!this.appAccount) {
      this.message.error('请先选择账户');
      return;
    }
    if (app_names.length > 20) {
      this.message.error('最多输入20个APP名称信息');
      return;
    }
    const body = {
      "chan_pub_id": this.appAccount,
      "seeds": app_names,
    };
    if (name) {
      body.seeds = name;
    }
    this.launchRpaService.getUcAppInterestByName(body).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        const crowd = [];
        result['data'].forEach(item => {
          crowd.push({
            title: item.name,
            key: item.id,
            isLeaf: true
          });
        });
        this.editDefaultDataOption.app.list = deepCopy(crowd);
      }
    });
  }

  treeAppCrowdOnCheck(event: NzFormatEmitEvent): void {
    this.checkedKey = event.keys;
  }

  addAppName() {
    const curNode = [];
    this.editDefaultDataOption.app.list.forEach(item => {
      if (this.checkedKey.includes(item.key)) {
        curNode.push(item);
      }
    });
    curNode.forEach(item => {
      const node = this.app_nodes.length > 0 && this.app_nodes.find(nodeItem => nodeItem.title === item['title']);
      if (!node) {
        this.app_nodes.push(item);
      }
    });
    this.editDefaultDataOption.app.resultData = this.app_nodes.map(item => item.title);
    this.checkedKey = [];
  }

  deleteAppName(index, name) {
    this.editDefaultDataOption.app.resultData.splice(index, 1);
    this.app_nodes.splice(this.app_nodes.findIndex(item => item.title === name), 1);
  }

  deleteAllAppName() {
    this.editDefaultDataOption.app.resultData = [];
    this.app_nodes = [];
  }

  addAllAppName() {
    this.checkedKey = this.editDefaultDataOption.app.list.map(item => item.key);
  }
}
