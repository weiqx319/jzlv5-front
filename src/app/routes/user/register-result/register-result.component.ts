import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ProductDataService } from "@jzl/jzl-product";
import { MenuService } from "../../../core/service/menu.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-register-result',
  templateUrl: './register-result.component.html',
  styleUrls: ['./register-result.component.scss'],
  // encapsulation: ViewEncapsulation.Native
})
export class RegisterResultComponent implements AfterViewInit, OnInit {
  public redirectUrl: any;

  public productInfo: any;

  constructor(public menuService: MenuService,
    private route: ActivatedRoute,
    private productService: ProductDataService) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
    if (this.route.snapshot.queryParams['redirect_url']) {
      this.menuService.redirectUrl = this.route.snapshot.queryParams['redirect_url'];
    }
    if (this.menuService.redirectUrl) {
      this.redirectUrl = decodeURI(this.menuService.redirectUrl);
    } else {
      this.redirectUrl = 'http://www.jiuzhilan.com/demo/';
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    const phoneCode = this.productService.registerMobile + '';
    if (phoneCode != '') {
      setTimeout(() => {
        const trackCode = document.createElement('script');
        trackCode.innerHTML = " var _jzlpaq = window._jzlpaq || [];\n" +
          "    _jzlpaq.push(['trackEvent', 'Jzl_convert', \"click\", \"conversion_05\", 1,{\"desc_08\":" + phoneCode + "}]);";
        document.body.appendChild(trackCode);
      }, 0);
    }



  }
}
