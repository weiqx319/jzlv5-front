import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {HttpEvent, HttpEventType, HttpResponse} from "../../../../../../node_modules/@angular/common/http";
import {environment} from "../../../../../environments/environment";
import {OptimizationService} from "../../service/optimization.service";
import {AuthService} from "../../../../core/service/auth.service";
import {NotifyService} from "../../../../module/notify/notify.service";
import * as Handsontable from 'handsontable';

@Component({
  selector: 'app-batch-upload',
  templateUrl: './batch-upload.component.html',
  styleUrls: ['./batch-upload.component.scss']
})
export class BatchUploadComponent implements OnInit, AfterViewInit {


  @Input() optimization_id: any;
  public tableShow = false;
  public speed = 0;
  public uploadForm: FormGroup;
  public uploading = false;
  public showUpload = false;
  public fileList = [];
  public customReq: any;
  public exception = 'active';
  public resultMessage = '';
  public container = document.getElementById('example1');
  public hot = '';
  public dataset: any[] = [
    {account: '', campaign: '', adgroup: '', keyword: ''},
    {account: '', campaign: '', adgroup: '', keyword: ''},
    {account: '', campaign: '', adgroup: '', keyword: ''},
    {account: '', campaign: '', adgroup: '', keyword: ''},
    {account: '', campaign: '', adgroup: '', keyword: ''},
    {account: '', campaign: '', adgroup: '', keyword: ''},

  ];

  public copyUploading = false;
  public selectedIndex = 0;
  public upload_method = [{name: '拷贝上传', disabled: false}, {name: '文件上传', disabled: false}];
  public copyMessage = [];
  public contextMenu = {
    items: {
      "row_above": {name: '前插入行'},
      "row_below": {name: '后插入行'},
      "remove_row": {name: '删除'},
      "copy": {name: '复制'},
      "cut": {name: '剪切'},
    }
  };
  constructor(private message: NzMessageService,
              private optimization: OptimizationService,
              private  authService: AuthService,
              private notifyService: NotifyService,
              private modalSubject: NzModalRef) { }

  ngOnInit() {
  }



  beforeUpload = (file: File) => {
    this.fileList = [file];
    this.exception = 'active';
    if (!file.type) {
      this.message.error('文件格式不对，请重新上传', {nzDuration: 2000});
      this.fileList = [];
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      this.message.error('文件大小需小于10M!', {nzDuration: 2000});
      this.fileList = [];
    }
    return false;
  }


