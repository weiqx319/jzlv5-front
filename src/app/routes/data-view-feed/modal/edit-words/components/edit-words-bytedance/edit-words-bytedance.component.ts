import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DataViewAddEditService } from '../../../../service/data-view-add-edit.service';
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from '../../../../../../core/service/auth.service';
import { NotifyService } from '../../../../../../module/notify/notify.service';

import { DataViewEditWrapService } from '../../../../service/data-view-edit-wrap.service';
import { DataViewService } from '../../../../service/data-view.service';
import { isArray, isObject } from "@jzl/jzl-util";

@Component({
  selector: 'app-edit-words-bytedance',
  templateUrl: './edit-words-bytedance.component.html',
  styleUrls: ['./edit-words-bytedance.component.scss']
})
export class EditWordsBytedanceComponent implements OnInit, OnChanges {

  @Input() stringIdArray: any;
  @Input() publisher_model: any;
  @Input() parentData: any;
  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();

  @Input() selectData: any;

  public singleData: any = {};


  constructor(private dataViewEditWrapService: DataViewEditWrapService,
    private dataViewService: DataViewService,
    private message: NzMessageService,
    private authService: AuthService,
    private notifyService: NotifyService,
    private modalService: NzModalService) {

  }



  public budgetRadio = 1; //1：每日 2：不限定
  public budget: any; //每日预算值
  public phrase_words: any; //否定词
  public precise_words: any; //精确否定词
  public dimensionsData = [];
  public iswraing = false;

  public cronSettingTime: any = new Date();
  public cronSetting = 'now';
  public editWordsData = {
    "phrase_words": {
      "is_edit": false,
      "edit_type": 'add', //计划: edit_type  追加:add 删除公共部分:delete_common  替换全部:replace_all 删除:delete
      modify_type: 1,
      "value": []
    },
    "precise_words": {
      "is_edit": false,
      modify_type: 1,
      "edit_type": 'add', //计划: edit_type  追加:add 删除公共部分:delete_common  替换全部:replace_all 删除:delete
      "value": []
    },
  };

  public tips = {
    budget: false,
    pc_price_ratio: false,
    wap_price_ratio: false,
    phrase_words: false,
    precise_words: false,

    negativeData_max_length: 200,
    exact_negativeData_max_length: 200,

    length: {
      addValue: 0,
      replaceAllValue: 0,
      deleteValue: 0,
      exactAddValue: 0,
      exactReplaceAllValue: 0,
      exactDeleteValue: 0,

    }
  };

  public negativeData = {
    addValue: '',
    deleteCommonValue: [],
    replaceAllValue: '',
    deleteValue: '',

  };
  public exactNegativeData = {
    addValue: '',
    deleteCommonValue: [],
    replaceAllValue: '',
    deleteValue: '',

  };

  public list = {};

  ngOnInit() {
    this.singleData = this.selectData.selected_data[0];
    if (this.selectData['update_type'] == 'single') {
      this.editWordsData.phrase_words.edit_type = 'replace_all';
      this.editWordsData.precise_words.edit_type = 'replace_all';
      this.getSingleDataInfoByApi();
    }
  }

  //否定词删除全部逻辑
  deleteAll(data, name, lengthName) {
    data[name] = '';
    this.contentChange(lengthName, data[name]);
  }



  //将textarea内容转化为数组
  getTextareaArray(textareaString) {
    const textareaArray = [];
    if (textareaString) {
      textareaString.split('\n').forEach((item) => {
        if (item.match(/^\s+$/)) {
        } else if (item !== '') {
          textareaArray.push(item.replace(/(^\s*)|(\s*$)/g, ""));
        }
      });
    }

    return textareaArray;

  }

