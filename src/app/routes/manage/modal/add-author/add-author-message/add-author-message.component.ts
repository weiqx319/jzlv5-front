import { Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ProductDataService } from "@jzl/jzl-product";

@Component({
  selector: 'app-add-author-message',
  templateUrl: './add-author-message.component.html',
  styleUrls: ['./add-author-message.component.scss']
})
export class AddAuthorMessageComponent implements OnInit {
  public productInfo = {};
  constructor(private modalSubject: NzModalRef, private productService: ProductDataService) {
    this.productService.getDataInfo().then((productInfo) => {
      this.productInfo = productInfo;
    });
  }

  ngOnInit() {
  }

  doCancel() {
    this.modalSubject.destroy('cancel');
  }
  doSave() {
    this.modalSubject.destroy('ok');
  }

}
