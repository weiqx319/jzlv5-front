import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataViewLayoutComponent } from "./data-view-layout.component";
import { SharedModule } from '../../../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { LayoutLeftMenuModule } from "../../../module/layout-left-menu/layout-left-menu.module";
const routes: Routes = [
  {
    path: '',
    component: DataViewLayoutComponent,
    children: [
      { path: '', redirectTo: "account", pathMatch: 'full' },
      { path: 'publisher', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'publisher' }, },
      { path: 'account', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'account' }, },
      { path: 'campaign', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'campaign' }, },
      { path: 'group', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'adgroup' }, },
      { path: 'keyword', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'keyword' }, },
      { path: 'creative', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'creative' }, },
      { path: 'search_keyword', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'search_keyword' }, },
      { path: 'ocpc/ocpc_baidu', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'ocpc_baidu' } },
      { path: 'ocpc/creative_fengwu_360', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'creative_fengwu_360' } },
      { path: 'ocpc/ocpc_360', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'ocpc_360' } },
      { path: 'ocpc/ocpc_360_setting', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'ocpc_360_setting' } },
      { path: 'ocpc/dsa_pattern_day', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'dsa_pattern_day' } },
      { path: 'ocpc/ocpc_baidu_report', loadChildren: () => import('../../data-view/data-view.module').then(m => m.DataViewModule), data: { summaryType: 'ocpc_baidu_report' } },
    ],

  },
];

@NgModule({
  declarations: [DataViewLayoutComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    LayoutLeftMenuModule
  ],
  exports: [
    RouterModule,
  ]
})

export class DataViewLayoutModule { }
