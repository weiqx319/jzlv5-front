import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "../../shared/shared.module";
import {ShowScheduleComponent} from "./components/show-schedule/show-schedule.component";
import {EditScheduleComponent} from './components/edit-schedule/edit-schedule.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [ShowScheduleComponent,EditScheduleComponent],
  declarations: [ShowScheduleComponent,EditScheduleComponent],
  entryComponents:[ShowScheduleComponent,EditScheduleComponent]
})


export class ShowScheduleModule { }
