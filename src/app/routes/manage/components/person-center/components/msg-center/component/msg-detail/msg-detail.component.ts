import { Component, HostListener, OnInit } from '@angular/core';
import { ManageService } from "../../../../../../service/manage.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../../../../../../core/service/auth.service";

@Component({
  selector: 'app-message-detail',
  templateUrl: './msg-detail.component.html',
  styleUrls: ['./msg-detail.component.scss'],
})
export class MsgDetailComponent implements OnInit {
  public messageId;
  public isRead;

  public messageDetail = {
    message_title: null,
    message_content: null,
    message_start_time: null,
    is_read: true
  };
  public messageLoading = false;

  constructor(private authService: AuthService,
    private manageService: ManageService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute
  ) {
    this.messageId = this.route.snapshot.queryParams['message_id'];
    this.isRead = this.route.snapshot.queryParams['is_read'];
  }

  ngOnInit(): void {
    this.getData();
  }
  getData(): void {
    this.messageLoading = true;
    this.manageService.getMessageDetail(this.messageId).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.messageDetail = result.data;
        if (this.authService.messageUnreadCount !== 0 && this.isRead === '0') {
          this.authService.messageUnreadCount--;
        }
      }
      this.messageLoading = false;
    }, (err: any) => {
      this.messageLoading = false;
      this.message.error('数据获取异常，请重试');
    });
  }
  goBack() {
    history.go(-1);
  }
}




