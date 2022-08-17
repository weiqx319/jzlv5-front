
import {throwError as observableThrowError,  Observable} from 'rxjs';

import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';

import {HttpClientService} from "../../../core/service/http.client";

@Injectable()
export class ItemSelectService {

  constructor(private _httpClient: HttpClientService) {

  }

  getCampaignLists(body, params?: any): Observable<any> {
    const url = '/publisher_base/campaign_list';
    return this._httpClient.post(url, body, { 'select_name': params.select_name, 'is_accurate': params.is_accurate}).pipe(map((response) => {
      return response.data.map(item => {
        return item;
      });
    }))
      ;
  }

  getAccountLists(body, params?: any): Observable<any> {
    const url = '/publisher_base/account_list';
    return this._httpClient.post(url, body, { 'select_name': params.select_name, 'is_accurate': params.is_accurate}).pipe(map((response) => {
      return response.data.map(item => {
        return item;
      });
    }))
      ;
  }

  getAdgroupListByCampaign(params): Observable<any> {
    const url = '/publisher_base/adgroup_list_by_campaign?chan_pub_id=' + params.chan_pub_id + '&pub_account_id=' + params.pub_account_id + '&pub_campaign_id=' + params.pub_campaign_id;
    return this._httpClient.get(url).pipe(map((response) => {
      return response.data.map(item => {
        return item;
      });
    }))
      ;
  }
  getCampaignListByAccount(params): Observable<any> {
    const url = '/publisher_base/campaign_list_by_account?chan_pub_id=' + params.chan_pub_id + '&pub_account_id=' + params.pub_account_id;
    return this._httpClient.get(url).pipe(map((response) => {
      return response.data.map(item => {
        return item;
      });
    }));
  }

  getAdgroupLists(body, params?: any): Observable<any> {
    const url = '/publisher_base/adgroup_list';
    return this._httpClient.post(url, body, { 'select_name': params.select_name, 'is_accurate': params.is_accurate}).pipe(map((response) => {
      return response.data.map(item => {
        return item;
      });
    }))
      ;
  }

  private handleError(error: Response | any) {
    let errorMessage: string;
    errorMessage = error.message ? error.message : error.toString();
    return observableThrowError(errorMessage);
  }
}
