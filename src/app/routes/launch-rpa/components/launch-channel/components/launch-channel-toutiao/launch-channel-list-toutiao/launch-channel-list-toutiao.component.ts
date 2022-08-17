import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {AuthService} from '../../../../../../../core/service/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";
import {AddChannelToutiaoComponent} from "../add-channel-toutiao/add-channel-toutiao.component";
import {GlobalTemplateComponent} from '../../../../../../../shared/template/global-template/global-template.component';
import {MenuService} from 'src/app/core/service/menu.service';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-launch-channel-list-toutiao',
  templateUrl: './launch-channel-list-toutiao.component.html',
  styleUrls: ['./launch-channel-list-toutiao.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchChannelListToutiaoComponent implements OnInit {
  @ViewChild(GlobalTemplateComponent, {static: true}) globalTemplate: GlobalTemplateComponent;
  validateChannelForm!: FormGroup;

  public syncChanPubIds = [];
  public apiData = [];
  public currentPage = 1;
  public pageSize = 30;
  public loading = false;
  public total: number;
  public noResultHeight = document.body.clientHeight - 300 - 40;

  public searchName = "";
  public isChannelVisible = false;
  public accountsList = [];
  public apiSearchData = [];

  public channelSource = 'convert';
  public assetType=[];

  // 筛选框信息列表
  public configList = [
    { name: '渠道名称', key: 'convert_channel_name', type: 'input', label: 'channelName', optionList: [] },
    { name: '账号', key: 'chan_pub_id', type: 'select', label: 'accountList', optionList: [] },
    { name: '推广目的', key: 'landing_type', type: 'select', label: 'appTypeList', optionList: [{key: 'APP', name: '应用推广'}, {key: 'LINK', name: '销售线索收集'}, {key: 'QUICK_APP', name: '快应用'}, {key: 'SHOP', name: '电商店铺推广'}] },
    { name: '是否可用', key: 'convert_channel_status', type: 'select', label: 'channelStatusList', optionList: [{ key: '0', name: '不可用' }, { key: '1', name: '可用' }] },
  ];
  public _isAllShow = false; //筛选框显示

  //筛选输入框值
  public defaultData = {
    convert_channel_name: '',
    chan_pub_id: '',
    landing_type: '',
    convert_channel_status: ''
  };

  constructor(private authService: AuthService,
              private message: NzMessageService,
              private menuService: MenuService,
              private modalService: NzModalService,
              public launchRpaService: LaunchRpaService,
              private fb: FormBuilder,) {
    this.validateChannelForm = this.fb.group({
      convert_channel_name: ['', [Validators.required]],
      chan_pub_id: [''],
      landing_type: [''],
      convert_channel_status: [''],
    });
  }

  ngOnInit() {
    this.loading = false;
    this.refreshData();
    this.getAccountList();
  }

  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    //设置查询参数
    const body = { "pConditions": [] };
    if (this.defaultData['convert_channel_name']) {
      body.pConditions.push({
        "key": "convert_channel_name",
        "name": "",
        "op": "like",
        "value": this.defaultData['convert_channel_name']
      });
    }
    if (this.defaultData['chan_pub_id']) {
      body.pConditions.push({
        "key": "chan_pub_id",
        "name": "",
        "op": "=",
        "value": this.defaultData['chan_pub_id']
      });
    }
    if (this.defaultData['landing_type']) {
      body.pConditions.push({
        "key": "landing_type",
        "name": "",
        "op": "=",
        "value": this.defaultData['landing_type']
      });
    }
    if (this.defaultData['convert_channel_status']) {
      body.pConditions.push({
        "key": "convert_channel_status",
        "name": "",
        "op": "=",
        "value": this.defaultData['convert_channel_status']
      });
    }
    this.launchRpaService.getChannelList(body, {
      result_model: 'page',
      page: this.currentPage,
      count: this.pageSize,
    }).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.apiSearchData = [];
          this.total = 0;
        } else {
          this.apiSearchData = results['data']['detail'];
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

  deleteLaunchChannel(data) {
    const body = {
      id_list: [data.convert_channel_id],
    };
    this.launchRpaService.deleteLaunchChannelList(body, {cid: this.authService.getCurrentUserOperdInfo().select_cid}).subscribe(result => {
      if (result['status_code'] == 200) {
        this.message.info('删除成功');
        this.refreshData();
      } else {
        this.message.error(result['message']);
      }
    }, () => {
    }, () => {
      this.loading = false;
    });
  }

  createChannel() {
    const add_modal = this.modalService.create({
      nzTitle: '创建渠道',
      nzWidth: 900,
      nzContent: AddChannelToutiaoComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-channel-toutiao',
      nzFooter: null,
      nzComponentParams: {
        accountsList: this.accountsList
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }

  editLaunchChannel(data,copy?) {
    const add_modal = this.modalService.create({
      nzTitle: '编辑渠道',
      nzWidth: 900,
      nzContent: AddChannelToutiaoComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-channel-toutiao',
      nzFooter: null,
      nzComponentParams: {
        isEdit: true,
        launchChannelId: data.convert_channel_id,
        accountsList: this.accountsList,
        isCopy: copy,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }


  syncChannelModal(): void {
    this.isChannelVisible = true;
  }


  cancelSyncChannel(): void {
    this.isChannelVisible = false;
  }

  handSync(): void {

    if (this.syncChanPubIds.length < 1) {
      this.message.error("请选择帐号");
      return;
    }
    if (this.channelSource==='event'&&this.assetType.length < 1) {
      this.message.error("请选择事件类型");
      return;
    }
    const postBody= {
      publisher_id: this.menuService.currentPublisherId,
      materiel_type: 'convert',
      chan_pub_ids: this.syncChanPubIds,
      sync_type:this.channelSource,
      asset_type:this.assetType
    };

    this.launchRpaService.syncMaterialJobToutiao( postBody,'convert', ).subscribe(result => {
      this.syncChanPubIds = [];
      this.isChannelVisible = false;
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
          "value": "2"
        },
        {
          "key": "account_status",
          "name": "",
          "op": ">",
          "value": -1
        },
      ]
    };
    this.launchRpaService.getAccountList(body, {
      page: 1,
      count: 100000,
      cid: this.authService.getCurrentUserOperdInfo().select_cid,
      user_id: this.authService.getCurrentUserOperdInfo().select_uid,
    })
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            this.accountsList = results['data']['detail'];
            this.configList[1].optionList = this.accountsList.map(value => ({ key: value.chan_pub_id, name: value.pub_account_name }));
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }
  //筛选：查询
  reloadData() {
    this.refreshData(true);
  }

  //筛选：重置
  resetData() {
    this.defaultData = {
      convert_channel_name: '',
      chan_pub_id: '',
      landing_type: '',
      convert_channel_status: ''
    };
    this.refreshData(true);
  }


}
