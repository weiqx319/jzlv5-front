import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { GlobalTemplateComponent } from "../../../../../../../shared/template/global-template/global-template.component";
import { LaunchService } from "../../../../../../../module/launch/service/launch.service";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzModalService } from "ng-zorro-antd/modal";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { MenuService } from "../../../../../../../core/service/menu.service";
import { deepCopy, isArray, isObject } from "@jzl/jzl-util";
import { differenceInCalendarDays, format } from "date-fns";
import { LaunchMaterialVideoModalComponent } from "../../../../../modal/launch-material-video-modal/launch-material-video-modal.component";
import { LaunchMaterialImageModalComponent } from "../../../../../modal/launch-material-image-modal/launch-material-image-modal.component";
import { LaunchTitleModalComponent } from "../../../../../modal/launch-title-modal/launch-title-modal.component";
import { LaunchMaterialCoverModalComponent } from "../../../../../modal/launch-material-cover-modal/launch-material-cover-modal.component";
import { getStringLength } from "../../../../../../../shared/util/util";

@Component({
  selector: 'app-launch-group-template-qc',
  templateUrl: './launch-group-template-qc.component.html',
  styleUrls: ['./launch-group-template-qc.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LaunchGroupTemplateQcComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  @ViewChild('curCampaignTextArea') curCampaignTextArea: ElementRef;
  @ViewChild('curAdgroupTextArea') curAdgroupTextArea: ElementRef;


  @Output() cancel = new EventEmitter<any>();

  @Input() accountsList;

  @Input() data;

  @Input() isEdit;

  @Input() projectTemplateId;

  @Input() isCopy;
  @Input() basicSettingData;

  public settingDrawerObj = {
    product: false,//商品
    adgroup: false,//广告基础信息
    audience: false,//定向
    creative: false,//创意
    title: false,//文案
    tags: false,//分类标签
  };
  public isSettingDrawerEdit = {
    product: false,//商品
    adgroup: false,//广告基础信息
    audience: false,//定向
    creative: false,//创意
    title: false,//文案
    tags: false,//分类标签
  };
  public isEditAudienceDraw = false;
  public editAudienceId = null;
  public adSettingInfo = [
    { label: '广告主名称', key: 'ad_name', isNeedChange: false, keyMap: {}, add: '', parent: 'adgroup' },
    { label: '投放方式', key: 'smart_bid_type', isNeedChange: true, keyMap: { 'SMART_BID_CUSTOM': '控成本投放', 'SMART_BID_CONSERVATIVE': '放量投放' }, add: '', parent: 'adgroup' },
    { label: '投放速度', key: 'flow_control_mode', isNeedChange: true, keyMap: { 'FLOW_CONTROL_MODE_FAST': '尽快投放', 'FLOW_CONTROL_MODE_SMOOTH': '优先低成本', 'FLOW_CONTROL_MODE_BALANCE': '均匀投放' }, add: '', parent: 'adgroup' },
    { label: '转化目标', key: 'external_action', isNeedChange: true, keyMap: { 'AD_CONVERT_TYPE_SHOPPING': '商品购买', 'AD_CONVERT_TYPE_QC_FOLLOW_ACTION': '粉丝提升', 'AD_CONVERT_TYPE_QC_MUST_BUY': '点赞评论', 'AD_CONVERT_TYPE_LIVE_ENTER_ACTION': '进入直播间', 'AD_CONVERT_TYPE_LIVE_CLICK_PRODUCT_ACTION': '直播间商品点击', 'AD_CONVERT_TYPE_LIVE_SUCCESSORDER_ACTION': '直播间下单', 'AD_CONVERT_TYPE_NEW_FOLLOW_ACTION': '直播间粉丝提升', 'AD_CONVERT_TYPE_LIVE_COMMENT_ACTION': '直播间评论', 'AD_CONVERT_TYPE_LIVE_SUCCESSORDER_PAY': '直播间成交' }, add: '', parent: 'adgroup' },
    { label: '投放日期', key: 'schedule_type', isNeedChange: true, keyMap: { 'SCHEDULE_FROM_NOW': '长期投放', 'SCHEDULE_START_END': '设置开始和结束日期', 'SCHEDULE_TIME_FIXEDRANGE': '固定时长' }, add: '', parent: 'adgroup' },
    { label: '投放时段', key: 'schedule_time_slt', isNeedChange: true, keyMap: { 'nolimt': '不限', 'schedule_time': '指定时段' }, add: '', parent: 'adgroup' },
    { label: '预算', key: 'budget_mode', isNeedChange: true, keyMap: { 'BUDGET_MODE_DAY': '日预算', 'BUDGET_MODE_TOTAL': '总预算' }, add: 'budget', parent: 'adgroup' },
    { label: '出价', key: 'cpa_bid', isNeedChange: false, keyMap: {}, add: '', parent: 'adgroup' },
    { label: '抖音主页视频', key: 'is_homepage_hide', isNeedChange: true, keyMap: { '1': '隐藏', '0': '不隐藏' }, add: '', parent: 'creative' },
    { label: '计划名称', key: 'campaign_name', isNeedChange: false, keyMap: {}, add: '', parent: 'campaign' },
    { label: '计划日预算', key: 'campaign_budget_mode', isNeedChange: true, keyMap: { 'BUDGET_MODE_DAY': '日预算', 'BUDGET_MODE_INFINITE': '不限' }, add: 'campaign_budget', parent: 'campaign' },

  ];
  public targetListMap = {};
  public adgroupNum = 0;
  public awemeMap = {
    'OFFICIAL': '官方',
    'SELF': '自运营',
    'AWEME_COOPERATOR': '合作达人',
  };

  public tagsList = [];
  public tempTitleList = [];
  public materialList = [];
  public curAccountList = [];
  public chanPubId = null;
  public creativeConfigKey = 'STANDARD_VIDEO_PROM_GOODS_CUSTOM_CREATIVE_1';
  public creativeList = [
    {
      length: 7,
      curIndex: 0,
      limit: [
        {
          label: '视频',
          type: 'video',
          css_type: [1, 2],
          list: [],
          min: 1,
          num: 1,
        },
        {
          label: '图片',
          type: 'image',
          css_type: [2, 3, 4],
          list: [],
          min: 0,
          num: 0,
        },
      ]
    }
  ];
  public creativeConfig = {
    STANDARD_VIDEO_PROM_GOODS_CUSTOM_CREATIVE_1: {
      length: 7,
      curIndex: 0,
      limit: [
        {
          label: '视频',
          type: 'video',
          css_type: [1, 2],
          list: [],
          min: 1,
          num: 1,
        },
        {
          label: '图片',
          type: 'image',
          css_type: [2, 3, 4],
          list: [],
          min: 0,
          num: 0,
        },
      ]
    },
    STANDARD_VIDEO_PROM_GOODS_CUSTOM_CREATIVE_0: {
      length: 10,
      curIndex: 0,
      limit: [
        {
          label: '横版视频',
          type: 'video',
          list: [],
          css_type: 1,
          min: 1,
          num: 1,
        },
        {
          label: '竖版视频',
          type: 'video',
          list: [],
          css_type: 2,
          min: 1,
          num: 1,
        },
        {
          label: '横版大图',
          type: 'image',
          list: [],
          css_type: 2,
          min: 1,
          num: 1,
        },
      ]
    },
    STANDARD_VIDEO_PROM_GOODS_PROGRAMMATIC_CREATIVE_1: {
      length: 9,
      curIndex: 0,
      limit: [
        {
          label: '视频',
          type: 'video',
          css_type: [1, 2],
          list: [],
          min: 1,
          num: 1,

        },
        {
          label: '图片',
          type: 'image',
          css_type: [2, 3, 4],
          list: [],
          min: 0,
          num: 0,
        },
      ],
      title: [],
    },
    STANDARD_VIDEO_PROM_GOODS_PROGRAMMATIC_CREATIVE_0: {
      length: 9,
      curIndex: 0,
      limit: [
        {
          label: '横版视频',
          type: 'video',
          list: [],
          css_type: 1,
          min: 1,
          num: 1,
        },
        {
          label: '竖版视频',
          type: 'video',
          list: [],
          css_type: 2,
          min: 1,
          num: 1,
        },
        {
          label: '横版大图',
          type: 'image',
          list: [],
          css_type: 2,
          min: 1,
          num: 1,
        },
      ],
      title: [],
    },
    STANDARD_LIVE_PROM_GOODS_CUSTOM_CREATIVE_0: {
      length: 10,
      curIndex: 0,
      limit: [
        {
          label: '视频',
          type: 'video',
          css_type: [1, 2],
          list: [],
          min: 1,
          num: 1,
        }
      ]
    },
    STANDARD_LIVE_PROM_GOODS_PROGRAMMATIC_CREATIVE_0: {
      length: 9,
      curIndex: 0,
      limit: [
        {
          label: '视频',
          type: 'video',
          css_type: [1, 2],
          list: [],
          min: 1,
          num: 1,
        }
      ],
      title: [],
    },
    STANDARD_LIVE_PROM_GOODS_CUSTOM_CREATIVE_1: {
      length: 10,
      curIndex: 0,
      limit: [
        {
          label: '视频',
          type: 'video',
          css_type: [1, 2],
          list: [],
          min: 1,
          num: 1,
        }
      ]
    },
    STANDARD_LIVE_PROM_GOODS_PROGRAMMATIC_CREATIVE_1: {
      length: 9,
      curIndex: 0,
      limit: [
        {
          label: '视频',
          type: 'video',
          css_type: [1, 2],
          list: [],
          min: 1,
          num: 1,
        }
      ],
      title: [],
    },
    SIMPLE_VIDEO_PROM_GOODS_CUSTOM_CREATIVE_1: {
      length: 7,
      curIndex: 0,
      limit: [
        {
          label: '视频',
          type: 'video',
          css_type: [1, 2],
          list: [],
          min: 1,
          num: 1,
        }
      ]
    },
    SIMPLE_VIDEO_PROM_GOODS_CUSTOM_CREATIVE_0: {
      length: 10,
      curIndex: 0,
      limit: [
        {
          label: '视频',
          type: 'video',
          css_type: [1, 2],
          list: [],
          min: 1,
          num: 1,
        }
      ]
    },
    SIMPLE_LIVE_PROM_GOODS_CUSTOM_CREATIVE_1: {
      length: 10,
      curIndex: 0,
      limit: [
        {
          label: '视频',
          type: 'video',
          css_type: [1, 2],
          list: [],
          min: 1,
          num: 1,
        }
      ]
    },
    SIMPLE_LIVE_PROM_GOODS_CUSTOM_CREATIVE_0: {
      length: 10,
      curIndex: 0,
      limit: [
        {
          label: '视频',
          type: 'video',
          css_type: [1, 2],
          list: [],
          min: 1,
          num: 1,
        }
      ]
    },
  };

  public tableHeight = document.body.clientHeight - 60;
  public tableWidth = document.body.clientWidth - 150 - 130;

  public loading = false;
  public total = 0;
  public currentPage = 1;
  public pageSize = 500;

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
  };

  public basicTargetList = [];

  public curBasicTarget = [];

  public targetChannelList = [];
  public accountChannelList = [];

  public launchTargetPackage = [];

  public _allChecked = false;

  public _indeterminate = false; // 表示有选中的，不管是全选还是选个别

  public chan_pub_ids = [];
  public searchProductName = '';
  public searchAudienceName = '';
  public awemeList = [];
  public curChannelList = [];

  public channelTreeList = [];

  public resultList = [];

  public curTargetList = [];   // 当前渠道下投放包列表

  public curAccountIndex = 0;
  public curDeliveryIndex = 0;

  public curTargetIndex = 0;
  public settingLoad = true;

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
    product_id: {
      is_show: false,
      tip_text: '商品不能为空',
    },
    aweme_id: {
      is_show: false,
      tip_text: '抖音号不能为空',
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
    budget: {
      is_show: false,
      tip_text: '请输入正确的取值范围',
    },
    cpa_bid: {
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
    material_lst: {
      is_show: false,
      tip_text: '请选择素材',
    },
    title_lst: {
      is_show: false,
      tip_text: '请选择标题',
    },
    action_button: {
      is_show: false,
      tip_text: '行动号召不能为空'
    },
    material_title_lst: {
      is_show: false,
      tip_text: '按素材选择标题，素材以及素材下标题不能为空且标题长度不超过限制'
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

  public cardLoading = false;

  public popconObj = {
    marketing_goal: "VIDEO_PROM_GOODS",  // 营销目标
    promotion_way: "STANDARD",  // 推广方式
    creative_material_mode: "CUSTOM_CREATIVE",   // 创意方式
    creative_auto_generate: '1',
  };
  public categoryList = [];

  public deepChecked = false;
  public resultData = {
    project_id: "",
    chan_pub_id_lst: [],  // 账户
    project_template_name: "",  // 模板名称
    convert_channel_id_lst: [],

    template_struct: {
      campaign: {
        marketing_goal: "VIDEO_PROM_GOODS",  // 营销目标
        promotion_way: "STANDARD",  // 推广方式
        campaign_name: "",   // 广告组名称
        campaign_select: "create",  // 广告组选择  exist 已有  create 新建
        campaign_budget_mode: "BUDGET_MODE_INFINITE",   // nolimt 不限  budget 日预算
        campaign_budget: 0,  // 预算
        is_set_adgroup_limit_num: '0',  // 设置计划上限
        campaign_max_adgroup_num: 1,   // 广告组计划上限
      },
      adgroup: {
        ad_name: "",    // 计划名称
        external_action: 'AD_CONVERT_TYPE_SHOPPING',
        deep_external_action: null,
        product_info: [],
        product_aweme_id_lst: {},

        // 定向
        aweme_id: null,
        parent_audience_template_id: null,  // 基础定向
        audience_by_convert_channel: false,  // 是否分渠道号
        audience_template_id_lst: {     // 定向包列表
          all: [],
        },
        // 预算与出价
        smart_bid_type: 'SMART_BID_CUSTOM',  // 投放场景
        flow_control_mode: 'FLOW_CONTROL_MODE_FAST',  // 竞价策略
        budget: 0,  // 预算
        budget_mode: 'BUDGET_MODE_DAY',
        cpa_bid: 0,  //  出价
        adjust_cpa: 0,  // 调整自动出价
        schedule_type: 'SCHEDULE_FROM_NOW', // 投放时间
        time_range: [new Date(), new Date()], // 起始时间
        schedule_fixed_range: 2,
        schedule_time_slt: 'nolimt', // 投放时段选择
        schedule_time: 0, // 投放时段
      },
      creative: {
        creative_material_mode: "CUSTOM_CREATIVE",   // 创意方式
        creative_auto_generate: '1',
        image_mode: 'VIDEO',  // 创意类型(自定义)
        bind_type: [],
        // 素材选取
        // 标题选取
        industry_keywords_lst: [],
        third_industry_ids: [], // 创意分类
        third_industry_id_list: [],
        ad_keywords: [], // 创意标签
        action_button: null, // 行动号召,
        creative_display_mode: 'CREATIVE_DISPLAY_MODE_CTR', // 创意展现方式
        is_presented_video: false, // 自动生成视频素材
        is_homepage_hide: 1,
        is_use_aweme_live_room: 0,
      },
      material: {
        by_channel_set_material: false,   // 分渠道号选择素材
        by_material_set_title: false,   // 分素材选择标题
        by_creative_group_set_title: false,
        screenshot_setting_type: "system",
        material_type_temp: {
          length: 7,
          curIndex: 0,
          limit: [
            {
              label: '视频',
              type: 'video',
              css_type: [1, 2],
              list: [],
              min: 1,
              num: 1,
            },
            {
              label: '图片',
              type: 'image',
              css_type: [2, 3, 4],
              list: [],
              min: 0,
              num: 0,
            },
          ]
        },
        material_type_lst: {
          all: { materials: [], titles: [] },
        }
      },
      promotion_card: {
        isOpenCard: true,
        card_by_convert_channel: false,  // 分渠道号选择卡片模板
        card_type_lst: {},
        use_auto_create_product_image: '1',
      }
    }
  };
  public defaultData = {
    project_id: "",
    chan_pub_id_lst: [],  // 账户
    project_template_name: "",  // 模板名称
    convert_channel_id_lst: [],

    template_struct: {
      campaign: {
        marketing_goal: "VIDEO_PROM_GOODS",  // 营销目标
        promotion_way: "STANDARD",  // 推广方式
        campaign_name: "",   // 广告组名称
        campaign_select: "create",  // 广告组选择  exist 已有  create 新建
        campaign_budget_mode: "BUDGET_MODE_INFINITE",   // nolimt 不限  budget 日预算
        campaign_budget: 0,  // 预算
        is_set_adgroup_limit_num: '0',  // 设置计划上限
        campaign_max_adgroup_num: 1,   // 广告组计划上限
      },
      adgroup: {
        ad_name: "",    // 计划名称
        external_action: 'AD_CONVERT_TYPE_SHOPPING',
        deep_external_action: null,
        product_info: [],
        product_aweme_id_lst: {},

        // 定向
        aweme_id: null,
        parent_audience_template_id: null,  // 基础定向
        audience_by_convert_channel: false,  // 是否分渠道号
        audience_template_id_lst: {     // 定向包列表
          all: [],
        },
        // 预算与出价
        smart_bid_type: 'SMART_BID_CUSTOM',  // 投放场景
        flow_control_mode: 'FLOW_CONTROL_MODE_FAST',  // 竞价策略
        budget: 0,  // 预算
        budget_mode: 'BUDGET_MODE_DAY',
        cpa_bid: 0,  //  出价
        adjust_cpa: 0,  // 调整自动出价
        schedule_type: 'SCHEDULE_FROM_NOW', // 投放时间
        time_range: [new Date(), new Date()], // 起始时间
        schedule_fixed_range: 2,
        schedule_time_slt: 'nolimt', // 投放时段选择
        schedule_time: 0, // 投放时段
      },
      creative: {
        creative_material_mode: "CUSTOM_CREATIVE",   // 创意方式
        creative_auto_generate: '1',
        image_mode: 'VIDEO',  // 创意类型(自定义)
        bind_type: [],
        // 素材选取
        // 标题选取
        industry_keywords_lst: [],
        third_industry_ids: [], // 创意分类
        third_industry_id_list: [],
        ad_keywords: [], // 创意标签
        action_button: null, // 行动号召,
        creative_display_mode: 'CREATIVE_DISPLAY_MODE_CTR', // 创意展现方式
        is_presented_video: false, // 自动生成视频素材
        is_homepage_hide: 1,
        is_use_aweme_live_room: 0,
      },
      material: {
        by_channel_set_material: false,   // 分渠道号选择素材
        by_material_set_title: false,   // 分素材选择标题
        by_creative_group_set_title: false,
        screenshot_setting_type: "system",
        material_type_temp: {
          length: 7,
          curIndex: 0,
          limit: [
            {
              label: '视频',
              type: 'video',
              css_type: [1, 2],
              list: [],
              min: 1,
              num: 1,
            },
            {
              label: '图片',
              type: 'image',
              css_type: [2, 3, 4],
              list: [],
              min: 0,
              num: 0,
            },
          ]
        },
        material_type_lst: {
          all: { materials: [], titles: [] },
        }
      },
      promotion_card: {
        isOpenCard: true,
        card_by_convert_channel: false,  // 分渠道号选择卡片模板
        card_type_lst: {},
        use_auto_create_product_image: '1',
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
      preview_img: "",
    }
  };

  public wordList = ['日期', '年龄', '标题'];

  public cursorPosition = 0;

  public publisherId;

  public campaignWordList = [];

  public adgroupWordList = [];
  public isShowCardSetting = true;

  constructor(
    private launchService: LaunchService,
    private authService: AuthService,
    private message: NzMessageService,
    private modalService: NzModalService,
    public launchRpaService: LaunchRpaService,
    private menuService: MenuService,
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
    if (this.basicSettingData) {
      this.defaultData.template_struct.campaign.marketing_goal = this.basicSettingData['marketing_goal'];
      this.defaultData.template_struct.campaign.promotion_way = this.basicSettingData['promotion_way'];
      this.changeMarketingGoal(this.defaultData.template_struct.campaign.marketing_goal = this.basicSettingData['marketing_goal']);
      this.changeLandType(this.defaultData.template_struct.campaign.promotion_way = this.basicSettingData['promotion_way']);
      this.getCreativeConfigKey();
    }
    this.cardLoading = false;
    this.accountsList.forEach(item => {
      this.chan_pub_ids.push(item.chan_pub_id);
    });
    if (this.isEdit && this.projectTemplateId) {
      this.getProjectTemplate();
    } else {
      this.defaultData.template_struct.promotion_card.card_type_lst['all'] = deepCopy(this.promotion_card);
      this.resultData = deepCopy(this.defaultData);
      this.cardLoading = true;
      // this.defaultData.template_struct.creative.third_industry_id_list = this.data['third_industry_ids'];
    }
    this.checkErrorTip.card_error_tip['all'] = deepCopy(this.cardCheckErrorTip);
    this.getFeedStructConfig();
    this.getChildTargetList();
    this.getCardTemplateList();
    this.getLaunchRpaWordList();
    this.getFeedConfigCreativeCategory();
    if (this.callActionList[this.defaultData.template_struct.campaign.promotion_way] && !this.defaultData.template_struct.creative.action_button) {
      this.defaultData.template_struct.creative.action_button = this.callActionList[this.defaultData.template_struct.campaign.promotion_way][0]['key'];
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
  getFeedStructConfig() {
    this.launchRpaService
      .getStructConfigByQC({
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
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

  // 投放包列表
  getChildTargetList() {
    const body = {
      cid: this.cid,
      "pConditions": [
        {
          "key": "audience_template_name",
          "name": "",
          "op": "like",
          "value": this.searchAudienceName
        }],
    };
    this.launchRpaService
      .getTargetListQC(body, { result_model: 'all', })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.launchTargetPackage = [];
            this.curTargetList = [];
            this.targetListMap = {};
          } else {
            this.launchTargetPackage = results['data'];
            this.launchTargetPackage.forEach(item => {
              item.checked = false;
              this.targetListMap[item.audience_template_id] = item.audience_template_name;
            });
            if (this.defaultData.template_struct.campaign.promotion_way === 'SIMPLE') {
              this.curTargetList = deepCopy(this.launchTargetPackage.filter(item => item.promotion_way === 'SIMPLE'));
            } else {
              this.curTargetList = deepCopy(this.launchTargetPackage.filter(item => item.promotion_way === 'STANDARD'));
            }
            // this.curTargetList = deepCopy(this.launchTargetPackage);
            if (this.isEdit || this.defaultData.template_struct.adgroup.audience_template_id_lst['all'].length) {
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
  // 获取创意分类
  getFeedConfigCreativeCategory() {
    this.launchRpaService.getThirdIndustryListQC()
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            this.categoryList = results['data'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }
  //抖音号
  getAwemeList(data) {
    this.launchRpaService.getQCAwemeList({
      chan_pub_id: data.chan_pub_id,
    }).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          results['data'].forEach(item => {
            item.name = item.aweme_name + '-' + this.awemeMap[JSON.parse(item.bind_type)[0]];
          });
          data.awemeList = deepCopy(results['data']);
          if (data.awemeList.length > 0) {
            this.defaultData.template_struct.adgroup.product_aweme_id_lst[data.chan_pub_id]['aweme_id'] = data.awemeList[0]['aweme_id'];
            this.defaultData.template_struct.creative.bind_type = JSON.parse(data.awemeList[0]['bind_type']);
            if (this.defaultData.template_struct.creative.bind_type.indexOf('OFFICIAL') === -1 && this.defaultData.template_struct.creative.bind_type.indexOf('SELF') === -1) {
              this.defaultData.template_struct.creative.creative_material_mode = 'CUSTOM_CREATIVE';
              this.defaultData.template_struct.creative.is_homepage_hide = 0;
              this.popconObj.creative_auto_generate = '0';
              this.defaultData.template_struct.creative.creative_auto_generate = '0';
              this.defaultData.template_struct.material.material_type_temp.length = 10;
            } else {
              this.popconObj.creative_auto_generate = '1';
              this.defaultData.template_struct.creative.creative_auto_generate = '1';
              this.defaultData.template_struct.material.material_type_temp.length = 7;
            }
            this.resultData = deepCopy(this.defaultData);
          }
        } else if (results.status_code === 205) {
          data.awemeList = [];
        }
      },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );
  }
  // 获取渠道列表
  getChannelList(data, status?) {
    if (status) {
      this.currentPage = 1;
    }
    this.isChannelTree = false;
    const body = {
      chan_pub_id: data.chan_pub_id,
      "pConditions": [
        {
          "key": "product_name",
          "name": "",
          "op": "like",
          "value": this.searchProductName
        }],
    };
    this.launchRpaService.getQCProductList(body, {
      chan_pub_id: data.chan_pub_id,
      page: this.currentPage,
      count: this.pageSize,
    }).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          data.productList = deepCopy(results['data']['detail']);
          this.total = results['data']['detail_count'];
          if ((this.isEdit || this.isCopy) && this.projectTemplateId) {
            data.productList.forEach(product => {
              if (this.defaultData.template_struct.adgroup.product_aweme_id_lst[data.chan_pub_id]['product_id'].find(item => item === product.product_id)) {
                product.checked = true;
              }
            });
          }
        } else if (results.status_code === 205) {
          data.productList = [];
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
    this.resultData = deepCopy(this.defaultData);
    Object.keys(this.isSettingDrawerEdit).forEach(key => {
      this.isSettingDrawerEdit[key] = true;
    });
    this.getAdgroupNum();
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
      this.defaultData.template_struct.adgroup.audience_template_id_lst[this.defaultData.template_struct.adgroup.product_info[this.curTargetIndex].product_id] = [];
      this.curTargetList.forEach(item => {
        if (item.checked) {
          this.defaultData.template_struct.adgroup.audience_template_id_lst[this.defaultData.template_struct.adgroup.product_info[this.curTargetIndex].product_id].push(item.audience_template_id);
        }
      });
    } else {
      this.defaultData.template_struct.adgroup.audience_template_id_lst['all'] = [];
      this.curTargetList.forEach(item => {
        if (item.checked) {
          this.defaultData.template_struct.adgroup.audience_template_id_lst['all'].push(item.audience_template_id);
        }
      });
      this.getItemErrorTip('audience_template_id_lst', this.defaultData.template_struct.adgroup.audience_template_id_lst['all']);
    }
  }

  changeBasicAudience(id) {
    this.getItemErrorTip('parent_audience_template_id', this.defaultData.template_struct.adgroup.parent_audience_template_id);
  }

  changeTargetChannel(value) {
    this.curTargetIndex = 0;
    if (this.defaultData.template_struct.campaign.promotion_way === 'SIMPLE') {
      this.curTargetList = deepCopy(this.launchTargetPackage.filter(item => item.promotion_way === 'SIMPLE'));
    } else {
      this.curTargetList = deepCopy(this.launchTargetPackage.filter(item => item.promotion_way === 'STANDARD'));
    }
    for (const item of Object.keys(this.defaultData.template_struct.adgroup.audience_template_id_lst)) {
      this.defaultData.template_struct.adgroup.audience_template_id_lst[item] = [];
    }
    if (this.curTargetList.length > 0) {
      const allUnchecked = this.curTargetList.some((item) => !item.checked);
      this._allChecked = !allUnchecked;
    }
  }

  getDisableDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.today) < 0;
  }

  dateDate(event) { //从日期组件中得到的日期数据
    this.defaultData.template_struct.adgroup.schedule_time = event.dateData;
  }

  AddTags(source) {
    let dataValid = true;
    const inputValueAry = source.inputValue.split(/\s+/g); // 根据换行或者回车进行识别

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

    if ((source.ad_keywords.length + inputValueAry.length) > 20) {
      this.message.error('最多20个标签');
      return false;
    }

    inputValueAry.forEach(item => {
      if (item.length && source.ad_keywords.indexOf(item) === -1) {
        source.ad_keywords.push(item);
      }
    });
    source.inputValue = '';
    // this.getItemErrorTip('ad_keywords',this.defaultData.template_struct.creative.ad_keywords);
  }

  deleteTag(source, index) {
    source.ad_keywords.splice(index, 1);
  }

  clearTags(source) {
    source.ad_keywords = [];
  }


  // 打开素材库
  openMaterials(data: any[], cssType) {
    // if (cssType != 3) {
    //   this.addImageMaterials(data, cssType);
    // } else {
    //   this.addMaterials(data);
    // }
  }
  // 打开素材库
  addCreative(data, tempData) {
    if (data.type === 'image') {
      this.addImageMaterials(data.list, tempData);
    } else {
      this.addMaterials(data.list, tempData);
    }
  }

  addMaterials(data: any[], source) {
    const add_modal = this.modalService.create({
      nzTitle: '视频素材库',
      nzWidth: 1300,
      nzContent: LaunchMaterialVideoModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data,
        cssType: source.css_type,
        maxSelect: source.num
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
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
  addImageMaterials(data: any[], source) {
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
        cssType: source.css_type,
        maxSelect: source.num || null
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
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
  addLaunchTitle(data: any[], maxNum?) {
    const add_modal = this.modalService.create({
      nzTitle: '选择标题库',
      nzWidth: 1300,
      nzContent: LaunchTitleModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data,
        maxSelect: maxNum || null
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        data.splice(0, data.length, ...result['data']);
        this.getMaterialErrorTip();
        if (this.settingDrawerObj.title) {
          this.isSettingDrawerEdit.title = true;
          this.saveSingleEdit('title');
        }
      }
    });
  }

  changeMarketingGoal(value) {
    this.defaultData.template_struct.adgroup.external_action = value === 'VIDEO_PROM_GOODS' ? 'AD_CONVERT_TYPE_SHOPPING' : 'AD_CONVERT_TYPE_LIVE_ENTER_ACTION';
    if (this.defaultData.template_struct.campaign.promotion_way === 'SIMPLE') {
      if (value === 'LIVE_PROM_GOODS') {
        this.defaultData.template_struct.adgroup.budget_mode = value === 'VIDEO_PROM_GOODS' ? 'BUDGET_MODE_DAY' : 'BUDGET_MODE_TOTAL';
      }
      this.defaultData.template_struct.adgroup.schedule_type = value === 'VIDEO_PROM_GOODS' ? 'SCHEDULE_FROM_NOW' : 'SCHEDULE_TIME_FIXEDRANGE';
    }
  }

  changeLandType(value) {
    if (value === 'SIMPLE') {
      this.defaultData.template_struct.adgroup.flow_control_mode = 'FLOW_CONTROL_MODE_FAST';
      this.defaultData.template_struct.creative.creative_material_mode = 'CUSTOM_CREATIVE';
      this.popconObj.creative_material_mode = 'CUSTOM_CREATIVE';
      if (this.defaultData.template_struct.creative.bind_type.indexOf('OFFICIAL') === -1 && this.defaultData.template_struct.creative.bind_type.indexOf('SELF') === -1) {
        this.popconObj.creative_auto_generate = '0';
        this.defaultData.template_struct.creative.creative_auto_generate = '0';
      } else {
        this.popconObj.creative_auto_generate = '1';
        this.defaultData.template_struct.creative.creative_auto_generate = '1';
      }
      this.defaultData.template_struct.promotion_card.isOpenCard = false;
    } else {
      this.defaultData.template_struct.promotion_card.isOpenCard = true;
    }
  }

  transferTreeChange(data) {
    this.defaultData.convert_channel_id_lst = data;

    if (data.length === 0) {
      this.defaultData.template_struct.adgroup.audience_by_convert_channel = false;
      this.defaultData.template_struct.promotion_card.card_by_convert_channel = false;
      this.targetChannelList = [];
      return;
    }
    data.forEach(channelId => {
      const channelData = this.curChannelList.find(item => item.product_id === channelId);
      if (!this.targetChannelList.find(s_item => s_item.product_id === channelId)) {
        this.targetChannelList.push(channelData);
      }
    });
    this.targetChannelList.forEach((item, index) => {
      if (!this.defaultData.template_struct.adgroup.audience_template_id_lst[item.product_id]) {
        this.defaultData.template_struct.adgroup.audience_template_id_lst[item.product_id] = [];
      }
      if (!this.defaultData.template_struct.material.material_type_lst[item.product_id]) {
        this.defaultData.template_struct.material.material_type_lst[item.product_id] = {
          materials: [],
          titles: []
        };
      }
      if (!this.defaultData.template_struct.promotion_card.card_type_lst[item.product_id]) {
        this.defaultData.template_struct.promotion_card.card_type_lst[item.product_id] = deepCopy(this.promotion_card);
      }

      if (!this.checkErrorTip.card_error_tip[item.product_id]) {
        this.checkErrorTip.card_error_tip[item.product_id] = deepCopy(this.cardCheckErrorTip);
      }

      const curChannelData = data.find(value => value === item.product_id);

      if (!curChannelData) {
        delete this.defaultData.template_struct.adgroup.audience_template_id_lst[item.product_id];
        delete this.defaultData.template_struct.material.material_type_lst[item.product_id];
        delete this.defaultData.template_struct.promotion_card.card_type_lst[item.product_id];
        delete this.checkErrorTip.card_error_tip[item.product_id];
        this.targetChannelList.splice(index, 1);
      }
    });
    this.changeTargetTab(this.curTargetIndex);
    this.getCheckData();
  }

  changeTargetTab(value) {
    this.curTargetIndex = value;
    if (this.defaultData.template_struct.campaign.promotion_way === 'SIMPLE') {
      this.curTargetList = deepCopy(this.launchTargetPackage.filter(item => item.promotion_way === 'SIMPLE'));
    } else {
      this.curTargetList = deepCopy(this.launchTargetPackage.filter(item => item.promotion_way === 'STANDARD'));
    }
    if (this.defaultData.template_struct.adgroup.product_info[value]) {
      this.defaultData.template_struct.adgroup.audience_template_id_lst[this.defaultData.template_struct.adgroup.product_info[value]['product_id']].forEach(item => {
        const data = this.curTargetList.find(s_item => s_item.audience_template_id == item);
        if (data) {
          data.checked = true;
        }
      });

    }
    if (this.curTargetList.length > 0) {
      const allUnchecked = this.curTargetList.some((item) => !item.checked);
      this._allChecked = !allUnchecked;
    }
  }

  clearAllSelected(data: any[], type) {
    data.splice(0, data.length);
    this.getMaterialErrorTip();
  }

  clearSingleSelected(data, index: number, type) {
    data.splice(index, 1);
    this.getMaterialErrorTip();
  }

  doSave() {

    const isAllEdit = Object.keys(this.isSettingDrawerEdit).every(item => this.isSettingDrawerEdit[item] || (item === 'title' && (this.defaultData.template_struct.material.by_material_set_title || this.defaultData.template_struct.material.by_creative_group_set_title)) || (item === 'tags' && this.defaultData.template_struct.campaign.promotion_way === 'SIMPLE'));
    if (!isAllEdit) {
      this.message.error('请完善基本信息！');
      return;
    }

    const isValid = this.checkBasicData();

    if (isValid) {
      this.message.error('请完善基本信息！');
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
    this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [], titles: [] };
    this.defaultData.template_struct.adgroup.product_info.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.product_id] = { materials: [], titles: [] };
    });
  }

  changeTitleByChannel(value, type) {
    if (type === 'group') {
      this.defaultData.template_struct.material.by_material_set_title = false;
    } else if (type === 'material') {
      this.defaultData.template_struct.material.by_creative_group_set_title = false;
    }
    this.defaultData.template_struct.material.material_type_lst['all']['titles'] = [];
    this.defaultData.template_struct.material.material_type_lst['all']['materials'].forEach(s_item => s_item.title = []);
    this.defaultData.template_struct.adgroup.product_info.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.product_id]['titles'] = [];
      this.defaultData.template_struct.material.material_type_lst[item.product_id]['materials'].forEach(s_item => s_item.title = []);
    });
  }

  changeCreativeType(value) {
    this.defaultData.template_struct.creative.creative_material_mode = value;
    this.defaultData.template_struct.material.by_creative_group_set_title = false;
    if (value === 'PROGRAMMATIC_CREATIVE') {
      this.defaultData.template_struct.material.by_material_set_title = false;
    }
    this.getCreativeConfigKey();
  }
  changeCreativeAutoType(value) {
    this.defaultData.template_struct.creative.creative_auto_generate = value;
    this.getCreativeConfigKey();
  }

  changeAdjustCpa() {
    this.defaultData.template_struct.adgroup.cpa_bid = null;
  }

  getProjectTemplate() {
    this.launchRpaService.getProjectTemplateDetail(this.projectTemplateId, { cid: this.cid })

      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.defaultData = deepCopy(results['data']);
            this.chanPubId = this.defaultData.chan_pub_id_lst[0] || null;
            this.defaultData.template_struct.creative.bind_type = this.defaultData.template_struct.creative.bind_type || [];
            this.defaultData.template_struct.promotion_card.use_auto_create_product_image = this.defaultData.template_struct.promotion_card.use_auto_create_product_image || '0';
            this.defaultData.template_struct.creative.is_use_aweme_live_room = this.defaultData.template_struct.creative.is_use_aweme_live_room || 0;
            this.defaultData.template_struct.material.by_creative_group_set_title = this.defaultData.template_struct.material.by_creative_group_set_title || false;
            this.defaultData.template_struct.creative.industry_keywords_lst = this.defaultData.template_struct.creative.industry_keywords_lst || [];
            this.cardLoading = true;
            this.popconObj.creative_auto_generate = this.defaultData.template_struct.creative.creative_auto_generate;
            this.popconObj.creative_material_mode = this.defaultData.template_struct.creative.creative_material_mode;
            this.popconObj.promotion_way = this.defaultData.template_struct.campaign.promotion_way;
            this.popconObj.marketing_goal = this.defaultData.template_struct.campaign.marketing_goal;
            if (this.defaultData.template_struct.adgroup.product_info.length > 0) {
              this.searchProductName = this.defaultData.template_struct.adgroup.product_info[0]['product_name'];
            }
            if (this.isCopy) {
              this.defaultData.project_template_name = this.defaultData.project_template_name + '-复制';
            }
            this.defaultData.chan_pub_id_lst.forEach(id => {
              const data = this.accountsList.find(item => id == item.chan_pub_id);
              if (data) {
                this.curAccountList.push({
                  chan_pub_id: data.chan_pub_id,
                  pub_account_name: data.pub_account_name,
                  productList: [],
                  awemeList: []
                });
              }
            });
            this.curAccountList.forEach(data => {
              this.getChannelList(data);
              this.getAwemeList(data);
            });
            this.initEditData();
            // this.getCreativeConfigKey();
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
    // this.defaultData.template_struct.material.screenshot_setting_type = 'system';
    // this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [], titles: [] };
    // if (value == 1) {
    //   // this.defaultData.template_struct.promotion_card.isOpenCard = false;
    //   this.defaultData.template_struct.promotion_card.card_by_convert_channel = false;
    //   this.defaultData.template_struct.promotion_card.card_type_lst = {};
    // }
    // this.targetChannelList.forEach(item => {
    //   this.defaultData.template_struct.material.material_type_lst[item.product_id] = {
    //     materials: [],
    //     titles: []
    //   };
    // });
  }

  doCancel() {
    this.cancel.emit();
  }
  changeSmartBidType(value) {
    this.defaultData.template_struct.adgroup.schedule_type = "SCHEDULE_FROM_NOW";
    this.defaultData.template_struct.adgroup.flow_control_mode = 'FLOW_CONTROL_MODE_FAST';
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
      if (this.defaultData.template_struct.adgroup.product_info.length > 0) {
        this.defaultData.template_struct.promotion_card.card_type_lst['all']['promo_card_setting']['preview_img'] = this.defaultData.template_struct.adgroup.product_info[0]['product_img'];
      }
    } else {
      this.defaultData.template_struct.promotion_card.card_type_lst = {};
    }
  }

  changeChannelSetCard(value) {
    this.cardLoading = false;
    this.defaultData.template_struct.promotion_card.card_type_lst['all'] = deepCopy(this.promotion_card);
    this.defaultData.template_struct.adgroup.product_info.forEach(item => {
      this.defaultData.template_struct.promotion_card.card_type_lst[item.product_id] = deepCopy(this.promotion_card);
    });
    setTimeout(() => {
      this.cardLoading = true;
    });
  }

  changeCardTab(value) {
    this.cardLoading = false;
    this.isShowCardSetting = true;
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
        delete this.defaultData.template_struct.material.material_type_lst[item.product_id]['materials']['screenshot_setting'];
      });
    } else {
      this.defaultData.template_struct.material.material_type_lst['all']['materials']['screenshot_setting'] = {};
      this.targetChannelList.forEach(item => {
        this.defaultData.template_struct.material.material_type_lst[item.product_id]['materials']['screenshot_setting'] = {};
      });
    }
  }

  changeAccount(type) {
    if (!type && this.resultData.chan_pub_id_lst[0] !== this.chanPubId) {
      this.curAccountList = [];
      this.resultData.chan_pub_id_lst[0] = this.chanPubId;
      this.resultData.template_struct.adgroup.product_aweme_id_lst = {};
      this.resultData.chan_pub_id_lst.forEach(id => {
        const data = this.accountsList.find(item => item.chan_pub_id == this.resultData.chan_pub_id_lst[0]);
        if (data) {
          this.resultData.template_struct.adgroup.product_aweme_id_lst[id] = {
            aweme_id: null,
            product_id: [],
          };
          this.curAccountList.push({
            chan_pub_id: data.chan_pub_id,
            pub_account_name: data.pub_account_name,
            productList: [],
            awemeList: []
          });
        }
      });
      this.resultData.template_struct.adgroup.product_info = [];
      this.searchProductName = '';
      this.defaultData = deepCopy(this.resultData);
      this.curAccountList.forEach(data => {
        this.getChannelList(data);
        this.getAwemeList(data);
      });
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
      const data = this.targetChannelList.find(item => item.product_id === channleItem.product_id);
      if (data) {
        saveData.push(data);
      }
    });
    this.targetChannelList = saveData;
    this.defaultData.convert_channel_id_lst = this.targetChannelList.map(item => {
      return item.product_id;
    });
    if (!this.targetChannelList.length) {
      this.defaultData.template_struct.adgroup.audience_by_convert_channel = false;
      this.defaultData.template_struct.promotion_card.card_by_convert_channel = false;
      this.defaultData.template_struct.material.by_channel_set_material = false;
    }

    for (const item of Object.keys(this.defaultData.template_struct.adgroup.audience_template_id_lst)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.product_id == item)) {
        delete this.defaultData.template_struct.adgroup.audience_template_id_lst[item];
      }
    }

    for (const item of Object.keys(this.defaultData.template_struct.material.material_type_lst)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.product_id == item)) {
        delete this.defaultData.template_struct.material.material_type_lst[item];
      }
    }

    for (const item of Object.keys(this.defaultData.template_struct.promotion_card.card_type_lst)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.product_id == item)) {
        delete this.defaultData.template_struct.promotion_card.card_type_lst[item];
      }
    }

    for (const item of Object.keys(this.checkErrorTip.card_error_tip)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.product_id == item)) {
        delete this.checkErrorTip.card_error_tip[item];
      }
    }
  }

  checkBasicData(type?) {
    let isValid = false;
    this.checkErrorTip.card_error_tip.has_error = false;
    const { template_struct } = this.defaultData;
    if (!type || type === 'basic' || type === 'product') {
      // 账户
      if (this.defaultData.chan_pub_id_lst.length <= 0) {
        this.checkErrorTip.chan_pub_id_lst.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.chan_pub_id_lst.is_show = false;
      }
      // 抖音号
      let productVaild = true;
      let awemeVaild = true;
      Object.keys(this.defaultData.template_struct.adgroup.product_aweme_id_lst).forEach(item => {
        if (!this.defaultData.template_struct.adgroup.product_aweme_id_lst[item].aweme_id) {
          awemeVaild = false;
        }
        if (this.defaultData.template_struct.campaign.marketing_goal === 'VIDEO_PROM_GOODS') {
          if (!this.defaultData.template_struct.adgroup.product_aweme_id_lst[item].product_id.length) {
            productVaild = false;
          }
        }
      });
      if (!productVaild) {
        isValid = true;
        this.checkErrorTip.product_id.is_show = true;
      } else {
        this.checkErrorTip.product_id.is_show = false;
      }
      // 抖音号
      if (!awemeVaild) {
        isValid = true;
        this.checkErrorTip.aweme_id.is_show = true;
      } else {
        this.checkErrorTip.aweme_id.is_show = false;
      }

    }
    if (type === 'product') {
      // 抖音号
      let productVaild = true;
      Object.keys(this.defaultData.template_struct.adgroup.product_aweme_id_lst).forEach(item => {
        if (this.defaultData.template_struct.campaign.marketing_goal === 'VIDEO_PROM_GOODS') {
          if (!this.defaultData.template_struct.adgroup.product_aweme_id_lst[item].product_id.length) {
            productVaild = false;
          }
        }
      });
      if (!productVaild) {
        isValid = true;
        this.checkErrorTip.product_id.is_show = true;
      } else {
        this.checkErrorTip.product_id.is_show = false;
      }
    }
    if (!type || type === 'adgroup') {
      // 模板名称
      if (!this.defaultData.project_template_name) {
        this.checkErrorTip.project_template_name.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.project_template_name.is_show = false;
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
      if (template_struct.campaign.campaign_budget_mode === 'BUDGET_MODE_DAY' && (template_struct.campaign.campaign_budget < 300 || template_struct.campaign.campaign_budget > 9999999.99)) {
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

      // 出价与预算
      // 日预算
      if (template_struct.adgroup.budget < 300 || template_struct.adgroup.budget > 9999999.99) {
        this.checkErrorTip.budget.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.budget.is_show = false;
      }

      // 出价
      if (template_struct.adgroup.smart_bid_type === 'SMART_BID_CUSTOM') {
        if (template_struct.adgroup.cpa_bid < 0.1 || template_struct.adgroup.cpa_bid > template_struct.adgroup.budget || template_struct.adgroup.cpa_bid > 10000) {
          this.checkErrorTip.cpa_bid.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.cpa_bid.is_show = false;
        }
      }

      // 广告出价
      if (template_struct.adgroup.smart_bid_type === 'SMART_BID_CONSERVATIVE') {
        if (template_struct.adgroup.adjust_cpa === 1) {
          if (template_struct.adgroup.cpa_bid < 0.1 || template_struct.adgroup.cpa_bid > template_struct.adgroup.budget || template_struct.adgroup.cpa_bid > 10000) {
            this.checkErrorTip.cpa_bid.is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.cpa_bid.is_show = false;
          }
        }
      }
      // 卡片模板
      if (this.defaultData.template_struct.promotion_card.isOpenCard) {

        for (const cardItem of Object.keys(this.defaultData.template_struct.promotion_card.card_type_lst)) {
          if (!this.defaultData.template_struct.promotion_card.card_by_convert_channel) {
            if (this.defaultData.template_struct.promotion_card.use_auto_create_product_image == '0' && !this.defaultData.template_struct.promotion_card.card_type_lst['all'].promo_card_setting.material_id) {
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
              if (!item.name || getStringLength(item.name, []) < 6 || getStringLength(item.name, []) > 9) {
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

    }

    if (!type || type === 'audience') {
      // 基础定向
      // if (!template_struct.adgroup.parent_audience_template_id) {
      //   this.checkErrorTip.parent_audience_template_id.is_show = true;
      //   isValid = true;
      // } else {
      //   this.checkErrorTip.parent_audience_template_id.is_show = false;
      // }

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

    }

    if (!type || type === 'creative' || type === 'title') {
      // 素材选取
      const materialList = [];
      const materialTitleList = [];
      const titleList = [];
      const template = this.defaultData.template_struct.material.material_type_temp.limit;
      let infoStr = '最少选取';
      template.forEach(item => {
        if (item.min > 0) {
          infoStr += item.min + '个' + item.label;
        }
      });
      if (this.defaultData.template_struct.material.by_material_set_title) {
        if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length <= 0) {
          materialTitleList.push(true);
        } else if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length > 0) {
          for (const s_item of this.defaultData.template_struct.material.material_type_lst['all'].materials) {
            let noMaterialNum = 0;
            for (const limit of s_item.limit) {
              if (limit.list.length <= 0) {
                noMaterialNum++;
              } else {
                limit.list.forEach(material => {
                  if (material.title.length <= 0 || material.title[0].length > 55) {
                    materialTitleList.push(true);
                  }
                });
              }
              if (limit.list.length < limit.min) {
                // this.message.info(infoStr);
                this.checkErrorTip.material_title_lst.tip_text = infoStr + '且分素材选取标题';
                materialTitleList.push(true);
              }
            }
            if (noMaterialNum >= s_item.limit.length) {
              materialTitleList.push(true);
            }
          }
        }
      } else {
        if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length <= 0) {
          materialList.push(true);
        } else if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length > 0) {
          for (const s_item of this.defaultData.template_struct.material.material_type_lst['all'].materials) {
            let noMaterialNum = 0;
            for (const limit of s_item.limit) {
              if (limit.list.length <= 0) {
                noMaterialNum++;
              }
              if (limit.list.length < limit.min) {
                // this.message.info(infoStr);
                this.checkErrorTip.material_lst.tip_text = infoStr;
                materialList.push(true);
              }
            }
            if (noMaterialNum >= s_item.limit.length) {
              materialList.push(true);
            }
            if (this.defaultData.template_struct.material.by_creative_group_set_title && (!s_item.title || s_item.title.length <= 0)) {
              titleList.push(true);
            }
          }
        }

        if (!this.defaultData.template_struct.material.by_creative_group_set_title && this.defaultData.template_struct.material.material_type_lst['all'].titles.length <= 0) {
          titleList.push(true);
        }
      }
      if (!type || type === 'creative') {
        if (materialList.some((item) => item)) {
          isValid = true;
          this.checkErrorTip.material_lst.is_show = true;
        } else {
          this.checkErrorTip.material_lst.is_show = false;
        }
        if (materialTitleList.some((item) => item)) {
          isValid = true;
          this.checkErrorTip.material_title_lst.is_show = true;
        } else {
          this.checkErrorTip.material_title_lst.is_show = false;
        }
      }
      if (!type || type === 'title') {
        if (titleList.some((item) => item)) {
          isValid = true;
          this.checkErrorTip.title_lst.is_show = true;
        } else {
          this.checkErrorTip.title_lst.is_show = false;
        }

      }
    }

    if (!type || type === 'tags') {
      if (template_struct.campaign.promotion_way !== 'SIMPLE') {
        let tagsVaild = true;
        let industryVaild = true;
        this.defaultData.template_struct.creative.industry_keywords_lst.forEach(item => {
          if (!item.ad_keywords.length) {
            tagsVaild = false;
          }
          if (!item.third_industry_id_list.length) {
            industryVaild = false;
          }
        });
        if (!industryVaild) {
          this.checkErrorTip.third_industry_id_list.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.third_industry_id_list.is_show = false;
        }
        if (!tagsVaild) {
          this.checkErrorTip.ad_keywords.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.ad_keywords.is_show = false;
        }
      }
      // 创意分类
      // if (template_struct.campaign.promotion_way!=='SIMPLE'&&!template_struct.creative.third_industry_id_list.length) {
      //   this.checkErrorTip.third_industry_id_list.is_show = true;
      //   isValid = true;
      // } else {
      //   this.checkErrorTip.third_industry_id_list.is_show = false;
      // }

      // 创意标签
      // if (template_struct.campaign.promotion_way!=='SIMPLE'&&!template_struct.creative.ad_keywords.length) {
      //   this.checkErrorTip.ad_keywords.is_show = true;
      //   isValid = true;
      // } else {
      //   this.checkErrorTip.ad_keywords.is_show = false;
      // }
    }

    // 广告组计划上限
    // if (template_struct.campaign.is_set_adgroup_limit_num==='1'&&template_struct.campaign.campaign_max_adgroup_num <= 0) {
    //   this.checkErrorTip.campaign_max_adgroup_num.is_show = true;
    //   isValid = true;
    // } else {
    //   this.checkErrorTip.campaign_max_adgroup_num.is_show = false;
    // }

    return isValid;
  }
  changeDeepChecked(event) {
    if (event) {
      this.defaultData.template_struct.adgroup.deep_external_action = 'AD_CONVERT_TYPE_LIVE_SUCCESSORDER_ACTION';
    } else {
      this.defaultData.template_struct.adgroup.deep_external_action = null;
    }
  }
  getCreativeConfigKey() {
    this.creativeList = [];
    this.creativeConfigKey = this.defaultData.template_struct.campaign.promotion_way + '_' + this.defaultData.template_struct.campaign.marketing_goal + '_' + this.defaultData.template_struct.creative.creative_material_mode + '_' + this.defaultData.template_struct.creative.creative_auto_generate;
    const data = deepCopy(this.creativeConfig[this.creativeConfigKey]);
    this.creativeList.push(data);
    this.defaultData.template_struct.material.material_type_temp = deepCopy(this.creativeConfig[this.creativeConfigKey]);
    this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [...this.creativeList], titles: [] };
    this.defaultData.template_struct.adgroup.product_info.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.product_id] = { materials: [...this.creativeList], titles: [] };
    });
  }
  checkCreativeNum(value, idea, list) {
    let materialNum = value;
    list.limit.map(item => {
      materialNum += item.num;
    });
    if (value < idea.num) {
      this.modalService.confirm({
        nzTitle: '提示',
        nzContent: '调整后，系统将自动删除已有创意组内超过上限的创意，是否继续？',
        nzOnOk: () => {
          idea.num = value;
          this.checkMaterials();
          if (this.settingLoad) {
            this.settingLoad = false;
            setTimeout(() => {
              this.settingLoad = true;
            }, 0);
          }
        }
      });
    } else {
      if (materialNum > list.length + idea.num) {
        this.message.info('每组素材数量不得超过' + list.length);
        idea.num = idea.num !== idea.min ? idea.min : 0;
      } else {
        idea.num = value;
      }
    }
  }
  addCreativeGroup(source) {
    const data = deepCopy(this.defaultData.template_struct.material.material_type_temp);
    source.push(data);
  }
  copyCreativeGroup(data, source) {
    const copyData = deepCopy(data);
    source.push(copyData);
  }
  deleteCreativeGroup(index, source) {
    if (source.length > index) {
      source.splice(index, 1);
      this.getMaterialErrorTip();
    }
  }
  _checkSingleProduct(data, value, result) {
    if (value) {
      result.product_id = [];
      result.product_id.push(data.product_id);
      if (this.defaultData.template_struct.promotion_card.isOpenCard && this.defaultData.template_struct.promotion_card.use_auto_create_product_image == '1') {
        this.defaultData.template_struct.promotion_card.card_type_lst['all']['promo_card_setting']['preview_img'] = data.product_img;
        this.refreshCardOpen();
      }
      const index = this.defaultData.template_struct.adgroup.product_info.find(item => item.product_id === data.product_id);
      if (!index) {
        this.defaultData.template_struct.adgroup.product_info.push(data);
      }
    } else {
      const index = this.defaultData.template_struct.adgroup.product_info.find(item => item.product_id === data.product_id);
      if (index || index === 0) {
        this.defaultData.template_struct.adgroup.product_info.splice(index, 1);
      }
      result.product_id = [];
      if (this.defaultData.template_struct.promotion_card.isOpenCard && this.defaultData.template_struct.promotion_card.use_auto_create_product_image == '1') {
        this.defaultData.template_struct.promotion_card.card_type_lst['all']['promo_card_setting']['preview_img'] = '';
        this.refreshCardOpen();
      }
    }
    if (this.defaultData.template_struct.adgroup.product_info.length === 0) {
      this.defaultData.template_struct.adgroup.audience_by_convert_channel = false;
      this.defaultData.template_struct.promotion_card.card_by_convert_channel = false;
      // this.defaultData.template_struct.promotion_card.isOpenCard = false;
      return;
    }
    this.defaultData.template_struct.adgroup.product_info.forEach((item, index) => {
      if (!this.defaultData.template_struct.adgroup.audience_template_id_lst[item.product_id]) {
        this.defaultData.template_struct.adgroup.audience_template_id_lst[item.product_id] = [];
      }
      if (!this.defaultData.template_struct.material.material_type_lst[item.product_id]) {
        this.defaultData.template_struct.material.material_type_lst[item.product_id] = {
          materials: [],
          titles: []
        };
      }
      if (!this.defaultData.template_struct.promotion_card.card_type_lst[item.product_id]) {
        this.defaultData.template_struct.promotion_card.card_type_lst[item.product_id] = deepCopy(this.promotion_card);
      }

      if (!this.checkErrorTip.card_error_tip[item.product_id]) {
        this.checkErrorTip.card_error_tip[item.product_id] = deepCopy(this.cardCheckErrorTip);
      }

      const curChannelData = result.product_id.find(id => id === item.product_id);

      if (!curChannelData) {
        delete this.defaultData.template_struct.adgroup.audience_template_id_lst[item.product_id];
        delete this.defaultData.template_struct.material.material_type_lst[item.product_id];
        delete this.defaultData.template_struct.promotion_card.card_type_lst[item.product_id];
        delete this.checkErrorTip.card_error_tip[item.product_id];
        this.targetChannelList.splice(index, 1);
      }
    });
    this.changeTargetTab(this.curTargetIndex);
    // this.getCheckData();
    this.getAwemeProductErrorTip();
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
  checkMaterials() {
    const limit = this.defaultData.template_struct.material.material_type_temp.limit;
    this.defaultData.template_struct.material.material_type_lst.all.materials.forEach(creative => {
      limit.forEach((item, index) => {
        if (creative.limit[index].list.length > item.num) {
          creative.limit[index].list.splice(item.num);
        }
      });
    });
  }
  cancelPopcon(type, key) {
    this.popconObj[type] = this.defaultData.template_struct[key][type];
  }

  changeAweme(value, list) {
    const awemeData = list.find(item => item.aweme_id === value);
    if (awemeData) {
      this.resultData.template_struct.creative.bind_type = JSON.parse(awemeData.bind_type);
      if (this.resultData.template_struct.creative.bind_type.indexOf('OFFICIAL') === -1 && this.resultData.template_struct.creative.bind_type.indexOf('SELF') === -1) {
        this.resultData.template_struct.creative.creative_material_mode = 'CUSTOM_CREATIVE';
        this.resultData.template_struct.creative.is_homepage_hide = 0;
        this.popconObj.creative_auto_generate = '0';
        this.resultData.template_struct.creative.creative_auto_generate = '0';
        this.resultData.template_struct.material.material_type_temp.length = 10;
      } else {
        this.popconObj.creative_auto_generate = '1';
        this.resultData.template_struct.creative.creative_auto_generate = '1';
        this.resultData.template_struct.material.material_type_temp.length = 7;
      }
      this.resultData = deepCopy(this.defaultData);
    }
    this.getAwemeProductErrorTip();
  }
  changeOpenCard(value) {
    this.isShowCardSetting = value;
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
    const template = this.defaultData.template_struct.material.material_type_temp.limit;
    let infoStr = '最少选取';
    template.forEach(item => {
      if (item.min > 0) {
        infoStr += item.min + '个' + item.label;
      }
    });
    if (this.defaultData.template_struct.material.by_material_set_title) {
      if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length <= 0) {
        materialTitleList.push(true);
      } else if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length > 0) {
        for (const s_item of this.defaultData.template_struct.material.material_type_lst['all'].materials) {
          let noMaterialNum = 0;
          for (const limit of s_item.limit) {
            if (limit.list.length <= 0) {
              noMaterialNum++;
            } else {
              limit.list.forEach(material => {
                if (material.title.length <= 0 || material.title[0].length > 55) {
                  materialTitleList.push(true);
                }
              });
            }
            if (limit.list.length < limit.min) {
              // this.message.info(infoStr);
              this.checkErrorTip.material_title_lst.tip_text = infoStr + '且分素材选取标题';
              materialTitleList.push(true);
            }
          }
          if (noMaterialNum >= s_item.limit.length) {
            materialTitleList.push(true);
          }
        }
      }
    } else {
      if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length <= 0) {
        materialList.push(true);
      } else if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length > 0) {
        for (const s_item of this.defaultData.template_struct.material.material_type_lst['all'].materials) {
          let noMaterialNum = 0;
          for (const limit of s_item.limit) {
            if (limit.list.length <= 0) {
              noMaterialNum++;
            }
            if (limit.list.length < limit.min) {
              // this.message.info(infoStr);
              this.checkErrorTip.material_lst.tip_text = infoStr;
              materialList.push(true);
            }
          }
          if (noMaterialNum >= s_item.limit.length) {
            materialList.push(true);
          }
          if (this.defaultData.template_struct.material.by_creative_group_set_title && (!s_item.title || s_item.title.length <= 0)) {
            titleList.push(true);
          }
        }
      }

      if (!this.defaultData.template_struct.material.by_creative_group_set_title && this.defaultData.template_struct.material.material_type_lst['all'].titles.length <= 0) {
        titleList.push(true);
      }
    }

    if (materialList.some((item) => item)) {
      this.checkErrorTip.material_lst.is_show = true;
    } else {
      this.checkErrorTip.material_lst.is_show = false;
    }

    if (titleList.some((item) => item)) {
      this.checkErrorTip.title_lst.is_show = true;
    } else {
      this.checkErrorTip.title_lst.is_show = false;
    }

    if (materialTitleList.some((item) => item)) {
      this.checkErrorTip.material_title_lst.is_show = true;
    } else {
      this.checkErrorTip.material_title_lst.is_show = false;
    }

  }
  getAwemeProductErrorTip() {
    // 抖音号
    let productVaild = true;
    let awemeVaild = true;
    Object.keys(this.defaultData.template_struct.adgroup.product_aweme_id_lst).forEach(item => {
      if (!this.defaultData.template_struct.adgroup.product_aweme_id_lst[item].aweme_id) {
        awemeVaild = false;
      }
      if (this.defaultData.template_struct.campaign.marketing_goal === 'VIDEO_PROM_GOODS') {
        if (!this.defaultData.template_struct.adgroup.product_aweme_id_lst[item].product_id.length) {
          productVaild = false;
        }
      }
    });
    if (!productVaild) {
      this.checkErrorTip.product_id.is_show = true;
    } else {
      this.checkErrorTip.product_id.is_show = false;
    }
    // 抖音号
    if (!awemeVaild) {
      this.checkErrorTip.aweme_id.is_show = true;
    } else {
      this.checkErrorTip.aweme_id.is_show = false;
    }
  }
  changeUseProductImg(value) {
    if (value === '1') {
      if (this.defaultData.template_struct.adgroup.product_info.length > 0) {
        this.defaultData.template_struct.promotion_card.card_type_lst['all']['promo_card_setting']['preview_img'] = this.defaultData.template_struct.adgroup.product_info[0]['product_img'];
      }
    } else {
      this.defaultData.template_struct.promotion_card.card_type_lst['all']['promo_card_setting']['preview_img'] = '';
    }
    this.refreshCardOpen();
  }
  refreshCardOpen() {
    if (this.defaultData.template_struct.promotion_card.isOpenCard) {
      this.defaultData.template_struct.promotion_card.isOpenCard = false;
      setTimeout(() => {
        this.defaultData.template_struct.promotion_card.isOpenCard = true;
      }, 0);
    }
  }

  openSingelSettingDraw(type) {
    // 账户
    if (this.defaultData.chan_pub_id_lst.length <= 0) {
      this.message.info('请先选择账户');
      return;
    }
    // 抖音号
    let productVaild = true;
    let awemeVaild = true;
    Object.keys(this.defaultData.template_struct.adgroup.product_aweme_id_lst).forEach(item => {
      if (!this.defaultData.template_struct.adgroup.product_aweme_id_lst[item].aweme_id) {
        awemeVaild = false;
      }
      if (this.defaultData.template_struct.campaign.marketing_goal === 'VIDEO_PROM_GOODS') {
        if (!this.defaultData.template_struct.adgroup.product_aweme_id_lst[item].product_id.length) {
          productVaild = false;
        }
      }
    });
    // 抖音号
    if (!awemeVaild) {
      this.message.info('请先选择抖音号');
      return;
    }
    if (type !== 'product' && !productVaild) {
      this.message.info('请先选择商品');
      return;
    }
    this.defaultData = deepCopy(this.resultData);
    if (type === 'product') {
      this.curAccountList.forEach(data => {
        data.productList.forEach(product => {
          if (this.defaultData.template_struct.adgroup.product_aweme_id_lst[data.chan_pub_id]['product_id'].find(item => item === product.product_id)) {
            product.checked = true;
          }
        });
      });
    }
    if (type === 'title') {
      if (this.defaultData.template_struct.material.by_material_set_title || this.defaultData.template_struct.material.by_creative_group_set_title) {
        this.message.info('分素材或创意组选取标题后无需单独选取标题');
        return;
      }
      if (!this.isSettingDrawerEdit.creative) {
        this.message.info('请添加创意');
        return;
      }
      this.addLaunchTitle(this.defaultData.template_struct.material.material_type_lst['all'].titles);
    }
    if (type === 'tags' && this.defaultData.template_struct.creative.industry_keywords_lst.length < 1) {
      this.addCreativeTag();
    }
    if (type === 'creative' && this.defaultData.template_struct.material.material_type_lst['all'].materials.length < 1) {
      this.getCreativeConfigKey();
    }
    if (type === 'audience') {
      this.curTargetList.forEach(item => item.checked = false);
      this.defaultData.template_struct.adgroup.audience_template_id_lst['all'].forEach(item => {
        const data = this.curTargetList.find(s_item => s_item.audience_template_id == item);
        if (data) {
          data.checked = true;
        }
      });
      const allUnchecked = this.curTargetList.some((item) => !item.checked);
      this._allChecked = !allUnchecked;
    }
    this.settingDrawerObj[type] = true;

  }
  closeSingelSettingDraw(type?) {
    if (type) {
      const isValid = this.checkBasicData(type);
      if (isValid) {
        if (type === 'tags') {
          this.defaultData.template_struct.creative.industry_keywords_lst = [];
        } else if (type === 'creative') {
          this.defaultData.template_struct.material.material_type_lst['all'].materials = [];
        } else if (type === 'title') {
          this.defaultData.template_struct.material.material_type_lst['all'].titles = [];
        }
      }
      this.settingDrawerObj[type] = false;
    } else {
      Object.keys(this.settingDrawerObj).forEach(key => {
        this.settingDrawerObj[key] = false;
      });
    }
  }
  saveSingleEdit(type) {
    const isValid = this.checkBasicData(type);

    if (isValid) {
      this.message.error('请完善信息！');
      return;
    }
    if (type === 'adgroup') {
      this.popconObj.creative_auto_generate = this.defaultData.template_struct.adgroup.external_action == 'AD_CONVERT_TYPE_QC_FOLLOW_ACTION' || this.defaultData.template_struct.adgroup.external_action == 'AD_CONVERT_TYPE_QC_MUST_BUY' ? '1' : '0';
      this.defaultData.template_struct.creative.creative_auto_generate = this.popconObj.creative_auto_generate;
    }
    this.settingDrawerObj[type] = false;
    this.isSettingDrawerEdit[type] = true;
    this.resultData = deepCopy(this.defaultData);
    this.getAdgroupNum();
  }
  deleteSignalTarget(index?) {
    if (index || index == 0) {
      this.defaultData.template_struct.adgroup.audience_template_id_lst['all'].splice(index, 1);
      this.resultData.template_struct.adgroup.audience_template_id_lst['all'].splice(index, 1);
    }
  }
  addCreativeTag() {
    this.defaultData.template_struct.creative.industry_keywords_lst.push({
      name: '创意分类标签' + (this.defaultData.template_struct.creative.industry_keywords_lst.length + 1),
      inputValue: '',
      third_industry_id_list: [],
      ad_keywords: [], // 创意标签
    });
  }
  copyCreativeTag(data) {
    const copyData = deepCopy(data);
    const copyName = copyData.name + '_副本';
    const repeatName = this.defaultData.template_struct.creative.industry_keywords_lst.filter(item => item.name.substr(0, item.name.length - 1) === copyName);
    copyData.name = copyData.name + '_副本' + (repeatName.length + 1);
    this.defaultData.template_struct.creative.industry_keywords_lst.push(copyData);
  }
  deleteCreativeTag(index) {
    this.defaultData.template_struct.creative.industry_keywords_lst.splice(index, 1);
    if (!this.settingDrawerObj.tags) {
      this.resultData.template_struct.creative.industry_keywords_lst.splice(index, 1);
    }
  }
  getAdgroupNum() {
    this.adgroupNum = this.defaultData.template_struct.adgroup.audience_template_id_lst['all'].length * this.defaultData.template_struct.material.material_type_lst['all'].materials.length;
    if (this.defaultData.template_struct.campaign.promotion_way !== 'SIMPLE') {
      this.adgroupNum = this.adgroupNum * this.defaultData.template_struct.creative.industry_keywords_lst.length;
    }
    this.adgroupNum = Number(this.adgroupNum);
  }
  createTargetNew(data) {
    if (data.audience_template_id) {
      this.defaultData.template_struct.adgroup.audience_template_id_lst['all'].push(data.audience_template_id);
      this.resultData.template_struct.adgroup.audience_template_id_lst['all'].push(data.audience_template_id);
      this.getChildTargetList();
      this.isSettingDrawerEdit.audience = true;
    }
    this.closeSingelSettingDraw('audience');

  }
  openEditTargetVisible(type, data) {
    this.isEditAudienceDraw = true;
    if (data) {
      data.active = false;
      this.editAudienceId = data.audience_template_id;
    }
  }
  editTargetClose(data) {
    if (data.audience_template_id) {
      this.getChildTargetList();
    }
    this.isEditAudienceDraw = false;
  }
  changeCheckFlow(value) {
    if (value) {
      this.defaultData.template_struct.adgroup.flow_control_mode = 'FLOW_CONTROL_MODE_SMOOTH';
    } else {
      this.defaultData.template_struct.adgroup.flow_control_mode = 'FLOW_CONTROL_MODE_FAST';
    }
  }

}
