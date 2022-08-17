import { Component, HostListener, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../../../../../core/service/auth.service';
import { MenuService } from '../../../../../../core/service/menu.service';
@Component({
  selector: 'app-channel-publisher',
  templateUrl: './channel-publisher.component.html',
  styleUrls: ['./channel-publisher.component.scss']
})
export class ChannelPublisherComponent implements OnInit {
  public sectionTabIndex = 0;
  public sectionTabList = [];
  public sectionTabMenus = [
    { title: '默认渠道', type: 'default_channel', url: '/manage/account/channel_publisher/default_channel' },
    { title: '默认媒体', type: 'default_publisher', url: '/manage/account/channel_publisher/default_publisher' },
    { title: '自定义渠道', type: 'custom_channel', url: '/manage/account/channel_publisher/custom_channel', includeRoleId: [1] },
    { title: '自定义媒体', type: 'custom_publisher', url: '/manage/account/channel_publisher/custom_publisher', includeRoleId: [1] },
  ];

  public noResultHeight = document.body.clientHeight - 300;
  constructor(
    public authService: AuthService,
    private menuService: MenuService,
  ) { }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 300;
  }



  ngOnInit(): void {
    this.sectionTabList = this.menuService.getMenuList({
      menuItems: this.sectionTabMenus,
      roleId: this.authService.getCurrentAdminOperdInfo().role_id,
    });
  }

}
