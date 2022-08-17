import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LocalStorageService } from 'ngx-webstorage';
import { ManageItemService } from '../../../../service/manage-item.service';
import { ManageService } from '../../../../service/manage.service';

import { Store } from '@ngrx/store';
import { differenceInCalendarDays, format, subDays } from 'date-fns';
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { AuthService } from '../../../../../../core/service/auth.service';
import { AppState } from '../../../../../../core/store/app.state';
import { NotifyService } from '../../../../../../module/notify/notify.service';
import { TaskDetailComponent } from '../../../../modal/task-detail/task-detail.component';

@Component({
  selector: 'app-task-log',
  templateUrl: './task-log.component.html',
  styleUrls: ['./task-log.component.scss'],
})
export class TaskLogComponent implements OnInit {
  @ViewChild('taskDetail') taskDetailCom: TaskDetailComponent;
  public sectionTabList = [
    { title: '任务列表', type: 'list', url: '/manage/log/task_log/list' },
    { title: '定时任务列表', type: 'list_cron', url: '/manage/log/task_log/list_cron' },
    { title: '任务明细', type: 'detail', url: '/manage/log/task_log/detail' },
  ];

  authState$ = this.store$.select((s) => s.auth);
  constructor(
    private manageService: ManageService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private notifyService: NotifyService,
    private authService: AuthService,
    private store$: Store<AppState>,
    private localSt: LocalStorageService,
  ) {

  }
  ngOnInit() {
    
  }

}

