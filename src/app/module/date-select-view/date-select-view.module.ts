import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "../../shared/shared.module";
import {DateSelectViewComponent} from "./date-select-view.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [DateSelectViewComponent],
  declarations: [DateSelectViewComponent],
  entryComponents: [DateSelectViewComponent]
})
export class DateSelectViewModule { }
