import {Component, ElementRef, EventEmitter, Input, OnInit, DoCheck, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-date-select-view',
  templateUrl: './date-select-view.component.html',
  styleUrls: ['./date-select-view.component.scss']
})
export class DateSelectViewComponent implements OnInit, DoCheck {

  @Output() dateSelected: EventEmitter<Object> = new EventEmitter<Object>();
  @Input() showCoefficient = false;
  @Input() set parentTimeDate(data) {
    const selectArray = [];
    const coefficientArray = [];
    data.forEach(item => {
      selectArray.push(...item['hour']);
      if(item.hasOwnProperty('hour_coefficient')) {
        coefficientArray.push(...item['hour_coefficient']);
      }

    });
    this.initTimeLayer(selectArray,coefficientArray);
  }
  @Input() is_mask: any;  //推广时段是否可编辑
  constructor() {

  }

  public dateOption = "all"; //时间默认
  public weekNameArray = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
  public ngIndexWeek = {
    '0': "星期一",
    '1': "星期二",
    '2': "星期三",
    '3': "星期四",
    '4': "星期五",
    '5': "星期六",
    '6': "星期日",
  };

  public timeArray = [];

  private ngIndexOption = {
    'all': {
      'state': 1,
      'satrtPosition': {'x': 0, 'y': 0},
      'endPosition': {
        'x': 20 * 23,
        'y': 20 * 6
      }
    },
    'working_day': {
      'state': 1,
      'satrtPosition': {'x': 0, 'y': 0},
      'endPosition': {
        'x': 20 * 23,
        'y': 20 * (5 - 1)
      }
    },
    'Weekend': {
      'state': 1,
      'satrtPosition': {'x': 0, 'y': (6 - 1) * 20},
      'endPosition': {
        'x': 20 * 23,
        'y': 20 * 6
      }
    },
    'reset' : {
      'state': 0,
      'satrtPosition': {'x': 0, 'y': 0},
      'endPosition': {
        'x': 20 * 23,
        'y': 20 * 6
      }
    }
  };
  public publicState = {
    'isHidden': true,
    'time': {},
    'clickTimePosition': {},
    'endTimePosition': {},
    'coefficient':1
  };
  public is_move = false;
  public showSelectFrame = false;
  public launch = true;
  public coefficient = 1;
  getItemStyle() {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 24 ; j++) {
        this.timeArray.push({
          'x': j * 20,
          'y': i * 20,
        });
      }
    }
  }
  //生成0 - 24 的数字数组
  getDateList(lowBound , highRound) {
    const result = [];
    for (let i = lowBound ; i <= highRound ; i++ ) {
      result.push(i);
    }
    return result;
  }
  timeMoseenter(time , event) {
    this.publicState.time = time;
    this.publicState.coefficient  = time['coefficient'];
    if (!this.is_move) {
      if (!this.showSelectFrame) {
        time['showBorder'] = true;
        this.publicState.isHidden = false;
        this.publicState['space'] = 20 + 10;
        this.publicState['weekName'] = '';
        this.publicState['timeName'] = '';
        this.publicState['weekName'] = this.ngIndexWeek[time.y / 20];
        const startTime = time.x / 20;
        const endTime = time.x / 20 + 1;
        this.publicState['startTime'] = startTime + ":00" ;
        this.publicState['endTime'] = endTime + ":00" ;

        const width = 20;
        const height = 20;
        this.publicState['clickTimeWidth'] = width;
        this.publicState['clickTimeHeight'] = height;
        this.publicState['clickTimePosition']['x'] = time.x;
        this.publicState['clickTimePosition']['y'] = time.y;
      }
    }


    if (this.is_move) {
      time['showBorder'] = false;
      this.publicState['endTimePosition']['x'] = time['x'];
      this.publicState['endTimePosition']['y'] = time['y'];
      this.setLayerStyle(3, this.publicState['clickTimePosition'] , this.publicState['endTimePosition']);


    }

  }
