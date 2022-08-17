import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {DataViewAddEditService} from "../../service/data-view-add-edit.service";
import {AuthService} from "../../../../core/service/auth.service";
import {NotifyService} from "../../../../module/notify/notify.service";
import {format, differenceInCalendarDays } from "date-fns";

@Component({
  selector: 'app-edit-campaign-single',
  templateUrl: './edit-campaign-single.component.html',
  styleUrls: ['./edit-campaign-single.component.scss']
})
export class EditCampaignSingleComponent implements OnInit, OnChanges {

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
  public campaignInfo = {};
  public hourState = [];
  public publishId: any;  //1,百度  2，搜狗 3,360  4，神马
  public negative_words: any; //否定词
  public exact_negative_words: any; //精确否定词
  public dimensionsData = [];
  public budgetRadio = 1; //1：每日 2：不限定
  public budget: any; //每日预算值
  public iswraing = false;


  public cronSettingTime:any =  new Date();
  public cronSetting = 'now';
  public campaign_edit_settingData = {
    'cron_setting':'now',
    "pub_campaign_ids": [],
    "pub_campaign_name": {
      "is_edit": false,
      "value": ''
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
    "device": {
      "is_edit": false,
      "value": 0
    },
    "negative_words": {
      "is_edit": false,
      "is_replace": false,
      "value": []
    },
    "exact_negative_words": {
      "is_edit": false,
      "is_replace": false,
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

    length: {
      negative_words: 0,
      exact_negative_words: 0
    },
    maxLength: {
      negative_words: {
        2: 300,
        3: 200,
        4: 300
      },
      exact_negative_words: {
        2: 300,
        3: 400,
        4: 300
      }
    }
  };

  ngOnInit() {

    this.publishId = this.parentData.selected_data[0].publisher_id * 1;
    this._showCampaign();
    this._showDimensionList();
  }

  _showCampaign() {
    this._http.showCampaign ({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_campaign_id": this.parentData.selected_data[0].pub_campaign_id
    }).subscribe(
      (result) => {

        this.campaignInfo = result.data;
        //保存查出来的推广时段数据
        this.campaignInfo['schedule'].forEach((item) => {
          this.hourState.push(...item['hour']);
        });
        this.campaign_edit_settingData.pause.value =  result.data.pause;

        this.campaign_edit_settingData.pub_campaign_ids = this.stringIdArray;
        this.campaign_edit_settingData.pub_campaign_name.value = result.data['pub_campaign_name'];
        if (result.data['budget'] === '-1' || result.data['budget'] === '0') {
          this.budgetRadio = 2;
          this.campaign_edit_settingData.budget.value = -1;
        } else {
          this.campaign_edit_settingData.budget.value = result.data['budget'];
          this.budget = result.data['budget'];
        }

        this.campaign_edit_settingData.show_prob.value = result.data['show_prob'] * 1;
        this.campaign_edit_settingData.bid_prefer.value = result.data['bid_prefer'] * 1;

        this.campaign_edit_settingData.device.value = result.data['device'] * 1;

        this.negative_words = this.getStringByArray(result.data['negative_words']);
        this.exact_negative_words = this.getStringByArray(result.data.exact_negative_words);
        this.tips.length.negative_words = result.data['negative_words'].length;
        this.tips.length.exact_negative_words = result.data.exact_negative_words.length;


        this.campaign_edit_settingData.wap_price_ratio.value = result.data['wap_price_ratio'] * 1;
        this.campaign_edit_settingData.pc_price_ratio.value = result.data['pc_price_ratio'] * 1;

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

  getStringByArray(dataArray) {
    let dataString = "";
    if (dataArray && dataArray.length > 0) {
      dataString = dataArray.join('\n');
    }
    return dataString;
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
    this.tips.budget = false;
    this.tips.pc_price_ratio = false;
    this.tips.wap_price_ratio = false;
    this.tips.exact_negative_words = false;
    this.tips.negative_words = false;
    //计划名称
    if (this.campaign_edit_settingData['pub_campaign_name']['is_edit'] && !this.campaign_edit_settingData.pub_campaign_name['value']) {
      this.iswraing = true;
      return false;
    }
    //日预算
    if (this.campaign_edit_settingData['budget']['is_edit']) {
      if (this.budgetRadio === 1) {
        this.campaign_edit_settingData['budget']['value'] = this.budget;
        if (!this.campaign_edit_settingData['budget']['value']) {
          this.tips.budget = true;
          this.iswraing = true;
          return false;
        }
        if (this.publishId === 4 && this.budget < 10) {
          this.tips.budget = true;
          this.iswraing = true;
          return false;
        }
        if (this.publishId === 3 && this.budget < 30) {
          this.tips.budget = true;
          this.iswraing = true;
          return false;
        }
        if ((this.publishId === 1 || this.publishId === 2) && this.budget < 50) {
          this.tips.budget = true;
          this.iswraing = true;
          return false;
        }
      }
      if (this.budgetRadio === 2) {
        this.campaign_edit_settingData['budget']['value'] = 0;
      }
    }

    //计算机出价比例 (只有百度有)，
    /*1.  在移动优先情况下，pc出价比例可以改成0  代表不投放pc
    * 2.  取消仅投放移动的计划  device只能为0
    * */
    if (this.campaign_edit_settingData['pc_price_ratio']['is_edit']) {
      if (!this.campaign_edit_settingData['pc_price_ratio']['value'] && this.campaign_edit_settingData['pc_price_ratio']['value'] !==  0) {
        this.tips.pc_price_ratio = true;
        this.iswraing = true;
        return false;
      }


      if (this.campaign_edit_settingData['pc_price_ratio']['value'] < 0) {
        this.tips.pc_price_ratio = true;
        this.iswraing = true;
        return false;
      }
      if (this.campaign_edit_settingData['pc_price_ratio']['value'] > 10.00) {
        this.tips.pc_price_ratio = true;
        this.iswraing = true;
        return false;
      }
    }

    //移动出价比例（
    if (this.campaign_edit_settingData['wap_price_ratio']['is_edit']) {
      if (!this.campaign_edit_settingData['wap_price_ratio']['value'] && this.campaign_edit_settingData['wap_price_ratio']['value'] !== 0 ) {
        this.tips.wap_price_ratio = true;
        this.iswraing = true;
        return false;
      }
      //百度  0~10.00，可保留小数点后两位）
      if (this.publishId === 1) {
        if (this.campaign_edit_settingData['wap_price_ratio']['value'] < 0 || this.campaign_edit_settingData['wap_price_ratio']['value'] > 10.00) {
          this.tips.wap_price_ratio = true;
          this.iswraing = true;
          return false;
        }
      }

        //（360   0.1-0.9且保留一位小数 ）
      if (this.publishId === 3 ) {
        if (this.campaign_edit_settingData['wap_price_ratio']['value'] < 0.1 || this.campaign_edit_settingData['wap_price_ratio']['value'] > 9.9) {
          this.tips.wap_price_ratio = true;
          this.iswraing = true;
          return false;
        }
        if (this.getPointAfterCount(this.campaign_edit_settingData['wap_price_ratio']['value']) > 1) {

          this.tips.wap_price_ratio = true;
          this.iswraing = true;
          return false;
        }
      }

      //（搜狗，默认值为1.00，比例范围为0.10到100.00。）
      if (this.publishId === 2) {
        if (this.campaign_edit_settingData['wap_price_ratio']['value'] < 0.10 || this.campaign_edit_settingData['wap_price_ratio']['value'] > 100.00) {
          this.tips.wap_price_ratio = true;
          this.iswraing = true;
          return false;
        }
      }
    }

    this.campaign_edit_settingData.negative_words.value = this.getTextareaArray(this.negative_words) ;
    this.campaign_edit_settingData.exact_negative_words.value = this.getTextareaArray(this.exact_negative_words) ;

    //否定词
    if (this.campaign_edit_settingData.negative_words.is_edit) {
      //非百度
      if (this.publishId !== 1 && this.campaign_edit_settingData.negative_words.value.length > this.tips.maxLength.negative_words[this.publishId]) {
        this.tips.negative_words = true;
        this.iswraing = true;
        return false;
      }
    }
    //精确否定词
    if (this.campaign_edit_settingData.exact_negative_words.is_edit) {

      if (this.publishId !== 1 && this.campaign_edit_settingData.exact_negative_words.value.length > this.tips.maxLength.exact_negative_words[this.publishId]) {
        this.tips.exact_negative_words = true;
        this.iswraing = true;
        return false;
      }

    }
  }

  //判断小数点后几位数
  getPointAfterCount(number) {
    const splitPointData = number.toString().split(".");
    return splitPointData.length<2?0:splitPointData[1].length;
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
        this.campaign_edit_settingData.pub_campaign_ids = this.stringIdArray;

        this.dimensionsData.forEach((item) => { //添加维度参数
          if (item.state === false) {
            item.value ? this.campaign_edit_settingData.dimensions.value[item.key] = item.value : this.campaign_edit_settingData.dimensions.value[item.key] = '';
          }
        });

        this.editCampaign(this.campaign_edit_settingData , 'single');
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
