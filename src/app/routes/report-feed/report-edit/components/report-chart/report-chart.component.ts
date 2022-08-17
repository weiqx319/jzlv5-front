import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ReportChartService } from "../../service/report-chart.service";
import { isUndefined } from "@jzl/jzl-util";


@Component({
  selector: 'app-report-chart',
  templateUrl: './report-chart.component.html',
  styleUrls: ['./report-chart.component.scss'],
  providers: [ReportChartService]
})
export class ReportChartComponent implements OnInit {
  validateForm: FormGroup;

  @Input() chartType = 'line';

  @Input('chartDetail')
  set chartDetail(value: any) {
    this.chartName = value['chart_name'];
    this.chartType = value['chart_type'];
    value['metrics'].forEach(item => {
      if (item.is_x) {
        this.currentXAxis = item;
      } else {
        this.currentYAxis.push(item);
      }
    });
  }

  @Input() summaryType = 'campaign';
  @Input() reportType = 'basic_report';
  @Input() selectedItems = [];
  @Input() lockedItem = [];


  @Input() set chartTitle(name: any) {
    this.chartName = name;
  }
  public chartName = '折线图';

  public hasX = true;
  public maxNumLimitYAxis = 5;
  public xAxisArray = [];
  public yAxisArray = [];

  public currentXAxis: any;
  public currentYAxis = [];




  constructor(private cdRef: ChangeDetectorRef, private subject: NzModalRef, private fb: FormBuilder, private chartService: ReportChartService) {

  }

  ngOnInit() {
    this.maxNumLimitYAxis = this.chartService.getYAxisNumMaxLimit(this.chartType);
    this.hasX = this.chartService.hasX(this.chartType);
    this.xAxisArray = this.chartService.getXArray(this.chartType, this.reportType, this.summaryType, this.lockedItem);
    this.yAxisArray = this.chartService.getYArray(this.chartType, this.selectedItems);
    if (this.currentYAxis.length === 0) {
      this.addField();
    } else {
      this.currentYAxis.forEach(item => {
        this.yAxisChange(item);
      });
    }


    if (this.hasX && this.xAxisArray.length > 0) {
      if (!isUndefined(this.currentXAxis) && this.currentXAxis.hasOwnProperty("key")) {
        const findX = this.xAxisArray.find((item) => item.key === this.currentXAxis['key']);
        if (isUndefined(findX)) {
          this.currentXAxis = this.xAxisArray[0];
        } else {
          this.currentXAxis = findX;
        }
      } else {
        this.currentXAxis = this.xAxisArray[0];
      }
    }
    this.validateForm = this.fb.group({
      chartName: ['', [Validators.required]]
    });
  }


  yAxisChange(row) {
    const findYAxis = this.yAxisArray.find((item) => {
      return item.key === row.key;
    });
    if (!isUndefined(findYAxis)) {
      // -- 先把原先的置为false
      const findOldYAxis = this.yAxisArray.find((item) => {
        return item.key === row.selected_key;
      });
      if (!isUndefined(findOldYAxis)) {
        findOldYAxis.selected = false;
      }
      // -- 初始化当前值
      row.name = findYAxis.name;
      row.data_type = findYAxis.name;
      row.selected_key = row.key;
      findYAxis.selected = true;
    }
  }

  addField() {
    const defaultY = this.getFirstNotSelectedYAlias();
    if (!isUndefined(defaultY)) {
      defaultY.selected = true;
      defaultY.selected_key = defaultY.key;
      this.currentYAxis.push(defaultY);
    }
  }

  getFirstNotSelectedYAlias(): any {
    let returnObject;
    for (const item of this.yAxisArray) {
      if (!item.hasOwnProperty('selected') || !item['selected']) {
        item.selected = true;
        returnObject = Object.assign({}, item);
        break;
      }
    }
    return returnObject;
  }

  removeField(row, e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    const index = this.currentYAxis.indexOf(row);
    this.currentYAxis.splice(index, 1);
    const findYAxis = this.yAxisArray.find((item) => {
      return item.key === row.key;
    });
    if (!isUndefined(findYAxis)) {
      findYAxis.selected = false;
    }
  }


  cancelEditReport(): void {
    this.subject.destroy('onCancel');
  }

  saveReportChart(): void {
    let saveData = {};
    if (this.currentXAxis) {
      saveData = {
        chart_type: this.chartType,
        chart_name: this.chartName,
        metrics: [this.currentXAxis, ...this.currentYAxis]
      };
    } else {
      saveData = {
        chart_type: this.chartType,
        chart_name: this.chartName,
        metrics: [...this.currentYAxis]
      };
    }


    this.subject.destroy({ 'oper': 'save', 'data': saveData });

  }


  getFormControl(name) {
    return this.validateForm.controls[name];
  }

}
