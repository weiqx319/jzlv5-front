import { Auth } from '../../entry';
import { AuthActionTypes, AuthActions } from '../actions/auth.action';

export const initialState: Auth = { isFailure: false, isSuccess: false, isLogin: false, failureMsg: '', msgFailureMsg: '' };

export function reducer(state: Auth = initialState, action: AuthActions.Actions): Auth {
  switch (action.type) {
    case AuthActionTypes.LOGIN_SUCCESS:
    case AuthActionTypes.LOGIN_SREFRESH_UCCESS:
    case AuthActionTypes.REGISTER_SUCCESS: {
      const auth = action.payload as Auth;
      return Object.assign(state, auth);
    }
    case AuthActionTypes.LOGIN_FAIL:
    case AuthActionTypes.REGISTER_FAIL: {
      const auth = action.payload as Auth;
      return {
        isLogin: false,
        isSuccess: false,
        isFailure: true,
        failureMsg: auth.failureMsg,
        msgFailureMsg: auth.msgFailureMsg
      };
    }
    case AuthActionTypes.LOGOUT: {
      return {
        isLogin: false,
        isSuccess: false,
        isFailure: false,
      };
    }
    default: {
      return state;
    }
  }
}
