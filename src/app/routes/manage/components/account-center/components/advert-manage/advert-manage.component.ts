import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Store } from "@ngrx/store";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../../../core/service/auth.service";
import { AppState } from "../../../../../../core/store/app.state";
import { AdvertFormComponent } from "../../../../modal/advert-form/advert-form.component";
import { ManageItemService } from "../../../../service/manage-item.service";
import { ManageService } from "../../../../service/manage.service";

@Component({
  selector: 'app-advert-manage',
  templateUrl: './advert-manage.component.html',
  styleUrls: ['./advert-manage.component.scss'],
})
export class AdvertManageComponent implements OnInit {

  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public data = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;

  public advertiserTypeRelation: Object;
  public noResultHeight = document.body.clientHeight - 272;

  public filterAdvertiserTypeOption = [];
  filterResult = {
    advertiser_name: {
    },
    web_domain: {
    },
    advertiser_type: {

    },
    department: {

    },
  };

  filter_key = {
    advertiser_name: { name: '广告主名称', filter_type: 'string' },
    web_domain: { name: '网站域名', filter_type: 'string' },
    advertiser_type: { name: '所属行业', filter_type: 'single_select' },
  };
  filter = {
    advertiser_name: {
      op: '=',
      value: '',
    },
    web_domain: {
      op: '=',
      value: '',
    },
    advertiser_type: {
      op: '=',
      value: '',
    },
  };
  filter_result_array = [];
  job_value = {
    1: '教育',
    2: '互联网',
  };
  authState$ = this.store$.select((s) => s.auth);
  constructor(private manageService: ManageService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private store$: Store<AppState>,
    private auth: AuthService,
    private message: NzMessageService) {
    this.advertiserTypeRelation = this.manageItemService.advertiserTypeRelation;
    this.filterAdvertiserTypeOption = this.manageItemService.advertiserTypeList;
    this.noResultHeight = document.body.clientHeight - 272;

  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;

  }

  _refreshStatus(event?) {
    const allChecked = this.data.every((value) => value.disabled || value.checked);
    const allUnchecked = this.data.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this._indeterminate = ((!allUnchecked) && (!allChecked)) || allChecked;
    this._allChecked = allChecked;
  }

  _checkAll(value) {
    if (value) {
      this.data.forEach((data) => {
        if (!data.disabled) {
          data.checked = true;
        }
      });
      this._indeterminate = true;
    } else {
      this._indeterminate = false;
      this.data.forEach((data) => data.checked = false);
    }
  }

  addAdvertiser() {
    const add_modal = this.modalService.create({
      nzTitle: '创建广告主',
      nzWidth: 600,
      nzContent: AdvertFormComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'advert-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        setting: {
          advertiser_name: '',
          web_domain: '',
          advertiser_type: 2,
          log_pictrue: '',
          comments: '',
          department: '',
        },
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        this.auth.refreshUser$.next(1);
        this.refreshData();
      }

    });
  }

  editAdvertiser(cid) {
    this.manageService.getAdvertiser(cid).subscribe(
      (result) => {
        if (result['status_code'] && result.status_code === 200) {
          const advertSetting = result['data'];
          const edit_modal = this.modalService.create({
            nzTitle: '编辑广告主',
            nzWidth: 600,
            nzContent: AdvertFormComponent,
            nzClosable: false,
            nzMaskClosable: false,
            nzWrapClassName: 'advert-manage-modal',
            nzFooter: null,
            nzComponentParams: {
              cid,
              setting: advertSetting,
            },
          });
          edit_modal.afterClose.subscribe((edit_result) => {
            if (edit_result === 'onOk') {
              this.auth.refreshUser$.next(1);
              this.refreshData();
            }
          });
        } else if (result['status_code'] && result.status_code === 201) {
          this.message.error('广告主名称已经存在，请重试');
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
      },
    );
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    const postBody = {
      pConditions: [],
    };
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postBody.pConditions.push(item);
      }
    });
    this.manageService.getAdvertiserList(postBody, { page: this.currentPage, count: this.pageSize }).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.data = [];
          this.total = 0;
        } else {
          this.data = results['data']['detail'];
          this.total = results['data']['detail_count'];
        }
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
        this.data = [];
        this.total = 0;
        this.message.error('数据获取异常，请重试');
      },
      () => {
      },
    );
  }

  doStopAdvertisers(cid?: number) {
    const postBody = { cid: [] };
    if (isUndefined(cid)) {
      this.data.forEach((data) => {
        if (data.checked) {
          postBody.cid.push(data.cid);
        }
      });
    } else if (isNumber(cid) && cid > 0) {
      postBody.cid.push(cid);
    }
    if (postBody.cid.length > 0) {
      this.manageService.delAdvertiser(postBody).subscribe((result: any) => {
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
          this.message.error('API未实现，找言十！');
        }
      },
        (err: any) => {
          this.message.error('删除失败,请重试');
        },
        () => {
        });
    } else {
      this.message.info('请选择相关项操作');
    }
  }

  filterCancel() {

  }

  filterSearch() {
    this.filter_result_array = [];
    Object.keys(this.filter).forEach((item) => {
      if (this.filter[item].value || (typeof this.filter[item].value === 'number')) {
        this.filter_result_array.push({
          key: item,
          name: this.filter_key[item].name,
          op: this.filter[item].op ? (this.filter[item].op === '=' ? '为' : '不为') : '',
          value: this.filter_key[item].filter_type === 'string' ? this.filter[item].value : this[item + '_value'][this.filter[item].value],
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

  ngOnInit() {
    this.onWindowResize();
    this.refreshData();

  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

}
