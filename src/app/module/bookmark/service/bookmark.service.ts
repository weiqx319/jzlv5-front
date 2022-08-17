import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";
import {Observable} from "rxjs";

import {HttpParams} from "@angular/common/http";

@Injectable()
export class BookmarkService {

  constructor(private _httpClient: HttpClientService) { }

// --- bookmark
  getBookMarkList(params): Observable<any>  {
    const url = '/data_view/bookmark';
    return this._httpClient.get(url, params);
  }


  updateBookMark(body): Observable<any> {
    const url = `/data_view/bookmark`;
    return this._httpClient.put(url, body);
  }



  getBookMark(bookMarkId): Observable<any>  {
    const url =  '/data_view/bookmark/' + bookMarkId;
    return this._httpClient.get(url);
  }

  createBookMark(body): Observable<any> {
    const url = `/data_view/bookmark`;
    return this._httpClient.post(url, body);
  }

  deleteBookMark(body): Observable<any> {
    const url = `/data_view/bookmark`;
    return this._httpClient.delete(url, body);
  }

}
