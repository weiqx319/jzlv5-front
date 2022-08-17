import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { NzModalService } from 'ng-zorro-antd/modal';
import { LocalStorageService } from "ngx-webstorage";
import { AuthService } from "../../core/service/auth.service";
import { MenuService } from "../../core/service/menu.service";
import { ProductDataService } from "@jzl/jzl-product";
import { QuestionFeedbackComponent } from "./modal/question-feedback/question-feedback.component";
import { HelpCenterService } from "./service/help-center.service";

@Component({
  selector: 'app-help-center',
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss'],
})
export class HelpCenterComponent implements OnInit {
  productInfo = {};
  constructor(private help: HelpCenterService,
    private modalService: NzModalService,
    private localSt: LocalStorageService,
    private authService: AuthService,
    private menuService: MenuService,
    private productService: ProductDataService,
    private router: Router) {
  }

  public leftMenu = [];
  public currentMenu: any;
  public catName = '';
  public articleName = '';
  public catId: any;
  public rightWith: any;
  public option = 1;
  ngOnInit() {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
    this.help.getCatId().subscribe((result) => {
      this.catId = result;
      this.leftMenu.forEach((item) => {
        if (result * 1 === item.term_taxonomy_id * 1) {
          this.catName = item.name;
          this.currentMenu = item.term_taxonomy_id * 1;
        }
      });
    });
    this.help.getArticleName().subscribe((result) => {
      this.articleName = result;
    });
    this.getCatList();
    this.onWindowResize();

  }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    const documentWidth = document.body.clientWidth;
    this.rightWith = documentWidth - 180;
  }
  jumpHome() {
    if (this.menuService.isCompany) {
      this.router.navigateByUrl('/company/dashboard');
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }
  questionFeedback() {
    const addModal = this.modalService.create({
      nzTitle: '问题反馈',
      nzWidth: 600,
      nzContent: QuestionFeedbackComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'advert-manage-modal',
      nzFooter: null,
    });
    addModal.afterClose.subscribe((result) => {
    });
  }

  clickMenu(value, name) {

    this.catName = name;
    this.help.setCatId(value);
    this.help.setListId(value);
    this.help.setArticleName('');
    this.currentMenu = value;
    this.router.navigateByUrl('/help/list/' + value);

  }

  getCatList() {
    this.help.getCatList().subscribe((result) => {
      if (result.status_code === 200) {
        this.leftMenu = result.data;
        if (localStorage.getItem('helpInit') === 'true') {
          this.router.navigateByUrl('/help/list/' + this.leftMenu[0].term_taxonomy_id);
          this.currentMenu = this.leftMenu[0].term_taxonomy_id;
          this.catName = this.leftMenu[0].name;
          this.help.setCatId(this.leftMenu[0].term_taxonomy_id);
        } else {
          this.currentMenu = this.catId * 1;
          this.leftMenu.forEach((item) => {
            if (this.catId * 1 === item.term_taxonomy_id * 1) {
              this.catName = item.name;
            }
          });
        }
        localStorage.removeItem('helpInit');
      }
    });
  }

}
