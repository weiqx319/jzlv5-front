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

@Component({
  selector: 'app-edit-group-target-single-bd',
  templateUrl: './edit-group-target-single-bd.component.html',
  styleUrls: ['./edit-group-target-single-bd.component.scss']
})
export class EditGroupTargetSingleBdComponent implements OnInit, OnChanges {
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

  public editDefaultDataOption = {
    'age': {
      name: "年龄",
      type: 'multiCheck',
      is_edit: false,
      allChecked: false,
      indeterminate: false,
      allValue: 0,
      sub: [
        { label: '<18', value: 1, checked: false },
        { label: '18-24', value: 2, checked: false },
        { label: '25-34', value: 3, checked: false },
        { label: '35-44', value: 4, checked: false },
        { label: '>44', value: 5, checked: false }
      ]
    },
    sex: {
      name: "性别",
      type: 'multiCheck',
      is_edit: false,
      allChecked: false,
      indeterminate: false,
      allValue: 0,
      sub: [
        { label: '女', value: 1, checked: false },
        { label: '男', value: 2, checked: false },
      ]
    },
    education: {
      name: "学历",
      type: 'multiCheck',
      is_edit: false,
      allChecked: false,
      indeterminate: false,
      allValue: 0,
      sub: [
        { label: '大学及以上', value: 1, checked: false },
        { label: '大专', value: 2, checked: false },
        { label: '高中及以下', value: 3, checked: false },
      ]
    }
    , lifeStage: {
      name: "人生阶段",
      type: 'multiCheck',
      is_edit: false,
      allChecked: false,
      indeterminate: false,
      allValue: 0,
      sub: [
        { label: '未婚', value: 1, checked: false },
        { label: '已婚', value: 2, checked: false },
        { label: '孕期', value: 3, checked: false },
        // {label:'家有儿女',value:4,checked:false},
        { label: '(家有儿女)0-3岁', value: 401, checked: false },
        { label: '(家有儿女)3-6岁', value: 402, checked: false },
        { label: '(家有儿女)小学', value: 403, checked: false },
        { label: '(家有儿女)中学', value: 404, checked: false },
      ],

    }
    , device: {
      name: "设备",
      is_edit: false,
      allChecked: false,
      indeterminate: false,
      allValue: 0,
      sub: [
        {
          label: 'iOS', value: 1, checked: false, allChecked: false, indeterminate: false, allValue: 0, sub: [
            { label: '12.x', value: 12, checked: false },
            { label: '11.x', value: 11, checked: false },
            { label: '10.x', value: 10, checked: false },
            { label: '9.x', value: 9, checked: false },
            { label: '8.x', value: 8, checked: false },
          ]
        },
        {
          label: 'Android', value: 2, checked: false, allChecked: false, indeterminate: false, allValue: 0,
          sub: [
            { label: '9.x', value: 9, checked: false },
            { label: '8.x', value: 8, checked: false },
            { label: '7.x', value: 7, checked: false },
            { label: '6.x', value: 6, checked: false },
            { label: '5.x', value: 5, checked: false },
            { label: '4.x', value: 4, checked: false },
          ]
        },
        { label: '计算机', value: 4, checked: false },
        { label: '其他', value: 3, checked: false },
      ]
    },
    net: {
      name: "网络",
      is_edit: false,
      allChecked: false,
      indeterminate: false,
      allValue: 0,
      sub: [
        { label: 'wifi', value: 1, checked: false },
        { label: '移动网络', value: 2, checked: false },
      ]
    },
    interests: {
      is_edit: false,
      edit_type: "1",
      treeList: [],
      resultList: [],
      value: "0"
    },
    offlineVisit: {
      is_edit: false,
      value: "0",
      placeList: [],
      place_edit_type: "1",
      biz_edit_type: "1",
      resultPlaceList: [],
      bizAreaList: [],
      bizArealObjList: [],
      bizAreaCityList: [],
      resultBizAreaList: [],
      selectCity: 0,
      bizAreaSelectCityList: [],
      bizAreaSelectDesc: {},
      bizAreaSelectList: {},
      bizAreaDesc: "",
    },
    region: {
      is_edit: false,
      edit_type: "1",
      value: "0",
      regionList: [],
      resultList: []
    },
    app: {
      is_edit: false,
      edit_type: "1",
      value: "all",
      treeList: [],
      resultList: [],
      behavior: "2"
    },
    crowd: {
      is_edit: false,
      crow_edit_type: '1',
      exclude_crow_edit_type: '1',
      value: "all",
      crowdEdit: false,
      excludeCrowdEdit: false,
      crowdList: [],
      crowdResultList: [],
      excludeCrowdList: [],
      excludeCrowdResultList: [],
    }
  };



