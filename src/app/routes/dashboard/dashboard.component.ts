import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, ParamMap, Router } from "@angular/router";
import { DashboardService } from "./service/dashboard.service";

import { isUndefined } from "@jzl/jzl-util";
import { CustomDatasService } from "../../shared/service/custom-datas.service";
import { AuthService } from "../../core/service/auth.service";
import { LocalStorageService } from "ngx-webstorage";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {

  public dashBoardList: any[];

  public size: number;

  public loading = true;
  navigationSubscription;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private localSt: LocalStorageService,
    private dashboardService: DashboardService,
    private customDatasService: CustomDatasService) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationStart) {
        return false;
      }
      if (e instanceof NavigationEnd) {
        // if (e.urlAfterRedirects === '/dashboard/2') {
        // 兼容新菜单
        if (e.urlAfterRedirects === '/dashboard') {
          this.customDatasService.loadData(0, true);
          this.ngOnInit();
        }
      }
    });
  }

  ngOnInit() {
    this.dashboardService.getDashBoardList().subscribe(data => {
      this.dashBoardList = data;
    });
    this.dashboardService.list().subscribe(
      (results: any[]) => {
        this.dashBoardList = results;
        this.dashboardService.setDashBoardList(results);
        this.loading = false;
        if (this.dashBoardList.length > 0) {
          const localDashboardId = this.getLocalDashboardId();
          let dashBoardItem: any;
          let jumpId = localDashboardId ? localDashboardId : this.dashBoardList[0]['dashboard_id'];
          if (localDashboardId) {
            this.dashBoardList.forEach(item => {
              if (item['dashboard_id'] === localDashboardId) {
                dashBoardItem = item;
              }
            });
            if (!dashBoardItem) {
              dashBoardItem = this.dashBoardList[0];
              jumpId = this.dashBoardList[0]['dashboard_id'];
            }
          } else {
            dashBoardItem = this.dashBoardList[0];
            jumpId = this.dashBoardList[0]['dashboard_id'];
          }
          if (this.route.snapshot.firstChild && this.route.snapshot.firstChild.paramMap.get('id') != null) {
            const currentDashboard = this.dashBoardList.find((item) => item.dashboard_id === Number(this.route.snapshot.firstChild.paramMap.get('id')));
            if (isUndefined(currentDashboard)) {
              this.dashboardService.setCurrentDashBoard(dashBoardItem);
              this.router.navigate([jumpId], { relativeTo: this.route });
            } else {
              this.dashboardService.setCurrentDashBoard(currentDashboard);
            }
          } else {
            this.dashboardService.setCurrentDashBoard(dashBoardItem);
            this.router.navigate([jumpId], { relativeTo: this.route });
          }
        }
      },
      (err: any) => {

      },
      () => {
      }
    );


  }

  // -- 获取本地缓存的信息
  getLocalDashboardId() {
    const currentUser = this.authService.getCurrentUser();
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    const cacheKey = 'dashboard_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
    return this.localSt.retrieve(cacheKey);
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

}
