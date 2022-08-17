
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { CustomDatasService } from "../../shared/service/custom-datas.service";

@Injectable()
export class AutomationDataGuard implements CanActivate {
  constructor(
    private customDatasService: CustomDatasService,) {
  }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> {
    const promiseList = [];
    promiseList.push(this.customDatasService.dealAutomationRenderData());

    return Promise.all(promiseList)
      .then(() => {
        return true;
      });
  }
}
