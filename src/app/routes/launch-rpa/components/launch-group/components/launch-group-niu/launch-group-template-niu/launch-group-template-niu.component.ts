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
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { MenuService } from "../../../../../../../core/service/menu.service";
import { deepCopy, formatDate, isArray } from "@jzl/jzl-util";
import { differenceInCalendarDays, format, addMonths } from "date-fns";
import { getStringLength } from "../../../../../../../shared/util/util";
import { LaunchMaterialVideoModalComponent } from "../../../../../modal/launch-material-video-modal/launch-material-video-modal.component";
import { isObject } from "@jzl/jzl-util";
import { LaunchMaterialImageModalComponent } from "../../../../../modal/launch-material-image-modal/launch-material-image-modal.component";
import { LaunchTitleModalComponent } from "../../../../../modal/launch-title-modal/launch-title-modal.component";
import { UploadImageMaterialsComponent } from "../../../../../modal/upload-image-materials/upload-image-materials.component";
import { LaunchMaterialCoverModalComponent } from "../../../../../modal/launch-material-cover-modal/launch-material-cover-modal.component";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { AddGoodsListDrawerComponent } from "../add-goods-list-drawer/add-goods-list-drawer.component";

@Component({
  selector: 'app-launch-group-template-niu',
  templateUrl: './launch-group-template-niu.component.html',
  styleUrls: ['./launch-group-template-niu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchGroupTemplateNiuComponent implements OnInit {
  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  @ViewChild('curCampaignTextArea') curCampaignTextArea: ElementRef;
  @ViewChild('curAdgroupTextArea') curAdgroupTextArea: ElementRef;
  @ViewChild('curCreativeTextArea') curCreativeTextArea: ElementRef;


  @Output() cancel = new EventEmitter<any>();

  @Input() accountsList;

  @Input() data;

  @Input() isEdit;

  @Input() projectTemplateId;

  @Input() isCopy;

  public curAccountsList = [];
  public currentAccountsList = [];//新加-当前账户列表
  public tableHeight = document.body.clientHeight - 60;
  public tableWidth = document.body.clientWidth - 150 - 130;
  public cityLoading = true;
  public cityText = '';
  public noHaveText = '';
  public countryLoading = true;
  public campaignWordList = [];
  public adgroupWordList = [];
  public creativeWordList = [];
  public stickerStylesSubList = [];//不同创意组贴纸选项

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
      name: '广告计划',
      sub: [
        { key: '#promotion_set', name: '推广设置' },
        { key: '#budget', name: '计划预算' },
      ]
    },
    {
      key: '#adgroup_start',
      name: '广告组',
      sub: [
        { key: '#merchant_item_put_type', name: '转化途径' },
        { key: '#user_target', name: '定向人群' },
        { key: '#budget_and_bid', name: '目标与出价' },
      ]
    },
    {
      key: '#creative_start',
      name: '广告创意',
      sub: [
        { key: '#scene_id', name: '投放位置' },
        { key: '#creative_create', name: '创意制作' },
      ]
    }
  ];

  public plan_type = {
    13: "短视频推广",
    14: "直播推广"
  };

  public weekList = [
    { key: '周一', value: null },
    { key: '周二', value: null },
    { key: '周三', value: null },
    { key: '周四', value: null },
    { key: '周五', value: null },
    { key: '周六', value: null },
    { key: '周日', value: null },
  ];

  public today = new Date();

  public showCoefficient = false;

  public structConfigLoading = true;
  public structConfig: any = {};
  public ocpxActionTypesSub: any = [];//转化目标的sub

  public cid;

  public inputValue = '';
  public currentTargetData = {};

  public basicTargetList = [];

  public curBasicTarget = [];

  public targetChannelList = [];

  public launchTargetPackage = [];

  public allTargetChecked = false;

  public targetIndeterminate = false; // 表示有选中的，不管是全选还是选个别

  public chan_pub_ids = [];

  public curChannelList = [];

  public channelTreeList = [];

  public resultList = [];

  public curTargetList = [];   // 当前渠道下投放包列表

  public curTargetIndex = 0;

  public isChannelTree = true;

  public user_id;

  public defaultData = {
    project_id: "",
    chan_pub_id_lst: [],  // 账户
    project_template_name: "",  // 模板名称
    convert_channel_id_lst: [],  // 渠道
    landing_type: "",  // 推广目标类型
    template_struct: {},
  };

  public campaignData = {
    pub_campaign_name: '',//计划名称
    promotion_type: 2,//推广方式
    type: 13,  // 营销目标
    budget: 500,//计划预算(元)
    budget_type: 0,  // 预算类型
    day_budget_schedule: [],
  };

  public adgroupData = {
    merchant_item_put_type: 0,//转化途径
    shopping_car_product_id: null,//短视频挂小黄车的商品列表
    shopping_car_product_list: [],
    shopping_car_product_type: 1,//是否短视频挂小黄车
    support_type: 0,//商品类型
    item_id: null,//小店推广商品,选择的商品列表
    item_list: [],
    ocpx_action_type: 72,//转化目标
    day_budget: 300,//单日预算值
    day_budget_type: 300,//单日预算-radio
    speed: 1,//投放方式
    bid_type: 10,//优化目标出价类型
    cpa_bid: 5,//成本上限
    roi_ratio: 0.5,//付费ROI系数
    launch_date: 1,//投放时间
    start_time_str: null, // 开始投放日期
    end_time_str: null,// 结束投放日期
    time_range: [new Date(), addMonths(new Date(), 1)],  // 起始时间
    schedule_time: 1,//投放时段
    time_series: "",  // 投放时间段
    pub_adgroup_name: '',//广告组名称
    scene_id: [6, 7],//投放位置
    show_mode: 1,//创意展现方式
    unit_type: 4,//创意制作方式，创意类型
    merchant_item_put_type_live: 0,//转化途径-直播间，临时key
    parent_audience_template_id: '',
    audience_template_id_lst: { all: [] },  // 定向模板

    //
    audience_by_convert_channel: false,  // 分渠道设置定向
  };


  public adcreativeData = {
    live_creative_type: 2,//创意样式
    pub_creative_name: '',//创意名称
    action_bar: '', //行动号召按钮,
    description: '',//作品标题
    new_expose_tag: [],//推荐理由
    recommendation: '',//商品推荐语
    creative_material_type: 1,  // 素材类型
    // 程序化创意
    cover_cfg: 1, //封面
    cover_slogans: '',//封面广告语
    sticker_styles: '',//贴纸



    // --以下原来的数据
    creative_tag_label: [],
  };

  public materialData = {
    by_material_set_title: false,
    single_adgroup_title_num: 1,//单广告组标题数
    single_creative_material_num: 1,//单创意组视频数-自定义创意
    material_type_lst: {
      custom_creative: { description: [], materials_list: [[],] },
      program_creative: { materials_list: [{ materials: [], description: [], cover_cfg: 1, cover_slogans: [], sticker_styles: [], sticker_styles_sub: [] }] },
    },
    by_channel_set_material: false,//分渠道号选择素材
    single_adgroup_material_num: 1//单广告组素材数
  };

  public cursorPosition = 0;

  public publisherId;

  public creativeElementsList = [
    {
      "label": "广告语",
      "key": "description",
      "parent_name": "",
      "required": true,
      "restriction": {
        "max_length": 30,
        "min_length": 1,
        "text_pattern": "^[^\\<\\>\\&'\\\"\\/\\x08\\x09\\x0A\\x0D\\\\]+$"
      }
    },
    {
      "label": "封面广告语",
      "key": "cover_slogans",
      "parent_name": "",
      "required": true,
      "restriction": {
        "max_length": 14,
        "min_length": 1,
        "text_pattern": "^[^\\<\\>\\&'\\\"\\/\\x08\\x09\\x0A\\x0D\\\\]+$"
      }
    },
    {
      "label": "视频",
      "key": "video",
      "parent_name": "",
      "required": true,
      "restriction": {
        "file_format": [
          "MEDIA_TYPE_MP4",
          "MEDIA_TYPE_MOV",
          "MEDIA_TYPE_AVI"
        ],
        "file_size": 102400,
        "max_duration": 60,
        "min_duration": 5,
        "min_height": 720,
        "min_width": 1280,
        "ratio_height": 9,
        "ratio_width": 16
      }
    },
    {
      "label": "图片",
      "key": "image",
      "parent_name": "",
      "required": true,
      "restriction": {
        "file_format": [
          "IMAGE_TYPE_JPG",
          "IMAGE_TYPE_PNG"
        ],
        "file_size": 140,
        "height": 720,
        "width": 1280
      }
    },
  ];

  public isGetElement = false;

  public creativeLabelList = [];

  public actionBarList = [];
  public exposeTagList = [];
  public creativeCategoryList = [];

  public elementNamesList = [];

  public checkErrorTip = {
    // 贴纸
    sticker_styles: {
      is_show: false,
      tip_text: '请至少选择一张贴纸',
    },
    pub_adgroup_name: {
      is_show: false,
      tip_text: '广告组名称必填',
    },
    chan_pub_id_lst: {
      is_show: false,
      tip_text: '账号必填',
    },
    project_template_name: {
      is_show: false,
      tip_text: '模板名称必填',
    },
    pub_campaign_name: {
      is_show: false,
      tip_text: '计划名称必填',
    },


    parent_audience_template_id: {
      is_show: false,
      tip_text: '基础定向必填',
    },
    audience_template_id_lst: {
      is_show: false,
      tip_text: '定向包列表必填',
    },
    creative_material_type: {
      is_show: false,
      tip_text: '素材类型必填',
    },
    action_bar: {
      is_show: false,
      tip_text: '请选择行动号召按钮',
    },

    pub_creative_name: {
      is_show: false,
      tip_text: '创意名称必填',
    },

    materials: {
      is_show: false,
      tip_text: '素材不能为空，且最多选15个',
    },
    cover_slogans: {
      is_show: false,
      tip_text: '封面广告语最多选6个',
    },

    material_title_lst: {
      is_show: false,
      tip_text: '每个视频标题不能为空，且只能添加1个'
    },

    // 计划预算-统一预算
    budget: {
      is_show: false,
      tip_text: '请填写统一预算'
    },
    // 小店推广商品
    item_id: {
      is_show: false,
      tip_text: '每个账户的商品都不能为空'
    },
    // 短视频挂车商品
    shopping_car_product_id: {
      is_show: false,
      tip_text: '每个账户的商品都不能为空',
    },
    // 日预算
    day_budget: {
      is_show: false,
      tip_text: '预算不小于300,不大于2000000',
    },
    // 成本上限
    cpa_bid: {
      is_show: false,
      tip_text: '成本上限不能为空',
    },
    // ROI系数
    roi_ratio: {
      is_show: false,
      tip_text: 'ROI系数不能为空',
    },
    // 投放位置
    scene_id: {
      is_show: false,
      tip_text: '投放位置不能为空',
    },
    // 单广告组素材数
    single_adgroup_material_num: {
      is_show: false,
      tip_text: '单广告组素材数不能为空',
    },
    // 单广告组标题数
    single_adgroup_title_num: {
      is_show: false,
      tip_text: '单广告组标题数不能为空',
    },
    // 投放时段-特定时间
    time_series: {
      is_show: false,
      tip_text: '请选择特定时间或全天',
    },
    //作品标题
    description: {
      is_show: false,
      tip_text: '作品标题不能为空',
    },

    //商品推荐语
    recommendation: {
      is_show: false,
      tip_text: '商品推荐语不能为空,且最多10字',
    },
    //自定义-单创意组视频数
    single_creative_material_num: {
      is_show: false,
      tip_text: '创意组视频数不能为空',
    },
    //程序化创意
    program_creative_list: [
      {
        // 创意组
        program_creative: {
          is_show: false,
          tip_text: '视频、标题、封面广告语、贴纸数量均需要符合规定',
        },
        //作品标题
        description: {
          is_show: false,
          tip_text: '作品标题不能为空，且最多3个',
        },
        // 视频
        materials: {
          is_show: false,
          tip_text: '视频不能为空，且最多5个',
        },
        // 封面贴纸
        sticker_styles: {
          is_show: false,
          tip_text: '请至少选择一张贴纸',
        },
        // 封面广告语
        cover_slogans: {
          is_show: false,
          tip_text: '封面广告语最多选6个',
        },
      }
    ],

  };

  constructor(
    private launchService: LaunchService,
    private authService: AuthService,
    private message: NzMessageService,
    private modalService: NzModalService,
    public launchRpaService: LaunchRpaService,
    public menuService: MenuService,
    private drawerService: NzDrawerService,
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
    this.getStructConfigByNiu();
    this.getExposeTagList();//获取推荐理由
    this.getActionBarList();//获取行动号召按钮
    this.getCreativLabelList();
    this.getLaunchRpaWordList();

    if (this.isEdit && this.projectTemplateId) {
      this.getProjectTemplate();
    } else {
      this.getChannelList();
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
            this.adcreativeData = deepCopy(results['data']['template_struct']['creative']);
            this.materialData = deepCopy(results['data']['template_struct']['material']);

            //获取当前账户信息
            const chanPubIdsObj = {};
            results['data']['chan_pub_id_lst'].forEach(element => {
              chanPubIdsObj[element] = element;
            });

            this.accountsList.forEach(item => {
              if (chanPubIdsObj[item.chan_pub_id]) {
                this.curAccountsList.push({ name: item.pub_account_name, id: item.chan_pub_id, shopping_car_product_id: {}, item_id: {} })
              }
            });

            this.curAccountsList.forEach(curAccount => {
              if (this.campaignData.type === 14 && this.adgroupData.shopping_car_product_type === 1 && results['data']['template_struct']['adgroup']['shopping_car_product_id']) {
                //获取小黄车商品信息
                for (const key in this.adgroupData.shopping_car_product_id) {
                  if (curAccount.id == key) {
                    this.getItemInfoById('shopping_car_product_id', this.adgroupData.shopping_car_product_id[key], curAccount);
                  }
                }
              }
              if (this.campaignData.type === 13 && this.adgroupData.merchant_item_put_type === 0 && results['data']['template_struct']['adgroup']['item_id']) {
                //获取小店推广商品信息
                for (const key in this.adgroupData.item_id) {
                  if (curAccount.id == key) {
                    this.getItemInfoById('item_id', this.adgroupData.item_id[key], curAccount);
                  }
                }
              }
            });

            if (this.adgroupData.parent_audience_template_id) {
              this.getChildTargetList(this.adgroupData.parent_audience_template_id);
            }

            if (this.isCopy) {
              this.defaultData.project_template_name = this.defaultData.project_template_name + '-复制';
            }
            this.getActionBarList();
            this.getChannelList();
            this.getBasicTargetList();
            this.getExposeTagList();
            this.getCreativeCategoryList();

            //获取转化目标列表
            this.getOcpxActionTypesSub();

            // 回写多选框选中状态
            //1.投放位置
            if (this.structConfig?.adgroup?.scene_id?.sub) {
              this.refreshCheckedStatus(this.structConfig.adgroup.scene_id.sub, this.adgroupData.scene_id);
            }
            // 2.贴纸
            this.refreshStickerStylesSub();

            // 程序化创意-错误提示对象回写
            this.materialData.material_type_lst['program_creative']['materials_list'].forEach((element, i) => {
              const errorTip = deepCopy(this.checkErrorTip.program_creative_list[0]);
              this.checkErrorTip.program_creative_list[i] = errorTip;
            });
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
          cover_slogans: [],
          description: []
        };
      }

    });
    if (this.adgroupData.parent_audience_template_id) {
      this.getChildTargetList(this.adgroupData.parent_audience_template_id);
    }

  }

  // 获取配置
  getStructConfigByNiu() {
    this.launchRpaService
      .getStructConfigByNiu({
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
          this.getOcpxActionTypesSub();//获取一下转化目标列表ocpxActionTypesSub
          // 回写多选框选中状态
          //1.投放位置
          if (this.structConfig?.adgroup?.scene_id?.sub) {
            this.refreshCheckedStatus(this.structConfig.adgroup.scene_id.sub, this.adgroupData.scene_id);
          }
          // 2.贴纸选项更新
          this.refreshStickerStylesSub();
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
    if (data.length === 0) {
      this.adgroupData.audience_by_convert_channel = false;
      this.materialData.by_channel_set_material = false;
      this.targetChannelList = [];
      return;
    }
    data.forEach(channelId => {
      const channelData = this.curChannelList.find(item => item.convert_channel_id === channelId);
      if (!this.targetChannelList.find(s_item => s_item.convert_channel_id === channelId)) {
        this.targetChannelList.push(channelData);
      }
    });
    const appTypeList = [];
    this.targetChannelList.forEach((item, index) => {
      if (!this.adgroupData.audience_template_id_lst[item.convert_channel_id]) {
        this.adgroupData.audience_template_id_lst[item.convert_channel_id] = [];
      }

      const curChannelData = data.find(value => value === item.convert_channel_id);

      if (!curChannelData) {
        delete this.adgroupData.audience_template_id_lst[item.convert_channel_id];
        this.targetChannelList.splice(index, 1);
      }
      if (item.app_type) {
        appTypeList.push(item.app_type);
      }
    });
    if (appTypeList.indexOf('android') > -1 && appTypeList.indexOf('ios') > -1) {
      this.message.info('不支持同时选择Android和IOS下载类型,请及时修正');
    }
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
      }
    ];

    this.launchRpaService.getChannelListByNiu({ pConditions: allpConditions }, {
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
    // this.channelTreeList = [];
    // this.curChannelList.forEach(item => {
    //   const findIndex = this.channelTreeList.findIndex(channelItem => channelItem.key === item.chan_pub_id);
    //   if (findIndex === -1) {
    //     this.channelTreeList.push({
    //       level: 1,
    //       title: item.pub_account_name,
    //       key: item.chan_pub_id,
    //       checked: false,
    //       isLeaf: false,
    //       children: []
    //     });
    //   }

    //   const data = this.channelTreeList.find(s_item => s_item.key === item.chan_pub_id);
    //   const childData = data.children.find(chilItem => chilItem.key === item.convert_channel_id);
    //   if (data && data.children && !childData && item.campaign_type == this.campaignData.type) {
    //     data.children.push({
    //       level: 2,
    //       title: item.convert_channel_name,
    //       key: item.convert_channel_id,
    //       checked: false,
    //       isLeaf: true, ...item
    //     });
    //   }
    // });
  }

  changeObjectType() {
    // this.getActionBarList();
    // this.getChannelList('clear');

    this.curBasicTarget = deepCopy(this.basicTargetList.filter(item => item.landing_type == this.campaignData.type));

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
    this.getItemErrorTip('audience_template_id_lst', this.adgroupData.audience_template_id_lst['all'])
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
    this.curBasicTarget.forEach(item => {
      if (item.audience_template_id === id) {
        this.currentTargetData = item;
      }
    });
    this.getItemErrorTip('parent_audience_template_id', this.adgroupData.parent_audience_template_id)
  }

  // 基础定向包列表
  getBasicTargetList() {
    this.launchRpaService
      .getTargetBasicListByNiu({
        cid: this.cid,
      }, { result_model: 'all', })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.basicTargetList = [];
          } else {
            this.basicTargetList = results['data'];
            this.curBasicTarget = deepCopy(this.basicTargetList.filter(item => item.landing_type == this.campaignData.type));
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
      .getTargetListByNiu(id, {
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
    // 投放时段
    if (!this.adgroupData.time_series.includes('1')) {
      this.checkErrorTip.time_series.is_show = true;
    } else {
      this.checkErrorTip.time_series.is_show = false;
    }
  }

  changeBidMode(event) {
    if (event == 10) {
      if (this.defaultData.chan_pub_id_lst.length > 0) {
        this.defaultData.chan_pub_id_lst.forEach((item, index) => {
          const data = this.accountsList.find(value => value.chan_pub_id === item);
          if (data && !this.curAccountsList.find(s_item => s_item.id === item)) {
            this.curAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, ocpx_action_type: null, ocpxActionList: [], shopping_car_product_id: {}, item_id: {} });
          }
          this.getOcpxActionList();
        });
      } else {
        this.curAccountsList = [];
      }
    } else {
      this.curAccountsList = [];
    }

  }

  changeAccount(ids) {
    this.targetChannelList = [];
    this.channelTreeList = [];
    // this.getChannelList('clear');
    this.getExposeTagList();
    this.getCreativeCategoryList();
    this.getActionBarList();
    if (ids.length > 0) {
      ids.forEach((item, index) => {
        const data = this.accountsList.find(value => value.chan_pub_id === item);
        if (data && !this.curAccountsList.find(s_item => s_item.id === item)) {
          this.curAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, ocpx_action_type: null, ocpxActionList: [], shopping_car_product_id: {}, item_id: {} });
        }
        this.getOcpxActionList();
      });

      this.curAccountsList.forEach((item, index) => {
        const data = ids.find(value => value === item.id);
        if (!data) {
          this.curAccountsList.splice(index, 1);
        }
      });
    } else {
      this.curAccountsList = [];
    }

    this.getItemErrorTip('chan_pub_id_lst', this.defaultData.chan_pub_id_lst);

  }


  changeAdcreativeTemplate() {
    this.materialData.material_type_lst['custom_creative'] = { description: [], materials_list: [[],] };
    this.materialData.material_type_lst['program_creative'] = { materials_list: [{ materials: [], description: [], cover_cfg: 1, cover_slogans: [], sticker_styles: [], sticker_styles_sub: deepCopy(this.structConfig.program_creative.sticker_styles.sub) }] };
    // 2.贴纸选项更新
    this.refreshStickerStylesSub();

    this.targetChannelList.forEach(item => {
      this.materialData.material_type_lst[item.convert_channel_id] = {
        materials: [],
        cover_slogans: [],
        description: []
      };
    });

    this.materialData.by_material_set_title = false;
    this.materialData.single_adgroup_title_num = 1;
    this.materialData.by_channel_set_material = false;
    this.materialData.single_adgroup_material_num = 1;
    this.adcreativeData.creative_tag_label = [];
    this.adcreativeData.action_bar = "";
    this.adcreativeData.pub_creative_name = "";
    this.adcreativeData.new_expose_tag = [];
    this.checkErrorTip.materials.is_show = false;
    this.checkErrorTip.description.is_show = false;
  }


  // 获取标签
  getCreativLabelList() {
    this.launchRpaService
      .getCreativeTagList({
        chan_pub_id: this.defaultData.chan_pub_id_lst
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

  // 获取优化目标
  getOcpxActionList() {
    this.launchRpaService
      .getOcpxActionList({
        chan_pub_id: this.defaultData.chan_pub_id_lst
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.curAccountsList.forEach(item => {
              item.ocpxActionList = results['data'][item.id];
            });
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 获取按钮文字
  getActionBarList() {
    if (this.campaignData.type && this.defaultData.chan_pub_id_lst) {
      this.launchRpaService.getActionBarListNiu({
        campaign_type: this.campaignData.type,
        merchant_item_put_type: this.adgroupData.merchant_item_put_type,
        ocpx_action_type: this.adgroupData.ocpx_action_type
      }).subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.actionBarList = results['data'];
          } else {
            this.actionBarList = [];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
    }

  }
  // 获取推荐文字
  getExposeTagList() {
    this.launchRpaService.getExposeTagListNiu().subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          this.exposeTagList = results['data'];
        } else {
          this.exposeTagList = [];
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
  getCreativeCategoryList() {
    this.launchRpaService
      .getCreativeCategoryList({
        chan_pub_id: this.defaultData.chan_pub_id_lst
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.creativeCategoryList = results['data'];
          } else {
            this.creativeCategoryList = [];
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

    //直投直播-清空materialData数据
    if (this.campaignData.type === 14 && this.adcreativeData.live_creative_type === 1) {
      this.materialData.material_type_lst['custom_creative'] = { description: [], materials_list: [[],] };
      this.materialData.material_type_lst['program_creative'] = { materials_list: [{ materials: [], description: [], cover_cfg: 1, cover_slogans: [], sticker_styles: [], sticker_styles_sub: deepCopy(this.structConfig.program_creative.sticker_styles.sub) }] };
      this.adcreativeData.recommendation = '';
      this.adcreativeData.new_expose_tag.length = 0;
      this.adcreativeData.action_bar = '';
    }

    this.defaultData['template_struct']['campaign'] = this.campaignData;
    this.defaultData['template_struct']['adgroup'] = this.adgroupData;
    this.defaultData['template_struct']['creative'] = this.adcreativeData;
    this.defaultData['template_struct']['material'] = this.materialData;

    const resultData = deepCopy(this.defaultData);

    if (this.curAccountsList.length > 0 && this.adgroupData.bid_type == 10) {
      resultData['template_struct']['adgroup']['shopping_car_product_id'] = {};
      resultData['template_struct']['adgroup']['item_id'] = {};

      this.curAccountsList.forEach(item => {
        resultData['template_struct']['adgroup']['shopping_car_product_id'][item.id] = item['shopping_car_product_id']['item_id'];
        resultData['template_struct']['adgroup']['item_id'][item.id] = item['item_id']['item_id'];
      });
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

    resultData.project_id = this.data.project_id;
    resultData.landing_type = resultData['template_struct']['campaign']['type'];

    resultData['template_struct']['adgroup']['start_time_str'] = formatDate(new Date(resultData['template_struct']['adgroup'].time_range[0]), 'yyyy-MM-dd');

    if (this.adgroupData.launch_date === 2) {
      resultData['template_struct']['adgroup']['end_time_str'] = formatDate(new Date(resultData['template_struct']['adgroup'].time_range[1]), 'yyyy-MM-dd');
    } else if (this.adgroupData.launch_date === 1) {
      resultData['template_struct']['adgroup']['end_time_str'] = '';
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
    if (!this.defaultData.project_template_name.trim()) {
      this.checkErrorTip.project_template_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.project_template_name.is_show = false;
    }

    // 计划名称
    const campaignNameLength = getStringLength(this.campaignData.pub_campaign_name, []);
    if (campaignNameLength < 1 || campaignNameLength > 50) {
      this.checkErrorTip.pub_campaign_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.pub_campaign_name.is_show = false;
    }

    // 计划预算 - 统一预算
    if (this.campaignData.budget_type === 1 && !this.campaignData.budget) {
      this.checkErrorTip.budget.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.budget.is_show = false;
    }

    // 商品
    if (this.curAccountsList.length > 0) {
      this.curAccountsList.forEach(item => {
        // 小店推广商品
        if (this.campaignData.type === 13 && this.adgroupData.merchant_item_put_type === 0 && !item.item_id.item_id) {
          this.checkErrorTip.item_id.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.item_id.is_show = false;
        }

        // 短视频挂小黄车
        if (this.campaignData.type === 14 && this.adgroupData.shopping_car_product_type === 1 && !item.shopping_car_product_id.item_id) {
          this.checkErrorTip.shopping_car_product_id.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.shopping_car_product_id.is_show = false;
        }
      });
    }

    // 基础定向
    if (!this.adgroupData.parent_audience_template_id) {
      this.checkErrorTip.parent_audience_template_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.parent_audience_template_id.is_show = false;
    }

    // 定向列表
    if (this.adgroupData.audience_template_id_lst['all'].length <= 0) {
      this.checkErrorTip.audience_template_id_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.audience_template_id_lst.is_show = false;
    }

    // 日预算
    if (this.adgroupData.day_budget_type === 0 && !this.adgroupData.day_budget) {
      this.checkErrorTip.day_budget.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.day_budget.is_show = false;
    }

    // 成本上限cpa_bid
    if (this.adgroupData.speed === 1 && this.adgroupData.ocpx_action_type !== 192 && !this.adgroupData.cpa_bid) {
      this.checkErrorTip.cpa_bid.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.cpa_bid.is_show = false;
    }

    // ROI系数roi_ratio
    if (this.adgroupData.speed === 1 && this.adgroupData.ocpx_action_type === 192 && !this.adgroupData.roi_ratio) {
      this.checkErrorTip.roi_ratio.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.roi_ratio.is_show = false;
    }

    // 投放时段
    if (this.adgroupData.launch_date !== 0 && this.adgroupData.schedule_time === 2 && !this.adgroupData.time_series.includes('1')) {
      this.checkErrorTip.time_series.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.time_series.is_show = false;
    }


    // 广告组名称
    if (!this.adgroupData.pub_adgroup_name.trim()) {
      this.checkErrorTip.pub_adgroup_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.pub_adgroup_name.is_show = false;
    }

    // 投放位置
    if (this.adgroupData.scene_id.length === 0) {
      this.checkErrorTip.scene_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.scene_id.is_show = false;
    }

    // 非直播直投
    if (!(this.campaignData.type === 14 && this.adcreativeData.live_creative_type == 1)) {
      // 素材类型
      if (!this.adcreativeData.creative_material_type) {
        this.checkErrorTip.creative_material_type.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.creative_material_type.is_show = false;
      }

      // 按钮文字
      if (!this.adcreativeData.action_bar) {
        this.checkErrorTip.action_bar.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.action_bar.is_show = false;
      }


      //程序化创意2.0
      if (this.campaignData.type === 13 && this.adgroupData.unit_type === 7) {
        this.materialData.material_type_lst.program_creative.materials_list.forEach((element, index) => {
          // 创意组
          this.checkErrorTip.program_creative_list[index].program_creative.is_show = false;

          //素材选取-素材库
          if (element.materials.length === 0 || element.materials.length > 5) {
            this.checkErrorTip.program_creative_list[index].materials.is_show = true;
            this.checkErrorTip.program_creative_list[index].program_creative.is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.program_creative_list[index].materials.is_show = false;
          }

          // 作品标题
          if (element.description.length === 0 || element.description.length > 3) {
            this.checkErrorTip.program_creative_list[index].description.is_show = true;
            this.checkErrorTip.program_creative_list[index].program_creative.is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.program_creative_list[index].description.is_show = false;
          }

          // 封面广告语
          if (element.cover_slogans.length > 6) {
            this.checkErrorTip.program_creative_list[index].cover_slogans.is_show = true;
            this.checkErrorTip.program_creative_list[index].program_creative.is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.program_creative_list[index].cover_slogans.is_show = false;
          }

          // 贴纸
          if (element.sticker_styles.length === 0 || element.sticker_styles.length > 6) {
            this.checkErrorTip.program_creative_list[index].sticker_styles.is_show = true;
            this.checkErrorTip.program_creative_list[index].program_creative.is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.program_creative_list[index].sticker_styles.is_show = false;
          }
        });

      } else {//自定义创意

        // 单广告组素材数
        if (!this.materialData.single_adgroup_material_num) {
          this.checkErrorTip.single_adgroup_material_num.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.single_adgroup_material_num.is_show = false;
        }

        // 单广告组标题数
        if (!this.materialData.single_adgroup_title_num) {
          this.checkErrorTip.single_adgroup_title_num.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.single_adgroup_title_num.is_show = false;
        }

        // 创意制作-创意组
        if (this.materialData.material_type_lst['custom_creative'].materials_list.length === 0) {
          this.checkErrorTip.materials.tip_text = '至少添加一个创意组';
          this.checkErrorTip.materials.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.materials.is_show = false;
          // 创意制作-素材
          const materialList = [];
          for (const s_item of this.materialData.material_type_lst['custom_creative'].materials_list) {
            if ((s_item.length === 0 || s_item.length > this.materialData.single_creative_material_num)) {
              materialList.push(true);
            }
          }
          if (materialList.some((item) => item)) {
            this.checkErrorTip.materials.tip_text = `每个创意组的视频不能为空，且最多选${this.materialData.single_creative_material_num}个`;
            this.checkErrorTip.materials.is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.materials.is_show = false;
          }
        }


        // 作品标题
        if (!this.materialData.by_material_set_title) {
          // 不分素材选标题
          if (this.materialData.material_type_lst.custom_creative.description.length === 0) {
            this.checkErrorTip.description.tip_text = '作品标题不能为空';
            this.checkErrorTip.description.is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.description.is_show = false;
          }
        } else {
          // 分素材选标题
          if (this.materialData.material_type_lst['custom_creative'].materials_list.length > 0) {

            const materialTitleList = [];
            for (const s_item of this.materialData.material_type_lst['custom_creative'].materials_list) {
              if (s_item.length > 0) {
                for (const iterator of s_item) {
                  if ((iterator['description'].length === 0 || iterator['description'].length > 1)) {
                    materialTitleList.push(true);
                  }
                }
              }
            }
            if (materialTitleList.some((item) => item)) {
              this.checkErrorTip.material_title_lst.is_show = true;
              isValid = true;
            } else {
              this.checkErrorTip.material_title_lst.is_show = false;
            }
          }
        }

        // 商品推荐语
        if (this.campaignData.type === 13) {
          // 短视频推广-商品推荐语
          if (this.adgroupData.merchant_item_put_type === 0 && this.adgroupData.item_id && (!this.adcreativeData.recommendation || this.adcreativeData.recommendation.length > 10)) {
            this.checkErrorTip.recommendation.is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.recommendation.is_show = false;
          }
        } else if (this.campaignData.type === 14) {
          // 直播推广-商品推荐语
          if (this.adgroupData.shopping_car_product_type === 1 && this.adgroupData.shopping_car_product_id && (!this.adcreativeData.recommendation || this.adcreativeData.recommendation.length > 10)) {
            this.checkErrorTip.recommendation.is_show = true;
            isValid = true;

          } else {
            this.checkErrorTip.recommendation.is_show = false;
          }
        }





      }

    }


    // 创意名称
    if (this.adcreativeData.pub_creative_name.length <= 0) {
      this.checkErrorTip.pub_creative_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.pub_creative_name.is_show = false;
    }

    return isValid;
  }

  // 添加商品
  openGoods(goodsKey, curAccount) {
    const drawerRef = this.drawerService.create<AddGoodsListDrawerComponent>({
      nzTitle: '添加商品',
      nzWidth: '70%',
      nzContent: AddGoodsListDrawerComponent,
      nzContentParams: {
        goodsKey: goodsKey,
        curAccount: curAccount
      }
    });

    drawerRef.afterClose.subscribe(data => {
      if (data === 'onSuccess') {
        this.adgroupData[goodsKey] = true;

        // 商品错误验证
        if (this.curAccountsList.length > 0) {
          this.curAccountsList.forEach(item => {
            this.getItemErrorTip(goodsKey, item[goodsKey].item_id)
          });
        }
      }
    });

  }

  //修改转化目标
  changeOcpxActionType() {
    // 粉丝关注-成本保护
    if (this.adgroupData.ocpx_action_type === 72) {
      this.adgroupData.speed = 1;
    }
    // 获取行动号召按钮
    this.getActionBarList();
    this.adcreativeData.action_bar = '';
  }

  // 切换营销目标
  changeType() {
    this.adgroupData.unit_type = 4;//创意制作方式-置为自定义

    if (this.campaignData.type === 14) {
      this.changeShoppingCarProductId();
    } else if (this.campaignData.type === 13) {
      this.changeMerchantItemPutType();
    }
    this.changeObjectType();
  }

  // 修改转化途径
  changeMerchantItemPutType() {
    this.getOcpxActionTypesSub();
    this.adgroupData.ocpx_action_type = this.ocpxActionTypesSub[0]?.value;
    //获取行动号召按钮
    this.getActionBarList();
    this.adcreativeData.action_bar = '';
  }
  // 修改商品挂小黄车
  changeShoppingCarProductId() {
    this.getOcpxActionTypesSub();
    this.adgroupData.ocpx_action_type = this.ocpxActionTypesSub[0]?.value;

    //修改创意样式
    this.adcreativeData.live_creative_type = this.adgroupData.shopping_car_product_type === 1 ? 2 : 1;
  }

  // 获取转化目标
  getOcpxActionTypesSub() {
    this.ocpxActionTypesSub.length = 0;
    if (this.campaignData.type === 14) {
      this.structConfig['adgroup']['ocpx_action_type']['sub'].forEach(element => {
        if (this.adgroupData.shopping_car_product_type === 1) {
          if ([395, 192, 72].indexOf(element.value) !== -1) {
            this.ocpxActionTypesSub.push(element);
          }
        } else if (this.adgroupData.shopping_car_product_type === 2) {
          if ([395, 192, 72, 740].indexOf(element.value) !== -1) {
            this.ocpxActionTypesSub.push(element);
          }
        }
      });
    } else if (this.campaignData.type === 13) {
      this.structConfig['adgroup']['ocpx_action_type']['sub'].forEach(element => {
        if (this.adgroupData.merchant_item_put_type === 0) {
          if ([395, 192, 72].indexOf(element.value) !== -1) {
            this.ocpxActionTypesSub.push(element);
          }
        } else if (this.adgroupData.merchant_item_put_type === 2) {
          if ([72].indexOf(element.value) !== -1) {
            this.ocpxActionTypesSub.push(element);
          }
        }
      });
    }
  }
  // 改变日预算
  changeDayBudget() {
    if (this.adgroupData.day_budget_type !== 0) {
      this.adgroupData.day_budget = this.adgroupData.day_budget_type;
    } else {
      this.adgroupData.day_budget = 300;
    }
  }

  // 根据id获取商品详情
  getItemInfoById(goodsKey, itemId, curAccount) {
    this.launchRpaService.getJinNiuItemInfoById({
      chan_pub_id: curAccount.id,
      item_id: itemId
    }).subscribe((results: any) => {
      if (results.status_code && results.status_code !== 200) {
        Object.assign(curAccount[goodsKey], {});
        if (results.status_code !== 205) {
          this.message.error(results.message);
        }
      } else {
        Object.assign(curAccount[goodsKey], results.data);
      }
    },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => {
      },
    );

  }
  // 多选框选项修改
  updateSingleChecked(data, type) {
    if (type === 'scene_id') {
      this.adgroupData.scene_id.length = 0;
      data.forEach(item => {
        if (item.checked) {
          this.adgroupData.scene_id.push(item.value);
        }
      });
      // 投放位置非空验证
      this.getItemErrorTip('scene_id', this.adgroupData.scene_id)
    }
  }


  // 添加占位符
  addTags(value, type) {
    const tagValueLength = value.length + 2;
    let curInput;
    if (type === 'campaign') {
      curInput = this.curCampaignTextArea.nativeElement;
    } else if (type === 'adgroup') {
      curInput = this.curAdgroupTextArea.nativeElement;
    } else if (type === 'creative') {
      curInput = this.curCreativeTextArea.nativeElement;
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
    } else if (type === 'creative') {
      this.adcreativeData.pub_creative_name = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
      curInput.value = this.adcreativeData.pub_creative_name;
      this.getItemErrorTip('pub_creative_name', this.adcreativeData.pub_creative_name);
    }

    this.cursorPosition += tagValueLength;
    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核
    } else {
      curInput.select();
      curInput.selectionStart = this.cursorPosition;
      curInput.selectionEnd = this.cursorPosition;
    }
  }

  // 获取占位符词组
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
            this.creativeWordList = results['data']['creative'];

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

  // 回写多选框状态
  refreshCheckedStatus(data, checkedValues) {
    const checkedObj = {};
    checkedValues.forEach(value => {
      checkedObj[JSON.stringify(value)] = '值：' + value;
    });
    data.forEach(item => {
      if (checkedObj[JSON.stringify(item.value)]) {
        item.checked = true
      } else {
        item.checked = false;
      }
    });
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
  // 贴纸选项更新
  refreshStickerStylesSub() {
    if (this.structConfig?.program_creative?.sticker_styles?.sub) {
      this.materialData.material_type_lst['program_creative']['materials_list'].forEach(element => {
        element.sticker_styles_sub = deepCopy(this.structConfig.program_creative.sticker_styles.sub);
        this.refreshCheckedStatus(element.sticker_styles_sub, element.sticker_styles);
      });
    }
  }
}




