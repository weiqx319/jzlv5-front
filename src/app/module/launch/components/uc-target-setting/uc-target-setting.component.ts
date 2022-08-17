import {AfterViewChecked, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {LaunchService} from "../../../../routes/materials/service/launch.service";
import {AuthService} from "../../../../core/service/auth.service";
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import {deepCopy} from "@jzl/jzl-util";

@Component({
  selector: 'app-uc-target-setting',
  templateUrl: './uc-target-setting.component.html',
  styleUrls: ['./uc-target-setting.component.scss']
})
export class UcTargetSettingComponent implements OnInit,AfterViewChecked,OnChanges {

  @Input() targetConfig;

  @Input() data;

  @Input() objectiveType;

  @Input() errorTip;

  @Input() isRemoveTargetingAudience = false;

  @Input() targetSource;

  @Input() audienceConfigList;

  public cid;

  public isInitSingleDataFinshed = false;

  public editDefaultDataOption = {
    age: [],      //  年龄
    gender: -1,     // 性别
    allRegion: 1,      //  投放地域
    region: [],     //  地域id
    app_category: [],     // app分类
    audience_targeting: -1,     //  自定义人群
    include_audience: [],     //  包含人群
    exclude_audience: [],     //  排除人群
    interest: [],     //  兴趣
    network_env: "11",      //  网络环境
    platform: [],     //  操作系统
    auto_expand: [],      //  智能定向升级
    convert_filter: 0,      //  转化过滤
    intelli_targeting: 500,      //  用户智能
    app_category_slt: 'nolimit',  // 是否指定app分类
    interest_slt: 'nolimit',  // 是否指定兴趣分类
    cityList: {
      list: [],
      resultData: []
    },
    countyList: {
      list: [],
      resultData: []
    },
    ageList: {
      resultData: [],
      checked: true,
    },
    platformList: {
      resultData: [],
      checked: true,
    },
    // app分类
    appCategoryList: {
      list: [],
      resultData: []
    },
    // 兴趣分类
    interestList: {
      list:[],
      resultData: []
    },
    // 定向人群
    includeList: {
      list: [],
      resultData: []
    },
    // 排除人群
    excludeList: {
      list: [],
      resultData: []
    }
  };


  constructor(private launchService: LaunchService,
              private authService: AuthService,
              private message: NzMessageService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.initConfigData();
  }

  initConfigData() {
    if(this.targetConfig) {
      this.isInitSingleDataFinshed = false;
      this.targetConfig['age']['sub'].forEach(item => {
        item.checked = false;
      });
      this.targetConfig['platform']['sub'].forEach(item => {
        item.checked = false;
      });
      this.editDefaultDataOption.ageList.resultData = [-1];
      this.editDefaultDataOption.platformList.resultData = ['111'];
      this.editDefaultDataOption.cityList.list = this.targetConfig.province;
      this.editDefaultDataOption.countyList.list = this.targetConfig.country;
      this.editDefaultDataOption.interestList.list = this.targetConfig.interest.sub;
      this.editDefaultDataOption.appCategoryList.list = this.targetConfig.appcategory.sub;
      if(!this.isRemoveTargetingAudience) {
        this.editDefaultDataOption.includeList.list = deepCopy(this.audienceConfigList);
        this.editDefaultDataOption.excludeList.list = deepCopy(this.audienceConfigList);
      }
      this.objectiveTypeChange();
      this.initSingleData(this.data.targetings);
      const setting = this.getResultData();
      this.data.targetings = {...setting};
      this.isInitSingleDataFinshed = true;
    }
  }

  getResultData() {
    const resultData = deepCopy(this.editDefaultDataOption);
    resultData.age = this.editDefaultDataOption.ageList.resultData;
    resultData.app_category = this.editDefaultDataOption.appCategoryList.resultData;
    resultData.include_audience = this.editDefaultDataOption.includeList.resultData;
    resultData.exclude_audience = this.editDefaultDataOption.excludeList.resultData;
    resultData.interest = this.editDefaultDataOption.interestList.resultData;
    resultData.platform = this.editDefaultDataOption.platformList.resultData;
    delete resultData.ageList;
    delete resultData.appCategoryList;
    delete resultData.includeList;
    delete resultData.excludeList;
    delete resultData.interestList;
    delete resultData.platformList;
    delete resultData.cityList;
    delete resultData.countyList;
    return resultData;
  }

  objectiveTypeChange() {
    this.targetConfig['platform']['sub'].forEach(item => {
      item.disabled = false;
      if(this.objectiveType === '2') {
        item.checked = false;
        item.disabled = true;
        if(item.value === '001') {
          item.checked = true;
          this.editDefaultDataOption.platformList.resultData = [item.value];
          this.editDefaultDataOption.platformList.checked = false;
        }
      } else if(this.objectiveType === '4') {
        item.checked = false;
        item.disabled = true;
        if(item.value === '010') {
          item.checked = true;
          this.editDefaultDataOption.platformList.resultData = [item.value];
          this.editDefaultDataOption.platformList.checked = false;
        }
      }
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['objectiveType'] && !changes['objectiveType'].firstChange) {
      this.objectiveTypeChange();
    }
  }

  initSingleData(basicData) {
    if(Object.keys(basicData).length) {
      basicData.allRegion === 0 ? this.editDefaultDataOption.cityList.resultData = basicData.region : this.editDefaultDataOption.countyList.resultData = basicData.region;
      this.editDefaultDataOption.ageList.resultData = basicData.age;
      this.editDefaultDataOption.appCategoryList.resultData = basicData.app_category;
      this.editDefaultDataOption.interestList.resultData = basicData.interest;
      this.editDefaultDataOption.platformList.resultData = basicData.platform;
      if(!this.isRemoveTargetingAudience) {
        this.editDefaultDataOption.includeList.resultData = basicData.include_audience;
        this.editDefaultDataOption.excludeList.resultData = basicData.exclude_audience;
      }
      this.targetConfig['age']['sub'].forEach(item => {
        if(basicData.age.indexOf(item.value) !== -1) {
          item.checked = true;
          this.editDefaultDataOption.ageList.checked = false;
        }
      });
      this.targetConfig['platform']['sub'].forEach(item => {
        if(basicData.platform.indexOf(item.value) !== -1) {
          item.checked = true;
          this.editDefaultDataOption.platformList.checked = false;
        }
      });
      this.targetConfig['auto_expand']['sub'].forEach(item => {
        if(basicData.auto_expand.indexOf(item.value) !== -1) {
          item.checked = true;
        }
      });
      this.editDefaultDataOption = {...this.editDefaultDataOption,...basicData};
    }
  }

  ngAfterViewChecked() {
    if (this.isInitSingleDataFinshed) {
      const setting = this.getResultData();
      this.data.targetings = {...setting};
    }
  }

  transferTreeChange(sourceData, data: any[],type) {
    sourceData.resultData = [...data];
    if(type === 'region') {
      this.editDefaultDataOption.region = [...data];
      if(this.editDefaultDataOption.allRegion === 0) {
        this.editDefaultDataOption.cityList = {...sourceData};
      } else {
        this.editDefaultDataOption.countyList = {...sourceData};
      }
    } else if(type === 'interest') {
      this.editDefaultDataOption.interestList = {...sourceData};
    } else if(type === 'app_category') {
      this.editDefaultDataOption.appCategoryList = {...sourceData};
    }
  }

  updateSingleChecked(data,type) {
    if(type === 'age') {
      this.editDefaultDataOption.ageList.checked = false;
      this.editDefaultDataOption.ageList.resultData = [];
      if(data.every(item => !item.checked)) {
        this.editDefaultDataOption.ageList.checked = true;
        this.editDefaultDataOption.ageList.resultData = [-1];
      } else {
        data.forEach(item => {
          if(item.checked) {
            this.editDefaultDataOption.ageList.resultData.push(item.value);
          }
        });
      }
    } else if(type === 'auto_expand') {
      this.editDefaultDataOption.auto_expand = [];
      data.forEach(item => {
        if(item.checked) {
          this.editDefaultDataOption.auto_expand.push(item.value);
        }
      });
    } else if(type === 'platform') {
      this.editDefaultDataOption.platformList.checked = false;
      this.editDefaultDataOption.platformList.resultData = [];
      if(this.objectiveType === '1') {
        if(data.every(item => !item.checked)) {
          this.editDefaultDataOption.platformList.checked = true;
          this.editDefaultDataOption.platformList.resultData = ['111'];
        } else {
          data.forEach(item => {
            if(item.checked) {
              this.editDefaultDataOption.platformList.resultData.push(item.value);
            }
          });
        }
      }
    }
  }

  changeNoLimit(type) {
    if(type === 'age') {
      if(!this.editDefaultDataOption.ageList.checked) {
        this.editDefaultDataOption.ageList.resultData = [];
      } else {
        this.editDefaultDataOption.ageList.resultData = [-1];
        this.targetConfig['age']['sub'].forEach(item => {
          item.checked = false;
        });
      }

    } else if(type === 'platform') {
      if(!this.editDefaultDataOption.platformList.checked) {
        this.editDefaultDataOption.platformList.resultData = [];
      } else {
        this.editDefaultDataOption.platformList.resultData = ['111'];
        this.targetConfig['platform']['sub'].forEach(item => {
          item.checked = false;
        });
      }
    }
  }

  changeAudience(event: NzFormatEmitEvent,type) {
    if(type === 'crowd') {
      this.editDefaultDataOption.includeList.resultData = [...event.keys];
    } else if(type === 'exclude') {
      this.editDefaultDataOption.excludeList.resultData = [...event.keys];
    }
  }

  treeCrowdOnCheck(event: NzFormatEmitEvent): void {
    this.editDefaultDataOption.includeList.resultData = [...event.keys];

    this.editDefaultDataOption.excludeList.list.forEach(item => {
      item['disabled'] = event.keys.indexOf(item.key) > -1;
    });
    this.editDefaultDataOption.excludeList.list = [...this.editDefaultDataOption.excludeList.list];
  }

  treeExcludeCrowdOnCheck(event: NzFormatEmitEvent): void {
    this.editDefaultDataOption.excludeList.resultData = [...event.keys];

    this.editDefaultDataOption.includeList.list.forEach(item => {
      item['disabled'] = event.keys.indexOf(item.key) > -1;
    });
    this.editDefaultDataOption.includeList.list = [...this.editDefaultDataOption.includeList.list];
  }

  changeAudienceType() {
    this.editDefaultDataOption.includeList.resultData = [];
    this.editDefaultDataOption.excludeList.resultData = [];
    this.editDefaultDataOption.includeList.list.forEach(item => {
      item['disabled'] = false;
    });
    this.editDefaultDataOption.excludeList.list.forEach(item => {
      item['disabled'] = false;
    });
  }

}
