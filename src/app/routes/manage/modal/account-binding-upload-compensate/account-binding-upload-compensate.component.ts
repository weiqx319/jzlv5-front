import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { ManageService } from "../../service/manage.service";
import { environment } from "../../../../../environments/environment";
import { DefineSettingService } from "../../service/define-setting.service";
import { AuthService } from "../../../../core/service/auth.service";
import { HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";
import { MenuService } from '../../../../core/service/menu.service';
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-account-binding-upload-compensate',
  templateUrl: './account-binding-upload-compensate.component.html',
  styleUrls: ['./account-binding-upload-compensate.component.scss']
})
export class AccountBindingUploadCompensateComponent implements OnInit {

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
    cash_type: 'indemnity',
    source_type: '88'
  };
  public advertiserLists = [];
  public submitting = false;
  public uploading = false;
  public showUpload = false;
  public fileList = [];
  public speed = 0;
  public exception = 'active';

  public copyMessage = [];
  public dataset: any[] = [
    { date: '', channel: '', media: '', account: '', equipment: '', compensate: '',is_virtual:'' },
    { date: '', channel: '', media: '', account: '', equipment: '', compensate: '',is_virtual:'' },
    { date: '', channel: '', media: '', account: '', equipment: '', compensate: '',is_virtual:'' },
    { date: '', channel: '', media: '', account: '', equipment: '', compensate: '',is_virtual:'' },
    { date: '', channel: '', media: '', account: '', equipment: '', compensate: '',is_virtual:'' },
    { date: '', channel: '', media: '', account: '', equipment: '', compensate: '',is_virtual:'' },
  ];
  public contextMenu = {
    items: {
      "row_above": { name: '前插入行' },
      "row_below": { name: '后插入行' },
      "remove_row": { name: '删除' },
      "copy": { name: '复制' },
      "cut": { name: '剪切' },
    }
  };

  public customReq: any;

  public productInfo = {};

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private manageService: ManageService,
    private defineSettingService: DefineSettingService,
    private authService: AuthService,
    private modalSubject: NzModalRef,
    private menuService: MenuService,
    private productService: ProductDataService
  ) {
    this.uploadForm = this.fb.group({
      source_type: ['', [Validators.required]],
      cid: [0, [Validators.required]],
      cash_type: ['', [Validators.required]],
    });
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  ngOnInit() { }

  getFormControl(name) {
    return this.uploadForm.controls[name];
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
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      this.message.error('文件大小需小于50M!', { nzDuration: 2000 });
      this.fileList = [];
    }
    return false;
  }

  // handleUpload() {
  //   if (this.fileList.length > 0) {
  //     this.manageService.setCanJump(false);
  //     this.uploading = true;
  //     this.exception = 'active';
  //
  //     const formData = new FormData();
  //     formData.append('import_file', this.fileList[0]);
  //     formData.append('chan_pub_id', this.uploadSetting.cid);
  //
  //
  //     this.manageService.uploadCompensate(formData).subscribe(
  //       (event: HttpEvent<{}>) => {
  //
  //         if (event.type === HttpEventType.UploadProgress) {
  //           if (event.total > 0) {
  //             // tslint:disable-next-line:no-any
  //             (event as any).percent = event.loaded / event.total * 100;
  //             this.speed = Math.round( (event as any).percent);
  //
  //           }
  //           // 处理上传进度条，必须指定 `percent` 属性来表示进
  //         } else if (event instanceof HttpResponse) {
  //           // 处理成功
  //
  //           this.uploading = false;
  //           this.showUpload = false;
  //           this.message.success('上传成功');
  //           this.modalSubject.destroy('onOk');
  //           this.manageService.setCanJump(true);
  //         }
  //       }, (err) => {
  //         // 处理失败
  //         // this.uploading = false;
  //         this.manageService.setCanJump(true);
  //         this.uploading = false;
  //         this.exception = 'exception';
  //         this.message.error('上传失败');
  //         //
  //       }, () => {
  //         this.manageService.setCanJump(true);
  //       });
  //   } else {
  //     this.message.info('请选择文件');
  //   }
  // }

  downloadTemplate() {
    this.menuService.currentChannelId === 1
      ? window.open(
        environment.SERVER_API_URL +
        '/manager_base/discount/indemnity/download/model?user_id=' +
        this.authService.getCurrentAdminOperdInfo().select_uid +
        '&cid=' +
        this.uploadSetting['cid']
      )
      : window.open(
        environment.SERVER_API_URL +
        '/manager_base/discount/indemnity/download/model?user_id=' +
        this.authService.getCurrentAdminOperdInfo().select_uid +
        '&cid=' +
        this.uploadSetting['cid']
      );
  }

  getExcelList() {
    const rowCount = {
      date: 0,
      channel: 0,
      media: 0,
      account: 0,
      equipment: 0,
      compensate: 0,
      is_virtual:0
    };
    const newData = [];
    const dataNullName = [];
    for (let i = 0; i < this.dataset.length; i++) {
      const nullName = [];
      if (this.dataset[i]['date'].length) {
        rowCount.date += 1;
      } else {
        nullName.push('日期');
      }
      if (this.dataset[i]['channel'].length) {
        rowCount.channel += 1;
      } else {
        nullName.push('渠道');
      }
      if (this.dataset[i]['media'].length) {
        rowCount.media += 1;
      } else {
        nullName.push('媒体');
      }
      if (this.dataset[i]['account'].length) {
        rowCount.account += 1;
      } else {
        nullName.push('账户');
      }
      if (this.dataset[i]['equipment'].length) {
        rowCount.equipment += 1;
      } else {
        nullName.push('设备');
      }
      if (this.dataset[i]['compensate'].length) {
        rowCount.compensate += 1;
      } else {
        nullName.push('赔付消耗');
      }
      // if (this.dataset[i]['is_virtual'].length) {
      //   rowCount.is_virtual += 1;
      // } else {
      //   nullName.push('是否为虚拟户');
      // }

      if (this.dataset[i]['date'] && this.dataset[i]['channel'] && this.dataset[i]['media'] && this.dataset[i]['account'] && this.dataset[i]['equipment'] && this.dataset[i]['compensate']) {
        const isVirtual=this.dataset[i]['is_virtual']?this.dataset[i]['is_virtual']:'否';
        newData.push([this.dataset[i]['date'], this.dataset[i]['channel'], this.dataset[i]['media'], this.dataset[i]['account'], this.dataset[i]['equipment'], this.dataset[i]['compensate'],isVirtual]);
      }

      if (!this.dataset[i]['date'] && !this.dataset[i]['channel'] && !this.dataset[i]['media'] && !this.dataset[i]['account'] && !this.dataset[i]['equipment'] && !this.dataset[i]['compensate']) {

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

  handleUpload() {
    const dataList = this.getExcelList();
    const bodydata = { cid: this.uploadSetting.cid, cash_type: this.uploadSetting.cash_type, data_detail: dataList.data };
    this.copyMessage = dataList.message;
    if ((dataList.counts.date === dataList.counts.channel && dataList.counts.channel === dataList.counts.media && dataList.counts.media === dataList.counts.account) && dataList.counts.account === dataList.counts.equipment && dataList.counts.equipment === dataList.counts.compensate && dataList.counts.date !== 0) {
      this.manageService.uploadCompensate(bodydata).subscribe(result => {
        if (result['status_code'] === 200) {
          this.message.success(result['message']);
          this.modalSubject.destroy('onOk');

        } else {
          this.message.error('上传失败');
        }
      }, error => {
        this.message.error('上传失败');
      });
    } else {
      this.message.info('请完善表格');
      if ((dataList.counts.date === dataList.counts.channel && dataList.counts.channel === dataList.counts.media && dataList.counts.media === dataList.counts.account) && dataList.counts.account === dataList.counts.equipment && dataList.counts.equipment === dataList.counts.compensate && dataList.counts.account === 0) {
        this.copyMessage = ['上传表格不能为空，请完善'];
      }
    }
  }

}
