import { HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from "@angular/forms";
import * as Handsontable from 'handsontable';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { environment } from "../../../../../environments/environment";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { DataViewAddService } from "../../service/data-view-add.service";
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-view-batch-upload-delete',
  templateUrl: './view-batch-upload-delete.component.html',
  styleUrls: ['./view-batch-upload-delete.component.scss'],
  providers: [DataViewAddService],
})
export class ViewBatchUploadDeleteComponent implements OnInit, AfterViewInit {

  @Input() summaryType: any = 'keyword';
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
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],

  ];
  public tableField = [];

  public colWidths = [];

  public defaultField = {
    campaign: [
      '推广账户',
      '推广计划',
      '计划ID',
    ],
    adgroup: [
      '推广账户',
      '单元',
      '单元ID',
    ],
    keyword: [
      "推广账户",
      "关键词",
      "关键词ID"
    ],
    creative: [
      "推广账户",
      "创意标题",
      "创意ID"

    ]
  };

  public copyUploading = false;
  public selectedIndex = 0;
  public upload_method = [{ name: '文件上传', disabled: false }, { name: '拷贝上传(建议小于1万条)', disabled: false }];
  public copyMessage = [];
  public contextMenu = {
    items: {
      row_above: { name: '前插入行' },
      row_below: { name: '后插入行' },
      remove_row: { name: '删除' },
      copy: { name: '复制' },
      cut: { name: '剪切' },
    },
  };
  public defaultPostData = {
    deal_publisher_id: 1,
    max_price: 1,
    exist_update: 1,
    not_exist_add: 1,
    by_id_update: 0,
  };

  public publisherTypeList = [
    { name: '百度', key: 1 },
    { name: '搜狗', key: 2 },
    { name: '360', key: 3 },
    { name: '神马', key: 4 },
  ];
  public productInfo = {};

  constructor(private message: NzMessageService,
    private dateViewAddService: DataViewAddService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private modalSubject: NzModalRef,
    private productService: ProductDataService) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  ngOnInit() {
    this.refreshTableField();

  }

  public refreshTableField(event?) {

    if (this.defaultField[this.summaryType] !== undefined) {
      this.tableField = [...this.defaultField[this.summaryType]];
    }
    if (this.defaultField[this.summaryType + "_" + this.defaultPostData.deal_publisher_id] !== undefined) {
      this.tableField = [...this.tableField, ...this.defaultField[this.summaryType + '_' + this.defaultPostData.deal_publisher_id]];
    }

    if (this.defaultField[this.summaryType + "_last"] !== undefined) {
      this.tableField = [...this.tableField, ...this.defaultField[this.summaryType + "_last"]];
    }

    this.colWidths = new Array(this.tableField.length).fill(100);

  }

  tabClick = (event?) => {
    setTimeout(() => {
      this.tableShow = true;
    });
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

  cancelUpload() {
    this.showUpload = false;
    this.fileList = [];
    this.modalSubject.destroy('onCancel');
  }
  handleUpload() {
    if (this.selectedIndex === 1) {
      this.copyUploading = true;
      this.upload_method[0].disabled = true;

      const resultDataDetail = [];

      this.dataset.forEach((item: any[]) => {
        if (item.length > 0) {
          resultDataDetail.push(item);
        }
      });
      if (resultDataDetail.length < 1) {
        this.modalSubject.destroy('onOk');
      }

      const notifyData: any[] = [];
      const userOperdInfo = this.authService.getCurrentUserOperdInfo();
      this.dateViewAddService.importDelDetail(this.summaryType,
        {
          table_header: this.tableField,
          table_data: resultDataDetail,
          deal_publisher_id: this.defaultPostData.deal_publisher_id,
          max_price: this.defaultPostData.max_price,
          exist_update: this.defaultPostData.exist_update,
          not_exist_add: this.defaultPostData.not_exist_add,
          by_id_update: this.defaultPostData.by_id_update,
        }).subscribe((result) => {
          this.copyUploading = false;
          this.upload_method[0].disabled = false;
          if (result['status_code'] === 200) {
            this.message.success('上传成功');
            this.modalSubject.destroy('onOk');
            notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'upload_' + this.summaryType });
            this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });

          } else {
            this.message.error(result['message'], { nzDuration: 10000 });
          }
        }, (error) => {
          this.copyUploading = false;
          this.upload_method[0].disabled = false;
          this.message.error('上传失败');
        });
    } else if (this.selectedIndex === 0) {
      if (this.fileList.length > 0) {
        this.uploading = true;
        this.upload_method[1].disabled = true;
        this.exception = 'active';

        const formData = new FormData();
        formData.append('import_file', this.fileList[0]);
        formData.append('deal_publisher_id', this.defaultPostData.deal_publisher_id + "");
        formData.append('max_price', this.defaultPostData.max_price + "");
        formData.append('exist_update', this.defaultPostData.exist_update + "");
        formData.append('not_exist_add', this.defaultPostData.not_exist_add + "");
        formData.append('by_id_update', this.defaultPostData.by_id_update + "");

        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();
        this.dateViewAddService.importDelFile(this.summaryType, formData).subscribe(
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
                this.upload_method[1].disabled = false;
                this.showUpload = false;
                this.message.success('上传成功');
                this.modalSubject.destroy('onOk');
                notifyData.push({ job_id: event.body['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'upload_' + this.summaryType });
                this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });

              } else {
                // 处理失败

                this.uploading = false;
                this.upload_method[1].disabled = false;
                this.exception = 'exception';
                this.message.error(event.body['message'], { nzDuration: 10000 });
                this.resultMessage = event.body['message'];
              }

            }
          }, (err) => {
            // 处理失败
            // this.uploading = false;
            this.uploading = false;
            this.upload_method[1].disabled = false;
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

  downloadTemplate(summaryType = 'keyword') {
    window.open(
      environment.SERVER_API_URL +
      '/data_view/import/down_delete_template?summary_type=' + summaryType,
    );
  }

  changeBtn() {
    this.resultMessage = '';
    this.fileList = [];
  }

  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   this.tableShow = true;
    // });

  }

}
