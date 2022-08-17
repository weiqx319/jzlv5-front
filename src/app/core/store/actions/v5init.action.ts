import {Action} from '@ngrx/store';
import {Auth, Err, User} from '../../entry';
import {V5Init} from "../../entry/v5init";

export namespace V5InitActionTypes {
  export const INIT = 'init';
  export const LOGGED = 'logged ';
  export const LOGOUT = 'logout ';
}


export namespace V5InitActions {
  export class InitAction implements Action {
    readonly type = V5InitActionTypes.INIT;

    constructor(public payload: V5Init) {
    }
  }

  export class LoggedAction implements Action {
    readonly type = V5InitActionTypes.LOGGED;

    constructor() {
    }
  }
  export class LogOutAction implements Action {
    readonly type = V5InitActionTypes.LOGOUT;

    constructor() {
    }
  }

  export type Actions
    = InitAction
    | LoggedAction
    | LogOutAction;
}
