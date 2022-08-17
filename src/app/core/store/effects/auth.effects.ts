import { catchError, switchMap, map, window } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { AuthService } from '../../service/auth.service';
import { AuthActions, AuthActionTypes } from '../actions/auth.action';
import { Auth } from "../../entry/auth";
import { LocalStorageService } from "ngx-webstorage";
import { MenuService } from './../../service/menu.service';

@Injectable()
export class AuthEffects {

  /**
   *
   */
  @Effect()
  login$: Observable<Action> = this.actions$.pipe(
    ofType<AuthActions.LoginAction>(AuthActionTypes.LOGIN),
    map((action: AuthActions.LoginAction) => action.payload),
    switchMap((val: { email?: string; password?: string, mobile?: string, verification_code?: string, keep_alive: boolean, type: string }) => this.authService
      .login(val).pipe(
        map(auth => {
          if (!auth.isFailure) {
            this.localSt.store('v5_last_login_user', { email: val.email });
            return new AuthActions.LoginSuccessAction(auth);
          } else {
            return new AuthActions.LoginFailAction({
              isFailure: true,
              failureMsg: auth.failureMsg,
              msgFailureMsg: auth.msgFailureMsg
            });
          }

        }),
        catchError(err => of(new AuthActions.LoginFailAction({
          status: 501,
          message: err.message,
          exception: err.stack,
          path: '/login',
          timestamp: new Date(),
          isFailure: true
        }))))
    )
  );



  @Effect({ dispatch: false })
  navigateHome$ = this.actions$.pipe(
    ofType<AuthActions.LoginSuccessAction>(AuthActionTypes.LOGIN_SUCCESS),
    map((action: AuthActions.LoginSuccessAction) => action.payload),
    map((data: Auth) => {
      this.authService.setIsLogin(true);

      const jzlScript = document.createElement("script");
      jzlScript.appendChild(document.createTextNode("if(analytics) {analytics.identify(" + data.user.user_id + ", {})}"));

      document.body.appendChild(jzlScript);

      this.authService.setCurrentUser(data.user);
      if (data.user.role_id === 7) {
        this.router.navigateByUrl('/manage');
      } else {
        this.router.navigateByUrl('/');
      }

    }))
    ;

  @Effect({ dispatch: false })
  loginRefreshSuccess$ = this.actions$.pipe(
    ofType<AuthActions.LoginRefreshSuccessAction>(AuthActionTypes.LOGIN_SREFRESH_UCCESS),
    map((action: AuthActions.LoginRefreshSuccessAction) => action.payload),
    map((data: Auth) => {
      this.authService.setIsLogin(true);
      this.authService.setCurrentUser(data.user);
    }))
    ;


  // @Effect()
  // navigateHome$ = this.actions$
  //   .ofType<AuthActions.LoginSuccessAction>(AuthActionTypes.LOGIN_SUCCESS)
  //   .map(() => this.router.navigateByUrl('/'));


  @Effect()
  registerAndHome$ = this.actions$.pipe(
    ofType<AuthActions.RegisterSuccessAction>(AuthActionTypes.REGISTER_SUCCESS),
    map(() => {
      const localFeed = this.getLocalFeed();
      let channel_id = 1;
      if (!localFeed) {
        channel_id = 1;
      } else {
        channel_id = localFeed.channel_id;
      }
      // this.router.navigateByUrl('/dashboard/' + channel_id);
      this.router.navigateByUrl('/');
    }));

  @Effect({ dispatch: false })
  logout$ = this.actions$.pipe(
    ofType<AuthActions.LogoutAction>(AuthActionTypes.LOGOUT),
    map(() => {
      this.authService.setIsLogin(false);
      this.router.navigateByUrl('/login');
    }), switchMap(() => {
      return this.authService.logOut().pipe(
        map(() => true));
    }));



  constructor(
    private actions$: Actions,
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private localSt: LocalStorageService
  ) { }

  // -- 保存或获取本地缓存的信息
  getLocalFeed() {
    const currentUser = this.authService.getCurrentUser();
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    const cacheKey = 'channel_id_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
    return this.localSt.retrieve(cacheKey);
  }


}
