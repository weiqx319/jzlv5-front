import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import {ManageService} from "../../service/manage.service";
import {CustomDatasService} from "../../../../shared/service/custom-datas.service";

@Component({
  selector: 'app-advert-form',
  templateUrl: './advert-form.component.html',
  styleUrls: ['./advert-form.component.scss']
})
export class AdvertFormComponent implements OnInit {

  validateAdvertForm: FormGroup;

  advert_setting: any;
  @Input() set setting(data: any) {
    this.advert_setting = data;
  }

  @Input() cid = 0;

  jobs = [
    {job_id: 1, job_name: '教育'},
    {job_id: 2, job_name: '互联网'},
    {job_id: 3, job_name: '医疗'},
    {job_id: 4, job_name: '游戏'},
    {job_id: 6, job_name: '招商'},
    {job_id: 7, job_name: '房地产'},
    {job_id: 5, job_name: '其它'}
  ];
  public advertiserList = [];
  public tradeList=[];
  constructor(private fb: FormBuilder,
              private message: NzMessageService,
              private manageService: ManageService,
              private customDatasService:CustomDatasService,
              private subject: NzModalRef) { }

  loading = false;
  avatarUrl: string;

  beforeUpload = (file: File) => {
    const isJpgPng = ['image/png', 'image/jpeg'].indexOf(file.type) > -1;
    if (!isJpgPng) {
      this.message.error('只能上传.jpg/.png格式的图片!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.message.error('图片大小需小于2M!');
    }
    return isJpgPng && isLt2M;
  }

  private getBase64(img: File, callback: (img: any) => void) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  handleChange(info: { file: NzUploadFile }) {
    if (info.file.status === 'uploading') {
      this.loading = true;
      return;
    }
    if (info.file.status === 'done') {
      this.getBase64(info.file.originFileObj, (img: any) => {
        this.loading = false;
        this.avatarUrl = img;
      });
    }
  }

  cancel() {
    this.subject.destroy('onCancel');
  }

  doAdd() {
    if (this.cid > 0) {
      const advertiserSetting = {cid: this.cid, ...this.advert_setting};
      this.manageService.updateAdvertiser(this.cid, advertiserSetting).subscribe(data => {
        if (data['status_code'] && data.status_code === 200) {
          this.message.success('保存成功');
          this.subject.destroy('onOk');
        } else if (data['status_code'] && data.status_code === 201) {
          this.message.error('广告主名称已经存在，请重试');
        } else if (data['status_code'] && data.status_code === 401) {
          this.message.error('您没权限对此操作！');
          this.cancel();
        } else if (data['status_code'] && data.status_code === 404) {
          this.message.error('API未实现，找言十！');
        } else if (data['status_code'] && data.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(data.message);
        }
      }, (err) => {
        this.message.error('系统异常，请重试');
      });
    } else {
      this.manageService.createAdvertiser(this.advert_setting).subscribe(data => {
        if (data['status_code'] && data.status_code === 200) {
          this.message.success('保存成功');
          this.subject.destroy('onOk');
        } else if (data['status_code'] && data.status_code === 201) {
          this.message.error('广告主名称已经存在，请重试');
        } else if (data['status_code'] && data.status_code === 401) {
          this.message.error('您没权限对此操作！');
          this.cancel();
        } else if (data['status_code'] && data.status_code === 404) {
          this.message.error('API未实现，找言十！');
        } else if (data['status_code'] && data.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(data.message);
        }
      }, (err) => {
        this.message.error('系统异常，请重试');
      });
    }
  }
  getAdvertiserList() {
    this.manageService.getAdvertiserList({}, {result_model: 'all', need_publish_account: 0}).subscribe(result => {
        if (result['status_code'] && result.status_code === 200) {
          result['data'].forEach((item) => {
            this.advertiserList.push({
              'name' : item.advertiser_name,
              'key' : item.cid
            });
          });
        } else if (result['status_code'] && result.status_code === 201) {
          this.message.error('广告主名称已经存在，请重试');
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(result.message);
        }
      }, (err) => {
        this.message.error('系统异常，请重试');
      }
    );
  }
  ngOnInit() {
    this.tradeList=this.customDatasService.tradeArray;
    this.getAdvertiserList();
    this.validateAdvertForm = this.fb.group({
      advertiser_name: ['', [Validators.required]],
      web_domain: ['', [Validators.required]],
      advertiser_type: ['', [Validators.required]],
      advertiser_info: [''],
      department: ['']
    });
  }

  getFormControl(name) {
    return this.validateAdvertForm.controls[ name ];
  }

}
