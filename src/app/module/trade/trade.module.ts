import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OneMarkListComponent} from './components/one-mark-list/one-mark-list.component';
import {TwoMarkListComponent} from './components/two-mark-list/two-mark-list.component';
import {TradeMarkListComponent} from './components/trade-mark-list/trade-mark-list.component';
import {AddTradeMarkComponent} from './modal/add-trade-mark/add-trade-mark.component';
import {TradeMarkEditItemComponent} from './modal/trade-mark-edit-item/trade-mark-edit-item.component';
import {TradeRuleComponent} from './components/trade-rule/trade-rule.component';
import {AddTradeRuleComponent} from './modal/add-trade-rule/add-trade-rule.component';
import {TradeService} from './service/trade.service';
import {DateDefineService} from '../../shared/service/date-define.service';
import {SharedModule} from '../../shared/shared.module';
import {ManageTipComponent} from './modal/manage-tip/manage-tip.component';


@NgModule({
  declarations: [
    OneMarkListComponent,
    TwoMarkListComponent,
    TradeMarkListComponent,
    AddTradeMarkComponent,
    TradeMarkEditItemComponent,
    TradeRuleComponent,
    AddTradeRuleComponent,
    ManageTipComponent
  ],
  imports: [
    SharedModule
  ],
  providers: [
    TradeService,
    DateDefineService
  ],
})
export class TradeModule { }
