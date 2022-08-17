import { Injectable } from '@angular/core';
import { HttpClientService } from "../../../core/service/http.client";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { HttpClient, HttpRequest } from "@angular/common/http";

@Injectable()
export class BatchUploadService {

  constructor(private _httpClient: HttpClientService, private originHttpClient: HttpClient) { }

  addSingleKeyword(body): any {
    const url = '/data_view/keyword';
    return this._httpClient.post(url, body);
  }


  importFile(summaryType, channelId, publisherId, data, uploadType?): Observable<any> {
    let url = environment.SERVER_API_URL + '/data_view/' + summaryType + '/import_file';
    if (channelId == 2 && publisherId == 6 && summaryType !== 'account') {
      url = environment.SERVER_API_URL + '/data_view/feed/tencent/launch_excel';
    }
    if (channelId == 2 && publisherId == 6 && summaryType === 'account') {
      url = environment.SERVER_API_URL + '/data_view/feed/tencent/account/import_file';
    }
    if (channelId == 2 && publisherId == 17) {
      url = environment.SERVER_API_URL + '/launch_rpa/uc/import_file/' + summaryType;
    }

    if (channelId == 2 && publisherId == 24) {
      if (uploadType === 'xhs_all') {
        url = environment.SERVER_API_URL + `/data_view/feed/xhs/${summaryType}/import_file_contain_parent_level`;
      } else {
        url = environment.SERVER_API_URL + `/data_view/feed/xhs/${summaryType}/import_file`;
      }
    }

    const req = new HttpRequest('POST', url, data, {
      reportProgress: true,
      withCredentials: true
    });
    return this.originHttpClient.request(req);

  }

  importDetail(summaryType, body, channelId?, publisherId?, uploadType?): any {
    let url = '/data_view/' + summaryType + '/import_table';
    if (channelId == 2 && publisherId == 6 && summaryType === 'account') {
      url = '/data_view/feed/tencent/account/import_table';
    } else if (channelId == 2 && publisherId === 24) {
      if (uploadType === 'xhs_all') {
        url = `/data_view/feed/xhs/${summaryType}/import_table_contain_parent_level`;
      } else {
        url = `/data_view/feed/xhs/${summaryType}/import_table`;
      }
    }
    return this._httpClient.post(url, body);
  }

  importDelDetail(summaryType, body): any {
    const url = '/data_view/' + summaryType + '/import_delete_table';
    return this._httpClient.post(url, body);
  }

  importDelFile(summaryType, data): Observable<any> {
    const url = environment.SERVER_API_URL + '/data_view/' + summaryType + '/import_delete_file';
    const req = new HttpRequest('POST', url, data, {
      reportProgress: true,
      withCredentials: true
    });
    return this.originHttpClient.request(req);

  }

}
