import { deepCopy } from '@jzl/jzl-util';
import { Injectable } from '@angular/core';
import { HttpClientService } from "../../../core/service/http.client";
import { Observable } from "rxjs";
import { CustomDatasService } from '../../../shared/service/custom-datas.service';

@Injectable({
  providedIn: 'root',
})
export class DataAnalyticsService {
  public menuDetail = {};//数据报告-菜单信息
  public allDimensionObject = {
    department: { name: "事业部", key: "department", nameKey: 'department', fieldKey: "department" },
    advertiser: { name: "广告主", key: "advertiser", nameKey: 'advertiser_name', fieldKey: "cid" },
    channel: { name: "渠道", key: "channel", nameKey: 'channel', fieldKey: "channel_id" },
    publisher: { name: "媒体", key: "publisher", nameKey: 'publisher', fieldKey: "publisher_id" },
    account: { name: "帐户", key: "account", nameKey: 'pub_account_name', fieldKey: "chan_pub_id" },

    campaign: { name: "计划", key: "campaign", nameKey: "pub_campaign_name", fieldKey: "pub_campaign_id" },
    adgroup: { name: "单元", key: "adgroup", nameKey: "pub_adgroup_name", fieldKey: "pub_adgroup_id" },
    keyword: { name: "关键词", key: "keyword", nameKey: "pub_keyword", fieldKey: "pub_keyword_id" },
    creative: { name: "创意", key: "creative", nameKey: "pub_creative_title", fieldKey: "pub_creative_id" },
    search_keyword: { name: "搜索词", key: "search_keyword", nameKey: "pub_query", fieldKey: "pub_query_id" },

    responsible_account: { name: "负责人", key: "people", nameKey: "belong_user_name", fieldKey: "belong_user_name" },
    landing_page_account: { name: "落地页", key: "landing_page", nameKey: "landing_page", fieldKey: "landing_page" },

    country: { name: "国家地域", key: "country", nameKey: "country", fieldKey: "country", },
    province: { name: "省级地域", key: "province", nameKey: "province", fieldKey: "province", },
    city: { name: "市级地域", key: "city", nameKey: "city", fieldKey: "city", },
    age: { name: "年龄", key: "age", nameKey: "age", fieldKey: "age", },
    education: { name: "学历", key: "education", nameKey: "education", fieldKey: "education", },
    gender: { name: "性别", key: "gender", nameKey: "gender", fieldKey: "gender", },
    interest: { name: "兴趣", key: "interest", nameKey: "interest", fieldKey: "interest", },
    client: { name: "客户端", key: "client", nameKey: "client", fieldKey: "client", },
    material_style: { name: "'样式", key: "material_style", nameKey: "material_style", fieldKey: "material_style", },
    intention_keyword: { name: "意图词", key: "intention_keyword", nameKey: "intention_keyword", fieldKey: "intention_keyword", },
    ac: { name: "网络类型", key: "ac", nameKey: "ac", fieldKey: "ac", },
    platform: { name: "平台", key: "platform", nameKey: "platform", fieldKey: "platform", },
    landing_type: { name: "推广目的", key: "landing_type", nameKey: "landing_type", fieldKey: "landing_type", },
    inventory_type: { name: "投放位置", key: "inventory_type", nameKey: "inventory_type", fieldKey: "inventory_type", },
    pricing: { name: "出价类型", key: "pricing", nameKey: "pricing", fieldKey: "pricing", },
    image_mode: { name: "素材类型", key: "image_mode", nameKey: "image_mode", fieldKey: "image_mode", },
  }

  public summary_type_name: any = {
    publisher: '媒体',
    account: '账户',
    campaign: '计划',
    adgroup: '单元',
    keyword: '关键词',
    creative: '创意',
    search_keyword: '搜索词',
    dsa_pattern_day: '高级样式',
    target: '定向',
    advertiser: '广告主',
    department: '事业部',
    materials_video: '素材视频',
    materials_video_label: '素材视频-标签',
  };
  public all_locked_items = {};//当前类型下所有固定列信息
  // public all_locked_items = [];//当前类型下所有固定列信息

