import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../core/service/auth.service";
import {LaunchService} from "../../service/launch.service";

@Component({
  selector: 'app-creative-section',
  templateUrl: './creative-section.component.html',
  styleUrls: ['./creative-section.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreativeSectionComponent implements OnInit {
  @ViewChild('inputElement') inputElement: ElementRef;

  @Input() data: any;
  @Input() errorTip: any;
  @Input() landing_type: any;
  @Input() adgroup: any;
  @Input() mediaTargetList;
  @Input() materialType;

  @Output() changeValue = new EventEmitter<any>();

  public creativeStyleList = [];

  public callActionList = {
    'APP': [
      { key: '立即下载', name: '立即下载' },
    ],
    'LINK': [
      { key: '查看详情', name: '查看详情' },
    ],
  };

  public structConfigLoading = true;
  public structConfig: any = {};

  public downloadUrlList: any = {};

  public cid;

  public inputValue = '';

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
    this.getFeedStructConfigByteDance();
    this.getDownloadLinkUrl();
    if(this.callActionList[this.landing_type] && !this.data.action_text) {
      this.data.action_text = this.callActionList[this.landing_type][0]['key'];

    }
  }

  targetGroupChange() {
    this.changeValue.emit();
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
            this.structConfig = {...results['creative']};
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

          if (results.status_code && results.status_code !== 200) {
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

  urlClick(data,tag) {
    if(tag === 1) {
      this.data.web_url = data.app_url;
    } else {
      this.data.web_url = data.site_url;
      this.data.site_id = data.id;
    }
  }

  AddTags() {
    let dataValid = true;
    const inputValueAry = this.inputValue.split(/\s+/g); // 根据换行或者回车进行识别

    inputValueAry.forEach((item, idx) => {
      if (item.length > 10) {
        dataValid = false;
      }
      if (!item) {
        inputValueAry.splice(idx, 1);
      }
    });

    if (!dataValid) {
      this.message.error('每个标签不超过10个字');
      return false;
    }

    if ((this.data.ad_keywords.length + inputValueAry.length) > 20) {
      this.message.error('最多20个标签');
      return false;
    }

    inputValueAry.forEach(item => {
      if(item.length && this.data.ad_keywords.indexOf(item) === -1) {
        this.data.ad_keywords.push(item);
      }
    });
    this.inputValue = '';
  }

  deleteTag(index) {
    this.data.ad_keywords.splice(index, 1);
  }

  clearTags() {
    this.data.ad_keywords = [];
  }

  onCategoryChanges(event) {

  }

  changeUrlType() {
      this.data.site_id = null;
      this.data.web_url = null;
  }

}
