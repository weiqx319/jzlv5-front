import { AfterViewInit, Component, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ManageService } from "../../../../../../service/manage.service";
import { ManageItemService } from "../../../../../../service/manage-item.service";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { AddConversionDataComponent } from "../../../../../../modal/add-conversion-data/add-conversion-data.component";
import { DefineSettingService } from "../../../../../../service/define-setting.service";
import { environment } from "../../../../../../../../../environments/environment";
import { isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../../../../../core/service/auth.service";
import { UploadConversionComponent } from "../../../../../../modal/upload-conversion/upload-conversion.component";
import { ConversionUploadService } from "../../../../../../service/conversion-upload.service";
import { Observable } from "rxjs";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-conversion',
  templateUrl: './conversion.component.html',
  styleUrls: ['./conversion.component.scss']
})
export class ConversionComponent implements OnInit {
  public show_type = 'config';
  public can_nav = true;
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData = [];
  public loading = true;
  public pageInfo = {
    pageSize: 500,
    total: 0,
    currentPage: 1,
  };
  public logPageInfo = {
    pageSize: 500,
    total: 0,
    currentPage: 1,
  };

  public publisherTypeRelation: Object;
  public noResultHeight = document.body.clientHeight - 310;

  //数据来源关系
  public conversionSourceTypeRelation = {};

  //推送方式关系
  public conversionImTypeTypeRelation = {};

  //转化数据格式（上传）
  public conversionType = [];
  public conversionTypeRelation = {};

  public fileList = [];
  public cid: any;
  public source_type = '1';
  public uploading = false;
  public showUpload = false;
  public advertiserList = [];
  filterResult = {
    publisher_id: {},
    original_file_name: {
    },
    cid: {},
    conver_name: {},
  };
  // public show_type = 'config'; //config：配置  log:日志

  @ViewChild('nzSelectUpload') childComponent: NzSelectComponent;
  @ViewChild('nzSelectUploadSource') sourceChildComponent: NzSelectComponent;

  constructor(
    private manageService: ManageService,
    private defineSettingService: DefineSettingService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private renderer: Renderer2,
    private authService: AuthService,
    public uploadService: ConversionUploadService,
    private route: ActivatedRoute,
  ) {
    this.publisherTypeRelation = this.manageItemService.publisherTypeRelation;
    this.noResultHeight = document.body.clientHeight - 310;
    this.conversionSourceTypeRelation = this.manageService.getConversionSourceTypeObj();
    this.conversionImTypeTypeRelation = this.manageService.getConversionImTypeObj();
    this.conversionType = this.manageService.getConversionTypeItems();
    this.conversionTypeRelation = this.manageService.getConversionTypeObj();
    this.route.data.subscribe((data) => {
      this.show_type = data['showType'];
    });
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 310;
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

  addConversionData() {
    const add_modal = this.modalService.create({
      nzTitle: '添加转化数据',
      nzWidth: 1000,
      nzContent: AddConversionDataComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }


  editConversionData(conversionId) {
    this.defineSettingService.getConversionData(conversionId).subscribe(
      (result) => {
        if (result['status_code'] && result.status_code === 200) {
          const conversionData = result['data'];
          const editModal = this.modalService.create({
            nzTitle: '编辑转化数据',
            nzWidth: 1000,
            nzContent: AddConversionDataComponent,
            nzClosable: false,
            nzMaskClosable: false,
            nzWrapClassName: 'sub-company-manage-modal',
            nzFooter: null,
            nzComponentParams: {
              conversionDataId: conversionId,
              conversionData: conversionData
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
    if (status && status === 'config') {
      this.pageInfo.currentPage = 1;

    } else if (status && status === 'log') {
      this.logPageInfo.currentPage = 1;
    }
    const postBody = {
      'pConditions': []
    };
    Object.values(this.filterResult).forEach(item => {
      if (item.hasOwnProperty('key')) {
        postBody.pConditions.push(item);
      }
    });

    if (this.show_type === 'config') {
      this.defineSettingService.getConversionList(postBody, { page: this.pageInfo.currentPage, count: this.pageInfo.pageSize }).subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.pageInfo.total = 0;
          } else {
            this.apiData = results['data']['detail'];
            this.pageInfo.total = results['data']['detail_count'];
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
    } else if (this.show_type === 'log') {
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

  }

  cancelUpload() {
    this.showUpload = false;
    this.fileList = [];
  }

  beforeUpload = (file: File) => {
    this.fileList = [file];
    return false;

    // const isJpgPng = ['image/png', 'image/jpeg'].indexOf(file.type) > -1;
    // if (!isJpgPng) {
    //   this.message.error('只能上传.jpg/.png格式的图片!');
    // }
    // const isLt2M = file.size / 1024 / 1024 < 2;
    // if (!isLt2M) {
    //   this.message.error('图片大小需小于2M!');
    // }
    //
    // return false;
  }


  handleUpload() {
    if (this.fileList.length > 0) {
      this.uploading = true;
      const formData = new FormData();
      formData.append('conversion_file', this.fileList[0]);
      formData.append('cid', this.cid);
      formData.append('source_type', this.source_type);
      this.defineSettingService.uploadConversionData(formData).subscribe(result => {
        if (result.status_code && result.status_code === 200) {
          this.uploading = false;
          this.showUpload = false;
          this.message.success('上传成功');
        } else {
          this.uploading = false;
          this.message.error('上传失败');
        }
      });
    } else {
      this.message.info('请选择文件');
    }
  }
  downloadTemplate() {
    window.open(environment.SERVER_API_URL + "/setting/conversion/down_template?user_id=" + this.authService.getCurrentAdminOperdInfo().select_uid + '& cid=' + this.cid + '& source_type=' + this.source_type);
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
  ngOnInit() {
    this.onWindowResize();
    this.getAdvertiserList();
    this.refreshData();
    // this.loading = false;

    this.manageService.getCanJump().subscribe(result => {
      this.can_nav = result;
    });
  }
  doFilter() {
    if (this.show_type === 'config') {
      this.pageInfo.currentPage = 1;
    } else if (this.show_type === 'log') {
      this.logPageInfo.currentPage = 1;
    }

    this.refreshData();
  }

  getRefererNzSelect(): void {
    setTimeout(() => {
      if (!isUndefined(this.childComponent)) {
        this.renderer.setStyle(this.childComponent.cdkConnectedOverlay.overlayRef.hostElement, 'z-index', 1111);
      }
      if (!isUndefined(this.sourceChildComponent)) {
        this.renderer.setStyle(this.sourceChildComponent.cdkConnectedOverlay.overlayRef.hostElement, 'z-index', 1111);
      }
    });
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
  changeActive(type) {
    this.loading = true;
    this.apiData = [];
    this.show_type = type;
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

  // 修改是否默认
  changeConversionDefault(value) {
    const is_default = value.is_default ? 1 : 0;

    this.defineSettingService.updateConversionDefault(value.conver_define_id, { is_default: is_default }).subscribe(data => {
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

  changeTabItem(tabItem) {
    this.loading = true;
    this.apiData = [];
    this.show_type = tabItem.type;
    this.refreshData();
  }
}
