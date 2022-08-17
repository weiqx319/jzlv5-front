import { Component, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UploadConversionComponent } from "../../../../modal/upload-conversion/upload-conversion.component";
import { ManageService } from "../../../../service/manage.service";
import { ManageItemService } from "../../../../service/manage-item.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { AddConversionDataComponent } from "../../../../modal/add-conversion-data/add-conversion-data.component";
import { DefineSettingService } from "../../../../service/define-setting.service";
import { environment } from "../../../../../../../environments/environment";
import { isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../../../core/service/auth.service";
import { ConversionUploadService } from "../../../../service/conversion-upload.service";
import { Observable } from "rxjs";

@Component({
  selector: 'app-conversion-data',
  templateUrl: './conversion-data.component.html',
  styleUrls: ['./conversion-data.component.scss']
})
export class ConversionDataComponent implements OnInit {
  public noResultHeight = document.body.clientHeight - 272;

  public apiData = [];
  public loading = true;
  public logPageInfo = {
    pageSize: 500,
    total: 0,
    currentPage: 1,
  };

  //转化数据格式（上传）
  public conversionType = [];
  public conversionTypeRelation = {};

  public cid: any;
  public advertiserList = [];
  public filterResult = {
    publisher_id: {},
    original_file_name: {
    },
    cid: {},
    conver_name: {},
  };
  public can_nav = true;

  constructor(
    private modalService: NzModalService,
    private manageService: ManageService,
    private defineSettingService: DefineSettingService,
    private message: NzMessageService,
    public uploadService: ConversionUploadService
  ) {
    this.conversionType = this.manageService.getConversionTypeItems();
    this.conversionTypeRelation = this.manageService.getConversionTypeObj();
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;
  }

  ngOnInit() {
    this.getAdvertiserList();
    this.refreshData();
    this.manageService.getCanJump().subscribe(result => {
      this.can_nav = result;
    });
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
        this.cid = this.advertiserList.length ? this.advertiserList[0]['key'] : null;

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


  refreshData(status?) {
    this.logPageInfo.currentPage = 1;
    const postBody = {
      'pConditions': []
    };
    Object.values(this.filterResult).forEach(item => {
      if (item.hasOwnProperty('key')) {
        postBody.pConditions.push(item);
      }
    });

    this.defineSettingService.getConversionUploadList(postBody, { page: this.logPageInfo.currentPage, count: this.logPageInfo.pageSize }).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.apiData = [];
          this.logPageInfo.total = 0;
        } else {
          this.apiData = results['data']['detail'];
          this.logPageInfo.total = results['data']['detail_count'];

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


  clickUploadBtn() {
    const add_modal = this.modalService.create({
      nzTitle: '上传转化数据',
      nzWidth: 600,
      nzContent: UploadConversionComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        conversionType: this.conversionType,
        advertiserList: this.advertiserList
      }
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
      if (result['can_jump'] === true) {
        this.can_nav = true;
      } else if (result['can_jump'] === false) {
        this.can_nav = false;
      }
    });
  }

  doFilter() {
    this.logPageInfo.currentPage = 1;
    this.refreshData();
  }

  downloadConversion(data) {
    this.defineSettingService.getDownloadConversion(data.upload_id, { cid: data.cid }).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.info('当前转化数据不可下载');
        } else {
          const cacheKey = results['data']['cache_key'];
          window.open(environment.SERVER_API_URL + '/files_down/' + cacheKey);
        }
      },
      (err: any) => {
        this.message.error('系统异常');
      },
      () => {
      }
    );
  }
}
