import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ManageService } from '../../service/manage.service';
import { DefineSettingService } from '../../service/define-setting.service';
import { isArray, isUndefined } from "@jzl/jzl-util";
import { ManageItemService } from '../../service/manage-item.service';
import { MenuService } from '../../../../core/service/menu.service';
import { CustomDatasService } from '../../../../shared/service/custom-datas.service';
import { LocalStorageService } from 'ngx-webstorage';
import { matchingBracket } from '@jzl/jzl-util';

@Component({
  selector: 'app-add-metric-data',
  templateUrl: './add-company-metric-detail-data.component.html',
  styleUrls: ['./add-company-metric-detail-data.component.scss']
})
export class AddCompanyMetricDetailDataComponent implements OnInit {
  @Input() set metricData(data: any) {
    this.formualData = data['define'];
    this.defaultMetric = Object.assign(this.defaultMetric, {
      cid: data['cid'],
      channel_id: data['channel_id'],
      publisher_id: data['publisher_id'],
      metric_type: data['metric_type'],
      name: data['name'],
      is_rate: data['is_rate'] * 1 === 1,
      metric_data_type: data['metric_data_type'],
    });

  }

  @Input() metricDataId = 0;
  @Input() companyMetricId = 0;
  @Input() companyMetricList = [];
  public advertiserList = [];

  public disabledItem = {};
  public disabledInit: any = {
    channel_1: {
      disabled: false,
      publisher: {
        publisher_999: {
          disabled: false
        }
      }
    },
    channel_2: {
      disabled: false,
      publisher: {
        publisher_999: {
          disabled: false
        },
        publisher_1: {
          disabled: false
        },
        publisher_3: {
          disabled: false
        },
        publisher_6: {
          disabled: false
        },
        publisher_7: {
          disabled: false
        },
        publisher_9: {
          disabled: false
        }, publisher_11: {
          disabled: false
        }, publisher_16: {
          disabled: false
        }, publisher_17: {
          disabled: false
        }, publisher_18: {
          disabled: false
        },
      }
    },
    channel_3: {
      disabled: false,
      publisher: {
        publisher_999: {
          disabled: false
        },
        publisher_13: {
          disabled: false
        },
        publisher_14: {
          disabled: false
        },
        publisher_15: {
          disabled: false
        }
      }
    }
  };

  public submitting = false;
  private _lastChangedCidChannel = '';

  public channelItems = [
    { key: 1, name: "sem" },
    { key: 2, name: "信息流" },
    { key: 3, name: "应用市场" }
  ];

  public publishItems: any = {
    1: [
      { publisher_name: '全部', publisher_id: 999 },
    ],
    2: [
      { publisher_name: '全部', publisher_id: 999 },
      { publisher_name: '百度', publisher_id: 1 },
      { publisher_name: '360', publisher_id: 1 },
      { publisher_name: '广点通', publisher_id: 6 },
      { publisher_name: '头条', publisher_id: 7 },
      { publisher_name: '微信公众平台', publisher_id: 9 },
      { publisher_name: 'facebook', publisher_id: 11 },
      { publisher_name: '快手', publisher_id: 16 },
      { publisher_name: '超级汇川', publisher_id: 17 },
      { publisher_name: '知乎', publisher_id: 18 },
    ],
    3: [
      { publisher_name: '全部', publisher_id: 999 },
      { publisher_name: '小米', publisher_id: 13 },
      { publisher_name: 'OPPO', publisher_id: 14 },
      { publisher_name: 'VIVO', publisher_id: 15 },
    ]
  };

  public itemTypeCopyRelation;

