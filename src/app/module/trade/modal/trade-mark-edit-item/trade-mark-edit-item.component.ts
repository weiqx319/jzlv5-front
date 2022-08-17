import {Component, Input, OnInit} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {TradeService} from "../../service/trade.service";

import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from "rxjs/operators";


@Component({
  selector: 'app-trade-mark-edit-item',
  templateUrl: './trade-mark-edit-item.component.html',
  styleUrls: ['./trade-mark-edit-item.component.scss']
})
export class TradeMarkEditItemComponent implements OnInit {

  @Input() data: any;
  @Input() editFrom: any;
  @Input() dataList: any;
  @Input() cid: any;
  @Input() parentInfo: any;
  @Input() firstMark: any;
  @Input() listFilter: any;

  private inputTerms = new Subject<string>();

  public is_warning = false;

  public allDefaultData = {
    bizUnitName: {
      biz_unit_name: null,
      is_warning: false,
      // error_message: ''
    },
    bizUnitChildName: {
      biz_unit_name: null,
      is_warning: false
    },
    parentUnit: {
      parent_id: null,
      is_warning: false
    },
    addBizUnitName: {
      biz_list: [{biz_unit_name: null, parent_id: 0}],
      is_warning: false
    },
    addBizUnitChildName: {
      biz_list: [{biz_unit_name: null, parent_id: null}],
      is_warning: false,
      createOneDuplicationWarning: false,
    },
    tradeNameFirst: {
      biz_unit_type_name: null,
      is_warning: false,
    },
    tradeNameSecond: {
      biz_unit_type_name: null,
      is_warning: false,
    }
  };
  public biz_list = [];
  public createOneData = [{biz_unit_name: null, parent_id: 0}];
  public checkSuccess =  false;
  public checkAddOneSuccess =  false;

  private reg = /^ *$/; //匹配是否为空字符串
  constructor( private tradeService: TradeService,
               private message: NzMessageService,
               private modalSubject: NzModalRef) {

  }

  ngOnInit() {

    if (this.data) { //来自编辑
      if (this.editFrom === 'tradeNameFirst') {
        this.allDefaultData[this.editFrom]['biz_unit_type_name'] = this.data['biz_unit_type_name'];
      }
      if (this.editFrom === 'tradeNameSecond') {
        this.allDefaultData[this.editFrom]['biz_unit_type_name'] = this.data['child']['biz_unit_type_name'];
      }
      if (this.editFrom === 'bizUnitName') {
        this.allDefaultData[this.editFrom]['biz_unit_name'] = this.data['biz_unit_name'];
      }
      if (this.editFrom === 'bizUnitChildName') {
        this.allDefaultData[this.editFrom]['biz_unit_name'] = this.data['biz_unit_name'];
      }
      if (this.editFrom === 'parentUnit') {
        this.allDefaultData[this.editFrom].parent_id = this.data['parent_id'];
      }

    } else { //来自增加
      if (this.editFrom === 'addBizUnitChildName') {
        this.allDefaultData[this.editFrom].biz_list[0]['parent_id'] = this.listFilter.length ? this.listFilter[0].key : null;
      }
    }

    this.inputTerms.pipe(
      // 请求防抖 300毫秒
      debounceTime(500),
      distinctUntilChanged())
      .subscribe(term => {
        // 此处进行httpClient的请求
        // term是用户输入的值
        if (this.editFrom === 'addBizUnitName' || this.editFrom === 'addBizUnitChildName') {
          this.checkoutTradeContent();
        }
        if (this.editFrom !== 'addBizUnitName' && this.editFrom !== 'addBizUnitChildName') {
          this.checkIsSame(term);
        }
      });
  }


