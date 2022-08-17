import {Component, DoCheck, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-quick-edit-keyword-price-single',
  templateUrl: './quick-edit-keyword-price-single.component.html',
  styleUrls: ['./quick-edit-keyword-price-single.component.scss']
})
export class QuickEditKeywordPriceSingleComponent implements OnInit, DoCheck {
  @Input() publisherId;
  @Input() summaryType;
  @Input() set parentData(data) {
    this.price = data;
  }
  @Output() result = new EventEmitter<any>();
  public price = 0.01;
  public bidStage = 1;
  public priceTypeArray = [
    {key: 1, label: "第一阶段出价"},
    {key: 2, label: "第二阶段出价"},
    {key: 3, label: "深度优化"},
  ];
  constructor() { }

  ngOnInit() {
  }
  ngDoCheck() {
    if(this.publisherId == 17 && this.summaryType == 'adgroup') {
      this.result.emit({ result: {value: this.price, bidStage: this.bidStage}, type: 'price_single'});
    } else {
      this.result.emit({ result: {value: this.price}, type: 'price_single'});
    }
  }
}
