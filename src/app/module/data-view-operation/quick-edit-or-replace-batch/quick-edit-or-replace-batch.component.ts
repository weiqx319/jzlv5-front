import {Component, DoCheck, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-quick-edit-or-replace-batch',
  templateUrl: './quick-edit-or-replace-batch.component.html',
  styleUrls: ['./quick-edit-or-replace-batch.component.scss']
})
export class QuickEditOrReplaceBatchComponent implements OnInit, DoCheck {


  @Output() result = new EventEmitter<any>();
 public param = {
    modify_type: 1,
  };
  public batch_edit_data = {
    batch_edit_value:'',
    batch_edit_search_value:'',
    batch_edit_replace_value:'',
  };
  constructor() { }

  ngOnInit() {

  }

  ngDoCheck() {
    if (this.param.modify_type === 1) {
      this.param['value'] = this.batch_edit_data.batch_edit_value;
    } else if (this.param.modify_type === 2) {
      this.param['value'] = this.batch_edit_data.batch_edit_replace_value;
      this.param['search'] = this.batch_edit_data.batch_edit_search_value;
    }



    this.result.emit({result: this.param, type: 'edit_or_replace_batch'});
  }
}
