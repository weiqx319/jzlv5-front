import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TableHeaderFilterModule } from '@jzl/table-header-filter';

import { DateDefineService } from "../../shared/service/date-define.service";
import { TableTimeModule } from '../../module/table-time/table-time.module';
import { LaunchRpaComponent } from "./launch-rpa.component";
import { AddMaterialsAuthorComponent } from './modal/add-materials-author/add-materials-author.component';
import { BookmarkModule } from '../../module/bookmark/bookmark.module';
import { ConstraintConditionModule } from '../../module/constraint-condition/constraint-condition.module';
import { QueryRankingModule } from '../../module/query-ranking/query-ranking.module';
import { ViewChartModule } from '../../module/view-chart/view-chart.module';
import { DataViewOperationModule } from '../../module/data-view-operation/data-view-operation.module';
import { EditMessageModule } from '../../module/edit-message/edit-message.module';
import { ShowScheduleModule } from '../../module/show-schedule/show-schedule.module';

import { ReportService } from '../report-feed/service/report.service';
import { TransferTreeModule } from '../../module/transfter-tree/transfer-tree.module';
import { DataViewService } from './service/data-view.service';
import { MaterialStyleModule } from '../../module/material-style/material-style.module';
import { MaterialsDetailModalComponent } from './modal/materials-detail-modal/materials-detail-modal.component';
import { MaterialsService } from "./service/materials.service";
import { DataStackService } from '../../shared/service/data-stack.service';
import { DateSelectViewModule } from "../../module/date-select-view/date-select-view.module";
import { LaunchModule } from "../../module/launch/launch.module";

import { LaunchMaterialVideoModalComponent } from './modal/launch-material-video-modal/launch-material-video-modal.component';
import { LaunchService } from "./service/launch.service";
import { UploadImageMaterialsComponent } from './modal/upload-image-materials/upload-image-materials.component';
import { MaterialsImageDetailModalComponent } from './modal/materials-image-detail-modal/materials-image-detail-modal.component';
import { LaunchMaterialImageModalComponent } from './modal/launch-material-image-modal/launch-material-image-modal.component';
import { AddCatalogueListTemplateComponent } from './modal/add-catalogue-list-template/add-catalogue-list-template.component';
import { TableSettingModule } from '../../module/table-setting/table-setting.module';
import { UploadVideoMaterialsBatchComponent } from './modal/upload-video-materials-batch/upload-video-materials-batch.component';
import { LaunchGroupListToutiaoComponent } from './components/launch-group/components/launch-group-toutiao/launch-group-list-toutiao/launch-group-list-toutiao.component';
import { LaunchChannelListToutiaoComponent } from './components/launch-channel/components/launch-channel-toutiao/launch-channel-list-toutiao/launch-channel-list-toutiao.component';
import { LaunchTargetListToutiaoComponent } from './components/launch-target/components/launch-target-toutiao/launch-target-list-toutiao/launch-target-list-toutiao.component';
import { LaunchTitleComponent } from './components/launch-title/launch-title.component';
import { AddLaunchGroupToutiaoComponent } from './components/launch-group/components/launch-group-toutiao/add-launch-group-toutiao/add-launch-group-toutiao.component';
import { LaunchRpaService } from './service/launch-rpa.service';
import { AddLaunchTitleComponent } from './components/launch-title/modal/add-launch-title/add-launch-title.component';
import { LaunchTargetBasicToutiaoComponent } from "./components/launch-target/components/launch-target-toutiao/launch-target-basic-toutiao/launch-target-basic-toutiao.component";
import { TargetBasicTemplateToutiaoComponent } from "./components/launch-target/components/launch-target-toutiao/target-basic-template-toutiao/target-basic-template-toutiao.component";
import { LaunchGroupDetailToutiaoComponent } from './components/launch-group/components/launch-group-toutiao/launch-group-detail-toutiao/launch-group-detail-toutiao.component';
import { LaunchGroupTemplateToutiaoComponent } from './components/launch-group/components/launch-group-toutiao/launch-group-template-toutiao/launch-group-template-toutiao.component';
import { AddChannelToutiaoComponent } from './components/launch-channel/components/launch-channel-toutiao/add-channel-toutiao/add-channel-toutiao.component';
import { LaunchMaterialImageComponent } from './components/launch-material/components/launch-material-image/launch-material-image.component';
import { LaunchMaterialVideoComponent } from './components/launch-material/components/launch-masterial-video/launch-material-video.component';
import { LaunchAuthorComponent } from './components/launch-author/launch-author.component';
import { LaunchTitleModalComponent } from './modal/launch-title-modal/launch-title-modal.component';
import { BatchEditLabelModalComponent } from './modal/batch-edit-label-modal/batch-edit-label-modal.component';
import { LaunchLogComponent } from './components/launch-log/launch-log.component';
import { LaunchTemplateRunLogComponent } from './components/launch-log/components/launch-template-run-log/launch-template-run-log.component';
import { LaunchCardComponent } from "./components/launch-card/launch-card.component";
import { AddCardTemplateComponent } from "./components/launch-card/components/add-card-template/add-card-template.component";
import { CardTemplateSectionComponent } from "./components/launch-card/components/card-section/card-template-section.component";
import { LaunchTargetListGdtComponent } from './components/launch-target/components/launch-target-gdt/launch-target-list-gdt/launch-target-list-gdt.component';
import { LaunchTargetBasicGdtComponent } from './components/launch-target/components/launch-target-gdt/launch-target-basic-gdt/launch-target-basic-gdt.component';
import { TargetBasicTemplateGdtComponent } from './components/launch-target/components/launch-target-gdt/target-basic-template-gdt/target-basic-template-gdt.component';
import { LaunchTargetComponent } from "./components/launch-target/launch-target.component";
import { AddChannelGdtComponent } from "./components/launch-channel/components/launch-channel-gdt/add-channel-gdt/add-channel-gdt.component";
import { LaunchChannelComponent } from "./components/launch-channel/launch-channel.component";
import { LaunchChannelListGdtComponent } from "./components/launch-channel/components/launch-channel-gdt/launch-channel-list-gdt/launch-channel-list-gdt.component";

