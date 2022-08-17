import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AutomationService } from '../../service/automation.service'

@Component({
  selector: 'app-automation-guide',
  templateUrl: './automation-guide.component.html',
  styleUrls: ['./automation-guide.component.scss']
})
export class AutomationGuideComponent implements OnInit {

  constructor(
    private automationService: AutomationService,
    private router: Router,
  ) { }

  public isCreateVisible = false;
  public automationStrategy = this.automationService.automationStrategy;
  public tacticLevelList = this.automationService.tacticLevelList;
  public actionIconObj = this.automationService.actionIconObj;
  ngOnInit(): void {
    // 获取自定义预置策略模板列表
    this.automationService.setCustomPresetStrategy();
  }
  goBack() {
    history.go(-1);
  }

  handleCancel(): void {
    this.isCreateVisible = false;
  }

  createTactic(tacticType) {
    this.isCreateVisible = true;
  }

}
