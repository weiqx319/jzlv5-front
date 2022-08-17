import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Input,
  SimpleChanges
} from '@angular/core';
import { ManageService } from '../../service/manage.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ManageItemService } from '../../service/manage-item.service';
import { LocalStorageService } from 'ngx-webstorage';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { differenceInCalendarDays, format, subDays } from 'date-fns';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {

  public dateValue: Date;
  public start_time = '';
  public end_time = '';
  public task_id = '';

  private tempDate: Date;
  private time_interval: number[] = [0, 89];

  private cacheKey = 'task_log_detail_time';

  public taskDetailData = [];
  public total = 0;
  public loading = true;
  public downloadLoading = false;
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
  operation_level_map = {
    '1': '账户',
    '2': '计划',
    '3': '单元',
    '4': '关键词',
    '5': '创意',
    '7': '百度_ocpc'
  };
  operation_type_map = {
    '1': '增加',
    '2': '修改',
    '3': '删除'
  };
  publisher_value_map = {
    '1': '百度',
    '2': '搜狗',
    '3': '360',
    '4': '神马',
    '6': '广点通',
    '7': '今日头条',
    '10': 'google',
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
    publisher_id: {
      filterType: 'singleList',
      filterOption: [],
      filterKey: {
        key: 'publisher_id',
        name: '媒体',
        type: 'singleList'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    operation_level: {
      filterType: 'checkboxList',
      filterOption: [],
      filterKey: {
        key: 'operation_level',
        name: '操作层级',
        type: 'checkboxList'
      },
      filterResult: {},
      extraOption: {
        columnCount: true
      }
    },
    operation_type: {
      filterType: 'singleList',
      filterOption: [],
      filterKey: {
        key: 'operation_type',
        name: '操作类型',
        type: 'singleList'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    operation_status: {
      filterType: 'singleList',
      filterOption: [],
      filterKey: {
        key: 'operation_status',
        name: '操作状态',
        type: 'singleList'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    pub_account_name: {
      filterType: 'multiValue',
      filterOption: [],
      filterKey: {
        key: 'pub_account_name',
        name: '账户',
        type: 'multiValue'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    pub_campaign_name: {
      filterType: 'multiValue',
      filterOption: [],
      filterKey: {
        key: 'pub_campaign_name',
        name: '计划',
        type: 'multiValue'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    pub_adgroup_name: {
      filterType: 'multiValue',
      filterOption: [],
      filterKey: {
        key: 'pub_adgroup_name',
        name: '单元',
        type: 'multiValue'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    object_name: {
      filterType: 'multiValue',
      filterOption: [],
      filterKey: {
        key: 'object_name',
        name: '层级名称',
        type: 'multiValue'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    operation_content: {
      filterType: 'multiValue',
      filterOption: [],
      filterKey: {
        key: 'operation_content',
        name: '操作内容',
        type: 'multiValue'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    }
  };

  constructor(
    public route: ActivatedRoute,
    private manageService: ManageService,
    private manageItemService: ManageItemService,
    private message: NzMessageService,
    private localSt: LocalStorageService
  ) {
    this.filterData.publisher_id.filterOption =
      manageItemService.publisherTypeList;
    this.filterData.operation_level.filterOption =
      manageItemService.operationLevelList;
    this.filterData.operation_type.filterOption =
      manageItemService.operationTypeList;
    this.filterData.operation_status.filterOption = manageItemService.TaskStatusList;

    if (this.manageItemService.task_id) {
      this.task_id = this.manageItemService.task_id;
      this.filterData.task_id.filterResult = {
        key: 'task_id',
        name: '任务ID',
        op: '=',
        value: this.task_id,
        type: 'multiValue'
      };
      this.manageItemService.task_id = null;
    }

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
  ngOnInit() {

    this.onWindowResize();
    this.refreshData();

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
    this.getOperationTaskDetail();
  }
  getOperationTaskDetail() {
    this.loading = true;
    this.manageService
      .getOperationTaskDetail(this.taskQueryParams, {
        page: this.currentPage,
        count: this.pageSize,
        start_time: this.start_time,
        end_time: this.end_time
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.taskDetailData = [];
            this.total = 0;
          } else {
            this.taskDetailData = results['data']['detail'];
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


  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.start_time) {
  //     this.taskStartTime = changes.start_time.currentValue;
  //   }
  //   if (changes.end_time) {
  //     this.taskEndTime = changes.end_time.currentValue;
  //   }
  //   if (changes.task_id && changes.task_id.currentValue) {
  //     this.filterData.task_id.filterResult = {
  //       key: 'task_id',
  //       name: '任务ID',
  //       op: '=',
  //       value: [changes.task_id.currentValue],
  //       type: 'multiValue'
  //     };
  //   }
  //   this.refreshData();
  // }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

  download() {
    this.downloadLoading = true;
    this.manageService
      .downloadTaskDetail(this.taskQueryParams, {
        page: 9999,
        count: 30,
        start_time: this.start_time,
        end_time: this.end_time
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            const cacheKey = results['data']['cache_key'];
            window.open(
              environment.SERVER_API_URL + '/files_public_down/' + cacheKey
            );
          } else {
            this.message.error('当前不可下载，请稍候重试');
          }
          this.downloadLoading = false;
        },
        (err: any) => {
          this.downloadLoading = false;
          this.message.error('系统异常，不可下载');
        },
        () => {
          this.downloadLoading = false;
        }
      );
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


  getLocalTaskLogTime() {
    return this.localSt.retrieve(this.cacheKey);
  }

  setLocalTaskLogTime(result) {
    this.localSt.store(this.cacheKey, result);
  }
}
