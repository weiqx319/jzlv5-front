import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin, Observable } from 'rxjs';
import { isNumber, isUndefined } from "@jzl/jzl-util";
import { environment } from '../../../../../../../environments/environment';
import { AuthService } from '../../../../../../core/service/auth.service';
import { AddUserComponent } from '../../../../modal/add-user/add-user.component';
import { UserEditPasswordComponent } from '../../../../modal/user-edit-password/user-edit-password.component';
import { ManageItemService } from '../../../../service/manage-item.service';
import { ManageService } from '../../../../service/manage.service';
import { User } from '../../../../../../core/entry';
import { ProductDataService } from "@jzl/jzl-product";
import { EditDataRoleComponent } from "../../../../modal/edit-data-role/edit-data-role.component";
import {GlobalTemplateComponent} from "../../../../../../shared/template/global-template/global-template.component";

@Component({
  selector: 'app-user-manage',
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.scss'],
})
export class UserManageComponent implements OnInit {

  public currentManagerUser: User;
  _indeterminate = false; // 表示有选中的，不管是全选还是选个别
  _allChecked = false;
  public apiData = [];
  public total = 0;
  public loading = true;
  public currentPage = 1;
  public pageSize = 30;

  public roleTypeRelation: object;
  public noResultHeight = document.body.clientHeight - 272;

  public optimizerManagerList = [];
  public selectedOptimizerManager = 0;
  private _optimizerManagerListLoad = false;
  show_type = 'table';
  is_to_oper_optimizer = false;

  to_optimizer_manager_show = false;

  public myObject: any = {};

  // --- filter setting

  public filterRoleOption = [];
  public filterIsUseOption = [];
  public visible: boolean;
  public userListQueryParams = {
    pConditions: [],
    sort_item: {},
  };

  filterResult = {
    role_id: {},
    is_use: {},
    user_name: {},
    email: {},
  };
  sort_item = {};
  filter_result_array = [];
  public productInfo = {};

  // -- filter setting result

  constructor(
    private manageService: ManageService,
    private manageItemService: ManageItemService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private auth: AuthService,
    private productService: ProductDataService,
  ) {

    const currentMangerUser = this.auth.getCurrentAdminOperdInfo();
    this.currentManagerUser = this.auth.getCurrentUser().user_list.find(item => {
      if (item.user_id === currentMangerUser.select_uid) {
        return true;
      }
    });

    this.roleTypeRelation = this.manageItemService.roleTypeRelation;
    this.noResultHeight = document.body.clientHeight - 272;
    this.filterRoleOption = manageItemService.roleAllTypeList;
    this.filterIsUseOption = manageItemService.isUserList;

    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?) {
    this.noResultHeight = document.body.clientHeight - 272;
  }

  _refreshStatus(event?) {
    const allChecked = this.apiData.every(
      (value) => value.disabled || value.checked,
    );
    const allUnchecked = this.apiData.every((value) => !value.checked);
    // 表示不是全选，但是有选中的
    this._indeterminate = (!allUnchecked && !allChecked) || allChecked;
    this._allChecked = allChecked;
    if (allUnchecked) {
      this.is_to_oper_optimizer = false;
    } else {
      this.canOperOptimizer();
    }
  }

  _checkAll(value) {
    if (value) {
      this.apiData.forEach((data) => {
        if (!data.disabled) {
          data.checked = true;
        }
      });
      this._indeterminate = true;
      this.canOperOptimizer();
    } else {
      this.is_to_oper_optimizer = false;
      this._indeterminate = false;
      this.apiData.forEach((data) => (data.checked = false));
    }
  }

  canOperOptimizer() {
    let is_continue = true;
    this.apiData.forEach((data) => {
      if (is_continue) {
        if (data.checked) {
          if (data.role_id !== 4) {
            // 代表有角色不为优化师的
            is_continue = false;
          }
        }
      }
    });
    this.is_to_oper_optimizer = is_continue;
  }

  getStructureDiagramData() {
    this.manageService.getStructureDiagram().subscribe(
      (results: any) => {
        if (results.status_code !== 200) {
          this.message.error('数据获取异常，请重试');
        } else {
          this.myObject = results.data;
        }
      },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => { },
    );
  }

  /**
   * 刷新表格数据
   */
  refreshData(status?) {
    if (status) {
      this.currentPage = 1;
    }
    this._indeterminate = false;
    this._allChecked = false;
    this.userListQueryParams.pConditions = [];
    Object.values(this.filterResult).forEach((item) => {
      if (item.hasOwnProperty('key')) {
        this.userListQueryParams.pConditions.push(item);
      }
    });
    this.userListQueryParams.sort_item = this.sort_item;

    this.manageService
      .getUserList(this.userListQueryParams, {
        page: this.currentPage,
        count: this.pageSize,
      })
      .subscribe(
        (results: any) => {
          if (results.status_code !== 200) {
            this.apiData = [];
            this.total = 0;
          } else {
            this.apiData = results['data']['detail'];
            this.apiData.forEach((data, key) => {
              if (data.role_id === 1) {
                data.disabled = true;
              }
            });
            this.total = results['data']['detail_count'];
          }
          this.loading = false;
        },
        (err: any) => {
          this.loading = false;
          this.message.error('数据获取异常，请重试');
        },
        () => { },
      );
  }

