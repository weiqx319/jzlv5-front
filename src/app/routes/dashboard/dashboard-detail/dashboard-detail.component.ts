
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  QueryList, ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, ParamMap } from "@angular/router";
import { switchMap } from 'rxjs/operators';

import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { zip } from 'rxjs';
import { isObject } from "@jzl/jzl-util";
import { AuthService } from "../../../core/service/auth.service";
import { JzlChartComponent } from "../../../module/jzl-chart/jzl-chart.component";
import { AuthorizationBindingComponent } from "../modal/authorization-binding/authorization-binding.component";
import { CopyChartComponent } from "../modal/copy-chart/copy-chart.component";
import { NewChartComponent } from "../modal/new-chart/new-chart.component";
import { ChangeSizeService } from "../service/change-size.service";
import { DashboardService } from "../service/dashboard.service";
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';


@Component({
  selector: 'app-dashboard-detail',
  templateUrl: './dashboard-detail.component.html',
  styleUrls: ['./dashboard-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardDetailComponent implements OnInit, AfterViewInit {

  public chartList: any = [];

  public chartDataOptionList: any = [];

  public size: number;

  public loading = true;

  public dashboardId: any;

  public dashboardName: any;

  public dashBoardList: any = [];

  public currentDashBoard$;

  public dashboardGlobalConfig = {
    timeFlag: false, timeData: {}
  };

  public loadCount = 0; //最后一个图表的 index+1
  public allShowCount = 0; //一屏幕显示的总数
  public rowShowCount = 0; //每行显示的个数
  public oneScroll = false; //是否为第一次滚动
  public dashboardContentHeight = 0; //dashboard 展示区域的显示高度

  public pdfModalVisible = false;
  public canvasImgData = '';
  public dashboardCanvas;
  public pdfModalLoading = false;

  @ViewChildren(JzlChartComponent)
  chartChild: QueryList<JzlChartComponent>;
  @ViewChild('dashboardContent') dashboardContentNode: ElementRef;

  constructor(private el: ElementRef,
    private route: ActivatedRoute,
    private changeSizeService: ChangeSizeService,
    private dashBoardService: DashboardService,
    private modalService: NzModalService,
    private _message: NzMessageService,
    private auth: AuthService) {
    this.currentDashBoard$ = this.dashBoardService.getCurrentDashBoard();
    this.size = this.changeSizeService.getSize();
    this.changeSizeService.colSizeObservable.subscribe(size => {
      this.size = size;
      //通知滚动页面获取scrollTop
      this.auth.setIsScrollChangeSize(this.size);
    });
    this.dashBoardService.getItem().subscribe(item => {
      const newChartData = { data: { data: [], meta: {} }, dataOption: item, dashboardId: this.dashboardId };
      this.chartList.push(item);
      this.chartDataOptionList.push(newChartData);
      this.dashBoardService.getChart(this.dashboardId, item['chart_id']).subscribe(
        (data) => {
          this.chartDataOptionList[this.chartDataOptionList.length - 1] = { data: data['data'] ? data['data'] : { data: [], meta: {} }, dataOption: item, dashboardId: this.dashboardId, dashboardConfig: this.dashboardGlobalConfig };
          // this.chartDataOptionList.push({data: data['data'] ? data['data'] : {data: [], meta: {}}, dataOption: item, dashboardId: this.dashboardId});
        },
      );
    });
    this.dashBoardService.getDashBoardList().subscribe(
      (results: any[]) => {
        this.dashBoardList = results;
      },
      (err: any) => {

      },
      () => {
      },
    );

  }

  ngOnInit() {
    this.showCount();

    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.chartList = [];
        this.chartDataOptionList = [];
        this.loading = true;
        return this.dashBoardService.getDashBoard(params.get('id'));
      }))
      .subscribe(item => {
        this.loading = false;
        this.dashboardId = item['dashboard_id'];
        this.dashboardName = item['dashboard_name'];
        this.chartList = item['components'];
        if (this.chartList.length > 0) {
          this.chartList.forEach((val, index) => {
            if (this.chartList.length >= this.allShowCount) {
              if (index < this.allShowCount) {
                this.chartDataOptionList[index] = { data: { data: [], meta: {} }, dataOption: val, dashboardId: this.dashboardId, dashboardConfig: this.dashboardGlobalConfig };
                this.loadCount = index + 1;
              }
            } else {
              this.chartDataOptionList[index] = { data: { data: [], meta: {} }, dataOption: val, dashboardId: this.dashboardId, dashboardConfig: this.dashboardGlobalConfig };
              this.loadCount = index + 1;
            }

            // this.chartDataOptionList[index] = {data: {data: [], meta: {}}, dataOption: val, dashboardId: this.dashboardId};
            /* this.dashBoardService.getChart(this.dashboardId, val['chart_id']).subscribe(
               (result) => {
                 if (result['status_code'] && result['status_code'] === 200) {
                   this.chartDataOptionList[index] = {data: result['data'] ? result['data'] : {data: [], meta: {}}, dataOption: val};
                 } else {
                   this.chartDataOptionList[index] = {data: {data: [], meta: {}}, dataOption: val};
                 }
               }
             );*/
          });
        }
      });

    this.getIsScroll();
  }
  getIsScroll() {

    this.auth.getIsScroll().subscribe(result => {
      if (!this.oneScroll && this.chartList.length - this.loadCount > 0) {
        this.showCount();
        //当前dashboard图的文档总高度
        const currentContentHeight = this.chartList.length ? this.dashboardContentNode.nativeElement.offsetHeight : 0;
        const remove_addElement_height = (this.chartDataOptionList.length % this.rowShowCount) ? 0 : 360;
        //滑动页面逻辑
        // console.log(this.chartList.length - this.loadCount);
        if ((result.scrollTop + this.dashboardContentHeight - 36 - 30) >= (currentContentHeight - remove_addElement_height)) {

          this.oneScroll = true;
          if (this.chartList.length - this.loadCount > 0 && this.chartList.length - this.loadCount < this.allShowCount) {
            for (let i = this.loadCount; i < this.chartList.length; i++) {
              this.chartDataOptionList[i] = { data: { data: [], meta: {} }, dataOption: this.chartList[i], dashboardId: this.dashboardId, dashboardConfig: this.dashboardGlobalConfig };
            }
            this.loadCount = this.chartList.length;
          } else if (this.chartList.length - this.loadCount > 0 && this.chartList.length - this.loadCount >= this.allShowCount) {
            for (let i = this.loadCount; i < this.loadCount + this.allShowCount; i++) {
              this.chartDataOptionList[i] = { data: { data: [], meta: {} }, dataOption: this.chartList[i], dashboardId: this.dashboardId, dashboardConfig: this.dashboardGlobalConfig };
            }
            this.loadCount = this.loadCount + this.allShowCount;
          }
          this.oneScroll = false;
        }
      }

    });
  }

  showCount() {
    // @ts-ignore
    this.dashboardContentHeight = localStorage.getItem('offsetHeight') * 1;
    this.rowShowCount = (this.size * 1 === 8 ? 3 : (this.size * 1 === 12 ? 2 : 1));
    const divisionRound = Math.ceil((this.dashboardContentHeight - 36) / 370);
    this.allShowCount = divisionRound * this.rowShowCount;
  }

  // downloadPdf(): void {
  //   // px = pt * DPI / 72
  //   // pt = px * 72 / DPI  (取 96)
  //   // console.log(this.chartChild);
  //   // console.log(this.el.nativeElement.getBoundingClientRect());
  //   // const chartNumSize = 24 / this.changeSizeService.getSize();
  //   // let pdfWidth = this.el.nativeElement.getBoundingClientRect().width;
  //   // pdfWidth = pdfWidth * 72 / 96;

  //   const pdfWidth  = 595.28;
  //   const pdfHeight = 841.89;

  //   const dataUrlArrray = [];
  //   this.chartChild.forEach(function(item) {
  //     dataUrlArrray.push(item.getChartImageUrlObj());
  //   });
  //   const doc = new JSPDF('p', 'pt');
  //   doc.setFontSize(20);
  //   doc.deletePage(1);
  //   dataUrlArrray.forEach((item, index) => {
  //     doc.addPage();

  //     let mycanvas = document.createElement('canvas');
  //     mycanvas.height = 25;
  //     let cxt = mycanvas.getContext('2d');
  //     cxt.fillStyle = '#FFF';
  //     cxt.fillRect(0, 0, String(this.chartList[index]['chart_name']).length * 20 * 96 / 72, 25);

  //     cxt.fillStyle = '#000';
  //     cxt.font = 'bold 20px Arial';
  //     cxt.fillText( this.chartList[index]['chart_name'], 0, 20);   //把rand()生成的随机数文本填充到canvas中
  //     // var dataURL = canvas.toDataURL("image/png");

  //     let chartWidth = item['width'] * 72 / 96;
  //     let chartHeight = item['height'] * 72 / 96;
  //     const chartName = this.chartList[index]['chart_name'];
  //     const chartTextLength = String(chartName).length;
  //     const chartTextXOffset = (595.28 - chartTextLength * 20) / 2;
  //     doc.addImage(mycanvas.toDataURL("image/png"), 'PNG', chartTextXOffset, 150);
  //     mycanvas = null;
  //     cxt = null;
  //     if (chartWidth < 595) {
  //       const  xOffset =  (595.28 - chartWidth) / 2;
  //       const  yOffset = (841.89 - chartHeight) / 2;
  //       doc.addImage(item['data'], 'JPEG', xOffset, yOffset, chartWidth, chartHeight);
  //     } else {
  //       const  xOffset = 0;
  //       chartHeight = chartHeight / chartWidth * 595;
  //       chartWidth = 595;
  //       const  yOffset = (841.89 - chartHeight) / 2;
  //       doc.addImage(item['data'], 'JPEG', xOffset, yOffset, chartWidth, chartHeight);
  //     }
  //   });
  //   doc.save(this.dashboardName + '.pdf');

  // }


  downloadPdf(): void {
    this.pdfModalVisible = true;
    this.pdfModalLoading = true;
    let dashboardElement = document.querySelector("#dashboardContent")
    let addChartElement = document.querySelector("#empty-chart-add");

    if (addChartElement) {
      dashboardElement.removeChild(addChartElement)
    }

    html2canvas(document.querySelector("#dashboardSection")).then(canvas => {
      //返回图片dataURL，参数：图片格式和清晰度(0-1)
      this.canvasImgData = canvas.toDataURL('image/jpeg', 1.0);
      this.dashboardCanvas = canvas;

      this.pdfModalLoading = false;
    });

    if (addChartElement) {
      dashboardElement.appendChild(addChartElement)
    }
  }

  doDownloadPdf() {
    var imgWidth = this.dashboardCanvas.width / 2;
    var imgHeight = this.dashboardCanvas.height / 2;

    var contentWidth = imgWidth;
    var contentHeight = imgWidth > imgHeight + 50 ? imgWidth : imgHeight + 50;

    //方向默认竖直，单位pt，元素宽高作为pdf文件的宽高(不分页)
    var pdf = new jsPDF('', 'pt', [contentWidth, contentHeight]);

    //addImage后两个参数控制添加图片的尺寸，页面宽高直接按照元素宽高
    pdf.addImage(this.canvasImgData, 'JPEG', 0, 35, imgWidth, imgHeight);

    pdf.save(this.dashboardName + '.pdf');

    this.pdfModalVisible = false;
  }

  handleCancel(): void {
    this.pdfModalVisible = false;
  }

  chartModal(row, index, resultBiz) {
    const subscription = this.modalService.create({
      nzTitle: '更新图表',
      nzWidth: 600,
      nzContent: NewChartComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'new-chart-modal',
      nzFooter: null,
      nzComponentParams: {
        setting: row,
        bizInfo: resultBiz,
      },
    });
    subscription.afterClose.subscribe(result => {
      if (result.chart_id) {
        result.dashboard_id = this.dashboardId;
        this.dashBoardService.updateChart(result).subscribe(
          (data: any) => {
            if (data.status_code === 200) {
              this.chartDataOptionList[index] = { data: { data: [], meta: {} }, dataOption: this.chartList[index], dashboardId: this.dashboardId, dashboardConfig: this.dashboardGlobalConfig };

              this.dashBoardService.getChartById({ chart_id: result['chart_id'] }).subscribe(
                (sub_result) => {
                  this.chartDataOptionList[index] = { data: { data: [], meta: {} }, dataOption: sub_result['data'], dashboardId: this.dashboardId, dashboardConfig: this.dashboardGlobalConfig };
                  this.chartList[index] = sub_result['data'];
                }
              );
              this._message.success('图表设置更新成功');
              subscription.destroy('onCancel');
            } else {
              this._message.error('图表设置更新失败');
            }
          },
          (err: any) => {

          },
          () => {

          },
        );
      }
    });
  }
  editChart(event: any, dataIndex: number): void {
    const chartData$ = this.dashBoardService.getChartById({ chart_id: this.chartList[dataIndex].chart_id });
    const bizInfo$ = this.auth.getBizUnitList();
    zip(chartData$, bizInfo$).subscribe(
      ([chartData, bizInfo]) => {
        const resultBiz = { typeName: '', data: [] };
        if (bizInfo.status_code === 200) {

          if (this.auth.advertiserType * 1 === 3) { //医疗
            resultBiz.typeName = '病种';
          } else if (this.auth.advertiserType * 1 === 1) { //教育
            resultBiz.typeName = '课程';
          } else if (this.auth.advertiserType * 1 === 7) { //房地产
            resultBiz.typeName = '品牌';
          } else if (this.auth.advertiserType * 1 === 2) { //房地产
            resultBiz.typeName = '品牌';
          }
          resultBiz.data = [...bizInfo['data']];
        }
        if (chartData.status_code === 200) {
          this.chartModal(chartData.data, dataIndex, resultBiz);
        } else {
          this._message.error(chartData['message']);
        }
      },
      (err: any) => {

      },
      () => {

      },
    );
  }

  copyChart(event: any, dataIndex: number): void {
    const copy_modal = this.modalService.create({
      nzTitle: '复制图表',
      nzWidth: 600,
      nzContent: CopyChartComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'copy-chart-modal',
      nzFooter: null,
      nzComponentParams: {
        dashBoard_list: this.dashBoardList,
      },
    });
    copy_modal.afterClose.subscribe(result => {
      if (result.chart_name && result.dashboard_id) {
        const chart_name = result.chart_name;
        Object.assign(result, event);
        delete result.chart_id;
        result.chart_name = chart_name;
        this.dashBoardService.createChart(result).subscribe(
          (data: any) => {
            if (data.status_code === 200) {
              result.chart_id = data.data.chart_id;
              if (this.dashboardId === result.dashboard_id) {
                this.dashBoardService.observableItem(result);
              }
              this._message.success('复制图表成功');
              copy_modal.destroy('onCancel');
            } else {
              this._message.error('辅助图表失败');
            }
          },
          (err: any) => {

          },
          () => {

          },
        );
      }
    });
  }

  reloadChart(event: any, dataIndex: any): void {
    // this.chartDataOptionList[dataIndex] = {data: result['data'] ? result['data'] : {data: [], meta: {}}, dataOption: sourceData};
    // this.chartDataOptionList[index] = {data: {data: [], meta: {}}, dataOption: val, dashboardId: this.dashboardId};
    this.chartDataOptionList[dataIndex] = { data: { data: [], meta: {} }, dataOption: event, dashboardId: this.dashboardId };

    /* this.dashBoardService.getChart(this.dashboardId, sourceData['chart_id']).subscribe(
       (result) => {
         if (result['status_code'] === 200) {
           this.chartDataOptionList[dataIndex] = {data: result['data'] ? result['data'] : {data: [], meta: {}}, dataOption: sourceData, dashboardId: this.dashboardId};
         }
       });*/
  }

  dateChange(event: any) {
    if (event !== undefined && event['timeFlag']) {
      this.dashboardGlobalConfig.timeFlag = event['timeFlag'];
      this.dashboardGlobalConfig.timeData = event['timeData'];
    } else {
      this.dashboardGlobalConfig.timeFlag = false;
      this.dashboardGlobalConfig.timeData = {};
    }
    this.refreshAllChart();
  }

  refreshAllChart(): void {
    if (this.chartList.length > 0) {
      this.chartList.forEach((val, index) => {
        if (this.chartDataOptionList[index] !== undefined) {
          this.chartDataOptionList[index] = { data: { data: [], meta: {} }, dataOption: val, dashboardId: this.dashboardId, dashboardConfig: this.dashboardGlobalConfig };
        }
      });
    }
  }

  delChart(event: any, dataIndex: any): void {
    const sourceData = this.chartList[dataIndex];
    this.dashBoardService.deleteChart({ dashboard_id: this.dashboardId, chart_id: sourceData['chart_id'] }).subscribe(
      (result) => {
        if (result['status_code'] === 200) {
          this.chartDataOptionList.splice(dataIndex, 1);
          this.chartList.splice(dataIndex, 1);
        }
      },
    );

    // this.chartDataOptionList.splice(dataIndex, 1);
    // this.chartList.splice(dataIndex, 1);
  }

  dragSuccess(event: any, index: number): void {
    if (event.index !== index) {
      const sourceItem = this.chartList[event.index];
      const distItem = this.chartList[index];
      this.chartList.splice(event.index, 1);
      this.chartList.splice(index, 0, sourceItem);
      this.dashBoardService.changCharOrder({ dashboard_id: this.dashboardId, chart_id: sourceItem['chart_id'], source_index: sourceItem['order'], dist_index: distItem['order'] }).subscribe(
        (result) => {
          if (result['status_code'] === 200) {
            [sourceItem.order, distItem.order] = [distItem.order, sourceItem.order];
          }
        },
        (error) => {

        },
      );
    }
  }

  editDashboard(row?) {
    const new_modal = this.modalService.create({
      nzTitle: '账户授权',
      nzWidth: 600,
      nzContent: AuthorizationBindingComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'authorization-binding',
      nzFooter: null,
      nzComponentParams: {
        // id: 0,
        // name: ''
      },
    });
    new_modal.afterClose.subscribe(result => {
      /* if (isObject(result) && result.hasOwnProperty('status')) {
         if (result['status'] === 'Ok') {
           if (result['result']['oper'] === 'edit') {
             row.dashboard_name = result['result']['data']['dashboard_name'];
           } else if (result['result']['oper'] === 'save') {
             this.dashBoardService.addDashboard(result['result']['data']);
             this.dashBoardService.setCurrentDashBoard(result['result']['data']);
             // this.router.navigate(['/dashboard/' + result['result']['data']['dashboard_id']]);
           }
         }
       }*/
    });
  }

  ngAfterViewInit(): void {

    const oauth_local = JSON.parse(localStorage.getItem('oauth_local'));
    let diffValue: any;
    if (oauth_local) {
      //得到当前时间
      const currentTime = new Date().getTime();
      //得到时间差：超过5分钟不做处理
      diffValue = (currentTime - oauth_local['time']) / 1000 / 60;
    }

    setTimeout(() => {
      if (oauth_local && oauth_local['status'] && diffValue <= 5) {
        if (oauth_local['status'] === 3 || oauth_local['status'] === 5) {
          this.editDashboard();
        }
      }
      if (oauth_local && diffValue > 5) {
        localStorage.removeItem('oauth_local'); //授权账户过来的：清除本地存储的oauth_code
      }
    });

  }

}
