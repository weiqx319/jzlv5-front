import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { deepCopy } from "@jzl/jzl-util";
import { zip } from "rxjs";

@Component({
  selector: 'app-launch-target-basic-gdt',
  templateUrl: './launch-target-basic-gdt.component.html',
  styleUrls: ['./launch-target-basic-gdt.component.scss']
})
export class LaunchTargetBasicGdtComponent implements OnInit {

  @Output() resultsChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() targetType;

  @Input() audienceTemplateId;

  @Input() childAudienceTemplateId;

  public activeType = {
    type: 'target'
  };

  public publisherId = 7;

  public defaultData = {
    audience_template_name: null,  // 定向包名称
    audience_desc: null, // 定向包描述
    landing_type: "PROMOTED_OBJECT_TYPE_LINK",  // 定向包类型
    inventory_type_list: { delivery_range: [], union_video_type: [], inventory_all: true, universal: true },
    parent_id: 0,
    audience_setting: {},
    target_setting: {},
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
    public launchRpaService: LaunchRpaService,) { }

  ngOnInit(): void {
    if (this.targetType === 'package' || this.targetType === 'packageEdit') {
      this.isLaunchPackage = true;
    }
    if ((this.targetType === 'basicEdit' || this.targetType === 'package') && this.audienceTemplateId) {
      this.getLaunchRpaTemplateData(this.audienceTemplateId);
    }
    if (this.targetType === 'packageEdit' && this.audienceTemplateId && this.childAudienceTemplateId) {
      this.getEditData();
    }
  }

  landingTypeChange() {
    this.defaultData.audience_setting = {};
    this.defaultData.target_setting = {};
  }

  getEditData() {

    const getParentTarget = this.launchRpaService.getTargetDetailByGdt(this.audienceTemplateId, { cid: this.cid });
    const getChildTarget = this.launchRpaService.getTargetDetailByGdt(this.childAudienceTemplateId, { cid: this.cid });

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
        this.defaultData.inventory_type_list = data.inventory_type_list;
        this.defaultData.audience_setting = data.audience_setting;
        this.defaultData.parent_id = data.parent_id;
        this.curAudienceData = deepCopy(childTargetData['data']);
      }

    }, (err) => {

    });
  }

  getLaunchRpaTemplateData(id, type?) {
    this.getting = true;
    this.launchRpaService
      .getTargetDetailByGdt(id, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            const data = JSON.parse(JSON.stringify(result['data']));
            if (this.targetType !== 'package') {
              this.defaultData.audience_template_name = data.audience_template_name;
              this.defaultData.audience_desc = data.audience_desc;
            }
            this.defaultData.landing_type = data.landing_type;
            this.defaultData.inventory_type_list = data.inventory_type_list;
            this.defaultData.audience_setting = data.audience_setting;
            this.defaultData.parent_id = data.parent_id;
          } else if (result.status_code && result.status_code === 205) {

          } else {
            this.message.error(result.message);
          }
          this.getting = false;
        },
        (err: any) => {
          this.getting = false;
        },
        () => {
        },
      );
  }

  doCancel(type?, id?) {
    this.resultsChange.emit({ isClose: type, parentId: id });
  }

  doSave() {
    if (!this.defaultData.audience_template_name) {
      this.message.error('请输入定向包名称');
      return false;
    }

    if (this.defaultData.audience_setting['geo_location'].hasOwnProperty('custom_locations')) {
      if (!this.defaultData.audience_setting['geo_location']['location_types'].includes('LIVE_IN')) {
        this.message.error('目前“近期到访/常住且近期/旅行到访”功能投放商圈/自定义打点(地图选择)区域时暂不生效；');
        return false;
      }
    }

    if (!this.saveing) {
      this.saveing = true;

      const body = deepCopy(this.defaultData);

      body['cid'] = this.cid;
      body['company_id'] = "33";

      delete body.target_setting;

      if ((this.targetType === 'basicEdit' || this.targetType === 'packageEdit')) {
        const id = this.targetType === 'basicEdit' ? this.audienceTemplateId : this.childAudienceTemplateId;
        this.launchRpaService
          .updateTargetDetailByGdt(id, body, {
            cid: this.cid,
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
            () => {
            },
          );
      } else {
        body.parent_id = this.targetType === 'package' ? this.audienceTemplateId : 0;

        this.launchRpaService
          .createLaunchAudienceTemplateByGdt(body, {
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
            () => {
            },
          );
      }

    }
  }

}
