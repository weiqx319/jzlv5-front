import { isArray } from '@jzl/jzl-util';
import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { deepCopy, formatDate } from '@jzl/jzl-util';
import { AssetManagementService } from './../../asset-management.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { MenuService } from 'src/app/core/service/menu.service';
@Component({
  selector: 'app-push-account-log',
  templateUrl: './push-account-log.component.html',
  styleUrls: ['./push-account-log.component.scss']
})
export class PushAccountLogComponent implements OnInit {
  @Input() custom_audience_id;
  @Input() chan_pub_id;

  constructor(
    private assetManagementService: AssetManagementService,
    private message: NzMessageService,
    private authService: AuthService,
    public menuService: MenuService,
  ) { }

  indeterminate = false;
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;


  public apiData = [];
  public accountsList = [];
  public currentPage = 1;
  public pageSize = 30;
  public loading = false;
  public total = 10;
  public noResultHeight = document.body.clientHeight - 300;

  public sortDataKey = 'create_time';
  public sortDataDirection = 'desc';
  public currentSelectedPage = 'current';

  public queryParam = {
    pConditions: [],
    sort_item: {
      key: "create_time",
      dir: "desc"
    },
    cid: 25,
    publisher_id: 7,
  };

  public defaultData = {
    publisher_id: 7,
    cid: 25,
    custom_audience_name: '',
    status: '',
    source: '',
    tag: '',
    create_time: [],
  };
  public statusObj = {
    1: '成功',
    2: '失败'
  }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;
    this.loading = true;

    this.assetManagementService.audiencePushAccountLog({
      page: this.currentPage,
      count: this.pageSize,
      custom_audience_id: this.custom_audience_id,
      chan_pub_id: this.chan_pub_id
    }).subscribe(
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
      () => { },
    );
  }


  refreshChecked() {
    this._indeterminate = false;
    this._allChecked = false;
    this.apiData.forEach(data => {
      data['checked'] = false;
    });
  }


  sortData(sortInfo, key) {
    if (sortInfo == 'ascend') {
      this.sortDataKey = key;
      this.sortDataDirection = 'asc';
    } else if (sortInfo == 'descend') {
      this.sortDataKey = key;
      this.sortDataDirection = 'desc';
    } else {
      this.sortDataKey = 'create_time';
      this.sortDataDirection = 'desc';
    }
    this.refreshData();

  }

  _checkAllPage(value) {
    this.currentSelectedPage = 'all';
    if (value) {
      this._allChecked = true;
      this.apiData.forEach((data) => {
        data['checked'] = true;
      });
      this._indeterminate = true;
    } else {
      this._allChecked = false;
      this._indeterminate = false;
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
      this._indeterminate = true;
    } else {
      this._allChecked = false;
      this._indeterminate = false;
      this.apiData.forEach((data) => (data['checked'] = false));
    }
  }
  _refreshSingleChangeStatus(event?, data?) {
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
    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;
  }

}
