import { Component, HostListener, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { FolderItemService } from "../service/folder-item.service";

@Component({
  selector: 'app-folder-list-wrap',
  templateUrl: './folder-list-wrap.component.html',
  styleUrls: ['./folder-list-wrap.component.scss'],
  providers: [FolderItemService],
  encapsulation: ViewEncapsulation.None
})
export class FolderListWrapComponent implements OnInit {
  public viewType = 'folder';
  public tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;

  public activeType = 'details';

  public optimizationTab = [
    { 'name': '分组详情页', key: 'details' },
  ];


  constructor(private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {

  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;
  }


  ngOnInit() {

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


  changeDataViewUrl(viewType) {
    if (this.viewType === viewType) return;
    if (viewType == 'view') {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../' + viewType], { relativeTo: this.route });
    }
    this.viewType = viewType;

  }


}


