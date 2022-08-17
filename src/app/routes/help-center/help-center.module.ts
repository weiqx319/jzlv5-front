
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {HelpCenterComponent} from "./help-center.component";
import { DetailComponent } from './component/detail/detail.component';
import { ListComponent } from './component/list/list.component';
import {QuestionFeedbackComponent} from "./modal/question-feedback/question-feedback.component";
import {HelpCenterService} from "./service/help-center.service";
// import { QuestionFeedbackComponent } from './modal/question-feedback/question-feedback.component';

const routes: Routes = [
  {
    path: '',
    component: HelpCenterComponent,
    children: [
    /*  { path: '', redirectTo: 'list', pathMatch: 'full' },*/
      { path: 'list/:id', component: ListComponent},
      { path: 'detail/:id', component: DetailComponent}
    ]
  }
];


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),

  ],
  declarations: [
    HelpCenterComponent,
    DetailComponent,
    ListComponent,
    QuestionFeedbackComponent
  ],
  providers: [
    HelpCenterService
  ],
  exports: [
    RouterModule
  ],
  entryComponents: [
    QuestionFeedbackComponent
  ]
})
export class HelpCenterModule { }
