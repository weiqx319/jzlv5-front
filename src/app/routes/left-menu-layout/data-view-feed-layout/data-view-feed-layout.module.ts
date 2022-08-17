import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataViewFeedLayoutComponent } from "./data-view-feed-layout.component";
import { SharedModule } from '../../../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { LayoutLeftMenuModule } from "../../../module/layout-left-menu/layout-left-menu.module";
const routes: Routes = [
  {
    path: '',
    component: DataViewFeedLayoutComponent,
    children: [
      { path: '', redirectTo: "account", pathMatch: 'full' },
      { path: 'publisher', loadChildren: () => import('../../data-view-feed/data-view-feed.module').then(m => m.DataViewFeedModule), data: { summaryType: 'publisher' } },
      { path: 'account', loadChildren: () => import('../../data-view-feed/data-view-feed.module').then(m => m.DataViewFeedModule), data: { summaryType: 'account' } },
      { path: 'campaign', loadChildren: () => import('../../data-view-feed/data-view-feed.module').then(m => m.DataViewFeedModule), data: { summaryType: 'campaign' }},
      { path: 'group', loadChildren: () => import('../../data-view-feed/data-view-feed.module').then(m => m.DataViewFeedModule), data: { summaryType: 'adgroup' }},
      { path: 'keyword', loadChildren: () => import('../../data-view-feed/data-view-feed.module').then(m => m.DataViewFeedModule), data: { summaryType: 'keyword' } },
      { path: 'creative', loadChildren: () => import('../../data-view-feed/data-view-feed.module').then(m => m.DataViewFeedModule), data: { summaryType: 'creative' } },
      { path: 'search_keyword', loadChildren: () => import('../../data-view-feed/data-view-feed.module').then(m => m.DataViewFeedModule), data: { summaryType: 'search_keyword' }},
      { path: 'target', loadChildren: () => import('../../data-view-feed/data-view-feed.module').then(m => m.DataViewFeedModule), data: { summaryType: 'target' } },
    ],

  },
];

@NgModule({
  declarations: [DataViewFeedLayoutComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    LayoutLeftMenuModule
  ],
  exports:[
    RouterModule,
  ]
})
export class DataViewFeedLayoutModule { }
