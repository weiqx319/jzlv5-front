import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../core/service/auth.service";
import { User } from "../../core/entry/user";
import { ManageService } from "./service/manage.service";

import { MenuService } from '../../core/service/menu.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {

  public currentManagerUser: User;
  public currentChannelId: number;

  public hasCompany = false;
  public menuItems = [
    { "name": "基本信息", "url": "/manage/basic_detail" },
    { "name": "消息中心", "url": "/manage/message_center" },
    { "name": "任务记录", "url": "/manage/task_log" },
    { "name": "用户管理", "url": "/manage/user_manage", notIncludeRoleId: [2], includeRoleId: [1, 3] },
    { "name": "帐户管家", "url": "/manage/account_keeper", notIncludeRoleId: [2], includeRoleId: [1] },
    { "name": "账户授权", "url": "/manage/account_binding", notIncludeRoleId: [2] },
    { "name": "广告主管理", "url": "/manage/advert_manage", notIncludeRoleId: [2], includeRoleId: [1] },
    { "name": "URL生成器", "url": "/manage/generator", notIncludeRoleId: [2] },
    { "name": "转化数据", "url": "/manage/conversion", notIncludeRoleId: [2] },
    { "name": "转化描述", "url": "/manage/conversion_desc", notIncludeRoleId: [2] },
    { "name": "SEM定义指标", "url": "/manage/metric", notIncludeRoleId: [2], includeChannel: [1] },
    { "name": "信息流定义指标", "url": "/manage/metric", notIncludeRoleId: [2], includeChannel: [2] },
    { "name": "应用商店定义指标", "url": "/manage/metric", notIncludeRoleId: [2], includeChannel: [3] },
    { "name": "集团指标", "url": "/manage/company_metric", notIncludeRoleId: [2] },
    { "name": "定义维度", "url": "/manage/dimension", notIncludeRoleId: [2], includeChannel: [1] },
    { "name": "行业标识配置", "url": "/manage/trade_mark", notIncludeRoleId: [2], includeChannel: [1], judgeCompany: true },
    { "name": "否词库", "url": "/manage/negation_word", notIncludeRoleId: [2], includeChannel: [1] },
    { "name": "黑名单词库", "url": "/manage/black_word", notIncludeRoleId: [2], includeChannel: [1] },
    { "name": "无API媒体数据上传", "url": "/manage/manual_data", notIncludeRoleId: [2], includeChannel: [1] },
  ]
  public menuList = [
    {
      name: '系统管理', icon: 'setting', subMenu: []
    },
  ];
  constructor(private authService: AuthService,
    private manageService: ManageService,
    private menuService: MenuService,
  ) {
  }

  ngOnInit() {
    this.initData();
    this.authService.currentAdminUser$.subscribe((data: { select_uid: number }) => {
      // this.userList = data['user_list'];
      this.initData();

    });
    const currentCompanyId = this.authService.getCurrentUser().company_id;
    this.getHasCompanyId(currentCompanyId);
    this.currentChannelId = this.menuService.currentChannelId;

    this.menuList[0].subMenu = this.menuService.getMenuList({
      menuItems: this.menuItems,
      roleId: this.currentManagerUser.role_id,
      hasCompany: this.hasCompany
    });
  }

  getHasCompanyId(currentCompanyId) {

    this.manageService.getHasCompanyId(currentCompanyId).subscribe(result => {
      if (result.status_code === 200) {
        this.hasCompany = true;
      } else if (result.status_code === 205) {
        this.hasCompany = false;
      } else {
        this.hasCompany = false;
      }
    }, error1 => {
      this.hasCompany = false;
    });
  }


  initData(): void {
    const currentMangerUser = this.authService.getCurrentAdminOperdInfo();
    this.currentManagerUser = this.authService.getCurrentUser().user_list.find(item => {
      if (item.user_id === currentMangerUser.select_uid) {
        return true;
      }
    });



  }



}
