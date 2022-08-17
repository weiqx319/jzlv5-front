import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {HttpEvent, HttpEventType, HttpResponse} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";
import {AuthService} from "../../../../core/service/auth.service";
import {NotifyService} from "../../../../module/notify/notify.service";
import {DataViewService} from "../../service/data-view.service";

@Component({
  selector: 'app-sync-creative',
  templateUrl: './sync-creative.component.html',
  styleUrls: ['./sync-creative.component.scss'],
  providers:[DataViewService]
})
export class SyncCreativeComponent implements OnInit, AfterViewInit {

  @Input() parentData: any;
  @Input() summaryType: any;
  @Input() selectedType: any = 'current';
  @Input() selected: any = [];
  @Input() pageInfo: any;
  @Input() publisherId: any;
  @Input() viewTableData: any;


  public selectData = {
    selected_type:'current',
    selected_data:[],
    selected_data_ids:[],
    selected_length:0,
    allViewTableData:{}
  };


  public postSummaryIds = {
    "account":['chan_pub_id','pub_account_id'],
    "campaign":['chan_pub_id','pub_account_id','pub_campaign_id'],
    "adgroup":['chan_pub_id','pub_account_id','pub_adgroup_id'],
    "creative":['chan_pub_id','pub_account_id','pub_creative_id'],
  };

  constructor(private _message: NzMessageService,
              private dataViewService:DataViewService,
              private  authService: AuthService,
              private notifyService: NotifyService) { }

  ngOnInit() {
    this.getEditData();

  }

  getEditData() {
    if (this.selectedType === 'current' && this.selected.length) {
      this.selectData.selected_type = 'current';
      this.selectData.selected_data = this.selected;
      this.selectData.selected_length = this.selected.length;
      this.selectData.selected_data_ids = this.getEditDataIds(this.selected);
    } else if (this.selectedType === 'all') {
      this.selectData.selected_type = 'all';
      this.selectData.selected_data = [];
      this.selectData.selected_length = this.pageInfo.allCount;
      this.selectData.selected_data_ids = [];
    }
    this.selectData.allViewTableData = this.viewTableData;
  }


  private getEditDataIds(data:any[]):any[] {
    const allItems = [];
    data.forEach((item)=> {
      const currentItem = [];
      this.postSummaryIds[this.summaryType].forEach((itemIds)=> {
        currentItem.push(item[itemIds]);
      });
      return allItems.push(currentItem.join("_"));
    });
    return allItems;
  }



  syncTip() {
    this._message.error('请选择创意');
  }

  doSync() {
    if(this.selectedType === 'all') {
      if(this.pageInfo.allCount>500000) {
        this._message.success("您所选的数据范围超过50W,请在帐户层级下载更新");
        return '';
      }
    }


    this.getEditData();
    const postBody = {
      select_type:this.selectData.selected_type,
      select_data:this.selectData.selected_data_ids,
    };

    if(this.selectData.selected_type == 'all') {
      postBody["sheets_setting"] = { 'table_setting': this.selectData.allViewTableData};
    }
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    this.dataViewService.syncCreative(postBody).subscribe((result)=> {
      if (result.status_code === 200 ) {
        this._message.success("已成功加入任务队列，请稍后查看");
        const notifyData = [];
        notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'sync_creative' });
        this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});
      } else if (result['status_code'] && result.status_code === 401) {
        this._message.error('您没权限对此操作！');
      } else if (result['status_code'] && result.status_code === 500) {
        this._message.error('系统异常，请重试');
      } else if (result['status_code'] && result.status_code === 205) {
      } else {
        this._message.error(result.message);
      }
    },(error)=> {
      this._message.error('系统异常，请重试');
    });
  }


  ngAfterViewInit(): void {

  }


}
