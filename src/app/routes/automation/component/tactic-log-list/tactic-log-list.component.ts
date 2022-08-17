import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AutomationService } from "../../service/automation.service";
import { Router, ActivatedRoute } from "@angular/router";
@Component({
  selector: 'app-tactic-log-list',
  templateUrl: './tactic-log-list.component.html',
  styleUrls: ['./tactic-log-list.component.scss']
})
export class TacticLogListComponent implements OnInit {
  public noResultHeight = document.body.clientHeight - 280;

  constructor(
    private message: NzMessageService,
    private automationService: AutomationService,
    private router: Router,
  ) {
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 280;
  }
  ngOnInit(): void {

  }

}
