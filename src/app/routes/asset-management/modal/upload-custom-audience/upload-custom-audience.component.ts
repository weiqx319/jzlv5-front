import { isArray } from '@jzl/jzl-util';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { deepCopy, formatDate } from '@jzl/jzl-util';
import { AssetManagementService } from './../../asset-management.service';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { AuthService } from 'src/app/core/service/auth.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";

@Component({
  selector: 'app-upload-custom-audience',
  templateUrl: './upload-custom-audience.component.html',
  styleUrls: ['./upload-custom-audience.component.scss']
})
export class UploadCustomAudienceComponent implements OnInit {
  validateAudienceForm: FormGroup;
  public publisher_id = 7;
  // 数据类型选项
  public dataSourceTypeList = [];
  constructor(
    private fb: FormBuilder,
    private assetManagementService: AssetManagementService,
    private message: NzMessageService,
    public menuService: MenuService,
    private authService: AuthService,
    private updateModal: NzModalRef,

  ) {
    this.validateAudienceForm = this.fb.group({
      custom_audience_name: ['', [Validators.required]],
      chan_pub_id: ['', [Validators.required]],
      data_source_type: ['', [Validators.required]],
      desc: [''],
    });
    this.publisher_id = this.menuService.currentPublisherId;
    // 数据类型选项
    this.dataSourceTypeList = this.assetManagementService.dataSourceTypeList['publisher_' + this.publisher_id];
  }
  public uploading = false;
  public fileList = [];
  public exception = 'exception';
  public customReq: any;
  public speed = 0;
  public resultMessage = '';
  public uploadAjax = null;

  // 人群包上传参数
  public uploadParams = {
    custom_audience_name: '',
    chan_pub_id: '',
    data_source_type: '',
    desc: ''
  };

  public accountsList = [];

  ngOnInit(): void {
    this.getAccountList();

  }

  getAccountList() {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": this.menuService.currentPublisherId
        },
        {
          "key": "channel_id",
          "name": "",
          "op": "=",
          "value": this.menuService.currentChannelId
        }
      ]
    };
    this.assetManagementService.getAccountList(body, {
      page: 1,
      count: 100000,
      cid: this.authService.getCurrentUserOperdInfo().select_cid,
      user_id: this.authService.getCurrentUserOperdInfo().select_uid,
    })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.accountsList = results['data']['detail'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  cancelModal(): void {
    if (this.uploadAjax) this.uploadAjax.unsubscribe();
    this.fileList = [];
    this.updateModal.destroy('onCancel');
    this.assetManagementService.setCanJump(true);
  }

  getFormControl(name) {
    return this.validateAudienceForm.controls[name];
  }

  changeBtn() {
    this.resultMessage = '';
    this.fileList = [];
  }

  beforeUpload = (file: File) => {
    this.fileList = [file];
    this.exception = 'active';
    if (!file.type) {
      this.message.error('文件格式不对，请重新上传', { nzDuration: 2000 });
      this.fileList = [];
    }

    return false;
  }

  doUpload() {
    if (this.fileList.length > 0) {
      this.assetManagementService.setCanJump(false);
      this.uploading = true;
      this.exception = 'active';

      const formData = new FormData();
      formData.append('upload_file', this.fileList[0]);
      formData.append('custom_audience_name', this.uploadParams.custom_audience_name + "");
      formData.append('chan_pub_id', this.uploadParams.chan_pub_id + "");
      formData.append('data_source_type', this.uploadParams.data_source_type + "");
      formData.append('desc', this.uploadParams.desc + "");

      this.uploadAjax = this.assetManagementService.uploadCustomAudience(formData).subscribe(
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
            if (event.body['status_code'] === 200) {
              this.uploading = false;
              this.message.success('上传成功');
              this.updateModal.destroy('onOk');

            } else {
              // 处理失败
              this.uploading = false;
              this.exception = 'exception';
              this.message.error(event.body['message'], { nzDuration: 10000 });
              this.resultMessage = event.body['message'];

            }
            this.assetManagementService.setCanJump(true);

          }
        }, (err) => {
          // 处理失败
          this.assetManagementService.setCanJump(true);
          this.uploading = false;
          this.exception = 'exception';
          this.message.error('上传失败');
          //
        }, () => {
          this.assetManagementService.setCanJump(true);
        }
      );
    } else {
      this.message.info('请选择文件');
    }
  }


}
