import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ManageService } from "../../service/manage.service";
import { ManageItemService } from "../../service/manage-item.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LocalStorageService } from "ngx-webstorage";
import { environment } from "../../../../../environments/environment";
import { deepCopy } from "@jzl/jzl-util";
import { isArray } from "@jzl/jzl-util";

@Component({
  selector: 'app-conversion-list',
  templateUrl: './conversion-list.component.html',
  styleUrls: ['./conversion-list.component.scss']
})
export class ConversionListComponent implements OnInit, OnChanges {

  @Input() start_time: string;
  @Input() end_time: string;
  @Output() singleTaskEmit = new EventEmitter<string>();
  public taskListData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;

  public noResultHeight = document.body.clientHeight - 272;

  private taskStartTime = '';
  private taskEndTime = '';
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
    conver_source_type: {
      filterType: 'singleList',
      filterOption: [],
      filterKey: {
        key: 'conver_source_type',
        name: '数据源类型',
        type: 'singleList'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    conver_channel_type: {
      filterType: 'singleList',
      filterOption: [],
      filterKey: {
        key: 'conver_channel_type',
        name: '数据源渠道',
        type: 'singleList'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    conver_desc: {
      filterType: 'multiValue',
      filterOption: [],
      filterKey: {
        key: 'conver_desc',
        name: '数据详情',
        type: 'multiValue'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    conver_result: {
      filterType: 'multiValue',
      filterOption: [],
      filterKey: {
        key: 'conver_result',
        name: '处理结果',
        type: 'multiValue'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
    data_date: {
      filterType: 'dateFilter',
      filterOption: [],
      filterKey: {
        key: 'data_date',
        name: '转化数据日期',
        type: 'dateFilter'
      },
      filterResult: {},
      extraOption: {
        columnCount: false
      }
    },
  };
  public viewTableData = {
    condition: [],
    data_range: []
  };

  constructor(
    private manageService: ManageService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private localSt: LocalStorageService
  ) {
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;
   }
  getLocalTaskLogTime() {
    const cacheKey = 'task_log_time';
    const cacheData = this.localSt.retrieve(cacheKey);
  }
  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this.taskQueryParams.pConditions = [];
    Object.values(this.filterData).forEach(item => {
      item.filterResult['key'] && this.taskQueryParams.pConditions.push(item.filterResult);
    });
    this.filterData = { ...this.filterData };
    this.getConversionRecordList();
  }
  getConversionRecordList() {
    this.loading = true;
    this.manageService
      .getConversionRecordList(this.taskQueryParams, {
        page: this.currentPage,
        count: this.pageSize,
        start_time: this.taskStartTime,
        end_time: this.taskEndTime
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
    this.getConversionSourceDict();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.start_time) {
      this.taskStartTime = changes.start_time.currentValue;
    }
    if (changes.end_time) {
      this.taskEndTime = changes.end_time.currentValue;
    }
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

  getConversionSourceDict() {
    this.manageService.getConversionSourceDict().subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
        } else {
          this.filterData.conver_channel_type.filterOption = [];
          this.filterData.conver_source_type.filterOption = [];
          const filterList = deepCopy(results.data);
          filterList.forEach(source => {
            this.filterData.conver_source_type.filterOption.push({ key: source.source_id, name: source.source_name });
            if (isArray(source.child) && source.child.length > 0) {
              for (const channel of source.child) {
                this.filterData.conver_channel_type.filterOption.push({ key: channel.source_id, name: channel.source_name });
              }
            }
          });
        }
      }
    );
  }

  getTaskDetailById(task_id) {
    this.singleTaskEmit.emit(task_id);
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


}
