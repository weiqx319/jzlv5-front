import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {DataViewAddEditService} from "../../service/data-view-add-edit.service";
import {AuthService} from "../../../../core/service/auth.service";
import {NotifyService} from "../../../../module/notify/notify.service";
import {format, differenceInCalendarDays } from "date-fns";
import {DataStackService} from '../../../../shared/service/data-stack.service';

@Component({
  selector: 'app-edit-creative-single',
  templateUrl: './edit-creative-single.component.html',
  styleUrls: ['./edit-creative-single.component.scss']
})
export class EditCreativeSingleComponent implements OnInit, OnChanges {

  @Input() stringIdArray: any;
  @Input() publisher_model: any;
  @Input() parentData: any;
  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('creativeTitle') creativeTitle: ElementRef<any>;
  @ViewChild('description1') description1: ElementRef<any>;
  @ViewChild('description2') description2: ElementRef<any>;
  constructor(private _http: DataViewAddEditService,
              private message: NzMessageService,
              private  authService: AuthService,
              private notifyService: NotifyService,
              private stack: DataStackService,
              private modalService: NzModalService) {
    this.publisherOption = this._http.getPublisherOption();
  }

  public publisherOption = {};
  public originalityInfo = {};
  public cursorPosition = 0;

  public publishId: any;  //1,百度  2，搜狗 3,360  4，神马
  public tabItem: number ;
  public iswraing = false;
  public campaignInfo = {};
  public tabs = [
    {name: '取消', value : 0 } ,
    {name: '蓝', value : 1 } ,
    {name: '绿', value : 2 } ,
    {name: '黄', value : 3 } ,
    {name: '橙', value : 4 } ,
    {name: '红', value : 5 } ,
  ];
  public discription1Range = { //描述1字数限制数
    1: {'min': 9, 'max': 80},
    2: {'min': 8, 'max': 80},
    3: {'min': 1, 'max': 80},
    4: {'min': 16, 'max': 136}
  };
  public discription2Range = { //描述2字数限制数
    1: {'min': 9, 'max': 80},
    2: {'min': 8, 'max': 80},
    3: {'min': 1, 'max': 80}
  };
  public creativeTitleRange = { //标题字数限制数
    1: {'min': 9, 'max': 50},
    2: {'min': 8, 'max': 50},
    3: {'min': 1, 'max': 50},
    4: {'min': 16, 'max': 70}
  };
  public originalityCheck = {
    'titlePrompt': '',
    'discription1Prompt': '',
    'discription2Prompt': '',
    'pcDestinationUrlPrompt': '',
    'pcDisplayUrlPrompt': '',
    'wapDestinationUrlPrompt': '',
    'wapDisplayUrlPrompt': ''
  };

  public cronSettingTime:any =  new Date();
  public cronSetting = 'now';
  public editingOriginalityData = {
    'cron_setting':'now',
    "pub_creative_ids": [],
    "batch_update_item": {
      "is_edit": false,
      "batch_item_type": 1,
      "modify_type": 1,
      "search": "",
      "value": ""
    },
    "pub_creative_title": {
      "is_edit": false,
      "value": ""
    },
    "pub_creative_description1": {
      "is_edit": false,
      "value": ""
    },
    "pub_creative_description2": {
      "is_edit": false,
      "value": ""
    },
    "pc_destination_url": {
      "is_edit": false,
      "modify_type": 1,
      "search": "",
      "value": ""
    },
    "wap_destination_url": {
      "is_edit": false,
      "modify_type": 1,
      "search": "",
      "value": ""
    },
    "pc_display_url": {
      "is_edit": false,
      "modify_type": 1,
      "search": "",
      "value": ""
    },
    "wap_display_url": {
      "is_edit": false,
      "modify_type": 1,
      "search": "",
      "value": ""
    },
    "pause": {
      "is_edit": false,
      "value": false
    },
    "tabs": {
      "is_edit": false,
      "value": []
    }

  };

