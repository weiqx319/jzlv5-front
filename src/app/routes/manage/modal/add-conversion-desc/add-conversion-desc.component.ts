import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ManageService } from '../../service/manage.service';
import { DefineSettingService } from '../../service/define-setting.service';
import { isUndefined } from "@jzl/jzl-util";

@Component({
  selector: 'app-add-conversion-desc',
  templateUrl: './add-conversion-desc.component.html',
  styleUrls: ['./add-conversion-desc.component.scss']
})
export class AddConversionDescComponent implements OnInit {
  public formData = {
    desc_name: '',
    cid: '',
    conver_source_type: 1,
    im_push_type: 1
  };
  public submitting = false;
  public conversionSourceType = []; //数据来源
  public conversionImType = []; //推送方式
  @Input() conversionDescId;
  @Input()
  set conversionDesc(data) {
    this.formData.conver_source_type = data.conver_source_type;
    this.formData.im_push_type = data.im_push_type;
    this.formData.cid = data.cid;
    this.formData.desc_name = data.desc_name;
  }
  validateForm: FormGroup;
  public advertiserList = [];

  constructor(
    private fb: FormBuilder,
    private defineSettingService: DefineSettingService,
    private message: NzMessageService,
    private modalSubject: NzModalRef,
    private manageService: ManageService
  ) {
    this.conversionSourceType = this.manageService.getConversionSourceTypeItems();
    this.conversionImType = this.manageService.getConversionImTypeItems();
  }

  ngOnInit() {
    this.getAdvertiserList();
    this.validateForm = this.fb.group({
      conver_source_type: [''],
      im_push_type: [''],
      cid: [''],
      desc_name: ['']
    });
  }
  getAdvertiserList() {
    this.manageService
      .getAdvertiserList({}, { result_model: 'all', need_publish_account: 0 })
      .subscribe(
        result => {
          if (result['status_code'] && result.status_code === 200) {
            this.advertiserList = result['data'];
            //添加
            if (!this.conversionDescId && this.advertiserList.length) {
              this.formData.cid = this.advertiserList[0]['cid'];
            }
          } else if (result['status_code'] && result.status_code === 201) {
            this.message.error('广告主名称已经存在，请重试');
          } else if (result['status_code'] && result.status_code === 401) {
            this.message.error('您没权限对此操作！');
            this.doCancel();
          } else if (result['status_code'] && result.status_code === 500) {
            this.message.error('系统异常，请重试');
          } else {
            this.message.error(result.message);
          }
        },
        err => {

          this.message.error('系统异常，请重试');
        }
      );
  }
  doCancel() {
    this.modalSubject.destroy('onCancel');
  }
  doSave() {
    this.submitting = true;
    if (this.conversionDescId > 0) {
      this.defineSettingService
        .updateConversionDesc(this.conversionDescId, this.formData)
        .subscribe(
          data => {
            if (data['status_code'] && data.status_code === 200) {
              this.message.success('保存成功');
              this.modalSubject.destroy('onOk');
            } else if (data['status_code'] && data.status_code === 201) {
              this.message.error('广告主名称已经存在，请重试');
            } else if (data['status_code'] && data.status_code === 401) {
              this.message.error('您没权限对此操作！');
              this.doCancel();
            } else if (data['status_code'] && data.status_code === 500) {
              this.message.error('系统异常，请重试');
            } else {
              this.message.error(data.message);
            }
          },
          err => {

            this.message.error('系统异常，请重试');
          },
          () => {
            this.submitting = false;
          }
        );
    } else {
      this.defineSettingService.createConversionDesc(this.formData).subscribe(
        data => {
          if (data['status_code'] && data.status_code === 200) {
            this.message.success('保存成功');
            this.modalSubject.destroy('onOk');
          } else if (data['status_code'] && data.status_code === 201) {
            this.message.error('广告主名称已经存在，请重试');
          } else if (data['status_code'] && data.status_code === 401) {
            this.message.error('您没权限对此操作！');
            this.doCancel();
          } else if (data['status_code'] && data.status_code === 500) {
            this.message.error('系统异常，请重试');
          } else {
            this.message.error(data.message);
          }
        },
        err => {
          this.message.error('系统异常，请重试');
        },
        () => {
          this.submitting = false;
        }
      );
    }
  }
}
