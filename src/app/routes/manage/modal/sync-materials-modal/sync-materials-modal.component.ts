import {Component, Input, OnInit} from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import {TableTimeComponent} from "../../../../module/table-time/components/table-time/table-time.component";
import {generateTimeTip} from "@jzl/jzl-util";

@Component({
  selector: 'app-sync-materials-modal',
  templateUrl: './sync-materials-modal.component.html',
  styleUrls: ['./sync-materials-modal.component.scss']
})
export class SyncMaterialsModalComponent implements OnInit {

  @Input() show_type;

  indeterminate = false;
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;

  public timeDesc = '';
  public syncChanPubIds = [];
  public apiData = [
    {
      url:'https://img2.baidu.com/it/u=2843995095,2791191813&fm=26&fmt=auto&gp=0.jpg',
      material_name:'35429854028232'
    },
    {
      url:'https://img2.baidu.com/it/u=2843995095,2791191813&fm=26&fmt=auto&gp=0.jpg',
      material_name:'111_a1d75514-2bf9-37ce-b27a-6cfb46f6d67bfgchghgh'
    }
  ];

  public configList=[
    {name:'广告主',key:'publisher_id',type:'select'},
    {name:'媒体',key:'media',type:'select',isMust:true},
    {name:'账户',key:'account_id',type:'select',isMust:true},
    {name:'素材来源',key:'material_source',type:'select'},
    {name:'素材名称',key:'material_name',type:'input'},
    {name:'素材ID',key:'material_id',type:'input'},
    {name:'起始时间',key:'date',type:'date'},
    {name:'添加标签',key:'tagList',type:'select'},
    {name:'标签',key:'tag',type:'input'},
  ];

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
  public currentPage = 1;
  public pageSize = 30;
  public loading = false;
  public total= 10;
  public noResultHeight = document.body.clientHeight - 300;

  constructor(
    private modalSubject:NzModalRef,
    private modalService: NzModalService,
  ) { }

  ngOnInit(): void {
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;
    this.loading = true;
  }

  _checkAll(value) {
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
  onSubmit() {

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
  doSearch() {

  }
  doCancel() {
    this.modalSubject.destroy('onCancel');
  }
  doSave() {
    this.modalSubject.destroy('onOk');
  }
}
