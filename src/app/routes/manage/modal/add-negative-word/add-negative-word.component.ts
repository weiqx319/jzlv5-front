import { Component, OnInit, Input } from '@angular/core';
import {ManageService} from "../../service/manage.service";
import {DefineSettingService} from "../../service/define-setting.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-add-negative-word',
  templateUrl: './add-negative-word.component.html',
  styleUrls: ['./add-negative-word.component.scss']
})
export class AddNegativeWordComponent implements OnInit {
  @Input() set groupData(value: any) {
    const data = JSON.parse(JSON.stringify(value));
    this.defaultData.group_id = data.group_id;
    this.groupName = data.group_name;
  }

  public defaultData = {
    'group_id': null,
    'word_type': 1,
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
      this.message.error('请填写黑词');
      return false;
    }

    this.defaultData.word_name = this.wordName.split(/[(\r\n)\r\n]+/); // 根据换行或者回车进行识别

    this.submitting = true;

    this.manageService.createNegativeWord(this.defaultData).subscribe(data => {
      if (data['status_code'] && data.status_code === 200) {
        this.message.success('保存成功');
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
