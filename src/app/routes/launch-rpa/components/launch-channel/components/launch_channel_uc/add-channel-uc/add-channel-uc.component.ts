import {Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { LaunchService } from "../../../../../../../module/launch/service/launch.service";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { deepCopy } from "@jzl/jzl-util";
import { ViewBatchUploadComponent } from "../../../../../../../module/batch-upload/components/view-batch-upload/view-batch-upload.component";
import { isArray } from "@jzl/jzl-util";
import { UploadImageMaterialsComponent } from "../../../../../modal/upload-image-materials/upload-image-materials.component";
import { LaunchMaterialCoverModalComponent } from "../../../../../modal/launch-material-cover-modal/launch-material-cover-modal.component";
import { DatePipe } from "@angular/common";

@Component({
  selector: 'app-add-channel-uc',
  templateUrl: './add-channel-uc.component.html',
  styleUrls: ['./add-channel-uc.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe],
})
export class AddChannelUcComponent implements OnInit {
  @ViewChild('curActionSchemeUrlTextArea') curActionSchemeUrlTextArea: ElementRef;
  @Input() accountsList;
  @Input() isEdit;
  @Input() launchChannelId;
  @Input() isCopy;

  public publisherId = 17;

  public isExternalDisabled = false;
  public isPackageNameEdit = false;
  public urlWordList = ['日期', '自增序号','项目自增序号'];//落地页连接占位符列表
  public cursorPosition = 0;
  public landingTypeList = [
    { key: '000', name: '落地页' },
    { key: '010', name: '安卓' },
    { key: '001', name: 'ios' },
  ];

  public cid;
  public structConfig = {
    track_args: {
      sub: [
        { label: '推广组ID', value: '0', checked: false },
        { label: '推广计划ID', value: '1', checked: false },
        { label: '创意ID', value: '2', checked: false },
      ]
    }
  };

  public structConfigLoading = true;

  public downloadUrlList: any = {};
  public appMap={};

  public conversionTargetList = []; // 转化目标

  public isDownloadUrlChanged = false;
  public isExternalUrlChanged = false;

  public mediaTargetList = [];
  public selectMediaTargetMap = {};
  public copyMediaTargetList = [];

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
    app_name: {
      is_show: false,
      dirty: false,
      tip_text: 'App名不能为空',
    },
    convert_id: {
      is_show: false,
      dirty: false,
      tip_text: '转化目标不能为空',
    },
    target_convert_key: {
      is_show: false,
      dirty: false,
      tip_text: '目标转化不能为空',
    },
    external_url: {
      is_show: false,
      dirty: false,
      tip_text: '落地页链接不能为空',
    },
    scheme_url: {
      is_show: false,
      dirty: false,
      tip_text: '直达链接不能为空',
    },
    // feedback_url: {
    //   is_show: false,
    //   dirty: false,
    //   tip_text: '点击监测链接不能为空',
    // },
    version_name: {
      is_show: false,
      dirty: false,
      tip_text: '版本名称不能为空',
    },
    developer: {
      is_show: false,
      dirty: false,
      tip_text: 'APP开发者不能为空'
    },
    permission: {
      is_show: false,
      dirty: false,
      tip_text: 'App权限链接不能为空'
    },
    privacy: {
      is_show: false,
      dirty: false,
      tip_text: 'App隐私政策链接不能为空'
    },
    update_time: {
      is_show: false,
      dirty: false,
      tip_text: 'App更新时间不能为空'
    },
    app_logo_image_id: {
      is_show: false,
      dirty: false,
      tip_text: '请选择APP头像'
    },
    package_key: {
      is_show: false,
      dirty: false,
      tip_text: '请选择渠道包'
    },
  };



  public defaultData = {
    isHiddenConvert: true,
    chan_pub_id: null,  // 账户
    is_new: '0',  // 账户
    pub_account_id: null,
    pub_account_name: "",
    convert_channel_type: '1',  // 渠道类别  1 转化   2非转化
    convert_channel_name: "",  // 渠道名称
    download_type: 'media',  // 下载方式   EXTERNAL_URL  落地页链接
    download_url_type:'media',
    app_type: '000',   // 下载类型
    download_url: '',  // 下载链接
    package_name: '',  // 应用包名
    app_name: '',  // App名
    external_url: '',  // 落地页链接
    track_args: '000',     //  链接追踪参数
    android_type: 'media',  // 安卓应用详情页类别
    track_url: '',  // 展示监测链接
    site_id: '0',  // 落地页媒体链接
    web_url: "",  // 安卓应用详情页链接
    version_name: '',//版本名称
    developer: '',//APP开发者
    permission: '',//App权限链接
    privacy: '',//App隐私政策链接
    update_time: '',//App更新时间
    scheme_url: '',//直达链接
    exposure_monitor_url:'',
    group_target_url: [],
    package_key:null,
    media_app_icon:'',

    app_logo_image: { //App头像
      app_logo_image_id: '',//  头像id
      imgUrl: "",   //  头像路径
      app_logo: {},
    },
    convert_info_list: {    // 转化信息
      convert_id: null,
      convert_type: null,
      convertList: [],
      convertData: [],
      chainConvertlist: [],
      deep_convert_type: null,
      track_mode: null,
      feedback_url: '',  // 点击监测链接
    },
    android_site_id: '0',
    target_convert_key:null,
    target_convert_name:null,
    convert_chain_id:null,
  };

  constructor(
    private modalSubject: NzModalRef,
    private message: NzMessageService,
    private launchService: LaunchService,
    private authService: AuthService,
    private launchRpaService: LaunchRpaService,
    private modalService: NzModalService,
    private datePipe: DatePipe) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;

  }

  ngOnInit() {
    // this.getDownloadLinkUrl();
    // this.getMediaTargetList();
    if (this.isEdit) {
      this.getLaunchChannelDetail();
    }
  }

  changeConventType(id) {
    this.defaultData.convert_info_list.convert_id = null;
    const convertList = this.defaultData.convert_info_list.convertData.find(item => item.key === id).sub;
    convertList.forEach(item => {
      if (item['convert_type'] != 0 && item['deep_convert_type'] != 0) {
        item['convertName'] = item['convert_type_name'] + '且' + item['deep_convert_type_name'] + ':' + item.label;
      } else if (item['convert_type'] != 0 && item['deep_convert_type'] == 0) {
        item['convertName'] = item['convert_type_name'] + ':' + item.label;
      } else if (item['convert_type'] == 0 && item['deep_convert_type'] != 0) {
        item['convertName'] = item['deep_convert_type_name'] + ':' + item.label;
      } else {
        item['convertName'] = item.label;
      }
      if (item.convert_id == 0) {
        item['convertName'] = item['convert_type_name'];
      }
    });
    this.defaultData.convert_info_list.convertList = deepCopy(convertList);
  }
  changeConventTypeNew(id) {
    this.defaultData.convert_info_list.convert_id = null;
    const convertList = this.defaultData.convert_info_list.convertData.find(item => item.trackMethod === id).convertChainInfoTypes;
    this.defaultData.convert_info_list.convertList = deepCopy(convertList);
  }
  getConversionId($event) {
    const convertList = this.defaultData.convert_info_list.convertList.find(item => item.convert_id === $event);
    this.defaultData.convert_info_list.deep_convert_type = convertList.deep_convert_type;
    this.defaultData.convert_info_list.convert_type = convertList.convert_type;
  }

  // 获取渠道详情
  getLaunchChannelDetail() {
    this.launchRpaService
      .getLaunchChannelDetailByUc(this.launchChannelId, {
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
            this.defaultData.convert_channel_type = data.convert_channel_type;
            this.defaultData.convert_channel_name = data.convert_channel_name;
            this.defaultData.download_type = data.download_type;
            this.defaultData.app_type = data.app_type;
            this.defaultData.download_url = data.download_url;
            this.defaultData.package_name = data.package_name;
            this.defaultData.site_id = data.site_id;
            this.defaultData.external_url = data.external_url;
            this.defaultData.convert_info_list.feedback_url = data.feedback_url;
            this.defaultData.scheme_url = data.scheme_url;
            this.defaultData.exposure_monitor_url=data.exposure_monitor_url;
            this.defaultData.package_key=data.package_key;
            this.defaultData.media_app_icon=data.media_app_icon;
            if (data.group_target_url&&data.group_target_url.length>0) {
              this.defaultData.group_target_url = data.group_target_url;
            } else {
              this.defaultData.group_target_url=[{
                "target_url":data.external_url,"site_id":data.site_id,"use":true
              }];
            }

            //新加
            this.defaultData.version_name = data.version_name;
            this.defaultData.developer = data.developer;
            this.defaultData.permission = data.permission;
            this.defaultData.privacy = data.privacy;
            this.defaultData.update_time = data.update_time;
            this.defaultData.app_logo_image.app_logo_image_id = data.app_logo_image_id;
            this.defaultData.app_logo_image.imgUrl = data.preview_img;
            this.defaultData.app_name = data.app_name ? data.app_name : '';
            this.defaultData.is_new = data.is_new ? data.is_new : '0';
            this.defaultData.target_convert_key =data.target_convert_key||null;
            this.defaultData.target_convert_name =data.target_convert_name||null;
            this.defaultData.convert_chain_id =data.convert_chain_id||null;
            if (data.track_args) {
              const arr = data.track_args.split('');
              this.structConfig.track_args['sub'].forEach(item => {
                if (Number(arr[item.value])) {
                  item.checked = true;
                }
              });
            }
            if (this.defaultData.app_type === '010' || this.defaultData.app_type === '000') {
              if (this.defaultData.group_target_url[0].site_id == '0') {
                this.defaultData.download_type = 'local';
              } else {
                this.defaultData.download_type = 'media';
              }
              if (!this.defaultData.package_key||this.defaultData.package_key==='0') {
                this.defaultData.download_url_type = 'local';
              } else {
                this.defaultData.download_url_type = 'media';
              }
            }
            // this.getDownloadLinkUrl();
            this.getConversionTargetList();
            this.getMediaTargetList();
            this.getMediaDownloadUrlList();
            if (this.defaultData.convert_info_list.convertData) {
              this.defaultData.isHiddenConvert = false;
              this.defaultData.convert_info_list.convert_type = Number(data.convert_type);
              this.defaultData.convert_info_list.track_mode = Number(data.track_mode);
              this.defaultData.convert_info_list.convert_id = Number(data.convert_id);
              this.defaultData.convert_info_list.deep_convert_type = Number(data.deep_convert_type);
            }
            if (this.defaultData.is_new==='1'&&this.defaultData.convert_channel_type === '1') {
              this.getChainConvet();
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
    this.defaultData.group_target_url=[];
    if (this.defaultData.download_url_type==='media') {
      this.changeDownloadType('download');
    }
    this.getMediaTargetList();
    this.getConversionTargetList();
    this.getMediaDownloadUrlList();
    this.checkErrorTip.chan_pub_id.dirty = true;
    this.checkBasicData();
  }

  // 获取媒体落地页
  getMediaTargetList() {
    this.launchRpaService
      .getMediaTargetListByUc({
        page: 1,
        count: 100000,
        cid: this.cid,
        chan_pub_id: this.defaultData.chan_pub_id,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            this.copyMediaTargetList=results['data'];
            this.mediaTargetList = deepCopy(this.copyMediaTargetList);
            if (this.defaultData.group_target_url.length>0) {
              this.mediaTargetList=[];
              this.selectMediaTargetMap= {};
              this.copyMediaTargetList.forEach(item=> {
                if (this.defaultData.group_target_url.find(target=>target.site_id===item.pub_site_id)) {
                  this.selectMediaTargetMap[item.pub_site_id]=item;
                } else {
                  this.mediaTargetList.push(item);
                }
              });
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

  // 获取下载链接
  getDownloadLinkUrl() {
    this.launchService
      .getUcAppTypeUrlList({
        result_model: 'all',
        cid: this.cid,
        publisher_id: this.publisherId
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code !== 200) {
            if (results.status_code !== 205) {
              this.message.error(results.message);
            }
          } else {
            if (this.defaultData.app_type == '001') {
              this.downloadUrlList = results['2'];
            } else if (this.defaultData.app_type == '010') {
              this.downloadUrlList = results['1'];
            } else if (this.defaultData.app_type == '000') {
              this.downloadUrlList = results['3'];
            }
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  changeChannelType(value) {
    // this.defaultData.convert_id = '0';
  }

  changeDownloadType(type) {
    if (type==='download') {
      this.defaultData.download_url = '';
      this.defaultData.package_key=null;
      this.defaultData.media_app_icon='';
      this.defaultData.package_name = '';
      this.defaultData.app_name ='';
      this.isPackageNameEdit=false;
    } else {
      this.defaultData.external_url = '';
      this.defaultData.site_id = '0';
      this.defaultData.group_target_url=[];
      this.defaultData.app_logo_image.app_logo_image_id ='';
      this.defaultData.app_logo_image.imgUrl ='';
    }
  }
  getConversionTargetList() {
    this.defaultData.convert_info_list.convertData=[];
    this.defaultData.convert_info_list.convertList=[];
    if (this.defaultData.is_new==='0') {
      this.getConversionTarget();
    } else {
      if ((this.defaultData.app_type==='000'&&this.defaultData.group_target_url.length)||(this.defaultData.app_type==='010'&&this.defaultData.package_name)||(this.defaultData.app_type==='001'&&this.defaultData.download_url)) {
        this.getConversionTargetNew();
      }
    }
  }

  // 获取转化目标列表
  getConversionTarget() {
    let link;
    let siteId;
    let objective_type;
    if (this.defaultData.app_type === '000'||(this.defaultData.app_type === '010'&&this.defaultData.download_url_type==='media')) {
      if (this.defaultData.group_target_url.length>0) {
        link = this.defaultData.group_target_url[0].target_url;
        siteId = this.defaultData.group_target_url[0].site_id;
      } else {
        link = '';
        siteId = 0;
      }
    } else if ((this.defaultData.app_type === '010'&&this.defaultData.download_url_type==='local') || this.defaultData.app_type === '001') {
      link = this.defaultData.download_url;
      siteId = 0;
    }
    if (this.defaultData.app_type === '000') {
      objective_type = 1;
    } else if (this.defaultData.app_type === '010') {
      objective_type = 4;
    } else if (this.defaultData.app_type === '001') {
      objective_type = 2;
    }
    const body = {
      pub_account_id: this.defaultData.pub_account_id,
      chan_pub_id: this.defaultData.chan_pub_id,
      objective_type: objective_type,
      package_name: this.defaultData.package_name,
      download_url: this.defaultData.download_url,
      url: link,
      site_id: siteId
    };
    this.launchRpaService
      .getConversionTargetListByUc(body)
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.defaultData.convert_info_list.convertData = results['data'];
            this.defaultData.convert_info_list.convertList = this.defaultData.convert_info_list.convertData[0]['sub'];

            this.defaultData.convert_info_list.convertData.forEach(convertInfo => {
              if (convertInfo.sub && isArray(convertInfo.sub)) {
                convertInfo.sub.forEach(item => {
                  if (item['convert_type'] != 0 && item['deep_convert_type'] != 0) {
                    item['convertName'] = item['convert_type_name'] + '且' + item['deep_convert_type_name'] + ':' + item.label;
                  } else if (item['convert_type'] != 0 && item['deep_convert_type'] == 0) {
                    item['convertName'] = item['convert_type_name'] + ':' + item.label;
                  } else if (item['convert_type'] == 0 && item['deep_convert_type'] != 0) {
                    item['convertName'] = item['deep_convert_type_name'] + ':' + item.label;
                  } else {
                    item['convertName'] = item.label;
                  }
                  if (item.convert_id == 0) {
                    item['convertName'] = item['convert_type_name'];
                  }
                });
              }
            });

            if (this.defaultData.convert_info_list.track_mode) {
              const convertList = this.defaultData.convert_info_list.convertData.find(item => item.key === this.defaultData.convert_info_list.track_mode).sub;
              this.defaultData.convert_info_list.convertList = deepCopy(convertList);
            } else {
              this.defaultData.convert_info_list.track_mode = this.defaultData.convert_info_list.convertData[0].key;
              this.defaultData.convert_info_list.convert_id = this.defaultData.convert_info_list.convertData[0]['sub'][0].convert_id;
              this.defaultData.convert_info_list.deep_convert_type = this.defaultData.convert_info_list.convertData[0]['sub'][0].deep_convert_type;
              this.defaultData.convert_info_list.convert_type = this.defaultData.convert_info_list.convertData[0]['sub'][0].convert_type;
            }
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }
  // 获取转化目标列表
  getConversionTargetNew() {
    let link;
    let objective_type;
    if (this.defaultData.app_type === '000'||(this.defaultData.app_type === '010'&&this.defaultData.download_url_type==='media')) {
      if (this.defaultData.group_target_url.length>0) {
        link = this.defaultData.group_target_url[0].target_url;
      } else {
        link = '';
      }
    } else if ((this.defaultData.app_type === '010'&&this.defaultData.download_url_type==='local') || this.defaultData.app_type === '001') {
      link = this.defaultData.download_url;
    }
    if (this.defaultData.app_type === '000') {
      objective_type = 1;
    } else if (this.defaultData.app_type === '010') {
      objective_type = 4;
    } else if (this.defaultData.app_type === '001') {
      objective_type = 2;
    }
    const body = {
      pub_account_id: this.defaultData.pub_account_id,
      chan_pub_id: this.defaultData.chan_pub_id,
      objective_type: objective_type,
    };
    if (this.defaultData.app_type === '000') {
      body['target_url'] = link;
    } else if (this.defaultData.app_type === '010') {
      body['package_name'] = this.defaultData.package_name;
    } else if (this.defaultData.app_type === '001') {
      body['download_url'] = this.defaultData.download_url;
    }
    this.launchRpaService
      .getConversionTargetListNewByUc(body)
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.defaultData.convert_info_list.convertData = results['data']||[];
            if (this.defaultData.convert_info_list.convertData.length) {
              this.defaultData.convert_info_list.convertList = this.defaultData.convert_info_list.convertData[0]['convertChainInfoTypes']||[];

              if (this.defaultData.convert_info_list.track_mode) {
                const convertList = this.defaultData.convert_info_list.convertData.find(item => item.trackMethod === this.defaultData.convert_info_list.track_mode).convertChainInfoTypes;
                this.defaultData.convert_info_list.convertList =convertList?deepCopy(convertList):[];
              } else {
                this.defaultData.convert_info_list.track_mode = this.defaultData.convert_info_list.convertData[0].trackMethod;
                this.defaultData.convert_info_list.convert_id = this.defaultData.convert_info_list.convertData[0]['convertChainInfoTypes'][0].convertId;
                this.getChainConvet();
              }
            }
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }
  getChainConvet() {
    const body = {
      pub_account_id: this.defaultData.pub_account_id,
      chan_pub_id: this.defaultData.chan_pub_id,
      track_method:this.defaultData.convert_info_list.track_mode,
      convert_id:this.defaultData.convert_info_list.convert_id
    };
    this.launchRpaService
      .getChainConvertListByUc(body)
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.defaultData.convert_info_list.chainConvertlist = results['data'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }
  // 检查应用下载链接
  downloadUrlChanged(value) {
    this.isDownloadUrlChanged = true;
    this.checkErrorTip['download_url']['dirty'] = true;
    this.checkBasicData();
  }

  externalUrlBlur() {
    if (this.defaultData.app_type==='000') {
      this.getConversionTargetList();
    }
  }
  urlClick(data, type,urlData?) {
    if (type === 'media') {
      if (this.defaultData.app_type === '000' || this.defaultData.app_type === '010') {
        urlData['site_id'] = data.pub_site_id;
        urlData['target_url'] = data.public_url;
        this.isExternalDisabled = false;
      }
      this.mediaTargetList=[];
      this.selectMediaTargetMap= {};
      this.copyMediaTargetList.forEach(item=> {
        if (this.defaultData.group_target_url.find(target=>target.site_id===item.pub_site_id)) {
          this.selectMediaTargetMap[item.pub_site_id]=item;
        } else {
          this.mediaTargetList.push(item);
        }
      });
    } else if (type === 'download') {
      this.defaultData.download_type='local';
      this.defaultData.group_target_url.unshift({"target_url":data.target_url,"site_id":'0',use:false});
      this.defaultData.package_key=data.package_key;
      this.defaultData.package_name = data.package_name;
      this.defaultData.app_name = data.app_name;
      this.defaultData.media_app_icon=data.app_icon;
      // this.defaultData.version_name=data.package_version;
      // if (this.defaultData.app_type === '001') {
      //   this.defaultData.external_url = this.defaultData.download_url;
      //   this.isExternalDisabled = true;
      // }
    }
    if (this.defaultData.app_type === '000' && (type === 'local' || type === 'media')) {
      this.getConversionTargetList();
    }
  }

  downloadUrlBlur() {
    if (!this.isDownloadUrlChanged) {
      return;
    }
    this.defaultData.package_name = null;

    if (!this.defaultData.download_url) {
      return;
    }
    if (this.defaultData.app_type === '001') {
      this.defaultData.external_url = '';
      this.isExternalDisabled=false;
    }
    const body = {
      app_url_type: null,
      app_url: this.defaultData.download_url,
    };

    if (this.defaultData.app_type === '010') {
      body.app_url_type = 1;
    } else if (this.defaultData.app_type === '001') {
      body.app_url_type = 2;
    }
    this.isPackageNameEdit = false;
    this.launchService
      .checkAppUrl(body, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            if (result['data']['status'] == 0) {
              this.defaultData.package_name = result['data']['app_name'];
              this.defaultData.app_name = result['data']['app_label'];
              if (this.defaultData.app_type === '001') {
                this.defaultData.external_url = this.defaultData.download_url;
                this.isExternalDisabled=true;
              }
            } else {
              this.message.error(result['data']['message']);
              this.isPackageNameEdit = true;
            }
          } else {
            this.isPackageNameEdit = true;
            this.message.error(result.message);
          }
          this.getConversionTargetList();

        },
        (err: any) => {
          this.isPackageNameEdit = true;
          this.getConversionTargetList();
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
    //以http或https开头的正则表达式
    // let regexp: RegExp = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/;
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
    if ((this.defaultData.app_type === '010' || this.defaultData.app_type === '001')&&this.defaultData.download_url_type!=='media' && this.checkErrorTip.download_url.dirty && !this.defaultData.download_url) {
      this.checkErrorTip.download_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.download_url.is_show = false;
    }

    // 应用包名
    if ((this.defaultData.app_type === '010' || this.defaultData.app_type === '001') && !this.defaultData.package_name && this.checkErrorTip.package_name.dirty) {
      this.checkErrorTip.package_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.package_name.is_show = false;
    }
    // App名
    if ((this.defaultData.app_type === '010' || this.defaultData.app_type === '001') && !this.defaultData.app_name && this.checkErrorTip.app_name.dirty) {
      this.checkErrorTip.app_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.app_name.is_show = false;
    }
    // 版本名称
    if ((this.defaultData.app_type === '010') && !this.defaultData.version_name && this.checkErrorTip.version_name.dirty&&this.defaultData.download_url_type!=='media') {
      this.checkErrorTip.version_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.version_name.is_show = false;
    }

    // APP开发者
    if ((this.defaultData.app_type === '010') && !this.defaultData.developer && this.checkErrorTip.developer.dirty&&this.defaultData.download_url_type!=='media') {
      this.checkErrorTip.developer.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.developer.is_show = false;
    }

    // App权限链接
    if ((this.defaultData.app_type === '010') && this.checkErrorTip.permission.dirty&&this.defaultData.download_url_type!=='media') {
      if (!this.defaultData.permission) {
        this.checkErrorTip.permission.is_show = true;
        this.checkErrorTip.permission.tip_text = 'App权限链接不能为空';
        isValid = true;
      } else if (!regexp.test(this.defaultData.permission)) {
        this.checkErrorTip.permission.is_show = true;
        this.checkErrorTip.permission.tip_text = '必须输入url链接';
        isValid = true;
      } else {
        this.checkErrorTip.permission.is_show = false;
      }
    }
    // App隐私政策链接
    if ((this.defaultData.app_type === '010') && this.checkErrorTip.privacy.dirty&&this.defaultData.download_url_type!=='media') {
      if (!this.defaultData.privacy) {
        this.checkErrorTip.privacy.is_show = true;
        this.checkErrorTip.privacy.tip_text = 'App隐私政策链接不能为空';
        isValid = true;
      } else if (!regexp.test(this.defaultData.privacy)) {
        this.checkErrorTip.privacy.is_show = true;
        this.checkErrorTip.privacy.tip_text = '必须输入url链接';
        isValid = true;
      } else {
        this.checkErrorTip.privacy.is_show = false;
      }
    }
    // App更新时间
    if ((this.defaultData.app_type === '010') && !this.defaultData.update_time && this.checkErrorTip.update_time.dirty&&this.defaultData.download_url_type!=='media') {
      this.checkErrorTip.update_time.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.update_time.is_show = false;
    }

    // App更新时间
    if ((this.defaultData.app_type === '010') && !this.defaultData.package_key && this.checkErrorTip.package_key.dirty&&this.defaultData.download_url_type==='media') {
      this.checkErrorTip.package_key.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.package_key.is_show = false;
    }

    //转化目标
    if (this.defaultData.convert_channel_type === '1' && this.defaultData.convert_info_list.convert_id === null && this.checkErrorTip.convert_id.dirty) {
      this.checkErrorTip.convert_id.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.convert_id.is_show = false;
    }
    //目标转化
    if (this.defaultData.convert_channel_type === '1'&&this.defaultData.is_new==='1' && this.defaultData.target_convert_key === null && this.checkErrorTip.target_convert_key.dirty) {
      this.checkErrorTip.target_convert_key.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.target_convert_key.is_show = false;
    }
    let isTargetUrlNull=false;
    let isRepeatTarget=false;
    let isTargetUrl=true;
    this.defaultData.group_target_url.forEach((item,index)=> {
      if (item.target_url.length>0&&this.defaultData.group_target_url.find((url,idx)=>idx!==index&&url.target_url===item.target_url)) {
        isRepeatTarget=true;
      }
      if (item.target_url.length>0) {
        isTargetUrlNull=true;
        if (!/^((ht|f)tps?):\/\/([\w.]+\/?)\S*/.test(item.target_url)) {
          isTargetUrl=false;
        }
      }
    });
    if (isRepeatTarget) {
      this.checkErrorTip.external_url.tip_text='有重复的落地页链接,请修改';
    } else if (!isTargetUrl||(this.defaultData.external_url.length>0&&!regexp.test(this.defaultData.external_url))) {
      this.checkErrorTip.external_url.tip_text='请检查不合法的url链接并修改';
    } else {
      this.checkErrorTip.external_url.tip_text='落地页链接不能为空';
    }

    // 落地页链接
    if ((((!isTargetUrl||isRepeatTarget||!isTargetUrlNull)&&this.defaultData.app_type!=='001')||((!this.defaultData.external_url||!regexp.test(this.defaultData.external_url))&&this.defaultData.app_type==='001')) && this.checkErrorTip.external_url.dirty) {
      this.checkErrorTip.external_url.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.external_url.is_show = false;
    }
    // 点击监测链接
    // if (!this.defaultData.convert_info_list.feedback_url && this.defaultData.convert_channel_type === '1') {
    //   this.checkErrorTip.feedback_url.is_show = true;
    //   isValid = true;
    // } else {
    //   this.checkErrorTip.feedback_url.is_show = false;
    // }
    // if (this.defaultData.scheme_url&&!regexp.test(this.defaultData.scheme_url)) {
    //   this.checkErrorTip.scheme_url.is_show = true;
    //   this.checkErrorTip.scheme_url.tip_text = '必须输入url链接';
    //   isValid = true;
    // } else {
    //   this.checkErrorTip.scheme_url.is_show = false;
    // }
    return isValid;
  }

  // //检查开发者
  // checkDeveloper(value) {
  //   console.log(value);

  // }

  updateSingleChecked(data) {
    let str = '';
    data.forEach(item => {
      if (item.checked) {
        str += '1';
      } else {
        str += '0';
      }
    });
    this.defaultData.track_args = str;
  }

  changeConvert() {
    this.defaultData.isHiddenConvert = false;
    // this.getConversionTargetList();
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
    for (let i=0;i<this.defaultData.group_target_url.length;i++) {
      if (this.defaultData.group_target_url[i].target_url.length<1) {
        this.defaultData.group_target_url.splice(i,1);
        i--;
      }
    }
    if (this.defaultData.convert_channel_type !== '1') {
      this.defaultData.convert_info_list.convert_id = null;
      this.defaultData.convert_info_list.deep_convert_type = null;
      this.defaultData.convert_info_list.convert_type = null;
      this.defaultData.convert_info_list.track_mode = null;
      this.defaultData.target_convert_key = null;
      this.defaultData.target_convert_name = null;
      this.defaultData.convert_chain_id = null;
    }
    if (this.defaultData.is_new==='1'&&this.defaultData.convert_channel_type === '1') {
      const data=this.defaultData.convert_info_list.convertList.find(item=>item.convertId==this.defaultData.convert_info_list.convert_id);
      this.defaultData.convert_chain_id=data['convertChainId'];
    }
    if (this.defaultData.target_convert_key&&this.defaultData.convert_channel_type === '1') {
      const data=this.defaultData.convert_info_list.chainConvertlist.find(item=>item.target_convert_key==this.defaultData.target_convert_key);
      this.defaultData.target_convert_name=data['target_convert_name'];
    }

    const resultData = deepCopy(this.defaultData);
    resultData['app_logo_image_id'] = this.defaultData.app_logo_image.app_logo_image_id;
    // 判断app更新时间是否存在
    if (resultData.update_time) {
      resultData.update_time = this.datePipe.transform(new Date(resultData.update_time), "yyyy-MM-dd");
    }
    if (resultData.app_type === '000') {
      resultData.download_url = "";
      resultData.package_name = "";
      resultData.app_name = "";
    }
    if (this.isEdit) {
      this.launchRpaService.updateChannelByUc(this.launchChannelId, resultData).subscribe(data => {
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
      this.launchRpaService.createChannelByUc(resultData,{is_new:this.defaultData.is_new}).subscribe(data => {
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
    this.isExternalDisabled = false;
    this.getConversionTargetList();
    this.refreshData();
  }
  refreshData() {
    this.defaultData.package_key=null;
    this.defaultData.media_app_icon='';
    this.defaultData.group_target_url=[];
    this.defaultData.download_url = '';
    this.defaultData.external_url = '';
    this.defaultData.package_name = '';
    this.defaultData.app_name = '';
    this.defaultData.isHiddenConvert = true;
    this.defaultData.convert_info_list.convert_id = null;
    this.defaultData.convert_info_list.deep_convert_type = null;
    this.defaultData.convert_info_list.convert_type = null;
    this.defaultData.convert_info_list.track_mode = null;
    this.defaultData.target_convert_key = null;
    this.defaultData.target_convert_name = null;
    this.defaultData.convert_chain_id = null;
  }

  //用户上传APP头像
  uploadAppLogo() {
    const add_modal = this.modalService.create({
      nzTitle: '上传APP头像',
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
  //从图库选择APP头像
  openGallery(data, cssType) {
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
      if (result !== null && typeof result === 'object' && result.result == 'ok') {
        for (const item of Object.keys(result['data'][0])) {
          data[item] = result['data'][0][item];
        }
        this.defaultData.app_logo_image.app_logo_image_id = result['data'][0]['material_id'];
        this.defaultData.app_logo_image.imgUrl = result['data'][0]['preview_img'];
      }
    });
  }

  addTargetUrl() {
    if (this.defaultData.group_target_url.length<5) {
      this.defaultData.group_target_url.push({"target_url":"","site_id":'0',use:true});
    } else {
      this.message.info('最多只能添加五个落地页链接');
    }
  }
  deleteTargetUrl(index) {
    this.defaultData.group_target_url.splice(index,1);
    this.mediaTargetList=[];
    this.selectMediaTargetMap= {};
    this.copyMediaTargetList.forEach(item=> {
      if (this.defaultData.group_target_url.find(target=>target.site_id===item.pub_site_id)) {
        this.selectMediaTargetMap[item.pub_site_id]=item;
      } else {
        this.mediaTargetList.push(item);
      }
    });
  }

    getMediaDownloadUrlList() {
      const resultData = {};
      resultData['package_name'] = this.defaultData.package_name;
      resultData['chan_pub_id'] = this.defaultData.chan_pub_id;

      this.launchRpaService.getMediaDownloadUrlList(resultData).subscribe(data => {
        if (data['status_code'] && data.status_code === 200) {
          this.downloadUrlList = [];
          this.appMap= {};
          if (data['data']&&data['data'].length>0) {
            data['data'].forEach(item=> {
              if (!this.downloadUrlList.find(url=>url.package_name===item.package_name)) {
                this.downloadUrlList.push(item);
              }
              if (!this.appMap[item.package_name]) {
                this.appMap[item.package_name]=[];
                this.appMap[item.package_name].push({package_key:item.package_key,channel_name:item.channel_name});
              } else {
                this.appMap[item.package_name].push({package_key:item.package_key,channel_name:item.channel_name});
              }
            });
          } else {
            this.defaultData.package_key=null;
          }

        } else {
          this.message.error(data.message);
        }
      }, (err) => {

      }, () => {

      });
    }

  // 落地页连接添加占位符
  addTags(value, type) {
    const tagValueLength = value.length + 2;
    let curInput;
    if (type === 'scheme_url') {
      curInput = this.curActionSchemeUrlTextArea.nativeElement;
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


}
