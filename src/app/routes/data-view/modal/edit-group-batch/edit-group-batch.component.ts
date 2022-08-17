import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {DataViewAddEditService} from "../../service/data-view-add-edit.service";
import {AuthService} from "../../../../core/service/auth.service";
import {NotifyService} from "../../../../module/notify/notify.service";
import {format, differenceInCalendarDays } from "date-fns";

@Component({
  selector: 'app-edit-group-batch',
  templateUrl: './edit-group-batch.component.html',
  styleUrls: ['./edit-group-batch.component.scss']
})
export class EditGroupBatchComponent implements OnInit, OnChanges {
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
  public iswraing = false;
  public negative_words: any; //否定词
  public exact_negative_words: any; //精确否定词
  public dimensionsData = [];
  public accuState = false ; // 单元分匹配模式出价校验   false：不校验 ， true：提示校验
  public operatingModel = [
    {"label": "ios" , 'value': 1},
    {"label": "Andriod", 'value': 2},
    {"label": "其他平台", 'value': 4}
  ];  //操作系统

  public cronSettingTime:any =  new Date();
  public cronSetting = 'now';
  public matchPriceState = false;
  public batch_editing_unitData = {
    'cron_setting':'now',
    "pub_adgroup_ids": [],
    "max_price": {
      "is_edit": false,
      "value": null
    },
    "negative_words": {
      "is_edit": false,
      "edit_type": 'add', //单元：edit_type  追加:add 替换公共部分:replace_common  替换全部:replace_all 删除:delete
      "value": []
    },
    "exact_negative_words": {
      "is_edit": false,
      "edit_type": 'add', //单元：edit_type  追加:add 替换公共部分:replace_common  替换全部:replace_all 删除:delete
      "value": []
    },
    "match_price_status": {
      "is_edit": false,
      "value": null
    },
    "accu_price_factor": {
      "is_edit": false,
       "value": null
    },
    "word_price_factor": {
      "is_edit": false,
       "value": null
    },
    "wide_price_factor": {
      "is_edit": false,
       "value": null
    },
    "ad_platform_os": {
      "is_edit": false,
      "value": []
    },
    "pause": {
      "is_edit": false,
      "value": false
    },
    "dimensions": {
      "is_edit": false,
      "value": {}
    }
  };


  public tips = {
    max_price: false,
    pc_price_ratio: false,
    wap_price_ratio: false,
    accuState: false,

    accu_price_factor: false,
    word_price_factor: false,
    wide_price_factor: false,

    negative_words: false,
    exact_negative_words: false,

    negativeData_max_length: 500,
    exact_negativeData_max_length: 900,


    length: {
      // negative_words: 0,
      // exact_negative_words: 0
      addValue: 0,
      replaceCommonValue: 0,
      replaceAllValue: 0,
      deleteValue: 0,

      exactAddValue: 0,
      exactReplaceCommonValueValue: 0,
      exactReplaceAllValue: 0,
      exactDeleteValue: 0,
    }

  };

  public negativeData = {
    addValue: '',
    replaceCommonValue: '',
    replaceAllValue: '',
    deleteValue: '',

  };
  public exactNegativeData = {
    addValue: '',
    replaceCommonValue: '',
    replaceAllValue: '',
    deleteValue: '',

  };


  ngOnInit() {
    this._showDimensionList();
  }

