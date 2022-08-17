import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import {TableHeaderFilterModule} from '@jzl/table-header-filter';

import {DateDefineService} from "../../shared/service/date-define.service";
import {TableTimeModule} from '../../module/table-time/table-time.module';
import {MaterialsComponent} from "./materials.component";
import { VideoReportComponent } from './components/video-report/video-report.component';
import { VideoSummaryReportComponent } from './components/video-report/components/video-summary-report/video-summary-report.component';
import { MaterialsAuthorComponent } from './components/materials-author/materials-author.component';
import { AddMaterialsAuthorComponent } from './modal/add-materials-author/add-materials-author.component';
import {BookmarkModule} from '../../module/bookmark/bookmark.module';
import {ConstraintConditionModule} from '../../module/constraint-condition/constraint-condition.module';
import {QueryRankingModule} from '../../module/query-ranking/query-ranking.module';
import {ViewChartModule} from '../../module/view-chart/view-chart.module';
import {DataViewOperationModule} from '../../module/data-view-operation/data-view-operation.module';
import {EditMessageModule} from '../../module/edit-message/edit-message.module';
import {ShowScheduleModule} from '../../module/show-schedule/show-schedule.module';
import { UploadVideoMaterialsComponent } from './modal/upload-video-materials/upload-video-materials.component';
import {ReportService} from '../report-feed/service/report.service';
import {TransferTreeModule} from '../../module/transfter-tree/transfer-tree.module';
import {DataViewService} from './service/data-view.service';
import {ViewItemService} from './service/view-item.service';
import {MaterialStyleModule} from '../../module/material-style/material-style.module';
import {MaterialLabelReportComponent} from './components/video-report/components/material-label-report/material-label-report.component';
import { MaterialsDetailModalComponent } from './modal/materials-detail-modal/materials-detail-modal.component';
import {MaterialsService} from "./service/materials.service";
import { SourceMaterialComponent } from './components/source-material/source-material.component';
import {VideoComponent} from "./components/source-material/components/video/video.component";
import { LaunchTemplateComponent } from './components/launch-template/launch-template.component';
import {TargetTemplateComponent} from "./components/launch-template/components/target-template/target-template.component";
import {CampaignTemplateComponent} from "./components/launch-template/components/campaign-template/campaign-template.component";
import { AddCampaignTemplateComponent } from './components/launch-template/components/add-campaign-template/add-campaign-template.component';
import {AddTargetTemplateComponent} from "./components/launch-template/components/add-target-template/add-target-template.component";
import {DataStackService} from '../../shared/service/data-stack.service';
import {DateSelectViewModule} from "../../module/date-select-view/date-select-view.module";
import {LaunchModule} from "../../module/launch/launch.module";
import { CampaignNameTemplateComponent } from './components/launch-template/components/campaign-name-template/campaign-name-template.component';
import { AndroidDownloadLinkComponent } from './components/launch-template/components/android-download-link/android-download-link.component';
import { IosDownloadLinkComponent } from './components/launch-template/components/ios-download-link/ios-download-link.component';
import { LandingPageTemplateComponent } from './components/launch-template/components/landing-page-template/landing-page-template.component';
import { LaunchTemplateTabComponent } from './components/launch-template/components/launch-template-tab/launch-template-tab.component';
import {DocumentManageComponent} from "./components/document-manage/document-manage.component";
import { DocumentsComponent } from './components/document-manage/components/documents/documents.component';
import { AddDocumentModalComponent } from './modal/add-document-modal/add-document-modal.component';
import { UploadDoucumentsModalComponent } from './modal/upload-doucuments-modal/upload-doucuments-modal.component';
import { AddDocumentGroupComponent } from './modal/add-document-group/add-document-group.component';
import { AddDocumentGroupManageComponent } from './modal/add-document-group-manage/add-document-group-manage.component';
import { CreateLaunchComponent } from './components/launch-template/components/create-launch/create-launch.component';
import { LaunchDocumentComponent } from './modal/launch-document/launch-document.component';
import { MaterialLibraryComponent } from './modal/material-library/material-library.component';
import {LaunchService} from "./service/launch.service";
import { AddCampaignNameComponent } from './modal/add-campaign-name/add-campaign-name.component';
import { AddAndroidDownloadLinkComponent } from './modal/add-android-download-link/add-android-download-link.component';
import { AddIosDownloadLinkComponent } from './modal/add-ios-download-link/add-ios-download-link.component';
import { AddExternalUrlComponent } from './modal/add-external-url/add-external-url.component';
import {ImageComponent} from './components/source-material/components/image/image.component';
import {UploadImageMaterialsComponent} from './modal/upload-image-materials/upload-image-materials.component';
import {MaterialsImageDetailModalComponent} from './modal/materials-image-detail-modal/materials-image-detail-modal.component';
import {MaterialLibraryImageComponent} from './modal/material-library-image/material-library-image.component';
import {BdCreateLaunchComponent} from "./components/launch-template/components/bd-create-launch/bd-create-launch.component";
import {UrlTemplateComponent} from './components/launch-template/components/url-template/url-template.component';
import {AddUrlTemplateComponent} from './modal/add-url-template/add-url-template.component';
import {CatalogueListTemplateComponent} from './components/launch-template/components/catalogue_list/catalogue-list-template.component';
import {AddCatalogueListTemplateComponent} from './modal/add-catalogue-list-template/add-catalogue-list-template.component';
import {TableSettingModule} from '../../module/table-setting/table-setting.module';
import { UploadVideoMaterialsBatchComponent } from './modal/upload-video-materials-batch/upload-video-materials-batch.component';
import { CardTemplateComponent } from './components/launch-template/components/card-template/card-template.component';
import { AddCardTemplateComponent } from './components/launch-template/components/add-card-template/add-card-template.component';
import { UcCreateLaunchComponent } from './components/launch-template/components/uc-create-launch/uc-create-launch.component';
import {ImageSummaryReportComponent} from './components/image-report/components/video-summary-report/image-summary-report.component';
import {ImageReportComponent} from './components/image-report/image-report.component';
import { LayoutLeftMenuModule } from "../../module/layout-left-menu/layout-left-menu.module";

