import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {AuthService} from "../../../../core/service/auth.service";
import {MenuService} from "../../../../core/service/menu.service";
import {MaterialsManageService} from "../../service/materials-manage.service";

@Component({
  selector: 'app-add-material-manage-author',
  templateUrl: './add-material-manage-author.component.html',
  styleUrls: ['./add-material-manage-author.component.scss']
})
export class AddMaterialManageAuthorComponent implements OnInit {

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
    private authService: AuthService,
    private menuService: MenuService,
    public materialsManageService: MaterialsManageService,
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
    if (this.defaultData.material_author_id) {
      this.materialsManageService.getMaterialsAuthorDetail(this.defaultData.material_author_id,{cid: this.cid,publisher_id:this.publisher_id}).subscribe(result => {
        if (result.status_code && result.status_code === 200) {
        } else {
          this.message.error(result.message);
        }
      }, err => {
      });
    }
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    if (!this.submit) {
      this.submit = true;
      if (this.defaultData.material_author_id) {
        this.roleList.forEach(item=> {
          if (item.key===this.defaultData.material_author_role) {
            this.defaultData.material_author_role_name=item.name;
          }
        });
        const body = this.defaultData;
        this.materialsManageService.updateMaterialsAuthor(this.defaultData.material_author_id, body, {cid: this.cid,publisher_id:this.publisher_id}).subscribe(result => {
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
        this.materialsManageService.addMaterialsAuthor(body, {cid: this.cid,publisher_id:this.publisher_id}).subscribe(result => {
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
