import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";
import { MonitorSettingService } from '../../service/monitor-setting.service';
import { MenuService } from '../../../../core/service/menu.service';
import { isArray } from "@jzl/jzl-util";

@Component({
  selector: 'app-edit-automatic-monitoring',
  templateUrl: './edit-automatic-monitoring.component.html',
  styleUrls: ['./edit-automatic-monitoring.component.scss']
})
export class EditAutomaticMonitoringComponent implements OnInit, OnChanges {

  @Input() idsArray: any;
  @Input() publisher_model: any;
  @Input() parentData: any;
  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Input() monitor_status: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();
  constructor(private _http: MonitorSettingService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private menuService: MenuService,
    private customDataService: CustomDatasService,) {
    this.publisherOption = this._http.getPublisherOption();
  }
  public myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
  public reg = /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
  public publisherOption = {};
  public options = [];
  public showSingleKeywordData = {};
  public campaignInfo = {};
  public groupData = {};
  public accountInfo = {};
  public iswraing = false;
  public email_warning = false;
  public emails = '';
  public selectedIndex = 0;

  public average_value: null;
  public max_value: null;
  public period_day = 1; //昨天


  public automaticMonitoringData = {
    monitor_info: {
      monitor_id: null,
      publisher_id: null,
      channel_id: null,
      monitor_name: null,
      monitor_module: null,
      monitor_interval: null,
      notify_phone: {
        is_notify: false,
        phone: '',
        notify_hour_start: 9,
        notify_hour_end: 19
      },
      notify_email: {
        is_notify: false,
        email: null,
        // send_report: false
      },
      is_repeat_alarm: '0',
      monitor_status: 100,
      monitor_metric: [
        {
          "rule_define": [
            {
              "key": "pub_impression",
              "name": "展现",
              "real_time": false,
              "data_type": "pub_metric_data",
              "comparison_value": null,
              "comparison_operation": ">="
            }
          ]
        }
      ],
      monitor_action: [
        {
          "is_open": false,
          "key": "pause",
          "value": false
        },
        {
          "is_open": false,
          "key": "price",
          "value": 12
        }
      ]


    },
    monitor_detail: {
      select_type: ''
    }
  };

  public itemTypeRelation = [
    {
      name: '媒体投放数据',
      type: 'option',
      key: 'pub_metric_data'

      // detail:deliveryData
    },
    {
      name: '自定义转化数据',
      type: 'option',
      key: 'conversion_data'
      // detail:customBasisData
    },
    {
      name: '自定义指标数据',
      type: 'option',
      key: 'metric_data'
      // detail:customBasisData
    }
  ];
  public itemTypeCopyRelation = [];
  public itemTypeDataDetail = {};
  public itemDetailDefault: any = {
    pub_metric_data: [
      { name: '展现', key: 'pub_impression', data_type: 'pub_metric_data', is_rate: 0, real_time: false },
      { name: '点击', key: 'pub_click', data_type: 'pub_metric_data', is_rate: 0, real_time: false },
      { name: '消费', key: 'pub_cost', data_type: 'pub_metric_data', is_rate: 0, real_time: false },
      { name: 'CPC', key: 'pub_cpc', data_type: 'pub_metric_data', is_rate: 0, real_time: false },
      { name: '点击率', key: 'pub_ctr', data_type: 'pub_metric_data', is_rate: 1, real_time: false },
      {
        name: '现金消费',
        key: 'pub_discount_cost',
        data_type: 'pub_metric_data',
        is_rate: 0,
        real_time: false
      }
    ],
    conversion_data: [],
    metric_data: [],
  };

  public monitor_group_action = 2;
  public monitor_group_model = [];


  public monitor_rate = [
    // {'name': '15分钟', 'key': 15},
    // {'name': '30分钟', 'key': 30},
    { 'name': '1小时', 'key': 60 },
    { 'name': '2小时', 'key': 120 },
  ];


  public monitor_operation = [
    { 'name': '小于等于', 'key': '<=', 'real_time': true },
    { 'name': '大于等于', 'key': '>=' },
    { 'name': '波动范围超出昨天', 'key': 'avg_1' },
    { 'name': '波动范围超出近3天平均值', 'key': 'avg_3' },
    { 'name': '波动范围超出近5天平均值', 'key': 'avg_5' },
    { 'name': '波动范围超出近7天平均值', 'key': 'avg_7' },
    { 'name': '波动范围超出近14天平均值', 'key': 'avg_14' },
    { 'name': '波动范围低于昨天', 'key': 'avg_lt_1' },
    { 'name': '波动范围低于近3天平均值', 'key': 'avg_lt_3' },
    { 'name': '波动范围低于近5天平均值', 'key': 'avg_lt_5' },
    { 'name': '波动范围低于近7天平均值', 'key': 'avg_lt_7' },
    { 'name': '波动范围低于近14天平均值', 'key': 'avg_lt_14' },
    { 'name': '消费超过预算百分比', 'key': 'budget_gt', 'includeMetric': ['pub_cost'] }

  ];
  public metricTypeRelationByChannel = {};
  public metricListByChannel = {};






