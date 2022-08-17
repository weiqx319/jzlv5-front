import { HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { environment } from "../../../../../environments/environment";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../notify/notify.service";
import { BatchUploadService } from '../../service/batch-upload.service';
import { ProductDataService } from "@jzl/jzl-product";
import { deepCopy } from "@jzl/jzl-util";

@Component({
  selector: 'app-view-batch-upload',
  templateUrl: './view-batch-upload.component.html',
  styleUrls: ['./view-batch-upload.component.scss'],
})
export class ViewBatchUploadComponent implements OnInit, AfterViewInit {

  @Input() summaryType: any = 'keyword';
  @Input() channelId: any = 1;
  @Input() publisherId: any = 0;
  @Input() uploadType: any = '';

  public productInfo = {};

  public versionDateTimestamp = (new Date()).valueOf();
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
  public xhsSummaryObj = {
    keyword: '关键词',
    creative: '创意',
  }
  public checkErrorTip = {
    keyword_24: {
      is_show: false,
      tip_text: '账户、计划、单元、关键词、出价、匹配模式为必填！',
      required_length: 6,//必填项长度
    },
    keyword_24_xhs_all: {
      is_show: false,
      tip_text: '账户、计划、推广目的、投放模式为必填',
      required_length: 4,//必填项长度
    },
    creative_24: {
      is_show: false,
      tip_text: '账户、计划、单元为必填',
      required_length: 3,//必填项长度
    }
  }

  public defaultField = {
    account: [
      '媒体',
      '帐户',
      '预算',
    ],
    campaign: [
      '推广账户',
      '推广计划',
      '预算',
      '计划状态',
      '否定词',
      '精确否定词',
      '推广地域',
      '推广时段',
      '移动出价比例',
      '计算机出价比例',
      '推广设备优先(百度)',
      '创意展现方式',
      '投放设备',
      '计划ID',
    ],
    adgroup: [
      '推广账户',
      '推广计划',
      '单元',
      '单元出价',
      '单元状态',
      '否定词',
      '精确否定词',
      '移动出价比例',
      '计算机出价比例',
      '投放平台(神马)',
      '计划设备优先',
      '单元ID',
    ],
    keyword: [
      "推广账户",
      "推广计划",
      "推广单元",
      "关键词",
      "匹配模式",
      "出价",
      "访问url",
      "移动访问url",
      "暂停/启用",
      "计划设备类型",
      "应用调起网址",
      "关键词ID"
    ],
    creative: [
      "推广账户",
      "推广计划",
      "推广单元",
      "创意标题",
      "创意描述1",
      "创意描述2",
      "访问url",
      "显示url",
      "移动访问url",
      "移动显示url",
      "暂停/启用",
      "计划设备类型",
      "创意ID"

    ],
    24: {
      keyword: [
        "账户",
        "计划",
        "单元",
        "关键词",
        "出价",
        "匹配模式",
      ],
      creative: [
        "账户",
        "计划",
        "单元",
        "创意笔记ID",
        "创意笔记URL",
        "创意笔记标题",
        "封面优选",
        "跳转连接",
        "按钮文案"
      ],
      xhs_all: [
        "账户",
        "计划",
        "推广目的",
        "投放模式",
        "推广计划日预算",
        "推广日预算",
        "开启节假日预算上涨",
        "单元名称",
        "投放范围",
        "推广日期范围",
        "推广时段",
        "投放目标",
        "推广地域",
        "智能出价",
        "投放标的笔记ID",
        "投放标的笔记URL",
        "投放标的笔记标题",
        "投放标的组件",
        "私信按钮文案",
        "关键词",
        "出价",
        "匹配模式",
      ]
    }
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
    cron_setting: 'now',
  };

  public publisherTypeList = [
    { name: '百度', key: 1 },
    { name: '搜狗', key: 2 },
    { name: '360', key: 3 },
    { name: '神马', key: 4 },
  ];
  private uploadAjax;
  constructor(private message: NzMessageService,
    private batchUploadService: BatchUploadService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private modalSubject: NzModalRef,
    private productService: ProductDataService) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  ngOnInit() {
    if (this.publisherId === 24) { this.defaultPostData.deal_publisher_id = 24; }
    if (this.channelId == 2 && ((this.publisherId == 6 && this.summaryType !== 'account') || this.publisherId == 17)) {
      this.upload_method = [{ name: '文件上传', disabled: false }];
    }
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

    if (this.defaultField[this.publisherId] !== undefined) {
      if (this.defaultField[this.publisherId][this.summaryType] !== undefined) {
        this.tableField = [...this.defaultField[this.publisherId][this.summaryType]];
      }
      if (this.uploadType === 'xhs_all') {//小红书-全流程上传
        this.tableField = [...this.defaultField[this.publisherId]['xhs_all']];
      }
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
    if (this.publisherId !== 24 && !file.type) {
      this.message.error('文件格式不对，请重新上传', { nzDuration: 2000 });
      this.fileList = [];
    }

    return false;
  }

  cancelUpload() {
    if (this.uploadAjax) this.uploadAjax.unsubscribe();
    this.showUpload = false;
    this.fileList = [];
    this.modalSubject.destroy('onCancel');
  }

  // 校验表格数据（必填项放到表格最前面）
  checkDataset(resultDataDetail) {
    let canUpload = true;
    const checkErrorTipKey = this.summaryType + '_' + this.publisherId + (this.uploadType ? '_' + this.uploadType : '');

    this.tableField.forEach((column, index) => {
      resultDataDetail.forEach(itemArr => {
        if (!itemArr[index]) {
          itemArr[index] = null;
        }
      });
    });
    resultDataDetail.forEach(item => {
      item.forEach((element, i) => {
        if (i < this.checkErrorTip[checkErrorTipKey].required_length && !element) {
          this.checkErrorTip[checkErrorTipKey].is_show = true;
          canUpload = false;
        }
      });
      if (canUpload) { item.length = this.tableField.length; }
    });
    return canUpload;
  }

  handleUpload() {
    if (this.selectedIndex === 1) {
      this.copyUploading = true;
      this.upload_method[0].disabled = true;

      const resultDataDetail = [];
      this.dataset.forEach((item: any[]) => {
        const empty = item.every(value => value === '');
        if (item.length > 0 && !empty) {
          resultDataDetail.push(deepCopy(item));
        }
      });

      if (resultDataDetail.length < 1) {
        this.message.warning('表格不能为空！');
        this.copyUploading = false;
        return;
      }
      //小红书验证表格
      if (this.publisherId == 24) {
        if (!this.checkDataset(resultDataDetail)) {
          this.copyUploading = false;
          return
        };
      }

      const notifyData: any[] = [];
      const userOperdInfo = this.authService.getCurrentUserOperdInfo();
      this.uploadAjax = this.batchUploadService.importDetail(this.summaryType,
        {
          table_header: this.tableField,
          table_data: resultDataDetail,
          deal_publisher_id: this.defaultPostData.deal_publisher_id,
          max_price: this.defaultPostData.max_price,
          exist_update: this.defaultPostData.exist_update,
          not_exist_add: this.defaultPostData.not_exist_add,
          by_id_update: this.defaultPostData.by_id_update,
        }, this.channelId, this.publisherId, this.uploadType).subscribe((result) => {
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
        if (this.upload_method.length > 1) {
          this.upload_method[1].disabled = true;
        }

        this.exception = 'active';

        const formData = new FormData();
        formData.append('import_file', this.fileList[0]);
        formData.append('deal_publisher_id', this.defaultPostData.deal_publisher_id + "");
        formData.append('max_price', this.defaultPostData.max_price + "");
        formData.append('exist_update', this.defaultPostData.exist_update + "");
        formData.append('not_exist_add', this.defaultPostData.not_exist_add + "");
        formData.append('by_id_update', this.defaultPostData.by_id_update + "");
        if (this.publisherId == 17) {
          formData.append('cron_setting', this.defaultPostData.cron_setting + "");
        }

        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();
        this.uploadAjax = this.batchUploadService.importFile(this.summaryType, this.channelId, this.publisherId, formData, this.uploadType).subscribe(
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
                if (this.upload_method.length > 1) {
                  this.upload_method[1].disabled = false;
                }
                this.showUpload = false;
                this.message.success('上传成功');
                this.modalSubject.destroy('onOk');
                notifyData.push({ job_id: event.body['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'upload_' + this.summaryType });
                this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });

              } else {
                // 处理失败

                this.uploading = false;
                if (this.upload_method.length > 1) {
                  this.upload_method[1].disabled = false;
                }
                this.exception = 'exception';
                this.message.error(event.body['message'], { nzDuration: 10000 });
                this.resultMessage = event.body['message'];
              }

            }
          }, (err) => {
            // 处理失败
            // this.uploading = false;
            this.uploading = false;
            if (this.upload_method.length > 1) {
              this.upload_method[1].disabled = false;
            }
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
    window.open(environment.SERVER_API_URL + '/data_view/import/down_template?summary_type=' + summaryType);
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
