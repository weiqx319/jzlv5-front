import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { ManageService } from '../../../../../../service/manage.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AddConversionDescComponent } from '../../../../../../modal/add-conversion-desc/add-conversion-desc.component';
import { DefineSettingService } from '../../../../../../service/define-setting.service';

@Component({
  selector: 'app-conversion-desc',
  templateUrl: './conversion-desc.component.html',
  styleUrls: ['./conversion-desc.component.scss']
})
export class ConversionDescComponent implements OnInit {
  public apiData = [];
  public loading = true;
  public pageInfo = {
    pageSize: 50,
    total: 0,
    currentPage: 1
  };

  public noResultHeight = document.body.clientHeight - 310;
  public advertiserList = [];
  filterResult = {
    cid: {}
  };
  //数据来源关系
  public conversionSourceTypeRelation = {};

  //推送方式关系
  public conversionImTypeTypeRelation = {};

  constructor(
    private manageService: ManageService,
    private defineSettingService: DefineSettingService,
    private modalService: NzModalService,
    private message: NzMessageService
  ) {
    this.noResultHeight = document.body.clientHeight - 310;
    this.conversionSourceTypeRelation = this.manageService.getConversionSourceTypeObj();
    this.conversionImTypeTypeRelation = this.manageService.getConversionImTypeObj();
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 310;
  }

  addConversionDesc() {
    const add_modal = this.modalService.create({
      nzTitle: '添加转化描述',
      nzWidth: 600,
      nzContent: AddConversionDescComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

  editConversionDesc(descId) {
    this.defineSettingService.getConversionDesc(descId).subscribe(
      result => {
        if (result['status_code'] && result.status_code === 200) {
          const conversionDesc = result['data'];
          const editModal = this.modalService.create({
            nzTitle: '编辑转化描述',
            nzWidth: 600,
            nzContent: AddConversionDescComponent,
            nzClosable: false,
            nzMaskClosable: false,
            nzWrapClassName: 'sub-company-manage-modal',
            nzFooter: null,
            nzComponentParams: {
              conversionDescId: descId,
              conversionDesc: conversionDesc
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
      },
      err => {

        this.message.error('系统异常，请重试');
      }
    );
  }

  refreshData(status?) {
    this.loading = true;
    if (status) {
      this.pageInfo.currentPage = 1;
    }
    const postBody = {
      pConditions: []
    };
    Object.values(this.filterResult).forEach(item => {
      if (item.hasOwnProperty('key')) {
        postBody.pConditions.push(item);
      }
    });

    this.defineSettingService
      .getConversionDescList(postBody, {
        page: this.pageInfo.currentPage,
        count: this.pageInfo.pageSize
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.apiData = results['data']['detail'];
            this.pageInfo.total = results['data']['detail_count'];
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
          this.message.error('数据获取异常，请重试');
        },
        () => { }
      );
  }

  getAdvertiserList() {
    this.manageService.getAdvertiserList({}, { result_model: 'all', need_publish_account: 0 }).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        result['data'].forEach((item) => {
          this.advertiserList.push({
            'name': item.advertiser_name,
            'key': item.cid
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
    }
    );
  }

  ngOnInit() {
    this.onWindowResize();
    this.refreshData();
    this.getAdvertiserList();
  }
  doFilter() {
    this.pageInfo.currentPage = 1;
    this.refreshData();
  }
}
