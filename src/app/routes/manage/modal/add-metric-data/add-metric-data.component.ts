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
  templateUrl: './add-metric-data.component.html',
  styleUrls: ['./add-metric-data.component.scss']
})
export class AddMetricDataComponent implements OnInit {
  @Input() set metricData(data: any) {
    this.formualData = data['metric_define'];
    this.defaultMetric = Object.assign(this.defaultMetric, {
      cid: data['cid'],
      channel_id: data['channel_id'],
      publisher_id: data['publisher_id'],
      metric_type: data['metric_type'],
      metric_name: data['metric_name'],
      metric_remarks: data['metric_remarks'],
      is_rate: data['is_rate'] * 1 === 1,
      metric_data_type: data['metric_data_type'],
      category_id: data['category_id']
    });

  }

  @Input() metricDataId = 0;
  // 指标分类列表
  @Input() categoryList = [];

  public advertiserList = [];

  public submitting = false;
  private _lastChangedCid = 0;

  public itemTypeCopyRelation;

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


  public itemTypeRelationChannel = {
    //百度
    '1': [
      { name: '转化数据APP类', type: 'option', key: 'pub_conversion_bd_app' },
      { name: '转化数据网页类', type: 'option', key: 'pub_conversion_bd_web' }
    ],
    //广点通
    '6': [
      { name: '转化数据APP类', type: 'option', key: 'pub_conversion_gdt_app' },
      { name: '转化数据网页类', type: 'option', key: 'pub_conversion_gdt_web' },
      {
        name: '转化数据社交互动指标',
        type: 'option',
        key: 'pub_conversion_gdt_social'
      }
    ],
    //头条
    '7': [
      { name: '应用下载转化数据', key: 'pub_conversion_bytedance_download' },
      { name: '落地页转化数据', key: 'pub_conversion_bytedance_landing_page' },
      { name: '视频转化数据', key: 'pub_conversion_bytedance_video' },
      {
        name: '附加创意转化数据',
        key: 'pub_conversion_bytedance_extra_creative'
      },
      { name: '头条转化数据', key: 'pub_conversion_bytedance_basic' },
      { name: '互动转化数据', key: 'pub_conversion_bytedance_social' }
    ]
  };


  public formualData = [];

  public operatorLists = [
    { oper: '1', value: '+' },
    { oper: '2', value: '-' },
    { oper: '3', value: '*' },
    { oper: '4', value: '/' }
  ];

  public channelItems = [
    { key: 1, name: "sem" },
    { key: 2, name: "信息流" },
    { key: 3, name: "应用市场" }
  ];



