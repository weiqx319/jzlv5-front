import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-black-list',
  templateUrl: './black-list.component.html',
  styleUrls: ['./black-list.component.scss']
})
export class BlackListComponent implements OnInit, OnDestroy {

  public activeType = 'list';

  private navigationSubscription;

  public materialsTab = [
    { 'name': '词库列表', key: 'list' },
    { 'name': '筛查日志', key: 'log' },
    { 'name': '下载列表', key: 'download' },
  ];
  public sectionTabList = [
    { title: '词库列表', type: 'list', },
    { title: '筛查日志', type: 'log' },
    { title: '下载列表', type: 'download' },
  ];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
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
      this.router.navigate(['./'], { relativeTo: this.route, queryParams: { type } });

    }
  }
  changeTabItem(tabItem) {
    if (this.activeType !== tabItem.type) {
      this.router.navigate(['./'], { relativeTo: this.route, queryParams: { type: tabItem.type } });
    }
  }

}
