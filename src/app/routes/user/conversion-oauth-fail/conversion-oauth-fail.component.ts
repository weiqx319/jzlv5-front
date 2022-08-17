import { Component, OnInit } from '@angular/core';
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-conversion-oauth-fail',
  templateUrl: './conversion-oauth-fail.component.html',
  styleUrls: ['./conversion-oauth-fail.component.scss']
})
export class ConversionOauthFailComponent implements OnInit {
  public productInfo = {};

  constructor(private productService: ProductDataService) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  ngOnInit() {
  }

}
