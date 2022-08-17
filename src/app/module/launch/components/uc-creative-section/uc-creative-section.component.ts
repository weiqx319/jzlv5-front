import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { UploadImageMaterialsComponent } from "../../../../routes/materials/modal/upload-image-materials/upload-image-materials.component";
import { MaterialLibraryImageComponent } from "../../../../routes/materials/modal/material-library-image/material-library-image.component";
import { isArray } from "@jzl/jzl-util";
import { environment } from "../../../../../environments/environment";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { AuthService } from "../../../../core/service/auth.service";

@Component({
  selector: 'app-uc-creative-section',
  templateUrl: './uc-creative-section.component.html',
  styleUrls: ['./uc-creative-section.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UcCreativeSectionComponent implements OnInit {

  @Input() structConfig;
  @Input() materialType;
  @Input() data;
  @Input() adgroup;
  @Input() errorTip;
  @Input() account;

  public getSouceLength = 0;

  public cid;

  public inputValue = '';

  public selectNum = "";

  constructor(private modalService: NzModalService, private authService: AuthService, private message: NzMessageService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.data.style = this.materialType;
  }

  uploadMaterials() {
    const add_modal = this.modalService.create({
      nzTitle: '上传头像',
      nzWidth: 800,
      nzContent: UploadImageMaterialsComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'upload-video-materials',
      nzFooter: null,
      nzComponentParams: {
        type: 'logo',
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
      }
    });
  }

  addMaterials(type = 'materials', data?) {
    // let cssType;
    // if(this.materialType === 1 || this.materialType === 2 || this.materialType === 4) {
    //   this.materialType === 1 ? cssType = '2' : this.materialType === 2 ? cssType = '3' : cssType = '4';
    // }
    const add_modal = this.modalService.create({
      nzTitle: '素材库',
      nzWidth: 1000,
      nzContent: MaterialLibraryImageComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        css_type: 1,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result !== 'onCancel') {
        if (type == 'userImage') {
          const selectImage = JSON.parse(JSON.stringify(result));

          if (isArray(selectImage) && selectImage.length > 0) {
            this.data.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/image_material/image/' + selectImage[0]['material_id'] + '?&cid=' + this.cid;
            this.data.logo_image_id = selectImage[0]['material_id'];
          }
        }
      }
    });
  }

  souceNameChange(data) {
    this.getSouceLength = data.source.length;
  }

  AddTags() {
    let dataValid = true;
    const inputValueAry = this.inputValue.split(/\s+/g); // 根据换行或者回车进行识别

    inputValueAry.forEach((item, idx) => {
      if (item.length > 10) {
        dataValid = false;
      }
      if (!item) {
        inputValueAry.splice(idx, 1);
      }
    });

    if (!dataValid) {
      this.message.error('每个标签不超过10个字');
      return false;
    }

    if ((this.data.label.length + inputValueAry.length) > 20) {
      this.message.error('最多20个标签');
      return false;
    }

    inputValueAry.forEach(item => {
      if (item.length && this.data.label.indexOf(item) === -1) {
        this.data.label.push(item);
      }
    });
    this.inputValue = '';
  }

  deleteTag(index) {
    this.data.label.splice(index, 1);
  }

  clearTags() {
    this.data.label = [];
  }

  changeHidden() {
    this.data.isHiddenSelect = !this.data.isHiddenSelect;
  }

}
