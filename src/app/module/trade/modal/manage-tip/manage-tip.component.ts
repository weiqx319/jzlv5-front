import { Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-manage-tip',
  templateUrl: './manage-tip.component.html',
  styleUrls: ['./manage-tip.component.scss']
})
export class ManageTipComponent implements OnInit {

  constructor(private modalSubject: NzModalRef) { }

  ngOnInit() {
  }
  doCancel() {
    this.modalSubject.destroy('onCancel');
  }
  doSave() {
    this.modalSubject.destroy('onOk');

  }

}
