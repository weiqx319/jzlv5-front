import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { NzMessageService } from 'ng-zorro-antd/message';
import { ItemSelectService } from "../../../../module/item-select/service/item-select.service";
import { DataViewAddEditService } from "../../service/data-view-add-edit.service";
import { AuthService } from "../../../../core/service/auth.service";
import { NotifyService } from "../../../../module/notify/notify.service";
import { DataStackService } from '../../../../shared/service/data-stack.service';
import { MenuService } from "../../../../core/service/menu.service";

@Component({
  selector: 'app-add-creative',
  templateUrl: './add-creative.component.html',
  styleUrls: ['./add-creative.component.scss']
})


export class AddCreativeComponent implements OnInit, OnChanges {

  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('creativeTitle', { static: true }) creativeTitle: ElementRef<any>;
  @ViewChild('description1', { static: true }) description1: ElementRef<any>;
  @ViewChild('description2') description2: ElementRef<any>;
  constructor(private _http: DataViewAddEditService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private itemSelectService: ItemSelectService,
    private stack: DataStackService,
    private message: NzMessageService,
    private menuService: MenuService,
    private router: Router) {
    this.itemSelectService.getAccountLists({}, { select_name: '', is_accurate: false }).subscribe(
      (result) => {
        this.publisherData = result;
      },
      (error) => {

      }
    );
  }

  public originalityCheck = {
    'titlePrompt': '',
    'discription1Prompt': '',
    'discription2Prompt': '',
    'pcDestinationUrlPrompt': '',
    'pcDisplayUrlPrompt': '',
    'wapDestinationUrlPrompt': '',
    'wapDisplayUrlPrompt': ''
  };
  public discription1Range = { //描述1字数限制数
    1: { 'min': 9, 'max': 80 },
    2: { 'min': 8, 'max': 80 },
    3: { 'min': 1, 'max': 80 },
    4: { 'min': 16, 'max': 136 }
  };
  public discription2Range = { //描述2字数限制数
    1: { 'min': 9, 'max': 80 },
    2: { 'min': 8, 'max': 80 },
    3: { 'min': 1, 'max': 80 }
  };
  public creativeTitleRange = { //标题字数限制数
    1: { 'min': 9, 'max': 50 },
    2: { 'min': 8, 'max': 50 },
    3: { 'min': 1, 'max': 50 },
    4: { 'min': 16, 'max': 70 }
  };

  public campaignInfo = {};
  public price_ratio = 1;
  public wap_price: number;
  public pc_price: number;
  public publisherData = [];
  public accountData = []; //账户数组
  public campaign = []; //计划数组
  public adgroupData = []; //单元数组
  public iswraing = false; //校验 false：不校验， true：提示校验
  public device_preference_status = false;

  public cursorPosition = 0;



  public addOriginalityData = {
    chan_pub_id: null,
    pub_account_id: null,  //账户
    publisher_id: null, //媒体
    pub_campaign_id: null, //计划 //必填
    pub_adgroup_id: null, // 单元  //必填

    "device_preference": 0,
    "pub_creative_title": "",
    "pub_creative_description1": "",
    "pub_creative_description2": "",
    "pc_destination_url": "",
    "wap_destination_url": "",
    "tabs": [],
    "pc_display_url": "",
    "wap_display_url": "",
    "pause": false
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
  }
  changePublisher(itemData, is_batch): void {

    itemData.pub_account_id = null;
    itemData.pub_campaign_id = null;
    itemData.pub_adgroup_id = null;

    this.publisherData.forEach((item) => {

      if (item.publisher_id === itemData.publisher_id) {
        this.accountData = item.detail;
        itemData.pub_account_id = item.detail[0].pub_account_id;
        itemData.chan_pub_id = item.detail[0].chan_pub_id;
        const index = is_batch ? 1 : 0;
        this.getCampaignListByAccount({ 'chan_pub_id': item.detail[index].chan_pub_id, 'pub_account_id': item.detail[index].pub_account_id }, is_batch);
      }
    });
  }

  changeAccount(itemData, is_batch?): void {
    itemData.pub_campaign_id = null;
    itemData.pub_adgroup_id = null;
    this.accountData.forEach((accountItem) => {
      if (accountItem.pub_account_id === itemData.pub_account_id) {
        itemData.chan_pub_id = accountItem.chan_pub_id;
        itemData.pub_account_id = accountItem.pub_account_id;
        this.getCampaignListByAccount({ 'chan_pub_id': accountItem.chan_pub_id, 'pub_account_id': accountItem.pub_account_id }, is_batch);
      }
    });
  }

