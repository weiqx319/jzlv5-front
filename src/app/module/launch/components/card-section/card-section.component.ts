import { Component, Input, OnInit, ViewEncapsulation, SimpleChanges, OnChanges } from '@angular/core';
import { deepCopy } from "@jzl/jzl-util";
import { UploadImageMaterialsComponent } from "../../../../routes/materials/modal/upload-image-materials/upload-image-materials.component";
import { MaterialLibraryImageComponent } from "../../../../routes/materials/modal/material-library-image/material-library-image.component";
import { isArray } from "@jzl/jzl-util";
import { environment } from "../../../../../environments/environment";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../core/service/auth.service";
import { LaunchService } from "../../../../routes/materials/service/launch.service";
import { getStringLength } from '../../../../shared/util/util';

@Component({
  selector: 'app-card-section',
  templateUrl: './card-section.component.html',
  styleUrls: ['./card-section.component.scss'],
})
export class CardSectionComponent implements OnInit, OnChanges {

  @Input() adgroup: any;
  @Input() data: any;
  @Input() landing_type: any;
  @Input() promotion_card: any;
  @Input() cardTemplateId: any;
  @Input() errorTip;

  public apiData = [];
  public loading = true;
  public result_model = 'all';

  public tableHeight = document.body.clientHeight - 60 - 50 - 40 - 60;

  public defaultArr = {
    card_id: null,
    chan_pub_id: null,
    download_type: null,
    imgUrl: "",
    promo_card_setting: {
      product_description: "",
      product_points: [{ name: "", sellingPointsNameLength: 0 }],
      call_to_action: null,
      enable_personal_action: false,
      image_url: "",
      image_material_id: "",
      product_selling_points: [],
    }
  };
  public cardNameLength = 0;

  public pointsNumber = 1;

  public accountTemplate = [];

  public cid;

  public user_id;

  public settingsList = {};

  public downloadTypeList = [];

  public callToList = [];

  public downloadList = [];

  public externalList = [];

  public cardTemplateList = [];

  public oldDefault: any;


  constructor(private modalService: NzModalService,
    private router: Router,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private launchService: LaunchService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;
  }

  cardNameChange(data) {
    this.cardNameLength = getStringLength(data, []);
  }

  sellingNameChange(data) {
    data.sellingPointsNameLength = getStringLength(data.name, []);
  }

  changeAccountTemplate(id) {
    const data = this.accountTemplate.find(item => item.chan_pub_id === id);
    if (data && data.setting) {
      this.downloadTypeList = data.setting;
    }
  }

  changeDownloadType(key) {
    const data = this.downloadTypeList.find(item => item.key === key);
    if (data && data.value) {
      this.callToList = data.value;
    }
  }

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

  addMaterials(type = 'materials', data?) {
    const add_modal = this.modalService.create({
      nzTitle: '素材库',
      nzWidth: 1000,
      nzContent: MaterialLibraryImageComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'material-library',
      nzFooter: null,
      nzComponentParams: {},
    });
    add_modal.afterClose.subscribe(result => {
      if (result !== 'onCancel') {
        if (type == 'userImage') {
          const selectImage = JSON.parse(JSON.stringify(result));

          if (isArray(selectImage) && selectImage.length > 0) {
            data['promo_card_setting']['image_url'] = selectImage[0]['image_url'];
            data['promo_card_setting']['material_id'] = selectImage[0]['material_id'];
            data.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/image_material/image/' + selectImage[0]['material_id'] + '?&cid=' + this.cid;
          }
        }
      }
    });
  }

