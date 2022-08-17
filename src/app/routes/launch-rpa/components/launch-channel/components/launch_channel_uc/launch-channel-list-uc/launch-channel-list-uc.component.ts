import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { GlobalTemplateComponent } from "../../../../../../../shared/template/global-template/global-template.component";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MenuService } from "../../../../../../../core/service/menu.service";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { AddChannelUcComponent } from "../add-channel-uc/add-channel-uc.component";
import { UploadChannelListComponent } from "../../../../../modal/upload-channel-list/upload-channel-list.component";
import { LaunchChannelEditChannelsComponent } from "../../../../../modal/launch-channel-edit-channels/launch-channel-edit-channels.component";

@Component({
  selector: 'app-launch-channel-list-uc',
  templateUrl: './launch-channel-list-uc.component.html',
  styleUrls: ['./launch-channel-list-uc.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchChannelListUcComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;
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

  public channelSource = 1;

  public filterResult = {
    convert_channel_name: {},
    pub_account_name: {},
    app_type: {},
  };

  _allChecked = false; //全选
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _canEditAll = false; //批量编辑是否禁用

  // 筛选框信息列表
  public configList = [
    { name: '渠道名称', key: 'convert_channel_name', type: 'input', label: 'channelName', optionList: [] },
    { name: '账号', key: 'chan_pub_id', type: 'select', label: 'accountList', optionList: [] },
    { name: '推广对象', key: 'app_type', type: 'select', label: 'appTypeList', optionList: [{ key: '000', name: '落地页' }, { key: '010', name: '安卓' }, { key: '001', name: 'ios' },] },
    { name: '是否可用', key: 'convert_channel_status', type: 'select', label: 'channelStatusList', optionList: [{ key: '0', name: '不可用' }, { key: '1', name: '可用' }] },
  ];
  public _isAllShow = false; //筛选框显示

  //筛选输入框值
  public defaultData = {
    convert_channel_name: '',
    chan_pub_id: '',
    app_type: '',
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
      app_type: [''],
      convert_channel_status: [''],
    });

  }

  ngOnInit() {
    this.loading = false;
    this.refreshData();
    this.getAccountList();
  }

  refreshData(status?) {
    this._allChecked = false;
    //如果是查询和重置
    if (status) {
      this.currentPage = 1;
    }
    //设置查询参数
    const body = {
      "pConditions": [],
      'sort_item':{
        "key": "create_time",
        "dir": "desc"
      }
    };
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
    if (this.defaultData['app_type']) {
      body.pConditions.push({
        "key": "app_type",
        "name": "",
        "op": "=",
        "value": this.defaultData['app_type']
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

    this.launchRpaService.getChannelListByUc(body, {
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
          if (this.apiSearchData&&this.apiSearchData.length>0) {
            this.apiSearchData.forEach(item=> {
              if (item.group_target_url&&item.group_target_url.length>0) {
                item.external_url='';
                item.group_target_url.forEach(data=> {
                  item.external_url+=data.target_url+';';
                });
              }
            });
          }
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
    this.launchRpaService.deleteLaunchChannelListByUc(body, { cid: this.authService.getCurrentUserOperdInfo().select_cid }).subscribe(result => {
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
      nzContent: AddChannelUcComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-channel-uc',
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

  editLaunchChannel(data, copy?) {
    const add_modal = this.modalService.create({
      nzTitle: '编辑渠道',
      nzWidth: 900,
      nzContent: AddChannelUcComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-channel-uc',
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

    this.launchRpaService.syncMaterialJob(this.menuService.currentPublisherId, 'convert', this.syncChanPubIds).subscribe(result => {
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
          "value": "17"
        },
        {
          "key": "channel_id",
          "name": "",
          "op": "=",
          "value": "2"
        },
      ]
    };
    this.launchRpaService.getAccountList(body, {
      page: 1,
      count: 100000,
      cid: this.authService.getCurrentUserOperdInfo().select_cid,
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

  batchCreateChannelModal() {
    const add_modal = this.modalService.create({
      nzTitle: '批量新建渠道',
      nzWidth: 400,
      nzContent: UploadChannelListComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'upload-channel-materials',
      nzFooter: null,
      nzComponentParams: {
        publisherId: this.menuService.currentPublisherId
      },
    });
    add_modal.afterClose.subscribe((result) => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }

  //全选 选择当前页
  _checkAll(value) {

    if (value) {
      this._allChecked = true;
      this.apiSearchData.forEach((data) => {
        data.checked = true;
      });
      this._indeterminate = true;
    } else {
      this._allChecked = false;
      this._indeterminate = false;
      this.apiSearchData.forEach((data) => (data.checked = false));
    }
    this.updateEditPermission();
  }

  _refreshSingleChangeStatus(event?) {
    const allChecked = this.apiSearchData.every(
      (value) => value.checked,
    );
    const allUnchecked = this.apiSearchData.every((value) => !value.checked);

    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;
    this.updateEditPermission();

  }

  //筛选：下拉框值改变
  selectChange(event, type) {

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
      app_type: '',
      convert_channel_status: ''
    };
    this.refreshData(true);
  }

  // 判断批量编辑是否禁用
  updateEditPermission() {
    //列表中有选中的，并且选中的推广对象全部是安卓
    const checkedApiData = this.apiSearchData.filter(value => value.checked === true);
    this._canEditAll = checkedApiData.length && checkedApiData.every(value => value.app_type === '010');
  }

  editChannels() {
    const checkedData = this.apiSearchData.filter(item => item.checked === true);
    const edit_modal = this.modalService.create({
      nzTitle: '批量编辑安卓',
      nzWidth: 900,
      nzContent: LaunchChannelEditChannelsComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'add-channel-uc',
      nzFooter: null,
      nzComponentParams: {
        checkedData: checkedData
      },
    });
    edit_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.currentPage = 1;
        this.refreshData();
      }
    });
  }
}
