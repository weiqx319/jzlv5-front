import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { LaunchService } from "../../../../../../../module/launch/service/launch.service";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { deepCopy } from "@jzl/jzl-util";

@Component({
  selector: 'app-add-channel-toutiao',
  templateUrl: './add-channel-toutiao.component.html',
  styleUrls: ['./add-channel-toutiao.component.scss'],
})
export class AddChannelToutiaoComponent implements OnInit {
  @Input() accountsList;
  @Input() isEdit;
  @Input() launchChannelId;
  @Input() isCopy;
  @ViewChild('curExternalUrlTextArea') curExternalUrlTextArea: ElementRef;
  @ViewChild('curActionTrackUrlTextArea') curActionTrackUrlTextArea: ElementRef;
  @ViewChild('curTrackUrlTextArea') curTrackUrlTextArea: ElementRef;
  @ViewChild('curOpenUrlTextArea') curOpenUrlTextArea: ElementRef;


  public urlWordList = ['日期', '自增序号'];//落地页连接占位符列表
  public cursorPosition = 0;

  public landingTypeList = [
    { key: 'APP', name: '应用推广' },
    { key: 'LINK', name: '销售线索收集' },
    { key: 'QUICK_APP', name: '快应用' },
    { key: 'SHOP', name: '电商店铺推广' },
  ];

  public cid;
  public structConfig: any = {};

  public structConfigLoading = true;

  public downloadUrlList: any = {};

  public conversionTargetList = []; // 转化目标

  public isDownloadUrlChanged = false;
  public isExternalUrlChanged = false;

  public mediaTargetList = [];
  public eventTargetList = [];
  public tetrisTargetList = [];
  public quickTargetList = [];

  public checkErrorTip = {
    chan_pub_id: {
      is_show: false,
      dirty: false,
      tip_text: '账号不能为空',
    },
    convert_channel_name: {
      is_show: false,
      dirty: false,
      tip_text: '渠道名称不能为空',
    },
    download_url: {
      is_show: false,
      dirty: false,
      tip_text: '下载链接不能为空',
    },
    package_name: {
      is_show: false,
      dirty: false,
      tip_text: '应用包名不能为空',
    },
    convert_id: {
      is_show: false,
      dirty: false,
      tip_text: '转化目标不能为空',
    },
    web_url: {
      is_show: false,
      dirty: false,
      tip_text: '安卓详情页不能为空',
    },
    external_url: {
      is_show: false,
      dirty: false,
      tip_text: '落地页链接不能为空',
    },
    action_track_url: {
      is_show: false,
      dirty: false,
      tip_text: '点击监测链接不能为空',
    },
    open_url: {
      is_show: false,
      dirty: false,
      tip_text: '快应用链接不能为空',
    },
    track_url: {
      is_show: false,
      dirty: false,
      tip_text: '请检查不合法的url链接并修改',
    },
    asset_id: {
      is_show: false,
      dirty: false,
      tip_text: '推广内容不能为空',
    },
    external_action: {
      is_show: false,
      dirty: false,
      tip_text: '优化目标不能为空',
    },
  };

  public external_img = '';
  public select_external_url = '';
  public defaultData = {
    chan_pub_id: null,  // 账户
    pub_account_id: null,
    pub_account_name: "",
    landing_type: 'APP',  // 推广目的
    convert_channel_type: '1',  // 渠道类别  1 转化   2非转化
    convert_channel_name: "",  // 渠道名称
    // 渠道别名
    external_type: 'media',  // 落地页类别
    download_type: 'DOWNLOAD_URL',  // 下载方式   EXTERNAL_URL  落地页链接
    app_type: 'APP_ANDROID',   // 下载类型
    download_url: '',  // 下载链接
    package_name: '',  // 应用包名
    external_url: '',  // 落地页链接
    open_url: '',  // 应用直达链接
    convert_id: null,  // 转化目标
    android_type: 'media',  // 安卓应用详情页类别
    action_track_url: '',  // 点击监测链接
    track_url: '',  // 展示监测链接
    site_id: '0',  // 落地页媒体链接
    web_url: "",  // 安卓应用详情页链接
    android_site_id: '0',
    asset_id: null,   //推广内容id
    asset_name: '',  //推广内容
    external_action: null,  //优化目标
    optimization_name: '', //优化目标名称
    deep_external_action: null,  //优化目标
    deep_optimization_name: '', //优化目标名称
    is_use_market: '1',
    asset_type:'THIRD_EXTERNAL',
  };
  public externalActionList = [];
  public assetList = [];

