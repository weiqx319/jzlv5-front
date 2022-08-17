import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {ManageService} from "../../service/manage.service";
import {Observable} from "rxjs";
import {ManageItemService} from "../../service/manage-item.service";

@Component({
  selector: 'app-user-edit-password',
  templateUrl: './user-edit-password.component.html',
  styleUrls: ['./user-edit-password.component.scss']
})
export class UserEditPasswordComponent implements OnInit {
  validateAccountBindingForm: FormGroup;

  @Input() set userData(data: any) {
    this.defaultSetting = Object.assign(this.defaultSetting, {
      role_id: data['role_id'],
      user_name: data['user_name'],
      email: data['email'],
    });
    this._userData = data;

    this.defaultSetting['role_id'] = data['role_id'];
  }

  @Input() userId = 0;

  public _userData: any;
  public defaultSetting = {
    role_id: 4,
    user_name: '',
    email: '',
    user_password: '',
    check_password: ''
  };
  public publisherList = [];

  constructor(private fb: FormBuilder,
              private  manageService: ManageService,
              private manageItemService: ManageItemService,
              private message: NzMessageService,
              private subject: NzModalRef) {

    this.publisherList = this.manageItemService.publisherTypeList;

    this.validateAccountBindingForm = this.fb.group({
      role_id: [''],
      user_name: [''],
      email: [''],
      user_password: ['', [Validators.required]],
      check_password: ['', [Validators.required], [this.checkPasswordValidator]]
    });

  }

  checkPasswordValidator = (control: FormControl): any => {
    const _that = this;
    return Observable.create(function(observer) {
      if (control.value === _that.validateAccountBindingForm.controls[ 'user_password' ].value) {
        observer.next(null);
      } else {
        observer.next({ error: true });
      }
      observer.complete();
    });
  }


  getFormControl(name) {
    return this.validateAccountBindingForm.controls[ name ];
  }
  ngOnInit() {
  }

  doSave() {
    this.defaultSetting.user_password = this.validateAccountBindingForm.get('user_password').value;
    this.defaultSetting.check_password = this.validateAccountBindingForm.get('check_password').value;
    this.manageService.updateUserPassword({
      'password': this.defaultSetting.user_password,
      'retry_password': this.defaultSetting.check_password
    }, this.userId).subscribe((result) => {
      if (result['status_code'] && result['status_code'] === 200) {
        this.message.success('修改成功');
        this.subject.destroy('onOk');
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！', { nzDuration: 10000 });
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      } else {
        this.message.error(result.message, { nzDuration: 10000 });
      }
    });
  }

  cancel() {
    this.subject.destroy('onCancel');
  }
}
