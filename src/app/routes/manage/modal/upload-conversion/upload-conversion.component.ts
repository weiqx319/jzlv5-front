import {Component, HostListener, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import {ManageService} from "../../service/manage.service";
import {environment} from "../../../../../environments/environment";
import {DefineSettingService} from "../../service/define-setting.service";
import {AuthService} from "../../../../core/service/auth.service";
import {HttpEvent, HttpEventType, HttpResponse} from "@angular/common/http";
import { MenuService } from '../../../../core/service/menu.service';

@Component({
  selector: 'app-upload-conversion',
  templateUrl: './upload-conversion.component.html',
  styleUrls: ['./upload-conversion.component.scss']
})
export class UploadConversionComponent implements OnInit {

  @Input() conversionType: any;
  @Input() set advertiserList(data: any) {
    this.advertiserLists = data;
    if (data && data.length) {
      this.uploadSetting['cid'] = data[0]['key'];
    }
  }
  public uploadForm: FormGroup;
  public uploadSetting = {
    cid: null,
    source_type: '88'
  };
  public advertiserLists = [];
  public submitting = false;
  public uploading = false;
  public showUpload = false;
  public fileList = [];
  public speed = 0;
  public exception = 'active';

  public customReq: any;

  constructor(private fb: FormBuilder,
              private message: NzMessageService,
              private manageService: ManageService,
              private defineSettingService: DefineSettingService,
              private authService: AuthService,
              private modalSubject: NzModalRef,
              private menuService: MenuService
              ) {
    this.uploadForm = this.fb.group({
      source_type: ['', [Validators.required]],
      cid: [0, [Validators.required]],
    });
  }

  ngOnInit() {}

  getFormControl(name) {
    return this.uploadForm.controls[ name ];
  }

  cancelUpload() {
    this.showUpload = false;
    this.fileList = [];
    this.modalSubject.destroy('onCancel');
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

      this.message.error('文件大小需小于50M!', {nzDuration: 2000});
      this.fileList = [];
    }
    return false;
  }

  handleUpload() {
    if (this.fileList.length > 0) {
      this.manageService.setCanJump(false);
      this.uploading = true;
      this.exception = 'active';

     /* this.customReq = (item: NzUploadXHRArgs) => {

        const formData = new FormData();
        formData.append('conversion_file', this.fileList[0]);
        formData.append('cid', this.uploadSetting.cid);
        formData.append('source_type', this.uploadSetting.source_type);
        return this.defineSettingService.uploadConversionDataNew(formData).subscribe(
          (event: HttpEvent<{}>) => {

            if (event.type === HttpEventType.UploadProgress) {
              if (event.total > 0) {
                // tslint:disable-next-line:no-any
                (event as any).percent = event.loaded / event.total * 100;

              }
              // 处理上传进度条，必须指定 `percent` 属性来表示进度
              item.onProgress(event, item.file);
            } else if (event instanceof HttpResponse) {
              // 处理成功

              // 处理成功
              item.onSuccess(event.body, item.file, event);

            }
          }, (err) => {
            // 处理失败



            // 处理失败
            item.onError(err, item.file);
          }
          /!*result => {
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
        }*!/);
      };*/
      const formData = new FormData();
      formData.append('conversion_file', this.fileList[0]);
      formData.append('cid', this.uploadSetting.cid);
      formData.append('source_type', this.uploadSetting.source_type);


      this.defineSettingService.uploadConversionDataNew(formData).subscribe(
        (event: HttpEvent<{}>) => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total > 0) {
              // tslint:disable-next-line:no-any
              (event as any).percent = event.loaded / event.total * 100;
              this.speed = Math.round( (event as any).percent);

            }
            // 处理上传进度条，必须指定 `percent` 属性来表示进
          } else if (event instanceof HttpResponse) {
            // 处理成功

            this.uploading = false;
            this.showUpload = false;
            this.message.success('上传成功');
            this.modalSubject.destroy('onOk');
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
    this.menuService.currentChannelId === 1
      ? window.open(
          environment.SERVER_API_URL +
            '/setting/conversion/down_template?user_id=' +
            this.authService.getCurrentAdminOperdInfo().select_uid +
            '&cid=' +
            this.uploadSetting['cid'] +
            '&source_type=' +
            this.uploadSetting['source_type']
        )
      : window.open(
          environment.SERVER_API_URL +
            '/setting/conversion_feed/down_template?user_id=' +
            this.authService.getCurrentAdminOperdInfo().select_uid +
            '&cid=' +
            this.uploadSetting['cid'] +
            '&source_type=' +
            this.uploadSetting['source_type']
        );
  }

}
