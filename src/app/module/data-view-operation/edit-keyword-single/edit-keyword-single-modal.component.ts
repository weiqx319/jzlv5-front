import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {DataViewAddEditService} from "../../../routes/data-view/service/data-view-add-edit.service";
import {AuthService} from "../../../core/service/auth.service";
import {NotifyService} from "../../notify/notify.service";
import {format, differenceInCalendarDays } from "date-fns";

@Component({
  selector: 'app-edit-keyword-single-modal',
  templateUrl: './edit-keyword-single-modal.component.html',
  styleUrls: ['./edit-keyword-single-modal.component.scss']
})
export class EditKeywordSingleModalComponent implements OnInit, OnChanges {

  @Input() stringIdArray: any;
  @Input() publisher_model: any;
  @Input() parentData: any;
  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _http: DataViewAddEditService,
              private message: NzMessageService,
              private  authService: AuthService,
              private notifyService: NotifyService,
              private modalService: NzModalService) {
    this.publisherOption = this._http.getPublisherOption();
  }

  public publisherOption = {};
  public showSingleKeywordData = {};
  public tabItem: number ;
  public dimensionsData = [];
  public iswraing = false;
  public matchTypeData = [] ; //匹配模式数组
  public publishId: any;  //1,百度  2，搜狗 3,360  4，神马
  public tabs = [
    {name: '取消', value : 0 } ,
    {name: '蓝', value : 1 } ,
    {name: '绿', value : 2 } ,
    {name: '黄', value : 3 } ,
    {name: '橙', value : 4 } ,
    {name: '红', value : 5 } ,
  ];
  public cronSettingTime:any =  new Date();
  public cronSetting = 'now';
  public editing_keyword2Data = {
    'cron_setting':'now',
    "pub_keyword_ids": [],
    "pause": {
      "is_edit": false,
      "value": false
    },
    "price": {
      "is_edit": false,
      "modify_type": 1, // 1 修改价格固定值 2 价格基础增加/降低值 3价格基础增加/降低比例
      "action": 1 //1 提高 2 降低
      /* "value": 0*/
    },
    "match_type": {
      "is_edit": false,  //必填
      "value": 1
    },
    "deeplink_url": {
      "is_edit": false,  //必填
      "modify_type": 1, //1 直接修改 2 查找替换
      "search": "",
      "value": ""
    },
    "pc_destination_url": {
      "is_edit": false,
      "modify_type": 1, //1 直接修改 2 查找替换
      "search": "",
      "value": ""
    },
    "wap_destination_url": {
      "is_edit": false, //必填
      "modify_type": 1,
      "search": "",
      "value": ""
    },
    "tabs": {
      "is_edit": false,
      "value": []  //标记 1 2 3 4 5 蓝绿黄橙红 0 取消
    },
    "dimensions": {
      "is_edit": false,
      "value": {
      }
    }
  };
  public tips = {
    price: false,
    wap_destination_url: false, //移动访问url
    pc_destination_url: false, //访问url
    length: {
      wap_destination_url: 0,
      pc_destination_url: 0
    }

  };

  ngOnInit() {
    this._showDimensionList();
    this._getMatchTypeList();
    this._showSingleKeyword();
    this.publishId = this.parentData.selected_data[0].publisher_id * 1;

  }

  _showSingleKeyword() {
    this._http.getSingleKeywordData({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_campaign_id": this.parentData.selected_data[0].pub_campaign_id,
      "pub_adgorup_id": this.parentData.selected_data[0].pub_adgorup_id,
      "pub_keyword_id": this.parentData.selected_data[0].pub_keyword_id
    }).subscribe(
      (result) => {
        if ( result.status_code === 200 ) {
          this.showSingleKeywordData = result.data;
          this.editing_keyword2Data.pause.value =  result.data.pause;
          this.editing_keyword2Data.tabs.value = result.data.tabs;
          if(result.data.tabs !== undefined && result.data.tabs !== null) {
            this.tabItem = result.data.tabs[0];
          } else {
            this.tabItem = 0;
          }

          this.editing_keyword2Data.price['value'] = result.data.price * 1;
          this.editing_keyword2Data.match_type.value = result.data.match_type * 1;
          this.editing_keyword2Data.pc_destination_url.value = result.data.pc_destination_url;
          this.editing_keyword2Data.wap_destination_url.value = result.data.wap_destination_url;
          this.editing_keyword2Data.deeplink_url.value = result.data.deeplink_url;
          this.tips.length['pc_destination_url'] = this._http.chkstrlen(this.editing_keyword2Data.pc_destination_url.value);
          this.tips.length['wap_destination_url'] = this._http.chkstrlen(this.editing_keyword2Data.wap_destination_url.value);

          this._showDimensionSetting(result.data['dimensions']);

        }
      }
    );
  }

  _showDimensionList() {
    this._http.getDimensionsList().subscribe(
      (result) => {
        if ( result.status_code === 200 ) {
          this.dimensionsData = result.data;
          this.dimensionsData.forEach((item) => {
            item.state = false;
          });
        }
      }
    );
  }

  _showDimensionSetting(setting) {
    if (setting) {
      this.dimensionsData.forEach((item) => {
        item['value'] = setting[item['key']];
      });
    }
  }

  _getMatchTypeList() {
    this.matchTypeData = this._http.matchTypes[this.parentData.selected_data[0]['publisher_id'] * 1];
    this.editing_keyword2Data.match_type.value = this.matchTypeData[0]['value'];
  }

  edit(data) {
    data.state = true;
  }

  sure(data) {
    data.state = false;
  }

  cancel_dimension(data) {
    data.state = false;
  }

  checkPage() {
    this.tips.price = false;
    this.tips.wap_destination_url = false;
    this.tips.pc_destination_url = false;
    //关键词出价
    if (this.editing_keyword2Data['price']['is_edit'] && !this.editing_keyword2Data.price['value']) {
      this.tips.price = true;
      this.iswraing = true;
      return false;
    }
    if (this.editing_keyword2Data['price']['is_edit'] && this.editing_keyword2Data.price['value']) {
      if (this.publishId === 1 || this.publishId === 2) {
        if (this.editing_keyword2Data.price['value'] < 0.01) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
        if (this.editing_keyword2Data.price['value'] > 999.99) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
      }
      if (this.publishId === 3) {
        if (this.editing_keyword2Data.price['value'] < 0.3) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
        if (this.editing_keyword2Data.price['value'] > 999.99) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
      }
      if (this.publishId === 4) {
        if (this.editing_keyword2Data.price['value'] < 0.45) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
        if (this.editing_keyword2Data.price['value'] > 999.99) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
      }
    }

    //匹配模式
    if (this.editing_keyword2Data['match_type']['is_edit'] && !this.editing_keyword2Data.match_type.value) {
      this.iswraing = true;
      return false;
    }
    //访问Url
    if (this.editing_keyword2Data.pc_destination_url.value && this.editing_keyword2Data.pc_destination_url.value) {
      if (this._http.chkstrlen(this.editing_keyword2Data.pc_destination_url.value) > 1024) {
        this.tips.pc_destination_url = true;
        this.iswraing = true;
        return false;
      }

    }
    //移动访问Url
    if (this.editing_keyword2Data.wap_destination_url.value && this.editing_keyword2Data.wap_destination_url.value) {
      if (this._http.chkstrlen(this.editing_keyword2Data.wap_destination_url.value) > 1024) {
        this.tips.wap_destination_url = true;
        this.iswraing = true;
        return false;
      }
    }


  }

  changeInput(name) {
    this.tips[name] = false;
  }

  contentChange(value) {
    this.tips.length[value] = this._http.chkstrlen(this.editing_keyword2Data[value].value);
  }

  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {

        if(this.cronSetting != 'now') {
          this.editing_keyword2Data['cron_setting'] = format(this.cronSettingTime, 'yyyy-MM-dd HH:mm:ss');
        } else {
          this.editing_keyword2Data['cron_setting'] = 'now';
        }

        this.is_saving.emit({
          'is_saving': true,
          'isHidden': 'true'
        });
        this.editing_keyword2Data['select_type'] = this.parentData.selected_type;
        this.editing_keyword2Data.pub_keyword_ids = this.stringIdArray;
        this.editing_keyword2Data.tabs.value = [];
        this.editing_keyword2Data.tabs.value.push(this.tabItem);

        this.dimensionsData.forEach((item) => { //添加维度参数
          if (item.state === false) {
            item.value ? this.editing_keyword2Data.dimensions.value[item.key] = item.value : this.editing_keyword2Data.dimensions.value[item.key] = '';
          }
        });
        this.editKeyword(this.editing_keyword2Data, 'single');

      }


    }

  }

  editKeyword(data, edit_type) {
    this._http.editKeyword(data, edit_type).subscribe(
      (result: any) => {
        this.is_saving.emit({
          'is_saving': false,
          'isHidden': 'true'
        });
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();

        if (result.status_code === 200 ) {
          if (result['data']['job_type'] != 'cron') {
            this.message.success("已成功加入任务队列，请稍后查看");
            notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'keyword' });
            this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'false'
            });
          } else {
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'false'
            });
            this.message.success("已成功加入定时任务");
          }



        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      }, err => {
        this.is_saving.emit({
          'is_saving': false,
          'isHidden': 'true'
        });
      }, () => {
      }
    );
  }
  
  disabledDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0;
  }
}
