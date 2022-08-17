import { Component, OnInit, Input } from '@angular/core';
import {ManageService} from "../../service/manage.service";
import {DefineSettingService} from "../../service/define-setting.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-edit-black-word-creative',
  templateUrl: './edit-black-word-creative.component.html',
  styleUrls: ['./edit-black-word-creative.component.scss']
})
export class EditBlackWordCreativeComponent implements OnInit {
  @Input() set data(value: any) {
    const data = JSON.parse(JSON.stringify(value));
    this.params = {...data['params']};
    this.body = {...data['postBody']};
  }

  public body;
  public params;

  public defaultData = {
    "is_edit": true,
    "batch_item_type": 4,
    "modify_type": 1,
    "search": null,
    "value": null,
    "value1": "",
    "value2": ""
  };

  public submitting = false;


  constructor(private manageService: ManageService,
              private message: NzMessageService,
              private defineSettingService: DefineSettingService,
              private modalSubject: NzModalRef) {

  }

  ngOnInit() {
  }

  modifyTypeChange() {
    this.defaultData.search = null;
    this.defaultData.value = null;
    this.defaultData.value1 = null;
    this.defaultData.value2 = null;
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {

    if (this.defaultData.modify_type === 1) {
      if (!this.defaultData.search) {
        this.message.error('查找不能为空');
        return false;
      }

      if (!this.defaultData.value) {
        this.message.error('替换不能为空');
        return false;
      }
    } else if (this.defaultData.modify_type === 4) {
      if (!this.defaultData.value) {
        this.message.error('标题不能为空');
        return false;
      }
      if (!this.defaultData.value1) {
        this.message.error('描述1不能为空');
        return false;
      }
      if (!this.defaultData.value2) {
        this.message.error('描述2不能为空');
        return false;
      }
    }



    this.submitting = true;

    this.body['batch_update_item'] = {...this.defaultData};
    this.manageService.editCreative(this.body, this.params).subscribe(data => {
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
