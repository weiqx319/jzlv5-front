import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-report-chart-show',
  templateUrl: './report-chart-show.component.html',
  styleUrls: ['./report-chart-show.component.scss']
})
export class ReportChartShowComponent implements OnInit {


  public charDemoImgurl = '';


  @Input() public chartTitle = '自定义图表';
  @Input() public  chartType = 'line';
  @Output() del: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.charDemoImgurl = '../../../../../../assets/report/' + this.chartType + '.png';

  }

  delChart(): void {
    this.del.emit();
  }

  editChart(): void {
    this.edit.emit();
  }


}
