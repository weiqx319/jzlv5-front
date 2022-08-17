import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, OnChanges, SimpleChanges} from '@angular/core';
import {LaunchService} from "../../service/launch.service";
import {AuthService} from "../../../../core/service/auth.service";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import {getStringLength} from '../../../../shared/util/util';

@Component({
  selector: 'app-campaign-section',
  templateUrl: './campaign-section.component.html',
  styleUrls: ['./campaign-section.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CampaignSectionComponent implements OnInit, OnChanges {
  @Input() accountBasic;
  @Input() chan_pub_id;
  @Input() data;
  @Input() errorTip;
  @Input() materialLen;
  @Input() titleLen;
  @Input() campaignDisabledAry;

  @Output() onLandingTypeChange = new EventEmitter<any>();
  @Output() adgroupNum = new EventEmitter<any>();
  @Output() pubCampaignId = new EventEmitter<any>();

  public campaignList = {};

  public campaignNameLength = 0;

  public landingTypeList = [
    { key: 'APP', name: '应用推广' },
    { key: 'LINK', name: '销售线索收集' },
  ];

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
    this.campaignNameChange(this.data);
    this.getcampaignList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['campaignDisabledAry']) {
      this.onCampaignDisabledAry();
    }
  }

  onCampaignDisabledAry() {
    if (this.campaignList[this.chan_pub_id] && this.campaignDisabledAry) {
      this.campaignList[this.chan_pub_id].map(item=> {
        item['disabled']=this.campaignDisabledAry.includes(item.id);
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
    };

    this.launchService
      .getcampaignList(body, {
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code !== 200) {

          } else {
            this.campaignList[chanPubId] = [];
            this.campaignList[chanPubId] = JSON.parse(JSON.stringify(results));

            this.accountBasic['account_enable_campaign_count'] = 500 - this.campaignList[chanPubId].length;

            this.onCampaignDisabledAry();
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  pubCampaignIdChanged(event) {
    const filterItem = this.campaignList[this.chan_pub_id].filter( filter => filter.id === event);
    if (filterItem.length) {
      this.data.campaign_name = filterItem[0].name; // 推广目的
      if (this.data.landing_type !== filterItem[0].landing_type) {
        this.data.landing_type = filterItem[0].landing_type; // 推广目的
        this.onLandingTypeChange.emit();
      }
      this.data.budget = filterItem[0].budget; // 预算
      this.data.budget_slt = this.data.budget === 0? 'nolimt' : 'budget';
      this.data.operation = filterItem[0].operation; // 启用暂停

      this.getCampaignEnabledCount();
    }

    // 已有广告组选择
    this.pubCampaignId.emit();
  }

  getCampaignEnabledCount() {
    const body = {
      chan_pub_id: this.chan_pub_id,
      pub_campaign_id: this.data.pub_campaign_id,
    };
    this.launchService
      .getCampaignEnabledCount(body, {
        cid: this.cid,
      })
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
    if (event === '新建广告组') {
      this.data.pub_campaign_id = null;
    }
    this.data.campaign_name = '';

    // 已有广告组选择
    this.pubCampaignId.emit();
  }

  adgroupNumChange() {
    this.adgroupNum.emit();
  }

  landingTypeChange() {
    this.onLandingTypeChange.emit();
  }

  campaignNameChange(data) {
    this.campaignNameLength = getStringLength(data.campaign_name,[]);
  }


}
