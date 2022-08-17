import { Injectable } from '@angular/core';
import { deepCopy } from '@jzl/jzl-util';
import { HttpClientService } from '../../../core/service/http.client';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CustomDatasService } from "../../../shared/service/custom-datas.service";
import { parse, subDays } from 'date-fns';
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AutomationService {
  public currentDate = new Date();
  // 初始数据
  public automationRenderData = deepCopy(this.customDatasService.automationRenderData);

  public action = {
    action_id: "",
    action_name: '',
    can_no_rules: false,
    no_rules: false,
    action_settings: {},
    triggerConditions: {
      isGroup: false,
      level: 0,
      group: [],
      logicGate: 'and',
      settings: {
        metricGroup: '',
        metricId: '',
        isRate: false,
        metricName: '',
        time: null,
        timeLabel: '',
        operator: '=',
        value: null,
        isDynamic: false,
        factor: 1,//系数
        dynamic_metricGroup: '',
        dynamic_metricId: '',
        dynamic_isRate: false,
        dynamic_metricName: '',
        dynamic_time: null,
        dynamic_timeLabel: '',
      }
    }
  };
  public strategy_info = {
    tacticId: null,
    tacticType: '',
    tacticTitle: '',
    tacticDescription: '',
    tacticLevel: '',
    tacticLevelName: '',
    tactic_entities: [],
    tactic_entity_type: 2,
    tactic_entity_conditions: [],
    tactic_info: {
      tactic_rule: [
        deepCopy(this.action)
      ],
      tactic_name: '',
      tactic_time_type: 1,
      tactic_time_interval: [subDays(this.currentDate, +0), subDays(this.currentDate, -7)],
      running_frequency: 15,
      running_day: [
        "week_1",
        "week_2",
        "week_3",
        "week_4",
        "week_5",
        "week_6",
        "week_7",
      ],
      running_time: ['', ''],
      running_time_start: null,
      running_time_end: null,
      running_time_fixed: null,
    }
  };

  // level
  public tacticLevelList = this.automationRenderData['effect_tactic_level'];
  public tacticLevelObj = {};

  // 自动化策略分类列表
  public automationStrategy = {
    tacticIcon: {
      custom: 'calculator', // 自定义
      create: 'plus', // 自定义-创建
      increase: 'rocket', // 增长
      decrease: 'fall', // 减少
      stop_loss: 'flag', // 止损
      revive: 'play-square' // 重启
    },
    tacticLevelColor: {
      campaign: '#7654c8',
      adgroup: '#d964c5',
    },
    // 策略列表
    strategyList: [
      // {
      //   strategyTitle: '预置策略',
      //   strategyType: 'preset',//预置
      //   list: [
      //     {
      //       tacticType: 'increase',
      //       tacticTitle: '增加',
      //       tacticDescription: 'SURF 可识别强劲的性能趋势，并通过将可用广告组预算增加到超出原始限制来自动利用积极势头。预算将在选定的当地时间自动重置。',
      //       tacticLevel: 'campaign',
      //       tacticLevelName: '推广组级别',
      //       tactic_info: {}
      //     },
      //     {
      //       tacticType: 'decrease',
      //       tacticTitle: '减少',
      //       tacticDescription: 'SURF 可识别强劲的性能趋势，并通过将可用广告组预算增加到超出原始限制来自动利用积极势头。预算将在选定的当地时间自动重置。',
      //       tacticLevel: 'campaign',
      //       tacticLevelName: '推广组级别',
      //       tactic_info: {}
      //     },
      //   ]
      // },
      {
        strategyTitle: '自定义策略',
        strategyType: 'custom',//预置
        list: [
          {
            tacticId: null,
            tacticType: 'create',
            tacticTitle: '创建自定义策略',
            tacticDescription: '自定义策略使您能够从头开始创建策略。从您希望策略触发的任务列表中进行选择。更改状态、预算、广告组名称、出价测试、重复等。',
            tacticLevel: '',
            tacticLevelName: '',
            tactic_entities: [],
            tactic_entity_type: 2,
            tactic_entity_conditions: [],
            tactic_info: {
              tactic_rule: [
                deepCopy(this.action)
              ],
              tactic_name: '',
              tactic_time_type: 1,
              tactic_time_interval: [subDays(this.currentDate, +0), subDays(this.currentDate, -7)],
              running_frequency: 15,
              running_day: [
                "week_1",
                "week_2",
                "week_3",
                "week_4",
                "week_5",
                "week_6",
                "week_7",
              ],
              running_time: ['', ''],
              running_time_start: null,
              running_time_end: null,
              running_time_fixed: null,
            },
          },
        ]
      },
    ],
    // 特性列表
    featureList: [
      {
        featureIcon: 'alert',
        featureTitle: '1 . 策略和最佳实践',
        featureDescription: '多个广告购买自动化规则和策略封装成单一策略'

      },
      {
        featureIcon: 'control',
        featureTitle: '2 . 实时优化',
        featureDescription: '虽然市场标准是 15/30 分钟进行定期检查，但 自动化策略 规则实时触发'
      },
      {
        featureIcon: 'line-chart',
        featureTitle: '3 . 动态规则',
        featureDescription: '根据在性能波动时保持相关性的动态字段设置规则'
      },

    ]
  }

  public selectOptions = {
    measuring_unit: {
      options: [
        { value: 'percent', label: '百分比' },
        { value: 'value', label: '固定值' }
      ]
    },
    frequency_limit: {
      options: [
        { "label": "15分钟", "value": "15" },
        { "label": "30分钟", "value": "30" },
        { "label": "60分钟", "value": "60" },
        { "label": "3小时", "value": "180" },
        { "label": "6小时", "value": "360" },
        { "label": "12小时", "value": "720" },
        { "label": "一天一次", "value": "1440" },
        { "label": "两天一次", "value": "2160" },
        { "label": "三天一次", "value": "4320" },
        { "label": "仅执行一次", "value": "131760000" }
      ]
    },
    operator: {
      options: [
        { key: '=', name: '=' },
        { key: '>=', name: '>=' },
        { key: '<=', name: '<=' },
        { key: '>', name: '>' },
        { key: '<', name: '<' },
      ]
    },
    running_day: {
      options: [
        {
          title: '全选（每天）',
          value: 'all',
          key: 'all',
          children: [
            {
              title: '每周一',
              value: 'week_1',
              key: 'week_1',
              isLeaf: true
            },
            {
              title: '每周二',
              value: 'week_2',
              key: 'week_2',
              isLeaf: true
            },
            {
              title: '每周三',
              value: 'week_3',
              key: 'week_3',
              isLeaf: true
            },
            {
              title: '每周四',
              value: 'week_4',
              key: 'week_4',
              isLeaf: true
            },
            {
              title: '每周五',
              value: 'week_5',
              key: 'week_5',
              isLeaf: true
            },
            {
              title: '每周六',
              value: 'week_6',
              key: 'week_6',
              isLeaf: true
            },
            {
              title: '每周日',
              value: 'week_7',
              key: 'week_7',
              isLeaf: true
            },
          ]
        },
      ]
    },
    running_frequency: {
      options: [
        { label: '每15分钟', value: 15 },
        { label: '每30分钟', value: 30 },
        { label: '每60分钟', value: 60 },
        { label: '每120分钟', value: 120 },
        { label: '固定时间（一天一次）', value: 1440 },
      ]
    },
    time: this.automationRenderData['time_select'],
  }

  public actionElements = this.automationRenderData['action_elements'];
  public actionTypeList = this.automationRenderData.action_list?.level;

  // 不同任务类型的配置项信息
  public actionSettings = {};
  // 页面错误提示
  public errorValidObj = {
    running_day: 'success',
    tactic_name: 'success'
  }

  // 当前选择创建的策略对象
  public currentStrategyObj = {
    strategyType: 'custom',
    strategyInfo: deepCopy(this.strategy_info),
  };


  public triggerMetricGroup = this.automationRenderData['trigger_metric_group'];
  public metricOptions = {};
  public actionIconObj = {
    "pause_action": { icon: 'poweroff', bgColor: '#c1c5cd' },
    "start_action": { icon: 'poweroff', bgColor: '#81d5b2' },
    "increase_budget_action": { icon: 'rise', bgColor: '#749aed' },
    "decrease_budget_action": { icon: 'fall', bgColor: '#ad91f7' }
  }
  public presetCustomTacticList = [];
  constructor(
    private _httpClient: HttpClientService,
    private customDatasService: CustomDatasService,
    private message: NzMessageService,
    private router: Router,
  ) {
    this.setActionElementSetting();
    this.getTriggerMetricData();

    this.tacticLevelList.forEach(level => {
      this.tacticLevelObj[level.key] = level.name;
    });

  }

  // 设置自定义预置策略模板
  setCustomPresetStrategy() {
    this.getTacticTemplateList().subscribe((results: any) => {
      if (results.status_code === 200) {
        this.presetCustomTacticList = results['data'];
        let customStrategy = this.automationStrategy.strategyList.find((strategy) => strategy.strategyType === 'custom');
        customStrategy.list.length = 1;
        this.presetCustomTacticList.forEach(tactic => {
          if (tactic.strategy === 'custom') {
            const preCustomTactic = {
              tacticId: null,
              tacticType: '',
              tacticTitle: tactic.tactic_name,
              tacticDescription: tactic.tactic_desc,
              tacticLevel: tactic.tactic_level,
              tacticLevelName: this.tacticLevelObj[tactic.tactic_level] + '级别',
              tactic_entities: [],
              tactic_entity_type: tactic.tactic_entity_type,
              tactic_entity_conditions: [],
              tactic_info: deepCopy(tactic),
            }
            preCustomTactic['tactic_info']['tactic_rule'] = JSON.parse(preCustomTactic['tactic_info']['tactic_rule']);
            customStrategy.list.push(preCustomTactic);
          }
        });
      } else {
        this.message.error(results.message);
      }
    }
    );
  }

  // 设置不同任务类型的配置项信息
  setActionElementSetting() {
    const actionElementSetting = {};
    // 处理actionElementSetting
    for (const key in this.automationRenderData['action_list']) {
      actionElementSetting[key] = {}
      this.automationRenderData['action_list'][key].forEach(element => {
        actionElementSetting[key][element.action_id] = element.action_element_param;
      });
    }

    // 处理actionSettings
    for (const level in actionElementSetting) {
      this.actionSettings[level] = {};
      for (const key in actionElementSetting[level]) {
        this.actionSettings[level][key] = [];
        actionElementSetting[level][key].forEach(element => {
          const settingItem = []
          element.forEach(item => {
            const element = deepCopy(this.actionElements[item.elementId]);
            for (const k in item.params) {
              element[k] = item.params[k];
            }
            settingItem.push(element);
          });
          this.actionSettings[level][key].push(settingItem)
        });
      }
    }
  }

  // 获取媒体数据
  getTriggerMetricData() {
    const initAllPubData = this.customDatasService.getInitCustomFeedData()._initAllPubData;

    for (const key in this.metricOptions) {
      delete this.metricOptions[key];
    }

    // this.metricOptions = {}
    this.triggerMetricGroup.forEach(metricGroup => {
      this.metricOptions[metricGroup.key] = [];
      // if (metricGroup.key === 'pub_attr_data') {
      //   this.metricOptions['pub_attr_data'] = this.automationRenderData['trigger_metric'];
      // }
    });

    initAllPubData.forEach(item => {
      if (this.metricOptions[item.data_type] && item.data_type !== 'pub_attr_data') {
        this.metricOptions[item.data_type].push(item);
      }
    });
  }

  // 获取媒体属性数据pub_attr_data
  getTriggerPubAttrData(tactic_level) {
    this.metricOptions['pub_attr_data'] = this.automationRenderData['trigger_metric'][tactic_level];
  }

  // 设置策略详情数据
  setTacticDetailData(data) {
    const currentStrategyObj = this.currentStrategyObj;
    currentStrategyObj.strategyType = data.strategy;
    currentStrategyObj.strategyInfo['tacticType'] = data.strategy;
    currentStrategyObj.strategyInfo['tacticTitle'] = data.tactic_name;
    currentStrategyObj.strategyInfo['tacticLevel'] = data.tactic_level;
    currentStrategyObj.strategyInfo['tacticLevelName'] = this.tacticLevelObj[data.tactic_level];
    currentStrategyObj.strategyInfo['tactic_entities'].length = 0;
    currentStrategyObj.strategyInfo['tactic_entities'].push(...[]);
    currentStrategyObj.strategyInfo['tactic_entity_conditions'].push(...[]);
    currentStrategyObj.strategyInfo['tactic_entity_type'] = data.tactic_entity_type;
    currentStrategyObj.strategyInfo['tactic_info']['tactic_rule'] = Array.isArray(data.tactic_rule) ? deepCopy(data.tactic_rule) : JSON.parse(data.tactic_rule);
    currentStrategyObj.strategyInfo['tactic_info']['tactic_name'] = data.tactic_name;
    currentStrategyObj.strategyInfo['tactic_info']['tactic_time_type'] = data.tactic_time_type;
    currentStrategyObj.strategyInfo['tactic_info']['running_frequency'] = data.running_frequency;
    currentStrategyObj.strategyInfo['tactic_info']['running_day'] = JSON.parse(data.running_day);
    currentStrategyObj.strategyInfo['tactic_info']['running_time'] = JSON.parse(data.running_time);
    currentStrategyObj.strategyInfo['tactic_info']['running_time_start'] = parse(JSON.parse(data.running_time)[0], 'HH:mm', new Date());
    currentStrategyObj.strategyInfo['tactic_info']['running_time_end'] = JSON.parse(data.running_time)[1] ? parse(JSON.parse(data.running_time)[1], 'HH:mm', new Date()) : parse('23:59', 'HH:mm', new Date());
    currentStrategyObj.strategyInfo['tactic_info']['running_time_fixed'] = parse(JSON.parse(data.running_time)[0], 'HH:mm', new Date());

    if (data.tactic_time_type === 2) {
      currentStrategyObj.strategyInfo.tactic_info.tactic_time_interval = [new Date(data.tactic_time_start), new Date(data.tactic_time_end)];
    }
    // 获取媒体属性数据
    this.getTriggerPubAttrData(data.tactic_level);

    // 获取任务配置详情数据
    currentStrategyObj.strategyInfo['tactic_info']['tactic_rule'].forEach(action => {
      if (action.action_id) {
        this.setActionSettings(action, true);
      }
    });
  }

  // 获取任务配置详情数据
  setActionSettings(action, edit?) {
    // 根据action_id获取action_name
    this.automationRenderData['action_list'][this.currentStrategyObj.strategyInfo.tacticLevel].forEach(actionType => {
      if (actionType.action_id === action.action_id) {
        action.action_name = actionType.action_name;
        action['can_no_rules'] = actionType['can_no_rules'];
      }
    })

    if (!edit || action['no_rules'] === undefined) {
      // 无模板新建或者之前action['no_rules']不存在
      action['no_rules'] = false;
    }

    let oldActionSettings = deepCopy(action.action_settings)

    // 清空action_settings
    for (const key in action.action_settings) {
      delete action.action_settings[key];
    };

    if (this.actionSettings[this.currentStrategyObj.strategyInfo.tacticLevel][action.action_id]) {
      this.actionSettings[this.currentStrategyObj.strategyInfo.tacticLevel][action.action_id].forEach((actionLine) => {
        actionLine.forEach(setting => {
          const actionSetting = {};
          if (setting.isOptional) {
            if (edit && oldActionSettings[setting.inputElementId]) {
              let oldIsEnabled = oldActionSettings[setting.inputElementId]['isEnabled'];
              actionSetting['isEnabled'] = oldIsEnabled === undefined ? 'true' : oldIsEnabled;
            } else {
              actionSetting['isEnabled'] = true;
            }
          }
          setting.valueGroup.forEach(value => {
            if (!value.inputValueId) return;
            if (edit && oldActionSettings[setting.inputElementId] && oldActionSettings[setting.inputElementId][value.inputValueId]) {
              actionSetting[value.inputValueId] = oldActionSettings[setting.inputElementId][value.inputValueId];
            } else {
              if (setting['defaultValue'] && setting['defaultValue'][value.inputValueId]) {
                // 如果设置了默认值defaultValue
                actionSetting[value.inputValueId] = setting['defaultValue'][value.inputValueId];
              } else {
                actionSetting[value.inputValueId] = value.value;
              }
            }
          });
          action.action_settings[setting.inputElementId] = actionSetting;
        });
      });
    }

    // 占位符，无前端意义
    if (Object.values(action.action_settings).length == 0) {
      action.action_settings['placeHolder'] = '';
    }

  }


  // 列表
  getTacticList(body, params): any {
    const url = "/automation/tactic/list";
    return this._httpClient.post(url, body, params);
  }
  // 详情
  getTacticDetail(tacticID): any {
    const url = "/automation/tactic/" + tacticID;
    return this._httpClient.get(url);
  }

  // 编辑修改
  updateTactic(tacticID, body): any {
    const url = "/automation/tactic/" + tacticID;
    return this._httpClient.put(url, body);
  }

  // 删除
  deleteTactic(body): any {
    const url = "/automation/tactic";
    return this._httpClient.delete(url, body);
  }

  // 创建
  createTactic(body, params?): any {
    const url = "/automation/tactic";
    return this._httpClient.post(url, body, params);
  }
  // 更新状态
  updateTacticStatus(tacticID, body): any {
    const url = "/automation/tactic/" + tacticID + '/update_status';
    return this._httpClient.patch(url, body);
  }


  // 获取实体列表
  getTacticEntitiesList(tacticId, body, params): any {
    const url = `/automation/tactic/${tacticId}/entities_list`;
    return this._httpClient.post(url, body, params);
  }

  // 删除实体
  deleteTacticEntities(tacticId, body): any {
    const url = `/automation/tactic/${tacticId}/del_entities`;
    return this._httpClient.delete(url, body);
  }

  // 获取日志列表
  getTacticLogList(tacticId, body, params): any {
    const url = `/automation/tactic/${tacticId ? tacticId + '/' : ''}log_list`;
    return this._httpClient.post(url, body, params);
  }

  // // 获取日志列表
  // getTacticLogList(tacticId, body, params): any {
  //   const url = `/automation/tactic/${tacticId}/log_list`;
  //   return this._httpClient.post(url, body, params);
  // }

  // // 获取全部日志列表
  // getTacticsLogs(body, params): any {
  //   const url = `/automation/tactic/log_list`;
  //   return this._httpClient.post(url, body, params);
  // }

  // 获取策略模板列表
  getTacticTemplateList() {
    const url = "/automation/tactic_template/list";
    return this._httpClient.get(url);
  }
  //根据id获取策略模板
  getTacticTemplate(tacticTemplateId) {
    const url = "/automation/tactic_template/" + tacticTemplateId;
    return this._httpClient.get(url);
  }

}
