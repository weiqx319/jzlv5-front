import { generateTimeResult, generateTimeTip } from '@jzl/jzl-util';
import { LocalStorageService } from 'ngx-webstorage';
import { AuthService } from '../../core/service/auth.service';
import { isObject } from "@jzl/jzl-util";
import { MenuService } from '../../core/service/menu.service';
import { NotifyService } from '../../module/notify/notify.service';
import { NzMessageService } from 'ng-zorro-antd/message';


export class DataViewTableComponent {

  public rows = [];
  public summaryData = {};
  public selected = [];
  public selectedLength = 0;
  public selectedType = 'current';

  public columns = [];
  public timeDesc = '';

  public source_summary = 'account';

  public showCreateReport = false;
  public reportPosting = false;

  public time_grain = 'summary';
  public time_grain_filter = 'summary';
  public summary_type_name: any = {
    publisher: '媒体',
    account: '账户',
    campaign: '计划',
    adgroup: '单元',
    keyword: '关键词',
    creative: '创意',
    search_keyword: '搜索词',
    dsa_pattern_day: '高级样式',
    target: '定向',
    advertiser: '广告主',
    department: '事业部',
    materials_video: '素材视频',
    materials_video_label: '素材视频-标签',
  };
  public summary_type_Key = {
    account: 'pub_account_name',
    account_hour: 'pub_account_name',
    campaign: 'pub_campaign_name',
    campaign_hour: 'pub_campaign_name',
    adgroup: 'pub_adgroup_name',
    adgroup_hour: 'pub_adgroup_name',
    creative: 'pub_creative_name',
    creative_hour: 'pub_creative_name',
  };
  public viewReportSetting = {
    report_name: '自定义报表',
    report_data_type: 2,
    channel_id: this.menuService.currentChannelId,
    report_format: 'excel',
    report_freq: 'now',
    email_list: '',
    sheets_setting: [],
    time_grain: 'summary',
  };


  public dataAnalysisTitleKey: any = {
    account: 'pub_account_name',
    campaign: 'pub_campaign_name',
    adgroup: 'pub_adgroup_name',
    keyword: 'pub_keyword',
    publisher: 'publisher',
    search_keyword: 'pub_query',
    creative: 'pub_creative_title',
    advertiser: 'advertiser_name',
    department: 'department',
  };



  public viewTableData = {
    report_type: 'basic_report',
    summary_type: 'account',
    selected_items: [],
    selected_items_chart: [],
    locked_items: [],
    condition: [],
    single_condition: [],
    sort_item: { key: 'pub_cost', dir: 'desc' },
    data_range: [],
    all_summary: false,
    is_compare: false,
    summary_date: 'day:1:6',
    summary_date_compare: 'day:8:6',
    summary_date_alias: '',
    summary_date_compare_alias: '',
    other_compare_date_list: [],
    time_grain: 'summary',
    hours_split: [],
    main_range: 'leftJoin',
    main_device: 'all',
    hidden_condition: false,
    conversion_type: null,
    arrangement_style: 'horizontal' //vertical:竖表  horizontal：横表
  };

  public pageInfo = {
    pageSize: 50,
    allCount: 0,
    currentPage: 1,
    currentPageCount: 0,
    pageSizeList: [
      { key: 10, name: '10条/页' },
      { key: 20, name: '20条/页' },
      { key: 50, name: '50条/页' },
      { key: 100, name: '100条/页' },
      { key: 200, name: '200条/页' },
      { key: 500, name: '500条/页' },
      { key: 1000, name: '1000条/页' },
      { key: 5000, name: '5000条/页' },
    ],
    loadingStatus: 'success',
  };


  public userSelectedOper: {
    select_uid: number;
    select_cid: number;
    role_id: number;
  } = { select_uid: 0, select_cid: 0, role_id: 0 };


  public dataMessages = {
    emptyMessage: `
    <div class="empty-content">
      <span>无符合要求的数据</span>
    </div>
  `,
  };