  public tips = {
    pub_creative_title: false,
    pub_creative_description1: false,
    pub_creative_description2: false,
    pc_destination_url: false,
    pc_display_url: false,
    wap_destination_url: false,
    wap_display_url: false,
    length: {
      pub_creative_title: 0,
      pub_creative_description1: 0,
      pub_creative_description2: 0,
      pc_destination_url: 0,
      pc_display_url: 0,
      wap_destination_url: 0,
      wap_display_url: 0,

    },
    check: {
      pub_creative_title: false,
      pub_creative_description1: false,
      pub_creative_description2: false,
    }
  };

  ngOnInit() {
    this.publishId = this.parentData.selected_data[0].publisher_id * 1;
    this._showOriginality();
    this._showCampaign();
  }

  _showCampaign() {
    this._http.showCampaign ({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_campaign_id": this.parentData.selected_data[0].pub_campaign_id
    }).subscribe(
      (result) => {
        this.campaignInfo = result.data;
      }
    );
  }

  _showOriginality() {

    this._http.showOriginality({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_creative_id": this.parentData.selected_data[0].pub_creative_id,
    }).subscribe(
      (result) => {
        if (result['status_code'] === 200) {
          this.originalityInfo = result['data'];
          this.editingOriginalityData.pause.value =  result.data.pause;

          this.editingOriginalityData.pub_creative_title.value = result['data']['pub_creative_title'];
          this.tips.length.pub_creative_title =  this._http.chkstrlen(result['data']['pub_creative_title']);

          this.editingOriginalityData.pub_creative_description1.value = result['data']['pub_creative_description1'];
          this.tips.length.pub_creative_description1 =  this._http.chkstrlen(result['data']['pub_creative_description1']);

          this.editingOriginalityData.pub_creative_description2.value = result['data']['pub_creative_description2'];
          this.tips.length.pub_creative_description2 =  this._http.chkstrlen(result['data']['pub_creative_description2']);

          this.editingOriginalityData.pc_destination_url.value = result['data']['pc_destination_url'];
          this.tips.length.pc_destination_url =  this._http.chkstrlen(result['data']['pc_destination_url']);

          this.editingOriginalityData.wap_destination_url.value = result['data']['wap_destination_url'];
          this.tips.length.wap_destination_url =  this._http.chkstrlen(result['data']['wap_destination_url']);

          this.editingOriginalityData.pc_display_url.value = result['data']['pc_display_url'];
          this.tips.length.pc_display_url =  this._http.chkstrlen(result['data']['pc_display_url']);

          this.editingOriginalityData.wap_display_url.value = result['data']['wap_display_url'];
          this.tips.length.wap_display_url =  this._http.chkstrlen(result['data']['wap_display_url']);

          this.editingOriginalityData.tabs.value = result['data']['tabs'];
          this.tabItem = result['data']['tabs'][0];

        }
      }
    );
  }

