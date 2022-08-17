import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ManageService } from "../../service/manage.service";
import { ManageItemService } from "../../service/manage-item.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MenuService } from '../../../../core/service/menu.service';
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";

@Component({
  selector: 'app-extension-generator',
  templateUrl: './extension-generator.component.html',
  styleUrls: ['./extension-generator.component.scss']
})
export class ExtensionGeneratorComponent implements OnInit {


  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  selected = []; //选中的行的id
  selected_generator = []; //选中的行的跟踪码信息
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;

  public publisherTypeRelation: Object;
  public noResultHeight = document.body.clientHeight - 272;

  public filterAccountStatusOption = [];
  public filterPublisherOption = [];
  public advertiserList = [];
  public visibleAdd: boolean;
  public visibleDele: boolean;

  filterResult = {
    pub_account_name: {
    },
    advertiser_name: {
    },
    account_status: {
    },
    publisher_id: {

    },
    cid: {

    },
    channel_id: {

    }
  };

  filter = {
    account: {
      op: '=',
      value: ''
    },
    publisher_id: {
      op: '=',
      value: ''
    },
    status: {
      op: '=',
      value: ''
    },
    advertiser: {
      op: '=',
      value: ''
    },
  };

  advertisers = [
    { advertiser_id: 1, advertiser_name: '广告主1' },
    { advertiser_id: 2, advertiser_name: '广告主2' },
    { advertiser_id: 3, advertiser_name: '广告主3' },
    { advertiser_id: 4, advertiser_name: '广告主5' }
  ];
  advertiser_value = {};

  public batchAddGenerator = {
    symbol: 0,
    add_creative: 1,
  };
  public add_creative_checkBox = true;
  public show_type = 'extension';
  public current_channel;
  public filterChannelOption = [
    {
      name: '搜索推广',
      key: 1
    },
    {
      name: '信息流',
      key: 2
    }
  ];

  @ViewChild('noResultTd') tdNode: ElementRef;

  constructor(private manageService: ManageService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private menuService: MenuService,
    private customDataService: CustomDatasService
  ) {
    this.customDataService.dealPublisherNewData().then(() => {
      this.publisherTypeRelation = { ...this.customDataService.publisherNewMapObjKey };
      this.filterPublisherOption = [...this.customDataService.publisherNewList];
    });

    this.filterAccountStatusOption = manageItemService.AccountStatusList;
    this.current_channel = this.menuService.currentChannelId;
  }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;

  }
  clickAddCancel(): void {
    this.visibleAdd = false;
  }

  clickAddOk(): void {
    const parm = JSON.parse(JSON.stringify(this.batchAddGenerator));
    parm['add_creative'] = this.add_creative_checkBox ? 1 : 0;
    this.manageService.addUrlCode({ 'id_list': this.selected }, parm).subscribe(result => {
      if (result['status_code'] === 200) {
        this.message.success('操作成功');
        this.visibleAdd = false;
      }
    });

  }

  clickDeleCancel(): void {
    this.visibleDele = false;
  }

  clickDeleOk(): void {
    this.manageService.removeUrlCode({ 'id_list': this.selected }).subscribe(result => {
      if (result['status_code'] === 200) {
        this.message.success('操作成功');
        this.visibleDele = false;
      }
    });

  }

  _refreshStatus(chanPubId) {
    this.selected = [];
    this.selected_generator = [];
    this.apiData.forEach((item) => {
      if (item.checked) {
        this.selected.push(item.chan_pub_id);
        this.selected_generator.push({
          symbol: item.tracecode_symbol,
          add_creative: item.add_creative_tracecode
        });
      }
    });

    const allChecked = this.apiData.every(value => value.disabled || value.checked);
    const allUnchecked = this.apiData.every(value => !value.checked);
    // 表示不是全选，但是有选中的
    this._indeterminate = ((!allUnchecked) && (!allChecked)) || allChecked;
    this._allChecked = allChecked;

    if (this.selected.length === 1) {
      this.batchAddGenerator = this.selected_generator[0];
      this.add_creative_checkBox = this.selected_generator[0].add_creative === 1 ? true : false;
    } else {
      this.batchAddGenerator = {
        symbol: 0,
        add_creative: 1,
      };
      this.add_creative_checkBox = true;
    }

  }

  _checkAll(value) {
    this.selected = [];
    this.selected_generator = [];
    if (value) {
      this.apiData.forEach(data => {
        if (!data.disabled) {
          data.checked = true;
        }
        if (data.checked) {
          this.selected.push(data.chan_pub_id);
          this.selected_generator.push({
            symbol: data.tracecode_symbol,
            add_creative: data.add_creative_tracecode
          });
        }
      });
      this._indeterminate = true;


    } else {
      this.selected = [];
      this.selected_generator = [];
      this._indeterminate = false;
      this.apiData.forEach(data => data.checked = false);
    }

    if (this.selected.length === 1) {
      this.batchAddGenerator = this.selected_generator[0];
      this.add_creative_checkBox = this.selected_generator[0].add_creative === 1 ? true : false;
    } else {
      this.batchAddGenerator = {
        symbol: 0,
        add_creative: 1,
      };
      this.add_creative_checkBox = true;
    }

  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false; // 表示有选中的，不管是全选还是选个别
    this._allChecked = false;
    const postBody = {
      'pConditions': [],
      is_url_set: 1
    };
    Object.values(this.filterResult).forEach(item => {
      if (item.hasOwnProperty('key')) {
        postBody.pConditions.push(item);
      }
    });


    this.manageService.getAccountList(postBody, { page: this.currentPage, count: this.pageSize }).subscribe(
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
      () => {
      }
    );
  }

  getAdvertiserList() {
    this.manageService.getAdvertiserList({}, { result_model: 'all', need_publish_account: 0 }).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        result['data'].forEach((item) => {
          this.advertiserList.push({
            'name': item.advertiser_name,
            'key': item.cid
          });
        });
      } else if (result['status_code'] && result.status_code === 201) {
        this.message.error('广告主名称已经存在，请重试');
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else {
        this.message.error(result.message);
      }
    }, (err) => {

      this.message.error('系统异常，请重试');
    }
    );
  }

  setAutoUrlcode(chan_pub_id, on, add_creative?, symbol?) {
    const params = {
      add_creative: add_creative, //1:添加创意跟踪 0：关闭
      symbol: symbol,  //0:# 1:&
    };

    this.manageService.setAutoUrlcode(chan_pub_id, on, params).subscribe(
      (result) => {
        if (result['status_code'] && result.status_code === 200) {
          this.message.success('操作成功');
          this.refreshData();
        }

      }
    );
  }

  changeSymbol(data) {
    this.setAutoUrlcode(data['chan_pub_id'], data['auto_tracecode'], data['add_creative_tracecode'], data['tracecode_symbol']);
  }

  ngOnInit() {
    this.getAdvertiserList();
    this.onWindowResize();
    this.advertisers.forEach(item => {
      this.advertiser_value[item.advertiser_id] = item.advertiser_name;
    });
    this.refreshData();
  }

  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }
}
