import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DataViewAddEditService } from "../../../../service/data-view-add-edit.service";
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from "../../../../../../core/service/auth.service";
import { NotifyService } from "../../../../../../module/notify/notify.service";
import { DataViewService } from "../../../../service/data-view.service";
import { DataViewEditWrapService } from "../../../../service/data-view-edit-wrap.service";
import { isArray } from "@jzl/jzl-util";
import { zip } from "rxjs";
import { deepCopy } from "@jzl/jzl-util";
import { LaunchService } from "../../../../../launch-rpa/service/launch.service";

@Component({
  selector: 'app-edit-group-target-single-uc',
  templateUrl: './edit-group-target-single-uc.component.html',
  styleUrls: ['./edit-group-target-single-uc.component.scss'],
  providers: [LaunchService]
})
export class EditGroupTargetSingleUcComponent implements OnInit, OnChanges {

  @Input() stringIdArray: any;
  @Input() selectData: any;
  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();

  public cid;
  constructor(
    private _http: DataViewAddEditService,
    private message: NzMessageService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private modalService: NzModalService,
    private dataViewService: DataViewService,
    private dataViewWrapService: DataViewEditWrapService,
    private launchService: LaunchService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.publisherOption = this._http.getPublisherOption();
  }

  public kwdText = '';
  public urlText = '';
  public cityText = '';
  public noHaveText = '';
  public cityLoading = true;
  public countryLoading = true;

  public publisherOption = {};
  public groupData = {};
  public publishId: any;
  public iswraing = false;
  public onlyOne = false;

