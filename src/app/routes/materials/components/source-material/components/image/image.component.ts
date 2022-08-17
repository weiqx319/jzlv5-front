import { Component, HostListener, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../../../core/service/auth.service";
import { MenuService } from '../../../../../../core/service/menu.service';
import { MaterialsDetailModalComponent } from "../../../../modal/materials-detail-modal/materials-detail-modal.component";
import { UploadVideoMaterialsComponent } from "../../../../modal/upload-video-materials/upload-video-materials.component";
import { MaterialsService } from "../../../../service/materials.service";
import { UploadImageMaterialsComponent } from '../../../../modal/upload-image-materials/upload-image-materials.component';
import { MaterialsImageDetailModalComponent } from '../../../../modal/materials-image-detail-modal/materials-image-detail-modal.component';
import { deepCopy, formatBytes, formatDate } from "@jzl/jzl-util";
import { isArray, isObject } from "@jzl/jzl-util";

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ImageComponent implements OnInit {

  public imageSizeList = [];
  public imageSizeShowList = [];
  public imageStyleShowList = [];
  public cardList = [];

  public queryParams = {
    pConditions: [],
    sort_item: { key: "create_time", dir: "desc" }
  };

  public stringFilterOper = [
    { key: "=", name: "为" },
    { key: "!=", name: "不为" },
    { key: "like", name: "包含" },
    { key: "notlike", name: "不包含" }
  ];

  public sortItemList = [
    { key: "create_time", name: "上传时间" },
    { key: "material_name", name: "素材名称" },
    { key: "material_make_time", name: "素材制作时间" },
  ];

  public queryItem = {
    material_make_time: {
      key: 'material_make_time',
      name: "素材制作时间",
      op: "between",
      value: [],
    },
    create_time: {
      key: 'create_time',
      name: "上传时间",
      op: "between",
      value: [],
    },
    material_name: {
      key: 'material_name',
      name: "素材名称",
      op: "like",
      value: null
    },
    material_spec: {
      key: 'material_spec',
      name: "素材规格",
      op: "=",
      value: null
    },
    adcreative_css_id: {
      key: 'adcreative_css_id',
      name: "创意形式",
      op: "=",
      value: null
    },
    director_id: {
      key: 'director_id',
      name: "编导",
      op: "=",
      value: null
    },
    camerist_id: {
      key: 'camerist_id',
      name: "摄影",
      op: "=",
      value: null
    },
    movie_editor_id: {
      key: 'movie_editor_id',
      name: "剪辑",
      op: "=",
      value: null
    },
    material_tags: {
      key: 'material_tags',
      name: "标签",
      op: "or",
      value: null
    },
  };

  public authorRole = {
    '1': [],
    '2': [],
    '3': [],
  };

  public choreographerList = [];
  public photographList = [];
  public clipList = [];

  public tableHeight = document.body.clientHeight - 60 - 65 - 40;

  public publisher_id;

  public cardPage = {
    count: 0,
    pageSize: 50,
    currentPage: 1,
    pageSizeList: [10, 20, 50, 100, 200, 500, 1000, 5000],
  };

  public cid: any;

  public loading = false;

  constructor(
    public authService: AuthService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private router: Router,
    private route: ActivatedRoute,
    public menuService: MenuService,
    private materialsService: MaterialsService,
  ) {

    this.publisher_id = this.menuService.currentPublisherId;

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 65 - 40;
  }

  ngOnInit() {
    this.getImageSizeList();
    this.refreshData();
  }

  search() {
    this.queryParams.pConditions = [];
    Object.values(this.queryItem).forEach((item) => {
      if (item.key == 'create_time' || item.key == 'material_make_time') {
        if (isArray(item.value) && item.value.length == 2) {
          const queryResult = deepCopy(item);
          queryResult.value = formatDate(new Date(item.value[0]), 'yyyy/MM/dd') + '-' + formatDate(new Date(item.value[1]), 'yyyy/MM/dd');
          this.queryParams.pConditions.push(queryResult);
        }
      } else if (item.value) {
        this.queryParams.pConditions.push(item);
      }
    });
    this.cardPage.currentPage = 1;
    this.refreshData();
  }

  reset() {
    this.queryItem.create_time.value = [];
    this.queryItem.material_make_time.value = [];
    this.queryItem.material_tags.value = null;
    this.queryItem.material_name.value = null;
    this.queryItem.material_spec.value = null;
    this.queryItem.adcreative_css_id.value = null;
    this.cardPage.currentPage = 1;
    this.search();
  }

  refreshData() {
    this.loading = true;
    this.materialsService.getImageList(this.queryParams, {
      publisher_id: this.publisher_id,
      count: this.cardPage.pageSize,
      page: this.cardPage.currentPage,
      cid: this.cid
    }).subscribe(
      (results: any) => {
        if (results.status_code && results.status_code === 200) {
          this.loading = false;
          this.cardList = results['data']['detail'];
          this.cardPage.count = results['data']['detail_count'];
        } else if (results.status_code && results.status_code > 500) {
          this.cardList = [];
          this.loading = false;
          this.cardPage.count = 0;
        }
      },
      (err: any) => {
        this.loading = false;
      },
      () => {
        this.loading = false;
      },
    );
  }

  changeCardPage() {
    this.refreshData();
  }

  changeCardPageSize() {
    this.cardPage.currentPage = 1;
    this.refreshData();
  }

  materialsDetail(data) {
    if (data['material_id']) {
      const add_modal = this.modalService.create({
        nzTitle: '素材详情',
        nzWidth: 850,
        nzContent: MaterialsImageDetailModalComponent,
        nzClosable: false,
        nzMaskClosable: false,
        nzWrapClassName: 'materials-detail-modal',
        nzFooter: null,
        nzComponentParams: {
          data
        },
      });
      add_modal.afterClose.subscribe(result => {
        if (result === 'onOk') {
          this.refreshData();
        }
      });
    }

  }

  deleteMaterial(data) {
    this.materialsService.deleteImageMaterials(data.material_id, { cid: this.cid }).subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.message.success('删除成功');
        this.refreshData();
      } else {
        this.message.error(result.message);
      }
    }, (err: any) => {
      this.message.error('系统异常，请重试');
    });
  }

  uploadMaterials() {
    const add_modal = this.modalService.create({
      nzTitle: '批量上传',
      nzWidth: 850,
      nzContent: UploadImageMaterialsComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'upload-video-materials',
      nzFooter: null,
    });
    add_modal.afterClose.subscribe(result => {
      if (result === 'onOk') {
        this.refreshData();
      }
    });
  }


  getImageSizeList() {
    this.materialsService.getImageSize({ publisher_id: this.publisher_id }).subscribe(result => {
      if (result['status_code'] == 200) {
        if (isObject(result['data']) && result['data'].hasOwnProperty('image')) {
          result['data']['image'].forEach(item => {
            this.imageSizeList[item['width'] + 'x' + item['height']] = item;
            this.imageSizeShowList.push({
              spec: item['width'] + 'x' + item['height'],
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
      }

    }, () => {
    });
  }

}

