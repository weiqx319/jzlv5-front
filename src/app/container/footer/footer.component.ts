import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ProductDataService } from "@jzl/jzl-product";


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent implements OnInit {

  public productInfo = {};
  public startYear = '2014';
  public year = new Date().getFullYear();
  constructor(private productService: ProductDataService) { }

  ngOnInit() {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
      if (productInfo['establishmentDate']) {
        this.startYear = productInfo['establishmentDate']
      }
    });
  }

}
