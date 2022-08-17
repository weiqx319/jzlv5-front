import {Component, Input, OnInit} from "@angular/core";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {FormBuilder} from "@angular/forms";
import {TableItemService} from "../../service/table-item.service";
import {TableFiledBaseComponent} from '../../commonBaseClass/TableFiledBaseComponent';


@Component({
  selector: 'app-table-field',
  templateUrl: '../../commonTemplate/table-field/table-field.component.html',
  styleUrls: ['../../commonTemplate/table-field/table-field.component.scss'],
  providers: [TableItemService]

})
export class TableFieldComponent extends TableFiledBaseComponent implements OnInit {


  constructor(  public subject: NzModalRef,
                public fb: FormBuilder,
                public tableItemService: TableItemService,
                public _message: NzMessageService
  ) {
    super(subject, fb, tableItemService, _message);
    // this.conditionOper = this.itemOperationsService.getOperations();
  }



  ngOnInit(): void {
    this.init();
  }



}
