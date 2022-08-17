import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {TradeService} from "../../service/trade.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';


import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {Subject} from 'rxjs';

@Component({
  selector: 'app-add-trade-mark',
  templateUrl: './add-trade-mark.component.html',
  styleUrls: ['./add-trade-mark.component.scss']
})
export class AddTradeMarkComponent implements OnInit {
  public submitting = false;


  public stepData = {
    hierarchy_1: [{name: '添加行业标识项'} , {name: '设置标识名称'}],
    hierarchy_2: [{name: '添加行业标识项'} , {name: '设置一级标识名称'} , {name: '设置二级标识名称'}],
  };
  public tradeHierarchy = [
    {key: 1, name: '一级'},
    {key: 2, name: '二级' },
  ];

  public defaultData = {
    has_error_one: false,
    has_error_two: false,
    error_message_two: '',
    error_message_one: '',
    cid: null,
    trade_class: 1,
    trade_name_first: null,
    trade_name_second: null,
    biz_list: [{biz_unit_name: null, biz_parent_unit_name: null}],
    biz_list_child: [{biz_unit_name: null, biz_parent_unit_name: null}],
  };
  public current = 0;

  public createOneData = [{biz_unit_name: null, biz_parent_unit_name: null}];
  public createOneWarning = false;
  public createOneDuplicationWarning = false;
  public advertiserList = [];
  public tradeList = [];
  public checkSuccess =  false;
  public checkAddOneSuccess =  false;
  validateTradeClassForm: FormGroup;
  private inputTerms = new Subject<string>();
  private reg = /^ *$/; //匹配是否为空字符串
  constructor(private fb: FormBuilder,
              private tradeService: TradeService,
              private message: NzMessageService,
              private modalService: NzModalService,
              private modalSubject: NzModalRef) {
  }

  ngOnInit() {
    this.getAdverList();
    this.validateTradeClassForm = this.fb.group({
      cid: ['', [Validators.required]],
      trade_class: ['', [Validators.required]],
      trade_name: ['', [Validators.required]],
    });
    this.inputTerms.pipe(
      // 请求防抖 300毫秒
      debounceTime(500),
      distinctUntilChanged())
      .subscribe(term => {
        // 此处进行httpClient的请求
        // term是用户输入的值
        if (this.current === 1) {
          this.checkoutTwoTradeContent();
        }
        if (this.current === 2) {
          this.checkoutOneTradeContent();
        }
        if (this.current === 0 && this.defaultData.trade_class === 2) {
          [this.defaultData.trade_name_first, this.defaultData.trade_name_second].forEach((item, nameIndex) => {
            if (nameIndex === 0) {
              this.defaultData['has_error_one'] = false;
              this.defaultData['error_message_one'] = '';
            }
            if (nameIndex === 1) {
              this.defaultData['has_error_two'] = false;
              this.defaultData['error_message_two'] = '';
            }
            this.checkIsSame(item);
          });
        }
        if (this.current === 0 && this.defaultData.trade_class === 1) {
          this.checkIsSame(term);
        }

      });

  }

  /*循环判断一级标识内容是否为空或者重复*/
  checkoutOneTradeContent() {
    this.defaultData.biz_list_child.forEach((item, nameIndex) => {
      item['has_error'] = false;
      item['error_message'] = '';
      item['has_error_parent_unit'] = false;
      item['error_message_parent_unit'] = '';
      this.checkIsSame(item.biz_unit_name);
    });
  }
  /*循环判断二级标识内容是否为空或者重复*/
  checkoutTwoTradeContent() {
    this.defaultData.biz_list.forEach((item, nameIndex) => {
      item['has_error'] = false;
      item['error_message'] = '';
      this.checkIsSame(item.biz_unit_name);
    });
  }
  inputChange(value: string, parent? , index?) {
    if (parent) { //一级
      this.defaultData.biz_list_child[index]['has_error_parent_unit'] = false;
      this.defaultData.biz_list_child[index]['error_message_parent_unit'] = '';
    }
    if (this.current === 0) {
      this.defaultData['has_error_one'] = false;
      this.defaultData['error_message_one'] = '';
      this.defaultData['has_error_two'] = false;
      this.defaultData['error_message_two'] = '';
    }
    this.inputTerms.next(value);
  }

