import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-layout-guard',
  templateUrl: './layout-guard.component.html',
  styleUrls: ['./layout-guard.component.scss']
})
export class LayoutGuardComponent implements OnInit {

  productInfo = {};
  constructor(private productService: ProductDataService) { }

  ngOnInit() {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

}
