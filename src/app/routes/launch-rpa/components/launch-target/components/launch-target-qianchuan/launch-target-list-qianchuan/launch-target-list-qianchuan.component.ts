import {Component, HostListener, OnInit} from '@angular/core';
import {NzModalService} from "ng-zorro-antd/modal";
import {MenuService} from "../../../../../../../core/service/menu.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {ActivatedRoute, Router} from "@angular/router";
import {LaunchService} from "../../../../../service/launch.service";
import {AuthService} from "../../../../../../../core/service/auth.service";
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";

@Component({
  selector: 'app-launch-target-list-qianchuan',
  templateUrl: './launch-target-list-qianchuan.component.html',
  styleUrls: ['./launch-target-list-qianchuan.component.scss']
})
export class LaunchTargetListQianchuanComponent implements OnInit {

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
    this.noResultHeight = document.body.clientHeight - 187 - 40 - 40;
  }

  ngOnInit() {
    this.refreshData();
  }

  refreshData(status?,targetId?) {
    if (status) {
      this.currentPage = 1;
    }

    this.loading = true;

    this.launchRpaService
      .getTargetBasicListByQC( {
        cid: this.cid,
      },{ page: this.parentPageInfo.currentPage,
        count: this.parentPageInfo.pageSize,})
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.total = 0;
          } else {
            this.apiData = results['data']['detail'];
            this.parentPageInfo.total=results['data']['detail_count'];
            this.apiData.forEach(item => {
              item.active = false;
            });
            if(status) {
              if(targetId) {
                const data = this.apiData.find(item => item.audience_template_id == targetId);
                this.getChildTargetList(true,data);
              } else {
                this.apiData[this.apiData.length - 1].active = true;
                this.getChildTargetList(true,this.apiData[this.apiData.length - 1]);
              }
            }
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

  getChildTargetList(event,value) {
    value.active = event;
    if(event) {
      this.launchRpaService
        .getTargetListByQC(value.audience_template_id,{
          cid: this.cid,
        })
        .subscribe(
          (results: any) => {
            if (results.status_code !== 200) {
              this.apiChildData = [];
              this.total = 0;
            } else {
              this.apiChildData = results['data'];
            }
          },
          (err: any) => {
            this.message.error('数据获取异常，请重试');
          },
          () => {},
        );
    }
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

  deleteLaunchAudienceBasicTemplate(id) {
    const ids = [id];
    this.launchRpaService
      .deleteTargetBasicTemplateQC({id_list: ids}, {
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
