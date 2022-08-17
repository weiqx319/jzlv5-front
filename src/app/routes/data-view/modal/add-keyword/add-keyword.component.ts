import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DataViewAddEditService } from "../../service/data-view-add-edit.service";
import { ItemSelectService } from "../../../../module/item-select/service/item-select.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { MenuService } from "../../../../core/service/menu.service";

@Component({
  selector: 'app-add-keyword',
  templateUrl: './add-keyword.component.html',
  styleUrls: ['./add-keyword.component.scss']
})
export class AddKeywordComponent implements OnInit, OnChanges {

  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _http: DataViewAddEditService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private itemSelectService: ItemSelectService,
    private message: NzMessageService,
    private menuService: MenuService,
    private router: Router) {
    this.itemSelectService.getAccountLists({}, { select_name: '', is_accurate: false }).subscribe(
      (result) => {
        this.publisherData = result;
      },
      (error) => {

      }
    );
  }

  public singleKeywordData = {
    chan_pub_id: null,
    pub_account_id: null,  //账户
    publisher_id: null, //媒体
    pub_campaign_id: null, //计划 //必填
    pub_adgroup_id: null, // 单元  //必填
    pub_keyword: '', //关键词名称 //必填
    price: null, //出价
    pc_destination_url: '', //  pc //访问url
    wap_destination_url: '', //移动访问url
    match_type: null, // 匹配模式 //baidu 选填 其他媒体必填
    pause: false, //开启 暂停
    deeplink_url: '', //就用调起网址
  };
  public tips = {
    price: false,
    wap_destination_url: false, //移动访问url
    pc_destination_url: false, //访问url
    length: {
      wap_destination_url: 0,
      pc_destination_url: 0
    }

  };
  public publisherData = [];
  public accountData = []; //账户数组
  public campaign = []; //计划数组
  public adgroupData = []; //单元数组
  public matchTypeData = []; //匹配模式数组
  public iswraing = false; //校验 false：不校验， true：提示校验
  public errorMessage = '';

  ngOnInit() {
  }

  changePublisher(itemData, is_batch): void {

    itemData.pub_account_id = null;
    itemData.pub_campaign_id = null;
    itemData.pub_adgroup_id = null;
    itemData.pc_destination_url = ''; //清空访问Url

    this.publisherData.forEach((item) => {

      if (item.publisher_id === itemData.publisher_id) {
        this.accountData = item.detail;
        itemData.pub_account_id = item.detail[0].pub_account_id;
        itemData.chan_pub_id = item.detail[0].chan_pub_id;


        const index = is_batch ? 1 : 0;
        this.getCampaignListByAccount({ 'chan_pub_id': item.detail[index].chan_pub_id, 'pub_account_id': item.detail[index].pub_account_id }, is_batch);
        /*关键词的匹配模式*/
        switch (item.publisher_id) {
          case '1':
            this.matchTypeData = this._http.matchType_baidu;
            break;
          case '3':
            this.matchTypeData = this._http.Match_type_360;
            break;
          case '4':
            this.matchTypeData = this._http.match_type_shenma;
            break;
          case '2':
            this.matchTypeData = this._http.match_type_sougou;
            break;
        }

      }
    });
  }

  changeAccount(itemData, is_batch?): void {
    itemData.pub_campaign_id = null;
    itemData.pub_adgroup_id = null;
    this.accountData.forEach((accountItem) => {
      if (accountItem.pub_account_id === itemData.pub_account_id) {
        itemData.chan_pub_id = accountItem.chan_pub_id;
        itemData.pub_account_id = accountItem.pub_account_id;
        this.getCampaignListByAccount({ 'chan_pub_id': accountItem.chan_pub_id, 'pub_account_id': accountItem.pub_account_id }, is_batch);
      }
    });
  }

  changeCampaign(itemData, is_batch?): void {
    itemData.pub_adgroup_id = null;
    this.itemSelectService.getAdgroupListByCampaign({
      'chan_pub_id': itemData.chan_pub_id,
      'pub_account_id': itemData.pub_account_id,
      'pub_campaign_id': itemData.pub_campaign_id
    }).subscribe(
      (result) => {
        this.adgroupData = result;
      }
    );
  }

  getCampaignListByAccount(body, is_batch?) {
    this.itemSelectService.getCampaignListByAccount(body).subscribe(
      (result) => {
        this.campaign = result;
      },
      (error) => {

      }
    );
  }

  checkPage() {
    this.errorMessage = '';
    this.tips.price = false;
    this.tips.wap_destination_url = false;
    this.tips.pc_destination_url = false;
    if (!this.singleKeywordData['publisher_id'] || !this.singleKeywordData['pub_account_id'] ||
      !this.singleKeywordData['pub_campaign_id'] || !this.singleKeywordData['pub_adgroup_id'] ||
      !this.singleKeywordData.pub_keyword) {
      this.iswraing = true;
      return false;

    }
    //出价
    if (!this.singleKeywordData.price) {
      this.tips.price = true;
      this.iswraing = true;
      return false;
    } else {
      if (this.singleKeywordData.publisher_id * 1 === 1 || this.singleKeywordData.publisher_id * 1 === 2) {
        if (this.singleKeywordData.price < 0.01) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
        if (this.singleKeywordData.price > 999.99) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
      }
      if (this.singleKeywordData.publisher_id * 1 === 3) {
        if (this.singleKeywordData.price < 0.3) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
        if (this.singleKeywordData.price > 999.99) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
      }
      if (this.singleKeywordData.publisher_id * 1 === 4) {
        if (this.singleKeywordData.price < 0.45) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
        if (this.singleKeywordData.price > 999.99) {
          this.tips.price = true;
          this.iswraing = true;
          return false;
        }
      }
    }

    //匹配模式
    if (!this.singleKeywordData.match_type) {
      this.iswraing = true;
      return false;
    }
    //访问Url
    if (this.singleKeywordData.pc_destination_url && this._http.chkstrlen(this.singleKeywordData.pc_destination_url) > 1024) {
      this.tips.pc_destination_url = true;
      this.iswraing = true;
      return false;
    }

    //移动访问Url
    if (this.singleKeywordData.wap_destination_url && this._http.chkstrlen(this.singleKeywordData.wap_destination_url) > 1024) {
      this.tips.wap_destination_url = true;
      this.iswraing = true;
      return false;
    }
  }

  changeInput(name) {
    this.tips[name] = false;
  }

  contentChange(value) {
    this.tips.length[value] = this._http.chkstrlen(this.singleKeywordData[value]);
  }

  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {
        this.is_saving.emit(true);
        this._http.addSingleKeyword(this.singleKeywordData).subscribe(
          (result: any) => {
            const notifyData: any[] = [];
            const userOperdInfo = this.authService.getCurrentUserOperdInfo();

            this.is_saving.emit(false);
            if (result.status_code === 200) {
              this.message.success("已成功加入任务队列，请稍后查看");
              notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'keyword_add' });
              this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });

              this.router.navigateByUrl('/data_view/sem/' + this.summaryType);
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
        );
      }


    }

  }
}
