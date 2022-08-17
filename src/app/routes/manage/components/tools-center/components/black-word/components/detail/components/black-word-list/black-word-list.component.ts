import { Component, OnInit, HostListener } from '@angular/core';
import {ManageService} from "../../../../../../../../service/manage.service";
import {AuthService} from "../../../../../../../../../../core/service/auth.service";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import {environment} from "../../../../../../../../../../../environments/environment";
import {AddBlackWordComponent} from "../../../../../../../../modal/add-black-word/add-black-word.component";

@Component({
  selector: 'app-black-word-list',
  templateUrl: './black-word-list.component.html',
  styleUrls: ['./black-word-list.component.scss']
})
export class BlackWordListComponent implements OnInit {

  public currentPage = 1;
  public pageSize = 30;
  public total = 0;
  public loading = false;

  public blackWordList = [];

  public filterResult = {
    word_name: {},
    apply_level: {},
    user_id: {},
  };

  public applyLevelList = {
    0: '全部',
    4: '关键词',
    5: '创意',
  };

  public filterApplyLevelOption = [
    { key: 0, name: '全部'},
    { key: 4, name: '关键词'},
    { key: 5, name: '创意'},
  ];
  public filterUserOption = [];

  public isAllChecked = false;
  public isIndeterminate = false;

  public publisherId;
  public role_id;

  public dataRange = [];
  public publisherAry = [];

  public isCurrent = false;
  public curData;

  public isShow = {
    black_words: false,
    black_words_all: false,
  };

  public noResultHeight = document.body.clientHeight - 310;

  constructor(private authService: AuthService,
              private manageService: ManageService,
              private modalService: NzModalService,
              private message: NzMessageService,
              private route: ActivatedRoute
  ) {
    this.publisherId = this.route.snapshot.queryParams['publisher_id'];
    this.publisherAry.push(this.publisherId * 1);

    this.role_id = this.authService.getCurrentAdminOperdInfo().role_id;
  }

  ngOnInit() {
    this.onWindowResize();
    this.refreshData();
    this.getBlackWordUserList();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight =  document.body.clientHeight - 310;
  }

  getBlackWordUserList() {
    this.manageService.getBlackWordUserList().subscribe(result => {
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
      publisher_id: this.publisherId,
      page: this.currentPage,
      count: 100000,
    };

    const postBody = {
      condition_setting: [],
    };
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postBody.condition_setting.push(item);
      }
    });
    this.manageService.getBlackWordList(postBody, params).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        const data = [];
        result.data.detail.forEach((value,index)=> {
          data.push({index,...value});
        });


        this.blackWordList = data;

        this.total = result.data.detail_count;
      } else {
        this.blackWordList = [];
        this.total = 0;
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.message.error('数据获取异常，请重试');
    });
  }

  createBlackWord() {
    const add_modal = this.modalService.create({
      nzTitle: '新建黑词',
      nzWidth: 600,
      nzContent: AddBlackWordComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-black-word',
      nzFooter: null,
      nzComponentParams: {
        groupData: {
          publisher_id: this.publisherId,
        }
      }
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

  resetIsShow() {
    this.blackWordList.forEach(item => {
      item.black_words = false;
    });
    this.isShow.black_words = false;
    this.isShow.black_words_all = false;
  }

  batchScreenAll() {
    this.isCurrent = false;

    this.blackWordList.forEach(item => {
      item.black_words = false;
    });
    this.isShow.black_words = false;
    this.isShow.black_words_all = !this.isShow.black_words_all;
  }

  batchScreen(tag, idx, data) {
    this.isCurrent = true;
    this.curData = data;

    this.isShow.black_words_all = false;
    this.isShow.black_words = false;

    this.blackWordList.forEach((item, i) => {
      if (i !== idx) {
        item.black_words = false;
      }
    });
    data.black_words = !data.black_words;
    setTimeout(()=> {
      this.isShow.black_words = data.black_words;
    },0);
  }

  dataRangeChange(data) {
    this.dataRange = data;
    this.resetIsShow();

    if (this.dataRange['select_data'].length) {
      this.batchBlackWord();
    }
  }

  batchBlackWord() {
    const postBody = {
      word_ids: [],
      condition_setting: [],
      pub_account_ids: [...this.dataRange['select_data']],
    };
    const params = {
      publisher_id: this.publisherId,
    };

    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postBody.condition_setting.push(item);
      }
    });

    if (this.isCurrent) {
      postBody.word_ids.push(this.curData.word_id);
      params['select_type'] = 'current';
    } else {
      const wordIds = [];
      this.blackWordList.forEach((item) => {
        if (item.checked) {
          wordIds.push(item.word_id);
        }
      });

      if (wordIds.length) {
        postBody.word_ids = [...wordIds];
        params['select_type'] = 'current';
      } else {
        // params['select_type'] = 'all';

        this.message.error("请选择黑词");
        this.dataRange = [];
        return false;
      }
    }
    this.loading = true;
    this.manageService.batchBalckWord(postBody, params).subscribe(data => {
      if (data['status_code'] && data.status_code === 200) {
        this.message.success('操作成功');
        this.refreshData();
      } else if (data['status_code'] && data.status_code === 205) {

      } else {
        this.message.error(data.message);
      }
      this.loading = false;
    }, (err) => {
      this.loading = false;
      this.message.error('系统异常，请重试');
    }, () => {

    });

    this.dataRange = [];

  }

  downloadBlackWord() {
    this.loading = true;

    const params:any = {
      publisher_id: this.publisherId,
    };

    const postBody = {
      condition_setting: [],
    };
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postBody.condition_setting.push(item);
      }
    });

    this.manageService
      .downloadBlackWord(postBody, params)
      .subscribe(
        (results: any) => {
          this.loading = false;
          if (results.status_code && results.status_code === 200) {
            const cacheKey = results['data']['cache_key'];
            window.open(
              environment.SERVER_API_URL + '/files_public_down/' + cacheKey,
            );
          } else {
            this.message.error('当前不可下载，请稍候重试');
          }
        },
        (err: any) => {
          this.loading = false;
          this.message.error('系统异常，不可下载');
        },
        () => {
          this.loading = false;
        },
      );
  }

  checkedChange() {
    const allChecked = this.blackWordList.every((value) => value.checked);
    const allUnchecked = this.blackWordList.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this.isIndeterminate = (!allUnchecked && !allChecked) || allChecked;
    this.isAllChecked = allChecked;
  }

  updateAllChecked(value: boolean) {
    if (value) {
      this.blackWordList.forEach((data) => data.checked = true);
      this.isIndeterminate = true;
    } else {
      this.blackWordList.forEach((data) => data.checked = false);
      this.isIndeterminate = false;
    }
  }

  delBlackWord(isAll, data?) {
    const wordIds = [];

    if(isAll) {
      this.blackWordList.forEach((item) => {
        if (item.checked) {
          wordIds.push(item.word_id);
        }
      });
    } else {
      wordIds.push(data.word_id);
    }

    if (wordIds.length > 0) {
      const body = {
        word_id: [...wordIds]
      };
      this.loading = true;
      this.manageService.deleteBlackWord(body).subscribe(result => {
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
