import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../../shared/shared.module";
import { LayoutLeftMenuComponent } from "./layout-left-menu.component";
import { RouterModule, Routes } from '@angular/router';

@NgModule({
  declarations: [LayoutLeftMenuComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    LayoutLeftMenuComponent
  ],
})
export class LayoutLeftMenuModule { }
