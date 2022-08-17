import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from "ng-zorro-antd/modal";
import {NzMessageService} from "ng-zorro-antd/message";
import {LaunchService} from "../../../../../../module/launch/service/launch.service";
import {AuthService} from "../../../../../../core/service/auth.service";
import {deepCopy} from "@jzl/jzl-util";
import {AssetManagementService} from "../../../../asset-management.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-add-na-url-baidu',
  templateUrl: './add-na-url-baidu.html',
  styleUrls: ['./add-na-url-baidu.scss']
})
export class AddNaUrlBaiduComponent implements OnInit {
  validateAudienceForm: FormGroup;

  @Input() accountsList;
  @Input() isEdit;
  @Input() launchUrlId;
  @Input() isCopy;

  public cid;
  public submit=false;

  public defaultData = {
    chan_pub_id: null,  // 账户
    pub_account_id: null,
    pub_account_name: "",
    app_na_url_name: "",  // 渠道名称
    app_na_url: '',  // 落地页链接
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
      app_na_url_name: ['', [Validators.required]],
      app_na_url: ['', [Validators.required,Validators.pattern(/(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/)]],
    });
  }
  ngOnInit() {
    // this.getDownloadLinkUrl();
    if (this.isEdit) {
      this.getLaunchUrlDetail();
    }
  }

  // 获取渠道详情
  getLaunchUrlDetail() {
    this.assetManagementService
      .getNaUrlDetail(this.launchUrlId, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            const data = deepCopy(results['data']);
            this.defaultData.chan_pub_id = Number(data.chan_pub_id);
            this.defaultData.pub_account_id = data.pub_account_id;
            this.defaultData.pub_account_name = data.pub_account_name;
            this.defaultData.app_na_url_name = data.app_na_url_name;
            this.defaultData.app_na_url = data.app_na_url;
            if(this.isCopy) {
              this.isEdit = false;
              this.defaultData.app_na_url_name = data.app_na_url_name + '-复制';
            }
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
      this.assetManagementService.updateNaUrl(this.launchUrlId,resultData).subscribe(data => {
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
      this.assetManagementService.createNaUrl(resultData).subscribe(data => {
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
