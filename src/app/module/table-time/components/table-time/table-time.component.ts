import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from "@angular/forms";
import { differenceInCalendarDays, endOfMonth, endOfWeek, endOfYear, format, isValid, parse, startOfMonth, startOfToday, startOfWeek, startOfYear, subDays, subMonths, subWeeks, subYears } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { isArray } from "@jzl/jzl-util";
import { MenuService } from '../../../../core/service/menu.service';
import { DateDefineService } from "../../../../shared/service/date-define.service";
import { SetSummaryTimeComponent } from "../../../set-summary-time/set-summary-time.component";
@Component({
  selector: 'app-table-time',
  templateUrl: './table-time.component.html',
  styleUrls: ['./table-time.component.scss'],
})
export class TableTimeComponent implements OnInit {

  public dateLists = [];
  public compareDateLists = [];
  public tableTimeSetting = {
    summary_date: 'day:1:0',
    summary_date_alias: '',
    summary_date_compare: 'day:2:0',
    summary_date_compare_alias: '',
    time_grain: 'summary',
    summary_date_range: [new Date(), new Date()],
    summary_date_compare_range: [new Date(), new Date()],
    other_compare_date_list: [

    ],
  };

  today = new Date();

  public oldDateRange;

  @Input()
  set timeSetting(value: any) {
    this.tableTimeSetting = Object.assign({}, this.tableTimeSetting, value); // -- deepClone
    this.tableTimeSetting.summary_date = this.tableTimeSetting.summary_date.indexOf('custom') === 0 ? 'custom' : this.tableTimeSetting.summary_date;
    this.tableTimeSetting.summary_date_range = this.splitDate(value.summary_date);
    this.tableTimeSetting.summary_date_compare = this.tableTimeSetting.summary_date_compare.indexOf('custom') === 0 ? 'custom_init' : this.tableTimeSetting.summary_date_compare;
    this.tableTimeSetting.summary_date_compare_range = this.splitDate(value.summary_date_compare);
    this.tableTimeSetting.other_compare_date_list = [];

    this.oldDateRange = this.tableTimeSetting.summary_date;

    if (value.other_compare_date_list && isArray(value.other_compare_date_list) && value.other_compare_date_list.length > 0) {
      value.other_compare_date_list.forEach((item, index) => {
        const tmpOtherSetting: any = {};
        tmpOtherSetting.summary_date = item.summary_date.indexOf('custom') === 0 ? 'custom' : item.summary_date;
        tmpOtherSetting.summary_date_range = this.splitDate(item.summary_date);
        tmpOtherSetting.alias = item.alias;
        this.tableTimeSetting.other_compare_date_list.push(tmpOtherSetting);
      });
    }

  }

  @Input() channelId: any = 1;
  @Input() publisherIds: any = [];

  @Input() isCompare = false;
  @Input() summary_type: any;
  @Input() is_summary_time: any;
  @Input() summary_time_attr: any;
  @Input() defined_is_disable = true;
  @Input() showAlias = true;
  @Input() canAddCompare = false;
  @Input() isAnalysis = false;//数据分析

  constructor(private subject: NzModalRef,
    private fb: FormBuilder,
    private modalService: NzModalService,
    // public reportItemService: TableItemService,
    public dateDefineService: DateDefineService,
    private _message: NzMessageService,
    private menuService: MenuService,
  ) {
    // this.conditionOper = this.itemOperationsService.getOperations();
  }

  ngOnInit() {
    this.changeSelectedDate(this.tableTimeSetting.summary_date);
    this.dateLists = this.dateDefineService.getDateList(this.summary_type, this.menuService.currentChannelId, this.menuService.currentPublisherId);
    // if (this.is_summary_time) {
    //   this.summary_time_attr = this.hours_split;
    // }
  }

  getDisableDate = (current: Date): boolean => {
    if (this.isAnalysis) {//数据分析
      return false;
    } else {
      //可以选择今天以前的90天
      if (!this.isAnalysis && ['department', 'advertiser', 'channel', 'publisher', 'account', 'campaign'].indexOf(this.summary_type) > -1) {
        return differenceInCalendarDays(current, this.today) >= 0 || differenceInCalendarDays(current, this.today) < -185;
      } else {
        return differenceInCalendarDays(current, this.today) >= 0 || differenceInCalendarDays(current, this.today) < -95;
      }
    }

  }

  cancelModal(): void {
    this.subject.destroy('onCancel');
  }

