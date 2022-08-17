import { Injectable } from '@angular/core';
import { HttpClientService } from '../../../core/service/http.client';
import { Observable } from 'rxjs';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';
import { MenuService } from '../../../core/service/menu.service';

@Injectable()
export class DefineSettingService {
  private _url_prefix = '/setting';
  constructor(
    private _httpClient: HttpClientService,
    private originHttpClient: HttpClient,
    private menuService: MenuService
  ) { }

  // -- conversion oper
  getConversionList(body, params?): any {
    const url = `${this._url_prefix}/conversion/list`;
    return this._httpClient.post(url, body, params);
  }


  getConversionListByChannel(channelId, body, params?): any {
    const url = `${this._url_prefix}/conversion/list`;
    return this._httpClient.post(url, body, params);
  }

  getConversionDescList(body, params?): any {
    const url = `${this._url_prefix}/conversion_desc/list`;
    return this._httpClient.post(url, body, params);
  }

  getFilterConversionDescList(params): any {
    const url = '/define_list/conversion_desc';
    return this._httpClient.get(url, params);
  }

  getConversionUploadList(body, params?): any {
    const url = `${this._url_prefix}/conversion/upload_list`;
    return this._httpClient.post(url, body, params);
  }


  getManualUploadLogList(body, params?): any {
    const url = `${this._url_prefix}/manual/upload_list`;
    return this._httpClient.post(url, body, params);
  }




  createConversion(body): any {
    const url = `${this._url_prefix}/conversion`;
    return this._httpClient.post(url, body);
  }

  createConversionDesc(body): any {
    const url = `${this._url_prefix}/conversion_desc`;
    return this._httpClient.post(url, body);
  }

  getConversionData(conversionId, params?): any {
    const url = `${this._url_prefix}/conversion/${conversionId}`;
    return this._httpClient.get(url, params);
  }

  getConversionDesc(descId, params?): any {
    const url = `${this._url_prefix}/conversion_desc/${descId}`;
    return this._httpClient.get(url, params);
  }

  updateConversion(conversionId, body): Observable<any> {
    const url = `${this._url_prefix}/conversion/${conversionId}`;
    return this._httpClient.put(url, body);
  }

  updateConversionDesc(conversionId, body): Observable<any> {
    const url = `${this._url_prefix}/conversion_desc/${conversionId}`;
    return this._httpClient.put(url, body);
  }

  uploadConversionData(data): Observable<any> {
    const url = `${this._url_prefix}/conversion/upload`;
    return this._httpClient.request('post', url, {
      body: data,
      withCredentials: true,
      reportProgress: true
    });
  }

  uploadConversionDataNew(data): Observable<any> {
    const url = `${environment.SERVER_API_URL}${this._url_prefix}/conversion/upload`;
    const req = new HttpRequest('POST', url, data, {
      reportProgress: true,
      withCredentials: true
    });

    return this.originHttpClient.request(req);
  }


  uploadManualDataNew(data): Observable<any> {
    const url = `${environment.SERVER_API_URL}${this._url_prefix}/manual/upload`;
    const req = new HttpRequest('POST', url, data, {
      reportProgress: true,
      withCredentials: true
    });

    return this.originHttpClient.request(req);
  }



  getDownloadConversion(conversionId, params?): Observable<any> {
    const url = `${this._url_prefix}/conversion/upload/${conversionId}`;
    return this._httpClient.get(url, params);
  }


  getDownloadManual(uploadId, params?): Observable<any> {
    const url = `${this._url_prefix}/manual/result/${uploadId}`;
    return this._httpClient.get(url, params);
  }

  check53KFAppSecret(body, params?): Observable<any> {
    const url = `${this._url_prefix}/conversion/53kf`;
    return this._httpClient.post(url, body, params);
  }

  addMqApi(body, cid): Observable<any> {
    const url = `${this._url_prefix}/conversion/mq?cid=${cid}`;
    return this._httpClient.post(url, body);
  }
  getMqAppList(cid): Observable<any> {
    const url = `${this._url_prefix}/conversion/mq/list?cid=${cid}`;
    return this._httpClient.get(url);
  }
  deleteMqAppList(body, cid): Observable<any> {
    const url = `${this._url_prefix}/conversion/mq?cid=${cid}`;
    return this._httpClient.delete(url, body);
  }

