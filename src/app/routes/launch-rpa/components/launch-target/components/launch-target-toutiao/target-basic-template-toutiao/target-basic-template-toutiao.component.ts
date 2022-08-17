import { AfterViewChecked, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DataViewService } from "../../../../../../data-view-feed/service/data-view.service";
import { isArray } from "@jzl/jzl-util";
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LaunchService } from "../../../../../../../module/launch/service/launch.service";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { deepCopy } from "@jzl/jzl-util";
import { GlobalTemplateComponent } from "../../../../../../../shared/template/global-template/global-template.component";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { MenuService } from "../../../../../../../core/service/menu.service";


@Component({
  selector: 'app-target-basic-template-toutiao',
  templateUrl: './target-basic-template-toutiao.component.html',
  styleUrls: ['./target-basic-template-toutiao.component.scss']
})
export class TargetBasicTemplateToutiaoComponent implements OnInit, OnChanges, AfterViewChecked {
  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  @Input() landing_type;
  @Input() targetSource;
  @Input() isLaunchPackage;
  @Input() curAudienceData;
  @Input() targetType;

  public byteDanceConfigList;

  public chan_pub_id = 0;

  public searchCrowdValue='';
  public searchExcludeValue='';

  public editDefaultDataOption = {
    targeting_audience: {
      "name": "自定义人群",
      "resultValue": "NONE",
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
    district: {
      resultValue: 'NONE',
      sub: [
        {
          label: "不限",
          value: "NONE",
          checked: false
        },
        {
          label: "按省市",
          value: "CITY",
          checked: false
        },
        {
          label: "按区县",
          value: "COUNTY",
          checked: false
        },
        {
          label: "按商圈",
          value: "BUSINESS_DISTRICT",
          checked: false
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
        resultValue: "HOME",
        sub: [
          {
            value: "CURRENT",
            label: "正在该地区的用户",
            tips: "正在该地区的用户",
          },
          {
            value: "HOME",
            label: "居住在该地区的用户",
            tips: "居住在该地区的用户",
          },
          {
            value: "TRAVEL",
            label: "到该地区旅行的用户",
            tips: "到该地区旅行的用户",
          },
          {
            value: "ALL",
            label: "该地区内的所有用户",
            tips: "该地区内的所有用户",
          }
        ],
      },
      result_data: [],
    },
    gender: "NONE",
    hide_if_converted: "NO_EXCLUDE",
    age: {
      NOLIMIT: true,
      disabled: false,
      resultList: [],
    },
    ac: {
      NOLIMIT: true,
      disabled: false,
      resultList: [],
    },
    // app_behavior_target: {
    //   "name": "App行为",
    //   "resultValue": "NONE",
    //   "sub": [
    //     {
    //       "label": "不限",
    //       "value": "NONE",
    //       "checked": false
    //     },
    //     {
    //       "label": "按分类",
    //       "value": "CATEGORY",
    //       "checked": false
    //     },
    //   ],
    //   combine_data: {
    //     relation: 'CATEGORY',
    //     sub: [],
    //     resultList: []
    //   }
    // },
    ad_tag: {
      "name": "兴趣定向",
      "form_type": "one_extra_radio",
      "resultValue": "NONE",
      "suffix": "",
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
        relation: 'ad_tag',
        sub: [],
        resultList: []
      }
    },
    interest_action: {
      name: "行为兴趣",
      resultValue: "UNLIMITED",
      sub: [
        {
          label: "不限",
          value: "UNLIMITED",
          checked: false
        },
        {
          label: "系统推荐",
          value: "RECOMMEND",
          checked: false
        },
        {
          label: "自定义",
          value: "CUSTOM",
          checked: false
        },
      ],
      combine_data: {
        action: {
          sub: [],
          resultList: [],
        },
        interest: {
          sub: [],
          resultList: [],
        }
      },
      action_days: {
        resultValue: 30,
        sub: [],
      },
      action_scene: {
        resultList: [],
        sub: [],
      }
    },
    // superior_popularity_type: "NONE",
    device_brand: {
      "name": "手机品牌",
      "resultValue": "NONE",
      isShow: true,
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
        relation: "brand",
        sub: [],
        resultList: []
      }
    },
    auto_extend_enabled: {
      name: "智能放量",
      "resultValue": "NONE",
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
        sub: [],
        resultList: []
      }
    },
    article_category: {
      "name": "文章分类",
      "resultValue": "NONE",
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
        relation: "article",
        sub: [],
        resultList: []
      }
    },
    aweme_fan_categories: {
      name: "抖音达人",
      resultValue: "NONE",
      sub: [
        {
          label: "不限",
          value: "NONE",
          checked: false
        },
        {
          label: "自定义",
          value: "aweme_fan",
          checked: false
        },
      ],
      combine_data: {
        relation: "aweme_fan",
        sub: [],
        resultList: []
      },
      aweme_fan_behaviors: {
        name: "抖音用户行为类型",
        sub: [
          {
            value: "FOLLOWED_USER",
            label: "已关注用户",
            checked: true,
          },
          {
            value: "COMMENTED_USER",
            label: "15天内已评论用户",
            checked: false,
          },
          {
            value: "LIKED_USER",
            label: "15天内已点赞用户",
            checked: false,
          },
          {
            value: "SHARED_USER",
            label: "15天内已分享用户",
            checked: false,
          }
        ],
      }
    },
    platform: {
      NOLIMIT: true,
      disabled: false,
      resultList: [],
    },
    carrier: {
      NOLIMIT: true,
      disabled: false,
      resultList: [],
    },
    activate_type: {
      NOLIMIT: true,
      disabled: false,
      resultList: [],
    },
    launch_price: {
      "name": "手机价格",
      "resultValue": "NONE",
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
      priceMark: {},
      priceResult: [0, 11000],
    },
    device_type: {
      NOLIMIT: true,
      disabled: false,
      resultList: [],
    },
    // hide_if_exists: 0,
    android_osv: '0.0',
    ios_osv: '0.0',
  };

  public platFormChecked = [];

  public deviceBrandAndroidList = [];
  public deviceBrandList = [];

  public cid;

  public isInitSingleDataFinshed = false;

  public accountsList = [];

  public accounts = [];

  public curAccountsList = [];

  public isDeviceBrand = true;

  public curTargetSource;

  constructor(private message: NzMessageService, private dataViewService: DataViewService, private launchService: LaunchService, private authService: AuthService, public launchRpaService: LaunchRpaService, public menuService: MenuService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.curTargetSource = deepCopy(this.targetSource);
    this.getAccountList();
    this.getByteDanceTargetConfig();
  }

  ngAfterViewChecked() {
    if (this.isInitSingleDataFinshed) {
      const setting = this.generateResultData();
      this.targetSource.audience_setting = { ...setting };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.byteDanceConfigList && changes['landing_type']) {
      this.landingTypeChange();
      this.initConfigList();
      if (this.landing_type === 'ANDROID') {
        this.editDefaultDataOption.device_brand.combine_data.sub = this.byteDanceConfigList.device_brand_android.sub;
      } else {
        this.editDefaultDataOption.device_brand.combine_data.sub = this.byteDanceConfigList.device_brand.sub;
      }
      if (this.landing_type === 'EXTERNAL'||this.landing_type === 'QUICK_APP') {
        // 过滤已转化用户 hide_if_converted
        if (this.editDefaultDataOption['hide_if_converted'] && this.editDefaultDataOption['hide_if_converted'] === 'App') {
          this.editDefaultDataOption['hide_if_converted'] = this.byteDanceConfigList['hide_if_converted']['sub'][0]['value'];
        }
      }
    }
  }

  getAccountList() {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": this.menuService.currentPublisherId
        },
        {
          "key": "channel_id",
          "name": "",
          "op": "=",
          "value": "2"
        },
        {
          "key": "account_status",
          "name": "",
          "op": ">",
          "value": -1
        },
      ]
    };
    this.launchRpaService.getAccountList(body, {
      page: 1,
      count: 100000,
      cid: this.authService.getCurrentUserOperdInfo().select_cid,
      user_id: this.authService.getCurrentUserOperdInfo().select_uid,
    })
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            this.accountsList = results['data']['detail'];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  changeAccount(ids) {
    if (ids.length > 0) {
      ids.forEach((item, index) => {
        const data = this.accountsList.find(value => value.chan_pub_id === item);
        if (data && !this.curAccountsList.find(s_item => s_item.id === item)) {
          this.curAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, crowdResultList: [], excludeCrowdResultList: [] });
          this.getByteDanceTargetAudience(this.curAccountsList[index]);
        }
      });

      this.curAccountsList.forEach((item, index) => {
        const data = ids.find(value => value === item.id);
        if (!data) {
          this.curAccountsList.splice(index, 1);
        }
      });
    } else {
      this.curAccountsList = [];
    }

  }

  getByteDanceTargetConfig() {
    const getByteDanceConfig = this.dataViewService.getByteDanceTargetConfig(this.chan_pub_id);
    getByteDanceConfig.subscribe(result => {
      this.byteDanceConfigList = result.data;
      this.initConfigList();
      // this.landingTypeChange();
    });
  }

  getByteDanceTargetAudience(value) {
    const getByteDanceTargetAudience = this.launchService.getByteDanceTargetAudience({
      chan_pub_id: value.id,
      cid: this.cid,
    });
    getByteDanceTargetAudience.subscribe(result => {
      // this.editDefaultDataOption.targeting_audience.combine_data.crowdList = deepCopy(result['data']['customtList']);
      // this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdList = deepCopy(result['data']['customtList']);
      value.crowdList = deepCopy(result['data']['customtList']);
      value.excludeCrowdList = deepCopy(result['data']['customtList']);
      value.crowdResultList = deepCopy(value.crowdResultList);
      value.excludeCrowdResultList = deepCopy(value.excludeCrowdResultList);

      // -- 互斥
      value.excludeCrowdList.forEach(list => {
        list['disabled'] = value.crowdResultList.indexOf(list.key) > -1;
      });
      value.excludeCrowdList = [...value.excludeCrowdList];

      // -- 互斥
      value.crowdList.forEach(list => {
        list['disabled'] = value.excludeCrowdResultList.indexOf(list.key) > -1;
      });
      value.crowdList = [...value.crowdList];
    });
  }


  initConfigList() {
    if (this.byteDanceConfigList) {
      this.isInitSingleDataFinshed = false;
      this.editDefaultDataOption.district.combine_data.BUSINESS_DISTRICT.sub = this.byteDanceConfigList.region;
      this.editDefaultDataOption.district.combine_data.CITY.sub = this.byteDanceConfigList.prov_and_city;
      this.editDefaultDataOption.district.combine_data.COUNTY.sub = this.byteDanceConfigList.county;
      this.editDefaultDataOption.interest_action.combine_data.action.sub = this.byteDanceConfigList.action_categories.sub;
      this.editDefaultDataOption.interest_action.combine_data.interest.sub = this.byteDanceConfigList.action_categories.sub;
      this.editDefaultDataOption.interest_action.action_days.sub = this.byteDanceConfigList.action_days.sub;
      this.editDefaultDataOption.interest_action.action_scene.sub = this.byteDanceConfigList.action_scene.sub;
      this.editDefaultDataOption.aweme_fan_categories.combine_data.sub = this.byteDanceConfigList.aweme_fan_categories.sub;
      this.deviceBrandList = this.byteDanceConfigList.device_brand.sub;
      this.deviceBrandAndroidList = this.byteDanceConfigList.device_brand_android.sub;
      this.editDefaultDataOption.launch_price.priceMark = {
        0: "0",
        500: "",
        1000: "",
        1500: "",
        2000: "2000元",
        2500: "",
        3000: "",
        3500: "",
        4000: "",
        5000: "5000元",
        6000: "",
        7000: "",
        8000: "",
        9000: "",
        10000: "1万元",
        11000: ""
      };
      this.editDefaultDataOption.article_category.combine_data.sub = this.byteDanceConfigList.article_category.sub;
      if (this.landing_type === 'ANDROID') {
        this.editDefaultDataOption.device_brand.combine_data.sub = this.byteDanceConfigList.device_brand_android.sub;
      } else {
        this.editDefaultDataOption.device_brand.combine_data.sub = this.byteDanceConfigList.device_brand.sub;
      }
      this.editDefaultDataOption.article_category.combine_data.sub = this.byteDanceConfigList.article_category.sub;
      // this.editDefaultDataOption.app_behavior_target.combine_data.sub = this.byteDanceConfigList.app_category.sub;
      this.editDefaultDataOption.auto_extend_enabled.combine_data.sub = this.byteDanceConfigList.auto_extend_targets.sub;
      this.initSingleData(this.targetSource.audience_setting);
      const setting = this.generateResultData();
      this.targetSource.audience_setting = { ...setting };
      this.isInitSingleDataFinshed = true;
    }
  }

  initSingleData(audienceData) {
    if (Object.keys(audienceData).length) {
      // 人群
      if (Object.keys(audienceData['crowd']).length) {
        this.editDefaultDataOption.targeting_audience['resultValue'] = 'custom_audience';
        for (const item of Object.keys(audienceData['crowd'])) {
          const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
          if (index !== -1 && !this.curAccountsList.find(s_item => s_item.id === item)) {
            this.accounts.push(Number(item));
            const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, crowdResultList: audienceData['crowd'][item]['include'], excludeCrowdResultList: audienceData['crowd'][item]['exclude'] };
            this.curAccountsList.push(obj);
            this.getByteDanceTargetAudience(obj);
          }
        }
      }

      // 地域
      if (audienceData['district'] !== undefined) {
        this.editDefaultDataOption.district['resultValue'] = audienceData['district'];
        if (audienceData['district'] == 'CITY') {
          this.editDefaultDataOption.district['combine_data']['CITY']['resultList'] = audienceData['city'];
        } else if (audienceData['district'] == 'COUNTY') {
          this.editDefaultDataOption.district['combine_data']['COUNTY']['resultList'] = audienceData['county'];
        } else if (audienceData['district'] == 'BUSINESS_DISTRICT') {
          this.editDefaultDataOption.district['combine_data']['BUSINESS_DISTRICT']['resultList'] = audienceData['business_ids'];
        }

        if (audienceData['location_type']) {
          this.editDefaultDataOption.district['location_type']['resultValue'] = audienceData['location_type'];
        }
      }

      // 性别
      this.editDefaultDataOption.gender = audienceData['gender'];

      // 年龄
      this.byteDanceConfigList['age'].sub.forEach(subItem => {
        if (audienceData['age'].indexOf(subItem['value']) > -1) {
          subItem['checked'] = true;
          this.editDefaultDataOption.age['NOLIMIT'] = false;
        }
      });

      // 行为兴趣
      if (audienceData['interest_action_mode']) {
        this.editDefaultDataOption.interest_action['resultValue'] = audienceData['interest_action_mode'];
      }

      if (audienceData['action_days']) {
        this.editDefaultDataOption.interest_action['action_days']['resultValue'] = audienceData['action_days'];
      }

      if (audienceData['action_scene'].length) {
        this.editDefaultDataOption.interest_action['action_scene']['resultList'] = audienceData['action_scene'];
      }

      if (audienceData['interest_categories']) {
        this.editDefaultDataOption.interest_action.combine_data['interest']['resultList'] = audienceData['interest_categories'];
      }

      if (audienceData['action_categories']) {
        this.editDefaultDataOption.interest_action.combine_data['action']['resultList'] = audienceData['action_categories'];
      }

      // 精选流量包
      // this.editDefaultDataOption.superior_popularity_type = audienceData['superior_popularity_type'];

      // 抖音达人
      if (audienceData['aweme_fan_categories'] !== undefined) {
        if (isArray(audienceData['aweme_fan_categories']) && audienceData['aweme_fan_categories'].length > 0) {
          this.editDefaultDataOption.aweme_fan_categories['resultValue'] = 'aweme_fan';
          this.editDefaultDataOption.aweme_fan_categories['combine_data']['resultList'] = [...audienceData['aweme_fan_categories']];
        }

        if (audienceData['aweme_fan_behaviors']) {
          this.editDefaultDataOption.aweme_fan_categories['aweme_fan_behaviors'].sub.forEach(subItem => {
            if (audienceData['aweme_fan_behaviors'].indexOf(subItem['value']) > -1) {
              subItem['checked'] = true;
            }
          });
        }
      }

      // 平台
      this.byteDanceConfigList['platform'].sub.forEach(subItem => {
        if (this.landing_type !== 'EXTERNAL'&&this.landing_type !== 'QUICK_APP'&&this.landing_type !== 'SHOP') {
          this.editDefaultDataOption.platform.NOLIMIT = false;
          if ((this.landing_type === 'ANDROID' && subItem.value === 'ANDROID') || (this.landing_type === 'IOS' && subItem.value === 'IOS')) {
            subItem["checked"] = true;
          }
          subItem['disabled'] = true;
        } else {
          if (audienceData['platform'].indexOf(subItem['value']) > -1) {
            subItem['checked'] = true;
            this.editDefaultDataOption.platform['NOLIMIT'] = false;
          }
        }
      });

      // 设备类型
      this.byteDanceConfigList['device_type'].sub.forEach(subItem => {
        if (audienceData['device_type'].indexOf(subItem['value']) > -1) {
          subItem['checked'] = true;
          this.editDefaultDataOption.device_type['NOLIMIT'] = false;
        }
      });

      // app行为
      // if (audienceData['app_behavior_target'] !== undefined) {
      //   if (audienceData['app_behavior_target'] === "CATEGORY") {
      //     this.editDefaultDataOption.app_behavior_target['resultValue'] = 'CATEGORY';
      //     this.editDefaultDataOption.app_behavior_target['combine_data']['resultList'] = [...audienceData['app_category']];
      //   } else {
      //     this.editDefaultDataOption.app_behavior_target['resultValue'] = 'NONE';
      //   }
      // }

      // 文章分类
      if (audienceData['article_category'] !== undefined) {
        if (isArray(audienceData['article_category']) && audienceData['article_category'].length > 0) {
          this.editDefaultDataOption.article_category['resultValue'] = 'article';
          this.editDefaultDataOption.article_category['combine_data']['resultList'] = [...audienceData['article_category']];
        }
      }

      // 网络类型
      this.byteDanceConfigList['ac'].sub.forEach(subItem => {
        if (audienceData['ac'].indexOf(subItem['value']) > -1) {
          subItem['checked'] = true;
          this.editDefaultDataOption.ac['NOLIMIT'] = false;
        }
      });

      // 过滤已转化用户
      this.editDefaultDataOption.hide_if_converted = audienceData['hide_if_converted'];

      // 过滤已安装
      // this.editDefaultDataOption.hide_if_exists = audienceData['hide_if_exists'];

      // 最低android版本
      this.editDefaultDataOption.android_osv = audienceData['android_osv'];
      this.editDefaultDataOption.ios_osv = audienceData['ios_osv'];

      // 运营商
      this.byteDanceConfigList['carrier'].sub.forEach(subItem => {
        if (audienceData['carrier'].indexOf(subItem['value']) > -1) {
          subItem['checked'] = true;
          this.editDefaultDataOption.carrier['NOLIMIT'] = false;
        }
      });

      // 新用户
      this.byteDanceConfigList['activate_type'].sub.forEach(subItem => {
        if (audienceData['activate_type'].indexOf(subItem['value']) > -1) {
          subItem['checked'] = true;
          this.editDefaultDataOption.activate_type['NOLIMIT'] = false;
        }
      });

      // 手机品牌
      if (audienceData['device_brand'] !== undefined) {
        if (isArray(audienceData['device_brand']) && audienceData['device_brand'].length > 0) {
          this.editDefaultDataOption.device_brand['resultValue'] = 'brand';
          this.editDefaultDataOption.device_brand['combine_data']['resultList'] = [...audienceData['device_brand']];
        }
      }

      // 手机价格
      if (audienceData['launch_price'] !== undefined && isArray(audienceData['launch_price']) && audienceData['launch_price'].length > 0) {
        this.editDefaultDataOption.launch_price['resultValue'] = 'price';
        this.editDefaultDataOption.launch_price['priceResult'] = [...audienceData['launch_price']];
      }

      // 智能放量
      if (audienceData['auto_extend_enabled'] !== undefined) {
        if (audienceData['auto_extend_enabled'] !== 1) {
          this.editDefaultDataOption.auto_extend_enabled['resultValue'] = 'NONE';
        } else {
          this.editDefaultDataOption.auto_extend_enabled['resultValue'] = 'auto_extend_targets';
          this.editDefaultDataOption.auto_extend_enabled['combine_data']['resultList'] = [...audienceData['auto_extend_targets']];
        }
      }
      if (this.isLaunchPackage) {
        if (Object.keys(this.targetSource.target_setting).length) {
          this.getDisabled(this.targetSource.target_setting);
        } else {
          this.getDisabled(audienceData);
        }
      }
    }
    this.getExtendDisabled();
  }

  getDisabled(audienceData) {
    // 人群
    const customAudienceData = audienceData['retargeting_tags_include'];
    const excludeCustomAudienceData = audienceData['retargeting_tags_exclude'];
    this.editDefaultDataOption.targeting_audience.sub.forEach(item => {
      item['disabled'] = false;
      if ((customAudienceData && customAudienceData.length > 0) || (excludeCustomAudienceData && excludeCustomAudienceData.length > 0)) {
        if (item.value === 'NONE') {
          item['disabled'] = true;
        }
      }
    });

    // 地域
    this.editDefaultDataOption.district.sub.forEach(item => {
      item['disabled'] = audienceData['district'] !== 'NONE' && item.value !== audienceData['district'];
    });

    // 性别
    this.byteDanceConfigList['gender']['sub'].forEach(item => {
      item['disabled'] = audienceData['gender'] !== 'NONE' && item.value !== audienceData['gender'];
    });

    // 年龄
    if (audienceData['age'].length > 0) {
      this.byteDanceConfigList['age'].sub.forEach(subItem => {
        if (audienceData['age'].indexOf(subItem['value']) > -1) {
          this.editDefaultDataOption.age['disabled'] = true;
        } else {
          subItem['disabled'] = true;
        }
      });
    }

    // 行为兴趣
    this.editDefaultDataOption.interest_action.sub.forEach(item => {
      item['disabled'] = audienceData['interest_action_mode'] !== 'UNLIMITED' && item.value !== audienceData['interest_action_mode'];
    });

    // 精选流量包
    // this.byteDanceConfigList['superior_popularity_type']['sub'].forEach(item => {
    //   item['disabled'] = audienceData['superior_popularity_type'] !== 'NONE' && item.value !== audienceData['superior_popularity_type'];
    // });

    // 抖音达人
    this.editDefaultDataOption['aweme_fan_categories'].sub.forEach(item => {
      item['disabled'] = audienceData['aweme_fan_categories'].length > 0 && item.value !== 'aweme_fan';
    });
    if (audienceData['aweme_fan_categories'] !== undefined) {
      if (audienceData['aweme_fan_behaviors']) {
        this.editDefaultDataOption.aweme_fan_categories['aweme_fan_behaviors'].sub.forEach(subItem => {
          if (audienceData['aweme_fan_behaviors'].indexOf(subItem['value']) <= -1) {
            subItem['disabled'] = true;
          }
        });
      }
    }

    // 平台
    this.byteDanceConfigList['platform'].sub.forEach(subItem => {
      if (audienceData['platform'].indexOf(subItem['value']) > -1) {
        this.editDefaultDataOption.platform['disabled'] = true;
      } else {
        subItem['disabled'] = true;
      }
    });

    // 设备类型
    if (audienceData['device_type'].length > 0) {
      this.byteDanceConfigList['device_type'].sub.forEach(subItem => {
        if (audienceData['device_type'].indexOf(subItem['value']) > -1) {
          this.editDefaultDataOption.device_type['disabled'] = true;
        } else {
          subItem['disabled'] = true;
        }
      });
    }

    // app行为
    // this.editDefaultDataOption['app_behavior_target'].sub.forEach(item => {
    //   item['disabled'] = audienceData['app_category'].length > 0 && item.value !== 'CATEGORY';
    // });

    // 文章分类
    this.editDefaultDataOption['article_category'].sub.forEach(item => {
      item['disabled'] = audienceData['article_category'].length > 0 && item.value !== 'article';
    });

    // 网络类型
    if (audienceData['ac'].length > 0) {
      this.byteDanceConfigList['ac'].sub.forEach(subItem => {
        if (audienceData['ac'].indexOf(subItem['value']) > -1) {
          this.editDefaultDataOption.ac['disabled'] = true;
        } else {
          subItem['disabled'] = true;
        }
      });
    }

    // 过滤已转化用户
    this.byteDanceConfigList['hide_if_converted']['sub'].forEach(item => {
      item['disabled'] = audienceData['hide_if_converted'] !== 'NO_EXCLUDE' && item.value !== audienceData['hide_if_converted'];
    });

    // 过滤已安装
    // this.byteDanceConfigList['hide_if_exists']['sub'].forEach(item => {
    //   item['disabled'] = audienceData['hide_if_exists'] !== 'NONE' && item.value !== audienceData['hide_if_exists'];
    // });

    // 运营商
    if (audienceData['carrier'].length > 0) {
      this.byteDanceConfigList['carrier'].sub.forEach(subItem => {
        if (audienceData['carrier'].indexOf(subItem['value']) > -1) {
          this.editDefaultDataOption.carrier['disabled'] = true;
        } else {
          subItem['disabled'] = true;
        }
      });
    }

    // 新用户
    if (audienceData['activate_type'].length > 0) {
      this.byteDanceConfigList['activate_type'].sub.forEach(subItem => {
        if (audienceData['activate_type'].indexOf(subItem['value']) > -1) {
          this.editDefaultDataOption.activate_type['disabled'] = true;
        } else {
          subItem['disabled'] = true;
        }
      });
    }

    // 手机品牌
    this.editDefaultDataOption['device_brand'].sub.forEach(item => {
      item['disabled'] = audienceData['device_brand'].length > 0 && item.value !== 'brand';
    });

    // 手机价格
    this.editDefaultDataOption['launch_price'].sub.forEach(item => {
      item['disabled'] = audienceData['launch_price'].length > 0 && item.value !== 'price';
    });
    const maskData = {};
    for (const item in this.editDefaultDataOption.launch_price.priceMark) {
      if (audienceData['launch_price'][0] <= item || audienceData['launch_price'][1] <= item) {
        maskData[item] = this.editDefaultDataOption.launch_price.priceMark[item];
      }
    }
    this.editDefaultDataOption.launch_price.priceMark = maskData;

    // 智能放量
    this.editDefaultDataOption['auto_extend_enabled'].sub.forEach(item => {
      item['disabled'] = audienceData['auto_extend_targets'].length > 0 && item.value !== 'auto_extend_targets';
    });

  }

  transferTreeChange(sourceData, data: any[]) {
    sourceData['resultList'] = [...data];
  }

  landingTypeChange() {
    this.isDeviceBrand = false;

    this.editDefaultDataOption['device_brand'].isShow = this.landing_type !== 'IOS';

    this.byteDanceConfigList['platform'].sub.forEach(item => {
      if (this.landing_type !== 'EXTERNAL'&&this.landing_type !== 'QUICK_APP'&&this.landing_type !== 'SHOP') {
        item["checked"] = false;
        item['disabled'] = true;
        this.editDefaultDataOption.platform.NOLIMIT = false;
        if ((this.landing_type === 'ANDROID' && item.value === 'ANDROID') || (this.landing_type === 'IOS' && item.value === 'IOS')) {
          item["checked"] = true;
        }
      } else {
        this.editDefaultDataOption.platform.NOLIMIT = true;
        item["checked"] = false;
        item['disabled'] = false;
      }
    });
    setTimeout(() => {
      this.isDeviceBrand = true;
    });
  }

  updateNotLimit(slot, key) {
    setTimeout(() => {
      this.editDefaultDataOption[key]["NOLIMIT"] = true;
      if (slot.hasOwnProperty('sub') && isArray(slot['sub'])) {
        slot['sub'].forEach(item => {
          item["checked"] = false;
        });

        if (key == 'platform') {
          this.editDefaultDataOption.device_brand.isShow = true;

          this.editDefaultDataOption.device_brand.resultValue = 'NONE';
          this.editDefaultDataOption.device_brand.combine_data.sub = [];
          this.editDefaultDataOption.device_brand.combine_data.sub = [...this.deviceBrandList];
        }
        if (key==='age') {
          this.getExtendDisabled();
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
            this.byteDanceConfigList[itemKey].sub.forEach(item => {
              if (item.value !== 'PC') {
                item.checked = false;
              }
              if (item.checked) {
                this.platFormChecked.push(item.value);
              }
            });
          } else {
            this.byteDanceConfigList[itemKey].sub.forEach(item => {
              if (item.value === 'PC') {
                item.checked = false;
              }

              if (item.checked) {
                this.platFormChecked.push(item.value);
              }
            });
          }

          // if (this.platFormChecked.length === 1 && this.platFormChecked[0] === 'IOS') {
          //   this.editDefaultDataOption.app_behavior_target.resultValue = 'NONE';
          //   this.editDefaultDataOption.app_behavior_target.combine_data.resultList = [];
          // }
          this.editDefaultDataOption.device_brand.combine_data.resultList = [];
          this.editDefaultDataOption.device_brand.isShow = this.platFormChecked.length === 1 && (this.platFormChecked[0] === 'IOS' || this.platFormChecked[0] === 'PC') ? false : true;
          if (this.platFormChecked.length === 2) {
            this.editDefaultDataOption.device_brand.resultValue = 'NONE';
            this.editDefaultDataOption.device_brand.combine_data.sub = [];
            this.editDefaultDataOption.device_brand.combine_data.sub = [...this.deviceBrandList];
          } else if (this.platFormChecked.length === 1 && this.platFormChecked[0] === 'ANDROID') {
            this.editDefaultDataOption.device_brand.resultValue = 'NONE';
            this.editDefaultDataOption.device_brand.combine_data.sub = [];
            this.editDefaultDataOption.device_brand.combine_data.sub = [...this.deviceBrandAndroidList];
          }
        }
      }
      this.editDefaultDataOption[itemKey]["NOLIMIT"] = false;
      this.editDefaultDataOption[itemKey]["NOLIMIT"] = this.byteDanceConfigList[itemKey].sub.every(item => !item.checked);
      if (itemKey==='age') {
        this.getExtendDisabled();
      }
    } else {
      const isChecked = this.editDefaultDataOption[itemKey].aweme_fan_behaviors.sub.every(item => !item.checked);
      if (isChecked) {
        setTimeout(() => {
          this.editDefaultDataOption[itemKey].aweme_fan_behaviors.sub[0].checked = true;
        }, 0);
      }
    }
  }

  treeCrowdOnCheck(event: NzFormatEmitEvent, value): void {
    value.crowdResultList = [...event.keys];

    value.excludeCrowdList.forEach(item => {
      item['disabled'] = event.keys.indexOf(item.key) > -1;
    });

    value.excludeCrowdList = [...value.excludeCrowdList];

  }

  treeExcludeCrowdOnCheck(event: NzFormatEmitEvent, value): void {
    value.excludeCrowdResultList = [...event.keys];

    value.crowdList.forEach(item => {
      item['disabled'] = event.keys.indexOf(item.key) > -1;
    });
    value.crowdList = [...value.crowdList];
  }

  generateResultData() {
    let curAudienceData;

    if (this.targetType === 'package') {
      curAudienceData = this.targetSource;
    } else if (this.targetType === 'packageEdit') {
      curAudienceData = this.curAudienceData;
    }

    const resultData = {};
    resultData['age'] = [];
    resultData['aweme_fan_categories'] = [];
    resultData['article_category'] = [];
    resultData['aweme_fan_behaviors'] = [];
    resultData['platform'] = [];
    resultData['device_brand'] = [];
    resultData['launch_price'] = [];
    resultData['app_category'] = [];
    resultData['ac'] = [];
    resultData['carrier'] = [];
    resultData['activate_type'] = [];
    resultData['device_type'] = [];
    resultData['auto_extend_enabled'] = 0;
    resultData['auto_extend_targets'] = [];
    resultData['crowd'] = {};
    // resultData['app_behavior_target'] = this.editDefaultDataOption.app_behavior_target['resultValue'];
    resultData['district'] = this.editDefaultDataOption.district['resultValue'];
    resultData['location_type'] = this.editDefaultDataOption['district']['location_type']['resultValue'];
    resultData['gender'] = this.editDefaultDataOption['gender'];
    if (this.editDefaultDataOption.district['resultValue'] == 'CITY') {
      resultData['city'] = this.editDefaultDataOption.district['combine_data']['CITY']['resultList'];
    } else if (this.editDefaultDataOption.district['resultValue'] == 'COUNTY') {
      resultData['county'] = this.editDefaultDataOption.district['combine_data']['COUNTY']['resultList'];
    } else if (this.editDefaultDataOption.district['resultValue'] == 'BUSINESS_DISTRICT') {
      resultData['business_ids'] = this.editDefaultDataOption.district['combine_data']['BUSINESS_DISTRICT']['resultList'];
    }
    if (this.editDefaultDataOption.age.NOLIMIT && this.editDefaultDataOption.age.disabled) {
      resultData['age'] = curAudienceData['audience_setting']['age'];
    } else {
      this.byteDanceConfigList.age.sub.forEach(subItem => {
        if (subItem.checked) {
          resultData['age'].push(subItem.value);
        }
      });
    }

    if (this.curAccountsList.length > 0) {
      this.curAccountsList.forEach(item => {
        resultData['crowd'][item.id] = {
          exclude: item.excludeCrowdResultList ? item.excludeCrowdResultList : [],
          include: item.crowdResultList ? item.crowdResultList : [],
        };
      });
    }
    // resultData['retargeting_tags_include'] = [...this.editDefaultDataOption.targeting_audience.combine_data.crowdResultList];
    // resultData['retargeting_tags_exclude'] = [...this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdResultList];

    resultData['interest_action_mode'] = this.editDefaultDataOption['interest_action'].resultValue;
    if (this.editDefaultDataOption.interest_action['resultValue'] === 'CUSTOM') {
      if (this.editDefaultDataOption.interest_action.action_days.resultValue !== undefined) {
        resultData['action_days'] = this.editDefaultDataOption.interest_action.action_days['resultValue'];
      }

      resultData['action_scene'] = [...this.editDefaultDataOption.interest_action.action_scene.resultList];
      resultData['action_categories'] = [...this.editDefaultDataOption.interest_action.combine_data.action.resultList];
      resultData['interest_categories'] = [...this.editDefaultDataOption.interest_action.combine_data.interest.resultList];
    } else {
      resultData['action_days'] = 30;
      resultData['action_scene'] = [];
      resultData['action_categories'] = [];
      resultData['interest_categories'] = [];
    }

    resultData['aweme_fan_categories'] = [];
    if (this.editDefaultDataOption.aweme_fan_categories['resultValue'] !== 'NONE') {
      resultData['aweme_fan_categories'] = this.editDefaultDataOption.aweme_fan_categories['combine_data']['resultList'];
    }

    this.editDefaultDataOption.aweme_fan_categories['aweme_fan_behaviors'].sub.forEach(subItem => {
      if (subItem.checked) {
        resultData['aweme_fan_behaviors'].push(subItem.value);
      }
    });
    if (!resultData['aweme_fan_behaviors'].length && this.editDefaultDataOption['aweme_fan_categories'].aweme_fan_behaviors.sub[0]['disabled']) {
      resultData['aweme_fan_behaviors'] = curAudienceData['audience_setting']['aweme_fan_behaviors'];
    }
    if (this.editDefaultDataOption.platform.NOLIMIT && this.editDefaultDataOption.platform.disabled) {
      resultData['platform'] = curAudienceData['audience_setting']['platform'];
    } else {
      this.byteDanceConfigList.platform.sub.forEach(subItem => {
        if (subItem.checked) {
          resultData['platform'].push(subItem.value);
        }
      });
    }

    if (this.editDefaultDataOption.article_category['resultValue'] !== 'NONE') {
      resultData['article_category'] = this.editDefaultDataOption.article_category['combine_data']['resultList'];
    }

    if (this.editDefaultDataOption.ac.NOLIMIT && this.editDefaultDataOption.ac.disabled) {
      resultData['ac'] = curAudienceData['audience_setting']['ac'];
    } else {
      this.byteDanceConfigList.ac.sub.forEach(subItem => {
        if (subItem.checked) {
          resultData['ac'].push(subItem.value);
        }
      });
    }

    resultData['hide_if_converted'] = this.editDefaultDataOption['hide_if_converted'];

    // resultData['hide_if_exists'] = this.editDefaultDataOption['hide_if_exists'];

    resultData['android_osv'] = this.editDefaultDataOption['android_osv'];

    resultData['ios_osv'] = this.editDefaultDataOption['ios_osv'];

    if (this.editDefaultDataOption.carrier.NOLIMIT && this.editDefaultDataOption.carrier.disabled) {
      resultData['carrier'] = curAudienceData['audience_setting']['carrier'];
    } else {
      this.byteDanceConfigList.carrier.sub.forEach(subItem => {
        if (subItem.checked) {
          resultData['carrier'].push(subItem.value);
        }
      });
    }

    if (this.editDefaultDataOption.activate_type.NOLIMIT && this.editDefaultDataOption.activate_type.disabled) {
      resultData['activate_type'] = curAudienceData['audience_setting']['activate_type'];
    } else {
      this.byteDanceConfigList.activate_type.sub.forEach(subItem => {
        if (subItem.checked) {
          resultData['activate_type'].push(subItem.value);
        }
      });
    }


    if (this.editDefaultDataOption.device_brand['resultValue'] !== 'NONE') {
      resultData['device_brand'] = this.editDefaultDataOption.device_brand['combine_data']['resultList'];
    }

    if (this.editDefaultDataOption.launch_price['resultValue'] == 'price') {
      resultData['launch_price'] = [...this.editDefaultDataOption.launch_price['priceResult']];
    }

    if (this.editDefaultDataOption.auto_extend_enabled['resultValue'] == 'auto_extend_targets') {
      resultData['auto_extend_enabled'] = 1;
      resultData['auto_extend_targets'] = this.editDefaultDataOption.auto_extend_enabled['combine_data']['resultList'];
    } else {
      resultData['auto_extend_enabled'] = 0;
    }

    // if (this.editDefaultDataOption.app_behavior_target['resultValue'] == 'CATEGORY') {
    //   resultData['app_category'] = this.editDefaultDataOption.app_behavior_target['combine_data']['resultList'];
    // }

    // resultData['superior_popularity_type'] = this.editDefaultDataOption.superior_popularity_type;

    if (this.editDefaultDataOption.device_type.NOLIMIT && this.editDefaultDataOption.device_type.disabled) {
      resultData['device_type'] = curAudienceData['audience_setting']['device_type'];
    } else {
      this.byteDanceConfigList.device_type.sub.forEach(subItem => {
        if (subItem.checked) {
          resultData['device_type'].push(subItem.value);
        }
      });
    }

    return resultData;
  }

  getExtendDisabled() {
    const disabledKeys=[];
    const keys=['targeting_audience','district','interest_action'];
    const keysMap= {
      targeting_audience:'CUSTOM_AUDIENCE',
      interest_action:'INTEREST_ACTION',
      district:'REGION'
    };
    keys.forEach(key=> {
      if (this.editDefaultDataOption[key].resultValue==='NONE'||this.editDefaultDataOption[key].resultValue==='UNLIMITED'||this.editDefaultDataOption[key].resultValue==='RECOMMEND') {
        disabledKeys.push(keysMap[key]);
      }
    });
    if (this.editDefaultDataOption.age.NOLIMIT) {
      disabledKeys.push('AGE');
    }
    if (this.editDefaultDataOption.gender==='NONE') {
      disabledKeys.push('GENDER');
    }
    this.editDefaultDataOption['auto_extend_enabled'].combine_data.sub.forEach(item=> {
      if (disabledKeys.find(key=>key===item.key)) {
        item.disabled=true;
        if (this.editDefaultDataOption['auto_extend_enabled'].combine_data.resultList.indexOf(item.key)!==-1) {
          this.editDefaultDataOption['auto_extend_enabled'].combine_data.resultList.splice(this.editDefaultDataOption['auto_extend_enabled'].combine_data.resultList.indexOf(item.key),1);
        }
      } else {
        item.disabled=false;
      }
    });
    if (this.editDefaultDataOption['auto_extend_enabled'].resultValue==='auto_extend_targets') {
      this.editDefaultDataOption['auto_extend_enabled'].resultValue='NONE';
      setTimeout(()=> {
        this.editDefaultDataOption['auto_extend_enabled'].resultValue='auto_extend_targets';
      },0);
    }
  }

}
