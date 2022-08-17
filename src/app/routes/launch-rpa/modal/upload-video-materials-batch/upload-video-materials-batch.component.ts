import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {CustomDatasService} from "../../../../shared/service/custom-datas.service";
import {AuthService} from "../../../../core/service/auth.service";
import {HttpEvent, HttpEventType, HttpResponse} from "@angular/common/http";
import {fromEvent, zip} from 'rxjs';
import {map} from 'rxjs/operators';
import {isUndefined, Md5} from "@jzl/jzl-util";
import {formatBytes, formatDate} from '@jzl/jzl-util';
import {MenuService} from '../../../../core/service/menu.service';
import {environment} from '../../../../../environments/environment';
import {LaunchRpaService} from '../../service/launch-rpa.service';
import {NzNotificationData, NzNotificationService} from "ng-zorro-antd/notification";

@Component({
  selector: 'app-upload-video-materials',
  templateUrl: './upload-video-materials-batch.component.html',
  styleUrls: ['./upload-video-materials-batch.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UploadVideoMaterialsBatchComponent implements OnInit {


  public maxUploadFileNum =2 ;
  public uploadingFileNum = 0;
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
    material_tags: [],  //标签 空格分开
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
  public tagsList=[];


  public saving = false;
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
  public fileObj = {};
  public fileUploadSuccess = 0;
  public fileChecked=0;

  private notifyId: NzNotificationData;

  public cid;

  constructor(
    private message: NzMessageService,
    public menuService:MenuService,
    private modalSubject: NzModalRef,
    private authService: AuthService,
    private customDataService: CustomDatasService,
    public notification: NzNotificationService,
    public launchRpaService: LaunchRpaService,) {

    // this.publisherList = [...this.customDataService.productList];

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.getAuthorList();
    this.getTagsList();
  }

  getTagsList() {
    this.launchRpaService.getLabelByLaunchType('video').subscribe(results => {
      if (results.status_code && results.status_code === 200) {
        this.tagsList = results['data'];
      } else {
        this.tagsList = [];
      }
    });
  }

  getAuthorList() {
    this.launchRpaService
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
    let fileHashData = "";
    this.exception = 'active';
    if (!file.type) {
      this.message.error('文件格式不对，请重新上传', {nzDuration: 2000});
    }
    // -- load md5
    const readerMd5 = new FileReader();
    const md5$ = fromEvent(readerMd5,'loadend')
      .pipe(map((evt:ProgressEvent)=> {
        const uint8Array = new Uint8Array(evt.target['result']);
        fileHashData = Md5.hashBuffer(uint8Array).toString();
        return {md5:fileHashData};
      }));


    md5$.subscribe((md5Result)=> {
      // const checkResult = this.checkImageSize(result2['width'],result2['height'],file.size);
      const result= {
        ...md5Result, ...{"file": file,status:'',size:formatBytes(file.size,2)+'',originMaterialName:undefined,materialId:undefined,uploadStatus:false,message:'',title:file.name,imgSrc:''}
      };
      if (!this.fileObj[md5Result['md5']]) {
        this.fileObj[md5Result['md5']] =  result;
      } else {
        this.fileList = Object.values(this.fileObj);
        return;
      }

      if(result.message  == "") {
        this.checkVideo(this.fileObj[md5Result['md5']]);
      }
      this.fileList = Object.values(this.fileObj);
    });


    readerMd5.readAsArrayBuffer(file);
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

    if(this.fileChecked<this.fileList.length) {
      this.message.info('请等待视频处理完成');
      return;
    }

    if(this.saving) {
      return;
    }
    this.saving = true;


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

    // if (this.defaultData.material_tags) {
    //   this.defaultData.material_tags = this.defaultData.material_tags.replace(/,|，/g, "");
    //   this.defaultData.material_tags = this.defaultData.material_tags.replace(/\s+/g,",");
    // }


    const postData = {
      publisher_id: this.menuService.currentPublisherId,
      material_tags:this.defaultData.material_tags,
      material_make_time:formatDate(this.defaultData.material_make_time,'yyyy-MM-dd'),
      director_id:this.defaultData.director_id,
      camerist_id:this.defaultData.camerist_id,
      movie_editor_id:this.defaultData.movie_editor_id,
      gender:this.defaultData.gender,
      age:this.defaultData.age,
      scenes:this.defaultData.scenes,
      material_type:this.defaultData.material_type,
      style_type:this.defaultData.style_type,
      model_name:this.defaultData.model_name,
      data_list:[]
    };

    this.fileList.forEach(item=> {
      if(item['materialId']) {
        postData.data_list.push({
          material_name:item.title,
          material_id:item.materialId,
          md5:item.md5
        });
      }
    });

    if (postData.data_list.length > 0) {
      this.launchRpaService.saveVideoInfo(postData, {cid:this.cid}).subscribe(result=> {
        if(result['status_code'] == 200) {
          this.message.success('保存成功');
          this.modalSubject.destroy('onOk');
          this.saving = false;
        } else {
          this.message.error(result['message']);
          this.saving = false;
        }


      });
    } else {
      this.message.info('请选择视频');
      this.saving = false;
    }

  }


  deleteFile(data,index) {
    this.fileChecked-=1;
    if (data.uploadStatus) {
      this.fileUploadSuccess-=1;
    }
    delete this.fileObj[data.md5];
    this.fileList = this.fileList.filter(item=> {
      return item['md5']!==data['md5'];
    });
    this.createNotify();
  }


  checkVideo(fileInfo) {
    fileInfo.message = '视频校验中...';
    this.launchRpaService.checkVideo(fileInfo.md5,{cid:this.cid,publisher_id:this.menuService.currentPublisherId}).subscribe(result=> {
      if(result['status_code'] == 200) {
        if(result['data'] == "") {
          fileInfo.message = '等待上传';
          this.uploadVideo(fileInfo);
        } else {
          fileInfo.imgSrc = result['data']['preview_img'];

          if(result['data'] && result['data']['need_upload'] == 1) {
            fileInfo.message = '等待上传';
            this.uploadVideo(fileInfo);
          } else {
            fileInfo.originMaterialName = result['data']['material_name'];
            fileInfo.materialId = result['data']['material_id'];
            fileInfo.message = '上传成功';
            this.fileUploadSuccess++;
            this.fileChecked++;
            fileInfo.uploadStatus = true;
            this.createNotify();
          }

        }
      } else {
        fileInfo.message = '检验失败';
        this.fileChecked++;
        this.createNotify();
      }

    },error => {
      this.fileChecked++;
      this.createNotify();
    },() => {
    });
  }
 createNotify() {
   if (!isUndefined(this.notifyId)) {
     this.notification.remove(this.notifyId.messageId);
     this.notifyId = undefined;
   }
   if (isUndefined(this.notifyId) || this.notifyId.state === 'leave') {
     const uploadingNum=this.fileList.length-this.fileChecked;
     this.notifyId=this.notification.create('info', '视频上传',
       '还有'+uploadingNum+ '个视频待处理', { nzDuration: uploadingNum>0?0:5000 });
   }
 }


  uploadVideo(fileInfo) {

    if(this.uploadingFileNum>=this.maxUploadFileNum) {
      setTimeout(()=> {
        this.uploadVideo(fileInfo);
      },1000);
    } else {
      this.uploadingFileNum ++;
      const formData = new FormData();
      formData.append('publisher_id', this.menuService.currentPublisherId+'');
      formData.append('upload_file', fileInfo['file']);
      fileInfo.message = '上传中...';
      this.launchRpaService.uploadVideoBatchMaterials(formData, this.cid).subscribe(

        (event: HttpEvent<{}>) => {

          if (event.type === HttpEventType.UploadProgress) {
            // if (event.total > 0) {
            //   // tslint:disable-next-line:no-any
            //   (event as any).percent = event.loaded / event.total * 100;
            //   this.speed = Math.round( (event as any).percent);
            // }
            // 处理上传进度条，必须指定 `percent` 属性来表示进
          } else if (event instanceof HttpResponse) {
            // 处理成功
            if (event.body['status_code'] === 200) {
              fileInfo.message = '上传成功';
              fileInfo.imgSrc = event.body['data']['preview_img'] ;
              this.fileUploadSuccess++;
              fileInfo.uploadStatus = true;
              fileInfo.uploadData = event.body['data'];
              fileInfo.materialId = event.body['data']['material_id'];
            } else {
              fileInfo.message = event.body['message'];
            }

          }
        }, (err) => {
          fileInfo.message = '上传失败';
        }, () => {
          this.uploadingFileNum--;
          this.fileChecked++;
          this.createNotify();
        },
      );
    }

  }


}
