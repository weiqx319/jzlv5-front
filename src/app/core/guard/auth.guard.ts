
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from "@ngrx/store";
import { Auth } from "../entry/auth";
import { AuthService } from "../service/auth.service";
import { AuthActions } from "../store/actions/auth.action";
import { AppState } from "../store/app.state";
import { V5InitActions } from "../store/actions/v5init.action";
import { NotifyService } from "../../module/notify/notify.service";
import { MenuService } from '../service/menu.service';

@Injectable()
export class AuthGuard implements CanActivate {



  constructor(private store$: Store<AppState>, private authService: AuthService, private notifyService: NotifyService,
    private router: Router,
  ) {
  }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // if (this.authService.getIsLogin()) {
    //   return Observable.of(true);
    // } else {
    return this.refreshLogin(state.url);
    // }

  }



  refreshLogin(url): Observable<boolean> {
    return this.authService.checkIsLogin().pipe(map((data: Auth) => {
      if (data.isLogin) {
        this.store$.dispatch(new V5InitActions.LoggedAction());
        this.store$.dispatch(new AuthActions.LoginRefreshSuccessAction(data));
        if (data.user.role_id === 7) {
          if (!(url.indexOf('/manage') === 0)) {
            this.router.navigateByUrl('/manage');
            return false;
          }
        }
        this.notifyService.initListAccountPending();

        return true;
      } else {
        this.store$.dispatch(new AuthActions.LogoutAction());
        this.store$.dispatch(new V5InitActions.LogOutAction());
        return false;
      }

    }));

  }



}
