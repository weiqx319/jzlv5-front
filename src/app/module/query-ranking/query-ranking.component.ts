import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {RegionListService} from "../../routes/dashboard/service/region-list.service";

@Component({
  selector: 'app-query-ranking',
  templateUrl: './query-ranking.component.html',
  styleUrls: ['./query-ranking.component.scss'],
  providers: [RegionListService]
})

export class QueryRankingComponent implements OnInit {
  publisherId: any;
  @Input()
  set publisher_id(value: string) {
    this.publisherId = value;
  }
  @Input() ranking_setting: any;
  @Input() publisherCount: any;
  @Input() isFeed = false;


  public device_os = 1;
  public province_id = '9010000';
  public city_id: any;
  public query_ranking_data = {
    'region': '',
    'device': 1
  };
  public region_default_flag = true;
  public is_wroing = false;
  provinceList = [];
  cityList = [];
  public submitting = false;
  constructor(private fb: FormBuilder,
              private _message: NzMessageService,
              private subject: NzModalRef,
              private regionList: RegionListService) {

  }
/*
* is_init:标志是否是初始化
* */
  changeProvince(provinceId , is_init?) {
    this.provinceList.forEach( (item) => {
      if (item.code === provinceId) {
        this.cityList = item.sub;
        if (this.cityList.length) {
          this.cityList = [{"code": '', "name": '请选择'}].concat(item.sub);
          if (!is_init) {
            this.city_id = this.cityList[0]['code'];
          }
        } else {
          this.city_id = '';
        }
      }
    });

  }

  //根据媒体得到地域列表
  setRegion() {
    this.provinceList = [];
    if (this.publisherId) { //非跨媒体时：根据媒体显示国外地域
      const provinceArray = JSON.parse(JSON.stringify(this.regionList.getRegionLists()));

      provinceArray.forEach(item => {
        if (item['publisher'] && item['publisher'].indexOf(this.publisherId * 1) === -1) {
          return false;
        }
        this.provinceList.push(item);
      });
    } else { //跨媒体时：海外、日本不显示
      const provinceArray = JSON.parse(JSON.stringify(this.regionList.getRegionLists()));
      provinceArray.forEach(item => {
        if (item['publisher']) {
          return false;
        }
        this.provinceList.push(item);
      });
    }
  }

  submitForm() {
    this.is_wroing = false;
    //非百度和 跨媒体，市必填
    if (((this.publisherCount === 1 && this.publisherId * 1 !== 1) || this.publisherCount > 1)  && this.cityList.length && !this.city_id) {
      this.is_wroing = true;
      return false;
    }



    if (this.city_id) {
      this.query_ranking_data.region = this.city_id;
    } else {
      this.query_ranking_data.region = this.province_id;
    }
    this.query_ranking_data['region_default_flag'] = this.region_default_flag;

    const saveData = {
      'province_id': this.province_id,
      'city_id': this.city_id,
      'device': this.query_ranking_data['device'],
      'region_default_flag': this.region_default_flag
    };

    if (this.publisherCount === 1 && this.publisherId === 4 && this.query_ranking_data['device'] * 1 === 2) {
      saveData['device_os'] = this.device_os;
      this.query_ranking_data['device_os'] = this.device_os;
    }
    this.subject.destroy({status: 'ok', data: this.query_ranking_data, saveData: saveData});

  }


  cancelForm() {
    this.subject.destroy({status: 'cancel'});
  }

  ngOnInit() {
    this.setRegion();
    if (this.publisherCount === 1 && (this.publisherId === 4||this.publisherId === 17)) {
      this.query_ranking_data['device'] = 2;
    }

    if (this.ranking_setting) {

      if (this.publisherCount === 1 && (this.publisherId === 4||this.publisherId === 17)) {
        this.query_ranking_data.device = 2;
      } else {
        this.query_ranking_data.device = this.ranking_setting['device'];
      }
      this.province_id = this.ranking_setting['province_id'];
      this.city_id = this.ranking_setting['city_id'];
      this.region_default_flag =  this.ranking_setting['region_default_flag'];

      this.changeProvince(this.province_id, true);
    }

  }
}




