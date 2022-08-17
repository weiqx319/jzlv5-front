import {Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {deepCopy, formatDate, generateTimeTip} from '@jzl/jzl-util';
import {ActivatedRoute, Router} from "@angular/router";
import {subDays} from "date-fns";
import {GlobalTemplateComponent} from "../../../../../../shared/template/global-template/global-template.component";
import {PushMaterialsModalComponent} from "../../../../modal/push-materials-modal/push-materials-modal.component";
import {SyncMaterialsModalComponent} from "../../../../modal/sync-materials-modal/sync-materials-modal.component";
import {UploadMaterialsModalComponent} from "../../../../modal/upload-materials-modal/upload-materials-modal.component";
import {ManageService} from "../../../../service/manage.service";
import {CustomDatasService} from "../../../../../../shared/service/custom-datas.service";
import {TableTimeComponent} from "../../../../../../module/table-time/components/table-time/table-time.component";
import {MenuService} from "../../../../../../core/service/menu.service";
import {MaterialsManageService} from "../../../../service/materials-manage.service";
import {User} from "../../../../../../core/entry";
import {AuthService} from "../../../../../../core/service/auth.service";

@Component({
  selector: 'app-materials-manage-image',
  templateUrl: './materials-manage-image.component.html',
  styleUrls: ['./materials-manage-image.component.scss','../../materials-manage.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MaterialsManageImageComponent implements OnInit {
  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;
  validateVideoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private modalService: NzModalService,
    public materialsManageService:MaterialsManageService,
    private authService: AuthService,
  ) {
    this.selectList.advertiserList=[...this.materialsManageService.advertisers];
    this.defaultData.cid=this.materialsManageService.advertisers[0].key;
    this.advertisersObj=this.materialsManageService.advertisersObj;
    this.departmentList=this.materialsManageService.departmentList;
    // this.selectList.mediaList = [...this.customDataService.publisherNewList];
    this.validateVideoForm = this.fb.group({
      publisher_id: ['', [Validators.required]],
      cid: ['', [Validators.required]],
      department:['', [Validators.required]],
      material_name: ['', [Validators.required]],
      file_name: [''],
      material_tags: [''],
      image_type: [''],
      material_source:[''],
      material_status:[''],
      date:[[]],
      time_rule:[{}],
      designer_id:[[]],
      batch_filter:[[]],
      material_make_time:[[]]
    });
  }
  public currentManagerUser: User;

  public departmentList=[];
  public advertisersObj={};

  public _isAllShow=false;
  public showType='list';
  public timeDesc = '';
  public advertiserList = [];
  public mediaList=[];
  public selectList={
    advertiserList:[],
    choreographerList : [],
    photographList : [],
    clipList : [],
    tagsList:[],
    mediaList:[
      {key:7,name:'头条'},
      {key:6,name:'广点通'},
      {key:17,name:'超级汇川'},
      {key:16,name:'快手'},
      {key:1,name:'百度信息流'},
      {key:3,name:'360sem'},
    ]
  };
  public configList=[
    {name:'素材名称',key:'material_name',type:'input'},
    {name:'标签',key:'material_tags',type:'select',label: 'tagsList',optionList:[]},
    {name:'确认状态',key:'material_status',type:'select',optionList: [ {key:0,name:'待审核'},{key:1,name:'通过'}, {key:-1,name:'未通过'},]},
    {name:'时间',key:'date',type:'date'},
  ];

  public date=[];
  public defaultData={
    publisher_id:7,
    department:null,
    cid:25,
    material_name:'',
    material_tags:'',
    image_type:'',
    material_status:'',
    material_make_time: [],
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
    material_make_time:{},
    image_type:{}
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
    cid:25,
    publisher_id:7,
    sheets_setting: {
      table_setting: {
        single_condition: [],
        sort_item: {
          key: "create_time",
          dir: "desc"
        },
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
  public statusData={
    material_status:-1,
    confirm_suggest:''
  };



  ngOnInit(): void {
    const currentMangerUser = this.authService.getCurrentAdminOperdInfo();
    this.currentManagerUser = this.authService.getCurrentUser().user_list.find(item => {
      if (item.user_id === currentMangerUser.select_uid) {
        return true;
      }
    });
    this.generateTimeShow();
    this.getTagsList();
    this.reloadData();
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
    postData.sheets_setting.table_setting.summary_date=this.defaultData.summary_date;

    postData.publisher_id=this.defaultData.publisher_id;
    postData.cid=this.defaultData.cid;
    postData['department']=this.defaultData.department;

    if (this.defaultData.material_name.length>0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          "key":"material_name",
          "name":"素材名称",
          "op":"like",
          "value":[this.defaultData.material_name]
        }
      );
    }
    if (this.defaultData.material_tags.length>0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          "key":"material_tags",
          "name":"标签",
          "op":"json_contains_or",
          "value":this.defaultData.material_tags
        }
      );
    }
    if (this.defaultData.image_type!=='') {
      postData.sheets_setting.table_setting.single_condition.push(
        {key: "video_type", name: "素材类型", op: "=", value: this.defaultData.image_type}
      );
    }
    if (this.defaultData.material_status!=='') {
      postData.sheets_setting.table_setting.single_condition.push(
        {key: "material_status", name: "状态", op: "=", value: this.defaultData.material_status}
      );
    }
    if (this.defaultData.material_make_time.length>0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {key: "material_make_time", name: "素材制作时间", op: "between", value: formatDate(new Date(this.defaultData.material_make_time[0]), 'yyyy/MM/dd') + '-' + formatDate(new Date(this.defaultData.material_make_time[1]), 'yyyy/MM/dd')}
      );
    }

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


    this.materialsManageService.getMaterialsImageList(postData, {
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
    postData.sheets_setting.table_setting.summary_date=this.defaultData.summary_date;

    postData.publisher_id=this.defaultData.publisher_id;
    postData.cid=this.defaultData.cid;
    postData['department']=this.defaultData.department;

    if (this.defaultData.material_name.length>0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          "key":"material_name",
          "name":"素材名称",
          "op":"like",
          "value":[this.defaultData.material_name]
        }
      );
    }
    if (this.defaultData.material_tags.length>0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {
          "key":"material_tags",
          "name":"标签",
          "op":"json_contains_or",
          "value":this.defaultData.material_tags
        }
      );
    }
    if (this.defaultData.image_type!=='') {
      postData.sheets_setting.table_setting.single_condition.push(
        {key: "video_type", name: "素材类型", op: "=", value: this.defaultData.image_type}
      );
    }
    if (this.defaultData.material_status!=='') {
      postData.sheets_setting.table_setting.single_condition.push(
        {key: "material_status", name: "状态", op: "=", value: this.defaultData.material_status}
      );
    }
    if (this.defaultData.material_make_time.length>0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {key: "material_make_time", name: "素材制作时间", op: "between", value: formatDate(new Date(this.defaultData.material_make_time[0]), 'yyyy/MM/dd') + '-' + formatDate(new Date(this.defaultData.material_make_time[1]), 'yyyy/MM/dd')}
      );
    }
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

    this.materialsManageService.getMaterialsImageList(postData, {
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

  resetData() {
    this. defaultData= {
      publisher_id:7,
      department: null,
      cid:25,
      material_name:'',
      material_tags:'',
      image_type:'',
      material_status:'',
      summary_date: 'day:1:6',
      summary_date_compare: 'day:8:6',
      other_compare_date_list: [],
      summary_date_alias: '',
      summary_date_compare_alias: '',
      time_grain: 'summary',
      material_make_time: [],
    };
    this.reloadData();
  }
  refreshChecked() {
    this._indeterminate = false;
    this._allChecked = false;
    this.apiData.forEach(data=> {
      data['checked']=false;
    });
  }

  deleteMaterials(id?) {
    if (id) {
      this.materialsManageService.deleteImageMaterials(id, {cid:this.defaultData.cid,publisher_id:this.defaultData.publisher_id}).subscribe(result => {
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
        "publisher_id":7,
        "cid":25
      };
      const selectData = this.getSelectedData();

      if(selectData.selected_data_ids.length<1) {
        this.message.error("请选择素材");
      }

      body.material_ids = [...selectData.selected_data_ids];
      body['publisher_id']=this.defaultData.publisher_id;
      body['cid']=this.defaultData.cid;


      this.materialsManageService.deleteImageMaterialsBatch(body).subscribe(result => {

        if (result.status_code !== 200) {
          this.message.error(result.message);
        } else {
          this.message.success('删除成功');
          this.reloadData();
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
  close(event): void {
    this.visible = false;
    if (event) {
      this.refreshData();
    }
  }
  showModal(): void {
    this.isVisible = true;
  }

  handleOk(status?,id?): void {
    const postData=deepCopy(this.statusData);
    if (status) {
      postData.material_status=status;
      postData['material_ids']=[id];
    } else {
      if (postData.material_status<0 && postData.confirm_suggest.length<1) {
        this.message.error('请填写审核建议');
        return;
      }
      if (this.currentSelectedPage==='all') {
        postData['select_type']='all';
        postData['sheets_setting']= {
          table_setting: {
            single_condition: [],
            sort_item: {
              key: "create_time",
              dir: "desc"
            },
            data_range: [],
            summary_date: 'day:1:6',
          }
        };
        postData.sheets_setting.table_setting.summary_date=this.defaultData.summary_date;

        if (this.defaultData.material_name.length>0) {
          postData.sheets_setting.table_setting.single_condition.push(
            {
              "key":"material_name",
              "name":"素材名称",
              "op":"like",
              "value":[this.defaultData.material_name]
            }
          );
        }
        if (this.defaultData.material_tags.length>0) {
          postData.sheets_setting.table_setting.single_condition.push(
            {
              "key":"material_tags",
              "name":"标签",
              "op":"json_contains_or",
              "value":this.defaultData.material_tags
            }
          );
        }
        if (this.defaultData.material_status!=='') {
          postData.sheets_setting.table_setting.single_condition.push(
            {key: "material_status", name: "状态", op: "=", value: this.defaultData.material_status}
          );
        }
      } else {
        const selectData = this.getSelectedData();
        postData['material_ids'] = [...selectData.selected_data_ids];
      }
    }



    postData['publisher_id']=this.defaultData.publisher_id;
    postData['cid']=this.defaultData.cid;

    this.materialsManageService.modifyLabel('image',postData).subscribe(result=> {
      if (result.status_code !== 200) {
        this.message.error(result.message);
      } else {
        this.message.success('更改成功');
        this.refreshData();
      }
    });
    this.isVisible = false;
  }

  handleCancel(): void {
    this.statusData= {
      material_status:-1,
      confirm_suggest:''
    };
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
    this.indeterminate = false;
    this.currentSelectedPage = 'current';
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
          materialsData:pushData,
          defaultData:this.defaultData,
          select_type:this.currentSelectedPage,
          advertiserList:this.selectList.advertiserList,
          show_type:'image'
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
          show_type:'image',
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
        show_type:'image',
        advertiserList:this.advertiserList,
      }
    });
    add_modal.afterClose.subscribe(addResult => {
      if (addResult === 'onOk') {
        this.refreshData();
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

  getTagsList() {
    this.materialsManageService.getLabelByLaunchType('image').subscribe(results=> {
      if (results.status_code && results.status_code === 200) {
        results['data'].forEach(item=> {
          this.selectList.tagsList.push({key:item.tags_content,name:item.tags_content});
        });
      } else {
        this.selectList.tagsList = [];
      }
      this.configList.forEach(item=> {
        if (item.type==='select' && item['label']) {
          item['optionList']=this.selectList[item['label']];
        }
      });
    });
  }

  changeSelected(type) {
    if (type==='department') {
      if (this.defaultData.department) {
        this.selectList.advertiserList = [...this.advertisersObj[this.defaultData.department]];
      } else {
        this.selectList.advertiserList = this.materialsManageService.advertisers;
      }
      this.defaultData.cid = this.selectList.advertiserList[0].key;
    }
  }


}
