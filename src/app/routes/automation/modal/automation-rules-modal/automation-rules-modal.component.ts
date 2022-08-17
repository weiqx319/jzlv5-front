import { deepCopy } from '@jzl/jzl-util';
import { Component, Input, OnInit } from '@angular/core';
import { AutomationService } from '../../service/automation.service'

@Component({
  selector: 'app-automation-rules-modal',
  templateUrl: './automation-rules-modal.component.html',
  styleUrls: ['./automation-rules-modal.component.scss']
})
export class AutomationRulesModalComponent implements OnInit {
  @Input() triggerConditions = deepCopy(this.automationService.action.triggerConditions);
  @Input() actionParent;
  @Input() actionIndex;
  // select选择器选项
  public selectOptions = this.automationService.selectOptions;
  // 媒体数据
  public triggerMetricGroup = this.automationService.triggerMetricGroup;
  public metricOptions = this.automationService.metricOptions;
  public tacticLevel = this.automationService.currentStrategyObj.strategyInfo.tacticLevel;

  public operatorOptions = this.selectOptions.operator.options;
  public timeSelect = this.selectOptions.time;
  public addAreaColors = ['#b6dee2', '#dcceff', '#b0c5f3', '#9ee0ff', '#ebe3d2'];

  constructor(private automationService: AutomationService,) { }


  ngOnInit(): void {
    this.changeMetric();
    this.changeDynamicMetric();
    this.changeTime();
    this.changeDynamicTime();
  }

  // 修改指标数据
  changeMetric() {
    if (this.triggerConditions.settings) {
      for (const key in this.metricOptions) {
        this.metricOptions[key].forEach(item => {
          if (item.key === this.triggerConditions.settings['metricId']) {
            this.triggerConditions.settings['metricName'] = item.name;
            this.triggerConditions.settings['isRate'] = item.is_rate;
            this.triggerConditions.settings['noTime'] = item.noTime;
          }
        });
      }
    }
  }

  // 修改动态计算中的指标数据
  changeDynamicMetric() {
    if (this.triggerConditions.settings) {
      for (const key in this.metricOptions) {
        this.metricOptions[key].forEach(item => {
          if (item.key === this.triggerConditions.settings['dynamic_metricId']) {
            this.triggerConditions.settings['dynamic_metricName'] = item.name;
            this.triggerConditions.settings['dynamic_isRate'] = item.is_rate;
            this.triggerConditions.settings['dynamic_noTime'] = item.noTime;
          }
        });
      }
    }
  }

  // 修改数据分类
  changeMetricGroup() {
    this.triggerConditions.settings['metricId'] = this.metricOptions[this.triggerConditions.settings['metricGroup']][0].key
    this.changeMetric();
  }
  // 修改动态数据分类
  changeDynamicMetricGroup() {
    this.triggerConditions.settings['dynamic_metricId'] = this.metricOptions[this.triggerConditions.settings['dynamic_metricGroup']][0].key
    this.changeDynamicMetric();
  }

  // 修改action中时间
  changeTime() {
    if (this.triggerConditions.settings) {
      this.timeSelect.options.forEach(item => {
        if (item.value === this.triggerConditions.settings['time']) {
          this.triggerConditions.settings['timeLabel'] = item.label;
        }
      });
    }
  }
  // 修改action中动态时间
  changeDynamicTime() {
    if (this.triggerConditions.settings) {
      this.timeSelect.options.forEach(item => {
        if (item.value === this.triggerConditions.settings['dynamic_time']) {
          this.triggerConditions.settings['dynamic_timeLabel'] = item.label;
        }
      });
    }
  }

  // 修改逻辑门
  changeRelation(triggerConditions) {
    if (triggerConditions.logicGate === 'and') {
      triggerConditions.logicGate = 'or'
    } else if (triggerConditions.logicGate === 'or') {
      triggerConditions.logicGate = 'and'
    };
  }

  // 添加规则
  addRule(triggerConditions) {
    if (triggerConditions.level === 4) return;
    if (!triggerConditions.isGroup) {
      triggerConditions.isGroup = true;
      triggerConditions.logicGate = 'and';
      triggerConditions.group.push({
        isGroup: false,
        level: triggerConditions.level + 1,
        group: [],
        settings: triggerConditions.settings,
      })
      delete triggerConditions.settings;
      triggerConditions.group.push({
        isGroup: false,
        level: triggerConditions.level + 1,
        group: [],
        settings: deepCopy(this.automationService.action.triggerConditions.settings)
      })
    } else {
      triggerConditions.group.push({
        isGroup: false,
        level: triggerConditions.level + 1,
        group: [],
        settings: deepCopy(this.automationService.action.triggerConditions.settings)
      })
    }
  }

  // 复制规则
  copyRule(triggerConditions, actionIndex, actionParent) {
    if (actionParent) {
      actionParent.group.splice(actionIndex, 0, deepCopy(triggerConditions));
    } else {
      triggerConditions.isGroup = true;
      triggerConditions.logicGate = 'and';
      triggerConditions.group.push(
        {
          isGroup: false,
          level: triggerConditions.level + 1,
          group: [],
          settings: triggerConditions.settings,
        },
        {
          isGroup: false,
          level: triggerConditions.level + 1,
          group: [],
          settings: deepCopy(triggerConditions.settings),
        },
      )
      delete triggerConditions.settings;
    }
  }

  // 删除规则
  deleteRule(actionIndex, actionParent) {
    if (!actionParent) return;
    if (actionParent.group.length > 1) {
      actionParent.group.splice(actionIndex, 1);
      if (actionParent.group.length === 1) {
        const actionParentNew = actionParent.group[0];
        actionParentNew.level = actionParent.level;
        for (const key in actionParent) {
          delete actionParent[key];
        }
        Object.assign(actionParent, actionParentNew);
      }
    }
  }

}
