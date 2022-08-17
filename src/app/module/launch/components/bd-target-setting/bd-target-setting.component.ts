import {
  AfterViewChecked,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef
} from '@angular/core';
import { isArray } from "@jzl/jzl-util";
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { zip } from "rxjs";
import { DataViewService } from "../../../../routes/data-view-feed/service/data-view.service";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../notify/notify.service";
import { LaunchService } from "../../service/launch.service";
import { MaterialsService } from "../../../../routes/materials/service/materials.service";
import set = Reflect.set;

@Component({
  selector: 'app-bd-target-setting',
  templateUrl: './bd-target-setting.component.html',
  styleUrls: ['./bd-target-setting.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BdTargetSettingComponent implements OnInit, OnChanges, AfterViewChecked {
  @ViewChild('curTextArea') curTextArea: ElementRef;
  @Input() isRemoveTargetingAudience;

  @Input() curGroupFlag = 'catalogue';
  @Input() targetSource;
  @Input() catalogId;
  @Input() campaignTypeSetting;
  @Input() structConfig;
  @Input() chan_pub_id = 0;

  public cursorPosition = 0;

  public launchTemplateGroupData = {
    'catalogue': [ // 营销目标: 商品目录
      "pa_keywords", // 商品定向
      "show_words", // 买词方式
      "kt_filter", // 无效意图词过滤
      "auto_match", // 商品匹配
      "keywords_extend", // 用户行为
      "region", // 地域
      "age", // 年龄
      "sex", // 性别
      "new_interests", // 兴趣
      "pa_crowd", // 人群包
      "net", // 网络
      "education", // 学历
      "auto_expansion", // 自动扩量
    ],
    'catalogue_4': [ // 营销目标: 商品目录 且 投放流量: 百青藤
      "media_package_type", // 媒体
      "media_package", // 媒体选择
      // 仅投放支持调起的媒体
      "pa_keywords", // 商品定向
      "show_words", // 买词方式
      "kt_filter", // 无效意图词过滤
      "auto_match", // 商品匹配
      "keywords_extend", // 用户行为
      "region", // 地域
      "age", // 年龄
      "sex", // 性别
      "new_interests", // 兴趣
      "pa_crowd", // 人群包
      "net", // 网络
      "education", // 学历
      "auto_expansion", // 自动扩量
    ],
    'catalogue_landing': [ // 营销目标: 商品目录 且 投放目标: 落地页
      "pa_keywords", // 商品定向
      "show_words", // 买词方式
      "kt_filter", // 无效意图词过滤
      "auto_match", // 商品匹配
      "keywords_extend", // 用户行为
      "region", // 地域
      "age", // 年龄
      "sex", // 性别
      "new_interests", // 兴趣
      "pa_crowd", // 人群包
      "device", // 操作系统
      "net", // 网络
      "education", // 学历
      "auto_expansion", // 自动扩量
    ],
    catalogue_4_landing: [ // 营销目标: 商品目录 且 投放流量: 百青藤 且 投放目标: 落地页
      "media_package_type", // 媒体
      "media_package", // 媒体选择
      // 仅投放支持调起的媒体
      "pa_keywords", // 商品定向
      "show_words", // 买词方式
      "kt_filter", // 无效意图词过滤
      "auto_match", // 商品匹配
      "keywords_extend", // 用户行为
      "region", // 地域
      "age", // 年龄
      "sex", // 性别
      "new_interests", // 兴趣
      "pa_crowd", // 人群包
      "device", // 操作系统
      "net", // 网络
      "education", // 学历
      "auto_expansion", // 自动扩量
    ],
  };

  public editDefaultDataOption = {
    media_package: {
      "name": "媒体选择",
      "form_type": "media_package_radio",
      "radioValue": 0,
      "resultValue": 0,
      "sub": [
        {
          "label": "优选媒体包",
          "value": 0,
          "checked": true
        },
        {
          "label": "公测媒体包",
          "value": 3,
          "checked": false
        }
      ],
      combine_data: {
        "one_extra": {
          relation: "media_package",
          sub0: [],
          sub3: [],
          resultList: []
        }
      }
    },

    pa_keywords: {
      "name": "商品定向",
      "form_type": "radio",
      "radioValue": 0,
      "resultValue": 0,
      "sub": [
        {
          "label": "不限",
          "value": 0,
          "checked": true
        },
        {
          "label": "商品意图",
          "value": 'pa_keywords',
          "checked": false,
          "disabled": ['new_interests.radioValue.interests'],
        }
      ],
    },

    show_words: {
      "name": "买词方式",
      "form_type": "show_words_checkbox",
      "resultValue": [],
      "sub": [{
        "label": "直接填写意图词",
        "value": 1,
        "checked": false
      }, {
        "label": "商品意图词模板",
        "value": 2,
        "checked": false
      },],
      combine_data: {
        "1": {
          sub: [],
          group_id: null,
          result: null,
          resultList: [],
        },
        "2": {
          sub: [],
          result: null,
          resultList: [],
        },
      }
    },

    new_interests: {
      "name": "兴趣",
      "form_type": "one_extra_radio",
      "suffix": "",
      "radioValue": 0,
      "resultValue": '',
      "sub": [
        {
          "label": "不限",
          "value": 0,
          "checked": false
        },
        {
          "label": "人群兴趣点",
          "value": "interests",
          "checked": false,
          "disabled": ['pa_keywords.resultValue.pa_keywords'],
        },
      ],
      combine_data: {
        "one_extra": {
          relation: "interests",
          sub: [],
          resultList: []
        }
      }
    },

    region: {
      "name": "地域",
      "form_type": "one_extra_radio",
      "suffix": "",
      "radioValue": 9999999,
      "resultValue": '',
      "sub": [
        {
          "label": "不限",
          "value": 9999999,
          "checked": false
        },
        {
          "label": "按省市",
          "value": "region",
          "checked": false
        },
      ],
      combine_data: {
        "one_extra": {
          relation: "region",
          sub: [],
          resultList: []
        }
      },
    },

    pa_crowd: {
      "form_type": "pa_crowd_checkbox",
      "name": "人群包",
      "resultValue": [0],
      "desc": "多选格式如下:{\"basic\":[121,11223],\"common\":[223,23],\"exclude\":[321,31223]}",
      "sub": [{
        "label": "不限",
        "value": 0,
        "checked": true
      }, {
        "label": "基础人群",
        "value": 'basic',
        "checked": false
      }, {
        "label": "交叉人群",
        "value": 'common',
        "checked": false
      }, {
        "label": "排除人群",
        "value": 'exclude',
        "checked": false
      }],
      combine_data: {
        "basic": {
          sub: [],
          resultList: []
        },
        "common": {
          sub: [],
          resultList: []
        },
        "exclude": {
          sub: [],
          resultList: []
        }
      }
    },
  };

  public editDefaultDataOptionBak = {};

  public isInitFinshed = false;
  public isInitSingleDataFinshed = false;

  public isIntentionWordChanged = false;

  public cid;

  constructor(
    private message: NzMessageService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private modalService: NzModalService,
    private dataViewService: DataViewService,
    private launchService: LaunchService,
    private materialsService: MaterialsService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;

  }

  ngOnInit() {
    this.initConfigList();
    this.getProductWordsTemplateList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['catalogId']) {
      this.getProductWordsTemplateList();
    }
  }

  ngAfterViewChecked() {
    if (this.isInitSingleDataFinshed) {
      const setting = this.generateResultData();
      this.targetSource.audience_setting = { ...setting };
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

    const getMediaPackages = this.launchService.getMediaPackages({
      chan_pub_id: this.chan_pub_id,
      cid: this.cid,
    });

    const getRegionAndInterest = this.launchService.getRegionAndInterest();

    const getCustomCrowdList = this.launchService.getCustomCrowdList({
      chan_pub_id: this.chan_pub_id,
      cid: this.cid,
    });

    const getIntentionWordGroupList = this.launchService.getIntentionWordGroupList({
      cid: this.cid,
    });


    const getStructConfig = this.launchService.getBdFeedStructConfig();

    zip(getMediaPackages, getRegionAndInterest, getCustomCrowdList, getIntentionWordGroupList, getStructConfig).subscribe(([mediaList, regionAndInterestList, customCrowdList, intentionWordGroupList, structConfig]) => {

      if (mediaList['status_code'] && mediaList.status_code === 200) {
        const mediaData = mediaList['data'];
        this.editDefaultDataOption.media_package.combine_data.one_extra.sub0 = JSON.parse(JSON.stringify(mediaData[0]));
        this.editDefaultDataOption.media_package.combine_data.one_extra.sub3 = JSON.parse(JSON.stringify(mediaData[3]));
      }

      if (regionAndInterestList['status_code'] && regionAndInterestList['status_code'] === 200) {
        const regionAndInterestData = regionAndInterestList['data'];
        this.editDefaultDataOption.region.combine_data.one_extra.sub = JSON.parse(JSON.stringify(regionAndInterestData['biz_region']));
        this.editDefaultDataOption.new_interests.combine_data.one_extra.sub = JSON.parse(JSON.stringify(regionAndInterestData['new_interests']));
      }

      if (customCrowdList['status_code'] && customCrowdList['status_code'] === 200) {
        const customCrowdData = customCrowdList['data'];
        this.editDefaultDataOption.pa_crowd.combine_data['basic'].sub = JSON.parse(JSON.stringify(customCrowdData));
        this.editDefaultDataOption.pa_crowd.combine_data['common'].sub = JSON.parse(JSON.stringify(customCrowdData));
        this.editDefaultDataOption.pa_crowd.combine_data['exclude'].sub = JSON.parse(JSON.stringify(customCrowdData));
      }

      if (intentionWordGroupList['status_code'] && intentionWordGroupList['status_code'] === 200) {
        const intentionWordGroupData = intentionWordGroupList['data'];
        this.editDefaultDataOption.show_words.combine_data['1'].sub = JSON.parse(JSON.stringify(intentionWordGroupData));
      }

      const resultData = structConfig['audience_setting'];
      Object.keys(resultData).forEach(itemKey => {
        if (resultData[itemKey].form_type == 'radio') {
          const rangData = resultData[itemKey];
          if (isArray(rangData['sub']) && rangData['sub'].length > 0) {
            rangData['resultValue'] = rangData['sub'][0]['value'];
          }

        }

        if (itemKey !== 'media_package' && itemKey !== 'pa_keywords' && itemKey !== 'show_words' && itemKey !== 'new_interests' && itemKey !== 'region' && itemKey !== 'pa_crowd') {
          this.editDefaultDataOption[itemKey] = resultData[itemKey];
        }

      });
      this.editDefaultDataOptionBak = JSON.parse(JSON.stringify(this.editDefaultDataOption));

      this.initSingleData(this.targetSource.audience_setting);
      this.isInitFinshed = true;

    }, (err) => {

    });
  }

  initSingleData(audienceData) {

    // audienceData = {"media_package_type":1,"pa_keywords":"pa_keywords","show_words":[{"show_word":"竞价","type":1},{"show_word":"排名","type":1},{"show_word":"营销","type":1},{"show_word":"用户画像","type":1},{"show_word":"${id}","type":2},{"show_word":"${name}","type":2},{"show_word":"${price}","type":2},{"show_word":"a","type":2},{"show_word":"b","type":2}],"media_package":[1030000053, 1030000052],"media_package_slt": 3,"kt_filter":1,"auto_match":0,"keywords_extend":"2","region":[1000,2000],"age":[1,2],"sem":2,"new_interests":[50,51],"pa_crowd":{"basic":["120102402","123102673"],"common":["120102402"],"exclude":["120102402"]},"device":[1],"net":2,"education":[1,3],"auto_expansion":"0"};

    // this.editDefaultDataOption = JSON.parse(JSON.stringify(this.editDefaultDataOptionBak));
    // setTimeout(() => {
    Object.keys(this.editDefaultDataOption).forEach(item => {

      const currentAudienceData = audienceData[item];
      const currentAudienceConfig = this.editDefaultDataOption[item];
      if (currentAudienceConfig['form_type'] == 'show_words_checkbox') {
        if (audienceData['show_words'] && audienceData['show_words'].length) {
          const result = {
            '1': [],
            '2': [],
          };

          audienceData['show_words'].forEach(word => {
            if (word.type === 1) { // 直接填写意图词
              result['1'].push(word.show_word);
            } else if (word.type === 2) { // 商品意图词模板
              result['2'].push(word.show_word);
            }
          });

          if (result['1'].length) {
            currentAudienceConfig['resultValue'].push(1);
            currentAudienceConfig['combine_data']['1']['result'] = result['1'].join('\r\n');
            currentAudienceConfig['combine_data']['1']['resultList'] = [...result['1']];
          }

          if (result['2'].length) {
            currentAudienceConfig['resultValue'].push(2);
            currentAudienceConfig['combine_data']['2']['result'] = result['2'].join('\r\n');
            currentAudienceConfig['combine_data']['2']['resultList'] = [...result['2']];
          }

          currentAudienceConfig.sub.forEach(subItem => {
            if (currentAudienceConfig['resultValue'].indexOf(subItem['value']) > -1) {
              subItem['checked'] = true;
            } else {
              subItem['checked'] = false;
            }
          });
        }
      } else if (currentAudienceConfig['form_type'] == 'pa_crowd_checkbox') {
        if (audienceData['pa_crowd'] && Object.keys(audienceData['pa_crowd']).length) {
          currentAudienceConfig['resultValue'] = [];
          if (audienceData['pa_crowd']['basic'].length) {
            currentAudienceConfig['resultValue'].push('basic');
            currentAudienceConfig['combine_data']['basic']['resultList'] = audienceData['pa_crowd']['basic'];
          }
          if (audienceData['pa_crowd']['common'].length) {
            currentAudienceConfig['resultValue'].push('common');
            currentAudienceConfig['combine_data']['common']['resultList'] = audienceData['pa_crowd']['common'];
          }
          if (audienceData['pa_crowd']['exclude'].length) {
            currentAudienceConfig['resultValue'].push('exclude');
            currentAudienceConfig['combine_data']['exclude']['resultList'] = audienceData['pa_crowd']['exclude'];
          }
        }
      } else if (currentAudienceConfig['form_type'] == 'media_package_radio') {
        if (audienceData['media_package'] && audienceData['media_package'].length) {
          currentAudienceConfig['resultValue'] = audienceData['media_package_slt'];
          currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['media_package']];
        }
      } else if (item == 'new_interests') {
        if (currentAudienceData !== undefined) {
          if (isArray(audienceData['new_interests']) && audienceData['new_interests'].length > 0) {
            currentAudienceConfig['radioValue'] = 'interests';
            currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['new_interests']];
          }
        }

      } else if (item == 'region') {
        if (currentAudienceData !== undefined) {
          if (isArray(audienceData['region']) && audienceData['region'].length > 0) {
            currentAudienceConfig['radioValue'] = 'region';
            currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['region']];
          }
        }

      } else if (currentAudienceData !== undefined) {
        if (currentAudienceConfig['form_type'] == 'checkbox') {
          currentAudienceConfig.sub.forEach(subItem => {
            if (currentAudienceData.indexOf(subItem['value']) > -1) {
              subItem['checked'] = true;
            } else {
              subItem['checked'] = false;
            }
          });
        } else if (currentAudienceConfig['form_type'] == 'radio') {
          currentAudienceConfig['resultValue'] = currentAudienceData;
          if (item == 'auto_extend_enabled') {
            currentAudienceConfig['resultValue'] = '' + currentAudienceData;
          }
        }
      }
    });

    const setting = this.generateResultData();
    this.targetSource.audience_setting = { ...setting };
    this.isInitSingleDataFinshed = true;


    // }, 0);
  }

  getProductWordsTemplateList() {
    this.editDefaultDataOption['show_words']['combine_data']['2'].sub = [];

    const body = {
      chan_pub_id: this.chan_pub_id,
      catalogue_id: this.catalogId,
      cid: this.cid,
    };

    this.launchService
      .getProductWordsTemplateList(body)
      .subscribe(
        (results: any) => {

          if (results.status_code && results.status_code !== 200) {

          } else {
            this.editDefaultDataOption['show_words']['combine_data']['2'].sub = [...results['data']];
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  updateSingleChecked(itemKey, curItem?): void {
    let checkedNum = 0;
    this.editDefaultDataOption[itemKey].sub.forEach(item => {
      if (curItem === 0 && item.value !== 0) {
        item.checked = false;
      } else if (curItem !== 0 && item.value === 0) {
        item.checked = false;
      }

      if (item.value !== 0 && item.checked) {
        checkedNum++;
      }
    });

    if (checkedNum === 0 || checkedNum === this.editDefaultDataOption[itemKey].sub.length - 1) {
      setTimeout(() => {
        this.editDefaultDataOption[itemKey].sub.forEach(item => {
          item.checked = false;
          if (item.value === 0) {
            item.checked = true;
          }
        });
      }, 0);

    }
  }

  intentionWordGroupChange(event, combineData) {
    combineData.resultList = [];
    combineData.result = null;

    this.launchService.getIntentionWordByGroupId({}, { group_id: event, cid: this.cid }).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        const wordNameList = result.data.map(item => item.word_name);
        if (wordNameList.length) {
          combineData.result = wordNameList.join('\r\n');

          const resultList = combineData.result.split(/[(\r\n)\r\n]+/); // 根据换行或者回车进行识别
          resultList.slice(0, 1900);

          combineData.resultList = [...resultList];
        }

      } else if (result['status_code'] && result.status_code === 205) {

      } else {

      }
    }, (err) => {

    }, () => {
    });
  }

  intentionWordChanged() {
    this.isIntentionWordChanged = true;
  }

  intentionWordBlur(combineData, tag) {
    if (!this.isIntentionWordChanged) {
      return;
    }

    const resultList = combineData.result.split(/[(\r\n)\r\n]+/); // 根据换行或者回车进行识别

    if (tag === 1) { // 直接意图词
      resultList.slice(0, 50);
    } else if (tag === 2) { // 商品意图词
      resultList.forEach((item, idx) => {
        if (item.length < 1 || item.length > 40) {
          resultList.splice(idx, 1);
        }
      });
      resultList.slice(0, 1900);
    }

    combineData.resultList = [...resultList];

    this.isIntentionWordChanged = false;
  }

  addProuduct(combineData, value) {
    const tagValueLength = value.length + 2;

    const curInput = this.curTextArea.nativeElement;
    this.cursorPosition = curInput.selectionStart;

    const stringObj = this.materialsService.getStringByPosition(curInput.selectionStart, curInput.selectionEnd, curInput.value);
    combineData.result = stringObj.startStr + value + stringObj.endStr;
    curInput.value = combineData.result;

    const resultList = combineData.result.split(/[(\r\n)\r\n]+/); // 根据换行或者回车进行识别
    const setAry = new Set(resultList);
    combineData.resultList = [...setAry];

    this.cursorPosition += tagValueLength;

    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核

    } else {
      curInput.select();
      curInput.selectionStart = this.cursorPosition;
      curInput.selectionEnd = this.cursorPosition;
    }
  }

  addAllProuduct(combineData) {
    combineData.sub.forEach(item => {
      if (!combineData.resultList.includes(item.value)) {
        combineData.resultList.push(item.value);
      }
    });

    combineData.result = combineData.resultList.join('\r\n');


  }

  delAllProuduct(combineData) {
    combineData.result = null;
    combineData.resultList = [];

  }

  paCrowdTreeOnCheck(event: NzFormatEmitEvent, tag): void {
    this.editDefaultDataOption.pa_crowd.combine_data[tag].resultList = [...event.keys];
  }

  showWordsCheckedChange(curItem, dataAry, itemKey) {
    const result = [];
    dataAry.forEach(item => {
      if (item.checked) {
        result.push(item.value);
      }
    });

    this.editDefaultDataOption[itemKey].resultValue = [...result];
  }

  paCrowdCheckedChange(curItem, dataAry, itemKey) {
    const result = [];
    dataAry.forEach(item => {
      if (curItem.value !== 0 && curItem.checked && item.value === 0) {
        item.checked = false;
      } else if (curItem.value === 0 && curItem.checked && item.value !== 0) {
        item.checked = false;
      }

      if (curItem.value === 'basic' && !curItem.checked && item.value === 'common') {
        item.checked = false;
      }

      if (item.checked) {
        result.push(item.value);
      }
    });


    if (!result.length || (result.length === 1 && result.indexOf(0) !== -1)) {
      dataAry[0].checked = true;
      result.push(dataAry[0].value);
    }

    this.editDefaultDataOption[itemKey].resultValue = [...result];
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

      } else if (currentItemObj !== undefined && (currentItemObj["form_type"] == 'one_extra_radio')) {
        if (item == 'new_interests') {
          if (currentItemObj['radioValue'] == 'interests') {
            resultData['new_interests'] = [];
            resultData['new_interests'] = [...currentItemObj['combine_data']['one_extra']['resultList']];
          }
        } else if (item == 'region') {
          if (currentItemObj['radioValue'] == 'region') {
            resultData['region'] = [];
            resultData['region'] = [...currentItemObj['combine_data']['one_extra']['resultList']];
          }
        }
      } else if (currentItemObj !== undefined && (currentItemObj["form_type"] == 'media_package_radio')) {
        if (this.editDefaultDataOption['media_package_type'].resultValue === 1) {
          if (currentItemObj['resultValue'] !== undefined) {
            resultData['media_package_slt'] = currentItemObj['resultValue'];
          }
          resultData['media_package'] = [];
          resultData['media_package'] = [...currentItemObj['combine_data']['one_extra']['resultList']];
        }
      } else if (currentItemObj !== undefined && (currentItemObj["form_type"] == 'show_words_checkbox')) {
        if (currentItemObj['resultValue'].length && resultData['pa_keywords'] === 'pa_keywords') {
          resultData['show_words'] = [];

          // 直接填写意图词
          if (currentItemObj['resultValue'].indexOf(1) !== -1) {
            const resultList = currentItemObj['combine_data']['1']['resultList'];
            resultList.forEach(word => {
              resultData['show_words'].push({
                show_word: word,
                type: 1
              });
            });
          }

          // 商品意图词模板
          if (currentItemObj['resultValue'].indexOf(2) !== -1) {
            const resultList = currentItemObj['combine_data']['2']['resultList'];
            resultList.forEach(word => {
              resultData['show_words'].push({
                show_word: word,
                type: 2
              });
            });
          }
        }
      } else if (currentItemObj !== undefined && (currentItemObj["form_type"] == 'pa_crowd_checkbox')) {
        if (currentItemObj['resultValue'].indexOf(0) === -1) {
          resultData['pa_crowd'] = {
            'basic': [],
            'common': [],
            'exclude': [],
          };
          if (currentItemObj['resultValue'].indexOf('basic') !== -1) {
            resultData['pa_crowd']['basic'] = [...currentItemObj['combine_data']['basic']['resultList']];
          }

          if (currentItemObj['resultValue'].indexOf('common') !== -1) {
            resultData['pa_crowd']['common'] = [...currentItemObj['combine_data']['common']['resultList']];
          }

          if (currentItemObj['resultValue'].indexOf('exclude') !== -1) {
            resultData['pa_crowd']['exclude'] = [...currentItemObj['combine_data']['exclude']['resultList']];
          }
        }
      }
    });

    if (this.campaignTypeSetting.launch_target === 'app') {
      resultData['device'] = this.campaignTypeSetting.operating_system === 'android' ? [2] : [1];
    }

    // console.log(resultData);
    return resultData;
  }


  checkDisabled(disabledSetting = []) {
    let disabled = false;
    if (disabledSetting) {
      disabledSetting.some(item => {
        const checkRule = item.split('.');
        if (checkRule.length !== 3) {
          return false;
        }

        if (this.editDefaultDataOption[checkRule[0]] && this.editDefaultDataOption[checkRule[0]][checkRule[1]] == checkRule[2]) {
          disabled = true;
          return true;
        }
        return false;

      });
    }
    return disabled;
  }

}
