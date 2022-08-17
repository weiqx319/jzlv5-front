import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { MenuService } from '../../../../core/service/menu.service';
import {ItemOperationsService} from "../../../../shared/service/item-operations.service";
import {ChartItemNewService} from "../../service/chart-item-new.service";

@Component({
  selector: 'app-chart-data-setting',
  templateUrl: './chart-data-setting.component.html',
  styleUrls: ['./chart-data-setting.component.scss'],
  providers: [ChartItemNewService],
})
export class ChartDataSettingComponent implements OnInit {

  validateDataForm: FormGroup;
  chart_detail_setting: any;
  filter_count: any;
  operations: any;

  public disable_time = false;
  public current_channel;

  @Input() setting: any;
  @Input() bizInfo = {typeName: "", data: []};

  @Output() cancelModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() preClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() doneClick: EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
              private chartItemNew: ChartItemNewService,
              private itemOperationsService: ItemOperationsService,
              private menuService: MenuService,
              ) {
    this.operations = this.itemOperationsService.getOperations();
    this.current_channel = this.menuService.currentChannelId;
  }

  filterChange(i) {
    this.chart_detail_setting.summary_items.filter_items[this.setting.summary_type].forEach((item) => {
      if (item.key === this.setting.conditions[i].key) {
        this.setting.conditions[i].name = item.name;
        this.setting.conditions[i].data_type = item.data_type;
      }
    });
    if (this.validateDataForm.value[this.setting.conditions[i]['filter_name']] === this.setting.conditions[i].key) {

      if (this.setting.conditions[i]['name'] !== '请选择' && !this.setting.conditions[i].op) {
        this.setting.conditions[i].op = this.operations[this.chart_detail_setting.summary_items.condition_details[this.setting.conditions[i].key].op_type][0]['key'];
      }
    } else {

      if (this.chart_detail_setting.summary_items.condition_details[this.setting.conditions[i].key].op_type === 'single_select') {
        this.setting.conditions[i].op = '=';
        this.setting.conditions[i].value = '';
      } else if (this.chart_detail_setting.summary_items.condition_details[this.setting.conditions[i].key].op_type === 'number') {
        this.setting.conditions[i].op = '>';
        this.setting.conditions[i].value = 0;
      } else if (this.chart_detail_setting.summary_items.condition_details[this.setting.conditions[i].key].op_type === 'string') {
        this.setting.conditions[i].op = '=';
        this.setting.conditions[i].value = '';
      } else if (this.chart_detail_setting.summary_items.condition_details[this.setting.conditions[i].key].op_type === 'multi_select') {
        this.setting.conditions[i].op = '=';
        this.setting.conditions[i].value = '';
      }
      this.setting.conditions[i].data_type = this.chart_detail_setting.summary_items.condition_details[this.setting.conditions[i].key].data_type;
    }
  }

  addFilterField(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    const control = {
      key: "",
      value: "",
      name: "",
      op: "",
      type: "",
      data_type: "",
    };
    control['filter_name'] = 'filter_' + (++this.filter_count);
    this.setting.conditions.push(control);
    this.validateDataForm.addControl(control['filter_name'], new FormControl(control.key, Validators.required));
    this.validateDataForm.addControl(control['filter_name'] + '_type', new FormControl(control.op, Validators.required));
    this.validateDataForm.addControl(control['filter_name'] + '_value', new FormControl(control.value, Validators.required));
  }

  removeFilterField(row, e: MouseEvent) {
    e.preventDefault();
    if (this.setting.conditions.length > 0) {
      const index = this.setting.conditions.indexOf(row);
      this.setting.conditions.splice(index, 1);
      this.validateDataForm.removeControl(row['filter_name']);
      this.validateDataForm.removeControl(row['filter_name'] + '_type');
      this.validateDataForm.removeControl(row['filter_name'] + '_value');
    }
  }

  regionSelect(row, obj) {
    row.value = obj.region_lists;
    this.validateDataForm.setControl(row['filter_name'] + '_value', new FormControl(row.value, Validators.required));
  }

  itemSelect(data) {
    this.setting.data_range = data;
  }

  ngOnInit() {
    this.setting['metrics'].forEach(item => {
      if (item['key'] === 'city_region' || item['key'] === 'province_region') {
        this.disable_time = true;
      }

    });

    this.chart_detail_setting = this.chartItemNew.getChartSetting(this.setting.chart_type, this.bizInfo);
    if ((this.setting.chart_type == 'pie'  ||  ['department','advertiser', 'channel', 'publisher', 'account','campaign'].indexOf(this.setting['summary_type']) > -1)) {
      this.chart_detail_setting.summary_items.time_type.push({key: 'day:1:179', name: '近180天'});
    }

    if (this.setting.chart_type === 'bar') {
      let x_field = '';
      const filter_item_arr = [];
      // 找到X轴用的是那个字段
      this.setting.metrics.forEach( item => {
        if (item.is_x) {
          x_field = item.key;
        }
      });
      this.chart_detail_setting.summary_items.filter_items[this.setting.summary_type].forEach((item) => {
        if (x_field === 'province_region') {
          if (item.data_type !== 'metric_data' && item.data_type !== 'conversion_data' && item.key !== 'city_region') {
            filter_item_arr.push(item);
          }
        } else if (x_field === 'city_region') {
          if (item.data_type !== 'metric_data' && item.data_type !== 'conversion_data' && item.key !== 'province_region') {
            filter_item_arr.push(item);
          }
        } else if (x_field === 'hours') {
          if (item.key !== 'province_region' && item.key !== 'city_region' && item.data_type !== 'metric_data' && item.data_type !== 'conversion_data') {
            filter_item_arr.push(item);
          }
        } else {
          if (item.key !== 'province_region' && item.key !== 'city_region') {
            filter_item_arr.push(item);
          }
        }
      });
      this.chart_detail_setting.summary_items.filter_items[this.setting.summary_type] = filter_item_arr;
    }
    const filter_items = {};
    const filter_conditions = [];
    this.chart_detail_setting.summary_items.filter_items[this.setting.summary_type].forEach((item) => {
      filter_items[item.key] = true;
    });
    this.validateDataForm = this.fb.group({
      dateRange: ['', [Validators.required]],
    });

    //编辑回显
    if (this.setting.conditions) {
      this.setting.conditions.forEach((filter) => {
        if (filter.key in filter_items) {
          filter_conditions.push(filter);
        }
      });
    }

    this.setting.conditions = filter_conditions;
    /*if (this.setting.conditions.length > 0) {

    } else {
      this.setting.conditions.push({
        "key": "",
        "value": "",
        "name": "",
        "op": "",
        "type": ""
      });
    }*/
    this.filter_count = this.setting.conditions.length;
    this.setting.conditions.forEach((filter, index) => {
      filter['filter_name'] = 'filter_' + (index + 1);
      this.validateDataForm.addControl(filter['filter_name'], new FormControl(filter.key, Validators.required));
      this.validateDataForm.addControl(filter['filter_name'] + '_type', new FormControl(filter.op, Validators.required));
      this.validateDataForm.addControl(filter['filter_name'] + '_value', new FormControl(filter.value, Validators.required));
    });
  }

  getFormControl(name) {
    return this.validateDataForm.controls[ name ];
  }

  pre() {
    this.preClick.emit();
  }

  done() {
    this.doneClick.emit();
  }

  cancel() {
    this.cancelModal.emit();
  }

}
