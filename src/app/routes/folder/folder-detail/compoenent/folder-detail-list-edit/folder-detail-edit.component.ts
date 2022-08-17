import { Component, Input, Output , EventEmitter, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {ActivatedRoute, Router} from "@angular/router";
import {RegionListService} from "../../../../dashboard/service/region-list.service";

@Component({
  selector: 'app-folder-detail-edit',
  templateUrl: './folder-detail-edit.component.html',
  styleUrls: ['./folder-detail-edit.component.scss'],
  providers: [RegionListService]
})

export class FolderDetailEditComponent implements OnInit {

  @Input() parentData: any;
  @Output() isHidden = new EventEmitter();

  constructor() {}

  public ranking_model = 0;
  public is_single_edit = false;

  public is_check = 0;
  public currentSelectedMenu = ''; // 默认选项
  public newMenuList = [];
  public saveing: boolean;
  public publisher_model = {
    'publisherCount': 1
};
  public menuList = {
    "single" : [
      {key: 'editing_price', 'name': '出价设置', 'is_show': true},
      {key: 'editing_keyword2', 'name': '基础设置', 'is_show': false},
    ],
    "batch": [
      {key: 'editing_price', 'name': '出价设置', 'is_show': true},
      {key: 'batch_editing_keyword', 'name': '基础设置', 'is_show': false}
    ]
  };

  public idsArray = [];
  public postBody = {};

  private ngIndex = {
    'keyword': ['publisher_id', 'chan_pub_id', 'pub_account_id', 'pub_campaign_id', 'pub_adgroup_id', 'pub_keyword_id']
  };
  private ngEditIndex = {
    'keyword': ['chan_pub_id', 'pub_account_id', 'pub_keyword_id']
  };
  public stringIdArray = [];

  ngOnInit() {
    this.getStringIdArray();
    this.setMenue();
    this.publisher_model['publisher_array'] = [{value: this.parentData.selected_data[0]['publisher_id'] * 1}];
  }

  save_state(event) {
    this.saveing = event['is_saving'];
    this.isHidden.emit(event['isHidden']);
  }

  changeSelectedMenu(item) {
    if (item['is_show'] || this.parentData['editParameter'] === 'all') {
      this.currentSelectedMenu = item.key;
    }
  }

  public setMenue() {
    if ( this.parentData.selected_data.length === 1) { //单个编辑
      this.newMenuList = this.menuList.single;
      this.currentSelectedMenu = this.newMenuList[0].key;
    } else { //批量编辑
      this.newMenuList = this.menuList.batch;
      this.currentSelectedMenu = this.newMenuList[0].key;
    }
    if (this.parentData.edit_source === false) {
      this.newMenuList = [];
    }
  }

  getStringIdArray() {
    this.parentData.selected_data.forEach((item) => {
      const keyObj = {};
      this.ngIndex['keyword'].forEach( (indexKey) => {
        keyObj[indexKey] = item[indexKey];
      } );
      this.idsArray.push(keyObj);

      const needId = [];
      this.ngEditIndex['keyword'].forEach((key) => {
        needId.push(item[key]);
      });
      this.stringIdArray.push(needId.join('_'));
    });
  }

  _save() {
    this.is_check = this.is_check + 1;
  }
  _cancel() {
    localStorage.removeItem('edit_state');
    this.isHidden.emit('false');
  }

}
