import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClientService} from "../../../../core/service/http.client";

@Injectable()
export class FolderDetailService {

  constructor(private _httpClient: HttpClientService) { }

  delDetails(folderId, body): Observable<any> {
    const  url  = '/folder/' + folderId + '/del_details';
    return this._httpClient.put(url, body);
  }

  updateOptimization(folderId, body): Observable<any> {
    const  url  = '/optimization/detail_ranking/' + folderId + '/update_ranking_setting';
    return this._httpClient.put(url, body);
  }


  updateRankingDetailDate(body): Observable<any> {
    const  url  = '/optimization/group/update_ranking_detail_date';
    return this._httpClient.put(url, body);
  }
  // optimization/group/update_ranking_setting
  getOptimizationGroup(folderId): Observable<any> {
    const url = '/optimization/group/' + folderId;
    return this._httpClient.get(url);
  }



}