  cancelUpload() {
    this.showUpload = false;
    this.fileList = [];
    this.modalSubject.destroy('onCancel');
    this.optimization.setCanJump(true);
  }
  handleUpload() {
    if (this.selectedIndex === 0) {
      const dataList = this.getExcelList();
      this.copyMessage = dataList.message;
      if ((dataList.counts.account === dataList.counts.campaign &&  dataList.counts.campaign === dataList.counts.adgroup && dataList.counts.adgroup === dataList.counts.keyword) && dataList.counts.account !== 0) {
        this.copyUploading = true;
        this.upload_method[1].disabled = true;
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();
        this.optimization.importDetail({data_detail: dataList['data']}, this.optimization_id).subscribe(result => {
          this.copyUploading = false;
          this.upload_method[1].disabled = false;
          if (result['status_code'] === 200) {
            this.message.success('上传成功');
            this.modalSubject.destroy('onOk');
            notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'optimization_detail_ranking' });
            this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});

          } else {
            this.message.error(result['message'],  {nzDuration: 10000});
          }
        }, error => {
          this.copyUploading = false;
          this.upload_method[1].disabled = false;
          this.message.error('上传失败');
        });
      } else {
        this.message.info('请完善表格');
        if ((dataList.counts.account === dataList.counts.campaign &&  dataList.counts.campaign === dataList.counts.adgroup && dataList.counts.adgroup === dataList.counts.keyword) && dataList.counts.account === 0) {
          this.copyMessage = ['上传表格不能为空，请完善'];
        }
      }
    } else if (this.selectedIndex === 1) {
      if (this.fileList.length > 0) {
        this.optimization.setCanJump(false);
        this.uploading = true;
        this.upload_method[0].disabled = true;
        this.exception = 'active';

        const formData = new FormData();
        formData.append('import_file', this.fileList[0]);


        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();
        this.optimization.importRankingDetail(formData , this.optimization_id).subscribe(
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
              if (event.body['status_code'] === 200) {
                this.uploading = false;
                this.upload_method[0].disabled = false;
                this.showUpload = false;
                this.message.success('上传成功');
                this.modalSubject.destroy('onOk');
                this.optimization.setCanJump(true);
                notifyData.push({job_id: event.body['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'optimization_detail_ranking' });
                this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});

              } else {
                // 处理失败
                this.optimization.setCanJump(true);
                this.uploading = false;
                this.upload_method[0].disabled = false;
                this.exception = 'exception';
                this.message.error(event.body['message'],  {nzDuration: 10000});
                this.resultMessage = event.body['message'];
              }

            }
          }, (err) => {
            // 处理失败
            // this.uploading = false;
            this.optimization.setCanJump(true);
            this.uploading = false;
            this.upload_method[0].disabled = false;
            this.exception = 'exception';
            this.message.error('上传失败');
          }, () => {
            this.optimization.setCanJump(true);
          }
        );
      } else {
        this.message.info('请选择文件');
      }
    }


  }

  getExcelList() {
    const rowCount = {
      account: 0,
      campaign: 0,
      adgroup: 0,
      keyword: 0,
    };
    const newData = [];
    const dataNullName = [];
    for (let i = 0; i < this.dataset.length; i++) {
      const nullName = [];
      if (this.dataset[i]['account'].length) {
        rowCount.account += 1;
      } else {
        nullName.push('账户');
      }
      if (this.dataset[i]['campaign'].length) {
        rowCount.campaign += 1;
      } else {
        nullName.push('计划');
      }
      if (this.dataset[i]['adgroup'].length) {
        rowCount.adgroup += 1;
      } else {
        nullName.push('单元');
      }
      if (this.dataset[i]['keyword'].length) {
        rowCount.keyword += 1;
      } else {
        nullName.push('关键词');
      }

      if (this.dataset[i]['account'] && this.dataset[i]['campaign'] && this.dataset[i]['adgroup'] && this.dataset[i]['keyword']) {
        newData.push([this.dataset[i]['account'], this.dataset[i]['campaign'], this.dataset[i]['adgroup'], this.dataset[i]['keyword']]);
      }

      if (!this.dataset[i]['account'] && !this.dataset[i]['campaign'] && !this.dataset[i]['adgroup'] && !this.dataset[i]['keyword']) {

      } else if (nullName.length) {
        dataNullName.push('第' + (i + 1) + '行的' + nullName.join('、') + '不能为空');
        break;
      }

    }
   /* this.dataset.forEach((item, index) => {
      const nullName = [];
      if (item['account'].length) {
        rowCount.account += 1;
      } else {
        nullName.push('账户');
      }
      if (item['campaign'].length) {
        rowCount.campaign += 1;
      } else {
        nullName.push('计划');
      }
      if (item['adgroup'].length) {
        rowCount.adgroup += 1;
      } else {
        nullName.push('单元');
      }
      if (item['keyword'].length) {
        rowCount.keyword += 1;
      } else {
        nullName.push('关键词');
      }

      if (!item['account'] && !item['campaign'] && !item['adgroup'] && !item['keyword']) {

      } else if (nullName.length) {
        dataNullName.push('第' + (index + 1) + '行的' + nullName.join('、') + '不能为空');
      }

      if (item['account'] && item['campaign'] && item['adgroup'] && item['keyword']) {
        newData.push([item['account'], item['campaign'], item['adgroup'], item['keyword']]);
      }


    });*/

    return {
      data: newData,
      counts: rowCount,
      message: dataNullName
    };

  }

  downloadTemplate() {
    window.open( 'http://' + location.host +  "/../../../../../assets/file/ranking_keyword_list.xlsx");
  }

  changeBtn() {
    this.resultMessage = '';
    this.fileList = [];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.tableShow = true;
    });


  }


}
