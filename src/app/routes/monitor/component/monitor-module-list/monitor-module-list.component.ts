import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { forkJoin as observableForkJoin, Observable } from 'rxjs';

import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";

import { MonitorService } from "../../service/monitor.service";

@Component({
  selector: 'app-monitor-module-list',
  templateUrl: './monitor-module-list.component.html',
  styleUrls: ['./monitor-module-list.component.scss']
})
export class MonitorModuleListComponent implements OnInit {

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
  public orderInfo: any = { 'orderby': '', 'sort': 'desc' };
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
      { name: '账户', key: 'pub_account_name', link: true },
      { name: '近三天最后一次报警时间', key: 'last_alarm_time' },
      { name: '近三天最后一次报警描述', key: 'last_alarm_desc' }
    ],
    campaign: [
      { name: '计划', key: 'pub_campaign_name', link: true },
      { name: '账户', key: 'pub_account_name' },
      { name: '近三天最后一次报警时间', key: 'last_alarm_time' },
      { name: '近三天最后一次报警描述', key: 'last_alarm_desc' }

    ],
    adgroup: [
      { name: '单元', key: 'pub_adgroup_name', link: true },
      { name: '账户', key: 'pub_account_name' },
      { name: '计划', key: 'pub_campaign_name' },
      { name: '近三天最后一次报警时间', key: 'last_alarm_time' },
      { name: '近三天最后一次报警描述', key: 'last_alarm_desc' }

    ],
    keyword: [
      { name: '关键词', key: 'pub_keyword', link: true },
      { name: '账户', key: 'pub_account_name' },
      { name: '单元', key: 'pub_adgroup_name' },
      { name: '计划', key: 'pub_campaign_name' },
      { name: '近三天最后一次报警时间', key: 'last_alarm_time' },
      { name: '近三天最后一次报警描述', key: 'last_alarm_desc' }
    ]
  };


  private ngIndex = {
    'keyword': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id', 'pub_keyword_id'],
    'adgroup': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id'],
    'campaign': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id'],
    'account': ['publisher_id', 'chan_pub_id', 'pub_account_id'],
    'creative': ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id']
  };

  constructor(private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private monitorService: MonitorService) {
    this.monitorId = this.route.snapshot.parent.paramMap.get('id');
  }




  getTableTitles(publisherId: number) {
    let tempTableTitles = {
      account: [
        { name: '账户', key: 'pub_account_name', link: true },
        { name: '近三天最后一次报警时间', key: 'last_alarm_time' },
        { name: '近三天最后一次报警描述', key: 'last_alarm_desc' }
      ],
      campaign: [
        { name: '计划', key: 'pub_campaign_name', link: true },
        { name: '账户', key: 'pub_account_name' },
        { name: '近三天最后一次报警时间', key: 'last_alarm_time' },
        { name: '近三天最后一次报警描述', key: 'last_alarm_desc' }

      ],
      adgroup: [
        { name: '单元', key: 'pub_adgroup_name', link: true },
        { name: '账户', key: 'pub_account_name' },
        { name: '计划', key: 'pub_campaign_name' },
        { name: '近三天最后一次报警时间', key: 'last_alarm_time' },
        { name: '近三天最后一次报警描述', key: 'last_alarm_desc' }

      ],
      keyword: [
        { name: '关键词', key: 'pub_keyword', link: true },
        { name: '账户', key: 'pub_account_name' },
        { name: '计划', key: 'pub_campaign_name' },
        { name: '单元', key: 'pub_adgroup_name' },
        { name: '近三天最后一次报警时间', key: 'last_alarm_time' },
        { name: '近三天最后一次报警描述', key: 'last_alarm_desc' }
      ]
    };
    if (publisherId == 7) {
      tempTableTitles = {
        account: [
          { name: '账户', key: 'pub_account_name', link: true },
          { name: '近三天最后一次报警时间', key: 'last_alarm_time' },
          { name: '近三天最后一次报警描述', key: 'last_alarm_desc' }
        ],
        campaign: [
          { name: '广告组', key: 'pub_campaign_name', link: true },
          { name: '账户', key: 'pub_account_name' },
          { name: '近三天最后一次报警时间', key: 'last_alarm_time' },
          { name: '近三天最后一次报警描述', key: 'last_alarm_desc' }

        ],
        adgroup: [
          { name: '计划', key: 'pub_adgroup_name', link: true },
          { name: '账户', key: 'pub_account_name' },
          { name: '广告组', key: 'pub_campaign_name' },
          { name: '近三天最后一次报警时间', key: 'last_alarm_time' },
          { name: '近三天最后一次报警描述', key: 'last_alarm_desc' }

        ],
        keyword: [
          { name: '关键词', key: 'pub_keyword', link: true },
          { name: '账户', key: 'pub_account_name' },
          { name: '广告组', key: 'pub_campaign_name' },
          { name: '计划', key: 'pub_adgroup_name' },
          { name: '近三天最后一次报警时间', key: 'last_alarm_time' },
          { name: '近三天最后一次报警描述', key: 'last_alarm_desc' }
        ]
      };
    }




    return tempTableTitles;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 40 - 36 - 60;
  }

  deleteModule() {
    const monitor_detail_ids = [];
    this.selected.forEach(item => {
      monitor_detail_ids.push(item.monitor_detail_id);
    });
    this.monitorService.deleteModule(this.monitorId, { monitor_detail_ids }).subscribe(result => {
      if (result['status_code'] && result['status_code'] === 200) {
        this.message.success('删除成功(' + result['data']['effect'] + ')');
        this.refreshData();
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else if (result['status_code'] && result.status_code === 205) {
      } else {
        this.message.error(result.message);
      }
    }, (err: any) => { },
      () => {
      });

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
    this.monitorService.getMonitorDetailList(this.monitorId, this.pageInfo.pageSize, this.pageInfo.currentPage, { ...this.orderInfo }).subscribe(result => {
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