  public startTimeArray = [];
  public endTimeArray = [];
  public copy_automaticMonitoringData: any;



  getOperationByItem(metric) {
    let tempCondition = [];
    if (metric == 'balance') {
      tempCondition.push({ 'name': '小于等于', 'key': '<=', 'real_time': true });
      return tempCondition;
    }

    if (metric == 'pub_cost') {
      tempCondition = [
        { 'name': '小于等于', 'key': '<=', 'real_time': true },
        { 'name': '大于等于', 'key': '>=' },
        { 'name': '波动范围超出昨天', 'key': 'avg_1' },
        { 'name': '波动范围超出近3天平均值', 'key': 'avg_3' },
        { 'name': '波动范围超出近5天平均值', 'key': 'avg_5' },
        { 'name': '波动范围超出近7天平均值', 'key': 'avg_7' },
        { 'name': '波动范围超出近14天平均值', 'key': 'avg_14' },
        { 'name': '波动范围低于昨天', 'key': 'avg_lt_1' },
        { 'name': '波动范围低于近3天平均值', 'key': 'avg_lt_3' },
        { 'name': '波动范围低于近5天平均值', 'key': 'avg_lt_5' },
        { 'name': '波动范围低于近7天平均值', 'key': 'avg_lt_7' },
        { 'name': '波动范围低于近14天平均值', 'key': 'avg_lt_14' }
      ];
      if (this.summaryType == 'account' && this.menuService.currentChannelId != 1) {
        tempCondition.unshift({ 'name': '消费超过预算百分比', 'key': 'budget_gt' });
      }
      return tempCondition;
    }

    tempCondition = [
      { 'name': '小于等于', 'key': '<=', 'real_time': true },
      { 'name': '大于等于', 'key': '>=' },
      { 'name': '波动范围超出昨天', 'key': 'avg_1' },
      { 'name': '波动范围超出近3天平均值', 'key': 'avg_3' },
      { 'name': '波动范围超出近5天平均值', 'key': 'avg_5' },
      { 'name': '波动范围超出近7天平均值', 'key': 'avg_7' },
      { 'name': '波动范围超出近14天平均值', 'key': 'avg_14' }
    ];
    return tempCondition;








  }


