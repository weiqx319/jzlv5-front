import { isArray } from '@jzl/jzl-util';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { deepCopy, formatDate } from '@jzl/jzl-util';
import { AssetManagementService } from './../../../../asset-management.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";
import { UploadCustomAudienceComponent } from './../../../../modal/upload-custom-audience/upload-custom-audience.component';
import { ConversionUploadService } from './../../../../../manage/service/conversion-upload.service';

ConversionUploadService
@Component({
  selector: 'app-upload-audience-list',
  templateUrl: './upload-audience-list.component.html',
  styleUrls: ['./upload-audience-list.component.scss'],
  providers: [ConversionUploadService],
})
export class UploadAudienceListComponent implements OnInit {
  validateForm: FormGroup;
  public publisher_id = 7;
  // 数据类型选项
  public dataSourceTypeList = [];
  constructor(
    private fb: FormBuilder,
    private assetManagementService: AssetManagementService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private authService: AuthService,
    public menuService: MenuService,
    public uploadService: ConversionUploadService,
  ) {
    this.validateForm = this.fb.group({
      custom_audience_name: [''],
      data_source_type: [''],
      chan_pub_id: [''],
      status: [''],
      create_time: [[]],
    });
    this.publisher_id = this.menuService.currentPublisherId;
    // 数据类型选项
    this.dataSourceTypeList = this.assetManagementService.dataSourceTypeList['publisher_' + this.publisher_id];
  }

  private updateModal = null;
  public can_nav = true;


  // 人群包上传参数
  public uploadParams = {
    custom_audience_name: '',
    chan_pub_id: '',
    data_source_type: '',
    desc: ''
  };


  // 推送状态
  public statusObj = {
    0: "保存",
    1: "待推送",
    7001: "推送中",
    7002: "媒体计算中",
    7003: "完成",
    7004: "失败",
  }

  // 筛选项
  public filterItemList = [
    { name: '人群名称', key: 'custom_audience_name', type: 'input', op: 'like' },
    { name: '数据类型', key: 'data_source_type', type: 'select', optionList: [], op: '=' },
    { name: '账户', key: 'chan_pub_id', type: 'select', optionList: [], op: '=' },
    { name: '推送状态', key: 'status', type: 'select', optionList: [], op: '=' },
    { name: '创建时间', key: 'create_time', type: 'date', op: "between", },
  ];


  public defaultData = {
    publisher_id: this.menuService.currentPublisherId,
    cid: 25,
    custom_audience_name: '',
    status: '',
    source: '',
    tag: '',
    create_time: [],
  };
  public filterResult = {

  };

  indeterminate = false;
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;


  public apiData = [];
  public accountsList = [];
  public accountsOptions = [];
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




  ngOnInit(): void {
    this.getAccountList();
    // 初始化筛选项中select选项
    this.initFilterItemOptions();
    this.reloadData();
  }

  // 初始化筛选项中select选项
  initFilterItemOptions() {
    this.filterItemList.forEach(element => {
      if (element.type === 'select') {
        let obj;
        if (element.key === 'status') {//人群状态
          obj = this.statusObj;
          element.optionList.length = 0;
          for (const key in obj) {
            element.optionList.push({ value: key, label: obj[key] });
          }
        } else if (element.key === 'data_source_type') {//数据类型
          element.optionList = this.dataSourceTypeList;
        } else if (element.key === 'chan_pub_id') {//账户
          element.optionList = this.accountsOptions;
        }

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
              this.accountsOptions.push({ value: item.chan_pub_id, label: item.pub_account_name })
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
        }
        if (item.type === 'date') {
          condition.value = formatDate(new Date(this.defaultData[item.key][0]), 'yyyy/MM/dd') + '-' + formatDate(new Date(this.defaultData[item.key][1]), 'yyyy/MM/dd')
        }
        postData.pConditions.push(condition);
      }
    });

    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postData.pConditions.push(item);
      }
    });


    this.assetManagementService.getUploadAudienceList(postData, {
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
      custom_audience_name: '',
      status: '',
      source: '',
      tag: '',
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


  getSelectedData() {
    const tempData = [];
    this.apiData.forEach(item => {
      if (item.checked) {
        tempData.push(item.material_id);
      }
    });

    const tempPostData = {
      selected_type: this.currentSelectedPage,
      selected_data: [],
      selected_data_ids: tempData,
      selected_length: tempData.length,
      sheets_setting: {}
    };

    if (tempPostData.selected_type == 'all') {
      const postData = deepCopy(this.queryParam);
      postData.sort_item = { key: this.sortDataKey, dir: this.sortDataDirection };

      Object.values(this.filterResult).forEach((item) => {
        if (item.hasOwnProperty('key')) {
          postData.pConditions.push(item);
        }
      });
      tempPostData.sheets_setting = postData;
      return tempPostData;
    } else {
      return tempPostData;
    }

  }


  // 人群包上传
  uploadCustomAudience() {
    this.updateModal = this.modalService.create({
      nzTitle: '上传人群包',
      nzWidth: 700,
      nzContent: UploadCustomAudienceComponent,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
    this.updateModal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
      if (result['can_jump'] === true) {
        this.can_nav = true;
      } else if (result['can_jump'] === false) {
        this.can_nav = false;
      }
    });
  }


}
