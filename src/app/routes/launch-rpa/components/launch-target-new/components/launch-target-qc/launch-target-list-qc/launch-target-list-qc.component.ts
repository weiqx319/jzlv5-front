import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {NzModalService} from "ng-zorro-antd/modal";
import {MenuService} from "../../../../../../../core/service/menu.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {ActivatedRoute, Router} from "@angular/router";
import {LaunchService} from "../../../../../service/launch.service";
import {AuthService} from "../../../../../../../core/service/auth.service";
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";

@Component({
  selector: 'app-launch-target-list-qc',
  templateUrl: './launch-target-list-qc.component.html',
  styleUrls: ['./launch-target-list-qc.component.scss']
})
export class LaunchTargetListQcComponent implements OnInit {

  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;
  public parentPageInfo={
    currentPage:1,
    pageSize:10,
    total:0
  };
  public sortDataKey = 'create_time';
  public sortDataDirection = 'desc';

  public filterResult = {
    audience_template_name: {},
    promotion_way: {},
  };
  public filterPromotionOption = [
    { key: 'STANDARD', name: '专业推广' },
    { key: 'SIMPLE', name: '极速推广' },
  ];


  public publisherList = {};

  public targetTypeList = {
    'EXTERNAL': '落地页',
    'ANDROID': '应用推广-Android',
    'IOS': '应用推广-IOS',
  };

  public noResultHeight = document.body.clientHeight - 300 - 40;
  public publisherId = 22;

  public cid;

  public targetDrawerVisible = false;

  public targetType = 'basic';

  public apiChildData = [];

  public audienceTemplateId = null;

  public childAudienceTemplateId = null;

  constructor(private modalService: NzModalService,
              private menuService: MenuService,
              private message: NzMessageService,
              private route: ActivatedRoute,
              private launchService: LaunchService,
              private router: Router,
              private authService: AuthService,
              public launchRpaService: LaunchRpaService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.publisherList = this.launchService.getPublisherList();
    this.publisherId = this.menuService.currentPublisherId;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight -300;
  }

  ngOnInit() {
    this.refreshData();
  }
  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }
  sortData(sortInfo, key) {
    if (sortInfo == 'ascend') {
      this.sortDataKey = key;
      this.sortDataDirection = 'asc';
    } else if (sortInfo == 'descend') {
      this.sortDataKey = key;
      this.sortDataDirection = 'desc';
    } else {
      this.sortDataKey = 'create_time';
      this.sortDataDirection = 'desc';
    }
    this.refreshData();

  }

  refreshData(status?,targetId?) {
    if (status) {
      this.currentPage = 1;
    }
    const postBody = {
      cid: this.cid,
      pConditions: [],
      sort_item: { key: this.sortDataKey, dir: this.sortDataDirection }
    };
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postBody.pConditions.push(item);
      }
    });

    this.loading = true;

    this.launchRpaService
      .getTargetListQC( postBody,{ page: this.currentPage,
        count: this.pageSize,})
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.total = 0;
          } else {
            this.apiData = results['data']['detail'];
            this.total=results['data']['detail_count'];
            this.apiData.forEach(item => {
              item.active = false;
            });
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
  deleteLaunchAudienceBasicTemplate(id) {
    const ids = [id];
    this.launchRpaService
      .deleteTargetTemplateQC({id_list: ids}, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            this.message.info('删除成功');
          } else {
            this.message.error(result.message);
          }
          this.refreshData();
        },
        (err: any) => {

        },
        () => {
        },
      );
  }

  closeTargetDrawer(value?) {
    this.targetDrawerVisible = false;
    if(value && (value['isClose'] || value['parentId'])) {
      this.refreshData(value.isClose,value.parentId);
    }
  }

  openTargetVisible(type,data?,value?) {
    this.targetDrawerVisible = true;
    this.targetType = type;
    if(data) {
      data.active = false;
      this.audienceTemplateId = data.audience_template_id;
    }
    this.childAudienceTemplateId = value ? value.audience_template_id : null;
  }
}
