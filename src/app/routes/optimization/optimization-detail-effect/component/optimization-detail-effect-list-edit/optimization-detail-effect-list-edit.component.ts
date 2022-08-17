import { Component, Input, Output , EventEmitter, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {ActivatedRoute, Router} from "@angular/router";
import {RegionListService} from "../../../../dashboard/service/region-list.service";
import {AuthService} from "../../../../../core/service/auth.service";

@Component({
  selector: 'app-optimization-detail-effect-list-edit',
  templateUrl: './optimization-detail-effect-list-edit.component.html',
  styleUrls: ['./optimization-detail-effect-list-edit.component.scss'],
  providers: [RegionListService]
})

export class OptimizationDetailEffectListEditComponent implements OnInit {

  @Input() parentData: any;
  @Output() isHidden = new EventEmitter();


  constructor(
              private regionList: RegionListService,
              private message: NzMessageService,
              private router: Router,
              private route: ActivatedRoute,
              private authService: AuthService) {
    this.optimizationId = this.route.snapshot.parent.paramMap.get('id');
  }

  public optimizationId: any;
  public publisherId: any; //媒体id
  public currentSelectedMenu = ''; // 默认选项
  public newMenuList = [];
  public saveing = false;
  public iswraing = false; //校验 false：不校验， true：提示校验
  public menuList = {
    "single" : [
      {key: 'editing_optimization', 'name': '优化设置'},
      // {key: 'editing_keyword2', 'name': '基础设置'},
    ],
    "batch": [
      {key: 'editing_optimization', 'name': '优化设置'},
      // {key: 'batch_editing_keyword', 'name': '基础设置'}
    ]
  };

  public optimizationData = {
    /*'height_price': 0,
    'low_price': 0,
    'price_step_rate': 0,*/
  };



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

  changeSelectedMenu(item) {
    this.currentSelectedMenu = item.key;
  }
  ngOnInit() {
    this.setMenue();
    this.authService.getStopBackState().subscribe((result) => {
      if (result === 'true') {
        this.isHidden.emit('false');
        localStorage.removeItem('edit_state');
      }
    });
  }





  _save() {
    this.iswraing = false;
    this.checkPage(this.currentSelectedMenu);
    if (!this.iswraing) {
      if (!this.saveing) {
        this.saveing = true;
        localStorage.removeItem('edit_state');

      }
    }
  }

  //页面校验
  checkPage(currentMenue) {
    switch (currentMenue) {
      case 'editing_optimization':
        if (!this.optimizationData['max_price']) {
          this.iswraing = true;
          break;
        }
        if (!this.optimizationData['min_price']) {
          this.iswraing = true;
          break;
        }
        if (!this.optimizationData['price_step_rate']) {
          this.iswraing = true;
          break;
        }
        break;
    }
  }




  _cancel() {
    localStorage.removeItem('edit_state');
    this.isHidden.emit('false');
  }
}
