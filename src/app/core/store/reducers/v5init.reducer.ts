import {V5Init} from "../../entry/v5init";
import { V5InitActions, V5InitActionTypes} from "../actions/v5init.action";


export const initialState: V5Init = {init: 'init'};

export function reducer(state: V5Init = initialState, action: V5InitActions.Actions): V5Init {
  switch (action.type) {
    case V5InitActionTypes.INIT: {
      return {
        init: 'init'
      };
    }
    case V5InitActionTypes.LOGGED: {
      return {
        init: 'logged'
      };
    }
    case V5InitActionTypes.LOGOUT: {
      return {
        init: 'logout'
      };
    }
    default: {
      return state;
    }
  }
}
