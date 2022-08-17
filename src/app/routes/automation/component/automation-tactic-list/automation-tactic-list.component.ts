import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { GlobalTemplateComponent } from '../../../../shared/template/global-template/global-template.component';
import { AutomationService } from '../../service/automation.service'
import { Router, ActivatedRoute } from "@angular/router";
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { TacticEntitiesModalComponent } from "../../modal/tactic-entities-modal/tactic-entities-modal.component";
import { TacticLogModalComponent } from "../../modal/tactic-log-modal/tactic-log-modal.component";
@Component({
  selector: 'app-automation-tactic-list',
  templateUrl: './automation-tactic-list.component.html',
  styleUrls: ['./automation-tactic-list.component.scss']
})
export class AutomationTacticListComponent implements OnInit {
  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;
  public tacticLevelObj = this.automationService.tacticLevelObj;
  public tacticLevelList = this.automationService.tacticLevelList;
  public tacticLogVisible = false;
  public entityTypeList = [
    { key: 2, name: '指定实体' },
    { key: 1, name: '根据条件筛选' },
  ];


  indeterminate = false;// 表示有选中的，不管是全选还是选个别
  _allChecked = false;

  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;
  public listQueryParams = {
    pConditions: [],
  };
  filterResult = {
    tactic_name: {},
    tactic_des: {},
    tactic_level: {},
    tactic_entity_type: {},
  };
  public noResultHeight = document.body.clientHeight - 285;

  constructor(
    private message: NzMessageService,
    private automationService: AutomationService,
    private router: Router,
    private route: ActivatedRoute,
    private drawerService: NzDrawerService,
  ) { }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 285;
  }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._allChecked = false;
    this.listQueryParams.pConditions = [];
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        this.listQueryParams.pConditions.push(item);
      }
    });

    this.automationService.getTacticList(this.listQueryParams, {
      page: this.currentPage,
      count: this.pageSize,
    }).subscribe((results: any) => {
      if (results.status_code !== 200) {
        this.apiData = [];
        this.total = 0;
      } else {
        this.apiData = results['data']['data'];
        this.apiData.forEach(data => {
          data.status_loading = false;//状态开关按钮loading
        });
        this.total = results['data']['total'];
      }
      this.loading = false;
    },
      (err: any) => {
        this.loading = false;
        this.message.error('数据获取异常，请重试');
      },
      () => { },
    );
  }

  _checkAll(value) {
    this.indeterminate = false;
    if (value) {
      this._allChecked = true;
      this.apiData.forEach((data) => {
        data['checked'] = true;
      });
    } else {
      this._allChecked = false;
      this.apiData.forEach((data) => (data['checked'] = false));
    }
  }

  _refreshStatus(event?, data?) {
    if (data) {
      data['checked'] = event;
    }
    const allChecked = this.apiData.every(
      (value) => value['checked'],
    );
    const allUnchecked = this.apiData.every((value) => !value['checked']);

    if (!allUnchecked && !allChecked) {
      this.indeterminate = true;
    } else {
      this.indeterminate = false;
    }
    this._allChecked = allChecked;
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

  // 修改状态
  changeTacticStatus(value) {
    value.status_loading = true;
    this.automationService.updateTacticStatus(value.tactic_id, { paused: !value.paused }).subscribe((data: any) => {
      if (data['status_code'] && data.status_code === 200) {
        this.message.success('更新成功');
        value.status_loading = false;
      } else {
        this.message.error(data.message);
        value.status_loading = false;
      }
      this.refreshData();
    }, (err) => {
      this.message.error('系统异常，请重试');
      value.status_loading = false;
    }, () => { });
  }


  // 编辑
  editTactic(tacticId) {
    this.router.navigate(['../tactic_detail'], { queryParams: { tactic_id: tacticId }, relativeTo: this.route });
  }

  // 删除
  deleteTactic(data) {
    this.loading = true;
    const body = { tactic_ids: [data.tactic_id] };
    this.automationService.deleteTactic(body).subscribe(result => {
      if (result.status_code === 200) {
        this.loading = false;
        this.refreshData();
        this.message.success('删除成功');
      } else {
        this.loading = false;
        this.message.error(result.message, { nzDuration: 3000 });
      }
    }, (err: any) => {
      this.loading = false;
      this.message.error('数据获取异常，请重试');
    });
  }

  // 查看实体
  checkTacticEntities(data) {
    const drawerRef = this.drawerService.create<TacticEntitiesModalComponent>({
      nzTitle: '策略应用实体列表',
      nzWidth: '85%',
      nzContent: TacticEntitiesModalComponent,
      nzContentParams: {
        tacticId: data.tactic_id,
        tacticLevel: data.tactic_level,
        tacticLevelName: this.tacticLevelObj[data.tactic_level]
      }
    });

    drawerRef.afterClose.subscribe(data => {
      if (data === 'onSuccess') {
      }
    });
  }

  // 查看日志，开启
  checkTacticLog(data) {
    const drawerRef = this.drawerService.create<TacticLogModalComponent>({
      nzTitle: "策略执行日志",
      nzWidth: '85%',
      nzBodyStyle: { 'padding-top': 0 },
      nzContent: TacticLogModalComponent,
      nzContentParams: {
        tacticId: data.tactic_id,
        tacticLevel: data.tactic_level,
      }
    });

    drawerRef.afterClose.subscribe(data => {
      if (data === 'onSuccess') {
      }
    });
  }

  // 查看日志抽屉关闭
  tacticLogClose() {
    this.tacticLogVisible = false;
  }
}
