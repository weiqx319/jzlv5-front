import { Component, OnInit, HostListener } from '@angular/core';
import {ManageService} from "../../../../../../../../service/manage.service";
import {AuthService} from "../../../../../../../../../../core/service/auth.service";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-black-group-list',
  templateUrl: './black-group-list.component.html',
  styleUrls: ['./black-group-list.component.scss']
})
export class BlackGroupListComponent implements OnInit {

  public currentPage = 1;
  public pageSize = 30;
  public total = 0;
  public loading = false;

  public blackWordGroupList = [];

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
    this.manageService.getBlackWordGroupList(params).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.blackWordGroupList = [...result.data];
        this.total = this.blackWordGroupList.length;
      } else {
        this.blackWordGroupList = [];
        this.total = 0;
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.message.error('数据获取异常，请重试');
    });
  }

  checkedChange() {
    const allChecked = this.blackWordGroupList.every((value) => value.checked);
    const allUnchecked = this.blackWordGroupList.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this.isIndeterminate = (!allUnchecked && !allChecked) || allChecked;
    this.isAllChecked = allChecked;
  }

  updateAllChecked(value: boolean) {
    if (value) {
      this.blackWordGroupList.forEach((data) => data.checked = true);
      this.isIndeterminate = true;
    } else {
      this.blackWordGroupList.forEach((data) => data.checked = false);
      this.isIndeterminate = false;
    }
  }

}
