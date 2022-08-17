import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-quick-edit-keyword-price-batch',
  templateUrl: './quick-edit-keyword-price-batch.component.html',
  styleUrls: ['./quick-edit-keyword-price-batch.component.scss']
})
export class QuickEditKeywordPriceBatchComponent implements OnInit, DoCheck {
  @Input() summaryType;
  @Input() publisherId;
  @Output() result = new EventEmitter<any>();
  @Output() valueChange = new EventEmitter<string>();
  public param = {
    modify_type: 1,
  };
  public bach_edit_price = {
    price: null,
    price1: null,
    price2: null,
    price3: null,
    action2: 1,
    action3: 1,
    bidStage: 1,
    priceArray: [
      { name: '提高', value: 1 },
      { name: '降低', value: 2 }
    ],
    minPrice: null,
    maxPrice: null,
  };
  public priceTypeArray = [
    { key: 1, label: "第一阶段出价" },
    { key: 2, label: "第二阶段出价" },
    { key: 3, label: "深度优化" },
  ];

  constructor() { }

  ngOnInit() {

  }
  ngDoCheck() {
    if (this.publisherId == 17) {
      this.param['value'] = this.bach_edit_price.price;
      this.param['bidStage'] = this.bach_edit_price.bidStage;
    } else {
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
      // 小红书
      if (this.publisherId == 24) {
        this.param['minPrice'] = this.bach_edit_price.minPrice;
        this.param['maxPrice'] = this.bach_edit_price.maxPrice;
      }
    }


    this.result.emit({ result: this.param, type: 'price_batch' });
  }

  someChange(){
    this.valueChange.next('valueChange');
  }
}
