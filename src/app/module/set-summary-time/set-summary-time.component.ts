import {Component, Input, OnInit} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {DataStructureService} from "../constraint-condition/service/data-structure.service";
import {SetSummaryTimeStructureService} from "./service/set-summary-time-structure.service";

@Component({
  selector: 'app-set-summary-time',
  templateUrl: './set-summary-time.component.html',
  styleUrls: ['./set-summary-time.component.scss'],
})
export class SetSummaryTimeComponent implements OnInit {

  @Input() showParentSummaryTimeData: any;

  public duLinkList: any;
  public newSummaryTimeAttr = [];
  public startHour: any;
  public endHour: any;

  public summaryTimeData = {
    start_end_data: {
      startDate: 'prev', //day:0:0: 今天  prev：昨天
      startHour: 0,
      endDate: 'prev', //next: 今天  prev：昨天
      endHour: 23,
    },
  };
  constructor(private structureService: SetSummaryTimeStructureService,
              private subject: NzModalRef,
              private _message: NzMessageService) { }

  ngOnInit() {
    this.init_summary_time();
  }

  init_summary_time() {
    this.duLinkList = this.structureService.getDuLinkList();
    if (this.showParentSummaryTimeData && this.showParentSummaryTimeData.length) { //有回显数据
      JSON.parse(JSON.stringify(this.showParentSummaryTimeData)).forEach((item, index) => {
        if (item.startDate === 'next') { //今天
          item.startHour = item.startHour + 24;
        }
        if (item.endDate === 'next') { //今天
          item.endHour = item.endHour + 24;
        }

        if (index === 0) {
          this.startHour = item.startHour;
          this.endHour = this.startHour + 24;
        }
        this.duLinkList.appendData(item);
      });

    } else { //无回显
      const dateTimeInfo = {
        startDate: null, //next: 今天  prev：昨天
        startHour: null,
        endDate: null, //next: 今天  prev：昨天
        endHour: null,

      };
      this.duLinkList.appendData(dateTimeInfo);

    }

    this.updateConstraint();
  }
  appendNode(linkList, currentNode) {
    const startHour = currentNode.data.endHour ;
    // const endHour = currentNode.next ? currentNode.next.data.startHour - 1 : 47 ;
    const endHour = null ;

    const dateTimeInfo = {
      startDate: null, //next: 今天  prev：昨天
      startHour,
      endDate: null, //next: 今天  prev：昨天
      endHour,
    };
    if (startHour <= 24) { //开始：昨天
      dateTimeInfo.startDate = 'prev';
    } else {
      dateTimeInfo.startDate = 'next';
      dateTimeInfo.endDate = 'next';
    }
    // if (endHour <= 24) { //结束：昨天
    //   dateTimeInfo.endDate = 'prev';
    // } else {
    //   dateTimeInfo.endDate = 'next';
    // }

    linkList.insertData(currentNode , dateTimeInfo);
    this.updateConstraint();
  }

  removeNode(linkList , current, index) {
    if (index === 0) {
      current.data.startDate = null;
      current.data.startHour = null;
      current.data.endDate = null;
      current.data.endHour = null;
    } else {
      if (index !== linkList.length - 1) {
        current.next.data.startHour = current.prev.data.endHour;
        current.next.data.startDate = current.prev.data.endDate;

        current.prev.next = current.next;
        current.next.prev = current.prev;
      }
      linkList.removeNode( current );
      this.updateConstraint();
    }

  }

  updateConstraint() {
    this.newSummaryTimeAttr = [];
    let current = this.duLinkList.head;
    for ( let i = 0; i < this.duLinkList.length ; i++) {
      while ( current.next ) {
        this.newSummaryTimeAttr.push (current);
        current = current.next;
      }
    }
    this.newSummaryTimeAttr.push (current);


  }

