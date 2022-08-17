import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClientService} from "../../../../core/service/http.client";

@Injectable()
export class OptimizationDetailRankingService {

  constructor(private _httpClient: HttpClientService) { }

  delDetails(optimizationId, body): Observable<any> {
    const  url  = '/optimization/detail_ranking/' + optimizationId + '/del_details';
    return this._httpClient.put(url, body);
  }
  startRanking(optimizationId, body): Observable<any> {
    const  url  = '/optimization/detail_ranking/' + optimizationId + '/start_ranking';
    return this._httpClient.post(url, body);
  }
  stopRanking(optimizationId, body): Observable<any> {
    const  url  = '/optimization/detail_ranking/' + optimizationId + '/stop_ranking';
    return this._httpClient.post(url, body);
  }

  getRegion(optimizationId, body): Observable<any> {
    const  url  = '/optimization/detail_ranking/' + optimizationId + '/cross_region';
    return this._httpClient.post(url, body);
  }
  updateOptimization(optimizationId, body): Observable<any> {
    const  url  = '/optimization/detail_ranking/' + optimizationId + '/update_ranking_setting';
    return this._httpClient.put(url, body);
  }
  updateRankingSetting(body): Observable<any> {
    const  url  = '/optimization/group/update_ranking_setting';
    return this._httpClient.put(url, body);
  }
  updateRankingDetailDate(body): Observable<any> {
    const  url  = '/optimization/group/update_ranking_detail_date';
    return this._httpClient.put(url, body);
  }
  // optimization/group/update_ranking_setting
  getOptimizationGroup(optimizationId): Observable<any> {
    const url = '/optimization/group/' + optimizationId;
    return this._httpClient.get(url);
  }

  addRankTpl(body): Observable<any> {
    const url = '/optimization/rank_tpl';
    return this._httpClient.post(url, body);
  }
  updateRankTpl(id, body): Observable<any> {
    const url = '/optimization/rank_tpl/' + id;
    return this._httpClient.put(url, body);
  }


}
