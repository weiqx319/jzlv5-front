import {Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {AuthService} from "../../../../../../core/service/auth.service";
import {CustomDatasService} from "../../../../../../shared/service/custom-datas.service";
import {MaterialsService} from "../../../../service/materials.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {LaunchService} from "../../../../service/launch.service";
import {AddAndroidDownloadLinkComponent} from "../../../../modal/add-android-download-link/add-android-download-link.component";
import {AddExternalUrlComponent} from "../../../../modal/add-external-url/add-external-url.component";
import {MenuService} from "../../../../../../core/service/menu.service";

@Component({
  selector: 'app-landing-page-template',
  templateUrl: './landing-page-template.component.html',
  styleUrls: ['./landing-page-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LandingPageTemplateComponent implements OnInit {

  public noResultHeight = document.body.clientHeight - 187 - 40 - 40;

  public apiData: any = [];
  public total = 0;
  public loading = false;
  public currentPage = 1;
  public pageSize = 30;

  public cid;
  public publisherId = 7;


  constructor(
    private modalService: NzModalService,
    private message: NzMessageService,
    private launchService: LaunchService,
    private authService: AuthService,
    private menuService: MenuService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.publisherId = this.menuService.currentPublisherId;
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

    const body = {
      "pConditions":[
        {
          "key":"app_url_type",
          "name":"",
          "op":"=",
          "value":"3"
        }]
    };
    this.launchService
      .getAppTypeUrlList(body, {
        page: this.currentPage,
        count: this.pageSize,
        cid: this.cid,
        publisher_id:this.publisherId,
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

  addLink() {
    const add_modal = this.modalService.create({
      nzTitle: '添加落地页链接',
      nzWidth: 900,
      nzContent: AddExternalUrlComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-external-url',
      nzFooter: null,
      nzComponentParams: {
        isEdit: false
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }

  editLink(data) {
    const add_modal = this.modalService.create({
      nzTitle: '修改落地页',
      nzWidth: 900,
      nzContent: AddExternalUrlComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-external-url',
      nzFooter: null,
      nzComponentParams: {
        linkData: data,
        isEdit: true,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

  deleteAppUrlType(data) {
    const body = {
      id_list: [data.app_url_id]
    };
    this.loading = true;
    this.launchService.deleteAppTypeUrl(body, {cid: this.cid,publisher_id:this.publisherId}).subscribe(result => {
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
