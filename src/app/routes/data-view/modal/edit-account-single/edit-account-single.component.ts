import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {DataViewAddEditService} from "../../service/data-view-add-edit.service";
import {AuthService} from "../../../../core/service/auth.service";
import {NotifyService} from "../../../../module/notify/notify.service";
import {format, differenceInCalendarDays } from "date-fns";

@Component({
  selector: 'app-edit-account-single',
  templateUrl: './edit-account-single.component.html',
  styleUrls: ['./edit-account-single.component.scss']
})
export class EditAccountSingleComponent implements OnInit, OnChanges {

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
  public accountInfo = {};
  public dimensionsData = [];
  public exclude_ip_length = 0;
  public budgetRadio = 1; //1：每日 2：不限定
  public budget: any; //每日预算值
  public publishId: any;  //1,百度  2，搜狗 3,360  4，神马
  public exclude_ip: any; //ip排除

  public cronSettingTime:any =  new Date();
  public cronSetting = 'now';

  public editing_accountData = {
    'cron_setting':'now',
    "pub_account_ids": [],
    "budget": {
      "is_edit": false,
      "value": null
    },
    "region_target": {
      "is_edit": false,
      "is_replace": false,
      "value": []
    },
    "exclude_ip": {
      "is_edit": false,
      "is_replace": false,
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
    exclude_ip: false,

    length: {
      exclude_ip: 0
    }
  };

  ngOnInit() {
    this._showAccount();
    this._showDimensionList();

    this.publishId = this.parentData.selected_data[0].publisher_id * 1;
  }
  _showAccount() {
    this._http.showAccount({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_campaign_id": this.parentData.selected_data[0].pub_campaign_id
    }).subscribe(
      (result) => {
        if ( result.status_code === 200 ) {
          this.accountInfo = result['data'];
          this.editing_accountData.pause.value =  result.data.pause;
          this.editing_accountData.pub_account_ids = this.stringIdArray;
          if (result.data['budget'] === '-1' || result.data['budget'] === '0') {
            this.budgetRadio = 2;
          } else {
            this.editing_accountData.budget.value = result.data['budget'];
            this.budget = result.data['budget'] * 1;
          }

          this.exclude_ip = this.getStringByArray(result.data['exclude_ip']);
          this.tips.length.exclude_ip = result.data['exclude_ip'].length;

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

  getStringByArray(dataArray) {
    let dataString = "";
    if (dataArray && dataArray.length > 0) {
      dataString = dataArray.join('\n');
    }
    return dataString;
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
    this.tips.budget = false;
    this.tips.exclude_ip = false;
    if (this.editing_accountData['budget']['is_edit']) {
      if (this.budgetRadio === 1) {
        this.editing_accountData['budget']['value'] = this.budget;
        if (!this.editing_accountData['budget']['value']) {
          this.tips.budget = true;
          this.iswraing = true;
          return false;
        }
        if (this.publishId === 4 && this.budget < 10) {
          this.tips.budget = true;
          this.iswraing = true;
          return false;
        }

        //360不小于30 且为 10 的整数倍
        if (this.publishId === 3 && (this.budget < 30 || this.budget % 10 !== 0)) {
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
        this.editing_accountData['budget']['value'] = 0;
      }
    }

    /*IP排除(百度、搜狗范围不超过200个，神马范围不超过100个，360范围不超过300个.)*/
    if (this.editing_accountData['exclude_ip']['is_edit']) {
      if (this.exclude_ip) {
        this.editing_accountData.exclude_ip.value = this.getTextareaArray(this.exclude_ip) ;
      }

      if ((this.publishId === 1 || this.publishId === 2) && this.editing_accountData.exclude_ip.value.length > 200) {
        this.tips.exclude_ip = true;
        this.iswraing = true;
        return false;
      }


      if (this.publishId === 3 && this.editing_accountData.exclude_ip.value.length > 300) {
        this.tips.exclude_ip = true;
        this.iswraing = true;
        return false;
      }
      if (this.publishId === 4 && this.editing_accountData.exclude_ip.value.length > 100) {
        this.tips.exclude_ip = true;
        this.iswraing = true;
        return false;
      }


    }
  }

  changeInput(name) {
    this.tips[name] = false;
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
          this.editing_accountData['cron_setting'] = format(this.cronSettingTime, 'yyyy-MM-dd HH:mm:ss');
        } else {
          this.editing_accountData['cron_setting'] = 'now';
        }


        this.editing_accountData['select_type'] = this.parentData.selected_type;
        this.editing_accountData.pub_account_ids = this.stringIdArray;
        this.dimensionsData.forEach((item) => { //添加维度参数
          if (item.state === false) {
            item.value ? this.editing_accountData.dimensions.value[item.key] = item.value : this.editing_accountData.dimensions.value[item.key] = '';
          }
        });

        this.editAccount(this.editing_accountData , 'single');


      }
    }

  }

  editAccount(data, edit_type) {
    this.is_saving.emit({
      'is_saving': true,
      'isHidden': 'true'
    });
    this._http.editAccount(data, edit_type).subscribe(
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
            notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'account' });
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
