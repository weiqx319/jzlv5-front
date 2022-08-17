import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthService } from "../../../core/service/auth.service";
import { AuthActions } from "../../../core/store/actions/auth.action";
import { V5InitActions } from "../../../core/store/actions/v5init.action";
import { Store } from "@ngrx/store";
import { AppState } from "../../../core/store/app.state";
import { isArray } from "@jzl/jzl-util";
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss']
})
export class OauthComponent implements OnInit {


  constructor(private store$: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private _http: AuthService,
    private productService: ProductDataService) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }
  public status: any;
  public oauth_code: any;
  public accountInfo = {};
  public is_show = false;
  public productInfo = {};

  ngOnInit() {
    this.status = this.route.snapshot.queryParams['status'] * 1;
    this.oauth_code = this.route.snapshot.queryParams['oauth_code'];
    const oauthLocal = {
      'status': this.status,
      'oauth_code': this.oauth_code,
      'time': new Date().getTime()
    };
    localStorage.setItem('oauth_local', JSON.stringify(oauthLocal));
    this._http.getAccountInfo(this.oauth_code).subscribe(
      (result) => {
        if (result.status_code === 200) {
          this.accountInfo = result['data'];
          if (!isArray(this.accountInfo)) {
            this.is_show = true;
          }
        }
      }
    );
  }

  resetBindingCach() {
    localStorage.removeItem('oauth_local');
  }
  getNowTime() {
    const formatDate = (time: any) => {
      // 格式化日期，获取今天的日期
      const Dates = new Date(time);
      const year: number = Dates.getFullYear();
      const month: any = (Dates.getMonth() + 1) < 10 ? '0' + (Dates.getMonth() + 1) : (Dates.getMonth() + 1);
      const day: any = Dates.getDate() < 10 ? '0' + Dates.getDate() : Dates.getDate();
      return year + '-' + month + '-' + day;
    };
    return formatDate(new Date().getTime());
  }
  login() {
    if (this.status === 3 || this.status === 2) {
      this.store$.dispatch(new AuthActions.LogoutAction());
      this.store$.dispatch(new V5InitActions.LogOutAction());

    } else {
      this.router.navigateByUrl('/login');
    }

  }
  logout() {
    this.resetBindingCach();
    this.store$.dispatch(new AuthActions.LogoutAction());
    this.store$.dispatch(new V5InitActions.LogOutAction());
  }
}
