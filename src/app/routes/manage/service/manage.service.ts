import { MenuService } from 'src/app/core/service/menu.service';
import { Injectable } from '@angular/core';
import { HttpClientService } from '../../../core/service/http.client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  HttpClient,
  HttpRequest
} from '../../../../../node_modules/@angular/common/http';
import { map } from 'rxjs/operators';
import { FormGroup } from "@angular/forms";

@Injectable()
export class ManageService {
  public productTypes = [];
  public channelItems = [

  ];

  public publishItems = [
    { publisher_name: '百度', publisher_id: 1 },
    { publisher_name: '搜狗', publisher_id: 2 },
    { publisher_name: '360', publisher_id: 3 },
    { publisher_name: '神马', publisher_id: 4 },
    { publisher_name: '广点通', publisher_id: 6 },
    { publisher_name: '头条', publisher_id: 7 },
    { publisher_name: '微信公众平台', publisher_id: 9 },
    { publisher_name: 'google', publisher_id: 10 },
    { publisher_name: 'facebook', publisher_id: 11 },
  ];

  public ruleTypeItems = [
    { name: '文字包含', key: 'txt_contain' },
    { name: '文本提取', key: 'txt_partial' },
    { name: 'URL包含', key: 'url' }
  ];

  //数据来源
  public conversionSourceTypeItems = [
    { key: 1, name: '标准格式excel上传' },
    { key: 2, name: '第三方聊天工具' },
    { key: 3, name: '标准JS跟踪码' },
    { key: 4, name: '标准接口api' },
    { key: 5, name: '标准接口excel上传' }
  ];

  //推送方式
  public conversionImTypeItems = [
    { key: 1, name: '53KF接口', disable: false },
    { key: 3, name: '53KF excel上传', disable: false },
    { key: 4, name: '商务通接口', disable: false },
    { key: 2, name: '商务通excel上传', disable: false },
    { key: 5, name: '易聊通接口', disable: false },
    { key: 12, name: '快商通接口', disable: false },
    { key: 6, name: '快商通excel上传', disable: false },
    { key: 14, name: '美洽接口', disable: false },
    { key: 16, name: '美洽-企业CRM', disable: false },
    { key: 17, name: '通用接口-企业CRM', disable: false },

    { key: 7, name: '百度商桥excel上传', disable: false },
    { key: 8, name: '易聊通excel上传', disable: false },
    { key: 18, name: '小能接口', disable: false },
    { key: 9, name: '小能excel上传', disable: false },
    { key: 10, name: 'live800 excel上传', disable: false },
    { key: 11, name: '离线宝上传', disable: false },
    { key: 13, name: '表单格式', disable: false },
    { key: 15, name: '快商通-企业CRM', disable: false },
    { key: 21, name: '螳螂接口', disable: false },
    { key: 22, name: '容联七陌', disable: false },
    { key: 23, name: 'cep容联七陌聊天接口', disable: false },

  ];

  //转化数据格式（上传）
  public conversionTypeItems = [
    { key: '88', name: '标准格式', disable: false },
    { key: '99', name: '标准接口excel上传', disable: false },
    { key: '2', name: '商务通格式', disable: false },
    { key: '3', name: '53kf格式', disable: false },
    { key: '6', name: '快商通格式', disable: false },
    { key: '7', name: '百度商桥格式', disable: false },
    { key: '8', name: '易聊通格式', disable: false },
    { key: '9', name: '小能格式', disable: false },
    { key: '10', name: 'live800格式', disable: false },
    { key: '11', name: '离线宝格式', disable: false },
    { key: '13', name: '表单格式', disable: false },
    { key: '15', name: '快商通-企业CRM', disable: false },
    { key: '16', name: '美洽-企业CRM', disable: false }
  ];

  constructor(
    private _httpClient: HttpClientService,
    private originHttpClient: HttpClient,
    private menuService: MenuService,
  ) {
    this.productTypes = JSON.parse(JSON.stringify(this.menuService.productTypes));
    this.channelItems.length = 0;
    this.productTypes.forEach(element => {
      this.channelItems.push({ label: element.name, value: element.channel_id });
    });
  }