  checkPage() {

    const checkHasEdit = Object.values(this.editWordsData).some(item => {
      return item.is_edit;
    });

    if (!checkHasEdit) {
      this.message.error("请选择修改项");
      this.iswraing = true;
    }


    //短语否定词
    if (this.editWordsData.phrase_words['edit_type'] === 'add') {
      this.editWordsData.phrase_words.value = this.getTextareaArray(this.negativeData.addValue);
      this.editWordsData.phrase_words.modify_type = 1;

    } else if (this.editWordsData.phrase_words['edit_type'] === 'delete_common') {
      this.editWordsData.phrase_words.value = this.negativeData.deleteCommonValue;
      this.editWordsData.phrase_words.modify_type = 4;

    } else if (this.editWordsData.phrase_words['edit_type'] === 'replace_all') {
      this.editWordsData.phrase_words.value = this.getTextareaArray(this.negativeData.replaceAllValue);
      this.editWordsData.phrase_words.modify_type = 2;

    } else if (this.editWordsData.phrase_words['edit_type'] === 'delete') {
      this.editWordsData.phrase_words.value = this.getTextareaArray(this.negativeData.deleteValue);
      this.editWordsData.phrase_words.modify_type = 3;

    }

    //精确否定词
    if (this.editWordsData.precise_words['edit_type'] === 'add') {
      this.editWordsData.precise_words.value = this.getTextareaArray(this.exactNegativeData.addValue);
      this.editWordsData.precise_words.modify_type = 1;

    } else if (this.editWordsData.precise_words['edit_type'] === 'delete_common') {
      this.editWordsData.precise_words.value = this.exactNegativeData.deleteCommonValue;
      this.editWordsData.precise_words.modify_type = 4;

    } else if (this.editWordsData.precise_words['edit_type'] === 'replace_all') {
      this.editWordsData.precise_words.value = this.getTextareaArray(this.exactNegativeData.replaceAllValue);
      this.editWordsData.precise_words.modify_type = 2;

    } else if (this.editWordsData.precise_words['edit_type'] === 'delete') {
      this.editWordsData.precise_words.value = this.getTextareaArray(this.exactNegativeData.deleteValue);
      this.editWordsData.precise_words.modify_type = 3;

    }

    if (this.editWordsData.phrase_words.is_edit && this.editWordsData.phrase_words.value.length < 1 || this.editWordsData.precise_words.is_edit && this.editWordsData.precise_words.value.length < 1) {
      this.message.error("修改内容不能为空");
      this.iswraing = true;
    }









  }


  contentChange(name, value?) {
    this.tips.length[name] = this.getTextareaArray(value).length;
  }

  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();
      if (!this.iswraing) {

        const postData = {};
        postData['edit_type'] = 'batch';
        postData["select_type"] = this.selectData.selected_type;
        postData["select_data_type"] = this.summaryType;
        postData["select_ids"] = this.selectData.selected_data_ids;

        if (this.selectData.selected_type == 'all') {
          postData["sheets_setting"] = this.selectData.allViewTableData;
        }
        if (this.selectData['selected_data_ids'].length === 1) {
          postData['edit_type'] = 'single';
        }

        postData['data'] = this.editWordsData;


        this.editData(postData, postData['edit_type']);

      }
    }

  }

  editData(body, edit_type) {
    this.is_saving.emit({
      'is_saving': true,
      'isHidden': 'true'
    });

    if (this.summaryType == 'campaign') {
      this.dataViewEditWrapService.editCampaign(7, body, edit_type).subscribe((result) => {
        if (result) {
          this.is_saving.emit({
            'is_saving': false,
            'isHidden': 'false'
          });
        }
      }, (err) => { }, () => { });


    } else if (this.summaryType == 'adgroup') {
      this.dataViewEditWrapService.editAdgroup(7, body, edit_type).subscribe((result) => {
        if (result) {
          this.is_saving.emit({
            'is_saving': false,
            'isHidden': 'false'
          });
        }
      }, (err) => { }, () => { });
    }


  }


  public getSingleDataInfoByApi() {



    if (this.summaryType == 'campaign') {
      const postBody = {
        "chan_pub_id": this.singleData.chan_pub_id,
        "pub_account_id": this.singleData.pub_account_id,
        "pub_campaign_id": this.singleData.pub_campaign_id
      };

      this.dataViewService.showCampaign(7, postBody).subscribe(result => {
        if (result.status_code == 200 && isObject(result.data)) {

          const campaignDatas = result.data.campaigns_privative;
          if (isArray(campaignDatas) && campaignDatas.length > 0) {
            const campaignData = campaignDatas[0];
            this.negativeData.replaceAllValue = this.getStringByArray(campaignData['phrase_words']);
            this.exactNegativeData.replaceAllValue = this.getStringByArray(campaignData['precise_words']);
          }

        }

      });


    } else if (this.summaryType == 'adgroup') {
      const postBody = {
        "chan_pub_id": this.singleData.chan_pub_id,
        "pub_account_id": this.singleData.pub_account_id,
        "pub_adgroup_id": this.singleData.pub_adgroup_id
      };

      this.dataViewService.showAdgroup(7, postBody).subscribe(result => {
        const groupDatas = result.data.ads_privative;
        if (isArray(groupDatas) && groupDatas.length > 0) {
          const groupData = groupDatas[0];
          this.negativeData.replaceAllValue = this.getStringByArray(groupData['phrase_words']);
          this.exactNegativeData.replaceAllValue = this.getStringByArray(groupData['precise_words']);
        }
      });


    }

  }

  getStringByArray(dataArray) {
    let dataString = "";
    if (dataArray && dataArray.length > 0) {
      dataString = dataArray.join('\n');
    }
    return dataString;
  }






}
