import { Router, ActivatedRoute } from '@angular/router';
import { MenuService } from './../../core/service/menu.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../core/service/auth.service";

@Component({
  selector: 'app-asset-management',
  templateUrl: './asset-management.component.html',
  styleUrls: ['./asset-management.component.scss']
})
export class AssetManagementComponent implements OnInit {
  public menuList = [
    {
      name: '资产管理', icon: 'setting', subMenu: []
    },
  ];

  public menuItems = [
    { "name": "自定义人群包", "url": "../asset_management/custom_audience", includePublisher: [6, 7] },
    { "name": "解析工具", "url": "../asset_management/parse_tool", includePublisher: [24] },
    { "name": "落地页", "url": "../asset_management/landing_page", includePublisher: [1] },
    { "name": "调起URL", "url": "../asset_management/app_na_url", includePublisher: [1] },
    { "name": "应用中心", "url": "../asset_management/download_app", includePublisher: [1] },
  ];
  public redirectToUrl = {
    6: 'custom_audience',
    7: 'custom_audience',
    24: 'parse_tool',
    1: 'landing_page',
  };

  constructor(
    public menuService: MenuService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.menuList[0].subMenu = this.menuService.getMenuList({
      menuItems: this.menuItems,
    });
    // 重定向路由
    const url = this.redirectToUrl[this.menuService.currentPublisherId];
    if (url) {
      this.router.navigate(['./' + url], { relativeTo: this.route });
    }
  }


}
