import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../../../core/service/auth.service";
import { CustomDatasService } from "../../../../../../shared/service/custom-datas.service";
import { MaterialsService } from "../../../../service/materials.service";
import { LaunchService } from "../../../../service/launch.service";
import { format, differenceInCalendarDays } from 'date-fns';
import { deepCopy } from "@jzl/jzl-util";
import { CardSectionComponent } from "../../../../../../module/launch/components/card-section/card-section.component";

@Component({
  selector: 'app-add-campaign-template',
  templateUrl: './add-campaign-template.component.html',
  styleUrls: ['./add-campaign-template.component.scss']
})
export class AddCampaignTemplateComponent implements OnInit {

  @ViewChild("cardSection") cardSection: CardSectionComponent;
  public activeType = {
    type: 'launch'
  };

  public url_reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
  public urlReg: any;

  public chanPubId: any;

  public defaultData: any = {
    chan_pub_id: null,
    launch_template_name: null, // 模板名称
    landing_type: 'APP', // 模板类型
    template_type: 'general',
    target_type: 'local',
    adgroup: {
      basic: {
        adgroup_name: '', // 单元名称
        operation: 'enable', // 启用暂停
        delivery_range: 'DEFAULT', // 投放范围
        union_video_type: 'REWARDED_VIDEO', // 穿山甲投放形式
        pricing: 'PRICING_OCPM', // 投放目标
        download_type: 'DOWNLOAD_URL', // 应用下载方式
        app_type: 'APP_ANDROID', // 应用下载类型
        download_url: null, // 应用下载链接
        package: null, // 应用包名
        download_mode: 'DEFAULT', // 优先应用商店下载
        external_url: null, // 落地页链接
        is_open_url: 0, //
        open_url: '', // 应用直达链接
        convert_id: null, // 转化目标
        schedule_type: 'SCHEDULE_FROM_NOW', // 投放时间
        time_range: [new Date(), new Date()], // 起始时间
        schedule_time_slt: 'nolimt', // 投放时段选择
        schedule_time: 0, // 投放时段
        budget: null, // 日预算
        flow_control_mode: 'FLOW_CONTROL_MODE_FAST', // 投放速度类型
        smart_bid_type: 'SMART_BID_CUSTOM', // 出价方式
        bid: null, // 出价
        adjust_cpa: 0,  // 调整自动出价
        deep_bid_type: 'DEEP_BID_DEFAULT', // 深度优化方式
        deep_cpabid: null, // 深度优化出价
        roi_goal: null, // 深度转化ROI系数
        url_select: 'local',
        site_id: null,
      },
      audience_template_id: null,
      audience_package_id: null,
      audience_setting: { // 绑定定向
      },
      creative: {
        basic: {
          launch_positon: 'smart_inventory', // 投放位置
          smart_inventory: 1, // 优先广告位
          inventory_type: [], // 按媒体指定位置
          scene_inventory: 'FEED_SCENE', // 按场景指定位置
          creative_material_mode: 'DEFAULT', // 创意方式
          generate_derived_ad: '0', // 衍生计划
          third_industry_id: null, // 创意分类
          third_industry_id_list: [], // 创意分类
          ad_keywords: [], // 创意标签
          source: '', // 来源
          action_text: null, // 行动号召,
          is_comment_disable: '1', // 广告评论
          creative_display_mode: 'CREATIVE_DISPLAY_MODE_CTR', // 创意展现方式
          app_name: null, // 应用名
          sub_title: null, // 副标题
          web_url: null, // Android应用下载详情页
          track_url: null, // 展示监测链接
          action_track_url: null, // 点击监测链接
          video_play_track_url: null, // 视频播放监测链接
          video_play_done_track_url: null, // 视频播放完毕监测链接
          video_play_effective_track_url: null, // 视频有效播放监测链接
          card_template_id: null,  // 卡片模板id
          url_select: 'local',
          site_id: null,
        },
      },
    },
  };

