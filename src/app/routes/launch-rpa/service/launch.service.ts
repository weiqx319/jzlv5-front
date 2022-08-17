import { Injectable } from '@angular/core';
import { HttpClientService } from '../../../core/service/http.client';
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpRequest} from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class LaunchService {

  public publisherList = {
    7: '头条',
    1: '百度信息流'
  };

  public targetAudienceData = {}; // 定向人群包
  public structConfigByteDaceData = {};

  public downloadLinkList = {}; // 下载链接

  constructor(
    private _httpClient: HttpClientService,
    private originHttpClient: HttpClient,
  ) {}

  getPublisherList() {
    return JSON.parse(JSON.stringify(this.publisherList));
  }

  getAccountList(body, params?): any {
    const url = "/manager_base/publish_account_new/get_list";
    return this._httpClient.post(url, body, params);
  }

  // 媒体下可用单元数量
  getAccountEnabledCount(body, params?): any {
    const url = "/manager_base/launch_setting/get_adgroup_by_now";
    return this._httpClient.post(url, body, params);
  }

  // 新建投放
  createLaunch(body, params?): any {
    const url = "/data_view/feed/bytedance/launch";
    return this._httpClient.post(url, body, params);
  }

  // 定向模板
  getLaunchAudienceTemplateList(body, params?): any {
    const url = "/manager_base/launch_audience_template/get_list";
    return this._httpClient.post(url, body, params);
  }

  getLaunchAudienceTemplateDetail(templateId, params?): any {
    const url = "/manager_base/launch_audience_template/" + templateId;
    return this._httpClient.get(url, params);
  }

  addLaunchAudienceTemplate(body, params?): any {
    const url = "/manager_base/launch_audience_template";
    return this._httpClient.post(url, body, params);
  }

  updateLaunchAudienceTemplate(body, templateId, params?): any {
    const url = "/manager_base/launch_audience_template/" + templateId;
    return this._httpClient.put(url, body, params);
  }

  deleteLaunchAudienceTemplate(body, params?): any {
    const url = "/manager_base/launch_audience_template/delete";
    return this._httpClient.post(url, body, params);
  }

  // 投放模板
  getLaunchTemplateList(body, params?): any {
    const url = "/manager_base/launch_template/get_list";
    return this._httpClient.post(url, body, params);
  }

  getLaunchTemplateDetail(templateId, params?): any {
    const url = "/manager_base/launch_template/" + templateId;
    return this._httpClient.get(url, params);
  }

  addLaunchTemplate(body, params?): any {
    const url = "/manager_base/launch_template";
    return this._httpClient.post(url, body, params);
  }

  updateLaunchTemplate(body, templateId, params?): any {
    const url = "/manager_base/launch_template/" + templateId;
    return this._httpClient.put(url, body, params);
  }

  deleteLaunchTemplate(body, params?): any {
    const url = "/manager_base/launch_template/delete";
    return this._httpClient.post(url, body, params);
  }

  // 下载链接
  getAppTypeUrlList(body, params?): any {
    const url = "/manager_base/launch_app_url/get_list";
    return this._httpClient.post(url, body, params);
  }

  addAppTypeUrl(body, params?): any {
    const url = "/manager_base/launch_app_url";
    return this._httpClient.post(url, body, params);
  }

  updateAppTypeUrl(body, app_url_id, params?): any {
    const url = "/manager_base/launch_app_url/" + app_url_id;
    return this._httpClient.put(url, body, params);
  }

  deleteAppTypeUrl(body, params?): any {
    const url = "/manager_base/launch_app_url/delete";
    return this._httpClient.post(url, body, params);
  }

  // 获取商品目录
  getCatalogueList(params?): any {
    const url = "/manager_base/launch_setting_baidu/get_catalogue_list";
    return this._httpClient.get(url, params);
  }

  addCatalogueList(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/catalogue_list/add";
    return this._httpClient.post(url, body, params);
  }

  updateCatalogueList(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/catalogue_list/update";
    return this._httpClient.post(url, body, params);
  }


  deleteCatalogueList(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/catalogue_list/delete";
    return this._httpClient.delete(url, body, params);
  }


  // 百度信息流
  getBdFeedStructConfigByteDance(params?): Observable<any> {
    const url = "/define_list/feed_struct_config_baidu";

    if (Object.keys(this.structConfigByteDaceData).length) {
      return of({...this.structConfigByteDaceData});
    } else {
      return this._httpClient.get(url, params).pipe(
        map((response) => {
          if (response.status_code && response.status_code === 200) {
            this.structConfigByteDaceData = {...response['data']};
            return response['data'];
          } else {
            return response;
          }
        })
      );
    }
  }

  // 新建投放
  baiduCreateLaunch(body, params?): any {
    const url = "/data_view/feed/baidu/launch";
    return this._httpClient.post(url, body, params);
  }


  // 媒体下可建计划数
  getBaiduAccountEnabledCountOfCampaign(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/get_campaign_count_by_account";
    return this._httpClient.post(url, body, params);
  }

  // 新建卡片模板
  createCardTemplate(body, params?): any {
    const url = "/manager_base/launch_promo_card_template";
    return this._httpClient.post(url, body, params);
  }

  // 获取模板账户
  getTemplateUser(params?): any {
    const url = "/manager_base/launch_promo_card_template/get_setting";
    return this._httpClient.get(url, params);
  }

  // 编辑卡片模板
  getCardTemplateInfo(id,params?): any {
    const url = "/manager_base/launch_promo_card_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 修改卡片模板
  updateCardTemplate(id,body, params?): any {
    const url = "/manager_base/launch_promo_card_template/" + id;
    return this._httpClient.put(url, body, params);
  }

  // 删除卡片模板
  deleteCardTemplate(body, params?): any {
    const url = "/manager_base/launch_promo_card_template/delete";
    return this._httpClient.post(url, body, params);
  }

  // 获取卡片模板列表
  getCardTemplate(body, params?): any {
    const url = "/manager_base/launch_promo_card_template/get_list";
    return this._httpClient.post(url, body, params);
  }

  // 获取UC计划、创意配置值
  getFeedStructConfigByUc(params?):Observable<any> {
    const url = "/define_list/feed_struct_config_uc";
    return this._httpClient.get(url, params);
  }

  // 获取uc定向配置值
  getFeedTargetConfigByUc(params?):Observable<any> {
    const url = "/define_list/feed_target_config_uc";
    return this._httpClient.get(url, params);
  }

  // 获取uc定向人群包
  getByteDanceTargetAudience(params?):Observable<any> {
    const url = '/define_list/feed_config_custom_bytedance';


    if(this.targetAudienceData[params.chan_pub_id] !== undefined) {
      return of({
        status_code: 200,
        data: {...this.targetAudienceData[params.chan_pub_id]}
      });
    } else {
      return this._httpClient.get(url,params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];
            if (this.targetAudienceData[params.chan_pub_id] === undefined) {
              this.targetAudienceData[params.chan_pub_id] = {};
            }

            this.targetAudienceData[params.chan_pub_id] = {...data};
            return {
              status_code: 200,
              data: {...this.targetAudienceData[params.chan_pub_id]}
            };
          } else {
            return response;
          }
        })
      );
    }

  }

  getUcTargetAudience(params?):Observable<any> {
    const url = '/define_list/feed_audience_config_uc';


    if(this.targetAudienceData[params.chan_pub_id] !== undefined) {
      return of({
        status_code: 200,
        data: {...this.targetAudienceData[params.chan_pub_id]}
      });
    } else {
      return this._httpClient.get(url,params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];
            if (this.targetAudienceData[params.chan_pub_id] === undefined) {
              this.targetAudienceData[params.chan_pub_id] = {};
            }

            this.targetAudienceData[params.chan_pub_id] = {...data};
            return {
              status_code: 200,
              data: {...this.targetAudienceData[params.chan_pub_id]}
            };
          } else {
            return response;
          }
        })
      );
    }

  }

  // 下载链接
  getUcAppTypeUrlList(params?): any {
    const url = "/manager_base/launch_app_url/get_list";
    if(Object.keys(this.downloadLinkList).length) {
      return of({...this.downloadLinkList});
    } else {
      return this._httpClient.post(url, {}, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];
            this.downloadLinkList = {};
            data.forEach( url => {
              if (this.downloadLinkList[url.app_url_type] === undefined) {
                this.downloadLinkList[url.app_url_type] = [];
              }

              this.downloadLinkList[url.app_url_type].push(url);
            });
            return {...this.downloadLinkList};
          } else {
            return response;
          }
        })
      );
    }
  }

  getUcAudienceConfig(params?) {
    const url = "/define_list/feed_audience_config_uc";
    return this._httpClient.get(url, params);
  }

  // 获取uc推广组列表
  getCampaignList(body,params?) {
    const url = "/manager_base/launch_setting/get_campaign_by_account_id";
    return this._httpClient.post(url, body, params);
  }

  getAdgroupListNum(body,params) {
    const url = "/launch_setting/get_adgroup_by_campaign_id";
    return this._httpClient.post(url, body, params);

  }

  // 新建投放
  createUcLaunch(body, params?): any {
    const url = "/data_view/feed/uc/launch";
    return this._httpClient.post(url, body, params);
  }

  // 媒体定向
  getLaunchMediaAudienceList(body, params?): any {
    const url = "/define_list/feed_target_package_uc";
    return this._httpClient.post(url, body, params);
  }

  // 账户白名单
  getFeedWhiteAccount(params?) {
    const url = "/define_list/feed_white_config_uc";
    return this._httpClient.get(url, params);
  }

  // 头条媒体定向模板
  getMediaAudienceList(params?): any {
    const url = "/define_list/feed_config_target_bytedance";
    return this._httpClient.get(url, params);
  }

  // 头条媒体落地页
  getMediaTargetList(params?): any {
    const url = "/define_list/feed_config_site_bytedance";
    return this._httpClient.get(url, params);
  }

}

