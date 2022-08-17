
import { of as observableOf, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { Store } from "@ngrx/store";
import { Auth } from "../entry/auth";
import { CustomDatasService } from "../../shared/service/custom-datas.service";
import { AuthService } from "../service/auth.service";
import { AuthActions } from "../store/actions/auth.action";
import { isUndefined } from "@jzl/jzl-util";
import { NzMessageService } from 'ng-zorro-antd/message';
import { MenuService } from '../service/menu.service';
import { Location } from '@angular/common';


@Injectable()
export class SelectUserCidSuccessGuard implements CanActivate {


  constructor(private store$: Store<{ auth: Auth }>,
    private customDatasService: CustomDatasService,
    private message: NzMessageService,
    private authService: AuthService,
    private menuService: MenuService,
    private location: Location,
    private router: Router) {
  }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> {

    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    if (!isUndefined(userOperdInfo) && userOperdInfo.select_cid > 0 && userOperdInfo.select_uid > 0) {
      this.menuService.isCompany = false;
      this.customDatasService.loadData(userOperdInfo.select_cid);
      return observableOf(true);

    } else {
      this.message.info('您目前没有可管理的广告主，请找系统管理员分配', { nzDuration: 5000 });
      this.store$.dispatch(new AuthActions.LogoutAction());
      return observableOf(false);
    }
  }


}
