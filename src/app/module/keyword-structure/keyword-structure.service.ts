import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

import { HttpClientService } from '../../core/service/http.client';

@Injectable()
export class KeywordStructureService {

  constructor(private _httpClient: HttpClientService) { }

  addSearchKeyWord(body): Observable<any> {
    const url = '/data_view/search_setting_keyword';
    return this._httpClient.post(url, body);
  }

  getStructureList(params): Observable<any> {
    const url = '/data_view/search_setting_keyword';
    return this._httpClient.get(url, params);
  }

  downLoadSearchRecord(searchId): Observable<any> {
    const url = '/data_view/search_setting_keyword/download/' + searchId;
    return this._httpClient.get(url);
  }
}
