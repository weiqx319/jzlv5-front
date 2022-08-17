import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { DefineSettingService } from "../../service/define-setting.service";

@Component({
  selector: 'app-add-company-account-dimension',
  templateUrl: './add-company-account-dimension.component.html',
  styleUrls: ['./add-company-account-dimension.component.scss']
})
export class AddCompanyAccountDimensionComponent implements OnInit {

  dimensionForm: FormGroup;


  @Input() set dimData(data: any) {
    this.dimensionSetting = Object.assign(this.dimensionSetting, { dimension_name: data['dimension_name'], dimension_desc: data['dimension_desc'] });
  }

  @Input() dimDataId = 0;

  public dimensionSetting = {
    'dimension_name': '',
    'dimension_desc': '',
  };
  public submitting = false;

  constructor(private fb: FormBuilder,
              private message: NzMessageService,
              private defineSettingService: DefineSettingService,
              private modalSubject: NzModalRef) {
    this.dimensionForm = this.fb.group({
      dim_name: ['', [Validators.required]],
      dim_comment: ['']
    });

  }

  ngOnInit() {

  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    let resultDim = {
      'dimension_name': '',
      'dimension_desc': '',
    };
    resultDim = Object.assign(resultDim, this.dimensionSetting);
    if (resultDim.dimension_name === '') {
      this.message.error('请填写名称');
      return false;
    }
    this.submitting = true;
    if (this.dimDataId > 0) {
      this.defineSettingService.updateCompanyDim(this.dimDataId, resultDim).subscribe(data => {
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
      this.defineSettingService.createCompanyDim(resultDim).subscribe(data => {
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

  getFormControl(name) {
    return this.dimensionForm.controls[name];
  }
}