  changeCampaign(itemData, is_batch?): void {
    itemData.pub_adgroup_id = null;
    this.itemSelectService.getAdgroupListByCampaign({
      'chan_pub_id': itemData.chan_pub_id,
      'pub_account_id': itemData.pub_account_id,
      'pub_campaign_id': itemData.pub_campaign_id
    }).subscribe(
      (result) => {
        this.adgroupData = result;
        //得到计划的 设备类型 bid_prefer
        if (itemData.publisher_id * 1 === 1) {
          this.showCampaign({
            'chan_pub_id': itemData.chan_pub_id,
            'pub_account_id': itemData.pub_account_id,
            'pub_campaign_id': itemData.pub_campaign_id
          });

        }
      }
    );
  }

  showCampaign(body) {
    this._http.showCampaign(body).subscribe(
      (result) => {
        this.campaignInfo = result.data;

        if (this.campaignInfo['bid_prefer'] * 1 === 1) { //pc优先
          this.price_ratio = 1;
          this.pc_price = this.campaignInfo['wap_price_ratio'];
          this.addOriginalityData['device_preference'] = 0;
        } else if (this.campaignInfo['bid_prefer'] * 1 === 2) { //计算机优先
          this.price_ratio = 1;
          this.wap_price = this.campaignInfo['pc_price_ratio'];
          this.addOriginalityData['device_preference'] = 1;
        }
      }
    );
  }

  getCampaignListByAccount(body, is_batch?) {
    this.itemSelectService.getCampaignListByAccount(body).subscribe(
      (result) => {
        this.campaign = result;
      },
      (error) => {

      }
    );
  }

  changeDevicePrefer() {
    this.device_preference_status ? this.addOriginalityData['device_preference'] = 1 : this.addOriginalityData['device_preference'] = 0;
  }

  addKeywordWildcards(data) {

    // this.addOriginalityData[data] = this.addOriginalityData[data] + '{}';
    // const pos = this.addOriginalityData[data].length - 1;
    // // this.creativeTitle.nativeElement.focus();
    //
  }

