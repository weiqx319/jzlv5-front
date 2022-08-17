import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { forkJoin as observableForkJoin, Observable } from 'rxjs';

import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";

import { MonitorService } from "../../service/monitor.service";
import { differenceInCalendarDays, format, subDays } from "date-fns";
import { formatDate } from "@jzl/jzl-util";
import { environment } from "../../../../../environments/environment";

@Component({
  selector: 'app-monitor-module-log',
  templateUrl: './monitor-module-log.component.html',
  styleUrls: ['./monitor-module-log.component.scss']
})
export class MonitorModuleLogComponent implements OnInit {


  constructor(private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private monitorService: MonitorService) {
    this.monitorId = this.route.snapshot.parent.paramMap.get('id');
    this.dateValue = this.splitDate();
    this.start_time = format(this.dateValue[0], 'yyyy-MM-dd');
    this.end_time = format(this.dateValue[1], 'yyyy-MM-dd');
  }
  public tableHeight = document.body.clientHeight - 60 - 40 - 36 - 60;
  public monitorId: any;
  public pageInfo = {
    pageSize: 200,
    allCount: 0,
    currentPage: 1,
    currentPageCount: 0,
    pageSizeList: [
      { key: 10, name: '10条/页' },
      { key: 20, name: '20条/页' },
      { key: 50, name: '50条/页' },
      { key: 100, name: '100条/页' },
      { key: 200, name: '200条/页' },
    ]
  };
  public dataMessages = {
    emptyMessage: `
    <div class="empty-content">
      <span>请在账户、计划 、单元、关键词 层级选择监控范围，点击编辑进行监控设置</span>
    </div>
  `
  };
  public orderInfo: any = { 'orderby': 'create_time', 'sort': 'desc' };
  public rows = [];
  public selected = [];
  public columns = [];
  public loadingIndicator = false;
  public monitorInfo: any;
  public titles: any;

  public module_base = {
    account: 1,
    campaign: 2,
    adgroup: 3,
    keyword: 4
  };
  public tableTitles = {
    account: [
      { name: '报警时间', key: 'create_time' },
      { name: '账户', key: 'pub_account_name', link: true },
      { name: '报警内容', key: 'alarm_desc' },
    ],
    campaign: [
      { name: '报警时间', key: 'create_time' },
      { name: '计划', key: 'pub_campaign_name', link: true },
      { name: '账户', key: 'pub_account_name' },
      { name: '报警内容', key: 'alarm_desc' },

    ],
    adgroup: [
      { name: '报警时间', key: 'create_time' },
      { name: '单元', key: 'pub_adgroup_name', link: true },
      { name: '账户', key: 'pub_account_name' },
      { name: '计划', key: 'pub_campaign_name' },
      { name: '报警内容', key: 'alarm_desc' },

    ],
    keyword: [
      { name: '报警时间', key: 'create_time' },
      { name: '关键词', key: 'pub_keyword', link: true },
      { name: '账户', key: 'pub_account_name' },
      { name: '单元', key: 'pub_adgroup_name' },
      { name: '计划', key: 'pub_campaign_name' },
      { name: '报警内容', key: 'alarm_desc' },

    ]
  };



  private ngIndex = {
    'keyword': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id', 'pub_keyword_id'],
    'adgroup': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id'],
    'campaign': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id'],
    'account': ['publisher_id', 'chan_pub_id', 'pub_account_id'],
    'creative': ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id']
  };

  public dateValue: Date;
  public start_time = '';
  public end_time = '';
  private tempDate: Date;
  private time_interval: number[] = [0, 89];