import { LaunchGroupListComponent } from "./components/launch-group/launch-group-list.component";
import { AddLaunchGroupGdtComponent } from "./components/launch-group/components/launch-group-gdt/add-launch-group-gdt/add-launch-group-gdt.component";
import { LaunchGroupListGdtComponent } from "./components/launch-group/components/launch-group-gdt/launch-group-list-gdt/launch-group-list-gdt.component";
import { LaunchGroupTemplateGdtComponent } from "./components/launch-group/components/launch-group-gdt/launch-group-template-gdt/launch-group-template-gdt.component";
import { LaunchGroupDetailGdtComponent } from "./components/launch-group/components/launch-group-gdt/launch-group-detail-gdt/launch-group-detail-gdt.component";
import { CreativeTemplateGdtComponent } from "./components/launch-group/components/launch-group-gdt/creative-template-gdt/creative-template-gdt.component";
import { LaunchTargetListUcComponent } from './components/launch-target/components/launch-target-uc/launch-target-list-uc/launch-target-list-uc.component';
import { LaunchTargetBasicUcComponent } from './components/launch-target/components/launch-target-uc/launch-target-basic-uc/launch-target-basic-uc.component';
import { TargetBasicTemplateUcComponent } from './components/launch-target/components/launch-target-uc/target-basic-template-uc/target-basic-template-uc.component';
import { LaunchChannelListUcComponent } from './components/launch-channel/components/launch_channel_uc/launch-channel-list-uc/launch-channel-list-uc.component';
import { AddChannelUcComponent } from './components/launch-channel/components/launch_channel_uc/add-channel-uc/add-channel-uc.component';
import { UploadChannelListComponent } from './modal/upload-channel-list/upload-channel-list.component';
import { LaunchGroupListUcComponent } from './components/launch-group/components/launch-group-uc/launch-group-list-uc/launch-group-list-uc.component';
import { AddLaunchGroupUcComponent } from './components/launch-group/components/launch-group-uc/add-launch-group-uc/add-launch-group-uc.component';
import { LaunchGroupDetailUcComponent } from './components/launch-group/components/launch-group-uc/launch-group-detail-uc/launch-group-detail-uc.component';