  checkPage() {
    this.originalityCheck['titlePrompt'] = '';
    this.originalityCheck['discription1Prompt'] = '';
    this.originalityCheck['pcDestinationUrlPrompt'] = '';
    this.originalityCheck['pcDisplayUrlPrompt'] = '';
    this.originalityCheck['wapDestinationUrlPrompt'] = '';
    this.originalityCheck['wapDisplayUrlPrompt'] = '';
    const publisherId = this.addOriginalityData['publisher_id'] * 1;

    this.tips.pub_creative_title = false;
    this.tips.pub_creative_description1 = false;
    this.tips.pub_creative_description2 = false;
    this.tips.pc_destination_url = false;
    this.tips.pc_display_url = false;
    this.tips.wap_destination_url = false;
    this.tips.wap_display_url = false;

    if (!this.addOriginalityData['publisher_id'] || !this.addOriginalityData['pub_account_id'] ||
      !this.addOriginalityData['pub_campaign_id'] || !this.addOriginalityData['pub_adgroup_id']) {
      this.iswraing = true;
      return false;
    }

    //标题
    if (!this.addOriginalityData.pub_creative_title) {
      this.iswraing = true;
      this.tips.pub_creative_title = true;
      this.originalityCheck['titlePrompt'] = "创意标题不能为空";
      return false;
    } else {
      const titleLength = this._http.chkstrlen(this.addOriginalityData.pub_creative_title);
      if (titleLength < this.creativeTitleRange[publisherId]['min'] || titleLength > this.creativeTitleRange[publisherId]['max']) {
        this.originalityCheck['titlePrompt'] = "创意标题长度不能小于" + this.creativeTitleRange[publisherId]['min'] + "个字符，并且不能大于" + this.creativeTitleRange[publisherId]['max'] + "个字符";
        this.iswraing = true;
        this.tips.pub_creative_title = true;
        return false;
      }
    }

    //描述1
    if (!this.addOriginalityData['pub_creative_description1']) {
      this.iswraing = true;
      this.tips.pub_creative_description1 = true;
      this.originalityCheck['discription1Prompt'] = "描述1不能为空";
      return false;
    } else {
      const discription1Length = this._http.chkstrlen(this.addOriginalityData['pub_creative_description1']);
      if (discription1Length < this.discription1Range[publisherId]['min'] || discription1Length > this.discription1Range[publisherId]['max']) {
        this.originalityCheck['discription1Prompt'] = "描述1长度不能小于" + this.discription1Range[this.addOriginalityData['publisher_id'] * 1]['min'] + "个字符，并且不能大于" + this.discription1Range[this.addOriginalityData['publisher_id'] * 1]['max'] + "个字符";
        this.iswraing = true;
        this.tips.pub_creative_description1 = true;
        return false;
      }
    }
    //描述2
    if (this.addOriginalityData['pub_creative_description2']) {
      const discription2Length = this._http.chkstrlen(this.addOriginalityData['pub_creative_description2']);
      if (discription2Length < this.discription2Range[publisherId]['min'] || discription2Length > this.discription2Range[publisherId]['max']) {
        this.originalityCheck['discription2Prompt'] = "描述2长度不能小于" + this.discription2Range[this.addOriginalityData['publisher_id'] * 1]['min'] + "个字符，并且不能大于" + this.discription2Range[this.addOriginalityData['publisher_id'] * 1]['max'] + "个字符";
        this.iswraing = true;
        this.tips.pub_creative_description2 = true;
        return false;
      }
    }

    //神马（无访问url。无显示url）
    if (publisherId === 4) {
      this.addOriginalityData['pc_destination_url'] = '';
      this.addOriginalityData['pc_display_url'] = '';
    }

    //访问Url（360、搜狗中是必填字段。百度中如果创意所在的计划是计算机优先，则访问URL是必填字段，最大1024，神马无此字段）
    if ((publisherId === 2 || publisherId === 3) ||
      (publisherId === 1 && this.campaignInfo['bid_prefer'] * 1 === 1)) {
      if (!this.addOriginalityData['pc_destination_url']) {
        this.iswraing = true;
        this.tips.pc_destination_url = true;
        this.originalityCheck['pcDestinationUrlPrompt'] = "访问Url不能为空";
        return false;
      } else if (this.addOriginalityData['pc_destination_url'] && this._http.chkstrlen(this.addOriginalityData['pc_destination_url']) > 1024) {
        this.originalityCheck['pcDestinationUrlPrompt'] = "访问Url不能超过1024个字符";
        this.iswraing = true;
        this.tips.pc_destination_url = true;
        return false;
      }
    } else {
      if (this.addOriginalityData['pc_destination_url'] && this._http.chkstrlen(this.addOriginalityData['pc_destination_url']) > 1024) {
        this.originalityCheck['pcDestinationUrlPrompt'] = "访问Url不能超过1024个字符";
        this.iswraing = true;
        this.tips.pc_destination_url = true;
        return false;
      }
    }

    //显示Url（360、搜狗中是必填字段。百度中如果创意所在的计划是计算机优先，则显示URL是必填字段。且不超过36，神马无此字段）
    if ((publisherId === 2 || publisherId === 3) ||
      (publisherId === 1 && this.campaignInfo['bid_prefer'] * 1 === 1)) {
      if (!this.addOriginalityData['pc_display_url']) {
        this.iswraing = true;
        this.originalityCheck['pcDisplayUrlPrompt'] = "显示Url不能为空";
        this.tips.pc_display_url = true;
        return false;
      } else if (this.addOriginalityData['pc_display_url'] && this._http.chkstrlen(this.addOriginalityData['pc_display_url']) > 36) {
        this.originalityCheck['pcDisplayUrlPrompt'] = "显示Url不能超过36个字符";
        this.iswraing = true;
        this.tips.pc_display_url = true;
        return false;
      }
    } else {
      if (this.addOriginalityData['pc_display_url'] && this._http.chkstrlen(this.addOriginalityData['pc_display_url']) > 36) {
        this.originalityCheck['pcDisplayUrlPrompt'] = "显示Url不能超过36个字符";
        this.iswraing = true;
        this.tips.pc_display_url = true;
        return false;
      }
    }

    //移动访问URL（神马中是必填字段。百度中如果创意所在计划是移动优先，则移动访问URL是必填字段, 最大1024）
    if (publisherId === 4 || (publisherId === 1 && this.campaignInfo['bid_prefer'] * 1 === 2)) {
      if (!this.addOriginalityData['wap_destination_url']) {
        this.iswraing = true;
        this.originalityCheck['wapDestinationUrlPrompt'] = "移动访问URL不能为空";
        this.tips.wap_destination_url = true;
        return false;
      } else if (this.addOriginalityData['wap_destination_url'] && this._http.chkstrlen(this.addOriginalityData['wap_destination_url']) > 1024) {
        this.iswraing = true;
        this.originalityCheck['wapDestinationUrlPrompt'] = "移动访问URL不能超过1024个字符";
        this.tips.wap_destination_url = true;
        return false;
      }
    } else {
      if (this.addOriginalityData['wap_destination_url'] && this._http.chkstrlen(this.addOriginalityData['wap_destination_url']) > 1024) {
        this.iswraing = true;
        this.originalityCheck['wapDestinationUrlPrompt'] = "移动访问URL不能超过1024个字符";
        this.tips.wap_destination_url = true;
        return false;
      }
    }



    //移动显示Url（神马中是必填字段。百度中如果创意所在计划是移动优先，则移动显示URL是必填字段 ,最大36）
    if (publisherId === 4 || (publisherId === 1 && this.campaignInfo['bid_prefer'] * 1 === 2)) {
      if (!this.addOriginalityData['wap_display_url']) {
        this.iswraing = true;
        this.originalityCheck['wapDisplayUrlPrompt'] = "移动显示Url不能为空";
        this.tips.wap_display_url = true;
        return false;
      } else if (this._http.chkstrlen(this.addOriginalityData['wap_display_url']) > 36) {
        this.iswraing = true;
        this.originalityCheck['wapDisplayUrlPrompt'] = "移动显示Url不能超过36个字符";
        this.tips.wap_display_url = true;
        return false;
      }
    } else {
      if (this.addOriginalityData['wap_display_url'] && this._http.chkstrlen(this.addOriginalityData['wap_display_url']) > 36) {
        this.iswraing = true;
        this.originalityCheck['wapDisplayUrlPrompt'] = "移动显示Url不能超过36个字符";
        this.tips.wap_display_url = true;
        return false;
      }
    }
  }

