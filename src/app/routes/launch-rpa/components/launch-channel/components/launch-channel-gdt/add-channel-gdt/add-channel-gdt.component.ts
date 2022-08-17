import {Component, Input, OnInit, ViewChild} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
// import {LaunchService} from "../../../../../../../module/launch/service/launch.service";
// import {AuthService} from "../../../../../../../core/service/auth.service";
// import {LaunchRpaService} from "../../../../../service/launch-rpa.service";
import {deepCopy} from "@jzl/jzl-util";
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";
import {GlobalTemplateComponent} from "../../../../../../../shared/template/global-template/global-template.component";

@Component({
  selector: 'app-add-channel-toutiao',
  templateUrl: './add-channel-gdt.component.html',
  styleUrls: ['./add-channel-gdt.component.scss']
})
export class AddChannelGdtComponent implements OnInit {
  @ViewChild(GlobalTemplateComponent, {static: true}) globalTemplate: GlobalTemplateComponent;

  @Input() accountsList;
  @Input() isEdit;
  @Input() launchChannelId;
  @Input() isCopy;

  public cid;

  public defaultData = {
    chan_pub_id: "",
    pub_account_id: "",
    pub_account_name: "",
    convert_channel_number: "",  // 渠道号
    convert_channel_name: "",   // 渠道别名
    promoted_object_type: "",   // 推广目标
    deep_link_url: "",   // 直达链接
    page_type: "",  // 落地页类型
    page_url: "",   // 落地页链接
    page_id: null,  // 落地页id
    page_name: "", // 落地页名称
    promoted_object_id: "",  // 推广目标id
    app_android_channel_package_id: "",   // 安卓渠道包
    user_action_sets: [],   // 转化归因
    universal_link_url: "",  // 通用链接
    mini_program_id: "",   // 小程序原始ID
    mini_program_path: "",  // 小程序链接
    simple_native_page: {
      simple_canvas_sub_type: "",
      share_content_spec: {
        share_title: "",
        share_description: ""
      },
      webview_url: "",
    }
  };

  public objectTypeList = [
    {key: 'PROMOTED_OBJECT_TYPE_APP_ANDROID', name: '应用推广-Android'},
    {key: 'PROMOTED_OBJECT_TYPE_APP_IOS', name: '应用推广-IOS'},
    {key: 'PROMOTED_OBJECT_TYPE_ECOMMERCE', name: '商品推广'},
    {key: 'PROMOTED_OBJECT_TYPE_LEAD_AD', name: '销售线索收集'},
    {key: 'PROMOTED_OBJECT_TYPE_LINK_WECHAT', name: '品牌活动推广'},
  ];

  public objectIdList = [];

  public xijingList = [];

  public pageTypeMap = {};

  public androidList = [];

  public userActionSetsList = [];

  public checkErrorTip = {
    chan_pub_id: {
      is_show: false,
      dirty: false,
      tip_text: '账号不能为空',
    },
    convert_channel_name: {
      is_show: false,
      dirty: false,
      tip_text: '渠道别名不能为空',
    },
    convert_channel_number: {
      is_show: false,
      dirty: false,
      tip_text: '渠道号不能为空',
    },
    promoted_object_type: {
      is_show: false,
      dirty: false,
      tip_text: '推广目标不能为空',
    },
    page_url: {
      is_show: false,
      dirty: false,
      tip_text: '落地页不能为空',
    },
    page_id: {
      is_show: false,
      dirty: false,
      tip_text: '原生推广页不能为空',
    },
    mini_program_id: {
      is_show: false,
      dirty: false,
      tip_text: '小程序ID不能为空',
    },
    mini_program_path: {
      is_show: false,
      dirty: false,
      tip_text: '小程序链接不能为空',
    },
    webview_url: {
      is_show: false,
      dirty: false,
      tip_text: '嵌入链接不能为空',
    },
    share_title: {
      is_show: false,
      dirty: false,
      tip_text: '分享标题不能为空',
    },
    share_description: {
      is_show: false,
      dirty: false,
      tip_text: '分享描述不能为空',
    },
    // deep_link_url: {
    //   is_show: false,
    //   dirty: false,
    //   tip_text: '直达链接不能为空',
    // },
    promoted_object_id: {
      is_show: false,
      dirty: false,
      tip_text: '推广目标id',
    }
  };

  public wechatPageList = [];

  constructor(private modalSubject: NzModalRef,
              private message: NzMessageService,
              private launchRpaService: LaunchRpaService,
) {

  }

