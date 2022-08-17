import {forkJoin, Observable} from 'rxjs';
import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import {MonitorService} from "../../service/monitor.service";
import {ActivatedRoute, Router} from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import {ManageService} from "../../../manage/service/manage.service";


@Component({
  selector: 'app-monitor-module-detail',
  templateUrl: './monitor-module-detail.component.html',
  styleUrls: ['./monitor-module-detail.component.scss'],
  providers: [ManageService]
})
export class MonitorModuleDetailComponent implements OnInit {


  constructor(private monitorService: MonitorService,
              private route: ActivatedRoute,
              private message: NzMessageService,
              private router: Router) {

    this.publisherOption = this.monitorService.publisherOption;
    this.monitorId =  this.route.snapshot.parent.paramMap.get('id');
    this.route.params.subscribe((params) => {
      this.moduleId = params['moduleId'];
    });
  }

  public publisherOption: any;
  public monitorId: any;
  public moduleId: any;
  public chartOptions: any = [];
  public monitorDetailArray: any = [];
  public module_base = {
    1: 'account',
    2: 'campaign',
    3: 'adgroup',
    4: 'keyword',
  };
  public tableTitles = {
    account: { //账户
     name_key: 'pub_account_name',
      dataArray: [
        {name: '媒体', key: 'publisher_id'},
      ]
    },
    campaign: {
      name_key: 'pub_campaign_name',
      dataArray: [
        {name: '媒体', key: 'publisher_id'},
        {name: '账户', key: 'pub_account_name'}
        ]
    },
    adgroup: {
      name_key: 'pub_adgroup_name',
      dataArray: [
        {name: '媒体', key: 'publisher_id'},
        {name: '账户', key: 'pub_account_name'},
        {name: '计划', key: 'pub_campaign_name'},
      ]
    },
    keyword: {
      name_key: 'pub_keyword',
      dataArray: [
        {name: '媒体', key: 'publisher_id'},
        {name: '账户', key: 'pub_account_name'},
        {name: '单元', key: 'pub_adgroup_name'},
        {name: '账户', key: 'pub_account_name'},
        {name: '计划', key: 'pub_campaign_name'},
      ]
    }
  };
  public monitorDetailId: any;
  public moduleTableTitle = [];
  public moduleInfo = {};
  public monitorInfo = {};
  public options = {
    title: {
      text: '',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: []
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        dataView: {readOnly: true},
        saveAsImage: {}
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }, {
        start: 0,
        end: 0,
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'eee',
          shadowOffsetX: 0,
          shadowOffsetY: 0
        }
      }
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: false
      },
      // minInterval: 1
    },
    series: [
    ]
  };
  private ngIndex = {
    'keyword': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id', 'pub_keyword_id'],
    'adgroup': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id'],
    'campaign': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id' ],
    'account': ['publisher_id', 'chan_pub_id', 'pub_account_id'],
    'creative': ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id']
  };
  ngOnInit() {
    this.getModuleInfo();
    this.getMonitorInfo();
  }

  getMonitorInfo() {
    this.monitorService.getMonitorDetail(this.monitorId).subscribe(result => {
      if (result['status_code'] === 200) {
        this.monitorInfo = result['data'];
        this.getMonitorDetailLog(this.monitorDetailId, this.monitorInfo );
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else if (result['status_code'] && result.status_code === 205) {
      } else {
        this.message.error(result.message);
      }
    }, error => {

    });
  }

  getMonitorDetailLog(monitorDetailId , monitorInfo ) {
    const color = [
      'red',
      '#89e183' ,
      '#aaa'];
    this.chartOptions.length = [];
    this.monitorDetailArray.length = [];
    const parm = {};
    const monitorItemArray = [];
    let count = 0;
    monitorInfo['monitor_item'].forEach(monitorItem => {
      if (monitorItem['is_open'])  {
        let monitorDetail = '';
        if (monitorItem['rule_define']['key'] === 'pub_cost') {
          // monitorDetail +=  '监控详情：';
          if (monitorItem['action'] === 1) {
            monitorDetail += monitorItem['rule_define']['name'] + '波动范围超过' + this.monitorService.monitor_date_name[monitorItem.period_day * 1] + '平均值的' + monitorItem['comparison_value'] + '%';
          }
          if (monitorItem['action'] === 2) {
            monitorDetail +=  monitorItem['rule_define']['name'] + '高于' + monitorItem['comparison_value'];
          }
        }
        if (monitorItem['rule_define']['key'] === 'balance') {
          monitorDetail +=  monitorItem['rule_define']['name'] + '小于' + monitorItem['comparison_value'] ;
        }
        this.monitorDetailArray.push(monitorDetail);
        count ++;
        monitorItemArray.push(monitorItem) ;
        parm[count] = this.monitorService.getMonitorDetailLog(this.monitorId, monitorDetailId, {monitor_metric: monitorItem['rule_define']['key']});
      }
    });


    // forkJoin 操作符接收一个 Observable 对象列表，然后并行地执行它们。一旦列表的 Observable 对象都发出值后，
    // forkJoin 操作符返回的 Observable 对象会发出新的值，即包含所有 Observable 对象输出值的列表
    forkJoin(Object.values(parm)).subscribe(
      (results:any) => {
        results.forEach((result, resultIndex) => {
          if (result['status_code'] === 200 ) {
            const option = JSON.parse(JSON.stringify(this.options));
            option.title.text = monitorItemArray[resultIndex]['rule_define']['name'];
            //监控消费类型：均值时  图表上添加 参考均值线
            if (monitorItemArray[resultIndex]['rule_define']['key'] === 'pub_cost' && monitorItemArray[resultIndex]['action'] === 1) {
              result['data'].meta.y_metric.push({
                key : 'reference_value',
                name : '参考均值'
              });
            }
            result['data'].meta.y_metric.forEach((optY, index) => {
              option.legend.data.push(optY['name']);
              option.series[index] = {};
              option.series[index]['name'] = optY['name'];
              option.series[index]['type'] = 'line';
              option.series[index]['smooth'] = 'true';
              option.series[index]['color'] = [color[index]];
              option.series[index]['data'] = [];

              if (optY['key'] === 'reference_value') {
                option.series[index]['lineStyle'] = {
                  width: 2,
                  type: 'dashed'
                };
              }
              option.series[index]['markPoint'] = {
                data: [],
                symbolSize: 40,
                itemStyle: {
                  color: 'transparent'
                },
                label: {
                  fontSize: 12,
                  backgroundColor: 'green'}
              };
              result['data']['data'].forEach((view , dataIndex) => {
                option.series[index]['data'].push(view[optY['key']]);
                if (view['alarm_status'] * 1 === 1 && index === 0) { //报警
                  option.series[index]['markPoint'].data.push(
                    {name: '当前值',
                      value: view[optY['key']],
                      xAxis: dataIndex,
                      yAxis: view[optY['key']]
                      // symbolSize: 0
                    });
                }
              });

            });
            result['data'].meta.x_metrics.forEach((optX, index) => {
              result['data']['data'].forEach(viewX => {
                option.xAxis.data.push(viewX[optX['key']]);
              });
            });
            this.chartOptions.push(option);
          } else if (result['status_code'] && result['status_code'] === 401) {
            this.message.error('您没权限对此操作！');
          } else if (result['status_code'] && result['status_code'] === 500) {
            this.message.error('系统异常，请重试');
          } else if (result['status_code'] && result['status_code'] === 205) {
          } else {
            this.message.error(result['message']);
          }
        });
      });

    }

  getModuleInfo() {
   const moduleArray = this.moduleId.split('_');
   this.moduleTableTitle = this.tableTitles[this.module_base[moduleArray[0]]];
   this.monitorDetailId = moduleArray[1];
   const body = {};
   this.ngIndex[this.module_base[moduleArray[0]]].forEach((item, index) => {
     body[item] = moduleArray[index + 2];
   });
   switch (moduleArray[0] * 1) {
     case 1:
       this._showAccount(body);
       break;
     case 2:
       this._showCampaign(body);
       break;
     case 3:
       this._showAdgroup(body);
       break;
     case 4:
       this._showKeyword(body);
       break;
   }

  }

  _showKeyword(parm) {
    this.monitorService.getSingleKeywordData(parm).subscribe(
      (result) => {
        if (result.status_code === 200 ) {
          this.moduleInfo = result.data;
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      }
    );
  }

  _showCampaign(parm) {
    this.monitorService.showCampaign (parm).subscribe(
      (result) => {
        if (result.status_code === 200 ) {
          this.moduleInfo = result.data;
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      }
    );
  }

  _showAdgroup(parm) {
    this.monitorService.showAdgroup(parm).subscribe(
      (result) => {
        if (result.status_code === 200 ) {
          this.moduleInfo = result.data;
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      }
    );
  }

  _showAccount(parm) {
    this.monitorService.showAccount(parm).subscribe(
      (result) => {
        if (result.status_code === 200 ) {
          this.moduleInfo = result.data;
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      }
    );
  }

  goBack() {
    history.go(-1);
  }
}