  ngOnInit() {
    this.publishId = 1;
    this.groupData = this.selectData.selected_data[0];
    if (this.selectData.selected_data.length === 1) {
      this.onlyOne = true;
    }
    this.initConfigList();
  }

  _showAdgroup() {

    this._http
      .showAdgroupTarget({
        chan_pub_id: this.selectData.selected_data[0].chan_pub_id,
        pub_account_id: this.selectData.selected_data[0].pub_account_id,
        pub_adgroup_id: this.selectData.selected_data[0].pub_adgroup_id
      })
      .subscribe(result => {
        if (result.status_code === 200) {
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
    Object.keys(this.editDefaultDataOption).forEach(item => {
      if (['age', 'sex', 'education', 'net', 'lifeStage', 'device'].indexOf(item) > -1) {
        let audienceItem = item;
        if (item == 'lifeStage') {
          audienceItem = 'life_stage';
        }
        if (audienceData[audienceItem] != undefined) {
          if (this.editDefaultDataOption[item].allValue == audienceData[audienceItem]) {
            this.editDefaultDataOption[item].allChecked = true;
            this.updateAllChecked(this.editDefaultDataOption[item]);
          } else {
            const subValueArray = audienceData[audienceItem].split(",");
            if (item == 'lifeStage') {
              if (subValueArray.indexOf('4') > -1) {
                subValueArray.push(...["401", "402", "403", "404"]);
              }
            }

            this.editDefaultDataOption[item].sub.forEach(subItem => {
              if (subValueArray.indexOf(subItem['value'] + '') > -1) {
                subItem['checked'] = true;
                this.editDefaultDataOption[item].indeterminate = true;
                if (item == 'device') {
                  if (audienceData['ios_version'] == this.editDefaultDataOption.device.sub[0].allValue) {
                    this.editDefaultDataOption.device.sub[0].allChecked = true;
                    this.updateAllChecked(this.editDefaultDataOption.device.sub[0]);
                  } else {
                    const iosVersionValueArray = audienceData['ios_version'].split(",");
                    this.editDefaultDataOption.device.sub[0].sub.forEach(iosSubItem => {
                      if (iosVersionValueArray.indexOf(iosSubItem['value'] + '') > -1) {
                        iosSubItem['checked'] = true;
                        this.editDefaultDataOption.device.sub[0].indeterminate = true;
                      }
                    });
                  }
                  if (audienceData['android_version'] == this.editDefaultDataOption.device.sub[1].allValue) {
                    this.editDefaultDataOption.device.sub[1].allChecked = true;
                    this.updateAllChecked(this.editDefaultDataOption.device.sub[1]);
                  } else {
                    const androidVersionValueArray = audienceData['android_version'].split(",");
                    this.editDefaultDataOption.device.sub[1].sub.forEach(androidSubItem => {
                      if (androidVersionValueArray.indexOf(androidSubItem['value'] + '') > -1) {
                        androidSubItem['checked'] = true;
                        this.editDefaultDataOption.device.sub[1].indeterminate = true;
                      }
                    });
                  }
                }
              }
            });
          }
        }
      } else if (item == 'interests') {
        if (audienceData[item] != undefined) {
          if (audienceData[item] != "0") {
            this.editDefaultDataOption.interests.value = "1";
            this.editDefaultDataOption.interests.resultList = audienceData[item].split(",").map((interestItem) => parseInt(interestItem));
          }
        }
      } else if (item == 'app') {
        if (audienceData[item] != undefined) {
          const appInfo = JSON.parse(audienceData[item]);
          if (appInfo['type'] == 'category') {
            this.editDefaultDataOption.app.value = 'category';
            this.editDefaultDataOption.app.resultList = appInfo['list'].map(appItem => parseInt(appItem['id']));
            this.editDefaultDataOption.app.behavior = appInfo['behavior'][0] + "";
          }
        }
      } else if (item == 'crowd') {
        if (audienceData['crowd'] == '' && audienceData['exclude_crowd'] == '') {
          this.editDefaultDataOption.crowd.value = 'all';
        } else {
          this.editDefaultDataOption.crowd.value = 'define';
          this.editDefaultDataOption.crowd.crowdResultList = audienceData['crowd'].split(",").map((crowdItem) => crowdItem);
          // -- 互斥
          this.editDefaultDataOption.crowd.excludeCrowdList.forEach(item => {
            item['disabled'] = this.editDefaultDataOption.crowd.crowdResultList.indexOf(item.key) > -1;
          });
          this.editDefaultDataOption.crowd.excludeCrowdList = [...this.editDefaultDataOption.crowd.excludeCrowdList];

          this.editDefaultDataOption.crowd.excludeCrowdResultList = audienceData['exclude_crowd'].split(",").map((crowdItem) => crowdItem);
          // -- 互斥
          this.editDefaultDataOption.crowd.crowdList.forEach(item => {
            item['disabled'] = this.editDefaultDataOption.crowd.excludeCrowdResultList.indexOf(item.key) > -1;
          });
          this.editDefaultDataOption.crowd.crowdList = [...this.editDefaultDataOption.crowd.crowdList];

        }
      } else if (item == 'region') {
        if (audienceData[item] != undefined) {
          let regionArray = [];
          try {
            regionArray = JSON.parse(audienceData[item]);
          } catch (e) {
            regionArray = audienceData[item].split(",").map((regionItem) => parseInt(regionItem));
          }

          if (isArray(regionArray) && regionArray.length > 0) {
            if (regionArray.length === 1 && regionArray[0] * 1 == 1009000000) {
              this.editDefaultDataOption.region.value = "0";
            } else {
              this.editDefaultDataOption.region.regionList = regionArray;
              this.editDefaultDataOption.region.value = "1";
            }


          } else {
            this.editDefaultDataOption.region.value = "0";
          }
        }
      } else if (item == 'offlineVisit') {

        if (audienceData['place'] != undefined && audienceData['place'] != '0') {
          this.editDefaultDataOption.offlineVisit.value = '1';
          this.editDefaultDataOption.offlineVisit.resultPlaceList = audienceData['place'].split(",").map((placeItem) => parseInt(placeItem));
        } else if (audienceData['biz_area'] != undefined && audienceData['biz_area'] != '0') {
          const BizResultList = audienceData['biz_area'].split(",").map((areaItem) => parseInt(areaItem));
          this.editDefaultDataOption.offlineVisit.bizAreaList.forEach((bizItem, bizItemKey) => {
            const currentChecked = this.initBizArea(bizItem, BizResultList, false);
            if (currentChecked) {
              this.editDefaultDataOption.offlineVisit.selectCity = bizItemKey;
              this.offlineVisitChange(bizItemKey);
              this.treeOnCheck(bizItemKey);
            }

            // this.treeOnCheck()
          });


          this.editDefaultDataOption.offlineVisit.value = '2';
          this.updateRadio(2, 'offlineVisit');
          // this.editDefaultDataOption.offlineVisit =audienceData['place'].split(",").map((placeItem)=>parseInt(placeItem));
        } else {

        }
      }
    }

    );




  }




  checkPage(): any[] {

    const errorMessage = [];

    // @ts-ignore
    if (this.editDefaultDataOption.interests.is_edit && this.editDefaultDataOption.interests.value * 1 === 1 && this.editDefaultDataOption.interests.resultList.length == 0) {
      errorMessage.push('长期兴趣未选择，请填加');
    }
    // @ts-ignore
    if (this.editDefaultDataOption.app.is_edit && this.editDefaultDataOption.app.value * 1 === 1 && this.editDefaultDataOption.app.resultList.length == 0) {
      errorMessage.push('App偏好未选择，请填加');
    }
    // @ts-ignore
    if (this.editDefaultDataOption.offlineVisit.is_edit && this.editDefaultDataOption.offlineVisit.value * 1 === 1 && this.editDefaultDataOption.offlineVisit.resultPlaceList.length == 0) {
      errorMessage.push('场所未选择，请填加');
    }
    // @ts-ignore
    if (this.editDefaultDataOption.offlineVisit.is_edit && this.editDefaultDataOption.offlineVisit.value * 1 === 2 && this.editDefaultDataOption.offlineVisit.resultBizAreaList.length == 0) {
      errorMessage.push('商圈未选择，请填加');
    }

    if (this.editDefaultDataOption.crowd.is_edit && this.editDefaultDataOption.crowd.value != 'all' && this.editDefaultDataOption.crowd.crowdResultList.length == 0 && this.editDefaultDataOption.crowd.excludeCrowdResultList.length == 0) {
      errorMessage.push('人群未选择，请选择');
    }

    ['age', 'sex', 'education', 'net', 'lifeStage', 'device'].forEach(item => {
      if (this.editDefaultDataOption[item]['is_edit']) {
        if (!this.editDefaultDataOption[item]['allChecked'] && !this.editDefaultDataOption[item]['indeterminate']) {
          errorMessage.push(this.editDefaultDataOption[item]['name'] + '未选择，请选择');
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

        postData['data'] = { "audience": this.generateResultData() };
        if (Object.values(postData['data']['audience']).length < 1) {
          this.message.error('请选择修改项');
          return;
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


  updateAllChecked(item): void {
    item.indeterminate = false;
    if (item.allChecked) {
      item.sub.forEach(subItem => {
        subItem['checked'] = true;
      });
    } else {
      item.sub.forEach(subItem => {
        subItem['checked'] = false;
      });
    }
  }


  initConfigList(): void {
    let chanPubId = 0;
    if (this.selectData['account_list'].length == 1) {
      chanPubId = this.selectData['account_list'][0];
    }

    this.dataViewService.getBaiduTargetConfig(chanPubId).subscribe((result) => {
      if (result.status_code === 200) {
        this.editDefaultDataOption.interests.treeList = result['data']['interests'];
        this.editDefaultDataOption.app.treeList = result['data']['app_category'];
        this.editDefaultDataOption.offlineVisit.placeList = result['data']['place'];
        this.editDefaultDataOption.offlineVisit.bizAreaList = result['data']['biz_area'];
        this.editDefaultDataOption.crowd.crowdList = JSON.parse(JSON.stringify(result['data']['crowdList']));
        this.editDefaultDataOption.crowd.excludeCrowdList = JSON.parse(JSON.stringify(result['data']['crowdList']));
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


  transferTreeChange(metaType, data: any[] | object) {
    if (metaType == 'app') {
      // @ts-ignore
      this.editDefaultDataOption.app.resultList = [...data];
    } else if (metaType == 'interests') {
      // @ts-ignore
      this.editDefaultDataOption.interests.resultList = [...data];
    } else if (metaType == 'offlineVisitPlace') {
      // @ts-ignore
      this.editDefaultDataOption.offlineVisit.resultPlaceList = [...data];
    } else if (metaType == 'offlineVisitBizArea') {
      // @ts-ignore
      this.editDefaultDataOption.offlineVisit.resultBizAreaList = [...data];
    } else if (metaType == 'region') {
      this.editDefaultDataOption.region.resultList = data['region_lists'];
    }

  }




  generateResultData() {
    const resultData = {};

    Object.keys(this.editDefaultDataOption).forEach(filedKey => {
      if (filedKey == 'interests') {
        if (this.editDefaultDataOption.interests.is_edit) {
          resultData['interests'] = { edit_type: this.editDefaultDataOption.interests.edit_type, value: 0 };
          if (this.editDefaultDataOption.interests.value === "1") {
            resultData['interests'].value = this.editDefaultDataOption.interests.resultList.map((item => parseInt(item))).join(',');
          }

        } else {
          // resultData['interests'] = {is_edit:false}
        }
      } else if (filedKey == 'region') {
        if (this.editDefaultDataOption.region.is_edit) {
          resultData['region'] = { edit_type: this.editDefaultDataOption.region.edit_type, value: '1009000000' };
          if (this.editDefaultDataOption.region.value === "1") {
            resultData['region'].value = this.editDefaultDataOption.region.resultList.map((item => parseInt(item))).join(',');
          }

        } else {
          // resultData['region'] = {is_edit:false}
        }
      } else if (['age', 'sex', 'education', 'net'].indexOf(filedKey) > -1) {
        if (this.editDefaultDataOption[filedKey].is_edit) {
          resultData[filedKey] = 0;
          if (!(this.editDefaultDataOption[filedKey].allChecked && !this.editDefaultDataOption[filedKey]['indeterminate'])) {
            const tmpValue = [];
            this.editDefaultDataOption[filedKey].sub.forEach(item => {
              if (item.checked) {
                tmpValue.push(parseInt(item.value));
              }
            });
            resultData[filedKey] = tmpValue.join(",");
          }


        } else {
          // resultData[filedKey] = {is_edit:false}
        }
      } else if (filedKey == 'app') {
        if (this.editDefaultDataOption[filedKey].is_edit) {
          resultData['app'] = { is_edit: true, type: 'all', list: [], behavior: [], edit_type: this.editDefaultDataOption.app.edit_type };
          if (this.editDefaultDataOption.app.value == 'category') {
            resultData['app'].type = 'category';
            const postList = this.editDefaultDataOption.app.resultList.map((item) => {
              return { id: parseInt(item) };
            });
            resultData['app'].list = [...postList];
            resultData['app'].behavior = [this.editDefaultDataOption.app.behavior];
          }
        } else {
          // resultData[filedKey] = {is_edit:false}
        }
      } else if (filedKey == 'lifeStage') {
        if (this.editDefaultDataOption[filedKey].is_edit) {
          resultData[filedKey] = 0;
          if (!(this.editDefaultDataOption[filedKey].allChecked && !this.editDefaultDataOption[filedKey]['indeterminate'])) {
            let tmpValue = [];
            this.editDefaultDataOption[filedKey].sub.forEach(item => {
              if (item.checked) {
                tmpValue.push(item.value);
              }
            });

            const tmpSet = new Set(tmpValue);
            const checkSet = new Set([401, 402, 403, 404]);

            const intersect = new Set([...tmpValue].filter(x => checkSet.has(x)));
            if (Array.from(intersect).length == 4) {
              const diff = new Set([...tmpValue].filter(x => !checkSet.has(x)));
              tmpValue = [...Array.from(diff), ...[4]];
            }
            resultData[filedKey] = tmpValue.join(",");
          }

        } else {
          // resultData[filedKey] = {is_edit:false}
        }

      } else if (filedKey == 'device') {
        if (this.editDefaultDataOption[filedKey].is_edit) {
          resultData[filedKey] = 0;
          resultData['iosVersion'] = 0;
          resultData['androidVersion'] = 0;
          if (!(this.editDefaultDataOption[filedKey].allChecked && !this.editDefaultDataOption[filedKey]['indeterminate'])) {
            const tmpValue = [];
            this.editDefaultDataOption[filedKey].sub.forEach(item => {
              if (item.checked) {
                tmpValue.push(item.value);
              }
            });
            resultData[filedKey] = tmpValue.join(",");

            if (this.editDefaultDataOption.device.sub[0].checked && !this.editDefaultDataOption.device.sub[3].checked) {
              const tmpIosValue = [];
              this.editDefaultDataOption.device.sub[0].sub.forEach(subItem => {
                if (subItem.checked) {
                  tmpIosValue.push(subItem.value);
                }
              });
              if (this.editDefaultDataOption.device.sub[0].sub.length != tmpIosValue.length) {
                resultData['iosVersion'] = tmpIosValue.join(',');
              }


            }
            if (this.editDefaultDataOption.device.sub[1].checked && !this.editDefaultDataOption.device.sub[3].checked) {
              const tmpAndroidValue = [];
              this.editDefaultDataOption.device.sub[1].sub.forEach(subItem => {
                if (subItem.checked) {
                  tmpAndroidValue.push(subItem.value);
                }
              });
              if (this.editDefaultDataOption.device.sub[1].sub.length != tmpAndroidValue.length) {
                resultData['androidVersion'] = tmpAndroidValue.join(',');
              }
            }
          }

        } else {
          // resultData[filedKey] = {is_edit:false}
        }

      } else if (filedKey == 'offlineVisit') {
        if (this.editDefaultDataOption.offlineVisit.is_edit) {
          resultData['offlineVisit'] = 0;
          resultData['place'] = { edit_type: this.editDefaultDataOption.offlineVisit.place_edit_type, value: 0 };
          resultData['biz_area'] = { edit_type: this.editDefaultDataOption.offlineVisit.biz_edit_type, value: 0 };
          if (this.editDefaultDataOption.offlineVisit.value == "1") {
            resultData['offlineVisit'] = 1;
            resultData['place'].value = this.editDefaultDataOption.offlineVisit.resultPlaceList.map((item => parseInt(item))).join(',');
          } else if (this.editDefaultDataOption.offlineVisit.value == "2") {
            resultData['offlineVisit'] = 2;
            resultData['biz_area'].value = this.editDefaultDataOption.offlineVisit.resultBizAreaList.map((item => parseInt(item))).join(',');
          }



        } else {
          // resultData[filedKey] = {is_edit:false}
        }

      } else if (filedKey == 'crowd') {
        if (this.editDefaultDataOption.crowd.is_edit) {


          if (this.editDefaultDataOption.crowd.value != 'all') {
            if (this.editDefaultDataOption.crowd.crowdEdit) {
              resultData['crowd'] = { edit_type: this.editDefaultDataOption.crowd.crow_edit_type, value: "" };
              if (this.editDefaultDataOption.crowd.crowdResultList.length > 0) {
                resultData['crowd'].value = this.editDefaultDataOption.crowd.crowdResultList.map((item => item)).join(',');
              }
            }

            if (this.editDefaultDataOption.crowd.excludeCrowdEdit) {
              resultData['excludeCrowd'] = { edit_type: this.editDefaultDataOption.crowd.exclude_crow_edit_type, value: "" };
              if (this.editDefaultDataOption.crowd.excludeCrowdResultList.length > 0) {
                resultData['excludeCrowd'].value = this.editDefaultDataOption.crowd.excludeCrowdResultList.map((item => item)).join(',');
              }
            }
          }



        } else {
          // resultData[filedKey] = {is_edit:false}
        }
      }
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

    if (itemKey == 'device') {
      if (!this.editDefaultDataOption.device.sub[1].checked) {
        this.editDefaultDataOption.app.value = "all";

        this.editDefaultDataOption.device.sub[1].sub.forEach(item => {
          item.checked = false;
        });

      } else {
        this.editDefaultDataOption.device.sub[1].sub.forEach(item => {
          item.checked = true;
        });
      }

      if (!this.editDefaultDataOption.device.sub[0].checked) {
        this.editDefaultDataOption.device.sub[0].sub.forEach(item => {
          item.checked = false;
        });

      } else {
        this.editDefaultDataOption.device.sub[0].sub.forEach(item => {
          item.checked = true;
        });
      }
    }


  }


  updateRadio($event, itemKey) {
    if (itemKey == 'offlineVisit') {
      if ($event == 2) {
        this.editDefaultDataOption.region.is_edit = false;
        this.editDefaultDataOption.region.value = "0";

        this.editDefaultDataOption.offlineVisit.bizAreaCityList = [];
        this.editDefaultDataOption.offlineVisit.bizAreaList.forEach((item, index) => {
          if (item.hasOwnProperty('children') && item['children'].length > 0) {
            this.editDefaultDataOption.offlineVisit.bizAreaCityList.push({ index: index, id: item['id'], name: item['name'] });
          }

        });

        this.editDefaultDataOption.offlineVisit.bizAreaSelectCityList = this.editDefaultDataOption.offlineVisit.bizAreaList[this.editDefaultDataOption.offlineVisit.selectCity]['children'];


      }
    } else if (itemKey == 'region') {
      if ($event == 1 && this.editDefaultDataOption.offlineVisit.value == "2") {
        this.editDefaultDataOption.offlineVisit.value = "0";
      }
    }
  }





  updateSubItemChecked(parentData): void {
    if (parentData.sub.every(item => !item.checked)) {
      parentData.allChecked = false;
      parentData.indeterminate = false;
    } else if (parentData.sub.every(item => item.checked)) {
      parentData.allChecked = true;
      parentData.indeterminate = false;
    } else {
      parentData.indeterminate = true;
    }
  }

  offlineVisitChange(index) {
    this.editDefaultDataOption.offlineVisit.bizAreaSelectCityList = this.editDefaultDataOption.offlineVisit.bizAreaList[this.editDefaultDataOption.offlineVisit.selectCity]['children'];
  }


  treeOnCheck(event): void {

    const currentNode = this.editDefaultDataOption.offlineVisit.bizAreaList[this.editDefaultDataOption.offlineVisit.selectCity];
    const checkResult = this.generateSelectTree(this.editDefaultDataOption.offlineVisit.bizAreaSelectCityList);
    if (checkResult['leafNum'] > 0) {
      this.editDefaultDataOption.offlineVisit.bizAreaSelectDesc["id_" + currentNode['id']] = currentNode['name'] + checkResult['leafNum'] + "个区域";
      this.editDefaultDataOption.offlineVisit.bizAreaSelectList["id_" + currentNode['id']] = checkResult['treeKey'];
      this.editDefaultDataOption.offlineVisit.bizAreaDesc = Object.values(this.editDefaultDataOption.offlineVisit.bizAreaSelectDesc).join("，");

      this.editDefaultDataOption.offlineVisit.resultBizAreaList = [];
      Object.values(this.editDefaultDataOption.offlineVisit.bizAreaSelectList).forEach((item: any) => {
        this.editDefaultDataOption.offlineVisit.resultBizAreaList = [...this.editDefaultDataOption.offlineVisit.resultBizAreaList, ...item];
      });
    } else {
      delete this.editDefaultDataOption.offlineVisit.bizAreaSelectDesc["id_" + currentNode['id']];
      delete this.editDefaultDataOption.offlineVisit.bizAreaSelectList["id_" + currentNode['id']];
      this.editDefaultDataOption.offlineVisit.bizAreaDesc = Object.values(this.editDefaultDataOption.offlineVisit.bizAreaSelectDesc).join("，");

      this.editDefaultDataOption.offlineVisit.resultBizAreaList = [];
      Object.values(this.editDefaultDataOption.offlineVisit.bizAreaSelectList).forEach((item: any) => {
        this.editDefaultDataOption.offlineVisit.resultBizAreaList = [...this.editDefaultDataOption.offlineVisit.resultBizAreaList, ...item];
      });
    }

  }

  treeCrowdOnCheck(event: NzFormatEmitEvent): void {
    this.editDefaultDataOption.crowd.crowdResultList = [...event.keys];

    this.editDefaultDataOption.crowd.excludeCrowdList.forEach(item => {
      item['disabled'] = event.keys.indexOf(item.key) > -1;
    });

    this.editDefaultDataOption.crowd.excludeCrowdList = [...this.editDefaultDataOption.crowd.excludeCrowdList];

  }

  treeExcludeCrowdOnCheck(event: NzFormatEmitEvent): void {
    this.editDefaultDataOption.crowd.excludeCrowdResultList = [...event.keys];

    this.editDefaultDataOption.crowd.crowdList.forEach(item => {
      item['disabled'] = event.keys.indexOf(item.key) > -1;
    });
    this.editDefaultDataOption.crowd.crowdList = [...this.editDefaultDataOption.crowd.crowdList];

  }




  generateSelectTree(source: any[]): { tree: any[], treeKey: any[], leafNum: number } {
    const tree = [];
    let treeKey = [];
    let leafNum = 0;
    source.map(item => {
      if (item.checked && item.isLeaf) {
        leafNum++;
        treeKey.push(item.key);
      } else {
        if (item.hasOwnProperty('children') && item.children.length > 0) {
          const { tree: subTree, treeKey: subTreeKey, leafNum: subLeaftNum } = this.generateSelectTree(item.children);
          leafNum += subLeaftNum;
          if (item.checked) {
            treeKey = [...treeKey, ...[item.key]];
          } else {
            treeKey = [...treeKey, ...subTreeKey];
          }

        }
      }
    });
    return { tree, treeKey, leafNum };
  }

  initBizArea(source: any, result: any[], initChecked = false) {
    let checked = false;
    const checkExists = initChecked ? true : result.indexOf(source['id']) > -1;
    if (checkExists) {
      checked = true;
    }
    if (source.hasOwnProperty('children')) {
      source.children.map(subItem => {
        const subChecked = this.initBizArea(subItem, result, checkExists);
        if (subChecked) {
          checked = true;
        }
      });
    } else {
      if (checkExists) {
        source.checked = true;
        checked = true;
      }
    }
    return checked;
  }

  updateCrowdSelect(key) {
    if (key == 'crowd' && !this.editDefaultDataOption.crowd.is_edit) {
      this.editDefaultDataOption.crowd.crowdEdit = false;
    }

  }







}
