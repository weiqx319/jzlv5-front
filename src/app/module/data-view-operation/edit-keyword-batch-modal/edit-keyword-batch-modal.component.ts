import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {DataViewAddEditService} from "../../../routes/data-view/service/data-view-add-edit.service";
import {AuthService} from "../../../core/service/auth.service";
import {NotifyService} from "../../notify/notify.service";
import {format, differenceInCalendarDays } from "date-fns";

@Component({
  selector: 'app-edit-keyword-batch-modal',
  templateUrl: './edit-keyword-batch-modal.component.html',
  styleUrls: ['./edit-keyword-batch-modal.component.scss']
})
export class EditKeywordBatchModalComponent implements OnInit, OnChanges {

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
  public price1: number;
  public price2: number;
  public price3: number;
  public action2 = 1;
  public action3 = 1;
  public batchPcUrlModifyValue  = '';
  public batchPcUrlSearch = '';
  public batchPcUrlSearchValue = '';

  public batchDeepLinkUrlSearch = '';
  public batchDeepLinkUrlSearchValue = '';
  public batchDeepLinkUrlModifyValue = '';



  public batchMobileUrlModifyValue  = '';
  public batchMobileUrlSearch = '';
  public batchMobileUrlSearchValue = '';
  public batchTabItem: number ;
  public matchTypeData = [] ; //匹配模式数组
  public dimensionsData = [];
  public iswraing = false;
  public priceArray = [
    {name: '提高', value : 1 } ,
    {name: '降低', value : 2 }
  ];
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
  public batch_editing_keywordData = {
    'cron_setting':'now',
    "pub_keyword_ids": [],
    "pause": {
      "is_edit": false,
      "value": false
    },
    "price": {
      "is_edit": false,
      "modify_type": 1, // 1 修改价格固定值 2 价格基础增加/降低值 3价格基础增加/降低比例
      "action": 1,  //1 提高 2 降低
      "value": 0
    },
    "match_type": {
      "is_edit": false,
      "value": 0
    },
    "deeplink_url": {
      "is_edit": false,  //必填
      "modify_type": 1, //1 直接修改 2 查找替换
      "search": "",
      "value":"",
    },
    "pc_destination_url": {
      "is_edit": false,
      "modify_type": 1, //1 直接修改 2 查找替换
      "search": "",
      "value": ""
    },
    "wap_destination_url": {
      "is_edit": false,
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
      pc_destination_url: 0,
      batchPcUrlModifyValue: 0,
      batchMobileUrlModifyValue: 0
    }
  };
  public has_shanma = false;