  getAccountTempalteDetail() {
    this.launchService
      .getTemplateUser({
        cid: this.cid,
        user_id: this.user_id,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            for (const item of result.data) {
              item.chan_pub_id = "" + item.chan_pub_id;
            }
            this.accountTemplate = result.data;
            if (this.data.card_template_id) {
              this.changeCardTemplate(this.data.card_template_id);
            }

            if (this.cardTemplateId) {
              this.getCardTemplateDetail();
            }
          }
        },
        (err: any) => {
        },
        () => {
        },
      );
  }

  getCardTemplateList(status?) {
    const body = {
      "pConditions": [
        {
          "key": "publisher_id",
          "name": "",
          "op": "=",
          "value": "7"
        }],
    };
    this.launchService
      .getCardTemplate(body, {
        cid: this.cid,
        user_id: this.user_id,
        result_model: 'all',
      })
      .subscribe(
        (results: any) => {
          if (results.status_code === 200) {
            this.downloadList = results['data'].filter(item => item.download_type === 'DOWNLOAD_URL');
            this.externalList = results['data'].filter(item => item.download_type === 'EXTERNAL_URL');
            if (this.landing_type === 'LINK') {
              this.cardTemplateList = this.externalList;
            } else if (this.adgroup.download_type === 'DOWNLOAD_URL') {
              this.cardTemplateList = this.downloadList;
            } else if (this.adgroup.download_type === 'EXTERNAL_URL') {
              this.cardTemplateList = this.externalList;
            }
            this.getAccountTempalteDetail();

          }
        },
        (err: any) => {
          this.message.error('数据获取异常，请重试');
        },
        () => {
        },
      );
  }

  changeCardTemplate(id) {
    const data = this.cardTemplateList.find(item => item.promo_card_template_id === id);
    this.data.card_template_id = id;
    this.pointsNumber = data.promo_card_setting.product_selling_points.length;
    this.defaultArr.card_id = id;
    this.defaultArr.promo_card_setting.product_points = [];
    this.defaultArr.chan_pub_id = data.chan_pub_id;
    this.defaultArr.download_type = data.download_type;
    this.defaultArr.promo_card_setting.product_description = data.promo_card_setting.product_description;
    this.defaultArr.promo_card_setting.call_to_action = data.promo_card_setting.call_to_action;
    this.defaultArr.promo_card_setting.enable_personal_action = data.promo_card_setting.enable_personal_action;
    this.defaultArr.promo_card_setting.image_url = data.promo_card_setting.image_url;
    this.defaultArr.promo_card_setting.image_material_id = data.promo_card_setting.material_id;
    this.defaultArr.promo_card_setting.product_selling_points = data.promo_card_setting.product_selling_points;

    this.defaultArr.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/image_material/image/' + data['promo_card_setting']['material_id'] + '?&cid=' + this.cid;
    for (const item of data.promo_card_setting.product_selling_points) {
      this.defaultArr.promo_card_setting.product_points.push({ name: item, sellingPointsNameLength: item.length });
    }

    this.changeAccountTemplate(data.chan_pub_id);
    this.changeDownloadType(data.download_type);

  }

  getCardTemplateDetail() {
    this.defaultArr.card_id = this.cardTemplateId;
    this.launchService
      .getCardTemplateInfo(this.cardTemplateId, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            const data = result['data'];
            this.pointsNumber = data.promo_card_setting.product_selling_points.length;
            this.cardNameLength = data.promo_card_setting.product_description.length;
            this.defaultArr.promo_card_setting.product_points = [];
            this.defaultArr.chan_pub_id = data.chan_pub_id;
            this.defaultArr.download_type = data.download_type;
            this.defaultArr.promo_card_setting.product_description = data.promo_card_setting.product_description;
            this.defaultArr.promo_card_setting.call_to_action = data.promo_card_setting.call_to_action;
            this.defaultArr.promo_card_setting.enable_personal_action = data.promo_card_setting.enable_personal_action;
            this.defaultArr.promo_card_setting.image_url = data.promo_card_setting.image_url;
            this.defaultArr.promo_card_setting.image_material_id = data.promo_card_setting.material_id;
            this.defaultArr.promo_card_setting.product_selling_points = data.promo_card_setting.product_selling_points;

            this.defaultArr.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/image_material/image/' + data['promo_card_setting']['material_id'] + '?&cid=' + this.cid;
            for (const item of data.promo_card_setting.product_selling_points) {
              this.defaultArr.promo_card_setting.product_points.push({ name: item, sellingPointsNameLength: item.length });
            }

            this.changeAccountTemplate(data.chan_pub_id);
            this.changeDownloadType(data.download_type);

          } else {
            this.message.error(result.message);
          }
        },
        (err: any) => {
        },
        () => { },
      );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.landing_type === 'LINK') {
      this.cardTemplateList = this.externalList;
    } else if (this.adgroup.download_type === 'DOWNLOAD_URL') {
      this.cardTemplateList = this.downloadList;
    } else if (this.adgroup.download_type === 'EXTERNAL_URL') {
      this.cardTemplateList = this.externalList;
    }
    // if(this.cardTemplateId && changes['cardTemplateId'] && !changes['cardTemplateId']['firstChange']) {
    //   this.getCardTemplateDetail();
    // }
    if (changes['promotion_card'] && this.promotion_card) {
      this.defaultArr = this.promotion_card;
    }

    if (changes['data'] && !changes['data']['firstChange'] && changes['data']['currentValue'] && changes['data']['currentValue']['card_template_id'] && changes['data']['currentValue']['card_template_id'] != this.defaultArr.card_id) {
      this.getCardTemplateList();
    }

  }

  ngOnInit() {
    this.oldDefault = deepCopy(this.defaultArr);
    this.getCardTemplateList();
  }

  resetData() {
    this.defaultArr = deepCopy(this.oldDefault);
  }

}
