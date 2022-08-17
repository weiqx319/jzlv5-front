import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DataViewAddEditService } from "../../service/data-view-add-edit.service";
import { isNumber } from "@jzl/jzl-util";
import { RegionListService } from "../../../dashboard/service/region-list.service";
import { DataViewOptimizationService } from "../../service/data-view-optimization.service";
import { differenceInCalendarDays, parseISO } from "date-fns";

@Component({
  selector: 'app-edit-optimization',
  templateUrl: './edit-optimization.component.html',
  styleUrls: ['./edit-optimization.component.scss']
})
export class EditOptimizationComponent implements OnInit, OnChanges {

  @Input() idsArray: any;
  @Input() publisher_model: any;
  @Input() parentData: any;
  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();
  @Output() is_adjustment_words: EventEmitter<any> = new EventEmitter<any>();


  constructor(private _http: DataViewAddEditService,
    private optimizationService: DataViewOptimizationService,
    private regionList: RegionListService,
    private message: NzMessageService) {
    this.publisherOption = this._http.getPublisherOption();
  }
  today = new Date();
  public publisherOption = {};
  public dimensionsData = [];
  public showSingleKeywordData = {};
  public campaignInfo = {};
  public groupData = {};
  public accountInfo = {};
  public iswraing = false;
  public provinceList = [];
  public cityList = [];
  public optimization_group_model = [];
  public deviceArray = []; //设备数组
  public ranking = []; //ranking数组
  public tishi = '';
  private constraintData = []; //多个约束条件的数组
  public rank_option = {
    "pc": [
      { id: 1001, name: "左1" },
      { id: 1002, name: "左2" },
      { id: 1003, name: "左3" },
      { id: 1004, name: "左4" },
      { id: 1005, name: "左5" }
    ],
    "wap": [
      { id: 3001, name: "上1" },
      { id: 3002, name: "上2" },
      { id: 3003, name: "上3" },
      { id: 4001, name: "下1" },
      { id: 4002, name: "下2" },
      { id: 4003, name: "下3" }
    ]
  };
  public stable_rankings = [
    { "name": '不加价', "value": '不加价' },
    { "name": '固定加价', "value": '固定加价' },
    { "name": '比例加价', "value": '比例加价' },
  ]; //加价稳定排名

  public optimizationGoal = [
    { 'value': 1, 'name': '利润最大化' },
    { 'value': 2, 'name': '转化量最大化' },
    { 'value': 3, 'name': '收益最大化' },
    { 'value': 4, 'name': '点击数最大化' },
  ];
  public condition = {
    1: [{ 'value': 1, 'name': '无' }],
    2: [{ 'value': 2, 'name': '消费不高于' }, { 'value': 3, 'name': 'CPA不超过' }],
    3: [{ 'value': 4, 'name': 'ROI不低于' }, { 'value': 2, 'name': '消费不高于' }],
    4: [{ 'value': 2, 'name': '消费不高于' }],
  };

