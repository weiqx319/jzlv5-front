import { Component, ElementRef, HostListener, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AccountBindingModalComponent } from "../../../../modal/account-binding-modal/account-binding-modal.component";
import { ManageItemService } from "../../../../service/manage-item.service";
import { ManageService } from "../../../../service/manage.service";

import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../../../core/service/auth.service";
import { AppState } from "../../../../../../core/store/app.state";
import { NotifyService } from "../../../../../../module/notify/notify.service";
import { AccountBindingKeeperChildComponent } from "../../../../modal/account-binding-keeper-child/account-binding-keeper-child.component";
import { AccountBindingKeeperComponent } from "../../../../modal/account-binding-keeper/account-binding-keeper.component";
import { AccountBindingSetPasswordComponent } from "../../../../modal/account-binding-set-password/account-binding-set-password.component";

@Component({
  selector: 'app-account-keeper',
  templateUrl: './account-keeper-detail.component.html',
  styleUrls: ['./account-keeper-detail.component.scss'],
})
export class AccountKeeperDetailComponent implements OnInit {
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 10000000;

  public publisherTypeRelation: object;
  public noResultHeight = document.body.clientHeight - 272;

  public filterChildAccountStatusOption = [];
  public filterPublisherOption = [];

  public canBatchGrant = false;
  public canBatchBind = false;
  public canBatchUnbind = false;

  public filterChannelOption = [
    {
      name: '搜索推广',
      key: 1,
    },
    {
      name: '信息流',
      key: 2,
    },
  ];

  public newStatusMap = {
    'status_1': '待验证',
    'status_-1': '验证失败',
    'status_2': '有效(未授权)',
    'status_3': '已授权(未关联)',
    'status_4': '已关联',
  };

  public advertiserList = [];
  public optimizerManagerList = [];

  public grantEditParam = {
    showEdit: false,
    cid: 0,
    get_user_id: null,
    child_account_id_list: [],
  };

