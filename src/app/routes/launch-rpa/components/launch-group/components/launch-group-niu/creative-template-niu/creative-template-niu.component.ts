import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { LaunchService } from "../../../../../../../module/launch/service/launch.service";
import { AuthService } from "../../../../../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTreeComponent, NzTreeNode } from 'ng-zorro-antd/tree';
import { LaunchRpaService } from "../../../../../service/launch-rpa.service";
import { MenuService } from "../../../../../../../core/service/menu.service";
import { LaunchMaterialVideoModalComponent } from "../../../../../modal/launch-material-video-modal/launch-material-video-modal.component";
import { deepCopy, isArray, isObject } from "@jzl/jzl-util";
import { LaunchMaterialImageModalComponent } from "../../../../../modal/launch-material-image-modal/launch-material-image-modal.component";
import { LaunchTitleModalComponent } from "../../../../../modal/launch-title-modal/launch-title-modal.component";
import { LaunchMaterialCoverModalComponent } from "../../../../../modal/launch-material-cover-modal/launch-material-cover-modal.component";
import { UploadImageMaterialsComponent } from "../../../../../modal/upload-image-materials/upload-image-materials.component";

@Component({
  selector: 'app-creative-template-niu',
  templateUrl: './creative-template-niu.component.html',
  styleUrls: ['./creative-template-niu.component.scss']
})
export class CreativeTemplateNiuComponent implements OnInit, OnChanges {

  @ViewChild('tree', { static: true }) private tree: NzTreeComponent;

  @Input() campaignData;
  @Input() adgroupData;
  @Input() materialData;
  @Input() structConfig;
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
  @Input() curAccountsList;

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
  openMaterials(data: any[], cssType: number, maxLength?, index?) {
    this.addMaterials(data, maxLength, index);
  }