import { LaunchMaterialCoverComponent } from "./components/launch-material/components/launch-material-cover/launch-material-cover.component";
import { LaunchMaterialCoverModalComponent } from "./modal/launch-material-cover-modal/launch-material-cover-modal.component";
import { LaunchGroupTemplateUcComponent } from "./components/launch-group/components/launch-group-uc/launch-group-template-uc/launch-group-template-uc.component";
import { LaunchGroupListKuaishouComponent } from './components/launch-group/components/launch-group-kuaishou/launch-group-list-kuaishou/launch-group-list-kuaishou.component';
import { AddLaunchGroupKuaishouComponent } from './components/launch-group/components/launch-group-kuaishou/add-launch-group-kuaishou/add-launch-group-kuaishou.component';
import { LaunchGroupDetailKuaishouComponent } from './components/launch-group/components/launch-group-kuaishou/launch-group-detail-kuaishou/launch-group-detail-kuaishou.component';
import { LaunchGroupTemplateKuaishouComponent } from './components/launch-group/components/launch-group-kuaishou/launch-group-template-kuaishou/launch-group-template-kuaishou.component';
import { LaunchChannelListKuaishouComponent } from './components/launch-channel/components/launch-channel-kuaishou/launch-channel-list-kuaishou/launch-channel-list-kuaishou.component';
import { AddChannelKuaishouComponent } from './components/launch-channel/components/launch-channel-kuaishou/add-channel-kuaishou/add-channel-kuaishou.component';
import { LaunchTargetListKuaishouComponent } from './components/launch-target/components/launch-target-kuaishou/launch-target-list-kuaishou/launch-target-list-kuaishou.component';
import { LaunchTargetBasicKuaishouComponent } from './components/launch-target/components/launch-target-kuaishou/launch-target-basic-kuaishou/launch-target-basic-kuaishou.component';
import { TargetBasicTemplateKuaishouComponent } from './components/launch-target/components/launch-target-kuaishou/target-basic-template-kuaishou/target-basic-template-kuaishou.component';


