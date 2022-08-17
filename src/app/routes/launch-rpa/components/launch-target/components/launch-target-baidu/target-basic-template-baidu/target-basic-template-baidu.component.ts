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
  selector: 'app-target-basic-template-baidu',
  templateUrl: './target-basic-template-baidu.component.html',
  styleUrls: ['./target-basic-template-baidu.component.scss'],
  providers: [MaterialsService]
})
export class TargetBasicTemplateBaiduComponent implements OnInit, OnChanges, AfterViewChecked {

  @ViewChild('curTextArea') curTextArea: ElementRef;
  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;
  @Input() targetConfig;
  @Input() curAudienceData;
  @Input() data;
  @Input() targetType;
  @Input() isLaunchPackage;
  @Input() objectiveType;

  public isInitSingleDataFinshed = false;
  public isIntentionWordChanged = false;
  public cursorPosition = 0;
  public allCity = null;

  public cityLoading = true;
  public countryLoading = true;
  public placeLoading = true;
  public cityText = '';
  public noHaveText = '';
  public kwdText = '';
  public searchCrowdValue = '';
  public searchExcludeValue = '';

  public accountsList = [];
  public curAccountsList = [];
  public accounts = [];
  public keyAccounts = [];
  public mediaAccounts = [];
  public keyAccountsList = [];
  public mediaAccountsList = [];

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

