import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../../shared/shared.module";
import { RouterModule, Routes } from "@angular/router";
import { LayoutLeftMenuModule } from "../../module/layout-left-menu/layout-left-menu.module";
import { AssetManagementComponent } from './asset-management.component';
import { CustomAudienceComponent } from './components/custom-audience/custom-audience.component';
import { CanDeactivateGuard } from '../../core/guard/can-deactivate.guard';
import { AudienceListComponent } from './components/custom-audience/components/audience-list/audience-list.component';
import { UploadAudienceListComponent } from './components/custom-audience/components/upload-audience-list/upload-audience-list.component';
import { SyncCustomAudienceComponent } from './modal/sync-custom-audience/sync-custom-audience.component';
import { UploadCustomAudienceComponent } from './modal/upload-custom-audience/upload-custom-audience.component';
import { PushAccountComponent } from './modal/push-account/push-account.component';
import { PushAccountLogComponent } from './modal/push-account-log/push-account-log.component';
import { ParseToolComponent } from './components/parse-tool/parse-tool.component';
import { NoteIdComponent } from './components/parse-tool/components/note-id/note-id.component';
import { HotTableModule } from '@jzl/hot-table6';
import {LandingPageComponent} from "./components/landing-page/landing-page.component";
import {AddLandingPageBaiduComponent} from "./components/landing-page/landing-page-baidu/add-landing-page-baidu/add-landing-page-baidu.component";
import {LandingPageListBaiduComponent} from "./components/landing-page/landing-page-baidu/landing-page-list-baidu/landing-page-list-baidu.component";
import { AppNaUrlComponent } from './components/app-na-url/app-na-url.component';
import {AddNaUrlBaiduComponent} from "./components/app-na-url/app-na-url-baidu/add-na-url-baidu/add-na-url-baidu";
import {NaUrlListBaiduComponent} from "./components/app-na-url/app-na-url-baidu/na-url-list-baidu/na-url-list-baidu";
import { DownloadAppComponent } from './components/download-app/download-app.component';
import { DownloadAppAndriodComponent } from './components/download-app/components/download-app-andriod/download-app-andriod.component';
import { DownloadAppIosComponent } from './components/download-app/components/download-app-ios/download-app-ios.component';
import { AddDownloadAppAndroidComponent } from './components/download-app/components/download-app-andriod/components/add-download-app-android/add-download-app-android.component';
import { AddDownloadAppIosComponent } from './components/download-app/components/download-app-ios/components/add-download-app-ios/add-download-app-ios.component';


const routes: Routes = [
  {
    path: '',
    component: AssetManagementComponent,
    children: [
      { path: '', pathMatch: 'full' },
      {
        path: 'custom_audience',
        component: CustomAudienceComponent,
        children: [
          { path: '', redirectTo: 'audience_list', pathMatch: 'full' },
          {
            path: 'audience_list', component: AudienceListComponent,
          },
          { path: 'upload_audience_list', component: UploadAudienceListComponent, canDeactivate: [CanDeactivateGuard] },
        ]
      },
      {
        path: 'parse_tool',
        component: ParseToolComponent,
        children: [
          { path: '', redirectTo: 'note_id', pathMatch: 'full' },
          {
            path: 'note_id', component: NoteIdComponent,
          },
        ]
      },
      {
        path: 'landing_page',
        component: LandingPageComponent,
      },
      {
        path: 'app_na_url',
        component: AppNaUrlComponent,
      },
      {
        path: 'download_app',
        component: DownloadAppComponent,
        children: [
          { path: '', redirectTo: 'android', pathMatch: 'full' },
          {path: 'android', component: DownloadAppAndriodComponent},
          { path: 'ios', component: DownloadAppIosComponent},
        ]
      },
    ]
  },
];
@NgModule({
  declarations: [
    AssetManagementComponent,
    CustomAudienceComponent,
    AudienceListComponent,
    UploadAudienceListComponent,
    SyncCustomAudienceComponent,
    UploadCustomAudienceComponent,
    PushAccountComponent,
    PushAccountLogComponent,
    ParseToolComponent,
    NoteIdComponent,
    LandingPageComponent,
    AddLandingPageBaiduComponent,
    LandingPageListBaiduComponent,
    AppNaUrlComponent,
    AddNaUrlBaiduComponent,
    NaUrlListBaiduComponent,
    DownloadAppComponent,
    DownloadAppAndriodComponent,
    DownloadAppIosComponent,
    AddDownloadAppAndroidComponent,
    AddDownloadAppIosComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    LayoutLeftMenuModule,
    HotTableModule
  ]
})
export class AssetManagementModule { }
