import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-audience',
  templateUrl: './custom-audience.component.html',
  styleUrls: ['./custom-audience.component.scss']
})
export class CustomAudienceComponent implements OnInit {
  public sectionTabList = [
    { title: '媒体人群包', url: '../custom_audience/audience_list' },
    { title: '上传人群包', url: '../custom_audience/upload_audience_list' },
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