  private can_jump = [];
  private can_jump$ = new Subject<any[]>();

  getCanJump(): Observable<any> {
    return this.can_jump$;
  }

  setCanJump(data) {
    this.can_jump = data;
    this.can_jump$.next(data);
  }

  // -- advertiser account oper
  getUserList(body, params?): any {
    const url = '/manager_base/user/get_list';
    return this._httpClient.post(url, body, params);
  }
  getStructureDiagram(): any {
    const url = '/manager_base/user/relation_map';
    return this._httpClient.get(url);
  }

  getUserInfo(userId, params?): any {
    const url = '/manager_base/user/' + userId;
    return this._httpClient.get(url, params);
  }

  createUser(body): any {
    const url = '/manager_base/user';
    return this._httpClient.post(url, body);
  }

  updateUser(userId, body): Observable<any> {
    const url = '/manager_base/user/' + userId;
    return this._httpClient.put(url, body);
  }

  alterPassword(body) {
    const url = '/manager_base/user/alter_password';
    return this._httpClient.put(url, body);
  }

  updateStatus(body) {
    const url = '/manager_base/user/status';
    return this._httpClient.put(url, body);
  }

  dispatchUserToOptimizerManager(body) {
    const url = '/manager_base/user/set_user_manager';
    return this._httpClient.post(url, body);
  }

  delUser(body): Observable<any> {
    const url = `/manager_base/user/delete_user`;
    return this._httpClient.delete(url, body);
  }
  switchAccountAd(body): Observable<any> {
    const url = `/manager_base/publish_account/switch_account_ad`;
    return this._httpClient.post(url, body);
  }

  // --- advertiser oper
  getAdvertiserList(body, params?): any {
    const url = '/manager_base/jazdl/get_list';
    return this._httpClient.post(url, body, params);
  }

  getAdvertiser(cid, params?): any {
    const url = '/manager_base/jazdl/' + cid;
    return this._httpClient.get(url, params);
  }

  createAdvertiser(body): any {
    const url = '/manager_base/jazdl';
    return this._httpClient.post(url, body);
  }

  updateAdvertiser(cid, body): Observable<any> {
    const url = '/manager_base/jazdl/' + cid;
    return this._httpClient.put(url, body);
  }

  delAdvertiser(body): Observable<any> {
    const url = `/manager_base/jazdl`;
    return this._httpClient.delete(url, body);
  }

  stopAdvertiser(body): Observable<any> {
    const url = `/manager_base/jazdl`;
    return this._httpClient.delete(url, body);
  }

  // -- advertiser account oper
  getAccountList(body, params?): any {
    const url = '/manager_base/publish_account/get_list';
    return this._httpClient.post(url, body, params);
  }

  getAccountInfo(chanPubId, params?): any {
    const url = '/manager_base/publish_account/' + chanPubId;
    return this._httpClient.get(url, params);
  }

  syncAccounts(body): any {
    const url = '/manager_base/publish_account/sync';
    return this._httpClient.post(url, body);
  }


  updateDiscount(body: { type: any, value: any, detail: any[] }) {
    const url = '/manager_base/publish_account/discount';
    return this._httpClient.put(url, body);
  }
  //批量导入现金返现
  updateDiscountNew(body: { chan_pub_ids: any[], detail: any[] }) {
    const url = '/manager_base/discount/rate';
    return this._httpClient.post(url, body);
  }

  setDiscountNew(body: { chan_pub_id: any, detail: any[] }) {
    const url = '/manager_base/discount/rate/edit';
    return this._httpClient.post(url, body);
  }
  //批量导入现金返现
  updateCommission(body: { chan_pub_ids: any[], detail: any[] }) {
    const url = '/manager_base/commission/rate';
    return this._httpClient.post(url, body);
  }

  setCommission(body: { chan_pub_id: any, detail: any[] }) {
    const url = '/manager_base/commission/rate/edit';
    return this._httpClient.post(url, body);
  }
  //赔付导入
  // uploadCompensate(data): Observable<any> {
  //   const url = `${environment.SERVER_API_URL}/manager_base/discount/indemnity`;
  //   const req = new HttpRequest('POST', url, data, {
  //     reportProgress: true,
  //     withCredentials: true
  //   });
  //   return this.originHttpClient.request(req);
  // }
  uploadCompensate(body): any {
    const url = '/manager_base/discount/indemnity';
    return this._httpClient.post(url, body);
  }

