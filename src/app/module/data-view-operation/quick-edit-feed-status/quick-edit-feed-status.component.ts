import {Component, DoCheck, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-quick-edit-feed-status',
  templateUrl: './quick-edit-feed-status.component.html',
  styleUrls: ['./quick-edit-feed-status.component.scss']
})
export class QuickEditFeedStatusComponent implements OnInit, DoCheck {

  @Input() @Input() set parentData(data) {
    this.status = data;
  }
  @Output() result = new EventEmitter<any>();
  public status = false;
  constructor() { }

  ngOnInit() {
  }

  ngDoCheck() {
    this.result.emit({ result: {value: this.status}, type: 'pause'});
  }
}
