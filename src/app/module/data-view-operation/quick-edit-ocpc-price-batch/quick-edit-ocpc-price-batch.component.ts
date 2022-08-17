import {Component, DoCheck, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-quick-edit-ocpc-price-batch',
  templateUrl: './quick-edit-ocpc-price-batch.component.html',
  styleUrls: ['./quick-edit-ocpc-price-batch.component.scss']
})
export class QuickEditOcpcPriceBatchComponent implements OnInit, DoCheck {


  @Output() result = new EventEmitter<any>();
 public param = {
    modify_type: 1,
  };
  public bach_edit_price = {
    price1: null,
    price2: null,
    price3: null,
    action2: 1,
    action3: 1,
    priceArray: [
      {name: '提高', value : 1 } ,
      {name: '降低', value : 2 }
    ]
  };
  constructor() { }

  ngOnInit() {

  }
  ngDoCheck() {
    if (this.param.modify_type === 1) {
    this.param['value'] = this.bach_edit_price.price1;
  }
    if (this.param.modify_type === 2) {
      this.param['value'] = this.bach_edit_price.price2;
      this.param['action'] = this.bach_edit_price.action2;
    }
    if (this.param.modify_type === 3) {
      this.param['value'] = this.bach_edit_price.price3;
      this.param['action'] = this.bach_edit_price.action3;
    }

    this.result.emit({ result: this.param, type: 'ocpc_bid'});
  }
}
