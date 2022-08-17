import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {DataViewAddEditService} from "../../../routes/data-view/service/data-view-add-edit.service";
import {EditPriceMessageModalComponent} from "../edit-price-message-modal/edit-price-message-modal.component";
import {AuthService} from "../../../core/service/auth.service";
import {NotifyService} from "../../notify/notify.service";

@Component({
  selector: 'app-editing-price-modal',
  templateUrl: './edit-price-modal.component.html',
  styleUrls: ['./edit-price-modal.component.scss']
})
export class EditPriceModalComponent implements OnInit, OnChanges {

  @Input() publisher_model: any;
  @Input() stringIdArray: any;
  @Input() parentData: any;
  @Input() set is_check(value: any) {
    setTimeout(() => {
      this.submit(value);
    }, 0);

  } //标志是否点击了保存

  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _http: DataViewAddEditService,
              private message: NzMessageService,
              private  authService: AuthService,
              private notifyService: NotifyService,
              private modalService: NzModalService) {
    this.publisherOption = this._http.getPublisherOption();
  }

  public priceArray = [
    {name: '提高', value : 1 } ,
    {name: '降低', value : 2 }
  ];
  public publisherOption = {};
  public showSingleKeywordData = {};
  public iswraing = false;
  public price1: number;
  public price2: number;
  public price3: number;
  public action2 = 1;
  public action3 = 1;
  public editing_keyword2Data = {
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
  public batch_editing_keywordData = {
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
    "pc_destination_url": {
      "is_edit": false,
      "modify_type": 1, //1 直接修改 2 查找替换
      "search": " ",
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
  };

  ngOnInit() {
    if (this.parentData.selected_data.length === 1) {
      this._showSingleKeyword();
    }
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
        if (result.status_code === 200) {
          this.showSingleKeywordData = result.data;
          this.editing_keyword2Data.price['value'] = result.data.price * 1;
        }
      }
    );
  }
  checkPage() {
    this.tips.price = false;
    if (this.parentData.selected_data.length === 1) {
      if (this.summaryType === 'keyword' || this.summaryType === 'optimization_detail_ranking') {
        const publishId = this.parentData.selected_data[0].publisher_id * 1;
        //关键词出价
        this.editing_keyword2Data['price']['is_edit'] = true;

        //关键词出价
        if (this.editing_keyword2Data['price']['is_edit'] && !this.editing_keyword2Data.price['value']) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
        if (this.editing_keyword2Data['price']['is_edit'] && this.editing_keyword2Data.price['value']) {
          if (publishId === 1 || publishId === 2) {
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
          if (publishId === 3) {
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
          if (publishId === 4) {
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
      }
    } else {
      if (this.summaryType === 'keyword' || this.summaryType === 'optimization_detail_ranking') {
        this.batch_editing_keywordData['price']['is_edit'] = true;
        //出价
        if (this.batch_editing_keywordData['price']['is_edit']) {
          if (this.batch_editing_keywordData.price.modify_type === 1) {
            if (!this.price1) {
              this.tips.price = true;
              this.iswraing = true;
              return false;
            } else {
              //同媒体
              if (this.publisher_model['publisherCount'] === 1) {
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
              //跨媒体
              if (this.publisher_model['publisherCount'] > 1) {
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
      }
    }
  }
  changeInput(name) {
    this.tips[name] = false;
  }

  submit(value) {
    if (value) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {
        let edit_type = '';
        let keyData = {};
        let action: any;
        if (this.parentData.selected_data.length === 1) {
          edit_type = 'single';
          keyData = this.editing_keyword2Data.price['value'];
        } else {
          if ( this.batch_editing_keywordData.price.modify_type === 1 ) {
            this.batch_editing_keywordData.price.value = this.price1;
          } else if ( this.batch_editing_keywordData.price.modify_type === 2 ) {
            this.batch_editing_keywordData.price.value = this.price2;
            this.batch_editing_keywordData.price.action = this.action2;
            action = this.action2;
          } else if ( this.batch_editing_keywordData.price.modify_type === 3 ) {
            this.batch_editing_keywordData.price.value = this.price3;
            this.batch_editing_keywordData.price.action = this.action3;
            action = this.action3;
          }
          edit_type = 'batch';
          keyData = this.batch_editing_keywordData.price.value;
        }
        const editData = {
          'edit_type': edit_type,
          'data': {
            'modify_type': this.batch_editing_keywordData.price.modify_type,
            'action': action,
            'value': keyData
          }
        };

        const message_modal = this.modalService.create({
          nzTitle: edit_type === 'single' ? '单个编辑出价' : '批量编辑出价',
          nzWidth: 400,
          nzContent: EditPriceMessageModalComponent,
          nzClosable: false,
          nzMaskClosable: false,
          nzWrapClassName: 'edit-price-message',
          nzFooter: null,
          nzComponentParams: {
            editData: editData
          }
        });
        message_modal.afterClose.subscribe(data => {
          if (data === 'onOk') {
            if (this.summaryType === 'keyword' || this.summaryType === 'optimization_detail_ranking') {
              if (this.parentData.selected_data.length === 1) {
                this.editing_keyword2Data['select_type'] = this.parentData.selected_type;
                this.editing_keyword2Data.pub_keyword_ids = this.stringIdArray;
                this.editKeyword(this.editing_keyword2Data, 'single');
              }
              if (this.parentData.selected_data.length > 1) {
                this.batch_editing_keywordData['select_type'] = this.parentData.selected_type;
                if (this.parentData.selected_type === 'all') {
                  this.batch_editing_keywordData['sheets_setting'] = {
                    'table_setting': this.parentData.allViewTableData
                  };
                } else {
                  this.batch_editing_keywordData.pub_keyword_ids = this.stringIdArray;
                }

                this.editKeyword(this.batch_editing_keywordData, 'batch');
              }
            }


          }
        });
      }
    }
  }

  ngOnChanges() {

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

          this.message.success("已成功加入任务队列，请稍后查看");
          notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'keyword' });
          this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});

          this.is_saving.emit({
            'is_saving': false,
            'isHidden': 'false'
          });
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
}
