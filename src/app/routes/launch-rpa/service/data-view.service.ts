import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";
import {Observable, of} from "rxjs";

import {HttpParams} from "@angular/common/http";
import {map} from 'rxjs/operators';

@Injectable()
export class DataViewService {

  public channel_id = 2;
  constructor(private _httpClient: HttpClientService) { }

  public publisherOption = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马'
  };

  //资金包
  public balancePackage = [
    {name: '原生资金包', key: 0},
    {name: '凤巢资金包', key: 1},
    {name: '代理商原生资金包', key: 2},
  ];

  //推广对象: 1网站链接; 2:APP(IOS); 3:APP(ANDROID)
  public subject = [
    {name: '网站链接', key: 1},
    {name: 'APP(IOS)', key: 2},
    {name: 'APP(ANDROID)', key: 3},
  ];

  //复选流量: 1:手机百度信息流; 2:百度贴吧信息流; 优选流量用空数组; 自定义流量: []；[1]；[2]；[1,2]'
  public ftypes = [
    {name: '手机百度信息流', key: 1},
    {name: '百度贴吧信息流', key: 2},
    {name: 'APP(ANDROID)', key: 3},
  ];

  //版位: 1:列表页; 2:详情页
  public productType = [
    {name: '列表页', key: 1},
    {name: '详情页', key: 2}
  ];

  //复选版位: 1:列表页; 2: 详情页
  public productTypes = [
    {name: '列表页', key: 1},
    {name: '详情页', key: 2}
  ];

  //预算分配控制: 0:匀速, 1:不限, 2:加速
  public bgtctlType = [
    {name: '匀速', key: 0},
    {name: '不限', key: 1},
    {name: '加速', key: 2},
  ];
  //更新APP, 0:False, 1:True
  public updateApp = [
    {name: false, key: 0},
    {name: true, key: 1},
  ];


  getViewList(body, params) {
    const url = '/data_view/table_master';
    return this._httpClient.post(url, body, params);
  }


  getViewChartData(body, params) {
    const url = '/data_view/chart';
    return this._httpClient.post(url, body, params);
  }


// --- bookmark
  getBookMarkList(params): Observable<any>  {
    const url = '/data_view/bookmark';
    return this._httpClient.get(url, params);
  }



  getBookMark(bookMarkId): Observable<any>  {
    const url =  '/data_view/bookmark/' + bookMarkId;
    return this._httpClient.get(url);
  }


  updateBookMark(body): Observable<any> {
    const url = `/data_view/bookmark`;
    return this._httpClient.put(url, body);
  }

  createBookMark(body): Observable<any> {
    const url = `/data_view/bookmark`;
    return this._httpClient.post(url, body);
  }

  deleteBookMark(body): Observable<any> {
    const url = `/data_view/bookmark`;
    return this._httpClient.delete(url, body);
  }


  syncPublisher(body): any {
    const url = '/publisher_base/sync';
    return this._httpClient.post(url, body);
  }

  editAccount(publisherId,body, edit_type): any {
    let url = '';
    if(publisherId == 1) {
       url = '/data_view/account/update_baidu?update_type=' + edit_type;
    } else if(publisherId == 6) {
      url = '/data_view/feed/tencent/account?update_type=' + edit_type;
    } else if(publisherId == 7) {
      url = '/data_view/feed/bytedance/account?update_type=' + edit_type;
    }


    return this._httpClient.put(url, body);
  }
  editCampaign(publisherId,body, edit_type): Observable<any> {
    let url = '';
    if(publisherId == 1) {
      url = '/data_view/campaign/update_baidu?update_type=' + edit_type;
    } else if(publisherId == 6) {
      url = '/data_view/feed/tencent/campaign?update_type=' + edit_type;
    } else if(publisherId == 7) {
      url = '/data_view/feed/bytedance/campaign?update_type=' + edit_type;
    }
    return this._httpClient.put(url, body);
  }

  editAdgroup(publisherId,body, edit_type): any {
    let url = '';
    if(publisherId == 1) {
      url = '/data_view/adgroup/update_baidu?update_type=' + edit_type;
    } else if(publisherId == 6) {
      url = '/data_view/feed/tencent/adgroup?update_type=' + edit_type;
    } else if(publisherId == 7) {
      url = '/data_view/feed/bytedance/adgroup?update_type=' + edit_type;
    }
    return this._httpClient.put(url, body);
  }



  editAdgroupTarget(publisherId,body, edit_type): any {
    let url = '';
    if(publisherId == 1) {
      url = '/data_view/adgroup/update_baidu_target?update_type=' + edit_type;
    } else if(publisherId == 6) {
      url = '/data_view/feed/tencent/target?update_type=' + edit_type;
    } else if(publisherId == 7) {
      url = '/data_view/feed/bytedance/target?update_type=' + edit_type;
    }
    return this._httpClient.put(url, body);
  }


  editCreative(publisherId,body, edit_type): any {
    let url = '';
    if(publisherId == 1) {
      url = '/data_view/creative/update_baidu?update_type=' + edit_type;
    } else if(publisherId == 6) {
      url = '/data_view/feed/tencent/creative?update_type=' + edit_type;
    } else if(publisherId == 7) {
      url = '/data_view/feed/bytedance/creative?update_type=' + edit_type;
    }
    return this._httpClient.put(url, body);
  }



  getBaiduTargetConfig(chanPubId):any {
    const url = '/define_list/feed_config_baidu';
    return this._httpClient.get(url,{chan_pub_id:chanPubId});
  }


  getGdtTargetConfig(chanPubId):Observable<any> {
    const url = '/define_list/feed_config_eqq';
    return this._httpClient.get(url,{chan_pub_id:chanPubId});
  }

  getByteDanceTargetConfig(chanPubId):Observable<any> {
    const url = '/define_list/feed_config_bytedance';

    const bytedanceConfigCache = JSON.parse(localStorage.getItem('feed_config_bytedance_cache'));
    if(bytedanceConfigCache !== undefined && bytedanceConfigCache !== null) {

      return of(bytedanceConfigCache);
    } else {

      return this._httpClient.get(url).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            localStorage.setItem('feed_config_bytedance_cache',JSON.stringify(response));
            return response;
          } else {
            return  response;
          }
        })
      );
    }


    return this._httpClient.get(url,{chan_pub_id:chanPubId});
  }

  getByteDanceTargetAudienceList(postData):Observable<any> {
    const url = '/define_list/feed_config_audience_bytedance';
    return this._httpClient.post(url,postData);
  }

  getGdtTargetRegionConfig():Observable<any> {
    const url = '/define_list/feed_config_region_eqq';

    const regionEqqCache = JSON.parse(localStorage.getItem('feed_config_region_eqq_cache'));
    if(regionEqqCache !== undefined && regionEqqCache !== null) {

      return of(regionEqqCache);
    } else {

      return this._httpClient.get(url).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            localStorage.setItem('feed_config_region_eqq_cache',JSON.stringify(response['data']['region']));
            return response['data']['region'];
          }
        })
      );
    }


  }


}
