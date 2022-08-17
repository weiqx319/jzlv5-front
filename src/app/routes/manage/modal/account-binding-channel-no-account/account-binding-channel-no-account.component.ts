import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ManageService } from "../../service/manage.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Observable } from "rxjs";
import { isObject, isUndefined } from "@jzl/jzl-util";
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-account-binding-channel-no-account',
  templateUrl: './account-binding-channel-no-account.component.html',
  styleUrls: ['./account-binding-channel-no-account.component.scss']
})
export class AccountBindingChannelNoAccountComponent implements OnInit {

  validateAccountBindingForm: FormGroup;
  image_loading = false;

  // 账户标签列表
  @Input() accountLabelList = [];
  @Input() chanPubId = 0;

  @Input()
  set setting(data: any) {
    this.accountSetting = Object.assign(this.accountSetting, data);
  }

  public saveing = false;
  public accountSetting = {
    cid: null,
    publisher_id: 1,
    pub_account_name: '',
    channel_id: 1,
    account_label: '',
    account_comment: '',
    discount: 0,
    account_custom_label: {}
  };
  public advertiserList = [];
  public publishers = [];
  public verificationImg = '/assets/loading.gif';
  public token = '';

  public filterChannelOption = [
    {
      name: '搜索推广',
      key: 1,
    },
    {
      name: '信息流',
      key: 2,
    },
    {
      name: '应用市场',
      key: 3,
    },
  ];
  public productInfo = {};

  constructor(private fb: FormBuilder,
    private manageService: ManageService,
    private customDataService: CustomDatasService,
    private message: NzMessageService,
    private subject: NzModalRef,
    private productService: ProductDataService) {
    this.customDataService.dealPublisherNewData().then(() => {
      //   this.publishers = [...this.customDataService.publisherNewArray.filter((v)=>{return [1,2,3,4,5,6,7].indexOf(v['publisher_id'])==-1;})];
      this.publishers = [...this.customDataService.publisherNewList];
    });

    this.customDataService.dealChannelData().then(() => {
      this.filterChannelOption = [...this.customDataService.channelList];
    });
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });

  }
  // 初始化赋值
  initFormGroup() {
    const formGroupObj = {
      cid: [0, [Validators.required]],
      publisher_id: [1, [Validators.required]],
      pub_account_name: ['', [Validators.required]],
      channel_id: [1, [Validators.required]],
      account_label: [''],
      account_comment: [''],
      discount: [0, [Validators.required], [this.cashCountValidator]],
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

  //判断小数点后几位数
  getPointAfterCount(number) {
    const stringArray = number.toString().split(".");
    return stringArray.length > 1 ? stringArray[1].length : 0;
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
        /* if (this.accountSetting.publisher_id !== 1) {
           this.accountSetting['image_token'] = this.token;
         }*/
        this.manageService.publishVirtualAccount(this.accountSetting).subscribe(data => {
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
            // this.getImage();
          }
        }, (err) => {

          this.saveing = false;
          this.message.error('系统异常，请重试', { nzDuration: 10000 });
        });
      }
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
    // this.getImgByPublisherId(this.accountSetting.publisher_id);
    // 初始化赋值
    this.initFormGroup();
    this.initAccountSetting();
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
  changeChannel(list) {


  }

  getFormControl(name) {
    return this.validateAccountBindingForm.controls[name];
  }
}
