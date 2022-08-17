import {
  AfterViewChecked,
  Component, DoCheck, EventEmitter,
  Input,
  OnChanges, OnDestroy,
  OnInit, Output,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { isArray } from "@jzl/jzl-util";
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { zip } from "rxjs";
import { DataViewService } from "../../../../routes/data-view-feed/service/data-view.service";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../notify/notify.service";
import { LaunchService } from '../../service/launch.service';

@Component({
  selector: 'app-target-setting',
  templateUrl: './target-setting.component.html',
  styleUrls: ['./target-setting.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TargetSettingComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input() isRemoveTargetingAudience;
  @Input() curGroupFlag = '0_0';
  @Input() targetSource;
  @Input() landingType;
  @Input() chan_pub_id = 0;

  public launchTemplateGroupData = {
    '0_0': [  // 落地页-默认
      "district",
      "gender",
      "age",
      "targeting_audience",
      "interest_action", // 行为兴趣
      'aweme_fan_categories', // 抖音达人
      // 精选流量包 -- 不限
      'platform', // 平台
      "article_category", // 文章分类
      "ac",
      'hide_if_converted', // 过滤已转化用户
      "carrier", // 运营商
      "activate_type", // 新用户
      "device_brand", // 手机品牌
      "launch_price", // 手机价格
      'auto_extend_enabled', // 智能放量
    ],
    '0_1': [  // 落地页-穿山甲
      "district",
      "gender",
      "age",
      "targeting_audience",
      "ad_tag", // 兴趣定向
      'superior_popularity_type', // 精选流量包
      'platform', // 平台
      'device_type', // 设备类型
      "app_behavior_target", // APP行为
      "article_category", // 文章分类
      "ac",
      'hide_if_converted', // 过滤已转化用户
      "device_brand", // 手机品牌
      "launch_price", // 手机价格
      'auto_extend_enabled', // 智能放量
    ],
    '1_0': [  // 应用推广Android-默认
      "district",
      "gender",
      "age",
      "targeting_audience",
      "interest_action", // 行为兴趣
      'aweme_fan_categories', // 抖音达人
      // 精选流量包 -- 不限
      'platform', // 平台 -- Android
      "article_category", // 文章分类
      "ac",
      'hide_if_converted', // 过滤已转化用户
      'hide_if_exists', // 过滤已安装
      "android_osv", // 安卓版本
      "carrier", // 运营商
      "activate_type", // 新用户
      "device_brand", // 手机品牌
      "launch_price", // 手机价格
      'auto_extend_enabled', // 智能放量
    ],
    '1_1': [  // 应用推广Android-穿山甲
      "district",
      "gender",
      "age",
      "targeting_audience",
      "ad_tag", // 兴趣定向
      'superior_popularity_type', // 精选流量包
      'platform', // 平台 -- Android
      'device_type', // 设备类型
      "app_behavior_target", // APP行为
      "article_category", // 文章分类
      "ac",
      'hide_if_converted', // 过滤已转化用户
      'hide_if_exists', // 过滤已安装
      "android_osv", // 安卓版本
      "device_brand", // 手机品牌
      "launch_price", // 手机价格
      'auto_extend_enabled', // 智能放量
    ],
    '2_0': [  // 应用推广IOS-默认
      "district",
      "gender",
      "age",
      "targeting_audience",
      "interest_action", // 行为兴趣
      'aweme_fan_categories', // 抖音达人
      // 精选流量包 -- 不限
      'platform', // 平台 -- IOS
      "article_category", // 文章分类
      "ac",
      'hide_if_converted', // 过滤已转化用户
      "ios_osv", // IOS版本
      "carrier", // 运营商
      "activate_type", // 新用户
      "launch_price", // 手机价格
      'auto_extend_enabled', // 智能放量
    ],
    '2_1': [  // 应用推广IOS-穿山甲
      "district",
      "gender",
      "age",
      "targeting_audience",
      "ad_tag", // 兴趣定向
      'superior_popularity_type', // 精选流量包
      'platform', // 平台 -- IOS
      'device_type', // 设备类型
      "article_category", // 文章分类
      "ac",
      'hide_if_converted', // 过滤已转化用户
      "ios_osv", // IOS版本
      "launch_price", // 手机价格
      'auto_extend_enabled', // 智能放量
    ],
  };

  public editDefaultDataOption = {

    app_behavior_target: {
      "name": "App行为",
      "isShow": true,
      "form_type": "app_behavior_target_radio",
      "radioValue": "NONE",
      "suffix": "",
      "resultValue": 'NONE',
      platformLimit: false,
      "sub": [
        {
          "label": "不限",
          "value": "NONE",
          "checked": false
        },
        {
          "label": "按分类",
          "value": "CATEGORY",
          "checked": false
        },
      ],
      combine_data: {
        "one_extra": {
          relation: 'CATEGORY',
          sub: [],
          resultList: []
        }
      }
    },

    ad_tag: {
      "name": "兴趣定向",
      "form_type": "one_extra_radio",
      "radioValue": "NONE",
      "suffix": "",
      "resultValue": '',
      "sub": [
        {
          "label": "不限",
          "value": "NONE",
          "checked": false
        },
        {
          "label": "系统推荐",
          "value": "SYSTEM",
          "checked": false
        },
        {
          "label": "自定义",
          "value": "ad_tag",
          "checked": false
        },
      ],
      combine_data: {
        "one_extra": {
          relation: 'ad_tag',
          sub: [],
          resultList: []
        }
      }
    },

    interest_action: {
      "form_type": "interest_action",
      "name": "行为兴趣",
      "radioValue": "UNLIMITED",
      "resultValue": 'UNLIMITED',
      "suffix": "",
      "sub": [
        {
          "label": "不限",
          "value": "UNLIMITED",
          "checked": false
        },
        {
          "label": "系统推荐",
          "value": "RECOMMEND",
          "checked": false
        },
        {
          "label": "自定义",
          "value": "CUSTOM",
          "checked": false
        },
      ],
      combine_data: {
        'action': {
          actionList: [],
          resultList: [],
        },
        'interest': {
          interestList: [],
          resultList: [],
        }
      },
      action_days: {
        "name": "行为天数",
        "cname": "行为天数",
        "form_type": "select",
        "resultValue": 30,
        "sub": [],
      },
      action_scene: {
        "name": "行为场景",
        "cname": "行为场景",
        "form_type": "multi_select",
        'resultList': [],
        "sub": [],
      }
    },

    device_brand: {
      platformLimit: true,
      "name": "手机品牌",
      "form_type": "device_brand_radio",
      "isShow": true,
      "suffix": "",
      "radioValue": "NONE",
      "resultValue": '',
      "sub": [
        {
          "label": "不限",
          "value": "NONE",
          "checked": false
        },
        {
          "label": "按品牌",
          "value": "brand",
          "checked": false
        },
      ],
      combine_data: {
        "one_extra": {
          relation: "brand",
          sub: [],
          resultList: []
        }
      }
    },
    auto_extend_enabled: {
      name: "智能放量",
      form_type: "one_extra_radio",
      "suffix": "",
      "radioValue": "NONE",
      "resultValue": '',
      "sub": [
        {
          "label": "不启用",
          "value": "NONE",
          "checked": false
        },
        {
          "label": "启用",
          "value": "auto_extend_targets",
          "checked": false
        },
      ],
      combine_data: {
        "one_extra": {
          relation: "auto_extend_targets",
          sub: [],
          resultList: []
        }
      }
    },
    article_category: {
      "name": "文章分类",
      "form_type": "one_extra_radio",
      "suffix": "",
      "radioValue": "NONE",
      "resultValue": '',
      "sub": [
        {
          "label": "不限",
          "value": "NONE",
          "checked": false
        },
        {
          "label": "文章分类",
          "value": "article",
          "checked": false
        },
      ],
      combine_data: {
        "one_extra": {
          relation: "article",
          sub: [],
          resultList: []
        }
      }
    },

    aweme_fan_categories: {
      "name": "抖音达人",
      "form_type": "aweme_fan_radio",
      "suffix": "",
      "radioValue": "NONE",
      "resultValue": '',
      "sub": [
        {
          "label": "不限",
          "value": "NONE",
          "checked": false
        },
        {
          "label": "自定义",
          "value": "aweme_fan",
          "checked": false
        },
      ],
      combine_data: {
        "one_extra": {
          relation: "aweme_fan",
          sub: [],
          resultList: []
        }
      },
      aweme_fan_behaviors: {
        "name": "抖音用户行为类型",
        "cname": "抖音用户行为类型",
        "form_type": "checkbox",
        "sub": [
          {
            "value": "FOLLOWED_USER",
            "label": "已关注用户",
            "checked": true,
          },
          {
            "value": "COMMENTED_USER",
            "label": "15天内已评论用户",
            "checked": false,
          },
          {
            "value": "LIKED_USER",
            "label": "15天内已点赞用户",
            "checked": false,
          },
          {
            "value": "SHARED_USER",
            "label": "15天内已分享用户",
            "checked": false,
          }
        ],
      }
    },

    district: {
      "name": "地域",
      "form_type": "district_radio",
      "suffix": "",
      "radioValue": "NONE",
      "resultValue": '',
      "sub": [
        {
          "label": "不限",
          "value": "NONE",
          "checked": false
        },
        {
          "label": "按省市",
          "value": "CITY",
          "checked": false
        },
        {
          "label": "按区县",
          "value": "COUNTY",
          "checked": false
        },
        {
          "label": "按商圈",
          "value": "BUSINESS_DISTRICT",
          "checked": false
        },
      ],
      combine_data: {
        "CITY": {
          sub: [],
          resultList: []
        },
        "COUNTY": {
          sub: [],
          resultList: []
        },
        "BUSINESS_DISTRICT": {
          limit: 100,
          sub: [],
          resultList: []
        }
      },

      location_type: {
        "name": "位置类型",
        "cname": "位置类型",
        "form_type": "radio",
        "radioValue": "HOME",
        "resultValue": "HOME",
        "tips": "位置类型",
        "sub": [
          {
            "value": "CURRENT",
            "label": "正在该地区的用户",
            "tips": "正在该地区的用户",
          },
          {
            "value": "HOME",
            "label": "居住在该地区的用户",
            "tips": "居住在该地区的用户",
          },
          {
            "value": "TRAVEL",
            "label": "到该地区旅行的用户",
            "tips": "到该地区旅行的用户",
          },
          {
            "value": "ALL",
            "label": "该地区内的所有用户",
            "tips": "该地区内的所有用户",
          }
        ],
      },
    },

    launch_price: {
      "name": "手机价格",
      "form_type": "launch_price_radio",
      "suffix": "",
      "radioValue": "NONE",
      "resultValue": 'NONE',
      "sub": [
        {
          "label": "不限",
          "value": "NONE",
          "checked": false
        },
        {
          "label": "自定义",
          "value": "price",
          "checked": false
        },
      ],
      priceMark: { 0: "0", 500: "", 1000: "", 1500: "", 2000: "2000元", 2500: "", 3000: "", 3500: "", 4000: "", 5000: "5000元", 6000: "", 7000: "", 8000: "", 9000: "", 10000: "1万元", 11000: "" },
      priceResult: [0, 11000],
    },

    targeting_audience: {
      "form_type": "targeting_audience",
      "name": "自定义人群",
      "radioValue": "NONE",
      "resultValue": 'NONE',
      "suffix": "",
      "sub": [
        {
          "label": "不限",
          "value": "NONE",
          "checked": false
        },
        {
          "label": "自定义人群",
          "value": "custom_audience",
          "checked": false
        },
      ],
      combine_data: {
        crowdList: [],
        crowdResultList: [],
        excludeCrowdList: [],
        excludeCrowdResultList: [],
      }
    },
  };

  public editDefaultDataOptionBak = {};

  public platFormChecked = [];

  public deviceBrandAndroidList = [];
  public deviceBrandList = [];

  public isInitFinshed = false;
  public isInitSingleDataFinshed = false;

  public cid;

  constructor(
    private message: NzMessageService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private modalService: NzModalService,
    private dataViewService: DataViewService,
    private launchService: LaunchService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;

  }

  ngOnInit() {
    this.initConfigList();
  }

  ngAfterViewChecked() {
    // setTimeout( () => {
    if (this.isInitSingleDataFinshed) {
      const setting = this.generateResultData();
      this.targetSource.audience_setting = { ...setting };
    }
    // }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['curGroupFlag'] && changes['curGroupFlag'].previousValue !== undefined) {
      this.targetSource.audience_setting = {};
    }
    this.initConfigList();

    if (changes['landingType']) {
      if (this.landingType === 'LINK' || this.landingType === 'EXTERNAL') {
        // 过滤已转化用户 hide_if_converted
        if (this.editDefaultDataOption['hide_if_converted'] && this.editDefaultDataOption['hide_if_converted']['resultValue'] === 'App') {
          this.editDefaultDataOption['hide_if_converted']['resultValue'] = this.editDefaultDataOption['hide_if_converted']['sub'][0]['value'];
        }
      }
    }
  }

  initConfigList(): void {
    if (!this.curGroupFlag) {
      return;
    }

    this.isInitSingleDataFinshed = false;

    if (Object.keys(this.editDefaultDataOptionBak).length) {
      this.editDefaultDataOption = JSON.parse(JSON.stringify(this.editDefaultDataOptionBak));
    }

    const getByteDanceTargetAudience = this.launchService.getByteDanceTargetAudience({
      chan_pub_id: this.chan_pub_id,
      cid: this.cid,
    });
    const getByteDanceConfig$ = this.dataViewService.getByteDanceTargetConfig(this.chan_pub_id);

    zip(getByteDanceConfig$, getByteDanceTargetAudience).subscribe(([result, audienceList]) => {

      if (audienceList['status_code'] && audienceList.status_code === 200) {
        const audienceData = audienceList['data'];
        Object.keys(audienceList['data']).forEach(itemKey => {
          if (itemKey == 'customtList') {
            this.editDefaultDataOption.targeting_audience.combine_data.crowdList = JSON.parse(JSON.stringify(audienceData['customtList']));
            this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdList = JSON.parse(JSON.stringify(audienceData['customtList']));
          }
        });
      }

      if (result['status_code'] && result.status_code === 200) {
        const resultData = result['data'];
        Object.keys(resultData).forEach(itemKey => {
          if (itemKey == 'device_brand') {
            if (this.curGroupFlag.indexOf('1_') !== -1) {
              this.editDefaultDataOption.device_brand.combine_data.one_extra.sub = [...resultData['device_brand_android']["sub"]];
            } else {
              this.editDefaultDataOption.device_brand.combine_data.one_extra.sub = [...resultData[itemKey]["sub"]];
            }
            this.deviceBrandList = [...resultData[itemKey]["sub"]];
            this.deviceBrandAndroidList = [...resultData['device_brand_android']["sub"]];
          } else if (itemKey == 'article_category') {
            this.editDefaultDataOption.article_category.combine_data.one_extra.sub = [...resultData[itemKey]["sub"]];
          } else if (itemKey == 'app_category') {
            this.editDefaultDataOption.app_behavior_target.combine_data.one_extra.sub = [...resultData[itemKey]['sub']];
          } else if (itemKey == 'ad_tag') {
            this.editDefaultDataOption.ad_tag.combine_data.one_extra.sub = [...resultData[itemKey]['sub']];
          } else if (itemKey == 'auto_extend_enabled') {
            this.editDefaultDataOption.auto_extend_enabled.combine_data.one_extra.sub = [...resultData["auto_extend_targets"]['sub']];
          } else if (itemKey == 'aweme_fan_categories') {
            this.editDefaultDataOption.aweme_fan_categories.combine_data.one_extra.sub = [...resultData[itemKey]['sub']];
          } else if (itemKey == 'auto_extend_targets') {

          } else if (itemKey == 'audienceList') {

          } else if (itemKey == 'customtList') {

          } else if (itemKey == 'region') {
            this.editDefaultDataOption.district.combine_data.BUSINESS_DISTRICT.sub = [...resultData[itemKey]];
          } else if (itemKey == 'prov_and_city') {
            this.editDefaultDataOption.district.combine_data.CITY.sub = [...resultData[itemKey]];
          } else if (itemKey == 'county') {
            this.editDefaultDataOption.district.combine_data.COUNTY.sub = [...resultData[itemKey]];
          } else if (itemKey == 'action_categories') {
            this.editDefaultDataOption.interest_action.combine_data.action.actionList = JSON.parse(JSON.stringify(resultData[itemKey]['sub']));
            this.editDefaultDataOption.interest_action.combine_data.interest.interestList = JSON.parse(JSON.stringify(resultData[itemKey]['sub']));
          } else if (itemKey == 'action_days') {
            this.editDefaultDataOption.interest_action.action_days.sub = JSON.parse(JSON.stringify(resultData[itemKey]['sub']));
          } else if (itemKey == 'action_scene') {
            this.editDefaultDataOption.interest_action.action_scene.sub = JSON.parse(JSON.stringify(resultData[itemKey]['sub']));
          } else {

            if (resultData[itemKey].form_type == 'radio' || resultData[itemKey].form_type == 'select') {
              const rangData = resultData[itemKey];
              if (isArray(rangData['sub']) && rangData['sub'].length > 0) {
                rangData['resultValue'] = rangData['sub'][0]['value'];
              }

            } else if (resultData[itemKey].form_type == 'checkbox') {
              resultData[itemKey]['NOLIMIT'] = true;

            } else if (resultData[itemKey].form_type == 'range') {
              const rangData = resultData[itemKey];
              // rangData.rangeValue = this.generateRangeData(itemKey, rangData.rangeStart, rangData.rangeEnd, rangData.range_options, rangData.suffix, rangData.endLess);

            } else if (resultData[itemKey].form_type == 'checkbox_tree') {
              resultData[itemKey]['resultList'] = [];
              resultData[itemKey]['getParentKey'] = itemKey != 'working_status';
            }

            this.editDefaultDataOption[itemKey] = resultData[itemKey];
          }
        });
        this.editDefaultDataOptionBak = JSON.parse(JSON.stringify(this.editDefaultDataOption));

        this.initSingleData(this.targetSource.audience_setting);
        this.isInitFinshed = true;

      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else if (result['status_code'] && result.status_code === 205) {
      } else {
        this.message.error(result.message);
      }
    }, (err) => {

    });
  }

  initSingleData(audienceData) {

    // this.editDefaultDataOption = JSON.parse(JSON.stringify(this.editDefaultDataOptionBak));
    // setTimeout(() => {
    Object.keys(this.editDefaultDataOption).forEach(item => {

      const currentAudienceData = audienceData[item];
      const currentAudienceConfig = this.editDefaultDataOption[item];

      if (currentAudienceConfig['form_type'] == 'district_radio') {
        if (currentAudienceData !== undefined) {
          currentAudienceConfig['radioValue'] = audienceData['district'];
          if (audienceData['district'] == 'CITY') {
            currentAudienceConfig['combine_data']['CITY']['resultList'] = audienceData['city'];
          } else if (audienceData['district'] == 'COUNTY') {
            currentAudienceConfig['combine_data']['COUNTY']['resultList'] = audienceData['county'];
          } else if (audienceData['district'] == 'BUSINESS_DISTRICT') {
            currentAudienceConfig['combine_data']['BUSINESS_DISTRICT']['resultList'] = audienceData['business_ids'];
          }

          if (audienceData['location_type']) {
            currentAudienceConfig['location_type']['radioValue'] = audienceData['location_type'];
          }
        }

      } else if (currentAudienceConfig['form_type'] == 'interest_action') {
        if (audienceData['interest_action_mode']) {
          currentAudienceConfig['resultValue'] = audienceData['interest_action_mode'];
        }

        if (audienceData['action_days']) {
          currentAudienceConfig['action_days']['resultValue'] = audienceData['action_days'];
        }

        if (audienceData['action_scene']) {
          currentAudienceConfig['action_scene']['resultList'] = audienceData['action_scene'];
        }

        if (audienceData['interest_categories']) {
          currentAudienceConfig.combine_data['interest']['resultList'] = audienceData['interest_categories'];
        }

        if (audienceData['action_categories']) {
          currentAudienceConfig.combine_data['action']['resultList'] = audienceData['action_categories'];
        }

      } else if (item == 'app_behavior_target') {
        if (currentAudienceData !== undefined) {
          if (currentAudienceData === "CATEGORY") {
            currentAudienceConfig['radioValue'] = 'CATEGORY';
            currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['app_category']];
          } else {
            currentAudienceConfig['radioValue'] = 'NONE';
          }

        }


      } else if (item == 'ad_tag') {
        if (currentAudienceData !== undefined && isArray(currentAudienceData)) {
          if (currentAudienceData.length < 1) {
            currentAudienceConfig['radioValue'] = 'NONE';
          } else if (currentAudienceData.length == 1 && currentAudienceData[0] == 0) {
            currentAudienceConfig['radioValue'] = 'SYSTEM';
          } else {
            currentAudienceConfig['radioValue'] = 'ad_tag';
            currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['ad_tag']];
          }
        }


      } else if (item == 'auto_extend_enabled') {
        if (currentAudienceData !== undefined) {
          if (currentAudienceData !== 1) {
            currentAudienceConfig['radioValue'] = 'NONE';
          } else {
            currentAudienceConfig['radioValue'] = 'auto_extend_targets';
            currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['auto_extend_targets']];
          }

        }


      } else if (item == 'device_brand') {
        if (currentAudienceData !== undefined) {
          if (isArray(audienceData['device_brand']) && audienceData['device_brand'].length > 0) {
            currentAudienceConfig['radioValue'] = 'brand';
            currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['device_brand']];
          }
        }


      } else if (item == 'article_category') {
        if (currentAudienceData !== undefined) {
          if (isArray(audienceData['article_category']) && audienceData['article_category'].length > 0) {
            currentAudienceConfig['radioValue'] = 'article';
            currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['article_category']];
          }
        }

      } else if (item == 'aweme_fan_categories') {
        if (currentAudienceData !== undefined) {
          if (isArray(audienceData['aweme_fan_categories']) && audienceData['aweme_fan_categories'].length > 0) {
            currentAudienceConfig['radioValue'] = 'aweme_fan';
            currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['aweme_fan_categories']];
          }

          if (audienceData['aweme_fan_behaviors']) {
            currentAudienceConfig['aweme_fan_behaviors'].sub.forEach(subItem => {
              if (audienceData['aweme_fan_behaviors'].indexOf(subItem['value']) > -1) {
                subItem['checked'] = true;
              }
            });
          }
        }

      } else if (item == 'launch_price') {
        if (currentAudienceData !== undefined && isArray(currentAudienceData) && currentAudienceData.length > 0) {

          currentAudienceConfig['radioValue'] = 'price';
          currentAudienceConfig['priceResult'] = [...currentAudienceData];
        }
      } else if (currentAudienceConfig['form_type'] == 'targeting_audience') {
        const customAudienceData = audienceData['retargeting_tags_include'];
        const excludeCustomAudienceData = audienceData['retargeting_tags_exclude'];


        if (customAudienceData !== undefined && isArray(customAudienceData)) {
          this.editDefaultDataOption.targeting_audience.combine_data.crowdResultList = [...customAudienceData.map((resultItem) => resultItem + "")];
          if (customAudienceData.length > 0) {
            currentAudienceConfig['radioValue'] = 'custom_audience';
          }
        }
        if (excludeCustomAudienceData !== undefined && isArray(excludeCustomAudienceData)) {
          this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdResultList = [...excludeCustomAudienceData.map((resultItem) => resultItem + "")];
          if (excludeCustomAudienceData.length > 0) {
            currentAudienceConfig['radioValue'] = 'custom_audience';
          }
        }



        // -- 互斥
        this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdList.forEach(item => {
          item['disabled'] = this.editDefaultDataOption.targeting_audience.combine_data.crowdResultList.indexOf(item.key) > -1;
        });
        this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdList = [...this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdList];

        // -- 互斥
        this.editDefaultDataOption.targeting_audience.combine_data.crowdList.forEach(item => {
          item['disabled'] = this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdResultList.indexOf(item.key) > -1;
        });
        this.editDefaultDataOption.targeting_audience.combine_data.crowdList = [...this.editDefaultDataOption.targeting_audience.combine_data.crowdList];



      } else if (currentAudienceData !== undefined) {
        if (currentAudienceConfig['form_type'] == "range") {
          if (isArray(currentAudienceData) && currentAudienceData.length > 0) {
            currentAudienceConfig['rangeStartResult'] = currentAudienceData[0]["min"];
            currentAudienceConfig['rangeEndResult'] = currentAudienceData[0]["max"];
          }

        } else if (currentAudienceConfig['form_type'] == 'checkbox') {
          currentAudienceConfig.sub.forEach(subItem => {
            if (currentAudienceData.indexOf(subItem['value']) > -1) {
              subItem['checked'] = true;
              currentAudienceConfig['NOLIMIT'] = false;
            }
          });
        } else if (currentAudienceConfig['form_type'] == 'radio') {
          currentAudienceConfig['resultValue'] = currentAudienceData;
          if (item == 'auto_extend_enabled') {
            currentAudienceConfig['resultValue'] = '' + currentAudienceData;
          }
        } else if (currentAudienceConfig['form_type'] == 'select') {
          currentAudienceConfig['resultValue'] = currentAudienceData;
        } else if (currentAudienceConfig['form_type'] == 'checkbox_tree') {
          if (isArray(currentAudienceData) && currentAudienceData.length > 0) {
            currentAudienceConfig['resultList'] = [...currentAudienceData.map((resultItem) => resultItem + "")];
          }
        }
      }
    });

    this.updateSingleChecked('platform');
    this.changeCurGroupFlag();


    const setting = this.generateResultData();
    this.targetSource.audience_setting = { ...setting };
    this.isInitSingleDataFinshed = true;


    // }, 0);
  }

  changeCurGroupFlag() {
    if (this.curGroupFlag.indexOf('1_') !== -1) {
      if (this.editDefaultDataOption['platform']) {
        this.editDefaultDataOption['platform']["NOLIMIT"] = false;
        this.editDefaultDataOption['platform']['disabled_nolimit'] = true;
        this.editDefaultDataOption['platform'].sub.forEach(item => {
          item["checked"] = false;
          item['disabled'] = true;
          if (item.value === 'ANDROID') {
            item["checked"] = true;
            // item['disabled'] = false;
          }
        });
      }

    } else if (this.curGroupFlag.indexOf('2_') !== -1) {
      if (this.editDefaultDataOption['platform']) {
        this.editDefaultDataOption['platform']["NOLIMIT"] = false;
        this.editDefaultDataOption['platform']['disabled_nolimit'] = true;
        this.editDefaultDataOption['platform'].sub.forEach(item => {
          item["checked"] = false;
          item['disabled'] = true;
          if (item.value === 'IOS') {
            item["checked"] = true;
            // item['disabled'] = false;
          }
        });
      }
    } else {
      if (this.editDefaultDataOption['platform']) {
        this.editDefaultDataOption['platform']['disabled_nolimit'] = false;
        this.editDefaultDataOption['platform'].sub.forEach(item => {
          item['disabled'] = false;
        });
      }
    }
  }


  updateNotLimit(slot, key) {
    setTimeout(() => {
      slot["NOLIMIT"] = true;
      if (slot.hasOwnProperty('sub') && isArray(slot['sub'])) {
        slot['sub'].forEach(item => {
          item["checked"] = false;
        });
        if (key == 'platform') {
          this.editDefaultDataOption.app_behavior_target.platformLimit = false;

          this.editDefaultDataOption.app_behavior_target.isShow = true;
          this.editDefaultDataOption.device_brand.isShow = true;

          this.editDefaultDataOption.device_brand.radioValue = 'NONE';
          this.editDefaultDataOption.device_brand.combine_data.one_extra.sub = [];
          this.editDefaultDataOption.device_brand.combine_data.one_extra.sub = [...this.deviceBrandList];
        }
      }
    });

  }

  updateSingleChecked(itemKey, curItem?): void {
    if (itemKey !== 'aweme_fan_categories') {

      if (itemKey === 'platform') {
        this.platFormChecked = [];

        if (curItem) {
          if (curItem === 'PC') {
            this.editDefaultDataOption[itemKey].sub.forEach(item => {
              if (item.value !== 'PC') {
                item.checked = false;
              }

              if (item.checked) {
                this.platFormChecked.push(item.value);
              }
            });
          } else {
            this.editDefaultDataOption[itemKey].sub.forEach(item => {
              if (item.value === 'PC') {
                item.checked = false;
              }

              if (item.checked) {
                this.platFormChecked.push(item.value);
              }
            });
          }

          if (this.platFormChecked.length === 1 && this.platFormChecked[0] === 'IOS') {
            this.editDefaultDataOption.app_behavior_target.radioValue = 'NONE';
            this.editDefaultDataOption.app_behavior_target.isShow = false;
            this.editDefaultDataOption.app_behavior_target.combine_data.one_extra.resultList = [];
          } else {
            this.editDefaultDataOption.app_behavior_target.isShow = true;
          }

          this.editDefaultDataOption.device_brand.combine_data.one_extra.resultList = [];
          this.editDefaultDataOption.device_brand.isShow = this.platFormChecked.length === 1 && (this.platFormChecked[0] === 'IOS' || this.platFormChecked[0] === 'PC') ? false : true;

          if (this.platFormChecked.length === 2) {
            this.editDefaultDataOption.device_brand.radioValue = 'NONE';
            this.editDefaultDataOption.device_brand.combine_data.one_extra.sub = [];
            this.editDefaultDataOption.device_brand.combine_data.one_extra.sub = [...this.deviceBrandList];
          } else if (this.platFormChecked.length === 1 && this.platFormChecked[0] === 'ANDROID') {
            this.editDefaultDataOption.device_brand.radioValue = 'NONE';
            this.editDefaultDataOption.device_brand.combine_data.one_extra.sub = [];
            this.editDefaultDataOption.device_brand.combine_data.one_extra.sub = [...this.deviceBrandAndroidList];
          }
        }
      }

      this.editDefaultDataOption[itemKey]["NOLIMIT"] = false;

      this.editDefaultDataOption[itemKey]["NOLIMIT"] = this.editDefaultDataOption[itemKey].sub.every(item => !item.checked);

    } else {
      const isChecked = this.editDefaultDataOption[itemKey].aweme_fan_behaviors.sub.every(item => !item.checked);
      if (isChecked) {
        setTimeout(() => {
          this.editDefaultDataOption[itemKey].aweme_fan_behaviors.sub[0].checked = true;
        }, 0);
      }
    }


  }

  treeCrowdOnCheck(event: NzFormatEmitEvent): void {
    this.editDefaultDataOption.targeting_audience.combine_data.crowdResultList = [...event.keys];

    this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdList.forEach(item => {
      item['disabled'] = event.keys.indexOf(item.key) > -1;
    });

    this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdList = [...this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdList];

  }

  treeExcludeCrowdOnCheck(event: NzFormatEmitEvent): void {
    this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdResultList = [...event.keys];

    this.editDefaultDataOption.targeting_audience.combine_data.crowdList.forEach(item => {
      item['disabled'] = event.keys.indexOf(item.key) > -1;
    });
    this.editDefaultDataOption.targeting_audience.combine_data.crowdList = [...this.editDefaultDataOption.targeting_audience.combine_data.crowdList];

  }

  transferTreeChange(sourceData, data: any[]) {
    sourceData['resultList'] = [...data];

  }

  generateResultData() {
    const resultData = {};

    this.launchTemplateGroupData[this.curGroupFlag].forEach(item => {
      const currentItemObj = this.editDefaultDataOption[item];
      if (currentItemObj !== undefined && currentItemObj["form_type"] == 'checkbox') {
        const tmpValue = [];
        currentItemObj.sub.forEach(subItem => {
          if (subItem.checked) {
            tmpValue.push(subItem.value);
          }
        });
        resultData[item] = [...tmpValue];

      } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'radio') {
        if (currentItemObj['resultValue'] !== undefined) {
          resultData[item] = currentItemObj['resultValue'];
        }

      } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'select') {
        if (currentItemObj['resultValue'] !== undefined) {
          resultData[item] = currentItemObj['resultValue'];
        }

      } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'range') {
        const tmpValue = {};
        tmpValue['min'] = currentItemObj['rangeStartResult'];
        tmpValue['max'] = currentItemObj['rangeEndResult'];

        resultData[item] = [tmpValue];

      } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'checkbox_tree') {
        if (isArray(currentItemObj['resultList']) && currentItemObj['resultList'].length > 0) {
          resultData[item] = [...currentItemObj['resultList']];
        }

      } else if (currentItemObj !== undefined && (currentItemObj["form_type"] == 'one_extra_radio' || currentItemObj["form_type"] == 'app_behavior_target_radio')) {
        if (item == 'ad_tag') {
          if (currentItemObj['radioValue'] == 'SYSTEM') {
            resultData[item] = [0];
          } else if (currentItemObj['radioValue'] == 'ad_tag') {
            resultData[item] = currentItemObj['combine_data']['one_extra']['resultList'];
          }
        } else if (item == 'app_behavior_target') {
          if (currentItemObj['radioValue'] == 'CATEGORY') {
            resultData[item] = 'CATEGORY';
            resultData['app_category'] = [];
            resultData['app_category'] = currentItemObj['combine_data']['one_extra']['resultList'];
          }
        } else if (item == 'auto_extend_enabled') {
          resultData[item] = 0;
          resultData['auto_extend_targets'] = [];
          if (currentItemObj['radioValue'] == 'auto_extend_targets') {
            resultData[item] = 1;
            resultData['auto_extend_targets'] = currentItemObj['combine_data']['one_extra']['resultList'];
          } else {
            resultData[item] = 0;
          }
        } else {
          resultData[item] = [];
          if (currentItemObj['radioValue'] !== 'NONE') {
            resultData[item] = currentItemObj['combine_data']['one_extra']['resultList'];
          }
        }

      } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'device_brand_radio') {
        resultData[item] = [];
        if (currentItemObj['radioValue'] !== 'NONE') {
          resultData[item] = currentItemObj['combine_data']['one_extra']['resultList'];
        }
      } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'aweme_fan_radio') {
        resultData[item] = [];
        if (currentItemObj['radioValue'] !== 'NONE') {
          resultData[item] = currentItemObj['combine_data']['one_extra']['resultList'];
        }

        const tmpValue = [];
        currentItemObj['aweme_fan_behaviors'].sub.forEach(subItem => {
          if (subItem.checked) {
            tmpValue.push(subItem.value);
          }
        });
        resultData['aweme_fan_behaviors'] = [...tmpValue];

      } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'district_radio') {
        resultData[item] = currentItemObj['radioValue'];
        if (currentItemObj['radioValue'] == 'CITY') {
          resultData['city'] = currentItemObj['combine_data']['CITY']['resultList'];
        } else if (currentItemObj['radioValue'] == 'COUNTY') {
          resultData['county'] = currentItemObj['combine_data']['COUNTY']['resultList'];
        } else if (currentItemObj['radioValue'] == 'BUSINESS_DISTRICT') {
          resultData['business_ids'] = currentItemObj['combine_data']['BUSINESS_DISTRICT']['resultList'];
        }

        resultData['location_type'] = currentItemObj['location_type'].radioValue;

      } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'launch_price_radio') {
        resultData[item] = [];
        if (currentItemObj['radioValue'] == 'price') {
          resultData[item] = [...currentItemObj['priceResult']];
        }


      } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'targeting_audience') {

        const customAudience = [...this.editDefaultDataOption.targeting_audience.combine_data.crowdResultList];
        const excludeCustomAudience = [...this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdResultList];

        resultData['retargeting_tags_include'] = customAudience;
        resultData['retargeting_tags_exclude'] = excludeCustomAudience;
      } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'interest_action') {
        if (currentItemObj['resultValue'] !== undefined) {
          resultData['interest_action_mode'] = currentItemObj['resultValue'];
        }

        if (currentItemObj['resultValue'] === 'CUSTOM') {
          if (this.editDefaultDataOption.interest_action.action_days.resultValue !== undefined) {
            resultData['action_days'] = this.editDefaultDataOption.interest_action.action_days['resultValue'];
          }

          resultData['action_scene'] = [...this.editDefaultDataOption.interest_action.action_scene.resultList];

          const actionResultList = [...this.editDefaultDataOption.interest_action.combine_data.action.resultList];
          const interestResultList = [...this.editDefaultDataOption.interest_action.combine_data.interest.resultList];

          resultData['action_categories'] = actionResultList;
          resultData['interest_categories'] = interestResultList;
        } else {
          resultData['action_days'] = 30;
          resultData['action_scene'] = [];
          resultData['action_categories'] = [];
          resultData['interest_categories'] = [];
        }
      }
    });

    return resultData;

  }

}
