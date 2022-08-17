import { Component, HostListener, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ManageService } from "../../../../service/manage.service";
import { CustomDatasService } from "../../../../../../shared/service/custom-datas.service";
import { TableTimeComponent } from "../../../../../../module/table-time/components/table-time/table-time.component";
import { deepCopy, generateTimeTip } from "@jzl/jzl-util";
import { TableFieldFeedComponent } from "../../../../../../module/table-setting/components/table-field/table-field-feed.component";
import { ViewBookmarkComponent } from "../../../../../../module/bookmark/components/view-bookmark.component";
import { ActivatedRoute, Router } from "@angular/router";
import { ReportService } from "../../../../../report-feed/service/report.service";
import { AuthService } from "../../../../../../core/service/auth.service";
import { NotifyService } from "../../../../../../module/notify/notify.service";
import { MenuService } from "../../../../../../core/service/menu.service";
import { Subscription } from "rxjs";
import { DataViewTableComponent } from "../../../../../../shared/baseClass/DataViewTableComponent";
import { DataViewService } from "../../../../../materials/service/data-view.service";
import { LocalStorageService } from "ngx-webstorage";
import { ViewItemService } from "../../../../../materials/service/view-item.service";
import { TableItemFeedService } from "../../../../../../module/table-setting/service/table-item-feed.service";
import { MaterialsService } from "../../../../../materials/service/materials.service";
import { MaterialsManageService } from "../../../../service/materials-manage.service";
import { GlobalTemplateComponent } from "../../../../../../shared/template/global-template/global-template.component";
import { TableFieldComponent } from "../../../../../../module/table-setting/components/table-field/table-field.component";

