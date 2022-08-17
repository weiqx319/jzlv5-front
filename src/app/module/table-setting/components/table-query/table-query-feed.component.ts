import { Component, Input, OnInit } from '@angular/core';
import { TableItemFeedService } from "../../service/table-item-feed.service";
import { ItemOperationsService } from "../../../../shared/service/item-operations.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { isArray, isUndefined } from "@jzl/jzl-util";
import { deepCopy } from "@jzl/jzl-util";
import { TableQueryBaseComponent } from '../../commonBaseClass/TableQueryBaseComponent';

@Component({
  selector: 'app-table-query-feed',
  templateUrl: '../../commonTemplate/table-query/table-query.component.html',
  styleUrls: ['../../commonTemplate/table-query/table-query.component.scss'],
  providers: [TableItemFeedService]
})
export class TableQueryFeedComponent extends TableQueryBaseComponent implements OnInit {



  constructor(
    public subject: NzModalRef,
    public tableItemService: TableItemFeedService,
    public itemOperationsService: ItemOperationsService,
    public _message: NzMessageService
  ) {
    super(subject, tableItemService, itemOperationsService, _message);
    this.conditionOper = this.itemOperationsService.getOperations();
  }

  ngOnInit() {
    this.init();
    //创意模块（广点通、头条）筛选功能移除创意、创意名称字段
    this.allConditionList = this.allConditionList.filter(item => item.key !== 'creative' && item.key !== 'pub_creative_name');
  }





}