import { LaunchChannelEditChannelsComponent } from './modal/launch-channel-edit-channels/launch-channel-edit-channels.component';
import { CreativeTemplateKuaishouComponent } from './components/launch-group/components/launch-group-kuaishou/creative-template-kuaishou/creative-template-kuaishou.component';
import { LaunchTargetBasicBaiduComponent } from './components/launch-target/components/launch-target-baidu/launch-target-basic-baidu/launch-target-basic-baidu.component';
import { LaunchTargetListBaiduComponent } from './components/launch-target/components/launch-target-baidu/launch-target-list-baidu/launch-target-list-baidu.component';
import { TargetBasicTemplateBaiduComponent } from './components/launch-target/components/launch-target-baidu/target-basic-template-baidu/target-basic-template-baidu.component';
import { AddChannelBaiduComponent } from './components/launch-channel/components/launch-channel-baidu/add-channel-baidu/add-channel-baidu.component';
import { LaunchChannelListBaiduComponent } from './components/launch-channel/components/launch-channel-baidu/launch-channel-list-baidu/launch-channel-list-baidu.component';
import { AddLaunchGroupBaiduComponent } from './components/launch-group/components/launch-group-baidu/add-launch-group-baidu/add-launch-group-baidu.component';
import { LaunchGroupDetailBaiduComponent } from './components/launch-group/components/launch-group-baidu/launch-group-detail-baidu/launch-group-detail-baidu.component';
import { LaunchGroupListBaiduComponent } from './components/launch-group/components/launch-group-baidu/launch-group-list-baidu/launch-group-list-baidu.component';
import { LaunchGroupTemplateBaiduComponent } from './components/launch-group/components/launch-group-baidu/launch-group-template-baidu/launch-group-template-baidu.component';
import { CreativeAttributesGdtComponent } from './components/launch-group/components/launch-group-gdt/creative-attributes-gdt/creative-attributes-gdt.component';
import { TencentMapModule } from "../../module/tencent-map/tencent-map.module";
import { LayoutLeftMenuModule } from "../../module/layout-left-menu/layout-left-menu.module";
import {LaunchGroupDetailQianchuanComponent} from "./components/launch-group/components/launch-group-qianchuan/launch-group-detail-qianchuan/launch-group-detail-qianchuan.component";
import {LaunchGroupListQianchuanComponent} from "./components/launch-group/components/launch-group-qianchuan/launch-group-list-qianchuan/launch-group-list-qianchuan.component";
import {AddLaunchGroupQianchuanComponent} from "./components/launch-group/components/launch-group-qianchuan/add-launch-group-qianchuan/add-launch-group-qianchuan.component";
import {LaunchGroupTemplateQianchuanComponent} from "./components/launch-group/components/launch-group-qianchuan/launch-group-template-qianchuan/launch-group-template-qianchuan.component";
import {LaunchTargetBasicQianchuanComponent} from "./components/launch-target/components/launch-target-qianchuan/launch-target-basic-qianchuan/launch-target-basic-qianchuan.component";
import {LaunchTargetListQianchuanComponent} from "./components/launch-target/components/launch-target-qianchuan/launch-target-list-qianchuan/launch-target-list-qianchuan.component";
import {TargetBasicTemplateQianchuanComponent} from "./components/launch-target/components/launch-target-qianchuan/target-basic-template-qianchuan/target-basic-template-qianchuan.component";

