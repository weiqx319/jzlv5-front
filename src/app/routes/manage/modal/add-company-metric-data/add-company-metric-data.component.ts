import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ManageService } from '../../service/manage.service';
import { DefineSettingService } from '../../service/define-setting.service';
import { isUndefined } from "@jzl/jzl-util";
import { ManageItemService } from '../../service/manage-item.service';
import { MenuService } from '../../../../core/service/menu.service';
import { CustomDatasService } from '../../../../shared/service/custom-datas.service';
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../../../core/service/auth.service';
import { matchingBracket } from '@jzl/jzl-util';

@Component({
  selector: 'app-add-company-metric-data',
  templateUrl: './add-company-metric-data.component.html',
  styleUrls: ['./add-company-metric-data.component.scss']
})
export class AddCompanyMetricDataComponent implements OnInit {
  @Input() set metricData(data: any) {
    this.formulaData = data['company_define'];
    this.defaultMetric = Object.assign(this.defaultMetric, {
      cid: data['cid'],
      metric_type: data['metric_type'],
      metric_name: data['metric_name'],
      is_rate: data['is_rate'] * 1,
      metric_data_type: data['metric_data_type'],
      is_cid_level: data['is_cid_level'],
      metric_remarks: data['metric_remarks'],
      is_default: data['is_default'],
      category_id: data['category_id']
    });
  }

  @Input() metricDataId = 0;
  @Input() allCompanyMetric = [];
  // 指标分类列表
  @Input() categoryList = [];

  public advertiserList = [];

  public submitting = false;
  private _lastChangedCid = 0;
  public formulaData = [];
  public operatorLists = [
    { oper: '1', value: '+' },
    { oper: '2', value: '-' },
    { oper: '3', value: '*' },
    { oper: '4', value: '/' }
  ];

  constructor(
    private fb: FormBuilder,
    private manageService: ManageService,
    private message: NzMessageService,
    private defineSettingService: DefineSettingService,
    private modalSubject: NzModalRef,
    public menuService: MenuService,
    public authService: AuthService,
  ) {
  }

  public defaultMetric = {
    cid: null,
    metric_type: 1,
    metric_name: '',
    is_rate: 0,
    metric_data_type: 2,
    is_cid_level: 1,
    metric_remarks: '',
    is_default: 0,
    category_id: null
  };

  public itemTypeRelation = [
    {
      name: '常数',
      type: 'number',
      key: 'normal_data'
    },
    {
      name: '媒体投放数据',
      type: 'option',
      key: 'pub_data'
      // detail:deliveryData
    },
    {
      name: '集团指标',
      type: 'option',
      key: 'company_metric_data'
      // detail:customBasisData
    }
  ];

  public itemTypeDataDetail = {
    pub_data: [
      { name: '展现', key: 'pub_impression', data_type: 'pub_metric_data' },
      { name: '点击', key: 'pub_click', data_type: 'pub_metric_data' },
      { name: '消费', key: 'pub_cost', data_type: 'pub_metric_data' },
      {
        name: '平均排名',
        key: 'pub_avg_position',
        data_type: 'pub_metric_data'
      },
      // {name: "当前出价", key: "price", data_type: 'pub_metric_data', summaryType: ['keyword']},
      { name: 'CPC', key: 'pub_cpc', data_type: 'pub_metric_data' },
      // {name: "CPM", key: "pub_cpm", data_type: 'pub_metric_data'},
      { name: '点击率', key: 'pub_ctr', data_type: 'pub_metric_data' },
      {
        name: '现金消费',
        key: 'pub_discount_cost',
        data_type: 'pub_metric_data'
      }, {
        name: '服务费',
        key: 'pub_commission',
        data_type: 'pub_metric_data'
      }
    ],
    conversion_data: [],
    company_metric_data: [],
    pub_conversion_bd_app: [],
    pub_conversion_bd_web: [],
    pub_conversion_gdt_app: [],
    pub_conversion_gdt_web: [],
    pub_conversion_gdt_social: [],
    pub_conversion_bytedance_download: [],
    pub_conversion_bytedance_landing_page: [],
    pub_conversion_bytedance_video: [],
    pub_conversion_bytedance_extra_creative: [],
    pub_conversion_bytedance_basic: [],
    pub_conversion_bytedance_social: []
  };

