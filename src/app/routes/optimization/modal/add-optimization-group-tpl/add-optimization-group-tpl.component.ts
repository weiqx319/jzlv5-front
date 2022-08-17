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
  selector: 'app-add-optimization-group-tpl',
  templateUrl: './add-optimization-group-tpl.component.html',
  styleUrls: ['./add-optimization-group-tpl.component.scss'],
  providers: [OptimizationDetailRankingService, RegionListService]
})
export class AddOptimizationGroupTplComponent implements OnInit {

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
  public publisherTypeList = [
    { name: '百度', key: 1 },
    { name: '搜狗', key: 2 },
    { name: '360', key: 3 },
    { name: '神马', key: 4 }
  ];
  public publisherTypeListName = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马',
  };


  public publisherId: any = 1;
  public ranking_model = 0;

  public iswraing = false; //校验 false：不校验， true：提示校验
  public tishi = '';
  public showCity = false;
  public idsArray = [];

  public optimization_keywordData = {
    'tpl_name': null,
    "adjustment_words_type": {
      "action": 2  //1，单次  2，循环
    },

    "interval_word": 5, //调词间隔
    "province": null, // 竞价地域省
    "city": null, // 竞价地域市
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

  private constraintData = []; //多个约束条件的数组
  public provinceList = [];
  public cityList = [];
  public postBody = {};


  ngOnInit() {
    this.showDeviceByPublisherId();
    this.getProvince();

    //编辑回显
    if (this.parentData) {
      this.editShow();
    }
  }


  editShow() {
    this.optimization_keywordData.tpl_name = this.parentData['tpl_name'];
    this.publisherId = this.parentData['publisher_id'];

    this.optimization_keywordData.adjustment_words_type.action = this.parentData['tpl_setting']['ranking_model'];
    this.optimization_keywordData.interval_word = this.parentData['tpl_setting']['ranking_interval'];
    this.optimization_keywordData.province = this.parentData['tpl_setting']['ranking_region']['province'];
    this.optimization_keywordData.city = this.parentData['tpl_setting']['ranking_region']['city'];
    this.optimization_keywordData['province_name'] = this.parentData['tpl_setting']['ranking_region']['province_name'];
    this.optimization_keywordData['city_name'] = this.parentData['tpl_setting']['ranking_region']['city_name'];

    this.optimization_keywordData.ranking_region_default = this.parentData['tpl_setting']['ranking_region_default'];
    this.optimization_keywordData.running_grade = this.parentData['tpl_setting']['ranking_priority'];
    this.changeProvince(this.optimization_keywordData['province'], true);


    if (this.optimization_keywordData.adjustment_words_type.action === 1) {
      this.optimization_keywordData.constraint_condition_sigle = this.parentData['tpl_setting']['data'][0];
      this.ranking = this.rank_option[this.optimization_keywordData.constraint_condition_sigle['device']];


    } else if (this.optimization_keywordData.adjustment_words_type.action === 2) {
      this.optimization_keywordData.constraint_condition_loop = this.parentData['tpl_setting']['data'];
    }
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

  getOptimizationData(data) {
    const model = {
      "tpl_setting": {
      }
    };
    model['publisher_id'] = this.publisherId;
    model['tpl_name'] = data.tpl_name;

    model['tpl_setting']['data'] = [];
    model['tpl_setting']['ranking_model'] = data['adjustment_words_type']['action'];
    if (data['adjustment_words_type']['action'] === 1) { //单次
      model['tpl_setting']['data'].push(data['constraint_condition_sigle']);
    } else if (data['adjustment_words_type']['action'] === 2) { //循环
      model['tpl_setting']['data'] = this.constraintData;
    }

    model['tpl_setting']['ranking_region'] = {};
    model['tpl_setting']['ranking_interval'] = data['interval_word'];

    model['tpl_setting']['ranking_region']['province'] = data['province'];
    model['tpl_setting']['ranking_region']['city'] = data['city'];
    this.provinceList.forEach(item => {
      if (item.code === data['province']) {
        model['tpl_setting']['ranking_region']['province_name'] = item.name;
      }
    });
    this.cityList.forEach(cityItem => {
      if (cityItem.code === data['city']) {
        model['tpl_setting']['ranking_region']['city_name'] = cityItem.name;
      }
    });


    model['tpl_setting']['ranking_region_default'] = data['ranking_region_default'];

    model['tpl_setting']['ranking_priority'] = data['running_grade'];

    return model;
  }

  changeProvince(provinceId, init = false) {
    this.provinceList.forEach((item) => {
      if (item.code === provinceId) {
        this.cityList = item.sub;
        if (!init) {
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
      const optimizationData = this.getOptimizationData(this.optimization_keywordData);
      if (this.parentData) { //编辑模版
        this.optimizationDetailRankingService.updateRankTpl(this.parentData['tpl_id'], optimizationData).subscribe(
          (result) => {
            if (result.status_code === 200) {
              this.message.success(result['message']);
              this.modalSubject.destroy('onOk');

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
      } else { //添加模版
        this.optimizationDetailRankingService.addRankTpl(optimizationData).subscribe(
          (result) => {
            if (result.status_code === 200) {
              this.message.success(result['message']);
              this.modalSubject.destroy('onOk');

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


}
