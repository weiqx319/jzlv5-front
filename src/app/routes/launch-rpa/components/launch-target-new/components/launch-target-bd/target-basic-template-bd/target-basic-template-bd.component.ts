import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { GlobalTemplateComponent } from "../../../../../../../shared/template/global-template/global-template.component";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { MenuService } from "../../../../../../../core/service/menu.service";
import { LaunchService } from "../../../../../service/launch.service";
import { DataViewService } from "../../../../../../data-view-feed/service/data-view.service";
import { isArray } from "@jzl/jzl-util";
import { deepCopy } from "@jzl/jzl-util";
import { MaterialsService } from "../../../../../../materials/service/materials.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';

@Component({
  selector: 'app-target-basic-template-bd',
  templateUrl: './target-basic-template-bd.component.html',
  styleUrls: ['./target-basic-template-bd.component.scss'],
  providers: [MaterialsService]
})
export class TargetBasicTemplateBdComponent implements OnInit, OnChanges, AfterViewChecked {

  @ViewChild('curTextArea') curTextArea: ElementRef;
  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;
  @Input() targetConfig;
  @Input() curAudienceData;
  @Input() data;
  @Input() targetType;
  @Input() isLaunchPackage;
  @Input() objectiveType;
  @Input() curAccountList;
  @Input() errorTipAry;
  @Input() ftypes_type;
  @Input() delivery_type;

  public isInitSingleDataFinshed = false;
  public cursorPosition = 0;
  public allCity = [false, false, false];
  public cityText = '';
  public noHaveText = '';
  public searchCrowdValue = '';
  public searchExcludeValue = '';

  public accountsList = [];
  public curAccountsList = [];
  public accounts = [];
  public keyAccounts = [];
  public mediaAccounts = [];
  public keyAccountsList = [];
  public mediaAccountsList = [];
  public appAccountsList = [];
  public appAccounts = [];
  public customAppMap = {};

  public publisherId = 1;

  public defaultData: { audience_template_name: any, landing_type?: any, audience_template_id?: any, audience_desc: any, audience_setting: any, delivery_range?: any, marketing_target?: any, flow_type?: any, target_setting?: any } = {
    audience_template_name: null,  // 定向包名称
    audience_desc: null, // 定向包描述
    landing_type: '1',  // 定向包类型
    flow_type: 0,
    audience_setting: {},
    target_setting: {},
  };

  public cid;
  public chan_pub_id = 0;

  public tableHeight = document.body.clientHeight - 60 - 65;

  public reInitTarget = true;

  public editDefaultDataOption = {
    age: {
      value: 0,
      customData: [14, 66],
      customList: [],
      resultData: [],
      checked: true,
      disabled: false,
    },//  年龄
    education: {
      resultData: [],
      checked: true,
      disabled: false,
    },//  学历
    exclude_trans: '0',
    keywords_search_name: '',
    sex: 0,     // 性别
    allRegion: 0,      //  投放地域
    region: [],     //  地域id
    net: "0",      //  网络环境
    ios_version: [],
    ios_version_slt: '0',
    android_version: [],
    android_version_slt: '0',
    life_stage: {
      value: 'nolimit',
      sub: [
        {
          label: "不限",
          value: 'nolimit',
          checked: false
        },
        {
          label: "自定义",
          value: "custom",
          checked: false
        },
      ],
      list: [],
      resultData: []
    },
    device: {
      resultData: [],
      checked: true,
      disabled: false,
    },     //  操作系统
    targeting_audience: {
      name: "自定义人群",
      value: 'nolimit',
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
    },//自定义人群
    targeting_interest: {
      name: "兴趣",
      value: 'nolimit',
      sub: [
        {
          label: "不限",
          value: 'nolimit',
          checked: false
        },
        {
          label: "自定义",
          value: "custom",
          checked: false
        },
      ],
    },//兴趣
    keywords_extend: '1',//无效意图词过滤
    auto_expansion: '0',//自动扩量
    deeplink_only: '0',
    behavior: [],
    media_type: '1',
    user_action_type: '1',
    interest_keywords_audience: '0',
    media_package: '0',
    media_orientation: {
      value: '0',
      resultData: [],
    },//媒体
    pa_keywords: '0',
    keywords_expend: false,
    keywords: {
      "name": "买词方式",
      "resultValue": [],
      "sub": [{
        "label": "直接填写意图词",
        "value": 1,
        "checked": false
      }, {
        "label": "商品意图词模板",
        "value": 2,
        "checked": false
      },],
      combine_data: {
        "1": {
          sub: [],
          group_id: null,
          result: null,
          resultList: [],
        },
        "2": {
          sub: [],
          result: null,
          resultList: [],
        },
      }
    },//买词方式
    all_region: [],
    //媒体
    mediaList: {
      list: [],
      resultData: []
    },
    cityList: {
      list: [],
      resultData: []
    },
    interest: {
      value: '0',
      expand: false,
      list: [],
      resultData: []
    },
    app: {
      value: 'all',
      behavior: '2',
      search_name: '',
      list: [],
      resultData: []
    },
    article: {
      value: 'all',
      resultData: []
    },
    android_brands: {
      value: '0',
      resultData: []
    },
    mobile_phone_price: {
      value: '0',
      resultData: []
    },
    ftypes: {
      "name": "投放范围",
      "value": 0,
      resultData: [],
      "sub": [
        {
          "label": "默认",
          "value": 0,
          "checked": true
        },
        {
          "label": "百青藤",
          "value": 4,
          "checked": false
        },
        {
          "label": "自定义",
          "value": 2,
          "checked": false,
          "sub": [
            {
              "label": "百度信息流",
              "value": 1,
              "checked": false
            },
            {
              "label": "贴吧",
              "value": 2,
              "checked": false
            },
            {
              "label": "好看视频",
              "value": 8,
              "checked": false
            },
            {
              "label": "百度小说",
              "value": 64,
              "checked": false
            }
          ]
        }
      ]
    },
    delivery_type: {
      "name": "买词方式",
      "value": '0',
      "sub": [{
        "label": "不限",
        "value": '0',
        "checked": false
      }, {
        "label": "开屏",
        "value": '1',
        "checked": false
      },],
    },
    countyList: {
      list: [],
      resultData: []
    },
    placeList: {
      list: [],
      resultData: []
    },
    platformList: {
      resultData: [],
      checked: true,
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
    }
  };
  public flowTypeList = [
    {
      "name": "默认",
      "key": 0,
    },
    {
      "name": "百青藤",
      "key": 4,
    },
    {
      "name": "自定义",
      "key": 2,
    }
  ];

