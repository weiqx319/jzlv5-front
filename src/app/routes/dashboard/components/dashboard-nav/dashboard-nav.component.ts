import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ChangeSizeService } from "../../service/change-size.service";
import { DashboardService } from "../../service/dashboard.service";
import { NewDashboardTabComponent } from "../../modal/new-dashboard-tab/new-dashboard-tab.component";
import { NzModalService } from 'ng-zorro-antd/modal';
import { isObject } from "@jzl/jzl-util";
import { ActivatedRoute, Router } from "@angular/router";
import { FullscreenService } from "../../../../core/service/fullscreen.service";

@Component({
  selector: 'app-dashboard-nav',
  templateUrl: './dashboard-nav.component.html',
  styleUrls: ['./dashboard-nav.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardNavComponent implements OnInit {
  public size: number;
  public is_fullscreen = false;

  public currentDashBoard$;
  @Output() download: EventEmitter<any> = new EventEmitter<any>();
  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() dateChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(private changeSizeService: ChangeSizeService,
    private modalService: NzModalService,
    private router: Router,
    private route: ActivatedRoute,
    private fullscreen: FullscreenService,
    private dashBoardService: DashboardService) {
    this.size = this.changeSizeService.getSize();
    this.currentDashBoard$ = this.dashBoardService.getCurrentDashBoard();
  }

  ngOnInit() {
  }

  downloadPdf(): void {
    this.download.emit();
  }

  emitDate(event) {
    this.dateChange.emit(event);
  }

  refreshData(): void {
    this.refresh.emit();
  }

  changeSize(size: number): void {
    this.size = size;
    this.changeSizeService.changeSize(size);
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
        id: 0,
        name: ''
      }
    });
    new_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.hasOwnProperty('status')) {
        if (result['status'] === 'Ok') {
          if (result['result']['oper'] === 'edit') {
            row.dashboard_name = result['result']['data']['dashboard_name'];
          } else if (result['result']['oper'] === 'save') {
            this.dashBoardService.addDashboard(result['result']['data']);
            this.dashBoardService.setCurrentDashBoard(result['result']['data']);
            this.router.navigate(['/dashboard/' + result['result']['data']['dashboard_id']]);
          }
        }
      }
    });
  }


  changeFullscreen(value: boolean) {
    this.is_fullscreen = value;
    this.fullscreen.changeFullscreen.next(value);
  }

}