/*
* is_setting: 用来判断是点击按钮设置的  还是在设置时段一个个设置
* */
  setLayerStyle(state , startPoint, endPoint , is_setting?) {

    this.timeArray.forEach((item) => {
      //在坐标轴右侧情况
      if ((item['x'] >= startPoint['x'] && item['x'] <= endPoint['x']) || (item['x'] >= endPoint['x'] && item['x'] <= startPoint['x'])) {
        if (item['y'] >= startPoint['y'] && item['y'] <= endPoint['y']) {
          if (state === 3 || state === 2) {
            item['box_selection'] = state;
          }
          if (state === 1 || state === 0 ) {
            item['selected'] = state;
            item['coefficient'] = state === 0 ?1:this.coefficient;
          }
          if (item['y'] > endPoint['y'] && item['y'] < 120)  {
            if (item['box_selection'] === 3) {
              item['box_selection'] = 2;
            }
          }
        } else if (item['y'] >= endPoint['y'] && item['y'] <= startPoint['y']) { //右上
          if (state === 3 || state === 2) {
            item['box_selection'] = state;
          }
          if (state === 1 || state === 0 ) {
            item['selected'] = state;
          }
          if (item['y'] < endPoint['y'] && item['y'] > 0) {
            if (item['box_selection'] === 3) {
              item['box_selection'] = 2;
            }
          }
        } else {
          if (item['box_selection'] === 3) {
            item['box_selection'] = 2;
          }
          if (is_setting) {
            item['selected'] = 0;
          }
        }
      } else {
        if (item['box_selection'] === 3) {
          item['box_selection'] = 2;
        }
      }
    });
  }

  timeMoseOut(time) {
    time['showBorder'] = false;
  }

  operatiomMouseleave() {
    this.publicState.isHidden = true;
  }

  operationAreaMousedown(time , event) {
    time['showBorder'] = false;
    this.publicState.isHidden = true;
    this.is_move = true;
    this.publicState['clickTimePosition']['x'] = time['x'];
    this.publicState['clickTimePosition']['y'] = time['y'];
    this.publicState['endTimePosition']['x'] = time['x'];
    this.publicState['endTimePosition']['y'] = time['y'];
    this.setLayerStyle(3, this.publicState['clickTimePosition'] , this.publicState['endTimePosition']);

  }
  operationAreaMouseup(event) {
    this.is_move = false;
    this.showSelectFrame = true;
    if (this.publicState['clickTimePosition']['y'] < this.publicState['endTimePosition']['y']) { //x轴下边

      if (this.publicState['clickTimePosition']['x'] <= this.publicState['endTimePosition']['x']) { //下右
        this.publicState['enter_setting_time_layer_x'] = this.publicState['clickTimePosition']['x'];
        this.publicState['enter_setting_time_layer_y'] = this.publicState['endTimePosition']['y'] + 20;
      } else { //下左
        this.publicState['enter_setting_time_layer_x'] = this.publicState['endTimePosition']['x'];
        this.publicState['enter_setting_time_layer_y'] = this.publicState['endTimePosition']['y'] + 20;
      }
    } else {//x轴上方
      if (this.publicState['clickTimePosition']['x'] <= this.publicState['endTimePosition']['x']) { //上右
        this.publicState['enter_setting_time_layer_x'] = this.publicState['clickTimePosition']['x'];
        this.publicState['enter_setting_time_layer_y'] = this.publicState['clickTimePosition']['y'] + 20;
      } else {// 上左
        this.publicState['enter_setting_time_layer_x'] = this.publicState['endTimePosition']['x'];
        this.publicState['enter_setting_time_layer_y'] = this.publicState['clickTimePosition']['y'] + 20;
      }
    }

  }

  _launchSure() {
    this.launch ? this.setLayerStyle(1, this.publicState['clickTimePosition'] , this.publicState['endTimePosition']) : this.setLayerStyle(0, this.publicState['clickTimePosition'] , this.publicState['endTimePosition']);
    this.setLayerStyle(2, this.publicState['clickTimePosition'] , this.publicState['endTimePosition']);
    this.showSelectFrame = false;
    // console.log(this.timeArray);
  }
  _launchCancel() {
    this.setLayerStyle(2, this.publicState['clickTimePosition'] , this.publicState['endTimePosition']);
    this.showSelectFrame = false;
  }

  _testClick() {
    if (this.showSelectFrame) {
      // this.showSelectFrame = !this.showSelectFrame;

    }
  }

  initTimeLayer(showDate?,coefficientArray?) {

    if (showDate && showDate.length > 0) {
      let count = 0;
      showDate.forEach((item , index) => {
        this.timeArray[index]['selected'] = item === 1 ? 0 : 1;
        this.timeArray[index]['coefficient'] = 1;
        item === 0 ? count++ : count = count;
      });

      if(coefficientArray && coefficientArray.length>0) {
        coefficientArray.forEach((item,index)=> {
          this.timeArray[index]['coefficient'] = item === 0 ? 0:item;
        });
      }

     /* if (count === 0) {
        this.setLayerStyle(this.ngIndexOption['all'].state, this.ngIndexOption['all'].satrtPosition , this.ngIndexOption['all'].endPosition , true);
      }*/
    } else {
      this.setLayerStyle(this.ngIndexOption['all'].state, this.ngIndexOption['all'].satrtPosition , this.ngIndexOption['all'].endPosition , true);
    }
  }
  changeItem(item) {
    this.dateOption = item;
    this.setLayerStyle(this.ngIndexOption[item].state, this.ngIndexOption[item].satrtPosition , this.ngIndexOption[item].endPosition, true);
  }


  ngOnInit() {
    this.getItemStyle();
    this.initTimeLayer();
    if (this.is_mask === false) {
      this.is_mask = false;
    } else if (this.is_mask === true) {
      this.is_mask = true;
    } else {
      this.is_mask = true;
    }
  }

  ngDoCheck() {
    const date = [
      [], [], [], [], [], [], []
    ];
    const timeCoefficient = [];
    this.timeArray.forEach((item,allIndex) => {
      date[item.y / 20].push(item['selected']);
      const index = item.y / 20 +1;
      const hourIndex = allIndex%24;
      if(item['selected']) {
        timeCoefficient.push({timeId:index*100+hourIndex,priceFactor:item['coefficient']});
      }
    });
    const dateData = [];
    date.forEach((dateItem, index) => {
      dateData.push({
        'week': index + 1,
        'hour': dateItem,
      });


    });
    this.dateSelected.emit({dateData:dateData,priceFactor:timeCoefficient});
  }

}
