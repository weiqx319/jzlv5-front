import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {AuthService} from '../../../../core/service/auth.service';
import {NewChartComponent} from "../../modal/new-chart/new-chart.component";
import {DashboardService} from "../../service/dashboard.service";

@Component({
  selector: 'app-add-chart',
  templateUrl: './add-chart.component.html',
  styleUrls: ['./add-chart.component.scss'],
})
export class AddChartComponent implements OnInit {

  public _size: string;
  public _source: string;
  @Input() set btn_size(size: 'small') {
    this._size = size;
  }
  @Input() set source(source: string) {
    this._source = source;
  }

  constructor(private modalService: NzModalService,
              private dashboardService: DashboardService,
              private  route: ActivatedRoute,
              private auth: AuthService,
              private _message: NzMessageService) { }

  ngOnInit() {
  }

  addChart() {
    const bizInfo = {typeName: '', data: []};
    this.auth.getBizUnitList().subscribe(result => {

      if (result.status_code === 200) {

        if (this.auth.advertiserType * 1 === 3) { //医疗
          bizInfo.typeName = '病种';
        } else if (this.auth.advertiserType * 1 === 1) { //教育
          bizInfo.typeName = '课程';
        } else if (this.auth.advertiserType * 1 === 7) { //房地产
          bizInfo.typeName = '品牌';
        } else if (this.auth.advertiserType * 1 === 2) { //房地产
          bizInfo.typeName = '品牌';
        }
        bizInfo.data = [...result['data']];
      }
      this.chartModal(bizInfo);
    }, () => {
      this.chartModal(bizInfo);
    });

  }

  chartModal(bizInfo: {typeName: string, data: any[]}) {
    const dashboard_id = this.route.snapshot.params.id;
    const add_modal = this.modalService.create({
      nzTitle: '添加图表',
      nzWidth: 600,
      nzContent: NewChartComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'new-chart-modal',
      nzFooter: null,
      nzComponentParams: {
        setting: {
          chart_id: 0,
          chart_type: 'line',
        },
        bizInfo,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result.hasOwnProperty('chart_id')) {
        result.dashboard_id = dashboard_id;
        this.dashboardService.createChart(result).subscribe(
          (data: any) => {
            if (data.status_code === 200) {
              result.chart_id = data.data.chart_id;
              this.dashboardService.observableItem(result);
              this._message.success('新建图表成功');
              add_modal.destroy('onCancel');
            } else {
              this._message.error('新建图表失败');
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

}
