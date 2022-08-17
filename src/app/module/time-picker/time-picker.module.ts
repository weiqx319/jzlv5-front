import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {TimePickerComponent} from "./time-picker.component";


@NgModule({
  declarations: [TimePickerComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    TimePickerComponent,
]
})
export class TimePickerModule { }
