import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {DataViewAddEditService} from "../../service/data-view-add-edit.service";
import {AddViewDimensionComponent} from "../add-view-dimension/add-view-dimension.component";
import {AuthService} from "../../../../core/service/auth.service";
import {NotifyService} from "../../../../module/notify/notify.service";

@Component({
  selector: 'app-edit-dimension',
  templateUrl: './edit-dimension.component.html',
  styleUrls: ['./edit-dimension.component.scss']
})
export class EditDimensionComponent implements OnInit, OnChanges {

  @Input() stringIdArray: any;
  @Input() parentData: any;
  @Input() publisher_model: any;
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

  public editDimensionData = {
    "dimensions": {
    }
  };
  public publisherOption = {};
  public dimensionsData = [];
  public showSingleKeywordData = {};
  public campaignInfo = {};
  public groupData = {};
  public accountInfo = {};
  public iswraing = false;

  ngOnInit() {
    this._showDimensionList();

    if (this.parentData.selected_data.length === 1) {
      switch (this.summaryType) {
        case 'keyword':
          this._showSingleKeyword();
          break;
        case 'campaign':
          this._showCampaign();
          break;
        case 'adgroup':
          this._showAdgroup();
          break;
        case 'account':
          this._showAccount();
          break;
      }
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
          this._showDimensionSetting(result.data['dimensions']);
        }
      }
    );
  }

  _showCampaign() {
    this._http.showCampaign ({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_campaign_id": this.parentData.selected_data[0].pub_campaign_id
    }).subscribe(
      (result) => {
        this.campaignInfo = result.data;
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

  _showAdgroup() {
    this._http.showAdgroup({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_adgroup_id": this.parentData.selected_data[0].pub_adgroup_id
    }).subscribe(
      (result) => {
        if ( result.status_code === 200 ) {
          this.groupData = result.data;
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

  _showAccount() {
    this._http.showAccount({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id
    }).subscribe(
      (result) => {
        if ( result.status_code === 200 ) {
          this.accountInfo = result['data'];
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

  edit(data) {
    data.state = true;
  }
  sure(data) {
    data.state = false;
  }
  cancel_dimension(data) {
    data.state = false;
  }

  addDimension() {
    const add_modal = this.modalService.create({
      nzTitle: '创建维度',
      nzWidth: 600,
      nzContent: AddViewDimensionComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'data-view-modal',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this._showDimensionList();
      }
    });
  }


  checkPage() {

  }



  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {
        this.is_saving.emit({
          'is_saving': true,
          'isHidden': 'true'
        });
        this.editDimensionData['select_type'] = this.parentData.selected_type;

        this.editDimensionData['pub_type'] = this.summaryType;
        if (this.parentData.selected_type === 'all') {
          this.editDimensionData['sheets_setting'] = {
            'table_setting': this.parentData.allViewTableData
          };
        } else {
          this.editDimensionData['pub_ids'] = this.stringIdArray;
        }
        this.dimensionsData.forEach((item) => { //添加维度参数
          if (item.state === false) {
            item.value ? this.editDimensionData.dimensions[item.key] = item.value : this.editDimensionData.dimensions[item.key] = '';
          }
        });

        let editType = '';
        if (this.parentData.selected_data.length === 1) {
          editType = 'single';
        } else {
          editType = 'batch';
        }
        this._http.updateDimension(this.editDimensionData , editType).subscribe(
          (result: any) => {
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'true'
            });
            const notifyData: any[] = [];
            const userOperdInfo = this.authService.getCurrentUserOperdInfo();

            if (result.status_code === 200 ) {
              localStorage.removeItem('edit_state');
              this.message.success("已成功加入任务队列，请稍后查看");
              notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'dim' });
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

          });
      }


    }

  }



}