  addUser() {

    // -- 先获取账户列表信息
    this.manageService.getAccountList({}, { is_hierarchy: 1 }).subscribe(
      (result) => {
        if (
          result['status_code'] &&
          (result.status_code === 200 || result.status_code === 205)
        ) {
          const accountList = result['data'];
          const add_modal = this.modalService.create({
            nzTitle: '创建用户',
            nzWidth: 720,
            nzContent: AddUserComponent,
            nzClosable: false,
            nzMaskClosable: false,
            nzWrapClassName: 'new-role-modal',
            nzFooter: null,
            nzComponentParams: {
              roleId: this.currentManagerUser.role_id,
              setting: {
                role_id: 4,
                account_lists: [],
                optimizer_values: [],
                advert_values: [],
              },
              accountList,
            },
          });
          add_modal.afterClose.subscribe((save_result) => {
            if (save_result === 'onOk') {
              this.auth.refreshUser$.next(1);
              this.refreshData();
            }
          });
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 404) {
          this.message.error('API未实现，找言十！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(result.message);
        }
      },
      (err) => {

        this.message.error('系统异常，请重试');
      },
    );
  }

  editUser(user_id) {
    const user$ = this.manageService.getUserInfo(user_id);
    const accountList$ = this.manageService.getAccountList(
      {},
      { is_hierarchy: 1, oper_user_id: user_id },
    );

    forkJoin([user$, accountList$]).subscribe(
      (allResult) => {
        const userResult = allResult[0];
        const accountListResult = allResult[1];
        let accountList = [];
        if (
          accountListResult['status_code'] &&
          accountListResult['status_code'] === 200
        ) {
          accountList = accountListResult['data'];
        } else {
          accountList = [];
        }
        if (userResult['status_code'] && userResult['status_code'] === 200) {
          const userData = userResult['data'];
          const edit_modal = this.modalService.create({
            nzTitle: '编辑用户',
            nzWidth: 720,
            nzContent: AddUserComponent,
            nzClosable: false,
            nzMaskClosable: false,
            nzWrapClassName: 'new-role-modal',
            nzFooter: null,
            nzComponentParams: {
              roleId: this.currentManagerUser.role_id,
              userId: user_id,
              userData,
              accountList,
            },
          });
          edit_modal.afterClose.subscribe((edit_result) => {
            if (edit_result === 'onOk') {
              this.refreshData();
              this.auth.refreshUser$.next(1);
            }
          });
        } else if (
          userResult['status_code'] &&
          userResult['status_code'] === 401
        ) {
          this.message.error('您没权限对此操作！');
        } else if (
          userResult['status_code'] &&
          userResult['status_code'] === 404
        ) {
          this.message.error('API未实现，找言十！');
        } else if (
          userResult['status_code'] &&
          userResult['status_code'] === 500
        ) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error(userResult['message']);
        }
      },
      (err) => {

        this.message.error('系统异常，请重试');
      },
    );
  }

  editPassword(user_id) {
    this.manageService.getUserInfo(user_id).subscribe((result) => {
      const userData = result['data'];
      const add_modal = this.modalService.create({
        nzTitle: '编辑密码',
        nzWidth: 600,
        nzContent: UserEditPasswordComponent,
        nzClosable: false,
        nzMaskClosable: false,
        nzWrapClassName: 'app-user-edit-password',
        nzFooter: null,
        nzComponentParams: {
          userId: user_id,
          userData,
        },
      });
      add_modal.afterClose.subscribe((result_updae) => {
        if (result_updae === 'onOk') {
          this.refreshData();
        }
      });
    });
  }

  openPop() {
    this.to_optimizer_manager_show = true;
    this.loadUserByRole();
  }

  addToOptimizerManager(user_id?) {
    this.to_optimizer_manager_show = false;
    const postBody = { manager_user_id: 0, user_list: [] };
    if (this.selectedOptimizerManager > 0) {
      postBody.manager_user_id = this.selectedOptimizerManager;
      if (isUndefined(user_id)) {
        this.apiData.forEach((data) => {
          if (data.checked) {
            postBody.user_list.push(data.user_id);
          }
        });
      } else if (isNumber(user_id) && user_id > 0) {
        postBody.user_list.push(user_id);
      }
      if (postBody.user_list.length > 0) {
        this.manageService.dispatchUserToOptimizerManager(postBody).subscribe(
          (result: any) => {
            if (result.status_code === 200) {
              this.message.success('操作成功');
              this.visible = false;
              this.refreshData();
            } else if (result['status_code'] && result.status_code === 401) {
              this.message.error('您没权限对此操作！');
            } else if (result['status_code'] && result.status_code === 500) {
              this.message.error('系统异常，请重试');
            } else {
              this.message.error(result.message);
            }
          },
          (err: any) => {
            this.message.error('更新失败,请重试');
          },
          () => { },
        );
      }
    }
  }

