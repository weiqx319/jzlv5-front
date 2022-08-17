import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { isNumber } from "@jzl/jzl-util";
import { RegionListService } from "../../../dashboard/service/region-list.service";
import { OptimizationService } from "../../service/optimization.service";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../../core/service/auth.service";
import { OptimizationDetailRankingService } from "../../optimization-detail/service/optimization-detail-ranking.service";
import { differenceInCalendarDays, parseISO } from "date-fns";

@Component({
  selector: 'app-edit-optimization-setting',
  templateUrl: './edit-optimization-setting.component.html',
  styleUrls: ['./edit-optimization-setting.component.scss']
})
export class EditOptimizationSettingComponent implements OnInit, OnChanges {

  @Input() idsArray: any;
  @Input() parentData: any;
  @Input() is_check: any; //标志是否点击了保存
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();

  private regionListApiData = [];


  constructor(private optimizationService: OptimizationService,
    private optimizationDetailRankingService: OptimizationDetailRankingService,
    private regionList: RegionListService,
    private route: ActivatedRoute,
    private message: NzMessageService) {
    this.optimizationId = this.route.snapshot.parent.paramMap.get('id');
  }

  private today = new Date();
  public ranking_model = 0;
  public optimizationId = '';
  public is_single_edit = false;

  public publisherId: any; //媒体id
  public saveing = false;
  public iswraing = false; //校验 false：不校验， true：提示校验
  public tishi = '';
  public showCity = false;

  public templateList = [];
  public optimization_keywordData = {
    template: null,
    /*'is_edit': {
      "ranking_model": false,
      "ranking_beg_date": false,
      "ranking_beg_date": false,
      "ranking_region" : false,
      ""
    }*/
    "is_edit_adjustment_words_type": false,
    "is_edit_date": false,
    "is_edit_interval_word": false,
    "is_edit_region": false,
    "is_edit_running_grade": false,
    "is_edit_constraint_condition_sigle": false,
    "is_edit_constraint_condition_loop": false,

    "adjustment_words_type": {
      "action": 2  //1，单次  2，循环
    },
    "start_time": "",
    "end_time": "",
    "interval_word": 5, //调词间隔
    "province": "", // 竞价地域省
    "city": "", // 竞价地域市
    'ranking_region_default': true, //使用默认地域
    "running_grade": 3, // 运行等级 1，低 2，中 3，高
    "constraint_condition_sigle": {
      "price_type": 1, //出价范围
      "device": "pc", //设备
      "ranking_left": 1001,
      "ranking_right": 1005,
      'device_os': 1,
      "price_rate_min": 0.8, //倍数小
      "price_rate_max": 1.3, //倍数大
      "price_left": null,  //价格小
      "price_right": null //价格大
      /*     "price_rate_min": 0 , //倍数小
           "price_rate_max": 0 , //倍数大
           "price_rate_max_abs": "", //不超过price*/
      /*"price_left": 0,  //价格小
      "price_right": 0 //价格大*/
    }, //约束条件
    "constraint_condition_loop": [] //约束条件
  };

  public deviceArray = []; //设备数组
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
  public ranking = []; //ranking数组
  public stable_rankings = [
    { "name": '请选择', "value": '' },
    { "name": '不加价', "value": '不加价' },
    { "name": '固定加价', "value": '固定加价' },
    { "name": '比例加价', "value": '比例加价' },
  ]; //加价稳定排名
  private constraintData = []; //多个约束条件的数组
  public provinceList = [];
  public cityList = [];
  public postBody = {};


  ngOnInit() {
    this.publisherId = this.parentData.selected_data[0]['publisher_id'] * 1;
    this.getRankingModel();
    this.showDeviceByPublisherId();
    const optimizationData = this.getOptimizationData(this.optimization_keywordData, this.parentData.selected_type);

    this.postBody = {
      'group_info': optimizationData['group_info'],
      'ranking_details': optimizationData['ranking_details']
    };

    this.getProvince(this.postBody);
    if (this.parentData['selected_data'].length !== 1) {
      //初始化日期
      this.optimization_keywordData.start_time = this.getNowTime();
      this.optimization_keywordData.end_time = this.getNowTime(6);
    }

    this.getTplByPublisherId(this.publisherId);
  }

