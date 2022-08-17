import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-quick-edit-feed-region',
  templateUrl: './quick-edit-feed-region.component.html',
  styleUrls: ['./quick-edit-feed-region.component.scss']
})
export class QuickEditFeedRegionComponent implements OnInit {
  @Input() regionList = [];
  @Input() checkErrorTip;
  @Output() result = new EventEmitter<any>();
  public region_type = 1;
  public region_type_sub = [
    { label: '不限', value: 1, },
    { label: '自定义', value: 2, },
  ];
  public region = {
    sourceData: [],
    resultData: [],
  }
  constructor() { }

  ngOnInit(): void {
    this.region.sourceData = this.regionList;
    this.emitData();
  }

  transferTreeChange(sourceData, data: any[]) {
    sourceData.resultData = [...data];
    if (sourceData.resultData.length < 1) {
      this.checkErrorTip.region.is_show = true;
    } else {
      this.checkErrorTip.region.is_show = false;
    }
    this.emitData();
  }
  emitData() {
    this.result.emit({ result: { type: this.region_type, value: this.region.resultData }, type: 'region' });
  }
}
