import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Router } from "@angular/router";
import { DataViewAddEditService } from "../../service/data-view-add-edit.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { ItemSelectService } from "../../../../module/item-select/service/item-select.service";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { MenuService } from "../../../../core/service/menu.service";

@Component({
  selector: 'app-add-campaign',
  templateUrl: './add-campaign.component.html',
  styleUrls: ['./add-campaign.component.scss']
})
export class AddCampaignComponent implements OnInit, OnChanges {
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
  public showCoefficient = false;
  public publisherData = [];
  public accountData = []; //账户数组
  public campaign = []; //计划数组
  public iswraing = false; //校验 false：不校验， true：提示校验
  public negative_words: any;
  public exact_negative_words: any;
  public negative_words_length = 0;
  public exact_negative_words_length = 0;

  public regionRadio = 1; //1：试用账户推广地域 2：指定地域
  public budgetRdio = 1;  //1:每日  2:不限定
  public budget: any; //每日预算值
  public date_void = false;
  public arear_void = false;
  public dateData: any;
  public regionData: any;


  public addSinglePlanData = { //添加单个计划
    'chan_pub_id': null,
    'pub_account_id': null,  //账户
    'publisher_id': null, //媒体
    "pub_campaign_name": "",
    "budget": null,
    "show_prob": 1, //1.优选 2.轮替
    "bid_prefer": 2, //1：pc   2：移动
    "device": 0, // 0 计算机+移动 1移动
    "negative_words": [],
    "exact_negative_words": [],
    "wap_price_ratio": null,
    "pc_price_ratio": null,
    "region_target": [], // 九枝兰的地域编码，填写空数组"[]"使用账户推广地域
    "schedule": [], //选填, 填写空数组"[]"：取消暂停时段，更新为全时段推广
    "pause": false,
    "schedule_price_factors": {//选填, 填写空数组"[]"：取消暂停时段，更新为全时段推广
      "is_add": false,
      "value": []
    },

  };
  public tips = {
    budget: false,
    pc_price_ratio: false,
    wap_price_ratio: false,
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
    const authUser = this.authService.getCurrentUser();
    this.showCoefficient = authUser.hasOwnProperty('factor_permission') && authUser['factor_permission'] == 1 && this.addSinglePlanData.publisher_id * 1 === 1;
  }

  changePublisher(itemData, is_batch): void {

    const authUser = this.authService.getCurrentUser();
    this.showCoefficient = authUser.hasOwnProperty('factor_permission') && authUser['factor_permission'] == 1 && itemData['publisher_id'] * 1 === 1;

    this.show_prob_init(itemData['publisher_id'] * 1);  // 计划的创意默认选中
    itemData.chan_pub_id = null;
    itemData.pub_account_id = null;

    this.publisherData.forEach((item) => {

      if (item.publisher_id === itemData.publisher_id) {
        this.accountData = item.detail;
        itemData.pub_account_id = item.detail[0].pub_account_id;
        itemData.chan_pub_id = item.detail[0].chan_pub_id;

      }
    });
  }

  changeAccount(itemData, is_batch): void {
    this.accountData.forEach((accountItem) => {
      if (accountItem.pub_account_id === itemData.pub_account_id) {
        itemData.chan_pub_id = accountItem.chan_pub_id;
        itemData.pub_account_id = accountItem.pub_account_id;
      }
    });
  }

  private show_prob_init(publisherId) {
    //创意展现方式 1:优选  2，轮替
    if (publisherId === 1) {
      this.addSinglePlanData.show_prob = 1;
    } else if (publisherId === 4) {
      this.addSinglePlanData.show_prob = 2;
    } else {
      this.addSinglePlanData.show_prob = null;
    }
  }



