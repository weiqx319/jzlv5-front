import { Component, HostListener, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute } from "@angular/router";
import { TradeService } from '../../service/trade.service';
import { TradeMarkEditItemComponent } from '../../modal/trade-mark-edit-item/trade-mark-edit-item.component';
import { ManageTipComponent } from '../../modal/manage-tip/manage-tip.component';

@Component({
  selector: 'app-two-mark-list',
  templateUrl: './two-mark-list.component.html',
  styleUrls: ['./two-mark-list.component.scss']
})
export class TwoMarkListComponent implements OnInit {


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

    }
  };
  public noResultHeight = document.body.clientHeight - 310;

  public trade_mark = []; //index( 0 :trade_id， 1：cid, 2: 父级的biz_unit_type, 3: 父级id)
  public parentData: any;
  public firstMark: any;
  public listFilter: any;
  public listFilterObject = {};
  constructor(private tradeService: TradeService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute) {
    this.trade_mark = this.route.snapshot.paramMap.get('id').split('_');

  }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 310;
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
    const parm = {
      page: this.currentPage,
      count: this.pageSize,
      cid: this.trade_mark[1],
      biz_unit_type: this.parentData['biz_unit_type']
    };
    this.tradeService.getTradeNameList(parm).subscribe(
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

  editTwoName(data) {
    const editModal = this.modalService.create({
      nzTitle: '编辑名称',
      nzWidth: 600,
      nzContent: TradeMarkEditItemComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        data: data,
        parentInfo: this.parentData,
        editFrom: 'bizUnitChildName'
      }
    });
    editModal.afterClose.subscribe(resultModal => {
      if (resultModal === 'onOk') {
        this.refreshData();
      }
    });
  }
  add() {

    const add_modal = this.modalService.create({
      nzTitle: '添加名称',
      nzWidth: 600,
      nzContent: TradeMarkEditItemComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        listFilter: this.listFilter,
        parentInfo: this.parentData,
        firstMark: this.firstMark,
        editFrom: 'addBizUnitChildName'
      }
    });
    add_modal.afterClose.subscribe(resultModal => {
      if (resultModal === 'onOk') {
        this.refreshData();
      }
    });
  }
  getTradeContentListFilter() {
    this.tradeService.getTradeContentListFilter({
      cid: this.parentData['cid'],
      biz_unit_type: 'biz_unit_' + this.trade_mark[2],
    }).subscribe(result => {
      if (result.status_code === 200) {
        this.listFilter = result.data;
        this.listFilter.forEach(item => {
          this.listFilterObject[item['key']] = item;
        });
      }
    });
  }
  getParentTradeInfo() {
    this.tradeService.getTradeDetailById(this.trade_mark[3], { cid: this.parentData['cid'] }).subscribe(result => {
      if (result.status_code === 200) {
        this.firstMark = result.data;
      }

    });
  }
  editParentUnit(data) {
    const editModal = this.modalService.create({
      nzTitle: '编辑父级标识',
      nzWidth: 600,
      nzContent: TradeMarkEditItemComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        data: data,
        listFilter: this.listFilter,
        parentInfo: this.parentData,
        editFrom: 'parentUnit'
      }
    });
    editModal.afterClose.subscribe(resultModal => {
      if (resultModal === 'onOk') {
        this.refreshData();
      }
    });

  }
  ngOnInit() {
    this.onWindowResize();
    this.getTradeInfo();
  }
  getTradeInfo() {
    this.tradeService.getTradeDetailById(this.trade_mark[0], { cid: this.trade_mark[1] }).subscribe(result => {
      if (result.status_code === 200) {
        this.parentData = result.data;
        this.getTradeContentListFilter();
        this.getParentTradeInfo();
        this.refreshData();
      }

    });
  }
  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }
  deleteOk(id) {
    const add_modal = this.modalService.create({
      nzTitle: '删除',
      nzWidth: 500,
      nzContent: ManageTipComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.tradeService.deleteTradeContent({ id: id }, this.trade_mark[1]).subscribe(results => {
          if (results['status_code'] === 200) {
            this.message.success('操作成功');
            this.refreshData();
          } else if (results['status_code'] === 205) {

          } else {
            this.message.success(results.message);
          }
        });
      }
    });

  }

}
