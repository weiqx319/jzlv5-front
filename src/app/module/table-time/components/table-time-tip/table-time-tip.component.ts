import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TableTimeComponent } from '../table-time/table-time.component';
import { formatDate, splitDate } from '@jzl/jzl-util';

@Component({
  selector: 'app-table-time-tip',
  templateUrl: './table-time-tip.component.html',
  styleUrls: ['./table-time-tip.component.scss'],
})
export class TableTimeTipComponent implements OnInit {

  public viewTableData = {

    all_summary: false,
    is_compare: false,
    summary_date: 'day:1:6',
    summary_date_compare: 'day:8:6',
    summary_date_alias: '',
    summary_date_compare_alias: '',
    other_compare_date_list: [],
    time_grain: 'summary',
  };

  public timeDesc = "";

  @Output() dateChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() globalTimeFlag = false;

  @Input() canClearFlag = true;

  @Input() defaultSummaryDate = "";
  @Input() styleTheme = "small";

  constructor(private modalService: NzModalService) {

  }


  ngOnInit(): void {
    if (this.defaultSummaryDate != "") {

      this.generateTimeShow();
    }

  }

  changeDate() {
    const add_modal = this.modalService.create({
      nzTitle: '时间选择',
      nzWidth: 600,
      nzContent: TableTimeComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        timeSetting: {
          summary_date: this.viewTableData['summary_date'],
          summary_date_compare: this.viewTableData['summary_date_compare'],
          summary_date_alias: this.viewTableData['summary_date_alias'],
          summary_date_compare_alias: this.viewTableData['summary_date_compare_alias'],
          time_grain: this.viewTableData['time_grain'],
          other_compare_date_list: this.viewTableData['other_compare_date_list'],
        },
        isCompare: this.viewTableData['is_compare'],
        summary_type: "undefined",
        showAlias: false,
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result.dataType && result.dataType === 'time') {
        this.globalTimeFlag = true;
        this.viewTableData = Object.assign(this.viewTableData, result['data']);
        this.generateTimeShow();
        const emitData = { timeFlag: true, timeData: this.viewTableData };
        this.dateChange.emit(emitData);
      }
    });
  }

  clearGlobalTime() {
    this.globalTimeFlag = false;
    const emitData = { timeFlag: false, timeData: {} };
    this.dateChange.emit(emitData);
  }

  generateTimeShow() {
    let resultTimeShow = '';
    const originTime = splitDate(this.viewTableData['summary_date']);
    const resultTimeStart = formatDate(originTime[0]);
    const resultTimeEnd = formatDate(originTime[1]);

    if (resultTimeStart === resultTimeEnd) {
      resultTimeShow += resultTimeStart;
    } else {
      resultTimeShow += resultTimeStart + '至' + resultTimeEnd;
    }
    if (this.viewTableData['is_compare']) {
      const compareTime = splitDate(this.viewTableData['summary_date_compare']);
      const compareTimeStart = formatDate(compareTime[0]);
      const compareTimeEnd = formatDate(compareTime[1]);
      if (compareTimeStart === compareTimeEnd) {
        resultTimeShow += '对比' + compareTimeStart;
      } else {
        resultTimeShow += '对比' + compareTimeStart + '至' + compareTimeEnd;
      }
    }
    this.timeDesc = resultTimeShow;
  }

}
