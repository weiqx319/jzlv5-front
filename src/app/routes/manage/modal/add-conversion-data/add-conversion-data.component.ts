import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ManageService } from "../../service/manage.service";
import { DefineSettingService } from "../../service/define-setting.service";
import { Md5, copy2Clipboard, deepCopy } from "@jzl/jzl-util";
import { AddAuthorComponent } from "../add-author/add-author.component";
import { environment } from "../../../../../environments/environment";
import { AddAuthorMessageComponent } from "../add-author/add-author-message/add-author-message.component";
import { isArray } from "@jzl/jzl-util";
import { HttpEvent, HttpEventType, HttpResponse } from "../../../../../../node_modules/@angular/common/http";
import { MenuService } from '../../../../core/service/menu.service';
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";
import { AuthService } from "../../../../core/service/auth.service";
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-add-conversion-data',
  templateUrl: './add-conversion-data.component.html',
  styleUrls: ['./add-conversion-data.component.scss']
})
export class AddConversionDataComponent implements OnInit, DoCheck {
  public conversion_has_chat = {};

  @Input() set conversionData(data: any) {
    this.baseDefaultRule = JSON.parse(JSON.stringify(this.defaultRule));
    this.defaultConversion = Object.assign(this.defaultConversion, {
      cid: data['cid'],
      'conver_name': data['conver_name'],
      'conver_data_type': data['conver_data_type'],
      'conver_source_type': data['conver_source_type'],
      conver_remarks: data['conver_remarks'],
      is_default: data['is_default']
    });

    if (data['conver_source_type'] === 2 || data['conver_source_type'] === 3 || data['conver_source_type'] === 4 || data['conver_source_type'] === 5) {
      this.im_push_type = data['im_push_type'];
      this.getPublicConversionDetail(); //显示公共部分
      this.getAccountLists();
    }
    if (data['conver_source_type'] === 2) {
      this.im_push_type = data['im_push_type'];
      if (this.im_push_type === 1) {
        this.getUrl();
      }
      if (this.getHasConversionSetType()) {
        let pageConversion = [];
        if (data['conver_desc']['rules']) {

          if (data['conver_desc']['rules'].length === 0) {
            pageConversion = this.baseDefaultRule.chat_conversion_logic.rules;
          } else {
            data['conver_desc']['rules'].forEach((item, index) => {
              const pageConversionItem = [];
              item.forEach(smallItem => {

                if (isArray(smallItem['condition_details'])) {

                  smallItem['condition_details'].forEach(item_rule => {

                    if (isArray(item_rule['txt_list']) && item_rule['txt_list'].length) {
                      item_rule['txt_list'] = this.getStringByArray(item_rule['txt_list']);
                    }
                    pageConversionItem.push({
                      condition_type: smallItem['condition_type'] * 1,
                      condition_details: item_rule
                    });
                  });
                } else {
                  smallItem['condition_type'] = smallItem['condition_type'] * 1;
                  smallItem['has_chat'] = true;
                  this.conversion_has_chat['convsersion_' + index] = true;
                  pageConversionItem.push(smallItem);
                }

              });
              pageConversion.push(pageConversionItem);
            });
          }

          this.chat_conversion_logic = Object.assign(this.chat_conversion_logic, { rules: pageConversion });
        }

        // this.getPublicConversionDetail(); //获取第三方聊天工具 的 公共设置

      }
      if (!data['conver_desc']['rules']) {
        this.chatDefaultConversion = Object.assign(this.chatDefaultConversion, data['conver_desc']);
      }
      this.get53AppList(); //获取53kf列表
      this.getOauthList();
      this.getSWTList(); //获取商务通列表
      this.getYLTList(); //获取易聊通列表
      this.getMqAppList(); //获取美洽列表
      this.getMoorList();
      this.getCepMoorList();

    }

  }

  @Input() conversionDataId = 0;


  public interval$: any;
  public openPage$: any;
  public advertiserList = [];
  public OauthList = [];


  public defaultConversion = {
    "cid": null,
    "conver_name": '',
    "conver_remarks": '',
    "conver_data_type": 1,
    "conver_source_type": 1,
    "is_default": 0
  };

  //推送方式
  public im_push_type = 1; // 1 53kfapi 2 商务通excel上传

  /*53客服*/
  public chatDefaultConversion = {
    content_type: "talk_number",
    content_detail: {
      talk_number: {
        type: "all",
        count: 5
      },
      visitor_name: [
        {
          "connector": "and",
          "operator": "=",
          "value": ""
        }
      ],
      visitor_tag: [
        {
          "connector": "and",
          "operator": "=",
          "value": ""
        }
      ]
    },
    /*  jzlSetting: {
        'app_url': '',
        'app_token': '53kf_jzl'
      },
      apiSettings: [{
        valid: false,
        app_id: '',
        app_secret: ''
      }]*/
  };


  /*商务通*/
  public chatBusinessConversion = {
    content_type: "talk_number",
    content_detail: {
      talk_type: { //对话类型 5，普通对话；6 较好对话；7，极佳对话 0 其他有效对话
        id: '5',
        name: '普通对话'
      },
      visitor_category: [
        {
          "connector": "and",
          "operator": "=",
          "value": ""
        },
      ]
    },
  };

  public chatApi53 = {
    apiSettings: [{
      valid: false,
      app_id: '',
      app_secret: ''
    }]
  };
  public swtApiList = {
    apiSettings: [{
      id: null,
      site_id: '',
      user_name: '',
      password: ''
    }]
  };
  public yltApiList = {
    apiSettings: [{
      id: null,
      comp_id: '',
      app_id: '',
      app_secret: '',
      client_key: '',
      fileList: []
    }]
  };

  public moorApiList = {
    apiSettings: [{
      id: null,
      account_id: '',
      api_secret: '',
    }]
  };
  public cepMoorApiList = {
    apiSettings: [{
      id: null,
      app_key: '',
      secret_key: '',
    }]
  };

  public mqApiList = {
    apiSettings: [{
      // cid: this.defaultConversion.cid,
      enterprise_id: '',
      key: 'conversations',
      app_id: '',
      sign: '',
      valid: false,
      id: null
    }]
  };
  public kstOauthList = [];

  public jzlSetting = {
    'app_url': 'http://api.jiuzhilan.com/v1/chatmessagereceive?jzl_cid=3e4ca87675ede21184816ac1ff32c9e4&chat_tool=53kf',
    'app_token': '53kf_jzl'
  };


  //53客服
  public chatConversionSetting = {
    talk_number: {
      types: [
        { key: 'all', name: '所有' },
        { key: 'customer', name: '访客' },
        { key: 'customer_service', name: '客服' },
      ]
    },
    visitor_name: {
      operatorType: [
        { key: '=', name: '等于' },
        { key: '!=', name: '不等于' },
        { key: 'like', name: '包含' },
        { key: 'not like', name: '不包含' }
      ],
      relationType: [
        { key: 'and', name: '并且' },
        { key: 'or', name: '或者' }
      ]
    }
  };

  //商务通
  public businessConversionSetting = {
    talk_number: {
      types: [
        { key: '5', name: '普通对话' },
        { key: '6', name: '较好对话' },
        { key: '7', name: '极佳对话' },
        { key: '0', name: '其他有效对话' }
      ]
    },
    visitor_name: {
      operatorType: [
        { key: '=', name: '等于' },
        { key: 'like', name: '包含' },
      ],
      relationType: [
        { key: 'and', name: '并且' },
        { key: 'or', name: '或者' }
      ]
    }
  };

  public contentTypeItems = [
    { name: '对话数', key: 1, excludeType: [11] },
    { name: '访客名称', key: 2, excludeType: [11] },
    { name: '访客标签', key: 3, type: [1, 3, 21, 22, 23] },  //type:推送接口key
    { name: '访客id', key: 4, type: [1] },
    { name: '客人类别', key: 3, type: [2, 4] },
    { name: '客户类型', key: 3, type: [6, 12, 14, 18] },
    { name: '访客电话', key: 6, type: [1, 7, 5] },
    { name: '对话结果', key: 1401, type: [14] },
    { name: '美洽QQ', key: 1402, type: [14] },
    { name: '美洽tel', key: 1403, type: [14] },
    { name: '美洽weixin', key: 1404, type: [14] },
    { name: '对话分级', key: 1405, type: [14] },
    { name: '对话类型', key: 5, type: [3, 5, 6, 12, 21, 22, 23] },
    { name: '手机号码', key: 1201, type: [6, 12] },
    { name: '手机号码', key: 501, type: [5], excludeChannel: [1] },
    { name: '名片备注', key: 1202, type: [6, 12] },
    { name: '备注说明', key: 1203, type: [6, 12, 22, 23] },
    { name: '对话归类', key: 1204, type: [6, 12] },
    { name: '联系人名称', key: 1205, type: [6, 12] },
    { name: '快商通微信', key: 1206, type: [12] },
    { name: '快商通qq', key: 1207, type: [12] },
    { name: 'IP定位', key: 401, type: [4, 2] },
    { name: '状态', key: 1101, type: [11] },
    { name: '易聊通qq', key: 502, type: [5] },
    { name: '易聊通msn', key: 503, type: [5] },
    { name: '扩展字段1', key: 5101, type: [5] },
    { name: '扩展字段2', key: 5102, type: [5] },
    { name: '扩展字段3', key: 5103, type: [5] },
    { name: '扩展字段4', key: 5104, type: [5] },
    { name: '扩展字段5', key: 5105, type: [5] },
    { name: '用户阶段', key: 2301, type: [23] },
    { name: '53邮箱', key: 101, type: [1] },
    { name: '53QQ', key: 102, type: [1] },
    { name: '53微信', key: 103, type: [1] },
    { name: '客服名称', key: 104, type: [1] },
    { name: '来源风格', key: 105, type: [1] },
  ];

  //可以设置公共部分的第三方聊天
  public hasConversionSetType = [1, 3, 2, 4, 5, 6, 7, 12, 14, 15, 11, 18, 21, 22, 23];
  //可以设置转化逻辑的第三方聊天
  public hasConversionSetTypeRule = [1, 3, 2, 4, 5, 6, 7, 12, 14, 11, 18, 21, 22, 23];

  public defaultJsKeywordPublisher = [
    { key: '0', name: '全部' },
    { key: '1_1', name: '百度SEM' },
    { key: '1_2', name: '搜狗SEM' },
    { key: '1_3', name: '360SEM' },
    { key: '1_4', name: '神马SEM' },
    { key: '2_1', name: '百度信息流' },
    { key: '2_6', name: '广点通' },
    { key: '2_7', name: '头条信息流' },
    { key: '1_7', name: '头条搜索' },
    { key: '100000', name: '其他' },
  ];
  public jsKeywordPublisher = [];  // 初始化JS对应不到关键词逻辑的媒体
  public publishItems = [];  // 初始化JS归到默认户处理的媒体

  public accountObj = {};  //

  public publisherData = [];

  public accountPublishers = [];
  public compainObj = {};

  public keywordPublisherIdDefault = {
    '1': [
      { name: '全部', key: 0 },
      { name: '百度', key: 1 },
      { name: '搜狗', key: 2 },
      { name: '360', key: 3 },
      { name: '神马', key: 4 },
    ],
    '2': [
      { name: '全部', key: 0 },
      { name: '百度', key: 1 },
      { name: '广点通', key: 6 },
      { name: '今日头条', key: 7 },
    ]
  };

