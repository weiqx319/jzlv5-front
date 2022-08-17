
import { of as observableOf, Observable, Subject, BehaviorSubject } from 'rxjs';

import { map, catchError } from 'rxjs/operators';
import { Inject, Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Auth, User } from '../entry';
import { HttpClientService } from "./http.client";
import { LocalStorageService } from "ngx-webstorage";
import { isArray, isUndefined } from "@jzl/jzl-util";
import { AuthActions } from "../store/actions/auth.action";
import { NzMessageService } from 'ng-zorro-antd/message';
import { Store } from "@ngrx/store";
import { MenuService } from "./menu.service";

@Injectable()
export class AuthService {
  public messageUnreadCount = 0;

  private _isLogin = false;

  private _currentUser: User;

  public user$ = new Subject<User>();
  public refreshUser$ = new Subject<any>();

  private stop_back = '';
  private stop_back$ = new Subject<any>();


  private currentOperdInfo = { select_uid: 0, select_cid: 0, role_id: 0 };
  private currentAdminOperdInfo = { select_uid: 0, role_id: 0 };
  public currentAdminUser$ = new BehaviorSubject<{ select_uid: number }>(null);

  public advertiserType: any;

  private is_scroll = '';
  private is_scroll$ = new Subject<any>();

  private is_scroll_change_size = '';
  private is_scroll_change_size$ = new Subject<any>();



  // constructor(private localSt: LocalStorageService) {
  //   const dashBoardSize = this.localSt.retrieve('dashBoardSize');

  constructor(private http: HttpClient, private _httpClient: HttpClientService,
    private menuService: MenuService,
    private message: NzMessageService,
    private localSt: LocalStorageService,
    private store$: Store<{ auth: Auth }>
  ) {
    this.refreshUser$.subscribe(() => {
      this.refreshUser();
    });
  }

  getIsScrollChangeSize(): Observable<any> {
    return this.is_scroll_change_size$;
  }

  setIsScrollChangeSize(data) {
    this.is_scroll_change_size = data;
    this.is_scroll_change_size$.next(data);
  }
  getIsScroll(): Observable<any> {
    return this.is_scroll$;
  }

  setIsScroll(data) {
    this.is_scroll = data;
    this.is_scroll$.next(data);
  }

  getStopBackState(): Observable<any> {
    return this.stop_back$;
  }

  setStopBackState(data) {
    this.stop_back = data;
    this.stop_back$.next(data);
  }

  getIsLogin(): boolean {
    return this._isLogin;
  }

  setIsLogin(isLogin): void {
    this._isLogin = isLogin;
  }


  getCurrentUser(): User {
    return this._currentUser;
  }

  setCurrentUser(user: User): void {
    if (user.role_id == 3) {
      const visualManageUser = {
        user_id: user.user_id * 100000000,
        user_name: '经理视图',
        mobile: '',
        email: '',
        company_id: user.company_id,
        user_status: '',
        role_id: 6,
        company_status: user.company_status,
        company_type: user.company_type,
        user_list: [],
        ad_list: [],
      } as User;
      const visualManageAdList = {};
      user.user_list.forEach((userInfo: User) => {
        userInfo.ad_list.forEach((adInfo) => {
          if (!visualManageAdList[adInfo.cid]) {
            visualManageAdList[adInfo.cid] = adInfo;
          }
        });
      });
      visualManageUser.ad_list = Object.values(visualManageAdList);
      user.user_list = [visualManageUser, ...user.user_list];
    }
    this._currentUser = user;
    this.loadCurrentUserOperdInfo();
    this.loadCurrentAdminUserOpedInfo();
    this.menuService.init(user, this.currentOperdInfo.role_id, this.currentOperdInfo.select_cid, user.menuData);
    this.user$.next(user);
  }


