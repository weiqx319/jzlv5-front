import {Component, DoCheck, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-quick-edit-keyword-match-type',
  templateUrl: './quick-edit-keyword-match-type.component.html',
  styleUrls: ['./quick-edit-keyword-match-type.component.scss']
})
export class QuickEditKeywordMatchTypeComponent implements OnInit, DoCheck {

  @Input() matchTypeData: any;
  @Input() set parentData(data) {
    this.match_type = data;
  }
  @Output() result = new EventEmitter<any>();
  public match_type = false;

  constructor() { }

  ngOnInit() {
  }
  ngDoCheck() {
    this.result.emit({ result: {value: this.match_type}, type: 'match_type'});
  }
}
