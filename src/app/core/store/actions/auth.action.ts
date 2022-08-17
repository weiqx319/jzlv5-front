import { Action } from '@ngrx/store';
import { Auth, Err, User } from '../../entry';
export namespace AuthActionTypes {
  export const LOGIN = '[Auth] Login';
  export const LOGIN_SUCCESS = '[Auth] Login Success';
  export const LOGIN_SREFRESH_UCCESS = '[Auth] Refresh Login Success';
  export const LOGIN_FAIL = '[Auth] Login Fail';
  export const REGISTER = '[Auth] Register';
  export const REGISTER_SUCCESS = '[Auth] Register Success';
  export const REGISTER_FAIL = '[Auth] Register Fail';
  export const LOGOUT = '[Auth] Logout';
}


export namespace AuthActions {
  export class LoginAction implements Action {
    readonly type = AuthActionTypes.LOGIN;

    constructor(public payload: { email?: string; password?: string, mobile?: string, verification_code?: string, keep_alive: boolean, type: string }) {
    }
  }
  export class LoginSuccessAction implements Action {
    readonly type = AuthActionTypes.LOGIN_SUCCESS;

    constructor(public payload: Auth) {
    }
  }
  export class LoginRefreshSuccessAction implements Action {
    readonly type = AuthActionTypes.LOGIN_SREFRESH_UCCESS;

    constructor(public payload: Auth) {
    }
  }

  export class LoginFailAction implements Action {
    readonly type = AuthActionTypes.LOGIN_FAIL;

    constructor(public payload: any) {
    }
  }

  export class RegisterAction implements Action {
    readonly type = AuthActionTypes.REGISTER;

    constructor(public payload: User) {
    }
  }

  export class RegisterSuccessAction implements Action {
    readonly type = AuthActionTypes.REGISTER_SUCCESS;

    constructor(public payload: Auth) {
    }
  }

  export class RegisterFailAction implements Action {
    readonly type = AuthActionTypes.REGISTER_FAIL;

    constructor(public payload: Err) {
    }
  }

  export class LogoutAction implements Action {
    readonly type = AuthActionTypes.LOGOUT;

    constructor() {
    }
  }

  export type Actions
    = LoginAction
    | LoginSuccessAction
    | LoginRefreshSuccessAction
    | LoginFailAction
    | RegisterAction
    | RegisterSuccessAction
    | RegisterFailAction
    | LogoutAction;
}
