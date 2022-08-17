import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from "ng-zorro-antd/modal";
import {NzMessageService} from "ng-zorro-antd/message";
import {AuthService} from "../../../../../../../../core/service/auth.service";
import {AssetManagementService} from "../../../../../../asset-management.service";
import {deepCopy} from "@jzl/jzl-util";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-add-download-app-ios',
  templateUrl: './add-download-app-ios.component.html',
  styleUrls: ['./add-download-app-ios.component.scss']
})
export class AddDownloadAppIosComponent implements OnInit {
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
    "app_url": ""
  };

  constructor(
    private fb: FormBuilder,
    private modalSubject: NzModalRef,
    private message: NzMessageService,
    private authService: AuthService,
    private assetManagementService: AssetManagementService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.validateAudienceForm = this.fb.group({
      chan_pub_id: ['', [Validators.required]],
      app_name: ['', [Validators.required]],
      app_url: ['', [Validators.required,Validators.pattern(/(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/)]],
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
      .getDownloadAppDetailIos(this.launchUrlId, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            const data = deepCopy(results['data']);
            this.defaultData= {...this.defaultData,...data};
            this.defaultData.chan_pub_id=Number(this.defaultData.chan_pub_id);
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
      this.assetManagementService.updateDownloadAppIos(this.launchUrlId,resultData).subscribe(data => {
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
      this.assetManagementService.createDownloadAppIos(resultData).subscribe(data => {
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


}