  public errorTip = {
    adgroup: {
      basic: {
        adgroup_name: {
          is_show: false,
          tip_text: '单元名称应为1-50字'
        },
        download_url: {
          is_show: false,
          tip_text: '请输入正确的应用下载链接'
        },
        package: {
          is_show: false,
          tip_text: '应用包名不能为空'
        },
        external_url: {
          is_show: false,
          tip_text: '请输入正确的落地页链接'
        },
        open_url: {
          is_show: false,
          tip_text: '请输入正确的应用直达链接'
        },
        convert_id: {
          is_show: false,
          tip_text: '转化目标不能为空'
        },
        budget: {
          is_show: false,
          tip_text: '请输入正确的取值范围'
        }, // 日预算
        bid: {
          is_show: false,
          tip_text: '请输入正确的取值范围'
        }, // 出价
        deep_cpabid: {
          is_show: false,
          tip_text: '深度优化出价不能为空'
        },
        roi_goal: {
          is_show: false,
          tip_text: '深度转化ROI系数不能为空'
        },
      },
      creative: {
        basic: {
          inventory_type: {
            is_show: false,
            tip_text: '按媒体指定位置不能为空'
          },
          third_industry_id: {
            is_show: false,
            tip_text: '创意分类不能为空'
          },
          ad_keywords: {
            is_show: false,
            tip_text: '创意标签不能为空'
          },
          source: {
            is_show: false,
            tip_text: '来源应为2-10字'
          },
          action_text: {
            is_show: false,
            tip_text: '行动号召不能为空'
          },
          app_name: {
            is_show: false,
            tip_text: '应用名不能为空'
          },
          web_url: {
            is_show: false,
            tip_text: '请输入正确的Android应用下载详情页'
          },
          track_url: {
            is_show: false,
            tip_text: '请输入正确的展示监测链接'
          },
          action_track_url: {
            is_show: false,
            tip_text: '请输入正确的点击监测链接'
          },
          video_play_track_url: {
            is_show: false,
            tip_text: '请输入正确的视频播放监测链接'
          },
          video_play_done_track_url: {
            is_show: false,
            tip_text: '请输入正确的视频播放完毕监测链接'
          },
          video_play_effective_track_url: {
            is_show: false,
            tip_text: '请输入正确的视频有效播放监测链接'
          },
          card_id: {
            is_show: false,
            tip_text: '请选择正确的模板列表'
          },
        },
      },
    }
  };

  public publisherList = [
    { key: 7, name: '头条' },
  ];

  public targetTypeList = [];

  public landingTypeList = [
    { key: 'APP', name: '应用推广' },
    { key: 'LINK', name: '销售线索收集' },
  ];

  public getting = false;
  public saveing = false;

  public cid;

  public launchTemplateId: any;
  public isCopy = false;

  public tableHeight = document.body.clientHeight - 60 - 50 - 40 - 60;

  public cardTemplateId: any;

  public accountsList = [];

  public mediaTemplateList = [];

  public user_id;

  public mediaTargetList = [];

  constructor(
    private message: NzMessageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private customDataService: CustomDatasService,
    private materialsService: MaterialsService,
    private launchService: LaunchService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;

    this.launchTemplateId = this.route.snapshot.queryParams['launch_template_id'];
    this.isCopy = this.route.snapshot.queryParams['is_copy'] === '1' ? true : false;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 50 - 40 - 60;
  }

  ngOnInit() {
    this.urlReg = new RegExp(this.url_reg);
    this.getAccountList();
    this.getLaunchAudienceTemplateList();
    if (this.launchTemplateId) {
      this.getLaunchTemplateDetail();
    }
  }

