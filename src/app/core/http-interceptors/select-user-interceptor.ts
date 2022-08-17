import { Injectable, Injector } from "@angular/core";
import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { AuthService } from "../service/auth.service";
import { Observable } from "rxjs";
import { isNull } from "@jzl/jzl-util";
import { MenuService } from "../service/menu.service";


@Injectable()
export class SelectUserInterceptor implements HttpInterceptor {

  constructor(private injector: Injector) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const auth = this.injector.get(AuthService);
    const currentLoginUser = auth.getCurrentUser();
    const operInfo = auth.getCurrentUserOperdInfo();
    const existsUserId = req.params.get("user_id");
    const existsCid = req.params.get("cid");
    const login_type = currentLoginUser ? (currentLoginUser.login_type || 1) : 1;
    req = req.clone(
      {
        params: req.params.set('login_type', login_type + '')
      });
    if (req.url.indexOf('v6/company') > -1) {
      const menu = this.injector.get(MenuService);
      const channelId = menu.currentChannelId;
      const publisherId = menu.currentPublisherId;
      if (channelId == 1) {
        req = req.clone(
          {
            params: req.params.set('channel_id', channelId + '')
          });
      } else {
        req = req.clone(
          {
            params: req.params.set('channel_id', channelId + '').set('publisher_id', publisherId + '')
          });
      }


      if (!isNull(existsCid) && !isNull(existsUserId)) {
        return next.handle(req);
      } else {
        const reqClone = req.clone({
          params: req.params.set('user_id', operInfo.select_uid + '').set('cid', operInfo.select_cid + '').set('XDEBUG_SESSION_START', "100060").set('company_id', currentLoginUser.company_id + '')
        });
        return next.handle(reqClone);
      }

    } else if (req.url.indexOf('v6/auth') === -1 && req.url.indexOf('v6/manage') === -1 && req.url.indexOf('v6/material_manage') === -1 && req.url.indexOf('v6/setting') === -1) {
      const menu = this.injector.get(MenuService);
      const channelId = menu.currentChannelId;
      const publisherId = menu.currentPublisherId;
      if (channelId == 1) {
        req = req.clone(
          {
            params: req.params.set('channel_id', channelId + '')
          });
      } else {
        req = req.clone(
          {
            params: req.params.set('channel_id', channelId + '').set('publisher_id', publisherId + '')
          });
      }


      if (!isNull(existsCid) && !isNull(existsUserId)) {
        return next.handle(req);
      } else {
        const reqClone = req.clone({
          params: req.params.set('user_id', operInfo.select_uid + '').set('cid', operInfo.select_cid + '').set('XDEBUG_SESSION_START', "100060")
        });
        return next.handle(reqClone);
      }

    } else if (req.url.indexOf('v6/manager_base') !== -1 || req.url.indexOf('v6/setting') !== -1) {
      if (!isNull(existsUserId)) {
        return next.handle(req);
      } else {
        const operInfo = auth.getCurrentAdminOperdInfo();
        const reqClone = req.clone({
          params: req.params.set('user_id', operInfo.select_uid + '')
        });
        return next.handle(reqClone);
      }
    } else if (req.url.indexOf('v6/help') !== -1) {
      if (!isNull(existsUserId)) {
        return next.handle(req);
      } else {
        const reqClone = req.clone({
          params: req.params.set('user_id', currentLoginUser.user_id + '')
        });
        return next.handle(reqClone);
      }
    } else {
      return next.handle(req);
    }

  }
}
