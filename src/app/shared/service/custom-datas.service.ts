import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClientService } from "../../core/service/http.client";
import { MenuService } from '../../core/service/menu.service';
import { LocalStorageService } from 'ngx-webstorage';
import { TableItemDatasService } from './table-item-datas'
import { deepCopy } from '@jzl/jzl-util';
@Injectable()
export class CustomDatasService {


  constructor(private _httpClient: HttpClientService,
    private menuService: MenuService,
    private localSt: LocalStorageService,
    private tableItemDatasService: TableItemDatasService,
  ) {
  }
  public automationRenderData = {};
  public tableItemLists = {};
  public publisherMapObjKey: any = {};

  // channel
  public channelMap: any = {};
  public channelMapObjKey: any = {};
  public channelMapLabel: any = {};
  public channelArray: any[] = [];
  public channelList: any[] = [];

  // publisher_new
  public publisherNewMap: any = {};
  public publisherNewMapObjKey: any = {};
  public publisherNewArray: any[] = [];
  public publisherNewList: any[] = [];

  // product
  public productMap: any = {};
  public productMapObjKey: any = {};
  public productArray: any[] = [];
  public productList: any[] = [];

  // trade
  public tradeMap: any = {};
  public tradeMapObjKey: any = {};
  public tradeArray: any[] = [];
  public tradeList: any[] = [];
  public brandMapObjKey: any = {};

  private customDataOwner = 0;

  public converFlag = false;
  private conver_datas = [];

  public converDescFlag = false;
  private conver_desc_data = [];

  public metricFlag = false;
  private metric_datas = [];

  public dimFlag = false;
  private dim_data = [];

  public bizUnitFlag = false;
  private biz_unit_data = [];

  public provinceFlag = false;
  private provinceList = [];

  public cityFlag = false;
  private cityList = [];

  public responsibleFlag = false;
  private responsibleList = [];

  public tableItemFlag = false;

  public defaultFeedItemFilters;
  public defaultSemItemFilters;

  async dealTradeTypeData() {
    if (this.tradeArray.length > 0) {
      return;
    }
    const result = await this.getDefaultTableData();
    if (result['status_code'] == 200) {
      const tradeData = result['data']['trade_type_biz'];
      this.tradeMap = { ...tradeData };
      const resultTradeArray = [];
      const resultTradeList = [];
      const resultTradeObjKey = {};
      const resultBrandObjKey = {};
      tradeData.forEach((v) => {
        resultTradeArray.push({ "trade_id": v.trade_id, "trade_name": v.trade_name });
        resultTradeList.push({ "key": v.trade_id, "name": v.trade_name });
        resultTradeObjKey['trade_id_' + v.trade_id] = v.trade_name;
        resultBrandObjKey['trade_id_' + v.trade_id] = v.biz_brand_name;
      });
      this.tradeList = [...resultTradeList];
      this.tradeArray = [...resultTradeArray];
      this.tradeMapObjKey = { ...resultTradeObjKey };
      this.brandMapObjKey = { ...resultBrandObjKey };
    }
  }
  // 获取页面默认数据
  getDefaultTableData() {
    const url = `/define_list/common_setting?host=` + window.location.hostname;
    return this._httpClient.get(url).toPromise();
  }

  setResponsibleList(lists) {
    this.responsibleList = lists;
  }

  setCityList(lists) {
    this.cityList = lists;
  }

  setProvinceList(lists) {
    this.provinceList = lists;
  }

  setBizUnitData(lists) {
    this.biz_unit_data = lists;
  }

  setMetricsData(lists) {
    this.metric_datas = lists;
  }

  setConversionData(lists) {
    this.conver_datas = lists;
  }

  setConversionDescData(lists) {
    this.conver_desc_data = lists;
  }

  setDimData(lists) {
    this.dim_data = lists;
  }

  getResponsibleList() {
    return this.responsibleList;
  }

  getCityList() {
    return this.cityList;
  }

  getProvinceList() {
    return this.provinceList;
  }

  getBizUnitData() {
    return this.biz_unit_data;
  }

  getMetricsData() {
    return this.metric_datas;
  }

  getConversionData() {
    return this.conver_datas;
  }

  getConversionDescData() {
    return this.conver_desc_data;
  }

  getDimData() {
    return this.dim_data;
  }


  getLocalData(channel) {
    const cacheKey = channel + '_data';
    return this.localSt.retrieve(cacheKey);
  }

  setLocalData(channel, result) {
    const cacheKey = channel + '_data';
    this.localSt.store(cacheKey, result);
  }

  loadData(cid, force = false, params?) {
    if (cid !== 0 && cid === this.customDataOwner && !force) {
      return false;
    }

    if (!this.converFlag) {
      this.getConversionLists(params).subscribe(result => {
        if (result['status_code'] && (result['status_code'] === 200 || result['status_code'] === 205)) {
          this.setConversionData(result['data']);
        } else {
          // -- 错误不处理
        }
      }, error => {

      });
    }

    if (!this.converDescFlag) {
      this.getFilterConversionDescLists(params).subscribe(result => {
        if (result['status_code'] && (result['status_code'] === 200 || result['status_code'] === 205)) {
          this.setConversionDescData(result['data']);
        } else {
          // -- 错误不处理
        }
      }, error => {

      });
    }

    if (!this.metricFlag) {
      this.getMetricLists(params).subscribe(result => {
        if (result['status_code'] && (result['status_code'] === 200 || result['status_code'] === 205)) {
          this.setMetricsData(result['data']);
        } else {
          // -- 错误不处理
        }
      }, error => {

      });
    }

    if (!this.dimFlag) {
      this.getDimLists(params).subscribe(result => {
        if (result['status_code'] && (result['status_code'] === 200 || result['status_code'] === 205)) {
          this.setDimData(result['data']);
        } else {
          // -- 错误不处理
        }
      }, error => {

      });
    }
    if (!this.bizUnitFlag) {
      this.getBizUnitList().subscribe(result => {
        if (result['status_code'] && result['status_code'] === 200) {
          this.setBizUnitData(result['data']);
        } else {
          // -- 错误不处理
        }
      }, error => {

      });
    }

    if (!this.provinceFlag) {
      this.getProvinces().subscribe(result => {
        if (result['status_code'] && result['status_code'] === 200) {
          this.dimFlag = true;
          const res = [];
          result['data'].forEach(item => {
            res.push({ name: item['region_name'], key: item['region_id'] });
          });
          this.setProvinceList(res);
        } else {
          // -- 错误不处理
        }
      }, error => {

      });
    }

    if (!this.cityFlag) {
      this.getCitys().subscribe(result => {
        this.cityFlag = true;
        if (result['status_code'] && result['status_code'] === 200) {
          const res = [];
          result['data'].forEach(item => {
            res.push({ name: item['region_name'], key: item['region_id'] });
          });
          this.setCityList(res);
        } else {
          // -- 错误不处理
        }
      }, error => {

      });
    }
    if (!this.responsibleFlag) {
      this.getResponsible().subscribe(result => {
        if (result['status_code'] && result['status_code'] === 200) {
          const res = [];
          result['data'].forEach(item => {
            res.push({ name: item['user_name'], key: item['user_id'] });
          });
          this.setResponsibleList(res);
        } else {
          // -- 错误不处理
        }
      }, error => {

      });
    }
    if (!this.tableItemFlag) {
      this.tableItemLists = this.getLocalData('feed_table_item') || {};

      this.getTableItemLists().subscribe(result => {
        if (result['status_code'] && result['status_code'] === 200) {
          this.tableItemLists = result['data'] || {};
          this.setLocalData('feed_table_item', result['data']);
        } else {
          // -- 错误不处理
        }
      }, error => {

      });
    }


    if (cid !== 0) {
      this.customDataOwner = cid;
    }
  }


