import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutFullComponent } from "./container/layout-full/layout-full.component";
import { LoginComponent } from "./routes/user/login/login.component";
import { LayoutGuardComponent } from "./container/layout-guard/layout-guard.component";
import { AuthGuard } from "./core/guard/auth.guard";
import { RegisterComponent } from "./routes/user/register/register.component";
import { LayoutRegisterComponent } from "./container/layout-register/layout-register.component";
import { RegisterResultComponent } from "./routes/user/register-result/register-result.component";
import { SelectUserCidSuccessGuard } from "./core/guard/selectUserCidSuccess.guard";
import { OauthComponent } from "./routes/user/oauth/oauth.component";
import { ForgetPasswordComponent } from "./routes/user/forget-password/forget-password.component";
import { LayoutOauthComponent } from "./container/layout-oauth/layout-oauth.component";
import { OauthFailComponent } from "./routes/user/oauth-fail/oauth-fail.component";
import { ConversionOauthComponent } from "./routes/user/conversion-oauth/conversion-oauth.component";
import { ConversionOauthFailComponent } from "./routes/user/conversion-oauth-fail/conversion-oauth-fail.component";
import { LoadDefaultDataGuard } from "./core/guard/loadDefaultData.guard";
import { AutomationDataGuard } from "./core/guard/automation-data.guard";
import { LayoutManageComponent } from './container/layout-manage/layout-manage.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutFullComponent,
    children: [
      { path: '', redirectTo: "dashboard", pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('./routes/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
      { path: 'data_view/sem', loadChildren: () => import('./routes/left-menu-layout/data-view-layout/data-view-layout.module').then(m => m.DataViewLayoutModule), canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
      { path: 'data_view/feed', loadChildren: () => import('./routes/left-menu-layout/data-view-feed-layout/data-view-feed-layout.module').then(m => m.DataViewFeedLayoutModule), canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
      { path: 'analytics/sem', loadChildren: () => import('./routes/data-analytics/data-analytics.module').then(m => m.DataAnalyticsModule), canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
      { path: 'analytics/feed', loadChildren: () => import('./routes/data-analytics/data-analytics.module').then(m => m.DataAnalyticsModule), canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
      { path: 'report/sem', loadChildren: () => import('./routes/report/report.module').then(m => m.ReportModule), canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
      { path: 'report/feed', loadChildren: () => import('./routes/report-feed/report-feed.module').then(m => m.ReportFeedModule), canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
      { path: 'materials', loadChildren: () => import('./routes/materials/materials.module').then(m => m.MaterialsModule), data: { summaryType: 'materials' }, canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
      { path: 'launch_rpa', loadChildren: () => import('./routes/launch-rpa/launch-rpa.module').then(m => m.LaunchRpaModule), data: { summaryType: 'launch_rpa' }, canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
      { path: 'optimization', loadChildren: () => import('./routes/optimization/optimization.module').then(m => m.OptimizationModule), data: { summaryType: 'optimization' }, canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
      { path: 'monitor', loadChildren: () => import('./routes/monitor/monitor.module').then(m => m.MonitorModule), data: {}, canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
      { path: 'conversion/sem', loadChildren: () => import('./routes/conversion/conversion.module').then(m => m.ConversionModule), data: {}, canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
      { path: 'automation', loadChildren: () => import('./routes/automation/automation.module').then(m => m.AutomationModule), data: {}, canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard, AutomationDataGuard] },
      { path: 'asset_management', loadChildren: () => import('./routes/asset-management/asset-management.module').then(m => m.AssetManagementModule), data: {}, canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
    ],

    canActivate: [AuthGuard],
  },
  {
    path: 'new',//新版本'/new'开头url重定向''
    redirectTo: "",
  },
  {
    path: 'manage',
    component: LayoutManageComponent,
    children: [
      { path: '', loadChildren: () => import('./routes/manage/manage.module').then(m => m.ManageModule), canActivate: [AuthGuard, SelectUserCidSuccessGuard, LoadDefaultDataGuard] },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: LayoutGuardComponent,
    children: [
      { path: '', component: LoginComponent }
    ]
  },
  {
    path: 'register-result',
    component: LayoutGuardComponent,
    children: [
      { path: '', component: RegisterResultComponent }
    ]
  },
  {
    path: 'register',
    component: LayoutRegisterComponent,
    children: [
      { path: '', component: RegisterComponent }
    ]
  },
  {
    path: 'oauth',
    component: LayoutOauthComponent,
    children: [
      { path: '', component: OauthComponent }
    ]
  },
  {
    path: 'oauth_fail',
    component: LayoutOauthComponent,
    children: [
      { path: '', component: OauthFailComponent }
    ]
  },
  {
    path: 'forget_password',
    component: LayoutRegisterComponent,
    children: [
      { path: '', component: ForgetPasswordComponent }
    ]
  },
  {
    path: 'help',
    children: [
      { path: '', loadChildren: () => import('./routes/help-center/help-center.module').then(m => m.HelpCenterModule) }
    ],
    canActivate: [],
  },
  {
    path: 'conversion_oauth',
    component: LayoutOauthComponent,
    children: [
      { path: '', component: ConversionOauthComponent }
    ]
  },
  {
    path: 'conversion_oauth_fail',
    component: LayoutOauthComponent,
    children: [
      { path: '', component: ConversionOauthFailComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload', relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