  getTableTitles(publisherId: number) {
    let tempTableTitles = {
      account: [
        { name: '报警时间', key: 'create_time' },
        { name: '账户', key: 'pub_account_name', link: true },
        { name: '报警内容', key: 'alarm_desc' },
      ],
      campaign: [
        { name: '报警时间', key: 'create_time' },
        { name: '计划', key: 'pub_campaign_name', link: true },
        { name: '账户', key: 'pub_account_name' },
        { name: '报警内容', key: 'alarm_desc' },

      ],
      adgroup: [
        { name: '报警时间', key: 'create_time' },
        { name: '单元', key: 'pub_adgroup_name', link: true },
        { name: '账户', key: 'pub_account_name' },
        { name: '计划', key: 'pub_campaign_name' },
        { name: '报警内容', key: 'alarm_desc' },

      ],
      keyword: [
        { name: '报警时间', key: 'create_time' },
        { name: '关键词', key: 'pub_keyword', link: true },
        { name: '账户', key: 'pub_account_name' },
        { name: '单元', key: 'pub_adgroup_name' },
        { name: '计划', key: 'pub_campaign_name' },
        { name: '报警内容', key: 'alarm_desc' },

      ]
    };
    if (publisherId == 7) {
      tempTableTitles = {
        account: [
          { name: '报警时间', key: 'create_time' },
          { name: '账户', key: 'pub_account_name', link: true },
          { name: '报警内容', key: 'alarm_desc' },
        ],
        campaign: [
          { name: '报警时间', key: 'create_time' },
          { name: '广告组', key: 'pub_campaign_name', link: true },
          { name: '账户', key: 'pub_account_name' },
          { name: '报警内容', key: 'alarm_desc' },

        ],
        adgroup: [
          { name: '报警时间', key: 'create_time' },
          { name: '计划', key: 'pub_adgroup_name', link: true },
          { name: '账户', key: 'pub_account_name' },
          { name: '广告组', key: 'pub_campaign_name' },
          { name: '报警内容', key: 'alarm_desc' },

        ],
        keyword: [
          { name: '报警时间', key: 'create_time' },
          { name: '关键词', key: 'pub_keyword', link: true },
          { name: '账户', key: 'pub_account_name' },
          { name: '计划', key: 'pub_adgroup_name' },
          { name: '广告组', key: 'pub_campaign_name' },
          { name: '报警内容', key: 'alarm_desc' },

        ]
      };
    }




    return tempTableTitles;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 40 - 36 - 60;
  }

  onDateChange(result: Date) {
    this.dateValue = result;
    this.start_time = format(result[0], 'yyyy-MM-dd');
    this.end_time = format(result[1], 'yyyy-MM-dd');

    this.pageInfo.currentPage = 1;
    this.refreshData();
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
  splitDate(): any {
    const currentDate = new Date();
    const largeDate = subDays(currentDate, +0);
    const minDate = subDays(largeDate, +30);
    return [minDate, largeDate];
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

  download() {
    this.loadingIndicator = true;
    this.monitorService.getRankingLogFileId(this.monitorId, {
      count: this.pageInfo.pageSize,
      page: this.pageInfo.currentPage,
      start: this.start_time,
      end: this.end_time,
    }).subscribe(
      (results: any) => {
        this.loadingIndicator = false;
        if (results.status_code && results.status_code === 200) {
          const cacheKey = results['data']['cache_key'];
          window.open(environment.SERVER_API_URL + '/files_public_down/' + cacheKey);
        } else {
          this.message.error('当前不可下载，请稍候重试');
        }
      },
      (err: any) => {
        this.loadingIndicator = false;
        this.message.error('系统异常，不可下载');
      },
      () => {
        this.loadingIndicator = false;
      }
    );
  }

  changePage(page) {
    this.pageInfo.currentPage = page.page;
    this.refreshData();

  }
  changePageSize(pageSize) {
    this.pageInfo.currentPage = 1;
    this.refreshData();
  }
  sortView(event) {
    const sortInfo = event.sorts[0];
    const orderKey = sortInfo.prop;
    this.orderInfo = { 'orderby': orderKey, 'sort': sortInfo.dir };

    this.refreshData();
  }

  // -- 数据相关
  refreshData() {
    this.selected = [];
    this.loadingIndicator = true;
    this.monitorService.getMonitorLogList(this.monitorId, this.pageInfo.pageSize, this.pageInfo.currentPage, this.start_time, this.end_time, { ...this.orderInfo }).subscribe(result => {
      if (result['status_code'] === 200) {
        // monitor_module
        this.loadingIndicator = false;
        this.rows = result['data']['detail'];
        this.pageInfo.allCount = result['data']['detail_count'];
        this.pageInfo.currentPageCount = result['data']['detail'].length;
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
      } else if (result['status_code'] && result.status_code === 205) {
      } else {
        this.message.error(result.message);
      }
    },
      (err: any) => {
        this.loadingIndicator = false;
      },
      () => {
        this.loadingIndicator = false;
      });


  }

  listInit() {
    this.loadingIndicator = true;
    const MonitorInfo = this.monitorService.getMonitorDetail(this.monitorId);
    observableForkJoin([MonitorInfo]).subscribe(results => {
      results.forEach((result: any, index) => {
        if (result['status_code'] && result['status_code'] === 200) {
          if (index === 0) { //监控详情
            this.monitorInfo = result['data'];
            const tempTitles = this.getTableTitles(this.monitorInfo.publisher_id);
            this.titles = tempTitles[this.monitorInfo['monitor_module']];
          }

        } else if (result['status_code'] && result['status_code'] === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result['status_code'] === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result['status_code'] === 205) {
        } else {
          this.message.error(result.message);
        }
      });
      this.refreshData();
    });
  }

  ngOnInit() {
    this.listInit();
  }

  onSelect({ selected }) {

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

}
