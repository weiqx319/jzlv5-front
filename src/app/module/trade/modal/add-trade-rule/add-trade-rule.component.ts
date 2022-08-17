import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {TradeService} from "../../service/trade.service";
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-add-trade-rule',
  templateUrl: './add-trade-rule.component.html',
  styleUrls: ['./add-trade-rule.component.scss']
})
export class AddTradeRuleComponent implements OnInit {

  @Input() parentInfo: any;
  @Input() data: any;
  @Input() source: any;
  public submitting = false;
  public word_type = [];


  public brackets_type = [
    {name: '[]', key: 1},
    {name: '【】', key: 2},
    {name: '()', key: 3},
    {name: '（）', key: 4},
    {name: '{}', key: 5},
  ];
  public opList = [
    {name: '包含', key: 100},
    {name: '不包含', key: 200},
    {name: '开头包含', key: 300},
    {name: '结尾包含', key: 400},
    {name: '开头不包含', key: 500},
    {name: '结尾不包含', key: 600},
    {name: '等于', key: 700},
  ];
  public publisher = [
    {name: '百度', key: 1},
    {name: '搜狗', key: 2},
    {name: '360', key: 3},
    {name: '神马', key: 4},
  ];
  public urlList = [
    // {name: '全部', key: 0},
    {name: '？', key: 1},
    {name: '#', key: 2},
    {name: '&', key: 3}
  ];
  public match_type = [
    {name: '全部URL', key: 1},
    {name: '部分URL', key: 2}
    ];

  public defaultData = {
    biz_unit_rule_type: 'txt_contain',
    biz_unit_column: 'biz_unit_column_01',

    txt_contain: { //文本包含
      caps_lock: false, //区分大小写
      match_object: 'campaign',
      rule_item: [
        {
          match_type: 100,
          text_content: null
        }
      ]
    },
    txt_partial: {
      match_object: 'campaign',
      match_symbol: [1], //括号类型
      text_content: null
    },
    url: { //文本包含
      match_type: 1,
      partial: 1,
      position: 'after', //before, after

      caps_lock: false, //区分大小写
      publisher_ids: [],
      text_content: null
    }
  };
  public summer_type = [
    {name: '账户名称', key: 'account'},
    {name: '计划名称', key: 'campaign'},
    {name: '单元名称', key: 'adgroup'},
    {name: '关键词名称', key: 'keyword'},
  ];

  public createOneDuplicationWarning = false;
  public advertiserList = [];
  private reg = /^ *$/; //匹配是否为空字符串
  public listFilter = [];

  public hasText = false;
  constructor(private fb: FormBuilder,
              private tradeService: TradeService,
              private message: NzMessageService,
              private modalService: NzModalService,
              private modalSubject: NzModalRef) {
    this.word_type = this.tradeService.getRuleTypeItems();
  }

  ngOnInit() {
    this.getTradeContentListFilter();
    if (this.data) { //编辑回显
      this.getRuleInfoById();
    }
  }
  columnChange(biz_unit_column) {
    this.getIsHasText(biz_unit_column);
  }

  getIsHasText(biz_unit_column) {
    const parm = {
      page: 1,
      count: 999999,
      cid: this.parentInfo.cid,
      biz_unit_column: biz_unit_column,
      biz_unit_type: this.parentInfo['biz_unit_type']
    };
    this.tradeService.getTradeContentDetaiList(parm).subscribe(
      (results: any) => {
        if (results.status_code === 200) {
          this.hasText = false;
          const rules = {};
          results['data']['detail'].forEach(item => {
            if (rules[item['biz_unit_rule_type']]) {
              rules[item['biz_unit_rule_type']]++;
            } else {
              rules[item['biz_unit_rule_type']] = 0;
              rules[item['biz_unit_rule_type']]++;
            }

          });

          //编辑回显示(非来源复制 且 为刚开始编辑的流量)
          if (this.data && !this.source && this.data['biz_unit_column'] === biz_unit_column) {
            if (rules['txt_contain'] && rules['txt_contain'] === 1) {//只有一个文本包含（可以切换任意类型）
              this.word_type[0]['disable'] = false;
              this.word_type[1]['disable'] = false;
            }
            if (rules['txt_partial'] && rules['txt_partial'] === 1) { //只有一个文本提取（可以切换任意类型）
              this.word_type[0]['disable'] = false;
              this.word_type[1]['disable'] = false;
            }
            if (rules['txt_contain'] && rules['txt_contain'] > 1) {//超过一个文本包含（不能选择文本提取）
              this.word_type[0]['disable'] = false;
              this.word_type[1]['disable'] = true;
            }
            if (rules['txt_partial'] && rules['txt_partial'] > 1) {//超过一个文本提取（不能选择文本包含）
              this.word_type[0]['disable'] = false;
              this.word_type[1]['disable'] = true;
            }
          } else {
            if (rules['txt_contain'] && !rules['txt_partial']) {//有文本包含
              this.word_type[0]['disable'] = false;
              this.word_type[1]['disable'] = true;
              this.defaultData.biz_unit_rule_type = 'txt_contain';
            }
            if (rules['txt_partial'] && !rules['txt_contain']) { //有文本提取
              this.word_type[0]['disable'] = true;
              this.word_type[1]['disable'] = false;
              this.defaultData.biz_unit_rule_type = 'txt_partial';
            }
          }
          if (!rules['txt_partial'] && !rules['txt_contain']) { //还未创建过文本包含 和 文字提取
            this.word_type[0]['disable'] = false;
            this.word_type[1]['disable'] = false;
          }


        } else {

        }

      },
      (err: any) => {
        this.message.error('数据获取异常，请重试');
      },
      () => {
      }
    );
  }

