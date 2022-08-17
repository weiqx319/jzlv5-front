import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { differenceInCalendarDays, endOfMonth, endOfWeek, format, isValid, parse, startOfMonth, startOfToday, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { isArray, isNull, isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../core/service/auth.service";
import { MenuService } from '../../../../core/service/menu.service';
import { DateDefineService } from "../../../../shared/service/date-define.service";
import { ItemOperationsService } from "../../../../shared/service/item-operations.service";
import { SetSummaryTimeComponent } from "../../../set-summary-time/set-summary-time.component";
import { TableItemFeedService } from "../../service/table-item-feed.service";
import { TableStepBaseComponent } from '../../commonBaseClass/TableStepBaseComponent';
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";

@Component({
  selector: 'app-table-step-feed',
  templateUrl: '../../commonTemplate/table-step/table-step-feed.component.html',
  styleUrls: ['../../commonTemplate/table-step/table-step.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TableItemFeedService, DateDefineService],
})
export class TableStepFeedComponent extends TableStepBaseComponent implements OnInit {

  @Input()
  set tableSetting(value: any) {
    this.reportTableData = Object.assign({}, this.reportTableData, value); // -- deepClone

    //当为时间报告时（粒度回显，后台返回的粒度 都会加 '_hour'）
    if (this.reportTableData.report_type === 'hours_report') {
      this.reportTableData.summary_type = this.reportTableData.summary_type.split('_')[0];
    }
    if (this.reportTableData['condition'].length) {
      this.reportTableData['condition'].forEach((item) => {
        if (item['type'] === 'string' || item['type'] === 'multiValue') {
          if (isArray(item['value'])) {
            item['value'] = item['value'].join('\n');
          } else {
            item['value'] = item['value'];
          }
        }
      });
    }

    if (isArray(this.reportTableData['filter_optimization_ids']) && this.reportTableData['filter_optimization_ids'].length > 0) {
      this.filterOptimizationId = this.reportTableData['filter_optimization_ids'][0];
    }
    this.reportTableTimeSetting.time_grain = this.reportTableData.time_grain;
    this.reportTableTimeSetting.summary_date = this.reportTableData.summary_date.indexOf('custom') === 0 ? 'custom' : this.reportTableData.summary_date;
    this.reportTableTimeSetting.summary_date_range = this.splitDate(this.reportTableData.summary_date);
    this.reportTableTimeSetting.summary_date_compare = this.reportTableData.summary_date_compare.indexOf('custom') === 0 ? 'custom_init' : this.reportTableData.summary_date_compare;
    this.reportTableTimeSetting.summary_date_compare_range = this.splitDate(this.reportTableData.summary_date_compare);
    //定向报告粒度回显
    this.targetSummaryTypeId = this.targetSummaryTypeMapReverse[this.reportTableData.summary_type];

  }

  public reportTypeList = [
    { name: '基础报告', value: 'basic_report' },
    // {name: '地域报告', value: 'region_report'},
    { name: '时段报告', value: 'hours_report' },
    // {name: '维度报告', value: 'dim_report'}
  ];
  //定向类型
  public targetTypeList = [
    {
      width: '120',
      name: '国家地域',
      showKey: 'country_region_name',
      key: 'country_region',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1, 6, 9, 7, 13, 11, 17],
      includeSummaryNames: {
        'publisher_17': ['publisher_id', 'pub_account_name'],
        'publisher_13': ['publisher_id', 'pub_account_name'],
        'publisher_1': ['publisher_id', 'pub_account_name'],
        'publisher_6': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_9': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
        'publisher_11': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
    {
      width: '120',
      name: '省级地域',
      showKey: 'province_region_name',
      key: 'province_region',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1, 6, 9, 7, 13, 11, 17],
      includeSummaryNames: {
        'publisher_17': ['publisher_id', 'pub_account_name'],
        'publisher_13': ['publisher_id', 'pub_account_name'],
        'publisher_1': ['publisher_id', 'pub_account_name'],
        'publisher_6': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_9': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
        'publisher_11': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
    {
      width: '120',
      name: '市级地域',
      showKey: 'city_region_name',
      key: 'city_region',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1, 6, 9, 7, 11, 17],
      includeSummaryNames: {
        'publisher_17': ['publisher_id', 'pub_account_name'],
        'publisher_1': ['publisher_id', 'pub_account_name'],
        'publisher_6': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_9': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
        'publisher_11': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
    {
      width: '80',
      name: '年龄',
      key: 'age',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [6, 9, 7],
      includeSummaryNames: {
        'publisher_6': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_9': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
    {
      width: '80',
      name: '性别',
      key: 'gender',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [6, 9, 7, 13],
      includeSummaryNames: {
        'publisher_13': ['publisher_id', 'pub_account_name'],
        'publisher_6': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_9': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name'],
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
    {
      width: '120',
      name: '兴趣',
      key: 'interest',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
    {
      width: '120',
      name: '样式',
      key: 'material_style',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1],
      includeSummaryNames: {
        'publisher_1': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    }, {
      width: '120',
      name: '意图词',
      key: 'intention_keyword',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1],
      includeSummaryNames: {
        'publisher_1': ['publisher_id', 'pub_account_name'],
      }
    }, {
      width: '120',
      name: '网络类型',
      key: 'ac',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      }
    }, {
      width: '120',
      name: '平台',
      key: 'platform',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    }, {
      width: '120',
      name: '推广目的',
      key: 'landing_type',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    }, {
      width: '120',
      name: '投放位置',
      key: 'inventory_type',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    }, {
      width: '120',
      name: '出价类型',
      key: 'pricing',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    }, {
      width: '120',
      name: '素材类型',
      key: 'image_mode',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
      includeSummaryNames: {
        'publisher_7': ['publisher_id', 'pub_account_name', 'pub_campaign_name', 'pub_adgroup_name', 'pub_creative_name'],
      },
    },
  ];
  // 媒体属性
  public targetSummaryTypeList = [
    {
      width: '96',
      name: '媒体',
      showKey: 'publisher',
      key: 'publisher_id',
      data_type: 'pub_attr_data',
      selected: {
        current: true,
      },
      summaryType: ['target'],
      type: 'singleList',
      includePublisherIds: [1, 6, 9, 7, 13, 11, 17],
    },
    {
      width: '184',
      name: '账户',
      key: 'pub_account_name',
      data_type: 'pub_attr_data',
      selected: { current: true },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1, 6, 9, 7, 13, 11, 17],
    },
    //-- 头条 计划（广告组）
    {
      width: '120',
      name: '广告组',
      key: 'pub_campaign_name',
      data_type: 'pub_attr_data',
      selected: { current: true },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
    },
    //-- 头条 单元（计划）
    {
      width: '120',
      name: '计划',
      key: 'pub_adgroup_name',
      data_type: 'pub_attr_data',
      selected: { current: true },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [7],
    },


    {
      width: '120',
      name: '计划',
      key: 'pub_campaign_name',
      data_type: 'pub_attr_data',
      selected: { current: true },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1, 6, 9, 11],
    },
    {
      width: '120',
      name: '单元',
      key: 'pub_adgroup_name',
      data_type: 'pub_attr_data',
      selected: { current: true },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1, 7, 11],
    },
    {
      width: '120',
      name: '创意',
      key: 'pub_creative_name',
      data_type: 'pub_attr_data',
      selected: { current: true },
      summaryType: ['target'],
      type: 'string',
      includePublisherIds: [1, 7, 11],
    },
  ];

  public targetSummaryTypeMap = {
    publisher_id: 'target_publisher',
    pub_account_name: 'target_account',
    pub_campaign_name: 'target_campaign',
    pub_adgroup_name: 'target_adgroup',
  };
  public targetSummaryTypeMapReverse = {
    target_publisher: 'publisher_id',
    target_account: 'pub_account_name',
    target_campaign: 'pub_campaign_name',
    target_adgroup: 'pub_adgroup_name',
  };
  public targetSummaryTypeId = '';

  constructor(public subject: NzModalRef,
    public authService: AuthService,
    public modalService: NzModalService,
    public fb: FormBuilder,
    public dateDefineService: DateDefineService,
    public tableItemService: TableItemFeedService,
    public itemOperationsService: ItemOperationsService,
    public _message: NzMessageService,
    public menuService: MenuService,
    public customDatasService: CustomDatasService,
  ) {
    super(subject, authService, modalService, fb, dateDefineService, tableItemService, itemOperationsService, _message, menuService, customDatasService);
    this.conditionOper = this.itemOperationsService.getOperations();
    this.userSelectedOper = this.authService.getCurrentUserOperdInfo();

  }

  ngOnInit() {

    this.init();
    if (this.userSelectedOper.role_id === 1 || this.userSelectedOper.role_id === 3 || this.userSelectedOper.role_id === 5) {
      this.reportTypeList.push({ name: '负责人报告', value: 'responsible_account' });
    }

    if ([1, 6, 7, 9, 13, 11, 17].includes(this.menuService.currentPublisherId)) {
      this.reportTypeList.push({ name: '定向报告', value: 'target_report' });
    }

    //添加定向报告
    if (this.reportTableData['report_type'] === 'target_report') {
      //媒体属性
      const index = this.targetSummaryTypeList.findIndex(
        (item) => item.key === this.targetSummaryTypeId,
      );
      const selectedPubliserList = this.targetSummaryTypeList.slice(0, index + 1);
      let selectedtargetKey = [];
      if (this.reportTableData['target_type'] === 'city_region') {
        selectedtargetKey = ['province_region', 'city_region'];
      } else {
        selectedtargetKey = [this.reportTableData['target_type']];
      }
      const selecedtargetList = this.targetTypeList.filter((item) =>
        selectedtargetKey.includes(item.key),
      );
      this.reportTableData['locked_items'] = [...selectedPubliserList, ...selecedtargetList];
    }

  }

  //媒体属性
  onPubliserChange() {
    let selectedPubliserList = [];
    let data = [...this.reportTableData['locked_items']];
    //移除原有选中项
    this.targetSummaryTypeList.forEach((publiser) => {
      const findIndex = data.findIndex((item) => item.key === publiser.key);
      if (findIndex > -1) {
        data.splice(findIndex, 1);
      }
    });
    //媒体属性
    const index = this.targetSummaryTypeList.findIndex(
      (item) => item.key === this.targetSummaryTypeId,
    );
    selectedPubliserList = this.targetSummaryTypeList.slice(0, index + 1);
    data = [...selectedPubliserList, ...data];
    this.reportTableData['locked_items'] = data;
    this.reportTableData['summary_type'] = this.targetSummaryTypeMap[this.targetSummaryTypeId];
  }
  // 定向类型
  onTargetChange() {
    let selecedtargetList = [];
    let data = [...this.reportTableData['locked_items']];
    //移除原有选中项
    this.targetTypeList.forEach((target) => {
      const index = data.findIndex((item) => item.key === target.key);
      if (index > -1) {
        data.splice(index, 1);
      }
    });
    let selectedtargetKey = [];
    if (this.reportTableData['target_type'] === 'city_region') {
      selectedtargetKey = ['province_region', 'city_region'];
    } else {
      selectedtargetKey = [this.reportTableData['target_type']];
    }
    selecedtargetList = this.targetTypeList.filter((item) =>
      selectedtargetKey.includes(item.key),
    );
    data = [...selecedtargetList, ...data];
    this.reportTableData['locked_items'] = data;
  }






}
