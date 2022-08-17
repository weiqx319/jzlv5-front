
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {JzlChartComponent} from "./jzl-chart.component";
import {JzlChartService} from "./service/jzl-chart.service";


@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    JzlChartComponent
  ],
  declarations: [
    JzlChartComponent
  ],
  providers: [JzlChartService]
})
export class JzlChartModule { }
