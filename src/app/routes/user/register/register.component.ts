import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { AuthService } from "../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from "@angular/router";
import { ProductDataService } from "@jzl/jzl-product";
import { MenuService } from "../../../core/service/menu.service";


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy, AfterViewInit {


  registerForm: FormGroup;
  showByReferer = false;

  register_setting = {
    company_name: '',
    user_password: '',
    mobile: '',
    verification_code: '',
    oauth_code: ''
  };

  public productInfo = {};



  public isRequesting = false;
  public isRequestingPhoneCode = false;

  //  -- phoneCode interval
  public count = 0;
  public interval$: any;
  public kf53: any;
  public referrer = '';


  constructor(private productService: ProductDataService,
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService,
    private router: Router,
    private route: ActivatedRoute,
    public menuService: MenuService,) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
    this.registerForm = this.fb.group({
      user_password: ['', [Validators.required, Validators.pattern("^(?![A-Za-z0-9]+$)(?![a-z0-9_\\W]+$)(?![A-Za-z_\\W]+$)(?![A-Z0-9_\\W]+$)[a-zA-Z0-9_\\W]{8,}$"),]],
      confirm: ['', [Validators.required, Validators.pattern("^(?![A-Za-z0-9]+$)(?![a-z0-9_\\W]+$)(?![A-Za-z_\\W]+$)(?![A-Z0-9_\\W]+$)[a-zA-Z0-9_\\W]{8,}$"), RegisterComponent.passwordEqual]],
      mobile: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      verification_code: ['', [Validators.required]],
      company_name: ['', [Validators.required, Validators.minLength(2)]],
    });
    if (this.route.snapshot.queryParams['redirect_url']) {
      this.menuService.redirectUrl = this.route.snapshot.queryParams['redirect_url'];
    }
  }

  static passwordEqual(control: FormControl) {
    if (!control || !control.parent) { return null; }
    if (control.value !== control.parent.get('user_password').value) {
      return { equal: true };
    }
    return null;
  }

  getPhoneCode() {
    if (!this.getFormControl('mobile').errors && !this.isRequestingPhoneCode) {
      this.isRequestingPhoneCode = true;
      this.authService.sendSingUpVerificationCode(this.registerForm.get('mobile').value, this.productInfo['name']).subscribe(result => {
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
        } else if (result['status_code'] === 201) {
          this.isRequestingPhoneCode = false;
          this.getFormControl('mobile').setErrors({ 'repeat': true });
          this.message.error('该手机号已经被占用，请更换新手机号');
        } else if (result['status_code'] === 202) {
          this.isRequestingPhoneCode = false;
          this.message.error('验证码获取失败,请重试');
        } else if (result['status_code'] === 204) {
          this.count = 120;
          this.interval$ = setInterval(() => {
            this.count -= 1;
            if (this.count <= 0) {
              clearInterval(this.interval$);
              this.isRequestingPhoneCode = false;
            }
          }, 1000);
          this.message.error('该勿使用同一手机号重复获取验证码,请120秒后重试');
        } else {
          this.isRequestingPhoneCode = false;
          this.message.error('其他错误,请上报');
        }
      });
    } else {
      this.getFormControl('mobile').markAsDirty();

    }
  }
  //去除字符串首位空格
  trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  }
  doRegister() {
    if (this.isRequesting) { return; }
    for (const key in this.registerForm.controls) {
      if (key) {

        this.registerForm.controls[key].markAsDirty();
        this.registerForm.controls[key].updateValueAndValidity();
      }
    }
    if (this.registerForm.valid) {
      this.register_setting.company_name = this.registerForm.get('company_name').value;
      this.register_setting.user_password = this.registerForm.get('user_password').value;
      this.register_setting.mobile = this.registerForm.get('mobile').value;
      this.register_setting.verification_code = this.registerForm.get('verification_code').value;
      this.register_setting['url'] = location.href;
      this.register_setting['referrer'] = this.referrer;

      this.isRequesting = true;
      this.authService.signup(this.register_setting).subscribe(result => {
        if (result['status_code'] === 200) {
          const jzlScript = document.createElement("script");
          jzlScript.appendChild(document.createTextNode("if(analytics) {analytics.identify(" + result.data.user_id + ", {})}"));
          document.body.appendChild(jzlScript);

          this.productService.registerMobile = this.register_setting.mobile;
          this.message.success('注册成功');
          localStorage.removeItem('oauth_local'); //授权账户过来的：清除本地存储的oauth_code
          this.router.navigate(['/register-result']);
        } else if (result['status_code'] === 201) {
          this.getFormControl('mobile').setErrors({ 'repeat': true });
          this.message.error('该手机号已经被占用，请更换新手机号');
        } else if (result['status_code'] === 203) {
          this.getFormControl('verification_code').setErrors({ 'expire': true });
          this.message.error('验证码无效,请重新获取');
        } else if (result['status_code'] === 204) {
          this.getFormControl('verification_code').setErrors({ 'error': true });
          this.message.error('验证码错误');
        } else if (result['status_code'] === 206) {
          this.message.error(result.message);
        } else {
          this.message.error('注册异常,请重试');
        }
        this.isRequesting = false;
      }, () => {
        this.message.error('注册异常,请重试');
        this.isRequesting = false;
      });

    }
  }
  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }

  ngOnInit() {

    const current_referrer = document.referrer;
    let referrerHost = '';
    if (current_referrer) {
      referrerHost = current_referrer.split('//')[1].split('/')[0];
    }
    //本地没有referrer时才会存储referrer
    if (!localStorage.getItem('referrer') && current_referrer) {
      if (referrerHost !== location.host) {
        localStorage.setItem('referrer', current_referrer);
      }
      this.referrer = current_referrer;
    }
    if (localStorage.getItem('referrer')) {
      this.referrer = localStorage.getItem('referrer');
    }

    const oauth_local = JSON.parse(localStorage.getItem('oauth_local'));
    let diffValue: any;
    if (oauth_local) {
      //得到当前时间
      const currentTime = new Date().getTime();
      //得到时间差：超过5分钟不做处理
      diffValue = (currentTime - oauth_local['time']) / 1000 / 60;
    }
    if (oauth_local && oauth_local['status'] && oauth_local['status'] === 5 && diffValue <= 5) {
      this.register_setting.oauth_code = oauth_local['oauth_code'];
    }
    if (oauth_local && diffValue > 5) {
      localStorage.removeItem('oauth_local'); //授权账户过来的：存储时间超过5分钟，清除本地存储的oauth_code
    }
  }

  getFormControl(name) {
    return this.registerForm.controls[name];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const trackCode = document.createElement('script');
      trackCode.innerHTML = " var _jzlpaq = window._jzlpaq || [];\n" +
        "    _jzlpaq.push(['trackEvent', 'Jzl_convert', \"click\", \"conversion_04\", 1]);";
      document.body.appendChild(trackCode);
    }, 0);


  }

}
