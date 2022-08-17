import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { GlobalTemplateComponent } from '../../../../../../../shared/template/global-template/global-template.component';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';

@Component({
  selector: 'app-add-goods-list-drawer',
  templateUrl: './add-goods-list-drawer.component.html',
  styleUrls: ['./add-goods-list-drawer.component.scss']
})
export class AddGoodsListDrawerComponent implements OnInit {
  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  // @Input() adgroupData;
  @Input() goodsKey;
  @Input() curAccount;


  public loading = false;
  public apiData = [];
  public total = 0;
  public currentPage = 1;
  public pageSize = 30;
  public noResultHeight = document.body.clientHeight - 247;

  indeterminate = false;// 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public currentSelectedPage = 'current';


  public searchParams = {
    item_id: "",//商品ID
    title: '',//商品名称
    categories: [0],//级联商品类目id
    category_id: 0,//商品类目
    product_status: 0,//状态
  }
  public itemCategoryList = [];//商品类目列表
  public statusList = [//商品状态列表
    { value: 0, label: '全部状态' },
    { value: 1, label: '在售' },
    { value: 2, label: '已下架' },
    { value: 3, label: '审核中' },
    { value: 4, label: '审核待修改' },
    { value: 5, label: '审核拒绝' },
    { value: 6, label: '未知' },
  ];

  constructor(
    private _message: NzMessageService,
    private launchRpaService: LaunchRpaService,
    private subject: NzDrawerRef,
  ) {

  }

  ngOnInit() {
    this.refreshData();
    this.getItemCategoryList();
  }

  // 重置
  resetSearchData() {
    this.searchParams = {
      item_id: "",//商品ID
      title: '',//商品名称
      categories: [0],//级联商品类目id
      category_id: 0,//商品类目
      product_status: 0,//状态
    }
  }

  //保存搜索
  saveSearchData() {


    this.refreshData();
  }

  // 获取商品类目列表
  getItemList() {
    this.loading = true;
    this.launchRpaService.getJinNiuItemList({ "chan_pub_id": this.curAccount.id, ...this.searchParams }, {
      'page': this.currentPage,
      'count': this.pageSize,
    })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.total = 0;
            this._message.error('数据获取异常，请重试');
          } else {
            this.apiData = results['data']['detail'];
            this.total = results['data']['total_num'];
            // 回写已选商品状态
            if (this.curAccount[this.goodsKey]['item_id']) {
              this.apiData.forEach((data) => {
                if (this.curAccount[this.goodsKey]['item_id'] === data.item_id) {
                  this._refreshStatus(true, data);
                }
              });
            }
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
          this._message.error('数据获取异常，请重试');
        },
        () => { }
      );
  }
  // 获取商品类目列表
  getItemCategoryList() {
    this.loading = true;
    this.launchRpaService.getJinNiuItemCategoryList()
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.itemCategoryList = [];
            this._message.error('获取商品类目列表失败');
          } else {
            this.itemCategoryList = results['data'];
            this.itemCategoryList.unshift({
              "id": 0,
              "level": 1,
              "name": "全部类目",
              "title": "全部类目",
              "key": 0,
              "isLeaf": true
            })
          }
        },
        (err: any) => {
        },
        () => { }
      );
  }


  // 刷新
  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._allChecked = false;
    this.getItemList();
  }

  _checkAllPage(value) {
    this.currentSelectedPage = 'all';
    if (value) {
      this._allChecked = true;
      this.apiData.forEach((data) => {
        data['checked'] = true;
      });
    } else {
      this._allChecked = false;
      this.apiData.forEach((data) => (data['checked'] = false));
    }
  }

  _checkAll(value) {
    this._allChecked = false;
    if (this.indeterminate) {
      this._refreshStatus(false);
    }
  }

  _refreshStatus(event?, data?) {
    if (event) {
      // this.curAccount[this.goodsKey]['item_id'] = data?.item_id ? data.item_id : null;
      Object.assign(this.curAccount[this.goodsKey], data);
    } else {
      Object.assign(this.curAccount[this.goodsKey], {});
      // this.curAccount[this.goodsKey]['item_id'] = null;
    }

    this.apiData.forEach(element => {
      if (element.item_id === this.curAccount[this.goodsKey]['item_id']) {
        element['checked'] = true;
      } else {
        element['checked'] = false;
      }
    });

    if (this.curAccount[this.goodsKey]['item_id']) {
      this.indeterminate = true;
    } else {
      this.indeterminate = false;
    }
    this._allChecked = false;
  }

  cancel(): void {
    this.subject.close('onCancel');
  }

  save() {
    if (!this.curAccount[this.goodsKey]['item_id']) {
      this._message.warning('请选择商品');
      return
    }
    this.subject.close('onSuccess');
  }
  onChanges($event) {
    this.searchParams.category_id = this.searchParams.categories[this.searchParams.categories.length - 1];
  }
}