  stopUser(user_id?) {
    const postBody = { close_users: [] };
    if (isUndefined(user_id)) {
      this.apiData.forEach((data) => {
        if (data.checked) {
          postBody.close_users.push(data.user_id);
        }
      });
    } else if (isNumber(user_id) && user_id > 0) {
      postBody.close_users.push(user_id);
    }
    if (postBody.close_users.length > 0) {
      this._doUpdateStatus(postBody);
    }
  }

  startUser(user_id?) {
    const postBody = { open_users: [] };
    if (isUndefined(user_id)) {
      this.apiData.forEach((data) => {
        if (data.checked) {
          postBody.open_users.push(data.user_id);
        }
      });
    } else if (isNumber(user_id) && user_id > 0) {
      postBody.open_users.push(user_id);
    }
    if (postBody.open_users.length > 0) {
      this._doUpdateStatus(postBody);
    }
  }

  _doUpdateStatus(postBody) {
    this.manageService.updateStatus(postBody).subscribe(
      (result: any) => {
        if (result.status_code === 200) {
          this.message.success('操作成功');
          this.refreshData();
          this.auth.refreshUser$.next(1);
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 404) {
          this.message.error('API未实现，找言十！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else {
          this.message.error('API未实现，找言十！');
        }
      },
      (err: any) => {
        this.message.error('更新失败,请重试');
      },
      () => { },
    );
  }

  loadUserByRole(): void {
    const resultCondition = {
      pConditions: [
        {
          key: 'role_id',
          op: '=',
          value: '3',
        },
      ],
    };
    this.manageService
      .getUserList(resultCondition, { result_model: 'all' })
      .subscribe(
        (result) => {
          if (result['status_code'] && result.status_code === 200) {
            this.optimizerManagerList = result['data'].map((item) => {
              return { id: item.user_id, name: item.user_name };
            });
            this._optimizerManagerListLoad = true;
          } else {
            this.optimizerManagerList = [];
          }
        },
        (err) => {

          this.message.error('系统异常，请重试');
        },
      );
  }

  clickPopCancel() {
    this.visible = false;
    this.to_optimizer_manager_show = false;
  }

  ngOnInit() {
    this.onWindowResize();
    this.refreshData();
    this.getStructureDiagramData();
  }
  doFilter() {
    this.currentPage = 1;
    this.refreshData();
  }
  downloadUsersList() {
    this.loading = true;
    this.manageService
      .downloadUsersList(this.userListQueryParams, {
        page: 9999,
        count: 30,
      })
      .subscribe(
        (results: any) => {
          this.loading = false;
          if (results.status_code && results.status_code === 200) {
            const cacheKey = results['data']['cache_key'];
            window.open(
              environment.SERVER_API_URL + '/files_public_down/' + cacheKey,
            );
          } else {
            this.message.error('当前不可下载，请稍候重试');
          }
        },
        (err: any) => {
          this.loading = false;
          this.message.error('系统异常，不可下载');
        },
        () => {
          this.loading = false;
        },
      );
  }

  //排序
  sort(sort: { key: string; value: string }): void {
    if (sort.value) {
      sort.value = sort.value === 'ascend' ? 'asc' : 'desc';
      this.sort_item = sort;
    } else {
      this.sort_item = {};
    }
    this.refreshData();
  }

  editDataRole(data) {
    const add_modal = this.modalService.create({
      nzTitle: '编辑数据角色',
      nzWidth: 720,
      nzContent: EditDataRoleComponent,
      nzClosable: false,
      nzMaskClosable: false,
      nzWrapClassName: 'new-role-modal',
      nzFooter: null,
      nzComponentParams: {
        data,
      },
    });
    add_modal.afterClose.subscribe((save_result) => {
      if (save_result === 'onOk') {
        this.refreshData();
      }
    });
  }

  deleteUser(user_id?) {
    const postBody= {
      user_list:[],
    };
    if (isUndefined(user_id)) {
      this.apiData.forEach((data) => {
        if (data.checked) {
          postBody.user_list.push(data.user_id);
        }
      });
    } else if (isNumber(user_id) && user_id > 0) {
      postBody.user_list.push(user_id);
    }
    if (postBody.user_list.length > 0) {
      this.manageService.delUser(postBody).subscribe(
        (result: any) => {
          if (result.status_code === 200) {
            this.message.success('操作成功');
            this.refreshData();
          } else {
            this.message.error(result.message);
          }
        },
        (err: any) => {
        },
        () => { },
      );
    }
  }

}
