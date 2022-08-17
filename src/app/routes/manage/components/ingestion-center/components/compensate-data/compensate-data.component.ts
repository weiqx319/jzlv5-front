import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ManageItemService } from "../../../../service/manage-item.service";
import { ManageService } from "../../../../service/manage.service";

import { Store } from "@ngrx/store";
import { AppState } from "../../../../../../core/store/app.state";
import { CustomDatasService } from "../../../../../../shared/service/custom-datas.service";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-compensate-data',
  templateUrl: './compensate-data.component.html',
  styleUrls: ['./compensate-data.component.scss']
})
export class CompensateDataComponent implements OnInit {
  public sectionTabIndex = 0;
  public sectionTabList = [
    { title: '赔付消耗/媒体返货', type: 'compensateAccount', url: '/manage/ingestion/compensate_data/compensate_account' },
    { title: '赔付消耗/媒体返货上传记录', type: 'compensateLog', url: '/manage/ingestion/compensate_data/compensate_log' },
  ];
  public noResultHeight = document.body.clientHeight - 310;

  constructor(

  ) {

  }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 310;
  }

  ngOnInit(): void {

  }

}
