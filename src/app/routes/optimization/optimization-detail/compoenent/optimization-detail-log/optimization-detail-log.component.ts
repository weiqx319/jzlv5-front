import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { isNull, isUndefined } from "@jzl/jzl-util";
import { OptimizationDetailLogService } from "../../../service/optimization-detail-log.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { ActivatedRoute, Router } from "@angular/router";
import { OptimizationService } from "../../../service/optimization.service";
import { differenceInCalendarDays } from "date-fns";
import { formatDate } from "@jzl/jzl-util";
import { environment } from "../../../../../../environments/environment";
import { AuthService } from "../../../../../core/service/auth.service";

@Component({
  selector: 'app-optimization-detail-log',
  templateUrl: './optimization-detail-log.component.html',
  styleUrls: ['./optimization-detail-log.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [OptimizationDetailLogService]
})
export class OptimizationDetailLogComponent implements OnInit, AfterViewInit {
  public today = new Date();
  public optimizationId = '';
  public tableHeight = document.body.clientHeight - 60 - 60 - 36 - 30 - 60 - 30;
  public dataLoading = false;
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
    ]
  };
  public logTime = [new Date(), new Date()];
  public rows = [];
  public selected = [];
  public loadingIndicator = false;

  public publishId = 2;
  public keywordSelect = {
    'publish3': [
      { 'value': 'pub_keyword', 'name': '关键词' }
    ],
    "publishElse": [
      { 'value': 'pub_keyword', 'name': '关键词' },
      { 'value': 'ranking_domains', 'name': '竞争域名' }
    ]
  };
  public optimizationResult = [
    { 'value': '0', 'name': '调价完成' },
    { 'value': '1', 'name': '调价中' },
    { 'value': '2', 'name': '成功' },
    { 'value': '3', 'name': '完成' },
  ];

  public keywordCondition = {
    "filter_filed": 'pub_keyword', //关键词
    "filter_value": '',  //搜索value
    "exactness": false,  //是否精确
    "result_type": '0'  //优化结果
  };
  public clickReal = false;

  @ViewChild('nzTable', { static: true }) table: NzTableComponent;

  constructor(
    private _http: OptimizationService,
    private _message: NzMessageService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private logService: OptimizationDetailLogService,
    private renderer: Renderer2
  ) {
    this.optimizationId = this.route.snapshot.parent.paramMap.get('id');
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 60 - 36 - 30 - 60 - 30;
    // const tableBody = this.table.tableBodyNativeElement;
    // if (!isNull(tableBody)) {
    //   this.renderer.setStyle(tableBody, 'height', this.tableHeight + 'px');
    // }
  }

  sortView(event) {
    const sortInfo = event.sorts[0];
    let orderKey = sortInfo.prop;

    if (isUndefined(event.prevValue)) {
      sortInfo.dir = 'desc';
    }

    if (orderKey === 'publisher') {
      orderKey = 'publisher_id';
    }
    // this.refreshData();
  }



  ngOnInit() {
    this.refreshData();
  }



  refreshData() {
    const resultTimeStart = formatDate(this.logTime[0]);
    const resultTimeEnd = formatDate(this.logTime[1]);
    this.loadingIndicator = true;
    this.dataLoading = true;
    this.logService.getRankingLog(this.optimizationId, {
      count: this.pageInfo.pageSize,
      page: this.pageInfo.currentPage,
      start: resultTimeStart,
      end: resultTimeEnd,
      ...this.keywordCondition
    }).subscribe(
      (results: any) => {
        if (results.status_code && results.status_code === 200) {
          this.dataLoading = false;
          this.rows = results['data']['detail'];
          this.pageInfo.currentPageCount = results['data']['detail'].length;
          this.pageInfo.allCount = results['data']['detail_count'];
          this.selected = [];
        }
      },
      (err: any) => {
        this.dataLoading = false;

      },
      () => {
        this.dataLoading = false;
      }
    );
  }




  changePage(page) {
    this.pageInfo.currentPage = page.page;
    // this.refreshData();

  }
  changePageSize(pageSize) {
    this.pageInfo.currentPage = 1;
    // this.refreshData();
  }

  onSearch(event) {
    this.refreshData();
  }
  changeKeyword(keyword) {
    if (keyword === 'ranking_domains') {
      this.keywordCondition.exactness = false;
    }
  }
  changeResult() {
    this.refreshData();
  }

  download() {
    const resultTimeStart = formatDate(this.logTime[0]);
    const resultTimeEnd = formatDate(this.logTime[1]);
    this.loadingIndicator = true;
    this.dataLoading = true;
    this.logService.getRankingLogFileId(this.optimizationId, {
      count: this.pageInfo.pageSize,
      page: this.pageInfo.currentPage,
      start: resultTimeStart,
      end: resultTimeEnd,
      ...this.keywordCondition
    }).subscribe(
      (results: any) => {
        this.dataLoading = false;
        if (results.status_code && results.status_code === 200) {
          const cacheKey = results['data']['cache_key'];
          window.open(environment.SERVER_API_URL + '/files_public_down/' + cacheKey);
        } else {
          this._message.error('当前不可下载，请稍候重试');
        }
      },
      (err: any) => {
        this.dataLoading = false;
        this._message.error('系统异常，不可下载');
      },
      () => {
        this.dataLoading = false;
      }
    );
  }

  refresh() {
    this.refreshData();
  }

  disabledLogDate = (current: Date): boolean => {
    // Can not select days before today and today
    return differenceInCalendarDays(current, this.today) > 0 || differenceInCalendarDays(current, this.today) < -30;
  }

  logTimeChange(event) {
    setTimeout(() => {
      this.refreshData();
    });
  }

  ngAfterViewInit() {
    // const tableBody = this.table.tableBodyNativeElement;
    // if (!isNull(tableBody)) {
    //   this.renderer.setStyle(tableBody, 'height', this.tableHeight + 'px');
    // }
  }

  getDiffHour(date) {

    const nowTime: any = new Date();
    const beforeTime: any = new Date(date);
    return (nowTime - beforeTime) / 1000 / 60 / 60;
  }
  seeView(data, row) {
    if (this.clickReal) {
      return false;
    }
    const parm = {
      "html_id": data['html_id'],
      "source": "ranking_log",
      "source_data": {
        "round_id": data['round_id'],
      }
    };

    const select_uid = this.authService.getCurrentUserOperdInfo()['select_uid'];
    const select_cid = this.authService.getCurrentUserOperdInfo()['select_cid'];
    let frame: number;
    row.ranking_code_min.substring(0, 1) === '1' ? frame = 0 : frame = 1;

    this.clickReal = true;
    if (data['html_status'] * 1 !== 2) {
      data['realLoading'] = true; //实况页面第一次请求中
      this.logService.checkRankingHtml(parm).subscribe(result => {
        if (result['status_code'] === 200) {
          window.open(environment.SERVER_API_URL + "/publisher_base/get_html?html_id=" + result['data']['html_id'] + "&frame=" + frame + "&user_id=" + select_uid + "&cid=" + select_cid);
          this.clickReal = false;
          data['realLoading'] = false;
        } else {
          this._message.warning('当前实况页面已过期，请重新刷新');
          this.clickReal = false;
          data['realLoading'] = false;
        }
      });

    } else {
      this.clickReal = false;
    }
  }


}
