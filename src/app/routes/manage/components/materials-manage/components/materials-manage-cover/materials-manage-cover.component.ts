import {Component, OnInit, ViewChild} from '@angular/core';
import {GlobalTemplateComponent} from "../../../../../../shared/template/global-template/global-template.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {deepCopy, formatDate, generateTimeTip} from "@jzl/jzl-util";
import {subDays} from "date-fns";
import {PushMaterialsModalComponent} from "../../../../modal/push-materials-modal/push-materials-modal.component";
import {SyncMaterialsModalComponent} from "../../../../modal/sync-materials-modal/sync-materials-modal.component";
import {UploadMaterialsModalComponent} from "../../../../modal/upload-materials-modal/upload-materials-modal.component";
import {ManageService} from "../../../../service/manage.service";
import {CustomDatasService} from "../../../../../../shared/service/custom-datas.service";
import {TableTimeComponent} from "../../../../../../module/table-time/components/table-time/table-time.component";
import {MenuService} from "../../../../../../core/service/menu.service";
import {MaterialsManageService} from "../../../../service/materials-manage.service";

@Component({
  selector: 'app-materials-manage-cover',
  templateUrl: './materials-manage-cover.component.html',
  styleUrls: ['./materials-manage-cover.component.scss','../../materials-manage.component.scss']
})
export class MaterialsManageCoverComponent implements OnInit {
  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;
  validateVideoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private modalService: NzModalService,
    private manageService: ManageService,
    private customDataService: CustomDatasService,
    private menuService:MenuService,
    public materialsManageService:MaterialsManageService,
  ) {
    this.validateVideoForm = this.fb.group({
      publisher_id: ['', [Validators.required]],
      media: ['', [Validators.required]],
      material_name: ['', [Validators.required]],
      file_name: [''],
      tag: [''],
      status:[''],
      date:[[]],
      time_rule:[{}],
      designer_id:[[]],
    });
  }

  public _isAllShow=false;
  public showType='list';
  public timeDesc = '';
  public advertiserList = [];
  public mediaList=[
    {key:1,name:'巨量引擎'},
    {key:2,name:'腾讯广告'},
    {key:3,name:'超级汇川'},
  ];

  public configList=[
    {name:'广告主',key:'publisher_id',type:'select'},
    {name:'媒体',key:'media',type:'select'},
    {name:'素材名称',key:'material_name',type:'input'},
    {name:'文件名称',key:'file_name',type:'input'},
    {name:'标签',key:'tag',type:'select'},
    {name:'确认状态',key:'status',type:'select'},
    {name:'设计师',key:'designer_id',type:'select'},
    {name:'时间',key:'date',type:'date'},
  ];

  public date=[];
  public defaultData={
    publisher_id:'',
    media:'',
    material_name:'',
    file_name:'',
    tag:'',
    material_type:'',
    material_source:'',
    status:'',
    date:[],
    start_time:'',
    end_time:'',
    summary_date: 'day:1:6',
    summary_date_compare: 'day:8:6',
    other_compare_date_list: [],
    summary_date_alias: '',
    summary_date_compare_alias: '',
    time_grain: 'summary',
  };
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
    video_type:{},
    director_id:{},
    camerist_id:{},
    movie_editor_id:{}
  };

  indeterminate = false;
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;

  visible=false;
  isVisible=false;

  public syncChanPubIds = [];
  public apiData = [];
  public detailData={};
  public material_name='';
  public materials_type='';

  public isPushVisible=false;

  public accountsList = [];
  public currentPage = 1;
  public pageSize = 30;
  public loading = false;
  public total= 10;
  public noResultHeight = document.body.clientHeight - 300;

  public sortDataKey = 'create_time';
  public sortDataDirection = 'desc';
  public currentSelectedPage = 'current';
  public tagsList = [];

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

  ngOnInit(): void {
    this.refreshData();
  }

  reloadData(status?) {
    this.refreshData(status);
    this.refreshCount();
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
      if(item.value) {
        postData.sheets_setting.table_setting.single_condition.push(item);
      }
    });


    this.materialsManageService.getMaterialsCoverImageList(this.menuService.currentPublisherId,postData, {
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
  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;
    this.loading = true;

    const postData = deepCopy(this.queryParam);
    postData.sheets_setting.table_setting.sort_item = {key:this.sortDataKey,dir:this.sortDataDirection};


    // Object.values(this.filterResult).forEach((item) => {
    //   if (item.hasOwnProperty('key')) {
    //     postData.sheets_setting.table_setting.single_condition.push(item);
    //   }
    // });


    Object.values(this.queryItem).forEach((item) => {
      if(item.value) {
        postData.sheets_setting.table_setting.single_condition.push(item);
      }
    });


    this.materialsManageService.getMaterialsVideoList(postData, {
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
  refreshChecked() {
    this._indeterminate = false;
    this._allChecked = false;
    this.apiData.forEach(data=> {
      data['checked']=false;
    });
  }
  getMaterialsList() {

  }
  deleteMaterials(id?) {
    if (id) {
      this.materialsManageService.deleteCoverImageMaterials(id, {}).subscribe(result => {
        if (result.status_code && result.status_code === 200) {
          this.message.success('删除成功');
          this.reloadData();
        } else {
          this.message.error(result.message);
        }
      }, (err: any) => {
        this.message.error('系统异常，请重试');
      });
    } else {
      const body = {
        "select_type":"current",
        "material_ids": [],
        "publisher_id": this.menuService.currentPublisherId
      };
      const selectData = this.getSelectedData();

      if(selectData.selected_data_ids.length<1) {
        this.message.error("请选择素材");
      }

      body.material_ids = [...selectData.selected_data_ids];


      this.materialsManageService.deleteCoverImageMaterialsBatch(body).subscribe(result => {

        if (result.status_code !== 200) {
          this.message.error(result.message);
        } else {
          this.reloadData();
          this.message.success('删除成功');
        }
      });
    }
  }

  isAllShow() {
    this._isAllShow=!this._isAllShow;
  }

  materialsDetail(data,type) {
    this.visible = true;
    this.material_name=data['material_name'];
    this.detailData=deepCopy(data);
    this.materials_type=type;
  }
  close(): void {
    this.visible = false;
  }
  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
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

  _checkAllPage(value) {
    this.currentSelectedPage = 'all';
    if (value) {
      this._allChecked=true;
      this.apiData.forEach((data) => {
        data['checked'] = true;
      });
      this._indeterminate = true;
    } else {
      this._allChecked=false;
      this._indeterminate = false;
      this.apiData.forEach((data) => (data['checked'] = false));
    }
  }
  _checkAll(value) {

    this.currentSelectedPage = 'current';
    this.indeterminate = false;
    if (value) {
      this._allChecked=true;
      this.apiData.forEach((data) => {
        data['checked'] = true;
      });
      this._indeterminate = true;
    } else {
      this._allChecked=false;
      this._indeterminate = false;
      this.apiData.forEach((data) => (data['checked'] = false));
    }
  }
  _refreshSingleChangeStatus(event?,data?) {
    if (data) {
      data['checked']=event;
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

  handleOpen(type): void {
    if (type==='push') {
      const pushData=[];
      this.apiData.forEach(item=> {
        if (item['checked']) {
          pushData.push(item);
        }
      });
      const add_modal = this.modalService.create({
        nzTitle: '素材推送',
        nzWidth: 500,
        nzContent: PushMaterialsModalComponent,
        nzClosable: false,
        nzMaskClosable: false,
        nzWrapClassName: 'materials-manage-modal',
        nzFooter: null,
        nzComponentParams: {
          defaultData:pushData,
        }
      });
      add_modal.afterClose.subscribe(addResult => {
        if (addResult === 'onOk') {
        }
      });
    } else if (type==='sync') {
      const add_modal = this.modalService.create({
        nzTitle: '同步素材',
        nzWidth: 860,
        nzContent: SyncMaterialsModalComponent,
        nzClosable: false,
        nzMaskClosable: false,
        nzWrapClassName: 'materials-manage-modal',
        nzFooter: null,
        nzComponentParams: {
          show_type:'video',
        }
      });
      add_modal.afterClose.subscribe(addResult => {
        if (addResult === 'onOk') {
        }
      });
    }

  }

  onSubmit() {

  }

  addMaterials() {
    const add_modal = this.modalService.create({
      nzTitle: '素材上传',
      nzWidth: 800,
      nzContent: UploadMaterialsModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'materials-manage-modal',
      nzFooter: null,
      nzComponentParams: {
        show_type:'cover',
        advertiserList:this.advertiserList,
      }
    });
    add_modal.afterClose.subscribe(addResult => {
      if (addResult === 'onOk') {
      }
    });
  }
  changeDate() {
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
        defined_is_disable:false
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result.dataType && result.dataType === 'time') {
        this.defaultData = Object.assign(this.defaultData, result['data']);
        this.generateTimeShow();
      }
    });

  }
  generateTimeShow() {
    this.timeDesc = generateTimeTip(this.defaultData['summary_date'],this.defaultData['summary_date_compare'],this.defaultData['is_compare']);
  }

  getSelectedData() {
    const tempData = [];
    this.apiData.forEach(item=> {
      if(item.checked) {
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

    if(tempPostData.selected_type == 'all') {
      const postData = deepCopy(this.queryParam);
      postData.sheets_setting.table_setting.sort_item = {key:this.sortDataKey,dir:this.sortDataDirection};

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
}
