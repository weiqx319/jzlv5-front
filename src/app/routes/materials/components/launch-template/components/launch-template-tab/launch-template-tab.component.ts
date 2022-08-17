import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MenuService } from '../../../../../../core/service/menu.service';

@Component({
  selector: 'app-launch-template-tab',
  templateUrl: './launch-template-tab.component.html',
  styleUrls: ['./launch-template-tab.component.scss']
})
export class LaunchTemplateTabComponent implements OnInit, OnDestroy {

  public activeType = 'launch';

  private navigationSubscription;

  public materialsTab = [];
  public materialsTabDefaultSetting = [
    { 'name': '投放模板', key: 'launch', publisherId: [7] },
    { 'name': '定向模板', key: 'target', publisherId: [1, 7, 17] },
    // {'name': '单元命名模板', key: 'campaign_name'},
    { 'name': '安卓下载链接', key: 'android_download_link', publisherId: [1, 7, 17] },
    { 'name': 'IOS下载链接', key: 'ios_download_link', publisherId: [1, 7, 17] },
    { 'name': '落地页', key: 'landing_page', publisherId: [1, 7, 17] },
    { 'name': '调起URL', key: 'deeplink_url', publisherId: [1] },
    { 'name': '小程序URL', key: 'applet_url', publisherId: [1] },
    { 'name': '点击监测URL', key: 'click_monitor_url', publisherId: [1] },
    { 'name': '商品目录', key: 'catalogue_list', publisherId: [1] },
    { 'name': '卡片模板', key: 'card_list', publisherId: [7] },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private menuService: MenuService,
  ) {


    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        if (this.route.snapshot.queryParams) {
          const urlType = this.route.snapshot.queryParams['type'];
          if (urlType) {
            this.activeType = urlType;
          }
        }
      }
    });
  }

  ngOnInit() {

    const publisherId = this.menuService.currentPublisherId;
    this.materialsTabDefaultSetting.forEach(item => {
      if (item.publisherId.indexOf(publisherId) > -1) {
        this.materialsTab.push(item);
      }
    });

    const findType = this.materialsTab.find((item) => {
      return item.key === this.activeType;
    });

    if (!findType && this.materialsTab.length > 0) {
      this.activeType = this.materialsTab[0]['key'];
    }








  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  changeActive(type) {
    if (this.activeType !== type) {
      // this.activeType = type;

      this.router.navigate(['/data_view/feed/materials/launch_template/launch_tab'], { queryParams: { type } });

      // if (this.activeType === 'list' || this.activeType === 'custom') {
      //   this.tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;
      // } else {
      //   this.tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;
      // }
      // this.refreshData();
    }
  }

}
