import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Router } from "@angular/router";
import { DataViewAddEditService } from "../../service/data-view-add-edit.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { ItemSelectService } from "../../../../module/item-select/service/item-select.service";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { MenuService } from "../../../../core/service/menu.service";

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss']
})
export class AddGroupComponent implements OnInit, OnChanges {

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

  public operatingModel = [
    { "label": "ios", 'value': 1 },
    { "label": "Andriod", 'value': 2 },
    { "label": "其他平台", 'value': 4 }
  ];  //操作系统

  public publisherData = [];
  public accountData = []; //账户数组
  public campaign = []; //计划数组
  public iswraing = false; //校验 false：不校验， true：提示校验
  public negative_words: any;
  public exact_negative_words: any;
  public campaignInfo = {};
  public price_ratio = 1;
  public match_price_pause = false;
  public wap_price: number;
  public pc_price: number;

  public addSingleUnitData = { //添加单个单元
    /*"chan_pub_id": 38,
    "pub_account_id": 20135393,
    "publisher_id": 0,
    "pub_campaign_id": 87124184,*/
    "bid_prefer": 1, //所属计划的"出价优先" 1 pc 2 wap
    "pub_adgroup_name": "", //单元名称
    "max_price": null, //单元计算机出价
    "negative_words": [], //否定词
    "exact_negative_words": [], //精确否定词
    "wap_price_ratio": null, //移动出价比例
    "pc_price_ratio": null, //计算机出价比例
    "match_price_status": 1, //是否分匹配模式出价 1：关闭
    "accu_price_factor": null, //精确
    "word_price_factor": null, //短语
    "wide_price_factor": null, //广泛
    "ad_platform_os": [], //移动端操作系统，多选数组
    "pause": false
  };

  public tips = {
    max_price: false,
    pc_price_ratio: false,
    wap_price_ratio: false,
    accuState: false,

    accu_price_factor: false,
    word_price_factor: false,
    wide_price_factor: false,

    negative_words: false,
    exact_negative_words: false,

    length: {
      negative_words: 0,
      exact_negative_words: 0
    },
    maxLength: {
      negative_words: {
        2: 300,
        3: 200,
        4: 300
      },
      exact_negative_words: {
        2: 300,
        3: 400,
        4: 300
      }
    }

  };

  ngOnInit() {
  }

  changePublisher(itemData, is_batch): void {

    itemData.pub_account_id = null;
    itemData.pub_campaign_id = null;

    this.publisherData.forEach((item) => {

      if (item.publisher_id === itemData.publisher_id) {
        this.accountData = item.detail;
        itemData.pub_account_id = item.detail[0].pub_account_id;
        itemData.chan_pub_id = item.detail[0].chan_pub_id;

        //得到计划的 设备类型 bid_prefer
        if (itemData.publisher_id * 1 === 1) {
          this.showCampaign({
            'chan_pub_id': item.detail[0].chan_pub_id,
            'pub_account_id': item.detail[0].pub_account_id,
            'pub_campaign_id': item.detail[0].pub_campaign_id
          });
        }

        const index = is_batch ? 1 : 0;
        this.getCampaignListByAccount({ 'chan_pub_id': item.detail[index].chan_pub_id, 'pub_account_id': item.detail[index].pub_account_id }, is_batch);
      }
    });
  }
  changeAccount(itemData, is_batch): void {
    itemData.pub_campaign_id = null;
    this.accountData.forEach((accountItem) => {
      if (accountItem.pub_account_id === itemData.pub_account_id) {
        itemData.chan_pub_id = accountItem.chan_pub_id;
        itemData.pub_account_id = accountItem.pub_account_id;
        this.getCampaignListByAccount({ 'chan_pub_id': accountItem.chan_pub_id, 'pub_account_id': accountItem.pub_account_id }, is_batch);
      }
    });
  }
  changeCampaign(itemData, is_batch): void {

    //得到计划的 设备类型 bid_prefer
    if (itemData.publisher_id * 1 === 1) {
      this.showCampaign({
        'chan_pub_id': itemData.chan_pub_id,
        'pub_account_id': itemData.pub_account_id,
        'pub_campaign_id': itemData.pub_campaign_id
      });

    }
  }

