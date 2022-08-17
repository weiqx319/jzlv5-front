import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../../../core/service/menu.service';


@Component({
  selector: 'app-image-report',
  templateUrl: './image-report.component.html',
  styleUrls: ['./image-report.component.scss']
})
export class ImageReportComponent implements OnInit {

  public activeType = 'summary';

  public materialsTab = [
    { 'name': '汇总报告', key: 'summary' },
  ];

  constructor(public menuService: MenuService) {

  }

  ngOnInit() {
  }

  changeActive(type) {
    if (this.activeType !== type) {
      this.activeType = type;
      // if (this.activeType === 'list' || this.activeType === 'custom') {
      //   this.tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;
      // } else {
      //   this.tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;
      // }
      // this.refreshData();
    }
  }

}