  ngOnInit() {

    const conversionData = this.customDataService.getConversionData().map(
      item => {
        // this._initAllPubData.push(Object.assign({data_type: 'conversion_data', 'type': 'numberFilter',  not_show_summaryType: ['search_keyword', 'creative']}, item, {width: 112}));
        this.itemDetailDefault.conversion_data.push(Object.assign({ data_type: 'conversion_data', 'type': 'numberFilter', is_rate: 0 }, item, { width: 112 }, { real_time: false }));
        // this._initAllPubData.push(Object.assign({data_type: 'conversion_data'}, item, {width: 112}));
      }
    );

    const customMetricData = this.customDataService.getMetricsData().map(
      item => {
        // this._initAllPubData.push(Object.assign({data_type: 'metric_data',  'type': 'numberFilter', not_show_summaryType: ['search_keyword', 'creative']}, item, {width: 112}));
        this.itemDetailDefault.metric_data.push(Object.assign({ data_type: 'metric_data', 'type': 'numberFilter', is_rate: 0 }, item, { width: 112 }, { real_time: false }));

        // this._initAllPubData.push(Object.assign({data_type: 'metric_data'}, item, {width: 112}));
      }
    );


    const localTableMetric = this.customDataService.getLocalData('feed_table_item');
    if (localTableMetric) {
      if (localTableMetric['metric_type']) {


        Object.keys(localTableMetric['metric_type']).forEach(metricChannelKey => {
          if (localTableMetric.hasOwnProperty(metricChannelKey) && isArray(localTableMetric[metricChannelKey])) {
            this.metricListByChannel[metricChannelKey] = {};
            localTableMetric[metricChannelKey].forEach(metricItem => {
              if (this.metricListByChannel[metricChannelKey].hasOwnProperty(metricItem['data_type'])) {
                this.metricListByChannel[metricChannelKey][metricItem['data_type']].push({
                  name: metricItem['name'],
                  key: metricItem['key'],
                  data_type: metricItem['data_type'],
                });
              } else {
                this.metricListByChannel[metricChannelKey][metricItem['data_type']] = [];
                this.metricListByChannel[metricChannelKey][metricItem['data_type']].push({
                  name: metricItem['name'],
                  key: metricItem['key'],
                  data_type: metricItem['data_type'],
                });
              }
            });
          }
        });


        Object.keys(localTableMetric['metric_type']).forEach(metricChannelKey => {
          this.metricTypeRelationByChannel[metricChannelKey] = [];
          Object.values(localTableMetric['metric_type'][metricChannelKey]).forEach(typeItem => {
            if (this.metricListByChannel[metricChannelKey] && this.metricListByChannel[metricChannelKey].hasOwnProperty(typeItem['data_type'])) {
              this.metricTypeRelationByChannel[metricChannelKey].push({
                "name": typeItem['data_type_name'],
                "key": typeItem['data_type'],
              });
            }
          });
        });
      }
    }


    this.itemTypeCopyRelation = [...this.itemTypeRelation];
    const metricChannelKeyFinal = this.menuService.currentChannelId + '_' + this.menuService.currentPublisherId;

    if (this.metricTypeRelationByChannel.hasOwnProperty(metricChannelKeyFinal)) {
      this.itemTypeRelation = [
        ...this.itemTypeCopyRelation,
        ...this.metricTypeRelationByChannel[metricChannelKeyFinal]
      ];

      this.itemTypeDataDetail = {
        ...this.itemDetailDefault,
        ...this.metricListByChannel[metricChannelKeyFinal],
      };

    } else {
      this.itemTypeRelation = [...this.itemTypeCopyRelation];
      this.itemTypeDataDetail = {
        ...this.itemDetailDefault,
      };
    }





    if (this.summaryType === 'account') {
      this.itemTypeDataDetail["pub_metric_data"].unshift(
        { key: 'balance', name: '余额', real_time: true, data_type: 'pub_metric_data', is_rate: 0 }
      );
    }

    this.copy_automaticMonitoringData = JSON.parse(JSON.stringify(this.automaticMonitoringData));


    this.automaticMonitoringData.monitor_info.channel_id = this.menuService.currentChannelId;
    this.automaticMonitoringData.monitor_info.monitor_module = this.summaryType;

    if (this.parentData.selected_data.length === 1) {
      this.automaticMonitoringData.monitor_info.publisher_id = this.parentData.selected_data[0]['publisher_id'] * 1;
      switch (this.summaryType) {
        case 'keyword':
          this._showSingleKeyword();
          break;
        case 'campaign':
          this._showCampaign();
          break;
        case 'adgroup':
          this._showAdgroup();
          break;
        case 'account':
          this._showAccount();
          break;
      }

    }
    if (this.parentData.selected_data.length === 1 || this.publisher_model['publisherCount'] === 1) {
      this.automaticMonitoringData.monitor_info.publisher_id = this.parentData.selected_data[0]['publisher_id'] * 1;
      this.getMonitorList(this.automaticMonitoringData.monitor_info.publisher_id * 1, this.summaryType);

    }
    this.startTimeArray = this.getDateList(0, 9);
    this.endTimeArray = this.getDateList(9, 23);


  }


  changeStartTime() {
    this.endTimeArray = this.getDateList(0, 23).splice(this.automaticMonitoringData.monitor_info.notify_phone.notify_hour_start * 1, this.getDateList(0, 23).length - 1);
  }

  //生成0 - 24 的数字数组
  getDateList(lowBound, highRound) {
    const result = [];
    for (let i = lowBound; i <= highRound; i++) {
      result.push({
        'key': i,
        'name': i + '点'
      });
    }
    return result;
  }

  //将textarea内容转化为数组
  getTextareaArray(textareaString) {
    const textareaArray = [];
    textareaString.split('\n').forEach((item) => {
      if (item) {
        textareaArray.push(item);
      }
    });
    return textareaArray;
  }
  _showSingleKeyword() {
    this._http.getSingleKeywordData({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_campaign_id": this.parentData.selected_data[0].pub_campaign_id,
      "pub_adgorup_id": this.parentData.selected_data[0].pub_adgorup_id,
      "pub_keyword_id": this.parentData.selected_data[0].pub_keyword_id
    }).subscribe(
      (result) => {
        if (result.status_code === 200) {
          this.showSingleKeywordData = result.data;
        }
      }
    );
  }

  _showCampaign() {
    this._http.showCampaign({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_campaign_id": this.parentData.selected_data[0].pub_campaign_id
    }).subscribe(
      (result) => {
        this.campaignInfo = result.data;
      }
    );
  }

