import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {MaterialsManageService} from "./materials-manage.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MaterialsResolveService implements Resolve<any> {

  constructor(
    private materialsManageService:MaterialsManageService,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.materialsManageService.getAdvertisers();
  }

}
