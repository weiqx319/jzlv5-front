import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderDetailComponent } from './folder-detail/folder-detail.component';
import {SharedModule} from "../../shared/shared.module";
import {DndModule} from "ng2-dnd";
import {RouterModule, Routes} from "@angular/router";
import {ReportService} from "../report/service/report.service";
import {FolderService} from './service/folder.service';
import { FolderDetailSettingComponent } from './folder-detail/compoenent/folder-detail-setting/folder-detail-setting.component';
import {TableSettingModule} from '../../module/table-setting/table-setting.module';

import {DataViewService} from "../data-view/service/data-view.service";
import {TableHeaderFilterModule} from '@jzl/table-header-filter';
import {FolderDetailEditComponent} from "./folder-detail/compoenent/folder-detail-list-edit/folder-detail-edit.component";
import {ConstraintConditionModule} from "../../module/constraint-condition/constraint-condition.module";
import {BookmarkModule} from "../../module/bookmark/bookmark.module";
import {QueryRankingModule} from "../../module/query-ranking/query-ranking.module";
import {ViewChartModule} from "../../module/view-chart/view-chart.module";

import {DataViewOperationModule} from "../../module/data-view-operation/data-view-operation.module";
import { BatchUploadComponent } from './modal/batch-upload/batch-upload.component';

import { UploadListComponent } from './folder-detail/compoenent/upload-list/upload-list.component';
import {EditMessageModule} from "../../module/edit-message/edit-message.module";
import {HotTableModule} from '@jzl/hot-table6';
import {TableTimeModule} from '../../module/table-time/table-time.module';
import {FolderListWrapComponent} from './folder-list-wrap/folder-list-wrap.component';
import {FolderListComponent} from './folder-list-wrap/component/folder-list/folder-list.component';
import {EditFolderNameComponent} from './modal/edit-folder-name/edit-folder-name.component';
import {FolderDetailListComponent} from './folder-detail/compoenent/folder-detail-list/folder-detail-list.component';
import {CreativeStyleModule} from '../../module/creative-style/creative-style.module';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: FolderListWrapComponent,
    data: {
      title: 'list'
    }
  },
  {
    path: 'create',
    component: FolderDetailComponent,
    data: {
      title: 'list'
    }
  },
  {
    path: 'detail/:id',
    component: FolderDetailComponent,
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: FolderDetailListComponent
      },
      {
        path: 'uploadList',
        component: UploadListComponent,
      },
      {
        path: 'setting',
        component: FolderDetailSettingComponent,
      }
    ],
    data: {
      title: 'list'
    }
  },

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
    CreativeStyleModule,
  ],
  declarations: [FolderListWrapComponent, FolderDetailComponent, FolderDetailSettingComponent,
    FolderDetailEditComponent,
    EditFolderNameComponent,
    BatchUploadComponent,
    UploadListComponent,
    FolderListComponent,
    FolderDetailListComponent,
  ],
  providers: [ReportService, FolderService, DataViewService],
  exports: [
    FolderDetailComponent
  ],
  entryComponents: [   EditFolderNameComponent, BatchUploadComponent]

})
export class FolderModule { }