  public templateList = [];
  public optimizationData = {
    template: null,
    "publisher_id": null,
    'optimization_method': 1, //1，排名优化 2，效果优化
    'target_condition_setting': {
      'is_edit': false,
      'optimization_target': 1, //优化目标
      'constraint_condition': {
        'condition_key': 1 //约束条件select
        /*'condition_value': 1 // 约束条件input*/
      }
    },
    'price_step_setting': {
      'is_edit': false,
    },

    "optimization_group": {
      "action": 2, //1，加入优化组   2，新建优化组
      /*"optimization_group_id" : 2 , //优化组id*/
      "optimization_group_name": '', //优化组名称
      "is_skip": 1, //是否迁移 0，迁移 1，跳过
    },
    "adjustment_words_type": {
      "is_edit": false,
      "action": 2, //1，单次  2，循环
    },
    "start_time": "",
    "end_time": "",
    "interval_word": 30, //调词间隔
    /*  "province" : "", // 竞价地域省
      "city" : "", // 竞价地域市*/
    'ranking_region_default': true,
    "running_grade": 2, // 运行等级 1，低 2，中 3，高
    "constraint_condition_sigle": {
      "price_type": 2, //出价范围
      "device": "pc", //设备
      "ranking_left": 1001,
      "ranking_right": 1005,
      'device_os': 1,
      "price_rate_min": 0.8, //倍数小
      "price_rate_max": 1.3, //倍数大
      /*
      "price_rate_min": 0 , //倍数小
      "price_rate_max": 0 , //倍数大
      "price_rate_max_abs": "", //不超过price
      "price_left": 0,  //价格小
      "price_right": 0 //价格大*/
    }, //约束条件
    "constraint_condition_loop": [], //约束条件
    'optimization_setting_is_edit': false,
    "optimization_setting": {
      "high_price_no_rank": {
        "value": 2 //最高限未达标   1,回到原价  2，保留最优排名
      },
      "prior_type": {
        "value": 1 //优先方式   1,价格优先  2，排名优先
      },
      "end": {
        "value": 1 // 1，恢复原价  2,不回复原价
      },
      "stable_rankings": {
        'option': "不加价",
        "fixed_price_increase": '', //固定加价
        "proportional_price_increase": '' //比例加价
      },
      "restore_init_price_low_ratio": {
        "is_avaliable": false,
        /* 'value': '',*/
      },
      "restore_init_price_high_ratio": {
        "is_avaliable": false,
        /* 'value': '',*/
      },
    }, //高级设置
  };
  ngOnInit() {
    if (this.parentData.selected_data.length === 1) {
      switch (this.summaryType) {
        case 'keyword':
          this._showSingleKeyword();
          break;
        case 'campaign':
          this._showCampaign();
          break;
        case 'adgroup':
          this._showAdgroup();
          break;
        case 'account':
          this._showAccount();
          break;
      }
    }

    this.setDataViewList();
    this.setRegion();
    this.getTplByPublisherId(this.optimizationData['publisher_id']);

  }
  disabledDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.today) < 0;
  }

  changeTpl(data) {
    data['tpl_setting']['ranking_model'] * 1 === 1 ? this.optimizationData.adjustment_words_type.action = 1 : this.optimizationData.adjustment_words_type.action = 2;

    this.optimizationData['province'] = data['tpl_setting']['ranking_region']['province'];
    this.optimizationData['city'] = data['tpl_setting']['ranking_region']['city'];
    this.optimizationData.ranking_region_default = data['tpl_setting']['ranking_region_default'];
    this.optimizationData.running_grade = data['tpl_setting']['ranking_priority'];
    this.optimizationData.interval_word = data['tpl_setting']['ranking_interval'];
    this.changeProvince(this.optimizationData['province'], true);

    if (this.optimizationData.adjustment_words_type.action * 1 === 2) { //循环

      this.optimizationData['constraint_condition_loop'] = [];
      this.optimizationData['constraint_condition_loop'] = data['tpl_setting']['data'];

    } else if (this.optimizationData.adjustment_words_type.action * 1 === 1) { //单次

      const show_data = { ...data['tpl_setting']['data'][0] };
      if (data['tpl_setting']['data'][0]['price_rate_min'] * 1 === 0 || data['tpl_setting']['data'][0]['price_rate_max'] * 1 === 0 || data['tpl_setting']['data'][0]['rate_max_price'] * 1 === 0) {
        show_data['price_rate_min'] = 0.8;
        show_data['price_rate_max'] = 1.3;
        show_data['price_rate_max_abs'] = '';
      }
      this.optimizationData['constraint_condition_sigle'] = show_data;
      this.ranking = this.rank_option[show_data['device']];

    }
    this.optimizationData.adjustment_words_type.is_edit = true;
    this.chengeAdjustmentWords(true);
  }
  getTplByPublisherId(publisherId) {
    this.optimizationService.getRankTplListBtPublisherId(publisherId).subscribe(
      (result) => {
        this.templateList = result.data;
        this.optimizationData.template = null;

      }
    );

  }


  //根据媒体得到地域列表
  setRegion() {
    this.provinceList = [];
    if (this.optimizationData['publisher_id']) {
      const provinceArray = JSON.parse(JSON.stringify(this.regionList.getOptimiztionRegionLists()));
      provinceArray.forEach(item => {
        if (item['publisher'] && item['publisher'].indexOf(this.optimizationData['publisher_id'] * 1) === -1) {
          return false;
        }
        this.provinceList.push(item);
      });

    } else {
      this.provinceList = JSON.parse(JSON.stringify(this.regionList.getOptimiztionRegionLists()));
    }

    this.provinceList.splice(0, 0, {
      'name': '请选择省',
      'code': '',
      'sub': []
    });
  }

  setDataViewList() {
    //初始化日期
    this.optimizationData.start_time = this.getNowTime();
    this.optimizationData.end_time = this.getNowTime(6);

    if (this.parentData.selected_data.length === 1) { //单个编辑
      //编辑单个优化
      this.optimizationData['publisher_id'] = this.parentData.selected_data[0].publisher_id;
      this.getOptimizationGroup(this.optimizationData['publisher_id'], this.optimizationData.optimization_method);
      this.deviceList();

    } else { //批量编辑
      if (this.publisher_model['publisher_array'].length) {
        //当批量编辑同一个媒体下的优化时，媒体id的初始化
        this.settingOptimazationPublisheId();
      }

    }
  }

  settingOptimazationPublisheId() {
    this.optimizationData['publisher_id'] = this.publisher_model['publisher_array'][0].value;
    this.getOptimizationGroup(this.optimizationData['publisher_id'], this.optimizationData.optimization_method);
    this.deviceList();
  }

  change_optimization_publisher(publisherId) {
    this.getOptimizationGroup(publisherId, this.optimizationData['optimization_method']);
    this.deviceList(); //设备展示
    this.setRegion();
    this.getTplByPublisherId(this.optimizationData['publisher_id']);
  }

  //获取优化组列表
  getOptimizationGroup(publisherId, optimizationMethod) {
    this.optimizationService.getOptimizationGroup(publisherId, {
      'result_model': 'all',
      'optimization_type': optimizationMethod
    }).subscribe(
      (result) => {
        this.optimization_group_model = result.data;
      }
    );
  }


  //设备列表
  deviceList() {
    this.deviceArray = Object.keys(this.rank_option);
    if ((this.optimizationData['publisher_id'] * 1) === 4) { // 4：只显示wap
      this.optimizationData['constraint_condition_sigle']['device'] = 'wap';
      this.optimizationData['constraint_condition_sigle']['ranking_left'] = 3001;
      this.optimizationData['constraint_condition_sigle']['ranking_right'] = 3003;
      this.deviceArray = this.deviceArray.splice(1, 1);
      this.ranking = this.rank_option['wap'];
    } else {
      this.optimizationData['constraint_condition_sigle']['device'] = 'pc';
      this.optimizationData['constraint_condition_sigle']['ranking_left'] = 1001;
      this.optimizationData['constraint_condition_sigle']['ranking_right'] = 1005;
      this.ranking = this.rank_option['pc'];
    }/* else { //其他：显示pc
      this.optimizationData['constraint_condition_sigle']['device'] = 'pc';
      this.optimizationData['constraint_condition_sigle']['ranking_left'] = 1001;
      this.optimizationData['constraint_condition_sigle']['ranking_right'] = 1001;
      this.deviceArray = this.deviceArray.splice(0, 1);
      this.ranking = this.rank_option['pc'];
    }*/

  }

  deviceChange(device) {
    if (device === "pc") {
      this.ranking = this.rank_option.pc;
      this.optimizationData.constraint_condition_sigle['ranking_left'] = this.ranking[0]['id'];
      this.optimizationData.constraint_condition_sigle['ranking_right'] = this.ranking[4]['id'];
    } else if (device === "wap") {
      this.ranking = this.rank_option.wap;
      this.optimizationData.constraint_condition_sigle['ranking_left'] = this.ranking[0]['id'];
      this.optimizationData.constraint_condition_sigle['ranking_right'] = this.ranking[2]['id'];
    }
  }

  changeProvince(provinceId, init = false) {
    this.provinceList.forEach((item) => {
      if (item.code === provinceId) {
        this.cityList = item.sub;
        if (!init) {
          if (this.cityList.length) {
            this.optimizationData['city'] = this.cityList[0]['code'];
          } else {
            this.optimizationData['city'] = '';
          }
        }

      }
    });
  }

  changeOptimizationGoal() {
    this.optimizationData.target_condition_setting.constraint_condition['condition_key'] = this.condition[this.optimizationData.target_condition_setting.optimization_target][0]['value'];
    if (this.optimizationData.target_condition_setting.constraint_condition['condition_key'] === 1) {
      this.optimizationData.target_condition_setting.constraint_condition['condition_value'] = '';
    }
  }

  chengeMethod() {
    this.getOptimizationGroup(this.optimizationData['publisher_id'], this.optimizationData.optimization_method);
    if (this.optimizationData.optimization_method === 2) {
      this.optimizationData.adjustment_words_type['is_edit'] = false;
    }
  }


  /*
 * 获取指定的日期
 * date
 * date 为空； 代表今天的日期；
 * date===1 ； 代表明天的日期，依次往后推
 * date=== 中国标准时间
 * */
  getNowTime(date?) {
    const day = new Date();
    let formatDate = '';
    if (!date) {
      formatDate = day.getFullYear() + "-" + this.formatTen((day.getMonth() + 1)) + "-" + this.formatTen(day.getDate());
    } else {
      if (isNumber(date)) {
        day.setTime(day.getTime() + 24 * 60 * 60 * 1000 * date);
        formatDate = day.getFullYear() + "-" + this.formatTen((day.getMonth() + 1)) + "-" + this.formatTen(day.getDate());
      } else {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const myDay = date.getDate();
        return year + "-" + this.formatTen(month) + "-" + this.formatTen(myDay);
      }
    }
    return formatDate;
  }
  private formatTen(num) {
    return num > 9 ? (num + "") : ("0" + num);
  }

  onChangeStart(result: Date): void {
    const afterTime = this.getNowTime(result);
    this.optimizationData.start_time = afterTime;
  }
  onChangeEnd(result: Date): void {
    const afterTime = this.getNowTime(result);
    this.optimizationData.end_time = afterTime;
  }

  //得到可添加删除约束条件模板 传回来的值
  getConstraintArray(event) {
    this.constraintData = [];
    event.forEach(item => {
      this.constraintData.push(item.data);
    });
  }



  _showSingleKeyword() {
    this._http.getSingleKeywordData({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_campaign_id": this.parentData.selected_data[0].pub_campaign_id,
      "pub_adgorup_id": this.parentData.selected_data[0].pub_adgorup_id,
      "pub_keyword_id": this.parentData.selected_data[0].pub_keyword_id
    }).subscribe(
      (result) => {
        if (result.status_code === 200) {
          this.showSingleKeywordData = result.data;
          this._showDimensionSetting(result.data['dimensions']);
        }
      }
    );
  }

  _showCampaign() {
    this._http.showCampaign({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_campaign_id": this.parentData.selected_data[0].pub_campaign_id
    }).subscribe(
      (result) => {
        this.campaignInfo = result.data;
      }
    );
  }


  _showDimensionSetting(setting) {
    if (setting) {
      this.dimensionsData.forEach((item) => {
        item['value'] = setting[item['key']];
      });
    }
  }

  _showAdgroup() {
    this._http.showAdgroup({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_adgroup_id": this.parentData.selected_data[0].pub_adgroup_id
    }).subscribe(
      (result) => {
        if (result.status_code === 200) {
          this.groupData = result.data;
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      }
    );
  }

  _showAccount() {
    this._http.showAccount({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id
    }).subscribe(
      (result) => {
        if (result.status_code === 200) {
          this.accountInfo = result['data'];
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }

      }
    );
  }

  chengeAdjustmentWords(event) {
    this.is_adjustment_words.emit(event);
  }

  checkPage() {
    this.iswraing = false;
    this.tishi = '';
    const keywordMessage = '请设置所设时段的出价与排名，其中出价最小比例、最大比例及最高出价都必须设置且都必须大于0，出价上下限必须大于0，且精确到两位小数';
    //媒体判断
    if (!this.optimizationData['publisher_id']) {
      this.iswraing = true;
      return false;
    }
    if (this.optimizationData['optimization_group']['action'] === 1) {
      if (!this.optimizationData['optimization_group']['optimization_group_id']) {
        this.iswraing = true;
        return false;
      }
    } else if (this.optimizationData['optimization_group']['action'] === 2) {
      if (!this.optimizationData['optimization_group']['optimization_group_name']) {
        this.iswraing = true;
        return false;
      }
    }
    //调词模式
    if (this.optimizationData.adjustment_words_type['is_edit']) {
      //约束条件校验
      if (this.optimizationData.adjustment_words_type.action === 1) { //单次

        if (this.singleCheck(this.optimizationData.constraint_condition_sigle)) {
          this.iswraing = true;
          this.tishi = keywordMessage;
          return false;
        }

        if (!this.optimizationData.ranking_region_default && !this.optimizationData['province']) {
          this.iswraing = true;
          return false;
        }
      }
      if (this.optimizationData.adjustment_words_type.action === 2) { //循环
        for (const value of this.constraintData) {
          if (this.singleCheck(value)) {
            this.iswraing = true;
            this.tishi = keywordMessage;
            return false;
          }
        }

        if (!this.optimizationData.ranking_region_default && !this.optimizationData['province']) {
          this.iswraing = true;
          return false;
        }
      }

    }
    //高价设置
    if (this.optimizationData.optimization_setting_is_edit) {
      if (this.optimizationData.optimization_setting['stable_rankings']['option'] === '固定加价') {
        if (!this.optimizationData.optimization_setting['stable_rankings']['fixed_price_increase']) {
          this.iswraing = true;
          return false;
        }
      }
      if (this.optimizationData.optimization_setting['stable_rankings']['option'] === '比例加价') {
        if (!this.optimizationData.optimization_setting['stable_rankings']['proportional_price_increase']) {
          this.iswraing = true;
          return false;
        }
      }

      if (this.optimizationData.optimization_setting.restore_init_price_low_ratio.is_avaliable) {
        if (!this.optimizationData.optimization_setting.restore_init_price_low_ratio['value']) {
          this.iswraing = true;
          return false;
        }
        if (this.optimizationData.optimization_setting.restore_init_price_low_ratio['value'] && this.optimizationData.optimization_setting.restore_init_price_low_ratio['value'] <= 0) {
          this.iswraing = true;
          return false;
        }
      }
      if (this.optimizationData.optimization_setting.restore_init_price_high_ratio.is_avaliable) {
        if (!this.optimizationData.optimization_setting.restore_init_price_high_ratio['value']) {
          this.iswraing = true;
          return false;
        }
        if (this.optimizationData.optimization_setting.restore_init_price_high_ratio['value'] && this.optimizationData.optimization_setting.restore_init_price_high_ratio['value'] <= 0) {
          this.iswraing = true;
          return false;
        }
      }

    }

    //效果优化高级设置
    if (this.optimizationData.target_condition_setting['is_edit']) {
      if (this.optimizationData.target_condition_setting.constraint_condition['condition_key'] !== 1 && !this.optimizationData.target_condition_setting['constraint_condition']['condition_value']) {
        this.iswraing = true;
        return false;
      }
    }

    //效果优化出价和步长设置
    if (this.optimizationData.price_step_setting.is_edit) {
      if (!this.optimizationData.price_step_setting['max_price']) {
        this.iswraing = true;
        return false;
      }
      if (!this.optimizationData.price_step_setting['min_price']) {
        this.iswraing = true;
        return false;
      }
      if (!this.optimizationData.price_step_setting['price_step_rate']) {
        this.iswraing = true;
        return false;
      }
    }

  }

  //约束条件单个判断
  singleCheck(item) {
    let thisStatus = false;
    if (item['price_type'] === 2) { //出价范围
      if (!item['price_left'] || item['price_left'] < 0) {
        thisStatus = true;
      } else if (!item['price_right'] || item['price_right'] < 0) {
        thisStatus = true;
      } else if (item['price_right'] <= item['price_left']) {
        thisStatus = true;
      } else {
        thisStatus = false;
      }

    } else if (item['price_type'] === 1) {

      if (!item['price_rate_min'] || item['price_rate_min'] < 0) {
        thisStatus = true;
      } else if (!item['price_rate_max'] || item['price_rate_max'] < 0) {
        thisStatus = true;
      } else if (item['price_rate_max'] < item['price_rate_min']) {
        thisStatus = true;
      } else if (!item['price_rate_max_abs'] || item['price_rate_max_abs'] < 0) {
        thisStatus = true;
      } else {
        thisStatus = false;
      }
    }

    return thisStatus;
  }

  getOptimizationData(data, selectType) {
    const model = {
      "group_info": {}
    };
    model['group_info']['publisher_id'] = data['publisher_id'];

    model['group_info']['optimization_type'] = data['optimization_method']; //优化类型
    if (data['optimization_group']['action'] === 1) {
      model['group_info']['optimization_id'] = data['optimization_group']['optimization_group_id'];
    } else if (data['optimization_group']['action'] === 2) {
      model['group_info']['optimization_name'] = data['optimization_group']['optimization_group_name'];
    }
    model['is_skip'] = data['optimization_group']['is_skip'];

    //排名优化
    if (data['optimization_method'] === 1) {
      //高级设置
      if (data['optimization_setting_is_edit']) {
        model['group_info']['optimization_setting'] = {};
        model['group_info']['optimization_setting'] = data['optimization_setting'];
      }

      //调词模式
      model['ranking_setting'] = {};
      if (data['adjustment_words_type']['is_edit']) {  //调词
        model['ranking_setting']['data'] = [];
        model['ranking_setting']['ranking_model'] = data['adjustment_words_type']['action'];
        if (data['adjustment_words_type']['action'] === 1) { //单次
          model['ranking_setting']['data'].push(data['constraint_condition_sigle']);
          model['ranking_setting']['ranking_beg_date'] = this.getNowTime();
          model['ranking_setting']['ranking_end_date'] = this.getNowTime(6);
        } else if (data['adjustment_words_type']['action'] === 2) { //循环
          model['ranking_setting']['ranking_beg_date'] = data['start_time'];
          model['ranking_setting']['ranking_end_date'] = data['end_time'];
          model['ranking_setting']['data'] = this.constraintData;
        }

        model['ranking_setting']['ranking_region'] = {};
        model['ranking_setting']['ranking_interval'] = data['interval_word'];

        model['ranking_setting']['ranking_region']['province'] = data['province'];
        model['ranking_setting']['ranking_region']['city'] = data['city'];
        model['ranking_setting']['ranking_region_default'] = data['ranking_region_default'];


        model['ranking_setting']['ranking_priority'] = data['running_grade'];
      }
    } else if (data['optimization_method'] === 2) { //效果优化

      //效果优化的高级设置
      if (data['target_condition_setting']['is_edit']) {
        model['group_info']['optimization_setting'] = {};
        model['group_info']['optimization_setting'] = data['target_condition_setting'];
      }

      //效果优化的 出价和步长
      if (data['price_step_setting']['is_edit']) {
        model['price_step_setting'] = {};
        model['price_step_setting'] = data['price_step_setting'];
      }

    }

    model['ranking_details'] = {};
    model['ranking_details']['select_type'] = selectType;

    if (selectType === 'current') {
      model['ranking_details']['details'] = this.idsArray;
    } else if (selectType === 'all') {
      model['ranking_details']['sheets_setting'] = {
        'table_setting': this.parentData.allViewTableData
      };
    }
    model['ranking_details']['type'] = this.summaryType;
    model['source'] = this.summaryType + "Edit";
    return model;
  }


  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      //判断起止日期
      if (this.optimizationData.optimization_method === 1 && this.optimizationData.adjustment_words_type.action === 2 && differenceInCalendarDays(parseISO(this.optimizationData.end_time), parseISO(this.optimizationData.start_time)) < 0) {
        this.message.warning('结束时间不能大于开始时间，请重新选择', { nzDuration: 3000 });
        return false;
      }
      this.checkPage();
      if (!this.iswraing) {
        this.is_saving.emit({
          'is_saving': true,
          'isHidden': 'true'
        });

        const optimizationData = this.getOptimizationData(this.optimizationData, this.parentData.selected_type);
        let addMethod = "updateOptimization";
        if (this.optimizationData.optimization_method === 2) {
          addMethod = "addToEffect";
        }

        this.optimizationService[addMethod](optimizationData).subscribe(
          (result) => {
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'true'
            });
            if (result.status_code === 200) {
              this.is_saving.emit({
                'is_saving': false,
                'isHidden': 'false'
              });
              this.message.success(result['message']);
            } else if (result['status_code'] && result.status_code === 401) {
              this.message.error(result['message']);
            } else if (result['status_code'] && result.status_code === 500) {
              this.message.error(result['message']);
            } else if (result['status_code'] && result.status_code === 205) {
            } else {
              this.message.error(result.message);
            }
          }, err => {
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'true'
            });
          }, () => {
          }
        );
      }
    }

  }

}
