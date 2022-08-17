import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AccountBindingModalComponent } from "../../../../../../modal/account-binding-modal/account-binding-modal.component";
import { ManageItemService } from "../../../../../../service/manage-item.service";
import { ManageService } from "../../../../../../service/manage.service";

import { Store } from "@ngrx/store";
import { AppState } from "../../../../../../../../core/store/app.state";
import { CustomDatasService } from "../../../../../../../../shared/service/custom-datas.service";
import { AccountBindingUploadCompensateComponent } from "../../../../../../modal/account-binding-upload-compensate/account-binding-upload-compensate.component";
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-compensate',
  templateUrl: './compensate.component.html',
  styleUrls: ['./compensate.component.scss']
})
export class CompensateComponent implements OnInit {
  public show_type = 'compensateAccount';

  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;

  public publisherTypeRelation: object;
  public channelRelation: object;
  public noResultHeight = document.body.clientHeight - 310;

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

  public updating = false;

  filterResult = {
    pub_account_name: {},
    account_label: {},
    account_comment: {},
    account_status: {},
    publisher_id: {},
    cid: {},
    channel_id: {},
    user_id: {},
    department: {}
  };

  private userListModal = null;
  public userList = [];
  public user_id = null;
  public useUserIdList = [];

  // 账户标签列表
  public accountLabelList = [];

  @ViewChild('noResultTd') tdNode: ElementRef;

  authState$ = this.store$.select((s) => s.auth);
  constructor(
    private manageService: ManageService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
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
    });

    this.customDataService.dealChannelData().then(() => {
      this.channelRelation = { ...this.customDataService.channelMapObjKey };
      this.filterChannelOption = [...this.customDataService.channelList];
    });

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

  ngOnInit(): void {
    this.getAdvertiserList();
    this.getUserList();
    this.refreshData();
  }
  changeTabItem(tabItem) {
    this.loading = true;
    this.apiData = [];
    this.show_type = tabItem.type;
    this.currentPage = 1;
    this.user_id = null;
    this.refreshData();
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
    if (this.show_type === 'compensateAccount') {
      this.getCompensateAccountList(postBody);
    } else if (this.show_type === 'compensateLog') {
      this.getCompensateLog();
    }
  }
  _refreshStatus(event) {
    const allChecked = this.apiData.every(
      (value) => value.disabled || value.checked,
    );
    const allUnchecked = this.apiData.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;
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
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
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
}