  createAccount(body): any {
    const url = '/manager_base/publish_account';
    return this._httpClient.post(url, body);
  }


  updateAccount(chanPubId, body): Observable<any> {
    const url = '/manager_base/publish_account/' + chanPubId;
    return this._httpClient.put(url, body);
  }

  delAccount(body): Observable<any> {
    const url = `/manager_base/publish_account`;
    return this._httpClient.delete(url, body);
  }

  getCodeImage(publisher_id) {
    const url =
      '/manager_base/publish_account/get_code_image?publisher_id=' +
      publisher_id;
    return this._httpClient.get(url);
  }

  updateAccountPassword(chanPubId, body): Observable<any> {
    const url = '/manager_base/publish_account/password/' + chanPubId;
    return this._httpClient.put(url, body);
  }

  setAutoUrlcode(chan_pub_id, on, params) {
    const url =
      '/manager_base/publish_account/set_auto_urlcode/' +
      chan_pub_id +
      '?on=' +
      on;
    return this._httpClient.get(url, params);
  }

  addUrlCode(body, params) {
    const url = '/manager_base/publish_account/add_urlcode';
    return this._httpClient.post(url, body, params);
  }

  removeUrlCode(body) {
    const url = '/manager_base/publish_account/rm_urlcode';
    return this._httpClient.post(url, body);
  }

  updateUserPassword(body, userId) {
    const url = '/manager_base/user/set_password/' + userId;
    return this._httpClient.put(url, body);
  }

  importRankingDetail(data): Observable<any> {
    const url =
      environment.SERVER_API_URL + '/setting/setting_resource/import_detail';
    const req = new HttpRequest('POST', url, data, {
      reportProgress: true,
      withCredentials: true
    });

    return this.originHttpClient.request(req);
  }
  importDetail(body): any {
    const url = '/setting/setting_resource/import_detail_data';
    return this._httpClient.post(url, body);
  }

  publishVirtualAccount(body) {
    const url = '/manager_base/publish_virtual_account';
    return this._httpClient.post(url, body);
  }
  virtualAccountList(body, params?) {
    const url = '/manager_base/publish_virtual_account/get_list';
    return this._httpClient.post(url, body, params);
  }
  //赔付金额列表
  compensateAccountList(body, params?) {
    const url = '/manager_base/discount/indemnity/list';
    return this._httpClient.post(url, body, params);
  }
  compensateLog(body) {
    const url = '/manager_base/discount/indemnity/upload_record_list';
    return this._httpClient.get(url, body);
  }
  //查看现金返点修改记录
  checkDiscountLog(chanPubId) {
    const url = '/manager_base/discount/log';
    return this._httpClient.get(url, chanPubId);
  }
  //查看现金返点修改记录
  checkCommissionLog(chanPubId) {
    const url = '/manager_base/commission/log';
    return this._httpClient.get(url, chanPubId);
  }
  //查看账户授权修改记录
  checkDiscountAuthorizeLog(body, params) {
    const url = '/manager_base/publish_account_new/get_operation_log';
    return this._httpClient.post(url, body, params);
  }
  downLoadJob(jobid): any {
    const url = '/manager_base/discount/indemnity/download_record/' + jobid;
    return this._httpClient.get(url);
  }
  setDiscount(chanPubId) {
    const url = '/manager_base/discount/show/' + chanPubId;
    return this._httpClient.get(url);
  }
  setCommissionRate(chanPubId) {
    const url = '/manager_base/commission/show/' + chanPubId;
    return this._httpClient.get(url);
  }
  // 编辑广告出价限制
  updateAdBidMax(body) {
    const url = '/manager_base/publish_account/ad_max_bid';
    return this._httpClient.put(url, body);
  }
  // 编辑数据归属渠道
  updateAttributionChannel(body) {
    const url = '/manager_base/publish_account/batch_update_attribution_channel';
    return this._httpClient.post(url, body);
  }
  // 编辑数据归属媒体
  updateAttributionPublisher(body) {
    const url = '/manager_base/publish_account/batch_update_attribution_publisher';
    return this._httpClient.post(url, body);
  }
  getVirtualAccountInfo(chanPubId, params?) {
    const url = '/manager_base/publish_virtual_account/' + chanPubId;
    return this._httpClient.get(url, params);
  }

