import { Injectable } from '@angular/core';
import { LocalStorageService } from "ngx-webstorage";
import { BehaviorSubject } from "rxjs";
import { deepCopy, isNull, isUndefined } from "@jzl/jzl-util";

@Injectable()
export class MenuService {
  public redirectUrl: any;
  public menuItemsNew = []; // 测试数据，新菜单
  public currentMenu = {};//当前路由
  public currentMenuItemsNew$ = new BehaviorSubject<any[]>([]);//新菜单

  public menuItems; //菜单
  productNames;//产品名称

  public productName$ = new BehaviorSubject<string>('');
  public selectProductType$ = new BehaviorSubject<string>('');
  public currentMenuItems$ = new BehaviorSubject<any[]>([]);
  productTypes;//产品类型

  currentChannelId = 1;
  currentPublisherId = 0;
  isCompany = false;

  currentUser: { user_id: number };

  constructor(private localSt: LocalStorageService,) {}
  // 获取新菜单
  getMenuItemsNew() {
    this.menuItemsNew.length = 0;
    const menuItemSem = {
      name: '投放管理', url: '/data_view/sem', isCompany: false, "includeChannel": [1], subMenu: [
        { name: '投放管理', icon: 'apartment', subMenu: [] },
        {
          name: 'ocpc', icon: 'robot', subMenu: [
            { name: '360_ocpc', url: '/data_view/sem/ocpc/ocpc_360_setting' },
            { name: '百度_ocpc', url: '/data_view/sem/ocpc/ocpc_baidu' },
          ]
        },
        {
          name: '高级样式', icon: 'rocket', subMenu: [
            { name: '360_凤舞创意', url: '/data_view/sem/ocpc/creative_fengwu_360' },
          ]
        }]
    };
    const menuItemFeed = {
      name: '投放管理', url: '/data_view/feed', isCompany: false, "includeChannel": [2, 3, 7],
      subMenu: [
        { name: '投放管理', icon: 'apartment', subMenu: [] }
      ]
    };

    // 数据报告-sem
    const analyticsMenu = {
      name: '数据报告', url: '/analytics/sem', isCompany: false, "includeChannel": [1], subMenu: [
        {
          name: '效果报告', icon: 'audit', subMenu: []
        },
        { name: '维度报告', icon: 'deployment-unit', subMenu: [] },
        {
          name: 'ocpc报告', icon: 'robot', subMenu: [
            { name: '360_ocpc报告', url: '/analytics/sem/ocpc/ocpc_360' },
            { name: '百度_ocpc报告', url: '/analytics/sem/ocpc/ocpc_baidu_report' },
          ]
        },
        {
          name: '高级样式报告', icon: 'rocket', subMenu: [
            { name: '百度高级样式报告', url: '/analytics/sem/ocpc/dsa_pattern_day' },
          ]
        }]
    };

    // 数据报告-feed
    const analyticsFeedMenu = {
      name: '数据报告', url: '/analytics/feed', isCompany: false, "includeChannel": [2, 3, 7], subMenu: [
        {
          name: '效果报告', icon: 'audit', subMenu: []
        },
        { name: '维度报告', icon: 'deployment-unit', subMenu: [] },
      ]
    };

    this.menuItems.forEach(menuItem => {
      const menuItemCopy = deepCopy(menuItem);
      if (menuItem.url === '/data_view/feed/materials') {
        menuItemCopy.url = '/materials';
      }

      // 数据报告路由
      const analyticsMenuItem = deepCopy(menuItemCopy);
      if (menuItem.url.startsWith('/data_view/')) {
        analyticsMenuItem.url = menuItemCopy.url.replace('data_view', 'analytics');
      }

      if (menuItem.url.startsWith('/data_view/sem')) {
        if (!menuItem.url.startsWith('/data_view/sem/ocpc')) {
          menuItemSem.subMenu[0].subMenu.push(menuItemCopy);
          // 数据报告路由
          // if (menuItem.url !== '/data_view/sem/publisher') {
          analyticsMenu.subMenu[0].subMenu.push(analyticsMenuItem);
          // }
        }
      } else if (menuItem.url.startsWith('/data_view/feed') && menuItem.url !== '/data_view/feed/materials') {
        if (menuItem.url !== '/data_view/feed/target') {
          menuItemFeed.subMenu[0].subMenu.push(menuItemCopy);
          // 数据报告路由
          analyticsFeedMenu.subMenu[0].subMenu.push(analyticsMenuItem);
        }

      } else {
        this.menuItemsNew.push(menuItemCopy);
      }
    });
    this.menuItemsNew.splice(1, 0, menuItemSem, menuItemFeed);

    // 数据报告
    this.menuItemsNew.splice(3, 0, analyticsMenu, analyticsFeedMenu);
  }

