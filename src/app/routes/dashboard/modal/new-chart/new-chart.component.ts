import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { MenuService } from '../../../../core/service/menu.service';
import {ChartStructureService} from "../../service/chart-structure.service";
import {DashboardService} from "../../service/dashboard.service";

@Component({
  selector: 'app-new-chart',
  templateUrl: './new-chart.component.html',
  styleUrls: ['./new-chart.component.scss'],
  providers: [],
})
export class NewChartComponent implements OnInit {
  validateTitleForm: FormGroup;
  current = 0;
  public chart_type: any;
  public chart_name = {
    name: '',
  };
  public chart_setting: any;
  public chart_id: number;
  @Input() set setting(data: any) {
    this.chart_setting = data;
  }
  @Input() bizInfo = {typeName: "", data: []};

  constructor(private _message: NzMessageService,
              private subject: NzModalRef,
              private fb: FormBuilder,
              private init_structure: ChartStructureService,
              public menuService: MenuService) {

  }

  typeChange(type = 'line') {
    this.chart_type = type;
  }

  changeContent() {
    switch (this.current) {
      case 0: {

        break;
      }
      case 1: {
        if (this.chart_setting.chart_type === this.chart_type) {

        } else {
          this.chart_setting = this.init_structure.getChartStructure(this.chart_type);
          this.chart_setting.chart_id = this.chart_id;
        }
        this.chart_setting.chart_name = this.chart_name ? this.chart_name : '';
        break;
      }
      case 2: {
        break;
      }
      default: {
        this._message.error('something wrong');
      }
    }
  }

  pre() {
    this.current -= 1;
    this.changeContent();
  }

  next() {
    this.current += 1;
    this.changeContent();
  }

  done() {
    this.chart_setting.is_default = 0;
    this.subject.destroy(this.chart_setting);

  }

  cancelModal(e?) {
    this.subject.destroy('onCancel');
  }

  ngOnInit() {
    this.chart_type = this.chart_setting.chart_type;
    this.chart_name = this.chart_setting.chart_name;
    if (this.chart_setting.chart_id) {
      this.chart_id = this.chart_setting.chart_id;
    } else {
      this.chart_id = 0;
      this.chart_setting = this.init_structure.getChartStructure(this.chart_type);
      this.chart_setting.chart_name = this.chart_name ? this.chart_name : '';
      this.chart_setting.chart_id = this.chart_id;
    }
    this.validateTitleForm = this.fb.group({
      chart_name: ['', [Validators.required]],
    });
  }

  getTitleFormControl(name) {
    return this.validateTitleForm.controls[ name ];
  }

}