  public editDefaultDataGroup = [
    {
      "block_desc": "定向设置",
      "slot_list": [
        "audience_targeting",
        "all_region",
        "gender",
        "age",
        'platform',
        "network_env",
        "interest",
        "word",
        "url",
        'appcategory',
        "convert_filter",
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
    appcategory: {
      "name": "App定向",
      "form_type": "app_category_radio",
      "radioValue": "NONE",
      "suffix": "",
      "resultValue": 'NONE',
      "sub": [
        {
          "label": "不限",
          "value": "NONE",
          "checked": false
        },
        {
          "label": "自定义",
          "value": "custom",
          "checked": false
        },
      ],
      combine_data: {
        "one_extra": {
          relation: 'custom',
          sub: [],
          resultList: []
        }
      }
    },

    interest: {
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
          "label": "自定义",
          "value": "custom",
          "checked": false
        },
      ],
      combine_data: {
        "one_extra": {
          relation: 'interest',
          sub: [],
          resultList: []
        }
      }
    },
    all_region: {
      "name": "投放地域",
      "form_type": "region_radio",
      "suffix": "",
      "radioValue": '1',
      "resultValue": '',
      "sub": [
        {
          "label": "不限",
          "value": 1,
          "checked": false
        },
        {
          "label": "按省市",
          "value": 0,
          "checked": false
        },
        {
          "label": "按区县",
          "value": 2,
          "checked": false
        }
      ],
      combine_data: {
        "0": {
          sub: [],
          resultList: []
        },
        "2": {
          sub: [],
          resultList: []
        }
      },
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

    audience_targeting: {
      "form_type": "audience_targeting",
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
    word: {
      "name": "兴趣关键词",
      "form_type": "word_radio",
      "radioValue": "NONE",
      "suffix": "",
      "resultValue": 'NONE',
      "is_open": true,
      sub: [
        {
          label: "不限",
          value: "NONE",
          checked: false
        },
        {
          label: "自定义",
          value: "custom",
          checked: false
        },
      ],
      combine_data: {
        word: [],
      }
    },
    url: {
      "name": "站点定向",
      "form_type": "url_radio",
      "radioValue": "NONE",
      "suffix": "",
      "resultValue": 'NONE',
      "is_open": true,
      sub: [
        {
          label: "不限",
          value: "NONE",
          checked: false
        },
        {
          label: "自定义",
          value: "custom",
          checked: false
        },
      ],
      combine_data: {
        url: [],
      }
    },
  };

  private editDefaultDataOptionBak = {};


  ngOnInit() {
    this.publishId = 17;
    this.groupData = this.selectData.selected_data[0];
    if (this.selectData.selected_data.length === 1) {
      this.onlyOne = true;
    }
    this.initConfigList();
  }

  _showAdgroup() {

    this._http
      .showAdgroupTargetUc({
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

          this.initSingleData(result.data['targetings'][0]);
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

        if (currentAudienceConfig['form_type'] == 'region_radio') {
          if (currentAudienceData !== undefined) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            currentAudienceConfig['radioValue'] = audienceData['allRegion'];
            if (audienceData['allRegion'] == 0) {
              currentAudienceConfig['combine_data']['0']['resultList'] = audienceData['region'];
            } else if (audienceData['allRegion'] == 2) {
              currentAudienceConfig['combine_data']['2']['resultList'] = audienceData['region'];
            }
          }

        } else if (item == 'appcategory') {
          if (currentAudienceData !== undefined) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            if (isArray(currentAudienceData) && currentAudienceData.length > 0) {
              currentAudienceConfig['radioValue'] = 'custom';
              currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...currentAudienceData.map((resultItem) => resultItem + "")];
            } else {
              currentAudienceConfig['radioValue'] = 'NONE';
            }
          }
        } else if (item == 'interest') {
          if (currentAudienceData !== undefined && isArray(currentAudienceData)) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            if (currentAudienceData.length < 1) {
              currentAudienceConfig['radioValue'] = 'NONE';
            } else if (currentAudienceData.length == 1 && currentAudienceData[0] == 0) {
              currentAudienceConfig['radioValue'] = 'NONE';
            } else {
              currentAudienceConfig['radioValue'] = 'interest';
              currentAudienceConfig['combine_data']['one_extra']['resultList'] = [...audienceData['interest']];
            }
          }
        } else if (currentAudienceConfig['form_type'] == 'audience_targeting') {
          const customAudienceData = audienceData['include_audience'];
          const excludeCustomAudienceData = audienceData['exclude_audience'];

          if (customAudienceData !== undefined && isArray(customAudienceData)) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            this.editDefaultDataOption.audience_targeting.combine_data.crowdResultList = [...customAudienceData.map((resultItem) => resultItem + "")];
            if (customAudienceData.length > 0) {
              currentAudienceConfig['radioValue'] = 'custom_audience';
            }
          }
          if (excludeCustomAudienceData !== undefined && isArray(excludeCustomAudienceData)) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            this.editDefaultDataOption.audience_targeting.combine_data.excludeCrowdResultList = [...excludeCustomAudienceData.map((resultItem) => resultItem + "")];
            if (excludeCustomAudienceData.length > 0) {
              currentAudienceConfig['radioValue'] = 'custom_audience';
            }
          }
          // -- 互斥
          this.editDefaultDataOption.audience_targeting.combine_data.excludeCrowdList.forEach(crowd => {
            crowd['disabled'] = this.editDefaultDataOption.audience_targeting.combine_data.crowdResultList.indexOf(crowd.key) > -1;
          });
          this.editDefaultDataOption.audience_targeting.combine_data.excludeCrowdList = [...this.editDefaultDataOption.audience_targeting.combine_data.excludeCrowdList];