  constructor(public localSt: LocalStorageService, public authService: AuthService, public menuService: MenuService, public notifyService: NotifyService, public _message: NzMessageService, public reportService: any,) {

  }


  refreshTableSize(event = 'resize') {
    // window.dispatchEvent(new Event(event));
  }



  generateTimeShow() {
    this.timeDesc = generateTimeTip(this.viewTableData['summary_date'], this.viewTableData['summary_date_compare'], this.viewTableData['is_compare']);
  }

  generateTime() {
    return generateTimeResult(this.viewTableData['summary_date'], this.viewTableData['summary_date_compare'], this.viewTableData['is_compare']);
  }



  // -- 保存或获取本地缓存的信息
  getLocalBookMark(prefix, summaryType, channelId = 1, publisherId = 0, isCompany = 0) {
    const currentUser = this.authService.getCurrentUser();
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();

    let cacheKey = "";
    if (isCompany === 1) {
      if (channelId === 1) {
        cacheKey = 'view_mark_company_' + prefix + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
      } else {
        cacheKey = 'view_mark_company_feed_' + prefix + publisherId + '_' + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
      }
    } else {
      if (channelId === 1) {
        cacheKey = 'view_mark_' + prefix + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
      } else {
        cacheKey = 'view_mark_feed_' + prefix + publisherId + '_' + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
      }
    }
    return this.localSt.retrieve(cacheKey);
  }


  setLocalBookMark(prefix, summaryType, data: { summary_type: string, sheets_setting: { table_setting: any }, pageSize?: number, timeGrain?: string }, channelId = 1, publisherId = 0, isCompany = 0) {
    const currentUser = this.authService.getCurrentUser();
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();

    let cacheKey = "";
    if (isCompany === 1) {
      if (channelId === 1) {
        cacheKey = 'view_mark_company_' + prefix + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
      } else {
        cacheKey = 'view_mark_company_feed_' + prefix + publisherId + '_' + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
      }
    } else {
      if (channelId === 1) {
        cacheKey = 'view_mark_' + prefix + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
      } else {
        cacheKey = 'view_mark_feed_' + prefix + publisherId + '_' + summaryType + '_' + currentUser.user_id + '_' + userOperdInfo.select_uid + '_' + userOperdInfo.select_cid;
      }
    }

    this.localSt.store(cacheKey, data);
  }



  // data analysis open/close
  openDataAnalysis(row) {
    row['analysis'] = true;
  }
  closeDataAnalysis(row) {
    row['analysis'] = false;
  }

