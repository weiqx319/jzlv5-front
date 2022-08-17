
import { of as observableOf, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild, CanDeactivate } from '@angular/router';
import { Store } from "@ngrx/store";
import { Auth } from "../entry/auth";
import { CustomDatasService } from "../../shared/service/custom-datas.service";
import { AuthService } from "../service/auth.service";
import { AuthActions } from "../store/actions/auth.action";
import { defaultIfEmpty, map } from "rxjs/operators";
import "rxjs/add/operator/take";
import "rxjs/add/operator/map";
import { isUndefined } from "@jzl/jzl-util";
import { NzMessageService } from 'ng-zorro-antd/message';
import { DataViewEditComponent } from "../../routes/data-view/component/data-view-edit/data-view-edit.component";


@Injectable()
export class EditGuard implements CanDeactivate<DataViewEditComponent> {


  constructor(private store$: Store<{ auth: Auth }>,
    private customDatasService: CustomDatasService,
    private message: NzMessageService,
    private authService: AuthService,
    private router: Router) {
  }


  canDeactivate() {
    const editState = localStorage.getItem('edit_state');
    if (!isUndefined(editState) && editState) {
      this.authService.setStopBackState('true');
      return observableOf(false);
    } else {
      return observableOf(true);
    }
  }

}
