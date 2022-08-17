import { Injectable } from '@angular/core';
import {HttpClientService} from "../../../core/service/http.client";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpRequest} from "@angular/common/http";

@Injectable()
export class DataViewAddService {

  constructor(private _httpClient: HttpClientService,private originHttpClient: HttpClient) { }

  addSingleKeyword(body): any {
    const url = '/data_view/keyword';
    return this._httpClient.post(url, body);
  }


  importFile(summaryType,data): Observable<any> {
    let url = environment.SERVER_API_URL + '/data_view/'+summaryType+'/import_file';
    if (summaryType==='creative_fengwu_360') {
      url=environment.SERVER_API_URL + '/data_view/'+'creative_fengwu/import_file';
    }
    const req = new HttpRequest('POST', url, data, {
      reportProgress : true,
      withCredentials: true
    });
    return this.originHttpClient.request(req);

  }

  importDetail(summaryType,body): any {
    const url = '/data_view/'+summaryType+'/import_table';
    return this._httpClient.post(url, body);
  }

  importDelDetail(summaryType,body): any {
    const url = '/data_view/'+summaryType+'/import_delete_table';
    return this._httpClient.post(url, body);
  }

  importDelFile(summaryType,data): Observable<any> {
    const url = environment.SERVER_API_URL + '/data_view/'+summaryType+'/import_delete_file';
    const req = new HttpRequest('POST', url, data, {
      reportProgress : true,
      withCredentials: true
    });
    return this.originHttpClient.request(req);

  }

}