  deleteVirtualAccount(body) {
    const url = `/manager_base/publish_virtual_account`;
    return this._httpClient.delete(url, body);
  }
  getOtherGeneratorList(params?) {
    const url = `/setting/setting_resource/list`;
    return this._httpClient.get(url, params);
  }
  getDownloadCacheKey(cid) {
    const url = `/setting/setting_resource/list_down?cid=` + cid;
    return this._httpClient.get(url);
  }

  getAccountChannelObject() {
    const result = {};
    this.channelItems.forEach(item => {
      result['channel' + '_' + item['value']] = item;
    });
    return JSON.parse(JSON.stringify(result));
  }

  getPublisherObject() {
    const result = {};
    this.publishItems.forEach(item => {
      result['publisher' + '_' + item.publisher_id] = item;
    });
    return JSON.parse(JSON.stringify(result));
  }
  createHasAccount(body): any {
    const url = '/manager_base/publish_account_new';
    return this._httpClient.post(url, body);
  }
  createAccountUseKeeper(body): any {
    const url = '/manager_base/super_account/add_publisher_account';
    return this._httpClient.post(url, body);
  }
  createGoogleAuthUrl(body): any {
    const url = '/manager_base/publish_account_google';
    return this._httpClient.post(url, body);
  }
  checkGoogleOauthState(state): any {
    const url = `/manager_base/publish_account/check_auth_google_status/${state}`;
    return this._httpClient.get(url);
  }
  createGoogleAccount(body): Observable<any> {
    const url = '/manager_base/publish_account/bind_google_account_new';
    return this._httpClient.post(url, body);
  }
  getGoogleAccountData(body): any {
    const url = `/manager_base/publish_account/get_google_account_list`;
    return this._httpClient.post(url, body);
  }


  createFacebookAccount(body): Observable<any> {
    const url = '/manager_base/publish_account/bind_facebook_account';
    return this._httpClient.post(url, body);
  }

  getGoogleAccountByCode(body): Observable<any> {
    const url = '/manager_base/publish_account/check_google_account';
    return this._httpClient.post(url, body);
  }


  updateHasAccount(account_id, body): Observable<any> {
    const url = '/manager_base/publish_account_new/' + account_id;
    return this._httpClient.put(url, body);
  }
  createGdtHasAccount(body): any {
    const url = '/manager_base/publish_account_new_eqq';
    return this._httpClient.post(url, body);
  }


  createFacebookAuthUrl(body): any {
    const url = '/manager_base/publish_account_facebook';
    return this._httpClient.post(url, body);
  }
  createWeiboAuthUrl(body): any {
    const url = '/manager_base/publish_account_weibo';
    return this._httpClient.post(url, body);
  }
  checkWeiboOauthState(state): any {
    const url = `/manager_base/publish_account/check_auth_weibo_status/${state}`;
    return this._httpClient.get(url);
  }
  getWeiboAccountData(body): any {
    const url = `/manager_base/publish_account/get_weibo_account_list`;
    return this._httpClient.post(url, body);
  }
  createWeiboAccountOauth(body): any {
    const url = `/manager_base/publish_account/bind_weibo_account`;
    return this._httpClient.post(url, body);
  }
  createQianchuanAuthUrl(body): any {
    const url = '/manager_base/publish_account_qianchuan';
    return this._httpClient.post(url, body);
  }
  checkQianchuanOauthState(state): any {
    const url = `/manager_base/publish_account/check_auth_qianchuan_status/${state}`;
    return this._httpClient.get(url);
  }
  getQianchuanAccountData(body): any {
    const url = `/manager_base/publish_account/get_qianchuan_account_list`;
    return this._httpClient.post(url, body);
  }
  createQianchuanAccountOauth(body): any {
    const url = `/manager_base/publish_account/bind_qianchuan_account`;
    return this._httpClient.post(url, body);
  }
  getJinniuAccountData(body): any {
    const url = `/manager_base/publish_account/get_jinniu_account_list`;
    return this._httpClient.post(url, body);
  }
  createJinniuAccountOauth(body): any {
    const url = `/manager_base/publish_account/bind_jinniu_account`;
    return this._httpClient.post(url, body);
  }


