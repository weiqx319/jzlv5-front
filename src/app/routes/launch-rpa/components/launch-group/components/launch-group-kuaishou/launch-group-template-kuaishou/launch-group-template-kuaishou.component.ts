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
import { GlobalTemplateComponent } from "../../../../../../../shared/template/global-template/global-template.component";
import { LaunchService } from "../../../../../../../module/launch/service/launch.service";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { MenuService } from "../../../../../../../core/service/menu.service";
import { deepCopy, formatDate, isArray } from "@jzl/jzl-util";
import { differenceInCalendarDays, format } from "date-fns";
import { LaunchMaterialVideoModalComponent } from "../../../../../modal/launch-material-video-modal/launch-material-video-modal.component";
import { isObject } from "@jzl/jzl-util";
import { LaunchMaterialImageModalComponent } from "../../../../../modal/launch-material-image-modal/launch-material-image-modal.component";
import { LaunchTitleModalComponent } from "../../../../../modal/launch-title-modal/launch-title-modal.component";
import { UploadImageMaterialsComponent } from "../../../../../modal/upload-image-materials/upload-image-materials.component";
import { LaunchMaterialCoverModalComponent } from "../../../../../modal/launch-material-cover-modal/launch-material-cover-modal.component";
import { getStringLength } from "../../../../../../../shared/util/util";

