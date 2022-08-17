import { Component, OnInit } from '@angular/core';
import { MenuService } from "../../../core/service/menu.service";

@Component({
  selector: 'app-data-view-layout',
  templateUrl: './data-view-layout.component.html',
  styleUrls: ['./data-view-layout.component.scss']
})
export class DataViewLayoutComponent implements OnInit {
  public menuList = this.menuService.currentMenuItemsNew$.value.find(item => item.url === '/data_view/sem')['subMenu'];
  constructor(private menuService: MenuService) { }

  ngOnInit(): void {

  }

}
