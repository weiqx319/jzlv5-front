import {NgModule, SkipSelf, Optional, ModuleWithProviders} from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import { HttpClientService} from "./service/http.client";
import {HttpClientModule} from "@angular/common/http";

import {NgxWebstorageModule} from "ngx-webstorage";
import {AuthGuard} from "./guard/auth.guard";
import {AuthService} from "./service/auth.service";
import {StoresModule} from "./store/stores.module";
import {httpInterceptorProviders} from "./http-interceptors";
import {SelectUserCidSuccessGuard} from './guard/selectUserCidSuccess.guard';
import {MenuService} from "./service/menu.service";
import {LoadDefaultDataGuard} from "./guard/loadDefaultData.guard";
import {AutomationDataGuard} from "./guard/automation-data.guard";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NgxWebstorageModule.forRoot({ prefix: 'custom'}),
    StoresModule
  ],
  exports: [
    SharedModule,
    HttpClientModule,
    NgxWebstorageModule
  ],
  declarations: [],
  providers: [
    HttpClientService, AuthGuard, LoadDefaultDataGuard  ,AutomationDataGuard,AuthService, MenuService, SelectUserCidSuccessGuard,
    httpInterceptorProviders
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule) {
      if (parent) {
        throw new Error('模块已经存在，不能再次加载');
      }
  }

  static forRoot(environment: any): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [{provide: 'environment', useValue: environment}]
    };
  }
 }
