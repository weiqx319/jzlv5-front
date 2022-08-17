import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ManageService } from "../../service/manage.service";
import { isUndefined } from "@jzl/jzl-util";
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-account-binding-set-password',
  templateUrl: './account-binding-set-password.component.html',
  styleUrls: ['./account-binding-set-password.component.scss']
})
export class AccountBindingSetPasswordComponent implements OnInit {
  validateAccountBindingForm: FormGroup;
  public productInfo = {};

  @Input() chanPubId = 0;
  @Input()
  set setting(data: any) {
    this.accountSetting = Object.assign(this.accountSetting, data);
  }
  constructor(private fb: FormBuilder,
    private manageService: ManageService,
    private message: NzMessageService,
    private productService: ProductDataService,
    private subject: NzModalRef) {
    this.validateAccountBindingForm = this.fb.group({
      cid: [''],
      publisher_id: [''],
      pub_account_name: [''],
      pub_password: ['', [Validators.required]],
      is_jzl: ['1', [Validators.required]],
    });
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }
  public accountSetting: any = {
    "cid": 50027,
    "publisher_id": 0,
    "pub_password": '',
    "image_token": '',
    "verify_code": "",
    "is_jzl": '1',
  };
  public saveing = false;
  public advertiserList = [];
  public image_loading = false;
  public verificationImg = '/assets/loading.gif';
  public token = '';
  public publishers = [
    { publisher_name: '百度', publisher_id: 1 },
    { publisher_name: '搜狗', publisher_id: 2 },
    { publisher_name: '360', publisher_id: 3 },
    { publisher_name: '神马', publisher_id: 4 },
    { publisher_name: '广点通', publisher_id: 6 },
    { publisher_name: '头条', publisher_id: 7 },
    { publisher_name: '小米', publisher_id: 13 },
    { publisher_name: 'OPPO', publisher_id: 14 },
    { publisher_name: 'VIVO', publisher_id: 15 },
    { publisher_name: '快手', publisher_id: 16 },
    { publisher_name: '超级汇川', publisher_id: 17 },
    { publisher_name: '知乎', publisher_id: 18 },
    { publisher_name: '小红书', publisher_id: 24 },
  ];
  public gruntUrl = '';
  //定时器
  public timer;
  public isVisible = false;
  ngOnInit() {
    this.manageService.getAdvertiserList({}, { result_model: 'all', need_publish_account: 0 }).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        this.advertiserList = result['data'];
        if (this.accountSetting['cid'] && this.accountSetting['cid'] > 0) {
          const findCid = this.advertiserList.find(item => item.cid === this.accountSetting['cid']);
          if (isUndefined(findCid)) {
            this.accountSetting['cid'] = this.advertiserList[0]['cid'];
          }
        } else {
          this.accountSetting['cid'] = this.advertiserList[0]['cid'];
        }
      } else if (result['status_code'] && result.status_code === 201) {
        this.message.error('广告主名称已经存在，请重试');
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
        this.cancel();
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else {
        this.message.error(result.message);
      }
    }, (err) => {

      this.message.error('系统异常，请重试');
    }
    );

    if (this.accountSetting.publisher_id !== 1 && this.accountSetting.publisher_id !== 6&& this.accountSetting.publisher_id !== 24) {
      this.validateAccountBindingForm.addControl('image_token', new FormControl('', Validators.required));
      this.getImgByPublisherId(this.accountSetting.publisher_id);
    } else {
      this.validateAccountBindingForm.removeControl('image_token');
    }
    if (this.accountSetting.publisher_id === 6) {
      this.validateAccountBindingForm.removeControl('pub_account_name');
      this.validateAccountBindingForm.removeControl('pub_password');
    } else {
      this.validateAccountBindingForm.addControl('pub_account_name', new FormControl(''));
      this.validateAccountBindingForm.addControl('pub_password', new FormControl('', Validators.required));
    }

    if (this.accountSetting.publisher_id === 13 || this.accountSetting.publisher_id === 14 || this.accountSetting.publisher_id === 15) {
      this.validateAccountBindingForm.removeControl('image_token');
      this.validateAccountBindingForm.removeControl('pub_password');
      this.validateAccountBindingForm.addControl('owner_id', new FormControl('', Validators.required));
      this.validateAccountBindingForm.addControl('app_id', new FormControl('', Validators.required));
      this.validateAccountBindingForm.addControl('app_secret', new FormControl('', Validators.required));
      if (this.accountSetting.publisher_id === 15) {
        this.validateAccountBindingForm.removeControl('owner_id');
      }
    }
    if (this.accountSetting.publisher_id === 17) {
      this.validateAccountBindingForm.removeControl('image_token');
      this.validateAccountBindingForm.addControl('pub_password', new FormControl('', Validators.required));
      this.validateAccountBindingForm.addControl('pub_token', new FormControl('', Validators.required));
    }

    if (this.accountSetting.publisher_id === 3) {
      this.validateAccountBindingForm.removeControl('image_token');
      if (this.accountSetting.app_id && this.accountSetting.app_secret) {
        this.validateAccountBindingForm.addControl('app_id', new FormControl('', Validators.required));
        this.validateAccountBindingForm.addControl('app_secret', new FormControl('', Validators.required));
        this.accountSetting['is_jzl'] = '0';
      } else {
        this.accountSetting['is_jzl'] = '1';
      }
    }

    this.getAccountInfo(this.chanPubId);
  }


  getAccountInfo(chanPubId) {
    this.manageService.getAccountInfo(chanPubId).subscribe(
      (result) => {
        if (result['status_code'] === 200) {
          Object.assign(this.accountSetting, result['data']);
        }
      }
    );
  }

  getImage() {
    this.image_loading = false;
    this.getImgByPublisherId(this.accountSetting.publisher_id);
  }

  getImgByPublisherId(id) {
    this.image_loading = false;
    if (id !== 1 && id !== 3) {
      this.manageService.getCodeImage(id).subscribe(
        (result) => {
          if (result['status_code'] === 200) {
            this.verificationImg = result['data']['verifycode'];
            this.token = result['data']['token'];
            if (this.verificationImg) {
              this.image_loading = true;
            }
          }

        }
      );
    }
  }
  cancel() {
    this.timer && clearInterval(this.timer);
    this.subject.destroy('onCancel');
  }
  doSave() {
    if (this.accountSetting.publisher_id !== 1) {
      this.accountSetting['image_token'] = this.token;
    }

    if (!this.saveing) {
      this.saveing = true;
      if (this.accountSetting.publisher_id !== 6) {
        this.manageService.updateAccountPassword(this.chanPubId, this.accountSetting).subscribe(
          (result) => {
            this.saveing = false;
            if (result['status_code'] && result.status_code === 200) {
              this.message.success('保存成功');
              this.subject.destroy('onOk');
            } else if (result['status_code'] && result.status_code === 106) {
              this.message.error('验证码错误，请重试', { nzDuration: 10000 });
            } else if (result['status_code'] && result.status_code === 301) {
              this.message.error('内部错误，请重试', { nzDuration: 10000 });
            } else if (result['status_code'] && result.status_code === 401) {
              this.message.error('您没权限对此操作！', { nzDuration: 10000 });
              this.cancel();
            } else if (result['status_code'] && result.status_code === 500) {
              this.message.error('系统异常，请重试', { nzDuration: 10000 });
            } else if (result['status_code'] && result.status_code === 404) {
              this.message.error('接口未实现，找言十', { nzDuration: 10000 });
            } else {
              this.message.error(result.message, { nzDuration: 10000 });
            }

            if (result['status_code'] && result.status_code !== 200) {
              this.getImage();
            }

          }, (err) => {
            this.saveing = false;
            this.message.error('系统异常，请重试', { nzDuration: 10000 });
          });
      } else {
        this.manageService.updateGdtHasAccount(this.chanPubId, this.accountSetting).subscribe(data => {
          this.saveing = false;
          if (data['status_code'] && data.status_code === 200) {
            this.gruntUrl = `https://developers.e.qq.com/oauth/authorize?client_id=1107901980&redirect_uri=https://v5.jiuzhilan.com/v5/oauth/eqq&scope=&state=${data['data']['state_id']}`;
            const newWindow = window.open(this.gruntUrl);
            this.isVisible = true;
            this.timer = setInterval(() => {
              this.manageService.checkAccountOauthState(data.data.state_id).subscribe(data => {
                if (data.data.status > 0) {
                  this.saveing = false;
                  newWindow.close();
                  this.isVisible = false;
                  this.message.success('保存成功');
                  this.subject.destroy('onOk');
                  clearInterval(this.timer);
                }
              });
            }, 5000);
          } else if (data['status_code'] && data.status_code === 301) {
            this.message.error('内部错误，请重试', { nzDuration: 10000 });
          } else if (data['status_code'] && data.status_code === 401) {
            this.message.error('您没权限对此操作！', { nzDuration: 10000 });
            this.cancel();
          } else if (data['status_code'] && data.status_code === 500) {
            this.message.error('系统异常，请重试', { nzDuration: 10000 });
          } else {
            this.message.error(data.message, { nzDuration: 10000 });
          }
        }, (err) => {

          this.saveing = false;
          this.message.error('系统异常，请重试', { nzDuration: 10000 });
        });
      }
    }



  }

  getFormControl(name) {
    return this.validateAccountBindingForm.controls[name];
  }

  jzlTypeChange() {
    if (this.accountSetting.publisher_id === 17) {
      this.accountSetting.verify_code = "";
      this.accountSetting.pub_token = "";
      if (this.accountSetting.is_jzl !== '2') {
        this.validateAccountBindingForm.addControl('pub_token', new FormControl('', Validators.required));
        this.validateAccountBindingForm.removeControl('image_token');
      } else {
        this.validateAccountBindingForm.removeControl('pub_token');
        this.validateAccountBindingForm.addControl('image_token', new FormControl('', Validators.required));
      }
    } else if (this.accountSetting.publisher_id === 3) {
      if (this.accountSetting.is_jzl === '1') {
        this.validateAccountBindingForm.removeControl('app_id');
        this.validateAccountBindingForm.removeControl('app_secret');
      } else {
        this.validateAccountBindingForm.addControl('app_id', new FormControl('', Validators.required));
        this.validateAccountBindingForm.addControl('app_secret', new FormControl('', Validators.required));
      }
    }

  }
}
