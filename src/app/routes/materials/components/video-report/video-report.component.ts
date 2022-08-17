import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../../../core/service/menu.service';


@Component({
  selector: 'app-video-report',
  templateUrl: './video-report.component.html',
  styleUrls: ['./video-report.component.scss']
})
export class VideoReportComponent implements OnInit {

  public activeType = 'summary';

  public materialsTab = [
    { 'name': '汇总报告', key: 'summary' },
    { 'name': '标签报告', key: 'label' }
  ];

  constructor(public menuService: MenuService) {

  }

  ngOnInit() {
    if (this.menuService.currentPublisherId == 6) {
      this.materialsTab = [{ 'name': '汇总报告', key: 'summary' }];
    }
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



