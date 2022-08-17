import {Component, HostListener, OnInit, Renderer2, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../../../core/service/auth.service";
import {LaunchService} from "../../../../service/launch.service";
import {MenuService} from '../../../../../../core/service/menu.service';

@Component({
  selector: 'app-target-template',
  templateUrl: './target-template.component.html',
  styleUrls: ['./target-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TargetTemplateComponent implements OnInit {

  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;

  public publisherList = {};

  public targetTypeList = {
    'EXTERNAL': '落地页',
    'ANDROID': '应用推广-Android',
    'IOS': '应用推广-IOS',
  };

  public deliveryRangeMap = {
    'DEFAULT': '默认',
    'UNION': '穿山甲',
  };

  public targetTypeListBd = {
    'landing_page':'落地页',
    'android':'应用推广-Android',
    'ios':'应用推广-IOS',
  };


  public marketTypeList =
    {'catalogue': '商品目录'};

  public flowTypeList={
    'flow_0':'默认',
    'flow_2':'自定义',
    'flow_4':'百青藤',
  };




  public noResultHeight = document.body.clientHeight - 187 - 40 - 40;
  public publisherId = 7;

  public cid;

  constructor(private modalService: NzModalService,
              public menuService: MenuService,
              private message: NzMessageService,
              private route: ActivatedRoute,
              private launchService: LaunchService,
              private router: Router,
              private authService: AuthService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.publisherList = this.launchService.getPublisherList();
    this.publisherId = this.menuService.currentPublisherId;
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
          "value": this.publisherId
        }],
    };
    this.launchService
      .getLaunchAudienceTemplateList(body, {
        page: this.currentPage,
        count: this.pageSize,
        cid: this.cid,
        result_model: 'page',
        publisher_id:this.publisherId,
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
      id_list: [data.audience_template_id]
    };
    this.loading = true;
    this.launchService.deleteLaunchAudienceTemplate(body, {cid: this.cid,publisher_id:this.publisherId}).subscribe(result => {
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

