import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {environment} from "../../../../../environments/environment";
import {AuthService} from "../../../../core/service/auth.service";
import {format} from "date-fns";
import { NzMessageService } from 'ng-zorro-antd/message';
import {MaterialsService} from "../../../materials/service/materials.service";
import {MaterialsManageService} from "../../service/materials-manage.service";
import {User} from "../../../../core/entry";
import {NzUploadFile, NzUploadXHRArgs} from "ng-zorro-antd/upload";
import {MenuService} from "../../../../core/service/menu.service";
@Component({
  selector: 'app-create-materials-detail',
  templateUrl: './create-materials-detail.component.html',
  styleUrls: ['./create-materials-detail.component.scss','../../components/materials-manage/materials-manage.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers:[MaterialsService]
})
export class CreateMaterialsDetailComponent implements OnInit {
  @Input() materialsData;
  @Input() show_type;
  @Input() authorRole;
  @Input() tagsList;
  @Output() visible: EventEmitter<any> = new EventEmitter<any>();

  public materialsDetailForm: FormGroup;
  public cid: any;
  public user_id: any;

  public currentManagerUser: User;

  public isVertical = false;
  public videoUrl = '';
  public imgUrl = '';
  public saveing = false;
  public material_make_time;
  public defaultData = {

  };

  public choreographerList = [];
  public photographList = [];
  public clipList = [];


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService,
    private menuService: MenuService,
    private materialsService: MaterialsService,
    private materialsManageService:MaterialsManageService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;

    this.materialsDetailForm = this.fb.group({
      chan_pub_id_lst: [[], [Validators.required]],
      convert_cost: ['', [Validators.required]],
      comment: [''],
      stage: [''],
      enable: [''],
    });
  }

  ngOnInit(): void {
    if (this.materialsData.video_type&&this.materialsData.video_type==='2') {
      this.isVertical = true;
    }
    const currentMangerUser = this.authService.getCurrentAdminOperdInfo();
    this.currentManagerUser = this.authService.getCurrentUser().user_list.find(item => {
      if (item.user_id === currentMangerUser.select_uid) {
        return true;
      }
    });
    this.defaultData=this.materialsData;
    this.material_make_time = new Date(this.defaultData['material_make_time']);
    if (this.defaultData['material_tags']&&this.defaultData['material_tags'].length>0) {
      this.defaultData['material_tags']=this.defaultData['material_tags'].split(',');
    } else {
      this.defaultData['material_tags']=[];
    }
    this.defaultData['material_status']=Number(this.defaultData['material_status']);

    if (this.show_type==='video') {
      this.choreographerList = this.authorRole['1'];
      this.photographList = this.authorRole['2'];
      this.clipList = this.authorRole['3'];
    }

    if (this.show_type==='video_report') {
      this.videoUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/video/' + this.materialsData['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid;
      this.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/screenshot/' + this.materialsData['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid+ '&last_time=' + this.materialsData.last_modify_time;
    }
  }

  doDelete() {
    this.materialsManageService.deleteVideoMaterials(this.materialsData['material_id'], {}).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.message.success('删除成功');
        this.close(true);
      } else {
        this.message.error(result.message);
      }
    }, (err: any) => {
      this.message.error('系统异常，请重试');
    });
  }

  doSave() {
    if (!this.materialsData.material_name) {
      this.message.error('请输入名称');
      return false;
    }
    this.defaultData['material_make_time'] = format(this.material_make_time, 'yyyy-MM-dd');

    if (!this.saveing) {
      this.saveing = true;
      if (this.show_type==='video') {
        this.materialsManageService.updateMaterialDetail(this.defaultData, {cid: this.cid}).subscribe(data => {
          this.saveing = false;
          if (data['status_code'] && data.status_code === 200) {
            this.message.success('保存成功');
            this.close(true);
          } else if (data['status_code'] && data.status_code === 201) {
            this.message.error('广告主名称已经存在，请重试');
          } else if (data['status_code'] && data.status_code === 401) {
            this.message.error('您没权限对此操作！');
            this.close(false);
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
      } else {
        this.materialsManageService.updateMaterialImageDetail(this.defaultData, {cid: this.cid}).subscribe(data => {
          this.saveing = false;
          if (data['status_code'] && data.status_code === 200) {
            this.message.success('保存成功');
            this.close(true);
          } else if (data['status_code'] && data.status_code === 201) {
            this.message.error('广告主名称已经存在，请重试');
          } else if (data['status_code'] && data.status_code === 401) {
            this.message.error('您没权限对此操作！');
            this.close(false);
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

  close(value): void {
    this.visible.emit(value);
  }

  getTagsList(type) {
    this.materialsManageService.getLabelByLaunchType(type).subscribe(results=> {
      if (results.status_code && results.status_code === 200) {
        results['data'].forEach(item=> {
          this.tagsList.push({key:item.tags_content,name:item.tags_content});
        });
      } else {
        this.tagsList = [];
      }
    });
  }

  uploadImage = (fileInfo:NzUploadXHRArgs)=> {
    const formData = new FormData();
    formData.append('publisher_id', this.materialsData.material_publisher_id);
    formData.append('upload_file', fileInfo['file'] as any);
    this.materialsService.uploadCoverImage(this.defaultData['material_id'], formData, {cid: this.cid}).subscribe(

      (data) => {

        if (data['status_code'] && data.status_code === 200) {
          this.message.success('修改成功');
          this.close(true);
        } else {
          this.message.error(data.message);
        }
      }, (err) => {
      }, () => {
      },
    );
  }
  beforeUpload = (file: NzUploadFile) => {
    if (!file.type) {
      this.message.error('文件格式不对，请重新上传', {nzDuration: 2000});
      return false;
    }
  }

}