  constructor(
    private message: NzMessageService,
    private authService: AuthService,
    public launchRpaService: LaunchRpaService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.getRegionList('region');
    // this.getRegionList('biz_area');
    this.getRegionList('place');
    this.getAccountList();
  }

  initConfigData() {
    if (this.targetConfig) {
      this.isInitSingleDataFinshed = false;
      this.targetConfig['age']['sub'][1].sub.forEach(item => {
        item.checked = false;
      });
      this.targetConfig['device']['sub'].forEach(item => {
        item.checked = false;
      });
      this.editDefaultDataOption['age'].customList = this.generateRangeData('age', 18, 56, [], '岁', true);

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
    resultData['keywords'] = {};
    resultData['keywordAccount'] = {};
    resultData['recmDataAccount'] = {};
    resultData['media_orientation'] = {};
    resultData['age'] = [];
    resultData['device'] = [];
    resultData['education'] = [];
    resultData['life_stage'] = [];
    resultData['interest'] = [];
    resultData['app'] = {};
    resultData['app']['type'] = this.editDefaultDataOption.app.value;
    resultData['app']['behavior'] = [this.editDefaultDataOption.app.behavior];
    resultData['app']['search_name'] = this.editDefaultDataOption.app.search_name;
    resultData['app']['list'] = [];
    resultData['app']['custom_list'] = {};
    resultData['app']['custom'] = {};
    if (this.editDefaultDataOption.app.value==='custom'&&this.appAccountsList.length > 0) {
      this.appAccountsList.forEach(item => {
        resultData['app']['custom_list'][item.id] = item.app_ids||[];
        resultData['app']['custom'][item.id] = item.list||[];
      });
    } else if (this.editDefaultDataOption.app.value==='category'&&this.editDefaultDataOption.app.resultData.length > 0) {
      this.editDefaultDataOption.app.resultData.forEach(id => {
        resultData['app']['list'].push({ id: id });
      });
    } else {
      resultData['app']['type']='all';
    }
    resultData['exclude_trans'] = this.editDefaultDataOption.exclude_trans;
    resultData['media_orientation_slt'] = this.editDefaultDataOption.media_orientation.value;
    resultData['interest_slt'] = this.editDefaultDataOption.interest.value;
    resultData['pa_keywords'] = this.editDefaultDataOption.pa_keywords;
    resultData['interest_keywords_audience'] = this.editDefaultDataOption.interest_keywords_audience;
    resultData['sex'] = this.editDefaultDataOption.sex;
    resultData['allRegion'] = this.editDefaultDataOption.allRegion;
    resultData['region'] = this.editDefaultDataOption.region;
    resultData['android_version'] = [];
    resultData['ios_version'] = [];
    resultData['android_brands'] = [];
    resultData['mobile_phone_price'] = [];
    resultData['net'] = this.editDefaultDataOption.net;
    resultData['audience_targeting'] = this.editDefaultDataOption.targeting_audience.value;
    resultData['life_stage_slt'] = this.editDefaultDataOption.life_stage.value;
    resultData['keywords_extend'] = this.editDefaultDataOption.keywords_extend;
    resultData['auto_expansion'] = this.editDefaultDataOption.auto_expansion;
    resultData['deeplink_only'] = this.editDefaultDataOption.deeplink_only;
    resultData['behavior'] = this.editDefaultDataOption.behavior;
    resultData['media_type'] = this.editDefaultDataOption.media_type;
    resultData['user_action_type'] = this.editDefaultDataOption.user_action_type;
    resultData['age_slt'] = this.editDefaultDataOption.age.value;
    if (this.editDefaultDataOption.android_version_slt == '1') {
      resultData['android_version'] = this.editDefaultDataOption.android_version;
    }
    if (this.editDefaultDataOption.ios_version_slt == '1') {
      resultData['ios_version'] = this.editDefaultDataOption.ios_version;
    }
    if (this.editDefaultDataOption.android_brands.value == 'custom_android_brands') {
      resultData['android_brands'] = this.editDefaultDataOption.android_brands.resultData;
    }
    if (this.editDefaultDataOption.mobile_phone_price.value == 'custom_mobile_phone_price') {
      resultData['mobile_phone_price'] = this.editDefaultDataOption.mobile_phone_price.resultData;
    }
    if (this.editDefaultDataOption.life_stage.value === 'custom') {
      resultData['life_stage'] = this.editDefaultDataOption.life_stage.resultData;
    }
    if (this.editDefaultDataOption.interest_keywords_audience == '1') {
      resultData['interest'] = this.editDefaultDataOption.interest.resultData;
    }
    if (this.editDefaultDataOption.age.value == 0) {

    } else if (this.editDefaultDataOption.age.value == 2) {
      resultData['age'] = this.editDefaultDataOption.age.customData;
    } else {
      this.targetConfig.age.sub[1].sub.forEach(subItem => {
        if (subItem.checked) {
          resultData['age'].push(subItem.value);
        }
      });
    }
    if (this.editDefaultDataOption.device.checked && this.editDefaultDataOption.device.disabled) {
      resultData['device'] = curAudienceData['audience_setting']['device'];
    } else {
      this.targetConfig.device.sub.forEach(subItem => {
        if (subItem.checked) {
          resultData['device'].push(subItem.value);
        }
      });
    }
    if (this.editDefaultDataOption.education.checked && this.editDefaultDataOption.education.disabled) {
      resultData['education'] = curAudienceData['audience_setting']['education'];
    } else {
      this.targetConfig.education.sub.forEach(subItem => {
        if (subItem.checked) {
          resultData['education'].push(subItem.value);
        }
      });
    }
    if (this.editDefaultDataOption.interest_keywords_audience == '2' && this.curAccountsList.length > 0) {
      this.curAccountsList.forEach(item => {
        resultData['crowd'][item.id] = {
          exclude: item.excludeCrowdResultList ? item.excludeCrowdResultList : [],
          include: item.crowdResultList ? item.crowdResultList : [],
        };
      });
    } else {
      resultData['audience_targeting'] = 'nolimit';
    }
    if (this.editDefaultDataOption.media_orientation.value != '0') {
      if (this.mediaAccountsList.length > 0) {
        this.mediaAccountsList.forEach(item => {
          resultData['media_orientation'][item.id] = {
            resultData: item.media['resultData'],
            media_type: item.media_type
          };
        });
      } else {
        resultData['media_orientation_slt'] = '0';
      }
    }

    if (this.editDefaultDataOption.interest_keywords_audience == '1') {
      if (this.keyAccountsList.length > 0) {
        this.keyAccountsList.forEach(item => {
          resultData['keywords'][item.id] = item.keywords.resultData.join(',');
          resultData['keywordAccount'][item.id] = item.keywords;
          resultData['recmDataAccount'][item.id] = item.recmData;
        });
      } else {
        resultData['pa_keywords'] = '0';
      }
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
    if (this.objectiveType === '1') {
      this.editDefaultDataOption.mobile_phone_price.value = '0';
      this.editDefaultDataOption.android_brands.value = '0';
    } else if (this.objectiveType === '2') {
      this.editDefaultDataOption.android_brands.value = '0';
    }
    this.targetConfig['device']['sub'].forEach(item => {
      item.disabled = false;
      if (this.objectiveType === '2') {
        item.checked = false;
        item.disabled = true;
        if (item.value === '1') {
          item.checked = true;
          this.editDefaultDataOption.device.resultData = [item.value];
          this.editDefaultDataOption.device.checked = false;
        }
      } else if (this.objectiveType === '3') {
        item.checked = false;
        item.disabled = true;
        if (item.value === '2') {
          item.checked = true;
          this.editDefaultDataOption.device.resultData = [item.value];
          this.editDefaultDataOption.device.checked = false;
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['objectiveType'] && !changes['objectiveType'].firstChange) {
      this.objectiveTypeChange();
    }
    if (changes['ftypes_type'] && !changes['ftypes_type'].firstChange) {
      this.changeKeyType(changes['ftypes_type'].currentValue, 'ftypes');
    }
    if (changes['delivery_type'] && !changes['delivery_type'].firstChange) {
      this.changeKeyType(changes['delivery_type'].currentValue, 'delivery_type');
    }
  }

  initSingleData(basicData) {
    if (Object.keys(basicData).length) {
      // 人群
      if (Object.keys(basicData['crowd']).length) {
        this.editDefaultDataOption.targeting_audience.value = 'custom_audience';
        for (const item of Object.keys(basicData['crowd'])) {
          const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
          if (index !== -1 && !this.curAccountsList.find(s_item => s_item.id === item)) {
            this.accounts.push(Number(item));
            const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, crowdResultList: basicData['crowd'][item]['include'], excludeCrowdResultList: basicData['crowd'][item]['exclude'] };
            this.curAccountsList.push(obj);
            this.getTargetAudience(obj);
          }
        }
      }
      if (Object.keys(basicData['media_orientation']).length) {
        for (const item of Object.keys(basicData['media_orientation'])) {
          const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
          if (index !== -1 && !this.mediaAccountsList.find(s_item => s_item.id === item)) {
            this.mediaAccounts.push(Number(item));
            if (basicData.media_orientation_slt === 'media_package') {
              const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, media_type: basicData['media_orientation'][item]['media_type'], media: { list: [], resultData: basicData['media_orientation'][item].resultData } };
              this.mediaAccountsList.push(obj);
              this.getMediaPackages(obj, 2);
            } else if (basicData.media_orientation_slt === 'custom_media_package') {
              const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, media_type: null, media: { list: [], resultData: basicData['media_orientation'][item].resultData } };
              this.mediaAccountsList.push(obj);
              this.getMediaPackages(obj, 1);
            } else if (basicData.media_orientation_slt === 'media_categories') {
              const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, media_type: null, media: { list: [], resultData: basicData['media_orientation'][item].resultData } };
              this.mediaAccountsList.push(obj);
            }

          } else {
            this.editDefaultDataOption.media_orientation.resultData = basicData.media_orientation[item];
          }
        }
      }
      if (Object.keys(basicData['keywords']).length) {
        this.editDefaultDataOption.pa_keywords = '1';
        for (const item of Object.keys(basicData['keywords'])) {
          const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
          if (index !== -1 && !this.keyAccountsList.find(s_item => s_item.id === item)) {
            this.keyAccounts.push(Number(item));
            const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, wtpsList: [], recmList: [], recmData: basicData['recmDataAccount'][item], keywords_search_name: '', keywords: basicData['keywordAccount'][item] };
            this.keyAccountsList.push(obj);
            this.getKeywordsList(obj);
            this.getRecmWordsList(obj);
          }
        }
      }
      basicData.allRegion == 1 ? this.editDefaultDataOption.cityList.resultData = basicData.region : basicData.allRegion == 2 ? this.editDefaultDataOption.countyList.resultData = basicData.region : this.editDefaultDataOption.placeList.resultData = basicData.region;
      this.editDefaultDataOption.age.value = Number(basicData.age_slt);
      this.editDefaultDataOption.age.resultData = basicData.age;
      this.editDefaultDataOption.allRegion = basicData.allRegion;
      this.editDefaultDataOption.sex = basicData.sex;
      this.editDefaultDataOption.region = basicData.region;
      this.editDefaultDataOption.net = basicData.net;
      this.editDefaultDataOption.targeting_audience.value = basicData.audience_targeting;
      this.editDefaultDataOption.pa_keywords = basicData.pa_keywords;
      this.editDefaultDataOption.keywords_extend = basicData.keywords_extend;
      this.editDefaultDataOption.auto_expansion = basicData.auto_expansion;
      this.editDefaultDataOption.deeplink_only = basicData.deeplink_only;
      this.editDefaultDataOption.behavior = basicData.behavior;
      this.editDefaultDataOption.media_type = basicData.media_type;
      this.editDefaultDataOption.user_action_type = basicData.user_action_type;
      this.editDefaultDataOption.android_version = basicData.android_version;
      this.editDefaultDataOption.ios_version = basicData.ios_version;
      this.editDefaultDataOption.device.resultData = basicData.device;
      this.editDefaultDataOption.media_orientation.value = basicData.media_orientation_slt;
      this.editDefaultDataOption.interest.value = basicData.interest_slt;
      this.editDefaultDataOption.interest.resultData = basicData.interest;
      this.editDefaultDataOption.exclude_trans = basicData.exclude_trans;
      this.editDefaultDataOption.interest_keywords_audience = basicData.interest_keywords_audience;
      if (this.editDefaultDataOption.interest_keywords_audience == '1') {
        this.editDefaultDataOption.interest.expand = true;
        this.editDefaultDataOption.keywords_expend = true;
      }
      if (basicData['android_version'] && basicData['android_version'].length > 0) {
        this.editDefaultDataOption.android_version_slt = '1';
      }
      if (basicData['ios_version'] && basicData['ios_version'].length > 0) {
        this.editDefaultDataOption.ios_version_slt = '1';
      }
      if (basicData['android_brands'] && basicData['android_brands'].length > 0) {
        this.editDefaultDataOption.android_brands.value = 'custom_android_brands';
        this.editDefaultDataOption.android_brands.resultData = basicData['android_brands'];
      }
      if (basicData['mobile_phone_price'] && basicData['mobile_phone_price'].length > 0) {
        this.editDefaultDataOption.mobile_phone_price.value = 'custom_mobile_phone_price';
        this.editDefaultDataOption.mobile_phone_price.resultData = basicData['mobile_phone_price'];
      }
      if (basicData.app.search_name) {
        this.editDefaultDataOption.app.search_name = basicData.app.search_name;
      }
      if (basicData['app']) {
        this.editDefaultDataOption.app.value = basicData['app']['type'];
        this.editDefaultDataOption.app.behavior = basicData['app']['behavior'][0];
        if (this.editDefaultDataOption.app.value==='category') {
          basicData['app']['list'].forEach(item => {
            this.editDefaultDataOption.app.resultData.push(item.id);
          });
        } else if (this.editDefaultDataOption.app.value==='custom') {
          for (const item of Object.keys(basicData['app']['custom_list'])) {
            const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
            if (index !== -1 && !this.appAccountsList.find(s_item => s_item.id === item)) {
              this.appAccounts.push(Number(item));
              const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, app_ids: basicData['app']['custom_list'][item],list: basicData['app']['custom'][item] };
              this.appAccountsList.push(obj);
              this.getAppByName(obj, this.editDefaultDataOption.app.search_name);
            }
          }
        }
      }
      if (basicData.age) {
        if (this.editDefaultDataOption.age.value == 1) {
          this.targetConfig['age']['sub'][1]['sub'].forEach(item => {
            if (basicData.age.indexOf(item.value) !== -1) {
              item.checked = true;
              this.editDefaultDataOption.age.checked = false;
            }
          });
        } else if (this.editDefaultDataOption.age.value == 2) {
          this.editDefaultDataOption.age.customData = basicData.age;
        }
      }
      if (basicData.device) {
        this.targetConfig['device']['sub'].forEach(item => {
          if (basicData.device.indexOf(item.value) !== -1) {
            item.checked = true;
            this.editDefaultDataOption.device.checked = false;
          }
        });
      }
      if (basicData.education) {
        this.targetConfig['education']['sub'].forEach(item => {
          if (basicData.education.indexOf(item.value) !== -1) {
            item.checked = true;
            this.editDefaultDataOption.education.checked = false;
          }
        });
      }

      if (basicData.life_stage && basicData.life_stage.length > 0) {
        this.editDefaultDataOption.life_stage.value = 'custom';
        this.editDefaultDataOption.life_stage.resultData = basicData.life_stage;
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
      if (this.editDefaultDataOption.allRegion == 1) {
        this.editDefaultDataOption.cityList = { ...sourceData };
      } else if (this.editDefaultDataOption.allRegion == 2) {
        this.editDefaultDataOption.countyList = { ...sourceData };
      } else if (this.editDefaultDataOption.allRegion == 3) {
        this.editDefaultDataOption.placeList = { ...sourceData };
      }
    }
  }

