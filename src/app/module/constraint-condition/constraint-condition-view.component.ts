import {Component, ElementRef, EventEmitter, Input, OnInit, DoCheck, Output, ViewChild} from '@angular/core';
import {DataStructureService} from "./service/data-structure.service";

@Component({
  selector: 'app-constraint-condition-view',
  templateUrl: './constraint-condition-view.component.html',
  styleUrls: ['./constraint-condition-view.component.scss'],
  providers: [DataStructureService]
})
export class ConstraintConditionViewComponent implements OnInit , DoCheck {
  @Input() parentSelect: any;   //标记是单个编辑 还是批量编辑
  @Input() is_edit: any = false;  //标记约束条件是否为  禁止点击状态  false：禁止  true：科电
  // @Input() showParentConstraintData = [];
  @Input() set showParentConstraintData(data) {//单个编辑需要回显的数据
    this.showParentConstraintDatas = data;
    this.init_constraint_condition();
  }

  @Input() publisher_id: any;
  @Input() isSingleEdit = false;   //标记是否单条编辑

  @Output() constraintArray: EventEmitter<Object> = new EventEmitter<Object>();

  constructor(private structureService: DataStructureService) {}

  public showParentConstraintDatas = [];
  public deviceArray = []; //设备数组
  public rank_option = {
    "pc": [
      {id: 1001, name: "左1"},
      {id: 1002, name: "左2"},
      {id: 1003, name: "左3"},
      {id: 1004, name: "左4"},
      {id: 1005, name: "左5"}
    ],
    "wap": [
      {id: 3001, name: "上1"},
      {id: 3002, name: "上2"},
      {id: 3003, name: "上3"},
      {id: 4001, name: "下1"},
      {id: 4002, name: "下2"},
      {id: 4003, name: "下3"}
    ]
  };
  public duLinkList: any;
  public newConstraintAttr = [];

  ngOnInit() {
    this.init_constraint_condition();
  }
  //每个时间段初始化
  perTimeSettingInit() {
    this.deviceArray = Object.keys(this.rank_option);
    const init_time_price_setting = {
      price_type: 1
    };
    if ((this.publisher_id * 1) === 4) {// 4：只显示wap
      this.deviceArray = this.deviceArray.splice(1, 1);
      init_time_price_setting['device'] = 'wap';
      init_time_price_setting['ranking_left'] = this.rank_option['wap'][0].id;
      init_time_price_setting['ranking_right'] = this.rank_option['wap'][2].id;
      init_time_price_setting['device_os'] = 1;
      init_time_price_setting['price_rate_min'] = 0.8;
      init_time_price_setting['price_rate_max'] = 1.3;
    } else { //其他，显示全部
      init_time_price_setting['device'] = 'pc';
      init_time_price_setting['ranking_left'] = this.rank_option['pc'][0].id;
      init_time_price_setting['ranking_right'] = this.rank_option['pc'][4].id;
      init_time_price_setting['device_os'] = 1;
      init_time_price_setting['price_rate_min'] = 0.8;
      init_time_price_setting['price_rate_max'] = 1.3;
    } /*else { //其他：显示pc
      this.deviceArray = this.deviceArray.splice(0, 1);
      init_time_price_setting['device'] = 'pc';
      init_time_price_setting['ranking_left'] = this.rank_option['pc'][0].id;
      init_time_price_setting['ranking_right'] = this.rank_option['pc'][0].id;
    }*/
    return JSON.parse(JSON.stringify(init_time_price_setting));
  }

  /*初始化回显时段*/
  init_constraint_condition() {
    this.duLinkList = this.structureService.getDuLinkList();
    if (this.parentSelect.length === 1) { //单个编辑时回显
      if (this.showParentConstraintDatas.length) { //有回显数据
        this.showParentConstraintDatas.forEach( item => {

          item['device_os'] = item['device_os'] * 1;
          this.perTimeSettingInit(); // 初始化设备列表
          if (!item.price_type) {
            item.price_type = 1;
          }
          if (!item.device) {
            item.device = this.perTimeSettingInit().device;
            item.ranking_left = this.perTimeSettingInit().ranking_left;
            item.ranking_right = this.perTimeSettingInit().ranking_right;
          }
          this.duLinkList.appendData(item);
        });
      } else { //无回显数据
        const timePriceInfo = this.perTimeSettingInit();
        timePriceInfo['min'] = 0;
        timePriceInfo['max'] = 23;
        this.duLinkList.appendData(timePriceInfo);
      }

    } else { //一次编辑多个
      const timePriceInfo = this.perTimeSettingInit();
      timePriceInfo['min'] = 0;
      timePriceInfo['max'] = 23;
      this.duLinkList.appendData(timePriceInfo);
    }
    this.updateConstraint();
  }

  appendNode(linkList , currentNode) {
    const min = currentNode.data.max + 1 ;
    const max = currentNode.next ? currentNode.next.data.min - 1 : 23 ;
    const timePriceInfo = this.perTimeSettingInit();
    timePriceInfo['min'] = min;
    timePriceInfo['max'] = max;
    linkList.insertData(currentNode , timePriceInfo);
    // linkList.insertData(currentNode , {"min": min, "max": max});
    this.updateConstraint();
  }

  removeNode(linkList , current ) {
    linkList.removeNode( current );
    this.updateConstraint();
  }

  updateConstraint() {
    this.newConstraintAttr = [];
    let current = this.duLinkList.head;
    for ( let i = 0; i < this.duLinkList.length ; i++) {
      while ( current.next ) {
        this.newConstraintAttr.push (current);
        current = current.next;
      }
    }
    this.newConstraintAttr.push (current);
  }

  rankingChange(item) {
    if (item.data.device === 'pc') {
      item.data.ranking_left = 1001;
      item.data.ranking_right = 1005;
    } else if (item.data.device === 'wap') {
      item.data.ranking_left = 3001;
      item.data.ranking_right = 3003;
    }
  }
  //生成lowBound - highRound 的数字数组
  getDateList(lowBound , highRound) {
    const result = [];
    for (let i = lowBound ; i < highRound ; i++ ) {
      result.push(i);
    }
    return result;
  }
  ngDoCheck() {
    this.constraintArray.emit(this.newConstraintAttr);
  }
}
