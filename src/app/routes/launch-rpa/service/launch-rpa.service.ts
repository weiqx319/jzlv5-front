import { Injectable } from '@angular/core';
import { HttpClientService } from '../../../core/service/http.client';
import { environment } from "../../../../environments/environment";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NotifyService } from '../../../module/notify/notify.service';
import { format } from "date-fns";

@Injectable()
export class LaunchRpaService {

  //configStatic

  public VideoTypeConfig = {
    "publisher_7": {
      'video_type_1': '横版视频',
      'video_type_2': '竖版视频',
    },
    "publisher_16": {
      'video_type_1': '横版视频',
      'video_type_2': '竖版视频',
    },
    "publisher_17": {
      'video_type_1': '横版视频',
      'video_type_2': '竖版视频',
    },
    "publisher_1": {
      'video_type_1': '横版视频',
      'video_type_2': '竖版视频',
    },
    "publisher_22": {
      'video_type_1': '横版视频',
      'video_type_2': '竖版视频',
    },
    "publisher_23": {
      'video_type_1': '竖版视频',
      'video_type_2': '横版视频',
    },
  };

  public ImageTypeConfig = {
    "publisher_7": {
      "image_type_1": "推广卡片主图",
      "image_type_2": "横版大图",
      "image_type_3": "竖版大图",
      "image_type_4": "小图"
    },
    "publisher_17": {
      "image_type_1": "logo",
      "image_type_2": "大图",
      "image_type_3": "小图,三图",
      "image_type_4": "大图"
    },
    "publisher_16": {
      "image_type_1": "app_icon图片",
      "image_type_3": "便利贴图片",
      "image_type_4": "竖版大图",
      "image_type_5": "横版大图"
    },
    "publisher_22": {
      "image_type_2": "横版大图",
      "image_type_3": "竖版大图",
      "image_type_4": "横版小图",
      "image_type_5": "推广卡片配图",
    }
  };

  public TemplateStateConfig = {
    'status_0': '未运行',
    'status_1': '运行中',
    'status_2': '成功',
    'status_3': '失败',
    'status_4': '部分成功',
  };

  public VideoTypeConfigList = {
    "publisher_7":
      [{
        'key': '1',
        'name': '横版视频',
      }, {
        'key': '2',
        'name': '竖版视频',
      }
      ],
    "publisher_17":
      [{
        'key': '1',
        'name': '横版视频',
      }, {
        'key': '2',
        'name': '竖版视频',
      }
      ],
    "publisher_22":
      [{
        'key': '1',
        'name': '横版视频',
      }, {
        'key': '2',
        'name': '竖版视频',
      }
      ]
  };

  public ImageTypeConfigList = {
    "publisher_1":
      [{
        'key': '2',
        'name': '单图',
      }, {
        'key': '5',
        'name': '大图',
      }, {
        'key': '2',
        'name': '三图',
      }
      ],
    "publisher_7":
      [{
        'key': '1',
        'name': '推广卡片主图',
      }, {
        'key': '2',
        'name': '横版大图',
      }, {
        'key': '3',
        'name': '竖版大图',
      }, {
        'key': '4',
        'name': '小图',
      }
      ],
    "publisher_17":
      [{
        'key': '1',
        'name': 'logo',
      }, {
        'key': [2, 4],
        'name': '大图',
      }, {
        'key': '3',
        'name': '小图,三图',
      }
      ],
    "publisher_22":
      [{
        'key': '2',
        'name': '横版大图',
      }, {
        'key': '3',
        'name': '竖版大图',
      }, {
        'key': '4',
        'name': '横版小图',
      }, {
        'key': '5',
        'name': '推广卡片配图',
      }
      ],
  };

  public titleWordType = {
    'publisher_6': {
      word_num: 2,
      min_length: 5,
      max_length: 30,
    },
    'publisher_7': {
      word_num: 1,
      min_length: 2,
      max_length: 30,
    },
    'publisher_17': {
      word_num: 1,
      min_length: 10,
      max_length: 70,
    },
    'publisher_16': {
      word_num: 2,
      min_length: 5,
      max_length: 30,
    },
    'publisher_1': {
      word_num: 2,
      min_length: 1,
      max_length: 60,
    },
    'publisher_23': {
      word_num: 2,
      min_length: 1,
      max_length: 30,
    },
    'publisher_22': {
      word_num: 2,
      min_length: 6,
      max_length: 55,
    },
  };




  public publisherList = {
    7: '头条',
    1: '百度信息流'
  };

  public structConfigByteDaceData = {};

  public downloadLinkList = {}; // 下载链接

  public coverTypeConfigList = {
    "publisher_7":
      [{
        'key': 1,
        'name': '横版视频封面图',
      }, {
        'key': 2,
        'name': ' 竖版视频封面图',
      }]
  };

