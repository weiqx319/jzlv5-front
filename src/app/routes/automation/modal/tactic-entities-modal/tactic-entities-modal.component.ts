import { MenuService } from '../../../../core/service/menu.service';
import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AutomationService } from "../../service/automation.service";
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { Router, ActivatedRoute } from "@angular/router";
@Component({
  selector: 'app-tactic-entities-modal',
  templateUrl: './tactic-entities-modal.component.html',
  styleUrls: ['./tactic-entities-modal.component.scss']
})
export class TacticEntitiesModalComponent implements OnInit {
  @Input() tacticId;
  @Input() tacticLevel;
  @Input() tacticLevelName;

  public tacticLevelObj = this.automationService.tacticLevelObj;
  public urlString = '';

  indeterminate = false;// 表示有选中的，不管是全选还是选个别
  _allChecked = false;

  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;
  public resultStatus = 'error';
  public checked_ids = [];
  public listQueryParams = {
    pConditions: [],
  };

  filterResult = {
    pub_account_name: {},
    pub_campaign_name: {},
    pub_adgroup_name: {},
  };

  public noResultHeight = document.body.clientHeight - 250;

  constructor(
    private message: NzMessageService,
    private automationService: AutomationService,
    private subject: NzDrawerRef,
    private router: Router,
    public menuService: MenuService,
  ) {
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 250;
  }

  ngOnInit(): void {
    this.urlString = this.tacticLevel === 'adgroup' ? 'group' : this.tacticLevel;
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

    this.automationService.getTacticEntitiesList(this.tacticId, this.listQueryParams, {
      page: this.currentPage,
      count: this.pageSize,
    }).subscribe((results: any) => {
      if (results.status_code !== 200) {
        this.apiData = [];
        this.total = 0;
        this.resultStatus = 'error';
        this.message.error('数据获取异常，请重试');
      } else {
        this.apiData = results['data']['detail'];
        this.total = results['data']['detail_count'];
        this.resultStatus = 'success';
      }
      this.loading = false;
      this._refreshStatus();
    },
      (err: any) => {
        this.loading = false;
        this.message.error('数据获取异常，请重试');
        this.resultStatus = 'error';
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
        this.checked_ids.length = 0;
        this.checked_ids.push(data.tactic_entity_id);
      });
    } else {
      this._allChecked = false;
      this.apiData.forEach((data) => (data['checked'] = false));
      this.checked_ids.length = 0;
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

    this.checked_ids.length = 0;
    this.apiData.forEach((data) => {
      if (data['checked']) {
        this.checked_ids.push(data.tactic_entity_id);
      }
    });
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

  cancel(): void {
    this.subject.close('onCancel');
  }

  deleteEntities(data?) {
    this.loading = true;
    let checked_ids;
    if (data) {
      checked_ids = [data.tactic_entity_id];
    } else {
      checked_ids = this.checked_ids;
    }

    if (checked_ids.length == 0) {
      this.message.warning('请先选择实体');
      return;
    }

    const body = { tactic_entity_ids: checked_ids }
    this.automationService.deleteTacticEntities(this.tacticId, body).subscribe(result => {
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
      this.message.error('数据请求异常，请重试');
    });
  }
}
