import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {DashboardComponent} from './dashboard.component';
import {RouterModule, Routes} from '@angular/router';
import { DashboardNavComponent } from './components/dashboard-nav/dashboard-nav.component';
import { DashboardRightSidebarComponent } from './components/dashboard-right-sidebar/dashboard-right-sidebar.component';
import { DashboardDetailComponent } from './dashboard-detail/dashboard-detail.component';
import {ChangeSizeService} from "./service/change-size.service";
import {DashboardService} from "./service/dashboard.service";
import {NewDashboardTabComponent} from "./modal/new-dashboard-tab/new-dashboard-tab.component";
import { NewChartComponent } from './modal/new-chart/new-chart.component';
import { CopyChartComponent } from './modal/copy-chart/copy-chart.component';
import { AddChartComponent } from './components/add-chart/add-chart.component';
import {EmptyChartComponent} from "./components/empty-chart/empty-chart.component";
import { ChartSettingComponent } from './components/chart-setting/chart-setting.component';
import {DndModule} from "ng2-dnd";
import {ChartStructureService} from "./service/chart-structure.service";
import { ChartDataSettingComponent } from './components/chart-data-setting/chart-data-setting.component';
import { RegionSelectComponent } from './components/region-select/region-select.component';
import {RegionListService} from "./service/region-list.service";
import {ItemSelectModule} from "../../module/item-select/item-select.module";
import {AuthorizationBindingComponent} from "./modal/authorization-binding/authorization-binding.component";
import {JzlChartModule} from "../../module/jzl-chart/jzl-chart.module";
import {TableTimeModule} from '../../module/table-time/table-time.module';
const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        data: {
          title: 'list',
        },
      },
      {
        path: ':id',
        component: DashboardDetailComponent,
        data: {
          title: 'detail',
        },
      },
    ],
    runGuardsAndResolvers: 'always',

  },
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ItemSelectModule,
    RouterModule.forChild(routes),
    DndModule.forRoot(),
    JzlChartModule,
    TableTimeModule,
  ],
  declarations: [
    DashboardComponent,
    DashboardNavComponent,
    DashboardRightSidebarComponent,
    DashboardDetailComponent,
    NewDashboardTabComponent,
    NewChartComponent,
    CopyChartComponent,
    AddChartComponent,
    EmptyChartComponent,
    ChartSettingComponent,
    ChartDataSettingComponent,
    RegionSelectComponent,
    AuthorizationBindingComponent,
  ],
  providers: [
    ChangeSizeService,
    DashboardService,
    ChartStructureService,
    RegionListService,
  ],
  entryComponents: [
    NewDashboardTabComponent,
    NewChartComponent,
    CopyChartComponent,
    AuthorizationBindingComponent,
  ],
  exports: [
    RouterModule,
  ],
})
export class DashboardModule { }
