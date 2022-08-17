import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ReportChartComponent } from "./components/report-chart/report-chart.component";
import { ReportService } from "../service/report.service";
import { ActivatedRoute, Router } from "@angular/router";
import { TableStepComponent } from "../../../module/table-setting/components/table-step/table-step.component";
import { isObject, isUndefined } from "@jzl/jzl-util";
import { NotifyService } from "../../../module/notify/notify.service";
import { AuthService } from "../../../core/service/auth.service";
import { LocalStorageService } from "ngx-webstorage";
import { numberToMinutes, minutesToNum } from '@jzl/jzl-util';
import { MenuService } from '../../../core/service/menu.service';

@Component({
  selector: 'app-report-edit',
  templateUrl: './report-edit.component.html',
  styleUrls: ['./report-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportEditComponent implements OnInit {
  public channel_id = 1;
  public reportSheetIndexActive = 0;
  public reportSheetNameEditObj = {
    editIndex: -1,
    editName: ''
  };

  public reportSetting = {
    'report_name': '自定义报表',
    'report_data_type': 1,
    'channel_id': 1,
    'run_type': 1,
    'report_format': 'excel',
    'report_freq': 'day',
    'email_list': "",
    'sheets_setting': [{
      'sheet_name': 'sheet_1',
      'table_setting': {

      },
      'charts_setting': [

      ],
      'sheet_module': {
        'table': true,
        'line': false,
        'bar': false,
        'lineStack': false,
        'pie': false,
      }
    }]
  };
  public cron_time;
  public cron_minute = 0;

  public cronMinuteList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 55];



  protected reportId;
  protected tplId = 0;
  public report_data_type = 0;
  public tableHeight = 0;
  public time;


  constructor(private modalService: NzModalService,
    private reportService: ReportService,
    private _message: NzMessageService,
    private notifyService: NotifyService,
    private authService: AuthService,
    private localSt: LocalStorageService,
    private router: Router,
    public menuService: MenuService,
    private route: ActivatedRoute) {
    this.channel_id = this.reportService.channel_id;
    this.reportId = this.route.snapshot.paramMap.get('id');
    this.tplId = this.route.snapshot.queryParams['fromTpl'];
    this.reportSetting.report_data_type = this.route.snapshot.queryParams['report_data_type'];
    this.reportSetting.run_type = this.route.snapshot.queryParams['run_type'];
    if (this.route.snapshot.queryParams['report_data_type'] * 1 === 2) {
      this.tableHeight = document.body.clientHeight - 60 - 30 - 30 - 30 - 30 - 2;
    }

  }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 30 - 30 - 30 - 30 - 2;
  }
  ngOnInit() {
    if (this.reportId && this.reportId.length > 0) {
      this.reportService.getReportDetail(this.reportId).subscribe((data) => {
        if (data.status_code === 200) {
          const reportResult = data['data'];
          // this.report
          this.reportSetting['report_id'] = reportResult.report_id;
          this.reportSetting.channel_id = reportResult.channel_id;
          this.reportSetting.report_format = reportResult.report_format;
          this.reportSetting.run_type = reportResult.run_type;
          this.reportSetting.report_name = reportResult.report_name;
          this.reportSetting.report_freq = reportResult.report_freq;
          this.reportSetting.sheets_setting = reportResult.sheets_setting;
          this.reportSetting.email_list = reportResult.email_list.join('\n');
          //初始化时间
          if (reportResult['cron_time']) {
            if (this.reportSetting.report_freq == 'hour') {
              this.cron_minute = reportResult['cron_time'];
              this.cron_time = new Date(2019, 3, 12, 10, 30, 0);
            } else {
              const times: number[] = numberToMinutes(reportResult['cron_time']);
              this.cron_time = new Date(2019, 2, 12, times[0], times[1], 0);
            }

          } else {
            this.onFreqChange();
          }

          this.reportSetting.report_data_type = reportResult['report_data_type'];
          if (this.reportSetting.report_data_type * 1 === 2) {
            this.tableHeight = document.body.clientHeight - 60 - 30 - 30 - 30 - 30 - 2;
          }

        } else {
          this._message.error('编辑报表失败');
        }
      });
    } else if (this.tplId > 0) {
      this.reportService.getReportTplDetail(this.tplId).subscribe((data) => {
        if (data.status_code === 200) {
          const reportResult = data['data'];
          // this.report
          this.reportSetting.channel_id = reportResult.channel_id;
          this.reportSetting.report_format = reportResult.report_format;
          this.reportSetting.run_type = reportResult.run_type;
          this.reportSetting.report_name = reportResult.report_name;
          this.reportSetting.report_freq = reportResult.report_freq;
          this.reportSetting.sheets_setting = reportResult.sheets_setting;
          this.reportSetting.email_list = isUndefined(reportResult.email_list) ? '' : reportResult.email_list.join('\n');
        } else {
          this._message.error('编辑报表模版失败');
        }
      });
    } else {
      this.onFreqChange();
    }



    // --初始化ItemService
  }

  onFreqChange() {
    if (this.reportSetting.report_freq === 'day') {
      this.cron_time = new Date(2019, 3, 12, 10, 30, 0);
    } else {
      this.cron_time = new Date(2019, 3, 12, 12, 0, 0);
    }
  }
  //设置不可用时间点
  disabledHours = (): number[] => {
    const arr = [];
    let hour = 10;
    if (this.reportSetting.report_freq !== 'day') {
      hour = 12;
    }
    for (let i = 0; i < hour; i++) {
      arr.push(i);
    }
    return arr;
  }

  disabledMinutes = (hour: number): number[] => {
    const arr = [];
    let minutes = 0;
    // if (this.reportSetting.report_freq === 'day') {
    //   if (hour <= 10) {
    //     minutes = 30;
    //   }
    // }
    for (let i = 0; i < minutes; i++) {
      arr.push(i);
    }
    return arr;
  }




  addExcelSheet(): void {
    const index = this.reportSetting.sheets_setting.length;
    const newSheetObj = { sheet_name: 'sheet_' + (index + 1), table_setting: {}, charts_setting: [], sheet_module: { "table": true, "line": false, "bar": false, "lineStack": false, "pie": false } };
    this.reportSetting.sheets_setting.push(newSheetObj);
    this.reportSheetIndexActive = index;
  }

  changeActiveIndex(index): void {
    if (index !== this.reportSheetIndexActive) {
      this.reportSheetIndexActive = index;
      this.reportSheetNameEditObj.editIndex = -1;
    }

  }

  delSheet(index): void {
    if (index <= this.reportSheetIndexActive && this.reportSheetIndexActive > 0) {
      this.reportSheetIndexActive--;
    }
    if (this.reportSetting.sheets_setting.length > 1) {
      this.reportSetting.sheets_setting.splice(index, 1);
    } else {
      const newSheetObj = { sheet_name: 'sheet_1', table_setting: {}, charts_setting: [], "sheet_module": { "table": true, "line": false, "bar": false, "lineStack": false, "pie": false } };
      this.reportSetting.sheets_setting.push(newSheetObj);
      this.reportSetting.sheets_setting.splice(index, 1);
    }


  }

  editSheetName(item, index): void {
    this.reportSheetNameEditObj.editIndex = index;
    this.reportSheetNameEditObj.editName = item.sheet_name;
    this.changeActiveIndex(index);
  }

  cancelEditName(): void {
    this.reportSheetNameEditObj.editIndex = -1;

  }
  saveEditName(item): void {
    this.reportSheetNameEditObj.editIndex = -1;
    item.sheet_name = this.reportSheetNameEditObj.editName;

  }




  addReportTable(): any {
    if (!this.reportSetting.sheets_setting[this.reportSheetIndexActive]['sheet_module']['table']) {
      this._message.info('一个sheet中只能填加一份表格数据');
      return false;
    }

    const add_modal = this.modalService.create({
      nzTitle: '添加表格',
      nzWidth: 800,
      nzContent: TableStepComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        runType: this.reportSetting.run_type
      }
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.dataType && result.dataType === 'table') {
        this.reportSetting.sheets_setting[this.reportSheetIndexActive]['table_setting'] = result.data;
        this.reportSetting.sheets_setting[this.reportSheetIndexActive]['sheet_module'] = {
          'table': false,
          'line': true,
          'bar': true,
          'lineStack': true,
          'pie': true,
        };
      }


    });
  }

  editReportTable(): void {
    const add_modal = this.modalService.create({
      nzTitle: '编辑表格',
      nzWidth: 800,
      nzContent: TableStepComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzFooter: null,
      nzComponentParams: {
        tableSetting: this.reportSetting.sheets_setting[this.reportSheetIndexActive]['table_setting'],
        runType: this.reportSetting.run_type
      }
    });
    add_modal.afterClose.subscribe(result => {
      if (result.dataType && result.dataType === 'table') {
        this.reportSetting.sheets_setting[this.reportSheetIndexActive]['table_setting'] = result.data;






      }


    });

  }

  addReportChart(chartType: string): any {
    if (this.reportSetting.sheets_setting[this.reportSheetIndexActive]['sheet_module']['table']) {
      this._message.info('添加图表前请先添加表格数据');
      return false;
    }

    let chartTitle = '图形';
    switch (chartType) {
      case 'line':
        chartTitle = '折线图';
        break;
      case 'lineStack':
        chartTitle = '线形堆积图';
        break;
      case 'bar':
        chartTitle = '柱形图';
        break;
      case 'pie':
        chartTitle = '饼图';
        break;
      default:
        chartTitle = '图形';
    }


    const add_modal = this.modalService.create({
      nzTitle: '添加' + chartTitle,
      nzWidth: 600,
      nzContent: ReportChartComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzComponentParams: {
        chartType,
        chartTitle,
        reportType: this.reportSetting.sheets_setting[this.reportSheetIndexActive]['table_setting']['report_type'],
        summaryType: this.reportSetting.sheets_setting[this.reportSheetIndexActive]['table_setting']['summary_type'],
        selectedItems: this.reportSetting.sheets_setting[this.reportSheetIndexActive]['table_setting']['selected_items'],
        lockedItem: this.reportSetting.sheets_setting[this.reportSheetIndexActive]['table_setting']['locked_items']
      },
      nzFooter: null
    });
    add_modal.afterClose.subscribe(result => {
      if (result.oper && result.oper === 'save') {
        this.reportSetting.sheets_setting[this.reportSheetIndexActive]['charts_setting'].push(result.data);
      }
    });
  }

  delReportByIndex(index) {
    this.reportSetting.sheets_setting[this.reportSheetIndexActive]['charts_setting'].splice(index, 1);
  }

  editReportByIndex(index, detail) {
    const add_modal = this.modalService.create({
      nzTitle: '编辑' + detail['chart_name'],
      nzWidth: 600,
      nzContent: ReportChartComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'report-table-modal',
      nzComponentParams: {
        reportType: this.reportSetting.sheets_setting[this.reportSheetIndexActive]['table_setting']['report_type'],
        summaryType: this.reportSetting.sheets_setting[this.reportSheetIndexActive]['table_setting']['summary_type'],
        selectedItems: this.reportSetting.sheets_setting[this.reportSheetIndexActive]['table_setting']['selected_items'],
        lockedItem: this.reportSetting.sheets_setting[this.reportSheetIndexActive]['table_setting']['locked_items'],
        chartDetail: detail
      },
      nzFooter: null
    });
    add_modal.afterClose.subscribe(result => {
      if (result.oper && result.oper === 'save') {
        this.reportSetting.sheets_setting[this.reportSheetIndexActive]['charts_setting'][index] = result.data;
      }
    });
  }




  saveReport(report_status = 1): void {
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();

    if (this.reportSetting.report_freq == 'hour') {
      this.reportSetting['cron_time'] = this.cron_minute;
    } else if (this.cron_time) {
      const hour = this.cron_time.getHours();
      const minutes = this.cron_time.getMinutes();
      this.reportSetting['cron_time'] = minutesToNum(hour, minutes);
    }
    if (this.reportId && this.reportId.length > 0) {
      // this.reportSetting.email_list = reportResult.email_list.split(',').join('\n');
      const putBody = Object.assign({}, this.reportSetting, { email_list: this.reportSetting.email_list.split('\n'), report_status });
      this.reportService.updateReport(putBody).subscribe((data: any) => {
        if (data.status_code === 200) {
          if (isObject(data['data']) && data['data'].hasOwnProperty('job_id')) {
            const notifyData = [];
            notifyData.push({ report_id: data['data']['report_id'], job_id: data['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, report_name: this.reportSetting.report_name });
            this.notifyService.notifyData.next({ type: 'report', data: notifyData });
          }
          this._message.info('保存报表成功');
          this.router.navigateByUrl('/report/sem/list');
        } else {
          this._message.error('保存报表失败');
        }
      },
        (err: any) => {
          this._message.error('保存报表失败');

        },
        () => {

        });
    } else {
      const postBody = Object.assign({}, this.reportSetting, { email_list: this.reportSetting.email_list.split('\n'), report_status });
      this.reportService.createReport(postBody).subscribe((data: any) => {
        if (data.status_code === 200) {
          if (isObject(data['data']) && data['data'].hasOwnProperty('job_id')) {
            const notifyData = [];
            notifyData.push({ report_id: data['data']['report_id'], job_id: data['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, report_name: this.reportSetting.report_name });
            this.notifyService.notifyData.next({ type: 'report', data: notifyData });
          }

          this.router.navigate(['/report/sem/list']);
        } else {
          this._message.error('保存报表失败');
        }
      },
        (err: any) => {
          this._message.error('保存报表失败');

        },
        () => {

        });
    }
  }

  cancelSaveReport(): void {
    // this.router.navigate(['/report/list']);
    this.router.navigateByUrl('/report/sem/list');
  }
}
