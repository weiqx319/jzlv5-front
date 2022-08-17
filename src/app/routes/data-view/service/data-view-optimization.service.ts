import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";
import {Observable} from "rxjs";

import {HttpParams} from "@angular/common/http";

@Injectable()
export class DataViewOptimizationService {

  constructor(private _httpClient: HttpClientService) { }

  getOptimizationGroup(publisherId=null , params=null) {
    const url = '/optimization/group?publisher_id=' + publisherId;
    return this._httpClient.get(url , params);
  }
  updateOptimization(body): any {
    const url = `/optimization/group/add_to_ranking`;
    return this._httpClient.post(url, body);
  }

  addToEffect(body): any {
    const url = `/optimization/group/add_to_effect`;
    return this._httpClient.post(url, body);
  }

  getRankTplListBtPublisherId(id): Observable<any> {
    const url = '/define_list/rank_tpl_list?publisher_id=' + id;
    return this._httpClient.get(url);
  }

}
