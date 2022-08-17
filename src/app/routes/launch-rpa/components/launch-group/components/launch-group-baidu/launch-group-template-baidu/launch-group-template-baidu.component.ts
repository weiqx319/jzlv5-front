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
import { differenceInCalendarDays, format } from "date-fns";
import { getStringLength } from "../../../../../../../shared/util/util";
import { LaunchMaterialVideoModalComponent } from "../../../../../modal/launch-material-video-modal/launch-material-video-modal.component";
import { isObject } from "@jzl/jzl-util";
import { LaunchMaterialImageModalComponent } from "../../../../../modal/launch-material-image-modal/launch-material-image-modal.component";
import { LaunchTitleModalComponent } from "../../../../../modal/launch-title-modal/launch-title-modal.component";
import { UploadImageMaterialsComponent } from "../../../../../modal/upload-image-materials/upload-image-materials.component";
import { LaunchMaterialCoverModalComponent } from "../../../../../modal/launch-material-cover-modal/launch-material-cover-modal.component";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-launch-group-template-baidu',
  templateUrl: './launch-group-template-baidu.component.html',
  styleUrls: ['./launch-group-template-baidu.component.scss'],

})
export class LaunchGroupTemplateBaiduComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;


  @Output() cancel = new EventEmitter<any>();

  @Input() accountsList;

  @Input() data;

  @Input() isEdit;

  @Input() projectTemplateId;

  @Input() isCopy;

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
      key: '#marketing_start',
      name: '计划',
      sub: [
        { key: '#marketing_target', name: '营销目标' },
        { key: '#promotion_objective', name: '推广对象' },
        { key: '#pub_campaign_name', name: '计划名称' },
        { key: '#campaign_start', name: '排期与预算', },
      ]
    },
    {
      key: '#adgroup_start',
      name: '单元',
      sub: [
        { key: '#launch_objective', name: '投放目标' },
        { key: '#user_target', name: '用户定向' },
        { key: '#budget_and_bid', name: '优化与出价' },
      ]
    },
    {
      key: '#creative_start',
      name: '创意',
      sub: [
        { key: '#material_title', name: '素材标题' },
        { key: '#creative_setting', name: '创意设置' },
      ]
    },
  ];
  public defaultData = {
    project_id: "",
    chan_pub_id_lst: [],  // 账户
    project_template_name: "",  // 模板名称
    convert_channel_id_lst: [],
    landing_type: 1,  // 推广目的

    template_struct: {
      campaign: {
        marketing_target: 'app_target',//营销目标
        subject: 1,//推广对象
        bgtctl_type: 0,//投放方式
        budget: "",      //  预算
        day_budget: 0,  // 是否指定预算
        date_type: 'now',   // 是否指定投放时段
        time_range: [new Date(), new Date()],  // 排期时间
        date: 0,//推广日期
        schedule_type: 'nolimit',      //  排期方式 date代表选择日期 ,now代表从今天开始
        start_date: "",     // 排期开始时间
        end_date: "",     //  排期结束时间
        schedule: [
          {
            "week_day": 1,
            "start_hour": 0,
            "end_hour": 24
          },
          {
            "week_day": 2,
            "start_hour": 0,
            "end_hour": 24
          },
          {
            "week_day": 3,
            "start_hour": 0,
            "end_hour": 24
          },
          {
            "week_day": 4,
            "start_hour": 0,
            "end_hour": 24
          },
          {
            "week_day": 5,
            "start_hour": 0,
            "end_hour": 24
          },
          {
            "week_day": 6,
            "start_hour": 0,
            "end_hour": 24
          },
          {
            "week_day": 7,
            "start_hour": 0,
            "end_hour": 24
          }
        ],//推广时段
        pub_campaign_name: '',//计划名称
        pub_campaign_bs_type: 1,//物料类型
      },
      adgroup: {
        pub_adgroup_name: '',//单元名称
        bid_type: 3,  // 优化目标
        product_types: '0',
        pay_mode: 1,
        ftypes: [],   //投放范围
        ftypes_slt: 0,   //投放范围
        bid: "0.50",      //  出价
        parent_audience_template_id: null,  // 基础定向
        audience_by_convert_channel: false,  // 是否分渠道号
        audience_template_id_lst: {     // 定向包列表
          all: [],
        },
        ocpc_bid: "1.00",      //  深度转化出价
        deep_ocpc_bid: "1.01",      //  深度转化出价
        optimize_deep_trans: false,//优化深度转化
      },
      creative: {
        pub_creative_name: '',//创意名称
        material_style: 101,     //  创意样式
        idea_type: 0,
        user_portrait: "",     //  头像id
        brand: '',//品牌名称
        imgUrl: "",   //  头像路径
        isHiddenSelect: false,
        brandMaterial: {},
      },
      material: {
        by_channel_set_material: false,   // 分渠道号选择素材
        by_material_set_title: false,   // 分素材选择标题
        single_adgroup_material_num: 1,
        single_adgroup_title_num: 1,
        material_type_lst: {
          all: { materials: [], description: [], sub_title: [] },
        }
      },
    }
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

  public curTargetList: any[];

  public _allChecked = false;

  public _indeterminate = false; // 表示有选中的，不管是全选还是选个别

  public curTargetIndex = 0;

  public today = new Date();

  public structConfig: any = {};

  public structConfigLoading = true;

  public showCoefficient = false;

  public curDeliveryIndex = 0;

  public inputValue = "";

  public styleList = [];

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
    pub_campaign_name: {
      is_show: false,
      tip_text: '计划名称应为1-50字'
    },
    pub_adgroup_name: {
      is_show: false,
      tip_text: '单元名称应为1-50字'
    },
    pub_creative_name: {
      is_show: false,
      tip_text: '创意名称应为1-40字',
    },
    material_style: {
      is_show: false,
      tip_text: '请选择创意样式',
    },
    budget: {
      is_show: false,
      tip_text: '请输入正确的取值范围'
    }, // 日预算
    bid: {
      is_show: false,
      tip_text: '请输入正确的取值范围'
    }, // 出价
    ocpc_bid: {
      is_show: false,
      tip_text: '请输入正确的取值范围'
    },  // 转化出价
    deep_ocpc_bid: {
      is_show: false,
      tip_text: '请输入正确的取值范围'
    },  // 深度转化出价
    parent_audience_template_id: {
      is_show: false,
      tip_text: '请选择基础定向',
    },
    audience_template_id_lst: {
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
    short_title_lst: {
      is_show: false,
      tip_text: '请选择短标题',
    },
    user_portrait: {
      is_show: false,
      tip_text: '请选择品牌头像'
    },
    brand: {
      is_show: false,
      tip_text: '品牌名称应为1-8字'
    },
    material_title_lst: {
      is_show: false,
      tip_text: '按素材选择标题，素材以及素材下标题不能为空'
    },
  };
  public targetChannelList = [];
  public getSouceLength = 0;

  public industryList: [];  // 创意分类列表

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
      this.getFeedStructConfig();
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
            if (this.isCopy) {
              this.defaultData.project_template_name = this.defaultData.project_template_name + '-复制';
            }
            this.getChannelList();
            this.getBasicTargetList();
            this.getFeedStructConfig(1);
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

  // 获取推广组、计划、创意配置项
  getFeedStructConfig(type?) {
    this.launchRpaService
      .getStructConfigByBd({
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
            if (type) {
              this.styleList = this.defaultData.template_struct.campaign.subject == 1 ? this.structConfig.creative['material_style']['sub']['landing_page'] : this.defaultData.template_struct.campaign.subject == 2 ? this.structConfig.creative['material_style']['sub']['ios'] : this.styleList = this.structConfig.creative['material_style']['sub']['android'];
            } else {
              this.styleList = this.structConfig.creative['material_style']['sub']['landing_page'];
              this.defaultData.template_struct.creative.material_style = this.styleList[0].value;
            }
            this.structConfig['adgroup']['ftypes']['sub'][2].sub.forEach(sub => {
              if (this.defaultData.template_struct.adgroup.ftypes.indexOf(sub.value) > -1) {
                sub.checked = true;
              } else {
                sub.checked = false;
              }
            });
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
      if (!this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id] = {
          materials: [],
          description: [],
          sub_title: []
        };
      }

      const curChannelData = data.find(value => value === item.convert_channel_id);

      if (!curChannelData) {
        delete this.defaultData.template_struct.adgroup.audience_template_id_lst[item.convert_channel_id];
        delete this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id];
        this.targetChannelList.splice(index, 1);
      }
    });
    this.changeTargetTab(this.curTargetIndex);
    this.getCheckData();
    this.getItemErrorTip('convert_channel_id_lst', this.defaultData.convert_channel_id_lst);
  }

  // 基础定向包列表
  getBasicTargetList() {
    this.launchRpaService
      .getTargetBasicListByBd({
        cid: this.cid,
      }, { result_model: 'all', })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.basicTargetList = [];
          } else {
            this.basicTargetList = results['data'];
            this.curBasicTarget = deepCopy(this.basicTargetList.filter(item => item.landing_type == this.defaultData.template_struct.campaign.subject));
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
      .getTargetListByBd(id, {
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
    let convert_channel_type;
    this.isChannelTree = false;

    if (this.defaultData.template_struct.adgroup.bid_type != 3) {
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
        key: "landing_type",
        name: "",
        op: "=",
        value: this.defaultData.template_struct.campaign.subject
      },
      {
        key: "convert_channel_type",
        name: "",
        op: "=",
        value: convert_channel_type
      }
    ];

    this.launchRpaService.getChannelListByBd({ pConditions: allpConditions, optimize_deep_trans: this.defaultData.template_struct.adgroup.optimize_deep_trans }, {
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
      if (!this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]) {
        this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id] = {
          materials: [],
          description: [],
          sub_title: []
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
  _refreshStatus(event?) {
    const allChecked = this.curTargetList.every(
      (value) => value.checked,
    );
    const allUnchecked = this.curTargetList.every((value) => !value.checked);

    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;

    this.getCheckData();
  }

  // 定向投放包全选
  _checkAll(value) {
    if (value) {
      this.curTargetList.forEach((data) => {
        data.checked = true;
      });
      this._indeterminate = true;
    } else {
      this._indeterminate = false;
      this.curTargetList.forEach((data) => (data.checked = false));
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
    if (this.targetChannelList[value]) {
      this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[value]['convert_channel_id']].forEach(item => {
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
    if (type === 'titles') {
      this.defaultData.template_struct.material.single_adgroup_title_num = 1;
    } else {
      this.defaultData.template_struct.material.single_adgroup_material_num = 1;
    }
    this.getMaterialErrorTip();
  }

  clearSingleSelected(data: any[], index: number, type) {
    data.splice(index, 1);
    if (type === 'titles') {
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
      this.curTargetList.forEach(item => {
        if (item.checked) {
          this.defaultData.template_struct.adgroup.audience_template_id_lst[this.targetChannelList[this.curTargetIndex].convert_channel_id].push(item.audience_template_id);
        }
      });
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
    this.curTargetIndex = 0;
    this.curTargetList = deepCopy(this.launchTargetPackage);
    for (const item of Object.keys(this.defaultData.template_struct.adgroup.audience_template_id_lst)) {
      this.defaultData.template_struct.adgroup.audience_template_id_lst[item] = [];
    }
    if (this.curTargetList.length > 0) {
      const allUnchecked = this.curTargetList.some((item) => !item.checked);
      this._allChecked = !allUnchecked;
    }
  }


  // 打开素材库
  openMaterials(data: any[], cssType: number) {
    if (cssType !== 108 && cssType !== 109 && cssType !== 111 && cssType !== 112) {
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
          if (!item.hasOwnProperty("description")) {
            item["description"] = [];
          }
          if (!item.hasOwnProperty("sub_title")) {
            item["sub_title"] = [];
          }
        });
        data.splice(0, data.length, ...result['data']);
        this.getMaterialErrorTip();
      }
    });
  }


  // 图片素材库
  addImageMaterials(data: any[], cssType) {
    const tempData = data;
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
        result['data'].forEach(item => {
          if (!item.hasOwnProperty("description")) {
            item["description"] = [];
          }
          if (!item.hasOwnProperty("sub_title")) {
            item["sub_title"] = [];
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
        this.defaultData.template_struct.creative.user_portrait = result['data'][0]['material_id'];
        this.defaultData.template_struct.creative.imgUrl = result['data'][0]['preview_img'];
        this.getItemErrorTip('user_portrait', this.defaultData.template_struct.creative.imgUrl);
      }
    });
  }

  changeObjectiveType(value) {
    this.getChannelList('clear');
    this.curBasicTarget = this.basicTargetList.filter(item => item.landing_type == value);

    this.defaultData.template_struct.adgroup.parent_audience_template_id = null;
    this.curTargetList = [];
    this.launchTargetPackage = [];
    this._allChecked = false;
    this.styleList = value == 1 ? this.structConfig.creative['material_style']['sub']['landing_page'] : value == 2 ? this.structConfig.creative['material_style']['sub']['ios'] : this.styleList = this.structConfig.creative['material_style']['sub']['android'];
    if (this.styleList.length > 0) {
      this.defaultData.template_struct.creative.material_style = this.styleList[0].value;
    }

  }

  dateDate(event) { //从日期组件中得到的日期数据
    this.defaultData.template_struct.campaign.schedule = event.dateData;
  }

  changeDayBudget(value) {
    if (value === 'nolimit') {
      this.defaultData.template_struct.campaign.budget = "";
    }
  }

  changeCreativeStyle(value) {
    this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [], description: [], sub_title: [] };
    this.targetChannelList.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id] = {
        materials: [],
        description: [],
        sub_title: []
      };
    });
  }


  changeMaterialByChannel() {
    this.defaultData.template_struct.material.single_adgroup_material_num = 1;
    this.defaultData.template_struct.material.single_adgroup_title_num = 1;
    this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [], description: [], sub_title: [] };
    this.targetChannelList.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id] = { materials: [], description: [], sub_title: [] };
    });
    this.getItemErrorTip('single_adgroup_material_num', this.defaultData.template_struct.material.single_adgroup_material_num);
    this.getItemErrorTip('single_adgroup_title_num', this.defaultData.template_struct.material.single_adgroup_title_num);
  }

  changeTitleByChannel(value) {
    this.defaultData.template_struct.material.single_adgroup_material_num = 1;
    this.defaultData.template_struct.material.single_adgroup_title_num = 1;
    this.defaultData.template_struct.material.material_type_lst['all']['description'] = [];
    this.defaultData.template_struct.material.material_type_lst['all']['sub_title'] = [];
    this.defaultData.template_struct.material.material_type_lst['all']['materials'].forEach(s_item => {
      s_item.description = [];
      s_item.sub_title = [];
    });
    this.targetChannelList.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]['description'] = [];
      this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]['sub_title'] = [];
      this.defaultData.template_struct.material.material_type_lst[item.convert_channel_id]['materials'].forEach(s_item => {
        s_item.description = [];
        s_item.sub_title = [];
      });
    });
    if (value) {
      this.defaultData.template_struct.material.single_adgroup_material_num = 1;
    }
    this.getItemErrorTip('single_adgroup_material_num', this.defaultData.template_struct.material.single_adgroup_material_num);
    this.getItemErrorTip('single_adgroup_title_num', this.defaultData.template_struct.material.single_adgroup_title_num);
  }

  changeHidden() {
    this.defaultData.template_struct.creative.isHiddenSelect = !this.defaultData.template_struct.creative.isHiddenSelect;
  }

  changeAccount(type) {
    if (!type) {
      this.targetChannelList = [];
      this.channelTreeList = [];
      this.getChannelList('clear');
    }
    this.getItemErrorTip('chan_pub_id_lst', this.defaultData.chan_pub_id_lst);
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
        this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [], description: [], sub_title: [] };
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
    resultData['template_struct']['campaign']['start_date'] = format(new Date(this.defaultData.template_struct.campaign.time_range[0]), 'yyyy-MM-dd');
    resultData['template_struct']['campaign']['end_date'] = format(new Date(this.defaultData.template_struct.campaign.time_range[1]), 'yyyy-MM-dd');

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

  ftypesChange(event) {
    this.defaultData.template_struct.adgroup.ftypes = [];
    event.forEach(item => {
      if (item.checked) {
        this.defaultData.template_struct.adgroup.ftypes.push(item.value);
      }
    });
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
    // 创意样式
    if (!this.defaultData.template_struct.creative.material_style) {
      this.checkErrorTip.material_style.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.material_style.is_show = false;
    }

    //出价
    if (!this.defaultData.template_struct.adgroup.bid) {
      this.checkErrorTip.bid.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.bid.is_show = false;
    }
    if (!this.defaultData.template_struct.adgroup.ocpc_bid) {
      this.checkErrorTip.ocpc_bid.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.ocpc_bid.is_show = false;
    }
    if (this.defaultData.template_struct.adgroup.optimize_deep_trans && !this.defaultData.template_struct.adgroup.deep_ocpc_bid) {
      this.checkErrorTip.deep_ocpc_bid.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.deep_ocpc_bid.is_show = false;
    }

    // 计划名称
    const campaignNameLength = getStringLength(template_struct.campaign.pub_campaign_name, []);
    if (campaignNameLength < 1 || campaignNameLength > 50) {
      this.checkErrorTip.pub_campaign_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.pub_campaign_name.is_show = false;
    }
    // 单元名称
    const adgroupNameLength = getStringLength(template_struct.adgroup.pub_adgroup_name, []);
    if (adgroupNameLength < 1 || adgroupNameLength > 50) {
      this.checkErrorTip.pub_adgroup_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.pub_adgroup_name.is_show = false;
    }
    // 创意名称
    const creativeNameLength = getStringLength(template_struct.creative.pub_creative_name, []);
    if (creativeNameLength < 1 || creativeNameLength > 50) {
      this.checkErrorTip.pub_creative_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.pub_creative_name.is_show = false;
    }
    // 品牌名称
    const brandNameLength = getStringLength(template_struct.creative.brand, []);
    if (brandNameLength < 1 || brandNameLength > 8) {
      this.checkErrorTip.brand.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.brand.is_show = false;
    }

    // 渠道号
    if (this.defaultData.convert_channel_id_lst.length <= 0) {
      this.checkErrorTip.convert_channel_id_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.convert_channel_id_lst.is_show = false;
    }

    // 广告组名称
    // const campaignNameLength = getStringLength(template_struct.campaign.campaign_name, []);
    // if (campaignNameLength < 1 || campaignNameLength > 50) {
    //   this.checkErrorTip.campaign_name.is_show = true;
    //   isValid = true;
    // } else {
    //   this.checkErrorTip.campaign_name.is_show = false;
    // }

    // 基础定向
    if (!template_struct.adgroup.parent_audience_template_id) {
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
    if (template_struct.campaign.day_budget == 1 && !template_struct.campaign.budget) {
      this.checkErrorTip.budget.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.budget.is_show = false;
    }


    // 素材选取
    const materialList = [];
    const materialTitleList = [];
    const titleList = [];
    const shortTitleList = [];
    if (template_struct.material.by_channel_set_material) {
      for (const item of Object.keys(template_struct.material.material_type_lst)) {
        if (item !== 'all') {
          if (template_struct.material.by_material_set_title) {
            if (template_struct.material.material_type_lst[item].materials.length <= 0) {
              materialTitleList.push(true);
            } else if (template_struct.material.material_type_lst[item].materials.length > 0) {
              for (const s_item of template_struct.material.material_type_lst[item].materials) {
                if (s_item.description.length <= 0) {
                  materialTitleList.push(true);
                }
                if ((this.defaultData.template_struct.campaign.subject != 1 && this.defaultData.template_struct.creative.material_style != 111 && this.defaultData.template_struct.creative.material_style != 112 && this.defaultData.template_struct.creative.material_style != 101 && this.defaultData.template_struct.creative.material_style != 107) && s_item.sub_title.length <= 0) {
                  materialTitleList.push(true);
                }
              }
            }
          } else {
            if (template_struct.material.material_type_lst[item].materials.length <= 0) {
              materialList.push(true);
            }

            if (template_struct.material.material_type_lst[item].description.length <= 0) {
              titleList.push(true);
            }
            if ((this.defaultData.template_struct.campaign.subject != 1 && this.defaultData.template_struct.creative.material_style != 111 && this.defaultData.template_struct.creative.material_style != 112 && this.defaultData.template_struct.creative.material_style != 101 && this.defaultData.template_struct.creative.material_style != 107) && template_struct.material.material_type_lst[item].sub_title.length <= 0) {
              shortTitleList.push(true);
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
            if (s_item.description.length <= 0) {
              materialTitleList.push(true);
            }
            if ((this.defaultData.template_struct.campaign.subject != 1 && this.defaultData.template_struct.creative.material_style != 111 && this.defaultData.template_struct.creative.material_style != 112 && this.defaultData.template_struct.creative.material_style != 101 && this.defaultData.template_struct.creative.material_style != 107) && s_item.sub_title.length <= 0) {
              materialTitleList.push(true);
            }
          }
        }
      } else {
        if (template_struct.material.material_type_lst['all'].materials.length <= 0) {
          materialList.push(true);
        }

        if (template_struct.material.material_type_lst['all'].description.length <= 0) {
          titleList.push(true);
        }
        if ((this.defaultData.template_struct.campaign.subject != 1 && this.defaultData.template_struct.creative.material_style != 111 && this.defaultData.template_struct.creative.material_style != 112 && this.defaultData.template_struct.creative.material_style != 101 && this.defaultData.template_struct.creative.material_style != 107) && template_struct.material.material_type_lst['all'].sub_title.length <= 0) {
          shortTitleList.push(true);
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

    if (shortTitleList.some((item) => item)) {
      this.checkErrorTip.short_title_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.short_title_lst.is_show = false;
    }

    if (materialTitleList.some((item) => item)) {
      this.checkErrorTip.material_title_lst.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.material_title_lst.is_show = false;
    }

    // 头像id
    if (!template_struct.creative.user_portrait) {
      this.checkErrorTip.user_portrait.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.user_portrait.is_show = false;
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
    const { template_struct } = this.defaultData;
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
      } else {
        this.checkErrorTip.audience_template_id_lst.is_show = false;
      }
    } else {
      if (template_struct.adgroup.audience_template_id_lst['all'].length <= 0) {
        this.checkErrorTip.audience_template_id_lst.is_show = true;
      } else {
        this.checkErrorTip.audience_template_id_lst.is_show = false;
      }
    }
  }

  // 素材选取错误验证
  getMaterialErrorTip() {
    const { template_struct } = this.defaultData;
    // 素材选取
    const materialList = [];
    const materialTitleList = [];
    const titleList = [];
    const shortTitleList = [];
    if (template_struct.material.by_channel_set_material) {
      for (const item of Object.keys(template_struct.material.material_type_lst)) {
        if (item !== 'all') {
          if (template_struct.material.by_material_set_title) {
            if (template_struct.material.material_type_lst[item].materials.length <= 0) {
              materialTitleList.push(true);
            } else if (template_struct.material.material_type_lst[item].materials.length > 0) {
              for (const s_item of template_struct.material.material_type_lst[item].materials) {
                if (s_item.description.length <= 0) {
                  materialTitleList.push(true);
                }
                if ((this.defaultData.template_struct.campaign.subject != 1 && this.defaultData.template_struct.creative.material_style != 111 && this.defaultData.template_struct.creative.material_style != 112 && this.defaultData.template_struct.creative.material_style != 101 && this.defaultData.template_struct.creative.material_style != 107) && s_item.sub_title.length <= 0) {
                  materialTitleList.push(true);
                }
              }
            }
          } else {
            if (template_struct.material.material_type_lst[item].materials.length <= 0) {
              materialList.push(true);
            }

            if (template_struct.material.material_type_lst[item].description.length <= 0) {
              titleList.push(true);
            }
            if ((this.defaultData.template_struct.campaign.subject != 1 && this.defaultData.template_struct.creative.material_style != 111 && this.defaultData.template_struct.creative.material_style != 112 && this.defaultData.template_struct.creative.material_style != 101 && this.defaultData.template_struct.creative.material_style != 107) && template_struct.material.material_type_lst[item].sub_title.length <= 0) {
              shortTitleList.push(true);
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
            if (s_item.description.length <= 0) {
              materialTitleList.push(true);
            }
            if ((this.defaultData.template_struct.campaign.subject != 1 && this.defaultData.template_struct.creative.material_style != 111 && this.defaultData.template_struct.creative.material_style != 112 && this.defaultData.template_struct.creative.material_style != 101 && this.defaultData.template_struct.creative.material_style != 107) && s_item.sub_title.length <= 0) {
              materialTitleList.push(true);
            }
          }
        }
      } else {
        if (template_struct.material.material_type_lst['all'].materials.length <= 0) {
          materialList.push(true);
        }

        if (template_struct.material.material_type_lst['all'].description.length <= 0) {
          titleList.push(true);
        }
        if ((this.defaultData.template_struct.campaign.subject != 1 && this.defaultData.template_struct.creative.material_style != 111 && this.defaultData.template_struct.creative.material_style != 112 && this.defaultData.template_struct.creative.material_style != 101 && this.defaultData.template_struct.creative.material_style != 107) && template_struct.material.material_type_lst['all'].sub_title.length <= 0) {
          shortTitleList.push(true);
        }
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

    if (shortTitleList.some((item) => item)) {
      this.checkErrorTip.short_title_lst.is_show = true;
    } else {
      this.checkErrorTip.short_title_lst.is_show = false;
    }

    if (materialTitleList.some((item) => item)) {
      this.checkErrorTip.material_title_lst.is_show = true;
    } else {
      this.checkErrorTip.material_title_lst.is_show = false;
    }
  }
}
