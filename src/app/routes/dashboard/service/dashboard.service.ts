
import {throwError as observableThrowError, Observable, Subject, BehaviorSubject, ReplaySubject} from 'rxjs';

import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";

@Injectable()
export class DashboardService {
  private subject = new Subject<any>();
  private currentDashboard$ = new ReplaySubject<any>();
  private dashBoardList = [];
  private dashBoardList$ = new Subject<any[]>();

  constructor(private _httpClient: HttpClientService) {

  }

  getItem(): Observable<any> {
    return this.subject.asObservable();
  }

  observableItem(item) {
    this.subject.next(item);
  }

  getCurrentDashBoard(): Observable<any> {
    return this.currentDashboard$;
  }

  setCurrentDashBoard(data) {
    this.currentDashboard$.next(data);
  }

  getDashBoardList(): Observable<any> {
    return this.dashBoardList$;
  }

  setDashBoardList(data) {
    this.dashBoardList = data;
    this.dashBoardList$.next(data);
  }

  addDashboard(data) {
    this.dashBoardList.push(data);
    this.dashBoardList$.next(this.dashBoardList);
  }




  list(): Observable<any[]> {
    return this._httpClient.get("/dashboard").pipe(map((response) => {
        return response.data.map(item => {
          return item;
        });
    }));
  }

  getDashBoard(dashboard_id): Observable<any>  {
    const url =  '/dashboard/chart/' + dashboard_id + '/list';
    return this._httpClient.get(url).pipe(map((response) => {
      return response.data;
    }));
  }


  getChart(dashboard_id, chart_id): Observable<any> {
    // const url = '/chart/' + chart_id;
    // const url = '/dashboard/chart/' + chart_id;
    const  url = '/dashboard/chart/data';
    // const url = 'http://rap2api.taobao.org/app/mock/2017/GET/chartdetail';
    return this._httpClient.post(url, { 'data_source': 'id', 'dashboard_id': dashboard_id, 'chart_id': chart_id});
  }

  deleteChart(body): Observable<any> {
    const  url = '/dashboard/chart';
    return this._httpClient.delete(url, body);
  }


  changCharOrder(body, params?: any): Observable<any> {
    const  url = '/dashboard/chart/order/';
    return this._httpClient.post(url, body, params);

  }


  update(body): Observable<any> {
    const url = `/dashboard`;
    return this._httpClient.put(url, body);
  }

  create(body): Observable<any> {
    const url = '/dashboard';
    return this._httpClient.post(url, body);
  }

  copyDashboard(body): Observable<any> {
    const url = '/dashboard/copy';
    return this._httpClient.post(url, body);
  }
  copyDashboardTpl(body): Observable<any> {
    const url = '/dashboard/copy_default';
    return this._httpClient.post(url, body);
  }

  deleteDashBoard(body): Observable<any> {
    const url = `/dashboard`;
    return this._httpClient.delete(url, body);
  }

  createChart(body): Observable<any> {
    const url = '/dashboard/chart';
    return this._httpClient.post(url, body);
  }

  updateChart(body): Observable<any> {
    const url = `/dashboard/chart`;
    return this._httpClient.put(url, body);
  }

  getChartById(params): Observable<any> {
    const url = '/dashboard/chart/' + params.chart_id;
    return this._httpClient.get(url);
  }

  getConversionLists(params): Observable<any> {
    const url = '/setting/conversion?list_type=' + params.list_type;
    return this._httpClient.get(url);
  }

  getMetricLists(params): Observable<any> {
    const url = '/setting/metric?list_type=' + params.list_type;
    return this._httpClient.get(url);
  }

  private handleError(error: Response | any) {
    let errorMessage: string;
    errorMessage = error.message ? error.message : error.toString();
    return observableThrowError(errorMessage);
  }

  getAccountInfo(code) {
    const url = '/oauth/check_oauth_code?oauth_code=' + code;
    return this._httpClient.get(url);
  }

  authorizationBinding(body) {
    const url = '/manager_base/publish_account/oauth';
    return this._httpClient.post(url, body);
  }
}
