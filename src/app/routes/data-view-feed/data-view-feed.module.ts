import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DataViewService } from './service/data-view.service';
import { DataViewComponent } from './data-view.component';
import { ViewItemService } from './service/view-item.service';
import { ReportService } from '../report-feed/service/report.service';
import { RegionSelectViewComponent } from './component/region-select-view/region-select-view.component';
import { ConstraintConditionModule } from '../../module/constraint-condition/constraint-condition.module';
import { TableHeaderFilterModule } from '@jzl/table-header-filter';
import { QueryRankingModule } from '../../module/query-ranking/query-ranking.module';
import { ViewChartModule } from '../../module/view-chart/view-chart.module';
import { DataViewOperationModule } from '../../module/data-view-operation/data-view-operation.module';

import { EditMessageModule } from '../../module/edit-message/edit-message.module';
import { BookmarkModule } from '../../module/bookmark/bookmark.module';
import { ShowScheduleModule } from '../../module/show-schedule/show-schedule.module';
import { DataViewEditComponent } from './component/data-view-edit/data-view-edit.component';
import { DataViewAddComponent } from './component/data-view-add/data-view-add.component';
import { QuickEditComponent } from "./component/quick-edit/quick-edit.component";
import { EditGroupTargetSingleBdComponent } from "./modal/edit-group-target/components/edit-group-target-single-bd/edit-group-target-single-bd.component";
import { TransferTreeModule } from "../../module/transfter-tree/transfer-tree.module";
import { EditGroupTargetComponent } from "./modal/edit-group-target/edit-group-target.component";
import { TableTimeModule } from '../../module/table-time/table-time.module';
import { EditGroupTargetSingleGdtComponent } from './modal/edit-group-target/components/edit-group-target-single-gdt/edit-group-target-single-gdt.component';
import { EditGroupTargetSingleBytedanceComponent } from './modal/edit-group-target/components/edit-group-target-single-bytedance/edit-group-target-single-bytedance.component';
import { DateSelectViewModule } from "../../module/date-select-view/date-select-view.module";
import { EditFolderComponent } from './modal/edit-folder/edit-folder.component';
import { DataViewFolderFeedService } from './service/data-view-folder-feed.service';
import { DataStackService } from '../../shared/service/data-stack.service';
import { CreativeStyleModule } from '../../module/creative-style/creative-style.module';
import { TableSettingModule } from '../../module/table-setting/table-setting.module';
import { BatchUploadModule } from '../../module/batch-upload/batch-upload.module';
import { EditExtensionComponent } from './modal/edit-extension/edit-extension.component';
import { MonitorSettingModule } from '../../module/monitor-setting/monitor-setting.module';
import { EditWordsComponent } from './modal/edit-words/edit-words.component';
import { EditWordsBytedanceComponent } from './modal/edit-words/components/edit-words-bytedance/edit-words-bytedance.component';
import { EditGroupTargetSingleUcComponent } from './modal/edit-group-target/components/edit-group-target-single-uc/edit-group-target-single-uc.component';
import { QuickOperModule } from "../../module/quick-oper/quick-oper.module";
import { SetAutomationTacticComponent } from './modal/set-automation-tactic/set-automation-tactic.component';
import { AddWordsModalComponent } from './modal/add-words-modal/add-words-modal.component';
import { EditWordsUcComponent } from './modal/edit-words/components/edit-words-uc/edit-words-uc.component';

const routes: Routes = [
  {
    path: '',
    component: DataViewComponent
  },
  {
    path: 'edit:selected',
    component: DataViewEditComponent
  },
  {
    path: 'folder',
    loadChildren: () => import('../../routes/folder-feed/folder.module').then(m => m.FolderModule),
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
    ViewChartModule,
    DataViewOperationModule,
    EditMessageModule,
    ShowScheduleModule,
    TransferTreeModule,
    DateSelectViewModule,
    CreativeStyleModule,
    BatchUploadModule,
    MonitorSettingModule,
    QuickOperModule,
  ],
  declarations: [
    DataViewComponent,
    DataViewEditComponent,
    DataViewAddComponent,
    RegionSelectViewComponent,
    EditGroupTargetSingleBdComponent,
    EditGroupTargetSingleGdtComponent,
    EditGroupTargetSingleBytedanceComponent,
    EditGroupTargetComponent,
    QuickEditComponent,
    EditFolderComponent,
    EditExtensionComponent,
    EditWordsComponent,
    EditWordsBytedanceComponent,
    EditGroupTargetSingleUcComponent,
    SetAutomationTacticComponent,
    AddWordsModalComponent,
    EditWordsUcComponent,
  ],
  entryComponents: [
  ],
  providers: [
    DataViewService,
    ViewItemService,
    ReportService,
    DataStackService,
    DataViewFolderFeedService,
  ],
  exports: [RouterModule]
})
export class DataViewFeedModule { }
