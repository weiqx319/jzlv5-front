import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";
import {Observable} from "rxjs";

import {HttpParams} from "@angular/common/http";

@Injectable()
export class DataViewService {


  constructor(private _httpClient: HttpClientService) { }

  public publisherOption = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马'
  };

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
    17: [
      {'name': '精确匹配', 'value': 0},
      {'name': '高级短语核心包含', 'value': 1},
      {'name': '广泛匹配', 'value': 2},
      {'name': '高级短语同义包含', 'value': 8},
      {'name': '高级短语精确包含', 'value': 9},
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
    {'name': '短语-精确包含', 'value': 22},
    {'name': '短语-核心包含', 'value': 23},
    {'name': '短语-同义包含', 'value': 21},
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

  public channelItems = [
    {label: '搜索推广', value: 1, publisher: 1,  has_account: true, disabled: true, checked: true},
    {label: '搜索推广-闪投', value: 1001, publisher: 1, has_account: true},
    {label: '搜索推广-蹊径', value: 1002, publisher: 1, has_account: true},
    {label: '信息流', value: 2, publisher: 1, has_account: true},
    {label: '百度华表', value: 1101, publisher: 1, has_account: true},
    {label: '百度知识营销', value: 1102, publisher: 1, has_account: true},
    {label: '百度图片推广', value: 1103, publisher: 1, has_account: true},
    {label: '百度品牌推广', value: 1104, publisher: 1, has_account: true},
    {label: '百度百意', value: 1105, publisher: 1, has_account: true},
    {label: '百度品牌起跑线', value: 1106, publisher: 1, has_account: true},
    {label: '百度Hao123点金推广', value: 1107, publisher: 1, has_account: true},
    {label: '百度百科专区', value: 1201, publisher: 1},
    {label: '百度视频专区', value: 1202, publisher: 1},
    {label: '百度无线专区', value: 1203, publisher: 1},
    {label: '百度展示广告', value: 3, publisher: 1},
    {label: '百度贴吧', value: 1204, publisher: 1},
    {label: '百度手机助手', value: 1205, publisher: 1},
    {label: '搜索推广', value: 1, publisher: 2, has_account: true, disabled: true, checked: true},
    {label: '搜索推广-皇冠', value: 2001, publisher: 2, has_account: true},
    {label: '信息流', value: 2, publisher: 2, has_account: true},
    {label: '搜狗品牌专区', value: 2201, publisher: 2},
    {label: '搜狗品牌地标', value: 2202, publisher: 2},
    {label: '搜狗品牌起跑线', value: 2203, publisher: 2},
    {label: '品牌直通车', value: 2204, publisher: 2},
    {label: '搜狗无线专区', value: 2205, publisher: 2},
    {label: '搜索推广', value: 1, publisher: 3, has_account: true, disabled: true, checked: true},
    {label: '360展示广告', value: 3, publisher: 3, has_account: true},
    {label: '搜索推广-比翼', value: 3001, publisher: 3, has_account: true},
    {label: '360如意推广', value: 3201, publisher: 3},
    {label: '360猜你喜欢', value: 3202, publisher: 3},
    {label: '360品牌专区', value: 3203, publisher: 3},
    {label: '360图片品牌专区', value: 3204, publisher: 3},
    {label: '360品牌日出', value: 3205, publisher: 3},
    {label: '360品牌臻选', value: 3206, publisher: 3},
    {label: '360奇迹推广', value: 3207, publisher: 3},
    {label: '360手机助手', value: 3208, publisher: 3},
    {label: '搜索推广', value: 1, publisher: 4, has_account: true, disabled: true, checked: true},
    {label: '搜索推广-子链', value: 4001, publisher: 4, has_account: true},
    {label: '展示广告', value: 3, publisher: 4},
    {label: 'UC头条', value: 4201, publisher: 4},
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
  getAccountPublishers() {
    const url = '/publisher_base/account_publisher';
    return this._httpClient.get(url);
  }

  getAllNegativeWordGroupList(): any {
    const url = "/negative_word/group/all";
    return this._httpClient.get(url);
  }

  createNegativeWord(body): any {
    const url = '/negative_word/word/add';
    return this._httpClient.post(url, body);
  }

  getPublisherBySelectedType(selected_data, selected_type) {
    const publishers = {};
    const publisherArray = [];
    let number = 0; //记录有几种媒体
    if (selected_type === 'current') {

      selected_data.forEach((item) => {
        if (!publishers.hasOwnProperty(item.publisher_id)) {
          publishers[item.publisher_id] = 1;
          publisherArray.push({
            'name': item['publisher'],
            'value': item['publisher_id'] * 1,
          });
          number ++;
        }
      });
    }
    if (selected_type === 'all') {
      this.getAccountPublishers().subscribe(
        (result) => {
          const accountAllPublishers = result['data'];
          number = accountAllPublishers.length;
          accountAllPublishers.forEach((pub) => {
            publisherArray.push({
              'name': this.publisherOption[pub],
              'value': pub
            });
          });
        }
      );
    }
    return {
      'publisher_array': publisherArray,
      'publisherCount' : number
    };
  }


  getRankingCode(body, params) {
    const url = '/publisher_base/ranking_code';
    return this._httpClient.post(url, body, params);
  }


  getKeywordPrice(body) {
    const url = '/publisher_base/price';
    return this._httpClient.post(url, body);
  }

  addSingleKeyword(body): any {
    const url = '/data_view/keyword';
    return this._httpClient.post(url, body);
  }
  editAccount(body, edit_type): any {
    const url = '/data_view/account?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }
  editCampaign(body, edit_type): any {
    const url = '/data_view/campaign?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }

  editAdgroup(body, edit_type): any {
    const url = '/data_view/adgroup?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }
  editKeyword(body, edit_type): any {
    const url = '/data_view/keyword?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }
  editCreative(body, edit_type): any {
    const url = '/data_view/creative?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }

  editOcpcBaidu(body, edit_type): any {
    const url = '/data_view/sem/ocpc/ocpc_baidu?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }

  checkRankingHtml(body): any {
    const url = '/publisher_base/check_ranking_htm';
    return this._httpClient.post(url, body);
  }

  getSingleKeywordData(body): any {
    const url = '/data_view/keyword/show';
    return this._httpClient.post(url, body);
  }

  getConversionLists(): Observable<any> {
    const url = '/define_list/conversion?list_type=filter';
    return this._httpClient.get(url);
  }

  getAccountChannelObject() {
    const result = {};
    this.channelItems.forEach(item => {
      result['channel' + '_' + item['publisher'] + '_' + item['value']] =  item;
    });
    return JSON.parse(JSON.stringify(result));
  }

  getHistorySettingList(body): Observable<any> {
    const url = '/data_oper/oper_log';
    return this._httpClient.post(url,body);
  }

  syncCreative(body): Observable<any> {
    const url = '/data_view/creative/sync';
    return this._httpClient.post(url, body);
  }

  editOcpc360(body, edit_type): any {
    const url = '/data_view/sem/ocpc/ocpc_360?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }

}
