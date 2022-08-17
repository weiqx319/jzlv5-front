import {Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";
import {deepCopy} from "@jzl/jzl-util";
import {GlobalTemplateComponent} from "../../../../../../../shared/template/global-template/global-template.component";

@Component({
  selector: 'app-add-channel-kuaishou',
  templateUrl: './add-channel-kuaishou.component.html',
  styleUrls: ['./add-channel-kuaishou.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddChannelKuaishouComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, {static: true}) globalTemplate: GlobalTemplateComponent;

  @Input() accountsList;
  @Input() isEdit;
  @Input() launchChannelId;
  @Input() isCopy;

  public cid;
  public is_convert=null;
  public pageData=[];
  public appData=[];
  public convertData=[];

  public defaultData = {
    chan_pub_id: null,
    campaign_type :null,
    app_type:null,
    app_id:null,
    // app_store:[],
    schema_uri:null,
    url_type :null,
    url:null,
    web_uri_type :null,
    // use_app_market:0,
    pub_account_id: "",
    pub_account_name: "",
    convert_channel_number: "",  // 渠道号
    convert_channel_name: "",   // 渠道别名
    convert_id:null,
    convert_type:null,
    click_track_url : ""
  };

  public plan_type = [
    {label: "提升应用安装",value: '2'},
    {label: "获取电商下单",value: '3'},
    {label: "推广品牌活动",value: '4'},
    {label: "收集销售线索",value: '5'},
    {label: "提高应用活跃",value: '7'}
  ];
  public app_type = [
    {label: "Android",value: 'android'},
    {label: "IOS",value: 'ios'}
  ];
  public convert_type = [
    {label: "淘宝短链", value: '1'},
    {label: "唤起手机淘宝",value: '2'},
    {label: "金牛电商",value: '4'}
  ];

  public app_store=[
    {label: "华为", value: 'huawei',checked:true},
    {label: "OPPO",value: 'oppo',checked:true},
    {label: "VIVO",value: 'vivo',checked:true},
    {label: "小米", value: 'xiaomi',checked:true},
    {label: "魅族",value: 'meizu',checked:true},
    {label: "锤子",value: 'smartisan ',checked:true}
  ];

  public checkErrorTip = {
    chan_pub_id: {
      is_show: false,
      dirty: false,
      tip_text: '账号不能为空',
    },
    campaign_type : {
      is_show: false,
      dirty: false,
      tip_text: '计划类型不能为空',
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
    app_id : {
      is_show: false,
      dirty: false,
      tip_text: '应用必选',
    },
    url_type : {
      is_show: false,
      dirty: false,
      tip_text: '转化类型必选',
    },
    web_uri_type : {
      is_show: false,
      dirty: false,
      tip_text: '转化途径必选',
    },
    url: {
      is_show: false,
      dirty: false,
      tip_text: '链接不能为空',
    }
  };

  constructor(private modalSubject: NzModalRef,
              private message: NzMessageService,
              private launchRpaService: LaunchRpaService,
  ) {

  }

  ngOnInit() {
    if (this.isEdit) {
      this.getLaunchChannelDetail();
    }
  }

  changeAccount(id) {
    this.checkErrorTip['chan_pub_id']['dirty'] = true;
    this.checkBasicData();
    const data = this.accountsList.find(item => id == item.chan_pub_id);
    if (data) {
      this.defaultData.pub_account_id = data.pub_account_id;
      this.defaultData.pub_account_name = data.pub_account_name;
    }
    this.getPageListByKs();
    // this.getAppListByKs();
    // this.getConvertListByKs();
  }

  // 获取渠道详情
  getLaunchChannelDetail() {
    this.launchRpaService
      .getLaunchChannelDetailByKs(this.launchChannelId, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            const data = deepCopy(results['data']);
            this.defaultData.app_type = data.app_type;
            this.defaultData.convert_type = data.convert_type;
            this.defaultData.chan_pub_id = data.chan_pub_id;
            this.getPageListByKs();
            this.getAppListByKs();
            this.getConvertListByKs();

            this.defaultData.pub_account_id = data.pub_account_id;
            this.defaultData.pub_account_name = data.pub_account_name;
            this.defaultData.convert_channel_number = data.convert_channel_number;
            this.defaultData.convert_channel_name = data.convert_channel_name;
            this.defaultData.click_track_url  = data.click_track_url ;
            this.defaultData.campaign_type = data.campaign_type;
            // this.defaultData.app_store = data.app_store;
            this.defaultData.schema_uri=data.schema_uri;
            this.defaultData.url_type = data.url_type;
            this.defaultData.web_uri_type = data.web_uri_type;
            // this.defaultData.use_app_market = data.use_app_market;
            this.defaultData.convert_id = Number(data.convert_id);
            this.defaultData.app_id=Number(data.app_id);
            if ( this.defaultData.web_uri_type==2) {
              this.defaultData.url = Number(data.url);
            } else {
              this.defaultData.url = data.url;
            }

            //
            // this.app_store.forEach(item=> {
            //   if (this.defaultData.app_store.indexOf(item.value)>-1) {
            //     item.checked=true;
            //   }
            // });
            if (this.defaultData.convert_type) {
              this.is_convert='1';
            }

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
      this.launchRpaService.updateChannelByKs(this.launchChannelId,resultData).subscribe(data => {
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
      this.launchRpaService.createChannelByKs(resultData).subscribe(data => {
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

    // 计划类型
    if (!this.defaultData.campaign_type  && this.checkErrorTip.campaign_type .dirty) {
      this.checkErrorTip.campaign_type .is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.campaign_type .is_show = false;
    }
    //转化类型
    if (this.defaultData.campaign_type==='3' && !this.defaultData.url_type && this.checkErrorTip.url_type.dirty) {
      this.checkErrorTip.url_type .is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.url_type .is_show = false;
    }
    //转化途径
    if (this.defaultData.campaign_type==='5' && !this.defaultData.web_uri_type  && this.checkErrorTip.web_uri_type.dirty) {
      this.checkErrorTip.web_uri_type.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.web_uri_type.is_show = false;
    }
    //url
    // if ((this.defaultData.campaign_type==='3'||this.defaultData.campaign_type==='4'||this.defaultData.campaign_type==='5') && !this.defaultData.url  && this.checkErrorTip.url.dirty) {
    //   this.checkErrorTip.url.is_show = true;
    //   isValid = true;
    // } else {
    //   this.checkErrorTip.url.is_show = false;
    // }
    //应用
    if (this.defaultData.campaign_type==='2' && !this.defaultData.app_id  && this.checkErrorTip.app_id.dirty) {
      this.checkErrorTip.app_id .is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.app_id .is_show = false;
    }

    return isValid;
  }
  changeTarget(type) {
    // if (type==='use_app_market') {
    //   this.defaultData.use_app_market=this.defaultData.use_app_market===0?1:0;
    // }
    // if (type==='app_store') {
    //   this.defaultData.app_store=[];
    //   this.app_store.forEach(item=> {
    //     if (item.checked) {
    //       this.defaultData.app_store.push(item.value);
    //     }
    //   });
    // }
    if (type==='url_type') {
      this.defaultData.url=null;
      this.checkBasicData('url_type');
    }
    if (type==='app_id') {
      this.checkBasicData('app_id');
      this.getAppListByKs();
    }
    if (type==='web_uri_type') {
      this.defaultData.url=null;
      this.checkBasicData('web_uri_type');
    }
    if (type==='campaign_type') {
      this.defaultData.app_type=null;
      this.defaultData.convert_type=null;
      this.defaultData.url=null;
      this.checkBasicData('campaign_type');
    }
    if (type==='app_type') {
      this.is_convert=null;
      this.defaultData.app_id=null;
      // this.defaultData.app_store=[];
      this.getAppListByKs();
    }
  }

  getPageListByKs() {
    const postBody= {
      "chan_pub_id": 65416,
    };
    postBody['chan_pub_id']=this.defaultData.chan_pub_id;
    this.launchRpaService.getPageListByKs(postBody).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        this.pageData=result['data'];
      } else {
        // this.message.error(result.message);
      }
    }, (err) => {

    }, () => {

    });
  }
  getAppListByKs() {
    const postBody= {
      "chan_pub_id": 65416,
      "app_type": "android"
    };

    postBody['chan_pub_id']=this.defaultData.chan_pub_id;
    postBody['app_type']=this.defaultData.app_type;
    this.launchRpaService.getAppListByKs(postBody).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        this.appData=result['data'];
      } else {
        // this.message.error(result.message);
      }
    }, (err) => {

    }, () => {

    });
  }
  getConvertListByKs() {
    this.defaultData.convert_id=null;
    const postBody= {
      "chan_pub_id": 65416,
      "convert_type": 1
    };

    postBody['chan_pub_id']=this.defaultData.chan_pub_id;
    postBody['convert_type']=Number(this.defaultData.convert_type);
    this.launchRpaService.getConvertListByKs(postBody).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        this.convertData=result['data'];
      } else {
        // this.message.error(result.message);
      }
    }, (err) => {

    }, () => {

    });
  }

}
