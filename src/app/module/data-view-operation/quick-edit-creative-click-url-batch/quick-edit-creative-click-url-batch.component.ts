import {Component, DoCheck, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-quick-edit-creative-click-url-batch',
  templateUrl: './quick-edit-creative-click-url-batch.component.html',
  styleUrls: ['./quick-edit-creative-click-url-batch.component.scss']
})
export class QuickEditCreativeClickUrlBatchComponent implements OnInit,DoCheck {
  @Input() summaryType;
  @Output() result = new EventEmitter<any>();

  public click_monitor_url = "";

  public is_warning = false;

  constructor() { }

  ngOnInit(): void {
  }

  changeClickUrl() {
    this.is_warning = !this.click_monitor_url;
  }

  ngDoCheck() {
    this.result.emit({ result: {click_monitor_url: this.click_monitor_url}, type: 'click_monitor_url'});
  }

}