  getRuleInfoById() {

    this.tradeService.getRuleInfoById(this.data.id, {cid: this.parentInfo.cid}).subscribe(result => {
      if (result.status_code === 200) {
        if (result['data']['biz_unit_rule_type'] === 'txt_contain') { //文字包含
          this.defaultData.biz_unit_column = result['data'].biz_unit_column;
          this.defaultData.biz_unit_rule_type = result['data'].biz_unit_rule_type;
          this.defaultData.txt_contain.caps_lock = result['data'].biz_unit_rule.caps_lock === 0 ? false : true;
          this.defaultData.txt_contain.match_object = result['data'].biz_unit_rule.match_object;
          if (result['data'].biz_unit_rule.context_list.length) {
            this.defaultData.txt_contain.rule_item = [];
          }
          result['data'].biz_unit_rule.context_list.forEach(item => {
            this.defaultData.txt_contain.rule_item.push({
              match_type: item['match_type'],
              text_content: this.getStringByArray(item['txt_list'])
            });
          });

        } else if (result['data']['biz_unit_rule_type'] === 'txt_partial') { //文本提取
          this.defaultData.biz_unit_column = result['data'].biz_unit_column;
          this.defaultData.biz_unit_rule_type = result['data'].biz_unit_rule_type;
          this.defaultData[this.defaultData.biz_unit_rule_type].match_object = result['data']['biz_unit_rule']['match_object'];
          this.defaultData[this.defaultData.biz_unit_rule_type]['match_symbol'] = result['data']['biz_unit_rule']['context_object']['match_symbol'];
          this.defaultData[this.defaultData.biz_unit_rule_type]['match_symbol'] = result['data']['biz_unit_rule']['context_object']['match_symbol'];

          if (this.defaultData[this.defaultData.biz_unit_rule_type].match_object === 'campaign') {
            this.defaultData[this.defaultData.biz_unit_rule_type]['text_content'] = this.getStringByArray(result['data']['biz_unit_rule']['context_object']['conditions']['txt_list']);
          }

        } else if (result['data']['biz_unit_rule_type'] === 'url') { //URL
          this.defaultData.biz_unit_column = result['data'].biz_unit_column;
          this.defaultData.biz_unit_rule_type = result['data'].biz_unit_rule_type;
          this.defaultData[this.defaultData.biz_unit_rule_type]['match_type'] = result['data']['biz_unit_rule']['match_type'];
          this.defaultData[this.defaultData.biz_unit_rule_type]['publisher_ids'] = result['data']['biz_unit_rule']['publisher_ids'];
          this.defaultData[this.defaultData.biz_unit_rule_type]['caps_lock'] = result['data'].biz_unit_rule.caps_lock === 0 ? false : true;
          this.defaultData[this.defaultData.biz_unit_rule_type]['partial'] = result['data'].biz_unit_rule.partial;
          this.defaultData[this.defaultData.biz_unit_rule_type]['position'] = result['data'].biz_unit_rule.position ? result['data'].biz_unit_rule.position : 'after';
          this.defaultData[this.defaultData.biz_unit_rule_type]['text_content'] = this.getStringByArray(result['data']['biz_unit_rule']['txt_list']);

        }
        this.getIsHasText(this.defaultData.biz_unit_column);
      }
    });
  }
  symbolChange() {
    if (this.defaultData[this.defaultData.biz_unit_rule_type].match_symbol.length === 0) {
      this.defaultData[this.defaultData.biz_unit_rule_type].match_symbol = [1];
    }
  }
  getTradeContentListFilter() {
    this.tradeService.getTradeContentListFilter({
      cid: this.parentInfo['cid'],
      biz_unit_type: this.parentInfo['biz_unit_type'],
    }).subscribe(result => {
      if (result.status_code === 200) {
        this.listFilter = result.data;
        if (!this.data) { //添加时回显
          this.defaultData.biz_unit_column = result.data[0].key;
          this.getIsHasText(result.data[0].key);
        }
      }
    });
  }

  addItem(name) {
    let base: any;
    if (this.defaultData.biz_unit_rule_type === 'txt_contain') {
       base = {
         match_type: 100,
        text_content: null
      };
    } else if (this.defaultData.biz_unit_rule_type === 'url') {
      base = {publisher: [], url: [], text_content: null};
    }
    this.defaultData[this.defaultData.biz_unit_rule_type].rule_item.push(base);

  }
  removeItem(name, index) {
    this.defaultData[this.defaultData.biz_unit_rule_type].rule_item.splice(index, 1);
  }




