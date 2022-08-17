import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NotifyService} from "./notify.service";
import {SharedModule} from "../../shared/shared.module";





@NgModule({
  imports: [
    CommonModule,
    SharedModule,
  ],
  declarations: [],
  providers: [ NotifyService ]
})
export class NotifyModule { }
