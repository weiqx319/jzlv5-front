import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  Input,
  SimpleChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { ManageService } from '../../service/manage.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ManageItemService } from '../../service/manage-item.service';
import { LocalStorageService } from 'ngx-webstorage';
import { environment } from "../../../../../environments/environment";
import { differenceInCalendarDays, format, subDays } from "date-fns";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-task-list-cron',
  templateUrl: './task-list-cron.component.html',
  styleUrls: ['./task-list-cron.component.scss']
})
export class TaskListCronComponent implements OnInit {

  public dateValue: Date;
  public start_time = '';
  public end_time = '';
  public task_id = '';

  private cacheKey = 'task_log_cron_time';
  private tempDate: Date;
  private time_interval: number[] = [0, 89];

  public taskListData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;

  public noResultHeight = document.body.clientHeight - 310;

  public taskQueryParams = {
    pConditions: [],
    sort_item: {}
  };
  status_value_map = {
    '0': '待处理',
    '1': '处理中',
    '2': '部分成功',
    '3': '成功',
    '4': '失败'
  };
  cron_status_map = {
    '0': '待执行',
    '1': '已执行',
    '2': '已终止',
  };

  op_level_map = {
    'campaign': '计划',
    'adgroup': '单元',
    'keyword': '关键词',
    'creative': '创意',
  };
  //筛选相关数据
  public filterData = {
    advertiser_name: {
      filterType: 'multiValue',
      filterOption: [],
      filterKey: {
        key: 'advertiser_name',
        name: '广告主',
        type: 'multiValue'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    user_name: {
      filterType: 'multiValue',
      filterOption: [],
      filterKey: {
        key: 'user_name',
        name: '操作人',
        type: 'multiValue'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    task_id: {
      filterType: 'multiValue',
      filterOption: [],
      filterKey: {
        key: 'task_id',
        name: '任务ID',
        type: 'multiValue'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    task_desc: {
      filterType: 'multiValue',
      filterOption: [],
      filterKey: {
        key: 'task_desc',
        name: '任务描述',
        type: 'multiValue'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    task_result: {
      filterType: 'multiValue',
      filterOption: [],
      filterKey: {
        key: 'task_result',
        name: '任务结果',
        type: 'multiValue'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    task_status: {
      filterType: 'singleList',
      filterOption: [],
      filterKey: {
        key: 'task_status',
        name: '任务状态',
        type: 'singleList'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    oper_level: {
      filterType: 'singleList',
      filterOption: [],
      filterKey: {
        key: 'oper_level',
        name: '操作层级',
        type: 'singleList'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    cron_status: {
      filterType: 'singleList',
      filterOption: [],
      filterKey: {
        key: 'cron_status',
        name: '定时状态',
        type: 'singleList'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    }
  };
  public viewTableData = {
    condition: [],
    data_range: []
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private manageService: ManageService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private localSt: LocalStorageService,
  ) {
    this.filterData.task_status.filterOption = manageItemService.TaskStatusList;
    this.filterData.cron_status.filterOption = manageItemService.TaskCronStatusList;
    this.filterData.oper_level.filterOption = manageItemService.TaskCronOpLevelList;
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
    this.noResultHeight = document.body.clientHeight - 310;
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this.taskQueryParams.pConditions = [];
    Object.values(this.filterData).forEach(item => {
      item.filterResult['key'] &&
        this.taskQueryParams.pConditions.push(item.filterResult);
    });
    this.filterData = { ...this.filterData };
    this.getOperationTaskList();
  }
  getOperationTaskList() {
    this.loading = true;
    this.manageService
      .getOperationTaskListCron(this.taskQueryParams, {
        page: this.currentPage,
        count: this.pageSize,
        start_time: this.start_time,
        end_time: this.end_time
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.taskListData = [];
            this.total = 0;
          } else {
            this.taskListData = results['data']['detail'];
            this.total = results['data']['detail_count'];
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
          this.message.error('数据获取异常，请重试');
        },
        () => { }
      );
  }

  ngOnInit() {
    this.onWindowResize();
    this.refreshData();
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

  //排序
  sort(sort: { key: string; value: string }): void {
    if (sort.value) {
      sort.value = sort.value === 'ascend' ? 'asc' : 'desc';
      this.taskQueryParams.sort_item = sort;
    } else {
      this.taskQueryParams.sort_item = {};
    }
    this.refreshData();
  }

  downloadErrorFile(row) {
    this.manageService.downloadErrorFile(row.task_id, { cid: row.cid }).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.info('当前转化数据不可下载');
        } else {
          const cacheKey = results['data']['cache_key'];
          window.open(environment.SERVER_API_URL + '/files_down/' + cacheKey);
        }
      },
      (err: any) => {
        this.message.error('系统异常');
      },
      () => {
      }
    );
  }

  cancelCron(row) {
    this.loading = true;
    this.manageService.stopOperationTaskCron(row.task_id, { cid: row.cid }).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.error(results['message']);
        } else {
          row.cron_status = 2;
        }
      },
      (err: any) => {
        this.message.error('系统异常');
      },
      () => {
        this.loading = false;
      }
    );
  }


  editCronTime(row) {
    row.cron_setting_temp = row.cron_setting;
    row.edit = true;
  }

  editCronOk(row) {
    row.edit = false;

    const cronSetting = format(row.cron_setting_temp, 'yyyy-MM-dd HH:mm:ss');
    this.loading = true;
    this.manageService.updateOperationTaskCron(row.task_id, { cid: row.cid, cron_setting: cronSetting }).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.error(results['message']);
        } else {
          row.cron_setting = cronSetting;
        }
      },
      (err: any) => {
        this.message.error('系统异常');
      },
      () => {
        this.loading = false;
      }
    );


  }

  editCronCancel(row) {
    row.edit = false;
  }




  onDateChange(result: Date) {
    this.dateValue = result;
    this.start_time = format(result[0], 'yyyy-MM-dd');
    this.end_time = format(result[1], 'yyyy-MM-dd');
    // this.setLocalTaskLogTime(result);
    this.refreshData();
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

  splitDate(): any {
    const currentDate = new Date();
    const largeDate = subDays(currentDate, +0);
    const minDate = subDays(largeDate, +30);
    return [minDate, largeDate];
  }

  getTaskDetailById(task_id) {
    this.task_id = task_id;
    this.manageItemService.task_id = task_id;
    this.router.navigate(['../detail'], { relativeTo: this.route });
  }

  getLocalTaskLogTime() {
    return this.localSt.retrieve(this.cacheKey);
  }

  setLocalTaskLogTime(result) {
    this.localSt.store(this.cacheKey, result);
  }
}
