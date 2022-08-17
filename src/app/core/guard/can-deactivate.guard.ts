import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {ConversionComponent} from "../../routes/manage/components/metric-center/components/conversion-setting/components/conversion/conversion.component";
import {UploadConversionComponent} from "../../routes/manage/modal/upload-conversion/upload-conversion.component";

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard implements CanDeactivate<ConversionComponent> {

  canDeactivate(
    component: ConversionComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    // Get the Crisis Center ID
    // console.log(route.paramMap.get('id'));

    // Get the current URL
    // console.log(component.can_nav);
    // console.log(state.url);

    // Allow synchronous navigation (`true`) if no crisis or the crisis is unchanged
  
    if (component['can_nav']) {
      return true;
    }

    // Otherwise ask the user with the dialog service and return its
    // observable which resolves to true or false when the user decides
    return component.uploadService.confirm('正在上传文件，是否确定离开此页面?');
  }
}