  /*1,百度  2，搜狗 3,360  4，神马*/
  public matchTypes = {
    1: [
      { 'name': '精确', 'value': 11 },
      { 'name': '短语匹配', 'value': 21 },
      // {'name': '智能匹配-核心词', 'value': 23},
      { 'name': '智能匹配', 'value': 23 },
    ],
    2: [
      { 'name': '精确', 'value': 10 },
      { 'name': '广泛', 'value': 30 },
      { 'name': '短语-精确包含', 'value': 22 },
      { 'name': '短语-核心包含', 'value': 23 },
      { 'name': '短语-同义包含', 'value': 21 },
    ],
    3: [
      { 'name': '精确', 'value': 10 },
      { 'name': '广泛', 'value': 30 },
      { 'name': '普通短语', 'value': 20 },
      { 'name': '短语-精确包含', 'value': 22 },
      { 'name': '短语-核心包含', 'value': 23 },
      { 'name': '短语-同义包含', 'value': 21 },
      { 'name': '智能短语', 'value': 24 }
    ],
    4: [
      { 'name': '精确', 'value': 10 },
      { 'name': '广泛', 'value': 30 },
      { 'name': '短语-精确包含', 'value': 22 },
      { 'name': '短语-核心包含', 'value': 23 },
      { 'name': '短语-同义包含', 'value': 21 }
    ],
    10: [
      { 'name': '精确', 'value': 10 },
      { 'name': '短语', 'value': 20 },
      { 'name': '广泛', 'value': 30 },
    ],
    17: [
      { 'name': '精确匹配', 'value': 0 },
      { 'name': '高级短语核心包含', 'value': 1 },
      { 'name': '广泛匹配', 'value': 2 },
      { 'name': '高级短语同义包含', 'value': 8 },
      { 'name': '高级短语精确包含', 'value': 9 },
    ],
    24: [
      { 'name': '精确匹配', 'value': 1 },
      { 'name': '短语匹配', 'value': 2 },
    ],
  };
  public matchType_baidu = [
    { 'name': '精确', 'value': 11 },
    { 'name': '短语匹配', 'value': 21 },
    // {'name': '智能匹配-核心词', 'value': 23},
    { 'name': '智能匹配', 'value': 23 },
  ];

  public match_type_sougou = [
    { 'name': '精确', 'value': 10 },
    { 'name': '广泛', 'value': 30 },
    { 'name': '短语(精确包含)', 'value': 22 },
    { 'name': '短语-核心包含', 'value': 23 },
    { 'name': '短语(同义包含)', 'value': 21 },
  ];

  public match_type_shenma = [
    { 'name': '精确', 'value': 10 },
    { 'name': '广泛', 'value': 30 },
    { 'name': '短语-精确包含', 'value': 22 },
    { 'name': '短语-核心包含', 'value': 23 },
    { 'name': '短语-同义包含', 'value': 21 }
  ];

  public Match_type_360 = [
    { 'name': '精确', 'value': 10 },
    { 'name': '广泛', 'value': 30 },
    { 'name': '普通短语', 'value': 20 },
    { 'name': '短语-精确包含', 'value': 22 },
    { 'name': '短语-核心包含', 'value': 23 },
    { 'name': '短语-同义包含', 'value': 21 },
    { 'name': '智能短语', 'value': 24 }
  ];

  constructor(
    private _httpClient: HttpClientService,
    private customDataService: CustomDatasService,
  ) {

  }

  // 设置SummaryType与固定列信息对应
  setSummaryTypeLockedItems(locked_items) {
    // this.all_locked_items = deepCopy(locked_items);
    if (locked_items.length === 1) {
      this.all_locked_items['default'] = locked_items[0];
    } else {
      locked_items.forEach(element => {
        this.all_locked_items[element.key] = element;
      });
    }
  }

  // 获取biz维度信息
  getDimensions(summaryType) {
    const dimensions = [];
    const dimensionMap = {};

    if (summaryType.startsWith('biz_unit_')) {
      this.customDataService.getBizUnitData().forEach(item => {
        const dim = { name: item.name, key: item.key, nameKey: item.key + '_name', fieldKey: item.key }
        dimensions.push(dim);
        dimensionMap[item.key] = dim;
      });
    }
    if (summaryType === 'biz_unit_hours_report') {
      const hour_dim = { "name": "时段", "key": "data_hour", "nameKey": "data_hour", "fieldKey": "hours" };
      dimensions.unshift(hour_dim);
      dimensionMap[hour_dim.key] = hour_dim;
    } else if (['biz_unit_region_report', 'publisher', 'account', 'campaign'].indexOf(summaryType) !== -1) {
      if (this.allDimensionObject[summaryType]) {
        dimensions.push(this.allDimensionObject[summaryType]);
        dimensionMap[summaryType] = this.allDimensionObject[summaryType];
      }
      const region_province = { "name": "省份", "key": "province", "nameKey": "province_name", "fieldKey": "province_id" };
      const region_city = { "name": "城市", "key": "city", "nameKey": "city_name", "fieldKey": "city_id" };
      dimensions.push(region_province, region_city);
      dimensionMap['province'] = region_province;
      dimensionMap['city'] = region_city;
    }
    return { dimensions, dimensionMap };
  }

  // 获取落地页
  getIsLandingPage() {
    const url = '/define_list/landing_page_role';
    return this._httpClient.get(url);
  }

  getBizUnitList() {
    const url = '/define_list/biz_unit';
    return this._httpClient.get(url);
  }


  getReportViewData(body, params) {
    const url = '/data_view/table_master_report';
    return this._httpClient.post(url, body, params);
  }

  createReport(body): Observable<any> {
    const url = '/custom_report/analytics';
    return this._httpClient.post(url, body);
  }


