import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {ReportService} from "../../../service/report.service";
import {environment} from "../../../../../../environments/environment";
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
  selector: 'app-report-history-job',
  templateUrl: './report-history-job.component.html',
  styleUrls: ['./report-history-job.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ReportReportHistoryJobComponent implements OnInit {

  public apiData  = [];
  public total  = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 10;
  public scrollHeight = '300px;';

  reportFreqTypeRelation = {
    'hour': '每小时',
    'day': '每日',
    'week': '每周',
    'month': '每月',
    'now': '执行一次'
  };

  @Input() reportId = 0;
  @Input() reportTitle = '';


  constructor(private reportService: ReportService, private message: NzMessageService) {

  }

  ngOnInit() {
    this.refreshData();

  }

  refreshData() {
    this.reportService.getReportJobInfoByReportId(this.reportId, {page: this.currentPage, count: this.pageSize}).subscribe(
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
      },
      () => {
      }
    );
  }


  downloadReport(job) {

    this.reportService.getReportDownloadCacheKey(this.reportId, job.job_id).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
            this.message.info('当前报表不可下载');
        } else {
            const cacheKey = results['data']['cache_key'];
            window.open(environment.SERVER_API_URL_v6 + '/files_down/' + cacheKey);
        }
      },
      (err: any) => {
        this.message.error('系统异常');
      },
      () => {
      }
    );
  }

  seeReport(report) {
    this.reportService.getReportDownloadCacheKey(this.reportId, report.job_id).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.info('当前报表不可预览');
        } else {
          if (results['data']['ext'] !== 'xlsx' && results['data']['ext'] !== 'xls') {
            this.message.info('当前报表不支持预览', {nzDuration: 100000});
          } else {
            const cacheKey = results['data']['cache_key'];
            window.open('https://view.officeapps.live.com/op/view.aspx?src=' + encodeURI(environment.SERVER_API_URL_v6  + '/files_down/' + cacheKey));
          }

       }
      },
      (err: any) => {
        this.message.error('系统异常');
      },
      () => {
      }
    );
  }


}
