import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DataViewService} from "../../service/data-view.service";
import {ItemSelectService} from "../../../../module/item-select/service/item-select.service";
import {AuthService} from "../../../../core/service/auth.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {NotifyService} from "../../../../module/notify/notify.service";
import {MenuService} from "../../../../core/service/menu.service";
@Component({
  selector: 'app-add-words-modal',
  templateUrl: './add-words-modal.component.html',
  styleUrls: ['./add-words-modal.component.scss']
})
export class AddWordsModalComponent implements OnInit {
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();
  @Input() row;

  public accountPublishers: any; //账户媒体
  public accountList: any; //账户列表
  public unitList: any; //单元
  public compainList: any; //计划
  public matchTypeData: any; //匹配模式
  public addWordData = {
    pub_keyword: '', //关键词名称 //必填
    pause: false, //开启 暂停   false：开启
    chan_pub_id: null,
    pub_account_id: null,  //账户
    publisher_id: null, //媒体
    pub_campaign_id: null, //计划 //必填
    pub_adgroup_id: null, // 单元  //必填
    match_type: null, //
    price: null,
  };

  public negativeWordGroupList: any; //否词包
  public addNegativeData = {
    pub_query: '',
    chan_pub_id: null,
    pub_account_id: null,  //账户
    publisher_id: null, //媒体
    pub_campaign_id: null, //计划 //必填
    pub_adgroup_id: null, // 单元  //必填
    match_type: 1 // 1，短语否定 2，精确否定
  };

  public addNegativeWordGroupData = {
    is_add: 0, // 0，否 1，是
    group_id: null, // 否词包
  };
  public negativeKeywordLength = 0;

  constructor(
    public dataViewService: DataViewService,
    public itemSelectService: ItemSelectService,
    public authService: AuthService,
    public _message: NzMessageService,
    public notifyService: NotifyService,
    public menuService: MenuService,
  ) { }

  ngOnInit(): void {
    this.getAccountLists();
    this._getMatchTypeList(this.row.publisher_id);
  }

  _getMatchTypeList(publisher_id) {
    this.matchTypeData = this.dataViewService.matchTypes[publisher_id];
  }

