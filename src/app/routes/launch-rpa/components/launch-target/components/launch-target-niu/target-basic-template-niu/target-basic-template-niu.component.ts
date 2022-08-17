import { AfterViewChecked, OnChanges, Component, Input, OnInit, SimpleChanges, ViewChild, HostListener } from '@angular/core';
import { GlobalTemplateComponent } from "../../../../../../../shared/template/global-template/global-template.component";
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from "../../../../../../../core/service/auth.service";
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { LaunchService } from "../../../../../service/launch.service";
import { DataViewService } from "../../../../../../data-view-feed/service/data-view.service";
import { isArray } from "@jzl/jzl-util";
import { deepCopy } from "@jzl/jzl-util";
import { MenuService } from "../../../../../../../core/service/menu.service";

@Component({
  selector: 'app-target-basic-template-niu',
  templateUrl: './target-basic-template-niu.component.html',
  styleUrls: ['./target-basic-template-niu.component.scss']
})
export class TargetBasicTemplateNiuComponent implements OnInit, OnChanges, AfterViewChecked {

  @ViewChild(GlobalTemplateComponent, { static: true }) globalTemplate: GlobalTemplateComponent;
  @Input() targetConfig;
  @Input() curAudienceData;
  @Input() data;
  @Input() targetType;
  @Input() isLaunchPackage;
  @Input() objectiveType;
  @Input() checkErrorTip;

  public isInitSingleDataFinshed = false;

  public cityText = '';
  public noHaveText = '';
  public purchaseIntentionLoading = false;
  public fansStarsLoading = false;


  public searchCrowdValue = '';
  public searchExcludeValue = '';
  public searchPaidValue = '';


  public accountsList = [];
  public curAccountsList = [];
  public curAppAccountsList = [];
  public accounts = [];
  public appAccounts = [];

  public min_age = 18;
  public max_age = 55;

  public publisherId = 23;

  public defaultData: { audience_template_name: any, landing_type?: any, audience_template_id?: any, audience_desc: any, audience_setting: any, delivery_range?: any, marketing_target?: any, flow_type?: any, opt_target?: any, target_setting?: any } = {
    audience_template_name: null,  // 定向包名称
    audience_desc: null, // 定向包描述
    landing_type: 13,  // 计划类型（营销目标）
    audience_setting: {},
    target_setting: {},
  };

  // 年龄区间
  public ages_range_sub = [
    {
      "label": "18-23",
      "value": {
        "min": "18",
        "max": "23"
      },
      "checked": false
    },
    {
      "label": "24-30",
      "value": {
        "min": "24",
        "max": "30"
      },
      "checked": false
    },
    {
      "label": "31-40",
      "value": {
        "min": "31",
        "max": "40"
      },
      "checked": false
    },
    {
      "label": "41-49",
      "value": {
        "min": "41",
        "max": "49"
      },
      "checked": false
    },
    {
      "label": "50+",
      "value": {
        "min": "50",
        "max": "55"
      },
      "checked": false
    }
  ]


  public cid;
  public chan_pub_id = 0;



  public editDefaultDataOption = {
    region_type: 0,//地域类型
    region: [],     //  地域id
    city_level: {
      list: [],
      resultData: []
    },//城市
    designated_area: {
      list: [],
      resultData: []
    },//地域
    age_type: 'no_limit',// 年龄类型
    age: [],//  年龄
    gender_type: 0,     // 性别
    purchase_intention_type: 1,//购物意图类型
    purchase_intention: {//购物意图信息
      categories_ids: [],
      categories_names: [],
      interest_level_list: [],//意向类型
      purchase_level_list: [],//点击类型
      categories_real_ids: [],
    },
    purchase_intention_category: {//购物意图商品列表
      list: [],
      resultData: []
    },
    purchase_level: {},//意向类型,存放checked
    interest_level: {},//点击类型,存放checked
    behavior_list: {},//点击类型,存放checked
    celebrity_info_type: 1,//快手网红类型
    celebrity_info: {//快手网红信息
      behavior_list: [],//行为类型
      fans_star_list: [],//网红分类和快手网红
    },
    celebrity_info_category: {//网红分类分类列表
      list: [],
      level1_id: null,
      level1_name: '',
      level2_id: null,
      level2_name: '',
      level2_list: [],
      searchKey: null,
      fans_star_list: [],
    },
    population_type: 1,//自选人群类型
    // 自选人群
    includeList: {
      list: [],
      resultData: []
    },
    // 排除人群
    excludeList: {
      list: [],
      resultData: []
    },


    intelli_extend: {
      is_open: 0,
      no_age_break: 0,//不可突破年龄
      no_gender_break: 0,//不可突破性别
      no_area_break: 0,//不可突破地域
    },
  };

