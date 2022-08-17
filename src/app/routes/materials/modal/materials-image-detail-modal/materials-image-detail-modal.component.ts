import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {MenuService} from "../../../../core/service/menu.service";
import {MaterialsService} from "../../service/materials.service";
import {AuthService} from "../../../../core/service/auth.service";
import {environment} from "../../../../../environments/environment";
import {format} from "date-fns";

@Component({
  selector: 'app-materials-detail-modal',
  templateUrl: './materials-image-modal.component.html',
  styleUrls: ['./materials-image-detail-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MaterialsImageDetailModalComponent implements OnInit {

  public materialData:any;
  @Input() set data(value) {
    this.materialId = value.material_id;
    this.materialData = value;
  }

  @Input() publisherId: any;

  public materialId;


  public imgUrl = '';
  public defaultData: any = {};

  public publisher_id;

  public material_make_time_str = '';
  public material_make_time;

  public is_edit = {
    material_make_time: false,
    director: false,
    camerist: false,
    movie_editor: false,
    material_name: false,
    material_tags: false,
  };

  public typesList = [];

  public customReq: any;

  public publisherList = [
    { key: '7', name: '头条'},
  ];

  public authorRole = {
    '1': [],
    '2': [],
    '3': [],
  };
  public choreographerList = [];
  public photographList = [];
  public clipList = [];

  public cid: any;
  public user_id: any;

  public isVertical = false;

  public saveing = false;

  public canEdit = true;

  constructor(
    private message: NzMessageService,
    private menuService: MenuService,
    private modalSubject: NzModalRef,
    private authService: AuthService,
    private materialsService: MaterialsService,) {

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;
    this.publisher_id = this.menuService.currentPublisherId;

  }


  ngOnInit() {
    if (this.publisher_id == 6 && !this.materialId) {
      this.canEdit = false;
      this.imgUrl = this.materialData['preview_url'];
      this.defaultData['image_md5'] = this.materialData['signature'];
      this.defaultData['image_width'] = this.materialData['width'];
      this.defaultData['image_height'] = this.materialData['height'];
      this.defaultData['image_size'] = this.materialData['file_size'];
      if (Number(this.materialData.width) < Number(this.materialData.height)) {
        this.isVertical = true;
      }
    } else {
      this.getMaterialDetail();
    }
  }

  getMaterialDetail() {
    this.materialsService
      .getMaterialImageDetail(this.materialId, {cid: this.cid})
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.material_make_time_str = results['data']['material_make_time'].substring(0, 10);
            this.material_make_time = new Date(results['data']['material_make_time']);
            this.defaultData = results['data'];
            this.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/image_material/image/' + this.defaultData['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid;

            if (Number(this.defaultData.upload_video_width) < Number(this.defaultData.upload_video_height)) {
              this.isVertical = true;
            }

          } else if (results.status_code && results.status_code === 205) {

          } else {
            this.message.error(results.message);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {},
      );
  }

  editStatus(tag) {
    switch (tag) {
      case 'material_make_time':
        this.is_edit.material_make_time = !this.is_edit.material_make_time;
        this.material_make_time_str = format(this.material_make_time, 'yyyy-MM-dd');
        break;
      case 'material_name':
        this.is_edit.material_name = !this.is_edit.material_name;
        break;
      case 'material_tags':
        this.is_edit.material_tags = !this.is_edit.material_tags;
        break;
    }
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    if (!this.defaultData.material_name) {
      this.message.error('请输入名称');
      return false;
    }


    this.defaultData.material_make_time = format(this.material_make_time, 'yyyy-MM-dd');

    if (!this.saveing) {
      this.saveing = true;

      this.materialsService.updateMaterialImageDetail(this.defaultData, {cid: this.cid}).subscribe(data => {
        this.saveing = false;
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
      }, (err) => {
        this.message.error('系统异常，请重试');
        this.saveing = false;
      }, () => {
        this.saveing = false;
      });
    }

  }

}