  searchKeywordChange() {
    this.negativeKeywordLength = this.chkstrlen(this.addNegativeData.pub_query);
  }
  chkstrlen(str) {
    let strlen = 0;
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) { //如果是汉字，则字符串长度加2
        strlen += 2;
      } else {
        strlen++;
      }
    }
    return strlen;
  }

  getAccountLists() {
    this.itemSelectService.getAccountLists({}, { select_name: '', is_accurate: false }).subscribe(
      (result) => {
        this.accountPublishers = result;
      },
      (error) => {

      },
    );
  }

  changePublisher(itemData): void {

    itemData.pub_account_id = null;
    itemData.pub_campaign_id = null;
    itemData.pub_adgroup_id = null;

    this.accountPublishers.forEach((item) => {

      if (item.publisher_id * 1 === itemData.publisher_id * 1) {
        this.accountList = item.detail;
        itemData.pub_account_id = item.detail[0].pub_account_id;
        itemData.chan_pub_id = item.detail[0].chan_pub_id;

        this.getCampaignListByAccount({ chan_pub_id: item.detail[0].chan_pub_id, pub_account_id: item.detail[0].pub_account_id });
      }
    });
  }

  changeAccount(itemData): void {
    itemData.pub_campaign_id = null;
    itemData.pub_adgroup_id = null;
    this.accountList.forEach((accountItem) => {
      if (accountItem.pub_account_id * 1 === itemData.pub_account_id * 1) {
        itemData.chan_pub_id = accountItem.chan_pub_id;
        itemData.pub_account_id = accountItem.pub_account_id;
        this.getCampaignListByAccount({ chan_pub_id: accountItem.chan_pub_id, pub_account_id: accountItem.pub_account_id });
      }
    });
  }

  changeCampaign(itemData, addType?): void {
    itemData.pub_adgroup_id = null;
    this.itemSelectService.getAdgroupListByCampaign({
      chan_pub_id: itemData.chan_pub_id,
      pub_account_id: itemData.pub_account_id,
      pub_campaign_id: itemData.pub_campaign_id,
    }).subscribe(
      (result) => {
        this.unitList = result;
        if (addType && addType === 'addNegativeData') {
          this.unitList.splice(0, 0, {
            pub_adgroup_name: '请选择单元',
            pub_adgroup_id: '',
          });
        }

      },
    );
  }

  getCampaignListByAccount(body) {
    this.itemSelectService.getCampaignListByAccount(body).subscribe(
      (result) => {
        this.compainList = result;
      },
      (error) => {

      },
    );
  }

  addWord(row, $event) {
    row['addPadding'] = window.document.body.clientHeight - $event.clientY < 150;
    this.addWordData.pub_keyword = row.pub_query;
    this.addWordData.publisher_id = row.publisher_id * 1;
    // this.changePublisher(this.addWordData);
    this.accountPublishers.forEach((item) => {
      if (this.addWordData.publisher_id * 1 === item.publisher_id * 1) {
        this.accountList = item.detail;
      }
    });

    this.addWordData.chan_pub_id = row.chan_pub_id;
    this.addWordData.pub_account_id = row.pub_account_id.toString();
    this.addWordData.pub_campaign_id = row.pub_campaign_id.toString();
    this.getCampaignListByAccount({ chan_pub_id: this.addWordData.chan_pub_id, pub_account_id: this.addWordData.pub_account_id });
    this.changeCampaign(this.addWordData);
    this.addWordData.pub_adgroup_id = row.pub_adgroup_id.toString();
    this.addWordData.match_type = this.matchTypeData[0].value;
    this.addWordData['pub_keyword_id'] = row.pub_keyword_id;
    row['showAddWord'] = true;

  }

  clickKeyCancel(row) {
    row['showAddWord'] = false;
    row['addPadding'] = false;
    this.is_saving.emit('OnCancel');
  }

  clickKeyOk(row) {
    if (!this.addWordData.pub_campaign_id) {
      this._message.error('请选择'+(this.menuService.currentPublisherId==17?'推广组':'计划'));
      return false;
    }
    if (!this.addWordData.pub_adgroup_id) {
      this._message.error('请选择'+(this.menuService.currentPublisherId==17?'计划':'单元'));
      return false;
    }
    this.dataViewService.addSingleKeyword(this.addWordData).subscribe(
      (result: any) => {
        if (result.status_code === 200) {
          this._message.success("已成功加入任务队列，请稍后查看");
          row['showAddWord'] = false;
          this.is_saving.emit('OnOk');
        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this._message.error(result.message);
        }
      }, (err) => {

      }, () => {

      },
    );

  }

  addNegative(row, $event) {
    row['addPadding'] = window.document.body.clientHeight - $event.clientY < 150;
    this.addNegativeData.pub_query = row.pub_query;
    this.searchKeywordChange();
    this.addNegativeData.publisher_id = row.publisher_id * 1;
    this.accountPublishers.forEach((item) => {
      if (this.addNegativeData.publisher_id * 1 === item.publisher_id * 1) {
        this.accountList = item.detail;
      }
    });
    this.addNegativeData.chan_pub_id = row.chan_pub_id;
    this.addNegativeData.pub_account_id = row.pub_account_id.toString();
    this.addNegativeData.pub_campaign_id = row.pub_campaign_id.toString();
    this.getCampaignListByAccount({ chan_pub_id: this.addNegativeData.chan_pub_id, pub_account_id: this.addNegativeData.pub_account_id });

    this.changeCampaign(this.addNegativeData, 'addNegativeData');
    this.addNegativeData.pub_adgroup_id = row.pub_adgroup_id.toString();

    this.addNegativeWordGroupData.is_add = 0;
    this.addNegativeWordGroupData.group_id = null;

    row['showNegative'] = true;
  }

  clickNagativeCancel(row) {
    row['showAddNagative'] = false;
    this.is_saving.emit('OnCancel');
  }

  clickNagativeOk(row) {

    if (!this.addNegativeData.pub_query) {
      this._message.error('否定关键词不能为空');
      return false;
    }
    if (this.negativeKeywordLength > 40) {
      this._message.error('否定关键词不能超过40个字符');
      return false;
    }
    if (!this.addNegativeData.pub_campaign_id) {
      this._message.error('请选择'+(this.menuService.currentPublisherId==17?'推广组':'计划'));
      return false;
    }

    // 加入否词库
    if (this.addNegativeWordGroupData.is_add === 1 && !this.addNegativeWordGroupData.group_id) {
      this._message.error('请选择否词包');
      return false;
    }

    if (!this.addNegativeData.pub_adgroup_id) { //没有选择单元

      const body = {
        select_type: 'current',
        pub_campaign_ids: [this.addNegativeData.chan_pub_id + "_" + this.addNegativeData.pub_account_id + "_" + this.addNegativeData.pub_campaign_id],
        negative_words: {
          is_edit: true,
          edit_type: 'add',
          value: [],
        },
        negative_querys: {
          is_edit: true,
          edit_type: 'add',
          value: [],
        },

      };
      if (this.addNegativeData.match_type === 1) { //短语否定
        body.negative_words.is_edit = true;
        body.negative_words.value = [this.addNegativeData.pub_query];
      } else { //精确否定
        body.negative_querys.is_edit = true;
        body.negative_querys.value = [this.addNegativeData.pub_query];
      }
      this.editCampaign(body, 'batch', row);
    } else { //选了单元

      const body = {
        select_type: 'current',
        pub_adgroup_ids: [this.addNegativeData.chan_pub_id + "_" + this.addNegativeData.pub_account_id + "_" + this.addNegativeData.pub_adgroup_id],
        negative_words: {
          is_edit: true,
          edit_type: 'add',
          value: [],
        },
        negative_querys: {
          is_edit: true,
          edit_type: 'add',
          value: [],
        },
      };
      if (this.addNegativeData.match_type === 1) { //短语否定
        body.negative_words.is_edit = true;
        body.negative_words.value = [this.addNegativeData.pub_query];
      } else { //精确否定
        body.negative_querys.is_edit = true;
        body.negative_querys.value = [this.addNegativeData.pub_query];
      }
      this.editAdgroup(body, 'batch', row);
    }

    // 加入否词库
    if (this.addNegativeWordGroupData.is_add === 1) {
      const postBody = {
        word_type: this.addNegativeData.match_type,
        word_name: [this.addNegativeData.pub_query],
        group_id: this.addNegativeWordGroupData.group_id,
      };

      this.dataViewService.createNegativeWord(postBody).subscribe(data => {
        if (data['status_code'] && data.status_code === 200) {
          this._message.success('加入否词库成功');
          this.is_saving.emit('OnOk');
        } else if (data['status_code'] && data.status_code === 205) {

        } else {
          this._message.error('加入否词库失败');
        }
      }, (err) => {
        this._message.error('系统异常，加入否词库失败');
      }, () => {
      });
    }
  }

  editCampaign(data, edit_type, row) {
    this.dataViewService.editCampaign(this.menuService.currentPublisherId,data, edit_type).subscribe(
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
          row['showAddNagative'] = false;
          notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'campaign' });
          this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
          this.is_saving.emit('OnOk');

        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this._message.error(result.message);
        }
      }, (err) => {
      }, () => {
      },
    );
  }

  editAdgroup(data, edit_type, row?) {

    this.dataViewService.editAdgroup(this.menuService.currentPublisherId,data, edit_type).subscribe(
      (result: any) => {
        if (row) {
          row['saveing'] = false;
          row['showBudgetBtn'] = false;
          row['showBudget'] = false;
        }
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();
        if (result.status_code === 200) {
          this._message.success("已成功加入任务队列，请稍后查看");
          row['showAddNagative'] = false;
          notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'adgroup' });
          this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });
          this.is_saving.emit('OnOk');
        } else if (result['status_code'] && result.status_code === 401) {
          this._message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this._message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this._message.error(result.message);
        }
      }, (err) => {

      }, () => {

      },
    );
  }


}
