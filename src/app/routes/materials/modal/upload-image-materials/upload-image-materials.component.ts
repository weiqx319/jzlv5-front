import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";
import { MaterialsService } from "../../service/materials.service";
import { AuthService } from "../../../../core/service/auth.service";
import { HttpEvent, HttpEventType, HttpResponse } from "@angular/common/http";
import { format } from "date-fns";
import { Md5 } from "@jzl/jzl-util";
import { fromEvent, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { MenuService } from '../../../../core/service/menu.service';
import { Advertiser } from '../../../../core/entry/advertiser';
import { formatBytes } from '@jzl/jzl-util';
import { isObject } from "@jzl/jzl-util";


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
  selector: 'app-upload-image-materials',
  templateUrl: './upload-image-materials.component.html',
  styleUrls: ['./upload-image-materials.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UploadImageMaterialsComponent implements OnInit {

  @Input() type;

  public defaultData: any = {
    material_tags: '',  //标签 空格分开
    publisher_id: 1,
  };


  public advertiserList = [];

  public imageSpecificSizeList = [];

  public imageSizeList = {};
  public imageSizeShowList = [];
  public imageStyleShowList = [];
  public publisherList = [
    { key: 7, name: '头条' },
  ];



  public customReq: any;

  public fileObj = {};
  public fileList: IUploadImageFileInfo[] = [];
  public fileUploadSuccess = 0;
  public resultMessage = '';
  public exception = 'active';
  public speed = 0;
  public saving = false;

  public cid;

  constructor(
    private message: NzMessageService,
    private modalSubject: NzModalRef,
    private authService: AuthService,
    private customDataService: CustomDatasService,
    private menuService: MenuService,
    private materialsService: MaterialsService,) {

    // this.publisherList = [...this.customDataService.productList];

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  ngOnInit() {
    this.getImageSizeList();
  }


  getImageSizeList() {
    let params;
    if (this.menuService.currentPublisherId != 7) {
      params = {
        publisher_id: this.menuService.currentPublisherId,
        type: this.type === 'logo' ? 'logo' : 'default',
      };
    } else {
      params = {
        publisher_id: this.menuService.currentPublisherId,
      };
    }
    this.materialsService.getImageSize(params).subscribe(result => {
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

    if (this.menuService.currentPublisherId == 7) {
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
      this.message.error('文件格式不对，请重新上传', { nzDuration: 2000 });
      this.fileList = [];
    }

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
      this.fileObj[result1['md5']] = result;

      if (result.message == "") {
        this.checkImage(this.fileObj[result1['md5']]);
      }
      this.fileList = Object.values(this.fileObj);
    });


    readerMd5.readAsArrayBuffer(file);
    readerWidth.readAsDataURL(file);
    return false;
  }


  changeBtn() {
    this.resultMessage = '';
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }


  checkImage(fileInfo: IUploadImageFileInfo) {
    fileInfo.message = '图片校验中...';
    this.materialsService.checkImageMd5(fileInfo.md5, { cid: this.cid, publisher_id: this.menuService.currentPublisherId }).subscribe(result => {
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
    formData.append('publisher_id', this.menuService.currentPublisherId + '');
    formData.append('upload_file', fileInfo['file']);
    fileInfo.message = '上传中...';
    this.materialsService.uploadImageMaterials(formData, this.cid).subscribe(

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


  doSave() {
    if (this.saving) {
      return;
    }
    this.saving = true;


    if (this.defaultData.material_tags) {
      this.defaultData.material_tags = this.defaultData.material_tags.replace(/,|，/g, "");
      this.defaultData.material_tags = this.defaultData.material_tags.replace(/\s+/g, ",");
    }

    const postData = {
      publisher_id: this.menuService.currentPublisherId,
      material_tags: this.defaultData.material_tags,
      data_list: []
    };

    this.fileList.forEach(item => {
      if (item.uploadStatus) {
        postData.data_list.push({
          material_name: item.title,
          ...item.uploadData
        });
      }
    });

    if (postData.data_list.length > 0) {
      this.materialsService.saveImageInfo(postData, { cid: this.cid }).subscribe(result => {
        if (result['status_code'] == 200) {
          this.message.success('保存成功');
          this.modalSubject.destroy('onOk');
          this.saving = false;
        } else {
          this.message.error(result['message']);
          this.saving = false;
        }


      });
    } else {
      this.message.info('请选择图片');
      this.saving = false;
    }

  }

  deleteFile(data, index) {
    delete this.fileObj[data.md5];
    this.fileList = this.fileList.filter(item => {
      return item['md5'] !== data['md5'];
    });
  }

}