  changeInput(name) {
    this.tips[name] = false;
  }

  contentChange(value) {
    this.tips.length[value] = this._http.chkstrlen(this.addOriginalityData[value]);
  }


  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {
        this.is_saving.emit(true);


        this._http.addCreative(this.addOriginalityData).subscribe(
          (result: any) => {
            const notifyData: any[] = [];
            const userOperdInfo = this.authService.getCurrentUserOperdInfo();

            this.is_saving.emit(false);
            if (result.status_code === 200) {
              this.message.success("已成功加入任务队列，请稍后查看");
              notifyData.push({ job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'creative_add' });
              this.notifyService.notifyData.next({ type: 'batch_update_job', data: notifyData });

              this.router.navigateByUrl('/data_view/sem/' + this.summaryType);
            } else if (result['status_code'] && result.status_code === 401) {
              this.message.error('您没权限对此操作！');
            } else if (result['status_code'] && result.status_code === 500) {
              this.message.error('系统异常，请重试');
            } else if (result['status_code'] && result.status_code === 205) {
            } else {
              this.message.error(result.message);
            }
          }, err => {
            this.is_saving.emit(false);
          }, () => {
          }
        );
      }


    }

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


    const currentElement = this.getCurrentElement(data);


    //将关键词{} 插入到光标位置

    const stringObj = this.getStringByPosition(this.cursorPosition, this.addOriginalityData[data]);
    this.addOriginalityData[data] = stringObj.startStr + '{}' + stringObj.endStr;
    currentElement.value = this.addOriginalityData[data];

    this.tips.length[data] = this._http.chkstrlen(currentElement.value);
    //判断{}中内容是否为空
    this.checkIsEmpty(data, currentElement.value);

    this.cursorPosition = this.cursorPosition + 1;

    if (navigator.userAgent.indexOf('Trident') > -1) { //IE内核

    } else {
      currentElement.select();
      currentElement.selectionStart = this.cursorPosition;
      currentElement.selectionEnd = this.cursorPosition;

    }
  }
  addArea(data) {

    const currentElement = this.getCurrentElement(data);
    //将投放地域{} 插入到光标位置
    this.addOriginalityData[data] = '{投放地域}' + this.addOriginalityData[data];
    currentElement.value = this.addOriginalityData[data];
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
}



