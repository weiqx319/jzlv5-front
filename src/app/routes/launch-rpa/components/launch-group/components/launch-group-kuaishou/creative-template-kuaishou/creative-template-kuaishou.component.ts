import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { LaunchService } from "../../../../../../../module/launch/service/launch.service";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { MenuService } from "../../../../../../../core/service/menu.service";
import { LaunchMaterialVideoModalComponent } from "../../../../../modal/launch-material-video-modal/launch-material-video-modal.component";
import { isArray, isObject } from "@jzl/jzl-util";
import { LaunchMaterialImageModalComponent } from "../../../../../modal/launch-material-image-modal/launch-material-image-modal.component";
import { LaunchTitleModalComponent } from "../../../../../modal/launch-title-modal/launch-title-modal.component";
import { LaunchMaterialCoverModalComponent } from "../../../../../modal/launch-material-cover-modal/launch-material-cover-modal.component";
import { UploadImageMaterialsComponent } from "../../../../../modal/upload-image-materials/upload-image-materials.component";

@Component({
  selector: 'app-creative-template-kuaishou',
  templateUrl: './creative-template-kuaishou.component.html',
  styleUrls: ['./creative-template-kuaishou.component.scss']
})
export class CreativeTemplateKuaishouComponent implements OnInit, OnChanges {

  @ViewChild('tree', { static: true }) private tree: NzTreeComponent;

  @Input() materialData;
  @Input() chan_pub_id;
  @Input() accountsList;

  @Input() defaultData;
  @Input() targetChannelList;
  @Input() adcreativeData;
  @Input() creativeElementsList;
  @Input() creativeLabelList;

  @Input() actionBarList;
  @Input() exposeTagList;
  @Input() creativeCategoryList;

  @Input() elementNamesList;
  @Input() checkErrorTip;

  public cid;
  public user_id;
  public publisherId;
  public treeSearchValue;
  public creativeMapTagList = [];
  public allKeys = [];
  public chanPubIdList = [];

