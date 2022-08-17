import { Component, HostListener, OnInit } from '@angular/core';
import {DefineSettingService} from "../../../../service/define-setting.service";
import {NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'app-data-role',
  templateUrl: './data-role.component.html',
  styleUrls: ['./data-role.component.scss']
})
export class DataRoleComponent implements OnInit {
  public logPageInfo = {
    pageSize: 500,
    total: 0,
    currentPage: 1,
  };

  public loading = true;

  public noResultHeight = document.body.clientHeight - 272;

  public apiData = [];

  public total = 0;

  constructor(private defineSettingService: DefineSettingService,private message: NzMessageService,) { }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;
  }
  ngOnInit(): void {
    this.refreshData();
  }


  refreshData(status?) {
    if (status) {
      this.logPageInfo.currentPage = 1;
    }
    this.defineSettingService.dataRoleList({},{...this.logPageInfo}).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.apiData = [];
          this.total = 0;
        } else {
          this.apiData = results['data']['detail'];
          this.total = results['data']['detail_count'];
        }
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );

  }

  deleteRole(roleId) {
    this.defineSettingService.deleteDataRole(roleId,{}).subscribe(
      data => {
        if (data.status_code === 200) {
          this.message.success('删除成功');
          this.refreshData();
        } else {
          this.message.error('删除失败');
        }
      }, () => {});
  }

}
