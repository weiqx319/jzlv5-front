import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-black-word-log-list',
  templateUrl: './black-word-log-list.component.html',
  styleUrls: ['./black-word-log-list.component.scss']
})
export class BlackWordLogListComponent implements OnInit, OnDestroy {

  public activeType = 'keyword';

  private navigationSubscription;

  public taskId;
  public publisherId;

  public materialsTab = [
    { 'name': '关键词明细', key: 'keyword' },
    { 'name': '创意明细', key: 'creative' },
  ];
  public sectionTabList = [
    { title: '关键词明细', type: 'keyword', },
    { title: '创意明细', type: 'creative' },
  ];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.taskId = this.route.snapshot.queryParams['task_id'];
    this.publisherId = this.route.snapshot.queryParams['publisher_id'];

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
      this.router.navigate(['./'], { relativeTo: this.route, queryParams: { task_id: this.taskId,publisher_id: this.publisherId, type } });

    }
  }

  changeTabItem(tabItem) {
    if (this.activeType !== tabItem.type) {
      this.router.navigate(['./'], { relativeTo: this.route, queryParams: { task_id: this.taskId,publisher_id: this.publisherId, type: tabItem.type } });
    }
  }

}
