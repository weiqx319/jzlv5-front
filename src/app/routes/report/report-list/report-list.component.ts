import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { ReportService } from "../service/report.service";
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { ReportReportHistoryJobComponent } from "./components/report-history-job/report-history-job.component";
import { environment } from "../../../../environments/environment";
import { AuthService } from "../../../core/service/auth.service";
import { LocalStorageService } from "ngx-webstorage";
import { numberToMinutes } from '@jzl/jzl-util';
import { CustomDatasService } from "../../../shared/service/custom-datas.service";


@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportListComponent implements OnInit {
  public channel_id = 1;
  public activeType = 'list';

  public reportTab = [
    { 'name': '报表列表', key: 'list' },
    { 'name': '报表模板', key: 'tpl' }
  ];

  public tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;
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
    ],
    loadingStatus: 'success',
  };
  public tplPageInfo = {
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
    ],
    loadingStatus: 'success',
  };

  public orderInfo: any = {};
  public rows = [];
  public selected = [];
  public columns = [];
  public loadingIndicator = false;
  public requestFailed = false;//请求表格数据失败
  public dataMessages = {//datatable无数据是时显示信息
    emptyMessage: `
    <div class="empty-content">
      <span></span>
    </div>
  `,
  };

  public reportFreqTypeRelation = {
    'hour': '每小时',
    'day': '每日',
    'week': '每周',
    'month': '每月',
    'now': '执行一次'
  };
  public reportStatusRelation = {
    'status_1': '草稿',
    'status_2': '运行',
    'status_3': '暂停'
  };

  private addModal = null;
  public addReportSetting = {
    channel_id: 1,
    run_type: 1,
    // report_format: 'excel',
    report_data_type: 1
  };
  public userSelectedOper: { select_uid: number, select_cid: number, role_id: number } = { select_uid: 0, select_cid: 0, role_id: 0 };

  constructor(private modalService: NzModalService,
    private authService: AuthService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private localSt: LocalStorageService,
    private reportService: ReportService,
    private customDatasService: CustomDatasService) {

    this.userSelectedOper = this.authService.getCurrentUserOperdInfo();
    this.channel_id = this.reportService.channel_id;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    if (this.activeType === 'list') {
      this.tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;
    } else {
      this.tableHeight = document.body.clientHeight - 60 - 40 - 8 - 30;
    }

  }

  changeActive(type) {
    if (this.activeType !== type) {
      this.activeType = type;
      if (this.activeType === 'list') {
        this.tableHeight = document.body.clientHeight - 60 - 40 - 36 - 30;
      } else {
        this.tableHeight = document.body.clientHeight - 60 - 40 - 8 - 30;
      }
      this.refreshData();
    }
  }

  createReportModal(content): void {
    this.addModal = this.modalService.create({
      nzTitle: '创建报表',
      nzWidth: 600,
      nzContent: content,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'create-report-modal',
    });
  }

  createReport(): void {
    this.addModal.destroy('onOk');
    this.router.navigate(['/report/sem//create'], { queryParams: this.addReportSetting });

  }

  createReoprtFromTpl(tpl_id): void {
    this.router.navigate(['/report/sem/create'], { queryParams: { ...this.addReportSetting, fromTpl: tpl_id } });
  }


  cancelCreate(): void {
    this.addModal.destroy();
  }


  // -- 数据相关 -- start
  refreshData(reset = false) {
    this.selected = [];
    this.loadingIndicator = true;
    if (this.activeType === 'list') {
      this.pageInfo.loadingStatus = 'pending';
      const param = {};
      if (this.activeType === 'list') {
        param['count'] = this.pageInfo.pageSize;
        param['page'] = this.pageInfo.currentPage;
      }
      this.reportService.getReportList({ ...param, ...this.orderInfo }).subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.loadingIndicator = false;
            this.rows = results['data']['detail'];
            this.rows.map(item => {
              if (item.report_freq == 'hour') {
                item['show_cron_time'] = item.cron_time;
              } else if (item.cron_time) {
                const times = numberToMinutes(item.cron_time);
                item['show_cron_time'] = `${times[0] < 10 ? '0' + times[0] : times[0]}:${times[1] < 10 ? '0' + times[1] : times[1]}`;
              } else {
                item['show_cron_time'] = '';
              }
            });
            this.pageInfo.allCount = results['data']['detail_count'];
            this.pageInfo.currentPageCount = results['data']['detail'].length;
            this.requestFailed = false;
            this.pageInfo.loadingStatus = 'success';
            this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span></span>
    </div>
  `;
          } else {
            this.rows = [];
            this.loadingIndicator = false;
            this.pageInfo.loadingStatus = 'error';
            this.requestFailed = true;
            this.dataMessages.emptyMessage = `
            <div class="empty-content">
              <span>获取数据失败，请重试</span>
            </div>
          `;
          }
        },
        (err: any) => {
          this.rows = [];
          this.loadingIndicator = false;
          this.pageInfo.loadingStatus = 'error';
          this.requestFailed = true;
          this.dataMessages.emptyMessage = `
            <div class="empty-content">
              <span>获取数据失败，请重试</span>
            </div>
          `;
        },
        () => {
          this.loadingIndicator = false;
        }
      );
    } else if (this.activeType === 'tpl') {
      this.tplPageInfo.loadingStatus = 'pending';
      this.reportService.getReportTplList({
        ...{
          count: this.tplPageInfo.pageSize,
          page: this.tplPageInfo.currentPage
        }, ...this.orderInfo
      }).subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.loadingIndicator = false;
            this.rows = results['data']['detail'];
            this.tplPageInfo.allCount = results['data']['detail_count'];
            this.tplPageInfo.currentPageCount = results['data']['detail'].length;
            this.requestFailed = false;
            this.tplPageInfo.loadingStatus = 'success';
            this.dataMessages.emptyMessage = `
    <div class="empty-content">
      <span></span>
    </div>
  `;
          } else {
            this.rows = [];
            this.loadingIndicator = false;
            this.tplPageInfo.loadingStatus = 'error';
            this.requestFailed = true;
            this.dataMessages.emptyMessage = `
            <div class="empty-content">
              <span>获取数据失败，请重试</span>
            </div>
          `;
          }
        },
        (err: any) => {
          this.rows = [];
          this.loadingIndicator = false;
          this.tplPageInfo.loadingStatus = 'error';
          this.requestFailed = true;
          this.dataMessages.emptyMessage = `
            <div class="empty-content">
              <span>获取数据失败，请重试</span>
            </div>
          `;
        },
        () => {
          this.loadingIndicator = false;
        }
      );
    }


  }
  changePage(page) {
    if (this.activeType === 'list') {
      this.pageInfo.currentPage = page.page;
      this.refreshData();
    } else if (this.activeType === 'tpl') {
      this.tplPageInfo.currentPage = page.page;
      this.refreshData();
    }

  }
  changePageSize(pageSize) {
    if (this.activeType === 'list') {
      this.pageInfo.currentPage = 1;
      this.refreshData();
    } else if (this.activeType === 'tpl') {
      this.tplPageInfo.currentPage = 1;
      this.refreshData();
    }
  }

  sortView(event) {
    const sortInfo = event.sorts[0];
    const orderKey = sortInfo.prop;
    this.orderInfo = { 'orderby': orderKey, 'sort': sortInfo.dir };
    this.refreshData();
  }

  // -- 数据相关 -- end



  delReport(reportId?: any) {
    const postBody = { report_id: [] };
    if (isUndefined(reportId)) {
      this.selected.forEach(data => {
        postBody.report_id.push(data.report_id);
      });
      if (postBody.report_id.length > 0) {
        this.reportService.delReport(postBody).subscribe((result: any) => {
          if (result.status_code === 200) {

            this.message.success('删除成功');
            this.refreshData();
          }
        },
          (err: any) => {
            this.message.error('删除失败,请重试');
          },
          () => {
          });
      } else {
        this.message.info('请选择相关项操作');
      }
    } else {
      postBody.report_id.push(reportId);
      this.reportService.delReport(postBody).subscribe((result: any) => {
        if (result.status_code === 200) {
          this.message.success('删除成功');
          this.refreshData();
        }
      },
        (err: any) => {
          this.message.error('删除失败,请重试');
        },
        () => {
        });
    }
  }
  showReportJobInfo(report: any) {
    const hhistorModal = this.modalService.create({
      nzWidth: 650,
      nzContent: ReportReportHistoryJobComponent,
      nzClosable: true,
      nzMaskClosable: false,
      nzWrapClassName: 'report-history-job',
      nzFooter: null,
      nzComponentParams: {
        reportId: report.report_id,
        reportTitle: report.report_name
      }
    });
  }
  updateReportStatus(report, report_status) {
    const postData = {
      "report_id": report.report_id,
      "report_status": report_status
    };
    this.reportService.updateReportStatus(postData).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.info('状态更新失败，请重试');
        } else {
          report.report_status = report_status;
        }
      },
      (err: any) => {
        this.message.error('系统异常');
      },
      () => {
      }
    );
  }


  batchDownload() {
    let downNum = 0;
    this.selected.forEach(data => {
      if (data.status) {
        downNum++;
        this.downloadReport(data);
      }
    });

    if (downNum === 0) {
      this.message.info('无可用下载项，请重新选择并下载');
    }

  }
  downloadReport(report) {
    this.reportService.getReportDownloadCacheKey(report.report_id, report.job_id).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.info('当前报表不可下载');
        } else {
          const cacheKey = results['data']['cache_key'];
          window.open(environment.SERVER_API_URL + '/files_down/' + cacheKey);
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
    this.reportService.getReportDownloadCacheKey(report.report_id, report.job_id).subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.info('当前报表不可预览', { nzDuration: 100000 });
        } else {
          if (results['data']['ext'] !== 'xlsx' && results['data']['ext'] !== 'xls') {
            this.message.info('当前报表不支持预览', { nzDuration: 100000 });
          } else {
            const cacheKey = results['data']['cache_key'];
            window.open('https://view.officeapps.live.com/op/view.aspx?src=' + encodeURI(environment.SERVER_API_URL + '/files_down/' + cacheKey));
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


  ngOnInit() {
    this.refreshData();
    if (this.userSelectedOper.role_id === 1 || this.userSelectedOper.role_id === 3 || this.userSelectedOper.role_id === 5 || this.userSelectedOper.role_id === 6) {
      this.reportTab.push({ 'name': '负责人报告', key: 'responsible_account' });
    }
    this.getIsLandingPage();
    this.getNameList();
  }

  getIsLandingPage() {
    this.reportService.getIsLandingPage().subscribe(result => {
      if (result.status_code === 200) {
        if (result['data'] && result['data']['valid']) {
          this.reportTab.push({ 'name': '着陆页', key: 'landing_page_account' });
        }
      } else {
        //不做任何处理
      }
    });
  }
  getNameList() {
    this.reportService.getBizUnitList().subscribe(result => {
      if (result.status_code === 200) {
        const reportName = this.customDatasService.brandMapObjKey['trade_id_' + this.authService.advertiserType];

        if (reportName) {
          this.reportTab.push(
            { 'name': reportName + '效果报告', key: 'biz_unit_report' },
            { 'name': reportName + '小时报告', key: 'biz_unit_hours_report' },
            { 'name': reportName + '地域报告', key: 'biz_unit_region_report' },
          );
          if (this.authService.getCurrentUser().company_id === 4135) {
            this.reportTab.push(
              { name: reportName + '计划效果报告', key: 'biz_unit_campaign_report' },
              { name: reportName + '单元效果报告', key: 'biz_unit_adgroup_report' },
              { name: reportName + '关键词效果报告', key: 'biz_unit_keyword_report' },
            );
          }
        }

      } else {
        //不做任何处理
      }
    });
  }


  onSelect({ selected }) {

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  jumpDetail(report_id) {
    this.router.navigate(['../detail/' + report_id], { relativeTo: this.route });
  }
}
