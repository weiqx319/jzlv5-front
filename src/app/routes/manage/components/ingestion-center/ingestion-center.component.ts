import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-log-center',
  templateUrl: './ingestion-center.component.html',
  styleUrls: ['../../manage.component.scss']
})
export class IngestionCenterComponent implements OnInit {
  public menuList = [
    {
      name: '数据导入', icon: 'import', subMenu: [
        { "name": "无API媒体数据上传", "url": "/manage/ingestion/manual_data" },
        { "name": "自定义转化数据上传", "url": "/manage/ingestion/conversion_data" },
        { "name": "赔付消耗/媒体返货上传", "url": "/manage/ingestion/compensate_data" },
      ]
    },
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
