import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../shared/shared.module";
import { EditKeywordSingleModalComponent } from "./edit-keyword-single/edit-keyword-single-modal.component";
import { DataViewAddEditService } from "../../routes/data-view/service/data-view-add-edit.service";
import { EditPriceModalComponent } from "./edit-price-modal/edit-price-modal.component";
import { EditPriceMessageModalComponent } from "./edit-price-message-modal/edit-price-message-modal.component";
import { EditKeywordBatchModalComponent } from "./edit-keyword-batch-modal/edit-keyword-batch-modal.component";
import { QuickEditKeywordMatchTypeComponent } from './quick-edit-keyword-match-type/quick-edit-keyword-match-type.component';
import { QuickEditKeywordPriceBatchComponent } from './quick-edit-keyword-price-batch/quick-edit-keyword-price-batch.component';
import { QuickEditKeywordPriceSingleComponent } from './quick-edit-keyword-price-single/quick-edit-keyword-price-single.component';
import { QuickEditStatusComponent } from './quick-edit-status/quick-edit-status.component';
import { QuickEditFeedStatusComponent } from "./quick-edit-feed-status/quick-edit-feed-status.component";
import { QuickEditFeedBudgetComponent } from "./quick-edit-feed-budget/quick-edit-feed-budget.component";
import { QuickEditOcpcPriceBatchComponent } from "./quick-edit-ocpc-price-batch/quick-edit-ocpc-price-batch.component";
import { QuickEditOrReplaceBatchComponent } from './quick-edit-or-replace-batch/quick-edit-or-replace-batch.component';
import { QuickEditCreativeLabelBatchComponent } from './quick-edit-creative-label-batch/quick-edit-creative-label-batch.component';
import { QuickEditCreativeClickUrlBatchComponent } from './quick-edit-creative-click-url-batch/quick-edit-creative-click-url-batch.component';
import { QuickEditFeedTimeIntervalComponent } from './quick-edit-feed-time-interval/quick-edit-feed-time-interval.component';
import { QuickEditFeedRegionComponent } from './quick-edit-feed-region/quick-edit-feed-region.component';
import { TransferTreeModule } from "../transfter-tree/transfer-tree.module";
import { ShowScheduleModule } from "../show-schedule/show-schedule.module";
import { QuickEditFeedMaskPreferComponent } from './quick-edit-feed-mask-prefer/quick-edit-feed-mask-prefer.component';

@NgModule({
  imports: [
    SharedModule,
    TransferTreeModule,
    ShowScheduleModule,
  ],
  exports: [EditKeywordSingleModalComponent, EditPriceModalComponent, EditPriceMessageModalComponent, EditKeywordBatchModalComponent, QuickEditKeywordMatchTypeComponent, QuickEditKeywordPriceBatchComponent, QuickEditKeywordPriceSingleComponent, QuickEditStatusComponent, QuickEditFeedStatusComponent, QuickEditFeedBudgetComponent, QuickEditOcpcPriceBatchComponent, QuickEditOrReplaceBatchComponent, QuickEditCreativeLabelBatchComponent, QuickEditCreativeClickUrlBatchComponent, QuickEditFeedTimeIntervalComponent, QuickEditFeedRegionComponent, QuickEditFeedMaskPreferComponent],
  declarations: [EditKeywordSingleModalComponent, EditPriceModalComponent, EditPriceMessageModalComponent, EditKeywordBatchModalComponent, QuickEditKeywordMatchTypeComponent, QuickEditKeywordPriceBatchComponent, QuickEditKeywordPriceSingleComponent, QuickEditStatusComponent, QuickEditFeedStatusComponent, QuickEditFeedBudgetComponent, QuickEditOcpcPriceBatchComponent, QuickEditOrReplaceBatchComponent, QuickEditCreativeLabelBatchComponent, QuickEditCreativeClickUrlBatchComponent, QuickEditCreativeLabelBatchComponent, QuickEditCreativeClickUrlBatchComponent, QuickEditFeedTimeIntervalComponent, QuickEditFeedRegionComponent, QuickEditFeedMaskPreferComponent],
  entryComponents: [EditKeywordSingleModalComponent, EditPriceModalComponent, EditPriceMessageModalComponent, EditKeywordBatchModalComponent, QuickEditKeywordMatchTypeComponent, QuickEditKeywordPriceBatchComponent, QuickEditKeywordPriceSingleComponent, QuickEditStatusComponent, QuickEditOrReplaceBatchComponent],
  providers: [DataViewAddEditService]
})
export class DataViewOperationModule { }
