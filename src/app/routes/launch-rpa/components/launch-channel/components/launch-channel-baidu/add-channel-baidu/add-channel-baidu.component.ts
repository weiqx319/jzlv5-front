import {Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";
import {deepCopy} from "@jzl/jzl-util";
import {LaunchService} from "../../../../../../../module/launch/service/launch.service";
import {AuthService} from "../../../../../../../core/service/auth.service";
import {DatePipe} from "@angular/common";
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-add-channel-baidu',
  templateUrl: './add-channel-baidu.component.html',
  styleUrls: ['./add-channel-baidu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers:[DatePipe]
})
export class AddChannelBaiduComponent implements OnInit {
  @Input() accountsList;
  @Input() isEdit;
  @Input() launchChannelId;
  @Input() isCopy;

  public landingTypeList = [
    {key: '1', name: '网站链接'},
    {key: '2', name: '应用下载（IOS）'},
    {key: '3', name: '应用下载（Android）'},
  ];

  public cid;
  public structConfig: any = {};

  public structConfigLoading = true;

  public downloadUrlList: any = [];

  public conversionTargetList = {}; // 转化目标
  public conversionNameList = []; // 转化名称
  public deepConversionTargetList={};

  public isDownloadUrlChanged = false;
  public isExternalUrlChanged = false;

  public mediaTargetList = [];

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
    app_url: {
      is_show: false,
      dirty: false,
      tip_text: '下载链接不能为空',
    },
    apk_name: {
      is_show: false,
      dirty: false,
      tip_text: '应用包名不能为空',
    },
    trans_types: {
      is_show: false,
      dirty: false,
      tip_text: '转化类型不能为空',
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
    online_url: {
      is_show: false,
      dirty: false,
      tip_text: '落地页链接不能为空',
    },
    deep_trans_types: {
      is_show: false,
      dirty: false,
      tip_text: '请选择深度转化目标'
    },  // 深度转化目标
  };


  public defaultData = {
    chan_pub_id: null,  // 账户
    pub_account_id: null,
    pub_account_name: "",
    landing_type: '1',  // 推广目的
    convert_channel_type: '1',  // 渠道类别  1 转化   2非转化
    convert_channel_name: "",  // 渠道名称
    // 渠道别名
    external_type: 'media',  // 落地页类别
    trans_form:'2',
    app_url: '',  // 下载链接
    app_id: null,  // 下载链接
    app_name: null,  // 下载链接
    apk_name: '',  // 应用包名
    online_url: '',  // 落地页链接
    convert_id: null,  // 转化目标
    monitor_url: '',  // 点击监测链接
    exposure_url: '',  // 展示监测链接
    page_id: null,  // 落地页媒体链接
    deep_trans_types_name:null,
    deep_trans_types:null,//深度目标转化
    trans_types:null,
    // optimize_deep_trans:false,
  };
  transFormList=[
    {key:'1',name:'应用API'},
    {key:'2',name:'基木鱼营销页'},
    {key:'4',name:'API激活'},
    {key:'5',name:'网页JS布码'},
    {key:'7',name:'线索API'},
    {key:'8',name:'咨询工具授权'},
    {key:'13',name:'应用SDK'},
  ];

  constructor(private modalSubject: NzModalRef,
              private message: NzMessageService,
              private launchService: LaunchService,
              private authService: AuthService,
              private launchRpaService: LaunchRpaService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    // this.getDownloadLinkUrl();
    if (this.isEdit) {
      this.getLaunchChannelDetail();
    }
  }

