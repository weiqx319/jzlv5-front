import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  ElementRef, Renderer2
} from '@angular/core';
import {ItemOperationsService} from "../../../../shared/service/item-operations.service";
import {TableItemFeedService} from "../../service/table-item-feed.service";
import {TableQueryShowBaseComponent} from '../../commonBaseClass/TableQueryShowBaseComponent';

@Component({
  selector: 'app-table-query-show-feed',
  templateUrl: '../../commonTemplate/table-query-show/table-query-show.component.html',
  styleUrls: ['../../commonTemplate/table-query-show/table-query-show.component.scss'],
  providers: [TableItemFeedService]
})
export class TableQueryShowFeedComponent extends TableQueryShowBaseComponent implements OnInit, OnChanges {


  constructor(
    public ele: ElementRef,
    public renderer: Renderer2,
    public itemOperationsService: ItemOperationsService,
    public tableItemService: TableItemFeedService) {

    super(ele,renderer,itemOperationsService,tableItemService);
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
