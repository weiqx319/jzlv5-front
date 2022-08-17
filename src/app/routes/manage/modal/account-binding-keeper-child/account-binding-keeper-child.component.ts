import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ManageService } from "../../service/manage.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Observable } from "rxjs";
import { isUndefined } from "@jzl/jzl-util";
import { MenuService } from '../../../../core/service/menu.service';

import { utils } from "protractor";

@Component({
  selector: 'app-account-binding-keeper-child',
  templateUrl: './account-binding-keeper-child.component.html',
  styleUrls: ['./account-binding-keeper-child.component.scss']
})
export class AccountBindingKeeperChildComponent implements OnInit, AfterViewInit {

  validateAccountBindingForm: FormGroup;
  image_loading = false;


  @Input() superAccountId = 0;
  @Input() superAccountName = '';

  @Input()
  set setting(data: any) {
    this.accountSetting = Object.assign(this.accountSetting, data);
  }
  public contextMenu = {
    items: {
      "row_above": { name: '前插入行' },
      "row_below": { name: '后插入行' },
      "remove_row": { name: '删除' },
      "copy": { name: '复制' },
      "cut": { name: '剪切' },
    }
  };
  public tableShow = false;
  public childDataset = [[], [], []];
  public saveing = false;
  public accountSetting = {
    publisher_id: 1,
    super_account_name: '',
    super_password: '',
    channel_list: [],
    child_account_name: '',
    super_token: '',
    notify_email: ""
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
      { publisher_name: '今日头条', publisher_id: 7 },
      { publisher_name: '广点通', publisher_id: 6 },
    ]

  };
  public publishers = [
  ];
  public verificationImg = '/assets/loading.gif';
  public token = '';

  public channelList = [];
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
      channel_id: '',

    });

    this.channelList = JSON.parse(JSON.stringify(this.manageService.channelItems));
    //根据渠道初始化媒体
    this.publishers = this.publishersGroup[this.channel_id];
    this.accountSetting.channel_list = [this.channel_id];
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
      this.accountSetting['channel_list'] = [this.channel_id];
      const postChildAccountName = [];
      this.childDataset.forEach(item => {
        if (item.length > 0) {
          if (item[0] != '') {
            postChildAccountName.push(item[0]);
          }
        }
      });
      if (postChildAccountName.length < 1) {
        this.message.error('请填加子帐户');
        this.saveing = false;
        return;
      }


      const accountSetting = { super_account_id: this.superAccountId, child_account_name: postChildAccountName };
      this.manageService.addAccountKeeperDetail(accountSetting).subscribe(data => {
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
    this.publishers = this.publishersGroup[this.channel_id];
    this.accountSetting['publisher_id'] = this.publishers[0].publisher_id;
  }

  getFormControl(name) {
    return this.validateAccountBindingForm.controls[name];
  }

  setDomain() {
    this.isShowDomain = !this.isShowDomain;
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.tableShow = true;
    });


  }


}
