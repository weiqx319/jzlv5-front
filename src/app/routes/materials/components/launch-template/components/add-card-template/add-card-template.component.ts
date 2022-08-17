import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from "../../../../../../core/service/auth.service";
import { LaunchService } from "../../../../service/launch.service";
import { getStringLength } from "../../../../../../shared/util/util";
import { UploadImageMaterialsComponent } from "../../../../modal/upload-image-materials/upload-image-materials.component";
import { MaterialLibraryImageComponent } from "../../../../modal/material-library-image/material-library-image.component";
import { isArray } from "@jzl/jzl-util";
import { environment } from "../../../../../../../environments/environment";

@Component({
  selector: 'app-add-card-template',
  templateUrl: './add-card-template.component.html',
  styleUrls: ['./add-card-template.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AddCardTemplateComponent implements OnInit {

  public activeType = {
    type: 'card_list'
  };

  public tableHeight = document.body.clientHeight - 60 - 50 - 40 - 60;

  public defaultArr = {
    chan_pub_id: null,
    download_type: null,
    promo_card_template_name: "",
    promo_card_setting: {
      product_description: "",
      product_points: [{ name: "", sellingPointsNameLength: 0 }],
      call_to_action: null,
      enable_personal_action: false,
      image_url: "",
      material_id: null,
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

  public imgUrl = "";

  public cardTemplateId: any;

  public materialSlt = [];

  constructor(private modalService: NzModalService,
    private router: Router,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private launchService: LaunchService,) {
    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;

    this.cardTemplateId = this.route.snapshot.queryParams['promo_card_template_id'];
  }

  doCancel() {
    this.router.navigate(['/data_view/feed/materials/launch_template/launch_tab'], { queryParams: this.activeType });
  }

  doSave() {
    const { chan_pub_id, download_type, promo_card_template_name, promo_card_setting: { product_description, product_points, call_to_action, image_url } } = this.defaultArr;
    if (!promo_card_template_name) {
      this.message.error('请输入模板名称');
      return false;
    }
    if (!chan_pub_id) {
      this.message.error('请选择模板账户');
      return false;
    }
    if (!download_type) {
      this.message.error('请选择下载类型');
      return false;
    }
    if (!image_url) {
      this.message.error('请上传卡片主图');
      return false;
    }

    if (!product_description) {
      this.message.error('请输入卡片标题');
      return false;
    }

    for (const item of product_points) {
      if (!item.name) {
        this.message.error('请完善推广卖点名称');
        return false;
      }
      if (item.name.length < 6) {
        this.message.error('请输入6-9位的推广卖点字数');
        return false;
      }
    }

    if (!call_to_action) {
      this.message.error('请选择行动号召');
      return false;
    }

    const resultData = JSON.parse(JSON.stringify(this.defaultArr));

    resultData.promo_card_setting.product_selling_points = [];


    for (const item of resultData.promo_card_setting.product_points) {
      resultData.promo_card_setting.product_selling_points.push(item.name);
    }

    delete resultData.promo_card_setting.product_points;

    if (this.cardTemplateId) {
      delete resultData.download_type;
      delete resultData.chan_pub_id;
      this.launchService.updateCardTemplate(this.cardTemplateId, resultData, {
        cid: this.cid,
        user_id: this.user_id,
      }).subscribe((result) => {
        if (result['status_code'] === 200) {
          this.message.success('修改成功');
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error(result['message']);
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error(result['message']);
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
        this.router.navigate(['/data_view/feed/materials/launch_template/launch_tab'], { queryParams: this.activeType });
      });
    } else {
      this.launchService.createCardTemplate(resultData, {
        cid: this.cid,
        user_id: this.user_id,
      }).subscribe((result) => {
        if (result['status_code'] === 200) {
          this.message.success('新建成功');
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error(result['message']);
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error(result['message']);
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
        this.router.navigate(['/data_view/feed/materials/launch_template/launch_tab'], { queryParams: this.activeType });
      });
    }

  }

  addSellingPoints() {
    if (this.defaultArr.promo_card_setting.product_points.length < 10) {
      this.defaultArr.promo_card_setting.product_points.push({ name: '', sellingPointsNameLength: 0 });
      this.pointsNumber++;
    }
  }

  deleteSellingPoints(index) {
    this.defaultArr.promo_card_setting.product_points.splice(index, 1);
    this.pointsNumber--;
  }

  cardNameChange(data) {
    this.cardNameLength = getStringLength(data, []);
  }

  sellingNameChange(data) {
    data.sellingPointsNameLength = getStringLength(data.name, []);
  }

  changeAccountTemplate(id) {
    const data = this.accountTemplate.find(item => item.chan_pub_id == id);
    if (data && data.setting) {
      this.downloadTypeList = data.setting;
      if (!this.cardTemplateId) {
        this.defaultArr.download_type = null;
        this.defaultArr.promo_card_setting.call_to_action = null;
      }
    }
  }

  changeDownloadType(key) {
    const data = this.downloadTypeList.find(item => item.key === key);
    if (data && data.value) {
      this.callToList = data.value;
      if (!this.cardTemplateId) {
        this.defaultArr.promo_card_setting.call_to_action = null;
      }
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
      nzComponentParams: {
        materialSlt: this.materialSlt,
      },
    });
    add_modal.afterClose.subscribe(result => {
      if (result !== 'onCancel') {
        if (type == 'userImage') {
          this.materialSlt = [JSON.parse(JSON.stringify(result))[0]];

          if (isArray(this.materialSlt) && this.materialSlt.length > 0) {
            data['promo_card_setting']['image_url'] = this.materialSlt[0]['image_url'];
            data['promo_card_setting']['material_id'] = this.materialSlt[0]['material_id'];
            this.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/image_material/image/' + this.materialSlt[0]['material_id'] + '?&cid=' + this.cid;
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

  getCardTemplateDetail() {
    this.launchService
      .getCardTemplateInfo(this.cardTemplateId, {
        cid: this.cid,
      })
      .subscribe(
        (result: any) => {
          if (result.status_code && result.status_code === 200) {
            const data = JSON.parse(JSON.stringify(result['data']));
            this.pointsNumber = data.promo_card_setting.product_selling_points.length;
            this.cardNameLength = data.promo_card_setting.product_description.length;
            this.defaultArr.promo_card_setting.product_points = [];
            this.defaultArr.chan_pub_id = data.chan_pub_id;
            this.defaultArr.download_type = data.download_type;
            this.defaultArr.promo_card_template_name = data.promo_card_template_name;
            this.defaultArr.promo_card_setting.product_description = data.promo_card_setting.product_description;
            this.defaultArr.promo_card_setting.call_to_action = data.promo_card_setting.call_to_action;
            this.defaultArr.promo_card_setting.enable_personal_action = data.promo_card_setting.enable_personal_action;
            this.defaultArr.promo_card_setting.image_url = data.promo_card_setting.image_url;
            this.defaultArr.promo_card_setting.material_id = data.promo_card_setting.material_id;

            this.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/image_material/image/' + data['promo_card_setting']['material_id'] + '?&cid=' + this.cid;
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

  ngOnInit() {
    this.getAccountTempalteDetail();
  }
}
