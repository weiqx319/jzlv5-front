import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-quick-edit-feed-time-interval',
  templateUrl: './quick-edit-feed-time-interval.component.html',
  styleUrls: ['./quick-edit-feed-time-interval.component.scss']
})
export class QuickEditFeedTimeIntervalComponent implements OnInit {
  @Input() checkErrorTip;
  @Output() result = new EventEmitter<any>();
  public showCoefficient = false;
  public schedule_time_type = 1;
  public time_series = [];
  public schedule_time_type_sub = [
    { label: '不限', value: 1, },
    { label: '自定义', value: 2, },
  ];
  constructor() { }

  ngOnInit(): void {
    this.emitData();

  }
  dateDate(event) { //从日期组件中得到的日期数据
    this.time_series = event.dateData;
    // 投放时段
    if (!this.time_series.includes('1')) {
      this.checkErrorTip.time_series.is_show = true;
    } else {
      this.checkErrorTip.time_series.is_show = false;
    }
    this.emitData();
  }
  emitData() {
    this.result.emit({ result: { type: this.schedule_time_type, value: this.time_series }, type: 'time_interval' });
  }
}
