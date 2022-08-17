import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "../../shared/shared.module";
import {SetSummaryTimeComponent} from "./set-summary-time.component";
import {SetSummaryTimeStructureService} from "./service/set-summary-time-structure.service";

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [SetSummaryTimeComponent],
  declarations: [SetSummaryTimeComponent],
  entryComponents: [SetSummaryTimeComponent],
  providers: [SetSummaryTimeStructureService]
})
export class SetSummaryTimeModule { }
