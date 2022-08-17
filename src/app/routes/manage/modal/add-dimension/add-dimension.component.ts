import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {ManageService} from "../../service/manage.service";
import {DefineSettingService} from "../../service/define-setting.service";

@Component({
  selector: 'app-add-dimension',
  templateUrl: './add-dimension.component.html',
  styleUrls: ['./add-dimension.component.scss']
})
export class AddDimensionComponent implements OnInit {
  dimensionForm: FormGroup;


  @Input() set dimData(data: any) {
    this.dimensionSetting = Object.assign(this.dimensionSetting, {dimension_name: data['dimension_name'], cid: data['cid'], dimension_desc: data['dimension_desc']});
  }

  @Input() dimDataId = 0;


  public advertiserList = [];
  public dimensionSetting = {
    'dimension_name': '',
    'cid': null,
    'dimension_desc': '',
  };
  public submitting = false;

  constructor(private fb: FormBuilder,
              private manageService: ManageService,
              private message: NzMessageService,
              private defineSettingService: DefineSettingService,
              private modalSubject: NzModalRef) {
    this.dimensionForm = this.fb.group({
      dim_name: ['', [Validators.required]],
      cid: [0, [Validators.required]],
      dim_comment: ['']
    });

  }

  ngOnInit() {
    this.manageService.getAdvertiserList({}, {result_model: 'all', need_publish_account: 0}).subscribe(result => {
      if (result['status_code'] && result.status_code === 200) {
        this.advertiserList = result['data'];
        if (this.advertiserList.length === 1) {
          this.dimensionSetting.cid = this.advertiserList[0]['cid'];
        }
      } else if (result['status_code'] && result.status_code === 401) {
        this.message.error('您没权限对此操作！');
        this.doCancel();
      } else if (result['status_code'] && result.status_code === 500) {
        this.message.error('系统异常，请重试');
      } else if (result['status_code'] && result.status_code === 205) {
        this.message.error('无广告主！');
        this.doCancel();
      } else {
        this.message.error(result.message);
      }
    }, (err) => {
      this.message.error('系统异常，请重试');
    });
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {

    let resultDim = {
      'dimension_name': '',
      'cid': 0,
      'dimension_desc': '',
    };
    resultDim = Object.assign(resultDim, this.dimensionSetting);
    if (resultDim.cid < 1) {
      this.message.error('请选择广告主');
      return false;
    }
    if (resultDim.dimension_name === '') {
      this.message.error('请填写名称');
      return false;
    }
    this.submitting = true;
    if (this.dimDataId > 0) {
      this.defineSettingService.updateDim(this.dimDataId, resultDim).subscribe(data => {
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
      this.defineSettingService.createDim(resultDim).subscribe(data => {
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
    return this.dimensionForm.controls[ name ];
  }

}