import { LaunchGroupListNiuComponent } from './components/launch-group/components/launch-group-niu/launch-group-list-niu/launch-group-list-niu.component';
import { AddLaunchGroupNiuComponent } from './components/launch-group/components/launch-group-niu/add-launch-group-niu/add-launch-group-niu.component';
import { LaunchGroupDetailNiuComponent } from './components/launch-group/components/launch-group-niu/launch-group-detail-niu/launch-group-detail-niu.component';
import { LaunchGroupTemplateNiuComponent } from './components/launch-group/components/launch-group-niu/launch-group-template-niu/launch-group-template-niu.component';
import { CreativeTemplateNiuComponent } from './components/launch-group/components/launch-group-niu/creative-template-niu/creative-template-niu.component';
import { LaunchTargetListNiuComponent } from './components/launch-target/components/launch-target-niu/launch-target-list-niu/launch-target-list-niu.component';
import { LaunchTargetBasicNiuComponent } from './components/launch-target/components/launch-target-niu/launch-target-basic-niu/launch-target-basic-niu.component';
import { TargetBasicTemplateNiuComponent } from './components/launch-target/components/launch-target-niu/target-basic-template-niu/target-basic-template-niu.component';
import { AddGoodsListDrawerComponent } from './components/launch-group/components/launch-group-niu/add-goods-list-drawer/add-goods-list-drawer.component';
import { LaunchGroupNewComponent } from './components/launch-group-new/launch-group-new.component';
import { LaunchTargetNewComponent } from './components/launch-target-new/launch-target-new.component';
import {LaunchGroupDetailQcComponent} from "./components/launch-group-new/components/launch-group-qc/launch-group-detail-qc/launch-group-detail-qc.component";
import {LaunchGroupTemplateQcComponent} from "./components/launch-group-new/components/launch-group-qc/launch-group-template-qc/launch-group-template-qc.component";
import {AddLaunchGroupQcComponent} from "./components/launch-group-new/components/launch-group-qc/add-launch-group-qc/add-launch-group-qc.component";
import {LaunchGroupListQcComponent} from "./components/launch-group-new/components/launch-group-qc/launch-group-list-qc/launch-group-list-qc.component";
import {LaunchTargetBasicQcComponent} from "./components/launch-target-new/components/launch-target-qc/launch-target-basic-qc/launch-target-basic-qc.component";
import {LaunchTargetListQcComponent} from "./components/launch-target-new/components/launch-target-qc/launch-target-list-qc/launch-target-list-qc.component";
import {TargetBasicTemplateQcComponent} from "./components/launch-target-new/components/launch-target-qc/target-basic-template-qc/target-basic-template-qc.component";
import {LaunchTargetBasicBdComponent} from "./components/launch-target-new/components/launch-target-bd/launch-target-basic-bd/launch-target-basic-bd.component";
import {LaunchTargetListBdComponent} from "./components/launch-target-new/components/launch-target-bd/launch-target-list-bd/launch-target-list-bd.component";
import {TargetBasicTemplateBdComponent} from "./components/launch-target-new/components/launch-target-bd/target-basic-template-bd/target-basic-template-bd.component";
import {LaunchGroupTemplateBdComponent} from "./components/launch-group-new/components/launch-group-bd/launch-group-template-bd/launch-group-template-bd.component";
import {AddLaunchGroupBdComponent} from "./components/launch-group-new/components/launch-group-bd/add-launch-group-bd/add-launch-group-bd.component";
import {LaunchGroupDetailBdComponent} from "./components/launch-group-new/components/launch-group-bd/launch-group-detail-bd/launch-group-detail-bd.component";
import {LaunchGroupListBdComponent} from "./components/launch-group-new/components/launch-group-bd/launch-group-list-bd/launch-group-list-bd.component";
import { LaunchGroupPreviewBdComponent } from './components/launch-group-new/components/launch-group-bd/launch-group-preview-bd/launch-group-preview-bd.component';
import { CreativeTemplateBdComponent } from './components/launch-group-new/components/launch-group-bd/creative-template-bd/creative-template-bd.component';
import {AddLandingPageBdComponent} from "./components/launch-group-new/components/launch-group-bd/add-landing-page-bd/add-landing-page-bd.component";
import { CreativeGroupTemplateUcComponent } from './components/launch-group/components/launch-group-uc/creative-group-template-uc/creative-group-template-uc.component';
import {LaunchGroupTemplateNewUcComponent} from "./components/launch-group-new/components/launch-group-new-uc/launch-group-template-new-uc/launch-group-template-new-uc.component";
import {LaunchGroupListNewUcComponent} from "./components/launch-group-new/components/launch-group-new-uc/launch-group-list-new-uc/launch-group-list-new-uc.component";
import {AddLaunchGroupNewUcComponent} from "./components/launch-group-new/components/launch-group-new-uc/add-launch-group-new-uc/add-launch-group-new-uc.component";
import {LaunchGroupDetailNewUcComponent} from "./components/launch-group-new/components/launch-group-new-uc/launch-group-detail-new-uc/launch-group-detail-new-uc.component";

