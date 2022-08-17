import {
  Component, ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output, TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { differenceInCalendarDays, differenceInCalendarMonths, format } from "date-fns";
import { LaunchService } from "../../../../../../../module/launch/service/launch.service";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { GlobalTemplateComponent } from "../../../../../../../shared/template/global-template/global-template.component";


import { deepCopy, isArray } from '@jzl/jzl-util';
import { MenuService } from "../../../../../../../core/service/menu.service";
import { LaunchMaterialImageModalComponent } from "../../../../../modal/launch-material-image-modal/launch-material-image-modal.component";
import { isObject } from "@jzl/jzl-util";
import { LaunchMaterialVideoModalComponent } from "../../../../../modal/launch-material-video-modal/launch-material-video-modal.component";
import { LaunchTitleModalComponent } from "../../../../../modal/launch-title-modal/launch-title-modal.component";
import { LaunchMaterialCoverModalComponent } from "../../../../../modal/launch-material-cover-modal/launch-material-cover-modal.component";
import { UploadImageMaterialsComponent } from "../../../../../modal/upload-image-materials/upload-image-materials.component";
import { DisabledTimeFn } from "ng-zorro-antd/date-picker";

@Component({
  selector: 'app-creative-template-gdt',
  templateUrl: './creative-template-gdt.component.html',
  styleUrls: ['./creative-template-gdt.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreativeTemplateGdtComponent implements OnInit {
  @ViewChild('brand_name', { static: true }) brand_name: TemplateRef<any>;
  @ViewChild('brand_img', { static: true }) brand_img: TemplateRef<any>;
  @ViewChild('countdown_expiring_timestamp', { static: true }) countdown_expiring_timestamp: TemplateRef<any>;
  @ViewChild('label', { static: true }) label: TemplateRef<any>;
  @ViewChild('button_text', { static: true }) button_text: TemplateRef<any>;
  @ViewChild('bottom_text', { static: true }) bottom_text: TemplateRef<any>;

  @Input() materialData;
  @Input() defaultData;
  @Input() targetChannelList;
  @Input() adcreativeData;
  @Input() creativeElementsList;
  @Input() creativeLabelList;
  @Input() buttonTextList;
  @Input() elementNamesList;
  @Input() checkErrorTip;
  @Input() siteSet;

  public cid;
  public user_id;
  public publisherId;

  public curDeliveryIndex = 0;

  public today = new Date();

  public getTemplateRef(name) {
    if (this[name] != undefined) {
      return this[name];
    } else {
      return null;
    }
  }

  constructor(
    private launchService: LaunchService,
    private authService: AuthService,
    private message: NzMessageService,
    private modalService: NzModalService,
    public launchRpaService: LaunchRpaService,
    private menuService: MenuService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;
    this.publisherId = this.menuService.currentPublisherId;
  }


  ngOnInit() {

  }

  // 打开素材库
  openMaterials(data: any[], cssType: number) {
    if (this.elementNamesList.includes('video') || this.elementNamesList.includes('short_video1')) {
      this.addMaterials(data);
    }
    if ((!this.elementNamesList.includes('video') && !this.elementNamesList.includes('short_video1')) && (this.elementNamesList.includes('image') || this.elementNamesList.includes('image_list'))) {
      this.addImageMaterials(data, cssType);
    }
  }

  addMaterials(data: any[]) {
    let video_type;
    switch (this.adcreativeData.adcreative_template_id) {
      case 1708:
        video_type = 1;
        break;
      case 1465:
        video_type = 1;
        break;
      case 929:
        video_type = 1;
        break;
      case 720:
        video_type = 1;
        break;
      case 452:
        video_type = 1;
        break;
      case 721:
        video_type = 2;
        break;
      case 560:
        video_type = 2;
        break;
      case 618:
        video_type = 3;
        break;
    }

    const add_modal = this.modalService.create({
      nzTitle: '视频素材库',
      nzWidth: 1300,
      nzContent: LaunchMaterialVideoModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data,
        video_type: video_type,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        this.materialData.single_adgroup_material_num = result['data'].length > 5 ? 5 : result['data'].length > this.materialData.single_adgroup_material_num ? result['data'].length : this.materialData.single_adgroup_material_num;
        result['data'].forEach(item => {
          if (!item.hasOwnProperty("title")) {
            item["title"] = [];
          }
          if (!item.hasOwnProperty("description")) {
            item["description"] = [];
          }
        });
        data.splice(0, data.length, ...result['data']);
        this.getMaterialErrorTip();
      }
    });
  }


  // 图片素材库
  addImageMaterials(data: any[], cssType) {
    const add_modal = this.modalService.create({
      nzTitle: '图片素材库',
      nzWidth: 1300,
      nzContent: LaunchMaterialImageModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data,
        cssType: Number(cssType),
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        this.materialData.single_adgroup_material_num = result['data'].length > 5 ? 5 : result['data'].length > this.materialData.single_adgroup_material_num ? result['data'].length : this.materialData.single_adgroup_material_num;
        result['data'].forEach(item => {
          if (!item.hasOwnProperty("title")) {
            item["title"] = [];
          }
          if (!item.hasOwnProperty("description")) {
            item["description"] = [];
          }
        });
        data.splice(0, data.length, ...result['data']);
        this.getMaterialErrorTip();
      }
    });
  }

  // 标题库
  addLaunchTitle(data: any[], type?) {
    let min_length;
    let max_length;
    const findData = type ? this.creativeElementsList.find(item => item.key === type) : null;
    if (findData) {
      min_length = findData.restriction.min_length;
      max_length = findData.restriction.max_length;
    }

    const add_modal = this.modalService.create({
      nzTitle: '选择标题库',
      nzWidth: 1300,
      nzContent: LaunchTitleModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data,
        min_length: min_length,
        max_length: max_length,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        this.materialData.single_adgroup_title_num = result['data'].length > 5 ? 5 : result['data'].length > this.materialData.single_adgroup_title_num ? result['data'].length : this.materialData.single_adgroup_title_num;
        data.splice(0, data.length, ...result['data']);
        this.getMaterialErrorTip();
      }
    });
  }


  openBrand(data, cssType) {
    const add_modal = this.modalService.create({
      nzTitle: '品牌图片库',
      nzWidth: 1300,
      nzContent: LaunchMaterialCoverModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data,
        cssType: Number(cssType),
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        for (const item of Object.keys(result['data'][0])) {
          data[item] = result['data'][0][item];
        }
        this.adcreativeData.adcreative_elements.brand_img = result['data'][0]['preview_img'];
        this.adcreativeData.adcreative_elements.brand_img_md5 = result['data'][0]['material_md5'];
        this.getItemErrorTip('brand_img', this.adcreativeData.adcreative_elements.brand_img);
      }
    });
  }

  changeTitleByChannel(value) {
    this.materialData.single_adgroup_material_num = 1;
    this.materialData.single_adgroup_title_num = 1;
    this.materialData.material_type_lst['all']['titles'] = [];
    this.materialData.material_type_lst['all']['description'] = [];
    this.materialData.material_type_lst['all']['materials'].forEach(s_item => {
      s_item.title = [];
      s_item.description = [];
    });
    this.targetChannelList.forEach(item => {
      this.materialData.material_type_lst[item.convert_channel_id]['titles'] = [];
      this.materialData.material_type_lst[item.convert_channel_id]['description'] = [];
      this.materialData.material_type_lst[item.convert_channel_id]['materials'].forEach(s_item => {
        s_item.title = [];
        s_item.description = [];
      });
    });
    if (value) {
      this.materialData.single_adgroup_material_num = 1;
    }
    this.getItemErrorTip('single_adgroup_material_num', this.materialData.single_adgroup_material_num);
    this.getItemErrorTip('single_adgroup_title_num', this.materialData.single_adgroup_title_num);
  }

  clearAllSelected(data: any[], type) {
    data.splice(0, data.length);
    if (type === 'title') {
      this.materialData.single_adgroup_title_num = 1;
    } else {
      this.materialData.single_adgroup_material_num = 1;
    }
    this.getMaterialErrorTip();
  }

  clearSingleSelected(data: any[], index: number, type) {
    data.splice(index, 1);
    if (type === 'title') {
      this.materialData.single_adgroup_title_num = data.length < 5 ? data.length < this.materialData.single_adgroup_title_num ? this.materialData.single_adgroup_title_num : data.length : 5;
    } else {
      this.materialData.single_adgroup_material_num = data.length < 5 ? data.length < this.materialData.single_adgroup_material_num ? this.materialData.single_adgroup_material_num : data.length : 5;
    }
    this.getMaterialErrorTip();
  }

  changeMaterialByChannel() {
    this.materialData.single_adgroup_material_num = 1;
    this.materialData.single_adgroup_title_num = 1;
    this.materialData.material_type_lst['all'] = { materials: [], titles: [], description: [] };
    this.targetChannelList.forEach(item => {
      this.materialData.material_type_lst[item.convert_channel_id] = { materials: [], titles: [], description: [] };
    });
    this.getItemErrorTip('single_adgroup_material_num', this.materialData.single_adgroup_material_num);
    this.getItemErrorTip('single_adgroup_title_num', this.materialData.single_adgroup_title_num);
  }

  transferTreeChange(sourceData, data: any[]) {
    sourceData['label'] = [...data];
    this.getItemErrorTip('label', this.adcreativeData['adcreative_elements']['label']);
  }

  uploadMaterials() {
    const add_modal = this.modalService.create({
      nzTitle: '批量上传',
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

  getDisableStartDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.today) < 0;
  }

  getDisabledStartTime: DisabledTimeFn = (_value, type) => {
    return {
      nzDisabledHours: () => this.range(0, new Date().getHours() + 1),
      nzDisabledMinutes: () => [],
      nzDisabledSeconds: () => []
    };
  }

  getDisableEndDate = (current: Date): boolean => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    return differenceInCalendarDays(current, date) <= 0;
  }

  range(start: number, end: number): number[] {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  // 获取单项的错误状态
  getItemErrorTip(key, data, max?) {
    if (isArray(data)) {
      if (data.length === 0 || (max && data.length > max)) {
        this.checkErrorTip[key].is_show = true;
      } else {
        this.checkErrorTip[key].is_show = false;
      }
    } else {
      if (!data) {
        this.checkErrorTip[key].is_show = true;
      } else {
        this.checkErrorTip[key].is_show = false;
      }
    }
  }

  // 素材选取错误验证
  getMaterialErrorTip() {
    // 素材选取
    const materialList = [];
    const materialTitleList = [];
    const titleList = [];
    const descriptionList = [];
    if (this.materialData.by_channel_set_material) {
      for (const item of Object.keys(this.materialData.material_type_lst)) {
        if (item !== 'all') {
          if (this.materialData.by_material_set_title) {
            if (this.materialData.material_type_lst[item].materials.length <= 0) {
              materialTitleList.push(true);
            } else if (this.materialData.material_type_lst[item].materials.length > 0) {
              for (const s_item of this.materialData.material_type_lst[item].materials) {
                if ((this.elementNamesList.includes('title') && s_item.title.length <= 0) || (this.elementNamesList.includes('description') && s_item.description.length <= 0) || (this.elementNamesList.includes('title') && this.elementNamesList.includes('description') && s_item.title.length !== s_item.description.length)) {
                  materialTitleList.push(true);
                }
              }
            }
          } else {
            if (this.materialData.material_type_lst[item].materials.length <= 0) {
              materialList.push(true);
            }

            if ((this.elementNamesList.includes('title') && this.materialData.material_type_lst[item].titles.length <= 0) || (this.elementNamesList.includes('title') && this.elementNamesList.includes('description') && this.materialData.material_type_lst[item].titles.length !== this.materialData.material_type_lst[item].description.length)) {
              titleList.push(true);
            }

            if ((this.elementNamesList.includes('description') && this.materialData.material_type_lst[item].description.length <= 0) || (this.elementNamesList.includes('title') && this.elementNamesList.includes('description') && this.materialData.material_type_lst[item].titles.length !== this.materialData.material_type_lst[item].description.length)) {
              descriptionList.push(true);
            }
          }
        }
      }
    } else {
      if (this.materialData.by_material_set_title) {
        if (this.materialData.material_type_lst['all'].materials.length <= 0) {
          materialTitleList.push(true);
        } else if (this.materialData.material_type_lst['all'].materials.length > 0) {
          for (const s_item of this.materialData.material_type_lst['all'].materials) {
            if ((this.elementNamesList.includes('title') && s_item.title.length <= 0) || (this.elementNamesList.includes('description') && s_item.description.length <= 0) || (this.elementNamesList.includes('title') && this.elementNamesList.includes('description') && s_item.title.length !== s_item.description.length)) {
              materialTitleList.push(true);
            }
          }
        }
      } else {
        if (this.materialData.material_type_lst['all'].materials.length <= 0) {
          materialList.push(true);
        }

        if ((this.elementNamesList.includes('title') && this.materialData.material_type_lst['all'].titles.length <= 0) || (this.elementNamesList.includes('title') && this.elementNamesList.includes('description') && this.materialData.material_type_lst['all'].titles.length !== this.materialData.material_type_lst['all'].description.length)) {
          titleList.push(true);
        }

        if ((this.elementNamesList.includes('description') && this.materialData.material_type_lst['all'].description.length <= 0) || (this.elementNamesList.includes('title') && this.elementNamesList.includes('description') && this.materialData.material_type_lst['all'].titles.length !== this.materialData.material_type_lst['all'].description.length)) {
          descriptionList.push(true);
        }
      }
    }

    if (materialList.some((item) => item)) {
      if (!this.materialData.by_channel_set_material) {
        this.checkErrorTip.material_lst.tip_text = '请选择素材';
      } else {
        this.checkErrorTip.material_lst.tip_text = '请根据渠道号分别选择素材';
      }
      this.checkErrorTip.material_lst.is_show = true;
    } else {
      this.checkErrorTip.material_lst.is_show = false;
    }

    if (titleList.some((item) => item)) {
      if (!this.materialData.by_channel_set_material) {
        this.checkErrorTip.title_lst.tip_text = '请选择短标题，如有长短标题，数量须保持一致';
      } else {
        this.checkErrorTip.title_lst.tip_text = '请根据渠道号分别选择短标题，如有长短标题，数量须保持一致';
      }
      this.checkErrorTip.title_lst.is_show = true;
    } else {
      this.checkErrorTip.title_lst.is_show = false;
    }

    if (descriptionList.some((item) => item)) {
      if (!this.materialData.by_channel_set_material) {
        this.checkErrorTip.description_lst.tip_text = '请选择长标题，如有长短标题，数量须保持一致';
      } else {
        this.checkErrorTip.description_lst.tip_text = '请根据渠分别道号选择长标题，如有长短标题，数量须保持一致';
      }
      this.checkErrorTip.description_lst.is_show = true;
    } else {
      this.checkErrorTip.description_lst.is_show = false;
    }

    if (materialTitleList.some((item) => item)) {
      if (!this.materialData.by_channel_set_material) {
        this.checkErrorTip.material_title_lst.tip_text = '请选择素材，素材下标题不能为空，如有长短标题，数量须保持一致';
      } else {
        this.checkErrorTip.material_title_lst.tip_text = '请根据渠道号选择素材,素材下标题不能为空，如有长短标题，数量须保持一致';
      }
      this.checkErrorTip.material_title_lst.is_show = true;
    } else {
      this.checkErrorTip.material_title_lst.is_show = false;
    }

  }
}
