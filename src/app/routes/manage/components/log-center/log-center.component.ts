import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-log-center',
  templateUrl: './log-center.component.html',
  styleUrls: ['../../manage.component.scss']
})
export class LogCenterComponent implements OnInit {
  public menuList = [
    {
      name: '日志管理', icon: 'profile', subMenu: [
        { "name": "任务日志", "url": "/manage/log/task_log" },
        { "name": "转化接收记录", "url": "/manage/log/conversion_log" },]
    },
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
