import {
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { ManageService } from "../../../../../../../../service/manage.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

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

  public message_type: any = 0;
  public message_status = 2;

  constructor(private manageService: ManageService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute) {
    this.route.data.subscribe((data) => {
      this.message_type = data['showType'];
    });
  }

  ngOnInit() {
    this.onWindowResize();
    this.refreshData();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;
  }

  refreshData(status?) {
    this.isIndeterminate = false;
    this.isAllChecked = false;

    if (status) {
      this.currentPage = 1;
    }
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      count: this.pageSize,
      message_status: this.message_status
    };
    if (this.message_type !== 0) {
      params.message_type = this.message_type;
    }
    this.manageService.getMessageList(params).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.messageList = result.data.detail;
        this.total = result.data.detail_count;
      } else {
        this.messageList = [];
        this.total = 0;
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.message.error('数据获取异常，请重试');
    });
  }

  checkedChange() {
    const allChecked = this.messageList.every((value) => value.checked);
    const allUnchecked = this.messageList.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this.isIndeterminate = (!allUnchecked && !allChecked) || allChecked;
    this.isAllChecked = allChecked;
  }

  updateAllChecked(value: boolean) {
    if (value) {
      this.messageList.forEach((data) => data.checked = true);
      this.isIndeterminate = true;
    } else {
      this.messageList.forEach((data) => data.checked = false);
      this.isIndeterminate = false;
    }
  }

  changeMessageType(type) {
    this.message_type = type;
    this.refreshData(true);
  }

  changeMessageStatus(status) {
    this.message_status = status;
    this.refreshData(true);
  }

  deleteMsgData(isAll?) {
    let messageIds = [];
    if (isAll) {
      messageIds = this.messageList.map(item => item.message_id);
    } else {
      this.messageList.forEach((item) => {
        if (item.checked) {
          messageIds.push(item.message_id);
        }
      });
    }

    if (messageIds.length > 0) {
      const body = {
        message_ids: [...messageIds]
      };
      this.loading = true;
      this.manageService.deleteMessage(body).subscribe(result => {
        if (result.status_code && result.status_code === 200) {
          this.message.success('删除成功');
          this.refreshData();
        } else {
          this.message.error(result.message);
        }
        this.loading = false;
      }, (err: any) => {
        this.loading = false;
        this.message.error('系统异常，请重试');
      });
    } else {
      this.message.info('请选择相关项操作');
    }
  }

  readedMsgData(isAll?) {
    let messageIds = [];
    if (isAll) {
      messageIds = this.messageList.map(item => item.message_id);
    } else {
      this.messageList.forEach((item) => {
        if (item.checked) {
          messageIds.push(item.message_id);
        }
      });
    }

    if (messageIds.length > 0) {
      const body = {
        message_ids: [...messageIds]
      };
      this.loading = true;
      this.manageService.readMessage(body).subscribe(result => {
        if (result.status_code && result.status_code === 200) {
          this.message.success('设置已读成功');
          this.refreshData();
        } else {
          this.message.error(result.message);
        }
        this.loading = false;
      }, (err: any) => {
        this.loading = false;
        this.message.error('系统异常，请重试');
      });
    } else {
      this.message.info('请选择相关项操作');
    }
  }

  changeTabItem(tabItem) {
    this.message_type = tabItem.type;
    this.refreshData(true);
  }

}