  getCampaignListByAccount(body, is_batch) {
    this.itemSelectService.getCampaignListByAccount(body).subscribe(
      (result) => {
        this.campaign = result;
      },
      (error) => {

      }
    );
  }
  showCampaign(body) {
    this._http.showCampaign(body).subscribe(
      (result) => {
        if (result.status_code === 200) {
          this.campaignInfo = result.data;
          if (this.campaignInfo['bid_prefer'] === "1") { //pc优先
            this.price_ratio = 1;
            this.pc_price = this.campaignInfo['wap_price_ratio'];
          } else if (this.campaignInfo['bid_prefer'] === "2") { //计算机优先
            this.price_ratio = 1;
            this.wap_price = this.campaignInfo['pc_price_ratio'];
          }
          this.addSingleUnitData.bid_prefer = this.campaignInfo['bid_prefer'] * 1;
        }

      }
    );
  }

  checkPage() {
    this.tips.max_price = false;
    this.tips.pc_price_ratio = false;
    this.tips.wap_price_ratio = false;
    this.tips.accuState = false;

    this.tips.accu_price_factor = false;
    this.tips.word_price_factor = false;
    this.tips.wide_price_factor = false;

    this.tips.negative_words = false;
    this.tips.exact_negative_words = false;
    //媒体
    if (!this.addSingleUnitData['publisher_id'] || !this.addSingleUnitData['pub_campaign_id'] || !this.addSingleUnitData['pub_adgroup_name']) {
      this.iswraing = true;
      return false;
    }
    // 单元出价(百度、搜狗范围是0.01~999.99。360范围是0.3~999.99，神马范围是0.45~999.99.)
    if (!this.addSingleUnitData['max_price']) {
      this.tips.max_price = true;
      this.iswraing = true;
      return false;
    } else {
      if (this.addSingleUnitData['publisher_id'] * 1 === 1 || this.addSingleUnitData['publisher_id'] * 1 === 2) {
        if (this.addSingleUnitData['max_price'] < 0.01) {
          this.tips.max_price = true;
          this.iswraing = true;
          return false;
        }
        if (this.addSingleUnitData['max_price'] > 999.99) {
          this.tips.max_price = true;
          this.iswraing = true;
          return false;
        }
      }
      if (this.addSingleUnitData['publisher_id'] * 1 === 3) {
        if (this.addSingleUnitData['max_price'] < 0.3) {
          this.tips.max_price = true;
          this.iswraing = true;
          return false;
        }
        if (this.addSingleUnitData['max_price'] > 999.99) {
          this.tips.max_price = true;
          this.iswraing = true;
          return false;
        }
      }
      if (this.addSingleUnitData['publisher_id'] * 1 === 4) {
        if (this.addSingleUnitData['max_price'] < 0.45) {
          this.tips.max_price = true;
          this.iswraing = true;
          return false;
        }
        if (this.addSingleUnitData['max_price'] > 999.99) {
          this.tips.max_price = true;
          this.iswraing = true;
          return false;
        }
      }
    }

    //出价比例
    if (this.addSingleUnitData['publisher_id'] * 1 === 1) {
      //计算机出价比例
      if (this.campaignInfo['bid_prefer'] * 1 === 2 && this.price_ratio === 2) {
        if (!this.addSingleUnitData.pc_price_ratio && this.addSingleUnitData.pc_price_ratio !== 0) {
          this.tips.pc_price_ratio = true;
          this.iswraing = true;
          return false;
        }
        if (this.addSingleUnitData.pc_price_ratio < 0) {
          this.tips.pc_price_ratio = true;
          this.iswraing = true;
          return false;
        }

        if (this.addSingleUnitData.pc_price_ratio > 10) {
          this.tips.pc_price_ratio = true;
          this.iswraing = true;
          return false;
        }
      }
      //移动出价比例
      if (this.campaignInfo['bid_prefer'] * 1 === 1 && this.price_ratio === 2) {
        if (!this.addSingleUnitData.wap_price_ratio && this.addSingleUnitData.wap_price_ratio !== 0) {
          this.tips.wap_price_ratio = true;
          this.iswraing = true;
          return false;
        }
        if (this.addSingleUnitData.wap_price_ratio < 0) {
          this.tips.wap_price_ratio = true;
          this.iswraing = true;
          return false;
        }

        if (this.addSingleUnitData.wap_price_ratio > 10) {
          this.tips.wap_price_ratio = true;
          this.iswraing = true;
          return false;
        }

      }
    }

    if (this.addSingleUnitData['publisher_id'] * 1 === 4 && this.addSingleUnitData.ad_platform_os.length < 1) {
      //移动端操作系统
      this.iswraing = true;
      return false;
    }

    if (this.addSingleUnitData['publisher_id'] * 1 !== 4) { //媒体不为神马时，清空 移动端操作系统 数组
      this.addSingleUnitData.ad_platform_os = [];
    }

    //是否开启分匹配模式：0：开启  1：关闭
    this.match_price_pause ? this.addSingleUnitData.match_price_status = 0 : this.addSingleUnitData.match_price_status = 1;
    if (this.addSingleUnitData['publisher_id'] * 1 === 1 && this.match_price_pause) {
      //分匹配模式出价
      if (!this.addSingleUnitData['accu_price_factor'] || this.addSingleUnitData['accu_price_factor'] < 1 || this.addSingleUnitData['accu_price_factor'] > 10) {
        this.iswraing = true;
        this.tips.accu_price_factor = true;
        return false;
      }
      if (!this.addSingleUnitData['word_price_factor'] || this.addSingleUnitData['word_price_factor'] < 0.1 || this.addSingleUnitData['word_price_factor'] > 1.2) {
        this.iswraing = true;
        this.tips.word_price_factor = true;
        return false;
      }
      if (this.addSingleUnitData['wide_price_factor'] === '' || this.addSingleUnitData['wide_price_factor'] === null || this.addSingleUnitData['wide_price_factor'] < 0 || this.addSingleUnitData['wide_price_factor'] > 1) {
        this.iswraing = true;
        this.tips.wide_price_factor = true;
        return false;
      }
      if (this.addSingleUnitData['accu_price_factor'] < this.addSingleUnitData['word_price_factor'] || this.addSingleUnitData['accu_price_factor'] < this.addSingleUnitData['wide_price_factor']) {
        this.iswraing = true;
        this.tips.accuState = true;
        return false;
      }
      if (this.addSingleUnitData['word_price_factor'] > this.addSingleUnitData['accu_price_factor'] || this.addSingleUnitData['word_price_factor'] < this.addSingleUnitData['wide_price_factor']) {
        this.iswraing = true;
        this.tips.accuState = true;
        return false;
      }
      if (this.addSingleUnitData['wide_price_factor'] > this.addSingleUnitData['word_price_factor'] || this.addSingleUnitData['word_price_factor'] > this.addSingleUnitData['accu_price_factor']) {
        this.iswraing = true;
        this.tips.accuState = true;
        return false;
      }

    }

    this.addSingleUnitData.negative_words = this.getTextareaArray(this.negative_words);
    this.addSingleUnitData.exact_negative_words = this.getTextareaArray(this.exact_negative_words);

    //否定词
    if (this.addSingleUnitData['publisher_id'] * 1 !== 1 && this.addSingleUnitData.negative_words.length > this.tips.maxLength.negative_words[this.addSingleUnitData['publisher_id'] * 1]) {
      this.tips.negative_words = true;
      this.iswraing = true;
      return false;
    }

    //精确否定词
    if (this.addSingleUnitData['publisher_id'] * 1 !== 1 && this.addSingleUnitData.exact_negative_words.length > this.tips.maxLength.exact_negative_words[this.addSingleUnitData['publisher_id'] * 1]) {
      this.tips.exact_negative_words = true;
      this.iswraing = true;
      return false;
    }
  }

  changeInput(name) {
    this.tips[name] = false;
    if (name === 'accu_price_factor' || name === 'word_price_factor' || name === 'wide_price_factor') {
      this.tips['accuState'] = false;
    }
  }
  contentChange(name, value?) {
    // this.tips.length[value] = this._http.chkstrlen(value);
    this.tips.length[name] = this.getTextareaArray(value).length;
  }

  //将textarea内容转化为数组
  getTextareaArray(textareaString) {
    const textareaArray = [];
    if (textareaString) {
      textareaString.split('\n').forEach((item) => {
        if (item.match(/^\s+$/)) {
        } else if (item !== '') {
          textareaArray.push(item.replace(/(^\s*)|(\s*$)/g, ""));
        }
      });
    }

    return textareaArray;

  }

  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {
        this.is_saving.emit(true);

        this._http.addSingleUnit(this.addSingleUnitData).subscribe(
          (result: any) => {
            const notifyData: any[] = [];
            const userOperdInfo = this.authService.getCurrentUserOperdInfo();

            this.is_saving.emit(false);
            if (result.status_code === 200) {
              this.message.success("已成功加入任务队列，请稍后查看");
              notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'adgroup_add' });
              this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });

              this.router.navigateByUrl('/data_view/sem/group');
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