  saveTime(): void {

    const tmpTimeSetting = {
      summary_date: '',
      summary_date_compare: '',
      summary_date_alias: '',
      summary_date_compare_alias: '',
      time_grain: this.tableTimeSetting['time_grain'],
      other_compare_date_list: [

      ],
      is_compare: this.isCompare,
    };
    tmpTimeSetting['hours_split'] = this.summary_time_attr;
    tmpTimeSetting.summary_date_alias = this.tableTimeSetting.summary_date_alias;
    tmpTimeSetting.summary_date_compare_alias = this.tableTimeSetting.summary_date_compare_alias;

    if (this.tableTimeSetting.summary_date.indexOf('custom') === 0) {
      tmpTimeSetting.summary_date = 'custom:' + format(this.tableTimeSetting.summary_date_range[0], 'yyyy-MM-dd') + ':' + format(this.tableTimeSetting.summary_date_range[1], 'yyyy-MM-dd');
    } else {
      tmpTimeSetting.summary_date = this.tableTimeSetting.summary_date;
    }
    if (this.tableTimeSetting.summary_date_compare.indexOf('custom') === 0) {
      tmpTimeSetting.summary_date_compare = 'custom:' + format(this.tableTimeSetting.summary_date_compare_range[0], 'yyyy-MM-dd') + ':' + format(this.tableTimeSetting.summary_date_compare_range[1], 'yyyy-MM-dd');
    } else {
      tmpTimeSetting.summary_date_compare = this.tableTimeSetting.summary_date_compare;
    }

    this.tableTimeSetting.other_compare_date_list.forEach((item, index) => {
      const tmpOtherDate = {};
      if (item.summary_date.indexOf('custom') === 0) {
        tmpOtherDate["summary_date"] = 'custom:' + format(item.summary_date_range[0], 'yyyy-MM-dd') + ':' + format(item.summary_date_range[1], 'yyyy-MM-dd');
      } else {
        tmpOtherDate["summary_date"] = item.summary_date;
      }
      tmpOtherDate['alias'] = item.alias;
      tmpTimeSetting.other_compare_date_list.push(tmpOtherDate);
    });

    // const selectItemList = this.selectedItems;
    this.subject.destroy({ dataType: 'time', data: tmpTimeSetting });
  }

  changeSelectedDate(dateKey): void {
    if (this.tableTimeSetting.summary_date_compare === 'custom_init') {
      this.tableTimeSetting.summary_date_compare = 'custom';
    }
    this.compareDateLists = this.dateDefineService.getCompareDateList(dateKey);

    if (dateKey === this.oldDateRange) {
      return;
    }

    this.oldDateRange = dateKey;

    this.tableTimeSetting.summary_date_range = this.splitDate(dateKey, this.tableTimeSetting.summary_date_range);
    if (this.tableTimeSetting.summary_date_compare !== 'custom') {
      if (this.compareDateLists[1]) {
        this.tableTimeSetting.summary_date_compare = this.compareDateLists[1]['key']; // @todo 阿里组件bug
      } else {
        this.tableTimeSetting.summary_date_compare = 'custom'
      }

      this.tableTimeSetting.summary_date_compare_range = this.splitDate(this.tableTimeSetting.summary_date_compare, this.tableTimeSetting.summary_date_compare_range);
    }

  }

  changeOtherSelectedDate(dateKey, index): void {
    this.tableTimeSetting.other_compare_date_list[index]['summary_date_range'] = this.splitDate(dateKey, this.tableTimeSetting.other_compare_date_list[index]['summary_date_range']);
    if (this.tableTimeSetting.summary_date_compare === 'custom_init') {
      this.tableTimeSetting.other_compare_date_list[index]['summary_date'] = 'custom';
    }

  }

  removeOtherSelectedDate(index, e: MouseEvent) {
    e.preventDefault();
    if (this.tableTimeSetting.other_compare_date_list.length > 1) {
      this.tableTimeSetting.other_compare_date_list.splice(index, 1);
    } else {
      this.tableTimeSetting.other_compare_date_list = [];
    }
  }

  changeSelectedCompareDate(dateKey): void {
    this.tableTimeSetting.summary_date_compare_range = this.splitDate(this.tableTimeSetting.summary_date_compare, this.tableTimeSetting.summary_date_compare_range);
  }

