import { MenuService } from '../../../../core/service/menu.service';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {ActivatedRoute, Router} from "@angular/router";
import {MonitorService} from "../../service/monitor.service";

@Component({
  selector: 'app-monitor-module',
  templateUrl: './monitor-module.component.html',
  styleUrls: ['./monitor-module.component.scss'],
  providers: [MonitorService]
})
export class MonitorModuleComponent implements OnInit {

  public monitorTab = [
    // {'name': '关键词', key: 'list'},
    {'name': '监控日志', key: 'log'},
    {'name': '高级设置', key: 'setting'}
  ];

  public monitorId = '';
  public monitorGroupInfo = null;
  public publisherOption: any;
  constructor(
    private monitorService: MonitorService,
    private message: NzMessageService,
    private router: Router,
    private  route: ActivatedRoute,
    public menuService: MenuService,
  ) {
    this.monitorId =  this.route.snapshot.paramMap.get('id');
    this.publisherOption = this.monitorService.publisherOption;
  }




  ngOnInit() {
    this.monitorService.getMonitorRefresh().subscribe(
      (item) => {
        if (item) {
          this.refreshMonitorInfo (item);
        }
      }
    );
    this.getMonitorInfo (this.monitorId);

  }

  refreshMonitorInfo(monitorId) {
    this.monitorService.getMonitorDetail(monitorId).subscribe(result => {
      if (result['status_code'] === 200) {
        this.monitorGroupInfo = result['data'];
        this.monitorService.setMonitorInfo(result['data']);
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else if (result['status_code'] && result.status_code === 205) {
      } else {
        this.message.error(result.message);
      }
    }, error => {

    });
  }
  getMonitorInfo(monitorId) {
    this.monitorService.getMonitorDetail(monitorId).subscribe(result => {
      if (result['status_code'] === 200) {
        this.monitorGroupInfo = result['data'];
        this.monitorService.setMonitorInfo(result['data']);
        const summaryTypeNames = this.monitorService.getSummaryTabNameByPublisherId(this.monitorGroupInfo['publisher_id']);
        this.monitorTab.unshift({name:summaryTypeNames[this.monitorGroupInfo.monitor_module], key: 'list'});
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else if (result['status_code'] && result.status_code === 205) {
      } else {
        this.message.error(result.message);
      }
    }, error => {

    });
  }


}
