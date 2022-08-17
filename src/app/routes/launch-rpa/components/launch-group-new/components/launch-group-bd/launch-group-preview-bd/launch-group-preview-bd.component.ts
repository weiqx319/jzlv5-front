import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {deepCopy} from "@jzl/jzl-util";
import {NzMessageService} from "ng-zorro-antd/message";
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {AuthService} from "../../../../../../../core/service/auth.service";

@Component({
  selector: 'app-launch-group-preview-bd',
  templateUrl: './launch-group-preview-bd.component.html',
  styleUrls: ['./launch-group-preview-bd.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class LaunchGroupPreviewBdComponent implements OnInit {
  @Output() cancel = new EventEmitter<any>();

  @Input() accountsMap;
  @Input() set resultData(value) {
    this.defaultData=value;
    this.previewData=value.template_struct.preview_data;
    if (value.project_template_id) {
      this.projectTemplateId=value.project_template_id;
    }
  }
  @Input() set ruleSettingData(value) {
    this.operationData.set_campaign_status=value.campaign_status;
    this.operationData.set_adgroup_status=value.adgroup_status;
  }

  constructor(
    private message: NzMessageService,
    public launchRpaService: LaunchRpaService,
    private modalService: NzModalService,
    private authService: AuthService,
  ) { }

  public objectKeys=Object.keys;
  public defaultData={};
  public previewData={};
  public projectTemplateId=null;
  public campainNum=0;
  public adgroupNum=0;
  public adgroupNumObj={};
  public allDataShow=true;
  public singleEditVisible=false;
  public editSourceData={};
  public editType='';
  public editData={
    campaign_name:'',
    adgroup_name:'',
    day_budget:'0',
    budget:'',
    bid:'',
    ocpc_bid_range:[null,null],
  };
  public weekMap={1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'日'};
  public materialsData=[];

  public isOperationVisible = false;
  public operationData = {
    project_template_id: "",
    set_campaign_status: false,
    set_adgroup_status: false
  };

  ngOnInit(): void {
    this.campainNum=0;
    this.adgroupNum=0;
    Object.keys(this.previewData).forEach(key=> {
      this.previewData[key]['isShow']=true;
      this.adgroupNumObj[key]=0;
      this.campainNum+=this.previewData[key].length;
      this.previewData[key].map(item=>this.adgroupNumObj[key]+=item['adgroup_struct'].length);
      this.adgroupNum+=this.adgroupNumObj[key];
    });
  }
  changeAllShow() {
    this.allDataShow=!this.allDataShow;
    Object.keys(this.previewData).forEach(key=> {
      this.previewData[key]['isShow']=this.allDataShow;
    });
  }
  deleteAdgroup(data,index) {
    data.splice(index,1);
  }
  openSignleEdit(sourceData,key,key1?) {
    this.editData[key]=sourceData[key];
    if (key1) {
      this.editData[key1]=sourceData[key1];
    }
    this.editType=key;
    this.editSourceData=sourceData;
    this.singleEditVisible=true;
  }
  handleCancel() {
    this.singleEditVisible=false;
  }
  handleOk() {
    this.editSourceData[this.editType]=this.editData[this.editType];
    if (this.editType==='day_budget') {
      this.editSourceData['budget']=this.editData.budget;
    }
    this.singleEditVisible=false;
  }
  doSave() {
    const resultData = deepCopy(this.defaultData);
    this.launchRpaService.updateProjectTemplate(this.projectTemplateId, resultData, {}).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          this.checkPreviewData();
        } else {
          this.message.error(results['message']);
        }
      },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );
  }
  checkPreviewData() {
    this.launchRpaService.checkPreviewBd({"project_template_id":this.projectTemplateId}).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          this.modalService.confirm({
            nzTitle: '提示',
            nzContent: '审核成功，是否立即运行',
            nzOnOk: () => {
              this.saveOperation();
            },
            nzOnCancel:()=> {
              this.cancel.emit({isRun:false});
            }
          });
        } else {
          this.message.error(results['message']);
        }
      },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );
  }
  saveOperation() {
    this.operationData.project_template_id=this.projectTemplateId;
    this.launchRpaService.runProjectTemplate(this.operationData, {cid: this.authService.getCurrentUserOperdInfo().select_cid}).subscribe(result => {
      if (result['status_code'] == 200) {
        this.message.info('开始运行');
      } else {
        this.message.error(result['message']);
      }
      this.cancel.emit({isRun:true});
    }, () => {
    }, () => {
    });
  }
  openMaterialShow(content,data) {
    this.materialsData=deepCopy(data['materials']);
    this.modalService.create({
      nzTitle: '素材预览',
      nzWidth: 600,
      nzContent: content,
      nzClosable: true,
      nzMaskClosable: true,
      nzFooter: null,
    });
  }


}
