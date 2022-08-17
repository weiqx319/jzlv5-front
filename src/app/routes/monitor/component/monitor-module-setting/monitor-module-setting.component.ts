import { Component, OnInit } from '@angular/core';
import { MonitorService } from "../../service/monitor.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from "@angular/router";
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";
import { isArray } from "@jzl/jzl-util";
import { MenuService } from '../../../../core/service/menu.service';

@Component({
  selector: 'app-monitor-module-setting',
  templateUrl: './monitor-module-setting.component.html',
  styleUrls: ['./monitor-module-setting.component.scss']
})
export class MonitorModuleSettingComponent implements OnInit {

  constructor(private monitorService: MonitorService,
    private menuService: MenuService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private customDataService: CustomDatasService,

  ) {
    this.monitor_id = this.route.snapshot.parent.paramMap.get('id');
    this.publisherOption = this.monitorService.publisherOption;
    this.monitor_operation = this.monitorService.monitor_operation;
    this.monitor_rate = this.monitorService.monitor_rate;
  }
  public publisherOption: any;
  public selectedIndex = 0;
  public saveing = false;
  public emails = '';
  public iswraing = false;
  public email_warning = false;

  public monitor_id: any;
  public myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
  public reg = /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;

  public monitor_rate = [];
  public monitor_operation = [];
  public startTimeArray = [];
  public endTimeArray = [];
  public copy_info: any;

