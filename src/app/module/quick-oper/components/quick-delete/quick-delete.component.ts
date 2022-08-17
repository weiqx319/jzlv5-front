import {Component, Input, Output, EventEmitter, OnInit, HostListener, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {QuickOperService} from '../../service/quick-oper.service';
import {NotifyService} from '../../../notify/notify.service';
import {AuthService} from '../../../../core/service/auth.service';

@Component({
  selector: 'app-quick-delete',
  templateUrl: './quick-delete.component.html',
  styleUrls: ['./quick-delete.component.scss'],
  providers: [QuickOperService]
})

export class QuickDeleteComponent implements OnInit {

  @Input() parentData: any;
  @Output() isHidden = new EventEmitter();
  @Input() summary_type: any;
  @Input() selectedType: any;
  @Input() selected: any;
  @Input() pageInfo: any;
  @Input() viewTableData: any;
  @Input() channelId = 1;
  @Input() publisherId = 0;

  public selectData = {
    selected_type:'current',
    selected_data:[],
    selected_data_ids:[],
    selected_length:0,
    allViewTableData:{}
  };

  public submitCheck = 1;
  public modalIsVisible = false;
  public modelTitle = "";
  public modelContent = "";
  public isOkRequest = false;
  public modelCheckContent = "";
  public delDisabled = true;


  private summaryTypeLimit = {
    campaign: 10,
    adgroup: 20,
    keyword: 50000,
    creative: 500000,
  };

  @ViewChild('quickEditButton') quickEditButton: any;

  constructor(

              private _message: NzMessageService ,
              private quickDeleteService:QuickOperService,
              private notifyService: NotifyService,
              private  authService: AuthService,
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



  public postSummaryIds = {
    "account":['chan_pub_id','pub_account_id'],
    "campaign":['chan_pub_id','pub_account_id','pub_campaign_id'],
    "adgroup":['chan_pub_id','pub_account_id','pub_adgroup_id'],
    "keyword":['chan_pub_id','pub_account_id','pub_keyword_id'],
    'keyword_10': ['chan_pub_id', 'pub_account_id','pub_adgroup_id','pub_keyword_id'],
    'creative_10': ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id','pub_creative_id'],
    "creative":['chan_pub_id','pub_account_id','pub_creative_id'],

  };

  ngOnInit() {
    if(this.summary_type == 'keyword' || this.summary_type == 'creative' || (this.summary_type == 'campaign'&&this.publisherId==6)) {
      this.delDisabled = false;
    }
  }


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






  private getEditDataIds(data:any[]):any[] {
    const allItems = [];
    data.forEach((item)=> {
      const currentItem = [];
      if(item['publisher_id'] == 10) {
        this.postSummaryIds[this.summary_type+'_'+item['publisher_id']].forEach((itemIds)=> {
          currentItem.push(item[itemIds]);
        });
      } else {
        this.postSummaryIds[this.summary_type].forEach((itemIds)=> {
          currentItem.push(item[itemIds]);
        });
      }

      return allItems.push(currentItem.join("_"));
    });

    return allItems;
  }



  delData() {
    this.getEditData();
    if (this.selectData.selected_length === 0) {
      this._message.error('请选择' + this.summaryTypeName[this.summary_type]);
      return;
    }
    const currentLimit = this.summaryTypeLimit[this.summary_type];
    if(currentLimit!== undefined) {
      if(this.selectData.selected_length>currentLimit&&(this.summary_type !== 'campaign'||this.publisherId!=6)) {
        const errorMessage = '单次删除'+ this.summaryTypeName[this.summary_type]+"限制"+currentLimit+'条';
        this._message.error(errorMessage);
      } else {
        this.modelTitle = '删除'+ this.summaryTypeName[this.summary_type];
        this.modelContent = '您将删除'+ this.selectData.selected_length + '个' + this.summaryTypeName[this.summary_type]+",删除后不可恢复,请在下方输入“确认删除”";
        this.modalIsVisible = true;
      }
    } else {
      this._message.error('非法操作，当前层级不支持删除');
    }

  }

  handleCancel() {
      this.modelCheckContent = '';
      this.modalIsVisible = false;
  }


  handOk() {




    if(this.modelCheckContent == '确认删除') {

      const postData = {};
      postData["select_type"] = this.selectData.selected_type;
      postData["select_data_type"] = this.summary_type;
      postData["select_ids"] = this.selectData.selected_data_ids;
      if(this.selectData.selected_type == 'all') {
        postData['select_type'] = 'all';
        postData["sheets_setting"] = {'table_setting':this.selectData.allViewTableData};
      } else {
        postData['select_type'] = 'current';
      }

      this.isOkRequest = true;
      this.quickDeleteService.delData(this.summary_type,this.publisherId,this.channelId,postData).subscribe((result)=> {
        if (result['status_code'] === 200) {
          this._message.success("已成功加入任务队列，请稍后查看");
          const userOperdInfo = this.authService.getCurrentUserOperdInfo();
          const notifyData: any[] = [];
          notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'del_'+this.summary_type });
          this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});

          this.modalIsVisible = false;
          this.modelCheckContent = '';
          this.isOkRequest = false;


        } else {
          this.isOkRequest = false;
          this._message.error(result['message']);
        }
      },err=> {
        this._message.error("系统异常");
      });



    } else {
      this._message.error("输入有误，请重新确认");
    }


  }



}
