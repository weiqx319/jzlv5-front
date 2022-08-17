import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { DndModule } from "ng2-dnd";
import { DateDefineService } from "../../shared/service/date-define.service";
import { SharedModule } from "../../shared/shared.module";
import { ItemSelectModule } from "../item-select/item-select.module";
import { TableFieldComponent } from "./components/table-field/table-field.component";
import { TableQueryShowComponent } from './components/table-query-show/table-query-show.component';
import { TableQueryComponent } from './components/table-query/table-query.component';
import { TableStepComponent } from "./components/table-step/table-step.component";
import { RankingAlertTypePipe } from './pipe/ranking-alert-type.pipe';
import { RankingModelPipe } from './pipe/ranking-model.pipe';
import { RankingStatusPipe } from './pipe/ranking-status.pipe';
import { TableFieldFeedComponent } from './components/table-field/table-field-feed.component';
import { TableQueryFeedComponent } from './components/table-query/table-query-feed.component';
import { TableQueryShowFeedComponent } from './components/table-query-show/table-query-show-feed.component';
import { TableStepFeedComponent } from './components/table-step/table-step-feed.component';
import { TableItemFeedService } from './service/table-item-feed.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ItemSelectModule,
    DndModule.forRoot(),
  ],
  exports: [
    RankingModelPipe,
    RankingAlertTypePipe,
    TableQueryShowComponent,
    TableQueryShowFeedComponent,
  ],

  declarations: [
    TableFieldComponent,
    TableFieldFeedComponent,
    TableQueryComponent,
    TableQueryFeedComponent,
    TableQueryShowComponent,
    TableQueryShowFeedComponent,
    TableStepComponent,
    TableStepFeedComponent,
    RankingModelPipe,
    RankingAlertTypePipe,
    RankingStatusPipe,
  ],
  entryComponents: [
    TableFieldComponent,
    TableFieldFeedComponent,
    TableQueryComponent,
    TableQueryFeedComponent,
    TableStepComponent,
    TableStepFeedComponent,
  ],
  providers: [DateDefineService, TableItemFeedService],
})
export class TableSettingModule { }
