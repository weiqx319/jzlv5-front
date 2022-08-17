import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from "../../../../../../core/service/auth.service";

import { getStringLength } from "../../../../../../shared/util/util";
import { UploadImageMaterialsComponent } from "../../../../modal/upload-image-materials/upload-image-materials.component";

import { isArray, isObject } from "@jzl/jzl-util";
import { environment } from "../../../../../../../environments/environment";

import { LaunchMaterialImageModalComponent } from "../../../../modal/launch-material-image-modal/launch-material-image-modal.component";
import { LaunchRpaService } from "../../../../service/launch-rpa.service";
import { MenuService } from "../../../../../../core/service/menu.service";

@Component({
  selector: 'app-card-template-section',
  templateUrl: './card-template-section.component.html',
  styleUrls: ['./card-template-section.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class CardTemplateSectionComponent implements OnInit {
  @Input() promotionCard;
  @Input() checkError;
  @Input() actionList;
  @Input() useProductImg;

  public activeType = {
    type: 'card_list'
  };

  public tableHeight = document.body.clientHeight - 60 - 50 - 40 - 60;

  public defaultArr = {};
  public cardNameLength = 0;

  public pointsNumber = 1;

  public accountTemplate = [];

  public cid;

  public user_id;

  public settingsList = {};

  public callToList = [];

  public imgUrl = "";

  public materialSlt = [];

  public downloadTypeList = [
    {
      key: "DOWNLOAD",
      name: "应用下载"
    },
    {
      key: "LANDING",
      name: "落地页"
    },
  ];

  constructor(
    private modalService: NzModalService,
    private router: Router,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    public launchRpaService: LaunchRpaService,
    public menuService: MenuService,
  ) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;
  }

  ngOnInit() {
    this.defaultArr = this.promotionCard;
    if (this.defaultArr['promo_card_setting']['material_id']) {
      this.imgUrl = environment.SERVER_API_URL_v6 + '/launch_rpa/image/image_material/image/' + this.defaultArr['promo_card_setting']['material_id'] + '?&cid=' + this.cid;
    }
    if (this.menuService.currentPublisherId !== 22) {
      this.getCardTemplateSetting();
    } else {
      this.imgUrl = this.defaultArr['promo_card_setting']['preview_img'];
      this.callToList = this.actionList;
    }
    if (this.defaultArr['promo_card_setting']['product_description']) {
      this.cardNameChange(this.defaultArr['promo_card_setting']['product_description']);
    }
  }

  addSellingPoints() {
    if (this.defaultArr['promo_card_setting']['product_points'].length < 10) {
      this.defaultArr['promo_card_setting']['product_points'].push({ name: '', sellingPointsNameLength: 0 });
      this.pointsNumber++;
    }
  }

  deleteSellingPoints(index) {
    this.defaultArr['promo_card_setting']['product_points'].splice(index, 1);
    this.pointsNumber--;
  }

  cardNameChange(data) {
    this.cardNameLength = getStringLength(data, []);
    this.getItemErrorTip('product_description', this.defaultArr['promo_card_setting']['product_description']);
  }

  sellingNameChange(data) {
    data.sellingPointsNameLength = getStringLength(data.name, []);
    this.getItemErrorTip('product_selling_points', data.name);
  }

  changeAccountTemplate(id) {

  }

  // changeDownloadType(key) {
  //   this.getCardTemplateSetting();
  // }

  uploadMaterials() {
    const add_modal = this.modalService.create({
      nzTitle: '上传头像',
      nzWidth: 800,
      nzContent: UploadImageMaterialsComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'upload-video-materials',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
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
        this.materialSlt = [JSON.parse(JSON.stringify(result['data']))[0]];
        if (isArray(this.materialSlt) && this.materialSlt.length > 0) {
          this.defaultArr['promo_card_setting']['image_url'] = this.materialSlt[0]['image_url'];
          this.defaultArr['promo_card_setting']['material_id'] = this.materialSlt[0]['material_id'];
          this.defaultArr['promo_card_setting']['preview_img'] = this.materialSlt[0]['preview_img'];
          this.defaultArr['promo_card_setting']['material_info'] = this.materialSlt[0];
          this.imgUrl = this.materialSlt[0]['preview_img'];
        }
        this.getItemErrorTip('material_id', this.defaultArr['promo_card_setting']['material_id']);
      }
    });
  }

  getCardTemplateSetting() {
    if (!this.defaultArr['chan_pub_id'] || !this.defaultArr['download_type']) {
      return;
    }
    const body = {
      chan_pub_id: this.defaultArr['chan_pub_id'],
      content_type: this.defaultArr['download_type'],
    };
    this.launchRpaService.getCardTemplateSetting(body, {
      cid: this.authService.getCurrentUserOperdInfo().select_cid,
      user_id: this.authService.getCurrentUserOperdInfo().select_uid,
      publisher_id: 7
    })
      .subscribe(
        (results: any) => {

          if (results.status_code !== 200) {

          } else {
            this.callToList = results['data'];
            if (this.callToList.length && !this.callToList.find(item => item === this.defaultArr['promo_card_setting']['call_to_action'])) {
              this.defaultArr['promo_card_setting']['call_to_action'] = "";
            }
          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }
  // 获取单项的错误状态
  getItemErrorTip(key, data, max?) {
    if (isArray(data)) {
      if (data.length === 0 || (max && data.length > max)) {
        this.checkError[key].is_show = true;
      } else {
        this.checkError[key].is_show = false;
      }
    } else {
      if (!data) {
        this.checkError[key].is_show = true;
      } else {
        this.checkError[key].is_show = false;
      }
    }
  }
}