  // -- dimension oper
  getDimList(body, params?): any {
    const url = this._url_prefix + '/dimension/list';
    return this._httpClient.post(url, body, params);
  }

  createDim(body): any {
    const url = this._url_prefix + '/dimension';
    return this._httpClient.post(url, body);
  }

  getDimData(dimId, params?): any {
    const url = this._url_prefix + '/dimension/' + dimId;
    return this._httpClient.get(url, params);
  }

  updateDim(dimId, body): Observable<any> {
    const url = this._url_prefix + '/dimension/' + dimId;
    return this._httpClient.put(url, body);
  }
  delDim(body): Observable<any> {
    const url = this._url_prefix + '/dimension';
    return this._httpClient.delete(url, body);
  }

  // -- 账户维度 company_account_dimension oper
  getCompanyDimList(body, params?): any {
    const url = this._url_prefix + '/company_account_dimension/list';
    return this._httpClient.post(url, body, params);
  }

  createCompanyDim(body): any {
    const url = this._url_prefix + '/company_account_dimension';
    return this._httpClient.post(url, body);
  }

  getCompanyDimData(dimId, params?): any {
    const url = this._url_prefix + '/company_account_dimension/' + dimId;
    return this._httpClient.get(url, params);
  }

  updateCompanyDim(dimId, body): Observable<any> {
    const url = this._url_prefix + '/company_account_dimension/' + dimId;
    return this._httpClient.put(url, body);
  }

  delCompanyDim(companyDimId, body?): Observable<any> {
    const url = this._url_prefix + `/company_account_dimension/${companyDimId}`;
    return this._httpClient.delete(url, body);
  }

  // -- metric oper
  getCompanyMetricList(body, params?): any {
    const url = `${this._url_prefix}/company_metric/list`;
    return this._httpClient.post(url, body, params);
  }

  createCompanyMetric(body): any {
    const url = `${this._url_prefix}/company_metric`;
    return this._httpClient.post(url, body);
  }

  getCompanyMetricData(metricId, params?): any {
    const url = `${this._url_prefix}/company_metric/${metricId}`;
    return this._httpClient.get(url, params);
  }

  updateCompanyMetric(metricId, body): Observable<any> {
    const url = `${this._url_prefix}/company_metric/${metricId}`;
    return this._httpClient.put(url, body);
  }

  delCompanyMetric(metricId, body?): Observable<any> {
    const url = `${this._url_prefix}/company_metric/${metricId}`;
    return this._httpClient.delete(url, body);
  }

  getCompanyMetricDetailListByMetricId(metricId, body, params?) {
    const url = `${this._url_prefix}/company_metric_detail/list/${metricId}`;
    return this._httpClient.post(url, body, params);
  }

  getCompanyMetricDetailDataByDetailId(metricId, defineId, params?) {
    const url = `${this._url_prefix}/company_metric_detail/${defineId}`;
    return this._httpClient.get(url, params);
  }

  createCompanyMetricDetail(body): any {
    const url = `${this._url_prefix}/company_metric_detail`;
    return this._httpClient.post(url, body);
  }

  updateCompanyMetricDetail(metricId, defineId, body): Observable<any> {
    const url = `${this._url_prefix}/company_metric_detail/${defineId}`;
    return this._httpClient.put(url, body);
  }

  delCompanyMetricDetail(metricId, defineId, body?): Observable<any> {
    const url = `${this._url_prefix}/company_metric_detail/${defineId}`;
    return this._httpClient.delete(url, body);
  }
  //修改排序值
  updateSortNum(metricId, body): Observable<any> {
    const url = `${this._url_prefix}/company_metric/${metricId}/sort`;
    return this._httpClient.patch(url, body);
  }





  // -- metric oper
  getMetricList(body, params?): any {
    const url = `${this._url_prefix}/metric/list`;
    return this._httpClient.post(url, body, params);
  }

  createMetric(body, params?): any {
    const url = `${this._url_prefix}/metric`;
    return this._httpClient.post(url, body, params);
  }

