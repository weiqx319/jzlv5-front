
import { isArray } from '@jzl/jzl-util';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { deepCopy, formatDate } from '@jzl/jzl-util';
import { AssetManagementService } from './../../../../asset-management.service';
import { AuthService } from '../../../../../../core/service/auth.service';
import { MenuService } from '../../../../../../core/service/menu.service';
import { SyncCustomAudienceComponent } from './../../../../modal/sync-custom-audience/sync-custom-audience.component';
import { UploadCustomAudienceComponent } from './../../../../modal/upload-custom-audience/upload-custom-audience.component';
import { PushAccountComponent } from '../../../../modal/push-account/push-account.component';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { PushAccountLogComponent } from '../../../../modal/push-account-log/push-account-log.component';
import { ConversionUploadService } from './../../../../../manage/service/conversion-upload.service';

@Component({
  selector: 'app-audience-list',
  templateUrl: './audience-list.component.html',
  styleUrls: ['./audience-list.component.scss'],
  providers: [ConversionUploadService],
})
export class AudienceListComponent implements OnInit {
  validateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private assetManagementService: AssetManagementService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private authService: AuthService,
    public menuService: MenuService,
    private drawerService: NzDrawerService,
    public uploadService: ConversionUploadService,
  ) {
    this.validateForm = this.fb.group({
      custom_audience_name: [''],
      status: [''],
      source: [''],
      type: [''],
      tag: [''],
      create_time: [[]],
    });
  }
  private updateModal = null;
  public can_nav = true;

  // 人群状态
  public audienceStatusObj = {
    publisher_7: {
      0: '校验中',
      1: "覆盖校验中",
      2: "已生效",
      3: "校验失败",
      4: "覆盖人数过少",
      5: "待预估",
      6: "扩展中",
      7: "扩展失败",
      8: "运算中",
      9: "运算失败",
      10: "已推送",
      11: "已过期",
      12: "等待拓展",
      13: "等待运算",
      14: "推送中",
      15: "推送失败",
      16: "等待二次检查",
      17: "等待重新刷新",
      18: "历史包looklike拓展",
      19: "历史包BI覆盖校验",
      20: "任务处理中",
      21: "等待外部系统处理",
      22: "被用户删除",
      23: "已从abase删除",
      24: "人群包依赖的标签下线，等待标签上线",
      25: "过期处理中",
      26: "已过期且各解绑操作完成",
    },
    publisher_6: {
      PENDING: '待处理',
      PROCESSING: "处理中",
      SUCCESS: "成功",
      ERROR: "错误",
    }

  }
  // 人群类型
  public audienceTypeObj = {
    publisher_7: {
      CUSTOM_AUDIENCE_TYPE_UPLOAD: "上传",
      CUSTOM_AUDIENCE_TYPE_EXTEND: "扩展",
      CUSTOM_AUDIENCE_TYPE_OPERATE: "运算",
      CUSTOM_AUDIENCE_TYPE_RULE: "规则",
      CUSTOM_AUDIENCE_TYPE_DATA_SOURCE: "文件数据源上传",
      CUSTOM_AUDIENCE_TYPE_THIRD_PARTY: "第三方数据规则",
      CUSTOM_AUDIENCE_TYPE_BRAND: "品牌DMP规则包",
      CUSTOM_AUDIENCE_TYPE_FRIEND: "好友扩展",
      CUSTOM_AUDIENCE_TYPE_THEME: "运营主题",
      CUSTOM_AUDIENCE_TYPE_FINANCE: "金融数据",
      CUSTOM_AUDIENCE_TYPE_PACK_RULE: "pack_rule运算",
      CUSTOM_AUDIENCE_TYPE_ONE_KEY: "一键拓展",
      CUSTOM_AUDIENCE_TYPE_DOU_PLUS: "抖+粉丝合并包"
    },
    publisher_6: {
      CUSTOMER_FILE: "号码文件人群",
      LOOKALIKE: "拓展人群",
      USER_ACTION: "用户行为人群",
      LBS: "地理位置人群",
      KEYWORD: "关键词人群",
      AD: "广告人群",
      COMBINE: "组合人群",
      LABEL: "标签人群",
    }
  }
  // 筛选项
  public filterItemList = {
    publisher_7: [
      { name: '人群名称', key: 'custom_audience_name', type: 'input', op: 'like' },
      { name: '人群状态', key: 'status', type: 'select', optionList: [], op: '=' },
      { name: '人群类型', key: 'source', type: 'select', optionList: [], op: '=' },
      { name: '人群分组', key: 'tag', type: 'select', optionList: [], op: '=' },
      { name: '创建时间', key: 'create_time', type: 'date', op: "between", },
    ],
    publisher_6: [
      { name: '人群名称', key: 'custom_audience_name', type: 'input', op: 'like' },
      { name: '人群状态', key: 'status', type: 'select', optionList: [], op: '=' },
      { name: '人群类型', key: 'type', type: 'select', optionList: [], op: '=' },
      { name: '创建时间', key: 'create_time', type: 'date', op: "between", },
    ],
  };


  public defaultData = {
    publisher_id: this.menuService.currentPublisherId,
    cid: 25,
    custom_audience_name: '',
    status: '',
    source: '',
    type: '',
    tag: '',
    create_time: [],
  };
  public filterResult = {

  };

  indeterminate = false;
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;


  public apiData = [];
  public accountsList = [];
  public currentPage = 1;
  public pageSize = 30;
  public loading = false;
  public total = 10;
  public noResultHeight = 500;

  public sortDataKey = 'create_time';
  public sortDataDirection = 'desc';
  public currentSelectedPage = 'current';

  public queryParam = {
    pConditions: [],
    sort_item: {
      key: "create_time",
      dir: "desc"
    },
    cid: 25,
    publisher_id: this.menuService.currentPublisherId,
  };

  public publisher_id = this.menuService.currentPublisherId;

  ngOnInit(): void {
    this.getAccountList();
    // 初始化筛选项中select选项
    this.initFilterItemOptions();
    this.reloadData();
  }

  // 初始化筛选项中select选项
  initFilterItemOptions() {
    this.filterItemList['publisher_' + this.publisher_id].forEach(element => {
      if (element.type === 'select') {
        if (element.key === 'tag') {
          let tagList = [];
          this.assetManagementService.getCustomAudienceTagList().subscribe(
            (results: any) => {
              if (results.status_code === 200) {
                tagList = results['data'];
                element.optionList.length = 0;
                tagList.forEach(item => {
                  element.optionList.push({ value: item, label: item })
                });
              }
            },
            (err: any) => {
              this.message.error('数据获取异常，请重试');
            },
            () => { },
          );
        } else {
          let obj;
          if (element.key === 'status') {//人群状态
            obj = this.audienceStatusObj['publisher_' + this.publisher_id];
          } else if (element.key === 'source' || element.key === 'type') {//人群类型：source巨量、type:腾讯
            obj = this.audienceTypeObj['publisher_' + this.publisher_id];
          }
          element.optionList.length = 0;
          for (const key in obj) {
            element.optionList.push({ value: key, label: obj[key] })
          }
        }
      }
    });
  }

  getAccountList() {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": this.menuService.currentPublisherId
        },
        {
          "key": "channel_id",
          "name": "",
          "op": "=",
          "value": this.menuService.currentChannelId
        }
      ]
    };
    this.assetManagementService.getAccountList(body, {
      page: 1,
      count: 100000,
      cid: this.authService.getCurrentUserOperdInfo().select_cid,
      user_id: this.authService.getCurrentUserOperdInfo().select_uid,
    })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.accountsList = results['data']['detail'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  reloadData(status?) {
    this.refreshData(status);
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;
    this.loading = true;

    const postData = deepCopy(this.queryParam);
    postData.sort_item = { key: this.sortDataKey, dir: this.sortDataDirection };
    postData.publisher_id = this.defaultData.publisher_id;
    postData.cid = this.defaultData.cid;

    this.filterItemList['publisher_' + this.publisher_id].forEach(item => {
      if ((isArray(this.defaultData[item.key]) && this.defaultData[item.key].length > 0) || (!isArray(this.defaultData[item.key]) && this.defaultData[item.key])) {
        const condition = {
          "key": item.key,
          "name": item.name,
          "op": item.op,
          "value": this.defaultData[item.key]
        }
        if (item.type === 'date') {
          condition.value = formatDate(new Date(this.defaultData[item.key][0]), 'yyyy/MM/dd') + '-' + formatDate(new Date(this.defaultData[item.key][1]), 'yyyy/MM/dd')
        }
        postData.pConditions.push(condition);
      }
    });

    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        postData.pConditions.push(item);
      }
    });


    this.assetManagementService.getCustomAudienceList(postData, {
      page: this.currentPage,
      count: this.pageSize,
    })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.total = 0;
          } else {
            this.apiData = results['data']['detail'];
            this.total = results['data']['detail_count'];
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  resetData() {
    this.defaultData = {
      publisher_id: this.menuService.currentPublisherId,
      cid: 25,
      custom_audience_name: '',
      status: '',
      source: '',
      type: '',
      tag: '',
      create_time: [],
    };
    this.reloadData();
  }

  refreshChecked() {
    this._indeterminate = false;
    this._allChecked = false;
    this.apiData.forEach(data => {
      data['checked'] = false;
    });
  }




  sortData(sortInfo, key) {
    if (sortInfo == 'ascend') {
      this.sortDataKey = key;
      this.sortDataDirection = 'asc';
    } else if (sortInfo == 'descend') {
      this.sortDataKey = key;
      this.sortDataDirection = 'desc';
    } else {
      this.sortDataKey = 'create_time';
      this.sortDataDirection = 'desc';
    }
    this.refreshData();

  }

  _checkAllPage(value) {
    this.currentSelectedPage = 'all';
    if (value) {
      this._allChecked = true;
      this.apiData.forEach((data) => {
        data['checked'] = true;
      });
      this._indeterminate = true;
    } else {
      this._allChecked = false;
      this._indeterminate = false;
      this.apiData.forEach((data) => (data['checked'] = false));
    }
  }
  _checkAll(value) {
    this.indeterminate = false;
    this.currentSelectedPage = 'current';
    if (value) {
      this._allChecked = true;
      this.apiData.forEach((data) => {
        data['checked'] = true;
      });
      this._indeterminate = true;
    } else {
      this._allChecked = false;
      this._indeterminate = false;
      this.apiData.forEach((data) => (data['checked'] = false));
    }
  }
  _refreshSingleChangeStatus(event?, data?) {
    if (data) {
      data['checked'] = event;
    }
    this.currentSelectedPage = 'current';
    const allChecked = this.apiData.every(
      (value) => value['checked'],
    );
    const allUnchecked = this.apiData.every((value) => !value['checked']);
    if (!allUnchecked && !allChecked) {
      this.indeterminate = true;
    } else {
      this.indeterminate = false;
    }
    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;
  }


  getSelectedData() {
    const tempData = [];
    this.apiData.forEach(item => {
      if (item.checked) {
        tempData.push(item.material_id);
      }
    });

    const tempPostData = {
      selected_type: this.currentSelectedPage,
      selected_data: [],
      selected_data_ids: tempData,
      selected_length: tempData.length,
      sheets_setting: {}
    };

    if (tempPostData.selected_type == 'all') {
      const postData = deepCopy(this.queryParam);
      postData.sort_item = { key: this.sortDataKey, dir: this.sortDataDirection };

      Object.values(this.filterResult).forEach((item) => {
        if (item.hasOwnProperty('key')) {
          postData.pConditions.push(item);
        }
      });
      tempPostData.sheets_setting = postData;
      return tempPostData;
    } else {
      return tempPostData;
    }

  }


  // 人群包上传
  uploadCustomAudience() {
    this.updateModal = this.modalService.create({
      nzTitle: '上传人群包',
      nzWidth: 600,
      nzContent: UploadCustomAudienceComponent,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
    this.updateModal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
      if (result['can_jump'] === true) {
        this.can_nav = true;
      } else if (result['can_jump'] === false) {
        this.can_nav = false;
      }
    });
  }

  // 同步媒体人群包
  syncAudience() {
    this.updateModal = this.modalService.create({
      nzTitle: '同步媒体人群包',
      nzWidth: 600,
      nzContent: SyncCustomAudienceComponent,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
    this.updateModal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }
  // 推送账户
  pushAccount(data) {
    this.updateModal = this.modalService.create({
      nzTitle: '推送账户',
      nzWidth: 600,
      nzContent: PushAccountComponent,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
      nzComponentParams: {
        custom_audience_id: data['custom_audience_id'],
        chan_pub_id: data['chan_pub_id']
      }
    });

    this.updateModal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }

  // 查看推送记录
  pushAccountLog(data) {
    const drawerRef = this.drawerService.create<PushAccountLogComponent>({
      nzTitle: '推送记录列表',
      nzWidth: '70%',
      nzContent: PushAccountLogComponent,
      nzContentParams: {
        custom_audience_id: data['custom_audience_id'],
        chan_pub_id: data['chan_pub_id']
      }
    });

    drawerRef.afterClose.subscribe(data => {
      if (data === 'onOk') {
      }
    });
  }

}
