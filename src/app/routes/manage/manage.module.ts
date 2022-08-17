import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ManageComponent } from './manage.component';
import { SharedModule } from '../../shared/shared.module';
import { TaskLogComponent } from './components/log-center/components/task-log/task-log.component';
import { ManageService } from './service/manage.service';
import { AddUserComponent } from './modal/add-user/add-user.component';
import { AddAccountComponent } from './components/account-center/components/add-account/add-account.component';
import { AccountBindingComponent } from './components/account-center/components/account-binding/account-binding.component';
import { AccountBindingModalComponent } from './modal/account-binding-modal/account-binding-modal.component';
import { TaskListComponent } from './modal/task-list/task-list.component';
import { TaskDetailComponent } from './modal/task-detail/task-detail.component';
import { AdvertFormComponent } from './modal/advert-form/advert-form.component';
import { ManageItemService } from './service/manage-item.service';
import { BasicComponent } from './components/person-center/components/basic/basic.component';
import { MsgCenterComponent } from './components/person-center/components/msg-center/msg-center.component';
import { MsgListComponent } from './components/person-center/components/msg-center/component/msg-list/msg-list.component';
import { MsgDetailComponent } from './components/person-center/components/msg-center/component/msg-detail/msg-detail.component';
import { DimensionComponent } from './components/metric-center/components/dimension/dimension.component';
import { MetricComponent } from './components/metric-center/components/metric-setting/components/metric/metric.component';
import { ConversionComponent } from './components/metric-center/components/conversion-setting/components/conversion/conversion.component';
import { ConversionDescComponent } from './components/metric-center/components/conversion-setting/components/conversion-desc/conversion-desc.component';
import { AddDimensionComponent } from './modal/add-dimension/add-dimension.component';
import { AddConversionDataComponent } from './modal/add-conversion-data/add-conversion-data.component';
import { AddConversionDescComponent } from './modal/add-conversion-desc/add-conversion-desc.component';
import { AddMetricDataComponent } from './modal/add-metric-data/add-metric-data.component';
import { DefineSettingService } from './service/define-setting.service';
import { TableHeaderFilterModule } from '@jzl/table-header-filter';
import { GeneratorComponent } from './components/account-center/components/generator/generator.component';
import { AccountBindingSetPasswordComponent } from './modal/account-binding-set-password/account-binding-set-password.component';
import { UserEditPasswordComponent } from './modal/user-edit-password/user-edit-password.component';
import { ItemSelectModule } from '../../module/item-select/item-select.module';
import { DndModule } from 'ng2-dnd';
import { UploadConversionComponent } from './modal/upload-conversion/upload-conversion.component';
import { CanDeactivateGuard } from '../../core/guard/can-deactivate.guard';
import { AddAuthorComponent } from './modal/add-author/add-author.component';
import { AddAuthorMessageComponent } from './modal/add-author/add-author-message/add-author-message.component';
import { AccountBindingMultiChannelComponent } from './modal/account-binding-multi-channel/account-binding-multi-channel.component';
import { AccountBindingChannelNoAccountComponent } from './modal/account-binding-channel-no-account/account-binding-channel-no-account.component';
import { ExtensionGeneratorComponent } from './modal/extension-generator/extension-generator.component';

import { HotTableModule } from '@jzl/hot-table6';


