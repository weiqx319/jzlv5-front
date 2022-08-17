import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-copy-chart',
  templateUrl: './copy-chart.component.html',
  styleUrls: ['./copy-chart.component.scss']
})
export class CopyChartComponent implements OnInit {
  dashboardLists = [
    {id: '', dashboard_id: '', dashboard_name: '请选择概览页'},
  ];
  validateForm: FormGroup;
  setting = {
    chart_name: '',
    dashboard_id: '',
  };

  @Input()
  set dashBoard_list(list: any) {
    this.dashboardLists = this.dashboardLists.concat(list);
  }

  constructor(private fb: FormBuilder, private subject: NzModalRef) {}
  submitForm() {
    for (const key in this.validateForm.controls) {
      if (key) {
        this.validateForm.controls[ key ].markAsDirty();
      }
    }
    this.subject.destroy({
      dashboard_id: this.setting.dashboard_id,
      chart_name: this.setting.chart_name
    });
  }
  getFormControl(name) {
    return this.validateForm.controls[ name ];
  }

  cancelForm() {
    this.subject.destroy('onCancel');
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      chart_name: [ '', [ Validators.required ] ],
      dashboard_id: [ '', [ Validators.required ] ]
    });
  }

}
