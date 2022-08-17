import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NotifyService } from "../../../../module/notify/notify.service";
import { AuthService } from "../../../../core/service/auth.service";
import { isNumber } from "@jzl/jzl-util";
import { OptimizationService } from "../../service/optimization.service";
import { EditMessageComponent } from "../../../../module/edit-message/edit-message.component";

@Component({
  selector: 'app-edit-optimization-name',
  templateUrl: './edit-optimization-name.component.html',
  styleUrls: ['./edit-optimization-name.component.scss'],
  providers: [OptimizationService]
})
export class EditOptimizationNameComponent implements OnInit {

  public optimization_name = {
    edit_source: 'single',  //single：单个  batch:批量
    action: 1, //1:前缀  2：后缀  3：替换
    search: '',
    value: ''
  };

  public action = [
    { name: '添加前缀', value: 1 },
    { name: '添加后缀', value: 2 },
    { name: '查找替换', value: 3 },
  ];

  public iswraing = false;
  public idsArray = [];
  public saving = false;

  @Input() parentData: any;
  constructor(
    private modalService: NzModalService,
    private optimizationService: OptimizationService,
    private modalSubject: NzModalRef,
    private message: NzMessageService) { }

  ngOnInit() {

    if (this.parentData.selected_type === 'current') {
      this.parentData['selected_data'].forEach(item => {
        this.idsArray.push(item['optimization_id']);
      });
    }

    if (this.parentData['selected_data'].length === 1) {
      this.optimization_name.edit_source = 'single';
      this.optimization_name.value = this.parentData['selected_data'][0]['optimization_name'];
    } else if (this.parentData['selected_data'].length > 1) {
      this.optimization_name.edit_source = 'batch';
    }
  }
  check() {
    if (this.parentData.selected_data.length === 1) {
      if (!this.optimization_name.value) {
        this.iswraing = true;
      }
    } else {
      if (this.optimization_name.action === 3) {
        if (!this.optimization_name.search) {
          this.iswraing = true;
        }
      } else {
        if (!this.optimization_name.value) {
          this.iswraing = true;
        }
      }
    }

  }
  cancel() {
    this.modalSubject.destroy('onCancel');

  }
  sure() {
    this.check();
    if (!this.iswraing) {
      this.saving = true;

      const optimizationData = this.getOptimizationData(this.optimization_name, this.parentData.selected_type);
      optimizationData['name_setting'] = this.optimization_name;
      this.optimizationService.editOptimizationName(optimizationData).subscribe(
        (result) => {
          this.saving = false;
          if (result.status_code === 200) {
            if (result.data.repeat.length) {
              this.modalSubject.destroy({
                name: 'onOk_repeat',
                repeat: result.data.repeat
              });

            } else {
              this.message.success(result['message']);
              this.modalSubject.destroy({
                name: 'onOk'
              });

            }

          } else if (result['status_code'] && result.status_code === 401) {
            this.message.error(result['message']);
          } else if (result['status_code'] && result.status_code === 500) {
            this.message.error(result['message']);
          } else if (result['status_code'] && result.status_code === 205) {
          } else {
            this.message.error(result.message);
          }
        }, err => {
          this.saving = false;
        }, () => {
          this.saving = false;
        }
      );
    }

  }

  getOptimizationData(data, selectType) {
    const model = {
      "ranking_details": {}
    };


    model['source'] = 'optimizationGroup' + "Edit";
    if (this.parentData['edit_source'] === false) { //点击来源
      model['edit_source'] = false;
    } else {
      model['edit_source'] = true;
    }
    model['ranking_details']['select_type'] = selectType;
    if (selectType === 'current') {
      model['ranking_details']['details'] = this.idsArray;
    } else if (selectType === 'all') {
      model['detail_content'] = [];
      model['ranking_details']['sheets_setting'] = {
        'table_setting': this.parentData.allViewTableData
      };
    }
    model['ranking_details']['type'] = 'optimization_group';

    return model;
  }



}
