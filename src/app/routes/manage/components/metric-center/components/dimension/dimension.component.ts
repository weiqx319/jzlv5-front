import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { AddDimensionComponent } from "../../../../modal/add-dimension/add-dimension.component";
import { DefineSettingService } from "../../../../service/define-setting.service";
import { ManageItemService } from "../../../../service/manage-item.service";
import { ManageService } from "../../../../service/manage.service";

@Component({
  selector: 'app-dimension',
  templateUrl: './dimension.component.html',
  styleUrls: ['./dimension.component.scss'],
})
export class DimensionComponent implements OnInit {
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;
  public advertiserList = [];
  filterResult = {
    pub_account_name: {
    },
    account_status: {
    },
    publisher_id: {

    },
    cid: {

    },
  };
  public publisherTypeRelation: Object;
  public noResultHeight = document.body.clientHeight - 272;

  constructor(private manageService: ManageService,
    private defineSettingService: DefineSettingService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService) {
    this.publisherTypeRelation = this.manageItemService.publisherTypeRelation;
    this.noResultHeight = document.body.clientHeight - 272;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;
  }

  _refreshStatus(event?) {
    const allChecked = this.apiData.every((value) => value.disabled || value.checked);
    const allUnchecked = this.apiData.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this._indeterminate = ((!allUnchecked) && (!allChecked)) || allChecked;
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
      this.apiData.forEach((data) => data.checked = false);
    }
  }

  addDim() {
    const add_modal = this.modalService.create({
      nzTitle: '创建维度',
      nzWidth: 600,
      nzContent: AddDimensionComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        this.refreshData();
      }

    });

  }

  editDim(dimId) {
    this.defineSettingService.getDimData(dimId).subscribe(
      (result) => {
        if (result['status_code'] && result.status_code === 200) {
          const dimData = result['data'];
          const editModal = this.modalService.create({
            nzTitle: '编辑维度',
            nzWidth: 600,
            nzContent: AddDimensionComponent,
            nzClosable: false,
            nzMaskClosable: false,
            nzWrapClassName: 'sub-company-manage-modal',
            nzFooter: null,
            nzComponentParams: {
              dimDataId: dimId,
              dimData,
            },
          });
          editModal.afterClose.subscribe((resultModal) => {
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
    this.defineSettingService.getDimList(postBody, { page: this.currentPage, count: this.pageSize }).subscribe(
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
      },
    );
  }
  getAdvertiserList() {
    this.manageService.getAdvertiserList({}, { result_model: 'all', need_publish_account: 0 }).subscribe((result) => {
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
    }, (err) => {

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
