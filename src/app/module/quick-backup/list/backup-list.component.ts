import {Component, Input, Output, EventEmitter, OnInit, HostListener, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {BackupService} from '../backup.service';

import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-backup-list',
  templateUrl: './backup-list.component.html',
  styleUrls: ['./backup-list.component.scss'],
  providers: [BackupService]
})

export class BackupListComponent {

  public showBackup = false;
  public submitCheck = 1;
  public loading = false;
  public taskListData = [];
  public total = 0;
  public currentPage = 1;
  public pageSize = 30;
  public noResultHeight = document.body.clientHeight - 247;

  public statusMap = {
    '0': '待处理',
    '1': '备份中',
    '2': '备份成功',
    '3': '部分失败',
    '4': '失败'
  };

  @ViewChild('quickEditButton') quickEditButton: any;

  constructor(

              private _message: NzMessageService ,
              private backupService:BackupService,
  ) {

  }


  showBackupList() {
    this.getOperationTaskList();
    this.showBackup= true;




  }

  closeBackupList() {
    this.showBackup= false;
  }


  getOperationTaskList() {
    this.loading = true;
    this.backupService
      .getBackupList( {
        page: this.currentPage,
        count: this.pageSize,
        // start_time: this.taskStartTime,
        // end_time: this.taskEndTime
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.taskListData = [];
            this.total = 0;
          } else {
            this.taskListData = results['data']['detail'];
            this.total = results['data']['detail_count'];
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
        },
        () => {}
      );
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this.getOperationTaskList();
  }

  delBackup(backupId) {
    this.backupService.delBackupById(backupId).subscribe(result=> {
      if(result.status_code !== 200) {
        this._message.error('删除失败，请重试');
      } else {
        this._message.success('删除成功');
        this.refreshData();
      }
    });
  }

  downBackup(backupId) {
    this.backupService.downLoadBackup(backupId).subscribe((results: any) => {
        if (results.status_code !== 200) {
          this._message.info('当前备份不可下载');
        } else {
          const cacheKey = results['data']['cache_key'];
          window.open(environment.SERVER_API_URL + '/files_down/' + cacheKey);
        }
      },
      (err: any) => {
        this._message.error('系统异常');
      },
      () => {
      }
    );
  }



}
