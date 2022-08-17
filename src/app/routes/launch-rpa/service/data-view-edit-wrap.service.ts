import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";
import {Observable} from "rxjs";
import {DataViewService} from "./data-view.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {TableItemFeedService} from "../../../module/table-setting/service/table-item-feed.service";
import {ItemSelectService} from "../../../module/item-select/service/item-select.service";
import {ReportService} from "../../report-feed/service/report.service";
import {AuthService} from "../../../core/service/auth.service";
import {NotifyService} from "../../../module/notify/notify.service";
import {map} from 'rxjs/operators';





@Injectable()
export class DataViewEditWrapService {

  public channel_id = 2;

  constructor(private _httpClient: HttpClientService,
              private dataViewService: DataViewService,
              private tableService: TableItemFeedService,
              private itemSelectService: ItemSelectService,
              private reportService: ReportService,
              private authService: AuthService,
              private _message: NzMessageService,
              private modalService: NzModalService,
              private notifyService: NotifyService, ) {

  }



  editAccount(publisher_id, data, edit_type, row?): Observable<boolean>  {
    return this.dataViewService.editAccount( publisher_id , data, edit_type).map(
      (result: any) => {
        if (row) {
          row['saveing'] = false;
          row['showBudgetBtn'] = false;
          row['showBudget'] = false;
        }
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();

        if (result.status_code === 200 ) {
          this._message.success("已成功加入任务队列，请稍后同步账户查看", {nzDuration: 5000});
          notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'account' });
          this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});
          return true;
        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
          return false;
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
          return false;
        } else {
          this._message.error(result.message);
          return false;
        }
      }
    );
  }

  editCampaign(publisher_id, data, edit_type, row?): Observable<boolean> {
    return this.dataViewService.editCampaign(publisher_id, data, edit_type)
      .pipe(
        map(
          (result: any) => {
            if (row) {
              row['saveing'] = false;
              row['showBudgetBtn'] = false;
              row['showPriceRatioPC'] = false;
              row['showPriceRatioPCBtn'] = false;
              row['showPriceRatioWap'] = false;
              row['showPriceRatioWapBtn'] = false;
            }
            const notifyData: any[] = [];
            const userOperdInfo = this.authService.getCurrentUserOperdInfo();
            if (result.status_code === 200) {
              this._message.success("已成功加入任务队列，请稍后查看");
              notifyData.push({
                job_id: result['data']['job_id'],
                cid: userOperdInfo.select_cid,
                uid: userOperdInfo.select_uid,
                op_type: 'campaign'
              });
              this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});
              return true;

            } else if (result['status_code'] && result.status_code === 401) {
              this._message.error('您没权限对此操作！');
              return false;
            } else if (result['status_code'] && result.status_code === 500) {
              this._message.error('系统异常，请重试');
              return false;
            } else {
              this._message.error(result.message);
              return false;
            }
          }
        ));
  }
  editAdgroup(publisher_id, data, edit_type, row?): Observable<boolean>  {

    return this.dataViewService.editAdgroup(publisher_id, data, edit_type).pipe(map(
      (result: any) => {
        if (row) {
          row['saveing'] = false;
          row['showBudgetBtn'] = false;
          row['showBudget'] = false;
        }
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();
        if (result.status_code === 200 ) {
          this._message.success("已成功加入任务队列，请稍后查看");
          notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'adgroup' });
          this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});
          return true;
        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
          return false;
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
          return false;
        } else {
          this._message.error(result.message);
          return false;
        }
      }
    ));
  }

  editAdgroupTarget(publisher_id, data, edit_type, row?): Observable<boolean>  {

    return this.dataViewService.editAdgroupTarget(publisher_id, data, edit_type).pipe(map(
      (result: any) => {
        if (row) {
          row['saveing'] = false;
          row['showBudgetBtn'] = false;
          row['showBudget'] = false;
        }
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();
        if (result.status_code === 200 ) {
          this._message.success("已成功加入任务队列，请稍后查看");
          notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'adgroup' });
          this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});
          return true;
        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
          return false;
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
          return false;
        } else {
          this._message.error(result.message);
          return false;
        }
      }
    ));
  }
  editCreative(publisher_id, data, edit_type, row?): Observable<boolean> {
    if (row) {
      row['saveing'] = true;
    }
    const notifyData: any[] = [];
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    return this.dataViewService.editCreative(publisher_id, data, edit_type).pipe(map(
      (result: any) => {
        if (row) {
          row['saveing'] = false;
          row['showPriceBtn'] = false;
          row['showMatchTypeBtn'] = false;
        }
        if (result.status_code === 200 ) {
          this._message.success("已成功加入任务队列，请稍后查看");
          notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'creative' });
          this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});
          if (row) {
            row['showEditPrice'] = false;
            row['showEditMatchType'] = false;
          }
          return true;

        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
          return false;
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
          return false;
        } else {
          this._message.error(result.message);
          return false;
        }
      }
    ));
  }


}
