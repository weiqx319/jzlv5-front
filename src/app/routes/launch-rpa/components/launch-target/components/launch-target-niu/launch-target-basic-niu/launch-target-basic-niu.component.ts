import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from "../../../../../../../core/service/auth.service";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { LaunchService } from "../../../../../service/launch.service";
import { zip } from "rxjs";
import { deepCopy } from "@jzl/jzl-util";
import { MenuService } from "../../../../../../../core/service/menu.service";

@Component({
  selector: 'app-launch-target-basic-niu',
  templateUrl: './launch-target-basic-niu.component.html',
  styleUrls: ['./launch-target-basic-niu.component.scss']
})
export class LaunchTargetBasicNiuComponent implements OnInit {

  @Output() resultsChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() targetType;

  @Input() audienceTemplateId;

  @Input() childAudienceTemplateId;

  public activeType = {
    type: 'target'
  };

  public publisherId = 23;

  public defaultData: { audience_template_name: any, landing_type: any, inventory_type_list: any, parent_id?: any, audience_template_id?: any, audience_desc: any, audience_setting: any, delivery_range?: any, marketing_target?: any, flow_type?: any, target_setting?: any } = {
    audience_template_name: null,  // 定向包名称
    audience_desc: null, // 定向包描述
    landing_type: 13,//计划类型（营销目标）
    inventory_type_list: '',
    parent_id: 0,
    audience_setting: {},
    target_setting: {},
  };

  public plan_type = [
    {
      "label": "短视频推广",
      "value": 13,
    },
    {
      "label": "直播推广",
      "value": 14,
    }
  ];


  public getting = false;
  public saveing = false;

  public cid;

  public isCopy = false;

  public targetConfig;

  public checkErrorTip = {
    audience_template_name: {
      is_show: false,
      tip_text: '请填写定向包名称'
    },  // 年龄
    age: {
      is_show: false,
      tip_text: '请选择年龄范围'
    },  // 年龄
    interest_level: {
      is_show: false,
      tip_text: '请选择购物意图'
    },
    purchase_level: {
      is_show: false,
      tip_text: '请选择行为类型'
    },
    behavior_list: {
      is_show: false,
      tip_text: '请选择行为类型'
    },
    fans_star: {
      is_show: false,
      tip_text: '请选择快手网红'
    },
  };

  public templateHeight = document.body.clientHeight - 60 - 65;

  public reInitTarget = true;

  public isLaunchPackage = false;

  public curAudienceData = {};

  constructor(private message: NzMessageService,
    private authService: AuthService,
    public launchRpaService: LaunchRpaService,
    private launchService: LaunchService,
    public menuService: MenuService,
  ) {
    this.publisherId = this.menuService.currentPublisherId;
  }
  onWindowResize(event?) {
    this.templateHeight = document.body.clientHeight - 60 - 65;
  }
  ngOnInit(): void {
    this.getTargetConfigByNiu();
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
      .getLaunchAudienceTemplateDetailNiu(id, {
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

            this.defaultData.landing_type = Number(data.landing_type);

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
    const getParentTarget = this.launchRpaService.getTargetDetailByNiu(this.audienceTemplateId, { cid: this.cid });
    const getChildTarget = this.launchRpaService.getTargetDetailByNiu(this.childAudienceTemplateId, { cid: this.cid });
    zip(getParentTarget, getChildTarget).subscribe(([parentTargetData, childTargetData]) => {
      if (parentTargetData['status_code'] && parentTargetData['status_code'] === 200) {
        const data = JSON.parse(JSON.stringify(parentTargetData['data']));
        this.defaultData.target_setting = data.audience_setting;
      }
      if (childTargetData['status_code'] && childTargetData['status_code'] === 200) {
        const data = JSON.parse(JSON.stringify(childTargetData['data']));
        this.defaultData.audience_template_name = data.audience_template_name;
        this.defaultData.audience_desc = data.audience_desc;
        this.defaultData.landing_type = Number(data.landing_type);
        this.defaultData.inventory_type_list = data.inventory_type_list;
        this.defaultData.audience_setting = data.audience_setting;
        this.curAudienceData = deepCopy(childTargetData['data']);
      }

    }, (err) => {

    });
  }

  doCancel(type?, id?) {
    this.resultsChange.emit({ isClose: type, parentId: id });
  }


  checkBasicData() {
    let isValid = false;
    // 定向包名称
    if (!this.defaultData.audience_template_name) {
      this.checkErrorTip.audience_template_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.audience_template_name.is_show = false;
    }

    // 自定义年龄
    if (this.defaultData.audience_setting.age_type === 'customize_age' && this.defaultData.audience_setting.age.length === 0) {
      this.checkErrorTip.age.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.age.is_show = false;
    }

    // 购物意图
    if (this.defaultData.audience_setting.purchase_intention_type !== 1) {
      // 投放意图
      if (this.defaultData.audience_setting.purchase_intention.interest_level_list.length === 0) {
        this.checkErrorTip.interest_level.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.interest_level.is_show = false;
      }
      // 行为类型
      if (this.defaultData.audience_setting.purchase_intention.purchase_level_list.length === 0) {
        this.checkErrorTip.purchase_level.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.purchase_level.is_show = false;
      }
    }

    //快手网红
    if (this.defaultData.audience_setting.celebrity_info_type !== 1) {
      // 行为类型
      if (this.defaultData.audience_setting.celebrity_info.behavior_list.length === 0) {
        this.checkErrorTip.behavior_list.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.behavior_list.is_show = false;
      }
      //快手网红
      if (this.defaultData.audience_setting.celebrity_info.fans_star_list.length === 0) {
        this.checkErrorTip.fans_star.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.fans_star.is_show = false;
      }
    }

    return isValid;
  }

  doSave() {
    const isValid = this.checkBasicData();
    if (isValid) {
      this.message.error('请完善参数信息！');
      return;
    }

    if (!this.saveing) {
      this.saveing = true;

      if ((this.targetType === 'basicEdit' || this.targetType === 'packageEdit')) {
        const id = this.targetType === 'basicEdit' ? this.audienceTemplateId : this.childAudienceTemplateId;
        this.launchRpaService
          .updateLaunchAudienceTemplateNiu(this.defaultData, id, {
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
          .addLaunchAudienceTemplateNiu(this.defaultData, {
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

  getTargetConfigByNiu() {
    this.launchRpaService
      .getFeedTargetConfigByNiu({
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
    this.defaultData.inventory_type_list = '';
  }

  //检查定向包名称
  checkAudienceTemplateName() {
    if (!this.defaultData.audience_template_name) {
      this.checkErrorTip.audience_template_name.is_show = true;
    } else {
      this.checkErrorTip.audience_template_name.is_show = false;
    }
  }
}
