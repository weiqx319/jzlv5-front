import { Component, OnInit, Input } from '@angular/core';
import {ManageService} from "../../service/manage.service";
import {DefineSettingService} from "../../service/define-setting.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-add-negative-word-group',
  templateUrl: './add-negative-word-group.component.html',
  styleUrls: ['./add-negative-word-group.component.scss']
})
export class AddNegativeWordGroupComponent implements OnInit {

  @Input() set groupData(value: any) {
    const data = JSON.parse(JSON.stringify(value));

    // 回写适用媒体
    // data.available_media = JSON.parse(value.available_media);
    // this.availableMedia.forEach(item => {
    //   if (data.available_media.includes(item.value)) {
    //     item.checked = true;
    //   }
    // });
    this.defaultData = Object.assign(this.defaultData, data);

  }

  public advertiserList = [];
  public defaultData = {
    'group_name': '',
    // 'available_media': [],
    'remark': '',
  };

  public availableMedia: any = [
    { label: '百度', value: '1_1' },
    { label: '搜狗', value: '1_2' },
    { label: '360', value: '1_3' },
    { label: '神马', value: '1_4' },
  ];
  public submitting = false;

  constructor(
              private manageService: ManageService,
              private message: NzMessageService,
              private defineSettingService: DefineSettingService,
              private modalSubject: NzModalRef) {

  }

  ngOnInit() {

  }

  // 适用媒体
  // availableMediaChange() {
  //   this.defaultData.available_media = [];
  //   this.availableMedia.forEach( item => {
  //     if (item.checked) {
  //       this.defaultData.available_media.push(item.value);
  //     }
  //   });
  // }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    if (this.defaultData.group_name.length < 1 || this.defaultData.group_name.length > 30) {
      this.message.error('否词包名称应为1-30字');
      return false;
    }

    // if (!this.defaultData.available_media.length) {
    //   this.message.error('请选择适用媒体');
    //   return false;
    // }

    if (this.defaultData.remark && this.defaultData.remark.length > 50) {
      this.message.error('备注说明上限为50字');
      return false;
    }

    this.submitting = true;
    if (this.defaultData['group_id']) {
      this.manageService.updateNegativeWordGroup(this.defaultData).subscribe(data => {
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
    } else {
      this.manageService.createNegativeWordGroup(this.defaultData).subscribe(data => {
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
}
