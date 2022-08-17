import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {OptimizationDetailRankingService} from "../../optimization-detail/service/optimization-detail-ranking.service";

@Component({
  selector: 'app-pause-setting',
  templateUrl: './pause-setting.component.html',
  styleUrls: ['./pause-setting.component.scss'],
  providers: [OptimizationDetailRankingService]
})
export class PauseSettingComponent implements OnInit {

  @Input() postBody: any;
  @Input() optimizationId: any;


  public pause_setting = {
    price_status : 1 //1：保留 2：恢复
  };

  constructor(private fb: FormBuilder,
              private _message: NzMessageService,
              private subject: NzModalRef,
              private _http: OptimizationDetailRankingService) {

  }


  ngOnInit() {

  }

  doSave() {
    this.postBody['price_status'] = this.pause_setting.price_status;
    this._http.stopRanking(this.optimizationId, this.postBody).subscribe((result: any) => {
        if (result.status_code === 200) {
          this._message.success('竞价暂停成功');
          this.subject.destroy('onOk');
        }
      },
      (err: any) => {
        this._message.error('删除失败,请重试');
      },
      () => {
      });

  }

  cancel() {
    this.subject.destroy('onCancel');
  }
}
