import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {CustomDatasService} from "../../../../shared/service/custom-datas.service";
import {MaterialsService} from "../../service/materials.service";
import {AuthService} from "../../../../core/service/auth.service";
import {HttpEvent, HttpEventType, HttpResponse} from "@angular/common/http";
import {format} from "date-fns";
import {MenuService} from "../../../../core/service/menu.service";

@Component({
  selector: 'app-upload-video-materials',
  templateUrl: './upload-video-materials.component.html',
  styleUrls: ['./upload-video-materials.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UploadVideoMaterialsComponent implements OnInit {

  public defaultData: any = {
    material_name: null,  //"素材名称"
    material_make_time: new Date(), // 素材制作时间
    director_id: null,  //编导id 默认0
    camerist_id: null,  //摄影id 默认0
    movie_editor_id: null,  //剪辑id 默认0
    gender: '通用',
    age: '',
    scenes: [],
    material_type: [],
    style_type: [],
    model_name: '',
    material_tags: '',  //标签 空格分开
    upload_file: [],
  };

  public otherValue = {
    isAdd: false,
    scenes: null,
    material_type: null,
    style_type: null,
  };

  public advertiserList = [];

  public authorRole = {
    '1': [],
    '2': [],
    '3': [],
  };

  public publisherList = [
    { key: 7, name: '头条'},
  ];
  public choreographerList = [];
  public photographList = [];
  public clipList = [];

  public generationValue: any = [
    { label: '18-23', value: '18-23' },
    { label: '24-30', value: '24-30' },
    { label: '31-40', value: '31-40' },
    { label: '41-49', value: '41-49' },
    { label: '50+', value: '50+' },
  ];
  public scenesValue: any = [
    { label: '居家', value: '居家' },
    { label: '商场', value: '商场' },
    { label: '公园', value: '公园' },
    { label: '街边', value: '街边' },
    { label: '办公场所', value: '办公场所' },
  ];
  public materialTypeValue: any = [
    { label: '剧情类', value: '剧情类' },
    { label: '图片轮播', value: '图片轮播' },
    { label: '后期特效类', value: '后期特效类' },
    { label: '口播', value: '口播' },
  ];
  public styleTypeValue: any = [
    { label: '清纯可爱', value: '清纯可爱' },
    { label: '性感成熟', value: '性感成熟' },
    { label: '高级', value: '高级' },
    { label: '接地气', value: '接地气' },
    { label: '搞笑搞怪', value: '搞笑搞怪' },
  ];

  public customReq: any;

  public fileList = [];
  public resultMessage = '';
  public exception = 'active';
  public speed = 0;
  public uploading = false;

  public cid;

  public publisher_id;

  constructor(
    private message: NzMessageService,
    private modalSubject: NzModalRef,
    private authService: AuthService,
    private customDataService: CustomDatasService,
    private materialsService: MaterialsService,
    public menuService: MenuService,) {

    // this.publisherList = [...this.customDataService.productList];
    this.publisher_id = this.menuService.currentPublisherId;
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.getAuthorList();
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
            list.forEach( item => {
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
        () => {},
      );
  }

  // 年龄段
  changeGeneration() {
    this.defaultData.age = [];
    this.generationValue.forEach( item => {
      if (item.checked) {
        this.defaultData.age.push(item.value);
      }
    });
  }

  // 场景
  changeScenes() {
    this.defaultData.scenes = [];
    this.scenesValue.forEach( item => {
      if (item.checked) {
        this.defaultData.scenes.push(item.value);
      }
    });
  }

  // 素材类型
  changeMaterialType() {
    this.defaultData.material_type = [];
    this.materialTypeValue.forEach( item => {
      if (item.checked) {
        this.defaultData.material_type.push(item.value);
      }
    });
  }

  // 风格类型
  changeStyleType() {
    this.defaultData.style_type = [];
    this.styleTypeValue.forEach( item => {
      if (item.checked) {
        this.defaultData.style_type.push(item.value);
      }
    });
  }

  onInput($event) {
    if (!$event) {
      return;
    }
    const target = $event.target;
    target.value = target.value.replace(/,|，/g, "");
  }

  beforeUpload = (file: File) => {
    this.fileList = [file];
    this.exception = 'active';
    if (!file.type) {
      this.message.error('文件格式不对，请重新上传', {nzDuration: 2000});
      this.fileList = [];
    }

    return false;
  }

  changeBtn() {
    this.resultMessage = '';
    this.fileList = [];
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    if (!this.defaultData.material_name) {
      this.message.error('请输入素材名称');
      return false;
    }


    if (this.defaultData.director_id === null) {
      this.defaultData.director_id = '';
    }

    if (this.defaultData.camerist_id === null) {
      this.defaultData.camerist_id = '';
    }

    if (this.defaultData.movie_editor_id === null) {
      this.defaultData.movie_editor_id = '';
    }

    if (!this.otherValue.isAdd) {
      if (this.otherValue.scenes) {
        this.defaultData.scenes.push(this.otherValue.scenes);
      }

      if (this.otherValue.material_type) {
        this.defaultData.material_type.push(this.otherValue.material_type);
      }

      if (this.otherValue.style_type) {
        this.defaultData.style_type.push(this.otherValue.style_type);
      }

      this.otherValue.isAdd = true;
    }

    if (this.defaultData.material_tags) {
      this.defaultData.material_tags = this.defaultData.material_tags.replace(/,|，/g, "");
      this.defaultData.material_tags = this.defaultData.material_tags.replace(/\s+/g,",");
    }

    if (this.fileList.length > 0) {
      this.uploading = true;
      this.exception = 'active';

      const formData = new FormData();
      formData.append('material_name', this.defaultData.material_name);
      formData.append('material_make_time', format(this.defaultData.material_make_time, 'yyyy-MM-dd'));
      formData.append('director_id', this.defaultData.director_id);
      formData.append('camerist_id', this.defaultData.camerist_id);
      formData.append('movie_editor_id', this.defaultData.movie_editor_id);
      formData.append('gender', this.defaultData.gender);
      formData.append('age', this.defaultData.age);
      formData.append('scenes', this.defaultData.scenes);
      formData.append('material_type', this.defaultData.material_type);
      formData.append('style_type', this.defaultData.style_type);
      formData.append('model_name', this.defaultData.model_name);
      formData.append('material_tags', this.defaultData.material_tags);
      formData.append('upload_file', this.fileList[0]);
      formData.append('publisher_id', this.publisher_id);

      this.materialsService.uploadVideoMaterials(formData, this.cid).subscribe(

        (event: HttpEvent<{}>) => {

          if (event.type === HttpEventType.UploadProgress) {
            if (event.total > 0) {
              // tslint:disable-next-line:no-any
              (event as any).percent = event.loaded / event.total * 100;
              this.speed = Math.round( (event as any).percent);
            }
            // 处理上传进度条，必须指定 `percent` 属性来表示进
          } else if (event instanceof HttpResponse) {
            // 处理成功
            if (event.body['status_code'] === 200) {
              this.uploading = false;
              // this.upload_method[1].disabled = false;
              // this.showUpload = false;
              this.message.success('上传成功');
              this.modalSubject.destroy('onOk');
              // notifyData.push({job_id: event.body['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'upload_' + this.summaryType });
              // this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});

            } else {
              // 处理失败

              this.uploading = false;
              // this.upload_method[1].disabled = false;
              this.exception = 'exception';
              this.message.error(event.body['message'],  {nzDuration: 10000});
              // this.resultMessage = event.body['message'];
            }

          }
        }, (err) => {
          // 处理失败
          this.uploading = false;
          // this.upload_method[1].disabled = false;
          this.exception = 'exception';
          this.message.error('上传失败');
        }, () => {
        },
      );

    } else {
      this.message.info('请选择素材文件');
    }

  }

}