  ngOnInit() {
    this.getFeedConfigLandingPageEqq();
    if (this.isEdit) {
      this.getLaunchChannelDetail();
    }
  }

  getWechatPagesList(status?) {
    const params = {
      chan_pub_id: this.defaultData.chan_pub_id
    };
    if(this.defaultData.page_type === 'PAGE_TYPE_MINI_PROGRAM_CANVAS_WECHAT') {
      params['page_type'] = this.defaultData.page_type;
    }

    this.launchRpaService.getWechatPagesList(params).subscribe((results: any) => {
      if (results.status_code === 200) {
        this.wechatPageList = deepCopy(results['data']);
        if(status !== 'clear') {
          this.defaultData.page_id = null;
          this.defaultData.page_url = "";
        }
      }}, (err: any) => {
        this.message.error('数据获取异常，请重试');
      }, () => {

      },
    );
  }

  getPageXijingList() {
    this.launchRpaService.getPageXijingList({
        promoted_object_type: this.defaultData.promoted_object_type,
        chan_pub_id: this.defaultData.chan_pub_id,
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
          } else {
            this.xijingList = deepCopy(results['data']);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  changeAccount(id) {
    this.checkErrorTip['chan_pub_id']['dirty'] = true;
    this.checkBasicData();
    const data = this.accountsList.find(item => id == item.chan_pub_id);
    if (data) {
      this.defaultData.pub_account_id = data.pub_account_id;
      this.defaultData.pub_account_name = data.pub_account_name;
    }
    this.getPageXijingList();
    this.getAndroidPackage();
    this.getObjectIdList('clear');
    this.getUserActionSetsList();
    this.getWechatPagesList();
  }

  changePageType(value) {
    this.defaultData.page_url = "";
    if(value === 'PAGE_TYPE_TSA') {
      this.getPageXijingList();
    }
    if(value === 'PAGE_TYPE_MOMENTS_SIMPLE_NATIVE_WECHAT') {
      this.defaultData.simple_native_page.simple_canvas_sub_type = 'SIMPLE_CANVAS_SUB_TYPE_DEFAULT';
    }

    if(value === 'PAGE_TYPE_CANVAS_WECHAT' || value === 'PAGE_TYPE_MINI_PROGRAM_CANVAS_WECHAT') {
      this.getWechatPagesList();
    }
    this.checkBasicData();
  }

  changeObjectType(value) {
    this.checkErrorTip['promoted_object_type']['dirty'] = true;
    this.defaultData.page_type = this.pageTypeMap[value][0]['key'];
    this.defaultData.page_url = "";
    this.defaultData.page_id = "";
    if(value !== 'PROMOTED_OBJECT_TYPE_APP_ANDROID' && value !== 'PROMOTED_OBJECT_TYPE_APP_IOS') {
      this.defaultData.promoted_object_id = "";
      this.defaultData.app_android_channel_package_id = "";
      this.defaultData.user_action_sets = [];
      this.defaultData.universal_link_url = "";
    }
    this.checkBasicData();
    this.getPageXijingList();
    this.getObjectIdList('clear');
  }

  // 获取渠道详情
  getLaunchChannelDetail() {
    this.launchRpaService
      .getChannelDetailByGdt(this.launchChannelId, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            const data = deepCopy(results['data']);
            this.defaultData.chan_pub_id = data.chan_pub_id;
            this.defaultData.pub_account_id = data.pub_account_id;
            this.defaultData.pub_account_name = data.pub_account_name;
            this.defaultData.convert_channel_number = data.convert_channel_number;
            this.defaultData.convert_channel_name = data.convert_channel_name;
            this.defaultData.promoted_object_type = data.promoted_object_type;
            this.defaultData.deep_link_url = data.deep_link_url;
            this.defaultData.page_type = data.page_type;
            this.defaultData.page_url = data.page_url;
            this.defaultData.page_id = data.page_url;
            if(this.defaultData.page_type === 'PAGE_TYPE_CANVAS_WECHAT') {
              this.defaultData.page_id = Number(data.page_url);
            }
            this.defaultData.promoted_object_id = data.promoted_object_id;
            this.defaultData.app_android_channel_package_id = data.app_android_channel_package_id;
            this.defaultData.user_action_sets = data.user_action_sets;
            this.defaultData.universal_link_url = data.universal_link_url;
            this.defaultData.mini_program_id = data.mini_program_id;
            this.defaultData.mini_program_path = data.mini_program_path;
            this.defaultData.simple_native_page = data.simple_native_page;

            if(Object.keys(data.simple_native_page).length === 0) {
              this.defaultData.simple_native_page = {
                simple_canvas_sub_type: "",
                share_content_spec: {
                  share_title: "",
                  share_description: ""
                },
                webview_url: "",
              };
            }

            this.getObjectIdList();
            this.getAndroidPackage();
            this.getPageXijingList();
            this.getWechatPagesList('clear');
            this.getUserActionSetsList();
            if(this.isCopy) {
              this.isEdit = false;
              this.defaultData.convert_channel_name = data.convert_channel_name + '-复制';
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

  // 安卓渠道包
  getAndroidPackage() {
    this.launchRpaService
      .getAndroidPackage({
        chan_pub_id: this.defaultData.chan_pub_id,
        promoted_object_id: this.defaultData.promoted_object_id
      }, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            this.androidList = deepCopy(results['data']);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 推广目标ID
  getObjectIdList(status?) {
    if(status === 'clear') { this.defaultData.promoted_object_id = ""; }
    this.launchRpaService
      .getObjectIdList({
        chan_pub_id: this.defaultData.chan_pub_id,
        promoted_object_type: this.defaultData.promoted_object_type
      }, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.objectIdList = [];
          } else {
            this.objectIdList = deepCopy(results['data']);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 转化归因
  getUserActionSetsList() {
    let type = [];
    if(this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_LINK' || this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_ECOMMERCE' || this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_LEAD_AD' || this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_LINK_WECHAT') {
      type = ["WEB", "IOS", "ANDROID"];
    } else if(this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_APP_IOS') {
      type = ["IOS"];
    } else if(this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_APP_ANDROID') {
      type = ["ANDROID"];
    }
    this.launchRpaService
      .getUserActionSetsList({
        chan_pub_id: this.defaultData.chan_pub_id,
        type: type
      }, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            this.userActionSetsList = deepCopy(results['data']);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  changeObjectId() {
    this.checkErrorTip['promoted_object_id']['dirty'] = true;
    this.checkBasicData();
    this.getAndroidPackage();
  }

  changePageId(value) {
    let data;
    this.checkErrorTip['page_url']['dirty'] = true;
    if(this.defaultData.page_type === 'PAGE_TYPE_CANVAS_WECHAT') {
      data = this.wechatPageList.find(item => item.page_id === value);
    } else {
      data = this.xijingList.find(item => item.page_id === value);
    }
    if(data) {
      this.defaultData.page_url = data.page_id;
      this.defaultData.page_name = data.page_name;
    }
    this.checkBasicData();
  }

  getFeedConfigLandingPageEqq() {
    this.launchRpaService.getFeedConfigLandingPageEqq().subscribe(results => {
      if (results['status_code'] && results.status_code === 200) {
        this.pageTypeMap = results['data'];
      } else {
        this.message.error(results.message);
      }
    }, (err) => {

    }, () => {

    });
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    for (const item of Object.keys(this.checkErrorTip)) {
      this.checkErrorTip[item]['dirty'] = true;
    }
    const isValid = this.checkBasicData();

    if (isValid) {
      this.message.error('请完善参数信息！');
      return;
    }
    const resultData = deepCopy(this.defaultData);

    if (this.isEdit) {
      this.launchRpaService.updateChannelByGdt(this.launchChannelId,resultData).subscribe(data => {
        if (data['status_code'] && data.status_code === 200) {
          this.message.success(data.message);
          this.modalSubject.destroy('onOk');
        } else {
          this.message.error(data.message);
        }
      }, (err) => {

      }, () => {

      });
    } else {
      this.launchRpaService.createChannelByGdt(resultData).subscribe(data => {
        if (data['status_code'] && data.status_code === 200) {
          this.message.success(data.message);
          this.modalSubject.destroy('onOk');
        } else {
          this.message.error(data.message);
        }
      }, (err) => {

      }, () => {

      });
    }
  }

  checkBasicData(name?) {
    if(name) {
      this.checkErrorTip[name]['dirty'] = true;
    }
    let isValid = false;
    // 账户
    if (!this.defaultData.chan_pub_id && this.checkErrorTip.chan_pub_id.dirty) {
      this.checkErrorTip.chan_pub_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.chan_pub_id.is_show = false;
    }

    // 渠道别名
    if (!this.defaultData.convert_channel_name && this.checkErrorTip.convert_channel_name.dirty) {
      this.checkErrorTip.convert_channel_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.convert_channel_name.is_show = false;
    }

    // 渠道号
    if (!this.defaultData.convert_channel_number && this.checkErrorTip.convert_channel_number.dirty) {
      this.checkErrorTip.convert_channel_number.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.convert_channel_number.is_show = false;
    }

    // 渠道号
    if (!this.defaultData.promoted_object_type && this.checkErrorTip.promoted_object_type.dirty) {
      this.checkErrorTip.promoted_object_type.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.promoted_object_type.is_show = false;
    }

    // 落地页
    if(this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_LINK_WECHAT') {
      if(this.defaultData.page_type === 'PAGE_TYPE_DEFAULT' || this.defaultData.page_type === 'PAGE_TYPE_TSA_WEB_NONE_ECOMMERCE') {
        if (!this.defaultData.page_url && this.checkErrorTip.page_url.dirty) {
          this.checkErrorTip.page_url.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.page_url.is_show = false;
        }
      }

      if(this.defaultData.page_type === 'PAGE_TYPE_CANVAS_WECHAT' || this.defaultData.page_type === 'PAGE_TYPE_MINI_PROGRAM_CANVAS_WECHAT') {
        if (!this.defaultData.page_id && this.checkErrorTip.page_id.dirty) {
          this.checkErrorTip.page_id.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.page_id.is_show = false;
        }
      }

      if(this.defaultData.page_type === 'PAGE_TYPE_MINI_PROGRAM_WECHAT') {
        if (!this.defaultData.mini_program_id && this.checkErrorTip.mini_program_id.dirty) {
          this.checkErrorTip.mini_program_id.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.mini_program_id.is_show = false;
        }

        if (!this.defaultData.mini_program_path && this.checkErrorTip.mini_program_path.dirty) {
          this.checkErrorTip.mini_program_path.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.mini_program_path.is_show = false;
        }
      }

      if(this.defaultData.page_type === 'PAGE_TYPE_MOMENTS_SIMPLE_NATIVE_WECHAT') {
        if(this.defaultData.simple_native_page.simple_canvas_sub_type !== 'SIMPLE_CANVAS_SUB_TYPE_DEFAULT') {
          if (!this.defaultData.simple_native_page.webview_url && this.checkErrorTip.webview_url.dirty) {
            this.checkErrorTip.webview_url.is_show = true;
            isValid = true;
          } else {
            this.checkErrorTip.webview_url.is_show = false;
          }
        }

        if (!this.defaultData.simple_native_page.share_content_spec.share_title && this.checkErrorTip.share_title.dirty) {
          this.checkErrorTip.share_title.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.share_title.is_show = false;
        }

        if (!this.defaultData.simple_native_page.share_content_spec.share_description && this.checkErrorTip.share_description.dirty) {
          this.checkErrorTip.share_description.is_show = true;
          isValid = true;
        } else {
          this.checkErrorTip.share_description.is_show = false;
        }
      }

    } else if(this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_LINK' || this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_ECOMMERCE' || this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_LEAD_AD') {
      if (!this.defaultData.page_url && this.checkErrorTip.page_url.dirty) {
        this.checkErrorTip.page_url.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.page_url.is_show = false;
      }
    }
    if(this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_APP_ANDROID' || this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_APP_IOS') {
      if(this.defaultData.page_type !== 'PAGE_TYPE_DEFAULT' && !this.defaultData.page_url && this.checkErrorTip.page_url.dirty) {
        this.checkErrorTip.page_url.is_show = true;
        isValid = true;
      } else {
        this.checkErrorTip.page_url.is_show = false;
      }
    }

    // 直达链接
    // if (!this.defaultData.deep_link_url && this.checkErrorTip.deep_link_url.dirty) {
    //   this.checkErrorTip.deep_link_url.is_show = true;
    //   isValid = true;
    // } else {
    //   this.checkErrorTip.deep_link_url.is_show = false;
    // }

    // 推广目标id
    if ((this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_APP_ANDROID' || this.defaultData.promoted_object_type === 'PROMOTED_OBJECT_TYPE_APP_IOS') && !this.defaultData.promoted_object_id && this.checkErrorTip.promoted_object_id.dirty) {
      this.checkErrorTip.promoted_object_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.promoted_object_id.is_show = false;
    }

    return isValid;
  }


}