  doCancel() {
    this.modalSubject.destroy('onCancel');
  }

  doSave() {
    const body = {};
    if (this.defaultData.biz_unit_rule_type === 'txt_contain') { //文本包含
      body['biz_unit_column'] = this.defaultData.biz_unit_column;
      body['biz_unit_rule_type'] = this.defaultData.biz_unit_rule_type;
      body['biz_unit_rule'] = {};
      body['biz_unit_rule']['match_object'] = this.defaultData[this.defaultData.biz_unit_rule_type].match_object;
      body['biz_unit_rule']['caps_lock'] = this.defaultData[this.defaultData.biz_unit_rule_type].caps_lock ? 1 : 0; //1：区分  0：不区分
      body['biz_unit_rule']['context_list'] = [];
      this.defaultData.txt_contain.rule_item.forEach(item => {
        body['biz_unit_rule']['context_list'].push({
          match_type: item.match_type,
          txt_list: this.getTextareaArray(item.text_content)
        });
      });
    }
    if (this.defaultData.biz_unit_rule_type === 'txt_partial') {
      body['biz_unit_column'] = this.defaultData.biz_unit_column;
      body['biz_unit_rule_type'] = this.defaultData.biz_unit_rule_type;
      body['biz_unit_rule'] = {};
      body['biz_unit_rule']['match_object'] = this.defaultData[this.defaultData.biz_unit_rule_type].match_object;

      body['biz_unit_rule']['context_object'] = {};
      body['biz_unit_rule']['context_object']['match_symbol'] = this.defaultData[this.defaultData.biz_unit_rule_type]['match_symbol'];

      if (body['biz_unit_rule']['match_object'] === 'campaign') {
        body['biz_unit_rule']['context_object']['conditions'] = {};
        body['biz_unit_rule']['context_object']['conditions']['match_object'] = 'adgroup';

        if (this.getTextareaArray(this.defaultData[this.defaultData.biz_unit_rule_type]['text_content']).length === 0) { //无
          body['biz_unit_rule']['context_object']['conditions']['search_type'] = 0; //search_type ---0, none: 无 1, =: 名字完整匹配 2, in: 包含这些名词
          body['biz_unit_rule']['context_object']['conditions']['txt_list'] = [];
        } else { //包含
          body['biz_unit_rule']['context_object']['conditions']['search_type'] = 2; //search_type ---0, none: 无 1, =: 名字完整匹配 2, in: 包含这些名词
          body['biz_unit_rule']['context_object']['conditions']['txt_list'] = this.getTextareaArray(this.defaultData[this.defaultData.biz_unit_rule_type]['text_content']);
        }
      }
    }

    if (this.defaultData.biz_unit_rule_type === 'url') {
      body['biz_unit_column'] = this.defaultData.biz_unit_column;
      body['biz_unit_rule_type'] = this.defaultData.biz_unit_rule_type;
      body['biz_unit_rule'] = {};

      body['biz_unit_rule']['match_type'] = this.defaultData[this.defaultData.biz_unit_rule_type]['match_type'];
      body['biz_unit_rule']['position'] = this.defaultData[this.defaultData.biz_unit_rule_type]['position'];
      body['biz_unit_rule']['publisher_ids'] = this.defaultData[this.defaultData.biz_unit_rule_type]['publisher_ids'];
      body['biz_unit_rule']['caps_lock'] = this.defaultData[this.defaultData.biz_unit_rule_type].caps_lock ? 1 : 0; //1：区分  0：不区分;

      if (this.defaultData[this.defaultData.biz_unit_rule_type].match_type === 1) { //匹配类型为全部
        body['biz_unit_rule']['partial'] = 1;
      } else if (this.defaultData[this.defaultData.biz_unit_rule_type].match_type === 2) { //匹配类型为部分
        body['biz_unit_rule']['partial'] = this.defaultData[this.defaultData.biz_unit_rule_type]['partial'];
      }
      body['biz_unit_rule']['txt_list'] = this.getTextareaArray(this.defaultData[this.defaultData.biz_unit_rule_type]['text_content']);

    }

    if (this.data && !this.source) { //编辑
      body['id'] = this.data['id'];
      this.tradeService.updateTradeRule(body, {cid: this.parentInfo['cid']}).subscribe(result => {
        if (result.status_code === 200) {
          this.message.success('操作成功');
          this.modalSubject.destroy('onOk');
        } else {
          this.message.warning(result.message, {nzDuration: 5000});
        }
      });
    } else if (!this.data || (this.data && this.source)) { //添加或者copy
      this.tradeService.addTradeRule(body, {cid: this.parentInfo['cid']}).subscribe(result => {
        if (result.status_code === 200) {
          this.message.success('操作成功');
          this.modalSubject.destroy('onOk');
        } else {
          this.message.warning(result.message, {nzDuration: 5000});
        }
      });
    }



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
  //将数组转化为以 \n 分隔的字符串
  getStringByArray(dataArray) {
    let dataString = "";
    if (dataArray && dataArray.length > 0) {
      dataString = dataArray.join('\n');
    }
    return dataString;
  }

}
