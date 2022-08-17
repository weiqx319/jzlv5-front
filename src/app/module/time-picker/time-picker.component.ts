import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import {
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears
} from "date-fns";
import {formatDate} from "@jzl/jzl-util";

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TimePickerComponent implements OnInit {

  @Output() submit = new EventEmitter<any>();

  @Input() data;

  public timeListType = [
    {key: '0,0,day', name: '今日'},
    {key: '1,1,day', name: '昨日'},
    {key: '0,0,week', name: '本周'},
    {key: '1,1,week', name: '上周'},
    {key: '0,0,month', name: '本月'},
    {key: '1,1,month', name: '上月'},
    {key: '0,0,year', name: '本年'},
    {key: '1,1,year', name: '去年'},
    {key: '7,1,day',name: '过去七天',},
    {key: '30,1,day',name: '过去30天',},
    {key: '90,1,day',name: '过去90天',},
    {key: 'online_today',name: '上线至今',},
    {key: 'custom',name: '自定义',},
    {key: 'set_dynamic_time',name: '设置动态时间',},
  ];
  public curTimeType = {
    key: '0:0:day',
    name: '今日'
  };
  public startTimeType = 1;

  public summary_date_range = [new Date(), new Date()];
  public startTime = new Date();
  public startDay = 1;
  public endDay = 1;
  public time_title = "";

  constructor() { }

  ngOnInit() {
    const data = this.timeListType.find(item => item.key === this.data.time_params);
    if(data) {
      this.curTimeType = data;
      this.data.time_params = data.key;
      this.data.time_function = 'relative_time';
      this.summary_date_range = this.splitDate(data.key, this.summary_date_range);
      this.time_title = data.name + ' | ' + formatDate(this.summary_date_range[0])+' 至 '+ formatDate(this.summary_date_range[1]);
    } else {
      if(this.data.time_function) {
        if(this.data.time_function === 'absolute_time') {
          this.summary_date_range = [new Date(this.data.time_params.split(',')[0]),new Date(this.data.time_params.split(',')[1])];
          this.curTimeType = {key: 'custom',name: '自定义'};
          this.time_title = formatDate(this.summary_date_range[0])+' 至 '+ formatDate(this.summary_date_range[1]);
        } else if(this.data.time_function === 'all') {
          this.summary_date_range = [new Date('2000-01-01'), new Date()];
          this.curTimeType = {key: 'online_today',name: '上线至今'};
          this.time_title = this.curTimeType.name + ' | ' + formatDate(this.summary_date_range[0])+' 至 '+ formatDate(this.summary_date_range[1]);
        } else {
          this.curTimeType = {key: 'set_dynamic_time',name: '设置动态时间',};
          if(this.data.time_params.includes('-')) {
            this.startTimeType = 1;
            this.startTime = new Date(this.data.time_params.split(',')[0]);
            this.time_title = formatDate(this.startTime)+' 至 过去' + this.endDay + '天';
          } else {
            this.startTimeType = 2;
            this.startDay = this.data.time_params.split(',')[0];
            this.time_title = '过去'+ this.startDay +'天 至 过去' + this.endDay + '天';
          }
          this.endDay = this.data.time_params.split(',')[1];
        }
      } else {
        this.curTimeType = {key: '0,0,day', name: '今日'};
        this.summary_date_range = this.splitDate('0,0,day', this.summary_date_range);
        this.time_title = '今日 | ' + formatDate(this.summary_date_range[0])+' 至 '+ formatDate(this.summary_date_range[1]);
        this.data.time_params = '0,0,day';
        this.data.time_function = 'relative_time';
        this.data.time_name = this.time_title;
        this.submit.emit();
      }
    }
  }

  changeTime(value) {
    this.startTimeType = 1;
    this.startDay = 1;
    this.endDay = 1;
    this.summary_date_range = [new Date(), new Date()];
    this.startTime = new Date();
    this.curTimeType = value;
    this.summary_date_range = this.splitDate(value.key, this.summary_date_range);
    this.time_title = value.name + ' | ' + formatDate(this.summary_date_range[0])+' 至 '+ formatDate(this.summary_date_range[1]);
    if(value.key === 'online_today') {
      this.summary_date_range = [new Date('2000-01-01'), new Date()];
      this.data.time_params = "";
      this.data.time_function = 'all';
      this.time_title = value.name + ' | ' + formatDate(this.summary_date_range[0])+' 至 '+ formatDate(this.summary_date_range[1]);
      this.data.time_name = this.time_title;
      this.data.isPickerVisible = false;
      this.submit.emit();
    } else if(value.key === 'custom') {
      this.time_title = formatDate(this.summary_date_range[0])+' 至 '+ formatDate(this.summary_date_range[1]);
    } else if(value.key === 'set_dynamic_time') {
      this.time_title = formatDate(this.startTime)+' 至 过去' + this.endDay + '天';
    } else {
      this.data.time_params = value.key;
      this.data.time_function = 'relative_time';
      this.data.time_name = this.time_title;
      this.data.isPickerVisible = false;
      this.submit.emit();
    }
  }

  changeTimeType(value) {
    this.startTimeType = value;
    if(value === 1) {
      this.time_title = formatDate(this.startTime)+' 至 过去' + this.endDay + '天';
    } else {
      this.time_title = '过去'+ this.startDay +'天 至 过去' + this.endDay + '天';
    }
  }

  changeDynamicTime() {
    if(this.curTimeType.key === 'custom') {
      this.time_title = formatDate(this.summary_date_range[0])+' 至 '+ formatDate(this.summary_date_range[1]);
    } else {
      if(this.startTimeType === 1) {
        this.time_title = formatDate(this.startTime)+' 至 过去' + this.endDay + '天';
      } else {
        this.time_title = '过去'+ this.startDay +'天 至 过去' + this.endDay + '天';
      }
    }
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

  getDisableDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) > 0;
  }

  doSave() {
    if(this.curTimeType.key === 'custom') {
      this.data.time_params = formatDate(this.summary_date_range[0])+','+ formatDate(this.summary_date_range[1]) + ',day';
      this.data.time_function = 'absolute_time';
    } else if(this.curTimeType.key === 'set_dynamic_time') {
      if(this.startTimeType === 1) {
        this.data.time_params = formatDate(this.startTime) + ',' + this.endDay + ',day';
      } else {
        this.data.time_params = this.startDay + ',' + this.endDay + ',day';
      }
      this.data.time_function = 'relative_time';
    }

    this.data.time_name = this.time_title;
    this.data.isPickerVisible = false;
    this.submit.emit();
  }

}
