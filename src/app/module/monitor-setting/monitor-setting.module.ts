import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "../../shared/shared.module";
import {EditAutomaticMonitoringComponent} from './components/edit-automatic-monitoring/edit-automatic-monitoring.component';
import {MonitorSettingService} from './service/monitor-setting.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    EditAutomaticMonitoringComponent

  ],
  declarations: [
    EditAutomaticMonitoringComponent
  ],
  providers:[
    MonitorSettingService,
  ]
})
export class MonitorSettingModule { }
