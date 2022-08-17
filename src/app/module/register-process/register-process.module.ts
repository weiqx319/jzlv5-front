import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterProcessComponent } from './register-process.component';
import {SharedModule} from "../../shared/shared.module";


@NgModule({
  declarations: [
    RegisterProcessComponent
  ],
  exports: [
    RegisterProcessComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class RegisterProcessModule { }
