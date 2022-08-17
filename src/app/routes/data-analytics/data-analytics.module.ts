import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { LayoutLeftMenuModule } from "../../module/layout-left-menu/layout-left-menu.module";
import { DataAnalyticsComponent } from './data-analytics.component';
import { DataAnalyticsViewComponent } from './component/data-analytics-view/data-analytics-view.component';

import { DataAnalyticsTableComponent } from './modal/data-analytics-table/data-analytics-table.component';


import { TableHeaderFilterModule } from '@jzl/table-header-filter';
import { ViewChartModule } from '../../module/view-chart/view-chart.module';
import { QuickBackupModule } from '../../module/quick-backup/quick-backup.module';
import { ShowScheduleModule } from '../../module/show-schedule/show-schedule.module';
import { BookmarkModule } from '../../module/bookmark/bookmark.module';
import { TableSettingModule } from '../../module/table-setting/table-setting.module';
import { TableTimeModule } from '../../module/table-time/table-time.module';

import { DataViewService } from '../data-view/service/data-view.service';
import { ReportService } from '../report/service/report.service';
import { ViewItemService } from '../data-view/service/view-item.service';
import { DataStackService } from '../../shared/service/data-stack.service';
import { OcpcReportModalComponent } from './modal/ocpc-report-modal/ocpc-report-modal.component';
import { BizTableModalComponent } from './modal/biz-table-modal/biz-table-modal.component';

const routes: Routes = [
  {
    path: '',
    component: DataAnalyticsComponent,
    children: [
      { path: '', redirectTo: "account", pathMatch: 'full' },
      { path: 'publisher', component: DataAnalyticsViewComponent, data: { summaryType: 'publisher', group_type: 'effect_report' }, },
      { path: 'account', component: DataAnalyticsViewComponent, data: { summaryType: 'account', group_type: 'effect_report' }, },
      { path: 'campaign', component: DataAnalyticsViewComponent, data: { summaryType: 'campaign', group_type: 'effect_report' }, },
      { path: 'group', component: DataAnalyticsViewComponent, data: { summaryType: 'adgroup', group_type: 'effect_report' }, },
      { path: 'keyword', component: DataAnalyticsViewComponent, data: { summaryType: 'keyword', group_type: 'effect_report' }, },
      { path: 'creative', component: DataAnalyticsViewComponent, data: { summaryType: 'creative', group_type: 'effect_report' }, },
      { path: 'search_keyword', component: DataAnalyticsViewComponent, data: { summaryType: 'search_keyword', group_type: 'effect_report' }, },
      { path: 'target', component: DataAnalyticsViewComponent, data: { summaryType: 'target', group_type: 'effect_report' }, },

      { path: 'ocpc/dsa_pattern_day', component: DataAnalyticsViewComponent, data: { summaryType: 'dsa_pattern_day', group_type: 'ocpc_report' } },
      { path: 'ocpc/ocpc_baidu_report', component: DataAnalyticsViewComponent, data: { summaryType: 'ocpc_baidu_report', group_type: 'ocpc_report' } },
      { path: 'ocpc/ocpc_360', component: DataAnalyticsViewComponent, data: { summaryType: 'ocpc_360', group_type: 'ocpc_report' } },

      { path: 'responsible_account', component: DataAnalyticsViewComponent, data: { summaryType: 'responsible_account', group_type: 'dimension_report' } },
      { path: 'landing_page_account', component: DataAnalyticsViewComponent, data: { summaryType: 'landing_page_account', group_type: 'dimension_report' } },
      { path: 'biz_unit_report', component: DataAnalyticsViewComponent, data: { summaryType: 'biz_unit_report', group_type: 'dimension_report' } },
      { path: 'biz_unit_hours_report', component: DataAnalyticsViewComponent, data: { summaryType: 'biz_unit_hours_report', group_type: 'dimension_report' } },
      { path: 'biz_unit_region_report', component: DataAnalyticsViewComponent, data: { summaryType: 'biz_unit_region_report', group_type: 'dimension_report' } },
      { path: 'biz_unit_campaign_report', component: DataAnalyticsViewComponent, data: { summaryType: 'biz_unit_campaign_report', group_type: 'dimension_report' } },
      { path: 'biz_unit_adgroup_report', component: DataAnalyticsViewComponent, data: { summaryType: 'biz_unit_adgroup_report', group_type: 'dimension_report' } },
      { path: 'biz_unit_keyword_report', component: DataAnalyticsViewComponent, data: { summaryType: 'biz_unit_keyword_report', group_type: 'dimension_report' } },

      { path: 'country', component: DataAnalyticsViewComponent, data: { summaryType: 'country', group_type: 'target_report' } },
      { path: 'province', component: DataAnalyticsViewComponent, data: { summaryType: 'province', group_type: 'target_report' } },
      { path: 'city', component: DataAnalyticsViewComponent, data: { summaryType: 'city', group_type: 'target_report' } },
      { path: 'age', component: DataAnalyticsViewComponent, data: { summaryType: 'age', group_type: 'target_report' } },
      { path: 'education', component: DataAnalyticsViewComponent, data: { summaryType: 'education', group_type: 'target_report' } },
      { path: 'gender', component: DataAnalyticsViewComponent, data: { summaryType: 'gender', group_type: 'target_report' } },
      { path: 'interest', component: DataAnalyticsViewComponent, data: { summaryType: 'interest', group_type: 'target_report' } },
      { path: 'client', component: DataAnalyticsViewComponent, data: { summaryType: 'client', group_type: 'target_report' } },
      { path: 'material_style', component: DataAnalyticsViewComponent, data: { summaryType: 'material_style', group_type: 'target_report' } },
      { path: 'intention_keyword', component: DataAnalyticsViewComponent, data: { summaryType: 'intention_keyword', group_type: 'target_report' } },
      { path: 'ac', component: DataAnalyticsViewComponent, data: { summaryType: 'ac', group_type: 'target_report' } },
      { path: 'platform', component: DataAnalyticsViewComponent, data: { summaryType: 'platform', group_type: 'target_report' } },
      { path: 'landing_type', component: DataAnalyticsViewComponent, data: { summaryType: 'landing_type', group_type: 'target_report' } },
      { path: 'inventory_type', component: DataAnalyticsViewComponent, data: { summaryType: 'inventory_type', group_type: 'target_report' } },
      { path: 'pricing', component: DataAnalyticsViewComponent, data: { summaryType: 'pricing', group_type: 'target_report' } },
      { path: 'image_mode', component: DataAnalyticsViewComponent, data: { summaryType: 'image_mode', group_type: 'target_report' } },
    ],
  },
];



@NgModule({
  declarations: [
    DataAnalyticsComponent,
    DataAnalyticsViewComponent,
    DataAnalyticsTableComponent,
    OcpcReportModalComponent,
    BizTableModalComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    LayoutLeftMenuModule,


    TableHeaderFilterModule,
    ViewChartModule,
    QuickBackupModule,
    ShowScheduleModule,
    BookmarkModule,
    TableSettingModule,
    TableTimeModule
  ],
  providers: [
    DataViewService, ViewItemService, ReportService, DataStackService
  ],
  exports: [
    RouterModule,
  ]
})
export class DataAnalyticsModule { }
