import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import {LayoutModule} from './container/layout.module';
import { LoginComponent } from './routes/user/login/login.component';
import {AuthGuard} from "./core/guard/auth.guard";
import {CustomDatasService} from "./shared/service/custom-datas.service";
import { RegisterComponent } from './routes/user/register/register.component';
import {RegisterResultComponent} from "./routes/user/register-result/register-result.component";
import {ItemOperationsService} from './shared/service/item-operations.service';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import {OauthComponent} from "./routes/user/oauth/oauth.component";
import {ForgetPasswordComponent} from "./routes/user/forget-password/forget-password.component";
import {NotifyModule} from "./module/notify/notify.module";
import { HelpCenterComponent } from './routes/help-center/help-center.component';
import {DetailComponent} from "./routes/help-center/component/detail/detail.component";
import {ListComponent} from "./routes/help-center/component/list/list.component";
import {OauthFailComponent} from "./routes/user/oauth-fail/oauth-fail.component";

import { ConversionOauthComponent } from './routes/user/conversion-oauth/conversion-oauth.component';
import { ConversionOauthFailComponent } from './routes/user/conversion-oauth-fail/conversion-oauth-fail.component';
import {SetSummaryTimeModule} from "./module/set-summary-time/set-summary-time.module";
import {RemoveCode53Module} from "./module/removeCode53/removeCode53.module";
import {DateDefineService} from "./shared/service/date-define.service";
import {environment} from '../environments/environment';
import {ProductDataService} from '@jzl/jzl-product';

registerLocaleData(zh);


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    RegisterResultComponent,
    OauthComponent,
    OauthFailComponent,
    ForgetPasswordComponent,
    ConversionOauthComponent,
    ConversionOauthFailComponent,
   /* HelpCenterComponent,
    DetailComponent,
    ListComponent,*/
    // QuestionFeedbackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule.forRoot(environment),
    LayoutModule,
    NotifyModule,
    SetSummaryTimeModule,
    RemoveCode53Module,
  ],
  providers: [CustomDatasService, ItemOperationsService, ProductDataService,DateDefineService],
  bootstrap: [AppComponent]
})
export class AppModule { }