@Component({
  selector: 'app-materials-manage-report-video',
  templateUrl: './materials-manage-report-video.component.html',
  styleUrls: ['./materials-manage-report-video.component.scss', '../../materials-manage.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ReportService, DataViewService, ViewItemService, TableItemFeedService, MaterialsService]
})
export class MaterialsManageReportVideoComponent extends DataViewTableComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  public validateVideoForm: FormGroup;
  private sub = new Subscription();

  visible = false;
  public detailData = {};
  public material_name = '';
  public materials_type = '';

  public viewChartShow = false;
  public showChartType = 'day';
  public chartItems = [];

  public chartOptions: any;

  public apiData = [];
  public accountsList = [];
  public currentPage = 1;
  public pageSize = 30;
  public loading = false;
  public total: number;
  public noResultHeight = document.body.clientHeight - 300;

  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  allPublisherCheck = true;
  allDepartmentCheck = false;
  allCidCheck = true;

  public authorRole = {
    '1': [],
    '2': [],
    '3': [],
  };
  public loadingIndicator = true;
  public loadingCountIndicator = true;
  public reorderable = false;
  public allFilterOption: any;

  public tableHeight = document.body.clientHeight - 60 - 65 - 30 - 40;
  public rowHeight = 40;
  public summaryHeight = 40;
  private defaultRowHeight = 40;

  public isJump = '';

  public is_refresh = 0;
  public defaultSortItems = [{ prop: 'pub_cost', dir: 'desc' }];

  public bookMarkTop = 96;
  public pubTableItems = [];

  public dataTimeDesc = '';
  public publisher_id;
  public materialVisible = false;
  public materialDetailData;

  public filterResult = {
    material_name: {},
    pub_impression: {},
    pub_click: {},
    pub_cost: {},
    pub_cpc: {},
    pub_cpm: {},
    pub_ctr: {},
    bub_convert: {},
    convert_cost: {},
    convert_rate: {},
    create_time: {},
    video_type: {},
    director_id: {},
    camerist_id: {},
    movie_editor_id: {},
    cid: {},
    publisher_id: {},
    use_count_num: {}
  };


  public queryParam = {
    cid: 25,
    publisher_id: 7,
    sheets_setting: {
      table_setting: {
        single_condition: [],
        sort_item: {
          key: "pub_cost",
          dir: "desc"
        },
        selected_items: [],
        data_range: [],
        summary_date: 'day:1:6',
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

  public sortDataKey = 'pub_cost';
  public sortDataDirection = 'desc';
  public currentSelectedPage = 'current';
  public tagsList = [];
  public sumData = {};


  public selected_items = [];
  public advertisersObj = {};
  public departmentList = [];

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private modalService: NzModalService,
    private manageService: ManageService,
    private customDataService: CustomDatasService,
    public reportService: ReportService,
    public localSt: LocalStorageService,
    public authService: AuthService,
    public notifyService: NotifyService,
    public menuService: MenuService,
    public materialsManageService: MaterialsManageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    super(localSt, authService, menuService, notifyService, message, reportService);

    this.selectList.advertiserList = [...this.materialsManageService.advertisers];
    this.defaultData.cid = this.materialsManageService.advertisers[0].key;
    this.advertisersObj = this.materialsManageService.advertisersObj;
    this.departmentList = this.materialsManageService.departmentList;
    // this.selectList.mediaList = [...this.customDataService.publisherNewList];

    this.validateVideoForm = this.fb.group({
      publisher_id: [[], [Validators.required]],
      cid: [[], [Validators.required]],
      department: [[], [Validators.required]],
      material_name: ['', [Validators.required]],
      file_name: [''],
      material_tags: [[]],
      material_type: [[]],
      material_source: [[]],
      status: [''],
      date: [[]],
      director_id: [[]],
      grip_id: [[]],
      batch_filter: [''],
      camerist_id: [[]],
      movie_editor_id: [[]]
    });
  }

  public timeDesc = '';
  public advertiserList = [];
  public mediaList = [];

  public configList = [
    { name: '素材名称', key: 'material_name', type: 'input' },
    { name: '标签', key: 'material_tags', type: 'select', mode: 'tags', label: 'tagsList', optionList: [] },
    { name: '报告时间', key: 'date', type: 'date' },
  ];

  public date = [];
  public defaultData = {
    publisher_id: [],
    cid: [],
    department: [],
    material_name: '',
    material_tags: [],
    summary_date: 'day:1:6',
    summary_date_compare: 'day:8:6',
    other_compare_date_list: [],
    summary_date_alias: '',
    summary_date_compare_alias: '',
    time_grain: 'summary',
  };
  public videoTypeConfigList = [{
    'key': '1',
    'name': '横版视频',
  }, {
    'key': '2',
    'name': '竖版视频',
  }
  ];
  public selectList = {
    advertiserList: [],
    choreographerList: [],
    photographList: [],
    clipList: [],
    tagsList: [],
    mediaList: [
      { key: 7, name: '头条' },
      { key: 6, name: '广点通' },
      { key: 17, name: '超级汇川' },
      { key: 16, name: '快手' },
      { key: 1, name: '百度信息流' },
    ]
  };

  public currentUser;
  public userOperdInfo;


  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.userOperdInfo = this.authService.getCurrentUserOperdInfo();
    this.selected_items = this.localSt.retrieve('video_report_selected_items')||[];
    this.queryParam.sheets_setting.table_setting['selected_items'] = this.selected_items;

    this.defaultData.publisher_id = [];
    this.defaultData.cid = [];
    this.defaultData.department = [];
    this.selectList.advertiserList.forEach(item => {
      this.defaultData.cid.push(item.key);
    });
    this.selectList.mediaList.forEach(item => {
      this.defaultData.publisher_id.push(item.key);
    });
    if (this.localSt.retrieve('video_report_defaultData_'+this.currentUser.user_id + '_' + this.userOperdInfo.select_uid + '_' + this.userOperdInfo.select_cid)) {
      this.defaultData = this.localSt.retrieve('video_report_defaultData_'+this.currentUser.user_id + '_' + this.userOperdInfo.select_uid + '_' + this.userOperdInfo.select_cid);
    }

    this.generateOnlineTimeShow();
    this.getTagsList();
    this.getAuthorList();
    this.reloadData();

  }


  selectChange(event, type) {

  }
  changeOnlineDate() {
    const add_modal = this.modalService.create({
      nzTitle: '时间选择',
      nzWidth: 600,
      nzContent: TableTimeComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        timeSetting: {
          summary_date: this.defaultData['summary_date'],
          summary_date_compare: this.defaultData['summary_date_compare'],
          summary_date_alias: this.defaultData['summary_date_alias'],
          summary_date_compare_alias: this.defaultData['summary_date_compare_alias'],
          time_grain: this.defaultData['time_grain'],
          other_compare_date_list: this.defaultData['other_compare_date_list'],
        },
        isCompare: this.defaultData['is_compare'],
        defined_is_disable: false
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result.dataType && result.dataType === 'time') {
        this.defaultData = Object.assign(this.defaultData, result['data']);
        this.generateOnlineTimeShow();
      }
    });

  }
  generateOnlineTimeShow() {
    this.timeDesc = generateTimeTip(this.defaultData['summary_date'], this.defaultData['summary_date_compare'], this.defaultData['is_compare']);
  }
  refreshData(status?) {
    const isValid = this.checkBasicData();
    if (isValid) {
      this.message.error('广告主和媒体不能为空！');
      return;
    }
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;

    this.loading = true;

    const postData = deepCopy(this.queryParam);
    postData.sheets_setting.table_setting.sort_item = { key: this.sortDataKey, dir: this.sortDataDirection };
    postData.sheets_setting.table_setting.summary_date = this.defaultData.summary_date;
    postData.publisher_id = this.defaultData.publisher_id;
    postData.cid = this.defaultData.cid;
    postData['department'] = this.defaultData.department;

    if (this.defaultData.material_name.length > 0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          "key": "material_name",
          "name": "素材名称",
          "op": "like",
          "value": [this.defaultData.material_name]
        }
      );
    }
    if (this.defaultData.material_tags.length > 0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          "key": "material_tags",
          "name": "标签",
          "op": "json_contains_or",
          "value": this.defaultData.material_tags
        }
      );
    }


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

    this.localSt.store('video_report_defaultData_'+this.currentUser.user_id + '_' + this.userOperdInfo.select_uid + '_' + this.userOperdInfo.select_cid, this.defaultData);


    this.materialsManageService.getVideoReportListNew(postData, {
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

  reloadData(status?) {
    this.refreshData(status);
    this.refreshCount();
    this.refreshSum();
  }
  refreshCount(status?) {
    const isValid = this.checkBasicData();
    if (isValid) {
      return;
    }
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;

    const postData = deepCopy(this.queryParam);
    postData.sheets_setting.table_setting.summary_date = this.defaultData.summary_date;

    postData.publisher_id = this.defaultData.publisher_id;
    postData.cid = this.defaultData.cid;
    postData['department'] = this.defaultData.department;

    if (this.defaultData.material_name.length > 0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          "key": "material_name",
          "name": "素材名称",
          "op": "like",
          "value": [this.defaultData.material_name]
        }
      );
    }
    if (this.defaultData.material_tags.length > 0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          "key": "material_tags",
          "name": "标签",
          "op": "json_contains_or",
          "value": this.defaultData.material_tags
        }
      );
    }

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


    this.materialsManageService.getVideoReportListNew(postData, {
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
  refreshSum(status?) {
    const isValid = this.checkBasicData();
    if (isValid) {
      return;
    }
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;

    const postData = deepCopy(this.queryParam);
    postData.sheets_setting.table_setting.summary_date = this.defaultData.summary_date;

    postData.publisher_id = this.defaultData.publisher_id;
    postData.cid = this.defaultData.cid;
    postData['department'] = this.defaultData.department;

    if (this.defaultData.material_name.length > 0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          "key": "material_name",
          "name": "素材名称",
          "op": "like",
          "value": [this.defaultData.material_name]
        }
      );
    }
    if (this.defaultData.material_tags.length > 0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          "key": "material_tags",
          "name": "标签",
          "op": "json_contains_or",
          "value": this.defaultData.material_tags
        }
      );
    }

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


    this.materialsManageService.getVideoReportListNew(postData, {
      is_sum: 1
    })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.message.error(results.message);
          } else {
            this.sumData = results['data']['detail'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
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

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    if (this.viewChartShow) {
      this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 300 - 40;
    } else {
      this.tableHeight = document.body.clientHeight - 60 - 65 - 30 - 40;
    }
  }


  resetData() {
    this.defaultData = {
      publisher_id: [],
      cid: [],
      department: [],
      material_name: '',
      material_tags: [],
      summary_date: 'day:1:6',
      summary_date_compare: 'day:8:6',
      other_compare_date_list: [],
      summary_date_alias: '',
      summary_date_compare_alias: '',
      time_grain: 'summary',
    };
    this.selectList.advertiserList.forEach(item => {
      this.defaultData.cid.push(item.key);
    });
    this.selectList.mediaList.forEach(item => {
      this.defaultData.publisher_id.push(item.key);
    });
    this.reloadData();
  }
  getAuthorList() {
    this.materialsManageService
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
            // this.allFilterOption["director_id"]["filterOption"]=this.authorRole['1'];
            // this.allFilterOption["camerist_id"]["filterOption"]=this.authorRole['2'];
            // this.allFilterOption["movie_editor_id"]["filterOption"]=this.authorRole['3'];
            this.selectList.choreographerList = this.authorRole['1'];
            this.selectList.photographList = this.authorRole['2'];
            this.selectList.clipList = this.authorRole['3'];
            this.configList.forEach(item => {
              if (item.type === 'select' && item['label']) {
                item['optionList'] = this.selectList[item['label']];
              }
            });

          } else if (results.status_code && results.status_code === 205) {

          } else {
            this._message.error(results.message);
          }
        },
        (err: any) => {
          this._message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }


  materialsDetail(data, type) {
    this.visible = true;
    this.material_name = data['material_name'];
    this.detailData = deepCopy(data);
    this.materials_type = type;
  }

  close(event): void {
    this.visible = false;
    if (event) {
      this.refreshData();
    }
  }

  getTagsList() {
    this.materialsManageService.getLabelByLaunchType('video').subscribe(results => {
      if (results.status_code && results.status_code === 200) {
        results['data'].forEach(item => {
          this.selectList.tagsList.push({ key: item.tags_content, name: item.tags_content });
        });
      } else {
        this.selectList.tagsList = [];
      }
    });
  }

  checkBasicData() {
    let isValid = false;

    // 广告主
    if (this.defaultData.cid.length < 1) {
      isValid = true;
    } else {
    }
    // 媒体
    if (this.defaultData.publisher_id.length < 1) {
      isValid = true;
    } else {
    }

    return isValid;
  }

  changeSelected(type) {
    if (type === 'cid') {
      if (this.defaultData.cid.length === this.selectList.advertiserList.length) {
        this.allCidCheck = true;
      } else {
        this.allCidCheck = false;
      }
    }
    if (type === 'publisher_id') {
      if (this.defaultData.publisher_id.length === this.selectList.mediaList.length) {
        this.allPublisherCheck = true;
      } else {
        this.allPublisherCheck = false;
      }
    }
    if (type === 'department') {
      if (this.defaultData.department && this.defaultData.department.length === this.departmentList.length) {
        this.allDepartmentCheck = true;
      } else {
        this.allDepartmentCheck = false;
      }
      if (this.defaultData.department && this.defaultData.department.length > 0) {
        this.selectList.advertiserList = [];
        for (const index of this.defaultData.department) {
          if (this.advertisersObj[index]) {
            this.selectList.advertiserList = [...this.selectList.advertiserList, ...this.advertisersObj[index]];
          }
        }
      }
      if (this.selectList.advertiserList.length === 0) {
        this.selectList.advertiserList = this.materialsManageService.advertisers;
      }
      this.defaultData.cid = [];
      this.selectList.advertiserList.forEach(item => {
        this.defaultData.cid.push(item.key);
      });

    }
  }

  checkAllType(type) {
    if (type === 'cid') {
      this.allCidCheck = !this.allCidCheck;
      this.defaultData.cid = [];
      if (this.allCidCheck) {
        this.selectList.advertiserList.forEach(item => {
          this.defaultData.cid.push(item.key);
        });
      }
    }
    if (type === 'publisher_id') {
      this.allPublisherCheck = !this.allPublisherCheck;
      this.defaultData.publisher_id = [];
      if (this.allPublisherCheck) {
        this.selectList.mediaList.forEach(item => {
          this.defaultData.publisher_id.push(item.key);
        });
      }
    }
    if (type === 'department') {
      this.allDepartmentCheck = !this.allDepartmentCheck;
      this.defaultData.department = [];
      if (this.allDepartmentCheck) {
        this.defaultData.department = deepCopy(this.departmentList);
      }
    }

  }

  changeField() {
    const add_modal = this.modalService.create({
      nzTitle: '编辑列',
      nzWidth: 660,
      nzContent: TableFieldComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        reportType: 'material_report',
        summaryType: 'material_report',
        selectedItems: this.selected_items,
        isCompare: this.viewTableData['is_compare'],
        lockedItems: this.viewTableData['locked_items'],
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result.dataType && result.dataType === 'table') {
        this.queryParam.sheets_setting.table_setting['selected_items'] = result.data;
        this.selected_items = result.data;
        this.localSt.store('video_report_selected_items', result.data);

        this.reloadData();
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 0);

      }
    });

  }


}