const routes: Routes = [
  {
    path: '',
    component: MaterialsComponent,
    children: [
      { path: '', redirectTo: 'video_material', pathMatch: 'full' },
      {
        path: 'image_material',
        component: SourceMaterialComponent,
        data: {
          title: 'image_material',
          activeType:'image',
        }
      },
      {
        path: 'video_material',
        component: SourceMaterialComponent,
        data: {
          title: 'video_material',
          activeType:'video',
        }
      },
      {
        path: 'video_report',
        component: VideoReportComponent,
        children: [
          {
            path: '',
            data: {
              title: 'video_report'
            }
          }
        ]
      },
      {
        path: 'image_report',
        component: ImageReportComponent,
        children: [
          {
            path: '',
            data: {
              title: 'image_report'
            }
          }
        ]
      },
      {
        path: 'materials_author',
        component: MaterialsAuthorComponent,
        children: [
          {
            path: '',
            data: {
              title: 'materials_author'
            }
          }
        ]
      },
      {
        path: 'document_manage',
        component: DocumentManageComponent,
        children: [
          {
            path: '',
            data: {
              title: 'document_manage'
            }
          }
        ]
      },
      {
        path: 'launch_template',
        component: LaunchTemplateComponent,
        children: [
          {
            path: '',
            redirectTo: 'launch_tab',
            pathMatch: 'full'
          },
          {
            path: 'launch_tab',
            component: LaunchTemplateTabComponent
          },
          {
            path: 'launch_template_create',
            component: AddCampaignTemplateComponent
          },
          {
            path: 'target_template_create',
            component: AddTargetTemplateComponent
          },
          {
            path: 'card_template_create',
            component: AddCardTemplateComponent
          },
        ]
      },

      {
        path: 'launch_create',
        component: CreateLaunchComponent
      },
      {
        path: 'bd_create_launch',
        component: BdCreateLaunchComponent
      },
      {
        path: 'uc_create_launch',
        component: UcCreateLaunchComponent
      },
    ]
  },

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
    MaterialStyleModule,
    DateSelectViewModule,
    LaunchModule,
    LayoutLeftMenuModule,
  ],
  declarations: [
    MaterialsComponent,
    VideoReportComponent,
    ImageReportComponent,
    VideoSummaryReportComponent,
    ImageSummaryReportComponent,
    MaterialLabelReportComponent,
    MaterialsAuthorComponent,
    AddMaterialsAuthorComponent,
    UploadVideoMaterialsComponent,
    UploadVideoMaterialsBatchComponent,
    UploadImageMaterialsComponent,
    MaterialsDetailModalComponent,
    MaterialsImageDetailModalComponent,
    MaterialLibraryImageComponent,
    SourceMaterialComponent,
    VideoComponent,
    ImageComponent,
    LaunchTemplateComponent,
    TargetTemplateComponent,
    AddTargetTemplateComponent,
    CampaignTemplateComponent,
    AddCampaignTemplateComponent,
    CampaignNameTemplateComponent,
    AndroidDownloadLinkComponent,
    IosDownloadLinkComponent,
    LandingPageTemplateComponent,
    LaunchTemplateTabComponent,
    DocumentManageComponent,
    DocumentsComponent,
    AddDocumentModalComponent,
    UploadDoucumentsModalComponent,
    AddDocumentGroupComponent,
    AddDocumentGroupManageComponent,
    CreateLaunchComponent,
    LaunchDocumentComponent,
    MaterialLibraryComponent,
    AddCampaignNameComponent,
    AddAndroidDownloadLinkComponent,
    AddIosDownloadLinkComponent,
    AddExternalUrlComponent,
    BdCreateLaunchComponent,
    UrlTemplateComponent,
    AddUrlTemplateComponent,
    CatalogueListTemplateComponent,
    AddCatalogueListTemplateComponent,
    CardTemplateComponent,
    AddCardTemplateComponent,
    UcCreateLaunchComponent,
  ],
  providers: [
    DateDefineService,
    DataViewService,
    ViewItemService,
    ReportService,
    DataStackService,
    MaterialsService,
    LaunchService,
  ],
  exports: [RouterModule],
  entryComponents: [
    AddMaterialsAuthorComponent,
    UploadVideoMaterialsComponent,
    UploadVideoMaterialsBatchComponent,
    UploadImageMaterialsComponent,
    MaterialsDetailModalComponent,
    MaterialsImageDetailModalComponent,
    MaterialLibraryImageComponent,
    AddDocumentModalComponent,
    UploadDoucumentsModalComponent,
    AddDocumentGroupComponent,
    AddDocumentGroupManageComponent,
    LaunchDocumentComponent,
    MaterialLibraryComponent,
    AddCampaignNameComponent,
    AddAndroidDownloadLinkComponent,
    AddIosDownloadLinkComponent,
    AddExternalUrlComponent,
    AddUrlTemplateComponent,
    AddCatalogueListTemplateComponent,
  ]
})
export class MaterialsModule { }
