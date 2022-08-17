import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { DataViewAddEditService } from "../../service/data-view-add-edit.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DataViewOptimizationService } from "../../service/data-view-optimization.service";
import { RegionListService } from "../../../dashboard/service/region-list.service";
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../core/service/auth.service";
import { DataViewFolderService } from '../../service/data-view-folder.service';


@Component({
  selector: 'app-data-view-edit',
  templateUrl: './data-view-edit.component.html',
  styleUrls: ['./data-view-edit.component.scss'],
  providers: [DataViewAddEditService, DataViewOptimizationService, RegionListService, DataViewFolderService]
})

export class DataViewEditComponent implements OnInit {

  @Input() parentData: any;
  @Output() isHidden = new EventEmitter();

  constructor(private optimizationService: DataViewOptimizationService,
    private _http: DataViewAddEditService,
    private modalService: NzModalService,
    private route: ActivatedRoute,
    private authService: AuthService) {
    this.route.data.subscribe(data => {
      this.summaryType = data['summaryType'];
    });

  }

  public publisherOption = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马'
  };
  public stringIdArray = [];
  public accountAllPublishers = [];
  public is_check = 0;
  public monitor_status: any;
  public summaryType = '';
  public publisher_model: any = {
    'publisherCount': 1,
    'publisher_array': [],
    'hasForeignPublisher': false,
    'foreignPublisherList': [],
  };

  public publisherHasForeign = false;
  public foreignPublisherList = [];


  public currentSelectedMenu = ''; // 默认选项
  public newMenuList = [];
  public saveing = false;
  public idsArray = [];
  public is_adjustment_words = false; //是否需要调词 默认不需要

  private ngIndex = {
    'keyword': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id', 'pub_keyword_id'],
    'adgroup': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id'],
    'campaign': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id'],
    'account': ['publisher_id', 'chan_pub_id', 'pub_account_id'],
    'creative': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id', 'pub_creative_id']
  };

  private ngEditIndex = {
    'keyword': ['chan_pub_id', 'pub_account_id', 'pub_keyword_id'],
    'keyword_10': ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id', 'pub_keyword_id'],
    'adgroup': ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id'],
    'campaign': ['chan_pub_id', 'pub_account_id', 'pub_campaign_id'],
    'account': ['chan_pub_id', 'pub_account_id'],
    'creative': ['chan_pub_id', 'pub_account_id', 'pub_creative_id'],
    'creative_10': ['chan_pub_id', 'pub_account_id', 'pub_adgroup_id', 'pub_creative_id']
  };

  public menuList = {
    "single": [
      { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'keyword', 'is_show': true },
      { key: 'editing_optimization', 'name': '优化设置', 'summaryType': 'keyword', 'is_show': true },
      { key: 'editing_dimension', 'name': '维度设置', 'summaryType': 'keyword', 'is_show': true },
      { key: 'editing_price', 'name': '出价设置', 'summaryType': 'keyword', 'is_show': true },
      { key: 'editing_keyword2', 'name': '基础设置', 'summaryType': 'keyword', 'is_show': true },
      { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'keyword', 'is_show': true },
      { key: 'history_setting', 'name': '操作记录', 'summaryType': 'keyword', 'is_show': true },

      { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'campaign', 'is_show': true },
      { key: 'editing_optimization', 'name': '优化设置', 'summaryType': 'campaign', 'is_show': true },
      { key: 'editing_dimension', 'name': '维度设置', 'summaryType': 'campaign', 'is_show': true },
      { key: 'campaign_edit_setting', 'name': '基础设置', 'summaryType': 'campaign', 'is_show': true },
      { key: 'extension_setting', 'name': '推广设置', 'summaryType': 'campaign', 'is_show': true },
      { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'campaign', 'is_show': true },
      { key: 'history_setting', 'name': '操作记录', 'summaryType': 'campaign', 'is_show': true },

      { key: 'editing_optimization', 'name': '优化设置', 'summaryType': 'account', 'is_show': true },
      { key: 'editing_dimension', 'name': '维度设置', 'summaryType': 'account', 'is_show': true },
      { key: 'account_editing', 'name': '基础设置', 'summaryType': 'account', 'is_show': true },
      { key: 'extension_setting', 'name': '推广设置', 'summaryType': 'account', 'is_show': true, remove: [3] },
      { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'account', 'is_show': true },
      { key: 'history_setting', 'name': '操作记录', 'summaryType': 'account', 'is_show': true },

      { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'adgroup', 'is_show': true },
      { key: 'editing_optimization', 'name': '优化设置', 'summaryType': 'adgroup', 'is_show': true },
      { key: 'editing_dimension', 'name': '维度设置', 'summaryType': 'adgroup', 'is_show': true },
      { key: 'editing_unit', 'name': '基础设置', 'summaryType': 'adgroup', 'is_show': true },
      { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'adgroup', 'is_show': true },
      { key: 'history_setting', 'name': '操作记录', 'summaryType': 'adgroup', 'is_show': true },

      { key: 'editing_Originality', 'name': '基础设置', 'summaryType': 'creative' },
      { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'creative', 'is_show': true },
      { key: 'history_setting', 'name': '操作记录', 'summaryType': 'creative' }
    ],
    "batch": [
      { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'keyword', 'is_show': true },
      { key: 'editing_optimization', 'name': '优化设置', 'summaryType': 'keyword', 'is_show': true },
      { key: 'editing_dimension', 'name': '维度设置', 'summaryType': 'keyword', 'is_show': true },
      { key: 'editing_price', 'name': '出价设置', 'summaryType': 'keyword', 'is_show': true },
      { key: 'batch_editing_keyword', 'name': '基础设置', 'summaryType': 'keyword', 'is_show': true },
      { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'keyword', 'is_show': true },

      { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'campaign', 'is_show': true },
      { key: 'editing_optimization', 'name': '优化设置', 'summaryType': 'campaign', 'is_show': true },
      { key: 'editing_dimension', 'name': '维度设置', 'summaryType': 'campaign', 'is_show': true },
      { key: 'batch_campaign_basics_setting', 'name': '基础设置', 'summaryType': 'campaign', 'is_show': true },
      { key: 'extension_setting', 'name': '推广设置', 'summaryType': 'campaign', 'is_show': true },
      { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'campaign', 'is_show': true },

      { key: 'editing_optimization', 'name': '优化设置', 'summaryType': 'account', 'is_show': true },
      { key: 'editing_dimension', 'name': '维度设置', 'summaryType': 'account', 'is_show': true },
      { key: 'batch_account_setting', 'name': '基础设置', 'summaryType': 'account', 'is_show': true },
      { key: 'extension_setting', 'name': '推广设置', 'summaryType': 'account', 'is_show': true, remove: [3] }, //remove: 对应媒体无此功能
      { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'account', 'is_show': true },

      { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'adgroup', 'is_show': true },
      { key: 'editing_optimization', 'name': '优化设置', 'summaryType': 'adgroup', 'is_show': true },
      { key: 'editing_dimension', 'name': '维度设置', 'summaryType': 'adgroup', 'is_show': true },
      { key: 'batch_editing_unit', 'name': '基础设置', 'summaryType': 'adgroup', 'is_show': true },
      { key: 'automatic_monitoring_setting', 'name': '监控设置', 'summaryType': 'adgroup', 'is_show': true },

      { key: 'batch_editing_Originality', 'name': '基础设置', 'summaryType': 'creative' },
      { key: 'editing_folder', 'name': '分组设置', 'summaryType': 'creative', 'is_show': true },
    ]
  };

  ngOnInit() {
    this.setDataViewList();
    this.authService.getStopBackState().subscribe((result) => {
      if (result === 'true') {
        this.isHidden.emit('false');
      }
    });
  }

  save_state(event) {
    this.saveing = event['is_saving'];
    this.isHidden.emit(event['isHidden']);
  }

  getAdjustmentWordsState(event) {
    this.is_adjustment_words = event;
  }

  changeSelectedMenu(item) {
    if (item['is_show'] || this.parentData['editParameter'] === 'all') {
      this.currentSelectedMenu = item.key;
    }
  }


  setDataViewList() {
    if (this.parentData.selected_data.length === 1) { //单个编辑
      this.getParentPublishers();
      for (let i = 0; i < this.menuList.single.length; i++) {

        if (this.menuList.single[i].summaryType === this.summaryType) {
          if (this.parentData.selected_data[0].publisher_id * 1 === 3 && this.menuList.single[i]['remove'] && this.menuList.single[i]['remove'].indexOf(3) !== -1) {
            //360无推广地域
          } else {
            this.newMenuList.push(this.menuList.single[i]);
          }
        }
      }
      this.currentSelectedMenu = this.newMenuList[0].key;
    } else { //批量编辑



      //统计批量编辑媒体的个数与 name
      if (this.parentData['selected_type'] === 'all') {
        let hasPublish = false; //标志有无单选媒体
        //单个筛选了媒体
        if (this.parentData['allViewTableData']['single_condition'].length) {
          hasPublish = false;
          this.parentData['allViewTableData']['single_condition'].forEach((singleItem) => {
            if (singleItem['key'] === 'publisher_id') {
              this.publisher_model['publisherCount'] = 1;
              this.publisher_model['publisher_array'].push({
                'name': this.publisherOption[singleItem['value']],
                'value': singleItem['value'] * 1
              });
              if (singleItem['value'] * 1 === 10) {
                this.publisherHasForeign = true;
                this.foreignPublisherList.push(10);
              }
              hasPublish = true;
            }
          });
        }

        //点击筛选按钮中的媒体
        if (!hasPublish && (!isUndefined(this.parentData['allViewTableData']['data_range']['select_data']) && this.parentData['allViewTableData']['data_range']['select_data'].length)) {
          //选择多个
          if (this.parentData['allViewTableData']['data_range']['select_data'].length > 1) {
            const pubIndex = {};
            this.parentData['allViewTableData']['data_range']['select_data'].forEach((pub) => {
              const pub_id = pub.substring(0, 1) * 1;
              if (!pubIndex.hasOwnProperty(pub_id)) {
                pubIndex[pub_id] = 0;
                this.publisher_model['publisher_array'].push({
                  'name': this.publisherOption[pub_id],
                  'value': pub_id * 1
                });
                if (pub_id === 10) {
                  this.publisherHasForeign = true;
                  this.foreignPublisherList.push(10);
                }
              }
            });
            this.publisher_model['publisherCount'] = Object.keys(pubIndex).length;
          } else { //选择一个
            const pubId = this.parentData['allViewTableData']['data_range']['select_data'][0].substring(0, 1) * 1;
            this.publisher_model['publisherCount'] = this.parentData['allViewTableData']['data_range']['select_data'].length;
            this.publisher_model['publisher_array'].push({
              'name': this.publisherOption[pubId],
              'value': pubId * 1
            });
            if (pubId === 10) {
              this.publisherHasForeign = true;
              this.foreignPublisherList.push(10);
            }
          }
        }

        //没有任何筛选
        if (!hasPublish && (Array.isArray(this.parentData['allViewTableData']['data_range']) ||
          (!isUndefined(this.parentData['allViewTableData']['data_range']['select_data']) && !this.parentData['allViewTableData']['data_range']['select_data'].length))) {
          //得到到此账户下的媒体
          this.accountAllPublishers = this.parentData['account_publishers'];
          this.publisher_model['publisherCount'] = this.accountAllPublishers.length;
          this.accountAllPublishers.forEach((pub) => {
            this.publisher_model['publisher_array'].push({
              'name': this.publisherOption[pub],
              'value': pub * 1
            });
            if (pub * 1 === 10) {
              this.publisherHasForeign = true;
              this.foreignPublisherList.push(10);
            }
          });

        }

      } else if (this.parentData['selected_type'] === 'current') {
        this.publisher_model = this.getParentPublishers();
      }

      for (let i = 0; i < this.menuList.batch.length; i++) {

        if (this.menuList.batch[i].summaryType === this.summaryType) {
          // this.newMenuList.push(this.menuList.batch[i]);

          if (this.publisher_model['publisherCount'] === 1 && this.parentData.selected_data[0].publisher_id * 1 === 3 && this.menuList.batch[i]['remove'] && this.menuList.batch[i]['remove'].indexOf(3) !== -1) {
            //360无推广地域
          } else {
            this.newMenuList.push(this.menuList.batch[i]);
          }

        }
      }

      this.currentSelectedMenu = this.newMenuList[0].key;
      this.foreignPublisherList = Array.from(new Set(this.foreignPublisherList));
      this.publisher_model.hasForeignPublisher = this.publisherHasForeign;
      this.publisher_model.foreignPublisherList = this.foreignPublisherList;


    }
  }


  getParentPublishers() {
    const publishers = {};
    const publisherArray = [];
    let number = 0; //记录有几种媒体
    this.parentData.selected_data.forEach((item) => {
      if (!publishers.hasOwnProperty(item.publisher_id)) {
        publishers[item.publisher_id] = 1;
        publisherArray.push({
          'name': item['publisher'],
          'value': item['publisher_id'] * 1,
        });
        if (item['publisher_id'] * 1 === 10) {
          this.publisherHasForeign = true;
          this.foreignPublisherList.push(10);
        }
        number++;
      }
      const keyObj = {};
      this.ngIndex[this.summaryType].forEach((indexKey) => {
        keyObj[indexKey] = item[indexKey];
      });
      this.idsArray.push(keyObj);
      const needId = [];
      if (this.summaryType === 'keyword' && item['publisher_id'] * 1 === 10) {
        this.ngEditIndex['keyword_10'].forEach((key) => {
          needId.push(item[key]);
        });
      } else if (this.summaryType === 'creative' && item['publisher_id'] * 1 === 10) {
        this.ngEditIndex['creative_10'].forEach((key) => {
          needId.push(item[key]);
        });
      } else {
        this.ngEditIndex[this.summaryType].forEach((key) => {
          needId.push(item[key]);
        });
      }

      this.stringIdArray.push(needId.join('_'));
    });
    return {
      'publisher_array': publisherArray,
      'publisherCount': number
    };
  }

  _save(monitor_status?) {
    this.is_check = this.is_check + 1;
    if (monitor_status) {
      this.monitor_status = monitor_status;
    }
  }


  _cancel() {
    localStorage.removeItem('edit_state');
    this.isHidden.emit('false');
  }

}
