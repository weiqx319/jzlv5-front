import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { fromEvent, zip } from "rxjs";
import { map } from "rxjs/operators";
import {formatBytes, formatDate, isUndefined, Md5} from "@jzl/jzl-util";
import { MenuService } from "../../../../core/service/menu.service";
import { AuthService } from "../../../../core/service/auth.service";
import { HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";
import { ManageService } from "../../service/manage.service";
import { MaterialsManageService } from "../../service/materials-manage.service";
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";
import { isObject } from "@jzl/jzl-util";
import {NzNotificationData, NzNotificationService} from "ng-zorro-antd/notification";

interface IUploadImageFileInfo {
  md5: string;
  width: number;
  height: number;
  title: string;
  file: File;
  size: string;
  status: string;
  checkStatus: number;
  uploadStatus: boolean;
  imageData: string;
  message: string;
  uploadData?: any;
}

@Component({
  selector: 'app-upload-materials-modal',
  templateUrl: './upload-materials-modal.component.html',
  styleUrls: ['./upload-materials-modal.component.scss']
})
export class UploadMaterialsModalComponent implements OnInit {

  @Input() show_type;
  @Input() authorRole;

  public maxUploadFileNum = 2;
  public customReq: any;
  public uploadingFileNum = 0;
  public mediaList = [
    { key: 7, name: '头条' },
    { key: 6, name: '广点通' },
    { key: 17, name: '超级汇川' },
    { key: 16, name: '快手' },
    { key: 1, name: '百度信息流' },
  ];
  public advertiserList;
  public tagsList = [];

  public configList = [
    { name: '摄影', key: 'camerist_id', type: 'select' },
    { name: '剪辑', key: 'movie_editor_id', type: 'select' },
    { name: '编导', key: 'director_id', type: 'select' },
  ];

  public defaultData = {
    publisher_id: 7,
    media_id: '',
    material_tags: [],
    cid: 25,
    material_make_time:new Date(),
    director_id: null,  //编导id 默认0
    camerist_id: null,  //摄影id 默认0
    movie_editor_id: null,  //剪辑id 默认0
  };

  public choreographerList = [];
  public photographList = [];
  public clipList = [];

  public fileList = [];
  public imgFileList: IUploadImageFileInfo[] = [];
  public resultMessage = '';
  public speed = 0;
  public uploading = false;
  public fileUploadSuccess = 0;
  public exception = 'active';
  public fileObj = {};
  public saving = false;

  public imageSpecificSizeList = [];
  public imageSizeList = {};
  public imageSizeShowList = [];
  public imageStyleShowList = [];

  public fileChecked=0;

  private notifyId: NzNotificationData;

  public cid;

  constructor(
    private modalSubject: NzModalRef,
    private message: NzMessageService,
    public menuService: MenuService,
    private authService: AuthService,
    public manageService: ManageService,
    private materialsManageService: MaterialsManageService,
    public notification: NzNotificationService,
    private customDataService: CustomDatasService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.defaultData.cid = this.materialsManageService.advertisers[0].key;
    // this.mediaList = [...this.customDataService.publisherNewList];
  }

  ngOnInit(): void {
    if (this.authorRole) {
      this.choreographerList = this.authorRole['1'];
      this.photographList = this.authorRole['2'];
      this.clipList = this.authorRole['3'];
    }
    this.advertiserList = [...this.materialsManageService.advertisers];
    if (this.show_type === 'video') {
      this.getTagsList('video');
    } else {
      this.getTagsList('image');
      this.mediaList.push({ key: 3, name: '360sem' });
    }
    this.getImageSizeList();
  }
  publisherChange() {
    this.imageSpecificSizeList = [];
    this.imageSizeList = {};
    this.imageSizeShowList = [];
    this.getImageSizeList();
  }

  changeBtn() {
    this.resultMessage = '';
  }

  onSubmit() {

  }
  beforeUpload = (file: File) => {
    let fileHashData = "";
    this.exception = 'active';
    if (!file.type) {
      this.message.error('文件格式不对，请重新上传', { nzDuration: 2000 });
      this.fileList = [];
      this.imgFileList = [];
    }

    if (this.show_type === 'video') {
      // -- load md5
      const readerMd5 = new FileReader();
      const md5$ = fromEvent(readerMd5, 'loadend')
        .pipe(map((evt: ProgressEvent) => {
          const uint8Array = new Uint8Array(evt.target['result']);
          fileHashData = Md5.hashBuffer(uint8Array).toString();
          return { md5: fileHashData };
        }));

      md5$.subscribe((md5Result) => {
        // const checkResult = this.checkImageSize(result2['width'],result2['height'],file.size);
        const result = {
          ...md5Result, ...{ "file": file, status: '', size: formatBytes(file.size, 2) + '', originMaterialName: undefined, materialId: undefined, uploadStatus: false, message: '', title: file.name, imgSrc: '' }
        };
        if (!this.fileObj[md5Result['md5']]) {
          this.fileObj[md5Result['md5']] =  result;
        } else {
          this.fileList = Object.values(this.fileObj);
          return;
        }

        if (result.message == "") {
          this.checkVideo(this.fileObj[md5Result['md5']]);
        }
        this.fileList = Object.values(this.fileObj);
      });

      readerMd5.readAsArrayBuffer(file);
      return false;
    } else {
      // -- load md5
      const readerMd5 = new FileReader();
      const md5$ = fromEvent(readerMd5, 'loadend')
        .pipe(map((evt: ProgressEvent) => {
          const uint8Array = new Uint8Array(evt.target['result']);
          fileHashData = Md5.hashBuffer(uint8Array).toString();
          return { md5: fileHashData };
        }));

      // -- load width*height
      const readerWidth = new FileReader();
      const image = new Image();
      fromEvent(readerWidth, 'loadend').subscribe((evt: ProgressEvent) => {
        image.src = evt.target['result'];
      });

      const width$ = fromEvent(image, 'load')
        .pipe(map((result => {
          return { width: result.target['width'], height: result.target['height'], imageData: result.target['src'] };
        })));
      zip(md5$, width$).subscribe(([result1, result2]) => {
        const checkResult = this.checkImageSize(result2['width'], result2['height'], file.size);
        const result: IUploadImageFileInfo = {
          ...result1, ...result2, ...{ "file": file, status: '', size: formatBytes(file.size, 2) + '', uploadStatus: false, checkStatus: checkResult.status, message: checkResult.message, title: file.name }
        };
        if (!this.fileObj[result1['md5']]) {
          this.fileObj[result1['md5']] =  result;
        }
        if (result.message == "") {
          this.checkImage(this.fileObj[result1['md5']]);
        }
        this.imgFileList = Object.values(this.fileObj);
      });


      readerMd5.readAsArrayBuffer(file);
      readerWidth.readAsDataURL(file);
      return false;
    }

  }

  checkImage(fileInfo: IUploadImageFileInfo) {
    fileInfo.message = '图片校验中...';
    this.materialsManageService.checkImageMd5(fileInfo.md5, { cid: this.defaultData.cid, publisher_id: this.defaultData.publisher_id }).subscribe(result => {
      if (result['status_code'] == 200) {
        if (result['data'] == "") {
          this.uploadImage(fileInfo);
        } else {
          fileInfo.message = '图片已存在';
        }
      } else {
        fileInfo.message = '检验失败';
      }

    });
  }


  uploadImage(fileInfo: IUploadImageFileInfo) {

    const formData = new FormData();
    formData.append('publisher_id', this.defaultData.publisher_id + '');
    formData.append('upload_file', fileInfo['file']);
    fileInfo.message = '上传中...';
    this.materialsManageService.uploadImageMaterials(formData, this.defaultData.cid).subscribe(

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
            this.fileUploadSuccess++;
            fileInfo.uploadStatus = true;
            fileInfo.uploadData = event.body['data'];
          } else {
            fileInfo.message = event.body['message'];
          }

        }
      }, (err) => {
        fileInfo.message = '上传失败';
      }, () => {
      },
    );
  }
  onInput($event) {
    if (!$event) {
      return;
    }
    const target = $event.target;
    target.value = target.value.replace(/,|，/g, "");
  }

  checkImageSize(width, height, size) {
    const checkKey = width + 'x' + height;
    const imageSize = this.imageSizeList[checkKey];
    if (imageSize) {
      if (imageSize['size'] < size / 1024) {
        return { status: 2, message: '图片太大,该尺寸最大限制为' + imageSize['size'] + 'KB' };
      } else {
        return { status: 0, message: '' };
      }
    }
    if (this.defaultData.publisher_id == 7 || this.defaultData.publisher_id == 16 || this.defaultData.publisher_id == 3) {
      const specificError = { specificType: false, status: 1, message: '' };
      const maxOrMinError = { maxOrMinType: false, status: 1, message: '' };
      const sizeError = { sizeType: false, status: 2, message: '' };

      for (const item of this.imageSpecificSizeList) {
        specificError.specificType = false;
        maxOrMinError.maxOrMinType = false;
        sizeError.sizeType = false;

        if (width / item.width_specific * item.height_specific == height) {
          specificError.specificType = true;

          if (width > item.max_size[0] || width < item.min_size[0] || height > item.max_size[1] || height < item.min_size[1]) {
            maxOrMinError.message = '当前比例为' + item.width_specific + ':' + item.height_specific + ',图片大小不符合限制,上限为' + item.max_size[0] + 'x' + item.max_size[1] + '下限为' + item.min_size[0] + 'x' + item.min_size[1];
          } else {
            maxOrMinError.maxOrMinType = true;
          }
          if (item.size < size / 1024) {
            sizeError.message = '图片太大,该尺寸最大限制为' + item['size'] + 'KB';
          } else {
            sizeError.sizeType = true;
          }

          if (!maxOrMinError.maxOrMinType) {
            return maxOrMinError;
          } else if (!sizeError.sizeType) {
            return sizeError;
          }

        } else {
          specificError.message = '图片不符合所有比例限制';
        }

        if (specificError.specificType && maxOrMinError.maxOrMinType && sizeError.sizeType) {
          return { status: 0, message: '' };
        }
      }

      if (!specificError.specificType) {
        return specificError;
      }
    }

    return { status: 1, message: '非法尺寸' };
  }
  checkVideo(fileInfo) {
    fileInfo.message = '视频校验中...';
    this.materialsManageService.checkVideo(fileInfo.md5, { cid: this.defaultData.cid, publisher_id: this.defaultData.publisher_id }).subscribe(result => {
      if (result['status_code'] == 200) {
        if (result['data'] == "") {
          fileInfo.message = '等待上传';
          this.uploadVideo(fileInfo);
        } else {
          fileInfo.imgSrc = result['data']['preview_img'];

          if (result['data'] && result['data']['need_upload'] == 1) {
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
  uploadVideo(fileInfo) {

    if (this.uploadingFileNum >= this.maxUploadFileNum) {
      setTimeout(() => {
        this.uploadVideo(fileInfo);
      }, 1000);
    } else {
      this.uploadingFileNum++;
      const formData = new FormData();
      formData.append('publisher_id', this.defaultData.publisher_id + '');
      formData.append('upload_file', fileInfo['file']);
      fileInfo.message = '上传中...';
      this.materialsManageService.uploadVideoBatchMaterials(formData, this.defaultData.cid).subscribe(

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
              fileInfo.imgSrc = event.body['data']['preview_img'];
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




  deleteFile(data, index) {
    if (data.uploadStatus) {
      this.fileUploadSuccess-=1;
    }
    delete this.fileObj[data.md5];
    if (this.show_type === 'video') {
      this.fileChecked-=1;
      this.fileList = this.fileList.filter(item => {
        return item['md5'] !== data['md5'];
      });
      this.createNotify();
    } else {
      this.imgFileList = this.imgFileList.filter(item => {
        return item['md5'] !== data['md5'];
      });
    }

  }
  getImageSizeList() {
    const params = {
      publisher_id: 7,
    };
    params.publisher_id = this.defaultData.publisher_id;
    this.materialsManageService.getImageSize(params).subscribe(result => {
      if (result['status_code'] == 200) {
        if (isObject(result['data']) && result['data'].hasOwnProperty('image')) {
          result['data']['image'].forEach(item => {
            if (item.hasOwnProperty('width_specific')) {
              this.imageSpecificSizeList.push(item);
            } else {
              this.imageSizeList[item['width'] + 'x' + item['height']] = item;
            }
            this.imageSizeShowList.push({
              showSize: formatBytes(item.size),
              ...item
            });
          });
        }

        if (isObject(result['data']) && result['data'].hasOwnProperty('css')) {
          this.imageStyleShowList = [...result['data']['css']];
        }
      } else {
        this.message.error(result['message']);
        this.modalSubject.destroy('onCancel');
      }

    }, () => {
      this.modalSubject.destroy('onCancel');
    });
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }
  doSave() {
    if (this.saving) {
      return;
    }
    this.saving = true;
    if(this.show_type === 'video'&&this.fileChecked<this.fileList.length) {
      this.message.info('请等待处理完成');
      return;
    }

    // if (this.uploadingFileNum > 0) {
    //   this.message.info('请等待上传完成');
    //   return;
    // }
    if (this.defaultData.material_tags) {
      // this.defaultData.material_tags = this.defaultData.material_tags.replace(/,|，/g, "");
      // this.defaultData.material_tags = this.defaultData.material_tags.replace(/\s+/g,",");
    }

    const postData = {
      cid: this.defaultData.cid,
      publisher_id: this.defaultData.publisher_id,
      material_tags: this.defaultData.material_tags,
      material_make_time:formatDate(this.defaultData.material_make_time,'yyyy-MM-dd'),
      data_list: []
    };
    if (this.show_type === 'video') {
      this.fileList.forEach(item => {
        if(item['materialId']) {
          postData.data_list.push({
            material_name:item.title,
            material_id:item.materialId,
            md5:item.md5
          });
          postData['camerist_id']=this.defaultData.camerist_id;
          postData['director_id']=this.defaultData.director_id;
          postData['movie_editor_id']=this.defaultData.movie_editor_id;
        }
      });
    } else {
      this.imgFileList.forEach(item => {
        if (item.uploadStatus) {
          postData.data_list.push({
            material_name: item.title,
            ...item.uploadData
          });
        }
      });
    }

    if (postData.data_list.length > 0) {
      if (this.show_type === 'video') {
        this.materialsManageService.saveVideoInfo(postData).subscribe(result => {
          if (result['status_code'] == 200) {
            this.message.success('保存成功');
            this.modalSubject.destroy('onOk');
          } else {
            this.message.error(result['message']);
          }
        });
      } else {
        if (this.show_type === 'cover') {
          this.materialsManageService.saveCoverImageInfo(postData).subscribe(result => {
            if (result['status_code'] == 200) {
              this.message.success('保存成功');
              this.modalSubject.destroy('onOk');
            } else {
              this.message.error(result['message']);
            }
          });
        } else {
          this.materialsManageService.saveImageInfo(postData, { cid: this.defaultData.cid, publisher_id: this.defaultData.publisher_id }).subscribe(result => {
            if (result['status_code'] == 200) {
              this.message.success('保存成功');
              this.modalSubject.destroy('onOk');
              this.saving = false;
            } else {
              this.message.error(result['message']);
              this.saving = false;
            }
          });
        }
      }
    } else {
      this.message.info('请选择素材');
      this.saving = false;
    }
  }

  getTagsList(type) {
    this.materialsManageService.getLabelByLaunchType(type).subscribe(results => {
      if (results.status_code && results.status_code === 200) {
        results['data'].forEach(item => {
          this.tagsList.push({ key: item.tags_content, name: item.tags_content });
        });
      } else {
        this.tagsList = [];
      }
    });
  }

}
