import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {DataViewAddEditService} from "../../service/data-view-add-edit.service";
import {AuthService} from "../../../../core/service/auth.service";
import {NotifyService} from "../../../../module/notify/notify.service";
import {format, differenceInCalendarDays } from "date-fns";

@Component({
  selector: 'app-edit-campaign-batch',
  templateUrl: './edit-campaign-batch.component.html',
  styleUrls: ['./edit-campaign-batch.component.scss']
})
export class EditCampaignBatchComponent implements OnInit, OnChanges {

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
  public budgetRadio = 1; //1：每日 2：不限定
  public budget: any; //每日预算值
  public negative_words: any; //否定词
  public exact_negative_words: any; //精确否定词
  public dimensionsData = [];
  public iswraing = false;

  public cronSettingTime:any =  new Date();
  public cronSetting = 'now';
  public campaign_edit_settingData = {
    'cron_setting':'now',
    "pub_campaign_ids": [],
    "pub_campaign_name": {
      "is_edit": false,
      "value": ""
    },
    "budget": {
      "is_edit": false,
      "value": null
    },
    "show_prob": {
      "is_edit": false,
      "value": 1  //1.优选 2轮显
    },
    "bid_prefer": {
      "is_edit": false,
      "value": 1
    },
    "negative_words": {
      "is_edit": false,
      "edit_type": 'add', //计划: edit_type  追加:add 删除公共部分:delete_common  替换全部:replace_all 删除:delete
      "value": []
    },
    "exact_negative_words": {
      "is_edit": false,
      "edit_type": 'add', //计划: edit_type  追加:add 删除公共部分:delete_common  替换全部:replace_all 删除:delete
      "value": []
    },
    "wap_price_ratio": {
      "is_edit": false,
      "value": 1
    },
    "pc_price_ratio": {
      "is_edit": false,
      "value": 1
    },
    "region_target": {// 九枝兰的地域编码，填写空数组"[]"使用账户推广地域
      "is_edit": false,
      "value": []
    },
    "schedule": {//选填, 填写空数组"[]"：取消暂停时段，更新为全时段推广
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
    budget: false,
    pc_price_ratio: false,
    wap_price_ratio: false,
    negative_words: false,
    exact_negative_words: false,

    negativeData_max_length: 500,
    exact_negativeData_max_length: 900,

    length: {
      addValue: 0,
      replaceAllValue: 0,
      deleteValue: 0,
      exactAddValue: 0,
      exactReplaceAllValue: 0,
      exactDeleteValue: 0,

    }
  };

  public negativeData = {
    addValue: '',
    deleteCommonValue: [],
    replaceAllValue: '',
    deleteValue: '',

  };
  public exactNegativeData = {
    addValue: '',
    deleteCommonValue: [],
    replaceAllValue: '',
    deleteValue: '',

  };

  public list = {};

  ngOnInit() {
    this.getNegativePublic();
    this._showDimensionList();
  }

  //否定词删除全部逻辑
  deleteAll(data, name, lengthName) {
    data[name] = '';
    this.contentChange(lengthName, data[name]);
  }

  changeNegativeWords(ret: {}): void {
    // console.log('nzChange', ret);
    if (ret['from'] === 'left') { //从左到右
      ret['list'].forEach(item => {
        this.negativeData.deleteCommonValue.push(item.title);
      });
    } else if (ret['from'] === 'right') { //从右到左
      const newValue = [];
      this.negativeData.deleteCommonValue.forEach(item => {
        const comparItem = ret['list'].find((opt, index) => {
          return opt.title === item;
        });
        if (!comparItem) {
          newValue.push(item);
        }
      });
      this.negativeData.deleteCommonValue = newValue;
    }



  }

  changeExactNegativeWords(ret: {}): void {
    // console.log('nzChange', ret);
    if (ret['from'] === 'left') { //从左到右
      ret['list'].forEach(item => {
        this.exactNegativeData.deleteCommonValue.push(item.title);
      });
    } else if (ret['from'] === 'right') { //从右到左
      const newValue = [];
      this.exactNegativeData.deleteCommonValue.forEach(item => {
        const comparItem = ret['list'].find((opt, index) => {
          return opt.title === item;
        });
        if (!comparItem) {
          newValue.push(item);
        }
      });
      this.exactNegativeData.deleteCommonValue = newValue;
    }



  }

  getNegativePublic() {
    const body = {
      select_type: this.parentData.selected_type,
    };
    if (this.parentData.selected_type === 'all') {
      body['sheets_setting'] = {
        'table_setting': this.parentData.allViewTableData
      };
    } else {
      body['pub_campaign_ids'] = this.stringIdArray;
    }


    this._http.getNegativePublicCampaign(body).subscribe(result => {
      if ( result.status_code === 200 ) {
        const negativeWords = [];
        const exactNegativeWords = [];
        for (let i = 0; i < result.data.negativeWords.length; i++) {
          negativeWords.push({
            key        : i.toString(),
            title      : result.data.negativeWords[i]
          });
        }
        for (let i = 0; i < result.data.exactNegativeWords.length; i++) {
          exactNegativeWords.push({
            key        : i.toString(),
            title      : result.data.exactNegativeWords[i]
          });
        }
        this.list['negativeWords'] = negativeWords;
        this.list['exactNegativeWords'] = exactNegativeWords;
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
    //非跨媒体
    if (this.parentData.selected_data.length > 1) {
      //日预算
      if (this.campaign_edit_settingData['budget']['is_edit']) {
        if (this.budgetRadio === 1) {

          this.campaign_edit_settingData['budget']['value'] = this.budget;
          if (!this.campaign_edit_settingData['budget']['value']) {
            this.tips.budget = true;
            this.iswraing = true;
            return false;
          }

          //非跨媒体
          if (this.publisher_model['publisherCount'] === 1) {
            //360
            if (this.parentData.selected_data[0]['publisher_id'] * 1 === 3 && this.budget < 30) {
              this.tips.budget = true;
              this.iswraing = true;
              return false;
            }
            //神马
            if (this.parentData.selected_data[0]['publisher_id'] * 1 === 4 && this.budget < 10) {
              this.tips.budget = true;
              this.iswraing = true;
              return false;
            }
            //百度，搜狗
            if ((this.parentData.selected_data[0]['publisher_id'] * 1 === 1 || this.parentData.selected_data[0]['publisher_id'] * 1 === 2) && this.budget < 50) {
              this.tips.budget = true;
              this.iswraing = true;
              return false;
            }
          }
          //跨媒体
          if (this.publisher_model['publisherCount'] > 1) {
            if (this.budget < 50) {
              this.tips.budget = true;
              this.iswraing = true;
              return false;
            }
          }


        }
        if (this.budgetRadio === 2) {
          this.campaign_edit_settingData['budget']['value'] = 0;
        }
      }

      //短语否定词
      if (this.campaign_edit_settingData.negative_words['edit_type'] === 'add') {
        this.campaign_edit_settingData.negative_words.value = this.getTextareaArray(this.negativeData.addValue) ;

      } else if (this.campaign_edit_settingData.negative_words['edit_type'] === 'delete_common') {
        this.campaign_edit_settingData.negative_words.value = this.negativeData.deleteCommonValue;

      } else if (this.campaign_edit_settingData.negative_words['edit_type'] === 'replace_all') {
        this.campaign_edit_settingData.negative_words.value = this.getTextareaArray(this.negativeData.replaceAllValue) ;

      } else if (this.campaign_edit_settingData.negative_words['edit_type'] === 'delete') {
        this.campaign_edit_settingData.negative_words.value = this.getTextareaArray(this.negativeData.deleteValue) ;

      }

      //精确否定词
      if (this.campaign_edit_settingData.exact_negative_words['edit_type'] === 'add') {
        this.campaign_edit_settingData.exact_negative_words.value = this.getTextareaArray(this.exactNegativeData.addValue) ;

      } else if (this.campaign_edit_settingData.exact_negative_words['edit_type'] === 'delete_common') {
        this.campaign_edit_settingData.exact_negative_words.value = this.exactNegativeData.deleteCommonValue;

      } else if (this.campaign_edit_settingData.exact_negative_words['edit_type'] === 'replace_all') {
        this.campaign_edit_settingData.exact_negative_words.value = this.getTextareaArray(this.exactNegativeData.replaceAllValue) ;

      } else if (this.campaign_edit_settingData.exact_negative_words['edit_type'] === 'delete') {
        this.campaign_edit_settingData.exact_negative_words.value = this.getTextareaArray(this.exactNegativeData.deleteValue) ;

      }


      //否定词
      if (this.campaign_edit_settingData.negative_words.is_edit) {
        if (this.campaign_edit_settingData.negative_words['edit_type'] !== 'delete_common') {
          if (this.campaign_edit_settingData.negative_words.value.length > this.tips.negativeData_max_length) {
            this.iswraing = true;
            return false;
          }
        }

      }
      //精确否定词
      if (this.campaign_edit_settingData.exact_negative_words.is_edit) {
        if (this.campaign_edit_settingData.exact_negative_words['edit_type'] !== 'delete_common') {
          if (this.campaign_edit_settingData.exact_negative_words.value.length > this.tips.exact_negativeData_max_length) {
            this.iswraing = true;
            return false;
          }
        }

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
          this.campaign_edit_settingData['cron_setting'] = format(this.cronSettingTime, 'yyyy-MM-dd HH:mm:ss');
        } else {
          this.campaign_edit_settingData['cron_setting'] = 'now';
        }

        this.campaign_edit_settingData['select_type'] = this.parentData.selected_type;
        if (this.parentData.selected_type === 'all') {
          this.campaign_edit_settingData['sheets_setting'] = {
            'table_setting': this.parentData.allViewTableData
          };
        } else {
          this.campaign_edit_settingData.pub_campaign_ids = this.stringIdArray;
        }

        this.dimensionsData.forEach((item) => { //添加维度参数
          if (item.state === false) {
            item.value ? this.campaign_edit_settingData.dimensions.value[item.key] = item.value : this.campaign_edit_settingData.dimensions.value[item.key] = '';
          }
        });


        this.editCampaign(this.campaign_edit_settingData , 'batch');

      }
    }

  }

  editCampaign(data, edit_type) {
    this.is_saving.emit({
      'is_saving': true,
      'isHidden': 'true'
    });
    this._http.editCampaign(data, edit_type).subscribe(
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
            notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'campaign' });
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
