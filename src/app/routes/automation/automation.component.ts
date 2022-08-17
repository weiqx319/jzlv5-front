import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { GlobalTemplateComponent } from '../../shared/template/global-template/global-template.component';
import { MenuService } from './../../core/service/menu.service';

@Component({
  selector: 'app-automation',
  templateUrl: './automation.component.html',
  styleUrls: ['./automation.component.scss']
})
export class AutomationComponent implements OnInit {
  public menuList = [
    {
      name: '自动化策略', icon: 'sliders', subMenu: [
        { "name": "策略列表", "url": "../automation/tactic_list" },
        { "name": "策略执行日志", "url": "../automation/log_list" },
      ]
    },
  ];

  constructor(
    public menuService: MenuService,
  ) { }

  ngOnInit(): void {
  }

}
