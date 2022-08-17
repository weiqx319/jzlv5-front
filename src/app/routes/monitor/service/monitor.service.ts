import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";
import {BehaviorSubject, Observable, Subject} from "rxjs";

import {HttpParams} from "@angular/common/http";

@Injectable()
export class MonitorService {

  constructor(private _httpClient: HttpClientService) { }

  private monitorInfo = {};
  private monitorInfo$ = new BehaviorSubject(null);

  private monitorRefresh: any;
  private monitorRefresh$ = new Subject<any[]>();
/*
  private moduleInfo = {};
  private moduleInfo$ = new Subject<Array<any>>();*/

  public summary_types = {
    account: '账户',
    campaign: '计划',
    adgroup: '单元',
    keyword: '关键词',
  };


  public publisherOption = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马',
    6: '广点通',
    7: '今日头条',
    16: '快手',
    17: '超级汇川',
  };

  public monitor_operation = [
    {'name': '小于等于', 'key': '<=', 'real_time': true},
    {'name': '大于等于', 'key': '>='},
    {'name': '波动范围超出昨天', 'key': 'avg_1'},
    {'name': '波动范围超出近3天平均值', 'key': 'avg_3'},
    {'name': '波动范围超出近5天平均值', 'key': 'avg_5'},
    {'name': '波动范围超出近7天平均值', 'key': 'avg_7'},
    {'name': '波动范围超出近14天平均值', 'key': 'avg_14'}
  ];

  public monitor_date_name = {
    1: '昨天',
    3: '近3天',
    5: '近5天',
    7: '近7天',
    14: '近14天',
  };

  public monitor_rate = [
    /* {'name': '15分钟', 'key': 15},
     {'name': '30分钟', 'key': 30},*/
    {'name': '1小时', 'key': 60},
    {'name': '2小时', 'key': 120},
  ];
  public monitor_rate_name = {
    15: '15分钟',
    30: '15分钟',
    60: '1小时',
    120: '2小时',
  };

  getSummaryTabNameByPublisherId(publisherId:number) {
    let tempDefault = {
      account: '账户',
      campaign: '计划',
      adgroup: '单元',
      keyword: '关键词',
    };

    if(publisherId == 7) {
      tempDefault = {
        account: '账户',
        campaign: '广告组',
        adgroup: '计划',
        keyword: '关键词',
      };
    }

    return tempDefault;



  }



  getMonitorInfo(): Observable<any> {
    return this.monitorInfo$;
  }

  setMonitorInfo(data) {
    this.monitorInfo = data;
    this.monitorInfo$.next(data);
  }


  getMonitorRefresh(): Observable<any> {
    return this.monitorRefresh$;
  }
  setMonitorRefresh(data) {
    this.monitorRefresh = data;
    this.monitorRefresh$.next(data);
  }

  getMonitorList(params) {
    const url = '/monitor';
    return this._httpClient.get(url, params);
  }
  getMonitorDetail(id): any {
    const url = '/monitor/' + id;
    return this._httpClient.get(url);
  }
  getMonitorDetailList(id, count, page, body): any {
    const url = '/monitor/' + id + '/detail_list?' + 'count=' + count + '&page=' + page;
    return this._httpClient.post(url, body);
  }

  editMonitor(body): any {
    const url = '/monitor';
    return this._httpClient.post(url, body);
  }

  showAdgroup(body): any {
    const url = '/data_view/adgroup/show';
    return this._httpClient.post(url, body);
  }
  showCampaign(body): any {
    const url = '/data_view/campaign/show';
    return this._httpClient.post(url, body);
  }
  showAccount(body): any {
    const url = '/data_view/account/show';
    return this._httpClient.post(url, body);
  }
  getSingleKeywordData(body): any {
    const url = '/data_view/keyword/show';
    return this._httpClient.post(url, body);
  }

  deleteMonitor(body): any {
    const url = '/monitor';
    return this._httpClient.delete(url, body);
  }
  updateMonitorStatus(body, monitorId): any {
    const url = '/monitor/' + monitorId + '/update_status';
    return this._httpClient.patch(url, body);
  }

  deleteModule(monitorId, body): any {
    const url = '/monitor/' + monitorId + '/del_detail';
    return this._httpClient.delete(url, body);
  }

  getMonitorDetailLog(monitorId, monitorDetailId, parm): any {
    const url = '/monitor/' + monitorId + '/' + monitorDetailId + '/detail_log';
    return this._httpClient.get(url , parm);
  }


  getMonitorLogList(id, count, page, start_time, end_time, body): any {
    const url = '/monitor/' + id + '/detail_list_log?' + 'count=' + count + '&page=' + page + '&start_time=' + start_time + '&end_time=' + end_time;
    return this._httpClient.post(url, body);
  }

  getRankingLogFileId(id, params): Observable<any> {
    const url = '/monitor/' + id + '/download_list_log';
    return this._httpClient.post(url, params);
  }


}
