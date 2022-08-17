import { Component, OnInit } from '@angular/core';
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-conversion-oauth',
  templateUrl: './conversion-oauth.component.html',
  styleUrls: ['./conversion-oauth.component.scss']
})
export class ConversionOauthComponent implements OnInit {
  public productInfo = {};

  constructor(private productService: ProductDataService) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  ngOnInit() {
  }

}