  // 获取起止时间
  splitDate(timeStr: string, oldDataRang?: any): any {
    const timeArr = timeStr.split(':');
    const currentDate = new Date();
    const current_day = currentDate.getDay(); //获取今天是周几: 0(周日) ， 1(周一)， 2(周二) .. 依此类推；
    const current_date = currentDate.getDate();
    const current_month = currentDate.getMonth();

    if (timeArr[0] === 'day') {
      const largeDate = subDays(currentDate, +timeArr[1]);
      const minDate = subDays(largeDate, +timeArr[2]);
      return [minDate, largeDate];
    } else if (timeArr[0] === 'day_last_year') {
      const tmpDate = subDays(currentDate, +timeArr[1]);
      const largeDate = subYears(tmpDate, 1);
      const minDate = subYears(subDays(tmpDate, +timeArr[2]), 1);
      return [minDate, largeDate];

    } else if (timeArr[0] === 'week') {
      let startDate: any;
      let endDate: any;
      if (current_day === 1 && timeArr[1] === '0') { //如果选择本周并且当前（今天）的日期为本周的星期一
        startDate = startOfWeek(subWeeks(currentDate, +timeArr[1] + 1), { weekStartsOn: 1 });
        endDate = endOfWeek(subDays(startDate, +timeArr[2]), { weekStartsOn: 1 });
      } else {
        startDate = startOfWeek(subWeeks(currentDate, +timeArr[1]), { weekStartsOn: 1 });
        // timeArr[1] === '0'本周
        endDate = timeArr[1] === '0' ? subDays(currentDate, +1) : endOfWeek(subDays(startDate, +timeArr[2]), { weekStartsOn: 1 });
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'week_same_period') { //上周同期
      let startDate: any;
      let endDate: any;
      if (current_day === 1) { //如果当前（今天）的日期为本周的星期一，则'上周同期'取上一周的数据
        // 这是上上周的同期数据
        // startDate = startOfWeek(subWeeks(currentDate, +timeArr[1] + 1), { weekStartsOn: 1 });
        // endDate = endOfWeek(subDays(startDate, +timeArr[2]), { weekStartsOn: 1 });

        // 这是上周的数据
        startDate = startOfWeek(subWeeks(currentDate, +timeArr[1]), { weekStartsOn: 1 });
        endDate = endOfWeek(subDays(startDate, +timeArr[2]), { weekStartsOn: 1 });
      } else {
        startDate = startOfWeek(subWeeks(currentDate, +timeArr[1]), { weekStartsOn: 1 });
        endDate = subDays(currentDate, +8);
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'month') {
      let startDate: any;
      let endDate: any;
      if (current_date == 1 && timeArr[1] === '0') {//如果选择的是本月，并且今天是本月1号，则'本月'取上一月的数据
        startDate = startOfMonth(subMonths(currentDate, +timeArr[1] + 1));
        endDate = endOfMonth(subMonths(startDate, +timeArr[2]));
      } else {
        startDate = startOfMonth(subMonths(currentDate, +timeArr[1]));
        // timeArr[1] === '0'本月
        endDate = timeArr[1] === '0' ? subDays(currentDate, +1) : endOfMonth(subMonths(startDate, +timeArr[2]));
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'month_same_period') { //上月同期
      let startDate: any;
      let endDate: any;
      if (current_date == 1) {//如果是1号
        // 这是上上月的同期数据
        // startDate = startOfMonth(subMonths(currentDate, +timeArr[1] + 1));
        // endDate = subMonths(endOfMonth(subMonths(startDate, +timeArr[2] - 1)), +1);

        // 这是上月的数据
        startDate = startOfMonth(subMonths(currentDate, +timeArr[1]));
        endDate = endOfMonth(subMonths(startDate, +timeArr[2]));
      } else {
        startDate = startOfMonth(subMonths(currentDate, +timeArr[1]));
        endDate = subDays(subMonths(currentDate, 1), +1);
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'year') {
      let startDate: any;
      let endDate: any;
      if (current_month == 1 && current_date == 1 && timeArr[1] === '0') {//如果选择的是本年，并且今天是本年1月1号，则'本年'取上一年的数据
        startDate = startOfYear(subYears(currentDate, +timeArr[1] + 1));
        endDate = endOfYear(subYears(startDate, +timeArr[2]));
      } else {
        startDate = startOfYear(subYears(currentDate, +timeArr[1]));
        // timeArr[1] === '0'本年
        endDate = timeArr[1] === '0' ? subDays(currentDate, +1) : endOfYear(subYears(startDate, +timeArr[2]));
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'year_same_period') {//去年同期
      let startDate: any;
      let endDate: any;
      if (current_month == 1 && current_date == 1) {
        // 这是上上年的同期数据
        // startDate = startOfYear(subYears(currentDate, +timeArr[1] + 1));
        // endDate = endOfYear(subYears(startDate, +timeArr[2]));

        // 这是去年的数据
        startDate = startOfYear(subYears(currentDate, +timeArr[1]));
        endDate = endOfYear(subYears(startDate, +timeArr[2]));
      } else {
        startDate = startOfYear(subYears(currentDate, +timeArr[1]));
        endDate = subDays(subMonths(currentDate, 12), +1);
      }
      return [startDate, endDate];
    } else if (timeArr[0] === 'custom' && timeArr.length === 3) {
      const startDate = new Date(timeArr[1].replace(/-/g, "/"));
      const endDate = new Date(timeArr[2].replace(/-/g, "/"));
      return [startDate, endDate];
    } else {
      // == 组对时间
      return [...oldDataRang];
    }
  }

  setSummaryTime() {
    const add_modal = this.modalService.create({
      nzTitle: '设置汇总时间',
      nzWidth: 600,
      nzContent: SetSummaryTimeComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {

        showParentSummaryTimeData: this.summary_time_attr,
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result.name && result.name === 'onOk') {
        this.summary_time_attr = result.value;
      }
    });
  }

  addOtherCompareDate() {

    this.tableTimeSetting.other_compare_date_list.push({
      summary_date: 'day:1:0',
      summary_date_range: [subDays(new Date(), +1), subDays(new Date(), +1)],
      alias: '',
    },
    );
  }
  // 自主添加对比时间1
  addCompareDate() {
    this.isCompare = true;
  }
  removeCompareDate() {
    this.isCompare = false;
  }
}
