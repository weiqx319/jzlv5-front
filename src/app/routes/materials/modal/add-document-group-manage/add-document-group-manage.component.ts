import {Component, Input, OnInit} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {AuthService} from "../../../../core/service/auth.service";
import {CustomDatasService} from "../../../../shared/service/custom-datas.service";
import {MaterialsService} from "../../service/materials.service";

@Component({
  selector: 'app-add-document-group-manage',
  templateUrl: './add-document-group-manage.component.html',
  styleUrls: ['./add-document-group-manage.component.scss']
})
export class AddDocumentGroupManageComponent implements OnInit {
  @Input() set data(value) {
    this.defaultData.documents = JSON.parse(JSON.stringify(value));


  }

  public defaultData: any = {
    publisher_id: 7,
    document_group_slt: 0,
    title_group_id: null, // 分组id
    title_group_name: null, // 分组名称
    documents: [],
  };

  public publisherList = [
    { key: 7, name: '头条' },
  ];

  public documentGroupList = [];

  public cid;
  public submit = false;

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

  removeItem(index) {
    this.defaultData.documents.splice(index, 1);
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    if (this.defaultData.document_group_slt === 0 && !this.defaultData.title_group_name) {
      this.message.error('请输入文案组名称');
      return false;
    }

    if (this.defaultData.document_group_slt === 1 && !this.defaultData.title_group_id) {
      this.message.error('请选择文案组');
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
