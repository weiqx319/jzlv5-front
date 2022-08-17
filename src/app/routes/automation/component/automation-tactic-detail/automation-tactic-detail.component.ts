import { deepCopy } from '@jzl/jzl-util';
import { MenuService } from 'src/app/core/service/menu.service';
import { Component, OnInit } from '@angular/core';
import { AutomationService } from "../../service/automation.service";
import { Router, ActivatedRoute } from "@angular/router";
import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-automation-tactic-detail',
  templateUrl: './automation-tactic-detail.component.html',
  styleUrls: ['./automation-tactic-detail.component.scss']
})

export class AutomationTacticDetailComponent implements OnInit {
  constructor(
    private automationService: AutomationService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
  ) {
  }
  public automationStrategy = this.automationService.automationStrategy;
  public tacticLevelList = this.automationService.tacticLevelList;
  public tacticLevelObj = this.automationService.tacticLevelObj;
  public currentStrategyObj = this.automationService.currentStrategyObj;
  public strategyInfo = this.automationService.currentStrategyObj.strategyInfo;

  public index = 0;

  public strategyType;//选择的策略类型
  public tacticId;//策略id,编辑时有
  public tacticIndex;//策略index,create的时候==0
  public errorValidObj = this.automationService.errorValidObj;

  ngOnInit(): void {
    document.getElementsByClassName('app-body')[0].scrollTop = 0;
    this.initData();
  }

  ngOnDestroy() {
    // 重置strategyInfo
    this.automationService.currentStrategyObj.strategyInfo = deepCopy(this.automationService.strategy_info);
  }


  // 初始化数据
  initData() {
    this.route.queryParams.subscribe(params => {
      if (params.tactic_id || params.tacticTemplateId) {
        let detailService;
        if (params.tactic_id) {
          //编辑、详情
          this.tacticId = params.tactic_id;
          detailService = this.automationService.getTacticDetail(params.tactic_id);
        } else {
          // 模板新建
          detailService = this.automationService.getTacticTemplate(params.tacticTemplateId);
        }

        detailService.subscribe(result => {
          if (result.status_code === 200) {
            const data = result.data;
            this.automationService.setTacticDetailData(data);
          } else {
            this.message.error(result.message);
          }
        }, (err: any) => {
          this.message.error('数据获取失败，请重试');
        });

      } else {
        // 新建
        this.tacticIndex = params.tacticIndex;
        this.strategyType = params.strategyType;
        const currentStrategyObj = this.automationService.currentStrategyObj;
        currentStrategyObj.strategyType = params.strategyType;
        const currentTactic = this.automationStrategy.strategyList.find((item) => item.strategyType === params.strategyType).list[params.tacticIndex];

        if (params.strategyType === 'custom') {
          if (params.tacticIndex == 0) {
            const currentLevel = this.tacticLevelList[params.levelIndex];
            currentStrategyObj.strategyInfo['tacticType'] = currentTactic.tacticType;
            this.currentStrategyObj.strategyInfo['tacticTitle'] = '自定义';
            this.currentStrategyObj.strategyInfo['tacticLevel'] = currentLevel['key'];
            this.currentStrategyObj.strategyInfo['tacticLevelName'] = currentLevel['name'];
            // 获取媒体属性数据
            this.automationService.getTriggerPubAttrData(currentLevel['key']);
          }
        }
      }
    });
  }

  goBack() {
    history.go(-1);
  }

