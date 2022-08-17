import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from "../../../../../../../core/service/auth.service";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { LaunchService } from "../../../../../service/launch.service";
import { zip } from "rxjs";
import { deepCopy } from "@jzl/jzl-util";
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-launch-target-basic-baidu',
  templateUrl: './launch-target-basic-baidu.component.html',
  styleUrls: ['./launch-target-basic-baidu.component.scss']
})
export class LaunchTargetBasicBaiduComponent implements OnInit {

  @Output() resultsChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() targetType;

  @Input() audienceTemplateId;

  @Input() childAudienceTemplateId;

  public activeType = {
    type: 'target'
  };

  public publisherId = 16;

  public defaultData: { audience_template_name: any, landing_type: any, parent_id?: any, audience_template_id?: any, audience_desc: any, audience_setting: any, delivery_range?: any, marketing_target?: any, flow_type?: any, opt_target?: any, target_setting?: any } = {
    audience_template_name: null,  // 定向包名称
    audience_desc: null, // 定向包描述
    landing_type: '1',
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
      label: "落地页",
      value: "1",
    },
    {
      label: "iOS app",
      value: "2",
    },
    {
      label: "安卓 app",
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
    }
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
  };

  public tableHeight = document.body.clientHeight - 60 - 65;

  public reInitTarget = true;

  public isLaunchPackage = false;

  public curAudienceData = {};

  constructor(private message: NzMessageService,
    private authService: AuthService,
    public launchRpaService: LaunchRpaService,
    private launchService: LaunchService,) { }

  ngOnInit(): void {
    this.getTargetConfigByBd();
    if (this.targetType === 'package' || this.targetType === 'packageEdit') {
      this.isLaunchPackage = true;
    }
    if ((this.targetType === 'basicEdit' || this.targetType === 'package') && this.audienceTemplateId) {
      this.getLaunchAudienceTemplateDetail(this.audienceTemplateId);
    }
    if (this.targetType === 'packageEdit' && this.audienceTemplateId && this.childAudienceTemplateId) {
      this.getEditData();
    }
  }
  getLaunchAudienceTemplateDetail(id) {
    this.getting = true;
    this.launchRpaService
      .getLaunchTargetTemplateDetailBd(id, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            const data = JSON.parse(JSON.stringify(result['data']));
            this.defaultData = { ...this.defaultData, ...data };
            if (this.targetType == 'package') {
              this.defaultData.audience_template_name = null;
              this.defaultData.audience_desc = '';
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
    this.resultsChange.emit({ isClose: type, parentId: id });
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
    if (!this.defaultData.audience_setting.age.length) {
      this.errorTipAry.age.is_show = true;
      isValid = true;
    } else {
      this.errorTipAry.age.is_show = false;
    }

    if (!this.defaultData.audience_setting.platform.length) {
      this.errorTipAry.platform.is_show = true;
      isValid = true;
    } else {
      this.errorTipAry.platform.is_show = false;
    }

    return isValid;
  }

  doSave() {
    if (!this.defaultData.audience_template_name) {
      this.message.error('请输入定向包名称');
      return false;
    }

    if (!this.saveing) {
      this.saveing = true;

      if ((this.targetType === 'basicEdit' || this.targetType === 'packageEdit')) {
        const id = this.targetType === 'basicEdit' ? this.audienceTemplateId : this.childAudienceTemplateId;
        this.launchRpaService
          .updateLaunchAudienceTemplateBd(this.defaultData, id, {
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
          .addLaunchAudienceTemplateBd(this.defaultData, {
            cid: this.cid,
          })
          .subscribe(
            (result: any) => {
              if (result.status_code && result.status_code === 200) {
                this.message.success('操作成功');
                this.doCancel('create', this.targetType === 'basic' ? "" : this.audienceTemplateId);
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
      .getFeedTargetConfigByBd({
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

  change() {
  }


}
