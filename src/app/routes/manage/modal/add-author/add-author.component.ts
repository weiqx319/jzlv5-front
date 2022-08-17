import {Component, Input, OnInit} from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {DefineSettingService} from "../../service/define-setting.service";

@Component({
  selector: 'app-add-author',
  templateUrl: './add-author.component.html',
  styleUrls: ['./add-author.component.scss']
})
export class AddAuthorComponent implements OnInit {

  @Input() cid: any;
  @Input() request_id: any;
  @Input() openPage: any;

  public interval$: any;
  public authorTitle = {
    key: 1, //1:等待授权， 2：授权成功  3：授权失败
    name: '等待授权完成'
  };
  constructor(
    private defineSettingService: DefineSettingService,
    private modalSubject: NzModalRef) { }

  ngOnInit() {
    this.interval$ = setInterval(() => {

      //得到时间差：超过3分钟清除定时器
      const diffValue = (this.getCurrentTime() - this.request_id) / 1000 / 60;
      if (diffValue <= 3) {
        this.getConversionStatus({
          cid: this.cid,
          request_id: this.request_id
        });
      } else {
        this.openPage.close();
        this.authorTitle = {
          key: 3,
          name: '添加授权超时'
        };
        clearInterval(this.interval$);
      }

    }, 10000);
  }
  getCurrentTime() {
    return new Date().getTime();
  }
  getConversionStatus(body) {
    this.defineSettingService.getConversionUserStatus(body).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        if (result.data.user_status * 1 === 1) { //0 待授权 1 授权成功 2 授权失败',
          this.openPage.close();
          this.authorTitle = {
            key: 1,
            name: '添加授权成功'
          };
          clearInterval(this.interval$);
          setTimeout(() => {
            this.modalSubject.destroy('ok');
          }, 2000);
        } else if (result.data.user_status * 1 === 2) {
          this.openPage.close();
          this.authorTitle = {
            key: 3,
            name: '添加授权失败'
          };
          clearInterval(this.interval$);
        }

      } else if (result.status_code && result.status_code === 204) {
        //继续请求状态
      } else {
        this.openPage.close();
        this.authorTitle = {
          key: 3,
          name: '添加授权失败'
        };
        clearInterval(this.interval$);
      }
    });
  }
  doCancel() {
    this.modalSubject.destroy('cancel');
  }
}
