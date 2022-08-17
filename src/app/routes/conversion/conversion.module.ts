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
import {DataViewService} from "../data-view/service/data-view.service";
import {OptimizationItemService} from "../optimization/service/optimization-item.service";
import {ReportService} from "../report/service/report.service";
import {OptimizationDetailRankingService} from "../optimization/optimization-detail/service/optimization-detail-ranking.service";
import {OptimizationService} from "../optimization/service/optimization.service";
import {ConversionComponent} from "./conversion.component";
import {MonitorService} from "../monitor/service/monitor.service";
import {ViewItemService} from "../data-view/service/view-item.service";
import {TableTimeModule} from '../../module/table-time/table-time.module';
import {DataStackService} from '../../shared/service/data-stack.service';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: ConversionComponent,
    data: {
      title: 'list'
    }
  },
  /*{
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
        ]
      },
      {
        path: ':moduleId',
        component: MonitorModuleDetailComponent,

      }
    ]
  }*/
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
  declarations: [ConversionComponent],
  providers: [
    DataViewService, ViewItemService, ReportService, DataStackService
  ],})
export class ConversionModule { }
