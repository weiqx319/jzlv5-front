import {Component, HostListener, OnInit} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {ActivatedRoute, Router} from "@angular/router";
import {MaterialsService} from "../../../../service/materials.service";
import {AuthService} from "../../../../../../core/service/auth.service";
import {AddDocumentModalComponent} from "../../../../modal/add-document-modal/add-document-modal.component";
import {UploadDoucumentsModalComponent} from "../../../../modal/upload-doucuments-modal/upload-doucuments-modal.component";
import {AddDocumentGroupComponent} from "../../../../modal/add-document-group/add-document-group.component";
import {AddDocumentGroupManageComponent} from "../../../../modal/add-document-group-manage/add-document-group-manage.component";
import {MenuService} from '../../../../../../core/service/menu.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {

  public publisherList = {
    7: '头条',
    1: '百度',
  };

  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData: any = [];
  public total = 0;
  public loading = false;
  public currentPage = 1;
  public pageSize = 30;

  public listQueryParams = {
    pConditions: [],
  };

  filterResult = {
    title: {},
  };
  public publisher_id = 7;

  public cid;

  public noResultHeight = document.body.clientHeight - 187 - 40 - 40;

  constructor(private modalService: NzModalService,
              private message: NzMessageService,
              private route: ActivatedRoute,
              private router: Router,
              private materialsService: MaterialsService,
              private menuService:MenuService,
              private authService: AuthService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.publisher_id = this.menuService.currentPublisherId;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 187 - 40 - 40;
  }

  ngOnInit() {
    this.refreshData();
  }

  _refreshStatus(event?) {
    const allChecked = this.apiData.every(
      (value) => value.checked,
    );
    const allUnchecked = this.apiData.every((value) => !value.checked);

    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;
  }

  _checkAll(value) {
    if (value) {
      this.apiData.forEach((data) => {
        data.checked = true;
      });
      this._indeterminate = true;
    } else {
      this._indeterminate = false;
      this.apiData.forEach((data) => (data.checked = false));
    }
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;
    this.listQueryParams.pConditions = [];
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        this.listQueryParams.pConditions.push(item);
      }
    });

    this.loading = true;

    this.materialsService
      .getLaunchTitleList(this.listQueryParams, {
        page: this.currentPage,
        count: this.pageSize,
        cid: this.cid,
        publisher_id:this.menuService.currentPublisherId
      })
      .subscribe(
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
        () => {},
      );
  }

  addDocument() {
    const add_modal = this.modalService.create({
      nzTitle: '文案上传',
      nzWidth: 800,
      nzContent: AddDocumentModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-document-modal',
      nzFooter: null,
      nzComponentParams: {
        publisherId: this.menuService.currentPublisherId,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }

  addDocuments() {
    const add_modal = this.modalService.create({
      nzTitle: '批量上传',
      nzWidth: 800,
      nzContent: UploadDoucumentsModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'upload-documents-modal',
      nzFooter: null,
      nzComponentParams: {
        publisherId: this.menuService.currentPublisherId,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }

  deleteDocuments() {
    const titleIds = [];
    this.apiData.forEach((item) => {
      if (item.checked) {
        titleIds.push(item.title_id);
      }
    });

    if (titleIds.length > 0) {
      const body = {
        title_id_list: [...titleIds]
      };
      this.loading = true;
      this.materialsService.deleteLaunchTitles(body, {cid: this.cid,publisher_id:this.menuService.currentPublisherId}).subscribe(result => {
        if (result.status_code && result.status_code === 200) {
          this.message.success('删除成功');
          this.refreshData();
        } else {
          this.message.error(result.message);
        }
        this.loading = false;
      }, (err: any) => {
        this.loading = false;
        this.message.error('系统异常，请重试');
      });
    } else {
      this.message.info('请选择相关项操作');
    }
  }

  addDocumentGroups(data?) {
    const select = [];
    if (data) {
      select.push(data);
    } else {
      this.apiData.forEach((item) => {
        if (item.checked) {
          select.push(item);
        }
      });
    }

    const add_modal = this.modalService.create({
      nzTitle: '文案组管理',
      nzWidth: 800,
      nzContent: AddDocumentGroupManageComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-document-group-manage',
      nzFooter: null,
      nzComponentParams: {
        data: select
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
      }
    });
  }

}
