import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-metric-setting',
  templateUrl: './metric-setting.component.html',
  styleUrls: ['./metric-setting.component.scss']
})
export class MetricSettingComponent implements OnInit {

  public sectionTabIndex = 0;
  public sectionTabList = [
    { title: '广告主指标', type: 'metric', url: '/manage/metric/metric_setting/metric' },
    { title: '集团指标', type: 'company', url: '/manage/metric/metric_setting/company_metric' },
    { title: '指标分类', type: 'category', url: '/manage/metric/metric_setting/metric_category' },
  ];

  public show_type = 'metric';
  public noResultHeight = document.body.clientHeight - 300;

  constructor(
    private route: ActivatedRoute,
  ) {

  }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 300;
  }
  ngOnInit(): void {

  }

}
