import { Component, HostListener, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../../../../../../environments/environment.prod';
import { DefineSettingService } from '../../../../../../service/define-setting.service';
@Component({
  selector: 'app-default-publisher',
  templateUrl: './default-publisher.component.html',
  styleUrls: ['./default-publisher.component.scss']
})
export class DefaultPublisherComponent implements OnInit {

  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 500;

  public noResultHeight = document.body.clientHeight - 310;
  public isModalVisible = false;
  public modalType = 'add';
  public editPublisherId = null;
  public defaultPublisherName = '';
  public submitting = false;
  constructor(
    private defineSettingService: DefineSettingService,
    private message: NzMessageService,
  ) {
    this.noResultHeight = document.body.clientHeight - 310;
  }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 310;
  }

  ngOnInit() {
    this.refreshData();
  }


  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this.defineSettingService.getDefaultPublisherList({ page: this.currentPage, count: this.pageSize }).subscribe(
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

  _refreshStatus() {
    const allChecked = this.apiData.every(value => value.disabled || value.checked);
    const allUnchecked = this.apiData.every(value => !value.checked);
    // 表示不是全选，但是有选中的
    this._indeterminate = ((!allUnchecked) && (!allChecked)) || allChecked;
    this._allChecked = allChecked;
  }

  _checkAll(value) {
    if (value) {
      this.apiData.forEach(data => {
        if (!data.disabled) {
          data.checked = true;
        }
      });
      this._indeterminate = true;
    } else {
      this._indeterminate = false;
      this.apiData.forEach(data => data.checked = false);
    }
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }


  downloadDefaultPublisher() {
    window.open(environment.SERVER_API_URL + '/setting/publisher/download');
  }

}
