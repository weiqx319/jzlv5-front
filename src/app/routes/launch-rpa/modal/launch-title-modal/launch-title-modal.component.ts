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
import { AddLaunchTitleComponent } from '../../components/launch-title/modal/add-launch-title/add-launch-title.component';
import { getStringLengthNew } from "../../../../shared/util/util";

@Component({
  selector: 'app-launch-title-modal',
  templateUrl: './launch-title-modal.component.html',
  styleUrls: ['./launch-title-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchTitleModalComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  @Input() min_length;
  @Input() max_length;
  @Input() chan_pub_id;
  @Input() cssType;
  @Input() maxSelect=null;


  @Input() set defaultSelectedList(value: any[]) {

    value.forEach(item => {
      this.selectedRow({ title: item }, 'add');
    });
  }

  public titleSelectedList = [];
  public titleSelectedMap = {};
  public tagsList = [];

  public apiData = [];

  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;

  syncVisible = false;



  public queryParam = {
    "sheets_setting": {
      "table_setting": {
        "single_condition": [
        ],
        "title_length": {},
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


  public queryItem = {
    create_time: {
      key: 'create_time',
      name: "上传时间",
      op: "between",
      value: [],
    },
    title: {
      key: 'title',
      name: "素材名称",
      op: "like",
      value: null
    },
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
    this.getTagsList();
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
    postData.sheets_setting.table_setting.sort_item = { key: this.sortDataKey, dir: this.sortDataDirection };

    if ((this.menuService.currentPublisherId === 6 || this.menuService.currentPublisherId === 16) && this.min_length && this.max_length) {
      postData.sheets_setting.table_setting['title_length']['min'] = this.min_length;
      postData.sheets_setting.table_setting['title_length']['max'] = this.max_length;
    } else {
      delete postData.sheets_setting.table_setting['title_length'];
    }

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

    this.launchRpaService.getLaunchRasTitleList(this.menuService.currentPublisherId, postData, {
      page: this.currentPage,
      count: this.pageSize,
    })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
          } else {
            this.apiData = [...results['data']['detail']];
            this.apiData.forEach(row => {
              if (this.titleSelectedMap[row['title']]) {
                row['checked'] = true;
              }
            });
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

    if ((this.menuService.currentPublisherId === 6 || this.menuService.currentPublisherId === 16) && this.min_length && this.max_length) {
      postData.sheets_setting.table_setting['title_length']['min'] = this.min_length;
      postData.sheets_setting.table_setting['title_length']['max'] = this.max_length;
    } else {
      delete postData.sheets_setting.table_setting['title_length'];
    }

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
        chan_pub_id: this.chan_pub_id
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result === 'ok') {
        result.data.forEach(item => {
          this.selectedRow({ title: item }, 'add');
        });
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }


  selectedRow(row, type = 'add') {
    if (type == 'add') {
      if (!this.titleSelectedMap[row['title']]) {
        this.titleSelectedList.push(row['title']);
        this.titleSelectedMap[row['title']] = true;
      }
    } else if (type == 'delete') {
      if (this.titleSelectedMap[row['title']]) {
        delete this.titleSelectedMap[row['title']];
        const findIndex = this.titleSelectedList.indexOf(row['title']);
        if (findIndex >= 0) {
          this.titleSelectedList.splice(findIndex, 1);
        }
      }
    }

  }


  checkSingle(event, row) {

    if (event&&this.maxSelect&&this.titleSelectedList.length>=this.maxSelect) {
      this.message.info('最多选择'+this.maxSelect+'个标题');
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
        if (this.maxSelect&&this.titleSelectedList.length>=this.maxSelect) {
          if (!this.overSize) {
            this.message.info('最多选择'+this.maxSelect+'个标题');
            this.overSize=true;
          }
          setTimeout(()=>this._allChecked = false,0);
          return;
        }
        data.checked = true;
        this.selectedRow(data, 'add');
      });
      this.overSize=false;
      this._indeterminate = true;
    } else {

      this._indeterminate = false;
      this.apiData.forEach((data) => {
        data.checked = false;
        this.selectedRow(data, 'delete');
      });
    }
  }




  reset() {
    this.queryItem.create_time.value = [];
    this.queryItem.title.value = null;
    this.queryItem.title_tags.value = null;
    this.queryItem.exclude_title_tags.value = null;
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
    this.titleSelectedMap = {};
    this.titleSelectedList = [];
    this.resetApiDataSelected();
  }


  clearSingeSelected(title) {
    this.selectedRow({ title }, 'delete');
    this.resetApiDataSelected();
  }

  resetApiDataSelected() {
    this.apiData.forEach(row => {
      row['checked'] = !!this.titleSelectedMap[row['title']];
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
    if (this.titleSelectedList.length < 1) {
      this.message.error("请选择标题");
      return;
    }
    if (this.menuService.currentPublisherId === 17) {
      let is_delete = false;
      this.titleSelectedList.forEach((item, index) => {
        const len = getStringLengthNew(item, []);
        if (this.cssType !== 4) {
          if (len > 70) {
            is_delete = true;
            this.titleSelectedList.splice(index, 1);
          }
        } else {
          if (len > 45) {
            is_delete = true;
            this.titleSelectedList.splice(index, 1);
          }
        }

      });
      if (is_delete) {
        this.message.info('已取消选择长度不符的标题');
      }
    }
    this.modalSubject.destroy({ result: 'ok', data: [...this.titleSelectedList] });
  }


  doCancel() {
    this.modalSubject.destroy({ result: 'cancel', data: [] });
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
    this.launchRpaService.getLabelByLaunchType('title').subscribe(results => {
      if (results.status_code && results.status_code === 200) {
        this.tagsList = results['data'];
      } else {
        this.tagsList = [];
      }
    });
  }



}
