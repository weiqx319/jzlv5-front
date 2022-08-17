import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EffectsModule} from "@ngrx/effects";
import {AuthEffects} from "./effects/auth.effects";
import {ActionReducer, ActionReducerMap, StoreModule} from "@ngrx/store";

import * as fromAuth from './reducers/auth.reducer';
import * as v5InitReducer from './reducers/v5init.reducer';
import {AuthActionTypes} from './actions/auth.action';
import {Auth} from "../entry/auth";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {V5Init} from "../entry/v5init";



const EFFECTS = [
  AuthEffects
];

export interface State {
  auth: Auth;
  init: V5Init;
}

export const reducers: ActionReducerMap<State> = {
  auth: fromAuth.reducer,
  init: v5InitReducer.reducer
};

export function storeStateGuard(reducer: ActionReducer<State>): ActionReducer<State> {
  return function(state, action) {
    if (action.type === AuthActionTypes.LOGOUT) {
      return reducer(undefined, action);
    }

    return reducer(state, action);
  };
}


@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot(reducers, { metaReducers: [storeStateGuard] }),
    // StoreRouterConnectingModule,
    EffectsModule.forRoot([...EFFECTS]),
    StoreDevtoolsModule.instrument({ maxAge: 50 })
  ],
  declarations: []
})
export class StoresModule { }
