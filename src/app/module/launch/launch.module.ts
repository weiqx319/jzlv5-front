import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AdgroupSectionComponent} from "./components/adgroup-section/adgroup-section.component";
import {CampaignSectionComponent} from "./components/campaign-section/campaign-section.component";
import {CreativeSectionComponent} from "./components/creative-section/creative-section.component";
import {SharedModule} from "../../shared/shared.module";
import {DateSelectViewModule} from "../date-select-view/date-select-view.module";
import { TargetSettingComponent } from './components/target-setting/target-setting.component';
import {TransferTreeModule} from "../transfter-tree/transfer-tree.module";
import { DataViewService } from 'src/app/routes/data-view-feed/service/data-view.service';
import {ShowScheduleModule} from "../show-schedule/show-schedule.module";
import {LaunchService} from "./service/launch.service";
import {BdCampaignSectionComponent} from "./components/bd-campaign-section/bd-campaign-section.component";
import {BdAdgroupSectionComponent} from "./components/bd-adgroup-section/bd-adgroup-section.component";
import {BdCreativeSectionComponent} from "./components/bd-creative-section/bd-creative-section.component";
import {BdTargetSettingComponent} from "./components/bd-target-setting/bd-target-setting.component";
import { CardSectionComponent } from './components/card-section/card-section.component';
import { UcAdgroupSectionComponent } from './components/uc-adgroup-section/uc-adgroup-section.component';
import { UcTargetSettingComponent } from './components/uc-target-setting/uc-target-setting.component';
import { UcCreativeSectionComponent } from './components/uc-creative-section/uc-creative-section.component';
import { SelectResultComponent } from './components/select-result/select-result.component';

@NgModule({
  declarations: [
    AdgroupSectionComponent,
    CampaignSectionComponent,
    CreativeSectionComponent,
    TargetSettingComponent,
    BdCampaignSectionComponent,
    BdAdgroupSectionComponent,
    BdCreativeSectionComponent,
    BdTargetSettingComponent,
    CardSectionComponent,
    UcAdgroupSectionComponent,
    UcTargetSettingComponent,
    UcCreativeSectionComponent,
    SelectResultComponent,
  ],
  exports: [
    AdgroupSectionComponent,
    CampaignSectionComponent,
    CreativeSectionComponent,
    TargetSettingComponent,
    BdCampaignSectionComponent,
    BdAdgroupSectionComponent,
    BdCreativeSectionComponent,
    BdTargetSettingComponent,
    CardSectionComponent,
    UcAdgroupSectionComponent,
    UcTargetSettingComponent,
    UcCreativeSectionComponent,
    SelectResultComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    DateSelectViewModule,
    ShowScheduleModule,
    TransferTreeModule,
  ],
  providers: [
    LaunchService,
    DataViewService,
  ]
})
export class LaunchModule { }
