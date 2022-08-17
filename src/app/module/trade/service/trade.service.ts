import { Injectable } from '@angular/core';
import { HttpClientService } from '../../../core/service/http.client';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TradeService {


  public ruleTypeItems = [
    { name: '文字包含', key: 'txt_contain' },
    { name: '文本提取', key: 'txt_partial' },
    { name: 'URL包含', key: 'url' }
  ];



  constructor(
    private _httpClient: HttpClientService,
    private originHttpClient: HttpClient
  ) {}


  // --- advertiser oper
  getAdvertiserList(body, params?): any {
    const url = '/manager_base/jazdl/get_list';
    return this._httpClient.post(url, body, params);
  }



  // -- advertiser account oper
  getAccountList(body, params?): any {
    const url = '/manager_base/publish_account/get_list';
    return this._httpClient.post(url, body, params);
  }

  getAccountInfo(chanPubId, params?): any {
    const url = '/manager_base/publish_account/' + chanPubId;
    return this._httpClient.get(url, params);
  }




  addTradeMark(body) {
    const url = '/setting/biz_unit_type';
    return this._httpClient.post(url, body);
  }
  checkName(parm) {
    const url = '/setting/biz_unit_type/name';
    return this._httpClient.get(url, parm);
  }

  getTradeList(parm) {
    const url = '/setting/biz_unit_type/list';
    return this._httpClient.get(url, parm);
  }
  updateTradeName(body, parm) {
    const url = '/setting/biz_unit_type';
    return this._httpClient.put(url, body, parm);
  }

  getTradeNameList(parm) {
    const url = '/setting/biz_unit/list_page';
    return this._httpClient.get(url, parm);
  }
  copyTrade(body, parm) {
    const url = '/setting/copy_biz_unit';
    return this._httpClient.post(url, body, parm);
  }

  updateTradeContentName(body, parm) {
    const url = '/setting/biz_unit';
    return this._httpClient.put(url, body, parm);
  }
  addTradeContentName(body, parm) {
    const url = '/setting/biz_unit';
    return this._httpClient.post(url, body, parm);
  }
  checkTradeContentName(parm) {
    const url = '/setting/biz_unit/name';
    return this._httpClient.get(url, parm);
  }
  deleteTradeContent(parm, cid) {
    const url = '/setting/biz_unit?cid=' + cid;
    return this._httpClient.delete(url, parm);
  }

  getTradeDetailById(id, parm) {
    const url = '/setting/biz_unit_type/' + id;
    return this._httpClient.get(url, parm);
  }

  getTradeContentListFilter(parm) {
    const url = '/setting/biz_unit/list_filter';
    return this._httpClient.get(url, parm);
  }

  getTradeContentDetaiList(parm) {
    const url = '/setting/biz_unit_detail/list_page';
    return this._httpClient.get(url, parm);
  }

  addTradeRule(body, parm) {
    const url = '/setting/biz_unit_detail';
    return this._httpClient.post(url, body, parm);
  }
  updateTradeRule(body, parm) {
    const url = '/setting/biz_unit_detail';
    return this._httpClient.put(url, body, parm);
  }
  getRuleInfoById(id, parm) {
    const url = '/setting/biz_unit_detail/' + id;
    return this._httpClient.get(url, parm);
  }

  editOrder(body, cid) {
    const url = '/setting/biz_unit_detail?cid=' + cid;
    return this._httpClient.patch(url, body);
  }
  deleteRule(body, cid) {
    const url = '/setting/biz_unit_detail?cid=' + cid;
    return this._httpClient.delete(url, body);
  }

  getRuleTypeObject() {
    const result = {};
    JSON.parse(JSON.stringify(this.ruleTypeItems)).forEach(item => {
      result[item['key']] = item;
    });
    return result;
  }
  getRuleTypeItems() {
    return JSON.parse(JSON.stringify(this.ruleTypeItems));
  }




}
