import { MenuService } from '../../../../core/service/menu.service';
import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DataViewService } from "../../service/data-view.service";
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { Router, ActivatedRoute } from "@angular/router";
@Component({
  selector: 'app-set-automation-tactic',
  templateUrl: './set-automation-tactic.component.html',
  styleUrls: ['./set-automation-tactic.component.scss']
})
export class SetAutomationTacticComponent implements OnInit {
  @Input() summaryType;
  @Input() selectedEntities;

  indeterminate = false;// 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public currentSelectedPage = 'current';

  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;
  public resultStatus = 'error';
  public listQueryParams = {
    pConditions: [],
  };
  filterResult = {
    tactic_name: {},
    strategy: {},
    tactic_level: {},
    tactic_entity_type: {},
    editor_id: {}
  };
  public noResultHeight = document.body.clientHeight - 288;


  constructor(
    private message: NzMessageService,
    private dataViewService: DataViewService,
    private subject: NzDrawerRef,
    public menuService: MenuService,
    private router: Router,
  ) { }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 240;
  }
  ngOnInit(): void {
    this.refreshData();
  }
  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._allChecked = false;
    this.listQueryParams.pConditions = [
      { "key": "tactic_level", "name": "应用层级", "op": "=", "value": this.summaryType },
      { "key": "tactic_entity_type", "name": "应用实体类型", "op": "=", "value": 2 }
    ];
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        this.listQueryParams.pConditions.push(item);
      }
    });

    this.dataViewService.getTacticList(this.listQueryParams, {
      result_model: this.currentPage,
      count: this.pageSize,
    }).subscribe((results: any) => {
      if (results.status_code !== 200) {
        this.apiData = [];
        this.total = 0;
        this.resultStatus = 'error';
        this.message.error('数据获取异常，请重试');
      } else {
        this.apiData = results['data']['data'];
        this.apiData.forEach(data => {
          data.status_loading = false;//状态开关按钮loading
        });
        this.total = results['data']['total'];
        this.resultStatus = 'success';
      }
      this.loading = false;
    },
      (err: any) => {
        this.loading = false;
        this.message.error('数据获取异常，请重试');
        this.resultStatus = 'error';
      },
      () => { },
    );
  }

  _checkAllPage(value) {
    this.currentSelectedPage = 'all';
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

  _checkAll(value) {
    this.indeterminate = false;
    this.currentSelectedPage = 'current';
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
    this.currentSelectedPage = 'current';
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

  cancel(): void {
    this.subject.close('onCancel');
  }

  save() {
    const postData = {
      tactic_level: this.summaryType,
      tactic_ids: [],
      tactic_entities: []
    }
    this.apiData.forEach(data => {
      if (data['checked']) {
        postData.tactic_ids.push(data['tactic_id']);
      }
    });

    if (postData.tactic_ids.length === 0) {
      this.message.warning('请选择策略');
      return
    }

    this.selectedEntities.forEach(item => {
      postData.tactic_entities.push({
        chan_pub_id: item['chan_pub_id'],
        pub_account_id: item['pub_account_id'],
        pub_account_name: item['pub_account_name'],
        pub_campaign_id: item['pub_campaign_id'],
        pub_campaign_name: item['pub_campaign_name'],
        pub_adgroup_id: item['pub_adgroup_id'],
        pub_adgroup_name: item['pub_adgroup_name'],
      })
    })

    this.dataViewService.addTacticEntities(postData).subscribe((results: any) => {
      if (results.status_code === 200) {
        this.message.success('添加成功');
        this.subject.close('onSuccess');
      } else {
        this.message.error(results.message);
      }
    },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => { },
    );
  }

}
