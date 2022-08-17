import { Component, HostListener, OnInit } from '@angular/core';
import { ManageService } from "../../../../../../service/manage.service";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ManageItemService } from "../../../../../../service/manage-item.service";
import { DefineSettingService } from "../../../../../../service/define-setting.service";
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { MenuService } from '../../../../../../../../core/service/menu.service';
import { AddCompanyMetricDataComponent } from '../../../../../../modal/add-company-metric-data/add-company-metric-data.component';

@Component({
  selector: 'app-company-metric',
  templateUrl: './company-metric.component.html',
  styleUrls: ['./company-metric.component.scss']
})
export class CompanyMetricComponent implements OnInit {

  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 500;
  public isSortNumEditVisible = false;//排序值编辑窗口是否显示
  public isSortNumEditLoading = false;//排序值编辑窗口是否loading
  public sortNumEditId = null;
  public sortNumEditValue;

  //媒体列表
  public publiserList = [];

  public publisherTypeRelation: object;
  public noResultHeight = document.body.clientHeight - 310;
  filterResult = {
    pub_account_name: {
    },
    account_status: {
    },
    publisher_id: {

    },
    cid: {

    },
    category_id: {},
    metric_name: {}
  };

  //指标分类列表
  public categoryList = [];

  constructor(private manageService: ManageService,
    private defineSettingService: DefineSettingService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
    public menuService: MenuService) {
    this.publisherTypeRelation = this.manageItemService.publisherTypeRelation;
    this.publisherTypeRelation['publisher_id_999'] = '通用';
    this.noResultHeight = document.body.clientHeight - 310;
    this.publiserList = this.manageItemService.publisherTypeList.filter(item => [1, 6, 7].includes(item.key));
    this.publiserList = [{ name: '通用', key: 999 }, ...this.publiserList];

  }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 310;
  }

  // 获取指标分类列表
  getMetricCategoryList() {
    this.defineSettingService.getMetricCategoryList().subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.categoryList = [];
        } else {
          results['data']['detail'].map(item => {
            this.categoryList.push({
              'name': item.category_name,
              'key': item.category_id
            });
          });
        }
      },
      (err: any) => {
        this.message.error('指标分类数据获取异常，请重试');
      }
    );
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


  addCompanyMetric() {
    const add_modal = this.modalService.create({
      nzTitle: '添加集团指标',
      nzWidth: 600,
      nzContent: AddCompanyMetricDataComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        allCompanyMetric: this.apiData,
        categoryList: this.categoryList,
      }
    });
    add_modal.afterClose.subscribe(addResult => {
      if (addResult === 'onOk') {
        this.refreshData();
      }
    });

  }


  delCompanyMetric(metricId?: number) {
    this.defineSettingService.delCompanyMetric(metricId).subscribe((result: any) => {
      if (result.status_code === 200) {
        this.message.success('删除成功');
        this.refreshData();
      } else {
        this.message.error('系统异常,请重试');
      }
    },
      (err: any) => {
        this.message.error('删除失败,请重试');
      },
      () => {
      });
  }



  editCompanyMetric(metricId) {
    this.defineSettingService.getCompanyMetricData(metricId).subscribe(
      (result) => {
        if (result['status_code'] && result.status_code === 200) {
          const metricData = result['data'];
          const editModal = this.modalService.create({
            nzTitle: '编辑指标数据',
            nzWidth: 600,
            nzContent: AddCompanyMetricDataComponent,
            nzClosable: false,
            nzMaskClosable: false,
            nzWrapClassName: 'sub-company-manage-modal',
            nzFooter: null,
            nzComponentParams: {
              metricDataId: metricId,
              metricData: metricData,
              allCompanyMetric: this.apiData,
              categoryList: this.categoryList,
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
    this.defineSettingService.getCompanyMetricList(postBody, { page: this.currentPage, count: this.pageSize }).subscribe(
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


  ngOnInit() {
    this.onWindowResize();
    this.refreshData();
    this.getMetricCategoryList();

  }
  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

  // 修改是否默认
  changeMetricDefault(value) {
    const is_default = value.is_default ? 1 : 0;
    this.defineSettingService.updateMetricDefault(value.metric_id, { is_default: is_default }).subscribe((data: any) => {
      if (data['status_code'] && data.status_code === 200) {
        this.message.success('更新成功');
      } else {
        this.message.error(data.message);
      }
      this.refreshData();
    }, (err) => {
      this.message.error('系统异常，请重试');
    }, () => { });
  }
  // 修改排序值
  editSortNum(metricId, sortNum) {
    this.isSortNumEditVisible = true;
    this.sortNumEditId = metricId;
    this.sortNumEditValue = sortNum;
  }

  // 排序值提交修改
  submitSortNumEdit() {
    this.isSortNumEditLoading = true;
    this.defineSettingService.updateSortNum(this.sortNumEditId, { sort_num: this.sortNumEditValue }).subscribe((results: any) => {
      if (results.status_code === 200) {
        this.message.success('修改成功');
        this.refreshData();
      } else {
        this.message.error('修改失败，请重试');
      }
      this.isSortNumEditLoading = false;
      this.isSortNumEditVisible = false;
    },
      (err: any) => {
        this.isSortNumEditLoading = false;
        this.message.error('修改失败，请重试');
      },
      () => {
      });
  }
}
