import {Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {deepCopy, formatDate, generateTimeTip} from '@jzl/jzl-util';
import {ActivatedRoute, Router} from "@angular/router";
import {subDays} from "date-fns";
import {GlobalTemplateComponent} from "../../../../../../shared/template/global-template/global-template.component";
import {PushMaterialsModalComponent} from '../../../../modal/push-materials-modal/push-materials-modal.component';
import {SyncMaterialsModalComponent} from '../../../../modal/sync-materials-modal/sync-materials-modal.component';
import {ManageService} from "../../../../service/manage.service";
import {CustomDatasService} from "../../../../../../shared/service/custom-datas.service";
import {UploadMaterialsModalComponent} from "../../../../modal/upload-materials-modal/upload-materials-modal.component";
import {TableTimeComponent} from "../../../../../../module/table-time/components/table-time/table-time.component";
import {MenuService} from "../../../../../../core/service/menu.service";
import {MaterialsManageService} from "../../../../service/materials-manage.service";
import {AuthService} from "../../../../../../core/service/auth.service";
import {User} from "../../../../../../core/entry";
@Component({
  selector: 'app-materials-manage-video',
  templateUrl: './materials-manage-video.component.html',
  styleUrls: ['./materials-manage-video.component.scss','../../materials-manage.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MaterialsManageVideoComponent implements OnInit {
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
    private authService: AuthService,
  ) {
    this.selectList.advertiserList=[...this.materialsManageService.advertisers];
    this.defaultData.cid=this.selectList.advertiserList[0]['key'];
    this.advertisersObj=this.materialsManageService.advertisersObj;
    this.departmentList=this.materialsManageService.departmentList;
    // this.selectList.mediaList = [...this.customDataService.publisherNewList];
    this.validateVideoForm = this.fb.group({
      publisher_id: ['', [Validators.required]],
      cid: ['', [Validators.required]],
      department:['', [Validators.required]],
      material_name: ['', [Validators.required]],
      material_tags: [[]],
      video_type: [[]],
      material_status:[''],
      director_id:[[]],
      grip_id:[[]],
      batch_filter:[''],
      camerist_id:[[]],
      movie_editor_id:[[]],
      material_make_time:[[]]
    });
  }
  public currentManagerUser: User;

  public _isAllShow=false;
  public showType='list';
  public timeDesc = '';
  public departmentList=[];
  public advertisersObj={};

  public configList=[
    {name:'素材名称',key:'material_name',type:'input'},
    {name:'标签',key:'material_tags',type:'select',mode:'tags',label: 'tagsList',optionList:[]},
    {name:'素材类型',key:'video_type',type:'select',optionList: [ {key:1,name:'横版'}, {key:2,name:'竖版'},]},
    {name:'确认状态',key:'material_status',type:'select',optionList: [ {key:0,name:'待审核'},{key:1,name:'通过'}, {key:-1,name:'未通过'},]},
    {name:'时间',key:'date',type:'date'},
  ];
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
    ]
  };
  public statusData={
    material_status:-1,
    confirm_suggest:''
  };

  public date=[];
  public defaultData={
    department:null,
    cid:25,
    publisher_id:7,
    material_name:'',
    material_tags:[],
    video_type:'',
    material_status:'',
    material_make_time: [],
    summary_date: 'day:1:6',
    summary_date_compare: 'day:8:6',
    other_compare_date_list: [],
    summary_date_alias: '',
    summary_date_compare_alias: '',
    time_grain: 'summary',
  };

  public authorRole = {
    '1': [],
    '2': [],
    '3': [],
  };
  public videoTypeConfigList= [{
      key: '1',
      name: '横版视频',
    }, {
      key: '2',
      name: '竖版视频',
    }
  ];

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
    movie_editor_id:{},
    material_make_time:{},
    use_count_num:{},
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


  ngOnInit(): void {
    const currentMangerUser = this.authService.getCurrentAdminOperdInfo();
    this.currentManagerUser = this.authService.getCurrentUser().user_list.find(item => {
      if (item.user_id === currentMangerUser.select_uid) {
        return true;
      }
    });
    this.generateTimeShow();
    this.getTagsList();
    this.getAuthorList();
    this.reloadData();
    // this.getAdvertiserList();
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
    if (this.defaultData.video_type!=='') {
      postData.sheets_setting.table_setting.single_condition.push(
      {key: "video_type", name: "素材类型", op: "=", value: this.defaultData.video_type}
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

    this.materialsManageService.getMaterialsVideoList(postData,{
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
    if (this.defaultData.video_type.length>0) {
      postData.sheets_setting.table_setting.single_condition.push(
        {key: "video_type", name: "素材类型", op: "=", value: this.defaultData.video_type}
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

  resetData() {
    this.defaultData = {
      cid:25,
      department: null,
      publisher_id:7,
      material_name:'',
      material_tags:[],
      video_type:'',
      material_status:'',
      material_make_time: [],
      summary_date: 'day:1:6',
      summary_date_compare: 'day:8:6',
      other_compare_date_list: [],
      summary_date_alias: '',
      summary_date_compare_alias: '',
      time_grain: 'summary',
    };
    this.reloadData();
  }

  deleteMaterials(id?) {
    if (id) {
      const body= {
        "publisher_id": 7,
        "cid":25
      };
      body['publisher_id']=this.defaultData.publisher_id;
      body['cid']=this.defaultData.cid;
      this.materialsManageService.deleteVideoMaterials(id, body).subscribe(result => {
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
        "publisher_id": 7,
        "cid":25
      };
      const selectData = this.getSelectedData();

      if(selectData.selected_data_ids.length<1) {
        this.message.error("请选择素材");
      }

      body.material_ids = [...selectData.selected_data_ids];
      body['publisher_id']=this.defaultData.publisher_id;
      body['cid']=this.defaultData.cid;


      this.materialsManageService.deleteVideoMaterialsBatch(body,).subscribe(result => {

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
        if (this.defaultData.video_type.length>0) {
          postData.sheets_setting.table_setting.single_condition.push(
            {key: "video_type", name: "素材类型", op: "=", value: this.defaultData.video_type}
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
    postData['department']=this.defaultData.department;


    this.materialsManageService.modifyLabel('video',postData).subscribe(result=> {
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
          show_type:'video'
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
        show_type:'video',
        authorRole:this.authorRole
      }
    });
    add_modal.afterClose.subscribe(addResult => {
      if (addResult === 'onOk') {
        this.refreshData();
      }
    });
  }
  selectChange(event,type) {

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

  getAuthorList() {
    this.materialsManageService
      .getMaterialsAuthorList({}, {
        page: 1,
        count: 10000000,
        cid: this.authService.getCurrentUserOperdInfo().select_cid,
        publisher_id:this.menuService.currentPublisherId,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            const list = results['data']['detail'];
            list.forEach( item => {
              this.authorRole[item.material_author_role].push({
                key: item.material_author_id,
                name: item.material_author_name,
              });
            });

            this.selectList.choreographerList = this.authorRole['1'];
            this.selectList.photographList = this.authorRole['2'];
            this.selectList.clipList = this.authorRole['3'];
            this.configList.forEach(item=> {
              if (item.type==='select' && item['label']) {
                item['optionList']=this.selectList[item['label']];
              }
            });
          } else if (results.status_code && results.status_code === 205) {

          } else {
            this.message.error(results.message);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }
  getTagsList() {
    this.materialsManageService.getLabelByLaunchType('video').subscribe(results=> {
      if (results.status_code && results.status_code === 200) {
        results['data'].forEach(item=> {
          this.selectList.tagsList.push({key:item.tags_content,name:item.tags_content});
        });
      } else {
        this.selectList.tagsList = [];
      }
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
