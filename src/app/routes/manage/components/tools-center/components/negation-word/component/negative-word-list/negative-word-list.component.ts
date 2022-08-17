import { Component, OnInit, HostListener } from '@angular/core';
import {AuthService} from "../../../../../../../../core/service/auth.service";
import {ManageService} from "../../../../../../service/manage.service";
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import {AddNegativeWordGroupComponent} from "../../../../../../modal/add-negative-word-group/add-negative-word-group.component";
import {AddNegativeWordComponent} from "../../../../../../modal/add-negative-word/add-negative-word.component";
import {environment} from "../../../../../../../../../environments/environment";

@Component({
  selector: 'app-negative-word-list',
  templateUrl: './negative-word-list.component.html',
  styleUrls: ['./negative-word-list.component.scss']
})
export class NegativeWordListComponent implements OnInit {

  public currentPage = 1;
  public pageSize = 30;
  public total = 0;
  public loading = false;

  public negativeWordList = [];

  public filterResult = {
    word_name: {},
    word_type: {},
    byte_count: {},
    user_id: {},
  };

  public wordTypeList = {
    1: '短语否定',
    2: '精确否定',
  };

  public filterWordTypeOption = [
    { key: 1, name: '短语否定'},
    { key: 2, name: '精确否定'},
  ];
  public filterUserOption = [];

  public isAllChecked = false;
  public isIndeterminate = false;

  public groupId;
  public groupName;

  public user_id;
  public role_id;

  public dataRange = [];
  public publisherAry = [1, 2, 3, 4];

  public wordType;
  public isCurrent = false;
  public curData;

  public isShow = {
    negative_words: false,
    negative_words_all: false,
    exact_negative_words: false,
    exact_negative_words_all: false,
  };

  public noResultHeight = document.body.clientHeight - 310;

  constructor(private authService: AuthService,
              private manageService: ManageService,
              private modalService: NzModalService,
              private message: NzMessageService,
              private route: ActivatedRoute
  ) {
    this.groupId = this.route.snapshot.queryParams['group_id'];

    this.user_id = this.authService.getCurrentAdminOperdInfo().select_uid;
    this.role_id = this.authService.getCurrentAdminOperdInfo().role_id;
  }

  ngOnInit() {
    this.onWindowResize();
    this.refreshData();
    this.getNegativeWordGroupName();
    this.getNegationWordUserList();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight =  document.body.clientHeight - 310;
  }