  getMetricData(metricId, params?): any {
    const url = `${this._url_prefix}/metric/${metricId}`;
    return this._httpClient.get(url, params);
  }

  updateMetric(metricId, body): Observable<any> {
    const url = `${this._url_prefix}/metric/${metricId}`;
    return this._httpClient.put(url, body);
  }

  delMetric(body): Observable<any> {
    const url = `${this._url_prefix}/metric`;
    return this._httpClient.delete(url, body);
  }

  getDownloadTemplate(cid) {
    const url = `${this._url_prefix}/conversion/down_template`;
    return this._httpClient.get(url);
  }

  get53AppList(cid) {
    const url = `${this._url_prefix}/conversion/53kf/list?cid=${cid}`;
    return this._httpClient.get(url);
  }
  getConversionUserStatus(body) {
    const url = `${this._url_prefix}/conversion/kst/user_status`;
    return this._httpClient.get(url, body);
  }

  getOauthList(cid) {
    const url = `${this._url_prefix}/conversion/kst/list?cid=${cid}`;
    return this._httpClient.get(url);
  }

  getSiteInfoList(cid) {
    const url = `${this._url_prefix}/conversion/kst/list?cid=${cid}`;
    return this._httpClient.get(url);
  }

  updateSiteInfo(body) {
    const url = `${this._url_prefix}/conversion/kst/site`;
    return this._httpClient.put(url, body);
  }

  getKSTAPiList(cid) {
    const url = `${this._url_prefix}/conversion/swt/list?cid=${cid}`;
    return this._httpClient.get(url);
  }

  addKSTApi(body, cid) {
    const url = `${this._url_prefix}/conversion/swt?cid=${cid}`;
    return this._httpClient.post(url, body);
  }

  updateKSTApi(body, cid) {
    const url = `${this._url_prefix}/conversion/swt?cid=${cid}`;
    return this._httpClient.put(url, body);
  }



  getMoorPiList(cid) {
    const url = `${this._url_prefix}/conversion/moor/list?cid=${cid}`;
    return this._httpClient.get(url);
  }

  addMoorApi(body, cid) {
    const url = `${this._url_prefix}/conversion/moor?cid=${cid}`;
    return this._httpClient.post(url, body);
  }

  updateMoorApi(body, cid) {
    const url = `${this._url_prefix}/conversion/moor?cid=${cid}`;
    return this._httpClient.put(url, body);
  }

  //cep容联七陌聊天接口
  getCepMoorPiList(cid) {
    const url = `${this._url_prefix}/conversion/new_moor/list?cid=${cid}`;
    return this._httpClient.get(url);
  }

  addCepMoorApi(body, cid) {
    const url = `${this._url_prefix}/conversion/new_moor?cid=${cid}`;
    return this._httpClient.post(url, body);
  }

  updateCepMoorApi(body, cid) {
    const url = `${this._url_prefix}/conversion/new_moor?cid=${cid}`;
    return this._httpClient.put(url, body);
  }


  getYLTAPiList(cid) {
    const url = `${this._url_prefix}/conversion/ylt/list?cid=${cid}`;
    return this._httpClient.get(url);
  }
  /*  addYLTApi (body, cid) {
    const url = this._url_prefix + '/conversion/ylt?cid=' + cid;
    return this._httpClient.post(url, body);
  }*/
  addYLTApi(data, cid): Observable<any> {
    const url = `${environment.SERVER_API_URL}${this._url_prefix}/conversion/ylt?cid=${cid}`;
    const req = new HttpRequest('post', url, data, {
      reportProgress: true,
      withCredentials: true
    });
    return this.originHttpClient.request(req);
  }
  // updateYLTApi (body, cid) {
  //   const url = this._url_prefix + '/conversion/ylt?cid=' + cid;
  //   return this._httpClient.put(url, body);
  // }
  updateYLTApi(data, cid): Observable<any> {
    const url = `${environment.SERVER_API_URL}${this._url_prefix}/conversion/ylt/update?cid=${cid}`;
    const req = new HttpRequest('post', url, data, {
      reportProgress: true,
      withCredentials: true
    });
    return this.originHttpClient.request(req);
  }
  getPublicConversionDetail(body, cid) {
    const url = `${this._url_prefix}/conversion/detail/show?cid=${cid}`;
    return this._httpClient.post(url, body);
  }
  addPublicConversionDetail(body, cid) {
    const url = `${this._url_prefix}/conversion/detail?cid=${cid}`;
    return this._httpClient.post(url, body);
  }
  updatePublicConversionDetail(body, cid) {
    const url = `${this._url_prefix}/conversion/detail?cid=${cid}`;
    return this._httpClient.put(url, body);
  }
  getAccountLists(body, params?): Observable<any> {
    const url = '/setting/account_list';
    return this._httpClient.post(url, body, params);
  }
  getCampaignListByAccount(params): Observable<any> {
    const url = '/setting/campaign_list_by_account';
    return this._httpClient.get(url, params);
  }

