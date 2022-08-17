import { Component, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { differenceInCalendarDays, format } from 'date-fns/esm';
import { LaunchService } from 'src/app/routes/materials/service/launch.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { CustomDatasService } from 'src/app/shared/service/custom-datas.service';
import { getStringLengthBaidu } from "../../../../../../shared/util/util";
import { LaunchDocumentComponent } from "../../../../modal/launch-document/launch-document.component";
import { MaterialLibraryImageComponent } from "../../../../modal/material-library-image/material-library-image.component";
import { UploadImageMaterialsComponent } from '../../../../modal/upload-image-materials/upload-image-materials.component';
import { isArray, isObject } from "@jzl/jzl-util";
import { environment } from '../../../../../../../environments/environment';
import { MenuService } from '../../../../../../core/service/menu.service';
import { arrayChunk } from '@jzl/jzl-util';
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-bd-create-launch',
  templateUrl: './bd-create-launch.component.html',
  styleUrls: ['./bd-create-launch.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BdCreateLaunchComponent implements OnInit {

  public isNext = false;
  public fromNext = false;

  public anchorList = [
    {
      key: '#create_launch',
      name: '新建投放',
      sub: [
        { key: '#create_launch', name: '选择素材' },
        { key: '#select_accounts', name: '选择账号' },
      ]
    },
    {
      key: '#campaign_start',
      name: '推广计划',
      sub: [
        { key: '#copy_campaign', name: '批量复制' },
        { key: '#marketing_target', name: '营销目标' },
        { key: '#campaign_setting', name: '计划设置' },
      ]
    },
    {
      key: '#adgroup_start',
      name: '推广单元',
      sub: [
        { key: '#copy_adgroup', name: '复制单元' },
        { key: '#adbroup_basic', name: '基本信息' },
        { key: '#flow_type_select', name: '流量选择' },
        { key: '#bid_setting', name: '投放出价' },
        { key: '#target_setting', name: '用户定向' },


      ]
    },
    {
      key: '#select_product_types',
      name: '创意设置',
      sub: [
        { key: '#select_product_types', name: '投放位置' },
        { key: '#idea_type', name: '生成方式' },
        { key: '#user_portrait', name: '品牌头像' },
        { key: '#creative_setting', name: '创意样式' },
      ]
    },
  ];

  public structConfigLoading = true;
  public structConfig: any = {};

  public flowRange = [];
  public appSource = [];
  public commonSetting = {
    campaign_type_setting: { // 计划类型
      marketing_target: 'catalogue', // 营销目标
      launch_target: 'landing_page', // 投放目标
      operating_system: 'android', // 操作系统
      app_source: ['select_app'], // 应用来源
    },
    position_info: { // 版位信息
      flow_type: '0', // 投放流量
      flow_range: ['1'], // 流量范围
      product_types: '0', // 投放版位
    }
  };
  public commonSettingCopy = {};

  public materialStyle = []; // 创意样式
  public material_style = null; // 创意样式
  public creative_material = 0; // 创意素材

  public materialSlt = [];
  public titleSlt = [];
  public accounts = [];
  public accountsList = [];
  public accountsAry = [];

  public defaultData: any = {
    // materials: [],
    // titles: [],
    accounts: [],
  };

  public campaignSetting = [
    {
      basic: {
        adgroup_creative_num: 1, // 每单元创意
        adgroup_num: null, // 生成单元
        campaign_select: '新建计划', // 计划选择
        pub_campaign_name: '', // 计划名称
        pub_campaign_id: null, // 计划ID
        pause: 1, // 启用暂停
        app_id: null, // 推广应用
        app_url: null, // 下载链接
        app_name: null, // 应用名称
        apk_name: null, // 应用包名
        budget_slt: 'nolimt',  // 计划预算
        budget: 0, // 日预算
        schedule_type: 'nolimt', // 推广日期
        time_range: [new Date(), new Date()], // 起始时间
        schedule_slt: 'nolimt', // 推广时段
        schedule: [], // 推广时段
        bgtctl_type: 0, // 投放方式
      },
      adgroup: [],
    }
  ];
  public campaignSettingCopy = [];

  public adgroupInit = {
    basic: {
      pub_adgroup_name: '', // 单元名称
      launch_products: 0, // 投放商品
      catalog_id: null, // 商品目录ID
      unit_products: 0, // 选择商品
      group_id: null, // 商品组
      rule_products: [], // 筛选条件
      bid_type: 1, // 优化目标
      pay_mode: 0, // 付费模式
      lp_url: null, // 推广URL
      app_trans_id: null, // 转化名称
      trans_type: null, // 目标转化
      is_skip_stage_one: false, // 是否跳过数据积累
      bid: null, // 出价
      ocpc_bid: null, // 目标转化出价
      optimize_deep_trans: 0, // 优化深度转化
      deep_trans_type: null, // 深度转化
      deep_ocpc_bid: null, // 深度转化出价
    },
    position_info: {},
    launch_template_id: null,
    audience_template_id: null,
    audience_setting: {},
    creative: {
      basic: {
        idea_type: 0, // 创意方式
        user_portrait: null, // 用户头像
        user_portrait_materials_url: null,
        brand: '', // 品牌名称
        material_style: null, // 创意样式
      },
      detail: [
        {
          basic: {
            pub_creative_name: '', // 创意名称
            title: '', // 创意标题
            sub_title: '', // 副标题
            target_url: null, // 推广URL
            na_url: null, // 调起URL
            mini_program_schema: null, // 小程序URL
            title_url: null, // 标题链接 -- target_url
            desc1: '', // 图片描述1
            desc2: '', // 图片描述2
            picture_url: null, // 图片链接 -- url
            monitor_url: null, // 点击监测URL
            creative_material: 0, // 图片物料
            video_id: 0, // 视频内容
            poster: 0, // 视频封面
          },
          material_list: [
            // {
            //   target_url: null, // 标题链接 -- title_url
            //   desc1: '', // 图片描述1
            //   desc2: '', // 图片描述2
            //   url: null, // 图片链接 -- picture_url, 商品库 => "url":"${image}"
            // }
          ],
        }
      ],
    },
  };

  public curGroupFlag = 'catalogue';

  public errorTipAry = [];
  public campaignErrorTip = [
    {
      basic: {
        adgroup_creative_num: {
          is_show: false,
          tip_text: '不能为空且每单元不能超过25条创意'
        },
        adgroup_num: { // 生成单元

        },
        pub_campaign_name: {
          is_show: false,
          tip_text: '计划名称应为1-50字'
        },
        pub_campaign_name_repeat: {
          is_show: false,
          tip_text: '计划名称不能重复'
        },
        pub_campaign_id: {
          is_show: false,
          tip_text: '计划名称应为1-50字'
        },
        campaign_enable_count: {
          is_show: false,
          tip_text: '不能超过可新建单元数'
        },
        app_id: {
          is_show: false,
          tip_text: '推广应用不能为空'
        },
        app_url: {
          is_show: false,
          tip_text: '请输入正确的下载链接'
        },
        app_name: {
          is_show: false,
          tip_text: '应用名称不能为空'
        },
        apk_name: {
          is_show: false,
          tip_text: '应用包名不能为空'
        },
        budget: {
          is_show: false,
          tip_text: '请输入正确的取值范围'
        },
      },
      has_error: false,
      adgroup: [
        {
          basic: {
            pub_adgroup_name: {
              is_show: false,
              tip_text: '计划名称应为1-50字'
            },
            catalog_id: {
              is_show: false,
              tip_text: '请输入正确的商品目录ID'
            },

            rule_products: {
              is_show: false,
              tip_text: '筛选条件不能为空'
            },
            group_name: {
              is_show: false,
              tip_text: '商品组名应为1-40字'
            },
            lp_url: {
              is_show: false,
              tip_text: '请输入正确的推广URL'
            },
            app_trans_id: {
              is_show: false,
              tip_text: '转化名称不能为空'
            },
            trans_type: {
              is_show: false,
              tip_text: '目标转化不能为空'
            },
            bid: {
              is_show: false,
              tip_text: '请输入正确的取值范围'
            }, // 出价
            ocpc_bid: {
              is_show: false,
              tip_text: '请输入正确的取值范围'
            }, // 目标转化出价
            deep_trans_type: {
              is_show: false,
              tip_text: '深度转化不能为空'
            },
            deep_ocpc_bid: {
              is_show: false,
              tip_text: '请输入正确的取值范围'
            }
          },
          has_error: false,
          creative: {
            basic: {
              // 用户头像
              brand: {
                is_show: false,
                tip_text: '品牌名称应为1-8字'
              },
              user_portrait: {
                is_show: false,
                tip_text: '请选择品牌头像'
              },
            },
            has_error: false,
            detail: [
              {
                basic: {
                  pub_creative_name: {
                    is_show: false,
                    tip_text: '创意名称应为1-40字'
                  },
                  title: {
                    is_show: false,
                    tip_text: '创意标题应为1-36字'
                  },
                  sub_title: {
                    is_show: false,
                    tip_text: '副标题应为1-24字, 且和品牌名称不能重复'
                  },
                  target_url: {
                    is_show: false,
                    tip_text: '请输入正确的推广URL'
                  },
                  na_url: {
                    is_show: false,
                    tip_text: '请输入正确的调起URL'
                  },
                  mini_program_schema: {
                    is_show: false,
                    tip_text: '请输入正确的小程序URL'
                  },
                  title_url: {
                    is_show: false,
                    tip_text: '请输入正确的标题链接'
                  },
                  desc1: {
                    is_show: false,
                    tip_text: '图片描述1不能为空'
                  },
                  picture_url: {
                    is_show: false,
                    tip_text: '请输入正确的图片链接'
                  },
                  monitor_url: {
                    is_show: false,
                    tip_text: '请输入正确的点击监测URL'
                  },
                }
              }
            ]
          },
        }
      ]
    }
  ];

  public curAccountIndex = 0; // 账号下标
  public curCampaignIndex = 0; // 计划下标
  public curAdgroupIndex = 0; // 单元下标
  public curCreativeIndex = 0; // 创意下标

  public launchTemplateList = [];
  public localTemplateList = [];

  public reInitTarget = true;
  public reInitTargetTimer;

  public url_reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
  public urlReg: any;

  public preAccountsAry = [];

  public campaignDisabled = {};

  public submiting = false;

  public tableHeight = document.body.clientHeight - 60 - 40;
  public tableWidth = document.body.clientWidth - 150 - 130;

  public cid;

  public productInfo = {};

  constructor(
    private message: NzMessageService,
    private modalService: NzModalService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private customDataService: CustomDatasService,
    private launchService: LaunchService,
    private menuService: MenuService,
    private productService: ProductDataService
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 40;
    this.tableWidth = document.body.clientWidth - 150 - 130;
  }

  ngOnInit() {
    this.urlReg = new RegExp(this.url_reg);
    this.commonSettingCopy = JSON.parse(JSON.stringify(this.commonSetting));
    this.campaignSettingCopy = JSON.parse(JSON.stringify(this.campaignSetting));
    this.getBdFeedStructConfigByteDance();
    this.getAccountList();
  }

  getBdFeedStructConfigByteDance() {
    this.launchService
      .getBdFeedStructConfigByteDance()
      .subscribe(
        (results: any) => {

          if (results.status_code && results.status_code !== 200) {
            if (results.status_code !== 205) {
              this.message.error(results.message);
            }
          } else {
            this.structConfig = { ...results };
            this.appSource = JSON.parse(JSON.stringify(results['campaign_type_setting']['app_source']['sub']));
            this.flowRange = JSON.parse(JSON.stringify(results['position_info']['flow_range']['sub']));
            this.flowRange.forEach((item) => {
              item['value'] = item['value'] + '';
            });
            this.appSource.forEach(item => {
              if (item.value === 'select_app') {
                item.checked = true;
              }
            });
            this.flowRange.forEach(item => {
              if (item.value === '1') {
                item.checked = true;
              }
            });
          }
          this.structConfigLoading = false;
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  getAccountList() {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": "1"
        },
        {
          "key": "channel_id",
          "name": "",
          "op": "=",
          "value": "2"
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

  // 应用来源 change
  appSourceChange() {
    this.commonSetting.campaign_type_setting.app_source = [];
    this.appSource.forEach(item => {
      if (item.checked) {
        this.commonSetting.campaign_type_setting.app_source.push(item.value);
      }
    });

    if (this.commonSetting.campaign_type_setting.operating_system === 'android' && this.commonSetting.campaign_type_setting.app_source.length === 1 && this.commonSetting.campaign_type_setting.app_source.indexOf('down_url') !== -1) {
      this.commonSetting.position_info.flow_type = '2';

      this.flowRange.forEach(item => {
        if (item.value != '2') {
          item.disabled = true;
          item.checked = false;
        } else {
          item.checked = true;
        }
      });
    } else {
      this.flowRange.map(item => item.disabled = false);
    }

    this.flowRangeChange();
  }

  // 流量范围 change
  flowRangeChange() {

    this.commonSetting.position_info.flow_range = [];
    this.flowRange.forEach(item => {
      if (item.checked) {
        this.commonSetting.position_info.flow_range.push(item.value);
      }
    });

    if (this.commonSetting.position_info.flow_range.indexOf('8') !== -1) {
      this.commonSetting.position_info.product_types = '0';
    }
  }

  // 创意样式 change
  materialStyleChange() {
    if (['502', '503', '518', '521', '517', '514', '513', '506', '507', '519', '523', '516', '515', '504', '505'].indexOf(this.material_style) !== -1) {
      this.creative_material = 0;
      this.materialSlt = [];
    }

    // 当创意样式是横幅和开屏的情况下
    if (['524', '526', '525', '527'].indexOf(this.material_style) !== -1) {
      this.titleSlt = [];
    }

    this.creativeMaterialChange();
  }

  creativeMaterialChange() {
    this.accounts = [];
    this.accountsAry = [];
    this.preAccountsAry = [];
    this.errorTipAry = [];
    this.curAccountIndex = 0;
    this.curCampaignIndex = 0;
    this.curAdgroupIndex = 0;
    this.curCreativeIndex = 0;
    this.campaignDisabled = {};
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
        campaign[0].basic.pub_campaign_name = '1';
        campaign[0].basic = { ...campaign[0].basic, ...this.commonSetting.campaign_type_setting };
        this.accountsAry.push({
          basic: { ...basic },
          campaign: [...campaign],
        });

        // 获取账户下今天可建计划数
        this.getAccountEnabledCountOfCampaign(this.accountsAry[this.accountsAry.length - 1].basic);
      }

      let hasError = false, campaignError;
      let accountEnableCountError = {
        is_show: false,
        tip_text: '不能超过今天可新建计划数'
      };

      let accountEnableCampaignCount = {
        is_show: false,
        tip_text: '不能超过该账户下可新建计划数'
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

    /*if (!this.launchTemplateList.length) {
      this.getLaunchTemplateList();
    }

    if (!this.localTemplateList.length) {
      this.getLaunchAudienceTemplateList();
    }*/
  }

  // 获取账户下可建计划数
  getAccountEnabledCountOfCampaign(accountBasic) {
    const body = {
      chan_pub_id: accountBasic.chan_pub_id,
    };
    this.launchService
      .getBaiduAccountEnabledCountOfCampaign(body)
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            const data = JSON.parse(JSON.stringify(results['data']));
            accountBasic['account_enable_campaign_count'] = data.ok_num;
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
      data.audience_template_id = filter.audience_template_id;

      // 获取定向模板
      // this.getLaunchAudienceTemplateList(true);
    }
  }

  // 本地模板 --- change事件
  localTemplateChange(event, data) {
    data.audience_setting = {};

    const filterItem = this.localTemplateList.filter(filter => filter.audience_template_id === event);

    if (filterItem.length) {
      this.reInitTarget = false;

      const audienceSetting = isObject(filterItem[0].audience_setting) ? filterItem[0].audience_setting : JSON.parse(filterItem[0].audience_setting);
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

    const creative_num = this.accountsAry[accountIdx].campaign[campaignIdx].basic.adgroup_creative_num;
    if (!creative_num) {
      this.message.error('每单元创意数不能为空');
      return false;
    }

    let adgroupNum;
    // 当创意样式不是横幅和开屏的情况下
    if (['524', '525', '526', '527'].indexOf(this.material_style) === -1) {
      if (this.creative_material === 0) { // 创意素材：使用商品库
        if (!this.titleSlt.length) {
          return;
        }

        adgroupNum = Math.ceil(this.titleSlt.length / creative_num);
        const titleSltSplit = arrayChunk(this.titleSlt, creative_num);
        this.getCreativeGroup(titleSltSplit, accountIdx, campaignIdx);
      } else if (this.creative_material === 1) { // 创意素材：本地素材库
        if (!this.materialSlt.length || !this.titleSlt.length) {
          return;
        }

        adgroupNum = Math.ceil(Math.max(this.materialSlt.length, this.titleSlt.length) / creative_num);

        const materialSltSplit = arrayChunk(this.materialSlt, creative_num);
        const titleSltSplit = arrayChunk(this.titleSlt, creative_num);
        if (materialSltSplit.length > titleSltSplit.length) {
          this.getCrossCreativeGroup(materialSltSplit, titleSltSplit, 'material', accountIdx, campaignIdx);
        } else {
          this.getCrossCreativeGroup(titleSltSplit, materialSltSplit, 'title', accountIdx, campaignIdx);
        }
      }
    } else {
      if (this.creative_material === 0) { // 创意素材：使用商品库
        adgroupNum = this.accountsAry[accountIdx].campaign[campaignIdx].basic.adgroup_num;

        if (!adgroupNum || !creative_num) {
          this.message.error('每单元创意数和生成单元数不能为空');
          return false;
        } else {
          this.getCreativeGroup3(adgroupNum, creative_num, accountIdx, campaignIdx);
        }
      } else if (this.creative_material === 1) { // 创意素材：本地素材库
        if (!this.materialSlt.length) {
          return;
        }

        adgroupNum = Math.ceil(this.materialSlt.length / creative_num);
        const materialSltSplit = arrayChunk(this.materialSlt, creative_num);
        this.getCreativeGroup4(materialSltSplit, accountIdx, campaignIdx);
      }
    }

    this.accountsAry[accountIdx].campaign[campaignIdx].basic.adgroup_num = adgroupNum;
  }

  getCreativeGroup(adgroupAry, accountIdx, campaignIdx) {
    this.accountsAry[accountIdx].campaign[campaignIdx].adgroup = [];

    this.errorTipAry[accountIdx]['has_error'] = false;
    this.errorTipAry[accountIdx]['account_enable_count']['is_show'] = false;
    this.errorTipAry[accountIdx]['account_enable_campaign_count']['is_show'] = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].basic = JSON.parse(JSON.stringify(this.campaignErrorTip[0].basic));
    this.errorTipAry[accountIdx].campaign[campaignIdx].has_error = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup = [];
    adgroupAry.forEach((adgroup, index) => {
      const newGroup = JSON.parse(JSON.stringify(this.adgroupInit));
      const newGroupError = JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0]));
      if (this.commonSetting.campaign_type_setting.launch_target === 'app') {
        newGroup.basic.bid_type = 3;
        newGroup.basic.pay_mode = 1;
      }
      newGroup.creative.detail = [];
      newGroupError.creative.detail = [];

      adgroup.forEach((item, idx) => {
        const creativeDetail = JSON.parse(JSON.stringify(this.adgroupInit.creative.detail[0]));
        const creativeDetailError = JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0].creative.detail[0]));
        creativeDetail.basic.title = item;
        creativeDetail.basic.pub_creative_name = (idx + 1) + '';
        creativeDetail.basic.creative_material = this.creative_material;

        // 创意样式为橱窗且创意素材为商品库
        creativeDetail.material_list.push({
          target_url: creativeDetail.basic.title_url, // 标题链接 -- title_url
          desc1: creativeDetail.basic.desc1, // 图片描述1
          desc2: creativeDetail.basic.desc2, // 图片描述2
          url: '${image}', // 图片链接 -- picture_url, 商品库 => "url":""
        });

        newGroup.creative.detail.push({ ...creativeDetail });
        newGroupError.creative.detail.push({ ...creativeDetailError });
      });

      newGroup.basic.pub_adgroup_name = (index + 1) + '';
      newGroup.creative.basic.material_style = this.material_style;
      newGroup.position_info = { ...this.commonSetting.position_info };

      if (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length < 100) {
        this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.push({ ...newGroup });
        this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup.push({ ...newGroupError });
      }
    });
  }

  getCrossCreativeGroup(maxAry, minAry, tag, accountIdx, campaignIdx) {
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
      const newGroupError = JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0]));
      if (this.commonSetting.campaign_type_setting.launch_target === 'app') {
        newGroup.basic.bid_type = 3;
        newGroup.basic.pay_mode = 1;
      }
      newGroup.creative.detail = [];
      newGroupError.creative.detail = [];

      let idx = 0;

      if (maxItem.length > minAry[minIdx].length) {
        maxItem.forEach((lItem, lIdx) => {
          const creativeDetail = JSON.parse(JSON.stringify(this.adgroupInit.creative.detail[0]));
          const creativeDetailError = JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0].creative.detail[0]));

          if (lItem['material_id']) {
            creativeDetail.basic.title = minAry[minIdx];
            creativeDetail.basic.pub_creative_name = (lIdx + 1) + '';
            creativeDetail.basic.creative_material = this.creative_material;

            creativeDetail.material_list.push(
              {
                material_id: lItem['material_id'],
                upload_video_width: lItem['upload_video_width'],
                upload_video_height: lItem['upload_video_height'],
              }
            );
          } else {
            creativeDetail.basic.title = lItem;
            creativeDetail.basic.pub_creative_name = (lIdx + 1) + '';
            creativeDetail.basic.creative_material = this.creative_material;

            creativeDetail.material_list.push(
              {
                material_id: minAry[minIdx][idx]['material_id'],
                upload_video_width: minAry[minIdx][idx]['upload_video_width'],
                upload_video_height: minAry[minIdx][idx]['upload_video_height'],
              }
            );
          }
          newGroup.creative.detail.push({ ...creativeDetail });
          newGroupError.creative.detail.push({ ...creativeDetailError });

          idx = idx >= (minAry[minIdx].length - 1) ? 0 : idx + 1;
        });
      } else {
        minAry[minIdx].forEach((lItem, lIdx) => {
          const creativeDetail = JSON.parse(JSON.stringify(this.adgroupInit.creative.detail[0]));
          const creativeDetailError = JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0].creative.detail[0]));

          if (lItem['material_id']) {
            creativeDetail.basic.title = maxItem[idx];
            creativeDetail.basic.pub_creative_name = (lIdx + 1) + '';
            creativeDetail.basic.creative_material = this.creative_material;

            creativeDetail.material_list.push(
              {
                material_id: lItem['material_id'],
                upload_video_width: lItem['upload_video_width'],
                upload_video_height: lItem['upload_video_height'],
              }
            );
          } else {
            creativeDetail.basic.title = lItem;
            creativeDetail.basic.pub_creative_name = (lIdx + 1) + '';
            creativeDetail.basic.creative_material = this.creative_material;

            creativeDetail.material_list.push(
              {
                material_id: maxItem[idx]['material_id'],
                upload_video_width: maxItem[idx]['upload_video_width'],
                upload_video_height: maxItem[idx]['upload_video_height'],
              }
            );
          }

          newGroup.creative.detail.push({ ...creativeDetail });
          newGroupError.creative.detail.push({ ...creativeDetailError });

          idx = idx >= (maxItem.length - 1) ? 0 : idx + 1;
        });
      }

      newGroup.basic.pub_adgroup_name = (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length + 1) + '';
      newGroup.creative.basic.material_style = this.material_style;
      newGroup.position_info = { ...this.commonSetting.position_info };

      if (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length < 100) {
        this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.push({ ...newGroup });
        this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup.push({ ...newGroupError });
      }

      minIdx = minIdx >= (minAry.length - 1) ? 0 : minIdx + 1;
    });
  }

  getCreativeGroup3(adgroupNum, creativeNum, accountIdx, campaignIdx) {
    this.accountsAry[accountIdx].campaign[campaignIdx].adgroup = [];

    this.errorTipAry[accountIdx]['has_error'] = false;
    this.errorTipAry[accountIdx]['account_enable_count']['is_show'] = false;
    this.errorTipAry[accountIdx]['account_enable_campaign_count']['is_show'] = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].basic = JSON.parse(JSON.stringify(this.campaignErrorTip[0].basic));
    this.errorTipAry[accountIdx].campaign[campaignIdx].has_error = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup = [];

    for (let adgroup = 0; adgroup < adgroupNum; adgroup++) {
      const newGroup = JSON.parse(JSON.stringify(this.adgroupInit));
      const newGroupError = JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0]));
      if (this.commonSetting.campaign_type_setting.launch_target === 'app') {
        newGroup.basic.bid_type = 3;
        newGroup.basic.pay_mode = 1;
      }
      newGroup.creative.detail = [];
      newGroupError.creative.detail = [];

      for (let creative = 0; creative < creativeNum; creative++) {
        const creativeDetail = JSON.parse(JSON.stringify(this.adgroupInit.creative.detail[0]));
        const creativeDetailError = JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0].creative.detail[0]));
        creativeDetail.basic.pub_creative_name = (creative + 1) + '';
        creativeDetail.basic.creative_material = this.creative_material;

        newGroup.creative.detail.push({ ...creativeDetail });
        newGroupError.creative.detail.push({ ...creativeDetailError });
      }

      newGroup.basic.pub_adgroup_name = (adgroup + 1) + '';
      newGroup.creative.basic.material_style = this.material_style;
      newGroup.position_info = { ...this.commonSetting.position_info };

      if (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length < 100) {
        this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.push({ ...newGroup });
        this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup.push({ ...newGroupError });
      }
    }
  }

  getCreativeGroup4(adgroupAry, accountIdx, campaignIdx) {
    this.accountsAry[accountIdx].campaign[campaignIdx].adgroup = [];

    this.errorTipAry[accountIdx]['has_error'] = false;
    this.errorTipAry[accountIdx]['account_enable_count']['is_show'] = false;
    this.errorTipAry[accountIdx]['account_enable_campaign_count']['is_show'] = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].basic = JSON.parse(JSON.stringify(this.campaignErrorTip[0].basic));
    this.errorTipAry[accountIdx].campaign[campaignIdx].has_error = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup = [];
    adgroupAry.forEach((adgroup, index) => {
      const newGroup = JSON.parse(JSON.stringify(this.adgroupInit));
      const newGroupError = JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0]));
      if (this.commonSetting.campaign_type_setting.launch_target === 'app') {
        newGroup.basic.bid_type = 3;
        newGroup.basic.pay_mode = 1;
      }
      newGroup.creative.detail = [];
      newGroupError.creative.detail = [];

      adgroup.forEach((item, idx) => {
        const creativeDetail = JSON.parse(JSON.stringify(this.adgroupInit.creative.detail[0]));
        const creativeDetailError = JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0].creative.detail[0]));
        creativeDetail.basic.pub_creative_name = (idx + 1) + '';
        creativeDetail.basic.creative_material = this.creative_material;

        newGroup.creative.detail.push({ ...creativeDetail });
        newGroupError.creative.detail.push({ ...creativeDetailError });

        creativeDetail.material_list.push(
          {
            material_id: item['material_id'],
            upload_video_width: item['upload_video_width'],
            upload_video_height: item['upload_video_height'],
          }
        );
      });

      newGroup.basic.pub_adgroup_name = (index + 1) + '';
      newGroup.creative.basic.material_style = this.material_style;
      newGroup.position_info = { ...this.commonSetting.position_info };

      if (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length < 100) {
        this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.push({ ...newGroup });
        this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup.push({ ...newGroupError });
      }
    });
  }

  currentTabChange(tag) {
    if (tag === 'campaign') {
      this.curCampaignIndex = 0;
    }
    this.curAdgroupIndex = 0;
    this.curCreativeIndex = 0;

    /* // 获取投放模板
     this.getLaunchTemplateList(true);*/

    // 获取定向模板
    // this.getLaunchAudienceTemplateList(true);
  }

  curAdgroupTabChange(campaign) {
    this.curCreativeIndex = 0;

    /*// 获取定向模板
    if (!campaign.adgroup[this.curAdgroupIndex].audience_template_id) {
      this.getLaunchAudienceTemplateList();
    }*/
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
        // errorItem.account_enable_count = JSON.parse(JSON.stringify({
        //   is_show: false,
        //   tip_text: '不能超过今天可新建计划数'
        // }));
        errorItem.account_enable_campaign_count = JSON.parse(JSON.stringify({
          is_show: false,
          tip_text: '不能超过该账户下可新建计划数'
        }));
        errorItem.has_error = copyErrorData.has_error;
      }
    });

    this.message.success('复制成功');
  }

  copyCurrent(data, ary, errorData?, tag?) {
    const curData = JSON.parse(JSON.stringify(data));
    if (tag === 'campaign') {
      if (data.basic.campaign_select === '已有计划') {
        curData.basic.campaign_select = '新建计划';
        curData.basic.pub_campaign_id = null;
      }
      curData.basic.pub_campaign_name = data.basic.pub_campaign_name + '-' + (ary.length + 1);
      errorData.push(JSON.parse(JSON.stringify(errorData[this.curCampaignIndex])));
    } else if (tag === 'adgroup') {
      curData.basic.pub_adgroup_name = data.basic.pub_adgroup_name + '-' + (ary.length + 1);
      errorData.push(JSON.parse(JSON.stringify(errorData[this.curAdgroupIndex])));
    } else if (tag === 'creative') {
      curData.basic.pub_creative_name = data.basic.pub_creative_name + '-' + (ary.length + 1);
      errorData.push(JSON.parse(JSON.stringify(errorData[this.curCreativeIndex])));
    }
    ary.push({ ...curData });

    this.message.success('复制成功');
  }

  copyAdgroupParams(data, ary) {
    const copyData = JSON.parse(JSON.stringify(data));

    for (let i = 0; i < ary.length; i++) {
      ary[i].basic = JSON.parse(JSON.stringify(copyData.basic));
      ary[i].position_info = JSON.parse(JSON.stringify(copyData.position_info));
      ary[i].launch_template_id = copyData.launch_template_id;
      ary[i].audience_template_id = copyData.audience_template_id;
      ary[i].audience_setting = JSON.parse(JSON.stringify(copyData.audience_setting));
      ary[i].creative = JSON.parse(JSON.stringify(copyData.creative));

      ary[i].basic.adgroup_name = ary[i].basic.adgroup_name + '-' + (i + 1);
    }

    this.message.success('复制成功');
  }

  doCancel() {
    history.go(-1);
  }

  doReset() {
    this.commonSetting = JSON.parse(JSON.stringify(this.commonSettingCopy));
    this.material_style = null;
    this.creative_material = 0;
    this.materialSlt = [];
    this.titleSlt = [];
    this.accounts = [];
    this.accountsAry = [];
    this.preAccountsAry = [];
    this.errorTipAry = [];
    this.curAccountIndex = 0;
    this.curCampaignIndex = 0;
    this.curAdgroupIndex = 0;
    this.curCreativeIndex = 0;
    this.campaignDisabled = {};
    this.fromNext = false;
    this.appSource.forEach(item => {
      item.checked = false;
      if (item.value === 'select_app') {
        item.checked = true;
      }
      item.disabled = this.fromNext;
    });
    this.flowRange.forEach(item => {
      item.checked = false;
      if (item.value === '1') {
        item.checked = true;
      }
      item.disabled = this.fromNext;
    });
  }

  doNext() {
    if (!this.structConfigLoading) {
      if (this.commonSetting.campaign_type_setting.marketing_target === 'catalogue' && this.commonSetting.campaign_type_setting.launch_target === 'app' && this.commonSetting.campaign_type_setting.operating_system === 'android') {
        if (!this.commonSetting.campaign_type_setting.app_source.length) {
          this.message.error('请选择应用来源');
          return false;
        }
      }

      if (this.commonSetting.position_info.flow_type === '2' && !this.commonSetting.position_info.flow_range.length) {
        this.message.error('请选择流量范围');
        return false;
      }

      // 创意样式
      this.materialStyle = [];
      if (this.commonSetting.campaign_type_setting.launch_target === 'landing_page') { // 投放目标 --- 落地页
        this.material_style = '501';
        if (this.commonSetting.position_info.flow_type === '0' || this.commonSetting.position_info.flow_type === '4') { // 投放流量 --- 默认 | 百青藤
          this.materialStyle = [
            {
              "label": "单图",
              "value": "501",
              "desc": "百度信息流",
              "checked": true
            }, {
              "label": "大图",
              "value": "508",
              "desc": "百度信息流",
              "checked": false
            }, {
              "label": "单品三图",
              "value": "502",
              "desc": "百度信息流",
              "checked": false
            }, {
              "label": "多品三图",
              "value": "503",
              "desc": "百度信息流",
              "checked": false
            },
            // {
            //   "label": "横版视频",
            //   "value": "518",
            //   "desc": "百度信息流",
            //   "checked": false
            // }, {
            //   "label": "竖版视频",
            //   "value": "521",
            //   "desc": "百度信息流（仅列表页）",
            //   "checked": false
            // },
            {
              "label": "橱窗",
              "value": "517",
              "desc": "百度信息流",
              "checked": false
            }, {
              "label": "开屏",
              "value": "524",
              "desc": "百度信息流",
              "checked": false
            }
          ];
          if (this.commonSetting.position_info.flow_type === '0') {
            this.materialStyle.push({
              "label": "横幅",
              "value": "526",
              "desc": "",
              "checked": false
            });
          }
        } else if (this.commonSetting.position_info.flow_type === '2') { // 投放流量 --- 自定义
          if (this.commonSetting.position_info.flow_range.indexOf('1') !== -1) { // 流量范围包含 百度信息流
            if (this.commonSetting.position_info.product_types === '0' || this.commonSetting.position_info.product_types === '1') { // 投放版位 --- 不限 | 仅列表页
              this.materialStyle = [
                {
                  "label": "单图",
                  "value": "501",
                  "desc": "百度信息流",
                  "checked": true
                }, {
                  "label": "大图",
                  "value": "508",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "单品三图",
                  "value": "502",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "多品三图",
                  "value": "503",
                  "desc": "百度信息流",
                  "checked": false
                },
                // {
                //   "label": "横版视频",
                //   "value": "518",
                //   "desc": "百度信息流",
                //   "checked": false
                // }, {
                //   "label": "竖版视频",
                //   "value": "521",
                //   "desc": "百度信息流（仅列表页）",
                //   "checked": false
                // },
                {
                  "label": "橱窗",
                  "value": "517",
                  "desc": "百度信息流",
                  "checked": false
                },
              ];
            } else if (this.commonSetting.position_info.product_types === '2') { // 投放版位 --- 仅详情页
              this.materialStyle = [
                {
                  "label": "单图",
                  "value": "501",
                  "desc": "百度信息流",
                  "checked": true
                }, {
                  "label": "大图",
                  "value": "508",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "单品三图",
                  "value": "502",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "多品三图",
                  "value": "503",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "横版视频",
                  "value": "518",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "橱窗",
                  "value": "517",
                  "desc": "百度信息流",
                  "checked": false
                },
              ];
            }
          } else if (this.commonSetting.position_info.flow_range.indexOf('2') !== -1) { // 流量范围包含 贴吧信息流
            if (this.commonSetting.position_info.product_types === '0' || this.commonSetting.position_info.product_types === '1') { // 投放版位 --- 不限 | 仅列表页
              this.materialStyle = [
                {
                  "label": "大图",
                  "value": "508",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "单品三图",
                  "value": "514",
                  "desc": "单选贴吧信息流",
                  "checked": false
                }, {
                  "label": "多品三图",
                  "value": "513",
                  "desc": "单选贴吧信息流",
                  "checked": false
                }, {
                  "label": "横版视频",
                  "value": "518",
                  "desc": "百度信息流",
                  "checked": false
                }
              ];
              this.material_style = '508';
            } else if (this.commonSetting.position_info.product_types === '2') { // 投放版位 --- 仅详情页
              this.materialStyle = [
                {
                  "label": "大图",
                  "value": "508",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "单品三图",
                  "value": "514",
                  "desc": "单选贴吧信息流",
                  "checked": false
                }, {
                  "label": "多品三图",
                  "value": "513",
                  "desc": "单选贴吧信息流",
                  "checked": false
                }
              ];
              this.material_style = '508';
            }
          } else if (this.commonSetting.position_info.flow_range.indexOf('8') !== -1) { // 流量范围包含 好看视频
            this.materialStyle = [
              {
                "label": "单图",
                "value": "501",
                "desc": "百度信息流",
                "checked": true
              }, {
                "label": "大图",
                "value": "508",
                "desc": "百度信息流",
                "checked": false
              }, {
                "label": "横版视频",
                "value": "518",
                "desc": "百度信息流",
                "checked": false
              }
            ];
          }
        }
      } else if (this.commonSetting.campaign_type_setting.launch_target === 'app' && this.commonSetting.campaign_type_setting.operating_system === 'android') { // 投放流量 --- 应用 - android
        this.material_style = '511';
        if (this.commonSetting.position_info.flow_type === '0' || this.commonSetting.position_info.flow_type === '4') { // 投放流量 --- 默认 | 百青藤
          this.materialStyle = [
            {
              "label": "单图",
              "value": "511",
              "desc": "百度信息流（仅列表页）",
              "checked": true
            }, {
              "label": "大图",
              "value": "512",
              "desc": "百度信息流",
              "checked": false
            }, {
              "label": "单品三图",
              "value": "506",
              "desc": "百度信息流",
              "checked": false
            }, {
              "label": "多品三图",
              "value": "507",
              "desc": "百度信息流",
              "checked": false
            }, {
              "label": "横版视频",
              "value": "519",
              "desc": "百度信息流（仅列表页）",
              "checked": false
            }, {
              "label": "竖版视频",
              "value": "523",
              "desc": "百度信息流（仅列表页）",
              "checked": false
            }, {
              "label": "开屏",
              "value": "525",
              "desc": "百青藤",
              "checked": false
            }, {
              "label": "横幅",
              "value": "527",
              "desc": "",
              "checked": false
            }
          ];
        } else if (this.commonSetting.position_info.flow_type === '2') { // 投放流量 --- 自定义
          if (this.commonSetting.position_info.flow_range.indexOf('1') !== -1) { // 流量范围包含 百度信息流
            if (this.commonSetting.position_info.product_types === '0' || this.commonSetting.position_info.product_types === '1') { // 投放版位 --- 不限 | 仅列表页
              this.materialStyle = [
                {
                  "label": "单图",
                  "value": "511",
                  "desc": "百度信息流（仅列表页）",
                  "checked": true
                }, {
                  "label": "大图",
                  "value": "512",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "单品三图",
                  "value": "506",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "多品三图",
                  "value": "507",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "横版视频",
                  "value": "519",
                  "desc": "百度信息流（仅列表页）",
                  "checked": false
                }, {
                  "label": "竖版视频",
                  "value": "523",
                  "desc": "百度信息流（仅列表页）",
                  "checked": false
                }
              ];
            } else if (this.commonSetting.position_info.product_types === '2') { // 投放版位 --- 仅详情页
              this.materialStyle = [
                {
                  "label": "单图",
                  "value": "511",
                  "desc": "百度信息流（仅列表页）",
                  "checked": true
                }, {
                  "label": "大图",
                  "value": "512",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "单品三图",
                  "value": "506",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "多品三图",
                  "value": "507",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "横版视频",
                  "value": "519",
                  "desc": "百度信息流（仅列表页）",
                  "checked": false
                }
              ];
            }
          } else if (this.commonSetting.position_info.flow_range.indexOf('2') !== -1) { // 流量范围包含 贴吧信息流
            if (this.commonSetting.position_info.product_types === '0' || this.commonSetting.position_info.product_types === '1') { // 投放版位 --- 不限 | 仅列表页
              this.materialStyle = [
                {
                  "label": "大图",
                  "value": "512",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "单品三图",
                  "value": "516",
                  "desc": "单选贴吧信息流",
                  "checked": false
                }, {
                  "label": "多品三图",
                  "value": "515",
                  "desc": "单选贴吧信息流",
                  "checked": false
                }, {
                  "label": "横版视频",
                  "value": "519",
                  "desc": "百度信息流（仅列表页）",
                  "checked": false
                }
              ];
              this.material_style = '512';
            } else if (this.commonSetting.position_info.product_types === '2') { // 投放版位 --- 仅详情页
              this.materialStyle = [
                {
                  "label": "大图",
                  "value": "512",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "单品三图",
                  "value": "516",
                  "desc": "单选贴吧信息流",
                  "checked": false
                }, {
                  "label": "多品三图",
                  "value": "515",
                  "desc": "单选贴吧信息流",
                  "checked": false
                }
              ];
              this.material_style = '512';
            }
          } else if (this.commonSetting.position_info.flow_range.indexOf('8') !== -1) { // 流量范围包含 好看视频
            this.materialStyle = [
              {
                "label": "大图",
                "value": "512",
                "desc": "百度信息流",
                "checked": false
              }, {
                "label": "横版视频",
                "value": "519",
                "desc": "百度信息流（仅列表页）",
                "checked": false
              }
            ];
            this.material_style = '512';
          }
        }
      } else if (this.commonSetting.campaign_type_setting.launch_target === 'app' && this.commonSetting.campaign_type_setting.operating_system === 'ios') { // 投放流量 --- 应用 - ios
        this.material_style = '509';
        if (this.commonSetting.position_info.flow_type === '0' || this.commonSetting.position_info.flow_type === '4') { // 投放流量 --- 默认 | 百青藤
          this.materialStyle = [
            {
              "label": "单图",
              "value": "509",
              "desc": "百度信息流（仅列表页）",
              "checked": true
            }, {
              "label": "大图",
              "value": "510",
              "desc": "百度信息流",
              "checked": false
            }, {
              "label": "单品三图",
              "value": "504",
              "desc": "百度信息流",
              "checked": false
            }, {
              "label": "多品三图",
              "value": "505",
              "desc": "百度信息流",
              "checked": false
            }, {
              "label": "横版视频",
              "value": "519",
              "desc": "百度信息流（仅列表页）",
              "checked": false
            }, {
              "label": "竖版视频",
              "value": "523",
              "desc": "百度信息流（仅列表页）",
              "checked": false
            }, {
              "label": "开屏",
              "value": "525",
              "desc": "百青藤",
              "checked": false
            }, {
              "label": "横幅",
              "value": "527",
              "desc": "",
              "checked": false
            }
          ];
        } else if (this.commonSetting.position_info.flow_type === '2') { // 投放流量 --- 自定义
          if (this.commonSetting.position_info.flow_range.indexOf('1') !== -1) { // 流量范围包含 百度信息流
            if (this.commonSetting.position_info.product_types === '0' || this.commonSetting.position_info.product_types === '1') { // 投放版位 --- 不限 | 仅列表页
              this.materialStyle = [
                {
                  "label": "单图",
                  "value": "509",
                  "desc": "百度信息流（仅列表页）",
                  "checked": true
                }, {
                  "label": "大图",
                  "value": "510",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "单品三图",
                  "value": "504",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "多品三图",
                  "value": "505",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "横版视频",
                  "value": "519",
                  "desc": "百度信息流（仅列表页）",
                  "checked": false
                }, {
                  "label": "竖版视频",
                  "value": "523",
                  "desc": "百度信息流（仅列表页）",
                  "checked": false
                }
              ];
            } else if (this.commonSetting.position_info.product_types === '2') { // 投放版位 --- 仅详情页
              this.materialStyle = [
                {
                  "label": "单图",
                  "value": "509",
                  "desc": "百度信息流（仅列表页）",
                  "checked": true
                }, {
                  "label": "大图",
                  "value": "510",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "单品三图",
                  "value": "504",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "多品三图",
                  "value": "505",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "横版视频",
                  "value": "519",
                  "desc": "百度信息流（仅列表页）",
                  "checked": false
                }
              ];
            }
          } else if (this.commonSetting.position_info.flow_range.indexOf('2') !== -1) { // 流量范围包含 贴吧信息流
            if (this.commonSetting.position_info.product_types === '0' || this.commonSetting.position_info.product_types === '1') { // 投放版位 --- 不限 | 仅列表页
              this.materialStyle = [
                {
                  "label": "大图",
                  "value": "510",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "单品三图",
                  "value": "516",
                  "desc": "单选贴吧信息流",
                  "checked": false
                }, {
                  "label": "多品三图",
                  "value": "515",
                  "desc": "单选贴吧信息流",
                  "checked": false
                }, {
                  "label": "横版视频",
                  "value": "519",
                  "desc": "百度信息流（仅列表页）",
                  "checked": false
                }
              ];
              this.material_style = '510';
            } else if (this.commonSetting.position_info.product_types === '2') { // 投放版位 --- 仅详情页
              this.materialStyle = [
                {
                  "label": "大图",
                  "value": "510",
                  "desc": "百度信息流",
                  "checked": false
                }, {
                  "label": "单品三图",
                  "value": "516",
                  "desc": "单选贴吧信息流",
                  "checked": false
                }, {
                  "label": "多品三图",
                  "value": "515",
                  "desc": "单选贴吧信息流",
                  "checked": false
                }
              ];
              this.material_style = '510';
            }
          } else if (this.commonSetting.position_info.flow_range.indexOf('8') !== -1) { // 流量范围包含 好看视频
            this.materialStyle = [
              {
                "label": "大图",
                "value": "510",
                "desc": "百度信息流",
                "checked": false
              }, {
                "label": "横版视频",
                "value": "519",
                "desc": "百度信息流（仅列表页）",
                "checked": false
              }
            ];
            this.material_style = '510';
          }
        }
      }

      if (this.commonSetting.campaign_type_setting.marketing_target === 'catalogue') {
        if (this.commonSetting.position_info.flow_type === '4' && this.commonSetting.campaign_type_setting.launch_target === 'landing_page') {
          this.curGroupFlag = 'catalogue_4_landing';
        } else if (this.commonSetting.position_info.flow_type === '4' && this.commonSetting.campaign_type_setting.launch_target !== 'landing_page') { //营销目标: 商品目录 且 投放流量: 百青藤
          this.curGroupFlag = 'catalogue_4';
        } else if (this.commonSetting.position_info.flow_type !== '4' && this.commonSetting.campaign_type_setting.launch_target === 'landing_page') { // 投放目标 --- 落地页
          this.curGroupFlag = 'catalogue_landing';
        } else {
          this.curGroupFlag = 'catalogue';
        }
      }
      // 获取定向模板
      this.getLaunchAudienceTemplateList(true);



      this.isNext = true;
      this.fromNext = false;

      this.appSource.map(item => item.disabled = true);
      this.flowRange.map(item => item.disabled = true);

    }
  }

  doPrev() {
    this.isNext = false;
    this.fromNext = true;
  }

  addMaterials(type = 'materials', data?, cssType?, accountIndex?, campaignIndex?, adgroupIndex?) {
    let requestCssType = this.material_style;
    let requestMaterials = this.materialSlt;
    if (cssType) {
      requestCssType = cssType;
      requestMaterials = [];
    }




    const add_modal = this.modalService.create({
      nzTitle: '素材库',
      nzWidth: 1000,
      nzContent: MaterialLibraryImageComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        materialSlt: requestMaterials,
        css_type: Number(requestCssType),
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result !== 'onCancel') {

        if (type == 'userImage') {
          const selectImage = JSON.parse(JSON.stringify(result));

          if (isArray(selectImage) && selectImage.length > 0) {
            data['user_portrait'] = selectImage[0]['image_url'];
            data['user_portrait_materials_url'] = environment.SERVER_API_URL_v6 + '/manager_base/material/image_material/image/' + selectImage[0]['material_id'] + '?&cid=' + this.cid;
            this.errorTipAry[accountIndex].campaign[campaignIndex].adgroup[adgroupIndex].creative.basic.user_portrait.is_show = false;
          }
        } else {
          this.materialSlt = JSON.parse(JSON.stringify(result));

          this.accountsAry.forEach((account, idx) => {
            const campaign = JSON.parse(JSON.stringify(this.campaignSettingCopy));
            campaign[0].basic.pub_campaign_name = '1';
            campaign[0].basic = { ...campaign[0].basic, ...this.commonSetting.campaign_type_setting };
            account.campaign = [...campaign];

            this.getMaxLength(idx, 0);
          });
        }


      }
    });
  }


  uploadMaterials() {
    const add_modal = this.modalService.create({
      nzTitle: '上传头像',
      nzWidth: 800,
      nzContent: UploadImageMaterialsComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'upload-video-materials',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {

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
        titleSlt: this.titleSlt,
        publisherId: this.menuService.currentPublisherId
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result !== 'onCancel') {
        this.titleSlt = JSON.parse(JSON.stringify(result));

        this.accountsAry.forEach((account, idx) => {
          const campaign = JSON.parse(JSON.stringify(this.campaignSettingCopy));
          campaign[0].basic.pub_campaign_name = '1';
          campaign[0].basic = { ...campaign[0].basic, ...this.commonSetting.campaign_type_setting };
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
      if (campaign.basic.campaign_select === '已有计划') {
        this.campaignDisabled[chanPubId].push(campaign.basic.pub_campaign_id);
      }
    });
  }

  doSave() {

    const isValid = this.checkBasicData();

    if (isValid) {
      this.message.error('请完善参数信息！');
      return;
    }

    if (this.accountsAry.length < 1) {
      this.message.error('请完善参数信息！');
      return;
    }

    this.accountsAry.forEach(account => {
      account['campaign'].forEach(campaign => {

        // 推广日期 --- 起始时间
        if (campaign.basic.schedule_type === 'time') {
          if (campaign.basic.time_range) {
            campaign.basic.start_time = format(new Date(campaign.basic.time_range[0]), 'yyyy-MM-dd');
            campaign.basic.end_time = format(new Date(campaign.basic.time_range[1]), 'yyyy-MM-dd');
          }
        } else {
          campaign.basic.start_time = null;
          campaign.basic.end_time = null;
        }

        // 计划预算 --- 不限
        if (campaign.basic.budget_slt === 'nolimt') {
          campaign.basic.budget = 0;
        }

        // 推广时段 --- 不限
        if (campaign.basic.schedule_slt === 'nolimt') {
          campaign.basic.schedule = [];
        }
      });
    });

    this.defaultData.accounts = [...this.accountsAry];


    if (!this.submiting) {
      this.submiting = true;
      this.launchService
        .baiduCreateLaunch(this.defaultData)
        .subscribe(
          (results: any) => {
            this.submiting = false;
            if (results.status_code !== 200) {

            } else {
              this.message.success('新建投放成功');
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

        // 每单元创意
        if (!campaign.basic.adgroup_creative_num || campaign.basic.adgroup_creative_num > 25) {
          errorCampaign.basic.adgroup_creative_num.is_show = true;
          errorCampaign['has_error'] = true;
          errorAccount['has_error'] = true;
          isValid = true;
        } else {
          errorCampaign.basic.adgroup_creative_num.is_show = false;
        }

        // 生成单元


        // 计划名称
        if (campaign.basic.campaign_select === '新建计划') {
          const campaignNameLength = getStringLengthBaidu(campaign.basic.pub_campaign_name, []);
          if (campaignNameLength < 1 || campaignNameLength > 50) {
            errorCampaign.basic.pub_campaign_name.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            if (campaignName.includes(campaign.basic.pub_campaign_name.toLowerCase())) {
              errorCampaign.basic.pub_campaign_name_repeat.is_show = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              campaignName.push(campaign.basic.pub_campaign_name.toLowerCase());
              errorCampaign.basic.pub_campaign_name_repeat.is_show = false;
            }

            errorCampaign.basic.pub_campaign_name.is_show = false;
          }
        } else if (campaign.basic.campaign_select === '已有计划') {
          if (!campaign.basic.pub_campaign_id) {
            errorCampaign.basic.pub_campaign_id.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorCampaign.basic.pub_campaign_id.is_show = false;
          }

          // 该计划下可新建计划
          if (campaign.basic.campaign_enable_count < campaign['adgroup'].length) {
            errorCampaign.basic.campaign_enable_count.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorCampaign.basic.campaign_enable_count.is_show = false;
          }
        }

        if (campaign.basic.launch_target === 'app') {
          // 推广应用
          if (campaign.basic.operating_system === 'android' && campaign.basic.app_source.indexOf('select_app') !== -1) {
            if (!campaign.basic.app_id) {
              errorCampaign.basic.app_id.is_show = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorCampaign.basic.app_id.is_show = false;
            }
          }

          // 下载链接, 应用名称
          if ((campaign.basic.operating_system === 'android' && campaign.basic.app_source.indexOf('down_url') !== -1) || campaign.basic.operating_system === 'ios') {
            if (!this.urlReg.test(campaign.basic.app_url)) {
              errorCampaign.basic.app_url.is_show = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorCampaign.basic.app_url.is_show = false;
            }

            if (!campaign.basic.app_name) {
              errorCampaign.basic.app_name.is_show = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorCampaign.basic.app_name.is_show = false;
            }
          }

          // 应用包名
          if (campaign.basic.operating_system === 'android' && campaign.basic.app_source.indexOf('down_url') !== -1) {
            if (!campaign.basic.apk_name) {
              errorCampaign.basic.apk_name.is_show = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorCampaign.basic.apk_name.is_show = false;
            }
          }

        }

        // 预算
        if (campaign.basic.budget_slt === 'budget') {
          if (campaign.basic.budget < 50 || campaign.basic.budget > 9999999) {
            errorCampaign.basic.budget.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorCampaign.basic.budget.is_show = false;
          }
        }

        accountAdgroup += campaign['adgroup'].length;

        campaign['adgroup'].forEach((adgroup, adgroupIndex) => {
          const errorAdgroup = errorCampaign.adgroup[adgroupIndex];
          errorAdgroup['has_error'] = false;

          // 单元名称
          const groupNameLength = getStringLengthBaidu(adgroup.basic.pub_adgroup_name, []);
          if (groupNameLength < 1 || groupNameLength > 50) {
            errorAdgroup.basic.pub_adgroup_name.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.basic.pub_adgroup_name.is_show = false;
          }

          if (this.commonSetting.campaign_type_setting.marketing_target === 'catalogue') {
            if (adgroup.basic.launch_products === 0) {
              // 商品目录ID
              if (!adgroup.basic.catalog_id) {
                errorAdgroup.basic.catalog_id.is_show = true;
                errorAdgroup['has_error'] = true;
                errorCampaign['has_error'] = true;
                errorAccount['has_error'] = true;
                isValid = true;
              } else {
                errorAdgroup.basic.catalog_id.is_show = false;
              }

              if (adgroup.basic.unit_products === 'rule_products') {


                // 筛选条件
                errorAdgroup.basic.rule_products.is_show = false;
                for (let i = 0; i < adgroup.basic.rule_products.length; i++) {
                  const curItem = adgroup.basic.rule_products[i];
                  if (!curItem.field || !curItem.operation || !curItem.value.length) {
                    errorAdgroup.basic.rule_products.is_show = true;
                    errorAdgroup['has_error'] = true;
                    errorCampaign['has_error'] = true;
                    errorAccount['has_error'] = true;
                    isValid = true;
                    break;
                  }
                }
              }
            }
          }


          // 目标转化
          if (account.basic.chan_pub_id && adgroup.basic.bid_type === 3) {
            // 推广URL
            if (this.commonSetting.campaign_type_setting.marketing_target === 'catalogue' && this.commonSetting.campaign_type_setting.launch_target === 'landing_page') {
              if (!this.urlReg.test(adgroup.basic.lp_url)) {
                errorAdgroup.basic.lp_url.is_show = true;
                errorAdgroup['has_error'] = true;
                errorCampaign['has_error'] = true;
                errorAccount['has_error'] = true;
                isValid = true;
              } else {
                errorAdgroup.basic.lp_url.is_show = false;
              }
            }

            // 转化名称
            if (!adgroup.basic.app_trans_id) {
              errorAdgroup.basic.app_trans_id.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.app_trans_id.is_show = false;
            }

            // 目标转化
            if (!adgroup.basic.trans_type) {
              errorAdgroup.basic.trans_type.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.trans_type.is_show = false;
            }
          }

          // 出价
          if (adgroup.basic.bid_type === 1 && adgroup.basic.pay_mode === 0 || (adgroup.basic.bid_type === 3 && adgroup.basic.pay_mode === 1 && adgroup.basic.is_skip_stage_one === false)) {
            if (adgroup.basic.bid < 0.3 || adgroup.basic.bid > 999.99) {
              errorAdgroup.basic.bid.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.bid.is_show = false;
            }
          }

          if (adgroup.basic.bid_type === 3) {
            // 目标转化出价
            if (adgroup.basic.ocpc_bid < 0.3 || adgroup.basic.ocpc_bid > 999.99) {
              errorAdgroup.basic.ocpc_bid.is_show = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.ocpc_bid.is_show = false;
            }

            if (adgroup.basic.optimize_deep_trans === 1) {
              // 深度转化
              if (!adgroup.basic.deep_trans_type) {
                errorAdgroup.basic.deep_trans_type.is_show = true;
                errorAdgroup['has_error'] = true;
                errorCampaign['has_error'] = true;
                errorAccount['has_error'] = true;
                isValid = true;
              } else {
                errorAdgroup.basic.deep_trans_type.is_show = false;
              }

              // 深度转化出价
              if (adgroup.basic.deep_ocpc_bid < 0.4 || adgroup.basic.deep_ocpc_bid > 999.99) {
                errorAdgroup.basic.deep_ocpc_bid.is_show = true;
                errorAdgroup['has_error'] = true;
                errorCampaign['has_error'] = true;
                errorAccount['has_error'] = true;
                isValid = true;
              } else {
                errorAdgroup.basic.deep_ocpc_bid.is_show = false;
              }
            }
          }

          // 用户头像

          // 品牌名称
          if (!adgroup.creative.basic.user_portrait) {
            errorAdgroup.creative.basic.user_portrait.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.creative.basic.brand.is_show = false;
          }

          // 品牌名称
          if (adgroup.creative.basic.brand.length < 1 || adgroup.creative.basic.brand.length > 8) {
            errorAdgroup.creative.basic.brand.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.creative.basic.brand.is_show = false;
          }

          adgroup.creative['detail'].forEach((creative, creativeIndex) => {
            const errorCreative = errorAdgroup.creative.detail[creativeIndex];
            errorCreative['has_error'] = false;

            const creativeNameLength = getStringLengthBaidu(creative.basic.pub_creative_name, []);
            // 创意名称
            if (creativeNameLength < 1 || creativeNameLength > 40) {
              errorCreative.basic.pub_creative_name.is_show = true;
              errorCreative['has_error'] = true;
              errorAdgroup['has_error'] = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorCreative.basic.pub_creative_name.is_show = false;
            }

            // 创意标题
            if (['524', '525', '526', '527'].indexOf(this.material_style) === -1) {
              if (creative.basic.title.length < 1 || creative.basic.title.length > 36) {
                errorCreative.basic.title.is_show = true;
                errorCreative['has_error'] = true;
                errorAdgroup['has_error'] = true;
                errorCampaign['has_error'] = true;
                errorAccount['has_error'] = true;
                isValid = true;
              } else {
                errorCreative.basic.title.is_show = false;
              }
            }

            // 副标题
            if (['517', '524', '525', '526', '527'].indexOf(this.material_style) === -1) {
              if (this.commonSetting.campaign_type_setting.marketing_target === 'catalogue' && this.commonSetting.campaign_type_setting.launch_target === 'app') {
                if ((creative.basic.sub_title.length < 1 || creative.basic.sub_title.length > 24) || creative.basic.sub_title === adgroup.creative.basic.brand) {
                  errorCreative.basic.sub_title.is_show = true;
                  errorCreative['has_error'] = true;
                  errorAdgroup['has_error'] = true;
                  errorCampaign['has_error'] = true;
                  errorAccount['has_error'] = true;
                  isValid = true;
                } else {
                  errorCreative.basic.sub_title.is_show = false;
                }
              }
            }

            if (this.commonSetting.campaign_type_setting.marketing_target === 'catalogue') {
              if (this.commonSetting.campaign_type_setting.launch_target === 'landing_page') {

                // 推广URL
                if (['517'].indexOf(this.material_style) === -1 && adgroup.basic.bid_type === 1) {
                  if (!this.urlReg.test(creative.basic.target_url)) {
                    errorCreative.basic.target_url.is_show = true;
                    errorCreative['has_error'] = true;
                    errorAdgroup['has_error'] = true;
                    errorCampaign['has_error'] = true;
                    errorAccount['has_error'] = true;
                    isValid = true;
                  } else {
                    errorCreative.basic.target_url.is_show = false;
                  }
                }

                // 调起URL
                if (['517'].indexOf(this.material_style) === -1 && this.commonSetting.position_info.flow_type === '4') {
                  if (creative.basic.na_url && !this.urlReg.test(creative.basic.na_url)) {
                    errorCreative.basic.na_url.is_show = true;
                    errorCreative['has_error'] = true;
                    errorAdgroup['has_error'] = true;
                    errorCampaign['has_error'] = true;
                    errorAccount['has_error'] = true;
                    isValid = true;
                  } else {
                    errorCreative.basic.na_url.is_show = false;
                  }
                }

                // 小程序URL
                if ((this.commonSetting.position_info.flow_type === '0' || (this.commonSetting.position_info.flow_type === '2' && this.commonSetting.position_info.flow_range.indexOf('1') !== -1)) && ['517', '524', '525', '526', '527'].indexOf(this.material_style) === -1) {
                  if (creative.basic.mini_program_schema && !this.urlReg.test(creative.basic.mini_program_schema)) {
                    errorCreative.basic.mini_program_schema.is_show = true;
                    errorCreative['has_error'] = true;
                    errorAdgroup['has_error'] = true;
                    errorCampaign['has_error'] = true;
                    errorAccount['has_error'] = true;
                    isValid = true;
                  } else {
                    errorCreative.basic.mini_program_schema.is_show = false;
                  }
                }

                // 橱窗样式设置
                if (['517'].indexOf(this.material_style) !== -1) {
                  // 标题链接
                  if (!this.urlReg.test(creative.basic.title_url)) {
                    errorCreative.basic.title_url.is_show = true;
                    errorCreative['has_error'] = true;
                    errorAdgroup['has_error'] = true;
                    errorCampaign['has_error'] = true;
                    errorAccount['has_error'] = true;
                    isValid = true;
                  } else {
                    errorCreative.basic.title_url.is_show = false;
                  }

                  // 图片描述1
                  if (!creative.basic.desc1) {
                    errorCreative.basic.desc1.is_show = true;
                    errorCreative['has_error'] = true;
                    errorAdgroup['has_error'] = true;
                    errorCampaign['has_error'] = true;
                    errorAccount['has_error'] = true;
                    isValid = true;
                  } else {
                    errorCreative.basic.desc1.is_show = false;
                  }

                  // 图片链接
                  if (!this.urlReg.test(creative.basic.picture_url)) {
                    errorCreative.basic.picture_url.is_show = true;
                    errorCreative['has_error'] = true;
                    errorAdgroup['has_error'] = true;
                    errorCampaign['has_error'] = true;
                    errorAccount['has_error'] = true;
                    isValid = true;
                  } else {
                    errorCreative.basic.picture_url.is_show = false;
                  }
                }

              }

              if (adgroup.basic.bid_type === 1 && (['517'].indexOf(this.material_style) === -1 || (['517'].indexOf(this.material_style) !== -1 && this.commonSetting.campaign_type_setting.launch_target === 'landing_page'))) {
                // 点击监测URL
                if (creative.basic.monitor_url && !this.urlReg.test(creative.basic.monitor_url)) {
                  errorCreative.basic.monitor_url.is_show = true;
                  errorCreative['has_error'] = true;
                  errorAdgroup['has_error'] = true;
                  errorCampaign['has_error'] = true;
                  errorAccount['has_error'] = true;
                  isValid = true;
                } else {
                  errorCreative.basic.monitor_url.is_show = false;
                }
              }
            }

          });
        });
      });

      // if (account.basic['account_enable_count'] < accountAdgroup) {
      //   errorAccount['account_enable_count'].is_show = true;
      // } else {
      //   errorAccount['account_enable_count'].is_show = false;
      // }

      if (account.basic['account_enable_campaign_count'] < account['campaign'].length) {
        errorAccount['account_enable_campaign_count'].is_show = true;
      } else {
        errorAccount['account_enable_campaign_count'].is_show = false;
      }
    });


    return isValid;
  }


  // 定向 -- 本地模板
  getLaunchAudienceTemplateList(isNotEmpty?) {

    if (!isNotEmpty) {
      const curCampaign = this.accountsAry[this.curAccountIndex].campaign[this.curCampaignIndex];
      curCampaign.adgroup[this.curAdgroupIndex].audience_template_id = null;
    }

    this.localTemplateList = [];

    let landing_type = 'landing_page';
    if (this.commonSetting.campaign_type_setting.launch_target !== 'landing_page') {
      landing_type = this.commonSetting.campaign_type_setting.operating_system;
    }
    const checkLandingType = landing_type;
    const checkFlowType = Number(this.commonSetting.position_info.flow_type);
    const checkMarketingTarget = this.commonSetting.campaign_type_setting.marketing_target;

    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": "1"
        }],
      //  'marketing_target': this.commonSetting.campaign_type_setting.marketing_target,
      // "landing_type": landing_type,
      // "flow_type": Number(this.commonSetting.position_info.flow_type)
    };

    this.launchService
      .getLaunchAudienceTemplateList(body, {
        cid: this.cid,
        result_model: 'page',
        count: 10000,
        page: 1,
        publisher_id: 1,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            results['data']['detail'].forEach(item => {

              if (item['landing_type'] === checkLandingType && item['marketing_target'] == checkMarketingTarget && Number(item['flow_type']) === checkFlowType) {
                this.localTemplateList.push(item);
              }
            });

          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }


}
