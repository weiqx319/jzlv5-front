import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {DataViewAddEditService} from "../../service/data-view-add-edit.service";
import {AuthService} from "../../../../core/service/auth.service";
import {NotifyService} from "../../../../module/notify/notify.service";
import {format, differenceInCalendarDays } from "date-fns";

@Component({
  selector: 'app-edit-group-single',
  templateUrl: './edit-group-single.component.html',
  styleUrls: ['./edit-group-single.component.scss']
})
export class EditGroupSingleComponent implements OnInit, OnChanges {

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
  public groupData = {};
  public publishId: any;  //1,百度  2，搜狗 3,360  4，神马
  public bid_prefer: any; //1, pc 2,移动
  public pc_price: any;
  public wap_price: any;
  public price_ratio: any;
  public negative_words: any; //否定词
  public exact_negative_words: any; //精确否定词
  public dimensionsData = [];
  public iswraing = false;
  public accuState = false ; // 单元分匹配模式出价校验   false：不校验 ， true：提示校验
  public operatingModel = [
    {"label": "ios" , 'value': 1},
    {"label": "Andriod", 'value': 2},
    {"label": "其他平台", 'value': 4}
  ];  //操作系统
  public cronSettingTime:any =  new Date();
  public cronSetting = 'now';
  public matchPriceState = false;
  public editing_unitData = {
    'cron_setting':'now',
    "pub_adgroup_ids": [],
    "pause": {
      "is_edit": false,
      "value": false
    },
    "pub_adgroup_name": {
      "is_edit": false,
      "value": "新版测试单元"
    },
    "max_price": {
      "is_edit": false,
      "value": null
    },
    "wap_price_ratio": {
      "is_edit": false,
      "value": 1 //移动出价
    },
    "pc_price_ratio": {
      "is_edit": false,
      "value": 1  //单元计算机出价
    },
    "ad_platform_os": {
      "is_edit": false,
      "value": [] // 移动端操作系统
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
    "negative_words": {
      "is_edit": false,
      "edit_type": 'add',
      "value": []
    },
    "exact_negative_words": {
      "is_edit": false,
      "edit_type": 'add',
      "value": []
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
    this._showAdgroup();
    this._showDimensionList();
  }

  _showAdgroup() {
    this._http.showAdgroup({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_adgroup_id": this.parentData.selected_data[0].pub_adgroup_id
    }).subscribe(
      (result) => {
        if ( result.status_code === 200 ) {
          this.groupData = result.data;

          this.editing_unitData.pause.value =  result.data.pause;
          this.editing_unitData.pub_adgroup_name.value = result.data.pub_adgroup_name;
          this.editing_unitData.max_price.value = result.data.max_price * 1;

          this.bid_prefer = result.data.bid_prefer * 1;
          this.pc_price = result.data['campaign_pc_price_ratio'] * 1;
          this.wap_price = result.data['campaign_wap_price_ratio'] * 1;

          if ( this.bid_prefer === 1) { //pc优先
            if ( this.wap_price === -1) { //默认选择使用计划出价比例
              this.price_ratio = 1;
            } else {
              this.price_ratio = 2;
            }
          } else if ( this.bid_prefer === 2) { //移动优先
            if ( this.pc_price === -1) {  //默认选择使用计划出价比例
              this.price_ratio = 1;
            } else {
              this.price_ratio = 2;
            }
          }

          this.editing_unitData['bid_prefer'] = this.bid_prefer;
          this.editing_unitData.wap_price_ratio.value = result.data.wap_price_ratio;
          this.editing_unitData.pc_price_ratio.value = result.data.pc_price_ratio;


          // this.editing_unitData.ad_platform_os.value = result.data.ad_platform_os;
          this.editing_unitData.ad_platform_os.value = this.getPlatformOsArray(result.data.ad_platform_os * 1);

          this.matchPriceState = result.data.match_price_status == 0;
          this.editing_unitData.accu_price_factor.value = result.data.accu_price_factor;
          this.editing_unitData.word_price_factor.value = result.data.word_price_factor;
          this.editing_unitData.wide_price_factor.value = result.data.wide_price_factor;
          this.negative_words = this.getStringByArray(result.data.negative_words);
          this.exact_negative_words = this.getStringByArray(result.data.exact_negative_words);
          this.tips.length.negative_words = result.data.negative_words.length;
          this.tips.length.exact_negative_words = result.data.exact_negative_words.length;

        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      }
    );
  }

  //二进制拆分
  getPlatformOsArray(count) {
    const osArray = [];
    const binaryString = (count).toString(2);
    for (let i = 0; i < binaryString.length; i++) {
      if (binaryString[i] * 1 === 1) {
        osArray.push(Math.pow(2, binaryString.length - (i + 1)));
      }
    }
    return osArray;
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

    this.tips.max_price = false;
    this.tips.pc_price_ratio = false;
    this.tips.wap_price_ratio = false;
    this.tips.accuState = false;

    this.tips.accu_price_factor = false;
    this.tips.word_price_factor = false;
    this.tips.wide_price_factor = false;

    this.tips.negative_words = false;
    this.tips.exact_negative_words = false;


    //单元名称
    if (this.editing_unitData.pub_adgroup_name.is_edit && !this.editing_unitData.pub_adgroup_name.value) {
      this.iswraing = true;
      return false;
    }
    //单元出价
    if (this.editing_unitData.max_price.is_edit) {
      if (!this.editing_unitData.max_price.value) {
        this.tips.max_price = true;
        this.iswraing = true;
        return false;
      }
      if (this.editing_unitData.max_price.value) {
        if (this.publishId === 1 || this.publishId === 2) {
          if (this.editing_unitData['max_price']['value'] < 0.01) {
            this.tips.max_price = true;
            this.iswraing = true;
            return false;
          }
          if (this.editing_unitData['max_price']['value'] > 999.99) {
            this.tips.max_price = true;
            this.iswraing = true;
            return false;
          }
        }
        if (this.publishId === 3) {
          if (this.editing_unitData['max_price']['value'] < 0.3) {
            this.tips.max_price = true;
            this.iswraing = true;
            return false;
          }
          if (this.editing_unitData['max_price']['value'] > 999.99) {
            this.tips.max_price = true;
            this.iswraing = true;
            return false;
          }
        }
        if (this.publishId === 4) {
          if (this.editing_unitData['max_price']['value'] < 0.45) {
            this.tips.max_price = true;
            this.iswraing = true;
            return false;
          }
          if (this.editing_unitData['max_price']['value'] > 999.99) {
            this.tips.max_price = true;
            this.iswraing = true;
            return false;
          }
        }
      }
    }
    //出价比例
    if (this.publishId === 1) {
      //计算机出价比例
      if (this.bid_prefer === 2 && this.editing_unitData.pc_price_ratio.is_edit && this.price_ratio === 2) {
        if (!this.editing_unitData.pc_price_ratio.value && this.editing_unitData.pc_price_ratio.value!==0) {
          this.tips.pc_price_ratio = true;
          this.iswraing = true;
          return false;
        }
        if (this.editing_unitData.pc_price_ratio.value < 0) {
          this.tips.pc_price_ratio = true;
          this.iswraing = true;
          return false;
        }

        if (this.editing_unitData.pc_price_ratio.value > 10) {
          this.tips.pc_price_ratio = true;
          this.iswraing = true;
          return false;
        }
      }
      //移动出价比例
      if (this.bid_prefer === 1 && this.editing_unitData.wap_price_ratio.is_edit && this.price_ratio === 2) {

        if (!this.editing_unitData.wap_price_ratio.value && this.editing_unitData.wap_price_ratio.value!==0) {
          this.tips.wap_price_ratio = true;
          this.iswraing = true;
          return false;
        }
        if (this.editing_unitData.wap_price_ratio.value < 0) {
          this.tips.wap_price_ratio = true;
          this.iswraing = true;
          return false;
        }

        if (this.editing_unitData.wap_price_ratio.value > 10) {
          this.tips.wap_price_ratio = true;
          this.iswraing = true;
          return false;
        }

      }
    }
    //移动操作系统
    if (this.publishId === 4 && this.editing_unitData.ad_platform_os.is_edit) {
      if (!this.editing_unitData.ad_platform_os.value) {
        this.iswraing = true;
        return false;
      }
      if (this.editing_unitData.ad_platform_os.value.length === 0) {
        this.iswraing = true;
        return false;
      }
    }
    //分匹配模式出价（精确的范围：1~10  短语的范围：0.1~1.2  广泛的范围：0~1(可以选0)统一都是保留小数点后两位）
    if (this.publishId === 1 && this.editing_unitData.match_price_status.is_edit && this.matchPriceState) {
      if (!this.editing_unitData.accu_price_factor['value'] || this.editing_unitData.accu_price_factor['value'] < 1 || this.editing_unitData.accu_price_factor['value'] > 10) {
        this.iswraing = true;
        this.tips.accu_price_factor = true;
        return false;
      }
      if (!this.editing_unitData.word_price_factor['value'] || this.editing_unitData.word_price_factor['value'] < 0.1 || this.editing_unitData.word_price_factor['value'] > 1.2) {
        this.iswraing = true;
        this.tips.word_price_factor = true;
        return false;
      }
      if (this.editing_unitData.wide_price_factor['value'] === '' || this.editing_unitData.wide_price_factor['value'] === null || this.editing_unitData.wide_price_factor['value'] < 0 || this.editing_unitData.wide_price_factor['value'] > 1) {
        this.iswraing = true;
        this.tips.wide_price_factor = true;
        return false;
      }
      if (this.editing_unitData.accu_price_factor['value'] < this.editing_unitData.word_price_factor['value'] || this.editing_unitData.accu_price_factor['value'] < this.editing_unitData.wide_price_factor['value']) {
        this.iswraing = true;
        this.tips.accuState = true;
        return false;
      }
      if (this.editing_unitData.word_price_factor['value'] > this.editing_unitData.accu_price_factor['value'] || this.editing_unitData.word_price_factor['value'] < this.editing_unitData.wide_price_factor['value']) {
        this.iswraing = true;
        this.tips.accuState = true;
        return false;
      }
      if (this.editing_unitData.wide_price_factor['value'] > this.editing_unitData.word_price_factor['value'] || this.editing_unitData.word_price_factor['value'] > this.editing_unitData.accu_price_factor['value']) {
        this.iswraing = true;
        this.tips.accuState = true;
        return false;
      }
    }

    this.editing_unitData.negative_words.value = this.getTextareaArray(this.negative_words) ;
    this.editing_unitData.exact_negative_words.value = this.getTextareaArray(this.exact_negative_words) ;

    //否定词
    if (this.editing_unitData.negative_words.is_edit) {

      if (this.publishId !== 1 && this.editing_unitData.negative_words.value.length > this.tips.maxLength.negative_words[this.publishId]) {
        this.tips.negative_words = true;
        this.iswraing = true;
        return false;
      }

    }
    //精确否定词
    if (this.editing_unitData.exact_negative_words.is_edit) {

      if (this.publishId !== 1 && this.editing_unitData.exact_negative_words.value.length > this.tips.maxLength.exact_negative_words[this.publishId]) {
        this.tips.exact_negative_words = true;
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
          this.editing_unitData['cron_setting'] = format(this.cronSettingTime, 'yyyy-MM-dd HH:mm:ss');
        } else {
          this.editing_unitData['cron_setting'] = 'now';
        }

        this.editing_unitData.match_price_status.value = this.matchPriceState ?  0 : 1;
        this.editing_unitData.word_price_factor.is_edit = this.matchPriceState;
        this.editing_unitData.wide_price_factor.is_edit = this.matchPriceState;
        this.editing_unitData.accu_price_factor.is_edit = this.matchPriceState;

        this.editing_unitData['select_type'] = this.parentData.selected_type;
        this.editing_unitData.pub_adgroup_ids = this.stringIdArray;
        this.dimensionsData.forEach((item) => { //添加维度参数
          if (item.state === false) {
            item.value ? this.editing_unitData.dimensions.value[item.key] = item.value : this.editing_unitData.dimensions.value[item.key] = '';
          }
        });
        if ( this.bid_prefer === 1 && this.price_ratio === 1) {
          this.editing_unitData.wap_price_ratio.value =  -1;
        }
        if ( this.bid_prefer === 2 && this.price_ratio === 1) {
          this.editing_unitData.pc_price_ratio.value =  -1;
        }


        this.editAdgroup(this.editing_unitData , 'single');

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