  // 获取媒体落地页
  getMediaTargetList(value) {
    this.launchService
      .getMediaTargetList({
        cid: this.cid,
        chan_pub_id: value,
        user_id: this.user_id,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            this.mediaTargetList = results['data'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  changeAccount() {
    this.defaultData.chan_pub_id = null;
  }

  changeAccountItem(value) {
    this.getMediaAudienceList(value);
    this.getMediaTargetList(value);
  }

  // 定向 -- 媒体模板
  getMediaAudienceList(value) {

    this.mediaTemplateList = [];

    let landingType = '';
    if (this.defaultData.landing_type === 'APP') {
      if (this.defaultData.adgroup.basic.download_type === 'DOWNLOAD_URL') {
        if (this.defaultData.adgroup.basic.app_type === 'APP_ANDROID') {
          landingType = 'ANDROID';
        } else {
          landingType = 'IOS';
        }
      } else if (this.defaultData.adgroup.basic.download_type === 'EXTERNAL_URL') {
        landingType = 'EXTERNAL';
      }
    } else if (this.defaultData.landing_type === 'LINK') {
      landingType = 'EXTERNAL';
    }

    this.launchService
      .getMediaAudienceList({
        cid: this.cid,
        chan_pub_id: value,
        user_id: this.user_id,
        landing_type: landingType,
        delivery_range: this.defaultData.adgroup.basic.delivery_range,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            this.mediaTemplateList = [...results['data']];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  getAccountList() {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": "7"
        }]
    };
    this.launchService
      .getAccountList(body, {
        page: 1,
        count: 100000,
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            this.accountsList = results['data']['detail'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  getLaunchAudienceTemplateList(isNotEmpty?) {
    if (!isNotEmpty) {
      this.defaultData.adgroup.audience_template_id = null;
    }
    this.targetTypeList = [];

    let landingType = '';
    if (this.defaultData.landing_type === 'APP') {
      if (this.defaultData.adgroup.basic.download_type === 'DOWNLOAD_URL') {
        if (this.defaultData.adgroup.basic.app_type === 'APP_ANDROID') {
          landingType = 'ANDROID';
        } else {
          landingType = 'IOS';
        }
      } else if (this.defaultData.adgroup.basic.download_type === 'EXTERNAL_URL') {
        landingType = 'EXTERNAL';
      }
    } else if (this.defaultData.landing_type === 'LINK') {
      landingType = 'EXTERNAL';
    }

    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": "7"
        }],
      "landing_type": landingType,
      "delivery_range": this.defaultData.adgroup.basic.delivery_range,
    };
    this.launchService
      .getLaunchAudienceTemplateList(body, {
        cid: this.cid,
        result_model: 'all',
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            this.targetTypeList = [...results['data']];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  getLaunchTemplateDetail() {
    this.getting = true;
    this.launchService
      .getLaunchTemplateDetail(this.launchTemplateId, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            const data = JSON.parse(JSON.stringify(result['data']));
            if (data.chan_pub_id !== '0') {
              this.defaultData.template_type = 'account';
            }
            this.defaultData.launch_template_id = data.launch_template_id;
            this.defaultData.launch_template_name = data.launch_template_name;
            this.defaultData.landing_type = data.landing_type;
            this.defaultData.chan_pub_id = Number(data.chan_pub_id);

            this.cardTemplateId = data.launch_setting.adgroup.creative.basic.card_template_id;

            // 判断日期范围是否小于今天
            if (differenceInCalendarDays(new Date(data.launch_setting.adgroup.basic.time_range[0]), new Date()) < 0) {
              data.launch_setting.adgroup.basic.time_range[0] = new Date();
              data.launch_setting.adgroup.basic.start_time = null;
            }
            if (differenceInCalendarDays(new Date(data.launch_setting.adgroup.basic.time_range[1]), new Date()) < 0) {
              data.launch_setting.adgroup.basic.time_range[1] = new Date();
              data.launch_setting.adgroup.basic.end_time = null;
            }

            this.defaultData.adgroup = { ...data.launch_setting.adgroup };
            if (this.isCopy) {
              this.defaultData.launch_template_id = null;
              this.defaultData.launch_template_name = this.defaultData.launch_template_name + '-1';
            }

            this.getLaunchAudienceTemplateList(true);
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

  // 模板类型 --- Change
  landingTypeChange() {
    // 清空行动号召
    this.defaultData.adgroup.creative.basic.action_text = null;

    // 获取定向模板
    this.getLaunchAudienceTemplateList();
    this.getMediaAudienceList(this.defaultData.chan_pub_id);
  }


  changeadGroupFalg() {
    // 获取定向模板
    this.getLaunchAudienceTemplateList();
    this.getMediaAudienceList(this.defaultData.chan_pub_id);
    this.defaultData.adgroup.basic = { ...this.defaultData.adgroup.basic };
    this.defaultData.adgroup.creative.basic = { ...this.defaultData.adgroup.creative.basic };

    if (!(this.defaultData.adgroup.basic.delivery_range === 'DEFAULT' && (this.defaultData.adgroup.creative.basic.launch_positon === 'smart_inventory' || (this.defaultData.adgroup.creative.basic.launch_positon === 'inventory_type' && this.defaultData.adgroup.creative.basic.inventory_type.includes('INVENTORY_AWEME_FEED')) || (this.defaultData.adgroup.creative.basic.launch_positon === 'scene_inventory' && this.defaultData.adgroup.creative.basic.scene_inventory === 'VIDEO_SCENE')))) {
      this.defaultData.adgroup.creative.basic.card_template_id = null;
      this.cardTemplateId = null;
      this.cardSection.resetData();
    } else if (this.defaultData.adgroup.basic.download_type !== this.cardSection.defaultArr.download_type) {
      this.defaultData.adgroup.creative.basic.card_template_id = null;
      this.cardTemplateId = null;
      this.cardSection.resetData();

    }
  }

  audienceTemplateSltChange(event) {
    this.defaultData.adgroup.audience_setting = {};

    const filterItem = this.targetTypeList.filter(filter => filter.audience_template_id === event);

    if (filterItem.length) {
      const audienceSetting = JSON.parse(filterItem[0].audience_setting);
      this.defaultData.adgroup.audience_setting = JSON.parse(JSON.stringify(audienceSetting));
    }
  }

  doCancel() {
    this.router.navigate(['/data_view/feed/materials/launch_template/launch_tab'], { queryParams: this.activeType });
  }


  doSave() {
    if (this.defaultData.template_type === 'account' && !this.defaultData.chan_pub_id) {
      this.defaultData.chan_pub_id = 0;
    }

    if (this.defaultData.template_type === 'account' && !this.defaultData.chan_pub_id) {
      this.message.error('请选择所属账户');
      return false;
    }

    if (!this.defaultData.launch_template_name) {
      this.message.error('请输入模板名称');
      return false;
    }

    const isValid = this.checkBasicData();
    if (isValid) {
      this.message.error('请完善参数信息！');
      return;
    }

    // 投放时间 --- 起始时间
    if (this.defaultData.adgroup.basic.time_range) {
      this.defaultData.adgroup.basic.start_time = format(new Date(this.defaultData.adgroup.basic.time_range[0]), 'yyyy-MM-dd');
      this.defaultData.adgroup.basic.end_time = format(new Date(this.defaultData.adgroup.basic.time_range[1]), 'yyyy-MM-dd');
    }

    // 优先广告位
    this.defaultData.adgroup.creative.basic.smart_inventory = this.defaultData.adgroup.creative.basic.launch_positon === 'smart_inventory' ? 1 : 0;

    // 创意分类
    if (this.defaultData.adgroup.creative.basic.third_industry_id_list.length > 1) {
      this.defaultData.adgroup.creative.basic.third_industry_id = this.defaultData.adgroup.creative.basic.third_industry_id_list[2];
    }

    const postData = {
      publisher_id: 7,
      launch_template_name: this.defaultData.launch_template_name,
      landing_type: this.defaultData.landing_type,
      launch_setting: {
        adgroup: { ...this.defaultData.adgroup },
      },
      chan_pub_id: this.defaultData.chan_pub_id,
    };

    if (!this.saveing) {
      this.saveing = true;

      if (this.defaultData.launch_template_id) {
        this.launchService
          .updateLaunchTemplate(postData, this.defaultData.launch_template_id, {
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
      } else {
        this.launchService
          .addLaunchTemplate(postData, {
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

  checkBasicData() {
    let isValid = false;

    // 单元名称
    if (this.defaultData.adgroup.basic.adgroup_name.length < 1 || this.defaultData.adgroup.basic.adgroup_name.length > 50) {
      this.errorTip.adgroup.basic.adgroup_name.is_show = true;
      isValid = true;
    } else {
      this.errorTip.adgroup.basic.adgroup_name.is_show = false;
    }

    // 应用下载链接, 应用包名
    if (this.defaultData.landing_type === 'APP' && this.defaultData.adgroup.basic.download_type === 'DOWNLOAD_URL') {
      if (!this.urlReg.test(this.defaultData.adgroup.basic.download_url)) {
        this.errorTip.adgroup.basic.download_url.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.basic.download_url.is_show = false;
      }

      if (!this.defaultData.adgroup.basic.package) {
        this.errorTip.adgroup.basic.package.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.basic.package.is_show = false;
      }
    }

    // 落地页链接
    if ((this.defaultData.landing_type === 'APP' && this.defaultData.adgroup.basic.download_type === 'EXTERNAL_URL') || this.defaultData.landing_type === 'LINK') {
      if (!this.urlReg.test(this.defaultData.adgroup.basic.external_url)) {
        this.errorTip.adgroup.basic.external_url.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.basic.external_url.is_show = false;
      }
    }

    // 应用直达链接
    if (this.defaultData.landing_type === 'APP' && this.defaultData.adgroup.basic.download_type === 'EXTERNAL_URL') {
      if (this.defaultData.adgroup.basic.is_open_url === 1) {
        if (!this.urlReg.test(this.defaultData.adgroup.basic.open_url)) {
          this.errorTip.adgroup.basic.open_url.is_show = true;
          isValid = true;
        } else {
          this.errorTip.adgroup.basic.open_url.is_show = false;
        }
      }
    }

    // 日预算
    if (this.defaultData.adgroup.basic.pricing === 'PRICING_CPC' || this.defaultData.adgroup.basic.pricing === 'PRICING_CPM') {
      if (this.defaultData.adgroup.basic.budget < 100 || this.defaultData.adgroup.basic.budget > 9999999.99) {
        this.errorTip.adgroup.basic.budget.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.basic.budget.is_show = false;
      }
    } else if (this.defaultData.adgroup.basic.pricing === 'PRICING_OCPC' || this.defaultData.adgroup.basic.pricing === 'PRICING_OCPM') {
      if (this.defaultData.adgroup.basic.budget < 300 || this.defaultData.adgroup.basic.budget > 9999999.99) {
        this.errorTip.adgroup.basic.budget.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.basic.budget.is_show = false;
      }
    }

    // 出价
    if (this.defaultData.adgroup.basic.smart_bid_type === 'SMART_BID_CUSTOM') {
      if (this.defaultData.adgroup.basic.pricing === 'PRICING_CPC') {
        if (this.defaultData.adgroup.basic.bid < 0.2 || this.defaultData.adgroup.basic.bid > 100) {
          this.errorTip.adgroup.basic.bid.is_show = true;
          isValid = true;
        } else {
          this.errorTip.adgroup.basic.bid.is_show = false;
        }
      } else if (this.defaultData.adgroup.basic.pricing === 'PRICING_CPM') {
        if (this.defaultData.adgroup.basic.bid < 4 || this.defaultData.adgroup.basic.bid > 100) {
          this.errorTip.adgroup.basic.bid.is_show = true;
          isValid = true;
        } else {
          this.errorTip.adgroup.basic.bid.is_show = false;
        }
      } else if (this.defaultData.adgroup.basic.pricing === 'PRICING_OCPC' || this.defaultData.adgroup.basic.pricing === 'PRICING_OCPM') {
        if (this.defaultData.adgroup.basic.bid < 0.1 || this.defaultData.adgroup.basic.bid > this.defaultData.adgroup.basic.budget || this.defaultData.adgroup.basic.bid > 10000) {
          this.errorTip.adgroup.basic.bid.is_show = true;
          isValid = true;
        } else {
          this.errorTip.adgroup.basic.bid.is_show = false;
        }
      }
    }

    // 广告出价
    if (this.defaultData.adgroup.basic.smart_bid_type === 'SMART_BID_CONSERVATIVE') {
      if (this.defaultData.adgroup.basic.adjust_cpa === 1 && this.defaultData.adgroup.basic.pricing === 'PRICING_OCPM') {
        if (this.defaultData.adgroup.basic.bid < 0.1 || this.defaultData.adgroup.basic.bid > this.defaultData.adgroup.basic.budget || this.defaultData.adgroup.basic.bid > 10000) {
          this.errorTip.adgroup.basic.bid.is_show = true;
          isValid = true;
        } else {
          this.errorTip.adgroup.basic.bid.is_show = false;
        }
      }
    }

    // 深度优化出价
    if (this.defaultData.adgroup.basic.deep_bid_type === 'DEEP_BID_MIN') {
      if (!this.defaultData.adgroup.basic.deep_cpabid) {
        this.errorTip.adgroup.basic.deep_cpabid.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.basic.deep_cpabid.is_show = false;
      }
    }

    // 深度转化ROI系数
    if (this.defaultData.adgroup.basic.deep_bid_type === 'ROI_COEFFICIENT') {
      if (!this.defaultData.adgroup.basic.roi_goal) {
        this.errorTip.adgroup.basic.roi_goal.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.basic.roi_goal.is_show = false;
      }
    }

    // 按媒体指定位置
    if (this.defaultData.adgroup.delivery_range === 'DEFAULT' && this.defaultData.adgroup.creative.basic.launch_positon === 'inventory_type') {
      if (!this.defaultData.adgroup.creative.basic.inventory_type.length) {
        this.errorTip.adgroup.creative.basic.inventory_type.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.creative.basic.inventory_type.is_show = false;
      }
    }

    // 创意分类
    if (!this.defaultData.adgroup.creative.basic.third_industry_id_list.length) {
      this.errorTip.adgroup.creative.basic.third_industry_id.is_show = true;
      isValid = true;
    } else {
      this.errorTip.adgroup.creative.basic.third_industry_id.is_show = false;
    }

    // 创意标签
    if (!this.defaultData.adgroup.creative.basic.ad_keywords.length) {
      this.errorTip.adgroup.creative.basic.ad_keywords.is_show = true;
      isValid = true;
    } else {
      this.errorTip.adgroup.creative.basic.ad_keywords.is_show = false;
    }

    // 来源
    if ((this.defaultData.landing_type === 'APP' && this.defaultData.adgroup.basic.download_type === 'EXTERNAL_URL') || this.defaultData.landing_type === 'LINK') {
      if (this.defaultData.adgroup.creative.basic.source.length < 2 || this.defaultData.adgroup.creative.basic.source.length > 10) {
        this.errorTip.adgroup.creative.basic.source.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.creative.basic.source.is_show = false;
      }
    }

    // 行动号召
    if (!this.defaultData.adgroup.creative.basic.action_text) {
      this.errorTip.adgroup.creative.basic.action_text.is_show = true;
      isValid = true;
    } else {
      this.errorTip.adgroup.creative.basic.action_text.is_show = false;
    }

    // 应用名, Android应用下载详情页
    if (this.defaultData.landing_type === 'APP' && this.defaultData.adgroup.basic.download_type === 'DOWNLOAD_URL') {
      if (!this.defaultData.adgroup.creative.basic.app_name) {
        this.errorTip.adgroup.creative.basic.app_name.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.creative.basic.app_name.is_show = false;
      }

      if (this.defaultData.adgroup.basic.app_type === 'APP_ANDROID') {
        if (!this.urlReg.test(this.defaultData.adgroup.creative.basic.web_url)) {
          this.errorTip.adgroup.creative.basic.web_url.is_show = true;
          isValid = true;
        } else {
          this.errorTip.adgroup.creative.basic.web_url.is_show = false;
        }
      }
    }

    // 展示监测链接
    if (this.defaultData.adgroup.creative.basic.track_url && !this.urlReg.test(this.defaultData.adgroup.creative.basic.track_url)) {
      this.errorTip.adgroup.creative.basic.track_url.is_show = true;
      isValid = true;
    } else {
      this.errorTip.adgroup.creative.basic.track_url.is_show = false;
    }

    // 卡片模板
    if (this.defaultData.adgroup.creative.basic.card_template_id === null && this.defaultData.adgroup.basic.delivery_range === 'DEFAULT' && (this.defaultData.adgroup.creative.basic.launch_positon === 'smart_inventory' || (this.defaultData.adgroup.creative.basic.launch_positon === 'inventory_type' && this.defaultData.adgroup.creative.basic.inventory_type.includes('INVENTORY_AWEME_FEED')) || (this.defaultData.adgroup.creative.basic.launch_positon === 'scene_inventory' && this.defaultData.adgroup.creative.basic.scene_inventory === 'VIDEO_SCENE'))) {
      this.errorTip.adgroup.creative.basic.card_id.is_show = true;
      isValid = true;
    } else {
      this.errorTip.adgroup.creative.basic.card_id.is_show = false;
    }

    // 点击监测链接
    if (this.defaultData.adgroup.creative.basic.action_track_url && !this.urlReg.test(this.defaultData.adgroup.creative.basic.action_track_url)) {
      this.errorTip.adgroup.creative.basic.action_track_url.is_show = true;
      isValid = true;
    } else {
      this.errorTip.adgroup.creative.basic.action_track_url.is_show = false;
    }

    if (this.defaultData.adgroup.basic.delivery_range === 'DEFAULT') {
      // 视频播放监测链接
      if (this.defaultData.adgroup.creative.basic.video_play_track_url && !this.urlReg.test(this.defaultData.adgroup.creative.basic.video_play_track_url)) {
        this.errorTip.adgroup.creative.basic.video_play_track_url.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.creative.basic.video_play_track_url.is_show = false;
      }

      // 视频播放完毕监测链接
      if (this.defaultData.adgroup.creative.basic.video_play_done_track_url && !this.urlReg.test(this.defaultData.adgroup.creative.basic.video_play_done_track_url)) {
        this.errorTip.adgroup.creative.basic.video_play_done_track_url.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.creative.basic.video_play_done_track_url.is_show = false;
      }

      // 视频有效播放监测链接
      if (this.defaultData.adgroup.creative.basic.video_play_effective_track_url && !this.urlReg.test(this.defaultData.adgroup.creative.basic.video_play_effective_track_url)) {
        this.errorTip.adgroup.creative.basic.video_play_effective_track_url.is_show = true;
        isValid = true;
      } else {
        this.errorTip.adgroup.creative.basic.video_play_effective_track_url.is_show = false;
      }
    }

    return isValid;
  }

}