          // -- 互斥
          this.editDefaultDataOption.audience_targeting.combine_data.crowdList.forEach(crowd => {
            crowd['disabled'] = this.editDefaultDataOption.audience_targeting.combine_data.excludeCrowdResultList.indexOf(crowd.key) > -1;
          });
          this.editDefaultDataOption.audience_targeting.combine_data.crowdList = [...this.editDefaultDataOption.audience_targeting.combine_data.crowdList];
        } else if (item == 'url') {
          if (audienceData['url']) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            if (audienceData['url'].length > 0) {
              currentAudienceConfig['radioValue'] = 'custom';
              currentAudienceConfig['combine_data']['url'] = [...audienceData['url']];
            } else {
              currentAudienceConfig['radioValue'] = 'NONE';
            }
          }
        } else if (item == 'word') {
          if (audienceData['word']) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            if (audienceData['word'].length > 0) {
              currentAudienceConfig['radioValue'] = 'custom';
              currentAudienceConfig['combine_data']['word'] = [...audienceData['word']];
            } else {
              currentAudienceConfig['radioValue'] = 'NONE';
            }
          }
        } else if (item == 'convert_filter') {
          if (audienceData['convertFilter'] !== undefined) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            currentAudienceConfig['resultValue'] = String(audienceData['convertFilter']);
          }
        } else if (item == 'network_env') {
          if (audienceData['networkEnv'] !== undefined) {
            currentAudienceConfig["is_open"] = true;
            currentAudienceConfig["is_edit"] = true;
            currentAudienceConfig['resultValue'] = audienceData['networkEnv'];
          }
        } else if (currentAudienceData !== undefined) {
          currentAudienceConfig["is_open"] = true;
          currentAudienceConfig["is_edit"] = true;
          if (currentAudienceConfig['form_type'] == "range") {
            if (isArray(currentAudienceData) && currentAudienceData.length > 0) {
              currentAudienceConfig['rangeStartResult'] = currentAudienceData[0]["min"];
              currentAudienceConfig['rangeEndResult'] = currentAudienceData[0]["max"];
            }

          } else if (currentAudienceConfig['form_type'] == 'multi_select') {
            currentAudienceConfig.sub.forEach(subItem => {
              if (currentAudienceData.indexOf(subItem['value']) > -1) {
                subItem['checked'] = true;
                currentAudienceConfig['NOLIMIT'] = false;
              }
            });
          } else if (currentAudienceConfig['form_type'] == 'radio') {
            currentAudienceConfig['resultValue'] = currentAudienceData;
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
      if (item['form_type'] === 'multi_select') {
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
      } else if (item['form_type'] === 'one_extra_radio' || item['form_type'] === "app_category_radio") {
        if (item['is_edit']) {
          if (item['radioValue'] != "NONE" && item['radioValue'] == item['combine_data']['one_extra']['relation'] && item["combine_data"]["one_extra"]["resultList"].length < 1) {
            errorMessage.push(item['name'] + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'region_radio') {
        if (item['is_edit']) {
          if (item['radioValue'] != 1 && item["combine_data"][item['radioValue']]["resultList"].length < 1) {
            errorMessage.push(item['name'] + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'checkbox_tree') {
        if (item['is_edit']) {
          if (item['resultList'] == undefined || (isArray(item['resultList']) && item['resultList'].length < 1)) {
            errorMessage.push(item['name'] + '未选择，请选择');
          }
        }
      } else if (item['form_type'] === 'audience_targeting') {
        if (item['is_edit']) {
          const currentData = this.editDefaultDataOption.audience_targeting;
          // if (!((isArray(currentData.combine_data.custom_audience['resultList']) && currentData.combine_data.custom_audience['resultList'].length > 0) || (isArray(currentData.combine_data.excluded_custom_audience['resultList']) && currentData.combine_data.excluded_custom_audience['resultList'].length > 0) )) {
          //   errorMessage.push('人群未选择，请选择');
          // }
        }
      } else if (item['form_type'] === 'word_radio') {
        if (item['is_edit']) {
          if (item['radioValue'] === 'custom') {
            if (item['combine_data']['word'] == undefined || (isArray(item['combine_data']['word']) && item['combine_data']['word'].length < 1)) {
              errorMessage.push(item['name'] + '未添加，请添加');
            }
          }
        }
      } else if (item['form_type'] === 'url_radio') {
        if (item['is_edit']) {
          if (item['radioValue'] === 'custom') {
            if (item['combine_data']['url'] == undefined || (isArray(item['combine_data']['url']) && item['combine_data']['url'].length < 1)) {
              errorMessage.push(item['name'] + '未添加，请添加');
            }
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
      this.getUcTargetAudience(chanPubId);
    }

    const getByteDanceConfig$ = this.dataViewService.getUCTargetConfig({ cid: this.cid });
    getByteDanceConfig$.subscribe((result) => {
      if (result['status_code'] && result.status_code === 200) {
        const resultData = result['data'];
        Object.keys(resultData).forEach(itemKey => {
          if (itemKey == 'appcategory') {
            this.editDefaultDataOption.appcategory['is_open'] = true;
            this.editDefaultDataOption.appcategory.combine_data.one_extra.sub = [...resultData[itemKey]['sub']];
          } else if (itemKey == 'interest') {
            this.editDefaultDataOption.interest['is_open'] = true;
            this.editDefaultDataOption.interest.combine_data.one_extra.sub = [...resultData[itemKey]['sub']];
          } else if (itemKey == 'province') {
            this.editDefaultDataOption.all_region.combine_data['0'].sub = [...resultData[itemKey]];
          } else if (itemKey == 'country') {
            this.editDefaultDataOption.all_region.combine_data['2'].sub = [...resultData[itemKey]];
          } else {
            if (this.checkIsObject(resultData[itemKey])) {
              resultData[itemKey]['is_open'] = true;
            }
            if (this.checkIsObject(resultData[itemKey]) && resultData[itemKey].form_type == 'radio') {
              const rangData = resultData[itemKey];
              if (isArray(rangData['sub']) && rangData['sub'].length > 0) {
                rangData['resultValue'] = rangData['sub'][0]['value'];
              }
              if (itemKey == 'convert_filter') {
                rangData['resultValue'] = '0';
              } else if (itemKey == 'gender') {
                rangData['resultValue'] = String(rangData['sub'][0]['value']);
              }

            } else if (this.checkIsObject(resultData[itemKey]) && resultData[itemKey].form_type == 'multi_select') {
              resultData[itemKey]['NOLIMIT'] = true;

            } else if (this.checkIsObject(resultData[itemKey]) && resultData[itemKey].form_type == 'range') {
              const rangData = resultData[itemKey];
              rangData.rangeValue = this.generateRangeData(itemKey, rangData.rangeStart, rangData.rangeEnd, rangData.range_options, rangData.suffix, rangData.endLess);

            } else if (this.checkIsObject(resultData[itemKey]) && resultData[itemKey].form_type == 'checkbox_tree') {
              resultData[itemKey]['resultList'] = [];
              resultData[itemKey]['getParentKey'] = itemKey != 'working_status';

            }
            if (itemKey !== 'audience_targeting' && itemKey !== 'all_region') {
              this.editDefaultDataOption[itemKey] = resultData[itemKey];
            } else if (itemKey === 'audience_targeting') {
              this.editDefaultDataOption['audience_targeting']['is_open'] = true;
            } else if (itemKey === 'all_region') {
              this.editDefaultDataOption['all_region']['is_open'] = true;
            }
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
        if (currentItemObj !== undefined && currentItemObj["form_type"] == 'multi_select') {
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
            resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: '' };

            if (!!currentItemObj['is_open']) {
              let tmpValue = '';
              if (currentItemObj['resultValue'] !== undefined) {
                tmpValue = currentItemObj['resultValue'];
              }
              resultData[item]['value'] = tmpValue;
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
        } else if (currentItemObj !== undefined && (currentItemObj["form_type"] == 'one_extra_radio' || currentItemObj["form_type"] == 'app_category_radio')) {
          if (currentItemObj.is_edit) {
            if (item == 'interest') {
              resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
              if (currentItemObj['radioValue'] == 'NONE') {
                resultData[item]['value'] = [];
              } else if (currentItemObj['radioValue'] == 'custom') {
                resultData[item]['value'] = currentItemObj['combine_data']['one_extra']['resultList'];
              }
            } else if (item == 'appcategory') {
              resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
              if (currentItemObj['radioValue'] == 'NONE') {
                resultData[item]['value'] = [];
              } else if (currentItemObj['radioValue'] == 'custom') {
                resultData[item]['value'] = currentItemObj['combine_data']['one_extra']['resultList'];
              }
            } else {
              resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
              if (currentItemObj['radioValue'] !== 'NONE') {
                resultData[item]['value'] = currentItemObj['combine_data']['one_extra']['resultList'];
              }
            }
          }
        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'region_radio') {
          if (currentItemObj.is_edit) {
            resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], type: 'NONE', value: [] };
            resultData[item]['type'] = currentItemObj['radioValue'];
            if (currentItemObj['radioValue'] == 0) {
              resultData[item]['value'] = currentItemObj['combine_data']['0']['resultList'];
            } else if (currentItemObj['radioValue'] == 2) {
              resultData[item]['value'] = currentItemObj['combine_data']['2']['resultList'];
            }
          }


        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'audience_targeting') {
          if (currentItemObj.is_edit) {

            const customAudience = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
            const excludeCustomAudience = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
            if (!!currentItemObj['is_open']) {
              customAudience['value'] = [...this.editDefaultDataOption.audience_targeting.combine_data.crowdResultList];
              excludeCustomAudience['value'] = [...this.editDefaultDataOption.audience_targeting.combine_data.excludeCrowdResultList];
            }
            resultData['include_audience'] = customAudience;
            resultData['exclude_audience'] = excludeCustomAudience;
          }
        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'url_radio') {
          if (currentItemObj.is_edit) {
            resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
            if (currentItemObj['radioValue'] == 'NONE') {
              resultData[item]['value'] = [];
            } else if (currentItemObj['radioValue'] == 'custom') {
              resultData[item]['value'] = currentItemObj['combine_data']['url'];
            }
          }
        } else if (currentItemObj !== undefined && currentItemObj["form_type"] == 'word_radio') {
          resultData[item] = { edit_type: 1, is_open: !!currentItemObj['is_open'], value: [] };
          if (currentItemObj['radioValue'] == 'NONE') {
            resultData[item]['value'] = [];
          } else if (currentItemObj['radioValue'] == 'custom') {
            resultData[item]['value'] = currentItemObj['combine_data']['word'];
          }
        }

      });
    });
    return resultData;

  }


  updateSingleChecked(itemKey): void {

    this.editDefaultDataOption[itemKey]["NOLIMIT"] = false;

    this.editDefaultDataOption[itemKey]["NOLIMIT"] = this.editDefaultDataOption[itemKey].sub.every(item => !item.checked);

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

    this._http.showUcTargetById({
      chan_pub_id: this.selectData.selected_data[0].chan_pub_id,
      pub_account_id: this.selectData.selected_data[0].pub_account_id,
      audience_package_id: targetId
    }).subscribe(result => {
      if (result.status_code === 200) {
        this.initSingleData(result.data['targetings'][0]);
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
        }
      }
    });



  }



  treeCrowdOnCheck(event: NzFormatEmitEvent): void {
    this.editDefaultDataOption.audience_targeting.combine_data.crowdResultList = [...event.keys];

    this.editDefaultDataOption.audience_targeting.combine_data.excludeCrowdList.forEach(item => {
      item['disabled'] = event.keys.indexOf(item.key) > -1;
    });

    this.editDefaultDataOption.audience_targeting.combine_data.excludeCrowdList = [...this.editDefaultDataOption.audience_targeting.combine_data.excludeCrowdList];

  }

  treeExcludeCrowdOnCheck(event: NzFormatEmitEvent): void {
    this.editDefaultDataOption.audience_targeting.combine_data.excludeCrowdResultList = [...event.keys];

    this.editDefaultDataOption.audience_targeting.combine_data.crowdList.forEach(item => {
      item['disabled'] = event.keys.indexOf(item.key) > -1;
    });
    this.editDefaultDataOption.audience_targeting.combine_data.crowdList = [...this.editDefaultDataOption.audience_targeting.combine_data.crowdList];

  }

  addText() {
    let dataValid = true;
    const inputValueAry = this.kwdText.split(/\s+/g); // 根据换行或者回车进行识别

    inputValueAry.forEach((item, idx) => {
      if (item.replace(/[\u0391-\uFFE5]/g, "aa").length > 30) {
        dataValid = false;
      }
      if (!item) {
        inputValueAry.splice(idx, 1);
      }
    });

    if (!dataValid) {
      this.message.error('每个关键词不超过15个字');
      return false;
    }

    if ((this.editDefaultDataOption.word.combine_data.word.length + inputValueAry.length) > 1000) {
      this.message.error('最多1000个关键词');
      return false;
    }

    inputValueAry.forEach(item => {
      if (item.length && this.editDefaultDataOption.word.combine_data.word.indexOf(item) === -1) {
        this.editDefaultDataOption.word.combine_data.word.push(item);
      }
    });
    this.kwdText = '';
  }
  addUrl() {
    let dataValid = true;
    const inputValueAry = this.urlText.split(/\s+/g); // 根据换行或者回车进行识别
    const req = /^(?!([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/))([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?)/;
    inputValueAry.forEach((item, idx) => {
      if (!req.test(item)) {
        dataValid = false;
      }
      if (!item) {
        inputValueAry.splice(idx, 1);
      }
    });

    if (!dataValid) {
      this.message.error('URL不合法(不要连同 http://或https:// 一起填写)');
      return false;
    }

    if ((this.editDefaultDataOption.url.combine_data.url.length + inputValueAry.length) > 200) {
      this.message.error('最多200个站点');
      return false;
    }

    inputValueAry.forEach(item => {
      if (item.length && this.editDefaultDataOption.url.combine_data.url.indexOf(item) === -1) {
        this.editDefaultDataOption.url.combine_data.url.push(item);
      }
    });
    this.urlText = '';
  }
  clearInput(type) {
    if (type === 'word') {
      this.editDefaultDataOption.word.combine_data.word = [];
    } else if (type === 'url') {
      this.editDefaultDataOption.url.combine_data.url = [];
    }
  }

  getUcTargetAudience(chanPubId) {
    const getUcTargetAudience = this.launchService.getUcTargetAudience({
      chan_pub_id: chanPubId,
      cid: this.cid,
    });
    getUcTargetAudience.subscribe(result => {
      this.editDefaultDataOption.audience_targeting.combine_data.crowdList = deepCopy(result['data']['audienceList']);
      this.editDefaultDataOption.audience_targeting.combine_data.excludeCrowdList = deepCopy(result['data']['audienceList']);
    });
  }

  addCity(source, target) {
    const inputValueAry = this.cityText.split(/[\s,\/]+/g); // 根据换行或者回车进行识别
    inputValueAry.forEach((item, idx) => {
      if (!item) {
        inputValueAry.splice(idx, 1);
      }
    });
    const noHave = this.citySelect(inputValueAry, source, target);
    this.cityText = noHave.join('\n');
    this.noHaveText = this.cityText + '';
    this.editDefaultDataOption.all_region.radioValue == '0' ? this.cityLoading = !this.cityLoading : this.countryLoading = !this.countryLoading;
  }

  citySelect(inputValueAry, source, target) {
    source.forEach(item => {
      if (this.editDefaultDataOption.all_region.radioValue == '2') {
        if (inputValueAry.indexOf(item.title) > -1 && target.indexOf(item.key) === -1) {
          inputValueAry.splice(inputValueAry.indexOf(item.title), 1);
          this.cityPush([item], target);
        }
      } else {
        if (inputValueAry.indexOf(item.title) > -1 && target.indexOf(item.key) === -1) {
          target.push(item.key);
          inputValueAry.splice(inputValueAry.indexOf(item.title), 1);
        }
        if (isArray(item.children) && item.children.length > 0 && target.indexOf(item.key) === -1) {
          return this.citySelect(inputValueAry, item.children, target);
        }
      }
    });
    return inputValueAry;
  }
  cityPush(cityList, target) {
    cityList.forEach(city => {
      if (isArray(city.children) && city.children.length > 0) {
        return this.cityPush(city.children, target);
      } else {
        target.push(city.key);
      }
    });
  }


}
