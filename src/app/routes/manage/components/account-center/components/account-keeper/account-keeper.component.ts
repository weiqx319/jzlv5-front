import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ManageItemService } from "../../../../service/manage-item.service";
import { ManageService } from "../../../../service/manage.service";

import { Store } from "@ngrx/store";
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../../../core/service/auth.service";
import { AppState } from "../../../../../../core/store/app.state";
import { NotifyService } from "../../../../../../module/notify/notify.service";
import { AccountBindingKeeperComponent } from "../../../../modal/account-binding-keeper/account-binding-keeper.component";

@Component({
  selector: 'app-account-keeper',
  templateUrl: './account-keeper.component.html',
  styleUrls: ['./account-keeper.component.scss'],
})
export class AccountKeeperComponent implements OnInit {
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;

  public publisherTypeRelation: Object;
  public noResultHeight = document.body.clientHeight - 272;

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

  // filter_key = {
  //   role_id: {name: '角色', filter_type: 'single_select'},
  //   status: {name: '状态', filter_type: 'single_select'}
  // };
  filterResult = {
    pub_account_name: {},
    account_status: {},
    super_account_status: {},
    super_account_name: {},
    publisher_id: {},
    cid: {},
    channel_id: {},
  };
  filter_result_array = [];

  filter_key = {
    account: { name: '账户名称', filter_type: 'string' },
    status: { name: '状态', filter_type: 'single_select' },
    publisher_id: { name: '媒体', filter_type: 'single_select' },
    advertiser: { name: '广告主', filter_type: 'single_select' },
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
  };
  // filter_result_array = [];
  status_value = {
    '0': '无效',
    '1': '有效'
  };
  publisher_id_value = {
    '1': '百度',
    '2': '搜狗',
    '3': '360',
    '4': '神马'
  };

  public companyId: any;

  @ViewChild('noResultTd') tdNode: ElementRef;

  authState$ = this.store$.select((s) => s.auth);
  constructor(
    private manageService: ManageService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private notifyService: NotifyService,
    private authService: AuthService,
    private store$: Store<AppState>,
  ) {
    this.publisherTypeRelation = this.manageItemService.publisherTypeRelation;
    this.filterAccountStatusOption = manageItemService.AccountStatusList;
    this.filterPublisherOption = manageItemService.publisherTypeList;
    this.companyId = this.authService.getCurrentUser().company_id;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;
  }

  addAccountKeeper() {
    const add_modal = this.modalService.create({
      nzTitle: '管家授权',
      nzWidth: 600,
      nzContent: AccountBindingKeeperComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'account-binding-keeper-modal',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

  editKeeperAccount(super_account_id) {
    this.manageService.getAccountKeeperInfo(super_account_id).subscribe(
      (result) => {
        if (result['status_code'] && result.status_code === 200) {
          const accountSetting = result['data'];
          const edit_modal = this.modalService.create({
            nzTitle: '编辑账户',
            nzWidth: 600,
            nzContent: AccountBindingKeeperComponent,
            nzClosable: false,
            nzMaskClosable: false,
            nzWrapClassName: 'account-binding-modal',
            nzFooter: null,
            nzComponentParams: {
              superAccountId: super_account_id,
              setting: accountSetting,
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

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false; // 表示有选中的，不管是全选还是选个别
    this._allChecked = false;
    const postBody = {
      pConditions: [],
    };
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postBody.pConditions.push(item);
      }
    });

    this.getAccountKeeperList(postBody);
  }

  getAccountKeeperList(postBody) {
    this.manageService
      .getAccountKeeperList(postBody, {
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

  filterCancel() { }

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

  ngOnInit() {
    this.onWindowResize();
    this.getAdvertiserList();

    this.refreshData();
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }
}