  updateSingleChecked(data, type) {
    this.editDefaultDataOption[type]["checked"] = false;
    if (type === 'age') {
      this.editDefaultDataOption.age.resultData = [];
      if (data.every(item => !item.checked)) {
        this.editDefaultDataOption.age.checked = true;
        this.editDefaultDataOption.age.resultData = [0];
      } else {
        data.forEach(item => {
          if (item.checked) {
            this.editDefaultDataOption.age.resultData.push(item.value);
          }
        });
      }
    } else if (type === 'device') {
      this.editDefaultDataOption.device.checked = false;
      this.editDefaultDataOption.device.resultData = [];
      if (this.objectiveType === '1') {
        if (data.every(item => !item.checked)) {
          this.editDefaultDataOption.device.checked = true;
          this.editDefaultDataOption.device.resultData = [0];
        } else {
          data.forEach(item => {
            if (item.checked) {
              this.editDefaultDataOption.device.resultData.push(item.value);
            }
          });
        }
        if (this.editDefaultDataOption.device.resultData.indexOf('2') === -1) {
          this.editDefaultDataOption.app.value = 'all';
        }
      }
    } else if (type === 'education') {
      this.editDefaultDataOption.education.checked = false;
      this.editDefaultDataOption.education.resultData = [];
      if (data.every(item => !item.checked)) {
        this.editDefaultDataOption.education.checked = true;
        this.editDefaultDataOption.education.resultData = [0];
      } else {
        data.forEach(item => {
          if (item.checked) {
            this.editDefaultDataOption.education.resultData.push(item.value);
          }
        });
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
        if (type === 'device') {
          if (!this.editDefaultDataOption.device.checked) {
            this.editDefaultDataOption.device.resultData = [];
          } else {
            this.editDefaultDataOption.device.resultData = [0];
            this.targetConfig['device']['sub'].forEach(item => {
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
    //投放流量
    this.flowTypeList.forEach(item => {
      item['disabled'] = audienceData['flow_type'] !== item.key;
    });
    //媒体
    if (audienceData['media_orientation']) {
      this.targetConfig['media_orientation']['sub'].forEach(item => {
        item['disabled'] = audienceData['media_orientation'] !== '0' && item.value !== audienceData['media_orientation'];
      });
    }
    //商品定向
    this.targetConfig['keywords']['sub'].forEach(item => {
      item['disabled'] = audienceData['pa_keywords'] == '1' && item.value == '0';
    });

    //无效意图词过滤
    this.targetConfig['keywords_extend']['sub'].forEach(item => {
      item['disabled'] = audienceData['keywords_extend'] !== item.value;
    });
    //排除已转化人群
    this.targetConfig['exclude_trans']['sub'].forEach(item => {
      item['disabled'] = audienceData['exclude_trans'] !== '0' && audienceData['exclude_trans'] !== item.value;
    });
    //自动扩量
    this.targetConfig['auto_expansion']['sub'].forEach(item => {
      item['disabled'] = audienceData['auto_expansion'] !== item.value;
    });

    //兴趣
    this.targetConfig['interest']['sub'].forEach(item => {
      item['disabled'] = this.editDefaultDataOption.interest.value === '1' && item.value === '0';
    });

    //人群
    this.editDefaultDataOption['targeting_audience']['sub'].forEach(item => {
      item['disabled'] = audienceData['audience_targeting'] === 'custom_audience' && item.value === 'nolimit';
    });
    // 地域
    this.targetConfig['region']['sub'].forEach(item => {
      item['disabled'] = audienceData['allRegion'] !== 0 && item.value !== audienceData['allRegion'];
    });

    // 性别
    this.targetConfig['sex']['sub'].forEach(item => {
      item['disabled'] = audienceData['sex'] !== 0 && item.value !== audienceData['sex'];
    });
    // 意图词
    this.targetConfig['keywords']['sub'].forEach(item => {
      item['disabled'] = audienceData['pa_keywords'] !== '0' && item.value !== audienceData['pa_keywords'];
    });
    // app
    this.targetConfig['app']['sub'].forEach(item => {
      item['disabled'] = this.editDefaultDataOption.app.value !== 'all' && item.value !== this.editDefaultDataOption.app.value;
    });
    // 媒体
    this.targetConfig['media_orientation']['sub'].forEach(item => {
      item['disabled'] = this.editDefaultDataOption.media_orientation.value !== '0' && item.value !== this.editDefaultDataOption.media_orientation.value;
    });
    //人生阶段
    this.editDefaultDataOption['life_stage']['sub'].forEach(item => {
      item['disabled'] = this.editDefaultDataOption.life_stage.value === 'custom' && item.value === 'nolimit';
    });


    // 年龄
    if (audienceData['age'].length > 0) {
      if (audienceData['age'].indexOf(-1) < 0) {
        this.editDefaultDataOption.age.disabled = true;
        this.targetConfig['age'].sub[1]['sub'].forEach(subItem => {
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
    this.targetConfig['net']['sub'].forEach(item => {
      item['disabled'] = audienceData['net'] !== '0' && item.value !== audienceData['net'];
    });
    //仅投放至允许调起的媒体
    this.targetConfig['deeplink_only']['sub'].forEach(item => {
      item['disabled'] = item.value !== audienceData['deeplink_only'];
    });
    //定向逻辑
    this.targetConfig['behavior']['sub'].forEach(item => {
      item['disabled'] = item.value !== audienceData['behavior'];
    });
    //媒体定向逻辑
    this.targetConfig['media_type']['sub'].forEach(item => {
      item['disabled'] = item.value !== audienceData['media_type'];
    });
    //用户到访类型
    this.targetConfig['user_action_type']['sub'].forEach(item => {
      item['disabled'] = item.value !== audienceData['user_action_type'];
    });
    //意图词用户行为
    this.targetConfig['keywords_extend']['sub'].forEach(item => {
      item['disabled'] = audienceData['keywords_extend'] !== '1' && item.value !== audienceData['keywords_extend'];
    });


    // 平台
    if (audienceData['device'].length > 0) {
      this.targetConfig['device'].sub.forEach(subItem => {
        if (audienceData['device'].indexOf(subItem['value']) > -1) {
          this.editDefaultDataOption.device['disabled'] = true;
        } else {
          subItem['disabled'] = true;
        }
      });
    }
    // 学历
    if (audienceData['education'].length > 0) {
      this.targetConfig['education'].sub.forEach(subItem => {
        if (audienceData['education'].indexOf(subItem['value']) > -1) {
          this.editDefaultDataOption.education['disabled'] = true;
        } else {
          subItem['disabled'] = true;
        }
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
          "value": "1"
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
            if (this.curAccountList) {
              this.accountsList = deepCopy(this.accountsList.filter(item => this.curAccountList.indexOf(item.chan_pub_id) !== -1));
            }
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

  changeAccount(ids, type, val?) {
    if (type === 'audience') {
      if (ids.length > 0) {
        ids.forEach((item, index) => {
          const data = this.accountsList.find(value => value.chan_pub_id === item);
          if (data && !this.curAccountsList.find(s_item => s_item.id === item)) {
            this.curAccountsList.push({
              name: data.pub_account_name,
              id: data.chan_pub_id,
              crowdResultList: [],
              excludeCrowdResultList: []
            });
            this.getTargetAudience(this.curAccountsList[index]);
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
    } else if (type === 'media') {
      if (ids.length > 0) {
        ids.forEach((item, index) => {
          const data = this.accountsList.find(value => value.chan_pub_id === item);
          if (data && !this.mediaAccountsList.find(s_item => s_item.id === item)) {
            this.mediaAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, media_type: '0', media: { list: [], resultData: [] } });
            if (val) {
              this.getMediaPackages(this.mediaAccountsList[index], val);
            }
          }
        });

        this.mediaAccountsList.forEach((item, index) => {
          const data = ids.find(value => value === item.id);
          if (!data) {
            this.mediaAccountsList.splice(index, 1);
          }
        });
      } else {
        this.mediaAccountsList = [];
      }

    } else if (type === 'keywords') {
      if (ids.length > 0) {
        ids.forEach((item, index) => {
          const data = this.accountsList.find(value => value.chan_pub_id === item);
          if (data && !this.keyAccountsList.find(s_item => s_item.id === item)) {
            this.keyAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, wtpsList: [], recmList: [], recmData: [], keywords_search_name: '', keywords: { group_id: null, resultData: [], text: '' } });
            this.getKeywordsList(this.keyAccountsList[index]);
            this.getRecmWordsList(this.keyAccountsList[index]);
          }
        });

        this.keyAccountsList.forEach((item, index) => {
          const data = ids.find(value => value === item.id);
          if (!data) {
            this.keyAccountsList.splice(index, 1);
          }
        });
      } else {
        this.keyAccountsList = [];
      }

    } else if (type==='app') {
      if (ids.length > 0) {
        ids.forEach((item, index) => {
          const data = this.accountsList.find(value => value.chan_pub_id === item);
          if (data && !this.appAccountsList.find(s_item => s_item.id === item)) {
            this.appAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, app_ids: [],list: [] });
            this.getAppByName(this.appAccountsList[index]);
          }
        });
        this.appAccountsList.forEach((item, index) => {
          const data = ids.find(value => value === item.id);
          if (!data) {
            this.appAccountsList.splice(index, 1);
          }
        });
      } else {
        this.appAccountsList = [];
      }
    }

  }

  getTargetAudience(value) {
    const getTargetAudience = this.launchRpaService.getTargetCrowdByBd({
      chan_pub_id: value.id,
    });
    getTargetAudience.subscribe(result => {
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

  intentionWordGroupChange(event, combineData, key) {
    const data = combineData.wtpsList.find(item => item.wtp_id === key.group_id);
    key.text = data.keywords;
  }

  getRecmWordsList(value) {
    const body = {
      chan_pub_id: value.id,
      query: value.keywords_search_name,
    };
    this.launchRpaService.getWordListBd(body).subscribe(results => {
      if (results.status_code !== 200) {

      } else {
        if (results.data['keywords'].length > 0) {
          const crowd = [];
          results['data']['keywords'].forEach(item => {
            crowd.push({
              title: item.keyWord,
              key: item.keyWord,
              isLeaf: true
            });
          });
          value.recmList = deepCopy(crowd);
        } else {
          value.recmList = [];
        }
      }
    });
  }
  getKeywordsList(value) {
    this.launchRpaService.getWtpsLists({ chan_pub_id: value.id }).subscribe(results => {
      if (results.status_code !== 200) {

      } else {
        if (results.data.length > 0) {
          value.wtpsList = results.data;
        } else {
          value.wtpsList = [];
        }
      }
    });
  }
  getMediaPackages(value, val?) {
    if (val == 1) {
      this.launchRpaService.getCustomMediaPackagesBd({ chan_pub_id: value.id, company_id: this.authService.getCurrentUser().company_id, media_type: this.editDefaultDataOption.media_type }).subscribe(results => {
        if (results.status_code !== 200) {

        } else {
          value.media.list = results.data;
          value.media.resultData = [...value.media.resultData];
        }
      });
    } else {
      this.launchRpaService.getMediaPackagesBd({ chan_pub_id: value.id, media_type: value.media_type }).subscribe(results => {
        if (results.status_code !== 200) {

        } else {
          value.media.list = results.data;
          value.media.resultData = [...value.media.resultData];
        }
      });
    }
  }
  getRegionList(type) {
    this.launchRpaService.getLaunchTargetRegionBd({ "region_type": type }).subscribe(results => {
      if (results.status_code !== 200) {

      } else {
        switch (type) {
          case 'region':
            this.editDefaultDataOption.cityList.list = results.data;
            this.allCity[0] = true;
            break;
          case 'biz_area':
            this.allCity[1] = true;
            this.editDefaultDataOption.countyList.list = results.data;
            break;
          case 'place':
            this.allCity[2] = true;
            this.editDefaultDataOption.placeList.list = results.data;
            break;
        }
      }
    });
  }



  treeMediaOnCheck(event: NzFormatEmitEvent, value): void {
    value.media.resultData = [...event.keys];
  }
  addText(value) {
    let dataValid = true;
    const inputValueAry = value.text.split(/[\s,\/,',']+/g); // 根据换行或者回车进行识别
    inputValueAry.forEach((item, idx) => {
      if (item.replace(/[\u0391-\uFFE5]/g, "aa").length > 80) {
        dataValid = false;
      }
      if (!item) {
        inputValueAry.splice(idx, 1);
      }
    });

    if (!dataValid) {
      this.message.error('每个意图词不超过40个字');
      return false;
    }

    inputValueAry.forEach(item => {
      if (item.length && value.resultData.indexOf(item) === -1) {
        value.resultData.push(item);
      }
    });
    value.text = '';
  }
  clearInput(value) {
    value.resultData = [];
  }
  treeKewordsOnCheck(event: NzFormatEmitEvent, data): void {
    data.recmData = [...event.keys];
    data['keywords'].text = event.keys.join(',');
  }
  ftypesChange(event) {
    this.editDefaultDataOption.ftypes.resultData = [];
    event.forEach(item => {
      if (item.checked) {
        this.editDefaultDataOption.ftypes.resultData.push(item.value);
      }
    });
  }
  changeAgeSlt(slot, type) {
    setTimeout(() => {
      if (slot.hasOwnProperty('sub') && isArray(slot['sub'])) {
        slot['sub'].forEach(item => {
          item["checked"] = false;
        });
      }
    });
  }
  generateRangeData(rangeKey, start, end, rangeOption = [], suffix = '', endLess = false): any {
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
  changeKeyType(event, type) {
    if (type === 'region') {
      this.cityText = ''; this.noHaveText = '';
      if (event == 3) {
        this.editDefaultDataOption.interest_keywords_audience = '0';
        this.curAccountList = [];
        this.keyAccountsList = [];
        this.editDefaultDataOption.interest.resultData = [];
      }
    } else if (type === 'ftypes') {
      if (event != '4') {
        this.editDefaultDataOption.media_orientation.value = '0';
        this.mediaAccountsList = [];
        this.targetConfig['device']['sub'].forEach(item => {
          if (item.value == '4') {
            item.disabled = false;
          }
        });
      } else {
        if (this.editDefaultDataOption.allRegion == 3) {
          this.editDefaultDataOption.allRegion = 0;
        }
        this.targetConfig['device']['sub'].forEach(item => {
          if (item.value == '4') {
            item.disabled = true;
            item.checked = false;
          }
        });
      }
    } else if (type === 'delivery_type') {
      if (event == '1') {
        if (this.editDefaultDataOption.media_orientation.value === 'custom_media_package') {
          this.editDefaultDataOption.media_orientation.value = '0';
          this.mediaAccountsList = [];
        }
      }
    } else {
      this.editDefaultDataOption.interest.resultData = [];
      this.curAccountList = [];
      this.keyAccountsList = [];
    }
  }
  treeAppCrowdOnCheck(event: NzFormatEmitEvent, type, value?): void {
    if (type === 'name') {
      const data=new Set([...value.app_ids,...event.keys]);
      value.app_ids=[...data];
      for (let index=0;index<value.app_ids.length;index++) {
        if (value.appList.find(s_item=>s_item.key===value.app_ids[index])&&!event.checkedKeys.find(c_item=>c_item.key===value.app_ids[index])) {
          value.app_ids.splice(index,1);
          value.list.splice(index,1);
          index--;
        } else {
          if (!value.list.find(l_item=>l_item.id===value.app_ids[index])) {
            value.list.push({
              id:value.app_ids[index],
              name:this.customAppMap[value.app_ids[index]],
            });
          }
        }
      }
      value.app_ids=[...value.app_ids];
    }
  }
  getAppByName(value, name?) {
    const body = {
      "chan_pub_id": value.id,
      "query": ""
    };
    if (this.editDefaultDataOption.app.search_name) {
      body.query = this.editDefaultDataOption.app.search_name;
    }
    value['appList']=[];
    this.launchRpaService.getAppByName(body).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        const crowd = [];
        result['data'].forEach(item => {
          this.customAppMap[item.pub_app_id]=item.pub_app_name;
          crowd.push({
            title: item.pub_app_name,
            key: item.pub_app_id,
            isLeaf: true
          });
        });
        value.appList = deepCopy(crowd);
        value.app_ids = deepCopy(value.app_ids);
      }
    });
  }
  deleteByIndex(data,index,type?) {
    if (type) {
      if (type==='app_ids') {
        data['app_ids']=[];
        data['list'].splice(index,1);
        data['list'].forEach(idData=> {
          data['app_ids'].push(idData.id);
        });
      }
      data[type]=deepCopy(data[type]);
    } else {
      data.splice(index,1);
    }
  }


}