  createBytedanceAuthUrl(body): any {
    const url = '/manager_base/publish_account_bytedance';
    return this._httpClient.post(url, body);
  }
  checkBytedanceOauthState(state): any {
    const url = `/manager_base/publish_account/check_auth_bytedance_status/${state}`;
    return this._httpClient.get(url);
  }

  getBytedanceAccountData(body): any {
    const url = `/manager_base/publish_account/get_bytedance_account_list`;
    return this._httpClient.post(url, body);
  }
  createBytedanceAccountOauth(body): any {
    const url = `/manager_base/publish_account/bind_bytedance_account`;
    return this._httpClient.post(url, body);
  }


  createVivoAuthUrl(body): any {
    const url = '/manager_base/publish_account_vivo';
    return this._httpClient.post(url, body);
  }

  checkVivoOauthState(state): any {
    const url = `/manager_base/publish_account/check_oauth_vivo_status/${state}`;
    return this._httpClient.get(url);
  }

  createKuaishouAuthUrl(body): any {
    const url = '/manager_base/publish_account_kuaishou';
    return this._httpClient.post(url, body);
  }

  checkKuaishouOauthState(state): any {
    const url = `/manager_base/publish_account/check_auth_kuaishou_status/${state}`;
    return this._httpClient.get(url);
  }

  createZhihuAuthUrl(body): any {
    const url = '/manager_base/publish_account_zhihu';
    return this._httpClient.post(url, body);
  }

  createZhihuAccount(body): Observable<any> {
    const url = '/manager_base/publish_account/bind_zhihu_account';
    return this._httpClient.post(url, body);
  }

  updateGdtHasAccount(account_id, body): any {
    const url = '/manager_base/publish_account/eqq_password/' + account_id;
    return this._httpClient.put(url, body);
  }
  getHasAccountList(body, params?): any {
    const url = '/manager_base/publish_account_new/get_list';
    return this._httpClient.post(url, body, params);
  }
  downloadAccount(body, params?): any {
    const url = '/manager_base/publish_account_new/get_list/download';
    return this._httpClient.post(url, body, params);
  }
  getHasAccountInfo(id): any {
    const url = '/manager_base/publish_account_new/' + id;
    return this._httpClient.get(url);
  }

  getAccountKeeperList(body, params?): any {
    const url = '/manager_base/super_account/get_list';
    return this._httpClient.post(url, body, params);
  }

  getAccountKeeperListById(keeperId, body, params?): any {
    const url = '/manager_base/super_account/get_child_account_list/' + keeperId;
    return this._httpClient.post(url, body, params);
  }

  createKeepAccount(body): any {
    const url = '/manager_base/super_account';
    return this._httpClient.post(url, body);
  }

  getAccountKeeperInfo(keeperId, params?): any {
    const url = '/manager_base/super_account/' + keeperId;
    return this._httpClient.get(url, params);
  }
  updateAccountKeeper(keeperId, body): Observable<any> {
    const url = '/manager_base/super_account/' + keeperId;
    return this._httpClient.put(url, body);
  }

  addAccountKeeperDetail(body): Observable<any> {
    const url = '/manager_base/super_account/batch_upload_child_account';
    return this._httpClient.post(url, body);
  }

  bindAccountKeeperChild(body): Observable<any> {
    const url = '/manager_base/super_account/bind_child_account';
    return this._httpClient.post(url, body);
  }

  delAcountKeeperChild(body): Observable<any> {
    const url = '/manager_base/super_account/child_account';
    return this._httpClient.delete(url, body);
  }
  unbindAccountKeeperChild(body): Observable<any> {
    const url = '/manager_base/super_account/unbind_child_account';
    return this._httpClient.post(url, body);
  }

