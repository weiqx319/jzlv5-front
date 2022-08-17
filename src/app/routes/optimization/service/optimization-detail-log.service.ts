import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";
import {Observable} from "rxjs";

@Injectable()
export class OptimizationDetailLogService {

  constructor(private _httpClient: HttpClientService) { }

  //http://v5api.jiuzhilan.com/v5/optimization/detail_ranking/1/promotion_log

  getRankingLog(optimizationId, params): Observable<any> {
    const url = '/optimization/detail_ranking/' + optimizationId + '/promotion_log';
    return this._httpClient.get(url, params);
  }

  getRankingLogFileId(optimizationId, params): Observable<any> {
    const url = '/optimization/detail_ranking/' + optimizationId + '/optimization_log_down';
    return this._httpClient.post(url, params);
  }


  checkRankingHtml(body): any {
    const url = '/publisher_base/check_ranking_htm';
    return this._httpClient.post(url, body);
  }




}
