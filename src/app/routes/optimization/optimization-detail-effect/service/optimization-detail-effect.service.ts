import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClientService} from "../../../../core/service/http.client";

@Injectable()
export class OptimizationDetailEffectService {

  constructor(private _httpClient: HttpClientService) { }

  delDetails(optimizationId, body): Observable<any> {
    const  url  = '/optimization/detail_effect/' + optimizationId + '/del_details';
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

  getOptimizationGroup(optimizationId): Observable<any> {
    const url = '/optimization/group/' + optimizationId;
    return this._httpClient.get(url);
  }


}