  loadCurrentUserOperdInfo(): void {
    const loadInfo = this.localSt.retrieve('user_oper_' + this._currentUser.user_id);
    if (loadInfo !== null) {
      const findUserInfo = this._currentUser.user_list.find(item => {
        return item.user_id === loadInfo.select_uid;
      });
      if (!isUndefined(findUserInfo)) {
        if (findUserInfo.ad_list.length > 0) {
          const findAdvertiser = findUserInfo.ad_list.find(item => {
            return item.cid === loadInfo.select_cid;
          });
          if (!isUndefined(findAdvertiser)) { // 存在说明权限有效
            if (loadInfo.role_id !== findUserInfo.role_id) {
              loadInfo.role_id = findUserInfo.role_id;
              this.storeCurrentUserOperdInfo(loadInfo);
            }
            this.currentOperdInfo = loadInfo;
          } else { // 用户无对应广告主权限，默认符成列表中的第一条
            this.currentOperdInfo = { select_uid: loadInfo.select_uid, select_cid: findUserInfo.ad_list[0]['cid'], role_id: findUserInfo.role_id };
            this.storeCurrentUserOperdInfo(this.currentOperdInfo);
          }
        } else { // 用户无广告主,,说明用户已无可用广告主，重新切换选取可用的最新一个用户和广告主
          this.getFirstAvailableUserAndCid();
        }
      } else { // 无对应的用户 -- 说明用户已经不可用
        this.getFirstAvailableUserAndCid();

      }
    } else {
      let currentSelectUser = {};
      if (this._currentUser.role_id === 1) {
        const findRole1Info = this._currentUser.user_list.find(item => {
          return item.role_id === 1;
        });
        if (!isUndefined(findRole1Info)) {
          currentSelectUser = findRole1Info;
        } else {
          currentSelectUser = this._currentUser.user_list[0];
        }
      } else if (this._currentUser.role_id === 3) {
        const findRole1Info = this._currentUser.user_list.find(item => {
          return item.role_id === 3;
        });
        if (!isUndefined(findRole1Info)) {
          currentSelectUser = findRole1Info;
        } else {
          currentSelectUser = this._currentUser.user_list[0];
        }
      } else {
        currentSelectUser = this._currentUser.user_list[0];
      }
      if (currentSelectUser && isArray(currentSelectUser['ad_list']) && currentSelectUser['ad_list'].length > 0) {
        this.storeCurrentUserOperdInfo({ select_uid: currentSelectUser['user_id'], select_cid: currentSelectUser['ad_list'][0]['cid'], role_id: currentSelectUser['role_id'] });
      } else { // -- 缺少广告主,不处理
        this.currentOperdInfo = { select_uid: 0, select_cid: 0, role_id: 0 };
      }
    }
  }

  getFirstAvailableUserAndCid() {
    const availableUser = this._currentUser.user_list.find(item => item.ad_list.length > 0);
    if (isUndefined(availableUser)) {
      this.currentOperdInfo = { select_uid: 0, select_cid: 0, role_id: 0 };
      this.localSt.clear('user_oper_' + this._currentUser.user_id);
    } else {
      this.storeCurrentUserOperdInfo({ select_uid: availableUser['user_id'], select_cid: availableUser['ad_list'][0]['cid'], role_id: availableUser['role_id'] });
    }



  }



  getCurrentUserOperdInfo(): { select_uid: number, select_cid: number, role_id: number } {
    return this.currentOperdInfo;
  }

  storeCurrentUserOperdInfo(data: { select_uid: number, select_cid: number, role_id: number }) {
    this.currentOperdInfo = data;
    this.localSt.store('user_oper_' + this._currentUser.user_id, data);
  }

  loadCurrentAdminUserOpedInfo(): void {
    const loadInfo = this.localSt.retrieve('user_oper_admin_' + this._currentUser.user_id);
    if (loadInfo !== null) {
      const findUserInfo = this._currentUser.user_list.find(item => {
        return item.user_id === loadInfo.select_uid;
      });
      if (!isUndefined(findUserInfo)) {
        loadInfo['role_id'] = findUserInfo['role_id'];
        this.currentAdminOperdInfo = loadInfo;
        this.currentAdminUser$.next(loadInfo);
      } else {
        this.storeCurrentAdminOperdInfo({ select_uid: this._currentUser.user_id, role_id: this._currentUser.role_id });
      }
    } else {
      this.storeCurrentAdminOperdInfo({ select_uid: this._currentUser.user_id, role_id: this._currentUser.role_id });
    }
  }


  getCurrentAdminOperdInfo(): { select_uid: number, role_id: number } {
    return this.currentAdminOperdInfo;
  }

  storeCurrentAdminOperdInfo(data: { select_uid: number, role_id: number }) {
    this.currentAdminOperdInfo = data;
    this.currentAdminUser$.next(data);
    this.localSt.store('user_oper_admin_' + this._currentUser.user_id, data);

  }












