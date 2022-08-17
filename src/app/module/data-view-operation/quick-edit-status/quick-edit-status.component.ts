import {Component, DoCheck, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-quick-edit-status',
  templateUrl: './quick-edit-status.component.html',
  styleUrls: ['./quick-edit-status.component.scss']
})
export class QuickEditStatusComponent implements OnInit, DoCheck {

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