@Component({
  selector: 'app-launch-group-template-kuaishou',
  templateUrl: './launch-group-template-kuaishou.component.html',
  styleUrls: ['./launch-group-template-kuaishou.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchGroupTemplateKuaishouComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  @ViewChild('curCampaignTextArea') curCampaignTextArea: ElementRef;
  @ViewChild('curAdgroupTextArea') curAdgroupTextArea: ElementRef;


  @Output() cancel = new EventEmitter<any>();

  @Input() accountsList;

  @Input() data;

  @Input() isEdit;

  @Input() projectTemplateId;

  @Input() isCopy;

  public curAccountsList = [];
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
      name: '计划',
      sub: [
        { key: '#promotion_objective', name: '计划类型' },
        { key: '#adgroup_name', name: '名称' },
        { key: '#budget', name: '预算' },
      ]
    },
    {
      key: '#adgroup_start',
      name: '广告',
      sub: [
        { key: '#launch_objective', name: '投放目标' },
        { key: '#user_target', name: '用户定向' },
        { key: '#budget_and_bid', name: '优化与出价' },
        { key: '#bid_and_budget', name: '排期与预算' },
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
    }
  ];
  public plan_type = {
    '2': "提升应用安装",
    '3': "获取电商下单",
    '4': "推广品牌活动",
    '5': "收集销售线索",
    '7': "提高应用活跃"
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
    campaign_type: null,  // 计划类型
    type: null,  // 推广目标类型
    budget_type: 0,  // 日预算类型
    budget: 50,   // 计划日预算
    day_budget_schedule: [],
    campaign_select: "create",   // 计划选择
    campaign_name: "",  // 计划名称
  };

  public adgroupData = {
    unit_name: '',//广告名称
    speed: 1,   // 投放方式
    scene_id: 1,//投放范围
    parent_audience_template_id: "",  // 父级定向
    first_day_begin_time: "",  // 首日开始投放时间：HH:mm:ss
    bid: 50,   // 广告出价
    cpa_bid: 50,   // 转化目标出价
    roi_ratio: 50,//ROI系数
    budget: 50,   // 预算
    day_budget: 100,
    day_budget_schedule: [],
    audience_template_id_lst: { all: [] },  // 分渠道定向
    begin_time: "",  // 开始投放日期
    time_series: "",  // 投放时间段
    end_time: "",  // 结束投放日期
    unit_type: 4,  // 创意展示类型
    show_mode: 1,  // 创意类型
    // ocpx_action_type: null,  // 优化目标
    audience_by_convert_channel: false,  // 分渠道设置定向
    bid_type: 2,  // 出价方式
    deep_conversion_type: "",  // 深度优化类型
    deep_bid_amount: "",   // 深度出价
    schedule_date: "long_term_launch",  // 投放日期
    time_range: [new Date(), new Date()],  // 起始时间
    target_time: 1,  // 投放时段类型   schedule_time指定时间段    nolimt不限
    deep_conversion_spec_type: false, // 深度优化转化是否开启
    budget_type: 0,  // 广告日预算
  };

  public adcreativeData = {
    creative_name: "",//创意名称
    action_bar_text: "",//行动号召按钮文案
    description: "",//广告语
    short_slogan: "",//便利贴创意短广告
    sticker_title: "",//封面广告语标题
    overlay_type: 1,// 贴纸样式类型,
    expose_tag: [],//推荐理由
    creative_category_list: {},// 创意分类
    creative_tag_label: [],
    creative_tag: [],// 创意标签
    creative_material_type: null,  // 创意形式
  };

  public materialData = {
    by_material_set_title: false,
    single_adgroup_title_num: 1,
    material_type_lst: {
      all: { materials: [], short_slogan: [], description: [] },
    },
    by_channel_set_material: false,
    single_adgroup_material_num: 1
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
      "label": "短广告语",
      "key": "short_slogan",
      "parent_name": "",
      "required": true,
      "restriction": {
        "max_length": 8,
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
    chan_pub_id_lst: {
      is_show: false,
      tip_text: '账号必填',
    },
    project_template_name: {
      is_show: false,
      tip_text: '模板名称必填',
    },
    type: {
      is_show: false,
      tip_text: '计划类型必填',
    },
    convert_channel_id_lst: {
      is_show: false,
      tip_text: '渠道号必填',
    },
    campaign_name: {
      is_show: false,
      tip_text: '计划名称必填',
    },
    unit_name: {
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
    ocpx_action_type: {
      is_show: false,
      tip_text: '优化目标必填',
    },
    goal: {
      is_show: false,
      tip_text: '深度优化目标必填',
    },
    creative_material_type: {
      is_show: false,
      tip_text: '创意形式必填',
    },
    action_bar_text: {
      is_show: false,
      tip_text: '按钮文案必填',
    },
    creative_name: {
      is_show: false,
      tip_text: '创意名称必填',
    },
    creative_tag: {
      is_show: false,
      tip_text: '标签必填',
    },
    creative_category_list: {
      is_show: false,
      tip_text: '创意分类必填',
    },
    material_lst: {
      is_show: false,
      tip_text: '请根据渠道号分别选择素材',
    },
    title_lst: {
      is_show: false,
      tip_text: '请根据渠道号分别选择短广告语，如有长短广告语，数量须保持一致',
    },
    description_lst: {
      is_show: false,
      tip_text: '请根据渠分别道号选择长广告语，如有长短广告语，数量须保持一致',
    },
    material_title_lst: {
      is_show: false,
      tip_text: '请根据渠道号选择素材,素材下广告语不能为空，如有长短广告语，数量须保持一致'
    },
    budget: {
      is_show: false,
      tip_text: '统一预算不能为空'
    },
    bid: {
      is_show: false,
      tip_text: '点击出价不能为空'
    },
    cpa_bid: {
      is_show: false,
      tip_text: '转化目标出价不能为空'
    },
    day_budget: {
      is_show: false,
      tip_text: '统一预算不能为空'
    },
    // 投放时段-特定时间
    time_series: {
      is_show: false,
      tip_text: '请选择特定时间或全天',
    },
    single_adgroup_material_num: {
      is_show: false,
      tip_text: '单计划素材数必填',
    },
    single_adgroup_title_num: {
      is_show: false,
      tip_text: '单计划标题数必填',
    },
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
    this.getStructConfigByKs();
    this.getCreativLabelList();
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

            if (results['data']['template_struct']['adgroup']['ocpx_action']) {
              const actionData = results['data']['template_struct']['adgroup']['ocpx_action'];
              for (const item of Object.keys(actionData)) {
                const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
                if (index !== -1 && !this.curAccountsList.find(s_item => s_item.id === item)) {
                  const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, ocpx_action_type: actionData[item]['ocpx_action_type'] };
                  this.curAccountsList.push(obj);
                  this.getOcpxActionList();
                }
              }
            }

            if (this.isCopy) {
              this.defaultData.project_template_name = this.defaultData.project_template_name + '-复制';
            }
            this.getActionBarList();
            this.getChannelList();
            this.getBasicTargetList();
            this.getExposeTagList();
            this.getCreativeCategoryList();


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
          short_slogan: [],
          description: []
        };
      }

    });
    if (this.adgroupData.parent_audience_template_id) {
      this.getChildTargetList(this.adgroupData.parent_audience_template_id);
    }

  }

  // 获取配置
  getStructConfigByKs() {
    this.launchRpaService
      .getStructConfigByKs({
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
    this.getItemErrorTip('convert_channel_id_lst', this.defaultData.convert_channel_id_lst);
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

    this.launchRpaService.getChannelListByKs({ pConditions: allpConditions }, {
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
      if (data && data.children && !childData && item.campaign_type == this.campaignData.type) {
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
    this.getActionBarList();
    this.getChannelList('clear');

    this.curBasicTarget = deepCopy(this.basicTargetList.filter(item => item.landing_type == this.campaignData.type));
    this.adgroupData.parent_audience_template_id = null;
    this.curTargetList = [];
    this.launchTargetPackage = [];
    this.allTargetChecked = false;
    this.getItemErrorTip('type', this.campaignData.type);
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
      .getTargetBasicListByKs({
        cid: this.cid,
      }, { result_model: 'all', })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.basicTargetList = [];
          } else {
            this.basicTargetList = results['data'];
            // this.curBasicTarget = deepCopy(results['data']['detail']);
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
      .getTargetListByKs(id, {
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
            this.curAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, ocpx_action_type: null, ocpxActionList: [] });
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
    this.getChannelList('clear');
    this.getExposeTagList();
    this.getCreativeCategoryList();
    this.getActionBarList();
    if (ids.length > 0) {
      ids.forEach((item, index) => {
        const data = this.accountsList.find(value => value.chan_pub_id === item);
        if (data && !this.curAccountsList.find(s_item => s_item.id === item)) {
          this.curAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, ocpx_action_type: null, ocpxActionList: [] });
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

    this.materialData.material_type_lst['all'] = { materials: [], short_slogan: [], description: [] };
    this.targetChannelList.forEach(item => {
      this.materialData.material_type_lst[item.convert_channel_id] = {
        materials: [],
        short_slogan: [],
        description: []
      };
    });

    this.materialData.by_material_set_title = false;
    this.materialData.single_adgroup_title_num = 1;
    this.materialData.by_channel_set_material = false;
    this.materialData.single_adgroup_material_num = 1;
    this.adcreativeData.creative_tag = [];
    this.adcreativeData.creative_category_list = {};
    this.adcreativeData.creative_tag_label = [];
    this.adcreativeData.action_bar_text = "";
    this.adcreativeData.creative_name = "";
    this.adcreativeData.expose_tag = [];
    this.getItemErrorTip('creative_material_type', this.adcreativeData.creative_material_type);
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
      this.launchRpaService
        .getActionBarList({
          type: this.campaignData.type,
          chan_pub_id: this.defaultData.chan_pub_id_lst
        })
        .subscribe(
          (results: any) => {
            if (results.status_code === 200) {
              this.actionBarList = results['data']['action_bar_text'];
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
    this.launchRpaService
      .getExposeTagList({
        chan_pub_id: this.defaultData.chan_pub_id_lst
      })
      .subscribe(
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

    this.defaultData['template_struct']['campaign'] = this.campaignData;
    this.defaultData['template_struct']['adgroup'] = this.adgroupData;
    this.defaultData['template_struct']['creative'] = this.adcreativeData;
    this.defaultData['template_struct']['material'] = this.materialData;

    const resultData = deepCopy(this.defaultData);

    if (this.curAccountsList.length > 0 && this.adgroupData.bid_type == 10) {
      resultData['template_struct']['adgroup']['ocpx_action'] = {};
      this.curAccountsList.forEach(item => {
        resultData['template_struct']['adgroup']['ocpx_action'][item.id] = {
          ocpx_action_type: item.ocpx_action_type ? item.ocpx_action_type : 0,
        };
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

    for (const item of Object.keys(resultData['template_struct'].material.material_type_lst)) {
      if (resultData['template_struct'].material.by_channel_set_material) {
        delete resultData['template_struct'].material.material_type_lst['all'];
      } else {
        if (item !== 'all') {
          delete resultData['template_struct'].material.material_type_lst[item];
        }
      }
    }

    resultData.project_id = this.data.project_id;
    resultData.landing_type = resultData['template_struct']['campaign']['type'];

    resultData['template_struct']['creative']['creative_category'] = this.adcreativeData.creative_category_list;
    resultData['template_struct']['adgroup']['begin_time'] = formatDate(new Date(resultData['template_struct']['adgroup'].time_range[0]), 'yyyy-MM-dd');

    if (this.adgroupData.schedule_date === 'appoint_launch') {
      resultData['template_struct']['adgroup']['end_time'] = formatDate(new Date(resultData['template_struct']['adgroup'].time_range[1]), 'yyyy-MM-dd');
    } else {
      resultData['template_struct']['adgroup']['end_time'] = '';
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

    // 计划类型
    if (!this.campaignData.type) {
      this.checkErrorTip.type.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.type.is_show = false;
    }

    // 渠道号
    if (this.defaultData.convert_channel_id_lst.length <= 0) {
      this.checkErrorTip.convert_channel_id_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.convert_channel_id_lst.is_show = false;
    }


    // 计划名称
    const campaignNameLength = getStringLength(this.campaignData.campaign_name, []);
    if (campaignNameLength < 1 || campaignNameLength > 50) {
      this.checkErrorTip.campaign_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.campaign_name.is_show = false;
    }
    // 预算- 统一预算
    if (this.campaignData.budget_type === 1 && !this.campaignData.budget) {
      this.checkErrorTip.budget.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.budget.is_show = false;
    }
    // 广告名称
    const unitNameLength = getStringLength(this.adgroupData.unit_name, []);
    if (unitNameLength < 1 || unitNameLength > 50) {
      this.checkErrorTip.unit_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.unit_name.is_show = false;
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


    // if(this.adgroupData.bid_type === 10) {
    //   // 优化目标
    //   if(!this.adgroupData.ocpx_action_type) {
    //     this.checkErrorTip.ocpx_action_type.is_show = true;
    //     isValid = true;
    //   } else {
    //     this.checkErrorTip.ocpx_action_type.is_show = false;
    //   }
    //
    // }

    // 点击出价
    if ((this.adgroupData.bid_type == 1 || this.adgroupData.bid_type == 2) && !this.adgroupData.bid) {
      this.checkErrorTip.bid.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.bid.is_show = false;
    }
    // 点击出价
    if (this.adgroupData.bid_type == 10 && !this.adgroupData.cpa_bid) {
      this.checkErrorTip.cpa_bid.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.cpa_bid.is_show = false;
    }

    // 广告日预算- 统一预算
    if (this.adgroupData.budget_type === 1 && !this.adgroupData.day_budget) {
      this.checkErrorTip.day_budget.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.day_budget.is_show = false;
    }

    // 投放时段
    if (this.adgroupData.target_time === 2 && !this.adgroupData.time_series.includes('1')) {
      this.checkErrorTip.time_series.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.time_series.is_show = false;
    }

    // 创意形式
    if (!this.adcreativeData.creative_material_type) {
      this.checkErrorTip.creative_material_type.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.creative_material_type.is_show = false;
    }

    // 按钮文字
    if (!this.adcreativeData.action_bar_text) {
      this.checkErrorTip.action_bar_text.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.action_bar_text.is_show = false;
    }
    // 创意名称
    if (this.adcreativeData.creative_name.length <= 0) {
      this.checkErrorTip.creative_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.creative_name.is_show = false;
    }

    // 标签
    if (this.adcreativeData.creative_tag.length <= 0) {
      this.checkErrorTip.creative_tag.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.creative_tag.is_show = false;
    }
    // 分类
    if (!this.adcreativeData.creative_category_list) {
      this.checkErrorTip.creative_category_list.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.creative_category_list.is_show = false;
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
                if ((this.adcreativeData.creative_material_type == 4 && s_item.short_slogan.length <= 0) || (s_item.description.length <= 0) || (this.adcreativeData.creative_material_type == 4 && s_item.short_slogan.length !== s_item.description.length)) {
                  materialTitleList.push(true);
                }
              }
            }
          } else {
            if (this.materialData.material_type_lst[item].materials.length <= 0) {
              materialList.push(true);
            }

            if (this.adcreativeData.creative_material_type == 4 && this.materialData.material_type_lst[item].short_slogan.length !== this.materialData.material_type_lst[item].description.length) {
              titleList.push(true);
            }

            if ((this.adcreativeData.creative_material_type == 4 && this.materialData.material_type_lst[item].short_slogan.length !== this.materialData.material_type_lst[item].description.length) || this.materialData.material_type_lst[item].description.length < 1) {
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
            if ((this.adcreativeData.creative_material_type == 4 && s_item.short_slogan.length <= 0) || s_item.description.length <= 0 || (this.adcreativeData.creative_material_type == 4 && s_item.short_slogan.length !== s_item.description.length)) {
              materialTitleList.push(true);
            }
          }
        }
      } else {
        if (this.materialData.material_type_lst['all'].materials.length <= 0) {
          materialList.push(true);
        }

        if ((this.adcreativeData.creative_material_type == 4 && this.materialData.material_type_lst['all'].short_slogan.length !== this.materialData.material_type_lst['all'].description.length)) {
          titleList.push(true);
        }

        if ((this.adcreativeData.creative_material_type == 4 && this.materialData.material_type_lst['all'].short_slogan.length !== this.materialData.material_type_lst['all'].description.length) || this.materialData.material_type_lst['all'].description.length < 1) {
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
        this.checkErrorTip.title_lst.tip_text = '请选择短广告语，如有长短广告语，数量须保持一致';
      } else {
        this.checkErrorTip.title_lst.tip_text = '请根据渠道号分别选择短广告语，如有长短广告语，数量须保持一致';
      }
      this.checkErrorTip.title_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.title_lst.is_show = false;
    }

    if (descriptionList.some((item) => item)) {
      if (!this.materialData.by_channel_set_material) {
        this.checkErrorTip.description_lst.tip_text = '请选择长广告语，如有长短广告语，数量须保持一致';
      } else {
        this.checkErrorTip.description_lst.tip_text = '请根据渠分别道号选择长广告语，如有长短广告语，数量须保持一致';
      }
      this.checkErrorTip.description_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.description_lst.is_show = false;
    }

    if (materialTitleList.some((item) => item)) {
      if (!this.materialData.by_channel_set_material) {
        this.checkErrorTip.material_title_lst.tip_text = '请选择素材，素材下广告语不能为空，如有长短广告语，数量须保持一致';
      } else {
        this.checkErrorTip.material_title_lst.tip_text = '请根据渠道号选择素材,素材下广告语不能为空，如有长短广告语，数量须保持一致';
      }
      this.checkErrorTip.material_title_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.material_title_lst.is_show = false;
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
