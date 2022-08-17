import { CustomDatasService } from 'src/app/shared/service/custom-datas.service';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Store } from "@ngrx/store";
import { AppState } from "../../core/store/app.state";
import { AuthActions } from "../../core/store/actions/auth.action";
import { AuthService } from "../../core/service/auth.service";
import { User } from "../../core/entry/user";
import { isUndefined } from "@jzl/jzl-util";
import { NavigationEnd, Router, ActivatedRoute } from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { V5InitActions } from "../../core/store/actions/v5init.action";
import { ProductDataService } from "@jzl/jzl-product";
import { LocalStorageService } from "ngx-webstorage";
import { MenuService } from "../../core/service/menu.service";
import { Location } from '@angular/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';




@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {
  @ViewChild('messageTemplate') messageTemplate: TemplateRef<any>;

  @Input() currentScope = 'view';
  public userSelectedOper: { select_uid: number, select_cid: number, role_id: number } = { select_uid: 0, select_cid: 0, role_id: 0 };
  public userAdminSelectOper: { select_uid: number, role_id: number } = { select_uid: 0, role_id: 0 };
  public userList;
  public manageUserList;
  public advertiserList;
  public currentLoginUser: User;
  public currentManagerUser: User;
  public menuHeight = document.body.clientHeight - 60 - 30;

  public messageList = [];
  public messageVisible: boolean;
  public messageLoading = false;
  public messageInterval$: any;

  public isMange = false;
  public productInfo = {};
  public currentSelectedPubliserId = 0;

  public channelTypes = [];
  //权限不足弹窗
  authState$ = this.store$.select(s => s.auth);
  constructor(private store$: Store<AppState>,
    public authService: AuthService,
    private localSt: LocalStorageService,
    public menuService: MenuService,
    private router: Router,
    private message: NzMessageService,
    private productService: ProductDataService,
    private location: Location,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private customDatasService: CustomDatasService
  ) {
    this.channelTypes = JSON.parse(JSON.stringify(this.menuService.productTypes));

    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isMange = event.url.indexOf('/manage') === 0;
        this.menuService.isCompany = event.url.indexOf('/company') === 0;
        if (this.menuService.isCompany) {
          this.initData();
          this.menuService.init(this.currentLoginUser, this.userSelectedOper.role_id, this.userSelectedOper.select_cid);
        }
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.menuHeight = document.body.clientHeight - 60 - 30;
  }

  ngOnDestroy(): void {
    if (this.messageInterval$) {
      clearInterval(this.messageInterval$);
    }
  }

  ngOnInit() {
    this.initData();
    this.menuService.init(this.currentLoginUser, this.userSelectedOper.role_id, this.userSelectedOper.select_cid);
    this.authService.user$.subscribe((data: User) => {
      // this.userList = data['user_list'];
      this.initData();

    });
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
      if (!this.productInfo['hiddenMessage']) {
        this.getUnreadMessageList();
        this.messageInterval$ = setInterval(() => {
          this.getUnreadMessageList();
        }, 60000);
      }
    });
  }

  initData(): void {
    this.currentLoginUser = this.authService.getCurrentUser();
    this.userList = this.currentLoginUser.user_list;

    this.manageUserList = this.currentLoginUser.user_list.filter(item => item.role_id !== 5 && item.role_id !== 6);

    this.userAdminSelectOper = this.authService.getCurrentAdminOperdInfo();
    // --- 初始化当前管理的USER
    const findUserInfo = this.manageUserList.find(item => {
      return item.user_id === this.userAdminSelectOper.select_uid;
    });
    if (isUndefined(findUserInfo)) {
      this.currentManagerUser = this.manageUserList[0];
      this.authService.storeCurrentAdminOperdInfo({ select_uid: this.currentManagerUser.user_id, role_id: this.currentManagerUser.role_id });
    } else {
      this.currentManagerUser = findUserInfo;
    }


    // -- 初始化当前查看数据的用户和广告主
    const userOperdInfo = this.authService.getCurrentUserOperdInfo();
    if (userOperdInfo.select_uid === 0) {

    } else if (userOperdInfo.select_cid === 0) {

    } else {
      const selectUser = this.userList.find(item => {
        return item.user_id === userOperdInfo.select_uid;
      });
      if (!isUndefined(selectUser)) {
        this.advertiserList = selectUser.ad_list;
        this.userSelectedOper = Object.assign({}, userOperdInfo);
        this.advertiserList.forEach(item => {
          if (item['cid'] === this.userSelectedOper.select_cid) {
            this.authService.advertiserType = item['advertiser_type'];
          }
        });
      }


    }

    //当前广告主存在于哪些用户列表
    this.userList.forEach(item => {
      item.isHasCurrentAdvertiser = item.ad_list.some(advertiser => advertiser.cid === this.userSelectedOper.select_cid);
    })
  }

  changeSelectedUser(data) {
    const findUserInfo = this.userList.find(item => {
      return item.user_id === this.userSelectedOper.select_uid;
    });
    if (isUndefined(findUserInfo)) {
      if (this.currentLoginUser.role_id === 1) {
        const findRole1Info = this.userList.find(item => {
          return item.role_id === 1;
        });
        if (!isUndefined(findRole1Info)) {
          this.userSelectedOper.select_uid = findRole1Info.user_id;
          this.userSelectedOper.role_id = findRole1Info.role_id;
          this.userSelectedOper.select_cid = findRole1Info.ad_list[0].cid;
        } else {
          this.userSelectedOper.select_uid = this.currentLoginUser.user_id;
          this.userSelectedOper.role_id = this.currentLoginUser.role_id;
          this.userSelectedOper.select_cid = this.currentLoginUser.user_list[0].ad_list[0].cid;
        }
      } else {
        this.userSelectedOper.select_uid = this.currentLoginUser.user_id;
        this.userSelectedOper.role_id = this.currentLoginUser.role_id;
        this.userSelectedOper.select_cid = this.currentLoginUser.user_list[0].ad_list[0].cid;
      }
      this.authService.storeCurrentUserOperdInfo(Object.assign({}, this.userSelectedOper));
      this.menuService.init(this.currentLoginUser, this.userSelectedOper.role_id, this.userSelectedOper.select_cid);
      if (this.menuService.isCompany) {
        this.router.navigateByUrl('/company');
      } else {
        // this.router.navigateByUrl('/');
        location.reload();
      }

    } else {
      this.userSelectedOper.role_id = findUserInfo.role_id;
      this.advertiserList = findUserInfo.ad_list;
      if (this.advertiserList.length > 0) {
        this.userSelectedOper.select_cid = this.advertiserList[0].cid;
        this.authService.storeCurrentUserOperdInfo(Object.assign({}, this.userSelectedOper));
        this.menuService.init(this.currentLoginUser, this.userSelectedOper.role_id, this.userSelectedOper.select_cid);
        if (this.menuService.isCompany) {
          this.router.navigateByUrl('/company');
        } else {
          // this.router.navigateByUrl('/');
          location.reload();
        }
      } else {
        this.userSelectedOper.select_cid = 0;
      }
      // -- @todo 处理adList 列表为空
    }
    //当前广告主存在于哪些用户列表
    this.userList.forEach(item => {
      item.isHasCurrentAdvertiser = item.ad_list.some(advertiser => advertiser.cid === this.userSelectedOper.select_cid);
    })
  }

  changeManageUser(user_id) {
    const findUserInfo = this.manageUserList.find(item => {
      return item.user_id === this.userAdminSelectOper.select_uid;
    });
    if (isUndefined(findUserInfo)) {
      this.currentManagerUser = this.manageUserList[0];
      this.userAdminSelectOper.select_uid = this.currentManagerUser.user_id;
      this.userAdminSelectOper.role_id = this.currentManagerUser.role_id;
      this.authService.storeCurrentAdminOperdInfo(Object.assign({}, this.userAdminSelectOper));
    } else {
      this.currentManagerUser = findUserInfo;
      this.userAdminSelectOper.select_uid = this.currentManagerUser.user_id;
      this.userAdminSelectOper.role_id = this.currentManagerUser.role_id;
      this.authService.storeCurrentAdminOperdInfo(Object.assign({}, this.userAdminSelectOper));
    }
    this.router.navigateByUrl('/manage');
  }


  changeAdvertiser(data): void {
    this.advertiserList.forEach(item => {
      if (item['cid'] === this.userSelectedOper.select_cid) {
        this.authService.advertiserType = item['advertiser_type'];
      }
    });
    //当前广告主存在于哪些用户列表
    this.userList.forEach(item => {
      item.isHasCurrentAdvertiser = item.ad_list.some(advertiser => advertiser.cid === this.userSelectedOper.select_cid);
    });
    this.authService.storeCurrentUserOperdInfo(Object.assign({}, this.userSelectedOper));
    this.router.navigateByUrl('/');

  }

  getUnreadMessageList() {
    this.authService.getUnreadMessageList().subscribe(result => {
      if (result.status_code && result.status_code === 200) {
        this.authService.messageUnreadCount = result.data.not_read_count;
        const popup_list = result.data.popup_list;
        popup_list.forEach(item => {
          this.notification.template(this.messageTemplate, { nzData: item, nzDuration: 10000 });
        });
      }
    }, (err: any) => {
      clearInterval(this.messageInterval$);
    });
  }

  getMessageList() {
    this.messageLoading = true;
    this.authService.getMessageList().subscribe(result => {
      this.messageLoading = false;
      if (result.status_code && result.status_code === 200) {
        this.messageList = result.data.detail.slice(0, 5);
      } else {
        this.messageList = [];
      }
    }, (err: any) => {
      this.messageLoading = false;
      this.message.error('数据获取异常，请重试');
    });
  }

  closeMsgBox() {
    this.messageVisible = false;
  }

  logOut() {
    this.store$.dispatch(new AuthActions.LogoutAction());
    this.store$.dispatch(new V5InitActions.LogOutAction());
  }

  jumpHelp() {
    localStorage.setItem('helpInit', 'true');
  }



  changeChannelType(channel_id, publisher_id, operRoleId, cid) {
    this.menuService.changeProductType(channel_id, publisher_id, operRoleId, cid);
    let redirect_url = this.menuService.isCompany ? '/company' : '/';
    this.router.navigateByUrl(redirect_url);
  }


  companyManage() {
    this.menuService.isCompany = true;
    this.menuService.init(this.currentLoginUser, this.userSelectedOper.role_id, this.userSelectedOper.select_cid);
    this.router.navigateByUrl('/company');
  }

  goBack() {
    this.menuService.isCompany = false;
    this.router.navigateByUrl('/');
  }

}
