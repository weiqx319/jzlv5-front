import { isArray } from '@jzl/jzl-util';
import { Component, OnInit, ViewEncapsulation, HostListener, ViewChild } from '@angular/core';
import { isUndefined } from '@jzl/jzl-util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { GlobalTemplateComponent } from '../../../../../../shared/template/global-template/global-template.component';
import { AutomationService } from '../../../../service/automation.service'
import { CustomDatasService } from "../../../../../../shared/service/custom-datas.service";
import { MenuService } from '../../../../../../core/service/menu.service';
import { ItemOperationsService } from '../../../../../../shared/service/item-operations.service';

@Component({
  selector: 'app-set-tactic-entity',
  templateUrl: './set-tactic-entity.component.html',
  styleUrls: ['./set-tactic-entity.component.scss', '../../../automation-tactic-detail/automation-tactic-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SetTacticEntityComponent implements OnInit {
  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  public automationStrategy = this.automationService.automationStrategy;
  public strategyInfo = this.automationService.currentStrategyObj.strategyInfo;
  public strategyType = this.automationService.currentStrategyObj.strategyType;


  public condition = this.strategyInfo['tactic_entity_conditions'];
  public allConditionList = [
    { name: '账户', key: 'pub_account_name', width: '240', type: 'string', data_type: 'pub_attr_data' },
    {
      "width": "96",
      "name": "媒体",
      "showKey": "publisher",
      "key": "publisher_id",
      "data_type": "pub_attr_data",
      "summaryType": [
        "biz_unit_account",
        "biz_unit_campaign",
        "biz_unit_adgroup",
        "biz_unit_account_hours",
        "account",
        "campaign",
        "adgroup",
        "creative",
        "keyword",
        "search_keyword"
      ],
      "conditionType": [
        "none"
      ],
      "type": "string",
      "selected": {
        "current": true,
        "compare": false,
        "compare_abs": false,
        "compare_rate": false
      }
    },
    {
      "data_type": "pub_conversion_uc",
      "type": "number",
      "key": "online_advisory_count",
      "name": "在线咨询数",
      "is_rate": false,
      "width": 120,
      "selected": {
        "current": false,
        "compare": false,
        "compare_abs": false,
        "compare_rate": false
      }
    }
  ];
  public conditionOper: any;
  public filterOption: any;

  constructor(
    private message: NzMessageService,
    private automationService: AutomationService,
    private customDatasService: CustomDatasService,
    private menuService: MenuService,
    public itemOperationsService: ItemOperationsService,
  ) {
    this.conditionOper = this.itemOperationsService.getOperations();
  }


  @HostListener('window:resize', ['$event'])

  ngOnInit(): void {
    this.getFilterOption();
    if (this.condition.length === 0) {
      // 新建
      this.addFilterField();
    } else {
      // 编辑，转换condition.value
      this.condition.forEach(condition => {
        if ((condition.type === 'string' || condition.type === 'multiValue') && isArray(condition.value)) {
          condition.value = condition.value.join('\n');
        }
      });
    }
  }

  // 修改筛选条件key
  filterKeyChange(key, row) {
    const currentSelectCondition = this.allConditionList.find(item => item.key === key);
    if (!isUndefined(currentSelectCondition)) {
      row.type = currentSelectCondition.type;
      row.data_type = currentSelectCondition.data_type;
      row.name = currentSelectCondition.name;
      if (row.type === 'number') {
        row.op = '>';
        row.value = null;
      } else if (row.type === 'checkboxList') {
        row.op = 'in';
        row.value = null;
      } else {
        row.op = '=';
        row.value = null;
      }
    }
    if (row.type === 'singleList') {
      row['value'] = this.filterOption[row['key']]['filterOption'][0]['key'];
    }
  }

  // 删除单个筛选条件
  removeFilterField(index, e: MouseEvent) {
    e.preventDefault();
    if (this.condition.length > 1) {
      this.condition.splice(index, 1);
    } else {
      this.condition = [];
    }
  }

  // 添加筛选条件
  addFilterField(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    const control = {
      "key": "",
      "value": "",
      "name": "",
      "op": "",
      "type": "",
      'data_type': ''
    };
    if (this.allConditionList.length > 0) {
      const currentCondition = this.allConditionList[0];
      control.key = currentCondition.key;
      control.type = currentCondition.type;
      control.data_type = currentCondition.data_type;
      control.name = currentCondition.name;
      if (control.type === 'number') {
        control.op = '>';
        control.value = '';
      } else { // 其他为字符串
        control.op = '=';
        control.value = '';
      }
      this.condition.push(control);
    }
  }
  // 重置筛选条件
  resetFilterField(e?: MouseEvent) {
    this.condition.length = 0;
    this.addFilterField(e);
  }

  // 获取filterOption
  getFilterOption() {
    const typeKey = `${this.menuService.currentChannelId}_${this.menuService.currentPublisherId}`;
    this.filterOption = { ...this.customDatasService.getItemFeedFilterType(this.strategyInfo.tacticLevel, typeKey) };
  };


}
