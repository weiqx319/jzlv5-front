import { Component, OnInit } from '@angular/core';
import { MenuService } from "../../../core/service/menu.service";

@Component({
  selector: 'app-data-view-feed-layout',
  templateUrl: './data-view-feed-layout.component.html',
  styleUrls: ['./data-view-feed-layout.component.scss']
})
export class DataViewFeedLayoutComponent implements OnInit {

  public menuList = this.menuService.currentMenuItemsNew$.value.find(item => item.url === '/data_view/feed')['subMenu'];
  constructor(private menuService: MenuService) { }

  ngOnInit(): void {

  }

}