  public errorTipAry = {
    device: {
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
    education: {
      resultData: [],
      checked: true,
      disabled: false,
    },//  学历
    excludeTrans: '0',
    sex: 0,     // 性别
    allRegion: 0,      //  投放地域
    region: [],     //  地域id
    net: "0",      //  网络环境
    iosVersion: '0',
    androidVersion: '0',
    lifeStage: {
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
    keywordsExtend: '1',//无效意图词过滤
    autoExpansion: '0',//自动扩量
    deeplinkOnly: '0',
    behavior: '2',
    mediaType: '1',
    mediaPackage: '0',
    mediaOrientation: {
      value: '0',
      resultData: [],
    },//媒体
    pa_keywords: '0',
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
      list: [],
      resultData: []
    },
    app: {
      value: 'all',
      behavior: 2,
      list: [],
      resultData: []
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

  constructor(private message: NzMessageService,
    private authService: AuthService,
    public launchRpaService: LaunchRpaService,
    private launchService: LaunchService,
    private materialsService: MaterialsService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.getRegionList();
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
    resultData['mediaOrientation'] = {};
    resultData['age'] = [];
    resultData['device'] = [];
    resultData['education'] = [];
    resultData['app'] = {};
    resultData['app']['type'] = this.editDefaultDataOption.app.value;
    resultData['app']['behavior'] = [this.editDefaultDataOption.app.behavior];
    resultData['app']['list'] = [];
    if (this.editDefaultDataOption.app.resultData.length > 0) {
      this.editDefaultDataOption.app.resultData.forEach(id => {
        resultData['app']['list'].push({ id: id });
      });
    }
    resultData['excludeTrans'] = this.editDefaultDataOption.excludeTrans;
    resultData['mediaOrientation_slt'] = this.editDefaultDataOption.mediaOrientation.value;
    resultData['interest_slt'] = this.editDefaultDataOption.interest.value;
    resultData['pa_keywords'] = this.editDefaultDataOption.pa_keywords;
    resultData['sex'] = this.editDefaultDataOption.sex;
    resultData['allRegion'] = this.editDefaultDataOption.allRegion;
    resultData['region'] = this.editDefaultDataOption.region;
    resultData['androidVersion'] = this.editDefaultDataOption.androidVersion;
    resultData['iosVersion'] = this.editDefaultDataOption.iosVersion;
    resultData['lifeStage'] = this.editDefaultDataOption.lifeStage.resultData;
    resultData['interest'] = this.editDefaultDataOption.interest.resultData;
    resultData['net'] = this.editDefaultDataOption.net;
    resultData['audience_targeting'] = this.editDefaultDataOption.targeting_audience.value;
    resultData['keywordsExtend'] = this.editDefaultDataOption.keywordsExtend;
    resultData['autoExpansion'] = this.editDefaultDataOption.autoExpansion;
    resultData['deeplinkOnly'] = this.editDefaultDataOption.deeplinkOnly;
    resultData['behavior'] = this.editDefaultDataOption.behavior;
    resultData['mediaType'] = this.editDefaultDataOption.mediaType;
    if (this.editDefaultDataOption.age.checked && this.editDefaultDataOption.age.disabled) {
      resultData['age'] = curAudienceData['audience_setting']['age'];
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
    if (this.curAccountsList.length > 0) {
      this.curAccountsList.forEach(item => {
        resultData['crowd'][item.id] = {
          exclude: item.excludeCrowdResultList ? item.excludeCrowdResultList : [],
          include: item.crowdResultList ? item.crowdResultList : [],
        };
      });
    }
    if (this.editDefaultDataOption.mediaOrientation.value !== 'mediaCategories') {
      if (this.mediaAccountsList.length > 0) {
        this.mediaAccountsList.forEach(item => {
          resultData['mediaOrientation'][item.id] = {
            resultData: item.media['resultData'],
            media_type: item.media_type
          };
        });
      }
    } else {
      resultData['mediaOrientation']['all'] = this.editDefaultDataOption.mediaOrientation.resultData;
    }

    if (this.keyAccountsList.length > 0) {
      this.keyAccountsList.forEach(item => {
        resultData['keywords'][item.id] = item.keywords.resultData.join(',');
        resultData['keywordAccount'][item.id] = item.keywords;
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
      if (Object.keys(basicData['mediaOrientation']).length) {
        for (const item of Object.keys(basicData['mediaOrientation'])) {
          const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
          if (index !== -1 && !this.mediaAccountsList.find(s_item => s_item.id === item)) {
            this.mediaAccounts.push(Number(item));
            if (basicData.mediaOrientation_slt === 'mediaPackage') {
              const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, media_type: basicData['mediaOrientation'][item]['media_type'], media: { list: [], resultData: basicData['mediaOrientation'][item].resultData } };
              this.mediaAccountsList.push(obj);
              this.getMediaPackages(obj);
            } else if (basicData.mediaOrientation_slt === 'customMediaPackage') {
              const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, media_type: null, media: { list: [], resultData: basicData['mediaOrientation'][item].resultData } };
              this.mediaAccountsList.push(obj);
              this.getMediaPackages(obj, 1);
            }

          } else {
            this.editDefaultDataOption.mediaOrientation.resultData = basicData.mediaOrientation[item];
          }
        }
      }
      if (Object.keys(basicData['keywords']).length) {
        this.editDefaultDataOption.pa_keywords = '1';
        for (const item of Object.keys(basicData['keywords'])) {
          const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
          if (index !== -1 && !this.keyAccountsList.find(s_item => s_item.id === item)) {
            this.keyAccounts.push(Number(item));
            const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, list: [], keywords: basicData['keywordAccount'][item] };
            this.keyAccountsList.push(obj);
            this.getKeywordsList(obj);
          }
        }
      }
      basicData.allRegion == 1 ? this.editDefaultDataOption.cityList.resultData = basicData.region : basicData.allRegion == 2 ? this.editDefaultDataOption.countyList.resultData = basicData.region : this.editDefaultDataOption.placeList.resultData = basicData.region;
      this.editDefaultDataOption.age.resultData = basicData.age;
      this.editDefaultDataOption.allRegion = basicData.allRegion;
      this.editDefaultDataOption.sex = basicData.sex;
      this.editDefaultDataOption.region = basicData.region;
      this.editDefaultDataOption.net = basicData.net;
      this.editDefaultDataOption.targeting_audience.value = basicData.audience_targeting;
      this.editDefaultDataOption.pa_keywords = basicData.pa_keywords;
      this.editDefaultDataOption.keywordsExtend = basicData.keywordsExtend;
      this.editDefaultDataOption.autoExpansion = basicData.autoExpansion;
      this.editDefaultDataOption.deeplinkOnly = basicData.deeplinkOnly;
      this.editDefaultDataOption.behavior = basicData.behavior;
      this.editDefaultDataOption.mediaType = basicData.mediaType;
      this.editDefaultDataOption.androidVersion = basicData.androidVersion;
      this.editDefaultDataOption.iosVersion = basicData.iosVersion;
      this.editDefaultDataOption.device.resultData = basicData.device;
      this.editDefaultDataOption.mediaOrientation.value = basicData.mediaOrientation_slt;
      this.editDefaultDataOption.interest.value = basicData.interest_slt;
      this.editDefaultDataOption.interest.resultData = basicData.interest;
      this.editDefaultDataOption.excludeTrans = basicData.excludeTrans;
      if (basicData['app']) {
        this.editDefaultDataOption.app.value = basicData['app']['type'];
        this.editDefaultDataOption.app.behavior = basicData['app']['behavior'][0];
        basicData['app']['list'].forEach(item => {
          this.editDefaultDataOption.app.resultData.push(item.id);
        });
      }
      if (basicData.age) {
        this.targetConfig['age']['sub'][1]['sub'].forEach(item => {
          if (basicData.age.indexOf(item.value) !== -1) {
            item.checked = true;
            this.editDefaultDataOption.age.checked = false;
          }
        });
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

      if (basicData.lifeStage && basicData.lifeStage.length > 0) {
        this.editDefaultDataOption.lifeStage.value = 'custom';
        this.editDefaultDataOption.lifeStage.resultData = basicData.lifeStage;
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
    if (audienceData['mediaOrientation']) {
      this.targetConfig['mediaOrientation']['sub'].forEach(item => {
        item['disabled'] = audienceData['mediaOrientation'] !== '0' && item.value !== audienceData['mediaOrientation'];
      });
    }
    //商品定向
    this.targetConfig['keywords']['sub'].forEach(item => {
      item['disabled'] = audienceData['pa_keywords'] == '1' && item.value == '0';
    });

    //无效意图词过滤
    this.targetConfig['keywordsExtend']['sub'].forEach(item => {
      item['disabled'] = audienceData['keywordsExtend'] !== item.value;
    });
    //排除已转化人群
    this.targetConfig['excludeTrans']['sub'].forEach(item => {
      item['disabled'] = audienceData['excludeTrans'] !== '0' && audienceData['excludeTrans'] !== item.value;
    });
    //自动扩量
    this.targetConfig['autoExpansion']['sub'].forEach(item => {
      item['disabled'] = audienceData['autoExpansion'] !== item.value;
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
    this.targetConfig['mediaOrientation']['sub'].forEach(item => {
      item['disabled'] = this.editDefaultDataOption.mediaOrientation.value !== '0' && item.value !== this.editDefaultDataOption.mediaOrientation.value;
    });
    //人生阶段
    this.editDefaultDataOption['lifeStage']['sub'].forEach(item => {
      item['disabled'] = this.editDefaultDataOption.lifeStage.value === 'custom' && item.value === 'nolimit';
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
    this.targetConfig['deeplinkOnly']['sub'].forEach(item => {
      item['disabled'] = item.value !== audienceData['deeplinkOnly'];
    });
    //定向逻辑
    this.targetConfig['behavior']['sub'].forEach(item => {
      item['disabled'] = item.value !== audienceData['behavior'];
    });
    //媒体定向逻辑
    this.targetConfig['mediaType']['sub'].forEach(item => {
      item['disabled'] = item.value !== audienceData['mediaType'];
    });
    //意图词用户行为
    this.targetConfig['keywordsExtend']['sub'].forEach(item => {
      item['disabled'] = audienceData['keywordsExtend'] !== '1' && item.value !== audienceData['keywordsExtend'];
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
            this.getMediaPackages(this.mediaAccountsList[index], val);
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
            this.keyAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, list: [], keywords: { group_id: null, resultData: [], text: '' } });
            this.getKeywordsList(this.keyAccountsList[index]);
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

    }

  }

  getTargetAudience(value) {
    const getTargetAudience = this.launchRpaService.getTargetAudienceByBd({
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
    const data = combineData.list.find(item => item.wtp_id === key.group_id);
    key.text = data.keywords;
  }

  getKeywordsList(value) {
    this.launchRpaService.getKeywordsList({ chan_pub_id: value.id }).subscribe(results => {
      if (results.status_code !== 200) {

      } else {
        if (results.data.length > 0) {
          value.list = results.data;
        } else {
          value.list = [];
        }
      }
    });
  }
  getMediaPackages(value, val?) {
    if (val) {
      this.launchRpaService.getCustomMediaPackagesByBd({ chan_pub_id: value.id, company_id: this.authService.getCurrentUser().company_id }).subscribe(results => {
        if (results.status_code !== 200) {

        } else {
          value.media.list = results.data;
          value.media.resultData = [...value.media.resultData];
        }
      });
    } else {
      this.launchRpaService.getMediaPackagesByBd({ chan_pub_id: value.id, media_type: value.media_type }).subscribe(results => {
        if (results.status_code !== 200) {

        } else {
          value.media.list = results.data;
          value.media.resultData = [...value.media.resultData];
        }
      });
    }
  }
  getRegionList() {
    this.launchRpaService.getRegionListByBd({}).subscribe(results => {
      if (results.status_code !== 200) {

      } else {
        this.editDefaultDataOption.cityList.list = results.data['biz_region'];
        this.editDefaultDataOption.countyList.list = results.data['biz_area'];
        this.editDefaultDataOption.placeList.list = results.data['place'];
        this.editDefaultDataOption.interest.list = results.data['new_interests'];
        this.allCity = [];
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

}
