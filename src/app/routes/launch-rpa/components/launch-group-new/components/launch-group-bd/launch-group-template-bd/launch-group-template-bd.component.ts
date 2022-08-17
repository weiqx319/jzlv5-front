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
import {GlobalTemplateComponent} from "../../../../../../../shared/template/global-template/global-template.component";
import {LaunchService} from "../../../../../../../module/launch/service/launch.service";
import {AuthService} from "../../../../../../../core/service/auth.service";
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";
import {MenuService} from "../../../../../../../core/service/menu.service";
import {deepCopy, isArray, isObject} from "@jzl/jzl-util";
import {differenceInCalendarDays, format} from "date-fns";
import {getStringLength} from "../../../../../../../shared/util/util";
import {LaunchTitleModalComponent} from "../../../../../modal/launch-title-modal/launch-title-modal.component";
import {UploadImageMaterialsComponent} from "../../../../../modal/upload-image-materials/upload-image-materials.component";
import {LaunchMaterialCoverModalComponent} from "../../../../../modal/launch-material-cover-modal/launch-material-cover-modal.component";
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {zip} from "rxjs";
import {AddLandingPageBaiduComponent} from "../../../../../../asset-management/components/landing-page/landing-page-baidu/add-landing-page-baidu/add-landing-page-baidu.component";
import {AddLandingPageBdComponent} from "../add-landing-page-bd/add-landing-page-bd.component";