  changeTpl(data) {
    data['tpl_setting']['ranking_model'] * 1 === 1 ? this.optimization_keywordData.adjustment_words_type.action = 1 : this.optimization_keywordData.adjustment_words_type.action = 2;

    this.optimization_keywordData.province = data['tpl_setting']['ranking_region']['province'];
    this.optimization_keywordData.city = data['tpl_setting']['ranking_region']['city'];
    this.optimization_keywordData.ranking_region_default = data['tpl_setting']['ranking_region_default'];
    this.optimization_keywordData.running_grade = data['tpl_setting']['ranking_priority'];
    this.optimization_keywordData.interval_word = data['tpl_setting']['ranking_interval'];
    this.changeProvince(this.optimization_keywordData['province'], true);


    if (this.optimization_keywordData.adjustment_words_type.action * 1 === 2) { //循环

      this.optimization_keywordData['constraint_condition_loop'] = [];
      this.optimization_keywordData['constraint_condition_loop'] = data['tpl_setting']['data'];

    } else if (this.optimization_keywordData.adjustment_words_type.action * 1 === 1) { //单次

      const show_data = { ...data['tpl_setting']['data'][0] };
      if (data['tpl_setting']['data'][0]['price_rate_min'] * 1 === 0 || data['tpl_setting']['data'][0]['price_rate_max'] * 1 === 0 || data['tpl_setting']['data'][0]['rate_max_price'] * 1 === 0) {
        show_data['price_rate_min'] = 0.8;
        show_data['price_rate_max'] = 1.3;
        show_data['price_rate_max_abs'] = '';
      }
      this.optimization_keywordData['constraint_condition_sigle'] = show_data;
      this.ranking = this.rank_option[show_data['device']];

    }
  }

  getTplByPublisherId(publisherId) {
    this.optimizationService.getRankTplListBtPublisherId(publisherId).subscribe(
      (result) => {
        if (result.status_code && result.status_code === 200) {
          this.templateList = result.data;
          this.optimization_keywordData.template = null;
        }
      }
    );

  }
  //获取列表筛选的调词模式
  getRankingModel() {
    if (this.parentData['allViewTableData']['single_condition'].length) {
      this.parentData['allViewTableData']['single_condition'].forEach((item) => {
        if (item['key'] === 'ranking_model') {
          if (item['value'] === 1 || item['value'] === 2) {
            this.ranking_model = item['value'];
            this.optimization_keywordData.adjustment_words_type.action = this.ranking_model;
            this.is_single_edit = true;
          }
        }
      });
    }
    if (this.parentData['allViewTableData']['condition'].length) {
      this.parentData['allViewTableData']['condition'].forEach((item) => {
        if (item['key'] === 'ranking_model') {
          if (item['value'] === 1 || item['value'] === 2) {
            this.ranking_model = item['value'];
            this.optimization_keywordData.adjustment_words_type.action = this.ranking_model;
            this.is_single_edit = true;
          }
        }
      });
    }
  }

  //点击调词模式
  changeRankingModel() {
    if (this.optimization_keywordData.adjustment_words_type.action === this.ranking_model) {
      this.is_single_edit = true;
    } else {
      this.is_single_edit = false;
    }
  }
  getProvince(postBody) {
    this.optimizationDetailRankingService.getRegion(this.optimizationId, postBody).subscribe(
      (result) => {
        this.provinceList = result.data;
        this.regionListApiData = result.data;
        this.provinceList.splice(0, 0, {
          'name': '请选择省',
          'code': '',
          'sub': []
        });
        this.getSingleData();
      }
    );
    this.getSingleData();
  }

