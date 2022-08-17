import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  ElementRef, Renderer2, AfterViewInit
} from '@angular/core';
import {ItemOperationsService} from "../../../../shared/service/item-operations.service";
import {TableItemService} from "../../service/table-item.service";
import {TableQueryShowBaseComponent} from '../../commonBaseClass/TableQueryShowBaseComponent';

@Component({
  selector: 'app-table-query-show',
  templateUrl: '../../commonTemplate/table-query-show/table-query-show.component.html',
  styleUrls: ['../../commonTemplate/table-query-show/table-query-show.component.scss'],
  providers: [TableItemService]
})
export class TableQueryShowComponent extends TableQueryShowBaseComponent implements OnInit, OnChanges {

  constructor(
    public ele: ElementRef,
    public renderer: Renderer2,
    public itemOperationsService: ItemOperationsService,
    public tableItemService: TableItemService) {

    super(ele,renderer,itemOperationsService,tableItemService);
    this.conditionOper = this.itemOperationsService.getOperations();
  }

  ngOnInit() {
    this.init();
  }



  ngOnChanges(changes: SimpleChanges): void {
    if (changes.conditions) {
      this.refreshShowConditions();
    }
    if (changes.filterConditions) {
      this.refreshShowFilterCondition();

    }
  }


}