  async dealChannelData() {
    if (this.channelArray.length > 0) {
      return;
    }

    const result = await this.getChannelData();
    if (result['status_code'] == 200) {
      const channelData = result['data'];
      this.channelMap = { ...channelData };
      const resultChannelArray = [];
      const resultChannelList = [];
      const resultChannelObjKey = {};
      const resultChannelObjLabel = {};
      channelData.forEach((v) => {
        resultChannelArray.push({ "channel_id": parseInt(v.channel_id), "channel_name": v.channel_name });
        resultChannelList.push({ "key": parseInt(v.channel_id), "name": v.channel_name });
        resultChannelObjKey['channel_id_' + v.channel_id] = v.channel_name;
        resultChannelObjLabel['channel_' + v.channel_id] = { label: v.channel_name };
      });
      this.channelList = [...resultChannelList];
      this.channelArray = [...resultChannelArray];
      this.channelMapObjKey = { ...resultChannelObjKey };
      this.channelMapLabel = { ...resultChannelObjLabel };
    }
  }

  async dealPublisherNewData() {
    if (this.publisherNewArray.length > 0) {
      return;
    }

    const result = await this.getPublisherNewData();
    if (result['status_code'] == 200) {
      const publisherData = result['data'];
      this.publisherNewMap = { ...publisherData };
      const resultPublisherNewArray = [];
      const resultPublisherNewList = [];
      const resultPublisherNewObjKey = {};
      publisherData.forEach((v) => {
        resultPublisherNewArray.push({ "publisher_id": parseInt(v.publisher_id), "publisher_name": v.publisher_name });
        resultPublisherNewList.push({ "key": parseInt(v.publisher_id), "name": v.publisher_name });
        resultPublisherNewObjKey['publisher_id_' + v.publisher_id] = v.publisher_name;
      });
      this.publisherNewList = [...resultPublisherNewList];
      this.publisherNewArray = [...resultPublisherNewArray];
      this.publisherNewMapObjKey = { ...resultPublisherNewObjKey };
      this.publisherMapObjKey = { ...resultPublisherNewObjKey };
    }
  }

  async dealProductData() {
    if (this.productArray.length > 0) {
      return;
    }

    const result = await this.getProductData();
    if (result['status_code'] == 200) {
      const productData = result['data'];
      this.productMap = { ...productData };
      const resultProductArray = [];
      const resultProductList = [];
      const resultProductObjKey = {};
      productData.forEach((v) => {
        resultProductArray.push({ "product_id": v.product_key, "product_name": v.product_name });
        resultProductList.push({ "key": v.product_key, "name": v.product_name });
        resultProductObjKey['product_id_' + v.product_key] = v.product_name;
      });
      this.productList = [...resultProductList];
      this.productArray = [...resultProductArray];
      this.productMapObjKey = { ...resultProductObjKey };
    }
  }

  // 获取自动化策略数据
  async dealAutomationRenderData() {
    const result = await this.getAutomationRenderData();
    if (result['status_code'] == 200) {
      this.automationRenderData = result.data;
    }
  }

  // 获取自动化策略初始数据
  getAutomationRenderData() {
    const url = '/automation/tactic_render_option';
    return this._httpClient.get(url).toPromise();
  }

  getConversionLists(params): Observable<any> {
    const url = `/define_list/conversion?list_type=filter`;
    return this._httpClient.get(url);
  }

  getFilterConversionDescLists(params): any {
    const url = `/define_list/conversion_desc?list_type=filter`;
    return this._httpClient.get(url, params);
  }

  getMetricLists(params): Observable<any> {
    const url = `/define_list/metric?list_type=filter`;
    return this._httpClient.get(url);
  }

  getDimLists(params): Observable<any> {
    const url = '/define_list/dimension?list_type=filter';
    return this._httpClient.get(url);
  }

  getTableItemLists(): Observable<any> {
    const url = '/define_list/conversion_basic_publisher';
    return this._httpClient.get(url);
  }


  getOptimizationList(params): Observable<any> {
    const url = '/define_list/optimization_list?no_statistics=1';
    return this._httpClient.get(url, params);
  }

  getBizUnitList() {
    const url = '/define_list/biz_unit';
    return this._httpClient.get(url);
  }

  getProvinces() {
    const url = '/define_list/province';
    return this._httpClient.get(url);
  }

  getCitys() {
    const url = '/define_list/city';
    return this._httpClient.get(url);
  }

  getResponsible() {
    const url = '/define_list/responsible';
    return this._httpClient.get(url);
  }

  getChannelData() {
    const url = '/define_list/channel_dict';
    return this._httpClient.get(url).toPromise();
  }

  getPublisherNewData() {
    const url = '/define_list/publisher_dict_new';
    return this._httpClient.get(url).toPromise();
  }

  getProductData() {
    const url = '/define_list/product_dict';
    return this._httpClient.get(url).toPromise();
  }


