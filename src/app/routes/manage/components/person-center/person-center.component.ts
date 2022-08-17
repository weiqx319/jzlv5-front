import { Component, OnInit } from '@angular/core';
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-log-center',
  templateUrl: './person-center.component.html',
  styleUrls: ['../../manage.component.scss']
})
export class PersonCenterComponent implements OnInit {
  public menuList = [
    {
      name: '个人中心', icon: 'user', subMenu: [
        { "name": "基本信息", "url": "/manage/personal/basic" },
        { "name": "安全设置", "url": "/manage/personal/password" },
      ]
    },
  ];
  public productInfo = {};

  constructor(private productService: ProductDataService) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
      if (!this.productInfo['hiddenMessage']) {
        this.menuList[0].subMenu.push({ "name": "消息中心", "url": "/manage/personal/msg" })
      }
    });
  }

  ngOnInit(): void {
  }

}