  grantAccountKeeperChild(body): Observable<any> {
    const url = '/manager_base/super_account/grant_child_account';
    return this._httpClient.post(url, body);
  }





  getChannelList(cid): any {
    const url = '/manager_base/publish_account_new/get_cid_struct?cid=' + cid;
    return this._httpClient.get(url);
  }
  getAccountlList(parm): any {
    const url = '/manager_base/publish_account_new/get_cid_struct_account';
    return this._httpClient.get(url, parm);
  }

  addTradeMark(body) {
    const url = '/setting/biz_unit_type';
    return this._httpClient.post(url, body);
  }
  checkName(parm) {
    const url = '/setting/biz_unit_type/name';
    return this._httpClient.get(url, parm);
  }

  getTradeList(parm) {
    const url = '/setting/biz_unit_type/list';
    return this._httpClient.get(url, parm);
  }
  updateTradeName(body, parm) {
    const url = '/setting/biz_unit_type';
    return this._httpClient.put(url, body, parm);
  }

  getTradeNameList(parm) {
    const url = '/setting/biz_unit/list_page';
    return this._httpClient.get(url, parm);
  }

  updateTradeContentName(body, parm) {
    const url = '/setting/biz_unit';
    return this._httpClient.put(url, body, parm);
  }
  addTradeContentName(body, parm) {
    const url = '/setting/biz_unit';
    return this._httpClient.post(url, body, parm);
  }
  checkTradeContentName(parm) {
    const url = '/setting/biz_unit/name';
    return this._httpClient.get(url, parm);
  }
  deleteTradeContent(parm, cid) {
    const url = '/setting/biz_unit?cid=' + cid;
    return this._httpClient.delete(url, parm);
  }

  getTradeDetailById(id, parm) {
    const url = '/setting/biz_unit_type/' + id;
    return this._httpClient.get(url, parm);
  }

  getTradeContentListFilter(parm) {
    const url = '/setting/biz_unit/list_filter';
    return this._httpClient.get(url, parm);
  }

  getTradeContentDetaiList(parm) {
    const url = '/setting/biz_unit_detail/list_page';
    return this._httpClient.get(url, parm);
  }

  addTradeRule(body, parm) {
    const url = '/setting/biz_unit_detail';
    return this._httpClient.post(url, body, parm);
  }
  updateTradeRule(body, parm) {
    const url = '/setting/biz_unit_detail';
    return this._httpClient.put(url, body, parm);
  }
  getRuleInfoById(id, parm) {
    const url = '/setting/biz_unit_detail/' + id;
    return this._httpClient.get(url, parm);
  }

  editOrder(body, cid) {
    const url = '/setting/biz_unit_detail?cid=' + cid;
    return this._httpClient.patch(url, body);
  }
  deleteRule(body, cid) {
    const url = '/setting/biz_unit_detail?cid=' + cid;
    return this._httpClient.delete(url, body);
  }

  getRuleTypeObject() {
    const result = {};
    JSON.parse(JSON.stringify(this.ruleTypeItems)).forEach(item => {
      result[item['key']] = item;
    });
    return result;
  }
  getRuleTypeItems() {
    return JSON.parse(JSON.stringify(this.ruleTypeItems));
  }
  getHasCompanyId(companyId) {
    const url = '/setting/biz_company_role/' + companyId;
    return this._httpClient.get(url);
  }
  downloadUsersList(body, params): any {
    const url = `/manager_base/user/download`;
    return this._httpClient.post(url, body, params);
  }
  getConversionSourceTypeItems() {
    return JSON.parse(JSON.stringify(this.conversionSourceTypeItems));
  }
  getConversionSourceTypeObj() {
    const result = {};
    this.conversionSourceTypeItems.forEach(item => {
      result['sourceType_' + item['key']] = item['name'];
    });

    return result;
  }
  getConversionImTypeItems() {
    return JSON.parse(JSON.stringify(this.conversionImTypeItems));
  }
  getConversionImTypeObj() {
    const result = {};
    this.conversionImTypeItems.forEach(item => {
      result['imType_' + item['key']] = item['name'];
    });
    return result;
  }
  getConversionTypeItems() {
    return JSON.parse(JSON.stringify(this.conversionTypeItems));
  }
  getConversionTypeObj() {
    const result = {};
    this.conversionTypeItems.forEach(item => {
      result['conType_' + item['key']] = item['name'];
    });
    return result;
  }

