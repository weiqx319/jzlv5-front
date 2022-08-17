import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DataViewAddEditService } from "../../service/data-view-add-edit.service";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { isUndefined } from "@jzl/jzl-util";
import { formatDate } from "@jzl/jzl-util";
import { differenceInCalendarDays } from "date-fns";

@Component({
  selector: 'app-edit-extension',
  templateUrl: './edit-extension.component.html',
  styleUrls: ['./edit-extension.component.scss']
})
export class EditExtensionComponent implements OnInit, OnChanges {
  @Input() stringIdArray: any;
  @Input() parentData: any;
  @Input() publisher_model: any;
  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _http: DataViewAddEditService,
    private message: NzMessageService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private modalService: NzModalService) {
    this.publisherOption = this._http.getPublisherOption();
  }
  public curTargetIndex = 0;
  public showCoefficient = false;
  public publisher = 3;
  public publisherOption = {};
  public campaignInfo = {};
  public iswraing = false;
  public hourState = [];
  public accountInfo = {};
  public regionRadio = 1; //1：试用账户推广地域 2：指定地域
  public arear_void = false;
  public regionData: any;
  public dateData: any;
  public date_void = false;
  public regionList: any;
  public campaign_edit_settingData = {
    "pub_campaign_ids": [],
    "pub_campaign_name": {
      "is_edit": false,
      "value": ""
    },
    "budget": {
      "is_edit": false,
      "value": 50
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

    "region_price_factor": {
      "is_edit": false,
      "value": []
    },
    "schedule": {//选填, 填写空数组"[]"：取消暂停时段，更新为全时段推广
      "is_edit": false,
      "value": []
    },

    "schedule_price_factors": {//选填, 填写空数组"[]"：取消暂停时段，更新为全时段推广
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
  public editing_accountData = {
    "pub_account_ids": [],
    "budget": {
      "is_edit": false,
      "value": 500
    },
    "region_target": {
      "is_edit": false,
      "is_replace": false,
      "value": []
    },
    "region_price_factor": {
      "is_edit": false,
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

  ngOnInit() {
    const authUser = this.authService.getCurrentUser();
    this.showCoefficient = authUser.hasOwnProperty('factor_permission') && authUser['factor_permission'] == 1;
    if (this.parentData.selected_data.length === 1) {
      this.publisher = this.parentData.selected_data[0]['publisher_id'] * 1;
      this.showCoefficient = this.showCoefficient && (this.publisher === 1 || this.publisher === 3);

      switch (this.summaryType) {
        case 'campaign':
          this._showCampaign();
          break;
        case 'account':
          this._showAccount();
          break;
      }
    } else if (this.publisher_model['publisherCount'] === 1) {
      this.publisher = this.publisher_model['publisher_array'][0]['value'] * 1;
      this.showCoefficient = this.showCoefficient && (this.publisher === 1 || this.publisher === 3);
    }
  }

  _showCampaign() {
    this._http.showCampaign({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_campaign_id": this.parentData.selected_data[0].pub_campaign_id
    }).subscribe(
      (result) => {
        this.campaignInfo = result.data;
        if (this.campaignInfo['region_target'].length) {
          this.regionRadio = 2;
        }
        this.regionList = {
          'region_target': this.campaignInfo['region_target'],
          'region_price_factor': this.campaignInfo['region_price_factor']
        };

        this.hourState = this.campaignInfo['schedule'];

      }
    );
  }

  _showAccount() {
    this._http.showAccount({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id
    }).subscribe(
      (result) => {
        if (result.status_code === 200) {
          this.accountInfo = result['data'];
          this.regionList = {
            'region_target': this.accountInfo['region_target'],
            'region_price_factor': this.accountInfo['region_price_factor']
          };
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

  regionSelect(event) {
    this.regionData = event;
  }

  dateDate(event) {
    this.dateData = event;
  }

  checkPage() {
    if (this.summaryType === 'campaign') {
      if (this.parentData.selected_type === 'all') {
        this.campaign_edit_settingData['sheets_setting'] = {
          'table_setting': this.parentData.allViewTableData
        };
      } else {
        this.campaign_edit_settingData.pub_campaign_ids = this.stringIdArray;
      }

      if (this.campaign_edit_settingData.region_target.is_edit) {
        if (this.parentData.selected_data[0].publisher_id * 1 === 3) {
          this.regionRadio = 2;
        }
        if (this.regionRadio === 1) {
          this.campaign_edit_settingData.region_target.value = [];
        }
        if (this.regionRadio === 2) {
          this.arear_void = false;
          this.campaign_edit_settingData.region_target.value = this.regionData['region_lists'];
          if (!this.regionData['region_lists'].length) {
            this.iswraing = true;
            this.arear_void = true;
            return false;
          }

          if (this.showCoefficient) {
            this.campaign_edit_settingData.region_price_factor.is_edit = true;
            const postRegionPriceFactor = [];
            this.regionData['region_price_factor'].forEach(item => {
              if (item.sub.length === 0) {
                postRegionPriceFactor.push({ regionId: item['code'] * 1, priceFactor: isUndefined(item['coefficient']) ? 1 : item['coefficient'] * 1 });
              } else {
                let currentSelectedNum = 0;
                let currentSubCoefficient = [];
                item.sub.forEach(subItem => {
                  if (subItem.is_selected) {
                    currentSelectedNum++;
                    currentSubCoefficient.push(subItem['coefficient']);
                  }
                });
                currentSubCoefficient = Array.from(new Set(currentSubCoefficient));

                if (currentSelectedNum === item.sub.length && currentSubCoefficient.length === 1 && this.curTargetIndex === 0) {
                  postRegionPriceFactor.push({ regionId: item['code'] * 1, priceFactor: currentSubCoefficient[0] * 1 });
                } else {
                  item.sub.forEach(subItem => {
                    if (subItem.is_selected) {
                      postRegionPriceFactor.push({ regionId: subItem['code'] * 1, priceFactor: subItem['coefficient'] * 1 });
                    }
                  });
                }
              }
            });
            this.campaign_edit_settingData.region_price_factor.value = postRegionPriceFactor;
          } else {
            this.campaign_edit_settingData.region_price_factor.is_edit = false;

          }
        }
      }

      if (this.campaign_edit_settingData.schedule.is_edit) {
        this.campaign_edit_settingData.schedule.value = this.dateData['dateData'];
        let count = 0;
        this.dateData['dateData'].forEach((item) => {
          item['hour'].forEach((hour) => {
            hour === 1 ? count++ : count = count;
          });
        });

        if (this.showCoefficient) {
          this.campaign_edit_settingData.schedule_price_factors.value = this.dateData['priceFactor'];
          this.campaign_edit_settingData.schedule_price_factors.is_edit = true;
        } else {
          this.campaign_edit_settingData.schedule_price_factors.value = [];
          this.campaign_edit_settingData.schedule_price_factors.is_edit = false;
        }


        // if (count === (24 * 7)) {
        //   this.campaign_edit_settingData.schedule.value = []; //全时段推广
        // }

        this.date_void = false;
        if (count === 0) {
          this.iswraing = true;
          this.date_void = true;
          return false;
        }
      }

    }

    if (this.summaryType === 'account') {

      if (this.editing_accountData.region_target.is_edit) {
        this.arear_void = false;
        this.editing_accountData.region_target.value = this.regionData['region_lists'];
        if (!this.regionData['region_lists'].length) {
          this.iswraing = true;
          this.arear_void = true;
          return false;
        }

        if (this.showCoefficient) {
          this.editing_accountData.region_price_factor.is_edit = true;
          const postRegionPriceFactor = [];
          this.regionData['region_price_factor'].forEach(item => {
            if (item.sub.length === 0) {
              postRegionPriceFactor.push({ regionId: item['code'] * 1, priceFactor: item['coefficient'] * 1 });
            } else {
              let currentSelectedNum = 0;
              let currentSubCoefficient = [];
              item.sub.forEach(subItem => {
                if (subItem.is_selected) {
                  currentSelectedNum++;
                  currentSubCoefficient.push(item['coefficient']);
                }
              });
              currentSubCoefficient = Array.from(new Set(currentSubCoefficient));

              if (currentSelectedNum === item.length && currentSubCoefficient.length === 1 && this.curTargetIndex === 0) {
                postRegionPriceFactor.push({ regionId: item['code'] * 1, priceFactor: currentSubCoefficient[0] * 1 });
              } else {
                item.sub.forEach(subItem => {
                  if (subItem.is_selected) {
                    postRegionPriceFactor.push({ regionId: subItem['code'] * 1, priceFactor: subItem['coefficient'] * 1 });
                  }
                });
              }
            }
          });
          this.editing_accountData.region_price_factor.value = postRegionPriceFactor;
        } else {
          this.editing_accountData.region_price_factor.is_edit = false;

        }



      }
    }
  }

  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {
        if (this.summaryType === 'campaign') {
          this.campaign_edit_settingData['select_type'] = this.parentData.selected_type;
          if (this.parentData.selected_type === 'all') {
            this.campaign_edit_settingData['sheets_setting'] = {
              'table_setting': this.parentData.allViewTableData
            };
          } else {
            this.campaign_edit_settingData.pub_campaign_ids = this.stringIdArray;
          }

          let editStyle = '';
          if (this.parentData.selected_data.length === 1) {
            editStyle = 'single';
          } else {
            editStyle = 'batch';
          }
          this.editCampaign(this.campaign_edit_settingData, editStyle);
        }

        if (this.summaryType === 'account') {
          this.editing_accountData['select_type'] = this.parentData.selected_type;
          if (this.parentData.selected_type === 'all') {
            this.editing_accountData['sheets_setting'] = {
              'table_setting': this.parentData.allViewTableData
            };
          } else {
            this.editing_accountData.pub_account_ids = this.stringIdArray;
          }

          let editStyle = '';
          if (this.parentData.selected_data.length === 1) {
            editStyle = 'single';
          } else {
            editStyle = 'batch';
          }
          this.editAccount(this.editing_accountData, editStyle);
        }

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

        if (result.status_code === 200) {
          this.message.success("已成功加入任务队列，请稍后查看");
          notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'campaign' });
          this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
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
          this.message.success("已成功加入任务队列，请稍后查看");
          notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'account' });
          this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
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

  changeTargetTab(event) {
    this.regionData = {};
  }

}