  /*判断 无列表 的内容*/
  checkIsSame(term) {
    if (this.editFrom === 'bizUnitName' || this.editFrom === 'bizUnitChildName') {
      if (!term || this.reg.test(term)) {
        this.allDefaultData[this.editFrom]['is_warning'] = true;
        this.allDefaultData[this.editFrom]['error_message'] = '名称不能为空';
      } else {
        const parm = {
          cid: this.parentInfo['cid'],
          name: term,
          biz_unit_type: this.parentInfo['biz_unit_type'],
        };
        this.tradeService.checkTradeContentName(parm).subscribe(checkResult => {
          if (checkResult['status_code'] === 200) { //有重复
            this.allDefaultData[this.editFrom]['is_warning'] = true;
            this.allDefaultData[this.editFrom]['error_message'] = '名称重复，请重新设置';

          } else if (checkResult['status_code'] === 205) { //无重复
            this.allDefaultData[this.editFrom]['is_warning'] = false;
            this.allDefaultData[this.editFrom]['error_message'] = '';

          }
        });
      }
    }
    if (this.editFrom === 'tradeNameFirst' || this.editFrom === 'tradeNameSecond') {
      if (!term || this.reg.test(term)) {
        this.allDefaultData[this.editFrom]['is_warning'] = true;
        this.allDefaultData[this.editFrom]['error_message'] = '名称不能为空';
      } else {
        this.tradeService.checkName({cid: this.data['cid'], name: term}).subscribe(checkResult => {
          if (checkResult['status_code'] === 200) { //有重复
            this.allDefaultData[this.editFrom]['is_warning'] = true;
            this.allDefaultData[this.editFrom]['error_message'] = '名称重复，请重新设置';

          } else if (checkResult['status_code'] === 205) { //无重复
            this.allDefaultData[this.editFrom]['is_warning'] = false;
            this.allDefaultData[this.editFrom]['error_message'] = '';

          }
        });
      }
    }

    if (this.editFrom === 'addBizUnitName' || this.editFrom === 'addBizUnitChildName') { //批量添加一级、二级标识内容
      const is_warning_current_page = this.checkTradeListName(this.allDefaultData[this.editFrom].biz_list, term);

      if (!is_warning_current_page['is_warning']) {
        this.allDefaultData[this.editFrom]['is_warning'] = false;
        const parm = {
          cid: this.parentInfo['cid'],
          name: term,
          biz_unit_type: this.parentInfo['biz_unit_type'],
        };
        this.tradeService.checkTradeContentName(parm).subscribe(checkResult => {
          if (checkResult['status_code'] === 200) { //有重复
            this.allDefaultData[this.editFrom]['is_warning'] = true;

            this.allDefaultData[this.editFrom].biz_list[is_warning_current_page['nameIndex']]['has_error'] = true;
            this.allDefaultData[this.editFrom].biz_list[is_warning_current_page['nameIndex']]['error_message'] = '名称不能重复, 请重新设置';
          } else if (checkResult['status_code'] === 205) { //无重复
            this.allDefaultData[this.editFrom]['is_warning'] = false;
            this.allDefaultData[this.editFrom].biz_list[is_warning_current_page['nameIndex']]['has_error'] = false;
            this.allDefaultData[this.editFrom].biz_list[is_warning_current_page['nameIndex']]['error_message'] = '';


          }
        });
      } else {
        this.allDefaultData[this.editFrom]['is_warning'] = true;
      }
    }
  }

  /*循环判断标识内容是否为空或者重复*/
  checkoutTradeContent() {
    this.allDefaultData[this.editFrom].biz_list.forEach((item, nameIndex) => {
      item['has_error'] = false;
      item['error_message'] = '';
      this.checkIsSame(item.biz_unit_name);
    });
  }

  inputChange(value: string) {
    this.allDefaultData[this.editFrom]['is_warning'] = false;
    this.allDefaultData[this.editFrom]['error_message'] = '';
    this.inputTerms.next(value);
  }