  constructor(private message: NzMessageService,
    private authService: AuthService,
    public launchRpaService: LaunchRpaService,
    public menuService: MenuService,
    private launchService: LaunchService,
    private dataViewService: DataViewService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.publisherId = this.menuService.currentPublisherId;
  }

  ngOnInit() {
    this.getAccountList();
    this.getPurchaseIntentionList();//获取购物意图词
    this.getNiuFansStarCelebrity();//获取快手网红分类
  }

  initConfigData() {
    if (this.targetConfig) {
      this.isInitSingleDataFinshed = false;
      this.targetConfig['age']['sub'].forEach(item => {
        item.checked = false;
      });

      this.editDefaultDataOption.city_level.list = this.targetConfig.city_level;
      this.editDefaultDataOption.designated_area.list = this.targetConfig.designated_area;

      this.initSingleData(this.data.audience_setting);
      const setting = this.getResultData();
      this.data.audience_setting = { ...setting };
      this.isInitSingleDataFinshed = true;
    }
  }

  getResultData() {
    let curAudienceData;
    if (this.targetType === 'package') {
      curAudienceData = this.data;
    } else if (this.targetType === 'packageEdit') {
      curAudienceData = this.curAudienceData;
    }

    const resultData = {};

    // 年龄
    resultData['age_type'] = this.editDefaultDataOption.age_type;
    if (resultData['age_type'] === 'no_limit') {
      resultData['age'] = '';
    } else if (resultData['age_type'] === 'customize_age') {
      resultData['age'] = this.editDefaultDataOption.age;
    }

    // 购物意图
    resultData['purchase_intention_type'] = this.editDefaultDataOption.purchase_intention_type;
    if (resultData['purchase_intention_type'] === 2) {
      this.editDefaultDataOption.purchase_intention.categories_real_ids = this.editDefaultDataOption.purchase_intention_category.resultData;
      resultData['purchase_intention'] = this.editDefaultDataOption.purchase_intention;
    }

    // 快手网红
    resultData['celebrity_info_type'] = this.editDefaultDataOption.celebrity_info_type;
    if (resultData['celebrity_info_type'] === 2) {
      resultData['celebrity_info'] = this.editDefaultDataOption.celebrity_info;
    }


    // 自选人群
    resultData['crowd'] = {};
    resultData['population_type'] = this.editDefaultDataOption.population_type;

    resultData['gender_type'] = this.editDefaultDataOption.gender_type;

    resultData['region_type'] = this.editDefaultDataOption.region_type;
    resultData['region'] = this.editDefaultDataOption.region;


    if (this.editDefaultDataOption.intelli_extend.is_open === 1) {
      resultData['intelli_extend'] = this.editDefaultDataOption.intelli_extend;
    }

    if (this.curAccountsList.length > 0) {
      this.curAccountsList.forEach(item => {
        if (this.editDefaultDataOption.population_type === 2) {
          resultData['crowd'][item.id] = {
            exclude_population: item.excludeCrowdResultList ? item.excludeCrowdResultList : [],
            population: item.crowdResultList ? item.crowdResultList : [],
          };
        }
      });
    }

    return resultData;
  }

  ngAfterViewChecked() {
    if (this.isInitSingleDataFinshed) {
      const setting = this.getResultData();
      this.data.audience_setting = { ...setting };
    }
  }


