import { deepCopy } from '@jzl/jzl-util';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AutomationService } from '../../../../service/automation.service'
import { format, parse, differenceInCalendarDays } from 'date-fns';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-set-rules',
  templateUrl: './set-rules.component.html',
  styleUrls: ['./set-rules.component.scss', '../../../automation-tactic-detail/automation-tactic-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SetRulesComponent implements OnInit {
  public currentStrategyObj = this.automationService.currentStrategyObj;
  public actionList = this.automationService.automationRenderData['action_list'];
  public actionSettings = this.automationService.actionSettings;
  public automationStrategy = this.automationService.automationStrategy;
  public strategyInfo = this.currentStrategyObj.strategyInfo;
  public tactic_info = this.strategyInfo.tactic_info;
  public running_time_start;

  // 媒体数据
  public triggerMetricGroup = this.automationService.triggerMetricGroup;
  public metricOptions = this.automationService.metricOptions;

  public RunningFrequencyOptions = this.automationService.selectOptions.running_frequency.options;
  public runningDayNodes = this.automationService.selectOptions.running_day.options;

  public tacticId;//策略id,编辑时有
  public tacticIndex;//策略index,create的时候==0
  public isCreate;//新建且不是用模板
  public errorValidObj = this.automationService.errorValidObj;

  constructor(
    public automationService: AutomationService,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams.subscribe(params => {
      this.tacticId = params.tactic_id;
      this.tacticIndex = params.tacticIndex;
      this.isCreate = !this.tacticId && this.tacticIndex == 0
    });
  }


  ngOnInit(): void {
    // 新建策略，在初始化时给action_settings赋值
    // if (this.isCreate && this.tactic_info.tactic_rule) {
    //   this.tactic_info.tactic_rule.forEach(action => {
    //     if (action.action_id) this.setActionSettings(action);
    //   });
    // }

    if (this.isCreate) {
      // 无模板新建
      this.tactic_info['running_time_fixed'] = parse('0:00', 'HH:mm', new Date());
      this.tactic_info['running_time_start'] = parse('0:00', 'HH:mm', new Date());
      this.tactic_info['running_time_end'] = parse('23:59', 'HH:mm', new Date());
    }
  }

  // 自定义策略-设置action_settings
  setActionSettings(action) {
    this.automationService.setActionSettings(action);
  }

  // 自定义策略-增加任务
  addAction() {
    const tactic_rule = this.tactic_info.tactic_rule;
    if (tactic_rule.length < 10) {
      const action = deepCopy(this.automationService.action);
      this.setActionSettings(action);
      tactic_rule.push(action);
    }
  }

  // 自定义策略-删除任务
  deleteAction(i) {
    const tactic_rule = this.tactic_info.tactic_rule;
    if (tactic_rule.length < 2) return;
    tactic_rule.splice(i, 1);
  }

  // 自定义策略-修改开始时间
  changeRunningStartTime() {
    if (this.tactic_info['running_time_end'] < this.tactic_info['running_time_start']) {
      this.tactic_info['running_time_end'] = this.tactic_info['running_time_start'];
    }
  }

  // 自定义策略-结束时间：禁用小时
  public disabledEndHours = (): number[] => {
    let startHour = Number(format(this.tactic_info['running_time_start'], 'H'));
    const disabledHours = [];
    for (let i = 0; i < startHour; i++) {
      disabledHours.push(i);
    }
    return disabledHours;
  }
  // 自定义策略-结束时间：禁用分钟
  public disabledEndMinutes = (hour: number): number[] => {
    let startHour = Number(format(this.tactic_info['running_time_start'], 'H'));
    let startMinute = Number(format(this.tactic_info['running_time_start'], 'm'));
    const disabledMinutes = [];
    for (let i = 0; i < startMinute; i++) {
      disabledMinutes.push(i);
    }
    if (hour === startHour) {
      return disabledMinutes;
    } else {
      return [];
    }
  }

  changeRunningDay(value) {
    if (value.length == 0) {
      this.errorValidObj.running_day = 'error';
    } else {
      this.errorValidObj.running_day = 'success';
    }
  }

  //不可用时间
  disabledDate = (current: Date) => {
    return (
      differenceInCalendarDays(current, new Date()) < 0 //今日之前不可用
    );
  }

}
