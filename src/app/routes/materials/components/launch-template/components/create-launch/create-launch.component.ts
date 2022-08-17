import { Component, HostListener, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from "../../../../../../core/service/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomDatasService } from "../../../../../../shared/service/custom-datas.service";
import { MaterialsService } from "../../../../service/materials.service";
import { LaunchDocumentComponent } from "../../../../modal/launch-document/launch-document.component";
import { arrayChunk, arraySplit, deepCopy } from "@jzl/jzl-util";
import { MaterialLibraryComponent } from "../../../../modal/material-library/material-library.component";
import { LaunchService } from "../../../../service/launch.service";
import { format, differenceInCalendarDays } from "date-fns";
import { TargetSettingComponent } from "../../../../../../module/launch/components/target-setting/target-setting.component";
import { MaterialLibraryImageComponent } from "../../../../modal/material-library-image/material-library-image.component";
import { isArray } from "@jzl/jzl-util";

@Component({
  selector: 'app-create-launch',
  templateUrl: './create-launch.component.html',
  styleUrls: ['./create-launch.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateLaunchComponent implements OnInit {
  @ViewChild('targetSetting') targetSetting: TargetSettingComponent;

  public anchorList = [
    {
      key: '#create_launch',
      name: '新建投放',
      sub: [
        { key: '#select_materials', name: '创意素材' },
        { key: '#select_documents', name: '创意文案' },
        { key: '#select_accounts', name: '选择账号' },
      ]
    },
    {
      key: '#campaign_setting',
      name: '广告组设置',
      sub: [
        { key: '#copy_campaign', name: '复制广告组' },
        { key: '#adgroup_num', name: '组合计划' },
        { key: '#landing_type', name: '推广目的' },
      ]
    },
    {
      key: '#adgroup_setting',
      name: '计划设置',
      sub: [
        { key: '#copy_adgroup', name: '复制计划' },
        { key: '#delivery_range', name: '投放范围' },
        { key: '#pricing_setting', name: '投放目标' },
        { key: '#schedule_type', name: '投放时间' },
        { key: '#bid_setting', name: '出价设置' },
        { key: '#target_setting', name: '定向设置' },
      ]
    },
    {
      key: '#creative_setting',
      name: '创意设置',
      sub: [
        { key: '#creative_mode', name: '创意方式' },
        { key: '#track_url', name: '监测链接' },
        { key: '#title_materials', name: '标题素材' },
        { key: '#card_setting', name: '推广卡片' },
      ]
    },
  ];

  public materialSlt = [];
  public titleSlt = [];

  public url_reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
  public urlReg: any;

  public curAccountIndex = 0; // 账号下标
  public curCampaignIndex = 0; // 计划下标
  public curAdgroupIndex = 0; // 单元下标
  public curCreativeIndex = 0; // 创意下标

  public launchTemplateList = [];
  public localTemplateList = [];

  public accounts = [];

  public defaultData: any = {
    // materials: [],
    // titles: [],
    accounts: [],
  };

  public campaignSetting = [
    {
      basic: {
        adgroup_num: null, // 组合单元
        isCross: false, // 是否交叉组合计划
        adgroup_title_num: null, // 每单元标题
        adgroup_material_num: null, // 每单元素材
        campaign_select: '新建广告组', // 计划选择
        campaign_name: '', // 计划名称
        pub_campaign_id: null, // 计划ID
        landing_type: 'APP', // 推广目的
        budget_slt: 'nolimt',
        budget: null, // 预算
        operation: 'enable', // 启用暂停
      },
      adgroup: [
        {
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
            target_select: 'local',
            site_id: null,
          },
          launch_template_id: null,
          audience_template_id: null,
          audience_package_id: null,
          audience_setting: {},
          creative: {
            basic: {
              style: null,     //  创意样式
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
              site_id: null,
              promotion_card: {
                card_id: null,
                chan_pub_id: null,
                download_type: null,
                promo_card_template_name: "",
                imgUrl: "",
                promo_card_setting: {
                  product_description: "",
                  product_points: [{ name: "", sellingPointsNameLength: 0 }],
                  call_to_action: null,
                  enable_personal_action: false,
                  image_url: "",
                }
              }
            },
            detail: [],
            program_detail: {
              video_list: [],
              title_list: [],
            }
          },
          cur_group_flag: '1_0',
        }
      ],
    }
  ];
  public campaignSettingCopy = [];

  public adgroupInit = {
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
      target_select: 'local',
      url_select: 'local',
      site_id: null,
    },
    launch_template_id: null,
    audience_template_id: null,
    audience_package_id: null,
    audience_setting: {},
    creative: {
      basic: {
        style: null,     //  创意样式
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
        url_select: 'local',
        site_id: null,
        promotion_card: {
          card_id: null,
          chan_pub_id: null,
          download_type: null,
          promo_card_template_name: "",
          imgUrl: "",
          promo_card_setting: {
            product_description: "",
            product_points: [{ name: "", sellingPointsNameLength: 0 }],
            call_to_action: null,
            enable_personal_action: false,
            image_url: "",
            image_material_id: "",
            product_selling_points: [],
          }
        }
      },
      detail: [],
      program_detail: {
        video_list: [],
        title_list: [],
      }
    },
    cur_group_flag: '1_0',
  };

  public errorTipAry = [];
  public campaignErrorTip = [
    {
      basic: {
        adgroup_title_num: {
          is_show: false,
          tip_text: '不能超过所选标题数且最多10条'
        },
        adgroup_material_num: {
          is_show: false,
          tip_text: '不能超过所选素材数且最多10个'
        },
        campaign_name: {
          is_show: false,
          tip_text: '广告组名称应为1-50字'
        },
        campaign_name_repeat: {
          is_show: false,
          tip_text: '广告组名称不能重复'
        },
        pub_campaign_id: {
          is_show: false,
          tip_text: '广告组名称应为1-50字'
        },
        campaign_enable_count: {
          is_show: false,
          tip_text: '不能超过可新建计划数'
        },
        budget: {
          is_show: false,
          tip_text: '取值范围为1000-9999999.99'
        },
      },
      has_error: false,
      adgroup: [
        {
          basic: {
            adgroup_name: {
              is_show: false,
              tip_text: '计划名称应为1-50字'
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
            audience_package_id: {
              is_show: false,
              tip_text: '请选择媒体定向包'
            }
          },
          has_error: false,
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
              }


            },
            has_error: false,
          },
        }
      ]
    }
  ];

  public accountsAry = [];

  public accountsList = [];

  public preAccountsAry = [];

  public submiting = false;

  public cid;

  public campaignDisabled = {};

  public reInitTarget = true;
  public reInitTargetTimer;

  public mediaTemplateList = [];

  public mediaTargetList = [];

  public user_id;

  public material_style = 1;  // 创意样式

  public tableHeight = document.body.clientHeight - 60 - 40;
  public tableWidth = document.body.clientWidth - 150 - 130;

  public styleList = [
    {
      css_type: 1,
      name: '单图',
    },
    {
      css_type: 2,
      name: '三图',
    },
    {
      css_type: 3,
      name: '视频',
    },
  ];

  constructor(
    private message: NzMessageService,
    private modalService: NzModalService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private customDataService: CustomDatasService,
    private materialsService: MaterialsService,
    private launchService: LaunchService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 40;
    this.tableWidth = document.body.clientWidth - 150 - 130;
  }

  ngOnInit() {
    this.urlReg = new RegExp(this.url_reg);
    this.campaignSettingCopy = JSON.parse(JSON.stringify(this.campaignSetting));
    this.getAccountList();
  }

  // 创意样式 change
  basicChange() {
    this.materialSlt = [];
    this.titleSlt = [];
    this.accounts = [];
    this.accountsAry = [];
    this.preAccountsAry = [];
    this.curAccountIndex = 0;
    this.curCampaignIndex = 0;
    this.curAdgroupIndex = 0;
    this.curCreativeIndex = 0;
  }

  // 图片素材库
  addImageMaterials(type = 'materials', data?, cssType?, accountIndex?, campaignIndex?, adgroupIndex?) {
    const add_modal = this.modalService.create({
      nzTitle: '素材库',
      nzWidth: 1100,
      nzContent: MaterialLibraryImageComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        materialSlt: this.materialSlt,
        css_type: Number(cssType),
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result !== 'onCancel') {
        this.materialSlt = JSON.parse(JSON.stringify(result));

        this.accountsAry.forEach((account, idx) => {
          const campaign = JSON.parse(JSON.stringify(this.campaignSettingCopy));
          campaign[0].basic.campaign_name = '1';
          campaign[0].basic.adgroup_title_num = this.titleSlt.length > 10 ? 10 : this.titleSlt.length;
          campaign[0].basic.adgroup_material_num = this.materialSlt.length > 10 ? 10 : this.materialSlt.length;
          campaign[0].basic.adgroup_num = Math.ceil(this.titleSlt.length / campaign[0].basic.adgroup_title_num) * Math.ceil(this.materialSlt.length / campaign[0].basic.adgroup_material_num);
          account.campaign = [...campaign];

          this.getMaxLength(idx, 0);

        });
      }
    });
  }

  // 打开素材库
  openMaterials() {
    if (this.material_style === 1 || this.material_style === 2) {
      this.addImageMaterials('materials', null, this.material_style);
    } else {
      this.addMaterials();
    }
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

  // 投放模板
  getLaunchTemplateList(accountBasic, isNotEmpty?) {
    const curCampaign = this.accountsAry[this.curAccountIndex].campaign[this.curCampaignIndex];

    if (!isNotEmpty) {
      curCampaign.adgroup[this.curAdgroupIndex].launch_template_id = null;
      curCampaign.adgroup[this.curAdgroupIndex].audience_template_id = null;
    }


    this.launchTemplateList = [];

    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": "7"
        }],
      "landing_type": curCampaign.basic.landing_type,
    };
    this.launchService
      .getLaunchTemplateList(body, {
        cid: this.cid,
        chan_pub_id: accountBasic.chan_pub_id,
        result_model: 'all',
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            this.launchTemplateList = [...results['data']];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  // 定向 -- 本地模板
  getLaunchAudienceTemplateList(isNotEmpty?) {
    const curCampaign = this.accountsAry[this.curAccountIndex].campaign[this.curCampaignIndex];
    if (!isNotEmpty) {
      curCampaign.adgroup[this.curAdgroupIndex].audience_template_id = null;
    }

    this.localTemplateList = [];

    let landingType = '';
    if (curCampaign.basic.landing_type === 'APP') {
      if (curCampaign.adgroup[this.curAdgroupIndex].basic.download_type === 'DOWNLOAD_URL') {
        if (curCampaign.adgroup[this.curAdgroupIndex].basic.app_type === 'APP_ANDROID') {
          landingType = 'ANDROID';
        } else {
          landingType = 'IOS';
        }
      } else if (curCampaign.adgroup[this.curAdgroupIndex].basic.download_type === 'EXTERNAL_URL') {
        landingType = 'EXTERNAL';
      }
    } else if (curCampaign.basic.landing_type === 'LINK') {
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
      "delivery_range": curCampaign.adgroup[this.curAdgroupIndex].basic.delivery_range,
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
            this.localTemplateList = [...results['data']];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  // 定向 -- 媒体模板
  getMediaAudienceList(accountBasic) {

    this.mediaTemplateList = [];

    this.launchService
      .getMediaAudienceList({
        cid: this.cid,
        chan_pub_id: accountBasic.chan_pub_id,
        user_id: this.user_id,
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

  addMaterials() {
    const add_modal = this.modalService.create({
      nzTitle: '素材库',
      nzWidth: 1200,
      nzContent: MaterialLibraryComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        materialSlt: this.materialSlt
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result !== 'onCancel') {
        this.materialSlt = JSON.parse(JSON.stringify(result));

        this.accountsAry.forEach((account, idx) => {
          const campaign = JSON.parse(JSON.stringify(this.campaignSettingCopy));
          campaign[0].basic.campaign_name = '1';
          campaign[0].basic.adgroup_title_num = this.titleSlt.length > 10 ? 10 : this.titleSlt.length;
          campaign[0].basic.adgroup_material_num = this.materialSlt.length > 10 ? 10 : this.materialSlt.length;
          campaign[0].basic.adgroup_num = Math.ceil(this.titleSlt.length / campaign[0].basic.adgroup_title_num) * Math.ceil(this.materialSlt.length / campaign[0].basic.adgroup_material_num);
          account.campaign = [...campaign];

          this.getMaxLength(idx, 0);

          // const campaignError = JSON.parse(JSON.stringify(this.campaignErrorTip));
          // const errorTip = {
          //   pub_account_id: account.basic.pub_account_id,
          //   has_error: false,
          //   account_enable_count: JSON.parse(JSON.stringify({
          //     is_show: false,
          //     tip_text: '不能超过今天可新建计划数'
          //   })),
          //   account_enable_campaign_count: JSON.parse(JSON.stringify({
          //     is_show: false,
          //     tip_text: '不能超过该账户下可新建广告组数'
          //   })),
          //   campaign: [...campaignError],
          // };
          // this.errorTipAry[idx] = {...errorTip};
        });
      }
    });
  }

  addDocuments() {
    const add_modal = this.modalService.create({
      nzTitle: '标题文案管理',
      nzWidth: 1000,
      nzContent: LaunchDocumentComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'launch-document',
      nzFooter: null, nzComponentParams: {
        titleSlt: this.titleSlt
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result !== 'onCancel') {
        this.titleSlt = JSON.parse(JSON.stringify(result));

        this.accountsAry.forEach((account, idx) => {
          const campaign = JSON.parse(JSON.stringify(this.campaignSettingCopy));
          campaign[0].basic.campaign_name = '1';
          campaign[0].basic.adgroup_title_num = this.titleSlt.length > 10 ? 10 : this.titleSlt.length;
          campaign[0].basic.adgroup_material_num = this.materialSlt.length > 10 ? 10 : this.materialSlt.length;
          campaign[0].basic.adgroup_num = Math.ceil(this.titleSlt.length / campaign[0].basic.adgroup_title_num) * Math.ceil(this.materialSlt.length / campaign[0].basic.adgroup_material_num);
          account.campaign = [...campaign];

          this.getMaxLength(idx, 0);
        });
      }
    });
  }

  changeAdgroupNum() {
    this.getMaxLength(this.curAccountIndex, this.curCampaignIndex);
  }

  updateCampaignDisabledStatus(chanPubId, campaignAry) {
    this.campaignDisabled[chanPubId] = [];
    campaignAry.forEach(campaign => {
      if (campaign.basic.campaign_select === '已有广告组') {
        this.campaignDisabled[chanPubId].push(campaign.basic.pub_campaign_id);
      }
    });
  }

  accountChange(event) {
    const accountsAryCopy = JSON.parse(JSON.stringify(this.accountsAry));
    const errorTipCopy = JSON.parse(JSON.stringify(this.errorTipAry));
    this.accountsAry = [];
    this.errorTipAry = [];

    event.forEach(item => {
      const filterItem = this.accountsList.filter(filter => filter.pub_account_id === item);
      if (!filterItem.length) {
        return;
      }

      const basic = { ...filterItem[0] };
      let accountExit = {}, campaign;
      accountsAryCopy.forEach(account => {
        if (account.basic.pub_account_id === item) {
          accountExit = { ...account };
        }
      });

      if (Object.keys(accountExit).length) {
        accountExit = JSON.parse(JSON.stringify(accountExit));
        this.accountsAry.push({
          basic: { ...accountExit['basic'] },
          campaign: [...accountExit['campaign']],
        });
      } else {
        campaign = JSON.parse(JSON.stringify(this.campaignSettingCopy));
        campaign[0].basic.campaign_name = '1';
        campaign[0].basic.adgroup_title_num = this.titleSlt.length > 10 ? 10 : this.titleSlt.length;
        campaign[0].basic.adgroup_material_num = this.materialSlt.length > 10 ? 10 : this.materialSlt.length;
        campaign[0].basic.adgroup_num = Math.ceil(this.titleSlt.length / campaign[0].basic.adgroup_title_num) * Math.ceil(this.materialSlt.length / campaign[0].basic.adgroup_material_num);
        this.accountsAry.push({
          basic: { ...basic },
          campaign: [...campaign],
        });

        // 获取账户下今天可建计划数
        this.getAccountEnabledCount(this.accountsAry[this.accountsAry.length - 1].basic);
        this.getMediaAudienceList(this.accountsAry[this.accountsAry.length - 1].basic);
        this.getMediaTargetList(this.accountsAry[this.accountsAry.length - 1].basic);
        this.getLaunchTemplateList(this.accountsAry[this.accountsAry.length - 1].basic);

      }

      let hasError = false, campaignError;
      let accountEnableCountError = {
        is_show: false,
        tip_text: '不能超过今天可新建计划数'
      };

      let accountEnableCampaignCount = {
        is_show: false,
        tip_text: '不能超过该账户下可新建广告组数'
      };

      const errorFilterItem = errorTipCopy.filter(filter => filter.pub_account_id === item);
      if (errorFilterItem.length) {
        hasError = errorFilterItem[0].has_error;
        accountEnableCountError = { ...errorFilterItem[0].account_enable_count };
        accountEnableCampaignCount = { ...errorFilterItem[0].account_enable_campaign_count };
        campaignError = JSON.parse(JSON.stringify(errorFilterItem[0].campaign));
      } else {
        campaignError = JSON.parse(JSON.stringify(this.campaignErrorTip));
      }

      const errorCampaign = {
        pub_account_id: filterItem[0].pub_account_id,
        has_error: hasError,
        account_enable_count: JSON.parse(JSON.stringify(accountEnableCountError)),
        account_enable_campaign_count: JSON.parse(JSON.stringify(accountEnableCampaignCount)),
        campaign: [...campaignError],
      };
      this.errorTipAry.push({ ...errorCampaign });
    });

    if (this.preAccountsAry.length < event.length) {
      this.curAccountIndex = event.length - 1;
      this.curCampaignIndex = 0;
      this.getMaxLength(event.length - 1, 0);
    } else {
      this.curAccountIndex = 0;
      this.curCampaignIndex = 0;
      this.curAdgroupIndex = 0;
      this.curCreativeIndex = 0;
    }

    this.preAccountsAry = JSON.parse(JSON.stringify(event));

    if (!this.localTemplateList.length) {
      this.getLaunchAudienceTemplateList();
    }



  }
  // 获取媒体落地页
  getMediaTargetList(accountBasic) {
    this.launchService
      .getMediaTargetList({
        cid: this.cid,
        chan_pub_id: accountBasic.chan_pub_id,
        // user_id: this.user
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

  // 获取账户下今天可建计划数
  getAccountEnabledCount(accountBasic) {
    const body = {
      chan_pub_id: accountBasic.chan_pub_id,
    };
    this.launchService
      .getAccountEnabledCount(body, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            const data = JSON.parse(JSON.stringify(results['data']));
            accountBasic['account_enable_count'] = data.ok_num;
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }


  // 投放模板 --- change事件
  launchTemplateChange(event, data) {

    const filterItem = this.launchTemplateList.filter(filter => filter.launch_template_id === event);

    if (filterItem.length) {
      const filter = JSON.parse(JSON.stringify(filterItem[0].launch_setting.adgroup));

      // 判断日期范围是否小于今天
      if (differenceInCalendarDays(new Date(filter.basic.time_range[0]), new Date()) < 0) {
        filter.basic.time_range[0] = new Date();
        filter.basic.start_time = null;
      }
      if (differenceInCalendarDays(new Date(filter.basic.time_range[1]), new Date()) < 0) {
        filter.basic.time_range[1] = new Date();
        filter.basic.end_time = null;
      }

      data.basic = { ...data.basic, ...filter.basic };
      data.audience_setting = { ...data.audience_setting, ...filter.audience_setting };
      data.creative = { ...data.creative, ...filter.creative };
      data.creative.basic.promotion_card = { ...deepCopy(this.adgroupInit.creative.basic.promotion_card) };
      data.audience_template_id = filter.audience_template_id;

      this.changeGroup(data.audience_setting);

      // 获取定向模板
      this.getLaunchAudienceTemplateList(true);
    }
  }

  // 本地模板 --- change事件
  localTemplateChange(event, data) {
    data.audience_setting = {};

    const filterItem = this.localTemplateList.filter(filter => filter.audience_template_id === event);

    if (filterItem.length) {
      this.reInitTarget = false;

      const audienceSetting = JSON.parse(filterItem[0].audience_setting);
      data.audience_setting = JSON.parse(JSON.stringify(audienceSetting));

      if (this.reInitTargetTimer) {
        clearTimeout(this.reInitTargetTimer);
      }
      this.reInitTargetTimer = setTimeout(() => {
        this.reInitTarget = true;
      }, 1000);
    }

  }

  getMaxLength(accountIdx, campaignIdx) {
    this.curAdgroupIndex = 0;
    this.curCreativeIndex = 0;

    if (!this.accountsAry.length) {
      return;
    }

    const material_num = this.accountsAry[accountIdx].campaign[campaignIdx].basic.adgroup_material_num;
    const title_num = this.accountsAry[accountIdx].campaign[campaignIdx].basic.adgroup_title_num;
    const isCross = this.accountsAry[accountIdx].campaign[campaignIdx].basic.isCross;

    if (material_num > this.materialSlt.length || material_num > 10) {
      this.message.error('每计划素材不能不能超过所选素材数且最多10个');
      return false;
    }

    if (title_num > this.titleSlt.length) {
      this.message.error('每计划标题不能超过所选标题数且最多10条');
      return false;
    }

    if (this.materialSlt.length > 0 && this.titleSlt.length > 0 && material_num > 0 && title_num > 0) {
      let adgroupNum;

      const materialSltSplit = arrayChunk(this.materialSlt, material_num);
      const titleSltSplit = arrayChunk(this.titleSlt, title_num);

      if (isCross) {
        adgroupNum = Math.ceil(this.titleSlt.length / title_num) * Math.ceil(this.materialSlt.length / material_num);
        this.accountsAry[accountIdx].campaign[campaignIdx].basic.adgroup_num = adgroupNum;

        // materialSltSplit.length * titleSltSplit.length = adgroup.length;
        if (materialSltSplit.length > titleSltSplit.length) {
          this.getCrossCreativeGroup(materialSltSplit, titleSltSplit, 'material', accountIdx, campaignIdx);
        } else {
          this.getCrossCreativeGroup(titleSltSplit, materialSltSplit, 'title', accountIdx, campaignIdx);
        }
      } else {
        adgroupNum = Math.max(Math.ceil(this.titleSlt.length / title_num), Math.ceil(this.materialSlt.length / material_num));
        this.accountsAry[accountIdx].campaign[campaignIdx].basic.adgroup_num = adgroupNum;

        // materialSltSplit.length * titleSltSplit.length = adgroup.length;
        if (materialSltSplit.length > titleSltSplit.length) {
          this.getCreativeGroup(materialSltSplit, titleSltSplit, 'material', accountIdx, campaignIdx);
        } else {
          this.getCreativeGroup(titleSltSplit, materialSltSplit, 'title', accountIdx, campaignIdx);
        }
      }

    }
  }

  getCrossCreativeGroup(maxAry, minAry, tag, accountIdx, campaignIdx) {
    this.accountsAry[accountIdx].campaign[campaignIdx].adgroup = [];

    this.errorTipAry[accountIdx]['has_error'] = false;
    this.errorTipAry[accountIdx]['account_enable_count']['is_show'] = false;
    this.errorTipAry[accountIdx]['account_enable_campaign_count']['is_show'] = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].basic = JSON.parse(JSON.stringify(this.campaignErrorTip[0].basic));
    this.errorTipAry[accountIdx].campaign[campaignIdx].has_error = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup = [];
    maxAry.forEach((maxItem, maxIdx) => {
      minAry.forEach((minItem, minIdx) => {
        let idx = 0;
        const newGroup = JSON.parse(JSON.stringify(this.adgroupInit));
        if (maxItem.length > minItem.length) {
          maxItem.forEach(lItem => {
            if (this.material_style === 2) {
              if (isArray(lItem) && lItem.find(item => item.material_id)) {
                newGroup.creative.detail.push({
                  material_ids: lItem,
                  title: minItem[idx],
                  half_title: "",
                });
              } else {
                newGroup.creative.detail.push({
                  material_ids: minItem[idx],
                  title: lItem,
                  half_title: "",
                });
              }
            } else {
              if (lItem['material_id']) {
                newGroup.creative.detail.push({
                  materialItem: {
                    material_id: lItem['material_id'],
                    upload_video_width: lItem['upload_video_width'],
                    upload_video_height: lItem['upload_video_height'],
                  },
                  title: minItem[idx]
                });
              } else {
                newGroup.creative.detail.push({
                  materialItem: {
                    material_id: minItem[idx]['material_id'],
                    upload_video_width: minItem[idx]['upload_video_width'],
                    upload_video_height: minItem[idx]['upload_video_height'],
                  },
                  title: lItem
                });
              }
            }
            idx = idx >= (minItem.length - 1) ? 0 : idx + 1;
          });
        } else {
          minItem.forEach(lItem => {
            if (this.material_style === 2) {
              if (lItem.find(item => item.material_id)) {
                newGroup.creative.detail.push({
                  material_ids: lItem,
                  title: maxItem[idx],
                  half_title: "",
                });
              } else {
                newGroup.creative.detail.push({
                  material_ids: maxItem[idx],
                  title: lItem,
                  half_title: "",
                });
              }
            } else {
              if (lItem['material_id']) {
                newGroup.creative.detail.push({
                  materialItem: {
                    material_id: lItem['material_id'],
                    upload_video_width: lItem['upload_video_width'],
                    upload_video_height: lItem['upload_video_height'],
                  },
                  title: maxItem[idx]
                });
              } else {
                newGroup.creative.detail.push({
                  materialItem: {
                    material_id: maxItem[idx]['material_id'],
                    upload_video_width: maxItem[idx]['upload_video_width'],
                    upload_video_height: maxItem[idx]['upload_video_height'],
                  },
                  title: lItem
                });
              }
            }
            idx = idx >= (maxItem.length - 1) ? 0 : idx + 1;
          });
        }

        newGroup.basic.adgroup_name = (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length + 1) + '';

        if (this.material_style != 2) {
          if (tag === 'material') {
            newGroup.creative.program_detail.videoList = [];
            maxAry[maxIdx].forEach(item => {
              newGroup.creative.program_detail.videoList.push(
                {
                  material_id: item['material_id'],
                  upload_video_width: item['upload_video_width'],
                  upload_video_height: item['upload_video_height'],
                }
              );
            });
            newGroup.creative.program_detail.title_list = minAry[minIdx].map(item => item);
          } else {
            newGroup.creative.program_detail.videoList = [];
            minAry[minIdx].forEach(item => {
              newGroup.creative.program_detail.videoList.push(
                {
                  material_id: item['material_id'],
                  upload_video_width: item['upload_video_width'],
                  upload_video_height: item['upload_video_height'],
                }
              );
            });
            newGroup.creative.program_detail.title_list = maxAry[maxIdx].map(item => item);
          }
        }



        if (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length < 500) {
          this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.push(newGroup);
          this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup.push(JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0])));
        }
      });
    });

  }

  getCreativeGroup(maxAry, minAry, tag, accountIdx, campaignIdx) {
    this.accountsAry[accountIdx].campaign[campaignIdx].adgroup = [];

    this.errorTipAry[accountIdx]['has_error'] = false;
    this.errorTipAry[accountIdx]['account_enable_count']['is_show'] = false;
    this.errorTipAry[accountIdx]['account_enable_campaign_count']['is_show'] = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].basic = JSON.parse(JSON.stringify(this.campaignErrorTip[0].basic));
    this.errorTipAry[accountIdx].campaign[campaignIdx].has_error = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup = [];

    let minIdx = 0;
    maxAry.forEach((maxItem, maxIdx) => {
      const newGroup = JSON.parse(JSON.stringify(this.adgroupInit));
      let idx = 0;

      if (maxItem.length > minAry[minIdx].length) {
        maxItem.forEach(lItem => {
          if (this.material_style === 2) {
            if (isArray(lItem) && lItem.find(s_item => s_item.material_id)) {
              newGroup.creative.detail.push({
                material_ids: lItem,
                title: minAry[minIdx][idx],
                half_title: "",
              });
            } else {
              newGroup.creative.detail.push({
                material_ids: minAry[minIdx][idx],
                title: lItem,
                half_title: "",
              });
            }
          } else {
            if (lItem['material_id']) {
              newGroup.creative.detail.push({
                materialItem: {
                  material_id: lItem['material_id'],
                  upload_video_width: lItem['upload_video_width'],
                  upload_video_height: lItem['upload_video_height'],
                },
                title: minAry[minIdx][idx]
              });
            } else {
              newGroup.creative.detail.push({
                materialItem: {
                  material_id: minAry[minIdx][idx]['material_id'],
                  upload_video_width: minAry[minIdx][idx]['upload_video_width'],
                  upload_video_height: minAry[minIdx][idx]['upload_video_height'],
                },
                title: lItem
              });
            }
          }
          idx = idx >= (minAry[minIdx].length - 1) ? 0 : idx + 1;
        });
      } else {
        minAry[minIdx].forEach(lItem => {
          if (this.material_style === 2) {
            if (lItem.find(s_item => s_item.material_id)) {
              newGroup.creative.detail.push({
                material_ids: lItem,
                title: maxItem[idx],
                half_title: "",
              });
            } else {
              newGroup.creative.detail.push({
                material_ids: maxItem[idx],
                title: lItem,
                half_title: "",
              });
            }
          } else {
            if (lItem['material_id']) {
              newGroup.creative.detail.push({
                materialItem: {
                  material_id: lItem['material_id'],
                  upload_video_width: lItem['upload_video_width'],
                  upload_video_height: lItem['upload_video_height'],
                },
                title: maxItem[idx]
              });
            } else {
              newGroup.creative.detail.push({
                materialItem: {
                  material_id: maxItem[idx]['material_id'],
                  upload_video_width: maxItem[idx]['upload_video_width'],
                  upload_video_height: maxItem[idx]['upload_video_height'],
                },
                title: lItem
              });
            }
          }
          idx = idx >= (maxItem.length - 1) ? 0 : idx + 1;
        });
      }

      if (this.material_style != 2) {
        if (tag === 'material') {
          newGroup.creative.program_detail.videoList = [];
          maxAry[maxIdx].forEach(item => {
            newGroup.creative.program_detail.videoList.push(
              {
                material_id: item['material_id'],
                upload_video_width: item['upload_video_width'],
                upload_video_height: item['upload_video_height'],
              }
            );
          });
          newGroup.creative.program_detail.title_list = minAry[minIdx].map(item => item);
        } else {
          newGroup.creative.program_detail.videoList = [];
          minAry[minIdx].forEach(item => {
            newGroup.creative.program_detail.videoList.push(
              {
                material_id: item['material_id'],
                upload_video_width: item['upload_video_width'],
                upload_video_height: item['upload_video_height'],
              }
            );
          });
          newGroup.creative.program_detail.title_list = maxAry[maxIdx].map(item => item);
        }
      }


      newGroup.basic.adgroup_name = (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length + 1) + '';
      if (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length < 500) {
        this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.push(newGroup);
        this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup.push(JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0])));
      }

      minIdx = minIdx >= (minAry.length - 1) ? 0 : minIdx + 1;
    });

  }

  // 推广目的 --- Change
  onLandingTypeChange(data) {
    data.adgroup.forEach(adgroup => {
      adgroup.creative.basic.action_text = null;
      adgroup.basic.convert_id = null;
      adgroup.launch_template_id = null;
      adgroup.audience_template_id = null;
      adgroup.audience_setting = {};
    });
    this.changeGroup();

    // 获取投放模板
    this.getLaunchTemplateList(this.accountsAry[this.curAccountIndex].basic);

    // 获取定向模板
    this.getLaunchAudienceTemplateList();
  }

  changeadGroupFalg(adgroup) {
    adgroup.basic = { ...adgroup.basic };
    // adgroup.creative.basic.promotion_card = {...adgroup.creative.basic.promotion_card};
    this.changeGroup();

    // 获取定向模板
    this.getLaunchAudienceTemplateList();

    if (!(adgroup.basic.delivery_range === 'DEFAULT' && (adgroup.creative.basic.launch_positon === 'smart_inventory' || (adgroup.creative.basic.launch_positon === 'inventory_type' && adgroup.creative.basic.inventory_type.includes('INVENTORY_AWEME_FEED')) || (adgroup.creative.basic.launch_positon === 'scene_inventory' && adgroup.creative.basic.scene_inventory === 'VIDEO_SCENE')))) {
      adgroup.creative.basic.promotion_card = { ...deepCopy(this.adgroupInit.creative.basic.promotion_card) };
    } else if (adgroup.basic.download_type !== adgroup.creative.basic.promotion_card.download_type) {
      adgroup.creative.basic.promotion_card = { ...deepCopy(this.adgroupInit.creative.basic.promotion_card) };
    }

  }

  changeGroup(audienceSetting?) {
    this.reInitTarget = false;

    const curGroup = this.accountsAry[this.curAccountIndex].campaign[this.curCampaignIndex].adgroup[this.curAdgroupIndex];
    const landing_type = this.accountsAry[this.curAccountIndex].campaign[this.curCampaignIndex].basic.landing_type; // 推广目的
    const delivery_range = curGroup.basic.delivery_range; // 投放范围
    const download_type = curGroup.basic.download_type; // 应用下载方式
    const app_type = curGroup.basic.app_type; // 应用下载类型

    if (((landing_type === 'APP' && download_type === 'EXTERNAL_URL') || landing_type === 'LINK') && delivery_range === 'DEFAULT') {
      curGroup.cur_group_flag = '0_0';
      curGroup.audience_setting = {};

    } else if (((landing_type === 'APP' && download_type === 'EXTERNAL_URL') || landing_type === 'LINK') && delivery_range === 'UNION') {
      curGroup.cur_group_flag = '0_1';
      curGroup.audience_setting = {};

    } else if (landing_type === 'APP' && download_type === 'DOWNLOAD_URL' && app_type === 'APP_ANDROID' && delivery_range === 'DEFAULT') {
      curGroup.cur_group_flag = '1_0';
      curGroup.audience_setting = {};

    } else if (landing_type === 'APP' && download_type === 'DOWNLOAD_URL' && app_type === 'APP_ANDROID' && delivery_range === 'UNION') {
      curGroup.cur_group_flag = '1_1';
      curGroup.audience_setting = {};

    } else if (landing_type === 'APP' && download_type === 'DOWNLOAD_URL' && app_type === 'APP_IOS' && delivery_range === 'DEFAULT') {
      curGroup.cur_group_flag = '2_0';
      curGroup.audience_setting = {};

    } else if (landing_type === 'APP' && download_type === 'DOWNLOAD_URL' && app_type === 'APP_IOS' && delivery_range === 'UNION') {
      curGroup.cur_group_flag = '2_1';
      curGroup.audience_setting = {};

    }

    if (audienceSetting) {
      curGroup.audience_setting = { ...audienceSetting };

      if (this.reInitTargetTimer) {
        clearTimeout(this.reInitTargetTimer);
      }
      this.reInitTargetTimer = setTimeout(() => {
        this.reInitTarget = true;

      }, 1000);
    } else {
      this.reInitTarget = true;
    }

  }

  currentTabChange(tag) {
    if (tag === 'campaign') {
      this.curCampaignIndex = 0;
      this.getMediaAudienceList(this.accountsAry[this.curAccountIndex].basic);
      this.getMediaTargetList(this.accountsAry[this.curAccountIndex].basic);
    }
    this.curAdgroupIndex = 0;
    this.curCreativeIndex = 0;

    // 获取投放模板
    this.getLaunchTemplateList(this.accountsAry[this.curAccountIndex].basic, true);

    // 获取定向模板
    this.getLaunchAudienceTemplateList(true);
  }

  curAdgroupTabChange(campaign) {
    this.curCreativeIndex = 0;

    // 获取定向模板
    if (!campaign.adgroup[this.curAdgroupIndex].audience_template_id) {
      this.getLaunchAudienceTemplateList();
    }
  }

  closeTab(index, data, errorData, tag?): void {
    switch (tag) {
      case 'account':
        this.curAccountIndex = 0;
        break;
      case 'campaign':
        this.curCampaignIndex = 0;
        break;
      case 'adgroup':
        this.curAdgroupIndex = 0;
        break;
      case 'creative':
        this.curCreativeIndex = 0;
        break;
    }
    data.splice(index, 1);
    if (errorData.length) {
      errorData.splice(index, 1);
    }
  }

  copyCurAccountParams(data, ary, errorData) {
    ary.forEach((item, idx) => {
      const copyData = JSON.parse(JSON.stringify(data.campaign));
      copyData.forEach(campaign => {
        campaign.adgroup.forEach(adgroup => {
          adgroup.basic.convert_id = null;
          adgroup.audience_setting['retargeting_tags_exclude'] = [];
          adgroup.audience_setting['retargeting_tags_include'] = [];
          adgroup.audience_package_id = null;
          if (adgroup.basic.site_id) {
            adgroup.basic.site_id = null;
            adgroup.basic.external_url = null;
          }

          if (adgroup.creative.site_id) {
            adgroup.creative.basic.site_id = null;
            adgroup.creative.basic.external_url = null;
          }
        });
      });
      if (this.curAccountIndex !== idx) {
        item.campaign = JSON.parse(JSON.stringify(copyData));
      }
    });

    this.errorTipAry.forEach((errorItem, errorIdx) => {
      if (this.curAccountIndex !== errorIdx) {
        const copyErrorData = JSON.parse(JSON.stringify(errorData));
        errorItem.campaign = JSON.parse(JSON.stringify(copyErrorData.campaign));
        errorItem.account_enable_count = JSON.parse(JSON.stringify({
          is_show: false,
          tip_text: '不能超过今天可新建计划数'
        }));
        errorItem.account_enable_campaign_count = JSON.parse(JSON.stringify({
          is_show: false,
          tip_text: '不能超过该账户下可新建广告组数'
        }));
        errorItem.has_error = copyErrorData.has_error;
      }
    });

    this.message.success('复制成功');
  }

  copyCurrent(data, ary, errorData?, tag?) {
    const curData = JSON.parse(JSON.stringify(data));
    if (tag === 'campaign') {
      if (data.basic.campaign_select === '已有广告组') {
        curData.basic.campaign_select = '新建广告组';
        curData.basic.pub_campaign_id = null;
      }
      curData.basic.campaign_name = data.basic.campaign_name + '-' + (ary.length + 1);
      errorData.push(JSON.parse(JSON.stringify(errorData[this.curCampaignIndex])));
    } else if (tag === 'adgroup') {
      curData.basic.adgroup_name = data.basic.adgroup_name + '-' + (ary.length + 1);
      errorData.push(JSON.parse(JSON.stringify(errorData[this.curAdgroupIndex])));
    }
    ary.push({ ...curData });

    this.message.success('复制成功');
  }

  copyAdgroupParams(data, ary) {
    const copyData = JSON.parse(JSON.stringify(data));

    for (let i = 0; i < ary.length; i++) {
      ary[i].basic = JSON.parse(JSON.stringify(copyData.basic));
      ary[i].launch_template_id = copyData.launch_template_id;
      ary[i].audience_template_id = copyData.audience_template_id;
      ary[i].audience_setting = JSON.parse(JSON.stringify(copyData.audience_setting));
      ary[i].creative.basic = JSON.parse(JSON.stringify(copyData.creative.basic));
      ary[i].cur_group_flag = copyData.cur_group_flag;

      ary[i].basic.adgroup_name = ary[i].basic.adgroup_name + '-' + (i + 1);
    }

    this.message.success('复制成功');
  }

  changeTargetType(value, data) {
    value === 'local' ? data.audience_package_id = null : data.audience_template_id = null;
  }

  doCancel() {
    history.go(-1);
  }

  doSave() {
    if (!this.materialSlt.length) {
      this.message.error('请选择素材');
      return false;
    }

    if (!this.titleSlt.length) {
      this.message.error('请选择文案');
      return false;
    }

    if (!this.accountsAry.length) {
      this.message.error('请选择账号');
      return false;
    }

    // this.defaultData.materials = [...this.materialSlt];
    // this.defaultData.titles = [...this.titleSlt];

    const isValid = this.checkBasicData();

    if (isValid) {
      this.message.error('请完善参数信息！');
      return;
    }

    this.accountsAry.forEach(account => {
      account['campaign'].forEach(campaign => {
        campaign['adgroup'].forEach(adgroup => {

          // 投放时间 --- 起始时间
          if (adgroup.basic.time_range) {
            adgroup.basic.start_time = format(new Date(adgroup.basic.time_range[0]), 'yyyy-MM-dd');
            adgroup.basic.end_time = format(new Date(adgroup.basic.time_range[1]), 'yyyy-MM-dd');
          }

          // 优先广告位
          adgroup.creative.basic.smart_inventory = adgroup.creative.basic.launch_positon === 'smart_inventory' ? 1 : 0;

          // 创意分类
          if (adgroup.creative.basic.third_industry_id_list.length > 1) {
            adgroup.creative.basic.third_industry_id = adgroup.creative.basic.third_industry_id_list[2];
          }

          // 素材
          adgroup.creative.detail.forEach(detail => {
            if (this.material_style !== 2) {
              detail.material = detail.materialItem['material_id'];
            }
          });

          adgroup.creative.basic.style = this.material_style;
          if (this.material_style !== 3) {
            adgroup.creative.basic.promotion_card = { ...deepCopy(this.adgroupInit.creative.basic.promotion_card) };
            adgroup.creative.basic.card_template_id = null;
          }

          adgroup.creative.program_detail.video_list = adgroup.creative.program_detail.videoList.map(item => item['material_id']);
        });
      });
    });


    this.defaultData.accounts = [...this.accountsAry];

    if (!this.submiting) {
      this.submiting = true;
      this.launchService
        .createLaunch(this.defaultData, {
          cid: this.cid,
        })
        .subscribe(
          (results: any) => {
            this.submiting = false;
            if (results.status_code !== 200) {

            } else {
              this.message.success('任务已提交，请到任务记录查看任务结果');
              this.doCancel();
            }
          },
          (err: any) => {
            this.message.error('数据获取异常，请重试');
            this.submiting = false;
          },
          () => { },
        );

    }

  }

  checkBasicData() {
    let isValid = false;

    this.accountsAry.forEach((account, accountIndex) => {
      const errorAccount = this.errorTipAry[accountIndex];
      errorAccount['has_error'] = false;

      let accountAdgroup = 0; // 该账户下组合计划数

      const campaignName = [];

      account['campaign'].forEach((campaign, campaignIndex) => {
        const errorCampaign = errorAccount.campaign[campaignIndex];
        errorCampaign['has_error'] = false;

        // 每计划标题
        if (!campaign.basic.adgroup_title_num || campaign.basic.adgroup_title_num > this.titleSlt.length) {
          errorCampaign.basic.adgroup_title_num.is_show = true;
          errorCampaign['has_error'] = true;
          errorAccount['has_error'] = true;
          isValid = true;
        } else {
          errorCampaign.basic.adgroup_title_num.is_show = false;
        }

        // 每计划素材
        if (!campaign.basic.adgroup_material_num || campaign.basic.adgroup_material_num > this.materialSlt.length) {
          errorCampaign.basic.adgroup_material_num.is_show = true;
          errorCampaign['has_error'] = true;
          errorAccount['has_error'] = true;
          isValid = true;
        } else {
          errorCampaign.basic.adgroup_material_num.is_show = false;
        }

        // 广告组名称
        if (campaign.basic.campaign_select === '新建广告组') {
          const campaignNameLength = this.materialsService.getStringLength(campaign.basic.campaign_name, []);
          if (campaignNameLength < 1 || campaignNameLength > 50) {
            errorCampaign.basic.campaign_name.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            if (campaignName.includes(campaign.basic.campaign_name.toLowerCase())) {
              errorCampaign.basic.campaign_name_repeat.is_show = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              campaignName.push(campaign.basic.campaign_name.toLowerCase());
              errorCampaign.basic.campaign_name_repeat.is_show = false;
            }

            errorCampaign.basic.campaign_name.is_show = false;
          }

          // 预算
          if (campaign.basic.budget_slt === 'budget') {
            if (campaign.basic.budget < 1000 || campaign.basic.budget > 9999999.99) {
              errorCampaign.basic.budget.is_show = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorCampaign.basic.budget.is_show = false;
            }
          }

        } else if (campaign.basic.campaign_select === '已有广告组') {
          if (!campaign.basic.pub_campaign_id) {
            errorCampaign.basic.pub_campaign_id.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorCampaign.basic.pub_campaign_id.is_show = false;
          }

          // 该广告组下可新建计划
          if (campaign.basic.campaign_enable_count < campaign['adgroup'].length) {
            errorCampaign.basic.campaign_enable_count.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorCampaign.basic.campaign_enable_count.is_show = false;
          }
        }

        accountAdgroup += campaign['adgroup'].length;

        campaign['adgroup'].forEach((adgroup, adgroupIndex) => {
          const errorAdgroup = errorAccount.campaign[campaignIndex].adgroup[adgroupIndex];
          errorAdgroup['has_error'] = false;

          const groupNameLength = this.materialsService.getStringLength(adgroup.basic.adgroup_name, []);
          // 计划名称
          if (groupNameLength < 1 || groupNameLength > 50) {
            errorAdgroup.basic.adgroup_name.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.basic.adgroup_name.is_show = false;
          }

          // 应用下载链接, 应用包名
          if (campaign.basic.landing_type === 'APP' && adgroup.basic.download_type === 'DOWNLOAD_URL') {
            if (!this.urlReg.test(adgroup.basic.download_url)) {
              errorAdgroup.basic.download_url.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.download_url.is_show = false;
            }

            if (!adgroup.basic.package) {
              errorAdgroup.basic.package.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.package.is_show = false;
            }
          }

          // 落地页链接
          if ((campaign.basic.landing_type === 'APP' && adgroup.basic.download_type === 'EXTERNAL_URL') || campaign.basic.landing_type === 'LINK') {
            if (!this.urlReg.test(adgroup.basic.external_url)) {
              errorAdgroup.basic.external_url.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.external_url.is_show = false;
            }
          }

          // 应用直达链接
          if (campaign.basic.landing_type === 'APP' && adgroup.basic.download_type === 'EXTERNAL_URL') {
            if (adgroup.basic.is_open_url === 1) {
              if (!this.urlReg.test(adgroup.basic.open_url)) {
                errorAdgroup.basic.open_url.is_show = true;
                errorAdgroup['has_error'] = true;
                errorCampaign['has_error'] = true;
                errorAccount['has_error'] = true;
                isValid = true;
              } else {
                errorAdgroup.basic.open_url.is_show = false;
              }
            }
          }

          // 转化目标
          if (account.basic.chan_pub_id && (adgroup.basic.pricing === 'PRICING_OCPC' || adgroup.basic.pricing === 'PRICING_OCPM')) {
            if (!adgroup.basic.convert_id) {
              errorAdgroup.basic.convert_id.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.convert_id.is_show = false;
            }
          }

          // 日预算
          if (adgroup.basic.pricing === 'PRICING_CPC' || adgroup.basic.pricing === 'PRICING_CPM') {
            if (adgroup.basic.budget < 100 || adgroup.basic.budget > 9999999.99) {
              errorAdgroup.basic.budget.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.budget.is_show = false;
            }
          } else if (adgroup.basic.pricing === 'PRICING_OCPC' || adgroup.basic.pricing === 'PRICING_OCPM') {
            if (adgroup.basic.budget < 300 || adgroup.basic.budget > 9999999.99) {
              errorAdgroup.basic.budget.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.budget.is_show = false;
            }
          }

          // 出价
          if (adgroup.basic.smart_bid_type === 'SMART_BID_CUSTOM') {
            if (adgroup.basic.pricing === 'PRICING_CPC') {
              if (adgroup.basic.bid < 0.2 || adgroup.basic.bid > 100) {
                errorAdgroup.basic.bid.is_show = true;
                errorAdgroup['has_error'] = true;
                errorCampaign['has_error'] = true;
                errorAccount['has_error'] = true;
                isValid = true;
              } else {
                errorAdgroup.basic.bid.is_show = false;
              }
            } else if (adgroup.basic.pricing === 'PRICING_CPM') {
              if (adgroup.basic.bid < 4 || adgroup.basic.bid > 100) {
                errorAdgroup.basic.bid.is_show = true;
                errorAdgroup['has_error'] = true;
                errorCampaign['has_error'] = true;
                errorAccount['has_error'] = true;
                isValid = true;
              } else {
                errorAdgroup.basic.bid.is_show = false;
              }
            } else if (adgroup.basic.pricing === 'PRICING_OCPC' || adgroup.basic.pricing === 'PRICING_OCPM') {
              if (adgroup.basic.bid < 0.1 || adgroup.basic.bid > adgroup.basic.budget || adgroup.basic.bid > 10000) {
                errorAdgroup.basic.bid.is_show = true;
                errorAdgroup['has_error'] = true;
                errorCampaign['has_error'] = true;
                errorAccount['has_error'] = true;
                isValid = true;
              } else {
                errorAdgroup.basic.bid.is_show = false;
              }
            }
          }
          // 广告出价
          if (adgroup.basic.smart_bid_type === 'SMART_BID_CONSERVATIVE') {
            if (adgroup.basic.adjust_cpa === 1 && adgroup.basic.pricing === 'PRICING_OCPM') {
              if (adgroup.basic.bid < 0.1 || adgroup.basic.bid > adgroup.basic.budget || adgroup.basic.bid > 10000) {
                errorAdgroup.basic.bid.is_show = true;
                errorAdgroup['has_error'] = true;
                errorCampaign['has_error'] = true;
                errorAccount['has_error'] = true;
                isValid = true;
              } else {
                errorAdgroup.basic.bid.is_show = false;
              }
            }
          }

          // 深度优化出价
          if (adgroup.basic.deep_bid_type === 'DEEP_BID_MIN') {
            if (!adgroup.basic.deep_cpabid) {
              errorAdgroup.basic.deep_cpabid.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.deep_cpabid.is_show = false;
            }
          }

          // 深度转化ROI系数
          if (adgroup.basic.deep_bid_type === 'ROI_COEFFICIENT') {
            if (!adgroup.basic.roi_goal) {
              errorAdgroup.basic.roi_goal.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.roi_goal.is_show = false;
            }
          }

          // 按媒体指定位置
          if (adgroup.basic.delivery_range === 'DEFAULT' && adgroup.creative.basic.launch_positon === 'inventory_type') {
            if (!adgroup.creative.basic.inventory_type.length) {
              errorAdgroup.creative.basic.inventory_type.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.creative.basic.inventory_type.is_show = false;
            }
          }

          // 媒体定向
          if (adgroup.basic.target_select === 'media') {
            if (!adgroup.audience_package_id) {
              errorAdgroup.basic.audience_package_id.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.audience_package_id.is_show = false;
            }
          }

          // 创意分类
          if (!adgroup.creative.basic.third_industry_id_list.length) {
            errorAdgroup.creative.basic.third_industry_id.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.creative.basic.third_industry_id.is_show = false;
          }

          // 创意标签
          if (!adgroup.creative.basic.ad_keywords.length) {
            errorAdgroup.creative.basic.ad_keywords.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.creative.basic.ad_keywords.is_show = false;
          }

          // 来源
          if ((campaign.basic.landing_type === 'APP' && adgroup.basic.download_type === 'EXTERNAL_URL') || campaign.basic.landing_type === 'LINK') {
            if (adgroup.creative.basic.source.length < 2 || adgroup.creative.basic.source.length > 10) {
              errorAdgroup.creative.basic.source.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.creative.basic.source.is_show = false;
            }
          }

          // 行动号召
          if (!adgroup.creative.basic.action_text) {
            errorAdgroup.creative.basic.action_text.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.creative.basic.action_text.is_show = false;
          }

          // 应用名, Android应用下载详情页
          if (campaign.basic.landing_type === 'APP' && adgroup.basic.download_type === 'DOWNLOAD_URL') {
            if (!adgroup.creative.basic.app_name) {
              errorAdgroup.creative.basic.app_name.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.creative.basic.app_name.is_show = false;
            }

            if (adgroup.basic.app_type === 'APP_ANDROID') {
              if (!this.urlReg.test(adgroup.creative.basic.web_url)) {
                errorAdgroup.creative.basic.web_url.is_show = true;
                errorAdgroup['has_error'] = true;
                errorCampaign['has_error'] = true;
                errorAccount['has_error'] = true;
                isValid = true;
              } else {
                errorAdgroup.creative.basic.web_url.is_show = false;
              }
            }
          }

          // 展示监测链接
          if (adgroup.creative.basic.track_url && !this.urlReg.test(adgroup.creative.basic.track_url)) {
            errorAdgroup.creative.basic.track_url.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.creative.basic.track_url.is_show = false;
          }

          // 卡片模板
          if (this.material_style === 3 && adgroup.creative.basic.promotion_card.card_id === null && adgroup.basic.delivery_range === 'DEFAULT' && (adgroup.creative.basic.launch_positon === 'smart_inventory' || (adgroup.creative.basic.launch_positon === 'inventory_type' && adgroup.creative.basic.inventory_type.includes('INVENTORY_AWEME_FEED')) || (adgroup.creative.basic.launch_positon === 'scene_inventory' && adgroup.creative.basic.scene_inventory === 'VIDEO_SCENE'))) {
            errorAdgroup.creative.basic.card_id.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.creative.basic.card_id.is_show = false;
          }

          // 点击监测链接
          if (adgroup.creative.basic.action_track_url && !this.urlReg.test(adgroup.creative.basic.action_track_url)) {
            errorAdgroup.creative.basic.action_track_url.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.creative.basic.action_track_url.is_show = false;
          }

          if (adgroup.delivery_range === 'DEFAULT') {
            // 视频播放监测链接
            if (adgroup.creative.basic.video_play_track_url && !this.urlReg.test(adgroup.creative.basic.video_play_track_url)) {
              errorAdgroup.creative.basic.video_play_track_url.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.creative.basic.video_play_track_url.is_show = false;
            }

            // 视频播放完毕监测链接
            if (adgroup.creative.basic.video_play_done_track_url && !this.urlReg.test(adgroup.creative.basic.video_play_done_track_url)) {
              errorAdgroup.creative.basic.video_play_done_track_url.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.creative.basic.video_play_done_track_url.is_show = false;
            }

            // 视频有效播放监测链接
            if (adgroup.creative.basic.video_play_effective_track_url && !this.urlReg.test(adgroup.creative.basic.video_play_effective_track_url)) {
              errorAdgroup.creative.basic.video_play_effective_track_url.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.creative.basic.video_play_effective_track_url.is_show = false;
            }
          }

        });
      });

      if (account.basic['account_enable_count'] < accountAdgroup) {
        errorAccount['account_enable_count'].is_show = true;
      } else {
        errorAccount['account_enable_count'].is_show = false;
      }

      if (account.basic['account_enable_campaign_count'] < account['campaign'].length) {
        errorAccount['account_enable_campaign_count'].is_show = true;
      } else {
        errorAccount['account_enable_campaign_count'].is_show = false;
      }
    });


    return isValid;
  }

}
