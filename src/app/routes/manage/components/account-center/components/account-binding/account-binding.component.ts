import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AccountBindingModalComponent } from "../../../../modal/account-binding-modal/account-binding-modal.component";
import { ManageItemService } from "../../../../service/manage-item.service";
import { ManageService } from "../../../../service/manage.service";

import { Store } from "@ngrx/store";
import { isArray, isNumber, isObject, isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../../../core/service/auth.service";
import { AppState } from "../../../../../../core/store/app.state";
import { NotifyService } from "../../../../../../module/notify/notify.service";
import { CustomDatasService } from "../../../../../../shared/service/custom-datas.service";
import { AccountBindingChannelNoAccountComponent } from "../../../../modal/account-binding-channel-no-account/account-binding-channel-no-account.component";
import { AccountBindingMultiChannelComponent } from "../../../../modal/account-binding-multi-channel/account-binding-multi-channel.component";
import { AccountBindingSetPasswordComponent } from "../../../../modal/account-binding-set-password/account-binding-set-password.component";
import { AccountBindingUploadCompensateComponent } from "../../../../modal/account-binding-upload-compensate/account-binding-upload-compensate.component";
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

import { differenceInCalendarDays, format } from "date-fns";
import { formatDate } from "@jzl/jzl-util";
import { DefineSettingService } from "../../../../service/define-setting.service";

@Component({
  selector: 'app-account-binding',
  templateUrl: './account-binding.component.html',
  styleUrls: ['./account-binding.component.scss'],
})
export class AccountBindingComponent implements OnInit {

  public sectionTabList = [
    { title: '媒体账户', type: 'hasAccount',url:'/manage/account/account_binding/account'},
    { title: '虚拟账户', type: 'virtualAccount',url:'/manage/account/account_binding/virtual_account' },
    { title: '赔付消耗/媒体返货', type: 'compensateAccount' ,url:'/manage/account/account_binding/compensate_account'},
    { title: '赔付消耗/媒体返货上传记录', type: 'compensateLog',url:'/manage/account/account_binding/compensate_log' },
  ];
  constructor() {

  }

  ngOnInit(): void {

  }
  changeTabItem(data){

  }
}


