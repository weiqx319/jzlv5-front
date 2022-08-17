import { Component, HostListener, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TradeService } from '../../service/trade.service';
import { AddTradeMarkComponent } from '../../modal/add-trade-mark/add-trade-mark.component';
import { TradeMarkEditItemComponent } from '../../modal/trade-mark-edit-item/trade-mark-edit-item.component';
import { ManageService } from "../../../../routes/manage/service/manage.service";

@Component({
  selector: 'app-trade-mark-list',
  templateUrl: './trade-mark-list.component.html',
  styleUrls: ['./trade-mark-list.component.scss']
})
export class TradeMarkListComponent implements OnInit {


  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 5000;
  public advertiserList = [];
  public copyLoading = false;
  filterResult = {
    pub_account_name: {
    },
    account_status: {
    },
    publisher_id: {

    },
    cid: {

    }
  };
  public publisherTypeRelation: object;
  public noResultHeight = document.body.clientHeight - 272;

  public copyData = {
    "copy_cid": 25,
    "biz_unit_type": "",
    "add_cid": []
  };
  public isCopyVisible = false;
  public isCopyAlready = false;

  constructor(private tradeService: TradeService,
    private modalService: NzModalService,
    private manageService: ManageService,
    private message: NzMessageService) {
  }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;
  }

  /*  _refreshStatus() {
      const allChecked = this.apiData.every(value => value.disabled || value.checked);
      const allUnchecked = this.apiData.every(value => !value.checked);
      // 表示不是全选，但是有选中的
      this._indeterminate = ((!allUnchecked) && (!allChecked)) || allChecked;
      this._allChecked = allChecked;
    }*/
  /*
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
    }*/


  addTradeMark() {
    const add_modal = this.modalService.create({
      nzTitle: '添加行业标识项',
      nzWidth: 600,
      nzContent: AddTradeMarkComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });

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
    // this.loading = false;
    this.tradeService.getTradeList({ list_type: 'page',page: this.currentPage,
      count: this.pageSize, }).subscribe(
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
      () => {
      }
    );
  }
  ngOnInit() {
    this.onWindowResize();
    this.refreshData();
    this.getAdvertiserList();
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

  editTradeNameFirst(data) {
    const editModal = this.modalService.create({
      nzTitle: '编辑维度',
      nzWidth: 600,
      nzContent: TradeMarkEditItemComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        data: data,
        editFrom: 'tradeNameFirst'
      }
    });
    editModal.afterClose.subscribe(resultModal => {
      if (resultModal === 'onOk') {
        this.refreshData();
      }
    });
  }
  editTradeNameSecond(data) {
    const editModal = this.modalService.create({
      nzTitle: '编辑行业标识名称二级',
      nzWidth: 600,
      nzContent: TradeMarkEditItemComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        data: data,
        editFrom: 'tradeNameSecond'
      }
    });
    editModal.afterClose.subscribe(resultModal => {
      if (resultModal === 'onOk') {
        this.refreshData();
      }
    });
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

  cancelCopy() {
    this.isCopyVisible = false;
  }
  openCopyModal(data) {
    this.copyData.copy_cid = data['cid'];
    this.copyData.biz_unit_type = data['biz_unit_type'];
    this.copyData.add_cid = [];
    this.isCopyVisible = true;
    this.isCopyAlready = false;
  }

  copyOk() {
    if (this.isCopyAlready || this.copyLoading) {
      return;
    }
    this.copyLoading = true;
    this.tradeService.copyTrade(this.copyData, { list_type: 'page' }).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.error(results.message);
        } else {
          this.isCopyVisible = false;
          this.isCopyAlready = true;
          this.message.success('复制成功');
          this.refreshData();
        }
        this.copyLoading = false;
      },
      (err: any) => {
        this.copyLoading = false;
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );
  }


}
