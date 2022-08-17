import { format } from 'date-fns';
import { Component, Input, OnInit } from '@angular/core';
import { AutomationService } from '../../service/automation.service'

@Component({
  selector: 'app-action-settings-modal',
  templateUrl: './action-settings-modal.component.html',
  styleUrls: ['./action-settings-modal.component.scss']
})
export class ActionSettingsModalComponent implements OnInit {
  @Input() actionElementSetting = [];
  @Input() actionSettings = [];
  // select选择器选项
  public selectOptions = this.automationService.selectOptions;

  constructor(private automationService: AutomationService,) {

  }

  ngOnInit(): void {

  }
  
  formatTime(data, key) {
    data[key] = format(data[key], 'yyyy-MM-dd HH:mm:ss');
  }
}
