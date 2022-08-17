import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tools-center',
  templateUrl: './tools-center.component.html',
  styleUrls: ['../../manage.component.scss']
})
export class ToolsCenterComponent implements OnInit {
  public menuList = [
    {
      name: '智能工具', icon: 'tool', subMenu: [
        { "name": "否词库", "url": "/manage/tools/negation_word" },
        { "name": "黑名单词库", "url": "/manage/tools/black_word" },
      ]
    },
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
