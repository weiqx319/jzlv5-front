import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstraintConditionViewComponent } from './constraint-condition-view.component';
import {SharedModule} from "../../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [ConstraintConditionViewComponent],
  declarations: [ConstraintConditionViewComponent],
})
export class ConstraintConditionModule { }
