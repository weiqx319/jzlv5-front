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


@Component({
  selector: 'app-edit-group-target-single-gdt',
  templateUrl: './edit-group-target-single-gdt.component.html',
  styleUrls: ['./edit-group-target-single-gdt.component.scss']
})
export class EditGroupTargetSingleGdtComponent implements OnInit, OnChanges {
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

  public editDefaultDataGroup = [
    {
      "block_desc": "人口学属性",
      "slot_list": [
        "geo_location",
        "age",
        "gender",
        "education",
        "marital_status",
        "working_status",
        "financial_situation",
        "consumption_type",
        "gamer_consumption_ability",
        "consumption_status",
        "residential_community_price"
      ]
    },
    {
      "block_desc": "用户行为",
      "slot_list": [
        "behavior_or_interest"
      ]
    },
    {
      "block_desc": "自定义人群",
      "slot_list": [
        "targeting_audience"
      ]
    },
    {
      "block_desc": "设备定向",
      "slot_list": [
        "device_brand_model",
        "network_scene",
        "user_os",
        "network_type",
        "network_operator",
        "device_price"
      ]
    },
    // {
    //   "block_desc": "行业优选",
    //   "slot_list": [
    //     "partner_tag"
    //   ]
    // },
    {
      "block_desc": "流量方属性",
      "slot_list": [
        "mobile_union_category",
        "wechat_official_account_category"
      ]
    },
    {
      "block_desc": "天气定向",
      "slot_list": [
        "temperature",
        "uv_index",
        "dressing_index",
        "makeup_index",
        "climate"
      ]
    }
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
    target_list: {
      "is_edit": false,
      "is_open": false,
      "name": "定向包",
      "form_type": "target_list",
      "suffix": "",
      "sub": [],
      "target_id": "0",
    },
    mobile_union_category: {
      "name": "移动媒体类型",
      "form_type": "checkbox_tree",
      "suffix": "",
      "sub": [],
    },
    targeting_audience: {
      "form_type": "targeting_audience",
      "name": "自定义人群",
      "suffix": "",
      combine_data: {
        custom_audience: {
          "name": "定向用户群",
          "form_type": "checkbox_tree",
          "suffix": "",
          "sub": [],
          "resultList": [],
        }, excluded_custom_audience: {
          "name": "排除用户群",
          "form_type": "checkbox_tree",
          "suffix": "",
          "sub": [],
          "resultList": [],
        },
      }
    },

    device_brand_model: {
      name: "设备品牌型号",
      group: "设备定向",
      form_type: "device_brand_model",
      sub: [],
      resultList: [],
      exclude: false,

    },
    wechat_official_account_category: {
      "name": "微信流量类型",
      "form_type": "checkbox_tree",
      "suffix": "",
      "sub": [],
      "resultList": [],
    },
    behavior_or_interest: {
      "form_type": "behavior_or_interest",
      "name": "行为兴趣",
      "suffix": "",
      "combine_data": {
        interest: {
          "name": "兴趣",
          "cname": "兴趣",
          "form_type": "checkbox_tree",
          "tips": "选择长期对某类事情有兴趣的用户",
          "sub": [],
          "resultList": [],
        },
        behavior: {
          "name": "行为",
          "form_type": "behavior",
          'combine_data': {
            behavior_category: {
              "name": "行为",
              "cname": "行为",
              "form_type": "checkbox_tree",
              "tips": "选择在特定场景有特定行为的用户",
              "sub": [],
              "resultList": [],
            },
            scene: {
              "name": "行为场景",
              "cname": "行为场景",
              "form_type": "checkbox",
              "tips": "行为场景",
              "sub": [
                {
                  "value": "BEHAVIOR_INTEREST_SCENE_ALL",
                  "label": ":",
                  "tips": "选择在腾讯各种场景下有相关行为的用户"
                },
                {
                  "value": "BEHAVIOR_INTEREST_SCENE_APP",
                  "label": "APP",
                  "tips": "选择在APP上有相关行为的用户"
                },
                {
                  "value": "BEHAVIOR_INTEREST_SCENE_ECOMMERCE",
                  "label": "电商",
                  "tips": "选择在电商上有相关行为的用户"
                },
                {
                  "value": "BEHAVIOR_INTEREST_SCENE_INFORMATION",
                  "label": "资讯",
                  "tips": "选择在资讯、阅读、搜索上有相关行为的用户"
                }
              ],
            },
            time_window: {
              "name": "行为时效性",
              "cname": "行为时效性",
              "form_type": "radio",
              "tips": "行为时效性",
              resultValue: 'BEHAVIOR_INTEREST_TIME_WINDOW_SEVEN_DAY',
              "sub": [
                {
                  "value": "BEHAVIOR_INTEREST_TIME_WINDOW_SEVEN_DAY",
                  "label": "7天"
                },
                {
                  "value": "BEHAVIOR_INTEREST_TIME_WINDOW_FIFTEEN_DAY",
                  "label": "15天"
                },
                {
                  "value": "BEHAVIOR_INTEREST_TIME_WINDOW_THIRTY_DAY",
                  "label": "30天"
                },
                {
                  "value": "BEHAVIOR_INTEREST_TIME_WINDOW_THREE_MONTH",
                  "label": "3个月"
                },
                {
                  "value": "BEHAVIOR_INTEREST_TIME_WINDOW_SIX_MONTH",
                  "label": "6个月"
                },
                {
                  "value": "BEHAVIOR_INTEREST_TIME_WINDOW_ONE_YEAR",
                  "label": "1年"
                }
              ],
            },
            strength: {
              "name": "行为强度",
              "cname": "行为强度",
              "form_type": "checkbox",
              "tips": "行为强度",
              "sub": [
                {
                  "value": "BEHAVIOR_INTEREST_INTENSITY_ALL",
                  "label": "不限",
                },
                {
                  "value": "BEHAVIOR_INTEREST_INTENSITY_HIGH",
                  "label": "高",
                },
              ],
            }
          },
        }
      }
    },
  };

