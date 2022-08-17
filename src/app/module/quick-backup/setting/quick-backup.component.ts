import {Component, Input, Output, EventEmitter, OnInit, HostListener, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {BackupService} from '../backup.service';

@Component({
  selector: 'app-quick-backup',
  templateUrl: './quick-backup.component.html',
  styleUrls: ['./quick-backup.component.scss'],
  providers: [BackupService]
})

export class QuickBackupComponent {

  @Input() parentData: any;
  @Output() isHidden = new EventEmitter();
  @Input() summary_type: any;
  @Input() selectedType: any;
  @Input() selected: any;
  @Input() pageInfo: any;
  @Input() viewTableData: any;

  public selectData = {
    selected_type:'current',
    selected_data:[],
    selected_data_ids:[],
    selected_length:0,
    allViewTableData:{}
  };

  public submitCheck = 1;

  @ViewChild('quickEditButton') quickEditButton: any;

  constructor(

              private _message: NzMessageService ,
              private backupService:BackupService,
  ) {

  }

  public summaryTypeName = {
    publisher: '媒体',
    account: '账户',
    campaign: '计划',
    adgroup: '单元',
    keyword: '关键词',
    creative: '创意',
    search_keyword: '搜索词',
    target: '定向'
  };

  public defaultPackUpSetting = {
    'levelOption':[
      { label: '帐户', value: '1',checked:true},
      { label: '计划', value: '2',checked:false },
      { label: '单元', value: '3',checked:false },
      { label: '关键词', value: '4',checked:false },
      { label: '创意', value: '5',checked:false },
    ],
    'backup_name':'备份',
    'is_split_account':'0',
  };

  public postSummaryIds = {
    "account":['chan_pub_id','pub_account_id'],
    "campaign":['chan_pub_id','pub_account_id','pub_campaign_id'],
    "adgroup":['chan_pub_id','pub_account_id','pub_adgroup_id'],
    "creative":['chan_pub_id','pub_account_id','pub_creative_id'],

  };

  public showBackupProp = false;

  getEditData() {
    if (this.selectedType === 'current' && this.selected.length) {
      this.selectData.selected_type = 'current';
      this.selectData.selected_data = this.selected;
      this.selectData.selected_length = this.selected.length;
      this.selectData.selected_data_ids = this.getEditDataIds(this.selected);
    } else if (this.selectedType === 'all' && this.pageInfo.allCount <= this.pageInfo.pageSize) {
      this.selectData.selected_type = 'current';
      this.selectData.selected_data = this.selected;
      this.selectData.selected_length = this.selected.length;
      this.selectData.selected_data_ids = this.getEditDataIds(this.selected);
    } else if (this.selectedType === 'all' && this.pageInfo.allCount > this.pageInfo.pageSize) {
      this.selectData.selected_type = 'all';
      this.selectData.selected_data = [];
      this.selectData.selected_length = this.pageInfo.allCount;
      this.selectData.selected_data_ids = [];
    }

    this.selectData.allViewTableData = this.viewTableData;
  }


  backupEdit() {
    this.getEditData();
    if (this.selected.length === 0) {
      this._message.error('请选择' + this.summaryTypeName[this.summary_type]);
      return;
    }
  }




  private getEditDataIds(data:any[]):any[] {
    const allItems = [];
    data.forEach((item)=> {
      const currentItem = [];
      this.postSummaryIds[this.summary_type].forEach((itemIds)=> {
        currentItem.push(item[itemIds]);
      });
      return allItems.push(currentItem.join("_"));
    });

    return allItems;
  }


  cancelBackup() {
    this.showBackupProp = false;
  }

  handBackup() {
    const postData= {
      "backup_name": this.defaultPackUpSetting.backup_name,
      "is_split_account": this.defaultPackUpSetting.is_split_account,
      "backup_level":[]
    };

    this.defaultPackUpSetting.levelOption.forEach(item=> {
      if(!!item.checked) {
          postData.backup_level.push(item.value);
      }
    });

    if(postData.backup_level.length<1) {
      this._message.error('请选择备份层级');
      return false;
    }


    postData["select_type"] = this.selectData.selected_type;
    postData["select_data_type"] = this.summary_type;
    postData["select_ids"] = this.selectData.selected_data_ids;
    if(this.selectData.selected_type == 'all') {
      postData['select_type'] = 'all';
      postData["sheets_setting"] = {'table_setting':this.selectData.allViewTableData};
    } else {
      postData['select_type'] = 'current';
    }
    this.backupService.backupRequest(postData).subscribe(result=> {
      if(result.status_code === 200) {
        this._message.success("已加入备份队列,请在备份队列查看");
        this.showBackupProp = false;
      } else {
        this._message.error(result.message);
      }
    },error => {
      this._message.error('系统异常，请重试');
    });


  }



}