  // filter_key = {
  //   role_id: {name: '角色', filter_type: 'single_select'},
  //   status: {name: '状态', filter_type: 'single_select'}
  // };
  filterResult = {
    child_account_name: {},
    account_status: {},
    publisher_id: {},
    cid: {},
    channel_id: {},
    new_status: {},
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
    0: '无效',
    1: '有效',
  };
  publisher_id_value = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马',
  };

  public companyId: any;
  public superAccountId: any = "0";
  public superAccountName: any = "";

  @ViewChild('noResultTd') tdNode: ElementRef;

  authState$ = this.store$.select((s) => s.auth);
  constructor(
    private manageService: ManageService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private notifyService: NotifyService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private store$: Store<AppState>,
  ) {
    this.superAccountId = this.route.snapshot.paramMap.get('superAccountId');
    this.publisherTypeRelation = this.manageItemService.publisherTypeRelation;
    this.filterChildAccountStatusOption = manageItemService.childAccountStatusList;
    this.filterPublisherOption = manageItemService.publisherTypeList;
    this.companyId = this.authService.getCurrentUser().company_id;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;
  }

  addAccountKeeperChildAccount() {
    const add_modal = this.modalService.create({
      nzTitle: '添加子帐户',
      nzWidth: 600,
      nzContent: AccountBindingKeeperChildComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'account-binding-keeper-child-modal',
      nzFooter: null,
      nzComponentParams: {
        superAccountId: this.superAccountId,
        superAccountName: this.superAccountName,
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

  editKeeperChildAccount(super_account_id) {
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

  bindChild(row?) {
    const postAccountIdList = [];
    if (!isUndefined(row)) {
      postAccountIdList.push(row['account_id']);
    } else {
      this.apiData.forEach((data) => {
        if (data.checked) {
          postAccountIdList.push(data['account_id']);
        }
      });
    }

    if (postAccountIdList.length < 1) {
      this.message.error('请先选择帐户');
      return;
    }

    const accountSetting = { super_account_id: this.superAccountId, account_id_list: postAccountIdList };
    this.manageService.bindAccountKeeperChild(accountSetting).subscribe((data) => {
      if (data['status_code'] && data.status_code === 200) {
        this.message.success('保存成功');
      } else if (data['status_code'] && data.status_code === 201) {
        this.message.error('广告主名称已经存在，请重试', { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 401) {
        this.message.error('您没权限对此操作！', { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 500) {
        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 404) {
        this.message.error('接口未实现，找言十', { nzDuration: 10000 });
      } else {
        this.message.error(data.message, { nzDuration: 10000 });
      }
      this.refreshData();
    }, (err) => {
      this.message.error('系统异常，请重试', { nzDuration: 10000 });
    });
  }

  delChild(row) {
    const accountSetting = { super_account_id: this.superAccountId, child_account_id_list: [row['child_account_id']] };
    this.manageService.delAcountKeeperChild(accountSetting).subscribe((data) => {
      if (data['status_code'] && data.status_code === 200) {
        this.message.success('删除成功');
      } else if (data['status_code'] && data.status_code === 201) {
        this.message.error('广告主名称已经存在，请重试', { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 401) {
        this.message.error('您没权限对此操作！', { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 500) {
        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 404) {
        this.message.error('接口未实现，找言十', { nzDuration: 10000 });
      } else {
        this.message.error(data.message, { nzDuration: 10000 });
      }
      this.refreshData();
    }, (err) => {
      this.message.error('系统异常，请重试', { nzDuration: 10000 });
    });
  }

  grantChild(row?) {
    this.grantEditParam.child_account_id_list = [];
    if (!isUndefined(row)) {
      this.grantEditParam.child_account_id_list.push(row['child_account_id']);
    } else {
      this.apiData.forEach((data) => {
        if (data.checked) {
          this.grantEditParam.child_account_id_list.push(data['child_account_id']);
        }
      });
    }

    if (this.grantEditParam.child_account_id_list.length < 1) {
      this.grantEditParam.showEdit = false;
      this.message.error('请先选择帐户');
    }

  }

  unbindChild(row?) {
    const postAccountIdList = [];
    if (!isUndefined(row)) {
      postAccountIdList.push(row['account_id']);
    } else {
      this.apiData.forEach((data) => {
        if (data.checked) {
          postAccountIdList.push(data['account_id']);
        }
      });
    }
    if (postAccountIdList.length < 1) {
      this.message.error('请先选择帐户');
      return;
    }

    const accountSetting = { super_account_id: this.superAccountId, account_id_list: postAccountIdList };
    this.manageService.unbindAccountKeeperChild(accountSetting).subscribe((data) => {
      if (data['status_code'] && data.status_code === 200) {
        this.message.success('保存成功');
      } else if (data['status_code'] && data.status_code === 201) {
        this.message.error('广告主名称已经存在，请重试', { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 401) {
        this.message.error('您没权限对此操作！', { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 500) {
        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 404) {
        this.message.error('接口未实现，找言十', { nzDuration: 10000 });
      } else {
        this.message.error(data.message, { nzDuration: 10000 });
      }
      this.refreshData();
    }, (err) => {
      this.message.error('系统异常，请重试', { nzDuration: 10000 });
    });
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

    this.getAccountKeeperListById(this.superAccountId, postBody);
  }

  getAccountKeeperListById(superAccountId, postBody) {
    this.manageService
      .getAccountKeeperListById(superAccountId, postBody, {
        page: this.currentPage,
        count: this.pageSize,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.total = 0;
          } else {
            this.apiData = results['data'];
            this.total = results['data'].length;
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
    this.getCurrentKeeperInfo();
    this.refreshData();
    this.getUserList();
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();

    if (this.filterResult.new_status.hasOwnProperty('value') && this.filterResult.new_status['value'] == 4) {
      this.canBatchUnbind = true;
      this.canBatchBind = false;
      this.canBatchGrant = false;
    } else if (this.filterResult.new_status.hasOwnProperty('value') && this.filterResult.new_status['value'] == 3) {
      this.canBatchUnbind = false;
      this.canBatchBind = true;
      this.canBatchGrant = false;
    } else if (this.filterResult.new_status.hasOwnProperty('value') && this.filterResult.new_status['value'] == 2) {
      this.canBatchUnbind = false;
      this.canBatchBind = false;
      this.canBatchGrant = true;
    } else {
      this.canBatchUnbind = false;
      this.canBatchBind = false;
      this.canBatchGrant = false;
    }

  }

  public cancel(row?) {
    if (isUndefined(row)) {
      this.grantEditParam.showEdit = false;
    } else {
      row.showEdit = false;
    }

  }

  public ok(row?) {
    if (this.grantEditParam.cid < 1) {
      this.message.error('请选择广告主');
      return;
    }
    if (!this.grantEditParam.get_user_id) {
      this.message.error('请选择用户');
      return;
    }

    const accountSetting = { super_account_id: this.superAccountId, child_account_id_list: this.grantEditParam.child_account_id_list, cid: this.grantEditParam.cid, user_id: this.grantEditParam.get_user_id };
    this.manageService.grantAccountKeeperChild(accountSetting).subscribe((data) => {
      if (data['status_code'] && data.status_code === 200) {
        if (isUndefined(row)) {
          this.grantEditParam.showEdit = false;
        } else {
          row.showEdit = false;
        }
        this.message.success('保存成功');
      } else if (data['status_code'] && data.status_code === 201) {
        this.message.error('广告主名称已经存在，请重试', { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 401) {
        this.message.error('您没权限对此操作！', { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 500) {
        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      } else if (data['status_code'] && data.status_code === 404) {
        this.message.error('接口未实现，找言十', { nzDuration: 10000 });
      } else {
        this.message.error(data.message, { nzDuration: 10000 });
      }
      this.refreshData();
    }, (err) => {
      this.message.error('系统异常，请重试', { nzDuration: 10000 });
    });

  }

  _refreshStatus(event) {
    const allChecked = this.apiData.every(
      (value) => value.disabled || value.checked,
    );
    const allUnchecked = this.apiData.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;

    this.checkCanBatchOpoer();
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
    this.checkCanBatchOpoer();
  }

  public checkCanBatchOpoer() {
    const countType = {
      'all': 0,
      'status_-1': 0,
      'status_1': 0,
      'status_2': 0,
      'status_3': 0,
      'status_4': 0,
    };

    this.apiData.forEach((data) => {
      if (data.checked) {
        countType['status_' + data.new_status]++;
        countType['all']++;
      }
    });

    if (countType['all'] != 0 && countType['all'] == countType['status_4']) {
      this.canBatchUnbind = true;
      this.canBatchBind = false;
      this.canBatchGrant = false;

    } else if (countType['all'] != 0 && countType['all'] == countType['status_3']) {
      this.canBatchUnbind = false;
      this.canBatchBind = true;
      this.canBatchGrant = false;

    } else if (countType['all'] != 0 && countType['all'] == countType['status_2']) {
      this.canBatchUnbind = false;
      this.canBatchBind = false;
      this.canBatchGrant = true;

    } else {
      this.canBatchUnbind = false;
      this.canBatchBind = false;
      this.canBatchGrant = false;
    }

  }

  getCurrentKeeperInfo() {
    this.manageService.getAccountKeeperInfo(this.superAccountId).subscribe((data) => {
      if (data['status_code'] && data.status_code === 200) {
        this.superAccountName = data['data']['super_account_name'];
      }
    });
  }

  getUserList(): void {
    const resultCondition = {
      pConditions: [],
    };
    this.manageService
      .getUserList(resultCondition, { result_model: 'all' })
      .subscribe(
        (result) => {
          if (result['status_code'] && result.status_code === 200) {
            this.optimizerManagerList = result['data'].map((item) => {
              return { id: item.use_user_id || 0, name: item.user_name };
            });
          } else {
            this.optimizerManagerList = [];
          }
          if (this.authService.getCurrentAdminOperdInfo().role_id > 1) {
            this.optimizerManagerList = [{ id: this.authService.getCurrentAdminOperdInfo().select_uid, name: '当前用户' }, ...this.optimizerManagerList];
          }
        },
        (err) => {

          this.message.error('系统异常，请重试');
        },
      );
  }

}