  constructor(
    private modalSubject: NzModalRef,
    private message: NzMessageService,
    private launchService: LaunchService,
    private authService: AuthService,
    private launchRpaService: LaunchRpaService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.getDownloadLinkUrl();
    if (this.isEdit) {
      this.getLaunchChannelDetail();
    }
  }

  // 获取渠道详情
  getLaunchChannelDetail() {
    this.launchRpaService
      .getLaunchChannelDetail(this.launchChannelId, {
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
            this.defaultData.landing_type = data.landing_type;
            this.defaultData.convert_channel_type = data.convert_channel_type;
            this.defaultData.convert_channel_name = data.convert_channel_name;
            this.defaultData.download_type = data.download_type;
            this.defaultData.app_type = data.app_type;
            this.defaultData.download_url = data.download_url;
            this.defaultData.package_name = data.package_name;
            this.defaultData.site_id = data.site_id;
            this.defaultData.external_url = data.external_url;
            this.defaultData.web_url = data.web_url;
            this.defaultData.open_url = data.open_url;
            this.defaultData.convert_id = Number(data.convert_id);
            this.defaultData.action_track_url = data.action_track_url;
            this.defaultData.track_url = data.track_url;
            this.defaultData.android_site_id = data.android_site_id;
            this.defaultData.asset_id = Number(data.asset_id) || null;
            this.defaultData.asset_name = data.asset_name || '';
            this.defaultData.external_action = data.external_action || null;
            this.defaultData.deep_external_action = data.deep_external_action || null;
            this.defaultData.optimization_name = data.optimization_name || '';
            this.defaultData.is_use_market = data.is_use_market || '1';
            this.defaultData.asset_type = data.asset_type || 'THIRD_EXTERNAL';
            if (this.defaultData.deep_external_action) {
              this.defaultData.external_action=this.defaultData.external_action+'-'+this.defaultData.deep_external_action;
            }

            if (this.defaultData.download_type === 'DOWNLOAD_URL' && this.defaultData.app_type === 'APP_ANDROID') {
              if (this.defaultData.android_site_id === '0') {
                this.defaultData.android_type = 'operate';
              } else {
                this.defaultData.android_type = 'media';
              }
            } else if (this.defaultData.download_type === 'EXTERNAL_URL') {
              if (this.defaultData.site_id !== '0') {
                this.defaultData.external_type = 'media';
              } else {
                this.defaultData.external_type = 'operate';
              }
            }
            this.getConversionTargetList();
            this.getMediaTargetList();
            if (this.defaultData.landing_type==='LINK'||this.defaultData.landing_type==='SHOP') {
              this.getEventManageList();
              if (this.defaultData.asset_type==='TETRIS_EXTERNAL') {
                this.getExternalActionListTet();
              } else {
                this.getExternalActionList();
              }
            } else {
              this.getExternalActionList();
            }
            if (this.defaultData.landing_type==='QUICK_APP') {
              this.getQuickTargetList();
              this.getTetrisTargetList();
            }

            if (this.isCopy) {
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

  changeAccount(id) {
    const data = this.accountsList.find(item => id == item.chan_pub_id);
    if (data) {
      this.defaultData.pub_account_id = data.pub_account_id;
      this.defaultData.pub_account_name = data.pub_account_name;
    }
    this.refreshData();
    this.getMediaTargetList();
    this.getConversionTargetList();
    if (this.defaultData.landing_type==='LINK'||this.defaultData.landing_type==='SHOP') {
      this.getEventManageList();
    }
    if (this.defaultData.landing_type==='QUICK_APP') {
      this.getQuickTargetList();
      this.getTetrisTargetList();
    }
    this.checkErrorTip.chan_pub_id.dirty = true;
    this.checkBasicData();
  }

  refreshData() {
    this.defaultData.external_action = null;
    this.defaultData.optimization_name = '';
    this.defaultData.deep_external_action = null;
    this.defaultData.deep_optimization_name = '';
    this.defaultData.asset_id = '';
    this.defaultData.asset_name = '';
    this.defaultData.site_id = '';
    this.external_img = '';
    this.select_external_url = '';
    this.externalActionList=[];
  }

  // 获取媒体落地页
  getMediaTargetList() {
    this.launchRpaService
      .getMediaTargetList({
        cid: this.cid,
        chan_pub_id: this.defaultData.chan_pub_id,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.mediaTargetList = [];
          } else {
            this.mediaTargetList = results['data'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }
  // 获取媒体落地页
  getEventTargetList() {
    this.launchRpaService
      .getEventTargetList({
        chan_pub_id: this.defaultData.chan_pub_id,
        asset_type:this.defaultData.asset_type,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.eventTargetList = [];
          } else {
            this.eventTargetList = [];
            results['data'].forEach(item => {
              item.site_id = item.site_id + '';
              if (item.site_id == this.defaultData.site_id) {
                this.external_img = item.thumbnail;
                this.select_external_url = item.url;
              }
              this.eventTargetList.push(item);
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
  // 获取媒体落地页
  getTetrisTargetList() {
    this.launchRpaService
      .getTetrisTargetList({
        chan_pub_id: this.defaultData.chan_pub_id,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.tetrisTargetList = [];
          } else {
            this.tetrisTargetList = [];
            results['data'].forEach(item => {
              item.siteId = item.siteId + '';
              if ((this.defaultData.landing_type==='LINK'||this.defaultData.landing_type==='SHOP')&&item.siteId == this.defaultData.site_id) {
                this.external_img = item.thumbnail;
                this.select_external_url = item.external_url;
              }
              if (this.defaultData.landing_type==='QUICK_APP'&&item.siteId == this.defaultData.android_site_id) {
                this.external_img = item.thumbnail;
                this.select_external_url = item.external_url;
              }
              this.tetrisTargetList.push(item);
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
  getQuickTargetList() {
    this.launchRpaService
      .getQuickTargetList({
        chan_pub_id: this.defaultData.chan_pub_id,
        asset_type: this.defaultData.landing_type
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.quickTargetList = [];
          } else {
            this.quickTargetList = [];
            results['data'].forEach(item => {
              item.site_id = item.site_id + '';
              this.quickTargetList.push(item);
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

  // 获取下载链接
  getDownloadLinkUrl() {
    this.launchService
      .getAppTypeUrlList({
        result_model: 'all',
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {

          if (results.status_code && results.status_code !== 200) {
            if (results.status_code !== 205) {
              this.message.error(results.message);
            }
          } else {
            this.downloadUrlList = { ...results };
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  changeChannelType(value) {
    // this.defaultData.convert_id = '0';
  }

  changeExternalType() {
    this.defaultData.external_url = "";
    this.getEventManageList();
    this.refreshData();
  }

  changeAndroidType(value) {
    this.defaultData.android_site_id = '0';
    this.defaultData.web_url = "";
  }

  changeDownloadType() {
    this.getConversionTargetList();
  }

  // 获取转化目标列表
  getConversionTargetList(isEmpty?) {
    // 清空转化目标
    if (isEmpty) {
      this.defaultData.convert_id = null;
      this.conversionTargetList = [];
    }

    if (!this.defaultData.chan_pub_id) {
      return;
    }

    const params = {
      chan_pub_id: this.defaultData.chan_pub_id,
      app_url_type: null,
      app_url: null,
      cid: this.cid,
      landing_type: this.defaultData.landing_type,
    };
    // landing_type  delivery_range
    if (this.defaultData.landing_type === 'APP') {
      if (this.defaultData.download_type === 'DOWNLOAD_URL') {
        if (this.defaultData.app_type === 'APP_ANDROID') {
          params.app_url_type = 1;
          params.app_url = this.defaultData.package_name;
        } else if (this.defaultData.app_type === 'APP_IOS') {
          params.app_url_type = 2;
          params.app_url = this.defaultData.download_url;
        }
      } else if (this.defaultData.download_type === 'EXTERNAL_URL') {
        params.app_url_type = 3;
        params.app_url = this.defaultData.external_url;
      }
    } else if (this.defaultData.landing_type === 'LINK') {
      params.app_url_type = 3;
      params.app_url = this.defaultData.external_url;
    } else if (this.defaultData.landing_type === 'SHOP') {
      params.app_url_type = 4;
      params.app_url = this.defaultData.external_url;
    }

    if (!this.isEdit && (!params.chan_pub_id || !params.app_url_type || !params.app_url)) {
      this.defaultData.convert_id = null;
      this.conversionTargetList = [];
      return;
    }
    if (this.defaultData.landing_type==='SHOP') {
      this.launchService
        .getConversionTargetListNew(params)
        .subscribe(
          (results: any) => {

            if (results.status_code && results.status_code !== 200) {
              this.conversionTargetList = [];
            } else {
              this.conversionTargetList = results['data'];
            }
            if (this.defaultData.download_type && !this.conversionTargetList.find(item => item.id == this.defaultData.convert_id)) {
              this.defaultData.convert_id = null;
            }
          },
          (err: any) => {
            this.message.error('数据获取异常，请重试');
          },
          () => {
          },
        );
    } else {
      this.launchService
        .getConversionTargetList(params)
        .subscribe(
          (results: any) => {

            if (results.status_code && results.status_code !== 200) {
              this.conversionTargetList = [];
            } else {
              this.conversionTargetList = results['data'];
            }
            if (this.defaultData.download_type && !this.conversionTargetList.find(item => item.id == this.defaultData.convert_id)) {
              this.defaultData.convert_id = null;
            }
          },
          (err: any) => {
            this.message.error('数据获取异常，请重试');
          },
          () => {
          },
        );
    }


    this.isDownloadUrlChanged = false;
    this.isExternalUrlChanged = false;
  }

  changeExternal(value, type) {
    const data = this.mediaTargetList.find(item => item.id === value);
    if (type === '1') {
      this.defaultData.external_url = data.site_url;
      this.select_external_url = data.site_url;
      this.getConversionTargetList(true);
      this.checkErrorTip['external_url']['dirty'] = true;
      this.checkBasicData();
    } else {
      this.defaultData.web_url = data.site_url;
      this.checkErrorTip['web_url']['dirty'] = true;
      this.checkBasicData();
    }
  }
  changeEventExternal(value, type) {
    let data;
    if (this.defaultData.asset_type==='TETRIS_EXTERNAL'||this.defaultData.landing_type==='QUICK_APP') {
      data = this.tetrisTargetList.find(item => item.siteId === value);
      this.getExternalActionListTet();
    } else if (this.defaultData.asset_type==='THIRD_EXTERNAL') {
      data = this.eventTargetList.find(item => item.site_id === value);
    }
    if (type === '1') {
      if (this.defaultData.landing_type==='QUICK_APP') {
        this.defaultData.web_url =data.external_url;
        this.external_img = data.thumbnail;
        this.checkErrorTip['web_url']['dirty'] = true;
        this.checkBasicData();
      } else {
        this.defaultData.external_url = data.url||data.external_url;
        this.external_img = data.thumbnail;
        this.select_external_url = data.url||data.external_url;
        this.getConversionTargetList(true);
        this.checkErrorTip['external_url']['dirty'] = true;
        this.checkBasicData();
      }
    }
  }

  // 检查落地页链接
  externalUrlChanged() {
    this.isExternalUrlChanged = true;
  }

  // 检查应用下载链接
  downloadUrlChanged() {
    this.isDownloadUrlChanged = true;
    this.checkErrorTip['download_url']['dirty'] = true;
    this.checkBasicData();
  }

  externalUrlBlur() {
    if (this.defaultData.landing_type!=='SHOP') {
      return;
    }

    this.getConversionTargetList(true);
  }

  downloadUrlBlur() {
    if (!this.isDownloadUrlChanged) {
      return;
    }

    this.defaultData.package_name = null;

    if (!this.defaultData.download_url) {
      return;
    }

    const body = {
      app_url_type: null,
      app_url: this.defaultData.download_url,
    };

    if (this.defaultData.app_type === 'APP_ANDROID') {
      body.app_url_type = 1;
    } else if (this.defaultData.app_type === 'APP_IOS') {
      body.app_url_type = 2;
    }

    this.launchService
      .checkAppUrl(body, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            if (result['data']['status'] == 0) {
              this.defaultData.package_name = result['data']['app_name'];
            } else {
              this.message.error(result['data']['message']);
            }
          } else {
            this.message.error(result.message);
          }
          this.getConversionTargetList(true);

        },
        (err: any) => {
          this.getConversionTargetList(true);
        },
        () => {
        },
      );

    this.isDownloadUrlChanged = false;
  }

  checkBasicData(name?) {
    if (name) {
      this.checkErrorTip[name]['dirty'] = true;
    }
    let isValid = false;
    const regexp: RegExp = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/;
    // 账户
    if (!this.defaultData.chan_pub_id && this.checkErrorTip.chan_pub_id.dirty) {
      this.checkErrorTip.chan_pub_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.chan_pub_id.is_show = false;
    }

    // 渠道名称
    if (!this.defaultData.convert_channel_name && this.checkErrorTip.convert_channel_name.dirty) {
      this.checkErrorTip.convert_channel_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.convert_channel_name.is_show = false;
    }
    // 下载链接
    if (this.defaultData.landing_type === 'APP' && this.defaultData.download_type === 'DOWNLOAD_URL' && this.checkErrorTip.download_url.dirty && !this.defaultData.download_url) {
      this.checkErrorTip.download_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.download_url.is_show = false;
    }

    // 应用包名
    if (this.defaultData.landing_type === 'APP' && this.defaultData.download_type === 'DOWNLOAD_URL' && !this.defaultData.package_name && this.checkErrorTip.package_name.dirty) {
      this.checkErrorTip.package_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.package_name.is_show = false;
    }

    // 转化目标
    if (this.defaultData.convert_channel_type === '1' && this.defaultData.is_use_market === '0' && !this.defaultData.convert_id && this.checkErrorTip.convert_id.dirty) {
      this.checkErrorTip.convert_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.convert_id.is_show = false;
    }

    // 安卓详情页
    if (this.defaultData.landing_type === 'APP' && this.defaultData.download_type === 'DOWNLOAD_URL' && this.defaultData.app_type === 'APP_ANDROID' && !this.defaultData.web_url && this.checkErrorTip.web_url.dirty) {
      this.checkErrorTip.web_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.web_url.is_show = false;
    }

    // 落地页链接
    if (((this.defaultData.landing_type === 'LINK'||this.defaultData.landing_type === 'SHOP') && (!this.defaultData.site_id||this.defaultData.site_id=='0' )&& this.checkErrorTip.external_url.dirty) || (this.defaultData.landing_type === 'APP' && this.defaultData.download_type !== 'DOWNLOAD_URL') && !this.defaultData.external_url && this.checkErrorTip.external_url.dirty) {
      this.checkErrorTip.external_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.external_url.is_show = false;
    }

    if (this.defaultData.is_use_market === '1'&&(this.defaultData.external_type==='THIRD_EXTERNAL'||this.defaultData.landing_type==='QUICK_APP') && !this.defaultData.asset_id && this.checkErrorTip.asset_id.dirty) {
      this.checkErrorTip.asset_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.asset_id.is_show = false;
    }
    if (this.defaultData.is_use_market === '1' && !this.defaultData.external_action && this.checkErrorTip.external_action.dirty) {
      this.checkErrorTip.external_action.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.external_action.is_show = false;
    }
    // 点击监测链接
    if (this.defaultData.landing_type === 'APP' && !this.defaultData.action_track_url && this.checkErrorTip.action_track_url.dirty) {
      this.checkErrorTip.action_track_url.tip_text = '点击监测链接不能为空';
      this.checkErrorTip.action_track_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.action_track_url.is_show = false;
    }
    if (this.defaultData.action_track_url && !regexp.test(this.defaultData.action_track_url)) {
      this.checkErrorTip.action_track_url.tip_text = '请检查不合法的url链接并修改';
      this.checkErrorTip.action_track_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.action_track_url.is_show = false;
    }
    if (this.defaultData.track_url && !regexp.test(this.defaultData.track_url)) {
      this.checkErrorTip.track_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.track_url.is_show = false;
    }
    // 快应用链接
    if (this.defaultData.landing_type === 'QUICK_APP' && !this.defaultData.open_url && this.checkErrorTip.open_url.dirty) {
      this.checkErrorTip.open_url.tip_text = '快应用链接不能为空';
      this.checkErrorTip.open_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.open_url.is_show = false;
    }
    const openReg: RegExp = /^(tbopen|openapp.jdmobile|suning|vipshop|pddopen|mogujie|wireless1688):\/\/([\w-]+(\.[\w-]+)*\/?)+(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?$/;
    // 直达链接
    if (this.defaultData.landing_type === 'SHOP' &&this.defaultData.open_url&& !openReg.test(this.defaultData.open_url) && this.checkErrorTip.open_url.dirty) {
      this.checkErrorTip.open_url.tip_text = '非有效的直达链接地址，请重新输入';
      this.checkErrorTip.open_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.open_url.is_show = false;
    }
    if (this.defaultData.landing_type === 'SHOP'&&this.defaultData.convert_id==50 &&!this.defaultData.open_url && this.checkErrorTip.open_url.dirty) {
      this.checkErrorTip.open_url.tip_text = '转化目标为调起店铺时直达链接必填';
      this.checkErrorTip.open_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.open_url.is_show = false;
    }
    // 安卓详情页
    if (this.defaultData.landing_type === 'QUICK_APP' && !this.defaultData.web_url && this.checkErrorTip.web_url.dirty) {
      this.checkErrorTip.web_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.web_url.is_show = false;
    }

    return isValid;
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
    if (this.defaultData.landing_type==='LINK') {
      if (this.defaultData.asset_type==='THIRD_EXTERNAL') {
        const assetData = this.assetList.find(item => item.asset_id === this.defaultData.asset_id);
        if (assetData) {
          this.defaultData.asset_name = assetData.asset_name;
        }
        const actionData = this.assetList.find(item => item.external_action === this.defaultData.external_action);
        if (actionData) {
          this.defaultData.optimization_name = assetData.optimization_name;
        }
      } else if (this.defaultData.asset_type==='TETRIS_EXTERNAL') {
        let data;
        const arr=this.defaultData.external_action.split('-');
        if (arr.length>1) {
          data=this.externalActionList.find(item=>item.deep_external_action===arr[1]);
        } else {
          data=this.externalActionList.find(item=>item.external_action===this.defaultData.external_action);
        }
        if (data) {
          this.defaultData.asset_id=data.asset_id;
          this.defaultData.asset_name = data.asset_name;
          this.defaultData.optimization_name = data.optimization_name;
          this.defaultData.external_action = data.external_action;
          this.defaultData['deep_optimization_name'] = data.deep_optimization_name;
          this.defaultData['deep_external_action'] = data.deep_external_action;
        }
      }
    }
    if (this.defaultData.landing_type==='QUICK_APP') {
      const assetData = this.quickTargetList.find(item => item.asset_id === this.defaultData.asset_id);
      if (assetData) {
        this.defaultData.asset_name = assetData.asset_name;
      }
      let actionData;
      const arr=this.defaultData.external_action.split('-');
      if (arr.length>1) {
        actionData=this.externalActionList.find(item=>item.deep_external_action===arr[1]);
      } else {
        actionData=this.externalActionList.find(item=>item.external_action===this.defaultData.external_action);
      }
      if (actionData) {
        this.defaultData.optimization_name = actionData.optimization_name;
        this.defaultData.external_action = actionData.external_action;
        this.defaultData['deep_optimization_name'] = actionData.deep_optimization_name;
        this.defaultData['deep_external_action'] = actionData.deep_external_action;
      }
    }

    const resultData = deepCopy(this.defaultData);

    if (resultData.landing_type === 'LINK') {
      resultData.download_url = "";
      resultData.package_name = "";
      resultData.app_type = "";
    }

    if (resultData.landing_type === 'APP') {
      if (resultData.download_type === 'DOWNLOAD_URL') {
        resultData.external_url = "";
        resultData.site_id = '0';
      } else {
        resultData.download_url = "";
        resultData.package_name = "";
      }
    }
    if (this.defaultData.is_use_market === '0') {
      resultData.asset_name = "";
      resultData.optimization_name = "";
      resultData.asset_id = null;
      resultData.external_action = null;
    }

    if (this.isEdit) {
      this.launchRpaService.updateChannel(this.launchChannelId, resultData).subscribe(data => {
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
      this.launchRpaService.createChannel(resultData).subscribe(data => {
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

  changeLandingType() {
    this.defaultData.is_use_market = '0';
    this.defaultData.external_type='operate';
    if (this.defaultData.landing_type==='SHOP') {
      this.defaultData.asset_type='TETRIS_EXTERNAL';
    }
    this.getConversionTargetList();
    if (this.defaultData.landing_type==='LINK'||this.defaultData.landing_type==='QUICK_APP') {
      this.defaultData.is_use_market = '1';
    }
    if ((this.defaultData.landing_type==='LINK'||this.defaultData.landing_type==='SHOP')&&this.defaultData.chan_pub_id) {
      this.getEventManageList();
    }
    if (this.defaultData.landing_type==='QUICK_APP'&&this.defaultData.chan_pub_id) {
      this.getQuickTargetList();
      this.getTetrisTargetList();
    }
  }
  getEventManageList() {
    if (this.defaultData.asset_type==='THIRD_EXTERNAL') {
      this.getEventTargetList();
      this.getAssetList();
    } else if (this.defaultData.asset_type==='TETRIS_EXTERNAL') {
      this.getTetrisTargetList();
    }
  }
  // 获取推广内容
  getAssetList() {
    this.launchRpaService
      .getAssetList({
        chan_pub_id: this.defaultData.chan_pub_id,
        asset_type:this.defaultData.asset_type,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            this.assetList = results['data'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }
  // 获取优化目标
  getExternalActionList() {
    const body= {
      chan_pub_id: this.defaultData.chan_pub_id,
      asset_id: this.defaultData.asset_id
    };
    if (this.defaultData.landing_type==='QUICK_APP') {
      body['asset_type']='QUICK_APP';
      body['package_name']=this.defaultData.package_name;
    }
    this.launchRpaService
      .getExternalActionList(body)
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            results['data'].forEach(item=> {
              let deepAction='',deepActionName='';
              if (item.deep_external_action) {
                deepAction='-'+item.deep_external_action;
                deepActionName='-'+item.deep_optimization_name;
              }
              item['key']=item.external_action+deepAction;
              item['name']=item.optimization_name+deepActionName;
            });
            this.externalActionList = results['data'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }
  getExternalActionListTet() {
    this.launchRpaService
      .getExternalActionList({
        chan_pub_id: this.defaultData.chan_pub_id,
        site_id:this.defaultData.site_id,
        asset_type:this.defaultData.asset_type

      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            results['data'].forEach(item=> {
              let deepAction='',deepActionName='';
              if (item.deep_external_action) {
                deepAction='-'+item.deep_external_action;
                deepActionName='-'+item.deep_optimization_name;
              }
              item['key']=item.external_action+deepAction;
              item['name']=item.optimization_name+deepActionName;
            });
            this.externalActionList = results['data'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }
  changeAssetId() {
    this.checkBasicData('asset_id');
    if (this.defaultData.landing_type==='QUICK_APP') {
      const data=this.quickTargetList.find(item=>item.asset_id===this.defaultData.asset_id);
      if (data) {
        this.defaultData.package_name=data.package_name;
      }
    }
    this.getExternalActionList();
  }

  // 落地页连接添加占位符
  addTags(value, type) {
    const tagValueLength = value.length + 2;
    let curInput;
    if (type === 'external_url') {
      curInput = this.curExternalUrlTextArea.nativeElement;
    } else if (type === 'action_track_url') {
      curInput = this.curActionTrackUrlTextArea.nativeElement;
    } else if (type === 'track_url') {
      curInput = this.curTrackUrlTextArea.nativeElement;
    } else if (type === 'open_url') {
      curInput = this.curOpenUrlTextArea.nativeElement;
    }

    this.cursorPosition = curInput.selectionStart;
    const stringObj = this.launchRpaService.getStringByPosition(curInput.selectionStart, curInput.selectionEnd, curInput.value);

    this.defaultData[type] = stringObj.startStr + '{' + value + '}' + stringObj.endStr;
    curInput.value = this.defaultData[type];

    this.cursorPosition += tagValueLength;
    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核
    } else {
      curInput.select();
      curInput.selectionStart = this.cursorPosition;
      curInput.selectionEnd = this.cursorPosition;
    }
  }
  changeExternalAc(value) {
    this.checkBasicData('external_action');
  }
}