import { TableSettingModule } from '../../module/table-setting/table-setting.module';
import { DateDefineService } from "../../shared/service/date-define.service";
import { TaskListCronComponent } from "./modal/task-list-cron/task-list-cron.component";
import { AccountKeeperComponent } from "./components/account-center/components/account-keeper/account-keeper.component";
import { AccountBindingKeeperComponent } from "./modal/account-binding-keeper/account-binding-keeper.component";
import { AccountKeeperDetailComponent } from "./components/account-center/components/account-keeper-detail/account-keeper-detail.component";
import { AccountBindingKeeperChildComponent } from "./modal/account-binding-keeper-child/account-binding-keeper-child.component";
import { RollbackComponent } from "./modal/rollback/rollback.component";
import { TableTimeModule } from '../../module/table-time/table-time.module';
import { CompanyMetricComponent } from './components/metric-center/components/metric-setting/components/company-metric/company-metric.component';
import { AddCompanyMetricDataComponent } from './modal/add-company-metric-data/add-company-metric-data.component';
import { CompanyMetricDetailComponent } from './components/metric-center/components/company-metric-detail/company-metric-detail.component';
import { AddCompanyMetricDetailDataComponent } from './modal/add-company-metric-detail-data/add-company-metric-detail-data.component';
import { NegationWordComponent } from './components/tools-center/components/negation-word/negation-word.component';
import { NegationListComponent } from './components/tools-center/components/negation-word/component/negation-list/negation-list.component';
import { AddNegativeWordGroupComponent } from './modal/add-negative-word-group/add-negative-word-group.component';
import { NegativeWordListComponent } from './components/tools-center/components/negation-word/component/negative-word-list/negative-word-list.component';
import { AddNegativeWordComponent } from './modal/add-negative-word/add-negative-word.component';
import { BlackWordComponent } from './components/tools-center/components/black-word/black-word.component';
import { BlackWordListComponent } from './components/tools-center/components/black-word/components/detail/components/black-word-list/black-word-list.component';
import { BlackWordLogComponent } from './components/tools-center/components/black-word/components/list/components/black-word-log/black-word-log.component';
import { BlackGroupListComponent } from './components/tools-center/components/black-word/components/list/components/black-group-list/black-group-list.component';
import { AddBlackWordComponent } from './modal/add-black-word/add-black-word.component';
import { BlackListComponent } from "./components/tools-center/components/black-word/components/list/black-list.component";
import { BlackDetailComponent } from './components/tools-center/components/black-word/components/detail/black-detail.component';
import { KeywordDetailComponent } from './components/tools-center/components/black-word/components/detail/components/keyword-detail/keyword-detail.component';
import { CreativeDetailComponent } from './components/tools-center/components/black-word/components/detail/components/creative-detail/creative-detail.component';
import { EditBlackWordCreativeComponent } from './modal/edit-black-word-creative/edit-black-word-creative.component';
import { ManualDataComponent } from './components/ingestion-center/components/manual_data/manual-data.component';

import { AccountBindingUploadCompensateComponent } from './modal/account-binding-upload-compensate/account-binding-upload-compensate.component';

import { TradeMarkListComponent } from '../../module/trade/components/trade-mark-list/trade-mark-list.component';
import { OneMarkListComponent } from '../../module/trade/components/one-mark-list/one-mark-list.component';
import { TwoMarkListComponent } from '../../module/trade/components/two-mark-list/two-mark-list.component';
import { TradeRuleComponent } from '../../module/trade/components/trade-rule/trade-rule.component';
import { TradeModule } from '../../module/trade/trade.module';
import { AccountCenterComponent } from './components/account-center/account-center.component';
import { MetricCenterComponent } from './components/metric-center/metric-center.component';
import { LogCenterComponent } from './components/log-center/log-center.component';
import { UserManageComponent } from './components/account-center/components/user-manage/user-manage.component';
import { AdvertManageComponent } from './components/account-center/components/advert-manage/advert-manage.component';
import { ToolsCenterComponent } from './components/tools-center/tools-center.component';
import { IngestionCenterComponent } from './components/ingestion-center/ingestion-center.component';
import { PersonCenterComponent } from './components/person-center/person-center.component';
import { MaterialsManageComponent } from "./components/materials-manage/materials-manage.component";
import { MaterialsManageVideoComponent } from "./components/materials-manage/components/materials-manage-video/materials-manage-video.component";
import { MaterialsManageImageComponent } from "./components/materials-manage/components/materials-manage-image/materials-manage-image.component";
import { MaterialsManageCoverComponent } from "./components/materials-manage/components/materials-manage-cover/materials-manage-cover.component";
import { MaterialsManageLogoComponent } from "./components/materials-manage/components/materials-manage-logo/materials-manage-logo.component";
import { CreateMaterialsDetailComponent } from "./modal/create-materials-detail/create-materials-detail.component";
import { PushMaterialsModalComponent } from "./modal/push-materials-modal/push-materials-modal.component";
import { SyncMaterialsModalComponent } from "./modal/sync-materials-modal/sync-materials-modal.component";
import { TimePickerModule } from "../../module/time-picker/time-picker.module";
import { UploadMaterialsModalComponent } from './modal/upload-materials-modal/upload-materials-modal.component';
import { MaterialsManageReportVideoComponent } from './components/materials-manage/components/materials-manage-report-video/materials-manage-report-video.component';
import { ViewChartModule } from "../../module/view-chart/view-chart.module";
import { MaterialStyleModule } from "../../module/material-style/material-style.module";
import { MaterialsManageReportImageComponent } from './components/materials-manage/components/materials-manage-report-image/materials-manage-report-image.component';
import { MaterialsResolveService } from "./service/materials-resolve.service";
import { MaterialsManageAuthorComponent } from './components/materials-manage/components/materials-manage-author/materials-manage-author.component';
import { AddMaterialManageAuthorComponent } from './modal/add-material-manage-author/add-material-manage-author.component';
import { MetricCategoryComponent } from './components/metric-center/components/metric-setting/components/metric-category/metric-category.component';
import { AddMeticCategoryComponent } from "./modal/add-metic-category/add-metic-category.component";
import { CompanyAccountDimensionComponent } from './components/metric-center/components/company-account-dimension/company-account-dimension.component';
import { AddCompanyAccountDimensionComponent } from './modal/add-company-account-dimension/add-company-account-dimension.component';
import { ConversionLogComponent } from './components/log-center/components/conversion-log/conversion-log.component';
import { ConversionListComponent } from './modal/conversion-list/conversion-list.component';
import { AuthorityManageComponent } from './components/authority-manage/authority-manage.component';
import { DataRoleComponent } from './components/authority-manage/components/data-role/data-role.component';
import { DataRoleCreateComponent } from './components/authority-manage/components/data-role-create/data-role-create.component';
import { EditDataRoleComponent } from './modal/edit-data-role/edit-data-role.component';
import { LayoutLeftMenuModule } from "../../module/layout-left-menu/layout-left-menu.module";
import { BlackWordLogListComponent } from './components/tools-center/components/black-word/components/detail/components/black-word-log-list/black-word-log-list.component';

