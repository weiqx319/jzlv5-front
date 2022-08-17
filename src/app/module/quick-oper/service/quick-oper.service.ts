import { Injectable } from '@angular/core';
import {Observable} from "rxjs";

import {HttpClientService} from '../../../core/service/http.client';

@Injectable()
export class QuickOperService {

  constructor(private _httpClient: HttpClientService) { }

  delData(summaryType,publisherId,channelId,body):  Observable<any> {
    let url = "";
    if(channelId == 1 && publisherId == 0) {
      url+= '/data_view/'+summaryType;
    } else {
      url+= '/data_view/del_data';
    }
    if(publisherId == 6&& summaryType==='campaign') {
      url= '/data_view/feed/tencent/'+summaryType;
    }
    return this._httpClient.delete(url, body);
  }

  updateData(summaryType,publisherId,channelId,body,editType) {
    let url = "";
    if(channelId == 1 && publisherId == 0) {
      url+= '/data_view/'+summaryType+"?update_type="+editType;
    } else {
      url+= '/data_view/'+summaryType+"?update_type="+editType;
    }
    return this._httpClient.put(url, body);
  }
}
