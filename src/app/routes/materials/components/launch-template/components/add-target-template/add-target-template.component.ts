import { Component, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CustomDatasService } from "../../../../../../shared/service/custom-datas.service";
import { MaterialsService } from "../../../../service/materials.service";
import { AuthService } from "../../../../../../core/service/auth.service";
import { Router, ActivatedRoute } from '@angular/router';
import { LaunchService } from "../../../../service/launch.service";

@Component({
  selector: 'app-add-target-template',
  templateUrl: './add-target-template.component.html',
  styleUrls: ['./add-target-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddTargetTemplateComponent implements OnInit {

  public activeType = {
    type: 'target'
  };

  public publisherId = 7;

  public defaultData: { publisher_id: any, audience_template_name: any, audience_template_id?: any, audience_template_comment: any, audience_setting: any, landing_type?: any, delivery_range?: any, marketing_target?: any, flow_type?: any, objective_type?: any, opt_target?: any, targetings?: any } = {
    publisher_id: 7,
    audience_template_name: null,  // 定向包名称
    audience_template_comment: null, // 定向包描述
    audience_setting: {},
    targetings: {},
  };


  public commSetting = {
    'publisher_7': {
      landing_type: 'EXTERNAL', // 定向包类型
      delivery_range: 'DEFAULT', // 投放范围
    },
    'publisher_1': {
      marketing_target: 'catalogue', // 定向包类型
      landing_type: 'landing_page', // 定向包类型
      flow_type: 0, // 投放范围
    },
    'publisher_17': {
      objective_type: '1', // 推广对象
      opt_target: 3, // 优化目标
    }

  };


  public publisherList = [
    { key: 7, name: '头条' },
    { key: 1, name: '百度' },
  ];

  public landingTypeList = [
    { key: 'EXTERNAL', name: '落地页' },
    { key: 'ANDROID', name: '应用推广-Android' },
    { key: 'IOS', name: '应用推广-IOS' },
  ];

  public landingTypeListBd = [
    { key: 'landing_page', name: '落地页' },
    { key: 'android', name: '应用推广-Android' },
    { key: 'ios', name: '应用推广-IOS' },
  ];

  public deliveryRangeList = [
    { key: 'DEFAULT', name: '默认' },
    { key: 'UNION', name: '穿山甲' },
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

  public audienceTemplateId: any;
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

  public tableHeight = document.body.clientHeight - 60 - 50 - 40 - 60;

  constructor(
    private message: NzMessageService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private launchService: LaunchService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;

    this.audienceTemplateId = this.route.snapshot.queryParams['audience_template_id'];
    if (this.route.snapshot.queryParams['publisher_id']) {
      this.publisherId = Number(this.route.snapshot.queryParams['publisher_id']);
      this.defaultData.publisher_id = this.publisherId;
    }
    this.isCopy = this.route.snapshot.queryParams['is_copy'] === '1';

  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 50 - 40 - 60;
  }

  ngOnInit() {
    this.getTargetConfigByUc();
    if (this.commSetting['publisher_' + this.publisherId]) {
      this.defaultData = { ...this.defaultData, ...this.commSetting['publisher_' + this.publisherId] };
    }
    if (this.audienceTemplateId) {
      this.getLaunchAudienceTemplateDetail();
    } else {
      this.changeGroup();
    }
  }

  getTargetConfigByUc() {
    this.launchService
      .getFeedTargetConfigByUc({
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

  getLaunchAudienceTemplateDetail() {
    this.getting = true;
    this.launchService
      .getLaunchAudienceTemplateDetail(this.audienceTemplateId, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            const data = JSON.parse(JSON.stringify(result['data']));
            this.defaultData = { ...this.defaultData, ...data };
            if (this.publisherId === 17) {
              this.defaultData.targetings = this.defaultData.audience_setting;
            }
            if (this.isCopy) {
              this.defaultData.audience_template_id = null;
              this.defaultData.audience_template_name = this.defaultData.audience_template_name + '-1';
            }
            this.changeGroup();
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

  changeGroup() {
    if (this.publisherId == 1) {
      this.campaignTypeSetting.launch_target = this.defaultData.landing_type;
      this.campaignTypeSetting.operating_system = this.defaultData.landing_type;
      if (this.defaultData.landing_type !== 'landing_page') {
        this.campaignTypeSetting.launch_target = 'app';
      }
      if (this.defaultData.flow_type === 4 && this.defaultData.landing_type === 'landing_page') {
        this.curGroupFlag = 'catalogue_4_landing';
      } else if (this.defaultData.flow_type === 4 && this.defaultData.landing_type !== 'landing_page') {
        this.curGroupFlag = 'catalogue_4';
      } else if (this.defaultData.flow_type !== 4 && this.defaultData.landing_type === 'landing_page') {
        this.curGroupFlag = 'catalogue_landing';
      } else {
        this.curGroupFlag = 'catalogue';
      }
    } else if (this.publisherId == 17) {

    } else {
      if (this.defaultData.landing_type === 'EXTERNAL') {
        if (this.defaultData.delivery_range === 'DEFAULT') {
          this.curGroupFlag = '0_0';
        } else if (this.defaultData.delivery_range === 'UNION') {
          this.curGroupFlag = '0_1';
        }
      } else if (this.defaultData.landing_type === 'ANDROID') {
        if (this.defaultData.delivery_range === 'DEFAULT') {
          this.curGroupFlag = '1_0';
        } else if (this.defaultData.delivery_range === 'UNION') {
          this.curGroupFlag = '1_1';
        }
      } else if (this.defaultData.landing_type === 'IOS') {
        if (this.defaultData.delivery_range === 'DEFAULT') {
          this.curGroupFlag = '2_0';
        } else if (this.defaultData.delivery_range === 'UNION') {
          this.curGroupFlag = '2_1';
        }
      }
    }

  }

  checkBasicData() {
    let isValid = false;
    if (!this.defaultData.targetings.age.length) {
      this.errorTipAry.age.is_show = true;
      isValid = true;
    } else {
      this.errorTipAry.age.is_show = false;
    }

    if (!this.defaultData.targetings.platform.length) {
      this.errorTipAry.platform.is_show = true;
      isValid = true;
    } else {
      this.errorTipAry.platform.is_show = false;
    }

    return isValid;
  }

  doCancel() {
    this.router.navigate(['/data_view/feed/materials/launch_template/launch_tab'], { queryParams: this.activeType });
  }

  doSave() {
    if (!this.defaultData.audience_template_name) {
      this.message.error('请输入定向包名称');
      return false;
    }

    if (this.publisherId === 17) {
      this.defaultData.audience_setting = this.defaultData.targetings;
      const isValid = this.checkBasicData();
      if (isValid) {
        this.message.error('请完善参数信息！');
        return;
      }
    }

    if (!this.saveing) {
      this.saveing = true;

      if (this.defaultData.audience_template_id) {
        this.launchService
          .updateLaunchAudienceTemplate(this.defaultData, this.defaultData.audience_template_id, {
            cid: this.cid,
            publisher_id: this.publisherId,
          })
          .subscribe(
            (result: any) => {
              if (result.status_code && result.status_code === 200) {
                this.message.success('操作成功');
                this.doCancel();
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
        this.launchService
          .addLaunchAudienceTemplate(this.defaultData, {
            cid: this.cid,
          })
          .subscribe(
            (result: any) => {
              if (result.status_code && result.status_code === 200) {
                this.message.success('操作成功');
                this.doCancel();
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

}
