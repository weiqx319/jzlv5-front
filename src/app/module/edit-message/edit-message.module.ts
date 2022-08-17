import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "../../shared/shared.module";
import {EditMessageComponent} from "./edit-message.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [EditMessageComponent],
  declarations: [EditMessageComponent],
  entryComponents: [EditMessageComponent]
})
export class EditMessageModule { }
