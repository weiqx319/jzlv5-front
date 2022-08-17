import {
  Component, ElementRef, HostListener, Input, NgZone, OnInit, AfterViewInit, ViewChild, ViewEncapsulation, Output,
  EventEmitter
} from '@angular/core';
import { isArray, isNull, isUndefined } from "@jzl/jzl-util";

import * as html2canvas from 'html2canvas';
import { JzlChartService } from "./service/jzl-chart.service";
declare var echarts: any;

@Component({
  selector: 'app-jzl-chart',
  templateUrl: './jzl-chart.component.html',
  styleUrls: ['./jzl-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class JzlChartComponent implements OnInit, AfterViewInit {

  private _size: number;
  @Input() set size(size: number) {
    this._size = size;
    if (this._chart && this.dataOption.chart_type !== 'card') {
      this._chart.resize();
    }
  }
  data: any;
  @Input() company = false;
  @Input() option: any;
  @Input() dataOption: any;
  @Input() dashboardId: any;
  @Input() dashboardConfig: {};
  @Input() theme: string;
  @Input() loading: boolean;
  @Input() initOpts: any;
  @Input() merge: any;

  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Output() copy: EventEmitter<any> = new EventEmitter<any>();
  @Output() reload: EventEmitter<any> = new EventEmitter<any>();
  @Output() del: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('chart') chartNode: ElementRef;
  @ViewChild('fullChart') fullChartNode: ElementRef;

  public errorLoading = false;

  title: string;
  isFullScreen = false;

  private _themeColorSeries = {
    count_2: ['#4cd3ea', '#ffd44b'],
    count_3: ['#4cd3ea', '#ffd44b', '#89e183',],
    count_4: ['#4cd3ea', '#ffd44b', '#89e183', '#ff97e0'],
    count_5: ['#4cd3ea', '#ffd44b', '#89e183', '#83b0ea', '#ff97e0'],
    count_6: ['#ffd44b', '#89e183', '#56acef', '#ab89f0', '#5551cf', '#f97ad3'],
    all: ['#4cd3ea', '#00ce74', '#89e183', '#ffd44b', '#ffa477', '#ff587d', '#f97ad3', '#ab58e5', '#ab89f0', '#5551cf', '#8890e9', '#3d5088', '#83b0ea', '#00a1ff', '#4cd3ea', '#00ceca', '#00e2be', '#ffbc29', '#ff6b5b']
  };
  private fullView = false;
  private _chart: any = null;
  private _fullChart: any = null;
  private currentWindowWidth: any = null;
  constructor(private el: ElementRef,
    private _zone: NgZone,
    private dashBoardService: JzlChartService
  ) {

  }

  ngOnInit() {
    this.title = this.dataOption.chart_name;
    this.getChart();
    /*  if (this.option['meta'] && Object.keys(this.option['meta']).length > 0) {
        // this.createOption(this.option, this.dataOption);

      } else {
        this.errorLoading = true;
      }*/

  }

  getChart() {
    this.errorLoading = true;
    let currentDashboardConfig = {};
    if (!!this.dashboardConfig['timeFlag']) {
      currentDashboardConfig['timeFlag'] = true;
      currentDashboardConfig['timeData'] = this.dashboardConfig['timeData'];
    }
    if (Object.values(currentDashboardConfig).length === 0) {
      currentDashboardConfig = undefined;
    }

    this.dashBoardService.getChart(this.company, this.dashboardId, this.dataOption['chart_id'], currentDashboardConfig).subscribe(
      (result) => {
        this.errorLoading = false;

        if (this.dataOption['chart_type'] === 'map') {
          this.createOption({}, this.dataOption);

          this._chart = this.createChart(this.chartNode.nativeElement);
          this._chart.setOption(this.data);

          return;
        }

        if (result['status_code'] && result['status_code'] === 200) {
          if (result['data']['meta'] && Object.keys(result['data']['meta']).length > 0) {
            this.createOption(result['data'], this.dataOption);
            if (this.dataOption.chart_type !== 'card') {
              this._chart = this.createChart(this.chartNode.nativeElement);
              this._chart.setOption(this.data);
            } else {
              this.createCardChart();
            }

          } else {
            this.errorLoading = true;
          }
        } else {
          this.errorLoading = true;
        }
      }
    );
  }

  ngAfterViewInit(): void {
    /*console.log(12);
    console.log(this.data);
    if (!isUndefined(this.data)) {
      if (this.dataOption.chart_type !== 'card') {
        this._chart = this.createChart(this.chartNode.nativeElement);
        this._chart.setOption(this.data);
      } else {
        this.createCardChart();
      }

    } else {
      // this.errorLoading = true;
    }*/

    /*if (!isUndefined(this.data)) {
      if (this.dataOption.chart_type !== 'card') {
        this._chart = this.createChart(this.chartNode.nativeElement);
        this._chart.setOption(this.data);
      } else {
        this.createCardChart();
      }

    } else {
      // this.errorLoading = true;
    }*/

  }

  private createChart(dom: any) {
    this.currentWindowWidth = window.innerWidth;
    if (window && window.getComputedStyle) {
      const prop = window.getComputedStyle(dom, null).getPropertyValue('height');
      if (!prop || prop === '0px') {
        dom.style.height = '320px';
      }
    }
    // runOutsideAngular --通知NgZone的父Zone在捕获到异步事件时直接返回,从而不在触发自定义的onMicrotaskEmpty事件,直接作用就是不在通知Angular执行变化监测.
    return this._zone.runOutsideAngular(() => echarts.init(dom, this.theme || undefined, this.initOpts || undefined));
  }

  private createCardChart() {
    setTimeout(() => {
      // @ts-ignore
      html2canvas(this.el.nativeElement.children[0].querySelector('.myCard')).then(canvas => {
        // 修改生成的宽度
        this._chart = canvas;
        this._chart.style.width = "450px";
        this._chart.style.height = "320px";
      });
    }, 0);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    // if (event.target.innerWidth !== this.currentWindowWidth) {
    //   this.currentWindowWidth = event.target.innerWidth;
    if (this._chart && this.dataOption.chart_type !== 'card') {
      this._chart.resize();
    }
    if (this._fullChart && this.dataOption.chart_type !== 'card') {
      this._fullChart.resize();
    }
    // }
  }

  getChartImageUrlObj(): Object {
    let downloadData = {};
    if (this.dataOption.chart_type !== 'card') {
      const imgData = this._chart.getConnectedDataURL(
        {
          type: "png",
          backgroundColor: '#fff',
          // excludeComponents: model.get('excludeComponents'),
          // pixelRatio: 1
        }
      );
      downloadData = {
        data: imgData,
        title: this.title,
        width: this._chart.getWidth(),
        height: this._chart.getHeight()
      };
    } else {
      const type = 'png';   //设置下载图片的格式
      const img_png_src = this._chart.toDataURL("image/png");  //将canvas保存为图片
      const imgData = img_png_src.replace(this.imgType(type), 'image/octet-stream');
      downloadData = {
        data: imgData,
        title: this.title,
        width: 450,
        height: 320
      };
    }
    return downloadData;

  }

  imgType(ty) {
    const type = ty.toLowerCase().replace(/jpg/i, 'jpeg');
    const r = type.match(/png|jpeg|bmp|gif/)[0];
    return 'image/' + r;
  }

  downloadChartImage(): void {
    const download$a = document.createElement('a');
    download$a.download = this.title + '.png';
    download$a.target = '_blank';
    let imgData: any;
    if (this.dataOption.chart_type === 'card') {

      const type = 'png';   //设置下载图片的格式
      const img_png_src = this._chart.toDataURL("image/png");  //将canvas保存为图片
      imgData = img_png_src.replace(this.imgType(type), 'image/octet-stream');

    } else {
      imgData = this._chart.getConnectedDataURL(
        {
          type: "png",
          backgroundColor: '#fff',
          // excludeComponents: model.get('excludeComponents'),
          // pixelRatio: 2
        }
      );
    }

    download$a.href = imgData;
    // Chrome and Firefox
    if (typeof MouseEvent === 'function') {
      const downloadEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      });
      download$a.dispatchEvent(downloadEvt);
    } else {
      if (window.navigator.msSaveOrOpenBlob) {
        const bstr = atob(imgData.split(',')[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr]);
        window.navigator.msSaveOrOpenBlob(blob, this.title + '.png');
      } else {
        const html = '' +
          '<body style="margin:0;">' +
          '<img src="' + imgData + '" style="max-width:100%;" title="' + this.title + '.png" />' +
          '</body>';
        const tab = window.open();
        tab.document.write(html);
      }
    }
  }

  editChart(): void {
    this.edit.emit(this.data);
  }
  copyChart(): void {
    this.copy.emit(this.dataOption);
  }
  reloadChart(): void {
    this.reload.emit(this.dataOption);
  }

  fullScreen(): void {
    this.isFullScreen = true;
    // this.fullView = true;
    setTimeout(() => {

      if (this.dataOption.chart_type !== 'card') {
        this._fullChart = this.createChart(this.fullChartNode.nativeElement);
        this._fullChart.setOption(this.data);
      }

    }, 0);

  }

  // fullScreenModel(content): void {
  //   this.addModal = this.modalService.create({
  //     title: '创建报表',
  //     width: 600,
  //     content: content,
  //    nzFooter: null,
  //     closable: true,
  //     nzMaskClosable: false,
  //     wrapClassName: 'create-report-modal',
  //   });
  // }

  closeFullScreen(): void {
    this.isFullScreen = false;
    // this.fullView = false;
    // this.fullChartNode.nativeElement.parentElement.style.display = 'none';
    this._fullChart = null;
  }

  delChart(): void {
    this.del.emit(this.data);

  }

  private createOption(data: any, dataOption: any) {
    switch (dataOption.chart_type) {
      case 'line':
        this.createLineOption(data, dataOption);
        break;
      case 'lineStack':
        this.createLineStackOption(data, dataOption);
        break;
      case 'bar':
        this.createBarOption(data, dataOption);
        break;
      case 'pie':
        this.createPieOption(data, dataOption);
        break;
      case 'card':
        this.createCardOption(data, dataOption);
        break;
      case 'funnel':
        this.createFunnelOption(data, dataOption);
        break;
      case 'map':
        this.createMapOption(data, dataOption);
        break;

    }

  }

  private createLineOption(data: any, dataOption: any) {
    const dataChart = {
      tooltip: {
        trigger: 'axis',
        textStyle: {
          fontSize: 10
        },
      },
      textStyle: {
        fontSize: 10
      },
      legend: {
        type: 'scroll',
        data: []
      },
      xAxis: [],
      yAxis: [{
        type: 'value',
        axisLabel: {
          fontSize: 10
        },
        splitLine: {
          show: false
        }
      }],
      color: this._themeColorSeries['all'],
      series: []
    };
    const xAxisObject = {};
    const yAxisObject = [
      {
        type: 'value',
        axisLabel: { fontSize: 10, color: '#7f7f7f' },
        show: false,
        nameTextStyle: { color: '#7f7f7f' },
        splitLine: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e4e4e4"
          }
        }
      },
      {
        type: 'value',
        axisLabel: { fontSize: 10, color: '#7f7f7f' },
        show: false,
        nameTextStyle: { color: '#7f7f7f' },
        splitLine: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e4e4e4"
          }
        }
      }];
    let yAxisLineNum = 0;
    let yAxisBarNum = 0;
    let maxLineValue = 0;
    let maxBarValue = 0;
    let yAxisLineName = '';
    let yAxisBarName = '';
    const metaData = data['meta'];
    const chartDataDetail = data['data'];
    const metaFields = metaData['metrics'];
    const legendKeyData = {};
    if (metaFields.length > 0) {
      metaFields.forEach((val, index) => {
        if (!val.is_x) {
          dataChart.legend.data.push(val.name);

          if (val.type === 'line' || val.type === 'smooth_line') {
            yAxisLineNum++;
            legendKeyData[val.key] = { name: val.name, type: 'line', data: [], smooth: false };
            if (val.type === 'smooth_line') {
              legendKeyData[val.key]['smooth'] = true;
            }
            yAxisObject[0]['show'] = true;
            legendKeyData[val.key]['yAxisIndex'] = 0;
            chartDataDetail.forEach((detail) => {
              legendKeyData[val.key]['data'].push(detail[val.key]);
            });
            yAxisLineName = val['name'];
            maxLineValue = Math.max(maxLineValue, ...legendKeyData[val.key]['data']);
          } else {
            yAxisBarNum++;
            legendKeyData[val.key] = { name: val.name, type: val.type, data: [], smooth: false, barMaxWidth: 30 };
            legendKeyData[val.key]['yAxisIndex'] = 1;
            yAxisObject[1]['show'] = true;
            yAxisBarName = val['name'];
            chartDataDetail.forEach((detail) => {
              legendKeyData[val.key]['data'].push(detail[val.key]);
            });
            maxBarValue = Math.max(maxBarValue, ...legendKeyData[val.key]['data']);
          }

        } else {
          xAxisObject[val.key] = {
            type: 'category',
            data: [],
            axisLabel: {
              fontSize: 10,
              color: '#7f7f7f'
            },
            nameTextStyle: { color: '#7f7f7f' },
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: "#e4e4e4"
              }
            },
            // name: val.name
          };
          chartDataDetail.forEach((detail) => {
            xAxisObject[val.key]['data'].push(detail[val.key]);
          });
        }
      });
    }
    if (maxLineValue > 1000) {
      if (yAxisLineNum === 1) {
        yAxisObject[0]['name'] = yAxisLineName + '(千)';
      } else {
        yAxisObject[0]['name'] = '(千)';
      }

      yAxisObject[0]['axisLabel']['formatter'] = function (value) {
        return value / 1000;
      };
    } else {
      if (yAxisLineNum === 1) {
        yAxisObject[0]['name'] = yAxisLineName;
      }
    }

    if (maxBarValue > 1000) {
      if (yAxisBarNum === 1) {
        yAxisObject[1]['name'] = yAxisBarName + '(千)';
      } else {
        yAxisObject[1]['name'] = '(千)';
      }

      yAxisObject[1]['axisLabel']['formatter'] = function (value) {
        return value / 1000;
      };
    } else {
      if (yAxisBarNum === 1) {
        yAxisObject[1]['name'] = yAxisBarName;
      }
    }

    dataChart.xAxis = Object.values(xAxisObject);
    dataChart.yAxis = Object.values(yAxisObject);
    dataChart.series = Object.values(legendKeyData);
    if (dataChart.series.length >= 2 && dataChart.series.length <= 6) {
      dataChart.color = this._themeColorSeries['count_' + dataChart.series.length];
    }

    this.data = dataChart;

  }

  private createLineStackOption(data: any, dataOption: any) {
    const dataChart = {
      tooltip: {
        trigger: 'axis',
        textStyle: {
          fontSize: 10
        },
      },
      legend: {
        type: 'scroll',
        data: []
      },
      textStyle: {
        fontSize: 10
      },
      xAxis: [],
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 10,
          color: '#7f7f7f'
        },
        nameTextStyle: { color: '#7f7f7f' },
        splitLine: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e4e4e4"
          }
        }
      },
      color: this._themeColorSeries['all'],
      series: []
    };
    const metaData = data['meta'];
    const chartDataDetail = data['data'];
    const metaFields = metaData['metrics'];
    const stackMetrics = metaData['data_items'];
    const xAxisObject = {};
    const legendKeyData = {};

    let lineSmooth = false;
    metaFields.forEach((val, index) => {
      if (val.is_x) {
        xAxisObject[val.key] = {
          type: 'category',
          boundaryGap: false,
          data: [],
          axisLabel: {
            fontSize: 10,
            color: '#7f7f7f'
          },
          nameTextStyle: { color: '#7f7f7f' },
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: "#e4e4e4"
            }
          },
          // name: val.name
        };
        chartDataDetail.forEach((detail) => {
          xAxisObject[val.key]['data'].push(detail[val.key]);
        });
      } else {
        dataChart.yAxis['name'] = val.name;
        if (val.type === 'smooth_line') {
          lineSmooth = true;
        }
      }
    });
    let maxValue = 0;
    stackMetrics.forEach((val, index) => {
      dataChart.legend.data.push(val.name);
      legendKeyData[val.key] = { name: val.name, type: "line", stack: '总量', smooth: lineSmooth, areaStyle: {}, data: [] };
      chartDataDetail.forEach((detail) => {
        legendKeyData[val.key]['data'].push(detail[val.key]);
      });
      maxValue = Math.max(maxValue, ...legendKeyData[val.key]['data']);
    });
    if (maxValue > 1000) {
      dataChart.yAxis['name'] = dataChart.yAxis['name'] + '(千)';
      dataChart.yAxis['axisLabel']['formatter'] = function (value) {
        return value / 1000;
      };

    }
    dataChart.xAxis = Object.values(xAxisObject);
    dataChart.series = Object.values(legendKeyData);
    if (dataChart.series.length >= 2 && dataChart.series.length <= 6) {
      dataChart.color = this._themeColorSeries['count_' + dataChart.series.length];
    }
    this.data = dataChart;

  }

  private createBarOption(data: any, dataOption: any) {
    const dataChart = {
      tooltip: {
        trigger: 'axis',
        textStyle: {
          fontSize: 10
        },
      },
      legend: {
        data: []
      },
      textStyle: {
        fontSize: 10
      },
      xAxis: [],
      /*  yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: 10,
            color: '#7f7f7f'
          },
          splitLine: {
            show: false
          },
          nameTextStyle: {color: '#7f7f7f'},
          axisLine: {
            lineStyle: {
              color:  "#e4e4e4"
            }
          }
        },*/
      yAxis: [{
        type: 'value',
        axisLabel: {
          fontSize: 10
        },
        splitLine: {
          show: false
        }
      }],
      color: this._themeColorSeries['all'],
      series: []
    };
    const xAxisObject = {};
    const yAxisObject: any = [
      {
        type: 'value',
        axisLabel: { fontSize: 10, color: '#7f7f7f' },
        show: false,
        nameTextStyle: { color: '#7f7f7f' },
        splitLine: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e4e4e4"
          }
        }
      },
      {
        type: 'value',
        axisLabel: { fontSize: 10, color: '#7f7f7f' },
        show: false,
        nameTextStyle: { color: '#7f7f7f' },
        splitLine: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e4e4e4"
          }
        }
      }];
    const metaData = data['meta'];
    const chartDataDetail = data['data'];
    const metaFields = metaData['metrics'];
    const legendKeyData = {};

    let yAxisLineNum = 0;
    let yAxisBarNum = 0;
    let maxLineValue = 0;
    let maxBarValue = 0;
    let yAxisLineName = '';
    let yAxisBarName = '';

    // let maxValue = 0;
    // let yAxisNum = 0;
    // let yAxisName = '';

    if (metaFields.length > 0) {
      metaFields.forEach((val, index) => {
        if (!val.is_x) {
          dataChart.legend.data.push(val.name);
          /*legendKeyData[val.key] = {name: val.name, type: val.type, data: [], barMaxWidth: 30};
          if (val.type === 'line') {
            legendKeyData[val.key]['smooth'] = true;
          }
          chartDataDetail.forEach((detail) => {
            legendKeyData[val.key]['data'].push(detail[val.key]);
          });
          maxValue = Math.max(maxValue, ...legendKeyData[val.key]['data']);
          yAxisNum++;
          yAxisName = val.name;*/
          if (val.type === 'line' || val.type === 'smooth_line') {
            yAxisLineNum++;
            legendKeyData[val.key] = { name: val.name, type: 'line', data: [], smooth: false };
            if (val.type === 'smooth_line') {
              legendKeyData[val.key]['smooth'] = true;
            }
            yAxisObject[0]['show'] = true;
            legendKeyData[val.key]['yAxisIndex'] = 0;
            chartDataDetail.forEach((detail) => {
              legendKeyData[val.key]['data'].push(detail[val.key]);
            });
            yAxisLineName = val['name'];
            maxLineValue = Math.max(maxLineValue, ...legendKeyData[val.key]['data']);
          } else {
            yAxisBarNum++;
            legendKeyData[val.key] = { name: val.name, type: val.type, data: [], smooth: false, barMaxWidth: 30 };
            legendKeyData[val.key]['yAxisIndex'] = 1;
            yAxisObject[1]['show'] = true;
            yAxisBarName = val['name'];
            chartDataDetail.forEach((detail) => {
              legendKeyData[val.key]['data'].push(detail[val.key]);
            });
            maxBarValue = Math.max(maxBarValue, ...legendKeyData[val.key]['data']);
          }
        } else {
          xAxisObject[val.key] = {
            type: 'category',
            data: [],
            axisLabel: {
              fontSize: 10,
              color: '#7f7f7f'
            },
            nameTextStyle: { color: '#7f7f7f' },
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: "#e4e4e4"
              }
            },
            // name: val.name
          };
          chartDataDetail.forEach((detail) => {
            if (val.hasOwnProperty('field_name_key') && val.field_name_key !== '') {
              xAxisObject[val.key]['data'].push(detail[val.field_name_key]);
            } else {
              xAxisObject[val.key]['data'].push(detail[val.key]);
            }

          });
        }
      });
    }
    /*  if (maxValue > 1000) {
        if (yAxisNum === 1) {
          dataChart.yAxis['name'] =  yAxisName + '(千)';
        } else {
          dataChart.yAxis['name'] =  '(千)';
        }

        dataChart.yAxis['axisLabel']['formatter'] = function (value) {
          return value / 1000;
        };

      } else {
        if (yAxisNum === 1) {
          dataChart.yAxis['name'] =  yAxisName;
        }
      }*/
    // console.log(maxLineValue);
    // console.log(maxBarValue);
    if (maxLineValue > 0) {
      if (maxLineValue > 1000) {
        if (yAxisLineNum === 1) {
          yAxisObject[0]['name'] = yAxisLineName + '(千)';
        } else {
          yAxisObject[0]['name'] = '(千)';
        }

        yAxisObject[0]['axisLabel']['formatter'] = function (value) {
          return value / 1000;
        };
      } else {
        if (yAxisLineNum === 1) {
          yAxisObject[0]['name'] = yAxisLineName;
        }
      }
    }

    let bar_axis_index: any;
    if (maxLineValue === 0) {
      bar_axis_index = 0;
      if (!yAxisLineNum) {
        yAxisObject.splice(0, 1);
      }
    } else {
      bar_axis_index = 1;
    }
    if (maxBarValue > 0) {
      if (maxBarValue > 1000) {
        if (yAxisBarNum === 1) {
          yAxisObject[bar_axis_index]['name'] = yAxisBarName + '(千)';
        } else {
          yAxisObject[bar_axis_index]['name'] = '(千)';
        }

        yAxisObject[bar_axis_index]['axisLabel']['formatter'] = function (value) {
          return value / 1000;
        };
      } else {
        if (yAxisBarNum === 1) {
          yAxisObject[bar_axis_index]['name'] = yAxisBarName;
        }
      }
    }

    const legendKeyDataKeysCount = Object.keys(legendKeyData).length;
    const legendKeyDataValues = Object.values(legendKeyData);

    if (legendKeyDataKeysCount === 1) {
      legendKeyDataValues[0]['yAxisIndex'] = 0;
      legendKeyDataValues[0]['show'] = true;
    } else {
      let barCount = 0;
      legendKeyDataValues.forEach(serItem => {
        if (serItem['type'] === 'bar') {
          barCount++;
        }
      });
      if (barCount === legendKeyDataKeysCount) {
        legendKeyDataValues.forEach(serItem => {
          serItem['yAxisIndex'] = 0;
        });
      }
    }

    // console.log(legendKeyData);
    dataChart.xAxis = Object.values(xAxisObject);
    dataChart.yAxis = Object.values(yAxisObject);
    dataChart.series = Object.values(legendKeyData);
    if (dataChart.series.length >= 2 && dataChart.series.length <= 6) {
      dataChart.color = this._themeColorSeries['count_' + dataChart.series.length];
    }
    this.data = dataChart;

  }
  private createPieOption(data: any, dataOption: any) {
    const dataChart = {
      tooltip: {
        trigger: 'item',
        textStyle: {
          fontSize: 10
        },
        formatter: '{b}:{c}({d}%)'
      },
      textStyle: {
        fontSize: 10
      },
      legend: {
        type: 'scroll',
        data: [],
      },
      series: [
      ],
      color: this._themeColorSeries['all'],
    };
    const metaData = data['meta'];
    const chartDataDetail = data['data'];
    const metaFields = metaData['metrics'];
    const legendKeyData = { type: 'pie', data: [], radius: ['30%', '50%'], label: { formatter: '{b}:({d}%)' } };
    const legendXData = [];
    chartDataDetail.forEach((item) => {
      legendXData.push(item.name);
      //  dataChart.dataset.source.push([item.name,item.value])
    });
    if (legendXData.length >= 2 && legendXData.length <= 6) {
      dataChart.color = this._themeColorSeries['count_' + legendXData.length];
    }
    legendKeyData['data'] = chartDataDetail;
    dataChart.series = [legendKeyData];
    dataChart.legend.data = legendXData;

    this.data = dataChart;
  }
  private createCardOption(data: any, dataOption: any) {
    const dataChart = [];
    const metaData = data['meta'];
    const chartDataDetail = data['data'];
    const metaFields = metaData['metrics'];
    if (metaFields.length > 0) {
      metaFields.forEach(item => {
        const fieldItem = {
          name: item.name,
          key: item.key,
          // value: chartDataDetail[0][item.key],
        };

        if (chartDataDetail.length) {
          fieldItem['value'] = chartDataDetail[0][item.key];
        } else {
          fieldItem['value'] = null;
        }
        if (item.key === 'pub_cost') {
          fieldItem['unit'] = '元';
        } else if (item.key === 'pub_click') {
          fieldItem['unit'] = '次';
        } else if (item.key === 'pub_impression') {
          fieldItem['unit'] = '次';
        } else if (item.key === 'pub_ctr') {
          fieldItem['unit'] = '%';
        } else if (item.key === 'metric_32') {
          fieldItem['unit'] = '%';
        } else {
          fieldItem['unit'] = '';
        }

        dataChart.push(fieldItem);
      });
    }

    this.data = dataChart;
  }

  private createFunnelOption(data: any, dataOption: any) {
    const dataChart = {
      tooltip: {
        trigger: 'item',
        textStyle: {
          fontSize: 10
        },
        formatter: '{b}:{c}'
      },
      textStyle: {
        fontSize: 10
      },
      legend: {
        type: 'scroll',
        data: [],
      },
      series: [{
        data: []
      }
      ],
      color: this._themeColorSeries['all'],
    };
    const metaData = data['meta'];
    const chartDataDetail = data['data'];
    const metaFields = metaData['metrics'];
    const legendKeyData = {
      type: 'funnel',
      left: '10%',
      width: '80%',
      sort: 'none',
      label: {
        formatter: '{b}:{c}',
        position: 'inside',
        color: '#404040'
      },
      emphasis: {
        label: {
          formatter: '{b}: {c}'
        }
      },
      labelLine: {
        show: false
      },
      itemStyle: {
        opacity: 0.7
      },
      data: []
    };
    if (metaFields.length > 0) {
      metaFields.forEach(item => {
        const fieldItem = {
          name: item.name,
          key: item.key
        };
        if (chartDataDetail.length) {
          fieldItem['value'] = chartDataDetail[0][item.key] || 0;
        } else {
          fieldItem['value'] = 0;
        }
        legendKeyData.data.push(fieldItem);
        dataChart.legend.data.push(item.name);
      });
    }
    dataChart.series = [legendKeyData];
    this.data = dataChart;
  }

  private createMapOption(data: any, dataOption: any) {
    const mapType = dataOption.summary_type === 'province_region' ? 'china' : 'world';
    const chinaData = [
      { name: "北京", value: "50" },
      { name: "广东", value: "49" },
      { name: "福建", value: "17" },
      { name: "河北", value: "10" },
      { name: "山东", value: "10" },
      { name: "浙江", value: "8" },
      { name: "安徽", value: "8" },
      { name: "广西", value: "8" },
      { name: "四川", value: "8" },
      { name: "河南", value: "8" },
      { name: "新疆", value: "0" },
      { name: '天津', value: Math.round(Math.random() * 1000) },
      { name: '上海', value: Math.round(Math.random() * 1000) },
      { name: '重庆', value: Math.round(Math.random() * 1000) },
      { name: '安徽', value: Math.round(Math.random() * 1000) },
      { name: '江西', value: Math.round(Math.random() * 1000) },
      { name: '山西', value: Math.round(Math.random() * 1000) },
      { name: '内蒙古', value: Math.round(Math.random() * 1000) },
      { name: '吉林', value: Math.round(Math.random() * 1000) },
      { name: '福建', value: Math.round(Math.random() * 1000) },
      { name: '广东', value: Math.round(Math.random() * 1000) },
      { name: '西藏', value: Math.round(Math.random() * 1000) },
      { name: '宁夏', value: Math.round(Math.random() * 1000) },
      { name: '香港', value: Math.round(Math.random() * 1000) },
      { name: '澳门', value: Math.round(Math.random() * 1000) }
    ];
    const countryData = [
      { name: "中国", value: "450" },
      { name: "俄罗斯", value: 49 },
      { name: "美国", value: 149 },
      { name: '加拿大', value: 341 }
    ];
    const nameMap = {
      'Russia': '俄罗斯',
      'Canada': '加拿大',
      'China': '中国',
      'United States': '美国'
    };
    const dataArea = mapType === 'china' ? chinaData : countryData;
    data = {
      data: dataArea,
      data_range: {
        select_type: "publisher",
        select_data: []
      },
      meta: {
        metrics: [
          {
            id: 1,
            key: "pub_click",
            name: "点击",
            type: "line",
            is_x: false,
            order: 0,
            yAxis_name: "yAxis_1",
            data_type: "pub_data"
          }
        ],
        data_items: []
      }
    };

    const dataChart = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, .8)',
        padding: [6, 6, 8, 6],
        textStyle: {
          fontSize: 10
        },
        formatter: '地区: {b}<br/>{a}: {c}'
      },
      textStyle: {
        fontSize: 11
      },
      /*legend: {
        orient: 'vertical',
        left: 'left',
        data: ['iphone3']
      },*/
      visualMap: {
        min: 0,
        max: 2000,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],           // 文本，默认为数值文本
        calculable: true
      },
      /*toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: {show: true},
          dataView: {show: true, readOnly: false},
          restore: {show: true},
          saveAsImage: {show: true}
        }
      },*/
      series: [

      ]
    };

    const metaData = data['meta'];
    const chartDataDetail = data['data'];
    const metaFields = metaData['metrics'];
    const legendKeyData = {
      name: metaFields[0].name, // 展现， 点击
      type: 'map',
      mapType: mapType,  // world
      itemStyle: {
        areaColor: 'white',
        borderColor: '#999',
      },
      label: { show: true, color: '#333' },
      /*,
       emphasis: {
         areaColor: '#A5DABB'  // 设置背景颜色
       }*/
    };
    legendKeyData['data'] = chartDataDetail;
    if (mapType === 'world') {
      legendKeyData['nameMap'] = nameMap;
    }
    dataChart.series = [legendKeyData];

    this.data = dataChart;
  }

  private createLine2Option(data: any, dataOption: any) {

  }

}
