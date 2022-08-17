import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {LaunchService} from "../../service/launch.service";
import {AuthService} from "../../../../core/service/auth.service";

import {differenceInCalendarDays, format} from "date-fns";

@Component({
  selector: 'app-uc-adgroup-section',
  templateUrl: './uc-adgroup-section.component.html',
  styleUrls: ['./uc-adgroup-section.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UcAdgroupSectionComponent implements OnInit {

  @Output() changeValue = new EventEmitter<any>();

  public cid;

  @Input() structConfig;
  @Input() data;
  @Input() objectiveType;
  @Input() downloadUrlData;
  @Input() chan_pub_id;

  @Input() errorTip;

  public groupNameLength = 0;

  public downloadUrlList = [];

  public landingUrlList = [];

  public showCoefficient = false;

  public today = new Date();

  public isDownloadUrlChanged = false;

  public isTargetUrlChanged = false;


  constructor(private launchService: LaunchService,private message: NzMessageService,private authService: AuthService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.getDownloadList();
    if((this.objectiveType === '1' && this.data.target_url) || ((this.objectiveType === '2' || this.objectiveType === '4') && this.data.download_url)) {
      this.getConversionTargetList();
    }
  }

  getDownloadList() {
    if(this.objectiveType === '2') {
      this.downloadUrlList = this.downloadUrlData['2'];
    } else if(this.objectiveType === '4') {
      this.downloadUrlList = this.downloadUrlData['1'];
    }
    this.landingUrlList = this.downloadUrlData['3'];
  }

  groupNameChange(data) {
    this.groupNameLength = data.adgroup_name.length;
  }

  optTargetChange(id) {
    this.changeValue.emit();
    if(id === 1) {
      this.data.delivery = 0;
      this.data.charge_type = 2;
    } else if( id === 2 ) {
      this.data.delivery = 0;
      this.data.charge_type = 1;
    } else {
      this.data.delivery = 3;
      this.data.charge_type = 1;
    }
    this.data.isHiddenConvert = true;
  }

  changeUrlSelect(id) {
    if(id === 'media') {
      this.getMediaUrlList();
    } else {
      this.data.site_id = 0;
      this.landingUrlList = this.downloadUrlData['3'];
    }
    this.data.target_url = "";
    this.data.isHiddenConvert = true;
  }

  getMediaUrlList() {
    this.launchService
      .getMediaUrlList({
        page: 1,
        count: 100000,
        cid: this.cid,
        chan_pub_id: this.chan_pub_id,
      })
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            this.landingUrlList = results['data'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  urlClick(data,type) {
    if(type === 'download') {
      this.data.download_url = data.app_url;
      this.data.package_name = data.app_name;
      this.data.app_name = data.app_label;
      if(this.objectiveType === '2') {
        this.data.target_url = data.app_url;
      }
    } else if(type === 'local') {
      this.data.target_url = data.app_url;
      this.data.site_id = 0;
    } else {
      this.data.target_url = data.public_url;
      this.data.site_id = data.pub_site_id;
    }
    if((this.objectiveType === '1' && (type === 'local' || type === 'media')) || ((this.objectiveType === '2' || this.objectiveType === '4') && type === 'download')) {
      this.getConversionTargetList();
    }
  }

  updateSingleChecked(data) {
    this.data.track_args = [];
    data.forEach(item => {
      if(item.checked) {
        this.data.track_args.push(item.value);
      }
    });
  }

  getConversionTargetList() {
    let link;
    let siteId;
    if(this.objectiveType === '1') {
      link = this.data.target_url;
      siteId = this.data.site_id;
    } else if(this.objectiveType === '2') {
      link = this.data.download_url;
      siteId = 0;
    } else {
      link = this.data.download_url;
      siteId = 0;
    }
    const body = {
      chan_pub_id: this.chan_pub_id,
      objective_type: this.objectiveType,
      url: link,
      site_id: siteId
    };
    this.launchService
      .getConvertConfig(body)
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.data.convertData = results['data'];
            this.data.convertList = this.data.convertData[0]['sub'];
            this.data.convetListType = this.data.convertData[0].key;
            this.data.convert_type = this.data.convertList[0]['convert_type'];
            this.data.ad_convert_id = null;
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  changeConvert() {
    this.data.isHiddenConvert = false;
  }

  changeConventType(id) {
    this.data.ad_convert_id = null;
    this.data.convertList = this.data.convertData.find(item => item.key === id).sub;
    this.data.convert_type = this.data.convertList[0]['convert_type'];
  }

  getConversionId() {
    const data = this.data.convertList.find(item => item.convert_id === this.data.ad_convert_id);
    if(data) {
      this.data.convert_type = data.convert_type;
      this.data.deep_convert_type = this.data.convertList[0]['deep_convert_type'];
    }
  }

  dateDate( event ) { //从日期组件中得到的日期数据
    this.data.schedule = event.dateData;
  }

  getDisableDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.today) < 0;
  }

  targetUrlChanged(value) {
    if(!value && this.objectiveType === '1') {
      this.data.isHiddenConvert = true;
      this.data.isDisabledConvert = true;
    }
    if(this.objectiveType === '1') {
      this.isTargetUrlChanged = true;
    }
    this.data.target_url = value;
  }

  targetUrlBlur() {
    let url_type;
    if (!this.isTargetUrlChanged) {
      return;
    }

    if (!this.data.target_url) {
      return;
    }

    this.objectiveType === '1' ? url_type = 3 : this.objectiveType === '2' ? url_type = 2 : url_type = 1;

    const body = {
      app_url_type: url_type,
      app_url: this.data.target_url,
    };

    this.launchService
      .checkAppUrl(body, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            if (result['data']['status'] == 0) {
              this.data.target_url = result.data.app_url;
              this.getConversionTargetList();
            } else {
              this.data.target_url = "";
              this.data.isDisabledConvert = true;
              this.data.isHiddenConvert = true;
              this.message.error(result['data']['message']);
            }
          } else if (result.status_code && result.status_code === 205) {
          } else {
            this.message.error(result.message);
          }
        },
        (err: any) => {
        },
        () => {},
      );

    this.isDownloadUrlChanged = false;
  }

  // 检查应用下载链接
  downloadUrlChanged(value) {
    if(!value) {
      this.data.isHiddenConvert = true;
      this.data.isDisabledConvert = true;
    }
    this.isDownloadUrlChanged = true;
    this.data.download_url = value;
    if(this.objectiveType === '2') {
      this.data.target_url = value;
    }
  }

  downloadUrlBlur() {
    let url_type;
    if (!this.isDownloadUrlChanged) {
      return;
    }

    this.data.package_name = null;
    this.data.app_name = null;

    if (!this.data.download_url) {
      return;
    }

    this.objectiveType === '1' ? url_type = 3 : this.objectiveType === '2' ? url_type = 2 : url_type = 1;

    const body = {
      app_url_type: url_type,
      app_url: this.data.download_url,
    };

    this.launchService
      .checkAppUrl(body, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            if (result['data']['status'] == 0) {
              this.data.download_url = result.data.app_url;
              this.data.package_name = result.data.app_name;
              this.data.app_name = result.data.app_label;
              this.getConversionTargetList();
            } else {
              this.data.download_url = "";
              this.data.isDisabledConvert = true;
              this.data.isHiddenConvert = true;
              this.message.error(result['data']['message']);
            }
          } else if (result.status_code && result.status_code === 205) {
          } else {
            this.message.error(result.message);
          }
        },
        (err: any) => {
        },
        () => {},
      );

    this.isDownloadUrlChanged = false;
  }

  changeDayBudget(value) {
    if(value === 'nolimit') {
      this.data.budget = "";
    }
  }
}


