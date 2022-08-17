import {Component, Input, OnInit} from '@angular/core';
import {TableItemService} from "../../service/table-item.service";
import {ItemOperationsService} from "../../../../shared/service/item-operations.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';


import {TableQueryBaseComponent} from '../../commonBaseClass/TableQueryBaseComponent';

@Component({
  selector: 'app-table-query',
  templateUrl: '../../commonTemplate/table-query/table-query.component.html',
  styleUrls: ['../../commonTemplate/table-query/table-query.component.scss'],
  providers: [TableItemService]
})
export class TableQueryComponent extends TableQueryBaseComponent implements OnInit {



  constructor(
    public subject: NzModalRef,
    public tableItemService: TableItemService,
    public itemOperationsService: ItemOperationsService,
    public _message: NzMessageService
    ) {

    super(subject,tableItemService,itemOperationsService,_message);
    this.conditionOper = this.itemOperationsService.getOperations();
  }

  ngOnInit() {
    this.init();
  }


}
