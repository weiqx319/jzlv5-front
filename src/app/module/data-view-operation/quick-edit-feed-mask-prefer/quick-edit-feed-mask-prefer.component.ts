import {Component, DoCheck, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-quick-edit-feed-mask-prefer',
  templateUrl: './quick-edit-feed-mask-prefer.component.html',
  styleUrls: ['./quick-edit-feed-mask-prefer.component.scss']
})
export class QuickEditFeedMaskPreferComponent implements OnInit {

  @Input() @Input() set parentData(data) {
    this.maskPrefer = data;
  }
  @Output() result = new EventEmitter<any>();
  public maskPrefer = false;
  constructor() { }

  ngOnInit() {
  }

  ngDoCheck() {
    this.result.emit({ result: {value: this.maskPrefer}, type: 'mask_prefer'});
  }
}
