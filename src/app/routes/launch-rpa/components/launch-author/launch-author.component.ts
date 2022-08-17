import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../core/service/auth.service";
import {AddMaterialsAuthorComponent} from "../../modal/add-materials-author/add-materials-author.component";
import {MaterialsService} from "../../service/materials.service";
import {MenuService} from "../../../../core/service/menu.service";
import {LaunchRpaService} from '../../service/launch-rpa.service';
import {GlobalTemplateComponent} from '../../../../shared/template/global-template/global-template.component';

@Component({
  selector: 'app-launch-author',
  templateUrl: './launch-author.component.html',
  styleUrls: ['./launch-author.component.scss']
})
export class LaunchAuthorComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;

  public filterRoleOption = [
    { key: '1', name: '编导' },
    { key: '2', name: '摄影' },
    { key: '3', name: '剪辑' },
  ];
  public listQueryParams = {
    pConditions: [],
  };

  filterResult = {
    author_name: {},
    author_role: {},
  };
  sort_item = {};
  filter_result_array = [];

  public noResultHeight = document.body.clientHeight - 287;

  public cid;

  constructor(private modalService: NzModalService,
              private message: NzMessageService,
              private route: ActivatedRoute,
              private router: Router,
              public launchRpaService: LaunchRpaService,
              private authService: AuthService,
              public menuService:MenuService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 240;
  }

  ngOnInit() {
    this.refreshData();
  }

  _refreshStatus(event?) {
    const allChecked = this.apiData.every(
      (value) => value.disabled || value.checked,
    );
    const allUnchecked = this.apiData.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
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

    this.launchRpaService
      .getMaterialsAuthorList(this.listQueryParams, {
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


  createAuthor() {
    const add_modal = this.modalService.create({
      nzTitle: '添加作者',
      nzWidth: 600,
      nzContent: AddMaterialsAuthorComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-materials-author',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }

  editAuthor(data) {
    const add_modal = this.modalService.create({
      nzTitle: '修改作者',
      nzWidth: 600,
      nzContent: AddMaterialsAuthorComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-materials-author',
      nzFooter: null,
      nzComponentParams: {
        data
      }
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

  deleteAuthor(data) {
    this.loading = true;
    const body= {"ids":[data.material_author_id]};
    this.launchRpaService.deleteMaterialsAuthor(body, {cid: this.cid,publisher_id:this.menuService.currentPublisherId}).subscribe(result => {
      if (result.status_code === 200) {
        this.loading = false;
        this.refreshData();
        this.message.success('删除成功');
      } else {
        this.loading = false;
        this.message.error(result.message, {nzDuration: 3000});
      }
    }, (err: any) => {
      this.loading = false;
      this.message.error('数据获取异常，请重试');
    });
  }

}