  public publisherTypeRelation: object;
  public publishItems: any = {
    1: [
      { publisher_name: '通用', publisher_id: 999 },
    ],
    2: [
      { publisher_name: '通用', publisher_id: 999 },
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
      { publisher_name: '通用', publisher_id: 999 },
      { publisher_name: '小米', publisher_id: 13 },
      { publisher_name: 'OPPO', publisher_id: 14 },
      { publisher_name: 'VIVO', publisher_id: 15 },
    ]
  };

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
    this.publisherTypeRelation = this.manageItemService.publisherTypeRelation;
    //信息流添加媒体1，6，7（1、百度 6、广点通 7、头条）
    if (this.menuService.currentChannelId === 2 || this.menuService.currentChannelId === 3) {
      this.itemTypeCopyRelation = [...this.itemTypeRelation];

    }
    this.generatePublishItems();
  }

  public defaultMetric = {
    cid: null,
    metric_type: 1,
    metric_name: '',
    metric_remarks: '',
    metric_define: [],
    is_rate: false,
    metric_data_type: 2,
    publisher_id: 999,
    channel_id: 1,
    category_id: null
  };

  // onChangePubliser(e) {
  //   if ([1, 6, 7].includes(this.defaultMetric['publisher_id'])) {
  //     this.itemTypeRelation = [
  //       ...this.itemTypeCopyRelation,
  //       ...this.itemTypeRelationChannel[this.defaultMetric['publisher_id']]
  //     ];
  //   } else {
  //     this.itemTypeRelation = [...this.itemTypeCopyRelation];
  //   }
  // }


  defaultMetricChannel(tag) {
    if (tag === 'channel_id') {
      if (this.defaultMetric.channel_id == 1) {
        this.defaultMetric.publisher_id = 999;
      } else {
        this.defaultMetric.publisher_id = 999;
      }
      this.getConversionListByCid(this.defaultMetric.cid, false);
    } else {
      this.defaultMetric.channel_id = null;
      this.defaultMetric.publisher_id = null;
    }
  }

  onChangePublisher(init = true) {
    if (this.defaultMetric.publisher_id > 0 && this.defaultMetric.channel_id > 0) {
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
        this.formualData = [{ ...line1 }, { ...line1 }];
      }

    }

  }


  ngOnInit() {
    if (this.defaultMetric.cid > 0) {
      this.getConversionListByCid(this.defaultMetric.cid, false);
    }

    this.manageService
      .getAdvertiserList({}, { result_model: 'all', need_publish_account: 0 })
      .subscribe(
        result => {
          if (result['status_code'] && result.status_code === 200) {
            this.advertiserList = result['data'];
            if (this.advertiserList.length === 1) {
              this.defaultMetric.cid = this.advertiserList[0]['cid'];
              this.getConversionListByCid(this.defaultMetric.cid, false);
            }
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
      this.formualData = [{ ...line1 }, { ...line1 }];
      this.onChangePublisher(false);
    } else {
      this.getConversionListByCid(this.defaultMetric.cid);
      this.onChangePublisher(false);

    }


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
      struct.value = '';
      struct.name = '';
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

  getConversionListByCid(cid, init = true) {
    if (this._lastChangedCid === cid) {
      return false;
    }

    this._lastChangedCid = cid;
    if (init) {
      this.formualData = [];
      const line1 = {
        left_bracket: false,
        right_bracket: false,
        type: 'normal_data',
        name: '',
        value: '100',
        operator: '1'
      };
      const line2 = {
        left_bracket: false,
        right_bracket: false,
        type: 'normal_data',
        name: '',
        value: '100',
        operator: '1'
      };
      this.formualData.push(line1);
      this.formualData.push(line2);
    }
    const postData = {
      pConditions: [{ key: 'cid', name: '广告主', op: '=', value: cid }]
    };

    this.itemDetailDefault['conversion_data'].splice(0, this.itemDetailDefault['conversion_data'].length);
    this.defineSettingService
      .getConversionList(postData, { count: '1000000', filter_cid: cid })
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
      cid: 0,
      metric_type: 1,
      metric_name: ''
    };
    resultMetric = Object.assign(resultMetric, this.defaultMetric);
    resultMetric['metric_define'] = this.formualData;

    const isMatch = matchingBracket(this.formualData);
    //括号不匹配
    if (!isMatch) {
      this.message.error('公式的括号不匹配，请检查', { nzDuration: 5000 });
    } else {
      if (resultMetric.cid < 1) {
        this.message.error('请选择广告主');
        return false;
      }
      if (resultMetric.metric_name === '') {
        this.message.error('请填写转化名称');
        return false;
      }

      if (resultMetric['channel_id'] == 1) {
        resultMetric['publisher_id'] = 999;
      }

      if (resultMetric['publisher_id'] == null) {
        this.message.error('请选择媒体');
        return false;
      }
      this.submitting = true;
      if (this.metricDataId > 0) {
        this.defineSettingService
          .updateMetric(this.metricDataId, resultMetric)
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
        this.defineSettingService.createMetric(resultMetric).subscribe(
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
        { publisher_name: '通用', publisher_id: 999 },
      ]
    };
    this.customDatasService.productArray.forEach(item => {
      const channelPublisherRelation = item['product_id'].split('_');
      const channelId = channelPublisherRelation[0];
      const publisherId = channelPublisherRelation[1];
      if (!publishItems[channelId]) {
        publishItems[channelId] = [{ publisher_name: '通用', publisher_id: 999 }];
      }



      if (channelId != '1') {
        if (publisherMap['publisher_id_' + publisherId]) {
          publishItems[channelId].push({ publisher_name: publisherMap['publisher_id_' + publisherId], publisher_id: publisherId * 1 });
        }

      }




    });

    this.publishItems = { ...publishItems };


  }
}
