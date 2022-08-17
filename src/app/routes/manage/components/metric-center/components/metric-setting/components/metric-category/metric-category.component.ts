import { AddMeticCategoryComponent } from '../../../../../../modal/add-metic-category/add-metic-category.component';
import { Component, HostListener, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DefineSettingService } from "../../../../../../service/define-setting.service";
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-metric-category',
  templateUrl: './metric-category.component.html',
  styleUrls: ['./metric-category.component.scss']
})
export class MetricCategoryComponent implements OnInit {
  public categoryList = [];
  public currentPage = 1;
  public pageSize = 20;
  public total = 0;
  public loading = true;
  public noResultHeight = document.body.clientHeight - 310;

  constructor(
    private modalService: NzModalService,
    private defineSettingService: DefineSettingService,
    private message: NzMessageService,
  ) { }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 310;
  }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this.defineSettingService.getMetricCategoryList({ page: this.currentPage, count: this.pageSize }).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.categoryList = [];
          this.total = 0;
        } else {
          this.categoryList = results['data']['detail'];
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

  editMetricCategory(categoryData) {
    const add_modal = this.modalService.create({
      nzTitle: '编辑指标分类',
      nzWidth: 600,
      nzContent: AddMeticCategoryComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        metricCategoryData: categoryData,
      }
    });
    add_modal.afterClose.subscribe(addResult => {
      if (addResult === 'onOk') {
        this.refreshData();
      }
    });

  }

  delMetricsCategory(categoryId?: number) {
    if (!!categoryId) {
      this.defineSettingService.deleteMetricCategory(categoryId).subscribe((result: any) => {
        if (result.status_code === 200) {
          this.message.success('删除成功');
          this.refreshData();
        }
      },
        (err: any) => {
          this.message.error('删除失败,请重试');
        },
        () => {
        });
    }
  }

  addMetricCategory() {
    const add_modal = this.modalService.create({
      nzTitle: '添加指标分类',
      nzWidth: 600,
      nzContent: AddMeticCategoryComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null
    });
    add_modal.afterClose.subscribe(addResult => {
      if (addResult === 'onOk') {
        this.refreshData();
      }
    });
  }
}
