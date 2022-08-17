import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  Input
} from '@angular/core';
import { DataViewService } from '../../service/data-view.service';
import { AuthService } from '../../../../core/service/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { DataViewAddEditService } from '../../service/data-view-add-edit.service';

@Component({
  selector: 'app-history-setting',
  templateUrl: './history-setting.component.html',
  styleUrls: ['./history-setting.component.scss']
})
export class HistorySettingComponent implements OnInit {
  @Input() parentData: any;
  @Input() summaryType: any;
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;

  public noResultHeight: any;
  public bodyParams: Object = {};
  public showSingleKeywordData = {};
  public campaignInfo = {};
  public accountInfo = {};
  public groupData = {};
  public publisherOption = {};

  constructor(
    private dataViewService: DataViewService,
    private message: NzMessageService,
    private _http: DataViewAddEditService
  ) {
    this.noResultHeight = document.body.clientHeight - 187;
    this.publisherOption = this._http.getPublisherOption();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 240;
  }

  /**
   * 刷新表格数据
   */
  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this.bodyParams = {
      pConditions: [],
      module_map: {
        chan_pub_id: this.parentData.selected_data[0].chan_pub_id,
        object_id: this.parentData.selected_data[0][
          `pub_${this.summaryType}_id`
        ]
      }
    };
    this.dataViewService.getHistorySettingList(this.bodyParams).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.apiData = [];
          this.total = 0;
        } else {
          this.apiData = results['data'];
          this.total = results['data'].length;
        }
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
        this.message.error('数据获取异常，请重试');
      },
      () => {}
    );
  }
  _showSingleKeyword() {
    this._http
      .getSingleKeywordData({
        chan_pub_id: this.parentData.selected_data[0].chan_pub_id,
        pub_account_id: this.parentData.selected_data[0].pub_account_id,
        pub_keyword_id: this.parentData.selected_data[0].pub_keyword_id
      })
      .subscribe(result => {
        if (result.status_code === 200) {
          this.showSingleKeywordData = result.data;
        }
      });
  }
  _showCampaign() {
    this._http
      .showCampaign({
        chan_pub_id: this.parentData.selected_data[0].chan_pub_id,
        pub_account_id: this.parentData.selected_data[0].pub_account_id,
        pub_campaign_id: this.parentData.selected_data[0].pub_campaign_id
      })
      .subscribe(result => {
        this.campaignInfo = result.data;
      });
  }
  _showAdgroup() {
    this._http
      .showAdgroup({
        chan_pub_id: this.parentData.selected_data[0].chan_pub_id,
        pub_account_id: this.parentData.selected_data[0].pub_account_id,
        pub_adgroup_id: this.parentData.selected_data[0].pub_adgroup_id
      })
      .subscribe(result => {
        if (result.status_code === 200) {
          this.groupData = result.data;
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      });
  }

  _showAccount() {
    this._http
      .showAccount({
        chan_pub_id: this.parentData.selected_data[0].chan_pub_id,
        pub_account_id: this.parentData.selected_data[0].pub_account_id
      })
      .subscribe(result => {
        if (result.status_code === 200) {
          this.accountInfo = result['data'];
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      });
  }
  ngOnInit() {
    if (this.parentData.selected_data.length === 1) {
      switch (this.summaryType) {
        case 'keyword':
          this._showSingleKeyword();
          break;
        case 'campaign':
          this._showCampaign();
          break;
        case 'adgroup':
          this._showAdgroup();
          break;
        case 'account':
          this._showAccount();
          break;
      }
    }
    this.onWindowResize();
    this.refreshData();
  }
}
