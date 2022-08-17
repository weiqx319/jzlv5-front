import { Component, OnDestroy, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { resultMemoize, Store } from "@ngrx/store";
import { AuthActions } from '../../../core/store/actions/auth.action';
import { Observable } from "rxjs";
import { AppState } from '../../../core/store/app.state';
import { LocalStorageService } from "ngx-webstorage";
import { isObject } from "@jzl/jzl-util";
import { V5Init } from "../../../core/entry/v5init";
import { ProductDataService } from "@jzl/jzl-product";
import { MenuService } from "../../../core/service/menu.service";
import { AuthService } from "../../../core/service/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy, OnInit {
  public isMsgLogin = false;
  public isRequestingPhoneCode = false;
  public isGotPhoneCode = false;//是否成功获取验证码
  public msgLoginErrorMsg;//短信登录错误信息


  loginForm: FormGroup;
  msgLoginForm: FormGroup;
  error = '';
  loading = false;
  login_error = false;
  public count = 0;
  interval$: any;
  email_reg = /(^\s*([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+)|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/i;
  phone_reg = /^1\d{10}$/;
  login_setting = {
    username: '',
    password: '',
    remember: false
  };

  authState$ = this.store$.select(s => s.auth);
  v5InitState$ = this.store$.select(s => s.init);
  productInfo = {};
  public kf53: any;
  constructor(
    fb: FormBuilder,
    private store$: Store<AppState>,
    private router: Router,
    private localSt: LocalStorageService,
    private message: NzMessageService,
    private productService: ProductDataService,
    private authService: AuthService,
    public menuService: MenuService,
    private route: ActivatedRoute,) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });

    if (this.route.snapshot.queryParams['redirect_url']) {
      this.menuService.redirectUrl = this.route.snapshot.queryParams['redirect_url'];
    }

    this.v5InitState$.subscribe((initState: V5Init) => {
      if (initState.init === 'logout') {
        window.location.reload();
      }
    }, err => {

    });

    this.loginForm = fb.group({
      username: [null, [Validators.required], [this.usernameValidate]],
      password: [null, Validators.required],
      remember: [true],
    });

    // 短信验证码登录
    this.msgLoginForm = fb.group({
      mobile: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      verification_code: ['', [Validators.required]],
      remember: [true],
    });
  }

  usernameValidate = (control: FormControl): { [s: string]: boolean } => {
    const _that = this;
    return Observable.create(function (observer) {
      if (_that.phone_reg.test(control.value) || _that.email_reg.test(control.value)) {
        observer.next(null);
      } else {
        observer.next({ error: true });
      }
      observer.complete();
    });
  }

  usernameChange() {
    this.login_error = false;
  }

  passwordChange() {
    this.login_error = false;
  }

  getFormControl(name) {
    return this.loginForm.controls[name];
  }
  getMsgFormControl(name) {
    return this.msgLoginForm.controls[name];
  }

  // 账号登录
  submit() {
    for (const key in this.loginForm.controls) {
      if (key) {
        this.loginForm.controls[key].markAsDirty();
      }
    }
    if (this.loginForm.valid) {
      const userName = this.loginForm.get('username').value;
      const summitValue = {
        email: this.trim(userName),
        password: this.loginForm.get('password').value,
        keep_alive: this.loginForm.get('remember').value,
        type: 'password'
      };
      this.store$.dispatch(new AuthActions.LoginAction(summitValue));
    }

  }
  // 短信登录
  msgSubmit() {
    for (const key in this.msgLoginForm.controls) {
      if (key) {
        this.msgLoginForm.controls[key].markAsDirty();
      }
    }
    if (this.msgLoginForm.valid) {
      const summitValue = {
        mobile: this.msgLoginForm.get('mobile').value,
        verification_code: this.msgLoginForm.get('verification_code').value,
        keep_alive: this.msgLoginForm.get('remember').value,
        type: 'verification_code'
      };
      this.store$.dispatch(new AuthActions.LoginAction(summitValue));
    }
  }

  //去除字符串首位空格
  trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  }

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }

  ngOnInit(): void {
    const cacheLastUser = this.localSt.retrieve('v5_last_login_user');
    if (cacheLastUser !== null) {
      if (isObject(cacheLastUser) && cacheLastUser.hasOwnProperty('email')) {
        this.login_setting.username = cacheLastUser.email;
      }
    }
  }
  // 获取短信验证码
  getPhoneCode() {
    if (!this.getMsgFormControl('mobile').errors && !this.isRequestingPhoneCode) {
      this.isRequestingPhoneCode = true;
      this.authService.sendLoginVerificationCode(this.msgLoginForm.get('mobile').value).subscribe(result => {
        if (result['status_code'] === 200) {
          this.isGotPhoneCode = true;
          this.count = 59;
          this.interval$ = setInterval(() => {
            this.count -= 1;
            if (this.count <= 0) {
              clearInterval(this.interval$);
              this.isRequestingPhoneCode = false;
            }
          }, 1000);
          this.message.success('验证码获取成功');
        } else {
          this.message.error(result['message']);
          this.isRequestingPhoneCode = false;
        }
      });
    } else {
      this.getMsgFormControl('mobile').markAsDirty();
    }
  }
}




