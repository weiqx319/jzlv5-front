import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ManageService } from "../../service/manage.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTreeComponent, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Observable } from "rxjs";
import { deepCopy, isObject, isUndefined } from "@jzl/jzl-util";
import { MenuService } from '../../../../core/service/menu.service';
import { AuthService } from './../../../../core/service/auth.service';
import { ProductDataService } from "@jzl/jzl-product";
import { AccountBindingChannelJinniuComponent } from "../account-binding-channel-jinniu/account-binding-channel-jinniu.component";
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";

@Component({
  selector: 'app-account-binding-multi-channel',
  templateUrl: './account-binding-multi-channel.component.html',
  styleUrls: ['./account-binding-multi-channel.component.scss']
})
export class AccountBindingMultiChannelComponent implements OnInit {

  validateAccountBindingForm: FormGroup;
  image_loading = false;

  // 账户标签列表
  @Input() accountLabelList = [];
  @Input() account_id = 0;
  @Input() keeperList = [];
  public currentKeeperList = [];

  @Input()
  set setting(data: any) {
    this.accountSetting = Object.assign(this.accountSetting, data);
  }
  public checkedAccount = [];
  public companyId = null;

  public canUseKeeper = false;
  public isVisible = false;
  public googleVisible = false;
  public accountTreeVisible = false;
  public selectAccountData: NzTreeNodeOptions[] = [];
  public accountData: NzTreeNodeOptions[] = [];
  public facebookVisible = false;
  public facebookSelectVisible = false;
  public facebookSelectData = [];
  public googleCode = "";
  public googleSelectVisible = false;
  public googleSelectData = [];
  public googleSelectLoading =false;
  public zhihuVisible = false;
  public saveing = false;
  public accountSetting = {
    super_account_id: 0,
    pub_account_id: '',
    use_keeper: false,
    cid: null,
    publisher_id: 1,
    attribution_channel: 1,
    attribution_publisher: 1,
    pub_account_name: '',
    account_label: '',
    account_comment: '',
    pub_password: '',
    promo_domain_pc: '',
    promo_domain_wap: '',
    display_domain_pc: '',
    display_domain_wap: '',
    discount: 0,
    verify_code: '',
    channel_list: [],
    rank_type: 'click',
    owner_id: '',
    app_id: '',
    app_secret: '',
    pub_token: '',
    is_jzl: '1',
    // 账户标签列表
    account_custom_label: {}
  };
  public channel_id = 1;
  public advertiserList = [];
  public publishers = [];
  public allPublishers = [];
  public allChannels = [];
  public verificationImg = '/assets/loading.gif';
  public token = '';
  public isShowDomain = false;
  public gruntUrl = '';
  //定时器
  public timer;
  public productInfo = {};
  public productTypes = [];//所有可用渠道、媒体
  public searchAccountName = '';

  @ViewChild('nzTreeComponent') nzTreeComponent: NzTreeComponent;