  public itemDetailDefault = {
    pub_data: [
      { name: '展现', key: 'pub_impression', data_type: 'pub_metric_data' },
      { name: '点击', key: 'pub_click', data_type: 'pub_metric_data' },
      { name: '消费', key: 'pub_cost', data_type: 'pub_metric_data' },
      { name: 'CPC', key: 'pub_cpc', data_type: 'pub_metric_data' },
      { name: "CPM", key: "pub_cpm", data_type: 'pub_metric_data' },
      { name: '点击率', key: 'pub_ctr', data_type: 'pub_metric_data' },
      {
        name: '现金消费',
        key: 'pub_discount_cost',
        data_type: 'pub_metric_data'
      }, {
        name: '新现金消费',
        key: 'pub_discount_new_cost',
        data_type: 'pub_metric_data'
      }
    ],
    conversion_data: [],

  };

  public itemTypeRelation = [
    {
      name: '常数',
      type: 'number',
      key: 'normal_data'
    },
    {
      name: '媒体投放数据',
      type: 'option',
      key: 'pub_data'
      // detail:deliveryData
    },
    {
      name: '自定义基础数据',
      type: 'option',
      key: 'conversion_data'
      // detail:customBasisData
    }
  ];

  public metricTypeRelationByChannel = {};
  public metricListByChannel = {};



  public itemTypeDataDetail = {};

  public formualData = [];

  public operatorLists = [
    { oper: '1', value: '+' },
    { oper: '2', value: '-' },
    { oper: '3', value: '*' },
    { oper: '4', value: '/' }
  ];

  public publisherTypeRelation: any;
  public publisherTypeList;
  //媒体数据
  public baiduDatas = [];
  public bytedanceDatas = [];
  public gdtDatas = [];

  constructor(
    private fb: FormBuilder,
    private manageService: ManageService,
    private message: NzMessageService,
    private defineSettingService: DefineSettingService,
    private modalSubject: NzModalRef,
    private manageItemService: ManageItemService,
    public menuService: MenuService,
    private customDatasService: CustomDatasService,
    private localSt: LocalStorageService
  ) {
    this.channelItems = [...this.customDatasService.channelList];
    this.channelItems.unshift({ key: 0, name: "全部" });
    this.publisherTypeRelation = this.manageItemService.publisherTypeRelation;
    this.generatePublishItems();
    //信息流添加媒体1，6，7（1、百度 6、广点通 7、头条）
  }

  public defaultMetric = {
    cid: null,
    metric_type: 1,
    channel_id: null,
    publisher_id: null,
    define: [],
    is_rate: false,
    metric_data_type: 2,
  };


