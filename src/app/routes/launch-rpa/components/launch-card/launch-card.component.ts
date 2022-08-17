import { MenuService } from '../../../../core/service/menu.service';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {ActivatedRoute, Router} from "@angular/router";
import {LaunchRpaService} from "../../service/launch-rpa.service";
import {AuthService} from "../../../../core/service/auth.service";

@Component({
  selector: 'app-launch-card',
  templateUrl: './launch-card.component.html',
  styleUrls: ['./launch-card.component.scss']
})
export class LaunchCardComponent implements OnInit {

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
  public user_id;


  constructor(private modalService: NzModalService,
              private message: NzMessageService,
              public menuService: MenuService,
              private route: ActivatedRoute,
              private router: Router,
              private launchRpaService: LaunchRpaService,
              private authService: AuthService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;

    this.publisherList = this.launchRpaService.getPublisherList();
  }

  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 187 - 40 - 40;
  }

  ngOnInit() {
    this.refreshData();
  }

  deleteTemplate(data) {
    const body = {
      id_list: [data.promo_card_template_id]
    };
    this.loading = true;
    this.launchRpaService.deletePromotionCardTemplate(body, {cid: this.cid, user_id: this.user_id}).subscribe(result => {
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
    this.launchRpaService
      .getPromotionCardTemplate(body, {
        page: this.currentPage,
        count: this.pageSize,
        cid: this.cid,
        user_id: this.user_id,
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
}
