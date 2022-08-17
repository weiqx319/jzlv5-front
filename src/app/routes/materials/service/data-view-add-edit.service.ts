import { Injectable } from '@angular/core';
import { HttpClientService } from '../../../core/service/http.client';
import { Observable } from 'rxjs';

@Injectable()
export class DataViewAddEditService {

  public publisherOption = {
    1: '百度',
    6: '广点通',
    7: '今日头条'
  };
  constructor(private _httpClient: HttpClientService) {}


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

  showAdgroupTarget(body): any {
    const url = '/data_view/adgroup/show_baidu_target';
    return this._httpClient.post(url, body);
  }

  showAdgroupTargetGdt(body): any {
    const url = '/data_view/feed/tencent/show_adgroup_target';
    return this._httpClient.post(url, body);
  }

  showAdgroupTargetByteDance(body): any {
    const url = '/data_view/feed/bytedance/show_adgroup_audience';
    return this._httpClient.post(url, body);
  }

  showGdtTargetById(body): any {
    const url = '/data_view/feed/tencent/show_target';
    return this._httpClient.post(url, body);
  }


  showBytedanceTargetById(body): any {
    const url = '/data_view/feed/bytedance/show_audience';
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
    const url = '/data_view/setting/dimension';
    return this._httpClient.post(url, body);
  }
  updateDimension(body, editType) {
    const url = '/data_view/keyword/dimension?update_type=' + editType;
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
    const url =
      '/monitor/simple_list?result_model=all&publisher_id=' +
      publisher_id +
      '&monitor_module=' +
      summaryType;
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
      if (str.charCodeAt(i) > 255) {
        //如果是汉字，则字符串长度加2
        strlen += 2;
      } else {
        strlen++;
      }
    }
    return strlen;
  }
}
