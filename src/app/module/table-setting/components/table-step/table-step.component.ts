import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { differenceInCalendarDays, endOfMonth, endOfWeek, format, isValid, parse, startOfMonth, startOfToday, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { isArray, isNull, isUndefined } from "@jzl/jzl-util";
import { AuthService } from "../../../../core/service/auth.service";
import { MenuService } from '../../../../core/service/menu.service';
import { DateDefineService } from "../../../../shared/service/date-define.service";
import { ItemOperationsService } from "../../../../shared/service/item-operations.service";
import { SetSummaryTimeComponent } from "../../../set-summary-time/set-summary-time.component";
import { TableItemService } from "../../service/table-item.service";
import { TableStepBaseComponent } from '../../commonBaseClass/TableStepBaseComponent';
import { CustomDatasService } from "../../../../shared/service/custom-datas.service";

@Component({
  selector: 'app-table-step',
  templateUrl: '../../commonTemplate/table-step/table-step.component.html',
  styleUrls: ['../../commonTemplate/table-step/table-step.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TableItemService, DateDefineService],
})
export class TableStepComponent extends TableStepBaseComponent implements OnInit {


  constructor(public subject: NzModalRef,
    public authService: AuthService,
    public modalService: NzModalService,
    public fb: FormBuilder,
    public dateDefineService: DateDefineService,
    public tableItemService: TableItemService,
    public itemOperationsService: ItemOperationsService,
    public _message: NzMessageService,
    public menuService: MenuService,
    public customDatasService: CustomDatasService,
  ) {
    super(subject, authService, modalService, fb, dateDefineService, tableItemService, itemOperationsService, _message, menuService, customDatasService);
    this.conditionOper = this.itemOperationsService.getOperations();
    this.userSelectedOper = this.authService.getCurrentUserOperdInfo();
  }

  ngOnInit() {
    this.init();

  }


}
