import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { AuthService } from "../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from "@angular/router";
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {

  public authCodeData = "";

  forgetOne: FormGroup;
  forgetTwo: FormGroup;
  forgetThree: FormGroup;
  productInfo = {};

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService,
    private productService: ProductDataService) {
    this.refreshAuthCode();
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });

    this.forgetOne = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      'auth_code': ['', [Validators.required]]
    });

    this.forgetTwo = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      phone_code: ['', [Validators.required]]
    });
    this.forgetThree = this.fb.group({
      'new_password': ['', [Validators.required, Validators.pattern("^(?![A-Za-z0-9]+$)(?![a-z0-9_\\W]+$)(?![A-Za-z_\\W]+$)(?![A-Z0-9_\\W]+$)[a-zA-Z0-9_\\W]{8,}$"),]],
      'confirm_password': ['', [Validators.required, ForgetPasswordComponent.passwordEqual]]
    });
  }

  static passwordEqual(control: FormControl) {
    if (!control || !control.parent) { return null; }
    if (control.value !== control.parent.get('new_password').value) {
      return { equal: true };
    }
    return null;
  }

  current = 0;
  count = 0;
  interval$: any;

  forget_password_one = {
    'user_mobile': '',
    'auth_code': ''
  };

  forget_password_two = {
    'mobile': '',
    'auth_code': ''
  };
  forget_password_three = {
    'password': '',
    'retry_password': ''
  };
  public phoneWarning = '';

  public isRequestingPhoneCode = false;


  ngOnInit() {

  }

  getFormControl(formControl, name) {
    return formControl.get(name);
  }

  oneClick() {
    this.authService.forgetPasswordOneStep(this.forget_password_one).subscribe(
      (result) => {
        if (result['status_code'] === 200) {
          this.forget_password_two.mobile = this.forget_password_one.user_mobile;
          this.phoneWarning = result['data']['mobile'];
          this.current = 1;
        } else if (result['status_code'] === 211) {
          this.message.error(result['message']);
        } else if (result['status_code'] === 302) {
          this.message.error(result['message']);
          this.current = 0;
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(result.message);
        }
      }
    );
  }

  twoClick() {
    this.authService.forgetPasswordTwoStep(this.forget_password_two.auth_code).subscribe(
      (result) => {
        if (result['status_code'] === 200) {
          this.current = 2;
        } else if (result['status_code'] === 211) {
          this.message.error(result['message']);
        } else if (result['status_code'] === 302) {
          this.message.error(result['message']);
          this.current = 0;
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(result.message);
        }
      }
    );
  }

  sureClick() {
    this.authService.resetPassword(this.forget_password_three).subscribe(
      (result) => {
        if (result['status_code'] === 200) {
          this.current = 3;
        } else if (result['status_code'] === 211) {
          this.message.error(result['message']);
        } else if (result['status_code'] === 302) {
          this.message.error(result['message']);
          this.current = 0;
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(result.message);
        }

      }
    );
  }

  sendCode() {
    if (this.forget_password_two.mobile && !this.getFormControl(this.forgetTwo, 'mobile').hasError('required') && !this.isRequestingPhoneCode) {
      this.isRequestingPhoneCode = true;
      this.authService.sendVerificationCode(this.forget_password_two.mobile, this.productInfo['name']).subscribe(
        (result) => {
          if (result['status_code'] === 200) {
            this.count = 59;
            this.interval$ = setInterval(() => {
              this.count -= 1;
              if (this.count <= 0) {
                clearInterval(this.interval$);
                this.isRequestingPhoneCode = false;
              }
            }, 1000);
            this.message.success('验证码获取成功');
          } else if (result['status_code'] === 202) {
            this.isRequestingPhoneCode = false;
            this.message.error('验证码获取失败,请重试');
          } else if (result['status_code'] === 204) {
            this.count = 120;
            this.interval$ = setInterval(() => {
              this.count -= 1;
              if (this.count <= 0) {
                this.isRequestingPhoneCode = false;
                clearInterval(this.interval$);
              }
            }, 1000);
            this.message.error('该勿使用同一手机号重复获取验证码,请120秒后重试');
          } else {
            this.isRequestingPhoneCode = false;
            this.message.error(result['message']);
          }
        }
      );
    }
  }



  refreshAuthCode() {
    this.authService.getAuthCodeImg().subscribe(result => {
      if (result['status_code'] === 200) {
        this.authCodeData = result['data']['img'];
      }
    });
  }
}