  cancel() {
    this.modalSubject.destroy('onCancel');
  }
  doSave() {
    this.checkSuccess = true;
    /*编辑一级行业标识内容*/
    if (this.editFrom === 'bizUnitName') {
      this.allDefaultData[this.editFrom].is_warning = false;
      if (!this.allDefaultData[this.editFrom].biz_unit_name || this.reg.test(this.allDefaultData[this.editFrom].biz_unit_name)) {
        this.allDefaultData[this.editFrom].is_warning = true;
      } else {
        //判断是否重复
       if (!this.allDefaultData[this.editFrom].is_warning) {
         const body = {
           parent_id: 0,
           id:  this.data.id,
           biz_unit_name: this.allDefaultData[this.editFrom].biz_unit_name
         };
         this.tradeService.updateTradeContentName(body, {cid: this.parentInfo['cid']}).subscribe(results => {
           this.checkSuccess = false;
           if (results['status_code'] === 200) {
             this.message.success('操作成功');
             this.modalSubject.destroy('onOk');

           } else {
             this.message.warning(results.message, {nzDuration: 5000});
           }
         }, (err: any) => {
           this.checkSuccess = false;
           this.message.error('系统异常，请重试');
         });
       }

      }
    }

    /*编辑二级级行业标识内容 的 名称*/
    if (this.editFrom === 'bizUnitChildName') {
      this.allDefaultData[this.editFrom].is_warning = false;
      if (!this.allDefaultData[this.editFrom].biz_unit_name || this.reg.test(this.allDefaultData[this.editFrom].biz_unit_name)) {
        this.allDefaultData[this.editFrom].is_warning = true;
      } else {
        //判断是否重复
      if (!this.allDefaultData[this.editFrom].is_warning) {
        const body = {
          parent_id: this.parentInfo['parent_id'],
          id:  this.data.id,
          biz_unit_name: this.allDefaultData[this.editFrom].biz_unit_name
        };
        this.tradeService.updateTradeContentName(body, {cid: this.parentInfo['cid']}).subscribe(results => {
          this.checkSuccess = false;
          if (results['status_code'] === 200) {
            this.message.success('操作成功');
            this.modalSubject.destroy('onOk');
          } else {
            this.message.warning(results.message, {nzDuration: 5000});
          }
        }, (err: any) => {
          this.checkSuccess = false;
          this.message.error('系统异常，请重试');
        });
      }
      }
    }

    /*编辑二级级行业标识内容 的 名称*/
    if (this.editFrom === 'parentUnit') {
      const body = {
        parent_id: this.allDefaultData[this.editFrom].parent_id,
        id:  this.data.id,
        biz_unit_name: this.data.biz_unit_name
      };
      this.tradeService.updateTradeContentName(body, {cid: this.parentInfo['cid']}).subscribe(results => {
        this.checkSuccess = false;
        if (results['status_code'] === 200) {
          this.message.success('操作成功');
          this.modalSubject.destroy('onOk');
        } else {
          this.message.warning(results.message, {nzDuration: 5000});
        }
      }, (err: any) => {
        this.checkSuccess = false;
        this.message.error('系统异常，请重试');
      });
    }

    /*批量添加一级行业标识内容*/
    if (this.editFrom === 'addBizUnitName') {

      this.checkoutTradeContent();
      if (!this.allDefaultData[this.editFrom].is_warning) {
        const biz_new = [];
        this.allDefaultData[this.editFrom].biz_list.forEach(biz => {
          biz_new.push({biz_unit_name: biz.biz_unit_name, parent_id: 0});
        });
        const body = {
          biz_unit_type: this.parentInfo.biz_unit_type,
          biz_list: biz_new,
        };

        this.tradeService.addTradeContentName(body, {cid: this.parentInfo.cid}).subscribe(results => {
          this.checkSuccess = false;
          if (results['status_code'] === 200) {
            this.message.success('操作成功');
            this.modalSubject.destroy('onOk');
          } else {
            this.message.warning(results.message, {nzDuration: 5000});
          }
        }, (err: any) => {
          this.checkSuccess = false;
          this.message.error('系统异常，请重试');
        });
      }
    }

    /*批量添加二级行业标识内容*/
    if (this.editFrom === 'addBizUnitChildName') {
      this.checkoutTradeContent();
      if (!this.allDefaultData[this.editFrom].is_warning) {
        const biz_new = [];
        this.allDefaultData[this.editFrom].biz_list.forEach(biz => {
          biz_new.push({biz_unit_name: biz.biz_unit_name, parent_id: biz.parent_id});
        });
        const body = {
          biz_unit_type: this.parentInfo.biz_unit_type,
          biz_list: biz_new
        };

        this.tradeService.addTradeContentName(body, {cid: this.parentInfo.cid}).subscribe(results => {
          this.checkSuccess = false;
          if (results['status_code'] === 200) {
            this.message.success('操作成功');
            this.modalSubject.destroy('onOk');
          } else {
            this.message.warning(results.message, {nzDuration: 5000});
          }
        }, (err: any) => {
          this.message.error('系统异常，请重试');
          this.checkSuccess = false;
        });
      }

    }


    /*编辑行业标识一级*/
    if (this.editFrom === 'tradeNameFirst') {
      this.allDefaultData[this.editFrom].is_warning = false;
      if (!this.allDefaultData[this.editFrom]['biz_unit_type_name'] || this.reg.test(this.allDefaultData[this.editFrom]['biz_unit_type_name'])) {
        this.message.warning('名称不能为空', {nzDuration: 5000});
      } else {
        //判断是否重复
        if (!this.allDefaultData[this.editFrom].is_warning) {
          const body = {
            id:  this.data.id,
            biz_unit_type_name: this.allDefaultData[this.editFrom]['biz_unit_type_name']
          };
          this.tradeService.updateTradeName(body, {cid: this.data.cid}).subscribe(results => {
            this.checkSuccess = false;
            if (results['status_code'] === 200) {
              this.message.success('操作成功');
              this.modalSubject.destroy('onOk');
            } else {
            }
          }, (err: any) => {
            this.checkSuccess = false;
            this.message.error('系统异常，请重试');
          });
        }
      }
    }

    /*编辑行业标识二级*/
    if (this.editFrom === 'tradeNameSecond') {
      this.allDefaultData[this.editFrom].is_warning = false;
      if (!this.allDefaultData[this.editFrom]['biz_unit_type_name'] || this.reg.test(this.allDefaultData[this.editFrom]['biz_unit_type_name'])) {
        this.message.warning('行业标识名称不能为空', {nzDuration: 5000});
      } else {
        //判断是否重复
        if (!this.allDefaultData[this.editFrom].is_warning) {
          const body = {
            id:  this.data.child.id,
            biz_unit_type_name: this.allDefaultData[this.editFrom]['biz_unit_type_name']
          };
          this.tradeService.updateTradeName(body, {cid: this.data.cid}).subscribe(results => {
            this.checkSuccess = false;
            if (results['status_code'] === 200) {
              this.message.success('操作成功');
              this.modalSubject.destroy('onOk');
            } else {
              this.message.warning(results.message, {nzDuration: 5000});
            }
          }, (err: any) => {
            this.checkSuccess = false;
            this.message.error('系统异常，请重试');
          });
        }

      }
    }

  }


