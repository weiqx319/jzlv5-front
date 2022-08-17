
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { Store } from "@ngrx/store";
import { Auth } from "../entry/auth";
import { CustomDatasService } from "../../shared/service/custom-datas.service";
import { TableItemDatasService } from "../../shared/service/table-item-datas";
import { AuthService } from "../service/auth.service";
import { isUndefined } from "@jzl/jzl-util";
import { NzMessageService } from 'ng-zorro-antd/message';
import { MenuService } from '../service/menu.service';
import { Location } from '@angular/common';

@Injectable()
export class LoadDefaultDataGuard implements CanActivate {


  constructor(private store$: Store<{ auth: Auth }>,
    private customDatasService: CustomDatasService,
    private tableItemDatasService: TableItemDatasService,
    private message: NzMessageService,
    private authService: AuthService,
    private menuService: MenuService,
    private location: Location,
    private router: Router) {
  }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> {
    const promiseList = [];
    promiseList.push(this.customDatasService.dealChannelData());
    promiseList.push(this.customDatasService.dealPublisherNewData());
    promiseList.push(this.customDatasService.dealProductData());
    promiseList.push(this.customDatasService.dealTradeTypeData());
    promiseList.push(...this.tableItemDatasService.dealDataFunctionList);
    // promiseList.push(this.tableItemDatasService.dealDefaultTableData());

    return Promise.all(promiseList)
      .then(() => {
        return true;
      });
  }


}
