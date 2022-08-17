import { Component, OnInit, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {ActivatedRoute, Router} from "@angular/router";
import {OptimizationService} from "../../../service/optimization.service";

@Component({
  selector: 'app-optimization-detail-setting',
  templateUrl: './optimization-detail-setting.component.html',
  styleUrls: ['./optimization-detail-setting.component.scss']
})
export class OptimizationDetailSettingComponent implements OnInit {
  private optimizationGroupInfo: any;
  public optimizationId = '';
  constructor(
    private _http: OptimizationService,
    private _message: NzMessageService,
    private router: Router,
    private  route: ActivatedRoute
  ) {
    this.optimizationId =  this.route.snapshot.parent.paramMap.get('id');
  }

  public iswraing = false;
  public publisherOption = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马'
  };
  public publisherId = 0;
  public saveing = false;

  public stable_rankings = [
    {"name": '请选择' , "value": ''},
    {"name": '不加价' , "value": '不加价'},
    {"name": '固定加价' , "value": '固定加价'},
    {"name": '比例加价' , "value": '比例加价'},
  ];
  public info = {
    "optimization_name": '' ,
    "optimization_setting": {
      "high_price_no_rank": {
        "value": 1 //最高限未达标   1,回到原价  2，保留最优排名
      },
      "prior_type": {
        "value": 1 //优先方式   1,价格优先  2，排名优先
      },
      "stable_rankings": {
        'option': "",
        "fixed_price_increase": '' , //固定加价
        "proportional_price_increase": '' //比例加价
      },
      "restore_init_price_low_ratio": {
        "is_avaliable": false,
        "value": 1 //低于原价
      },
      "restore_init_price_high_ratio": {
        "is_avaliable": false,
        "value": 1 //高于原价
      },
      "end": {
        "value": 1 // 1，恢复原价  2,不回复原价
      }
    }

  };

  ngOnInit() {
    //获取优化组信息
    this._http.getOptimizationInfo().subscribe(
      result => {
       if (result) {
         this.optimizationGroupInfo = result;
         this.publisherId = this.optimizationGroupInfo['publisher_id'] * 1;
         const setting = this.optimizationGroupInfo['optimization_setting'];
         this.info.optimization_name = this.optimizationGroupInfo.optimization_name;

         this.info.optimization_setting.high_price_no_rank.value = setting.high_price_no_rank ? setting.high_price_no_rank.value : 2;

         this.info.optimization_setting.prior_type.value = setting.prior_type ? setting.prior_type.value : 2;

         this.info.optimization_setting.stable_rankings.option = setting.stable_rankings ? setting.stable_rankings.option : '';
         this.info.optimization_setting.stable_rankings.fixed_price_increase = setting.stable_rankings ? setting.stable_rankings.fixed_price_increase : '';
         this.info.optimization_setting.stable_rankings.proportional_price_increase = setting.stable_rankings ? setting.stable_rankings.proportional_price_increase : '';

         this.info.optimization_setting.restore_init_price_low_ratio.is_avaliable = setting.restore_init_price_low_ratio ? setting.restore_init_price_low_ratio.is_avaliable : false;
         this.info.optimization_setting.restore_init_price_low_ratio.value = setting.restore_init_price_low_ratio ? setting.restore_init_price_low_ratio.value : "";

         this.info.optimization_setting.restore_init_price_high_ratio.is_avaliable = setting.restore_init_price_high_ratio ? setting.restore_init_price_high_ratio.is_avaliable : false;
         this.info.optimization_setting.restore_init_price_high_ratio.value = setting.restore_init_price_high_ratio ? setting.restore_init_price_high_ratio.value : "";

         this.info.optimization_setting.end.value = setting.end ? setting.end.value : 2;
       }

      });



  }

  _save() {
    this.checkPage();
    if ( !this.iswraing) {
      if ( !this.saveing) {
        this.saveing = true;
        this._http.heightSetting(this.optimizationId, this.info).subscribe(
          (result: any) => {
            this.saveing = false;
            if (result.status_code === 200 ) {
              this._message.success( "操作成功");
              this._http.setOptimizationRefresh(this.optimizationId);
            } else if (result['status_code'] && result.status_code === 401) {
              this._message.error('您没权限对此操作！');
            } else if (result['status_code'] && result.status_code === 500) {
              this._message.error('系统异常，请重试');
            } else if (result['status_code'] && result.status_code === 205) {
            } else {
              this._message.error(result.message);
            }
          }, err => {
            this.saveing = false;
          }, () => {
            this.saveing = false;
          }
        );
      }
    }

  }
  checkPage() {

    if (!this.info.optimization_name) {
      this.iswraing = true;
    } else if (this.info.optimization_setting.stable_rankings.option  === '固定加价' && !this.info.optimization_setting.stable_rankings.fixed_price_increase) {
      this.iswraing = true;
    } else if (this.info.optimization_setting.stable_rankings.option  === '比例加价' && !this.info.optimization_setting.stable_rankings.proportional_price_increase) {
      this.iswraing = true;
    } else if (this.info.optimization_setting.restore_init_price_low_ratio.is_avaliable && !this.info.optimization_setting.restore_init_price_low_ratio.value) {
      this.iswraing = true;
    } else if (this.info.optimization_setting.restore_init_price_high_ratio.is_avaliable && !this.info.optimization_setting.restore_init_price_high_ratio.value) {
      this.iswraing = true;
    }


  }
}
