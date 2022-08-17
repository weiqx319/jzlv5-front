import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "../../shared/shared.module";
import {DndModule} from "ng2-dnd";
import {RouterModule, Routes} from "@angular/router";
import {TableSettingModule} from '../../module/table-setting/table-setting.module';
import {TableHeaderFilterModule} from '@jzl/table-header-filter';
import {ConstraintConditionModule} from "../../module/constraint-condition/constraint-condition.module";
import {BookmarkModule} from "../../module/bookmark/bookmark.module";
import {QueryRankingModule} from "../../module/query-ranking/query-ranking.module";
import {ViewChartModule} from "../../module/view-chart/view-chart.module";
import {DataViewOperationModule} from "../../module/data-view-operation/data-view-operation.module";
import {MonitorComponent} from "./monitor.component";
import {MonitorService} from "./service/monitor.service";
import { MonitorModuleListComponent } from './component/monitor-module-list/monitor-module-list.component';
import { MonitorModuleDetailComponent } from './component/monitor-module-detail/monitor-module-detail.component';
import {DataViewService} from "../data-view/service/data-view.service";
import {OptimizationItemService} from "../optimization/service/optimization-item.service";
import {ReportService} from "../report/service/report.service";
import {OptimizationDetailRankingService} from "../optimization/optimization-detail/service/optimization-detail-ranking.service";
import {OptimizationService} from "../optimization/service/optimization.service";
import { MonitorModuleComponent } from './component/monitor-module/monitor-module.component';
import { MonitorModuleSettingComponent } from './component/monitor-module-setting/monitor-module-setting.component';
import { MonitorChartComponent } from './modal/monitor-chart/monitor-chart.component';
import {TableTimeModule} from '../../module/table-time/table-time.module';
import { MonitorModuleLogComponent } from './component/monitor-module-log/monitor-module-log.component';


const routes: Routes = [
  {
    path: '',
    component: MonitorComponent
  },
  {
    path: ':id',
    children: [
      {
        path: '',
        component: MonitorModuleComponent,
        children: [
          {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full'
          },
          {
            path: 'list',
            component: MonitorModuleListComponent
          },
          {
            path: 'setting',
            component: MonitorModuleSettingComponent
          },
          {
            path: 'log',
            component: MonitorModuleLogComponent
          },
        ]
      },
      {
        path: ':moduleId',
        component: MonitorModuleDetailComponent,

      }
    ]
  }
];


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    DndModule.forRoot(),
    TableSettingModule,
    TableTimeModule,
    TableHeaderFilterModule,
    ConstraintConditionModule,
    BookmarkModule,
    QueryRankingModule,
    ViewChartModule,
    DataViewOperationModule
  ],
  declarations: [MonitorComponent, MonitorModuleListComponent, MonitorModuleDetailComponent, MonitorModuleComponent, MonitorModuleSettingComponent, MonitorChartComponent, MonitorModuleLogComponent],
  providers: [MonitorService, DataViewService, OptimizationItemService, ReportService, OptimizationDetailRankingService, OptimizationService]
})
export class MonitorModule { }