  addMaterials(data: any[], maxLength, index) {
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
        video_type:this.adcreativeData.creative_material_type,
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

        this.checkCreativeVideo();
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
      }
    });
  }

  // 标题库
  addLaunchTitle(data: any[], title, maxLength, type?) {
    let min_length;
    let max_length;
    const findData = type ? this.creativeElementsList.find(item => item.key === type) : null;
    if (findData) {
      min_length = findData.restriction.min_length;
      max_length = findData.restriction.max_length;
    }

    const add_modal = this.modalService.create({
      nzTitle: title,
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

        // 标题错误验证
        this.checkCreativeTitle(type);
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
    this.materialData.material_type_lst['custom_creative']['description'] = [];
    this.materialData.material_type_lst['custom_creative']['materials_list'].forEach(s_item => {
      s_item.forEach(item => {
        item.description = [];
      });
    });
    this.targetChannelList.forEach(item => {
      this.materialData.material_type_lst[item.convert_channel_id]['description'] = [];
      this.materialData.material_type_lst[item.convert_channel_id]['materials'].forEach(s_item => {
        s_item.short_slogan = [];
        s_item.description = [];
      });
    });
    if (value) {
      this.materialData.single_adgroup_material_num = 1;
    }
  }

  clearAllSelected(data: any[], type) {
    data.splice(0, data.length);
    if (type === 'title') {
      this.materialData.single_adgroup_title_num = 1;
    } else {
      this.materialData.single_adgroup_material_num = 1;
    }
    // 错误验证
    if (type === 'materials') {
      // 素材（视频）
      this.checkCreativeVideo();
    } else {
      // 标题
      this.checkCreativeTitle(type);
    }
  }

  clearSingleSelected(data: any[], index: number, type, maxLength?) {
    data.splice(index, 1);
    if (type === 'materials') {
      this.materialData.single_adgroup_material_num = data.length < 5 ? data.length < this.materialData.single_adgroup_material_num ? this.materialData.single_adgroup_material_num : data.length : 5;
    } else {
      this.materialData.single_adgroup_title_num = data.length < 5 ? data.length < this.materialData.single_adgroup_title_num ? this.materialData.single_adgroup_title_num : data.length : 5;
    }

    // 错误验证
    if (type === 'materials') {
      // 素材（视频）
      this.checkCreativeVideo();
    } else {
      // 标题
      this.checkCreativeTitle(type);
    }
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

  // 选择贴纸
  changeSelectStickerStyles(option, checkbox, creative) {
    if (!option.checked && creative.sticker_styles.length > 5) {
      return;
    }
    if (!checkbox) {
      option.checked = !option.checked;
    }
    creative.sticker_styles.length = 0;
    creative.sticker_styles_sub.forEach(element => {
      if (element.checked) {
        creative.sticker_styles.push(element.value);
      };
    });

    // 程序化创意错误验证
    this.checkProgramCreativeError();
  }

  // 修改商品推荐语
  changeRecommendation(event) {
    if (!this.adcreativeData.recommendation || this.adcreativeData.recommendation.length > 10) {
      this.checkErrorTip.recommendation.is_show = true;
    } else {
      this.checkErrorTip.recommendation.is_show = false;
    }
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

  // 添加创意组
  addCreativeMaterials(type, copyData?) {
    let materials;
    if (copyData) {
      // 复制
      materials = deepCopy(copyData);
    } else {
      // 新增
      materials = type === 'program_creative' ? { materials: [], description: [], cover_cfg: 1, cover_slogans: [], sticker_styles: [], sticker_styles_sub: deepCopy(this.structConfig.program_creative.sticker_styles.sub) } : [];
    }

    this.materialData.material_type_lst[type].materials_list.push(materials);

    // 程序化创意-错误提示对象
    if (type === 'program_creative') {
      const errorTip = deepCopy(this.checkErrorTip.program_creative_list[0]);
      if (!copyData) {
        // 新增
        for (const key in errorTip) {
          errorTip[key].is_show = false;
        }
      }
      this.checkErrorTip.program_creative_list.push(errorTip);
    }
  }
  // 删除创意组
  deleteCreativeMaterials(index, type) {
    if (index === 'clear') {
      this.materialData.material_type_lst[type].materials_list.length = 1;
      // 程序化创意-错误提示对象
      if (type === 'program_creative') {
        this.checkErrorTip.program_creative_list.length = 1;
      }
    } else if (this.materialData.material_type_lst[type].materials_list.length > 1) {
      this.materialData.material_type_lst[type].materials_list.splice(index, 1);
      // 程序化创意-错误提示对象
      if (type === 'program_creative') {
        this.checkErrorTip.program_creative_list.splice(index, 1);;
      }
    }
  }

  // 单创意组视频数修改
  changeCreativeMaterialNum() {
    this.checkCreativeVideo();
  }

  // 创意视频错误验证
  checkCreativeVideo() {
    if (this.adgroupData.unit_type === 7) {// 程序化创意
      this.checkProgramCreativeError();
    } else {// 自定义创意
      // 创意制作-素材错误状态验证
      const materialList = [];
      for (const s_item of this.materialData.material_type_lst['custom_creative'].materials_list) {
        if ((s_item.length === 0 || s_item.length > this.materialData.single_creative_material_num)) {
          materialList.push(true);
        }
      }
      if (materialList.some((item) => item)) {
        this.checkErrorTip.materials.tip_text = `每个创意组的视频不能为空，且最多选${this.materialData.single_creative_material_num}个`;
        this.checkErrorTip.materials.is_show = true;
      } else {
        this.checkErrorTip.materials.is_show = false;
      }
    }

  }
  // 创意标题错误验证
  checkCreativeTitle(type) {
    if (this.adgroupData.unit_type === 7) {// 程序化创意
      this.checkProgramCreativeError();
    } else {//自定义创意
      // 作品标题
      if (!this.materialData.by_material_set_title) {

        // 不分素材选标题错误验证
        if (type) {
          if (type === 'description') {
            this.checkErrorTip[type].tip_text = `作品标题不能为空`;
          }
          this.getItemErrorTip(type, this.materialData.material_type_lst.custom_creative[type]);
        }
      } else {
        // 分素材选标题错误验证
        const materialTitleList = [];
        for (const s_item of this.materialData.material_type_lst['custom_creative'].materials_list) {
          for (const iterator of s_item) {
            if ((iterator['description'].length === 0 || iterator['description'].length > 1)) {
              materialTitleList.push(true);
            }
          }
        }
        if (materialTitleList.some((item) => item)) {
          this.checkErrorTip.material_title_lst.is_show = true;
        } else {
          this.checkErrorTip.material_title_lst.is_show = false;
        }

      }
    }

  }

  // 程序化创意错误验证
  checkProgramCreativeError() {
    this.materialData.material_type_lst.program_creative.materials_list.forEach((element, index) => {
      // 创意组
      this.checkErrorTip.program_creative_list[index].program_creative.is_show = false;

      //素材选取-素材库
      if (element.materials.length === 0 || element.materials.length > 5) {
        this.checkErrorTip.program_creative_list[index].materials.is_show = true;
        this.checkErrorTip.program_creative_list[index].program_creative.is_show = true;

      } else {
        this.checkErrorTip.program_creative_list[index].materials.is_show = false;
      }

      // 作品标题
      if (element.description.length === 0 || element.description.length > 3) {
        this.checkErrorTip.program_creative_list[index].description.is_show = true;
        this.checkErrorTip.program_creative_list[index].program_creative.is_show = true;

      } else {
        this.checkErrorTip.program_creative_list[index].description.is_show = false;
      }

      // 封面广告语
      if (element.cover_slogans.length > 6) {
        this.checkErrorTip.program_creative_list[index].cover_slogans.is_show = true;
        this.checkErrorTip.program_creative_list[index].program_creative.is_show = true;
      } else {
        this.checkErrorTip.program_creative_list[index].cover_slogans.is_show = false;
      }

      // 贴纸
      if (element.sticker_styles.length === 0 || element.sticker_styles.length > 6) {
        this.checkErrorTip.program_creative_list[index].sticker_styles.is_show = true;
        this.checkErrorTip.program_creative_list[index].program_creative.is_show = true;
      } else {
        this.checkErrorTip.program_creative_list[index].sticker_styles.is_show = false;
      }
    });
  }
}