  getConversionRecordList(body, params): any {
    const url = '/setting/conversion_record_list/list';
    return this._httpClient.post(url, body, params);
  }
  getConversionSourceDict(params?): any {
    const url = '/define_list/conversion_source_dict';
    return this._httpClient.get(url, params);
  }
  getOperationTaskList(body, params): any {
    const url = '/setting/operation_task/list';
    return this._httpClient.post(url, body, params);
  }

  getOperationTaskListCron(body, params): any {
    const url = '/setting/operation_task/list_cron';
    return this._httpClient.post(url, body, params);
  }

  stopOperationTaskCron(taskId, body, params?): any {
    const url = '/setting/operation_task/stop_cron/' + taskId;
    return this._httpClient.post(url, body, params);
  }

  updateOperationTaskCron(taskId, body, params?): any {
    const url = '/setting/operation_task/update_cron/' + taskId;
    return this._httpClient.put(url, body, params);
  }

  downloadErrorFile(taskId, body, params?): any {
    const url = '/setting/operation_task/download_error/' + taskId;
    return this._httpClient.post(url, body, params);
  }

  getOperationTaskDetail(body, params): any {
    const url = '/setting/operation_task_detail/list';
    return this._httpClient.post(url, body, params);
  }
  downloadTaskDetail(body, params): any {
    const url = `/setting/operation_task_detail/download_log`;
    return this._httpClient.post(url, body, params);
  }

  checkAccountOauthState(state): any {
    const url = `/manager_base/publish_account/check_oauth_status/${state}`;
    return this._httpClient.get(url);
  }

  checkGdtAccountStatus(stateId) {
    const url = `/manager_base/publish_account/check_auth_eqq_account_status/` + stateId;
    return this._httpClient.get(url);
  }

  getGdtAccountData(body): any {
    const url = `/manager_base/publish_account/get_eqq_account_list`;
    return this._httpClient.post(url, body);
  }

  // checkGdtAccountOauthState(body): any {
  //   const url = `/manager_base/publish_account/check_eqq_account`;
  //   return this._httpClient.post(url, body);
  // }

  createGdtAccountOauth(body): any {
    const url = `/manager_base/publish_account/bind_eqq_account`;
    return this._httpClient.post(url, body);
  }

  checkFacebookOauthState(state): any {
    const url = `/manager_base/publish_account/check_oauth_facebook_status/${state}`;
    return this._httpClient.get(url);
  }

  rollbackTask(body, params?): any {
    const url = '/data_view/rollback';
    return this._httpClient.post(url, body, params);
  }



  //
  // stopAdvertiser(body): Observable<any> {
  //   const  url  = `/custom_report`;
  //   return this._httpClient.delete(url, body);
  // }

  // message
  getMessageList(params?): any {
    const url = "/message/list";
    return this._httpClient.get(url, params);
  }

  getMessageDetail(messageId): any {
    const url = "/message/" + messageId;
    return this._httpClient.get(url);
  }

  deleteMessage(body): any {
    const url = "/message";
    return this._httpClient.delete(url, body);
  }

  readMessage(body): any {
    const url = "/message/read";
    return this._httpClient.put(url, body);
  }

  // 否词包
  getAllWordGroupList(): any {
    const url = "/negative_word/group/all";
    return this._httpClient.get(url);
  }

  getNegationWordGroupUserList(): any {
    const url = "/negative_word/group/all_user";
    return this._httpClient.get(url);
  }

  getNegativeWordGroupList(body, params?): any {
    const url = "/negative_word/group/list";
    return this._httpClient.post(url, body, params);
  }

  createNegativeWordGroup(body): any {
    const url = '/negative_word/group/add';
    return this._httpClient.post(url, body);
  }

  updateNegativeWordGroup(body): any {
    const url = '/negative_word/group/update';
    return this._httpClient.post(url, body);
  }

