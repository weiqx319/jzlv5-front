import { Injectable } from '@angular/core';
import {Observable} from "rxjs";

import {HttpClientService} from '../../core/service/http.client';

@Injectable()
export class BackupService {

  constructor(private _httpClient: HttpClientService) { }

  backupRequest(body): Observable<any> {
    const url = '/data_view/backup';
    return this._httpClient.post(url, body);
  }


  getBackupList(params): Observable<any> {
    const url = '/data_view/backup';
    return this._httpClient.get(url, params);
  }

  downLoadBackup(backupId): Observable<any> {
    const url = '/data_view/backup/download/'+backupId;
    return this._httpClient.get(url);
  }

  delBackupById(backupId): Observable<any> {
    const url = '/data_view/backup';
    const postData = {"backup_id":backupId};
    return this._httpClient.delete(url, postData);
  }





  //测试关键词下载接口
  downLoadSearchRecord(searchId): Observable<any> {
    const url = '/data_view/search_setting_keyword/download/' + searchId;
    return this._httpClient.get(url);
  }
}
