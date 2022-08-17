import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from "../../../../../../../core/service/auth.service";
import { LaunchService } from "../../../../../service/launch.service";
import { DataViewService } from "../../../../../../data-view-feed/service/data-view.service";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { zip } from "rxjs";
import { deepCopy } from "@jzl/jzl-util";

@Component({
  selector: 'app-launch-target-basic-toutiao',
  templateUrl: './launch-target-basic-toutiao.component.html',
  styleUrls: ['./launch-target-basic-toutiao.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchTargetBasicToutiaoComponent implements OnInit {

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
    landing_type: "EXTERNAL",  // 定向包类型
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
    { key: 'EXTERNAL', name: '落地页' },
    { key: 'ANDROID', name: '应用推广-Android' },
    { key: 'IOS', name: '应用推广-IOS' },
    { key: 'QUICK_APP', name: '快应用' },
    { key: 'SHOP', name: '电商店铺推广' },
  ];

  public marketTypeList = [
    { key: 'catalogue', name: '商品目录' },
  ];

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

  public checkOptionsOne = [
    { label: '头条', value: 1, checked: false },
    { label: '西瓜', value: 2, checked: false },
    { label: '火山', value: 3, checked: false },
    { label: '抖音', value: 4, checked: false },
    { label: '穿山甲', value: 5, checked: false }
  ];

  public checkOptionsTwo = [
    { label: '激励视频', value: 1, checked: false },
    { label: '原生', value: 2, checked: false },
    { label: '开屏', value: 3, checked: false }
  ];

  public reInitTarget = true;

  public isLaunchPackage = false;

  public curAudienceData = {};

  public isParentAudience = true;

  constructor(
    private message: NzMessageService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private launchService: LaunchService,
    public launchRpaService: LaunchRpaService,
  ) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;

    this.isCopy = this.route.snapshot.queryParams['is_copy'] === '1';

  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 50 - 40 - 60;
  }

  ngOnInit() {
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
    const getParentTarget = this.launchRpaService.getLaunchRpaTemplateData(this.audienceTemplateId, { cid: this.cid });
    const getChildTarget = this.launchRpaService.getLaunchRpaTemplateData(this.childAudienceTemplateId, { cid: this.cid });

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
      .getLaunchRpaTemplateData(id, {
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

    if (!this.saveing) {
      this.saveing = true;

      this.defaultData['cid'] = this.cid;
      this.defaultData['company_id'] = "33";


      if ((this.targetType === 'basicEdit' || this.targetType === 'packageEdit')) {
        const id = this.targetType === 'basicEdit' ? this.audienceTemplateId : this.childAudienceTemplateId;
        this.launchRpaService
          .updateLaunchAudienceBasicTemplate(id, this.defaultData, {
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
        this.defaultData.parent_id = this.targetType === 'package' ? this.audienceTemplateId : 0;

        this.launchRpaService
          .createLaunchAudienceBasicTemplate(this.defaultData, {
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