  onChangePublisher(init = true) {
    if (this.defaultMetric.publisher_id > 0 && (this.defaultMetric.channel_id > 0 || this.defaultMetric.channel_id === 0)) {
      const metricChannelKey = this.defaultMetric.channel_id + '_' + this.defaultMetric.publisher_id;
      if (this.metricTypeRelationByChannel.hasOwnProperty(metricChannelKey)) {
        this.itemTypeRelation = [
          ...this.itemTypeCopyRelation,
          ...this.metricTypeRelationByChannel[metricChannelKey]
        ];

        this.itemTypeDataDetail = {
          ...this.itemDetailDefault,
          ...this.metricListByChannel[metricChannelKey],
        };

      } else {
        this.itemTypeRelation = [...this.itemTypeCopyRelation];
        this.itemTypeDataDetail = {
          ...this.itemDetailDefault,
        };
      }

      if (init) {
        const line1 = {
          left_bracket: false,
          right_bracket: false,
          type: 'normal_data',
          name: '',
          value: '100',
          operator: '1'
        };
        this.formualData = [{ ...line1 }];
      }

    }

  }
  ngOnInit() {
    this.companyMetricDisabledItemInit();

    this.manageService
      .getAdvertiserList({}, { result_model: 'all', need_publish_account: 0 })
      .subscribe(
        result => {
          if (result['status_code'] && result.status_code === 200) {
            this.advertiserList = result['data'];
          } else if (result['status_code'] && result.status_code === 201) {
            this.message.error('广告主名称已经存在，请重试');
          } else if (result['status_code'] && result.status_code === 401) {
            this.message.error('您没权限对此操作！');
            this.doCancel();
          } else if (result['status_code'] && result.status_code === 500) {
            this.message.error('系统异常，请重试');
          } else {
            this.message.error(result.message);
          }
        },
        err => {

          this.message.error('系统异常，请重试');
        }
      );


    const localTableMetric = this.customDatasService.getLocalData('feed_table_item');

    if (localTableMetric) {
      if (localTableMetric['metric_type']) {


        Object.keys(localTableMetric['metric_type']).forEach(metricChannelKey => {
          if (localTableMetric.hasOwnProperty(metricChannelKey) && isArray(localTableMetric[metricChannelKey])) {
            this.metricListByChannel[metricChannelKey] = {};
            localTableMetric[metricChannelKey].forEach(metricItem => {
              if (this.metricListByChannel[metricChannelKey].hasOwnProperty(metricItem['data_type'])) {
                this.metricListByChannel[metricChannelKey][metricItem['data_type']].push({
                  name: metricItem['name'],
                  key: metricItem['key'],
                  data_type: metricItem['data_type'],
                });
              } else {
                this.metricListByChannel[metricChannelKey][metricItem['data_type']] = [];
                this.metricListByChannel[metricChannelKey][metricItem['data_type']].push({
                  name: metricItem['name'],
                  key: metricItem['key'],
                  data_type: metricItem['data_type'],
                });
              }
            });
          }
        });


        Object.keys(localTableMetric['metric_type']).forEach(metricChannelKey => {
          this.metricTypeRelationByChannel[metricChannelKey] = [];
          Object.values(localTableMetric['metric_type'][metricChannelKey]).forEach(typeItem => {
            if (this.metricListByChannel[metricChannelKey] && this.metricListByChannel[metricChannelKey].hasOwnProperty(typeItem['data_type'])) {
              this.metricTypeRelationByChannel[metricChannelKey].push({
                "name": typeItem['data_type_name'],
                "key": typeItem['data_type'],
              });
            }



          });
        });
      }
    }


    this.itemTypeCopyRelation = [...this.itemTypeRelation];



    if (this.metricDataId === 0) {
      const line1 = {
        left_bracket: false,
        right_bracket: false,
        type: 'normal_data',
        name: '',
        value: '100',
        operator: '1'
      };
      this.formualData.push(line1);
    } else {
      this.getConversionListByCidChannel();
      this.onChangePublisher(false);

    }



  }

  companyMetricDisabledItemInit() {
    /*
      广告主-渠道-媒体只能出现一次， ===== disabled;
      广告主0(全部)已选的不能出现在全部非0的列表里，===== disabled;
      广告主非0已选的不能出现在0(全部)的列表里， ===== disabledOther。
    */

    const tmpItem = {
      0: {
        disabled: false,
        channel: JSON.parse(JSON.stringify(this.disabledInit))
      }
    };
    this.companyMetricList.forEach(defineItem => {
      if (tmpItem[defineItem.cid] === undefined) {
        tmpItem[defineItem.cid] = {
          disabled: true,
          channel: JSON.parse(JSON.stringify(this.disabledInit))
        };
      }

      // if (defineItem.channel_id) {
      if (defineItem.publisher_id === 999) {
        tmpItem['0'].channel["channel_" + defineItem.channel_id].disabledOther = true;

        tmpItem[defineItem.cid].channel["channel_" + defineItem.channel_id].disabled = true;
        for (const publisher in tmpItem[defineItem.cid].channel["channel_" + defineItem.channel_id]["publisher"]) {
          tmpItem['0'].channel["channel_" + defineItem.channel_id]["publisher"][publisher].disabledOther = true;

          tmpItem[defineItem.cid].channel["channel_" + defineItem.channel_id]["publisher"][publisher].disabled = true;
        }
      } else if (defineItem.publisher_id) {
        tmpItem['0'].channel["channel_" + defineItem.channel_id].disabledOther = true;
        tmpItem['0'].channel["channel_" + defineItem.channel_id]["publisher"]["publisher_999"].disabledOther = true;
        tmpItem['0'].channel["channel_" + defineItem.channel_id]["publisher"]["publisher_" + defineItem.publisher_id].disabledOther = true;

        tmpItem[defineItem.cid].channel["channel_" + defineItem.channel_id].disabled = true;
        tmpItem[defineItem.cid].channel["channel_" + defineItem.channel_id]["publisher"]["publisher_999"].disabled = true;
        tmpItem[defineItem.cid].channel["channel_" + defineItem.channel_id]["publisher"]["publisher_" + defineItem.publisher_id].disabled = true;
      }
      // }
    });

    for (const item in tmpItem) {
      for (const channel in tmpItem[item]["channel"]) {
        for (const publisher in tmpItem[item]["channel"][channel]["publisher"]) {
          if (!tmpItem[item]["channel"][channel]["publisher"][publisher].disabled) {
            tmpItem[item]["channel"][channel].disabled = false;
          }
          if (!tmpItem[item]["channel"][channel]["publisher"][publisher].disabledOther) {
            tmpItem[item]["channel"][channel].disabledOther = false;
          }
        }
        if (!tmpItem[item]["channel"][channel].disabled) {
          tmpItem[item].disabled = false;
        }
      }
    }

    this.disabledItem = { ...tmpItem };
  }

