import { Component, HostListener, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { AuthService } from "../../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { MenuService } from "../../../../core/service/menu.service";
import { MaterialsService } from "../../service/materials.service";
import { MaterialsDetailModalComponent } from "../materials-detail-modal/materials-detail-modal.component";
import { isArray, isObject } from "@jzl/jzl-util";
import { arrayChunk, deepCopy, formatDate } from '@jzl/jzl-util';
import { environment } from "../../../../../environments/environment";
import { GlobalTemplateComponent } from '../../../../shared/template/global-template/global-template.component';
import { LaunchRpaService } from '../../service/launch-rpa.service';
import {UploadVideoMaterialsBatchComponent} from "../upload-video-materials-batch/upload-video-materials-batch.component";

@Component({
  selector: 'app-launch-material-video-modal',
  templateUrl: './launch-material-video-modal.component.html',
  styleUrls: ['./launch-material-video-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchMaterialVideoModalComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  @Input() video_type;
  @Input() cssType;
  @Input() maxSelect=null;

  @Input() set defaultSelectedList(value: any[]) {

    value.forEach(item => {
      this.selectedRow(item, 'add');
    });
  }

  public tagsList = [];

  // 作者
  public authorRole = {
    '1': [],
    '2': [],
    '3': [],
  };
  public choreographerList = [];
  public photographList = [];
  public clipList = [];


  public materialSelectedMap = new Map();
  public materialSelectedList = [];

  public apiData = [];

  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;

  syncVisible = false;



  public queryParam = {
    "sheets_setting": {
      "table_setting": {
        "single_condition": [
          {
            "key": "material_status",
            "name": "状态",
            "op": "=",
            "value": 1
          }
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



  public defaultQueryItem: any = {};
  public queryItem = {
    image_type: {
      key: 'image_type',
      name: "素材类型",
      op: "=",
      value: null
    },
    video_type: {
      key: 'video_type',
      name: "素材类型",
      op: "=",
      value: null
    },
    material_make_time: {
      key: 'material_make_time',
      name: "视频制作时间",
      op: "between",
      value: [],
    },
    create_time: {
      key: 'create_time',
      name: "上传时间",
      op: "between",
      value: [],
    },
    material_name: {
      key: 'material_name',
      name: "素材名称",
      op: "like",
      value: null
    },
    director_id: {
      key: 'director_id',
      name: "编导",
      op: "=",
      value: null
    },
    camerist_id: {
      key: 'camerist_id',
      name: "摄影",
      op: "=",
      value: null
    },
    movie_editor_id: {
      key: 'movie_editor_id',
      name: "剪辑",
      op: "=",
      value: null
    },
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

  public syncChanPubIds = [];

  public accountsList = [];
  public currentPage = 1;
  public pageSize = 10;
  public loading = false;
  public total: number;
  public noResultHeight = 600;

  public searchName = "";

  public listQueryParams = {
    pConditions: [],
    sort_item: { key: "create_time", dir: "desc" },
  };
  public sortItemList = [
    { key: "create_time", name: "上传时间" },
    { key: "material_name", name: "素材名称" },
    { key: "material_make_time", name: "素材制作时间" },
  ];

  public stringFilterOper = [
    { key: "=", name: "为" },
    { key: "!=", name: "不为" },
    { key: "like", name: "包含" },
    { key: "notlike", name: "不包含" }
  ];
  public overSize=false;

  constructor(private authService: AuthService,
    private message: NzMessageService,
    public menuService: MenuService,
    private modalSubject: NzModalRef,
    public launchRpaService: LaunchRpaService,
    private modalService: NzModalService) { }

  ngOnInit() {
    if (this.menuService.currentPublisherId === 22||this.menuService.currentPublisherId === 1&&this.cssType) {
      this.queryItem.video_type.value=this.cssType;
    }
    this.getTagsList();
    this.getAuthorList();
    this.defaultQueryItem = deepCopy(this.queryItem);

    this.loading = false;
    this.reloadData();
  }


  reloadData(status?) {
    this.refreshData(status);
    this.refreshCount();
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;

    this.loading = true;

    const postData = deepCopy(this.queryParam);
    if (this.video_type) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          "key": "video_type",
          "name": "视频类型",
          "op": "=",
          "value": this.video_type
        }
      );
    }
    if (this.cssType&&this.cssType===7) {
      postData.sheets_setting.table_setting.single_condition.push(
       {
        key: 'video_type',
          name: "素材类型",
          op: "=",
          value: 2
        },
        {
          key: 'upload_video_size ',
          name: "素材尺寸",
          op: "<",
          value: 50
        },
      );
    }
    postData.sheets_setting.table_setting.sort_item = { key: this.sortDataKey, dir: this.sortDataDirection };

    postData['publisher_id'] = this.menuService.currentPublisherId;
    postData['cid'] = this.authService.getCurrentUserOperdInfo().select_cid;

    Object.values(this.queryItem).forEach((item) => {
      if (item.key == 'create_time' || item.key == 'material_make_time') {
        if (isArray(item.value) && item.value.length == 2) {
          const queryResult = deepCopy(item);
          queryResult.value = formatDate(new Date(item.value[0]), 'yyyy/MM/dd') + '-' + formatDate(new Date(item.value[1]), 'yyyy/MM/dd');
          postData.sheets_setting.table_setting.single_condition.push(queryResult);
        }
      } else if (item.key == 'title' && item.value) {
        const queryResult = deepCopy(item);
        queryResult.value = queryResult.value.split('');
        postData.sheets_setting.table_setting.single_condition.push(queryResult);
      } else if (item.value) {
        postData.sheets_setting.table_setting.single_condition.push(item);
      }
    });

    this.launchRpaService.getVideoList(postData, {
      page: this.currentPage,
      count: this.pageSize,
    }, this.menuService.currentPublisherId)
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
          } else {
            this.apiData = [...results['data']['detail']];
            this.apiData.forEach(row => {
              if (this.materialSelectedMap.has(row['material_id'])) {
                row['checked'] = true;
                this.materialSelectedMap.set(row['material_id'], { ...this.materialSelectedMap.get(row['material_id']), ...row });
              }
            });
            this.materialSelectedList = [...this.materialSelectedMap.values()];
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

    const postData = deepCopy(this.queryParam);
    if (this.video_type) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          "key": "video_type",
          "name": "视频类型",
          "op": "=",
          "value": this.video_type
        }
      );
    }
    if (this.cssType&&this.cssType===7) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          key: 'video_type',
          name: "素材类型",
          op: "=",
          value: 2
        },
        {
          key: 'upload_video_size ',
          name: "素材尺寸",
          op: "<",
          value: 50
        },
      );
    }
    postData['publisher_id'] = this.menuService.currentPublisherId;
    postData['cid'] = this.authService.getCurrentUserOperdInfo().select_cid;

    Object.values(this.queryItem).forEach((item) => {
      if (item.key == 'create_time' || item.key == 'material_make_time') {
        if (isArray(item.value) && item.value.length == 2) {
          const queryResult = deepCopy(item);
          queryResult.value = formatDate(new Date(item.value[0]), 'yyyy/MM/dd') + '-' + formatDate(new Date(item.value[1]), 'yyyy/MM/dd');
          postData.sheets_setting.table_setting.single_condition.push(queryResult);
        }
      } else if (item.key == 'title' && item.value) {
        const queryResult = deepCopy(item);
        queryResult.value = queryResult.value.split('');
        postData.sheets_setting.table_setting.single_condition.push(queryResult);
      } else if (item.value) {
        postData.sheets_setting.table_setting.single_condition.push(item);
      }
    });

    this.launchRpaService.getVideoList(postData, {
      is_count: 1
    }, this.menuService.currentPublisherId)
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




  selectedRow(row, type = 'add') {
    if (type == 'add') {
      if (!this.materialSelectedMap.has(row['material_id'])) {
        this.materialSelectedMap.set(row['material_id'], row);
      }
    } else if (type == 'delete') {
      if (this.materialSelectedMap.has(row['material_id'])) {
        this.materialSelectedMap.delete(row['material_id']);
      }
    }
    this.materialSelectedList = [...this.materialSelectedMap.values()];

  }


  checkSingle(event, row) {
    if (event&&this.maxSelect&&this.materialSelectedMap.size>=this.maxSelect) {
      this.message.info('最多选择'+this.maxSelect+'个视频');
      setTimeout(()=>row['checked'] = false,0);
      return;
    }
    if (row['checked']) {
      this.selectedRow(row, 'add');
    } else {
      this.selectedRow(row, 'delete');
    }

    const allChecked = this.apiData.every(
      (value) => value.checked,
    );
    const allUnchecked = this.apiData.every((value) => !value.checked);

    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;
  }

  _checkAll(value) {
    if (value) {
      this.apiData.forEach((data) => {
        if (this.maxSelect&&this.materialSelectedMap.size>=this.maxSelect) {
          if (!this.overSize) {
            this.message.info('最多选择'+this.maxSelect+'个视频');
            this.overSize=true;
          }
          setTimeout(()=>this._allChecked = false,0);
          return;
        }
        data.checked = true;
        this.selectedRow(data, 'add');
      });
      this.overSize=false;
    } else {

      this._indeterminate = false;
      this.apiData.forEach((data) => {
        data.checked = false;
        this.selectedRow(data, 'delete');
      });
    }
  }




  reset() {
    this.queryItem = deepCopy(this.defaultQueryItem);
    this.currentPage = 1;
    this.refreshData();
  }


  checkAll() {
    this._checkAll(true);
  }

  cancleCheck() {
    // this.materialSltMap = {};
    // this.materialCheckedMap = {};
    // this.materialSltAry = [];
    // this.threeMaterialSltAry = [];
    // this.curIndex = 0;
  }


  clearAllSelected() {
    this.materialSelectedMap.clear();
    this.materialSelectedList = [...this.materialSelectedMap.values()];
    this.resetApiDataSelected();
  }


  clearSingeSelected(materialId) {
    this.selectedRow({ material_id: materialId }, 'delete');
    this.resetApiDataSelected();
  }

  resetApiDataSelected() {
    this.apiData.forEach(row => {
      row['checked'] = !!this.materialSelectedMap.has(row['material_id']);
    });

    const allChecked = this.apiData.every(
      (value) => value.checked,
    );
    const allUnchecked = this.apiData.every((value) => !value.checked);

    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;

  }


  doSave() {
    if (this.materialSelectedMap.size < 1) {
      this.message.error("请选择素材");
      return;
    }
    let data=[...this.materialSelectedMap.values()];
    if (this.menuService.currentPublisherId===17&&data.length>30) {
      data=data.splice(0,30);
      this.message.info('已删除多出的视频');
    }

    this.modalSubject.destroy({ result: 'ok', data: data });
  }


  doCancel() {
    this.modalSubject.destroy({ result: 'cancel', data: [] });
  }


  getAuthorList() {
    this.launchRpaService
      .getMaterialsAuthorList({}, {
        page: 1,
        count: 10000000,
        cid: this.authService.getCurrentUserOperdInfo().select_cid
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


  getTagsList() {
    this.launchRpaService.getLabelByLaunchType('video').subscribe(results => {
      if (results.status_code && results.status_code === 200) {
        this.tagsList = results['data'];
      } else {
        this.tagsList = [];
      }
    });
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
        this.reloadData(true);
      }
    });
  }


}
