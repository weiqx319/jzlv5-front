import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ManageService } from "../../service/manage.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Observable } from "rxjs";
import { isUndefined } from "@jzl/jzl-util";
import { MenuService } from '../../../../core/service/menu.service';

@Component({
  selector: 'app-account-binding-keeper',
  templateUrl: './account-binding-keeper.component.html',
  styleUrls: ['./account-binding-keeper.component.scss']
})
export class AccountBindingKeeperComponent implements OnInit {

  validateAccountBindingForm: FormGroup;
  image_loading = false;


  @Input() superAccountId = 0;

  @Input()
  set setting(data: any) {
    this.accountSetting = Object.assign(this.accountSetting, data);
  }

  public saveing = false;
  public accountSetting = {
    channel_id: 1,
    publisher_id: 1,
    super_account_name: '',
    super_password: '',
    channel_list: [],
    child_account_name: '',
    super_token: '',
    notify_email: "",
    access_key: '',
    secret_key: '',
    bce_user: '',
  };
  public channel_id = 1;
  public publishersGroup = {
    1: [
      { publisher_name: '百度', publisher_id: 1 },
      { publisher_name: '搜狗', publisher_id: 2 },
      { publisher_name: '360', publisher_id: 3 },
      { publisher_name: '神马', publisher_id: 4 },
    ],
    2: [
      { publisher_name: '百度', publisher_id: 1 },
      { publisher_name: '超级汇川', publisher_id: 17 },
      // {publisher_name: '今日头条', publisher_id: 7},
      // {publisher_name: '广点通', publisher_id: 6},
    ],
    // 3:[
    //   {publisher_name: '小米', publisher_id: 13},
    //   {publisher_name: 'OPPO', publisher_id: 14},
    //   {publisher_name: 'VIVO', publisher_id: 15},
    // ],

  };
  public publishers = [
  ];
  public verificationImg = '/assets/loading.gif';
  public token = '';

  public channelList = [
    { label: '搜索推广', value: 1 },
    { label: '信息流', value: 2 },
  ];
  public isShowDomain = false;
  public gruntUrl = '';
  //定时器
  public timer;

  constructor(private fb: FormBuilder,
    private manageService: ManageService,
    private message: NzMessageService,
    private subject: NzModalRef,
    public menuService: MenuService
  ) {
    this.validateAccountBindingForm = this.fb.group({
      channel_id: [1, [Validators.required]],
      publisher_id: [1, [Validators.required]],
      super_account_name: ['', [Validators.required]],
      super_password: ['', [Validators.required]],
      child_account_name: ['', [Validators.required]],
      access_key: ['', [Validators.required]],
      secret_key: ['', [Validators.required]],
    });

    // this.channelList = JSON.parse(JSON.stringify(this.manageService.channelItems));
    //根据渠道初始化媒体
    this.publishers = this.publishersGroup[this.accountSetting.channel_id];
    this.accountSetting.channel_list = [this.accountSetting.channel_id];
  }

  cancel() {
    this.timer && clearInterval(this.timer);
    this.subject.destroy('onCancel');
  }

  handleAccountCancel() {
    this.message.success('保存成功');
    this.subject.destroy('onCancel');
  }


  doSave() {
    if (!this.saveing) {
      this.saveing = true;
      this.accountSetting['channel_list'] = [this.accountSetting.channel_id];
      if (this.superAccountId > 0) { //编辑
        const accountSetting = { super_account_id: this.superAccountId, ...this.accountSetting };
        this.manageService.updateAccountKeeper(this.superAccountId, accountSetting).subscribe(data => {
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

        this.manageService.createKeepAccount(this.accountSetting).subscribe(data => {
          this.saveing = false;
          if (data['status_code'] && data.status_code === 200) {
            this.message.success('保存成功');
            this.subject.destroy('onOk');
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



  getAccountInfo(superAccountId) {
    this.manageService.getAccountKeeperInfo(superAccountId).subscribe(
      (result) => {
        if (result['status_code'] === 200) {
          Object.assign(this.accountSetting, result['data']);
        }
      }
    );
  }
  ngOnInit() {
    if (this.superAccountId) {
      this.getAccountInfo(this.superAccountId);
      // this.validateAccountBindingForm.removeControl('super_password');
    } else {
      // this.publishers.splice(1 , 1);
    }





  }
  changeChannel() {
    this.publishers = this.publishersGroup[this.accountSetting.channel_id];
    this.accountSetting['publisher_id'] = this.publishers[0].publisher_id;

    this.checkFormControl();
  }

  getFormControl(name) {
    return this.validateAccountBindingForm.controls[name];
  }

  setDomain() {
    this.isShowDomain = !this.isShowDomain;
  }

  publisherChange() {
    this.checkFormControl();

  }

  checkFormControl() {
    if (this.accountSetting.publisher_id != 3) {
      this.validateAccountBindingForm.addControl('super_token', new FormControl('', Validators.required));
      this.validateAccountBindingForm.removeControl('secret_key');
      this.validateAccountBindingForm.removeControl('access_key');
    } else {
      this.validateAccountBindingForm.removeControl('super_token');
      this.validateAccountBindingForm.addControl('secret_key', new FormControl('', Validators.required));
      this.validateAccountBindingForm.addControl('access_key', new FormControl('', Validators.required));
    }

    // if (this.accountSetting.channel_id === 2 && this.accountSetting.publisher_id !== 1) {
    //   this.validateAccountBindingForm.addControl('access_key', new FormControl('', Validators.required));
    //   this.validateAccountBindingForm.addControl('secret_key', new FormControl('', Validators.required));
    //   this.validateAccountBindingForm.addControl('bce_user', new FormControl('', Validators.required));
    // } else {
    //   this.validateAccountBindingForm.removeControl('access_key');
    //   this.validateAccountBindingForm.removeControl('secret_key');
    //   this.validateAccountBindingForm.removeControl('bce_user');
    // }
  }



}
