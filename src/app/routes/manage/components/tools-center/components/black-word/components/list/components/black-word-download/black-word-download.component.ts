import {Component, HostListener, OnInit} from '@angular/core';
import {ManageService} from "../../../../../../../../service/manage.service";
import {AuthService} from "../../../../../../../../../../core/service/auth.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {NzMessageService} from "ng-zorro-antd/message";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../../../../../../../../../environments/environment";

@Component({
  selector: 'app-black-word-download',
  templateUrl: './black-word-download.component.html',
  styleUrls: ['./black-word-download.component.scss']
})
export class BlackWordDownloadComponent implements OnInit {

  public currentPage = 1;
  public pageSize = 30;
  public total = 0;
  public loading = false;

  public filterResult = {
    publisher_id: {},
    task_id: {},
    status: {},
    apply_level:{}
  };

  public filterPublisherOption = [
    { key: 1, name: '百度'},
    { key: 2, name: '搜狗'},
    { key: 3, name: '360'},
    { key: 4, name: '神马'},
  ];
  public filterStatusOption = [
    { key: 0, name: '待生成'},
    { key: 1, name: '生成中'},
    { key: 2, name: '生成成功'},
    { key: 3, name: '生成失败'},
  ];
  public filterApplyLevelOption = [
    { key: 0, name: '全部'},
    { key: 4, name: '关键词'},
    { key: 5, name: '创意'},
  ];

  public taskStatusList = {
    0: '待生成',
    1: '生成中',
    2: '生成成功',
    3: '生成失败',
  };
  public applyLevelList = {
    0: '全部',
    4: '关键词',
    5: '创意',
  };

  public blackWordDownloadList = [];

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

    this.manageService.getBlackWordDownloadList(postBody, params).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.blackWordDownloadList = result.data.detail;
        this.total = result.data.detail_count;
      } else {
        this.blackWordDownloadList = [];
        this.total = 0;
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.message.error('数据获取异常，请重试');
    });
  }

  checkedChange() {
    const allChecked = this.blackWordDownloadList.every((value) => value.checked);
    const allUnchecked = this.blackWordDownloadList.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this.isIndeterminate = (!allUnchecked && !allChecked) || allChecked;
    this.isAllChecked = allChecked;
  }

  updateAllChecked(value: boolean) {
    if (value) {
      this.blackWordDownloadList.forEach((data) => data.checked = true);
      this.isIndeterminate = true;
    } else {
      this.blackWordDownloadList.forEach((data) => data.checked = false);
      this.isIndeterminate = false;
    }
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }

  download(data) {
    this.manageService.getBlackWordDownloadDetail(data.download_id).subscribe(results => {
      if (results.status_code !== 200) {
        this.message.info('当前数据不可下载');
      } else {
        const cacheKey = results['data']['cache_key'];
        window.open(environment.SERVER_API_URL + '/files_down/' + cacheKey);
      }
    }, (err: any) => {
      this.message.error('数据获取异常，请重试');
    });
  }

}
