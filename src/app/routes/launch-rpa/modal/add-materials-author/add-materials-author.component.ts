import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {MaterialsService} from "../../service/materials.service";
import {AuthService} from "../../../../core/service/auth.service";
import {MenuService} from "../../../../core/service/menu.service";

@Component({
  selector: 'app-add-materials-author',
  templateUrl: './add-materials-author.component.html',
  styleUrls: ['./add-materials-author.component.scss']
})
export class AddMaterialsAuthorComponent implements OnInit {

  validateForm: FormGroup;

  @Input() set data(value) {
    this.defaultData = JSON.parse(JSON.stringify(value));
  }

  public defaultData: any = {
    material_author_name: null,
    material_author_role: null,
    comments: null,
  };

  public roleList = [
    { key: '1', name: '编导' },
    { key: '2', name: '摄影' },
    { key: '3', name: '剪辑' },
  ];

  public submit = false;
  public cid;

  public publisher_id;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private modalSubject: NzModalRef,
    private materialsService: MaterialsService,
    private authService: AuthService,
    public menuService: MenuService,
  ) {


    this.publisher_id = this.menuService.currentPublisherId;

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;

    this.validateForm = this.fb.group({
      material_author_name: ['', [Validators.required]],
      material_author_role: ['', [Validators.required]],
      comments: [''],
    });
  }

  ngOnInit() {
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    if (!this.submit) {
      this.submit = true;
      if (this.defaultData.material_author_id) {
        const body = this.defaultData;
        this.materialsService.updateMaterialsAuthor(this.defaultData.material_author_id, body, {cid: this.cid,publisher_id:this.publisher_id}).subscribe(result => {
          this.submit = false;
          if (result.status_code && result.status_code === 200) {
            this.message.success('操作成功');
            this.modalSubject.destroy('onOk');
          } else if (result.status_code && result.status_code === 205) {

          } else {
            this.message.error(result.message);
          }

        }, err => {
          this.submit = false;
        });
      } else {
        const body = this.defaultData;
        this.materialsService.addMaterialsAuthor(body, {cid: this.cid,publisher_id:this.publisher_id}).subscribe(result => {
          this.submit = false;
          if (result.status_code && result.status_code === 200) {
            this.message.success('操作成功');
            this.modalSubject.destroy('onOk');
          } else if (result.status_code && result.status_code === 205) {

          } else {
            this.message.error(result.message);
          }

        }, err => {
          this.submit = false;
        });
      }
    }
  }

  getFormControl(name) {
    return this.validateForm.controls[name];
  }

}
