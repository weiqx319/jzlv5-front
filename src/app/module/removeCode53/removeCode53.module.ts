import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import { RemoveCode53Component } from './remove-code53/remove-code53.component';

@NgModule({
  imports: [
    SharedModule
  ],
  exports: [RemoveCode53Component],
  declarations: [RemoveCode53Component],
  entryComponents: [RemoveCode53Component],
  providers: []
})
export class RemoveCode53Module { }
