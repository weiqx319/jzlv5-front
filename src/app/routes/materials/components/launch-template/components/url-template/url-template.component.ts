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

@Component({
  selector: 'app-url-template',
  templateUrl: './url-template.component.html',
  styleUrls: ['./url-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UrlTemplateComponent implements OnInit {

  @Input() urlType='deeplink_url';

// {'name': '调起URL', key: 'deeplink_url'},
// {'name': '小程序URL', key: 'applet_url'},
// {'name': '点击监测URL', key: 'click_monitor_url'},
//   4:调起url, 5:小程序url, 6:监测url
  public urlTypeMap = {
    'deeplink_url': 4,
    'applet_url': 5,
    'click_monitor_url': 6,
    'catalogue_list': 7,
  };

  public urlTypeNameMap = {
    'deeplink_url': '调起url',
    'applet_url': '小程序url',
    'click_monitor_url': '监测url' ,
    'catalogue_list': '商品目录' ,
  };



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

    const body = {
      "pConditions":[
        {
          "key":"app_url_type",
          "name":"",
          "op":"=",
          "value": this.urlTypeMap[this.urlType]
        }]
    };
    this.launchService
      .getAppTypeUrlList(body, {
        page: this.currentPage,
        count: this.pageSize,
        cid: this.cid,
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
    const tipTitle = '添加'+this.urlTypeNameMap[this.urlType];
    const add_modal = this.modalService.create({
      nzTitle: tipTitle,
      nzWidth: 900,
      nzContent: AddUrlTemplateComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-external-url',
      nzFooter: null,
      nzComponentParams: {
        isEdit: false,
        urlType:this.urlType,
        urlTypeMap:this.urlTypeMap,
        urlTypeNameMap:this.urlTypeNameMap
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

    const tipTitle = '修改'+this.urlTypeNameMap[this.urlType];

    const add_modal = this.modalService.create({
      nzTitle: tipTitle,
      nzWidth: 900,
      nzContent: AddUrlTemplateComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-external-url',
      nzFooter: null,
      nzComponentParams: {
        linkData: data,
        isEdit: true,
        urlType:this.urlType,
        urlTypeMap:this.urlTypeMap,
        urlTypeNameMap:this.urlTypeNameMap
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
    this.launchService.deleteAppTypeUrl(body, {cid: this.cid}).subscribe(result => {
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
