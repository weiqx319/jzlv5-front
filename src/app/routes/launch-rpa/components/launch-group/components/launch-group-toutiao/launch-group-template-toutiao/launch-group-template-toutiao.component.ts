import {
  Component, ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { differenceInCalendarDays, format } from "date-fns";
import { LaunchService } from "../../../../../../../module/launch/service/launch.service";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { GlobalTemplateComponent } from "../../../../../../../shared/template/global-template/global-template.component";
import { LaunchMaterialImageModalComponent } from '../../../../../modal/launch-material-image-modal/launch-material-image-modal.component';
import { LaunchMaterialVideoModalComponent } from '../../../../../modal/launch-material-video-modal/launch-material-video-modal.component';
import { LaunchTitleModalComponent } from '../../../../../modal/launch-title-modal/launch-title-modal.component';
import { getStringLength } from "../../../../../../../shared/util/util";
import { isArray, isObject } from "@jzl/jzl-util";

import { deepCopy } from '@jzl/jzl-util';
import { LaunchMaterialCoverModalComponent } from "../../../../../modal/launch-material-cover-modal/launch-material-cover-modal.component";
import { MenuService } from "../../../../../../../core/service/menu.service";

@Component({
  selector: 'app-launch-group-template-toutiao',
  templateUrl: './launch-group-template-toutiao.component.html',
  styleUrls: ['./launch-group-template-toutiao.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchGroupTemplateToutiaoComponent implements OnInit {
  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  @ViewChild('curCampaignTextArea') curCampaignTextArea: ElementRef;
  @ViewChild('curAdgroupTextArea') curAdgroupTextArea: ElementRef;


  @Output() cancel = new EventEmitter<any>();

  @Input() accountsList;

  @Input() data;

  @Input() isEdit;

  @Input() projectTemplateId;

  @Input() isCopy;

  public tempTitleList = [];
  public materialList = [];

  public tableHeight = document.body.clientHeight - 60;
  public tableWidth = document.body.clientWidth - 150 - 130;

  public anchorList = [
    {
      key: '#select_account',
      name: '选择账户',
      sub: [
        { key: '#change_account', name: '选择账户' },
        { key: '#template_name', name: '模板名称' },
      ]
    },
    {
      key: '#campaign_start',
      name: '广告组',
      sub: [
        { key: '#promotion_objective', name: '推广目的' },
        { key: '#budget', name: '预算' },
        { key: '#adgroup_name', name: '名称' },
      ]
    },
    {
      key: '#adgroup_start',
      name: '计划',
      sub: [
        { key: '#launch_objective', name: '投放目标' },
        { key: '#launch_range', name: '投放范围' },
        { key: '#user_target', name: '用户定向' },
        { key: '#budget_and_bid', name: '预算与出价' },
      ]
    },
    {
      key: '#creative_start',
      name: '创意',
      sub: [
        { key: '#material_title', name: '素材标题' },
        { key: '#creative_label', name: '创意标签' },
        { key: '#creative_setting', name: '创意设置' },
        { key: '#card_template', name: '卡片模板' },
      ]
    },
    // {
    //   key: '#other',
    //   name: '其他',
    //   sub: [
    //     {key: '#estimate_adgroup_num', name: '预估计划数'},
    //     {key: '#timing_setting', name: '定时设置'},
    //   ]
    // },
  ];

  public launchTargetList = [
    {
      "label": "转化量+OCPM",
      "value": "PRICING_OCPM",
      "checked": false
    },
    {
      "label": "转化量+OCPC",
      "value": "PRICING_OCPC",
      "checked": false
    },
    {
      "label": "展现量+CPM",
      "value": "PRICING_CPM",
      "checked": false
    },
    {
      "label": "点击量+CPC",
      "value": "PRICING_CPC",
      "checked": false
    },
  ];

  public flowControlModeList = {
    'PRICING_OCPM': [
      { key: 'FLOW_CONTROL_MODE_FAST', name: '优先跑量' },
      { key: 'FLOW_CONTROL_MODE_BALANCE', name: '均衡投放' },
      { key: 'FLOW_CONTROL_MODE_SMOOTH', name: '控制成本上限' },
    ],
    'PRICING_OCPC': [
      { key: 'FLOW_CONTROL_MODE_FAST', name: '优先跑量' },
      { key: 'FLOW_CONTROL_MODE_BALANCE', name: '均衡投放' },
      { key: 'FLOW_CONTROL_MODE_SMOOTH', name: '控制成本上限' },
    ],
    'PRICING_CPC': [
      { key: 'FLOW_CONTROL_MODE_FAST', name: '加速投放' },
      { key: 'FLOW_CONTROL_MODE_SMOOTH', name: '标准投放' },
    ],
    'PRICING_CPM': [
      { key: 'FLOW_CONTROL_MODE_FAST', name: '加速投放' },
      { key: 'FLOW_CONTROL_MODE_SMOOTH', name: '标准投放' },
    ]
  };

  public styleList = [
    {
      css_type: 1,
      name: '单图',
    },
    // {
    //   css_type: 2,
    //   name: '三图',
    // },
    {
      css_type: 3,
      name: '视频',
    },
    {
      css_type: 6,
      name: '穿山甲开屏图片'
    }
  ];

  public coverSelectList = [
    // {
    //   label: "分素材指定",
    //   value: 'material',
    //   checked: false,
    // },
    // {
    //   label: "统一指定",
    //   value: 2,
    //   checked: false,
    // },
    {
      label: "系统指定",
      value: 'system',
      checked: false,
    },
  ];

  public today = new Date();

  public showCoefficient = false;

  public structConfigLoading = true;
  public structConfig: any = {};

  public cid;

  public inputValue = '';

  public callActionList = {
    'APP': [
      { key: '立即下载', name: '立即下载' },
    ],
    'LINK': [
      { key: '查看详情', name: '查看详情' },
    ],
    'QUICK_APP': [
      { key: '查看详情', name: '查看详情' },
    ],
    'SHOP': [
      { key: '立即下载', name: '立即下载' },
    ],
  };

  public basicTargetList = [];

  public curBasicTarget = [];

  public launchMediaTargetPackage = [];
  public curMediaTargetList = [];
  public mediaTargetMap = {};

  public targetChannelList = [];
  public accountChannelList = [];

  public launchTargetPackage = [];

  public _allChecked = false;

  public _indeterminate = false; // 表示有选中的，不管是全选还是选个别

  // public targetChannelList = {};

  // public accountChannelList = [];

  public chan_pub_ids = [];

  public curChannelList = [];

  public channelTreeList = [];

  public resultList = [];

  public curTargetList = [];   // 当前渠道下投放包列表

  public curDeliveryIndex = 0;

  public curTargetIndex = 0;

  public launch_position = {
    'UNION': [
      {
        "label": "原生视频",
        "value": "ORIGINAL_VIDEO",
      },
      {
        "label": "激励视频",
        "value": "REWARDED_VIDEO",
      },
      {
        "label": "穿山甲开屏",
        "value": "SPLASH_VIDEO",
      }
    ],

    'DEFAULT': [
      {
        label: "优选广告位",
        value: "smart_inventory",
      },
      {
        label: "按媒体指定位置",
        value: "inventory_type",
      },
      // {
      //   label: "按场景指定位置",
      //   value: "scene_inventory",
      // }
    ]

  };

  public inventory_type = {
    "inventory_type": [
      {
        label: "今日头条",
        value: "INVENTORY_FEED",
      },
      {
        label: "西瓜视频",
        value: "INVENTORY_VIDEO_FEED",
      },
      {
        label: "抖音火山版",
        value: "INVENTORY_HOTSOON_FEED",
      },
      {
        label: "抖音",
        value: "INVENTORY_AWEME_FEED",
      },
      {
        label: "穿山甲",
        value: "INVENTORY_UNION_SLOT",
      },
      {
        label: "ohayoo精品游戏",
        value: "UNION_BOUTIQUE_GAME",
      },
      {
        label: "番茄小说",
        value: "INVENTORY_TOMATO_NOVEL",
      }
    ],
    "scene_inventory": [
      {
        label: "沉浸式竖版视频场景广告位",
        value: "VIDEO_SCENE",
      },
      {
        label: "信息流场景广告位",
        value: "FEED_SCENE",
      },
      {
        label: "视频后贴和尾帧场景广告位",
        value: "TAIL_SCENE",
      }
    ],
  };

  public isChannelTree = true;

  public checkErrorTip = {
    chan_pub_id_lst: {
      is_show: false,
      tip_text: '账号不能为空',
    },
    project_template_name: {
      is_show: false,
      tip_text: '模板名称不能为空',
    },
    convert_channel_id_lst: {
      is_show: false,
      tip_text: '所选渠道号不能为空',
    },
    campaign_name: {
      is_show: false,
      tip_text: '广告组名称应为1-50字',
    },
    campaign_budget: {
      is_show: false,
      tip_text: '请输入正确的取值范围',
    },
    ad_name: {
      is_show: false,
      tip_text: '计划名称应为1-50字',
    },
    parent_audience_template_id: {
      is_show: false,
      tip_text: '请选择基础定向',
    },
    audience_template_id_lst: {
      is_show: false,
      tip_text: '定向包列表不能为空',
    },
    inventory_type_lst: {
      is_show: false,
      tip_text: '请选择投放范围',
    },
    budget: {
      is_show: false,
      tip_text: '请输入正确的取值范围',
    },
    bid: {
      is_show: false,
      tip_text: '请输入正确的取值范围',
    },
    third_industry_id_list: {
      is_show: false,
      tip_text: '请选择正确的创意分类',
    },
    ad_keywords: {
      is_show: false,
      tip_text: '请添加创意标签',
    },
    single_adgroup_material_num: {
      is_show: false,
      tip_text: '请设置单计划素材数',
    },
    single_adgroup_title_num: {
      is_show: false,
      tip_text: '请设置单计划标题数',
    },
    material_lst: {
      is_show: false,
      tip_text: '请选择素材',
    },
    title_lst: {
      is_show: false,
      tip_text: '请选择标题',
    },
    deep_cpabid: {
      is_show: false,
      tip_text: '深度优化出价不能为空'
    },
    roi_goal: {
      is_show: false,
      tip_text: '深度转化ROI系数不能为空'
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
    material_title_lst: {
      is_show: false,
      tip_text: '按素材选择标题，素材以及素材下标题不能为空'
    },
    card_error_tip: {
      has_error: false,
    },
    campaign_max_adgroup_num: {
      is_show: false,
      tip_text: '请输入广告组计划上限'
    },
  };

  public cardCheckErrorTip = {
    material_id: {
      is_show: false,
      tip_text: '请选择卡片模板主图'
    },
    product_selling_points: {
      is_show: false,
      tip_text: '请完善卡片模板推广卖点，字符数量为6-9'
    },
    call_to_action: {
      is_show: false,
      tip_text: '请选择文案'
    },
    product_description: {
      is_show: false,
      tip_text: '请输入卡片标题'
    },
  };

  public user_id;

  public cardTemplateList = [];

  public cardLoading = true;

  public downloadTypeLst = {
    "EXTERNAL_URL": 'LANDING',
    "DOWNLOAD_URL": 'DOWNLOAD',
  };

  public defaultData = {
    project_id: "",
    chan_pub_id_lst: [],  // 账户
    project_template_name: "",  // 模板名称
    convert_channel_id_lst: [],
    landing_type: "APP",  // 推广目的

    template_struct: {
      is_use_market: '0',
      campaign: {
        campaign_name: "",   // 广告组名称
        campaign_select: "create",  // 广告组选择  exist 已有  create 新建
        campaign_budget_mode: "nolimt",   // nolimt 不限  budget 日预算
        campaign_budget: 0,  // 预算
        is_set_adgroup_limit_num: '0',  // 设置计划上限
        campaign_max_adgroup_num: 1,   // 广告组计划上限
      },
      adgroup: {
        ad_name: "",    // 计划名称
        // 投放目标
        pricing: 'PRICING_OCPM',   // 投放目标
        app_type: 'APP_ANDROID',   // 下载类型

        // 定向
        is_media_audience: false,  // 是否媒体定向
        parent_audience_template_id: null,  // 基础定向
        audience_by_convert_channel: false,  // 是否分渠道号
        is_use_media_target_package: false,
        media_target_package_type: '1',
        delivery_select_type: '1',
        audience_template_id_lst: {     // 定向包列表
          all: [],
        },
        // 投放范围
        delivery_by_convert_channel: false,  // 是否分渠道号
        inventory_type_lst: {    // 投放范围列表
          all: [
            {
              delivery_range: "DEFAULT",
              launch_positon: "",
              inventory_type: [],
            },
          ]
        },
        // 预算与出价
        smart_bid_type: 'SMART_BID_CUSTOM',  // 投放场景
        flow_control_mode: 'FLOW_CONTROL_MODE_FAST',  // 竞价策略
        budget: 0,  // 预算
        price_type: 1,  // 出价方式(自定义)
        bid: 0,  //  出价
        adjust_cpa: 0,  // 调整自动出价
        schedule_type: 'SCHEDULE_FROM_NOW', // 投放时间
        time_range: [new Date(), new Date()], // 起始时间
        schedule_time_slt: 'nolimt', // 投放时段选择
        schedule_time: 0, // 投放时段
        deep_bid_type: 'DEEP_BID_DEFAULT', // 深度优化方式
        deep_cpabid: null, // 深度优化出价
        roi_goal: null, // 深度转化ROI系数
        feed_delivery_search: 'DISABLED',
      },
      creative: {
        creative_material_mode: "DEFAULT",   // 创意方式
        style: 1,  // 创意类型(自定义)
        // 素材选取
        // 标题选取
        generate_derived_ad: '0', // 衍生计划
        third_industry_ids: [], // 创意分类
        third_industry_id_list: [],
        ad_keywords: [], // 创意标签
        source: '', // 来源
        action_text: null, // 行动号召,
        is_comment_disable: '1', // 广告评论
        creative_auto_generate_switch: '0',
        ad_download_status: '0',
        creative_display_mode: 'CREATIVE_DISPLAY_MODE_CTR', // 创意展现方式
        app_name: null, // 应用名
        sub_title: null, // 副标题
        is_presented_video: false, // 自动生成视频素材
      },
      material: {
        by_channel_set_material: false,   // 分渠道号选择素材
        by_material_set_title: false,   // 分素材选择标题
        single_adgroup_material_num: 1,
        single_adgroup_title_num: 1,
        screenshot_setting_type: "system",
        material_type_lst: {
          all: { materials: [], titles: [] },
        }
      },
      promotion_card: {
        isOpenCard: false,
        card_by_convert_channel: false,  // 分渠道号选择卡片模板
        card_type_lst: {},
      }
    }
  };

  public promotion_card = {
    card_id: null,
    chan_pub_id: null,
    download_type: null,
    promo_card_template_name: "",
    imgUrl: "",
    promo_card_setting: {
      product_description: "",
      product_selling_points: [],
      material_id: "",
      product_points: [{ name: "", sellingPointsNameLength: 0 }],
      call_to_action: null,
      enable_personal_action: false,
      image_url: "",
    }
  };

  public wordList = ['日期', '年龄', '标题'];

  public cursorPosition = 0;

  public publisherId;

  public campaignWordList = [];

  public adgroupWordList = [];

  constructor(
    private launchService: LaunchService,
    private authService: AuthService,
    private message: NzMessageService,
    private modalService: NzModalService,
    public launchRpaService: LaunchRpaService,
    public menuService: MenuService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;
    this.publisherId = this.menuService.currentPublisherId;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 40;
    this.tableWidth = document.body.clientWidth - 150 - 130;
  }

  ngOnInit() {
    this.accountsList.forEach(item => {
      this.chan_pub_ids.push(item.chan_pub_id);
    });
    if (this.isEdit && this.projectTemplateId) {
      this.getProjectTemplate();
    } else {
      this.getChannelList();
      this.defaultData.template_struct.creative.third_industry_id_list = this.data['third_industry_ids'];
    }
    this.checkErrorTip.card_error_tip['all'] = deepCopy(this.cardCheckErrorTip);

    this.getFeedStructConfigByteDance();
    this.getBasicTargetList();
    this.getCardTemplateList();
    this.getLaunchRpaWordList();
    if (this.callActionList[this.defaultData.landing_type] && !this.defaultData.template_struct.creative.action_text) {
      this.defaultData.template_struct.creative.action_text = this.callActionList[this.defaultData.landing_type][0]['key'];
    }
  }

  // 获取卡片模板列表
  getCardTemplateList(status?) {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": "7"
        }],
    };
    this.launchRpaService
      .getPromotionCardTemplate(body, {
        cid: this.cid,
        user_id: this.user_id,
        result_model: 'all',
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.cardTemplateList = results['data'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 获取配置
  getFeedStructConfigByteDance() {
    this.launchService
      .getFeedStructConfigByteDance({
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {

          if (results.status_code && results.status_code !== 200) {
            if (results.status_code !== 205) {
              this.message.error(results.message);
            }
          } else {
            this.structConfig = { ...results };
          }
          this.structConfigLoading = false;
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 基础定向包列表
  getBasicTargetList() {
    this.launchRpaService
      .getAudienceTemplateList({
        cid: this.cid,
      }, { result_model: 'all', })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.basicTargetList = [];
          } else {
            this.basicTargetList = results['data'];
            if (this.defaultData.landing_type === 'LINK') {
              this.curBasicTarget = deepCopy(this.basicTargetList.filter(item => item.landing_type === 'EXTERNAL'));
            } else if (this.defaultData.landing_type === 'QUICK_APP') {
              this.curBasicTarget = deepCopy(this.basicTargetList.filter(item => item.landing_type === 'QUICK_APP'));
            } else if (this.defaultData.landing_type === 'SHOP') {
              this.curBasicTarget = deepCopy(this.basicTargetList.filter(item => item.landing_type === 'SHOP'));
            } else {
              this.curBasicTarget = deepCopy(this.basicTargetList.filter(item => item.landing_type === 'ANDROID' || item.landing_type === 'IOS'));
            }
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 投放包列表
  getChildTargetList(id) {
    this.launchRpaService
      .getChildAudienceTemplateList(id, {}, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.launchTargetPackage = [];
            this.curTargetList = [];
          } else {
            this.launchTargetPackage = results['data'];
            this.launchTargetPackage.forEach(item => item.checked = false);
            this.curTargetList = deepCopy(this.launchTargetPackage);
            if (this.isEdit && !this.defaultData.template_struct.adgroup.is_use_media_target_package) {
              if (this.defaultData.template_struct.adgroup.audience_by_convert_channel) {
                this.changeTargetTab(0);
              } else {
                this.defaultData.template_struct.adgroup.audience_template_id_lst['all'].forEach(item => {
                  const data = this.curTargetList.find(s_item => s_item.audience_template_id == item);
                  if (data) {
                    data.checked = true;
                  }
                });
              }
              const allUnchecked = this.curTargetList.some((item) => !item.checked);
              this._allChecked = !allUnchecked;
            }
            if (this.isCopy) {
              this.isEdit = false;
            }
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 获取渠道列表
  getChannelList(status?) {
    this.isChannelTree = false;
    let convert_channel_type;
    const { template_struct: { adgroup } } = this.defaultData;
    if (adgroup.pricing === 'PRICING_CPC' || adgroup.pricing === 'PRICING_CPM') {
      convert_channel_type = '2';
    } else {
      convert_channel_type = '1';
    }
    const allpConditions = [
      {
        key: "chan_pub_id",
        name: "",
        op: "in",
        value: this.defaultData.chan_pub_id_lst
      },
      {
        key: "convert_channel_status",
        name: "",
        op: "=",
        value: '1'
      },
      {
        key: "landing_type",
        name: "",
        op: "=",
        value: this.defaultData.landing_type
      },
      {
        key: "convert_channel_type",
        name: "",
        op: "=",
        value: convert_channel_type
      },
      {
        key: "is_use_market",
        name: "",
        op: "=",
        value: this.defaultData.template_struct.is_use_market
      },
    ];
    if (this.defaultData.landing_type === 'APP') {
      allpConditions.push({
        key: "app_type",
        name: "",
        op: "=",
        value: this.defaultData.landing_type === 'APP' ? adgroup.app_type : ''
      });
    }

    this.launchRpaService.getChannelList({ pConditions: allpConditions }, {
      result_model: 'all',
    }).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          this.curChannelList = deepCopy(results['data']);
          if (!this.defaultData.chan_pub_id_lst.length) {
            this.curChannelList = [];
          }
          this.getChannelTreeList();
          if (this.isEdit && this.projectTemplateId) {
            this.initEditData();
          }
        } else if (results.status_code === 205) {
          this.curChannelList = [];
          this.channelTreeList = [];
        }
        if (status && status === 'clear') {
          this.clearChannelList();
        }
        this.isChannelTree = true;
      },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );
  }

  initEditData() {
    if (this.defaultData.template_struct.creative.style == 1) {
      this.defaultData.template_struct.promotion_card.isOpenCard = false;
      this.defaultData.template_struct.promotion_card.card_by_convert_channel = false;
    }
    const delivery_type = this.defaultData.template_struct.adgroup.pricing === 'PRICING_OCPC' ? 'UNION' : 'DEFAULT';
    const channelList = [];
    this.defaultData.convert_channel_id_lst.forEach((channelId) => {
      const channelData = this.curChannelList.find(item => item.convert_channel_id === channelId);
      if (channelData && !this.targetChannelList.find(s_item => s_item.convert_channel_id === channelId)) {
        this.targetChannelList.push(channelData);
      }
      if (channelData) {
        channelList.push(channelId);
      }
    });
    this.defaultData.convert_channel_id_lst = [...channelList];
    this.targetChannelList.forEach((item, index) => {
      if (!this.defaultData.template_struct.adgroup.audience_template_id_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.adgroup.audience_template_id_lst[item.convert_channel_id] = [];
      }
      if (!this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id] = {
          materials: [],
          titles: []
        };
      }
      if (!this.defaultData.template_struct.adgroup.inventory_type_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.adgroup.inventory_type_lst[item.convert_channel_id] = [
          {
            delivery_range: delivery_type,
            inventory_type: [],
            launch_positon: ""
          }];
      }

      if (!this.defaultData.template_struct.promotion_card.card_type_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.promotion_card.card_type_lst[item.convert_channel_id] = deepCopy(this.promotion_card);
      }

      if (!this.checkErrorTip.card_error_tip[item.convert_channel_id]) {
        this.checkErrorTip.card_error_tip[item.convert_channel_id] = deepCopy(this.cardCheckErrorTip);
      }

      const curAccountData = this.accountChannelList.find(s_item => s_item.chan_pub_id === item.chan_pub_id);
      if (!curAccountData) {
        this.accountChannelList.push({
          chan_pub_id: item.chan_pub_id,
          pub_account_name: item.pub_account_name,
          convert_channel_id_lst: [item.convert_channel_id]
        });
      } else {
        if (curAccountData.convert_channel_id_lst.indexOf(item.convert_channel_id) === -1) {
          curAccountData.convert_channel_id_lst.push(item.convert_channel_id);
        }
      }

    });
    if (this.defaultData.template_struct.adgroup.parent_audience_template_id) {
      this.getChildTargetList(this.defaultData.template_struct.adgroup.parent_audience_template_id);
    }
  }

  // 处理渠道列表为树形结构
  getChannelTreeList() {
    this.channelTreeList = [];
    this.curChannelList.forEach(item => {
      const findIndex = this.channelTreeList.findIndex(channelItem => channelItem.key === item.chan_pub_id);
      if (findIndex === -1) {
        this.channelTreeList.push({
          level: 1,
          title: item.pub_account_name,
          key: item.chan_pub_id,
          checked: false,
          isLeaf: false,
          children: []
        });
      }

      const data = this.channelTreeList.find(s_item => s_item.key === item.chan_pub_id);
      const childData = data.children.find(chilItem => chilItem.key === item.convert_channel_id);
      if (data && data.children && !childData) {
        data.children.push({
          level: 2,
          title: item.convert_channel_name,
          key: item.convert_channel_id,
          checked: false,
          isLeaf: true, ...item
        });
      }
    });
  }

  // 定向投放包选中
  _refreshStatus(sourceData, event?) {
    const allChecked = sourceData.every(
      (value) => value.checked,
    );
    const allUnchecked = sourceData.every((value) => !value.checked);

    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;

    this.getCheckData();
  }

  // 定向投放包全选
  _checkAll(sourceData, value, deliveryType?) {
    if (deliveryType) {
      sourceData = sourceData.filter(item => item.delivery_range === deliveryType);
    }
    if (value) {
      sourceData.forEach((data) => {
        data.checked = true;
      });
      this._indeterminate = true;
    } else {
      this._indeterminate = false;
      sourceData.forEach((data) => (data.checked = false));
    }

    this.getCheckData();
  }

  getCheckData() {
    if (this.defaultData.template_struct.adgroup.audience_by_convert_channel) {
      if (!this.defaultData.template_struct.adgroup.is_use_media_target_package) {
        if (this.defaultData.template_struct.adgroup.media_target_package_type === '1') {
          this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[this.curTargetIndex].convert_channel_id] = [];
          this.curTargetList.forEach(item => {
            if (item.checked) {
              this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[this.curTargetIndex].convert_channel_id].push(item.audience_template_id);
            }
          });
        } else {
          this.defaultData.template_struct.adgroup.audience_template_id_lst[this.accountChannelList[this.curTargetIndex]['convert_channel_id_lst'][0]] = [];
          this.curTargetList.forEach(item => {
            if (item.checked) {
              this.defaultData.template_struct.adgroup.audience_template_id_lst[this.accountChannelList[this.curTargetIndex].convert_channel_id_lst[0]].push(item.audience_template_id);
            }
          });
          this.accountChannelList[this.curTargetIndex].convert_channel_id_lst.forEach((id, index) => {
            if (index > 0) {
              this.defaultData.template_struct.adgroup.audience_template_id_lst[id] = deepCopy(this.defaultData.template_struct.adgroup.audience_template_id_lst[this.accountChannelList[this.curTargetIndex].convert_channel_id_lst[0]]);
            }
          });
        }
      } else {
        if (this.defaultData.template_struct.adgroup.media_target_package_type === '1') {
          this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[this.curTargetIndex].convert_channel_id] = [];
          this.curMediaTargetList.forEach(item => {
            if (item.checked) {
              this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[this.curTargetIndex].convert_channel_id].push(item.audience_package_id);
            }
          });
        } else {
          this.defaultData.template_struct.adgroup.audience_template_id_lst[this.accountChannelList[this.curTargetIndex]['convert_channel_id_lst'][0]] = [];
          this.curMediaTargetList.forEach(item => {
            if (item.checked) {
              this.defaultData.template_struct.adgroup.audience_template_id_lst[this.accountChannelList[this.curTargetIndex].convert_channel_id_lst[0]].push(item.audience_package_id);
            }
          });
          this.accountChannelList[this.curTargetIndex].convert_channel_id_lst.forEach((id, index) => {
            if (index > 0) {
              this.defaultData.template_struct.adgroup.audience_template_id_lst[id] = deepCopy(this.defaultData.template_struct.adgroup.audience_template_id_lst[this.accountChannelList[this.curTargetIndex].convert_channel_id_lst[0]]);
            }
          });
        }
      }
    } else {
      this.defaultData.template_struct.adgroup.audience_template_id_lst['all'] = [];
      this.curTargetList.forEach(item => {
        if (item.checked) {
          this.defaultData.template_struct.adgroup.audience_template_id_lst['all'].push(item.audience_template_id);
        }
      });
    }
    this.getAudienceTemplateIdLstErrorTip();
  }

  changeBasicAudience(id) {
    this.getChildTargetList(id);
    this.getItemErrorTip('parent_audience_template_id', this.defaultData.template_struct.adgroup.parent_audience_template_id);
  }

  changeTargetChannel(value) {
    if (!value) {
      this.defaultData.template_struct.adgroup.is_use_media_target_package = false;
    }
    this.curTargetIndex = 0;
    this.curTargetList = deepCopy(this.launchTargetPackage);
    for (const item of Object.keys(this.defaultData.template_struct.adgroup.audience_template_id_lst)) {
      this.defaultData.template_struct.adgroup.audience_template_id_lst[item] = [];
    }
    if (!this.defaultData.template_struct.adgroup.is_use_media_target_package) {
      if (this.curTargetList.length > 0) {
        const allUnchecked = this.curTargetList.some((item) => !item.checked);
        this._allChecked = !allUnchecked;
      }
    } else {
      if (this.curMediaTargetList.length > 0) {
        const allUnchecked = this.curMediaTargetList.some((item) => !item.checked);
        this._allChecked = !allUnchecked;
      }
    }
  }

  getDisableDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.today) < 0;
  }

  dateDate(event) { //从日期组件中得到的日期数据
    this.defaultData.template_struct.adgroup.schedule_time = event.dateData;
  }

  AddTags() {
    let dataValid = true;
    const inputValueAry = this.inputValue.split(/\s+/g); // 根据换行或者回车进行识别

    inputValueAry.forEach((item, idx) => {
      const len = item.replace(/[\u4e00-\u9fa5]/g, "aa").length;
      if (len > 20) {
        dataValid = false;
      }
      if (!item) {
        inputValueAry.splice(idx, 1);
      }
    });

    if (!dataValid) {
      this.message.error('每个标签不超过20个字符');
      return false;
    }

    if ((this.defaultData.template_struct.creative.ad_keywords.length + inputValueAry.length) > 20) {
      this.message.error('最多20个标签');
      return false;
    }

    inputValueAry.forEach(item => {
      if (item.length && this.defaultData.template_struct.creative.ad_keywords.indexOf(item) === -1) {
        this.defaultData.template_struct.creative.ad_keywords.push(item);
      }
    });
    this.inputValue = '';
    this.getItemErrorTip('ad_keywords', this.defaultData.template_struct.creative.ad_keywords);
  }

  deleteTag(index) {
    this.defaultData.template_struct.creative.ad_keywords.splice(index, 1);
  }

  clearTags() {
    this.defaultData.template_struct.creative.ad_keywords = [];
  }


  // 打开素材库
  openMaterials(data: any[], cssType: number) {
    if (cssType != 3) {
      this.addImageMaterials(data, cssType);
    } else {
      this.addMaterials(data);
    }
  }

  addMaterials(data: any[]) {
    const add_modal = this.modalService.create({
      nzTitle: '视频素材库',
      nzWidth: 1300,
      nzContent: LaunchMaterialVideoModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        this.defaultData.template_struct.material.single_adgroup_material_num = result['data'].length > 10 ? 10 : result['data'].length > this.defaultData.template_struct.material.single_adgroup_material_num ? result['data'].length : this.defaultData.template_struct.material.single_adgroup_material_num;
        result['data'].forEach(item => {
          if (!item.hasOwnProperty("title")) {
            item["title"] = [];
          }
        });
        data.splice(0, data.length, ...result['data']);
        this.getMaterialErrorTip();
      }
    });
  }


  // 图片素材库
  addImageMaterials(data: any[], cssType) {
    const add_modal = this.modalService.create({
      nzTitle: '图片素材库',
      nzWidth: 1300,
      nzContent: LaunchMaterialImageModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data,
        cssType: Number(cssType),
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        this.defaultData.template_struct.material.single_adgroup_material_num = result['data'].length > 10 ? 10 : result['data'].length > this.defaultData.template_struct.material.single_adgroup_material_num ? result['data'].length : this.defaultData.template_struct.material.single_adgroup_material_num;
        result['data'].forEach(item => {
          if (!item.hasOwnProperty("title")) {
            item["title"] = [];
          }
        });
        data.splice(0, data.length, ...result['data']);
        this.getMaterialErrorTip();
      }
    });
  }


  // 标题库
  addLaunchTitle(data: any[]) {
    const add_modal = this.modalService.create({
      nzTitle: '选择标题库',
      nzWidth: 1300,
      nzContent: LaunchTitleModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        this.defaultData.template_struct.material.single_adgroup_title_num = result['data'].length > 10 ? 10 : result['data'].length > this.defaultData.template_struct.material.single_adgroup_title_num ? result['data'].length : this.defaultData.template_struct.material.single_adgroup_title_num;
        data.splice(0, data.length, ...result['data']);
        this.getMaterialErrorTip();
      }
    });
  }

  changeTargetSource(value) {
    if (value) {
      this.defaultData.template_struct.adgroup.audience_by_convert_channel = true;
    }
  }

  changeLandType(value) {
    this.defaultData.template_struct.is_use_market = value === 'APP' || value === 'SHOP' ? '0' : '1';
    this.getChannelList('clear');
    if (value === 'LINK') {
      this.curBasicTarget = this.basicTargetList.filter(item => item.landing_type === 'EXTERNAL');
    } else if (value === 'QUICK_APP') {
      this.curBasicTarget = this.basicTargetList.filter(item => item.landing_type === 'QUICK_APP');
    } else if (value === 'SHOP') {
      this.curBasicTarget = this.basicTargetList.filter(item => item.landing_type === 'SHOP');
      this.getInventoryData();
    } else {
      this.curBasicTarget = this.basicTargetList.filter(item => item.landing_type === 'ANDROID' || item.landing_type === 'IOS');
    }
    this.getCurMediaTargetList();
    this.defaultData.template_struct.adgroup.parent_audience_template_id = null;
    this.curTargetList = [];
    this.launchTargetPackage = [];
    this._allChecked = false;
  }

  changePricing(value) {
    this.getChannelList('clear');
    const delivery_type = this.defaultData.template_struct.adgroup.pricing === 'PRICING_OCPC' ? 'UNION' : 'DEFAULT';
    this.defaultData.template_struct.adgroup.inventory_type_lst['all'] = [
      {
        delivery_range: delivery_type,
        launch_positon: "",
        inventory_type: [],
      }
    ];
    this.targetChannelList.forEach(item => {
      this.defaultData.template_struct.adgroup.inventory_type_lst[item.convert_channel_id] = [
        {
          delivery_range: delivery_type,
          launch_positon: "",
          inventory_type: [],
        }
      ];
    });
  }

  transferTreeChange(data) {
    this.defaultData.convert_channel_id_lst = data;
    this.getItemErrorTip('convert_channel_id_lst', this.defaultData.convert_channel_id_lst);
    const delivery_type = this.defaultData.template_struct.adgroup.pricing === 'PRICING_OCPC' ? 'UNION' : 'DEFAULT';

    if (data.length === 0) {
      this.defaultData.template_struct.adgroup.audience_by_convert_channel = false;
      this.defaultData.template_struct.adgroup.delivery_by_convert_channel = false;
      this.defaultData.template_struct.promotion_card.card_by_convert_channel = false;
      this.defaultData.template_struct.promotion_card.isOpenCard = false;
      this.targetChannelList = [];
      return;
    }
    data.forEach(channelId => {
      const channelData = this.curChannelList.find(item => item.convert_channel_id === channelId);
      if (!this.targetChannelList.find(s_item => s_item.convert_channel_id === channelId)) {
        this.targetChannelList.push(channelData);
      }
    });
    this.targetChannelList.forEach((item, index) => {
      if (!this.defaultData.template_struct.adgroup.audience_template_id_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.adgroup.audience_template_id_lst[item.convert_channel_id] = [];
      }
      if (!this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id] = {
          materials: [],
          titles: []
        };
      }
      if (!this.defaultData.template_struct.adgroup.inventory_type_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.adgroup.inventory_type_lst[item.convert_channel_id] = [
          {
            delivery_range: delivery_type,
            inventory_type: [],
            launch_positon: ""
          }
        ];
      }

      if (!this.defaultData.template_struct.promotion_card.card_type_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.promotion_card.card_type_lst[item.convert_channel_id] = deepCopy(this.promotion_card);
      }

      if (!this.checkErrorTip.card_error_tip[item.convert_channel_id]) {
        this.checkErrorTip.card_error_tip[item.convert_channel_id] = deepCopy(this.cardCheckErrorTip);
      }

      const curChannelData = data.find(value => value === item.convert_channel_id);

      if (!curChannelData) {
        delete this.defaultData.template_struct.adgroup.audience_template_id_lst[item.convert_channel_id];
        delete this.defaultData.template_struct.adgroup.inventory_type_lst[item.convert_channel_id];
        delete this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id];
        delete this.defaultData.template_struct.promotion_card.card_type_lst[item.convert_channel_id];
        delete this.checkErrorTip.card_error_tip[item.convert_channel_id];
        this.targetChannelList.splice(index, 1);
      }

      const curAccountData = this.accountChannelList.find(s_item => s_item.chan_pub_id === item.chan_pub_id);
      if (!curAccountData) {
        this.accountChannelList.push({
          chan_pub_id: item.chan_pub_id,
          pub_account_name: item.pub_account_name,
          convert_channel_id_lst: [item.convert_channel_id]
        });
      } else {
        if (curAccountData.convert_channel_id_lst.indexOf(item.convert_channel_id) === -1) {
          curAccountData.convert_channel_id_lst.push(item.convert_channel_id);
        }
      }
    });
    this.changeTargetTab(this.curTargetIndex);
    this.getCheckData();
  }

  addDelivery(list) {
    const delivery_type = list[0]['delivery_range'];
    // const delivery_type = this.defaultData.template_struct.adgroup.pricing === 'PRICING_OCPC' ? 'UNION' : 'DEFAULT';
    list.push({
      delivery_range: delivery_type,
      inventory_type: [],
      launch_positon: ""
    });
  }

  deleteDelivery(list, index) {
    list.splice(index, 1);
    this.getInventoryTypeLstErrorTip();
  }

  changeTargetTab(value) {
    this.curTargetIndex = value;
    this.curTargetList = deepCopy(this.launchTargetPackage);
    this.getCurMediaTargetList();
    if (this.targetChannelList[value]) {
      if (!this.defaultData.template_struct.adgroup.is_use_media_target_package) {
        if (this.defaultData.template_struct.adgroup.media_target_package_type === '1') {
          this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[value]['convert_channel_id']].forEach(item => {
            const data = this.curTargetList.find(s_item => s_item.audience_template_id == item);
            if (data) {
              data.checked = true;
            }
          });
        } else {
          this.defaultData.template_struct.adgroup.audience_template_id_lst[this.accountChannelList[value]['convert_channel_id_lst'][0]].forEach(item => {
            const data = this.curTargetList.find(s_item => s_item.audience_template_id == item);
            if (data) {
              data.checked = true;
            }
          });
        }
      } else {
        if (this.defaultData.template_struct.adgroup.media_target_package_type === '1') {
          this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[value]['convert_channel_id']].forEach(item => {
            const data = this.curMediaTargetList.find(s_item => s_item.audience_package_id == item);
            if (data) {
              data.checked = true;
            }
          });
        } else {
          this.defaultData.template_struct.adgroup.audience_template_id_lst[this.accountChannelList[value]['convert_channel_id_lst'][0]].forEach(item => {
            const data = this.curMediaTargetList.find(s_item => s_item.audience_package_id == item);
            if (data) {
              data.checked = true;
            }
          });
        }

      }

    }
    if (!this.defaultData.template_struct.adgroup.is_use_media_target_package) {
      if (this.curTargetList.length > 0) {
        const allUnchecked = this.curTargetList.some((item) => !item.checked);
        this._allChecked = !allUnchecked;
      }
    } else {
      if (this.curMediaTargetList.length > 0) {
        const allUnchecked = this.curMediaTargetList.some((item) => !item.checked);
        this._allChecked = !allUnchecked;
      }
    }
  }

  clearAllSelected(data: any[], type) {
    data.splice(0, data.length);
    if (type === 'title') {
      this.defaultData.template_struct.material.single_adgroup_title_num = 1;
    } else {
      this.defaultData.template_struct.material.single_adgroup_material_num = 1;
    }
    this.getMaterialErrorTip();
  }

  clearSingleSelected(data: any[], index: number, type) {
    data.splice(index, 1);
    if (type === 'title') {
      this.defaultData.template_struct.material.single_adgroup_title_num = data.length < 10 ? data.length < this.defaultData.template_struct.material.single_adgroup_title_num ? this.defaultData.template_struct.material.single_adgroup_title_num : data.length : 10;
    } else {
      this.defaultData.template_struct.material.single_adgroup_material_num = data.length < 10 ? data.length < this.defaultData.template_struct.material.single_adgroup_material_num ? this.defaultData.template_struct.material.single_adgroup_material_num : data.length : 10;
    }
    this.getMaterialErrorTip();
  }

  changeDelivery(value) {
    const delivery_type = this.defaultData.template_struct.adgroup.pricing === 'PRICING_OCPC' ? 'UNION' : 'DEFAULT';
    this.defaultData.template_struct.adgroup.inventory_type_lst['all'] = [
      {
        delivery_range: delivery_type,
        launch_positon: "",
        inventory_type: [],
      }
    ];
    this.targetChannelList.forEach(item => {
      this.defaultData.template_struct.adgroup.inventory_type_lst[item.convert_channel_id] = [
        {
          delivery_range: delivery_type,
          launch_positon: "",
          inventory_type: [],
        }
      ];
    });
    if (!value && this.defaultData.template_struct.adgroup.is_use_media_target_package) {
      for (const item of Object.keys(this.defaultData.template_struct.adgroup.audience_template_id_lst)) {
        this.defaultData.template_struct.adgroup.audience_template_id_lst[item] = [];
      }
      if (this.curMediaTargetList.length > 0) {
        const allUnchecked = this.curMediaTargetList.some((item) => !item.checked);
        this._allChecked = !allUnchecked;
      }
    }
  }

  getLaunchRpaWordList() {
    this.launchRpaService
      .getLaunchRpaWildCard({
        page: 1,
        count: 10000000,
        cid: this.cid,
        publisher_id: this.publisherId
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.campaignWordList = results['data']['campaign'];
            this.adgroupWordList = results['data']['adgroup'];

          } else if (results.status_code && results.status_code === 205) {

          } else {
            this.message.error(results.message);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  doSave() {
    if (this.defaultData.template_struct.adgroup.delivery_select_type == '0') {
      this.accountChannelList.forEach(account => {
        account.convert_channel_id_lst.forEach(item => {
          if (item !== account.convert_channel_id_lst[0]) {
            this.defaultData.template_struct.adgroup.inventory_type_lst[item] = deepCopy(this.defaultData.template_struct.adgroup.inventory_type_lst[account.convert_channel_id_lst[0]]);
          }
        });
      });
    }
    const isValid = this.checkBasicData();

    if (isValid) {
      this.message.error('请完善参数信息！');
      return;
    }

    const resultData = deepCopy(this.defaultData);
    for (const item of Object.keys(resultData.template_struct.adgroup.audience_template_id_lst)) {
      if (resultData.template_struct.adgroup.audience_by_convert_channel) {
        delete resultData.template_struct.adgroup.audience_template_id_lst['all'];
      } else {
        if (item !== 'all') {
          delete resultData.template_struct.adgroup.audience_template_id_lst[item];
        }
      }
    }
    for (const item of Object.keys(resultData.template_struct.adgroup.inventory_type_lst)) {
      if (resultData.template_struct.adgroup.delivery_by_convert_channel) {
        delete resultData.template_struct.adgroup.inventory_type_lst['all'];
      } else {
        if (item !== 'all') {
          delete resultData.template_struct.adgroup.inventory_type_lst[item];
        }
      }
    }

    for (const item of Object.keys(resultData.template_struct.material.material_type_lst)) {
      if (resultData.template_struct.material.by_channel_set_material) {
        delete resultData.template_struct.material.material_type_lst['all'];
      } else {
        if (item !== 'all') {
          delete resultData.template_struct.material.material_type_lst[item];
        }
      }
    }

    if (!this.defaultData.template_struct.promotion_card.isOpenCard) {
      resultData.template_struct.promotion_card.card_type_lst = {};
    } else {
      for (const item of Object.keys(resultData.template_struct.promotion_card.card_type_lst)) {
        if (resultData.template_struct.promotion_card.card_type_lst[item]) {
          resultData.template_struct.promotion_card.card_type_lst[item].promo_card_setting.product_selling_points = [];
          for (const s_item of resultData.template_struct.promotion_card.card_type_lst[item].promo_card_setting.product_points) {
            resultData.template_struct.promotion_card.card_type_lst[item].promo_card_setting.product_selling_points.push(s_item.name);
          }
        }
        if (resultData.template_struct.promotion_card.card_by_convert_channel) {
          delete resultData.template_struct.promotion_card.card_type_lst['all'];
        } else {
          if (item !== 'all') {
            delete resultData.template_struct.promotion_card.card_type_lst[item];
          }
        }
      }
    }

    resultData.project_id = this.data.project_id;
    resultData['template_struct']['creative']['third_industry_ids'] = this.defaultData.template_struct.creative.third_industry_id_list[2];
    resultData['template_struct']['adgroup']['start_time'] = format(new Date(this.defaultData.template_struct.adgroup.time_range[0]), 'yyyy-MM-dd');
    resultData['template_struct']['adgroup']['end_time'] = format(new Date(this.defaultData.template_struct.adgroup.time_range[1]), 'yyyy-MM-dd');

    if (this.isEdit && this.projectTemplateId) {
      this.launchRpaService.updateProjectTemplate(this.projectTemplateId, resultData, {}).subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.message.info('修改成功');
          } else {
            this.message.error(results['message']);
          }
          this.cancel.emit('save');
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        }
      );
    } else {
      this.launchRpaService.createProjectTemplate(resultData, {}).subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.message.info('新建成功');
          } else {
            this.message.error(results['message']);
          }
          this.cancel.emit('save');
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
    }
  }

  changeMaterialByChannel() {
    this.defaultData.template_struct.material.single_adgroup_material_num = 1;
    this.defaultData.template_struct.material.single_adgroup_title_num = 1;
    this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [], titles: [] };
    this.targetChannelList.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id] = { materials: [], titles: [] };
    });
  }

  changeTitleByChannel(value) {
    this.defaultData.template_struct.material.single_adgroup_material_num = 1;
    this.defaultData.template_struct.material.single_adgroup_title_num = 1;
    this.defaultData.template_struct.material.material_type_lst['all']['titles'] = [];
    this.defaultData.template_struct.material.material_type_lst['all']['materials'].forEach(s_item => s_item.title = []);
    this.targetChannelList.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]['titles'] = [];
      this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]['materials'].forEach(s_item => s_item.title = []);
    });
    if (this.defaultData.template_struct.creative.creative_material_mode === 'STATIC_ASSEMBLE' && value) {
      this.defaultData.template_struct.material.single_adgroup_material_num = 1;
    }
  }

  changeCreativeType(value) {
    if (value === 'STATIC_ASSEMBLE' && this.defaultData.template_struct.material.by_material_set_title) {
      this.defaultData.template_struct.material.single_adgroup_material_num = 1;
    }
  }

  changeAdjustCpa() {
    this.defaultData.template_struct.adgroup.bid = null;
  }

  getProjectTemplate() {
    this.launchRpaService.getProjectTemplateDetail(this.projectTemplateId, { cid: this.cid })

      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.defaultData = deepCopy(results['data']);
            this.defaultData.template_struct['is_use_market'] = this.defaultData.template_struct['is_use_market'] || '0';
            this.defaultData.template_struct.campaign['is_set_adgroup_limit_num'] = this.defaultData.template_struct.campaign['is_set_adgroup_limit_num'] || '0';
            this.defaultData.template_struct.campaign['campaign_max_adgroup_num'] = this.defaultData.template_struct.campaign['campaign_max_adgroup_num'] || 1;
            this.defaultData.template_struct.adgroup.is_use_media_target_package = this.defaultData.template_struct.adgroup.is_use_media_target_package ? this.defaultData.template_struct.adgroup.is_use_media_target_package : false;
            this.defaultData.template_struct.adgroup['media_target_package_type'] = this.defaultData.template_struct.adgroup['media_target_package_type'] || '1';
            this.defaultData.template_struct.adgroup['delivery_select_type'] = this.defaultData.template_struct.adgroup['delivery_select_type'] || '1';
            this.defaultData.template_struct.adgroup['feed_delivery_search'] = this.defaultData.template_struct.adgroup['feed_delivery_search'] || 'DISABLED';
            this.defaultData.template_struct.creative['creative_auto_generate_switch'] = this.defaultData.template_struct.adgroup['creative_auto_generate_switch'] || '0';
            this.defaultData.template_struct.creative['ad_download_status'] = this.defaultData.template_struct.adgroup['ad_download_status'] || '0';
            if (this.isCopy) {
              this.defaultData.project_template_name = this.defaultData.project_template_name + '-复制';
            }
            this.getChannelList();
            this.getMediaBasicTargetList();
          } else {
            this.message.error(results['message']);
          }

        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        }
      );
  }

  changeCreativeStyle(value) {
    this.defaultData.template_struct.material.screenshot_setting_type = 'system';
    this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [], titles: [] };
    if (value == 1) {
      this.defaultData.template_struct.promotion_card.isOpenCard = false;
      this.defaultData.template_struct.promotion_card.card_by_convert_channel = false;
      this.defaultData.template_struct.promotion_card.card_type_lst = {};
    }
    this.targetChannelList.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id] = {
        materials: [],
        titles: []
      };
    });
  }

  doCancel() {
    this.cancel.emit();
  }

  changeAppType(value) {
    this.getChannelList('clear');
    if (value === 'APP_ANDROID') {
      this.curBasicTarget = this.basicTargetList.filter(item => item.landing_type === 'ANDROID');
    } else {
      this.curBasicTarget = this.basicTargetList.filter(item => item.landing_type === 'IOS');
    }
    this.getCurMediaTargetList();
    this.defaultData.template_struct.adgroup.parent_audience_template_id = null;
    this.curTargetList = [];
    this._allChecked = false;
  }

  changeSmartBidType(value) {
    this.defaultData.template_struct.adgroup.schedule_type = "SCHEDULE_FROM_NOW";
  }

  changeCardTemplate(value) {
    this.cardLoading = false;
    const data = this.cardTemplateList.find(item => item.promo_card_template_id === value.card_id);
    value.promo_card_setting.product_points = [];
    value.promo_card_setting.product_description = data.promo_card_setting.product_description;
    value.promo_card_setting.call_to_action = data.promo_card_setting.call_to_action;
    value.promo_card_setting.enable_personal_action = data.promo_card_setting.enable_personal_action;
    value.promo_card_setting.image_url = data.promo_card_setting.image_url;
    value.promo_card_setting.material_id = data.promo_card_setting.material_id;
    value.promo_card_setting.product_selling_points = data.promo_card_setting.product_selling_points;
    for (const item of data.promo_card_setting.product_selling_points) {
      value.promo_card_setting.product_points.push({ name: item, sellingPointsNameLength: item.length });
    }

    setTimeout(() => {
      this.cardLoading = true;
    });
  }

  changeUseCard(value) {
    this.defaultData.template_struct.promotion_card.card_by_convert_channel = false;
    if (value) {
      this.defaultData.template_struct.promotion_card.card_type_lst['all'] = deepCopy(this.promotion_card);
      this.defaultData.template_struct.promotion_card.card_type_lst['all']['download_type'] = this.downloadTypeLst[this.targetChannelList[0].download_type];
      this.defaultData.template_struct.promotion_card.card_type_lst['all']['chan_pub_id'] = this.targetChannelList[0].chan_pub_id;
    } else {
      this.defaultData.template_struct.promotion_card.card_type_lst = {};
    }
  }

  changeChannelSetCard(value) {
    this.cardLoading = false;
    this.defaultData.template_struct.promotion_card.card_type_lst['all'] = deepCopy(this.promotion_card);
    this.targetChannelList.forEach(item => {
      this.defaultData.template_struct.promotion_card.card_type_lst[item.convert_channel_id] = deepCopy(this.promotion_card);
    });
    this.defaultData.template_struct.promotion_card.card_type_lst[this.targetChannelList[0]['convert_channel_id']]['download_type'] = this.downloadTypeLst[this.targetChannelList[0].download_type];
    this.defaultData.template_struct.promotion_card.card_type_lst[this.targetChannelList[0]['convert_channel_id']]['chan_pub_id'] = this.targetChannelList[0].chan_pub_id;
    setTimeout(() => {
      this.cardLoading = true;
    });
  }

  changeCardTab(value) {
    this.cardLoading = false;
    this.defaultData.template_struct.promotion_card.card_type_lst[this.targetChannelList[value]['convert_channel_id']]['download_type'] = this.downloadTypeLst[this.targetChannelList[value].download_type];
    this.defaultData.template_struct.promotion_card.card_type_lst[this.targetChannelList[value]['convert_channel_id']]['chan_pub_id'] = this.targetChannelList[value].chan_pub_id;
    setTimeout(() => {
      this.cardLoading = true;
    });
  }

  addCover(data: any[], cssType) {
    data['screenshot_setting'] ? data['screenshot_setting'] = data['screenshot_setting'] : data['screenshot_setting'] = {};
    const add_modal = this.modalService.create({
      nzTitle: '视频封面库',
      nzWidth: 1300,
      nzContent: LaunchMaterialCoverModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data,
        cssType: Number(cssType),
        video_type: data['video_type'],
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        data['screenshot_setting'] = result['data'][0];
      }
    });
  }

  addTags(value, type) {
    const tagValueLength = value.length + 2;
    let curInput;
    if (type === 'campaign') {
      curInput = this.curCampaignTextArea.nativeElement;
    } else if (type === 'adgroup') {
      curInput = this.curAdgroupTextArea.nativeElement;
    }

    this.cursorPosition = curInput.selectionStart;
    const stringObj = this.launchRpaService.getStringByPosition(curInput.selectionStart, curInput.selectionEnd, curInput.value);
    if (type === 'campaign') {
      this.defaultData.template_struct.campaign.campaign_name = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
      curInput.value = this.defaultData.template_struct.campaign.campaign_name;
      this.getItemErrorTip('campaign_name', this.defaultData.template_struct.campaign.campaign_name);
    } else if (type === 'adgroup') {
      this.defaultData.template_struct.adgroup.ad_name = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
      curInput.value = this.defaultData.template_struct.adgroup.ad_name;
      this.getItemErrorTip('ad_name', this.defaultData.template_struct.adgroup.ad_name);
    }

    this.cursorPosition += tagValueLength;
    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核
    } else {
      curInput.select();
      curInput.selectionStart = this.cursorPosition;
      curInput.selectionEnd = this.cursorPosition;
    }
  }

  changeCoverType(value) {
    if (value === 'system') {
      delete this.defaultData.template_struct.material.material_type_lst['all']['materials']['screenshot_setting'];
      this.targetChannelList.forEach(item => {
        delete this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]['materials']['screenshot_setting'];
      });
    } else {
      this.defaultData.template_struct.material.material_type_lst['all']['materials']['screenshot_setting'] = {};
      this.targetChannelList.forEach(item => {
        this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]['materials']['screenshot_setting'] = {};
      });
    }
  }

  changeAccount(type) {
    if (!type) {
      this.targetChannelList = [];
      this.channelTreeList = [];
      this.getChannelList('clear');
      this.getMediaBasicTargetList();
      this.getItemErrorTip('chan_pub_id_lst', this.defaultData.chan_pub_id_lst);
    }
  }

  clearChannelList() {
    if (!this.curChannelList.length) {
      this.targetChannelList = [];
      this.defaultData.convert_channel_id_lst = [];
    }
    const saveData = [];
    this.curChannelList.forEach(channleItem => {
      const data = this.targetChannelList.find(item => item.convert_channel_id === channleItem.convert_channel_id);
      if (data) {
        saveData.push(data);
      }
    });
    this.targetChannelList = saveData;
    this.defaultData.convert_channel_id_lst = this.targetChannelList.map(item => {
      return item.convert_channel_id;
    });
    if (!this.targetChannelList.length) {
      this.defaultData.template_struct.adgroup.audience_by_convert_channel = false;
      this.defaultData.template_struct.adgroup.delivery_by_convert_channel = false;
      this.defaultData.template_struct.promotion_card.card_by_convert_channel = false;
      this.defaultData.template_struct.material.by_channel_set_material = false;
      this.defaultData.template_struct.promotion_card.isOpenCard = false;
    }

    for (const item of Object.keys(this.defaultData.template_struct.adgroup.audience_template_id_lst)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.convert_channel_id == item)) {
        delete this.defaultData.template_struct.adgroup.audience_template_id_lst[item];
      }
    }

    for (const item of Object.keys(this.defaultData.template_struct.material.material_type_lst)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.convert_channel_id == item)) {
        delete this.defaultData.template_struct.material.material_type_lst[item];
      }
    }

    for (const item of Object.keys(this.defaultData.template_struct.adgroup.inventory_type_lst)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.convert_channel_id == item)) {
        delete this.defaultData.template_struct.adgroup.inventory_type_lst[item];
      }
    }

    for (const item of Object.keys(this.defaultData.template_struct.promotion_card.card_type_lst)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.convert_channel_id == item)) {
        delete this.defaultData.template_struct.promotion_card.card_type_lst[item];
      }
    }

    for (const item of Object.keys(this.checkErrorTip.card_error_tip)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.convert_channel_id == item)) {
        delete this.checkErrorTip.card_error_tip[item];
      }
    }
  }

  checkBasicData() {
    let isValid = false;
    this.checkErrorTip.card_error_tip.has_error = false;
    const { template_struct } = this.defaultData;
    // 账户
    if (this.defaultData.chan_pub_id_lst.length <= 0) {
      this.checkErrorTip.chan_pub_id_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.chan_pub_id_lst.is_show = false;
    }
    // 模板名称
    if (!this.defaultData.project_template_name) {
      this.checkErrorTip.project_template_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.project_template_name.is_show = false;
    }

    // 渠道号
    if (this.defaultData.convert_channel_id_lst.length <= 0) {
      this.checkErrorTip.convert_channel_id_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.convert_channel_id_lst.is_show = false;
    }

    // 广告组名称
    const campaignNameLength = getStringLength(template_struct.campaign.campaign_name, []);
    if (campaignNameLength < 1 || campaignNameLength > 50) {
      this.checkErrorTip.campaign_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.campaign_name.is_show = false;
    }

    // 广告组日预算
    if (template_struct.campaign.campaign_budget_mode === 'budget' && (template_struct.campaign.campaign_budget < 1000 || template_struct.campaign.campaign_budget > 9999999.99)) {
      this.checkErrorTip.campaign_budget.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.campaign_budget.is_show = false;
    }

    // 计划名称
    const adgroupNameLength = getStringLength(template_struct.adgroup.ad_name, []);
    if (adgroupNameLength < 1 || adgroupNameLength > 50) {
      this.checkErrorTip.ad_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.ad_name.is_show = false;
    }

    // 基础定向
    if (!this.defaultData.template_struct.adgroup.is_use_media_target_package && (this.defaultData.template_struct.adgroup.is_use_media_target_package || !template_struct.adgroup.parent_audience_template_id)) {
      this.checkErrorTip.parent_audience_template_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.parent_audience_template_id.is_show = false;
    }

    // 定向列表
    const audienceList = [];
    if (template_struct.adgroup.audience_by_convert_channel) {
      for (const item of Object.keys(template_struct.adgroup.audience_template_id_lst)) {
        if (item !== 'all' && template_struct.adgroup.audience_template_id_lst[item].length <= 0) {
          audienceList.push(true);
        }
      }
      if (audienceList.some((item) => item)) {
        this.checkErrorTip.audience_template_id_lst.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.audience_template_id_lst.is_show = false;
      }
    } else {
      if (template_struct.adgroup.audience_template_id_lst['all'].length <= 0) {
        this.checkErrorTip.audience_template_id_lst.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.audience_template_id_lst.is_show = false;
      }
    }

    // 投放范围
    const inventoryList = [];
    if (template_struct.adgroup.delivery_by_convert_channel) {
      for (const item of Object.keys(template_struct.adgroup.inventory_type_lst)) {
        if (item !== 'all') {
          if (template_struct.adgroup.inventory_type_lst[item].length <= 0) {
            inventoryList.push(true);
          } else if (template_struct.adgroup.inventory_type_lst[item].length > 0) {
            for (const s_item of template_struct.adgroup.inventory_type_lst[item]) {
              if (!s_item.delivery_range || !s_item.launch_positon || (s_item.delivery_range === 'DEFAULT' && s_item.launch_positon !== 'smart_inventory' && !s_item.inventory_type.length)) {
                inventoryList.push(true);
              }
            }
          }
        }
      }
    } else {
      if (template_struct.adgroup.inventory_type_lst['all'].length <= 0) {
        inventoryList.push(true);
      } else if (template_struct.adgroup.inventory_type_lst['all'].length > 0) {
        for (const s_item of template_struct.adgroup.inventory_type_lst['all']) {
          if (!s_item.delivery_range || !s_item.launch_positon || (s_item.delivery_range === 'DEFAULT' && s_item.launch_positon !== 'smart_inventory' && !s_item.inventory_type.length)) {
            inventoryList.push(true);
          }
        }
      }
    }

    if (inventoryList.some((item) => item)) {
      this.checkErrorTip.inventory_type_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.inventory_type_lst.is_show = false;
    }

    // 素材选取
    const materialList = [];
    const materialTitleList = [];
    const titleList = [];
    if (template_struct.material.by_channel_set_material) {
      for (const item of Object.keys(template_struct.material.material_type_lst)) {
        if (item !== 'all') {
          if (template_struct.material.by_material_set_title) {
            if (template_struct.material.material_type_lst[item].materials.length <= 0) {
              materialTitleList.push(true);
            } else if (template_struct.material.material_type_lst[item].materials.length > 0) {
              for (const s_item of template_struct.material.material_type_lst[item].materials) {
                if (s_item.title.length <= 0) {
                  materialTitleList.push(true);
                }
              }
            }
          } else {
            if (template_struct.material.material_type_lst[item].materials.length <= 0) {
              materialList.push(true);
            }

            if (template_struct.material.material_type_lst[item].titles.length <= 0) {
              titleList.push(true);
            }
          }
        }
      }
    } else {
      if (template_struct.material.by_material_set_title) {
        if (template_struct.material.material_type_lst['all'].materials.length <= 0) {
          materialTitleList.push(true);
        } else if (template_struct.material.material_type_lst['all'].materials.length > 0) {
          for (const s_item of template_struct.material.material_type_lst['all'].materials) {
            if (s_item.title.length <= 0) {
              materialTitleList.push(true);
            }
          }
        }
      } else {
        if (template_struct.material.material_type_lst['all'].materials.length <= 0) {
          materialList.push(true);
        }

        if (template_struct.material.material_type_lst['all'].titles.length <= 0) {
          titleList.push(true);
        }
      }
    }

    if (materialList.some((item) => item)) {
      this.checkErrorTip.material_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.material_lst.is_show = false;
    }

    if (titleList.some((item) => item)) {
      this.checkErrorTip.title_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.title_lst.is_show = false;
    }

    if (materialTitleList.some((item) => item)) {
      this.checkErrorTip.material_title_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.material_title_lst.is_show = false;
    }

    // 出价与预算
    // 日预算
    if (template_struct.adgroup.pricing === 'PRICING_CPC' || template_struct.adgroup.pricing === 'PRICING_CPM') {
      if (template_struct.adgroup.budget < 100 || template_struct.adgroup.budget > 9999999.99) {
        this.checkErrorTip.budget.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.budget.is_show = false;
      }
    } else if (template_struct.adgroup.pricing === 'PRICING_OCPC' || template_struct.adgroup.pricing === 'PRICING_OCPM') {
      if (template_struct.adgroup.budget < 300 || template_struct.adgroup.budget > 9999999.99) {
        this.checkErrorTip.budget.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.budget.is_show = false;
      }
    }

    // 出价
    if (template_struct.adgroup.smart_bid_type === 'SMART_BID_CUSTOM') {
      if (template_struct.adgroup.pricing === 'PRICING_CPC') {
        if (template_struct.adgroup.bid < 0.2 || template_struct.adgroup.bid > 100) {
          this.checkErrorTip.bid.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.bid.is_show = false;
        }
      } else if (template_struct.adgroup.pricing === 'PRICING_CPM') {
        if (template_struct.adgroup.bid < 4 || template_struct.adgroup.bid > 100) {
          this.checkErrorTip.bid.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.bid.is_show = false;
        }
      } else if (template_struct.adgroup.pricing === 'PRICING_OCPC' || template_struct.adgroup.pricing === 'PRICING_OCPM') {
        if (template_struct.adgroup.bid < 0.1 || template_struct.adgroup.bid > template_struct.adgroup.budget || template_struct.adgroup.bid > 10000) {
          this.checkErrorTip.bid.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.bid.is_show = false;
        }
      }
    }

    // 广告出价
    if (template_struct.adgroup.smart_bid_type === 'SMART_BID_CONSERVATIVE') {
      if (template_struct.adgroup.adjust_cpa === 1 && template_struct.adgroup.pricing === 'PRICING_OCPM') {
        if (template_struct.adgroup.bid < 0.1 || template_struct.adgroup.bid > template_struct.adgroup.budget || template_struct.adgroup.bid > 10000) {
          this.checkErrorTip.bid.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.bid.is_show = false;
        }
      }
    }

    // 深度优化出价
    if (template_struct.adgroup.deep_bid_type === 'DEEP_BID_MIN') {
      if (!template_struct.adgroup.deep_cpabid) {
        this.checkErrorTip.deep_cpabid.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.deep_cpabid.is_show = false;
      }
    }

    // 深度转化ROI系数
    if (template_struct.adgroup.deep_bid_type === 'ROI_COEFFICIENT') {
      if (!template_struct.adgroup.roi_goal) {
        this.checkErrorTip.roi_goal.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.roi_goal.is_show = false;
      }
    }

    // 行动号召
    if (this.defaultData.landing_type !== 'SHOP' && !template_struct.creative.action_text) {
      this.checkErrorTip.action_text.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.action_text.is_show = false;
    }

    // 应用名
    if (this.defaultData.landing_type === 'APP') {
      if (!template_struct.creative.app_name) {
        this.checkErrorTip.app_name.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.app_name.is_show = false;
      }
    }

    // 来源
    if (this.defaultData.landing_type === 'LINK' || this.defaultData.landing_type === 'QUICK_APP' || this.defaultData.landing_type === 'SHOP') {
      if (!template_struct.creative.source) {
        this.checkErrorTip.source.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.source.is_show = false;
      }
    }

    // 创意分类
    if (!template_struct.creative.third_industry_id_list.length) {
      this.checkErrorTip.third_industry_id_list.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.third_industry_id_list.is_show = false;
    }

    // 创意标签
    if (!template_struct.creative.ad_keywords.length) {
      this.checkErrorTip.ad_keywords.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.ad_keywords.is_show = false;
    }

    // 单计划素材数
    if (template_struct.material.single_adgroup_material_num <= 0) {
      this.checkErrorTip.single_adgroup_material_num.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.single_adgroup_material_num.is_show = false;
    }

    // 单计划标题数
    if (!this.defaultData.template_struct.material.by_material_set_title && template_struct.material.single_adgroup_title_num <= 0) {
      this.checkErrorTip.single_adgroup_material_num.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.single_adgroup_material_num.is_show = false;
    }

    // 广告组计划上限
    if (template_struct.campaign.is_set_adgroup_limit_num === '1' && template_struct.campaign.campaign_max_adgroup_num <= 0) {
      this.checkErrorTip.campaign_max_adgroup_num.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.campaign_max_adgroup_num.is_show = false;
    }

    // 卡片模板
    if (this.defaultData.template_struct.promotion_card.isOpenCard) {

      for (const cardItem of Object.keys(this.defaultData.template_struct.promotion_card.card_type_lst)) {
        if (!this.defaultData.template_struct.promotion_card.card_by_convert_channel) {
          if (!this.defaultData.template_struct.promotion_card.card_type_lst['all'].promo_card_setting.material_id) {
            this.checkErrorTip.card_error_tip['all']['material_id'].is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.card_error_tip['all']['material_id'].is_show = false;
          }

          if (!this.defaultData.template_struct.promotion_card.card_type_lst['all'].promo_card_setting.call_to_action) {
            this.checkErrorTip.card_error_tip['all']['call_to_action'].is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.card_error_tip['all']['call_to_action'].is_show = false;
          }

          if (!this.defaultData.template_struct.promotion_card.card_type_lst['all'].promo_card_setting.product_description) {
            this.checkErrorTip.card_error_tip['all']['product_description'].is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.card_error_tip['all']['product_description'].is_show = false;
          }
          const points = [];
          for (const item of this.defaultData.template_struct.promotion_card.card_type_lst['all'].promo_card_setting.product_points) {
            if (!item.name || item.name.length < 6 || item.name.length > 9) {
              points.push(true);
            }
          }

          if (points.some((item) => item)) {
            this.checkErrorTip.card_error_tip['all']['product_selling_points'].is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.card_error_tip['all']['product_selling_points'].is_show = false;
          }
        } else {
          if (cardItem !== 'all') {
            if (!this.defaultData.template_struct.promotion_card.card_type_lst[cardItem].promo_card_setting.material_id) {
              this.checkErrorTip.card_error_tip[cardItem]['material_id'].is_show = true;
              this.checkErrorTip.card_error_tip.has_error = true;
              isValid = true;
            } else {
              this.checkErrorTip.card_error_tip[cardItem]['material_id'].is_show = false;
            }

            if (!this.defaultData.template_struct.promotion_card.card_type_lst[cardItem].promo_card_setting.call_to_action) {
              this.checkErrorTip.card_error_tip[cardItem]['call_to_action'].is_show = true;
              this.checkErrorTip.card_error_tip.has_error = true;
              isValid = true;
            } else {
              this.checkErrorTip.card_error_tip[cardItem]['call_to_action'].is_show = false;
            }

            if (!this.defaultData.template_struct.promotion_card.card_type_lst[cardItem].promo_card_setting.product_description) {
              this.checkErrorTip.card_error_tip[cardItem]['product_description'].is_show = true;
              this.checkErrorTip.card_error_tip.has_error = true;
              isValid = true;
            } else {
              this.checkErrorTip.card_error_tip[cardItem]['product_description'].is_show = false;
            }

            const channelPoints = [];
            for (const item of this.defaultData.template_struct.promotion_card.card_type_lst[cardItem].promo_card_setting.product_points) {
              if (!item.name || item.name.length < 6 || item.name.length > 9) {
                channelPoints.push(true);
              }
            }

            if (channelPoints.some((item) => item)) {
              this.checkErrorTip.card_error_tip[cardItem]['product_selling_points'].is_show = true;
              this.checkErrorTip.card_error_tip.has_error = true;
              isValid = true;
            } else {
              this.checkErrorTip.card_error_tip[cardItem]['product_selling_points'].is_show = false;
            }
          }
        }

      }


    }

    return isValid;
  }
  useMarketChange() {
    this.defaultData.template_struct.promotion_card.isOpenCard = false;
    this.getChannelList('clear');
  }
  isUseMediaTargetPackage(event) {
    if (event) {
      for (const item of Object.keys(this.defaultData.template_struct.adgroup.inventory_type_lst)) {
        this.defaultData.template_struct.adgroup.inventory_type_lst[item] = deepCopy(this.defaultData.template_struct.adgroup.inventory_type_lst[item].filter(type => type.delivery_range === this.defaultData.template_struct.adgroup.inventory_type_lst[item][0]['delivery_range']));
      }
    }
    this.targetChannelList.forEach((item, index) => {
      this.defaultData.template_struct.adgroup.audience_template_id_lst[item.convert_channel_id] = [];
    });
    this.defaultData.template_struct.adgroup.parent_audience_template_id = null;
    this.changeTargetTab('0');
  }
  // 媒体基础定向包列表
  getMediaBasicTargetList() {
    let lastIndex = 0;
    this.launchMediaTargetPackage = [];
    this.defaultData.chan_pub_id_lst.forEach((chanPubId, index) => {
      this.launchRpaService
        .getMediaTargetPackage({
          "chan_pub_id": chanPubId,
        })
        .subscribe(
          (results: any) => {
            if (results.status_code !== 200) {
            } else {
              this.launchMediaTargetPackage = [...this.launchMediaTargetPackage, ...results['data']];
            }
          },
          (err: any) => {
            this.message.error('数据获取异常，请重试');
          },
          () => {
            lastIndex++;
            if (lastIndex === this.defaultData.chan_pub_id_lst.length) {
              this.getCurMediaTargetList();
              if (this.isEdit && this.defaultData.template_struct.adgroup.is_use_media_target_package) {
                this.changeTargetTab(0);
                const allUnchecked = this.curMediaTargetList.some((item) => !item.checked);
                this._allChecked = !allUnchecked;
              }
              if (this.isCopy) {
                this.isEdit = false;
              }
              this.launchMediaTargetPackage.forEach(item => {
                this.mediaTargetMap[item.audience_package_id] = item.name;
              });
            }
          },
        );
    });

  }
  getCurMediaTargetList() {
    // let deliveryRange='DEFAULT';
    // for (const item of Object.keys(this.defaultData.template_struct.adgroup.inventory_type_lst)) {
    //   if (!this.defaultData.template_struct.adgroup.delivery_by_convert_channel) {
    //     deliveryRange=this.defaultData.template_struct.adgroup.inventory_type_lst['all'][0]['delivery_range'];
    //   } else {
    //     if (item !== 'all') {
    //       deliveryRange=this.defaultData.template_struct.adgroup.inventory_type_lst[item][0]['delivery_range'];
    //     }
    //   }
    // }
    if (this.defaultData.landing_type === 'LINK') {
      this.curMediaTargetList = deepCopy(this.launchMediaTargetPackage.filter(item => item.landing_type === 'EXTERNAL'));
    } else if (this.defaultData.landing_type === 'QUICK_APP') {
      this.curMediaTargetList = deepCopy(this.launchMediaTargetPackage.filter(item => item.landing_type === 'QUICK_APP'));
    } else if (this.defaultData.landing_type === 'SHOP') {
      this.curMediaTargetList = deepCopy(this.launchMediaTargetPackage.filter(item => item.landing_type === 'SHOP'));
    } else {
      this.curMediaTargetList = deepCopy(this.launchMediaTargetPackage.filter(item => item.landing_type === this.defaultData.template_struct.adgroup.app_type));
    }
  }
  changeDeliveryRange(index, id, value) {
    if (value !== 'UNION') {
      this.defaultData.template_struct.adgroup.feed_delivery_search = 'DISABLED';
    }
    if (index == 0) {
      for (const item of Object.keys(this.defaultData.template_struct.adgroup.inventory_type_lst)) {
        this.defaultData.template_struct.adgroup.inventory_type_lst[item] = deepCopy(this.defaultData.template_struct.adgroup.inventory_type_lst[item].filter(type => type.delivery_range === this.defaultData.template_struct.adgroup.inventory_type_lst[item][0]['delivery_range']));
      }
      if (this.defaultData.template_struct.adgroup.audience_template_id_lst[id]) {
        this.defaultData.template_struct.adgroup.audience_template_id_lst[id] = [];
      }
    }
  }
  deleteAllTarget(id) {
    this.defaultData.template_struct.adgroup.audience_template_id_lst[id] = [];
    this.curMediaTargetList.forEach(item => item.checked = false);
  }
  deleteTarget(index, channelId, selectId) {
    this.defaultData.template_struct.adgroup.audience_template_id_lst[channelId].splice(index, 1);
    this.curMediaTargetList.forEach(item => {
      if (item.audience_package_id === selectId) {
        item.checked = false;
      }
    });
    this.getCheckData();
  }
  getInventoryData() {
    if (this.defaultData.template_struct.adgroup.delivery_by_convert_channel) {
      Object.keys(this.defaultData.template_struct.adgroup.inventory_type_lst).forEach(s_item => {
        if (s_item !== 'all') {
          for (let i = 0; i < this.defaultData.template_struct.adgroup.inventory_type_lst[s_item].length; i++) {
            if (this.defaultData.template_struct.adgroup.inventory_type_lst[s_item][i].launch_positon === 'smart_inventory') {
              this.defaultData.template_struct.adgroup.inventory_type_lst[s_item].splice(i, 1);
            } else {
              this.defaultData.template_struct.adgroup.inventory_type_lst[s_item][i].inventory_type.forEach((item, index) => {
                if (item === 'UNION_BOUTIQUE_GAME') {
                  this.defaultData.template_struct.adgroup.inventory_type_lst[s_item][i].inventory_type.splice(index, 1);
                }
              });
            }
          }
        }
      });
    } else {
      for (let i = 0; i < this.defaultData.template_struct.adgroup.inventory_type_lst['all'].length; i++) {
        if (this.defaultData.template_struct.adgroup.inventory_type_lst['all'][i].launch_positon === 'smart_inventory') {
          this.defaultData.template_struct.adgroup.inventory_type_lst['all'].splice(i, 1);
        } else {
          this.defaultData.template_struct.adgroup.inventory_type_lst['all'][i].inventory_type.forEach((item, index) => {
            if (item === 'UNION_BOUTIQUE_GAME') {
              this.defaultData.template_struct.adgroup.inventory_type_lst['all'][i].inventory_type.splice(index, 1);
            }
          });
        }
      }
    }
  }
  deliveryTabChange() {
    if (this.accountChannelList[this.curDeliveryIndex] && this.accountChannelList[this.curDeliveryIndex].convert_channel_id_lst.length > 1) {
      this.accountChannelList[this.curDeliveryIndex].convert_channel_id_lst.forEach((id, index) => {
        if (index > 0) {
          this.defaultData.template_struct.adgroup.inventory_type_lst[id] = deepCopy(this.defaultData.template_struct.adgroup.inventory_type_lst[this.accountChannelList[this.curDeliveryIndex].convert_channel_id_lst[0]]);
        }
      });
    }
  }
  checkDeliveryRange() {
    let flag = false;
    if (this.defaultData.template_struct.adgroup.delivery_by_convert_channel) {
      Object.keys(this.defaultData.template_struct.adgroup.inventory_type_lst).forEach(s_item => {
        if (s_item !== 'all' && this.defaultData.template_struct.adgroup.inventory_type_lst[s_item].find(item => item.delivery_range && item.delivery_range === 'UNION')) {
          flag = true;
        }
      });
    } else {
      if (this.defaultData.template_struct.adgroup.inventory_type_lst['all'].find(item => item.delivery_range && item.delivery_range === 'UNION')) {
        flag = true;
      }
    }
    return flag;
  }
  inventoryChange(flag, list, index) {
    if (!flag) {
      if (list[index].inventory_type.length === 1 && list[index].inventory_type[0] === 'INVENTORY_UNION_SLOT') {
        list[index] = {
          delivery_range: "",
          inventory_type: [],
          launch_positon: ""
        };
        this.message.info('请直接在首项选择穿山甲类型');
      }
      this.getInventoryTypeLstErrorTip();
    }
  }
  // 获取单项的错误状态
  getItemErrorTip(key, data, max?) {
    if (isArray(data)) {
      if (data.length === 0 || (max && data.length > max)) {
        this.checkErrorTip[key].is_show = true;
      } else {
        this.checkErrorTip[key].is_show = false;
      }
    } else {
      if (!data) {
        this.checkErrorTip[key].is_show = true;
      } else {
        this.checkErrorTip[key].is_show = false;
      }
    }
  }
  // 素材选取错误验证
  getMaterialErrorTip() {
    // 素材选取
    const materialList = [];
    const materialTitleList = [];
    const titleList = [];
    if (this.defaultData.template_struct.material.by_channel_set_material) {
      for (const item of Object.keys(this.defaultData.template_struct.material.material_type_lst)) {
        if (item !== 'all') {
          if (this.defaultData.template_struct.material.by_material_set_title) {
            if (this.defaultData.template_struct.material.material_type_lst[item].materials.length <= 0) {
              materialTitleList.push(true);
            } else if (this.defaultData.template_struct.material.material_type_lst[item].materials.length > 0) {
              for (const s_item of this.defaultData.template_struct.material.material_type_lst[item].materials) {
                if (s_item.title.length <= 0) {
                  materialTitleList.push(true);
                }
              }
            }
          } else {
            if (this.defaultData.template_struct.material.material_type_lst[item].materials.length <= 0) {
              materialList.push(true);
            }

            if (this.defaultData.template_struct.material.material_type_lst[item].titles.length <= 0) {
              titleList.push(true);
            }
          }
        }
      }
    } else {
      if (this.defaultData.template_struct.material.by_material_set_title) {
        if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length <= 0) {
          materialTitleList.push(true);
        } else if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length > 0) {
          for (const s_item of this.defaultData.template_struct.material.material_type_lst['all'].materials) {
            if (s_item.title.length <= 0) {
              materialTitleList.push(true);
            }
          }
        }
      } else {
        if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length <= 0) {
          materialList.push(true);
        }

        if (this.defaultData.template_struct.material.material_type_lst['all'].titles.length <= 0) {
          titleList.push(true);
        }

      }
    }

    if (materialList.some((item) => item)) {
      if (!this.defaultData.template_struct.material.by_channel_set_material) {
        this.checkErrorTip.material_lst.tip_text = '请选择素材';
      } else {
        this.checkErrorTip.material_lst.tip_text = '请根据渠道号分别选择素材';
      }
      this.checkErrorTip.material_lst.is_show = true;
    } else {
      this.checkErrorTip.material_lst.is_show = false;
    }

    if (titleList.some((item) => item)) {
      if (!this.defaultData.template_struct.material.by_channel_set_material) {
        this.checkErrorTip.title_lst.tip_text = '请选择短标题';
      } else {
        this.checkErrorTip.title_lst.tip_text = '请根据渠道号分别选择短标题';
      }
      this.checkErrorTip.title_lst.is_show = true;
    } else {
      this.checkErrorTip.title_lst.is_show = false;
    }
    if (materialTitleList.some((item) => item)) {
      if (!this.defaultData.template_struct.material.by_channel_set_material) {
        this.checkErrorTip.material_title_lst.tip_text = '请选择素材，素材下标题不能为空';
      } else {
        this.checkErrorTip.material_title_lst.tip_text = '请根据渠道号选择素材,素材下标题不能为空';
      }
      this.checkErrorTip.material_title_lst.is_show = true;
    } else {
      this.checkErrorTip.material_title_lst.is_show = false;
    }

  }
  // 获取定向包的错误状态
  getAudienceTemplateIdLstErrorTip() {
    const audienceList = [];
    if (this.defaultData.template_struct.adgroup.audience_by_convert_channel) {
      for (const item of Object.keys(this.defaultData.template_struct.adgroup.audience_template_id_lst)) {
        if (item !== 'all' && this.defaultData.template_struct.adgroup.audience_template_id_lst[item].length <= 0) {
          audienceList.push(true);
        }
      }
      if (audienceList.some((item) => item)) {
        this.checkErrorTip.audience_template_id_lst.is_show = true;
      } else {
        this.checkErrorTip.audience_template_id_lst.is_show = false;
      }
    } else {
      if (this.defaultData.template_struct.adgroup.audience_template_id_lst['all'].length <= 0) {
        this.checkErrorTip.audience_template_id_lst.is_show = true;
      } else {
        this.checkErrorTip.audience_template_id_lst.is_show = false;
      }
    }
  }
  // 获取投放范围的错误状态
  getInventoryTypeLstErrorTip() {
    // 投放范围
    const inventoryList = [];
    if (this.defaultData.template_struct.adgroup.delivery_by_convert_channel) {
      if (this.defaultData.template_struct.adgroup['delivery_select_type'] == '1') {
        for (const item of Object.keys(this.defaultData.template_struct.adgroup.inventory_type_lst)) {
          if (item !== 'all') {
            if (this.defaultData.template_struct.adgroup.inventory_type_lst[item].length <= 0) {
              inventoryList.push(true);
            } else if (this.defaultData.template_struct.adgroup.inventory_type_lst[item].length > 0) {
              for (const s_item of this.defaultData.template_struct.adgroup.inventory_type_lst[item]) {
                if (!s_item.delivery_range || !s_item.launch_positon || (s_item.delivery_range === 'DEFAULT' && s_item.launch_positon !== 'smart_inventory' && !s_item.inventory_type.length)) {
                  inventoryList.push(true);
                }
              }
            }
          }
        }
      } else {
        this.accountChannelList.forEach(account => {
          for (const item of Object.keys(this.defaultData.template_struct.adgroup.inventory_type_lst)) {
            if (item === account.convert_channel_id_lst[0]) {
              if (this.defaultData.template_struct.adgroup.inventory_type_lst[item].length <= 0) {
                inventoryList.push(true);
              } else if (this.defaultData.template_struct.adgroup.inventory_type_lst[item].length > 0) {
                for (const s_item of this.defaultData.template_struct.adgroup.inventory_type_lst[item]) {
                  if (!s_item.delivery_range || !s_item.launch_positon || (s_item.delivery_range === 'DEFAULT' && s_item.launch_positon !== 'smart_inventory' && !s_item.inventory_type.length)) {
                    inventoryList.push(true);
                  }
                }
              }
            }
          }
        });

      }
    } else {
      if (this.defaultData.template_struct.adgroup.inventory_type_lst['all'].length <= 0) {
        inventoryList.push(true);
      } else if (this.defaultData.template_struct.adgroup.inventory_type_lst['all'].length > 0) {
        for (const s_item of this.defaultData.template_struct.adgroup.inventory_type_lst['all']) {
          if (!s_item.delivery_range || !s_item.launch_positon || (s_item.delivery_range === 'DEFAULT' && s_item.launch_positon !== 'smart_inventory' && !s_item.inventory_type.length)) {
            inventoryList.push(true);
          }
        }
      }
    }

    if (inventoryList.some((item) => item)) {
      this.checkErrorTip.inventory_type_lst.is_show = true;
    } else {
      this.checkErrorTip.inventory_type_lst.is_show = false;
    }
  }

}
