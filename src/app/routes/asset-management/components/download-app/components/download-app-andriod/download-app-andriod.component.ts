import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../../../../../../core/service/auth.service";
import {MenuService} from "../../../../../../core/service/menu.service";
import {AssetManagementService} from "../../../../asset-management.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {FormBuilder, FormGroup} from "@angular/forms";
import {NzModalService} from "ng-zorro-antd/modal";
import {deepCopy, formatDate, isArray} from "@jzl/jzl-util";
import {AddDownloadAppAndroidComponent} from "./components/add-download-app-android/add-download-app-android.component";
import {GlobalTemplateComponent} from "../../../../../../shared/template/global-template/global-template.component";
import {SyncCustomAudienceComponent} from "../../../../modal/sync-custom-audience/sync-custom-audience.component";

@Component({
  selector: 'app-download-app-andriod',
  templateUrl: './download-app-andriod.component.html',
  styleUrls: ['./download-app-andriod.component.scss']
})
export class DownloadAppAndriodComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;
  validateForm: FormGroup;
  public publisher_id = 1;

  constructor(
    private fb: FormBuilder,
    private assetManagementService: AssetManagementService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private authService: AuthService,
    public menuService: MenuService,
  ) {
    this.validateForm = this.fb.group({
      app_name: [''],
      chan_pub_id: [''],
      create_time: [[]],
    });
    this.publisher_id = this.menuService.currentPublisherId;
  }

  // 筛选项
  public filterItemList = [
    { name: '应用名称', key: 'app_name', type: 'input', op: 'like' },
    { name: '账户', key: 'chan_pub_id', type: 'select', optionList: [], op: '=' },
    { name: '创建时间', key: 'create_time', type: 'date', op: "between", },
  ];

  public defaultData = {
    publisher_id: this.menuService.currentPublisherId,
    cid: 25,
    app_name: '',
    chan_pub_id: '',
    create_time: [],
  };
  public filterResult = {};

  indeterminate = false;
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;

  public apiData = [];
  public currentPage = 1;
  public pageSize = 30;
  public loading = false;
  public total = 10;
  public noResultHeight = 500;

  public sortDataKey = 'create_time';
  public sortDataDirection = 'desc';
  public currentSelectedPage = 'current';

  public queryParam = {
    pConditions: [],
    sort_item: {
      key: "create_time",
      dir: "desc"
    },
    cid: 25,
    publisher_id: this.menuService.currentPublisherId,
  };

  public accountsList = [];
  public accountsOptions = [];

  ngOnInit(): void {
    this.getAccountList();
    // 初始化筛选项中select选项
    this.initFilterItemOptions();
    this.reloadData();
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
          "value": this.menuService.currentChannelId
        }
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
          if (results.status_code === 200) {
            this.accountsList = results['data']['detail'];
            this.accountsList.forEach(item => {
              this.accountsOptions.push({ value: item.chan_pub_id, label: item.pub_account_name });
            });
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  // 初始化筛选项中select选项
  initFilterItemOptions() {
    this.filterItemList.forEach(element => {
      if (element.type === 'select') {
        if (element.key === 'chan_pub_id') {//账户
          element.optionList = this.accountsOptions;
        }
      }
    });
  }

  reloadData(status?) {
    this.refreshData(status);
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;
    this.loading = true;

    const postData = deepCopy(this.queryParam);
    postData.sort_item = { key: this.sortDataKey, dir: this.sortDataDirection };
    postData.publisher_id = this.defaultData.publisher_id;
    postData.cid = this.defaultData.cid;

    this.filterItemList.forEach(item => {
      if ((isArray(this.defaultData[item.key]) && this.defaultData[item.key].length > 0) || (!isArray(this.defaultData[item.key]) && this.defaultData[item.key])) {
        const condition = {
          "key": item.key,
          "name": item.name,
          "op": item.op,
          "value": this.defaultData[item.key]
        };
        if (item.type === 'date') {
          condition.value = formatDate(new Date(this.defaultData[item.key][0]), 'yyyy/MM/dd') + '-' + formatDate(new Date(this.defaultData[item.key][1]), 'yyyy/MM/dd');
        }
        postData.pConditions.push(condition);
      }
    });

    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postData.pConditions.push(item);
      }
    });


    this.assetManagementService.getDownloadAppListAndroid(postData, {
      page: this.currentPage,
      count: this.pageSize,
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
        () => { },
      );
  }

  resetData() {
    this.defaultData = {
      publisher_id: this.menuService.currentPublisherId,
      cid: 25,
      app_name: '',
      chan_pub_id: '',
      create_time: [],
    };
    this.reloadData();
  }

  refreshChecked() {
    this._indeterminate = false;
    this._allChecked = false;
    this.apiData.forEach(data => {
      data['checked'] = false;
    });
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

  _checkAllPage(value) {
    this.currentSelectedPage = 'all';
    if (value) {
      this._allChecked = true;
      this.apiData.forEach((data) => {
        data['checked'] = true;
      });
      this._indeterminate = true;
    } else {
      this._allChecked = false;
      this._indeterminate = false;
      this.apiData.forEach((data) => (data['checked'] = false));
    }
  }
  _checkAll(value) {
    this.indeterminate = false;
    this.currentSelectedPage = 'current';
    if (value) {
      this._allChecked = true;
      this.apiData.forEach((data) => {
        data['checked'] = true;
      });
      this._indeterminate = true;
    } else {
      this._allChecked = false;
      this._indeterminate = false;
      this.apiData.forEach((data) => (data['checked'] = false));
    }
  }
  _refreshSingleChangeStatus(event?, data?) {
    if (data) {
      data['checked'] = event;
    }
    this.currentSelectedPage = 'current';
    const allChecked = this.apiData.every(
      (value) => value['checked'],
    );
    const allUnchecked = this.apiData.every((value) => !value['checked']);
    if (!allUnchecked && !allChecked) {
      this.indeterminate = true;
    } else {
      this.indeterminate = false;
    }
    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;
  }


  doCreate() {
    const add_modal = this.modalService.create({
      nzTitle: '新增应用',
      nzWidth: 700,
      nzContent: AddDownloadAppAndroidComponent,
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

  doEdit(data,copy?) {
    const add_modal = this.modalService.create({
      nzTitle: '编辑应用',
      nzWidth: 700,
      nzContent: AddDownloadAppAndroidComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-channel-baidu',
      nzFooter: null,
      nzComponentParams: {
        isEdit: true,
        launchUrlId: data.download_android_app_id,
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
  doDelete(data) {
    const body = {
      id_list: [data.download_android_app_id],
    };
    this.assetManagementService.deleteDownloadAppListAndroid(body, {cid: this.authService.getCurrentUserOperdInfo().select_cid}).subscribe(result => {
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
  doSync() {
    const updateModal = this.modalService.create({
      nzTitle: '同步应用',
      nzWidth: 600,
      nzContent: SyncCustomAudienceComponent,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
      nzComponentParams:{
        materialType:'download_app'
      }
    });
    updateModal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

}
