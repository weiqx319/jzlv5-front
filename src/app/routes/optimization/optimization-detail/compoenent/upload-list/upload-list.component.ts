import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { OptimizationService } from "../../../service/optimization.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../../core/service/auth.service";
import { OptimizationDetailLogService } from "../../../service/optimization-detail-log.service";
import { isNull, isUndefined } from "@jzl/jzl-util";
import { formatDate } from "@jzl/jzl-util";
import { environment } from "../../../../../../environments/environment";

@Component({
  selector: 'app-upload-list',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.scss']
})
export class UploadListComponent implements OnInit {

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
  public rows = [];
  public selected = [];
  public loadingIndicator = false;
  public optimizationId = '';
  constructor(private _http: OptimizationService,
    private _message: NzMessageService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private renderer: Renderer2) {
    this.optimizationId = this.route.snapshot.parent.paramMap.get('id');

    this.tableHeight = document.body.clientHeight - 60 - 60 - 36 - 30 - 60 - 30;

  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 60 - 36 - 30 - 60 - 30;
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
    this.loadingIndicator = true;
    this.dataLoading = true;
    this._http.getUploadList({
      count: this.pageInfo.pageSize,
      page: this.pageInfo.currentPage
    }, this.optimizationId).subscribe(
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
    this.refreshData();

  }
  changePageSize(pageSize) {
    this.pageInfo.currentPage = 1;
    this.refreshData();
  }

  downLoad(job_id) {
    this._http.downLoadJob(this.optimizationId, job_id).subscribe(results => {
      if (results.status_code !== 200) {
        this._message.info('当前文件不可下载');
      } else {
        const cacheKey = results['data']['cache_key'];
        window.open(environment.SERVER_API_URL + '/files_down/' + cacheKey);
      }

    });

  }

  seeUploadFile(row) {
    this._http.downLoadJob(this.optimizationId, row.job_id).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this._message.info('当前文件不可预览', { nzDuration: 100000 });
        } else {
          const cacheKey = results['data']['cache_key'];
          window.open('https://view.officeapps.live.com/op/view.aspx?src=' + encodeURI(environment.SERVER_API_URL + '/files_down/' + cacheKey));
        }
      },
      (err: any) => {
        this._message.error('系统异常');
      },
      () => {
      }
    );
  }

}
