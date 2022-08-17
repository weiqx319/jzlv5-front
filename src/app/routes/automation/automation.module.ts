import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../../shared/shared.module";
import { RouterModule, Routes } from "@angular/router";
import { TableHeaderFilterModule } from '@jzl/table-header-filter';
import { AutomationComponent } from "./automation.component";
import { AutomationGuideComponent } from "./component/automation-guide/automation-guide.component";
import { AutomationTacticDetailComponent } from './component/automation-tactic-detail/automation-tactic-detail.component';
import { AutomationRulesModalComponent } from './modal/automation-rules-modal/automation-rules-modal.component';
import { SetTacticEntityComponent } from './component/automation-tactic-detail/component/set-tactic-entity/set-tactic-entity.component';
import { SetRulesComponent } from './component/automation-tactic-detail/component/set-rules/set-rules.component';
import { ActionSettingsModalComponent } from './modal/action-settings-modal/action-settings-modal.component';
import { TacticLogModalComponent } from './modal/tactic-log-modal/tactic-log-modal.component';
import { TacticEntitiesModalComponent } from './modal/tactic-entities-modal/tactic-entities-modal.component';
import { AutomationTacticListComponent } from './component/automation-tactic-list/automation-tactic-list.component';
import { TacticLogListComponent } from './component/tactic-log-list/tactic-log-list.component';
import { LayoutLeftMenuModule } from "../../module/layout-left-menu/layout-left-menu.module";

const routes: Routes = [
  {
    path: '',
    component: AutomationComponent,
    children: [
      { path: '', redirectTo: 'tactic_list', pathMatch: 'full' },
      {
        path: 'tactic_list',
        component: AutomationTacticListComponent
      },
      {
        path: 'log_list',
        component: TacticLogListComponent
      },
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'guide',
        component: AutomationGuideComponent
      },
      {
        path: 'tactic_detail',
        component: AutomationTacticDetailComponent
      },
    ]
  },
];
@NgModule({
  declarations: [AutomationComponent, AutomationGuideComponent, AutomationTacticDetailComponent, AutomationRulesModalComponent, SetTacticEntityComponent, SetRulesComponent, ActionSettingsModalComponent, TacticLogModalComponent, TacticEntitiesModalComponent, AutomationTacticListComponent, TacticLogListComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    TableHeaderFilterModule,
    LayoutLeftMenuModule,
  ],
})
export class AutomationModule { }
