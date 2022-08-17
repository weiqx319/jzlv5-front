
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DataViewService } from './service/data-view.service';
import { DataViewComponent } from './data-view.component';
import { ViewItemService } from './service/view-item.service';
import { TableSettingModule } from '../../module/table-setting/table-setting.module';
import { DataViewEditComponent } from './component/data-view-edit/data-view-edit.component';
import { DataViewAddComponent } from './component/data-view-add/data-view-add.component';
import { ReportService } from '../report/service/report.service';
import { RegionSelectViewComponent } from './component/region-select-view/region-select-view.component';
import { ConstraintConditionModule } from '../../module/constraint-condition/constraint-condition.module';
import { TableHeaderFilterModule } from '@jzl/table-header-filter';
import { BookmarkModule } from '../../module/bookmark/bookmark.module';
import { QueryRankingModule } from '../../module/query-ranking/query-ranking.module';
import { ViewChartModule } from '../../module/view-chart/view-chart.module';
import { AddViewDimensionComponent } from './modal/add-view-dimension/add-view-dimension.component';
import { AddKeywordComponent } from './modal/add-keyword/add-keyword.component';
import { AddGroupComponent } from './modal/add-group/add-group.component';
import { AddCampaignComponent } from './modal/add-campaign/add-campaign.component';
import { AddCreativeComponent } from './modal/add-creative/add-creative.component';
import { BatchAddViewComponent } from './modal/batch-add-view/batch-add-view.component';
import { EditDimensionComponent } from './modal/edit-dimension/edit-dimension.component';
import { EditOptimizationComponent } from './modal/edit-optimization/edit-optimization.component';
import { EditExtensionComponent } from './modal/edit-extension/edit-extension.component';
import { EditGroupSingleComponent } from './modal/edit-group-single/edit-group-single.component';
import { EditGroupBatchComponent } from './modal/edit-group-batch/edit-group-batch.component';
import { EditCampaignSingleComponent } from './modal/edit-campaign-single/edit-campaign-single.component';
import { EditCampaignBatchComponent } from './modal/edit-campaign-batch/edit-campaign-batch.component';
import { EditAccountSingleComponent } from './modal/edit-account-single/edit-account-single.component';
import { EditAccountBatchComponent } from './modal/edit-account-batch/edit-account-batch.component';
import { EditCreativeSingleComponent } from './modal/edit-creative-single/edit-creative-single.component';
import { EditCreativeBatchComponent } from './modal/edit-creative-batch/edit-creative-batch.component';
import { HistorySettingComponent } from './modal/history-setting/history-setting.component';
import { DataViewOperationModule } from '../../module/data-view-operation/data-view-operation.module';

import { EditMessageModule } from '../../module/edit-message/edit-message.module';
import { ShowScheduleModule } from '../../module/show-schedule/show-schedule.module';
import { ViewBatchUploadComponent } from './modal/view-batch-upload/view-batch-upload.component';
import { HotTableModule } from '@jzl/hot-table6';
import { SyncCreativeComponent } from './modal/sync-creatvie/sync-creative.component';

import { TableTimeModule } from '../../module/table-time/table-time.module';
import { QuickBackupModule } from '../../module/quick-backup/quick-backup.module';
import { FolderModule } from '../folder/folder.module';
import { EditFolderComponent } from './modal/edit-folder/edit-folder.component';
import { ViewBatchUploadDeleteComponent } from './modal/view-batch-upload-delete/view-batch-upload-delete.component';
import { DateSelectViewModule } from "../../module/date-select-view/date-select-view.module";
import { DataStackService } from '../../shared/service/data-stack.service';
import { QuickOperModule } from '../../module/quick-oper/quick-oper.module';
import { DataAnalyticsViewComponent } from './data-analytics-view/data-analytics-view.component';
import { MonitorSettingModule } from '../../module/monitor-setting/monitor-setting.module';
import { KeywordStructureModule } from '../../module/keyword-structure/keyword-structure.module';
import { FengwuPreviewComponent } from './modal/fengwu-preview/fengwu-preview.component';
import { AddFengwuCreativeComponent } from './modal/add-fengwu-creative/add-fengwu-creative.component';
import { DataViewDrawerComponent } from './component/data-view-drawer/data-view-drawer.component';
import { BatchAddRegionComponent } from './modal/batch-add-region/batch-add-region.component';


const routes: Routes = [
  {
    path: '',
    component: DataViewComponent
  },
  {
    path: 'view',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'analytics',
    component: DataAnalyticsViewComponent
  },
  {
    path: 'add',
    component: DataViewAddComponent

  },
  {
    path: 'edit:selected',
    component: DataViewEditComponent
  },
  {
    path: 'folder',
    loadChildren: () => import('../../routes/folder/folder.module').then(m => m.FolderModule),
  },
  {
    path: 'create',
    component: AddFengwuCreativeComponent
  }
];


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    TableSettingModule,
    TableTimeModule,
    TableHeaderFilterModule,
    BookmarkModule,
    ConstraintConditionModule,
    QueryRankingModule,
    QuickBackupModule,
    ViewChartModule,
    DataViewOperationModule,
    EditMessageModule,
    ShowScheduleModule,
    HotTableModule,
    QuickOperModule,
    DateSelectViewModule,
    MonitorSettingModule,
    KeywordStructureModule
  ],
  declarations: [
    DataAnalyticsViewComponent,
    DataViewComponent,
    DataViewAddComponent,
    DataViewEditComponent,
    RegionSelectViewComponent,
    AddViewDimensionComponent,
    AddKeywordComponent,
    AddGroupComponent,
    AddCampaignComponent,
    AddCreativeComponent,
    BatchAddViewComponent,
    EditDimensionComponent,
    EditOptimizationComponent,
    EditFolderComponent,
    EditExtensionComponent,
    EditGroupSingleComponent,
    EditGroupBatchComponent,
    EditCampaignSingleComponent,
    EditCampaignBatchComponent,
    EditAccountSingleComponent,
    EditAccountBatchComponent,
    EditCreativeSingleComponent,
    EditCreativeBatchComponent,
    HistorySettingComponent,
    ViewBatchUploadComponent,
    ViewBatchUploadDeleteComponent,
    SyncCreativeComponent,
    FengwuPreviewComponent,
    AddFengwuCreativeComponent,
    DataViewDrawerComponent,
    BatchAddRegionComponent
  ],
  providers: [
    DataViewService, ViewItemService, ReportService, DataStackService,
  ],
  exports: [
    RouterModule
  ],
  entryComponents: [
    AddViewDimensionComponent,
    AddKeywordComponent,
    AddGroupComponent,
    AddCampaignComponent,
    AddCreativeComponent,
    BatchAddViewComponent,
    EditDimensionComponent,
    EditOptimizationComponent,
    EditExtensionComponent,
    EditGroupSingleComponent,
    EditGroupBatchComponent,
    EditCampaignSingleComponent,
    EditCampaignBatchComponent,
    EditAccountSingleComponent,
    EditAccountBatchComponent,
    EditCreativeSingleComponent,
    EditCreativeBatchComponent,
    HistorySettingComponent,
    ViewBatchUploadComponent,
    ViewBatchUploadDeleteComponent
  ]
})
export class DataViewModule { }
