import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ItemSelectComponent} from "./components/item-select/item-select.component";
import {PublisherSelectComponent} from "./components/publisher-select/publisher-select.component";
import {AccountSelectComponent} from "./components/account-select/account-select.component";
import {CampaignSelectComponent} from "./components/campaign-select/campaign-select.component";
import {GroupSelectComponent} from "./components/group-select/group-select.component";
import {ShowSelectComponent} from "./components/show-select/show-select.component";
import {SharedModule} from "../../shared/shared.module";
import {ItemSelectService} from "./service/item-select.service";
import {NegativeItemSelectComponent} from "./components/negative-item-select/negative-item-select.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    ItemSelectComponent,
    NegativeItemSelectComponent,
  ],
  declarations: [
    ItemSelectComponent,
    PublisherSelectComponent,
    AccountSelectComponent,
    CampaignSelectComponent,
    GroupSelectComponent,
    ShowSelectComponent,
    NegativeItemSelectComponent,
  ],
  providers: [ ItemSelectService ]
})
export class ItemSelectModule { }