  getSingleData() {
    if (this.parentData['selected_data'].length === 1 && this.parentData['selected_data'][0]['ranking_keyword_status']) {

      const data = this.parentData['selected_data'][0];
      this.optimization_keywordData['start_time'] = data['ranking_beg_date'];
      this.optimization_keywordData['end_time'] = data['ranking_end_date'];
      this.optimization_keywordData['interval_word'] = data['ranking_interval'] * 1;
      this.optimization_keywordData['province'] = data['ranking_region']['province'] + '';
      this.optimization_keywordData['city'] = data['ranking_region']['city'] + '';
      this.optimization_keywordData['running_grade'] = data['ranking_priority'] * 1;

      if (!data['ranking_beg_date'] || !data['ranking_end_date']) {
        //初始化日期
        this.optimization_keywordData.start_time = this.getNowTime();
        this.optimization_keywordData.end_time = this.getNowTime(6);
      }

      this.changeProvince(this.optimization_keywordData['province'], true);
      if (this.optimization_keywordData['city']) {
        this.showCity = true;
      }
      data['ranking_model'] * 1 === 1 ? this.optimization_keywordData.adjustment_words_type.action = 1 : this.optimization_keywordData.adjustment_words_type.action = 2;
      if (data['ranking_model'] === '2') { //循环
        this.optimization_keywordData['constraint_condition_loop'] = [];
        const shuju = [];
        data['ranking_setting'].forEach((item) => {

          const show_data = {
            "price_type": 1, //出价范围
            "device": item['device'], //设备
            "device_os": item['device_os'], //操作系统
            "ranking_left": item['ranking_code_min'] * 1,
            "ranking_right": item['ranking_code_max'] * 1,
            "price_left": item['price_min'] * 1,  //价格小
            "price_right": item['price_max'] * 1, //价格大
            "price_rate_min": item['price_rate_min'],
            "price_rate_max": item['price_rate_max'],
            "price_rate_max_abs": item['rate_max_price'],
            "min": item['start_hour'] * 1, //
            "max": item['end_hour'] * 1 //
          };
          if (data['ranking_setting'][0]['price_rate_min'] * 1 === 0 || data['ranking_setting'][0]['price_rate_max'] * 1 === 0 || data['ranking_setting'][0]['rate_max_price'] * 1 === 0) {
            show_data['price_rate_min'] = 0.8;
            show_data['price_rate_max'] = 1.3;
            show_data['price_rate_max_abs'] = '';
          }
          shuju.push(show_data);
        });

        this.optimization_keywordData['constraint_condition_loop'] = shuju;
      } else if (data['ranking_model'] === '1') {
        const show_data = {
          "price_type": 1, //出价范围
          "device": data['ranking_setting'][0]['device'], //设备
          "ranking_left": data['ranking_setting'][0]['ranking_code_min'] * 1,
          "ranking_right": data['ranking_setting'][0]['ranking_code_max'] * 1,
          "device_os": data['ranking_setting'][0]['device_os'] * 1, //操作设备
          "price_left": data['ranking_setting'][0]['price_min'] * 1,  //价格小
          "price_right": data['ranking_setting'][0]['price_max'] * 1, //价格大

          "price_rate_min": data['ranking_setting'][0]['price_rate_min'],
          "price_rate_max": data['ranking_setting'][0]['price_rate_max'],
          "price_rate_max_abs": data['ranking_setting'][0]['rate_max_price'],
        };
        if (data['ranking_setting'][0]['price_rate_min'] * 1 === 0 || data['ranking_setting'][0]['price_rate_max'] * 1 === 0 || data['ranking_setting'][0]['rate_max_price'] * 1 === 0) {
          show_data['price_rate_min'] = 0.8;
          show_data['price_rate_max'] = 1.3;
          show_data['price_rate_max_abs'] = '';
        }
        this.optimization_keywordData['constraint_condition_sigle'] = show_data;
      }
    }
  }

