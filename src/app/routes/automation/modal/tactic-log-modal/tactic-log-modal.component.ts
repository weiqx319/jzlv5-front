import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AutomationService } from "../../service/automation.service";
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { Router, ActivatedRoute } from "@angular/router";
import { differenceInCalendarDays, format, subDays } from "date-fns";

@Component({
  selector: 'app-tactic-log-modal',
  templateUrl: './tactic-log-modal.component.html',
  styleUrls: ['./tactic-log-modal.component.scss']
})
export class TacticLogModalComponent implements OnInit {
  @Input() tacticId;
  @Input() tacticLevel;

  public tacticLevelObj = this.automationService.tacticLevelObj;

  indeterminate = false;// 表示有选中的，不管是全选还是选个别
  _allChecked = false;

  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;
  public resultStatus = 'error';
  public listQueryParams = {
    pConditions: [],
  };

  filterResult = {
    pub_account_name: {},
    pub_campaign_name: {},
    pub_adgroup_name: {},
    action_result_message: {},
    action_result_status: {},
    action_name: {},
    trigger_condition_log: {},
    tactic_name: {}
  };
  public noResultHeight = document.body.clientHeight - 285;

  public currentDate = new Date();
  public available_date_interval = [subDays(this.currentDate, +Number.MAX_VALUE), subDays(this.currentDate, +0)];
  public dateValue = this.splitDate();

  public actionResultStatusObj = {
    'success': '成功',
    'failure': '失败',
    'mismatch': '条件不匹配',
    'skip': '跳过',
    'unknown': '未知',
  }
  public actionResultStatusList = [
    { key: 'success', name: '成功' },
    { key: 'failure', name: '失败' },
    { key: 'mismatch', name: '条件不匹配' },
    { key: 'skip', name: '跳过' },
    { key: 'unknown', name: '未知' },
  ];

  constructor(
    private message: NzMessageService,
    private automationService: AutomationService,
    // private subject: NzDrawerRef,
    private router: Router,
  ) {

  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 285;
  }
  ngOnInit(): void {
    this.refreshData();
  }
  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._allChecked = false;
    if (status) {
      this.currentPage = 1;
    }
    this._allChecked = false;
    this.listQueryParams.pConditions = [];
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        this.listQueryParams.pConditions.push(item);
      }
    });

    const requestBody = {
      page: this.currentPage,
      count: this.pageSize,
      start_time: format(this.dateValue[0], 'yyyy-MM-dd'),
      end_time: format(this.dateValue[1], 'yyyy-MM-dd'),
    }

    this.automationService.getTacticLogList(this.tacticId, this.listQueryParams, requestBody)
      .subscribe((results: any) => {
        if (results.status_code !== 200) {
          this.apiData = [];
          this.total = 0;
          this.resultStatus = 'error';
          this.message.error('数据获取异常，请重试');
        } else {
          this.apiData = results['data']['detail'];
          this.total = results['data']['detail_count'];
          this.resultStatus = 'success';
        }
        this.loading = false;
      },
        (err: any) => {
          this.loading = false;
          this.message.error('数据获取异常，请重试');
          this.resultStatus = 'error';
        },
        () => { },
      );
  }

  _checkAll(value) {
    this.indeterminate = false;
    if (value) {
      this._allChecked = true;
      this.apiData.forEach((data) => {
        data['checked'] = true;
      });
    } else {
      this._allChecked = false;
      this.apiData.forEach((data) => (data['checked'] = false));
    }
  }

  _refreshStatus(event?, data?) {
    if (data) {
      data['checked'] = event;
    }
    const allChecked = this.apiData.every(
      (value) => value['checked'],
    );
    const allUnchecked = this.apiData.every((value) => !value['checked']);

    if (!allUnchecked && !allChecked) {
      this.indeterminate = true;
    } else {
      this.indeterminate = false;
    }
    this._allChecked = allChecked;
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

  // cancel(): void {
  //   this.subject.close('onCancel');
  // }

  onDateChange(result: Date) {
    this.dateValue = result;
    this.refreshData(true);
  }

  //日历显示隐藏回调
  openDateChange(open: boolean): void {
    if (open) {
      //重置时间间隔
      this.available_date_interval = [subDays(this.currentDate, +Number.MAX_VALUE), subDays(this.currentDate, +0)];
    }
  }

  //不可用时间
  disabledEndDate = (current: Date) => {
    return (
      differenceInCalendarDays(current, new Date()) > 0 ||
      differenceInCalendarDays(current, this.available_date_interval[0]) < 0 ||
      differenceInCalendarDays(current, this.available_date_interval[1]) > 0
    );
  }

  // 日历时间修改
  onCalendarChange(result) {
    this.available_date_interval[0] = subDays(result[0], +6);
    this.available_date_interval[1] = subDays(result[0], -6);
  }

  splitDate(): any {
    const largeDate = subDays(this.currentDate, +0);
    const minDate = subDays(this.currentDate, +6);
    return [minDate, largeDate];
  }

}