  deleteNegativeWordGroup(body): any {
    const url = "/negative_word/group/delete";
    return this._httpClient.delete(url, body);
  }

  // 否词
  getNegationWordUserList(): any {
    const url = "/negative_word/group/all_user";
    return this._httpClient.get(url);
  }

  getNegativeWordList(body, params?): any {
    const url = "/negative_word/word/list";
    return this._httpClient.post(url, body, params);
  }

  getNegativeWordGroupName(params?): any {
    const url = "/negative_word/group/group_name";
    return this._httpClient.get(url, params);
  }

  createNegativeWord(body): any {
    const url = '/negative_word/word/add';
    return this._httpClient.post(url, body);
  }

  deleteNegativeWord(body): any {
    const url = "/negative_word/word/delete";
    return this._httpClient.delete(url, body);
  }

  downloadNegativeWord(body, params?): any {
    const url = '/negative_word/word/download';
    return this._httpClient.post(url, body, params);
  }

  addNegativeWord(body, params): any {
    const url = '/negative_word/word/add_negative';
    return this._httpClient.post(url, body, params);
  }

  // 黑名单词库
  getBlackWordGroupList(params?): any {
    const url = "/blacklist/group/list";
    return this._httpClient.get(url, params);
  }

  getBlackWordUserList(): any {
    const url = "/blacklist/word/all_user";
    return this._httpClient.get(url);
  }

  getBlackWordList(body, params?): any {
    const url = "/blacklist/word/list";
    return this._httpClient.post(url, body, params);
  }

  createBlackWord(body): any {
    const url = '/blacklist/word/add';
    return this._httpClient.post(url, body);
  }

  deleteBlackWord(body): any {
    const url = "/blacklist/word/delete";
    return this._httpClient.delete(url, body);
  }

  batchBalckWord(body, params): any {
    const url = '/blacklist/word/screen';
    return this._httpClient.post(url, body, params);
  }

  downloadBlackWord(body, params?): any {
    const url = '/blacklist/word/list/download';
    return this._httpClient.post(url, body, params);
  }

  getBlackWordLogList(body, params?): any {
    const url = "/blacklist/log/list";
    return this._httpClient.post(url, body, params);
  }

  // 关键词明细
  getKeywordDetailList(body, params?): any {
    const url = "/blacklist/keyword/list";
    return this._httpClient.post(url, body, params);
  }

  downloadKeywordDetailList(body, params?): any {
    const url = "/blacklist/keyword/list/download";
    return this._httpClient.post(url, body, params);
  }

  stopKeyword(body, params): any {
    const url = "/blacklist/keyword/pause";
    return this._httpClient.post(url, body, params);
  }

  deleteKeyword(body, params): any {
    const url = "/blacklist/keyword/delete";
    return this._httpClient.delete(url, body, params);
  }

  // 创意明细
  getCreativeDetailList(body, params?): any {
    const url = "/blacklist/creative/list";
    return this._httpClient.post(url, body, params);
  }
  // 创意明细
  downloadCreativeDetailList(body, params?): any {
    const url = "/blacklist/creative/list/download";
    return this._httpClient.post(url, body, params);
  }

  stopCreative(body, params): any {
    const url = "/blacklist/creative/pause";
    return this._httpClient.post(url, body, params);
  }

  deleteCreative(body, params): any {
    const url = "/blacklist/creative/delete";
    return this._httpClient.delete(url, body, params);
  }

  editCreative(body, params): any {
    const url = '/blacklist/creative/replace';
    return this._httpClient.post(url, body, params);
  }

  setUser(body, params): any {
    const url = '/manager_base/publish_account_new/set_user';
    return this._httpClient.post(url, body, params);
  }

  updateDataRole(userId, body, params?): any {
    const url = '/manager_base/user/data_role_ids/' + userId;
    return this._httpClient.put(url, body, params);
  }
  //黑词下载列表
  getBlackWordDownloadList(body, params?): any {
    const url = "/blacklist/download_list";
    return this._httpClient.post(url, body, params);
  }
  getBlackWordDownloadDetail(downloadId, params?): any {
    const url = "/blacklist/download_list/" + downloadId;
    return this._httpClient.get(url, params);
  }

}
