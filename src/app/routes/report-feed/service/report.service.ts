import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClientService} from "../../../core/service/http.client";

@Injectable()
export class ReportService {

  public channel_id = 2;
  constructor(private _httpClient: HttpClientService) {

  }


  getReportList(params): any {
    const url = '/custom_report';
    return this._httpClient.get(url,  params);
  }

  getReportTplList(params): any {
    const url = '/custom_template_report';
    return this._httpClient.get(url,  params);
  }


  getReportDetail(reportId): Observable<any> {
    const url = '/custom_report/' + reportId + '/';
    return this._httpClient.get(url);
  }

  getReportTplDetail(reportId): Observable<any> {
    const url = '/custom_template_report/' + reportId + '/';
    return this._httpClient.get(url);
  }

  getReportJobInfoByReportId(reportId, params?): Observable<any> {
    const url = '/custom_report/' + reportId + '/job';
    return this._httpClient.get(url, params);
  }

  getReportDownloadCacheKey(reportId, jobId): Observable<any> {
    const url = '/custom_report/' + reportId + '/down/' + jobId + '/';
    return this._httpClient.get(url);
  }




  createReport(body): Observable<any> {
      const url = '/custom_report';
      return this._httpClient.post(url, body);
  }

  updateReport(body): Observable<any> {
      const url = `/custom_report?channel_id=` + this.channel_id;
      return this._httpClient.put(url, body);
  }


  updateReportStatus(body): Observable<any> {
    const url = `/custom_report?channel_id=` + this.channel_id;
    return this._httpClient.patch(url, body);
  }




  delReport(body): Observable<any> {
    const  url  = `/custom_report?channel_id=` + this.channel_id;
    return this._httpClient.delete(url, body);
  }



  getReportViewData(body, params) {
    const url = '/data_view/table_master';
    return this._httpClient.post(url, body, params);
  }

  getBizUnitList() {
    const url = '/define_list/biz_unit';
    return this._httpClient.get(url);
  }












}