  login(bodyVal): Observable<Auth> {
    let url;
    let postBody;
    if (bodyVal.type === 'password') {
      // 账户密码登录
      url = '/auth/login?host=' + window.location.hostname;
      postBody = {
        'login_name': bodyVal.email,
        'login_password': bodyVal.password,
        'keep_alive': bodyVal.keep_alive
      };
    } else if (bodyVal.type === 'verification_code') {
      // 短信验证码登录
      url = '/auth/login_by_verification_code';
      postBody = {
        login_name: bodyVal.mobile,
        verification_code: bodyVal.verification_code,
        keep_alive: bodyVal.keep_alive,
      };
    }

    return this._httpClient
      .post(url, postBody).pipe(
        map((res) => {
          if (res.status_code === 200) {
            const userNew = res['data'] as User;
            return {
              user: userNew,
              isLogin: true,
              isSuccess: true,
              isFailure: false,
            };

          } else {
            if (bodyVal.type === 'password') {
              // 账户密码登录
              return {
                isLogin: false,
                isSuccess: false,
                isFailure: true,
                failureMsg: res.message
              };
            } else if (bodyVal.type === 'verification_code') {
              // 短信验证码登录
              return {
                isLogin: false,
                isSuccess: false,
                isFailure: true,
                msgFailureMsg: res.message
              };
            }
          }
        }));
  }

  logOut(): Observable<Auth> {
    const url = '/auth/logout';
    return this._httpClient
      .post(url, {}).pipe(
        map(() => {
          return {
            isLogin: false,
            isSuccess: false,
            isFailure: false,
          };
        }, () => {
          return {
            isLogin: false,
            isSuccess: false,
            isFailure: false,
          };
        }));
  }

  signup(body) {
    const url = '/auth/sign_up';
    return this._httpClient
      .post(url, body);
  }


  sendSingUpVerificationCode(mobile: string, product: string) {
    const url = '/auth/sign_up_send_verification_code';
    return this._httpClient
      .post(url, { mobile, product });
  }


  checkMobileOrEmailRepeat(body) {
    const url = '/auth/sign_up_check_mobile_or_email';
    return this._httpClient.post(url, body);
  }


  checkIsLogin(refresh = 0): Observable<Auth> {
    const url = '/auth/local?host=' + window.location.hostname;
    return this._httpClient
      .post(url, {}, { refresh }).pipe(
        map((res) => {
          if (res.status_code === 200) {
            const userNew = res['data'] as User;
            if (userNew.company_status === 0) {
              this.message.error('您注册的账号正在审核，请耐心等待。联系电话：400-803-8660', { nzDuration: 5000 });
              return {
                isLogin: false,
                isSuccess: false,
                isFailure: true,
                failureStatus: 1000
              };
            } else if (userNew.company_status === -1) {
              this.message.error('您的账户已经被停用。如果想继续使用该系统，请联系客服经理进行付费。联系电话：400-803-8660', { nzDuration: 5000 });
              return {
                isLogin: false,
                isSuccess: false,
                isFailure: true,
                failureStatus: -1
              };
            } else {
              return {
                user: userNew,
                isLogin: true,
                isSuccess: true,
                isFailure: false,
              };
            }
          } else {
            return {
              isLogin: false,
              isSuccess: false,
              isFailure: true,
            };
          }
        }), catchError((err, data) => {
          return observableOf({
            isLogin: false,
            isSuccess: false,
            isFailure: true,
          });
        }));
  }


  refreshUser(refresh = 1): any {
    return this.checkIsLogin(refresh).pipe(map((data: Auth) => {
      if (data.isLogin) {
        this.store$.dispatch(new AuthActions.LoginRefreshSuccessAction(data));
        // this.setIsLogin(true);
        // this.setCurrentUser(data.user);
      }
    })).subscribe(() => { });
  }

  getAccountInfo(code) {
    const url = '/oauth/check_oauth_code?oauth_code=' + code;
    return this._httpClient.get(url);
  }

  getAuthCodeImg() {
    const url = '/auth/auth_code';
    return this._httpClient.get(url);
  }

  forgetPasswordOneStep(oneStepData) {
    const url = '/auth/forget/check_user';
    return this._httpClient.get(url, oneStepData);
  }

  sendVerificationCode(phone, product) {
    const url = '/auth/forget/phone_code?mobile=' + phone + '&product=' + product;
    return this._httpClient.get(url);
  }

  forgetPasswordTwoStep(phone_code) {
    const url = '/auth/forget/check_phone_code?phone_code=' + phone_code;
    return this._httpClient.get(url);
  }

  resetPassword(data) {
    const url = '/auth/forget/reset_password';
    return this._httpClient.post(url, data);
  }
  getBizUnitList() {
    const url = '/define_list/biz_unit';
    return this._httpClient.get(url);
  }
  getIsLandingPage() {
    const url = '/define_list/landing_page_role';
    return this._httpClient.get(url);
  }


  // message
  getMessageList(params?): any {
    const url = "/message/list";
    return this._httpClient.get(url, params);
  }

  getUnreadMessageList(): any {
    const url = "/message/count";
    return this._httpClient.get(url);
  }

  // 短信登录
  sendLoginVerificationCode(mobile: string) {
    const url = '/auth/login_send_verification_code';
    return this._httpClient
      .post(url, { mobile });
  }

}



