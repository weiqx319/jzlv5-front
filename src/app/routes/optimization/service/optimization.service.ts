import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";
import {Observable, Subject, BehaviorSubject} from "rxjs";
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpRequest} from "../../../../../node_modules/@angular/common/http";

@Injectable()
export class OptimizationService {
  private optimizationRefresh = [];
  private optimizationRefresh$ = new Subject<any[]>();

  private optimizationInfo = [];
  private optimizationInfo$ = new BehaviorSubject(null);

  constructor(private _httpClient: HttpClientService,  private originHttpClient: HttpClient) { }
  public publisherOption = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马'
  };
  public matchTypes = {
    1: [
      {'name': '精确', 'value': 10},
      {'name': '广泛', 'value': 30},
      {'name': '短语(精确包含)', 'value': 22},
      {'name': '短语-核心包含', 'value': 23},
      {'name': '短语(同义包含)', 'value': 21},
    ],
    2: [
      {'name': '精确', 'value': 10},
      {'name': '广泛', 'value': 30},
      {'name': '短语(精确包含)', 'value': 22},
      {'name': '短语-核心包含', 'value': 23},
      {'name': '短语(同义包含)', 'value': 21},
    ],
    3: [
      {'name': '精确', 'value': 10},
      {'name': '广泛', 'value': 30},
      {'name': '短语', 'value': 20},
      {'name': '短语(精确包含)', 'value': 22},
      {'name': '短语-核心包含', 'value': 23},
      {'name': '短语(同义包含)', 'value': 21},
      {'name': '智能短语', 'value': 24}
    ],
    4: [
      {'name': '精确', 'value': 10},
      {'name': '广泛', 'value': 30},
      {'name': '短语(精确包含)', 'value': 22},
      {'name': '短语-核心包含', 'value': 23},
      {'name': '短语(同义包含)', 'value': 21}
    ]
  };

  private can_jump = [];
  private can_jump$ = new Subject<any[]>();

  getCanJump(): Observable<any> {
    return this.can_jump$;
  }

  setCanJump(data) {
    this.can_jump = data;
    this.can_jump$.next(data);
  }
  getOptimizationRefresh(): Observable<any> {
    return this.optimizationRefresh$;
  }

  setOptimizationRefresh(data) {
    this.optimizationRefresh = data;
    this.optimizationRefresh$.next(data);
  }

  getOptimizationInfo(): Observable<any> {
    return this.optimizationInfo$;
  }

  setOptimizationInfo(data) {
    this.optimizationInfo = data;
    this.optimizationInfo$.next(data);
  }

  getViewList(body, params) {
    const url = '/data_view/table_master_optimization';
    return this._httpClient.post(url, body, params);
  }


  checkRankingHtml(body): any {
    const url = '/publisher_base/check_ranking_htm';
    return this._httpClient.post(url, body);
  }



  getRankingCode(body, params) {
    const url = '/publisher_base/ranking_code';
    return this._httpClient.post(url, body, params);
  }


  getKeywordPrice(body) {
    const url = '/publisher_base/price';
    return this._httpClient.post(url, body);
  }



  getViewChartData(body, params) {
    const url = '/data_view/chart';
    return this._httpClient.post(url, body, params);
  }



  getOptimizationGroup(optimizationId): Observable<any> {
    const url = '/optimization/group/' + optimizationId;
    return this._httpClient.get(url);
  }

  createGroup(body): Observable<any> {
    const url = '/optimization/group';
    return this._httpClient.post(url, body);
  }

  delGroup(body): Observable<any> {
    const  url  = '/optimization/group';
    return this._httpClient.delete(url, body);
  }


  updateReport(body): Observable<any> {
    const url = '/optimization/group';
    return this._httpClient.put(url, body);
  }


  updateReportStatus(body): Observable<any> {
    const url = '/optimization/group';
    return this._httpClient.patch(url, body);
  }




  delReport(body): Observable<any> {
    const  url  = '/optimization/group';
    return this._httpClient.delete(url, body);
  }

  heightSetting(id, body): Observable<any> {
    const  url  = '/optimization/group/' + id;
    return this._httpClient.put(url, body);
  }
  getTypePublisher(): Observable<any> {
    const  url  = '/optimization/group/type_publisher';
    return this._httpClient.get(url);
  }


  editKeyword(body, edit_type): any {
    const url = '/data_view/keyword?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }

  getSingleKeywordData(body): any {
    const url = '/data_view/keyword/show';
    return this._httpClient.post(url, body);
  }
  getPublisherOption() {
    return JSON.parse(JSON.stringify(this.publisherOption));
  }
  getDimensionsList() {
    const url = '/define_list/dimension';
    return this._httpClient.get(url);
  }

  //获取输入框内容字节长度
  chkstrlen(str) {
    let strlen = 0;
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) { //如果是汉字，则字符串长度加2
        strlen += 2;
      } else {
        strlen++;
      }
    }
    return   strlen;
  }


  importRankingDetail(data, optimization_id): Observable<any> {
    const url = environment.SERVER_API_URL + '/optimization/detail_ranking/' + optimization_id + '/import_ranking_detail';
    const req = new HttpRequest('POST', url, data, {
      reportProgress : true,
      withCredentials: true
    });

    return this.originHttpClient.request(req);

  }

  getUploadList(params, id): any {
    const url = '/optimization/detail_ranking/' + id + '/import_log';
    return this._httpClient.post(url, [], params);
  }
  importDetail(body, id): any {
    const url = '/optimization/detail_ranking/' + id + '/import_ranking_detail_data';
    return this._httpClient.post(url, body);
  }
  downLoadJob(optimizationId, jobid): any {
    const url = '/optimization/detail_ranking/' + optimizationId + '/download_job/' + jobid;
    return this._httpClient.get(url);
  }

  editOptimizationStatusStart(body) {
    const url = '/optimization/group/start';
    return this._httpClient.put(url, body);
  }
  editOptimizationStatusEnd(body) {
    const url = '/optimization/group/stop';
    return this._httpClient.put(url, body);
  }

  editOptimizationName(body) {
    const url = '/optimization/group/update_group_name';
    return this._httpClient.put(url, body);
  }

  getRankTplList(parm): Observable<any> {
    const url = '/optimization/rank_tpl';
    return this._httpClient.get(url, parm);
  }
  deleteRankTpl(body): Observable<any> {
    const url = '/optimization/rank_tpl';
    return this._httpClient.delete(url, body);
  }
  getRankTplListBtPublisherId(id): Observable<any> {
    const url = '/define_list/rank_tpl_list?publisher_id=' + id;
    return this._httpClient.get(url);
  }
}