  init(user, operRoledId = 0, cid = 0, menuData?) {
    // 设置菜单数据
    if (menuData) {
      menuData['productTypes'].forEach(infoChannel => {
        if (infoChannel.children && infoChannel.children.length > 0) {
          for (let i = 0; i <= infoChannel.children.length; i++) {
            if (infoChannel.children[i]) {
              if (infoChannel.children[i]['company_id'] && infoChannel.children[i]['company_id'].indexOf(user.company_id) === -1) {
                infoChannel.children.splice(i, 1);
                i--;
              }
            }
          }
        }
      });
      this.menuItems = menuData['menuItems'];
      this.productNames = menuData['productNames'];
      this.productTypes = menuData['productTypes'];
      this.getMenuItemsNew();//测试数据，获取新菜单
    }
    this.currentUser = { user_id: user.user_id };
    this.getLocalProductTYpe();
    this.setProductTypesPermission(user);
    this.changeProductType(this.currentChannelId, this.currentPublisherId, operRoledId, cid);
  }

  // 根据权限重设默认数据
  setProductTypesPermission(user) {
    let v5_product_permission = user.v5_product_permission ? JSON.parse(user.v5_product_permission) : ['all'];
    // 1.删除已废弃项
    const v5_product_permission_new = [];
    v5_product_permission.forEach(item => {
      if (user.menuData && user.menuData.productNames[item]) { v5_product_permission_new.push(item); }
    });
    v5_product_permission = v5_product_permission_new.length > 0 ? v5_product_permission_new : ['all'];

    // 2.筛出可用渠道和媒体
    if (user.menuData && v5_product_permission.indexOf('all') === -1) {//媒体不是全选
      const productTypesPermission = new Map();
      user.menuData['productTypes'].forEach(item => {
        v5_product_permission.forEach(key => {
          const keyArr = key.split('_');
          if (Number(keyArr[0]) === item.channel_id) {
            if (!productTypesPermission.get(item.channel_id)) {
              productTypesPermission.set(item.channel_id, JSON.parse(JSON.stringify(item)));
              productTypesPermission.get(item.channel_id).children = [];
            }
            item.children.forEach(publisher => {
              if (Number(keyArr[1]) === publisher.publisher_id) {
                productTypesPermission.get(item.channel_id).children.push(publisher);
              }
            });
          }
        });
      });
      this.productTypes = [...productTypesPermission.values()];
    }

    // 3.如果本地数据中的ProductTYpe，在权限中被删除了，则取有权限的 默认第一行数据
    const typeKey = this.currentChannelId + '_' + this.currentPublisherId;
    if (v5_product_permission.indexOf('all') === -1 && v5_product_permission.indexOf(typeKey) === -1) {
      this.currentChannelId = this.productTypes[0].channel_id;
      if (this.productTypes[0].isGroup) {
        this.currentPublisherId = this.productTypes[0].children[0].publisher_id;
      } else {
        this.currentPublisherId = 0;
      }
    }
  }