  //页面校验
  checkPage() {
    this.tishi = '';
    this.iswraing = false;
    const keywordMessage = '请设置所设时段的出价与排名，其中出价最小比例、最大比例及最高出价都必须设置且都必须大于0，出价上下限必须大于0，且精确到两位小数';
    //地域校验
    if (this.is_single_edit) { //单条编辑
      /*循环检查是否有匹配的地域*/
      let count = 0;
      this.provinceList.forEach((item) => {
        if (item['code'] === this.optimization_keywordData.province) {
          count = count + 1;
        }
      });
      count === 0 ? this.optimization_keywordData.province = '' : this.optimization_keywordData.province = this.optimization_keywordData.province;
      if (this.optimization_keywordData.is_edit_region) {
        if (!this.optimization_keywordData.ranking_region_default && !this.optimization_keywordData.province) {
          this.iswraing = true;
          return false;
        }
      }
    } else {
      if (!this.optimization_keywordData.ranking_region_default && !this.optimization_keywordData.province) {
        this.iswraing = true;
        return false;
      }
    }
    //约束条件校验
    if (this.optimization_keywordData.adjustment_words_type.action === 1) { //单次
      if (this.is_single_edit) { //单条编辑
        if (this.optimization_keywordData.is_edit_constraint_condition_sigle) {
          if (this.singleCheck(this.optimization_keywordData.constraint_condition_sigle)) {
            this.iswraing = true;
            this.tishi = keywordMessage;
            return false;
          }
        }
      } else { //批量编辑
        if (this.singleCheck(this.optimization_keywordData.constraint_condition_sigle)) {
          this.iswraing = true;
          this.tishi = keywordMessage;
          return false;
        }
      }
    }
    if (this.optimization_keywordData.adjustment_words_type.action === 2) { //循环
      if (this.is_single_edit) { //单条编辑
        if (this.optimization_keywordData.is_edit_constraint_condition_loop) {
          for (const value of this.constraintData) {
            if (this.singleCheck(value)) {
              this.iswraing = true;
              this.tishi = keywordMessage;
              return false;
            }
          }
        }
      } else { //批量编辑
        for (const value of this.constraintData) {
          if (this.singleCheck(value)) {
            this.iswraing = true;
            this.tishi = keywordMessage;
            return false;
          }
        }
      }
    }

  }

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

  //根据媒体显示 设备
  showDeviceByPublisherId() {
    this.deviceArray = Object.keys(this.rank_option);
    if (this.publisherId === 4) { // 4：只显示wap
      this.optimization_keywordData['constraint_condition_sigle']['device'] = 'wap';
      this.optimization_keywordData['constraint_condition_sigle']['ranking_left'] = 3001;
      this.optimization_keywordData['constraint_condition_sigle']['ranking_right'] = 3001;
      this.deviceArray = this.deviceArray.splice(1, 1);
      this.ranking = this.rank_option['wap'];
    } else { //其他:全部
      this.optimization_keywordData['constraint_condition_sigle']['device'] = 'pc';
      this.optimization_keywordData['constraint_condition_sigle']['ranking_left'] = 1001;
      this.optimization_keywordData['constraint_condition_sigle']['ranking_right'] = 1005;
      this.ranking = this.rank_option['pc'];
    } /*else { //其他：显示pc
          this.optimization_keywordData['constraint_condition_sigle']['device'] = 'pc';
          this.optimization_keywordData['constraint_condition_sigle']['ranking_left'] = 1001;
          this.optimization_keywordData['constraint_condition_sigle']['ranking_right'] = 1001;
          this.deviceArray = this.deviceArray.splice(0, 1);
          this.ranking = this.rank_option['pc'];
        }*/
  }

