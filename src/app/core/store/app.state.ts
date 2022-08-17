import {Auth} from "../entry/auth";
import {V5Init} from "../entry/v5init";


export interface AppState {
  auth: Auth;
  init: V5Init;
}