import { AccountBindingChannelJinniuComponent } from './modal/account-binding-channel-jinniu/account-binding-channel-jinniu.component';
import { ChannelPublisherComponent } from './components/account-center/components/channel-publisher/channel-publisher.component';
import { CustomChannelComponent } from "./components/account-center/components/channel-publisher/components/custom-channel/custom-channel.component";
import { DefaultChannelComponent } from "./components/account-center/components/channel-publisher/components/default-channel/default-channel.component";
import { CustomPublisherComponent } from "./components/account-center/components/channel-publisher/components/custom-publisher/custom-publisher.component";
import { DefaultPublisherComponent } from "./components/account-center/components/channel-publisher/components/default-publisher/default-publisher.component";
import { ConversionDataComponent } from './components/ingestion-center/components/conversion-data/conversion-data.component';
import { ConversionSettingComponent } from './components/metric-center/components/conversion-setting/conversion-setting.component';
import { MetricSettingComponent } from './components/metric-center/components/metric-setting/metric-setting.component';
import { CompensateDataComponent } from './components/ingestion-center/components/compensate-data/compensate-data.component';
import { AccountBindingDetailComponent } from './components/account-center/components/account-binding/conponents/account-binding-detail/account-binding-detail.component';
import { CompensateComponent } from './components/ingestion-center/components/compensate-data/components/compensate/compensate.component';
import { MessageComponent } from './components/person-center/components/msg-center/component/msg-list/components/message/message.component';
import { BlackWordDownloadComponent } from './components/tools-center/components/black-word/components/list/components/black-word-download/black-word-download.component';
import {TransferTreeModule} from "../../module/transfter-tree/transfer-tree.module";

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'personal', pathMatch: 'full' },

      {
        path: 'personal',
        component: PersonCenterComponent,
        children: [
          { path: '', redirectTo: 'basic', pathMatch: 'full' },
          { path: 'basic', component: BasicComponent, data: { type: 'basic' } },
          { path: 'password', component: BasicComponent, data: { type: 'password' } },
          {
            path: 'msg',
            component: MsgCenterComponent,
            children: [
              {
                path: '',
                redirectTo: 'message_list',
                pathMatch: 'full'
              },
              {
                path: 'message_list',
                component: MsgListComponent,
                children: [
                  { path: '', redirectTo: 'all', pathMatch: 'full' },
                  { path: 'all', component: MessageComponent, data: { showType: 0 } },
                  { path: 'setting', component: MessageComponent, data: { showType: 1 } },
                  { path: 'account', component: MessageComponent, data: { showType: 2 } },
                  { path: 'product', component: MessageComponent, data: { showType: 3 } },
                ]
              },
              {
                path: 'message_detail',
                component: MsgDetailComponent
              },
            ]
          },
        ]
      },
      {
        path: 'account',
        component: AccountCenterComponent,
        children: [
          { path: '', redirectTo: 'account_binding', pathMatch: 'full' },
          {
            path: 'account_binding',
            component: AccountBindingComponent,
            children: [
              { path: '', redirectTo: 'account', pathMatch: 'full' },
              { path: 'account', component: AccountBindingDetailComponent, data: { showType: 'hasAccount' } },
              { path: 'virtual_account', component: AccountBindingDetailComponent, data: { showType: 'virtualAccount' } },
              { path: 'compensate_account', component: CompensateComponent, data: { showType: 'compensateAccount' } },
              { path: 'compensate_log', component: CompensateComponent, data: { showType: 'compensateLog' } },
            ]
          },
          {
            path: 'account_keeper',
            component: AccountKeeperComponent,
          },
          {
            path: 'account_keeper/:superAccountId',
            component: AccountKeeperDetailComponent,
          },
          { path: 'generator', component: GeneratorComponent },
          { path: 'user_manage', component: UserManageComponent },
          { path: 'advert_manage', component: AdvertManageComponent, },
          {
            path: 'channel_publisher', component: ChannelPublisherComponent,
            children: [
              { path: '', redirectTo: 'default_channel', pathMatch: 'full' },
              { path: 'custom_channel', component: CustomChannelComponent, },
              { path: 'default_channel', component: DefaultChannelComponent, },
              { path: 'custom_publisher', component: CustomPublisherComponent, },
              { path: 'default_publisher', component: DefaultPublisherComponent },
            ]
          },
        ]
      },
      {
        path: 'log',
        component: LogCenterComponent,
        children: [
          { path: '', redirectTo: 'task_log', pathMatch: 'full' },
          {
            path: 'task_log', component: TaskLogComponent,
            children: [
              { path: '', redirectTo: 'list', pathMatch: 'full' },
              { path: 'list', component: TaskListComponent },
              { path: 'list_cron', component: TaskListCronComponent },
              { path: 'detail', component: TaskDetailComponent },
            ]
          },
          { path: 'conversion_log', component: ConversionLogComponent, },
        ]
      },
      {
        path: 'ingestion',
        component: IngestionCenterComponent,
        children: [
          { path: '', redirectTo: 'manual_data', pathMatch: 'full' },
          { path: 'manual_data', component: ManualDataComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'conversion_data', component: ConversionDataComponent, canDeactivate: [CanDeactivateGuard] },
          {
            path: 'compensate_data', component: CompensateDataComponent,
            children: [
              { path: '', redirectTo: 'compensate_account', pathMatch: 'full' },
              { path: 'compensate_account', component: CompensateComponent, data: { showType: 'compensateAccount' } },
              { path: 'compensate_log', component: CompensateComponent, data: { showType: 'compensateLog' } },
            ]
          },
        ],

      },
      {
        path: 'materials-manage',
        component: MaterialsManageComponent,
        children: [
          { path: '', redirectTo: 'video', pathMatch: 'full' },
          {
            path: 'video',
            component: MaterialsManageVideoComponent,
          },
          {
            path: 'image',
            component: MaterialsManageImageComponent,
          },
          {
            path: 'cover',
            component: MaterialsManageCoverComponent,
          },
          {
            path: 'logo',
            component: MaterialsManageLogoComponent,
          },
          {
            path: 'video-report',
            component: MaterialsManageReportVideoComponent,
          },
          {
            path: 'image-report',
            component: MaterialsManageReportImageComponent,
          },
          {
            path: 'materials-author',
            component: MaterialsManageAuthorComponent,
          },
        ],
        resolve: {
          metric: MaterialsResolveService
        }

      },
      {
        path: 'tools',
        component: ToolsCenterComponent,
        children: [
          { path: '', redirectTo: 'negation_word', pathMatch: 'full' },

          {
            path: 'negation_word',
            component: NegationWordComponent,
            children: [
              {
                path: '',
                redirectTo: 'negation_group_list',
                pathMatch: 'full'
              },
              {
                path: 'negation_group_list',
                component: NegationListComponent
              },
              {
                path: 'negation_word_list',
                component: NegativeWordListComponent
              },
            ]
          },
          {
            path: 'black_word',
            component: BlackWordComponent,
            children: [
              {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
              },
              {
                path: 'list',
                component: BlackListComponent,
                children: [
                  {
                    path: '',
                    redirectTo: 'black_group_list',
                    pathMatch: 'full'
                  },
                  {
                    path: 'black_group_list',
                    component: BlackGroupListComponent
                  },
                ]
              },
              {
                path: 'detail',
                component: BlackDetailComponent,
                children: [
                  {
                    path: 'black_word_list',
                    component: BlackWordListComponent
                  },
                  {
                    path: 'black_word_log',
                    component: BlackWordLogListComponent
                  },
                ]
              },
            ]
          }
        ]
      },
      {
        path: 'metric',
        component: MetricCenterComponent,
        children: [
          { path: '', redirectTo: 'metric_setting', pathMatch: 'full' },
          {
            path: 'metric_setting',
            component: MetricSettingComponent,
            children: [
              { path: '', redirectTo: 'metric', pathMatch: 'full' },
              { path: 'metric', component: MetricComponent },
              { path: 'company_metric', component: CompanyMetricComponent },
              { path: 'metric_category', component: MetricCategoryComponent },
              {
                path: 'company_metric/:companyMetricId',
                component: CompanyMetricDetailComponent,
              },
            ]
          },
          { path: 'metric_feed', component: MetricSettingComponent },
          {
            path: 'company_metric/:companyMetricId',
            component: CompanyMetricDetailComponent,
          },
          {
            path: 'conversion_setting',
            component: ConversionSettingComponent,
            children: [
              { path: '', redirectTo: 'config', pathMatch: 'full' },
              { path: 'config', component: ConversionComponent, data: { showType: 'config' }, canDeactivate: [CanDeactivateGuard] },
              { path: 'desc', component: ConversionDescComponent },
              { path: 'log', component: ConversionComponent, data: { showType: 'log' }, },
            ]
          },

          {
            path: 'trade_mark',
            children: [
              {
                path: '',
                redirectTo: 'trade_mark_list',
                pathMatch: 'full'
              },
              {
                path: 'trade_mark_list',
                component: TradeMarkListComponent
              },
              {
                path: 'one_mark/:id',
                component: OneMarkListComponent
              },
              {
                path: 'two_mark/:id',
                component: TwoMarkListComponent
              },
              {
                path: 'trade_rule/:id',
                component: TradeRuleComponent
              }
            ]
          },
          { path: 'dimension', component: DimensionComponent },
          { path: 'company_account_dimension', component: CompanyAccountDimensionComponent },
        ]
      },
      {
        path: 'authority',
        component: AuthorityManageComponent,
        children: [
          { path: '', redirectTo: 'data-role', pathMatch: 'full' },
          { path: 'data-role', component: DataRoleComponent },
          { path: 'data-role/create', component: DataRoleCreateComponent },
          { path: 'data-role/edit/:roleId', component: DataRoleCreateComponent },
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ItemSelectModule,
    RouterModule.forChild(routes),
    DndModule.forRoot(),
    TableHeaderFilterModule,
    HotTableModule,
    TableSettingModule,
    TableTimeModule,
    TradeModule,
    TimePickerModule,
    ViewChartModule,
    MaterialStyleModule,
    LayoutLeftMenuModule,
    TransferTreeModule,
    // ItemSelectModule
  ],
  declarations: [
    ManageComponent,
    TaskLogComponent,
    UserManageComponent,
    AddUserComponent,
    AddAccountComponent,
    AccountBindingComponent,
    AccountBindingModalComponent,
    AdvertManageComponent,
    AdvertFormComponent,
    BasicComponent,
    MsgCenterComponent,
    MsgListComponent,
    MsgDetailComponent,
    DimensionComponent,
    AddDimensionComponent,
    MetricComponent,
    ConversionComponent,
    ConversionDescComponent,
    AddConversionDataComponent,
    AddConversionDescComponent,
    AddMetricDataComponent,
    AddCompanyMetricDataComponent,
    AddCompanyMetricDetailDataComponent,
    GeneratorComponent,
    AccountBindingSetPasswordComponent,
    UserEditPasswordComponent,
    UploadConversionComponent,
    AddAuthorComponent,
    AddAuthorMessageComponent,
    AccountBindingMultiChannelComponent,
    AccountBindingChannelNoAccountComponent,
    ExtensionGeneratorComponent,

    TaskListComponent,
    TaskListCronComponent,
    TaskDetailComponent,
    AccountKeeperComponent,
    AccountKeeperDetailComponent,
    AccountBindingKeeperComponent,
    AccountBindingKeeperChildComponent,
    CompanyMetricComponent,
    CompanyMetricDetailComponent,
    RollbackComponent,
    NegationWordComponent,
    NegationListComponent,
    AddNegativeWordGroupComponent,
    NegativeWordListComponent,
    AddNegativeWordComponent,
    BlackWordComponent,
    BlackWordListComponent,
    BlackWordLogComponent,
    BlackGroupListComponent,
    AddBlackWordComponent,
    BlackListComponent,
    BlackDetailComponent,
    KeywordDetailComponent,
    CreativeDetailComponent,
    EditBlackWordCreativeComponent,
    ManualDataComponent,
    AccountBindingUploadCompensateComponent,
    AccountCenterComponent,
    MetricCenterComponent,
    LogCenterComponent,
    IngestionCenterComponent,
    ToolsCenterComponent,
    PersonCenterComponent,
    MaterialsManageComponent,
    MaterialsManageVideoComponent,
    MaterialsManageImageComponent,
    MaterialsManageCoverComponent,
    MaterialsManageLogoComponent,
    CreateMaterialsDetailComponent,
    PushMaterialsModalComponent,
    SyncMaterialsModalComponent,
    UploadMaterialsModalComponent,
    MaterialsManageReportVideoComponent,
    MaterialsManageReportImageComponent,
    MaterialsManageAuthorComponent,
    AddMaterialManageAuthorComponent,
    MetricCategoryComponent,
    AddMeticCategoryComponent,
    CompanyAccountDimensionComponent,
    AddCompanyAccountDimensionComponent,
    ConversionLogComponent,
    ConversionListComponent,
    AuthorityManageComponent,
    DataRoleComponent,
    DataRoleCreateComponent,
    EditDataRoleComponent,
    BlackWordLogListComponent,
    AccountBindingChannelJinniuComponent,
    ChannelPublisherComponent,
    CustomChannelComponent,
    DefaultChannelComponent,
    CustomPublisherComponent,
    DefaultPublisherComponent,
    ConversionDataComponent,
    ConversionSettingComponent,
    MetricSettingComponent,
    CompensateDataComponent,
    AccountBindingDetailComponent,
    CompensateComponent,
    MessageComponent,
    BlackWordDownloadComponent,
  ],
  providers: [
    ManageService,
    ManageItemService,
    DefineSettingService,
    DateDefineService,
    MaterialsResolveService
  ],
  exports: [RouterModule],
  entryComponents: [
    AddUserComponent,
    AccountBindingModalComponent,
    AdvertFormComponent,
    AddDimensionComponent,
    AddMetricDataComponent,
    AddCompanyMetricDataComponent,
    AddCompanyMetricDetailDataComponent,
    AddConversionDataComponent,
    AddConversionDescComponent,
    AccountBindingSetPasswordComponent,
    UserEditPasswordComponent,
    UploadConversionComponent,
    AddAuthorComponent,
    AddAuthorMessageComponent,
    AccountBindingMultiChannelComponent,
    AccountBindingChannelNoAccountComponent,
    ExtensionGeneratorComponent,

    TaskListComponent,
    TaskDetailComponent,
    AccountBindingKeeperComponent,
    AccountBindingKeeperChildComponent,
    AddNegativeWordGroupComponent,
    AddNegativeWordComponent,
    AddBlackWordComponent,
    EditBlackWordCreativeComponent,
    MetricCategoryComponent,
    AddMeticCategoryComponent
  ]
})
export class ManageModule { }
