import {Component, Input, OnInit} from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-edit-message',
  templateUrl: './edit-message.component.html',
  styleUrls: ['./edit-message.component.scss']
})
export class EditMessageComponent implements OnInit {

  @Input() editData: any;
  @Input() edit_source: any;
  @Input() repeat: any;
  public price_status = 1; //1：保留 2：恢复
  constructor(private modalSubject: NzModalRef) { }

  ngOnInit() {
  }

  cancel() {
    this.modalSubject.destroy('onCancel');
  }
  sure() {
    if (this.edit_source === 'optimization_group') {
      if (this.editData) { //暂停
        this.modalSubject.destroy({
          name: 'onOk',
          value: this.price_status
        });
      } else { //开启
        this.modalSubject.destroy('onOk');
      }
    } else if (this.edit_source === 'edit_optimization_group_name') {
      this.modalSubject.destroy('onOk');
    } else {
      this.modalSubject.destroy('onOk');
    }

  }
}
