import { Component, Input, OnInit } from '@angular/core';
import { OptimizationService } from "../../service/optimization.service";
import { OptimizationDetailRankingService } from "../../optimization-detail/service/optimization-detail-ranking.service";
import { RegionListService } from "../../../dashboard/service/region-list.service";
import { ActivatedRoute } from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { isNumber } from "@jzl/jzl-util";
import { NotifyService } from "../../../../module/notify/notify.service";
import { AuthService } from "../../../../core/service/auth.service";

@Component({
  selector: 'app-edit-optimization-group',
  templateUrl: './edit-optimization-group.component.html',
  styleUrls: ['./edit-optimization-group.component.scss'],
  providers: [OptimizationDetailRankingService, RegionListService]
})
export class EditOptimizationGroupComponent implements OnInit {
  @Input() parentData: any;
  constructor(private optimizationService: OptimizationService,
    private optimizationDetailRankingService: OptimizationDetailRankingService,
    private regionList: RegionListService,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private notifyService: NotifyService,
    private authService: AuthService,
    private modalSubject: NzModalRef) {
  }

  public ranking_model = 0;
  public optimizationId = '';

  public publisherId: any; //媒体id
  public iswraing = false; //校验 false：不校验， true：提示校验
  public tishi = '';
  public showCity = false;
  public idsArray = [];

  public templateList = [];
  public optimization_keywordData = {
    template: null,
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
    this.showDeviceByPublisherId();

    this.getProvince();
    //初始化日期
    this.optimization_keywordData.start_time = this.getNowTime();
    this.optimization_keywordData.end_time = this.getNowTime(6);

    if (this.parentData.selected_type === 'current') {
      this.parentData['selected_data'].forEach(item => {
        this.idsArray.push(item['optimization_id']);
      });
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
        this.templateList = result.data;
        this.optimization_keywordData.template = null;
      }
    );

  }

  getProvince() {
    const provinceArray = JSON.parse(JSON.stringify(this.regionList.getOptimiztionRegionLists()));
    provinceArray.forEach(item => {
      if (item['publisher'] && item['publisher'].indexOf(this.publisherId * 1) === -1) {
        return false;
      }
      this.provinceList.push(item);

    });
    this.provinceList.splice(0, 0, {
      'name': '请选择省',
      'code': '',
      'sub': []
    });
  }


  //页面校验
  checkPage() {
    this.tishi = '';
    this.iswraing = false;
    const keywordMessage = '请设置所设时段的出价与排名，其中出价最小比例、最大比例及最高出价都必须设置且都必须大于0，出价上下限必须大于0，且精确到两位小数';
    //地域校验
    if (!this.optimization_keywordData.ranking_region_default && !this.optimization_keywordData.province) {
      this.iswraing = true;
      return false;
    }
    //约束条件校验
    if (this.optimization_keywordData.adjustment_words_type.action === 1) { //单次
      //批量编辑
      if (this.singleCheck(this.optimization_keywordData.constraint_condition_sigle)) {
        this.iswraing = true;
        this.tishi = keywordMessage;
        return false;
      }
    }
    if (this.optimization_keywordData.adjustment_words_type.action === 2) { //循环
      for (const value of this.constraintData) {
        if (this.singleCheck(value)) {
          this.iswraing = true;
          this.tishi = keywordMessage;
          return false;
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

    model['source'] = 'optimizationGroup' + "Edit";
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
    model['ranking_details']['type'] = 'optimization_group';

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

  changeProvince(provinceId, init = false) {
    this.provinceList.forEach((item) => {
      if (item.code === provinceId) {
        if (!init) {
          this.cityList = item.sub;
          if (this.cityList.length) {
            this.optimization_keywordData['city'] = this.cityList[0]['code'];
          } else {
            this.optimization_keywordData['city'] = '';
          }
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

  cancel() {
    this.modalSubject.destroy('onCancel');
  }
  sure() {
    this.iswraing = false;
    this.checkPage();
    if (!this.iswraing) {

      const notifyData: any[] = [];
      const userOperdInfo = this.authService.getCurrentUserOperdInfo();
      const optimizationData = this.getOptimizationData(this.optimization_keywordData, this.parentData.selected_type);
      this.optimizationDetailRankingService.updateRankingSetting(optimizationData).subscribe(
        (result) => {
          if (result.status_code === 200) {
            this.message.success(result['message']);
            this.modalSubject.destroy('onOk');
            notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'optimization_group' });
            this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });

          } else if (result['status_code'] && result.status_code === 401) {
            this.message.error(result['message']);
          } else if (result['status_code'] && result.status_code === 500) {
            this.message.error(result['message']);
          } else if (result['status_code'] && result.status_code === 205) {
          } else {
            this.message.error(result.message);
          }
        }, err => {

        }, () => {

        }
      );
    }

  }


}
