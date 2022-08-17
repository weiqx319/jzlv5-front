import { NgModule } from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {KeywordStructureComponent} from './list/keyword-structure.component';

@NgModule({
  imports: [
    SharedModule
  ],
  exports: [ KeywordStructureComponent],
  declarations: [ KeywordStructureComponent],
  entryComponents: [KeywordStructureComponent]
})
export class KeywordStructureModule { }
