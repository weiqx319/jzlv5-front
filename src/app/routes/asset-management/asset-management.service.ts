import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClientService } from "../../core/service/http.client";
import { MenuService } from '../../core/service/menu.service';
import {NzMessageService} from "ng-zorro-antd/message";
import {NotifyService} from "../../module/notify/notify.service";

@Injectable({
  providedIn: 'root'
})
export class AssetManagementService {

  constructor(
    private _httpClient: HttpClientService,
    private originHttpClient: HttpClient,
    private menuService: MenuService,
  ) { }
  private can_jump = [];
  private can_jump$ = new Subject<any[]>();

  // 数据类型选项
  public dataSourceTypeList = {
    publisher_7: [
      { label: 'imei', value: 'imei' },
      { label: 'idfa', value: 'idfa' },
      { label: 'imei_md5', value: 'imei_md5' },
      { label: 'idfa_md5', value: 'idfa_md5' },
      { label: 'mobile_hash_sha256', value: 'mobile_hash_sha256' },
      { label: 'oaid', value: 'oaid' },
      { label: 'oaid_md5', value: 'oaid_md5' },
    ],
    publisher_6: [
      { label: 'imei', value: 'imei' },
      { label: 'idfa', value: 'idfa' },
      { label: 'imei_md5', value: 'imei_md5' },
      { label: 'idfa_md5', value: 'idfa_md5' },
      { label: 'mobile_hash_sha256', value: 'mobile_hash_sha256' },
      { label: 'oaid', value: 'oaid' },
      { label: 'oaid_md5', value: 'oaid_md5' },
      { label: 'mac', value: 'mac' },
      { label: 'qq', value: 'qq' },
      { label: 'qq_md5', value: 'qq_md5' },
      { label: 'wx_openid', value: 'wx_openid' },
      { label: 'wx_unionid', value: 'wx_unionid' },
    ],
  };
  getCanJump(): Observable<any> {
    return this.can_jump$;
  }

  setCanJump(data) {
    this.can_jump = data;
    this.can_jump$.next(data);
  }

  // 获取媒体人群包列表
  getCustomAudienceList(body, params?): any {
    let url = "/asset_manage/bytedance/audience/list";
    if (this.menuService.currentPublisherId === 7) {
      url = "/asset_manage/bytedance/audience/list";
    } else if (this.menuService.currentPublisherId === 6) {
      url = "/asset_manage/tencent/audience/list";
    }
    return this._httpClient.post(url, body, params);
  }
  // 获取头条人群分组
  getCustomAudienceTagList(params?): any {
    const url = "/asset_manage/bytedance/audience/tags";
    return this._httpClient.get(url, params);
  }

  // 获取上传人群包列表
  getUploadAudienceList(body, params?): any {
    let url = "/asset_manage/bytedance/audience/custom_list";
    if (this.menuService.currentPublisherId === 7) {
      url = "/asset_manage/bytedance/audience/custom_list";
    } else if (this.menuService.currentPublisherId === 6) {
      url = "/asset_manage/tencent/audience/custom_list";
    }
    return this._httpClient.post(url, body, params);
  }

  // 上传人群包
  uploadCustomAudience(data) {
    let url = environment.SERVER_API_URL + "/asset_manage/bytedance/audience";
    if (this.menuService.currentPublisherId === 7) {
      url = environment.SERVER_API_URL + "/asset_manage/bytedance/audience";
    } else if (this.menuService.currentPublisherId === 6) {
      url = environment.SERVER_API_URL + "/asset_manage/tencent/audience";
    }
    const req = new HttpRequest('POST', url, data, {
      reportProgress: true,
      withCredentials: true
    });

    return this.originHttpClient.request(req);
  }

  // 推送账户
  audiencePushAccount(body, params?): any {
    let url = "/asset_manage/bytedance/audience/push";
    if (this.menuService.currentPublisherId === 7) {
      url = "/asset_manage/bytedance/audience/push";
    } else if (this.menuService.currentPublisherId === 6) {
      url = "/asset_manage/tencent/audience/push";
    }
    return this._httpClient.post(url, body, params);
  }
  // 推送账户记录
  audiencePushAccountLog(params?): any {
    let url = "/asset_manage/bytedance/audience/push/list";
    if (this.menuService.currentPublisherId === 7) {
      url = "/asset_manage/bytedance/audience/push/list";
    } else if (this.menuService.currentPublisherId === 6) {
      url = "/asset_manage/tencent/audience/push/list";
    }
    return this._httpClient.get(url, params);
  }