  checkTradeListName(biz_list, name?) {
    let is_warning = false;
    const biz_unit_name = {};
    let nameIndex = 0;
    for (let i = 0; i < biz_list.length; i++) {
      if (name && name === biz_list[i].biz_unit_name) {
        nameIndex = i;
      }
      if (!biz_list[i].biz_unit_name || this.reg.test(biz_list[i].biz_unit_name)) {
        biz_list[i]['has_error'] = true;
        biz_list[i]['error_message'] = '名称不能为空';
        is_warning = true;
        break;
      }
      if (!biz_unit_name[biz_list[i].biz_unit_name]) {
        biz_unit_name[biz_list[i].biz_unit_name] = [];
        biz_unit_name[biz_list[i].biz_unit_name].push(i);
      } else {
        is_warning = true;
        biz_unit_name[biz_list[i].biz_unit_name].push(i);
        biz_unit_name[biz_list[i].biz_unit_name].forEach(unit => {
          biz_list[unit]['has_error'] = true;
          biz_list[unit]['error_message'] = '名称不能重复, 请重新设置';
        });
      }

    }
    return {is_warning: is_warning, nameIndex: nameIndex};
  }


  addName(name) {
    if (name === 'one') {
      const base = {biz_unit_name: null, parent_id: 0};
      this.allDefaultData[this.editFrom].biz_list.push(base);
    } else if (name === 'two') {
      const base = {biz_unit_name: null, parent_id: this.listFilter.length ? this.listFilter[0].key : null};
      this.allDefaultData[this.editFrom].biz_list.push(base);
    }
    this.allDefaultData[this.editFrom]['is_warning'] = true;
    this.allDefaultData[this.editFrom].biz_list[this.allDefaultData[this.editFrom].biz_list.length - 1]['has_error'] = true;
    this.allDefaultData[this.editFrom].biz_list[this.allDefaultData[this.editFrom].biz_list.length - 1]['error_message'] = '名称不能为空';

  }
  deleteName(index) {
    this.allDefaultData[this.editFrom]['is_warning'] = false;
    this.allDefaultData[this.editFrom].biz_list.splice(index, 1);
    this.checkoutTradeContent();
  }
  nameClick(name?) {
    this.allDefaultData[this.editFrom].createOneDuplicationWarning = false;
  }

