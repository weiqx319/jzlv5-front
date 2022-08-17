import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalTemplateComponent } from '../../../../../../shared/template/global-template/global-template.component';
import { AuthService } from '../../../../../../core/service/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MenuService } from '../../../../../../core/service/menu.service';
import { LaunchRpaService } from '../../../../service/launch-rpa.service';
import { AddLaunchTitleComponent } from '../../../launch-title/modal/add-launch-title/add-launch-title.component';
import { UploadVideoMaterialsBatchComponent } from '../../../../modal/upload-video-materials-batch/upload-video-materials-batch.component';
import { deepCopy } from "@jzl/jzl-util";
import { BatchEditLabelModalComponent } from '../../../../modal/batch-edit-label-modal/batch-edit-label-modal.component';
import { isObject } from "@jzl/jzl-util";
import { MaterialsDetailModalComponent } from '../../../../modal/materials-detail-modal/materials-detail-modal.component';
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-launch-material-video',
  templateUrl: './launch-material-video.component.html',
  styleUrls: ['./launch-material-video.component.scss']
})
export class LaunchMaterialVideoComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  public sortDataKey = 'create_time';
  public sortDataDirection = 'desc';
  public currentSelectedPage = 'current';
  public tagsList = [];

  public authorRole = {
    '1': [],
    '2': [],
    '3': [],
  };

  public choreographerList = [];
  public photographList = [];
  public clipList = [];



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
    video_type: {},
    director_id: {},
    camerist_id: {},
    movie_editor_id: {}
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
    material_tags: {
      key: 'material_tags',
      name: "标签",
      op: "json_contains_and",
      value: null
    },
    exclude_material_tags: {
      key: 'material_tags',
      name: "标签",
      op: "not_json_contains_and",
      value: null
    },
  };


  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;

  syncVisible = false;
  allAccountCheck = false;

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
    this.getAuthorList();
    this.getAccountList();
    this.loading = false;
    this.reloadData();
  }


  reloadData(status?) {
    this.refreshData(status);
    this.refreshCount();
  }


  syncLaunchTitle() {
    this.syncVisible = true;
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
      if (result === 'onOk') {
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

    this.launchRpaService.syncMaterialJob(this.menuService.currentPublisherId, 'video', this.syncChanPubIds,this.syncMaterialTags).subscribe(result => {
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


  uploadMaterialsBatch() {
    const add_modal = this.modalService.create({
      nzTitle: '批量上传',
      nzWidth: 800,
      nzContent: UploadVideoMaterialsBatchComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'upload-video-materials',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
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


    this.launchRpaService.getLaunchVideoList(this.menuService.currentPublisherId, postData, {
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


    this.launchRpaService.getLaunchVideoList(this.menuService.currentPublisherId, postData, {
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
          labelType: 'video',
          selectedData
        },
      });
      edit_modal.afterClose.subscribe(result => {
        if (isObject(result) && result.result === 'ok') {
          this.refreshData();
        }
      });
    } else {
      this.message.error("请选择素材");
    }
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
      tempPostData.sheets_setting = postData.sheets_setting;
      return tempPostData;
    } else {
      return tempPostData;
    }





  }


  dateChange(eventData) {
    if (eventData !== undefined && eventData['timeFlag']) {
      this.queryParam.sheets_setting.table_setting.summary_date = eventData['timeData']['summary_date'];
      this.reloadData(true);
    }
  }

  materialsDetail(data) {

    if (data['material_id'] || data['preview_url']) {
      const add_modal = this.modalService.create({
        nzTitle: '素材详情',
        nzWidth: 800,
        nzContent: MaterialsDetailModalComponent,
        nzClosable: false,
        nzMaskClosable: false,
        nzWrapClassName: 'materials-detail-modal',
        nzFooter: null,
        nzComponentParams: {
          data,
          publisherId: this.menuService.currentPublisherId
        },
      });
      add_modal.afterClose.subscribe(result => {
        if (result === 'onOk') {
          this.refreshData();
        }
      });
    }


  }



  delMaterialsSingle(data) {

    this.launchRpaService.deleteVideoMaterials(data.material_id, {}).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.message.success('删除成功');
        this.reloadData();
      } else {
        this.message.error(result.message);
      }
    }, (err: any) => {
      this.message.error('系统异常，请重试');
    });

  }



  getAuthorList() {
    this.launchRpaService
      .getMaterialsAuthorList({}, {
        page: 1,
        count: 10000000,
        cid: this.authService.getCurrentUserOperdInfo().select_cid,
        publisher_id: this.menuService.currentPublisherId,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            const list = results['data']['detail'];
            list.forEach(item => {
              this.authorRole[item.material_author_role].push({
                key: item.material_author_id,
                name: item.material_author_name,
              });
            });

            this.choreographerList = this.authorRole['1'];
            this.photographList = this.authorRole['2'];
            this.clipList = this.authorRole['3'];
          } else if (results.status_code && results.status_code === 205) {

          } else {
            this.message.error(results.message);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  batchDeleteMaterial() {

    const body = {
      "select_type": "current",
      "material_ids": [],
      "publisher_id": this.menuService.currentPublisherId
    };
    const selectData = this.getSelectedData();

    if (selectData.selected_data_ids.length < 1) {
      this.message.error("请选择素材");
    }

    body.material_ids = [...selectData.selected_data_ids];


    this.launchRpaService.deleteVideoMaterialsBatch(body).subscribe(result => {

      if (result.status_code !== 200) {
        this.message.error(result.message);
      } else {
        this.reloadData();
        this.message.success('删除成功');
      }
    });
  }

  getTagsList() {
    this.launchRpaService.getLabelByLaunchType('video').subscribe(results => {
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
