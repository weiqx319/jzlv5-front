import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../core/service/auth.service";
import {LaunchService} from "../../service/launch.service";

@Component({
  selector: 'app-bd-creative-section',
  templateUrl: './bd-creative-section.component.html',
  styleUrls: ['./bd-creative-section.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BdCreativeSectionComponent implements OnInit {
  @ViewChild('inputElement') inputElement: ElementRef;

  @Input() data: any;
  @Input() errorTip: any;
  @Input() materialStyle: any;
  @Input() bidType: any;
  @Input() campaignTypeSetting: any;
  @Input() positionInfo: any;

  public creativeStyleList = [];

  public downloadUrlList: any = {};

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
    this.getDownloadLinkUrl();
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

  urlClick(key,data) {
    this.data[key] = data.app_url;
  }
}