  constructor(
    private _httpClient: HttpClientService,
    private notifyService: NotifyService,
    private _message: NzMessageService,
    private originHttpClient: HttpClient,
  ) { }

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
      return of({ ...this.structConfigByteDaceData });
    } else {
      return this._httpClient.get(url, params).pipe(
        map((response) => {
          if (response.status_code && response.status_code === 200) {
            this.structConfigByteDaceData = { ...response['data'] };
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
  getCardTemplateInfo(id, params?): any {
    const url = "/manager_base/launch_promo_card_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 修改卡片模板
  updateCardTemplate(id, body, params?): any {
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
  getFeedStructConfigByUc(params?): Observable<any> {
    const url = "/define_list/feed_struct_config_uc";
    return this._httpClient.get(url, params);
  }

  // 获取uc定向配置值
  getFeedTargetConfigByUc(params?): Observable<any> {
    const url = "/define_list/feed_target_config_uc";
    return this._httpClient.get(url, params);
  }

  // 下载链接
  getUcAppTypeUrlList(params?): any {
    const url = "/manager_base/launch_app_url/get_list";
    if (Object.keys(this.downloadLinkList).length) {
      return of({ ...this.downloadLinkList });
    } else {
      return this._httpClient.post(url, {}, params).pipe(
        map((response) => {
          if (response.status_code && response.status_code === 200) {
            const data = response['data'];
            this.downloadLinkList = {};
            data.forEach(url => {
              if (this.downloadLinkList[url.app_url_type] === undefined) {
                this.downloadLinkList[url.app_url_type] = [];
              }

              this.downloadLinkList[url.app_url_type].push(url);
            });
            return { ...this.downloadLinkList };
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
  getCampaignList(body, params?) {
    const url = "/manager_base/launch_setting/get_campaign_by_account_id";
    return this._httpClient.post(url, body, params);
  }

  getAdgroupListNum(body, params) {
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
  getEventTargetList(body): any {
    const url = "/launch_rpa/bytedance/launch_convert_channel/get_third_page_list";
    return this._httpClient.post(url, body);
  }
  getTetrisTargetList(body): any {
    const url = "/launch_rpa/bytedance/launch_convert_channel/get_site_page_list";
    return this._httpClient.post(url, body);
  }
  getQuickTargetList(body): any {
    const url = "/launch_rpa/bytedance/launch_convert_channel/get_asset_id_list";
    return this._httpClient.post(url, body);
  }
  // 智能投放 -- 推广内容列表
  getAssetList(body, params?): any {
    const url = "/launch_rpa/bytedance/launch_convert_channel/get_asset_id_list";
    return this._httpClient.post(url, body, params);
  }
  // 智能投放 -- 优化目标列表
  getExternalActionList(body, params?): any {
    const url = "/launch_rpa/bytedance/launch_convert_channel/get_optimized_goal_list_by_asset_id";
    return this._httpClient.post(url, body, params);
  }

  // 智能投放 -- 定向模板列表
  getAudienceTemplateList(body, params?): any {
    const url = "/launch_rpa/bytedance/launch_audience_template/get_list";
    return this._httpClient.post(url, body, params);
  }

  // 智能投放 -- 定向模板子列表
  getChildAudienceTemplateList(id, body, params?): any {
    const url = "/launch_rpa/bytedance/launch_audience_template/get_detail_list/" + id;
    return this._httpClient.post(url, body, params);
  }

  // 创建定向基础包
  createLaunchAudienceBasicTemplate(body, params?): any {
    const url = "/launch_rpa/bytedance/launch_audience_template";
    return this._httpClient.post(url, body, params);
  }

  addLaunchAudienceTemplateUc(body, params?): any {
    const url = "/launch_rpa/uc/launch_audience_template";
    return this._httpClient.post(url, body, params);
  }

  // 修改定向基础包
  updateLaunchAudienceBasicTemplate(id, body, params?): any {
    const url = "/launch_rpa/bytedance/launch_audience_template/" + id;
    return this._httpClient.put(url, body, params);
  }
  // 定向基础包详情
  getLaunchRpaTemplateData(id, params?): any {
    const url = "/launch_rpa/bytedance/launch_audience_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 删除定向基础包
  deleteLaunchAudienceBasicTemplate(body, params?): any {
    const url = "/launch_rpa/bytedance/launch_audience_template";
    return this._httpClient.delete(url, body, params);
  }



  // 素材作者
  getMaterialsAuthorList(body, params?): any {
    const url = "/material_manage/author/get_list";
    return this._httpClient.post(url, body, params);
  }


  deleteMaterialsAuthor(body, params?): any {
    const url = "/material_manage/author/delete";
    return this._httpClient.delete(url, body, params);
  }

  addMaterialsAuthor(body, params?): any {
    const url = '/manager_base/material_author';
    return this._httpClient.post(url, body, params);
  }

  updateMaterialsAuthor(author_id, body, params?): any {
    const url = '/manager_base/material_author/' + author_id;
    return this._httpClient.put(url, body, params);
  }



  syncMaterialJob(publisherId, materialType, chanPubIds, tags?, callback?, params?) {

    const postBody = {
      publisher_id: publisherId,
      materiel_type: materialType,
      chan_pub_ids: chanPubIds,
      material_tags: tags || []
    };

    const notifyData = [];
    const url = "/launch_rpa/task";
    return this._httpClient.post(url, postBody).pipe(
      map(
        (result: any) => {
          if (result.status_code === 200) {
            this._message.success("已成功加入任务队列，请稍后查看");

            if (result['data'] && result['data'].hasOwnProperty('job_id')) {
              notifyData.push({
                job_id: result['data']['job_id'],
                material_type: materialType,
              });
              this.notifyService.notifyData.next({ type: 'material_sync_job', data: notifyData });
            }

            return true;

          } else if (result['status_code'] && result.status_code === 401) {
            this._message.error('您没权限对此操作！');
            return false;
          } else if (result['status_code'] && result.status_code === 500) {
            this._message.error('系统异常，请重试');
            return false;
          } else {
            this._message.error(result.message);
            return false;
          }
        }
      ));

  }
  syncMaterialJobToutiao(postBody,materialType) {
    const notifyData = [];
    const url = "/launch_rpa/task";
    return this._httpClient.post(url, postBody).pipe(
      map(
        (result: any) => {
          if (result.status_code === 200) {
            this._message.success("已成功加入任务队列，请稍后查看");

            if (result['data'] && result['data'].hasOwnProperty('job_id')) {
              notifyData.push({
                job_id: result['data']['job_id'],
                material_type: materialType,
              });
              this.notifyService.notifyData.next({ type: 'material_sync_job', data: notifyData });
            }

            return true;

          } else if (result['status_code'] && result.status_code === 401) {
            this._message.error('您没权限对此操作！');
            return false;
          } else if (result['status_code'] && result.status_code === 500) {
            this._message.error('系统异常，请重试');
            return false;
          } else {
            this._message.error(result.message);
            return false;
          }
        }
      ));

  }



  // 获取创意分类
  getFeedConfigCreativeCategory(params?): any {
    const url = "/define_list/feed_config_creative_category_bytedance";
    return this._httpClient.get(url, params);
  }


  // 图片列表
  getLaunchImageList(publisherId, body, params?): any {
    let url = "/launch_rpa/bytedance/image_list";
    if (publisherId == 7) {
      url = "/launch_rpa/bytedance/image_list";
    } else if (publisherId == 6) {
      url = "/launch_rpa/tencent/image_list";
    } else if (publisherId == 17) {
      url = "/launch_rpa/uc/image_list";
    } else if (publisherId == 16) {
      url = "/launch_rpa/kuaishou/image_list";
    } else if (publisherId == 1) {
      url = "/launch_rpa/baidu/image_list";
    } else if (publisherId == 23) {
      url = "/launch_rpa/jinniu/image_list";
    } else if (publisherId == 22) {
      url = "/launch_rpa/qianchuan/image_list";
    }
    return this._httpClient.post(url, body, params);
  }
  getImageList(body, params?, publisherId?): any {
    let url = "/material_manage/image/image_report_list";
    if (publisherId == 1) {
      url = "/launch_rpa/baidu/image_report_list";
    }
    if (publisherId == 22) {
      url = "/launch_rpa/qianchuan/image_report_list";
    }
    return this._httpClient.post(url, body, params);
  }

  // 视频列表
  getLaunchVideoList(publisherId, body, params?): any {
    let url = "/launch_rpa/bytedance/video_list";
    if (publisherId == 7) {
      url = "/launch_rpa/bytedance/video_list";
    } else if (publisherId == 6) {
      url = "/launch_rpa/tencent/video_list";
    } else if (publisherId == 17) {
      url = "/launch_rpa/uc/video_list";
    } else if (publisherId == 16) {
      url = "/launch_rpa/kuaishou/video_list";
    } else if (publisherId == 1) {
      url = "/launch_rpa/baidu/video_list";
    } else if (publisherId == 23) {
      url = "/launch_rpa/jinniu/video_list";
    } else if (publisherId == 22) {
      url = "/launch_rpa/qianchuan/video_list";
    }
    return this._httpClient.post(url, body, params);
  }
  getVideoList(body, params?, publisherId?): any {
    let url = "/material_manage/video/video_report_list";
    if (publisherId == 1) {
      url = "/launch_rpa/baidu/video_report_list";
    }
    if (publisherId == 22) {
      url = "/launch_rpa/qianchuan/video_report_list";
    }
    return this._httpClient.post(url, body, params);
  }

  // 新建投放项目
  createLaunchProject(body, params?) {
    const url = "/launch_rpa/project/launch_project";
    return this._httpClient.post(url, body, params);
  }

  // 获取投放项目列表
  getLaunchProjectList(body, params?) {
    const url = "/launch_rpa/project/launch_project/get_list";
    return this._httpClient.post(url, body, params);
  }

  getLaunchProjectReportList(publisherId, body, params?) {
    let url = "/launch_rpa/bytedance/project_report_list";
    if (publisherId == 7) {
      url = "/launch_rpa/bytedance/project_report_list";
    } else if (publisherId == 6) {
      url = "/launch_rpa/tencent/project_report_list";
    } else if (publisherId == 17) {
      url = "/launch_rpa/uc/project_report_list";
    } else if (publisherId == 16) {
      url = "/launch_rpa/kuaishou/project_report_list";
    } else if (publisherId == 1) {
      url = "/launch_rpa/baidu/project_report_list";
    } else if (publisherId == 23) {
      url = "/launch_rpa/jinniu/project_report_list";
    } else if (publisherId == 22) {
      url = "/launch_rpa/qianchuan/project_report_list";
    }
    return this._httpClient.post(url, body, params);
  }

  // 删除投放项目列表
  deleteLaunchProjectList(body, params?) {
    const url = "/launch_rpa/project/launch_project";
    return this._httpClient.delete(url, body, params);
  }

  // 投放项目详情
  getLaunchProjectDetail(id, params?) {
    const url = "/launch_rpa/project/launch_project/" + id;
    return this._httpClient.get(url, params);
  }

  // 修改项目详情
  updateLaunchProjectl(id, body, params?) {
    const url = "/launch_rpa/project/launch_project/" + id;
    return this._httpClient.put(url, body, params);
  }

  // 新建渠道
  createChannel(body, params?) {
    const url = "/launch_rpa/bytedance/launch_convert_channel";
    return this._httpClient.post(url, body, params);
  }

  // 修改渠道
  updateChannel(id, body, params?) {
    const url = "/launch_rpa/bytedance/launch_convert_channel/" + id;
    return this._httpClient.put(url, body, params);
  }

  // 获取渠道列表
  getChannelList(body, params?) {
    const url = "/launch_rpa/bytedance/launch_convert_channel/get_list";
    return this._httpClient.post(url, body, params);
  }

  // 渠道详情
  getLaunchChannelDetail(id, params?) {
    const url = "/launch_rpa/bytedance/launch_convert_channel/" + id;
    return this._httpClient.get(url, params);
  }


  // bytedance/title_report_list
  // 文案
  getLaunchRasTitleList(publisherId, body, params?): any {
    let url = "/launch_rpa/bytedance/title_report_list";
    if (publisherId == 7) {
      url = "/launch_rpa/bytedance/title_report_list";
    } else if (publisherId == 6) {
      url = "/launch_rpa/tencent/title_report_list";
    } else if (publisherId == 17) {
      url = "/launch_rpa/uc/title_report_list";
    } else if (publisherId == 16) {
      url = "/launch_rpa/kuaishou/title_report_list";
    } else if (publisherId == 1) {
      url = "/launch_rpa/baidu/title_report_list";
    } else if (publisherId == 23) {
      url = "/launch_rpa/jinniu/title_report_list";
    } else if (publisherId == 22) {
      url = "/launch_rpa/qianchuan/title_report_list";
    }
    return this._httpClient.post(url, body, params);
  }


  getLaunchTemplateLog(publisherId, body, params?) {
    let url = "/launch_rpa/project_template/record/get_list";
    if (publisherId == 7) {
      url = "/launch_rpa/project_template/record/get_list";
    }
    return this._httpClient.post(url, body, params);
  }


  getLaunchTemplateLogDetail(publisherId, body, params?) {
    let url = "/launch_rpa/project_template/record_detail/get_list";
    if (publisherId == 7) {
      url = "/launch_rpa/project_template/record_detail/get_list";
    } else if (publisherId == 6) {
      url = "/launch_rpa/project_template/record_detail/get_list";
    }
    return this._httpClient.post(url, body, params);
  }

  //成功广告列表
  getSuccessLogDetail(body, params?) {
    let url = "/launch_rpa/project_template/record_detail/get_ad_list";
    return this._httpClient.post(url, body, params);
  }
  //获取广告创意预览接口
  getAdcreativeTemplate(body, params?) {
    let url = "/launch_rpa/tencent/launch_setting_tencent/get_adcreative_template_previews";
    return this._httpClient.post(url, body, params);
  }

  //
  //
  //   获取模版执行记录
  //   post
  // /v6/launch_rpa/project_template/record/get_list?cid=26666&login_type=3&channel_id=2&publisher_id=7&user_id=40&project_template_id=601fa0eb4ac4f
  //
  //   获取执行记录的detail
  //   post
  // /v6/launch_rpa/project_template/record_detail/get_list?cid=26666&login_type=3&channel_id=2&publisher_id=7&user_id=40&record_id=a1a1a1&result_model=all
  //



  // 文案
  getLaunchTitleList(body, params?): any {
    const url = "/manager_base/launch_title/get_list";
    return this._httpClient.post(url, body, params);
  }

  addLaunchTitle(body, params?): any {
    const url = '/launch_rpa/title';
    return this._httpClient.post(url, body, params);
  }

  deleteLaunchTitles(body, params?): any {
    const url = "/launch_rpa/title";
    return this._httpClient.delete(url, body, params);
  }

  deleteLaunchTitlesBatch(body, params?): any {
    const url = "/launch_rpa/title/batch_delete";
    return this._httpClient.delete(url, body, params);
  }


  getLaunchTitleWorld(params?): any {
    const url = "/manager_base/launch_title/get_word";
    return this._httpClient.get(url, params);
  }


  getLaunchTitleWorldBaidu(params?): any {
    const url = "/manager_base/launch_setting_baidu/get_monitor_symbol_list";
    return this._httpClient.post(url, params);
  }




  //根据指定下标，将字符串分割成两个字符串
  getStringByPosition(start_pos, end_pos, str) {
    let startStr = '';
    let endStr = '';
    if (str && end_pos <= str.length) { //光标位置不能超过字符串长度
      startStr = str.substring(0, start_pos);
      endStr = str.substring(end_pos, str.length);
    }

    return {
      startStr,
      endStr
    };
  }

  // 标题文案：数字、英文字母、英文标点符号都是半个字，奇数+1
  getStringLength(str, wordList) {
    let strNum = str.match(/\d|[A-Za-z]|\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\-|\=|\[|\]|\{|\}|\\|\||\;|\'|\'|\:|\"|\"|\,|\.|\/|\<|\>|\?+/g);
    if (!strNum) {
      strNum = [];
    }
    let length = str.length - strNum.length + Math.ceil((strNum.length / 2));

    const checkAry = [];
    const adWord = [];
    let word = '';
    if (str) {
      for (const char of str) {
        if (char === '{') {
          checkAry.push(char);
          word = '';
        } else {
          if (checkAry.length === 1) {
            if (char == '}') {
              adWord.push(word);
              checkAry.pop();
            } else {
              word += char;
            }
          }
        }
      }

      for (let i = 0; i < adWord.length; i++) {
        if (wordList.includes(adWord[i])) {
          switch (adWord[i]) {
            case '地点': {
              length = length - (adWord[i].length + 1) + 4;
              break;
            }
            case '日期': {
              length = length - (adWord[i].length + 1) + 6;
              break;
            }
            case '星期': {
              length = length - (adWord[i].length + 1) + 3;
              break;
            }
            case '用餐类型': {
              length = length - (adWord[i].length + 1) + 2;
              break;
            }
            case '省份': {
              length = length - (adWord[i].length + 1) + 3;
              break;
            }
            case '月份': {
              length = length - (adWord[i].length + 1) + 3;
              break;
            }
            case '节日': {
              length = length - (adWord[i].length + 1) + 5;
              break;
            }
            case '网络环境': {
              length = length - (adWord[i].length + 1) + 4;
              break;
            }
            case '男人女人': {
              length = length - (adWord[i].length + 1) + 2;
              break;
            }
            case '帅哥美女': {
              length = length - (adWord[i].length + 1) + 2;
              break;
            }
            case '他她': {
              length = length - (adWord[i].length + 1) + 1;
              break;
            }
            case '反性别-夫妻': {
              length = length - (adWord[i].length + 1) + 2;
              break;
            }
            case '年龄': {
              length = length - (adWord[i].length + 1) + 3;
              break;
            }
            case '手机系统': {
              length = length - (adWord[i].length + 1) + 4;
              break;
            }
            case '运营商': {
              length = length - (adWord[i].length + 1) + 2;
              break;
            }
            case '区县': {
              length = length - (adWord[i].length + 1) + 6;
              break;
            }
            case '行业': {
              length = length - (adWord[i].length + 1) + 4;
              break;
            }
            case '家用电器': {
              length = length - (adWord[i].length + 1) + 4;
              break;
            }
            case '考试': {
              length = length - (adWord[i].length + 1) + 4;
              break;
            }
          }
        }
      }
    }
    return length;
  }

  // 匹配词包，最多两个并且在公共词包中
  matchFeedWord(str, wordList, wordNum, isAdd?) {
    const checkAry = [];
    const adWord = [];
    const stack = [];
    let stackFlag = false;
    let word = '';
    if (str) {
      for (const char of str) {
        if (char === '{') {
          checkAry.push(char);
          word = '';
          stack.push('{');
        } else {
          if (char == '}') {
            if (stack.length == 0) {
              stackFlag = true;
            } else {
              stack.pop();
            }
          }

          if (checkAry.length === 1) {
            if (char == '}') {
              adWord.push(word);
              checkAry.pop();
            } else {
              word += char;
            }
          }
        }
      }
      if (stackFlag || stack.length > 0) {
        return {
          isMatch: false,
          tip: '文案中的括号不匹配'
        };
      } else if (checkAry.length) {
        return {
          isMatch: false,
          tip: '文案中的括号不匹配'
        };
      } else {
        if (adWord.length > wordNum) {
          return {
            isMatch: false,
            tip: '每条文案的公共词包只能有' + wordNum + '个'
          };
        }

        if (isAdd && adWord.length === 2) {
          return {
            isOver: true,
          };
        }
        for (let i = 0; i < adWord.length; i++) {
          if (!wordList.includes(adWord[i])) {
            return {
              isMatch: false,
              tip: '{}只能包含公共词包'
            };
          }
        }
      }

      return {
        isMatch: true,
      };
    }
  }

  // 匹配词包，最多一个并且在公共词包中
  matchOneFeedWord(str, wordList, isAdd?) {
    const checkAry = [];
    const adWord = [];
    const stack = [];
    let stackFlag = false;
    let word = '';
    if (str) {
      for (const char of str) {
        if (char === '{') {
          checkAry.push(char);
          word = '';
          stack.push('{');
        } else {
          if (char == '}') {
            if (stack.length == 0) {
              stackFlag = true;
            } else {
              stack.pop();
            }
          }

          if (checkAry.length === 1) {
            if (char == '}') {
              adWord.push(word);
              checkAry.pop();
            } else {
              word += char;
            }
          }
        }
      }
      if (stackFlag || stack.length > 0) {
        return {
          isMatch: false,
          tip: '文案中的括号不匹配'
        };
      } else if (checkAry.length) {
        return {
          isMatch: false,
          tip: '文案中的括号不匹配'
        };
      } else {
        if (adWord.length > 1) {
          return {
            isMatch: false,
            tip: '每条文案的公共词包只能有一个'
          };
        }

        if (isAdd && adWord.length === 1) {
          return {
            isOver: true,
          };
        }

        for (let i = 0; i < adWord.length; i++) {
          if (!wordList.includes(adWord[i])) {
            return {
              isMatch: false,
              tip: '{}只能包含公共词包'
            };
          }
        }
      }

      return {
        isMatch: true,
      };
    }
  }



  getLaunchTitleGroupList(body, params?): any {
    // const url = "/manager_base/launch_title/get_list";
    // return this._httpClient.post(url, body, params);
  }

  // 删除渠道
  deleteLaunchChannelList(body, params?) {
    const url = "/launch_rpa/bytedance/launch_convert_channel";
    return this._httpClient.delete(url, body, params);
  }
  // 获取媒体定向列表-头条
  getMediaTargetPackage(body, params?) {
    const url = "/launch_rpa/bytedance/launch_convert_channel/get_media_audience_list";
    return this._httpClient.post(url, body, params);
  }




  //上传相关


  // 上传视频素材
  uploadVideoMaterials(body, cid?): any {
    const url = environment.SERVER_API_URL + '/manager_base/material/upload_video?cid=' + cid;

    const req = new HttpRequest('POST', url, body, {
      reportProgress: true,
      withCredentials: true,
    });

    return this.originHttpClient.request(req);
  }


  uploadVideoBatchMaterials(body, cid?): any {
    const url = environment.SERVER_API_URL + '/launch_rpa/video/batch_upload_video?cid=' + cid;

    const req = new HttpRequest('POST', url, body, {
      reportProgress: true,
      withCredentials: true,
    });

    return this.originHttpClient.request(req);
  }
  // 上传视频素材
  uploadImageMaterials(body, cid?): any {
    const url = environment.SERVER_API_URL + '/launch_rpa/image/upload_image?cid=' + cid;

    const req = new HttpRequest('POST', url, body, {
      reportProgress: true,
      withCredentials: true,
    });

    return this.originHttpClient.request(req);
  }



  saveImageInfo(body, params?): any {
    const url = '/launch_rpa/image/save_images';
    return this._httpClient.post(url, body, params);
  }

  checkImageMd5(md5, params) {
    const url = '/launch_rpa/image/check_md5/' + md5;
    return this._httpClient.get(url, params);
  }

  checkVideo(md5, params) {
    const url = '/launch_rpa/video/check_md5/' + md5;
    return this._httpClient.get(url, params);
  }

  saveVideoInfo(body, params?): any {
    const url = '/launch_rpa/video/batch_save_video';
    return this._httpClient.post(url, body, params);
  }


  getImageSize(params?): any {
    const url = '/launch_rpa/image/config';
    return this._httpClient.get(url, params);
  }


  // 新建投放组模板
  createProjectTemplate(body, params?) {
    const url = "/launch_rpa/project_template/launch_project_template";
    return this._httpClient.post(url, body, params);
  }

  // 修改渠道
  updateProjectTemplate(id, body, params?) {
    const url = "/launch_rpa/project_template/launch_project_template/" + id;
    return this._httpClient.put(url, body, params);
  }

  // 投放组模板详情
  getProjectTemplateDetail(id, params?) {
    const url = "/launch_rpa/project_template/launch_project_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 获取投放组模板列表
  getProjectTemplateList(body, params?) {
    const url = "/launch_rpa/project_template/launch_project_template/get_list";
    return this._httpClient.post(url, body, params);
  }


  getLaunchProjectTemplateReportList(publisherId, projectId, body, params?) {
    let url = "/launch_rpa/bytedance/project_template_report_list/" + projectId;
    if (publisherId == 7) {
      url = "/launch_rpa/bytedance/project_template_report_list/" + projectId;
    } else if (publisherId == 6) {
      url = "/launch_rpa/tencent/project_template_report_list/" + projectId;
    } else if (publisherId == 17) {
      url = "/launch_rpa/uc/project_template_report_list/" + projectId;
    } else if (publisherId == 16) {
      url = "/launch_rpa/kuaishou/project_template_report_list/" + projectId;
    } else if (publisherId == 1) {
      url = "/launch_rpa/baidu/project_template_report_list/" + projectId;
    } else if (publisherId == 23) {
      url = "/launch_rpa/jinniu/project_template_report_list/" + projectId;
    } else if (publisherId == 22) {
      url = "/launch_rpa/qianchuan/project_template_report_list/" + projectId;
    }
    return this._httpClient.post(url, body, params);
  }

  // 删除投放项目列表
  deleteProjectTemplate(body, params?) {
    const url = "/launch_rpa/project_template/launch_project_template";
    return this._httpClient.delete(url, body, params);
  }


  //标签

  getLabelByLaunchType(tagsType) {
    const url = "/launch_rpa/tags/list";
    return this._httpClient.get(url, { tags_type: tagsType });
  }

  modifyLabel(labelType, body, params?) {
    const url = "/launch_rpa/" + labelType + "/batch_update";
    return this._httpClient.put(url, body, params);
  }

  //
  // {
  //   "material_ids": [
  //     "570000000"
  //   ],
  //   "publisher_id": 7,
  //   "material_tags": {
  //     "is_edit": true,
  //     "modify_type": "add",
  //     "value": [
  //       "标签1",
  //       "标签21"
  //     ]
  //   }
  // }


  // 运行模板
  runProjectTemplate(body, params?) {
    const url = "/launch_rpa/project_template/launch_project_template/run";
    return this._httpClient.post(url, body, params);
  }



  // 修改素材详情
  getMaterialDetail(materialId, params?): any {
    const url = '/launch_rpa/video/material/' + materialId;
    return this._httpClient.get(url, params);
  }

  // 修改素材详情
  getMaterialImageDetail(materialId, params?): any {
    const url = '/launch_rpa/image/image_material/' + materialId;
    return this._httpClient.get(url, params);
  }


  deleteImageMaterials(materialId, params?): any {
    const url = '/launch_rpa/image/image_material/' + materialId;
    return this._httpClient.delete(url, {}, params);
  }


  deleteImageMaterialsBatch(body, params?): any {
    const url = '/launch_rpa/image/image_material/batch_delete';
    return this._httpClient.delete(url, body, params);
  }

  deleteVideoMaterialsBatch(body, params?): any {
    const url = '/launch_rpa/video/material/batch_delete';
    return this._httpClient.delete(url, body, params);
  }


  deleteVideoMaterials(materialId, params?): any {
    const url = '/launch_rpa/video/material/' + materialId;
    return this._httpClient.delete(url, {}, params);
  }




  updateMaterialDetail(body, params?): any {
    const url = '/launch_rpa/video/material/' + body.material_id;
    return this._httpClient.put(url, body, params);
  }


  updateMaterialImageDetail(body, params?): any {
    const url = '/launch_rpa/image/image_material/' + body.material_id;
    return this._httpClient.put(url, body, params);
  }


  // 新建卡片模板
  createPromotionCardTemplate(body, params?): any {
    const url = "/launch_rpa/bytedance/promotion_card_template";
    return this._httpClient.post(url, body, params);
  }

  // 编辑卡片模板
  getPromotionCardTemplateInfo(id, params?): any {
    const url = "/launch_rpa/bytedance/promotion_card_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 修改卡片模板
  updatePromotionCardTemplate(id, body, params?): any {
    const url = "/launch_rpa/bytedance/promotion_card_template/" + id;
    return this._httpClient.put(url, body, params);
  }

  // 删除卡片模板
  deletePromotionCardTemplate(body, params?): any {
    const url = "/launch_rpa/bytedance/promotion_card_template/delete";
    return this._httpClient.post(url, body, params);
  }

  // 获取卡片模板列表
  getPromotionCardTemplate(body, params?): any {
    const url = "/launch_rpa/bytedance/promotion_card_template/get_list";
    return this._httpClient.post(url, body, params);
  }

  // 获取卡片模板配置
  getCardTemplateSetting(body, params) {
    const url = "/launch_rpa/bytedance/promotion_card_template/get_setting";
    return this._httpClient.post(url, body, params);
  }
  // 广点通定向配置
  getTargetConfigByGdt(params): Observable<any> {
    const url = "/define_list/feed_config_eqq_new";
    return this._httpClient.get(url, params);
  }

  // 新建定向模板 - 广点通
  createLaunchAudienceTemplateByGdt(body, params) {
    const url = "/launch_rpa/tencent/launch_audience_template";
    return this._httpClient.post(url, body, params);
  }

  // 定向基础包列表 - 广点通
  getTargetBasicListByGdt(body, params?) {
    const url = "/launch_rpa/tencent/launch_audience_template/get_list";
    return this._httpClient.post(url, body, params);
  }

  // 定向投放包列表 - 广点通
  getTargetListByGdt(id, params) {
    const url = "/launch_rpa/tencent/launch_audience_template/get_detail_list/" + id;
    return this._httpClient.post(url, params);
  }

  // 定向包详情 - 广点通
  getTargetDetailByGdt(id, params) {
    const url = "/launch_rpa/tencent/launch_audience_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 修改定向包详情 - 广点通
  updateTargetDetailByGdt(id, body, params) {
    const url = "/launch_rpa/tencent/launch_audience_template/" + id;
    return this._httpClient.put(url, body, params);
  }

  // 删除定向包 - 广点通
  deleteTargetBasicTemplate(body, params?): any {
    const url = "/launch_rpa/tencent/launch_audience_template";
    return this._httpClient.delete(url, body, params);
  }

  // 人群 - 广点通
  getByGdtTargetAudience(params) {
    const url = "/define_list/feed_config_custom_eqq";
    return this._httpClient.get(url, params);
  }

  // 新建渠道 - 广点通
  createChannelByGdt(body, params?) {
    const url = "/launch_rpa/tencent/launch_convert_channel";
    return this._httpClient.post(url, body, params);
  }
  // 渠道列表 - 广点通
  getChannelListByGdt(body, params) {
    const url = "/launch_rpa/tencent/launch_convert_channel/get_list";
    return this._httpClient.post(url, body, params);
  }
  // 渠道详情 - 广点通
  getChannelDetailByGdt(id, params) {
    const url = "/launch_rpa/tencent/launch_convert_channel/" + id;
    return this._httpClient.get(url, params);
  }
  // 修改渠道 - 广点通
  updateChannelByGdt(id, params) {
    const url = "/launch_rpa/tencent/launch_convert_channel/" + id;
    return this._httpClient.put(url, params);
  }
  // 删除渠道 - 广点通
  deleteChannelByGdt(body, params) {
    const url = "/launch_rpa/tencent/launch_convert_channel";
    return this._httpClient.delete(url, body, params);
  }

  // 落地页 蹊径 - 广点通
  getPageXijingList(params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_xijing_page_list";
    return this._httpClient.get(url, params);
  }

  // 安卓渠道包 - 广点通
  getAndroidPackage(body, params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_android_package_list";
    return this._httpClient.post(url, body, params);
  }

  // 推广目标id - 广点通
  getObjectIdList(body, params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_promoted_object_id";
    return this._httpClient.post(url, body, params);
  }

  // 转化归因 - 广点通
  getUserActionSetsList(body, params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_user_action_sets";
    return this._httpClient.post(url, body, params);
  }

  // 封面列表
  getLaunchCoverImageList(cssType, publisherId, body, params?): any {
    let url = "/launch_rpa/screenshot/get_list";

    // 广点通品牌
    if (cssType == 999) {
      url = "/launch_rpa/tencent/image_report_list";
    }
    if (publisherId === 1 && cssType == 999) {
      url = "/launch_rpa/baidu/image_report_list";
    }

    if (publisherId === 17 && cssType == 1) {
      url = "/launch_rpa/uc/image_report_list";
    }
    return this._httpClient.post(url, body, params);
  }

  // 删除封面图
  deleteCoverImageMaterials(materialId, params?): any {
    const url = '/launch_rpa/screenshot/image_material/' + materialId;
    return this._httpClient.delete(url, {}, params);
  }

  // 批量删除封面图
  deleteCoverImageMaterialsBatch(body, params?): any {
    const url = '/launch_rpa/screenshot/image_material/batch_delete';
    return this._httpClient.delete(url, body, params);
  }

  // 封面图配置接口
  getCoverImageSize(params?): any {
    const url = '/launch_rpa/screenshot/config';
    return this._httpClient.get(url, params);
  }

  // 上传封面图
  saveCoverImageInfo(body, params?): any {
    const url = '/launch_rpa/screenshot/save_images';
    return this._httpClient.post(url, body, params);
  }

  // 头条封面图
  checkCoverImageMd5(md5, params) {
    const url = '/launch_rpa/screenshot/check_md5/' + md5;
    return this._httpClient.get(url, params);
  }

  // 上传封面图
  uploadCoverImageMaterials(body, cid?): any {
    const url = environment.SERVER_API_URL + '/launch_rpa/screenshot/upload_image?cid=' + cid;

    const req = new HttpRequest('POST', url, body, {
      reportProgress: true,
      withCredentials: true,
    });

    return this.originHttpClient.request(req);
  }

  // 修改封面素材详情
  getCoverMaterialImageDetail(materialId, params?): any {
    const url = '/launch_rpa/screenshot/image_material/' + materialId;
    return this._httpClient.get(url, params);
  }

  // 修改封面图
  updateCoverMaterialImageDetail(body, params?): any {
    const url = '/launch_rpa/screenshot/image_material/' + body.material_id;
    return this._httpClient.put(url, body, params);
  }

  // rpa获取标题动态词包
  getLaunchRpaTitleWorld(params?): any {
    const url = "/launch_rpa/title/get_word";
    return this._httpClient.get(url, params);
  }

  // 占位符
  getLaunchRpaWildCard(params?): any {
    const url = "/launch_rpa/project_template/get_wildcard";
    return this._httpClient.get(url, params);
  }

  // 新建投放配置 - 广点通
  getStructConfigByGdt(params?) {
    const url = "/define_list/feed_struct_config_tencent";
    return this._httpClient.get(url, params);
  }

  // 优化目标接口 - 广点通
  getOptimizationGoalList(body, params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_optimization_goal_permissions_list";
    return this._httpClient.post(url, body, params);
  }

  // 深度转化目标 - 广点通
  getDeepOptimizationGoalList(body, params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_deep_optimization_goal_permissions_list";
    return this._httpClient.post(url, body, params);
  }

  // 深度转化目标 - 广点通
  getStartAudienceList(body, params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_cold_start_audience_list";
    return this._httpClient.post(url, body, params);
  }

  // 自定义转化行为 - 广点通
  getConversionBehaviorList(params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_conversion_behavior_list";
    return this._httpClient.get(url, params);
  }

  // 流量包 - 广点通
  getUnionPackageList(body, params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_union_position_packages_list";
    return this._httpClient.post(url, body, params);
  }

  // 创意形式 - 广点通
  getAdcreativeTemplatesList(body, params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_adcreative_templates_list";
    return this._httpClient.post(url, body, params);
  }

  // 创意元素 - 广点通
  getCreativeElementsList(body, params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_creative_elements_struct";
    return this._httpClient.post(url, body, params);
  }

  // 创意标签 - 广点通
  getCreativLabelList(params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_label_list";
    return this._httpClient.get(url, params);
  }

  // 按钮文案 - 广点通
  getButtonTextList(params) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_button_text_list";
    return this._httpClient.get(url, params);
  }

  // 定向基础包列表 - UC（超级汇川）
  getTargetBasicListByUc(body, params?) {
    const url = "/launch_rpa/uc/launch_audience_template/get_list";
    return this._httpClient.post(url, body, params);
  }
  // 修改定向基础包-Uc（超级汇川）
  updateLaunchAudienceTemplateUc(body, templateId, params?): any {
    const url = "/launch_rpa/uc/launch_audience_template/" + templateId;
    return this._httpClient.put(url, body, params);
  }
  // 定向基础包详情-Uc（超级汇川）
  getLaunchAudienceTemplateDetailUc(id, params?): any {
    const url = "/launch_rpa/uc/launch_audience_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 删除定向包 - UC（超级汇川）
  deleteTargetBasicTemplateUc(body, params?): any {
    const url = "/launch_rpa/uc/launch_audience_template";
    return this._httpClient.delete(url, body, params);
  }
  // 定向包详情 - UC（超级汇川）
  getTargetDetailByUc(id, params) {
    const url = "/launch_rpa/uc/launch_audience_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 定向投放包列表 - Uc（超级汇川）
  getTargetListByUc(id, params) {
    const url = "/launch_rpa/uc/launch_audience_template/get_detail_list/" + id;
    return this._httpClient.post(url, params);
  }

  // 新建渠道-Uc（超级汇川）
  createChannelByUc(body, params?) {
    const url = "/launch_rpa/uc/launch_convert_channel";
    return this._httpClient.post(url, body, params);
  }
  // 新建渠道-Uc（超级汇川）
  updateChannelsByUc(body, params?) {
    const url = "/launch_rpa/uc/launch_convert_channel/batch_update";
    return this._httpClient.put(url, body, params);
  }

  // 修改渠道-Uc（超级汇川）
  updateChannelByUc(id, body, params?) {
    const url = "/launch_rpa/uc/launch_convert_channel/" + id;
    return this._httpClient.put(url, body, params);
  }

  // 获取渠道列表-Uc（超级汇川）
  getChannelListByUc(body, params?) {
    const url = "/launch_rpa/uc/launch_convert_channel/get_list";
    return this._httpClient.post(url, body, params);
  }

  // 获取媒体定向列表-Uc
  getMediaTargetPackageByUc(body, params?) {
    const url = "/define_list/feed_target_package_uc";
    return this._httpClient.post(url, body, params);
  }


  // 渠道详情-Uc（超级汇川）
  getLaunchChannelDetailByUc(id, params?) {
    const url = "/launch_rpa/uc/launch_convert_channel/" + id;
    return this._httpClient.get(url, params);
  }

  // 删除渠道-Uc（超级汇川）
  deleteLaunchChannelListByUc(body, params?) {
    const url = "/launch_rpa/uc/launch_convert_channel";
    return this._httpClient.delete(url, body, params);
  }

  // uc媒体落地页
  getMediaTargetListByUc(params?): any {
    const url = "/define_list/feed_site_config_uc";
    return this._httpClient.get(url, params);
  }
  // 获取转化目标-uc（超级汇川）
  getConversionTargetListByUc(params?): any {
    const url = "/launch_rpa/uc/launch_convert_list";
    return this._httpClient.post(url, params);
  }
  getChainConvertListByUc(params?): any {
    const url = "/launch_rpa/uc/launch_chain_convert_info";
    return this._httpClient.post(url, params);
  }
  // 获取转化目标-uc（超级汇川）
  getConversionTargetListNewByUc(params?): any {
    const url = "/launch_rpa/uc/launch_convert_list_new";
    return this._httpClient.post(url, params);
  }
  getMediaDownloadUrlList(body, params?): Observable<any> {
    const url = '/launch_rpa/uc/launch_app_package_list';
    return this._httpClient.post(url, body, params);
  }
  //推广内容列表-uc
  getAssetListByUC(body, params?): any {
    const url = "/launch_rpa/uc/launch_convert_channel/get_asset_id_list";
    return this._httpClient.post(url, body, params);
  }
  //优化目标列表-uc
  getExternalActionListByUC(body, params?): any {
    const url = "/launch_rpa/uc/launch_convert_channel/get_optimized_goal_list_by_asset_id";
    return this._httpClient.post(url, body, params);
  }



  // 批量上传渠道
  saveChannelInfo(body, params?): any {
    const url = '/launch_rpa/uc/launch_convert_channel/import_file';
    return this._httpClient.post(url, body, params);
  }

  // 检查应用下载链接
  checkAppUrl(body, params?): any {
    const url = "/manager_base/launch_setting/check_app_url";
    return this._httpClient.post(url, body, params);
  }

  // 快手渠道配置接口
  getFeedTargetConfigByKs(params?): any {
    const url = "/define_list/feed_config_kuaishou";
    return this._httpClient.get(url, params);
  }

  // 新建渠道-kuaishou
  createChannelByKs(body, params?) {
    const url = "/launch_rpa/kuaishou/launch_convert_channel";
    return this._httpClient.post(url, body, params);
  }

  // 修改渠道-kuaishou
  updateChannelByKs(id, body, params?) {
    const url = "/launch_rpa/kuaishou/launch_convert_channel/" + id;
    return this._httpClient.put(url, body, params);
  }

  // 获取渠道列表-kuaishou
  getChannelListByKs(body, params?) {
    const url = "/launch_rpa/kuaishou/launch_convert_channel/get_list";
    return this._httpClient.post(url, body, params);
  }

  // 渠道详情-kuaishou
  getLaunchChannelDetailByKs(id, params?) {
    const url = "/launch_rpa/kuaishou/launch_convert_channel/" + id;
    return this._httpClient.get(url, params);
  }

  // 删除渠道-kuaishou
  deleteLaunchChannelListByKs(body, params?) {
    const url = "/launch_rpa/kuaishou/launch_convert_channel";
    return this._httpClient.delete(url, body, params);
  }
  // 获取落地页工具列表-kuaishou
  getPageListByKs(body, params?): any {
    const url = "/launch_rpa/kuaishou/launch_setting_kuaishou/get_page_list";
    return this._httpClient.post(url, body, params);
  }
  // 获取应用列表-kuaishou
  getAppListByKs(body, params?): any {
    const url = "/launch_rpa/kuaishou/launch_setting_kuaishou/get_app_list";
    return this._httpClient.post(url, body, params);
  }
  // 获取转化追踪列表-kuaishou
  getConvertListByKs(body, params?): any {
    const url = "/launch_rpa/kuaishou/launch_setting_kuaishou/get_convert_id";
    return this._httpClient.post(url, body, params);
  }
  // 定向基础包列表 - kuaishou
  getTargetBasicListByKs(body, params?) {
    const url = "/launch_rpa/kuaishou/launch_audience_template/get_list";
    return this._httpClient.post(url, body, params);
  }
  // 修改定向基础包-kuaishou
  updateLaunchAudienceTemplateKs(body, templateId, params?): any {
    const url = "/launch_rpa/kuaishou/launch_audience_template/" + templateId;
    return this._httpClient.put(url, body, params);
  }
  // 定向基础包详情-kuaishou
  getLaunchAudienceTemplateDetailKs(id, params?): any {
    const url = "/launch_rpa/kuaishou/launch_audience_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 删除定向包 - kuaishou
  deleteTargetBasicTemplateKs(body, params?): any {
    const url = "/launch_rpa/kuaishou/launch_audience_template";
    return this._httpClient.delete(url, body, params);
  }
  // 定向包详情 - kuaishou
  getTargetDetailByKs(id, params) {
    const url = "/launch_rpa/kuaishou/launch_audience_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 定向投放包列表 - kuaishou
  getTargetListByKs(id, params) {
    const url = "/launch_rpa/kuaishou/launch_audience_template/get_detail_list/" + id;
    return this._httpClient.post(url, params);
  }
  addLaunchAudienceTemplateKs(body, params?): any {
    const url = "/launch_rpa/kuaishou/launch_audience_template";
    return this._httpClient.post(url, body, params);
  }
  //行为关键字-kuaishou
  getKsBehaviorKeyword(body, params?): any {
    const url = "/launch_rpa/kuaishou/launch_setting_kuaishou/get_behavior_keyword_list";
    return this._httpClient.post(url, body, params);
  }
  //行为-快手
  getKsBehaviorLabel(params?): Observable<any> {
    const url = '/launch_rpa/kuaishou/launch_setting_kuaishou/get_behavior_label_list';
    return this._httpClient.get(url, params);
  }
  //兴趣-kuaishou
  getKsInterestLabel(params?): Observable<any> {
    const url = '/launch_rpa/kuaishou/launch_setting_kuaishou/get_interest_label_list';
    return this._httpClient.get(url, params);
  }
  //app定向按分类-kuaishou
  getKsAppInterestByType(params?): Observable<any> {
    const url = '/launch_rpa/kuaishou/launch_setting_kuaishou/get_app_interest_list';
    return this._httpClient.get(url, params);
  }
  //app定向按名称-kuaishou
  getKsAppInterestByName(body, params?): any {
    const url = "/launch_rpa/kuaishou/launch_setting_kuaishou/get_app_targeting_list";
    return this._httpClient.post(url, body, params);
  }
  //人群包-kuaishou
  getKsTargetAudience(body, params?): Observable<any> {
    const url = '/launch_rpa/kuaishou/launch_setting_kuaishou/get_population_list';
    return this._httpClient.post(url, body, params);
  }

  // 新建投放配置 - 快手
  getStructConfigByKs(params?) {
    const url = "/define_list/feed_struct_config_kuaishou";
    return this._httpClient.get(url, params);
  }

  // 按钮文案 - 快手
  getActionBarList(params) {
    const url = "/define_list/get_action_bar_text_kuaishou";
    return this._httpClient.get(url, params);
  }

  // 推荐理由 - 快手
  getExposeTagList(params) {
    const url = "/define_list/get_expose_tag_kuaishou";
    return this._httpClient.get(url, params);
  }

  //  创意分类 - 快手
  getCreativeCategoryList(params) {
    const url = "/define_list/get_creative_category_kuaishou";
    return this._httpClient.get(url, params);
  }
  //  创意标签 - 快手
  getCreativeTagList(params) {
    const url = "/define_list/get_creative_tag_kuaishou";
    return this._httpClient.get(url, params);
  }
  //  优化目标 - 快手
  getOcpxActionList(params) {
    const url = "/define_list/get_conversion_infos_kuaishou";
    return this._httpClient.get(url, params);
  }

  //  动态词包 - 快手
  getCreativeWordList(params) {
    const url = "/define_list/get_creative_word_kuaishou";
    return this._httpClient.get(url, params);
  }


  // 渠道配置接口-baidu
  getFeedTargetConfigByBd(params?): any {
    const url = "/define_list/feed_audience_config_baidu";
    return this._httpClient.get(url, params);
  }

  // 新建渠道-baidu
  createChannelByBd(body, params?) {
    const url = "/launch_rpa/baidu/launch_convert_channel";
    return this._httpClient.post(url, body, params);
  }

  // 修改渠道-baidu
  updateChannelByBd(id, body, params?) {
    const url = "/launch_rpa/baidu/launch_convert_channel/" + id;
    return this._httpClient.put(url, body, params);
  }

  // 获取渠道列表-baidu
  getChannelListByBd(body, params?) {
    const url = "/launch_rpa/baidu/launch_convert_channel/get_list";
    return this._httpClient.post(url, body, params);
  }

  // 渠道详情-baidu
  getLaunchChannelDetailByBd(id, params?) {
    const url = "/launch_rpa/baidu/launch_convert_channel/" + id;
    return this._httpClient.get(url, params);
  }

  // 删除渠道-baidu
  deleteLaunchChannelListByBd(body, params?) {
    const url = "/launch_rpa/baidu/launch_convert_channel";
    return this._httpClient.delete(url, body, params);
  }
  // 获取落地页工具列表-baidu
  getPageListByBd(body, params?): any {
    const url = "/launch_rpa/baidu/launch_setting_baidu/get_page_list";
    return this._httpClient.post(url, body, params);
  }
  // 获取转化追踪列表-baidu
  getConvertListByBd(body, params?): any {
    const url = "/launch_rpa/baidu/launch_setting_baidu/get_convert_id";
    return this._httpClient.post(url, body, params);
  }
  // 定向基础包列表 - baidu
  getTargetBasicListByBd(body, params?) {
    const url = "/launch_rpa/baidu/launch_audience_template/get_list";
    return this._httpClient.post(url, body, params);
  }
  // 修改定向基础包-baidu
  updateLaunchAudienceTemplateBd(body, templateId, params?): any {
    const url = "/launch_rpa/baidu/launch_audience_template/" + templateId;
    return this._httpClient.put(url, body, params);
  }
  // 定向基础包详情-baidu
  getLaunchAudienceTemplateDetailBd(id, params?): any {
    const url = "/launch_rpa/baidu/launch_audience_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 删除定向包 - baidu
  deleteTargetBasicTemplateBd(body, params?): any {
    const url = "/launch_rpa/baidu/launch_audience_template";
    return this._httpClient.delete(url, body, params);
  }
  // 定向包详情 - baidu
  getTargetDetailByBd(id, params) {
    const url = "/launch_rpa/baidu/launch_audience_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 定向投放包列表 - baidu
  getTargetListByBd(id, params) {
    const url = "/launch_rpa/baidu/launch_audience_template/get_detail_list/" + id;
    return this._httpClient.post(url, params);
  }
  addLaunchAudienceTemplateBd(body, params?): any {
    const url = "/launch_rpa/baidu/launch_audience_template";
    return this._httpClient.post(url, body, params);
  }
  //获取意图词包
  getKeywordsList(params?): any {
    const url = "/define_list/feed_keywords_list_baidu";
    return this._httpClient.get(url, params);
  }


  // 新建投放配置 - baidu
  getStructConfigByBd(params?) {
    const url = "/define_list/feed_config_baidu";
    return this._httpClient.get(url, params);
  }
  //人群包-baidu
  getTargetAudienceByBd(body, params?): Observable<any> {
    const url = '/define_list/get_custom_crowd_list_feed_baidu';
    return this._httpClient.post(url, body, params);
  }
  //媒体包-baidu
  getMediaPackagesByBd(body, params?): Observable<any> {
    const url = '/define_list/get_media_packages_feed_baidu';
    return this._httpClient.post(url, body, params);
  }
  //媒体包-baidu
  getCustomMediaPackagesByBd(params?): Observable<any> {
    const url = '/define_list/get_custom_mp_feed_baidu';
    return this._httpClient.get(url, params);
  }
  //app-baidu
  getAppListByBd(body, params?): Observable<any> {
    const url = '/define_list/get_app_list_feed_baidu';
    return this._httpClient.post(url, body, params);
  }

  //地域-baidu
  getRegionListByBd(params?): Observable<any> {
    const url = '/define_list/feed_config_dpa_baidu';
    return this._httpClient.get(url, params);
  }

  //获取转化名称-baidu
  getConversionNameByBd(body, params?): Observable<any> {
    const url = '/define_list/get_conversion_name_feed_baidu';
    return this._httpClient.post(url, body, params);
  }

  // 获取转化目标
  getConversionTargetListBd(params?): any {
    const url = "/define_list/get_cpc_trans_feed_baidu";
    return this._httpClient.get(url, params);
  }
  // baidu媒体落地页
  getMediaTargetListByBd(params?): any {
    const url = "/define_list/get_promotion_urls_feed_baidu";
    return this._httpClient.get(url, params);
  }

  // 下载链接
  getAppTypeUrlListByBd(params?): any {
    const url = "/manager_base/launch_app_url/get_list";
    return this._httpClient.post(url, {}, params);
  }

  // 修改封面图
  uploadCoverImage(material_id, body, params?) {
    const url = "/manager_base/material/front_cover/" + material_id;
    return this._httpClient.post(url, body, params);
  }
  // 下载链接
  getFeedConfigLandingPageEqq(params?): any {
    const url = "/define_list/feed_config_landing_page_eqq";
    return this._httpClient.get(url, params);
  }

  // 原生推广页列表
  getWechatPagesList(params?) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_wechat_pages_list";
    return this._httpClient.get(url, params);
  }

  //辅助转化按钮文案
  getLinkNameTypeList(body, params?) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_link_name_type";
    return this._httpClient.post(url, body, params);
  }

  // 数据展示_转化行为列表
  getConversionTargetTypeList(body, params?) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_conversion_target_type_list";
    return this._httpClient.post(url, body, params);
  }

  // 品牌简介列表
  getWechatProfiles(body, params?) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_wechat_profiles";
    return this._httpClient.post(url, body, params);
  }

  // 查看成功广告列表
  getRunLogAdList(body, params?) {
    const url = "/launch_rpa/project_template/record_detail/get_ad_list";
    return this._httpClient.post(url, body, params);
  }

  // 预览成功广告列表
  getAdcreativeTemplatePreviews(body, params?) {
    const url = "/launch_rpa/tencent/launch_setting_tencent/get_adcreative_template_previews";
    return this._httpClient.post(url, body, params);
  }

  //app定向按名称-UC
  getUcAppInterestByName(body, params?): any {
    const url = "/launch_rpa/uc/launch_app_name_list";
    return this._httpClient.post(url, body, params);
  }

  // 新建投放配置 - 磁力金牛
  getStructConfigByNiu(params?) {
    const url = "/define_list/feed_temp_config_jinniu";
    return this._httpClient.get(url, params);
  }

  // 定向包详情 - 磁力金牛
  getTargetDetailByNiu(id, params) {
    const url = "/launch_rpa/jinniu/launch_audience_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 定向配置接口 - 磁力金牛
  getFeedTargetConfigByNiu(params?): any {
    const url = "/define_list/feed_target_config_jinniu";
    return this._httpClient.get(url, params);
  }

  // 推荐理由 - 磁力金牛
  getExposeTagListNiu() {
    const url = "/launch_rpa/jinniu/launch_setting_jinniu/expose_tag";
    return this._httpClient.get(url);
  }
  // 按钮文案 - 磁力金牛
  getActionBarListNiu(body) {
    const url = "/launch_rpa/jinniu/launch_setting_jinniu/action_bar_text";
    return this._httpClient.post(url, body);
  }
  //  动态词包 - 磁力金牛
  getJinNiuWordList() {
    const url = "/launch_rpa/jinniu/launch_setting_jinniu/bag_words";
    return this._httpClient.get(url);
  }

  // 获取商品列表---待测试
  getJinNiuItemList(body, params) {
    const url = "/launch_rpa/jinniu/launch_setting_jinniu/item_list";
    return this._httpClient.post(url, body, params);
  }

  // 获取商品类目列表
  getJinNiuItemCategoryList() {
    const url = "/launch_rpa/jinniu/launch_setting_jinniu/get_category_list";
    return this._httpClient.get(url);
  }

  // 根据id获取商品详情
  getJinNiuItemInfoById(body) {
    const url = "/launch_rpa/jinniu/launch_setting_jinniu/item_detail";
    return this._httpClient.post(url, body);
  }

  // 定向基础包列表 - 磁力金牛
  getTargetBasicListByNiu(body, params?) {
    const url = "/launch_rpa/jinniu/launch_audience_template/get_list";
    return this._httpClient.post(url, body, params);
  }

  // 定向投放包列表 - 磁力金牛
  getTargetListByNiu(id, params) {
    const url = "/launch_rpa/jinniu/launch_audience_template/get_detail_list/" + id;
    return this._httpClient.post(url, params);
  }

  // 删除定向包 - kuaishou
  deleteTargetBasicTemplateNiu(body, params?): any {
    const url = "/launch_rpa/jinniu/launch_audience_template";
    return this._httpClient.delete(url, body, params);
  }

  // 定向基础包详情 - 磁力金牛
  getLaunchAudienceTemplateDetailNiu(id, params?): any {
    const url = "/launch_rpa/jinniu/launch_audience_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 修改定向基础包- 磁力金牛
  updateLaunchAudienceTemplateNiu(body, templateId, params?): any {
    const url = "/launch_rpa/jinniu/launch_audience_template/" + templateId;
    return this._httpClient.put(url, body, params);
  }

  addLaunchAudienceTemplateNiu(body, params?): any {
    const url = "/launch_rpa/jinniu/launch_audience_template";
    return this._httpClient.post(url, body, params);
  }
  // 获取购物意图列表
  getPurchaseIntentionList(params?): any {
    const url = "/launch_rpa/jinniu/launch_setting_jinniu/purchase_intention";
    return this._httpClient.get(url, params);
  }

  // 获取人群包-磁力金牛
  getNiuTargetAudience(body, params?): Observable<any> {
    const url = '/launch_rpa/jinniu/launch_setting_jinniu/get_population_list';
    return this._httpClient.post(url, body, params);
  }
  // 获取网红分类-磁力金牛
  getNiuFansStarCelebrity(params?): Observable<any> {
    const url = '/launch_rpa/jinniu/launch_setting_jinniu/fans_star_celebrity';
    return this._httpClient.get(url, params);
  }

  // 获取快手网红信息-磁力金牛
  getNiuFansStarList(body, params?): Observable<any> {
    const url = '/launch_rpa/jinniu/launch_setting_jinniu/fans_star_info';
    return this._httpClient.post(url, body, params);
  }



  // -----------接口等待更换-------------

  // 获取渠道列表 - 磁力金牛
  getChannelListByNiu(body, params?) {
    const url = "/launch_rpa/kuaishou/launch_convert_channel/get_list";
    return this._httpClient.post(url, body, params);
  }


  //定向配置接口-千川
  getFeedTargetConfigByQC(params?): any {
    const url = "/define_list/feed_config_target_qianchuan";
    return this._httpClient.get(url, params);
  }

  // 定向基础包列表 -千川
  getTargetBasicListByQC(body, params?) {
    const url = "/launch_rpa/qianchuan/launch_audience_template/get_list";
    return this._httpClient.post(url, body, params);
  }
  // 修改定向基础包-千川
  updateLaunchAudienceTemplateQC(templateId, body, params?): any {
    const url = "/launch_rpa/qianchuan/launch_audience_template/" + templateId;
    return this._httpClient.put(url, body, params);
  }
  // 删除定向包 -千川
  deleteTargetBasicTemplateQC(body, params?): any {
    const url = "/launch_rpa/qianchuan/launch_audience_template";
    return this._httpClient.delete(url, body, params);
  }
  // 定向包详情 -千川
  getTargetDetailByQC(id, params) {
    const url = "/launch_rpa/qianchuan/launch_audience_template/" + id;
    return this._httpClient.get(url, params);
  }

  // 定向投放包列表 -千川
  getTargetListByQC(id, params) {
    const url = "/launch_rpa/qianchuan/launch_audience_template/get_detail_list/" + id;
    return this._httpClient.post(url, params);
  }
  addLaunchAudienceTemplateQC(body, params?): any {
    const url = "/launch_rpa/qianchuan/launch_audience_template";
    return this._httpClient.post(url, body, params);
  }
  //人群包-千川
  getQCTargetAudience(params): Observable<any> {
    const url = '/define_list/feed_audience_list_qianchuan';
    return this._httpClient.get(url, params);
  }
  //商品列表-千川
  getQCProductList(body, params): Observable<any> {
    const url = '/define_list/feed_product_page_list_qianchuan';
    return this._httpClient.post(url, body, params);
  }
  //抖音号列表-千川
  getQCAwemeList(params): Observable<any> {
    const url = '/define_list/feed_aweme_list_qianchuan';
    return this._httpClient.get(url, params);
  }

  // 新建投放配置 -千川
  getStructConfigByQC(params?) {
    const url = "/define_list/feed_struct_config_qianchuan";
    return this._httpClient.get(url, params);
  }
  getThirdIndustryListQC(params?) {
    const url = "/define_list/feed_industry_config_qianchuan";
    return this._httpClient.get(url, params);
  }

  //新版千川接口
  // 定向基础包列表 -千川
  getTargetListQC(body, params?) {
    const url = "/launch_rpa/qianchuan/launch_audience_template_new/get_list";
    return this._httpClient.post(url, body, params);
  }
  // 修改定向基础包-千川
  updateTargetTemplateQC(templateId, body, params?): any {
    const url = "/launch_rpa/qianchuan/launch_audience_template_new/" + templateId;
    return this._httpClient.put(url, body, params);
  }
  // 删除定向包 -千川
  deleteTargetTemplateQC(body, params?): any {
    const url = "/launch_rpa/qianchuan/launch_audience_template_new";
    return this._httpClient.delete(url, body, params);
  }
  // 定向包详情 -千川
  getTargetDetailQC(id, params) {
    const url = "/launch_rpa/qianchuan/launch_audience_template_new/" + id;
    return this._httpClient.get(url, params);
  }
  addTargetTemplateQC(body, params?): any {
    const url = "/launch_rpa/qianchuan/launch_audience_template_new";
    return this._httpClient.post(url, body, params);
  }

  getLaunchProjectReportListNew(publisherId, body, params?) {
    let url = "/launch_rpa/qianchuan/project_report_list?is_new=1";
    if (publisherId==17) {
      url = "/launch_rpa/uc/project_report_list?is_new=1";
    } else if (publisherId==1) {
      url = "/launch_rpa/baidu/project_report_list?is_new=1";
    }
    return this._httpClient.post(url, body, params);
  }
  // 新建投放项目
  createLaunchProjectNew(body, params?) {
    const url = "/launch_rpa/project_new/launch_project";
    return this._httpClient.post(url, body, params);
  }

  // 删除投放项目列表
  deleteLaunchProjectListNew(body, params?) {
    const url = "/launch_rpa/project_new/launch_project";
    return this._httpClient.delete(url, body, params);
  }

  // 投放项目详情
  getLaunchProjectDetailNew(id, params?) {
    const url = "/launch_rpa/project_new/launch_project/" + id;
    return this._httpClient.get(url, params);
  }

  // 修改项目详情
  updateLaunchProjectNew(id, body, params?) {
    const url = "/launch_rpa/project_new/launch_project/" + id;
    return this._httpClient.put(url, body, params);
  }

  //新版百度接口
  // 新建投放配置 - baidu
  getStructConfigBd(params?) {
    const url = "/define_list/feed_temp_config_baidu";
    return this._httpClient.get(url, params);
  }

  // 定向配置接口-baidu
  getFeedTargetConfigBd(params?): any {
    const url = "/define_list/feed_target_config_baidu";
    return this._httpClient.get(url, params);
  }

  // 媒体定向基础包列表 - baidu
  getMediaTargetListBd(body, params?) {
    const url = "/launch_rpa/baidu/get_atp_feed";
    return this._httpClient.post(url, body, params);
  }
  // 定向基础包列表 - baidu
  getTargetBasicListBd(body, params?) {
    const url = "/launch_rpa/baidu/launch_audience_template_new/get_list";
    return this._httpClient.post(url, body, params);
  }
  // 修改定向基础包-baidu
  updateLaunchTargetTemplateBd(body, templateId, params?): any {
    const url = "/launch_rpa/baidu/launch_audience_template_new/" + templateId;
    return this._httpClient.put(url, body, params);
  }
  // 定向基础包详情-baidu
  getLaunchTargetTemplateDetailBd(id, params?): any {
    const url = "/launch_rpa/baidu/launch_audience_template_new/" + id;
    return this._httpClient.get(url, params);
  }

  // 删除定向包 - baidu
  deleteTargetTemplateBd(body, params?): any {
    const url = "/launch_rpa/baidu/launch_audience_template_new";
    return this._httpClient.delete(url, body, params);
  }
  //添加定向包 - baidu
  addLaunchTargetTemplateBd(body, params?): any {
    const url = "/launch_rpa/baidu/launch_audience_template_new";
    return this._httpClient.post(url, body, params);
  }
  // 定向地域-baidu
  getLaunchTargetRegionBd(params): any {
    const url = "/define_list/feed_target_region_config_baidu";
    return this._httpClient.get(url, params);
  }

  //意图词包-baidu
  getWtpsLists(body, params?) {
    const url = "/launch_rpa/baidu/get_wtps";
    return this._httpClient.post(url, body,params);
  }
  //人群包-baidu
  getTargetCrowdByBd(body, params?): Observable<any> {
    const url = '/launch_rpa/baidu/get_custom_crowd_list_feed_baidu';
    return this._httpClient.post(url, body, params);
  }
  //媒体包-baidu
  getMediaPackagesBd(body, params?): Observable<any> {
    const url = '/launch_rpa/baidu/get_media_packages';
    return this._httpClient.post(url, body, params);
  }
  //自定义媒体包-baidu
  getCustomMediaPackagesBd(params?): Observable<any> {
    const url = '/launch_rpa/baidu/get_custom_mp';
    return this._httpClient.post(url, params);
  }
  //推荐的意图词-baidu
  getWordListBd(body, params?): Observable<any> {
    const url = '/launch_rpa/baidu/get_recm_word';
    return this._httpClient.post(url, body, params);
  }

  //转化数据-baidu
  getCustomTransBd(body, params?) {
    const url = "/launch_rpa/baidu/get_custom_ocpc_transfeed";
    return this._httpClient.post(url, body,params);
  }
  //可用的创意样式-baidu
  getMaterialStyle(body, params?) {
    const url = "/launch_rpa/baidu/get_material_style_data";
    return this._httpClient.post(url, body,params);
  }

  //基木鱼落地页-baidu
  getPromotionUrlsBd(body, params?) {
    const url = "/launch_rpa/baidu/get_promotion_urls";
    return this._httpClient.post(url, body,params);
  }
  //第三方落地页-baidu
  getCustomUrlsBd(body, params?) {
    const url = "/launch_rpa/baidu/custom_landing_page/get_list";
    return this._httpClient.post(url, body,params);
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
  // 预览信息校验-baidu
  checkPreviewBd(body, params?) {
    const url = "/launch_rpa/baidu/preview_check";
    return this._httpClient.post(url, body, params);
  }
  // 调起URL列表-baidu
  getNaUrlListByBd(body, params?) {
    const url = "/launch_rpa/baidu/app_na_url/get_list";
    return this._httpClient.post(url, body, params);
  }
  // 获取app信息-baidu
  getAppInfoListByBd(body, params?) {
    const url = "/launch_rpa/baidu/get_launch_app_list";
    return this._httpClient.post(url, body, params);
  }
  //app定向按名称-baidu
  getAppByName(body, params?): any {
    const url = "/launch_rpa/baidu/search_app";
    return this._httpClient.post(url, body, params);
  }

}

