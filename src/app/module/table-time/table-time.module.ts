import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {TableTimeTipComponent} from './components/table-time-tip/table-time-tip.component';
import {TableTimeComponent} from './components/table-time/table-time.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,

  ],
  exports: [
    TableTimeTipComponent
  ],

  declarations: [
    TableTimeComponent,TableTimeTipComponent,
  ],
  entryComponents: [ TableTimeComponent],
  providers: [ ],
})
export class TableTimeModule { }
