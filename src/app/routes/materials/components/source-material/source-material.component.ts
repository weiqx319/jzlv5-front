import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../../../../core/service/menu.service';


@Component({
  selector: 'app-video-material',
  templateUrl: './source-material.component.html',
  styleUrls: ['./source-material.component.scss']
})
export class SourceMaterialComponent implements OnInit {

  public activeType = 'video';

  public materialsTab = [
    { 'name': '视频', key: 'video' },
    { 'name': '图片', key: 'image' },
  ];

  constructor(private route: ActivatedRoute, public menuService: MenuService, private router: Router) {
    this.route.data.subscribe((data) => {
      this.activeType = data['activeType'];
      if (this.activeType == 'image') {
        this.materialsTab = [{ 'name': '图片', key: 'image' }];
      } else {
        this.materialsTab = [{ 'name': '视频', key: 'video' }];
      }
    });
  }

  ngOnInit() {
    if (this.activeType == 'video' && (this.menuService.currentPublisherId == 1)) {
      this.router.navigateByUrl('/data_view/feed/materials/image_material');
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
