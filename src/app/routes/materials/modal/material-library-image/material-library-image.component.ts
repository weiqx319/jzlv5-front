import { Component, HostListener, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { AuthService } from "../../../../core/service/auth.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from "@angular/router";
import { MenuService } from "../../../../core/service/menu.service";
import { MaterialsService } from "../../service/materials.service";
import { MaterialsDetailModalComponent } from "../materials-detail-modal/materials-detail-modal.component";
import { isArray } from "@jzl/jzl-util";
import { arrayChunk, deepCopy, formatDate } from '@jzl/jzl-util';
import { environment } from "../../../../../environments/environment";

@Component({
  selector: 'app-material-library-image',
  templateUrl: './material-library-image.component.html',
  styleUrls: ['./material-library-image.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MaterialLibraryImageComponent implements OnInit {
  @Input() set materialSlt(value) {
    this.materialSltAry = JSON.parse(JSON.stringify(value));
    this.threeMaterialSltAry = this.materialSltAry;
    this.materialSltAry.forEach(material => {
      if (material.length > 0) {
        this.threeMaterialSltAry = [];
        material.forEach(s_material => {
          this.threeMaterialSltAry.push(s_material);
          s_material.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/image_material/image/' + s_material['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid;
          this.materialCheckedMap[s_material.material_id] = true;
          this.materialSltMap[s_material.material_id] = s_material;
        });
      } else {
        this.materialCheckedMap[material.material_id] = true;
        this.materialSltMap[material.material_id] = material;
      }
    });
  }

  @Input() css_type = 0;

  public cardList = [];

  public queryParams = {
    css_type: 0,
    pConditions: [],
    sort_item: { key: "create_time", dir: "desc" },
  };
  public sortItemList = [
    { key: "create_time", name: "上传时间" },
    { key: "material_name", name: "素材名称" },
    { key: "material_make_time", name: "素材制作时间" },
  ];

  public stringFilterOper = [
    { key: "=", name: "为" },
    { key: "!=", name: "不为" },
    { key: "like", name: "包含" },
    { key: "notlike", name: "不包含" }
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

    material_tags: {
      key: 'material_tags',
      name: "标签",
      op: "like",
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

  public materialCheckedMap: any = {};
  public materialSltMap: any = {};
  public materialSltAry = [];

  public threeMaterialSltAry = [];

  public user_id;

  public curIndex = 0;

  constructor(
    public authService: AuthService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private modalSubject: NzModalRef,
    private router: Router,
    private route: ActivatedRoute,
    public menuService: MenuService,
    private materialsService: MaterialsService,
  ) {

    this.publisher_id = this.menuService.currentPublisherId;

    this.cid = this.authService.getCurrentUserOperdInfo().select_cid;

    this.user_id = this.authService.getCurrentUserOperdInfo().select_uid;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.tableHeight = document.body.clientHeight - 60 - 65 - 40;
  }

  ngOnInit() {
    this.queryParams.css_type = this.css_type;
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
    this.search();
  }

  reset() {
    this.queryItem.create_time.value = [];
    this.queryItem.material_make_time.value = [];
    this.queryItem.material_tags.value = null;
    this.queryItem.material_name.value = null;
    this.cardPage.currentPage = 1;
    this.refreshData();
  }

  refreshData() {
    this.loading = true;
    this.materialsService.getImageList(this.queryParams, {
      count: this.cardPage.pageSize,
      page: this.cardPage.currentPage,
      cid: this.cid,
      publisher_id: this.publisher_id
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

  checkAll() {
    // this.cardList.forEach( data => {
    //   this.materialCheckedMap[data.material_id] = true;
    //   this.materialSltMap[data.material_id] = data;
    // });

    // this.materialSltAry = Object.values(this.materialSltMap);

    this.cardList.forEach(data => {
      if (!this.materialCheckedMap[data.material_id]) {
        this.materialCheckedMap[data.material_id] = true;
        this.selectMaterial(data);
      }
    });
  }

  cancelCheck() {
    this.materialSltMap = {};
    this.materialCheckedMap = {};
    this.materialSltAry = [];
    this.threeMaterialSltAry = [];
    this.curIndex = 0;
  }

  selectMaterial(data) {
    if (this.materialCheckedMap[data.material_id]) {
      if (this.publisher_id === 17 || this.publisher_id === 7) {
        if (this.curIndex === 0) {
          this.materialSltMap[data.material_id] = data;
          this.threeMaterialSltAry.push(data);
        } else {
          this.materialCheckedMap[this.threeMaterialSltAry[this.curIndex - 1].material_id] = false;
          delete this.materialSltMap[this.threeMaterialSltAry[this.curIndex - 1].material_id];
          this.threeMaterialSltAry.splice(this.curIndex - 1, 1, data);
          this.materialSltMap[data.material_id] = data;
        }
      } else {
        this.materialSltMap[data.material_id] = data;
      }
    } else {
      if (this.publisher_id === 17 || this.publisher_id === 7) {
        const index = this.threeMaterialSltAry.findIndex(item => item.material_id === data.material_id);
        this.threeMaterialSltAry.splice(index, 1);
      }
      delete this.materialSltMap[data.material_id];
      if ((!this.threeMaterialSltAry.length) || (this.curIndex > this.threeMaterialSltAry.length)) {
        this.curIndex = 0;
      }
    }


    if (this.publisher_id === 17 || this.publisher_id === 7) {
      this.threeMaterialSltAry.forEach(item => {
        item.imgUrl = environment.SERVER_API_URL_v6 + '/manager_base/material/image_material/image/' + item['material_id'] + '?user_id=' + this.user_id + '&cid=' + this.cid;
      });
    }
    this.materialSltAry = Object.values(this.materialSltMap);

    if ((this.publisher_id === 17 && this.css_type === 4) || (this.publisher_id === 7 && this.css_type === 2)) {
      this.materialSltAry = arrayChunk(this.threeMaterialSltAry, 3);
    }

  }

  activeImage(index) {
    this.curIndex = index + 1;
  }

  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    if (((this.publisher_id === 17 && this.css_type === 4) || (this.publisher_id === 7 && this.css_type === 2)) && this.threeMaterialSltAry.length % 3 !== 0) {
      this.message.error('请选择图片数量为3的倍数');
    } else {
      this.modalSubject.destroy(this.materialSltAry);
    }
  }

}
