import {
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { ManageService } from "../../../../../../service/manage.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-msg-list',
  templateUrl: './msg-list.component.html',
  styleUrls: ['./msg-list.component.scss'],
})
export class MsgListComponent implements OnInit {
  public currentPage = 1;
  public pageSize = 30;
  public total = 0;
  public loading = false;

  public messageList = [];

  public body = {
    condition: []
  };

  public isAllChecked = false;
  public isIndeterminate = false;

  public noResultHeight = document.body.clientHeight - 272;

  public sectionTabList = [
    { title: '全部类型消息', type: 0, url: '/manage/personal/msg/message_list/all' },
    { title: '系统通知', type: 1, url: '/manage/personal/msg/message_list/setting' },
    { title: '账户通知', type: 2, url: '/manage/personal/msg/message_list/account' },
    { title: '产品更新', type: 3, url: '/manage/personal/msg/message_list/product' },
  ];
  constructor(private manageService: ManageService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute) {
  }

  ngOnInit() {

  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;
  }


}
