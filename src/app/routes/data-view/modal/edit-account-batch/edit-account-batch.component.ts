import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DataViewAddEditService } from "../../service/data-view-add-edit.service";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { format , differenceInCalendarDays } from "date-fns";
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-edit-account-batch',
  templateUrl: './edit-account-batch.component.html',
  styleUrls: ['./edit-account-batch.component.scss']
})
export class EditAccountBatchComponent implements OnInit, OnChanges {

  @Input() stringIdArray: any;
  @Input() publisher_model: any;
  @Input() parentData: any;
  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();

  public productInfo = {};

  constructor(private _http: DataViewAddEditService,
    private message: NzMessageService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private modalService: NzModalService,
    private productService: ProductDataService) {
    this.publisherOption = this._http.getPublisherOption();
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  public publisherOption = {};
  public iswraing = false;
  public dimensionsData = [];
  public budgetRadio = 1; //1：每日 2：不限定
  public budget: any; //每日预算值
  public exclude_ip_length = 0;
  public exclude_ip: any; //ip排除
  public editing_accountData = {
    'cron_setting': 'now',
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
      "edit_type": 'add',
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

  public list = [];
  public tips = {
    budget: false,
    exclude_ip: false,
    exclude_ip_max_length: 300,
    length: {
      exclude_ip: 0,
      addValue: 0,
      replaceAllValue: 0,
      deleteValue: 0,
    }
  };
  public excludeIpData = {
    addValue: '',
    deleteCommonValue: [],
    replaceAllValue: '',
    deleteValue: '',

  };

  public cronSettingTime: any = new Date();
  public cronSetting = 'now';

  ngOnInit() {
    this.getIpPublic();
    this._showDimensionList();
  }

  getIpPublic() {
    const body = {
      select_type: this.parentData.selected_type,
    };
    if (this.parentData.selected_type === 'all') {
      body['sheets_setting'] = {
        'table_setting': this.parentData.allViewTableData
      };
    } else {
      body['pub_account_ids'] = this.stringIdArray;
    }


    this._http.getIpPublicAccount(body).subscribe(result => {
      if (result.status_code === 200) {
        const ipList = [];
        for (let i = 0; i < result.data.excludeIp.length; i++) {
          ipList.push({
            key: i.toString(),
            title: result.data.excludeIp[i]
          });
        }


        this.list = ipList;
      }
    });
  }
  //否定词删除全部逻辑
  deleteAll(data, name, lengthName) {
    data[name] = '';
    this.contentChange(lengthName, data[name]);
  }

  changeIp(ret: {}): void {
    // console.log('nzChange', ret);
    if (ret['from'] === 'left') { //从左到右
      ret['list'].forEach(item => {
        this.excludeIpData.deleteCommonValue.push(item.title);
      });
    } else if (ret['from'] === 'right') { //从右到左
      const newValue = [];
      this.excludeIpData.deleteCommonValue.forEach(item => {
        const comparItem = ret['list'].find((opt, index) => {
          return opt.title === item;
        });
        if (!comparItem) {
          newValue.push(item);
        }
      });
      this.excludeIpData.deleteCommonValue = newValue;
    }



  }


  _showDimensionList() {
    this._http.getDimensionsList().subscribe(
      (result) => {
        if (result.status_code === 200) {
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
        //非跨媒体
        if (this.publisher_model['publisherCount'] === 1) {
          if (this.parentData.selected_data[0]['publisher_id'] * 1 === 4 && this.budget < 10) {
            this.tips.budget = true;
            this.iswraing = true;
            return false;
          }

          if (this.parentData.selected_data[0]['publisher_id'] * 1 === 3 && (this.budget < 30 || this.budget % 10 !== 0)) {
            this.tips.budget = true;
            this.iswraing = true;
            return false;
          }
          if ((this.parentData.selected_data[0]['publisher_id'] * 1 === 3 && this.parentData.selected_data[0]['publisher_id'] * 1 === 2) && this.budget < 50) {
            this.tips.budget = true;
            this.iswraing = true;
            return false;
          }
        }

        //跨媒体
        if (this.publisher_model['publisherCount'] > 1) {
          if (this.budget < 50 || this.budget % 10 !== 0) {
            this.tips.budget = true;
            this.iswraing = true;
            return false;
          }
        }
      }
      if (this.budgetRadio === 2) {
        this.editing_accountData['budget']['value'] = 0;
      }
    }

    if (this.editing_accountData.exclude_ip['edit_type'] === 'add') {
      this.editing_accountData.exclude_ip.value = this.getTextareaArray(this.excludeIpData.addValue);

    } else if (this.editing_accountData.exclude_ip['edit_type'] === 'delete_common') {
      this.editing_accountData.exclude_ip.value = this.excludeIpData.deleteCommonValue;

    } else if (this.editing_accountData.exclude_ip['edit_type'] === 'replace_all') {
      this.editing_accountData.exclude_ip.value = this.getTextareaArray(this.excludeIpData.replaceAllValue);

    } else if (this.editing_accountData.exclude_ip['edit_type'] === 'delete') {
      this.editing_accountData.exclude_ip.value = this.getTextareaArray(this.excludeIpData.deleteValue);

    }

    /*IP排除(百度、搜狗范围不超过200个，神马范围不超过100个，360范围不超过300个.)*/
    if (this.editing_accountData['exclude_ip']['is_edit']) {

      if (this.editing_accountData.exclude_ip['edit_type'] !== 'delete_common') {
        if (this.editing_accountData.exclude_ip.value.length > this.tips.exclude_ip_max_length) {
          this.iswraing = true;
          return false;
        }
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

        if (this.cronSetting != 'now') {
          this.editing_accountData['cron_setting'] = format(this.cronSettingTime, 'yyyy-MM-dd HH:mm:ss');
        } else {
          this.editing_accountData['cron_setting'] = 'now';
        }

        this.editing_accountData['select_type'] = this.parentData.selected_type;
        if (this.parentData.selected_type === 'all') {
          this.editing_accountData['sheets_setting'] = {
            'table_setting': this.parentData.allViewTableData
          };
        } else {
          this.editing_accountData.pub_account_ids = this.stringIdArray;
        }

        this.dimensionsData.forEach((item) => { //添加维度参数
          if (item.state === false) {
            item.value ? this.editing_accountData.dimensions.value[item.key] = item.value : this.editing_accountData.dimensions.value[item.key] = '';
          }
        });

        this.editAccount(this.editing_accountData, 'batch');
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

        if (result.status_code === 200) {
          if (result['data']['job_type'] != 'cron') {
            this.message.success("已成功加入任务队列，请稍后查看");
            notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'account' });
            this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
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
