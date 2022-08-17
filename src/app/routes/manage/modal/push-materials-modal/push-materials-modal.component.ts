import {Component, Input, OnInit} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {MaterialsManageService} from "../../service/materials-manage.service";
import {formatDate} from "@jzl/jzl-util";

@Component({
  selector: 'app-push-materials-modal',
  templateUrl: './push-materials-modal.component.html',
  styleUrls: ['./push-materials-modal.component.scss']
})
export class PushMaterialsModalComponent implements OnInit {

  @Input() defaultData;
  @Input() materialsData;
  @Input() select_type;
  @Input() advertiserList;
  @Input() show_type;

  public allCheck=false;
  public queryParams={
    publisher_id: 7,
    cid: 25,
    cids: []
  };

  constructor(
    private modalSubject:NzModalRef,
    private message: NzMessageService,
    public materialsManageService:MaterialsManageService,
  ) { }

  ngOnInit(): void {
  }
  doCancel() {
    this.modalSubject.destroy('onCancel');
  }
  doSave() {
    if (this.queryParams.cids.length<1) {
      this.message.info('请选择广告主');
      return;
    }
    const sheets_setting= {
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
    if (this.defaultData.material_name.length>0) {
      sheets_setting.table_setting.single_condition.push(
        {
          "key":"material_name",
          "name":"素材名称",
          "op":"like",
          "value":[this.defaultData.material_name]
        }
      );
    }
    if (this.defaultData.material_tags.length>0) {
      sheets_setting.table_setting.single_condition.push(
        {
          "key":"material_tags",
          "name":"标签",
          "op":"json_contains_or",
          "value":this.defaultData.material_tags
        }
      );
    }
    if (this.defaultData.video_type&&this.defaultData.video_type!=='') {
      sheets_setting.table_setting.single_condition.push(
        {key: "video_type", name: "素材类型", op: "=", value: this.defaultData.video_type}
      );
    }
    if (this.defaultData.material_status!=='') {
      sheets_setting.table_setting.single_condition.push(
        {key: "material_status", name: "状态", op: "=", value: this.defaultData.material_status}
      );
    }
    if (this.defaultData.material_make_time.length>0) {
      sheets_setting.table_setting.single_condition.push(
        {key: "material_make_time", name: "素材制作时间", op: "between", value: formatDate(new Date(this.defaultData.material_make_time[0]), 'yyyy/MM/dd') + '-' + formatDate(new Date(this.defaultData.material_make_time[1]), 'yyyy/MM/dd')}
      );
    }
    // this.queryParams['select_type']=this.select_type;
    if (this.select_type==='all') {
      this.queryParams['select_type']='all';
      this.queryParams['sheets_setting']=sheets_setting;
    } else {
      this.queryParams['material_ids']=[];
      this.materialsData.forEach(item=> {
        if (item.checked) {
          this.queryParams['material_ids'].push(item.material_id);
        }
      });
    }
    this.queryParams.publisher_id=this.defaultData.publisher_id;
    this.queryParams.cid=this.defaultData.cid;
    this.queryParams['department']=this.defaultData.department;

    this.materialsManageService.batchPush(this.show_type,this.queryParams).subscribe(result=> {
      if (result.status_code !== 200) {
        this.message.error(result.message);
      } else {
        this.message.success('推送成功');
        this.modalSubject.destroy('onOk');
      }
    });

  }

  changeSelected() {
    if (this.queryParams.cids.length===this.advertiserList.length) {
      this.allCheck=true;
    } else {
      this.allCheck=false;
    }
  }

  checkAllType() {
      this.allCheck=!this.allCheck;
      this.queryParams.cids=[];
      if (this.allCheck) {
        this.advertiserList.forEach(item=> {
          this.queryParams.cids.push(item.key);
        });
      }
  }

}
