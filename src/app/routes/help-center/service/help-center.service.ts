import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {HttpClientService} from "../../../core/service/http.client";

@Injectable()
export class HelpCenterService {
  private articleName = [];
  private articleName$ = new Subject<any[]>();

  private catName = [];
  private catName$ = new Subject<any[]>();

  private catId = [];
  private catId$ = new Subject<any[]>();

  private catListId = [];
  private catListId$ = new Subject<any[]>();
  // private catId$ = new BehaviorSubject(null);

  constructor(private _httpClient: HttpClientService) { }

  getCatId(): Observable<any> {
    return this.catId$.asObservable();
  }

  setCatId(data) {
    this.catId = data;
    this.catId$.next(data);
  }

  getArticleName(): Observable<any> {
    return this.articleName$;
  }

  setArticleName(data) {
    this.articleName = data;
    this.articleName$.next(data);
  }

  getListId(): Observable<any> {
    return this.catListId$;
  }

  setListId(data) {
    this.catListId = data;
    this.catListId$.next(data);
  }

  getCatList(): any {
    const url = '/help/cat_list';
    return this._httpClient.get(url);
  }

  getArticleList(id, params): any {
    const url = '/help/post_list/' + id;
    return this._httpClient.get(url, params);
  }

  getArticleDetail(id): any {
    const url = '/help/post/' + id;
    return this._httpClient.get(url);
  }
  addFeedback(body): any {
    const url = '/help/feedback';
    return this._httpClient.post(url, body);
  }



}
