import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-show-schedule",
  templateUrl: "./show-schedule.component.html",
  styleUrls: ["./show-schedule.component.scss"]
})
export class ShowScheduleComponent implements OnInit {
  //时间维度：1：一小时，0.5:半小时
  @Input() timeDimension=1;
  @Input() set parentTimeDate(data) {
    const selectArray = [];
    data.forEach(item => {
      selectArray.push(...item["hour"]);
    });
    this.initTimeLayer(data);
    // this.initTimeLayerOld(selectArray);
  }
  constructor() {}

  public dateOption = "all"; //时间默认
  public weekNameArray = [
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
    "星期日"
  ];
  public ngIndexWeek = {
    "0": "星期一",
    "1": "星期二",
    "2": "星期三",
    "3": "星期四",
    "4": "星期五",
    "5": "星期六",
    "6": "星期日"
  };

  public itemWidth = 23;
  public timeArray = [];
  public showArray = [];

  private ngIndexOption = {
    all: {
      state: 1,
      satrtPosition: { x: 0, y: 0 },
      endPosition: {
        x: this.itemWidth * 23,
        y: this.itemWidth * 6
      }
    },
    working_day: {
      state: 1,
      satrtPosition: { x: 0, y: 0 },
      endPosition: {
        x: this.itemWidth * 23,
        y: this.itemWidth * (5 - 1)
      }
    },
    Weekend: {
      state: 1,
      satrtPosition: { x: 0, y: (6 - 1) * this.itemWidth },
      endPosition: {
        x: this.itemWidth * 23,
        y: this.itemWidth * 6
      }
    },
    reset: {
      state: 0,
      satrtPosition: { x: 0, y: 0 },
      endPosition: {
        x: this.itemWidth * 23,
        y: this.itemWidth * 6
      }
    }
  };
  public publicState = {
    isHidden: true,
    time: {},
    clickTimePosition: {},
    endTimePosition: {}
  };
  public is_move = false;
  public showSelectFrame = false;
  public launch = true;
  getItemStyle() {
    this.timeArray = [];
    let xUnitWidth = 23;
    let xUnitLength = 24;
    if(this.timeDimension===0.5) {
      xUnitWidth = 11.5;
      xUnitLength = 48;
    }
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < xUnitLength; j++) {
        this.timeArray.push({
          x: j * xUnitWidth,
          y: i * this.itemWidth
        });
      }
    }
  }
  //生成0 - 24 的数字数组
  getDateList(lowBound, highRound) {
    const result = [];
    for (let i = lowBound; i <= highRound; i++) {
      result.push(i);
    }
    return result;
  }
  timeMoseenter(time, event) {
    this.publicState.time = time;

    if (!this.is_move) {
      if (!this.showSelectFrame) {
        time["showBorder"] = true;
        this.publicState.isHidden = false;
        this.publicState["space"] = this.itemWidth + 10;
        this.publicState["weekName"] = "";
        this.publicState["timeName"] = "";
        this.publicState["weekName"] = this.ngIndexWeek[
          time.y / this.itemWidth
        ];
        const startTime = time.x / this.itemWidth;
        const endTime = time.x / this.itemWidth + 1;
        this.publicState["startTime"] = startTime + ":00";
        this.publicState["endTime"] = endTime + ":00";

        const width = this.itemWidth;
        const height = this.itemWidth;
        this.publicState["clickTimeWidth"] = width;
        this.publicState["clickTimeHeight"] = height;
        this.publicState["clickTimePosition"]["x"] = time.x;
        this.publicState["clickTimePosition"]["y"] = time.y;
      }
    }

    if (this.is_move) {
      time["showBorder"] = false;
      this.publicState["endTimePosition"]["x"] = time["x"];
      this.publicState["endTimePosition"]["y"] = time["y"];
      this.setLayerStyle(
        3,
        this.publicState["clickTimePosition"],
        this.publicState["endTimePosition"]
      );
    }
  }
  /*
   * is_setting: 用来判断是点击按钮设置的  还是在设置时段一个个设置
   * */
  setLayerStyle(state, startPoint, endPoint, is_setting?) {
    this.timeArray.forEach(item => {
      //在坐标轴右侧情况
      if (
        (item["x"] >= startPoint["x"] && item["x"] <= endPoint["x"]) ||
        (item["x"] >= endPoint["x"] && item["x"] <= startPoint["x"])
      ) {
        if (item["y"] >= startPoint["y"] && item["y"] <= endPoint["y"]) {
          if (state === 3 || state === 2) {
            item["box_selection"] = state;
          }
          if (state === 1 || state === 0) {
            item["selected"] = state;
          }
          if (item["y"] > endPoint["y"] && item["y"] < 120) {
            if (item["box_selection"] === 3) {
              item["box_selection"] = 2;
            }
          }
        } else if (item["y"] >= endPoint["y"] && item["y"] <= startPoint["y"]) {
          //右上
          if (state === 3 || state === 2) {
            item["box_selection"] = state;
          }
          if (state === 1 || state === 0) {
            item["selected"] = state;
          }
          if (item["y"] < endPoint["y"] && item["y"] > 0) {
            if (item["box_selection"] === 3) {
              item["box_selection"] = 2;
            }
          }
        } else {
          if (item["box_selection"] === 3) {
            item["box_selection"] = 2;
          }
          if (is_setting) {
            item["selected"] = 0;
          }
        }
      } else {
        if (item["box_selection"] === 3) {
          item["box_selection"] = 2;
        }
      }
    });
  }

  timeMoseOut(time) {
    time["showBorder"] = false;
  }

  operatiomMouseleave() {
    this.publicState.isHidden = true;
  }

  operationAreaMousedown(time, event) {
    time["showBorder"] = false;
    this.publicState.isHidden = true;
    this.is_move = true;
    this.publicState["clickTimePosition"]["x"] = time["x"];
    this.publicState["clickTimePosition"]["y"] = time["y"];
    this.publicState["endTimePosition"]["x"] = time["x"];
    this.publicState["endTimePosition"]["y"] = time["y"];
    this.setLayerStyle(
      3,
      this.publicState["clickTimePosition"],
      this.publicState["endTimePosition"]
    );
  }
  operationAreaMouseup(event) {
    this.is_move = false;
    this.showSelectFrame = true;
    if (
      this.publicState["clickTimePosition"]["y"] <
      this.publicState["endTimePosition"]["y"]
    ) {
      //x轴下边

      if (
        this.publicState["clickTimePosition"]["x"] <=
        this.publicState["endTimePosition"]["x"]
      ) {
        //下右
        this.publicState["enter_setting_time_layer_x"] = this.publicState[
          "clickTimePosition"
        ]["x"];
        this.publicState["enter_setting_time_layer_y"] =
          this.publicState["endTimePosition"]["y"] + this.itemWidth;
      } else {
        //下左
        this.publicState["enter_setting_time_layer_x"] = this.publicState[
          "endTimePosition"
        ]["x"];
        this.publicState["enter_setting_time_layer_y"] =
          this.publicState["endTimePosition"]["y"] + this.itemWidth;
      }
    } else {
      //x轴上方
      if (
        this.publicState["clickTimePosition"]["x"] <=
        this.publicState["endTimePosition"]["x"]
      ) {
        //上右
        this.publicState["enter_setting_time_layer_x"] = this.publicState[
          "clickTimePosition"
        ]["x"];
        this.publicState["enter_setting_time_layer_y"] =
          this.publicState["clickTimePosition"]["y"] + this.itemWidth;
      } else {
        // 上左
        this.publicState["enter_setting_time_layer_x"] = this.publicState[
          "endTimePosition"
        ]["x"];
        this.publicState["enter_setting_time_layer_y"] =
          this.publicState["clickTimePosition"]["y"] + this.itemWidth;
      }
    }
  }

  _launchSure() {
    this.launch
      ? this.setLayerStyle(
          1,
          this.publicState["clickTimePosition"],
          this.publicState["endTimePosition"]
        )
      : this.setLayerStyle(
          0,
          this.publicState["clickTimePosition"],
          this.publicState["endTimePosition"]
        );
    this.setLayerStyle(
      2,
      this.publicState["clickTimePosition"],
      this.publicState["endTimePosition"]
    );
    this.showSelectFrame = false;
  }
  _launchCancel() {
    this.setLayerStyle(
      2,
      this.publicState["clickTimePosition"],
      this.publicState["endTimePosition"]
    );
    this.showSelectFrame = false;
  }

  _testClick() {
    if (this.showSelectFrame) {
      // this.showSelectFrame = !this.showSelectFrame;
    }
  }
  initTimeLayerOld(showDate) {
    this.getItemStyle();
    if (showDate && showDate.length > 0) {
      let count = 0;
      showDate.forEach((item, index) => {
        this.timeArray[index]["selected"] = item === 1 ? 0 : 1;
        item === 0 ? count++ : (count = count);
      });
      if (count === 0) {
        this.setLayerStyle(
          this.ngIndexOption["all"].state,
          this.ngIndexOption["all"].satrtPosition,
          this.ngIndexOption["all"].endPosition,
          true
        );
      }
    } else {
      this.setLayerStyle(
        this.ngIndexOption["all"].state,
        this.ngIndexOption["all"].satrtPosition,
        this.ngIndexOption["all"].endPosition,
        true
      );
    }
  }

  initTimeLayer(showDate?) {
    this.getItemStyle();
    if (showDate && showDate.length > 0) {
      let count = 0;
      this.showArray = [];
      showDate.forEach((showDateItem, showIndex) => {
        const showItemArray = [];
        const len = showDateItem["hour"].length;
        let step = 0;
        let start = null;
        showDateItem["hour"].reduce((prev, cur, index) => {
          this.timeArray[index]["selected"] = prev === 1 ? 0 : 1;
          prev === 0 ? count++ : (count = count);
          if (!prev) {
            start === null ? (start = index) : " ";
            if (cur === prev) {
              step++;
            }
            if (index === len - 1) {
              showItemArray.push({
                start: start - 1,
                end: start + step,
                week: showIndex
              });
            }
          } else {
            if (step) {
              showItemArray.push({
                start: start - 1,
                end: start + step,
                week: showIndex
              });
              step = 0;
              start = null;
            }
          }
          return cur;
        });

        this.showArray.push(...showItemArray);
      });
      if (count === 0) {
        this.setLayerStyle(
          this.ngIndexOption["all"].state,
          this.ngIndexOption["all"].satrtPosition,
          this.ngIndexOption["all"].endPosition,
          true
        );
      }
    } else {
      this.setLayerStyle(
        this.ngIndexOption["all"].state,
        this.ngIndexOption["all"].satrtPosition,
        this.ngIndexOption["all"].endPosition,
        true
      );
    }
  }
  changeItem(item) {
    this.dateOption = item;
    this.setLayerStyle(
      this.ngIndexOption[item].state,
      this.ngIndexOption[item].satrtPosition,
      this.ngIndexOption[item].endPosition,
      true
    );
  }

  ngOnInit() {}
}
