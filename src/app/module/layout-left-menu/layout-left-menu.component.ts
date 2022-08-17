import { Component, Input, OnInit } from '@angular/core';
import { MenuService } from "../../core/service/menu.service";

@Component({
  selector: 'app-layout-left-menu',
  templateUrl: './layout-left-menu.component.html',
  styleUrls: ['./layout-left-menu.component.scss']
})
export class LayoutLeftMenuComponent implements OnInit {
  @Input() menuList = [];
  @Input() isOldMenu;
  public isMenuCollapsed = false;

  constructor(
    public menuService: MenuService,
  ) { }

  ngOnInit(): void {

  }
  toggleMenuCollapsed() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 0);
  }

}
