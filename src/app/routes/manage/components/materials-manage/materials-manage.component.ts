import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-materials-manage',
  templateUrl: './materials-manage.component.html',
  styleUrls: ['./materials-manage.component.scss']
})
export class MaterialsManageComponent implements OnInit {
  public menuList = [
    {
      "name": "素材管理", "icon": "file-image", "subMenu": [
        { "name": "视频库", "url": "/manage/materials-manage/video" },
        { "name": "图片库", "url": "/manage/materials-manage/image" },
        // { "name": "封面库", "url": "/manage/materials-manage/cover" },
        // { "name": "Logo库", "url": "/manage/materials-manage/logo" },
      ]
    },
    {
      "name": "素材报告", "icon": "snippets", "subMenu": [
        { "name": "视频报告", "url": "/manage/materials-manage/video-report" },
        { "name": "图片报告", "url": "/manage/materials-manage/image-report" },
      ]
    },
    {
      "name": "素材作者", "icon": "team", "subMenu": [
        { "name": "素材作者", "url": "/manage/materials-manage/materials-author" },
      ]
    },
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
