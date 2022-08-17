import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";
import {Observable, Subject, BehaviorSubject} from "rxjs";
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpRequest} from "@angular/common/http";

@Injectable()
export class FolderService {



  public folderLevelName = {
    'account':'帐户',
    'campaign':'计划',
    'adgroup':'单元',
    'keyword':'关键词',
    'creative':'创意',
  };

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


  private can_jump = [];
  private can_jump$ = new Subject<any[]>();




  createFolder(body): Observable<any> {
    const url = '/folder';
    return this._httpClient.post(url, body);
  }

  delFolder(body): Observable<any> {
    const  url  = '/folder';
    return this._httpClient.delete(url, body);
  }

  editFolderName(body) {
    const url = '/folder/update_folder_name';
    return this._httpClient.put(url, body);
  }


  getFolderInfo(folderId): Observable<any> {
    const url = '/folder/' + folderId;
    return this._httpClient.get(url);
  }



  importDetailFiles(data, folder_id): Observable<any> {
    const url = environment.SERVER_API_URL + '/folder/' + folder_id + '/import_detail_file';
    const req = new HttpRequest('POST', url, data, {
      reportProgress : true,
      withCredentials: true
    });

    return this.originHttpClient.request(req);

  }

  importDetailData(body, folder_id): any {
    const url = '/folder/' + folder_id + '/import_detail_data';
    return this._httpClient.post(url, body);
  }

  getUploadList(params, id): any {
    const url = '/folder/' + id + '/import_log';
    return this._httpClient.post(url, [], params);
  }

  downLoadJob(optimizationId, jobid): any {
    const url = '/folder/' + optimizationId + '/download_job/' + jobid;
    return this._httpClient.get(url);
  }



















  // --


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

  setFolderFresh(data) {
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
    const url = '/data_view/table_master';
    return this._httpClient.post(url, body, params);
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
    const  url  = '/folder/' + id;
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


  public getFolderName(levelType:string) {
    if(this.folderLevelName.hasOwnProperty(levelType)) {
      return this.folderLevelName[levelType];
    } else {
      return '未知';
    }
  }



}