  // 获取渠道详情
  getLaunchChannelDetail() {
    this.launchRpaService
      .getLaunchChannelDetailByBd(this.launchChannelId, {
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
            this.defaultData.app_url = data.app_url;
            this.defaultData.app_id = data.app_id;
            this.defaultData.apk_name = data.apk_name;
            this.defaultData.app_name=data.app_name;
            this.defaultData.page_id = Number(data.page_id);
            this.defaultData.online_url = data.online_url;
            this.defaultData.trans_types = data.trans_types;
            this.defaultData.monitor_url = data.monitor_url;
            this.defaultData.exposure_url = data.exposure_url;
            this.defaultData.convert_id=Number(data.convert_id);
            this.defaultData.deep_trans_types = data.deep_trans_types;
            this.defaultData.trans_form=this.defaultData.landing_type==='1'?'2':'1';

            if (this.defaultData.landing_type === '1') {
              if (this.defaultData.page_id) {
                this.defaultData.external_type = 'media';
              } else {
                this.defaultData.external_type = 'operate';
              }
            } else if (this.defaultData.landing_type === '3') {
              if (this.defaultData.app_id) {
                this.defaultData.external_type = 'media';
              } else {
                this.defaultData.external_type = 'operate';
              }
            }
            this.getMediaTargetList();
            this.getConversionNameList();
            this.getAppList();

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

  changeAccount(id) {
    const data = this.accountsList.find(item => id == item.chan_pub_id);
    if (data) {
      this.defaultData.pub_account_id = data.pub_account_id;
      this.defaultData.pub_account_name = data.pub_account_name;
    }
    this.getMediaTargetList();
    this.getConversionNameList();
    this.getAppList();
    this.checkErrorTip.chan_pub_id.dirty = true;
    this.checkBasicData();
  }

  // 获取媒体落地页
  getMediaTargetList() {
    this.launchRpaService
      .getMediaTargetListByBd({
        cid: this.cid,
        chan_pub_id: this.defaultData.chan_pub_id,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

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

  // 获取下载链接
  getDownloadLinkUrl() {
    this.launchRpaService
      .getAppTypeUrlListByBd({
        result_model: 'all',
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {

          if (results.status_code && results.status_code !== 200) {
            if (results.status_code !== 205) {
            }
          } else {
            this.downloadUrlList = [...results.data];
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
    this.defaultData.convert_id = null;
    this.defaultData.trans_types=null;
    this.defaultData.deep_trans_types=null;
    // this.defaultData.optimize_deep_trans=false;
  }

  changeExternalType() {
    this.defaultData.page_id =null;
    this.defaultData.online_url = "";
    this.defaultData.app_name=null;
    this.defaultData.app_url='';
    this.defaultData.apk_name='';
    this.defaultData.app_id=null;
  }

  changeDownloadType() {

  }
  changeTransFromType(value) {

  }
  // 获取转化名称列表
  getConversionNameList(isEmpty?) {
    if (!this.defaultData.chan_pub_id) {
      return;
    }

    const params = {
      chan_pub_id: this.defaultData.chan_pub_id,
    };

    this.launchRpaService
      .getConversionNameByBd(params)
      .subscribe(
        (results: any) => {

          if (results.status_code && results.status_code !== 200) {
            this.conversionNameList = [];
          } else {
            this.conversionNameList = results['data'];
            if (this.defaultData.convert_id) {
              const data = this.conversionNameList.find(item => item.app_trans_id === this.defaultData.convert_id);
              this.conversionTargetList=data.trans_types;
              this.deepConversionTargetList=data.deep_trans_types?data.deep_trans_types:{};
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

  changeExternal(value, type) {
    const data = this.mediaTargetList.find(item => item.page_id === value);
    if (type === '1') {
      this.defaultData.online_url = data.online_url;
      this.checkErrorTip['online_url']['dirty'] = true;
      this.checkBasicData();
    }
  }
  // 检查应用下载链接
  downloadUrlChanged(value,type?) {
    if (type==='1') {
      const data = this.downloadUrlList.find(item => item.app_id === value);
      this.defaultData.app_url = data.app_url;
      this.defaultData.app_name=data.app_name;
      this.defaultData.apk_name=data.apk_name;
    }
    this.isDownloadUrlChanged = true;
    this.checkErrorTip['app_url']['dirty'] = true;
    this.checkBasicData();
  }
  changeConvertName(value) {
    this.defaultData.trans_types=null;
    this.defaultData.deep_trans_types=null;
    const data = this.conversionNameList.find(item => item.app_trans_id === value);
    this.conversionTargetList=data.trans_types;
    this.deepConversionTargetList=data.deep_trans_types?data.deep_trans_types:{};
    this.checkBasicData('convert_id');
  }

  externalUrlBlur() {
    if (!this.isExternalUrlChanged) {
      return;
    }
  }

  downloadUrlBlur() {
    if (this.defaultData.landing_type==='2') {
      return;
    }
    if (!this.isDownloadUrlChanged) {
      return;
    }

    this.defaultData.apk_name = null;

    if (!this.defaultData.app_url) {
      return;
    }

    const body = {
      app_url_type: null,
      app_url: this.defaultData.app_url,
    };

    if (this.defaultData.landing_type === '3') {
      body.app_url_type = 1;
    } else if (this.defaultData.landing_type === '2') {
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
              this.defaultData.apk_name = result['data']['app_name'];
              this.defaultData.app_name=this.defaultData.apk_name;
            } else {
              this.message.error(result['data']['message']);
            }
          } else {
            this.message.error(result.message);
          }

        },
        (err: any) => {

        },
        () => {
        },
      );

    this.isDownloadUrlChanged = false;
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

    // 渠道名称
    if (!this.defaultData.convert_channel_name && this.checkErrorTip.convert_channel_name.dirty) {
      this.checkErrorTip.convert_channel_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.convert_channel_name.is_show = false;
    }
    // 下载链接
    if (this.defaultData.landing_type !== '1'&& this.checkErrorTip.app_url.dirty && !this.defaultData.app_url) {
      this.checkErrorTip.app_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.app_url.is_show = false;
    }

    // 应用包名
    if (this.defaultData.landing_type !== '1'&& !this.defaultData.apk_name && this.checkErrorTip.apk_name.dirty) {
      this.checkErrorTip.apk_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.apk_name.is_show = false;
    }

    // 转化目标
    if (this.defaultData.convert_channel_type === '1' && !this.defaultData.convert_id && this.checkErrorTip.convert_id.dirty) {
      this.checkErrorTip.convert_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.convert_id.is_show = false;
    }

    // 转化目标
    if (this.defaultData.convert_channel_type === '1' && !this.defaultData.trans_types && this.checkErrorTip.trans_types.dirty) {
      this.checkErrorTip.trans_types.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.trans_types.is_show = false;
    }
    // 落地页链接
    if (this.defaultData.landing_type === '1' && !this.defaultData.online_url && this.checkErrorTip.online_url.dirty) {
      this.checkErrorTip.online_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.online_url.is_show = false;
    }
    // if (this.isEmpty(this.deepConversionTargetList)&&!this.defaultData.deep_trans_types&&this.checkErrorTip.deep_trans_types.dirty) {
    //   this.checkErrorTip.deep_trans_types.is_show = true;
    //   isValid = true;
    // } else {
    //   this.checkErrorTip.deep_trans_types.is_show = false;
    // }

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

    const resultData = deepCopy(this.defaultData);

    if(resultData.landing_type === '1') {
      resultData.app_url = "";
      resultData.apk_name = "";
    } else {
        resultData.online_url = "";
        resultData.page_id = null;
    }

    if (this.isEdit) {
      this.launchRpaService.updateChannelByBd(this.launchChannelId,resultData).subscribe(data => {
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
      this.launchRpaService.createChannelByBd(resultData).subscribe(data => {
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
    this.defaultData.trans_form=this.defaultData.landing_type==='1'?'2':'1';
    this.changeExternalType();
  }
  getAppList() {
    this.launchRpaService.getAppListByBd({chan_pub_id:this.defaultData.chan_pub_id},{company_id:this.authService.getCurrentUser().company_id
    }).subscribe(results => {
      if (results.status_code !== 200) {

      } else {
        this.downloadUrlList = [...results.data];
      }
    });
  }
  isEmpty(item) {
    return Object.keys(item).length>0;
  }

  apkNameIpt() {
    this.defaultData.app_name=this.defaultData.apk_name;
    this.checkBasicData('apk_name');
  }

}
