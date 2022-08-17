import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MaterialLibraryComponent } from "../../../../modal/material-library/material-library.component";
import { LaunchDocumentComponent } from "../../../../modal/launch-document/launch-document.component";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LaunchService } from "../../../../service/launch.service";
import { AuthService } from "../../../../../../core/service/auth.service";
import { arrayChunk, deepCopy } from "@jzl/jzl-util";
import { MaterialLibraryImageComponent } from "../../../../modal/material-library-image/material-library-image.component";
import { MenuService } from "../../../../../../core/service/menu.service";
import { format, differenceInCalendarDays } from "date-fns";
import { isArray } from "@jzl/jzl-util";
import { getStringLength } from 'src/app/shared/util/util';
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-uc-create-launch',
  templateUrl: './uc-create-launch.component.html',
  styleUrls: ['./uc-create-launch.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UcCreateLaunchComponent implements OnInit {

  public structConfigLoading = true;

  public structConfig: any = {};

  public targetConfig = {};

  public accountsList = [];

  public cid;

  public accounts = [];

  public anchorList = [
    {
      key: '#create_launch',
      name: '新建投放',
      sub: [
        { key: '#landing_object', name: '推广对象' },
        { key: '#create_launch_title', name: '选择素材' },
        { key: '#select_accounts', name: '选择账号' },
      ]
    },
    {
      key: '#landing_group',
      name: '推广组',
      sub: [
        { key: '#landing_group_name', name: '推广组名称' },
      ]
    },
    {
      key: '#landing_adgroup',
      name: '推广计划',
      sub: [
        { key: '#landing_campaign', name: '推广目标' },
        { key: '#landing_object_info', name: '推广对象' },
        { key: '#scheduling_bid', name: '排期和出价' },
        { key: '#target_setting', name: '定向设置' },
      ]
    },
    {
      key: '#landing_creative',
      name: '推广创意',
      sub: [
        { key: '#creative_material', name: '创意素材' },
        { key: '#creative_setting', name: '共用设置' },
      ]
    },
  ];

  public materialSlt = [];

  public titleSlt = [];

  public preAccountsAry = [];

  public curAccountIndex = 0; // 账号下标
  public curCampaignIndex = 0; // 计划下标
  public curAdgroupIndex = 0; // 单元下标
  public curCreativeIndex = 0; // 创意下标

  public material_style = 1; // 创意样式

  public objective_type = '1';

  public submiting = false;

  public url_reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;

  public urlReg: any;

  public defaultData: any = {
    accounts: [],
  };

  public accountsAry = [];

  public campaignInit = [
    {
      basic: {
        adgroup_num: null, // 组合单元
        isCross: false, // 是否交叉组合计划
        adgroup_title_num: null, // 每单元标题
        adgroup_material_num: null, // 每单元素材
        campaign_select: "create", // 计划选择
        campaign_name: "",  // 推广组名称
        pub_campaign_id: null,  // 推广组id
        objective_type: '4',
        campaign_list: []  // 已有推广组列表
      },
      adgroup: [
        {
          basic: {
            url_select: "local",  //  media 媒体   local 本地
            adgroup_name: "",   // 计划名称
            opt_target: 3,  // 优化目标
            delivery: 3,      //  投放方式
            budget: "",      //  预算
            charge_type: 1,     //  计费方式
            enable_anxt: true,      //  是否启用安心投
            app_name: "",     //  app名称
            download_url: "",     //  下载链接
            package_name: "",     //  应用包名
            target_url: "",     //  落地页链接
            site_id: 0,     //  落地页链接id
            ad_convert_id: null,     //  转化id
            convert_type: null,      //  转化类型
            deep_convert_type: null,
            track_args: [],     //  链接追踪参数
            schedule_type: "now",      //  排期方式 date代表选择日期 ,now代表从今天开始
            schedule: "",     //  投放时段
            start_date: "",     // 排期开始时间
            end_date: "",     //  排期结束时间
            bid: "0.50",      //  出价
            opt_bid: "1.00",      //  转化出价
            skip_first_stage: 1,      //  智能出价
            slot_bidding: 1,      //  最大化获量
            convertData: [],    // 转化类型列表
            convetListType: "", // 转化数据
            convertList: "",
            schedule_time_slt: "nolimit",   // 是否指定投放时段
            day_budget: "nolimit",  // 是否指定预算
            time_range: [new Date(), new Date()],  // 排期时间
            industryList: [],  // 创意分类列表
            industryNumber: 0,
            isDisabledConvert: true, // 是否禁用转化按钮
            isHiddenConvert: true,
            targeting_package_id: null,
            targetings: {
            },
            target_select: "local",
          },
          creative: {
            basic: {
              style: null,     //  创意样式
              show_mode: 1,      //  展现方式
              click_monitor_url: "",      //  点击监测链接
              label: [],      //  创意标签
              source: "",     //  推广来源字符范围
              industry: [],     //  创意分类
              logo_image_id: "",     //  头像id
              imgUrl: "",   //  头像路径
              resultData: [],
              isHiddenSelect: false,
            },
            detail: [],
            // {
            //   title: "",  // 标题
            //   half_title: "",  // 副标题
            //   material: "",
            //   material_ids: [],
            // }

          }
        }
      ]
    }
  ];

  public downloadUrlList: any;

  public downloadUrlData: any;

  public tableHeight = document.body.clientHeight - 60 - 40;
  public tableWidth = document.body.clientWidth - 150 - 130;

  public publisher_id: any;

  public getGroupLength = 0;

  public errorTipAry = [];
  public campaignErrorTip = [
    {
      basic: {
        adgroup_title_num: {
          is_show: false,
          tip_text: '不能超过所选标题数且最多10条'
        },
        adgroup_material_num: {
          is_show: false,
          tip_text: '不能超过所选素材数且最多6个'
        },
        campaign_name: {
          is_show: false,
          tip_text: '推广组名称应为1-50字'
        },
        campaign_name_repeat: {
          is_show: false,
          tip_text: '广告组名称不能重复'
        },
        pub_campaign_id: {
          is_show: false,
          tip_text: '广告组名称应为1-50字'
        },
        campaign_enable_count: {
          is_show: false,
          tip_text: '不能超过可新建计划数'
        },
      },
      has_error: false,
      adgroup: [
        {
          basic: {
            adgroup_name: {
              is_show: false,
              tip_text: '计划名称应为1-50字'
            },
            download_url: {
              is_show: false,
              tip_text: '请输入正确的应用下载链接'
            },
            target_url: {
              is_show: false,
              tip_text: '请输入正确的落地页链接'
            },
            package_name: {
              is_show: false,
              tip_text: '应用包名不能为空'
            },
            app_name: {
              is_show: false,
              tip_text: 'APP名称不能为空'
            },
            convert_id: {
              is_show: false,
              tip_text: '转化目标不能为空'
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
            platform: {
              is_show: false,
              tip_text: '请选择操作系统'
            },  // 操作系统
            age: {
              is_show: false,
              tip_text: '请选择年龄范围'
            },  // 年龄
            targeting_package_id: {
              is_show: false,
              tip_text: '请选择媒体定向包'
            }, // 媒体定向包


          },
          has_error: false,
          creative: {
            basic: {
              industry: {
                is_show: false,
                tip_text: '创意分类不能为空'
              },
              label: {
                is_show: false,
                tip_text: '创意标签不能为空'
              },
              logo_image_id: {
                is_show: false,
                tip_text: '请选择品牌头像'
              },
              source: {
                is_show: false,
                tip_text: '推广来源应为1-16字'
              },
            },
            has_error: false,
          },
        }
      ]
    }
  ];

  public mediaTargetList = [];

  public localTargetList = [];

  public reInitTarget = true;

  public reInitTargetTimer;

  public user_id;

  public productInfo = {};

  constructor(private message: NzMessageService,
    private modalService: NzModalService,
    private launchService: LaunchService,
    private authService: AuthService,
    public menuService: MenuService,
    private productService: ProductDataService) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.publisher_id = this.menuService.currentPublisherId;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }


  ngOnInit() {
    this.urlReg = new RegExp(this.url_reg);
    this.getAccountList();
    this.getFeedStructConfigByUc();
    this.getFeedTargetConfigByUc();
    this.getDownloadLinkUrl();
  }

  changeadGroupFalg(account, adgroup) {
    this.getLaunchMediaAudienceList(account, adgroup);
    this.getLaunchAudienceTemplateList(account, adgroup);
    adgroup.basic = { ...adgroup.basic };
  }

  groupNameChange(data) {
    this.getGroupLength = getStringLength(data.campaign_name, []);
  }

  currentTabChange(tag) {
    if (tag === 'campaign') {
      this.curCampaignIndex = 0;
    }
    this.curAdgroupIndex = 0;
    this.curCreativeIndex = 0;
  }

  curAdgroupTabChange(campaign) {
    this.curCreativeIndex = 0;
  }

  // 复制参数到其他账号
  copyCurAccountParams(data, ary, errorData) {
    ary.forEach((item, idx) => {
      const copyData = JSON.parse(JSON.stringify(data.campaign));
      copyData.forEach(campaign => {
        campaign.adgroup.forEach(adgroup => {
          if (adgroup.basic.campaign_select === 'exit') {
            adgroup.basic.campaign_select = 'create';
            adgroup.basic.pub_campaign_id = null;
          }
          adgroup.basic.convert_id = null;
          adgroup.basic.targetings.include_audience = [];
          adgroup.basic.targetings.exclude_audience = [];
          adgroup.basic.targetings.audience_targeting = -1;
          adgroup.basic.ad_convert_id = null;
          adgroup.basic.convert_type = null;
          adgroup.basic.convetListType = null;
          adgroup.basic.deep_convert_type = null;
          adgroup.basic.isDisabledConvert = true;
          adgroup.basic.isHiddenConvert = true;
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
        errorItem.account_enable_count = JSON.parse(JSON.stringify({
          is_show: false,
          tip_text: '不能超过今天可新建计划数'
        }));
        errorItem.account_enable_campaign_count = JSON.parse(JSON.stringify({
          is_show: false,
          tip_text: '不能超过该账户下可新建广告组数'
        }));
        errorItem.has_error = copyErrorData.has_error;
      }
    });

    this.message.success('复制成功');
  }


  copyCurrent(data, ary, errorData?, tag?) {
    const curData = JSON.parse(JSON.stringify(data));
    if (tag === 'campaign') {
      if (data.basic.campaign_select === 'exit') {
        curData.basic.campaign_select = 'create';
        curData.basic.pub_campaign_id = null;
      }
      curData.basic.campaign_name = data.basic.campaign_name + '-' + (ary.length + 1);
      errorData.push(JSON.parse(JSON.stringify(errorData[this.curCampaignIndex])));
    } else if (tag === 'adgroup') {
      curData.basic.adgroup_name = data.basic.adgroup_name + '-' + (ary.length + 1);
      errorData.push(JSON.parse(JSON.stringify(errorData[this.curAdgroupIndex])));
    }
    ary.push({ ...curData });

    this.message.success('复制成功');
  }

  copyAdgroupParams(data, ary) {
    const copyData = JSON.parse(JSON.stringify(data));

    for (let i = 0; i < ary.length; i++) {
      ary[i].basic = JSON.parse(JSON.stringify(copyData.basic));
      ary[i].creative.basic = JSON.parse(JSON.stringify(copyData.creative.basic));

      ary[i].basic.adgroup_name = ary[i].basic.adgroup_name + '-' + (i + 1);
    }

    this.message.success('复制成功');
  }

  // 打开素材库
  openMaterials() {
    let cssType;
    if (this.material_style === 1 || this.material_style === 2 || this.material_style === 4) {
      this.material_style === 1 ? cssType = '2' : this.material_style === 2 ? cssType = '3' : cssType = '4';
      this.addImageMaterials('materials', null, cssType);
    } else {
      this.addVideoMaterials();
    }
  }

  // 视频素材库
  addVideoMaterials() {
    const add_modal = this.modalService.create({
      nzTitle: '素材库',
      nzWidth: 1200,
      nzContent: MaterialLibraryComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        materialSlt: this.materialSlt,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result !== 'onCancel') {
        this.materialSlt = JSON.parse(JSON.stringify(result));

        this.accountsAry.forEach((account, idx) => {
          const campaign = JSON.parse(JSON.stringify(this.campaignInit));
          campaign[0].basic.campaign_name = '1';
          campaign[0].basic.objective_type = this.objective_type;
          campaign[0].basic.adgroup_title_num = this.titleSlt.length > 200 ? 200 : this.titleSlt.length;
          campaign[0].basic.adgroup_material_num = this.materialSlt.length > 200 ? 200 : this.materialSlt.length;
          campaign[0].basic.adgroup_num = Math.ceil(this.titleSlt.length / campaign[0].basic.adgroup_title_num) * Math.ceil(this.materialSlt.length / campaign[0].basic.adgroup_material_num);
          account.campaign = [...campaign];

          this.getMaxLength(idx, 0);
          // const campaignError = JSON.parse(JSON.stringify(this.campaignErrorTip));
          // const errorTip = {
          //   pub_account_id: account.basic.pub_account_id,
          //   has_error: false,
          //   account_enable_count: JSON.parse(JSON.stringify({
          //     is_show: false,
          //     tip_text: '不能超过今天可新建计划数'
          //   })),
          //   account_enable_campaign_count: JSON.parse(JSON.stringify({
          //     is_show: false,
          //     tip_text: '不能超过该账户下可新建广告组数'
          //   })),
          //   campaign: [...campaignError],
          // };
          // this.errorTipAry[idx] = {...errorTip};
        });
      }
    });
  }

  // 图片素材库
  addImageMaterials(type = 'materials', data?, cssType?, accountIndex?, campaignIndex?, adgroupIndex?) {
    const add_modal = this.modalService.create({
      nzTitle: '素材库',
      nzWidth: 1000,
      nzContent: MaterialLibraryImageComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        materialSlt: this.materialSlt,
        css_type: Number(cssType),
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result !== 'onCancel') {
        this.materialSlt = JSON.parse(JSON.stringify(result));
        this.accountsAry.forEach((account, idx) => {
          const campaign = JSON.parse(JSON.stringify(this.campaignInit));
          campaign[0].basic.campaign_name = '1';
          campaign[0].basic.objective_type = this.objective_type;
          campaign[0].basic.adgroup_title_num = this.titleSlt.length > 200 ? 200 : this.titleSlt.length;
          campaign[0].basic.adgroup_material_num = this.materialSlt.length > 200 ? 200 : this.materialSlt.length;
          campaign[0].basic.adgroup_num = Math.ceil(this.titleSlt.length / campaign[0].basic.adgroup_title_num) * Math.ceil(this.materialSlt.length / campaign[0].basic.adgroup_material_num);
          account.campaign = [...campaign];
          this.getMaxLength(idx, 0);
        });
      }
    });
  }

  // 标题库
  addDocuments() {
    const add_modal = this.modalService.create({
      nzTitle: '标题文案管理',
      nzWidth: 1000,
      nzContent: LaunchDocumentComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'launch-document',
      nzFooter: null, nzComponentParams: {
        titleSlt: this.titleSlt
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result !== 'onCancel') {
        this.titleSlt = JSON.parse(JSON.stringify(result));

        this.accountsAry.forEach((account, idx) => {
          const campaign = JSON.parse(JSON.stringify(this.campaignInit));
          campaign[0].basic.campaign_name = '1';
          campaign[0].basic.objective_type = this.objective_type;
          campaign[0].basic.adgroup_title_num = this.titleSlt.length > 200 ? 200 : this.titleSlt.length;
          campaign[0].basic.adgroup_material_num = this.materialSlt.length > 200 ? 200 : this.materialSlt.length;
          campaign[0].basic.adgroup_num = Math.ceil(this.titleSlt.length / campaign[0].basic.adgroup_title_num) * Math.ceil(this.materialSlt.length / campaign[0].basic.adgroup_material_num);
          account.campaign = [...campaign];

          this.getMaxLength(idx, 0);
        });
      }
    });
  }

  // 获取最大长度数组
  getMaxLength(accountIdx, campaignIdx) {
    this.curAdgroupIndex = 0;
    this.curCreativeIndex = 0;

    if (!this.accountsAry.length) {
      return;
    }

    const material_num = this.accountsAry[accountIdx].campaign[campaignIdx].basic.adgroup_material_num;
    const title_num = this.accountsAry[accountIdx].campaign[campaignIdx].basic.adgroup_title_num;
    const isCross = this.accountsAry[accountIdx].campaign[campaignIdx].basic.isCross;

    if (material_num > this.materialSlt.length || material_num > 200) {
      this.message.error('每计划素材不能不能超过所选素材数且最多200个');
      return false;
    }

    if (title_num > this.titleSlt.length) {
      this.message.error('每计划标题不能超过所选标题数且最多200条');
      return false;
    }

    if (this.materialSlt.length > 0 && this.titleSlt.length > 0 && material_num > 0 && title_num > 0) {
      let adgroupNum;

      const materialSltSplit = arrayChunk(this.materialSlt, material_num);
      const titleSltSplit = arrayChunk(this.titleSlt, title_num);

      if (isCross) {
        adgroupNum = Math.ceil(this.titleSlt.length / title_num) * Math.ceil(this.materialSlt.length / material_num);
        this.accountsAry[accountIdx].campaign[campaignIdx].basic.adgroup_num = adgroupNum;

        // materialSltSplit.length * titleSltSplit.length = adgroup.length;
        if (materialSltSplit.length > titleSltSplit.length) {
          this.getCrossCreativeGroup(materialSltSplit, titleSltSplit, 'material', accountIdx, campaignIdx);
        } else {
          this.getCrossCreativeGroup(titleSltSplit, materialSltSplit, 'title', accountIdx, campaignIdx);
        }
      } else {
        adgroupNum = Math.max(Math.ceil(this.titleSlt.length / title_num), Math.ceil(this.materialSlt.length / material_num));
        this.accountsAry[accountIdx].campaign[campaignIdx].basic.adgroup_num = adgroupNum;

        // materialSltSplit.length * titleSltSplit.length = adgroup.length;
        if (materialSltSplit.length > titleSltSplit.length) {
          this.getCreativeGroup(materialSltSplit, titleSltSplit, 'material', accountIdx, campaignIdx);
        } else {
          this.getCreativeGroup(titleSltSplit, materialSltSplit, 'title', accountIdx, campaignIdx);
        }
      }

    }
  }

  // 常规组合
  getCreativeGroup(maxAry, minAry, tag, accountIdx, campaignIdx) {
    this.accountsAry[accountIdx].campaign[campaignIdx].adgroup = [];

    this.errorTipAry[accountIdx]['has_error'] = false;
    this.errorTipAry[accountIdx]['account_enable_count']['is_show'] = false;
    this.errorTipAry[accountIdx]['account_enable_campaign_count']['is_show'] = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].basic = JSON.parse(JSON.stringify(this.campaignErrorTip[0].basic));
    this.errorTipAry[accountIdx].campaign[campaignIdx].has_error = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup = [];

    let minIdx = 0;
    maxAry.forEach((maxItem, maxIdx) => {
      const newGroup = JSON.parse(JSON.stringify(this.campaignInit[0]['adgroup'][0]));
      let idx = 0;

      if (maxItem.length > minAry[minIdx].length) {
        maxItem.forEach(lItem => {
          if (this.material_style === 4) {
            if (isArray(lItem) && lItem.find(s_item => s_item.material_id)) {
              newGroup.creative.detail.push({
                material_ids: lItem,
                title: minAry[minIdx][idx],
                half_title: "",
              });
            } else {
              newGroup.creative.detail.push({
                material_ids: minAry[minIdx][idx],
                title: lItem,
                half_title: "",
              });
            }
          } else {
            if (lItem['material_id']) {
              newGroup.creative.detail.push({
                material_id: lItem['material_id'],
                title: minAry[minIdx][idx],
                half_title: "",
              });
            } else {
              newGroup.creative.detail.push({
                material_id: minAry[minIdx][idx]['material_id'],
                title: lItem,
                half_title: "",
              });
            }
          }

          idx = idx >= (minAry[minIdx].length - 1) ? 0 : idx + 1;
        });
      } else {
        minAry[minIdx].forEach(lItem => {
          if (this.material_style === 4) {
            if (lItem.find(s_item => s_item.material_id)) {
              newGroup.creative.detail.push({
                material_ids: lItem,
                title: maxItem[idx],
                half_title: "",
              });
            } else {
              newGroup.creative.detail.push({
                material_ids: maxItem[idx],
                title: lItem,
                half_title: "",
              });
            }
          } else {
            if (lItem['material_id']) {
              newGroup.creative.detail.push({
                material_id: lItem['material_id'],
                title: maxItem[idx],
                half_title: "",
              });
            } else {
              newGroup.creative.detail.push({
                material_id: maxItem[idx]['material_id'],
                title: lItem,
                half_title: "",
              });
            }
          }

          idx = idx >= (maxItem.length - 1) ? 0 : idx + 1;
        });
      }

      newGroup.basic.adgroup_name = (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length + 1) + '';
      if (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length < 500) {
        this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.push(newGroup);
        this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup.push(JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0])));
      }

      minIdx = minIdx >= (minAry.length - 1) ? 0 : minIdx + 1;
    });
  }

  // 交叉组合
  getCrossCreativeGroup(maxAry, minAry, tag, accountIdx, campaignIdx) {
    this.accountsAry[accountIdx].campaign[campaignIdx].adgroup = [];

    this.errorTipAry[accountIdx]['has_error'] = false;
    this.errorTipAry[accountIdx]['account_enable_count']['is_show'] = false;
    this.errorTipAry[accountIdx]['account_enable_campaign_count']['is_show'] = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].basic = JSON.parse(JSON.stringify(this.campaignErrorTip[0].basic));
    this.errorTipAry[accountIdx].campaign[campaignIdx].has_error = false;
    this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup = [];

    maxAry.forEach((maxItem, maxIdx) => {
      minAry.forEach((minItem, minIdx) => {
        let idx = 0;
        const newGroup = JSON.parse(JSON.stringify(this.campaignInit[0]['adgroup'][0]));
        if (maxItem.length > minItem.length) {
          maxItem.forEach(lItem => {
            if (this.material_style === 4) {
              if (isArray(lItem) && lItem.find(item => item.material_id)) {
                newGroup.creative.detail.push({
                  material_ids: lItem,
                  title: minItem[idx],
                  half_title: "",
                });
              } else {
                newGroup.creative.detail.push({
                  material_ids: minItem[idx],
                  title: lItem,
                  half_title: "",
                });
              }
            } else {
              if (lItem['material_id']) {
                newGroup.creative.detail.push({
                  material_id: lItem['material_id'],
                  title: minItem[idx],
                  half_title: "",
                });
              } else {
                newGroup.creative.detail.push({
                  material_id: minItem[idx]['material_id'],
                  title: lItem,
                  half_title: "",
                });
              }
            }
            idx = idx >= (minItem.length - 1) ? 0 : idx + 1;
          });
        } else {
          minItem.forEach(lItem => {
            if (this.material_style === 4) {
              if (lItem.find(item => item.material_id)) {
                newGroup.creative.detail.push({
                  material_ids: lItem,
                  title: maxItem[idx],
                  half_title: "",
                });
              } else {
                newGroup.creative.detail.push({
                  material_ids: maxItem[idx],
                  title: lItem,
                  half_title: "",
                });
              }
            } else {
              if (lItem['material_id']) {
                newGroup.creative.detail.push({
                  material_id: lItem['material_id'],
                  title: maxItem[idx],
                  half_title: "",
                });
              } else {
                newGroup.creative.detail.push({
                  material_id: maxItem[idx]['material_id'],
                  title: lItem,
                  half_title: "",
                });
              }
            }

            idx = idx >= (maxItem.length - 1) ? 0 : idx + 1;
          });
        }

        newGroup.basic.adgroup_name = (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length + 1) + '';

        if (this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.length < 500) {
          this.accountsAry[accountIdx].campaign[campaignIdx].adgroup.push(newGroup);
          this.errorTipAry[accountIdx].campaign[campaignIdx].adgroup.push(JSON.parse(JSON.stringify(this.campaignErrorTip[0]['adgroup'][0])));
        }
      });
    });
  }

  // 切换账户
  accountChange(ids) {
    const accountsAryCopy = JSON.parse(JSON.stringify(this.accountsAry));
    const errorTipCopy = JSON.parse(JSON.stringify(this.errorTipAry));
    this.accountsAry = [];
    this.errorTipAry = [];

    ids.forEach(item => {
      let accountExit = {};
      let campaign;
      const filterItem = this.accountsList.filter(filter => filter.pub_account_id === item);
      if (!filterItem.length) {
        return;
      }

      const basic = { ...filterItem[0] };
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
        campaign = JSON.parse(JSON.stringify(this.campaignInit));
        campaign[0].basic.campaign_name = '1';
        campaign[0].basic.objective_type = this.objective_type;
        campaign[0].basic.adgroup_title_num = this.titleSlt.length > 200 ? 200 : this.titleSlt.length;
        campaign[0].basic.adgroup_material_num = this.materialSlt.length > 200 ? 200 : this.materialSlt.length;
        campaign[0].basic.adgroup_num = Math.ceil(this.titleSlt.length / campaign[0].basic.adgroup_title_num) * Math.ceil(this.materialSlt.length / campaign[0].basic.adgroup_material_num);
        this.accountsAry.push({
          basic: { ...basic },
          campaign: [...campaign],
        });

        // 获取账户下今天可建计划数
        // this.getAccountEnabledCount(this.accountsAry[this.accountsAry.length - 1].basic);
        this.getCompaignList(this.accountsAry[this.accountsAry.length - 1]);
        this.getUcAudienceConfig(this.accountsAry[this.accountsAry.length - 1]);
        this.getLaunchMediaAudienceList(this.accountsAry[this.accountsAry.length - 1]);
        this.getLaunchAudienceTemplateList(this.accountsAry[this.accountsAry.length - 1]);
        this.getFeedWhiteAccount(this.accountsAry[this.accountsAry.length - 1]);
      }

      let hasError = false;
      let campaignError;
      let accountEnableCountError = {
        is_show: false,
        tip_text: '不能超过今天可新建计划数'
      };

      let accountEnableCampaignCount = {
        is_show: false,
        tip_text: '不能超过该账户下可新建广告组数'
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


    if (this.preAccountsAry.length < ids.length) {
      this.curAccountIndex = ids.length - 1;
      this.curCampaignIndex = 0;
      this.getMaxLength(ids.length - 1, 0);
    } else {
      this.curAccountIndex = 0;
      this.curCampaignIndex = 0;
      this.curAdgroupIndex = 0;
      this.curCreativeIndex = 0;
    }

    this.preAccountsAry = JSON.parse(JSON.stringify(ids));
  }

  // 获取账户列表
  getAccountList() {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": "17"
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
        () => {
        },
      );
  }

  // 获取账户白名单
  getFeedWhiteAccount(account) {
    this.launchService
      .getFeedWhiteAccount({
        cid: this.cid,
        user_id: this.user_id,
        chan_pub_id: account.basic.chan_pub_id,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            account.basic.display = results['data']['display'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  // 获取账户下已有推广组列表
  getCompaignList(account) {
    const body = {
      chan_pub_id: account.basic.chan_pub_id,
    };
    this.launchService
      .getCampaignList(body, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            const data = JSON.parse(JSON.stringify(results['data']));
            account.campaign[this.curCampaignIndex].basic['campaign_list'] = data.filter(item => item.objective_type === account.campaign[this.curCampaignIndex].basic.objective_type);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  // 媒体定向列表
  getLaunchMediaAudienceList(account, adgroup?) {
    let opt_target_type;
    adgroup && adgroup.basic.opt_target !== 3 ? opt_target_type = adgroup.basic.opt_target : opt_target_type = 3;
    const body = {
      chan_pub_id: account.basic.chan_pub_id,
      objective_type: this.objective_type,
      opt_target: opt_target_type
    };
    this.launchService
      .getLaunchMediaAudienceList(body, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            const data = JSON.parse(JSON.stringify(results['data']));
            this.mediaTargetList = data;
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  // 本地定向列表
  getLaunchAudienceTemplateList(account, adgroup?) {
    let opt_target_type;
    adgroup && adgroup.basic.opt_target !== 3 ? opt_target_type = adgroup.basic.opt_target : opt_target_type = 3;
    const body = {
      pConditions: [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": "17"
        }],
      objective_type: this.objective_type,
      opt_target: opt_target_type
    };

    this.launchService
      .getLaunchAudienceTemplateList(body, {
        cid: this.cid,
        result_model: 'all',
        publisher_id: this.publisher_id
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.localTargetList = [];
          } else {
            const data = JSON.parse(JSON.stringify(results['data']));
            this.localTargetList = data;
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  // 获取账户下今天可建计划数
  getAccountEnabledCount(accountBasic) {
    const body = {
      chan_pub_id: accountBasic.chan_pub_id,
    };
    this.launchService
      .getAdgroupListNum(body, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            const data = JSON.parse(JSON.stringify(results['data']));
            accountBasic['account_enable_count'] = data.ok_num;
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  // 获取推广组、计划、创意配置项
  getFeedStructConfigByUc() {
    this.launchService
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
            this.initData(this.structConfig['creative']['industry']['sub']);
            this.campaignInit[0].adgroup[0].basic.industryList = this.structConfig['creative']['industry']['sub'];
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

  // 获取定向配置项
  getFeedTargetConfigByUc() {
    this.launchService
      .getFeedTargetConfigByUc({
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {

          if (results.status_code && results.status_code !== 200) {
            if (results.status_code !== 205) {
              this.message.error(results.message);
            }
          } else {
            this.targetConfig = { ...results.data };
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 获取人群包
  getUcAudienceConfig(account) {
    this.launchService
      .getUcAudienceConfig({
        cid: this.cid,
        chan_pub_id: account.basic.chan_pub_id,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code !== 200) {
            if (results.status_code !== 205) {
              this.message.error(results.message);
            }
          } else {
            account.basic.audienceConfigList = results['data']['audienceList'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  // 创意样式 change
  basicChange() {
    this.materialSlt = [];
    this.titleSlt = [];
    this.creativeMaterialChange();
  }

  creativeMaterialChange() {
    this.accounts = [];
    this.accountsAry = [];
    this.preAccountsAry = [];
    this.curAccountIndex = 0;
    this.curCampaignIndex = 0;
    this.curAdgroupIndex = 0;
    this.curCreativeIndex = 0;
  }

  adgroupNumChange() {
    this.getMaxLength(this.curAccountIndex, this.curCampaignIndex);
  }

  campaignSltChanged(data, event) {
    if (event === 'create') {
      data.pub_campaign_id = null;
    }
    data.campaign_name = '';
  }

  changeCampaign(data, id) {
    const list = data.campaign_list.find(item => item.pub_campaign_id === id);
    if (list && list.pub_campaign_name) {
      data.campaign_name = list.pub_campaign_name;
    }
  }

  getDownloadLinkUrl() {
    this.launchService
      .getUcAppTypeUrlList({
        result_model: 'all',
        cid: this.cid,
        publisher_id: this.publisher_id
      })
      .subscribe(
        (results: any) => {

          if (results.status_code && results.status_code !== 200) {
            if (results.status_code !== 205) {
              this.message.error(results.message);
            }
          } else {
            this.downloadUrlData = { ...results };
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
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

  changeLocalTarget(id, list) {
    list.targetings = {};

    const filterItem = this.localTargetList.find(filter => filter.audience_template_id === id);

    if (filterItem) {
      this.reInitTarget = false;

      list.targetings = deepCopy(filterItem.audience_setting);

      if (this.reInitTargetTimer) {
        clearTimeout(this.reInitTargetTimer);
      }
      this.reInitTargetTimer = setTimeout(() => {
        this.reInitTarget = true;
      }, 1000);
    }
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

  doCancel() {
    history.go(-1);
  }

  checkBasicData() {
    let isValid = false;
    this.accountsAry.forEach((account, accountIndex) => {
      const errorAccount = this.errorTipAry[accountIndex];
      errorAccount['has_error'] = false;

      let accountAdgroup = 0; // 该账户下组合计划数

      account['campaign'].forEach((campaign, campaignIndex) => {
        const errorCampaign = errorAccount.campaign[campaignIndex];
        errorCampaign['has_error'] = false;

        // 每计划标题
        if (!campaign.basic.adgroup_title_num || campaign.basic.adgroup_title_num > this.titleSlt.length) {
          errorCampaign.basic.adgroup_title_num.is_show = true;
          errorCampaign['has_error'] = true;
          errorAccount['has_error'] = true;
          isValid = true;
        } else {
          errorCampaign.basic.adgroup_title_num.is_show = false;
        }

        // 每计划素材
        if (!campaign.basic.adgroup_material_num || campaign.basic.adgroup_material_num > this.materialSlt.length) {
          errorCampaign.basic.adgroup_material_num.is_show = true;
          errorCampaign['has_error'] = true;
          errorAccount['has_error'] = true;
          isValid = true;
        } else {
          errorCampaign.basic.adgroup_material_num.is_show = false;
        }

        // 广告组名称
        if (campaign.basic.campaign_select === 'create') {
          if (!campaign.basic.campaign_name) {
            errorCampaign.basic.campaign_name.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorCampaign.basic.pub_campaign_id.is_show = false;
          }

        } else if (campaign.basic.campaign_select === 'exit') {
          if (!campaign.basic.pub_campaign_id) {
            errorCampaign.basic.pub_campaign_id.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorCampaign.basic.pub_campaign_id.is_show = false;
          }

          // 该广告组下可新建计划
          if (campaign.basic.campaign_enable_count < campaign['adgroup'].length) {
            errorCampaign.basic.campaign_enable_count.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorCampaign.basic.campaign_enable_count.is_show = false;
          }
        }

        accountAdgroup += campaign['adgroup'].length;

        campaign['adgroup'].forEach((adgroup, adgroupIndex) => {
          const errorAdgroup = errorAccount.campaign[campaignIndex].adgroup[adgroupIndex];
          errorAdgroup['has_error'] = false;

          // 计划名称
          if (!adgroup.basic.adgroup_name) {
            errorAdgroup.basic.adgroup_name.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.basic.adgroup_name.is_show = false;
          }

          // 落地页链接
          if (!this.urlReg.test(adgroup.basic.target_url)) {
            errorAdgroup.basic.target_url.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.basic.target_url.is_show = false;
          }

          // 下载链接, 应用包名, app名
          if ((campaign.basic.objective_type === '2' || campaign.basic.objective_type === '4')) {
            if (!this.urlReg.test(adgroup.basic.download_url)) {
              errorAdgroup.basic.download_url.is_show = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.download_url.is_show = false;
            }

            if (!adgroup.basic.package_name) {
              errorAdgroup.basic.package_name.is_show = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.package_name.is_show = false;
            }

            if (!adgroup.basic.app_name) {
              errorAdgroup.basic.app_name.is_show = true;
              errorCampaign['has_error'] = true;
              errorAccount['has_error'] = true;
              isValid = true;
            } else {
              errorAdgroup.basic.app_name.is_show = false;
            }

          }

          // 转化id
          if (adgroup.basic.opt_target === 3 && adgroup.basic.ad_convert_id === null) {
            errorAdgroup.basic.convert_id.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.basic.convert_id.is_show = false;
          }

          // 日预算
          if (adgroup.basic.day_budget === 'schedule_budget' && !adgroup.basic.budget) {
            errorAdgroup.basic.budget.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.basic.budget.is_show = false;
          }

          // 出价
          if (!adgroup.basic.bid) {
            errorAdgroup.basic.bid.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.basic.bid.is_show = false;
          }

          // 转化出价
          if (adgroup.basic.opt_target === 3 && !adgroup.basic.opt_bid) {
            errorAdgroup.basic.opt_bid.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.basic.opt_bid.is_show = false;
          }

          // 媒体定向包
          if (adgroup.basic.target_select === 'media' && !adgroup.basic.targetings.targeting_package_id) {
            errorAdgroup.basic.targeting_package_id.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.basic.targeting_package_id.is_show = false;
          }

          // 年龄
          if (!adgroup.basic.targetings.age.length) {
            errorAdgroup.basic.age.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.basic.age.is_show = false;
          }

          // 操作系统
          if (!adgroup.basic.targetings.platform.length) {
            errorAdgroup.basic.platform.is_show = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.basic.platform.is_show = false;
          }

          // 创意分类
          if (account.basic.display && !adgroup.creative.basic.industry.length) {
            errorAdgroup.creative.basic.industry.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.creative.basic.industry.is_show = false;
          }

          // 创意标签
          if (account.basic.display && !adgroup.creative.basic.label.length) {
            errorAdgroup.creative.basic.label.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.creative.basic.label.is_show = false;
          }

          // 头像id
          if (!adgroup.creative.basic.logo_image_id) {
            errorAdgroup.creative.basic.logo_image_id.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.creative.basic.logo_image_id.is_show = false;
          }

          if (adgroup.creative.basic.source.length < 1 || adgroup.creative.basic.source.length > 16) {
            errorAdgroup.creative.basic.source.is_show = true;
            errorAdgroup['has_error'] = true;
            errorCampaign['has_error'] = true;
            errorAccount['has_error'] = true;
            isValid = true;
          } else {
            errorAdgroup.creative.basic.source.is_show = false;
          }

        });
      });

      if (account.basic['account_enable_count'] < accountAdgroup) {
        errorAccount['account_enable_count'].is_show = true;
      } else {
        errorAccount['account_enable_count'].is_show = false;
      }

      if (account.basic['account_enable_campaign_count'] < account['campaign'].length) {
        errorAccount['account_enable_campaign_count'].is_show = true;
      } else {
        errorAccount['account_enable_campaign_count'].is_show = false;
      }
    });


    return isValid;
  }

  doSave() {
    if (!this.materialSlt.length) {
      this.message.error('请选择素材');
      return false;
    }

    if (!this.titleSlt.length) {
      this.message.error('请选择文案');
      return false;
    }

    if (!this.accountsAry.length) {
      this.message.error('请选择账号');
      return false;
    }

    const isValid = this.checkBasicData();

    if (isValid) {
      this.message.error('请完善参数信息！');
      return;
    }

    const data = deepCopy(this.accountsAry);

    data.forEach(account => {
      delete account['basic'].audienceConfigList;
      account['campaign'].forEach(campaign => {
        campaign['adgroup'].forEach(adgroup => {
          // 投放时间 --- 起始时间
          if (adgroup.basic.time_range) {
            adgroup.basic.start_date = format(new Date(adgroup.basic.time_range[0]), 'yyyyMMdd');
            adgroup.basic.end_date = format(new Date(adgroup.basic.time_range[1]), 'yyyyMMdd');
          }

          if (adgroup.basic.target_select === 'media') {
            adgroup.basic.targetings.targeting_package_id = adgroup.basic.targeting_package_id;
          }

          delete adgroup.basic.convertData;
          delete adgroup.basic.convertList;
          delete adgroup.creative.basic.resultData;
          delete adgroup.basic.industryList;
        });
      });
    });

    this.defaultData.accounts = [...data];

    if (!this.submiting) {
      this.submiting = true;
      this.launchService
        .createUcLaunch(this.defaultData, {
          cid: this.cid,
        })
        .subscribe(
          (results: any) => {
            this.submiting = false;
            if (results.status_code !== 200) {

            } else {
              this.message.success('任务已提交，请到任务记录查看任务结果');
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
}