  // -- 保存或获取本地缓存的信息
  getLocalProductTYpe() {
    const cacheKey = 'product_type_' + this.currentUser.user_id;
    const cacheData = this.localSt.retrieve(cacheKey);
    if (!isUndefined(cacheData) && !isNull(cacheData)) {
      this.currentChannelId = cacheData['channel_id'];
      this.currentPublisherId = cacheData['publisher_id'];
    }
  }
  setLocalProductTYpe(channel_id, publisher_id) {
    const cacheKey = 'product_type_' + this.currentUser.user_id;
    const data = {
      channel_id,
      publisher_id,
    };
    this.localSt.store(cacheKey, data);
  }

  changeProductType(channel_id, publisher_id, operRoledId, cid) {
    const typeKey = channel_id + '_' + publisher_id;
    this.productName$.next(this.productNames[typeKey]);
    this.selectProductType$.next(typeKey);
    this.currentChannelId = channel_id;
    this.currentPublisherId = publisher_id;
    this.setLocalProductTYpe(channel_id, publisher_id);
    this.getCurrentMenuItems(operRoledId, cid);
    this.getCurrentMenuItemsNew(operRoledId, cid);//获取新菜单
  }

  getCurrentMenuItems(operRoledId, cid) {
    const items = [];
    this.menuItems.forEach((item: any) => {
      if (item.hasOwnProperty('includeCid') && cid > 0 && item.includeCid.indexOf(cid) < 0) {
        return;
      }
      if (item.hasOwnProperty('excludeRoleId') && item.excludeRoleId.indexOf(operRoledId) > 0) {
        return;
      }
      if (item.hasOwnProperty('includeChannel') && item.includeChannel.indexOf(this.currentChannelId) < 0) {
        return;
      }
      if (item.hasOwnProperty('includePublisher') && item.includePublisher.indexOf(this.currentPublisherId) < 0) {
        return;
      }

      if (item.hasOwnProperty('notIncludePublisher') && item.notIncludePublisher.indexOf(this.currentPublisherId) > -1) {
        return;
      }

      items.push(item);
    });
    this.currentMenuItems$.next(items);

  }

  //获取新菜单方法
  getCurrentMenuItemsNew(operRoledId, cid) {
    const items = this.getMenuList({ menuItems: this.menuItemsNew, roleId: operRoledId, cid: cid });
    this.currentMenuItemsNew$.next(items);
  }

  // 其他页面获取菜单列表
  getMenuList(menuInfo) {
    const menuList = [];
    menuInfo.menuItems.forEach((item: any) => {
      if (item.hasOwnProperty('includeCid') && menuInfo.cid > 0 && item.includeCid.indexOf(menuInfo.cid) < 0) {
        return;
      }
      if (item.hasOwnProperty('includeRoleId') && item.includeRoleId.indexOf(menuInfo.roleId) < 0) {
        return;
      }
      if (item.hasOwnProperty('notIncludeRoleId') && item.notIncludeRoleId.indexOf(menuInfo.roleId) > -1) {
        return;
      }

      if (item.hasOwnProperty('includeChannel') && item.includeChannel.indexOf(this.currentChannelId) < 0) {
        return;
      }
      if (item.hasOwnProperty('includePublisher') && item.includePublisher.indexOf(this.currentPublisherId) < 0) {
        return;
      }

      if (item.hasOwnProperty('notIncludePublisher') && item.notIncludePublisher.indexOf(this.currentPublisherId) > -1) {
        return;
      }
      if (item.hasOwnProperty('judgeCompany') && item['judgeCompany'] && !menuInfo.hasCompany) {
        return;
      }

      // 原menu用的key
      if (item.hasOwnProperty('excludeRoleId') && item.excludeRoleId.indexOf(menuInfo.operRoledId) > 0) {
        return;
      }

      // 子菜单
      if (item.hasOwnProperty('subMenu')) {
        const subMenuInfo = deepCopy(menuInfo);
        subMenuInfo.menuItems = item.subMenu;
        item.subMenu = this.getMenuList(subMenuInfo);
      }

      menuList.push(item);
    });
    return menuList;
  }

}
