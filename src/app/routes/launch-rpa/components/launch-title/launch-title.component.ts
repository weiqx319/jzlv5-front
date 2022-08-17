import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../../core/service/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AddLaunchTitleComponent } from './modal/add-launch-title/add-launch-title.component';
import { LaunchRpaService } from '../../service/launch-rpa.service';
import { GlobalTemplateComponent } from '../../../../shared/template/global-template/global-template.component';
import { MenuService } from 'src/app/core/service/menu.service';
import { isArray, isObject, isUndefined } from "@jzl/jzl-util";
import { BatchEditLabelModalComponent } from '../../modal/batch-edit-label-modal/batch-edit-label-modal.component';
import { deepCopy, formatDate } from '@jzl/jzl-util';
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-launch-title',
  templateUrl: './launch-title.component.html',
  styleUrls: ['./launch-title.component.scss']
})
export class LaunchTitleComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;

  syncVisible = false;
  allAccountCheck = false;


  public sortDataKey = 'create_time';
  public sortDataDirection = 'desc';
  public currentSelectedPage = 'current';
  public tagsList = [];

  public filterResult = {
    material_name: {},
    pub_cost: {},
    pub_cpc: {},
    pub_cpm: {},
    pub_ctr: {},
    b_convert: {},
    b_convert_cost: {},
    b_convert_rate: {},
    create_time: {},
    title: {}
  };


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


  public queryItem = {
    title_tags: {
      key: 'title_tags',
      name: "标签",
      op: "json_contains_and",
      value: null
    },
    exclude_title_tags: {
      key: 'title_tags',
      name: "标签",
      op: "not_json_contains_and",
      value: null
    },
  };

  public syncMaterialTags=[];
  public syncChanPubIds = [];
  public apiData = [];
  public accountsList = [];
  public currentPage = 1;
  public pageSize = 30;
  public loading = false;
  public total: number;
  public noResultHeight = document.body.clientHeight - 300;

  public searchName = "";

  public listQueryParams = {
    pConditions: [],
  };

  public productInfo = {};

  constructor(private authService: AuthService,
    private message: NzMessageService,
    public menuService: MenuService,
    public launchRpaService: LaunchRpaService,
    private modalService: NzModalService,
    private productService: ProductDataService) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  ngOnInit() {
    this.getTagsList();
    this.getAccountList();
    this.loading = false;
    this.reloadData();
  }


  reloadData(status?) {
    this.refreshData(status);
    this.refreshCount();
  }

  sortData(sortInfo,key) {
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


  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;

    this.loading = true;
    const postData = deepCopy(this.queryParam);
    postData.sheets_setting.table_setting.sort_item = { key: this.sortDataKey, dir: this.sortDataDirection };

    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postData.sheets_setting.table_setting.single_condition.push(item);
      }
    });


    Object.values(this.queryItem).forEach((item) => {
      if (item.value) {
        postData.sheets_setting.table_setting.single_condition.push(item);
      }
    });



    this.launchRpaService.getLaunchRasTitleList(this.menuService.currentPublisherId, postData, {
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
        () => { },
      );
  }


  refreshCount(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;


    const postData = deepCopy(this.queryParam);

    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postData.sheets_setting.table_setting.single_condition.push(item);
      }
    });



    Object.values(this.queryItem).forEach((item) => {
      if (item.value) {
        postData.sheets_setting.table_setting.single_condition.push(item);
      }
    });

    this.launchRpaService.getLaunchRasTitleList(this.menuService.currentPublisherId, postData, {
      is_count: 1
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
        () => { },
      );
  }


  syncLaunchTitle() {
    this.syncVisible = true;
  }


  batchEditTag() {

    const selectedData = this.getSelectedData();

    if (selectedData.selected_length > 0) {
      const edit_modal = this.modalService.create({
        nzTitle: '批量编辑标签',
        nzWidth: 800,
        nzContent: BatchEditLabelModalComponent,
        nzClosable: false,
        nzMaskClosable: false,
        nzWrapClassName: 'launch-document',
        nzFooter: null,
        nzComponentParams: {
          publisherId: this.menuService.currentPublisherId,
          labelType: 'title',
          selectedData
        },
      });
      edit_modal.afterClose.subscribe(result => {
        if (isObject(result) && result.result === 'ok') {
          this.refreshData();
        }
      });
    } else {
      this.message.error("请选择标题");
    }
  }

  getSelectedData() {
    const tempData = [];
    this.apiData.forEach(item => {
      if (item.checked) {
        tempData.push(item.title_id);
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
      postData.sheets_setting.table_setting.sort_item = { key: this.sortDataKey, dir: this.sortDataDirection };

      Object.values(this.filterResult).forEach((item) => {
        if (item.hasOwnProperty('key')) {
          postData.sheets_setting.table_setting.single_condition.push(item);
        }
      });
      tempPostData.sheets_setting = postData.sheets_setting;
      return tempPostData;
    } else {
      return tempPostData;
    }





  }



  // 标题库
  addLaunchTitle() {
    const add_modal = this.modalService.create({
      nzTitle: '标题文案管理',
      nzWidth: 800,
      nzContent: AddLaunchTitleComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'launch-document',
      nzFooter: null,
      nzComponentParams: {

      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result === 'ok') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }



  _refreshSingleChangeStatus(event?) {
    this.currentSelectedPage = 'current';
    const allChecked = this.apiData.every(
      (value) => value.checked,
    );
    const allUnchecked = this.apiData.every((value) => !value.checked);

    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;
  }


  _checkAllPage(value) {
    this.currentSelectedPage = 'all';
    if (value) {
      this._allChecked = true;
      this.apiData.forEach((data) => {
        data.checked = true;
      });
      this._indeterminate = true;
    } else {
      this._allChecked = false;
      this._indeterminate = false;
      this.apiData.forEach((data) => (data.checked = false));
    }
  }


  _checkAll(value) {

    this.currentSelectedPage = 'current';
    if (value) {
      this._allChecked = true;
      this.apiData.forEach((data) => {
        data.checked = true;
      });
      this._indeterminate = true;
    } else {
      this._allChecked = false;
      this._indeterminate = false;
      this.apiData.forEach((data) => (data.checked = false));
    }
  }

  cancelSync() {
    this.syncVisible = false;
  }


  handSync() {

    if (this.syncChanPubIds.length < 1) {
      this.message.error("请选择帐号");
      return;
    }

    this.launchRpaService.syncMaterialJob(this.menuService.currentPublisherId, 'title', this.syncChanPubIds,this.syncMaterialTags).subscribe(result => {
      this.syncChanPubIds = [];
      this.syncMaterialTags=[];
      this.syncVisible = false;
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
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  editTitle(title) {


  }

  delTitle(titleId) {
    if (!isUndefined(titleId)) {
      const body = {
        "select_type": "current",
        "title_ids": [titleId],
        "publisher_id": this.menuService.currentPublisherId
      };
      this.launchRpaService.deleteLaunchTitlesBatch(body).subscribe(result => {

        if (result.status_code !== 200) {
          this.message.error(result.message);
        } else {
          this.reloadData();
          this.message.success('删除成功');
        }
      });
    } else {
      this.message.success('非法操作');
    }

  }

  batchDeleteMaterial() {


    const body = {
      "select_type": "current",
      "title_ids": [],
      "publisher_id": this.menuService.currentPublisherId
    };
    const selectData = this.getSelectedData();

    if (selectData.selected_data_ids.length < 1) {
      this.message.error("请选择方案");
      return;
    }

    body.title_ids = [...selectData.selected_data_ids];


    this.launchRpaService.deleteLaunchTitlesBatch(body).subscribe(result => {

      if (result.status_code !== 200) {
        this.message.error(result.message);
      } else {
        this.reloadData();
        this.message.success('删除成功');
      }
    });
  }



  dateChange(eventData) {
    if (eventData !== undefined && eventData['timeFlag']) {
      this.queryParam.sheets_setting.table_setting.summary_date = eventData['timeData']['summary_date'];
      this.reloadData(true);
    }
  }

  getTagsList() {
    this.launchRpaService.getLabelByLaunchType('title').subscribe(results => {
      if (results.status_code && results.status_code === 200) {
        this.tagsList = results['data'];
      } else {
        this.tagsList = [];
      }
    });
  }

  changeAccount() {
    if (this.syncChanPubIds.length === this.accountsList.length) {
      this.allAccountCheck = true;
    } else {
      this.allAccountCheck = false;
    }
  }

  checkAllAccount() {
    this.allAccountCheck = !this.allAccountCheck;
    this.syncChanPubIds = [];
    if (this.allAccountCheck) {
      this.accountsList.forEach(item => {
        this.syncChanPubIds.push(item.chan_pub_id);
      });
    }
  }




}
