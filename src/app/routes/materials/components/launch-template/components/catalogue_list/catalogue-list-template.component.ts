import {Component, HostListener, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {AuthService} from "../../../../../../core/service/auth.service";
import {CustomDatasService} from "../../../../../../shared/service/custom-datas.service";
import {MaterialsService} from "../../../../service/materials.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {LaunchService} from "../../../../service/launch.service";
import {AddAndroidDownloadLinkComponent} from "../../../../modal/add-android-download-link/add-android-download-link.component";
import {AddExternalUrlComponent} from "../../../../modal/add-external-url/add-external-url.component";
import {AddUrlTemplateComponent} from '../../../../modal/add-url-template/add-url-template.component';
import {MenuService} from '../../../../../../core/service/menu.service';
import {AddCatalogueListTemplateComponent} from '../../../../modal/add-catalogue-list-template/add-catalogue-list-template.component';

@Component({
  selector: 'app-catalogue-list-template',
  templateUrl: './catalogue-list-template.component.html',
  styleUrls: ['./catalogue-list-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CatalogueListTemplateComponent implements OnInit {

  @Input() urlType='catalogue_list';


  public showName = '商品目录';

  public noResultHeight = document.body.clientHeight - 187 - 40 - 40;

  public apiData: any = [];
  public total = 0;
  public loading = false;
  public currentPage = 1;
  public pageSize = 30;

  public cid;

  constructor(
    private modalService: NzModalService,
    private message: NzMessageService,
    private launchService: LaunchService,
    private authService: AuthService,
    private menuService: MenuService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.noResultHeight = document.body.clientHeight - 187 - 40 - 40;
  }

  ngOnInit() {
    this.refreshData();
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }

    this.loading = true;
    this.launchService
      .getCatalogueList({
        page: this.currentPage,
        count: this.pageSize,
        cid: this.cid,
        publisher_id:this.menuService.currentPublisherId,
      })
      .subscribe(
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
        () => {},
      );
  }

  addCatalogueList() {
    const tipTitle = '添加'+this.showName;
    const add_modal = this.modalService.create({
      nzTitle: tipTitle,
      nzWidth: 900,
      nzContent: AddCatalogueListTemplateComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-external-url',
      nzFooter: null,
      nzComponentParams: {
        isEdit: false,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }

  editCatalogueList(data) {

    const tipTitle = '修改'+this.showName;

    const add_modal = this.modalService.create({
      nzTitle: tipTitle,
      nzWidth: 900,
      nzContent: AddCatalogueListTemplateComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-external-url',
      nzFooter: null,
      nzComponentParams: {
        catalogueData: data,
        isEdit: true,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

  deleteCatalogueList(data) {
    const body = {
      "publisher_id": this.menuService.currentPublisherId,
      "channel_id": this.menuService.currentChannelId,
      "catalogue_id" : data['catalogue_id'],
    };
    this.loading = true;
    this.launchService.deleteCatalogueList(body, {cid: this.cid,publisher_id:this.menuService.currentPublisherId}).subscribe(result => {
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
  }
}
