import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "../../shared/shared.module";
import {CreativeStyleShowComponent} from './components/creative-style-show/creative-style-show.component';
import {GdtCreativeStyleShowComponent} from './components/gdt-creative-style-show/gdt-creative-style-show.component';
import {ByteDanceCreativeStyleShowComponent} from './components/byte-dance-creative-style-show/byte-dance-creative-style-show.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    CreativeStyleShowComponent,
    ByteDanceCreativeStyleShowComponent,
    GdtCreativeStyleShowComponent

  ],
  declarations: [
    CreativeStyleShowComponent,
    ByteDanceCreativeStyleShowComponent,
    GdtCreativeStyleShowComponent],
  entryComponents: [
    CreativeStyleShowComponent,
    ByteDanceCreativeStyleShowComponent,
    GdtCreativeStyleShowComponent,
  ],
})
export class CreativeStyleModule { }
