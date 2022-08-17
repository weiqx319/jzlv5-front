import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, OnChanges, SimpleChanges} from '@angular/core';
import {AuthService} from "../../../../core/service/auth.service";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { differenceInCalendarDays } from 'date-fns/esm';
import {LaunchService} from "../../service/launch.service";

@Component({
  selector: 'app-bd-campaign-section',
  templateUrl: './bd-campaign-section.component.html',
  styleUrls: ['./bd-campaign-section.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BdCampaignSectionComponent implements OnInit, OnChanges {
  @Input() chan_pub_id;
  @Input() data;
  @Input() errorTip;
  @Input() structConfig;
  @Input() appSource;
  @Input() campaignDisabledAry;
  @Input() materialStyle;
  @Input() creativeMaterial;

  @Output() adgroupNum = new EventEmitter<any>();
  @Output() pubCampaignId = new EventEmitter<any>();

  public campaignList = {};
  public launchAppList = {};

  public appUrlList = [];

  public isAppUrlChanged = false;
  public isTimeOut = true;

  public showCoefficient = false;
  public today = new Date();

  public cid;

  constructor(
    private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private launchService: LaunchService,
    private authService: AuthService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.getcampaignList();
    this.getLaunchAppList();
    this.getAppLinkUrl();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['campaignDisabledAry']) {
      this.onCampaignDisabledAry();
    }
  }

  onCampaignDisabledAry() {
    if (this.campaignList[this.chan_pub_id] && this.campaignDisabledAry) {
      this.campaignList[this.chan_pub_id].map(item=> {
        item['disabled']=this.campaignDisabledAry.includes(item.pub_campaign_id);
      });
    }
  }

  getcampaignList() {
    const chanPubId = this.chan_pub_id;
    if (this.campaignList[chanPubId] !== undefined) {
      return;
    }

    const body = {
      chan_pub_id: chanPubId,
      marketing_target: this.data['marketing_target'],
      launch_target: this.data['launch_target'],
      operating_system: this.data['operating_system'],
    };

    const postAppSource = [];
    this.appSource.forEach( item => {
      if (item.checked) {
        postAppSource.push(item.value);
      }
    });
    body['app_source'] = postAppSource;

    if (this.data['launch_target'] === 'landing_page') {
      body.operating_system = '';
    }

    this.launchService
      .getBaiduCampaignList(body)
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code !== 200) {

          } else {
            this.campaignList[chanPubId] = [];
            this.campaignList[chanPubId] = JSON.parse(JSON.stringify(results['data']));

            this.onCampaignDisabledAry();
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  getLaunchAppList() {
    const chanPubId = this.chan_pub_id;
    if (this.campaignList[chanPubId] !== undefined) {
      return;
    }

    const body = {
      chan_pub_id: chanPubId,
    };

    this.launchService
      .getBaiduLaunchAppList(body)
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code !== 200) {

          } else {
            this.launchAppList[chanPubId] = [];
            this.launchAppList[chanPubId] = JSON.parse(JSON.stringify(results));
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  pubCampaignIdChanged(event) {
    this.data.app_id = null;
    const filterItem = this.campaignList[this.chan_pub_id].filter( filter => filter.pub_campaign_id === event);
    if (filterItem.length) {
      this.data.pub_campaign_name = filterItem[0].pub_campaign_name; // 计划名称
      this.data.pause = filterItem[0].pause; // 启用暂停
      this.data.budget = filterItem[0].budget; // 预算
      this.data.budget_slt = this.data.budget < 50? 'nolimt' : 'budget';
      if (this.data.launch_target === 'app') {
        if ((this.data.operating_system === 'android' && this.data.app_source.indexOf('select_app') !== -1) || this.data.operating_system === 'ios') {
          this.data.app_url = filterItem[0]['app_info'].app_url; // 下载链接
          this.data.app_name = filterItem[0]['app_info'].app_name; // 应用名称
        }
        if (this.data.operating_system === 'android' && this.data.app_source.indexOf('select_app') !== -1) {
          this.data.app_url = filterItem[0]['app_info'].app_url; // 下载链接
          this.data.app_name = filterItem[0]['app_info'].app_name; // 应用名称
          this.data.apk_name = filterItem[0]['app_info'].apk_name; // 应用包名
        }
      }
      if(filterItem[0]['app_info'].app_id) {
        this.data.app_id = filterItem[0]['app_info'].app_id;
      }

      // 推广日期
      if (filterItem[0].start_time && filterItem[0].end_time) {
        this.data.schedule_type = 'time';

        // 判断日期范围是否小于今天
        if (differenceInCalendarDays(new Date(filterItem[0].start_time), new Date()) < 0 ) {
          this.data.time_range[0] = new Date();
          this.data.start_time = null;
        }
        if (differenceInCalendarDays(new Date(filterItem[0].end_time), new Date()) < 0 ) {
          this.data.time_range[1] = new Date();
          this.data.end_time = null;
        }
      } else {
        this.data.schedule_type = 'nolimt';
      }

      // 推广时段
      if (filterItem[0].schedule) {
        this.data.schedule = filterItem[0].schedule;
        this.data.schedule_slt = 'schedule';
      } else {
        this.data.schedule_slt = 'nolimt';
      }
      this.data.bgtctl_type = filterItem[0].bgtctl_type; // 投放方式

      this.getCampaignEnabledCount();
    }

    // 已有计划选择
    this.pubCampaignId.emit();
  }

  getCampaignEnabledCount() {
    const body = {
      chan_pub_id: this.chan_pub_id,
      pub_campaign_id: this.data.pub_campaign_id,
      pub_campaign_bs_type: 3,
    };
    this.launchService
      .getBaiduCampaignEnabledCount(body)
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {

          } else {
            const data = JSON.parse(JSON.stringify(results['data']));
            this.data['campaign_enable_count'] = data.ok_num;
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  campaignSltChanged(event) {
    if (event === '新建计划') {
      this.data.pub_campaign_id = null;
    }
    this.data.pub_campaign_name = '';
  }

  // 检查下载链接
  appUrlChanged() {
    this.isAppUrlChanged = true;
  }

  appUrlBlur() {
    if (!this.isAppUrlChanged || this.data.operating_system === 'ios') {
      return;
    }

    this.data.app_name = null;
    this.data.apk_name = null;

    if (!this.data.app_url) {
      return;
    }

    const body = {
      app_url_type: 1,
      app_url: this.data.app_url,
    };
    this.isTimeOut = false;

    this.launchService
      .checkAppUrl(body, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            if (result['data']['status'] == 0) {
              this.data.app_name = result['data']['app_label'];
              this.data.apk_name = result['data']['app_name'];
            } else {
              this.message.error(result['data']['message']);
            }

          } else if (result.status_code && result.status_code === 205) {

          } else if (result.status_code && result.status_code === 504) {
            this.isTimeOut = true;
          } else {
            this.message.error(result.message);
          }
        },
        (err: any) => {
        },
        () => {},
      );

    this.isAppUrlChanged = false;
  }

  urlClick(data) {
    this.data.app_url = data.app_url;
    this.data.app_name = data['app_label'];
    this.data.apk_name = data['app_name'];
    // this.getConversionTargetList(true);
  }

  dateDate( event ) { //从日期组件中得到的日期数据
    this.data.schedule = event.dateData;
  }

  getDisableDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.today) < 0;
  }

  adgroupNumChange() {
    this.adgroupNum.emit();
  }

  getAppLinkUrl() {
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
            this.appUrlList = {...results};
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }


}