  checkPage() {
    this.originalityCheck['titlePrompt'] = '';
    this.originalityCheck['discription1Prompt'] = '';
    this.originalityCheck['pcDestinationUrlPrompt'] = '';
    this.originalityCheck['pcDisplayUrlPrompt'] = '';
    this.originalityCheck['wapDestinationUrlPrompt'] = '';
    this.originalityCheck['wapDisplayUrlPrompt'] = '';

    this.tips.pub_creative_title = false;
    this.tips.pub_creative_description1 = false;
    this.tips.pub_creative_description2 = false;
    this.tips.pc_destination_url = false;
    this.tips.pc_display_url = false;
    this.tips.wap_destination_url = false;
    this.tips.wap_display_url = false;

    //标题
    if (this.editingOriginalityData['pub_creative_title']['is_edit']) {

      if (!this.editingOriginalityData['pub_creative_title']['value']) {
        this.iswraing = true;
        this.originalityCheck['titlePrompt'] = "创意标题不能为空";
        this.tips.pub_creative_title = true;
        return false;
      } else {
        const titleLength = this._http.chkstrlen(this.editingOriginalityData['pub_creative_title']['value']);
        if (titleLength < this.creativeTitleRange[this.publishId]['min'] || titleLength > this.creativeTitleRange[this.publishId]['max'] ) {
          this.originalityCheck['titlePrompt'] = "创意标题长度不能小于" + this.creativeTitleRange[this.publishId]['min'] + "个字符，并且不能大于" + this.creativeTitleRange[this.publishId]['max'] + "个字符";
          this.iswraing = true;
          this.tips.pub_creative_title = true;
          return false;
        }
      }
    }

    //描述1
    if (this.editingOriginalityData['pub_creative_description1']['is_edit']) {
      if (!this.editingOriginalityData['pub_creative_description1']['value']) {
        this.iswraing = true;
        this.originalityCheck['discription1Prompt'] = "描述1不能为空";
        this.tips.pub_creative_description1 = true;
        return false;
      } else {
        const discription1Length = this._http.chkstrlen(this.editingOriginalityData['pub_creative_description1']['value']);
        if (discription1Length < this.discription1Range[this.publishId]['min'] || discription1Length > this.discription1Range[this.publishId]['max']) {
          this.originalityCheck['discription1Prompt'] = "描述1长度不能小于" + this.discription1Range[this.publishId]['min'] + "个字符，并且不能大于" + this.discription1Range[this.publishId]['max'] + "个字符";
          this.iswraing = true;
          this.tips.pub_creative_description1 = true;
          return false;
        }

      }

    }

    //描述2（选填）
    if (this.editingOriginalityData['pub_creative_description2']['is_edit'] && this.editingOriginalityData['pub_creative_description2']['value']) {
      const discription2Length = this._http.chkstrlen(this.editingOriginalityData['pub_creative_description2']['value']);

      if (discription2Length < this.discription2Range[this.publishId]['min'] || discription2Length > this.discription2Range[this.publishId]['max']) {
        this.iswraing = true;
        this.originalityCheck['discription2Prompt'] = "描述2长度不能小于" + this.discription2Range[this.publishId]['min'] + "个字符，并且不能大于" + this.discription2Range[this.publishId]['max'] + "个字符";
        this.tips.pub_creative_description2 = true;
        return false;
      }
    }

    //访问Url（360、搜狗中是必填字段。百度中如果创意所在的计划是计算机优先，则访问URL是必填字段，最大1024）
    if (this.editingOriginalityData['pc_destination_url']['is_edit']) {
      if ((this.publishId === 2 || this.publishId === 3) ||
        (this.publishId === 1 && this.campaignInfo['bid_prefer'] === '1')) {
        if (!this.editingOriginalityData['pc_destination_url']['value']) {
          this.iswraing = true;
          this.tips.pc_destination_url = true;
          return false;
        } else if (this.editingOriginalityData['pc_destination_url']['value'] && this._http.chkstrlen( this.editingOriginalityData['pc_destination_url']['value']) > 1024) {
          this.iswraing = true;
          this.originalityCheck['pcDestinationUrlPrompt'] = "访问Url不能超过1024";
          this.tips.pc_destination_url = true;
          return false;
        }
      } else { //百度
        if (this.editingOriginalityData['pc_destination_url']['value'] && this._http.chkstrlen(this.editingOriginalityData['pc_destination_url']['value']) > 1024) {
          this.iswraing = true;
          this.originalityCheck['pcDestinationUrlPrompt'] = "访问Url不能超过1024";
          this.tips.pc_destination_url = true;
          return false;
        }
      }

    }

    //显示Url（360、搜狗中是必填字段。百度中如果创意所在的计划是计算机优先，则显示URL是必填字段。最大36个字符）
    if (this.editingOriginalityData['pc_display_url']['is_edit']) {
      if ((this.publishId === 2 || this.publishId === 3) ||
        (this.publishId === 1 && this.campaignInfo['bid_prefer'] === '1')) {
        if (!this.editingOriginalityData['pc_display_url']['value']) {
          this.iswraing = true;
          this.originalityCheck['pcDisplayUrlPrompt'] = "显示Url不能为空";
          this.tips.pc_display_url = true;
          return false;
        } else if (this.editingOriginalityData['pc_display_url']['value'] && this._http.chkstrlen(this.editingOriginalityData['pc_display_url']['value']) > 36) {
          this.iswraing = true;
          this.originalityCheck['pcDisplayUrlPrompt'] = "显示Url不能超过36个字符";
          this.tips.pc_display_url = true;
          return false;
        }
      } else {
        if (this.editingOriginalityData['pc_display_url']['value'] && this._http.chkstrlen(this.editingOriginalityData['pc_display_url']['value']) > 36) {
          this.iswraing = true;
          this.originalityCheck['pcDisplayUrlPrompt'] = "显示Url不能超过36个字符";
          this.tips.pc_display_url = true;
          return false;
        }
      }

    }

    //移动访问URL（神马中是必填字段。百度中如果创意所在计划是移动优先，则移动访问URL是必填字段 ,最大1024个字符）
    if (this.editingOriginalityData['wap_destination_url']['is_edit']) {
      if (this.publishId === 4 || (this.publishId === 1 && this.campaignInfo['bid_prefer'] === '2')) {
        if (!this.editingOriginalityData['wap_destination_url']['value']) {
          this.iswraing = true;
          this.originalityCheck['wapDestinationUrlPrompt'] = "移动访问URL不能为空";
          this.tips.wap_destination_url = true;
          return false;
        } else {
          if (this._http.chkstrlen(this.editingOriginalityData['wap_destination_url']['value']) > 1024) {
            this.iswraing = true;
            this.originalityCheck['wapDestinationUrlPrompt'] = "移动访问URL不能超过1024个字符";
            this.tips.wap_destination_url = true;
            return false;
          }
        }

      } else {
        if (this.editingOriginalityData['wap_destination_url']['value'] && this._http.chkstrlen(this.editingOriginalityData['wap_destination_url']['value']) > 1024) {
          this.iswraing = true;
          this.originalityCheck['wapDestinationUrlPrompt'] = "移动访问URL不能超过1024个字符";
          this.tips.wap_destination_url = true;
          return false;
        }
      }
    }
    //移动显示Url（神马中是必填字段。百度中如果创意所在计划是移动优先，则移动显示URL是必填字段）
    if (this.editingOriginalityData['wap_display_url']['is_edit']) {
      if (this.publishId === 4 || (this.publishId === 1 && this.campaignInfo['bid_prefer'] === '2')) {
        if (!this.editingOriginalityData['wap_display_url']['value']) {
          this.iswraing = true;
          this.originalityCheck['wapDisplayUrlPrompt'] = "移动显示Url不能为空";
          this.tips.wap_display_url = true;
          return false;
        } else if (this.editingOriginalityData['wap_display_url']['value'] && this._http.chkstrlen(this.editingOriginalityData['wap_display_url']['value']) > 36) {
          this.iswraing = true;
          this.originalityCheck['wapDisplayUrlPrompt'] = "移动显示Url不能超过36个字符";
          this.tips.wap_display_url = true;
          return false;
        }
      } else {
        if (this.editingOriginalityData['wap_display_url']['value'] && this._http.chkstrlen(this.editingOriginalityData['wap_display_url']['value']) > 36) {
          this.iswraing = true;
          this.originalityCheck['wapDisplayUrlPrompt'] = "移动显示Url不能超过36个字符";
          this.tips.wap_display_url = true;
          return false;
        }
      }

    }
    //标记
    if (this.editingOriginalityData['tabs']['is_edit']) {
      this.editingOriginalityData['tabs']['value'] = [this.tabItem];
    }
  }

