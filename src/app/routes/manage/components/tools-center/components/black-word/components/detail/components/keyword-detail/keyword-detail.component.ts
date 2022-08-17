import { Component, OnInit, HostListener } from '@angular/core';
import { ManageService } from "../../../../../../../../service/manage.service";
import { AuthService } from "../../../../../../../../../../core/service/auth.service";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../../../../../../../environments/environment';

@Component({
  selector: 'app-keyword-detail',
  templateUrl: './keyword-detail.component.html',
  styleUrls: ['./keyword-detail.component.scss']
})
export class KeywordDetailComponent implements OnInit {

  public currentPage = 1;
  public pageSize = 500;
  public total = 0;
  public loading = false;

  public keywordList = [];

  public filterResult = {
    pub_keyword: {},
    publisher_id: {},
    operation_status: {},
  };

  public operationStatusList = {
    1: '是',
    2: '否',
  };

  public filterOperationStatusOption = [
    { key: 1, name: '是' },
    { key: 2, name: '否' },
  ];

  public filterPublisherOption = [
    { key: 1, name: '百度' },
    { key: 2, name: '搜狗' },
    { key: 3, name: '360' },
    { key: 4, name: '神马' },
  ];

  public taskId;
  public publisherId;

  public isAllChecked = false;
  public isIndeterminate = false;

  public noResultHeight = document.body.clientHeight - 268 - 60;

  constructor(private authService: AuthService,
    private manageService: ManageService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private route: ActivatedRoute
  ) {
    this.taskId = this.route.snapshot.queryParams['task_id'];
    this.publisherId = this.route.snapshot.queryParams['publisher_id'];
  }

  ngOnInit() {
    this.onWindowResize();
    this.refreshData();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 268 - 60;
  }

  refreshData(status?) {
    this.isIndeterminate = false;
    this.isAllChecked = false;

    if (status) {
      this.currentPage = 1;
    }
    this.loading = true;
    const params: any = {
      task_id: this.taskId,
      apply_level: 4,
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
    this.manageService.getKeywordDetailList(postBody, params).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.keywordList = result.data.detail;
        this.total = result.data.detail_count;
      } else {
        this.keywordList = [];
        this.total = 0;
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.message.error('数据获取异常，请重试');
    });
  }

  checkedChange() {
    const allChecked = this.keywordList.every(
      (value) => value.operation_status == '1' || value.checked
    );
    const allUnchecked = this.keywordList.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this.isIndeterminate = (!allUnchecked && !allChecked) || allChecked;
    this.isAllChecked = allChecked;
  }

  updateAllChecked(value: boolean) {
    if (value) {
      this.keywordList.forEach((data) => {
        if (data.operation_status != '1') {
          data.checked = true;
        }
      });
      this.isIndeterminate = true;
    } else {
      this.keywordList.forEach((data) => data.checked = false);
      this.isIndeterminate = false;
    }
  }

  stopKeyWord() {
    const ids = [];
    this.keywordList.forEach((item) => {
      if (item.checked) {
        ids.push(item.chan_pub_id + '_' + item.pub_account_id + '_' + item.pub_keyword_id);
      }
    });

    if (ids.length > 0) {
      const params: any = {
        task_id: this.taskId,
        apply_level: 4,
        select_type: 'current',
      };

      const postBody = {
        condition_setting: [],
        pub_keyword_ids: [...ids],
      };

      Object.values(this.filterResult).forEach((item) => {
        if (item.hasOwnProperty('key')) {
          postBody.condition_setting.push(item);
        }
      });

      this.loading = true;
      this.manageService.stopKeyword(postBody, params).subscribe(result => {
        if (result.status_code && result.status_code === 200) {
          this.message.success('操作成功');
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

  delKeyWord() {
    const ids = [];
    this.keywordList.forEach((item) => {
      if (item.checked) {
        ids.push(item.chan_pub_id + '_' + item.pub_account_id + '_' + item.pub_keyword_id);
      }
    });

    if (ids.length > 0) {
      const params: any = {
        task_id: this.taskId,
        apply_level: 4,
        select_type: 'current',
      };

      const postBody = {
        condition_setting: [],
        pub_keyword_ids: [...ids],
      };

      Object.values(this.filterResult).forEach((item) => {
        if (item.hasOwnProperty('key')) {
          postBody.condition_setting.push(item);
        }
      });

      this.loading = true;
      this.manageService.deleteKeyword(postBody, params).subscribe(result => {
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


  downloadDetail() {

    const params: any = {
      task_id: this.taskId,
      publisher_id: this.publisherId,
      apply_level: 4,
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
    this.manageService.downloadKeywordDetailList(postBody, params).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.info('当前数据不可下载');
        } else {
          this.message.success('已生成下载任务，请前往下载列表查看');
          // const cacheKey = results['data']['cache_key'];
          // window.open(environment.SERVER_API_URL + '/files_public_down/' + cacheKey);
        }
      },
      (err: any) => {
        this.message.error('系统异常');
      },
      () => {
      }
    );
  }

}