  //生成lowBound - highRound 的数字数组
  getTimeList(lowBound , highRound) {

    const result = [];
    for (let i = lowBound ; i <= highRound ; i++ ) {
      result.push(i);
    }
    return result;
  }
  changeStartDate(data, index, from?) {
    if (index === 0) {
      this.clearNodes(index);

      data.data.endDate = null;
      data.data.endHour = null;

      if (data.data.startDate === 'prev') {//昨天
        data.data.startHour = null;
      } else if (data.data.startDate === 'next') {//今天
        data.data.startHour = null;
      }
      this.startHour = data.data.startHour;
      this.endHour = this.startHour + 24;

    } else {
      data.data.endDate = null;
      data.data.endHour = null;
      if (data.data.startDate === 'prev') {//昨天
        data.data.startHour = data.prev.data.endHour;
      } else if (data.data.startDate === 'next') {//今天
        data.data.startHour = 25;
      }
    }
  }
  changeStartHour(data, index) {
    if (index === 0) {
      this.clearNodes(index);
      data.data.endDate = null;
      data.data.endHour = null;

      this.startHour = data.data.startHour;
      this.endHour = this.startHour + 24;

    } else if (index !== this.duLinkList.length - 1) {
      data.prev.data.endDate = data.data.startDate;
      data.prev.data.endHour = data.data.startHour;
    } else {
      data.prev.data.endDate = data.data.startDate;
      data.prev.data.endHour = data.data.startHour;
      data.data.endDate = null;
      data.data.endHour = null;
    }
  }

  changeEndDate(data, index) {
    if (index === 0) {
      this.clearNodes(index);
    }
    data.data.endHour = null;

  }
  changeEndHour(data, index) {
    if (data.next && index !== 0) {
      data.next.data.startHour = data.data.endHour;
      data.next.data.startDate = data.data.endDate;
    } else {
      if (index === 0) {
        // this.newSummaryTimeAttr.forEach((item, indexs) => {
        //   if (indexs !== 0) {
        //     this.removeNode(this.duLinkList, item, indexs);
        //   }
        // });
        this.clearNodes(index);

      }
    }
  }

  clearNodes(startIndex) {
    if (this.duLinkList.length > 1) {
      for (let i = this.newSummaryTimeAttr.length - 1; i >= 0; i--) {
        if (i > startIndex) {
          this.removeNode(this.duLinkList, this.newSummaryTimeAttr[i], i);
        }
      }
    }

    // this.newSummaryTimeAttr.forEach((item, indexs) => {
    //   if (indexs > startIndex) {
    //     this.removeNode(this.duLinkList, item, indexs);
    //   }
    // });
  }
  clearSet() {
    this.clearNodes(0);
    this.removeNode(this.duLinkList, this.newSummaryTimeAttr[0], 0);

  }

  cancelModal(): void {
    this.subject.destroy({name: 'onCancel'});
  }
  saveModal(): void {
    const resultAttr = [];
    let hasNull = false;
    this.newSummaryTimeAttr.forEach((item) => {
      if (item.data.startDate === 'next' && item.data.startHour) { //今天
        item.data.startHour = item.data.startHour - 24;
      }
      if (item.data.endDate === 'next' && item.data.endHour) { //今天
        item.data.endHour = item.data.endHour - 24;
      }
      if (item.data.startDate && (!item.data.startHour || !item.data.endDate || !item.data.endHour) ) {
        hasNull = true;
      }

      resultAttr.push(item.data);
    });

    if ((resultAttr[resultAttr.length - 1].endDate === 'next' ? resultAttr[resultAttr.length - 1].endHour + 24 : resultAttr[resultAttr.length - 1].endHour) !== this.endHour) {
      resultAttr.push({
        startDate: resultAttr[resultAttr.length - 1].endDate, //day:0:0: 今天  prev：昨天
        startHour: resultAttr[resultAttr.length - 1].endHour > 24 ? resultAttr[resultAttr.length - 1].endHour - 24 : resultAttr[resultAttr.length - 1].endHour,
        endDate: this.endHour > 24 ? 'next' : 'prev', //next: 今天  prev：昨天
        endHour: this.endHour > 24 ? this.endHour - 24 : this.endHour,
      });
    }

    if (this.newSummaryTimeAttr.length === 1 && !this.newSummaryTimeAttr[0].data.startDate) {
      resultAttr.length = 0;
      this.subject.destroy({name: 'onOk', value: resultAttr});
    } else if (hasNull) {
      this._message.warning('时段不能为空，请完善');
    } else {
      this.subject.destroy({name: 'onOk', value: resultAttr});

    }
  }

}