  checkBracket = function (item, side) {
    item[side] = !item[side];
  };

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  structTypeChange(struct) {
    if (struct.type === 'normal_data') {
      struct.value = 0;
      struct.name = '';
    } else if (
      this.itemTypeDataDetail[struct.type] &&
      this.itemTypeDataDetail[struct.type].length > 0
    ) {
      struct.value = this.itemTypeDataDetail[struct.type][0].key + '';
      struct.name = this.itemTypeDataDetail[struct.type][0].name + '';
    } else {
      struct.value = undefined;
      struct.name = undefined;
    }
  }

  refreshName(key, struct) {
    const findDetail = this.itemTypeDataDetail[struct.type].find(item => {
      return item.key === struct.value;
    });
    if (!isUndefined(findDetail)) {
      struct.name = findDetail.name;
    } else {
      struct.name = '';
    }
  }

  deleteLine(index) {
    this.formualData.splice(index, 1);
  }

  addLine(index) {
    const line_item = {
      left_bracket: false,
      right_bracket: false,
      type: 'normal_data',
      name: '',
      value: '100',
      operator: '1'
    };
    this.formualData.splice(index + 1, 0, line_item);
  }

  defaultMetricChannel(tag) {
    if (tag === 'channel_id') {
      this.defaultMetric.publisher_id = null;
      this.getConversionListByCidChannel();
    } else {
      this.defaultMetric.channel_id = null;
      this.defaultMetric.publisher_id = null;
    }
  }

  getConversionListByCidChannel() {
    const currentCidChannel = this.defaultMetric.cid + '_' + this.defaultMetric.channel_id;

    if (this._lastChangedCidChannel === currentCidChannel) {
      return false;
    }

    this._lastChangedCidChannel = currentCidChannel;
    const postData = {
      pConditions: [{ key: 'cid', name: '广告主', op: '=', value: this.defaultMetric.cid }]
    };

    this.itemDetailDefault['conversion_data'].splice(0, this.itemDetailDefault['conversion_data'].length);
    this.defineSettingService
      .getConversionListByChannel(this.defaultMetric.channel_id, postData, { count: '1000000', filter_cid: this.defaultMetric.cid })
      .subscribe(
        result => {
          if (result['status_code'] && result.status_code === 200) {
            result['data']['detail'].map(item => {
              this.itemDetailDefault['conversion_data'].push({ key: item['conver_column'], name: item['conver_name'] });
            });
          } else if (result['status_code'] && result.status_code === 205) {
            this.itemDetailDefault['conversion_data'] = [];
          } else if (result['status_code'] && result.status_code === 401) {
            this.itemDetailDefault['conversion_data'] = [];
            this.message.error('您没权限对此操作！');
            this.doCancel();
          } else if (result['status_code'] && result.status_code === 500) {
            this.itemDetailDefault['conversion_data'] = [];
            this.message.error('系统异常，请重试');
          } else {
            this.itemDetailDefault['conversion_data'] = [];
            this.message.error(result.message);
          }
        },
        err => {

          this.message.error('系统异常，请重试');
        }
      );
  }