  // relation checkbox
  selectedChange(type, allSelected, fn) {
    this.selectedType = type;
    if (!allSelected) {
      fn(true);
    }
    setTimeout(() => {
      if (this.selectedType == 'current') {
        this.selectedLength = this.selected.length;
      } else if (this.selectedType == 'all') {
        this.selectedLength = this.pageInfo.allCount;
      }
    }, 0);

  }
  singleSelectedChange(fn, isSelected) {
    this.selectedType = 'current';
    fn(isSelected);
    setTimeout(() => {
      if (this.selectedType == 'current') {
        this.selectedLength = this.selected.length;
      } else if (this.selectedType == 'all') {
        this.selectedLength = this.pageInfo.allCount;
      }

    }, 0);
  }
  // -- check
  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }


  // --
  getTimeGrainFilter(reportType, timeGrain) {
    let resultTimeGrainFilter = timeGrain;
    if (reportType == 'hours_report') {
      resultTimeGrainFilter = 'hour';
    } else if (reportType == 'region_report') {
      resultTimeGrainFilter = 'region';
    }

    if (timeGrain == 'day' && (resultTimeGrainFilter == 'hour' || resultTimeGrainFilter == 'region')) {
      resultTimeGrainFilter = resultTimeGrainFilter + '_day';
    }
    return resultTimeGrainFilter;
  }



  // -- report create

  cancelCreateReport() {
    this.showCreateReport = false;
  }

  handCreateReport() {
    if (this.reportPosting) {
      return false;
    }

    // this.viewTableData.time_grain = this.time_grain;
    this.reportPosting = true;
    const tmpViewTableData = JSON.parse(JSON.stringify(this.viewTableData));
    //选择的只要有分时，报告类型传 hours_report ， 否则 传 basic_report
    if (this.time_grain === 'hour' || this.time_grain === 'hour_day' || this.time_grain === 'hour_weekSplit') {
      tmpViewTableData.report_type = 'hours_report';
    } else if (
      this.time_grain === 'region' ||
      this.time_grain === 'region_day'
    ) {
      tmpViewTableData.report_type = 'region_report';
    } else if (this.source_summary === 'target') {
      tmpViewTableData.report_type = 'target_report';
    } else {
      tmpViewTableData.report_type = 'basic_report';
    }

    if (tmpViewTableData.report_type === 'hours_report') {
      tmpViewTableData.summary_type =
        JSON.parse(JSON.stringify(this.source_summary)) + '_hour';
    } else if (tmpViewTableData.report_type === 'region_report') {
      tmpViewTableData.summary_type =
        JSON.parse(JSON.stringify(this.source_summary)) + '_region';
    } else if (tmpViewTableData.report_type !== 'target_report') {
      tmpViewTableData.summary_type = this.source_summary;
    }
    //选择的只要有分日，汇总传 day
    let grain = 'summary';
    if (this.time_grain.indexOf('day') > -1) {
      grain = 'day';
    } else if (this.time_grain === 'hour_weekSplit') {
      grain = 'weekSplit';
    } else if (['week', 'weekSplit', 'month'].includes(this.time_grain)) {
      grain = this.time_grain;
    }
    tmpViewTableData['time_grain'] = grain;
    this.viewReportSetting.time_grain = tmpViewTableData['time_grain'];
    // tmpViewTableData['time_grain'] = this.time_grain;
    if (
      tmpViewTableData['main_range'] === 'join' &&
      this.time_grain_filter === 'summary'
    ) {
      tmpViewTableData.condition.push({
        key: 'pub_impression',
        data_type: 'pub_metric_data',
        name: '展现',
        type: 'number',
        op: '>',
        value: 0,
      });
    }
    tmpViewTableData.condition.push(...tmpViewTableData.single_condition);
    tmpViewTableData.single_condition = [];

    const postBody = Object.assign({}, this.viewReportSetting, { channel_id: this.menuService.currentChannelId }, {
      sheets_setting: [
        {
          sheet_name: 'sheet_1',
          table_setting: tmpViewTableData,
          charts_setting: [],
          sheet_module: {
            table: false,
            line: true,
            bar: true,
            lineStack: true,
            pie: true,
          },
        },
      ],
      email_list: this.viewReportSetting.email_list.split('\n'),
      report_status: 2,
    });
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    this.reportService.createReport(postBody).subscribe(
      (data: any) => {
        if (data.status_code === 200) {
          this.showCreateReport = false;
          if (isObject(data['data']) && data['data'].hasOwnProperty('job_id')) {
            const notifyData = [];
            notifyData.push({
              report_id: data['data']['report_id'],
              job_id: data['data']['job_id'],
              cid: userOperdInfo.select_cid,
              uid: userOperdInfo.select_uid,
              report_name: this.viewReportSetting.report_name,
            });
            this.notifyService.notifyData.next({
              type: 'report',
              data: notifyData,
            });
          }
          this._message.success('保存报表成功，您可到报表页去查看并下载');
        } else {
          this._message.error('保存报表失败,请重试');
        }
      },
      (err: any) => {
        this._message.error('保存报表失败,请重试');

      },
      () => {
        this.reportPosting = false;
      },
    );
  }

  // -- report end






}
