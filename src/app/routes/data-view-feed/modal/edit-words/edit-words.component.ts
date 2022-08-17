import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DataViewAddEditService} from '../../service/data-view-add-edit.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {AuthService} from '../../../../core/service/auth.service';
import {NotifyService} from '../../../../module/notify/notify.service';
import {DataViewService} from '../../service/data-view.service';
import {DataViewEditWrapService} from '../../service/data-view-edit-wrap.service';

@Component({
  selector: 'app-edit-words',
  templateUrl: './edit-words.component.html',
  styleUrls: ['./edit-words.component.scss']
})
export class EditWordsComponent implements OnInit {
  @Input() stringIdArray: any;
  @Input() selectData: any;
  @Input() publisherId = 1;
  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _http: DataViewAddEditService,
    private message: NzMessageService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private modalService: NzModalService,
    private dataViewService:DataViewService,
    private dataViewWrapService:DataViewEditWrapService,
  ) {

  }

  ngOnInit(): void {
  }

  save_state(event) {
    this.is_saving.emit(event);
  }


}