  changeInput(name) {
    this.tips[name] = false;
  }

  contentChange(value) {
    this.tips.length[value] = this._http.chkstrlen(this.editingOriginalityData[value].value);
  }


  posCursor(data) {
    const currentElement = this.getCurrentElement(data);

    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核

    } else {
      this.cursorPosition = currentElement.selectionStart;
      //判断{}中内容是否为空
      this.checkIsEmpty(data, currentElement.value);
    }
    /*   const isIE = !(!document.all);
      console.log(isIE);
      let start = 2, end = 2;
      const oTextarea: any = document.getElementById("textarea");
      console.log(oTextarea.value);*/
    /* if (isIE) {
       console.log(1);
       //selection 当前激活选中区，即高亮文本块，和/或文当中用户可执行某些操作的其它元素。
       //createRange 从当前文本选中区中创建 TextRange 对象，
       //或从控件选中区中创建 controlRange 集合。
       const sTextRange: any = document.selection.createRange();

       //判断选中的是不是textarea对象
       if (sTextRange.parentElement() === oTextarea) {
         //创建一个TextRange对象
         const oTextRange = document.body.createTextRange();
         //移动文本范围以便范围的开始和结束位置能够完全包含给定元素的文本。
         oTextRange.moveToElementText(oTextarea);

         //此时得到两个 TextRange
         //oTextRange文本域(textarea)中文本的TextRange对象
         //sTextRange是选中区域文本的TextRange对象

         //compareEndPoints方法介绍，compareEndPoints方法用于比较两个TextRange对象的位置
         //StartToEnd  比较TextRange开头与参数TextRange的末尾。
         //StartToStart比较TextRange开头与参数TextRange的开头。
         //EndToStart  比较TextRange末尾与参数TextRange的开头。
         //EndToEnd    比较TextRange末尾与参数TextRange的末尾。

         //moveStart方法介绍，更改范围的开始位置
         //character 按字符移动
         //word       按单词移动
         //sentence  按句子移动
         //textedit  启动编辑动作

         //这里我们比较oTextRange和sTextRange的开头，的到选中区域的开头位置
         for (start = 0; oTextRange.compareEndPoints("StartToStart", sTextRange) < 0; start++) {
           oTextRange.moveStart('character', 1);
         }
         //需要计算一下\n的数目(按字符移动的方式不计\n,所以这里加上)
         for (let i = 0; i <= start; i ++) {
           if (oTextarea.value.charAt(i) === '\n') {
             start++;
           }
         }

         //再计算一次结束的位置
         oTextRange.moveToElementText(oTextarea);
         for (end = 0; oTextRange.compareEndPoints('StartToEnd', sTextRange) < 0; end ++){
           oTextRange.moveStart('character', 1);
         }
         for (let i = 0; i <= end; i ++) {
           if (oTextarea.value.charAt(i) === '\n') {
             end++;
           }
         }
       }
     } else {
       console.log(oTextarea.selectionStart);
       console.log(oTextarea.selectionEnd);
       this.cursorPosition = oTextarea.selectionStart;
       console.log(this.cursorPosition );
     }*/
  }

  getCurrentElement(value) {
    if (value === 'pub_creative_title') {
      return this.creativeTitle.nativeElement;
    }
    if (value === 'pub_creative_description1') {
      return this.description1.nativeElement;
    }
    if (value === 'pub_creative_description2') {
      return this.description2.nativeElement;
    }
  }

  add(data) {
    /*  if (u.indexOf('Presto') > -1) { //opera内核
        console.log('opera内核');
      }
      if (u.indexOf('AppleWebKit') > -1) { //苹果、谷歌内核
        console.log('苹果、谷歌内核');
      }
      if (u.indexOf('Gecko') > -1 && u.indexOf('KHTML') === -1) { //火狐内核
        console.log('火狐内核');
      }*/

    if (!this.editingOriginalityData[data].is_edit) {
      return false;
    }

    const currentElement = this.getCurrentElement(data);


    //将关键词{} 插入到光标位置

    const stringObj = this.getStringByPosition(this.cursorPosition, this.editingOriginalityData[data].value);
    this.editingOriginalityData[data].value = stringObj.startStr + '{}' + stringObj.endStr;
    currentElement.value = this.editingOriginalityData[data].value;

    this.tips.length[data] = this._http.chkstrlen( currentElement.value);
    //判断{}中内容是否为空
    this.checkIsEmpty(data, currentElement.value);

    this.cursorPosition = this.cursorPosition + 1;

    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核

    } else {
      currentElement.select();
      currentElement.selectionStart = this.cursorPosition;
      currentElement.selectionEnd = this.cursorPosition;

      // const str1 = this.addOriginalityData[data].match(/\{[^\}]+\}/)[0];
      // const regex3 = /\{(.+?)\}/g; // {} 花括号，大括号
      // const str1 = this.addOriginalityData[data].str.match(regex3);


      /*const str = "123{xxxx}456[我的]789123[你的]456(1389090)789";
      const regex1 = /\((.+?)\)/g;  // () 小括号
      const regex2 = /\[(.+?)\]/g;  // [] 中括号
      const regex3 = /\{(.+?)\}/g; // {} 花括号，大括号
      // 输出是一个数组

      const resultArray = this.addOriginalityData[data].match(regex3);
      console.log(this.addOriginalityData[data]);
      console.log(resultArray);
      /!*resultArray.forEach( arr => {
        if (arr.length > 1) {

        }
      });*!/
      const ssss = '2017-01-06-';
      ssss.replace(/-\d+/g, function () {
        console.log(arguments);
      });
      console.log(ssss);

      console.log(resultArray);*/
    }
  }
  addArea(data) {
    if (!this.editingOriginalityData[data].is_edit) {
      return false;
    }
    const currentElement = this.getCurrentElement(data);
    //将投放地域{} 插入到光标位置
    this.editingOriginalityData[data].value = '{投放地域}' +  this.editingOriginalityData[data].value;
    currentElement.value = this.editingOriginalityData[data].value;
    this.cursorPosition = 5;

    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核

    } else {
      currentElement.select();
      currentElement.selectionStart = this.cursorPosition;
      currentElement.selectionEnd = this.cursorPosition;
    }
  }

  //判断输入的内容有没有是空的
  checkIsEmpty(data, string) {
    this.tips.check[data] = this.stack.getStatus(string);
  }
  //根据指定下标，将字符串分割成两个字符串
  getStringByPosition(position, str) {
    let startStr = '';
    let endStr = '';
    if (str && position <= str.length) { //光标位置不能超过字符串长度
      startStr = str.substring(0, position);
      endStr = str.substring(position, str.length);
    }

    return {
      startStr: startStr,
      endStr: endStr
    };
  }

  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {
        if(this.cronSetting != 'now') {
          this.editingOriginalityData['cron_setting'] = format(this.cronSettingTime, 'yyyy-MM-dd HH:mm:ss');
        } else {
          this.editingOriginalityData['cron_setting'] = 'now';
        }

        this.editingOriginalityData['select_type'] = this.parentData.selected_type;
        this.editingOriginalityData.pub_creative_ids = this.stringIdArray;

        this.editCreative(this.editingOriginalityData , 'single');
      }
    }

  }

  editCreative(data, edit_type) {
    this.is_saving.emit({
      'is_saving': true,
      'isHidden': 'true'
    });
    this._http.editCreative(data, edit_type).subscribe(
      (result: any) => {
        this.is_saving.emit({
          'is_saving': false,
          'isHidden': 'true'
        });
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();

        if (result.status_code === 200 ) {

          if (result['data']['job_type'] != 'cron') {
            this.message.success("已成功加入任务队列，请稍后查看");
            notifyData.push({
              job_id: result['data']['job_id'],
              cid: userOperdInfo.select_cid,
              uid: userOperdInfo.select_uid,
              op_type: 'creative'
            });
            this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'false'
            });
          } else {
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'false'
            });
            this.message.success("已成功加入定时任务");
          }

        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      }, err => {
        this.is_saving.emit({
          'is_saving': false,
          'isHidden': 'true'
        });
      }, () => {
      }
    );
  }
  disabledDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0;
  }
}
