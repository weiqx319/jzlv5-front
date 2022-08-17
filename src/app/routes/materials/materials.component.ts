import { Component, OnInit } from '@angular/core';
import {MenuService} from '../../core/service/menu.service';

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {

  public menuItems = [
    { "name": "图片素材", "url": "../materials/image_material", includePublisher: [1, 7, 6, 17] },
    { "name": "视频素材", "url": "../materials/video_material", includePublisher: [7, 6, 17] },
    { "name": "视频报告", "url": "../materials/video_report", includePublisher: [7, 6] },
    { "name": "图片报告", "url": "../materials/image_report", includePublisher: [6] },
    { "name": "素材作者", "url": "../materials/materials_author", includePublisher: [7, 6, 17] },
    { "name": "文案管理", "url": "../materials/document_manage", notIncludePublisher: [6] },
    { "name": "投放模板", "url": "../materials/launch_template", notIncludePublisher: [6] },
    { "name": "新建投放", "url": "../materials/launch_create", includePublisher: [7] },
    { "name": "新建投放", "url": "../materials/bd_create_launch", includePublisher: [1] },
    { "name": "新建投放", "url": "../materials/uc_create_launch", includePublisher: [17] },
  ]
  public menuList = [{ name: '素材管理', icon: 'file-image', subMenu: [] }];
  public publisherId = 7;
  constructor(public menuService: MenuService) {
    this.publisherId = this.menuService.currentPublisherId;
    this.menuList[0].subMenu = this.menuService.getMenuList({ menuItems: this.menuItems })
  }

  ngOnInit() {

  }
}