  // 获取策略描述表达式
  getTacticDescription(triggerConditions) {
    if (triggerConditions.isGroup) {
      const resultKey = [];
      const resultName = [];
      const resultLog = [];
      let innerHasNull = false;
      for (let i = 0; i < triggerConditions.group.length; i++) {
        const element = triggerConditions.group[i];
        const result = this.getTacticDescription(element);
        if (result) {
          resultKey.push(result.key);
          resultName.push(result.name);
          resultLog.push(result.log);
        } else {
          innerHasNull = true;
          break;
        }
      }
      return innerHasNull ? false : {
        key: '(' + resultKey.join(triggerConditions.logicGate) + ')',
        name: '(' + resultName.join(triggerConditions.logicGate === 'and' ? '且' : '或') + ')',
        log: '(' + resultLog.join(triggerConditions.logicGate === 'and' ? '且' : '或') + ')',//打印日志用
      };
    } else {
      // 检查数据是否填写完整,不完整直接返回false
      for (const key in triggerConditions.settings) {
        if (!(
          (triggerConditions.settings.noTime && (key === 'time' || key === 'timeLabel'))
          || (triggerConditions.settings.dynamic_noTime && (key === 'dynamic_time' || key === 'dynamic_timeLabel'))
        )) {
          if (!triggerConditions.settings.isDynamic) {//不是动态计算
            if (!key.startsWith('dynamic') && (triggerConditions.settings[key] === '' || triggerConditions.settings[key] === null)) {
              return false;
            }
          } else {
            if (key !== 'value' && (triggerConditions.settings[key] === '' || triggerConditions.settings[key] === null)) {
              return false;
            }
          }
        }
      }

      // 数据填写完整，继续
      const time = triggerConditions.settings.noTime ? '' : triggerConditions.settings.time + '||';
      const timeLabel = triggerConditions.settings.noTime ? '' : triggerConditions.settings.timeLabel + '的';
      const dynamic_time = triggerConditions.settings.dynamic_noTime ? '' : triggerConditions.settings.dynamic_time + '||';
      const dynamic_timeLabel = triggerConditions.settings.dynamic_noTime ? '' : triggerConditions.settings.dynamic_timeLabel + '的';

      let valueKey, valueName;
      if (!triggerConditions.settings.isDynamic) {
        valueKey = triggerConditions.settings.value;
        valueName = triggerConditions.settings.value + (triggerConditions.settings['isRate'] ? '%' : '');
      } else {
        valueKey = `${triggerConditions.settings.factor}*${dynamic_time}${triggerConditions.settings.dynamic_metricId}`
        valueName = `${triggerConditions.settings.factor}*${dynamic_timeLabel}${triggerConditions.settings.dynamic_metricName}`
      }

      return {
        key: `(${time}${triggerConditions.settings.metricId}${triggerConditions.settings.operator}${valueKey})`,
        name: `(${timeLabel}${triggerConditions.settings.metricName}${triggerConditions.settings.operator}${valueName})`,
        log: `(${timeLabel}${triggerConditions.settings.metricName}[${time}${triggerConditions.settings.metricId}]${triggerConditions.settings.operator}${valueName}${triggerConditions.settings.isDynamic ? `[${dynamic_time}${triggerConditions.settings.dynamic_metricId}]` : ''})`,
      };
    }
  }

  // 验证tactic_rule参数
  checkRuleData() {
    let checked = true;//是否验证通过
    // 策略名称验证
    if (!this.currentStrategyObj.strategyInfo.tactic_info.tactic_name) {
      this.errorValidObj.tactic_name = 'error';
      return false;
    }
    // 执行时间验证
    if (this.currentStrategyObj.strategyInfo.tactic_info['running_day'].length === 0) {
      this.errorValidObj.running_day = 'error';
      return false;
    }

    //策略规则验证
    for (let i = 0; i < this.currentStrategyObj.strategyInfo.tactic_info.tactic_rule.length; i++) {
      let element = this.currentStrategyObj.strategyInfo.tactic_info.tactic_rule[i];
      // 验证任务id
      if (!element.action_id) {
        return false;
      }

      // 验证任务设置action_settings
      if (Object.keys(element.action_settings).length > 0) {
        for (const key in element.action_settings) {
          for (const k in element.action_settings[key]) {
            if (element.action_settings[key][k] === '' || element.action_settings[key][k] === null) {
              return false;
            }
          }
        }
      }

      // 验证具体规则
      if (!(element['can_no_rules'] && element['no_rules'])) {
        const tactic_description = this.getTacticDescription(element.triggerConditions);
        if (tactic_description) {
          // 如果验证通过，给tactic_description赋值
          element['tactic_description'] = tactic_description.key;
          element['tactic_description_name'] = tactic_description.name;
          element['tactic_description_log'] = tactic_description.log;
          checked = true;
        } else {
          checked = false;
          return false;
        }
      }
    }

    return checked;
  }