  ngOnInit() {
    this._getMatchTypeList();
    this._showDimensionList();
    //判断是否有神马媒体
    this.publisher_model['publisher_array'].forEach(item => {
      if (item['value'] * 1 === 4) {
        this.has_shanma = true;
      }
    });
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

  _getMatchTypeList() {
    this.matchTypeData = this._http.matchTypes[this.parentData.selected_data[0]['publisher_id'] * 1];
    this.batch_editing_keywordData.match_type.value = this.matchTypeData[0]['value'];
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
    if (this.batch_editing_keywordData.deeplink_url.modify_type === 1) {
      this.batch_editing_keywordData.deeplink_url.value = this.batchDeepLinkUrlModifyValue;
    } else if (this.batch_editing_keywordData.deeplink_url.modify_type === 2) {
      this.batch_editing_keywordData.deeplink_url.value = this.batchDeepLinkUrlSearchValue;
      this.batch_editing_keywordData.deeplink_url.search = this.batchDeepLinkUrlSearch;
    }

    if (this.batch_editing_keywordData.pc_destination_url.modify_type === 1) {
      this.batch_editing_keywordData.pc_destination_url.value = this.batchPcUrlModifyValue;
    } else if (this.batch_editing_keywordData.pc_destination_url.modify_type === 2) {
      this.batch_editing_keywordData.pc_destination_url.value = this.batchPcUrlSearchValue;
      this.batch_editing_keywordData.pc_destination_url.search = this.batchPcUrlSearch;
    }
    if (this.batch_editing_keywordData.wap_destination_url.modify_type === 1) {
      this.batch_editing_keywordData.wap_destination_url.value = this.batchMobileUrlModifyValue;
    } else if (this.batch_editing_keywordData.wap_destination_url.modify_type === 2) {
      this.batch_editing_keywordData.wap_destination_url.value = this.batchMobileUrlSearchValue;
      this.batch_editing_keywordData.wap_destination_url.search = this.batchMobileUrlSearch;
    }

    if ( this.batch_editing_keywordData.price.modify_type === 1 ) {
      this.batch_editing_keywordData.price.value = this.price1;
    } else if ( this.batch_editing_keywordData.price.modify_type === 2 ) {
      this.batch_editing_keywordData.price.value = this.price2;
      this.batch_editing_keywordData.price.action = this.action2;
    } else if ( this.batch_editing_keywordData.price.modify_type === 3 ) {
      this.batch_editing_keywordData.price.value = this.price3;
      this.batch_editing_keywordData.price.action = this.action3;
    }
    this.tips.price = false;
    //出价(同媒体)
    if (this.publisher_model['publisherCount'] === 1 && this.batch_editing_keywordData['price']['is_edit']) {
      if (this.batch_editing_keywordData.price.modify_type === 1) {
        if (!this.price1) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        } else {
          if (this.publisher_model['publisher_array'][0]['value'] === 1 || this.publisher_model['publisher_array'][0]['value'] === 2) {
            if (this.price1 < 0.01) {
              this.tips.price = true;
              this.iswraing = true;
              return false;
            }
            if (this.price1 > 999.99) {
              this.tips.price = true;
              this.iswraing = true;
              return false;
            }
          }

          if (this.publisher_model['publisher_array'][0]['value'] === 3) {
            if (this.price1 < 0.3) {
              this.tips.price = true;
              this.iswraing = true;
              return false;
            }
            if (this.price1 > 999.99) {
              this.tips.price = true;
              this.iswraing = true;
              return false;
            }
          }

          if (this.publisher_model['publisher_array'][0]['value'] === 4) {
            if (this.price1 < 0.45) {
              this.tips.price = true;
              this.iswraing = true;
              return false;
            }
            if (this.price1 > 999.99) {
              this.tips.price = true;
              this.iswraing = true;
              return false;
            }
          }
        }
      }
      if (this.batch_editing_keywordData.price.modify_type === 2) {
        if (!this.price2) {
          this.iswraing = true;
          return false;
        }
      }
      if (this.batch_editing_keywordData.price.modify_type === 3) {
        if (!this.price3) {
          this.iswraing = true;
          return false;
        }
      }
    }
    //出价(跨媒体)
    if (this.publisher_model['publisherCount'] > 1 && this.batch_editing_keywordData['price']['is_edit']) {
      if (this.batch_editing_keywordData.price.modify_type === 1) {
        if (!this.price1) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        } else {
          if (this.price1 < 0.45) {
            this.tips.price = true;
            this.iswraing = true;
            return false;
          }
          if (this.price1 > 999.99) {
            this.tips.price = true;
            this.iswraing = true;
            return false;
          }
        }
      }
      if (this.batch_editing_keywordData.price.modify_type === 2) {
        if (!this.price2) {
          this.iswraing = true;
          return false;
        }
      }
      if (this.batch_editing_keywordData.price.modify_type === 3) {
        if (!this.price3) {
          this.iswraing = true;
          return false;
        }
      }
    }

    //匹配模式
    if (this.batch_editing_keywordData['match_type']['is_edit'] && !this.batch_editing_keywordData.match_type.value) {
      this.iswraing = true;
      return false;
    }

    //访问Url
    if (this.batch_editing_keywordData['pc_destination_url']['is_edit'] && this.batch_editing_keywordData['pc_destination_url']['value']) {
      if (this.batch_editing_keywordData.pc_destination_url.modify_type === 1 && this._http.chkstrlen(this.batch_editing_keywordData.pc_destination_url.value) > 1024) {
        this.tips.pc_destination_url = true;
        this.iswraing = true;
        return false;
      }
    }

    //移动访问Url
    if (this.batch_editing_keywordData.wap_destination_url.value && this.batch_editing_keywordData.wap_destination_url.value) {
      if (this.batch_editing_keywordData.wap_destination_url.modify_type === 1 && this._http.chkstrlen(this.batch_editing_keywordData.wap_destination_url.value) > 1024) {
        this.tips.wap_destination_url = true;
        this.iswraing = true;
        return false;
      }
    }
  }


  changeInput(name) {
    this.tips[name] = false;
  }

  contentChange(value, name?) {
    if (name) {
      this.tips.length[name] = this._http.chkstrlen(value);
    }
  }

  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {

        if(this.cronSetting != 'now') {
          this.batch_editing_keywordData['cron_setting'] = format(this.cronSettingTime, 'yyyy-MM-dd HH:mm:ss');
        } else {
          this.batch_editing_keywordData['cron_setting'] = 'now';
        }

        this.batch_editing_keywordData['select_type'] = this.parentData.selected_type;
        if (this.parentData.selected_type === 'all') {
          this.batch_editing_keywordData['sheets_setting'] = {
            'table_setting': this.parentData.allViewTableData
          };
        } else {
          this.batch_editing_keywordData.pub_keyword_ids = this.stringIdArray;
        }
        this.batch_editing_keywordData.tabs.value.push(this.batchTabItem);

        this.dimensionsData.forEach((item) => { //添加维度参数
          if (item.state === false) {
            item.value ? this.batch_editing_keywordData.dimensions.value[item.key] = item.value : this.batch_editing_keywordData.dimensions.value[item.key] = '';
          }
        });
        this.editKeyword(this.batch_editing_keywordData, 'batch');
      }


    }

  }

  editKeyword(data, edit_type) {
    this.is_saving.emit({
      'is_saving': true,
      'isHidden': 'true'
    });
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
