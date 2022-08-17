import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TransferTreeComponent} from './transfer-tree.component';
import {StringTemplateOutletDirective} from './string-template-outlet.directive';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzInputModule } from 'ng-zorro-antd/input';

@NgModule({
  declarations: [
    TransferTreeComponent,
    StringTemplateOutletDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzTreeModule,
    NzInputModule
  ],
  exports: [
    TransferTreeComponent
  ]
})
export class TransferTreeModule { }
