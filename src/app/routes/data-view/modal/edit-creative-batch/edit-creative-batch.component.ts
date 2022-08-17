import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {DataViewAddEditService} from "../../service/data-view-add-edit.service";
import {AuthService} from "../../../../core/service/auth.service";
import {NotifyService} from "../../../../module/notify/notify.service";
import {format, differenceInCalendarDays } from "date-fns";

@Component({
  selector: 'app-edit-creative-batch',
  templateUrl: './edit-creative-batch.component.html',
  styleUrls: ['./edit-creative-batch.component.scss']
})
export class EditCreativeBatchComponent implements OnInit, OnChanges {


  @Input() stringIdArray: any;
  @Input() publisher_model: any;
  @Input() parentData: any;
  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _http: DataViewAddEditService,
              private message: NzMessageService,
              private  authService: AuthService,
              private notifyService: NotifyService,
              private modalService: NzModalService) {
    this.publisherOption = this._http.getPublisherOption();
  }

  public has_shanma = false;
  public publisherOption = {};
  public discription1Range = { //描述1字数限制数
    1: {'min': 9, 'max': 80},
    2: {'min': 8, 'max': 80},
    3: {'min': 1, 'max': 80},
    4: {'min': 16, 'max': 136},
    morePublisher: {'min': 16, 'max': 80}
  };
  public discription2Range = { //描述2字数限制数
    1: {'min': 9, 'max': 80},
    2: {'min': 8, 'max': 80},
    3: {'min': 1, 'max': 80},
    morePublisher: {'min': 9, 'max': 80}
  };
  public creativeTitleRange = { //标题字数限制数
    1: {'min': 9, 'max': 50},
    2: {'min': 8, 'max': 50},
    3: {'min': 1, 'max': 50},
    4: {'min': 16, 'max': 70},
    morePublisher: {'min': 16, 'max': 50}
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
  public creative_title = '';
  public creative_discription1 = '';
  public creative_discription2 = '';
  public add_before = '';
  public add_after = '';
  public replace_value = '';


  public iswraing = false;
  public batchMobileUrlModifyValue  = '';
  public batchPcUrlSearchValue = '';
  public batchMobileUrlSearch = '';
  public batchMobileUrlSearchValue = '';
  public batchPcUrlModifyValue  = '';

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
      "value": "",
      "value1": "",
      "value2": ""
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
    pc_destination_url_search: false,

    pc_display_url: false,

    wap_destination_url: false,
    wap_destination_url_search: false,

    wap_display_url: false,


    length: {
      pub_creative_title: 0,
      pub_creative_description1: 0,
      pub_creative_description2: 0,
      pc_destination_url: 0,
      batchPcUrlModifyValue: 0,
      batchPcUrlSearchValue: 0,
      batchMobileUrlModifyValue: 0,
      batchMobileUrlSearchValue: 0,

      pc_display_url: 0,
      wap_destination_url: 0,
      wap_display_url: 0,

    }
  };


  ngOnInit() {
    //判断是否有神马媒体
    this.publisher_model['publisher_array'].forEach(item => {
      if (item['value'] * 1 === 4) {
        this.has_shanma = true;
      }
    });
  }

  checkPage() {
    this.originalityCheck['titlePrompt'] = '';
    this.originalityCheck['discription1Prompt'] = '';
    this.originalityCheck['discription2Prompt'] = '';

    this.originalityCheck['pcDestinationUrlPrompt'] = '';
    this.originalityCheck['pcDisplayUrlPrompt'] = '';
    this.originalityCheck['wapDestinationUrlPrompt'] = '';
    this.originalityCheck['wapDisplayUrlPrompt'] = '';

    this.tips.pub_creative_title = false;
    this.tips.pub_creative_description1 = false;
    this.tips.pub_creative_description2 = false;
    this.tips.pc_destination_url = false;
    this.tips.pc_destination_url_search = false;
    this.tips.pc_display_url = false;
    this.tips.wap_destination_url = false;
    this.tips.wap_destination_url_search = false;
    this.tips.wap_display_url = false;

    if (this.editingOriginalityData.pc_destination_url['modify_type'] === 1) {
      this.editingOriginalityData.pc_destination_url['value'] = this.batchPcUrlModifyValue;
    } else if (this.editingOriginalityData.pc_destination_url['modify_type'] === 2) {
      this.editingOriginalityData.pc_destination_url['value'] = this.batchPcUrlSearchValue;
    }

    if (this.editingOriginalityData['wap_destination_url']['modify_type'] === 1) {
      this.editingOriginalityData['wap_destination_url']['value'] = this.batchMobileUrlModifyValue;
    } else if (this.editingOriginalityData['wap_destination_url']['modify_type'] === 2) {
      this.editingOriginalityData['wap_destination_url']['value'] = this.batchMobileUrlSearchValue;
    }

    if (this.editingOriginalityData.batch_update_item['is_edit']) {
      //修改为
      if (this.editingOriginalityData.batch_update_item['modify_type'] === 4) {
       const titleLength = this._http.chkstrlen(this.creative_title);
       const discription1Length = this._http.chkstrlen(this.creative_discription1);
       const discription2Length = this._http.chkstrlen(this.creative_discription2);
        //同媒体(全部替换)
       if (this.publisher_model['publisherCount'] === 1 && this.editingOriginalityData.batch_update_item['modify_type'] === 4) {
          const publishId = this.publisher_model['publisher_array'][0]['value'] * 1;
          //标题
          if (this.editingOriginalityData.batch_update_item['batch_item_type'] * 1 === 1 || this.editingOriginalityData.batch_update_item['batch_item_type'] * 1 === 4) {
            if (titleLength < this.creativeTitleRange[publishId]['min'] || titleLength > this.creativeTitleRange[publishId]['max'] ) {
              this.originalityCheck['titlePrompt'] = "创意标题长度不能小于" + this.creativeTitleRange[publishId]['min'] + "个字符，并且不能大于" + this.creativeTitleRange[publishId]['max'] + "个字符";
              this.iswraing = true;
              this.tips.pub_creative_title = true;
              return false;
            }
          }
          //描述1
          if (this.editingOriginalityData.batch_update_item['batch_item_type'] * 1 === 2 || this.editingOriginalityData.batch_update_item['batch_item_type'] * 1 === 4) {
            if (discription1Length < this.discription1Range[publishId]['min'] || discription1Length > this.discription1Range[publishId]['max'] ) {
              this.originalityCheck['discription1Prompt'] = "描述1长度不能小于" + this.discription1Range[publishId]['min'] + "个字符，并且不能大于" + this.discription1Range[publishId]['max'] + "个字符";
              this.iswraing = true;
              this.tips.pub_creative_description1 = true;
              return false;
            }
          }
          //描述2(神马无此字段)
          if ((this.editingOriginalityData.batch_update_item['batch_item_type'] * 1 === 3 || this.editingOriginalityData.batch_update_item['batch_item_type'] * 1 === 4) && !this.has_shanma) {
            if (discription2Length < this.discription2Range[publishId]['min'] || discription2Length > this.discription2Range[publishId]['max'] ) {
              this.originalityCheck['discription2Prompt'] = "描述2长度不能小于" + this.discription2Range[publishId]['min'] + "个字符，并且不能大于" + this.discription2Range[publishId]['max'] + "个字符";
              this.iswraing = true;
              this.tips.pub_creative_description2 = true;
              return false;
            }
          }
        }
        //跨媒体（全部替换）
       if (this.publisher_model['publisherCount'] > 1 && this.editingOriginalityData.batch_update_item['modify_type'] === 4) {

          //标题
          if (this.editingOriginalityData.batch_update_item['batch_item_type'] * 1 === 1) {
            if (titleLength < this.creativeTitleRange['morePublisher']['min'] || titleLength > this.creativeTitleRange['morePublisher']['max'] ) {
              this.originalityCheck['titlePrompt'] = "创意标题长度不能小于" + this.creativeTitleRange['morePublisher']['min'] + "个字符，并且不能大于" + this.creativeTitleRange['morePublisher']['max'] + "个字符";
              this.iswraing = true;
              this.tips.pub_creative_title = true;
              return false;
            }
          }
          //描述1
          if (this.editingOriginalityData.batch_update_item['batch_item_type'] * 1 === 2) {
            if (discription1Length < this.discription1Range['morePublisher']['min'] || discription1Length > this.discription1Range['morePublisher']['max'] ) {
              this.originalityCheck['discription1Prompt'] = "描述1长度不能小于" + this.discription1Range['morePublisher']['min'] + "个字符，并且不能大于" + this.discription1Range['morePublisher']['max'] + "个字符";
              this.iswraing = true;
              this.tips.pub_creative_description1 = true;
              return false;
            }
          }
          //描述2
          if (this.editingOriginalityData.batch_update_item['batch_item_type'] * 1 === 3) {
            if (discription2Length < this.discription2Range['morePublisher']['min'] || discription2Length > this.discription2Range['morePublisher']['max'] ) {
              this.originalityCheck['discription2Prompt'] = "描述2长度不能小于" + this.discription2Range['morePublisher']['min'] + "个字符，并且不能大于" + this.discription2Range['morePublisher']['max'] + "个字符";
              this.iswraing = true;
              this.tips.pub_creative_description2 = true;
              return false;
            }
          }
        }
      }

    }

    //访问Url（360、搜狗中是必填字段。百度中如果创意所在的计划是计算机优先，则访问URL是必填字段，最大1024）
    if (this.editingOriginalityData.pc_destination_url['is_edit']) {
      //将Url修改为
      if (this.editingOriginalityData.pc_destination_url['modify_type'] === 1) {
        if (!this.batchPcUrlModifyValue) {
          this.originalityCheck['pcDestinationUrlPrompt'] = "访问Url不能为空";
          this.tips.pc_destination_url = true;
          this.iswraing = true;
          return false;
        }
        if (this.batchPcUrlModifyValue && this._http.chkstrlen(this.batchPcUrlModifyValue) > 1024) {
          this.iswraing = true;
          this.originalityCheck['pcDestinationUrlPrompt'] = "访问Url不能超过102个字符4";
          this.tips.pc_destination_url = true;
          return false;
        }

      }
      if (this.editingOriginalityData.pc_destination_url['modify_type'] === 2) {
        if (!this.editingOriginalityData.pc_destination_url['search']) {
          this.iswraing = true;
          this.tips.pc_destination_url_search = true;
          return false;
        }
        if (!this.batchPcUrlSearchValue) {
          this.iswraing = true;
          this.tips.pc_destination_url_search = true;
          return false;
        }
      }
    }

    //显示Url（360、搜狗中是必填字段。百度中如果创意所在的计划是计算机优先，则显示URL是必填字段。最大36个字符）
    if (this.editingOriginalityData['pc_display_url']['is_edit']) {
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
    }

    //移动访问URL（神马中是必填字段。百度中如果创意所在计划是移动优先，则移动访问URL是必填字段 ,最大1024个字符）
    if (this.editingOriginalityData['wap_destination_url']['is_edit']) {
      if (this.editingOriginalityData['wap_destination_url']['modify_type'] === 1) {
        if (!this.batchMobileUrlModifyValue) {
          this.iswraing = true;
          this.originalityCheck['wapDestinationUrlPrompt'] = "移动访问URL不能为空";
          this.tips.wap_destination_url = true;
          return false;
        }
        if (this.batchMobileUrlModifyValue && this._http.chkstrlen(this.batchMobileUrlModifyValue) > 1024) {
          this.iswraing = true;
          this.originalityCheck['wapDestinationUrlPrompt'] = "移动访问URL不能超过1024个字符";
          this.tips.wap_destination_url = true;
          return false;
        }
      }
      if (this.editingOriginalityData['wap_destination_url']['modify_type'] === 2) {
        if (!this.batchMobileUrlSearchValue) {
          this.iswraing = true;
          this.originalityCheck['wapDestinationUrlPrompt'] = "移动访问URL不能为空";
          this.tips.wap_destination_url_search = true;
          return false;
        }
        if (this.batchMobileUrlSearchValue &&  this._http.chkstrlen(this.batchMobileUrlSearchValue) > 1024) {
          this.iswraing = true;
          this.originalityCheck['wapDestinationUrlPrompt'] = "移动访问URL不能超过1024个字符";
          this.tips.wap_destination_url_search = true;
          return false;
        }
      }
    }

    //移动显示Url（神马中是必填字段。百度中如果创意所在计划是移动优先，则移动显示URL是必填字段）
    if (this.editingOriginalityData['wap_display_url']['is_edit']) {
      if (!this.editingOriginalityData['wap_display_url']['value']) {
        this.iswraing = true;
        this.originalityCheck['wapDisplayUrlPrompt'] = "移动显示Url不能为空";
        this.tips.wap_display_url = true;
        return false;
      }
      if (this.editingOriginalityData['wap_display_url']['value'] && this._http.chkstrlen(this.editingOriginalityData['wap_display_url']['value'] ) > 36) {
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
  modifyChange(name) {
    if (name === 'creative_title') {
      this.tips.length.pub_creative_title = this._http.chkstrlen(this.creative_title);
    }
    if (name === 'creative_discription1') {
      this.tips.length.pub_creative_description1 = this._http.chkstrlen(this.creative_discription1);
    }
    if (name === 'creative_discription2') {
      this.tips.length.pub_creative_description2 = this._http.chkstrlen(this.creative_discription2);
    }

  }

  contentChange(value, hasSearch?) {
    if (hasSearch) {
      if (value === 'batchPcUrlModifyValue') {
        this.tips.length['batchPcUrlModifyValue'] = this._http.chkstrlen(this.batchPcUrlModifyValue);
      }
      if (value === 'batchPcUrlSearchValue') {
        this.tips.length['batchPcUrlSearchValue'] = this._http.chkstrlen(this.batchPcUrlSearchValue);
      }
      if (value === 'batchMobileUrlModifyValue') {
        this.tips.length['batchMobileUrlModifyValue'] = this._http.chkstrlen(this.batchMobileUrlModifyValue);
      }
      if (value === 'batchMobileUrlSearchValue') {
        this.tips.length['batchMobileUrlSearchValue'] = this._http.chkstrlen(this.batchMobileUrlSearchValue);
      }


    } else {
      this.tips.length[value] = this._http.chkstrlen(this.editingOriginalityData[value].value);
    }
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
        //给后台参数赋值
        if (this.editingOriginalityData.batch_update_item['is_edit']) {
          if (this.editingOriginalityData.batch_update_item['modify_type'] === 1) { //查找替换
            this.editingOriginalityData.batch_update_item.value = this.replace_value;
          }
          if (this.editingOriginalityData.batch_update_item['modify_type'] === 2) { //文字前增加
            this.editingOriginalityData.batch_update_item.value = this.add_before;
          }
          if (this.editingOriginalityData.batch_update_item['modify_type'] === 3) { //文字后增加
            this.editingOriginalityData.batch_update_item.value = this.add_after;
          }
          if (this.editingOriginalityData.batch_update_item['modify_type'] === 4 && this.editingOriginalityData.batch_update_item['batch_item_type'] !== 4) { //全部替换
            this.editingOriginalityData.batch_update_item.value = this.creative_title;
          }
          if (this.editingOriginalityData.batch_update_item['modify_type'] === 4 && this.editingOriginalityData.batch_update_item['batch_item_type'] === 4) { //全部替换
            this.editingOriginalityData.batch_update_item.value = this.creative_title;
            this.editingOriginalityData.batch_update_item.value1 = this.creative_discription1;
            this.editingOriginalityData.batch_update_item.value2 = this.creative_discription2;
          }
        }


        this.editingOriginalityData['select_type'] = this.parentData.selected_type;
        if (this.parentData.selected_type === 'all') {
          this.editingOriginalityData['sheets_setting'] = {
            'table_setting': this.parentData.allViewTableData
          };
        } else {
          this.editingOriginalityData.pub_creative_ids = this.stringIdArray;
        }

        this.editCreative(this.editingOriginalityData , 'batch');
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
          if(result['data']['job_type'] != 'cron') {
            this.message.success("已成功加入任务队列，请稍后查看");
            notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'creative' });
            this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'false'
            });
          } else {
            this.message.success("已成功加入定时任务");
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'false'
            });
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