  ngOnChanges(changes: SimpleChanges): void {

  }

  initSingleData(basicData) {

    if (Object.keys(basicData).length) {
      // 人群
      if (Object.keys(basicData['crowd']).length) {
        if (basicData['population_type'] === 2) {
          for (const item of Object.keys(basicData['crowd'])) {
            const index = this.accountsList.findIndex(value => value.chan_pub_id == item);
            if (index !== -1 && !this.curAccountsList.find(s_item => s_item.id === item)) {
              this.accounts.push(Number(item));
              const obj = { name: this.accountsList[index].pub_account_name, id: this.accountsList[index].chan_pub_id, crowdResultList: basicData['crowd'][item]['population'], excludeCrowdResultList: basicData['crowd'][item]['exclude_population'] };
              this.curAccountsList.push(obj);
              this.getTargetAudience(obj);
            }
          }
        }

      }

      // 地域类型
      if (basicData.region_type !== 0) {
        basicData.region_type === 3 ? this.editDefaultDataOption.city_level.resultData = [...basicData.region] : this.editDefaultDataOption.designated_area.resultData = [...basicData.region];
      }
      this.editDefaultDataOption.region_type = basicData.region_type;
      this.editDefaultDataOption.region = [...basicData.region];

      //性别
      this.editDefaultDataOption.gender_type = basicData.gender_type;


      this.editDefaultDataOption.includeList.resultData = basicData.population;
      this.editDefaultDataOption.excludeList.resultData = basicData.exclude_population;


      // 自选人群
      this.editDefaultDataOption.population_type = basicData.population_type;


      // 年龄
      if (basicData.age_type) {
        this.editDefaultDataOption.age_type = basicData.age_type;
        if (basicData.age_type === 'no_limit') {
          this.editDefaultDataOption.age = [];
        } else if (basicData.age_type === 'customize_age') {
          if (basicData.age) this.editDefaultDataOption.age = basicData.age;
          // 回写年龄
          this.refreshCheckedStatus(this.ages_range_sub, basicData.age);
        }
      } else {
        this.editDefaultDataOption.age_type = 'no_limit';
      }

      // 购物意图
      this.editDefaultDataOption.purchase_intention_type = basicData['purchase_intention_type'];

      if (basicData['purchase_intention_type'] === 2) {
        this.editDefaultDataOption.purchase_intention = basicData['purchase_intention'];
        this.editDefaultDataOption.purchase_intention_category.resultData = basicData['purchase_intention'].categories_real_ids;
        // 回写购物意图选中状态
        this.refreshCheckedStatus(this.targetConfig.interest_level_list.sub, basicData['purchase_intention'].interest_level_list);
        this.refreshCheckedStatus(this.targetConfig.purchase_level_list.sub, basicData['purchase_intention'].purchase_level_list);
      }

      // 快手网红
      this.editDefaultDataOption.celebrity_info_type = basicData['celebrity_info_type'];
      if (basicData['celebrity_info_type'] === 2) {
        this.editDefaultDataOption.celebrity_info = basicData['celebrity_info'];
        // 回写快手网红-行为类型选中状态
        this.refreshCheckedStatus(this.targetConfig.behavior_list.sub, basicData['celebrity_info'].behavior_list);
      }


      if (basicData.intelli_extend) {
        this.editDefaultDataOption.intelli_extend = basicData.intelli_extend;
      }

      if (basicData.auto_extend_targets) {
        this.targetConfig['auto_extend_targets']['sub'].forEach(item => {
          if (basicData.auto_extend_targets.indexOf(item.value) !== -1) {
            item.checked = true;
          }
        });
      }

      if (this.isLaunchPackage) {
        // 投放包
        if (Object.keys(this.data.target_setting).length) {
          this.getDisabled(this.data.target_setting);
        } else {
          this.getDisabled(basicData);
        }
      }
    }
  }

