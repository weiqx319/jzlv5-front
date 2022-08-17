import {Component, DoCheck, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-quick-edit-creative-label-batch',
  templateUrl: './quick-edit-creative-label-batch.component.html',
  styleUrls: ['./quick-edit-creative-label-batch.component.scss']
})
export class QuickEditCreativeLabelBatchComponent implements OnInit,DoCheck {
  @Input() summaryType;
  @Output() result = new EventEmitter<any>();

  public label = [];

  public is_warning = false;

  constructor() { }

  ngOnInit(): void {
  }

  changeLabel() {
    this.is_warning = this.label.length <= 0;
  }

  ngDoCheck() {
    this.result.emit({ result: {label: this.label}, type: 'label'});
  }

}