  getNegativeWordGroupName() {
    this.manageService.getNegativeWordGroupName({group_id: this.groupId}).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.groupName = result.data[0].group_name;
      } else {
      }
    }, (err: any) => {
      this.message.error('数据获取异常，请重试');
    });
  }

  getNegationWordUserList() {
    this.manageService.getNegationWordUserList().subscribe(result => {
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
      group_id: this.groupId,
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
    this.manageService.getNegativeWordList(postBody, params).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.negativeWordList = result.data.detail;
        this.total = result.data.detail_count;
      } else {
        this.negativeWordList = [];
        this.total = 0;
      }
      this.loading = false;
    }, (err: any) => {
      this.loading = false;
      this.message.error('数据获取异常，请重试');
    });
  }

  createNegativeWord() {
    const add_modal = this.modalService.create({
      nzTitle: '新建否词',
      nzWidth: 600,
      nzContent: AddNegativeWordComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-negative-word',
      nzFooter: null,
      nzComponentParams: {
        groupData: {
          group_id: this.groupId,
          group_name: this.groupName,
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
    this.negativeWordList.forEach(item => {
      item.negative_words = false;
      item.exact_negative_words = false;
    });
    this.isShow.negative_words = false;
    this.isShow.negative_words_all = false;
    this.isShow.exact_negative_words = false;
    this.isShow.exact_negative_words_all= false;
  }

  addNegativeAll(tag) {
    this.wordType = tag;
    this.isCurrent = false;

    this.negativeWordList.forEach(item => {
      item.negative_words = false;
      item.exact_negative_words = false;
    });
    this.isShow.negative_words = false;
    this.isShow.exact_negative_words = false;

    if (tag === 1) { // 短语否定
      this.isShow.exact_negative_words_all= false;
      this.isShow.negative_words_all = !this.isShow.negative_words_all;
    } else if (tag === 2) { // 精确否定
      this.isShow.negative_words_all = false;
      this.isShow.exact_negative_words_all = !this.isShow.exact_negative_words_all;
    }
  }

  addNegative(tag, idx, data) {
    this.wordType = tag;
    this.isCurrent = true;
    this.curData = data;

    this.isShow.negative_words_all = false;
    this.isShow.exact_negative_words_all = false;
    this.isShow.negative_words = false;
    this.isShow.exact_negative_words = false;

    if (tag === 1) { // 短语否定
      this.negativeWordList.forEach((item, i) => {
        if (i !== idx) {
          item.negative_words = false;
        }
        item.exact_negative_words = false;
      });
      data.negative_words = !data.negative_words;
      setTimeout(()=> {
        this.isShow.negative_words = data.negative_words;
      },0);
    } else if (tag === 2) { // 精确否定
      this.negativeWordList.forEach((item, i) => {
        if (i !== idx) {
          item.exact_negative_words = false;
        }
        item.negative_words = false;
      });
      data.exact_negative_words = !data.exact_negative_words;
      setTimeout(()=> {
        this.isShow.exact_negative_words = data.exact_negative_words;
      },0);
    }
  }

  downloadNegativeWord() {
    this.loading = true;

    const params:any = {
      group_id: this.groupId,
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
      .downloadNegativeWord(postBody, params)
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
    const allChecked = this.negativeWordList.every((value) => value.checked);
    const allUnchecked = this.negativeWordList.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this.isIndeterminate = (!allUnchecked && !allChecked) || allChecked;
    this.isAllChecked = allChecked;
  }

  updateAllChecked(value: boolean) {
    if (value) {
      this.negativeWordList.forEach((data) => data.checked = true);
      this.isIndeterminate = true;
    } else {
      this.negativeWordList.forEach((data) => data.checked = false);
      this.isIndeterminate = false;
    }
  }

  delNegativeWord(isAll, data?) {
    const wordIds = [];

    if(isAll) {
      this.negativeWordList.forEach((item) => {
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
      this.manageService.deleteNegativeWord(body).subscribe(result => {
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

  dataRangeChange(data) {
    this.dataRange = data;
    this.resetIsShow();

    if (this.dataRange['select_data'].length) {
      this.addNegativeWord();
    }
  }

  addNegativeWord() {
    const postBody = {
      negative_words: {"is_edit": false, "edit_type": "add", "value": []},
      exact_negative_words: {"is_edit": false, "edit_type": "add", "value": []},
      condition_setting: [],
      word_type: this.wordType,
    };
    const params = {};

    if (this.dataRange['select_type'] === 'adgroup') {
      params['level_type'] = 2;
      postBody['pub_adgroup_ids'] = [...this.dataRange['select_data']];
    } else if (this.dataRange['select_type'] === 'campaign') {
      params['level_type'] = 1;
      postBody['pub_campaign_ids'] = [...this.dataRange['select_data']];
    }

    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postBody.condition_setting.push(item);
      }
    });

    if (this.isCurrent) {
      if (this.wordType === 1) {
        postBody.negative_words['value'].push(this.curData.word_name);
        postBody.negative_words['is_edit'] = true;
      } else {
        postBody.exact_negative_words['value'].push(this.curData.word_name);
        postBody.exact_negative_words['is_edit'] = true;
      }
      params['select_type'] = 'current';
    } else {
      const wordIds = [];
      this.negativeWordList.forEach((item) => {
        if (item.checked) {
          wordIds.push(item.word_name);
        }
      });

      if (wordIds.length) {
        if (this.wordType === 1) {
          postBody.negative_words['value'] = [...wordIds];
          postBody.negative_words['is_edit'] = true;
        } else {
          postBody.exact_negative_words['value'] = [...wordIds];
          postBody.exact_negative_words['is_edit'] = true;
        }
        params['select_type'] = 'current';
      } else {
        // params['select_type'] = 'all';
        // if (this.wordType === 1) {
        //   postBody.negative_words['is_edit'] = true;
        // } else {
        //   postBody.exact_negative_words['is_edit'] = true;
        // }

        this.message.error("请选择否词");
        this.dataRange = [];
        return false;
      }
    }
    this.loading = true;
    this.manageService.addNegativeWord(postBody, params).subscribe(data => {
      if (data['status_code'] && data.status_code === 200) {
        this.message.success('添加成功');
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
}