  _showAdgroup() {
    this._http.showAdgroup({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_adgroup_id": this.parentData.selected_data[0].pub_adgroup_id
    }).subscribe(
      (result) => {
        if (result.status_code === 200) {
          this.groupData = result.data;
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      }
    );
  }

  _showAccount() {
    this._http.showAccount({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id
    }).subscribe(
      (result) => {
        if (result.status_code === 200) {
          this.accountInfo = result['data'];
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }

      }
    );
  }

  getMonitorList(publisher_id, summaryType) {
    this._http.getMonitorList(publisher_id, summaryType).subscribe(result => {
      if (result.status_code === 200) {
        this.monitor_group_model = result['data'];
        if (this.monitor_group_model.length === 50) {
          this.monitor_group_action = 1;
        }
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else if (result['status_code'] && result.status_code === 205) {
      } else {
        this.message.error(result.message);
      }
    });
  }

  change_monitor_list() {

    this._http.getMonitorDetail(this.automaticMonitoringData.monitor_info.monitor_id).subscribe((result) => {

      if (result.status_code === 200) {
        this.initMonitor(result['data']);

      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else if (result['status_code'] && result.status_code === 205) {
      } else {
        this.message.error(result.message);
      }

    });
  }


  initMonitor(data?) {
    if (!data) {
      this.automaticMonitoringData.monitor_info.notify_phone = Object.assign({}, this.copy_automaticMonitoringData.monitor_info.notify_phone);
      this.automaticMonitoringData.monitor_info.notify_email = Object.assign({}, this.copy_automaticMonitoringData.monitor_info.notify_email);

    } else {
      this.automaticMonitoringData.monitor_info.is_repeat_alarm = data.is_repeat_alarm;
      this.automaticMonitoringData.monitor_info.notify_phone = data.notify_phone ? Object.assign({}, data.notify_phone) : Object.assign({}, this.copy_automaticMonitoringData.monitor_info.notify_phone);
      this.automaticMonitoringData.monitor_info.notify_email = data.notify_email && data.notify_email ? Object.assign({}, data.notify_email) : Object.assign({}, this.copy_automaticMonitoringData.monitor_info.notify_email);

      this.automaticMonitoringData.monitor_info.monitor_interval = data.monitor_interval ? data.monitor_interval * 1 : null;

      this.emails = this.getStringByArray(data.notify_email && data.notify_email ? data.notify_email.email : []);

      if (data.monitor_action) {
        this.automaticMonitoringData.monitor_info.monitor_action = data.monitor_action; // 投放状态
      }

      if (data.monitor_metric.length) {
        this.automaticMonitoringData.monitor_info.monitor_metric = data.monitor_metric; // 监测指标
      }

    }


  }

  changeEmail() {
    this.email_warning = false;
  }


  change_publisher() {
    this.getMonitorList(this.automaticMonitoringData.monitor_info.publisher_id * 1, this.summaryType);
  }

  getStringByArray(dataArray) {
    let dataString = "";
    if (dataArray && dataArray.length > 0) {
      dataString = dataArray.join('\n');
    }
    return dataString;
  }
  checkPage() {
    if (!this.automaticMonitoringData.monitor_info['publisher_id']) {
      this.iswraing = true;
      return false;
    }


    if (this.monitor_group_action === 2 && !this.automaticMonitoringData.monitor_info.monitor_name) {
      this.iswraing = true;
      return false;
    }
    if (this.monitor_group_action === 2) { //新建
      this.automaticMonitoringData.monitor_info.monitor_id = null;
    }

    if (this.monitor_group_action === 1 && !this.automaticMonitoringData.monitor_info.monitor_id) {
      this.iswraing = true;
      return false;
    }
    if (this.monitor_group_action === 1 && this.automaticMonitoringData.monitor_info.monitor_id) {
      this.monitor_group_model.forEach(item => {
        if (item['monitor_id'] === this.automaticMonitoringData.monitor_info.monitor_id) {
          this.automaticMonitoringData.monitor_info.monitor_name = item['monitor_name'];
        }
      });
    }

    if (!this.automaticMonitoringData.monitor_info['monitor_interval']) {
      this.iswraing = true;
      return false;
    }

    //监测指标
    if (this.automaticMonitoringData.monitor_info.monitor_metric) {
      this.automaticMonitoringData.monitor_info.monitor_metric.forEach((item) => {
        item['rule_define'].forEach((target) => {
          if (!this.iswraing) {
            if (target.comparison_value <= 0) {
              this.iswraing = true;
              this.message.warning('监测指标：值必须为大于0的数', { nzDuration: 3000 });
              return false;
            }
          }
        });
      });
    }

    //通知邮箱
    if (this.automaticMonitoringData.monitor_info.notify_email.is_notify && !this.emails) {
      this.iswraing = true;
      return false;
    }

    if (this.automaticMonitoringData.monitor_info.notify_email.is_notify && this.emails) {
      this.automaticMonitoringData.monitor_info.notify_email.email = [];
      this.automaticMonitoringData.monitor_info.notify_email.email = this.getTextareaArray(this.emails);
      this.automaticMonitoringData.monitor_info.notify_email.email.forEach(item => {
        if (!this.reg.test(item)) {
          this.iswraing = true;
          this.email_warning = true;
          return false;
        }

      });
    }

    //通知手机
    if (this.automaticMonitoringData.monitor_info.notify_phone.is_notify && !this.automaticMonitoringData.monitor_info.notify_phone.phone) {
      this.iswraing = true;
      return false;
    }
    if (this.automaticMonitoringData.monitor_info.notify_phone.is_notify && !this.myreg.test(this.automaticMonitoringData.monitor_info.notify_phone.phone)) {
      this.iswraing = true;
      return false;
    }

  }
  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {

        this.automaticMonitoringData.monitor_info.monitor_status = this.monitor_status;
        if (this.parentData.selected_type === 'all') {
          this.automaticMonitoringData.monitor_detail.select_type = 'all';
          this.automaticMonitoringData.monitor_detail['sheets_setting'] = {
            'table_setting': this.parentData.allViewTableData
          };
        } else {
          this.automaticMonitoringData.monitor_detail.select_type = 'current';

          this.automaticMonitoringData.monitor_detail['details'] = this.idsArray;
        }

        this.editMonitor(this.automaticMonitoringData);


      }
    }
  }

  editMonitor(data) {
    this.is_saving.emit({
      'is_saving': true,
      'isHidden': 'true'
    });
    this._http.editMonitor(data).subscribe(
      (result: any) => {
        this.is_saving.emit({
          'is_saving': false,
          'isHidden': 'true'
        });
        if (result.status_code === 200) {
          this.message.success("提交成功");
          this.is_saving.emit({
            'is_saving': false,
            'isHidden': 'false'
          });
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      }, err => {
        this.is_saving.emit({
          'is_saving': false,
          'isHidden': 'true'
        });
      }, () => {

      }
    );
  }

  itemTypeRelationChange($event, indexI, indexJ) {
    this.automaticMonitoringData.monitor_info.monitor_metric[indexI].rule_define[indexJ] = { ...this.automaticMonitoringData.monitor_info.monitor_metric[indexI].rule_define[indexJ], ...this.itemTypeDataDetail[$event][0] };
  }

  itemTypeDataDetailChange($event, indexI, indexJ) {
    const item = this.automaticMonitoringData.monitor_info.monitor_metric[indexI].rule_define[indexJ];
    const exit = this.itemTypeDataDetail[item.data_type].find((i) => {
      return item.key === i.key;
    });
    if (exit !== undefined) {
      exit.comparison_operation = '<=';
      this.automaticMonitoringData.monitor_info.monitor_metric[indexI].rule_define[indexJ] = { ...this.automaticMonitoringData.monitor_info.monitor_metric[indexI].rule_define[indexJ], ...exit };
    }
  }

  // 添加监测指标
  onAddMonitorItem(isSub, indexI, indexJ) {
    const addSubItem = {
      "key": "pub_impression",
      "name": "展现",
      "real_time": false,
      "data_type": "pub_metric_data",
      "comparison_value": null,
      "comparison_operation": ">="
    };
    const addItem = {
      "rule_define": [
        {
          "key": "pub_impression",
          "name": "展现",
          "real_time": false,
          "data_type": "pub_metric_data",
          "comparison_value": null,
          "comparison_operation": ">="
        }
      ]
    };
    if (isSub) {
      this.automaticMonitoringData.monitor_info.monitor_metric[indexI]['rule_define'].splice(indexJ + 1, 0, addSubItem);
    } else {
      this.automaticMonitoringData.monitor_info.monitor_metric.splice(indexI + 1, 0, addItem);
    }
  }

  // 删除监测指标
  onDeleteMonitorItem(isSub, indexI, indexJ) {
    if (isSub) {
      this.automaticMonitoringData.monitor_info.monitor_metric[indexI]['rule_define'].splice(indexJ, 1);
    } else {
      this.automaticMonitoringData.monitor_info.monitor_metric.splice(indexI, 1);
    }
  }

  operationTrack(index, item) {
    return index + "_" + item.key;
  }

}