  getOptimizationData(data, selectType) {
    const model = {
      "ranking_setting": {
      },
      "group_info": {},
      "ranking_details": {}
    };
    model['group_info']['publisher_id'] = this.publisherId;

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

    model['source'] = 'keyword' + "Edit";
    if (this.parentData['edit_source'] === false) { //点击来源
      model['edit_source'] = false;
    } else {
      model['edit_source'] = true;
    }
    model['ranking_details']['select_type'] = selectType;
    if (selectType === 'current') {
      model['ranking_details']['details'] = this.idsArray;
    } else if (selectType === 'all') {
      model['detail_content'] = [];
      model['ranking_details']['sheets_setting'] = {
        'table_setting': this.parentData.allViewTableData
      };
    }
    model['ranking_details']['type'] = 'keyword';
    if (this.is_single_edit) { //单条编辑
      model['single_setting'] = {};
      model['single_setting']['is_single'] = this.is_single_edit;
      model['single_setting']['ranking_model'] = this.optimization_keywordData.adjustment_words_type.action;
      model['single_setting']['modify_fields'] = [];
      data.is_edit_adjustment_words_type ? model['single_setting']['modify_fields'].push('ranking_model') : model['single_setting']['modify_fields'] = model['single_setting']['modify_fields'];
      data.is_edit_interval_word ? model['single_setting']['modify_fields'].push('ranking_interval') : model['single_setting']['modify_fields'] = model['single_setting']['modify_fields'];
      data.is_edit_region ? model['single_setting']['modify_fields'].push('ranking_region') : model['single_setting']['modify_fields'] = model['single_setting']['modify_fields'];
      data.is_edit_running_grade ? model['single_setting']['modify_fields'].push('ranking_priority') : model['single_setting']['modify_fields'] = model['single_setting']['modify_fields'];
      data.is_edit_date ? model['single_setting']['modify_fields'].push('ranking_date') : model['single_setting']['modify_fields'] = model['single_setting']['modify_fields'];
      data.is_edit_constraint_condition_sigle ? model['single_setting']['modify_fields'].push('data') : model['single_setting']['modify_fields'] = model['single_setting']['modify_fields'];
      data.is_edit_constraint_condition_loop ? model['single_setting']['modify_fields'].push('data') : model['single_setting']['modify_fields'] = model['single_setting']['modify_fields'];
    }

    return model;
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
    this.optimization_keywordData.start_time = afterTime;
  }
  onChangeEnd(result: Date): void {
    const afterTime = this.getNowTime(result);
    this.optimization_keywordData.end_time = afterTime;
  }
  changeProvince(provinceId, is_show?) {
    this.showCity = false;
    this.provinceList = JSON.parse(JSON.stringify(this.regionListApiData));
    this.provinceList.splice(0, 0, {
      'name': '请选择省',
      'code': '',
      'sub': []
    });
    this.provinceList.forEach((item) => {

      if (item.code === provinceId) {
        this.cityList = item.sub;
        if (this.cityList.length) {

          if (!is_show) {
            this.optimization_keywordData.city = this.cityList[0]['code'];
          }
        } else {
          this.optimization_keywordData.city = '';
        }
      }
    });

  }

  deviceChange(device) {
    if (device === "pc") {
      this.ranking = this.rank_option.pc;
      this.optimization_keywordData.constraint_condition_sigle['ranking_left'] = this.ranking[0]['id'];
      this.optimization_keywordData.constraint_condition_sigle['ranking_right'] = this.ranking[0]['id'];

    } else if (device === "wap") {
      this.ranking = this.rank_option.wap;
      this.optimization_keywordData.constraint_condition_sigle['ranking_left'] = this.ranking[0]['id'];
      this.optimization_keywordData.constraint_condition_sigle['ranking_right'] = this.ranking[0]['id'];
    }
  }

  //得到可添加删除约束条件模板 传回来的值
  getConstraintArray(event) {
    this.constraintData = [];
    event.forEach(item => {
      this.constraintData.push(item.data);
    });
  }
  disabledDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.today) < 0;
  }
  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;

      //判断起止日期
      //非单个编辑
      if (!this.is_single_edit && this.optimization_keywordData.adjustment_words_type.action === 2 && differenceInCalendarDays(parseISO(this.optimization_keywordData.end_time), parseISO(this.optimization_keywordData.start_time)) < 0) {
        this.message.warning('结束时间不能大于开始时间，请重新选择', { nzDuration: 3000 });
        return false;
      }
      //单个编辑

      if (this.is_single_edit && this.optimization_keywordData.adjustment_words_type.action === 2 && this.optimization_keywordData.is_edit_date && differenceInCalendarDays(parseISO(this.optimization_keywordData.end_time), parseISO(this.optimization_keywordData.start_time)) < 0) {
        this.message.warning('结束时间不能大于开始时间，请重新选择', { nzDuration: 3000 });
        return false;
      }
      this.checkPage();
      if (!this.iswraing) {
        this.is_saving.emit({
          'is_saving': true,
          'isHidden': 'true'
        });

        const optimizationData = this.getOptimizationData(this.optimization_keywordData, this.parentData.selected_type);

        this.optimizationDetailRankingService.updateOptimization(this.optimizationId, optimizationData).subscribe(
          (result) => {
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'true'
            });
            if (result.status_code === 200) {
              // localStorage.removeItem('edit_state');
              this.message.success(result['message']);
              // this.isHidden.emit('refresh');
              this.is_saving.emit({
                'is_saving': false,
                'isHidden': 'refresh'
              });
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
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'false'
            });
          }
        );
      }
    }

  }

}
