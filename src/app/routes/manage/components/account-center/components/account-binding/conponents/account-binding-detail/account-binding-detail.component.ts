import { Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AccountBindingModalComponent } from "../../../../../../modal/account-binding-modal/account-binding-modal.component";
import { ManageItemService } from "../../../../../../service/manage-item.service";
import { ManageService } from "../../../../../../service/manage.service";

import { Store } from "@ngrx/store";
import { isArray, isNumber, isObject, isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../../../../../core/service/auth.service";
import { AppState } from "../../../../../../../../core/store/app.state";
import { NotifyService } from "../../../../../../../../module/notify/notify.service";
import { CustomDatasService } from "../../../../../../../../shared/service/custom-datas.service";
import { AccountBindingChannelNoAccountComponent } from "../../../../../../modal/account-binding-channel-no-account/account-binding-channel-no-account.component";
import { AccountBindingMultiChannelComponent } from "../../../../../../modal/account-binding-multi-channel/account-binding-multi-channel.component";
import { AccountBindingSetPasswordComponent } from "../../../../../../modal/account-binding-set-password/account-binding-set-password.component";
import { AccountBindingUploadCompensateComponent } from "../../../../../../modal/account-binding-upload-compensate/account-binding-upload-compensate.component";
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

import { differenceInCalendarDays, format } from "date-fns";
import { formatDate } from "@jzl/jzl-util";
import { DefineSettingService } from "../../../../../../service/define-setting.service";

@Component({
  selector: 'app-account-binding-detail',
  templateUrl: './account-binding-detail.component.html',
  styleUrls: ['./account-binding-detail.component.scss']
})
export class AccountBindingDetailComponent implements OnInit {
  @ViewChild('formulaContentNew') formulaContentNew: TemplateRef<any>;
  @ViewChild('adBidMaxContent') adBidMaxContent: TemplateRef<any>;
  @ViewChild('commissionContent') commissionContent: TemplateRef<any>;
  @ViewChild('batchUserList') batchUserList: TemplateRef<any>;
  @ViewChild('batchAdList') batchAdList: TemplateRef<any>;
  @ViewChild('attributionChannelContent') attributionChannelContent: TemplateRef<any>;
  @ViewChild('attributionPublisherContent') attributionPublisherContent: TemplateRef<any>;

  public allChannels = [];
  public allPublishers = [];
  public batchEditValue = '';
  public batchEditOptions = [
    { label: '分配用户', value: 'user' },
    { label: '分配广告主', value: 'ad' },
    { label: '设置返点公式', value: 'discountFormula' },
    { label: '设置佣金比例', value: 'commission' },
    { label: '设置广告最高出价限制', value: 'adBidMax' },
    { label: '设置数据归属渠道', value: 'attributionChannel' },
    { label: '设置数据归属媒体', value: 'attributionPublisher' },
    // { label: '设置账户维度标签值', value: 'accountDimension' },
    // { label: '导入赔付消耗/媒体返货', value: 'compensate' },

  ];

  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;
  public authPageInfo = {
    total: 0,
    currentPage: 1,
    pageSize: 10
  };
  logFilterResult = {
    log_type: {},
  };
  public logTypeOptionList = [
    { key: 1, name: '新增' },
    { key: 2, name: '删除' },
    { key: 3, name: '修改' },
    { key: 4, name: '无效账户' },
    { key: 5, name: '修改密码' },
  ];

  public publisherTypeRelation: object;
  public channelRelation: object;
  public noResultHeight = document.body.clientHeight - 310;

  public discountLogList = [];
  public radioValueNew = '1';
  public radioValueCommission = '1';
  public formulaContentNewArr = [
    {
      sdate: "",
      edate: "",
      discount_rate_formula: "",
      limitSdate: "string",
      limitEdate: "string"
    },
  ];
  public commissionContentNewArr = [
    {
      sdate: "",
      edate: "",
      commission_rate_formula: "",
      limitSdate: "string",
      limitEdate: "string"
    },
  ];
  public filterAccountStatusOption = [];
  public filterPublisherOption = [];
  public filterChannelOption = [
    {
      name: '搜索推广',
      key: 1,
    },
    {
      name: '信息流',
      key: 2,
    },
    {
      name: '应用市场',
      key: 3,
    },
  ];
  public advertiserList = [];
  public keeperList = [];

  public discountEdit = {
    discount: 0,
    discountFormula: "",
  };
  public discountEditNew = {
    discount_rate_formula: ""
  };
  public commissionEditNew = {
    commission_rate_formula: ""
  };
  public updating = false;

  // filter_key = {
  //   role_id: {name: '角色', filter_type: 'single_select'},
  //   status: {name: '状态', filter_type: 'single_select'}
  // };
  filterResult = {
    pub_account_name: {},
    account_label: {},
    account_comment: {},
    account_status: {},
    publisher_id: {},
    cid: {},
    channel_id: {},
    user_id: {},
    department: {},
    attribution_publisher: {},
    attribution_channel: {},
  };
  filter_result_array = [];

  filter_key = {
    account: { name: '账户名称', filter_type: 'string' },
    status: { name: '状态', filter_type: 'single_select' },
    publisher_id: { name: '媒体', filter_type: 'single_select' },
    advertiser: { name: '广告主', filter_type: 'single_select' },
    user_id: { name: '所属用户', filter_type: 'single_select' }
  };
  filter = {
    account: {
      op: '=',
      value: '',
    },
    publisher_id: {
      op: '=',
      value: '',
    },
    status: {
      op: '=',
      value: '',
    },
    advertiser: {
      op: '=',
      value: '',
    },
    user_id: {
      op: '=',
      value: '',
    }
  };
  // filter_result_array = [];
  status_value = {
    0: '无效',
    1: '有效',
  };
  publisher_id_value = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马',
  };
  advertisers = [
    { advertiser_id: 1, advertiser_name: '广告主1' },
    { advertiser_id: 2, advertiser_name: '广告主2' },
    { advertiser_id: 3, advertiser_name: '广告主3' },
    { advertiser_id: 4, advertiser_name: '广告主5' },
  ];
  advertiser_value = {};

  show_type = 'hasAccount';
  public companyId: any;
  private updateModal = null;
  public userListVisible = false;
  private userListModal = null;
  public isSetDiscount = false;
  public userList = [];

  public user_id = null;
  public chan_pub_id = null;
  public advertiser_id = null;

  public useUserIdList = [];

  // 账户标签列表
  public accountLabelList = [];
  public adBidMax = null;//广告最大出价
  public editAdBidMaxType = '';//广告最大出价
  public allGdt = false;//选中项媒体全部是广点通的
  public attribution_channel = null;//数据归属渠道
  public attribution_publisher = null;//数据归属媒体


  @ViewChild('noResultTd') tdNode: ElementRef;

  authState$ = this.store$.select((s) => s.auth);
  constructor(
    private manageService: ManageService,
    private defineSettingService: DefineSettingService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private notifyService: NotifyService,
    private authService: AuthService,
    private store$: Store<AppState>,
    private route: ActivatedRoute,
    private customDataService: CustomDatasService,
  ) {
    this.route.data.subscribe((data) => {
      this.show_type = data['showType'];
    });
    this.customDataService.dealPublisherNewData().then(() => {
      this.publisherTypeRelation = { ...this.customDataService.publisherNewMapObjKey };
      this.filterPublisherOption = [...this.customDataService.publisherNewList];
      this.allPublishers = [...this.customDataService.publisherNewArray];
    });

    this.customDataService.dealChannelData().then(() => {
      this.channelRelation = { ...this.customDataService.channelMapObjKey };
      this.filterChannelOption = [...this.customDataService.channelList];
      this.allChannels = [...this.customDataService.channelArray];
    });
    this.filterAccountStatusOption = manageItemService.AccountStatusList;
    this.companyId = this.authService.getCurrentUser().company_id;

    const queryAccountStatus = this.route.snapshot.queryParams['account_status'];
    if (queryAccountStatus === "-1") {
      this.filterResult.account_status = {
        "key": "account_status",
        "name": "状态",
        "type": "singleList",
        "op": "=",
        "value": -1
      };
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 310;
  }

  // 获取accountLabelList
  getAccountLabelList() {
    this.defineSettingService.getCompanyDimList({}, {}).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.accountLabelList = [];
        } else {
          results['data']['detail'].forEach(item => {
            this.accountLabelList.push({ key: item['dimension_column'], name: item['dimension_name'] });
            // 初始化this.filterResult
            this.filterResult[item['dimension_column']] = {};
          });
        }
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
        this.message.error('数据获取异常，请重试');
      },
      () => {
      },
    );
  }

  _refreshStatus(event) {
    const allChecked = this.apiData.every(
      (value) => value.disabled || value.checked,
    );
    const allUnchecked = this.apiData.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;

    this.allGdt = !this.apiData.some(data => data.checked && data.publisher_id !== 6);
  }

  _checkAll(value) {
    if (value) {
      this.apiData.forEach((data) => {
        if (!data.disabled) {
          data.checked = true;
        }
      });
      this._indeterminate = true;
    } else {
      this._indeterminate = false;
      this.apiData.forEach((data) => (data.checked = false));
    }

    this.allGdt = !this.apiData.some(data => data.checked && data.publisher_id !== 6);
  }

  addAccountAddChannel() {
    const add_modal = this.modalService.create({
      nzTitle: '账户授权',
      nzWidth: 600,
      nzContent: AccountBindingMultiChannelComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'account-binding-modal',
      nzFooter: null,
      nzComponentParams: {
        keeperList: this.keeperList,
        accountLabelList: this.accountLabelList,
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

  addVirtualAccount() {
    const add_modal = this.modalService.create({
      nzTitle: '账户授权',
      nzWidth: 600,
      nzContent: AccountBindingChannelNoAccountComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'account-binding-modal',
      nzFooter: null,
      nzComponentParams: {
        accountLabelList: this.accountLabelList,
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

  editHasAccount(chan_pub_id, type) {
    this.manageService.getAccountInfo(chan_pub_id).subscribe(
      (result) => {
        if (result['status_code'] && result.status_code === 200) {
          const accountSetting = result['data'];
          const edit_modal = this.modalService.create({
            nzTitle: '编辑账户',
            nzWidth: 600,
            nzContent: AccountBindingModalComponent,
            nzClosable: false,
            nzMaskClosable: false,
            nzWrapClassName: 'account-binding-modal',
            nzFooter: null,
            nzComponentParams: {
              chanPubId: chan_pub_id,
              setting: accountSetting,
              type,
              // keeperList:this.keeperList
              accountLabelList: this.accountLabelList,
            },
          });
          edit_modal.afterClose.subscribe((result_updae) => {
            if (result_updae === 'onOk') {
              this.refreshData();
            }
          });
        } else if (result['status_code'] && result.status_code === 201) {
          this.message.error('账户名称已经存在，请重试');
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 404) {
          this.message.error('API未实现，找言十！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(result.message);
        }
      },
      (err) => {

        this.message.error('系统异常，请重试');
      },
    );
  }

  setPassword(chan_pub_id) {
    this.manageService.getAccountInfo(chan_pub_id).subscribe((result) => {
      if (result['status_code'] && result.status_code === 200) {
        const accountSetting = result['data'];
        const add_modal = this.modalService.create({
          nzTitle: accountSetting.publisher_id === 6 ? '重新授权' : '编辑密码',
          nzWidth: 600,
          nzContent: AccountBindingSetPasswordComponent,
          nzClosable: false,
          nzMaskClosable: false,
          nzWrapClassName: 'account-binding-set-password',
          nzFooter: null,
          nzComponentParams: {
            chanPubId: chan_pub_id,
            setting: accountSetting,
          },
        });
        add_modal.afterClose.subscribe((result_updae) => {
          if (result_updae === 'onOk') {
            this.refreshData();
          }
        });
      }
    });
  }

  doUnbinding(chan_pub_id?: number) {
    const postBody = { id_list: [] };
    if (isUndefined(chan_pub_id)) {
      this.apiData.forEach((data) => {
        if (data.checked) {
          postBody.id_list.push(data.chan_pub_id);
        }
      });
    } else if (isNumber(chan_pub_id) && chan_pub_id > 0) {
      postBody.id_list.push(chan_pub_id);
    }
    if (postBody.id_list.length > 0) {
      if (this.show_type === 'hasAccount') {
        this.deleHasAccount(postBody);
      } else if (this.show_type === 'virtualAccount') {
        this.deleVirtualAccount(postBody);
      }
    } else {
      this.message.info('请选择相关项操作');
    }
  }
  deleHasAccount(postBody) {
    this.manageService.delAccount(postBody).subscribe(
      (result: any) => {
        if (result.status_code === 200) {
          this.message.success('停用成功');
          this.refreshData();
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 404) {
          this.message.error('API未实现，找言十！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(result['message']);
        }
      },
      (err: any) => {
        this.message.error('解绑失败,请重试');
      },
      () => { },
    );
  }
  deleVirtualAccount(postBody) {
    this.manageService.deleteVirtualAccount(postBody).subscribe(
      (result: any) => {
        if (result.status_code === 200) {
          this.message.success('停用成功');
          this.refreshData();
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 404) {
          this.message.error('API未实现，找言十！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(result['message']);
        }
      },
      (err: any) => {
        this.message.error('解绑失败,请重试');
      },
      () => { },
    );
  }

  downloadAccount() {
    const postBody = {
      pConditions: [],
    };
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postBody.pConditions.push(item);
      }
    });
    if (this.show_type === 'hasAccount') {
      this.getHasAccountList(postBody);
    } else if (this.show_type === 'virtualAccount') {
      this.getVirtualAccountList(postBody);
    }

    this.loading = true;
    this.manageService
      .downloadAccount(postBody, { is_virtual: this.show_type === 'virtualAccount' ? 1 : 0, })
      .subscribe(
        (results: any) => {
          this.loading = false;
          if (results.status_code && results.status_code === 200) {
            const cacheKey = results['data']['cache_key'];
            window.open(
              environment.SERVER_API_URL + '/files_public_down/' + cacheKey,
            );
          } else {
            this.message.error('当前不可下载，请稍候重试');
          }
        },
        (err: any) => {
          this.loading = false;
          this.message.error('系统异常，不可下载');
        },
        () => {
          this.loading = false;
        },
      );
  }

  doSync(chan_pub_id?) {
    const postBody = {
      type: 'account',
      info: [],
    };
    const adminInfo = this.authService.getCurrentAdminOperdInfo();
    const notifyData: any[] = [];
    if (isUndefined(chan_pub_id)) {
      this.apiData.forEach((data) => {
        if (data.checked) {
          postBody.info.push({ chan_pub_id: data.chan_pub_id });
          notifyData.push({
            chan_pub_id: data.chan_pub_id,
            cid: data.cid,
            uid: adminInfo.select_uid,
            advertiser_name: data['advertiser_name'],
            pub_account_name: data['pub_account_name'],
          });
        }
      });
    } else if (isNumber(chan_pub_id) && chan_pub_id > 0) {
      postBody.info.push(chan_pub_id);
    }
    if (postBody.info.length > 0) {
      this.manageService.syncAccounts(postBody).subscribe(
        (result: any) => {
          if (result.status_code === 200) {
            this.message.success('提交成功，同步中');
            this.notifyService.notifyData.next({
              type: 'account',
              data: notifyData,
            });
            this.refreshData();
          } else if (result['status_code'] && result.status_code === 401) {
            this.message.error('您没权限对此操作！');
          } else if (result['status_code'] && result.status_code === 500) {
            this.message.error('系统异常，请重试');
          } else {
            this.message.error(result['message']);
          }
        },
        (err: any) => {
          this.message.error('同步失败,请重试');
        },
        () => { },
      );
    } else {
      this.message.info('请选择相关项操作');
    }
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false; // 表示有选中的，不管是全选还是选个别
    this._allChecked = false;
    this.radioValueNew = "1";
    this.formulaContentNewArr = [{
      sdate: "",
      edate: "",
      discount_rate_formula: "",
      limitSdate: "string",
      limitEdate: "string"
    }];
    this.commissionContentNewArr = [{
      sdate: "",
      edate: "",
      commission_rate_formula: "",
      limitSdate: "string",
      limitEdate: "string"
    }];
    this.discountEditNew = {
      discount_rate_formula: ""
    };
    this.commissionEditNew = {
      commission_rate_formula: ""
    };

    const postBody = {
      pConditions: [],
    };
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postBody.pConditions.push(item);
      }
    });
    if (this.show_type === 'hasAccount') {
      this.getHasAccountList(postBody);
    } else if (this.show_type === 'virtualAccount') {
      this.getVirtualAccountList(postBody);
    } else if (this.show_type === 'compensateAccount') {
      this.getCompensateAccountList(postBody);
    } else if (this.show_type === 'compensateLog') {
      this.getCompensateLog();
    }
  }

  getHasAccountList(postBody) {
    this.manageService
      .getHasAccountList(postBody, {
        page: this.currentPage,
        count: this.pageSize,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.total = 0;
          } else {
            this.apiData = results['data']['detail'];
            this.total = results['data']['detail_count'];
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }
  getVirtualAccountList(postBody) {
    this.manageService
      .virtualAccountList(postBody, {
        page: this.currentPage,
        count: this.pageSize,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.total = 0;
          } else {
            this.apiData = results['data']['detail'];
            this.total = results['data']['detail_count'];
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }
  //赔付列表
  getCompensateAccountList(postBody) {
    this.manageService
      .compensateAccountList(postBody, {
        page: this.currentPage,
        count: this.pageSize,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.total = 0;
          } else {
            this.apiData = results['data']['detail'];
            this.total = results['data']['detail_count'];
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  //赔付上传列表
  getCompensateLog() {
    this.manageService
      .compensateLog({
        page: this.currentPage,
        count: this.pageSize,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.total = 0;
          } else {
            this.apiData = results['message']['detail'];
            this.total = results['message']['detail_count'];
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }
  downLoad(job_id) {
    this.manageService.downLoadJob(job_id).subscribe(results => {
      if (results.status_code !== 200) {
        this.message.info('当前文件不可下载');
      } else {
        const cacheKey = results['data']['cache_key'];
        window.open(environment.SERVER_API_URL + '/files_down/' + cacheKey);
      }
    });
  }
  seeUploadFile(data) {
    this.manageService.downLoadJob(data.job_id).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.info('当前文件不可预览', { nzDuration: 100000 });
        } else {
          const cacheKey = results['data']['cache_key'];
          window.open('https://view.officeapps.live.com/op/view.aspx?src=' + encodeURI(environment.SERVER_API_URL + '/files_down/' + cacheKey));
        }
      },
      (err: any) => {
        this.message.error('系统异常');
      },
      () => {
      }
    );
  }

  filterSearch() {
    this.filter_result_array = [];
    Object.keys(this.filter).forEach((item) => {
      if (
        this.filter[item].value ||
        typeof this.filter[item].value === 'number'
      ) {
        this.filter_result_array.push({
          key: item,
          name: this.filter_key[item].name,
          op: this.filter[item].op
            ? this.filter[item].op === '='
              ? '为'
              : '不为'
            : '',
          value:
            this.filter_key[item].filter_type === 'string'
              ? this.filter[item].value
              : this[item + '_value'][this.filter[item].value],
        });
      }
    });
    this.refreshData();
  }

  clearFilter() {
    Object.keys(this.filter).forEach((item) => {
      this.filter[item].value = '';
    });
    this.filterSearch();
  }

  deleteFilter(index) {
    this.filter[this.filter_result_array[index].key].value = '';
    this.filterSearch();
  }

  getAdvertiserList() {
    this.manageService
      .getAdvertiserList({}, { result_model: 'all', need_publish_account: 0 })
      .subscribe(
        (result) => {
          if (result['status_code'] && result.status_code === 200) {
            result['data'].forEach((item) => {
              this.advertiserList.push({
                name: item.advertiser_name,
                key: item.cid,
              });
            });
          } else if (result['status_code'] && result.status_code === 201) {
            this.message.error('广告主名称已经存在，请重试');
          } else if (result['status_code'] && result.status_code === 401) {
            this.message.error('您没权限对此操作！');
          } else if (result['status_code'] && result.status_code === 500) {
            this.message.error('系统异常，请重试');
          } else {
            this.message.error(result.message);
          }
        },
        (err) => {

          this.message.error('系统异常，请重试');
        },
      );
  }

  getAccountKeeperList() {
    this.manageService
      .getAccountKeeperList({}, { result_model: 'all', need_publish_account: 0 })
      .subscribe(
        (result) => {
          if (result['status_code'] && result.status_code === 200) {
            result['data'].forEach((item) => {
              this.keeperList.push({
                name: item.super_account_name,
                key: item.super_account_id,
                publisher_id: item.publisher_id,
                channel_id: item.channel_id,
              });
            });
          } else if (result['status_code'] && result.status_code === 201) {
            this.message.error('广告主名称已经存在，请重试');
          } else if (result['status_code'] && result.status_code === 401) {
            this.message.error('您没权限对此操作！');
          } else if (result['status_code'] && result.status_code === 500) {
            this.message.error('系统异常，请重试');
          } else {
            this.message.error(result.message);
          }
        },
        (err) => {

          this.message.error('系统异常，请重试');
        },
      );
  }

  changeActive(type) {
    this.loading = true;
    this.apiData = [];
    this.show_type = type;
    this.currentPage = 1;
    this.user_id = null;
    this.refreshData();
  }

  ngOnInit() {
    this.onWindowResize();
    // 初始化操作
    this.getAccountLabelList();
    this.getAdvertiserList();
    this.getAccountKeeperList();

    this.advertisers.forEach((item) => {
      this.advertiser_value[item.advertiser_id] = item.advertiser_name;
    });
    this.refreshData();
    this.getUserList();
  }


  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

  batchEditDiscount(content) {
    this.updateModal = this.modalService.create({
      nzTitle: '批量编辑返点',
      nzWidth: 600,
      nzContent: content,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
  }


  batchEditDiscountFormula(content) {
    this.isSetDiscount = false;
    this.updateModal = this.modalService.create({
      nzTitle: '批量编辑返点公式',
      nzWidth: 600,
      nzContent: content,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
    this.formulaContentNewArr = [
      {
        sdate: "",
        edate: "",
        discount_rate_formula: "",
        limitSdate: "string",
        limitEdate: "string"
      }
    ];
    this.discountEditNew.discount_rate_formula = '';
    this.radioValueNew = "1";
  }
  batchEditCommissionFormula(content) {
    this.isSetDiscount = false;
    this.updateModal = this.modalService.create({
      nzTitle: '批量编辑佣金比例',
      nzWidth: 600,
      nzContent: content,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
    this.commissionContentNewArr = [
      {
        sdate: "",
        edate: "",
        commission_rate_formula: "",
        limitSdate: "string",
        limitEdate: "string"
      }
    ];
    this.commissionEditNew.commission_rate_formula = '';
    this.radioValueCommission = "1";
  }

  cancelEdit(): void {
    this.updateModal.destroy();
  }


  updateDiscount(type = 'discount'): void {
    if (!this.updating) {
      this.updating = true;
      const postData = { type, value: null, detail: [] };
      if (type == 'discount') {
        postData.value = this.discountEdit.discount;
      } else {
        postData.value = this.discountEdit.discountFormula;
      }

      this.apiData.forEach((data) => {
        if (data.checked) {
          postData.detail.push(data['chan_pub_id']);
        }
      });

      this.manageService.updateDiscount(postData).subscribe(result => {
        if (result['status_code'] === 200) {
          this.updating = false;
          this.message.success('更新成功');
          this.updateModal.destroy('onOk');
          this.refreshData();
        } else if (result['status_code'] !== 500) {
          this.message.error(result['message']);
        } else {
          this.message.error('创建失败，请重试');
        }
      }, err => {
        this.updating = false;

      }, () => {
        this.updating = false;
      });
    }
  }

  batchAllotUser(content) {
    this.userListModal = this.modalService.create({
      nzTitle: '批量分配用户',
      nzWidth: 600,
      nzContent: content,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
    this.getUserList();
  }

  closeBatchAllotUser() {
    this.userListModal.destroy('onOk');
  }

  saveBatchAllotUser() {
    const params = {
      chan_pub_id_lst: [],
      user_id: '',
      is_virtual: false,
    };
    this.apiData.forEach((data) => {
      if (data.checked) {
        params.chan_pub_id_lst.push(data.chan_pub_id);
      }
    });

    params.user_id = this.user_id;

    if (this.show_type === 'virtualAccount') {
      params.is_virtual = true;
    }

    this.manageService.setUser(params, {}).subscribe(result => {
      if (result['status_code'] === 200) {
        this.message.success('分配用户成功');
        this.userListModal.destroy('onOk');
        this.refreshData();
      } else if (result['status_code'] !== 500) {
        this.message.error(result['message']);
      } else {
        this.message.error('分配失败，请重试');
      }
    }, err => {

    }, () => {

    });
  }

  getUserList(): void {
    const resultCondition = {
      "pConditions": [{
        "key": "is_use",
        "name": "状态",
        "op": "=",
        "value": 1
      },
      {
        "key": "role_id",
        "name": "用户",
        "op": "=",
        "value": [1, 3, 4]
      }
      ],
      "sort_item": {}
    };
    this.manageService
      .getUserList(resultCondition, { result_model: 'all' })
      .subscribe(
        (result) => {
          if (result['status_code'] && result.status_code === 200) {
            this.userList = result['data'];
            result['data'].forEach(item => {
              this.useUserIdList.push({
                name: item.user_name,
                key: item.use_user_id,
              });
            });
          } else {
          }
        },
        (err) => {
          this.message.error('系统异常，请重试');
        },
      );
  }

  //删除返点公式框
  deleteFormulaContentNew(type, index) {
    if (type === 'discount') {
      const LEN = this.formulaContentNewArr.length;
      if (LEN > 1) {
        if (index < LEN - 1) {
          this.formulaContentNewArr[index + 1]["limitSdate"] = this.formulaContentNewArr[index]["limitSdate"];
        }
        this.formulaContentNewArr.splice(index, 1);
      } else {
        this.message.error("不能再删了!");
      }
    } else if (type === 'commission') {
      const LEN = this.commissionContentNewArr.length;
      if (LEN > 1) {
        if (index < LEN - 1) {
          this.commissionContentNewArr[index + 1]["limitSdate"] = this.commissionContentNewArr[index]["limitSdate"];
        }
        this.commissionContentNewArr.splice(index, 1);
      } else {
        this.message.error("不能再删了!");
      }
    }

  }

  //添加返点公式框
  upAddFormulaContentNew(type) {
    if (type === 'discount') {
      const OBJ = this.formulaContentNewArr[0];
      if (this.isFormulaContentNewArrNull()) {
        this.formulaContentNewArr.unshift(
          {
            sdate: '',
            edate: '',
            discount_rate_formula: '',
            limitSdate: "string",
            limitEdate: OBJ["edate"]
          }
        );
      } else {
        this.message.error("请先完成当前公式!");
      }
    } else if (type === 'commission') {
      const OBJ = this.commissionContentNewArr[0];
      if (this.isCommissionContentArrNull()) {
        this.commissionContentNewArr.unshift(
          {
            sdate: '',
            edate: '',
            commission_rate_formula: '',
            limitSdate: "string",
            limitEdate: OBJ["edate"]
          }
        );
      } else {
        this.message.error("请先完成当前公式!");
      }
    }

  }

  addFormulaContentNew(type, index) {
    if (type === 'discount') {
      const LEN = this.formulaContentNewArr.length;
      if (this.isFormulaContentNewArrNull()) {
        if (index < LEN - 1) {
          this.formulaContentNewArr.splice(index + 1, 0,
            {
              sdate: '',
              edate: '',
              discount_rate_formula: '',
              limitSdate: this.formulaContentNewArr[index]["sdate"],
              limitEdate: this.formulaContentNewArr[index + 1]["edate"]
            }
          );
        } else {
          this.formulaContentNewArr.splice(index + 1, 0,
            {
              sdate: '',
              edate: '',
              discount_rate_formula: '',
              limitSdate: this.formulaContentNewArr[index]["sdate"],
              limitEdate: "string"
            }
          );
        }
      } else {
        this.message.error("当前还有公式未完成!");
      }
    } else if (type === 'commission') {
      const LEN = this.commissionContentNewArr.length;
      if (this.isCommissionContentArrNull()) {
        if (index < LEN - 1) {
          this.commissionContentNewArr.splice(index + 1, 0,
            {
              sdate: '',
              edate: '',
              commission_rate_formula: '',
              limitSdate: this.commissionContentNewArr[index]["sdate"],
              limitEdate: this.commissionContentNewArr[index + 1]["edate"]
            }
          );
        } else {
          this.commissionContentNewArr.splice(index + 1, 0,
            {
              sdate: '',
              edate: '',
              commission_rate_formula: '',
              limitSdate: this.commissionContentNewArr[index]["sdate"],
              limitEdate: "string"
            }
          );
        }
      } else {
        this.message.error("当前还有公式未完成!");
      }
    }

  }

  isFormulaContentNewArrNull() {
    for (const item of this.formulaContentNewArr) {
      if (!((Object.keys(item).filter(v => !item[v])).length <= 0)) {
        return false;
      }
    }
    return true;
  }
  isCommissionContentArrNull() {
    for (const item of this.commissionContentNewArr) {
      if (!((Object.keys(item).filter(v => !item[v])).length <= 0)) {
        return false;
      }
    }
    return true;
  }
  //起止日期更改
  onSdateChange = (result, type, id) => {
    if (type === 'discount') {
      const LEN = this.formulaContentNewArr.length;
      this.formulaContentNewArr[id]["sdate"] = result;
      if (id < LEN - 1) {
        this.formulaContentNewArr[id + 1]["limitSdate"] = result;
      }
    } else if (type === 'commission') {
      const LEN = this.commissionContentNewArr.length;
      this.commissionContentNewArr[id]["sdate"] = result;
      if (id < LEN - 1) {
        this.commissionContentNewArr[id + 1]["limitSdate"] = result;
      }
    }
  }

  onEdateChange = (result, type, id) => {
    if (type === 'discount') {
      const LEN = this.formulaContentNewArr.length;
      this.formulaContentNewArr[id]["edate"] = result;
      if (id < LEN - 1) {
        this.formulaContentNewArr[id + 1]["limitSdate"] = result;
      }
      if (id > 0) {
        this.formulaContentNewArr[id - 1]["limitEdate"] = result;
      }
    } else if (type === 'commission') {
      const LEN = this.commissionContentNewArr.length;
      this.commissionContentNewArr[id]["edate"] = result;
      if (id < LEN - 1) {
        this.commissionContentNewArr[id + 1]["limitSdate"] = result;
      }
      if (id > 0) {
        this.commissionContentNewArr[id - 1]["limitEdate"] = result;
      }
    }
  }
  //不可用时间
  disabledStartDate(edate, lastSdate, nextEdate) {
    return (current: Date) => {
      return (
        differenceInCalendarDays(current, new Date(lastSdate)) > -1 ||
        differenceInCalendarDays(current, new Date(nextEdate)) < 1 ||
        differenceInCalendarDays(current, new Date(edate)) > 0
      );
    };
  }
  disabledEndDate(sdate, lastSdate) {
    return (current: Date) => {
      return (
        differenceInCalendarDays(current, new Date(sdate)) < 0 ||
        differenceInCalendarDays(current, new Date(lastSdate)) > -1
      );
    };
  }

  //取消
  cancelEditNew(type): void {
    this.updateModal.destroy();
    if (type === 'discount') {
      this.formulaContentNewArr = [
        {
          sdate: "",
          edate: "",
          discount_rate_formula: "",
          limitSdate: "string",
          limitEdate: "string"
        }
      ];
      this.discountEditNew.discount_rate_formula = '';
      this.radioValueNew = "1";
    } else if (type === 'commission') {
      this.commissionContentNewArr = [
        {
          sdate: "",
          edate: "",
          commission_rate_formula: "",
          limitSdate: "string",
          limitEdate: "string"
        }
      ];
      this.commissionEditNew.commission_rate_formula = '';
      this.radioValueCommission = "1";
    }

  }

  //确认
  updateDiscountNew(saveType, type): void {
    if (saveType === 'discount') {
      if (!this.updating) {
        this.updating = true;
        const postArr = [...this.formulaContentNewArr];
        let postData;
        if (type === '0') {
          if (this.isFormulaContentNewArrNull()) {
            for (const item of postArr) {
              item["sdate"] = formatDate(new Date(item["sdate"]), 'yyyy-MM-dd');
              item["edate"] = formatDate(new Date(item["edate"]), 'yyyy-MM-dd');
            }
            postData = { chan_pub_ids: [], type: type, detail: postArr };
          } else {
            this.message.error("当前还有公式未完成!");
            this.updating = false;
            return;
          }

        } else if (type === '1') {
          if (this.discountEditNew.discount_rate_formula) {
            postData = { chan_pub_ids: [], type: type, detail: this.discountEditNew };
          } else {
            this.message.error("当前还有公式未完成!");
            this.updating = false;
            return;
          }
        }

        this.apiData.forEach((data) => {
          if (data.checked) {
            postData["chan_pub_ids"].push(data['chan_pub_id']);
          }
        });
        this.manageService.updateDiscountNew(postData).subscribe(result => {
          if (result['status_code'] === 200) {
            this.updating = false;
            this.message.success('更新成功');
            this.updateModal.destroy('onOk');
            this.refreshData();
          } else {
            this.message.error(result['message']);
          }
        }, err => {
          this.updating = false;
        }, () => {
          this.updating = false;
        });
      }
    } else if (saveType === 'commission') {
      if (!this.updating) {
        this.updating = true;
        const postArr = [...this.commissionContentNewArr];
        let postData;
        if (type === '0') {
          if (this.isCommissionContentArrNull()) {
            for (const item of postArr) {
              item["sdate"] = formatDate(new Date(item["sdate"]), 'yyyy-MM-dd');
              item["edate"] = formatDate(new Date(item["edate"]), 'yyyy-MM-dd');
            }
            postData = { chan_pub_ids: [], type: type, detail: postArr };
          } else {
            this.message.error("当前还有公式未完成!");
            this.updating = false;
            return;
          }

        } else if (type === '1') {
          if (this.commissionEditNew.commission_rate_formula) {
            postData = { chan_pub_ids: [], type: type, detail: this.commissionEditNew };
          } else {
            this.message.error("当前还有公式未完成!");
            this.updating = false;
            return;
          }
        }

        this.apiData.forEach((data) => {
          if (data.checked) {
            postData["chan_pub_ids"].push(data['chan_pub_id']);
          }
        });
        this.manageService.updateCommission(postData).subscribe(result => {
          if (result['status_code'] === 200) {
            this.updating = false;
            this.message.success('更新成功');
            this.updateModal.destroy('onOk');
            this.refreshData();
          } else {
            this.message.error(result['message']);
          }
        }, err => {
          this.updating = false;
        }, () => {
          this.updating = false;
        });
      }
    }


  }

  setDiscountNew(saveType, type): void {
    if (saveType === 'discount') {
      if (!this.updating) {
        this.updating = true;
        let postData;
        if (type === '0') {
          const postArr = [...this.formulaContentNewArr];
          if (this.isFormulaContentNewArrNull()) {
            for (const item of postArr) {
              item["sdate"] = formatDate(new Date(item["sdate"]), 'yyyy-MM-dd');
              item["edate"] = formatDate(new Date(item["edate"]), 'yyyy-MM-dd');
            }
            postData = { chan_pub_id: this.chan_pub_id, type: type, detail: postArr };
          } else {
            this.message.error("当前还有公式未完成!");
            this.updating = false;
            return;
          }

        } else if (type === '1') {
          if (this.discountEditNew.discount_rate_formula) {
            postData = { chan_pub_id: this.chan_pub_id, type: type, detail: this.discountEditNew };
          } else {
            this.message.error("当前还有公式未完成!");
            this.updating = false;
            return;
          }
        }
        this.manageService.setDiscountNew(postData).subscribe(result => {
          if (result['status_code'] === 200) {
            this.updating = false;
            this.message.success('更新成功');
            this.updateModal.destroy('onOk');
            this.refreshData();
          } else {
            this.message.error(result['message']);
          }
        }, err => {
          this.updating = false;
        }, () => {
          this.updating = false;
        });
      }
    } else if (saveType === 'commission') {
      if (!this.updating) {
        this.updating = true;
        let postData;
        if (type === '0') {
          const postArr = [...this.commissionContentNewArr];
          if (this.isCommissionContentArrNull()) {
            for (const item of postArr) {
              item["sdate"] = formatDate(new Date(item["sdate"]), 'yyyy-MM-dd');
              item["edate"] = formatDate(new Date(item["edate"]), 'yyyy-MM-dd');
            }
            postData = { chan_pub_id: this.chan_pub_id, type: type, detail: postArr };
          } else {
            this.message.error("当前还有公式未完成!");
            this.updating = false;
            return;
          }

        } else if (type === '1') {
          if (this.commissionEditNew.commission_rate_formula) {
            postData = { chan_pub_id: this.chan_pub_id, type: type, detail: this.commissionEditNew };
          } else {
            this.message.error("当前还有公式未完成!");
            this.updating = false;
            return;
          }
        }
        this.manageService.setCommission(postData).subscribe(result => {
          if (result['status_code'] === 200) {
            this.updating = false;
            this.message.success('更新成功');
            this.updateModal.destroy('onOk');
            this.refreshData();
          } else {
            this.message.error(result['message']);
          }
        }, err => {
          this.updating = false;
        }, () => {
          this.updating = false;
        });
      }
    }


  }

  batchAllotCompensate() {
    this.userListModal = this.modalService.create({
      nzTitle: '批量导入赔付消耗/媒体返货',
      nzWidth: 850,
      nzContent: AccountBindingUploadCompensateComponent,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
      nzComponentParams: {
        advertiserList: this.advertiserList,
      }
    });
    this.userListModal.afterClose.subscribe((result) => {
      if (this.show_type === 'compensateAccount') {
        this.refreshData();
      }
    });
  }

  //查看现金返点修改记录
  checkDiscountLog(chan_pub_id, type, content) {
    this.discountLogList = [];
    if (type === 'discount') {
      this.manageService.checkDiscountLog({ chan_pub_id: chan_pub_id }).subscribe(result => {
        if (result['status_code'] && result.status_code === 200) {
          const arrData = result.data.detail;
          for (let i = 0; i < arrData.length; i++) {
            let beforeData = '';
            let afterData = '';
            if (arrData[i]["modify_before"]['type'] === 0) {
              beforeData += '返点类型：时间分段' + "<br/>";
              arrData[i]["modify_before"]["detail"].forEach((item) => {
                beforeData += `${item["sdate"]}至${item["edate"]},返点公式为:${item["discount_rate_formula"]};` + "<br/>";
              });
            } else if (arrData[i]["modify_before"]['type'] === 1) {
              beforeData += '返点类型：长期固定' + "<br/>";
              beforeData += `返点公式为:${arrData[i]["modify_before"]["detail"]["discount_rate_formula"]};` + "<br/>";
            }
            if (arrData[i]["modify_after"]['type'] === 0) {
              afterData += '返点类型：时间分段' + "<br/>";
              arrData[i]["modify_after"]["detail"].forEach((item) => {
                afterData += `${item["sdate"]}-${item["edate"]},返点公式为:${item["discount_rate_formula"]};` + "<br/>";
              });
            } else if (arrData[i]["modify_after"]['type'] === 1) {
              afterData += '返点类型：长期固定' + "<br/>";
              afterData += `返点公式为:${arrData[i]["modify_after"]["detail"]["discount_rate_formula"]};` + "<br/>";
            }
            this.discountLogList.push({
              create_time: arrData[i]["create_time"],
              user_name: arrData[i]["user_name"],
              modify_before: beforeData,
              modify_after: afterData
            });
          }
        }
        this.updateModal = this.modalService.create({
          nzTitle: '查看上传记录',
          nzWidth: 1000,
          nzContent: content,
          nzClosable: true,
          nzMaskClosable: false,
          nzWrapClassName: 'create-report-modal',
          nzFooter: null,
          nzComponentParams: {
            discountLogList: this.discountLogList,
          },
        });
      });
    } else if (type === 'commission') {
      this.manageService.checkCommissionLog({ chan_pub_id: chan_pub_id }).subscribe(result => {
        if (result['status_code'] && result.status_code === 200) {
          const arrData = result.data.detail;
          for (let i = 0; i < arrData.length; i++) {
            let beforeData = '';
            let afterData = '';
            if (arrData[i]["modify_before"]['type'] === 0) {
              beforeData += '佣金比例类型：时间分段' + "<br/>";
              arrData[i]["modify_before"]["detail"].forEach((item) => {
                beforeData += `${item["sdate"]}至${item["edate"]},佣金比例公式为:${item["commission_rate_formula"]};` + "<br/>";
              });
            } else if (arrData[i]["modify_before"]['type'] === 1) {
              beforeData += '佣金比例类型：长期固定' + "<br/>";
              beforeData += `佣金比例公式为:${arrData[i]["modify_before"]["detail"]["commission_rate_formula"]};` + "<br/>";
            }
            if (arrData[i]["modify_after"]['type'] === 0) {
              afterData += '佣金比例类型：时间分段' + "<br/>";
              arrData[i]["modify_after"]["detail"].forEach((item) => {
                afterData += `${item["sdate"]}-${item["edate"]},佣金比例公式为:${item["commission_rate_formula"]};` + "<br/>";
              });
            } else if (arrData[i]["modify_after"]['type'] === 1) {
              afterData += '佣金比例类型：长期固定' + "<br/>";
              afterData += `佣金比例公式为:${arrData[i]["modify_after"]["detail"]["commission_rate_formula"]};` + "<br/>";
            }
            this.discountLogList.push({
              create_time: arrData[i]["create_time"],
              user_name: arrData[i]["user_name"],
              modify_before: beforeData,
              modify_after: afterData
            });
          }
        }
        this.updateModal = this.modalService.create({
          nzTitle: '查看上传记录',
          nzWidth: 1000,
          nzContent: content,
          nzClosable: true,
          nzMaskClosable: false,
          nzWrapClassName: 'create-report-modal',
          nzFooter: null,
          nzComponentParams: {
            discountLogList: this.discountLogList,
          },
        });
      });
    }
  }

  //编辑返点
  setDiscount(chan_pub_id, type, content) {
    if (type === 'discount') {
      this.isSetDiscount = true;
      this.chan_pub_id = chan_pub_id;
      this.manageService.setDiscount(chan_pub_id).subscribe(result => {
        if (result['status_code'] && result.status_code === 200) {
          const dataArr = result.data.detail;
          this.formulaContentNewArr = [];
          this.discountEditNew.discount_rate_formula = '';
          for (const key in dataArr) {
            if (dataArr[key] instanceof Object) {
              this.formulaContentNewArr.push(dataArr[key]);
              this.radioValueNew = '0';
            }
          }
          if (dataArr['discount_rate_formula']) {
            this.discountEditNew.discount_rate_formula = dataArr['discount_rate_formula'];
            this.radioValueNew = '1';
            this.formulaContentNewArr = [
              {
                sdate: "",
                edate: "",
                discount_rate_formula: "",
                limitSdate: "string",
                limitEdate: "string"
              }
            ];
          }
          this.batchEditDiscountUpdate(content);
        }
      });
    } else if (type === 'commission') {
      this.isSetDiscount = true;
      this.chan_pub_id = chan_pub_id;
      this.manageService.setCommissionRate(chan_pub_id).subscribe(result => {
        if (result['status_code'] && result.status_code === 200) {
          const dataArr = result.data.detail;
          this.commissionContentNewArr = [];
          this.commissionEditNew.commission_rate_formula = '';
          for (const key in dataArr) {
            if (dataArr[key] instanceof Object) {
              this.commissionContentNewArr.push(dataArr[key]);
              this.radioValueCommission = '0';
            }
          }
          if (dataArr['commission_rate_formula'] !== undefined) {
            if (dataArr['commission_rate_formula']) {
              this.commissionEditNew.commission_rate_formula = dataArr['commission_rate_formula'];
            }
            this.radioValueCommission = '1';
            this.commissionContentNewArr = [
              {
                sdate: "",
                edate: "",
                commission_rate_formula: "",
                limitSdate: "string",
                limitEdate: "string"
              }
            ];
          }
          this.batchEditCommissionUpdate(content);
        }
      });
    }
  }

  batchEditDiscountUpdate(content) {
    this.updateModal = this.modalService.create({
      nzTitle: '编辑返点公式',
      nzWidth: 600,
      nzContent: content,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
  }
  batchEditCommissionUpdate(content) {
    this.updateModal = this.modalService.create({
      nzTitle: '编辑佣金比例公式',
      nzWidth: 600,
      nzContent: content,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
  }

  authorizeLog(chan_pub_id, content) {
    this.authPageInfo.currentPage = 1;
    this.chan_pub_id = chan_pub_id;
    const postBody = {
      pConditions: [],
    };
    this.manageService.checkDiscountAuthorizeLog(postBody, { chan_pub_id: chan_pub_id, page: this.authPageInfo.currentPage, count: this.authPageInfo.pageSize, }).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        this.discountLogList = [];
        this.authPageInfo.total = result.data.detail_count ? result.data.detail_count : 0;
        const arrData = result.data.detail;
        for (let i = 0; i < arrData.length; i++) {
          const beforeData = !isArray(arrData[i]["modify_before"]) && isObject(arrData[i]["modify_before"]) ? JSON.stringify(arrData[i]["modify_before"]) : arrData[i]["modify_before"];
          const afterData = !isArray(arrData[i]["modify_after"]) && isObject(arrData[i]["modify_after"]) ? JSON.stringify(arrData[i]["modify_after"]) : arrData[i]["modify_after"];
          this.discountLogList.push({
            create_time: arrData[i]["create_time"],
            log_type: arrData[i]["log_type"],
            remark: arrData[i]["remark"],
            modify_before: beforeData,
            modify_after: afterData
          });
        }
      }
      this.updateModal = this.modalService.create({
        nzTitle: '查看账户操作记录',
        nzWidth: 1000,
        nzContent: content,
        nzClosable: true,
        nzMaskClosable: false,
        nzWrapClassName: 'create-report-modal',
        nzFooter: null,
        nzComponentParams: {
          discountLogList: this.discountLogList,
        },
      });
    });

  }

  getAuthorizeLogData() {
    const postBody = {
      pConditions: [],
    };
    Object.values(this.logFilterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postBody.pConditions.push(item);
      }
    });
    this.manageService.checkDiscountAuthorizeLog(postBody, { chan_pub_id: this.chan_pub_id, page: this.authPageInfo.currentPage, count: this.authPageInfo.pageSize, }).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        this.discountLogList = [];
        this.authPageInfo.total = result.data.detail_count ? result.data.detail_count : 0;
        const arrData = result.data.detail;
        for (let i = 0; i < arrData.length; i++) {
          const beforeData = !isArray(arrData[i]["modify_before"]) && isObject(arrData[i]["modify_before"]) ? JSON.stringify(arrData[i]["modify_before"]) : arrData[i]["modify_before"];
          const afterData = !isArray(arrData[i]["modify_after"]) && isObject(arrData[i]["modify_after"]) ? JSON.stringify(arrData[i]["modify_after"]) : arrData[i]["modify_after"];
          this.discountLogList.push({
            create_time: arrData[i]["create_time"],
            log_type: arrData[i]["log_type"],
            remark: arrData[i]["remark"],
            modify_before: beforeData,
            modify_after: afterData
          });
        }
      }
    });
  }
  batchAllotAd(content) {
    this.userListModal = this.modalService.create({
      nzTitle: '批量分配广告主',
      nzWidth: 600,
      nzContent: content,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
    this.getUserList();
  }
  closeBatchAllotAd() {
    this.userListModal.destroy('onOk');
  }

  saveBatchAllotAd() {
    const params = {
      list: [],
      cid: null,
    };
    this.apiData.forEach((data) => {
      if (data.checked) {
        params.list.push(data.chan_pub_id);
      }
    });

    params.cid = this.advertiser_id;

    this.manageService.switchAccountAd(params).subscribe(result => {
      if (result['status_code'] === 200) {
        this.message.success('分配广告主成功');
        this.userListModal.destroy('onOk');
        this.refreshData();
      } else {
        this.message.error(result['message']);
      }
    }, err => {

    }, () => {

    });
  }

  // 编辑最大出价限制
  setAdBidMax(type, content, data?) {
    this.editAdBidMaxType = type;
    if (type === 'batch' && this.apiData.some(data => data.checked && data.publisher_id !== 6)) {
      // 选中项有非广点通项
      this.modalService.warning({
        nzTitle: '只有广点通广告可以设置最大出价',
        nzContent: '请选择广点通广告',
        nzOkText: '确定',
        nzCancelText: '取消'
      });
      return;
    }
    if (type === 'batch') {
      // 批量
      this.adBidMax = null;
      this.chan_pub_id = null;
    } else {
      this.adBidMax = data.ad_bid_max;
      this.chan_pub_id = data.chan_pub_id === '不限' ? null : data.chan_pub_id;
    }

    this.updateModal = this.modalService.create({
      nzTitle: (type === 'batch' ? '批量' : '') + '设置广告最高出价限制',
      nzWidth: 600,
      nzContent: content,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
  }

  updateAdBidMax() {
    this.updating = true;
    const chan_pub_ids = [];
    //批量编辑
    if (this.editAdBidMaxType === 'batch') {
      this.apiData.forEach((data) => {
        if (data.checked) {
          chan_pub_ids.push(data['chan_pub_id']);
        }
      });
    } else {
      //单独编辑
      chan_pub_ids.push(this.chan_pub_id);
    }

    const postData = {
      chan_pub_ids: chan_pub_ids,
      ad_bid_max: this.adBidMax,
    }
    this.manageService.updateAdBidMax(postData).subscribe(result => {
      if (result['status_code'] === 200) {
        this.message.success('更新成功');
        this.updateModal.destroy('onOk');
        this.refreshData();
      } else {
        this.message.error(result['message']);
      }
      this.updating = false;
    }, err => {
      this.updating = false;
    }, () => {
      this.updating = false;
    });
  }

  // 编辑数据归属渠道
  setAttribution(content, editKey) {
    if (editKey === 'attribution_channel' && this.apiData.some(data => data.checked && data.publisher_id === 7)) {
      // 选中项有头条
      this.modalService.warning({
        nzTitle: '头条不可以编辑数据归属渠道',
        nzContent: '您的选项中包含头条',
        nzOkText: '确定',
        nzCancelText: '取消'
      });
      return;
    }
    this[editKey] = null;
    this.updateModal = this.modalService.create({
      nzTitle: '设置数据归属' + (editKey === 'attribution_channel' ? '渠道' : '媒体'),
      nzWidth: 600,
      nzContent: content,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
  }
  updateAttribution(editKey) {
    if (editKey === 'attribution_channel' && this.apiData.some(data => data.checked && data.publisher_id === 7)) {
      this.message.warning('头条不可以编辑数据归属渠道');
      this.updateModal.destroy();
      return;
    }
    this.updating = true;
    const chan_pub_ids = [];
    //批量编辑
    this.apiData.forEach((data) => {
      if (data.checked) {
        chan_pub_ids.push(data['chan_pub_id']);
      }
    });

    const postData = {
      chan_pub_ids: chan_pub_ids,
    }
    postData[editKey] = this[editKey];

    let requestMethod;
    if (editKey === 'attribution_channel') {
      requestMethod = this.manageService.updateAttributionChannel(postData);
    } else if (editKey === 'attribution_publisher') {
      requestMethod = this.manageService.updateAttributionPublisher(postData);
    }
    requestMethod.subscribe(result => {
      if (result['status_code'] === 200) {
        this.message.success('更新成功');
        this.updateModal.destroy('onOk');
        this.refreshData();
      } else {
        this.message.error(result['message']);
      }
      this.updating = false;
    }, err => {
      this.updating = false;
    }, () => {
      this.updating = false;
    });
  }

  changeTabItem(tabItem) {
    this.loading = true;
    this.apiData = [];
    this.show_type = tabItem.type;
    this.currentPage = 1;
    this.user_id = null;
    this.refreshData();
  }

  batchEdit(event) {
    switch (event) {
      case 'discountFormula': // 批量编辑返点公式
        this.batchEditDiscountFormula(this.formulaContentNew);
        break;
      case 'adBidMax': // 批量编辑广告出价
        this.setAdBidMax('batch', this.adBidMaxContent);
        break;
      case 'commission':// 批量编辑佣金比例
        this.batchEditCommissionFormula(this.commissionContent);
        break;
      case 'compensate': // 批量导入赔付消耗/媒体返货
        this.batchAllotCompensate();
        break;
      case 'user': // 批量分配用户
        this.batchAllotUser(this.batchUserList);
        break;
      case 'ad': // 批量分配广告主
        this.batchAllotAd(this.batchAdList);
        break;

      case 'attributionChannel': // 批量设置数据归属渠道
        this.setAttribution(this.attributionChannelContent, 'attribution_channel');
        break;
      case 'attributionPublisher': // 设置数据归属媒体
        this.setAttribution(this.attributionPublisherContent, 'attribution_publisher');
        break;
    }
    this.batchEditValue = event = 'placeHolder';
  }
}
