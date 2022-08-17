import { isArray } from '@jzl/jzl-util';
import {Component, Input, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { deepCopy, formatDate } from '@jzl/jzl-util';
import { AssetManagementService } from './../../asset-management.service';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { AuthService } from 'src/app/core/service/auth.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";
import { LaunchRpaService } from 'src/app/routes/launch-rpa/service/launch-rpa.service';
@Component({
  selector: 'app-sync-custom-audience',
  templateUrl: './sync-custom-audience.component.html',
  styleUrls: ['./sync-custom-audience.component.scss'],
  providers: [LaunchRpaService]
})
export class SyncCustomAudienceComponent implements OnInit {
  @Input() materialType='audience';
  validateAudienceForm: FormGroup;
  public accountsList = [];
  public uploadAjax = null;
  public isSaving = false;
  public allAccountCheck = false;
  public reqParams = {
    chan_pub_ids: [],//推送的账户
  }
  constructor(
    private fb: FormBuilder,
    private assetManagementService: AssetManagementService,
    private message: NzMessageService,
    public menuService: MenuService,
    private authService: AuthService,
    private updateModal: NzModalRef,
    public launchRpaService: LaunchRpaService,
  ) {
    this.validateAudienceForm = this.fb.group({
      chan_pub_ids: [[], [Validators.required]],
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
    if (this.reqParams.chan_pub_ids.length < 1) {
      this.message.warning('请选择账户')
      return;
    }
    this.isSaving = true;
    this.uploadAjax = this.launchRpaService.syncMaterialJob(this.menuService.currentPublisherId, this.materialType, this.reqParams.chan_pub_ids, []).subscribe(result => {
      if (result) {
        this.updateModal.destroy('onOk');
      }
      this.isSaving = false;
    });

  }

  changeAccount() {
    if (this.accountsList.length > 0 && this.reqParams.chan_pub_ids.length === this.accountsList.length) {
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
    this.reqParams.chan_pub_ids = chan_pub_ids;
  }

}
