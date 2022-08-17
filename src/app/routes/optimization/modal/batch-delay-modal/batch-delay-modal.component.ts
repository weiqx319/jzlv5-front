import { Component, Input, OnInit } from '@angular/core';
import { isNumber } from "@jzl/jzl-util";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { OptimizationDetailRankingService } from "../../optimization-detail/service/optimization-detail-ranking.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { AuthService } from "../../../../core/service/auth.service";

@Component({
  selector: 'app-batch-delay-modal',
  templateUrl: './batch-delay-modal.component.html',
  styleUrls: ['./batch-delay-modal.component.scss'],
  providers: [OptimizationDetailRankingService]
})
export class BatchDelayModalComponent implements OnInit {

  public optimization_keywordData = {
    start_time: '',
    end_time: ''
  };

  public iswraing = false;
  public idsArray = [];

  @Input() parentData: any;
  constructor(
    private optimizationDetailRankingService: OptimizationDetailRankingService,
    private modalSubject: NzModalRef,
    private notifyService: NotifyService,
    private authService: AuthService,
    private message: NzMessageService) { }

  ngOnInit() {
    //初始化日期
    this.optimization_keywordData.start_time = this.getNowTime();
    this.optimization_keywordData.end_time = this.getNowTime(6);


    if (this.parentData.selected_type === 'current') {
      this.parentData['selected_data'].forEach(item => {
        this.idsArray.push(item['optimization_id']);
      });
    }
  }
  check() {
    if (!this.optimization_keywordData.start_time || !this.optimization_keywordData.end_time) {
      this.iswraing = true;
    }
  }
  cancel() {
    this.modalSubject.destroy('onCancel');

  }
  sure() {
    this.check();
    if (!this.iswraing) {

      const notifyData: any[] = [];
      const userOperdInfo = this.authService.getCurrentUserOperdInfo();
      const optimizationData = this.getOptimizationData(this.optimization_keywordData, this.parentData.selected_type);

      this.optimizationDetailRankingService.updateRankingDetailDate(optimizationData).subscribe(
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

  getOptimizationData(data, selectType) {
    const model = {
      "ranking_setting": {
      },
      "ranking_details": {}
    };

    model['ranking_setting']['ranking_beg_date'] = data['start_time'];
    model['ranking_setting']['ranking_end_date'] = data['end_time'];

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
  onChangeStart(result: Date): void {
    const afterTime = this.getNowTime(result);
    this.optimization_keywordData.start_time = afterTime;
  }
  onChangeEnd(result: Date): void {
    const afterTime = this.getNowTime(result);
    this.optimization_keywordData.end_time = afterTime;
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
}
