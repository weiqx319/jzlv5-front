import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptimizationListComponent } from './optimization-list/optimization-list.component';
import { OptimizationDetailComponent } from './optimization-detail/optimization-detail.component';
import {SharedModule} from "../../shared/shared.module";
import {DndModule} from "ng2-dnd";
import {RouterModule, Routes} from "@angular/router";
import {ReportService} from "../report/service/report.service";
import {OptimizationService} from './service/optimization.service';
import { OptimizationDetailListComponent } from './optimization-detail/compoenent/optimization-detail-list/optimization-detail-list.component';
import { OptimizationDetailLogComponent } from './optimization-detail/compoenent/optimization-detail-log/optimization-detail-log.component';
import { OptimizationDetailSettingComponent } from './optimization-detail/compoenent/optimization-detail-setting/optimization-detail-setting.component';
import {TableSettingModule} from '../../module/table-setting/table-setting.module';
import { OptimizationDetailEffectComponent } from './optimization-detail-effect/optimization-detail-effect.component';
import { OptimizationDetailEffectListComponent } from './optimization-detail-effect/component/optimization-detail-effect-list/optimization-detail-effect-list.component';
import { OptimizationDetailEffectKwdListComponent } from './optimization-detail-effect/component/optimization-detail-effect-kwd-list/optimization-detail-effect-kwd-list.component';
import { OptimizationDetailEffectSettingComponent } from './optimization-detail-effect/component/optimization-detail-effect-setting/optimization-detail-effect-setting.component';
import {DataViewService} from "../data-view/service/data-view.service";
import {TableHeaderFilterModule} from '@jzl/table-header-filter';
import {OptimizationDetailListEditComponent} from "./optimization-detail/compoenent/optimization-detail-list-edit/optimization-detail-list-edit.component";
import {ConstraintConditionModule} from "../../module/constraint-condition/constraint-condition.module";
import {BookmarkModule} from "../../module/bookmark/bookmark.module";
import {QueryRankingModule} from "../../module/query-ranking/query-ranking.module";
import {OptimizationDetailEffectListEditComponent} from "./optimization-detail-effect/component/optimization-detail-effect-list-edit/optimization-detail-effect-list-edit.component";
import {ViewChartModule} from "../../module/view-chart/view-chart.module";
import {PauseSettingComponent} from "./modal/pause-setting/pause-setting.component";
import {EditOptimizationSettingComponent} from "./modal/edit-optimization-setting/edit-optimization-setting.component";
import {DataViewOperationModule} from "../../module/data-view-operation/data-view-operation.module";
import { EditOptimizationGroupComponent } from './modal/edit-optimization-group/edit-optimization-group.component';
import { BatchDelayModalComponent } from './modal/batch-delay-modal/batch-delay-modal.component';
import { EditOptimizationNameComponent } from './modal/edit-optimization-name/edit-optimization-name.component';
import { BatchUploadComponent } from './modal/batch-upload/batch-upload.component';
import { UploadListComponent } from './optimization-detail/compoenent/upload-list/upload-list.component';
import {EditMessageModule} from "../../module/edit-message/edit-message.module";
import { OptimizationGroupDetailsComponent } from './modal/optimization-group-details/optimization-group-details.component';
import { OptimizationGroupTplComponent } from './modal/optimization-group-tpl/optimization-group-tpl.component';
import { AddOptimizationGroupTplComponent } from './modal/add-optimization-group-tpl/add-optimization-group-tpl.component';
import {TableTimeModule} from '../../module/table-time/table-time.module';
import {HotTableModule} from '@jzl/hot-table6';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: OptimizationListComponent,
    data: {
      title: 'list'
    }
  },
  {
    path: 'create',
    component: OptimizationDetailComponent,
    data: {
      title: 'list'
    }
  },
  {
    path: 'detail/:id',
    component: OptimizationDetailComponent,
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: OptimizationDetailListComponent
      },
      {
        path: 'log',
        component: OptimizationDetailLogComponent,
      },
      {
        path: 'uploadList',
        component: UploadListComponent,
      },
      {
        path: 'setting',
        component: OptimizationDetailSettingComponent,
      }
    ],
    data: {
      title: 'list'
    }
  },
  {
    path: 'e-detail/:id',
    component: OptimizationDetailEffectComponent,
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: OptimizationDetailEffectListComponent
      },
      {
        path: 'kwd_list',
        component: OptimizationDetailEffectKwdListComponent,
      },
      {
        path: 'setting',
        component: OptimizationDetailEffectSettingComponent,
      },
      {
        path: 'edit',
        component: OptimizationDetailEffectListEditComponent,
      }
    ],
    data: {
      title: 'list'
    }
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
    DataViewOperationModule,
    EditMessageModule,
    HotTableModule,
  ],
  declarations: [OptimizationListComponent, OptimizationDetailComponent, OptimizationDetailListComponent, OptimizationDetailLogComponent, OptimizationDetailSettingComponent, OptimizationDetailEffectComponent,
    OptimizationDetailEffectListComponent,
    OptimizationDetailEffectKwdListComponent,
    OptimizationDetailEffectSettingComponent,
    OptimizationDetailListEditComponent,
    OptimizationDetailEffectListEditComponent,
    PauseSettingComponent,
    EditOptimizationSettingComponent,
    EditOptimizationGroupComponent,
    BatchDelayModalComponent,

    EditOptimizationNameComponent,
    BatchUploadComponent,
    UploadListComponent,
    OptimizationGroupDetailsComponent,
    OptimizationGroupTplComponent,
    AddOptimizationGroupTplComponent,
  ],
  providers: [ ReportService , OptimizationService, DataViewService],
  entryComponents: [PauseSettingComponent, EditOptimizationSettingComponent, EditOptimizationGroupComponent, BatchDelayModalComponent, EditOptimizationNameComponent, BatchUploadComponent, BatchDelayModalComponent, OptimizationGroupTplComponent, AddOptimizationGroupTplComponent]

})
export class OptimizationModule { }
