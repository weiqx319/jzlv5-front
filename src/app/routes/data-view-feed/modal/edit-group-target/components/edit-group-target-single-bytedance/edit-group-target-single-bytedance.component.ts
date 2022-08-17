import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { NzFormatEmitEvent, NzTreeNode } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DataViewAddEditService } from '../../../../service/data-view-add-edit.service';
import { AuthService } from '../../../../../../core/service/auth.service';
import { NotifyService } from '../../../../../../module/notify/notify.service';
import { DataViewService } from "../../../../service/data-view.service";
import { DataViewEditWrapService } from "../../../../service/data-view-edit-wrap.service";
import { isArray } from "@jzl/jzl-util";
import { zip } from 'rxjs';
import { contains } from 'html2canvas/dist/types/core/bitwise';


@Component({
  selector: 'app-edit-group-target-single-bytedance',
  templateUrl: './edit-group-target-single-bytedance.component.html',
  styleUrls: ['./edit-group-target-single-bytedance.component.scss']
})
export class EditGroupTargetSingleBytedanceComponent implements OnInit, OnChanges {
  @Input() stringIdArray: any;
  @Input() selectData: any;
  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _http: DataViewAddEditService,
    private message: NzMessageService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private modalService: NzModalService,
    private dataViewService: DataViewService,
    private dataViewWrapService: DataViewEditWrapService,
  ) {
    this.publisherOption = this._http.getPublisherOption();
  }

  public publisherOption = {};
  public groupData = {};
  public publishId: any;
  public iswraing = false;
  public onlyOne = false;

  public allTargetKey = {
    retargeting_tags: "定向人群包",
    retargeting_tags_exclude: "排除人群包",
    districtText: "地域",
    gender: "性别",
    age: "年龄",
    aweme_account_fans: "账号粉丝相似人群",
    filter_aweme_abnormal_active: "过滤高活跃用户",
    own_aweme_number: "过滤自己粉丝",
    filter_aweme_fans_count: "过滤高关注数用户",
    ad_tag: "兴趣分类",
    action_scene: "行为场景",
    action_days: "行为天数",
    action_categories: "行为类目词",
    action_words: "行为关键词",
    interest_categories: "兴趣类目词",
    interest_words: "兴趣关键词",
    interest_tags: "兴趣关键词",
    aweme_fan_behaviors: "粉丝类型",
    aweme_fan_categories: "抖音号分类",
    aweme_fan_accounts: "抖音号",
    superior_popularity_type: "精选流量包",
    flow_package: "定向流量包",
    exclude_flow_package: "排除流量包",
    platform: "平台",
    device_type: "设备类型",
    ac: "网络",
    carrier: "运营商",
    activate_type: "新用户",
    new_app_category: "APP行为-按分类",
    new_app_ids: "APP行为-按APP",
    flow_precision: "智能定向",
    android_osv: "安卓版本",
    ios_osv: "iOS版本",
    article_category: "文章分类",
    hide_if_exists: "过滤已安装",
    device_brand: "手机品牌",
    launch_price: "手机价格",
    auto_extend_enabled: "智能放量"
  };

  public editDefaultDataGroup = [
    {
      "block_desc": "定向设置",
      "slot_list": [
        "district",
        "gender",
        "age",
        "targeting_audience",
        "ad_tag",
        'platform',
        'app_behavior_target',
        'auto_extend_enabled',
        "article_category",
        "ac",
        "carrier",
        "activate_type",
        "device_brand",
        "launch_price"
      ]
    },
  ];


  public editTargetGroupConfig = {
    target_list: {
      "is_edit": false,
      "is_open": false,
      "name": "定向包",
      "form_type": "target_list",
      "suffix": "",
      "sub": [],
      "target_id": "0",
    },
  };

  public editDefaultDataOption = {

    app_behavior_target: {
      "name": "App行为",
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
      "name": "兴趣分类",
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

    device_brand: {
      platformLimit: true,
      "name": "手机品牌",
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



    target_list: {
      "is_edit": false,
      "is_open": false,
      "name": "定向包",
      "form_type": "target_list",
      "suffix": "",
      "sub": [],
      "target_id": "0",
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

  private editDefaultDataOptionBak = {};


  ngOnInit() {
    this.publishId = 7;
    this.groupData = this.selectData.selected_data[0];
    if (this.selectData.selected_data.length === 1) {
      this.onlyOne = true;
    }
    this.initConfigList();
  }

  _showAdgroup() {

    this._http
      .showAdgroupTargetByteDance({
        chan_pub_id: this.selectData.selected_data[0].chan_pub_id,
        pub_account_id: this.selectData.selected_data[0].pub_account_id,
        pub_adgroup_id: this.selectData.selected_data[0].pub_adgroup_id
      })
      .subscribe(result => {
        if (result.status_code === 200) {
          if (result.data.audience_package_id !== undefined && result.data.audience_package_id != 0) {
            this.editTargetGroupConfig.target_list.target_id = result.data.audience_package_id + "";
            this.editTargetGroupConfig.target_list.is_open = true;
          }

          this.initSingleData(result.data['audience']);
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      });
  }


  initSingleData(audienceData) {
    this.editDefaultDataOption = JSON.parse(JSON.stringify(this.editDefaultDataOptionBak));
    setTimeout(() => {
      Object.keys(this.editDefaultDataOption).forEach(item => {

        const currentAudienceData = audienceData[item];
        const currentAudienceConfig = this.editDefaultDataOption[item];

        if (currentAudienceConfig['form_type'] == 'district_radio') {
          if (currentAudienceData !== undefined) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            currentAudienceConfig['radioValue'] = audienceData['district'];
            if (audienceData['district'] == 'CITY') {
              currentAudienceConfig['combine_data']['CITY']['resultList'] = audienceData['city'];
            } else if (audienceData['district'] == 'COUNTY') {
              currentAudienceConfig['combine_data']['COUNTY']['resultList'] = audienceData['city'];
            } else if (audienceData['district'] == 'BUSINESS_DISTRICT') {
              currentAudienceConfig['combine_data']['BUSINESS_DISTRICT']['resultList'] = audienceData['business_ids'];
            }

            currentAudienceConfig['location_type']['radioValue'] = audienceData['location_type'];
          }


        } else if (item == 'app_behavior_target') {
          if (currentAudienceData !== undefined) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            if (currentAudienceData === "CATEGORY") {
              currentAudienceConfig['radioValue'] = 'CATEGORY';
              currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['app_category']];
            } else {
              currentAudienceConfig['radioValue'] = 'NONE';
            }

          }


        } else if (item == 'ad_tag') {
          if (currentAudienceData !== undefined && isArray(currentAudienceData)) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
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
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            if (currentAudienceData !== 1) {
              currentAudienceConfig['radioValue'] = 'NONE';
            } else {
              currentAudienceConfig['radioValue'] = 'auto_extend_targets';
              currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['auto_extend_targets']];
            }

          }


        } else if (item == 'device_brand') {
          if (currentAudienceData !== undefined) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            if (isArray(audienceData['device_brand']) && audienceData['device_brand'].length > 1) {
              currentAudienceConfig['radioValue'] = 'brand';
              currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['device_brand']];
            }
          }


        } else if (item == 'article_category') {
          if (currentAudienceData !== undefined) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            if (isArray(audienceData['article_category']) && audienceData['article_category'].length > 1) {
              currentAudienceConfig['radioValue'] = 'article';
              currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['article_category']];
            }
          }


        } else if (item == 'launch_price') {
          currentAudienceConfig["is_edit"] = true;
          if (currentAudienceData !== undefined && isArray(currentAudienceData) && currentAudienceData.length > 0) {
            currentAudienceConfig["is_open"] = true;

            currentAudienceConfig['radioValue'] = 'price';
            currentAudienceConfig['priceResult'] = [...currentAudienceData];
          }
        } else if (currentAudienceConfig['form_type'] == 'targeting_audience') {
          const customAudienceData = audienceData['retargeting_tags_include'];
          const excludeCustomAudienceData = audienceData['retargeting_tags_exclude'];


          if (customAudienceData !== undefined && isArray(customAudienceData)) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            this.editDefaultDataOption.targeting_audience.combine_data.crowdResultList = [...customAudienceData.map((resultItem) => resultItem + "")];
            if (customAudienceData.length > 0) {
              currentAudienceConfig['radioValue'] = 'custom_audience';
            }
          }
          if (excludeCustomAudienceData !== undefined && isArray(excludeCustomAudienceData)) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
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
          currentAudienceConfig["is_open"] = true;
          currentAudienceConfig["is_edit"] = true;
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
          } else if (currentAudienceConfig['form_type'] == 'checkbox_tree') {
            if (isArray(currentAudienceData) && currentAudienceData.length > 0) {
              currentAudienceConfig['resultList'] = [...currentAudienceData.map((resultItem) => resultItem + "")];
            }
          }
        }
      });

      this.updateSingleChecked('platform');


    }, 0);
  }


  checkPage(): any[] {

    const errorMessage = [];


    if (this.editTargetGroupConfig.target_list.is_open && (this.editTargetGroupConfig.target_list.target_id == "0" || this.editTargetGroupConfig.target_list.target_id == undefined)) {
      errorMessage.push('定向包未选择，请选择');
    }

    Object.values(this.editDefaultDataOption).map(item => {
      if (item['form_type'] === 'checkbox') {
        if (item['is_edit']) {
          // @todo 理论上可忽略check
          return;
          // if (!item['NOLIMIT']  && item['sub'].every(subItem => !subItem.checked)) {
          //   errorMessage.push(item['name'] + '未选择，请选择');
          // }
        }
      } else if (item['form_type'] === 'radio') {
        if (item['is_edit']) {
          if (item['resultValue'] == undefined) {
            errorMessage.push(item['name'] + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'one_extra_radio' || item['form_type'] === "app_behavior_target_radio") {
        if (item['is_edit']) {
          if (item['radioValue'] != "NONE" && item['radioValue'] == item['combine_data']['one_extra']['relation'] && item["combine_data"]["one_extra"]["resultList"].length < 1) {
            errorMessage.push(item['name'] + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'district_radio') {
        if (item['is_edit']) {
          if (item['radioValue'] != "NONE" && item["combine_data"][item['radioValue']]["resultList"].length < 1) {
            errorMessage.push(item['name'] + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'checkbox_tree') {
        if (item['is_edit']) {
          if (item['resultList'] == undefined || (isArray(item['resultList']) && item['resultList'].length < 1)) {
            errorMessage.push(item['name'] + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'targeting_audience') {
        if (item['is_edit']) {
          const currentData = this.editDefaultDataOption.targeting_audience;
          // if (!((isArray(currentData.combine_data.custom_audience['resultList']) && currentData.combine_data.custom_audience['resultList'].length > 0) || (isArray(currentData.combine_data.excluded_custom_audience['resultList']) && currentData.combine_data.excluded_custom_audience['resultList'].length > 0) )) {
          //   errorMessage.push('人群未选择，请选择');
          // }
        }
      }


    });

    return errorMessage;


  }


  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      const errorMessage = this.checkPage();
      if (errorMessage.length > 0) {
        setTimeout(() => {
          const showMessage = errorMessage.join('<br/>');
          this.modalService.create({
            nzTitle: '错误提示',
            nzContent: showMessage,
            nzClosable: false,
            nzOkText: null,
            nzOnOk: () => new Promise(resolve => setTimeout(resolve, 0))
          });
        }, 0);

      } else {
        const postData = {};
        postData['edit_type'] = 'batch';
        postData["select_type"] = this.selectData.selected_type;
        postData["select_data_type"] = this.summaryType;
        postData["select_ids"] = this.selectData.selected_data_ids;

        if (this.selectData.selected_type == 'all') {
          postData["sheets_setting"] = this.selectData.allViewTableData;
        }
        if (this.selectData['selected_data_ids'].length === 1) {
          postData['edit_type'] = 'single';
        }

        if (this.editTargetGroupConfig.target_list.is_open && this.editTargetGroupConfig.target_list.target_id !== "0") {
          postData['data'] = { "audience_package_id": this.editTargetGroupConfig.target_list.target_id };

        } else {
          postData['data'] = { "targeting": this.generateResultData() };
          if (Object.values(postData['data']['targeting']).length < 1) {
            this.message.error('请选择修改项');
            return;
          }
        }




        this.is_saving.emit({
          'is_saving': true,
          'isHidden': 'true'
        });

        this.dataViewWrapService.editAdgroupTarget(this.publishId, postData, postData['edit_type']).subscribe(result => {
          if (result) {
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'false'
            });
          } else {
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'true'
            });
          }

        }, err => {
          this.is_saving.emit({
            'is_saving': false,
            'isHidden': 'true'
          });
        });

      }

    }
  }




  initConfigList(): void {
    let chanPubId = 0;
    if (this.selectData['account_list'].length == 1) {
      chanPubId = this.selectData['account_list'][0];
    }

    const postData = {};
    postData['edit_type'] = 'batch';
    postData["select_type"] = this.selectData.selected_type;
    postData["select_data_type"] = this.summaryType;
    postData["select_ids"] = this.selectData.selected_data_ids;


    const getByteDanceTargetAudienceList = this.dataViewService.getByteDanceTargetAudienceList(postData);
    const getByteDanceConfig$ = this.dataViewService.getByteDanceTargetConfig(chanPubId);

    zip(getByteDanceConfig$, getByteDanceTargetAudienceList).subscribe(([result, audienceList]) => {


      if (audienceList['status_code'] && audienceList.status_code === 200) {
        const audienceData = audienceList['data'];
        Object.keys(audienceList['data']).forEach(itemKey => {
          if (itemKey == 'audienceList') {
            this.editTargetGroupConfig.target_list.sub = [{ "id": "0", name: "请选择定向包" }, ...audienceData[itemKey]];
          } else if (itemKey == 'customtList') {
            this.editDefaultDataOption.targeting_audience.combine_data.crowdList = JSON.parse(JSON.stringify(audienceData['customtList']));
            this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdList = JSON.parse(JSON.stringify(audienceData['customtList']));
          }
        });
      }
      if (result['status_code'] && result.status_code === 200) {
        const resultData = result['data'];
        Object.keys(resultData).forEach(itemKey => {
          if (itemKey == 'device_brand') {
            this.editDefaultDataOption.device_brand.combine_data.one_extra.sub = [...resultData[itemKey]["sub"]];
          } else if (itemKey == 'article_category') {
            this.editDefaultDataOption.article_category.combine_data.one_extra.sub = [...resultData[itemKey]["sub"]];
          } else if (itemKey == 'app_category') {
            this.editDefaultDataOption.app_behavior_target.combine_data.one_extra.sub = [...resultData[itemKey]['sub']];
          } else if (itemKey == 'ad_tag') {
            this.editDefaultDataOption.ad_tag.combine_data.one_extra.sub = [...resultData[itemKey]['sub']];
          } else if (itemKey == 'auto_extend_enabled') {
            this.editDefaultDataOption.auto_extend_enabled.combine_data.one_extra.sub = [...resultData["auto_extend_targets"]['sub']];
          } else if (itemKey == 'auto_extend_targets') {

          } else if (itemKey == 'audienceList') {

          } else if (itemKey == 'customtList') {

          } else if (itemKey == 'region') {
            this.editDefaultDataOption.district.combine_data.BUSINESS_DISTRICT.sub = [...resultData[itemKey]];
          } else if (itemKey == 'prov_and_city') {
            this.editDefaultDataOption.district.combine_data.CITY.sub = [...resultData[itemKey]];
          } else if (itemKey == 'county') {
            this.editDefaultDataOption.district.combine_data.COUNTY.sub = [...resultData[itemKey]];
          } else {
            if (this.checkIsObject(resultData[itemKey])) {
              resultData[itemKey]['is_open'] = true;
            }

            if (this.checkIsObject(resultData[itemKey]) && resultData[itemKey].form_type == 'radio') {
              const rangData = resultData[itemKey];
              if (isArray(rangData['sub']) && rangData['sub'].length > 0) {
                rangData['resultValue'] = rangData['sub'][0]['value'];
              }

            } else if (this.checkIsObject(resultData[itemKey]) && resultData[itemKey].form_type == 'checkbox') {
              resultData[itemKey]['NOLIMIT'] = true;

            } else if (this.checkIsObject(resultData[itemKey]) && resultData[itemKey].form_type == 'range') {
              const rangData = resultData[itemKey];
              rangData.rangeValue = this.generateRangeData(itemKey, rangData.rangeStart, rangData.rangeEnd, rangData.range_options, rangData.suffix, rangData.endLess);

            } else if (this.checkIsObject(resultData[itemKey]) && resultData[itemKey].form_type == 'checkbox_tree') {
              resultData[itemKey]['resultList'] = [];
              resultData[itemKey]['getParentKey'] = itemKey != 'working_status';

            }

            this.editDefaultDataOption[itemKey] = resultData[itemKey];
          }


        });
        this.editDefaultDataOptionBak = JSON.parse(JSON.stringify(this.editDefaultDataOption));
        if (this.selectData.selected_data.length == 1) {
          this._showAdgroup();
        } else {
          this.updateSingleChecked('platform');
        }


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


  generateResultData() {
    const resultData = {};
    this.editDefaultDataGroup.forEach(blockItem => {
      blockItem.slot_list.forEach(item => {
        const currentItemObj = this.editDefaultDataOption[item];
        if (currentItemObj !== undefined && currentItemObj["form_type"] == 'checkbox') {
          if (currentItemObj.is_edit) {
            resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };

            if (!!currentItemObj['is_open']) {
              const tmpValue = [];
              currentItemObj.sub.forEach(subItem => {
                if (subItem.checked) {
                  tmpValue.push(subItem.value);
                }
              });
              resultData[item]['value'] = [...tmpValue];
            }
          }
        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'radio') {
          if (currentItemObj.is_edit) {
            resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };

            if (!!currentItemObj['is_open']) {
              const tmpValue = [];
              if (currentItemObj['resultValue'] !== undefined) {
                tmpValue.push(currentItemObj['resultValue']);
              }
              resultData[item]['value'] = [...tmpValue];
            }
          }
        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'range') {
          if (currentItemObj.is_edit) {
            resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };

            if (!!currentItemObj['is_open']) {
              const tmpValue = {};
              tmpValue['min'] = currentItemObj['rangeStartResult'];
              tmpValue['max'] = currentItemObj['rangeEndResult'];

              resultData[item]['value'] = [tmpValue];
            }
          }
        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'checkbox_tree') {
          if (currentItemObj.is_edit) {
            resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
            if (!!currentItemObj['is_open']) {
              if (isArray(currentItemObj['resultList']) && currentItemObj['resultList'].length > 0) {
                resultData[item]['value'] = [...currentItemObj['resultList']];
              }
            }
          }
        } else if (currentItemObj !== undefined && (currentItemObj["form_type"] == 'one_extra_radio' || currentItemObj["form_type"] == 'app_behavior_target_radio')) {
          if (currentItemObj.is_edit) {
            if (item == 'ad_tag') {
              resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
              if (currentItemObj['radioValue'] == 'SYSTEM') {
                resultData[item]['value'] = [0];
              } else if (currentItemObj['radioValue'] == 'ad_tag') {
                resultData[item]['value'] = currentItemObj['combine_data']['one_extra']['resultList'];
              }
            } else if (item == 'app_behavior_target') {
              if (currentItemObj['radioValue'] == 'CATEGORY') {
                resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: 'CATEGORY' };
                resultData['app_category'] = [];
                resultData['app_category'] = currentItemObj['combine_data']['one_extra']['resultList'];
              }
            } else if (item == 'auto_extend_enabled') {
              resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: 0 };
              resultData['auto_extend_targets'] = [];
              if (currentItemObj['radioValue'] == 'auto_extend_targets') {
                resultData[item]['value'] = 1;
                resultData['auto_extend_targets'] = currentItemObj['combine_data']['one_extra']['resultList'];
              } else {
                resultData[item]['value'] = 0;
              }
            } else {
              resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
              if (currentItemObj['radioValue'] !== 'NONE') {
                resultData[item]['value'] = currentItemObj['combine_data']['one_extra']['resultList'];
              }
            }
          }
        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'district_radio') {
          if (currentItemObj.is_edit) {
            resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: 'NONE' };
            resultData[item]['value'] = currentItemObj['radioValue'];
            if (currentItemObj['radioValue'] == 'CITY') {
              resultData['city'] = currentItemObj['combine_data']['CITY']['resultList'];
            } else if (currentItemObj['radioValue'] == 'COUNTRY') {
              resultData['county'] = currentItemObj['combine_data']['COUNTY']['resultList'];
            } else if (currentItemObj['radioValue'] == 'BUSINESS_DISTRICT') {
              resultData['business_ids'] = currentItemObj['combine_data']['BUSINESS_DISTRICT']['resultList'];
            }
          }


        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'launch_price_radio') {
          if (currentItemObj.is_edit) {
            resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
            if (currentItemObj['radioValue'] == 'price') {
              resultData[item]['value'] = [...currentItemObj['priceResult']];
            }
          }


        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'targeting_audience') {
          if (currentItemObj.is_edit) {

            const customAudience = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
            const excludeCustomAudience = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
            if (!!currentItemObj['is_open']) {
              customAudience['value'] = [...this.editDefaultDataOption.targeting_audience.combine_data.crowdResultList];
              excludeCustomAudience['value'] = [...this.editDefaultDataOption.targeting_audience.combine_data.excludeCrowdResultList];
            }
            resultData['retargeting_tags_include'] = customAudience;
            resultData['retargeting_tags_exclude'] = excludeCustomAudience;
          }
        }
      });
    });
    return resultData;

  }


  updateSingleChecked(itemKey): void {

    this.editDefaultDataOption[itemKey]["NOLIMIT"] = false;

    this.editDefaultDataOption[itemKey]["NOLIMIT"] = this.editDefaultDataOption[itemKey].sub.every(item => !item.checked);

    if (itemKey == 'platform') {
      if (!this.editDefaultDataOption[itemKey]['is_edit']) {
        this.editDefaultDataOption.app_behavior_target.platformLimit = true;
        this.editDefaultDataOption.app_behavior_target["is_edit"] = false;
        this.editDefaultDataOption.app_behavior_target.radioValue = "NONE";

        this.editDefaultDataOption.device_brand.platformLimit = true;
        this.editDefaultDataOption.device_brand["is_edit"] = false;
        this.editDefaultDataOption.device_brand.radioValue = "NONE";
        return;
      }


      const findAndroidChecked = this.editDefaultDataOption[itemKey].sub.find(item => {
        return item['value'] == 'ANDROID' && item['checked'] == true;
      });
      if (findAndroidChecked !== undefined) {
        this.editDefaultDataOption.app_behavior_target.platformLimit = false;
        this.editDefaultDataOption.device_brand.platformLimit = false;
      } else {
        if (this.editDefaultDataOption[itemKey]["NOLIMIT"]) {
          this.editDefaultDataOption.app_behavior_target.platformLimit = false;
          this.editDefaultDataOption.device_brand.platformLimit = false;
        } else {
          this.editDefaultDataOption.app_behavior_target.platformLimit = true;
          this.editDefaultDataOption.app_behavior_target["is_edit"] = false;
          this.editDefaultDataOption.app_behavior_target.radioValue = "NONE";

          this.editDefaultDataOption.device_brand.platformLimit = true;
          this.editDefaultDataOption.device_brand["is_edit"] = false;
          this.editDefaultDataOption.device_brand.radioValue = "NONE";
        }

      }
    }

  }


  updateLocationTypes(sub: any[]) {
    const allNoChecked = sub.every(item => !item.checked);
    if (allNoChecked && sub.length > 0) {
      sub[0].checked = true;

    }


  }




  checkIsObject(data) {
    return Object.prototype.toString.call(data) == '[object Object]';
  }


  generateTemperature(start, end): any {
    const result = [];
    let labelInit = -50;
    for (let i = start; i <= end; i++) {
      const currentLabel = labelInit + '℃';
      result.push({ value: i, label: currentLabel });
      labelInit++;
    }
    return result;


  }




  generateRangeData(rangeKey, start, end, rangeOption = [], suffix = '', endLess = false): any {
    if (rangeKey == 'temperature') {
      return this.generateTemperature(start, end);
    }
    const result = [];
    if (isArray(rangeOption) && rangeOption.length > 0) {
      rangeOption.map((item, key) => {
        let currentLabel = '';
        if (!!endLess && item == end) {
          currentLabel = '大于' + rangeOption[key - 1] + suffix;

        } else {
          currentLabel = item + suffix;
        }
        result.push({ value: item, label: currentLabel });
      });
      return result;
    }

    for (let i = start; i <= end; i++) {
      let currentLabel = i + suffix;
      if (!!endLess && i == end && rangeKey == 'age') {
        currentLabel = i + suffix + '及以上';
      } else if (!!endLess && i == end) {
        // @todo 需额外处理
        currentLabel = '大于' + i + suffix;
      }

      result.push({ value: i, label: currentLabel });
    }
    return result;
  }

  transferTreeChange(sourceData, data: any[]) {
    sourceData['resultList'] = [...data];

  }


  getTargetInfoById(targetId = "0") {
    if (targetId === "0") {
      return;
    }

    this._http.showBytedanceTargetById({
      chan_pub_id: this.selectData.selected_data[0].chan_pub_id,
      pub_account_id: this.selectData.selected_data[0].pub_account_id,
      audience_package_id: targetId
    }).subscribe(result => {
      if (result.status_code === 200) {
        this.initSingleData(result.data['audience']);
        // this.initSingleData(result.data);
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else if (result['status_code'] && result.status_code === 205) {
      } else {
        this.message.error(result.message);
      }
    });







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
        }
      }
    });



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

}
