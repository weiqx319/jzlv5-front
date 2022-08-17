import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { AssetManagementService } from './../../asset-management.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { MenuService } from 'src/app/core/service/menu.service';

@Component({
  selector: 'app-push-account',
  templateUrl: './push-account.component.html',
  styleUrls: ['./push-account.component.scss']
})
export class PushAccountComponent implements OnInit {
  @Input() custom_audience_id;
  @Input() chan_pub_id;
  validateAudienceForm: FormGroup;
  public accountsList = [];
  public uploadAjax = null;
  public allAccountCheck = false;
  public reqParams = {
    custom_audience_id: '',//人群包id
    push_chan_pub_ids: [],//推送的账户
    chan_pub_id: '',//人群包所属账户
  }
  public isSaving = false;
  constructor(
    private fb: FormBuilder,
    private assetManagementService: AssetManagementService,
    private message: NzMessageService,
    public menuService: MenuService,
    private authService: AuthService,
    private updateModal: NzModalRef,
  ) {
    this.validateAudienceForm = this.fb.group({
      push_chan_pub_ids: [[], [Validators.required]],
    });
  }


  ngOnInit(): void {
    this.getAccountList();

  }

  getAccountList() {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": this.menuService.currentPublisherId
        },
        {
          "key": "channel_id",
          "name": "",
          "op": "=",
          "value": this.menuService.currentChannelId
        }
      ]
    };
    this.assetManagementService.getAccountList(body, {
      page: 1,
      count: 100000,
      cid: this.authService.getCurrentUserOperdInfo().select_cid,
      user_id: this.authService.getCurrentUserOperdInfo().select_uid,
    })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.accountsList = results['data']['detail'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }


  cancelModal(): void {
    if (this.uploadAjax) this.uploadAjax.unsubscribe();
    this.updateModal.destroy('onCancel');
  }

  getFormControl(name) {
    return this.validateAudienceForm.controls[name];
  }

  doSave() {
    if (this.reqParams.push_chan_pub_ids.length < 1) {
      this.message.warning('请选择账户')
      return;
    }

    this.reqParams.custom_audience_id = this.custom_audience_id;
    this.reqParams.chan_pub_id = this.chan_pub_id;
    this.isSaving = true;
    this.uploadAjax = this.assetManagementService.audiencePushAccount(this.reqParams).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          this.message.success(results.message);
          this.updateModal.destroy('onOk');
        } else {
          this.message.error(results.message);
        }
        this.isSaving = false;
      },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
        this.isSaving = false;
      },
      () => { },
    );

  }

  changeAccount() {
    if (this.accountsList.length > 0 && this.reqParams.push_chan_pub_ids.length === this.accountsList.length) {
      this.allAccountCheck = true;
    } else {
      this.allAccountCheck = false;
    }
  }

  checkAllAccount() {
    this.allAccountCheck = !this.allAccountCheck;
    const chan_pub_ids = [];
    if (this.allAccountCheck) {
      this.accountsList.forEach(item => {
        chan_pub_ids.push(item.chan_pub_id);
      });
    }
    this.reqParams.push_chan_pub_ids = chan_pub_ids;
  }


}