const routes: Routes = [
  {
    path: '',
    component: LaunchRpaComponent,
    children: [
      { path: '', redirectTo: 'group', pathMatch: 'full' },
      {
        path: 'group',
        children: [
          {
            path: '',
            component: LaunchGroupListComponent,
            data: {
              title: 'group',
            }
          },
          {
            path: 'toutiao/:id',
            component: LaunchGroupDetailToutiaoComponent
          },
          {
            path: 'gdt/:id',
            component: LaunchGroupDetailGdtComponent
          },
          {
            path: 'uc/:id',
            component: LaunchGroupDetailUcComponent
          },
          {
            path: 'kuaishou/:id',
            component: LaunchGroupDetailKuaishouComponent
          },
          {
            path: 'baidu/:id',
            component: LaunchGroupDetailBaiduComponent
          },
          {
            path: 'niu/:id',
            component: LaunchGroupDetailNiuComponent
          },
          {
            path: 'qianchuan/:id',
            component: LaunchGroupDetailQianchuanComponent
          }
        ]
      },
      {
        path: 'group_new',
        children: [
          {
            path: '',
            component: LaunchGroupNewComponent,
            data: {
              title: 'group_new',
            }
          },
          {
            path: 'qianchuan/:id',
            component: LaunchGroupDetailQcComponent
          },
          {
            path: 'baidu/:id',
            component: LaunchGroupDetailBdComponent
          },
          {
            path: 'uc/:id',
            component: LaunchGroupDetailNewUcComponent
          },
        ]
      },
      {
        path: 'channel',
        component: LaunchChannelComponent,
        data: {
          title: 'channel',
        }
      },
      {
        path: 'target',
        component: LaunchTargetComponent,
        data: {
          title: 'target',
        }
      },
      {
        path: 'target_new',
        component: LaunchTargetNewComponent,
        data: {
          title: 'target',
        }
      },
      {
        path: 'title',
        component: LaunchTitleComponent,
        data: {
          title: 'title'
        }
      },
      {
        path: 'image',
        component: LaunchMaterialImageComponent,
        data: {
          title: 'image',
        }
      },
      {
        path: 'video',
        component: LaunchMaterialVideoComponent,
        data: {
          title: 'video',
        }
      },
      {
        path: 'cover',
        component: LaunchMaterialCoverComponent,
        data: {
          title: 'cover',
        }
      },
      {
        path: 'author',
        component: LaunchAuthorComponent,
        data: {
          title: 'author',
        }
      },
      {
        path: 'card',
        children: [
          {
            path: '',
            component: LaunchCardComponent,
            data: {
              title: 'card',
            }
          },
          {
            path: 'create',
            component: AddCardTemplateComponent,
          },
        ]
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
    TencentMapModule,
    LayoutLeftMenuModule,
  ],
  declarations: [
    LaunchRpaComponent,
    AddMaterialsAuthorComponent,
    UploadVideoMaterialsBatchComponent,
    UploadImageMaterialsComponent,
    MaterialsDetailModalComponent,
    MaterialsImageDetailModalComponent,
    LaunchMaterialImageModalComponent,
    LaunchMaterialVideoModalComponent,
    AddCatalogueListTemplateComponent,
    LaunchGroupListToutiaoComponent,
    LaunchChannelListToutiaoComponent,
    LaunchTargetListToutiaoComponent,
    LaunchTitleComponent,
    AddLaunchGroupToutiaoComponent,
    AddLaunchTitleComponent,
    LaunchTargetBasicToutiaoComponent,
    TargetBasicTemplateToutiaoComponent,
    LaunchGroupDetailToutiaoComponent,
    LaunchGroupTemplateToutiaoComponent,
    AddChannelToutiaoComponent,
    LaunchTitleModalComponent,
    LaunchAuthorComponent,
    LaunchMaterialImageComponent,
    LaunchMaterialVideoComponent,
    BatchEditLabelModalComponent,
    LaunchChannelEditChannelsComponent,
    LaunchLogComponent,
    LaunchTemplateRunLogComponent,
    LaunchCardComponent,
    AddCardTemplateComponent,
    CardTemplateSectionComponent,
    LaunchTargetListGdtComponent,
    LaunchTargetBasicGdtComponent,
    TargetBasicTemplateGdtComponent,
    LaunchTargetComponent,
    AddChannelGdtComponent,
    LaunchChannelComponent,
    LaunchChannelListGdtComponent,
    LaunchMaterialCoverComponent,
    LaunchMaterialCoverModalComponent,
    LaunchGroupListComponent,
    AddLaunchGroupGdtComponent,
    LaunchGroupListGdtComponent,
    LaunchGroupTemplateGdtComponent,
    LaunchGroupDetailGdtComponent,
    CreativeTemplateGdtComponent,
    LaunchTargetListUcComponent,
    LaunchTargetBasicUcComponent,
    TargetBasicTemplateUcComponent,
    LaunchChannelListUcComponent,
    AddChannelUcComponent,
    UploadChannelListComponent,
    LaunchGroupListUcComponent,
    AddLaunchGroupUcComponent,
    LaunchGroupDetailUcComponent,
    LaunchTargetComponent,
    LaunchChannelComponent,
    LaunchMaterialCoverComponent,
    LaunchMaterialCoverModalComponent,
    LaunchGroupTemplateUcComponent,
    LaunchGroupListKuaishouComponent,
    AddLaunchGroupKuaishouComponent,
    LaunchGroupDetailKuaishouComponent,
    LaunchGroupTemplateKuaishouComponent,
    LaunchChannelListKuaishouComponent,
    AddChannelKuaishouComponent,
    LaunchTargetListKuaishouComponent,
    LaunchTargetBasicKuaishouComponent,
    TargetBasicTemplateKuaishouComponent,
    CreativeTemplateKuaishouComponent,
    LaunchTargetBasicBaiduComponent,
    LaunchTargetListBaiduComponent,
    TargetBasicTemplateBaiduComponent,
    AddChannelBaiduComponent,
    LaunchChannelListBaiduComponent,
    AddLaunchGroupBaiduComponent,
    LaunchGroupDetailBaiduComponent,
    LaunchGroupListBaiduComponent,
    LaunchGroupTemplateBaiduComponent,
    CreativeAttributesGdtComponent,
    LaunchGroupListNiuComponent,
    AddLaunchGroupNiuComponent,
    LaunchGroupDetailNiuComponent,
    LaunchGroupTemplateNiuComponent,
    LaunchTargetListNiuComponent,
    LaunchTargetBasicNiuComponent,
    TargetBasicTemplateNiuComponent,
    CreativeTemplateNiuComponent,
    AddGoodsListDrawerComponent,
    LaunchGroupListQianchuanComponent,
    AddLaunchGroupQianchuanComponent,
    LaunchGroupDetailQianchuanComponent,
    LaunchGroupTemplateQianchuanComponent,
    LaunchTargetBasicQianchuanComponent,
    LaunchTargetListQianchuanComponent,
    TargetBasicTemplateQianchuanComponent,
    LaunchGroupTemplateQcComponent,
    AddLaunchGroupQcComponent,
    LaunchGroupDetailQcComponent,
    LaunchGroupListQcComponent,
    LaunchGroupNewComponent,
    LaunchTargetNewComponent,
    LaunchTargetBasicQcComponent,
    LaunchTargetListQcComponent,
    TargetBasicTemplateQcComponent,
    LaunchTargetBasicBdComponent,
    LaunchTargetListBdComponent,
    TargetBasicTemplateBdComponent,
    LaunchGroupTemplateBdComponent,
    AddLaunchGroupBdComponent,
    LaunchGroupDetailBdComponent,
    LaunchGroupListBdComponent,
    LaunchGroupPreviewBdComponent,
    CreativeTemplateBdComponent,
    AddLandingPageBdComponent,
    CreativeGroupTemplateUcComponent,
    LaunchGroupTemplateNewUcComponent,
    LaunchGroupListNewUcComponent,
    AddLaunchGroupNewUcComponent,
    LaunchGroupDetailNewUcComponent
  ],
  providers: [
    DateDefineService,
    DataViewService,
    ReportService,
    DataStackService,
    MaterialsService,
    LaunchService,
    LaunchRpaService,
  ],
  exports: [RouterModule],
  entryComponents: [
    AddMaterialsAuthorComponent,
    UploadVideoMaterialsBatchComponent,
    UploadImageMaterialsComponent,
    MaterialsDetailModalComponent,
    MaterialsImageDetailModalComponent,
    LaunchMaterialImageModalComponent,
    LaunchTitleModalComponent,
    LaunchMaterialVideoModalComponent,
    AddCatalogueListTemplateComponent,
    BatchEditLabelModalComponent,
    AddLaunchGroupToutiaoComponent,
    AddLaunchTitleComponent,
    AddChannelToutiaoComponent,
    AddChannelGdtComponent,
  ]
})
export class LaunchRpaModule { }
