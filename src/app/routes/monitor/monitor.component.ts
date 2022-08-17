import { Component, HostListener, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { MonitorService } from "./service/monitor.service";
import { MenuService } from '../../core/service/menu.service';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit {

  public tableHeight = document.body.clientHeight - 60 - 35 - 30 - 1;
  // public monitor_date = [];

  public pageInfo = {
    pageSize: 10,
    allCount: 0,
    currentPage: 1,
    currentPageCount: 0,
    pageSizeList: [
      { key: 10, name: '10条/页' },
      { key: 20, name: '20条/页' },
      { key: 50, name: '50条/页' },
      { key: 100, name: '100条/页' },
      { key: 200, name: '200条/页' },
    ],
    loadingStatus: 'success',
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



  private addModal = null;
  public publisherOption: any;
  public summary_types: any;

  public monitor_rate_name = {};
  public selectedData = [];
  constructor(private modalService: NzModalService,
    private message: NzMessageService,
    public menuService: MenuService,
    private route: ActivatedRoute,
    private router: Router,
    private monitorService: MonitorService) {
    this.publisherOption = this.monitorService.publisherOption;
    this.summary_types = this.monitorService.getSummaryTabNameByPublisherId(this.menuService.currentPublisherId);

    this.monitor_rate_name = this.monitorService.monitor_rate_name;
    // this.monitor_date = this.monitorService.monitor_date;
  }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 35 - 30;
  }




  // -- 数据相关 -- start
  reloadData() {
    this.selected = [];
    this.loadingIndicator = true;
    this.pageInfo.loadingStatus = 'pending';
    this.monitorService.getMonitorList({
      ...{
        count: this.pageInfo.pageSize,
        page: this.pageInfo.currentPage
      }, ...this.orderInfo
    }).subscribe(result => {
      if (result['status_code'] === 200) {
        this.loadingIndicator = false;
        const copyRows = JSON.parse(JSON.stringify(result['data']['detail']));
        this.rows = copyRows;
        this.pageInfo.allCount = result['data']['detail_count'];
        this.pageInfo.currentPageCount = result['data']['detail'].length;
        this.pageInfo.loadingStatus = 'success';
        this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>请在账户、计划 、单元、关键词 层级选择监控范围，点击编辑进行监控设置</span>
    </div>
  `;
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
        this.pageInfo.loadingStatus = 'error';
        this.rows = [];
        this.loadingIndicator = false;
        this.pageInfo.currentPageCount = 0;
        this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>获取数据失败，请重试</span>
    </div>
  `;
      } else if (result['status_code'] && result.status_code === 205) {
        this.pageInfo.loadingStatus = 'error';
        this.rows = [];
        this.loadingIndicator = false;
        this.pageInfo.currentPageCount = 0;
        this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>获取数据失败，请重试</span>
    </div>
  `;
      } else {
        this.message.error(result.message);
        this.pageInfo.loadingStatus = 'error';
        this.rows = [];
        this.loadingIndicator = false;
        this.pageInfo.currentPageCount = 0;
        this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>获取数据失败，请重试</span>
    </div>
  `;
      }
    },
      (err: any) => {
        this.loadingIndicator = false;
        this.pageInfo.loadingStatus = 'error';
        this.rows = [];
        this.loadingIndicator = false;
        this.pageInfo.currentPageCount = 0;
        this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span>获取数据失败，请重试</span>
    </div>
  `;
      },
      () => {
        this.loadingIndicator = false;
      });


  }

  deleteMonitor() {
    const monitor_ids = [];
    this.selected.forEach(item => {
      monitor_ids.push(item.monitor_id);
    });
    this.monitorService.deleteMonitor({ monitor_ids }).subscribe(result => {
      if (result['status_code'] === 200) {

        this.message.success('删除成功');
        this.reloadData();
      } else {
        this.message.error(result['message']);
      }
    }, (err: any) => { },
      () => {
      });

  }

  clickSwitch(row) {
    row['monitor_status'] * 1 === 100 ? row['monitor_status'] = '200' : row['monitor_status'] = '100';
    if (!row['loading']) {
      row['loading'] = true;
      this.monitorService.updateMonitorStatus({ monitor_status: row['monitor_status'] }, row.monitor_id).subscribe(result => {
        if (result['status_code'] === 200) {
          this.message.success('操作成功');
          this.reloadData();
        } else {
          this.message.error(result['message']);
        }
      }, (err: any) => { },
        () => {
          row['loading'] = false;
        });
    }

  }

  changePage(page) {
    this.pageInfo.currentPage = page.page;
    this.reloadData();

  }
  changePageSize(pageSize) {
    this.pageInfo.currentPage = 1;
    this.reloadData();
  }
  sortView(event) {
    const sortInfo = event.sorts[0];
    const orderKey = sortInfo.prop;
    this.orderInfo = { 'orderby': orderKey, 'sort': sortInfo.dir };
    this.reloadData();
  }
  // -- 数据相关 -- end


  ngOnInit() {
    this.reloadData();
  }

  onSelect({ selected }) {

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }


}