  doSave() {
    let resultMetric = {
      cid: null,
      channel_id: null,
      publisher_id: null,
      metric_id: this.companyMetricId,
      metric_type: 1,
      name: this.companyMetricId + '',
    };

    resultMetric = Object.assign(resultMetric, this.defaultMetric);
    resultMetric['define'] = this.formualData;

    const isMatch = matchingBracket(this.formualData);
    //括号不匹配
    if (!isMatch) {
      this.message.error('公式的括号不匹配，请检查', { nzDuration: 5000 });
    } else {
      if (resultMetric.cid === null) {
        this.message.error('请选择广告主');
        return false;
      }
      if (resultMetric.channel_id === null) {
        this.message.error('请选择渠道');
        return false;
      }
      if (resultMetric.publisher_id === null) {
        this.message.error('请选择媒体');
        return false;
      }
      this.submitting = true;
      if (this.metricDataId > 0) {
        this.defineSettingService
          .updateCompanyMetricDetail(this.companyMetricId, this.metricDataId, resultMetric)
          .subscribe(
            data => {
              if (data['status_code'] && data.status_code === 200) {
                this.message.success('保存成功');
                this.modalSubject.destroy('onOk');
              } else if (data['status_code'] && data.status_code === 201) {
                this.message.error('广告主名称已经存在，请重试');
              } else if (data['status_code'] && data.status_code === 401) {
                this.message.error('您没权限对此操作！');
                this.doCancel();
              } else if (data['status_code'] && data.status_code === 500) {
                this.message.error('系统异常，请重试');
              } else {
                this.message.error(data.message);
              }
            },
            err => {

              this.message.error('系统异常，请重试');
            },
            () => {
              this.submitting = false;
            }
          );
      } else {
        this.defineSettingService.createCompanyMetricDetail(resultMetric).subscribe(
          data => {
            if (data['status_code'] && data.status_code === 200) {
              this.message.success('保存成功');
              this.modalSubject.destroy('onOk');
            } else if (data['status_code'] && data.status_code === 201) {
              this.message.error('广告主名称已经存在，请重试');
            } else if (data['status_code'] && data.status_code === 401) {
              this.message.error('您没权限对此操作！');
              this.doCancel();
            } else if (data['status_code'] && data.status_code === 500) {
              this.message.error('系统异常，请重试');
            } else {
              this.message.error(data.message);
            }
          },
          err => {
            this.message.error('系统异常，请重试');
          },
          () => {
            this.submitting = false;
          }
        );
      }
    }
  }


  public generatePublishItems() {
    const publisherMap = this.customDatasService.publisherNewMapObjKey;
    const publishItems = {
      0: [
        { publisher_name: '全部', publisher_id: 999 },
      ]
    };
    const disableInit = {
      channel_0: {
        disabled: false,
        publisher: {
          publisher_999: {
            disabled: false
          }
        }
      }
    };
    this.customDatasService.productArray.forEach(item => {
      const channelPublisherRelation = item['product_id'].split('_');
      const channelId = channelPublisherRelation[0];
      const publisherId = channelPublisherRelation[1];
      if (!publishItems[channelId]) {
        publishItems[channelId] = [{ publisher_name: '全部', publisher_id: 999 }];
        disableInit['channel_' + channelId] = {
          disabled: false,
          publisher: {
            publisher_999: {
              disabled: false
            }
          }
        };
      }



      if (channelId != '1') {
        if (publisherMap['publisher_id_' + publisherId]) {
          publishItems[channelId].push({ publisher_name: publisherMap['publisher_id_' + publisherId], publisher_id: publisherId });
          disableInit['channel_' + channelId]['publisher']['publisher_' + publisherId] = {
            disabled: false
          };
        }

      }




    });

    this.publishItems = { ...publishItems };
    this.disabledInit = { ...disableInit };


  }
}
