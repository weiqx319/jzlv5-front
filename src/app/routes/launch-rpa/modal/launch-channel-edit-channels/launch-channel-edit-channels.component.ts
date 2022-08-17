import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LaunchRpaService } from '../../service/launch-rpa.service';
import { UploadImageMaterialsComponent } from "../upload-image-materials/upload-image-materials.component";
import { LaunchMaterialCoverModalComponent } from "../launch-material-cover-modal/launch-material-cover-modal.component";
import { DatePipe } from "@angular/common";
import { deepCopy } from "@jzl/jzl-util";


@Component({
  selector: 'app-launch-channel-edit-channels',
  templateUrl: './launch-channel-edit-channels.component.html',
  styleUrls: ['./launch-channel-edit-channels.component.scss'],
  providers: [DatePipe],
})
export class LaunchChannelEditChannelsComponent implements OnInit {
  @Input() checkedData;
  // public defaultData = [
  //   { name: 'version_name', value: '', label_text: '版本名称:', is_open: false },
  //   { name: 'developer', value: '', label_text: 'APP开发者:', is_open: false },
  //   { name: 'permission', value: '', label_text: 'App权限链接:', is_open: false },
  //   { name: 'privacy', value: '', label_text: 'App隐私政策链接:', is_open: false },
  //   { name: 'update_time', value: '', label_text: 'App更新时间:', is_open: false },
  //   {
  //     name: 'app_logo_image_id',
  //     value: '',
  //     imgUrl: "",   //  头像路径
  //     app_logo: {},
  //     label_text: 'App头像:',
  //     is_open: false
  //   }
  // ];

  public defaultData = {
    'version_name': { value: '', label_text: '版本名称:', is_open: false },
    'developer': { value: '', label_text: 'APP开发者:', is_open: false },
    'permission': { value: '', label_text: 'App权限链接:', is_open: false },
    'privacy': { value: '', label_text: 'App隐私政策链接:', is_open: false },
    'update_time': { value: '', label_text: 'App更新时间:', is_open: false },
    'app_logo_image_id': {
      value: '',
      imgUrl: "",   //  头像路径
      app_logo: {},
      label_text: 'App头像:',
      is_open: false
    }
  };
  public defaultDataKeys = Object.keys(this.defaultData);

  public checkErrorTip = {
    version_name: {
      is_show: false,
      dirty: false,
      tip_text: '版本名称不能为空',
    },
    developer: {
      is_show: false,
      dirty: false,
      tip_text: 'APP开发者不能为空'
    },
    permission: {
      is_show: false,
      dirty: false,
      tip_text: 'App权限链接不能为空'
    },
    privacy: {
      is_show: false,
      dirty: false,
      tip_text: 'App隐私政策链接不能为空'
    },
    update_time: {
      is_show: false,
      dirty: false,
      tip_text: 'App更新时间不能为空'
    },
    app_logo_image_id: {
      is_show: false,
      dirty: false,
      tip_text: '请选择APP头像'
    },
  };

  constructor(
    private message: NzMessageService,
    private modalSubject: NzModalRef,
    public launchRpaService: LaunchRpaService,
    private modalService: NzModalService,
    private datePipe: DatePipe) {
  }

  ngOnInit() {

  }

  checkBasicData(name?) {
    if (name) {
      this.checkErrorTip[name]['dirty'] = true;
    }
    let isValid = false;
    //以http或https开头的正则表达式
    const regexp: RegExp = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/;

    // 版本名称
    if (!this.defaultData['version_name'].value && this.checkErrorTip.version_name.dirty) {
      this.checkErrorTip.version_name.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.version_name.is_show = false;
    }

    // APP开发者
    if (!this.defaultData['developer'].value && this.checkErrorTip.developer.dirty) {
      this.checkErrorTip.developer.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.developer.is_show = false;
    }

    // App权限链接
    if (this.checkErrorTip.permission.dirty) {
      if (!this.defaultData['permission'].value) {
        this.checkErrorTip.permission.is_show = true;
        this.checkErrorTip.permission.tip_text = 'App权限链接不能为空';
        isValid = true;
      } else if (!regexp.test(this.defaultData['permission'].value)) {
        this.checkErrorTip.permission.is_show = true;
        this.checkErrorTip.permission.tip_text = '必须输入url链接';
        isValid = true;
      } else {
        this.checkErrorTip.permission.is_show = false;
      }
    }
    // App隐私政策链接
    if (this.checkErrorTip.privacy.dirty) {
      if (!this.defaultData['privacy'].value) {
        this.checkErrorTip.privacy.is_show = true;
        this.checkErrorTip.privacy.tip_text = 'App隐私政策链接不能为空';
        isValid = true;
      } else if (!regexp.test(this.defaultData['privacy'].value)) {
        this.checkErrorTip.privacy.is_show = true;
        this.checkErrorTip.privacy.tip_text = '必须输入url链接';
        isValid = true;
      } else {
        this.checkErrorTip.privacy.is_show = false;
      }
    }
    // App更新时间
    if (!this.defaultData['update_time'].value && this.checkErrorTip.update_time.dirty) {
      this.checkErrorTip.update_time.is_show = true;
      isValid = true;
    } else {
      this.checkErrorTip.update_time.is_show = false;
    }
    return isValid;
  }

  //用户上传APP头像
  uploadAppLogo() {
    const add_modal = this.modalService.create({
      nzTitle: '上传APP头像',
      nzWidth: 850,
      nzContent: UploadImageMaterialsComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'upload-image-materials',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {

      }
    });

  }
  //从图库选择APP头像
  openGallery(data, cssType) {
    const add_modal = this.modalService.create({
      nzTitle: '品牌图片库',
      nzWidth: 1300,
      nzContent: LaunchMaterialCoverModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data.app_logo,
        cssType: Number(cssType),
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result !== null && typeof result === 'object' && result.result == 'ok') {
        for (const item of Object.keys(result['data'][0])) {
          data.app_logo[item] = result['data'][0][item];
        }
        data.value = result['data'][0]['material_id'];
        data.imgUrl = result['data'][0]['preview_img'];
      }
    });
  }


  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    // 校验表单
    // 未选择的数量
    let isCloseData = 0;
    for (const key in this.defaultData) {
      if (this.defaultData[key].is_open) {
        this.checkErrorTip[key]['dirty'] = true;
      } else {
        isCloseData++;
      }
    }
    // 如果用户一个都没选，提示请选择
    if (isCloseData === this.defaultDataKeys.length) {
      this.message.error('请选择您要编辑的内容');
      return;
    }

    const isValid = this.checkBasicData();

    if (isValid) {
      this.message.error('请完善参数信息！');
      return;
    }

    const tempData = deepCopy(this.defaultData);

    if (tempData.update_time.value) {
      tempData.update_time.value = this.datePipe.transform(new Date(tempData.update_time.value), "yyyy-MM-dd");
    }

    const reqParams = {
      'batch_update_type': 'android_info',
      'select_ids': this.checkedData.map(item => item.convert_channel_id),
      'data': tempData
    };

    this.launchRpaService.updateChannelsByUc(reqParams).subscribe(data => {
      if (data['status_code'] && data.status_code === 200) {
        this.message.success(data.message);
        this.modalSubject.destroy('onOk');
      } else {
        this.message.error(data.message);
      }
    }, (err) => {

    }, () => {

    });

  }
}