  //否定词删除全部逻辑
  deleteAll(data, name, lengthName) {
    data[name] = '';
    this.contentChange(lengthName, data[name]);
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

  edit(data) {
    data.state = true;
  }
  sure(data) {
    data.state = false;
  }
  cancel_dimension(data) {
    data.state = false;
  }


  //将textarea内容转化为数组
  getTextareaArray(textareaString) {
    const textareaArray = [];
    if (textareaString) {
      textareaString.split('\n').forEach((item) => {
        if (item.match(/^\s+$/)) {
        } else if (item !== '') {
          textareaArray.push(item.replace(/(^\s*)|(\s*$)/g, ""));
        }
      });
    }

    return textareaArray;

  }


  checkPage() {
    this.tips.max_price = false;
    this.tips.pc_price_ratio = false;
    this.tips.wap_price_ratio = false;
    this.tips.accuState = false;

    this.tips.accu_price_factor = false;
    this.tips.word_price_factor = false;
    this.tips.wide_price_factor = false;

    this.tips.negative_words = false;
    this.tips.exact_negative_words = false;
    let publishId = null;
    if (this.publisher_model['publisherCount'] === 1) {
      publishId = this.publisher_model['publisher_array'][0]['value'] * 1;
    }

    //单元出价
    if (this.batch_editing_unitData.max_price.is_edit) {
      if (!this.batch_editing_unitData.max_price.value) {
        this.tips.max_price = true;
        this.iswraing = true;
        return false;
      }
      if (this.batch_editing_unitData.max_price.value) {
        //同媒体
        if (this.publisher_model['publisherCount'] === 1) {
          if (publishId === 1 || publishId === 2) {
            if (this.batch_editing_unitData['max_price']['value'] < 0.01) {
              this.tips.max_price = true;
              this.iswraing = true;
              return false;
            }
            if (this.batch_editing_unitData['max_price']['value'] > 999.99) {
              this.tips.max_price = true;
              this.iswraing = true;
              return false;
            }
          }
          if (publishId === 3) {
            if (this.batch_editing_unitData['max_price']['value'] < 0.3) {
              this.tips.max_price = true;
              this.iswraing = true;
              return false;
            }
            if (this.batch_editing_unitData['max_price']['value'] > 999.99) {
              this.tips.max_price = true;
              this.iswraing = true;
              return false;
            }
          }
          if (publishId === 4) {
            if (this.batch_editing_unitData['max_price']['value'] < 0.45) {
              this.tips.max_price = true;
              this.iswraing = true;
              return false;
            }
            if (this.batch_editing_unitData['max_price']['value'] > 999.99) {
              this.tips.max_price = true;
              this.iswraing = true;
              return false;
            }
          }
        }
        //跨媒体
        if (this.publisher_model['publisherCount'] > 1) {
          if (this.batch_editing_unitData['max_price']['value'] < 0.45) {
            this.tips.max_price = true;
            this.iswraing = true;
            return false;
          }
          if (this.batch_editing_unitData['max_price']['value'] > 999.99) {
            this.tips.max_price = true;
            this.iswraing = true;
            return false;
          }
        }
      }
    }

    //移动操作系统
    if (this.batch_editing_unitData.ad_platform_os['is_edit'] && this.publisher_model['publisherCount'] === 1 && publishId === 4) {
      if (!this.batch_editing_unitData.ad_platform_os.value) {
        this.iswraing = true;
        return false;
      } else if (this.batch_editing_unitData.ad_platform_os.value.length === 0) {
        this.iswraing = true;
        return false;
      }
    }
    //分匹配模式出价
    if (this.batch_editing_unitData.match_price_status['is_edit'] && this.matchPriceState) {

      if (!this.batch_editing_unitData.accu_price_factor['value'] || this.batch_editing_unitData.accu_price_factor['value'] < 1 || this.batch_editing_unitData.accu_price_factor['value'] > 10) {
        this.iswraing = true;
        this.tips.accu_price_factor = true;
        return false;
      }
      if (!this.batch_editing_unitData.word_price_factor['value'] || this.batch_editing_unitData.word_price_factor['value'] < 0.1 || this.batch_editing_unitData.word_price_factor['value'] > 1.2) {
        this.iswraing = true;
        this.tips.word_price_factor = true;
        return false;
      }
      if (this.batch_editing_unitData.wide_price_factor['value'] === '' || this.batch_editing_unitData.wide_price_factor['value'] === null || this.batch_editing_unitData.wide_price_factor['value'] < 0 || this.batch_editing_unitData.wide_price_factor['value'] > 1) {
        this.iswraing = true;
        this.tips.wide_price_factor = true;
        return false;
      }
      if (this.batch_editing_unitData.accu_price_factor['value'] < this.batch_editing_unitData.word_price_factor['value'] || this.batch_editing_unitData.accu_price_factor['value'] < this.batch_editing_unitData.wide_price_factor['value']) {
        this.iswraing = true;
        this.tips.accuState = true;
        return false;
      }
      if (this.batch_editing_unitData.word_price_factor['value'] > this.batch_editing_unitData.accu_price_factor['value'] || this.batch_editing_unitData.word_price_factor['value'] < this.batch_editing_unitData.wide_price_factor['value']) {
        this.iswraing = true;
        this.tips.accuState = true;
        return false;
      }
      if (this.batch_editing_unitData.wide_price_factor['value'] > this.batch_editing_unitData.word_price_factor['value'] || this.batch_editing_unitData.word_price_factor['value'] > this.batch_editing_unitData.accu_price_factor['value']) {
        this.iswraing = true;
        this.tips.accuState = true;
        return false;
      }
    }

    //短语否定词
    if (this.batch_editing_unitData.negative_words['edit_type'] === 'add') {
      this.batch_editing_unitData.negative_words.value = this.getTextareaArray(this.negativeData.addValue) ;

    } else if (this.batch_editing_unitData.negative_words['edit_type'] === 'replace_common') {
      this.batch_editing_unitData.negative_words.value = this.getTextareaArray(this.negativeData.replaceCommonValue);

    } else if (this.batch_editing_unitData.negative_words['edit_type'] === 'replace_all') {
      this.batch_editing_unitData.negative_words.value = this.getTextareaArray(this.negativeData.replaceAllValue) ;

    } else if (this.batch_editing_unitData.negative_words['edit_type'] === 'delete') {
      this.batch_editing_unitData.negative_words.value = this.getTextareaArray(this.negativeData.deleteValue) ;

    }

    //精确否定词
    if (this.batch_editing_unitData.exact_negative_words['edit_type'] === 'add') {
      this.batch_editing_unitData.exact_negative_words.value = this.getTextareaArray(this.exactNegativeData.addValue) ;

    } else if (this.batch_editing_unitData.exact_negative_words['edit_type'] === 'replace_common') {
      this.batch_editing_unitData.exact_negative_words.value = this.getTextareaArray(this.exactNegativeData.replaceCommonValue);

    } else if (this.batch_editing_unitData.exact_negative_words['edit_type'] === 'replace_all') {
      this.batch_editing_unitData.exact_negative_words.value = this.getTextareaArray(this.exactNegativeData.replaceAllValue) ;

    } else if (this.batch_editing_unitData.exact_negative_words['edit_type'] === 'delete') {
      this.batch_editing_unitData.exact_negative_words.value = this.getTextareaArray(this.exactNegativeData.deleteValue) ;

    }

    //否定词
    if (this.batch_editing_unitData.negative_words.is_edit) {

      if (this.batch_editing_unitData.negative_words.value.length > this.tips.negativeData_max_length) {
        this.iswraing = true;
        return false;
      }
    }
    //精确否定词
    if (this.batch_editing_unitData.exact_negative_words.is_edit) {
      if (this.batch_editing_unitData.exact_negative_words.value.length > this.tips.exact_negativeData_max_length) {
        this.iswraing = true;
        return false;
      }
    }
  }

  changeInput(name) {
    this.tips[name] = false;
    if (name === 'accu_price_factor' || name === 'word_price_factor' || name === 'wide_price_factor') {
      this.tips['accuState'] = false;
    }
  }
  contentChange(name, value?) {
    this.tips.length[name] = this.getTextareaArray(value).length;
  }

  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {

        if(this.cronSetting != 'now') {
          this.batch_editing_unitData['cron_setting'] = format(this.cronSettingTime, 'yyyy-MM-dd HH:mm:ss');
        } else {
          this.batch_editing_unitData['cron_setting'] = 'now';
        }

        this.batch_editing_unitData.match_price_status.value = this.matchPriceState ?  0 : 1;
        this.batch_editing_unitData['select_type'] = this.parentData.selected_type;
        this.batch_editing_unitData.word_price_factor.is_edit = this.matchPriceState;
        this.batch_editing_unitData.wide_price_factor.is_edit = this.matchPriceState;
        this.batch_editing_unitData.accu_price_factor.is_edit = this.matchPriceState;

        if (this.parentData.selected_type === 'all') {
          this.batch_editing_unitData['sheets_setting'] = {
            'table_setting': this.parentData.allViewTableData
          };
        } else {
          this.batch_editing_unitData.pub_adgroup_ids = this.stringIdArray;
        }

        this.dimensionsData.forEach((item) => { //添加维度参数
          if (item.state === false) {
            item.value ? this.batch_editing_unitData.dimensions.value[item.key] = item.value : this.batch_editing_unitData.dimensions.value[item.key] = '';
          }
        });
        this.editAdgroup(this.batch_editing_unitData , 'batch');

      }


    }

  }

  editAdgroup(data, edit_type) {
    this.is_saving.emit({
      'is_saving': true,
      'isHidden': 'true'
    });
    this._http.editAdgroup(data, edit_type).subscribe(
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
            notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'adgroup' });
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
