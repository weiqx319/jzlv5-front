import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../../shared/shared.module";
import { ViewChartComponent } from "./view-chart/view-chart.component";
import { DataAnalysisChartComponent } from './data-analysis-chart/data-analysis-chart.component';
import { AnalysisChatComponent } from './analysis-chat/analysis-chat.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [ViewChartComponent, DataAnalysisChartComponent, AnalysisChatComponent],
  declarations: [ViewChartComponent, DataAnalysisChartComponent, AnalysisChatComponent],
})
export class ViewChartModule { }