  createOne(itemFile) {
    itemFile['show'] = true;
    itemFile['biz_unit_name'] = null;
  }
  clickCreateOneCancel(itemFile) {
    itemFile['show'] = false;
  }
  clickCreateOneOk(itemFile) {
    this.checkAddOneSuccess = true;
    this.allDefaultData[this.editFrom].createOneDuplicationWarning = false;
    if (!this.createOneData[0].biz_unit_name || this.reg.test(this.createOneData[0].biz_unit_name)) {
      this.allDefaultData[this.editFrom].is_warning = true;
      this.checkAddOneSuccess = false;
    } else {
      this.tradeService.checkTradeContentName({cid: this.parentInfo['cid'], name: this.createOneData[0].biz_unit_name, biz_unit_type: this.firstMark.biz_unit_type}).subscribe(checkResult => {
        if (checkResult['status_code'] === 200) { //有重复
          this.message.warning('上级标识名称重复,请重新输入', { nzDuration: 10000 });
          this.checkAddOneSuccess = false;
        } else if (checkResult['status_code'] === 205) { //无重复
          const body = {
            biz_unit_type: this.firstMark.biz_unit_type,
            biz_list: this.createOneData
          };
          this.tradeService.addTradeContentName(body, {cid: this.parentInfo['cid']}).subscribe(results => {
            this.checkAddOneSuccess = false;
            if (results['status_code'] === 200) {
              this.getTradeContentListFilter();
              this.message.success('添加成功');
              this.allDefaultData[this.editFrom].is_warning = false;
              itemFile['show'] = false;

            } else {
              this.checkAddOneSuccess = false;
              this.message.warning(results.message, {nzDuration: 5000});
            }
          }, (err: any) => {
            this.message.error('系统异常，请重试');
          });
        }
      });


    }
  }

  getTradeContentListFilter() {
    this.tradeService.getTradeContentListFilter({
      cid: this.parentInfo['cid'],
      biz_unit_type: this.firstMark['biz_unit_type'],
    }).subscribe(result => {
      if (result.status_code === 200) {
        this.listFilter = result.data;
      }
    });
  }


}
