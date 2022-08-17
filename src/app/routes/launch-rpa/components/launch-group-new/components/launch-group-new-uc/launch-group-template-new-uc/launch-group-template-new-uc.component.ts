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
import { getStringLength, getStringLengthNew } from "../../../../../../../shared/util/util";
import { isArray, isObject } from "@jzl/jzl-util";

import { deepCopy } from '@jzl/jzl-util';
import { LaunchMaterialCoverModalComponent } from "../../../../../modal/launch-material-cover-modal/launch-material-cover-modal.component";
import { MenuService } from "../../../../../../../core/service/menu.service";
import { UploadImageMaterialsComponent } from "../../../../../modal/upload-image-materials/upload-image-materials.component";
import { promise } from 'selenium-webdriver';

@Component({
  selector: 'app-launch-group-template-new-uc',
  templateUrl: './launch-group-template-new-uc.component.html',
  styleUrls: ['./launch-group-template-new-uc.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchGroupTemplateNewUcComponent implements OnInit {
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
        { key: '#user_target', name: '用户定向' },
        { key: '#launch_range', name: '投放范围' },
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
  public isDeepSingle = false;
  public defaultData = {
    project_id: "",
    chan_pub_id_lst: [],  // 账户
    project_template_name: "",  // 模板名称
    convert_channel_id_lst: [],
    landing_type: "1",  // 推广目的

    template_struct: {
      campaign: {
        campaign_name: "",   // 广告组名称
        campaign_select: "create",  // 广告组选择  exist 已有  create 新建
        campaign_budget_mode: "nolimt",   // nolimt 不限  budget 日预算
        campaign_budget: 0,  // 预算
      },
      adgroup: {
        url_select: "local",  //  media 媒体   local 本地
        adgroup_name: "",   // 计划名称
        opt_target: 3,  // 优化目标
        delivery: 3,      //  投放方式
        budget: "",      //  预算
        charge_type: 1,     //  计费方式
        schedule_type: "now",      //  排期方式 date代表选择日期 ,now代表从今天开始
        schedule: "",     //  投放时段
        start_date: "",     // 排期开始时间
        end_date: "",     //  排期结束时间
        bid: "0.50",      //  出价
        skip_first_stage: 1,      //  智能出价
        enable_anxt: true,   //安心投
        deep_convert_type: 0,
        slot_bidding: 1,      //  最大化获量
        schedule_time_slt: "nolimit",   // 是否指定投放时段
        day_budget: "nolimit",  // 是否指定预算
        time_range: [new Date(), new Date()],  // 排期时间
        targeting_package_id: null,
        opt_bid: "1.00",      //  转化出价
        opt_did: "1.01",      //  深度转化出价
        roi_target: '1.00',
        parent_audience_template_id: null,  // 基础定向
        audience_by_convert_channel: false,  // 是否分渠道号
        bid_by_convert_channel: true,  // 是否分渠道号
        is_use_media_target_package: false,
        audience_template_id_lst: {     // 定向包列表
          all: [],
        },
        bid_by_channel_lst: {},
      },
      creative: {
        style: 1,     //  创意样式
        creative_material_mode: 'CUSTOM_CREATIVE', // CUSTOM_CREATIVE自定义 PROGRAMMATIC_CREATIVE程序化
        show_mode: 1,      //  展现方式
        click_monitor_url: "",      //  点击监测链接
        label: [],      //  创意标签
        source: "",     //  推广来源字符范围
        industry: [],     //  创意分类
        logo_image_id: "",     //  头像id
        imgUrl: "",   //  头像路径
        isHiddenSelect: false,
        brandMaterial: {},
        selectNum: "已选择0个",
        resultData: [],
      },
      material: {
        by_channel_set_material: false,   // 分渠道号选择素材
        by_material_set_title: false,   // 分素材选择标题
        single_adgroup_material_num: 1,
        single_adgroup_title_num: 1,
        screenshot_setting_type: "system",
        material_type_lst: {
          all: { materials: [], titles: [] },
        },
        by_creative_group_set_title:false,
        material_type_temp: {
          num: 10,
          titleNum: 8,
          curIndex: 0,
          limit: [
            {
              label: '图片',
              type: 'image',
              css_type: 1,
              list: [],
            },
            {
              label: '视频',
              type: 'video',
              css_type: 3,
              list: [],
            },
            {
              label: '三图',
              type: 'images',
              css_type: 2,
              list: [],
            },
          ],
          titles:[],
        },
        creative_group_lst:{
          all: { materials: [], titles: [] },
        }
      },
    }
  };

  public cid;

  public user_id;

  public publisherId;

  public channelTreeList = [];

  public basicTargetList = [];

  public curBasicTarget = [];

  public isChannelTree = true;

  public chan_pub_ids = [];

  public curChannelList = [];

  public launchTargetPackage = [];
  public launchMediaTargetPackage = [];

  public curTargetList: any[];
  public curMediaTargetList = [];
  public totalTargetList = 10;
  public _allChecked = false;

  public _indeterminate = false; // 表示有选中的，不管是全选还是选个别

  public curTargetIndex = 0;
  public curOptIndex = 0;

  public today = new Date();

  public structConfig: any = {};

  public structConfigLoading = true;

  public showCoefficient = false;

  public curDeliveryIndex = 0;

  public inputValue = "";

  public styleList = [
    {
      value: 1,
      label: '单图',
    },
    {
      value: 2,
      label: '三图',
    },
    {
      value: 3,
      label: '视频',
    },
    // {
    //   value: 7,
    //   label: 'Topview竖版视频（白名单）',
    // },
  ];

  public checkErrorTip = {
    chan_pub_id_lst: {
      is_show: false,
      tip_text: '账号不能为空',
    },
    project_template_name: {
      is_show: false,
      tip_text: '模板名称不能为空',
    },
    campaign_name: {
      is_show: false,
      tip_text: '推广组名称应为1-50字'
    },
    convert_channel_id_lst: {
      is_show: false,
      tip_text: '所选渠道号不能为空',
    },
    adgroup_name: {
      is_show: false,
      tip_text: '计划名称应为1-50字'
    },
    ad_name: {
      is_show: false,
      tip_text: '计划名称应为1-50字',
    },
    budget: {
      is_show: false,
      tip_text: '请输入正确的取值范围'
    }, // 日预算
    bid: {
      is_show: false,
      tip_text: '请输入正确的取值范围'
    }, // 出价
    opt_bid: {
      is_show: false,
      tip_text: '请输入正确的取值范围'
    },  // 转化出价
    opt_did: {
      is_show: false,
      tip_text: '请输入正确的取值范围'
    },  // 深度转化出价
    roi_target: {
      is_show: false,
      tip_text: '请输入正确的取值范围'
    },  // 深度转化出价
    parent_audience_template_id: {
      is_show: false,
      tip_text: '请选择基础定向',
    },
    targeting_package_id: {
      is_show: false,
      tip_text: '请选择基础定向',
    },
    audience_template_id_lst: {
      is_show: false,
      tip_text: '定向包列表不能为空',
    },
    bid_by_channel_lst: {
      is_show: false,
      tip_text: '定向包列表不能为空',
    },
    industry: {
      is_show: false,
      tip_text: '请选择正确的创意分类',
    },
    label: {
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
    logo_image_id: {
      is_show: false,
      tip_text: '请选择品牌头像'
    },
    source: {
      is_show: false,
      tip_text: '推广来源应为1-16字'
    },
    material_title_lst: {
      is_show: false,
      tip_text: '按素材选择标题，素材以及素材下标题不能为空'
    },
  };
  public targetChannelList = [];
  public getSouceLength = 0;

  public industryList: [];  // 创意分类列表
  public cursorPosition = 0;

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
    if (this.isEdit && this.projectTemplateId) {
      this.getProjectTemplate();
    } else {
      this.getChannelList();
      this.getBasicTargetList();
      this.getFeedStructConfigByUc();
    }
    this.getLaunchRpaWordList();
  }

  getProjectTemplate() {
    this.launchRpaService.getProjectTemplateDetail(this.projectTemplateId, {
      cid: this.cid,
      publisher_id: this.publisherId,
    })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            if (!results['data'].template_struct.material['material_type_temp']) {
              results['data'].template_struct.material['material_type_temp']=deepCopy(this.defaultData.template_struct.material.material_type_temp);
            }
            this.defaultData = deepCopy(results['data']);
            this.defaultData.template_struct.adgroup.is_use_media_target_package = this.defaultData.template_struct.adgroup.is_use_media_target_package ? this.defaultData.template_struct.adgroup.is_use_media_target_package : false;
            this.defaultData.template_struct.material.by_creative_group_set_title = this.defaultData.template_struct.material.by_creative_group_set_title ? this.defaultData.template_struct.material.by_creative_group_set_title : false;
            this.defaultData.template_struct.creative.creative_material_mode = this.defaultData.template_struct.creative.creative_material_mode ||'CUSTOM_CREATIVE';
            this.defaultData.template_struct.material.creative_group_lst = this.defaultData.template_struct.material.creative_group_lst ||{
              all: { materials: [], titles: [] },
            };

            if (this.isCopy) {
              this.defaultData.project_template_name = this.defaultData.project_template_name + '-复制';
            }
            this.getChannelList();
            this.getBasicTargetList();
            this.getFeedStructConfigByUc();
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

  initData(data) {
    for (const item of data) {
      if (!Reflect.has(item, 'children')) {
        item.checked = false;
      } else {
        this.initData(item.children);
      }
    }
  }

  // 获取推广组、计划、创意配置项
  getFeedStructConfigByUc() {
    this.launchRpaService
      .getFeedStructConfigByUc({
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
            this.industryList = this.structConfig['creative']['industry']['sub'];
            this.initData(this.industryList);
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
      this.defaultData.template_struct.adgroup.audience_by_convert_channel = false;
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
      if (!this.defaultData.template_struct.adgroup.bid_by_channel_lst[item.convert_channel_id]) {
        this.getSingleBidData(item);
      }
      if (!this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id] = {
          materials: [],
          titles: []
        };
      }
      if (!this.defaultData.template_struct.material.creative_group_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.material.creative_group_lst[item.convert_channel_id] = {
          materials: [],
          titles: []
        };
      }

      const curChannelData = data.find(value => value === item.convert_channel_id);

      if (!curChannelData) {
        delete this.defaultData.template_struct.adgroup.audience_template_id_lst[item.convert_channel_id];
        delete this.defaultData.template_struct.adgroup.bid_by_channel_lst[item.convert_channel_id];
        delete this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id];
        delete this.defaultData.template_struct.material.creative_group_lst[item.convert_channel_id];
        this.targetChannelList.splice(index, 1);
      }
    });
    this.changeTargetTab(this.curTargetIndex);
    this.getCheckData();
  }

  // 基础定向包列表
  getBasicTargetList() {
    this.launchRpaService
      .getTargetBasicListByUc({
        cid: this.cid,
      }, { result_model: 'all', })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.basicTargetList = [];
          } else {
            this.basicTargetList = results['data'];
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
  // 媒体基础定向包列表
  getMediaBasicTargetList() {
    this.launchRpaService
      .getMediaTargetPackageByUc({
        "chan_pub_id_lst": this.defaultData.chan_pub_id_lst,
        "objective_type": this.defaultData.landing_type,
        "opt_target": this.defaultData.template_struct.adgroup.opt_target
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.curMediaTargetList = [];
            this.launchMediaTargetPackage = [];
          } else {
            this.launchMediaTargetPackage = results['data'];
            this.curMediaTargetList = deepCopy(this.launchMediaTargetPackage);
            if (this.isEdit && this.defaultData.template_struct.adgroup.is_use_media_target_package) {
              this.changeTargetTab(0);
              const allUnchecked = this.curMediaTargetList.some((item) => !item.checked);
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

  // 投放包列表
  getChildTargetList(id) {
    this.launchRpaService
      .getTargetListByUc(id, {
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
            this.totalTargetList = this.launchTargetPackage.length;
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
    let app_type;
    let convert_channel_type;
    this.isChannelTree = false;
    const { template_struct: { adgroup } } = this.defaultData;
    if (this.defaultData.landing_type == '1') {
      app_type = '000';
    } else if (this.defaultData.landing_type == '2') {
      app_type = '001';
    } else {
      app_type = '010';
    }

    if (this.defaultData.template_struct.adgroup.opt_target != 3) {
      convert_channel_type = 2;
    } else {
      convert_channel_type = 1;
    }

    const allpConditions = [
      {
        key: "chan_pub_id",
        name: "",
        op: "in",
        value: this.defaultData.chan_pub_id_lst
      },
      {
        key: "app_type",
        name: "",
        op: "=",
        value: app_type
      },
      {
        key: "convert_channel_type",
        name: "",
        op: "=",
        value: convert_channel_type
      },
      {
        key: "is_new",
        name: "",
        op: "=",
        value: 1
      }
    ];

    this.launchRpaService.getChannelListByUc({ pConditions: allpConditions }, {
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
      if (!this.defaultData.template_struct.adgroup.bid_by_channel_lst[item.convert_channel_id]) {
        this.getSingleBidData(item);
      }
      if (!this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id] = {
          materials: [],
          titles: []
        };
      }
      if (!this.defaultData.template_struct.material.creative_group_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.material.creative_group_lst[item.convert_channel_id] = {
          materials: [],
          titles: []
        };
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
  _checkAll(sourceData, value) {
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

  changeBasicAudience(id) {
    this.getChildTargetList(id);
    this.getItemErrorTip('parent_audience_template_id', this.defaultData.template_struct.adgroup.parent_audience_template_id);
  }

  getDisableDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.today) < 0;
  }

  changeTargetTab(value) {
    this.curTargetIndex = value;
    this.curTargetList = deepCopy(this.launchTargetPackage);
    this.curMediaTargetList = deepCopy(this.launchMediaTargetPackage);
    if (this.targetChannelList[value]) {
      if (!this.defaultData.template_struct.adgroup.is_use_media_target_package) {
        this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[value]['convert_channel_id']].forEach(item => {
          const data = this.curTargetList.find(s_item => s_item.audience_template_id == item);
          if (data) {
            data.checked = true;
          }
        });
      } else {
        this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[value]['convert_channel_id']].forEach(item => {
          const data = this.curMediaTargetList.find(s_item => s_item.key == item);
          if (data) {
            data.checked = true;
          }
        });
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
      if (this.defaultData.template_struct.material.by_material_set_title) {
        this.defaultData.template_struct.material.single_adgroup_material_num = data.length < 10 ? data.length : 10;
      } else {
        this.defaultData.template_struct.material.single_adgroup_material_num = data.length < 10 ? data.length < this.defaultData.template_struct.material.single_adgroup_material_num ? this.defaultData.template_struct.material.single_adgroup_material_num : data.length : 10;
      }
    }
    this.getMaterialErrorTip();
  }


  getCheckData() {
    if (this.defaultData.template_struct.adgroup.audience_by_convert_channel) {
      this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[this.curTargetIndex].convert_channel_id] = [];
      if (!this.defaultData.template_struct.adgroup.is_use_media_target_package) {
        this.curTargetList.forEach(item => {
          if (item.checked) {
            this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[this.curTargetIndex].convert_channel_id].push(item.audience_template_id);
          }
        });
      } else {
        this.curMediaTargetList.forEach(item => {
          if (item.checked) {
            this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[this.curTargetIndex].convert_channel_id].push(item.key);
          }
        });
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

  deleteTag(index) {
    this.defaultData.template_struct.creative.label.splice(index, 1);
  }

  clearTags() {
    this.defaultData.template_struct.creative.label = [];
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

    if ((this.defaultData.template_struct.creative.label.length + inputValueAry.length) > 20) {
      this.message.error('最多20个标签');
      return false;
    }

    inputValueAry.forEach(item => {
      if (item.length && this.defaultData.template_struct.creative.label.indexOf(item) === -1) {
        this.defaultData.template_struct.creative.label.push(item);
      }
    });
    this.inputValue = '';
    // this.getItemErrorTip('label',this.defaultData.template_struct.creative.label);
  }


  // 打开素材库
  openMaterials(data: any[], cssType: number) {
    if (cssType !== 3 && cssType !== 7) {
      this.addImageMaterials(data, cssType);
    } else {
      this.addMaterials(data, cssType);
    }
  }

  addMaterials(data: any[], cssType) {
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


  // 图片素材库
  addImageMaterials(data: any[], cssType) {
    let tempData = [];
    if (data.length && cssType === 2) {
      for (let i = 0; i < data.length; i++) {
        tempData.push(...data[i].materials);
      }
    } else {
      tempData = data;
    }
    const add_modal = this.modalService.create({
      nzTitle: '图片素材库',
      nzWidth: 1300,
      nzContent: LaunchMaterialImageModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: tempData,
        cssType: Number(cssType),
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        this.defaultData.template_struct.material.single_adgroup_material_num = result['data'].length > 10 ? 10 : result['data'].length > this.defaultData.template_struct.material.single_adgroup_material_num ? result['data'].length : this.defaultData.template_struct.material.single_adgroup_material_num;
        if (cssType !== 2) {
          result['data'].forEach(item => {
            if (!item.hasOwnProperty("title")) {
              item["title"] = [];
            }
          });
          data.splice(0, data.length, ...result['data']);
        } else if (cssType === 2) {
          const tempData = [];
          for (let i = 0; i < [...result['data']].length; i += 3) {
            tempData.push({ materials: [...result['data']].slice(i, i + 3), title: [] });
          }
          data.splice(0, data.length, ...tempData);
        }
        this.getMaterialErrorTip();
      }
    });
  }


  // 标题库
  addLaunchTitle(data: any[], cssType) {
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
        cssType
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

  uploadMaterials() {
    const add_modal = this.modalService.create({
      nzTitle: '批量上传',
      nzWidth: 850,
      nzContent: UploadImageMaterialsComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'upload-image-materials',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {

      }
    });
  }

  openBrand(data, cssType) {
    const add_modal = this.modalService.create({
      nzTitle: '品牌图片库',
      nzWidth: 1300,
      nzContent: LaunchMaterialCoverModalComponent,
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
        for (const item of Object.keys(result['data'][0])) {
          data[item] = result['data'][0][item];
        }
        this.defaultData.template_struct.creative.logo_image_id = result['data'][0]['material_id'];
        if (result['data'][0]['preview_img'].indexOf('?') !== -1) {
          this.defaultData.template_struct.creative.imgUrl = result['data'][0]['preview_img'] + '&t=' + new Date().getTime();
        } else {
          this.defaultData.template_struct.creative.imgUrl = result['data'][0]['preview_img'] + '?t=' + new Date().getTime();
        }
        this.getItemErrorTip('logo_image_id', this.defaultData.template_struct.creative.logo_image_id);
      }
    });
  }

  changeObjectiveType(value) {
    this.getChannelList('clear');
    this.curBasicTarget = this.basicTargetList.filter(item => item.landing_type === value);
    this.defaultData.template_struct.adgroup.parent_audience_template_id = null;
    this.curTargetList = [];
    this.launchTargetPackage = [];
    this._allChecked = false;
    this.getMediaBasicTargetList();
  }

  optTargetChange(id) {
    this.defaultData.template_struct.adgroup.bid_by_convert_channel=id==3?true:false;
    this.defaultData.template_struct.creative.creative_material_mode='CUSTOM_CREATIVE';
    this.defaultData.template_struct.adgroup.skip_first_stage = 0;
    if (id === 1) {
      this.defaultData.template_struct.adgroup.delivery = 0;
      this.defaultData.template_struct.adgroup.charge_type = 2;
    } else if (id === 2) {
      this.defaultData.template_struct.adgroup.delivery = 0;
      this.defaultData.template_struct.adgroup.charge_type = 1;
    } else {
      this.defaultData.template_struct.adgroup.delivery = 3;
      this.defaultData.template_struct.adgroup.charge_type = 1;
      this.defaultData.template_struct.adgroup.skip_first_stage = 1;
    }

    this.getChannelList('clear');
    this.getMediaBasicTargetList();
  }

  dateDate(event) { //从日期组件中得到的日期数据
    this.defaultData.template_struct.adgroup.schedule = event.dateData;
  }

  changeDayBudget(value) {
    if (value === 'nolimit') {
      this.defaultData.template_struct.adgroup.budget = "";
    }
  }

  changeCreativeStyle(value) {
    this.defaultData.template_struct.material.screenshot_setting_type = 'system';
    this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [], titles: [] };
    this.defaultData.template_struct.material.creative_group_lst['all'] = { materials: [], titles: [] };
    this.targetChannelList.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id] = {
        materials: [],
        titles: []
      };
      this.defaultData.template_struct.material.creative_group_lst[item.convert_channel_id] = {
        materials: [],
        titles: []
      };
    });
  }


  changeMaterialByChannel() {
    this.defaultData.template_struct.material.single_adgroup_material_num = 1;
    this.defaultData.template_struct.material.single_adgroup_title_num = 1;
    this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [], titles: [] };
    this.defaultData.template_struct.material.creative_group_lst['all'] = { materials: [], titles: [] };
    this.targetChannelList.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id] = { materials: [], titles: [] };
      this.defaultData.template_struct.material.creative_group_lst[item.convert_channel_id] = { materials: [], titles: [] };
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
    if (value) {
      this.defaultData.template_struct.material.single_adgroup_material_num = 1;
    }
  }

  souceNameChange(data) {
    this.getSouceLength = data.source.length;
    this.getItemErrorTip('source', this.defaultData.template_struct.creative.source);
  }

  changeHidden() {
    this.defaultData.template_struct.creative.isHiddenSelect = !this.defaultData.template_struct.creative.isHiddenSelect;
  }

  changeAccount(type) {
    if (!type) {
      this.targetChannelList = [];
      this.channelTreeList = [];
      this.getChannelList('clear');
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
      this.defaultData.template_struct.material.by_channel_set_material = false;
      if (!this.defaultData.template_struct.material.material_type_lst.all) {
        this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [], titles: [] };
      }
      if (!this.defaultData.template_struct.material.creative_group_lst.all) {
        this.defaultData.template_struct.material.creative_group_lst['all'] = { materials: [], titles: [] };
      }
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
    for (const item of Object.keys(this.defaultData.template_struct.material.creative_group_lst)) {
      if (item !== 'all' && !this.targetChannelList.find(channelItem => channelItem.convert_channel_id == item)) {
        delete this.defaultData.template_struct.material.creative_group_lst[item];
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

  doCancel() {
    this.cancel.emit();
  }


  doSave() {
    const isValid = this.checkBasicData();

    if (isValid) {
      this.message.error('请完善参数信息！');
      return;
    }
    if (this.defaultData.template_struct.creative.creative_material_mode==='CUSTOM_CREATIVE') {
      this.defaultData.template_struct.material.creative_group_lst= {
        all: { materials: [], titles: [] },
      };
    } else {
      this.defaultData.template_struct.material.material_type_lst= { all: { materials: [], titles: [] }};
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

    resultData.project_id = this.data.project_id;
    resultData['template_struct']['adgroup']['start_date'] = format(new Date(this.defaultData.template_struct.adgroup.time_range[0]), 'yyyy-MM-dd');
    resultData['template_struct']['adgroup']['end_date'] = format(new Date(this.defaultData.template_struct.adgroup.time_range[1]), 'yyyy-MM-dd');

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

  checkBasicData() {
    let isValid = false;
    const { template_struct } = this.defaultData;

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

    // 计划名称
    const adgroupNameLength = getStringLength(template_struct.adgroup.adgroup_name, []);
    if (adgroupNameLength < 1 || adgroupNameLength > 50) {
      this.checkErrorTip.adgroup_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.adgroup_name.is_show = false;
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

    // 日预算
    if (template_struct.adgroup.day_budget === 'schedule_budget' && !template_struct.adgroup.budget) {
      this.checkErrorTip.budget.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.budget.is_show = false;
    }

    // 转化出价
    if (template_struct.adgroup.opt_target === 3&&!template_struct.adgroup.bid_by_convert_channel && !template_struct.adgroup.opt_bid) {
      this.checkErrorTip.opt_bid.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.opt_bid.is_show = false;
    }
    // 深度转化出价
    if (template_struct.adgroup.deep_convert_type > 0 && (template_struct.adgroup.opt_did <= template_struct.adgroup.opt_bid)) {
      this.checkErrorTip.opt_did.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.opt_did.is_show = false;
    }
    if (template_struct.adgroup.deep_convert_type === 3&&!template_struct.adgroup.bid_by_convert_channel && !template_struct.adgroup.roi_target) {
      this.checkErrorTip.roi_target.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.roi_target.is_show = false;
    }


    // 素材选取
    const materialList = [];
    const materialTitleList = [];
    const titleList = [];
    if (this.defaultData.template_struct.creative.creative_material_mode==='CUSTOM_CREATIVE') {
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
    } else {
      if (this.defaultData.template_struct.material.by_channel_set_material) {
        for (const item of Object.keys(this.defaultData.template_struct.material.creative_group_lst)) {
          if (item !== 'all') {
            for (const s_item of this.defaultData.template_struct.material.creative_group_lst[item].materials) {
              let noMaterialNum = 0;
              for (const limit of s_item.limit) {
                if (limit.list.length <= 0) {
                  noMaterialNum++;
                }
                if (limit.list.length < limit.min) {
                  materialList.push(true);
                }
              }
              if (noMaterialNum >= s_item.limit.length) {
                materialList.push(true);
              }
              if (this.defaultData.template_struct.material.by_creative_group_set_title && (!s_item.titles || s_item.titles.length <= 0)) {
                materialTitleList.push(true);
              }
            }
          }
        }
      } else {
        if (this.defaultData.template_struct.material.creative_group_lst.all.materials.length <= 0) {
          materialList.push(true);
        } else {
          for (const s_item of this.defaultData.template_struct.material.creative_group_lst.all.materials) {
            let noMaterialNum = 0;
            for (const limit of s_item.limit) {
              if (limit.list.length <= 0) {
                noMaterialNum++;
              }
              if (limit.list.length < limit.min) {
                materialList.push(true);
              }
            }
            if (noMaterialNum >= s_item.limit.length) {
              materialList.push(true);
            }
            if (this.defaultData.template_struct.material.by_creative_group_set_title && (!s_item.titles || s_item.titles.length <= 0)) {
              materialTitleList.push(true);
            }
          }
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

    // 创意分类
    // if (!template_struct.creative.industry.length) {
    //   this.checkErrorTip.industry.is_show = true;
    //   isValid = true;
    // } else {
    //   this.checkErrorTip.industry.is_show = false;
    // }

    // 创意标签
    // if (!template_struct.creative.label.length) {
    //   this.checkErrorTip.label.is_show = true;
    //   isValid = true;
    // } else {
    //   this.checkErrorTip.label.is_show = false;
    // }

    // 头像id
    if (!template_struct.creative.logo_image_id) {
      this.checkErrorTip.logo_image_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.logo_image_id.is_show = false;
    }
    // 推广来源
    const sourceLength = getStringLength(template_struct.creative.source, []);
    if (sourceLength < 1 || sourceLength > 16) {
      this.checkErrorTip.source.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.source.is_show = false;
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


    return isValid;
  }

  optBidChange() {
    this.defaultData.template_struct.adgroup.opt_did = this.defaultData.template_struct.adgroup.opt_bid + 0.01;
    this.getItemErrorTip('opt_bid', this.defaultData.template_struct.adgroup.opt_bid);
  }

  isUseMediaTargetPackage(event) {
    if (event) {
      this.getMediaBasicTargetList();
    }
    this.targetChannelList.forEach((item, index) => {
      this.defaultData.template_struct.adgroup.audience_template_id_lst[item.convert_channel_id] = [];
    });
    this.defaultData.template_struct.adgroup.parent_audience_template_id = null;
    this.changeTargetTab('0');
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
      this.defaultData.template_struct.adgroup.adgroup_name = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
      curInput.value = this.defaultData.template_struct.adgroup.adgroup_name;
      this.getItemErrorTip('adgroup_name', this.defaultData.template_struct.adgroup.adgroup_name);
    }

    this.cursorPosition += tagValueLength;
    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核
    } else {
      curInput.select();
      curInput.selectionStart = this.cursorPosition;
      curInput.selectionEnd = this.cursorPosition;
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
    if (this.defaultData.template_struct.creative.creative_material_mode==='CUSTOM_CREATIVE') {
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
    } else {
      if (this.defaultData.template_struct.material.by_channel_set_material) {
        for (const item of Object.keys(this.defaultData.template_struct.material.creative_group_lst)) {
          if (item !== 'all') {
            for (const s_item of this.defaultData.template_struct.material.creative_group_lst[item].materials) {
              let noMaterialNum = 0;
              for (const limit of s_item.limit) {
                if (limit.list.length <= 0) {
                  noMaterialNum++;
                }
                if (limit.list.length < limit.min) {
                  materialList.push(true);
                }
              }
              if (noMaterialNum >= s_item.limit.length) {
                materialList.push(true);
              }
              if (this.defaultData.template_struct.material.by_creative_group_set_title && (!s_item.titles || s_item.titles.length <= 0)) {
                materialTitleList.push(true);
              }
            }
          }
        }
      } else {
        if (this.defaultData.template_struct.material.creative_group_lst.all.materials.length <= 0) {
          materialList.push(true);
        } else {
          for (const s_item of this.defaultData.template_struct.material.creative_group_lst.all.materials) {
            let noMaterialNum = 0;
            for (const limit of s_item.limit) {
              if (limit.list.length <= 0) {
                noMaterialNum++;
              }
              if (limit.list.length < limit.min) {
                materialList.push(true);
              }
            }
            if (noMaterialNum >= s_item.limit.length) {
              materialList.push(true);
            }
            if (this.defaultData.template_struct.material.by_creative_group_set_title && (!s_item.titles || s_item.titles.length <= 0)) {
              materialTitleList.push(true);
            }
          }
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
  getSingleBidData(channelData) {
    const bidData= {
      bid: "0.50", //出价(点击和展现)
      opt_bid: "1.00", //转化出价
      opt_did: "1.01", //深度转化出价
      roi_target: '1.00', //ROI
      delivery: 0, //非转化投放方式(点击和展现)
      convert_delivery: 2, //转化投放方式
      deep_convert_delivery: 2, //深度转化和ROI投放方式
      convert_id: channelData.convert_id, //转化id
      deep_convert_id: channelData.deep_convert_id, //深度转化id
      convert_type_name: channelData.convert_type_name, //转化id
      deep_convert_type_name: channelData.deep_convert_type_name, //深度转化id
      opt_target: this.defaultData.template_struct.adgroup.opt_target,//优化目标:3转化,1点击,2展现
      is_deep_convert:false,
      is_roi:false,
      target_convert_key:channelData.target_convert_key,
      target_convert_name:channelData.target_convert_name,
    };
    if (channelData['is_new']&&channelData['is_new']=='1') {
      const idData=channelData['target_convert_key'].split('_');
      const nameData=channelData['target_convert_name'].split('+');
      bidData.convert_type_name=nameData[0];
      const zeroNum=idData.filter(id=>id==0);
      bidData.deep_convert_type_name=nameData[1];
      if (zeroNum.length<2) {
        const zeroIndex=idData.indexOf('0');
        if (zeroIndex==1) {
          bidData.is_roi=true;
          bidData.deep_convert_delivery=3;
        } else if (zeroIndex==2) {
          bidData.is_deep_convert=true;
        }
      }
    }
    this.defaultData.template_struct.adgroup.bid_by_channel_lst[channelData.convert_channel_id] = {...bidData};
  }
  changeCreativeMode(value) {
    if (value==='CUSTOM_CREATIVE') {
      this.defaultData.template_struct.material.by_creative_group_set_title=false;
    } else {
      this.defaultData.template_struct.material.by_creative_group_set_title=true;
      this.defaultData.template_struct.material.by_material_set_title=false;
    }
  }

}
