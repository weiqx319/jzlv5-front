import { Component, OnInit } from '@angular/core';
import { AuthActions } from "../../../core/store/actions/auth.action";
import { V5InitActions } from "../../../core/store/actions/v5init.action";
import { Store } from "@ngrx/store";
import { AppState } from "../../../core/store/app.state";
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-oauth-fail',
  templateUrl: './oauth-fail.component.html',
  styleUrls: ['./oauth-fail.component.scss']
})
export class OauthFailComponent implements OnInit {


  constructor(private store$: Store<AppState>, private productService: ProductDataService) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  public oauth_code = 4;

  public productInfo = {};

  ngOnInit() {

  }

  login() {
    this.store$.dispatch(new AuthActions.LogoutAction());
    this.store$.dispatch(new V5InitActions.LogOutAction());

  }
}
