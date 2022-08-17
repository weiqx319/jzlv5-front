import {Component, Input, OnInit} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {AuthService} from "../../../../core/service/auth.service";
import {CustomDatasService} from "../../../../shared/service/custom-datas.service";
import {MaterialsService} from "../../service/materials.service";

@Component({
  selector: 'app-add-document-group',
  templateUrl: './add-document-group.component.html',
  styleUrls: ['./add-document-group.component.scss']
})
export class AddDocumentGroupComponent implements OnInit {

  @Input() set data(value) {
    this.defaultData = JSON.parse(JSON.stringify(value));
    this.isEdit = true;
  }

  public defaultData = {
    publisher_id: 7,
    title_group_name: null, // 分组名称
  };

  public isEdit = false;

  public publisherList = [
    { key: 7, name: '头条' },
  ];

  public submit = false;
  public cid;

  constructor(
    private message: NzMessageService,
    private modalSubject: NzModalRef,
    private authService: AuthService,
    private customDataService: CustomDatasService,
    private materialsService: MaterialsService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;

  }

  ngOnInit() {
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    if (!this.defaultData.title_group_name) {
      this.message.error('请输入文案组名称');
      return false;
    }

    if (!this.submit) {
      this.submit = true;
      const body = this.defaultData;
      // this.materialsService.addMaterialsAuthor(body, {cid: this.cid}).subscribe(result => {
      //   this.submit = false;
      //   if (result.status_code && result.status_code === 200) {
      //     this.message.success('操作成功');
      //     this.modalSubject.destroy('onOk');
      //   } else if (result.status_code && result.status_code === 205) {
      //
      //   } else {
      //     this.message.error(result.message);
      //   }
      //
      // }, err => {
      //   this.submit = false;
      // });
    }
  }

}
