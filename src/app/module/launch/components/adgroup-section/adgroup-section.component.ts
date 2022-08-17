import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, SimpleChanges, OnChanges} from '@angular/core';
import {differenceInCalendarDays, format} from "date-fns";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../core/service/auth.service";
import {LaunchService} from "../../service/launch.service";
import {getStringLength} from '../../../../shared/util/util';

@Component({
  selector: 'app-adgroup-section',
  templateUrl: './adgroup-section.component.html',
  styleUrls: ['./adgroup-section.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdgroupSectionComponent implements OnInit, OnChanges {

  @Input() adgroupStructConfig;

  @Input() data: any = {};
  @Input() errorTip;
  @Input() chan_pub_id;
  @Input() landing_type;
  @Input() mediaTargetList;
  @Input() materialType;

  @Output() changeValue = new EventEmitter<any>();

  public conversionTargetList = []; // 转化目标

  public structConfigLoading = true;
  public structConfig: any = {};
  public downloadUrlList: any = {};

  public showCoefficient = false;

  public isDownloadUrlChanged = false;
  public isExternalUrlChanged = false;

  public groupNameLength = 0;

  public today = new Date();

  public adgroupNamePreview;

  public flowControlModeList = {
    'PRICING_OCPM': [
      { key: 'FLOW_CONTROL_MODE_FAST', name: '优先跑量' },
      { key: 'FLOW_CONTROL_MODE_BALANCE', name: '均衡投放' },
      { key: 'FLOW_CONTROL_MODE_SMOOTH', name: '优先低成本' },
    ],
    'PRICING_OCPC': [
      { key: 'FLOW_CONTROL_MODE_FAST', name: '优先跑量' },
      { key: 'FLOW_CONTROL_MODE_BALANCE', name: '均衡投放' },
      { key: 'FLOW_CONTROL_MODE_SMOOTH', name: '优先低成本' },
    ],
    'PRICING_CPC': [
      { key: 'FLOW_CONTROL_MODE_FAST', name: '加速投放' },
      { key: 'FLOW_CONTROL_MODE_SMOOTH', name: '标准投放' },
    ],
    'PRICING_CPM': [
      { key: 'FLOW_CONTROL_MODE_FAST', name: '加速投放' },
      { key: 'FLOW_CONTROL_MODE_SMOOTH', name: '标准投放' },
    ]
  };

  public cid;

  public user_id;

  constructor(
    private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private launchService: LaunchService,
    private authService: AuthService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;
  }

  ngOnInit() {
    this.getFeedStructConfigByteDance();
    this.getDownloadLinkUrl();
    this.getConversionTargetList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.getConversionTargetList();
    } else if(changes['landing_type']) {
      this.getConversionTargetList();
    } else if(changes['chan_pub_id']) {
      this.getConversionTargetList(true);
    }
  }

  getFeedStructConfigByteDance() {
    this.launchService
      .getFeedStructConfigByteDance({
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {

          if (results.status_code &&　results.status_code !== 200) {
            if (results.status_code !== 205) {
              this.message.error(results.message);
            }
          } else {
            this.structConfig = {...results['adgroup']};
          }
          this.structConfigLoading = false;
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  getDownloadLinkUrl() {
    this.launchService
      .getAppTypeUrlList({
        result_model: 'all',
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {

          if (results.status_code &&　results.status_code !== 200) {
            if (results.status_code !== 205) {
              this.message.error(results.message);
            }
          } else {
            this.downloadUrlList = {...results};
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  onAdgroupNamePreview() {
    const date = format(new Date(), 'yyyy-MM-dd');
    this.adgroupNamePreview = this.data.adgroup_name.replace(/{当前日期}/g, date);
  }

  // 检查应用下载链接
  downloadUrlChanged() {
    this.isDownloadUrlChanged = true;
  }

  downloadUrlBlur() {
    if (!this.isDownloadUrlChanged) {
      return;
    }

    this.data.package = null;

    if (!this.data.download_url) {
      return;
    }

    const body = {
      app_url_type: null,
      app_url: this.data.download_url,
    };

    if (this.data.app_type === 'APP_ANDROID') {
      body.app_url_type = 1;
    } else if (this.data.app_type === 'APP_IOS') {
      body.app_url_type = 2;
    }

    this.launchService
      .checkAppUrl(body, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            if (result['data']['status'] == 0) {
              this.data.package = result['data']['app_name'];
            } else {
              this.message.error(result['data']['message']);
            }

            this.getConversionTargetList(true);
          } else if (result.status_code && result.status_code === 205) {
            this.getConversionTargetList(true);
          } else {
            this.message.error(result.message);
            this.getConversionTargetList(true);
          }
        },
        (err: any) => {
          this.getConversionTargetList(true);
        },
        () => {},
      );

    this.isDownloadUrlChanged = false;
  }

  // 检查落地页链接
  externalUrlChanged() {
    this.isExternalUrlChanged = true;
  }

  externalUrlBlur() {
    if (!this.isExternalUrlChanged) {
      return;
    }

    this.getConversionTargetList(true);
  }

  // 获取转化目标列表
  getConversionTargetList(isEmpty?) {
    // 清空转化目标
    if (isEmpty) {
      this.data.convert_id = null;
      this.conversionTargetList = [];
    }

    if (this.chan_pub_id === undefined) {
      return;
    }

    const params = {
      chan_pub_id: this.chan_pub_id,
      app_url_type: null,
      app_url: null,
      cid: this.cid,
      landing_type: this.landing_type,
      delivery_range:this.data.delivery_range
    };
    // landing_type  delivery_range
    if (this.landing_type === 'APP') {
      if (this.data.download_type === 'DOWNLOAD_URL') {
        if (this.data.app_type === 'APP_ANDROID') {
          params.app_url_type = 1;
          params.app_url = this.data.package;
        } else if (this.data.app_type === 'APP_IOS') {
          params.app_url_type = 2;
          params.app_url = this.data.download_url;
        }
      } else if (this.data.download_type === 'EXTERNAL_URL') {
        params.app_url_type = 3;
        params.app_url = this.data.external_url;
      }
    } else if (this.landing_type === 'LINK') {
      params.app_url_type = 3;
      params.app_url = this.data.external_url;
    }


    if (!params.chan_pub_id || !params.app_url_type || !params.app_url) {
      this.data.convert_id = null;
      this.conversionTargetList = [];
      return;
    }

    this.launchService
      .getConversionTargetList(params)
      .subscribe(
        (results: any) => {

          if (results.status_code && results.status_code !== 200) {

          } else {
            this.conversionTargetList = results['data'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );

    this.isDownloadUrlChanged = false;
    this.isExternalUrlChanged = false;
  }


  urlClick(data, tag) {
    if (tag === 3) {
      this.data.external_url = data.app_url;
    } else if(tag === 4) {
      this.data.external_url = data.site_url;
      this.data.site_id = data.id;
    } else {
      this.data.download_url = data.app_url;
      this.data.package = data.app_name;
    }

    this.getConversionTargetList(true);
  }


  deliveryRangeChange(event) {
    if (event === 'DEFAULT' && this.data.pricing === 'PRICING_OCPC') {
      this.data.pricing = 'PRICING_OCPM';
    }

    this.targetGroupChange();
    this.getConversionTargetList(true);
  }


  smartBidTypeChange(event) {
    if (event === 'SMART_BID_CONSERVATIVE') {
      this.data.schedule_type = 'SCHEDULE_FROM_NOW';
    }
    this.data.bid = null;
  }

  // 投放目标 --- change事件
  pricingChange(event) {
    if (event === 'PRICING_OCPM' || event === 'PRICING_OCPC') {
      this.data.flow_control_mode = 'FLOW_CONTROL_MODE_FAST';
      if(event === 'PRICING_OCPC') {
        this.data.smart_bid_type = 'SMART_BID_CUSTOM';
      }
    } else {
      this.data.flow_control_mode = 'FLOW_CONTROL_MODE_SMOOTH';
      this.data.smart_bid_type = 'SMART_BID_CUSTOM';
    }
    this.data.bid = null;
  }

  // 应用下载方式 --- change
  downloadTypeChange() {
    this.targetGroupChange();
    this.getConversionTargetList(true);
  }

  // 应用下载类型 --- change
  appTypeChange() {
    this.data.download_url = null;
    this.data.package = null;

    this.targetGroupChange();
    this.getConversionTargetList(true);
  }

  targetGroupChange() {
    this.changeValue.emit();
  }

  dateDate( event ) { //从日期组件中得到的日期数据
    this.data.schedule_time = event.dateData;
  }

  getDisableDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.today) < 0;
  }


  groupNameChange(data) {
    this.groupNameLength = getStringLength(data.adgroup_name,[]);
  }

  changeUrlType() {
      this.data.site_id = null;
      this.data.external_url = null;
  }

  changeAdjustCpa() {
    this.data.bid = null;
  }


}
