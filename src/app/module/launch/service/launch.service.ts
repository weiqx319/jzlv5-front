import { Injectable } from '@angular/core';
import { HttpClientService } from '../../../core/service/http.client';
import {HttpClient, HttpRequest} from "@angular/common/http";
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class LaunchService {

  public structConfigByteDaceData = {};
  public structConfigBdData = {};

  public downloadLinkList = {}; // 下载链接

  public campaignList:any = {}; // 计划列表

  public targetAudienceData = {}; // 定向人群包

  public launchAppList:any = {}; // 推广应用列表
  public catalogueList:any = []; // 商品目录列表
  public goodsGroupList:any = []; // 商品组列表

  public goodsGroupListByCatalogue = {}; // 根据商品目录获取的商品组列表
  public filterConditionByCatalogue = {}; // 根据商品目录获取的筛选条件
  public filterResult = {}; // 根据筛选条件获取筛选结果


  public mediaPackages = {}; // 媒体包
  public regionAndInterest = {}; // 地域和兴趣包
  public customCrowdList = {}; // 百度人群包
  public productWordsTemplateList = {}; // 商品通配符列表
  public intentionWordGroupList = []; // 意图词包
  public intentionWordList = {}; // 意图词列表

  constructor(
    private _httpClient: HttpClientService,
    private originHttpClient: HttpClient,
  ) {}

  // 获取计划列表
   getcampaignList(body, params?): any {
    const url = "/manager_base/launch_setting/get_campaign_by_account_id";

    if(this.campaignList[body.chan_pub_id] !== undefined) {
      return of([...this.campaignList[body.chan_pub_id]]);
    } else {
      return this._httpClient.post(url, body, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];
            if (this.campaignList[body.chan_pub_id] === undefined) {
              this.campaignList[body.chan_pub_id] = [];
            }

            this.campaignList[body.chan_pub_id] = [...data];
            return [...this.campaignList[body.chan_pub_id]];
          } else {
            return response;
          }
        })
      );
    }
  }

  // 计划下可用单元数量
  getCampaignEnabledCount(body, params?): any {
    const url = "/manager_base/launch_setting/get_adgroup_by_campaign_id";
    return this._httpClient.post(url, body, params);
  }

  // 检查应用下载链接
  checkAppUrl(body, params?): any {
    const url = "/manager_base/launch_setting/check_app_url";
    return this._httpClient.post(url, body, params);
  }

  // 获取单元、创意配置值
  getFeedStructConfigByteDance(params?):Observable<any> {
    const url = "/define_list/feed_struct_config_bytedance";

    if(Object.keys(this.structConfigByteDaceData).length) {
      return of({...this.structConfigByteDaceData});
    } else {
      return this._httpClient.get(url, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            this.structConfigByteDaceData = {...response['data']};
            return response['data'];
          } else {
            return response;
          }
        })
      );
    }
  }

  // 获取转化目标
  getConversionTargetList(params?): any {
    const url = "/manager_base/launch_setting/convert_id_online";
    return this._httpClient.post(url, params);
  }
  getConversionTargetListNew(params?): any {
    const url = "/manager_base/launch_setting/convert_id_new";
    return this._httpClient.post(url, params);
  }

  // 下载链接
  getAppTypeUrlList(params?): any {
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

  // 获取定向人群包
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

  // 百度信息流
  // 获取计划列表
  getBaiduCampaignList(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/get_campaign_list_by_account";
    return this._httpClient.post(url, body, params);

    /*if(this.campaignList[body.chan_pub_id] !== undefined) {
      return of([...this.campaignList[body.chan_pub_id]]);
    } else {
      return this._httpClient.post(url, body, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];
            if (this.campaignList[body.chan_pub_id] === undefined) {
              this.campaignList[body.chan_pub_id] = [];
            }

            this.campaignList[body.chan_pub_id] = [...data];
            return [...this.campaignList[body.chan_pub_id]];
          } else {
            return response;
          }
        })
      );
    }*/
  }

  // 获取推广应用列表
  getBaiduLaunchAppList(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/get_app_list";

    if(this.launchAppList[body.chan_pub_id] !== undefined) {
      return of([...this.launchAppList[body.chan_pub_id]]);
    } else {
      return this._httpClient.post(url, body, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];
            if (this.launchAppList[body.chan_pub_id] === undefined) {
              this.launchAppList[body.chan_pub_id] = [];
            }

            this.launchAppList[body.chan_pub_id] = [...data];
            return [...this.launchAppList[body.chan_pub_id]];
          } else {
            return response;
          }
        })
      );
    }
  }

  // 计划下可用单元数量
  getBaiduCampaignEnabledCount(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/get_adgroup_count_by_campaign";
    return this._httpClient.post(url, body, params);
  }

  // 获取商品目录
  getCatalogueList(params?): any {
    const url = "/manager_base/launch_setting_baidu/get_catalogue_list";

    if(this.catalogueList.length) {
      return of([...this.catalogueList]);
    } else {
      return this._httpClient.get(url, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];
            this.catalogueList = [...data];
            return [...this.catalogueList];
          } else {
            return response;
          }
        })
      );
    }
  }

  // 获取商品组
  getGoodsGroupList(params?): any {
    const url = "/manager_base/launch_setting_baidu/get_goods_group";

    if(this.goodsGroupList.length) {
      return of([...this.goodsGroupList]);
    } else {
      return this._httpClient.get(url, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];
            this.goodsGroupList = [...data];
            return [...this.goodsGroupList];
          } else {
            return response;
          }
        })
      );
    }
  }

  // 通过商品目录id获取商品组
  getGoodsGroupListByCatalogue(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/get_goods_group/catalogue_id";

    if(this.goodsGroupListByCatalogue[body.catalogue_id] !== undefined) {
      return of({
        status_code: 200,
        data: [...this.goodsGroupListByCatalogue[body.catalogue_id]],
      });
    } else {
      return this._httpClient.post(url, body, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];

            if (this.goodsGroupListByCatalogue[body.catalogue_id] === undefined) {
              this.goodsGroupListByCatalogue[body.catalogue_id] = [];
            }

            this.goodsGroupListByCatalogue[body.catalogue_id] = [...data];
            return {
              status_code: 200,
              data: [...this.goodsGroupListByCatalogue[body.catalogue_id]]
            };
          } else {
            return response;
          }
        })
      );
    }
  }

  // 通过商品目录id获取筛选条件
  getFilterConditionByCatalogue(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/goods_group/get_filter_condition";

    if(this.filterConditionByCatalogue[body.catalogue_id] !== undefined) {
      return of({
        status_code: 200,
        data: [...this.filterConditionByCatalogue[body.catalogue_id]],
      });
    } else {
      return this._httpClient.post(url, body, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];

            if (this.filterConditionByCatalogue[body.catalogue_id] === undefined) {
              this.filterConditionByCatalogue[body.catalogue_id] = [];
            }

            this.filterConditionByCatalogue[body.catalogue_id] = [...data];
            return {
              status_code: 200,
              data: [...this.filterConditionByCatalogue[body.catalogue_id]]
            };
          } else {
            return response;
          }
        })
      );
    }
  }

  // 通过筛选条件获取筛选结果
  getFilterResult(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/goods_group/get_filter_result";

    const flag = body.condition_setting.left_filter + '_' + body.condition_setting.condition;
    if(this.filterResult[flag] !== undefined) {
      return of({
        status_code: 200,
        data: [...this.filterResult[flag]],
      });
    } else {
      return this._httpClient.post(url, body, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];

            if (this.filterResult[flag] === undefined) {
              this.filterResult[flag] = [];
            }

            this.filterResult[flag] = [...data];
            return {
              status_code: 200,
              data: [...this.filterResult[flag]]
            };
          } else {
            return response;
          }
        })
      );
    }
  }

  // 通过筛选条件获取筛选结果
  getFilterResultSearch(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/goods_group/get_filter_result";
    return this._httpClient.post(url, body, params);
  }


  // 获取转化名称
  getConversionNameList(params?): any {
    const url = "/manager_base/launch_setting_baidu/get_conversion_name";
    return this._httpClient.post(url, params);
  }

  // 获取媒体包
  getMediaPackages(body, params?):Observable<any> {
    const url = '/manager_base/launch_setting_baidu/get_media_packages';

    if(this.mediaPackages[body.chan_pub_id] !== undefined) {
      return of({
        status_code: 200,
        data: {...this.mediaPackages[body.chan_pub_id]}
      });
    } else {
      return this._httpClient.post(url, body, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];
            this.mediaPackages[body.chan_pub_id] = {};

            data.forEach( item => {
              if (this.mediaPackages[body.chan_pub_id][item.package_type] === undefined) {
                this.mediaPackages[body.chan_pub_id][item.package_type] = [];
              }

              item.key = item.package_id;
              item.title = item.package_name;

              if (item.children === undefined) {
                item.isLeaf = true;
              }

              this.mediaPackages[body.chan_pub_id][item.package_type].push(item);
            });

            return {
              status_code: 200,
              data: {...this.mediaPackages[body.chan_pub_id]}
            };
          } else {
            return response;
          }
        })
      );
    }

  }

  // 获取地域和兴趣
  getRegionAndInterest(params?):Observable<any> {
    const url = "/define_list/feed_config_dpa_baidu";

    if(Object.keys(this.regionAndInterest).length) {
      return of({
        status_code: 200,
        data: {...this.regionAndInterest}
      });
    } else {
      return this._httpClient.get(url, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];
            this.regionAndInterest = JSON.parse(JSON.stringify(data));

            return {
              status_code: 200,
              data: {...this.regionAndInterest}
            };
          } else {
            return response;
          }
        })
      );
    }
  }

  // 获取人群包
  getCustomCrowdList(body, params?):Observable<any> {
    const url = '/manager_base/launch_setting_baidu/get_custom_crowd_list';

    // if(this.customCrowdList[body.chan_pub_id] !== undefined) {
    //   return of({
    //     status_code: 200,
    //     data: [...this.customCrowdList[body.chan_pub_id]]
    //   });
    // } else {
    return this._httpClient.post(url, body, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];
            this.customCrowdList[body.chan_pub_id] = [];

            data.forEach( item => {

              item.key = item.pub_crowd_id;
              item.title = item.pub_crowd_name;

            });

            this.customCrowdList[body.chan_pub_id] = [...data];

            return {
              status_code: 200,
              data: [...this.customCrowdList[body.chan_pub_id]]
            };
          } else {
            return response;
          }
        })
      );
    // }

  }

  getProductWordsTemplateList(body, params?):Observable<any> {
    const url = '/manager_base/launch_setting_baidu/goods_group/get_product_words_template';

    if (!body.catalogue_id) {
      return of({
        status_code: 200,
        data: []
      });
    } else if(this.productWordsTemplateList[body.chan_pub_id + '_' + body.catalogue_id] !== undefined) {
      return of({
        status_code: 200,
        data: [...this.productWordsTemplateList[body.chan_pub_id + '_' + body.catalogue_id]]
      });
    } else {
      return this._httpClient.post(url, body, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data'];
            this.productWordsTemplateList[body.chan_pub_id + '_' + body.catalogue_id] = [];

            this.productWordsTemplateList[body.chan_pub_id + '_' + body.catalogue_id] = [...data];

            return {
              status_code: 200,
              data: [...this.productWordsTemplateList[body.chan_pub_id + '_' + body.catalogue_id]]
            };
          } else {
            return response;
          }
        })
      );
    }

  }

  // 获取意图词包
  getIntentionWordGroupList(body, params?):Observable<any> {
    const url = '/manager_base/launch_setting_baidu/intention_word_group/list';

    if(this.intentionWordGroupList.length) {
      return of({
        status_code: 200,
        data: [...this.intentionWordGroupList]
      });
    } else {
      return this._httpClient.post(url, body, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data']['detail'];
            this.intentionWordGroupList = [];

            this.intentionWordGroupList = [...data];

            return {
              status_code: 200,
              data: [...this.intentionWordGroupList]
            };
          } else {
            return response;
          }
        })
      );
    }

  }

  getIntentionWordByGroupId(body, params?):Observable<any> {
    const url = '/manager_base/launch_setting_baidu/intention_word/list';

    if(this.intentionWordList[params.group_id] !== undefined) {
      return of({
        status_code: 200,
        data: [...this.intentionWordList[params.group_id]]
      });
    } else {
      return this._httpClient.post(url, body, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            const data = response['data']['detail'];
            this.intentionWordList[params.group_id] = [];

            this.intentionWordList[params.group_id] = [...data];

            return {
              status_code: 200,
              data: [...this.intentionWordList[params.group_id]]
            };
          } else {
            return response;
          }
        })
      );
    }

  }

  updateGoodsGroup(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/goods_group/update";
    return this._httpClient.post(url, body, params);
  }

  addGoodsGroup(body, params?): any {
    const url = "/manager_base/launch_setting_baidu/goods_group/add";
    return this._httpClient.post(url, body, params);
  }


  // 百度信息流
  getBdFeedStructConfig(params?):Observable<any> {
    const url = "/define_list/feed_struct_config_baidu";

    if(Object.keys(this.structConfigBdData).length) {
      return of({...this.structConfigBdData});
    } else {
      return this._httpClient.get(url, params).pipe(
        map((response)=> {
          if(response.status_code && response.status_code === 200) {
            this.structConfigBdData = {...response['data']};
            return response['data'];
          } else {
            return response;
          }
        })
      );
    }
  }

  getMediaUrlList(params?):Observable<any> {
    const url = '/define_list/feed_site_config_uc';
    return this._httpClient.get(url, params);
  }
  // 通过筛选条件获取筛选结果
  getConvertConfig(body, params?): any {
    const url = "/define_list/feed_convert_config_uc";
    return this._httpClient.post(url, body, params);
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

}