  public curDeliveryIndex = 0;

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
    const mapData = this.creativeLabelList['map'];
    this.allKeys = this.adcreativeData['creative_tag_label'];
    for (const index of this.allKeys) {
      if (mapData[index]) {
        this.creativeMapTagList.push(...mapData[index]);
      }
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chan_pub_id']) {
      if (this.chan_pub_id.length > 0) {
        this.chan_pub_id.forEach((item, index) => {
          const data = this.accountsList.find(value => value.chan_pub_id === item);
          if (data && !this.chanPubIdList.find(s_item => s_item.id === item)) {
            this.chanPubIdList.push({ name: data.pub_account_name, id: data.chan_pub_id });
          }
        });
      } else {
        this.chanPubIdList = [];
      }
    }
  }

  // 打开素材库
  openMaterials(data: any[], cssType: number) {
    if (this.adcreativeData['creative_material_type'] < 3) {
      this.addMaterials(data);
    }
    if (this.adcreativeData['creative_material_type'] && this.adcreativeData['creative_material_type'] > 2) {
      this.addImageMaterials(data, cssType);
    }
  }

  addMaterials(data: any[]) {
    const add_modal = this.modalService.create({
      nzTitle: '视频素材库',
      nzWidth: 1300,
      nzContent: LaunchMaterialVideoModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (isObject(result) && result.result == 'ok') {
        this.materialData.single_adgroup_material_num = result['data'].length > 5 ? 5 : result['data'].length > this.materialData.single_adgroup_material_num ? result['data'].length : this.materialData.single_adgroup_material_num;
        result['data'].forEach(item => {
          if (!item.hasOwnProperty("short_slogan")) {
            item["short_slogan"] = [];
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
          if (!item.hasOwnProperty("short_slogan")) {
            item["short_slogan"] = [];
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
      nzTitle: '选择广告语',
      nzWidth: 1300,
      nzContent: LaunchTitleModalComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {
        defaultSelectedList: data,
        chan_pub_id: this.chan_pub_id,
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
      }
    });
  }

  changeTitleByChannel(value) {
    this.materialData.single_adgroup_material_num = 1;
    this.materialData.single_adgroup_title_num = 1;
    this.materialData.material_type_lst['all']['short_slogan'] = [];
    this.materialData.material_type_lst['all']['description'] = [];
    this.materialData.material_type_lst['all']['materials'].forEach(s_item => {
      s_item.short_slogan = [];
      s_item.description = [];
    });
    this.targetChannelList.forEach(item => {
      this.materialData.material_type_lst[item.convert_channel_id]['short_slogan'] = [];
      this.materialData.material_type_lst[item.convert_channel_id]['description'] = [];
      this.materialData.material_type_lst[item.convert_channel_id]['materials'].forEach(s_item => {
        s_item.short_slogan = [];
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
    this.materialData.material_type_lst['all'] = { materials: [], short_slogan: [], description: [] };
    this.targetChannelList.forEach(item => {
      this.materialData.material_type_lst[item.convert_channel_id] = { materials: [], short_slogan: [], description: [] };
    });
    this.getItemErrorTip('single_adgroup_material_num', this.materialData.single_adgroup_material_num);
    this.getItemErrorTip('single_adgroup_title_num', this.materialData.single_adgroup_title_num);
  }

  transferTreeChange(sourceData, data: any[]) {
    sourceData['creative_tag'] = [...data];
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

  nzTreeChange(data) {
    const mapData = this.creativeLabelList['map'];
    this.creativeMapTagList = [];
    this.allKeys = [];
    this.getTreeCheckedKeys(this.tree.getCheckedNodeList());
    this.adcreativeData['creative_tag_label'] = this.allKeys;
    for (const index of this.allKeys) {
      if (mapData[index]) {
        this.creativeMapTagList.push(...mapData[index]);
      }
    }
  }
  addMapTag(item) {
    if (this.adcreativeData.creative_tag.indexOf(item) > -1) {
      this.adcreativeData.creative_tag.splice(this.adcreativeData.creative_tag.indexOf(item), 1);
    } else {
      if (this.adcreativeData.creative_tag.length > 9) {
        this.message.info('最多只能选十个');
        return;
      }
      this.adcreativeData.creative_tag.push(item);
    }
    this.getItemErrorTip('creative_tag',this.adcreativeData.creative_tag);
  }

  getTreeCheckedKeys(source: NzTreeNode[]) {
    source.map(item => {
      if (item.isChecked) {
        this.allKeys.push(item.key);
      }
      if (item.children.length > 0) {
        this.getTreeCheckedKeys(item.children);
      }
    });
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
                if ((this.adcreativeData.creative_material_type == 4 && s_item.short_slogan.length <= 0) || (s_item.description.length <= 0) || (this.adcreativeData.creative_material_type == 4 && s_item.short_slogan.length !== s_item.description.length)) {
                  materialTitleList.push(true);
                }
              }
            }
          } else {
            if (this.materialData.material_type_lst[item].materials.length <= 0) {
              materialList.push(true);
            }

            if (this.adcreativeData.creative_material_type == 4 && this.materialData.material_type_lst[item].short_slogan.length !== this.materialData.material_type_lst[item].description.length) {
              titleList.push(true);
            }

            if ((this.adcreativeData.creative_material_type == 4 && this.materialData.material_type_lst[item].short_slogan.length !== this.materialData.material_type_lst[item].description.length) || this.materialData.material_type_lst[item].description.length < 1) {
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
            if ((this.adcreativeData.creative_material_type == 4 && s_item.short_slogan.length <= 0) || s_item.description.length <= 0 || (this.adcreativeData.creative_material_type == 4 && s_item.short_slogan.length !== s_item.description.length)) {
              materialTitleList.push(true);
            }
          }
        }
      } else {
        if (this.materialData.material_type_lst['all'].materials.length <= 0) {
          materialList.push(true);
        }

        if ((this.adcreativeData.creative_material_type == 4 && this.materialData.material_type_lst['all'].short_slogan.length !== this.materialData.material_type_lst['all'].description.length)) {
          titleList.push(true);
        }

        if ((this.adcreativeData.creative_material_type == 4 && this.materialData.material_type_lst['all'].short_slogan.length !== this.materialData.material_type_lst['all'].description.length) || this.materialData.material_type_lst['all'].description.length < 1) {
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
        this.checkErrorTip.title_lst.tip_text = '请选择短广告语，如有长短广告语，数量须保持一致';
      } else {
        this.checkErrorTip.title_lst.tip_text = '请根据渠道号分别选择短广告语，如有长短广告语，数量须保持一致';
      }
      this.checkErrorTip.title_lst.is_show = true;
    } else {
      this.checkErrorTip.title_lst.is_show = false;
    }

    if (descriptionList.some((item) => item)) {
      if (!this.materialData.by_channel_set_material) {
        this.checkErrorTip.description_lst.tip_text = '请选择长广告语，如有长短广告语，数量须保持一致';
      } else {
        this.checkErrorTip.description_lst.tip_text = '请根据渠分别道号选择长广告语，如有长短广告语，数量须保持一致';
      }
      this.checkErrorTip.description_lst.is_show = true;
    } else {
      this.checkErrorTip.description_lst.is_show = false;
    }

    if (materialTitleList.some((item) => item)) {
      if (!this.materialData.by_channel_set_material) {
        this.checkErrorTip.material_title_lst.tip_text = '请选择素材，素材下广告语不能为空，如有长短广告语，数量须保持一致';
      } else {
        this.checkErrorTip.material_title_lst.tip_text = '请根据渠道号选择素材,素材下广告语不能为空，如有长短广告语，数量须保持一致';
      }
      this.checkErrorTip.material_title_lst.is_show = true;
    } else {
      this.checkErrorTip.material_title_lst.is_show = false;
    }
  }

}
