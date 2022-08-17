import {Component, HostBinding, OnInit, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
export interface NoticeIconClick {
  item: NoticeItem;
  title: string;
}
export interface NoticeItem {
  title: string;
  list: NoticeIconList[];
  /** 空列表文本，默认：`无通知` */
  emptyText?: string;
  /** 空列表图像 */
  emptyImage?: string;
  /** 清空文本，默认：`清空` */
  clearText?: string;
}
export interface NoticeIconList {
  [key: string]: any;
  /** 头像图片链接 */
  avatar?: string;
  /** 标题 */
  title?: string;
  /** 描述信息 */
  description?: string;
  /** 时间戳 */
  datetime?: string;
  /** 额外信息，在列表项右上角 */
  extra?: string;
  /** 是否已读状态 */
  read?: boolean;
}





@Component({
  selector: 'app-header-notify',
  templateUrl: './header-notify.component.html',
  styleUrls: ['./header-notify.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderNotifyComponent implements OnInit {
  @HostBinding('class.ad-notice-icon') mainClass = 'true';
  popoverVisible = false;
  loading = false;
  dot = true;
  data: NoticeItem[] = [
    {
      title: '通知',
      list: [],
      emptyText: '你已查看所有通知',
      emptyImage:
        'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg',
      clearText: '清空通知',
    },
    {
      title: '待办',
      list: [],
      emptyText: '你已完成所有待办',
      emptyImage:
        'https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg',
      clearText: '清空待办',
    },
  ];
  count = 5;


  constructor(private msg: NzMessageService) {}

  ngOnInit(): void {
   }


  clear(type: string) {
    this.msg.success(`清空了 ${type}`);
  }

  select(res: any) {
    this.msg.success(`点击了 ${res.title} 的 ${res.item.title}`);
  }


  onVisibleChange(result: boolean) {
    if (result) {
      // this.loadData();
    }

  }

}
