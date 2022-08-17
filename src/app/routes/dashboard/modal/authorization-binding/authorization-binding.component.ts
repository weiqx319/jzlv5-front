import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {DashboardService} from "../../service/dashboard.service";
import {AuthService} from "../../../../core/service/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-authorization-binding',
  templateUrl: './authorization-binding.component.html',
  styleUrls: ['./authorization-binding.component.scss']
})

export class AuthorizationBindingComponent implements OnInit {

  public publisherOption = {
    1: '百度',
    2: '搜狗',
    3: '360',
    4: '神马'
  };
  public adverList: any;
  public parm = {
    'is_oauth': 1,
    'cid': 1,
    'publisher_id': 1,
    'pub_account_id': 111,
    'pub_account_name': "111"
  };
  public accountInfo = {};

  constructor(private fb: FormBuilder,
              private _message: NzMessageService,
              private dashboardService: DashboardService,
              private subject: NzModalRef,
              private authService: AuthService,
              private router: Router) {}


  ngOnInit() {
    const oauth_local = JSON.parse(localStorage.getItem('oauth_local'));
    this.dashboardService.getAccountInfo(oauth_local['oauth_code']).subscribe(
      (result) => {
        if (result.status_code === 200) {
          this.accountInfo = result['data'];
          this.parm.pub_account_id = this.accountInfo['pub_account_id'];
          this.parm.pub_account_name = this.accountInfo['pub_account_name'];
          this.parm.publisher_id = this.accountInfo['publisher_id'];
        }
      }
    );

    //得到广告主列表
    const userInfo = this.authService.getCurrentUser();
    userInfo['user_list'].forEach((item) => {
      if (userInfo['user_id'] === item['user_id']) {
        this.adverList = item['ad_list'];
        if (this.adverList && this.adverList.length) {
          this.parm.cid = this.adverList[0]['cid'];
        }
      }
    });

  }

  sureBinding() {
    localStorage.removeItem('oauth_local');
    this.dashboardService.authorizationBinding(this.parm).subscribe(
      (result) => {
        if (result['code'] === 200) {
          this._message.success('绑定成功');
          this.router.navigateByUrl( 'manage/account_binding');
        }
      }
    );

    this.subject.destroy({
      status: 'Ok',
    });


  }

  cancelForm() {
    localStorage.removeItem('oauth_local');
    this.subject.destroy({
      status: 'Ok',
    });

  }
  sureContack() {
    this.subject.destroy({
      status: 'Ok',
    });
    localStorage.removeItem('oauth_local');
  }
}





