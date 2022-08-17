import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";
import { environment } from "../../../../../environments/environment";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { ManageService } from "../../service/manage.service";
import { isArray } from "@jzl/jzl-util";
import { select } from "@ngrx/store";

@Component({
  selector: 'app-rollback',
  templateUrl: './rollback.component.html',
  styleUrls: ['./rollback.component.scss'],
})
export class RollbackComponent implements OnInit, AfterViewInit {

  @Input() rowData;

  public disable = true;
  public showPop = false;

  public rollColumnList = [];
  public selectColumns = [];
  public operName = '关键词';


  public rollbackTypeList = ['single_update_account', 'batch_update_account', 'single_update_campaign', 'batch_update_campaign', 'single_update_adgroup', 'batch_update_adgroup', 'single_update_keyword', 'batch_update_keyword', 'single_update_creative', 'batch_update_creative'];

  public rollbackTypeListNameMap = {
    'single_update_account': '帐户',
    'batch_update_account': '帐户',
    'single_update_campaign': '计划',
    'batch_update_campaign': '计划',
    'single_update_adgroup': '单元',
    'batch_update_adgroup': '单元',
    'single_update_keyword': '关键词',
    'batch_update_keyword': '关键词',
    'single_update_creative': '创意',
    'batch_update_creative': '创意'
  };
  public rollbackTypeListOpTypeMap = {
    'single_update_account': 'account',
    'batch_update_account': 'account',
    'single_update_campaign': 'campaign',
    'batch_update_campaign': 'campaign',
    'single_update_adgroup': 'adgroup',
    'batch_update_adgroup': 'adgroup',
    'single_update_keyword': 'keyword',
    'batch_update_keyword': 'keyword',
    'single_update_creative': 'creative',
    'batch_update_creative': 'creative'
  };

  public rollbackTypeItem = [
    { key: 'pause', name: '推广状态', type: ['single_update_campaign', 'batch_update_campaign', 'single_update_adgroup', 'batch_update_adgroup', 'single_update_keyword', 'batch_update_keyword', 'single_update_creative', 'batch_update_creative'] },
    { key: 'budget', name: '预算', type: ['single_update_account', 'batch_update_account', 'single_update_campaign', 'batch_update_campaign',] },
    { key: 'maxPrice', name: '单元出价', type: ['single_update_adgroup', 'batch_update_adgroup'] },
    { key: 'negativeWords', name: '否定词', type: ['single_update_campaign', 'batch_update_campaign', 'single_update_adgroup', 'batch_update_adgroup'] },
    { key: 'exactNegativeWords', name: '精确否定词', type: ['single_update_campaign', 'batch_update_campaign', 'single_update_adgroup', 'batch_update_adgroup'] },
    // {key:'regionTarget',name:'地域',type:['single_update_campaign','batch_update_campaign']},
    // {key:'schedule',name:'时段',type:['single_update_campaign','batch_update_campaign']},
    { key: 'price', name: '出价', type: ['single_update_keyword', 'batch_update_keyword'] },
    { key: 'matchType', name: '匹配模式', type: ['single_update_keyword', 'batch_update_keyword'] },
    { key: 'excludeIp', name: 'IP排除', type: ['single_update_account', 'batch_update_account'] },
  ];


  constructor(private _message: NzMessageService,
    private manageService: ManageService,
    private authService: AuthService,
    private notifyService: NotifyService) { }

  ngOnInit() {

    if ((this.rowData.task_status == 2 || this.rowData.task_status == 3) && this.rollbackTypeList.indexOf(this.rowData.parent_task_type) > -1) {
      this.disable = false;
      this.operName = this.rollbackTypeListNameMap[this.rowData.parent_task_type];
      this.getColumnListByType(this.rowData);
    } else {
      this.disable = true;
    }


  }


  private getColumnListByType(rowData) {
    const dataType = rowData.parent_task_type;
    const tempColumn = [];
    const tempSelectColumn = isArray(rowData.modify_items) ? rowData['modify_items'] : [];
    const selectColumn = [];
    this.rollbackTypeItem.forEach(item => {
      if (item.type.indexOf(dataType) > -1) {
        if (tempSelectColumn.indexOf(item.key) > -1) {
          tempColumn.push({ name: item.name, value: item.key, disabled: false });
          selectColumn.push(item.key);
        } else {
          tempColumn.push({ name: item.name, value: item.key, disabled: true });
        }

      }
    });

    this.rollColumnList = [...tempColumn];
    this.selectColumns = [...selectColumn];
  }



  ngAfterViewInit(): void {

  }

  public cancel() {
    this.showPop = false;
  }

  public ok() {
    const body = {
      'cid': this.rowData['cid'],
      'task_id': this.rowData['task_id'],
      'columns': this.selectColumns
    };
    const userOperdInfo = this.authService.getCurrentAdminOperdInfo();
    this.manageService.rollbackTask(body, { cid: this.rowData['cid'], uid: userOperdInfo.select_uid }).subscribe(result => {
      if (result.status_code === 200) {
        const notifyData = [];
        this._message.success("已成功加入任务队列，请稍后查看");
        notifyData.push({ job_id: result['data'], cid: this.rowData['cid'], uid: userOperdInfo.select_uid, op_type: this.rollbackTypeListOpTypeMap[this.rowData.parent_task_type] });
        this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
      }
      this.showPop = false;

    }, error => {
      this._message.error('系统异常请重试');
    });
  }




}
