import {Component, Input, OnInit} from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-edit-price-message',
  templateUrl: './edit-price-message-modal.component.html',
  styleUrls: ['./edit-price-message-modal.component.scss']
})
export class EditPriceMessageModalComponent implements OnInit {
  @Input() editData: any;
  constructor(private modalSubject: NzModalRef) { }

  ngOnInit() {
  }

  cancel() {
    this.modalSubject.destroy('onCancel');
  }
  sure() {
    this.modalSubject.destroy('onOk');
  }
}