  checkIsSame(term) {
    let is_warning_current_page: any;
    if (this.current === 1) {
      is_warning_current_page = this.checkTradeListName( this.defaultData.biz_list, term);
      if (is_warning_current_page['is_warning']) {
        this.defaultData['is_warning_content_one'] = true;
      } else {
        this.defaultData['is_warning_content_one'] = false;
      }
    }
    if (this.current === 2) {
      is_warning_current_page = this.checkTradeListName( this.defaultData.biz_list_child, term);
      if (is_warning_current_page['is_warning']) {
        this.defaultData['is_warning_content_two'] = true;
      } else {
        this.defaultData['is_warning_content_two'] = false;
      }
    }
    if (this.current === 0) {
      //创建一级
      if (this.defaultData.trade_class === 1) {
        if (!this.defaultData.trade_name_first || this.reg.test(this.defaultData.trade_name_first)) {

        } else {
          this.tradeService.checkName({cid: this.defaultData.cid, name: term}).subscribe(checkResult => {
            if (checkResult['status_code'] === 200) { //有重复
              this.defaultData['is_warning_one'] = true;
              this.defaultData['error_message_one'] = '名称重复，请重新设置';
              this.defaultData['has_error_one'] = true;

            } else if (checkResult['status_code'] === 205) { //无重复
              this.defaultData['is_warning_one'] = false;
              this.defaultData['error_message_one'] = '';
              this.defaultData['has_error_one'] = false;

            }
          });

        }

      }
      //创建二级
      if (this.defaultData.trade_class === 2) {
        this.defaultData['is_warning_one'] = false;
        if (!this.defaultData.trade_name_first || this.reg.test(this.defaultData.trade_name_first)) {

        } else if (this.defaultData.trade_name_first === this.defaultData.trade_name_second) { //一二级标识名称重复
          this.defaultData['error_message_one'] = '名称重复，请重新设置';
          this.defaultData['has_error_one'] = true;
          this.defaultData['error_message_two'] = '名称重复，请重新设置';
          this.defaultData['has_error_two'] = true;
          this.defaultData['is_warning_one'] = true;

        } else {

          if (!this.defaultData['is_warning_one']) {
            this.tradeService.checkName({cid: this.defaultData.cid, name: term}).subscribe(checkResult => {
              if (checkResult['status_code'] === 200) { //有重复
                this.defaultData['is_warning_one'] = true;
                if (term === this.defaultData.trade_name_first) {
                  this.defaultData['error_message_one'] = '名称重复，请重新设置';
                  this.defaultData['has_error_one'] = true;
                } else {
                  this.defaultData['error_message_two'] = '名称重复，请重新设置';
                  this.defaultData['has_error_two'] = true;
                }

              } else if (checkResult['status_code'] === 205) { //无重复
                this.defaultData['is_warning_one'] = false;
                this.defaultData['error_message_one'] = '';
                this.defaultData['has_error_one'] = false;
                this.defaultData['error_message_two'] = '';
                this.defaultData['has_error_two'] = false;

              }
            });
          }

        }

      }
    }
  }

