import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {CustomDatasService} from "../../../../shared/service/custom-datas.service";
import {AuthService} from "../../../../core/service/auth.service";
import {HttpEvent, HttpEventType, HttpResponse} from "@angular/common/http";

import {MenuService} from '../../../../core/service/menu.service';

import {LaunchRpaService} from '../../service/launch-rpa.service';
import {FormGroup} from "@angular/forms";


@Component({
  selector: 'app-upload-channel-list',
  templateUrl: './upload-channel-list.component.html',
  styleUrls: ['./upload-channel-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UploadChannelListComponent implements OnInit {
  @Input() publisherId;

  public defaultData: any = {
    publisher_id:17,
  };

  public uploading = false;
  public showUpload = false;

  public advertiserList = [];

  public customReq: any;
  public fileList=[];
  public resultMessage = '';
  public exception = 'active';
  public speed = 0;
  public saving = false;

  public cid;

  constructor(
    private message: NzMessageService,
    private modalSubject: NzModalRef,
    private authService: AuthService,
    private customDataService: CustomDatasService,
    private menuService: MenuService,
    public launchRpaService: LaunchRpaService,) {

    // this.publisherList = [...this.customDataService.productList];

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
  }
  onInput($event) {
    if (!$event) {
      return;
    }
    const target = $event.target;
    target.value = target.value.replace(/,|，/g, "");
  }

  beforeUpload = (file: File) => {
    this.fileList = [file];
    this.exception = 'active';
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      this.message.error('文件大小需小于50M!', {nzDuration: 2000});
      this.fileList = [];
    }
    if (!file.type) {
      this.message.error('文件格式不对，请重新上传', {nzDuration: 2000});
      this.fileList = [];
    }
    return false;
  }


  changeBtn() {
    this.resultMessage = '';
    this.fileList = [];
  }

  cancelUpload() {
    this.showUpload = false;
    this.fileList = [];
    this.modalSubject.destroy('onCancel');
  }


  handleUpload() {
      if (this.fileList.length > 0) {
        this.uploading = true;
        const formData = new FormData();
        formData.append('import_file', this.fileList[0]);
        formData.append('publisher_id', this.publisherId);
        formData.append('is_test', '1');

        this.launchRpaService.saveChannelInfo(formData).subscribe(
          (event: HttpEvent<{}>) => {
              // 处理成功
              if (event['status_code'] === 200) {
                this.uploading = false;
                this.message.success('上传成功');
                this.modalSubject.destroy('onOk');
              } else {
                // 处理失败

                this.uploading = false;
                this.exception = 'exception';
                this.message.error(event['message'],  {nzDuration: 10000});
                this.resultMessage = event['message'];
              }
          }, (err) => {
            // 处理失败
            this.uploading = false;

            this.exception = 'exception';
            this.message.error('上传失败');
          }, () => {
          },
        );
      } else {
        this.message.info('请选择文件');
      }
  }
}
