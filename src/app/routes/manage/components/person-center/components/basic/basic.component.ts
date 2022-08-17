
import { map, switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from "../../../../../../core/service/auth.service";
import { User } from "../../../../../../core/entry/user";
import { Observable } from "rxjs";
import { ManageService } from "../../../../service/manage.service";
import { ManageItemService } from "../../../../service/manage-item.service";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss']
})
export class BasicComponent implements OnInit {

  public currentType = 'basic';
  public currentUser: User;
  public passwordForm: FormGroup;
  public roleTypeRelation;

  public passwordUpdateStatus = false;

  public passwordSetting = {
    old_password: '',
    user_password: '',
    confirm: '',
  };
  public sectionTabIndex = 0;

  constructor(private message: NzMessageService,
    private authService: AuthService,
    private manageService: ManageService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private manageItemService: ManageItemService) {
    this.currentType = this.route.snapshot.data['type'];

    this.roleTypeRelation = this.manageItemService.roleTypeRelation;

    this.passwordForm = this.fb.group({
      old_password: ['', [Validators.required, Validators.minLength(6)]],
      user_password: ['', [Validators.required, Validators.pattern("^(?![A-Za-z0-9]+$)(?![a-z0-9_\\W]+$)(?![A-Za-z_\\W]+$)(?![A-Z0-9_\\W]+$)[a-zA-Z0-9_\\W]{8,}$")]],
      confirm: ['', [Validators.required, Validators.pattern("^(?![A-Za-z0-9]+$)(?![a-z0-9_\\W]+$)(?![A-Za-z_\\W]+$)(?![A-Z0-9_\\W]+$)[a-zA-Z0-9_\\W]{8,}$"), BasicComponent.passwordEqual]],
    });


  }
  static passwordEqual(control: FormControl) {
    if (!control || !control.parent) { return null; }
    if (control.value !== control.parent.get('user_password').value) {
      return { equal: true };
    }
    return null;
  }

  getFormControl(name) {
    return this.passwordForm.controls[name];
  }

  ngOnInit() {
    this.authService.currentAdminUser$.pipe(switchMap((item: { select_uid: number }) => {
      return this.manageService.getUserInfo(item.select_uid);
    }), map(result => {
      if (result['status_code'] === 200) {
        return result['data'];
      } else {
        return {};
      }
    })).subscribe((data) => {
      this.currentUser = data;
    }, (err) => {
      // -- API 错误
    });

  }


  updatePassword() {
    for (const key in this.passwordForm.controls) {
      if (key) {
        this.passwordForm.controls[key].markAsDirty();
        this.passwordForm.controls[key].updateValueAndValidity();
      }
    }
    if (this.passwordForm.valid) {
      const postBody = {
        'old_password': this.passwordSetting.old_password,
        'new_password': this.passwordSetting.user_password,
      };
      this.manageService.alterPassword(postBody).subscribe((result) => {
        if (result['status_code'] && result['status_code'] === 200) {
          this.message.success('密码修改成功');
          this.passwordUpdateStatus = false;
          this.passwordSetting = {
            old_password: '',
            user_password: '',
            confirm: ''
          };
        } else if (result['status_code'] && result['status_code'] === 201) {
          this.getFormControl('old_password').setErrors({ 'serverError': true });
        } else if (result['status_code'] && result['status_code'] === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result['status_code'] === 404) {
          this.message.error('API未实现，找言十！');
        } else if (result['status_code'] && result['status_code'] === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(result['message']);
        }
      });

    }

    // --api
  }

  doCancel() {
    this.passwordUpdateStatus = false;
    this.passwordSetting = {
      old_password: '',
      user_password: '',
      confirm: ''
    };

  }



}
