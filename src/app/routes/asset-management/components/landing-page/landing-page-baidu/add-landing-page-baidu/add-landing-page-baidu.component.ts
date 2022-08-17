import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from "ng-zorro-antd/modal";
import {NzMessageService} from "ng-zorro-antd/message";
import {LaunchService} from "../../../../../../module/launch/service/launch.service";
import {AuthService} from "../../../../../../core/service/auth.service";
import {deepCopy} from "@jzl/jzl-util";
import {AssetManagementService} from "../../../../asset-management.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-add-landing-page-baidu',
  templateUrl: './add-landing-page-baidu.component.html',
  styleUrls: ['./add-landing-page-baidu.component.scss']
})
export class AddLandingPageBaiduComponent implements OnInit {
  validateAudienceForm: FormGroup;

  @Input() accountsList;
  @Input() isEdit;
  @Input() launchUrlId;
  @Input() isCopy;

  public landingTypeList = [
    {key: '1', name: '网站链接'},
    {key: '2', name: '应用下载（IOS）'},
    {key: '3', name: '应用下载（Android）'},
  ];

  public cid;
  public submit=false;
  public structConfig: any = {};

  public structConfigLoading = true;

  public downloadUrlList: any = [];
  public isExternalUrlChanged = false;

  public defaultData = {
    chan_pub_id: null,  // 账户
    pub_account_id: null,
    pub_account_name: "",
    subject: '1',  // 推广目的
    custom_landing_page_name: "",  // 渠道名称
    custom_landing_page_url: '',  // 落地页链接
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
      subject: ['1', [Validators.required]],
      custom_landing_page_name: ['', [Validators.required]],
      custom_landing_page_url: ['', [Validators.required,Validators.pattern(/(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/)]],
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
      .getLaunchUrlDetailByBd(this.launchUrlId, {
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
            this.defaultData.subject = data.subject;
            this.defaultData.custom_landing_page_name = data.custom_landing_page_name;
            this.defaultData.custom_landing_page_url = data.custom_landing_page_url;
            if(this.isCopy) {
              this.isEdit = false;
              this.defaultData.custom_landing_page_name = data.custom_landing_page_name + '-复制';
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

  externalUrlBlur() {
    if (!this.isExternalUrlChanged) {
      return;
    }
  }
  doSave() {
    if (this.submit) {
      return;
    }
    this.submit=true;

    const resultData = deepCopy(this.defaultData);

    if (this.isEdit) {
      this.assetManagementService.updateUrlByBd(this.launchUrlId,resultData).subscribe(data => {
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
      this.assetManagementService.createUrlByBd(resultData).subscribe(data => {
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