  transferTreeChange(sourceData, data: any[], type) {
    if (type === 'purchase_intention') {
      sourceData.resultData = [...data['treeKey']];
    } else {
      sourceData.resultData = [...data];
    }
    if (type === 'region') {
      this.editDefaultDataOption.region = [...data];
      if (this.editDefaultDataOption.region_type === 3) {
        this.editDefaultDataOption.city_level = { ...sourceData };
      } else {
        this.editDefaultDataOption.designated_area = { ...sourceData };
      }
    } else if (type === 'purchase_intention') {//购物意图
      this.editDefaultDataOption.purchase_intention.categories_ids = [...data['joinKey']];
      this.editDefaultDataOption.purchase_intention.categories_names = [...data['treeName']];
      this.editDefaultDataOption.purchase_intention_category = { ...sourceData };
    }

  }

  // 修改多选框
  updateSingleChecked(data, type) {
    this.editDefaultDataOption[type]["checked"] = false;
    if (type === 'age') {
      this.editDefaultDataOption.age = [];
      data.forEach(item => {
        if (item.checked) {
          this.editDefaultDataOption.age.push(item.value);
        }
      });
      this.getCheckErrorTip('age', this.editDefaultDataOption.age);
    }
    else if (type === 'interest_level') {
      this.editDefaultDataOption.purchase_intention.interest_level_list = [];
      data.forEach(item => {
        if (item.checked) {
          this.editDefaultDataOption.purchase_intention.interest_level_list.push(item.value);
        }
      });
      this.getCheckErrorTip('interest_level', this.editDefaultDataOption.purchase_intention.interest_level_list);
    }
    else if (type === 'purchase_level') {
      this.editDefaultDataOption.purchase_intention.purchase_level_list = [];
      data.forEach(item => {
        if (item.checked) {
          this.editDefaultDataOption.purchase_intention.purchase_level_list.push(item.value);
        }
      });
      this.getCheckErrorTip('purchase_level', this.editDefaultDataOption.purchase_intention.purchase_level_list);
    }
    else if (type === 'behavior_list') {
      this.editDefaultDataOption.celebrity_info.behavior_list = [];
      data.forEach(item => {
        if (item.checked) {
          this.editDefaultDataOption.celebrity_info.behavior_list.push(item.value);
        }
      });
      this.getCheckErrorTip('behavior_list', this.editDefaultDataOption.celebrity_info.behavior_list);
    }

  }

