import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from "../../../../../../../core/service/auth.service";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { LaunchService } from "../../../../../service/launch.service";
import { zip } from "rxjs";
import { deepCopy } from "@jzl/jzl-util";
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-launch-target-basic-bd',
  templateUrl: './launch-target-basic-bd.component.html',
  styleUrls: ['./launch-target-basic-bd.component.scss']
})
export class LaunchTargetBasicBdComponent implements OnInit {

  @Output() resultsChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() targetType;

  @Input() audienceTemplateId;

  @Input() childAudienceTemplateId;
  @Input() landingType;
  @Input() ftypes;
  @Input() curAccountList;

  public activeType = {
    type: 'target'
  };

  public publisherId = 16;

  public defaultData: { audience_template_name: any, landing_type: any, parent_id?: any, audience_template_id?: any, audience_desc: any, audience_setting: any, delivery_type?: any, ftypes?: any, ftypes_type?: any, target_setting?: any } = {
    audience_template_name: null,  // 定向包名称
    audience_desc: null, // 定向包描述
    landing_type: '1',
    delivery_type: '0',
    ftypes_type: '0',
    ftypes: ['0'],
    parent_id: 0,
    audience_setting: {},
    target_setting: {},
  };

  public campaignTypeSetting = {
    launch_target: 'landing_page',
    operating_system: 'ios',
  };

