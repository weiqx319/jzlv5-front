import { Component, HostListener, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute } from "@angular/router";
import { AddTradeRuleComponent } from '../../modal/add-trade-rule/add-trade-rule.component';
import { TradeService } from '../../service/trade.service';
import { ManageTipComponent } from '../../modal/manage-tip/manage-tip.component';

@Component({
  selector: 'app-trade-rule',
  templateUrl: './trade-rule.component.html',
  styleUrls: ['./trade-rule.component.scss']
})
export class TradeRuleComponent implements OnInit {

  public ruleTypeObject = {};
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
  public publisherTypeRelation: object;
  public noResultHeight = document.body.clientHeight - 310;

  public trade_mark = {};
  public parentData: any;
  constructor(private tradeService: TradeService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute) {
    this.trade_mark['cid'] = this.route.snapshot.paramMap.get('id').split('_')[1];
    this.trade_mark['trade_mark_id'] = this.route.snapshot.paramMap.get('id').split('_')[0];
    this.ruleTypeObject = this.tradeService.getRuleTypeObject();
  }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 310;
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
      cid: this.parentData.cid,
      biz_unit_column: '',
      biz_unit_type: this.parentData['biz_unit_type']
    };
    this.tradeService.getTradeContentDetaiList(parm).subscribe(
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

  addRule() {
    const add_modal = this.modalService.create({
      nzTitle: '添加规则',
      nzWidth: 750,
      nzContent: AddTradeRuleComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        parentInfo: this.parentData
      }
    });
    add_modal.afterClose.subscribe(resultModal => {
      if (resultModal === 'onOk') {
        this.refreshData();
      }
    });

  }
  editRule(data) {
    const editModal = this.modalService.create({
      nzTitle: '编辑规则',
      nzWidth: 750,
      nzContent: AddTradeRuleComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        data: data,
        parentInfo: this.parentData
      }
    });
    editModal.afterClose.subscribe(resultModal => {
      if (resultModal === 'onOk') {
        this.refreshData();
      }
    });
  }

  copyRule(data) {
    const editModal = this.modalService.create({
      nzTitle: '复制规则',
      nzWidth: 750,
      nzContent: AddTradeRuleComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        data: data,
        parentInfo: this.parentData,
        source: 'copy'
      }
    });
    editModal.afterClose.subscribe(resultModal => {
      if (resultModal === 'onOk') {
        this.refreshData();
      }
    });
  }

  /*----编辑顺序-开始-----*/
  editOrder(data) {
    data['show'] = true;
    data['display_order_new'] = data['display_order'];
  }
  clickEditeOrderCancel(data) {
    data['show'] = false;
    data['display_order_new'] = null;
  }
  clickEditOrderOk(data) {
    if (data['display_order_new'] * 1 > 0 || data['display_order_new'].toString().split('.').length === 1) {

      const body = {
        id: data['id'],
        display_order: data['display_order_new']
      };
      this.tradeService.editOrder(body, this.parentData.cid).subscribe(result => {
        if (result.status_code === 200) {
          this.message.success('编辑成功');
          data['show'] = false;
          this.refreshData();
        } else {
          this.message.success(result.message, { nzDuration: 5000 });
          data['show'] = false;
        }
      }, error => {
        this.message.success('系统出错,请重试', { nzDuration: 5000 });
        data['show'] = false;
      });
    }

  }
  /*----编辑顺序-结束-----*/

  ngOnInit() {
    this.onWindowResize();
    this.getTradeInfo();
  }

  getTradeInfo() {
    this.tradeService.getTradeDetailById(this.trade_mark['trade_mark_id'], { cid: this.trade_mark['cid'] }).subscribe(result => {
      if (result.status_code === 200) {
        this.parentData = result.data;
        this.refreshData();
      }
    });
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
        this.tradeService.deleteRule({ id: id }, this.parentData.cid).subscribe(results => {
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
  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }
}
