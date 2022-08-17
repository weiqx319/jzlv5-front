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

import { MenuService } from '../../../../../../core/service/menu.service';
import { DefineSettingService } from '../../../../service/define-setting.service';
import { AddCompanyMetricDetailDataComponent } from '../../../../modal/add-company-metric-detail-data/add-company-metric-detail-data.component';

@Component({
  selector: 'app-company-metric-detail',
  templateUrl: './company-metric-detail.component.html',
  styleUrls: ['./company-metric-detail.component.scss'],
})
export class CompanyMetricDetailComponent implements OnInit {
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 10000000;

  public publisherTypeRelation: object;
  public noResultHeight = document.body.clientHeight - 187;

  public filterChildAccountStatusOption = [];
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
  ];

  public newStatusMap = {
    'status_1': '待验证',
    'status_-1': '验证失败',
    'status_2': '有效(未授权)',
    'status_3': '已授权(未关联)',
    'status_4': '已关联',
  };

  public advertiserList = [];

  public grantEditParam = {
    showEdit: false,
    cid: 0,
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
  public companyMetricId: any = "0";

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
    private route: ActivatedRoute,
    private store$: Store<AppState>,
    private menuService: MenuService
  ) {
    this.companyMetricId = this.route.snapshot.paramMap.get('companyMetricId');
    this.publisherTypeRelation = this.manageItemService.publisherTypeRelation;
    this.filterChildAccountStatusOption = manageItemService.childAccountStatusList;
    this.filterPublisherOption = manageItemService.publisherTypeList;
    this.companyId = this.authService.getCurrentUser().company_id;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 240;
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

  ngOnInit() {
    this.onWindowResize();
    this.getAdvertiserList();
    this.refreshData();
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();

  }

  public cancel(row?) {
    if (isUndefined(row)) {
      this.grantEditParam.showEdit = false;
    } else {
      row.showEdit = false;
    }

  }




  _refreshStatus() {
    const allChecked = this.apiData.every(value => value.disabled || value.checked);
    const allUnchecked = this.apiData.every(value => !value.checked);
    // 表示不是全选，但是有选中的
    this._indeterminate = ((!allUnchecked) && (!allChecked)) || allChecked;
    this._allChecked = allChecked;
  }

  _checkAll(value) {
    if (value) {
      this.apiData.forEach(data => {
        if (!data.disabled) {
          data.checked = true;
        }
      });
      this._indeterminate = true;
    } else {
      this._indeterminate = false;
      this.apiData.forEach(data => data.checked = false);
    }
  }


  addCompanyMetricDetail() {
    this.manageService.getAdvertiserList({}, { result_model: 'all', need_publish_account: 0 }).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        const add_modal = this.modalService.create({
          nzTitle: '添加指标',
          nzWidth: 600,
          nzContent: AddCompanyMetricDetailDataComponent,
          nzClosable: false,
          nzMaskClosable: false,
          nzWrapClassName: 'sub-company-manage-modal',
          nzFooter: null,
          nzComponentParams: {
            companyMetricId: this.companyMetricId,
            companyMetricList: this.apiData
          }
        });
        add_modal.afterClose.subscribe(addResult => {
          if (addResult === 'onOk') {
            this.refreshData();
          }
        });
      } else if (result['status_code'] && result.status_code === 201) {
        this.message.error('广告主名称已经存在，请重试');
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else if (result['status_code'] && result.status_code === 205) {
        this.message.error('您没有可用的广告主，请联系管理员分配');
      } else {
        this.message.error(result.message);
      }
    }, (err) => {

      this.message.error('系统异常，请重试');
    }
    );



  }


  delCompanyMetricDetail(metricDefineId: number) {
    this.defineSettingService.delCompanyMetricDetail(this.companyMetricId, metricDefineId).subscribe((result: any) => {
      if (result.status_code === 200) {
        this.message.success('删除成功');
        this.refreshData();
      } else {
        this.message.error('删除失败,请重试');
      }
    },
      (err: any) => {
        this.message.error('删除失败,请重试');
      },
      () => {
      });
  }



  editCompanyMetricDetail(metricDefineId) {
    this.defineSettingService.getCompanyMetricDetailDataByDetailId(this.companyMetricId, metricDefineId).subscribe(
      (result) => {
        if (result['status_code'] && result.status_code === 200) {
          const metricDetailData = result['data'];
          const editModal = this.modalService.create({
            nzTitle: '编辑指标数据',
            nzWidth: 600,
            nzContent: AddCompanyMetricDetailDataComponent,
            nzClosable: false,
            nzMaskClosable: false,
            nzWrapClassName: 'sub-company-manage-modal',
            nzFooter: null,
            nzComponentParams: {
              companyMetricId: this.companyMetricId,
              metricDataId: metricDefineId,
              metricData: metricDetailData,
              companyMetricList: this.apiData
            }
          });
          editModal.afterClose.subscribe(resultModal => {
            if (resultModal === 'onOk') {
              this.refreshData();
            }
          });
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 404) {
          this.message.error('API未实现，找言十！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(result.message);
        }
      }, (err) => {

        this.message.error('系统异常，请重试');
      }
    );

  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    const postBody = {
      'pConditions': []
    };
    Object.values(this.filterResult).forEach(item => {
      if (item.hasOwnProperty('key')) {
        postBody.pConditions.push(item);
      }
    });
    this.defineSettingService.getCompanyMetricDetailListByMetricId(this.companyMetricId, postBody, { page: this.currentPage, count: this.pageSize }).subscribe(
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
      () => {
      }
    );
  }





}
