import { NgModule } from '@angular/core';
import {SharedModule} from "../../shared/shared.module";
import {QuickStartComponent} from './components/quick-start/quick-start.component';
import {QuickDeleteComponent} from './components/quick-delete/quick-delete.component';

@NgModule({
  imports: [
    SharedModule
  ],
  exports: [QuickStartComponent,QuickDeleteComponent],
  declarations: [QuickStartComponent,QuickDeleteComponent],
  entryComponents: [QuickStartComponent,QuickDeleteComponent]
})
export class QuickOperModule { }
