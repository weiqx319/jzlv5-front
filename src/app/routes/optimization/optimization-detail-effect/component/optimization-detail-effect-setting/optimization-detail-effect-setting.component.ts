import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {OptimizationService} from "../../../service/optimization.service";
import {ActivatedRoute, Router} from "@angular/router";
@Component({
  selector: 'app-optimization-detail-effect-setting',
  templateUrl: './optimization-detail-effect-setting.component.html',
  styleUrls: ['./optimization-detail-effect-setting.component.scss']
})
export class OptimizationDetailEffectSettingComponent implements OnInit {
  private optimizationGroupInfo: any;
  public optimizationId = '';
  constructor(
    private _http: OptimizationService,
    private _message: NzMessageService,
    private router: Router,
    private  route: ActivatedRoute
  ) {
    this.optimizationId = this.route.snapshot.parent.paramMap.get('id');
  }
  public clickSave = false;
  public saveing = false;
  public info = {
    "optimization_name": '' ,
    "optimization_setting": {
      'optimization_target': 1, //优化目标
      'constraint_condition': {
        'condition_key': 1 //约束条件select
        /*'condition_value': 1 // 约束条件input*/
      }
    }

  };

  public iswraing = false;
  public publisherOption = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马'
  };
  public optimizationGoal = [
    {'value': 1, 'name': '利润最大化'},
    {'value': 2, 'name': '转化量最大化'},
    {'value': 3, 'name': '收益最大化'},
    {'value': 4, 'name': '点击数最大化'},
  ];
  public condition = {
    1: [{'value': 1, 'name': '无'}],
    2: [{'value': 2, 'name': '消费不高于'}, {'value': 3, 'name': 'CPA不超过'}],
    3: [{'value': 4, 'name': 'ROI不低于'}, {'value': 2, 'name': '消费不高于'}],
    4: [{'value': 2, 'name': '消费不高于'}],
  };

  public publisherId = 0;
  ngOnInit() {

    //获取优化组信息
    this._http.getOptimizationInfo().subscribe(
      result => {
        if (result) {
          this.optimizationGroupInfo = result;
          this.publisherId = this.optimizationGroupInfo['publisher_id'] * 1;

          this.info.optimization_name = result['optimization_name'];
          this.info.optimization_setting = Object.assign(this.info.optimization_setting, result['optimization_setting']);

        }

      });
  }

  changeOptimizationGoal() {
    this.info.optimization_setting.constraint_condition['condition_key'] = this.condition[this.info.optimization_setting.optimization_target][0]['value'];
    if (this.info.optimization_setting.constraint_condition['condition_key'] === 1) {
      this.info.optimization_setting.constraint_condition['condition_value'] = '';
    }
  }

  _save() {
    this.checkPage();
    if (!this.iswraing) {
      if ( !this.saveing) {
        this.saveing = true;
        this._http.heightSetting(this.optimizationId, this.info).subscribe(
          (result: any) => {
            if (result.status_code === 200 ) {
              this.saveing = false;
              this._message.success("操作成功");
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
    } else {
      this.clickSave = true;
    }

  }
  checkPage() {

    if (!this.info.optimization_name) {
      this.iswraing = true;
    } else if (this.info.optimization_setting.constraint_condition.condition_key !== 1) {
      if (!this.info.optimization_setting.constraint_condition['condition_value']) {
        this.iswraing = true;
      }
    }

  }
}
