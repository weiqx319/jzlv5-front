import { AfterViewInit, Component, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ManageService } from "../../../../service/manage.service";
import { ManageItemService } from "../../../../service/manage-item.service";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { AddConversionDataComponent } from "../../../../modal/add-conversion-data/add-conversion-data.component";
import { DefineSettingService } from "../../../../service/define-setting.service";
import { environment } from "../../../../../../../environments/environment";
import { isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../../../core/service/auth.service";
import { UploadConversionComponent } from "../../../../modal/upload-conversion/upload-conversion.component";
import { ConversionUploadService } from "../../../../service/conversion-upload.service";
import { Observable } from "rxjs";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-manual-data',
  templateUrl: './manual-data.component.html',
  styleUrls: ['./manual-data.component.scss']
})
export class ManualDataComponent implements OnInit {
  public addModal = null;

  public uploadForm: FormGroup;
  public uploadSetting = {
  };
  public advertiserLists = [];
  public submitting = false;
  public uploading = false;
  public showUpload = false;
  public fileList = [];
  public speed = 0;
  public exception = 'active';



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

  public publisherTypeRelation: object;
  public noResultHeight = document.body.clientHeight - 272;

  //数据来源关系
  public conversionSourceTypeRelation = {};

  //推送方式关系
  public conversionImTypeTypeRelation = {};

  //数据格式（上传）
  public conversionType = [];
  public conversionTypeRelation = {};

  public cid: any;
  public source_type = '1';
  public advertiserList = [];
  filterResult = {
    publisher_id: {},
    original_file_name: {
    },
    cid: {}
  };
  public can_nav = true;
  public productInfo = {};

  @ViewChild('nzSelectUpload') childComponent: NzSelectComponent;
  @ViewChild('nzSelectUploadSource') sourceChildComponent: NzSelectComponent;

  constructor(private manageService: ManageService,
    private fb: FormBuilder,
    private defineSettingService: DefineSettingService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private renderer: Renderer2,
    private authService: AuthService,
    public uploadService: ConversionUploadService,
    private productService: ProductDataService) {
    this.publisherTypeRelation = this.manageItemService.publisherTypeRelation;
    this.noResultHeight = document.body.clientHeight - 272;
    this.conversionSourceTypeRelation = this.manageService.getConversionSourceTypeObj();
    this.conversionImTypeTypeRelation = this.manageService.getConversionImTypeObj();
    this.conversionType = this.manageService.getConversionTypeItems();
    this.conversionTypeRelation = this.manageService.getConversionTypeObj();
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });

    this.uploadForm = this.fb.group({
      cid: [0, [Validators.required]],
    });
  }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;
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


  refreshData(status?) {

    if (status) {
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

    this.defineSettingService.getManualUploadLogList(postBody, { page: this.logPageInfo.currentPage, count: this.logPageInfo.pageSize }).subscribe(
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


  getFormControl(name) {
    return this.uploadForm.controls[name];
  }

  cancelUpload() {
    this.showUpload = false;
    this.fileList = [];
    this.addModal.destroy('onCancel');
    this.manageService.setCanJump(true);
  }
  beforeUpload = (file: File) => {
    this.fileList = [file];
    this.exception = 'active';
    // return false;

    // const isJpgPng = ['image/png', 'image/jpeg'].indexOf(file.type) > -1;
    // if (!isJpgPng) {
    //   this.message.error('只能上传.jpg/.png格式的图片!');
    // }
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      // this.message.error('文件大小需小于50M!');

      this.message.error('文件大小需小于50M!', { nzDuration: 2000 });
      this.fileList = [];
    }
    return false;
  }

  handleUpload() {

    if (this.fileList.length > 0) {
      this.manageService.setCanJump(false);
      this.uploading = true;
      this.exception = 'active';


      const formData = new FormData();
      formData.append('manual_file', this.fileList[0]);


      this.defineSettingService.uploadManualDataNew(formData).subscribe(
        (event: HttpEvent<{}>) => {

          if (event.type === HttpEventType.UploadProgress) {
            if (event.total > 0) {
              // tslint:disable-next-line:no-any
              (event as any).percent = event.loaded / event.total * 100;
              this.speed = Math.round((event as any).percent);

            }
            // 处理上传进度条，必须指定 `percent` 属性来表示进
          } else if (event instanceof HttpResponse) {
            // 处理成功

            this.uploading = false;
            this.showUpload = false;
            this.message.success('上传成功');
            this.addModal.destroy('onOk');
            this.manageService.setCanJump(true);
          }
        }, (err) => {
          // 处理失败
          // this.uploading = false;
          this.manageService.setCanJump(true);
          this.uploading = false;
          this.exception = 'exception';
          this.message.error('上传失败');
          //
        }, () => {
          this.manageService.setCanJump(true);
        }
        /*result => {
        this.manageService.setCanJump(true);
        if (result.status_code && result.status_code === 200) {
          this.uploading = false;
          this.showUpload = false;
          this.message.success('上传成功');

          this.modalSubject.destroy('onOk');
        } else {
          this.uploading = false;
          this.message.error('上传失败');
        }
      }, error1 => {

      }, () => {
        this.manageService.setCanJump(true);
      }*/);
    } else {
      this.message.info('请选择文件');
    }


  }

  downloadTemplate() {
    window.open(
      environment.SERVER_API_URL +
      '/setting/manual/down_template?user_id=' +
      this.authService.getCurrentAdminOperdInfo().select_uid +
      '&cid=' +
      this.uploadSetting['cid']
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
    this.pageInfo.currentPage = 1;
    this.refreshData();
  }


  clickUploadBtn(content) {


    this.addModal = this.modalService.create({
      nzTitle: '上传数据',
      nzWidth: 600,
      nzContent: content,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'sub-company-manage-modal',
      nzFooter: null,
    });
    this.addModal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
      this.can_nav = true;
    });
  }

  downloadConversion(data) {

    this.defineSettingService.getDownloadManual(data.record_id, { cid: data.cid }).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.info('当前数据不可下载');
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