  public keyword_publisher_id = [];
  public showPublic = false;
  public currentFileList: any;
  public customReq: any;
  public baseDefaultRule: any;

  // 公共规则
  public defaultRule = {
    is_match_case: 1, //1, 区分大小写   0, 不区分大小写
    js_attribution_desc: {  // 优先归属加追踪码页面
      js_keyword: false,
      attribution_url: "last_url"
    },
    device_desc: {
      rules: [//设备 url_code:自定义规则  referer:来源  chat_tool:聊天工具提供的设备
        { key: 'referer', is_active: false },
        { key: 'url_code', is_active: false },
        { key: 'chat_tool', is_active: false },
      ],
      data_url: ['lp'], //lp:落地页   tp:对话页 ；  第一个预算表示首先选择判断，第二个元素表示候补
      url_code_values_lp: [{ device: 'pc', rules: '' }],
      url_code_values_tp: [{ device: 'pc', rules: '' }],
      alternateLp: false, //lp候补
      alternateTP: false, //tp候补
      is_valid: false, //url判断
    },
    media_desc: {
      rules: [//媒体 jzl_code:九枝兰参数  referer:来源  url_code:自定义规则
        { key: 'referer', is_active: false },
        { key: 'url_code', is_active: false }
      ],
      data_url: ['lp'], //lp:落地页   tp:对话页 ；  第一个预算表示首先选择判断，第二个元素表示候补
      url_code_values: [{ product_key: null, rules: '' }],
    },
    mismatched_keyword_desc: { //对应不到关键词逻辑
      rules: {
        into_account: false,
        referer_tag: false,
        trace_rule: ["jzl_code"],
        data_url: ['lp'], //lp:落地页   tp:对话页 ；  第一个预算表示首先选择判断，第二个元素表示候补
        miss_deal_rule: "ignore", //ignore:忽略  into_account:归到账户
        custom_miss_values: [
          {
            product_key: '0', // 0 all
            chan_pub_id: null,
            rules: '',
            rules2: '',
            rules10: ''
          }
        ],  // 对应不到关键词
        default_belong_rule: "belong", //ignore:忽略  belong:归属
        default_belong_values: [//归到默认户处理
          {
            product_key: null,
            chan_pub_id: null,
            campaign_id: null,
            virtual_account: 1,
          }
        ],
      }
    },

    keyword_tracking_desc: {  //关键词转化追踪逻辑
      use_wildcards: false
    },
    conver_time_desc: {  //转化时间逻辑
      rules: 'first_view_time', //first_view_time：访客进入落地页时间  talk_time：访客进入对话页时间
    },
    conver_biz_desc: { // 业务单元转化逻辑
      data_url: ['lp'], //lp:落地页   tp:对话页 ；  第一个预算表示首先选择判断，第二个元素表示候补
      rules: [
        { key: 'url_code', is_active: false },
        { key: 'txt', is_active: false },
        { key: 'se_txt', is_active: false },
        { key: 'chat_guest_name', is_active: false },
        { key: 'chat_guest_category', is_active: false }],
      alternateLp: false, //lp候补
      alternateTP: false, //tp候补
      is_valid: false, //url判断
    },

    remove_duplication_desc: {
      rules: "no_distinct"
    }, //去重逻辑  ip:IP  guest_id:访客身份

    chat_conversion_logic: { //转化逻辑
      rules: [
        [{
          condition_type: null,
          condition_details: { match_type: 100, txt_list: '', type: 'all', left_op: 5, right_op: null }
        }]
      ]
    }
  };


  public chat_conversion_logic = { //转化逻辑
    rules: [
      [{
        condition_type: null,
        condition_details: { match_type: 100, txt_list: '', type: 'all', left_op: 5, right_op: null }
      }]
    ]
  };
  public unitName = {
    url_code: '判断url',
    txt: '计划/单元/关键词',
    se_txt: '搜索词',
    chat_guest_name: '访客名称',
    chat_guest_category: '访客类别'
  };
  public canMoveAttr = {
    media: [
      { key: 'referer', is_active: false },
      { key: 'url_code', is_active: false }],
    device: [
      { key: 'referer', is_active: false },
      { key: 'url_code', is_active: false },
      { key: 'chat_tool', is_active: false }],
    biz_unit: [
      { key: 'url_code', is_active: false },
      { key: 'txt', is_active: false },
      { key: 'se_txt', is_active: false },
      { key: 'chat_guest_name', is_active: false },
      { key: 'chat_guest_category', is_active: false }]

  };
  public operator_name = {
    operatorType: [ // 100,大于  200,等于  300,大于等于  400,小于  500,小于等于  600,介于
      { key: 100, name: '大于' },
      { key: 200, name: '等于' },
      { key: 300, name: '大于等于' },
      { key: 400, name: '小于' },
      { key: 500, name: '小于等于' },
      { key: 600, name: '介于' },
    ],
    relationType: [ // 100,包含  200,不包含  300,等于  400,不等于  500,为空  600,不为空
      { key: 100, name: '包含' },
      { key: 200, name: '不包含' },
      { key: 300, name: '等于' },
      { key: 400, name: '不等于' },
      { key: 500, name: '为空' },
      { key: 600, name: '不为空' },
    ]
  };

  public publicConversionDetail: any;

  public conversionSourceType = []; //数据来源
  public conversionImType = []; //推送方式
  public submitting = false;
  conversionForm: FormGroup;
  //转化描述
  public conversionDescForm = [];
  public conversionDescList = [];
  public conversionContentTypeList = [];
  public current_channel_id: number;
  public productInfo = {};


