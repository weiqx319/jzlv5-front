import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from "ng-zorro-antd/modal";
import {NzMessageService} from "ng-zorro-antd/message";
import {AuthService} from "../../../../../../../../core/service/auth.service";
import {AssetManagementService} from "../../../../../../asset-management.service";
import {deepCopy} from "@jzl/jzl-util";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-add-download-app-android',
  templateUrl: './add-download-app-android.component.html',
  styleUrls: ['./add-download-app-android.component.scss']
})
export class AddDownloadAppAndroidComponent implements OnInit {
  validateAudienceForm: FormGroup;

  @Input() accountsList;
  @Input() isEdit;
  @Input() launchUrlId;
  @Input() isCopy;

  public cid;
  public submit=false;

  public defaultData = {
    "chan_pub_id": null,
    "pub_account_id": null,
    "pub_account_name": "",
    "app_name": "",
    "apk_name": "",
    "app_url": "",
    "doc_id": null,
    "channel_id": null,
    "channel_package": "",
    "app_status": null
  };
  public appList=[];

  constructor(
    private fb: FormBuilder,
    private modalSubject: NzModalRef,
    private message: NzMessageService,
    private authService: AuthService,
    private assetManagementService: AssetManagementService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.validateAudienceForm = this.fb.group({
      chan_pub_id: ['', [Validators.required]],
      app_url: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    if (this.isEdit) {
      this.getDetail();
    }
  }

  // 获取详情
  getDetail() {
    this.assetManagementService
      .getDownloadAppDetailAndroid(this.launchUrlId, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            const data = deepCopy(results['data']);
            this.defaultData= {...this.defaultData,...data};
            this.defaultData.chan_pub_id=Number(this.defaultData.chan_pub_id);
            this.getAppList();
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  changeAccount(id) {
    const data = this.accountsList.find(item => id == item.chan_pub_id);
    if (data) {
      this.defaultData.pub_account_id = data.pub_account_id;
      this.defaultData.pub_account_name = data.pub_account_name;
      this.getAppList();
    }
  }
  changeApp(id) {
    const data = this.appList.find(item => id == item.app_url);
    if (data) {
      this.defaultData= {...this.defaultData,...data};
    }
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    if (this.submit) {
      return;
    }
    this.submit=true;
    const resultData = deepCopy(this.defaultData);

    if (this.isEdit) {
      this.assetManagementService.updateDownloadAppAndroid(this.launchUrlId,resultData).subscribe(data => {
        if (data['status_code'] && data.status_code === 200) {
          this.message.success(data.message);
          this.modalSubject.destroy('onOk');
        } else {
          this.message.error(data.message);
        }
      }, (err) => {

      }, () => {
        this.submit=false;
      });
    } else {
      this.assetManagementService.createDownloadAppAndroid(resultData).subscribe(data => {
        if (data['status_code'] && data.status_code === 200) {
          this.message.success(data.message);
          this.modalSubject.destroy('onOk');
        } else {
          this.message.error(data.message);
        }
      }, (err) => {

      }, () => {
        this.submit=false;
      });
    }
  }
  getFormControl(name) {
    return this.validateAudienceForm.controls[name];
  }

  getAppList() {
    const body= {
      "chan_pub_id": this.defaultData.chan_pub_id,
    };
    this.assetManagementService.getAppList(body).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        this.appList=result.data;
      } else {
        this.message.error(result.message);
      }
    }, (err) => {

    }, () => {

    });
  }


}
