import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";
import {Observable} from "rxjs";

import {HttpParams} from "@angular/common/http";

@Injectable()
export class DataViewFolderFeedService {

  constructor(private _httpClient: HttpClientService) { }

  getFolderList(params=null) {
    const url = '/folder';
    return this._httpClient.get(url , params);
  }
  addDetail(body): any {
    const url = `/folder/add_detail`;
    return this._httpClient.post(url, body);
  }



}
