import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import { TencentMapComponent } from './tencent-map.component';



@NgModule({
  declarations: [
    TencentMapComponent
  ],
  exports: [
    TencentMapComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class TencentMapModule { }