  checkPage() {
    this.tips.budget = false;
    this.tips.pc_price_ratio = false;
    this.tips.wap_price_ratio = false;
    this.tips.exact_negative_words = false;
    this.tips.negative_words = false;

    //媒体
    if (!this.addSinglePlanData['publisher_id']) {
      this.iswraing = true;
      return false;
    }
    //计划名称
    if (!this.addSinglePlanData.pub_campaign_name) {
      this.iswraing = true;
      return false;
    }
    //日预算

    if (this.budgetRdio === 1) {
      this.addSinglePlanData['budget'] = this.budget;
      if (!this.addSinglePlanData['budget']) {
        this.tips.budget = true;
        this.iswraing = true;
        return false;
      }
      if (this.addSinglePlanData['publisher_id'] * 1 === 4 && this.budget < 10) {
        this.tips.budget = true;
        this.iswraing = true;
        return false;
      }
      if (this.addSinglePlanData['publisher_id'] * 1 === 3 && this.budget < 30) {
        this.tips.budget = true;
        this.iswraing = true;
        return false;
      }
      if ((this.addSinglePlanData['publisher_id'] * 1 === 1 && this.addSinglePlanData['publisher_id'] * 1 === 2) && this.budget < 50) {
        this.tips.budget = true;
        this.iswraing = true;
        return false;
      }
    }
    if (this.budgetRdio === 2) {
      this.addSinglePlanData['budget'] = 0;
    }

    //360 和 搜狗 因为都是计算机优先，所以只有移动出价比例。
    if (this.addSinglePlanData['publisher_id'] * 1 !== 1) {
      this.addSinglePlanData.bid_prefer = 1;
    }

    //bid_prefer 1:pc 2:移动
    if (this.addSinglePlanData.bid_prefer === 2) {
      this.addSinglePlanData['wap_price_ratio'] = '';
    }
    if (this.addSinglePlanData.bid_prefer === 1) {
      this.addSinglePlanData['pc_price_ratio'] = '';
    }


    //计算机出价比例 (只有百度有)
    if (this.addSinglePlanData['publisher_id'] * 1 === 1 && this.addSinglePlanData.bid_prefer === 2) {

      if (!this.addSinglePlanData['pc_price_ratio'] && this.addSinglePlanData['pc_price_ratio'] !== 0) {
        this.tips.pc_price_ratio = true;
        this.iswraing = true;
        return false;
      }
      if (this.addSinglePlanData['pc_price_ratio'] < 0) {
        this.tips.pc_price_ratio = true;
        this.iswraing = true;
        return false;
      }
      if (this.addSinglePlanData['pc_price_ratio'] > 10.00) {
        this.tips.pc_price_ratio = true;
        this.iswraing = true;
        return false;
      }

    }


    //移动出价比例（百度  0~10.00，可保留小数点后两位）
    if (this.addSinglePlanData['publisher_id'] * 1 === 1 && this.addSinglePlanData.bid_prefer === 1) {
      if (!this.addSinglePlanData['wap_price_ratio'] && this.addSinglePlanData['wap_price_ratio'] !== 0) {
        this.tips.wap_price_ratio = true;
        this.iswraing = true;
        return false;
      }
      if (this.addSinglePlanData['wap_price_ratio'] < 0 || this.addSinglePlanData['wap_price_ratio'] > 10.00) {
        this.tips.wap_price_ratio = true;
        this.iswraing = true;
        return false;
      }
    }

    //移动出价比例（360， 0.1-0.9且保留一位小数）
    if (this.addSinglePlanData['publisher_id'] * 1 === 3) {
      if (!this.addSinglePlanData['wap_price_ratio']) {
        this.tips.wap_price_ratio = true;
        this.iswraing = true;
        return false;
      }
      if (this.addSinglePlanData['wap_price_ratio'] > 9.9 || this.addSinglePlanData['wap_price_ratio'] < 0.1) {
        this.tips.wap_price_ratio = true;
        this.iswraing = true;
        return false;
      }

      if (this.getPointAfterCount(this.addSinglePlanData['wap_price_ratio']) > 1) {
        this.tips.wap_price_ratio = true;
        this.iswraing = true;
        return false;
      }
    }


    //移动出价比例（搜狗，默认值为1.00，比例范围为0.10到100.00。）
    if (this.addSinglePlanData['publisher_id'] * 1 === 2) {
      if (!this.addSinglePlanData['wap_price_ratio']) {
        this.tips.wap_price_ratio = true;
        this.iswraing = true;
        return false;
      }
      if (this.addSinglePlanData['wap_price_ratio'] < 0.10 || this.addSinglePlanData['wap_price_ratio'] > 100.00) {
        this.tips.wap_price_ratio = true;
        this.iswraing = true;
        return false;
      }
    }

    this.addSinglePlanData.negative_words = this.getTextareaArray(this.negative_words);
    this.addSinglePlanData.exact_negative_words = this.getTextareaArray(this.exact_negative_words);


    //否定词
    if (this.addSinglePlanData['publisher_id'] * 1 !== 1 && this.addSinglePlanData.negative_words.length > this.tips.maxLength.negative_words[this.addSinglePlanData['publisher_id'] * 1]) {
      this.tips.negative_words = true;
      this.iswraing = true;
      return false;
    }

    //精确否定词
    if (this.addSinglePlanData['publisher_id'] * 1 !== 2 && this.addSinglePlanData.exact_negative_words.length > this.tips.maxLength.exact_negative_words[this.addSinglePlanData['publisher_id'] * 1]) {
      this.tips.exact_negative_words = true;
      this.iswraing = true;
      return false;
    }

    //推广地域(360无推广地域)
    if (this.addSinglePlanData['publisher_id'] * 1 !== 3) {
      if (this.regionRadio === 1) {
        this.addSinglePlanData.region_target = [];
      }
      if (this.regionRadio === 2) {
        this.arear_void = false;
        this.addSinglePlanData.region_target = this.regionData['region_lists'];
        if (!this.regionData['region_lists'].length) {
          this.iswraing = true;
          this.arear_void = true;
          return false;
        }
      }
    }


    //推广时段
    this.addSinglePlanData.schedule = this.dateData['dateData'];
    let count = 0;
    this.dateData['dateData'].forEach((item) => {
      item['hour'].forEach((hour) => {
        hour === 1 ? count++ : count = count;
      });
    });

    if (this.showCoefficient) {
      this.addSinglePlanData.schedule_price_factors.value = this.dateData['priceFactor'];
      this.addSinglePlanData.schedule_price_factors.is_add = true;
    } else {
      this.addSinglePlanData.schedule_price_factors.value = [];
      this.addSinglePlanData.schedule_price_factors.is_add = false;
    }



    // if (count === (24 * 7)) {
    //   this.addSinglePlanData.schedule = []; //全时段推广
    // }

    this.date_void = false;

    if (count === 0) {
      this.iswraing = true;
      this.date_void = true;
      return false;
    }

  }
  regionSelect(event) { //从地域组件中得到的地域数据
    this.regionData = event;
  }
  dateDate(event) { //从日期组件中得到的日期数据
    this.dateData = event;
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

  //判断小数点后几位数
  getPointAfterCount(number) {
    const stringArray = number.toString().split(".");
    return stringArray.length > 1 ? stringArray[1].length : 0;
  }

  changeInput(name) {
    this.tips[name] = false;
    if (name === 'accu_price_factor' || name === 'word_price_factor' || name === 'wide_price_factor') {
      this.tips['accuState'] = false;
    }
  }
  contentChange(name, value?) {
    this.tips.length[name] = this.getTextareaArray(value).length;
  }



  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {
        this.is_saving.emit(true);
        this._http.addSinglePlan(this.addSinglePlanData).subscribe(
          (result: any) => {
            const notifyData: any[] = [];
            const userOperdInfo = this.authService.getCurrentUserOperdInfo();

            this.is_saving.emit(false);
            if (result.status_code === 200) {
              this.message.success("已成功加入任务队列，请稍后查看");
              notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'campaign_add' });
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
          }
        );
      }


    }

  }
}