  /*判断标识内容是否重复*/
  checkTradeListName(biz_list, name?) {
    let is_warning = false;
    const biz_unit_name = {};

    let nameIndex = 0;
    for (let i = 0; i < biz_list.length; i++) {
      if (name && (name === biz_list[i].biz_unit_name)) {

        nameIndex = i;
      }
      if (this.current === 2 && !biz_list[i].biz_parent_unit_name) {
        biz_list[i]['has_error_parent_unit'] = true;
        biz_list[i]['error_message_parent_unit'] = '选择上级标识';
        is_warning = true;
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


  getAdverList() {
    this.tradeService.getAdvertiserList({}, {result_model: 'all', need_publish_account: 0}).subscribe(result => {
        if (result['status_code'] && result.status_code === 200) {
          this.advertiserList = result['data'];
          if (this.advertiserList.length) {
            this.defaultData.cid = this.advertiserList[0].cid;
            this.getTradeList();
          } else {
            this.defaultData.cid = null;
          }
        } else if (result['status_code'] && result.status_code === 201) {
          this.message.error('广告主名称已经存在，请重试', { nzDuration: 10000 });
        } else if (result['status_code'] && result.status_code === 401) {
          this.message.error('您没权限对此操作！', { nzDuration: 10000 });
        } else if (result['status_code'] && result.status_code === 500) {
          this.message.error('系统异常，请重试', { nzDuration: 10000 });
        } else {
          this.message.error(result.message, { nzDuration: 10000 });
        }
      }, (err) => {

        this.message.error('系统异常，请重试', { nzDuration: 10000 });
      }
    );
  }
  changeAdver() {
    this.getTradeList();
  }
  changeTrade() {
    if (this.defaultData.trade_class === 1) {
      this.validateTradeClassForm.removeControl('trade_two_name');
    } else {
      this.validateTradeClassForm.addControl('trade_two_name', new FormControl('', Validators.required));
    }
    this.defaultData['is_warning_one'] = false;
    this.defaultData['has_error_one'] = false;
    this.defaultData['error_message_one'] = '';
    this.defaultData['has_error_two'] = false;
    this.defaultData['error_message_two'] = '';
  }
  getTradeClassFormControl(name) {
    return this.validateTradeClassForm.controls[ name ];
  }

  addName(name) {
    const base = {biz_unit_name: null, biz_parent_unit_name: null};

    if (name === 'two') {
      this.defaultData['is_warning_content_two'] = true;
      this.defaultData.biz_list_child.push(base);
      this.defaultData.biz_list_child[this.defaultData.biz_list_child.length - 1]['has_error'] = true;
      this.defaultData.biz_list_child[this.defaultData.biz_list_child.length - 1]['error_message'] = '名称不能为空';

    } else if (name === 'one') {
      this.defaultData['is_warning_content_one'] = true;
      this.defaultData.biz_list.push(base);
      this.defaultData.biz_list[this.defaultData.biz_list.length - 1]['has_error'] = true;
      this.defaultData.biz_list[this.defaultData.biz_list.length - 1]['error_message'] = '名称不能为空';

    }

  }
  deleteName(name, index) {
    if (name === 'two') {
      this.defaultData.biz_list_child.splice(index, 1);
      this.checkoutTwoTradeContent();
    } else if (name === 'one') {
      this.defaultData.biz_list.splice(index, 1);
      this.checkoutOneTradeContent();
    }
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
    this.createOneDuplicationWarning = false;
    if (!this.createOneData[0].biz_unit_name || this.reg.test(this.createOneData[0].biz_unit_name)) {
      this.checkAddOneSuccess = false;
    } else {
      this.createOneDuplicationWarning = false;
      this.defaultData.biz_list.forEach(item => {
        if (item['biz_unit_name'] === this.createOneData[0].biz_unit_name) {
          this.createOneDuplicationWarning = true;
        }
      });
      this.checkAddOneSuccess = false;
      if (!this.createOneDuplicationWarning) {
        this.message.success('上级标识新建成功');
        this.defaultData.biz_list.push(...this.createOneData);
        itemFile['show'] = false;
      } else {
        this.message.warning('上级标识名称重复,请重新输入', { nzDuration: 10000 });
      }


    }
  }

  nameClick(name?) {
    this.defaultData.biz_list.forEach((item, nameIndex) => {
      item['has_error'] = false;
      item['error_message'] = '';
    });
    if (name === 'createOne') {
      this.createOneWarning = false;
    }
    if (name === 'two') {
      this.createOneWarning = false;
    }

  }

  getTradeList() {
    this.tradeService.getTradeList({cid: this.defaultData.cid, list_type: 'list'}).subscribe(result => {
      if (result['status_code'] === 200) {
        this.tradeList = result['data'];
        if (this.tradeList.length >= 2) {
          this.tradeHierarchy[1]['disabled'] = true;
        } else {
          this.tradeHierarchy[1]['disabled'] = false;
        }
      } else if (result['status_code'] === 205) { //没有新建的标识
        this.tradeList = result['data'];
        this.tradeHierarchy[1]['disabled'] = false;
      }
    });
  }



  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    this.checkSuccess = true;
    if (this.defaultData.trade_class === 1) { //添加一级
      this.checkoutOneTradeContent(); //循环判断一级标识内容是否为空或者重复
      if (!this.defaultData['is_warning_content_one']) {
        const body = JSON.parse(JSON.stringify(this.defaultData));
        const biz_new = [];
        body.biz_list.forEach(biz => {
          biz_new.push({biz_unit_name: biz.biz_unit_name, biz_parent_unit_name: biz.biz_parent_unit_name});
        });
        body.biz_list = biz_new;
        this.tradeService.addTradeMark(body).subscribe(results => {
          this.checkSuccess = false;
          if (results['status_code'] === 200) {
            this.message.success('添加成功');
            this.modalSubject.destroy('onOk');
          } else {
            this.message.error(results.message);
          }
        });
      }
    } else {
      this.checkoutTwoTradeContent(); //循环判断二级标识内容是否为空或者重复
      if (!this.defaultData['is_warning_content_two']) {
        const body = JSON.parse(JSON.stringify(this.defaultData));
        const biz_child_new = [];
        body.biz_list_child.forEach(biz => {
          biz_child_new.push({biz_unit_name: biz.biz_unit_name, biz_parent_unit_name: biz.biz_parent_unit_name});
        });
        body.biz_list_child = biz_child_new;

        const biz_new = [];
        body.biz_list.forEach(biz => {
          biz_new.push({biz_unit_name: biz.biz_unit_name, biz_parent_unit_name: biz.biz_parent_unit_name});
        });
        body.biz_list = biz_new;
        this.tradeService.addTradeMark(body).subscribe(results => {
          this.checkSuccess = false;
          if (results['status_code'] === 200) {
            this.message.success('添加成功');
            this.modalSubject.destroy('onOk');
          } else {
            this.message.error(results.message);
          }
        });
      }
    }

  }
  next() {
    if (this.defaultData.trade_class === 1) { //一级
      if (this.tradeList.length === 4) {
        this.message.warning('行业标识个数已将达到最高4个，不能继续添加', {nzDuration: 5000});
      } else {
        if (!this.defaultData['is_warning_one']) {
          this.current += 1;
        }
      }
    } else {
      if (this.current === 1) { //准备进入设置二级标识名称
        this.checkoutOneTradeContent(); //循环判断一级标识内容是否为空或者重复
        if (!this.defaultData['is_warning_content_one']) {
          this.current += 1;
        }
      } else if (this.current === 0) {//准备进入设置一级标识名称
        this.current += 1;
      }
    }
  }
  prev() {
    this.current -= 1;
  }
}
