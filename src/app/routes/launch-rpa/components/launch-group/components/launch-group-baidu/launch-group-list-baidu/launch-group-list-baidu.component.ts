import {Component, OnInit, ViewChild} from '@angular/core';
import {GlobalTemplateComponent} from "../../../../../../../shared/template/global-template/global-template.component";
import {AuthService} from "../../../../../../../core/service/auth.service";
import {MenuService} from "../../../../../../../core/service/menu.service";
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";
import {deepCopy} from "@jzl/jzl-util";
import {AddLaunchGroupBaiduComponent} from "../add-launch-group-baidu/add-launch-group-baidu.component";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-launch-group-list-baidu',
  templateUrl: './launch-group-list-baidu.component.html',
  styleUrls: ['./launch-group-list-baidu.component.scss']
})
export class LaunchGroupListBaiduComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;


  public queryParam = {
    "sheets_setting": {
      "table_setting": {
        "single_condition": [
        ],
        "sort_item": {
          "key": "create_time",
          "dir": "desc"
        },
        "data_range": [],
        "summary_date": "day:1:6"
      }
    }
  };

  public sortDataKey = 'create_time';
  public sortDataDirection = 'desc';


  public filterResult = {
    material_name: {},
    pub_cost:{},
    pub_cpc:{},
    pub_cpm:{},
    pub_ctr:{},
    b_convert:{},
    b_convert_cost:{},
    b_convert_rate:{},
    create_time:{},
    image_type:{},
    project_name:{}
  };


  public apiData = [];
  public currentPage = 1;
  public pageSize = 30;
  public loading = false;
  public total: number;
  public noResultHeight = document.body.clientHeight - 300;

  public searchName = "";



  constructor(private authService: AuthService,
              private message: NzMessageService,
              private modalService: NzModalService,
              public menuService:MenuService,
              public launchRpaService: LaunchRpaService) { }

  ngOnInit() {
    this.loading = false;
    this.reloadData(true);
  }

  reloadData(status?) {
    this.refreshData(status);
    this.refreshCount();
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }

    this.loading = true;

    const postData = deepCopy(this.queryParam);
    postData.sheets_setting.table_setting.sort_item = {key:this.sortDataKey,dir:this.sortDataDirection};


    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postData.sheets_setting.table_setting.single_condition.push(item);
      }
    });

    this.launchRpaService.getLaunchProjectReportList(this.menuService.currentPublisherId,postData, {
      page: this.currentPage,
      count: this.pageSize,
    })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
          } else {
            this.apiData = results['data']['detail'];
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


  refreshCount(status?) {
    if (status) {
      this.currentPage = 1;
    }


    const postData = deepCopy(this.queryParam);

    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postData.sheets_setting.table_setting.single_condition.push(item);
      }
    });


    this.launchRpaService.getLaunchProjectReportList(this.menuService.currentPublisherId,postData, {
      is_count:1
    })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.total = 0;
          } else {
            this.total = results['data']['detail_count'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  deleteRole(roleId): void {

  }

  createLaunchGroup() {
    const add_modal = this.modalService.create({
      nzTitle: '创建投放项目',
      nzWidth: 900,
      nzContent: AddLaunchGroupBaiduComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-launch-group-baidu',
      nzFooter: null,
      nzComponentParams: {
        // isEdit: false
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }

  editLaunchGroup(data) {
    const add_modal = this.modalService.create({
      nzTitle: '编辑投放项目',
      nzWidth: 900,
      nzContent: AddLaunchGroupBaiduComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-launch-group-baidu',
      nzFooter: null,
      nzComponentParams: {
        isEdit: true,
        launchGroupId: data.project_id,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }

  deleteLaunchGroup(data) {
    const body = {
      id_list:[data.project_id],
    };
    this.launchRpaService.deleteLaunchProjectList(body,{cid:this.authService.getCurrentUserOperdInfo().select_cid}).subscribe(result => {
      if (result['status_code'] == 200) {
        this.message.info('删除成功');
        this.refreshData();
      } else {
        this.message.error(result['message']);
      }
    }, () => {
    }, () => {
      this.loading = false;
    });

  }


  dateChange(eventData) {
    if(eventData !== undefined && eventData['timeFlag']) {
      this.queryParam.sheets_setting.table_setting.summary_date = eventData['timeData']['summary_date'];
      this.reloadData(true);
    }
  }

}
