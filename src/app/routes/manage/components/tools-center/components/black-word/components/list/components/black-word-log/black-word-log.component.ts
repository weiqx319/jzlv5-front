import { Component, OnInit, HostListener } from '@angular/core';
import {ManageService} from "../../../../../../../../service/manage.service";
import {AuthService} from "../../../../../../../../../../core/service/auth.service";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-black-word-log',
  templateUrl: './black-word-log.component.html',
  styleUrls: ['./black-word-log.component.scss']
})
export class BlackWordLogComponent implements OnInit {

  public currentPage = 1;
  public pageSize = 30;
  public total = 0;
  public loading = false;

  public filterResult = {
    publisher_id: {},
    task_result: {},
  };

  public filterPublisherOption = [
    { key: 1, name: '百度'},
    { key: 2, name: '搜狗'},
    { key: 3, name: '360'},
    { key: 4, name: '神马'},
  ];

  public taskStatusList = {
    0: '待处理',
    1: '处理中',
    3: '成功',
    4: '失败',
  };

  public blackWordLogList = [];

  public isAllChecked = false;
  public isIndeterminate = false;

  public noResultHeight = document.body.clientHeight - 272;

  constructor(private manageService: ManageService,
              private authService: AuthService,
              private modalService: NzModalService,
              private message: NzMessageService,
              private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.onWindowResize();
    this.refreshData();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight =  document.body.clientHeight - 272;
  }

  refreshData(status?) {
    this.isIndeterminate = false;
    this.isAllChecked = false;

    if (status) {
      this.currentPage = 1;
    }
    this.loading = true;

    const params:any = {
      page: this.currentPage,
      count: this.pageSize,
    };
    const postBody = {
      condition_setting: [],
    };
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postBody.condition_setting.push(item);
      }
    });

    this.manageService.getBlackWordLogList(postBody, params).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.blackWordLogList = result.data.detail;
        this.total = result.data.detail_count;
      } else {
        this.blackWordLogList = [];
        this.total = 0;
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.message.error('数据获取异常，请重试');
    });
  }

  checkedChange() {
    const allChecked = this.blackWordLogList.every((value) => value.checked);
    const allUnchecked = this.blackWordLogList.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this.isIndeterminate = (!allUnchecked && !allChecked) || allChecked;
    this.isAllChecked = allChecked;
  }

  updateAllChecked(value: boolean) {
    if (value) {
      this.blackWordLogList.forEach((data) => data.checked = true);
      this.isIndeterminate = true;
    } else {
      this.blackWordLogList.forEach((data) => data.checked = false);
      this.isIndeterminate = false;
    }
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

}