  // 获取账户
  getAccountList(body, params?): any {
    const url = "/manager_base/publish_account_new/get_list";
    return this._httpClient.post(url, body, params);
  }
  // 解析笔记ID-小红书
  explainNote(body, params?): any {
    const url = "/asset_manage/xhs/explain_tool/explain_note";
    return this._httpClient.post(url, body, params);
  }
  // 新建落地页-baidu
  createUrlByBd(body, params?) {
    const url = "/launch_rpa/baidu/custom_landing_page";
    return this._httpClient.post(url, body, params);
  }

  // 修改落地页-baidu
  updateUrlByBd(id, body, params?) {
    const url = "/launch_rpa/baidu/custom_landing_page/" + id;
    return this._httpClient.put(url, body, params);
  }

  // 获取落地页列表-baidu
  getUrlListByBd(body, params?) {
    const url = "/launch_rpa/baidu/custom_landing_page/get_list";
    return this._httpClient.post(url, body, params);
  }

  // 落地页详情-baidu
  getLaunchUrlDetailByBd(id, params?) {
    const url = "/launch_rpa/baidu/custom_landing_page/" + id;
    return this._httpClient.get(url, params);
  }

  // 删除落地页-baidu
  deleteLaunchUrlListByBd(body, params?) {
    const url = "/launch_rpa/baidu/custom_landing_page";
    return this._httpClient.delete(url, body, params);
  }
  //基木鱼落地页-baidu
  getPromotionUrls(body, params?) {
    const url = "/launch_rpa/baidu/get_promotion_urls";
    return this._httpClient.post(url, body,params);
  }
  // 调起URL列表-baidu
  getNaUrlList(body, params?) {
    const url = "/launch_rpa/baidu/app_na_url/get_list";
    return this._httpClient.post(url, body, params);
  }
  // 新建调起URL-baidu
  createNaUrl(body, params?) {
    const url = "/launch_rpa/baidu/app_na_url";
    return this._httpClient.post(url, body, params);
  }

  // 修改调起URL-baidu
  updateNaUrl(id, body, params?) {
    const url = "/launch_rpa/baidu/app_na_url/" + id;
    return this._httpClient.put(url, body, params);
  }
  // 调起URL详情-baidu
  getNaUrlDetail(id, params?) {
    const url = "/launch_rpa/baidu/app_na_url/" + id;
    return this._httpClient.get(url, params);
  }

  // 删除调起URL-baidu
  deleteNaUrlList(body, params?) {
    const url = "/launch_rpa/baidu/app_na_url";
    return this._httpClient.delete(url, body, params);
  }

  // 应用列表-android
  getDownloadAppListAndroid(body, params?) {
    const url = "/launch_rpa/baidu/download_android_app/get_list";
    return this._httpClient.post(url, body, params);
  }
  // 新建应用-android
  createDownloadAppAndroid(body, params?) {
    const url = "/launch_rpa/baidu/download_android_app";
    return this._httpClient.post(url, body, params);
  }

  // 修改应用-android
  updateDownloadAppAndroid(id, body, params?) {
    const url = "/launch_rpa/baidu/download_android_app/" + id;
    return this._httpClient.put(url, body, params);
  }
  // 应用详情-android
  getDownloadAppDetailAndroid(id, params?) {
    const url = "/launch_rpa/baidu/download_android_app/" + id;
    return this._httpClient.get(url, params);
  }

  // 删除应用-android
  deleteDownloadAppListAndroid(body, params?) {
    const url = "/launch_rpa/baidu/download_android_app";
    return this._httpClient.delete(url, body, params);
  }
  // 应用列表-ios
  getDownloadAppListIos(body, params?) {
    const url = "/launch_rpa/baidu/download_ios_app/get_list";
    return this._httpClient.post(url, body, params);
  }
  // 新建应用-Ios
  createDownloadAppIos(body, params?) {
    const url = "/launch_rpa/baidu/download_ios_app";
    return this._httpClient.post(url, body, params);
  }

  // 修改应用-Ios
  updateDownloadAppIos(id, body, params?) {
    const url = "/launch_rpa/baidu/download_ios_app/" + id;
    return this._httpClient.put(url, body, params);
  }
  // 应用详情-Ios
  getDownloadAppDetailIos(id, params?) {
    const url = "/launch_rpa/baidu/download_ios_app/" + id;
    return this._httpClient.get(url, params);
  }

  // 删除应用-android
  deleteDownloadAppListIos(body, params?) {
    const url = "/launch_rpa/baidu/download_ios_app";
    return this._httpClient.delete(url, body, params);
  }
  // app信息
  getAppList(body, params?) {
    const url = "/launch_rpa/baidu/get_app_list";
    return this._httpClient.post(url, body, params);
  }

}
