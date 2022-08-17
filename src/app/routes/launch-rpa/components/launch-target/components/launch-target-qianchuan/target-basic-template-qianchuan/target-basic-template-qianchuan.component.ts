import {
  AfterViewChecked,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {GlobalTemplateComponent} from "../../../../../../../shared/template/global-template/global-template.component";
import {NzMessageService} from "ng-zorro-antd/message";
import {DataViewService} from "../../../../../../data-view-feed/service/data-view.service";
import {LaunchService} from "../../../../../../../module/launch/service/launch.service";
import {AuthService} from "../../../../../../../core/service/auth.service";
import {LaunchRpaService} from "../../../../../service/launch-rpa.service";
import {MenuService} from "../../../../../../../core/service/menu.service";
import {deepCopy, isArray} from "@jzl/jzl-util";
import {NzFormatEmitEvent} from "ng-zorro-antd/tree";

@Component({
  selector: 'app-target-basic-template-qianchuan',
  templateUrl: './target-basic-template-qianchuan.component.html',
  styleUrls: ['./target-basic-template-qianchuan.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class TargetBasicTemplateQianchuanComponent implements OnInit,AfterViewChecked,OnChanges {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;

  @Input() promotion_way;
  @Input() targetSource;
  @Input() isLaunchPackage;
  @Input() curAudienceData;
  @Input() targetType;

  public byteDanceConfigList;

  public chan_pub_id = 0;
  public searchCrowdValue='';
  public searchExcludeValue='';
  public audienceMap = new Map();

  public editDefaultDataOption = {
    audience_mode: {
      "name": "自定义人群",
      "resultValue": "AUTO",
      "sub": [
        {
          label: "不限",
          value: "NONE",
          checked: false
        },
        {
          label: "智能推荐",
          value: "AUTO",
          checked: false
        },
        {
          label: "自定义",
          value: "CUSTOM",
          checked: false
        },
      ],
      combine_data: {
        retargeting_tags_op:'ALL',//INCLUDE只定向 EXCLUDE只排除
        crowdList: [],
        crowdResultList: [],
        excludeCrowdList: [],
        excludeCrowdResultList: [],
      }
    },
    retargeting_tags_op: {
      resultValue: 'ALL',
      sub: [
        {
          label: "全部",
          value: "ALL",
          checked: false
        },
        {
          label: "只定向",
          value: "INCLUDE",
          checked: false
        },
        {
          label: "只排除",
          value: "EXCLUDE",
          checked: false
        }
      ]
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
        }
      ],
      combine_data: {
        "CITY": {
          sub: [],
          resultList: []
        },
        "COUNTY": {
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
    live_platform_tags: {
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
      },
      action_words: {
        value:'nolimit',
        resultList: [],
        sub: [],
      },
      interest_words: {
        value:'nolimit',
        resultList: [],
        sub: [],
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
    interest_kwd_action: {
      sub: [
        {
          label: "不限",
          value: "nolimit",
          checked: false
        },
        {
          label: "自定义",
          value: "custom",
          checked: false
        },
      ],
    },  // 是否指定兴趣关键词
    action_kwd_action: {
      sub: [
        {
          label: "不限",
          value: "nolimit",
          checked: false
        },
        {
          label: "自定义",
          value: "custom",
          checked: false
        },
      ],
    },  // 是否指定行为关键词
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

  public kwdText={
    action:'',
    interest:''
  };

  constructor(private message: NzMessageService, private dataViewService: DataViewService, private launchService: LaunchService, private authService: AuthService, public launchRpaService: LaunchRpaService, public menuService: MenuService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.curTargetSource = deepCopy(this.targetSource);
    this.getAccountList();
    this.getQianchuanTargetConfig();
  }

  ngAfterViewChecked() {
    if (this.isInitSingleDataFinshed) {
      const setting = this.generateResultData();
      this.targetSource.audience_setting = { ...setting };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.byteDanceConfigList && changes['promotion_way']) {
      this.landingTypeChange();
      this.initConfigList();
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
          "value": "7"
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
          this.curAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id,retargeting_tags:[] });
          this.getQianchuanTargetAudience(this.curAccountsList[index]);
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

  getQianchuanTargetConfig() {
    this.launchRpaService
      .getFeedTargetConfigByQC({
        cid: this.cid,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code !== 200) {
            if (results.status_code !== 205) {
              this.message.error(results.message);
            }
          } else {
            this.byteDanceConfigList = {...results.data};
            this.initConfigList();
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  getQianchuanTargetAudience(value) {
    const getQianchuanTargetAudience = this.launchRpaService.getQCTargetAudience({
      chan_pub_id: value.id,});
    getQianchuanTargetAudience.subscribe(result => {
      // this.editDefaultDataOption.audience_mode.combine_data.crowdList = deepCopy(result['data']['customtList']);
      // this.editDefaultDataOption.audience_mode.combine_data.excludeCrowdList = deepCopy(result['data']['customtList']);
      const platformList=[];
      const customList=[];
      result['data'].forEach(item=> {
        item['key']=item['retargeting_tags_id'];
        item['title']=item['name'];
        item['isLeaf']=true;
        if (item['cover_num']>100000000) {
          item['cover_num']=(item['cover_num']/100000000).toFixed(2)+'亿';
        } else if (item['cover_num']>10000) {
          item['cover_num']=(item['cover_num']/10000).toFixed(2)+'万';
        }
        // if (item['retargeting_tags_op']!=='EXCLUDE') {
        //   includeList.push(item);
        // }
        // if (item['retargeting_tags_op']!=='INCLUDE') {
        //   excludeList.push(item);
        // }
        if (item['audience_type']===0) {
          if (value.retargeting_tags.find(data=>data.id===item['retargeting_tags_id'])) {
            item.checked=true;
          }
          platformList.push(item);
        }
        if (item['audience_type']===1) {
          customList.push(item);
        }
      });
      this.getAudienceMap(result['data']);
      value.platformList = deepCopy(platformList);
      value.customList = deepCopy(customList);
      // value.crowdResultList = deepCopy(value.crowdResultList);
      // value.excludeCrowdResultList = deepCopy(value.excludeCrowdResultList);

      // -- 互斥
      // value.excludeCrowdList.forEach(list => {
      //   list['disabled'] = value.crowdResultList.indexOf(list.key) > -1;
      // });
      // value.excludeCrowdList = [...value.excludeCrowdList];

      // -- 互斥
      // value.crowdList.forEach(list => {
      //   list['disabled'] = value.excludeCrowdResultList.indexOf(list.key) > -1;
      // });
      // value.crowdList = [...value.crowdList];
    });
  }


  initConfigList() {
    if (this.byteDanceConfigList) {
      this.isInitSingleDataFinshed = false;
      // this.editDefaultDataOption.audience_mode.sub = this.byteDanceConfigList.audience_mode.sub;
      this.editDefaultDataOption.district.sub = this.byteDanceConfigList.district.sub;
      this.editDefaultDataOption.district.combine_data.CITY.sub = this.byteDanceConfigList.prov_and_city;
      this.editDefaultDataOption.district.combine_data.COUNTY.sub = this.byteDanceConfigList.county;
      this.editDefaultDataOption.interest_action.combine_data.action.sub = this.byteDanceConfigList.action_categories.sub;
      this.editDefaultDataOption.interest_action.combine_data.interest.sub = this.byteDanceConfigList.action_categories.sub;
      this.editDefaultDataOption.interest_action.action_days.sub = this.byteDanceConfigList.action_days.sub;
      this.editDefaultDataOption.interest_action.action_scene.sub = this.byteDanceConfigList.action_scene.sub;
      this.editDefaultDataOption.aweme_fan_categories.combine_data.sub = this.byteDanceConfigList.aweme_fan_categories.sub;
      this.editDefaultDataOption.auto_extend_enabled.combine_data.sub = this.byteDanceConfigList.auto_extend_targets.sub;
      this.landingTypeChange();
      this.initSingleData(this.targetSource.audience_setting);
      const setting = this.generateResultData();
      this.targetSource.audience_setting = { ...setting };
      this.isInitSingleDataFinshed = true;
    }
  }

  initSingleData(audienceData) {
    if (Object.keys(audienceData).length) {
      // 人群
      if (Object.keys(audienceData['retargeting_tags']).length) {
        this.editDefaultDataOption.audience_mode['resultValue'] = 'CUSTOM';
        for (const item of Object.keys(audienceData['retargeting_tags'])) {
          const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
          if (index !== -1 && !this.curAccountsList.find(s_item => s_item.id === item)) {
            this.accounts.push(Number(item));
            const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id,retargeting_tags:audienceData['retargeting_tags'][item]};
            this.curAccountsList.push(obj);
            this.getQianchuanTargetAudience(obj);
          }
        }
      }
      // this.editDefaultDataOption.retargeting_tags_op['resultValue'] = audienceData['retargeting_tags_op'];

      // 地域
      if (audienceData['district'] !== undefined) {
        this.editDefaultDataOption.district['resultValue'] = audienceData['district'];
        if (audienceData['district'] == 'CITY') {
          this.editDefaultDataOption.district['combine_data']['CITY']['resultList'] = audienceData['city'];
        } else if (audienceData['district'] == 'COUNTY') {
          this.editDefaultDataOption.district['combine_data']['COUNTY']['resultList'] = audienceData['county'];
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
      if (audienceData['smart_interest_action']) {
        this.editDefaultDataOption.interest_action['resultValue'] = audienceData['smart_interest_action'];
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
      if (audienceData['action_words']) {
        this.editDefaultDataOption.interest_action['action_words'].value = 'custom';
        this.editDefaultDataOption.interest_action['action_words']['resultList'] = audienceData['action_words'];
      }
      if (audienceData['interest_words']) {
        this.editDefaultDataOption.interest_action['interest_words'].value = 'custom';
        this.editDefaultDataOption.interest_action['interest_words']['resultList'] = audienceData['interest_words'];
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
        if (audienceData['platform'].indexOf(subItem['value']) > -1) {
          subItem['checked'] = true;
          this.editDefaultDataOption.platform['NOLIMIT'] = false;
        }
      });

      // 网络类型
      this.byteDanceConfigList['ac'].sub.forEach(subItem => {
        if (audienceData['ac'].indexOf(subItem['value']) > -1) {
          subItem['checked'] = true;
          this.editDefaultDataOption.ac['NOLIMIT'] = false;
        }
      });
      // 平台精选人群包
      this.byteDanceConfigList['live_platform_tags'].sub.forEach(subItem => {
        if (audienceData['live_platform_tags'].indexOf(subItem['value']) > -1) {
          subItem['checked'] = true;
          this.editDefaultDataOption.live_platform_tags['NOLIMIT'] = false;
        }
      });

      // 过滤已安装
      // this.editDefaultDataOption.hide_if_exists = audienceData['hide_if_exists'];


      // 智能放量
      if (audienceData['auto_extend_enabled'] !== undefined) {
        if (audienceData['auto_extend_enabled'] !== 1) {
          this.editDefaultDataOption.auto_extend_enabled['resultValue'] = 'NONE';
        } else {
          this.editDefaultDataOption.auto_extend_enabled['resultValue'] = 'auto_extend_targets';
          this.editDefaultDataOption.auto_extend_enabled['combine_data']['resultList'] = [...audienceData['auto_extend_targets']];
        }
      }
      // if (this.isLaunchPackage) {
      //   if (Object.keys(this.targetSource.target_setting).length) {
      //     this.getDisabled(this.targetSource.target_setting);
      //   } else {
      //     this.getDisabled(audienceData);
      //   }
      // }

    }
  }

  getDisabled(audienceData) {
    // 人群
    this.editDefaultDataOption.audience_mode.sub.forEach(item => {
      item['disabled'] = audienceData['audience_mode'] !== 'NONE' && item.value !==  audienceData['audience_mode'];
    });
    // 人群定向规则
    // this.editDefaultDataOption.retargeting_tags_op.sub.forEach(item => {
    //   item['disabled'] = audienceData['retargeting_tags_op'] !=='ALL'&& item.value !== audienceData['retargeting_tags_op'];
    // });

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
      item['disabled'] = audienceData['smart_interest_action'] !== 'UNLIMITED' && item.value !== audienceData['smart_interest_action'];
    });

    if (audienceData['interest_words']) {
      this.editDefaultDataOption['interest_kwd_action']['sub'].forEach(item => {
        item['disabled'] = audienceData['interest_words'].length > 0 && item.value === 'nolimit';
      });
    }
    if (audienceData['action_words']) {
      this.editDefaultDataOption['action_kwd_action']['sub'].forEach(item => {
        item['disabled'] = audienceData['action_words'].length > 0 && item.value === 'nolimit';
      });
    }

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
    // 平台精选人群包
    if (audienceData['live_platform_tags'].length > 0) {
      this.byteDanceConfigList['live_platform_tags'].sub.forEach(subItem => {
        if (audienceData['live_platform_tags'].indexOf(subItem['value']) > -1) {
          this.editDefaultDataOption.live_platform_tags['disabled'] = true;
        } else {
          subItem['disabled'] = true;
        }
      });
    }

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
    if (this.promotion_way==='STANDARD') {
      this.editDefaultDataOption.audience_mode.resultValue='CUSTOM';
      this.editDefaultDataOption['audience_mode'].sub.forEach(item => {
        item['disabled'] = false;
        if (item.value=='AUTO') {
          item['disabled'] = true;
        }
      });
    } else {
      this.accounts=[];
      this.curAccountsList=[];
      this.editDefaultDataOption['audience_mode'].sub.forEach(item => {
        item['disabled'] = false;
        if (item.value=='NONE') {
          item['disabled'] = true;
        }
      });
    }
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
        }
      }
      this.editDefaultDataOption[itemKey]["NOLIMIT"] = false;
      this.editDefaultDataOption[itemKey]["NOLIMIT"] = this.byteDanceConfigList[itemKey].sub.every(item => !item.checked);
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
    resultData['aweme_fan_behaviors'] = [];
    resultData['platform'] = [];
    resultData['ac'] = [];
    resultData['live_platform_tags'] = [];
    resultData['auto_extend_enabled'] = 0;
    resultData['auto_extend_targets'] = [];
    resultData['retargeting_tags'] = {};
    // resultData['app_behavior_target'] = this.editDefaultDataOption.app_behavior_target['resultValue'];
    // resultData['retargeting_tags_op'] = this.editDefaultDataOption.retargeting_tags_op['resultValue'];
    resultData['audience_mode'] = this.editDefaultDataOption.audience_mode['resultValue'];
    if (1||this.editDefaultDataOption.audience_mode['resultValue']!=='AUTO') {
      resultData['district'] = this.editDefaultDataOption.district['resultValue'];
      resultData['location_type'] = this.editDefaultDataOption['district']['location_type']['resultValue'];
      resultData['gender'] = this.editDefaultDataOption['gender'];
      if (this.editDefaultDataOption.district['resultValue'] == 'CITY') {
        resultData['city'] = this.editDefaultDataOption.district['combine_data']['CITY']['resultList'];
      } else if (this.editDefaultDataOption.district['resultValue'] == 'COUNTY') {
        resultData['county'] = this.editDefaultDataOption.district['combine_data']['COUNTY']['resultList'];
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
      if (this.editDefaultDataOption.audience_mode['resultValue']==='CUSTOM'&&this.curAccountsList.length > 0) {
        this.curAccountsList.forEach(item => {
          resultData['retargeting_tags'][item.id] = item.retargeting_tags;
          // item.retargeting_tags.forEach(data=> {
          //   if (data.type==='include') {
          //     resultData['retargeting_tags'][item.id]['include'].push(data);
          //   } else {
          //     resultData['retargeting_tags'][item.id]['exclude'].push(data);
          //   }
          // });
        });
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

    }
    if (1||this.promotion_way!=='SIMPLE') {
      resultData['smart_interest_action'] = this.editDefaultDataOption['interest_action'].resultValue;
      if (this.editDefaultDataOption.interest_action['resultValue'] === 'CUSTOM') {
        if (this.editDefaultDataOption.interest_action.action_days.resultValue !== undefined) {
          resultData['action_days'] = this.editDefaultDataOption.interest_action.action_days['resultValue'];
        }

        resultData['action_scene'] = [...this.editDefaultDataOption.interest_action.action_scene.resultList];
        resultData['action_categories'] = [...this.editDefaultDataOption.interest_action.combine_data.action.resultList];
        resultData['interest_categories'] = [...this.editDefaultDataOption.interest_action.combine_data.interest.resultList];
        resultData['action_words'] = [...this.editDefaultDataOption.interest_action.action_words.resultList];
        resultData['interest_words'] = [...this.editDefaultDataOption.interest_action.interest_words.resultList];
      } else {
        resultData['action_days'] = 30;
        resultData['action_scene'] = [];
        resultData['action_categories'] = [];
        resultData['interest_categories'] = [];
        resultData['action_words'] = [];
        resultData['interest_words'] = [];
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

      if (this.editDefaultDataOption.ac.NOLIMIT && this.editDefaultDataOption.ac.disabled) {
        resultData['ac'] = curAudienceData['audience_setting']['ac'];
      } else {
        this.byteDanceConfigList.ac.sub.forEach(subItem => {
          if (subItem.checked) {
            resultData['ac'].push(subItem.value);
          }
        });
      }

      if (this.editDefaultDataOption.live_platform_tags.NOLIMIT && this.editDefaultDataOption.live_platform_tags.disabled) {
        resultData['live_platform_tags'] = curAudienceData['audience_setting']['live_platform_tags'];
      } else {
        this.byteDanceConfigList.live_platform_tags.sub.forEach(subItem => {
          if (subItem.checked) {
            resultData['live_platform_tags'].push(subItem.value);
          }
        });
      }

      if (this.editDefaultDataOption.auto_extend_enabled['resultValue'] == 'auto_extend_targets') {
        resultData['auto_extend_enabled'] = 1;
        resultData['auto_extend_targets'] = this.editDefaultDataOption.auto_extend_enabled['combine_data']['resultList'];
      } else {
        resultData['auto_extend_enabled'] = 0;
      }

    }


    // resultData['retargeting_tags_include'] = [...this.editDefaultDataOption.audience _mode.combine_data.crowdResultList];
    // resultData['retargeting_tags_exclude'] = [...this.editDefaultDataOption.audience _mode.combine_data.excludeCrowdResultList];


    return resultData;
  }

  addCrowd(resultList,item,type) {
    if (resultList.find(data=>data.id===item.retargeting_tags_id)) {
      resultList.map(crowd=> {
        if (crowd.id===item.retargeting_tags_id) {
          crowd.type=type;
        }
      });
    } else {
      resultList.push({id:item.retargeting_tags_id,type:type});
    }
  }
  deleteCrowd(list, result, index?) {
    if (index !== undefined) {
      result.splice(index, 1);
    } else {
      result.splice(0);
    }
    this.getQianchuanTargetAudience(list);
  }
  getAudienceMap(arr: any[]) {
    arr.forEach(item => {
      this.audienceMap.set(item.key, item.title);
      if (isArray(item.children) && item.children.length > 0) {
        return this.getAudienceMap(item.children);
      }
    });
    return this.audienceMap;
  }
  checkCrowd(value,item,resultList) {
    if (value) {
      if (resultList.find(data=>data.id===item.retargeting_tags_id)) {

      } else {
        resultList.push({id:item.retargeting_tags_id,type:item.retargeting_tags_op.toLocaleLowerCase()});
      }

    } else {
      const index=resultList.findIndex(data=>data.id===item.retargeting_tags_id);
      if (index!==-1) {
        resultList.splice(index,1);
      }
    }
  }


}
