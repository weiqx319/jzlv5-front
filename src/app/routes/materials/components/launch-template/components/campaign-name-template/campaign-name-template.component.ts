import {Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {MaterialsService} from "../../../../service/materials.service";
import {AuthService} from "../../../../../../core/service/auth.service";
import {CustomDatasService} from "../../../../../../shared/service/custom-datas.service";
import {AddDocumentModalComponent} from "../../../../modal/add-document-modal/add-document-modal.component";
import {AddCampaignNameComponent} from "../../../../modal/add-campaign-name/add-campaign-name.component";
import {LaunchService} from "../../../../service/launch.service";

@Component({
  selector: 'app-campaign-name-template',
  templateUrl: './campaign-name-template.component.html',
  styleUrls: ['./campaign-name-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CampaignNameTemplateComponent implements OnInit {

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

    // this.loading = true;

    // this.launchService
    //   .getLaunchTitleList(this.listQueryParams, {
    //     page: this.currentPage,
    //     count: this.pageSize,
    //     cid: this.cid,
    //   })
    //   .subscribe(
    //     (results: any) => {
    //       if (results.status_code !== 200) {
    //         this.apiData = [];
    //         this.total = 0;
    //       } else {
    //         this.apiData = results['data']['detail'];
    //         this.total = results['data']['detail_count'];
    //       }
    //       this.loading = false;
    //     },
    //     (err: any) => {
    //       this.loading = false;
    //       this.message.error('数据获取异常，请重试');
    //     },
    //     () => {},
    //   );
  }

  addCampaignName() {
    const add_modal = this.modalService.create({
      nzTitle: '添加单元命名模板',
      nzWidth: 800,
      nzContent: AddCampaignNameComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-campaign-name',
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

  editCampaignName(data) {
    const add_modal = this.modalService.create({
      nzTitle: '修改单元命名模板',
      nzWidth: 800,
      nzContent: AddCampaignNameComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-campaign-name',
      nzFooter: null,
      nzComponentParams: {
        campaignNameData: data,
        isEdit: true,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }

  deleteCampaignName(data) {
    const body = {

    };
    this.loading = true;
    // this.launchService.deleteCampaignName(body, {cid: this.cid}).subscribe(result => {
    //   if (result.status_code && result.status_code === 200) {
    //     this.message.success('删除成功');
    //     this.refreshData();
    //   } else {
    //     this.message.error(result.message);
    //   }
    //   this.loading = false;
    // }, (err: any) => {
    //   this.loading = false;
    //   this.message.error('系统异常，请重试');
    // });
  }

}
