import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {DashboardService} from "../../service/dashboard.service";

@Component({
  selector: 'app-new-dashboard-tab',
  templateUrl: './new-dashboard-tab.component.html',
  styleUrls: ['./new-dashboard-tab.component.scss']
})

export class NewDashboardTabComponent implements OnInit {
  validateForm: FormGroup;
  _name: string;
  dashboardId = 0;
  @Input()
  set name(value: string) {
    this._name = value;
  }
  @Input()
  set id(value: 0) {
    this.dashboardId = value;
  }

  @Input() operType = 'save';
  @Input() isDefault = false;



  public submitting = false;
  constructor(private fb: FormBuilder,
              private _message: NzMessageService,
              private dashboardService: DashboardService,
              private subject: NzModalRef) {}
  submitForm() {
    for (const key in this.validateForm.controls) {
      if (key) {
        this.validateForm.controls[ key ].markAsDirty();
      }
    }
    const postResult = {dashboard_name: this._name};
    if (this.validateForm.valid && !this.submitting) {
      this.submitting = true;
      if (this.dashboardId && this.operType === 'copy') {
        postResult['dashboard_id'] = this.dashboardId;
        let postApi = 'copyDashboard';
        if (this.isDefault) {
          postApi  = 'copyDashboardTpl';
        }
        this.dashboardService[postApi](postResult).subscribe(
          response => {
            if (response.status_code === 200) {
              this._message.success('复制概览页成功');
              this.subject.destroy({
                status: 'Ok',
                result: {oper: 'copy', data: {dashboard_id: response.data.dashboard_id, dashboard_name: this._name, is_default: 0}}
              });
            } else {
              this.subject.destroy('onCancel');
              this._message.error('复制概览页失败,请重试');
            }
          },
          (err) => {
            this._message.error('复制概览页失败，请重试');
          }
        );
      } else if (this.dashboardId ) {
        postResult['dashboard_id'] = this.dashboardId;
        this.dashboardService.update(postResult)
          .subscribe(
            response => {
              if (response.status_code === 200) {
                this._message.success('编辑概览页成功');
                this.subject.destroy({
                  status: 'Ok',
                  result: {oper: 'edit', data: {dashboard_id: this.dashboardId, dashboard_name: this._name, is_default: 0}}
                });

              } else {
                this._message.error('编辑概览页失败,请重试');
              }
            },
            (err) => {
              this._message.error('编辑概览页失败，请重试');
            }
          );
      } else {
        postResult['components'] = [];
        this.dashboardService.create(postResult).subscribe(
          response => {
            if (response.status_code === 200) {
              this._message.success('新建概览页成功');
              this.subject.destroy({
                status: 'Ok',
                result: {oper: 'save', data: {dashboard_id: response.data.dashboard_id, dashboard_name: this._name, is_default: 0}}
              });
            } else {
              this._message.error('新建概览页失败');
            }
          },
          (err) => {
            this._message.error('编辑概览页失败，请重试');
          }
        );
      }
    }

  }
  getFormControl(name) {
    return this.validateForm.controls[ name ];
  }

  cancelForm() {
    this.subject.destroy('onCancel');
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      dashboard_name: [ '', [ Validators.required ] ]
    });
  }
}




