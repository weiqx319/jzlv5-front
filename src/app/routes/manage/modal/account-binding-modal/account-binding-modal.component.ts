import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Observable } from "rxjs";
import { ManageService } from "../../service/manage.service";
import { isObject, isUndefined } from "@jzl/jzl-util";
import { MenuService } from '../../../../core/service/menu.service';
import { AuthService } from './../../../../core/service/auth.service';
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";
@Component({
  selector: 'app-account-binding-modal',
  templateUrl: './account-binding-modal.component.html',
  styleUrls: ['./account-binding-modal.component.scss']
})
export class AccountBindingModalComponent implements OnInit {

  validateAccountBindingForm: FormGroup;
  image_loading = false;

  @Input() accountLabelList = [];
  @Input() chanPubId = 0;
  @Input() type = "";

  @Input()
  set setting(data: any) {
    this.accountSetting = Object.assign(this.accountSetting, data);
  }
  public companyId = null;
  public productTypes = [];//所有可用渠道、媒体
  public saveing = false;
  public accountSetting = {
    cid: null,
    publisher_id: 1,
    pub_account_name: '',
    pub_password: '',
    promo_domain_pc: '',
    promo_domain_wap: '',
    display_domain_pc: '',
    display_domain_wap: '',
    discount: 0,
    account_label: '',
    account_comment: '',
    verify_code: '',
    channel_id: 1,
    rank_type: '',
    owner_id: '',
    app_id: '',
    app_secret: '',
    attribution_channel: 1,
    attribution_publisher: 1,//数据归属媒体
    // 账户标签列表
    account_custom_label: {},
  };
  public advertiserList = [];

  public publishers = [];
  public allPublishers = [];
  public allChannels = [];
  public verificationImg = '/assets/loading.gif';
  public token = '';
  public isShowDomain = false;
  //渠道
  public channelObject: Object;
  public channel_name;


  constructor(
    private fb: FormBuilder,
    private manageService: ManageService,
    private message: NzMessageService,
    private subject: NzModalRef,
    public menuService: MenuService,
    public authService: AuthService,
    private customDataService: CustomDatasService,
  ) {
    this.customDataService.dealPublisherNewData().then(() => {
      this.allPublishers = [...this.customDataService.publisherNewArray];
    });
    this.customDataService.dealChannelData().then(() => {
      this.allChannels = [...this.customDataService.channelArray];
    });

    this.productTypes = JSON.parse(JSON.stringify(this.menuService.productTypes));
    const semChannel = this.productTypes.find(item => item.channel_id === 1);
    if (semChannel) {
      semChannel.name = '搜索推广';
    }
    this.companyId = this.authService.getCurrentUser().company_id;
  }
  // 初始化赋值
  initFormGroupObj() {
    const formGroupObj = {
      cid: [0, [Validators.required]],
      publisher_id: [1, [Validators.required]],
      pub_account_name: ['', [Validators.required]],
      pub_password: ['', [Validators.required]],
      // pub_password: [''],
      promo_domain_pc: [''],
      promo_domain_wap: [''],
      display_domain_pc: [''],
      display_domain_wap: [''],
      discount: [0, [Validators.required], [this.cashCountValidator]],
      account_label: [''],
      account_comment: [''],
      channel_id: [''],
      rank_type: [''],
      attribution_channel: [1],
      attribution_publisher: [1],
    };

    this.accountLabelList.forEach(item => {
      formGroupObj[item.key] = [''];
    });
    this.validateAccountBindingForm = this.fb.group(formGroupObj);
  }

  // 初始化赋值
  initAccountSetting() {
    this.accountLabelList.forEach(item => {
      this.accountSetting.account_custom_label[item.key] = '';
    });
  }
  publisherChange() {
    if (this.accountSetting.publisher_id === 2) {
      this.validateAccountBindingForm.removeControl('display_domain_pc');
      this.validateAccountBindingForm.removeControl('display_domain_wap');
      this.validateAccountBindingForm.addControl('display_domain_pc', new FormControl('', Validators.required));
      this.validateAccountBindingForm.addControl('display_domain_wap', new FormControl('', Validators.required));
    } else {
      this.validateAccountBindingForm.removeControl('display_domain_pc');
      this.validateAccountBindingForm.removeControl('display_domain_wap');
      this.validateAccountBindingForm.addControl('display_domain_pc', new FormControl(''));
      this.validateAccountBindingForm.addControl('display_domain_wap', new FormControl(''));
    }
    if (this.accountSetting.publisher_id !== 1) {
      if (this.chanPubId > 0) {
        this.validateAccountBindingForm.removeControl('image_token');
      } else {
        this.validateAccountBindingForm.addControl('image_token', new FormControl('', Validators.required));
      }
    } else {
      this.validateAccountBindingForm.removeControl('image_token');
    }
    if (this.accountSetting.publisher_id === 13 || this.accountSetting.publisher_id === 14 || this.accountSetting.publisher_id === 15) {
      this.validateAccountBindingForm.removeControl('image_token');
      this.validateAccountBindingForm.addControl('owner_id', new FormControl('', Validators.required));
      this.validateAccountBindingForm.addControl('app_id', new FormControl('', Validators.required));
      this.validateAccountBindingForm.addControl('app_secret', new FormControl('', Validators.required));
      if (this.accountSetting.publisher_id === 15) {
        this.validateAccountBindingForm.removeControl('owner_id');
      }
    }

    if (this.accountSetting.publisher_id === 16) {
      this.validateAccountBindingForm.removeControl('image_token');
      this.validateAccountBindingForm.removeControl('app_id');
      this.validateAccountBindingForm.removeControl('app_secret');
      // this.validateAccountBindingForm.addControl('app_id', new FormControl('', Validators.required));
      // this.validateAccountBindingForm.addControl('app_secret', new FormControl('', Validators.required));
    }

    // vivo删除账户名称、app_id、app_secret
    if (this.accountSetting.publisher_id === 15) {
      this.validateAccountBindingForm.removeControl('pub_account_name');
      this.validateAccountBindingForm.removeControl('app_id');
      this.validateAccountBindingForm.removeControl('app_secret');
    }

    this.getImgByPublisherId(this.accountSetting.publisher_id);
  }

