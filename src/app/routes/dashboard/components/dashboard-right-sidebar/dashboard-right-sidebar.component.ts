import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NewDashboardTabComponent } from "../../modal/new-dashboard-tab/new-dashboard-tab.component";
import { DashboardService } from "../../service/dashboard.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { isObject } from "@jzl/jzl-util";
import { AuthService } from "../../../../core/service/auth.service";
import { LocalStorageService } from "ngx-webstorage";
import { FullscreenService } from "../../../../core/service/fullscreen.service";
import { MenuService } from '../../../../core/service/menu.service';

@Component({
  selector: 'app-dashboard-right-sidebar',
  templateUrl: './dashboard-right-sidebar.component.html',
  styleUrls: ['./dashboard-right-sidebar.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class DashboardRightSidebarComponent implements OnInit {

  @Input() dataList: any[];
  public is_fullscreen = false;
  constructor(private modalService: NzModalService,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private localSt: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private fullscreen: FullscreenService,
    private _message: NzMessageService,
    public menuService: MenuService,
    ) {
    fullscreen.changeFullscreen.subscribe((res) => {
      this.is_fullscreen = res;
    });
  }

  ngOnInit() {
  }
  editDashboard(row?) {
    const new_modal = this.modalService.create({
      nzTitle: (row && row.dashboard_id) ? '编辑概览页' : '新建概览页',
      nzWidth: 600,
      nzContent: NewDashboardTabComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'new-dashboard-modal',
      nzFooter: null,
      nzComponentParams: {
        id: (row && row.dashboard_id) ? row.dashboard_id : 0,
        name: (row && row.dashboard_name) ? row.dashboard_name : ''
      }
    });
    new_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.hasOwnProperty('status')) {
        if (result['status'] === 'Ok') {
          if (result['result']['oper'] === 'edit') {
            row.dashboard_name = result['result']['data']['dashboard_name'];
          } else if (result['result']['oper'] === 'save') {
            this.dataList.push(result['result']['data']);
            this.switchDashboard(result['result']['data']);
          } else if (result['result']['oper'] === 'copy') {
            this.dataList.push(result['result']['data']);
          }
        }
      }
    });
  }

  copyDashboard(row, is_default = false) {
    const copy_modal = this.modalService.create({
      nzTitle: '复制概览页',
      nzWidth: 600,
      nzContent: NewDashboardTabComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'new-dashboard-modal',
      nzFooter: null,
      nzComponentParams: {
        id: row.dashboard_id,
        name: row.dashboard_name + '-copy',
        operType: 'copy',
        isDefault: is_default
      }
    });
    copy_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.hasOwnProperty('status')) {
        if (result['status'] === 'Ok') {
          if (result['result']['oper'] === 'edit') {
            row.dashboard_name = result['result']['data']['dashboard_name'];
          } else if (result['result']['oper'] === 'save') {
            this.dataList.push(result['result']['data']);
          } else if (result['result']['oper'] === 'copy') {
            this.dataList.push(result['result']['data']);
          }
        }
      }
    });
  }

  deleteDashboard(row, index) {
    this.dashboardService.deleteDashBoard({ dashboard_id: row.dashboard_id }).subscribe(
      data => {
        if (data.status_code === 200) {
          this._message.success('删除概览页成功');
          if (this.route.snapshot.firstChild && Number(this.route.snapshot.firstChild.paramMap.get('id')) === row.dashboard_id) {
            this.dashboardService.setCurrentDashBoard(this.dataList[0]);
            this.router.navigate([this.dataList[0]['dashboard_id']], { relativeTo: this.route });
            this.dataList.splice(index, 1);
          } else {
            this.dataList.splice(index, 1);
          }
        } else {
          this._message.error('删除概览页失败');
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
        } else {

        }
      }
    );
  }

  switchDashboard(row) {
    this.dashboardService.setCurrentDashBoard(row);
    this.setLocalDashboardId(row['dashboard_id']);
    this.router.navigate([row['dashboard_id']], { relativeTo: this.route });
  }
  setLocalDashboardId(dashboard_id) {
    const currentUser = this.authService.getCurrentUser();
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    const cacheKey = 'dashboard_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
    this.localSt.store(cacheKey, dashboard_id);
  }

}
