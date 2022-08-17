import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";
import {Observable} from "rxjs";

@Injectable()
export class DataViewAddEditService {
  /*1,百度  2，搜狗 3,360  4，神马*/
  public matchTypes = {
    1: [
      {'name': '精确', 'value': 11},
      {'name': '短语匹配', 'value': 21},
      // {'name': '智能匹配-核心词', 'value': 23},
      {'name': '智能匹配', 'value': 23},
    ],
    2: [
      {'name': '精确', 'value': 10},
      {'name': '广泛', 'value': 30},
      {'name': '短语-精确包含', 'value': 22},
      {'name': '短语-核心包含', 'value': 23},
      {'name': '短语-同义包含', 'value': 21},
    ],
    3: [
      {'name': '精确', 'value': 10},
      {'name': '广泛', 'value': 30},
      {'name': '普通短语', 'value': 20},
      {'name': '短语-精确包含', 'value': 22},
      {'name': '短语-核心包含', 'value': 23},
      {'name': '短语-同义包含', 'value': 21},
      {'name': '智能短语', 'value': 24}
    ],
    4: [
      {'name': '精确', 'value': 10},
      {'name': '广泛', 'value': 30},
      {'name': '短语-精确包含', 'value': 22},
      {'name': '短语-核心包含', 'value': 23},
      {'name': '短语-同义包含', 'value': 21}
    ],
    10: [
      {'name': '精确', 'value': 10},
      {'name': '短语', 'value': 20},
      {'name': '广泛', 'value': 30},
    ]
  };
  public  matchType_baidu = [
    {'name': '精确', 'value': 11},
    {'name': '短语匹配', 'value': 21},
    // {'name': '智能匹配-核心词', 'value': 23},
    {'name': '智能匹配', 'value': 23},
  ];

  public match_type_sougou = [
    {'name': '精确', 'value': 10},
    {'name': '广泛', 'value': 30},
    {'name': '短语(精确包含)', 'value': 22},
    {'name': '短语-核心包含', 'value': 23},
    {'name': '短语(同义包含)', 'value': 21},
  ];

  public match_type_shenma = [
    {'name': '精确', 'value': 10},
    {'name': '广泛', 'value': 30},
    {'name': '短语-精确包含', 'value': 22},
    {'name': '短语-核心包含', 'value': 23},
    {'name': '短语-同义包含', 'value': 21}
  ];

  public Match_type_360 = [
    {'name': '精确', 'value': 10},
    {'name': '广泛', 'value': 30},
    {'name': '普通短语', 'value': 20},
    {'name': '短语-精确包含', 'value': 22},
    {'name': '短语-核心包含', 'value': 23},
    {'name': '短语-同义包含', 'value': 21},
    {'name': '智能短语', 'value': 24}
  ];

  public publisherOption = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马'
  };
  constructor(private _httpClient: HttpClientService) { }

  addSingleKeyword(body): any {
    const url = '/data_view/keyword';
    return this._httpClient.post(url, body);
  }
  addSinglePlan(body): any {
    const url = '/data_view/campaign';
    return this._httpClient.post(url, body);
  }
  addSingleUnit(body): any {
    const url = '/data_view/adgroup';
    return this._httpClient.post(url, body);
  }

  addCreative(body): any {
    const url = '/data_view/creative';
    return this._httpClient.post(url, body);
  }

  editKeyword(body, edit_type): any {
    const url = '/data_view/keyword?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }

  editAdgroup(body, edit_type): any {
    const url = '/data_view/adgroup?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }
  editCampaign(body, edit_type): any {
    const url = '/data_view/campaign?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }

  editAccount(body, edit_type): any {
    const url = '/data_view/account?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }

  editCreative(body, edit_type): any {
    const url = '/data_view/creative?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }

  getSingleKeywordData(body): any {
    const url = '/data_view/keyword/show';
    return this._httpClient.post(url, body);
  }
  getDimensionsList() {
    const url = '/define_list/dimension';
    return this._httpClient.get(url);
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
  showOriginality(body): any {
    const url = '/data_view/creative/show';
    return this._httpClient.post(url, body);
  }

  getAccountPublishers() {
    const url = '/publisher_base/account_publisher';
    return this._httpClient.get(url);
  }


  createDimension(body) {
    const url =  '/data_view/setting/dimension';
    return this._httpClient.post(url, body);
  }
  updateDimension(body, editType) {
    const url =  '/data_view/keyword/dimension?update_type=' + editType;
    return this._httpClient.put(url, body);
  }
  getAdvertiserList(body, params?): any {
    const url = '/manager_base/advertiser/get_list';
    return this._httpClient.post(url, body, params);
  }

  getPublisherOption() {
    return JSON.parse(JSON.stringify(this.publisherOption));
  }

  getMonitorList(publisher_id, summaryType) {
    const url = '/monitor/simple_list?result_model=all&publisher_id=' + publisher_id + '&monitor_module=' + summaryType;
    return this._httpClient.get(url);
  }
  editMonitor(body): any {
    const url = '/monitor';
    return this._httpClient.post(url, body);
  }
  getMonitorDetail(id): any {
    const url = '/monitor/' + id;
    return this._httpClient.get(url);
  }
  getNegativePublicCampaign(body): any {
    const url = '/data_view/campaign/show_batch';
    return this._httpClient.post(url, body);
  }
  getIpPublicAccount(body): any {
    const url = '/data_view/account/show_batch';
    return this._httpClient.post(url, body);
  }


  //获取输入框内容字节长度
  chkstrlen(str) {
    let strlen = 0;
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) { //如果是汉字，则字符串长度加2
        strlen += 2;
      } else {
        strlen++;
      }
    }
    return   strlen;
  }



}
