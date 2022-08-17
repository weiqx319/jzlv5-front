import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ConversionUploadService } from "../../../../service/conversion-upload.service";

@Component({
  selector: 'app-conversion-setting',
  templateUrl: './conversion-setting.component.html',
  styleUrls: ['./conversion-setting.component.scss']
})
export class ConversionSettingComponent implements OnInit {
  @ViewChild('conversionTemplate') conversionTemplate;
  public sectionTabIndex = 0;
  public sectionTabList = [
    { title: '自定义转化', type: 'config', url: '/manage/metric/conversion_setting/config' },
    { title: '转化描述', type: 'desc', url: '/manage/metric/conversion_setting/desc' },
    { title: '查看已上传的转化数据', type: 'log', url: '/manage/metric/conversion_setting/log' },
  ];

  public noResultHeight = document.body.clientHeight - 300;

  constructor(public uploadService: ConversionUploadService) { }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 300;
  }
  ngOnInit(): void {

  }

}
