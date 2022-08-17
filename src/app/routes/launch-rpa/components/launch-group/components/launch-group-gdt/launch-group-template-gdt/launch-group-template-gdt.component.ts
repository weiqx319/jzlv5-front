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

import { deepCopy, formatDate } from '@jzl/jzl-util';
import { LaunchMaterialCoverModalComponent } from "../../../../../modal/launch-material-cover-modal/launch-material-cover-modal.component";
import { MenuService } from "../../../../../../../core/service/menu.service";
import { Observable, zip } from "rxjs";

@Component({
  selector: 'app-launch-group-template-gdt',
  templateUrl: './launch-group-template-gdt.component.html',
  styleUrls: ['./launch-group-template-gdt.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchGroupTemplateGdtComponent implements OnInit {
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
      name: '推广计划',
      sub: [
        { key: '#promotion_objective', name: '推广目的' },
        { key: '#budget', name: '预算' },
        { key: '#adgroup_name', name: '名称' },
      ]
    },
    {
      key: '#adgroup_start',
      name: '广告',
      sub: [
        { key: '#launch_objective', name: '投放目标' },
        { key: '#user_target', name: '用户定向' },
        { key: '#launch_range', name: '广告版位' },
        { key: '#budget_and_bid', name: '排期与出价' },
      ]
    },
    {
      key: '#creative_start',
      name: '创意',
      sub: [
        { key: '#creative_label', name: '创意类型' },
        { key: '#material_title', name: '素材标题' },
        { key: '#creative_setting', name: '创意设置' },
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

  public promotedObjectTypeList = [
    // {
    //   value: 'PROMOTED_OBJECT_TYPE_LINK',
    //   label: '网页推广',
    // },
    {
      value: 'PROMOTED_OBJECT_TYPE_APP_ANDROID',
      label: '应用推广-Android',
    },
    {
      value: 'PROMOTED_OBJECT_TYPE_APP_IOS',
      label: '应用推广-IOS',
    },
    {
      value: 'PROMOTED_OBJECT_TYPE_ECOMMERCE',
      label: '商品推广',
    },
    {
      value: 'PROMOTED_OBJECT_TYPE_LEAD_AD',
      label: '销售线索收集',
    },
    {
      value: 'PROMOTED_OBJECT_TYPE_LINK_WECHAT',
      label: '品牌活动推广',
    },
  ];

  public promotedObjectMap = {
    'PROMOTED_OBJECT_TYPE_APP_ANDROID': "应用推广-Android",
    'PROMOTED_OBJECT_TYPE_APP_IOS': "应用推广-IOS",
    'PROMOTED_OBJECT_TYPE_ECOMMERCE': "商品推广",
    'PROMOTED_OBJECT_TYPE_LEAD_AD': "销售线索收集",
    'PROMOTED_OBJECT_TYPE_LINK_WECHAT': "品牌活动推广",
  };

  public excludedDimensionList = {
    'PROMOTED_OBJECT_TYPE_LINK': [
      {
        "label": "不限",
        "value": "",
        "checked": true
      },
      {
        label: "同计划广告",
        value: "EXCLUDED_DIMENSION_CAMPAIGN",
        checked: false
      },
      {
        label: "同账号广告",
        value: "EXCLUDED_DIMENSION_UID",
        checked: false
      },
      {
        label: "同商务管家广告",
        value: "EXCLUDED_DIMENSION_BUSINESS_MANAGER",
        checked: false
      },
      {
        label: "同主体广告",
        value: "EXCLUDED_DIMENSION_COMPANY_ACCOUNT",
        checked: false
      },
    ],
    'PROMOTED_OBJECT_TYPE_APP_ANDROID': [
      {
        label: "不限",
        value: "",
        checked: true
      },
      {
        label: "同计划广告",
        value: "EXCLUDED_DIMENSION_CAMPAIGN",
        checked: false
      },
      {
        label: "同账号广告",
        value: "EXCLUDED_DIMENSION_UID",
        checked: false
      },
      {
        label: "同商务管家广告",
        value: "EXCLUDED_DIMENSION_BUSINESS_MANAGER",
        checked: false
      },
      {
        label: "同主体广告",
        value: "EXCLUDED_DIMENSION_COMPANY_ACCOUNT",
        checked: false
      },
      {
        label: "同应用",
        value: "EXCLUDED_DIMENSION_APP",
        checked: false
      },
    ],
    'PROMOTED_OBJECT_TYPE_APP_IOS': [
      {
        label: "不限",
        value: "",
        checked: true
      },
      {
        label: "同计划广告",
        value: "EXCLUDED_DIMENSION_CAMPAIGN",
        checked: false
      },
      {
        label: "同账号广告",
        value: "EXCLUDED_DIMENSION_UID",
        checked: false
      },
      {
        label: "同商务管家广告",
        value: "EXCLUDED_DIMENSION_BUSINESS_MANAGER",
        checked: false
      },
      {
        label: "同主体广告",
        value: "EXCLUDED_DIMENSION_COMPANY_ACCOUNT",
        checked: false
      },
      {
        label: "同应用",
        value: "EXCLUDED_DIMENSION_APP",
        checked: false
      },
    ],
    'PROMOTED_OBJECT_TYPE_ECOMMERCE': [
      {
        label: "不限",
        value: "",
        checked: true
      },
      {
        label: "同计划广告",
        value: "EXCLUDED_DIMENSION_CAMPAIGN",
        checked: false
      },
      {
        label: "同账号广告",
        value: "EXCLUDED_DIMENSION_UID",
        checked: false
      },
      {
        label: "同商务管家广告",
        value: "EXCLUDED_DIMENSION_BUSINESS_MANAGER",
        checked: false
      },
      {
        label: "同主体广告",
        value: "EXCLUDED_DIMENSION_COMPANY_ACCOUNT",
        checked: false
      },
      {
        label: "同商品",
        value: "EXCLUDED_DIMENSION_PRODUCT",
        checked: false
      }
    ],
    'PROMOTED_OBJECT_TYPE_LEAD_AD': [
      {
        label: "不限",
        value: "",
        checked: true
      },
      {
        label: "同计划广告",
        value: "EXCLUDED_DIMENSION_CAMPAIGN",
        checked: false
      },
      {
        label: "同账号广告",
        value: "EXCLUDED_DIMENSION_UID",
        checked: false
      },
      {
        label: "同商务管家广告",
        value: "EXCLUDED_DIMENSION_BUSINESS_MANAGER",
        checked: false
      },
      {
        label: "同主体广告",
        value: "EXCLUDED_DIMENSION_COMPANY_ACCOUNT",
        checked: false
      },
    ],
    'PROMOTED_OBJECT_TYPE_LINK_WECHAT': [
      {
        label: "不限",
        value: "",
        checked: true
      },
      {
        label: "同计划广告",
        value: "EXCLUDED_DIMENSION_CAMPAIGN",
        checked: false
      },
      {
        label: "同账号广告",
        value: "EXCLUDED_DIMENSION_UID",
        checked: false
      },
      {
        label: "同商务管家广告",
        value: "EXCLUDED_DIMENSION_BUSINESS_MANAGER",
        checked: false
      },
      {
        label: "同主体广告",
        value: "EXCLUDED_DIMENSION_COMPANY_ACCOUNT",
        checked: false
      },
    ]
  };


  public today = new Date();

  public showCoefficient = false;

  public structConfigLoading = true;
  public structConfig: any = {};

  public cid;

  public inputValue = '';

  public basicTargetList = [];

  public curBasicTarget = [];

  public targetChannelList = [];

  public launchTargetPackage = [];

  public allTargetChecked = false;

  public targetIndeterminate = false; // 表示有选中的，不管是全选还是选个别

  // public targetChannelList = {};

  // public accountChannelList = [];

  public chan_pub_ids = [];

  public curChannelList = [];

  public channelTreeList = [];

  public resultList = [];

  public curTargetList = [];   // 当前渠道下投放包列表

  public curDeliveryIndex = 0;

  public curTargetIndex = 0;

  public isChannelTree = true;

  public user_id;

  public bid_scope = {
    'BID_MODE_CPC': { min: 0.1, max: 100 },
    'BID_MODE_CPM': { min: 1.5, max: 999 },
    'BID_MODE_CPA': { min: 1, max: 500 },
    'BID_MODE_OCPC': { min: 0.1, max: 5000 },
    'BID_MODE_OCPM': { min: 0.1, max: 5000 },
  };

  public defaultData = {
    project_id: "",
    chan_pub_id_lst: [],  // 账户
    project_template_name: "",  // 模板名称
    convert_channel_id_lst: [],  // 渠道
    landing_type: "PROMOTED_OBJECT_TYPE_APP_ANDROID",  // 推广目标类型
    template_struct: {},
  };

  public campaignData = {
    campaign_type: "CAMPAIGN_TYPE_NORMAL",  // 计划类型
    pub_campaign_id: null,   // 计划id
    promoted_object_type: "PROMOTED_OBJECT_TYPE_APP_ANDROID",  // 推广目标类型
    campaign_budget_mode: '',  // 日预算类型
    budget: 50,   // 计划日预算
    campaign_select: "create",   // 计划选择
    campaign_adgroup_limit: false,
    adgroup_count_per_campaign: 1,   // 计划设定广告组数量
    pub_campaign_name: "",  // 计划名称
    speed_mode: "SPEED_MODE_STANDARD"   // 投放方式
  };

  public adgroupData = {
    parent_audience_template_id: "",  // 父级定向
    first_day_begin_time: "",  // 首日开始投放时间：HH:mm:ss
    bid_amount: 50,   // 广告出价
    budget: 50,   // 预算
    audience_template_id_lst: { all: [] },  // 分渠道定向
    begin_date: "",  // 开始投放日期
    dynamic_ad_spec: {    // 商品库
      product_source: "",  // 商品或商品系列id
      product_catalog_id: "",  // 商品库id
      product_mode: "",    // 商品投放模式: 单商品
    },
    automatic_site_enabled: false,  // 自动版位
    expand_enabled: false,  // 是否使用自动扩量
    scene_spec: {
      union_position_package: {},  // 优量汇流量包定投
      display_scene: [],   // 优量汇广告展示场景
      mobile_union_industry: [],  // 	优量汇行业精选流量包
      exclude_union_position_package: {} // 	优量汇流量包屏蔽
    },
    time_series: "",  // 投放时间段
    end_date: "",  // 结束投放日期
    auto_acquisition_enabled: false,  // 一键起量
    creative_display_type: "CREATIVE_DISPLAY_TYPE_INTELLIGENCE",  // 创意展示类型
    optimization_goal: "",  // 优化目标
    auto_acquisition_budget: 200,  // 起量预算
    audience_by_convert_channel: false,  // 分渠道设置定向
    cold_start_audience: [],  // 扩量种子人群
    auto_derived_creative_enabled: false,  // 是否开启自动衍生视频创意
    bid_strategy: "BID_STRATEGY_AVERAGE_COST",  // 出价策略
    bid_mode: "BID_MODE_CPC",  // 出价方式
    pub_adgroup_name: "",  // 广告名称
    expand_targeting: [],  // 扩量不可突破定向
    site_set: [],  // 版位列表
    deep_conversion_spec: {
      deep_conversion_behavior_spec: {
        goal: "",    // 深度优化目标
        bid_amount: "1",  // 深度出价
      }
    },  // 深度优化转化
    deep_conversion_type: "",  // 深度优化类型
    deep_bid_amount: "",   // 深度出价
    schedule_date: "long_term_launch",  // 投放日期
    time_range: [new Date(), new Date()],  // 起始时间
    schedule_time_slt: "nolimt",  // 投放时段类型   schedule_time指定时间段    nolimt不限
    deep_conversion_spec_type: false, // 深度优化转化是否开启
    ad_space: "site_set",  // 版位类型
    exclude_union_position_package_type: "nolimit",  // 流量包屏蔽类型
    union_position_package_type: "nolimit",   // 流量包定投类型
    cold_start_audience_type: false,  // 扩量种子人群
    excluded_dimension: "",  // 排除已转化用户
    conversion_behavior_list: "",  // 自定义转化行为
    adgroup_budget_mode: 0,  // 广告日预算
  };

  public adcreativeData = {
    marketing_pendant_image_id: "",
    union_market_switch: "",
    adcreative_elements: {
      countdown_begin: "",
      countdown_expiring_timestamp: "",
      brand_name: "",
      brand_img: "",
      brand_img_md5: "",
      label: [],
      button_text: "",
      bottom_text: "",
      brandMaterial: {},
    },
    feeds_video_comment_switch: false,
    data_display: {},
    adcreative_template_id: "",  // 创意形式
    adcreative_type: "CUSTOM",  // 创意类型
    feeds_interaction_enabled: true,
    component_id: "",
    video_end_page: {},
    pub_adcreative_name: "",
    pub_ad_name: "",
    profile_id: "",
  };

  public materialData = {
    by_material_set_title: false,
    single_adgroup_title_num: 1,
    material_type_lst: {
      all: { materials: [], titles: [], description: [] },
    },
    by_channel_set_material: false,
    single_adgroup_material_num: 1,
    by_channel_set_conversion_assist: false,
    conversion_assist: {
      all: {
        link_name_switch: false,
        conversion_data_switch: false,
        link_name_type: "",
        link_page_type: "LINK_PAGE_TYPE_CANVAS_WECHAT",
        link_page_spec: {
          page_url: "",
          mini_program_id: "",
          mini_program_path: "",
        },
        conversion_data_type: "CONVERSION_DATA_ADMETRIC",
        conversion_target_type: "",
        page_track_url: "",
      }
    }
  };

  public cursorPosition = 0;

  public publisherId;

  public campaignWordList = [];

  public adgroupWordList = [];

  public unionChecked = false;

  public allAdSpaceOneChecked = false;

  public allAdSpaceTwoChecked = false;

  public weChatMomentChecked = false;

  public adSpaceListOne = [
    { label: "腾讯看点", value: "SITE_SET_KANDIAN", checked: false },
    { label: "QQ、腾讯音乐及游戏", value: "SITE_SET_QQ_MUSIC_GAME", checked: false },
  ];

  public adSpaceListTwo = [
    { label: "腾讯视频", value: "SITE_SET_TENCENT_VIDEO", checked: false },
    { label: "腾讯新闻", value: "SITE_SET_TENCENT_NEWS", checked: false }
  ];

  public adSpaceOneIndeterminate = false;

  public adSpaceTwoIndeterminate = false;

  public display_scene_type = true;

  public mobile_union_industry_type = true;

  public optimizationGoalList = [];

  public deepOptimizationGoalList = [];

  public expandTargetingChecked = false;

  public startAudienceList = [];

  public custom_behavior_checked = false;

  public conversionBehaviorList = [];

  public curUnionPackageList = [];

  public curExcludeUnionIndex = 0;

  public curIncludeUnionIndex = 0;

  public curExcludeUnionPackageList = [];

  public curIncludeUnionPackageList = [];

  public allExcludeUnionChecked = false;

  public allIncludeUnionChecked = false;

  public excludeUnionPackageList = [];

  public includeUnionPackageList = [];

  public adcreativeTemplateList = [];

  public creativeElementsList = [];

  public isGetElement = false;

  public creativeLabelList = [];

  public buttonTextList = {};

  public elementNamesList = [];

  public linkNameTypeList = [];

  public wechatProfilesList = [];

  public checkErrorTip = {
    chan_pub_id_lst: {
      is_show: false,
      tip_text: '账号必填',
    },
    project_template_name: {
      is_show: false,
      tip_text: '模板名称必填',
    },
    budget: {
      is_show: false,
      tip_text: '指定日期预算不能为空',
    },
    convert_channel_id_lst: {
      is_show: false,
      tip_text: '渠道号必填',
    },
    pub_campaign_name: {
      is_show: false,
      tip_text: '计划名称必填',
    },
    pub_adgroup_name: {
      is_show: false,
      tip_text: '广告名称必填',
    },
    adgroup_count_per_campaign: {
      is_show: false,
      tip_text: '计划广告上限必填',
    },
    parent_audience_template_id: {
      is_show: false,
      tip_text: '基础定向必填',
    },
    audience_template_id_lst: {
      is_show: false,
      tip_text: '定向包列表必填',
    },
    expand_targeting: {
      is_show: false,
      tip_text: '不可突破定向必填',
    },
    cold_start_audience: {
      is_show: false,
      tip_text: '扩量种子人群必填',
    },
    site_set: {
      is_show: false,
      tip_text: '投放版位必填',
    },
    bid_amount: {
      is_show: false,
      tip_text: '出价必填',
    },
    auto_acquisition_budget: {
      is_show: false,
      tip_text: '起量预算必填',
    },
    optimization_goal: {
      is_show: false,
      tip_text: '优化目标必填',
    },
    goal: {
      is_show: false,
      tip_text: '深度优化目标必填',
    },
    deep_bid_amount: {
      is_show: false,
      tip_text: '深度优化出价必填',
    },
    adgroup_budget: {
      is_show: false,
      tip_text: '广告日预算必填',
    },
    // 投放时段-指定时间段
    time_series: {
      is_show: false,
      tip_text: '请选择指定时间或不限',
    },
    adcreative_template_id: {
      is_show: false,
      tip_text: '创意形式必填',
    },
    single_adgroup_material_num: {
      is_show: false,
      tip_text: '单计划素材数必填',
    },
    single_adgroup_title_num: {
      is_show: false,
      tip_text: '单计划标题数必填',
    },
    brand_name: {
      is_show: false,
      tip_text: '品牌名称必填',
    },
    brand_img: {
      is_show: false,
      tip_text: '品牌图片必填',
    },
    button_text: {
      is_show: false,
      tip_text: '按钮文案必填',
    },
    bottom_text: {
      is_show: false,
      tip_text: '左下辅助文案应为6-8字',
    },
    label: {
      is_show: false,
      tip_text: '标签必填',
    },
    union_position_package: {
      is_show: false,
      tip_text: '流量包定投必填',
    },
    exclude_union_position_package: {
      is_show: false,
      tip_text: '流量包屏蔽必填',
    },
    material_lst: {
      is_show: false,
      tip_text: '请根据渠道号分别选择素材',
    },
    title_lst: {
      is_show: false,
      tip_text: '请根据渠道号分别选择短标题，如有长短标题，数量须保持一致',
    },
    description_lst: {
      is_show: false,
      tip_text: '请根据渠道号分别选择长标题，如有长短标题，数量须保持一致',
    },
    material_title_lst: {
      is_show: false,
      tip_text: '请根据渠道号选择素材,素材下标题不能为空，如有长短标题，数量须保持一致'
    },
    profile_id: {
      is_show: false,
      tip_text: '品牌简介页必填'
    },
    conversion_assist_lst: {
      is_show: false,
      tip_text: '请根据渠道号完善辅助转化配置'
    }
  };

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
    this.getStructConfigByGdt();
    this.getCreativLabelList();
    this.getButtonTextList();
    this.getLaunchRpaWordList();
    if (this.isEdit && this.projectTemplateId) {
      this.getProjectTemplate();
    } else {
      this.getChannelList();
      this.getConversionBehaviorList();
      this.getAdcreativeTemplatesList('clear');
      this.getOptimizationGoalList('clear');
      this.getBasicTargetList();
    }
  }

  getProjectTemplate() {
    this.launchRpaService.getProjectTemplateDetail(this.projectTemplateId, {
      cid: this.cid,
      publisher_id: this.publisherId,
    })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.defaultData = deepCopy(results['data']);
            this.campaignData = deepCopy(results['data']['template_struct']['campaign']);
            this.adgroupData = deepCopy(results['data']['template_struct']['adgroup']);
            this.adcreativeData = deepCopy(results['data']['template_struct']['adcreative']);
            this.materialData = deepCopy(results['data']['template_struct']['material']);

            if (this.isCopy) {
              this.defaultData.project_template_name = this.defaultData.project_template_name + '-复制';
            }
            this.getWechatProfiles();
            this.getChannelList();
            this.getStartAudienceList();
            this.getConversionBehaviorList();
            this.getCreativeElementsList();
            this.getLinkNameTypeList();
            this.getAdcreativeTemplatesList();
            this.getOptimizationGoalList();
            this.getDeepOptimizationGoalList();
            this.getBasicTargetList();
            this.getStartAudienceList();

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

  initEditData() {
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
      if (!this.adgroupData.audience_template_id_lst[item.convert_channel_id]) {
        this.adgroupData.audience_template_id_lst[item.convert_channel_id] = [];
      }
      if (!this.materialData.material_type_lst[item.convert_channel_id]) {
        this.materialData.material_type_lst[item.convert_channel_id] = {
          materials: [],
          titles: []
        };
      }

      if (!this.materialData.conversion_assist[item.convert_channel_id]) {
        this.materialData.conversion_assist[item.convert_channel_id] = {
          link_name_switch: false,
          conversion_data_switch: false,
          link_name_type: "",
          link_page_type: "LINK_PAGE_TYPE_CANVAS_WECHAT",
          link_page_spec: {
            page_url: "",
            mini_program_id: "",
            mini_program_path: "",
          },
          conversion_data_type: "CONVERSION_DATA_ADMETRIC",
          conversion_target_type: "",
          page_track_url: "",
        };
      }

      if (!this.adgroupData['scene_spec']['union_position_package'][item.convert_channel_id]) {
        this.adgroupData['scene_spec']['union_position_package'][item.convert_channel_id] = [];
      }

      if (!this.adgroupData['scene_spec']['exclude_union_position_package'][item.convert_channel_id]) {
        this.adgroupData['scene_spec']['exclude_union_position_package'][item.convert_channel_id] = [];
      }

    });
    if (this.adgroupData.parent_audience_template_id) {
      this.getChildTargetList(this.adgroupData.parent_audience_template_id);
    }

    if (this.adgroupData.union_position_package_type === 'custom') {
      this.changeIncludeUnionPackageTab(0);
    }

    if (this.adgroupData.exclude_union_position_package_type === 'custom') {
      this.changeExcludeUnionPackageTab(0);
    }

    if (this.adgroupData['expand_targeting'].length > 0) {
      this.structConfig['adgroup']['expand_targeting']['sub'].forEach(item => {
        if (this.adgroupData['expand_targeting'].indexOf(item.value) > -1) {
          item.checked = true;
        }
      });
    } else {
      this.expandTargetingChecked = true;
    }

    if (this.adgroupData.excluded_dimension !== '') {
      if (this.adgroupData.conversion_behavior_list) {
        this.custom_behavior_checked = true;
      }
    }
    if (this.adgroupData.ad_space === 'site_set') {
      if (this.adgroupData.site_set.length > 0) {
        if (this.adgroupData.site_set.includes('SITE_SET_MOMENTS')) {
          this.weChatMomentChecked = true;
        }
        this.adSpaceListOne.forEach(item => {
          if (this.adgroupData.site_set.includes(item.value)) {
            item.checked = true;
            this.adSpaceOneIndeterminate = true;
          }
        });

        this.adSpaceListTwo.forEach(item => {
          if (this.adgroupData.site_set.includes(item.value)) {
            item.checked = true;
            this.adSpaceTwoIndeterminate = true;
          }
        });

        if (this.adgroupData.site_set.includes('SITE_SET_KANDIAN') && this.adgroupData.site_set.includes('SITE_SET_QQ_MUSIC_GAME')) {
          this.allAdSpaceOneChecked = true;
          this.adSpaceOneIndeterminate = false;
        }

        if (this.adgroupData.site_set.includes('SITE_SET_TENCENT_VIDEO') && this.adgroupData.site_set.includes('SITE_SET_TENCENT_NEWS')) {
          this.allAdSpaceTwoChecked = true;
          this.adSpaceTwoIndeterminate = false;
        }

        if (this.adgroupData.site_set.includes('SITE_SET_MOBILE_UNION')) {
          this.unionChecked = true;

          if (this.adgroupData['scene_spec']['display_scene'].length > 0) {
            this.structConfig['adgroup']['display_scene_custom']['sub'].forEach(item => {
              if (this.adgroupData['scene_spec']['display_scene'].indexOf(item.value) > -1) {
                item.checked = true;
              }
            });
            this.display_scene_type = false;
          }

          if (this.adgroupData['scene_spec']['mobile_union_industry'].length > 0) {
            this.structConfig['adgroup']['mobile_union_industry_custom']['sub'].forEach(item => {
              if (this.adgroupData['scene_spec']['mobile_union_industry'].indexOf(item.value) > -1) {
                item.checked = true;
              }
            });
            this.mobile_union_industry_type = false;
          }
        }
      }
    }
  }

  // 获取配置
  getStructConfigByGdt() {
    this.launchRpaService
      .getStructConfigByGdt({
        cid: this.cid,
        user_id: this.user_id,
      })
      .subscribe((results: any) => {

        if (results.status_code && results.status_code !== 200) {
          if (results.status_code !== 205) {
            this.message.error(results.message);
          }
        } else {
          this.structConfig = { ...results.data };
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

  transferTreeChange(data) {
    this.defaultData.convert_channel_id_lst = data;
    this.getItemErrorTip('convert_channel_id_lst', this.defaultData.convert_channel_id_lst);
    if (data.length === 0) {
      this.adgroupData.audience_by_convert_channel = false;
      this.materialData.by_channel_set_material = false;
      this.materialData.by_channel_set_conversion_assist = false;
      this.adgroupData.union_position_package_type = 'nolimit';
      this.adgroupData.exclude_union_position_package_type = 'nolimit';
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
      if (!this.adgroupData.audience_template_id_lst[item.convert_channel_id]) {
        this.adgroupData.audience_template_id_lst[item.convert_channel_id] = [];
      }
      if (!this.adgroupData.scene_spec.union_position_package[item.convert_channel_id]) {
        this.adgroupData.scene_spec.union_position_package[item.convert_channel_id] = [];
      }
      if (!this.adgroupData.scene_spec.exclude_union_position_package[item.convert_channel_id]) {
        this.adgroupData.scene_spec.exclude_union_position_package[item.convert_channel_id] = [];
      }

      if (!this.materialData.material_type_lst[item.convert_channel_id]) {
        this.materialData.material_type_lst[item.convert_channel_id] = {
          materials: [], titles: [], description: []
        };
      }

      if (!this.materialData.conversion_assist[item.convert_channel_id]) {
        this.materialData.conversion_assist[item.convert_channel_id] = {
          link_name_switch: false,
          conversion_data_switch: false,
          link_name_type: "",
          link_page_type: "LINK_PAGE_TYPE_CANVAS_WECHAT",
          link_page_spec: {
            page_url: "",
            mini_program_id: "",
            mini_program_path: "",
          },
          conversion_data_type: "CONVERSION_DATA_ADMETRIC",
          conversion_target_type: "",
          page_track_url: "",
        };
      }

      const curChannelData = data.find(value => value === item.convert_channel_id);

      if (!curChannelData) {
        delete this.adgroupData.audience_template_id_lst[item.convert_channel_id];
        delete this.adgroupData.scene_spec.union_position_package[item.convert_channel_id];
        delete this.adgroupData.scene_spec.exclude_union_position_package[item.convert_channel_id];
        delete this.materialData.material_type_lst[item.convert_channel_id];
        delete this.materialData.conversion_assist[item.convert_channel_id];

        this.targetChannelList.splice(index, 1);
      }
    });
    this.changeTargetTab(this.curTargetIndex);
    this.getCheckData();
  }

  // 获取渠道列表
  getChannelList(status?) {
    this.isChannelTree = false;
    const allpConditions = [
      {
        key: "chan_pub_id",
        name: "",
        op: "in",
        value: this.defaultData.chan_pub_id_lst
      },
      {
        key: "promoted_object_type",
        name: "",
        op: "=",
        value: this.campaignData.promoted_object_type
      },
    ];

    this.launchRpaService.getChannelListByGdt({ pConditions: allpConditions }, {
      result_model: 'all',
    }).subscribe((results: any) => {
      if (results.status_code === 200) {
        this.curChannelList = deepCopy(results['data']);
        if (!this.defaultData.chan_pub_id_lst.length) {
          this.curChannelList = [];
        }
        this.getChannelTreeList();
        if (this.isEdit && this.projectTemplateId) {
          this.initEditData();
          if (this.adgroupData.union_position_package_type === 'custom' && this.targetChannelList.length) {
            this.getIncludeUnionPackageList(this.targetChannelList[0]['chan_pub_id']);
          }

          if (this.adgroupData.exclude_union_position_package_type === 'custom' && this.targetChannelList.length) {
            this.getExcludeUnionPackageList(this.targetChannelList[0]['chan_pub_id']);
          }
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

  changeObjectType(value) {
    this.getChannelList('clear');
    this.getOptimizationGoalList('clear');
    this.getDeepOptimizationGoalList('clear');
    this.getAdcreativeTemplatesList('clear');
    this.adgroupData.excluded_dimension = "";
    if (value === 'PROMOTED_OBJECT_TYPE_APP_ANDROID' || value === 'PROMOTED_OBJECT_TYPE_APP_IOS') {
      this.adgroupData.ad_space = 'site_set';
    }

    if (value === 'PROMOTED_OBJECT_TYPE_APP_ANDROID') {
      this.adgroupData.bid_mode = "BID_MODE_CPC";
    }
    this.curBasicTarget = deepCopy(this.basicTargetList.filter(item => item.landing_type === this.campaignData.promoted_object_type));
    this.adgroupData.parent_audience_template_id = null;
    this.curTargetList = [];
    this.launchTargetPackage = [];
    this.allTargetChecked = false;
  }

  // 定向投放包选中
  checkTarget(event?) {
    const allChecked = this.curTargetList.every(
      (value) => value.checked,
    );
    const allUnchecked = this.curTargetList.every((value) => !value.checked);

    // 表示不是全选，但是有选中的
    this.targetIndeterminate = (!allUnchecked && !allChecked) || allChecked;
    this.allTargetChecked = allChecked;

    this.getCheckData();
  }

  // 定向投放包全选
  checkTargetAll(value) {
    if (value) {
      this.curTargetList.forEach((data) => {
        data.checked = true;
      });
      this.targetIndeterminate = true;
    } else {
      this.targetIndeterminate = false;
      this.curTargetList.forEach((data) => (data.checked = false));
    }

    this.getCheckData();
  }

  getCheckData() {
    if (this.adgroupData.audience_by_convert_channel) {
      this.adgroupData.audience_template_id_lst[this.targetChannelList[this.curTargetIndex].convert_channel_id] = [];
      this.curTargetList.forEach(item => {
        if (item.checked) {
          this.adgroupData.audience_template_id_lst[this.targetChannelList[this.curTargetIndex].convert_channel_id].push(item.audience_template_id);
        }
      });
    } else {
      this.adgroupData.audience_template_id_lst['all'] = [];
      this.curTargetList.forEach(item => {
        if (item.checked) {
          this.adgroupData.audience_template_id_lst['all'].push(item.audience_template_id);
        }
      });
    }
    this.getAudienceTemplateIdLstErrorTip();
  }

  changeTargetChannel(value) {
    this.curTargetIndex = 0;
    this.curTargetList = deepCopy(this.launchTargetPackage);
    for (const item of Object.keys(this.adgroupData.audience_template_id_lst)) {
      this.adgroupData.audience_template_id_lst[item] = [];
    }
    if (this.curTargetList.length > 0) {
      const allUnchecked = this.curTargetList.some((item) => !item.checked);
      this.allTargetChecked = !allUnchecked;
    }
  }

  changeBasicAudience(id) {
    this.getChildTargetList(id);
    this.getItemErrorTip('parent_audience_template_id', this.adgroupData.parent_audience_template_id);
  }

  // 基础定向包列表
  getBasicTargetList() {
    this.launchRpaService
      .getTargetBasicListByGdt({
        cid: this.cid,
      }, { result_model: 'all', })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.basicTargetList = [];
          } else {
            this.basicTargetList = results['data'];
            // this.curBasicTarget = deepCopy(results['data']);
            this.curBasicTarget = deepCopy(this.basicTargetList.filter(item => item.landing_type === this.defaultData.landing_type));
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
      .getTargetListByGdt(id, {
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
            if (this.isEdit) {
              if (this.adgroupData.audience_by_convert_channel) {
                this.changeTargetTab(0);
              } else {
                this.adgroupData.audience_template_id_lst['all'].forEach(item => {
                  const data = this.curTargetList.find(s_item => s_item.audience_template_id == item);
                  if (data) {
                    data.checked = true;
                  }
                });
              }
              const allUnchecked = this.curTargetList.some((item) => !item.checked);
              this.allTargetChecked = !allUnchecked;
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

  changeTargetTab(value) {
    this.curTargetIndex = value;
    this.curTargetList = deepCopy(this.launchTargetPackage);
    if (this.targetChannelList[value]) {
      this.adgroupData.audience_template_id_lst[this.targetChannelList[value]['convert_channel_id']].forEach(item => {
        const data = this.curTargetList.find(s_item => s_item.audience_template_id == item);
        if (data) {
          data.checked = true;
        }
      });
    }

    if (this.curTargetList.length > 0) {
      const allUnchecked = this.curTargetList.some((item) => !item.checked);
      this.allTargetChecked = !allUnchecked;
    }
  }

  getDisableDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.today) < 0;
  }

  dateDate(event) { //从日期组件中得到的日期数据
    this.adgroupData.time_series = event.dateData;
    // 投放时段错误验证
    if (!this.adgroupData.time_series.includes('1')) {
      this.checkErrorTip.time_series.is_show = true;
    } else {
      this.checkErrorTip.time_series.is_show = false;
    }
  }

  changeAllSiteSet(type) {
    this.adSpaceOneIndeterminate = false;
    this.adSpaceTwoIndeterminate = false;
    if (type === 4) {
      this.allAdSpaceOneChecked = false;
      this.allAdSpaceTwoChecked = false;
      this.unionChecked = false;

      this.adSpaceListOne = this.adSpaceListOne.map(item => {
        return { ...item, checked: false };
      });
      this.adSpaceListTwo = this.adSpaceListTwo.map(item => {
        return { ...item, checked: false };
      });
    } else if (type === 1) {
      this.weChatMomentChecked = false;
      if (this.allAdSpaceOneChecked) {
        this.adSpaceListOne = this.adSpaceListOne.map(item => {
          return { ...item, checked: true };
        });
      } else {
        this.adSpaceListOne = this.adSpaceListOne.map(item => {
          return { ...item, checked: false };
        });
      }
    } else {
      this.weChatMomentChecked = false;
      if (this.allAdSpaceTwoChecked) {
        this.adSpaceListTwo = this.adSpaceListTwo.map(item => {
          return { ...item, checked: true };
        });
      } else {
        this.adSpaceListTwo = this.adSpaceListTwo.map(item => {
          return { ...item, checked: false };
        });
      }
    }

    this.getSiteSetList();

  }

  changeSiteSet(type) {
    this.weChatMomentChecked = false;
    if (type === 1) {
      if (this.adSpaceListOne.every(item => !item.checked)) {
        this.allAdSpaceOneChecked = false;
        this.adSpaceOneIndeterminate = false;
      } else if (this.adSpaceListOne.every(item => item.checked)) {
        this.allAdSpaceOneChecked = true;
        this.adSpaceOneIndeterminate = false;
      } else {
        this.adSpaceOneIndeterminate = true;
      }
    } else if (type === 2) {
      if (this.adSpaceListTwo.every(item => !item.checked)) {
        this.allAdSpaceTwoChecked = false;
        this.adSpaceTwoIndeterminate = false;
      } else if (this.adSpaceListTwo.every(item => item.checked)) {
        this.allAdSpaceTwoChecked = true;
        this.adSpaceTwoIndeterminate = false;
      } else {
        this.adSpaceTwoIndeterminate = true;
      }
    }

    this.getSiteSetList();

  }

  getSiteSetList() {
    this.adgroupData.site_set = [];

    for (const item of this.adSpaceListOne) {
      if (item.checked) {
        this.adgroupData.site_set.push(item.value);
      }
    }

    for (const item of this.adSpaceListTwo) {
      if (item.checked) {
        this.adgroupData.site_set.push(item.value);
      }
    }

    if (this.weChatMomentChecked) {
      this.adgroupData.site_set = ['SITE_SET_MOMENTS'];
    }

    if (this.unionChecked) {
      this.adgroupData.site_set.push('SITE_SET_MOBILE_UNION');
      if (this.adgroupData.site_set.length === 1) {
        this.adgroupData.bid_mode = "BID_MODE_CPC";
      }
    }

    if (!this.adgroupData.site_set.includes('SITE_SET_MOBILE_UNION')) {
      this.adgroupData.scene_spec = {
        union_position_package: {},
        display_scene: [],
        mobile_union_industry: [],
        exclude_union_position_package: {}
      };
      this.display_scene_type = true;
      this.structConfig['adgroup']['display_scene_custom']['sub'].forEach(item => {
        item["checked"] = false;
      });
      this.mobile_union_industry_type = true;
      this.structConfig['adgroup']['mobile_union_industry_custom']['sub'].forEach(item => {
        item["checked"] = false;
      });
      this.adgroupData.union_position_package_type = 'nolimit';
      this.adgroupData.exclude_union_position_package_type = 'nolimit';
    }
    this.getOptimizationGoalList('clear');
    this.getDeepOptimizationGoalList('clear');
    this.getAdcreativeTemplatesList('clear');
    this.getCreativeElementsList();
    // 获取错误状态
    this.getItemErrorTip('site_set', this.adgroupData.site_set)
  }

  updateNotLimit(type) {
    setTimeout(() => {
      if (type === 1) {
        this.display_scene_type = true;
        this.structConfig['adgroup']['display_scene_custom']['sub'].forEach(item => {
          item["checked"] = false;
        });
      } else if (type === 2) {
        this.mobile_union_industry_type = true;
        this.structConfig['adgroup']['mobile_union_industry_custom']['sub'].forEach(item => {
          item["checked"] = false;
        });
      } else {
        this.structConfig['adgroup']['expand_targeting']['sub'].forEach(item => {
          item["checked"] = false;
        });
        this.adgroupData['expand_targeting'] = [];
        this.getItemErrorTip('expand_targeting', this.expandTargetingChecked);
      }
    });
  }

  updateSingleChecked(type) {
    if (type === 1) {
      this.display_scene_type = false;
      this.display_scene_type = this.structConfig['adgroup']['display_scene_custom']['sub'].every(item => !item.checked);
    } else if (type === 2) {
      this.mobile_union_industry_type = false;
      this.mobile_union_industry_type = this.structConfig['adgroup']['mobile_union_industry_custom']['sub'].every(item => !item.checked);
    }
  }

  changeExpandTarget() {
    this.adgroupData['expand_targeting'] = [];
    this.structConfig['adgroup']['expand_targeting']['sub'].forEach(item => {
      if (item.checked) {
        this.adgroupData['expand_targeting'].push(item.value);
      }
    });
    this.getItemErrorTip('expand_targeting', this.adgroupData['expand_targeting']);
  }

  changeAdSpace() {
    this.adgroupData.site_set = [];
    this.adSpaceOneIndeterminate = false;
    this.adSpaceTwoIndeterminate = false;
    this.allAdSpaceOneChecked = false;
    this.allAdSpaceTwoChecked = false;
    this.unionChecked = false;
    this.adSpaceListOne = this.adSpaceListOne.map(item => {
      return { ...item, checked: false };
    });
    this.adSpaceListTwo = this.adSpaceListTwo.map(item => {
      return { ...item, checked: false };
    });
    this.getSiteSetList();
  }

  // 获取优化目标
  getOptimizationGoalList(status?) {
    if (status === 'clear') { this.adgroupData.optimization_goal = ""; }
    const body = {
      site_set: this.adgroupData.site_set,
      promoted_object_type: this.campaignData.promoted_object_type,
      bid_mode: this.adgroupData.bid_mode,
    };

    this.launchRpaService
      .getOptimizationGoalList(body, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.optimizationGoalList = results['data'];
          } else {
            this.optimizationGoalList = [];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 获取深度优化目标
  getDeepOptimizationGoalList(status?) {
    if (!this.adgroupData.optimization_goal) {
      return;
    }

    if (status === 'clear') { this.adgroupData.deep_conversion_spec.deep_conversion_behavior_spec.goal = ""; }

    const body = {
      site_set: this.adgroupData.site_set,
      promoted_object_type: this.campaignData.promoted_object_type,
      bid_mode: this.adgroupData.bid_mode,
      optimization_goal: this.adgroupData.optimization_goal,
      deep_optimization_goal_type: "BEHAVIOR"
    };

    this.launchRpaService
      .getDeepOptimizationGoalList(body, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.deepOptimizationGoalList = results['data'];
          } else {
            this.deepOptimizationGoalList = [];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  changeBidMode() {
    if (this.adgroupData.bid_amount > this.bid_scope[this.adgroupData.bid_mode].max) {
      this.adgroupData.bid_amount = this.bid_scope[this.adgroupData.bid_mode].max;
    } else if (this.adgroupData.bid_amount < this.bid_scope[this.adgroupData.bid_mode].min) {
      this.adgroupData.bid_amount = this.bid_scope[this.adgroupData.bid_mode].min;
    }

    this.getOptimizationGoalList('clear');
    this.getDeepOptimizationGoalList('clear');
    this.getAdcreativeTemplatesList('clear');
    // 出价错误验证
    this.getItemErrorTip('bid_amount', this.adgroupData.bid_amount)
  }

  changeOptimizationGoal() {
    this.getDeepOptimizationGoalList('clear');
    this.getItemErrorTip('optimization_goal', this.adgroupData.optimization_goal);
  }

  // 获取自动扩量人群包
  getStartAudienceList() {
    this.launchRpaService
      .getStartAudienceList({ chan_pub_id_list: this.defaultData.chan_pub_id_lst }, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.startAudienceList = results['data'];
          } else {
            this.startAudienceList = [];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  changeAccount(type) {
    if (!type) {
      this.getStartAudienceList();
      this.getWechatProfiles();
      this.targetChannelList = [];
      this.channelTreeList = [];
      this.getChannelList('clear');
    }
    this.getItemErrorTip('chan_pub_id_lst', this.defaultData.chan_pub_id_lst);
  }

  // 自定义转化行为
  getConversionBehaviorList() {
    this.launchRpaService
      .getConversionBehaviorList({
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.conversionBehaviorList = results['data'];
          } else {
            this.conversionBehaviorList = [];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 获取流量包
  getIncludeUnionPackageList(id) {
    const body = {
      chan_pub_id: id,
      union_package_type: 'UNION_PACKAGE_TYPE_INCLUDE',
    };
    this.launchRpaService
      .getUnionPackageList(body, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.includeUnionPackageList = results['data'];
            this.curIncludeUnionPackageList = deepCopy(this.includeUnionPackageList);
            if (this.isEdit && this.projectTemplateId) {
              this.changeIncludeUnionPackageTab(0);
            }
          } else {
            this.includeUnionPackageList = [];
            this.curIncludeUnionPackageList = [];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 获取流量屏蔽包
  getExcludeUnionPackageList(id) {
    const body = {
      chan_pub_id: id,
      union_package_type: 'UNION_PACKAGE_TYPE_EXCLUDE',
    };
    this.launchRpaService
      .getUnionPackageList(body, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.excludeUnionPackageList = results['data'];
            this.curExcludeUnionPackageList = deepCopy(this.excludeUnionPackageList);
            if (this.isEdit && this.projectTemplateId) {
              this.changeExcludeUnionPackageTab(0);
            }
          } else {
            this.excludeUnionPackageList = [];
            this.curExcludeUnionPackageList = [];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  checkUnionPackage(curData, type) {
    const allChecked = curData.every((value) => value.checked,);
    if (type === 'exclude') {
      this.allExcludeUnionChecked = allChecked;
      this.getUnionPackageData(this.adgroupData.exclude_union_position_package_type, curData, this.adgroupData.scene_spec.exclude_union_position_package, this.curExcludeUnionIndex);
    } else {
      this.allIncludeUnionChecked = allChecked;
      this.getUnionPackageData(this.adgroupData.union_position_package_type, curData, this.adgroupData.scene_spec.union_position_package, this.curIncludeUnionIndex);
    }
  }

  checkUnionPackageAll(value, curData, type) {
    if (value) {
      curData.forEach((data) => {
        data.checked = true;
      });
    } else {
      curData.forEach((data) => (data.checked = false));
    }

    if (type === 'exclude') {
      this.getUnionPackageData(this.adgroupData.exclude_union_position_package_type, curData, this.adgroupData.scene_spec.exclude_union_position_package, this.curExcludeUnionIndex);
    } else {
      this.getUnionPackageData(this.adgroupData.union_position_package_type, curData, this.adgroupData.scene_spec.union_position_package, this.curIncludeUnionIndex);
    }

  }

  getUnionPackageData(isCheck, sourceData, resultData, index) {
    if (isCheck) {
      resultData[this.targetChannelList[index].convert_channel_id] = [];
      sourceData.forEach(item => {
        if (item.checked) {
          resultData[this.targetChannelList[index].convert_channel_id].push(item.union_package_id);
        }
      });
    } else {
      resultData['all'] = [];
    }
  }

  changeIncludeUnionPackageTab(value) {
    this.curIncludeUnionIndex = value;
    this.curIncludeUnionPackageList = deepCopy(this.includeUnionPackageList);
    if (this.targetChannelList.length) {
      this.adgroupData.scene_spec.union_position_package[this.targetChannelList[value]['convert_channel_id']].forEach(item => {
        const data = this.curIncludeUnionPackageList.find(s_item => s_item.union_package_id == item);
        if (data) {
          data.checked = true;
        }
      });
    }

    if (this.curIncludeUnionPackageList.length > 0) {
      const allUnchecked = this.curIncludeUnionPackageList.some((item) => !item.checked);
      this.allIncludeUnionChecked = !allUnchecked;
    }

  }

  changeExcludeUnionPackageTab(value) {
    this.curExcludeUnionIndex = value;
    this.curExcludeUnionPackageList = deepCopy(this.excludeUnionPackageList);
    if (this.targetChannelList.length) {
      this.adgroupData.scene_spec.exclude_union_position_package[this.targetChannelList[value]['convert_channel_id']].forEach(item => {
        const data = this.curExcludeUnionPackageList.find(s_item => s_item.union_package_id == item);
        if (data) {
          data.checked = true;
        }
      });
    }

    if (this.curExcludeUnionPackageList.length > 0) {
      const allUnchecked = this.curExcludeUnionPackageList.some((item) => !item.checked);
      this.allExcludeUnionChecked = !allUnchecked;
    }
  }

  changeExcludeUnionPackage(value) {
    this.curExcludeUnionIndex = 0;
    if (value === 'custom') {
      this.allExcludeUnionChecked = false;
      this.getExcludeUnionPackageList(this.targetChannelList[this.curExcludeUnionIndex]['chan_pub_id']);
    } else {
      this.targetChannelList.forEach(item => {
        this.adgroupData.scene_spec.exclude_union_position_package[item.convert_channel_id] = [];
      });
    }
  }

  changeIncludeUnionPackage(value) {
    this.curIncludeUnionIndex = 0;
    if (value === 'custom') {
      this.allIncludeUnionChecked = false;
      this.getIncludeUnionPackageList(this.targetChannelList[this.curIncludeUnionIndex]['chan_pub_id']);
    } else {
      this.targetChannelList.forEach(item => {
        this.adgroupData.scene_spec.union_position_package[item.convert_channel_id] = [];
      });
    }
  }

  changeAdcreativeTemplate() {
    this.getCreativeElementsList();
    this.getLinkNameTypeList();

    this.materialData.material_type_lst['all'] = { materials: [], titles: [], description: [] };
    this.materialData.conversion_assist['all'] = {
      link_name_switch: false,
      conversion_data_switch: false,
      link_name_type: "",
      link_page_type: "LINK_PAGE_TYPE_CANVAS_WECHAT",
      link_page_spec: {
        page_url: "",
        mini_program_id: "",
        mini_program_path: "",
      },
      conversion_data_type: "CONVERSION_DATA_ADMETRIC",
      conversion_target_type: "",
      page_track_url: "",
    };
    this.targetChannelList.forEach(item => {
      this.materialData.material_type_lst[item.convert_channel_id] = {
        materials: [],
        titles: [],
        description: []
      };
      this.materialData.conversion_assist[item.convert_channel_id] = {
        link_name_switch: false,
        conversion_data_switch: false,
        link_name_type: "",
        link_page_type: "LINK_PAGE_TYPE_CANVAS_WECHAT",
        link_page_spec: {
          page_url: "",
          mini_program_id: "",
          mini_program_path: "",
        },
        conversion_data_type: "CONVERSION_DATA_ADMETRIC",
        conversion_target_type: "",
        page_track_url: "",
      };
    });

    this.materialData.by_material_set_title = false;
    this.materialData.single_adgroup_title_num = 1;
    this.materialData.by_channel_set_material = false;
    this.materialData.single_adgroup_material_num = 1;
    this.adcreativeData.adcreative_elements.brand_img = "";
    this.adcreativeData.adcreative_elements.brand_img_md5 = "";
    this.adcreativeData.adcreative_elements.brand_name = "";
    this.adcreativeData.adcreative_elements.label = [];
    this.adcreativeData.adcreative_elements.button_text = "";
    this.adcreativeData.adcreative_elements.bottom_text = "";
    this.adcreativeData.adcreative_elements.countdown_begin = "";
    this.adcreativeData.adcreative_elements.countdown_expiring_timestamp = "";
    this.adcreativeData.adcreative_elements.brandMaterial = {};
    this.adcreativeData.adcreative_elements.brand_img = "";
    this.adcreativeData.adcreative_elements.brand_img_md5 = "";

    this.getItemErrorTip('adcreative_template_id', this.adcreativeData.adcreative_template_id);
  }

  // 获取创意形式
  getAdcreativeTemplatesList(status?) {
    if (status == 'clear') {
      this.adcreativeData.adcreative_template_id = "";
    }
    const body = {
      promoted_object_type: this.campaignData.promoted_object_type,
      site_set: this.adgroupData.site_set,
      bid_mode: this.adgroupData.bid_mode,
    };
    this.launchRpaService
      .getAdcreativeTemplatesList(body, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.adcreativeTemplateList = results['data'];
          } else {
            this.adcreativeTemplateList = [];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  getCreativeElementsList() {
    this.isGetElement = false;
    this.elementNamesList = [];
    const body = {
      promoted_object_type: this.campaignData.promoted_object_type,
      site_set: this.adgroupData.site_set,
      adcreative_template_id: this.adcreativeData.adcreative_template_id,
    };
    this.launchRpaService
      .getCreativeElementsList(body, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.creativeElementsList = results['data'];
            for (const item of this.creativeElementsList) {
              this.elementNamesList.push(item.key);
            }
          } else {
            this.creativeElementsList = [];
          }
          this.isGetElement = true;
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 获取标签
  getCreativLabelList() {
    this.launchRpaService
      .getCreativLabelList({
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.creativeLabelList = results['data'];
          } else {
            this.creativeLabelList = [];
          }
          this.isGetElement = true;
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 获取按钮文字
  getButtonTextList() {
    this.launchRpaService
      .getButtonTextList({
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.buttonTextList = results['data'];
          } else {
            this.buttonTextList = {};
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 获取按钮文案数据
  getLinkNameTypeList() {
    this.launchRpaService
      .getLinkNameTypeList({ adcreative_template_id: this.adcreativeData.adcreative_template_id })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.linkNameTypeList = results['data'];
          } else {
            this.linkNameTypeList = [];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }


  changeExcludeDimension(value) {
    if (value !== '') {
      this.custom_behavior_checked = false;
      this.adgroupData.conversion_behavior_list = this.conversionBehaviorList[0].value;
    }
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
      this.campaignData.pub_campaign_name = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
      curInput.value = this.campaignData.pub_campaign_name;
      this.getItemErrorTip('pub_campaign_name', this.campaignData.pub_campaign_name);
    } else if (type === 'adgroup') {
      this.adgroupData.pub_adgroup_name = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
      curInput.value = this.adgroupData.pub_adgroup_name;
      this.getItemErrorTip('pub_adgroup_name', this.adgroupData.pub_adgroup_name);
    }

    this.cursorPosition += tagValueLength;
    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核
    } else {
      curInput.select();
      curInput.selectionStart = this.cursorPosition;
      curInput.selectionEnd = this.cursorPosition;
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
        () => {
        },
      );
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
      this.adgroupData.audience_by_convert_channel = false;
      this.materialData.by_channel_set_material = false;
      this.materialData.by_channel_set_conversion_assist = false;
      this.adgroupData.union_position_package_type = 'nolimit';
      this.adgroupData.exclude_union_position_package_type = 'nolimit';
    }

    for (const item of Object.keys(this.adgroupData.audience_template_id_lst)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.convert_channel_id == item)) {
        delete this.adgroupData.audience_template_id_lst[item];
      }
    }

    for (const item of Object.keys(this.materialData.material_type_lst)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.convert_channel_id == item)) {
        delete this.materialData.material_type_lst[item];
      }
    }

    for (const item of Object.keys(this.materialData.conversion_assist)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.convert_channel_id == item)) {
        delete this.materialData.material_type_lst[item];
      }
    }

    for (const item of Object.keys(this.adgroupData.scene_spec.union_position_package)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.convert_channel_id == item)) {
        delete this.adgroupData.scene_spec.union_position_package[item];
      }
    }

    for (const item of Object.keys(this.adgroupData.scene_spec.exclude_union_position_package)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.convert_channel_id == item)) {
        delete this.adgroupData.scene_spec.exclude_union_position_package[item];
      }
    }

  }

  getWechatProfiles() {
    this.launchRpaService.getWechatProfiles({ chan_pub_id: this.defaultData.chan_pub_id_lst[0] }, {}).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          this.wechatProfilesList = results['data'];
        } else {
          this.wechatProfilesList = [];
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


  doCancel() {
    this.cancel.emit();
  }

  doSave() {
    const isValid = this.checkBasicData();

    if (isValid) {
      this.message.error('请完善参数信息！');
      return;
    }

    this.defaultData['template_struct']['campaign'] = this.campaignData;
    this.defaultData['template_struct']['adgroup'] = this.adgroupData;
    this.defaultData['template_struct']['adcreative'] = this.adcreativeData;
    this.defaultData['template_struct']['material'] = this.materialData;

    const resultData = deepCopy(this.defaultData);


    if (!resultData['template_struct']['adgroup'].cold_start_audience_type) {
      resultData['template_struct']['adgroup']['cold_start_audience'] = [];
    }

    if (resultData['template_struct']['adgroup'].excluded_dimension == '') {
      resultData['template_struct']['adgroup'].conversion_behavior_list = "";
    }
    resultData['template_struct']['adgroup']['scene_spec']['display_scene'] = [];
    resultData['template_struct']['adgroup']['scene_spec']['mobile_union_industry'] = [];
    if (resultData['template_struct']['adgroup'].site_set.includes('SITE_SET_MOBILE_UNION')) {
      this.structConfig['adgroup']['display_scene_custom']['sub'].forEach(item => {
        if (item.checked) {
          resultData['template_struct']['adgroup']['scene_spec']['display_scene'].push(item.value);
        }
      });
      this.structConfig['adgroup']['mobile_union_industry_custom']['sub'].forEach(item => {
        if (item.checked) {
          resultData['template_struct']['adgroup']['scene_spec']['mobile_union_industry'].push(item.value);
        }
      });
    }

    if (resultData['template_struct']['adgroup']['union_position_package_type'] === 'nolimit') {
      resultData['template_struct']['adgroup']['scene_spec']['union_position_package'] = {};
    }

    if (resultData['template_struct']['adgroup']['exclude_union_position_package_type'] === 'nolimit') {
      resultData['template_struct']['adgroup']['scene_spec']['exclude_union_position_package'] = {};
    }

    for (const item of Object.keys(resultData['template_struct'].adgroup.audience_template_id_lst)) {
      if (resultData['template_struct'].adgroup.audience_by_convert_channel) {
        delete resultData['template_struct'].adgroup.audience_template_id_lst['all'];
      } else {
        if (item !== 'all') {
          delete resultData['template_struct'].adgroup.audience_template_id_lst[item];
        }
      }
    }

    for (const item of Object.keys(resultData['template_struct'].material.material_type_lst)) {
      if (resultData['template_struct'].material.by_channel_set_material) {
        delete resultData['template_struct'].material.material_type_lst['all'];
      } else {
        if (item !== 'all') {
          delete resultData['template_struct'].material.material_type_lst[item];
        }
      }
    }

    for (const item of Object.keys(resultData['template_struct'].material.conversion_assist)) {
      if (resultData['template_struct'].material.by_channel_set_conversion_assist) {
        delete resultData['template_struct'].material.conversion_assist['all'];
      } else {
        if (item !== 'all') {
          delete resultData['template_struct'].material.conversion_assist[item];
        }
      }
    }

    resultData.project_id = this.data.project_id;
    resultData.landing_type = resultData['template_struct']['campaign']['promoted_object_type'];
    if (this.elementNamesList.includes('video') || this.elementNamesList.includes('short_video1')) {
      resultData['template_struct']['adcreative']['adcreative_elements']['video'] = "";
    }

    if (this.elementNamesList.includes('image') || this.elementNamesList.includes('image_list')) {
      resultData['template_struct']['adcreative']['adcreative_elements']['image'] = "";
    }

    if (this.elementNamesList.includes('title')) {
      resultData['template_struct']['adcreative']['adcreative_elements']['title'] = "";
    }

    if (this.elementNamesList.includes('description')) {
      resultData['template_struct']['adcreative']['adcreative_elements']['description'] = "";
    }

    if (this.elementNamesList.includes('countdown_expiring_timestamp') && resultData['template_struct']['adcreative']['adcreative_elements']['countdown_expiring_timestamp']) {
      resultData['template_struct']['adcreative']['adcreative_elements']['countdown_expiring_timestamp'] = formatDate(new Date(resultData['template_struct']['adcreative']['adcreative_elements']['countdown_expiring_timestamp']), 'yyyy-MM-dd HH:mm:ss');

      if (resultData['template_struct']['adgroup']['site_set'].includes('SITE_SET_MOMENTS')) {
        resultData['template_struct']['adcreative']['adcreative_elements']['countdown_begin'] = formatDate(new Date(resultData['template_struct']['adcreative']['adcreative_elements']['countdown_begin']), 'yyyy-MM-dd HH:mm:ss');
      }
    }

    resultData['template_struct']['adgroup']['begin_date'] = formatDate(new Date(resultData['template_struct']['adgroup'].time_range[0]), 'yyyy-MM-dd');
    resultData['template_struct']['adgroup']['end_date'] = formatDate(new Date(resultData['template_struct']['adgroup'].time_range[1]), 'yyyy-MM-dd');

    if (!this.custom_behavior_checked) {
      resultData['template_struct']['adgroup']['conversion_behavior_list'] = "";
    }

    if (this.isEdit && this.projectTemplateId) {
      this.launchRpaService.updateProjectTemplate(this.projectTemplateId, resultData, {
        publisher_id: this.publisherId
      }).subscribe(
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
      this.launchRpaService.createProjectTemplate(resultData, {
        publisher_id: this.publisherId
      }).subscribe(
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


  checkBasicData() {
    let isValid = false;
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

    // 预算-指定日预算
    if (this.campaignData.campaign_budget_mode === '' && !this.campaignData.budget) {
      this.checkErrorTip.budget.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.budget.is_show = false;
    }

    // 渠道号
    if (this.defaultData.convert_channel_id_lst.length <= 0) {
      this.checkErrorTip.convert_channel_id_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.convert_channel_id_lst.is_show = false;
    }

    // 广告名称
    const adgroupNameLength = getStringLength(this.adgroupData.pub_adgroup_name, []);
    if (adgroupNameLength < 1 || adgroupNameLength > 50) {
      this.checkErrorTip.pub_adgroup_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.pub_adgroup_name.is_show = false;
    }

    // 计划广告上限
    if (this.campaignData.campaign_adgroup_limit && !this.campaignData.adgroup_count_per_campaign) {
      this.checkErrorTip.adgroup_count_per_campaign.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.adgroup_count_per_campaign.is_show = false;
    }

    // 计划名称
    const campaignNameLength = getStringLength(this.campaignData.pub_campaign_name, []);
    if (campaignNameLength < 1 || campaignNameLength > 50) {
      this.checkErrorTip.pub_campaign_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.pub_campaign_name.is_show = false;
    }

    // 基础定向
    if (!this.adgroupData.parent_audience_template_id) {
      this.checkErrorTip.parent_audience_template_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.parent_audience_template_id.is_show = false;
    }

    // 定向列表
    const audienceList = [];
    if (this.adgroupData.audience_by_convert_channel) {
      for (const item of Object.keys(this.adgroupData.audience_template_id_lst)) {
        if (item !== 'all' && this.adgroupData.audience_template_id_lst[item].length <= 0) {
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
      if (this.adgroupData.audience_template_id_lst['all'].length <= 0) {
        this.checkErrorTip.audience_template_id_lst.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.audience_template_id_lst.is_show = false;
      }
    }

    // 不可突破定向
    if (this.adgroupData.expand_enabled && !this.expandTargetingChecked && this.adgroupData.expand_targeting.length <= 0) {
      this.checkErrorTip.expand_targeting.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.expand_targeting.is_show = false;
    }

    // 扩量种子人群
    if (this.adgroupData.cold_start_audience_type && this.adgroupData.cold_start_audience.length <= 0) {
      this.checkErrorTip.cold_start_audience.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.cold_start_audience.is_show = false;
    }

    // 版位
    if (this.adgroupData.ad_space === 'site_set' && this.adgroupData.site_set.length <= 0) {
      this.checkErrorTip.site_set.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.site_set.is_show = false;
    }

    // 出价
    if (!this.adgroupData.bid_amount) {
      this.checkErrorTip.bid_amount.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.bid_amount.is_show = false;
    }

    if (this.adgroupData.bid_mode === 'BID_MODE_OCPC' || this.adgroupData.bid_mode === 'BID_MODE_OCPM') {
      // 优化目标
      if (!this.adgroupData.optimization_goal) {
        this.checkErrorTip.optimization_goal.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.optimization_goal.is_show = false;
      }
      // 起量预算
      if (this.adgroupData.auto_acquisition_enabled && !this.adgroupData.auto_acquisition_budget) {
        this.checkErrorTip.auto_acquisition_budget.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.auto_acquisition_budget.is_show = false;
      }

      // 深度优化目标
      if ((this.campaignData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_LINK' || this.campaignData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_ECOMMERCE') && this.adgroupData.deep_conversion_spec_type && !this.adgroupData.deep_conversion_spec.deep_conversion_behavior_spec.goal) {
        this.checkErrorTip.goal.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.goal.is_show = false;
      }
      // 深度优化出价
      if (this.adgroupData.deep_conversion_spec_type && !this.adgroupData.deep_conversion_spec.deep_conversion_behavior_spec.bid_amount) {
        this.checkErrorTip.deep_bid_amount.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.deep_bid_amount.is_show = false;
      }
    }

    // 广告日预算
    if (this.adgroupData.adgroup_budget_mode === 1 && !this.adgroupData.budget) {
      this.checkErrorTip.adgroup_budget.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.adgroup_budget.is_show = false;
    }
    // 投放时段
    if (this.adgroupData.schedule_time_slt === 'schedule_time' && !this.adgroupData.time_series.includes('1')) {
      this.checkErrorTip.time_series.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.time_series.is_show = false;
    }

    // 创意形式
    if (!this.adcreativeData.adcreative_template_id) {
      this.checkErrorTip.adcreative_template_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.adcreative_template_id.is_show = false;
    }


    if (this.adcreativeData.adcreative_template_id && this.isGetElement) {
      // 单计划素材数
      if (!this.materialData.single_adgroup_material_num) {
        this.checkErrorTip.single_adgroup_material_num.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.single_adgroup_material_num.is_show = false;
      }
      // 单计划标题数
      if (!this.materialData.by_material_set_title && !this.materialData.single_adgroup_title_num) {
        this.checkErrorTip.single_adgroup_title_num.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.single_adgroup_title_num.is_show = false;
      }
    }

    // 品牌名称
    if (this.elementNamesList.includes('brand_name') && !this.adcreativeData.adcreative_elements.brand_name) {
      this.checkErrorTip.brand_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.brand_name.is_show = false;
    }
    // 品牌图片
    if (this.elementNamesList.includes('brand_img') && !this.adcreativeData.adcreative_elements.brand_img) {
      this.checkErrorTip.brand_img.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.brand_img.is_show = false;
    }
    // 按钮文字
    if (this.elementNamesList.includes('button_text') && !this.adcreativeData.adcreative_elements.button_text) {
      this.checkErrorTip.button_text.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.button_text.is_show = false;
    }
    // 左下辅助文案
    const bottomTextLength = getStringLength(this.adcreativeData.adcreative_elements.bottom_text, []);
    if (this.elementNamesList.includes('bottom_text') && this.adcreativeData.adcreative_elements.bottom_text && (bottomTextLength < 6 || bottomTextLength > 8)) {
      this.checkErrorTip.bottom_text.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.bottom_text.is_show = false;
    }

    // 标签
    if (this.elementNamesList.includes('label') && this.adcreativeData.adcreative_elements.label.length <= 0) {
      this.checkErrorTip.label.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.label.is_show = false;
    }

    // 流量包定投
    const unionPositionList = [];
    if (this.adgroupData.union_position_package_type === 'custom') {
      for (const item of Object.keys(this.adgroupData.scene_spec.union_position_package)) {
        if (this.adgroupData.scene_spec.union_position_package[item].length <= 0) {
          unionPositionList.push(true);
        }
      }
    }

    if (this.adgroupData.union_position_package_type === 'custom' && unionPositionList.some((item) => item)) {
      this.checkErrorTip.union_position_package.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.union_position_package.is_show = false;
    }
    // 流量包屏蔽
    const excludeUnionPositionList = [];
    if (this.adgroupData.exclude_union_position_package_type === 'custom') {
      for (const item of Object.keys(this.adgroupData.scene_spec.exclude_union_position_package)) {
        if (this.adgroupData.scene_spec.exclude_union_position_package[item].length <= 0) {
          excludeUnionPositionList.push(true);
        }
      }
    }

    if (this.adgroupData.exclude_union_position_package_type === 'custom' && excludeUnionPositionList.some((item) => item)) {
      this.checkErrorTip.exclude_union_position_package.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.exclude_union_position_package.is_show = false;
    }

    // 素材选取
    const materialList = [];
    const materialTitleList = [];
    const titleList = [];
    const descriptionList = [];
    if (this.materialData.by_channel_set_material) {
      for (const item of Object.keys(this.materialData.material_type_lst)) {
        if (item !== 'all') {
          if (this.materialData.by_material_set_title) {
            if (this.materialData.material_type_lst[item].materials.length <= 0) {
              materialTitleList.push(true);
            } else if (this.materialData.material_type_lst[item].materials.length > 0) {
              for (const s_item of this.materialData.material_type_lst[item].materials) {
                if ((this.elementNamesList.includes('title') && s_item.title.length <= 0) || (this.elementNamesList.includes('description') && s_item.description.length <= 0) || (this.elementNamesList.includes('title') && this.elementNamesList.includes('description') && s_item.title.length !== s_item.description.length)) {
                  materialTitleList.push(true);
                }
              }
            }
          } else {
            if (this.materialData.material_type_lst[item].materials.length <= 0) {
              materialList.push(true);
            }

            if ((this.elementNamesList.includes('title') && this.materialData.material_type_lst[item].titles.length <= 0) || (this.elementNamesList.includes('title') && this.elementNamesList.includes('description') && this.materialData.material_type_lst[item].titles.length !== this.materialData.material_type_lst[item].description.length)) {
              titleList.push(true);
            }

            if ((this.elementNamesList.includes('description') && this.materialData.material_type_lst[item].description.length <= 0) || (this.elementNamesList.includes('title') && this.elementNamesList.includes('description') && this.materialData.material_type_lst[item].titles.length !== this.materialData.material_type_lst[item].description.length)) {
              descriptionList.push(true);
            }
          }
        }
      }
    } else {
      if (this.materialData.by_material_set_title) {
        if (this.materialData.material_type_lst['all'].materials.length <= 0) {
          materialTitleList.push(true);
        } else if (this.materialData.material_type_lst['all'].materials.length > 0) {
          for (const s_item of this.materialData.material_type_lst['all'].materials) {
            if ((this.elementNamesList.includes('title') && s_item.title.length <= 0) || (this.elementNamesList.includes('description') && s_item.description.length <= 0) || (this.elementNamesList.includes('title') && this.elementNamesList.includes('description') && s_item.title.length !== s_item.description.length)) {
              materialTitleList.push(true);
            }
          }
        }
      } else {
        if (this.materialData.material_type_lst['all'].materials.length <= 0) {
          materialList.push(true);
        }

        if ((this.elementNamesList.includes('title') && this.materialData.material_type_lst['all'].titles.length <= 0) || (this.elementNamesList.includes('title') && this.elementNamesList.includes('description') && this.materialData.material_type_lst['all'].titles.length !== this.materialData.material_type_lst['all'].description.length)) {
          titleList.push(true);
        }

        if ((this.elementNamesList.includes('description') && this.materialData.material_type_lst['all'].description.length <= 0) || (this.elementNamesList.includes('title') && this.elementNamesList.includes('description') && this.materialData.material_type_lst['all'].titles.length !== this.materialData.material_type_lst['all'].description.length)) {
          descriptionList.push(true);
        }
      }
    }

    if (materialList.some((item) => item)) {
      if (!this.materialData.by_channel_set_material) {
        this.checkErrorTip.material_lst.tip_text = '请选择素材';
      } else {
        this.checkErrorTip.material_lst.tip_text = '请根据渠道号分别选择素材';
      }
      this.checkErrorTip.material_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.material_lst.is_show = false;
    }

    if (titleList.some((item) => item)) {
      if (!this.materialData.by_channel_set_material) {
        this.checkErrorTip.title_lst.tip_text = '请选择短标题，如有长短标题，数量须保持一致';
      } else {
        this.checkErrorTip.title_lst.tip_text = '请根据渠道号分别选择短标题，如有长短标题，数量须保持一致';
      }
      this.checkErrorTip.title_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.title_lst.is_show = false;
    }

    if (descriptionList.some((item) => item)) {
      if (!this.materialData.by_channel_set_material) {
        this.checkErrorTip.description_lst.tip_text = '请选择长标题，如有长短标题，数量须保持一致';
      } else {
        this.checkErrorTip.description_lst.tip_text = '请根据渠分别道号选择长标题，如有长短标题，数量须保持一致';
      }
      this.checkErrorTip.description_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.description_lst.is_show = false;
    }

    if (materialTitleList.some((item) => item)) {
      if (!this.materialData.by_channel_set_material) {
        this.checkErrorTip.material_title_lst.tip_text = '请选择素材，素材下标题不能为空，如有长短标题，数量须保持一致';
      } else {
        this.checkErrorTip.material_title_lst.tip_text = '请根据渠道号选择素材,素材下标题不能为空，如有长短标题，数量须保持一致';
      }
      this.checkErrorTip.material_title_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.material_title_lst.is_show = false;
    }

    if (this.adgroupData.site_set.includes('SITE_SET_MOMENTS')) {
      // 品牌简介
      if (!this.adcreativeData.profile_id) {
        this.checkErrorTip.profile_id.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.profile_id.is_show = false;
      }

      // 辅助转化
      const conversionAssistList = [];
      if (this.materialData.by_channel_set_conversion_assist) {
        for (const item of Object.keys(this.materialData.conversion_assist)) {
          if (item !== 'all') {
            if (this.materialData.conversion_assist[item].link_name_switch) {
              if (!this.materialData.conversion_assist[item].link_name_type) {
                conversionAssistList.push(true);
              }
              if (this.materialData.conversion_assist[item].link_page_type === 'LINK_PAGE_TYPE_DEFAULT' && !this.materialData.conversion_assist[item].link_page_spec.page_url) {
                conversionAssistList.push(true);
              }
              if (this.materialData.conversion_assist[item].link_page_type === 'LINK_PAGE_TYPE_MINI_PROGRAM_WECHAT' && (!this.materialData.conversion_assist[item].link_page_spec.mini_program_id || !this.materialData.conversion_assist[item].link_page_spec.mini_program_path)) {
                conversionAssistList.push(true);
              }
            }
          }
        }
        if (conversionAssistList.some((item) => item)) {
          this.checkErrorTip.conversion_assist_lst.tip_text = "请根据渠道号完善辅助转化配置";
        }
      } else {
        if (this.materialData.conversion_assist['all'].link_name_switch) {
          if (!this.materialData.conversion_assist['all'].link_name_type) {
            conversionAssistList.push(true);
          }
          if (this.materialData.conversion_assist['all'].link_page_type === 'LINK_PAGE_TYPE_DEFAULT' && !this.materialData.conversion_assist['all'].link_page_spec.page_url) {
            conversionAssistList.push(true);
          }

          if (this.materialData.conversion_assist['all'].link_page_type === 'LINK_PAGE_TYPE_MINI_PROGRAM_WECHAT' && (!this.materialData.conversion_assist['all'].link_page_spec.mini_program_id || !this.materialData.conversion_assist['all'].link_page_spec.mini_program_path)) {
            conversionAssistList.push(true);
          }

          if (conversionAssistList.some((item) => item)) {
            this.checkErrorTip.conversion_assist_lst.tip_text = "请完善辅助转化配置";
          }
        }
      }

      if (conversionAssistList.some((item) => item)) {
        this.checkErrorTip.conversion_assist_lst.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.conversion_assist_lst.is_show = false;
      }
    }

    return isValid;
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

  // 获取定向包的错误状态
  getAudienceTemplateIdLstErrorTip() {
    const audienceList = [];
    if (this.adgroupData.audience_by_convert_channel) {
      for (const item of Object.keys(this.adgroupData.audience_template_id_lst)) {
        if (item !== 'all' && this.adgroupData.audience_template_id_lst[item].length <= 0) {
          audienceList.push(true);
        }
      }
      if (audienceList.some((item) => item)) {
        this.checkErrorTip.audience_template_id_lst.is_show = true;
      } else {
        this.checkErrorTip.audience_template_id_lst.is_show = false;
      }
    } else {
      if (this.adgroupData.audience_template_id_lst['all'].length <= 0) {
        this.checkErrorTip.audience_template_id_lst.is_show = true;
      } else {
        this.checkErrorTip.audience_template_id_lst.is_show = false;
      }
    }
  }

}
