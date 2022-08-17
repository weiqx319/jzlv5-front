import {Component, OnInit, ViewChild} from '@angular/core';
import {GlobalTemplateComponent} from "../../../../../../shared/template/global-template/global-template.component";
import {AuthService} from "../../../../../../core/service/auth.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {MenuService} from "../../../../../../core/service/menu.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {AddNaUrlBaiduComponent} from "../add-na-url-baidu/add-na-url-baidu";
import {AssetManagementService} from "../../../../asset-management.service";

@Component({
  selector: 'app-na-url-list-baidu',
  templateUrl: './na-url-list-baidu.html',
  styleUrls: ['./na-url-list-baidu.scss']
})
export class NaUrlListBaiduComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, {static: true}) globalTemplate: GlobalTemplateComponent;

  public syncChanPubIds = [];
  public apiData = [];
  public currentPage = 1;
  public pageSize = 30;
  public loading = false;
  public total: number;
  public noResultHeight = document.body.clientHeight - 300 - 40;

  public searchName = "";
  public accountsList = [];
  public apiSearchData = [];

  constructor(private authService: AuthService,
              private message: NzMessageService,
              private menuService: MenuService,
              private modalService: NzModalService,
              public assetManagementService: AssetManagementService,) {

  }

  ngOnInit() {
    this.loading = false;
    this.refreshData();
    this.getAccountList();
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    const body = {
      "pConditions": [
        {
          "key": "app_na_url_name",
          "name": "",
          "op": "like",
          "value": this.searchName
        },
      ]
    };
    this.assetManagementService.getNaUrlList(body, {
      result_model: 'page',
      page: this.currentPage,
      count: this.pageSize,
    }).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.apiSearchData = [];
          this.total = 0;
        } else {
          this.apiSearchData = results['data']['detail'];
          this.total = results['data']['detail_count'];
        }
        this.loading = false;
      },
      (err: any) => {
        this.loading = false;
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );

  }

  deleteLaunchChannel(data) {
    const body = {
      id_list: [data.app_na_url_id],
    };
    this.assetManagementService.deleteNaUrlList(body, {cid: this.authService.getCurrentUserOperdInfo().select_cid}).subscribe(result => {
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

  createChannel() {
    const add_modal = this.modalService.create({
      nzTitle: '创建调起URL',
      nzWidth: 700,
      nzContent: AddNaUrlBaiduComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-channel-baidu',
      nzFooter: null,
      nzComponentParams: {
        accountsList: this.accountsList
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }

  editLaunchChannel(data,copy?) {
    const add_modal = this.modalService.create({
      nzTitle: '编辑调起URL',
      nzWidth: 700,
      nzContent: AddNaUrlBaiduComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-channel-baidu',
      nzFooter: null,
      nzComponentParams: {
        isEdit: true,
        launchUrlId: data.app_na_url_id,
        accountsList: this.accountsList,
        isCopy: copy,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }

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
          "value": "2"
        },
        {
          "key": "account_status",
          "name": "",
          "op": ">",
          "value": -1
        },
      ]
    };
    this.assetManagementService.getAccountList(body, {
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
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

}