  editAccount(publisherId, body, edit_type): Observable<any> {
    let url = '';
    if (publisherId == 0) {
      url = '/data_view/account?update_type=' + edit_type;
    } else if (publisherId == 1) {
      url = '/data_view/account/update_baidu?update_type=' + edit_type;
    } else if (publisherId == 6) {
      url = '/data_view/feed/tencent/account?update_type=' + edit_type;
    } else if (publisherId == 7) {
      url = '/data_view/feed/bytedance/account?update_type=' + edit_type;
    } else if (publisherId == 17) {
      url = '/data_view/feed/uc/account?update_type=' + edit_type;
    } else if (publisherId == 24) {
      url = '/data_view/feed/xhs/account?update_type=' + edit_type;
    }


    return this._httpClient.put(url, body);
  }

  editCampaign(publisherId, body, edit_type): Observable<any> {
    let url = '';
    if (publisherId == 0) {
      url = '/data_view/campaign?update_type=' + edit_type;
    } else if (publisherId == 1) {
      url = '/data_view/campaign/update_baidu?update_type=' + edit_type;
    } else if (publisherId == 6) {
      url = '/data_view/feed/tencent/campaign?update_type=' + edit_type;
    } else if (publisherId == 7) {
      url = '/data_view/feed/bytedance/campaign?update_type=' + edit_type;
    } else if (publisherId == 17) {
      url = '/data_view/feed/uc/campaign?update_type=' + edit_type;
    } else if (publisherId == 24) {
      url = '/data_view/feed/xhs/campaign?update_type=' + edit_type;
    }
    return this._httpClient.put(url, body);
  }

  editAdgroup(publisherId, body, edit_type): any {
    let url = '';
    if (publisherId == 0) {
      url = '/data_view/adgroup?update_type=' + edit_type;
    } else if (publisherId == 1) {
      url = '/data_view/adgroup/update_baidu?update_type=' + edit_type;
    } else if (publisherId == 6) {
      url = '/data_view/feed/tencent/adgroup?update_type=' + edit_type;
    } else if (publisherId == 7) {
      url = '/data_view/feed/bytedance/adgroup?update_type=' + edit_type;
    } else if (publisherId == 17) {
      url = '/data_view/feed/uc/adgroup?update_type=' + edit_type;
    } else if (publisherId == 24) {
      url = '/data_view/feed/xhs/adgroup?update_type=' + edit_type;
    }
    return this._httpClient.put(url, body);
  }



  editAdgroupTarget(publisherId, body, edit_type): any {
    let url = '';
    if (publisherId == 1) {
      url = '/data_view/adgroup/update_baidu_target?update_type=' + edit_type;
    } else if (publisherId == 6) {
      url = '/data_view/feed/tencent/target?update_type=' + edit_type;
    } else if (publisherId == 7) {
      url = '/data_view/feed/bytedance/target?update_type=' + edit_type;
    } else if (publisherId == 17) {
      url = '/data_view/feed/uc/target?update_type=' + edit_type;
    } else if (publisherId == 24) {
      url = '/data_view/feed/xhs/target?update_type=' + edit_type;
    }
    return this._httpClient.put(url, body);
  }


  editCreative(publisherId, body, edit_type): any {
    let url = '';
    if (publisherId == 0) {
      url = '/data_view/creative?update_type=' + edit_type;
    } else if (publisherId == 1) {
      url = '/data_view/creative/update_baidu?update_type=' + edit_type;
    } else if (publisherId == 6) {
      url = '/data_view/feed/tencent/creative?update_type=' + edit_type;
    } else if (publisherId == 7) {
      url = '/data_view/feed/bytedance/creative?update_type=' + edit_type;
    } else if (publisherId == 17) {
      url = '/data_view/feed/uc/creative?update_type=' + edit_type;
    } else if (publisherId == 24) {
      url = '/data_view/feed/xhs/creative?update_type=' + edit_type;
    }
    return this._httpClient.put(url, body);
  }

  editKeyword(publisherId, body, edit_type): any {
    let url = '';
    if (publisherId == 0) {
      url = '/data_view/keyword?update_type=' + edit_type;
    } else if (publisherId == 17) {
      url = '/data_view/feed/uc/keyword?update_type=' + edit_type;
    } else if (publisherId == 24) {
      url = '/data_view/feed/xhs/keyword?update_type=' + edit_type;
    }
    return this._httpClient.put(url, body);
  }

  editOcpcBaidu(body, edit_type): any {
    const url = '/data_view/sem/ocpc/ocpc_baidu?update_type=' + edit_type;
    return this._httpClient.put(url, body);
  }

  createNegativeWord(body): any {
    const url = '/negative_word/word/add';
    return this._httpClient.post(url, body);
  }
  getAllNegativeWordGroupList(): any {
    const url = "/negative_word/group/all";
    return this._httpClient.get(url);
  }

  checkRankingHtml(body): any {
    const url = '/publisher_base/check_ranking_htm';
    return this._httpClient.post(url, body);
  }

  addSingleKeyword(body): any {
    const url = '/data_view/keyword';
    return this._httpClient.post(url, body);
  }
  getAccountPublishers() {
    const url = '/publisher_base/account_publisher';
    return this._httpClient.get(url);
  }
  syncPublisher(body): any {
    const url = '/publisher_base/sync';
    return this._httpClient.post(url, body);
  }
  getRankingCode(body, params) {
    const url = '/publisher_base/ranking_code';
    return this._httpClient.post(url, body, params);
  }
}