  updateMetricDefault(metricId, params?): any {
    const url = `${this._url_prefix}/company_metric/${metricId}/default`;
    return this._httpClient.patch(url, params);
  }

  updateConversionDefault(conversionId, params?): any {
    const url = `${this._url_prefix}/conversion/${conversionId}/default`;
    return this._httpClient.patch(url, params);
  }

  updateMetricMetricDefault(metricId, params?): any {
    const url = `${this._url_prefix}/metric/${metricId}/default`;
    return this._httpClient.patch(url, params);
  }

  // --metric_category
  getMetricCategoryList(params?): any {
    const url = `/metric_category/list`;
    return this._httpClient.get(url, params);
  }
  addMetricCategory(body): any {
    const url = `/metric_category/add`;
    return this._httpClient.post(url, body);
  }
  updateMetricCategory(body): Observable<any> {
    const url = `/metric_category/update`;
    return this._httpClient.put(url, body);
  }
  deleteMetricCategory(categoryId): Observable<any> {
    const url = `/metric_category/${categoryId}`;
    return this._httpClient.delete(url);
  }

  // 指标管理-默认渠道
  getDefaultChannelList(params?): any {
    const url = `${this._url_prefix}/channel/list`;
    return this._httpClient.get(url, params);
  }

  // 指标管理-自定义渠道
  getCustomChannelList(params?): any {
    const url = `${this._url_prefix}/custom_channel/list`;
    return this._httpClient.get(url, params);
  }
  addCustomChannel(body): any {
    const url = `${this._url_prefix}/custom_channel/add`;
    return this._httpClient.post(url, body);
  }
  updateCustomChannel(body): Observable<any> {
    const url = `${this._url_prefix}/custom_channel/edit`;
    return this._httpClient.put(url, body);
  }

  // 指标管理-默认媒体
  getDefaultPublisherList(params?): any {
    const url = `${this._url_prefix}/publisher/list`;
    return this._httpClient.get(url, params);
  }

  // 指标管理-自定义媒体
  getCustomPublisherList(params?): any {
    const url = `${this._url_prefix}/custom_publisher/list`;
    return this._httpClient.get(url, params);
  }
  addCustomPublisher(body): any {
    const url = `${this._url_prefix}/custom_publisher/add`;
    return this._httpClient.post(url, body);
  }
  updateCustomPublisher(body): Observable<any> {
    const url = `${this._url_prefix}/custom_publisher/edit`;
    return this._httpClient.put(url, body);
  }


  // 数据角色

  // 列表
  dataRoleList(body, params): Observable<any> {
    const url = '/manager_base/user_data_role/get_list';
    return this._httpClient.post(url, body, params);
  }

  // 添加
  addDataRole(body, params?): Observable<any> {
    const url = '/manager_base/user_data_role';
    return this._httpClient.post(url, body, params);
  }

  // 修改
  updateDataRole(roleId, body, params?): Observable<any> {
    const url = '/manager_base/user_data_role/' + roleId;
    return this._httpClient.put(url, body, params);
  }

  // 删除
  deleteDataRole(roleId, params?): Observable<any> {
    const url = '/manager_base/user_data_role/' + roleId;
    return this._httpClient.delete(url, params);
  }

  // 详情
  dataRoleDetail(body, params?): Observable<any> {
    const url = '/manager_base/user_data_role/get_list_ids';
    return this._httpClient.post(url, body, params);
  }

}
