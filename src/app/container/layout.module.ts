import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutFullComponent } from './layout-full/layout-full.component';
import { LayoutSimpleComponent } from './layout-simple/layout-simple.component';
import {SharedModule} from '../shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { LayoutGuardComponent } from './layout-guard/layout-guard.component';
import { LayoutRegisterComponent } from './layout-register/layout-register.component';
import { HeaderNotifyComponent } from './header/components/header-notify/header-notify.component';
import {LayoutOauthComponent} from "./layout-oauth/layout-oauth.component";
import {RegisterProcessModule} from "../module/register-process/register-process.module";
import {LayoutManageComponent} from './layout-manage/layout-manage.component';

const COMPONENTS = [
   LayoutManageComponent,
   LayoutFullComponent,
   LayoutSimpleComponent,
   LayoutGuardComponent,
   LayoutOauthComponent
];



@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    BrowserAnimationsModule,
    RegisterProcessModule,
  ],
  declarations: [
    ...COMPONENTS,
    HeaderComponent,
    FooterComponent,
    LayoutRegisterComponent,
    HeaderNotifyComponent
  ],
  exports: COMPONENTS
})
export class LayoutModule { }
