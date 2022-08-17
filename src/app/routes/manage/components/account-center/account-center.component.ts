import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/service/auth.service';
import { MenuService } from '../../../../core/service/menu.service';

@Component({
  selector: 'app-account-center',
  templateUrl: './account-center.component.html',
  styleUrls: ['../../manage.component.scss']
})
export class AccountCenterComponent implements OnInit {
  public menuItems = [
    { "name": "广告主管理", "url": "/manage/account/advert_manage", includeRoleId: [1] },
    { "name": "用户管理", "url": "/manage/account/user_manage", includeRoleId: [1, 3] },
    { "name": "渠道/媒体管理", "url": "/manage/account/channel_publisher" },
    { "name": "媒体帐户管家", "url": "/manage/account/account_keeper", includeRoleId: [1, 3] },
    { "name": "媒体账户授权", "url": "/manage/account/account_binding", },
    { "name": "URL生成器", "url": "/manage/account/generator", },
  ];
  public menuList = [
    {
      name: '账户中心', icon: 'contacts', subMenu: []
    },
  ];
  constructor(
    public authService: AuthService,
    private menuService: MenuService,
  ) { }

  ngOnInit(): void {
    this.menuList[0].subMenu = this.menuService.getMenuList({
      menuItems: this.menuItems,
      roleId: this.authService.getCurrentAdminOperdInfo().role_id,
    });
  }

}