@Component({
  selector: 'app-launch-group-template-bd',
  templateUrl: './launch-group-template-bd.component.html',
  styleUrls: ['./launch-group-template-bd.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LaunchGroupTemplateBdComponent implements OnInit {

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

  public showPrievew=false;
  public objectKeys=Object.keys;
  public dateData={
    month:new Date().getMonth(),
    date:new Date().getDate(),
    hours:new Date().getHours(),
    minutes:new Date().getMinutes(),
    seconds:new Date().getSeconds(),
  };
  public signNumData = {
    campaign: 1,
    adgroup: 1,
    creative: 1,
  };
  public signNumToday = {
    campaign: 1,
    adgroup: 1,
    creative: 1,
  };

  public settingDrawerObj = {
    adgroup: false,//广告基础信息
    audience: false,//定向
    creative: false,//创意
    title: false,//文案
    sub_title: false,//文案
    urls: false,//分类标签
    trans: false,//转化
    na_urls: false,//调起URL
  };
  public isSettingDrawerEdit = {
    adgroup: false,//广告基础信息
    audience: false,//定向
    creative: false,//创意
    title: false,//文案
    sub_title: false,//文案
    urls: false,//分类标签
    trans: false,//转化
    na_urls: false,//调起URL
  };
  public warningInfoObj = {
    adgroup: '请编辑广告基础信息',//广告基础信息
    audience: '请选择定向',//定向
    creative: '请完善创意组信息',//创意
    title: '请选择标题',//文案
    sub_title: '请选择短标题',//文案
    urls: '请选择正确数量的落地页',//分类标签
    trans: '请配置正确数量的转化',//转化
    na_urls: '请配置正确数量的调起url',//转化
  };
  public warningInfo = '请完善信息';
  public subjectList = [
    { "label": "网站链接", "value": 1, },
    { "label": "应用下载（IOS）", "value": 2, },
    { "label": "应用下载（Android）", "value": 3, }
  ];
  public transFormList = [
    { "label": "应用API", "value": 1, includeSubject: [ 2, 3] },
    { "label": "应用SDK", "value": 13, includeSubject: [ 3] },
    { "label": "线索API", "value": 7, includeSubject: [1] },
    { "label": "网页JS布码", "value": 5, includeSubject: [1] },
    // {"label": "基木鱼营销页", "value": 2, includeSubject:[1]},
    { "label": "咨询工具授权", "value": 8, includeSubject: [1] },
    // {"label": " API激活", "value": 4, includeSubject:[1]},
  ];
  public ruleSettingData = {
    campaign_rule: "0",
    campaign_group_num: 100,
    campaign_status: false,
    adgroup_status: false,
  };
  public ruleSettingDataShow = {
    campaign_rule: "0",
    campaign_group_num: 100,
    campaign_status: false,
    adgroup_status: false,
  };
  public searchAudienceName = '';
  public settingLoad = true;
  public ruleSettingVisible = false;
  public isEditAudienceDraw = false;
  public isCreateAudienceDraw = false;
  public editAudienceId = null;
  public adSettingInfo = [
    { label: '计划名称', key: 'campaign_name', isNeedChange: false, keyMap: {}, add: '', parent: 'campaign' },
    { label: '投放场景', key: 'campaign_type', isNeedChange: true, keyMap: { '1': '普通模式', '4': '放量模式' }, add: '', parent: 'campaign' },
    { label: '物料类型', key: 'bs_type', isNeedChange: true, keyMap: { '1': '普通计划', '7': '原生RTA' }, add: '', parent: 'campaign' },
    { label: '推广日期', key: 'date_type', isNeedChange: true, keyMap: { '0': '长期投放', '1': '日期范围' }, add: '', parent: 'campaign' },
    { label: '推广时段', key: 'schedule_type', isNeedChange: true, keyMap: { '0': '全部时段', '1': '设置投放时段' }, add: '', parent: 'campaign' },
    { label: '预算', key: 'day_budget', isNeedChange: true, keyMap: { '0': '不限', '1': '自定义' }, add: 'budget', parent: 'campaign' },
    { label: '单元名称', key: 'adgroup_name', isNeedChange: false, keyMap: {}, add: '', parent: 'adgroup' },
    { label: '优化目标', key: 'bid_type', isNeedChange: true, keyMap: { '3': '转化', '1': '点击', '2': '曝光' }, add: '', parent: 'adgroup' },
    // {label:'转化出价',key:'trans_type',isNeedChange:true,keyMap:{'1':'咨询按钮点击','2':'电话按钮点击','3':'表单提交成功','4':'激活','5':'表单按钮点击','6':'下载（预约）按钮点击（小流量）','10':'购买成功','14':'订单提交成功','17':'三句话咨询','18':'留线索','19':'一句话咨询','20':'深度页面访问','25':'注册（小流量）','26':'付费（小流量）','30':'电话拨通','35':'微信复制按钮点击（小流量）','41':'申请（小流量）','42':'授信（小流量）','45':'商品下单成功','46':'加入购物车','47':'商品收藏','48':'商品详情页到达','57':'店铺调起','67':'微信调起按钮点击','68':'粉丝关注成功','71':'应用调起','72':'聊到相关业务（小流量）','73':'回访-电话接通（小流量）','56':'到店（小流量）','74':'回访-信息确认（小流量）','75':'回访-发现意向（小流量）','76':'回访-高潜成交（小流量）','77':'回访-成单客户（小流量）','79':'微信加粉成功（小流量）','80':'直播间成单（小流量）','82':'直播间观看（小流量）','83':'直播间商品按钮点击（小流量）','84':'直播间停留（小流量）','85':'直播间评论（小流量）','86':'直播间打赏（小流量）','87':'直播间购物袋点击（小流量）'},add:'bid',parent:'adgroup'},
    // {label:'深度转化出价',key:'deep_trans_type',isNeedChange:true,keyMap:{'10':'购买成功','25':'注册（小流量）','26':'付费（小流量）','27':'客户自定义（小流量）','28':'次日留存（小流量）','42':'授信（小流量）','45':'商品下单成功','53':'订单核对成功','54':'收货成功','72':'聊到相关业务（小流量）','73':'回访-电话接通（小流量）','56':'到店（小流量）','74':'回访-信息确认（小流量）','75':'回访-发现意向（小流量）','76':'回访-高潜成交（小流量）','77':'回访-成单客户（小流量）','79':'微信加粉成功（小流量）','18':'留线索（小流量）'},add:'deep_ocpc_bid',parent:'adgroup'},
    { label: '付费模式', key: 'pay_mode', isNeedChange: true, keyMap: { '1': 'OCPC', '2': 'OCPM', '3': 'CPC', '4': 'CPM' }, add: '', parent: 'adgroup' },
    { label: '出价', key: 'bid', isNeedChange: false, keyMap: {}, add: '', parent: 'adgroup' },
    { label: '创意名称', key: 'creative_name', isNeedChange: false, keyMap: {}, add: '', parent: 'creative' },
    { label: '品牌', key: 'brand', isNeedChange: false, keyMap: {}, add: '', parent: 'creative' },
  ];
  public targetListMap = {};
  public transFromMap = {};
  public transTypeMap = { '1': '咨询按钮点击', '2': '电话按钮点击', '3': '表单提交成功', '4': '激活', '5': '表单按钮点击', '6': '下载（预约）按钮点击（小流量）', '10': '购买成功', '14': '订单提交成功', '17': '三句话咨询', '18': '留线索', '19': '一句话咨询', '20': '深度页面访问', '25': '注册（小流量）', '26': '付费（小流量）', '30': '电话拨通', '35': '微信复制按钮点击（小流量）', '41': '申请（小流量）', '42': '授信（小流量）', '45': '商品下单成功', '46': '加入购物车', '47': '商品收藏', '48': '商品详情页到达', '57': '店铺调起', '67': '微信调起按钮点击', '68': '粉丝关注成功', '71': '应用调起', '72': '聊到相关业务（小流量）', '73': '回访-电话接通（小流量）', '56': '到店（小流量）', '74': '回访-信息确认（小流量）', '75': '回访-发现意向（小流量）', '76': '回访-高潜成交（小流量）', '77': '回访-成单客户（小流量）', '79': '微信加粉成功（小流量）', '80': '直播间成单（小流量）', '82': '直播间观看（小流量）', '83': '直播间商品按钮点击（小流量）', '84': '直播间停留（小流量）', '85': '直播间评论（小流量）', '86': '直播间打赏（小流量）', '87': '直播间购物袋点击（小流量）' };
  public adgroupNum = 0;//单元数
  public campainNum = 0;//计划数
  public targetNum = 0;//定向数量
  public resultData = {
    project_id: "",
    chan_pub_id_lst: [],  // 账户
    project_template_name: "",  // 模板名称

    template_struct: {
      campaign: {
        subject: 1,//推广对象
        budget: "",      //  预算
        day_budget: 0,  // 是否指定预算
        date_type: '0',   // 是否指定投放时段
        time_range: [new Date(), new Date()],  // 排期时间
        date: 0,//推广日期
        schedule_type: '0',      //  排期方式 date代表选择日期 ,now代表从今天开始
        start_date: "",     // 排期开始时间
        end_date: "",     //  排期结束时间
        schedule: 0,//推广时段
        campaign_name: '{日期}{时分秒}{动态标号}',//计划名称
        campaign_name_begin: 1,//计划名称
        bs_type: 1,//物料类型
        campaign_type: 1,//物料类型
        openurl: false,//物料类型
      },
      adgroup: {
        adgroup_name: '{日期}{时分秒}{动态标号}',//单元名称
        adgroup_name_begin: 1,//单元名称
        bid_type: 3,  // 优化目标
        deep_trans_type: '',
        trans_type: 4,
        channel_id: 0,
        app_name: '',
        apk_name: '',
        app_url: '',
        doc_id: '',
        pay_mode: 1,
        bid_method: 1,
        ftypes: [0],   //投放范围
        ftypes_slt: 0,   //投放范围
        delivery_type: 0,   //投放范围
        bid: "2",      //  出价
        target_by_account: true,  // 是否分账户
        audience_template_id_lst: {     // 定向包列表
          all: [],
        },
        trans_from_lst: {},
        ocpc_bid: "1.00",      //  深度转化出价
        deep_ocpc_bid: "1.01",      //  深度转化出价
        optimize_deep_trans: false,//优化深度转化
        trans_from_rule: '0',
        trans_from: 7,
        ocpc_bid_range: [null, null],      //  深度转化出价
        deep_ocpc_bid_range: [null, null],      //  深度转化出价
      },
      creative: {
        creative_name: '{时间戳}{动态标号}',//创意名称
        creative_name_begin: 1,//创意名称
        idea_type: 0,
        user_portrait: "",     //  头像id
        brand: '',//品牌名称
        imgUrl: "",   //  头像路径
        brandMaterial: {},
        urls_by_account: true,  // 是否分账户
        urls_type: '0',
        urls_rule: '0',
        urls_lst: {},
        na_urls_rule: '0',
        na_urls_lst: { all: [] },
        na_urls_by_account: true,  // 是否分账户
      },
      material: {
        by_material_set_title: false,   // 分素材选择标题
        by_creative_group_set_title: false,   // 分创意组选择标题
        single_adgroup_material_num: 1,
        single_adgroup_title_num: 1,
        material_type_temp: {
          num: 6,
          titleNum: 1,
          curIndex: 0,
          limit: [],
          titles:[],
          sub_titles:[]
        },
        material_type_lst: {
          all: { materials: [], titles: [], sub_titles: [] },
        }
      },
      preview_data: {},
    }
  };

  public tableHeight = document.body.clientHeight - 60;
  public tableWidth = document.body.clientWidth - 150 - 130;

  public defaultData = {
    project_id: "",
    chan_pub_id_lst: [],  // 账户
    project_template_name: "",  // 模板名称

    template_struct: {
      campaign: {
        subject: 1,//推广对象
        budget: "",      //  预算
        day_budget: 0,  // 是否指定预算
        date_type: '0',   // 是否指定投放时段
        time_range: [new Date(), new Date()],  // 排期时间
        date: 0,//推广日期
        schedule_type: '0',      //  排期方式 date代表选择日期 ,now代表从今天开始
        start_date: "",     // 排期开始时间
        end_date: "",     //  排期结束时间
        schedule: 0,//推广时段
        campaign_name: '{日期}{时分秒}{动态标号}',//计划名称
        campaign_name_begin: 1,//计划名称
        bs_type: 1,//物料类型
        campaign_type: 1,//物料类型
        openurl: false,//物料类型
      },
      adgroup: {
        adgroup_name: '{日期}{时分秒}{动态标号}',//单元名称
        adgroup_name_begin: 1,//单元名称
        bid_type: 3,  // 优化目标
        deep_trans_type: 10,
        trans_type: 4,
        channel_id: 0,
        app_name: '',
        apk_name: '',
        app_url: '',
        doc_id: '',
        pay_mode: 1,
        bid_method: 1,
        ftypes: [0],   //投放范围
        ftypes_slt: 0,   //投放范围
        delivery_type: 0,   //投放范围
        bid: "2",      //  出价
        target_by_account: true,  // 是否分账户
        audience_template_id_lst: {     // 定向包列表
          all: [],
        },
        trans_from_lst: {},
        ocpc_bid: "1.00",      //  深度转化出价
        deep_ocpc_bid: "1.01",      //  深度转化出价
        optimize_deep_trans: false,//优化深度转化
        trans_from_rule: '0',
        trans_from: 7,
        ocpc_bid_range: [null, null],      //  深度转化出价
        deep_ocpc_bid_range: [null, null],      //  深度转化出价
      },
      creative: {
        creative_name: '{时间戳}{动态标号}',//创意名称
        creative_name_begin: 1,//创意名称
        idea_type: 0,//创意方式
        user_portrait: "",     //  头像id
        brand: '',//品牌名称
        imgUrl: "",   //  头像路径
        brandMaterial: {},
        urls_by_account: true,  // 是否分账户
        urls_type: '0',
        urls_rule: '0',
        urls_lst: {},
        na_urls_rule: '0',
        na_urls_lst: { all: [] },
        na_urls_by_account: true,  // 是否分账户
      },
      material: {
        by_material_set_title: false,   // 分素材选择标题
        by_creative_group_set_title: false,   // 分创意组选择标题
        single_adgroup_material_num: 1,
        single_adgroup_title_num: 1,
        material_type_temp: {
          num: 6, //每种创意类型可选素材数
          titleNum: 1,//每个创意组分配标题数
          curIndex: 0,//当前创意类型
          limit: [],//所有创意类型下数据
          titles:[],//创意组标题
          sub_titles:[]//创意组短标题
        },
        material_type_lst: {
          all: { materials: [], titles: [], sub_titles: [] },
        }
      },
      preview_data: {},
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

  public curTargetList: any[];

  public _allChecked = false;

  public _indeterminate = false; // 表示有选中的，不管是全选还是选个别

  public curTargetIndex = 0;
  public mediaTargetPackage = {};

  public curMediaTargetList: any[];

  public _allMediaTargetChecked = false;

  public naUrlsList: any[];
  public naUrlsObj = {};
  public naUrlsListMap = {};
  public curNaUrlsList: any[];
  public curNaUrlIndex = 0;
  public _allNaUrlChecked = false;
  public _naUrlIndeterminate = false; // 表示有选中的，不管是全选还是选个别
  public naUrlsNumMap = {
    '0': 1,
    '1': 1,
    '2': 1,
    '3': 1,
  };
  public appList = [];

  public promotionUrlsList: any[];
  public customUrlsList: any[];
  public customUrlsObj = {};
  public curUrlsList: any[];
  public _allUrlChecked = false;
  public _urlIndeterminate = false; // 表示有选中的，不管是全选还是选个别
  public curUrlIndex = 0;
  public promotionUrlsMap = {};
  public customUrlsListMap = {};
  public searchCustomUrlName = '';
  public curTransIndex = 0;
  public searchNaUrlName = '';

  public today = new Date();

  public structConfig: any = {};

  public structConfigLoading = true;

  public showCoefficient = false;

  public curDeliveryIndex = 0;

  public inputValue = "";

  public styleList = [];
  public campaignWordList = [];
  public adgroupWordList = [];
  public creativeWordList = [];
  public cursorPosition = 0;

  public checkErrorTip = {
    chan_pub_id_lst: {
      is_show: false,
      tip_text: '账号不能为空',
    },
    app_url: {
      is_show: false,
      tip_text: '应用不能为空',
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
      tip_text: '计划名称应为1-50字'
    },
    adgroup_name: {
      is_show: false,
      tip_text: '单元名称应为1-50字'
    },
    creative_name: {
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
    urls_lst: {
      is_show: false,
      tip_text: '请检查落地页数量',
    },
    na_urls_lst: {
      is_show: false,
      tip_text: '请检查调起URL数量',
    },
    trans_from_lst: {
      is_show: false,
      tip_text: '请检查转化数量',
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
      tip_text: '按素材或创意组选择标题，素材以及创意组下标题不能为空'
    },
  };
  public targetChannelList = [];
  public curAccountList = [];
  public countByAccount = {};
  public accountsMap = {};
  public getSouceLength = 0;

  public industryList: [];  // 创意分类列表

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
    if (this.isEdit && this.projectTemplateId) {
      this.getProjectTemplate();
    } else {
      this.getChildTargetList();
      this.getFeedStructConfig();
    }
    this.getLaunchRpaWordList();
    this.getCustomUrlList();
    this.getNaUrlList();
    this.accountsList.forEach(item => {
      this.accountsMap[item.chan_pub_id] = item.pub_account_name;
    });
  }

  getProjectTemplate() {
    this.launchRpaService.getProjectTemplateDetail(this.projectTemplateId, {
      cid: this.cid,
      publisher_id: this.publisherId,
    })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            const campaignData = deepCopy(this.defaultData['template_struct']['campaign']);
            const adgroupData = deepCopy(this.defaultData['template_struct']['adgroup']);
            const creativeData = deepCopy(this.defaultData['template_struct']['creative']);
            const materialData = deepCopy(this.defaultData['template_struct']['material']);
            this.defaultData = deepCopy(results['data']);
            this.defaultData.template_struct.campaign = { ...campaignData, ...this.defaultData.template_struct.campaign };
            this.defaultData.template_struct.adgroup = { ...adgroupData, ...this.defaultData.template_struct.adgroup };
            this.defaultData.template_struct.creative = { ...creativeData, ...this.defaultData.template_struct.creative };
            this.defaultData.template_struct.material = { ...materialData, ...this.defaultData.template_struct.material };
            this.defaultData.template_struct.material.material_type_temp.titleNum=this.defaultData.template_struct.material.material_type_temp.titleNum||1;
            this.defaultData.template_struct.material.material_type_temp.titles=this.defaultData.template_struct.material.material_type_temp.titles||[];
            this.defaultData.template_struct.material.material_type_temp.sub_titles=this.defaultData.template_struct.material.material_type_temp.sub_titles||[];
            if (results['data']['template_struct']['ruleSettingData']) {
              this.ruleSettingData = deepCopy(results['data']['template_struct']['ruleSettingData']);
            }
            if (this.isCopy) {
              this.defaultData.project_template_name = this.defaultData.project_template_name + '-复制';
            }
            this.initEditData();
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
      .getStructConfigBd({
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
  // 定向包列表
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
      "sort_item": {
        "key": "create_time",
        "dir": "desc"
      }
    };
    this.launchRpaService
      .getTargetBasicListBd(body, { result_model: 'all', })
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
            this.curTargetList = deepCopy(this.launchTargetPackage.filter(item => item.landing_type == this.defaultData.template_struct.campaign.subject && item['ftypes'].join('') == this.resultData.template_struct.adgroup.ftypes.join('')));
            if (this.isEdit) {
              if (this.defaultData.template_struct.adgroup.target_by_account) {
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
  // 媒体定向包列表
  getMediaTargetList(status?) {
    const body = {
      "chan_pub_id": null,
      "ftypes": this.resultData.template_struct.adgroup.ftypes[0]?this.resultData.template_struct.adgroup.ftypes:[],
      "subject": this.resultData.template_struct.campaign.subject
    };
    this.resultData.chan_pub_id_lst.forEach(chanPubId=> {
      if (status&&this.mediaTargetPackage[chanPubId]) {
        this.changeTargetTab(0);
        return;
      }
      body.chan_pub_id=chanPubId;
      this.launchRpaService.getMediaTargetListBd(body).subscribe(result => {
        if (result['status_code'] && result.status_code === 200) {
          this.mediaTargetPackage[chanPubId] =[...result['data']];
          this.mediaTargetPackage[chanPubId].forEach(item => {
            item.checked = false;
            this.targetListMap[item.atp_feed_id] = item.atp_feed_name;
          });
        } else {
          this.mediaTargetPackage[chanPubId] = [];
        }
      }, (err) => {
      });
    });
  }
  initEditData() {
    const accountList = [];
    this.defaultData.chan_pub_id_lst.forEach((chanPubId) => {
      const accountData = this.accountsList.find(item => item.chan_pub_id === chanPubId);
      if (accountData && !this.curAccountList.find(s_item => s_item.chan_pub_id === chanPubId)) {
        this.curAccountList.push({
          chan_pub_id: accountData.chan_pub_id,
          pub_account_name: accountData.pub_account_name,
          promotionUrlsList: [],
          promotionUrlsMap: {},
          transFromList: [],
          transFromShow: true,
          urlsNum: 1,
          transNum: 1,
          naUrlsNum: 1,
        });
      }
      if (accountData) {
        accountList.push(chanPubId);
      } else {
        if (this.defaultData.template_struct.adgroup.audience_template_id_lst[chanPubId]) {
        delete this.defaultData.template_struct.adgroup.audience_template_id_lst[chanPubId];
        }
        if (this.defaultData.template_struct.creative.urls_lst[chanPubId]) {
          delete this.defaultData.template_struct.creative.urls_lst[chanPubId];
        }
        if (this.defaultData.template_struct.adgroup.trans_from_lst[chanPubId]) {
          delete this.defaultData.template_struct.adgroup.trans_from_lst[chanPubId];
        }
        if (this.defaultData.template_struct.creative.na_urls_lst[chanPubId]) {
          delete this.defaultData.template_struct.creative.na_urls_lst[chanPubId];
        }
      }
    });
    this.defaultData.chan_pub_id_lst = [...accountList];
    this.defaultData.template_struct.creative.na_urls_lst['all'] = [];
    this.curAccountList.forEach((item, index) => {
      if (!this.defaultData.template_struct.adgroup.audience_template_id_lst[item.chan_pub_id]) {
        this.defaultData.template_struct.adgroup.audience_template_id_lst[item.chan_pub_id] = [];
      }
      if (!this.defaultData.template_struct.creative.urls_lst[item.chan_pub_id]) {
        this.defaultData.template_struct.creative.urls_lst[item.chan_pub_id] = [];
      }
      if (!this.defaultData.template_struct.adgroup.trans_from_lst[item.chan_pub_id]) {
        this.defaultData.template_struct.adgroup.trans_from_lst[item.chan_pub_id] = [];
      }
      if (!this.defaultData.template_struct.creative.na_urls_lst[item.chan_pub_id]) {
        this.defaultData.template_struct.creative.na_urls_lst[item.chan_pub_id] = [];
      }
      // if (!this.defaultData.template_struct.material.material_type_lst[item.chan_pub_id]) {
      //   this.defaultData.template_struct.material.material_type_lst[item.chan_pub_id] = {
      //     materials: [],
      //     titles: [],
      //   };
      // }
      this.getPromotionUrlList(item);
      this.getTransFromList(item);
    });
    this.resultData = deepCopy(this.defaultData);
    Object.keys(this.isSettingDrawerEdit).forEach(key => {
      this.isSettingDrawerEdit[key] = true;
    });
    this.showPrievew = true;
    this.doCountByAccount();
    this.getChildTargetList();
    this.getAppList();
    this.getMediaTargetList();
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

  getDisableDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.today) < 0;
  }

  changeTargetTab(value) {
    this.curTargetIndex = value;
    this.curTargetList = deepCopy(this.launchTargetPackage.filter(item => item.landing_type == this.defaultData.template_struct.campaign.subject && item['ftypes'].join('') == this.defaultData.template_struct.adgroup.ftypes.join('')));
    if (this.curAccountList[value]) {
      this.defaultData.template_struct.adgroup.audience_template_id_lst[this.curAccountList[value]['chan_pub_id']].forEach(item => {
        const data = this.curTargetList.find(s_item => s_item.audience_template_id == item);
        if (data) {
          data.checked = true;
        }
        if (this.mediaTargetPackage[this.curAccountList[value]['chan_pub_id']]) {
          const mediaData = this.mediaTargetPackage[this.curAccountList[value]['chan_pub_id']].find(s_item => s_item.atp_feed_id == item);
          if (mediaData) {
            mediaData.checked = true;
          }
        }
      });
    }
    if (this.curTargetList.length > 0) {
      const allUnchecked = this.curTargetList.some((item) => !item.checked);
      this._allChecked = !allUnchecked;
    }
    if (this.mediaTargetPackage[this.curAccountList[value]['chan_pub_id']]&&this.mediaTargetPackage[this.curAccountList[value]['chan_pub_id']].length > 0) {
      const allUnchecked = this.mediaTargetPackage[this.curAccountList[value]['chan_pub_id']].some((item) => !item.checked);
      this._allMediaTargetChecked = !allUnchecked;
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
    this.getMaterialErrorTip();
  }


  getCheckData() {
    if (this.defaultData.template_struct.adgroup.target_by_account) {
      this.defaultData.template_struct.adgroup.audience_template_id_lst[this.curAccountList[this.curTargetIndex].chan_pub_id] = [];
      this.curTargetList.forEach(item => {
        if (item.checked) {
          this.defaultData.template_struct.adgroup.audience_template_id_lst[this.curAccountList[this.curTargetIndex].chan_pub_id].push(item.audience_template_id);
        }
      });
      if (this.mediaTargetPackage[this.curAccountList[this.curTargetIndex].chan_pub_id]) {
        this.mediaTargetPackage[this.curAccountList[this.curTargetIndex].chan_pub_id].forEach(item => {
          if (item.checked) {
            this.defaultData.template_struct.adgroup.audience_template_id_lst[this.curAccountList[this.curTargetIndex].chan_pub_id].push(item.atp_feed_id);
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
      if (this.mediaTargetPackage[this.curAccountList[this.curTargetIndex].chan_pub_id]) {
        this.mediaTargetPackage[this.curAccountList[this.curTargetIndex].chan_pub_id].forEach(item => {
          if (item.checked) {
            this.defaultData.template_struct.adgroup.audience_template_id_lst[this.curAccountList[this.curTargetIndex].chan_pub_id].push(item.atp_feed_id);
          }
        });
      }
    }
    if (this.isSettingDrawerEdit.audience) {
      this.getAudienceTemplateIdLstErrorTip();
    }
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
        if (this.settingDrawerObj.sub_title) {
          this.isSettingDrawerEdit.sub_title = true;
          this.saveSingleEdit('sub_title');
        }
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
  changeApp(id) {
    const data = this.appList.find(item => item.app_url == id);
    if (data) {
      this.resultData.template_struct.adgroup.app_name = data.app_name || '';
      this.resultData.template_struct.adgroup.apk_name = data.apk_name || '';
      this.resultData.template_struct.adgroup.doc_id = data.doc_id || '';
      this.resultData.template_struct.adgroup.channel_id = data.channel_id || 0;
    }
  }

  changeObjectiveType(value) {
    this.curTargetList = deepCopy(this.launchTargetPackage.filter(item => item.landing_type == value && item['ftypes'].join('') == this.resultData.template_struct.adgroup.ftypes.join('')));
    this._allChecked = false;
    this.resultData.template_struct.adgroup.channel_id = 0;
    this.resultData.template_struct.adgroup.app_name = '';
    this.resultData.template_struct.adgroup.apk_name = '';
    this.resultData.template_struct.adgroup.app_url = '';
    this.resultData.template_struct.adgroup.doc_id = '';
    if (value != 1) {
      Object.keys(this.resultData.template_struct.creative.urls_lst).forEach(key => {
        this.resultData.template_struct.creative.urls_lst[key] = [];
      });
      this.getAppList();
    } else {
      Object.keys(this.resultData.template_struct.creative.na_urls_lst).forEach(key => {
        this.resultData.template_struct.creative.na_urls_lst[key].length = 0;
      });
    }
    if (this.isSettingDrawerEdit.adgroup) {
      Object.keys(this.resultData.template_struct.adgroup.audience_template_id_lst).forEach(key => {
        this.resultData.template_struct.adgroup.audience_template_id_lst[key] = [];
      });
      this.getMediaTargetList();
      this.targetNum=0;
    }
    this.resultData.template_struct.material.material_type_lst.all.materials = [];
    this.resultData.template_struct.adgroup.trans_from=this.transFormList.find(item=>item.includeSubject.indexOf(value)!==-1).value;
    this.defaultData.template_struct.adgroup.trans_from=this.resultData.template_struct.adgroup.trans_from;
    this.getMaterialType();
    this.refreshTransFromList();
  }

  dateDate(event) { //从日期组件中得到的日期数据
    this.defaultData.template_struct.campaign.schedule = event.dateData;
  }

  changeDayBudget(value) {
    if (value == '0') {
      this.defaultData.template_struct.campaign.budget = "";
    }
  }

  changeCreativeStyle(value) {
    this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [], titles: [], sub_titles: [] };
    this.curAccountList.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.chan_pub_id] = {
        materials: [],
        titles: [],
        sub_titles: []
      };
    });
  }


  changeMaterialByChannel() {
    this.defaultData.template_struct.material.single_adgroup_material_num = 1;
    this.defaultData.template_struct.material.single_adgroup_title_num = 1;
    this.defaultData.template_struct.material.material_type_lst['all'] = { materials: [], titles: [], sub_titles: [] };
    this.curAccountList.forEach(item => {
      this.defaultData.template_struct.material.material_type_lst[item.chan_pub_id] = { materials: [], titles: [], sub_titles: [] };
    });
    this.getItemErrorTip('single_adgroup_material_num', this.defaultData.template_struct.material.single_adgroup_material_num);
    this.getItemErrorTip('single_adgroup_title_num', this.defaultData.template_struct.material.single_adgroup_title_num);
  }

  changeTitleByChannel(value, type) {
    if (type === 'group') {
      this.defaultData.template_struct.material.by_material_set_title = false;
    } else if (type === 'material') {
      this.defaultData.template_struct.material.by_creative_group_set_title = false;
    }
    this.defaultData.template_struct.material.material_type_lst['all']['titles'] = [];
    this.defaultData.template_struct.material.material_type_lst['all']['sub_titles'] = [];
    this.defaultData.template_struct.material.material_type_lst['all']['materials'].forEach(s_item => {
      s_item.titles = [];
      s_item.sub_titles = [];
    });
  }

  changeAccount(type) {
    if (!type) {
      if (this.resultData.chan_pub_id_lst.length === 0) {
        // this.resultData.template_struct.adgroup.target_by_account = false;
        this.curAccountList = [];
        return;
      }
      this.resultData.chan_pub_id_lst.forEach(chanPubId => {
        const accountData = this.accountsList.find(item => item.chan_pub_id === chanPubId);
        if (!this.curAccountList.find(s_item => s_item.chan_pub_id === chanPubId)) {
          this.curAccountList.push({
            chan_pub_id: accountData.chan_pub_id,
            pub_account_name: accountData.pub_account_name,
            promotionUrlsList: [],
            promotionUrlsMap: {},
            transFromList: [],
            transFromShow: true,
            urlsNum: 1,
            transNum: 1,
            naUrlsNum: 1,
          });
          this.getPromotionUrlList(this.curAccountList[this.curAccountList.length - 1]);
        }
      });
      const deleteIndexArr=[];

      this.curAccountList.forEach((item, index) => {
        if (!this.resultData.template_struct.adgroup.audience_template_id_lst[item.chan_pub_id]) {
          this.resultData.template_struct.adgroup.audience_template_id_lst[item.chan_pub_id] = [];
        }
        if (!this.resultData.template_struct.creative.urls_lst[item.chan_pub_id]) {
          this.resultData.template_struct.creative.urls_lst[item.chan_pub_id] = [];
        }
        if (!this.resultData.template_struct.adgroup.trans_from_lst[item.chan_pub_id]) {
          this.resultData.template_struct.adgroup.trans_from_lst[item.chan_pub_id] = [];
        }
        if (!this.resultData.template_struct.creative.na_urls_lst[item.chan_pub_id]) {
          this.resultData.template_struct.creative.na_urls_lst[item.chan_pub_id] = [];
        }
        // if (!this.defaultData.template_struct.material.material_type_lst[item.chan_pub_id]) {
        //   this.defaultData.template_struct.material.material_type_lst[item.chan_pub_id] = {
        //     materials: [],
        //     titles: [],
        //   };
        // }

        const curAccountData = this.resultData.chan_pub_id_lst.find(value => value === item.chan_pub_id);

        if (!curAccountData) {
          delete this.resultData.template_struct.adgroup.audience_template_id_lst[item.chan_pub_id];
          delete this.resultData.template_struct.creative.urls_lst[item.chan_pub_id];
          delete this.resultData.template_struct.creative.na_urls_lst[item.chan_pub_id];
          delete this.resultData.template_struct.adgroup.trans_from_lst[item.chan_pub_id];
          // delete this.resultData.template_struct.material.material_type_lst[item.chan_pub_id];
          deleteIndexArr.push(index);
        }
      });
      deleteIndexArr.forEach(index=> {
        this.curAccountList.splice(index, 1);
      });
      this.defaultData= deepCopy(this.resultData);
      if (this.resultData.template_struct.campaign.subject != 1) {
        this.getAppList();
      }
      this.getMediaTargetList(true);
      this.doCountByAccount();
    }
    this.getItemErrorTip('chan_pub_id_lst', this.resultData.chan_pub_id_lst);
  }

  doCancel(value) {
    if (value.isRun) {
      this.cancel.emit('save');
    } else {
      this.cancel.emit();
    }
  }


  doSave() {
    this.defaultData= deepCopy(this.resultData);
    const isValid = this.checkBasicData();

    if (isValid) {
      this.message.error(this.warningInfo);
      return;
    }
    this.resultData['template_struct']['campaign']['start_date'] = format(new Date(this.defaultData.template_struct.campaign.time_range[0]), 'yyyy-MM-dd');
    this.resultData['template_struct']['campaign']['end_date'] = format(new Date(this.defaultData.template_struct.campaign.time_range[1]), 'yyyy-MM-dd');
    this.getDateData(new Date());
    this.showPrievew = false;
    this.getPreviewData();
    const resultData = deepCopy(this.resultData);
    for (const item of Object.keys(resultData.template_struct.adgroup.audience_template_id_lst)) {
      if (resultData.template_struct.adgroup.target_by_account) {
        delete resultData.template_struct.adgroup.audience_template_id_lst['all'];
      } else {
        if (item !== 'all') {
          delete resultData.template_struct.adgroup.audience_template_id_lst[item];
        }
      }
    }
    for (const item of Object.keys(resultData.template_struct.creative.na_urls_lst)) {
      if (resultData.template_struct.creative.na_urls_by_account) {
        delete resultData.template_struct.creative.na_urls_lst['all'];
      } else {
        if (item !== 'all') {
          delete resultData.template_struct.creative.na_urls_lst[item];
        }
      }
    }
    resultData['template_struct']['ruleSettingData'] = deepCopy(this.ruleSettingData);
    resultData.project_id = this.data.project_id;

    if (this.isEdit && this.projectTemplateId) {
      this.launchRpaService.updateProjectTemplate(this.projectTemplateId, resultData, {}).subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.message.info('修改模板成功');
            this.showPrievew = true;
          } else {
            this.message.error(results['message']);
          }
          // this.cancel.emit('save');
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
            this.message.info('已保存为模板');
            this.projectTemplateId = results.data[0];
            this.resultData['project_template_id'] = results.data[0];
            this.showPrievew = true;
            this.isEdit = true;
          } else {
            this.message.error(results['message']);
          }
          // this.cancel.emit('save');
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
  checkBasicData(type?) {
    let isValid = false;
    const { template_struct } = this.defaultData;

    if (!type) {
      if (this.defaultData.chan_pub_id_lst.length <= 0) {
        this.checkErrorTip.chan_pub_id_lst.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.chan_pub_id_lst.is_show = false;
      }
      if (this.resultData.template_struct.campaign.subject !== 1 && !this.resultData.template_struct.adgroup.app_url) {
        this.checkErrorTip.app_url.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.app_url.is_show = false;
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
      //出价
      if (this.defaultData.template_struct.adgroup.bid_type != 3 && !this.defaultData.template_struct.adgroup.bid) {
        this.checkErrorTip.bid.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.bid.is_show = false;
      }
      if (this.defaultData.template_struct.adgroup.bid_type == 3 && (!this.defaultData.template_struct.adgroup.bid && this.defaultData.template_struct.adgroup.ocpc_bid_range.some(item => !item))) {
        this.checkErrorTip.ocpc_bid.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.ocpc_bid.is_show = false;
      }
      if (this.defaultData.template_struct.adgroup.optimize_deep_trans && (!this.defaultData.template_struct.adgroup.deep_ocpc_bid && this.defaultData.template_struct.adgroup.deep_ocpc_bid_range.some(item => !item))) {
        this.checkErrorTip.deep_ocpc_bid.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.deep_ocpc_bid.is_show = false;
      }

      // 计划名称
      const campaignNameLength = getStringLength(template_struct.campaign.campaign_name, []);
      if (campaignNameLength < 1 || campaignNameLength > 50) {
        this.checkErrorTip.campaign_name.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.campaign_name.is_show = false;
      }
      // 单元名称
      const adgroupNameLength = getStringLength(template_struct.adgroup.adgroup_name, []);
      if (adgroupNameLength < 1 || adgroupNameLength > 50) {
        this.checkErrorTip.adgroup_name.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.adgroup_name.is_show = false;
      }
      // 创意名称
      const creativeNameLength = getStringLength(template_struct.creative.creative_name, []);
      if (creativeNameLength < 1 || creativeNameLength > 50) {
        this.checkErrorTip.creative_name.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.creative_name.is_show = false;
      }
      // 品牌名称
      const brandNameLength = getStringLength(template_struct.creative.brand, []);
      if (brandNameLength < 1 || brandNameLength > 8) {
        this.checkErrorTip.brand.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.brand.is_show = false;
      }
      // 品牌头像
      if (!template_struct.creative.user_portrait) {
        this.checkErrorTip.user_portrait.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.user_portrait.is_show = false;
      }
      // 日预算
      if (template_struct.campaign.day_budget == 1 && !template_struct.campaign.budget) {
        this.checkErrorTip.budget.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.budget.is_show = false;
      }
      if (isValid) {
        this.warningInfo = this.warningInfoObj.adgroup;
      }
    }

    if (!type || type === 'audience') {

      // 定向列表
      const audienceList = [];
      if (template_struct.adgroup.target_by_account) {
        for (const item of Object.keys(template_struct.adgroup.audience_template_id_lst)) {
          if (item !== 'all' && template_struct.adgroup.audience_template_id_lst[item].length <= 0) {
            audienceList.push(true);
          }
        }
        if (audienceList.some((item) => item)) {
          this.checkErrorTip.audience_template_id_lst.is_show = true;
          isValid = true;
          this.warningInfo = this.warningInfoObj.audience;
        } else {
          this.checkErrorTip.audience_template_id_lst.is_show = false;
        }
      } else {
        if (template_struct.adgroup.audience_template_id_lst['all'].length <= 0) {
          this.checkErrorTip.audience_template_id_lst.is_show = true;
          isValid = true;
          this.warningInfo = this.warningInfoObj.audience;
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
      const subTitleList = [];
      const template = this.defaultData.template_struct.material.material_type_temp;
      if (this.defaultData.template_struct.material.by_material_set_title) {
        if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length <= 0) {
          materialTitleList.push(true);
        } else {
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
                  if (this.resultData.template_struct.campaign.subject != 1 && (material.sub_title.length <= 0 || material.sub_title[0].length > 55)) {
                    materialTitleList.push(true);
                  }
                });
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
        } else {
          for (const s_item of this.defaultData.template_struct.material.material_type_lst['all'].materials) {
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
            if (this.defaultData.template_struct.material.by_creative_group_set_title&&(!s_item.titles||s_item.titles.length<=0)) {
              materialTitleList.push(true);
            }
            if (this.defaultData.template_struct.material.by_creative_group_set_title && this.resultData.template_struct.campaign.subject != 1&&(!s_item.sub_titles||s_item.sub_titles.length<=0)) {
              materialTitleList.push(true);
            }
          }
        }

        if (!this.defaultData.template_struct.material.by_creative_group_set_title && this.defaultData.template_struct.material.material_type_lst['all'].titles.length <= 0) {
          titleList.push(true);
        }
        if (!this.defaultData.template_struct.material.by_creative_group_set_title && this.resultData.template_struct.campaign.subject != 1 && this.defaultData.template_struct.material.material_type_lst['all'].sub_titles.length <= 0) {
          subTitleList.push(true);
        }
      }

      if (!type || type === 'creative') {
        if (materialList.some((item) => item)) {
          isValid = true;
          this.warningInfo = this.warningInfoObj.creative;
          this.checkErrorTip.material_lst.is_show = true;
        } else {
          this.checkErrorTip.material_lst.is_show = false;
        }
        if (materialTitleList.some((item) => item)) {
          isValid = true;
          this.warningInfo = this.warningInfoObj.creative;
          this.checkErrorTip.material_title_lst.is_show = true;
        } else {
          this.checkErrorTip.material_title_lst.is_show = false;
        }
      }
      if (!type || type === 'title') {
        if (titleList.some((item) => item)) {
          isValid = true;
          this.warningInfo = this.warningInfoObj.title;
          this.checkErrorTip.title_lst.is_show = true;
        } else {
          this.checkErrorTip.title_lst.is_show = false;
        }
      }
      if (!type || type === 'sub_title') {
        if (subTitleList.some((item) => item)) {
          isValid = true;
          this.warningInfo = this.warningInfoObj.sub_title;
          this.checkErrorTip.title_lst.is_show = true;
        } else {
          this.checkErrorTip.title_lst.is_show = false;
        }
      }
    }

    if ((!type || type === 'urls') && template_struct.campaign.subject === 1) {
      // 落地页列表
      const urlsList = [];
      for (const item of Object.keys(template_struct.creative.urls_lst)) {
        const accountData = this.curAccountList.find(account => account.chan_pub_id == item);
        if (accountData && template_struct.creative.urls_lst[item].length != accountData.urlsNum) {
          urlsList.push(true);
        }
      }
      if (urlsList.some((item) => item)) {
        this.checkErrorTip.urls_lst.is_show = true;
        isValid = true;
        this.warningInfo = this.warningInfoObj.urls;
      } else {
        this.checkErrorTip.urls_lst.is_show = false;
      }

    }
    if (!type || type === 'trans') {
      if (this.resultData.template_struct.adgroup.bid_type == 3) {
        // 转化列表
        const transList = [];
        for (const item of Object.keys(template_struct.adgroup.trans_from_lst)) {
          const accountData = this.curAccountList.find(account => account.chan_pub_id == item);
          if (accountData && template_struct.adgroup.trans_from_lst[item].length != accountData.transNum) {
            transList.push(true);
          }
        }
        if (transList.some((item) => item)) {
          this.checkErrorTip.trans_from_lst.is_show = true;
          isValid = true;
          this.warningInfo = this.warningInfoObj.trans;
        } else {
          this.checkErrorTip.trans_from_lst.is_show = false;
        }
      }
    }
    if (type && type === 'na_urls') {
      const naUrlsList = [];
      for (const item of Object.keys(template_struct.creative.na_urls_lst)) {
        if (template_struct.creative.na_urls_by_account && item !== 'all') {
          const accountData = this.curAccountList.find(account => account.chan_pub_id == item);
          if (accountData && template_struct.creative.na_urls_lst[item].length && template_struct.creative.na_urls_lst[item].length != accountData.naUrlsNum) {
            naUrlsList.push(true);
          }
        }
        if (!template_struct.creative.na_urls_by_account && item === 'all') {
          if (template_struct.creative.na_urls_lst['all'].length && template_struct.creative.na_urls_lst['all'].length != this.naUrlsNumMap[template_struct.creative.na_urls_rule]) {
            naUrlsList.push(true);
          }
        }
      }
      if (naUrlsList.some((item) => item)) {
        this.checkErrorTip.na_urls_lst.is_show = true;
        isValid = true;
        this.warningInfo = this.warningInfoObj.na_urls;
      } else {
        this.checkErrorTip.na_urls_lst.is_show = false;
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
    const { template_struct } = this.defaultData;
    // 定向列表
    const audienceList = [];
    if (template_struct.adgroup.target_by_account) {
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
    // 素材选取
    const materialList = [];
    const materialTitleList = [];
    const titleList = [];
    const subTitleList = [];
    const template = this.defaultData.template_struct.material.material_type_temp;
    if (this.defaultData.template_struct.material.by_material_set_title) {
      if (this.defaultData.template_struct.material.material_type_lst['all'].materials.length <= 0) {
        materialTitleList.push(true);
      } else {
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
                if (this.resultData.template_struct.campaign.subject != 1 && (material.sub_title.length <= 0 || material.sub_title[0].length > 55)) {
                  materialTitleList.push(true);
                }
              });
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
      } else {
        for (const s_item of this.defaultData.template_struct.material.material_type_lst['all'].materials) {
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
          if (this.defaultData.template_struct.material.by_creative_group_set_title&&(!s_item.titles||s_item.titles.length<=0)) {
            materialTitleList.push(true);
          }
          if (this.defaultData.template_struct.material.by_creative_group_set_title && this.resultData.template_struct.campaign.subject != 1&&(!s_item.sub_titles||s_item.sub_titles.length<=0)) {
            materialTitleList.push(true);
          }
        }
      }

      if (!this.defaultData.template_struct.material.by_creative_group_set_title && this.defaultData.template_struct.material.material_type_lst['all'].titles.length <= 0) {
        titleList.push(true);
      }
      if (!this.defaultData.template_struct.material.by_creative_group_set_title && this.resultData.template_struct.campaign.subject != 1 && this.defaultData.template_struct.material.material_type_lst['all'].sub_titles.length <= 0) {
        subTitleList.push(true);
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
    if (subTitleList.some((item) => item)) {
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

  openSingelSettingDraw(type) {
    // 账户
    if (this.resultData.chan_pub_id_lst.length <= 0) {
      this.message.info('请先选择账户');
      return;
    }
    if (this.resultData.template_struct.campaign.subject !== 1 && !this.resultData.template_struct.adgroup.app_url) {
      this.message.info('请选择应用');
      return;
    }
    if (type === 'urls' || type === 'trans' || type === 'na_urls') {
      if (type === 'urls') {
        if (this.resultData.template_struct.campaign.subject !== 1) {
          this.message.info('应用下载暂不支持落地页');
          return;
        }
      }
      if (!this.isSettingDrawerEdit.audience || this.checkBasicData('audience')) {
        this.message.info(this.warningInfoObj.audience);
        return;
      }
      if (!this.isSettingDrawerEdit.creative || this.checkBasicData('creative')) {
        this.message.info(this.warningInfoObj.creative);
        return;
      }
    }
    this.defaultData = deepCopy(this.resultData);
    if (type === 'title') {
      if (this.defaultData.template_struct.material.by_material_set_title||this.defaultData.template_struct.material.by_creative_group_set_title) {
        this.message.info('分素材或创意组选取标题后无需单独选取标题');
        return;
      }
      if (!this.isSettingDrawerEdit.creative) {
        this.message.info('请添加创意');
        return;
      }
      if (this.resultData.template_struct.creative.idea_type == 0) {
        this.addLaunchTitle(this.defaultData.template_struct.material.material_type_lst['all']['titles']);
      } else {
        this.addLaunchTitle(this.defaultData.template_struct.material.material_type_lst['all']['titles'], 6);
      }
    }
    if (type === 'sub_title') {
      if (this.defaultData.template_struct.material.by_material_set_title||this.defaultData.template_struct.material.by_creative_group_set_title) {
        this.message.info('分素材或创意组选取标题后无需单独选取短标题');
        return;
      }
      if (!this.isSettingDrawerEdit.creative) {
        this.message.info('请添加创意');
        return;
      }
      this.addLaunchTitle(this.defaultData.template_struct.material.material_type_lst['all']['sub_titles'], 1);
    }
    if (type === 'creative' && this.defaultData.template_struct.material.material_type_lst['all'].materials.length < 1) {
      this.getMaterialType();
    }
    if (type === 'audience') {
      if (!this.isSettingDrawerEdit.adgroup) {
        this.message.info('请编辑广告基础信息');
        return;
      }
      if (!this.resultData.template_struct.adgroup.target_by_account) {
        this.curTargetList.forEach(item => item.checked = false);
        this.defaultData.template_struct.adgroup.audience_template_id_lst['all'].forEach(item => {
          const data = this.curTargetList.find(s_item => s_item.audience_template_id == item);
          if (data) {
            data.checked = true;
          }
        });
        const allUnchecked = this.curTargetList.some((item) => !item.checked);
        this._allChecked = !allUnchecked;
      } else {
        this.changeTargetTab(this.curTargetIndex);
        this.getCheckData();
      }
    }
    if (type === 'urls') {
      if (this.defaultData.template_struct.creative.urls_type == '0') {
        this.curUrlsList = deepCopy(this.curAccountList[this.curUrlIndex].promotionUrlsList);
      } else {
        this.curUrlsList = deepCopy(this.customUrlsObj[this.curAccountList[this.curUrlIndex].chan_pub_id] || []);
      }
      this.changeUrlsTab(0);
    }
    if (type === 'trans') {
      this.curTransIndex = 0;
    }
    if (type === 'na_urls') {
      if (this.resultData.template_struct.creative.na_urls_by_account) {
        this.changeNaUrlsTab(0);
      } else {
        this.curNaUrlsList = deepCopy(this.naUrlsList.filter(data => this.resultData.chan_pub_id_lst.indexOf(Number(data.chan_pub_id)) !== -1));
      }
    }
    this.doCountByAccount();
    this.settingDrawerObj[type] = true;

  }
  closeSingelSettingDraw(type?) {
    if (type) {
      const isValid = this.checkBasicData(type);
      if (isValid) {
        if (type === 'creative') {
          this.defaultData.template_struct.material.material_type_lst['all'].materials = [];
        } else if (type === 'title') {
          this.defaultData.template_struct.material.material_type_lst['all']['titles'] = [];
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
      this.message.error(this.warningInfoObj[type]);
      return;
    }

    if (type === 'adgroup') {
      if ((this.defaultData.template_struct.adgroup.ftypes.join('') != this.resultData.template_struct.adgroup.ftypes.join('') || this.defaultData.template_struct.adgroup.bid_type != this.resultData.template_struct.adgroup.bid_type) && this.defaultData.template_struct.material.material_type_lst.all.materials.length > 0) {
        this.modalService.confirm({
          nzTitle: '提示',
          nzContent: this.defaultData.template_struct.adgroup.ftypes.join('') != this.resultData.template_struct.adgroup.ftypes.join('') ? '本次编辑后，创意组及定向包将清空，是否继续？' : '本次编辑后，创意组将清空，是否继续？',
          nzOnOk: () => {
            if (this.defaultData.template_struct.adgroup.ftypes.join('') != this.resultData.template_struct.adgroup.ftypes.join('')) {
              this.getMediaTargetList();
              Object.keys(this.defaultData.template_struct.adgroup.audience_template_id_lst).forEach(key => {
                this.defaultData.template_struct.adgroup.audience_template_id_lst[key] = [];
              });
              this.changeTargetTab(0);
            }
            this.settingDrawerObj[type] = false;
            this.isSettingDrawerEdit[type] = true;
            this.defaultData.template_struct.material.material_type_lst.all.materials = [];
            this.resultData = deepCopy(this.defaultData);
            this.getMaterialType();
            this.refreshTransFromList();
            this.doCountByAccount();
          }
        });
      } else {
        this.settingDrawerObj[type] = false;
        this.isSettingDrawerEdit[type] = true;
        this.resultData = deepCopy(this.defaultData);
        this.refreshTransFromList();
      }
    } else {
      this.settingDrawerObj[type] = false;
      this.isSettingDrawerEdit[type] = true;
      this.resultData = deepCopy(this.defaultData);
    }
    this.doCountByAccount();
  }
  deleteSignalTarget(sourceData, index?) {
    if (index || index == 0) {
      sourceData.splice(index, 1);
      this.doCountByAccount();
    }
  }

  deleteUrls(data,index) {
    data.splice(index,1);
  }
  createTargetNew(data) {
    if (data.audience_template_id) {
      Object.keys(this.defaultData.template_struct.adgroup.audience_template_id_lst).forEach(item => {
        if (item !== 'all') {
          this.defaultData.template_struct.adgroup.audience_template_id_lst[item].push(data.audience_template_id);
        }
      });
      this.getChildTargetList();
      // this.isSettingDrawerEdit.audience=true;
    }
    this.isCreateAudienceDraw = false;
    // this.closeSingelSettingDraw('audience');

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
  openRuleSet() {
    this.ruleSettingVisible = true;
    this.ruleSettingDataShow = deepCopy(this.ruleSettingData);
  }
  cancelRuleSet() {
    this.ruleSettingVisible = false;
  }
  saveRuleSet() {
    this.ruleSettingVisible = false;
    this.ruleSettingData = deepCopy(this.ruleSettingDataShow);
    this.doCountByAccount();
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
            this.creativeWordList = results['data']['creative'];

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
      this.defaultData.template_struct.campaign.campaign_name = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
      curInput.value = this.defaultData.template_struct.campaign.campaign_name;
      this.getItemErrorTip('campaign_name', this.defaultData.template_struct.campaign.campaign_name);
    } else if (type === 'adgroup') {
      this.defaultData.template_struct.adgroup.adgroup_name = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
      curInput.value = this.defaultData.template_struct.adgroup.adgroup_name;
      this.getItemErrorTip('ad_name', this.defaultData.template_struct.adgroup.adgroup_name);
    } else if (type === 'creative') {
      this.defaultData.template_struct.creative.creative_name = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
      curInput.value = this.defaultData.template_struct.creative.creative_name;
      this.getItemErrorTip('ad_name', this.defaultData.template_struct.creative.creative_name);
    }

    this.cursorPosition += tagValueLength;
    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核
    } else {
      curInput.select();
      curInput.selectionStart = this.cursorPosition;
      curInput.selectionEnd = this.cursorPosition;
    }
  }

  getMaterialType() {
    const body = {
      "subject": this.resultData.template_struct.campaign.subject,
      "ftypes": this.resultData.template_struct.adgroup.ftypes,
      "delivery_type": this.resultData.template_struct.adgroup.delivery_type,
      "bid_type": this.resultData.template_struct.adgroup.bid_type,
      "idea_type": this.defaultData.template_struct.creative.idea_type
    };
    this.launchRpaService
      .getMaterialStyle(body)
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.defaultData.template_struct.material.material_type_temp.limit = [];
            this.defaultData.template_struct.material.material_type_lst['all']['materials'] = [];
            Object.keys(results.data).forEach(key => {
              const styleItem = {
                label: key,
                type: 'image',
                css_type: results.data[key],
                list: [],
              };
              if (results.data[key] == 108 || results.data[key] == 111 || results.data[key] == 109 || results.data[key] == 112 || results.data[key] == 666) {
                styleItem.type = 'video';
              }
              this.defaultData.template_struct.material.material_type_temp.limit.push(styleItem);
            });
            this.addCreativeGroup(this.defaultData.template_struct.material.material_type_lst['all'].materials);
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

  checkIdeaType(value) {
    if (value != this.defaultData.template_struct.creative.idea_type) {
      this.modalService.confirm({
        nzTitle: '提示',
        nzContent: '调整后，创意组将清空，是否继续？',
        nzOnOk: () => {
          this.defaultData.template_struct.creative.idea_type = value;
          this.defaultData.template_struct.material.by_creative_group_set_title = false;
          this.defaultData.template_struct.material.by_material_set_title = false;
          this.getMaterialType();
        },
        nzOnCancel:() => {
          if (this.settingLoad) {
            this.settingLoad = false;
            setTimeout(() => {
              this.settingLoad = true;
            }, 0);
          }
        }
      });
    }
  }

  checkCreativeNum(value, idea, type) {
    if (value < idea[type]) {
      this.modalService.confirm({
        nzTitle: '提示',
        nzContent: `调整后，系统将自动删除已有创意组内超过上限的${type==='num'?'创意':'标题'}是否继续？`,
        nzOnOk: () => {
          idea[type] = value;
          this.checkMaterials(type);
        },
        nzOnCancel:() => {
          if (this.settingLoad) {
            this.settingLoad = false;
            setTimeout(() => {
              this.settingLoad = true;
            }, 0);
          }
        }
      });
    } else {
      idea[type] = value;
    }
  }
  checkMaterials(type) {
    const limit = this.defaultData.template_struct.material.material_type_temp.limit;
    this.defaultData.template_struct.material.material_type_lst.all.materials.forEach(creative => {
      if(type==='num') {
        limit.forEach((item, index) => {
          if (creative.limit[index].list.length > this.defaultData.template_struct.material.material_type_temp.num) {
            creative.limit[index].list.splice(this.defaultData.template_struct.material.material_type_temp.num);
          }
        });
      } else {
        if (creative.titles.length > this.defaultData.template_struct.material.material_type_temp.titleNum) {
          creative.titles.splice(this.defaultData.template_struct.material.material_type_temp.titleNum);
        }
        if (creative.sub_titles.length > this.defaultData.template_struct.material.material_type_temp.titleNum) {
          creative.sub_titles.splice(this.defaultData.template_struct.material.material_type_temp.titleNum);
        }
      }

    });
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

  // 定向投放包选中
  _checkSingleUrl(max, event, data) {
    const allChecked = this.curUrlsList.every(
      (value) => value.checked,
    );
    const allUnchecked = this.curUrlsList.every((value) => !value.checked);

    // 表示不是全选，但是有选中的
    this._urlIndeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allUrlChecked = allChecked;

    this.getUrlCheckData();
  }

  // 定向投放包全选
  _checkAllUrl(max, value) {
    if (value) {
      this.curUrlsList.forEach((data, index) => {
        data.checked = false;
        if (max && index + 1 > max) {

        } else {
          data.checked = true;
        }
      });
      this._urlIndeterminate = true;
    } else {
      this._urlIndeterminate = false;
      this.curUrlsList.forEach((data) => (data.checked = false));
    }

    this.getUrlCheckData();
  }

  getUrlCheckData() {
    if (this.defaultData.template_struct.creative.urls_by_account) {
      this.defaultData.template_struct.creative.urls_lst[this.curAccountList[this.curUrlIndex].chan_pub_id] = [];
      if (this.defaultData.template_struct.creative.urls_type == '0') {
        this.curUrlsList.forEach(item => {
          if (item.checked) {
            this.defaultData.template_struct.creative.urls_lst[this.curAccountList[this.curUrlIndex].chan_pub_id].push(item.online_url);
          }
        });
      } else {
        this.curUrlsList.forEach(item => {
          if (item.checked) {
            this.defaultData.template_struct.creative.urls_lst[this.curAccountList[this.curUrlIndex].chan_pub_id].push(item.custom_landing_page_url);
          }
        });
      }

    }
  }
  changeUrlsTab(value) {
    this.curUrlIndex = value;
    if (this.defaultData.template_struct.creative.urls_type == '0') {
      this.curUrlsList = deepCopy(this.curAccountList[this.curUrlIndex].promotionUrlsList);
    } else {
      this.curUrlsList = deepCopy(this.customUrlsObj[this.curAccountList[this.curUrlIndex].chan_pub_id] || []);
    }
    if (this.curAccountList[value]) {
      if (this.defaultData.template_struct.creative.urls_type == '0') {
        this.defaultData.template_struct.creative.urls_lst[this.curAccountList[value]['chan_pub_id']].forEach(item => {
          const data = this.curUrlsList.find(s_item => s_item.online_url == item);
          if (data) {
            data.checked = true;
          }
        });
      } else {
        this.defaultData.template_struct.creative.urls_lst[this.curAccountList[value]['chan_pub_id']].forEach(item => {
          const data = this.curUrlsList.find(s_item => s_item.custom_landing_page_url == item);
          if (data) {
            data.checked = true;
          }
        });
      }
    }

    if (this.curUrlsList.length > 0) {
      const allUnchecked = this.curUrlsList.some((item) => !item.checked);
      this._allUrlChecked = !allUnchecked;
    }
  }
  changeNaUrlByAccount(value) {
    Object.keys(this.defaultData.template_struct.creative.na_urls_lst).forEach(key => {
      this.defaultData.template_struct.creative.na_urls_lst[key] = [];
    });
    if (value) {
      this.changeNaUrlsTab(0);
    } else {
      this.curNaUrlsList = deepCopy(this.naUrlsList.filter(data => this.resultData.chan_pub_id_lst.indexOf(Number(data.chan_pub_id)) !== -1));
    }
  }
  // 定向投放包选中
  _checkSingleNaUrl(max, event, data) {
    const allChecked = this.curNaUrlsList.every(
      (value) => value.checked,
    );
    const allUnchecked = this.curNaUrlsList.every((value) => !value.checked);

    // 表示不是全选，但是有选中的
    this._naUrlIndeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allNaUrlChecked = allChecked;

    this.getNaUrlCheckData();
  }

  // 定向投放包全选
  _checkAllNaUrl(max, value) {
    if (value) {
      this.curNaUrlsList.forEach((data, index) => {
        data.checked = false;
        if (max && index + 1 > max) {

        } else {
          data.checked = true;
        }
      });
      this._naUrlIndeterminate = true;
    } else {
      this._naUrlIndeterminate = false;
      this.curNaUrlsList.forEach((data) => (data.checked = false));
    }

    this.getNaUrlCheckData();
  }

  getNaUrlCheckData() {
    if (this.defaultData.template_struct.creative.na_urls_by_account) {
      this.defaultData.template_struct.creative.na_urls_lst[this.curAccountList[this.curNaUrlIndex].chan_pub_id] = [];
      this.curNaUrlsList.forEach(item => {
        if (item.checked) {
          this.defaultData.template_struct.creative.na_urls_lst[this.curAccountList[this.curNaUrlIndex].chan_pub_id].push(item.app_na_url);
        }
      });
    } else {
      this.defaultData.template_struct.creative.na_urls_lst['all'] = [];
      this.curNaUrlsList.forEach(item => {
        if (item.checked) {
          this.defaultData.template_struct.creative.na_urls_lst['all'].push(item.app_na_url);
        }
      });
    }
  }
  changeNaUrlsTab(value) {
    this.curNaUrlIndex = value;
    this.curNaUrlsList = deepCopy(this.naUrlsObj[this.curAccountList[this.curNaUrlIndex].chan_pub_id] || []);
    if (this.curAccountList[value]) {
      this.defaultData.template_struct.creative.na_urls_lst[this.curAccountList[value]['chan_pub_id']].forEach(item => {
        const data = this.curNaUrlsList.find(s_item => s_item.app_na_url == item);
        if (data) {
          data.checked = true;
        }
      });
    }

    if (this.curNaUrlsList.length > 0) {
      const allUnchecked = this.curNaUrlsList.some((item) => !item.checked);
      this._allNaUrlChecked = !allUnchecked;
    }
  }
  //appList
  getAppList() {
    const body = {
      "chan_pub_ids": this.resultData.chan_pub_id_lst,
      "app_type": this.resultData.template_struct.campaign.subject == 2 ? 1 : 2,
      "pConditions": [
        {
          "key": "app_name",
          "op": "like",
          "value": ""
        }
      ],
      "sort_item": {
        "key": "create_time",
        "dir": "DESC"
      }
    };
    this.launchRpaService.getAppInfoListByBd(body).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        this.appList = [];
        const appData = deepCopy(result.data['detail']);
        if (this.resultData.template_struct.campaign.subject == 3) {
          const appObj = {};
          appData.forEach(data => {
            if (!appObj[data['channel_id']]) {
              appObj[data['channel_id']] = { data: data, inArr: [data['chan_pub_id']] };
            } else {
              appObj[data['channel_id']]['inArr'].push(data['chan_pub_id']);
            }
          });
          Object.keys(appObj).forEach(key => {
            if (appObj[key].inArr.sort().join('') == this.resultData.chan_pub_id_lst.sort().join('')) {
              this.appList.push(appObj[key].data);
            }
          });
        } else {
          this.appList = [...appData];
        }

      } else {
        this.message.error(result.message);
      }
    }, (err) => {

    }, () => {

    });
  }

  // 调起URL列表
  getNaUrlList() {
    const body = {
      "pConditions": [
        {
          "key": "app_na_url_name",
          "op": "like",
          "value": this.searchNaUrlName
        }
      ],
      "sort_item": {
        "key": "create_time",
        "dir": "DESC"
      }
    };
    this.launchRpaService
      .getNaUrlListByBd(body, { result_model: 'all', })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.naUrlsList = [];
            this.naUrlsObj = {};
            this.naUrlsListMap = {};
          } else {
            this.naUrlsObj = {};
            this.naUrlsList = results['data'];
            this.naUrlsList.forEach(item => {
              item.checked = false;
              if (!this.naUrlsObj[item.chan_pub_id]) {
                this.naUrlsObj[item.chan_pub_id] = [];
              }
              this.naUrlsObj[item.chan_pub_id].push(item);
              this.naUrlsListMap[item.app_na_url] = item.app_na_url_name;
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
  // 基木鱼落地页列表
  getPromotionUrlList(data) {
    const body = {
      "chan_pub_id": data.chan_pub_id,
      "show_type": 0,
      "opt_from": 2
    };
    this.launchRpaService
      .getPromotionUrlsBd(body)
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            data.promotionUrlsList = [];
            data.promotionUrlsMap = {};
          } else {
            data.promotionUrlsList = results['data'];
            data.promotionUrlsList.forEach(item => {
              item.checked = false;
              data.promotionUrlsMap[item.online_url] = item.page_name;
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
  // 第三方落地页列表
  getCustomUrlList(status?) {
    const body = {
      "pConditions": [
        {
          "key": "custom_landing_page_name",
          "op": "like",
          "value": this.searchCustomUrlName
        }
      ],
      "sort_item": {
        "key": "create_time",
        "dir": "DESC"
      }
    };
    this.launchRpaService
      .getCustomUrlsBd(body, { result_model: 'all', })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.customUrlsList = [];
            this.customUrlsObj = {};
            this.customUrlsListMap = {};
          } else {
            this.customUrlsObj = {};
            this.customUrlsList = results['data'];
            this.customUrlsList.forEach(item => {
              item.checked = false;
              if (!this.customUrlsObj[item.chan_pub_id]) {
                this.customUrlsObj[item.chan_pub_id] = [];
              }
              this.customUrlsObj[item.chan_pub_id].push(item);
              this.customUrlsListMap[item.custom_landing_page_url] = item.custom_landing_page_name;
            });
            if (status) {
              this.changeUrlsTab(this.curUrlIndex);
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
  // 转化列表
  refreshTransFromList(status?) {
    Object.keys(this.resultData.template_struct.adgroup.trans_from_lst).forEach(key => {
      if (status) {
        this.defaultData.template_struct.adgroup.trans_from_lst[key] = [];
      } else {
        this.resultData.template_struct.adgroup.trans_from_lst[key] = [];
      }
    });
    this.curAccountList.forEach(data => {
      this.getTransFromList(data);
    });
  }
  getTransFromList(data) {
    data.transFromShow = false;
    const body = {
      "chan_pub_id": data.chan_pub_id,
      "trans_type": this.resultData.template_struct.adgroup.trans_type,
      "deep_trans_type": this.resultData.template_struct.adgroup.optimize_deep_trans ? this.resultData.template_struct.adgroup.deep_trans_type : '',
      "trans_from": this.defaultData.template_struct.adgroup.trans_from,
    };
    if (this.resultData.template_struct.campaign.subject == 3) {
      body['channel_id'] = this.resultData.template_struct.adgroup.channel_id;
    }
    this.launchRpaService
      .getCustomTransBd(body)
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            data.transFromList = [];
          } else {
            data.transFromList = [];
            results['data'].forEach(item => {
              this.transFromMap[item.app_trans_id] = item.trans_name;
              const findIndex = data.transFromList.findIndex(transItem => transItem.app_trans_id === item.app_trans_id);
              if (findIndex === -1) {
                data.transFromList.push({
                  level: 1,
                  title: item.trans_name,
                  key: item.app_trans_id,
                  checked: false,
                  isLeaf: true,
                });
              }
            });
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
          data.transFromShow = true;
        },
      );
  }


  transferTreeChange(sourceData, key, data: any[]) {
    sourceData[key] = [...data];
  }
  changeBidType(value) {
    if (value != 3) {
      this.defaultData.template_struct.adgroup.ocpc_bid_range = [null, null];
      this.defaultData.template_struct.adgroup.deep_ocpc_bid_range = [null, null];
      this.defaultData.template_struct.adgroup.bid_method = 1;
      this.defaultData.template_struct.adgroup.optimize_deep_trans = false;
      this.defaultData.template_struct.adgroup.pay_mode = value == 1 ? 3 : 4;
    } else {
      this.defaultData.template_struct.adgroup.pay_mode = 1;
    }
  }
  //计算单账户计划和单元以及可选落地页和转化数量
  doCountByAccount() {
    this.campainNum = 0;
    this.adgroupNum = 0;
    this.targetNum = 0;
    Object.keys(this.resultData.template_struct.adgroup.audience_template_id_lst).forEach(key => {
      this.targetNum += this.resultData.template_struct.adgroup.audience_template_id_lst[key].length;
    });
    this.curAccountList.forEach(accountData => {
      if (!this.countByAccount[accountData.chan_pub_id]) {
        this.countByAccount[accountData.chan_pub_id] = { campaignNum: 0, adgroupNum: 0, };
      }
      this.countByAccount[accountData.chan_pub_id]['campaignNum'] = 0;
      this.countByAccount[accountData.chan_pub_id]['adgroupNum'] = 0;
      this.countByAccount[accountData.chan_pub_id]['adgroupNum'] = this.resultData.template_struct.adgroup.audience_template_id_lst[accountData.chan_pub_id].length * this.resultData.template_struct.material.material_type_lst.all.materials.length;
      if (this.ruleSettingData.campaign_rule == '0') {
        this.countByAccount[accountData.chan_pub_id]['campaignNum'] = (this.resultData.template_struct.adgroup.audience_template_id_lst[accountData.chan_pub_id].length * this.resultData.template_struct.material.material_type_lst.all.materials.length) % this.ruleSettingData.campaign_group_num == 0 ? ((this.resultData.template_struct.adgroup.audience_template_id_lst[accountData.chan_pub_id].length * this.resultData.template_struct.material.material_type_lst.all.materials.length) / this.ruleSettingData.campaign_group_num).toFixed(0) : ((this.resultData.template_struct.adgroup.audience_template_id_lst[accountData.chan_pub_id].length * this.resultData.template_struct.material.material_type_lst.all.materials.length) / this.ruleSettingData.campaign_group_num + 1).toFixed(0);
      } else if (this.ruleSettingData.campaign_rule == '1') {
        if (this.resultData.template_struct.material.material_type_lst.all.materials.length <= this.ruleSettingData.campaign_group_num) {
          this.countByAccount[accountData.chan_pub_id]['campaignNum'] = this.resultData.template_struct.adgroup.audience_template_id_lst[accountData.chan_pub_id].length;
        } else {
          this.countByAccount[accountData.chan_pub_id]['campaignNum'] = this.resultData.template_struct.material.material_type_lst.all.materials.length % this.ruleSettingData.campaign_group_num == 0 ? (this.resultData.template_struct.material.material_type_lst.all.materials.length / this.ruleSettingData.campaign_group_num).toFixed(0) : (this.resultData.template_struct.material.material_type_lst.all.materials.length / this.ruleSettingData.campaign_group_num + 1).toFixed(0);
        }
      } else {
        if (this.resultData.template_struct.adgroup.audience_template_id_lst[accountData.chan_pub_id].length <= this.ruleSettingData.campaign_group_num) {
          this.countByAccount[accountData.chan_pub_id]['campaignNum'] = this.resultData.template_struct.material.material_type_lst.all.materials.length;
        } else {
          this.countByAccount[accountData.chan_pub_id]['campaignNum'] = this.resultData.template_struct.adgroup.audience_template_id_lst[accountData.chan_pub_id].length % this.ruleSettingData.campaign_group_num == 0 ? (this.resultData.template_struct.adgroup.audience_template_id_lst[accountData.chan_pub_id].length / this.ruleSettingData.campaign_group_num).toFixed(0) : (this.resultData.template_struct.adgroup.audience_template_id_lst[accountData.chan_pub_id].length / this.ruleSettingData.campaign_group_num + 1).toFixed(0);
        }
      }
      if (this.defaultData.template_struct.creative.urls_rule == '0') {
        accountData['urlsNum'] = 1;
      } else if (this.defaultData.template_struct.creative.urls_rule == '1') {
        accountData['urlsNum'] = this.countByAccount[accountData.chan_pub_id]['campaignNum'];
      } else {
        accountData['urlsNum'] = this.countByAccount[accountData.chan_pub_id]['adgroupNum'];
      }
      if (this.defaultData.template_struct.adgroup.trans_from_rule == '0') {
        accountData['transNum'] = 1;
      } else if (this.defaultData.template_struct.adgroup.trans_from_rule == '1') {
        accountData['transNum'] = this.countByAccount[accountData.chan_pub_id]['campaignNum'];
      } else {
        accountData['transNum'] = this.countByAccount[accountData.chan_pub_id]['adgroupNum'];
      }
      if (this.defaultData.template_struct.creative.na_urls_rule == '0') {
        accountData['naUrlsNum'] = 1;
      } else if (this.defaultData.template_struct.creative.na_urls_rule == '1') {
        accountData['naUrlsNum'] = this.countByAccount[accountData.chan_pub_id]['campaignNum'];
      } else {
        accountData['naUrlsNum'] = this.countByAccount[accountData.chan_pub_id]['adgroupNum'];
      }
      this.campainNum += Number(this.countByAccount[accountData.chan_pub_id]['campaignNum']);
      this.adgroupNum += Number(this.countByAccount[accountData.chan_pub_id]['adgroupNum']);
    });
    this.naUrlsNumMap['1'] = this.campainNum;
    this.naUrlsNumMap['2'] = this.adgroupNum;
    this.naUrlsNumMap['3'] = this.resultData.chan_pub_id_lst.length;
  }
  //所有单元
  getAllAdgroupData(accountData) {
    const chanPubId = accountData.chan_pub_id;
    const adgroupDefaultData = [];
    const adgroupAudienceData = {};
    const adgroupCreativeData = {};
    const audienceData = deepCopy(this.resultData.template_struct.adgroup.audience_template_id_lst[chanPubId]);
    const creativeData = deepCopy(this.resultData.template_struct.material.material_type_lst.all.materials);
    if (audienceData.length && audienceData.length > 0) {
      audienceData.forEach(audience => {
        creativeData.forEach((creative, creativeIndex) => {
          const adgroupData = deepCopy(this.resultData.template_struct.adgroup);
          const creativeTemp = deepCopy(this.resultData.template_struct.creative);
          creativeTemp['urls_lst'] = this.resultData.template_struct.creative.urls_lst[chanPubId];
          if (this.resultData.template_struct.creative.na_urls_by_account) {
            creativeTemp['na_urls_lst'] = this.resultData.template_struct.creative.na_urls_lst[chanPubId];
          } else {
            creativeTemp['na_urls_lst'] = this.resultData.template_struct.creative.na_urls_lst['all'];
          }
          adgroupData['creative'] = creativeTemp;
          adgroupData['titles'] = deepCopy(this.resultData.template_struct.material.material_type_lst.all.titles);
          adgroupData['sub_titles'] = deepCopy(this.resultData.template_struct.material.material_type_lst.all.sub_titles);
          adgroupData['by_material_set_title'] = this.resultData.template_struct.material.by_material_set_title;
          adgroupData['by_creative_group_set_title'] = this.resultData.template_struct.material.by_creative_group_set_title;
          adgroupData['audience'] = audience;
          adgroupData['audience_name'] = this.targetListMap[audience];
          adgroupData['materials'] = creative.limit;
          adgroupData['group_titles'] = creative.titles;
          adgroupData['group_sub_titles'] = creative.sub_titles;
          adgroupData['material_name'] = '';
          const firstMaterial = creative.limit.find(data => data.list.length > 0);
          if (firstMaterial['css_type'] != 102 && firstMaterial['css_type'] != 104) {
            adgroupData['material_name'] = firstMaterial['list'][0]['material_name'];
          } else {
            adgroupData['material_name'] = firstMaterial['list'][0]['materials'][0]['material_name'];
          }
          adgroupDefaultData.push(adgroupData);
          if (!adgroupAudienceData[audience]) {
            adgroupAudienceData[audience] = [];
          }
          adgroupAudienceData[audience].push(adgroupData);
          if (!adgroupCreativeData['creative_' + (creativeIndex + 1)]) {
            adgroupCreativeData['creative_' + (creativeIndex + 1)] = [];
          }
          adgroupCreativeData['creative_' + (creativeIndex + 1)].push(adgroupData);
        });
      });
    }
    return { adgroupDefaultData, adgroupAudienceData, adgroupCreativeData };
  }
  //分配单元
  getPreviewData() {
    let campaignNum;
    let lastCampaignGroupNum;
    this.resultData.template_struct.preview_data = {};
    //根据账户分配
    this.curAccountList.forEach((accountData, accountIndex) => {
      //动态标号
      this.signNumData.campaign = this.resultData.template_struct.campaign.campaign_name_begin;
      this.signNumData.adgroup = this.resultData.template_struct.adgroup.adgroup_name_begin;
      this.signNumData.creative = this.resultData.template_struct.creative.creative_name_begin;
      if (!this.resultData.template_struct.preview_data[accountData.chan_pub_id]) {
        this.resultData.template_struct.preview_data[accountData.chan_pub_id] = [];
      }
      //所有单元
      const { adgroupDefaultData, adgroupAudienceData, adgroupCreativeData } = this.getAllAdgroupData(accountData);
      //按规则配置下计划生成规则计算可生成计划数
      if (this.ruleSettingData.campaign_rule == '0') {
        campaignNum = (this.adgroupNum / this.ruleSettingData.campaign_group_num).toFixed(0);//计划数
        lastCampaignGroupNum = this.adgroupNum % this.ruleSettingData.campaign_group_num;//最后一个计划单元数
        if (lastCampaignGroupNum > 0) {
          campaignNum = campaignNum + 1;
        }
      } else if (this.ruleSettingData.campaign_rule == '1') {
        campaignNum = this.resultData.template_struct.adgroup.audience_template_id_lst[accountData.chan_pub_id].length;
      } else if (this.ruleSettingData.campaign_rule == '2') {
        campaignNum = this.resultData.template_struct.material.material_type_lst['all'].materials.length;
      }
      //按规则配置下计划生成规则生成数据
      const previewData = [];
      if (this.ruleSettingData.campaign_rule == '0') {
        let alreadyPushNum = 0;
        const campaignData = deepCopy(this.resultData.template_struct.campaign);
        campaignData['adgroup_struct'] = [];
        adgroupDefaultData.forEach((data, index) => {
          if (alreadyPushNum < this.ruleSettingData.campaign_group_num) {
            alreadyPushNum++;
            campaignData['adgroup_struct'].push(data);
          } else {
            campaignData['adgroup_struct'] = [];
            alreadyPushNum = 1;
            campaignData['adgroup_struct'].push(data);
          }
          if (alreadyPushNum == this.ruleSettingData.campaign_group_num || index >= adgroupDefaultData.length - 1) {
            previewData.push(deepCopy(campaignData));
          }
        });
      } else if (this.ruleSettingData.campaign_rule == '1') {
        let alreadyPushNum = 0;
        const campaignData = deepCopy(this.resultData.template_struct.campaign);
        campaignData['adgroup_struct'] = [];
        Object.keys(adgroupAudienceData).forEach(key => {
          if (adgroupAudienceData[key].length <= this.ruleSettingData.campaign_group_num) {
            campaignData['adgroup_struct'].splice(0, this.ruleSettingData.campaign_group_num, ...adgroupAudienceData[key]);
            previewData.push(deepCopy(campaignData));
          } else {
            adgroupAudienceData[key].forEach((data, index) => {
              if (alreadyPushNum < this.ruleSettingData.campaign_group_num) {
                alreadyPushNum++;
                campaignData['adgroup_struct'].push(data);
              } else {
                campaignData['adgroup_struct'] = [];
                alreadyPushNum = 1;
                campaignData['adgroup_struct'].push(data);
              }
              if (alreadyPushNum == this.ruleSettingData.campaign_group_num || index >= adgroupAudienceData[key].length - 1) {
                previewData.push(deepCopy(campaignData));
              }
            });
          }
        });
      } else {
        let alreadyPushNum = 0;
        const campaignData = deepCopy(this.resultData.template_struct.campaign);
        campaignData['adgroup_struct'] = [];
        Object.keys(adgroupCreativeData).forEach(key => {
          if (adgroupCreativeData[key].length <= this.ruleSettingData.campaign_group_num) {
            campaignData['adgroup_struct'].splice(0, this.ruleSettingData.campaign_group_num, ...adgroupCreativeData[key]);
            previewData.push(deepCopy(campaignData));
          } else {
            adgroupCreativeData[key].forEach((data, index) => {
              if (alreadyPushNum < this.ruleSettingData.campaign_group_num) {
                alreadyPushNum++;
                campaignData['adgroup_struct'].push(data);
              } else {
                campaignData['adgroup_struct'] = [];
                alreadyPushNum = 1;
                campaignData['adgroup_struct'].push(data);
              }
              if (alreadyPushNum == this.ruleSettingData.campaign_group_num || index >= adgroupCreativeData[key].length - 1) {
                previewData.push(deepCopy(campaignData));
              }
            });
          }
        });
      }
      if (previewData.length) {
        previewData.forEach((campaign, cIndex) => {
          campaign.adgroup_struct.forEach((adgroup, aIndex) => {
            const creativeInfo = { video: 0, image: 0 };
            adgroup['creative']['creative_name_lst'] = [];
            adgroup['materials'].forEach(data => {
              if (data.list.length) {
                if (data.type === 'video') {
                  creativeInfo.video += data.list.length;
                } else {
                  if (data.css_type == 102 || data.css_type == 104) {
                    creativeInfo.image += data.list.length * 3;
                  } else {
                    creativeInfo.image += data.list.length;
                  }
                }
                if (this.resultData.template_struct.creative.idea_type == 0) {
                  data.list.forEach(item => {
                    if (data.css_type != 102 && data.css_type != 104) {
                      let creativeName = adgroup['creative']['creative_name'].replace('{素材名}', '_' + item.material_name);
                      creativeName = this.getNameByWord(creativeName, 'creative');
                      adgroup['creative']['creative_name_lst'].push(creativeName);
                    } else {
                      let creativeName = adgroup['creative']['creative_name'].replace('{素材名}', '_' + item['materials'][0]['material_name']);
                      creativeName = this.getNameByWord(creativeName, 'creative');
                      adgroup['creative']['creative_name_lst'].push(creativeName);
                    }
                  });
                } else {
                  let creativeName = adgroup['creative']['creative_name'].replace('{素材名}', '_' + adgroup['material_name']);
                  creativeName = this.getNameByWord(creativeName, 'creative');
                  adgroup['creative']['creative_name_lst'].push(creativeName);
                }
              }
            });
            adgroup['creativeInfo'] = creativeInfo;
            //转化
            if (this.resultData.template_struct.adgroup.bid_type == 3) {
              if (this.resultData.template_struct.adgroup.trans_from_rule == '0') {
                adgroup['app_trans_id'] = this.resultData.template_struct.adgroup.trans_from_lst[accountData.chan_pub_id][0];
              } else if (this.resultData.template_struct.adgroup.trans_from_rule == '1') {
                adgroup['app_trans_id'] = this.resultData.template_struct.adgroup.trans_from_lst[accountData.chan_pub_id][cIndex];
              } else {
                adgroup['app_trans_id'] = this.resultData.template_struct.adgroup.trans_from_lst[accountData.chan_pub_id][aIndex];
              }
              adgroup['app_trans_name'] = this.transFromMap[adgroup['app_trans_id']];
            }
            //落地页
            adgroup['ip_url'] = '';
            if (this.resultData.template_struct.creative.urls_rule == '0') {
              adgroup['ip_url'] = this.resultData.template_struct.creative.urls_lst[accountData.chan_pub_id][0];
            } else if (this.resultData.template_struct.creative.urls_rule == '1') {
              adgroup['ip_url'] = this.resultData.template_struct.creative.urls_lst[accountData.chan_pub_id][cIndex];
            } else {
              adgroup['ip_url'] = this.resultData.template_struct.creative.urls_lst[accountData.chan_pub_id][aIndex];
            }
            if (this.resultData.template_struct.creative.urls_type == '0') {
              adgroup['ip_url_name'] = accountData.promotionUrlsMap[adgroup['ip_url']] || '';
            } else {
              adgroup['ip_url_name'] = this.customUrlsListMap[adgroup['ip_url']] || '';
            }
            //调起URL
            adgroup['na_url'] = '';
            if (this.resultData.template_struct.creative.na_urls_by_account) {
              if (this.resultData.template_struct.creative.na_urls_rule == '0') {
                adgroup['na_url'] = this.resultData.template_struct.creative.na_urls_lst[accountData.chan_pub_id][0];
              } else if (this.resultData.template_struct.creative.na_urls_rule == '1') {
                adgroup['na_url'] = this.resultData.template_struct.creative.na_urls_lst[accountData.chan_pub_id][cIndex];
              } else if (this.resultData.template_struct.creative.na_urls_rule == '2') {
                adgroup['na_url'] = this.resultData.template_struct.creative.na_urls_lst[accountData.chan_pub_id][aIndex];
              }
            } else {
              if (this.resultData.template_struct.creative.na_urls_rule == '0') {
                adgroup['na_url'] = this.resultData.template_struct.creative.na_urls_lst['all'][0];
              } else if (this.resultData.template_struct.creative.na_urls_rule == '1') {
                adgroup['na_url'] = this.resultData.template_struct.creative.na_urls_lst['all'][cIndex];
              } else if (this.resultData.template_struct.creative.na_urls_rule == '2') {
                adgroup['na_url'] = this.resultData.template_struct.creative.na_urls_lst['all'][aIndex];
              } else {
                adgroup['na_url'] = this.resultData.template_struct.creative.na_urls_lst['all'][accountIndex];
              }
            }
            adgroup['na_url_name'] = this.naUrlsListMap[adgroup['na_url']] || '';

            adgroup['adgroup_name'] = adgroup['adgroup_name'].replace('{定向包名}', '_' + adgroup['audience_name']);
            adgroup['adgroup_name'] = adgroup['adgroup_name'].replace('{转化名}', '_' + adgroup['app_trans_name']);
            adgroup['adgroup_name'] = adgroup['adgroup_name'].replace('{落地页名}', '_' + adgroup['ip_url_name']);
            adgroup['adgroup_name'] = adgroup['adgroup_name'].replace('{素材名}', '_' + adgroup['material_name']);
            adgroup['adgroup_name'] = this.getNameByWord(adgroup['adgroup_name'], 'adgroup');
          });
          campaign['campaign_name'] = campaign['campaign_name'].replace('{定向包名}', '_' + campaign.adgroup_struct[0]['audience_name']);
          campaign['campaign_name'] = campaign['campaign_name'].replace('{转化名}', '_' + campaign.adgroup_struct[0]['app_trans_name']);
          campaign['campaign_name'] = campaign['campaign_name'].replace('{落地页名}', '_' + campaign.adgroup_struct[0]['ip_url_name']);
          campaign['campaign_name'] = campaign['campaign_name'].replace('{素材名}', '_' + campaign.adgroup_struct[0]['material_name']);
          campaign['campaign_name'] = this.getNameByWord(campaign['campaign_name'], 'campaign');
        });
        this.resultData.template_struct.preview_data[accountData.chan_pub_id] = [...previewData];
      }
    });
  }

  getDateData(date: Date) {
    this.dateData.month = date.getMonth() + 1;
    this.dateData.date = date.getDate();
    this.dateData.hours = date.getHours();
    this.dateData.minutes = date.getMinutes();
    this.dateData.seconds = date.getSeconds();
    Object.keys(this.dateData).forEach(key => {
      if (this.dateData[key] < 10) {
        this.dateData[key] = '0' + this.dateData[key];
      }
    });
  }
  //通配符转换
  getNameByWord(name, type) {
    let resultName = name;
    resultName = resultName.replace('{日期}', '_' + this.dateData.month + this.dateData.date);
    resultName = resultName.replace('{时分秒}', '_' + this.dateData.hours + this.dateData.minutes + this.dateData.seconds);
    resultName = resultName.replace('{时间戳}', '_' + this.dateData.month + this.dateData.date + '_' + this.dateData.hours + '_' + this.dateData.minutes + '_' + this.dateData.seconds);
    if (resultName.indexOf('{动态标号}') !== -1) {
      resultName = resultName.replace('{动态标号}', '_' + this.signNumData[type]);
      this.signNumData[type] += 1;
    }
    if (resultName.indexOf('{当次标号}') !== -1) {
      resultName = resultName.replace('{当次标号}', '_' + this.signNumToday[type]);
      this.signNumToday[type] += 1;
    }
    resultName = resultName.replace(/^_/, '');
    resultName = resultName.replace(/_$/, '');
    return resultName;
  }
  // 定向投放包选中
  _checkMediaTarget(type,sourceData,event?) {
    if (type==='all') {
      sourceData.forEach((data) => {
        data.checked = event;
      });
    } else {
      const allChecked = sourceData.every(
        (value) => value.checked,
      );
      // 表示不是全选，但是有选中的
      this._allMediaTargetChecked = allChecked;
    }

    this.getCheckData();
  }
  createChannel(data) {
    const add_modal = this.modalService.create({
      nzTitle: '创建落地页',
      nzWidth: 700,
      nzContent: AddLandingPageBdComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-channel-baidu',
      nzFooter: null,
      nzComponentParams: {
        accountsList: this.accountsList,
        chanPubId:data.chan_pub_id,
        subject:this.resultData.template_struct.campaign.subject,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result==='onOk') {
        this.getCustomUrlList(true);
      }
    });
  }
  editChannel(data) {
    const add_modal = this.modalService.create({
      nzTitle: '编辑落地页',
      nzWidth: 700,
      nzContent: AddLandingPageBdComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-channel-baidu',
      nzFooter: null,
      nzComponentParams: {
        accountsList: this.accountsList,
        chanPubId:data.chan_pub_id,
        launchUrlId:data.custom_landing_page_id,
        isEdit:true,
        subject:this.resultData.template_struct.campaign.subject,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result==='onOk') {
        this.getCustomUrlList(true);
      }
    });
  }

}
