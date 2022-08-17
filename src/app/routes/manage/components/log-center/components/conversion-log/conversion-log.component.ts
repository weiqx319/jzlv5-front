import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {TaskDetailComponent} from "../../../../modal/task-detail/task-detail.component";
import {ManageService} from "../../../../service/manage.service";
import {ManageItemService} from "../../../../service/manage-item.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {NotifyService} from "../../../../../../module/notify/notify.service";
import {AuthService} from "../../../../../../core/service/auth.service";
import {Store} from "@ngrx/store";
import {AppState} from "../../../../../../core/store/app.state";
import {LocalStorageService} from "ngx-webstorage";
import {differenceInCalendarDays, format, subDays} from "date-fns";

@Component({
  selector: 'app-conversion-log',
  templateUrl: './conversion-log.component.html',
  styleUrls: ['./conversion-log.component.scss']
})
export class ConversionLogComponent implements OnInit {

  @ViewChild('taskDetail') taskDetailCom: TaskDetailComponent;
  public dateValue: Date;
  public start_time = '';
  public end_time = '';
  public task_id = '';
  public tab_selected_type = 'list';
  private cacheKey = 'task_log_filter_time';
  private tempDate: Date;
  private time_interval: number[] = [0, 89];

  authState$ = this.store$.select((s) => s.auth);
  constructor(
    private manageService: ManageService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private notifyService: NotifyService,
    private authService: AuthService,
    private store$: Store<AppState>,
    private localSt: LocalStorageService,
  ) {
    // if (this.getLocalTaskLogTime()) {
    //   this.dateValue = this.getLocalTaskLogTime();
    // } else {
    //   this.dateValue = this.splitDate();
    // }
    this.dateValue = this.splitDate();
    this.start_time = format(this.dateValue[0], 'yyyy-MM-dd');
    this.end_time = format(this.dateValue[1], 'yyyy-MM-dd');
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    
  }
  onDateChange(result: Date) {
    this.dateValue = result;
    this.start_time = format(result[0], 'yyyy-MM-dd');
    this.end_time = format(result[1], 'yyyy-MM-dd');
    // this.setLocalTaskLogTime(result);
  }
  //日历显示隐藏回调
  openDateChange(open: boolean): void {
    if (open) {
      //重置时间间隔
      this.time_interval = [-89, 0];
    }
  }
  //不可用时间
  disabledEndDate = (current: Date) => {
    const time =
      this.time_interval[0] === -89 ? this.splitDate()[1] : this.tempDate;
    return (
      differenceInCalendarDays(current, time) < this.time_interval[0] ||
      differenceInCalendarDays(current, time) > this.time_interval[1]
    );
  }

  onCalendarChange(result) {
    const currentDate = new Date();
    const enableEndTime = subDays(currentDate, +0);
    const enableStartTime = subDays(enableEndTime, +89);
    const startInterVal = Math.abs(
      differenceInCalendarDays(enableStartTime, result[0]),
    );
    const endInterVal = Math.abs(differenceInCalendarDays(enableEndTime, result[0]));

    this.time_interval = [-30, 30];
    if (startInterVal < 30) {
      this.time_interval[0] = -startInterVal;
    } else if (endInterVal < 30) {
      this.time_interval[1] = endInterVal;
    }
    this.tempDate = result[0];
  }
  getLocalTaskLogTime() {
    return this.localSt.retrieve(this.cacheKey);
  }
  setLocalTaskLogTime(result) {
    this.localSt.store(this.cacheKey, result);
  }

  changeActive(type) {
    this.tab_selected_type = type;
  }

  ngOnInit() {
    this.onWindowResize();
  }

  download() {
    this.taskDetailCom.download();
  }
  splitDate(): any {
    const currentDate = new Date();
    const largeDate = subDays(currentDate, +0);
    const minDate = subDays(largeDate, +30);
    return [minDate, largeDate];
  }

  getTaskDetailById(task_id) {
    this.tab_selected_type = 'detail';
    this.task_id = task_id;
  }

}
