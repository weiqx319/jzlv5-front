import { Component, OnInit } from '@angular/core';
import { MenuService } from "../../core/service/menu.service";
import { AuthService } from "../../core/service/auth.service";
import { DataAnalyticsService } from "./service/data-analytics.service";
import { CustomDatasService } from "../../shared/service/custom-datas.service";

@Component({
  selector: 'app-data-analytics',
  templateUrl: './data-analytics.component.html',
  styleUrls: ['./data-analytics.component.scss']
})
export class DataAnalyticsComponent implements OnInit {

  public menuList = [];
  public subUrl = this.menuService.currentChannelId === 1 ? '/analytics/sem' : '/analytics/feed';

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private dataAnalyticsService: DataAnalyticsService,
    private customDatasService: CustomDatasService,
  ) {
    this.menuList = this.menuService.currentMenuItemsNew$.value.find(item => item.url === this.subUrl)['subMenu'];
  }

  ngOnInit(): void {
    this.getReportMenu();
  }

  getReportMenu() {
    const menuItems = [
      { 'name': '负责人报告', url: './responsible_account', includeRoleId: [1, 3, 5, 6] },
    ];

    this.menuList[1].subMenu = this.menuService.getMenuList({
      menuItems: menuItems,
      roleId: this.authService.getCurrentUserOperdInfo().role_id
    });

    if (this.menuService.currentChannelId === 1) {
      this.getIsLandingPage();
    }
    this.getNameList();

    // 获取定向报告menu
    this.getTargetMenu();
  }

  // sem着陆页
  getIsLandingPage() {
    this.dataAnalyticsService.getIsLandingPage().subscribe(result => {
      if (result.status_code === 200) {
        if (result['data'] && result['data']['valid']) {
          this.menuList[1].subMenu.push({ 'name': '着陆页', url: '/analytics/sem/landing_page_account' });
        }
        this.getMenuDetail();
      } else {
        //不做任何处理
      }
    });
  }

  getNameList() {
    this.dataAnalyticsService.getBizUnitList().subscribe(result => {
      if (result.status_code === 200) {
        const reportName = this.customDatasService.brandMapObjKey['trade_id_' + this.authService.advertiserType];

        if (reportName) {
          // 排除应用市场、电商
          if ([3, 7].indexOf(this.menuService.currentChannelId) === -1) {
            this.menuList[1].subMenu.push(
              { 'name': reportName + '效果报告', url: './biz_unit_report' },
              { 'name': reportName + '小时报告', url: './biz_unit_hours_report' },
            );
          }

          // sem
          if (this.menuService.currentChannelId === 1) {
            this.menuList[1].subMenu.push({ 'name': reportName + '地域报告', url: './biz_unit_region_report' },);
          }

          if (this.authService.getCurrentUser().company_id === 4135) {
            this.menuList[1].subMenu.push(
              { name: reportName + '计划效果报告', url: './biz_unit_campaign_report' },
              { name: reportName + '单元效果报告', url: './biz_unit_adgroup_report' },
            );

            // sem
            if (this.menuService.currentChannelId === 1) {
              this.menuList[1].subMenu.push({ name: reportName + '关键词效果报告', url: './biz_unit_keyword_report' },);
            }
          }
        }
        this.getMenuDetail();
      } else {
        //不做任何处理
      }
    });
  }

  // 获取定向报告菜单
  getTargetMenu() {
    const menuItems = [
      { 'name': '国家地域', url: './country', includePublisher: [1, 6, 9, 7, 13, 11, 17] },
      { 'name': '省级地域', url: './province', includePublisher: [1, 6, 9, 7, 13, 11, 17, 16] },
      { 'name': '市级地域', url: './city', includePublisher: [1, 6, 9, 7, 11, 17, 16] },
      { 'name': '年龄', url: './age', includePublisher: [6, 9, 7, 16, 1] },
      { 'name': '学历', url: './education', includePublisher: [1] },
      { 'name': '性别', url: './gender', includePublisher: [6, 9, 7, 13, 16, 1] },
      { 'name': '兴趣', url: './interest', includePublisher: [7, 16, 1] },
      { 'name': '客户端', url: './client', includePublisher: [16] },
      { 'name': '样式', url: './material_style', includePublisher: [1], },
      { 'name': '意图词', url: './intention_keyword', includePublisher: [1], },
      { 'name': '网络类型', url: './ac', includePublisher: [7], },
      { 'name': '平台', url: './platform', includePublisher: [7], },
      { 'name': '推广目的', url: './landing_type', includePublisher: [7], },
      { 'name': '投放位置', url: './inventory_type', includePublisher: [7], },
      { 'name': '出价类型', url: './pricing', includePublisher: [7], },
      { 'name': '素材类型', url: './image_mode', includePublisher: [7], },
    ];

    const targetMenu = this.menuService.getMenuList({ menuItems: menuItems });

    if (targetMenu.length > 0) {
      this.menuList[2] = { name: '定向报告', icon: 'aim', subMenu: targetMenu };
    }
  }

  // 获取菜单详情
  getMenuDetail() {
    this.menuList.forEach(menuItem => {
      menuItem['subMenu'].forEach(item => {
        const urlArr = item.url.split('/');
        const summaryType = urlArr[urlArr.length - 1] === 'group' ? 'adgroup' : urlArr[urlArr.length - 1];
        this.dataAnalyticsService.menuDetail[summaryType] = {
          parentName: menuItem.name,
          name: item.name,
        }
      });
    });
  }

}
