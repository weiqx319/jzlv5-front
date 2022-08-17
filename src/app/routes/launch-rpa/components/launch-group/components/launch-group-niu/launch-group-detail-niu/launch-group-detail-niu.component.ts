import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { GlobalTemplateComponent } from '../../../../../../../shared/template/global-template/global-template.component';
import { deepCopy } from "@jzl/jzl-util";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AddLaunchGroupNiuComponent } from "../add-launch-group-niu/add-launch-group-niu.component";
import { LaunchTitleModalComponent } from '../../../../../modal/launch-title-modal/launch-title-modal.component';
import { LaunchMaterialVideoModalComponent } from '../../../../../modal/launch-material-video-modal/launch-material-video-modal.component';
import { MenuService } from 'src/app/core/service/menu.service';

@Component({
  selector: 'app-launch-group-detail-niu',
  templateUrl: './launch-group-detail-niu.component.html',
  styleUrls: ['./launch-group-detail-niu.component.scss']
})
export class LaunchGroupDetailNiuComponent implements OnInit {

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


  public logVisible = false;


  public apiData = [];
  public currentPage = 1;
  public pageSize = 100000;
  public loading = false;
  public total: number;
  public noResultHeight = document.body.clientHeight - 300;

  public searchName = "";

  public launchGroupId;

  public launchGroupDetail = {};

  public parent_accounts_list = [];


  public niuTemplateVisible = false;

  public accountsList = [];

  public isEdit = false;

  public projectTemplateId = null;

  public isOperationVisible = false;

  public isCopy = false;

  public operationData = {
    project_template_id: "",
    set_campaign_status: false,
    set_adgroup_status: false
  };


  constructor(
    public launchRpaService: LaunchRpaService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private modalService: NzModalService,
    private menuService: MenuService,
  ) {
    this.launchGroupId = this.route.snapshot.params.id;
  }

  ngOnInit() {
    this.getAccountList();
    this.refreshData();
  }

  goBack() {
    history.go(-1);
  }


  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }

    this.loading = true;

    const postData = deepCopy(this.queryParam);


    this.launchRpaService.getLaunchProjectTemplateReportList(this.menuService.currentPublisherId, this.launchGroupId, postData, {
      page: this.currentPage,
      count: 100000
    })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.total = 0;
          } else {
            this.apiData = results['data']['detail'];
            this.total = results['data']['detail'].length;
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }



  getLaunchProjectDetail() {
    this.parent_accounts_list = [];
    this.launchRpaService.getLaunchProjectDetail(this.launchGroupId, { cid: this.authService.getCurrentUserOperdInfo().select_cid })
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            let accountData = {};
            const data = deepCopy(results['data']);
            data['chan_pub_id_lst'].forEach(item => {
              accountData = this.accountsList.find(s_item => s_item.chan_pub_id == item);
              if (accountData) { this.parent_accounts_list.push(accountData); }
            });
            data['enable'] = data.enable !== "0";
            this.launchGroupDetail = deepCopy(data);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 账户列表
  getAccountList() {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": this.menuService.currentPublisherId
        },
        {
          "key": "channel_id",
          "name": "",
          "op": "=",
          "value": this.menuService.currentChannelId
        },
        {
          "key": "account_status",
          "name": "",
          "op": ">",
          "value": -1
        },
      ]
    };
    this.launchRpaService.getAccountList(body, {
      page: 1,
      count: 100000,
      cid: this.authService.getCurrentUserOperdInfo().select_cid,
      user_id: this.authService.getCurrentUserOperdInfo().select_uid,
    })
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            this.accountsList = results['data']['detail'];
          }

          this.getLaunchProjectDetail();
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  editLaunchGroup(data) {
    const add_modal = this.modalService.create({
      nzTitle: '编辑投放项目',
      nzWidth: 900,
      nzContent: AddLaunchGroupNiuComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-launch-group-niu',
      nzFooter: null,
      nzComponentParams: {
        isEdit: true,
        launchGroupId: data.project_id,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.getLaunchProjectDetail();
      }
    });
  }

  openNiuTemplate() {
    this.isEdit = false;
    this.niuTemplateVisible = true;
  }

  closeNiuTemplate() {
    this.niuTemplateVisible = false;
  }



  deleteProjectTemplate(data) {
    const body = {
      id_list: [data.project_template_id],
    };
    this.launchRpaService.deleteProjectTemplate(body, { cid: this.authService.getCurrentUserOperdInfo().select_cid }).subscribe(result => {
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


  editProjectTemplate(data) {
    this.isCopy = false;
    this.isEdit = true;
    this.projectTemplateId = data.project_template_id;
    this.niuTemplateVisible = true;
  }

  showLogDrawer(data) {
    this.logVisible = true;
    this.projectTemplateId = data.project_template_id;
  }

  closeLogDrawer() {
    this.logVisible = false;
  }

  cancel(value) {
    this.niuTemplateVisible = false;
    if (value) {
      this.refreshData();
    }
  }

  copyProjectTemplate(data) {
    this.isCopy = true;
    this.niuTemplateVisible = true;
    this.isEdit = true;
    this.projectTemplateId = data.project_template_id;
  }

  operationTemplate(data) {
    this.isOperationVisible = true;
    this.operationData.project_template_id = data.project_template_id;
    this.operationData.set_campaign_status = true;
    this.operationData.set_adgroup_status = true;
  }

  cancelTemplate() {
    this.isOperationVisible = false;
  }

  saveOperation() {
    this.launchRpaService.runProjectTemplate(this.operationData, { cid: this.authService.getCurrentUserOperdInfo().select_cid }).subscribe(result => {
      if (result['status_code'] == 200) {
        this.message.info('开始运行');
      } else {
        this.message.error(result['message']);
      }
      this.isOperationVisible = false;
      this.refreshData();
    }, () => {
    }, () => {
      this.loading = false;
    });
  }


  dateChange(eventData) {
    if (eventData !== undefined && eventData['timeFlag']) {
      this.queryParam.sheets_setting.table_setting.summary_date = eventData['timeData']['summary_date'];
      this.refreshData(true);
    }
  }

  deleteLaunchGroup(data) {
    const body = {
      id_list: [data.project_id],
    };
    this.launchRpaService.deleteLaunchProjectList(body, { cid: this.authService.getCurrentUserOperdInfo().select_cid }).subscribe(result => {
      if (result['status_code'] == 200) {
        this.router.navigateByUrl('/launch_rpa/group');
        this.message.info('删除成功');
      } else {
        this.message.error(result['message']);
      }
    }, () => {
    }, () => {
      this.loading = false;
    });

  }

}