  // 修改策略名称
  changeTacticName(event) {
    this.strategyInfo['tactic_info']['tactic_name'] = event;
    if (!event) {
      this.errorValidObj.tactic_name = 'error';
    } else {
      this.errorValidObj.tactic_name = 'success';
    }
  }

  // 完成
  done(): void {
    // 验证参数
    if (!this.checkRuleData()) {
      this.message.warning('请先完善策略信息！');
      return;
    }

    const strategyInfo = this.currentStrategyObj.strategyInfo;

    // 设置实体
    if (strategyInfo['tactic_entity_type'] !== 2) {
      strategyInfo['tactic_entity_conditions'].forEach(condition => {
        if ((condition.type === 'string' || condition.type === 'multiValue') && typeof (condition.value) === 'string') {
          condition.value = condition.value.trim() === '' ? [] : condition.value.trim().split('\n');
        }
      });
    } else {
      strategyInfo['tactic_entity_conditions'].length = 0;
    }

    // 设置描述
    let tacticDesc = '';
    strategyInfo.tactic_info.tactic_rule.forEach(rule => {
      const condition = rule['can_no_rules'] && rule['no_rules'] ? '不限条件' : '满足' + rule.tactic_description_name;
      tacticDesc += `<p>${rule.action_name}：${condition}执行；</p>`
    });

    // 设置执行时间running_day
    if (strategyInfo.tactic_info['running_day'].length === 1 && strategyInfo.tactic_info['running_day'].indexOf('all') !== -1) {
      strategyInfo.tactic_info['running_day'] = ['week_1', 'week_2', 'week_3', 'week_4', 'week_5', 'week_6', 'week_7'];
    }

    // 设置执行时间running_time
    if (strategyInfo.tactic_info['running_frequency'] !== 1440) {
      strategyInfo.tactic_info['running_time'] = [
        format(strategyInfo.tactic_info['running_time_start'], 'HH:mm'),
        format(strategyInfo.tactic_info['running_time_end'], 'HH:mm'),
      ]
    } else {
      strategyInfo.tactic_info['running_time'] = [
        format(strategyInfo.tactic_info['running_time_fixed'], 'HH:mm'),
      ]
    }

    if (this.currentStrategyObj.strategyType === 'custom') {
      const postData = {
        "tactic_info": {
          "channel_id": this.menuService.currentChannelId,
          "publisher_id": this.menuService.currentPublisherId,
          "tactic_level": strategyInfo.tacticLevel,
          "tactic_time_start": strategyInfo.tactic_info.tactic_time_interval && strategyInfo.tactic_info.tactic_time_interval[0] ? format(new Date(strategyInfo.tactic_info.tactic_time_interval[0]), 'yyyy-MM-dd') : '',
          "tactic_time_end": strategyInfo.tactic_info.tactic_time_interval && strategyInfo.tactic_info.tactic_time_interval[1] ? format(new Date(strategyInfo.tactic_info.tactic_time_interval[1]), 'yyyy-MM-dd') : '',
          ...deepCopy(strategyInfo.tactic_info),
          // "tactic_desc": JSON.stringify(tacticDesc),
          "tactic_desc": tacticDesc,
        },
        "tactic_entities": strategyInfo.tactic_entities,
        "tactic_entity_conditions": strategyInfo['tactic_entity_conditions'],
        "tactic_entity_type": strategyInfo['tactic_entity_type'],
      }

      postData.tactic_info.running_day = JSON.stringify(postData.tactic_info.running_day);
      postData.tactic_info.running_time = JSON.stringify(postData.tactic_info.running_time);

      if (this.tacticId) {
        // 编辑
        this.automationService.updateTactic(this.tacticId, postData).subscribe(result => {
          if (result.status_code === 200) {
            this.message.success('修改成功');
            this.router.navigate(['../'], { relativeTo: this.route });
          } else {
            this.message.error(result.message);
          }
        }, (err: any) => {
          this.message.error('修改失败，请重试');
        });

      } else {
        // 新建
        this.automationService.createTactic(postData).subscribe(result => {
          if (result.status_code === 200) {
            this.message.success('创建成功');
            this.router.navigate(['../'], { relativeTo: this.route });
          } else {
            this.message.error(result.message);
          }
        }, (err: any) => {
          this.message.error('创建失败，请重试');
        });
      }
    }
  }
}
