import {Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {GlobalTemplateComponent} from '../../../../../../shared/template/global-template/global-template.component';
import {AuthService} from '../../../../../../core/service/auth.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import {MenuService} from '../../../../../../core/service/menu.service';
import {LaunchRpaService} from '../../../../service/launch-rpa.service';

@Component({
  selector: 'app-launch-template-run-log',
  templateUrl: './launch-template-run-log.component.html',
  styleUrls: ['./launch-template-run-log.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LaunchTemplateRunLogComponent implements OnInit {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;
  @Input() projectTemplateId = '';

  public showLogDetail = false;

  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;


  public sortDataKey = 'create_time';
  public sortDataDirection = 'desc';
  public currentSelectedPage = 'current';

  public filterResult = {
    material_name: {},
    pub_cost: {},
    pub_cpc: {},
    pub_cpm: {},
    pub_ctr: {},
    b_convert: {},
    b_convert_cost: {},
    b_convert_rate: {},
    create_time: {},
    title: {}
  };


  public queryParam = {
    "sheets_setting": {
      "table_setting": {
        "single_condition": [
        ],
        "sort_item": {
          "key": "create_time",
          "dir": "desc"
        },
        "data_range": [],
        "summary_date": "day:1:6"
      }
    }
  };


  public logApiData = [];
  public logApiDataLength = 0;

  public syncChanPubIds = [];
  public apiData = [];
  public accountsList = [];
  public currentPage = 1;
  public pageSize = 30;
  public logDetailPageSize = 30;
  public logDetailCurrentPage = 1;
  public logPageSize = 30;
  public logCurrentPage = 1;
  public loading = false;
  public logLoading = false;
  public logInfoLoading = false;
  public total: number;
  public noResultHeight = document.body.clientHeight - 300;

  public searchName = "";

  public listQueryParams = {
    pConditions: [],
  };

  public detail_status = "";

  public recordId = null;

  public logDetailApiData = [];

  public logDetailApiDataLength = 0;

  public showLogDetailInfo = false;

  public publisherId=6;

  constructor(private authService: AuthService,
              private message: NzMessageService,
              public menuService: MenuService,
              public launchRpaService: LaunchRpaService,
              private modalService: NzModalService) { }

  ngOnInit() {
    this.publisherId=this.menuService.currentPublisherId;
    this.loading = false;
    this.reloadData();
  }


  reloadData(status?) {
    this.refreshData(status);
  }

  sortData(sortInfo,key) {
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


  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this.loading = true;
    this.launchRpaService.getLaunchTemplateLog(this.menuService.currentPublisherId, {}, {
      page: this.currentPage,
      count: this.pageSize,
      project_template_id: this.projectTemplateId
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


  refreshLogDetail(recordId, type?) {
    if (type === 'filter') {
      this.listQueryParams.pConditions = [
        {
          "key": "detail_status",
          "name": "",
          "op": "=",
          "value": this.detail_status
        },
      ];
    }
    this.logLoading = true;
    this.launchRpaService.getLaunchTemplateLogDetail(this.menuService.currentPublisherId, { pConditions: this.listQueryParams.pConditions }, {
      record_id: recordId,
      result_model: 'all',
    })

      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.logApiData = [];
            this.logApiDataLength = 0;
          } else {
            this.logApiData = results['data'];
            this.logApiDataLength = results['data'].length;
          }
          this.logLoading = false;
        },
        (err: any) => {
          this.logLoading = false;
          this.message.error('数据获取异常，请重试');
          this.showLogDetail = false;
        },
        () => { },
      );
  }




  showRunLogDetail(data) {
    this.refreshLogDetail(data['record_id']);
    this.recordId = data['record_id'];
    this.showLogDetail = true;
    this.detail_status = "";
    // this.modalService.create(template);
  }

  cancelShowRunLogDetail() {
    this.showLogDetail = false;
  }

  showRunLogDetailInfo(data) {
    this.showLogDetailInfo = true;
    this.refreshLogDetailInfo(data.record_id,data.pub_adgroup_id);
  }

  refreshLogDetailInfo(recordId, pubAdgroupId) {
    this.logInfoLoading = true;
    this.launchRpaService.getRunLogAdList({ pConditions: [] }, {record_id: recordId, pub_adgroup_id: pubAdgroupId, page: this.logDetailCurrentPage, count: this.logDetailPageSize,})
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.logDetailApiData = [];
            this.logDetailApiDataLength = 0;
          } else {
            this.logDetailApiData = results['data'].detail;
            this.logDetailApiDataLength = results['data'].detail_count;
          }
          this.logInfoLoading = false;
        },
        (err: any) => {
          this.logInfoLoading = false;
          this.message.error('数据获取异常，请重试');
          this.showLogDetailInfo = false;
        },
        () => { },
      );
  }

  cancelShowRunLogDetailInfo() {
    this.showLogDetailInfo = false;
  }

  lookRunLogDetailInfo(data) {
    this.launchRpaService.getAdcreativeTemplatePreviews({chan_pub_id: data.chan_pub_id, pub_adgroup_id: data.pub_adgroup_id, pub_ad_id: data.pub_ad_id}, {})
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            window.open(results.data.preview_url);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }



}
