import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/service/auth.service';
import { MenuService } from '../../../../core/service/menu.service';
@Component({
  selector: 'app-metric-center',
  templateUrl: './metric-center.component.html',
  styleUrls: ['../../manage.component.scss']
})
export class MetricCenterComponent implements OnInit {
  public menuItems = [
    { "name": "转化项配置", "url": "/manage/metric/conversion_setting" },
    { "name": "公式指标管理", "url": "/manage/metric/metric_setting" },
    { "name": "账户维度", "url": "/manage/metric/company_account_dimension", includeRoleId: [1] },
    // { "name": "关键词维度", "url": "/manage/metric/dimension" },
    { "name": "行业标识配置", "url": "/manage/metric/trade_mark" },
  ];

  public menuList = [
    {
      name: '维度指标', 'icon': 'partition', subMenu: []
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
