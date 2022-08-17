import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { MenuService } from "../../../../core/service/menu.service";
import { MaterialsService } from "../../service/materials.service";
import { AuthService } from "../../../../core/service/auth.service";
import { environment } from "../../../../../environments/environment";
import { format } from "date-fns";
import { HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";
import { isObject } from "@jzl/jzl-util";
import { formatBytes } from "@jzl/jzl-util";

@Component({
  selector: 'app-materials-detail-modal',
  templateUrl: './materials-detail-modal.component.html',
  styleUrls: ['./materials-detail-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MaterialsDetailModalComponent implements OnInit {

  public materialData: any;
  @Input() set data(value) {
    this.materialId = value.material_id;
    this.materialData = value;
  }

  @Input() publisherId: any;

  public materialId;

  public videoUrl = '';
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

  public publisherList = [
    { key: '7', name: '头条' },
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

  public video_type;

  public config = [];

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
      this.videoUrl = this.materialData['preview_url'];
      this.imgUrl = this.materialData['key_frame_image_url'];
      if (Number(this.materialData.width) < Number(this.materialData.height)) {
        this.isVertical = true;
      }
    } else if (this.publisher_id == 7 && !this.materialId) {
      this.videoUrl = this.materialData['video_id'];
      this.imgUrl = this.materialData['poster_url'];
      if (Number(this.materialData.width) < Number(this.materialData.height)) {
        this.isVertical = true;
      }
    } else {
      this.getMaterialDetail();
    }

    this.getAuthorList();
  }

  getMaterialDetail() {
    this.materialsService
      .getMaterialDetail(this.materialId, { cid: this.cid })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            this.material_make_time_str = results['data']['material_make_time'].substring(0, 10);
            this.material_make_time = new Date(results['data']['material_make_time']);
            this.defaultData = results['data'];
            this.videoUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/video/' + this.defaultData['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid;
            this.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/screenshot/' + this.defaultData['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid + '&last_time=' + this.defaultData.last_modify_time;
            this.video_type = this.defaultData['video_type'];
            if (Number(this.defaultData.upload_video_width) < Number(this.defaultData.upload_video_height)) {
              this.isVertical = true;
            }

            this.getImageSizeList();

          } else if (results.status_code && results.status_code === 205) {

          } else {
            this.message.error(results.message);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  getAuthorList() {
    this.materialsService
      .getMaterialsAuthorList({}, {
        page: 1,
        count: 10000000,
        cid: this.cid
      })
      .subscribe(
        (results: any) => {
          if (results.status_code && results.status_code === 200) {
            const list = results['data']['detail'];
            list.forEach(item => {
              this.authorRole[item.material_author_role].push({
                key: item.material_author_id,
                name: item.material_author_name,
              });
            });

            this.choreographerList = this.authorRole['1'];
            this.photographList = this.authorRole['2'];
            this.clipList = this.authorRole['3'];
          } else if (results.status_code && results.status_code === 205) {

          } else {
            this.message.error(results.message);
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  editStatus(tag) {
    switch (tag) {
      case 'material_make_time':
        this.is_edit.material_make_time = !this.is_edit.material_make_time;
        this.material_make_time_str = format(this.material_make_time, 'yyyy-MM-dd');
        break;
      case 'director':
        this.is_edit.director = !this.is_edit.director;
        break;
      case 'camerist':
        this.is_edit.camerist = !this.is_edit.camerist;
        break;
      case 'movie_editor':
        this.is_edit.movie_editor = !this.is_edit.movie_editor;
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

  beforeUpload = (file: NzUploadFile) => {
    if (!file.type) {
      this.message.error('文件格式不对，请重新上传', { nzDuration: 2000 });
      return false;
    }
  }

  doSave() {
    if (!this.defaultData.material_name) {
      this.message.error('请输入名称');
      return false;
    }


    this.defaultData.material_make_time = format(this.material_make_time, 'yyyy-MM-dd');

    if (!this.saveing) {
      this.saveing = true;

      this.materialsService.updateMaterialDetail(this.defaultData, { cid: this.cid }).subscribe(data => {
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


  uploadImage = (fileInfo: NzUploadXHRArgs) => {
    const formData = new FormData();
    formData.append('publisher_id', this.menuService.currentPublisherId + '');
    formData.append('upload_file', fileInfo['file'] as any);
    this.materialsService.uploadCoverImage(this.defaultData['material_id'], formData, { cid: this.cid }).subscribe(

      (data) => {

        if (data['status_code'] && data.status_code === 200) {
          this.message.success('修改成功');
          this.modalSubject.destroy('onOk');
        } else {
          this.message.error(data.message);
        }
      }, (err) => {
      }, () => {
      },
    );
  }

  getImageSizeList() {
    this.materialsService.getImageSize({ publisher_id: this.menuService.currentPublisherId, type: 'front_cover' }).subscribe(result => {
      if (result['status_code'] == 200) {

        if (isObject(result['data']) && result['data'].hasOwnProperty('image')) {
          this.config = result['data'].image.filter(item => item.image_type == this.video_type);
        }
      } else {
        this.message.error(result['message']);
        this.modalSubject.destroy('onCancel');
      }

    }, () => {
      this.modalSubject.destroy('onCancel');
    });
  }

}
