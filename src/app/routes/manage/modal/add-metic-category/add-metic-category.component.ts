import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { DefineSettingService } from '../../service/define-setting.service';

@Component({
  selector: 'app-add-metic-category',
  templateUrl: './add-metic-category.component.html',
  styleUrls: ['./add-metic-category.component.scss']
})
export class AddMeticCategoryComponent implements OnInit {
  @Input() metricCategoryData;

  public categoryName = '';
  public saveBtnLoading = false;

  constructor(
    private modalSubject: NzModalRef,
    private message: NzMessageService,
    private defineSettingService: DefineSettingService,
  ) { }

  ngOnInit(): void {
    // 是否是编辑
    if (this.metricCategoryData) {
      this.categoryName = this.metricCategoryData.category_name;
    }
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    if (this.categoryName.trim() === '') {
      this.message.warning('请填写分类名称');
    } else {
      // 提交按钮置为loading
      this.saveBtnLoading = true;

      if (this.metricCategoryData) {
        // 编辑
        const body = { "category_name": this.categoryName, "category_id": this.metricCategoryData.category_id };
        this.defineSettingService.updateMetricCategory(body).subscribe(data => {
          if (data['status_code'] && data.status_code === 200) {
            this.message.success('修改成功');
            this.modalSubject.destroy('onOk');
          } else {
            this.message.error(data.message);
          }
        },
          err => {
            this.message.error('系统异常，请重试');
          },
          () => {
            this.saveBtnLoading = false;
          }
        );
      } else {
        // 添加
        const body = { "category_name": this.categoryName };
        this.defineSettingService.addMetricCategory(body).subscribe(
          data => {
            if (data['status_code'] && data.status_code === 200) {
              this.message.success('添加成功');
              this.modalSubject.destroy('onOk');
            } else {
              this.message.error(data.message);
            }
          },
          err => {
            this.message.error('系统异常，请重试');
          },
          () => {
            this.saveBtnLoading = false;
          }
        );
      }
    }
  }
}