  // 获取多选框项的错误状态
  getCheckErrorTip(key, list) {
    if (list.length === 0) {
      this.checkErrorTip[key].is_show = true;
    } else {
      this.checkErrorTip[key].is_show = false;
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
  treePaidCrowdOnCheck(event: NzFormatEmitEvent, value): void {
    value.paidCrowdResultList = [...event.keys];
  }

  getDisabled(audienceData) {
    // 地域类型
    this.targetConfig['region_type']['sub'].forEach(item => {
      item['disabled'] = audienceData['region_type'] !== 0 && item.value !== audienceData['region_type'];
    });

    // 年龄
    this.targetConfig['age']['sub'].forEach(item => {
      item['disabled'] = audienceData['age_type'] !== 'no_limit' && item.value !== audienceData['age_type'];
    });

    // 自定义年龄段
    if (audienceData['age_type'] !== 'no_limit') {
      this.getDisabledCheckedStatus(this.ages_range_sub, audienceData['age']);
    }

    // 性别
    this.targetConfig['gender_type']['sub'].forEach(item => {
      item['disabled'] = audienceData['gender_type'] !== 0 && item.value !== audienceData['gender_type'];
    });

    // 购物意图
    this.targetConfig['purchase_intention']['sub'].forEach(item => {
      item['disabled'] = audienceData['purchase_intention_type'] !== 1 && item.value !== audienceData['purchase_intention_type'];
    });

    if (audienceData['purchase_intention_type'] !== 1) {
      // 投放意图
      this.getDisabledCheckedStatus(this.targetConfig['interest_level_list']['sub'], audienceData['purchase_intention']['interest_level_list']);
      // 行为类型
      this.getDisabledCheckedStatus(this.targetConfig['purchase_level_list']['sub'], audienceData['purchase_intention']['purchase_level_list']);
    }

    //快手网红
    this.targetConfig['celebrity_info']['sub'].forEach(item => {
      item['disabled'] = audienceData['celebrity_info_type'] !== 1 && item.value !== audienceData['celebrity_info_type'];
    });
    if (audienceData['celebrity_info_type'] !== 1) {
      // 投放意图
      this.getDisabledCheckedStatus(this.targetConfig['behavior_list']['sub'], audienceData['celebrity_info']['behavior_list']);
    }

    //自选人群
    this.targetConfig['population']['sub'].forEach(item => {
      item['disabled'] = audienceData['population_type'] !== 1 && item.value !== audienceData['population_type'];
    });

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
          "value": this.menuService.currentChannelId
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
            this.initConfigData();
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
          if (this.editDefaultDataOption.population_type === 2) {
            this.curAccountsList.push({ name: data.pub_account_name, id: data.chan_pub_id, crowdResultList: [], excludeCrowdResultList: [] });
            this.getTargetAudience(this.curAccountsList[index]);
          }
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

  getTargetAudience(value) {
    const getUcTargetAudience = this.launchRpaService.getNiuTargetAudience({
      chan_pub_id: value.id,
      is_paid: false
    });
    getUcTargetAudience.subscribe(result => {
      const crowd = [];
      result['data'].forEach(item => {
        crowd.push({
          title: item.population_name,
          key: item.population_id,
          isLeaf: true
        });
      });

      value.crowdList = deepCopy(crowd);
      value.excludeCrowdList = deepCopy(crowd);
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

  noBreak(type) {
    if (type === 'age') {
      this.editDefaultDataOption.intelli_extend.no_age_break = 0;
      this.editDefaultDataOption.age = [];
    } else if (type === 'area') {
      this.editDefaultDataOption.intelli_extend.no_area_break = 0;
      this.editDefaultDataOption.city_level.resultData = [];
      this.editDefaultDataOption.designated_area.resultData = [];
      this.cityText = '';
      this.noHaveText = '';
    } else if (type === 'gender_type') {
      this.editDefaultDataOption.intelli_extend.no_gender_break = 0;
    }
  }

  changeTarget(type) {
    if (type === 'audience') {
      this.curAccountsList = [];
      this.accounts = [];
    }

  }

  // 获取购物意图词
  getPurchaseIntentionList() {
    this.purchaseIntentionLoading = true;
    this.launchRpaService.getPurchaseIntentionList().subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.purchaseIntentionLoading = false;
        this.editDefaultDataOption.purchase_intention_category.list.length = 0;
        this.editDefaultDataOption.purchase_intention_category.list.push(...result['data']);
      } else {
        this.editDefaultDataOption.purchase_intention_category.list.length = 0;
        this.message.error(result.message);
      }
    });
  }

  // 获取网红分类
  getNiuFansStarCelebrity() {
    this.launchRpaService.getNiuFansStarCelebrity().subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.editDefaultDataOption.celebrity_info_category.list.length = 0;
        this.editDefaultDataOption.celebrity_info_category.list.push(...result['data']);
      } else {
        this.editDefaultDataOption.celebrity_info_category.list.length = 0;
        this.message.error(result.message);
      }
    });
  }

  // 回写多选框状态
  refreshCheckedStatus(data, checkedValues) {
    const checkedObj = {};
    checkedValues.forEach(value => {
      checkedObj[JSON.stringify(value)] = '值：' + value;
    });
    data.forEach(item => {
      if (checkedObj[JSON.stringify(item.value)]) {
        item.checked = true
      } else {
        item.checked = false;
      }
    });
  }
  // 根据数据回写多选框禁用状态
  getDisabledCheckedStatus(data, checkedValues) {
    const checkedObj = {};
    checkedValues.forEach(value => {
      checkedObj[JSON.stringify(value)] = '值：' + value;
    });
    data.forEach(subItem => {
      if (checkedObj[JSON.stringify(subItem.value)]) {
        subItem['disabled'] = false;
      } else {
        subItem['disabled'] = true;
      }
    });
  }