  constructor(
    private fb: FormBuilder,
    private manageService: ManageService,
    private message: NzMessageService,
    private subject: NzModalRef,
    public menuService: MenuService,
    public authService: AuthService,
    private productService: ProductDataService,
    private modalService: NzModalService,
    private customDataService: CustomDatasService,
  ) {

    this.productTypes = JSON.parse(JSON.stringify(this.menuService.productTypes));
    const semChannel = this.productTypes.find(item => item.channel_id === 1);
    if (semChannel) {
      semChannel.name = '搜索推广';
      semChannel.children = [
        { name: '百度', publisher_id: 1 },
        { name: '搜狗', publisher_id: 2 },
        { name: '360', publisher_id: 3 },
        // { name: '神马', publisher_id: 4 },
        { name: 'google', publisher_id: 10 },
      ];
    }
    if (!this.productTypes.find(item => item.channel_id === this.channel_id)) {
      this.channel_id = this.productTypes[0].channel_id;
    }

    this.getPublishers();
    this.accountSetting.channel_list = [this.channel_id];
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });

    this.customDataService.dealPublisherNewData().then(() => {
      this.allPublishers = [...this.customDataService.publisherNewArray];
    });
    this.customDataService.dealChannelData().then(() => {
      this.allChannels = [...this.customDataService.channelArray];
    });

    this.companyId = this.authService.getCurrentUser().company_id;
  }
  //根据渠道初始化媒体
  getPublishers() {
    this.publishers = this.productTypes.find(item => item.channel_id === this.channel_id).children;
  }

  // 初始化formGroup
  initFormGroupObj() {
    const formGroupObj = {
      cid: [0, [Validators.required]],
      publisher_id: [1, [Validators.required]],
      pub_account_name: ['', [Validators.required]],
      account_label: [''],
      account_comment: [''],
      pub_password: ['', [Validators.required]],
      // pub_password: [''],
      promo_domain_pc: [''],
      promo_domain_wap: [''],
      display_domain_pc: [''],
      display_domain_wap: [''],
      channel_id: '',
      discount: [0, [Validators.required], [this.cashCountValidator]],
      rank_type: [''],
      use_keeper: [false],
      super_account_id: [0],
      attribution_channel: [1],
      attribution_publisher: [1],
      is_jzl: ['1', [Validators.required]],
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

  keeperChange() {
    if (this.accountSetting.use_keeper) {
      this.validateAccountBindingForm.removeControl('pub_password');
      this.validateAccountBindingForm.removeControl('pub_token');
      this.validateAccountBindingForm.removeControl('image_token');
    } else {
      this.validateAccountBindingForm.removeControl('pub_password');
      this.validateAccountBindingForm.addControl('pub_password', new FormControl('', Validators.required));

      if (this.accountSetting.publisher_id !== 1) {
        if (this.account_id > 0) {
          this.validateAccountBindingForm.removeControl('image_token');
        } else {
          if (this.accountSetting.publisher_id === 3 || this.accountSetting.publisher_id === 6 || this.accountSetting.publisher_id === 7 || this.accountSetting.publisher_id === 8 || this.accountSetting.publisher_id === 9 || this.accountSetting.publisher_id === 13 || this.accountSetting.publisher_id === 14 || this.accountSetting.publisher_id === 15 || this.accountSetting.publisher_id === 16 || this.accountSetting.publisher_id === 18 || this.accountSetting.publisher_id === 22 || this.accountSetting.publisher_id === 23 || this.accountSetting.publisher_id === 24) {
            this.validateAccountBindingForm.removeControl('image_token');
          } else {
            this.validateAccountBindingForm.removeControl('image_token');
            this.validateAccountBindingForm.addControl('image_token', new FormControl('', Validators.required));
          }
        }
      } else {
        this.validateAccountBindingForm.removeControl('image_token');
      }

      if (this.accountSetting.publisher_id === 17) {
        this.validateAccountBindingForm.removeControl('pub_token');
        this.validateAccountBindingForm.addControl('pub_token', new FormControl('', Validators.required));
      }

    }
  }

  publisherChange() {
    this.accountSetting.is_jzl = '1';
    this.currentKeeperList = this.keeperList.filter((item) => {
      return item['publisher_id'] == this.accountSetting.publisher_id && item['channel_id'] == this.channel_id;
    });

    if (this.currentKeeperList.length > 0) {
      this.canUseKeeper = true;
      this.accountSetting.super_account_id = this.currentKeeperList[0]['key'];
    } else {
      this.canUseKeeper = false;
      this.accountSetting.super_account_id = 0;
    }

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
      if (this.account_id > 0) {
        this.validateAccountBindingForm.removeControl('image_token');
      } else {
        if (this.accountSetting.publisher_id === 3 || this.accountSetting.publisher_id === 6 || this.accountSetting.publisher_id === 7 || this.accountSetting.publisher_id === 8 || this.accountSetting.publisher_id === 9 || this.accountSetting.publisher_id === 10 || this.accountSetting.publisher_id === 11 || this.accountSetting.publisher_id === 13 || this.accountSetting.publisher_id === 14 || this.accountSetting.publisher_id === 15 || this.accountSetting.publisher_id === 16 || this.accountSetting.publisher_id === 18 || this.accountSetting.publisher_id === 19 || this.accountSetting.publisher_id === 22 || this.accountSetting.publisher_id === 23 || this.accountSetting.publisher_id === 24) {
          this.validateAccountBindingForm.removeControl('image_token');
        } else {
          this.validateAccountBindingForm.addControl('image_token', new FormControl('', Validators.required));
        }
      }
    } else {
      this.validateAccountBindingForm.removeControl('image_token');
    }

    if (this.accountSetting.publisher_id === 6 || this.accountSetting.publisher_id === 7 || this.accountSetting.publisher_id === 8 || this.accountSetting.publisher_id === 9 || this.accountSetting.publisher_id === 10 || this.accountSetting.publisher_id === 11 || this.accountSetting.publisher_id === 16 || this.accountSetting.publisher_id === 22 || this.accountSetting.publisher_id === 23) {
      this.validateAccountBindingForm.removeControl('pub_account_name');
      this.validateAccountBindingForm.removeControl('pub_password');
    } else {
      this.validateAccountBindingForm.addControl('pub_account_name', new FormControl('', Validators.required));
      this.validateAccountBindingForm.addControl('pub_password', new FormControl('', Validators.required));
    }

    if (this.accountSetting.publisher_id === 13 || this.accountSetting.publisher_id === 14 || this.accountSetting.publisher_id === 15 || this.accountSetting.publisher_id === 16 || this.accountSetting.publisher_id === 19) {
      this.validateAccountBindingForm.removeControl('pub_password');
      this.validateAccountBindingForm.addControl('owner_id', new FormControl('', Validators.required));
      this.validateAccountBindingForm.addControl('app_id', new FormControl('', Validators.required));
      this.validateAccountBindingForm.addControl('app_secret', new FormControl('', Validators.required));
      if (this.accountSetting.publisher_id === 15 || this.accountSetting.publisher_id === 16) {
        this.validateAccountBindingForm.removeControl('owner_id');
      }
      if (this.accountSetting.publisher_id === 19) {
        this.validateAccountBindingForm.removeControl('pub_account_name');
      }
    } else {
      this.validateAccountBindingForm.removeControl('owner_id');
      this.validateAccountBindingForm.removeControl('app_id');
      this.validateAccountBindingForm.removeControl('app_secret');
    }

    if (this.accountSetting.publisher_id === 3) {
      this.validateAccountBindingForm.addControl('app_id', new FormControl('', Validators.required));
      this.validateAccountBindingForm.addControl('app_secret', new FormControl('', Validators.required));
    }

    if (this.accountSetting.publisher_id === 17) {
      this.validateAccountBindingForm.addControl('pub_token', new FormControl('', Validators.required));
    } else {
      this.validateAccountBindingForm.removeControl('pub_token');
    }

    if (this.accountSetting.publisher_id === 18) {
      this.validateAccountBindingForm.removeControl('pub_password');
    }
    // vivo删除账户名称、app_id、app_secret
    if (this.accountSetting.publisher_id === 15) {
      this.validateAccountBindingForm.removeControl('pub_account_name');
      this.validateAccountBindingForm.removeControl('app_id');
      this.validateAccountBindingForm.removeControl('app_secret');
    }

    if (this.accountSetting.publisher_id === 7) {
      this.accountSetting.attribution_channel = this.channel_id;
    }
    this.accountSetting.attribution_publisher = this.accountSetting.publisher_id;
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
    this.timer && clearInterval(this.timer);
    this.subject.destroy('onCancel');
  }

  handleAccountCancel() {
    this.message.success('保存成功');
    this.subject.destroy('onCancel');
  }


  getGoogleAccountTree(value) {
    if (String(value).length < 1) {
      this.message.error('请输入身份验证码');
      return;
    }
    const postData = {
      state: value,
    };
    if (!this.saveing) {
      this.saveing = true;
      this.googleSelectLoading=true;
      this.manageService.getGoogleAccountData(postData).subscribe(result => {
        this.saveing = false;
        this.googleSelectLoading=false;
        if (result.status_code == 200) {
          this.googleSelectVisible = true;
          this.googleSelectData = result['data'];

        } else {
          this.message.error(result.message);
        }


      }, err => {
        this.googleSelectLoading=false;
        this.saveing = false;

      });
    }

  }


  grantGoogle() {
    // this.getGoogleAccountTree('97caea2e-94e1-334c-a218-f67f979adcee');
    // return;
    this.manageService.createGoogleAuthUrl(this.accountSetting).subscribe(data => {
      this.saveing = false;
      if (data['status_code'] && data.status_code === 200) {
        this.gruntUrl = data['data']['url'];
        const newWindow = window.open(this.gruntUrl);
        this.isVisible = true;
        this.timer = setInterval(() => {
          this.manageService.checkGoogleOauthState(data['data']['state']).subscribe((checkData) => {

            if (checkData['status_code'] == 200) {
              if (checkData.data.status > 0) {
                this.saveing = false;
                newWindow.close();
                this.isVisible = false;
                this.getGoogleAccountTree(data['data']['state']);
                clearInterval(this.timer);
              }
            } else if (checkData['status_code'] && checkData.status_code === 301) {
              clearInterval(this.timer);
              this.message.error('内部错误，请重试', { nzDuration: 10000 });
            } else if (checkData['status_code'] && checkData.status_code === 401) {
              clearInterval(this.timer);
              this.message.error('您没权限对此操作！', { nzDuration: 10000 });
              this.cancel();
            } else if (checkData['status_code'] && checkData.status_code === 500) {
              clearInterval(this.timer);
              this.message.error('系统异常，请重试', { nzDuration: 10000 });
            } else {
              this.message.error(checkData.message, { nzDuration: 10000 });
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


  grantFacebook() {

    this.manageService.createFacebookAuthUrl(this.accountSetting).subscribe(data => {
      this.saveing = false;
      if (data['status_code'] && data.status_code === 200) {
        this.gruntUrl = data['data']['url'];
        const newWindow = window.open(this.gruntUrl);
        this.isVisible = true;
        this.timer = setInterval(() => {
          this.manageService.checkFacebookOauthState(data['data']['state']).subscribe((checkData) => {

            if (checkData['status_code'] == 200) {
              if (checkData.data.status > 0) {
                this.facebookSelectVisible = true;
                this.facebookSelectData = checkData['data']['list'];
                this.saveing = false;
                newWindow.close();
                this.isVisible = false;
                clearInterval(this.timer);
              }
            } else if (checkData['status_code'] && checkData.status_code === 301) {
              clearInterval(this.timer);
              this.message.error('内部错误，请重试', { nzDuration: 10000 });
            } else if (checkData['status_code'] && checkData.status_code === 401) {
              clearInterval(this.timer);
              this.message.error('您没权限对此操作！', { nzDuration: 10000 });
              this.cancel();
            } else if (checkData['status_code'] && checkData.status_code === 500) {
              clearInterval(this.timer);
              this.message.error('系统异常，请重试', { nzDuration: 10000 });
            } else {
              this.message.error(checkData.message, { nzDuration: 10000 });
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

  grantBytedance() {
    this.manageService.createBytedanceAuthUrl(this.accountSetting).subscribe(data => {
      this.saveing = false;
      if (data['status_code'] && data.status_code === 200) {
        this.gruntUrl = data['data']['url'];
        const newWindow = window.open(this.gruntUrl);
        this.isVisible = true;
        this.timer = setInterval(() => {
          this.manageService.checkBytedanceOauthState(data['data']['state']).subscribe((checkData) => {

            if (checkData['status_code'] == 200) {
              if (checkData.data.status > 0) {
                this.saveing = false;
                newWindow.close();
                this.getAccountTree(checkData.data['check_info']);
                clearInterval(this.timer);
              }
            } else if (checkData['status_code'] && checkData.status_code === 301) {
              clearInterval(this.timer);
              this.message.error('内部错误，请重试', { nzDuration: 10000 });
            } else if (checkData['status_code'] && checkData.status_code === 401) {
              clearInterval(this.timer);
              this.message.error('您没权限对此操作！', { nzDuration: 10000 });
              this.cancel();
            } else if (checkData['status_code'] && checkData.status_code === 500) {
              clearInterval(this.timer);
              this.message.error('系统异常，请重试', { nzDuration: 10000 });
            } else {
              this.message.error(checkData.message, { nzDuration: 10000 });
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
  grantWeibo() {
    this.manageService.createWeiboAuthUrl(this.accountSetting).subscribe(data => {
      this.saveing = false;
      if (data['status_code'] && data.status_code === 200) {
        this.gruntUrl = data['data']['url'];
        const newWindow = window.open(this.gruntUrl);
        this.isVisible = true;
        this.timer = setInterval(() => {
          this.manageService.checkWeiboOauthState(data['data']['state']).subscribe((checkData) => {

            if (checkData['status_code'] == 200) {
              if (checkData.data.status > 0) {
                this.saveing = false;
                newWindow.close();
                this.getAccountTree(checkData.data['check_info']);
                clearInterval(this.timer);
              }
            } else if (checkData['status_code'] && checkData.status_code === 301) {
              clearInterval(this.timer);
              this.message.error('内部错误，请重试', { nzDuration: 10000 });
            } else if (checkData['status_code'] && checkData.status_code === 401) {
              clearInterval(this.timer);
              this.message.error('您没权限对此操作！', { nzDuration: 10000 });
              this.cancel();
            } else if (checkData['status_code'] && checkData.status_code === 500) {
              clearInterval(this.timer);
              this.message.error('系统异常，请重试', { nzDuration: 10000 });
            } else {
              this.message.error(checkData.message, { nzDuration: 10000 });
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
  grantQianchuan() {
    this.manageService.createQianchuanAuthUrl(this.accountSetting).subscribe(data => {
      this.saveing = false;
      if (data['status_code'] && data.status_code === 200) {
        this.gruntUrl = data['data']['url'];
        const newWindow = window.open(this.gruntUrl);
        this.isVisible = true;
        this.timer = setInterval(() => {
          this.manageService.checkQianchuanOauthState(data['data']['state']).subscribe((checkData) => {

            if (checkData['status_code'] == 200) {
              if (checkData.data.status > 0) {
                this.saveing = false;
                newWindow.close();
                this.getAccountTree(checkData.data['check_info']);
                clearInterval(this.timer);
              }
            } else if (checkData['status_code'] && checkData.status_code === 301) {
              clearInterval(this.timer);
              this.message.error('内部错误，请重试', { nzDuration: 10000 });
            } else if (checkData['status_code'] && checkData.status_code === 401) {
              clearInterval(this.timer);
              this.message.error('您没权限对此操作！', { nzDuration: 10000 });
              this.cancel();
            } else if (checkData['status_code'] && checkData.status_code === 500) {
              clearInterval(this.timer);
              this.message.error('系统异常，请重试', { nzDuration: 10000 });
            } else {
              this.message.error(checkData.message, { nzDuration: 10000 });
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
  grantJinniu() {
    this.subject.destroy('onOk');
    const add_modal = this.modalService.create({
      nzTitle: '授权指引',
      nzWidth: 800,
      nzContent: AccountBindingChannelJinniuComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'account-binding-modal',
      nzFooter: null,
      nzComponentParams: {
        accountSetting: this.accountSetting,
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
      }
    });
  }


  grantKuaishou() {
    this.manageService.createKuaishouAuthUrl(this.accountSetting).subscribe(data => {
      this.saveing = false;
      if (data['status_code'] && data.status_code === 200) {
        this.gruntUrl = data['data']['url'];
        const newWindow = window.open(this.gruntUrl);
        this.isVisible = true;
        this.timer = setInterval(() => {
          this.manageService.checkKuaishouOauthState(data['data']['state']).subscribe((checkData) => {

            if (checkData['status_code'] == 200) {
              if (checkData.data.status > 0) {
                this.saveing = false;
                newWindow.close();
                this.message.success('保存成功');
                this.subject.destroy('onOk');
                this.isVisible = false;
                clearInterval(this.timer);
              }
            } else if (checkData['status_code'] && checkData.status_code === 301) {
              clearInterval(this.timer);
              this.message.error('内部错误，请重试', { nzDuration: 10000 });
            } else if (checkData['status_code'] && checkData.status_code === 401) {
              clearInterval(this.timer);
              this.message.error('您没权限对此操作！', { nzDuration: 10000 });
              this.cancel();
            } else if (checkData['status_code'] && checkData.status_code === 500) {
              clearInterval(this.timer);
              this.message.error('系统异常，请重试', { nzDuration: 10000 });
            } else {
              this.message.error(checkData.message, { nzDuration: 10000 });
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

  // vivo授权
  grantVivo() {
    this.manageService.createVivoAuthUrl(this.accountSetting).subscribe(data => {
      this.saveing = false;
      if (data['status_code'] && data.status_code === 200) {
        this.gruntUrl = data['data']['url'];
        const newWindow = window.open(this.gruntUrl);
        this.isVisible = true;
        this.timer = setInterval(() => {
          this.manageService.checkVivoOauthState(data['data']['state']).subscribe((checkData) => {

            if (checkData['status_code'] == 200) {
              if (checkData.data.status > 0) {
                this.saveing = false;
                newWindow.close();
                this.message.success('保存成功');
                this.subject.destroy('onOk');
                this.isVisible = false;
                clearInterval(this.timer);
              }
            } else if (checkData['status_code'] && checkData.status_code === 301) {
              clearInterval(this.timer);
              this.message.error('内部错误，请重试', { nzDuration: 10000 });
            } else if (checkData['status_code'] && checkData.status_code === 401) {
              clearInterval(this.timer);
              this.message.error('您没权限对此操作！', { nzDuration: 10000 });
              this.cancel();
            } else if (checkData['status_code'] && checkData.status_code === 500) {
              clearInterval(this.timer);
              this.message.error('系统异常，请重试', { nzDuration: 10000 });
            } else {
              this.message.error(checkData.message, { nzDuration: 10000 });
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

  grantZhihu() {
    this.manageService.createZhihuAuthUrl(this.accountSetting).subscribe(data => {
      this.saveing = false;
      if (data['status_code'] && data.status_code === 200) {
        this.gruntUrl = data['data']['url'];
        const newWindow = window.open(this.gruntUrl);

        this.validateAccountBindingForm.addControl('pub_account_id', new FormControl('', Validators.required));
        this.validateAccountBindingForm.addControl('pub_account_name', new FormControl('', Validators.required));
        this.validateAccountBindingForm.addControl('pub_token', new FormControl('', Validators.required));

        this.zhihuVisible = true;
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

  createZhihuAccount() {
    this.manageService.createZhihuAccount(this.accountSetting).subscribe((data) => {
      if (data['status_code'] && data.status_code === 200) {
        this.message.success('保存成功');
        this.subject.destroy('onOk');
      } else {
        this.message.error(data.message, { nzDuration: 10000 });
      }
    }, (err) => {

      this.saveing = false;
      this.message.error('系统异常，请重试', { nzDuration: 10000 });
    });
  }

  bindAccountTree() {
    const selectResult = [];
    this.selectAccountData.map(item => {
      if (item.checked && item.key != '0') {
        selectResult.push(item);
      }
    });
    if (selectResult.length < 1) {
      this.message.error('请选择帐户');
    } else {
      const postData = {
        list: [...selectResult]
      };

      this.saveing = true;

      if (this.accountSetting.publisher_id === 6 || this.accountSetting.publisher_id === 9) {
        this.manageService.createGdtAccountOauth(postData).subscribe((data) => {
          if (data['status_code'] && data.status_code === 200) {
            this.message.success('保存成功');
            this.subject.destroy('onOk');
          } else {
            this.message.error(data.message, { nzDuration: 10000 });
          }
        }, (err) => {

          this.saveing = false;
          this.message.error('系统异常，请重试', { nzDuration: 10000 });
        });
      } else if (this.accountSetting.publisher_id === 7) {
        this.manageService.createBytedanceAccountOauth(postData).subscribe((data) => {
          if (data['status_code'] && data.status_code === 200) {
            this.message.success('保存成功');
            this.subject.destroy('onOk');
          } else {
            this.message.error(data.message, { nzDuration: 10000 });
          }
        }, (err) => {

          this.saveing = false;
          this.message.error('系统异常，请重试', { nzDuration: 10000 });
        });
      } else if (this.accountSetting.publisher_id === 22) {
        this.manageService.createQianchuanAccountOauth(postData).subscribe((data) => {
          if (data['status_code'] && data.status_code === 200) {
            this.message.success('保存成功');
            this.subject.destroy('onOk');
          } else {
            this.message.error(data.message, { nzDuration: 10000 });
          }
        }, (err) => {

          this.saveing = false;
          this.message.error('系统异常，请重试', { nzDuration: 10000 });
        });
      } else if (this.accountSetting.publisher_id === 8) {
        this.manageService.createWeiboAccountOauth(postData).subscribe((data) => {
          if (data['status_code'] && data.status_code === 200) {
            this.message.success('保存成功');
            this.subject.destroy('onOk');
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

  doSave() {
    // 账户标签去前后空格
    if (this.accountSetting.account_custom_label) {
      for (const key in this.accountSetting.account_custom_label) {
        this.accountSetting.account_custom_label[key] = this.accountSetting.account_custom_label[key] ? this.accountSetting.account_custom_label[key].trim() : '';
      }
    }
    if (!this.saveing) {
      this.saveing = true;
      this.accountSetting['channel_list'] = [this.channel_id];
      if (this.account_id > 0) { //编辑
        const accountSetting = { chan_pub_id: this.account_id, ...this.accountSetting };
        this.manageService.updateHasAccount(this.account_id, accountSetting).subscribe(data => {
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
        if (this.accountSetting.publisher_id === 6 || this.accountSetting.publisher_id === 9 || this.accountSetting.publisher_id === 10 || this.accountSetting.publisher_id === 11) {
          this.accountSetting.pub_account_name = '';
          this.accountSetting.pub_password = '';
        }

        if (this.accountSetting.publisher_id !== 6 && this.accountSetting.publisher_id !== 9 && this.accountSetting.publisher_id !== 10 && this.accountSetting.publisher_id !== 11) {
          let postSubject: any;
          const postAccountSetting = JSON.parse(JSON.stringify(this.accountSetting));
          if (this.accountSetting.use_keeper) {
            postSubject = this.manageService.createAccountUseKeeper(postAccountSetting);
          } else {
            delete postAccountSetting['super_account_id'];
            postSubject = this.manageService.createHasAccount(postAccountSetting);
          }
          postSubject.subscribe(data => {
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
        } else if (this.accountSetting.publisher_id === 10) {
          const selectResult = {};
          this.getGoogleSelectData(this.googleSelectData, selectResult);
          if (Object.values(selectResult).length < 1) {
            this.message.error('请选择帐号');
          } else {
            const postData = {
              list: [],
              cid: this.accountSetting.cid,
              discount: this.accountSetting.discount,
              account_label: this.accountSetting.account_label,
              account_custom_label: this.accountSetting.account_custom_label,
              attribution_channel: this.accountSetting.attribution_channel,
              attribution_publisher: this.accountSetting.attribution_publisher,
            };
            Object.values(selectResult).forEach(item => {
              postData.list.push({
                "pub_account_name": item['pub_account_name'],
                "pub_account_id": item['pub_account_id'],
                "chan_pub_id": item['chan_pub_id'] == undefined ? 0 : item['chan_pub_id'],
                "account_id": item['account_id'] == undefined ? 0 : item['account_id'],
                "cid": this.accountSetting.cid,
                "discount": 0,
                "account_label": "",
                "account_comment": "",
                "channel_pub_token": item['channel_pub_token'],
              });

            });


            this.manageService.createGoogleAccount(postData).subscribe((data) => {
              if (data['status_code'] && data.status_code === 200) {
                this.message.success('保存成功');
                this.subject.destroy('onOk');
              } else {
                this.message.error(data.message, { nzDuration: 10000 });
              }
            }, (err) => {

              this.saveing = false;
              this.message.error('系统异常，请重试', { nzDuration: 10000 });
            });



          }


          this.saveing = false;


        } else if (this.accountSetting.publisher_id === 11) {
          const selectResult = {};
          this.getFacebookSelectData(this.facebookSelectData, selectResult);
          if (Object.values(selectResult).length < 1) {
            this.message.error('请选择帐号');
          } else {
            const postData = { list: [], cid: this.accountSetting.cid };
            Object.values(selectResult).forEach(item => {
              postData.list.push({
                "pub_account_name": item['pub_account_name'],
                "pub_account_id": item['pub_account_id'],
                // "chan_pub_id": item['chan_pub_id']==undefined?0:item['chan_pub_id'],
                "account_id": item['account_id'] == undefined ? 0 : item['account_id'],
                "cid": this.accountSetting.cid,
                "discount": 0,
                "account_label": "",
                "account_comment": "",
                "access_token": item['access_token']
              });

            });


            this.manageService.createFacebookAccount(postData).subscribe((data) => {
              if (data['status_code'] && data.status_code === 200) {
                this.message.success('保存成功');
                this.subject.destroy('onOk');
              } else {
                this.message.error(data.message, { nzDuration: 10000 });
              }
            }, (err) => {

              this.saveing = false;
              this.message.error('系统异常，请重试', { nzDuration: 10000 });
            });
          }


          this.saveing = false;


        } else if (this.accountSetting.publisher_id === 6 || this.accountSetting.publisher_id === 9) {
          this.manageService.createGdtHasAccount(this.accountSetting).subscribe(data => {
            this.saveing = false;
            if (data['status_code'] && data.status_code === 200) {
              this.gruntUrl = data['data']['url'];

              const newWindow = window.open(this.gruntUrl);
              this.isVisible = true;
              this.timer = setInterval(() => {
                this.manageService.checkGdtAccountStatus(data['data']['state']).subscribe((data) => {
                  if (data.status_code === 200) {
                    if (data.data.status > 0) {
                      this.saveing = false;
                      newWindow.close();
                      this.getAccountTree(data['data']['check_info']);

                      clearInterval(this.timer);
                    }
                  } else if (data.status_code === 205) {

                  } else {
                    this.message.error(data.message);
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
          });
        } else {
          this.manageService.createGdtHasAccount(this.accountSetting).subscribe(data => {
            this.saveing = false;
            if (data['status_code'] && data.status_code === 200) {
              this.gruntUrl = data['data']['url'];

              const newWindow = window.open(this.gruntUrl);
              this.isVisible = true;
              this.timer = setInterval(() => {
                this.manageService.checkAccountOauthState(data.data.state).subscribe((data) => {
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

  }

  getAccountTree(body) {
    if (this.accountSetting.publisher_id === 6 || this.accountSetting.publisher_id === 9) {
      this.manageService.getGdtAccountData(body).subscribe((data) => {
        if (data.status_code === 200) {
          this.isVisible = false;
          this.accountTreeVisible = true;
          const listData = JSON.parse(JSON.stringify(data.data));
          listData.forEach(item => {
            item.key = item.pub_account_id;
            item.title = item.pub_account_name;
          });
          if (listData && listData.length > 0) {
            listData.unshift({ key: 0, title: '全选' });
          }
          this.accountData = [...listData];
          this.selectAccountData = [...listData];
        } else {
          this.message.error(data.message);
        }
      }, (err) => {
        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      });
    } else if (this.accountSetting.publisher_id === 7) {
      this.manageService.getBytedanceAccountData(body).subscribe((data) => {
        if (data.status_code === 200) {
          this.isVisible = false;
          this.accountTreeVisible = true;
          const listData = JSON.parse(JSON.stringify(data.data));
          listData.forEach(item => {
            item.key = item.pub_account_id;
            item.title = item.pub_account_name;
          });
          if (listData && listData.length > 0) {
            listData.unshift({ key: 0, title: '全选' });
          }
          this.accountData = [...listData];
          this.selectAccountData = [...listData];
        } else {
          this.message.error(data.message);
        }
      }, (err) => {
        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      });
    } else if (this.accountSetting.publisher_id === 22) {
      this.manageService.getQianchuanAccountData(body).subscribe((data) => {
        if (data.status_code === 200) {
          this.isVisible = false;
          this.accountTreeVisible = true;
          const listData = JSON.parse(JSON.stringify(data.data));
          listData.forEach(item => {
            item.key = item.pub_account_id;
            item.title = item.pub_account_name;
          });
          if (listData && listData.length > 0) {
            listData.unshift({ key: 0, title: '全选' });
          }
          this.accountData = [...listData];
          this.selectAccountData = [...listData];
        } else {
          this.message.error(data.message);
        }
      }, (err) => {
        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      });
    } else if (this.accountSetting.publisher_id === 8) {
      this.manageService.getWeiboAccountData(body).subscribe((data) => {
        if (data.status_code === 200) {
          this.isVisible = false;
          this.accountTreeVisible = true;
          const listData = JSON.parse(JSON.stringify(data.data));
          listData.forEach(item => {
            item.key = item.pub_account_id;
            item.title = item.pub_account_name;
          });
          if (listData && listData.length > 0) {
            listData.unshift({ key: 0, title: '全选' });
          }
          this.accountData = [...listData];
          this.selectAccountData = [...listData];
        } else {
          this.message.error(data.message);
        }
      }, (err) => {
        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      });
    }


  }
  clickAccount(event, sourceData) {
    if (event.node.key == 0) {
      this.checkedAccount = [];
      if (event.node.origin.checked) {
        sourceData.forEach(item => {
          if (item.disabled != 1) {
            this.checkedAccount.push(item.key);
          }
        });
      }
    }
  }
  changeSearchName() {
    if (this.searchAccountName) {
      const resultObj = {};
      this.accountData.forEach(data => {
        if (data.key == '0') {
          resultObj[data.key] = data;
        } else {
          this.searchAccountName.replace(/，/g, ',').split(',').forEach(value => {
            if (value && data.pub_account_name.indexOf(value) !== -1) resultObj[data.key] = data;
          });
        }
      });
      this.selectAccountData = Object.values(resultObj);
    } else {
      this.selectAccountData = deepCopy(this.accountData);
    }

    // const result = this.accountData.filter(item => item.key == '0' || item.pub_account_name.indexOf(this.searchAccountName) !== -1);
    // this.selectAccountData = deepCopy(result);
  }


  getImage() {
    this.image_loading = false;
    this.getImgByPublisherId(this.accountSetting.publisher_id);
  }

  getImgByPublisherId(id) {
    this.image_loading = false;
    if ([1, 3, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 18, 19, 22, 23, 24].indexOf(id) === -1) {
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

  getAccountInfo(account_id) {
    this.manageService.getHasAccountInfo(account_id).subscribe(
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
    // 初始化赋值
    this.initFormGroupObj();
    this.initAccountSetting();
    this.currentKeeperList = this.keeperList.filter((item) => {
      return item['publisher_id'] == this.accountSetting.publisher_id && item['channel_id'] == this.channel_id;
    });

    if (this.currentKeeperList.length > 0) {
      this.canUseKeeper = true;
      this.accountSetting.super_account_id = this.currentKeeperList[0]['key'];
      this.validateAccountBindingForm.removeControl('pub_password');
    } else {
      this.canUseKeeper = false;
      this.accountSetting.super_account_id = 0;
    }

    if (this.account_id) {
      this.getAccountInfo(this.account_id);
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
  }



  changeChannel() {
    this.getPublishers();
    this.accountSetting.attribution_channel = this.channel_id;
    const findPublisher = this.publishers.find((item) => item.publisher_id === this.accountSetting.publisher_id);
    if (findPublisher === undefined) {
      this.accountSetting['publisher_id'] = this.publishers[0].publisher_id;
    }
    this.accountSetting.attribution_publisher = this.accountSetting['publisher_id'];

    if (this.channel_id != 1 && this.channel_id != 2) {
      this.canUseKeeper = false;
      this.accountSetting.use_keeper = false;
    } else {

      this.currentKeeperList = this.keeperList.filter((item) => {
        return item['publisher_id'] == this.accountSetting.publisher_id && item['channel_id'] == this.channel_id;
      });

      if (this.currentKeeperList.length > 0) {
        this.canUseKeeper = true;
        this.accountSetting.super_account_id = this.currentKeeperList[0]['key'];

      } else {
        this.canUseKeeper = false;
        this.accountSetting.super_account_id = 0;
      }

    }
    this.keeperChange();

  }

  getFormControl(name) {
    return this.validateAccountBindingForm.controls[name];
  }

  setDomain() {
  }


  getGoogleSelectData(source: any[], result: any) {
    source.map(item => {
      if (item.checked && item.isLeaf) {
        result['key_' + item['key']] = item;
      } else {
        if (item.hasOwnProperty('children') && item.children.length > 0) {
          this.getGoogleSelectData(item.children, result);
        }
      }
    });
  }

  getFacebookSelectData(source: any[], result: any) {
    source.map(item => {
      if (item.checked && item.isLeaf) {
        result['key_' + item['key']] = item;
      } else {
        if (item.hasOwnProperty('children') && item.children.length > 0) {
          this.getGoogleSelectData(item.children, result);
        }
      }
    });
  }

  jzlTypeChange() {
    if (this.accountSetting.publisher_id === 16) {
      if (this.accountSetting.is_jzl !== '2') {
        this.validateAccountBindingForm.removeControl('app_id');
        this.validateAccountBindingForm.removeControl('app_secret');
      } else {
        this.validateAccountBindingForm.addControl('app_id', new FormControl('', Validators.required));
        this.validateAccountBindingForm.addControl('app_secret', new FormControl('', Validators.required));
      }
    } else if (this.accountSetting.publisher_id === 17) {
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