  public average_value: null;
  public max_value: null;
  public info = {
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



  public metricTypeRelationByChannel = {};
  public metricListByChannel = {};




  ngOnInit() {
    this.copy_info = JSON.parse(JSON.stringify(this.info));
    this.monitorDetail();
    this.startTimeArray = this.getDateList(0, 9);
    this.endTimeArray = this.getDateList(9, 23);

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
    const metricChannelKeyData = this.menuService.currentChannelId + '_' + this.menuService.currentPublisherId;

    if (this.metricTypeRelationByChannel.hasOwnProperty(metricChannelKeyData)) {
      this.itemTypeRelation = [
        ...this.itemTypeCopyRelation,
        ...this.metricTypeRelationByChannel[metricChannelKeyData]
      ];

      this.itemTypeDataDetail = {
        ...this.itemDetailDefault,
        ...this.metricListByChannel[metricChannelKeyData],
      };

    } else {
      this.itemTypeRelation = [...this.itemTypeCopyRelation];
      this.itemTypeDataDetail = {
        ...this.itemDetailDefault,
      };
    }


  }


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


      if (this.info.monitor_info.monitor_module == 'account' && this.menuService.currentChannelId != 1) {
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



  monitorDetail() {

    this.monitorService.getMonitorDetail(this.monitor_id).subscribe((result) => {

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
  initMonitor(data) {
    this.info.monitor_info.publisher_id = data.publisher_id;
    this.info.monitor_info.channel_id = data.channel_id;
    this.info.monitor_info.monitor_module = data.monitor_module;
    this.info.monitor_info.is_repeat_alarm = data.is_repeat_alarm;
    this.info.monitor_info.monitor_name = data.monitor_name;
    this.info.monitor_info.monitor_id = data.monitor_id;

    this.info.monitor_info.notify_phone = data.notify_phone ? Object.assign({}, data.notify_phone) : Object.assign({}, this.copy_info.monitor_info.notify_phone);

    this.startTimeArray = this.getDateList(0, this.info.monitor_info.notify_phone['notify_hour_start']);
    this.endTimeArray = this.getDateList(this.info.monitor_info.notify_phone['notify_hour_start'], 23);

    this.info.monitor_info.notify_email = data.notify_email && data.notify_email ? Object.assign({}, data.notify_email) : Object.assign({}, this.copy_info.monitor_info.notify_email);

    this.info.monitor_info.monitor_interval = data.monitor_interval ? data.monitor_interval * 1 : null;

    this.emails = this.getStringByArray(data.notify_email && data.notify_email ? data.notify_email.email : []);

    if (data.monitor_action) {
      this.info.monitor_info.monitor_action = data.monitor_action; // 投放状态
    }

    if (data.monitor_metric.length) {
      this.info.monitor_info.monitor_metric = data.monitor_metric; // 监测指标
    }

    if (this.info.monitor_info.monitor_module === 'account') {
      this.itemDetailDefault.pub_metric_data.unshift(
        { key: 'balance', name: '余额', real_time: true, data_type: 'pub_metric_data' }
      );
    }
  }

  changeStartTime() {
    this.endTimeArray = this.getDateList(0, 23).splice(this.info.monitor_info.notify_phone.notify_hour_start * 1, this.getDateList(0, 23).length - 1);
  }
  getStringByArray(dataArray) {
    let dataString = "";
    if (dataArray && dataArray.length > 0) {
      dataString = dataArray.join('\n');
    }
    return dataString;
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


  changeEmail() {
    this.email_warning = false;
  }


  checkPage() {
    this.email_warning = false;
    if (!this.info.monitor_info['monitor_interval']) {
      this.iswraing = true;
      return false;
    }

    //监测指标
    if (this.info.monitor_info.monitor_metric) {
      this.info.monitor_info.monitor_metric.forEach((item) => {
        item['rule_define'].forEach((target) => {
          if (target.comparison_value <= 0 && !this.iswraing) {
            this.iswraing = true;
            this.message.warning('监测指标：值必须为大于0的数', { nzDuration: 3000 });
            return false;
          }
        });
      });
    }

    //通知邮箱
    if (this.info.monitor_info.notify_email.is_notify && !this.emails) {
      this.iswraing = true;
      return false;
    }

    if (this.info.monitor_info.notify_email.is_notify && this.emails) {
      this.info.monitor_info.notify_email.email = [];
      this.info.monitor_info.notify_email.email = this.getTextareaArray(this.emails);
      this.info.monitor_info.notify_email.email.forEach(item => {
        if (!this.reg.test(item)) {
          this.iswraing = true;
          this.email_warning = true;
          return false;
        }

      });
    }
    //通知手机
    if (this.info.monitor_info.notify_phone.is_notify && !this.info.monitor_info.notify_phone.phone) {
      this.iswraing = true;
      return false;
    }
    if (this.info.monitor_info.notify_phone.is_notify && !this.myreg.test(this.info.monitor_info.notify_phone.phone)) {
      this.iswraing = true;
      return false;
    }

  }

  _save(status) {
    this.iswraing = false;
    this.checkPage();
    if (!this.iswraing) {
      if (!this.saveing) {
        this.saveing = true;
        this.info.monitor_info.monitor_status = status;


        this.saveMonitor(this.info);

      }

    }
  }

  saveMonitor(data) {
    this.monitorService.editMonitor(data).subscribe(
      (result: any) => {
        this.saveing = false;
        if (result.status_code === 200) {
          this.message.success("提交成功");
          this.monitorService.setMonitorRefresh(this.monitor_id);
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          // this.message.error('系统异常，请重试');
          this.message.error(result.message);
        } else if (result['status_code'] && result.status_code === 205) {//未做任何操作
        } else {
          this.message.error(result.message);
        }
      }, err => {
        this.saveing = false;
      }, () => {
        this.saveing = false;
      }
    );
  }

  itemTypeRelationChange($event, indexI, indexJ) {
    this.info.monitor_info.monitor_metric[indexI].rule_define[indexJ] = { ...this.info.monitor_info.monitor_metric[indexI].rule_define[indexJ], ...this.itemTypeDataDetail[$event][0] };
  }

  itemTypeDataDetailChange($event, indexI, indexJ) {
    const item = this.info.monitor_info.monitor_metric[indexI].rule_define[indexJ];
    const exit = this.itemTypeDataDetail[item.data_type].find((i) => {
      return item.key === i.key;
    });
    if (exit !== undefined) {
      if (exit.real_time) {
        exit.comparison_operation = '<=';
      }
      this.info.monitor_info.monitor_metric[indexI].rule_define[indexJ] = { ...this.info.monitor_info.monitor_metric[indexI].rule_define[indexJ], ...exit };
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
      this.info.monitor_info.monitor_metric[indexI]['rule_define'].splice(indexJ + 1, 0, addSubItem);
    } else {
      this.info.monitor_info.monitor_metric.splice(indexI + 1, 0, addItem);
    }
  }

  // 删除监测指标
  onDeleteMonitorItem(isSub, indexI, indexJ) {
    if (isSub) {
      this.info.monitor_info.monitor_metric[indexI]['rule_define'].splice(indexJ, 1);
    } else {
      this.info.monitor_info.monitor_metric.splice(indexI, 1);
    }
  }

  operationTrack(index, item) {
    return index + "_" + item.key;
  }

}


