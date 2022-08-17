import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-authority-manage',
  templateUrl: './authority-manage.component.html',
  styleUrls: ['../../manage.component.scss'],
})
export class AuthorityManageComponent implements OnInit {
  public menuList = [
    {
      name: '权限管理', icon: 'audit', subMenu: [{ "name": "数据角色", "url": "/manage/authority/data-role" }]
    },
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
