import { Component, HostListener, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../../../../../../environments/environment.prod';
import { DefineSettingService } from '../../../../../../service/define-setting.service';

@Component({
  selector: 'app-custom-channel',
  templateUrl: './custom-channel.component.html',
  styleUrls: ['./custom-channel.component.scss']
})
export class CustomChannelComponent implements OnInit {
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
  public editChannelId = null;
  public customChannelName = '';
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
    this.defineSettingService.getCustomChannelList({ page: this.currentPage, count: this.pageSize }).subscribe(
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


  addCustomChannel() {
    this.modalType = 'add';
    this.customChannelName = '';
    this.isModalVisible = true;
  }



  editCustomChannel(customChannel) {
    this.modalType = 'edit';
    this.isModalVisible = true;
    this.editChannelId = customChannel.channel_id;
    this.customChannelName = customChannel.channel_name;
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }


  downloadList() {
    window.open(environment.SERVER_API_URL + '/setting/custom_channel/download');
  }


  // 取消
  doCancel(): void {
    this.isModalVisible = false;
  }

  // 确定
  doSave(): void {
    this.submitting = true;
    if (this.modalType === 'add') {
      this.defineSettingService.addCustomChannel({
        channel_name: this.customChannelName,
      }).subscribe(result => {
        if (result['status_code'] && result.status_code === 200) {
          this.message.success('添加成功！');
          this.refreshData(true);
          this.isModalVisible = false;
        } else {
          this.message.error(result.message);
        }
        this.submitting = false;
      }, (err) => {
        this.message.error('系统异常，请重试');
        this.submitting = false;
      }
      );
    } else if (this.modalType === 'edit') {
      this.defineSettingService.updateCustomChannel({
        channel_id: this.editChannelId,
        channel_name: this.customChannelName,
      }).subscribe(result => {
        if (result['status_code'] && result.status_code === 200) {
          this.refreshData(true);
          this.message.success('修改成功！');
          this.isModalVisible = false;
        } else {
          this.message.error(result.message);
        }
        this.submitting = false;
      }, (err) => {
        this.message.error('系统异常，请重试');
        this.submitting = false;
      }
      );
    }

  }

}
