import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {Router} from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import {ItemSelectService} from "../../../../module/item-select/service/item-select.service";
import {DataViewAddEditService} from "../../service/data-view-add-edit.service";

@Component({
  selector: 'app-batch-add-view',
  templateUrl: './batch-add-view.component.html',
  styleUrls: ['./batch-add-view.component.scss']
})
export class BatchAddViewComponent implements OnInit, OnChanges {

  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _http: DataViewAddEditService,
              private itemSelectService: ItemSelectService,
              private message: NzMessageService,
              private router: Router) {
    this.itemSelectService.getAccountLists( {}, {select_name: '', is_accurate: false}).subscribe(
      (result) => {
        this.publisherData = result;
      },
      (error) => {

      }
    );
  }
  public publisherData = [];
  public accountData = []; //账户数组
  public campaign = []; //计划数组
  public adgroupData = [] ; //单元数组
  public matchTypeData = [] ; //匹配模式数组
  public iswraing = false; //校验 false：不校验， true：提示校验

  public batchAddKeywordData = { //批量添加关键词需传的参数
    chan_pub_id : null,
    pub_account_id: null,  //账户
    publisher_id: null, //媒体
    pub_campaign_id : null, //计划 //必填
    pub_adgroup_id : null, // 单元
  };

  public inputValue: any;

  ngOnInit() {
  }

  changePublisher(itemData , is_batch): void {

    itemData.chan_pub_id = null;
    itemData.pub_account_id = null;
    itemData.pub_campaign_id = null;
    itemData.pub_adgroup_id = null;

    this.publisherData.forEach((item) => {

      if (item.publisher_id  === itemData.publisher_id) {
        this.accountData = item.detail;
        itemData.pub_account_id = item.detail[0].pub_account_id;
        itemData.chan_pub_id = item.detail[0].chan_pub_id;

        if ( is_batch ) {
          itemData.chan_pub_id = '';
          itemData.pub_account_id = '';
          this.accountData.splice(0, 0 , {
            pub_account_name : '在导入数据中指定',
            pub_account_id : ''
          });
        }

      }
    });
  }
  changeAccount( itemData , is_batch ): void {
    itemData.pub_campaign_id = null;
    itemData.pub_adgroup_id = null;
    this.accountData.forEach((accountItem) => {
      if (accountItem.pub_account_id === itemData.pub_account_id) {
        itemData.chan_pub_id = accountItem.chan_pub_id;
        itemData.pub_account_id = accountItem.pub_account_id;
        this.getCampaignListByAccount ({'chan_pub_id': accountItem.chan_pub_id , 'pub_account_id': accountItem.pub_account_id}, is_batch) ;
      }
    });
  }
  changeCampaign(itemData, is_batch ): void {
    itemData.pub_adgroup_id = '';
    this.itemSelectService.getAdgroupListByCampaign({
      'chan_pub_id': itemData.chan_pub_id,
      'pub_account_id': itemData.pub_account_id,
      'pub_campaign_id': itemData.pub_campaign_id
    }).subscribe(
      (result) => {
        this.adgroupData = result;
        if ( is_batch ) {
          this.adgroupData.splice(0, 0 , {
            pub_adgroup_name : '在导入数据中指定',
            pub_adgroup_id : ''
          });
        }
        this.batchAddKeywordData.pub_adgroup_id = this.adgroupData[0]['pub_adgroup_id'];
      }
    );
  }

  getCampaignListByAccount(body, is_batch) {
    this.itemSelectService.getCampaignListByAccount(body).subscribe(
      (result) => {
        this.campaign = result;
        if ( is_batch ) {
          this.campaign.splice(0, 0 , {
            pub_campaign_name : '在导入数据中指定',
            pub_campaign_id : ''
          });
        }
        this.batchAddKeywordData.pub_campaign_id = this.campaign[0]['pub_campaign_id'];
      },
      (error) => {

      }
    );
  }

  checkPage() {

  }
  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {
        this.is_saving.emit(true);

        /*this._http.addSinglePlan(this.addSinglePlanData).subscribe(
          (result: any) => {
            this.is_saving.emit(false);
            if (result.status_code === 200 ) {
              this.message.success("已成功加入任务队列，请稍后查看");
              this.router.navigateByUrl('/' + this.summaryType);
            } else if (result['status_code'] && result.status_code === 401) {
              this.message.error('您没权限对此操作！');
            } else if (result['status_code'] && result.status_code === 500) {
              this.message.error('系统异常，请重试');
            } else if (result['status_code'] && result.status_code === 205) {
            } else {
              this.message.error(result.message);
            }
          }, err => {
            this.is_saving.emit(false);
          }, () => {
            this.is_saving.emit(false);
          }
        );*/
      }


    }

  }
}