  public getItemFeedFilterType(summary_type, key) {
    this.defaultFeedItemFilters = JSON.parse(JSON.stringify(this.tableItemDatasService.defaultItemFilters['defaultFeedItemFilters']));

    let itemFilters = {};
    itemFilters = Object.assign(itemFilters, this.defaultFeedItemFilters[key], this.defaultFeedItemFilters["commonFilters"]);


    if (summary_type !== 'conversion_report_sem') {
      itemFilters['data_hour'] = {
        filterType: 'numberFilter',
        filterOption: [],
        filterKey: { key: 'data_hour', data_type: 'pub_lock_data', name: '时段', 'type': 'numberFilter' },
        filterResult: {},
        extraOption: {
          columnCount: false
        }
      };
    }

    // 添加筛选配置项
    for (const itemKey in this.tableItemLists) {
      if (itemKey !== 'metric_type') {
        this.tableItemLists[itemKey].forEach(item => {
          itemFilters[item['key']] = {
            filterType: 'numberFilter',
            filterOption: [],
            filterKey: { key: item['key'], data_type: item.data_type, name: item['name'], 'type': 'numberFilter' },
            filterResult: {},
            extraOption: {
              columnCount: false
            }
          }
        })
      }
    }
    // 样式material_style
    if (summary_type === 'material_style') {
      itemFilters['material_style'] = {
        filterType: 'singleList',
        filterOption: [
          { key: '-1', name: "未知" },
          { key: '1', name: "单图" },
          { key: '2', name: "三图" },
          { key: '3', name: "大图" },
          { key: '4', name: "视频" },
          { key: '5', name: "橱窗" },
          { key: '6', name: "开屏" },
          { key: '7', name: "横幅" },
        ],
        filterKey: { key: 'material_style', data_type: 'pub_attr_data', name: '样式', 'type': 'singleList' },
        filterResult: {},
        extraOption: {
          columnCount: true
        }
      };
    }

    if (key === '2_1') {
      if (summary_type === 'campaign') {
        itemFilters['status'] = {
          filterType: 'checkboxList',
          filterOption: [
            { name: '有效', key: '2000' },
            { name: '处于暂停时段', key: '2022' },
            { name: '暂停推广', key: '2023' },
            { name: '推广计划预算不足', key: '2024' },
            { name: '账户待激活', key: '2011' },
            { name: '账户预算不足', key: '2025' },
            { name: '账户余额为零', key: '2026' },
            { name: '被禁推', key: '2028' },
            { name: 'app已下线', key: '2029' },
            { name: '已删除', key: '2900' },
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'adgroup') {
        itemFilters['status'] = {
          filterType: 'checkboxList',
          filterOption: [
            { name: '有效', key: '3000' },
            { name: '暂停推广', key: '3032' },
            { name: '推广计划暂停推广', key: '3033' },
            { name: '已删除', key: '3900' },
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'creative') {
        itemFilters['status'] = {
          filterType: 'checkboxList',
          filterOption: [
            { name: '有效', key: '5000' },
            { name: '暂停推广', key: '5052' },
            { name: '审核中', key: '5055' },
            { name: '审核未通过', key: '5901' },
            { name: '已删除', key: '5900' },
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'target') {
        itemFilters['material_style'] = {
          filterType: 'singleList',
          filterOption: [
            { key: '-1', name: "未知" },
            { key: '1', name: "单图" },
            { key: '2', name: "三图" },
            { key: '3', name: "大图" },
            { key: '4', name: "视频" },
            { key: '5', name: "橱窗" },
            { key: '6', name: "开屏" },
            { key: '7', name: "横幅" },
          ],
          filterKey: { key: 'material_style', data_type: 'pub_attr_data', name: '样式', 'type': 'singleList' },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      }
    } else if (key === '2_7') {
      if (summary_type === 'campaign') {
        itemFilters['status'] = {
          filterType: 'checkboxList',
          filterOption: [
            { name: '启用', key: '0' },
            { name: '暂停', key: '1' },
            { name: '删除', key: '2' },
            { name: '所有包含已删除', key: '3' },
            { name: '所有不包含已删除', key: '4' },
            { name: '超出账户日预算', key: '5' }
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'adgroup') {
        itemFilters['status'] = {
          filterType: 'checkboxList',
          filterOption: [
            { name: '投放中', key: '0' },
            { name: '数据错误', key: '1' },
            { name: '计划暂停', key: '2' },
            { name: '新建审核中', key: '3' },
            { name: '修改审核中', key: '4' },
            { name: '已完成', key: '5' },
            { name: '计划新建', key: '6' },
            { name: '审核不通过', key: '7' },
            { name: '账户余额不足', key: '8' },
            { name: '超出预算', key: '9' },
            { name: '未到达投放时间', key: '10' },
            { name: '不在投放时段', key: '11' },
            { name: '已被广告组暂停', key: '12' },
            { name: '广告组超出预算', key: '13' },
            { name: '已删除', key: '14' },
            { name: '已冻结', key: '15' },
            { name: '所有包含已删除', key: '16' },
            { name: '所有不包含已删除', key: '17' },
            { name: '超出账户日预算', key: '18' }
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'creative') {
        itemFilters['status'] = {
          filterType: 'checkboxList',
          filterOption: [
            { name: '投放中', key: '0' },
            { name: '未到达投放时间', key: '1' },
            { name: '不在投放时段', key: '2' },
            { name: '创意暂停', key: '3' },
            {
              name: '已被广告组暂停',
              key: '4'
            },
            {
              name: '广告组超出预算',
              key: '5'
            },
            { name: '新建审核中', key: '6' },
            { name: '修改审核中', key: '7' },
            { name: '已删除', key: '8' },
            { name: '已完成', key: '9' },
            { name: '广告计划暂停', key: '10' },
            { name: '审核不通过', key: '11' },
            { name: '账户余额不足', key: '12' },
            { name: '超出预算', key: '13' },
            { name: '数据错误', key: '14' },
            { name: '预上线', key: '15' },
            { name: '广告计划新建审核中', key: '16' },
            {
              name: '广告计划修改审核中',
              key: '17'
            },
            {
              name: '广告计划审核不通过',
              key: '18'
            },
            { name: '所有包含已删除', key: '19' },
            { name: '所有不包含已删除', key: '20' },
            {
              name: '超出账户日预算',
              key: '21'
            }
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      }
    } else if (key === '2_6') {
      if (summary_type === 'campaign') {
        itemFilters['status'] = {
          filterType: 'checkboxList',
          filterOption: [
            { name: '有效', key: '2000' },
            { name: '已删除', key: '2001' },
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: false
          }
        };
      } else if (summary_type === 'adgroup') {
        itemFilters['status'] = {
          filterType: 'checkboxList',
          filterOption: [
            { name: '正常', key: '3000' },
            { name: '已删除', key: '3001' },
            { name: '待审核', key: '3002' },
            { name: '审核不通过', key: '3003' },
            { name: '封停', key: '3004' },
            { name: '部分审核', key: '3005' },
            { name: '部分有效', key: '3006' },
            { name: '准备中（渠道包在审核中）', key: '3007' },
            { name: '失效（渠道包审核不通过，请更新渠道包）', key: '3008' },
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'creative') {
        itemFilters['status'] = {
          filterType: 'checkboxList',
          filterOption: [
            { name: '有效', key: '6000' },
            { name: '待审核', key: '6001' },
            { name: '审核不通过', key: '6002' },
            { name: '已删除', key: '6003' },
            { name: '部分审核中', key: '6004' },
            { name: '部分有效', key: '6005' },
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      }

    } else if (key === '2_11') {
      if (summary_type === 'campaign') {
        itemFilters['status'] = {
          filterType: 'singleList',
          filterOption: [
            { key: 2000, name: '有效' },
            { key: 2023, name: '已暂停' },
            { key: 2900, name: '已删除' },
            { key: 2902, name: '已归档' },
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '启停状态',
            type: 'singleList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
        itemFilters['effective_status'] = {
          filterType: 'singleList',
          filterOption: [
            { key: 2000, name: '有效' },
            { key: 2023, name: '已暂停' },
            { key: 2900, name: '已删除' },
            { key: 2902, name: '已归档' },
            { key: 2903, name: '创建中' },
            { key: 2904, name: '异常问题' },
          ],
          filterKey: {
            key: 'effective_status',
            data_type: 'pub_attr_data',
            name: '推广状态',
            type: 'singleList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'adgroup') {
        itemFilters['status'] = {
          filterType: 'singleList',
          filterOption: [
            { key: 3000, name: '有效' },
            { key: 3032, name: '已暂停' },
            { key: 3900, name: '已删除' },
            { key: 3903, name: '已归档' },
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '启停状态',
            type: 'singleList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
        itemFilters['effective_status'] = {
          filterType: 'singleList',
          filterOption: [
            { key: 3032, name: '已暂停' },
            { key: 3033, name: '推广计划已暂停' },
            { key: 3900, name: '已删除' },
            { key: 3903, name: '已归档' },
            { key: 3904, name: '创建中' },
            { key: 3905, name: '异常问题' },
          ],
          filterKey: {
            key: 'effective_status',
            data_type: 'pub_attr_data',
            name: '推广状态',
            type: 'singleList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'creative') {
        itemFilters['status'] = {
          filterType: 'singleList',
          filterOption: [
            { key: 5000, name: '有效' },
            { key: 5052, name: '已暂停' },
            { key: 5900, name: '已删除' },
            { key: 5905, name: '已归档' },
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '启停状态',
            type: 'singleList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
        itemFilters['effective_status'] = {
          filterType: 'singleList',
          filterOption: [
            { key: 5000, name: '有效' },
            { key: 5052, name: '已暂停' },
            { key: 5058, name: '待审核' },
            { key: 5059, name: '预先批准' },
            { key: 5900, name: '已删除' },
            { key: 5901, name: '审核不通过' },
            { key: 5912, name: '待处理帐单信息' },
            { key: 5913, name: '推广计划已暂停' },
            { key: 5914, name: '推广单元已暂停' },
            { key: 5915, name: '已归档' },
            { key: 5916, name: '创建中' },
            { key: 5917, name: '异常问题' },
          ],
          filterKey: {
            key: 'effective_status',
            data_type: 'pub_attr_data',
            name: '推广状态',
            type: 'singleList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      }
    } else if (key === '2_16') {
      if (summary_type === 'campaign') {
        itemFilters['status'] = {
          filterType: 'singleList',
          filterOption: [
            { key: 2000, name: '有效' },
            { key: 2012, name: '计划超预算' },
            { key: 2023, name: '已暂停' },
            { key: 2025, name: '余额不足' },
            { key: 2031, name: '不限' },
            { key: 2900, name: '已删除' },
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'adgroup') {
        itemFilters['status'] = {
          filterType: 'singleList',
          filterOption: [
            { key: 3000, name: "有效" },
            { key: 3032, name: "已暂停" },
            { key: 3033, name: "计划已暂停" },
            { key: 3034, name: "余额不足" },
            { key: 3035, name: "审核中" },
            { key: 3036, name: "审核未通过" },
            { key: 3037, name: "已结束" },
            { key: 3038, name: "计划超预算" },
            { key: 3039, name: "未达投放时间" },
            { key: 3040, name: "不限" },
            { key: 3900, name: "已删除" },
            { key: 3902, name: "组超预算" },
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'creative') {
        itemFilters['status'] = {
          filterType: 'singleList',
          filterOption: [
            { key: 5000, name: "投放中" },
            { key: 5052, name: "已暂停" },
            { key: 5055, name: "审核中" },
            { key: 5059, name: "不限" },
            { key: 5060, name: "计划已暂停" },
            { key: 5061, name: "计划超预算" },
            { key: 5062, name: "余额不足" },
            { key: 5063, name: "组审核中" },
            { key: 5064, name: "组审核未通过" },
            { key: 5065, name: "组已暂停" },
            { key: 5066, name: "组超预算" },
            { key: 5067, name: "未达投放时间" },
            { key: 5068, name: "视频审核通过可投放滑滑场景" },
            { key: 5069, name: "部分素材审核失败" },
            { key: 5070, name: "已结束" },
            { key: 5071, name: "已删除" },
            { key: 5901, name: "审核未通过" },
            { key: 5904, name: "作品异常" },
          ],
          filterKey: {
            key: 'status',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      }
    } else if (key === '2_17') {
      if (summary_type === 'adgroup') {
        itemFilters['state'] = {
          filterType: 'singleList',
          filterOption: [
            { key: 3000, name: '推广中' },
            { key: 3024, name: '推广计划预算不足' },
            { key: 3031, name: '不在推广周期' },
            { key: 3032, name: '推广暂停' },
            { key: 3034, name: '预算即将不足' },
          ],
          filterKey: {
            key: 'state',
            data_type: 'pub_attr_data',
            name: '推广状态',
            type: 'singleList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'creative') {
        itemFilters['state'] = {
          filterType: 'singleList',
          filterOption: [
            { key: 5000, name: '推广中' },
            { key: 5024, name: '预算不足' },
            { key: 5031, name: '不在推广周期中' },
            { key: 5034, name: '预算即将不足' },
            { key: 5052, name: '推广暂停' },
            { key: 5055, name: '审核中' },
            { key: 5901, name: '审核拒绝' },
            { key: 5903, name: '样式下线' },
          ],
          filterKey: {
            key: 'state',
            data_type: 'pub_attr_data',
            name: '推广状态',
            type: 'singleList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      }
    } else if (key === '3_19') {
      itemFilters['status'] = {
        filterType: 'checkboxList',
        filterOption: [
          { name: '已删除', key: '1' },
          { name: '未删除', key: '0' },
        ],
        filterKey: { key: 'status', data_type: 'pub_attr_data', name: '删除状态', 'type': 'checkboxList' },
        filterResult: {},
        extraOption: {
          columnCount: true
        }
      };
    } else if (key === '2_24') {
      if (summary_type === 'campaign') {
        itemFilters['filter_state'] = {
          filterType: 'checkboxList',
          filterOption: [
            { "key": "1", "name": "有效" },
            { "key": "2", "name": "暂停" },
            { "key": "4", "name": "计划预算不足" },
            { "key": "7", "name": "账户日预算不足" },
            { "key": "5", "name": "现金余额不足" },
            { "key": "3", "name": "已删除" },
            { "key": "6", "name": "所有未删除状态" }
          ],
          filterKey: {
            key: 'filter_state',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'adgroup') {
        itemFilters['filter_state'] = {
          filterType: 'checkboxList',
          filterOption: [
            { "key": "10", "name": "有效" },
            { "key": "4", "name": "暂停" },
            { "key": "2", "name": "未开始" },
            { "key": "3", "name": "已结束" },
            { "key": "5", "name": "处于暂停时段" },
            { "key": "6", "name": "已被计划暂停" },
            { "key": "8", "name": "计划预算不足" },
            { "key": "11", "name": " 账户日预算不足" },
            { "key": "7", "name": "现金余额不足" },
            { "key": "1", "name": "已删除" },
            { "key": "9", "name": "所有未删除状态" }
          ],
          filterKey: {
            key: 'filter_state',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'creative') {
        itemFilters['filter_state'] = {
          filterType: 'checkboxList',
          filterOption: [
            { "key": "3", "name": "暂停" },
            { "key": "7", "name": "审核中" },
            { "key": "6", "name": "审核拒绝" },
            { "key": "9", "name": "商品状态异常" },
            { "key": "4", "name": "已被单元暂停" },
            { "key": "10", "name": "单元未开始" },
            { "key": "11", "name": "单元已结束" },
            { "key": "12", "name": "单元处于暂停时段" },
            { "key": "5", "name": "已被计划暂停" },
            { "key": "13", "name": "计划预算不足" },
            { "key": "16", "name": "账户日预算不足" },
            { "key": "14", "name": "现金余额不足" },
            { "key": "1", "name": "已删除" },
            { "key": "2", "name": "所有未删除状态" },
            { "key": "17", "name": "审核通过（私密）" }
          ],
          filterKey: {
            key: 'filter_state',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      } else if (summary_type === 'keyword') {
        itemFilters['filter_state'] = {
          filterType: 'checkboxList',
          filterOption: [
            { "key": "8", "name": "有效" },
            { "key": "3", "name": "暂停" },
            { "key": "4", "name": "已被单元暂停" },
            { "key": "9", "name": "单元未开始" },
            { "key": "10", "name": "单元已结束" },
            { "key": "11", "name": "单元处于暂停时段" },
            { "key": "5", "name": "已被计划暂停" },
            { "key": "7", "name": "计划预算不足" },
            { "key": "12", "name": " 账户日预算不足" },
            { "key": "6", "name": "现金余额不足" },
            { "key": "2", "name": "已删除" },
            { "key": "1", "name": "所有未删除状态" }
          ],
          filterKey: {
            key: 'filter_state',
            data_type: 'pub_attr_data',
            name: '状态',
            type: 'checkboxList'
          },
          filterResult: {},
          extraOption: {
            columnCount: true
          }
        };
      }
    }

    const conversionData = this.getConversionData().map(
      item => {
        itemFilters[item['key']] = {
          filterType: 'numberFilter',
          filterOption: [],
          filterKey: { key: item['key'], data_type: 'conversion_data', name: item['name'], 'type': 'numberFilter' },
          filterResult: {},
          extraOption: {
            columnCount: false
          }
        };
      }
    );
    const customMetricData = this.getMetricsData().map(
      item => {
        itemFilters[item['key']] = {
          filterType: 'numberFilter',
          filterOption: [],
          filterKey: { key: item['key'], data_type: 'metric_data', name: item['name'], 'type': 'numberFilter' },
          filterResult: {},
          extraOption: {
            columnCount: false
          }
        };
      }
    );
    const dimData = this.getDimData().map(
      item => {
        itemFilters[item['key']] = {
          filterType: 'multiValue',
          filterOption: [],
          filterKey: { key: item['key'], data_type: 'dim_data', name: item['name'], 'type': 'multiValue' },
          filterResult: {},
          extraOption: {
            columnCount: false
          }
        };
      }
    );

    const bizUnitData = this.getBizUnitData().map(
      (item, index) => {

        itemFilters[item['key'] + '_name'] = {
          filterType: 'multiValue',
          filterOption: [],
          filterKey: { key: item['key'] + '_name', data_type: 'pub_lock_data', name: item['name'], 'type': 'multiValue' },
          filterResult: {},
          extraOption: {
            columnCount: false
          }
        };
      }
    );

    itemFilters['province_region_name'] = {
      filterType: 'singleList',
      filterOption: this.getProvinceList(),

      filterKey: {
        key: 'province_region',
        data_type: 'pub_lock_data',
        name: '省级地域',
        'type': 'singleList',
        relishKey: 'province_region_name'
      },

      filterResult: {},
      extraOption: {
        columnCount: false
      }
    };

    itemFilters['province_region'] = {
      filterType: 'singleList',
      filterOption: this.getProvinceList(),

      filterKey: {
        key: 'province_region',
        data_type: 'pub_lock_data',
        name: '省级地域',
        'type': 'singleList',
        relishKey: 'province_region_name'
      },

      filterResult: {},
      extraOption: {
        columnCount: false
      }
    };

    if (itemFilters['province_id']) {
      itemFilters['province_id']['filterOption'] = this.getProvinceList();
    }
    itemFilters['province'] = {
      filterType: 'singleList',
      filterOption: this.getProvinceList(),

      filterKey: {
        key: 'province_id',
        data_type: 'pub_lock_data',
        name: '省级地域',
        'type': 'singleList',
        relishKey: 'province_region'
      },

      filterResult: {},
      extraOption: {
        columnCount: false
      }
    }

    if (itemFilters['city_id']) {
      itemFilters['city_id']['filterOption'] = this.getCityList();
    }
    itemFilters['city_region_name'] = {
      filterType: 'singleList',
      filterOption: this.getCityList(),
      filterKey: {
        key: 'city_region',
        data_type: 'pub_lock_data',
        name: '市级地域',
        'type': 'singleList',
        relishKey: 'city_region_name'
      },

      filterResult: {},
      extraOption: {
        columnCount: false
      }
    };

    itemFilters['city_region'] = {
      filterType: 'singleList',
      filterOption: this.getCityList(),
      filterKey: {
        key: 'city_region',
        data_type: 'pub_lock_data',
        name: '市级地域',
        'type': 'singleList',
        relishKey: 'city_region_name'
      },

      filterResult: {},
      extraOption: {
        columnCount: false
      }
    };
    itemFilters['city'] = {
      filterType: 'singleList',
      filterOption: this.getCityList(),
      filterKey: {
        key: 'city_id',
        data_type: 'pub_lock_data',
        name: '市级地域',
        'type': 'singleList',
        relishKey: 'city_region'
      },

      filterResult: {},
      extraOption: {
        columnCount: false
      }
    };
    itemFilters['user_name'] = {
      filterType: 'singleList',
      filterOption: this.getResponsibleList(),
      filterKey: { key: 'user_name', data_type: 'pub_lock_data', name: '负责人', 'type': 'singleList' },

      filterResult: {},
      extraOption: {
        columnCount: false
      }
    };
    if (itemFilters['hours']) {
      itemFilters['hours']['filterOption'] = [
        { "key": 0, "name": 0 },
        { "key": 1, "name": 1 },
        { "key": 2, "name": 2 },
        { "key": 3, "name": 3 },
        { "key": 4, "name": 4 },
        { "key": 5, "name": 5 },
        { "key": 6, "name": 6 },
        { "key": 7, "name": 7 },
        { "key": 8, "name": 8 },
        { "key": 9, "name": 9 },
        { "key": 10, "name": 10 },
        { "key": 11, "name": 11 },
        { "key": 12, "name": 12 },
        { "key": 13, "name": 13 },
        { "key": 14, "name": 14 },
        { "key": 15, "name": 15 },
        { "key": 16, "name": 16 },
        { "key": 17, "name": 17 },
        { "key": 18, "name": 18 },
        { "key": 19, "name": 19 },
        { "key": 20, "name": 20 },
        { "key": 21, "name": 21 },
        { "key": 22, "name": 22 },
        { "key": 23, "name": 23 }
      ]
    }
    return itemFilters;
  }


  public getItemSemFilterType(summary_type) {
    this.defaultSemItemFilters = JSON.parse(JSON.stringify(this.tableItemDatasService.defaultItemFilters['defaultSemItemFilters']));

    let itemFilters = {};
    itemFilters = Object.assign(itemFilters, this.defaultSemItemFilters);
    itemFilters["publisher"]["filterOption"] = this.publisherNewList;
    itemFilters["publisher_id"]["filterOption"] = this.publisherNewList;
    itemFilters["channel"]["filterOption"] = this.channelList;
    itemFilters["channel_id"]["filterOption"] = this.channelList;

    // 数据归属渠道
    itemFilters["attribution_channel"] = {
      "filterType": "multiList",
      "filterOption": this.channelList,
      "filterKey": {
        "key": "attribution_channel",
        "data_type": "pub_attr_data",
        "name": "数据归属渠道",
        "type": "multiList",
        "relishKey": "attribution_channel_name"
      },
      "filterResult": [],
    };
    itemFilters["attribution_channel_name"] = deepCopy(itemFilters["attribution_channel"]);

    // 数据归属媒体
    itemFilters["attribution_publisher"] = {
      "filterType": "multiList",
      "filterOption": this.publisherNewList,
      "filterKey": {
        "key": "attribution_publisher",
        "data_type": "pub_attr_data",
        "name": "数据归属媒体",
        "type": "multiList",
        "relishKey": "attribution_publisher_name"
      },
      "filterResult": [],
    }
    itemFilters["attribution_publisher_name"] = deepCopy(itemFilters["attribution_publisher"]);

    if (summary_type !== 'conversion_report_sem') {
      itemFilters['data_hour']['filterKey']['data_type'] = 'pub_lock_data';
    }

    if (summary_type === 'campaign') {
      itemFilters['status'] = {
        filterType: 'checkboxList',
        filterOption: [
          { name: '有效', key: '2000' },
          { name: '处于暂停时段', key: '2022' },
          { name: '暂停推广', key: '2023' },
          { name: '推广计划预算不足', key: '2024' },
          { name: '账户预算不足', key: '2025' },
          { name: '已删除', key: '2900' }
        ],
        filterKey: { key: 'status', data_type: 'pub_attr_data', name: '状态', 'type': 'checkboxList' },
        filterResult: {},
        extraOption: {
          columnCount: true
        }
      };
    } else if (summary_type === 'adgroup') {
      itemFilters['status'] = {
        filterType: 'checkboxList',
        filterOption: [
          { name: '有效', key: '3000' },
          { name: '暂停推广', key: '3032' },
          { name: '已删除', key: '3900' }
        ],
        filterKey: { key: 'status', data_type: 'pub_attr_data', name: '状态', 'type': 'checkboxList' },
        filterResult: {},
        extraOption: {
          columnCount: true
        }
      };
    } else if (summary_type === 'keyword') {
      itemFilters['status'] = {
        filterType: 'checkboxList',
        filterOption: [
          { name: '有效', key: '4000' },
          { name: '有效-­‐移动url审核中', key: '4001' },
          { name: '暂停推广', key: '4042' },
          { name: '不宜推广', key: '4043' },
          { name: '搜索无效', key: '4044' },
          { name: '待激活', key: '4045' },
          { name: '审核中', key: '4046' },
          { name: '审核未通过', key: '4901' },
          { name: '搜索量过低', key: '4047' },
          { name: '部分无效', key: '4048' },
          { name: '计算机搜索无效', key: '4049' },
          { name: '移动搜索无效', key: '4050' },
          { name: '已删除', key: '4900' }
        ],
        filterKey: { key: 'status', data_type: 'pub_attr_data', name: '状态', 'type': 'checkboxList' },
        filterResult: {},
        extraOption: {
          columnCount: true
        }
      };
    } else if (summary_type === 'creative') {
      itemFilters['status'] = {
        filterType: 'checkboxList',
        filterOption: [
          { name: '有效', key: '5000' },
          { name: '暂停推广', key: '5052' },
          { name: '不宜推广', key: '5053' },
          { name: '待激活', key: '5054' },
          { name: '审核中', key: '5055' },
          { name: '部分无效', key: '5056' },
          { name: '有效-­‐移动url审核中', key: '5057' },
          { name: '审核未通过', key: '5901' },
          { name: '创意参数错误', key: '5902' },
          { name: '已删除', key: '5900' }
        ],
        filterKey: { key: 'status', data_type: 'pub_attr_data', name: '状态', 'type': 'checkboxList' },
        filterResult: {},
        extraOption: {
          columnCount: true
        }
      };
      itemFilters['status_temp'] = {
        filterType: 'checkboxList',
        filterOption: [
          { name: '暂停推广', key: '5052' },
          { name: '不宜推广', key: '5053' },
          { name: '待激活', key: '5054' },
          { name: '审核中', key: '5055' },
          { name: '部分无效', key: '5056' },
          { name: '有效-­‐移动url审核中', key: '5057' },
          { name: '审核未通过', key: '5901' },
          { name: '创意参数错误', key: '5902' },
        ],
        filterKey: { key: 'status_temp', data_type: 'pub_attr_data', name: '影子创意状态', 'type': 'checkboxList' },
        filterResult: {},
        extraOption: {
          columnCount: true
        }
      };
      itemFilters['has_temp'] = {
        filterType: 'singleList',
        filterOption: [{ key: 0, name: '无' }, { key: 1, name: '有' }],
        filterKey: { key: 'has_temp', data_type: 'pub_attr_data', name: '有无影子创意', 'type': 'singleList' },
        filterResult: {},
        extraOption: {
          columnCount: false
        }
      };

    } else if (summary_type === 'optimization_detail_effect ') {
      itemFilters['status'] = {
        filterType: 'checkboxList',
        filterOption: [
          { name: '有效', key: '2000' },
          { name: '处于暂停时段', key: '2022' },
          { name: '暂停推广', key: '2023' },
          { name: '推广计划预算不足', key: '2024' },
          { name: '已删除', key: '2900' }
        ],
        filterKey: { key: 'status', data_type: 'pub_attr_data', name: '状态', 'type': 'checkboxList' },
        filterResult: {},
        extraOption: {
          columnCount: true
        }
      };
    } else if (summary_type === 'optimization_detail_ranking') {
      itemFilters['status'] = {
        filterType: 'checkboxList',
        filterOption: [
          { name: '有效', key: '4000' },
          { name: '有效-­‐移动url审核中', key: '4001' },
          { name: '暂停推广', key: '4042' },
          { name: '不宜推广', key: '4043' },
          { name: '搜索无效', key: '4044' },
          { name: '待激活', key: '4045' },
          { name: '审核中', key: '4046' },
          { name: '审核未通过', key: '4901' },
          { name: '搜索量过低', key: '4047' },
          { name: '部分无效', key: '4048' },
          { name: '计算机搜索无效', key: '4049' },
          { name: '移动搜索无效', key: '4050' },
          { name: '已删除', key: '4900' }
        ],
        filterKey: { key: 'status', data_type: 'pub_attr_data', name: '状态', 'type': 'checkboxList' },
        filterResult: {},
        extraOption: {
          columnCount: true
        }
      };
    } else if (summary_type === 'optimization_detail_effect_kwd') {
      itemFilters['status'] = {
        filterType: 'checkboxList',
        filterOption: [
          { name: '有效', key: '4000' },
          { name: '有效-­‐移动url审核中', key: '4001' },
          { name: '暂停推广', key: '4042' },
          { name: '不宜推广', key: '4043' },
          { name: '搜索无效', key: '4044' },
          { name: '待激活', key: '4045' },
          { name: '审核中', key: '4046' },
          { name: '审核未通过', key: '4901' },
          { name: '搜索量过低', key: '4047' },
          { name: '部分无效', key: '4048' },
          { name: '计算机搜索无效', key: '4049' },
          { name: '移动搜索无效', key: '4050' },
          { name: '无效关键词', key: '4900' }
        ],
        filterKey: { key: 'status', data_type: 'pub_attr_data', name: '状态', 'type': 'checkboxList' },
        filterResult: {},
        extraOption: {
          columnCount: true
        }
      };
    } else if (summary_type === 'creative_fengwu_360') {
      itemFilters['status'] = {
        filterType: 'checkboxList',
        filterOption: [
          { "key": "10000", "name": "有效/审核通过" },
          { "key": "10001", "name": "已暂停" },
          { "key": "10002", "name": "待审核-审核中" },
          { "key": "10003", "name": "审核拒绝-未通过审核 " },
          { "key": "10004", "name": "修改待审核" },
          { "key": "10900", "name": "无效凤舞" },
        ],
        filterKey: { key: 'status', data_type: 'pub_attr_data', name: '状态', 'type': 'checkboxList' },
        filterResult: {},
        extraOption: {
          columnCount: true
        }
      };
    }

    const conversionData = this.getConversionData().map(
      item => {
        itemFilters[item['key']] = {
          filterType: 'numberFilter',
          filterOption: [],
          filterKey: { key: item['key'], data_type: 'conversion_data', name: item['name'], 'type': 'numberFilter' },
          filterResult: {},
          extraOption: {
            columnCount: false
          }
        };
      }
    );
    const customMetricData = this.getMetricsData().map(
      item => {
        itemFilters[item['key']] = {
          filterType: 'numberFilter',
          filterOption: [],
          filterKey: { key: item['key'], data_type: 'metric_data', name: item['name'], 'type': 'numberFilter' },
          filterResult: {},
          extraOption: {
            columnCount: false
          }
        };
      }
    );

    const dimData = this.getDimData().map(
      item => {
        itemFilters[item['key']] = {
          filterType: 'multiValue',
          filterOption: [],
          filterKey: { key: item['key'], data_type: 'dim_data', name: item['name'], 'type': 'multiValue' },
          filterResult: {},
          extraOption: {
            columnCount: false
          }
        };
      }
    );

    const bizUnitData = this.getBizUnitData().map(
      (item, index) => {

        itemFilters[item['key'] + '_name'] = {
          filterType: 'multiValue',
          filterOption: [],
          filterKey: { key: item['key'] + '_name', data_type: 'pub_lock_data', name: item['name'], 'type': 'multiValue' },
          filterResult: {},
          extraOption: {
            columnCount: false
          }
        };
      }
    );
    itemFilters['province_region_name'] = {
      filterType: 'singleList',
      filterOption: this.getProvinceList(),

      filterKey: {
        key: 'province_region',
        data_type: 'pub_lock_data',
        name: '省级地域',
        'type': 'singleList',
        relishKey: 'province_region_name'
      },

      filterResult: {},
      extraOption: {
        columnCount: false
      }
    };
    itemFilters['province_region'] = {
      filterType: 'singleList',
      filterOption: this.getProvinceList(),

      filterKey: {
        key: 'province_region',
        data_type: 'pub_lock_data',
        name: '省级地域',
        'type': 'singleList',
        relishKey: 'province_region_name'
      },

      filterResult: {},
      extraOption: {
        columnCount: false
      }
    };

    itemFilters['city_region_name'] = {
      filterType: 'singleList',
      filterOption: this.getCityList(),
      filterKey: {
        key: 'city_region',
        data_type: 'pub_lock_data',
        name: '市级地域',
        'type': 'singleList',
        relishKey: 'city_region_name'
      },

      filterResult: {},
      extraOption: {
        columnCount: false
      }
    };

    itemFilters['city_region'] = {
      filterType: 'singleList',
      filterOption: this.getCityList(),
      filterKey: {
        key: 'city_region',
        data_type: 'pub_lock_data',
        name: '市级地域',
        'type': 'singleList',
        relishKey: 'city_region_name'
      },

      filterResult: {},
      extraOption: {
        columnCount: false
      }
    };
    if (itemFilters['province_id']) {
      itemFilters['province_id']['filterOption'] = this.getProvinceList();
    }
    if (itemFilters['city_id']) {
      itemFilters['city_id']['filterOption'] = this.getCityList();
    }

    itemFilters['user_name'] = {
      filterType: 'singleList',
      filterOption: this.getResponsibleList(),
      filterKey: { key: 'user_name', data_type: 'pub_lock_data', name: '负责人', 'type': 'singleList' },

      filterResult: {},
      extraOption: {
        columnCount: false
      }
    };

    return itemFilters;
  }

  getTableCellWidth(name) {
    const width = name.length * 12 + 48 + 12 < 112 ? 112 : name.length * 12 + 48 + 12;
    return width;
  }

  getInitCustomFeedData() {
    let _initAllPubData = [];
    const tableItemFeedData = this.tableItemDatasService.tableItemFeedData;
    const _pubDate = JSON.parse(JSON.stringify(tableItemFeedData['pubDate']));
    const _pubDataDefault = JSON.parse(JSON.stringify(tableItemFeedData['pubDataDefault']));
    const key = this.menuService.currentChannelId + '_' + this.menuService.currentPublisherId;

    if (_pubDate.hasOwnProperty(key)) {
      _initAllPubData = _pubDate[key].map(x => Object.assign({}, x));
    }
    _initAllPubData = [..._initAllPubData, ..._pubDataDefault];

    this.getConversionData().map(
      item => {
        const width = this.getTableCellWidth(item.name);
        _initAllPubData.push(Object.assign({ data_type: 'conversion_data', 'type': 'numberFilter' }, item, { width }));
      }
    );
    this.getMetricsData().map(
      item => {
        const width = this.getTableCellWidth(item.name);
        _initAllPubData.push(Object.assign({ data_type: 'metric_data', 'type': 'numberFilter' }, item, { width }));
      }
    );

    const tableItemLists = this.tableItemLists;

    if (key === '2_6') {
      const gdtData = tableItemLists['2_6'].map(
        item => {
          const width = this.getTableCellWidth(item.name);
          _initAllPubData.push(Object.assign({ data_type: item.data_type, 'type': 'numberFilter', 'notReportType': ['target_report'] }, item, { width }));
        }
      );
      const gdtTargetData = tableItemLists['2_6_target'].map(item => {
        const width = this.getTableCellWidth(item.name);
        _initAllPubData.push(Object.assign({ data_type: item.data_type, 'type': 'numberFilter', 'reportType': ['target_report'] }, item, { width }));
      });
    } else if (key === '2_7') {
      const bytedanceData = tableItemLists['2_7'].map(
        item => {
          const width = this.getTableCellWidth(item.name);
          _initAllPubData.push(Object.assign({ data_type: item.data_type, 'type': 'numberFilter' }, { not_show_summaryType: ['materials_video', 'materials_video_label'] }, item, { width },));
        }
      );
      const bytedanceTargetData = tableItemLists['2_7_target'].map(item => {
        const width = this.getTableCellWidth(item.name);
        _initAllPubData.push(Object.assign({ data_type: item.data_type, 'type': 'numberFilter' }, item, { width }));
      });
    } else {
      if (tableItemLists[key]) {
        tableItemLists[key].map(
          item => {
            const width = this.getTableCellWidth(item.name);
            _initAllPubData.push(Object.assign({ data_type: item.data_type, 'type': 'numberFilter' }, item, { width }));
          }
        );
      }
    }
    const dimData = this.getDimData().map(
      item => {
        // this._initAllPubData.push(Object.assign({data_type: 'dim_data', 'type': 'multiValue', summaryType: ['keyword', 'optimization_detail_ranking'], conditionType: ['keyword']}, item, {width: 112}));
      }
    );
    const dataLockList = [];
    const bizUnitData = this.getBizUnitData().map(
      (item, index) => {
        dataLockList.push(Object.assign({ data_type: 'pub_lock_data', name: item.name, key: item.key + '_name', 'type': 'string', summaryType: ['biz_unit_campaign', 'biz_unit_adgroup', 'biz_unit_account_hours', 'biz_unit_keyword', 'biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region'], has_least: ['biz_unit_account', 'biz_unit_account_hours', 'biz_unit_account_region'] }, { width: 120 })); //has_least:至少选择1个
      }
    );
    _initAllPubData.splice(1, 0, ...dataLockList);

    const tipMap = {};
    _initAllPubData.forEach(item => {
      if (item['remarks']) {
        tipMap[item['key']] = item['remarks'];
      }
    });

    return { _initAllPubData, tipMap }
  }

}
