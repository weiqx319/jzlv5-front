import { MenuService } from '../../../../../../core/service/menu.service';
import {Component, HostListener, OnInit, Renderer2, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../../../core/service/auth.service";
import {LaunchService} from "../../../../service/launch.service";

@Component({
  selector: 'app-campaign-template',
  templateUrl: './campaign-template.component.html',
  styleUrls: ['./campaign-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CampaignTemplateComponent implements OnInit {

  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;

  public publisherList = {};

  public landingTypeList = {
    'APP': '应用推广',
    'LINK': '销售线索收集',
  };

  public noResultHeight = document.body.clientHeight - 187 - 40 - 40;

  public cid;

  constructor(private modalService: NzModalService,
              private message: NzMessageService,
              private route: ActivatedRoute,
              private router: Router,
              public menuService: MenuService,
              private launchService: LaunchService,
              private authService: AuthService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.publisherList = this.launchService.getPublisherList();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 187 - 40 - 40;
  }

  ngOnInit() {
    this.refreshData();
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }

    this.loading = true;

    const body = {
      "pConditions":[
        {
          "key":"publisher_id",
          "name":"",
          "op":"=",
          "value":"7"
        }],
    };
    this.launchService
      .getLaunchTemplateList(body, {
        page: this.currentPage,
        count: this.pageSize,
        cid: this.cid,
        result_model: 'page',
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.total = 0;
          } else {
            this.apiData = results['data']['detail'];
            this.total = results['data']['detail_count'];
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }


  deleteTemplate(data) {
    const body = {
      id_list: [data.launch_template_id]
    };
    this.loading = true;
    this.launchService.deleteLaunchTemplate(body, {cid: this.cid}).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.message.success('删除成功');
        this.refreshData();
      } else {
        this.message.error(result.message);
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.message.error('系统异常，请重试');
    });
  }

}

