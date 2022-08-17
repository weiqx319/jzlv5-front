import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MenuService } from '../../core/service/menu.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-launch-rpa',
  templateUrl: './launch-rpa.component.html',
  styleUrls: ['./launch-rpa.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchRpaComponent implements OnInit {
  public menuItems = [
    { "name": "投放项目管理", "url": "../launch_rpa/group", notIncludePublisher: [22,1] },
    { "name": "投放项目管理", "url": "../launch_rpa/group_new", includePublisher: [1] },
    { "name": "投放项目管理（全链路）", "url": "../launch_rpa/group_new", includePublisher: [17] },
    { "name": "策略管理", "url": "../launch_rpa/group_new", includePublisher: [22] },
    { "name": "渠道管理", "url": "../launch_rpa/channel", notIncludePublisher: [22, 23,1] },
    { "name": "定向管理", "url": "../launch_rpa/target", notIncludePublisher: [22, 1] },
    { "name": "定向管理", "url": "../launch_rpa/target_new", includePublisher: [1, 22] },
    { "name": "标题库", "url": "../launch_rpa/title" },
    { "name": "图片库", "url": "../launch_rpa/image", notIncludePublisher: [23] },
    { "name": "视频库", "url": "../launch_rpa/video" },
    { "name": "素材作者", "url": "../launch_rpa/author", notIncludePublisher: [22] },
  ];
  public menuList = [
    {
      name: '智能投放', icon: 'send', subMenu: []
    },
  ];
  public publisherId = 7;
  constructor(
    public menuService: MenuService,
    public router: Router,
    public route: ActivatedRoute,
  ) {
    this.publisherId = this.menuService.currentPublisherId;

    this.menuList[0].subMenu = this.menuService.getMenuList({
      menuItems: this.menuItems,
    });
    // if (this.publisherId === 7) {
    //   this.menuList[0].subMenu.push({ "name": "卡片模板", "url": "/launch_rpa/card" })
    // }
  }

  ngOnInit() {
    if (this.publisherId == 22 || this.publisherId == 1) {
      // this.router.navigateByUrl('/launch_rpa/group_new');
      this.router.navigate(['./group_new'], { relativeTo: this.route });
    }
  }


}