  cashCountValidator = (control: FormControl): any => {
    const _that = this;
    return Observable.create(function (observer) {
      if (typeof Number(control.value) !== 'number' || control.value < 0) {
        observer.next({ error: true });
      } else {
        observer.next(null);
      }
      observer.complete();
    });
  }


  cancel() {
    this.subject.destroy('onCancel');
  }


  doSave() {
    // 账户标签去前后空格
    if (this.accountSetting.account_custom_label) {
      for (const key in this.accountSetting.account_custom_label) {
        this.accountSetting.account_custom_label[key] = this.accountSetting.account_custom_label[key] ? this.accountSetting.account_custom_label[key].trim() : '';
      }
    }
    if (!this.saveing) {
      this.saveing = true;
      if (this.chanPubId > 0) { //编辑
        const accountSetting = { chan_pub_id: this.chanPubId, ...this.accountSetting };
        this.manageService.updateAccount(this.chanPubId, accountSetting).subscribe(data => {
          this.saveing = false;
          if (data['status_code'] && data.status_code === 200) {
            this.message.success('保存成功');
            this.subject.destroy('onOk');
          } else if (data['status_code'] && data.status_code === 201) {
            this.message.error('广告主名称已经存在，请重试', { nzDuration: 10000 });
          } else if (data['status_code'] && data.status_code === 401) {
            this.message.error('您没权限对此操作！', { nzDuration: 10000 });
            this.cancel();
          } else if (data['status_code'] && data.status_code === 500) {
            this.message.error('系统异常，请重试', { nzDuration: 10000 });
          } else if (data['status_code'] && data.status_code === 404) {
            this.message.error('接口未实现，找言十', { nzDuration: 10000 });
          } else {
            this.message.error(data.message, { nzDuration: 10000 });
          }
        }, (err) => {
          this.saveing = false;
          this.message.error('系统异常，请重试', { nzDuration: 10000 });
        });
      } else { //添加
        if (this.accountSetting.publisher_id !== 1) {
          this.accountSetting['image_token'] = this.token;
        }
        this.manageService.createAccount(this.accountSetting).subscribe(data => {
          this.saveing = false;
          if (data['status_code'] && data.status_code === 200) {
            this.message.success('保存成功');
            this.subject.destroy('onOk');
          } else if (data['status_code'] && data.status_code === 103) {
            this.message.error('用户名错误，请重试', { nzDuration: 10000 });
          } else if (data['status_code'] && data.status_code === 104) {
            this.message.error('密码错误，请重试', { nzDuration: 10000 });
          } else if (data['status_code'] && data.status_code === 105) {
            this.message.error('用户名或密码错误，请重试', { nzDuration: 10000 });
          } else if (data['status_code'] && data.status_code === 106) {
            this.message.error('验证码错误，请重试', { nzDuration: 10000 });
          } else if (data['status_code'] && data.status_code === 201) {
            this.message.error(data['message'], { nzDuration: 10000 });
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
          if (data['status_code'] && data.status_code !== 200) {
            this.getImage();
          }
        }, (err) => {

          this.saveing = false;
          this.message.error('系统异常，请重试', { nzDuration: 10000 });
        });
      }
    }

  }


  getImage() {
    this.image_loading = false;
    this.getImgByPublisherId(this.accountSetting.publisher_id);
  }

  getImgByPublisherId(id) {
    this.image_loading = false;
    if (id !== 1) {
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

  getAccountInfo(chanPubId) {
    this.manageService.getAccountInfo(chanPubId).subscribe(
      (result) => {
        if (result['status_code'] === 200) {
          Object.assign(this.accountSetting, result['data']);
          if (!(isObject(this.accountSetting.account_custom_label) && this.accountSetting.account_custom_label.constructor == Object)) {
            this.accountSetting.account_custom_label = {};
          }
        }
      }
    );
  }
  ngOnInit() {
    this.initFormGroupObj();
    this.initAccountSetting();
    if (this.chanPubId) {//编辑
      this.getAccountInfo(this.chanPubId);
      this.validateAccountBindingForm.removeControl('pub_password');
    } else {
      // this.publishers.splice(1 , 1);
    }

    this.getImgByPublisherId(this.accountSetting.publisher_id);

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
        this.message.error('广告主名称已经存在，请重试', { nzDuration: 10000 });
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！', { nzDuration: 10000 });
        this.cancel();
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      } else {
        this.message.error(result.message, { nzDuration: 10000 });
      }
    }, (err) => {

      this.message.error('系统异常，请重试', { nzDuration: 10000 });
    }
    );

    if (this.chanPubId > 0) {
      this.channelObject = this.manageService.getAccountChannelObject();
      this.channel_name = this.channelObject['channel_' + this.accountSetting.channel_id]['label'];
    }
  }

  getFormControl(name) {
    return this.validateAccountBindingForm.controls[name];
  }

  setDomain() {
    this.isShowDomain = !this.isShowDomain;
  }

}
