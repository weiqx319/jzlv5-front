import { Component, OnInit, Input } from '@angular/core';
import {ManageService} from "../../service/manage.service";
import {DefineSettingService} from "../../service/define-setting.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-add-black-word',
  templateUrl: './add-black-word.component.html',
  styleUrls: ['./add-black-word.component.scss']
})
export class AddBlackWordComponent implements OnInit {

  @Input() set groupData(value: any) {
    const data = JSON.parse(JSON.stringify(value));
    this.defaultData.publisher_id = data.publisher_id;
  }

  public defaultData = {
    'publisher_id': null,
    'apply_level': 0,
    'word_name': [],
  };

  public groupName;

  public wordName = '';

  public submitting = false;


  constructor(private manageService: ManageService,
              private message: NzMessageService,
              private defineSettingService: DefineSettingService,
              private modalSubject: NzModalRef) {

  }

  ngOnInit() {
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {

    if (!this.wordName) {
      this.message.error('请填写否词');
      return false;
    }

    this.defaultData.word_name = this.wordName.split(/[(\r\n)\r\n]+/); // 根据换行或者回车进行识别

    this.submitting = true;

    this.manageService.createBlackWord(this.defaultData).subscribe(data => {
      if (data['status_code'] && data.status_code === 200) {
        this.message.success(data.message);
        this.modalSubject.destroy('onOk');
      } else if (data['status_code'] && data.status_code === 401) {
        this.message.error('您没权限对此操作！');
        this.doCancel();
      } else if (data['status_code'] && data.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else if (data['status_code'] && data.status_code === 205) {

      } else {
        this.message.error(data.message);
      }
    }, (err) => {

      this.message.error('系统异常，请重试');
    }, () => {
      this.submitting = false;
    });
  }

}