  // 切换快手网红分类
  changeCelebrityCategory(categoryItem, level) {
    if (level === 'level1') {
      this.editDefaultDataOption.celebrity_info_category.level1_id = categoryItem.id;
      this.editDefaultDataOption.celebrity_info_category.level1_name = categoryItem.name;
      this.editDefaultDataOption.celebrity_info_category.level2_list = deepCopy(categoryItem.children) || [];
    } else if (level === 'level2') {
      this.editDefaultDataOption.celebrity_info_category.level2_id = categoryItem.id;
      this.editDefaultDataOption.celebrity_info_category.level2_name = categoryItem.name;
      this.getFansStarList({ 'second_label': this.editDefaultDataOption.celebrity_info_category.level2_name });
    }
  }
  // 获取快手网红列表
  getFansStarList(searchObj) {
    this.fansStarsLoading = true;
    if (searchObj['keyword']) {
      //按关键词查找
      this.editDefaultDataOption.celebrity_info_category.level1_id = null;
      this.editDefaultDataOption.celebrity_info_category.level1_name = '';
      this.editDefaultDataOption.celebrity_info_category.level2_list.length = 0;
      this.editDefaultDataOption.celebrity_info_category.level2_id = null;
      this.editDefaultDataOption.celebrity_info_category.level2_name = '';
    }
    this.launchRpaService.getNiuFansStarList({
      "chan_pub_id": this.accountsList[0].chan_pub_id,
      ...searchObj
    }
    ).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        // 回写已选快手网红选中状态
        this.refreshFansStarsCheckedStatus(result['data']);
        this.editDefaultDataOption.celebrity_info_category.fans_star_list.length = 0;
        this.editDefaultDataOption.celebrity_info_category.fans_star_list.push(...result['data']);
      } else {
        this.editDefaultDataOption.celebrity_info_category.fans_star_list.length = 0;
        this.message.error(result.message);
      }
      this.fansStarsLoading = false;
    });
  }

  // 选择快手网红
  checkFansStar(event, item) {
    if (event) {
      this.editDefaultDataOption.celebrity_info.fans_star_list.push({
        type: 2,
        id: item.author_id,
        name: item.kwai_id,
        category: [item.first_label_id, item.second_label_id],
        ...item,
      })
    } else {
      let delIndex = this.editDefaultDataOption.celebrity_info.fans_star_list.findIndex(element => element.author_id === item.author_id);
      if (delIndex > -1) {
        this.editDefaultDataOption.celebrity_info.fans_star_list.splice(delIndex, 1);
      }
    }
    this.refreshFansStarsCheckedStatus(this.editDefaultDataOption.celebrity_info_category.fans_star_list);
  }

  // 清空已选快手网红
  clearFansStars() {
    this.editDefaultDataOption.celebrity_info.fans_star_list.length = 0;
    this.refreshFansStarsCheckedStatus(this.editDefaultDataOption.celebrity_info_category.fans_star_list);
  }

  // 回写已选快手网红选中状态
  refreshFansStarsCheckedStatus(fansStarsList) {
    const fansStarObj = {};
    this.editDefaultDataOption.celebrity_info.fans_star_list.forEach(element => {
      fansStarObj[element.author_id] = '值：' + element;
    });
    fansStarsList.forEach(item => {
      if (fansStarObj[item.author_id]) {//已选
        item.checked = true;
      } else {
        item.checked = false;
      }
    });

    if (this.defaultData.audience_setting.celebrity_info_type !== 1) {
      //快手网红
      if (this.editDefaultDataOption.celebrity_info.fans_star_list.length === 0) {
        this.checkErrorTip.fans_star.is_show = true;
      } else {
        this.checkErrorTip.fans_star.is_show = false;
      }
    }
  }

}