  public objective_type = [
    {
      label: "网站链接",
      value: "1",
    },
    {
      label: "应用推广-IOS",
      value: "2",
    },
    {
      label: "应用推广-Android",
      value: "3",
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
  public plan_type = [
    {
      label: "提升应用安装",
      value: '2',
    },
    {
      label: "获取电商下单",
      value: '3',
    },
    {
      label: "推广品牌活动",
      value: '4',
    },
    {
      label: "收集销售线索",
      value: '5',
    },
    {
      label: "商品推广",
      value: '6',
    },
    {
      label: "提高应用活跃",
      value: '7',
    }
  ];

  public editDefaultDataOption = {
    age: [],      //  年龄
    gender: -1,     // 性别
    allRegion: 1,      //  投放地域
    region: [],     //  地域id
    app_category: [],     // app分类
    audience_targeting: -1,     //  自定义人群
    include_audience: [],     //  包含人群
    exclude_audience: [],     //  排除人群
    interest: [],     //  兴趣
    network_env: "11",      //  网络环境
    platform: [],     //  操作系统
    auto_expand: [],      //  智能定向升级
    intelli_targeting: 500,      //  用户智能
    app_category_slt: 'nolimit',  // 是否指定app分类
    interest_slt: 'nolimit',  // 是否指定兴趣分类
    cityList: {
      list: [],
      resultData: []
    },
    countyList: {
      list: [],
      resultData: []
    },
    ageList: {
      resultData: [],
      checked: true,
      disabled: false,
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
    ftypes: {
      "name": "投放范围",
      "value": 0,
      resultData: [],
      "sub": [
        {
          "label": "默认",
          "value": '0',
          "checked": true
        },
        {
          "label": "百青藤",
          "value": '4',
          "checked": false
        },
        {
          "label": "自定义",
          "value": '2',
          "checked": false,
          "sub": [
            {
              "label": "百度信息流",
              "value": '1',
              "checked": false
            },
            {
              "label": "贴吧",
              "value": '2',
              "checked": false
            },
            {
              "label": "好看视频",
              "value": '8',
              "checked": false
            },
            {
              "label": "百度小说",
              "value": '64',
              "checked": false
            }
          ]
        }
      ]
    },
    delivery_type: {
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
  };

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

  public isCopy = false;

  public targetConfig;

  public errorTipAry = {
    platform: {
      is_show: false,
      tip_text: '请选择操作系统'
    },  // 操作系统
    age: {
      is_show: false,
      tip_text: '请选择年龄范围'
    },  // 年龄
    region: {
      is_show: false,
      tip_text: '请选择地域'
    },  // 地域
    keywords: {
      is_show: false,
      tip_text: '请添加意图词'
    },  // 抖音达人
    media: {
      is_show: false,
      tip_text: '请选择媒体'
    },
    audience_targeting: {
      is_show: false,
      tip_text: '请选择人群包'
    },
    app: {
      is_show: false,
      tip_text: '请选择app行为'
    },
    interest: {
      is_show: false,
      tip_text: '请选择兴趣'
    },
    life_stage: {
      is_show: false,
      tip_text: '请选择人生阶段'
    },
  };


  public tableHeight = document.body.clientHeight - 60 - 65;

  public reInitTarget = true;

  public isLaunchPackage = false;

  public curAudienceData = {};

  constructor(
    private message: NzMessageService,
    public launchRpaService: LaunchRpaService,
  ) { }

  ngOnInit(): void {
    if (this.landingType) {
      this.defaultData.landing_type = this.landingType + '';
    }
    if (this.ftypes) {
      if ([0, 4].indexOf(this.ftypes[0]) === -1) {
        this.defaultData.ftypes_type = '2';
        this.defaultData.ftypes = [];
        this.editDefaultDataOption.ftypes.sub[2].sub.forEach(item => {
          if (this.ftypes.indexOf(Number(item.value)) !== -1) {
            item['checked'] = true;
            this.defaultData.ftypes.push(item.value);
          }
        });
      } else {
        this.defaultData.ftypes_type = this.ftypes[0] + '';
        this.defaultData.ftypes = [this.ftypes[0] + ''];
      }
    }
    this.getTargetConfigByBd();
    if ((this.targetType === 'basicEdit') && this.audienceTemplateId) {
      this.getLaunchAudienceTemplateDetail(this.audienceTemplateId);
    }
  }
  getLaunchAudienceTemplateDetail(id) {
    this.getting = true;
    this.launchRpaService
      .getLaunchAudienceTemplateDetailBd(id, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            const data = JSON.parse(JSON.stringify(result['data']));
            this.defaultData = { ...this.defaultData, ...data };
            this.defaultData.ftypes = JSON.parse(this.defaultData.ftypes);
            if (this.defaultData.ftypes_type === '2') {
              this.editDefaultDataOption.ftypes.sub[2].sub.forEach(item => {
                item['checked'] = this.defaultData.ftypes.indexOf(item.value) !== -1;
              });
            }

            if (this.isCopy) {
              this.defaultData.audience_template_id = null;
              this.defaultData.audience_template_name = this.defaultData.audience_template_name + '-1';
            }
          } else if (result.status_code && result.status_code === 205) {

          } else {
            this.message.error(result.message);
          }
          this.getting = false;
        },
        (err: any) => {
          this.getting = false;
        },
        () => { },
      );
  }

  landingTypeChange() {
    this.defaultData.audience_setting = {};
    this.defaultData.target_setting = {};
  }

  getEditData() {
    const getParentTarget = this.launchRpaService.getTargetDetailByBd(this.audienceTemplateId, { cid: this.cid });
    const getChildTarget = this.launchRpaService.getTargetDetailByBd(this.childAudienceTemplateId, { cid: this.cid });
    zip(getParentTarget, getChildTarget).subscribe(([parentTargetData, childTargetData]) => {
      if (parentTargetData['status_code'] && parentTargetData['status_code'] === 200) {
        const data = JSON.parse(JSON.stringify(parentTargetData['data']));
        this.defaultData.target_setting = data.audience_setting;
      }
      if (childTargetData['status_code'] && childTargetData['status_code'] === 200) {
        const data = JSON.parse(JSON.stringify(childTargetData['data']));
        this.defaultData.audience_template_name = data.audience_template_name;
        this.defaultData.audience_desc = data.audience_desc;
        this.defaultData.landing_type = data.landing_type;
        this.defaultData.audience_setting = data.audience_setting;
        this.curAudienceData = deepCopy(childTargetData['data']);
      }

    }, (err) => {

    });
  }

  doCancel(type?, id?) {
    this.resultsChange.emit({ isClose: type, audience_template_id: id });
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
    if (type === 'age') {
      this.editDefaultDataOption.ageList.checked = false;
      this.editDefaultDataOption.ageList.resultData = [];
      if (data.every(item => !item.checked)) {
        this.editDefaultDataOption.ageList.checked = true;
        this.editDefaultDataOption.ageList.resultData = [-1];
      } else {
        data.forEach(item => {
          if (item.checked) {
            this.editDefaultDataOption.ageList.resultData.push(item.value);
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
      this.editDefaultDataOption.platformList.checked = false;
      this.editDefaultDataOption.platformList.resultData = [];
      if (this.defaultData.landing_type === '1') {
        if (data.every(item => !item.checked)) {
          this.editDefaultDataOption.platformList.checked = true;
          this.editDefaultDataOption.platformList.resultData = ['111'];
        } else {
          data.forEach(item => {
            if (item.checked) {
              this.editDefaultDataOption.platformList.resultData.push(item.value);
            }
          });
        }
      }
    }
  }

  changeNoLimit(type) {
    if (type === 'age') {
      if (!this.editDefaultDataOption.ageList.checked) {
        this.editDefaultDataOption.ageList.resultData = [];
      } else {
        this.editDefaultDataOption.ageList.resultData = [-1];
        this.targetConfig['age']['sub'].forEach(item => {
          item.checked = false;
        });
      }

    } else if (type === 'platform') {
      if (!this.editDefaultDataOption.platformList.checked) {
        this.editDefaultDataOption.platformList.resultData = [];
      } else {
        this.editDefaultDataOption.platformList.resultData = ['111'];
        this.targetConfig['platform']['sub'].forEach(item => {
          item.checked = false;
        });
      }
    }
  }

  checkBasicData() {
    let isValid = false;

    if (this.defaultData.audience_setting['interest_keywords_audience'] == '2' && Object.keys(this.defaultData.audience_setting['crowd']).length > 0) {
      this.errorTipAry.audience_targeting.is_show = false;
      Object.keys(this.defaultData.audience_setting['crowd']).forEach(item => {
        if (this.defaultData.audience_setting['crowd'][item]['exclude'].length || this.defaultData.audience_setting['crowd'][item]['include'].length) {
        } else {
          isValid = true;
          this.errorTipAry.audience_targeting.is_show = true;
        }
      });
    }
    if (this.defaultData.audience_setting['interest_keywords_audience'] == '1') {
      if (this.defaultData.audience_setting['interest'].length === 0) {
        isValid = true;
        this.errorTipAry.interest.is_show = true;
      } else {
        this.errorTipAry.interest.is_show = false;
      }
    }
    if (this.defaultData.audience_setting['app']['type'] === 'category') {
      if (this.defaultData.audience_setting['app']['list'].length === 0) {
        isValid = true;
        this.errorTipAry.app.is_show = true;
      } else {
        this.errorTipAry.app.is_show = false;
      }
    }
    if (this.defaultData.audience_setting['app']['type'] === 'custom' && Object.keys(this.defaultData.audience_setting['app']['custom_list']).length > 0) {
      this.errorTipAry.app.is_show = false;
      Object.keys(this.defaultData.audience_setting['app']['custom_list']).forEach(item => {
        if (this.defaultData.audience_setting['app']['custom_list'][item].length) {
          if (this.defaultData.audience_setting['app']['custom_list'][item].length>100) {
            isValid = true;
            this.errorTipAry.app.tip_text = '所选app行为数量不能超过100';
          }
        } else {
          isValid = true;
          this.errorTipAry.app.tip_text = '请选择app行为';
          this.errorTipAry.app.is_show = true;
        }
      });
    }
    if (this.defaultData.audience_setting['allRegion'] != 0 && this.defaultData.audience_setting['region'].length === 0) {
      isValid = true;
      this.errorTipAry.region.is_show = true;
    } else {
      this.errorTipAry.region.is_show = false;
    }
    if (this.defaultData.audience_setting['life_stage_slt'] === 'custom' && this.defaultData.audience_setting['life_stage'].length === 0) {
      isValid = true;
      this.errorTipAry.life_stage.is_show = true;
    } else {
      this.errorTipAry.life_stage.is_show = false;
    }
    if (this.defaultData.audience_setting['interest_keywords_audience'] == '1' && Object.keys(this.defaultData.audience_setting['keywords']).length > 0) {
      this.errorTipAry.keywords.is_show = false;
      Object.keys(this.defaultData.audience_setting['keywords']).forEach(item => {
        if (this.defaultData.audience_setting['keywords'][item].length) {
        } else {
          isValid = true;
          this.errorTipAry.keywords.is_show = true;
        }
      });
    }
    if (this.defaultData.audience_setting['media_orientation_slt'] != '0' && Object.keys(this.defaultData.audience_setting['media_orientation']).length > 0) {
      this.errorTipAry.media.is_show = false;
      Object.keys(this.defaultData.audience_setting['media_orientation']).forEach(item => {
        if (this.defaultData.audience_setting['media_orientation'][item]['resultData'].length) {
        } else {
          isValid = true;
          this.errorTipAry.media.is_show = true;
        }
      });
    }

    return isValid;
  }

  doSave() {
    if (!this.defaultData.audience_template_name) {
      this.message.error('请输入定向包名称');
      return false;
    }

    const isVild = this.checkBasicData();

    if (isVild) {
      this.message.error('请完善信息');
      return;
    }


    if (!this.saveing) {
      this.saveing = true;

      if ((this.targetType === 'basicEdit' || this.targetType === 'packageEdit')) {
        const id = this.targetType === 'basicEdit' ? this.audienceTemplateId : this.childAudienceTemplateId;
        this.launchRpaService
          .updateLaunchTargetTemplateBd(this.defaultData, id, {
            cid: this.cid,
            publisher_id: this.publisherId,
          })
          .subscribe(
            (result: any) => {
              if (result.status_code && result.status_code === 200) {
                this.message.success('操作成功');
                this.doCancel('edit', this.audienceTemplateId);
              } else if (result.status_code && result.status_code === 205) {

              } else {
                this.message.error(result.message);
              }
              this.saveing = false;
            },
            (err: any) => {
              this.saveing = false;
            },
            () => { },
          );
      } else {
        this.defaultData.parent_id = this.targetType === 'package' ? this.audienceTemplateId : 0;
        this.launchRpaService
          .addLaunchTargetTemplateBd(this.defaultData, {
            cid: this.cid,
          })
          .subscribe(
            (result: any) => {
              if (result.status_code && result.status_code === 200) {
                this.message.success('操作成功');
                this.doCancel('create', result['data']['audience_template_id']);
              } else if (result.status_code && result.status_code === 205) {

              } else {
                this.message.error(result.message);
              }
              this.saveing = false;
            },
            (err: any) => {
              this.saveing = false;
            },
            () => { },
          );
      }

    }
  }

  getTargetConfigByBd() {
    this.launchRpaService
      .getFeedTargetConfigBd({
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code !== 200) {
            if (results.status_code !== 205) {
              this.message.error(results.message);
            }
          } else {
            this.targetConfig = { ...results.data };
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }
  ftypesChange(event) {
    this.defaultData.ftypes = [];
    event.forEach(item => {
      if (item.checked) {
        this.defaultData.ftypes.push(item.value);
      }
    });
  }
}
