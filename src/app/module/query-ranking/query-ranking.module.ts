import { NgModule } from '@angular/core';
import {QueryRankingComponent} from "./query-ranking.component";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";

@NgModule({
  imports: [
    SharedModule
  ],
  exports: [QueryRankingComponent],
  declarations: [QueryRankingComponent],
  entryComponents: [QueryRankingComponent]
})
export class QueryRankingModule { }
