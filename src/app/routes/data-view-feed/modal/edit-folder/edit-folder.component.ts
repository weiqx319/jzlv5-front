import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import {DataViewAddEditService} from "../../service/data-view-add-edit.service";
import {RegionListService} from "../../../dashboard/service/region-list.service";
import {differenceInCalendarDays, parseISO} from "date-fns";
import {DataViewFolderFeedService} from '../../service/data-view-folder-feed.service';
import {NotifyService} from '../../../../module/notify/notify.service';
import {AuthService} from '../../../../core/service/auth.service';
import {MenuService} from '../../../../core/service/menu.service';

@Component({
  selector: 'app-edit-folder',
  templateUrl: './edit-folder.component.html',
  styleUrls: ['./edit-folder.component.scss'],
  providers:[DataViewFolderFeedService]
})
export class EditFolderComponent implements OnInit, OnChanges {
  @Input() channelId:0;
  @Input() publisherId:0;
  @Input() idsArray: any;
  @Input() publisher_model: any;
  @Input() parentData: any;
  @Input() is_check: any; //标志是否点击了保存
  @Input() summaryType: any;
  @Output() is_saving: EventEmitter<any> = new EventEmitter<any>();
  @Output() is_adjustment_words: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _http: DataViewAddEditService,
              private authService: AuthService,
              private notifyService: NotifyService,
              private regionList: RegionListService,
              private message: NzMessageService,
              private menuService:MenuService,
              private folderService: DataViewFolderFeedService) {
    this.publisherOption = this._http.getPublisherOption();
  }
  today = new Date();
  public publisherOption = {};
  public dimensionsData = [];
  public showSingleKeywordData = {};
  public campaignInfo = {};
  public groupData = {};
  public accountInfo = {};
  public iswraing = false;

  public tishi = '';

  public folderList = [];


  public folderData = {
    "action": 2, //1，加入分组   2，新建分组
    "folder_level": 'none',
    "folder_name": '',
    "folder_id": undefined,
  };

  ngOnInit() {
    this.folderData.folder_level = this.summaryType;
    if (this.parentData.selected_data.length === 1) {
      switch (this.summaryType) {
        case 'keyword':
          this._showSingleKeyword();
          break;
        case 'campaign':
          this._showCampaign();
          break;
        case 'adgroup':
          this._showAdgroup();
          break;
        case 'account':
          this._showAccount();
          break;
      }
    }
    this.getFolderList(this.summaryType);


  }







  //获取分组列表
  getFolderList(folderLevel = "none") {
    this.folderService.getFolderList({
      'result_model': 'all',
      'folder_level': folderLevel
    }).subscribe(
      (result) => {
        this.folderList = result.data;
      }
    );
  }






  _showSingleKeyword() {
    this._http.getSingleKeywordData({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_keyword_id": this.parentData.selected_data[0].pub_keyword_id
    }).subscribe(
      (result) => {
        if (result.status_code === 200) {
          this.showSingleKeywordData = result.data;
          this._showDimensionSetting(result.data['dimensions']);
        }
      }
    );
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


  _showDimensionSetting(setting) {
    if (setting) {
      this.dimensionsData.forEach((item) => {
        item['value'] = setting[item['key']];
      });
    }
  }

  _showAdgroup() {
    this._http.showAdgroup({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id,
      "pub_adgroup_id": this.parentData.selected_data[0].pub_adgroup_id
    },this.publisherId).subscribe(
      (result) => {
        if ( result.status_code === 200 ) {
          this.groupData = result.data;
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }
      }
    );
  }

  _showAccount() {
    this._http.showAccount({
      "chan_pub_id": this.parentData.selected_data[0].chan_pub_id,
      "pub_account_id": this.parentData.selected_data[0].pub_account_id
    }).subscribe(
      (result) => {
        if ( result.status_code === 200 ) {
          this.accountInfo = result['data'];
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！');
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试');
        } else if (result['status_code'] && result.status_code === 205) {
        } else {
          this.message.error(result.message);
        }

      }
    );
  }

  chengeAdjustmentWords(event) {
    this.is_adjustment_words.emit(event);
  }

  checkPage() {
    this.iswraing = false;
    this.tishi = '';

    if (this.folderData.action === 1) {
      if (!this.folderData.folder_id) {
        this.iswraing = true;
        return false;
      }
    } else if (this.folderData.action === 2) {
      if (!this.folderData.folder_name) {
        this.iswraing = true;
        return false;
      }
    }
  }

  getResultFoldData(selectType ) {
    const model = {
      "folder_info": {},
      "folder_details":{},
    };

    model.folder_info = {...this.folderData};

    model['folder_details']['select_type'] = selectType;
    if (selectType === 'current') {
      model['folder_details']['details'] = this.idsArray;
    } else if (selectType === 'all') {
      model['folder_details']['sheets_setting'] = {
        'table_setting': this.parentData.allViewTableData
      };
    }
    model['folder_details']['type'] = this.summaryType;
    model['source'] = this.summaryType + "Edit";
    return model;
  }


  ngOnChanges() {
    if (this.is_check) {
      this.iswraing = false;
      this.checkPage();

      if (!this.iswraing) {
        this.is_saving.emit({
          'is_saving': true,
          'isHidden': 'true'
        });

        const folderData = this.getResultFoldData(this.parentData.selected_type);
        folderData['channel_id'] = this.menuService.currentChannelId;
        folderData['publisher_id'] = this.menuService.currentPublisherId;
        const notifyData: any[] = [];
        const userOperdInfo = this.authService.getCurrentUserOperdInfo();
        this.folderService.addDetail(folderData).subscribe(
          (result) => {
            this.is_saving.emit({
              'is_saving': false,
              'isHidden': 'true'
            });
            if (result.status_code === 200 ) {
              if(result['data']['process']!='complete') {
                notifyData.push({job_id: result['data']['job_id'], cid: userOperdInfo.select_cid, uid: userOperdInfo.select_uid, op_type: 'import_folder_' + this.summaryType });
                this.notifyService.notifyData.next({type: 'batch_update_job', data: notifyData});
              }


              this.is_saving.emit({
                'is_saving': false,
                'isHidden': 'false'
              });
              this.message.success(result['message']);
            } else if (result['status_code'] && result.status_code === 401) {
              this.message.error(result['message']);
            } else if (result['status_code'] && result.status_code === 500) {
              this.message.error(result['message']);
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
    }

  }

}