  constructor(private fb: FormBuilder,
    private manageService: ManageService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private defineSettingService: DefineSettingService,
    private customDataService: CustomDatasService,
    private modalSubject: NzModalRef,
    public menuService: MenuService,
    public authService: AuthService,
    private productService: ProductDataService

  ) {

    this.conversionForm = this.fb.group({
      conversion_name: [''],
      conver_source_type: [1]
    });
    this.conversionSourceType = this.manageService.getConversionSourceTypeItems();
    this.conversionImType = this.manageService.getConversionImTypeItems();

    this.customDataService.dealProductData().then(() => {
      this.publisherData = [...this.customDataService.productList];
      // this.keyword_publisher_id = [...[{name: '全部', key: 0}],...this.customDataService.publisherList];
    });

    this.keyword_publisher_id = this.keywordPublisherIdDefault[this.menuService.currentChannelId];

    this.current_channel_id = this.menuService.currentChannelId;
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  ngOnInit() {
    this.jsKeywordPublisher = JSON.parse(JSON.stringify(this.defaultJsKeywordPublisher));
    this.publishItems = JSON.parse(JSON.stringify(this.defaultJsKeywordPublisher));

    this.manageService.getAdvertiserList({}, { result_model: 'all', need_publish_account: 0 }).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        this.advertiserList = result['data'];
        if (this.advertiserList.length === 1) {
          this.defaultConversion.cid = this.advertiserList[0]['cid'];
          this.get53AppList();
          this.getOauthList();
          this.getSWTList(); //获取商务通列表
          this.getYLTList(); //获取易聊通列表
          this.getMqAppList(); //获取美洽列表
          this.getMoorList();
          this.getCepMoorList();
        }
      } else if (result['status_code'] && result.status_code === 201) {
        this.message.error('广告主名称已经存在，请重试');
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
        this.doCancel();
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else {
        this.message.error(result.message);
      }
    }, (err) => {

      this.message.error('系统异常，请重试');
    });
    if (!this.conversionDataId) {
      this.baseDefaultRule = JSON.parse(JSON.stringify(this.defaultRule));
    }
    //转化描述
    this.conversionContentTypeList = this.getContentTypeListByType(this.im_push_type);
    this.getFilterConversionDescList();
  }

  // 转化描述 --- 设置已存在的不可用
  onContentTypeChange() {
    const selected_items = this.conversionDescForm.map(item => item.conversion_desc_key);
    this.conversionDescList.map(item => {
      item['disabled'] = selected_items.includes(item.key);
    });

  }

  getFilterConversionDescList() {
    this.defineSettingService
      .getFilterConversionDescList({
        list_type: 'filter',
        user_id: this.authService.getCurrentAdminOperdInfo().select_uid,
        cid: this.defaultConversion.cid,
        conver_source_type: this.defaultConversion.conver_source_type,
        im_push_type: this.im_push_type
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.conversionDescList = results['data'];

            // 转化描述 --- 设置已存在的不可用
            this.onContentTypeChange();
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        }
      );
  }

  addDesc() {
    this.conversionDescForm.push({
      conversion_desc_key: '',
      conversion_key: ''
    });
  }

  deleteDesc(index) {
    const target = this.conversionDescForm.splice(index, 1);
    this.conversionDescList.map(item => {
      if (target[0]['conversion_desc_key'] === item.key) {
        item.disabled = false;
      }
    });

  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  changeJsMediaPublisher() { // 修改Js转化所属媒体逻辑下的媒体

    this.defaultRule.media_desc.url_code_values.forEach((publisher) => {
      const len = this.jsKeywordPublisher.length;
      const item = this.publisherData.filter((filter) => {
        return filter.key === publisher.product_key;
      });
      const exit = this.jsKeywordPublisher.filter((filter) => {
        return filter.key === publisher.product_key;
      });
      if (!exit.length && item.length) {
        this.jsKeywordPublisher.splice(len - 1, 0, item[0]);
        this.publishItems.splice(len - 1, 0, item[0]);
      }
    });

    const defaultProductKeyMap = this.defaultJsKeywordPublisher.map(item => item.key);
    this.jsKeywordPublisher.forEach((publisher, idx) => {
      if (!defaultProductKeyMap.includes(publisher.key)) {
        const exit = this.defaultRule.media_desc.url_code_values.filter((filter) => {
          return filter.product_key === publisher.key;
        });
        if (!exit.length) {
          this.jsKeywordPublisher.splice(idx, 1);
          this.publishItems.splice(idx, 1);
        }
      }
    });

    // 重置对应不到关键词逻辑下的媒体及归到默认户处理下的媒体
    const defaultUrlCodeProductKeyMap = this.defaultRule.media_desc.url_code_values.map(item => item.product_key);

    for (let i = 0; i < this.defaultRule.mismatched_keyword_desc.rules.custom_miss_values.length; i++) {
      if (![...defaultUrlCodeProductKeyMap, ...this.defaultJsKeywordPublisher.map(item => item.key)].includes(this.defaultRule.mismatched_keyword_desc.rules.custom_miss_values[i].product_key) && this.defaultRule.mismatched_keyword_desc.rules.custom_miss_values[i].product_key !== '0' && this.defaultRule.mismatched_keyword_desc.rules.custom_miss_values[i].product_key !== '100000') {
        if (this.defaultRule.mismatched_keyword_desc.rules.custom_miss_values.length > 1) {
          this.defaultRule.mismatched_keyword_desc.rules.custom_miss_values.splice(i, 1);
          i--;
        } else {
          this.defaultRule.mismatched_keyword_desc.rules.custom_miss_values = [
            {
              product_key: '0',
              chan_pub_id: null,
              rules: '',
              rules2: '',
              rules10: ''
            }
          ];
        }
      }
    }
    this.defaultRule.mismatched_keyword_desc.rules.custom_miss_values = deepCopy(this.defaultRule.mismatched_keyword_desc.rules.custom_miss_values);

    for (let j = 0; j < this.defaultRule.mismatched_keyword_desc.rules.default_belong_values.length; j++) {
      if (![...defaultUrlCodeProductKeyMap, ...this.defaultJsKeywordPublisher.map(item => item.key)].includes(this.defaultRule.mismatched_keyword_desc.rules.default_belong_values[j].product_key) && this.defaultRule.mismatched_keyword_desc.rules.default_belong_values[j].product_key !== '0' && this.defaultRule.mismatched_keyword_desc.rules.default_belong_values[j].product_key !== '100000') {
        if (this.defaultRule.mismatched_keyword_desc.rules.default_belong_values.length > 1) {

          this.defaultRule.mismatched_keyword_desc.rules.default_belong_values.splice(j, 1);
          j--;
        } else {
          this.defaultRule.mismatched_keyword_desc.rules.default_belong_values = [
            {
              product_key: null,
              chan_pub_id: null,
              campaign_id: null,
              virtual_account: 1
            }
          ];
        }
      }
    }

    this.defaultRule.mismatched_keyword_desc.rules.default_belong_values = deepCopy(this.defaultRule.mismatched_keyword_desc.rules.default_belong_values);
  }

  // 筛选归到默认户处理下的媒体
  getFilterPublishItems() {
    const filter_item = this.defaultRule.mismatched_keyword_desc.rules.default_belong_values.map(item => item.product_key);
    this.publishItems.map((publisher) => {
      publisher['isSelected'] = filter_item.includes(publisher.key);
    });
  }

  // JS归到默认户处理的媒体
  changeDefaultBelongValueSlt(defaultBelongValue) {
    this.getFilterPublishItems();

    defaultBelongValue.chan_pub_id = null;
    defaultBelongValue.campaign_id = null;
  }


  changeKeywordPublisher(keywordItem, item) {
    keywordItem['chan_pub_id'] = null;
    // item = null;
  }

  addVisitorNameCondition(index) {
    const singleVistorSetting = {
      "connector": "and",
      "operator": "=",
      "value": ""
    };
    const distIndex = index + 1;
    this.chatDefaultConversion.content_detail.visitor_name.splice(distIndex, 0, Object.assign({}, singleVistorSetting));
  }

  addVisitorTagCondition(index) {
    const singleVistorSetting = {
      "connector": "and",
      "operator": "=",
      "value": ""
    };
    const distIndex = index + 1;
    this.chatDefaultConversion.content_detail.visitor_tag.splice(distIndex, 0, Object.assign({}, singleVistorSetting));
  }


  addVisitorNameConditionTong(index) {
    const singleVistorSetting = {
      "connector": "and",
      "operator": "=",
      "value": ""
    };
    const distIndex = index + 1;
    this.chatBusinessConversion.content_detail.visitor_category.splice(distIndex, 0, Object.assign({}, singleVistorSetting));
  }


  addApiSetting() {
    const apiSetting = {
      "app_id": "",
      "app_secret": "",
      "valid": false
    };
    this.chatApi53.apiSettings.push(apiSetting);
  }

  checkApiSettingValid(apiSetting) {

    const params = {
      'cmd': '53kf_token',
      'appid': apiSetting.app_id,
      'appsecret': apiSetting.app_secret,
      cid: this.defaultConversion.cid
    };
    this.defineSettingService.check53KFAppSecret(params).subscribe((result) => {
      if (result && result['status_code'] === 200) {
        this.message.success('验证成功');
        apiSetting['valid'] = true;
      } else {
        this.message.error('验证失败');
      }

    }, (error) => {
      this.message.error('验证失败');
    }, () => {

    });


  }

  removeVisitorNameCondition(index) {
    if (this.chatDefaultConversion.content_type !== 'visitor_name') {
      return false;
    }
    this.chatDefaultConversion.content_detail.visitor_name.splice(index, 1);
  }

  removeVisitorTagCondition(index) {
    if (this.chatDefaultConversion.content_type !== 'visitor_tag') {
      return false;
    }
    this.chatDefaultConversion.content_detail.visitor_tag.splice(index, 1);
  }

  removeVisitorNameConditionTong(index) {
    if (this.chatBusinessConversion.content_type !== 'visitor_name') {
      return false;
    }
    this.chatBusinessConversion.content_detail.visitor_category.splice(index, 1);
  }

  removeApiSetting(index, data?) {
    if (data) {
      data.apiSettings.splice(index, 1);
    } else {
      this.chatApi53.apiSettings.splice(index, 1);

    }
  }

  //将textarea内容转化为数组
  getTextareaArray(textareaString) {
    const textareaArray = [];
    if (textareaString) {
      textareaString.split('\n').forEach((item) => {
        if (item.match(/^\s+$/)) {
        } else if (item !== '') {
          textareaArray.push(item.replace(/(^\s*)|(\s*$)/g, ""));
        }
      });
    }
    return textareaArray;

  }

  //将数组转化为以 \n 分隔的字符串
  getStringByArray(dataArray) {
    let dataString = "";
    if (dataArray && dataArray.length > 0) {
      dataString = dataArray.join('\n');
    }
    return dataString;
  }

  //判断是否选中 通过Url标记来判断 的 着陆页URL
  /*
  * data:需要遍历的数据数组
  * name：判断对比的名字
  * */
  verificationIsActive(data, name) {
    let is_url = false;
    for (let j = 0; j < data.length; j++) {
      if (data[j]['key'] === name && data[j]['is_active']) {
        is_url = true;
        break;
      }
    }
    return is_url;
  }

  /*
  * 判断此时选择的推送方式是否有转化设置*/
  getHasConversionSetType() {
    let result = false;
    if (this.hasConversionSetType.indexOf(this.im_push_type) !== -1) {
      result = true;
    } else {
      result = false;
    }
    return result;

  }

  /*
  * 判断此时选择的推送方式是否有转化设置*/
  getHasConversionSetTypeRule() {
    let result = false;
    if (this.hasConversionSetTypeRule.indexOf(this.im_push_type) !== -1) {
      result = true;
    } else {
      result = false;
    }
    return result;

  }

  getAccountLists() {
    this.accountObj = {};

    const postBody = {
      'pConditions': []
    };
    postBody.pConditions = [{ key: "cid", name: "广告主", op: "=", value: this.defaultConversion.cid }];
    this.manageService.getAccountList(postBody, { result_model: 'all' }).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {

        } else {
          this.accountObj['publisher_id_0'] = [
            { chan_pub_id: '', pub_account_name: '请选择' }
          ];
          this.accountObj['publisher_id_100000'] = [
            { chan_pub_id: '', pub_account_name: '请选择' }
          ];

          this.accountPublishers = results.data;
          // let publisherIds = this.menuService.currentChannelId===1?[1,2,3,4]:[1,6,7]

          this.accountPublishers.forEach(item => {

            if (this.accountObj['publisher_id_' + item['channel_id'] + '_' + item['publisher_id']] === undefined) {
              this.accountObj['publisher_id_' + item['channel_id'] + '_' + item['publisher_id']] = [];
              this.accountObj['publisher_id_' + item['channel_id'] + '_' + item['publisher_id']].push({
                chan_pub_id: '',
                pub_account_name: '请选择'
              });
              this.accountObj['publisher_id_' + item['channel_id'] + '_' + item['publisher_id']].push(item);
            } else {
              this.accountObj['publisher_id_' + item['channel_id'] + '_' + item['publisher_id']].push(item);
            }

            if (item['publisher_id'] > 1000) {
              this.accountObj['publisher_id_100000'].push(item);
            }

            this.accountObj['publisher_id_0'].push(item);

          });

          // 根据账户得到计划列表 ----- 归到默认户处
          this.defaultRule.mismatched_keyword_desc.rules.default_belong_values.forEach((defaultBelong, idx) => {
            if (defaultBelong.virtual_account !== 1) {
              this.changeAccount(this.accountObj['publisher_id_' + defaultBelong.product_key], 'publisher_id_' + defaultBelong.product_key, defaultBelong);
            }
          });

        }
      },
      (err: any) => {
        // this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );
  }

  getCampaignListByAccount(body, name, editSource) {
    this.defineSettingService.getCampaignListByAccount(body).subscribe(
      (result) => {
        this.compainObj[name] = result.data;
        if (this.compainObj[name].length) {
          this.compainObj[name].unshift({ pub_campaign_id: '', pub_campaign_name: '请选择' });
        }
      },
      (error) => {

      }
    );
  }

  changeAccount(accountList, name, defaultBelongValue, editSource?) {
    if (editSource) {
      defaultBelongValue.campaign_id = null;
    }

    if (accountList && accountList.length) {
      accountList.forEach((accountItem) => {
        if (accountItem.chan_pub_id * 1 === defaultBelongValue.chan_pub_id * 1) {
          defaultBelongValue.virtual_account = accountItem.virtual_account;
          this.getCampaignListByAccount({
            chan_pub_id: accountItem.chan_pub_id,
            pub_account_id: accountItem.pub_account_id,
            cid: this.defaultConversion.cid
          }, name, editSource);
        }
      });
    }

  }


  doSave() {
    let resultConversion = {
      cid: 0,
      conver_name: "",
      conver_data_type: 2,
      conver_source_type: 2,
    };

    const publicConversion = {
      conver_source_type: 2,
      im_push_type: null,
      conver_desc_setting: []
    };
    publicConversion['im_push_type'] = 0;
    if (this.defaultConversion.conver_source_type === 2) {
      //格式化转化描述数据
      this.conversionDescForm.map(item => {
        if ([item['conversion_desc_key']] && item['conversion_key']) {
          const obj = {
            [item['conversion_desc_key']]: item['conversion_key']
          };
          publicConversion['conver_desc_setting'].push(obj);
        }
      });

    } else {
      this.conversionDescForm.map(item => {
        if (item.conversion_desc_key !== '') {
          publicConversion['conver_desc_setting'].push(item);
        }
      });
    }


    resultConversion = Object.assign(resultConversion, this.defaultConversion);
    resultConversion['im_push_type'] = this.im_push_type;
    if (resultConversion.cid < 1) {
      this.message.error('请选择广告主');
      return false;
    }
    if (resultConversion.conver_name === '') {
      this.message.error('请填写转化名称');
      return false;
    }
    if (resultConversion.conver_source_type === 2) {
      if (this.im_push_type === 1) { //53kf 接口
        let apiSettingValid = true;
        for (let i = 0; i < this.chatApi53.apiSettings.length; i++) {
          if (!this.chatApi53.apiSettings[i].valid) {
            apiSettingValid = false;
            break;
          }
        }
        if (!apiSettingValid) {
          this.message.error('请完善53kf接口参数设置，并验证通过');
          return false;
        }

      }
      if (this.im_push_type === 2) { //商务通excel
        resultConversion['conver_desc'] = Object.assign({}, this.chatBusinessConversion);
      }

      if (this.im_push_type === 4) { //商务通 接口
        let swtApiSettingValid = true;
        for (let i = 0; i < this.swtApiList.apiSettings.length; i++) {
          if (!this.swtApiList.apiSettings[i].id) {
            swtApiSettingValid = false;
            break;
          }
        }
        if (!swtApiSettingValid) {
          this.message.error('请完善商务通接口参数设置');
          return false;
        }
      }
      if (this.im_push_type === 5) { //易聊通 接口
        let yltApiSettingValid = true;
        for (let i = 0; i < this.yltApiList.apiSettings.length; i++) {
          if (!this.yltApiList.apiSettings[i].id) {
            yltApiSettingValid = false;
            break;
          }
        }
        if (!yltApiSettingValid) {
          this.message.error('请完善易聊通接口参数设置');
          return false;
        }
      }
    }

    if (resultConversion.conver_source_type === 2 || resultConversion.conver_source_type === 3 || resultConversion.conver_source_type === 4 || resultConversion.conver_source_type === 5) {

      const newDefaultRule = JSON.parse(JSON.stringify(this.defaultRule));
      let nullIndex = 0;
      //关键词
      if (newDefaultRule.mismatched_keyword_desc.rules.miss_deal_rule === 'into_account') {
        let keywordDescValid = true;

        for (let i = 0; i < newDefaultRule.mismatched_keyword_desc.rules.custom_miss_values.length; i++) {
          newDefaultRule.mismatched_keyword_desc.rules.custom_miss_values[i].rules = this.getTextareaArray(newDefaultRule.mismatched_keyword_desc.rules.custom_miss_values[i].rules);
          newDefaultRule.mismatched_keyword_desc.rules.custom_miss_values[i].rules2 = this.getTextareaArray(newDefaultRule.mismatched_keyword_desc.rules.custom_miss_values[i].rules2);
          newDefaultRule.mismatched_keyword_desc.rules.custom_miss_values[i].rules10 = this.getTextareaArray(newDefaultRule.mismatched_keyword_desc.rules.custom_miss_values[i].rules10);
          if (!newDefaultRule.mismatched_keyword_desc.rules.custom_miss_values[i].chan_pub_id || newDefaultRule.mismatched_keyword_desc.rules.custom_miss_values[i].rules.length === 0) {
            keywordDescValid = false;
            nullIndex = i + 1;
            break;
          }
        }

        if (!keywordDescValid) {
          const indexStr = '--第' + nullIndex + '项';
          if (this.menuService.currentChannelId === 1) {
            this.message.error('请完善对应不到关键词逻辑--通过Url标记来判断' + indexStr, { nzDuration: 10000 });
          } else if (this.menuService.currentChannelId === 2) {
            this.message.error('请完善对应不到创意逻辑--通过Url标记来判断' + indexStr, { nzDuration: 10000 });
          }
          return false;
        }

        if (newDefaultRule.mismatched_keyword_desc.rules.into_account) {
          let defaultBelongValid = true;

          for (let i = 0; i < newDefaultRule.mismatched_keyword_desc.rules.default_belong_values.length; i++) {
            if (newDefaultRule.mismatched_keyword_desc.rules.default_belong_values[i].product_key === null || newDefaultRule.mismatched_keyword_desc.rules.default_belong_values[i].chan_pub_id === null) {
              defaultBelongValid = false;
              nullIndex = i + 1;
              break;
            }
          }

          if (!defaultBelongValid) {
            const indexStr = '--第' + nullIndex + '项';
            if (this.menuService.currentChannelId === 1) {
              this.message.error('请完善对应不到关键词逻辑--通过Url标记来判断--归到默认户处理' + indexStr, { nzDuration: 10000 });
            } else if (this.menuService.currentChannelId === 2) {
              this.message.error('请完善对应不到创意逻辑--通过Url标记来判断--归到默认户处理' + indexStr, { nzDuration: 10000 });
            }
            return false;
          }
        }
      }

      //媒体
      if (this.verificationIsActive(newDefaultRule.media_desc.rules, 'url_code')) { //判断媒体 通过Url标记来判断
        let mediaDescValid = true;
        for (let i = 0; i < newDefaultRule.media_desc.url_code_values.length; i++) {
          newDefaultRule.media_desc.url_code_values[i].rules = this.getTextareaArray(newDefaultRule.media_desc.url_code_values[i].rules);
          if (!newDefaultRule.media_desc.url_code_values[i].product_key || newDefaultRule.media_desc.url_code_values[i].rules.length === 0) {
            mediaDescValid = false;
            nullIndex = i + 1;
            break;
          }
        }
        if (!mediaDescValid) {
          const indexStr = '--第' + nullIndex + '项';
          this.message.error('请完善转化所属媒体逻辑--通过Url标记来判断' + indexStr, { nzDuration: 10000 });
          return false;
        }
      }
      //设备
      if (newDefaultRule.device_desc.data_url[0] === 'lp' && this.verificationIsActive(newDefaultRule.device_desc.rules, 'url_code')) { //判断设备 通过Url标记来判断
        let deviceDescValid = true;
        newDefaultRule.device_desc.url_code_values_lp[0].rules = this.getTextareaArray(newDefaultRule.device_desc.url_code_values_lp[0].rules);
        if (!newDefaultRule.device_desc.url_code_values_lp[0].device || newDefaultRule.device_desc.url_code_values_lp[0].rules.length === 0) {
          deviceDescValid = false;
        }
        if (!deviceDescValid) {
          this.message.error('请完善转化设备逻辑--通过Url标记来判断', { nzDuration: 10000 });
          return false;
        }
      }
      if (newDefaultRule.device_desc.data_url[0] === 'tp' && this.verificationIsActive(newDefaultRule.device_desc.rules, 'url_code')) { //判断设备 通过Url标记来判断
        let deviceDescValid = true;
        newDefaultRule.device_desc.url_code_values_tp[0].rules = this.getTextareaArray(newDefaultRule.device_desc.url_code_values_tp[0].rules);
        if (!newDefaultRule.device_desc.url_code_values_tp[0].device || newDefaultRule.device_desc.url_code_values_tp[0].rules.length === 0) {
          deviceDescValid = false;
        }
        if (!deviceDescValid) {
          this.message.error('请完善转化设备逻辑--通过Url标记来判断', { nzDuration: 10000 });
          return false;
        }
      }

      //转化逻辑
      let conversionValid = true;
      let conversionValidMessage = '';
      const copy_chat_conversion_logic = JSON.parse(JSON.stringify(this.chat_conversion_logic));
      const newChat_conversion_logic = { rules: [] };
      for (let i = 0; i < copy_chat_conversion_logic.rules.length; i++) {

        const conversionItem = [];
        for (let j = 0; j < copy_chat_conversion_logic.rules[i].length; j++) {
          if (copy_chat_conversion_logic.rules[i][j]['condition_type'] && copy_chat_conversion_logic.rules[i][j]['condition_type'] === 1 && (!(copy_chat_conversion_logic.rules[i][j]['condition_details']['left_op']) && copy_chat_conversion_logic.rules[i][j]['condition_details']['left_op'] !== 0)) { //对话数
            conversionValid = false;
            conversionValidMessage = '对话数不能为空';
            break;
          }
          if (copy_chat_conversion_logic.rules[i][j]['condition_type'] && copy_chat_conversion_logic.rules[i][j]['condition_type'] === 1 && (copy_chat_conversion_logic.rules[i][j]['condition_details']['left_op'] < 0)) { //对话数
            conversionValid = false;
            conversionValidMessage = '对话数不能为负数，必须为 >=0 的数字';
            break;
          }
          //判断介于右边值
          if (copy_chat_conversion_logic.rules[i][j]['condition_type'] && copy_chat_conversion_logic.rules[i][j]['condition_type'] === 1 && copy_chat_conversion_logic.rules[i][j]['condition_details']['match_type'] === 600 && (!(copy_chat_conversion_logic.rules[i][j]['condition_details']['right_op']) && copy_chat_conversion_logic.rules[i][j]['condition_details']['right_op'] !== 0)) { //对话数
            conversionValid = false;
            conversionValidMessage = '对话数不能为空';
            break;
          }
          if (copy_chat_conversion_logic.rules[i][j]['condition_type'] && copy_chat_conversion_logic.rules[i][j]['condition_type'] === 1 && copy_chat_conversion_logic.rules[i][j]['condition_details']['match_type'] === 600 && (copy_chat_conversion_logic.rules[i][j]['condition_details']['right_op'] < 0)) { //对话数
            conversionValid = false;
            conversionValidMessage = '对话数不能为负数，必须为 >=0 的数字';
            break;
          }
          if (copy_chat_conversion_logic.rules[i][j]['condition_type'] && copy_chat_conversion_logic.rules[i][j]['condition_type'] !== 1 && (copy_chat_conversion_logic.rules[i][j]['condition_details']['match_type'] !== 600 && copy_chat_conversion_logic.rules[i][j]['condition_details']['match_type'] !== 500) && copy_chat_conversion_logic.rules[i][j]['condition_details']['txt_list'].length === 0) {
            conversionValid = false;
            conversionValidMessage = '请完善转化逻辑设置';
            break;
          }
          if (copy_chat_conversion_logic.rules[i][j]['condition_type'] && this.chat_conversion_logic.rules[i][j]['condition_type'] !== 1 && (copy_chat_conversion_logic.rules[i][j]['condition_details']['match_type'] !== 600 && copy_chat_conversion_logic.rules[i][j]['condition_details']['match_type'] !== 500) && copy_chat_conversion_logic.rules[i][j]['condition_details']['txt_list'].length > 0) {
            copy_chat_conversion_logic.rules[i][j]['condition_details']['txt_list'] = this.getTextareaArray(copy_chat_conversion_logic.rules[i][j]['condition_details']['txt_list']);
          }
          if (copy_chat_conversion_logic.rules[i][j]['condition_type']) {
            conversionItem.push(copy_chat_conversion_logic.rules[i][j]);
          }
        }
        if (!conversionValid) {
          break;
        }
        if (conversionItem.length) {
          newChat_conversion_logic.rules.push(conversionItem);
        }
      }
      if (!conversionValid) {
        this.message.error(conversionValidMessage, { nzDuration: 10000 });
        return false;
      }
      const current_Chat_conversion_logic = [];
      newChat_conversion_logic.rules.forEach(item => {
        const conversion = [];
        const conversionObj = {};
        item.forEach(ruleItem => {

          if (ruleItem['condition_type'] === 1) {
            /*   conversionObj['conversion_' + ruleItem['condition_type']] = {
                 count : 1,
                 condition_details: {}
               };
               conversionObj['conversion_' + ruleItem['condition_type']]['condition_details'] = ruleItem['condition_details'];
   */
            if (conversionObj['conversion_' + ruleItem['condition_type']] && conversionObj['conversion_' + ruleItem['condition_type']]['count']) {
              conversionObj['conversion_' + ruleItem['condition_type']]['condition_details'].push({
                condition_type: ruleItem['condition_type'],
                condition_details: ruleItem['condition_details']
              });
            } else {
              conversionObj['conversion_' + ruleItem['condition_type']] = {
                count: 1,
                condition_details: []
              };
              conversionObj['conversion_' + ruleItem['condition_type']]['condition_details'].push({
                condition_type: ruleItem['condition_type'],
                condition_details: ruleItem['condition_details']
              });
            }
          } else {
            if (conversionObj['conversion_' + ruleItem['condition_type']] && conversionObj['conversion_' + ruleItem['condition_type']]['count']) {
              conversionObj['conversion_' + ruleItem['condition_type']]['condition_details'].push(ruleItem['condition_details']);
            } else {
              conversionObj['conversion_' + ruleItem['condition_type']] = {
                count: 1,
                condition_details: []
              };
              conversionObj['conversion_' + ruleItem['condition_type']]['condition_details'].push(ruleItem['condition_details']);
            }
          }

        });
        for (const i in conversionObj) {
          if (i) {
            // @ts-ignore
            const condition_type = i.split('_')[1] * 1;
            if (condition_type === 1) {
              conversion.push(...conversionObj[i]['condition_details']);
            } else {
              conversion.push({
                condition_type: condition_type,
                condition_details: conversionObj[i]['condition_details']
              });
            }
            /* conversion.push({
               condition_type: condition_type,
               condition_details: conversionObj[i]['condition_details']
             });*/
          }

        }
        current_Chat_conversion_logic.push(conversion);
      });

      //转化逻辑
      if (this.getHasConversionSetType()) {
        resultConversion['conver_desc'] = Object.assign({}, { rules: current_Chat_conversion_logic });
      }

      publicConversion['cid'] = this.defaultConversion.cid;
      publicConversion['conver_source_type'] = this.defaultConversion.conver_source_type;

      publicConversion['im_push_type'] = (this.defaultConversion.conver_source_type === 3 || this.defaultConversion.conver_source_type === 4 || this.defaultConversion.conver_source_type === 5) ? 0 : this.im_push_type;


      //合并参数
      //--区分大小写--start--//
      publicConversion['is_match_case'] = newDefaultRule.is_match_case;
      //--区分大小写--end--//

      // 是否优先归属加追踪码页面--start--//
      publicConversion['js_attribution_desc'] = newDefaultRule.js_attribution_desc;
      // 是否优先归属加追踪码页面--end--//

      //--设备--start--//
      publicConversion['device_desc'] = {
        rules: [],
        data_url: newDefaultRule.device_desc.data_url,
        url_code_values: [],
        is_valid: newDefaultRule.device_desc.is_valid
      };
      // if (((resultConversion.conver_source_type === 4 || resultConversion.conver_source_type === 5) && !newDefaultRule.device_desc.is_valid)) {
      //   publicConversion['device_desc'].rules = [];
      //   publicConversion['device_desc'].url_code_values = [];
      // } else {
      const device_desc_rules = [];
      newDefaultRule.device_desc.rules.forEach(item => {
        if (item['is_active']) {
          device_desc_rules.push(item['key']);
        }
      });
      publicConversion['device_desc'].rules = device_desc_rules;
      if (this.verificationIsActive(newDefaultRule.device_desc.rules, 'url_code')) {
        if (newDefaultRule.device_desc.data_url[0] === 'lp') {
          newDefaultRule.device_desc.alternateLp ? publicConversion['device_desc'].data_url[1] = 'tp' : publicConversion['device_desc'].data_url = publicConversion['device_desc'].data_url;
          // publicConversion['device_desc'].data_url[1] = 'tp';
          publicConversion['device_desc'].url_code_values = newDefaultRule.device_desc.url_code_values_lp;

        }
        if (newDefaultRule.device_desc.data_url[0] === 'tp') {
          // publicConversion['device_desc'].data_url[1] = 'lp';
          newDefaultRule.device_desc.alternateTP ? publicConversion['device_desc'].data_url[1] = 'lp' : publicConversion['device_desc'].data_url = publicConversion['device_desc'].data_url;

          publicConversion['device_desc'].url_code_values = newDefaultRule.device_desc.url_code_values_tp;

        }
      }
      // }

      // publicConversion['device_desc'].url_code_values = newDefaultRule.device_desc.url_code_values;
      //--设备--end--//

      //--媒体--start--//
      publicConversion['media_desc'] = {
        rules: [],
        data_url: newDefaultRule.media_desc.data_url,
        url_code_values: []
      };
      const media_desc_rules = [];
      newDefaultRule.media_desc.rules.forEach(item => {
        if (item['is_active']) {
          media_desc_rules.push(item['key']);
        }
      });
      publicConversion['media_desc'].rules = media_desc_rules;

      if (this.verificationIsActive(newDefaultRule.media_desc.rules, 'url_code')) {
        // newDefaultRule.media_desc.alternateLp ? publicConversion['media_desc'].data_url[1] = 'tp' : publicConversion['media_desc'].data_url = publicConversion['media_desc'].data_url;

        // publicConversion['media_desc'].data_url[1] = 'tp';
        publicConversion['media_desc'].url_code_values = newDefaultRule.media_desc.url_code_values;

      }
      // publicConversion['media_desc'].url_code_values = newDefaultRule.media_desc.url_code_values;
      //--媒体--end--//

      //--关键词--start--//
      publicConversion['mismatched_keyword_desc'] = {};
      publicConversion['mismatched_keyword_desc']['rules'] = {
        trace_rule: newDefaultRule.mismatched_keyword_desc.rules.trace_rule,
        data_url: newDefaultRule.mismatched_keyword_desc.rules.data_url,
        miss_deal_rule: newDefaultRule.mismatched_keyword_desc.rules.miss_deal_rule,
        custom_miss_values: [],
        default_belong_rule: 'belong',
        referer_tag: newDefaultRule.mismatched_keyword_desc.rules.referer_tag,
        default_belong_values: newDefaultRule.mismatched_keyword_desc.rules.default_belong_values,
      };

      if (newDefaultRule.mismatched_keyword_desc.rules.miss_deal_rule === 'into_account') {
        // newDefaultRule.mismatched_keyword_desc.rules.alternateLp ? publicConversion['mismatched_keyword_desc']['rules'].data_url[1] = 'tp' : publicConversion['mismatched_keyword_desc']['rules'].data_url = publicConversion['mismatched_keyword_desc']['rules'].data_url;

        publicConversion['mismatched_keyword_desc']['rules'].custom_miss_values = newDefaultRule.mismatched_keyword_desc.rules.custom_miss_values;

      }
      // publicConversion['mismatched_keyword_desc']['rules'].url_code_values = newDefaultRule.mismatched_keyword_desc.rules.url_code_values;
      newDefaultRule.mismatched_keyword_desc.rules.into_account ? publicConversion['mismatched_keyword_desc']['rules'].default_belong_rule = 'belong' : publicConversion['mismatched_keyword_desc']['rules'].default_belong_rule = 'ignore';
      if (!newDefaultRule.mismatched_keyword_desc.rules.into_account) {
        publicConversion['mismatched_keyword_desc']['rules'].default_belong_values = [];
      }

      //--关键词--end--//


      //--关键词转化追踪逻辑-start--//
      if (newDefaultRule.keyword_tracking_desc.use_wildcards) {
        publicConversion['mismatched_keyword_desc']['rules']['trace_rule'].push('pub_code');
      }
      publicConversion['keyword_tracking_desc'] = newDefaultRule.keyword_tracking_desc;

      //--关键词转化追踪逻辑-end--//

      //--转化时间-start*/
      publicConversion['conver_time_desc'] = newDefaultRule.conver_time_desc;
      //--转化时间-end--//

      //--业务单元-start--//
      publicConversion['conver_biz_desc'] = {
        rules: [],
        data_url: newDefaultRule.conver_biz_desc.data_url,
        is_valid: 0
      };
      if (newDefaultRule.conver_biz_desc.is_valid) {
        publicConversion['conver_biz_desc'].is_valid = 1;
        const biz_desc_rules = [];
        newDefaultRule.conver_biz_desc.rules.forEach(item => {
          if (item['is_active']) {
            biz_desc_rules.push(item['key']);
          }
        });
        publicConversion['conver_biz_desc'].rules = biz_desc_rules;
        if (this.verificationIsActive(newDefaultRule.conver_biz_desc.rules, 'url_code')) {
          if (newDefaultRule.conver_biz_desc.data_url[0] === 'lp' && newDefaultRule.conver_biz_desc.alternateLp) {
            publicConversion['conver_biz_desc'].data_url[1] = 'tp';
          }
          if (newDefaultRule.conver_biz_desc.data_url[0] === 'tp' && newDefaultRule.conver_biz_desc.alternateTP) {
            publicConversion['conver_biz_desc'].data_url[1] = 'lp';
          }
        }

      } else {
        publicConversion['conver_biz_desc'].is_valid = 0;
      }


      //--业务单元-end--//

      //--地域-start--//
      publicConversion['conver_region_desc'] = newDefaultRule.conver_region_desc;
      //--地域-end--//


      //--去重逻辑-start--//
      publicConversion['remove_duplication_desc'] = newDefaultRule.remove_duplication_desc;
      //--去重逻辑-end--//

    }


    // this.submitting = true;

    if (this.conversionDataId > 0) {
      this.defineSettingService.updateConversion(this.conversionDataId, resultConversion).subscribe(data => {
        if (data['status_code'] && data.status_code === 200) {
          this.message.success('保存成功');
          this.modalSubject.destroy('onOk');
        } else if (data['status_code'] && data.status_code === 201) {
          this.message.error('广告主名称已经存在，请重试');
        } else if (data['status_code'] && data.status_code === 401) {
          this.message.error('您没权限对此操作！');
          this.doCancel();
        } else if (data['status_code'] && data.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(data.message);
        }
      }, (err) => {

        this.message.error('系统异常，请重试');
      }, () => {
        this.submitting = false;
      });
    } else {
      this.defineSettingService.createConversion(resultConversion).subscribe(data => {
        if (data['status_code'] && data.status_code === 200) {
          this.message.success('保存成功');
          this.modalSubject.destroy('onOk');
        } else if (data['status_code'] && data.status_code === 201) {
          this.message.error('广告主名称已经存在，请重试');
        } else if (data['status_code'] && data.status_code === 401) {
          this.message.error('您没权限对此操作！');
          this.doCancel();
        } else if (data['status_code'] && data.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(data.message);
        }
      }, (err) => {
        this.message.error('系统异常，请重试');
      }, () => {
        this.submitting = false;
      });
    }
    if (resultConversion.conver_source_type === 2 || resultConversion.conver_source_type === 3 || resultConversion.conver_source_type === 4 || resultConversion.conver_source_type === 5) {
      if (this.publicConversionDetail && this.publicConversionDetail['conver_detail_id']) { //编辑公共部分

        publicConversion['conver_detail_id'] = this.publicConversionDetail['conver_detail_id'];

        this.defineSettingService.updatePublicConversionDetail(publicConversion, this.defaultConversion.cid).subscribe(data => {
          if (data['status_code'] && data.status_code === 200) {
            // this.message.success('保存成功');
            this.modalSubject.destroy('onOk');
          } else if (data['status_code'] && data.status_code === 401) {
            this.message.error('您没权限对此操作！');
            this.doCancel();
          } else if (data['status_code'] && data.status_code === 500) {
            this.message.error('系统异常，请重试');
          } else {
            this.message.error(data.message);
          }
        }, (err) => {

          this.message.error('系统异常，请重试');
        }, () => {
          this.submitting = false;
        });
      } else { //添加
        this.defineSettingService.addPublicConversionDetail(publicConversion, this.defaultConversion.cid).subscribe(data => {
          if (data['status_code'] && data.status_code === 200) {
            // this.message.success('保存成功');
            this.modalSubject.destroy('onOk');
          } else if (data['status_code'] && data.status_code === 401) {
            this.message.error('您没权限对此操作！');
            this.doCancel();
          } else if (data['status_code'] && data.status_code === 500) {
            this.message.error('系统异常，请重试');
          } else {
            this.message.error(data.message);
          }
        }, (err) => {

          this.message.error('系统异常，请重试');
        }, () => {
          this.submitting = false;
        });
      }
    }

  }

  //转化明细通用部分--查看
  getPublicConversionDetail() {
    const im_push_type = (this.defaultConversion.conver_source_type === 3 || this.defaultConversion.conver_source_type === 4 || this.defaultConversion.conver_source_type === 5) ? 0 : this.im_push_type.toString();
    this.defineSettingService.getPublicConversionDetail({
      "cid": this.defaultConversion.cid.toString(),
      "conver_source_type": this.defaultConversion.conver_source_type.toString(),
      "im_push_type": im_push_type
    }, this.defaultConversion.cid).subscribe(result => {
      if (result['status_code'] === 200) {
        this.publicConversionDetail = result['data'];
        //格式化转化描述的数据
        if (this.publicConversionDetail.conver_desc_setting && this.publicConversionDetail.conver_desc_setting.length) {
          this.publicConversionDetail.conver_desc_setting.map(item => {
            if (this.defaultConversion.conver_source_type === 3 || this.defaultConversion.conver_source_type === 4 || this.defaultConversion.conver_source_type === 5) {
              this.conversionDescForm.push(item);
            } else {
              const key = Object.keys(item)[0];
              const desc = {
                conversion_desc_key: key,
                conversion_key: item[key]
              };
              this.conversionDescForm.push(desc);
            }
          });
        }
        // 转化描述 --- 设置已存在的不可用
        this.onContentTypeChange();

        this.showPublic = false;
        if (this.publicConversionDetail && this.publicConversionDetail['conver_detail_id']) { //编辑公共部分
          this.showPublicDefaultConversion(this.publicConversionDetail);
        }
      } else if (result['status_code'] === 205) {
        this.publicConversionDetail = {};
        this.defaultRule = JSON.parse(JSON.stringify(this.baseDefaultRule));
        this.showPublic = true;
      }

    });
  }

  clickShowPublicBtn() {
    this.showPublic = !this.showPublic;
  }

  showPublicDefaultConversion(publicConversionDetail) {
    //区分大小写
    this.defaultRule.is_match_case = publicConversionDetail.is_match_case;

    // 优先归属加追踪码页面
    if (publicConversionDetail.js_attribution_desc.attribution_url) {
      this.defaultRule.js_attribution_desc = publicConversionDetail.js_attribution_desc;
    }

    //媒体
    const mediaRuleObj = this.getRulesObj(isArray(publicConversionDetail.media_desc) ? [] : publicConversionDetail.media_desc.rules, this.canMoveAttr.media, 'url_code');
    this.defaultRule.media_desc.rules = mediaRuleObj.rules;
    if (mediaRuleObj.is_url_code) {
      this.defaultRule.media_desc.data_url[0] = publicConversionDetail.media_desc.data_url[0];

      publicConversionDetail.media_desc.url_code_values.forEach(mediaItem => {
        mediaItem['rules'] = this.getStringByArray(mediaItem['rules']);
      });

      if (publicConversionDetail.media_desc.url_code_values.length) {
        this.defaultRule.media_desc.url_code_values = publicConversionDetail.media_desc.url_code_values;
      }

      this.changeJsMediaPublisher();
    } else {
      // this.defaultRule.media_desc.url_code_values = this.baseDefaultRule.media_desc.url_code_values
    }

    //关键词逻辑
    if (publicConversionDetail.mismatched_keyword_desc.rules.miss_deal_rule === 'into_account') {
      this.defaultRule.mismatched_keyword_desc.rules.data_url[0] = publicConversionDetail.mismatched_keyword_desc.rules.data_url[0];
      this.defaultRule.mismatched_keyword_desc.rules.referer_tag = !!publicConversionDetail.mismatched_keyword_desc.rules.referer_tag;

      publicConversionDetail.mismatched_keyword_desc.rules.custom_miss_values.forEach(keywordItem => {
        keywordItem['rules'] = this.getStringByArray(keywordItem['rules']);
        keywordItem['rules2'] = this.getStringByArray(keywordItem['rules2']);
        keywordItem['rules10'] = this.getStringByArray(keywordItem['rules10']);
        if (!keywordItem['product_key']) {
          keywordItem['product_key'] = '0';
        }
      });
      if (publicConversionDetail.mismatched_keyword_desc.rules.custom_miss_values.length) {
        this.defaultRule.mismatched_keyword_desc.rules.custom_miss_values = publicConversionDetail.mismatched_keyword_desc.rules.custom_miss_values;
      }

      if (publicConversionDetail.mismatched_keyword_desc.rules.default_belong_rule === 'belong') {
        this.defaultRule.mismatched_keyword_desc.rules.into_account = true;

        if (publicConversionDetail.mismatched_keyword_desc.rules.default_belong_values.length) {
          this.defaultRule.mismatched_keyword_desc.rules.default_belong_values = publicConversionDetail.mismatched_keyword_desc.rules.default_belong_values;

          this.getFilterPublishItems();

          // 根据账户得到计划列表 ----- 归到默认户处
          this.defaultRule.mismatched_keyword_desc.rules.default_belong_values.forEach((defaultBelong, idx) => {
            if (defaultBelong.virtual_account !== 1) {
              this.changeAccount(this.accountObj['publisher_id_' + defaultBelong.product_key], 'publisher_id_' + defaultBelong.product_key, defaultBelong);
            }
          });
        }
      }
    } else {
      this.defaultRule.mismatched_keyword_desc.rules.custom_miss_values = this.baseDefaultRule.mismatched_keyword_desc.rules.custom_miss_values;
    }
    this.defaultRule.mismatched_keyword_desc.rules.miss_deal_rule = publicConversionDetail.mismatched_keyword_desc.rules.miss_deal_rule;
    if (publicConversionDetail.mismatched_keyword_desc.rules.miss_deal_rule === 'ignore') {
      // this.defaultRule.mismatched_keyword_desc = this.baseDefaultRule.mismatched_keyword_desc;
    }

    //设备
    this.defaultRule.device_desc.is_valid = publicConversionDetail.device_desc.is_valid;
    if ((this.defaultConversion.conver_source_type === 2 || this.defaultConversion.conver_source_type === 3 || this.defaultConversion.conver_source_type === 4 || this.defaultConversion.conver_source_type === 5) && !publicConversionDetail.device_desc.is_valid) {
      // this.defaultRule.device_desc = this.baseDefaultRule.device_desc;
    } else {
      const deviceRuleObj = this.getRulesObj(isArray(publicConversionDetail.device_desc) ? [] : publicConversionDetail.device_desc.rules, this.canMoveAttr.device, 'url_code');
      this.defaultRule.device_desc.rules = deviceRuleObj.rules;
      if (deviceRuleObj.is_url_code) {
        this.defaultRule.device_desc.data_url[0] = publicConversionDetail.device_desc.data_url[0];
        if (publicConversionDetail.device_desc.data_url.length > 1) {
          publicConversionDetail.device_desc.data_url[1] === 'tp' ? this.defaultRule.device_desc.alternateLp = true : this.defaultRule.device_desc.alternateTP = true;
        }

        if (publicConversionDetail.device_desc.data_url[0] === 'lp') {
          publicConversionDetail.device_desc.url_code_values.forEach(mediaItem => {
            mediaItem['rules'] = this.getStringByArray(mediaItem['rules']);
          });
          this.defaultRule.device_desc.url_code_values_lp = publicConversionDetail.device_desc.url_code_values;
          // this.defaultRule.device_desc.url_code_values_tp = this.baseDefaultRule.device_desc.url_code_values_tp;
        }
        if (publicConversionDetail.device_desc.data_url[0] === 'tp') {
          publicConversionDetail.device_desc.url_code_values.forEach(mediaItem => {
            mediaItem['rules'] = this.getStringByArray(mediaItem['rules']);
          });
          this.defaultRule.device_desc.url_code_values_tp = publicConversionDetail.device_desc.url_code_values;
          // this.defaultRule.device_desc.url_code_values_lp = this.baseDefaultRule.device_desc.url_code_values_lp;
        }
      } else {
        // this.defaultRule.device_desc.url_code_values_tp = this.baseDefaultRule.device_desc.url_code_values_tp;
        // this.defaultRule.device_desc.url_code_values_lp = this.baseDefaultRule.device_desc.url_code_values_lp;

      }
    }

    //关键词转化追踪逻辑
    if (publicConversionDetail.mismatched_keyword_desc.rules.trace_rule.length > 1) {
      this.defaultRule.keyword_tracking_desc.use_wildcards = true;
    }

    //转化时间逻辑
    this.defaultRule.conver_time_desc = publicConversionDetail.conver_time_desc;

    //业务单元转化逻辑
    if (publicConversionDetail.conver_biz_desc.is_valid === 1) {
      this.defaultRule.conver_biz_desc.is_valid = true;
      const bizRuleObj = this.getRulesObj(isArray(publicConversionDetail.conver_biz_desc) ? [] : publicConversionDetail.conver_biz_desc.rules, this.canMoveAttr.biz_unit);
      this.defaultRule.conver_biz_desc.rules = bizRuleObj.rules;
      this.defaultRule.conver_biz_desc.data_url[0] = publicConversionDetail.conver_biz_desc.data_url[0];
      if (publicConversionDetail.conver_biz_desc.data_url.length > 1) {
        publicConversionDetail.conver_biz_desc.data_url[1] === 'tp' ? this.defaultRule.conver_biz_desc.alternateLp = true : this.defaultRule.conver_biz_desc.alternateTP = true;
      }
    } else {
      this.defaultRule.conver_biz_desc.is_valid = false;
      // this.defaultRule.conver_biz_desc = this.baseDefaultRule.conver_biz_desc;

    }


    //去重逻辑
    this.defaultRule.remove_duplication_desc.rules = this.publicConversionDetail.remove_duplication_desc.rules;


  }

  /*
  * url_code: 判断自定义规则是否选中
  * */
  getRulesObj(data, completeItems, url_code?) {
    let newRules = [];
    let is_url_code = false;
    if (data.length) {
      data.forEach(rule => {
        newRules.push({ key: rule, is_active: true });
        if (url_code && rule === 'url_code') {
          is_url_code = true;
        }
      });
      completeItems.forEach(completeItem => {
        let isSame = 0;
        data.forEach(rule => {
          if (completeItem['key'] === rule) {
            isSame++;
          }
        });
        if (isSame === 0) {
          newRules.push(completeItem);
        }
      });
    } else {
      newRules = completeItems;
    }
    return { rules: newRules, is_url_code: is_url_code };
  }

  changeAdver() {
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 1) {
      this.get53AppList();
    }
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 12) {
      this.getOauthList();
    }
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 4) {
      this.getSWTList();
    }
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 5) {
      this.getYLTList();
    }
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 14) {
      this.getMqAppList();
    }
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 22) {
      this.getMoorList();
    }
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 23) {
      this.getCepMoorList();
    }
    if (this.defaultConversion.conver_source_type === 2 || this.defaultConversion.conver_source_type === 3 || this.defaultConversion.conver_source_type === 4 || this.defaultConversion.conver_source_type === 5) {
      this.defaultRule = JSON.parse(JSON.stringify(this.baseDefaultRule));

      this.getPublicConversionDetail();
      this.getAccountLists();

      this.getFilterPublishItems();
    }

    this.getFilterConversionDescList();
  }

  changePushType() {
    if (this.im_push_type === 1) {
      this.get53AppList();
    }
    if (this.im_push_type === 12) {
      this.getOauthList();
    }
    if (this.im_push_type === 4) {
      this.getSWTList();
    }
    if (this.im_push_type === 5) {
      this.getYLTList();
    }
    if (this.im_push_type === 14) {
      this.getMqAppList();
    }
    if (this.im_push_type === 22) {
      this.getMoorList();
    }
    if (this.im_push_type === 23) {
      this.getCepMoorList();
    }
    if (this.defaultConversion.cid) {
      this.getPublicConversionDetail();
      this.getAccountLists();
    }
  }

  changeSource() {
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 1 && this.defaultConversion.cid) {
      this.get53AppList();
    }
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 22 && this.defaultConversion.cid) {
      this.getMoorList();
    }
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 23 && this.defaultConversion.cid) {
      this.getCepMoorList();
    }
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 12 && this.defaultConversion.cid) {
      this.getOauthList();
    }
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 4 && this.defaultConversion.cid) {
      this.getSWTList();
    }
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 5 && this.defaultConversion.cid) {
      this.getYLTList();
    }
    if (this.defaultConversion.conver_source_type === 2 && this.im_push_type === 14 && this.defaultConversion.cid) {
      this.getMqAppList();
    }
    if ((this.defaultConversion.conver_source_type === 2 || this.defaultConversion.conver_source_type === 3 || this.defaultConversion.conver_source_type === 4 || this.defaultConversion.conver_source_type === 5) && this.defaultConversion.cid) {
      this.getPublicConversionDetail();
      this.getAccountLists();
    }
  }

  changeChatType() {
    this.businessConversionSetting.talk_number.types.forEach(item => {
      if (item.key === this.chatBusinessConversion.content_detail.talk_type.id) {
        this.chatBusinessConversion.content_detail.talk_type.name = item.name;
      }
    });
  }

  get53AppList() {
    this.defineSettingService.get53AppList(this.defaultConversion.cid).subscribe(data => {
      if (data['status_code'] === 200) {
        if (data['data'].length > 0) {
          this.chatApi53.apiSettings = [];
          data['data'].forEach(item => {
            this.chatApi53.apiSettings.push({
              valid: item['is_valid'] === 1 ? true : false,
              app_id: item['app_id'],
              app_secret: item['app_secret']
            });
          });
        }
      }

    });
  }

  getSWTList() {
    this.defineSettingService.getKSTAPiList(this.defaultConversion.cid).subscribe(data => {
      if (data['status_code'] === 200) {
        if (data['data'].length > 0) {
          this.swtApiList.apiSettings = [];
          data['data'].forEach(item => {
            this.swtApiList.apiSettings.push({
              id: item['id'],
              site_id: item['site_id'],
              user_name: item['user_name'],
              password: '*********',
            });
          });
        }
      }

    });
  }

  getMqAppList() {
    this.defineSettingService.getMqAppList(this.defaultConversion.cid).subscribe(data => {
      if (data['status_code'] === 200) {
        if (data['data'].length > 0) {
          this.mqApiList.apiSettings = [];
          data['data'].forEach(item => {
            this.mqApiList.apiSettings.push({
              valid: item['is_valid'] === 1 ? true : false,
              enterprise_id: item.enterprise_id,
              key: item.key,
              app_id: item.app_id,
              sign: item.sign,
              id: item.id
            });
          });
        }
      }

    });
  }

  addMqApiSetting() {
    const apiSetting = {
      enterprise_id: '',
      key: 'conversations',
      app_id: '',
      sign: '',
      valid: false,
      id: null
    };
    this.mqApiList.apiSettings.push(apiSetting);
  }

  sureMqApiSettingValid(apiSetting) {

    const body = {
      enterprise_id: apiSetting.enterprise_id,
      key: apiSetting.key,
      app_id: apiSetting.app_id,
      sign: apiSetting.sign,
      cid: this.defaultConversion.cid
    };
    this.defineSettingService.addMqApi(body, this.defaultConversion.cid).subscribe((result) => {
      if (result && result['status_code'] === 200) {
        this.message.success('添加成功');
        this.getMqAppList();
        apiSetting['valid'] = true;
      } else {
        this.message.error('添加失败');
      }

    }, (error) => {
      this.message.error('添加失败');
    }, () => {

    });
  }

  removeMqApiSetting(index, apiSetting) {
    if (apiSetting.valid) { //掉接口
      const body = {
        cid: this.defaultConversion.cid,
        id: apiSetting.id
      };
      this.defineSettingService.deleteMqAppList(body, this.defaultConversion.cid).subscribe((result) => {
        if (result && result['status_code'] === 200) {
          this.message.success('删除成功成功');
          this.getMqAppList();
          apiSetting['valid'] = true;
        } else {
          this.message.error('删除失败');
        }

      }, (error) => {
        this.message.error('删除失败');
      }, () => {

      });
    } else {
      this.mqApiList.apiSettings.splice(index, 1);
    }
    if (index === 0) {
      this.mqApiList.apiSettings = [{
        enterprise_id: '',
        key: 'conversations',
        app_id: '',
        sign: '',
        valid: false,
        id: null
      }];
    }
  }


  getYLTList() {
    this.defineSettingService.getYLTAPiList(this.defaultConversion.cid).subscribe(data => {
      if (data['status_code'] === 200) {
        if (data['data'].length > 0) {
          this.yltApiList.apiSettings = [];
          data['data'].forEach(item => {
            this.yltApiList.apiSettings.push({
              id: item['id'],
              client_key: '',
              app_id: item['app_id'],
              app_secret: item['app_secret'],
              comp_id: item['comp_id'],
              fileList: []
            });
          });
        }
      }

    });
  }


  getMoorList() {
    this.defineSettingService.getMoorPiList(this.defaultConversion.cid).subscribe(data => {
      if (data['status_code'] === 200) {
        if (data['data'].length > 0) {
          this.moorApiList.apiSettings = [];
          data['data'].forEach(item => {
            this.moorApiList.apiSettings.push({
              id: item['id'],
              account_id: item['account_id'],
              api_secret: item['api_secret'],
            });
          });
        }
      }

    });
  }


  getCepMoorList() {
    this.defineSettingService.getCepMoorPiList(this.defaultConversion.cid).subscribe(data => {
      if (data['status_code'] === 200) {
        if (data['data'].length > 0) {
          this.cepMoorApiList.apiSettings = [];
          data['data'].forEach(item => {
            this.cepMoorApiList.apiSettings.push({
              id: item['id'],
              app_key: item['app_key'],
              secret_key: item['secret_key'],
            });
          });
        }
      }
    });
  }

  addYLTApiSetting() {
    const apiSetting = {
      id: null,
      client_key: null,
      comp_id: null,
      app_id: '',
      app_secret: '',
      fileList: []
    };
    this.yltApiList.apiSettings.push(apiSetting);
  }

  checkYLTApiSettingValid(apiSetting) {
    if (!apiSetting.comp_id) {
      this.message.warning('请完善公司ID');
      return false;
    }
    // if (!this.yltApiList.apiSettings[this.currentFileList]['fileList'].length) {
    //   this.message.warning('请上传认证证书');
    //   return false;
    // }

    if (apiSetting['id']) { //编辑

      const formData = new FormData();
      formData.append('client_key', this.yltApiList.apiSettings[this.currentFileList]['fileList'][0]);
      formData.append('cid', this.defaultConversion.cid);
      formData.append('comp_id', apiSetting.comp_id);
      formData.append('app_id', apiSetting.app_id);
      formData.append('app_secret', apiSetting.app_secret);
      formData.append('id', apiSetting.id);
      this.defineSettingService.updateYLTApi(formData, this.defaultConversion.cid).subscribe(
        (event: HttpEvent<{}>) => {
          if (event.type === HttpEventType.UploadProgress) {

          } else if (event instanceof HttpResponse) {
            // 处理成功
            if (event.body['status_code'] === 200) {
              this.message.success('保存成功');
              this.getYLTList();
            } else if (event.body['status_code'] === 205) {
            } else if (event.body['status_code'] === 500) {
              this.message.error('系统出错');
            } else {
              this.message.error(event.body['message']);
            }
          }
        }, (err) => {
          // 处理失败
          this.message.error('保存失败');
        }, () => {
        });

    } else { //添加
      const formData = new FormData();
      formData.append('client_key', this.yltApiList.apiSettings[this.currentFileList]['fileList'][0]);
      formData.append('cid', this.defaultConversion.cid);
      formData.append('comp_id', apiSetting.comp_id);
      formData.append('app_id', apiSetting.app_id);
      formData.append('app_secret', apiSetting.app_secret);
      this.defineSettingService.addYLTApi(formData, this.defaultConversion.cid).subscribe(
        (event: HttpEvent<{}>) => {
          if (event.type === HttpEventType.UploadProgress) {
          } else if (event instanceof HttpResponse) {
            // 处理成功
            if (event.body['status_code'] === 200) {
              this.message.success('保存成功');
              this.getYLTList();
            } else if (event.body['status_code'] === 205) {
            } else if (event.body['status_code'] === 500) {
              this.message.error('系统出错');
            } else {
              this.message.error(event.body['message']);
            }
          }
        }, (err) => {
          // 处理失败
          this.message.error('保存失败');
        }, () => {
        });
    }


  }

  beforeUpload = (file: File) => {
    this.yltApiList.apiSettings[this.currentFileList]['fileList'] = [file];
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      this.message.error('文件大小需小于50M!', { nzDuration: 2000 });
      this.yltApiList.apiSettings[this.currentFileList]['fileList'] = [];
    }
    return false;
  }

  uploadChange(index) {
    this.currentFileList = index;
  }

  addKSTApiSetting() {
    const apiSetting = {
      id: null,
      site_id: null,
      user_name: null,
      password: null,
      valid: false
    };
    this.swtApiList.apiSettings.push(apiSetting);
  }

  checkKSTApiSettingValid(apiSetting) {

    if (apiSetting['id']) { //编辑
      const body = {
        cid: this.defaultConversion.cid,
        id: apiSetting.id,
        site_id: apiSetting.site_id,
        user_name: apiSetting.user_name,
        password: apiSetting.password
      };
      this.defineSettingService.updateKSTApi(body, this.defaultConversion.cid).subscribe((result) => {
        if (result && result['status_code'] === 200) {
          this.message.success('保存成功');
          apiSetting['id'] = result['data'];
        } else {
          this.message.error('保存失败');
        }

      }, (error) => {
        this.message.error('保存失败');
      }, () => {

      });

    } else { //添加
      const body = {
        cid: this.defaultConversion.cid,
        site_id: apiSetting.site_id,
        user_name: apiSetting.user_name,
        password: apiSetting.password
      };
      this.defineSettingService.addKSTApi(body, this.defaultConversion.cid).subscribe((result) => {
        if (result && result['status_code'] === 200) {
          this.message.success('保存成功');
          apiSetting['id'] = result['data'];
        } else {
          this.message.error('保存失败');
        }

      }, (error) => {
        this.message.error('保存失败');
      }, () => {

      });
    }


  }



  addMoorApiSetting() {
    const apiSetting = {
      id: null,
      account_id: '',
      api_secret: '',
    };
    this.moorApiList.apiSettings.push(apiSetting);
  }


  addCepMoorApiSetting() {
    const apiSetting = {
      id: null,
      app_key: '',
      secret_key: '',
    };
    this.cepMoorApiList.apiSettings.push(apiSetting);
  }

  checkMoorApiSettingValid(apiSetting) {

    if (apiSetting['id']) { //编辑
      const body = {
        cid: this.defaultConversion.cid,
        id: apiSetting.id,
        account_id: apiSetting.account_id,
        api_secret: apiSetting.api_secret
      };
      this.defineSettingService.updateMoorApi(body, this.defaultConversion.cid).subscribe((result) => {
        if (result && result['status_code'] === 200) {
          this.message.success('保存成功');
          apiSetting['id'] = result['data'];
        } else {
          this.message.error('保存失败');
        }

      }, (error) => {
        this.message.error('保存失败');
      }, () => {

      });

    } else { //添加
      const body = {
        cid: this.defaultConversion.cid,
        account_id: apiSetting.account_id,
        api_secret: apiSetting.api_secret
      };
      this.defineSettingService.addMoorApi(body, this.defaultConversion.cid).subscribe((result) => {
        if (result && result['status_code'] === 200) {
          this.message.success('保存成功');
          apiSetting['id'] = result['data'];
        } else {
          this.message.error('保存失败');
        }

      }, (error) => {
        this.message.error('保存失败');
      }, () => {

      });
    }


  }

  //cep容联七陌聊天接口
  checkCepMoorApiSettingValid(apiSetting) {
    if (apiSetting['id']) { //编辑
      const body = {
        cid: this.defaultConversion.cid,
        id: apiSetting.id,
        app_key: apiSetting.app_key,
        secret_key: apiSetting.secret_key
      };

      this.defineSettingService.updateCepMoorApi(body, this.defaultConversion.cid).subscribe((result) => {
        if (result && result['status_code'] === 200) {
          this.message.success('保存成功');
          apiSetting['id'] = result['data'];
        } else {
          this.message.error('保存失败');
        }

      }, (error) => {
        this.message.error('保存失败');
      }, () => {

      });

    } else { //添加
      const body = {
        cid: this.defaultConversion.cid,
        app_key: apiSetting.app_key,
        secret_key: apiSetting.secret_key
      };
      this.defineSettingService.addCepMoorApi(body, this.defaultConversion.cid).subscribe((result) => {
        if (result && result['status_code'] === 200) {
          this.message.success('保存成功');
          apiSetting['id'] = result['data'];
        } else {
          this.message.error('保存失败');
        }

      }, (error) => {
        this.message.error('保存失败');
      }, () => {

      });
    }


  }



  copyData(data) {
    copy2Clipboard(data).then(() => this.message.success(`复制成功`));
  }

  ngDoCheck(): void {
    if (this.defaultConversion.conver_source_type === 2) {
      this.getUrl();
    }
  }

  getUrl() {
    if (this.defaultConversion.cid > 0) {
      const jzlCid = Md5.hashStr(this.defaultConversion.cid + '53kf_jzl');
      this.jzlSetting.app_url = 'http://api.jiuzhilan.com/v1/chatmessagereceive?jzl_cid=' + jzlCid + '&chat_tool=53kf';
    }
  }

  addAuthor() {

    const currentTime = new Date().getTime();
    // const stringUrl = 'https://v5.jiuzhilan.com/v5/oauth/kst?cid=25&user_id=72&request_id=' + currentTime;


    const add_modal = this.modalService.create({
      nzTitle: '添加授权',
      nzWidth: 600,
      nzContent: AddAuthorMessageComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'ok') {//添加授权
        this.openPage$ = window.open('https://shop.kuaishang.cn/thirdpart/auth.htm?appId=1005&jumpUrl=' + encodeURIComponent(environment.SERVER_API_URL + '/oauth/kst?cid=' + this.defaultConversion.cid + '&request_id=' + currentTime));
        const add_author = this.modalService.create({
          nzTitle: '',
          nzWidth: 600,
          nzContent: AddAuthorComponent,
          nzClosable: false,
          nzMaskClosable: false,
          nzWrapClassName: 'sub-company-manage-modal',
          nzFooter: null,
          nzComponentParams: {
            cid: this.defaultConversion.cid,
            request_id: currentTime,
            openPage: this.openPage$
          }
        });
        add_author.afterClose.subscribe(authorResult => {
          if (authorResult === 'cancel') { //取消添加授权
            this.openPage$.close();
          }
          if (authorResult === 'ok') {//添加授权成功
            this.openPage$.close();
            this.getOauthList();
          }
        });

      }
    });
  }

  //获取授权列表
  getOauthList() {
    this.defineSettingService.getSiteInfoList(this.defaultConversion.cid).subscribe(result => {
      if (result['status_code'] && result['status_code'] === 200) {

        result['data'].forEach(item => {
          let selectedCount = 0;
          item['selected_site_name'] = [];
          item['site_list'].forEach(site => {
            site['label'] = site.site_name;
            site['value'] = site.site_id;
            if (site['is_selected'] * 1 === 1) {
              selectedCount++;
              site['checked'] = true;
              item['selected_site_name'].push(site.site_name);
            } else if (site['is_selected'] * 1 === 0) {
              site['checked'] = false;
            }
          });
          if (item['site_list'].length === 0) {
            item['selected_site_name'] = ['无可用列表'];
          }
          if (item['site_list'].length && selectedCount === 0) {
            item['selected_site_name'] = ['请选择'];
          }
        });

        this.kstOauthList = result['data'];
      }
    });
  }


  titleClick(item, i) {
    item['is_show'] = !item['is_show'];
    this.kstOauthList.forEach((opt, index) => {
      if (index !== i) {
        opt['is_show'] = false;
      }
    });
  }

  siteCancel(item) {
    item['is_show'] = !item['is_show'];
    this.getOauthList();
  }

  siteSave(item) {
    const body = {
      cid: item.cid,
      company_id: item.company_id,
      site_list: []
    };
    item['site_list'].forEach(site => {
      body.site_list.push({
        site_id: site.site_id,
        is_selected: site['checked'] ? 1 : 0
      });
    });

    this.defineSettingService.updateSiteInfo(body).subscribe(result => {
      item['is_show'] = !item['is_show'];
      if (result['status_code'] && result['status_code'] === 200) {
        this.message.success('操作成功');
        this.getOauthList();
      } else {
        this.message.success(result.message);
      }
    });

  }

  removeItem(data, index, source?, ruleIndex?) {
    if (source === 'default_belong_values') {  //JS 归到默认户处理的媒体
      this.publishItems.forEach((publish) => {
        if (publish.key === data[index]["product_key"]) {
          publish['isSelected'] = false;
        }
      });
    }


    if (index === 0) {
      data.splice(index, 1);
      if (source === 'conversion_logic') {
        data.push([{
          condition_type: null,
          condition_details: { match_type: 100, txt_list: '', type: 'all', left_op: 5, right_op: null }
        }]);
      }
      if (source === 'chatItem') {
        data.push({
          condition_type: null,
          condition_details: { match_type: 100, txt_list: '', type: 'all', left_op: 5, right_op: null }
        });
      }
    } else {
      data.splice(index, 1);
    }

    if (source === 'js_media') { //JS 转化所属媒体逻辑
      this.changeJsMediaPublisher();
    }

    // this.conditionTypeChange(data, ruleIndex);
  }



  addItem(data, source?, index?) {
    let addItem: any;
    if (source === 'chatItem') {
      addItem = {
        condition_type: null,
        condition_details: { match_type: 100, txt_list: '', type: 'all', left_op: 5, right_op: null }
      };
    } else if (source === 'conversion_logic') {
      addItem = [{
        condition_type: null,
        condition_details: { match_type: 100, txt_list: '', type: 'all', left_op: 5, right_op: null }
      }];
    } else if (source === 'default_belong_values') {
      addItem = { product_key: null, chan_pub_id: null, campaign_id: null, virtual_account: 1 };
    }
    if (!source) {
      addItem = { product_key: '0', chan_pub_id: null };
    }
    if (!index && index !== 0) {
      data.push(addItem);
    } else {
      data.splice(index + 1, 0, addItem);
    }
  }

  // 虚拟滚动的删除
  removeItemVirtualScroll(data, key, index, source?, ruleIndex?) {
    if (source === 'default_belong_values') {  //JS 归到默认户处理的媒体
      this.publishItems.forEach((publish) => {
        if (publish.key === data[key][index]["product_key"]) {
          publish['isSelected'] = false;
        }
      });
    }

    if (index === 0) {
      data[key].splice(index, 1);
      if (source === 'conversion_logic') {
        data[key].push([{
          condition_type: null,
          condition_details: { match_type: 100, txt_list: '', type: 'all', left_op: 5, right_op: null }
        }]);
      }
    } else {
      data[key].splice(index, 1);
    }
    if (source === 'js_media') { //JS 转化所属媒体逻辑
      this.changeJsMediaPublisher();
    }
    data[key] = JSON.parse(JSON.stringify(data[key]));
  }
  // 虚拟滚动的添加
  addItemVirtualScroll(data, key?, index?) {
    let addItem;
    if (key === 'default_belong_values') {
      addItem = { product_key: null, chan_pub_id: null, campaign_id: null, virtual_account: 1 };
    } else {
      addItem = { product_key: '0', chan_pub_id: null };
    }
    if (!index && index !== 0) {
      data[key].push(addItem);
    } else {
      data[key].splice(index + 1, 0, addItem);
    }
    data[key] = JSON.parse(JSON.stringify(data[key]));
  }


  getContentTypeListByType(contentType) {
    const result = [];

    this.contentTypeItems.forEach(item => {
      if (item['excludeType'] && item['excludeType'].indexOf(contentType) > -1) {
        return;
      }
      if (item['type'] && item['type'].indexOf(contentType) === -1) {
        return false;
      }
      if (item['excludeChannel'] && item['excludeChannel'].indexOf(this.current_channel_id) > -1) {
        return;
      }
      result.push(item);
    });
    return result;

  }

  conditionTypeChange(chatItem, index) {
    this.conversion_has_chat['convsersion_' + index] = false;
    chatItem.forEach(item => {
      if (item['condition_type'] * 1 === 1) {
        chatItem['has_chat'] = true;
        this.conversion_has_chat['convsersion_' + index] = true;
      }
    });

  }

  //易聊通验证
  doVerificationYiLiaoTong() {

  }

  //商务通验证
  doVerificationShangWuTong() {

  }
}