  private editDefaultDataOptionBak = {};


  ngOnInit() {
    this.publishId = 6;
    this.groupData = this.selectData.selected_data[0];
    if (this.selectData.selected_data.length === 1) {
      this.onlyOne = true;
    }
    this.initConfigList();
  }

  _showAdgroup() {

    this._http
      .showAdgroupTargetGdt({
        chan_pub_id: this.selectData.selected_data[0].chan_pub_id,
        pub_account_id: this.selectData.selected_data[0].pub_account_id,
        pub_adgroup_id: this.selectData.selected_data[0].pub_adgroup_id
      })
      .subscribe(result => {
        if (result.status_code === 200) {
          if (result.data.pub_targeting_id !== undefined && result.data.pub_targeting_id != 0) {
            this.editTargetGroupConfig.target_list.target_id = result.data.pub_targeting_id + "";
            this.editTargetGroupConfig.target_list.is_open = true;
          }

          this.initSingleData(result.data);
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

        if (currentAudienceConfig['form_type'] == 'geo_location') {
          if (currentAudienceData !== undefined) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            currentAudienceConfig['resultList'] = [...currentAudienceData['regions']];
            currentAudienceConfig['location_types'].sub.forEach(typeItem => {
              if (isArray(currentAudienceData['location_types']) && currentAudienceData['location_types'].indexOf(typeItem['value']) > -1) {
                typeItem['checked'] = true;
              }
            });
          }


        } else if (currentAudienceConfig['form_type'] == 'device_brand_model') {
          if (currentAudienceData !== undefined) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            if (currentAudienceData['included_list'] !== undefined) {
              currentAudienceConfig['resultList'] = [...currentAudienceData['included_list']];
              currentAudienceConfig['exclude'] = false;
            } else if (currentAudienceData['excluded_list'] !== undefined) {
              currentAudienceConfig['resultList'] = [...currentAudienceData['excluded_list']];
              currentAudienceConfig['exclude'] = true;
            }
          }


        } else if (currentAudienceConfig['form_type'] == 'targeting_audience') {
          const customAudienceData = audienceData['custom_audience'];
          const excludeCustomAudienceData = audienceData['excluded_custom_audience'];

          if (customAudienceData !== undefined && isArray(customAudienceData)) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            this.editDefaultDataOption.targeting_audience.combine_data.custom_audience.resultList = [...customAudienceData.map((resultItem) => resultItem + "")];
          }
          if (excludeCustomAudienceData !== undefined && isArray(excludeCustomAudienceData)) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            this.editDefaultDataOption.targeting_audience.combine_data.excluded_custom_audience.resultList = [...excludeCustomAudienceData.map((resultItem) => resultItem + "")];
          }

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
              }
            });
          } else if (currentAudienceConfig['form_type'] == 'radio') {
            if (isArray(currentAudienceData) && currentAudienceData.length > 0) {
              currentAudienceConfig['resultValue'] = currentAudienceData[0];
            }
          } else if (currentAudienceConfig['form_type'] == 'checkbox_tree') {
            if (isArray(currentAudienceData) && currentAudienceData.length > 0) {
              currentAudienceConfig['resultList'] = [...currentAudienceData.map((resultItem) => resultItem + "")];
            }
          } else if (currentAudienceConfig['form_type'] == 'behavior_or_interest') {
            const behaviorData = currentAudienceData['behavior'];
            const interestData = currentAudienceData['interest'];

            if (interestData !== undefined && interestData['targeting_tags'] !== undefined) {
              this.editDefaultDataOption.behavior_or_interest.combine_data.interest.resultList = [...interestData['targeting_tags']];
            }

            if (behaviorData != undefined && isArray(behaviorData) && behaviorData.length > 0) {
              const currentBehaviorData = behaviorData[0];
              if (currentBehaviorData['targeting_tags'] != undefined) {
                this.editDefaultDataOption.behavior_or_interest.combine_data.behavior.combine_data.behavior_category.resultList = [...currentBehaviorData['targeting_tags']];
              }
              this.editDefaultDataOption.behavior_or_interest.combine_data.behavior.combine_data.time_window.resultValue = currentBehaviorData['time_window'];
              this.editDefaultDataOption.behavior_or_interest.combine_data.behavior.combine_data.scene.sub.forEach(sceneItem => {
                if (isArray(currentBehaviorData['scene']) && currentBehaviorData['scene'].indexOf(sceneItem['value']) > -1) {
                  sceneItem['checked'] = true;
                }
              });

              this.editDefaultDataOption.behavior_or_interest.combine_data.behavior.combine_data.strength.sub.forEach(strengthItem => {
                if (isArray(currentBehaviorData['intensity']) && currentBehaviorData['intensity'].indexOf(strengthItem['value']) > -1) {
                  strengthItem['checked'] = true;
                }
              });
            }
          }
        }
      });
    }, 0);
  }


  checkPage(): any[] {

    const errorMessage = [];


    if (this.editTargetGroupConfig.target_list.is_open && this.editTargetGroupConfig.target_list.target_id == "0") {
      errorMessage.push('定向包未选择，请选择');
    }

    Object.values(this.editDefaultDataOption).map(item => {
      if (item['form_type'] === 'checkbox') {
        if (item['is_edit'] && item['is_open']) {
          if (item['sub'].every(subItem => !subItem.checked)) {
            errorMessage.push(item['name'] + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'radio') {
        if (item['is_edit'] && item['is_open']) {
          if (item['resultValue'] == undefined) {
            errorMessage.push(item['name'] + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'checkbox_tree') {
        if (item['is_edit'] && item['is_open']) {
          if (item['resultList'] == undefined || (isArray(item['resultList']) && item['resultList'].length < 1)) {
            errorMessage.push(item['name'] + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'device_brand_model') {
        if (item['is_edit'] && item['is_open']) {
          if (item['resultList'] == undefined || (isArray(item['resultList']) && item['resultList'].length < 1)) {
            errorMessage.push(item['name'] + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'geo_location') {
        if (item['is_edit'] && item['is_open']) {
          if (item['resultList'] == undefined || (isArray(item['resultList']) && item['resultList'].length < 1)) {
            errorMessage.push(item['name'] + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'behavior_or_interest') {
        if (item['is_edit'] && item['is_open']) {
          const currentData = this.editDefaultDataOption.behavior_or_interest;
          if (currentData.combine_data.behavior.combine_data.behavior_category['resultList'] == undefined || (isArray(currentData.combine_data.behavior.combine_data.behavior_category['resultList']) && currentData.combine_data.behavior.combine_data.behavior_category['resultList'].length < 1)) {
            errorMessage.push(currentData.combine_data.behavior.combine_data.behavior_category.name + '未选择，请选择');
          }
          let checkSenceSelected = false;
          currentData.combine_data.behavior.combine_data.scene.sub.forEach((subItem) => {
            if (!!subItem['checked']) {
              checkSenceSelected = true;
            }
          });

          if (!checkSenceSelected) {
            errorMessage.push(currentData.combine_data.behavior.combine_data.scene.name + '未选择，请选择');
          }

          let checkStrengthSelected = false;
          currentData.combine_data.behavior.combine_data.strength.sub.forEach((subItem) => {
            if (!!subItem['checked']) {
              checkStrengthSelected = true;
            }
          });

          if (!checkStrengthSelected) {
            errorMessage.push(currentData.combine_data.behavior.combine_data.strength.name + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'targeting_audience') {
        if (item['is_edit'] && item['is_open']) {
          const currentData = this.editDefaultDataOption.targeting_audience;
          if (!((isArray(currentData.combine_data.custom_audience['resultList']) && currentData.combine_data.custom_audience['resultList'].length > 0) || (isArray(currentData.combine_data.excluded_custom_audience['resultList']) && currentData.combine_data.excluded_custom_audience['resultList'].length > 0))) {
            errorMessage.push('人群未选择，请选择');
          }
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
          postData['data'] = { "pub_targeting_id": this.editTargetGroupConfig.target_list.target_id };

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
          this.is_saving.emit({
            'is_saving': false,
            'isHidden': 'false'
          });
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


    const getGdtTargetRegionConfig$ = this.dataViewService.getGdtTargetRegionConfig();
    const getGdtTargetConfig$ = this.dataViewService.getGdtTargetConfig(chanPubId);

    zip(getGdtTargetConfig$, getGdtTargetRegionConfig$).subscribe(([result, regionResult]) => {

      if (isArray(regionResult) && regionResult.length > 0) {
        this.editDefaultDataOption['geo_location'] = {
          name: "地理位置",
          group: "人口学属性",
          form_type: "geo_location",
          sub: regionResult,
          resultList: [],
          location_types: {
            "name": "位置类型",
            "cname": "位置类型",
            "form_type": "checkbox",
            "tips": "位置类型",
            "sub": [
              {
                "value": "RECENTLY_IN",
                "label": "近期在这里的人",
                "tips": "近期在这里的人",
              },
              {
                "value": "LIVE_IN",
                "label": "常住这里的人",
                "tips": "常住这里的人",
              },
              {
                "value": "TRAVEL_IN",
                "label": "旅行到这里的人",
                "tips": "旅行到这里的人",
              },
              {
                "value": "VISITED_IN",
                "label": "去过这里的人",
                "tips": "去过这里的人",
              },
            ],
          },

        };

      }

      if (result['status_code'] && result.status_code === 200) {
        const resultData = result['data'];
        Object.keys(resultData).forEach(itemKey => {
          if (itemKey == 'device_brand_model') {
            this.editDefaultDataOption.device_brand_model.sub = [...resultData[itemKey]["sub"]];
          } else if (itemKey == 'targetList') {
            this.editDefaultDataOption.target_list.sub = [{ "id": "0", name: "请选择定向包" }, ...resultData[itemKey]];
            this.editTargetGroupConfig.target_list.sub = [{ "id": "0", name: "请选择定向包" }, ...resultData[itemKey]];
          } else if (itemKey == 'audienceList') {
            this.editDefaultDataOption.targeting_audience.combine_data.excluded_custom_audience.sub = resultData[itemKey];
            this.editDefaultDataOption.targeting_audience.combine_data.custom_audience.sub = resultData[itemKey];
          } else if (itemKey == 'mobile_union_category') {
            this.editDefaultDataOption.mobile_union_category.sub = resultData[itemKey];
          } else if (itemKey == 'wechat_official_account_category') {
            this.editDefaultDataOption.wechat_official_account_category.sub = resultData[itemKey];
          } else if (itemKey == 'interest') {
            this.editDefaultDataOption.behavior_or_interest.combine_data.interest.sub = resultData[itemKey];
          } else if (itemKey == 'behavior') {
            this.editDefaultDataOption.behavior_or_interest.combine_data.behavior.combine_data.behavior_category.sub = resultData[itemKey];
          } else {
            if (this.checkIsObject(resultData[itemKey]) && resultData[itemKey].form_type == 'range') {
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
        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'device_brand_model') {
          if (currentItemObj.is_edit) {
            resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: {} };
            if (!!currentItemObj['is_open']) {
              if (isArray(currentItemObj['resultList']) && currentItemObj['resultList'].length > 0) {
                if (currentItemObj['exclude']) {
                  resultData[item]['value'] = { "excluded_list": [...currentItemObj['resultList']] };
                } else {
                  resultData[item]['value'] = { "included_list": [...currentItemObj['resultList']] };
                }

              }
            }
          }
        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'geo_location') {
          if (currentItemObj.is_edit) {
            resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], region_id: [], location_types: [] };
            if (!!currentItemObj['is_open']) {
              if (isArray(currentItemObj['resultList']) && currentItemObj['resultList'].length > 0) {
                resultData[item]['region_id'] = [...currentItemObj['resultList']];
              }
              const tmpValue = [];
              currentItemObj['location_types']['sub'].forEach(subItem => {
                if (subItem.checked) {
                  tmpValue.push(subItem.value);
                }
              });
              resultData[item]['location_types'] = [...tmpValue];

            }
          }
        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'behavior_or_interest') {
          if (currentItemObj.is_edit) {
            resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: {} };
            if (!!currentItemObj['is_open']) {
              const interestObj = { "targeting_tags": [] };
              if (isArray(this.editDefaultDataOption.behavior_or_interest.combine_data.interest['resultList']) && this.editDefaultDataOption.behavior_or_interest.combine_data.interest['resultList'].length > 0) {
                interestObj['targeting_tags'] = [...this.editDefaultDataOption.behavior_or_interest.combine_data.interest['resultList']];
              }
              const behaviorObj = {
                targeting_tags: [],
                intensity: [],
                scene: [],
                time_window: '',
              };
              if (isArray(this.editDefaultDataOption.behavior_or_interest.combine_data.behavior.combine_data.behavior_category['resultList']) && this.editDefaultDataOption.behavior_or_interest.combine_data.behavior.combine_data.behavior_category['resultList'].length > 0) {
                behaviorObj.targeting_tags = [...this.editDefaultDataOption.behavior_or_interest.combine_data.behavior.combine_data.behavior_category['resultList']];
              }

              this.editDefaultDataOption.behavior_or_interest.combine_data.behavior.combine_data.scene.sub.forEach(subItem => {
                if (!!subItem['checked']) {
                  behaviorObj.scene.push(subItem.value);
                }
              });

              this.editDefaultDataOption.behavior_or_interest.combine_data.behavior.combine_data.strength.sub.forEach(subItem => {
                if (!!subItem['checked']) {
                  behaviorObj.intensity.push(subItem.value);
                }
              });

              behaviorObj.time_window = this.editDefaultDataOption.behavior_or_interest.combine_data.behavior.combine_data.time_window.resultValue;

              resultData[item].value = {
                interest: interestObj,
                behavior: [{ ...behaviorObj }]
              };
            }
          }
        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'targeting_audience') {
          if (currentItemObj.is_edit) {
            const customAudience = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
            const excludeCustomAudience = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
            if (!!currentItemObj['is_open']) {

              if (isArray(this.editDefaultDataOption.targeting_audience.combine_data.custom_audience['resultList']) && this.editDefaultDataOption.targeting_audience.combine_data.custom_audience['resultList'].length > 0) {
                customAudience['value'] = [...this.editDefaultDataOption.targeting_audience.combine_data.custom_audience['resultList']];
              }
              if (isArray(this.editDefaultDataOption.targeting_audience.combine_data.excluded_custom_audience['resultList']) && this.editDefaultDataOption.targeting_audience.combine_data.excluded_custom_audience['resultList'].length > 0) {
                excludeCustomAudience['value'] = [...this.editDefaultDataOption.targeting_audience.combine_data.excluded_custom_audience['resultList']];
              }

            }
            resultData['custom_audience'] = customAudience;
            resultData['excluded_custom_audience'] = excludeCustomAudience;
          }
        }
      });
    });
    return resultData;

  }


  updateSingleChecked(itemKey): void {
    if (this.editDefaultDataOption[itemKey].sub.every(item => !item.checked)) {
      this.editDefaultDataOption[itemKey].allChecked = false;
      this.editDefaultDataOption[itemKey].indeterminate = false;
    } else if (this.editDefaultDataOption[itemKey].sub.every(item => item.checked)) {
      this.editDefaultDataOption[itemKey].allChecked = true;
      this.editDefaultDataOption[itemKey].indeterminate = false;
    } else {
      this.editDefaultDataOption[itemKey].indeterminate = true;
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

    this._http.showGdtTargetById({
      chan_pub_id: this.selectData.selected_data[0].chan_pub_id,
      pub_account_id: this.selectData.selected_data[0].pub_account_id,
      pub_targeting_id: targetId
    }).subscribe(result => {
      if (result.status_code === 200) {
        this.initSingleData(result.data);
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


}
