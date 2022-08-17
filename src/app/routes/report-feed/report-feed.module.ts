import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportComponent } from './report.component';
import {RouterModule, Routes} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import { ReportListComponent } from './report-list/report-list.component';
import { ReportEditComponent } from './report-edit/report-edit.component';
import {DndModule} from "ng2-dnd";
import { ReportTableShowComponent } from './report-edit/components/report-table-show/report-table-show.component';
import { ReportChartComponent } from './report-edit/components/report-chart/report-chart.component';
import {ReportService} from './service/report.service';
import {ItemSelectModule} from "../../module/item-select/item-select.module";
import {ReportChartShowComponent} from "./report-edit/components/report-chart-show/report-chart-show.component";
import {ReportReportHistoryJobComponent} from "./report-list/components/report-history-job/report-history-job.component";

import {TableHeaderFilterModule} from '@jzl/table-header-filter';
import { ResponsibleReportComponent } from './modal/responsible-report/responsible-report.component';
import {TableTimeModule} from '../../module/table-time/table-time.module';
import {BizEffectModalComponent} from './modal/biz-effect-modal/biz-effect-modal.component';
import {BizHoursModalComponent} from './modal/biz-hours-modal/biz-hours-modal.component';
import {TableSettingModule} from '../../module/table-setting/table-setting.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: ReportListComponent,
    data: {
      title: 'list'
    }
  },
  {
    path: 'create',
    component: ReportEditComponent,
    data: {
      title: 'list'
    }
  },
  {
    path: 'detail/:id',
    component: ReportEditComponent,
    data: {
      title: 'list'
    }
  }

];


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ItemSelectModule,
    RouterModule.forChild(routes),
    DndModule.forRoot(),
    TableSettingModule,
    TableTimeModule,
    TableHeaderFilterModule,
  ],
  declarations: [
    ReportComponent,
    ReportListComponent,
    ReportEditComponent,
    ReportTableShowComponent,
    ReportChartComponent,
    ReportChartShowComponent,
    ReportReportHistoryJobComponent,
    ResponsibleReportComponent,
    BizEffectModalComponent,
    BizHoursModalComponent,

  ],
  providers: [
    ReportService
  ],
  entryComponents: [
    ReportChartComponent,
    ReportReportHistoryJobComponent,
    ResponsibleReportComponent],
  exports: [
    RouterModule
  ]
})
export class ReportFeedModule { }
