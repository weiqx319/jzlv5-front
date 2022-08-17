import { ElementRef, NgModule, TemplateRef, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { DataViewAddEditService } from "../../service/data-view-add-edit.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ItemSelectService } from "../../../../module/item-select/service/item-select.service";
import { MenuService } from "../../../../core/service/menu.service";

@Component({
  selector: 'app-data-view-add',
  templateUrl: './data-view-add.component.html',
  styleUrls: ['./data-view-add.component.scss'],
  providers: [DataViewAddEditService]
})
export class DataViewAddComponent implements OnInit {


  @ViewChild('creativeTitle') creativeTitle: ElementRef<any>;
  constructor(private itemSelectService: ItemSelectService,
    private _http: DataViewAddEditService,
    private message: NzMessageService,
    private router: Router,
    private menuService: MenuService,
    private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.summaryType = data['summaryType'];
    });
  }

  public is_check = 0;
  public summaryType = 'keyword';
  public currentSelectedMenu = 'add_single_plan'; // 默认选项
  public menuList = [];
  public newMenuList = [];
  public saveing = false;

  ngOnInit() {
    this.initMenuList();
    this.setKeywordList();
  }


  public initMenuList() {
    this.menuList = [
      { key: 'add_single_keyword', 'name': '添加单个关键词', 'summaryType': 'keyword', 'is_show': true },
      { key: 'batch_add_updates_keyword', 'name': '批量添加/更新关键词', 'summaryType': 'keyword' },
      { key: 'add_Originality', 'name': '添加单个创意', 'summaryType': 'creative', 'is_show': true },
      { key: 'batch_add_Originality', 'name': '批量添加/更新创意', 'summaryType': 'creative' },
      { key: 'add_single_unit', 'name': '添加单个单元', 'summaryType': 'adgroup', 'is_show': true },
      { key: 'batch_add_updates_unit', 'name': '批量添加/更新单元', 'summaryType': 'adgroup' },
      { key: 'add_single_plan', 'name': '添加单个计划', 'summaryType': 'campaign', 'is_show': true },
      { key: 'batch_addition_Keyword', 'name': '批量添加/更新计划', 'summaryType': 'campaign' },
    ];
  }

  public changeSelectedMenu(item) {
    if (item['is_show']) {
      this.currentSelectedMenu = item.key;
    }
    // this.currentSelectedMenu = item.key;
  }


  public setKeywordList() {
    for (let i = 0; i < this.menuList.length; i++) {
      if (this.menuList[i].summaryType === this.summaryType) {
        this.newMenuList.push(this.menuList[i]);
        this.currentSelectedMenu = this.newMenuList[0].key;
      }
    }
  }

  _save() {
    this.is_check = this.is_check + 1;
  }
  save_state(event) {
    this.saveing = event;
  }


  _cancel() {
    if (this.summaryType === 'adgroup') {
      this.router.navigateByUrl('/data_view/sem/' + 'group');
    } else {
      this.router.navigateByUrl('/data_view/sem/' + this.summaryType);
    }
  }
  /*
    addKeywordWildcards(data) {

      this.addOriginalityData[data] = this.addOriginalityData[data] + '{}';
     /!* this.creativeTitle.nativeElement.focus();
      this.addOriginalityData[data] = this.addOriginalityData[data] + '}';
  *!/
      const pos = this.addOriginalityData[data].length - 1;
      this.creativeTitle.nativeElement.focus();
      // this.trigger(this.creativeTitle , 'click');



  /!*
      console.log(this.creativeTitle);*!/
    }

    trigger(elem, event) {

      const myEvent = document.createEvent('Event');      // 初始化这个事件对象，为它提高需要的“特性”
      myEvent.initEvent(event, true, true);        //执行事件
      // elem.dispatchEvent(myEvent);
      elem.nativeElement.SelectionStart = 1;
    }
  */


}
