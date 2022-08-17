import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit,
  Output,
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { MenuService } from '../../../../core/service/menu.service';
import {ChartItemNewService} from "../../service/chart-item-new.service";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-chart-setting',
  templateUrl: './chart-setting.component.html',
  styleUrls: ['./chart-setting.component.scss'],
  providers: [ChartItemNewService],
})
export class ChartSettingComponent implements OnInit {
  validateForm: FormGroup;
  yAxisArray = [];
  xAxisArray = [];
  chart_detail_setting: any;
  xAxis_key: any;
  y_count: any;
  x_count: any;
  @Input() setting: any;
  @Input() bizInfo = {typeName: "", data: []};

  @Output() cancelModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() preClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() nextClick: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private chartItemNew: ChartItemNewService, public menuService: MenuService) {

  }
  dealAxisArray(type) {
    if (this.setting.chart_type === 'bar') {
      const item_detail_type = this.chart_detail_setting.summary_items.chart_item_details[this.setting.summary_type][type + '_type'];
      const item_detail = this.chart_detail_setting.summary_items[type][item_detail_type];
      const item_detail_obj = {};
      const detail_arr = [];
      item_detail.forEach(item => {
        item.is_selected = false;
        if (item.key) {
          item_detail_obj[item.key] = true;
        }
      });
      this[type + 'Array'].forEach(item => {
        if (item.key in item_detail_obj) {
          detail_arr.push(item);
        } else {
          this.removeField(item, type);
        }
      });
      if (detail_arr.length !== this[type + 'Array'].length) {
        this[type + 'Array'] = detail_arr;
      }
      if (this[type + 'Array'].length === 0) {
        const control = {
          id: 1,
          key: "pub_impression",
          name: "展现",
          type: this.setting.chart_type,
          is_x: type === 'xAxis',
          order: 0,
        };
        if (type === 'yAxis') {
          control.key = 'pub_impression';
          control.name = '展现';
          control[type + '_name'] = type + '_' + (++this.y_count);
        } else if (type === 'xAxis') {
          control.key = 'data_date';
          control.name = '时间';
          control[type + '_name'] = type + '_' + (++this.x_count);
        }
        this[type + 'Array'].push(control);
        this.validateForm.addControl(control[type + '_name'], new FormControl(control.key, Validators.required));
        if (type === 'yAxis') {
          this.validateForm.addControl(control['yAxis_name'] + '_type', new FormControl(control.type, Validators.required));
          this.axisFilter();
        }
      }
    }
  }
  summaryTypeChange(event) {
    // 说明开始：这段代码是在summary_type改变时，
    // yAxisArray数组可能有些项不在y_item_detail中
    // 主要是针对chart_type=='bar'情况下
    this.dealAxisArray('yAxis');
    this.dealAxisArray('xAxis');
    // 说明结束
    this.judgeSummaryType();
  }

  judgeSummaryType() {

    this.chart_detail_setting =  this.chartItemNew.getChartSetting(this.setting.chart_type, this.bizInfo);
    if (this.setting.summary_type === 'province_region' || this.setting.summary_type === 'city_region' || (this.xAxisArray.length && ( this.xAxisArray[0]['key'] === 'province_region' || this.xAxisArray[0]['key'] === 'city_region' || this.xAxisArray[0]['key'] === 'hours')) ) {
      this.chart_detail_setting = JSON.parse(JSON.stringify(this.chart_detail_setting));
      this.removeItem();
      this.yAxisArray.forEach(item => {
        const findUserInfo = this.chart_detail_setting.summary_items.yAxis[this.chart_detail_setting.summary_items.chart_item_details[this.setting.summary_type]['yAxis_type']].find(set => {
          return set.name === item.name;
        });
        if (!findUserInfo) {
          item['key'] = this.chart_detail_setting.summary_items.yAxis[this.chart_detail_setting.summary_items.chart_item_details[this.setting.summary_type]['yAxis_type']][0].key;
          item.name = this.chart_detail_setting.summary_items.yAxis[this.chart_detail_setting.summary_items.chart_item_details[this.setting.summary_type]['yAxis_type']][0].name;
          item.data_type = this.chart_detail_setting.summary_items.yAxis[this.chart_detail_setting.summary_items.chart_item_details[this.setting.summary_type]['yAxis_type']][0].data_type;
        }
      });
    }

  }

  axisFilter() {
    const filter_item = {};
    this.yAxisArray.forEach((item) => {
      filter_item[item.key] = true;
    });
    const item_detail = this.chart_detail_setting.summary_items.chart_item_details[this.setting.summary_type];
    this.chart_detail_setting.summary_items.yAxis[item_detail['yAxis_type']].forEach((item) => {
      if (item.key in filter_item) {
        item.is_selected = true;
      } else {
        item.is_selected = false;
      }
    });
  }

  xAxisChange(i) {

    this.xAxis_key = this.xAxisArray[i].key;
    const item_detail = this.chart_detail_setting.summary_items.chart_item_details[this.setting.summary_type];
    this.chart_detail_setting.summary_items.xAxis[item_detail['xAxis_type']].forEach((item) => {
      if (item.key === this.xAxisArray[i].key) {
        this.xAxisArray[i].name = item.name;
        this.xAxisArray[i].data_type = item.data_type;
        this.xAxisArray[i].field_name_key = item.field_name_key;
        item.is_selected = true;
      }
    });

    this.judgeSummaryType();
  }

  yAxisChange(i) {
    const item_detail = this.chart_detail_setting.summary_items.chart_item_details[this.setting.summary_type];
    this.chart_detail_setting.summary_items.yAxis[item_detail['yAxis_type']].forEach((item) => {
      if (item.key === this.yAxisArray[i].key) {
        this.yAxisArray[i].name = item.name;
        this.yAxisArray[i].data_type = item.data_type;
      }
    });
  }

  addField(type, e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    const control = {
      id: 0,
      key: '',
      name: '',
      type: this.setting.chart_type === 'bar' ? "bar" : "line",
      data_type: '',
      is_x: false,
      order: 0,
    };
    control[type + '_name'] = type + '_' + (++this.y_count);
    this[type + 'Array'].push(control);
    this.validateForm.addControl(control[type + '_name'], new FormControl(control.key, Validators.required));
    if (type === 'yAxis') {
      this.axisFilter();
      this.validateForm.addControl(control[type + '_name'] + '_type', new FormControl(control.type, Validators.required));
    }
  }

  removeField(row, type, e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    if (this[type + 'Array'].length > 1) {
      const index = this[type + 'Array'].indexOf(row);
      this[type + 'Array'].splice(index, 1);
      this.axisFilter();
      this.validateForm.removeControl(row[type + '_name']);
      this.validateForm.removeControl(row[type + '_name'] + '_type');
    }
  }

  ngOnInit() {

    //调用重新整理的图表配置
    this.chart_detail_setting = this.chartItemNew.getChartSetting(this.setting.chart_type, this.bizInfo);

    this.validateForm = this.fb.group({
      summaryType: ['', [Validators.required]],
    });
    this.y_count = 0;
    this.x_count = 0;
    this.setting.metrics.forEach((yAxis) => {
      if (yAxis.is_x) {
        // todo 现在设计的都只有一个x轴，所以可以这样做
        this.xAxis_key = yAxis.key;
        yAxis.xAxis_name = 'xAxis_' + (++this.x_count);
        this.xAxisArray.push(yAxis);
      } else {
        yAxis.yAxis_name = 'yAxis_' + (++this.y_count);
        this.yAxisArray.push(yAxis);
      }
    });
    this.axisFilter();
    this.xAxisArray.forEach((xAxis) => {
      this.validateForm.addControl(xAxis['xAxis_name'], new FormControl(xAxis.key, Validators.required));
    });
    this.yAxisArray.forEach((yAxis) => {
      this.validateForm.addControl(yAxis['yAxis_name'], new FormControl(yAxis.key, Validators.required));
      this.validateForm.addControl(yAxis['yAxis_name'] + '_type', new FormControl(yAxis.type, Validators.required));
    });

  }

  //y轴filter去掉转化的选项
  removeItem() {
    const new_data = [];
    this.chart_detail_setting.summary_items.yAxis[this.chart_detail_setting.summary_items.chart_item_details[this.setting.summary_type]['yAxis_type']].forEach((item, index) => {
      if (item['data_type'] === 'conversion_data' || item['data_type'] === 'metric_data') {
      } else {
        new_data.push(item);
      }
    });
    this.chart_detail_setting.summary_items.yAxis[this.chart_detail_setting.summary_items.chart_item_details[this.setting.summary_type]['yAxis_type']] = new_data;
  }

  getFormControl(name) {
    return this.validateForm.controls[ name ];
  }

  pre() {
    this.setting.metrics = this.xAxisArray.concat(this.yAxisArray);
    this.preClick.emit();
  }

  next() {
    this.setting.metrics = this.xAxisArray.concat(this.yAxisArray);
    this.nextClick.emit();
  }

  cancel() {
    this.cancelModal.emit();
  }

}