  ngOnInit() {

    this.defineSettingService.getCompanyMetricList({}, { page: 1, count: 1000000 }).subscribe(results => {
      if (results['status_code'] == 200) {
        results['data']['detail'].forEach(item => {
          this.itemTypeDataDetail.company_metric_data.push({ name: item['metric_name'], key: item['metric_id'] + '', data_type: 'company_metric_data' });
        });
      }
    });

    if (this.metricDataId === 0 || this.formulaData.length < 1) {
      const line1 = {
        left_bracket: false,
        right_bracket: false,
        type: 'normal_data',
        name: '',
        value: '100',
        operator: '1'
      };
      const line2 = {
        left_bracket: false,
        right_bracket: false,
        type: 'normal_data',
        name: '',
        value: '100',
        operator: '1'
      };
      this.formulaData.push(line1);
      this.formulaData.push(line2);
    }
  }


  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  checkBracket(item, side) {
    item[side] = !item[side];
  }


  structTypeChange(struct) {

    if (struct.type === 'normal_data') {
      struct.value = 0;
      struct.name = '';
    } else if (
      this.itemTypeDataDetail[struct.type] &&
      this.itemTypeDataDetail[struct.type].length > 0
    ) {
      struct.value = this.itemTypeDataDetail[struct.type][0].key + '';
      struct.name = this.itemTypeDataDetail[struct.type][0].name + '';
    } else {
      struct.value = '';
      struct.name = '';
    }
  }

  refreshName(key, struct) {
    const findDetail = this.itemTypeDataDetail[struct.type].find(item => {
      return item.key === struct.value;
    });
    if (!isUndefined(findDetail)) {
      struct.name = findDetail.name;
    } else {
      struct.name = '';
    }
  }


  deleteLine(index) {
    this.formulaData.splice(index, 1);
  }

  addLine(index) {
    const line_item = {
      left_bracket: false,
      right_bracket: false,
      type: 'normal_data',
      name: '',
      value: '100',
      operator: '1'
    };
    this.formulaData.splice(index + 1, 0, line_item);
  }




  doSave() {
    let resultMetric = {
      company_id: this.authService.getCurrentUser().company_id,
      metric_type: 1,
      metric_name: ''
    };

    resultMetric = Object.assign(resultMetric, this.defaultMetric);

    resultMetric['company_define'] = this.formulaData;

    const isMatch = matchingBracket(this.formulaData);
    //括号不匹配
    if (!isMatch) {
      this.message.error('公式的括号不匹配，请检查', { nzDuration: 5000 });
    }

    if (resultMetric.metric_name.trim() == '') {
      this.message.error('名称不能为空');
      return;
    }

    this.submitting = true;
    if (this.metricDataId > 0) {
      this.defineSettingService
        .updateCompanyMetric(this.metricDataId, resultMetric)
        .subscribe(
          data => {
            if (data['status_code'] && data.status_code === 200) {
              this.message.success('保存成功');
              this.modalSubject.destroy('onOk');
            } else if (data['status_code'] && data.status_code === 201) {
              this.message.error('广告主名称已经存在，请重试');
            } else if (data['status_code'] && data.status_code === 401) {
              this.message.error('您没权限对此操作！');
              this.doCancel();
            } else if (data['status_code'] && data.status_code === 500) {
              this.message.error('系统异常，请重试');
            } else {
              this.message.error(data.message);
            }
          },
          err => {

            this.message.error('系统异常，请重试');
          },
          () => {
            this.submitting = false;
          }
        );
    } else {
      this.defineSettingService.createCompanyMetric(resultMetric).subscribe(
        data => {
          if (data['status_code'] && data.status_code === 200) {
            this.message.success('保存成功');
            this.modalSubject.destroy('onOk');
          } else if (data['status_code'] && data.status_code === 201) {
            this.message.error('广告主名称已经存在，请重试');
          } else if (data['status_code'] && data.status_code === 401) {
            this.message.error('您没权限对此操作！');
            this.doCancel();
          } else if (data['status_code'] && data.status_code === 500) {
            this.message.error('系统异常，请重试');
          } else {
            this.message.error(data.message);
          }
        },
        err => {
          this.message.error('系统异常，请重试');
        },
        () => {
          this.submitting = false;
        }
      );
    }
  }
}
