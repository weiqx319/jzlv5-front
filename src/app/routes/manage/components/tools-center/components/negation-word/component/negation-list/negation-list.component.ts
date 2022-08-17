import { Component, OnInit, HostListener } from '@angular/core';
import {ManageService} from "../../../../../../service/manage.service";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import {AuthService} from "../../../../../../../../core/service/auth.service";
import {AccountBindingKeeperComponent} from "../../../../../../modal/account-binding-keeper/account-binding-keeper.component";
import {AddNegativeWordGroupComponent} from "../../../../../../modal/add-negative-word-group/add-negative-word-group.component";

@Component({
  selector: 'app-negation-list',
  templateUrl: './negation-list.component.html',
  styleUrls: ['./negation-list.component.scss']
})
export class NegationListComponent implements OnInit {

  public currentPage = 1;
  public pageSize = 30;
  public total = 0;
  public loading = false;

  public negativeWordGroupList = [];

  public filterResult = {
    group_name: {},
    // available_media: {},
    user_id: {},
  };

  public filterUserOption = [];

  public isAllChecked = false;
  public isIndeterminate = false;

  public user_id;
  public role_id;

  public noResultHeight = document.body.clientHeight - 272;

  constructor(private manageService: ManageService,
              private authService: AuthService,
              private modalService: NzModalService,
              private message: NzMessageService,
              private route: ActivatedRoute) {

    this.user_id = this.authService.getCurrentAdminOperdInfo().select_uid;
    this.role_id = this.authService.getCurrentAdminOperdInfo().role_id;

  }

  ngOnInit() {
    this.onWindowResize();
    this.refreshData();
    this.getNegationWordGroupUserList();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight =  document.body.clientHeight - 272;
  }

  getNegationWordGroupUserList() {
    this.manageService.getNegationWordGroupUserList().subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        const resultList = [];
        result.data.forEach((v)=> {
          resultList.push({"key": parseInt(v.user_id),"name":v.user_name});
        });

        this.filterUserOption = [...resultList];
      } else {
        this.filterUserOption = [];
      }
    }, (err: any) => {
      this.message.error('数据获取异常，请重试');
    });
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
    this.manageService.getNegativeWordGroupList(postBody, params).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.negativeWordGroupList = result.data.detail;
        this.total = result.data.detail_count;
      } else {
        this.negativeWordGroupList = [];
        this.total = 0;
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.message.error('数据获取异常，请重试');
    });
  }

  addNegativeWordGroup() {
    const add_modal = this.modalService.create({
      nzTitle: '新建否词包',
      nzWidth: 600,
      nzContent: AddNegativeWordGroupComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-negative-word-group',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

  editNegativeWordGroup(data) {
    const add_modal = this.modalService.create({
      nzTitle: '新建否词包',
      nzWidth: 600,
      nzContent: AddNegativeWordGroupComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-negative-word-group',
      nzFooter: null,
      nzComponentParams: {
        groupData: data
      }
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

  checkedChange() {
    const allChecked = this.negativeWordGroupList.every((value) => value.checked);
    const allUnchecked = this.negativeWordGroupList.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this.isIndeterminate = (!allUnchecked && !allChecked) || allChecked;
    this.isAllChecked = allChecked;
  }

  updateAllChecked(value: boolean) {
    if (value) {
      this.negativeWordGroupList.forEach((data) => data.checked = true);
      this.isIndeterminate = true;
    } else {
      this.negativeWordGroupList.forEach((data) => data.checked = false);
      this.isIndeterminate = false;
    }
  }

  delNegativeWordGroup(isAll, data?) {
    const groupIds = [];

    if(isAll) {
      this.negativeWordGroupList.forEach((item) => {
        if (item.checked) {
          groupIds.push(item.group_id);
        }
      });
    } else {
      groupIds.push(data.group_id);
    }

    if (groupIds.length > 0) {
      const body = {
        group_id: [...groupIds]
      };
      this.loading = true;
      this.manageService.deleteNegativeWordGroup(body).subscribe(result => {
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

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

}
